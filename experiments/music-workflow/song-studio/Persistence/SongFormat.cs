using System.Text.Json;
using RootSound.PhraseStudio.Persistence;
using RootSound.SongStudio.Core;
using RootSound.TimbreLab.Core;

namespace RootSound.SongStudio.Persistence;
internal static class SongFormat
{
    internal const int MaximumManifestBytes = 32 * 1024 * 1024;
    internal sealed record PhraseData(Guid Id, string Name, DocumentFormat.Manifest Phrase);
    internal sealed record Manifest(string Format, int Version, Guid Id, string Name, double Tempo, double GainDb,
        PhraseData[] Phrases, SongTrack[] Tracks, SongClip[] Clips);
    internal static (Manifest Manifest, Dictionary<string, InstrumentPatch> Assets) Capture(SongDocument song, CancellationToken token)
    {
        SongRules.Validate(song); Dictionary<string, InstrumentPatch> assets = new(StringComparer.Ordinal);
        var phrases = song.Phrases.Select(item =>
        {
            token.ThrowIfCancellationRequested(); var capture = DocumentFormat.Capture(item.Phrase, cancellationToken: token);
            foreach (var asset in capture.Assets) assets.TryAdd(asset.Key, asset.Value);
            return new PhraseData(item.Id, item.Name, capture.Manifest);
        }).ToArray();
        return (new("RootSound.SongPlaylist", 1, song.Id, song.Name, song.Tempo, song.GainDb,
            phrases, song.Tracks.ToArray(), song.Clips.ToArray()), assets);
    }
    internal static byte[] Serialize(Manifest manifest)
    {
        byte[] json = JsonSerializer.SerializeToUtf8Bytes(manifest, DocumentFormat.JsonOptions);
        if (json.Length > MaximumManifestBytes) throw new InvalidDataException("歌曲说明超过容量。 ");
        return json;
    }
    internal static Manifest Parse(Stream stream, long length)
    {
        if (length is <= 0 or > MaximumManifestBytes) throw new InvalidDataException("歌曲说明长度无效。 ");
        byte[] json = new byte[(int)length]; stream.ReadExactly(json);
        if (stream.ReadByte() != -1) throw new InvalidDataException("歌曲说明包含多余数据。 ");
        Manifest manifest;
        try { manifest = JsonSerializer.Deserialize<Manifest>(json, DocumentFormat.JsonOptions) ?? throw new JsonException(); }
        catch (JsonException ex) { throw new InvalidDataException("歌曲说明无法读取。 ", ex); }
        if (manifest.Format != "RootSound.SongPlaylist" || manifest.Version != 1 || manifest.Phrases is null ||
            manifest.Tracks is null || manifest.Clips is null || manifest.Phrases.Length > SongRules.MaximumPhrases ||
            manifest.Tracks.Length > SongRules.MaximumTracks || manifest.Clips.Length > SongRules.MaximumClips)
            throw new InvalidDataException("歌曲文件版本或结构无效。 ");
        foreach (var item in manifest.Phrases)
        {
            if (item?.Phrase is null) throw new InvalidDataException("歌曲缺少乐句说明。 ");
            // Reuse the phrase format's full musical/asset validation before any large allocation.
            byte[] phraseJson = DocumentFormat.Serialize(item.Phrase);
            using var input = new MemoryStream(phraseJson, false); DocumentFormat.Parse(input, input.Length);
        }
        var descriptions = Assets(manifest);
        long bytes = descriptions.Values.Sum(a => checked(a.Frames * a.Channels * 4));
        if (bytes > SongRules.MaximumSampleBytes) throw new InvalidDataException("歌曲内音色总量超过 512 MB。 ");
        var placeholders = descriptions.ToDictionary(p => p.Key, p => new InstrumentPatch(
            new PcmClip(p.Value.SampleRate, p.Value.Channels, new float[p.Value.Channels], p.Value.Name), new(), p.Value.Name));
        Restore(manifest, placeholders);
        return manifest;
    }
    internal static Dictionary<string, DocumentFormat.AssetData> Assets(Manifest manifest)
    {
        Dictionary<string, DocumentFormat.AssetData> descriptions = new(StringComparer.Ordinal);
        foreach (var item in manifest.Phrases)
            foreach (var asset in item.Phrase.Assets)
                if (descriptions.TryGetValue(asset.Key, out var existing) && existing != asset)
                    throw new InvalidDataException("歌曲中的音色说明互相冲突。 ");
                else descriptions.TryAdd(asset.Key, asset);
        return descriptions;
    }
    internal static SongDocument Restore(Manifest manifest, IReadOnlyDictionary<string, InstrumentPatch> assets)
    {
        var song = new SongDocument(manifest.Id, manifest.Name, manifest.Tempo, manifest.GainDb,
            manifest.Phrases.Select(p => new SongPhrase(p.Id, p.Name, DocumentFormat.Restore(p.Phrase, assets))).ToArray(),
            Array.AsReadOnly(manifest.Tracks), Array.AsReadOnly(manifest.Clips));
        SongRules.Validate(song); return song;
    }
}
