using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Processing;

/// <summary>
/// Offline, non-destructive spectral cleaning. References guide a soft mask on the primary
/// sample; their waveforms are never averaged or substituted into the result.
/// </summary>
public static class SampleProcessor
{
    private const int MaximumReferences = 7;
    private const int MaximumSamples = 16_000_000;
    private const long MaximumTotalSamples = 64_000_000;
    private const int TemporalRadius = 4;

    public static ProcessingResult Process(PcmClip primary, IReadOnlyList<PcmClip> references,
        CleanupSettings settings, IProgress<double>? progress = null, CancellationToken token = default)
    {
        ArgumentNullException.ThrowIfNull(primary);
        ArgumentNullException.ThrowIfNull(references);
        ArgumentNullException.ThrowIfNull(settings);
        token.ThrowIfCancellationRequested();
        Validate(primary, references, settings, token);
        progress?.Report(0);
        var notes = new List<string>();
        PitchEstimate detected = PitchEstimator.Estimate(primary, token);
        double? rootMidi = settings.RootMidiOverride ?? detected.Midi;
        double? fundamental = rootMidi is double midi ? MidiFrequency(midi) : null;
        if (settings.RootMidiOverride is not null)
            notes.Add("按你指定的原音高处理；这不是自动识别结果。");
        else if (detected.Midi is null)
            notes.Add("原音高不确定，请试听后手动指定；不会凭空猜测目标乐器。");
        else
            notes.Add("原音高是主导周期的估计；多个乐器同时发声时可能认错，请试听确认。");

        int size = TransformSize(primary.SampleRate);
        double[] window = Window(size);
        var primaryProfile = AverageProfile(primary, size, window, token);
        var alignedReferences = new List<AlignedProfile>();
        if (settings.Commonality > 0 && references.Count > 0 && fundamental is double primaryFundamental)
        {
            for (int index = 0; index < references.Count; index++)
            {
                token.ThrowIfCancellationRequested();
                var reference = references[index];
                PitchEstimate pitch = PitchEstimator.Estimate(reference, token);
                if (pitch.Midi is double referenceMidi)
                {
                    double ratio = MidiFrequency(referenceMidi) / primaryFundamental;
                    int referenceSize = TransformSize(reference.SampleRate);
                    double[] profile = AverageProfile(reference, referenceSize, Window(referenceSize), token);
                    alignedReferences.Add(new(profile, reference.SampleRate, referenceSize, ratio));
                }
                else notes.Add($"参考“{SafeName(reference.Name)}”的音高不确定，未用于共同特征比较。");
                progress?.Report(.05 + .15 * (index + 1) / references.Count);
            }
        }
        if (references.Count > 0 && settings.Commonality > 0)
        {
            if (alignedReferences.Count == 0)
                notes.Add("共同提纯未启用：主采样或参考的音高不足以可靠对齐。");
            else
                notes.Add($"使用 {alignedReferences.Count} 段参考按各自音高对齐比较；共同的干扰、重叠频率仍可能保留。");
        }
        else if (settings.Commonality > 0)
            notes.Add("没有参考采样，共同提纯暂不生效。");
        if (settings.Denoise > .6 || settings.TonalFocus > .6 || settings.Commonality > .8)
            notes.Add("处理较强，可能削弱气声、起音和细节；请与原声对照。");
        notes.Add("这是基于频谱特征的清理，不能保证从任意混音中无损分离单个乐器。");

        double nyquist = primary.SampleRate / 2.0;
        double lowPass = Math.Min(settings.LowPassHz, nyquist);
        bool bypass = settings.Denoise == 0 && settings.TonalFocus == 0
            && (settings.Commonality == 0 || alignedReferences.Count == 0)
            && settings.HighPassHz == 0 && lowPass >= nyquist;
        if (bypass)
        {
            token.ThrowIfCancellationRequested();
            progress?.Report(1);
            return new(new(primary.SampleRate, primary.Channels, (float[])primary.Samples.Clone(), primary.Name),
                rootMidi, detected.Confidence, notes.ToArray());
        }

        int bins = size / 2 + 1;
        int hop = size / 4;
        int frames = checked((int)primary.FrameCount);
        int finalIndex = (frames + size / 2 + hop - 1) / hop;
        float[] result = new float[primary.Samples.Length];
        float[] weights = new float[frames];
        double[] previousMask = Enumerable.Repeat(1.0, bins).ToArray();
        double[] rawMask = new double[bins], mask = new double[bins];
        double[] common = BuildCommonMask(primaryProfile, alignedReferences, primary.SampleRate, size, token);
        double[] band = BuildBandMask(settings.HighPassHz, lowPass, primary.SampleRate, size);
        var cache = new Dictionary<int, SpectralFrame>();
        Span<float> frequencyValues = stackalloc float[31];
        Span<float> timeValues = stackalloc float[TemporalRadius * 2 + 1];

        SpectralFrame GetFrame(int index)
        {
            index = Math.Clamp(index, 0, finalIndex);
            if (!cache.TryGetValue(index, out var frame))
            {
                token.ThrowIfCancellationRequested();
                frame = Analyze(primary, index * hop - size / 2, size, window);
                cache.Add(index, frame);
            }
            return frame;
        }

        for (int index = 0; index <= finalIndex; index++)
        {
            token.ThrowIfCancellationRequested();
            SpectralFrame frame = GetFrame(index);
            SpectralFrame[] temporal = new SpectralFrame[TemporalRadius * 2 + 1];
            if (settings.TonalFocus > 0)
                for (int neighbor = -TemporalRadius; neighbor <= TemporalRadius; neighbor++)
                    temporal[neighbor + TemporalRadius] = GetFrame(index + neighbor);
            for (int bin = 0; bin < bins; bin++)
            {
                double magnitude = frame.Magnitude[bin];
                double localMedian = 0;
                if (settings.Denoise > 0 || settings.TonalFocus > 0)
                {
                    int count = 0;
                    for (int neighbor = Math.Max(0, bin - 15); neighbor <= Math.Min(bins - 1, bin + 15); neighbor++)
                        frequencyValues[count++] = frame.Magnitude[neighbor];
                    frequencyValues[..count].Sort();
                    localMedian = frequencyValues[count / 2];
                }
                double gain = band[bin];
                if (settings.Denoise > 0)
                {
                    // A local spectral median estimates broadband contamination, not a known
                    // noise-only recording. Keep a floor and conservative user-adjustable mix.
                    double ratio = localMedian * localMedian / (magnitude * magnitude + 1e-20);
                    double cleaned = Math.Sqrt(Math.Clamp(1 - 1.65 * ratio, .015, 1));
                    gain *= 1 - settings.Denoise + settings.Denoise * cleaned;
                }
                if (settings.TonalFocus > 0)
                {
                    for (int neighbor = 0; neighbor < temporal.Length; neighbor++)
                        timeValues[neighbor] = temporal[neighbor].Magnitude[bin];
                    timeValues.Sort();
                    double horizontal = timeValues[TemporalRadius];
                    double harmonicMask = horizontal * horizontal
                        / (horizontal * horizontal + localMedian * localMedian + 1e-20);
                    harmonicMask = .08 + .92 * harmonicMask;
                    if (fundamental is double f0)
                    {
                        double hz = (double)bin * primary.SampleRate / size;
                        int harmonic = Math.Max(1, (int)Math.Round(hz / f0));
                        double distance = Math.Abs(hz - harmonic * f0);
                        double width = Math.Max(primary.SampleRate * 1.65 / size, hz * .012);
                        double tonal = .08 + .92 * Math.Exp(-.5 * distance * distance / (width * width));
                        harmonicMask *= tonal;
                    }
                    gain *= 1 - settings.TonalFocus + settings.TonalFocus * harmonicMask;
                }
                gain *= 1 - settings.Commonality + settings.Commonality * common[bin];
                rawMask[bin] = Math.Clamp(gain, 0, 1);
            }
            // Mild frequency/time smoothing prevents isolated hard spectral holes.
            for (int bin = 0; bin < bins; bin++)
            {
                double smoothed = (rawMask[Math.Max(0, bin - 1)] + 2 * rawMask[bin]
                    + rawMask[Math.Min(bins - 1, bin + 1)]) / 4;
                // Filtering itself is static; initialise from the current mask to avoid a
                // brief unfiltered attack when the user explicitly asks to remove a band.
                mask[bin] = index == 0 ? smoothed : .25 * previousMask[bin] + .75 * smoothed;
            }
            Array.Copy(mask, previousMask, bins);
            int start = index * hop - size / 2;
            for (int channel = 0; channel < primary.Channels; channel++)
            {
                token.ThrowIfCancellationRequested();
                double[] real = frame.Real[channel], imaginary = frame.Imaginary[channel];
                for (int bin = 0; bin < bins; bin++)
                {
                    real[bin] *= mask[bin]; imaginary[bin] *= mask[bin];
                    if (bin > 0 && bin < size / 2)
                    { real[size - bin] *= mask[bin]; imaginary[size - bin] *= mask[bin]; }
                }
                Fft.Transform(real, imaginary, true);
                for (int sample = Math.Max(0, -start); sample < size && start + sample < frames; sample++)
                    result[(start + sample) * primary.Channels + channel] += (float)(real[sample] * window[sample]);
            }
            for (int sample = Math.Max(0, -start); sample < size && start + sample < frames; sample++)
                weights[start + sample] += (float)(window[sample] * window[sample]);
            cache.Remove(index - TemporalRadius);
            if (index % 4 == 0 || index == finalIndex)
                progress?.Report(.2 + .76 * index / Math.Max(1, finalIndex));
        }
        double peak = 0;
        for (int frame = 0; frame < frames; frame++)
        {
            if ((frame & 8191) == 0) token.ThrowIfCancellationRequested();
            double weight = weights[frame];
            for (int channel = 0; channel < primary.Channels; channel++)
            {
                int sample = frame * primary.Channels + channel;
                double value = weight > 1e-12 ? result[sample] / weight : 0;
                if (!double.IsFinite(value)) throw new InvalidOperationException("处理产生了无效数值，原采样未被改变。");
                result[sample] = (float)value;
                peak = Math.Max(peak, Math.Abs(value));
            }
        }
        // Spectral masking can create time-domain overshoot even with gains <= 1.
        // Apply one common attenuation only if required, preserving stereo balance.
        if (peak > .999)
        {
            float gain = (float)(.999 / peak);
            for (int sample = 0; sample < result.Length; sample++)
            {
                if ((sample & 16383) == 0) token.ThrowIfCancellationRequested();
                result[sample] *= gain;
            }
            notes.Add("处理后的峰值已整体轻降，避免导出削波；没有放大低音量采样。");
        }
        token.ThrowIfCancellationRequested();
        progress?.Report(1);
        return new(new(primary.SampleRate, primary.Channels, result, primary.Name),
            rootMidi, detected.Confidence, notes.ToArray());
    }

