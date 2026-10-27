using System.Buffers.Binary;
using System.IO.Compression;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using RootSound.PhraseStudio.Persistence;
using RootSound.ReferenceStudio.Core;
using RootSound.SampleEditor.Audio;
using RootSound.TimbreLab.Core;

namespace RootSound.ReferenceStudio.Persistence;

/// <summary>A portable experiment: reference excerpt, editable phrase, explanations and sound changes.</summary>
public static class CaseArchive
{
    private const int MaximumJson = 256 * 1024;
    private const long MaximumArchive = 600L * 1024 * 1024;
    private static readonly JsonSerializerOptions Json = new()
    {
        WriteIndented = true, MaxDepth = 24,
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow
    };

    private sealed record Manifest(string Format, int Version, CaseInfo Info,
        LayerDescription[] Layers, LayerSound[] Sounds, double ReferenceGainDb = 0,
        double MasterGainDb = 0, long ReferenceFrames = 0, string? ReferenceSha256 = null,
        string? PhraseSha256 = null);

    public static Task<ReferenceProject> LoadAsync(string path, CancellationToken cancellationToken = default) =>
        Task.Run(() => Load(path, cancellationToken), cancellationToken);

    public static Task SaveAsync(ReferenceProject project, string destination,
        CancellationToken cancellationToken = default) =>
        Task.Run(() => Save(project, destination, cancellationToken), cancellationToken);

    internal static ReferenceProject Load(string path, CancellationToken token)
    {
        path = Path.GetFullPath(path); token.ThrowIfCancellationRequested();
        if (Directory.Exists(path)) return LoadPrepared(path, token);
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        if (stream.Length is < 22 or > MaximumArchive) throw new InvalidDataException("案例文件长度无效。");
        CheckDirectory(stream);
        using var archive = new ZipArchive(stream, ZipArchiveMode.Read);
        HashSet<string> expected = new(StringComparer.Ordinal) { "case.json", "reference.f32", "reconstruction.rsphrase" };
        if (archive.Entries.Count != expected.Count || archive.Entries.Any(e => !expected.Remove(e.FullName)))
            throw new InvalidDataException("案例文件包含重复、缺失或未知内容。");
        var manifest = Parse(archive.GetEntry("case.json")!);
        if (manifest.ReferenceFrames is < 4800 or > 48000L * ReferenceValidation.MaximumReferenceSeconds ||
            !IsHash(manifest.ReferenceSha256) || !IsHash(manifest.PhraseSha256))
            throw new InvalidDataException("案例缺少有效的音频长度或校验信息。");
        var referenceEntry = archive.GetEntry("reference.f32")!;
        if (referenceEntry.Length != manifest.ReferenceFrames * 8)
            throw new InvalidDataException("案例参考音频长度不正确。");
        float[] samples = new float[checked((int)(manifest.ReferenceFrames * 2))];
        using (var input = referenceEntry.Open())
        {
            byte[] bytes = new byte[65536];
            using var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
            for (int offset = 0; offset < samples.Length;)
            {
                token.ThrowIfCancellationRequested(); int count = Math.Min(bytes.Length / 4, samples.Length - offset);
                input.ReadExactly(bytes.AsSpan(0, count * 4)); hash.AppendData(bytes, 0, count * 4);
                for (int i = 0; i < count; i++)
                {
                    float value = BinaryPrimitives.ReadSingleLittleEndian(bytes.AsSpan(i * 4));
                    if (!float.IsFinite(value) || Math.Abs(value) > 32) throw new InvalidDataException("原曲片段采样无效。");
                    samples[offset + i] = value;
                }
                offset += count;
            }
            if (input.ReadByte() != -1 || !HashEqual(hash.GetHashAndReset(), manifest.ReferenceSha256!))
                throw new InvalidDataException("原曲片段校验失败，案例可能损坏。");
        }
        string temporary = NewTemporary();
        try
        {
            var phraseEntry = archive.GetEntry("reconstruction.rsphrase")!;
            if (phraseEntry.Length is <= 0 or > MaximumArchive - ReferenceValidation.MaximumReferenceBytes)
                throw new InvalidDataException("案例乐句长度无效。");
            using (var input = phraseEntry.Open())
            using (var output = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            using (var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256))
            {
                Copy(input, output, hash, phraseEntry.Length, token);
                if (!HashEqual(hash.GetHashAndReset(), manifest.PhraseSha256!))
                    throw new InvalidDataException("案例乐句校验失败。");
            }
            var phrase = PhraseArchive.Load(temporary, token);
            var result = Restore(manifest, phrase, new PcmClip(48000, 2, samples, manifest.Info.Title));
            ReferenceValidation.Validate(result, inspectSamples: true); token.ThrowIfCancellationRequested(); return result;
        }
        finally { DeleteTemporary(temporary); }
    }

