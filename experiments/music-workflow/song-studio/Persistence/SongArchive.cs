using System.Buffers.Binary;
using System.IO.Compression;
using System.Security.Cryptography;
using RootSound.PhraseStudio.Persistence;
using RootSound.SongStudio.Core;
using RootSound.TimbreLab.Core;

namespace RootSound.SongStudio.Persistence;
internal static class SongArchive
{
    internal static void Save(SongDocument song, string destination, bool overwrite, CancellationToken token)
    {
        var capture = SongFormat.Capture(song, token); byte[] json = SongFormat.Serialize(capture.Manifest);
        PhraseArchive.AtomicWrite(destination, overwrite, token, stream =>
        {
            using var zip = new ZipArchive(stream, ZipArchiveMode.Create, true);
            using (var output = zip.CreateEntry("manifest.json", CompressionLevel.Optimal).Open()) output.Write(json);
            foreach (var pair in capture.Assets)
            {
                using var output = zip.CreateEntry("assets/" + pair.Key + ".f32", CompressionLevel.Fastest).Open();
                WriteAudio(output, pair.Value.Audio, token);
            }
        });
    }
    internal static SongDocument Load(string path, CancellationToken token)
    {
        token.ThrowIfCancellationRequested();
        using var file = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        if (file.Length > SongRules.MaximumSampleBytes + SongFormat.MaximumManifestBytes + 4 * 1024 * 1024)
            throw new InvalidDataException("歌曲文件过大。 ");
        CheckDirectory(file);
        using var zip = new ZipArchive(file, ZipArchiveMode.Read);
        var entry = zip.GetEntry("manifest.json") ?? throw new InvalidDataException("缺少歌曲说明。 ");
        SongFormat.Manifest manifest;
        using (var input = entry.Open()) manifest = SongFormat.Parse(input, entry.Length);
        var descriptions = SongFormat.Assets(manifest);
        HashSet<string> expected = new(descriptions.Keys.Select(k => "assets/" + k + ".f32"), StringComparer.Ordinal) { "manifest.json" };
        if (zip.Entries.Count != expected.Count || zip.Entries.Any(e => !expected.Remove(e.FullName)) || expected.Count != 0)
            throw new InvalidDataException("歌曲文件包含重复、缺失或未知内容。 ");
        Dictionary<string, InstrumentPatch> assets = new(StringComparer.Ordinal);
        foreach (var pair in descriptions)
        {
            token.ThrowIfCancellationRequested(); var assetEntry = zip.GetEntry("assets/" + pair.Key + ".f32")!;
            using var input = assetEntry.Open(); assets.Add(pair.Key, ReadAudio(input, assetEntry.Length, pair.Value, token));
        }
        token.ThrowIfCancellationRequested(); return SongFormat.Restore(manifest, assets);
    }
    internal static void WriteAudio(Stream stream, PcmClip clip, CancellationToken token)
    {
        byte[] buffer = new byte[65536];
        for (int offset = 0; offset < clip.Samples.Length;)
        {
            token.ThrowIfCancellationRequested(); int count = Math.Min(buffer.Length / 4, clip.Samples.Length - offset);
            for (int i = 0; i < count; i++) BinaryPrimitives.WriteSingleLittleEndian(buffer.AsSpan(i * 4), clip.Samples[offset + i]);
            stream.Write(buffer, 0, count * 4); offset += count;
        }
    }
    internal static InstrumentPatch ReadAudio(Stream input, long length, DocumentFormat.AssetData asset, CancellationToken token)
    {
        long count = checked(asset.Frames * asset.Channels);
        if (length != count * 4) throw new InvalidDataException("歌曲音色数据长度不正确。 ");
        float[] samples = new float[checked((int)count)]; byte[] buffer = new byte[65536];
        using var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
        for (int offset = 0; offset < samples.Length;)
        {
            token.ThrowIfCancellationRequested(); int take = Math.Min(buffer.Length / 4, samples.Length - offset);
            input.ReadExactly(buffer.AsSpan(0, take * 4)); hash.AppendData(buffer, 0, take * 4);
            for (int i = 0; i < take; i++)
            {
                float value = BinaryPrimitives.ReadSingleLittleEndian(buffer.AsSpan(i * 4));
                if (!float.IsFinite(value) || Math.Abs(value) > 32) throw new InvalidDataException("歌曲音色包含无效采样。 ");
                samples[offset + i] = value;
            }
            offset += take;
        }
        if (input.ReadByte() != -1 || !CryptographicOperations.FixedTimeEquals(hash.GetHashAndReset(), Convert.FromHexString(asset.AudioSha256)))
            throw new InvalidDataException("歌曲音色校验失败，文件可能损坏。 ");
        return new(new PcmClip(asset.SampleRate, asset.Channels, samples, asset.Name), asset.Settings, asset.Name);
    }
    private static void CheckDirectory(FileStream stream)
    {
        if (stream.Length < 22) throw new InvalidDataException("歌曲压缩包不完整。 ");
        byte[] tail = new byte[(int)Math.Min(65557, stream.Length)]; stream.Position = stream.Length - tail.Length; stream.ReadExactly(tail);
        for (int offset = tail.Length - 22; offset >= 0; offset--)
        {
            var record = tail.AsSpan(offset);
            if (BinaryPrimitives.ReadUInt32LittleEndian(record) != 0x06054b50 ||
                offset + 22 + BinaryPrimitives.ReadUInt16LittleEndian(record[20..]) != tail.Length) continue;
            int entries = BinaryPrimitives.ReadUInt16LittleEndian(record[10..]);
            long size = BinaryPrimitives.ReadUInt32LittleEndian(record[12..]), start = BinaryPrimitives.ReadUInt32LittleEndian(record[16..]);
            if (BinaryPrimitives.ReadUInt16LittleEndian(record[4..]) != 0 || BinaryPrimitives.ReadUInt16LittleEndian(record[6..]) != 0 ||
                BinaryPrimitives.ReadUInt16LittleEndian(record[8..]) != entries || entries is < 1 or > 2049 ||
                size is <= 0 or > 1024 * 1024 || start + size != stream.Length - tail.Length + offset)
                throw new InvalidDataException("歌曲压缩包目录无效。 ");
            stream.Position = 0; return;
        }
        throw new InvalidDataException("歌曲压缩包缺少完整目录。 ");
    }
}
