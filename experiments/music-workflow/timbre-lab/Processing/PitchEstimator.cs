using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Processing;

internal readonly record struct PitchEstimate(double? Midi, double Confidence);

/// <summary>
/// Periodicity estimate using the YIN cumulative-mean-normalised difference function.
/// This estimates a dominant periodicity, not the identity of an instrument in a mixture.
/// </summary>
internal static class PitchEstimator
{
    internal static PitchEstimate Estimate(PcmClip clip, CancellationToken token)
    {
        int frames = checked((int)clip.FrameCount);
        int channel = StrongestChannel(clip, token);
        int stride = Math.Max(1, clip.SampleRate / 12000);
        double rate = (double)clip.SampleRate / stride;
        double[]? decimationFilter = stride > 1 ? DecimationFilter(clip.SampleRate, stride) : null;
        int maximumLag = Math.Min(1024, (int)(rate / 48));
        int minimumLag = Math.Max(2, (int)(rate / 1900));
        int comparisonLength = Math.Max(512, maximumLag * 2);
        int windowLength = comparisonLength + maximumLag + 1;
        int available = frames / stride;
        if (available < maximumLag * 3 || frames < clip.SampleRate * .025)
            return new(null, 0);
        comparisonLength = Math.Min(comparisonLength, available - maximumLag - 1);
        windowLength = comparisonLength + maximumLag + 1;
        int windows = Math.Min(9, Math.Max(1, available / comparisonLength));
        var candidates = new List<(double Midi, double Confidence, double Energy)>();
        double[] data = new double[windowLength];
        double[] difference = new double[maximumLag + 1];
        for (int window = 0; window < windows; window++)
        {
            token.ThrowIfCancellationRequested();
            int start = windows == 1 ? Math.Max(0, (available - windowLength) / 2)
                : (int)((long)(available - windowLength) * window / (windows - 1));
            double mean = 0, energy = 0;
            for (int index = 0; index < windowLength; index++)
            {
                double value;
                int source = (start + index) * stride;
                if (decimationFilter is null) value = clip.Samples[source * clip.Channels + channel];
                else
                {
                    value = 0;
                    int half = decimationFilter.Length / 2;
                    for (int tap = 0; tap < decimationFilter.Length; tap++)
                    {
                        int frame = source + tap - half;
                        if (frame >= 0 && frame < frames)
                            value += clip.Samples[frame * clip.Channels + channel] * decimationFilter[tap];
                    }
                }
                data[index] = value; mean += value;
            }
            mean /= windowLength;
            for (int index = 0; index < windowLength; index++)
            { data[index] -= mean; energy += data[index] * data[index]; }
            energy /= windowLength;
            if (energy < 1e-10) continue;
            difference[0] = 1;
            double running = 0;
            for (int lag = 1; lag <= maximumLag; lag++)
            {
                if ((lag & 31) == 0) token.ThrowIfCancellationRequested();
                double sum = 0;
                for (int index = 0; index < comparisonLength; index++)
                { double delta = data[index] - data[index + lag]; sum += delta * delta; }
                running += sum;
                difference[lag] = running > 1e-30 ? sum * lag / running : 1;
            }
            int best = -1;
            for (int lag = minimumLag; lag < maximumLag; lag++)
            {
                if (difference[lag] >= .15) continue;
                while (lag + 1 <= maximumLag && difference[lag + 1] < difference[lag]) lag++;
                best = lag; break;
            }
            if (best < 0)
            {
                best = minimumLag;
                for (int lag = minimumLag + 1; lag <= maximumLag; lag++)
                    if (difference[lag] < difference[best]) best = lag;
            }
            double confidence = Math.Clamp(1 - difference[best], 0, 1);
            if (confidence < .72 || best <= minimumLag || best >= maximumLag) continue;
            double left = difference[best - 1], middle = difference[best], right = difference[best + 1];
            double curvature = left - 2 * middle + right;
            double correction = Math.Abs(curvature) > 1e-20 ? Math.Clamp(.5 * (left - right) / curvature, -.5, .5) : 0;
            double frequency = rate / (best + correction);
            // An unrelated partial can pull the difference-function minimum a little
            // away from a real harmonic. Refine the candidate against local harmonic
            // peaks; this is still a dominant-period estimate, never source identity.
            frequency = RefineFrequency(data, rate, frequency);
            double midi = 69 + 12 * Math.Log2(frequency / 440);
            if (midi is >= 0 and <= 127) candidates.Add((midi, confidence, energy));
        }
        if (candidates.Count == 0) return new(null, 0);
        // Let a stable, energetic pitch win over a quiet tail or incidental onset periodicity.
        double maxEnergy = candidates.Max(candidate => candidate.Energy);
        candidates.RemoveAll(candidate => candidate.Energy < maxEnergy * .035);
        candidates.Sort((left, right) => left.Midi.CompareTo(right.Midi));
        double totalWeight = candidates.Sum(candidate => candidate.Confidence * Math.Sqrt(candidate.Energy));
        double weight = 0, median = candidates[^1].Midi;
        foreach (var candidate in candidates)
        {
            weight += candidate.Confidence * Math.Sqrt(candidate.Energy);
            if (weight >= totalWeight / 2) { median = candidate.Midi; break; }
        }
        var consistent = candidates.Where(candidate => Math.Abs(candidate.Midi - median) <= .65).ToArray();
        double consistency = consistent.Sum(candidate => candidate.Confidence * Math.Sqrt(candidate.Energy)) / totalWeight;
        double resultConfidence = consistent.Average(candidate => candidate.Confidence) * consistency;
        if (resultConfidence < .65) return new(null, resultConfidence);
        double result = consistent.Sum(candidate => candidate.Midi * candidate.Confidence * Math.Sqrt(candidate.Energy))
            / consistent.Sum(candidate => candidate.Confidence * Math.Sqrt(candidate.Energy));
        return new(result, Math.Clamp(resultConfidence, 0, 1));
    }

