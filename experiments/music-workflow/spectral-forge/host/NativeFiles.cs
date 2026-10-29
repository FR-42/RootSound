using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace RootSound.SpectralForge;

/// <summary>Independent experiment files. No main-workstation storage is opened.</summary>
internal sealed class NativeFiles
{
    internal const int MaximumPatchBytes = 2 * 1024 * 1024;
    internal const int MaximumWavBytes = 128 * 1024 * 1024;
    private static readonly UTF8Encoding Utf8 = new(false, true);
    private string? lastOpenDirectory;
    internal string OutputDirectory { get; }
    internal string RecoveryPath => Path.Combine(OutputDirectory, "recovery.json");
    internal string OpenDirectoryStatePath => Path.Combine(OutputDirectory, "open-directory.json");
    internal string OpenDirectory => lastOpenDirectory is not null && Directory.Exists(lastOpenDirectory)
        ? lastOpenDirectory : OutputDirectory;

    internal NativeFiles(string experimentDirectory)
    {
        OutputDirectory = Path.Combine(Path.GetFullPath(experimentDirectory), "output");
        Directory.CreateDirectory(OutputDirectory);
        try
        {
            if (File.Exists(OpenDirectoryStatePath))
            {
                using var state = JsonDocument.Parse(ReadLimited(OpenDirectoryStatePath, 65536), new JsonDocumentOptions { MaxDepth = 4 });
                if (state.RootElement.ValueKind == JsonValueKind.Object && state.RootElement.TryGetProperty("directory", out var value)
                    && value.ValueKind == JsonValueKind.String)
                    lastOpenDirectory = AbsoluteDirectory(value.GetString());
            }
        }
        catch (Exception error) when (PreferenceError(error)) { /* An optional preference must not prevent startup. */ }
    }

    private static string? AbsoluteDirectory(string? path) => string.IsNullOrWhiteSpace(path) || path.Length > 32768
        || !Path.IsPathFullyQualified(path) ? null : Path.GetFullPath(path);
    private static bool PreferenceError(Exception error) => error is IOException or UnauthorizedAccessException
        or ArgumentException or NotSupportedException or JsonException;

    internal void RememberOpenedFile(string path)
    {
        try
        {
            string? absolute = AbsoluteDirectory(path);
            string? directory = absolute is null ? null : Path.GetDirectoryName(absolute);
            if (directory is null || !Directory.Exists(directory)) return;
            // Retain this session's folder even when the optional preference cannot be written.
            lastOpenDirectory = directory;
            byte[] json = JsonSerializer.SerializeToUtf8Bytes(new { directory });
            WriteAtomic(OpenDirectoryStatePath, json, Observe(OpenDirectoryStatePath));
        }
        catch (Exception error) when (PreferenceError(error)) { /* Opening the selected sound still succeeds. */ }
    }

    internal static string ValidatePatch(string text)
    {
        if (string.IsNullOrWhiteSpace(text) || text.Length > MaximumPatchBytes || Utf8.GetByteCount(text) > MaximumPatchBytes)
            throw new InvalidDataException("音色设置为空或超过 2 MiB，原文件未被覆盖。");
        using var document = JsonDocument.Parse(text, new JsonDocumentOptions { MaxDepth = 64 });
        JsonElement root = document.RootElement;
        if (root.ValueKind != JsonValueKind.Object || !root.TryGetProperty("format", out var format)
            || format.ValueKind != JsonValueKind.String || format.GetString() != "RootSoundSpectralPatch"
            || !root.TryGetProperty("version", out var version) || !version.TryGetInt32(out int number) || number != 1)
            throw new InvalidDataException("不是受支持的精细音色设置文件，当前音色仍保留。");
        CheckJson(root);
        if (root.TryGetProperty("name", out var name)
            && (name.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(name.GetString()) || name.GetString()!.Length > 256))
            throw new InvalidDataException("音色名称无效。");
        return text;
    }

    private static void CheckJson(JsonElement value)
    {
        if (value.ValueKind == JsonValueKind.Object)
        {
            var names = new HashSet<string>(StringComparer.Ordinal);
            foreach (JsonProperty property in value.EnumerateObject())
            {
                if (!names.Add(property.Name)) throw new InvalidDataException("设置文件含有重复字段。");
                CheckJson(property.Value);
            }
        }
        else if (value.ValueKind == JsonValueKind.Array)
            foreach (JsonElement item in value.EnumerateArray()) CheckJson(item);
        else if (value.ValueKind == JsonValueKind.Number && (!value.TryGetDouble(out double number) || !double.IsFinite(number)))
            throw new InvalidDataException("设置文件含有无效数值。");
    }

    internal static string ReadPatch(string path)
    {
        byte[] bytes = ReadLimited(path, MaximumPatchBytes);
        ReadOnlySpan<byte> content = bytes;
        if (content.StartsWith(new byte[] { 0xef, 0xbb, 0xbf })) content = content[3..];
        return ValidatePatch(Utf8.GetString(content));
    }

    internal string? ReadRecovery() => File.Exists(RecoveryPath) ? ReadPatch(RecoveryPath) : null;
    internal void ClearRecovery() { File.Delete(RecoveryPath); File.Delete(RecoveryPath + ".bak"); }
    internal void WriteRecovery(string text) => WriteAtomic(RecoveryPath, Utf8.GetBytes(ValidatePatch(text)), Observe(RecoveryPath));
    internal static byte[] PatchBytes(string text) => Utf8.GetBytes(ValidatePatch(text));

    internal static byte[] ReadLimited(string path, int limit)
    {
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        if (stream.Length < 1 || stream.Length > limit) throw new InvalidDataException("文件为空或超过本实验的大小限制。");
        byte[] bytes = new byte[checked((int)stream.Length)]; stream.ReadExactly(bytes);
        return bytes;
    }

