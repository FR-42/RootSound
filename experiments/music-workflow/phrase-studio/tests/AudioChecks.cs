using System.Diagnostics;
using System.Text.Json;
using RootSound.PhraseStudio.Audio;
using RootSound.PhraseStudio.Core;
using RootSound.SampleEditor.Playback;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;

namespace RootSound.PhraseStudio.Tests;

internal static class AudioChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory);
        int count = 0;
        Check("schedule starts on ticks and leaves real gaps", () =>
        {
            var doc = Document(Note(60, 960, 240));
            var source = Source(doc);
            Assert(Peak(Read(source, 0, 3990)) == 0, "No note before its scheduled beat.");
            Assert(Peak(Read(source, 4020, 800)) > .03, "The note begins on beat two.");
            Assert(Peak(Read(source, 6000, 500)) == 0, "The note's release finishes.");
        });
        Check("polyphony and stereo sum overlapping notes", () =>
        {
            var a = Document(Note(60, 0, 1920));
            var b = a with { Channels = [a.Channels[0], a.Channels[0] with { Id = Guid.NewGuid(), Name = "第二层", Notes = [Note(60, 0, 1920)] }] };
            float[] single = Read(Source(a), 1000, 800), both = Read(Source(b), 1000, 800);
            Assert(Math.Abs(Rms(both) / Rms(single) - 2) < .002, "Two channels genuinely mix.");
            Assert(both.Where((_, index) => index % 2 == 0).Zip(both.Where((_, index) => index % 2 == 1)).All(pair => pair.First == pair.Second), "Mono centers in stereo.");
        });
        Check("fractional original root and transposition preserve pitch", () =>
        {
            var patch = Patch(440, root: 69.35);
            var doc = Document(Note(81, 0, 1920), patch);
            double measured = Frequency(Read(Source(doc), 1600, 4000), 8000);
            double expected = 440 * Math.Pow(2, (81 - 69.35) / 12);
            Assert(Math.Abs(measured - expected) / expected < .006, $"Measured {measured}, expected {expected}.");
        });
        Check("source sample rate is converted while preserving duration", () =>
        {
            var patch = Patch(200, rate: 16000);
            double frequency = Frequency(Read(Source(Document(Note(60, 0, 1920), patch)), 1600, 4000), 8000);
            Assert(Math.Abs(frequency - 200) < 3, "16 kHz sample plays correctly on 8 kHz mix clock.");
        });
        Check("archive ADSR and release agree with third module renderer", () =>
        {
            var patch = Patch(200) with { Settings = new InstrumentSettings(60, .02, .025, .55, .1, true, 100, 7000, .005, -2) };
            var source = Source(Document(Note(60, 0, 240), patch));
            var reference = InstrumentRenderer.Render(patch, 60, .125);
            float[] result = Read(source, 0, (int)reference.FrameCount);
            double difference = 0;
            for (int i = 0; i < reference.Samples.Length; i++) difference = Math.Max(difference, Math.Abs(reference.Samples[i] - result[i * 2]));
            Assert(difference < .0004, "Streaming voice must retain the sound made by timbre lab, difference=" + difference);
            Assert(Peak(Read(source, 1900, 500)) == 0, "Released voice ends.");
        });
        Check("sustain loop continues after the original recording ends", () =>
        {
            var patch = Patch(200, seconds: .2);
            patch = patch with { Settings = patch.Settings with { LoopStart = 160, LoopEnd = 1440, LoopCrossfadeSeconds = .01 } };
            var held = Document(Note(60, 0, 3000), patch);
            Assert(Rms(Read(Source(held), 8000, 1000)) > .025, "A loop sustains beyond the short file.");
            patch = patch with { Settings = patch.Settings with { LoopEnabled = false } };
            Assert(Peak(Read(Source(held with { Channels = [held.Channels[0] with { Timbre = patch }] }), 8000, 1000)) == 0, "Nonlooped voice exhausts naturally.");
        });
        Check("stereo separation and center channel are retained", () =>
        {
            float[] stereo = new float[16000], surround = new float[48000];
            for (int i = 0; i < 8000; i++) { stereo[i * 2] = (float)(.1 * Math.Sin(2 * Math.PI * 200 * i / 8000)); surround[i * 6 + 2] = stereo[i * 2]; }
            var settings = Patch().Settings;
            float[] separated = Read(Source(Document(Note(60, 0, 1920), new InstrumentPatch(new(8000, 2, stereo, "左声道"), settings, "左声道"))), 1000, 1000);
            Assert(separated.Where((_, index) => index % 2 == 0).Any(value => Math.Abs(value) > .02), "Left source audible.");
            Assert(separated.Where((_, index) => index % 2 == 1).All(value => value == 0), "Silent right remains silent.");
            float[] center = Read(Source(Document(Note(60, 0, 1920), new InstrumentPatch(new(8000, 6, surround, "中央"), settings, "中央"))), 1000, 1000);
            Assert(Rms(center) > .005, "A 5.1 center is folded into both channels.");
        });
        Check("velocity channel gain and original gain are respected", () =>
        {
            var doc = Document(Note(60, 0, 1920));
            double original = Rms(Read(Source(doc), 1000, 1000));
            var note = doc.Channels[0].Notes[0];
            var changed = doc with { Channels = [doc.Channels[0] with { GainDb = -6.020599913, Notes = [note with { Velocity = .5 }] }] };
            double quiet = Rms(Read(Source(changed), 1000, 1000));
            Assert(Math.Abs(quiet / original - .25) < .001, "Velocity and -6dB channel gain multiply.");
        });
        Check("streaming blocks are deterministic and do not depend on prior reads", () =>
        {
            var source = Source(Document(Note(60, 0, 1920), Patch(200, root: 60.3)));
            float[] all = Read(source, 0, 9000), split = new float[18000];
            for (int at = 0; at < 9000; at += 257)
            {
                int take = Math.Min(257, 9000 - at);
                source.ReadFrames(at, split.AsSpan(at * 2, take * 2));
            }
            Assert(all.SequenceEqual(split), "No per-block envelope or loop resets.");
        });
        Check("tempo changes timing without modifying sample pitch", () =>
        {
            var doc = Document(Note(60, 960, 480)) with { Tempo = 60 };
            var source = Source(doc);
            Assert(Peak(Read(source, 4000, 1000)) == 0, "At 60 BPM beat two starts at one second.");
            Assert(Math.Abs(Frequency(Read(source, 8500, 2000), 8000) - 200) < 5, "Tempo does not transpose timbre.");
        });
        Check("phrase cycles repeat and preserve release crossing the boundary", () =>
        {
            var source = Source(Document(Note(60, 3600, 240)));
            Assert(Peak(Read(source, 100, 200)) == 0, "No imaginary previous cycle on first play.");
            Assert(Peak(Read(source, 16100, 200)) > .002, "The previous cycle's release crosses the boundary.");
            Assert(Peak(Read(source, 31020, 300)) > .02, "Next loop starts notes at the same beat.");
            var position = source.Position(32100);
            Assert(position.Cycle == 2 && Math.Abs(position.Tick - 24) < .001, "Loop index and ticks share audio clock.");
        });
        Check("live edit crossfades and leaves PCM owned by source unchanged", () =>
        {
            var doc = Document(Note(60, 0, 3000));
            float[] before = (float[])doc.Channels[0].Timbre!.Audio.Samples.Clone();
            var source = Source(doc); Read(source, 3900, 100);
            source.SetDocument(doc with { Channels = [doc.Channels[0] with { Muted = true }] }, 4000, 960);
            float[] changed = Read(source, 4000, 500);
            Assert(Peak(changed[..20]) > .001 && Peak(changed[200..]) == 0, "Mute fades over 5ms, then is silent.");
            Assert(before.SequenceEqual(doc.Channels[0].Timbre!.Audio.Samples), "Playback never edits imported audio.");
        });
        Check("nonloop mode does not repeat and end marker clamps", () =>
        {
            var source = Source(Document(Note(60, 0, 240))); source.Loop = false;
            Assert(Peak(Read(source, 17000, 500)) == 0, "The second cycle is absent.");
            Assert(source.Position(17000) == (3840d, 0L), "Nonlooped marker stops at end.");
        });
        Check("nonlooped phrase ends after its natural release without extending a one-shot", () =>
        {
            var patch = Patch() with { Settings = Patch().Settings with { ReleaseSeconds = .3 } };
            var doc = Document(Note(60, 3600, 240), patch);
            var source = Source(doc); source.Loop = false;
            Assert(Math.Abs(source.PlaybackEndTick - 4416) < .001, "Last 300ms release extends playback past the visible end.");
            Assert(Peak(Read(source, 16100, 500)) > .005, "The release is audible past the last bar.");
            Assert(Peak(Read(source, 18500, 500)) == 0, "Tail finishes rather than sustaining forever.");
            var oneShot = patch with { Settings = patch.Settings with { LoopEnabled = false, ReleaseSeconds = 10 } };
            var exhausted = Source(Document(Note(60, 3600, 240), oneShot));
            Assert(Math.Abs(exhausted.PlaybackEndTick - 5520) < .001, "One-second sample exhausts at 2.875s despite ten-second release.");
        });
        Check("polyphony overload reports error rather than silently losing notes", () =>
        {
            var notes = Enumerable.Range(0, PhraseMixSource.MaximumConcurrentVoices + 1).Select(_ => Note(60, 0, 1920)).ToArray();
            var source = Source(Document(notes));
            try { Read(source, 1000, 32); throw new Exception("Expected polyphony protection."); }
            catch (InvalidOperationException ex) { Assert(ex.Message.Contains("128"), "Clear resource limit."); }
        });
        Check("mixed peaks are finite and protected without changing quiet audio", () =>
        {
            float[] values = [.2f, -.3f, 10f, -20f, float.NaN];
            PhraseMixSource.ProtectPeaks(values);
            Assert(values[0] == .2f && values[1] == -.3f && values.All(value => float.IsFinite(value) && Math.Abs(value) <= 1), "Bounded soft peak protection.");
        });
        Check("audition supports concurrent notes independently of phrase stream", () =>
        {
            var preview = new PreviewMixSource(8000);
            var voice = new InstrumentVoice(Patch(), 60, .3, .5, 0, 8000);
            preview.Add(voice, 0); float[] one = Read(preview, 500, 500);
            preview.Add(voice, 0); float[] two = Read(preview, 500, 500);
            Assert(Math.Abs(Rms(two) / Rms(one) - 2) < .001, "Two audition voices mix.");
            Assert(preview.LastVoiceEnd > 2400, "Preview release is included.");
            preview.Clear(); Assert(Peak(Read(preview, 0, 500)) == 0, "Stop clears only previews.");
        });
        Check("sparse long phrase allocates bounded windows instead of whole PCM", () =>
        {
            var notes = Enumerable.Range(0, 1024).Select(index => Note(60, index * 60L, 30)).ToArray();
            var doc = Document(notes) with { Bars = 16, Tempo = 20 };
            var source = Source(doc);
            _ = Read(source, 100, 256);
            long before = GC.GetAllocatedBytesForCurrentThread();
            var watch = Stopwatch.StartNew();
            for (int i = 0; i < 100; i++) _ = Read(source, i * 500, 256);
            watch.Stop();
            long allocation = GC.GetAllocatedBytesForCurrentThread() - before;
            Assert(allocation < 2_000_000, "No full 192-second PCM allocation: " + allocation);
            Assert(watch.Elapsed < TimeSpan.FromSeconds(5), "Indexed sparse mix must remain usable.");
            File.WriteAllText(Path.Combine(directory, "stream-metrics.json"), JsonSerializer.Serialize(new { windows = 100, framesPerWindow = 256, allocatedBytes = allocation, elapsedMilliseconds = watch.Elapsed.TotalMilliseconds }));
        });
        Check("construction does not open sound devices and disposal is safe", () =>
        {
            FakeFactory factory = new();
            var session = new PhrasePlaybackSession(factory, 8000);
            session.SetDocument(Document(Note(60, 0, 1920)));
            Assert(factory.Devices.Count == 0 && !session.IsPlaying, "No device until play or key audition.");
            session.DisposeAsync().AsTask().GetAwaiter().GetResult();
            session.DisposeAsync().AsTask().GetAwaiter().GetResult();
            Assert(factory.Devices.Count == 0, "Closing an idle editor never opens output.");
        });
        Check("typical 32-voice 48 kHz phrase renders faster than the audio window", () =>
        {
            var notes = Enumerable.Range(0, 32).Select(index => Note(48 + index % 24, 0, 1920)).ToArray();
            var source = new PhraseMixSource();
            source.SetDocument(Document(notes, Patch(200, rate: 48000)), crossfade: false);
            var block = new float[4800];
            source.ReadFrames(3000, block);
            var elapsed = new List<double>();
            for (int index = 0; index < 5; index++)
            {
                var watch = Stopwatch.StartNew(); source.ReadFrames(6000 + index * 2400, block); watch.Stop();
                elapsed.Add(watch.Elapsed.TotalMilliseconds);
            }
            double median = elapsed.Order().ElementAt(elapsed.Count / 2);
            Assert(median < 50, "32-voice median must fit 50ms output window: " + median);
            File.WriteAllText(Path.Combine(directory, "polyphony-metrics.json"), JsonSerializer.Serialize(new
                { voices = 32, sampleRate = 48000, windowMilliseconds = 50, measuredMilliseconds = elapsed, medianMilliseconds = median }));
        });
        Check("session follows device clock pauses freezes seeks and loops", () =>
        {
            FakeFactory factory = new();
            var session = new PhrasePlaybackSession(factory, 8000);
            try
            {
                session.SetDocument(Document(Note(60, 0, 3000))); session.Play();
                Wait(() => session.IsPlaying && factory.Devices.Count == 1);
                FakeDevice device = factory.Devices[0];
                Advance(device, 4000);
                Wait(() => session.PositionTick >= 950);
                Assert(Math.Abs(session.PositionTick - 960) < .001, "Playhead follows the fake device, not a wall timer.");
                session.Pause(); Wait(() => !session.IsPlaying); double paused = session.PositionTick;
                Thread.Sleep(30); Assert(session.PositionTick == paused, "Pause freezes heard position.");
                session.Seek(1920); Wait(() => Math.Abs(session.PositionTick - 1920) < .001);
                session.SetDocument(Document(Note(60, 0, 3000)));
                Wait(() => Math.Abs(session.PositionTick - 1920) < .001);
                session.Play(); Wait(() => session.IsPlaying);
                Advance(device, 9000); Wait(() => session.Snapshot.LoopIndex == 1);
                session.Stop(); Wait(() => !session.IsPlaying && session.PositionTick == 0);
                Assert(session.Error is null, "Transport stays healthy.");
            }
            finally { session.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Check("preview does not interrupt playing phrase and failures remain recoverable", () =>
        {
            FakeFactory factory = new();
            var session = new PhrasePlaybackSession(factory, 8000);
            try
            {
                var doc = Document(Note(60, 0, 3000)); session.SetDocument(doc); session.Play();
                Wait(() => session.IsPlaying);
                session.Audition(doc.Channels[0], 64);
                Wait(() => factory.Devices.Count == 2 && factory.Devices[1].Started);
                Assert(session.IsPlaying && factory.Devices[0].Started, "Keyboard audition leaves phrase endpoint running.");
                factory.Devices[0].Fail = true;
                Wait(() => session.Error is not null && !session.IsPlaying);
                Assert(session.Error!.Contains("test device"), "Useful device failure reaches UI.");
            }
            finally { session.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Check("nonloop session plays and resumes the complete tail while marker stays at end", () =>
        {
            FakeFactory factory = new();
            var session = new PhrasePlaybackSession(factory, 8000);
            try
            {
                var patch = Patch() with { Settings = Patch().Settings with { ReleaseSeconds = .3 } };
                session.SetDocument(Document(Note(60, 3600, 240), patch)); session.Loop = false; session.Play();
                Wait(() => session.IsPlaying && factory.Devices.Count == 1);
                FakeDevice device = factory.Devices[0];
                Advance(device, 16160);
                Wait(() => session.PositionTick == 3840);
                Assert(session.IsPlaying && device.LastWritePeak > .002, "End marker does not cut off the audible release.");
                session.Pause(); Wait(() => !session.IsPlaying);
                session.Play(); Wait(() => session.IsPlaying);
                Assert(session.PositionTick == 3840, "Resuming within release does not restart the phrase.");
                Advance(device, 2400);
                Wait(() => !session.IsPlaying);
                Assert(session.PositionTick == 3840 && session.Error is null, "Session stops cleanly after finite tail.");
                session.Play(); Wait(() => session.IsPlaying);
                Assert(session.PositionTick < 100, "Playing after complete tail starts a fresh pass.");
            }
            finally { session.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Console.WriteLine($"Audio: {count} groups passed");
        return count;

        void Check(string label, Action action)
        {
            try { action(); count++; }
            catch (Exception ex) { throw new InvalidOperationException("Audio check failed: " + label, ex); }
        }
    }

    private static PhraseDocument Document(params PhraseNote[] notes) => Document(notes, Patch());
    private static PhraseDocument Document(PhraseNote note, InstrumentPatch patch) => Document([note], patch);
    private static PhraseDocument Document(PhraseNote[] notes, InstrumentPatch patch) => new(Guid.NewGuid(), "音频测试", 120, 1,
        [new PhraseChannel(Guid.NewGuid(), "音色", patch, EditorMode.PianoRoll, 60, 0, false, notes)]);
    private static PhraseNote Note(int pitch, long start, long length) => new(Guid.NewGuid(), pitch, start, length, 1);
    private static InstrumentPatch Patch(double frequency = 200, double root = 60, int rate = 8000, double seconds = 1)
    {
        int frames = (int)(rate * seconds);
        float[] values = Enumerable.Range(0, frames).Select(index => (float)(.1 * Math.Sin(2 * Math.PI * frequency * index / rate))).ToArray();
        return new(new PcmClip(rate, 1, values, "正弦"), new InstrumentSettings(root, .005, .02, .8, .05, true, 100, frames - 100, .005, 0), "正弦");
    }
    private static PhraseMixSource Source(PhraseDocument document)
    {
        var source = new PhraseMixSource(8000); source.SetDocument(document, crossfade: false); return source;
    }
    private static float[] Read(RootSound.SampleEditor.Core.IAudioFrameSource source, long frame, int count)
    {
        float[] result = new float[count * source.Channels];
        Assert(source.ReadFrames(frame, result) == count, "Full requested window."); return result;
    }
    private static double Peak(IEnumerable<float> values) => values.Select(value => Math.Abs((double)value)).DefaultIfEmpty().Max();
    private static double Rms(float[] values) => Math.Sqrt(values.Select(value => (double)value * value).Average());
    private static double Frequency(float[] stereo, int sampleRate)
    {
        int rising = 0;
        for (int i = 2; i < stereo.Length; i += 2) if (stereo[i - 2] <= 0 && stereo[i] > 0) rising++;
        return rising * sampleRate / (stereo.Length / 2d);
    }
    private static void Assert(bool condition, string label) { if (!condition) throw new Exception(label); }
    private static void Wait(Func<bool> condition)
    {
        var watch = Stopwatch.StartNew();
        while (!condition()) { if (watch.Elapsed > TimeSpan.FromSeconds(4)) throw new TimeoutException("Audio worker did not reach expected state."); Thread.Sleep(2); }
    }
    private static void Advance(FakeDevice device, int frames)
    {
        int remaining = frames;
        while (remaining > 0)
        {
            Wait(() => device.PaddingFrames > 0);
            int amount = Math.Min(remaining, device.PaddingFrames);
            device.Advance(amount); remaining -= amount;
        }
    }

    private sealed class FakeFactory : IPlaybackDeviceFactory
    {
        private readonly object gate = new();
        private readonly List<FakeDevice> devices = [];
        internal IReadOnlyList<FakeDevice> Devices { get { lock (gate) return devices.ToArray(); } }
        public IPlaybackDevice Open() { lock (gate) { var result = new FakeDevice(); devices.Add(result); return result; } }
    }
    private sealed class FakeDevice : IPlaybackDevice
    {
        private readonly object gate = new();
        private int padding;
        private long played;
        private bool started;
        private double lastWritePeak;
        internal bool Fail;
        internal bool Started { get { lock (gate) return started; } }
        internal double LastWritePeak { get { lock (gate) return lastWritePeak; } }
        public int SampleRate => 8000;
        public int Channels => 2;
        public int BufferFrames => 400;
        public int PaddingFrames { get { lock (gate) return padding; } }
        public double PlayedFrames { get { lock (gate) { if (Fail) throw new IOException("test device disconnected"); return played; } } }
        public void Write(ReadOnlySpan<float> interleaved)
        {
            lock (gate)
            {
                padding += interleaved.Length / 2;
                lastWritePeak = 0;
                foreach (float value in interleaved) lastWritePeak = Math.Max(lastWritePeak, Math.Abs(value));
            }
        }
        public void Start() { lock (gate) started = true; }
        public void Stop() { lock (gate) started = false; }
        public void Reset() { lock (gate) { padding = 0; played = 0; } }
        public void Dispose() { lock (gate) started = false; }
        internal void Advance(int frames) { lock (gate) { if (!started) return; int take = Math.Min(frames, padding); played += take; padding -= take; } }
    }
}

