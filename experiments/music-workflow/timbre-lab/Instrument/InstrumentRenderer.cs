using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Instrument;

/// <summary>Renders an offline key press; no audio device is opened.</summary>
public static class InstrumentRenderer
{
    public static PcmClip Render(InstrumentPatch patch, int midiNote, double heldSeconds,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(patch);
        InstrumentValidation.Clip(patch.Audio);
        InstrumentValidation.Settings(patch.Settings, patch.Audio.FrameCount, patch.Audio.SampleRate);
        if (midiNote is < 0 or > 127 || !double.IsFinite(heldSeconds) || heldSeconds is < 0.1 or > 10)
            throw new ArgumentOutOfRangeException(nameof(heldSeconds), "试听按键时长应在 0.1 至 10 秒之间。 ");
        cancellationToken.ThrowIfCancellationRequested();
        var audio = patch.Audio;
        var settings = patch.Settings;
        double release = Math.Max(0.005, settings.ReleaseSeconds);
        int frames = checked((int)Math.Ceiling((heldSeconds + release) * audio.SampleRate));
        int samples = checked(frames * audio.Channels);
        if (samples > InstrumentValidation.MaximumSamples)
            throw new InvalidDataException("本次试听过长，请缩短按键或释放时间。 ");
        float[] output = new float[samples];
        double step = Math.Pow(2, (midiNote - settings.RootMidi) / 12.0);
        // A bounded transposition also prevents pathological loops in untrusted patches.
        if (step is < 1.0 / 256 or > 256)
            throw new InvalidDataException("此次移调范围过大，请选择靠近根音的按键。 ");
        double gain = Math.Pow(10, settings.GainDb / 20);
        double cutoff = Math.Min(1, 1 / step) * 0.94;
        double position = 0;
        double crossfade = settings.LoopEnabled ? settings.LoopCrossfadeSeconds * audio.SampleRate : 0;
        double loopLength = settings.LoopEnd - settings.LoopStart;
        double noteOffLevel = HeldEnvelope(heldSeconds, settings);
        int noteOffFrame = Math.Clamp((int)Math.Round(heldSeconds * audio.SampleRate), 0, frames - 1);
        int releaseFrames = Math.Max(1, frames - 1 - noteOffFrame);

        for (int frame = 0; frame < frames; frame++)
        {
            if ((frame & 1023) == 0) cancellationToken.ThrowIfCancellationRequested();
            if (settings.LoopEnabled && position >= settings.LoopEnd)
            {
                double cycle = loopLength - crossfade;
                position = settings.LoopStart + crossfade + (position - settings.LoopEnd) % cycle;
            }
            double envelope = frame < noteOffFrame
                ? HeldEnvelope(frame / (double)audio.SampleRate, settings)
                : noteOffLevel * (0.5 + 0.5 * Math.Cos(Math.PI * Math.Min(1, (frame - noteOffFrame) / (double)releaseFrames)));
            // Even a nominal zero attack/release receives a short anti-click ramp.
            envelope *= Math.Min(1, frame / Math.Max(1.0, audio.SampleRate * 0.002));
            if (!settings.LoopEnabled)
                envelope *= Math.Clamp((audio.FrameCount - 1 - position) / Math.Max(1, audio.SampleRate * 0.005), 0, 1);

            for (int channel = 0; channel < audio.Channels; channel++)
            {
                double value = ReadSinc(audio, position, channel, cutoff);
                if (settings.LoopEnabled && crossfade > 0 && position >= settings.LoopEnd - crossfade)
                {
                    double blend = (position - (settings.LoopEnd - crossfade)) / crossfade;
                    double head = ReadSinc(audio, settings.LoopStart + position - (settings.LoopEnd - crossfade), channel, cutoff);
                    value = value * (1 - blend) + head * blend;
                }
                value *= envelope * gain;
                // Keep ordinary levels unchanged and round peaks smoothly instead of hard clipping.
                double magnitude = Math.Abs(value);
                if (magnitude > 0.98) value = Math.CopySign(0.98 + 0.02 * Math.Tanh((magnitude - 0.98) / 0.02), value);
                output[frame * audio.Channels + channel] = double.IsFinite(value) ? (float)value : 0;
            }
            position += step;
        }
        cancellationToken.ThrowIfCancellationRequested();
        return new PcmClip(audio.SampleRate, audio.Channels, output, patch.Name + " · " + midiNote);
    }

    private static double HeldEnvelope(double seconds, InstrumentSettings settings)
    {
        if (settings.AttackSeconds > 0 && seconds < settings.AttackSeconds)
            return seconds / settings.AttackSeconds;
        double sinceAttack = seconds - settings.AttackSeconds;
        if (settings.DecaySeconds > 0 && sinceAttack < settings.DecaySeconds)
            return 1 + (settings.Sustain - 1) * Math.Max(0, sinceAttack) / settings.DecaySeconds;
        return settings.Sustain;
    }

    private static double ReadSinc(PcmClip audio, double position, int channel, double cutoff)
    {
        if (position < 0 || position >= audio.FrameCount) return 0;
        const int radius = 12;
        long center = (long)Math.Floor(position);
        double sum = 0, weights = 0;
        for (int offset = -radius + 1; offset <= radius; offset++)
        {
            long index = center + offset;
            double distance = position - index;
            if (Math.Abs(distance) >= radius) continue;
            double x = Math.PI * cutoff * distance;
            double sinc = Math.Abs(x) < 1e-10 ? 1 : Math.Sin(x) / x;
            double window = 0.5 + 0.5 * Math.Cos(Math.PI * distance / radius);
            double weight = cutoff * sinc * window;
            weights += weight;
            if (index >= 0 && index < audio.FrameCount)
            {
                float sample = audio.Samples[checked((int)(index * audio.Channels + channel))];
                if (float.IsFinite(sample)) sum += sample * weight;
            }
        }
        return Math.Abs(weights) > 1e-12 ? sum / weights : 0;
    }
}
