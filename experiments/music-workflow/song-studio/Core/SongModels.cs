using RootSound.PhraseStudio.Core;

namespace RootSound.SongStudio.Core;

public sealed record SongPhrase(Guid Id, string Name, PhraseDocument Phrase);
public sealed record SongTrack(Guid Id, string Name, double GainDb = 0, bool Muted = false);
public sealed record SongClip(Guid Id, Guid PhraseId, Guid TrackId, long StartTick,
    double GainDb = 0, bool FollowSongTempo = false);
public sealed record SongDocument(Guid Id, string Name, double Tempo, double GainDb,
    IReadOnlyList<SongPhrase> Phrases, IReadOnlyList<SongTrack> Tracks, IReadOnlyList<SongClip> Clips);

public static class SongRules
{
    public const int MaximumPhrases = 64, MaximumTracks = 32, MaximumClips = 512;
    public const long MaximumTicks = 2048L * Timing.TicksPerBar;
    public const long MaximumSampleBytes = 512L * 1024 * 1024;
    public static SongDocument New() => new(Guid.NewGuid(), "新歌曲", 120, -6, [],
        Enumerable.Range(1, 8).Select(i => new SongTrack(Guid.NewGuid(), "轨道 " + i)).ToArray(), []);
    public static double ClipTicks(SongDocument song, SongClip clip)
    {
        var phrase = song.Phrases.First(p => p.Id == clip.PhraseId).Phrase;
        return Timing.DurationTicks(phrase) * (clip.FollowSongTempo ? 1 : song.Tempo / phrase.Tempo);
    }
    public static double EndTick(SongDocument song) => song.Clips.Count == 0 ? 0 :
        song.Clips.Max(clip => clip.StartTick + ClipTicks(song, clip));
    public static long Snap(double tick, long unit) => (long)Math.Clamp(unit <= 0 ? Math.Round(tick) :
        Math.Round(tick / unit, MidpointRounding.AwayFromZero) * unit, 0, MaximumTicks);
    public static SongDocument Place(SongDocument song, Guid phraseId, Guid trackId, long tick)
    {
        var next = song with { Clips = song.Clips.Append(new SongClip(Guid.NewGuid(), phraseId, trackId, tick)).ToArray() };
        Validate(next); return next;
    }
    public static void Validate(SongDocument song)
    {
        ArgumentNullException.ThrowIfNull(song);
        PhraseValidation.Name(song.Name);
        if (song.Id == Guid.Empty || !double.IsFinite(song.Tempo) || song.Tempo is < 20 or > 300 ||
            !Gain(song.GainDb) || song.Phrases is null || song.Tracks is null || song.Clips is null ||
            song.Phrases.Count > MaximumPhrases || song.Tracks.Count is < 1 or > MaximumTracks || song.Clips.Count > MaximumClips)
            throw new InvalidDataException("歌曲参数无效或内容超过容量。 ");
        HashSet<Guid> phrases = [], tracks = [], clips = [];
        long bytes = 0, notes = 0;
        HashSet<RootSound.TimbreLab.Core.PcmClip> audio = new(ReferenceEqualityComparer.Instance);
        foreach (var item in song.Phrases)
        {
            if (item is null || item.Id == Guid.Empty || !phrases.Add(item.Id)) throw new InvalidDataException("乐句编号重复或无效。 ");
            PhraseValidation.Name(item.Name); PhraseValidation.Validate(item.Phrase, requirePlayable: true);
            foreach (var channel in item.Phrase.Channels)
                if (channel.Timbre is { } patch && audio.Add(patch.Audio)) bytes = checked(bytes + patch.Audio.Samples.LongLength * 4);
        }
        if (bytes > MaximumSampleBytes) throw new InvalidDataException("歌曲内音色总量超过 512 MB，请减少导入的乐句。 ");
        foreach (var track in song.Tracks)
        {
            if (track is null || track.Id == Guid.Empty || !tracks.Add(track.Id) || !Gain(track.GainDb))
                throw new InvalidDataException("轨道参数无效。 ");
            PhraseValidation.Name(track.Name);
        }
        foreach (var clip in song.Clips)
        {
            if (clip is null || clip.Id == Guid.Empty || !clips.Add(clip.Id) || !phrases.Contains(clip.PhraseId) ||
                !tracks.Contains(clip.TrackId) || clip.StartTick < 0 || clip.StartTick > MaximumTicks || !Gain(clip.GainDb))
                throw new InvalidDataException("时间线上的乐句位置或引用无效。 ");
            notes = checked(notes + song.Phrases.First(p => p.Id == clip.PhraseId).Phrase.Channels.Sum(c => c.Notes.Count));
        }
        if (notes > 100_000 || EndTick(song) > MaximumTicks || EndTick(song) * Timing.SecondsPerTick(song.Tempo) > 7200)
            throw new InvalidDataException("歌曲超过两小时、2048 小节或十万个编排音符的实验容量。 ");
    }
    private static bool Gain(double value) => double.IsFinite(value) && value is >= -60 and <= 12;
}

internal sealed class SongHistory
{
    private readonly List<SongDocument> undo = [], redo = [];
    internal SongDocument Current { get; private set; } = SongRules.New();
    internal bool CanUndo => undo.Count > 0;
    internal bool CanRedo => redo.Count > 0;
    internal void Reset(SongDocument song) { SongRules.Validate(song); Current = song; undo.Clear(); redo.Clear(); }
    internal void Apply(SongDocument song)
    {
        SongRules.Validate(song); if (ReferenceEquals(Current, song)) return;
        undo.Add(Current); if (undo.Count > 50) undo.RemoveAt(0);
        Current = song; redo.Clear();
    }
    internal void Undo() { if (!CanUndo) return; redo.Add(Current); Current = undo[^1]; undo.RemoveAt(undo.Count - 1); }
    internal void Redo() { if (!CanRedo) return; undo.Add(Current); Current = redo[^1]; redo.RemoveAt(redo.Count - 1); }
}
