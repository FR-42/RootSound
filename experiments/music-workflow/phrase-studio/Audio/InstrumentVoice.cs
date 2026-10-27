using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;

namespace RootSound.PhraseStudio.Audio;

/// <summary>Random-access voice: immutable sample, fractional root, ADSR and crossfaded sample loop.</summary>
internal sealed class InstrumentVoice
{
    private const int Radius = 12;
    private const int Phases = 512;
    private static readonly object KernelGate = new();
    private static readonly Dictionary<long, float[]> Kernels = new();
    private static readonly Queue<long> KernelOrder = new();
    private readonly InstrumentPatch patch;
    private readonly double step, heldFrames, releaseFrames, noteOffLevel, gain;
    private readonly int outputRate;
    private readonly float[] kernel;
    private readonly double[] left, right;

    internal InstrumentVoice(InstrumentPatch patch, int pitch, double heldSeconds, double velocity,
        double channelGainDb, int outputRate)
    {
        InstrumentValidation.Clip(patch.Audio);
        InstrumentValidation.Settings(patch.Settings, patch.Audio.FrameCount, patch.Audio.SampleRate);
        if (pitch is < 0 or > 127 || !double.IsFinite(heldSeconds) || heldSeconds <= 0 ||
            !double.IsFinite(velocity) || velocity is <= 0 or > 1 || outputRate is < 8000 or > 384000)
            throw new ArgumentOutOfRangeException(nameof(pitch));
        this.patch = patch;
        this.outputRate = outputRate;
        step = Math.Pow(2, (pitch - patch.Settings.RootMidi) / 12) * patch.Audio.SampleRate / outputRate;
        if (step is < 1.0 / 4096 or > 4096)
            throw new InvalidDataException("这个音符离音色原音高太远，请使用更接近的采样。 ");
        heldFrames = heldSeconds * outputRate;
        releaseFrames = Math.Max(.005, patch.Settings.ReleaseSeconds) * outputRate;
        noteOffLevel = HeldEnvelope(heldSeconds);
        gain = Math.Pow(10, (patch.Settings.GainDb + channelGainDb) / 20) * velocity;
        double cutoff = Math.Min(1, 1 / step) * .94;
        long key = BitConverter.DoubleToInt64Bits(cutoff);
        // Bounded FIFO retains frequently repeated pitches in the current edit rather
        // than re-generating a kernel for every note once the cache has ever filled.
        lock (KernelGate)
        {
            if (!Kernels.TryGetValue(key, out kernel!))
            {
                if (Kernels.Count >= 256) Kernels.Remove(KernelOrder.Dequeue());
                Kernels.Add(key, kernel = BuildKernel(cutoff));
                KernelOrder.Enqueue(key);
            }
        }
        (left, right) = StereoWeights(patch.Audio.Channels);
    }

    // A one-shot sample can finish before its envelope. Do not keep a silent voice
    // alive merely because the saved release is long.
    internal double TotalFrames => patch.Settings.LoopEnabled ? heldFrames + releaseFrames
        : Math.Min(heldFrames + releaseFrames, patch.Audio.FrameCount / step);

    internal void Add(double firstVoiceFrame, Span<float> stereo)
    {
        int count = stereo.Length / 2;
        int begin = Math.Max(0, (int)Math.Ceiling(-firstVoiceFrame));
        int end = Math.Min(count, (int)Math.Ceiling(TotalFrames - firstVoiceFrame));
        PcmClip audio = patch.Audio;
        InstrumentSettings settings = patch.Settings;
        double crossfade = settings.LoopEnabled ? settings.LoopCrossfadeSeconds * audio.SampleRate : 0;
        double loopLength = settings.LoopEnd - settings.LoopStart;
        for (int frame = begin; frame < end; frame++)
        {
            double age = firstVoiceFrame + frame;
            double position = age * step;
            if (settings.LoopEnabled && position >= settings.LoopEnd)
                position = settings.LoopStart + crossfade +
                    (position - settings.LoopEnd) % (loopLength - crossfade);
            if (!settings.LoopEnabled && position >= audio.FrameCount) continue;
            double envelope = age < heldFrames
                ? HeldEnvelope(age / outputRate)
                : noteOffLevel * (.5 + .5 * Math.Cos(Math.PI * Math.Clamp((age - heldFrames) / releaseFrames, 0, 1)));
            envelope *= Math.Min(1, age / Math.Max(1, outputRate * .002));
            if (!settings.LoopEnabled)
                envelope *= Math.Clamp((audio.FrameCount - 1 - position) / Math.Max(1, audio.SampleRate * .005), 0, 1);
            if (envelope <= 0) continue;
            double l = 0, r = 0;
            for (int channel = 0; channel < audio.Channels; channel++)
            {
                double value = Read(position, channel);
                if (settings.LoopEnabled && crossfade > 0 && position >= settings.LoopEnd - crossfade)
                {
                    double blend = (position - settings.LoopEnd + crossfade) / crossfade;
                    double head = Read(settings.LoopStart + position - settings.LoopEnd + crossfade, channel);
                    value = value * (1 - blend) + head * blend;
                }
                value *= envelope * gain;
                if (!double.IsFinite(value)) value = 0;
                l += value * left[channel];
                r += value * right[channel];
            }
            stereo[frame * 2] += (float)l;
            stereo[frame * 2 + 1] += (float)r;
        }
    }