    internal static byte[] ValidateWavBase64(string value)
    {
        if (string.IsNullOrEmpty(value) || value.Length > ((long)MaximumWavBytes + 2) / 3 * 4)
            throw new InvalidDataException("导出的音频为空或超过 128 MiB。");
        byte[] bytes;
        try { bytes = Convert.FromBase64String(value); }
        catch (FormatException) { throw new InvalidDataException("导出音频编码已损坏，原文件未被覆盖。"); }
        if (Convert.ToBase64String(bytes) != value) throw new InvalidDataException("导出音频编码无效。");
        ValidateWav(bytes); return bytes;
    }

    internal static void ValidateWav(byte[] bytes)
    {
        static bool Tag(ReadOnlySpan<byte> all, int at, string text) => all.Slice(at, 4).SequenceEqual(Encoding.ASCII.GetBytes(text));
        if (bytes.Length < 44 || bytes.Length > MaximumWavBytes || !Tag(bytes, 0, "RIFF") || !Tag(bytes, 8, "WAVE")
            || BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(4)) != bytes.Length - 8)
            throw new InvalidDataException("导出音频不是完整 WAV。");
        int channels = 0, align = 0; bool formatFound = false, dataFound = false;
        long dataBytes = 0; var dataLengths = new List<uint>(); int offset = 12;
        while (offset + 8 <= bytes.Length)
        {
            uint size = BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(offset + 4));
            long end = (long)offset + 8 + size;
            if (end > bytes.Length) throw new InvalidDataException("WAV 区块尚未完整写入。");
            if (Tag(bytes, offset, "fmt "))
            {
                if (formatFound || size < 16) throw new InvalidDataException("WAV 格式区块无效。");
                ReadOnlySpan<byte> f = bytes.AsSpan(offset + 8, checked((int)size));
                int type = BinaryPrimitives.ReadUInt16LittleEndian(f);
                channels = BinaryPrimitives.ReadUInt16LittleEndian(f[2..]);
                uint rate = BinaryPrimitives.ReadUInt32LittleEndian(f[4..]);
                align = BinaryPrimitives.ReadUInt16LittleEndian(f[12..]);
                int bits = BinaryPrimitives.ReadUInt16LittleEndian(f[14..]);
                if (type != 1 || channels is < 1 or > 2 || bits != 24 || rate is not (44100 or 48000 or 96000)
                    || align != channels * 3 || BinaryPrimitives.ReadUInt32LittleEndian(f[8..]) != rate * align)
                    throw new InvalidDataException("当前导出需要 44.1、48 或 96 kHz 的 24 位单/双声道 PCM WAV。");
                formatFound = true;
            }
            else if (Tag(bytes, offset, "data")) { dataFound = true; dataBytes += size; dataLengths.Add(size); }
            offset = checked((int)(end + size % 2));
        }
        if (offset != bytes.Length || !formatFound || !dataFound || dataBytes == 0 || dataLengths.Any(length => length % align != 0))
            throw new InvalidDataException("WAV 缺少有效格式或完整音频帧。");
    }

    internal static byte[]? Observe(string path)
    {
        if (!File.Exists(path)) return null;
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        if (stream.Length > MaximumWavBytes) throw new InvalidDataException("目标文件超过本实验的大小限制。");
        return SHA256.HashData(stream);
    }
    private static bool Same(byte[]? left, byte[]? right) => left is null ? right is null : right is not null && left.AsSpan().SequenceEqual(right);

    /// <summary>Only publishes a complete candidate when the target still matches the observed file.</summary>
    internal static void WriteAtomic(string path, byte[] bytes, byte[]? observed, Action? beforePublish = null)
    {
        path = Path.GetFullPath(path);
        string directory = Path.GetDirectoryName(path) ?? throw new IOException("保存目录无效。");
        if (!Directory.Exists(directory)) throw new DirectoryNotFoundException("保存目录已不存在。");
        if (bytes.Length < 1 || bytes.Length > MaximumWavBytes) throw new InvalidDataException("文件大小无效。");
        string temporary = Path.Combine(directory, ".spectral-write-" + Guid.NewGuid().ToString("N") + ".tmp");
        try
        {
            if (!Same(observed, Observe(path))) throw new IOException("目标文件已被其他程序修改，请另存为。");
            using (var file = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                file.Write(bytes); file.Flush(true);
            }
            beforePublish?.Invoke();
            if (!Same(observed, Observe(path))) throw new IOException("保存过程中目标文件发生变化，原文件没有被覆盖。");
            if (observed is null) File.Move(temporary, path);
            else File.Replace(temporary, path, path + ".bak");
        }
        finally { try { File.Delete(temporary); } catch (IOException) { } catch (UnauthorizedAccessException) { } }
    }

    internal static string SuggestedName(string? value, string extension)
    {
        value = (value ?? "音色").Trim();
        if (value.EndsWith(extension, StringComparison.OrdinalIgnoreCase)) value = value[..^extension.Length];
        var invalid = Path.GetInvalidFileNameChars().ToHashSet();
        var result = new StringBuilder();
        foreach (Rune rune in value.EnumerateRunes().Take(80))
            result.Append(rune.IsAscii && invalid.Contains((char)rune.Value) ? "-" : rune.ToString());
        string name = result.ToString().Trim().TrimEnd('.', ' ');
        string device = name.Split('.')[0].ToUpperInvariant();
        if (name.Length == 0 || device is "CON" or "PRN" or "AUX" or "NUL" || device.Length == 4 && (device.StartsWith("COM") || device.StartsWith("LPT")) && device[3] is >= '0' and <= '9') name = "音色";
        return name + extension;
    }
}
