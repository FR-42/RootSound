using System.Buffers.Binary;
using RootSound.SampleEditor.Core;
using RootSound.SampleEditor.Playback;

namespace RootSound.SampleEditor.Tests;

internal static class PlaybackChecks
{
    internal static int Run()
    {
        InertConstruction();
        AudibleCursorAndPause();
        SeekFlushesAndPreservesTransport();
        QueuedRatesFollowTheAudibleClock();
        EndAndReplay();
        UnderrunDoesNotSkipSource();
        ReadStallRebasesNewPacket();
        FailedDeviceCanRetry();
        ShortReadStopsPlayback();
        RateValidationAndResolution();
        ResamplingAndChannelMapping();
        AntiAliasingAndFiniteOutput();
        EndpointEncoding();
        WorkerDisposalJoinsWithoutHardware();
        SeekTicketsAcknowledgeCoalescedCommands();
        FailedSeekRestartDoesNotAcknowledgeTicket();
        return 16;
    }

    private static void InertConstruction()
    {
        MemorySource source = Ramp(48000);
        FakeFactory factory = new();
        using PlaybackCore core = new(source, factory);
        Equal(0, factory.Opens, "Construction opened hardware");
        core.Seek(24000); core.SetRate(.725); core.Pause(); core.Poll();
        Equal(0, factory.Opens, "Paused controls opened hardware");
        Near(24000, core.Snapshot.PositionFrames, "Paused seek");
        Near(.725, core.Snapshot.Rate, "Paused rate");
        Equal(0, source.ReadCalls, "Paused controls read samples");
    }

    private static void AudibleCursorAndPause()
    {
        MemorySource source = Ramp(48000);
        FakeFactory factory = new();
        using PlaybackCore core = new(source, factory);
        core.Play();
        FakeDevice device = factory.Last!;
        Equal(2400, device.PaddingFrames, "Bounded 50 ms queue");
        Near(0, core.Snapshot.PositionFrames, "Submitted data moved the audible cursor");
        device.Advance(480); core.Poll();
        Near(480, core.Snapshot.PositionFrames, "Cursor must follow actual consumed frames");
        device.Advance(123); core.Pause();
        Near(603, core.Snapshot.PositionFrames, "Pause captured frozen device clock");
        Require(!core.Snapshot.IsPlaying && !device.Running, "Pause did not stop device");
        Equal(0, device.PaddingFrames, "Pause retained queued audio");
        device.Advance(999); core.Poll();
        Near(603, core.Snapshot.PositionFrames, "Paused cursor drifted");
        core.Play();
        Near(603 / 48000d, device.Packets[^1][0], "Resume restarted at queued rather than audible position", 1e-7);
        Equal(1, factory.Opens, "Pause/resume unnecessarily reopened output");
    }

    private static void SeekFlushesAndPreservesTransport()
    {
        FakeFactory factory = new();
        using PlaybackCore core = new(Ramp(48000), factory);
        core.Play(); factory.Last!.Advance(100); core.Poll();
        int resets = factory.Last.Resets;
        core.Seek(12000);
        Require(core.Snapshot.IsPlaying, "Playing seek paused transport");
        Equal(resets + 1, factory.Last.Resets, "Seek did not flush old queued audio");
        Near(.25, factory.Last.Packets[^1][0], "Seek output still contains old audio");
        Near(12000, core.Snapshot.PositionFrames, "Seek cursor");
        factory.Last.Advance(500); core.Poll();
        Near(12500, core.Snapshot.PositionFrames, "Seek rebase mapping");
        core.Pause(); core.Seek(-200);
        Require(!core.Snapshot.IsPlaying, "Paused seek started audio");
        Near(0, core.Snapshot.PositionFrames, "Negative seek clamp");
        core.Seek(90000);
        Near(48000, core.Snapshot.PositionFrames, "End seek clamp");
        core.Play(); core.Seek(48000);
        Require(!core.Snapshot.IsPlaying, "Seeking to end kept output running");
    }

    private static void QueuedRatesFollowTheAudibleClock()
    {
        FakeFactory factory = new();
        using PlaybackCore core = new(Ramp(48000), factory);
        core.Play();
        FakeDevice device = factory.Last!;
        device.Advance(480); core.Poll(); // 0..2880 is still queued at 1x.
        int resets = device.Resets;
        core.SetRate(1.5);
        device.Advance(480); core.Poll(); // output 2880..3360 is 1.5x.
        Equal(resets, device.Resets, "Rate change flushed playback");
        Near(960, core.Snapshot.PositionFrames, "Rate change moved pre-existing queued audio");
        device.Advance(1920); core.Poll();
        Near(2880, core.Snapshot.PositionFrames, "Old-rate boundary");
        device.Advance(240); core.Poll();
        Near(3240, core.Snapshot.PositionFrames, "New-rate audible mapping");
        core.Pause();
        Near(3240, core.Snapshot.PositionFrames, "Rate-aware pause mapping");
        Near(1.5, core.Snapshot.Rate, "Rate not retained after pause");
    }

