namespace RootSound.TimbreLab.Core;

/// <summary>An owned, interleaved PCM snapshot. Consumers must not mutate Samples.</summary>
public sealed class PcmClip
{
    public PcmClip(int sampleRate, int channels, float[] samples, string name)
    {
        ArgumentNullException.ThrowIfNull(samples);
        if (sampleRate is < 8000 or > 384000) throw new ArgumentOutOfRangeException(nameof(sampleRate));
        if (channels is < 1 or > 8) throw new ArgumentOutOfRangeException(nameof(channels));
        if (samples.Length == 0 || samples.Length % channels != 0)
            throw new ArgumentException("音频不能为空，且必须包含完整的采样帧。", nameof(samples));
        SampleRate = sampleRate;
        Channels = channels;
        Samples = samples;
        Name = string.IsNullOrWhiteSpace(name) ? "未命名" : name.Trim();
    }

    public int SampleRate { get; }
    public int Channels { get; }
    public float[] Samples { get; }
    public string Name { get; }
    public long FrameCount => Samples.LongLength / Channels;
    public double DurationSeconds => (double)FrameCount / SampleRate;
}

public sealed record CleanupSettings(
    double Denoise = .25,
    double Commonality = .5,
    double TonalFocus = .25,
    double HighPassHz = 30,
    double LowPassHz = 18000,
    double? RootMidiOverride = null);

public sealed record ProcessingResult(PcmClip Audio, double? RootMidi, double PitchConfidence, string[] Notes);

public sealed record InstrumentSettings(
    double RootMidi = 60,
    double AttackSeconds = .005,
    double DecaySeconds = .15,
    double Sustain = .8,
    double ReleaseSeconds = .2,
    bool LoopEnabled = false,
    long LoopStart = 0,
    long LoopEnd = 0,
    double LoopCrossfadeSeconds = .015,
    double GainDb = 0);

public sealed record InstrumentPatch(PcmClip Audio, InstrumentSettings Settings, string Name);

public readonly record struct LoopRegion(long Start, long End, double CrossfadeSeconds, double Score);
