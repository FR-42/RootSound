using RootSound.SampleEditor.Analysis;
using RootSound.SampleEditor.Core;

namespace RootSound.SampleEditor.Tests;

internal static class AnalysisChecks
{
    internal static int Run()
    {
        int count = 0;
        Check("known sine produces its actual logarithmic frequency band", () =>
        {
            FakeSource source = Tone(8192, 16384, 1, 1000, 1);
            AnalysisFrame frame = AudioAnalysis.Analyze(source, 4096, 12288, 24, 128);
            int column = frame.Width / 2;
            int strongest = Enumerable.Range(0, frame.Height).MaxBy(row => frame.Intensities[row * frame.Width + column]);
            double frequency = AudioAnalysis.HzForRow(strongest + 0.5, frame.Height, source.SampleRate);
            Require(Math.Abs(Math.Log(frequency / 1000)) < 0.06, $"Expected 1000 Hz, found {frequency} Hz.");
            Require(frame.Intensities[strongest * frame.Width + column] >= 253, "Full scale bin-centred sine reaches 0 dB.");
            Require(frame.Intensities[column] < 90, "Unrelated high frequencies remain dark.");
        });
        Check("fixed decibel scale survives different source amplitudes", () =>
        {
            AnalysisFrame loud = AudioAnalysis.Analyze(Tone(8192, 8192, 1, 1000, 1), 2048, 6144, 8, 128);
            AnalysisFrame quiet = AudioAnalysis.Analyze(Tone(8192, 8192, 1, 1000, 0.1), 2048, 6144, 8, 128);
            byte loudValue = Strongest(loud, 4), quietValue = Strongest(quiet, 4);
            Require(loudValue >= 253 && Math.Abs(quietValue - 198) <= 2, "A 20 dB change retains its absolute brightness difference.");
        });
        Check("opposed stereo channels do not erase each other", () =>
        {
            FakeSource source = new(8192, 2, 8192, (index, channel) =>
                (float)((channel == 0 ? 1 : -1) * Math.Sin(2 * Math.PI * 1000 * index / 8192)));
            AnalysisFrame result = AudioAnalysis.Analyze(source, 2048, 6144, 12, 96);
            Require(Strongest(result, 6) >= 253, "Channel powers, rather than channel samples, are combined.");
            Require(result.Minimum.All(value => value < -0.99f) && result.Maximum.All(value => value > 0.99f), "The waveform retains both channel extrema.");
            Require(result.Rms.All(value => Math.Abs(value - Math.Sqrt(0.5)) < 0.005), "Stereo RMS combines channel energy.");
        });
        Check("waveform retains isolated peaks and exact interval energy", () =>
        {
            FakeSource source = new(8000, 1, 100, (index, _) => index == 15 ? -0.9f : index == 16 ? 0.8f : 0);
            AnalysisFrame result = AudioAnalysis.Analyze(source, 0, 100, 10, 32);
            Require(result.Minimum[1] == -0.9f && result.Maximum[1] == 0.8f, "A single sample peak cannot disappear through subsampling.");
            Require(Math.Abs(result.Rms[1] - Math.Sqrt((0.9 * 0.9 + 0.8 * 0.8) / 10)) < 0.000001, "The pixel RMS uses every original sample.");
            Require(!result.WaveformApproximate && result.Minimum.Where((_, index) => index != 1).All(value => value == 0), "Exact waveform metadata and silence.");
        });
        Check("zoom interval maps to original source frames without neighbouring waveform bleed", () =>
        {
            FakeSource source = new(8000, 1, 300, (index, _) => index is >= 100 and < 200 ? 0.25f : -0.7f);
            AnalysisFrame result = AudioAnalysis.Analyze(source, 100, 200, 10, 32);
            Require(result.StartFrame == 100 && result.EndFrame == 200, "Original frame coordinates remain exact.");
            Require(result.Minimum.All(value => value == 0.25f) && result.Maximum.All(value => value == 0.25f), "Waveform excludes samples outside the selected visible interval.");
            Require(result.Rms.All(value => value == 0.25f), "Zoom preserves original amplitude.");
        });
        Check("sub-frame zoom repeats actual samples instead of fabricating empty pixels", () =>
        {
            FakeSource source = new(8000, 1, 2, (index, _) => index == 0 ? -0.5f : 0.75f);
            AnalysisFrame result = AudioAnalysis.Analyze(source, 0, 2, 20, 16);
            Require(result.Minimum.Take(10).All(value => value == -0.5f) && result.Maximum.Skip(10).All(value => value == 0.75f), "Each frame occupies its correct pixel interval.");
            Require(result.Rms.Take(10).All(value => value == 0.5f) && result.Rms.Skip(10).All(value => value == 0.75f), "Per-sample RMS remains finite.");
        });
        Check("silence and malformed floating samples produce finite dark output", () =>
        {
            FakeSource silence = new(44100, 2, 8192, (_, _) => 0);
            AnalysisFrame result = AudioAnalysis.Analyze(silence, 0, 8192, 12, 80);
            Require(result.Intensities.All(value => value == 0) && result.Minimum.All(value => value == 0) && result.Rms.All(value => value == 0), "Silence is exactly the -90 dB floor.");
            FakeSource malformed = new(8000, 1, 128, (index, _) => index % 3 == 0 ? float.NaN : index % 3 == 1 ? float.PositiveInfinity : float.NegativeInfinity);
            AnalysisFrame clean = AudioAnalysis.Analyze(malformed, 0, 128, 8, 16);
            Require(clean.Intensities.All(value => value == 0) && clean.Minimum.All(float.IsFinite) && clean.Maximum.All(float.IsFinite) && clean.Rms.All(float.IsFinite), "Nonfinite samples cannot poison the display.");
        });
        Check("analysis bounds resolution, clamps source range and accepts empty audio", () =>
        {
            FakeSource source = new(8000, 1, 0, (_, _) => 0);
            AnalysisFrame result = AudioAnalysis.Analyze(source, -100, 200, 5000, 900);
            Require(result.Width == AudioAnalysis.MaximumWidth && result.Height == AudioAnalysis.MaximumHeight, "Pixels are bounded independently of the window size.");
            Require(result.Intensities.Length == result.Width * result.Height && result.StartFrame == 0 && result.EndFrame == 0 && source.ReadCalls == 0, "Empty sources need no reads.");
            AnalysisFrame clamped = AudioAnalysis.Analyze(new FakeSource(8000, 1, 100, (_, _) => 0), -10, 500, 8, 8);
            Require(clamped.StartFrame == 0 && clamped.EndFrame == 100, "Requested intervals clamp to the original audio boundaries.");
            Expect<ArgumentOutOfRangeException>(() => AudioAnalysis.Analyze(source, 20, 10, 8, 8));
            Expect<ArgumentOutOfRangeException>(() => AudioAnalysis.Analyze(source, 0, 0, 0, 8));
        });
        Check("cancellation interrupts before work and between streaming chunks", () =>
        {
            using CancellationTokenSource already = new(); already.Cancel();
            FakeSource untouched = new(8000, 1, 100, (_, _) => 0);
            Expect<OperationCanceledException>(() => AudioAnalysis.Analyze(untouched, 0, 100, 12, 16, already.Token));
            Require(untouched.ReadCalls == 0, "Pre-cancelled work does not access the source.");
            using CancellationTokenSource during = new();
            FakeSource streaming = new(8000, 1, 80000, (_, _) => 0) { AfterRead = calls => { if (calls == 2) during.Cancel(); } };
            Expect<OperationCanceledException>(() => AudioAnalysis.Analyze(streaming, 0, streaming.FrameCount, 12, 16, during.Token));
            Require(streaming.ReadCalls == 2 && streaming.MaximumRequestedFrames <= 8192, "Long files are cancellable without unbounded allocations.");
        });
        Check("partial frame reads complete the waveform and spectral windows", () =>
        {
            FakeSource source = Tone(8192, 8192, 1, 1000, 1);
            source.MaximumReadFrames = 173;
            AnalysisFrame result = AudioAnalysis.Analyze(source, 2048, 6144, 8, 96);
            Require(Strongest(result, 4) >= 253 && result.Rms.All(value => Math.Abs(value - Math.Sqrt(0.5)) < 0.005), "Short reads do not leave internal zero-filled gaps.");
            FakeSource broken = new(8000, 1, 100, (_, _) => 0) { MaximumReadFrames = 0 };
            Expect<EndOfStreamException>(() => AudioAnalysis.Analyze(broken, 0, 100, 8, 8));
        });
        Check("logarithmic frequency coordinates agree at axes and round-trip points", () =>
        {
            Require(Math.Abs(AudioAnalysis.HzForRow(0, 300, 48000) - 24000) < 0.000001, "Top edge is Nyquist.");
            Require(Math.Abs(AudioAnalysis.HzForRow(300, 300, 48000) - 20) < 0.000001, "Bottom edge is 20 Hz.");
            foreach (double frequency in new[] { 20d, 40, 100, 440, 1000, 8000, 24000 })
                Require(Math.Abs(AudioAnalysis.HzForRow(AudioAnalysis.RowForHz(frequency, 300, 48000), 300, 48000) - frequency) < 0.000001, "The UI axis uses the analysis coordinate transform.");
        });
        return count;

        void Check(string label, Action action)
        {
            try { action(); count++; }
            catch (Exception ex) { throw new InvalidOperationException($"Analysis check failed: {label}", ex); }
        }
    }