    private static void EndAndReplay()
    {
        FakeFactory factory = new();
        using PlaybackCore core = new(Ramp(1000), factory);
        core.Play();
        Equal(1000, factory.Last!.PaddingFrames, "Short file over-read");
        factory.Last.Advance(999); core.Poll();
        Require(core.Snapshot.IsPlaying, "Stopped before last sample");
        factory.Last.Advance(1); core.Poll();
        Require(!core.Snapshot.IsPlaying, "Did not stop at end");
        Near(1000, core.Snapshot.PositionFrames, "Final cursor");
        Equal(0, factory.Last.PaddingFrames, "Completed audio queue not flushed");
        core.Play();
        Near(0, core.Snapshot.PositionFrames, "Play at end did not restart");
        Near(0, factory.Last.Packets[^1][0], "Replay did not begin at source start");
        core.Dispose();
        Require(factory.Last.Disposed && !factory.Last.Running, "Output not released");
    }

    private static void UnderrunDoesNotSkipSource()
    {
        FakeFactory factory = new();
        using PlaybackCore core = new(Ramp(48000), factory);
        core.Play();
        FakeDevice device = factory.Last!;
        device.Advance(4000); core.Poll(); // Clock passed the empty queue during a delayed worker.
        Near(2400, core.Snapshot.PositionFrames, "Underrun skipped source samples");
        Near(2400 / 48000d, device.Packets[^1][0], "Underrun refill skipped unplayed music", 1e-7);
        device.Advance(200); core.Poll();
        Near(2600, core.Snapshot.PositionFrames, "Underrun timeline was not rebased");
    }

    private static void FailedDeviceCanRetry()
    {
        FakeFactory factory = new();
        using PlaybackCore core = new(Ramp(48000), factory);
        core.Play(); factory.Last!.Advance(200); core.Poll();
        factory.Last.ThrowOnClock = true;
        try { core.Poll(); throw new InvalidOperationException("Device error was ignored"); }
        catch (IOException ex) { core.Fail(ex); }
        Require(!core.Snapshot.IsPlaying && core.Snapshot.Error is not null, "Failure left phantom playback");
        Require(factory.Last.Disposed, "Failed output not released");
        Near(200, core.Snapshot.PositionFrames, "Failure lost known audible position");
        core.Play();
        Equal(2, factory.Opens, "Retry reused a failed device");
        Require(core.Snapshot.IsPlaying && core.Snapshot.Error is null, "Retry did not clear error");
        Near(200 / 48000d, factory.Last!.Packets[^1][0], "Retry lost source position", 1e-7);
    }

    private static void ReadStallRebasesNewPacket()
    {
        MemorySource source = Ramp(48000);
        FakeFactory factory = new();
        using PlaybackCore core = new(source, factory);
        core.Play();
        FakeDevice device = factory.Last!;
        device.Advance(480);
        source.BeforeRead = () => device.Advance(3000); // Disk stalls after Fill's first clock read.
        core.Poll();
        source.BeforeRead = null;
        Near(2400, core.Snapshot.PositionFrames, "Read stall did not publish last audible source boundary");
        Near(2400 / 48000d, device.Packets[^1][0], "Read stall skipped source audio", 1e-7);
        device.Advance(120); core.Poll();
        Near(2520, core.Snapshot.PositionFrames, "Read stall used pre-render clock and moved cursor ahead");
    }

    private static void ShortReadStopsPlayback()
    {
        MemorySource source = Ramp(48000); source.ShortReads = true;
        FakeFactory factory = new();
        using PlaybackCore core = new(source, factory);
        try { core.Play(); throw new InvalidOperationException("Incomplete source accepted"); }
        catch (EndOfStreamException ex) { core.Fail(ex); }
        Require(!core.Snapshot.IsPlaying && core.Snapshot.Error is not null && factory.Last!.Disposed,
            "Read failure was hidden");
    }