    private static void Validate(PcmClip primary, IReadOnlyList<PcmClip> references,
        CleanupSettings settings, CancellationToken token)
    {
        if (references.Count > MaximumReferences) throw new ArgumentException("最多添加 7 段参考采样。", nameof(references));
        long total = 0;
        foreach (var clip in references.Prepend(primary))
        {
            ArgumentNullException.ThrowIfNull(clip);
            if (clip.DurationSeconds > 30.000001 || clip.Samples.Length > MaximumSamples)
                throw new ArgumentException("每段采样最多 30 秒、1600 万个声道采样点，请先截短。", nameof(primary));
            total += clip.Samples.Length;
            if (total > MaximumTotalSamples) throw new ArgumentException("本次采样总量过大，请减少参考片段。", nameof(references));
            for (int index = 0; index < clip.Samples.Length; index++)
            {
                if ((index & 8191) == 0) token.ThrowIfCancellationRequested();
                if (!float.IsFinite(clip.Samples[index])) throw new ArgumentException("采样包含无效音频数值。", nameof(primary));
            }
        }
        if (!double.IsFinite(settings.Denoise) || settings.Denoise is < 0 or > 1
            || !double.IsFinite(settings.Commonality) || settings.Commonality is < 0 or > 1
            || !double.IsFinite(settings.TonalFocus) || settings.TonalFocus is < 0 or > 1)
            throw new ArgumentOutOfRangeException(nameof(settings), "清理强度必须在 0 和 1 之间。");
        double nyquist = primary.SampleRate / 2.0;
        if (!double.IsFinite(settings.HighPassHz) || settings.HighPassHz < 0 || settings.HighPassHz >= nyquist
            || !double.IsFinite(settings.LowPassHz) || settings.LowPassHz <= settings.HighPassHz)
            throw new ArgumentOutOfRangeException(nameof(settings), "频率范围无效，请保持低切低于高切。");
        if (settings.RootMidiOverride is double midi && (!double.IsFinite(midi) || midi is < 0 or > 127
                || MidiFrequency(midi) >= nyquist))
            throw new ArgumentOutOfRangeException(nameof(settings), "指定的原音高超出采样的可用范围。");
    }

