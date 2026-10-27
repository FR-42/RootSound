using RootSound.SampleEditor.Core;

namespace RootSound.PhraseStudio.Audio;

/// <summary>Independent audition stream, so tapping a key never stops phrase playback.</summary>
internal sealed class PreviewMixSource : IAudioFrameSource
{
    private readonly object gate = new();
    private PreviewVoice[] voices = [];
    private long latestReadEnd;
    internal PreviewMixSource(int sampleRate = 48000) => SampleRate = sampleRate;
    public int SampleRate { get; }
    public int Channels => 2;
    public long FrameCount => (long)SampleRate * 7 * 86400;
    internal long LatestReadEnd => Interlocked.Read(ref latestReadEnd);
    internal double LastVoiceEnd { get { lock (gate) return voices.Length == 0 ? 0 : voices.Max(voice => voice.End); } }

    internal void Add(InstrumentVoice voice, double frame)
    {
        lock (gate)
        {
            var remaining = voices.Where(item => item.End > frame).ToArray();
            if (remaining.Length >= 32) throw new InvalidOperationException("琴键试听太密集，请稍等正在发声的音符结束。 ");
            voices = [.. remaining, new PreviewVoice(frame, voice)];
        }
    }

    internal void Clear(double frame = 0)
    {
        lock (gate) voices = [];
        Interlocked.Exchange(ref latestReadEnd, (long)frame);
    }

    public int ReadFrames(long startFrame, Span<float> destination)
    {
        if (startFrame < 0 || startFrame > FrameCount || destination.Length % 2 != 0)
            throw new ArgumentOutOfRangeException(nameof(startFrame));
        destination.Clear();
        int count = (int)Math.Min(destination.Length / 2, FrameCount - startFrame);
        PreviewVoice[] snapshot;
        lock (gate) snapshot = voices;
        foreach (var voice in snapshot)
            if (voice.End > startFrame && voice.Start < startFrame + count)
                voice.Voice.Add(startFrame - voice.Start, destination[..(count * 2)]);
        PhraseMixSource.ProtectPeaks(destination[..(count * 2)]);
        long end = startFrame + count, prior;
        do { prior = Interlocked.Read(ref latestReadEnd); if (prior >= end) break; }
        while (Interlocked.CompareExchange(ref latestReadEnd, end, prior) != prior);
        return count;
    }

    private sealed record PreviewVoice(double Start, InstrumentVoice Voice)
    {
        internal double End => Start + Voice.TotalFrames;
    }
}
