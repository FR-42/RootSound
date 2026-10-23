using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Instrument;

/// <summary>Finds a plausible stable sustain loop; an unsuitable or silent sample returns null.</summary>
public static class LoopFinder
{
    public static LoopRegion? Find(PcmClip audio, double? rootMidi = null, CancellationToken cancellationToken = default)
    {
        InstrumentValidation.Clip(audio);
        if (rootMidi is { } root && (!double.IsFinite(root) || root is < 0 or > 127))
            throw new ArgumentOutOfRangeException(nameof(rootMidi));
        cancellationToken.ThrowIfCancellationRequested();
        int length = checked((int)audio.FrameCount);
        if (length < audio.SampleRate * 0.15) return null;
        int channel = LoudestChannel(audio);
        double period = rootMidi is { } note ? audio.SampleRate / (440 * Math.Pow(2, (note - 69) / 12)) : 0;
        int window = Math.Clamp((int)(period > 0 ? period * 2 : audio.SampleRate * 0.008), 16, audio.SampleRate / 25);
        int minimum = Math.Max(window * 2, audio.SampleRate / 12);
        LoopRegion? best = null;

        for (int seed = 0; seed < 20; seed++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int approximateStart = (int)(length * (0.16 + seed * 0.022));
            int start = NearestCrossing(audio, approximateStart, channel, Math.Max(32, (int)(period > 0 ? period : window)));
            if (start < window || start + minimum + window >= length) continue;
            for (int candidate = 0; candidate < 14; candidate++)
            {
                int wanted = (int)Math.Min(audio.SampleRate * (0.09 + candidate * 0.065), (length - start - window) * 0.95);
                int end;
                if (period > 0)
                    end = start + (int)Math.Round(Math.Max(1, Math.Round(wanted / period)) * period);
                else end = NearestCrossing(audio, start + wanted, channel, window);
                if (end - start < minimum || end + window >= length) continue;
                double score = Similarity(audio, start, end, window);
                // Slightly prefer a longer cycle only after sound continuity is comparable.
                double preference = score + Math.Min(0.015, (end - start) / (double)audio.SampleRate * 0.015);
                double oldPreference = best is { } previous
                    ? previous.Score + Math.Min(0.015, (previous.End - previous.Start) / (double)audio.SampleRate * 0.015) : -1;
                if (preference > oldPreference)
                {
                    double crossfade = Math.Min(0.025, (end - start) / (double)audio.SampleRate * 0.15);
                    // Tail-to-head crossfades skip the already-blended head on the next
                    // cycle. Use complete periods so their two waveforms stay in phase;
                    // an arbitrary 25 ms overlap cancels a 220 Hz note at its midpoint.
                    if (period > 0)
                        crossfade = Math.Floor(crossfade * audio.SampleRate / period + 1e-10) * period / audio.SampleRate;
                    best = new LoopRegion(start, end, crossfade, score);
                }
            }
        }
        cancellationToken.ThrowIfCancellationRequested();
        return best is { Score: >= 0.55 } ? best : null;
    }

    private static int LoudestChannel(PcmClip audio)
    {
        double[] energy = new double[audio.Channels];
        int step = Math.Max(1, (int)audio.FrameCount / 16000);
        for (int frame = 0; frame < audio.FrameCount; frame += step)
            for (int channel = 0; channel < audio.Channels; channel++)
            {
                float sample = audio.Samples[frame * audio.Channels + channel];
                if (float.IsFinite(sample)) energy[channel] += sample * (double)sample;
            }
        return Array.IndexOf(energy, energy.Max());
    }

    private static int NearestCrossing(PcmClip audio, int around, int channel, int radius)
    {
        int from = Math.Max(1, around - radius), to = Math.Min((int)audio.FrameCount - 1, around + radius);
        int best = Math.Clamp(around, from, to), distance = int.MaxValue;
        for (int frame = from; frame <= to; frame++)
        {
            float before = audio.Samples[(frame - 1) * audio.Channels + channel];
            float after = audio.Samples[frame * audio.Channels + channel];
            if (before <= 0 && after > 0 && Math.Abs(frame - around) < distance)
            { best = frame; distance = Math.Abs(frame - around); }
        }
        return best;
    }

    private static double Similarity(PcmClip audio, int start, int end, int window)
    {
        double difference = 0, energy = 0, mean = 0;
        int count = 0;
        for (int offset = -window / 2; offset < window / 2; offset++)
            for (int channel = 0; channel < audio.Channels; channel++)
            {
                double left = audio.Samples[(start + offset) * audio.Channels + channel];
                double right = audio.Samples[(end + offset) * audio.Channels + channel];
                if (!double.IsFinite(left) || !double.IsFinite(right)) return 0;
                difference += (left - right) * (left - right);
                energy += left * left + right * right;
                mean += left + right;
                count += 2;
            }
        if (energy < count * 1e-9 || energy - mean * mean / count < energy * 0.02) return 0;
        return Math.Clamp(1 - difference / energy, 0, 1);
    }
}
