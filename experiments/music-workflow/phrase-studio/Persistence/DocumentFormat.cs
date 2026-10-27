using System.Buffers.Binary;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using RootSound.PhraseStudio.Core;
using RootSound.TimbreLab.Core;

namespace RootSound.PhraseStudio.Persistence;

internal static class DocumentFormat
{
    internal const int MaximumManifestBytes = 8 * 1024 * 1024;
    internal static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow,
        MaxDepth = 32
    };
    private static readonly ConditionalWeakTable<InstrumentPatch, AssetIdentity> Identities = new();

    internal sealed record Manifest(string Format, int Version, Guid Id, string Name, double Tempo, int Bars,
        ChannelData[] Channels, AssetData[] Assets, string? SavedPath = null, string? SavedSha256 = null);
    internal sealed record ChannelData(Guid Id, string Name, string? AssetKey, EditorMode Mode, int StepPitch,
        double GainDb, bool Muted, PhraseNote[] Notes);
    internal sealed record AssetData(string Key, string Name, int SampleRate, int Channels, long Frames,
        string AudioSha256, InstrumentSettings Settings);
    internal sealed record AssetIdentity(string Key, string AudioSha256);

    internal static AssetIdentity Identity(InstrumentPatch patch, CancellationToken cancellationToken = default,
        Action<int>? chunkProcessed = null)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return Identities.GetValue(patch, item =>
        {
            RootSound.TimbreLab.Instrument.InstrumentValidation.Clip(item.Audio);
            string hash = AudioHash(item.Audio, cancellationToken, chunkProcessed);
            cancellationToken.ThrowIfCancellationRequested();
            return new AssetIdentity(Key(item.Name, item.Audio.SampleRate, item.Audio.Channels, item.Audio.FrameCount, hash, item.Settings), hash);
        });
    }

    internal static string AudioHash(PcmClip clip, CancellationToken cancellationToken = default,
        Action<int>? chunkProcessed = null)
    {
        using var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
        byte[] buffer = new byte[65536];
        for (int offset = 0; offset < clip.Samples.Length;)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int count = Math.Min(buffer.Length / 4, clip.Samples.Length - offset);
            for (int i = 0; i < count; i++)
            {
                float sample = clip.Samples[offset + i];
                if (!float.IsFinite(sample) || Math.Abs(sample) > 32)
                    throw new InvalidDataException("音色包含无效或过大的采样值。 ");
                BinaryPrimitives.WriteSingleLittleEndian(buffer.AsSpan(i * 4), sample);
            }
            hash.AppendData(buffer, 0, count * 4); offset += count;
            chunkProcessed?.Invoke(offset);
        }
        cancellationToken.ThrowIfCancellationRequested();
        return Convert.ToHexString(hash.GetHashAndReset());
    }

    private static string Key(string name, int rate, int channels, long frames, string hash, InstrumentSettings settings) =>
        Convert.ToHexString(SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(new { name, rate, channels, frames, hash, settings }, JsonOptions)));

    internal static (Manifest Manifest, Dictionary<string, InstrumentPatch> Assets) Capture(PhraseDocument document,
        string? savedPath = null, string? savedHash = null, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        PhraseValidation.Validate(document);
        if (savedPath is { Length: > 32768 } || savedHash is not null && !IsHash(savedHash))
            throw new InvalidDataException("恢复信息无效。 ");
        Dictionary<string, InstrumentPatch> assets = new(StringComparer.Ordinal);
        var channels = document.Channels.Select(channel =>
        {
            cancellationToken.ThrowIfCancellationRequested();
            string? key = null;
            if (channel.Timbre is { } patch)
            { key = Identity(patch, cancellationToken).Key; assets.TryAdd(key, patch); }
            return new ChannelData(channel.Id, channel.Name, key, channel.Mode, channel.StepPitch,
                channel.GainDb, channel.Muted, channel.Notes.ToArray());
        }).ToArray();
        var descriptions = assets.Select(pair => new AssetData(pair.Key, pair.Value.Name, pair.Value.Audio.SampleRate,
            pair.Value.Audio.Channels, pair.Value.Audio.FrameCount, Identity(pair.Value, cancellationToken).AudioSha256, pair.Value.Settings)).ToArray();
        return (new Manifest("RootSound.Phrase", 1, document.Id, document.Name, document.Tempo, document.Bars,
            channels, descriptions, savedPath, savedHash), assets);
    }

    internal static byte[] Serialize(Manifest manifest)
    {
        byte[] json = JsonSerializer.SerializeToUtf8Bytes(manifest, JsonOptions);
        if (json.Length > MaximumManifestBytes) throw new InvalidDataException("乐句内容过大。 ");
        return json;
    }

    internal static Manifest Parse(Stream stream, long length)
    {
        if (length is <= 0 or > MaximumManifestBytes) throw new InvalidDataException("乐句说明长度无效。 ");
        byte[] json = new byte[checked((int)length)]; stream.ReadExactly(json);
        if (stream.ReadByte() != -1) throw new InvalidDataException("乐句说明包含多余数据。 ");
        Manifest manifest;
        try { manifest = JsonSerializer.Deserialize<Manifest>(json, JsonOptions) ?? throw new JsonException(); }
        catch (JsonException ex) { throw new InvalidDataException("乐句说明无法读取。 ", ex); }
        ValidateManifest(manifest);
        return manifest;
    }

    private static void ValidateManifest(Manifest manifest)
    {
        if (manifest.Format != "RootSound.Phrase" || manifest.Version != 1 || manifest.Channels is null ||
            manifest.Assets is null || manifest.Channels.Length > PhraseValidation.MaximumChannels ||
            manifest.Assets.Length > PhraseValidation.MaximumChannels || manifest.SavedPath is { Length: > 32768 } ||
            manifest.SavedSha256 is not null && !IsHash(manifest.SavedSha256))
            throw new InvalidDataException("乐句文件版本或结构无效。 ");
        HashSet<string> keys = new(StringComparer.Ordinal); long bytes = 0;
        foreach (var asset in manifest.Assets)
        {
            if (asset is null || !IsHash(asset.Key) || !keys.Add(asset.Key) || !IsHash(asset.AudioSha256) ||
                asset.SampleRate is < 8000 or > 384000 || asset.Channels is < 1 or > 8 || asset.Frames <= 0 ||
                asset.Frames > 30L * asset.SampleRate || asset.Frames > 16_000_000L / asset.Channels)
                throw new InvalidDataException("乐句音色参数无效。 ");
            PhraseValidation.Name(asset.Name);
            RootSound.TimbreLab.Instrument.InstrumentValidation.Settings(asset.Settings, asset.Frames, asset.SampleRate);
            if (asset.Key != Key(asset.Name, asset.SampleRate, asset.Channels, asset.Frames, asset.AudioSha256, asset.Settings))
                throw new InvalidDataException("乐句音色说明校验失败。 ");
            bytes = checked(bytes + asset.Frames * asset.Channels * 4);
            if (bytes > PhraseValidation.MaximumEmbeddedSampleBytes) throw new InvalidDataException("乐句音色总量过大。 ");
        }
        HashSet<string> referenced = new(StringComparer.Ordinal); int notes = 0;
        foreach (var channel in manifest.Channels)
        {
            if (channel is null || channel.Notes is null) throw new InvalidDataException("乐句通道无效。 ");
            if (channel.AssetKey is { } key && !keys.Contains(key)) throw new InvalidDataException("乐句缺少音色。 ");
            if (channel.AssetKey is { } used) referenced.Add(used);
            notes = checked(notes + channel.Notes.Length);
            if (notes > PhraseValidation.MaximumNotes) throw new InvalidDataException("乐句音符数量过多。 ");
        }
        if (referenced.Count != keys.Count) throw new InvalidDataException("乐句包含未使用的音色。 ");
        // Validate all musical ranges before allocating sample arrays; placeholders are never returned to callers.
        var placeholders = manifest.Assets.ToDictionary(asset => asset.Key, asset => new InstrumentPatch(
            new PcmClip(asset.SampleRate, asset.Channels, new float[asset.Channels], asset.Name), new InstrumentSettings(), asset.Name));
        Restore(manifest, placeholders);
    }

    internal static PhraseDocument Restore(Manifest manifest, IReadOnlyDictionary<string, InstrumentPatch> assets)
    {
        var document = new PhraseDocument(manifest.Id, manifest.Name, manifest.Tempo, manifest.Bars,
            manifest.Channels.Select(channel => new PhraseChannel(channel.Id, channel.Name,
                channel.AssetKey is { } key ? assets[key] : null, channel.Mode, channel.StepPitch, channel.GainDb,
                channel.Muted, Array.AsReadOnly(channel.Notes))).ToArray());
        PhraseValidation.Validate(document);
        return document;
    }

    internal static bool IsHash(string? value) => value is { Length: 64 } && value.All(character =>
        character is >= '0' and <= '9' or >= 'A' and <= 'F');
}
