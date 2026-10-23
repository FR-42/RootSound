using System.Text.Json;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Processing;

namespace RootSound.TimbreLab.Tests;

internal static class ProcessingChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory);
        var metrics = new Dictionary<string, double>();
        int groups = 0;
        const int rate = 16000;
        var dry = Tone(rate, 1.1, 220, .34, .12, .055, 0, 0, 0, "dry");
        float[] original = (float[])dry.Samples.Clone();
        var bypass = SampleProcessor.Process(dry, [], Settings());
        Check(bypass.Audio.Samples.SequenceEqual(original), "A fully bypassed render must be bit-identical.");
        Check(!ReferenceEquals(bypass.Audio.Samples, dry.Samples), "A bypass result must own a distinct array.");
        Check(bypass.Audio.SampleRate == rate && bypass.Audio.Channels == 1 && bypass.Audio.FrameCount == dry.FrameCount,
            "Processing must preserve frame count and source format.");
        groups++;

        Check(bypass.RootMidi is double pitch && Math.Abs(pitch - 57) < .08 && bypass.PitchConfidence > .9,
            $"Clean harmonic pitch should be A3; got {bypass.RootMidi}, confidence {bypass.PitchConfidence}.");
        metrics["cleanPitchMidi"] = bypass.RootMidi!.Value;
        metrics["cleanPitchConfidence"] = bypass.PitchConfidence;
        groups++;

        var highFrequency = Tone(48000, .9, 220, .1, .035, .012, 10600, .7, 0, "anti-alias");
        var antiAlias = SampleProcessor.Process(highFrequency, [], Settings());
        Check(antiAlias.RootMidi is double protectedPitch && Math.Abs(protectedPitch - 57) < .1,
            "Strong high frequencies must not alias into a fabricated root during pitch downsampling.");
        metrics["antiAliasPitchMidi"] = antiAlias.RootMidi!.Value;
        Check(antiAlias.Audio.Samples.SequenceEqual(highFrequency.Samples),
            "Pitch-analysis anti-alias filtering must not alter the actual sample.");
        groups++;

        var roundTripSource = new PcmClip(rate, 1, (float[])dry.Samples.Clone(), "smooth-boundary");
        int fade = rate / 20;
        for (int frame = 0; frame < fade; frame++)
        {
            float envelope = (float)(.5 - .5 * Math.Cos(Math.PI * frame / fade));
            roundTripSource.Samples[frame] *= envelope;
            roundTripSource.Samples[^(frame + 1)] *= envelope;
        }
        var roundTrip = SampleProcessor.Process(roundTripSource, [], Settings(high: .000001));
        double roundTripError = roundTrip.Audio.Samples.Zip(roundTripSource.Samples).Max(pair => Math.Abs(pair.First - pair.Second));
        metrics["overlapAddMaximumError"] = roundTripError;
        Check(roundTripError < .0001 && Math.Abs(roundTrip.Audio.Samples[^1] - roundTripSource.Samples[^1]) < .0001,
            $"The real STFT/overlap-add path must preserve signal and boundary samples with a practically open band; max error {roundTripError}.");
        groups++;

        var noise = Tone(rate, 1.1, 220, .34, .12, .055, 0, 0, .17, "noise");
        var cleaned = SampleProcessor.Process(noise, [], Settings(denoise: 1));
        double noisyResidual = ResidualRms(noise, [220, 440, 660]);
        double cleanedResidual = ResidualRms(cleaned.Audio, [220, 440, 660]);
        double targetKeep = Amplitude(cleaned.Audio, 220) / Amplitude(noise, 220);
        metrics["denoiseResidualRatio"] = cleanedResidual / noisyResidual;
        metrics["denoiseTargetAmplitudeRetention"] = targetKeep;
        Check(cleanedResidual < noisyResidual * .72, "Spectral cleaning should measurably reduce generated broadband noise.");
        Check(targetKeep > .86, "Broadband noise cleaning must preserve the strong target fundamental.");
        Finite(cleaned.Audio); groups++;

        var primary = Tone(rate, 1.1, 220, .44, .15, .07, 1170, .14, .012, "primary");
        var first = Tone(22050, .94, 330, .46, .16, .07, 1913, .13, .008, "reference-1");
        var second = Tone(24000, 1.02, 440, .45, .15, .07, 2711, .12, .008, "reference-2");
        float[] primaryBefore = (float[])primary.Samples.Clone();
        float[] referenceBefore = (float[])first.Samples.Clone();
        var common = SampleProcessor.Process(primary, [first, second], Settings(common: 1, root: 57));
        double commonInterference = Amplitude(common.Audio, 1170) / Amplitude(primary, 1170);
        double commonTarget = Amplitude(common.Audio, 220) / Amplitude(primary, 220);
        double commonSecond = Amplitude(common.Audio, 440) / Amplitude(primary, 440);
        metrics["multiReferenceInterferenceAmplitudeRatio"] = commonInterference;
        metrics["multiReferenceFundamentalRetention"] = commonTarget;
        metrics["multiReferenceSecondHarmonicRetention"] = commonSecond;
        Check(common.Notes.Any(note => note.Contains("使用 2 段参考")),
            "The two different-pitch, different-rate references should actually be used.");
        Check(commonInterference < .35, "Different interference should be attenuated by aligned reference comparison.");
        Check(commonTarget > .8 && commonSecond > .7, "Common target harmonics must remain after multi-reference cleaning.");
        Finite(common.Audio); groups++;

        var wideBand = Tone(48000, .8, 440, .4, .13, .06, 16000, .06, 0, "wide-band");
        var narrowReference = Tone(8000, .8, 440, .4, .13, .06, 0, 0, 0, "narrow-reference");
        var bandwidthResult = SampleProcessor.Process(wideBand, [narrowReference], Settings(common: 1, root: 69));
        Check(bandwidthResult.Notes.Any(note => note.Contains("使用 1 段参考")), "The low-rate reference should be usable for its observed band.");
        Check(Amplitude(bandwidthResult.Audio, 16000) / Amplitude(wideBand, 16000) > .98,
            "Unobservable high frequencies of a lower-rate reference must not be treated as absent target content.");
        groups++;

        Check(primaryBefore.SequenceEqual(primary.Samples) && referenceBefore.SequenceEqual(first.Samples)
            && original.SequenceEqual(dry.Samples), "No processing pass may mutate any imported PCM.");
        groups++;

        var manualFocus = SampleProcessor.Process(primary, [], Settings(tonal: 1, root: 57));
        double focusedInterference = Amplitude(manualFocus.Audio, 1170) / Amplitude(primary, 1170);
        double focusedTarget = Amplitude(manualFocus.Audio, 220) / Amplitude(primary, 220);
        metrics["harmonicFocusInterferenceRatio"] = focusedInterference;
        metrics["harmonicFocusTargetRetention"] = focusedTarget;
        Check(focusedInterference < .35 && focusedTarget > .65, "Manual root should help suppress a non-harmonic competing tone.");
        Check(manualFocus.RootMidi == 57 && manualFocus.Notes.Any(note => note.Contains("你指定")),
            "A manually selected root must be retained and distinguished from detection.");
        groups++;

        var burst = Tone(rate, 1.1, 440, .35, .12, .05, 0, 0, 0, "percussion-burst");
        var burstRandom = new Random(7123);
        for (int frame = (int)(rate * .5); frame < rate * .55; frame++)
            burst.Samples[frame] += (float)((burstRandom.NextDouble() * 2 - 1) * .5);
        var burstResult = SampleProcessor.Process(burst, [], Settings(tonal: 1, root: 69));
        double burstResidual = ResidualRms(burstResult.Audio, [440, 880, 1320]) / ResidualRms(burst, [440, 880, 1320]);
        metrics["percussiveBurstResidualRatio"] = burstResidual;
        Check(burstResidual < .4 && Amplitude(burstResult.Audio, 440) / Amplitude(burst, 440) > .75,
            "Tonal focus should suppress an isolated broad percussion burst while retaining a sustained target.");
        groups++;

        var bandSource = Tone(rate, 1.1, 440, .28, 0, 0, 40, .22, 0, "band");
        AddSine(bandSource.Samples, rate, 1, 5800, .18);
        var band = SampleProcessor.Process(bandSource, [], Settings(high: 150, low: 2400));
        metrics["highPass40HzRetention"] = Amplitude(band.Audio, 40) / Amplitude(bandSource, 40);
        metrics["lowPass5800HzRetention"] = Amplitude(band.Audio, 5800) / Amplitude(bandSource, 5800);
        Check(metrics["highPass40HzRetention"] < .05 && metrics["lowPass5800HzRetention"] < .08,
            "Frequency limits must remove low rumble and high unwanted energy.");
        Check(Amplitude(band.Audio, 440) / Amplitude(bandSource, 440) > .98,
            "Band cleaning must retain the in-band target without level normalisation.");
        groups++;

        float[] stereo = new float[dry.Samples.Length * 2];
        for (int index = 0; index < dry.Samples.Length; index++)
        { stereo[index * 2] = dry.Samples[index]; stereo[index * 2 + 1] = -dry.Samples[index]; }
        var antiPhase = new PcmClip(rate, 2, stereo, "antiphase");
        var antiResult = SampleProcessor.Process(antiPhase, [], Settings(denoise: .35, tonal: .25));
        Check(antiResult.RootMidi is double antiPitch && Math.Abs(antiPitch - 57) < .1,
            "Opposite stereo polarity must not cancel pitch analysis.");
        double antiError = 0, antiEnergy = 0;
        for (int index = 0; index < antiResult.Audio.Samples.Length; index += 2)
        { antiError += Math.Abs(antiResult.Audio.Samples[index] + antiResult.Audio.Samples[index + 1]);
            antiEnergy += Math.Abs(antiResult.Audio.Samples[index]); }
        Check(antiEnergy > 50 && antiError < 1e-5, "Shared masks must preserve opposite stereo polarity and nonzero signal.");
        groups++;

        var silence = new PcmClip(rate, 1, new float[rate / 2], "silence");
        var silentResult = SampleProcessor.Process(silence, [silence], new CleanupSettings(1, 1, 1));
        Check(silentResult.RootMidi is null && silentResult.Audio.Samples.All(value => value == 0),
            "Silence must remain silence with no invented note.");
        Check(silentResult.Notes.Any(note => note.Contains("不确定")), "Uncertain pitch must be communicated.");
        Finite(silentResult.Audio); groups++;

        var unpitched = Tone(rate, 1.1, 220, 0, 0, 0, 0, 0, .3, "unpitched");
        var uncertain = SampleProcessor.Process(unpitched, [dry], Settings(common: 1));
        Check(uncertain.RootMidi is null && uncertain.Notes.Any(note => note.Contains("共同提纯未启用")),
            "Unpitched material must not be aligned to a fabricated fundamental.");
        Check(uncertain.Audio.Samples.SequenceEqual(unpitched.Samples),
            "Unavailable reference alignment alone should produce an exact bypass.");
        groups++;

        var tiny = new PcmClip(8000, 1, [.4f, -.2f, .1f], "tiny");
        var tinyResult = SampleProcessor.Process(tiny, [], new CleanupSettings(1, 0, 1));
        Check(tinyResult.Audio.FrameCount == 3 && tinyResult.RootMidi is null,
            "Very short valid samples must finish without guessed pitch or length changes.");
        Finite(tinyResult.Audio); groups++;

        var progress = new CaptureProgress();
        var progressed = SampleProcessor.Process(dry, [first], Settings(denoise: .2, common: .5), progress);
        Check(progress.Values.Count > 2 && progress.Values[0] == 0 && progress.Values[^1] == 1
            && progress.Values.All(value => double.IsFinite(value) && value is >= 0 and <= 1)
            && progress.Values.Zip(progress.Values.Skip(1)).All(pair => pair.First <= pair.Second),
            "Progress must be finite, bounded, monotonic and complete.");
        Finite(progressed.Audio); groups++;

        using (var cancelled = new CancellationTokenSource())
        {
            cancelled.Cancel();
            Throws<OperationCanceledException>(() => SampleProcessor.Process(dry, [], Settings(), token: cancelled.Token));
        }
        using (var during = new CancellationTokenSource())
        {
            var cancellingProgress = new CallbackProgress(value => { if (value >= .2) during.Cancel(); });
            Throws<OperationCanceledException>(() => SampleProcessor.Process(dry, [], Settings(denoise: .5), cancellingProgress, during.Token));
            Check(dry.Samples.SequenceEqual(original), "Cancellation must leave original audio intact.");
        }
        groups++;

        Throws<ArgumentOutOfRangeException>(() => SampleProcessor.Process(dry, [], Settings(denoise: double.NaN)));
        Throws<ArgumentOutOfRangeException>(() => SampleProcessor.Process(dry, [], Settings(common: 1.1)));
        Throws<ArgumentOutOfRangeException>(() => SampleProcessor.Process(dry, [], Settings(root: double.PositiveInfinity)));
        Throws<ArgumentOutOfRangeException>(() => SampleProcessor.Process(dry, [], Settings(high: 3000, low: 2000)));
        Throws<ArgumentException>(() => SampleProcessor.Process(dry, Enumerable.Repeat(dry, 8).ToArray(), Settings()));
        Throws<ArgumentException>(() => SampleProcessor.Process(new PcmClip(8000, 1, new float[240001], "too-long"), [], Settings()));
        Throws<ArgumentException>(() => SampleProcessor.Process(new PcmClip(8000, 1, [float.NaN], "nan"), [], Settings()));
        groups++;

        // The same contaminating harmonic present in every reference is not identifiable
        // as unwanted. Keep this limitation explicit instead of claiming clean separation.
        var shared = SampleProcessor.Process(primary, [primary], Settings(common: 1, root: 57));
        Check(Amplitude(shared.Audio, 1170) / Amplitude(primary, 1170) > .65,
            "Reference comparison must not pretend it can reject interference shared by all references.");
        Check(shared.Notes.Any(note => note.Contains("共同的干扰")) && shared.Notes.Any(note => note.Contains("不能保证")),
            "The output must communicate overlap and separation limitations.");
        groups++;

        var repeated = SampleProcessor.Process(primary, [first, second], Settings(common: 1, root: 57));
        Check(repeated.Audio.Samples.SequenceEqual(common.Audio.Samples), "Offline processing must be deterministic.");
        groups++;

        File.WriteAllText(Path.Combine(directory, "processing-metrics.json"), JsonSerializer.Serialize(new
        { groups, metrics, generatedAudioOnly = true, realAudioDevicesOpened = false }, new JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine($"PASS {groups} processing groups; denoise residual={metrics["denoiseResidualRatio"]:F3}, target retained={metrics["denoiseTargetAmplitudeRetention"]:F3}; reference interference={commonInterference:F3}, target retained={commonTarget:F3}");
        return groups;
    }

    private static CleanupSettings Settings(double denoise = 0, double common = 0, double tonal = 0,
        double high = 0, double low = 1000000, double? root = null) => new(denoise, common, tonal, high, low, root);

    private static PcmClip Tone(int rate, double seconds, double root, double fundamental, double second,
        double third, double interferenceFrequency, double interferenceLevel, double noise, string name)
    {
        float[] samples = new float[(int)(rate * seconds)];
        AddSine(samples, rate, 1, root, fundamental);
        AddSine(samples, rate, 1, root * 2, second);
        AddSine(samples, rate, 1, root * 3, third);
        if (interferenceFrequency > 0) AddSine(samples, rate, 1, interferenceFrequency, interferenceLevel);
        var random = new Random(12345);
        for (int index = 0; index < samples.Length; index++) samples[index] += (float)((random.NextDouble() * 2 - 1) * noise);
        return new(rate, 1, samples, name);
    }

    private static void AddSine(float[] samples, int rate, int channels, double frequency, double amplitude)
    {
        for (int frame = 0; frame < samples.Length / channels; frame++)
            for (int channel = 0; channel < channels; channel++)
                samples[frame * channels + channel] += (float)(amplitude * Math.Sin(2 * Math.PI * frequency * frame / rate));
    }

    private static double Amplitude(PcmClip clip, double frequency)
    {
        int start = Math.Min(clip.SampleRate / 10, (int)clip.FrameCount / 10);
        int end = (int)clip.FrameCount - start;
        double cosine = 0, sine = 0;
        for (int frame = start; frame < end; frame++)
        {
            double phase = 2 * Math.PI * frequency * frame / clip.SampleRate;
            double sample = clip.Samples[frame * clip.Channels];
            cosine += sample * Math.Cos(phase); sine += sample * Math.Sin(phase);
        }
        return 2 * Math.Sqrt(cosine * cosine + sine * sine) / (end - start);
    }

    private static double ResidualRms(PcmClip clip, double[] frequencies)
    {
        int start = clip.SampleRate / 10, end = (int)clip.FrameCount - start;
        double[] sin = new double[frequencies.Length], cos = new double[frequencies.Length];
        for (int tone = 0; tone < frequencies.Length; tone++)
        {
            for (int frame = start; frame < end; frame++)
            {
                double phase = 2 * Math.PI * frequencies[tone] * frame / clip.SampleRate;
                double value = clip.Samples[frame * clip.Channels];
                sin[tone] += value * Math.Sin(phase); cos[tone] += value * Math.Cos(phase);
            }
            sin[tone] *= 2.0 / (end - start); cos[tone] *= 2.0 / (end - start);
        }
        double residual = 0;
        for (int frame = start; frame < end; frame++)
        {
            double value = clip.Samples[frame * clip.Channels];
            for (int tone = 0; tone < frequencies.Length; tone++)
            {
                double phase = 2 * Math.PI * frequencies[tone] * frame / clip.SampleRate;
                value -= sin[tone] * Math.Sin(phase) + cos[tone] * Math.Cos(phase);
            }
            residual += value * value;
        }
        return Math.Sqrt(residual / (end - start));
    }

    private static void Finite(PcmClip clip) => Check(clip.Samples.All(value => float.IsFinite(value) && Math.Abs(value) <= 1), "Output must be finite and unclipped.");
    private static void Check(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
    private static void Throws<T>(Action action) where T : Exception
    {
        try { action(); }
        catch (T) { return; }
        throw new InvalidOperationException($"Expected {typeof(T).Name}.");
    }
    private sealed class CaptureProgress : IProgress<double>
    { internal List<double> Values { get; } = []; public void Report(double value) => Values.Add(value); }
    private sealed class CallbackProgress(Action<double> callback) : IProgress<double>
    { public void Report(double value) => callback(value); }
}
