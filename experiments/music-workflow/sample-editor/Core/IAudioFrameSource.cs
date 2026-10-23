namespace RootSound.SampleEditor.Core;

/// <summary>Immutable decoded interleaved audio. Concurrent readers have independent positions.</summary>
public interface IAudioFrameSource
{
    int SampleRate { get; }
    int Channels { get; }
    long FrameCount { get; }
    /// <summary>
    /// Read up to destination.Length / Channels complete frames. Return frames read,
    /// zero-fill any remaining destination, and permit startFrame == FrameCount.
    /// Reject negative/out-of-range starts and destinations without whole frames.
    /// </summary>
    int ReadFrames(long startFrame, Span<float> destination);
}
