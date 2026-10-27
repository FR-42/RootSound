using RootSound.TimbreLab.Core;

namespace RootSound.PhraseStudio.Core;

public enum EditorMode { StepSequencer, PianoRoll }

public sealed record PhraseNote(Guid Id, int Pitch, long StartTick, long LengthTick, double Velocity);

public sealed record PhraseChannel(Guid Id, string Name, InstrumentPatch? Timbre, EditorMode Mode,
    int StepPitch, double GainDb, bool Muted, IReadOnlyList<PhraseNote> Notes);

public sealed record PhraseDocument(Guid Id, string Name, double Tempo, int Bars,
    IReadOnlyList<PhraseChannel> Channels);

public static class Timing
{
    public const int Ppq = 960;
    public const int BeatsPerBar = 4;
    public const int TicksPerBar = Ppq * BeatsPerBar;
    public const int TicksPerStep = Ppq / 4;
    public static long DurationTicks(PhraseDocument document) => checked((long)document.Bars * TicksPerBar);
    public static double SecondsPerTick(double tempo) => 60 / (tempo * Ppq);
}

public static class PhraseFactory
{
    public static PhraseDocument New(string name, double tempo = 120, int bars = 1)
    {
        var result = new PhraseDocument(Guid.NewGuid(), name.Trim(), tempo, bars, Array.Empty<PhraseChannel>());
        PhraseValidation.Validate(result);
        return result;
    }

    public static PhraseChannel Channel(IEnumerable<PhraseChannel> existing, string name = "通道",
        EditorMode mode = EditorMode.StepSequencer) => new(Guid.NewGuid(),
            UniqueName(name, existing.Select(channel => channel.Name)), null, mode, 60, 0, false,
            Array.Empty<PhraseNote>());

    public static string UniqueName(string candidate, IEnumerable<string> existing)
    {
        candidate = candidate.Trim();
        if (candidate.Length == 0) candidate = "未命名";
        if (candidate.Length > 240) candidate = candidate[..240];
        HashSet<string> names = new(existing, StringComparer.OrdinalIgnoreCase);
        if (!names.Contains(candidate)) return candidate;
        for (int i = 2; ; i++)
        {
            string suffix = $" ({i})";
            string result = candidate[..Math.Min(candidate.Length, 240 - suffix.Length)] + suffix;
            if (!names.Contains(result)) return result;
        }
    }
}

public static class PhraseValidation
{
    public const int MaximumChannels = 32;
    public const int MaximumNotes = 10_000;
    public const long MaximumEmbeddedSampleBytes = 512L * 1024 * 1024;

    public static bool CanSave(PhraseDocument? document)
    {
        if (document is null) return false;
        try { Validate(document, requirePlayable: true); return true; }
        catch (ArgumentException) { return false; }
        catch (InvalidDataException) { return false; }
    }

    public static void Validate(PhraseDocument document, bool requirePlayable = false, bool inspectSamples = false)
    {
        ArgumentNullException.ThrowIfNull(document);
        Name(document.Name);
        if (document.Id == Guid.Empty || !double.IsFinite(document.Tempo) || document.Tempo is < 20 or > 300 ||
            document.Bars is < 1 or > 16 || document.Channels is null || document.Channels.Count > MaximumChannels)
            throw new InvalidDataException("乐句参数无效：速度须为 20～300，长度须为 1～16 小节。 ");
        if (requirePlayable && document.Channels.Count == 0)
            throw new InvalidDataException("请先新建通道并导入音色。 ");
        HashSet<Guid> channels = new(), notes = new();
        HashSet<string> names = new(StringComparer.OrdinalIgnoreCase);
        long audioBytes = 0, duration = Timing.DurationTicks(document);
        HashSet<PcmClip> clips = new(ReferenceEqualityComparer.Instance);
        foreach (var channel in document.Channels)
        {
            if (channel is null) throw new InvalidDataException("通道不能为空。 ");
            Name(channel.Name);
            if (channel.Id == Guid.Empty || !channels.Add(channel.Id) || !names.Add(channel.Name) ||
                !Enum.IsDefined(channel.Mode) || channel.StepPitch is < 0 or > 127 ||
                !double.IsFinite(channel.GainDb) || channel.GainDb is < -60 or > 24 || channel.Notes is null)
                throw new InvalidDataException("通道名称、编号或设置无效。 ");
            if (requirePlayable && channel.Timbre is null)
                throw new InvalidDataException("每个通道都需要先导入音色才能保存。 ");
            if (channel.Timbre is { } patch)
            {
                Name(patch.Name);
                RootSound.TimbreLab.Instrument.InstrumentValidation.Clip(patch.Audio, inspectSamples);
                RootSound.TimbreLab.Instrument.InstrumentValidation.Settings(patch.Settings, patch.Audio.FrameCount, patch.Audio.SampleRate);
                if (clips.Add(patch.Audio)) audioBytes = checked(audioBytes + patch.Audio.Samples.LongLength * 4);
                if (audioBytes > MaximumEmbeddedSampleBytes)
                    throw new InvalidDataException("乐句包含的音色过大，请减少音色数量或缩短采样。 ");
            }
            foreach (var note in channel.Notes)
            {
                if (note is null || note.Id == Guid.Empty || !notes.Add(note.Id) || notes.Count > MaximumNotes ||
                    note.Pitch is < 0 or > 127 || note.StartTick < 0 || note.StartTick >= duration ||
                    note.LengthTick <= 0 || note.LengthTick > duration - note.StartTick ||
                    !double.IsFinite(note.Velocity) || note.Velocity is <= 0 or > 1)
                    throw new InvalidDataException("音符超出乐句范围，或音符参数无效。 ");
            }
        }
    }

    internal static void Name(string? name)
    {
        if (string.IsNullOrWhiteSpace(name) || name != name.Trim() || name.Length > 240 || name.Any(char.IsControl))
            throw new InvalidDataException("名称须为 1～240 个可见字符。 ");
    }
}