    private double HeldEnvelope(double seconds)
    {
        var settings = patch.Settings;
        if (settings.AttackSeconds > 0 && seconds < settings.AttackSeconds) return seconds / settings.AttackSeconds;
        double elapsed = seconds - settings.AttackSeconds;
        if (settings.DecaySeconds > 0 && elapsed < settings.DecaySeconds)
            return 1 + (settings.Sustain - 1) * Math.Max(0, elapsed) / settings.DecaySeconds;
        return settings.Sustain;
    }

    private double Read(double position, int channel)
    {
        var audio = patch.Audio;
        if (position < 0 || position >= audio.FrameCount) return 0;
        long center = (long)position;
        int phase = Math.Clamp((int)Math.Round((position - center) * (Phases - 1)), 0, Phases - 1);
        int offset = phase * Radius * 2;
        double sum = 0;
        for (int tap = 0; tap < Radius * 2; tap++)
        {
            long index = center + tap - Radius + 1;
            if (index >= 0 && index < audio.FrameCount)
            {
                float value = audio.Samples[(int)(index * audio.Channels + channel)];
                if (float.IsFinite(value)) sum += value * kernel[offset + tap];
            }
        }
        return sum;
    }

    private static float[] BuildKernel(double cutoff)
    {
        float[] values = new float[Phases * Radius * 2];
        for (int phase = 0; phase < Phases; phase++)
        {
            double fraction = phase / (double)(Phases - 1), total = 0;
            int first = phase * Radius * 2;
            for (int tap = 0; tap < Radius * 2; tap++)
            {
                double distance = fraction - (tap - Radius + 1);
                double angle = Math.PI * cutoff * distance;
                double sinc = Math.Abs(angle) < 1e-12 ? 1 : Math.Sin(angle) / angle;
                double window = Math.Abs(distance) < Radius ? .5 + .5 * Math.Cos(Math.PI * distance / Radius) : 0;
                double weight = cutoff * sinc * window;
                values[first + tap] = (float)weight;
                total += weight;
            }
            if (Math.Abs(total) > 1e-12)
                for (int tap = 0; tap < Radius * 2; tap++) values[first + tap] /= (float)total;
        }
        return values;
    }

    private static (double[] Left, double[] Right) StereoWeights(int channels)
    {
        double[] left = new double[channels], right = new double[channels];
        if (channels == 1) { left[0] = right[0] = 1; return (left, right); }
        // Windows' standard PCM speaker ordering. Include center, LFE and surrounds.
        uint mask = channels switch { 2 => 3, 3 => 7, 4 => 0x33, 5 => 0x37, 6 => 0x3f, 7 => 0x70f, 8 => 0x63f, _ => 0 };
        for (int channel = 0; channel < channels; channel++)
        {
            uint speaker = mask & unchecked(0u - mask); mask &= ~speaker;
            (left[channel], right[channel]) = speaker switch
            {
                1 => (1, 0), 2 => (0, 1), 4 => (.7071067811865476, .7071067811865476),
                8 => (.5, .5), 16 or 64 or 512 => (.7071067811865476, 0),
                32 or 128 or 1024 => (0, .7071067811865476), 256 => (.5, .5),
                _ => channel % 2 == 0 ? (.5, 0) : (0, .5)
            };
        }
        double scale = Math.Max(1, Math.Max(left.Sum(), right.Sum()));
        for (int i = 0; i < channels; i++) { left[i] /= scale; right[i] /= scale; }
        return (left, right);
    }
}
