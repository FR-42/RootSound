using RootSound.PhraseStudio.Core;
using RootSound.TimbreLab.Core;

namespace RootSound.ReferenceStudio.Core;

public sealed record CaseInfo(string Title, string SourceFileName, double SourceStartSeconds,
    double SourceDurationSeconds, string SourceSha256, string Summary, string AnalysisCaveat)
{
    // Informational provenance and overwrite protection only; reopening never reads this file.
    public string? SourcePath { get; init; }
}

public sealed record LayerDescription(Guid ChannelId, string Role, string Explanation, string Origin);

/// <summary>Editable sound controls. Sweep is the change across one phrase, not a claimed original setting.</summary>
public sealed record LayerSound(Guid ChannelId, double BrightnessHz = 16000, double Sweep = 0, double EchoMix = 0);

public sealed record ReferenceProject(PhraseDocument Phrase, PcmClip Reference, CaseInfo Info,
    IReadOnlyList<LayerDescription> Layers, IReadOnlyList<LayerSound> Sounds)
{
    public double ReferenceGainDb { get; init; }
    public double MasterGainDb { get; init; }
    public double DurationSeconds => Reference.DurationSeconds;
}

public static class ReferenceValidation
{
    public const int MaximumReferenceSeconds = 90;
    public const long MaximumReferenceBytes = 48000L * 2 * MaximumReferenceSeconds * 4;

    public static void Validate(ReferenceProject project, bool inspectSamples = false)
    {
        ArgumentNullException.ThrowIfNull(project);
        PhraseValidation.Validate(project.Phrase, requirePlayable: true, inspectSamples: inspectSamples);
        var reference = project.Reference ?? throw new InvalidDataException("案例缺少原曲片段。");
        if (reference.SampleRate != 48000 || reference.Channels != 2 ||
            reference.DurationSeconds is < .1 or > MaximumReferenceSeconds ||
            reference.Samples.LongLength * 4 > MaximumReferenceBytes)
            throw new InvalidDataException("案例参考音频须为 48 kHz 双声道，长度不超过 90 秒。");
        double phraseDuration = Timing.DurationTicks(project.Phrase) * Timing.SecondsPerTick(project.Phrase.Tempo);
        if (Math.Abs(phraseDuration - reference.DurationSeconds) > .05)
            throw new InvalidDataException("原曲片段和重建乐句的长度不一致。");
        if (project.Info is not { } info || !Text(info.Title, 240) || !Text(info.SourceFileName, 240) ||
            !Text(info.Summary, 4000) || !Text(info.AnalysisCaveat, 4000) ||
            !double.IsFinite(info.SourceStartSeconds) || info.SourceStartSeconds < 0 ||
            !double.IsFinite(info.SourceDurationSeconds) || info.SourceDurationSeconds < reference.DurationSeconds ||
            info.SourceStartSeconds + reference.DurationSeconds > info.SourceDurationSeconds + .05 ||
            info.SourcePath is { Length: > 32768 } ||
            info.SourceSha256 is not { Length: 64 } || !info.SourceSha256.All(Uri.IsHexDigit))
            throw new InvalidDataException("案例来源信息无效。");
        if (!double.IsFinite(project.ReferenceGainDb) || project.ReferenceGainDb is < -60 or > 12 ||
            !double.IsFinite(project.MasterGainDb) || project.MasterGainDb is < -60 or > 12)
            throw new InvalidDataException("案例试听音量无效。");
        var ids = project.Phrase.Channels.Select(c => c.Id).ToHashSet();
        if (project.Layers is null || project.Sounds is null || project.Layers.Count != ids.Count ||
            project.Sounds.Count != ids.Count || project.Layers.Any(l => l is null) || project.Sounds.Any(s => s is null) ||
            !project.Layers.Select(l => l.ChannelId).ToHashSet().SetEquals(ids) ||
            !project.Sounds.Select(s => s.ChannelId).ToHashSet().SetEquals(ids))
            throw new InvalidDataException("案例声音层的说明或控制不完整。");
        foreach (var layer in project.Layers)
            if (!Text(layer.Role, 240) || !Text(layer.Explanation, 4000) || !Text(layer.Origin, 1000))
                throw new InvalidDataException("声音层的说明无效。");
        foreach (var sound in project.Sounds)
            if (!double.IsFinite(sound.BrightnessHz) || sound.BrightnessHz is < 80 or > 20000 ||
                !double.IsFinite(sound.Sweep) || sound.Sweep is < -1 or > 1 ||
                !double.IsFinite(sound.EchoMix) || sound.EchoMix is < 0 or > .5)
                throw new InvalidDataException("声音变化的参数无效。");
        if (inspectSamples && reference.Samples.Any(v => !float.IsFinite(v) || Math.Abs(v) > 32))
            throw new InvalidDataException("参考音频包含无效采样。");
    }

    private static bool Text(string? text, int length) => !string.IsNullOrWhiteSpace(text) &&
        text.Length <= length && !text.Any(c => char.IsControl(c) && c is not '\r' and not '\n' and not '\t');
}