    private static int StrongestChannel(PcmClip clip, CancellationToken token)
    {
        double[] powers = new double[clip.Channels];
        int frames = checked((int)clip.FrameCount);
        int step = Math.Max(1, frames / 30000);
        for (int frame = 0; frame < frames; frame += step)
        {
            if ((frame & 4095) == 0) token.ThrowIfCancellationRequested();
            for (int channel = 0; channel < clip.Channels; channel++)
            { double value = clip.Samples[frame * clip.Channels + channel]; powers[channel] += value * value; }
        }
        int strongest = 0;
        for (int channel = 1; channel < clip.Channels; channel++)
            if (powers[channel] > powers[strongest]) strongest = channel;
        return strongest;
    }

    private static double RefineFrequency(double[] data, double rate, double candidate)
    {
        int size = 1024;
        while (size < data.Length * 4 && size < 16384) size <<= 1;
        double[] real = new double[size], imaginary = new double[size];
        int length = Math.Min(data.Length, size);
        for (int index = 0; index < length; index++)
            real[index] = data[index] * (.5 - .5 * Math.Cos(2 * Math.PI * index / Math.Max(1, length - 1)));
        Fft.Transform(real, imaginary);
        var peaks = new List<(double Frequency, double Power)>();
        double strongest = 0;
        for (int harmonic = 1; harmonic <= 8 && candidate * harmonic < rate * .46; harmonic++)
        {
            double center = candidate * harmonic * size / rate;
            double width = Math.Max(2, center * .065);
            int first = Math.Max(1, (int)Math.Floor(center - width));
            int last = Math.Min(size / 2 - 1, (int)Math.Ceiling(center + width));
            int peak = first;
            double Power(int bin) => real[bin] * real[bin] + imaginary[bin] * imaginary[bin];
            for (int bin = first + 1; bin <= last; bin++) if (Power(bin) > Power(peak)) peak = bin;
            if (peak == first || peak == last) continue;
            double left = Math.Log(Math.Max(1e-30, Power(peak - 1)));
            double middle = Math.Log(Math.Max(1e-30, Power(peak)));
            double right = Math.Log(Math.Max(1e-30, Power(peak + 1)));
            double curvature = left - 2 * middle + right;
            double correction = Math.Abs(curvature) > 1e-20 ? Math.Clamp(.5 * (left - right) / curvature, -.5, .5) : 0;
            double frequency = (peak + correction) * rate / size / harmonic;
            double power = Power(peak) / Math.Sqrt(harmonic);
            strongest = Math.Max(strongest, power);
            peaks.Add((frequency, power));
        }
        if (peaks.Count == 0) return candidate;
        var useful = peaks.Where(peak => peak.Power > strongest * .06).OrderBy(peak => peak.Frequency).ToArray();
        if (useful.Length == 0) return candidate;
        double total = useful.Sum(peak => peak.Power), accumulated = 0;
        foreach (var peak in useful)
        {
            accumulated += peak.Power;
            if (accumulated >= total / 2) return peak.Frequency;
        }
        return candidate;
    }

    private static double[] DecimationFilter(int rate, int stride)
    {
        int length = Math.Max(63, stride * 24 + 1);
        if ((length & 1) == 0) length++;
        int half = length / 2;
        // The estimator's highest searched fundamental is 1900 Hz. Retain that
        // band while rejecting high-frequency content before downsampling.
        double cutoff = Math.Min(3000, rate / (double)stride * .32) / rate;
        double[] filter = new double[length];
        double sum = 0;
        for (int tap = 0; tap < length; tap++)
        {
            int offset = tap - half;
            double sinc = offset == 0 ? 2 * cutoff : Math.Sin(2 * Math.PI * cutoff * offset) / (Math.PI * offset);
            double hann = .5 - .5 * Math.Cos(2 * Math.PI * tap / (length - 1));
            filter[tap] = sinc * hann; sum += filter[tap];
        }
        for (int tap = 0; tap < length; tap++) filter[tap] /= sum;
        return filter;
    }
}
