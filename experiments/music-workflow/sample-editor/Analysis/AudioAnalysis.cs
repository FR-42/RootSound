using RootSound.SampleEditor.Core;

namespace RootSound.SampleEditor.Analysis;

/// <summary>
/// Analyses disk-backed audio without decoding or retaining the entire file in memory.
/// Call on a background worker; cancellation interrupts both waveform scanning and STFT columns.
/// </summary>
public static class AudioAnalysis
{
    public const int MaximumWidth = 2048;
    public const int MaximumHeight = 384;
    public const double MinimumDecibels = -90;
    private const int WaveChunkFrames = 8192;

    public static AnalysisFrame Analyze(IAudioFrameSource source, long startFrame, long endFrame,
        int width, int height, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(source);
        if (source.SampleRate <= 0 || source.Channels is < 1 or > 32 || source.FrameCount < 0)
            throw new ArgumentException("Invalid audio source metadata.", nameof(source));
        if (width <= 0) throw new ArgumentOutOfRangeException(nameof(width));
        if (height <= 0) throw new ArgumentOutOfRangeException(nameof(height));
        if (endFrame < startFrame) throw new ArgumentOutOfRangeException(nameof(endFrame));
        cancellationToken.ThrowIfCancellationRequested();

        width = Math.Min(width, MaximumWidth);
        height = Math.Min(height, MaximumHeight);
        long first = Math.Clamp(startFrame, 0, source.FrameCount);
        long last = Math.Clamp(endFrame, first, source.FrameCount);
        AnalysisFrame result = new(first, last, width, height, new byte[checked(width * height)],
            new float[width], new float[width], new float[width]);
        if (first == last) return result;

        BuildWaveform(source, result, cancellationToken);
        BuildSpectrogram(source, result, cancellationToken);
        return result;
    }

    /// <summary>The same logarithmic frequency coordinate used by the spectrogram, including edges.</summary>
    public static double HzForRow(double row, int height, int sampleRate)
    {
        if (height <= 0) throw new ArgumentOutOfRangeException(nameof(height));
        if (sampleRate <= 0) throw new ArgumentOutOfRangeException(nameof(sampleRate));
        double maximum = sampleRate / 2d;
        double minimum = Math.Min(20, maximum / 2);
        return minimum * Math.Pow(maximum / minimum, 1 - Math.Clamp(row / height, 0, 1));
    }

    public static double RowForHz(double frequency, int height, int sampleRate)
    {
        if (height <= 0) throw new ArgumentOutOfRangeException(nameof(height));
        if (sampleRate <= 0) throw new ArgumentOutOfRangeException(nameof(sampleRate));
        double maximum = sampleRate / 2d;
        double minimum = Math.Min(20, maximum / 2);
        double bounded = Math.Clamp(double.IsFinite(frequency) ? frequency : minimum, minimum, maximum);
        return height * (1 - Math.Log(bounded / minimum) / Math.Log(maximum / minimum));
    }

    private static void BuildWaveform(IAudioFrameSource source, AnalysisFrame result, CancellationToken token)
    {
        int width = result.Width, channels = source.Channels;
        long span = result.EndFrame - result.StartFrame;
        float[] buffer = new float[checked(WaveChunkFrames * channels)];
        double[] squared = new double[width];
        long[] counts = new long[width];
        Array.Fill(result.Minimum, float.PositiveInfinity);
        Array.Fill(result.Maximum, float.NegativeInfinity);
        long position = result.StartFrame;
        while (position < result.EndFrame)
        {
            token.ThrowIfCancellationRequested();
            int requested = (int)Math.Min(WaveChunkFrames, result.EndFrame - position);
            int read = Read(source, position, buffer.AsSpan(0, requested * channels), requested);
            if (read == 0) throw new EndOfStreamException("The audio source ended during waveform analysis.");
            for (int frame = 0; frame < read; frame++)
            {
                int pixel = PixelForFrame(position + frame - result.StartFrame, span, width);
                for (int channel = 0; channel < channels; channel++)
                {
                    float value = Finite(buffer[frame * channels + channel]);
                    result.Minimum[pixel] = Math.Min(result.Minimum[pixel], value);
                    result.Maximum[pixel] = Math.Max(result.Maximum[pixel], value);
                    squared[pixel] += (double)value * value;
                    counts[pixel]++;
                }
            }
            position += read;
        }

        // At sub-frame zoom each source sample occupies multiple pixels. Repeat the exact
        // nearest sample rather than drawing fabricated gaps between the available samples.
        if (span < width)
        {
            float[] single = new float[channels];
            long previousFrame = -1;
            float minimum = 0, maximum = 0, rms = 0;
            for (int pixel = 0; pixel < width; pixel++)
            {
                token.ThrowIfCancellationRequested();
                long frame = result.StartFrame + (long)Math.Floor((double)pixel * span / width);
                if (frame != previousFrame)
                {
                    if (Read(source, frame, single, 1) != 1)
                        throw new EndOfStreamException("The audio source ended during waveform analysis.");
                    minimum = float.PositiveInfinity; maximum = float.NegativeInfinity;
                    double sum = 0;
                    for (int channel = 0; channel < channels; channel++)
                    {
                        float value = Finite(single[channel]);
                        minimum = Math.Min(minimum, value); maximum = Math.Max(maximum, value);
                        sum += (double)value * value;
                    }
                    rms = (float)Math.Sqrt(sum / channels);
                    previousFrame = frame;
                }
                result.Minimum[pixel] = minimum;
                result.Maximum[pixel] = maximum;
                result.Rms[pixel] = rms;
            }
        }
        else
        {
            for (int pixel = 0; pixel < width; pixel++)
            {
                if (counts[pixel] == 0)
                {
                    result.Minimum[pixel] = result.Maximum[pixel] = 0;
                    continue;
                }
                result.Rms[pixel] = (float)Math.Sqrt(squared[pixel] / counts[pixel]);
            }
        }
    }