    private static int TransformSize(int rate)
    {
        int size = 1024;
        while (size < rate * .07 && size < 8192) size <<= 1;
        return size;
    }

    private static double[] Window(int size)
    {
        double[] window = new double[size];
        for (int index = 0; index < size; index++) window[index] = .5 - .5 * Math.Cos(2 * Math.PI * index / size);
        return window;
    }

    private static SpectralFrame Analyze(PcmClip clip, int start, int size, double[] window)
    {
        double[][] real = new double[clip.Channels][], imaginary = new double[clip.Channels][];
        double[] power = new double[size / 2 + 1];
        int frames = checked((int)clip.FrameCount);
        for (int channel = 0; channel < clip.Channels; channel++)
        {
            real[channel] = new double[size]; imaginary[channel] = new double[size];
            for (int index = Math.Max(0, -start); index < size && start + index < frames; index++)
                real[channel][index] = clip.Samples[(start + index) * clip.Channels + channel] * window[index];
            Fft.Transform(real[channel], imaginary[channel]);
            for (int bin = 0; bin < power.Length; bin++)
                power[bin] += real[channel][bin] * real[channel][bin] + imaginary[channel][bin] * imaginary[channel][bin];
        }
        float[] magnitude = new float[power.Length];
        for (int bin = 0; bin < power.Length; bin++) magnitude[bin] = (float)Math.Sqrt(power[bin] / clip.Channels);
        return new(real, imaginary, magnitude);
    }

