using System.Buffers.Binary;
using System.Diagnostics;
using System.IO.Compression;
using System.Reflection;
using System.Text.Json;
using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Persistence;
using RootSound.SampleEditor.Playback;
using RootSound.SongStudio.Audio;
using RootSound.SongStudio.Controls;
using RootSound.SongStudio.Core;
using RootSound.SongStudio.Persistence;
using RootSound.TimbreLab.Core;

namespace RootSound.SongStudio.Tests;
internal static class Program
{
    private static int passed;
    private static string root = "";
    [STAThread]
    private static int Main(string[] args)
    {
        try
        {
            root = Path.GetFullPath(args.Single()); Directory.CreateDirectory(root);
            Core(); Files(); Audio(); Task.Run(Transport).GetAwaiter().GetResult(); Ui();
            File.WriteAllText(Path.Combine(root, "results.json"), JsonSerializer.Serialize(new { passed, realAudioDevicesOpened = false, screenCaptured = false, desktopControlled = false }));
            Console.WriteLine($"PASS {passed} groups; realAudioDevicesOpened=false; screenCaptured=false; desktopControlled=false"); return 0;
        }
        catch (Exception ex) { Console.Error.WriteLine(ex); return 1; }
    }
    private static void Check(string name, Action action)
    { action(); passed++; Console.WriteLine("PASS " + name); }
    private static void Assert(bool value, string message) { if (!value) throw new Exception(message); }
    private static void Reject(Action action)
    { try { action(); } catch (Exception ex) when (ex is InvalidDataException or InvalidOperationException or IOException or OperationCanceledException or JsonException) { return; } throw new Exception("Invalid operation accepted"); }
    private static SongDocument Song(double phraseTempo = 120)
    {
        float[] samples = Enumerable.Range(0, 8000).Select(i => (float)(.2 * Math.Sin(2 * Math.PI * 220 * i / 8000))).ToArray();
        var patch = new InstrumentPatch(new(8000, 1, samples, "声音"), new(57, .005, .02, 1, .2, true, 200, 7800, .005, 0), "音色");
        var phrase = new PhraseDocument(Guid.NewGuid(), "乐句", phraseTempo, 1,
            [new(Guid.NewGuid(), "琴", patch, EditorMode.PianoRoll, 57, 0, false,
                [new(Guid.NewGuid(), 57, 0, 960, 1), new(Guid.NewGuid(), 64, 2880, 960, .8)])]);
        var song = SongRules.New() with { Phrases = [new(Guid.NewGuid(), "乐句", phrase)] };
        return SongRules.Place(song, song.Phrases[0].Id, song.Tracks[0].Id, 0);
    }
    private static SongMixSource Source(SongDocument song)
    { var s = new SongMixSource(true); s.SetDocument(song, crossfade: false); return s; }
    private static float[] Read(SongMixSource source, long frame, int frames)
    { var output = new float[frames * 2]; source.ReadFrames(frame, output); return output; }
    private static double Peak(IEnumerable<float> values) => values.Select(v => Math.Abs((double)v)).DefaultIfEmpty().Max();
    private static void Core()
    {
        Check("new song has empty library and eight independent tracks", () => { var s = SongRules.New(); SongRules.Validate(s); Assert(s.Phrases.Count == 0 && s.Clips.Count == 0 && s.Tracks.Count == 8, "initial song"); });
        Check("original phrase speed determines block width", () => { var s = Song(60); Assert(SongRules.ClipTicks(s, s.Clips[0]) == 7680, "original tempo"); Assert(SongRules.ClipTicks(s, s.Clips[0] with { FollowSongTempo = true }) == 3840, "follow tempo"); });
        Check("same phrase can be placed on arbitrary tracks and ticks", () => { var s = Song(); s = SongRules.Place(s, s.Phrases[0].Id, s.Tracks[7].Id, 9876); Assert(s.Clips[1].StartTick == 9876 && s.Clips[1].TrackId == s.Tracks[7].Id, "placement"); });
        Check("missing references duplicate IDs and negative positions rejected", () =>
        { var s = Song(); Reject(() => SongRules.Validate(s with { Clips = [s.Clips[0] with { PhraseId = Guid.NewGuid() }] })); Reject(() => SongRules.Validate(s with { Clips = [s.Clips[0], s.Clips[0]] })); Reject(() => SongRules.Validate(s with { Clips = [s.Clips[0] with { StartTick = -1 }] })); });
        Check("tempo duration and nonfinite gains are bounded", () => { var s = Song(); Reject(() => SongRules.Validate(s with { Tempo = double.NaN })); Reject(() => SongRules.Validate(s with { GainDb = double.PositiveInfinity })); Reject(() => SongRules.Place(s, s.Phrases[0].Id, s.Tracks[0].Id, SongRules.MaximumTicks)); });
        Check("snap and precision preserve positions", () => { Assert(SongRules.Snap(381, 240) == 480 && SongRules.Snap(381, 0) == 381 && SongRules.Snap(-5, 240) == 0, "snap"); });
        Check("history restores placements tempo and library without changing phrase notes", () => { var h = new SongHistory(); var s = Song(); h.Reset(s); var next = s with { Tempo = 95, Clips = [] }; h.Apply(next); h.Undo(); Assert(ReferenceEquals(h.Current, s), "undo"); h.Redo(); Assert(ReferenceEquals(h.Current, next), "redo"); });
    }
    private static void Files()
    {
        var s = Song(); string phraseFile = Path.Combine(root, "乐句.rsphrase"), songFile = Path.Combine(root, "歌曲.rssong");
        Check("phrase import and self-contained song survive removing generated phrase", () =>
        {
            PhraseArchive.Save(s.Phrases[0].Phrase, phraseFile, false, default);
            var phrase = PhraseArchive.Load(phraseFile, default); s = s with { Phrases = [s.Phrases[0] with { Phrase = phrase }] };
            SongArchive.Save(s, songFile, false, default); File.Delete(phraseFile);
            var loaded = SongArchive.Load(songFile, default);
            Assert(loaded.Name == s.Name && loaded.Clips.SequenceEqual(s.Clips) && loaded.Phrases[0].Phrase.Channels[0].Notes.SequenceEqual(phrase.Channels[0].Notes), "song shape");
            Assert(loaded.Phrases[0].Phrase.Channels[0].Timbre!.Audio.Samples.SequenceEqual(phrase.Channels[0].Timbre!.Audio.Samples), "PCM");
            Assert(loaded.Phrases[0].Phrase.Channels[0].Timbre!.Settings == phrase.Channels[0].Timbre!.Settings, "performance settings");
            Assert(Read(Source(s), 6000, 5000).SequenceEqual(Read(Source(loaded), 6000, 5000)), "reopened audio differs");
        });
        Check("song assets deduplicate across repeated imports and placements", () =>
        {
            var second = s.Phrases[0] with { Id = Guid.NewGuid(), Name = "乐句2" }; var repeated = s with { Phrases = [s.Phrases[0], second] };
            string p = Path.Combine(root, "dedup.rssong"); SongArchive.Save(repeated, p, false, default);
            using var zip = ZipFile.OpenRead(p); Assert(zip.Entries.Count == 2, "sample embedded twice");
            var loaded = SongArchive.Load(p, default); Assert(ReferenceEquals(loaded.Phrases[0].Phrase.Channels[0].Timbre, loaded.Phrases[1].Phrase.Channels[0].Timbre), "reloaded asset not shared");
        });
        Check("empty project roundtrip remains editable", () => { string p = Path.Combine(root, "empty.rssong"); SongArchive.Save(SongRules.New(), p, false, default); Assert(SongArchive.Load(p, default).Clips.Count == 0, "empty"); });
        Check("overwrite refusal cancellation and failed stage preserve destination", () =>
        {
            byte[] before = File.ReadAllBytes(songFile); Reject(() => SongArchive.Save(s, songFile, false, default));
            using var c = new CancellationTokenSource(); c.Cancel(); Reject(() => SongArchive.Save(s, songFile, true, c.Token));
            Reject(() => PhraseArchive.AtomicWrite(songFile, true, default, output => { output.WriteByte(5); throw new IOException("injected failure"); }));
            Assert(File.ReadAllBytes(songFile).SequenceEqual(before) && Directory.GetFiles(root, ".rootsound-*.tmp").Length == 0, "atomic protection");
        });
        Check("truncated and unsupported song files rejected", () =>
        {
            var bytes = File.ReadAllBytes(songFile); string p = Path.Combine(root, "truncated.rssong"); File.WriteAllBytes(p, bytes[..^12]); Reject(() => SongArchive.Load(p, default));
            var capture = SongFormat.Capture(s, default); byte[] json = SongFormat.Serialize(capture.Manifest with { Version = 99 });
            Reject(() => SongFormat.Parse(new MemoryStream(json), json.Length));
        });
        Check("unknown duplicate and corrupt ZIP entries rejected", () =>
        {
            foreach (var kind in new[] { "unknown", "duplicate", "badpcm" })
            {
                string p = Path.Combine(root, kind + ".rssong"); File.Copy(songFile, p);
                using (var zip = ZipFile.Open(p, ZipArchiveMode.Update))
                {
                    if (kind == "badpcm") { var a = zip.Entries.Single(e => e.FullName.StartsWith("assets/")); string name = a.FullName; long size = a.Length; a.Delete(); using var output = zip.CreateEntry(name).Open(); output.Write(new byte[(int)size]); }
                    else { using var output = zip.CreateEntry(kind == "duplicate" ? "manifest.json" : "../outside").Open(); output.WriteByte(0); }
                }
                Reject(() => SongArchive.Load(p, default));
            }
        });
        Check("draft recovery caches unchanged samples and retains unrelated files", () =>
        {
            string path = Path.Combine(root, "draft"); var store = new SongDraft(path); store.Save(s, default);
            string asset = Directory.GetFiles(Path.Combine(path, "assets")).Single(); var writeTime = File.GetLastWriteTimeUtc(asset);
            File.WriteAllText(Path.Combine(path, "user.txt"), "keep"); store.Save(s with { Name = "新名字" }, default);
            Assert(store.Load(default).Name == "新名字" && File.GetLastWriteTimeUtc(asset) == writeTime, "cache rewritten or recovery lost");
            store.Clear(); Assert(!store.Exists && File.Exists(asset) && File.ReadAllText(Path.Combine(path, "user.txt")) == "keep", "unsafe cleanup");
        });
    }
    private static void Audio()
    {
        Check("silence before block and delayed phrase note have correct positions", () =>
        {
            var s = Song(60); s = s with { Clips = [s.Clips[0] with { StartTick = 1920 }] }; var source = Source(s);
            Assert(Peak(Read(source, 0, 47000)) == 0 && Peak(Read(source, 50000, 2000)) > .03, "start time");
            Assert(Peak(Read(source, 194000, 2000)) > .03, "original-tempo late note");
        });
        Check("follow song speed changes note timing without transposing pitch", () =>
        {
            var s = Song(60); s = s with { Clips = [s.Clips[0] with { FollowSongTempo = true }] }; var data = Read(Source(s), 1000, 18000);
            int crossings = 0; for (int i = 2; i < data.Length; i += 2) if (data[i - 2] <= 0 && data[i] > 0) crossings++;
            Assert(Math.Abs(crossings * 48000.0 / 18000 - 220) < 5, "tuning changed");
            Assert(Peak(Read(Source(s), 74000, 2000)) > .03, "follow tempo late note");
        });
        Check("overlap mixes gains and track mute without dropping notes", () =>
        {
            var s = Song(); double single = Peak(Read(Source(s), 5000, 2000));
            var copy = s.Clips[0] with { Id = Guid.NewGuid(), TrackId = s.Tracks[1].Id }; var together = s with { Clips = [s.Clips[0], copy] };
            Assert(Math.Abs(Peak(Read(Source(together), 5000, 2000)) / single - 2) < .001, "overlap mix");
            together = together with { Tracks = together.Tracks.Select((t, i) => i == 1 ? t with { Muted = true } : t).ToArray() };
            Assert(Math.Abs(Peak(Read(Source(together), 5000, 2000)) - single) < .00001, "mute");
        });
        Check("block reads match one long render including release and EOF", () =>
        {
            var source = Source(Song()); int length = checked((int)source.FrameCount); var expected = Read(source, 0, length);
            var actual = new List<float>();
            for (long f = 0; f < length;) { float[] b = new float[997 * 2]; int n = source.ReadFrames(f, b); actual.AddRange(b.Take(n * 2)); f += n; }
            Assert(expected.SequenceEqual(actual) && Peak(expected[^12000..]) > 0, "chunk/tail mismatch");
            float[] eof = [1, 2]; Assert(source.ReadFrames(source.FrameCount, eof) == 0 && eof.All(v => v == 0), "EOF");
        });
        Check("polyphony limit reports overlap before accepting a mix", () =>
        {
            var s = Song(); s = s with { Clips = Enumerable.Range(0, 129).Select(_ => s.Clips[0] with { Id = Guid.NewGuid() }).ToArray() };
            Reject(() => Source(s));
        });
        Check("WAV contains entire arrangement stereo PCM and natural tail", () =>
        {
            var s = Song(); string p = Path.Combine(root, "song.wav"); SongWaveExporter.Export(s, p, false, default);
            byte[] bytes = File.ReadAllBytes(p); var source = Source(s);
            Assert(bytes.Length == 44 + source.FrameCount * 6 && BinaryPrimitives.ReadUInt16LittleEndian(bytes.AsSpan(34)) == 24 &&
                BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(24)) == 48000, "WAV header");
            float[] values = Read(source, 0, (int)source.FrameCount);
            for (int i = 0; i < values.Length; i += 41)
            {
                int offset = 44 + i * 3, value = (bytes[offset] | bytes[offset + 1] << 8 | bytes[offset + 2] << 16);
                if ((value & 0x800000) != 0) value |= unchecked((int)0xff000000);
                Assert(Math.Abs(value / 8388608.0 - values[i]) <= 1.0 / 8388608, "WAV differs from playback");
            }
        });
        Check("cancelled WAV preserves old file and empty song export is refused", () =>
        {
            string p = Path.Combine(root, "cancel.wav"); File.WriteAllText(p, "old"); using var c = new CancellationTokenSource(); c.Cancel();
            Reject(() => SongWaveExporter.Export(Song(), p, true, c.Token)); Assert(File.ReadAllText(p) == "old", "overwritten on cancel");
            Reject(() => SongWaveExporter.Export(SongRules.New(), p, true, default));
        });
        Check("sparse long arrangement renders a bounded random-access window", () =>
        {
            var s = Song(); s = s with { Clips = [s.Clips[0] with { StartTick = 1000 * Timing.TicksPerBar }] };
            var source = Source(s); long before = GC.GetAllocatedBytesForCurrentThread();
            var sound = Read(source, 1000L * 96000 + 5000, 2400); long allocated = GC.GetAllocatedBytesForCurrentThread() - before;
            Assert(Peak(sound) > .03 && allocated < 1_000_000, "whole song allocated");
        });
    }
    private static void Transport()
    {
        Check("device-clock cursor pause seek and live tempo edit", () =>
        {
            var factory = new Factory(); var player = new SongPlayback(factory);
            try
            {
                var s = Song(); player.SetDocument(s); player.Play(); Wait(() => player.Snapshot.Playing && factory.Device is not null);
                var device = factory.Device!; Advance(device, 24000); Wait(() => Math.Abs(player.Snapshot.Tick - 960) < 1);
                player.Pause(); Wait(() => !player.Snapshot.Playing); double tick = player.Snapshot.Tick; Thread.Sleep(25); Assert(player.Snapshot.Tick == tick, "pause");
                player.Seek(1920); Assert(player.Snapshot.Tick == 1920, "pending seek display"); Wait(() => Math.Abs(player.Snapshot.Tick - 1920) < 1);
                player.SetDocument(s with { Tempo = 90 }); Assert(Math.Abs(player.Snapshot.Tick - 1920) < 1, "live tempo moved musical cursor");
                player.Play(); Wait(() => player.Snapshot.Playing); player.Stop(); Wait(() => !player.Snapshot.Playing && player.Snapshot.Tick == 0);
            }
            finally { player.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Check("playback keeps release pause resume and restarts after complete end", () =>
        {
            var factory = new Factory(); var player = new SongPlayback(factory);
            try
            {
                var song = Song(); player.SetDocument(song); player.Play(); Wait(() => player.Snapshot.Playing && factory.Device is not null);
                Advance(factory.Device!, 97000); Wait(() => player.Snapshot.Tick == 3840); Assert(player.Snapshot.Playing, "tail cut");
                Thread.Sleep(25); player.SetDocument(song with { GainDb = -9 });
                player.Pause(); Wait(() => !player.Snapshot.Playing); player.Play(); Wait(() => player.Snapshot.Playing); Assert(player.Snapshot.Tick == 3840, "tail replayed from start");
                Advance(factory.Device!, 8600); Wait(() => !player.Snapshot.Playing); player.Play(); Wait(() => player.Snapshot.Playing && player.Snapshot.Tick < 100);
            }
            finally { player.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Check("playback error is reported and song remains renderable", () =>
        {
            var factory = new Factory(); var player = new SongPlayback(factory); var song = Song();
            try { player.SetDocument(song); player.Play(); Wait(() => player.Snapshot.Playing && factory.Device is not null); factory.Device!.Fail = true;
                Wait(() => player.Snapshot.Error is not null); Assert(Peak(Read(Source(song), 5000, 2000)) > 0, "song lost after failure"); }
            finally { player.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Check("empty timeline cursor can place a phrase later without snapping back", () =>
        {
            var factory = new Factory(); var player = new SongPlayback(factory);
            try
            {
                var s = SongRules.New(); player.SetDocument(s); player.Seek(19200);
                Wait(() => player.Snapshot.Tick == 19200); Thread.Sleep(30); Assert(player.Snapshot.Tick == 19200, "cursor moved after seek acknowledgment");
                player.SetDocument(s with { Name = "命名后" }); Assert(player.Snapshot.Tick == 19200 && factory.Device is null, "edit reset cursor or opened device");
            }
            finally { player.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
    }
    private static void Ui()
    {
        Check("timeline drop geometry snap track selection and zoom anchor", () =>
        {
            using var view = new PlaylistView { Size = new(950, 440), Font = new("Microsoft YaHei UI", 10) }; var s = Song(); view.SetSong(s);
            var target = view.DropLocation(new(view.HeaderWidth + 48 * 5 + 5, view.RulerHeight + view.RowHeight * 2 + 5));
            Assert(target.Track == s.Tracks[2].Id && target.Tick == 4800, "drop geometry");
            var precise = view.DropLocation(new(view.HeaderWidth + 48 * 5 + 5, view.RulerHeight + 5), true); Assert(precise.Tick == 4900, "precise tick");
            view.SelectClip(s.Clips[0].Id); Assert(view.SelectedTrack == s.Tracks[0].Id, "selected track");
            int anchor = view.HeaderWidth + 300; double before = view.DropLocation(new(anchor, 100), true).Tick;
            view.SetZoom(96, anchor); double after = view.DropLocation(new(anchor, 100), true).Tick; Assert(Math.Abs(after - before) < 11, "zoom anchor");
        });
        Check("offscreen playlist renders notes tracks overlap and cursor", () =>
        {
            using var view = new PlaylistView { Size = new(1050, 480), Font = new("Microsoft YaHei UI", 10) }; var s = Song();
            s = SongRules.Place(s, s.Phrases[0].Id, s.Tracks[1].Id, 4800); view.SetSong(s); view.SelectClip(s.Clips[1].Id); view.SetCursor(1200);
            using var bitmap = new Bitmap(view.Width, view.Height); view.DrawToBitmap(bitmap, view.ClientRectangle); bitmap.Save(Path.Combine(root, "playlist.png"));
            Assert(!view.Visible || view.Parent is null, "view attached to visible window");
        });
        Check("pointer event drag commits one move with preserved grab offset", () =>
        {
            using var view = new PlaylistView { Size = new(1050, 480) }; var s = Song(); view.SetSong(s);
            (Guid Id, Guid Track, long Tick)? moved = null; int commits = 0;
            view.ClipMoved += (id, track, tick) => { moved = (id, track, tick); commits++; };
            var bounds = view.ClipBounds(s.Clips[0]); int x = (int)bounds.X + 20, y = (int)bounds.Y + 15;
            void Mouse(string method, int a, int b) => typeof(PlaylistView).GetMethod(method, BindingFlags.Instance | BindingFlags.NonPublic)!
                .Invoke(view, [new MouseEventArgs(MouseButtons.Left, 1, a, b, 0)]);
            Mouse("OnMouseDown", x, y); Mouse("OnMouseMove", x + 24, y + view.RowHeight); Mouse("OnMouseMove", x + 48, y + view.RowHeight);
            Assert(commits == 0, "drag created edits before release"); Mouse("OnMouseUp", x + 48, y + view.RowHeight);
            Assert(commits == 1 && moved == (s.Clips[0].Id, s.Tracks[1].Id, 960L), "drag position or commit");
        });
        Check("main window can construct and lay out without showing or accessing audio", () =>
        {
            var factory = new Factory(); var player = new SongPlayback(factory); string path = Path.Combine(root, "unshown-draft");
            using var form = new MainForm(false, player, path); form.PerformLayout();
            Assert(!form.Visible && !form.IsHandleCreated && factory.Device is null && !Directory.Exists(path), "constructor side effect");
            form.ClientSize = new(1050, 720); form.PerformLayout();
            var timeline = Descendants(form).OfType<PlaylistView>().Single(); Assert(timeline.Width > 600 && timeline.Height > 250, "timeline squeezed out by controls");
            typeof(MainForm).GetMethod("Apply", BindingFlags.Instance | BindingFlags.NonPublic)!.Invoke(form, [Song()]);
            // Render a detached control tree in its hidden parking parent. The app form stays unshown.
            using var panel = form.Controls[0]; form.Controls.Remove(panel); panel.Font = form.Font; panel.BackColor = form.BackColor; panel.ForeColor = form.ForeColor;
            using var bitmap = new Bitmap(panel.Width, panel.Height); panel.DrawToBitmap(bitmap, panel.ClientRectangle); bitmap.Save(Path.Combine(root, "window-minimum.png"));
            Assert(!form.Visible && factory.Device is null, "offscreen opened window/device");
        });
    }
    private static IEnumerable<Control> Descendants(Control root)
    { foreach (Control c in root.Controls) { yield return c; foreach (var child in Descendants(c)) yield return child; } }
    private static void Wait(Func<bool> condition)
    { var watch = Stopwatch.StartNew(); while (!condition()) { if (watch.ElapsedMilliseconds > 5000) throw new TimeoutException("fake audio worker timeout"); Thread.Sleep(2); } }
    private static void Advance(Device d, int frames)
    { while (frames > 0) { Wait(() => d.PaddingFrames > 0); int amount = Math.Min(frames, d.PaddingFrames); d.Advance(amount); frames -= amount; } }
    private sealed class Factory : IPlaybackDeviceFactory
    {
        internal volatile Device? Device;
        public IPlaybackDevice Open() { Device = new Device(); return Device; }
    }
    private sealed class Device : IPlaybackDevice
    {
        private readonly object gate = new(); private int padding; private double played; private bool started;
        internal volatile bool Fail;
        public int SampleRate => 48000; public int Channels => 2; public int BufferFrames => 2400;
        public int PaddingFrames { get { lock (gate) return padding; } }
        public double PlayedFrames { get { lock (gate) { if (Fail) throw new IOException("fake device disconnected"); return played; } } }
        public void Write(ReadOnlySpan<float> samples) { lock (gate) padding += samples.Length / 2; }
        public void Start() { lock (gate) started = true; } public void Stop() { lock (gate) started = false; }
        public void Reset() { lock (gate) { played = 0; padding = 0; } }
        public void Dispose() { lock (gate) started = false; }
        internal void Advance(int n) { lock (gate) if (started) { int take = Math.Min(n, padding); padding -= take; played += take; } }
    }
}
