using RootSound.SampleEditor.Core;
using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Audio;

/// <summary>Read-only snapshot so preview rendering and export never race an in-progress edit.</summary>
public sealed class PcmClipAdapter : IAudioFrameSource
{
    private readonly float[] samples;
    public PcmClipAdapter(PcmClip clip)
    {
        ArgumentNullException.ThrowIfNull(clip);
        SampleRate = clip.SampleRate;
        Channels = clip.Channels;
        samples = (float[])clip.Samples.Clone();
        FrameCount = samples.LongLength / Channels;
    }

    public int SampleRate { get; }
    public int Channels { get; }
    public long FrameCount { get; }

    public int ReadFrames(long startFrame, Span<float> destination)
    {
        if (startFrame < 0 || startFrame > FrameCount) throw new ArgumentOutOfRangeException(nameof(startFrame));
        if (destination.Length % Channels != 0) throw new ArgumentException("音频缓冲区必须包含完整声道。", nameof(destination));
        int frames = (int)Math.Min(FrameCount - startFrame, destination.Length / Channels);
        samples.AsSpan(checked((int)(startFrame * Channels)), checked(frames * Channels)).CopyTo(destination);
        destination[checked(frames * Channels)..].Clear();
        return frames;
    }
}
