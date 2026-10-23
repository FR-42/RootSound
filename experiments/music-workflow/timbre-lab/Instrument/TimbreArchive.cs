using System.Buffers.Binary;
using System.IO.Compression;
using System.Security.Cryptography;
using System.Text.Json;
using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Instrument;

/// <summary>A portable editable instrument: versioned settings and exact float sampling data.</summary>
public static class TimbreArchive
{
    private const int MaximumManifestBytes = 64 * 1024;
    private const long MaximumFileBytes = InstrumentValidation.MaximumSamples * 4L + 1024 * 1024;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true, PropertyNameCaseInsensitive = false };

    public static Task ExportAsync(InstrumentPatch patch, string destination, bool overwrite = false,
        CancellationToken cancellationToken = default) =>
        Task.Run(() => Export(patch, destination, overwrite, cancellationToken), cancellationToken);

    public static Task<InstrumentPatch> ImportAsync(string path, CancellationToken cancellationToken = default) =>
        Task.Run(() => Import(path, cancellationToken), cancellationToken);

    internal static void Export(InstrumentPatch patch, string destination, bool overwrite, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(patch);
        InstrumentValidation.Clip(patch.Audio, inspectSamples: true);
        InstrumentValidation.Settings(patch.Settings, patch.Audio.FrameCount, patch.Audio.SampleRate);
        ValidateName(patch.Name);
        AtomicFile.Write(destination, overwrite, cancellationToken, stream =>
        {
            using var zip = new ZipArchive(stream, ZipArchiveMode.Create, leaveOpen: true);
            var audioEntry = zip.CreateEntry("audio.f32", CompressionLevel.Fastest);
            using var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
            using (var audioStream = audioEntry.Open())
            {
                byte[] buffer = new byte[65536];
                int offset = 0;
                while (offset < patch.Audio.Samples.Length)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    int count = Math.Min(buffer.Length / 4, patch.Audio.Samples.Length - offset);
                    for (int i = 0; i < count; i++)
                        BinaryPrimitives.WriteSingleLittleEndian(buffer.AsSpan(i * 4), patch.Audio.Samples[offset + i]);
                    audioStream.Write(buffer, 0, count * 4);
                    hash.AppendData(buffer, 0, count * 4);
                    offset += count;
                }
            }
            var manifest = new Manifest("RootSound.Timbre", 1, patch.Name, patch.Audio.SampleRate, patch.Audio.Channels,
                patch.Audio.FrameCount, "audio.f32", Convert.ToHexString(hash.GetHashAndReset()), patch.Settings);
            byte[] json = JsonSerializer.SerializeToUtf8Bytes(manifest, JsonOptions);
            if (json.Length > MaximumManifestBytes) throw new InvalidDataException("音色说明过长。 ");
            using var manifestStream = zip.CreateEntry("manifest.json", CompressionLevel.Optimal).Open();
            manifestStream.Write(json);
        });
    }

    internal static InstrumentPatch Import(string path, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(path);
        cancellationToken.ThrowIfCancellationRequested();
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, 65536);
        if (stream.Length > MaximumFileBytes) throw new InvalidDataException("音色文件过大。 ");
        ValidateZipDirectory(stream);
        using var zip = new ZipArchive(stream, ZipArchiveMode.Read, leaveOpen: false);
        // Nothing is extracted to disk. Exact entry names reject duplicates, traversal and extra payloads.
        if (zip.Entries.Count != 2 || zip.Entries.Count(entry => entry.FullName == "manifest.json") != 1 ||
            zip.Entries.Count(entry => entry.FullName == "audio.f32") != 1)
            throw new InvalidDataException("音色文件的内容结构不正确。 ");
        var manifestEntry = zip.GetEntry("manifest.json")!;
        if (manifestEntry.Length is <= 0 or > MaximumManifestBytes)
            throw new InvalidDataException("音色说明无效或过大。 ");
        byte[] json = new byte[checked((int)manifestEntry.Length)];
        using (var input = manifestEntry.Open())
        {
            input.ReadExactly(json);
            if (input.ReadByte() != -1) throw new InvalidDataException("音色说明的长度不正确。 ");
        }
        Manifest manifest;
        try { manifest = JsonSerializer.Deserialize<Manifest>(json, JsonOptions) ?? throw new JsonException(); }
        catch (JsonException ex) { throw new InvalidDataException("无法读取音色说明。 ", ex); }
        if (manifest.Format != "RootSound.Timbre" || manifest.Version != 1 || manifest.AudioEntry != "audio.f32")
            throw new InvalidDataException("尚不支持这种音色文件版本。 ");
        ValidateName(manifest.Name);
        if (manifest.SampleRate is < 8000 or > 384000 || manifest.Channels is < 1 or > 8 || manifest.Frames <= 0 ||
            manifest.Frames > (long)manifest.SampleRate * InstrumentValidation.MaximumSeconds ||
            manifest.Frames > InstrumentValidation.MaximumSamples / manifest.Channels ||
            manifest.AudioSha256 is null || manifest.AudioSha256.Length != 64)
            throw new InvalidDataException("音色采样的参数无效或超出限制。 ");
        InstrumentValidation.Settings(manifest.Settings, manifest.Frames, manifest.SampleRate);
        var audioEntry = zip.GetEntry("audio.f32")!;
        int sampleCount = checked((int)(manifest.Frames * manifest.Channels));
        if (audioEntry.Length != (long)sampleCount * 4)
            throw new InvalidDataException("音色采样数据不完整或长度不正确。 ");
        byte[] expectedHash;
        try { expectedHash = Convert.FromHexString(manifest.AudioSha256); }
        catch (FormatException ex) { throw new InvalidDataException("音色校验信息无效。 ", ex); }
        float[] samples = new float[sampleCount];
        using var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
        using (var input = audioEntry.Open())
        {
            byte[] buffer = new byte[65536];
            int offset = 0;
            while (offset < samples.Length)
            {
                cancellationToken.ThrowIfCancellationRequested();
                int count = Math.Min(buffer.Length / 4, samples.Length - offset);
                input.ReadExactly(buffer.AsSpan(0, count * 4));
                hash.AppendData(buffer, 0, count * 4);
                for (int i = 0; i < count; i++)
                {
                    float sample = BinaryPrimitives.ReadSingleLittleEndian(buffer.AsSpan(i * 4));
                    if (!float.IsFinite(sample) || Math.Abs(sample) > 32)
                        throw new InvalidDataException("音色包含无效采样值。 ");
                    samples[offset + i] = sample;
                }
                offset += count;
            }
            if (input.ReadByte() != -1) throw new InvalidDataException("音色包含多余的采样数据。 ");
        }
        if (!CryptographicOperations.FixedTimeEquals(hash.GetHashAndReset(), expectedHash))
            throw new InvalidDataException("音色采样校验失败，文件可能已经损坏。 ");
        cancellationToken.ThrowIfCancellationRequested();
        return new InstrumentPatch(new PcmClip(manifest.SampleRate, manifest.Channels, samples, manifest.Name), manifest.Settings, manifest.Name);
    }

    private static void ValidateName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length > 240 || name.Any(char.IsControl))
            throw new InvalidDataException("音色名称须为 1 至 240 个可见字符。 ");
    }

    private static void ValidateZipDirectory(FileStream stream)
    {
        // Reject entry-count and central-directory bombs before ZipArchive allocates entry objects.
        if (stream.Length < 22) throw new InvalidDataException("音色文件不完整。 ");
        byte[] tail = new byte[(int)Math.Min(stream.Length, 65557)];
        stream.Position = stream.Length - tail.Length;
        stream.ReadExactly(tail);
        for (int offset = tail.Length - 22; offset >= 0; offset--)
        {
            var record = tail.AsSpan(offset);
            if (BinaryPrimitives.ReadUInt32LittleEndian(record) != 0x06054b50 ||
                offset + 22 + BinaryPrimitives.ReadUInt16LittleEndian(record[20..]) != tail.Length) continue;
            uint directoryLength = BinaryPrimitives.ReadUInt32LittleEndian(record[12..]);
            uint directoryOffset = BinaryPrimitives.ReadUInt32LittleEndian(record[16..]);
            long recordPosition = stream.Length - tail.Length + offset;
            if (BinaryPrimitives.ReadUInt16LittleEndian(record[4..]) != 0 || BinaryPrimitives.ReadUInt16LittleEndian(record[6..]) != 0 ||
                BinaryPrimitives.ReadUInt16LittleEndian(record[8..]) != 2 || BinaryPrimitives.ReadUInt16LittleEndian(record[10..]) != 2 ||
                directoryLength is 0 or > 4096 || (long)directoryOffset + directoryLength > recordPosition)
                throw new InvalidDataException("音色压缩包的目录结构无效。 ");
            stream.Position = 0;
            return;
        }
        throw new InvalidDataException("音色压缩包没有完整的目录。 ");
    }

    private sealed record Manifest(string Format, int Version, string Name, int SampleRate, int Channels, long Frames,
        string AudioEntry, string AudioSha256, InstrumentSettings Settings);
}
