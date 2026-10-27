using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Instrument;

/// <summary>
/// Local synthesized piano reference for pitch comparison, with an exact fundamental,
/// struck onset and faster-decaying upper partials. No sample download or device access.
/// It is a reference sound, not a sampled concert-piano library.
/// </summary>
public static class PianoReference
{
    public const int LowestNote = 21, HighestNote = 108, SampleRate = 48000;
    public static double Frequency(int note) => 440 * Math.Pow(2, (note - 69) / 12d);

    public static PcmClip Render(int note, double heldSeconds, CancellationToken token = default)
    {
        if (note is < LowestNote or > HighestNote) throw new ArgumentOutOfRangeException(nameof(note));
        if (!double.IsFinite(heldSeconds) || heldSeconds is < .1 or > 10) throw new ArgumentOutOfRangeException(nameof(heldSeconds));
        token.ThrowIfCancellationRequested();
        const double release = .2;
        int frames = (int)Math.Ceiling((heldSeconds + release) * SampleRate);
        float[] samples = new float[frames];
        double fundamental = Frequency(note);
        double lifetime = Math.Clamp(3.5 * Math.Pow(220 / fundamental, .4), .45, 6);
        List<Partial> partials = [];
        double totalAmplitude = 0;
        for (int harmonic = 1; harmonic <= 14; harmonic++)
        {
            // The fundamental remains exact; modest string stiffness spreads only overtones.
            double stiffness = .000035 * Math.Pow(2, (note - 60) / 36d);
            double frequency = fundamental * harmonic * Math.Sqrt((1 + stiffness * harmonic * harmonic) / (1 + stiffness));
            if (frequency > SampleRate * .44) break;
            double amplitude = Math.Pow(harmonic, -1.35) * (harmonic % 2 == 0 ? .85 : 1);
            double decay = Math.Exp(-1 / (SampleRate * lifetime / (1 + .16 * Math.Pow(harmonic - 1, 1.25))));
            double angle = 2 * Math.PI * frequency / SampleRate;
            partials.Add(new(Math.Cos(angle), Math.Sin(angle), amplitude, decay));
            totalAmplitude += amplitude;
        }
        double scale = .72 / totalAmplitude;
        for (int frame = 0; frame < frames; frame++)
        {
            if ((frame & 1023) == 0) token.ThrowIfCancellationRequested();
            double time = frame / (double)SampleRate, value = 0;
            foreach (var partial in partials) value += partial.Next();
            double attack = Math.Min(1, time / .003);
            double damping = time <= heldSeconds ? 1 : .5 + .5 * Math.Cos(Math.PI * Math.Clamp((time - heldSeconds) / release, 0, 1));
            samples[frame] = (float)(value * scale * attack * damping);
        }
        samples[0] = samples[^1] = 0;
        token.ThrowIfCancellationRequested();
        return new(SampleRate, 1, samples, $"钢琴参考 · {note}");
    }

    private sealed class Partial(double cosine, double sine, double amplitude, double decay)
    {
        private double x = 1, y, level = amplitude;
        internal double Next()
        {
            double value = y * level;
            double next = x * cosine - y * sine;
            y = y * cosine + x * sine; x = next; level *= decay;
            return value;
        }
    }
}
