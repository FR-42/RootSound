using System.Buffers.Binary;
using System.IO.Compression;
using System.Security.Cryptography;
using RootSound.PhraseStudio.Core;
using RootSound.TimbreLab.Core;

namespace RootSound.PhraseStudio.Persistence;

public static class PhraseArchive
{
    public static Task SaveAsync(PhraseDocument document, string destination, bool overwrite = false,
        CancellationToken cancellationToken = default) => Task.Run(() => Save(document, destination, overwrite, cancellationToken), cancellationToken);
    public static Task<PhraseDocument> LoadAsync(string path, CancellationToken cancellationToken = default) =>
        Task.Run(() => Load(path, cancellationToken), cancellationToken);
    public static Task<string> FileHashAsync(string path, CancellationToken cancellationToken = default) => Task.Run(() =>
    {
        using var stream = File.OpenRead(path);
        using var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
        byte[] buffer = new byte[128 * 1024]; int count;
        while ((count = stream.Read(buffer)) != 0)
        { cancellationToken.ThrowIfCancellationRequested(); hash.AppendData(buffer, 0, count); }
        cancellationToken.ThrowIfCancellationRequested();
        return Convert.ToHexString(hash.GetHashAndReset());
    }, cancellationToken);

    internal static void Save(PhraseDocument document, string destination, bool overwrite, CancellationToken token)
    {
        PhraseValidation.Validate(document, requirePlayable: true);
        token.ThrowIfCancellationRequested();
        var capture = DocumentFormat.Capture(document, cancellationToken: token);
        byte[] manifest = DocumentFormat.Serialize(capture.Manifest);
        AtomicWrite(destination, overwrite, token, stream =>
        {
            using var zip = new ZipArchive(stream, ZipArchiveMode.Create, leaveOpen: true);
            using (var output = zip.CreateEntry("manifest.json", CompressionLevel.Optimal).Open()) output.Write(manifest);
            foreach (var pair in capture.Assets)
            {
                using var output = zip.CreateEntry("assets/" + pair.Key + ".f32", CompressionLevel.Fastest).Open();
                byte[] buffer = new byte[65536]; var samples = pair.Value.Audio.Samples;
                for (int offset = 0; offset < samples.Length;)
                {
                    token.ThrowIfCancellationRequested(); int count = Math.Min(buffer.Length / 4, samples.Length - offset);
                    for (int i = 0; i < count; i++) BinaryPrimitives.WriteSingleLittleEndian(buffer.AsSpan(i * 4), samples[offset + i]);
                    output.Write(buffer, 0, count * 4); offset += count;
                }
            }
        });
    }