    private static void RateValidationAndResolution()
    {
        using PlaybackCore core = new(Ramp(48000), new FakeFactory());
        foreach (double rate in new[] { double.NaN, double.PositiveInfinity, double.NegativeInfinity, .4999, 1.5001 })
            Throws<ArgumentOutOfRangeException>(() => core.SetRate(rate));
        core.SetRate(.5); Near(.5, core.Snapshot.Rate, "Minimum rate");
        core.SetRate(1.5); Near(1.5, core.Snapshot.Rate, "Maximum rate");
        core.SetRate(.7236); Near(.724, core.Snapshot.Rate, "Fine rate resolution");
        Throws<ArgumentOutOfRangeException>(() => core.Seek(double.NaN));
    }

    private static void ResamplingAndChannelMapping()
    {
        MemorySource source = new(48000, 2, Enumerable.Range(0, 1000).SelectMany(i => new[] { i / 1000f, -i / 1000f }).ToArray());
        float[] stereo = new float[100];
        PcmResampler.Render(source, 120, 1, stereo, 2);
        for (int i = 0; i < 50; i++)
        {
            Near((120 + i) / 1000d, stereo[i * 2], "1x exact left", 1e-7);
            Near(-(120 + i) / 1000d, stereo[i * 2 + 1], "1x exact right", 1e-7);
        }
        float[] mono = new float[50]; PcmResampler.Render(source, 100, 1, mono, 1);
        Require(mono.All(value => value == 0), "Stereo to mono mapping");
        MemorySource one = new(48000, 1, Enumerable.Repeat(.25f, 1000).ToArray());
        float[] surround = new float[6 * 30]; PcmResampler.Render(one, 0, .5, surround, 6);
        for (int i = 0; i < 30; i++)
        {
            Near(.25, surround[i * 6], "Mono left at fractional rate", 1e-6);
            Near(.25, surround[i * 6 + 1], "Mono right at fractional rate", 1e-6);
            Require(surround.AsSpan(i * 6 + 2, 4).ToArray().All(value => value == 0), "Unexpected surround content");
        }
        MemorySource vocals = new(48000, 6, Enumerable.Range(0, 100).SelectMany(_ => new[] { 0f, 0f, .8f, 0f, 0f, 0f }).ToArray());
        float[] downmix = new float[40]; PcmResampler.Render(vocals, 0, 1, downmix, 2, 0x3f);
        Require(downmix.All(value => value > .15 && value < .3), "5.1 center disappeared from stereo audition");
        MemorySource customCenter = new(48000, 2, Enumerable.Range(0, 100).SelectMany(_ => new[] { .6f, .2f }).ToArray());
        float[] monoCustom = new float[10]; PcmResampler.Render(customCenter, 0, 1, monoCustom, 1, 4 | 8);
        Require(monoCustom.All(value => value > .4), "Explicit center/LFE speaker mask was ignored");
    }

    private static void AntiAliasingAndFiniteOutput()
    {
        MemorySource high = new(48000, 1, Enumerable.Range(0, 2000).Select(i => (float)Math.Sin(i * 2 * Math.PI * .45)).ToArray());
        float[] fast = new float[500];
        PcmResampler.Render(high, 100, 1.5, fast, 1);
        double rms = Math.Sqrt(fast.Sum(value => value * value) / fast.Length);
        Require(rms < .08, "Rate-up aliased ultrasonic source band into audition");
        MemorySource corrupt = new(48000, 1, new[] { float.NaN, float.PositiveInfinity, 20f, -30f, .5f });
        float[] finite = new float[5]; PcmResampler.Render(corrupt, 0, 1, finite, 1);
        Require(finite.SequenceEqual(new[] { 0f, 0f, 1f, -1f, .5f }), "Non-finite / out-of-range source escaped output");
        Throws<ArgumentException>(() => PcmResampler.Render(high, -1, 1, fast, 1));
    }

