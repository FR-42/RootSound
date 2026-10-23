using System.Buffers;
using System.Numerics;
using RootSound.SampleEditor.Core;

namespace RootSound.SampleEditor.Playback;

/// <summary>Bounded windowed-sinc resampling for audition; exported samples are not resampled.</summary>
internal static class PcmResampler
{
    private const int BaseRadius = 16;

    internal static void Render(IAudioFrameSource source, double firstFrame, double sourceStep, Span<float> destination, int outputChannels, uint sourceChannelMask = 0)
    {
        if (outputChannels < 1 || destination.Length % outputChannels != 0 || !double.IsFinite(firstFrame)
            || firstFrame < 0 || !double.IsFinite(sourceStep) || sourceStep <= 0)
            throw new ArgumentException("播放采样参数无效。");
        int frameCount = destination.Length / outputChannels;
        if (frameCount == 0) return;
        int radius = checked((int)Math.Ceiling(BaseRadius * Math.Max(1, sourceStep)));
        long readStart = Math.Max(0, (long)Math.Floor(firstFrame) - radius);
        long readEnd = Math.Min(source.FrameCount, checked((long)Math.Floor(firstFrame + (frameCount - 1) * sourceStep) + radius + 1));
        int readFrames = checked((int)(readEnd - readStart));
        if (readFrames < 1) { destination.Clear(); return; }
        int inputSamples = checked(readFrames * source.Channels);
        float[] rented = ArrayPool<float>.Shared.Rent(inputSamples);
        double[] weightBuffer = ArrayPool<double>.Shared.Rent(checked(radius * 2));
        int[] indexBuffer = ArrayPool<int>.Shared.Rent(checked(radius * 2));
        try
        {
            Span<float> input = rented.AsSpan(0, inputSamples);
            if (source.ReadFrames(readStart, input) != readFrames) throw new EndOfStreamException("导入的音频数据不完整。");
            double cutoff = Math.Min(1, 1 / sourceStep);
            Span<double> weights = weightBuffer.AsSpan(0, radius * 2);
            Span<int> indexes = indexBuffer.AsSpan(0, radius * 2);
            Span<float> channels = stackalloc float[32];
            Span<double> leftWeights = stackalloc double[32];
            Span<double> rightWeights = stackalloc double[32];
            BuildStereoWeights(source.Channels, sourceChannelMask, leftWeights, rightWeights);
            for (int frame = 0; frame < frameCount; frame++)
            {
                double sourcePosition = firstFrame + frame * sourceStep;
                long center = (long)Math.Floor(sourcePosition);
                channels.Clear();
                if (cutoff == 1 && Math.Abs(sourcePosition - center) < 1e-9)
                {
                    int offset = checked((int)(Math.Clamp(center, 0, source.FrameCount - 1) - readStart)) * source.Channels;
                    input.Slice(offset, source.Channels).CopyTo(channels);
                }
                else
                {
                    double total = 0;
                    int count = 0;
                    for (long index = center - radius + 1; index <= center + radius; index++)
                    {
                        if (index < 0 || index >= source.FrameCount) continue;
                        double distance = sourcePosition - index;
                        double angle = Math.PI * distance * cutoff;
                        double sinc = Math.Abs(angle) < 1e-12 ? 1 : Math.Sin(angle) / angle;
                        double window = .5 + .5 * Math.Cos(Math.PI * distance / radius);
                        double weight = cutoff * sinc * window;
                        weights[count] = weight;
                        indexes[count++] = checked((int)(index - readStart)) * source.Channels;
                        total += weight;
                    }
                    if (Math.Abs(total) > 1e-12)
                        for (int channel = 0; channel < source.Channels; channel++)
                        {
                            double sum = 0;
                            for (int tap = 0; tap < count; tap++) sum += input[indexes[tap] + channel] * weights[tap];
                            channels[channel] = (float)(sum / total);
                        }
                }
                MapChannels(channels[..source.Channels], destination.Slice(frame * outputChannels, outputChannels), leftWeights, rightWeights);
            }
        }
        finally
        {
            ArrayPool<float>.Shared.Return(rented);
            ArrayPool<double>.Shared.Return(weightBuffer);
            ArrayPool<int>.Shared.Return(indexBuffer);
        }
    }

    private static void MapChannels(ReadOnlySpan<float> input, Span<float> output, ReadOnlySpan<double> leftWeights, ReadOnlySpan<double> rightWeights)
    {
        output.Clear();
        if (input.Length == output.Length)
        {
            for (int channel = 0; channel < output.Length; channel++) output[channel] = Clean(input[channel]);
            return;
        }
        // Fold center/surround content into the main pair when the endpoint has fewer
        // channels. Dropping a 5.1 center would make vocals disappear from the audition.
        double left = 0, right = 0;
        for (int channel = 0; channel < input.Length; channel++)
        {
            float value = Clean(input[channel]);
            left += value * leftWeights[channel];
            right += value * rightWeights[channel];
        }
        if (output.Length == 1)
        {
            output[0] = (float)((left + right) / 2);
            return;
        }
        output[0] = (float)left; output[1] = (float)right;
    }

    private static void BuildStereoWeights(int channels, uint mask, Span<double> left, Span<double> right)
    {
        if (channels == 1) { left[0] = right[0] = 1; return; }
        if (mask == 0 || BitOperations.PopCount(mask) != channels)
            mask = channels switch { 2 => 3, 3 => 7, 4 => 0x33, 5 => 0x37, 6 => 0x3f, 7 => 0x70f, 8 => 0x63f, _ => 0 };
        double leftTotal = 0, rightTotal = 0;
        for (int channel = 0; channel < channels; channel++)
        {
            uint speaker = mask == 0 ? 0 : mask & unchecked(0u - mask);
            if (mask != 0) mask &= ~speaker;
            (double l, double r) = speaker switch
            {
                1 => (1, 0), 2 => (0, 1), 4 => (.7071067811865476, .7071067811865476),
                8 => (.5, .5), 16 or 64 or 512 => (.7071067811865476, 0),
                32 or 128 or 1024 => (0, .7071067811865476),
                256 or 2048 or 8192 or 65536 => (.5, .5),
                4096 or 32768 => (.5, 0), 16384 or 131072 => (0, .5),
                _ => channel % 2 == 0 ? (.5, 0) : (0, .5)
            };
            left[channel] = l; right[channel] = r;
            leftTotal += l; rightTotal += r;
        }
        double scale = Math.Max(1, Math.Max(leftTotal, rightTotal));
        for (int channel = 0; channel < channels; channel++) { left[channel] /= scale; right[channel] /= scale; }
    }

    private static float Clean(float value) => float.IsFinite(value) ? Math.Clamp(value, -1, 1) : 0;
}