    internal static PhraseDocument Load(string path, CancellationToken token)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(path); token.ThrowIfCancellationRequested();
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        if (stream.Length > PhraseValidation.MaximumEmbeddedSampleBytes + DocumentFormat.MaximumManifestBytes + 1024 * 1024)
            throw new InvalidDataException("乐句文件过大。 ");
        CheckDirectory(stream);
        using var zip = new ZipArchive(stream, ZipArchiveMode.Read);
        var manifestEntry = zip.GetEntry("manifest.json") ?? throw new InvalidDataException("缺少乐句说明。 ");
        DocumentFormat.Manifest manifest;
        using (var input = manifestEntry.Open()) manifest = DocumentFormat.Parse(input, manifestEntry.Length);
        HashSet<string> expected = new(manifest.Assets.Select(asset => "assets/" + asset.Key + ".f32"), StringComparer.Ordinal) { "manifest.json" };
        if (zip.Entries.Count != expected.Count || zip.Entries.Any(entry => !expected.Remove(entry.FullName)) || expected.Count != 0)
            throw new InvalidDataException("乐句文件包含重复、缺失或未知内容。 ");
        Dictionary<string, InstrumentPatch> assets = new(StringComparer.Ordinal);
        foreach (var asset in manifest.Assets)
        {
            token.ThrowIfCancellationRequested();
            var entry = zip.GetEntry("assets/" + asset.Key + ".f32")!;
            long count = checked(asset.Frames * asset.Channels);
            if (entry.Length != count * 4) throw new InvalidDataException("音色数据长度不正确。 ");
            float[] samples = new float[checked((int)count)]; byte[] buffer = new byte[65536];
            using var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
            using (var input = entry.Open())
            {
                for (int offset = 0; offset < samples.Length;)
                {
                    token.ThrowIfCancellationRequested(); int amount = Math.Min(buffer.Length / 4, samples.Length - offset);
                    input.ReadExactly(buffer.AsSpan(0, amount * 4)); hash.AppendData(buffer, 0, amount * 4);
                    for (int i = 0; i < amount; i++)
                    {
                        float value = BinaryPrimitives.ReadSingleLittleEndian(buffer.AsSpan(i * 4));
                        if (!float.IsFinite(value) || Math.Abs(value) > 32) throw new InvalidDataException("音色采样数值无效。 ");
                        samples[offset + i] = value;
                    }
                    offset += amount;
                }
                if (input.ReadByte() != -1) throw new InvalidDataException("音色包含多余数据。 ");
            }
            if (!CryptographicOperations.FixedTimeEquals(hash.GetHashAndReset(), Convert.FromHexString(asset.AudioSha256)))
                throw new InvalidDataException("音色数据校验失败，乐句文件可能损坏。 ");
            assets.Add(asset.Key, new InstrumentPatch(new PcmClip(asset.SampleRate, asset.Channels, samples, asset.Name), asset.Settings, asset.Name));
        }
        var document = DocumentFormat.Restore(manifest, assets); PhraseValidation.Validate(document, requirePlayable: true);
        token.ThrowIfCancellationRequested(); return document;
    }

    internal static void AtomicWrite(string destination, bool overwrite, CancellationToken token, Action<Stream> write)
    {
        destination = Path.GetFullPath(destination); string directory = Path.GetDirectoryName(destination)!;
        if (!Directory.Exists(directory)) throw new DirectoryNotFoundException("保存位置不存在。 ");
        if (!overwrite && File.Exists(destination)) throw new IOException("文件已存在，请选择新名称。 ");
        token.ThrowIfCancellationRequested(); string stage = Path.Combine(directory, ".rootsound-phrase-" + Guid.NewGuid().ToString("N") + ".tmp");
        try
        {
            using (var output = new FileStream(stage, FileMode.CreateNew, FileAccess.Write, FileShare.None, 128 * 1024))
            { write(output); token.ThrowIfCancellationRequested(); output.Flush(true); }
            token.ThrowIfCancellationRequested();
            if (overwrite && File.Exists(destination)) File.Replace(stage, destination, null, true);
            else File.Move(stage, destination, overwrite: false);
        }
        finally { try { File.Delete(stage); } catch (IOException) { } catch (UnauthorizedAccessException) { } }
    }

    private static void CheckDirectory(FileStream stream)
    {
        if (stream.Length < 22) throw new InvalidDataException("乐句压缩包不完整。 ");
        byte[] tail = new byte[(int)Math.Min(65557, stream.Length)]; stream.Position = stream.Length - tail.Length; stream.ReadExactly(tail);
        for (int offset = tail.Length - 22; offset >= 0; offset--)
        {
            var record = tail.AsSpan(offset);
            if (BinaryPrimitives.ReadUInt32LittleEndian(record) != 0x06054b50 ||
                offset + 22 + BinaryPrimitives.ReadUInt16LittleEndian(record[20..]) != tail.Length) continue;
            int entries = BinaryPrimitives.ReadUInt16LittleEndian(record[10..]);
            long size = BinaryPrimitives.ReadUInt32LittleEndian(record[12..]);
            long start = BinaryPrimitives.ReadUInt32LittleEndian(record[16..]);
            if (BinaryPrimitives.ReadUInt16LittleEndian(record[4..]) != 0 || BinaryPrimitives.ReadUInt16LittleEndian(record[6..]) != 0 ||
                BinaryPrimitives.ReadUInt16LittleEndian(record[8..]) != entries || entries is < 1 or > PhraseValidation.MaximumChannels + 1 ||
                size is <= 0 or > 65536 || start + size != stream.Length - tail.Length + offset)
                throw new InvalidDataException("乐句压缩包目录无效或过大。 ");
            stream.Position = 0; return;
        }
        throw new InvalidDataException("乐句压缩包缺少完整目录。 ");
    }
}
