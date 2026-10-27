using System.Buffers;
using RootSound.PhraseStudio.Audio;
using RootSound.PhraseStudio.Core;
using RootSound.SampleEditor.Core;
using RootSound.SongStudio.Core;

namespace RootSound.SongStudio.Audio;

internal sealed class SongMixSource : IAudioFrameSource
{
    private State? state;
    private long latestReadEnd;
    private readonly bool finite;
    internal SongMixSource(bool finite = false) => this.finite = finite;
    public int SampleRate => 48000;
    public int Channels => 2;
    public long FrameCount => finite ? (long)Math.Ceiling(Volatile.Read(ref state)?.Current.EndFrame ?? 0) : 48000L * 7 * 86400;
    internal double EndTick => Volatile.Read(ref state)?.Current.EndTick ?? 0;
    internal double PlaybackEndTick => Volatile.Read(ref state)?.Current.PlaybackEndTick ?? 0;
    internal double Position(double frame) => Volatile.Read(ref state)?.Current.TickAt(frame) ?? 0;
    internal void ResetReadCursor() => Interlocked.Exchange(ref latestReadEnd, 0);
    internal void SetDocument(SongDocument song, double anchorFrame = 0, double anchorTick = 0, bool crossfade = true)
    {
        SongRules.Validate(song);
        var plan = new Plan(song, anchorFrame, anchorTick);
        var old = Volatile.Read(ref state);
        Volatile.Write(ref state, new(plan, crossfade ? old?.Current : null, Interlocked.Read(ref latestReadEnd)));
    }
    public int ReadFrames(long startFrame, Span<float> destination)
    {
        if (startFrame < 0 || startFrame > FrameCount || destination.Length % 2 != 0)
            throw new ArgumentOutOfRangeException(nameof(startFrame));
        destination.Clear();
        int frames = (int)Math.Min(destination.Length / 2, FrameCount - startFrame);
        if (frames == 0) return 0;
        var snapshot = Volatile.Read(ref state);
        var output = destination[..(frames * 2)];
        if (snapshot is not null)
        {
            snapshot.Current.Render(startFrame, output);
            if (snapshot.Previous is not null && startFrame < snapshot.Transition + 240)
            {
                float[] rented = ArrayPool<float>.Shared.Rent(output.Length);
                try
                {
                    var prior = rented.AsSpan(0, output.Length); prior.Clear(); snapshot.Previous.Render(startFrame, prior);
                    for (int f = 0; f < frames; f++)
                    {
                        double blend = Math.Clamp((startFrame + f - snapshot.Transition) / 240.0, 0, 1);
                        for (int c = 0; c < 2; c++) output[f * 2 + c] = (float)(prior[f * 2 + c] * (1 - blend) + output[f * 2 + c] * blend);
                    }
                }
                finally { ArrayPool<float>.Shared.Return(rented); }
            }
            for (int i = 0; i < output.Length; i++)
            {
                double value = output[i], abs = Math.Abs(value);
                output[i] = !double.IsFinite(value) ? 0 : abs <= .98 ? (float)value :
                    (float)Math.CopySign(.98 + .02 * Math.Tanh((abs - .98) / .02), value);
            }
            if (startFrame + frames >= snapshot.Transition + 240 && snapshot.Previous is not null)
                Interlocked.CompareExchange(ref state, snapshot with { Previous = null }, snapshot);
        }
        long end = startFrame + frames, before;
        do { before = Interlocked.Read(ref latestReadEnd); if (before >= end) break; }
        while (Interlocked.CompareExchange(ref latestReadEnd, end, before) != before);
        return frames;
    }
    private sealed record State(Plan Current, Plan? Previous, long Transition);
    private sealed record Scheduled(double Start, InstrumentVoice Voice)
    { internal double End => Start + Voice.TotalFrames; }
    private sealed class Plan
    {
        private readonly Scheduled[] voices;
        private readonly double[] prefixEnds;
        private readonly double anchorFrame, anchorTick, framesPerTick;
        internal Plan(SongDocument song, double anchorFrame, double anchorTick)
        {
            this.anchorFrame = anchorFrame; this.anchorTick = anchorTick;
            framesPerTick = Timing.SecondsPerTick(song.Tempo) * 48000;
            EndTick = SongRules.EndTick(song);
            List<Scheduled> scheduled = [];
            // Repeated placements share the same immutable voice and sample data.
            Dictionary<(Guid, Guid, Guid, double, double), InstrumentVoice> cache = [];
            var phrases = song.Phrases.ToDictionary(p => p.Id);
            var tracks = song.Tracks.ToDictionary(t => t.Id);
            foreach (var clip in song.Clips)
            {
                var track = tracks[clip.TrackId]; if (track.Muted) continue;
                var phrase = phrases[clip.PhraseId].Phrase;
                double secondsPerTick = Timing.SecondsPerTick(clip.FollowSongTempo ? song.Tempo : phrase.Tempo);
                foreach (var channel in phrase.Channels)
                {
                    if (channel.Muted || channel.Timbre is null) continue;
                    double gain = song.GainDb + track.GainDb + clip.GainDb + channel.GainDb;
                    foreach (var note in channel.Notes)
                    {
                        var key = (clip.PhraseId, channel.Id, note.Id, secondsPerTick, gain);
                        if (!cache.TryGetValue(key, out var voice))
                        {
                            voice = new InstrumentVoice(channel.Timbre, note.Pitch, note.LengthTick * secondsPerTick,
                                note.Velocity, gain, 48000); cache.Add(key, voice);
                        }
                        scheduled.Add(new(clip.StartTick * framesPerTick + note.StartTick * secondsPerTick * 48000, voice));
                    }
                }
            }
            voices = scheduled.OrderBy(v => v.Start).ToArray(); prefixEnds = new double[voices.Length];
            double end = EndTick * framesPerTick;
            for (int i = 0; i < voices.Length; i++) prefixEnds[i] = i == 0 ? voices[i].End : Math.Max(prefixEnds[i - 1], voices[i].End);
            if (voices.Length > 0) end = Math.Max(end, prefixEnds[^1]);
            EndFrame = end;
            PlaybackEndTick = end / framesPerTick;
            var events = voices.SelectMany(v => new[] { (Frame: v.Start, Delta: 1), (Frame: v.End, Delta: -1) })
                .OrderBy(e => e.Frame).ThenBy(e => e.Delta);
            int active = 0;
            foreach (var e in events) if ((active += e.Delta) > 128)
                throw new InvalidOperationException("同时发声超过 128 个。请减少重叠乐句、音符或缩短音色的释音。 ");
        }
        internal double EndFrame { get; }
        internal double EndTick { get; }
        internal double PlaybackEndTick { get; }
        internal double TickAt(double frame) => anchorTick + (frame - anchorFrame) / framesPerTick;
        internal void Render(long start, Span<float> output)
        {
            double first = start - anchorFrame + anchorTick * framesPerTick, end = first + output.Length / 2;
            int lo = 0, hi = prefixEnds.Length;
            while (lo < hi) { int mid = (lo + hi) / 2; if (prefixEnds[mid] <= first) lo = mid + 1; else hi = mid; }
            for (int i = lo; i < voices.Length && voices[i].Start < end; i++)
                if (voices[i].End > first) voices[i].Voice.Add(first - voices[i].Start, output);
        }
    }
}
