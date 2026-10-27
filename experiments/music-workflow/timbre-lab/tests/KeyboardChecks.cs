using System.Reflection;
using RootSound.SampleEditor.Playback;
using RootSound.TimbreLab.Audio;
using RootSound.TimbreLab.Controls;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;

namespace RootSound.TimbreLab.Tests;

internal static class KeyboardChecks
{
    internal static int Run(string directory)
    {
        // No UI message loop is running in these unshown checks. The real app keeps
        // its normal Forms context; fake-voice tests must not await that idle loop.
        var previousContext = SynchronizationContext.Current;
        bool previousAutoInstall = WindowsFormsSynchronizationContext.AutoInstall;
        WindowsFormsSynchronizationContext.AutoInstall = false;
        SynchronizationContext.SetSynchronizationContext(null);
        try { return RunCore(directory); }
        finally
        {
            SynchronizationContext.SetSynchronizationContext(previousContext);
            WindowsFormsSynchronizationContext.AutoInstall = previousAutoInstall;
        }
    }

    private static int RunCore(string directory)
    {
        Directory.CreateDirectory(directory);
        int count = 0;
        void Check(string name, Action action) { action(); count++; Console.WriteLine("PASS keyboard: " + name); }
        Check("reference piano has standard pitch, bounded sound, a struck decay and silent boundaries", () =>
        {
            Near(PianoReference.Frequency(21), 27.5, .00001);
            Near(PianoReference.Frequency(69), 440, .00001);
            Near(PianoReference.Frequency(108), 4186.0090448, .0001);
            foreach (int note in new[] { 21, 60, 69, 108 })
            {
                var sound = PianoReference.Render(note, 1.2);
                double expected = 440 * Math.Pow(2, (note - 69) / 12d);
                double exact = Power(sound, expected);
                Require(exact > Power(sound, expected * Math.Pow(2, 1d / 12)) * 4 && exact > Power(sound, expected / Math.Pow(2, 1d / 12)) * 4, "fundamental pitch does not match the selected key");
                Require(sound.Samples.All(s => float.IsFinite(s) && Math.Abs(s) <= .73) && sound.Samples[0] == 0 && sound.Samples[^1] == 0, "finite bounded output and anti-click boundaries");
            }
            var piano = PianoReference.Render(69, 1.5);
            Require(Rms(piano, .04, .15) > Rms(piano, 1.1, 1.3) * 1.2, "struck piano sound must decay while held");
            PcmWaveExporter.ExportAsync(piano, Path.Combine(directory, "钢琴参考-A4.wav")).GetAwaiter().GetResult();
        });
        Check("all 88 reference notes render and invalid or cancelled requests fail", () =>
        {
            for (int note = 21; note <= 108; note++)
            {
                var sound = PianoReference.Render(note, .1);
                Require(sound.Samples.Any(s => Math.Abs(s) > .001f) && sound.Samples.All(float.IsFinite), "88-key reference must not contain silent or invalid notes");
            }
            Expect<ArgumentOutOfRangeException>(() => PianoReference.Render(20, 1));
            Expect<ArgumentOutOfRangeException>(() => PianoReference.Render(109, 1));
            Expect<ArgumentOutOfRangeException>(() => PianoReference.Render(60, double.NaN));
            using CancellationTokenSource cancel = new(); cancel.Cancel();
            Expect<OperationCanceledException>(() => PianoReference.Render(60, 1, cancel.Token));
        });
        Check("keyboard contains every labeled note from A0 through C8 with separate black-key hit areas", () =>
        {
            using var keyboard = new ReferenceKeyboard { Size = new Size(700, 78) };
            Require(keyboard.KeysByNote.Keys.Order().SequenceEqual(Enumerable.Range(21, 88)), "complete continuous range");
            Require(keyboard.KeysByNote[21].Text == "A0" && keyboard.KeysByNote[108].Text == "C8", "clear endpoints");
            Require(keyboard.KeysByNote[61].Height < keyboard.KeysByNote[60].Height && keyboard.KeysByNote[61].Left < keyboard.KeysByNote[62].Left, "piano black-key geometry");
            Require(keyboard.Controls.GetChildIndex(keyboard.KeysByNote[61]) < keyboard.Controls.GetChildIndex(keyboard.KeysByNote[60]), "black keys must be clickable above white keys");
            int pressed = -1; keyboard.NotePressed += note => pressed = note;
            typeof(Control).GetMethod("OnClick", BindingFlags.Instance | BindingFlags.NonPublic)!.Invoke(keyboard.KeysByNote[108], [EventArgs.Empty]);
            Require(pressed == 108 && !keyboard.IsHandleCreated, "highest key event without a displayed window");
            int centered = keyboard.CenterOffset(60);
            Require(keyboard.OctaveTarget(1, centered) == 72 && keyboard.OctaveTarget(-1, centered) == 48, "octave navigation follows viewport center");
            Require(keyboard.CenterOffset(21) == 0, "lowest key reachable");
            Require(keyboard.KeysByNote[108].Right - keyboard.CenterOffset(108) <= keyboard.ClientSize.Width, "highest key reachable");
        });
        Check("piano works with no imported sample and mode switching stops its owned voice", () =>
        {
            List<Voice> voices = [];
            var session = new AuditionSession((clip, note) => { var voice = new Voice(clip, note); voices.Add(voice); return voice; });
            using var form = new MainForm(session);
            try
            {
                Require(Field<RadioButton>(form, "_pianoMode").Checked && Field<ReferenceKeyboard>(form, "_keys").Enabled, "piano ready before import");
                form.AuditionKeyAsync(69).GetAwaiter().GetResult();
                Require(voices.Count == 1 && voices[0].Clip.Name.StartsWith("钢琴参考") && voices[0].Snapshot.IsPlaying, "independent reference voice");
                Field<RadioButton>(form, "_sampleMode").Checked = true;
                Require(voices[0].Disposed && session.Current is null && !Field<ReferenceKeyboard>(form, "_keys").Enabled, "switch stops piano and gates missing sample");
                form.AuditionKeyAsync(60).GetAwaiter().GetResult();
                Require(voices.Count == 1, "missing sample never creates a piano substitute");
            }
            finally { session.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Check("sample mode uses the blue-line patch; piano mode never changes the saved patch", () =>
        {
            List<Voice> voices = [];
            var session = new AuditionSession((clip, note) => { var voice = new Voice(clip, note); voices.Add(voice); return voice; });
            using var form = new MainForm(session);
            try
            {
                const int rate = 8000;
                var clip = new PcmClip(rate, 1, Enumerable.Range(0, rate).Select(i => (float)(.3 * Math.Sin(2 * Math.PI * 261.625565 * i / rate))).ToArray(), "采样");
                var workspace = Field<SampleWorkspace>(form, "_workspace"); workspace.Add(new(clip, null)); Invoke(form, "ResetTrim");
                workspace.TryApply(workspace.Revision, new(clip, 60, 1, []));
                var graph = Field<SampleGraph>(form, "_graph"); graph.SetAudio(clip, clip); graph.SetSelection(1000, 6000); Invoke(form, "SyncSelection");
                var before = (InstrumentPatch)Invoke(form, "GetPatch")!;
                Field<RadioButton>(form, "_sampleMode").Checked = true;
                form.AuditionKeyAsync(60).GetAwaiter().GetResult();
                var expected = InstrumentRenderer.Render(before, 60, 1);
                Require(voices.Last().Clip.Samples.SequenceEqual(expected.Samples), "sample mode must render exact selected patch");
                Field<RadioButton>(form, "_pianoMode").Checked = true;
                form.AuditionKeyAsync(60).GetAwaiter().GetResult();
                Require(voices.Last().Clip.Samples.SequenceEqual(PianoReference.Render(60, 1).Samples), "piano independent of sample controls");
                var after = (InstrumentPatch)Invoke(form, "GetPatch")!;
                Require(after.Audio.Samples.SequenceEqual(before.Audio.Samples) && after.Settings == before.Settings, "reference playback must never change saved instrument");
                Require(!form.IsHandleCreated, "mode checks must not display the app");
            }
            finally { session.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Check("a mode change cancels a pending key render before it can start the old mode", () =>
        {
            List<Voice> voices = [];
            var session = new AuditionSession((clip, note) => { var voice = new Voice(clip, note); voices.Add(voice); return voice; });
            using var form = new MainForm(session);
            try
            {
                Task pending = form.AuditionKeyAsync(21);
                Field<RadioButton>(form, "_sampleMode").Checked = true;
                pending.GetAwaiter().GetResult();
                Require(session.Current is null && voices.All(v => v.Disposed), "old reference cannot resurrect after mode change");
            }
            finally { session.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        return count;
    }

    private static double Power(PcmClip sound, double frequency)
    {
        double sine = 0, cosine = 0;
        for (int frame = sound.SampleRate / 10; frame < sound.SampleRate; frame++)
        { double angle = 2 * Math.PI * frequency * frame / sound.SampleRate; sine += sound.Samples[frame] * Math.Sin(angle); cosine += sound.Samples[frame] * Math.Cos(angle); }
        return sine * sine + cosine * cosine;
    }
    private static double Rms(PcmClip sound, double start, double end)
    {
        int a = (int)(start * sound.SampleRate), b = (int)(end * sound.SampleRate); double sum = 0;
        for (int i = a; i < b; i++) sum += sound.Samples[i] * sound.Samples[i];
        return Math.Sqrt(sum / (b - a));
    }
    private static T Field<T>(object target, string name) => (T)target.GetType().GetField(name, BindingFlags.Instance | BindingFlags.NonPublic)!.GetValue(target)!;
    private static object? Invoke(object target, string name) => target.GetType().GetMethod(name, BindingFlags.Instance | BindingFlags.NonPublic)!.Invoke(target, null);
    private static void Near(double value, double expected, double tolerance) => Require(Math.Abs(value - expected) < tolerance, "standard pitch");
    private static void Require(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
    private static void Expect<T>(Action action) where T : Exception
    { try { action(); } catch (T) { return; } throw new InvalidOperationException("Expected " + typeof(T).Name); }
    private sealed class Voice(PcmClip clip, bool note) : IAuditionVoice
    {
        internal PcmClip Clip => clip;
        internal bool Disposed;
        public PlaybackSnapshot Snapshot { get; private set; } = new(0, false, 1, null);
        public bool IsNote => note;
        public void Play() => Snapshot = Snapshot with { IsPlaying = true };
        public void Pause() => Snapshot = Snapshot with { IsPlaying = false };
        public long Seek(double frame) { Snapshot = Snapshot with { PositionFrames = frame, SeekRevision = Snapshot.SeekRevision + 1 }; return Snapshot.SeekRevision; }
        public ValueTask DisposeAsync() { Disposed = true; Pause(); return ValueTask.CompletedTask; }
    }
}
