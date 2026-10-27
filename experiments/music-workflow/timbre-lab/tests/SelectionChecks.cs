using System.Drawing;
using System.Drawing.Imaging;
using System.Reflection;
using RootSound.SampleEditor.Core;
using RootSound.SampleEditor.Playback;
using RootSound.TimbreLab.Audio;
using RootSound.TimbreLab.Controls;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;

namespace RootSound.TimbreLab.Tests;

internal static class SelectionChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory);
        int count = 0;
        void Check(string name, Action action) { action(); count++; Console.WriteLine("PASS selection: " + name); }
        const int rate = 8000;
        PcmClip original = new(rate, 2, Enumerable.Range(0, 16000).Select(i => i / 20000f - .4f).ToArray(), "立体声采样");
        var patch = new InstrumentPatch(original, new(LoopEnabled: true, LoopStart: 2000, LoopEnd: 6000, LoopCrossfadeSeconds: .1), "选区音色");
        Check("saving the blue-line selection removes all outside frames from both file formats", () =>
        {
            var cropped = InstrumentSelection.Crop(patch, 1000, 7000);
            Require(cropped.Audio.FrameCount == 6000 && cropped.Audio.Channels == 2 && cropped.Audio.SampleRate == rate, "selected frame/channel identity");
            var expected = original.Samples.AsSpan(2000, 12000).ToArray();
            Require(cropped.Audio.Samples.SequenceEqual(expected), "exact interleaved PCM selection");
            string archive = Path.Combine(directory, "蓝线选区.rstimbre"), wav = Path.Combine(directory, "蓝线选区.wav");
            TimbreArchive.ExportAsync(cropped, archive).GetAwaiter().GetResult();
            var reopened = TimbreArchive.ImportAsync(archive).GetAwaiter().GetResult();
            PcmWaveExporter.ExportAsync(cropped.Audio, wav).GetAwaiter().GetResult();
            var imported = Task.Run(() => ImportBridge.ImportAsync(wav)).GetAwaiter().GetResult();
            Require(reopened.Audio.Samples.SequenceEqual(expected) && reopened.Audio.FrameCount == 6000, "archive contains only selection");
            Require(imported.FrameCount == 6000 && imported.Samples.Zip(expected).All(x => Math.Abs(x.First - x.Second) < .000001), "WAV contains only selection");
            Require(original.FrameCount == 8000 && original.Samples[0] == -.4f, "original is intact");
        });
        Check("crop rebases and intersects sustain coordinates without changing the original settings", () =>
        {
            var selected = InstrumentSelection.Crop(patch, 3000, 5000);
            Require(selected.Settings.LoopStart == 0 && selected.Settings.LoopEnd == 2000 && selected.Settings.LoopEnabled, "intersection rebased");
            Require(selected.Settings.LoopCrossfadeSeconds <= .125, "crossfade still fits");
            selected = InstrumentSelection.Crop(patch, 6500, 7500);
            Require(!selected.Settings.LoopEnabled && selected.Settings.LoopStart == 0 && selected.Settings.LoopEnd == 0, "outside loop safely disabled");
            Require(patch.Settings.LoopStart == 2000 && patch.Settings.LoopEnd == 6000, "original settings intact");
        });
        Check("one-frame stereo selections stay valid and empty or reversed selections fail", () =>
        {
            var tiny = InstrumentSelection.Crop(patch, 4200, 4201);
            Require(tiny.Audio.FrameCount == 1 && tiny.Audio.Samples.SequenceEqual(original.Samples.AsSpan(8400, 2).ToArray()) && !tiny.Settings.LoopEnabled, "complete one-frame selection");
            Expect<ArgumentException>(() => InstrumentSelection.Crop(patch, 4000, 4000));
            Expect<ArgumentException>(() => InstrumentSelection.Crop(patch, 4001, 4000));
        });
        Check("three markers render at their audio times while selection remains distinct from the playhead", () =>
        {
            using var graph = Graph(original);
            graph.SetSelection(1600, 6400); graph.PlayheadSeconds = .5;
            using var bitmap = new Bitmap(graph.Width, graph.Height);
            using (var graphics = Graphics.FromImage(bitmap)) graph.DrawGraph(graphics);
            int y = graph.PlotBounds.Top + 15;
            Require(Blue(bitmap.GetPixel((int)graph.X(1600), y)) && Blue(bitmap.GetPixel((int)graph.X(6400), y)), "two blue selection lines");
            var red = bitmap.GetPixel((int)graph.X(4000), y);
            Require(red.R > 200 && red.G < 150, "red playback line");
            Require(!graph.IsHandleCreated, "rendering must not open a native window");
            bitmap.Save(Path.Combine(directory, "三条线.png"), ImageFormat.Png);
        });
        Check("zoom, pan, fit and replacement processing keep absolute selection and playhead positions", () =>
        {
            using var graph = Graph(original);
            graph.SetSelection(2000, 5000); graph.PlayheadSeconds = .4;
            graph.Zoom(4); graph.Pan(.5);
            Require(graph.Timeline.ViewLength == 2000 && graph.Timeline.SelectionStart == 2000 && graph.Timeline.SelectionEnd == 5000 && graph.Timeline.Playhead == 3200, "view does not alter markers");
            graph.SetAudio(original, new PcmClip(rate, 2, original.Samples.Select(v => v * .5f).ToArray(), "处理后"));
            Require(graph.Timeline.ViewLength == 2000 && graph.Timeline.SelectionEnd == 5000, "cleanup does not reset zoom or selection");
            graph.Fit(); Require(graph.Timeline.ViewStart == 0 && graph.Timeline.ViewLength == 8000 && graph.Timeline.Playhead == 3200, "fit retains time");
        });
        Check("overlapping red and blue handles can be selected independently", () =>
        {
            using var graph = Graph(original);
            int x = (int)graph.X(0);
            Require(graph.HitMarker(new Point(x, graph.PlotBounds.Top - 8)) == TimelineMarker.Playhead, "top handle chooses red");
            Require(graph.HitMarker(new Point(x, graph.PlotBounds.Bottom + 7)) == TimelineMarker.SelectionStart, "bottom handle chooses blue");
        });
        Check("dragging a blue line changes only the selection and Shift enables fine frame adjustments", () =>
        {
            using var graph = Graph(original); graph.SetSelection(2000, 6000); graph.PlayheadSeconds = .5;
            graph.Zoom(4, .25);
            int blueX = (int)graph.X(2000), changes = 0, seeks = 0;
            graph.SelectionChanged += () => changes++; graph.SeekRequested += () => seeks++;
            graph.BeginGesture(new Point(blueX, graph.PlotBounds.Bottom + 7));
            graph.MoveGesture(blueX + 100, true); graph.EndGesture();
            Require(graph.Timeline.SelectionStart > 2000 && graph.Timeline.SelectionStart < 2100 && graph.Timeline.Playhead == 4000, "precise blue movement");
            Require(changes == 1 && seeks == 0, "selection movement does not seek playback");
        });
        Check("new primary samples reset markers while clearing removes the drawing", () =>
        {
            using var graph = Graph(original); graph.SetSelection(100, 200); graph.Zoom(4);
            graph.SetAudio(new(rate, 1, new float[4000], "新主采样"), null);
            Require(graph.Timeline.SelectionStart == 0 && graph.Timeline.SelectionEnd == 4000 && graph.Timeline.Playhead == 0 && graph.Timeline.ViewLength == 4000, "new primary starts at full range");
            graph.SetAudio(null, null);
            using var image = new Bitmap(graph.Width, graph.Height);
            using var graphics = Graphics.FromImage(image); graph.DrawGraph(graphics);
            Require(!graph.IsHandleCreated, "clear remains offscreen");
        });
        Check("sample audition toggles pause/resume at the red line and ignores late seek snapshots", () =>
        {
            var voices = new List<FakeVoice>();
            var session = new AuditionSession((clip, note) => { var voice = new FakeVoice(clip, note); voices.Add(voice); return voice; });
            using var form = new MainForm(session);
            try
            {
                Load(form, original);
                var graph = Field<SampleGraph>(form, "_graph"); graph.PlayheadSeconds = .25;
                form.ToggleSampleAsync().GetAwaiter().GetResult();
                var voice = voices.Single();
                Require(voice.Snapshot.IsPlaying && voice.Snapshot.PositionFrames == 2000, "starts at red position");
                voice.Advance(3000); form.RefreshPlayback();
                form.ToggleSampleAsync().GetAwaiter().GetResult(); form.RefreshPlayback();
                Require(!voice.Snapshot.IsPlaying && graph.Timeline.Playhead == 3000, "pause freezes heard position");
                form.ToggleSampleAsync().GetAwaiter().GetResult();
                Require(voices.Count == 1 && voice.Snapshot.PositionFrames == 3000 && voice.Snapshot.IsPlaying, "resume keeps the same source and position");
                voice.DelaySeek = true;
                int x = (int)graph.X(3000);
                graph.BeginGesture(new Point(x, graph.PlotBounds.Top - 8)); graph.MoveGesture(x + 100, false); graph.EndGesture();
                double moved = graph.Timeline.Playhead;
                form.RefreshPlayback();
                Require(moved > 3000 && graph.Timeline.Playhead == moved, "old device snapshot cannot rewind dragged red line");
                voice.Acknowledge(); form.RefreshPlayback();
                Require(graph.Timeline.Playhead == moved && voice.Snapshot.IsPlaying, "seek acknowledgement resumes in sync");
                voice.DelaySeek = false;
                graph.BeginGesture(new Point((int)graph.X(moved), graph.PlotBounds.Top - 8));
                graph.MoveGesture(graph.PlotBounds.Right + 100, false); graph.EndGesture(); form.RefreshPlayback();
                Require(graph.Timeline.Playhead == original.FrameCount && !voice.Snapshot.IsPlaying, "dragging to the end does not restart playback");
                graph.SetSelection(2100, 4300); Invoke(form, "SyncSelection");
                var saved = (InstrumentPatch)Invoke(form, "GetPatch")!;
                Require(saved.Audio.FrameCount == 2200 && saved.Audio.Samples.SequenceEqual(original.Samples.AsSpan(4200, 4400).ToArray()), "actual save path follows blue markers");
                Require(!form.IsHandleCreated, "transport test must not show a window");
            }
            finally { session.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Check("pending initial seeks cannot rewind the red line; original comparison does not change saved selection", () =>
        {
            var voices = new List<FakeVoice>();
            var session = new AuditionSession((clip, note) => { var voice = new FakeVoice(clip, note) { DelaySeek = true }; voices.Add(voice); return voice; });
            using var form = new MainForm(session);
            try
            {
                Load(form, original);
                var workspace = Field<SampleWorkspace>(form, "_workspace");
                var processed = new PcmClip(rate, 2, original.Samples.Select(s => s * .5f).ToArray(), "处理后");
                workspace.TryApply(workspace.Revision, new(processed, 60, 1, []));
                var graph = Field<SampleGraph>(form, "_graph"); graph.SetAudio(original, processed);
                graph.PlayheadSeconds = .25; graph.SetSelection(1000, 5000); Invoke(form, "SyncSelection");
                form.ToggleSampleAsync().GetAwaiter().GetResult(); form.RefreshPlayback();
                Require(graph.Timeline.Playhead == 2000 && voices[0].Snapshot.PositionFrames == 0, "initial seek waits for device acknowledgement");
                voices[0].Acknowledge(); form.RefreshPlayback();
                Field<CheckBox>(form, "_compare").Checked = true;
                Require(voices.Count == 2 && voices[1].Clip == original, "comparison auditions original audio");
                var selected = (InstrumentPatch)Invoke(form, "GetPatch")!;
                Require(selected.Audio.Samples.SequenceEqual(processed.Samples.AsSpan(2000, 8000).ToArray()), "save remains processed blue-line audio");
            }
            finally { session.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        return count;
    }
    private static SampleGraph Graph(PcmClip original)
    { var graph = new SampleGraph { Size = new Size(1000, 300) }; graph.SetAudio(original, original); return graph; }
    private static bool Blue(Color color) => color.B > 200 && color.R < 140;
    private static T Field<T>(object target, string name) => (T)target.GetType().GetField(name, BindingFlags.Instance | BindingFlags.NonPublic)!.GetValue(target)!;
    private static object? Invoke(object target, string name) => target.GetType().GetMethod(name, BindingFlags.Instance | BindingFlags.NonPublic)!.Invoke(target, null);
    private static void Load(MainForm form, PcmClip clip)
    {
        var workspace = Field<SampleWorkspace>(form, "_workspace"); workspace.Add(new(clip, null));
        Invoke(form, "ResetTrim"); workspace.TryApply(workspace.Revision, new(clip, 60, 1, []));
        Field<SampleGraph>(form, "_graph").SetAudio(clip, clip); Invoke(form, "SyncSelection");
    }
    private sealed class FakeVoice(PcmClip clip, bool note) : IAuditionVoice
    {
        public PcmClip Clip => clip;
        public PlaybackSnapshot Snapshot { get; private set; } = new(0, false, 1, null);
        public bool IsNote => note;
        public bool DelaySeek;
        private long revision;
        private double requested;
        public void Play() => Snapshot = Snapshot with { IsPlaying = true };
        public void Pause() => Snapshot = Snapshot with { IsPlaying = false };
        public void Advance(double frame) => Snapshot = Snapshot with { PositionFrames = frame };
        public long Seek(double frame)
        { requested = Math.Clamp(frame, 0, clip.FrameCount); revision++; if (!DelaySeek) Acknowledge(); return revision; }
        public void Acknowledge() => Snapshot = Snapshot with { PositionFrames = requested, SeekRevision = revision };
        public ValueTask DisposeAsync() { Pause(); return ValueTask.CompletedTask; }
    }
    private static void Require(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
    private static void Expect<T>(Action action) where T : Exception
    { try { action(); } catch (T) { return; } throw new InvalidOperationException("Expected " + typeof(T).Name); }
}