    private static void EndpointEncoding()
    {
        float[] input = [-1, 0, 1, .5f, float.NaN];
        byte[] pcm16 = new byte[10]; WasapiPlaybackDevice.Encode(input, pcm16, 16, false);
        Equal(short.MinValue, BinaryPrimitives.ReadInt16LittleEndian(pcm16), "PCM16 negative full scale");
        Equal(short.MaxValue, BinaryPrimitives.ReadInt16LittleEndian(pcm16.AsSpan(4)), "PCM16 positive full scale");
        Equal(16384, BinaryPrimitives.ReadInt16LittleEndian(pcm16.AsSpan(6)), "PCM16 half scale");
        Equal(0, BinaryPrimitives.ReadInt16LittleEndian(pcm16.AsSpan(8)), "PCM16 NaN");
        byte[] pcm24 = new byte[15]; WasapiPlaybackDevice.Encode(input, pcm24, 24, false);
        Require(pcm24.AsSpan(0, 3).SequenceEqual(new byte[] { 0, 0, 128 }), "PCM24 negative");
        Require(pcm24.AsSpan(6, 3).SequenceEqual(new byte[] { 255, 255, 127 }), "PCM24 positive");
        byte[] pcm32 = new byte[20]; WasapiPlaybackDevice.Encode(input, pcm32, 32, false);
        Equal(int.MinValue, BinaryPrimitives.ReadInt32LittleEndian(pcm32), "PCM32 negative");
        Equal(int.MaxValue, BinaryPrimitives.ReadInt32LittleEndian(pcm32.AsSpan(8)), "PCM32 positive");
        byte[] floats = new byte[20]; WasapiPlaybackDevice.Encode(input, floats, 32, true);
        Near(.5, BitConverter.Int32BitsToSingle(BinaryPrimitives.ReadInt32LittleEndian(floats.AsSpan(12))), "Float encoding");
        byte[] doubles = new byte[40]; WasapiPlaybackDevice.Encode(input, doubles, 64, true);
        Near(.5, BitConverter.Int64BitsToDouble(BinaryPrimitives.ReadInt64LittleEndian(doubles.AsSpan(24))), "Double encoding");
        byte[] pcm8 = new byte[5]; WasapiPlaybackDevice.Encode(input, pcm8, 8, false);
        Require(pcm8.SequenceEqual(new byte[] { 0, 128, 255, 192, 128 }), "PCM8 encoding");
    }

    private static void WorkerDisposalJoinsWithoutHardware()
    {
        FakeFactory factory = new();
        PlaybackEngine engine = new(Ramp(48000), factory);
        Require(factory.Opens == 0, "Engine constructor opened a device");
        engine.Play();
        Require(SpinWait.SpinUntil(() => engine.Snapshot.IsPlaying, TimeSpan.FromSeconds(3)), "Worker did not play");
        engine.Pause();
        Require(SpinWait.SpinUntil(() => !engine.Snapshot.IsPlaying, TimeSpan.FromSeconds(3)), "Worker did not pause");
        engine.DisposeAsync().AsTask().GetAwaiter().GetResult();
        Require(factory.Last!.Disposed && !engine.Snapshot.IsPlaying, "Async dispose left resources open");
        Equal(factory.OpenThread, factory.Last.DisposeThread, "Device COM lifecycle left worker");
        Throws<ObjectDisposedException>(() => engine.Play());
        engine.Dispose();
    }

    private static void SeekTicketsAcknowledgeCoalescedCommands()
    {
        using ManualResetEventSlim opening = new(false);
        using ManualResetEventSlim continueOpening = new(false);
        FakeFactory factory = new()
        {
            BeforeOpen = () =>
            {
                opening.Set();
                if (!continueOpening.Wait(TimeSpan.FromSeconds(3))) throw new TimeoutException("Test output was not released");
            }
        };
        using PlaybackEngine engine = new(Ramp(48000), factory);
        try
        {
            engine.Play();
            Require(opening.Wait(TimeSpan.FromSeconds(3)), "Worker did not enter output creation");
            long first = engine.Seek(100), second = engine.Seek(200), last = engine.Seek(300);
            Require(first > 0 && first < second && second < last, "Seek tickets were not monotonic");
            Equal(0, engine.Snapshot.SeekRevision, "Queued seek was acknowledged before applying");
            continueOpening.Set();
            Require(SpinWait.SpinUntil(() => engine.Snapshot.SeekRevision >= last, TimeSpan.FromSeconds(3)), "Latest coalesced seek was not acknowledged");
            Near(300, engine.Snapshot.PositionFrames, "Coalesced seek applied an obsolete cursor");
            Equal(last, engine.Snapshot.SeekRevision, "Seek acknowledgment did not include latest ticket");
            Equal(2, factory.Last!.Starts, "Pointer seek commands were not coalesced");
            Require(engine.Snapshot.IsPlaying, "Coalesced playing seek changed transport");
        }
        finally { continueOpening.Set(); }
    }

