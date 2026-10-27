using System.Diagnostics;
using System.Buffers.Binary;
using RootSound.PhraseStudio.Core;
using RootSound.ReferenceStudio.Audio;
using RootSound.ReferenceStudio.Core;
using RootSound.ReferenceStudio.Persistence;
using RootSound.SampleEditor.Core;
using RootSound.SampleEditor.Playback;
using RootSound.TimbreLab.Core;

namespace RootSound.ReferenceStudio.Tests;

internal static class AudioChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory);
        int count = 0;
        Check("reference is the exact aligned stereo material with independent gain", () =>
        {
            var project = Project() with { ReferenceGainDb = -6.020599913 };
            var plan = new ReferenceRenderPlan(project);
            float[] values = ReadPlan(plan, 10000, 300, SourceMode.Reference);
            Assert(values.All(v => Math.Abs(v - .05) < 1e-6), "Reference gain only affects reference.");
            var normal = new ReferenceRenderPlan(project with { ReferenceGainDb = 0 });
            Assert(ReadPlan(plan, 10000, 300).SequenceEqual(ReadPlan(normal, 10000, 300)), "Reference gain does not alter the reconstruction.");
        });
        Check("notes actually schedule from phrase ticks", () =>
        {
            var project = Project(Note(60, 960, 240));
            var plan = new ReferenceRenderPlan(project);
            Assert(Peak(ReadPlan(plan, 5000, 500)) == 0, "No sound before note.");
            Assert(Peak(ReadPlan(plan, 26000, 500)) > .02, "Beat two is exactly at 0.5 seconds on the 48 kHz clock.");
            Assert(Peak(ReadPlan(plan, 38000, 500)) == 0, "Released voice is genuinely silent.");
        });
        Check("stereo and channel gain survive reconstruction", () =>
        {
            var project = Project(); var channel = project.Phrase.Channels[0];
            float[] stereo = new float[48000 * 2];
            for (int i = 0; i < 48000; i++) stereo[i * 2] = (float)(.1 * Math.Sin(2 * Math.PI * 400 * i / 48000));
            channel = channel with { Timbre = channel.Timbre! with { Audio = new PcmClip(48000, 2, stereo, "left") } };
            project = project with { Phrase = project.Phrase with { Channels = [channel] } };
            float[] output = ReadPlan(new(project), 5000, 800);
            Assert(output.Where((_, i) => i % 2 == 0).Any(v => Math.Abs(v) > .02), "Left output audible.");
            Assert(output.Where((_, i) => i % 2 == 1).All(v => v == 0), "Right output remains silent.");
            var quiet = project with { Phrase = project.Phrase with { Channels = [channel with { GainDb = -6.020599913 }] } };
            Assert(Math.Abs(Rms(ReadPlan(new(quiet), 5000, 800)) / Rms(output) - .5) < .0001, "Channel gain is applied once.");
        });
        Check("layer mute solo and master gain are independent controls", () =>
        {
            var project = TwoLayers(); var first = project.Phrase.Channels[0]; var second = project.Phrase.Channels[1];
            var plan = new ReferenceRenderPlan(project);
            double one = Rms(ReadPlan(plan, 10000, 600, solo: first.Id));
            double both = Rms(ReadPlan(plan, 10000, 600));
            Assert(Math.Abs(both / one - 2) < .0001, "Two actual editable layers sum.");
            var muted = project with { Phrase = project.Phrase with { Channels = [first, second with { Muted = true }] } };
            Assert(Math.Abs(Rms(ReadPlan(new(muted), 10000, 600)) / one - 1) < .0001, "Muted layer does not sound.");
            Assert(Peak(ReadPlan(new(muted), 10000, 600, solo: second.Id)) == 0, "Mute still applies while soloed.");
            Assert(Math.Abs(Rms(ReadPlan(new(project with { MasterGainDb = -6.020599913 }), 10000, 600)) / both - .5) < .0001, "Master gain only affects reconstruction.");
        });
        Check("brightness really removes high frequencies", () =>
        {
            var project = Project(patch: Patch(8000)); var id = project.Phrase.Channels[0].Id;
            var dark = project with { Sounds = [new LayerSound(id, 150)] };
            double bright = Rms(ReadPlan(new(project), 10000, 2000));
            Assert(Rms(ReadPlan(new(dark), 10000, 2000)) < bright * .05, "Low cutoff attenuates high-frequency material.");
        });
        Check("sweep changes sound through the phrase and supports seeking", () =>
        {
            var project = Project(patch: Patch(4000)); var id = project.Phrase.Channels[0].Id;
            project = project with { Sounds = [new LayerSound(id, 1000, 1)] };
            var plan = new ReferenceRenderPlan(project);
            Assert(Rms(ReadPlan(plan, 80000, 1500)) > Rms(ReadPlan(plan, 6000, 1500)) * 2, "Positive sweep opens brightness over time.");
        });
        Check("echo is musical delayed audio rather than a volume label", () =>
        {
            var project = Project(Note(60, 0, 120)); var id = project.Phrase.Channels[0].Id;
            var dry = new ReferenceRenderPlan(project);
            var wet = new ReferenceRenderPlan(project with { Sounds = [new LayerSound(id, 16000, 0, .5)] });
            Assert(Peak(ReadPlan(dry, 14000, 600)) == 0, "Dry short note has finished.");
            Assert(Peak(ReadPlan(wet, 14000, 600)) > .02, "Eighth-note delayed copy is audible.");
        });
        Check("effect render is exact under arbitrary read splitting and backward seeks", () =>
        {
            var project = Project(); var id = project.Phrase.Channels[0].Id;
            project = project with { Sounds = [new LayerSound(id, 135, -.7, .32)] };
            var plan = new ReferenceRenderPlan(project);
            float[] all = ReadPlan(plan, 7777, 4099), split = new float[8198];
            for (int at = 0; at < 4099; at += 173)
            {
                int take = Math.Min(173, 4099 - at);
                plan.Render(7777 + at, split.AsSpan(at * 2, take * 2), SourceMode.Reconstruction);
            }
            Assert(all.SequenceEqual(split), "Fixed finite filter history is independent of block order.");
            ReadPlan(plan, 88000, 200); Assert(all.SequenceEqual(ReadPlan(plan, 7777, 4099)), "No persistent DSP state leaks across seeking.");
        });
        Check("source loop repeats aligned reference and reconstruction at the same frame", () =>
        {
            var project = Project(); var plan = new ReferenceRenderPlan(project); var source = new ReferenceMixSource();
            source.SetScene(plan, SourceMode.Reconstruction, null, true, true, 0, 0, false);
            Assert(Read(source, 5000, 600).SequenceEqual(Read(source, 101000, 600)), "Reconstruction repeats at reference duration.");
            Assert(Math.Abs(source.SongFrameAt(101000) - 5000) < .001, "Marker uses the same frame wrapping.");
            source.SetScene(plan, SourceMode.Reference, null, true, true, 0, 0, false);
            Assert(Read(source, 5000, 600).SequenceEqual(Read(source, 101000, 600)), "Reference shares exact loop boundary.");
            source.SetScene(plan, SourceMode.Reference, null, true, false, 0, 0, false);
            Assert(Peak(Read(source, 96000, 500)) == 0, "Nonloop output is silent after the project.");
        });
        Check("live A B switching crossfades without restarting musical time", () =>
        {
            var project = Project(); var plan = new ReferenceRenderPlan(project); var source = new ReferenceMixSource();
            source.SetScene(plan, SourceMode.Reference, null, true, true, 0, 0, false);
            float[] old = Read(source, 10000, 100);
            source.SetScene(plan, SourceMode.Reconstruction, null, true, true, 0, 0);
            float[] transition = Read(source, 10100, 600), expected = ReadPlan(plan, 10100, 600);
            Assert(Math.Abs(transition[0] - .1) < 1e-6, "First transition sample retains old side.");
            Assert(transition.Skip(480).SequenceEqual(expected.Skip(480)), "New side settles after 5 ms.");
            Assert(source.SongFrameAt(10700) == 10700, "Switch did not reset cursor.");
        });
        Check("a seek flushes the read frontier before subsequent live transitions", () =>
        {
            var plan = new ReferenceRenderPlan(Project()); var source = new ReferenceMixSource();
            source.SetScene(plan, SourceMode.Reference, null, true, true, 0, 0, false);
            Read(source, 1000000, 500); source.ResetReadCursor();
            source.SetScene(plan, SourceMode.Reference, null, true, true, 0, 20000, false);
            Read(source, 0, 500);
            Assert(source.LatestReadEnd == 500, "Pre-seek queued frames cannot pin future transitions to the old frontier.");
            source.SetScene(plan, SourceMode.Reconstruction, null, true, true, 0, 20000);
            float[] settled = Read(source, 1000, 300), expected = ReadPlan(plan, 21000, 300);
            Assert(settled.SequenceEqual(expected), "A/B still works immediately after a backward seek.");
        });
        Check("editing notes and timbre replaces the audible plan", () =>
        {
            var project = Project(); var channel = project.Phrase.Channels[0];
            var source = new ReferenceMixSource();
            source.SetScene(new(project), SourceMode.Reconstruction, null, true, true, 0, 0, false);
            Assert(Peak(Read(source, 5000, 500)) > .02, "Original note sounds.");
            var erased = project with { Phrase = project.Phrase with { Channels = [channel with { Notes = [] }] } };
            source.SetScene(new(erased), SourceMode.Reconstruction, null, true, true, 0, 0);
            Assert(Peak(Read(source, 6000, 600)) == 0, "Deleted note vanishes after transition without pre-rendering.");
            channel = channel with { Timbre = Patch(1600) };
            source.SetScene(new(project with { Phrase = project.Phrase with { Channels = [channel] } }), SourceMode.Reconstruction, null, true, true, 0, 0);
            float[] values = Read(source, 7000, 2000);
            Assert(Math.Abs(Frequency(values, 48000) - 1600) < 30, "Replaced sample changes current sound.");
        });
        Check("output safety preserves ordinary dynamics and bounds invalid overload", () =>
        {
            float[] values = [.2f, -.35f, 2, -2, float.NaN, float.PositiveInfinity];
            ReferenceRenderer.ProtectPeaks(values);
            Assert(values[0] == .2f && values[1] == -.35f, "No unsolicited normalization below ceiling.");
            Assert(values.All(float.IsFinite) && Peak(values) <= 1, "Overload is finite and within full scale.");
        });
        Check("polyphony budget applies across layers and rejection preserves active plan", () =>
        {
            var project = Project(); var channel = project.Phrase.Channels[0];
            var a = channel with { Notes = Enumerable.Range(0, 65).Select(_ => Note(60, 0, 3840)).ToArray() };
            var b = a with { Id = Guid.NewGuid(), Name = "second", Notes = Enumerable.Range(0, 65).Select(_ => Note(60, 0, 3840)).ToArray() };
            var excessive = project with { Phrase = project.Phrase with { Channels = [a, b] },
                Layers = [.. project.Layers, new LayerDescription(b.Id, "second", "description", "synthesized")],
                Sounds = [.. project.Sounds, new LayerSound(b.Id)] };
            Expect<InvalidOperationException>(() => new ReferenceRenderPlan(excessive));
        });
        Check("representative live effect workload is measured without opening hardware", () =>
        {
            var project = Project(); var original = project.Phrase.Channels[0];
            var channels = Enumerable.Range(0, 8).Select(i => original with { Id = Guid.NewGuid(), Name = "layer" + i,
                Notes = Enumerable.Range(0, 4).Select(j => Note(60 + j * 3, 0, 3840)).ToArray() }).ToArray();
            project = project with { Phrase = project.Phrase with { Channels = channels },
                Layers = channels.Select(c => new LayerDescription(c.Id, c.Name, "description", "synthesized")).ToArray(),
                Sounds = channels.Select(c => new LayerSound(c.Id, 1200, .5, .3)).ToArray() };
            var plan = new ReferenceRenderPlan(project); ReadPlan(plan, 24000, 2400);
            List<double> times = [];
            for (int i = 0; i < 5; i++) { var watch = Stopwatch.StartNew(); ReadPlan(plan, 26400 + i * 2400, 2400); times.Add(watch.Elapsed.TotalMilliseconds); }
            times.Sort();
            File.WriteAllText(Path.Combine(directory, "live-performance.json"), System.Text.Json.JsonSerializer.Serialize(new
            { sampleRate = 48000, stereo = true, sourceWindowMilliseconds = 50, layers = 8, concurrentVoices = 32,
                effects = "finite low-pass sweep plus three echo taps", medianRenderMilliseconds = times[2],
                maximumRenderMilliseconds = times[^1], realAudioDeviceOpened = false }));
            Assert(times.All(double.IsFinite), "Profile is recorded, not an unstable machine-speed gate.");
        });
        Check("bounded window cache inheritance cannot retain edited note or instrument audio", () =>
        {
            var project = Project(); var previous = new ReferenceRenderPlan(project);
            ReadPlan(previous, 10000, 2400);
            var channel = project.Phrase.Channels[0]; var note = channel.Notes[0];
            foreach (var changed in new[] {
                channel with { Notes = [note with { Pitch = 67 }] },
                channel with { Notes = [note with { Velocity = .27 }] },
                channel with { Notes = [note with { LengthTick = 480 }] },
                channel with { GainDb = -12 },
                channel with { Timbre = Patch(1370) } })
            {
                var edit = project with { Phrase = project.Phrase with { Channels = [changed] } };
                Assert(ReadPlan(new ReferenceRenderPlan(edit, previous), 10000, 2400)
                    .SequenceEqual(ReadPlan(new ReferenceRenderPlan(edit), 10000, 2400)), "Inherited cached windows match a fresh render after edits.");
            }
        });
        Check("offline export uses same editable renderer with exact WAV dimensions", () =>
        {
            var project = Project(); string path = Path.Combine(directory, "reconstruction.wav");
            ReferenceRenderer.ExportAsync(project, path, true).GetAwaiter().GetResult();
            byte[] wave = File.ReadAllBytes(path);
            Assert(wave.Length == 44 + 96000 * 6 && wave.AsSpan(0, 4).SequenceEqual("RIFF"u8), "Correct finite PCM WAV duration.");
            Assert(BinaryPrimitives.ReadUInt32LittleEndian(wave.AsSpan(24)) == 48000 && BinaryPrimitives.ReadUInt16LittleEndian(wave.AsSpan(34)) == 24, "48 kHz PCM24 output.");
            var clip = ReferenceRenderer.Render(project); int sampleAt = 10000 * 2;
            int integer = wave[44 + sampleAt * 3] | wave[45 + sampleAt * 3] << 8 | wave[46 + sampleAt * 3] << 16;
            if ((integer & 0x800000) != 0) integer |= unchecked((int)0xff000000);
            Assert(Math.Abs(integer / 8388608d - clip.Samples[sampleAt]) < 1d / 8388608, "Export is the same music as streaming/offline render.");
        });
        Check("cancelled export and overwrite refusal preserve existing file", () =>
        {
            var project = Project(); string path = Path.Combine(directory, "protected.wav");
            File.WriteAllText(path, "existing");
            Expect<IOException>(() => ReferenceRenderer.ExportAsync(project, path).GetAwaiter().GetResult());
            using CancellationTokenSource cancelled = new(); cancelled.Cancel();
            Expect<OperationCanceledException>(() => ReferenceRenderer.ExportAsync(project, path, true, cancelled.Token).GetAwaiter().GetResult());
            Assert(File.ReadAllText(path) == "existing", "Failed export preserves original bytes.");
        });
        Check("constructor project and seeks never open audio device", () =>
        {
            FakeFactory factory = new(); var session = new ReferencePlaybackSession(factory);
            try
            {
                session.SetProject(Project()); session.Seek(.7); session.Mode = SourceMode.Reference;
                Wait(() => Math.Abs(session.Snapshot.PositionSeconds - .7) < .0001);
                Assert(factory.Devices.Count == 0 && !session.Snapshot.IsPlaying, "No hardware opened before explicit playback.");
            }
            finally { session.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Check("single device clock drives A B edits pause seek and preview", () =>
        {
            FakeFactory factory = new(); var session = new ReferencePlaybackSession(factory); var project = Project();
            try
            {
                session.SetProject(project); session.Play(); Wait(() => session.Snapshot.IsPlaying);
                var device = factory.Devices.Single(); Advance(device, 12000);
                Wait(() => session.Snapshot.PositionSeconds >= .249);
                double position = session.Snapshot.PositionSeconds;
                session.Mode = SourceMode.Reference; session.SetSolo(project.Phrase.Channels[0].Id);
                session.SetProject(project with { MasterGainDb = -3 }); session.Audition(project.Phrase.Channels[0], 64);
                Advance(device, 2400);
                Assert(factory.Devices.Count == 1 && session.Snapshot.PositionSeconds >= position, "Comparison switching and keyboard use one transport, no fake independent sync.");
                session.Seek(.9); Assert(Math.Abs(session.Snapshot.PositionSeconds - .9) < .001, "Pending seek marker updates immediately.");
                Wait(() => session.Snapshot.PositionSeconds >= .899);
                Advance(device, 2400); Wait(() => session.Snapshot.PositionSeconds > .94);
                session.Pause(); Wait(() => !session.Snapshot.IsPlaying);
                double paused = session.Snapshot.PositionSeconds; Thread.Sleep(20);
                Assert(Math.Abs(session.Snapshot.PositionSeconds - paused) < .001, "Paused song position is held even when preview clock runs.");
                session.Stop(); Wait(() => session.Snapshot.PositionSeconds == 0);
            }
            finally { session.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Check("keyboard preview while paused does not advance song position", () =>
        {
            FakeFactory factory = new(); var session = new ReferencePlaybackSession(factory); var project = Project();
            try
            {
                session.SetProject(project); session.Seek(.5); session.Audition(project.Phrase.Channels[0], 60, .05);
                Wait(() => factory.Devices.Count == 1 && factory.Devices[0].Started);
                var device = factory.Devices.Single();
                for (int advanced = 0; advanced < 24000 && device.Started;)
                {
                    Wait(() => !device.Started || device.PaddingFrames > 0);
                    if (!device.Started) break;
                    int take = Math.Min(240, device.PaddingFrames); device.Advance(take); advanced += take;
                    Thread.Sleep(1);
                }
                Wait(() => !device.Started);
                Assert(Math.Abs(session.Snapshot.PositionSeconds - .5) < .001 && !session.Snapshot.IsPlaying, "Preview is not secretly playing the song.");
                session.Play(); Wait(() => session.Snapshot.IsPlaying);
                Assert(Math.Abs(session.Snapshot.PositionSeconds - .5) < .001, "Music resumes from held song cursor.");
            }
            finally { session.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Check("nonloop completion and device errors reach the UI", () =>
        {
            FakeFactory factory = new(); var session = new ReferencePlaybackSession(factory);
            try
            {
                session.SetProject(Project()); session.Loop = false; session.Seek(1.95); session.Play();
                Wait(() => session.Snapshot.IsPlaying); var device = factory.Devices.Single();
                Advance(device, 2400); Wait(() => !session.Snapshot.IsPlaying);
                Assert(Math.Abs(session.Snapshot.PositionSeconds - 2) < .001 && session.Snapshot.Error is null, "Stops at finite clip end.");
                session.Play(); Wait(() => session.Snapshot.IsPlaying);
                Assert(session.Snapshot.PositionSeconds < .01, "Play after completion restarts.");
                device.Fail = true; Wait(() => session.Snapshot.Error is not null && !session.Snapshot.IsPlaying);
                Assert(session.Snapshot.Error!.Contains("test device"), "Useful device failure reaches user.");
            }
            finally { session.DisposeAsync().AsTask().GetAwaiter().GetResult(); }
        });
        Console.WriteLine($"Audio: {count} groups passed"); return count;

        void Check(string label, Action action)
        {
            try { action(); count++; }
            catch (Exception ex) { throw new InvalidOperationException("Audio check failed: " + label, ex); }
        }
    }

    internal static void BenchmarkCase(string directory, string preparedCase)
    {
        Directory.CreateDirectory(directory);
        ReferenceProject project = CaseArchive.LoadAsync(preparedCase).GetAwaiter().GetResult();
        var buildWatch = Stopwatch.StartNew(); var plan = new ReferenceRenderPlan(project); buildWatch.Stop();
        // Warm the JIT on a different plan. The measured plan's voice and dry caches start cold.
        ReadPlan(new ReferenceRenderPlan(project), 0, 2400);
        List<object> windows = []; List<double> elapsed = [];
        float[] buffer = new float[4800];
        for (long at = 0; at < plan.FrameCount; at += 2400)
        {
            int take = (int)Math.Min(2400, plan.FrameCount - at);
            var watch = Stopwatch.StartNew(); plan.Render(at, buffer.AsSpan(0, take * 2), SourceMode.Reconstruction); watch.Stop();
            elapsed.Add(watch.Elapsed.TotalMilliseconds);
            windows.Add(new { firstFrame = at, positionSeconds = at / 48000d, milliseconds = watch.Elapsed.TotalMilliseconds });
        }
        var ordered = elapsed.Order().ToArray();
        var edit = project with { Sounds = project.Sounds.Select(s => s with { BrightnessHz = 1200, Sweep = .7, EchoMix = .3 }).ToArray() };
        var edited = new ReferenceRenderPlan(edit, plan); List<double> editedTimes = [];
        for (long at = 0; at < edited.FrameCount; at += 2400)
        {
            int take = (int)Math.Min(2400, edited.FrameCount - at);
            var watch = Stopwatch.StartNew(); edited.Render(at, buffer.AsSpan(0, take * 2), SourceMode.Reconstruction); watch.Stop();
            editedTimes.Add(watch.Elapsed.TotalMilliseconds);
        }
        var report = new { casePath = Path.GetFullPath(preparedCase), layers = project.Layers.Count,
            durationSeconds = project.DurationSeconds, sourceWindowMilliseconds = 50,
            planBuildMilliseconds = buildWatch.Elapsed.TotalMilliseconds,
            firstPassMedianMilliseconds = ordered[ordered.Length / 2], firstPassMaximumMilliseconds = ordered[^1],
            firstPassWindowsAbove25Milliseconds = elapsed.Count(v => v > 25),
            editedEffectsMedianMilliseconds = editedTimes.Order().ElementAt(editedTimes.Count / 2),
            editedEffectsMaximumMilliseconds = editedTimes.Max(), realAudioDeviceOpened = false, windows };
        File.WriteAllText(Path.Combine(directory, "actual-case-performance.json"), System.Text.Json.JsonSerializer.Serialize(report,
            new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine($"Actual-case render: {elapsed.Count} windows, median {ordered[ordered.Length / 2]:F3} ms; max {ordered[^1]:F3} ms; effects max {editedTimes.Max():F3} ms");
    }

    private static ReferenceProject Project(PhraseNote? note = null, InstrumentPatch? patch = null)
    {
        var channel = new PhraseChannel(Guid.NewGuid(), "lead", patch ?? Patch(), EditorMode.PianoRoll, 60, 0, false,
            [note ?? Note(60, 0, 3840)]);
        var phrase = new PhraseDocument(Guid.NewGuid(), "test", 120, 1, [channel]);
        return new(phrase, new PcmClip(48000, 2, Enumerable.Repeat(.1f, 192000).ToArray(), "reference"),
            new CaseInfo("case", "input.wav", 0, 2, new string('0', 64), "summary", "analysis"),
            [new LayerDescription(channel.Id, "lead", "explanation", "synthesized")], [new LayerSound(channel.Id)]);
    }
    private static ReferenceProject TwoLayers()
    {
        var project = Project(); var other = project.Phrase.Channels[0] with { Id = Guid.NewGuid(), Name = "second", Notes = [Note(60, 0, 3840)] };
        return project with { Phrase = project.Phrase with { Channels = [project.Phrase.Channels[0], other] },
            Layers = [.. project.Layers, new LayerDescription(other.Id, "second", "explanation", "synthesized")],
            Sounds = [.. project.Sounds, new LayerSound(other.Id)] };
    }
    private static PhraseNote Note(int pitch, long start, long length) => new(Guid.NewGuid(), pitch, start, length, 1);
    private static InstrumentPatch Patch(double frequency = 400)
    {
        float[] samples = Enumerable.Range(0, 48000).Select(i => (float)(.1 * Math.Sin(2 * Math.PI * frequency * i / 48000))).ToArray();
        return new(new PcmClip(48000, 1, samples, "sine"), new InstrumentSettings(60, .002, .002, 1, .015, true, 480, 47520, .005), "sine");
    }
    private static float[] ReadPlan(ReferenceRenderPlan plan, long at, int count, SourceMode mode = SourceMode.Reconstruction, Guid? solo = null)
    {
        float[] values = new float[count * 2]; plan.Render(at, values, mode, solo); return values;
    }
    private static float[] Read(IAudioFrameSource source, long at, int count)
    {
        float[] values = new float[count * 2]; Assert(source.ReadFrames(at, values) == count, "Full frame read."); return values;
    }
    private static double Peak(float[] values) => values.Select(v => Math.Abs((double)v)).DefaultIfEmpty().Max();
    private static double Rms(float[] values) => Math.Sqrt(values.Select(v => (double)v * v).Average());
    private static double Frequency(float[] stereo, int rate)
    {
        int crossings = 0; for (int i = 2; i < stereo.Length; i += 2) if (stereo[i - 2] <= 0 && stereo[i] > 0) crossings++;
        return crossings * rate / (stereo.Length / 2d);
    }
    private static void Assert(bool value, string message) { if (!value) throw new Exception(message); }
    private static void Expect<T>(Action action) where T : Exception
    {
        try { action(); } catch (T) { return; } throw new Exception("Expected " + typeof(T).Name);
    }
    private static void Wait(Func<bool> condition)
    {
        var watch = Stopwatch.StartNew(); while (!condition())
        { if (watch.Elapsed.TotalSeconds > 10) throw new TimeoutException("Audio worker did not reach expected state."); Thread.Sleep(2); }
    }
    private static void Advance(FakeDevice device, int frames)
    {
        int remaining = frames;
        while (remaining > 0)
        {
            Wait(() => device.PaddingFrames > 0); int take = Math.Min(remaining, device.PaddingFrames);
            device.Advance(take); remaining -= take;
        }
    }
    private sealed class FakeFactory : IPlaybackDeviceFactory
    {
        private readonly object gate = new(); private readonly List<FakeDevice> devices = [];
        internal IReadOnlyList<FakeDevice> Devices { get { lock (gate) return devices.ToArray(); } }
        public IPlaybackDevice Open() { lock (gate) { var device = new FakeDevice(); devices.Add(device); return device; } }
    }
    private sealed class FakeDevice : IPlaybackDevice
    {
        private readonly object gate = new(); private int padding; private long played; private bool started;
        internal bool Fail;
        internal bool Started { get { lock (gate) return started; } }
        public int SampleRate => 48000;
        public int Channels => 2;
        public int BufferFrames => 2400;
        public int PaddingFrames { get { lock (gate) return padding; } }
        public double PlayedFrames { get { lock (gate) { if (Fail) throw new IOException("test device disconnected"); return played; } } }
        public void Write(ReadOnlySpan<float> values) { lock (gate) padding += values.Length / 2; }
        public void Start() { lock (gate) started = true; }
        public void Stop() { lock (gate) started = false; }
        public void Reset() { lock (gate) { played = 0; padding = 0; } }
        public void Dispose() { lock (gate) started = false; }
        internal void Advance(int frames) { lock (gate) { if (!started) return; int take = Math.Min(frames, padding); padding -= take; played += take; } }
    }
}
