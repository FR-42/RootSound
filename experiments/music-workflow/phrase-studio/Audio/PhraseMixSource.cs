using System.Buffers;
using RootSound.PhraseStudio.Core;
using RootSound.SampleEditor.Core;

namespace RootSound.PhraseStudio.Audio;

/// <summary>Renders just the requested window. No whole-phrase float buffer is allocated.</summary>
internal sealed class PhraseMixSource : IAudioFrameSource
{
    private MixState? state;
    private long latestReadEnd;
    private int loop = 1;
    internal const int MaximumConcurrentVoices = 128;

    internal PhraseMixSource(int sampleRate = 48000) => SampleRate = sampleRate;
    public int SampleRate { get; }
    public int Channels => 2;
    public long FrameCount => (long)SampleRate * 7 * 86400;
    internal bool Loop { get => Volatile.Read(ref loop) != 0; set => Volatile.Write(ref loop, value ? 1 : 0); }
    internal long LatestReadEnd => Interlocked.Read(ref latestReadEnd);
    internal long DurationTicks => Volatile.Read(ref state)?.Current.DurationTicks ?? 0;
    internal double PlaybackEndTick => Volatile.Read(ref state)?.Current.PlaybackEndTick ?? 0;

    internal void SetDocument(PhraseDocument document, double anchorFrame = 0, double anchorTick = 0, bool crossfade = true)
    {
        PhraseValidation.Validate(document);
        MixPlan next = new(document, SampleRate, anchorFrame, anchorTick);
        MixState? old = Volatile.Read(ref state);
        Volatile.Write(ref state, new(next, crossfade ? old?.Current : null,
            LatestReadEnd, Math.Max(1, SampleRate / 200)));
    }

    internal (double Tick, long Cycle) Position(double sourceFrame)
    {
        MixPlan? plan = Volatile.Read(ref state)?.Current;
        if (plan is null) return (0, 0);
        double tick = Math.Max(0, plan.TickAt(sourceFrame));
        if (!Loop) return (Math.Min(tick, plan.DurationTicks), 0);
        long cycle = (long)Math.Floor(tick / plan.DurationTicks);
        return (tick - cycle * plan.DurationTicks, cycle);
    }

    internal double RawPosition(double sourceFrame) => Volatile.Read(ref state)?.Current.TickAt(sourceFrame) ?? 0;

    public int ReadFrames(long startFrame, Span<float> destination)
    {
        if (startFrame < 0 || startFrame > FrameCount || destination.Length % 2 != 0)
            throw new ArgumentOutOfRangeException(nameof(startFrame));
        destination.Clear();
        int frames = (int)Math.Min(destination.Length / 2, FrameCount - startFrame);
        if (frames == 0) return 0;
        MixState? snapshot = Volatile.Read(ref state);
        Span<float> output = destination[..(frames * 2)];
        if (snapshot is not null)
        {
            snapshot.Current.Render(startFrame, output, Loop);
            if (snapshot.Previous is not null && startFrame < snapshot.TransitionFrame + snapshot.TransitionFrames)
            {
                float[] rented = ArrayPool<float>.Shared.Rent(output.Length);
                try
                {
                    Span<float> previous = rented.AsSpan(0, output.Length); previous.Clear();
                    snapshot.Previous.Render(startFrame, previous, Loop);
                    for (int frame = 0; frame < frames; frame++)
                    {
                        double blend = Math.Clamp((startFrame + frame - snapshot.TransitionFrame) /
                            (double)snapshot.TransitionFrames, 0, 1);
                        output[frame * 2] = (float)(previous[frame * 2] * (1 - blend) + output[frame * 2] * blend);
                        output[frame * 2 + 1] = (float)(previous[frame * 2 + 1] * (1 - blend) + output[frame * 2 + 1] * blend);
                    }
                }
                finally { ArrayPool<float>.Shared.Return(rented); }
            }
            ProtectPeaks(output);
            if (snapshot.Previous is not null && startFrame + frames >= snapshot.TransitionFrame + snapshot.TransitionFrames)
                Interlocked.CompareExchange(ref state, snapshot with { Previous = null }, snapshot);
        }
        long end = startFrame + frames, prior;
        do { prior = Interlocked.Read(ref latestReadEnd); if (prior >= end) break; }
        while (Interlocked.CompareExchange(ref latestReadEnd, end, prior) != prior);
        return frames;
    }