    private static void BuildSpectrogram(IAudioFrameSource source, AnalysisFrame result, CancellationToken token)
    {
        int fftSize = source.SampleRate > 96000 ? 8192 : 4096;
        int channels = source.Channels, bins = fftSize / 2 + 1;
        float[] samples = new float[checked(fftSize * channels)];
        double[] real = new double[fftSize], imaginary = new double[fftSize];
        double[] powers = new double[bins], window = new double[fftSize];
        double windowSum = 0;
        for (int index = 0; index < fftSize; index++)
        {
            window[index] = 0.5 - 0.5 * Math.Cos(2 * Math.PI * index / (fftSize - 1));
            windowSum += window[index];
        }
        double normalisation = 4 / (windowSum * windowSum * channels);
        int[] lowBins = new int[result.Height], highBins = new int[result.Height];
        for (int row = 0; row < result.Height; row++)
        {
            lowBins[row] = Math.Clamp((int)Math.Floor(HzForRow(row + 1, result.Height, source.SampleRate) * fftSize / source.SampleRate), 1, bins - 1);
            highBins[row] = Math.Clamp((int)Math.Ceiling(HzForRow(row, result.Height, source.SampleRate) * fftSize / source.SampleRate), lowBins[row], bins - 1);
        }

        long span = result.EndFrame - result.StartFrame;
        for (int column = 0; column < result.Width; column++)
        {
            token.ThrowIfCancellationRequested();
            long center = result.StartFrame + Math.Min(span - 1, (long)Math.Floor((column + 0.5) * span / result.Width));
            long windowStart = center - fftSize / 2;
            long readStart = Math.Max(0, windowStart);
            int padding = (int)(readStart - windowStart);
            int requested = (int)Math.Min(fftSize - padding, source.FrameCount - readStart);
            Array.Clear(samples);
            if (requested > 0)
            {
                int total = 0;
                while (total < requested)
                {
                    token.ThrowIfCancellationRequested();
                    int read = Read(source, readStart + total,
                        samples.AsSpan((padding + total) * channels, (requested - total) * channels), requested - total);
                    if (read == 0) throw new EndOfStreamException("The audio source ended during spectral analysis.");
                    total += read;
                }
            }
            Array.Clear(powers);
            for (int channel = 0; channel < channels; channel++)
            {
                token.ThrowIfCancellationRequested();
                for (int index = 0; index < fftSize; index++) real[index] = Finite(samples[index * channels + channel]) * window[index];
                Array.Clear(imaginary);
                Radix2Fft.Transform(real, imaginary);
                for (int bin = 0; bin < bins; bin++) powers[bin] += (real[bin] * real[bin] + imaginary[bin] * imaginary[bin]) * normalisation;
            }
            for (int row = 0; row < result.Height; row++)
            {
                double power = 0;
                for (int bin = lowBins[row]; bin <= highBins[row]; bin++) power = Math.Max(power, powers[bin]);
                double decibels = power > 0 ? 10 * Math.Log10(power) : MinimumDecibels;
                double scaled = Math.Clamp((decibels - MinimumDecibels) / -MinimumDecibels, 0, 1);
                result.Intensities[row * result.Width + column] = (byte)Math.Round(scaled * 255);
            }
        }
    }

    private static int PixelForFrame(long relativeFrame, long span, int width) =>
        Math.Clamp((int)((double)relativeFrame * width / span), 0, width - 1);

    private static float Finite(float value) => float.IsFinite(value) ? value : 0;

    private static int Read(IAudioFrameSource source, long position, Span<float> buffer, int requested)
    {
        int read = source.ReadFrames(position, buffer);
        if (read < 0 || read > requested) throw new InvalidDataException("The audio source returned an invalid frame count.");
        return read;
    }
}
