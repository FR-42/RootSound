using System.Text;
using RootSound.PhraseStudio.Audio;
using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Editing;
using RootSound.PhraseStudio.Persistence;
using RootSound.PhraseStudio.UI;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;

namespace RootSound.PhraseStudio.Tests;

internal static class WorkflowChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory); int passed = 0;
        void Require(bool value, string message) { if (!value) throw new InvalidOperationException(message); }
        void Check(string name, Action action) { action(); passed++; Console.WriteLine("PASS workflow: " + name); }
        const int rate = 8000;
        var samples = new float[rate];
        for (int i = 0; i < samples.Length; i++) samples[i] = (float)(.24 * Math.Sin(2 * Math.PI * 220 * i / rate));
        var patch = new InstrumentPatch(new PcmClip(rate, 1, samples, "打磨后的声音"),
            new InstrumentSettings(57, .004, .1, .8, .15, true, 800, 6400, 0, -2), "打磨后的声音");
        PhraseDocument? loaded = null;

        Check("third-module instruments retain their performance in the phrase file", () =>
        {
            string timbre = Path.Combine(directory, "我的音色.rstimbre");
            TimbreArchive.ExportAsync(patch, timbre).GetAwaiter().GetResult();
            var imported = TimbreArchive.ImportAsync(timbre).GetAwaiter().GetResult();
            var doc = PhraseFactory.New("我的乐句", 110, 2);
            var channel = PhraseFactory.Channel(doc.Channels, "我的音色", EditorMode.PianoRoll) with
            {
                Timbre = imported, StepPitch = 57,
                Notes = [new PhraseNote(Guid.NewGuid(), 57, 0, 960, .8), new PhraseNote(Guid.NewGuid(), 64, 1920, 1440, .6)]
            };
            doc = doc with { Channels = [channel] };
            string phrase = Path.Combine(directory, "我的乐句.rsphrase");
            PhraseArchive.SaveAsync(doc, phrase).GetAwaiter().GetResult();
            File.Delete(timbre); // Generated fixture only: prove that the phrase has no dependency on this path.
            loaded = PhraseArchive.LoadAsync(phrase).GetAwaiter().GetResult();
            Require(loaded.Channels[0].Timbre!.Settings == patch.Settings && loaded.Channels[0].Timbre!.Audio.Samples.SequenceEqual(samples), "embedded instrument changed");
            Require(loaded.Channels[0].Notes.SequenceEqual(channel.Notes) && loaded.Tempo == 110, "phrase notes or timing changed");
            var mix = new PhraseMixSource(rate) { Loop = false }; mix.SetDocument(loaded, crossfade: false);
            float[] sound = new float[rate * 2]; mix.ReadFrames(0, sound);
            Require(sound.All(float.IsFinite) && sound.Max(x => Math.Abs(x)) > .1, "reopened phrase cannot render its imported instrument");
        });
        Check("mode changes and local recovery preserve the same detailed notes", () =>
        {
            var history = new DocumentHistory(loaded!);
            var before = history.Current.Channels[0];
            history.Apply(history.Current with { Channels = [before with { Mode = EditorMode.StepSequencer }] });
            var steps = NoteEditMath.ToggleStep(history.Current.Channels[0].Notes, 57, 8, Timing.DurationTicks(history.Current));
            history.Apply(history.Current with { Channels = [history.Current.Channels[0] with { Notes = steps }] });
            history.Apply(history.Current with { Channels = [history.Current.Channels[0] with { Mode = EditorMode.PianoRoll }] });
            Require(history.Current.Channels[0].Notes.Any(n => n.Pitch == 64 && n.LengthTick == 1440), "step editing erased an unrelated piano note");
            var store = new DraftStore(Path.Combine(directory, "draft"));
            store.SaveAsync(history.Current, "C:\\chosen\\我的乐句.rsphrase", new string('A', 64), CancellationToken.None).GetAwaiter().GetResult();
            var recovery = store.LoadStateAsync().GetAwaiter().GetResult()!;
            Require(recovery.Document.Channels[0].Notes.SequenceEqual(steps) && recovery.SavedPath == "C:\\chosen\\我的乐句.rsphrase", "recovery lost edits or save target");
        });
        Check("private registry is exact, cancellable and leaves unrelated files untouched", () =>
        {
            string root = Path.Combine(directory, "registry"); var registry = new WorkspaceRegistry(root);
            Require(registry.ReadIndex().Count == 0 && !Directory.Exists(root), "reading a missing index wrote to disk");
            Guid id = Guid.NewGuid(); registry.WriteIndex([id]);
            string other = Path.Combine(root, "user-file.txt"); File.WriteAllText(other, "keep", Encoding.UTF8);
            using var cancelled = new CancellationTokenSource(); cancelled.Cancel();
            try { registry.WriteIndex([Guid.NewGuid()], cancelled.Token); throw new Exception("cancellation ignored"); } catch (OperationCanceledException) { }
            Require(registry.ReadIndex().SequenceEqual([id]) && File.ReadAllText(other, Encoding.UTF8) == "keep", "registry changed unrelated content or lost old index");
        });
        Check("corrupt workspace indexes are refused without deleting drafts or files", () =>
        {
            string root = Path.Combine(directory, "bad-registry"); Directory.CreateDirectory(root);
            var registry = new WorkspaceRegistry(root); File.WriteAllText(registry.IndexPath, "{bad-json");
            try { registry.ReadIndex(); throw new Exception("bad index accepted"); } catch (InvalidDataException) { }
            Require(File.ReadAllText(registry.IndexPath) == "{bad-json", "bad index was changed or deleted");
        });
        Check("initial workbench remains empty and does no file IO before it is shown", () =>
        {
            string root = Path.Combine(directory, "unshown-workspace");
            using var form = new MainForm(root); form.PerformLayout();
            Require(!form.IsHandleCreated && !form.Visible && !Directory.Exists(root), "constructor showed a window or touched workspace storage");
            void Inspect(Control control)
            {
                Require(!control.IsHandleCreated, "unshown child control created its own window");
                if (control is TabControl tabs) Require(tabs.TabPages.Count == 0, "initial workbench was not empty");
                foreach (Control child in control.Controls) Inspect(child);
            }
            Inspect(form);
        });
        Check("pane save availability and recovery dirtiness match actual file state", () =>
        {
            var originalContext = SynchronizationContext.Current;
            PhrasePane? incomplete = null, complete = null, restored = null;
            try
            {
                var empty = PhraseFactory.New("未完成"); empty = empty with { Channels = [PhraseFactory.Channel(empty.Channels)] };
                incomplete = new PhrasePane(empty, new DraftStore(Path.Combine(directory, "ui-empty")), _ => { });
                complete = new PhrasePane(loaded!, new DraftStore(Path.Combine(directory, "ui-loaded")), _ => { }, "C:\\chosen\\existing.rsphrase", new string('A', 64));
                restored = new PhrasePane(loaded!, new DraftStore(Path.Combine(directory, "ui-recovered")), _ => { }, "C:\\chosen\\existing.rsphrase", new string('A', 64), true);
                Require(!incomplete.CanSave && incomplete.IsDirty && complete.CanSave && !complete.IsDirty && restored.IsDirty,
                    "save/dirty state was incorrect");
                Require(!incomplete.IsHandleCreated && !complete.IsHandleCreated && !restored.IsHandleCreated, "pane constructor created a window");
            }
            finally
            {
                // No message loop is running. Dispose only unshown controls without scheduling UI work.
                SynchronizationContext.SetSynchronizationContext(null);
                incomplete?.DisposeAsync().AsTask().GetAwaiter().GetResult();
                complete?.DisposeAsync().AsTask().GetAwaiter().GetResult();
                restored?.DisposeAsync().AsTask().GetAwaiter().GetResult();
                SynchronizationContext.SetSynchronizationContext(originalContext);
            }
        });
        return passed;
    }
}