    internal void ResetReadCursor(long frame = 0) => Interlocked.Exchange(ref latestReadEnd, frame);

    internal static void ProtectPeaks(Span<float> values)
    {
        for (int i = 0; i < values.Length; i++)
        {
            double value = values[i], magnitude = Math.Abs(value);
            values[i] = !double.IsFinite(value) ? 0 : magnitude > .98
                ? (float)Math.CopySign(.98 + .02 * Math.Tanh((magnitude - .98) / .02), value) : (float)value;
        }
    }

    private sealed record MixState(MixPlan Current, MixPlan? Previous, long TransitionFrame, int TransitionFrames);

    private sealed class MixPlan
    {
        private readonly ScheduledVoice[] voices;
        private readonly double[] prefixEnds;
        private readonly double framesPerTick, durationFrames, anchorFrame, anchorTick;
        private readonly double maximumEnd;

        internal MixPlan(PhraseDocument document, int sampleRate, double anchorFrame, double anchorTick)
        {
            DurationTicks = Timing.DurationTicks(document);
            framesPerTick = Timing.SecondsPerTick(document.Tempo) * sampleRate;
            durationFrames = DurationTicks * framesPerTick;
            this.anchorFrame = anchorFrame;
            this.anchorTick = Math.Clamp(anchorTick, 0, DurationTicks);
            List<ScheduledVoice> scheduled = [];
            foreach (var channel in document.Channels)
            {
                if (channel.Muted || channel.Timbre is null) continue;
                foreach (var note in channel.Notes)
                {
                    InstrumentVoice voice = new(channel.Timbre, note.Pitch,
                        note.LengthTick * Timing.SecondsPerTick(document.Tempo), note.Velocity, channel.GainDb, sampleRate);
                    scheduled.Add(new(note.StartTick * framesPerTick, voice));
                }
            }
            voices = scheduled.OrderBy(voice => voice.Start).ToArray();
            prefixEnds = new double[voices.Length];
            double end = 0;
            for (int i = 0; i < voices.Length; i++) prefixEnds[i] = end = Math.Max(end, voices[i].End);
            maximumEnd = end;
        }

        internal long DurationTicks { get; }
        internal double PlaybackEndTick => Math.Max(DurationTicks, maximumEnd / framesPerTick);
        internal double TickAt(double frame) => anchorTick + (frame - anchorFrame) / framesPerTick;

        internal void Render(long sourceStart, Span<float> destination, bool loop)
        {
            int frames = destination.Length / 2;
            double first = sourceStart - anchorFrame + anchorTick * framesPerTick;
            double end = first + frames;
            long firstCycle = loop ? Math.Max(0, (long)Math.Floor((first - maximumEnd) / durationFrames)) : 0;
            long lastCycle = loop ? Math.Max(0, (long)Math.Floor(end / durationFrames)) : 0;
            int active = 0;
            for (long cycle = firstCycle; cycle <= lastCycle; cycle++)
            {
                double offset = cycle * durationFrames;
                double localFirst = first - offset, localEnd = end - offset;
                int low = FirstEndAfter(localFirst), high = FirstStartAtOrAfter(localEnd);
                for (int index = low; index < high; index++)
                {
                    ScheduledVoice voice = voices[index];
                    if (voice.End <= localFirst) continue;
                    if (++active > MaximumConcurrentVoices)
                        throw new InvalidOperationException("同时发声超过 128 个，请减少重叠音符或缩短释音。乐句内容仍完整保留。 ");
                    voice.Voice.Add(localFirst - voice.Start, destination);
                }
            }
        }

        private int FirstEndAfter(double value)
        {
            int low = 0, high = prefixEnds.Length;
            while (low < high) { int mid = low + (high - low) / 2; if (prefixEnds[mid] <= value) low = mid + 1; else high = mid; }
            return low;
        }
        private int FirstStartAtOrAfter(double value)
        {
            int low = 0, high = voices.Length;
            while (low < high) { int mid = low + (high - low) / 2; if (voices[mid].Start < value) low = mid + 1; else high = mid; }
            return low;
        }
        private sealed record ScheduledVoice(double Start, InstrumentVoice Voice)
        {
            internal double End => Start + Voice.TotalFrames;
        }
    }
}