    private static byte Strongest(AnalysisFrame frame, int column) =>
        Enumerable.Range(0, frame.Height).Max(row => frame.Intensities[row * frame.Width + column]);

    private static FakeSource Tone(int sampleRate, long frames, int channels, double frequency, double amplitude) =>
        new(sampleRate, channels, frames, (index, _) => (float)(amplitude * Math.Sin(2 * Math.PI * frequency * index / sampleRate)));

    private static void Require(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException(message);
    }

    private static void Expect<T>(Action action) where T : Exception
    {
        try { action(); }
        catch (T) { return; }
        throw new InvalidOperationException($"Expected {typeof(T).Name}.");
    }

    private sealed class FakeSource(int sampleRate, int channels, long frames, Func<long, int, float> sample) : IAudioFrameSource
    {
        public int SampleRate => sampleRate;
        public int Channels => channels;
        public long FrameCount => frames;
        internal int ReadCalls { get; private set; }
        internal int MaximumRequestedFrames { get; private set; }
        internal int MaximumReadFrames { get; set; } = int.MaxValue;
        internal Action<int>? AfterRead { get; init; }

        public int ReadFrames(long startFrame, Span<float> interleaved)
        {
            if (interleaved.Length % channels != 0 || startFrame < 0 || startFrame > frames)
                throw new ArgumentException("Invalid source request.");
            int requested = interleaved.Length / channels;
            MaximumRequestedFrames = Math.Max(MaximumRequestedFrames, requested);
            int count = (int)Math.Min(Math.Min(requested, MaximumReadFrames), frames - startFrame);
            interleaved.Clear();
            for (int frame = 0; frame < count; frame++)
                for (int channel = 0; channel < channels; channel++)
                    interleaved[frame * channels + channel] = sample(startFrame + frame, channel);
            AfterRead?.Invoke(++ReadCalls);
            return count;
        }
    }
}