    private static void FailedSeekRestartDoesNotAcknowledgeTicket()
    {
        FakeFactory factory = new();
        using PlaybackEngine engine = new(Ramp(48000), factory);
        engine.Play();
        Require(SpinWait.SpinUntil(() => engine.Snapshot.IsPlaying, TimeSpan.FromSeconds(3)), "Worker did not start output");
        long successful = engine.Seek(100);
        Require(SpinWait.SpinUntil(() => engine.Snapshot.SeekRevision >= successful, TimeSpan.FromSeconds(3)), "Successful seek not acknowledged");
        factory.Last!.ThrowOnStart = true;
        long failed = engine.Seek(200);
        Require(SpinWait.SpinUntil(() => engine.Snapshot.Error is not null, TimeSpan.FromSeconds(3)), "Failed seek restart did not report error");
        Require(failed > successful && !engine.Snapshot.IsPlaying && factory.Last.Disposed, "Failed seek left output running");
        Equal(successful, engine.Snapshot.SeekRevision, "Failed seek falsely acknowledged completion");
        engine.Play();
        Require(SpinWait.SpinUntil(() => engine.Snapshot.IsPlaying && engine.Snapshot.Error is null, TimeSpan.FromSeconds(3)), "Output could not recover from failed seek");
        long recovered = engine.Seek(400);
        Require(SpinWait.SpinUntil(() => engine.Snapshot.SeekRevision >= recovered, TimeSpan.FromSeconds(3)), "Recovery seek not acknowledged");
        Near(400, engine.Snapshot.PositionFrames, "Recovery seek cursor");
    }

    private static MemorySource Ramp(int frames) => new(48000, 1, Enumerable.Range(0, frames).Select(i => i / 48000f).ToArray());
    private static void Require(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
    private static void Equal(long expected, long actual, string message) => Require(expected == actual, $"{message}: expected {expected}, got {actual}");
    private static void Near(double expected, double actual, string message, double tolerance = 1e-6) => Require(Math.Abs(expected - actual) <= tolerance, $"{message}: expected {expected}, got {actual}");
    private static void Throws<T>(Action action) where T : Exception
    {
        try { action(); } catch (T) { return; }
        throw new InvalidOperationException($"Expected {typeof(T).Name}");
    }

    private sealed class MemorySource(int sampleRate, int channels, float[] samples) : IAudioFrameSource
    {
        public int SampleRate => sampleRate;
        public int Channels => channels;
        public long FrameCount => samples.Length / channels;
        internal int ReadCalls;
        internal bool ShortReads;
        internal Action? BeforeRead;
        public int ReadFrames(long startFrame, Span<float> interleaved)
        {
            Interlocked.Increment(ref ReadCalls);
            BeforeRead?.Invoke();
            int count = (int)Math.Min(FrameCount - startFrame, interleaved.Length / Channels);
            interleaved.Clear();
            samples.AsSpan(checked((int)startFrame * Channels), count * Channels).CopyTo(interleaved);
            return ShortReads ? Math.Max(0, count - 1) : count;
        }
    }

    private sealed class FakeFactory : IPlaybackDeviceFactory
    {
        internal int Opens;
        internal int OpenThread;
        internal FakeDevice? Last;
        internal Action? BeforeOpen;
        public IPlaybackDevice Open()
        {
            Interlocked.Increment(ref Opens);
            OpenThread = Environment.CurrentManagedThreadId;
            BeforeOpen?.Invoke();
            return Last = new FakeDevice();
        }
    }

    private sealed class FakeDevice : IPlaybackDevice
    {
        public int SampleRate => 48000;
        public int Channels => 2;
        public int BufferFrames => 4800;
        public int PaddingFrames => Math.Max(0, checked((int)(submitted - Math.Floor(clock))));
        public double PlayedFrames => ThrowOnClock ? throw new IOException("device disconnected") : clock;
        internal bool Running;
        internal bool Disposed;
        internal bool ThrowOnClock;
        internal bool ThrowOnStart;
        internal int Resets;
        internal int Starts;
        internal int DisposeThread;
        internal readonly List<float[]> Packets = new();
        private long submitted;
        private double clock;
        public void Write(ReadOnlySpan<float> interleaved)
        {
            Require(!Disposed, "Wrote disposed device");
            int frames = interleaved.Length / Channels;
            Require(frames <= BufferFrames - PaddingFrames, "Overfilled device");
            submitted = Math.Max(submitted, (long)Math.Ceiling(clock)) + frames;
            Packets.Add(interleaved.ToArray());
        }
        public void Start()
        {
            Require(!Disposed, "Started disposed device");
            Starts++;
            if (ThrowOnStart) throw new IOException("device start failed");
            Running = true;
        }
        public void Stop() => Running = false;
        public void Reset() { Require(!Running, "Reset running device"); Resets++; clock = 0; submitted = 0; }
        public void Advance(double frames) { if (Running) clock += frames; }
        public void Dispose() { Running = false; Disposed = true; DisposeThread = Environment.CurrentManagedThreadId; }
    }
}