    private static double[] AverageProfile(PcmClip clip, int size, double[] window, CancellationToken token)
    {
        int frames = checked((int)clip.FrameCount);
        int count = Math.Clamp(frames / Math.Max(1, size / 2), 1, 80);
        double[] profile = new double[size / 2 + 1];
        for (int index = 0; index < count; index++)
        {
            token.ThrowIfCancellationRequested();
            int center = count == 1 ? frames / 2 : (int)((long)frames * index / (count - 1));
            var spectrum = Analyze(clip, center - size / 2, size, window);
            for (int bin = 0; bin < profile.Length; bin++)
                profile[bin] += spectrum.Magnitude[bin] * spectrum.Magnitude[bin];
        }
        double maximum = 0;
        for (int bin = 0; bin < profile.Length; bin++)
        { profile[bin] = Math.Sqrt(profile[bin] / count); maximum = Math.Max(maximum, profile[bin]); }
        if (maximum > 1e-20)
            for (int bin = 0; bin < profile.Length; bin++) profile[bin] /= maximum;
        return profile;
    }

    private static double[] BuildCommonMask(double[] primary, List<AlignedProfile> references,
        int rate, int size, CancellationToken token)
    {
        double[] mask = Enumerable.Repeat(1.0, primary.Length).ToArray();
        if (references.Count == 0) return mask;
        for (int bin = 0; bin < mask.Length; bin++)
        {
            if ((bin & 255) == 0) token.ThrowIfCancellationRequested();
            double frequency = (double)bin * rate / size;
            double logSupport = 0;
            int availableReferences = 0;
            foreach (var reference in references)
            {
                double location = frequency * reference.PitchRatio * reference.Size / reference.Rate;
                // Pitch alignment is fractional; allow the reference FFT's own resolution
                // and a small detuning/vibrato tolerance, without borrowing neighbouring notes.
                double radius = Math.Max(1.5, location * .009);
                // A lower-rate reference cannot observe this band. Missing bandwidth
                // is not evidence that a target partial is unwanted.
                if (location > reference.Profile.Length - 1 - radius) continue;
                double support = 0;
                int first = Math.Max(0, (int)Math.Floor(location - radius));
                int last = Math.Min(reference.Profile.Length - 1, (int)Math.Ceiling(location + radius));
                for (int nearby = first; nearby <= last; nearby++)
                {
                    double distance = Math.Abs(nearby - location) / radius;
                    double taper = Math.Exp(-.5 * distance * distance);
                    support = Math.Max(support, reference.Profile[nearby] * taper);
                }
                logSupport += Math.Log(Math.Max(1e-8, support));
                availableReferences++;
            }
            if (availableReferences == 0) continue;
            double common = Math.Exp(logSupport / availableReferences);
            double relative = common / Math.Max(.015, primary[bin] * .75);
            mask[bin] = .035 + .965 * Math.Clamp(relative, 0, 1);
        }
        return mask;
    }

    private static double[] BuildBandMask(double highPass, double lowPass, int rate, int size)
    {
        double[] mask = new double[size / 2 + 1];
        for (int bin = 0; bin < mask.Length; bin++)
        {
            double frequency = (double)bin * rate / size;
            double high = highPass <= 0 ? 1 : frequency <= 0 ? 0 : 1 / Math.Sqrt(1 + Math.Pow(highPass / frequency, 8));
            double low = lowPass >= rate / 2.0 ? 1 : 1 / Math.Sqrt(1 + Math.Pow(frequency / lowPass, 8));
            mask[bin] = high * low;
        }
        return mask;
    }

    private static string SafeName(string name) => name.Length <= 60 ? name : name[..57] + "…";
    private static double MidiFrequency(double midi) => 440 * Math.Pow(2, (midi - 69) / 12);
    private sealed record SpectralFrame(double[][] Real, double[][] Imaginary, float[] Magnitude);
    private sealed record AlignedProfile(double[] Profile, int Rate, int Size, double PitchRatio);
}
