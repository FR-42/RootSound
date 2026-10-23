using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Instrument;

internal static class InstrumentValidation
{
    internal const int MaximumSamples = 16_000_000;
    internal const int MaximumSeconds = 30;

    internal static void Clip(PcmClip audio, bool inspectSamples = false)
    {
        ArgumentNullException.ThrowIfNull(audio);
        if (audio.SampleRate is < 8000 or > 384000 || audio.Channels is < 1 or > 8 ||
            audio.Samples.Length == 0 || audio.Samples.Length % audio.Channels != 0 ||
            audio.Samples.Length > MaximumSamples || audio.FrameCount > (long)audio.SampleRate * MaximumSeconds)
            throw new InvalidDataException("音色采样须为 30 秒以内、最多 8 声道的完整音频。 ");
        if (inspectSamples)
            foreach (float sample in audio.Samples)
                if (!float.IsFinite(sample) || Math.Abs(sample) > 32)
                    throw new InvalidDataException("音色包含无效或过大的音频数值。 ");
    }

    internal static void Settings(InstrumentSettings settings, long frameCount, int sampleRate)
    {
        ArgumentNullException.ThrowIfNull(settings);
        if (!Within(settings.RootMidi, 0, 127) || !Within(settings.AttackSeconds, 0, 5) ||
            !Within(settings.DecaySeconds, 0, 5) || !Within(settings.Sustain, 0, 1) ||
            !Within(settings.ReleaseSeconds, 0, 10) || !Within(settings.GainDb, -60, 24) ||
            !Within(settings.LoopCrossfadeSeconds, 0, 1))
            throw new InvalidDataException("音色的根音、包络或音量设置无效。 ");
        if (settings.LoopStart < 0 || settings.LoopEnd < settings.LoopStart || settings.LoopEnd > frameCount)
            throw new InvalidDataException("循环范围超出了采样。 ");
        if (settings.LoopEnabled && (settings.LoopEnd - settings.LoopStart < 4 ||
            settings.LoopCrossfadeSeconds * sampleRate > (settings.LoopEnd - settings.LoopStart) / 2.0))
            throw new InvalidDataException("循环长度过短，或交叠范围超过了循环的一半。 ");
    }

    private static bool Within(double value, double minimum, double maximum) =>
        double.IsFinite(value) && value >= minimum && value <= maximum;
}