    private static ReferenceProject LoadPrepared(string path, CancellationToken token)
    {
        string manifestPath = Path.Combine(path, "case.json");
        var details = new FileInfo(manifestPath);
        if (!details.Exists || details.Length is <= 0 or > MaximumJson) throw new InvalidDataException("案例说明缺失或过大。");
        Manifest manifest = Parse(File.ReadAllBytes(manifestPath));
        string referencePath = Path.Combine(path, "reference.wav");
        using var input = new FileStream(referencePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        var layout = WaveDecoder.TryRead(input) ?? throw new InvalidDataException("案例参考须为未压缩 WAV。");
        if (layout.Format.SampleRate != 48000 || layout.Format.Channels != 2 || layout.FrameCount < 4800 ||
            layout.FrameCount > 48000L * ReferenceValidation.MaximumReferenceSeconds)
            throw new InvalidDataException("案例原曲片段的长度或格式无效。");
        string temporary = NewTemporary();
        try
        {
            using (var output = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                WaveDecoder.Decode(input, output, layout, null, token);
            float[] samples = new float[checked((int)(layout.FrameCount * 2))];
            using (var decoded = File.OpenRead(temporary))
            {
                byte[] buffer = new byte[65536];
                for (int offset = 0; offset < samples.Length;)
                {
                    token.ThrowIfCancellationRequested(); int count = Math.Min(buffer.Length / 4, samples.Length - offset);
                    decoded.ReadExactly(buffer.AsSpan(0, count * 4));
                    for (int i = 0; i < count; i++) samples[offset + i] = BinaryPrimitives.ReadSingleLittleEndian(buffer.AsSpan(i * 4));
                    offset += count;
                }
            }
            var phrase = PhraseArchive.Load(Path.Combine(path, "reconstruction.rsphrase"), token);
            var result = Restore(manifest, phrase, new PcmClip(48000, 2, samples, manifest.Info.Title));
            ReferenceValidation.Validate(result, inspectSamples: true); return result;
        }
        finally { DeleteTemporary(temporary); }
    }

    internal static void Save(ReferenceProject project, string destination, CancellationToken token)
    {
        ReferenceValidation.Validate(project, inspectSamples: true); token.ThrowIfCancellationRequested();
        if (!StringComparer.OrdinalIgnoreCase.Equals(Path.GetExtension(destination), ".rscase"))
            throw new IOException("案例工程请使用 .rscase 文件名。");
        SourceProtection.Check(project, destination);
        string temporary = NewTemporary();
        try
        {
            PhraseArchive.Save(project.Phrase, temporary, false, token);
            string phraseHash = PhraseArchive.FileHashAsync(temporary, token).GetAwaiter().GetResult();
            string referenceHash = DocumentFormat.AudioHash(project.Reference, token);
            var manifest = new Manifest("RootSound.ReferenceCase", 1, project.Info, project.Layers.ToArray(),
                project.Sounds.ToArray(), project.ReferenceGainDb, project.MasterGainDb,
                project.Reference.FrameCount, referenceHash, phraseHash);
            byte[] json = JsonSerializer.SerializeToUtf8Bytes(manifest, Json);
            if (json.Length > MaximumJson) throw new InvalidDataException("案例说明过大。");
            PhraseArchive.AtomicWrite(destination, overwrite: true, token, output =>
            {
                using var zip = new ZipArchive(output, ZipArchiveMode.Create, leaveOpen: true);
                using (var entry = zip.CreateEntry("case.json", CompressionLevel.Optimal).Open()) entry.Write(json);
                using (var entry = zip.CreateEntry("reference.f32", CompressionLevel.Fastest).Open())
                {
                    byte[] buffer = new byte[65536]; var samples = project.Reference.Samples;
                    for (int offset = 0; offset < samples.Length;)
                    {
                        token.ThrowIfCancellationRequested(); int count = Math.Min(buffer.Length / 4, samples.Length - offset);
                        for (int i = 0; i < count; i++) BinaryPrimitives.WriteSingleLittleEndian(buffer.AsSpan(i * 4), samples[offset + i]);
                        entry.Write(buffer, 0, count * 4); offset += count;
                    }
                }
                using (var entry = zip.CreateEntry("reconstruction.rsphrase", CompressionLevel.NoCompression).Open())
                using (var phrase = File.OpenRead(temporary)) Copy(phrase, entry, null, phrase.Length, token);
                SourceProtection.Check(project, destination);
            });
        }
        finally { DeleteTemporary(temporary); }
    }

    private static ReferenceProject Restore(Manifest m, RootSound.PhraseStudio.Core.PhraseDocument phrase, PcmClip reference) =>
        new(phrase, reference, m.Info, Array.AsReadOnly(m.Layers), Array.AsReadOnly(m.Sounds))
        { ReferenceGainDb = m.ReferenceGainDb, MasterGainDb = m.MasterGainDb };

    private static Manifest Parse(ZipArchiveEntry entry)
    {
        if (entry.Length is <= 0 or > MaximumJson) throw new InvalidDataException("案例说明长度无效。");
        using var input = entry.Open(); byte[] bytes = new byte[(int)entry.Length]; input.ReadExactly(bytes);
        if (input.ReadByte() != -1) throw new InvalidDataException("案例说明包含多余数据。");
        return Parse(bytes);
    }

    private static Manifest Parse(byte[] bytes)
    {
        Manifest manifest;
        try { manifest = JsonSerializer.Deserialize<Manifest>(bytes, Json) ?? throw new JsonException(); }
        catch (JsonException ex) { throw new InvalidDataException("案例说明无法读取。", ex); }
        if (manifest.Format != "RootSound.ReferenceCase" || manifest.Version != 1 || manifest.Info is null ||
            manifest.Layers is null || manifest.Sounds is null || manifest.Layers.Length > 32 || manifest.Sounds.Length > 32)
            throw new InvalidDataException("案例版本或结构无效。");
        return manifest;
    }

    private static void Copy(Stream input, Stream output, IncrementalHash? hash, long length, CancellationToken token)
    {
        byte[] buffer = new byte[65536]; long remaining = length;
        while (remaining != 0)
        {
            token.ThrowIfCancellationRequested(); int count = input.Read(buffer, 0, (int)Math.Min(buffer.Length, remaining));
            if (count == 0) throw new InvalidDataException("案例内容被截断。");
            hash?.AppendData(buffer, 0, count); output.Write(buffer, 0, count); remaining -= count;
        }
        if (input.ReadByte() != -1) throw new InvalidDataException("案例内容包含多余数据。");
    }

    private static string NewTemporary() => Path.Combine(Path.GetTempPath(), "rootsound-reference-" + Guid.NewGuid().ToString("N") + ".tmp");
    private static void DeleteTemporary(string path) { try { File.Delete(path); } catch (IOException) { } catch (UnauthorizedAccessException) { } }
    private static bool IsHash(string? value) => value is { Length: 64 } && value.All(Uri.IsHexDigit);
    private static bool HashEqual(byte[] actual, string expected) => CryptographicOperations.FixedTimeEquals(actual, Convert.FromHexString(expected));

    private static void CheckDirectory(FileStream stream)
    {
        byte[] tail = new byte[(int)Math.Min(65557, stream.Length)]; stream.Position = stream.Length - tail.Length; stream.ReadExactly(tail);
        for (int i = tail.Length - 22; i >= 0; i--)
        {
            var record = tail.AsSpan(i);
            if (BinaryPrimitives.ReadUInt32LittleEndian(record) != 0x06054b50 ||
                i + 22 + BinaryPrimitives.ReadUInt16LittleEndian(record[20..]) != tail.Length) continue;
            int count = BinaryPrimitives.ReadUInt16LittleEndian(record[10..]);
            long size = BinaryPrimitives.ReadUInt32LittleEndian(record[12..]);
            long start = BinaryPrimitives.ReadUInt32LittleEndian(record[16..]);
            if (count != 3 || BinaryPrimitives.ReadUInt16LittleEndian(record[8..]) != count ||
                BinaryPrimitives.ReadUInt16LittleEndian(record[4..]) != 0 || BinaryPrimitives.ReadUInt16LittleEndian(record[6..]) != 0 ||
                size is <= 0 or > 4096 || start + size != stream.Length - tail.Length + i)
                throw new InvalidDataException("案例压缩包目录无效。");
            stream.Position = 0; return;
        }
        throw new InvalidDataException("案例压缩包缺少完整目录。");
    }
}
