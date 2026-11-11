using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;

namespace RootSound.Desktop;

public sealed record EditableSourceData(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("path")] string Path,
    [property: JsonPropertyName("format")] string Format,
    [property: JsonPropertyName("base64")] string Base64,
    [property: JsonPropertyName("token")] string Token,
    [property: JsonPropertyName("libraryText"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? LibraryText = null);

internal static class NativeDocumentFiles
{
    internal const int MaximumBytes = 32 * 1024 * 1024;
    internal static string? Format(string path) => Path.GetExtension(path).ToLowerInvariant() switch
    {
        ".mid" or ".midi" or ".smf" or ".kar" or ".rmi" => "midi",
        ".musicxml" or ".xml" => "musicxml", ".mxl" => "mxl", ".rsproject" => "rsproject", _ => null,
    };
    internal static EditableSourceData Read(string path)
    {
        path = Path.GetFullPath(path);
        string format = Format(path) ?? throw new IOException("请选择 MIDI、MusicXML 或简乐工程文件。");
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        if (stream.Length > MaximumBytes || stream.Length == 0) throw new IOException("文件为空或超过当前 32 MiB 的打开范围。");
        byte[] bytes = new byte[(int)stream.Length]; stream.ReadExactly(bytes); Validate(path, bytes);
        return new(Path.GetFileName(path), path, format, Convert.ToBase64String(bytes), Convert.ToHexString(SHA256.HashData(bytes)));
    }
    internal static void Validate(string path, byte[] bytes)
    {
        if (bytes.Length == 0 || bytes.Length > MaximumBytes) throw new IOException("文件内容为空或过大，尚未写入。");
        string? format = Format(path);
        if (format == "midi" && !(bytes.Length >= 14 && bytes.AsSpan(0, 4).SequenceEqual("MThd"u8))
            && !(Path.GetExtension(path).Equals(".rmi", StringComparison.OrdinalIgnoreCase) && bytes.Length >= 12
                && bytes.AsSpan(0, 4).SequenceEqual("RIFF"u8) && bytes.AsSpan(8, 4).SequenceEqual("RMID"u8)))
            throw new IOException("MIDI 文件头无效，原文件已保留。");
        if (format == "mxl" && (bytes.Length < 4 || bytes[0] != 80 || bytes[1] != 75)) throw new IOException("压缩 MusicXML 文件无效。");
        if (format is null) throw new IOException("不支持写入这种文件格式。");
    }
}

public sealed partial class ProjectDirectoryManager
{
    private EditableSourceData? sourceDocument;

    public EditableSourceData ReadDocumentFile(string path, bool known = false)
    {
        lock (gate)
        {
            ThrowIfDisposed(); path = Path.GetFullPath(path);
            if (known) { _ = ResolveLibraryFolder(Path.GetDirectoryName(path)!); if (IsLink(path)) throw new IOException("不打开文件链接。"); }
            return NativeDocumentFiles.Read(path);
        }
    }
    public EditableSourceData? ReadDocument()
    {
        lock (gate) { ThrowIfDisposed(); return sourceDocument is null ? null : sourceDocument with { LibraryText = savedSnapshot }; }
    }
    public ProjectDirectoryInfo OpenDocument(string path, string token, string libraryText)
    {
        lock (gate)
        {
            ThrowIfDisposed(); RequireCleanForSwitch(); libraryText = ValidateLibrary(libraryText);
            path = Path.GetFullPath(path);
            using var candidateOwner = new DisposableCandidate(AtomicTextStore.ForProjectFile(path));
            var selected = candidateOwner.Value.ReadStreamValidated(_ => NativeDocumentFiles.Read(path));
            if (selected.Token != token) throw new IOException("文件在打开过程中发生了变化，请重新打开。");
            string identity = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(OperatingSystem.IsWindows() ? path.ToUpperInvariant() : path))).ToLowerInvariant()[..32];
            var project = new ProjectDirectoryInfo(identity, Path.GetFileNameWithoutExtension(path), path, selected.Format);
            activeStore?.Dispose(); payloads?.Dispose(); payloads = null;
            activeStore = candidateOwner.Take(); sourceDocument = selected;
            current = project; currentSnapshot = committedSnapshot = savedSnapshot = libraryText;
            memory = null; fileEnvelope = null; observedManifestHash = null; loadingCompleted = false;
            timbreSongDraftId = null; timbreFilesState = new("idle", null); scope = Guid.NewGuid().ToString("N");
            return project;
        }
    }
    // Ownership transfers only after parsing and source-fingerprint validation succeeded.
    private sealed class DisposableCandidate(AtomicTextStore value) : IDisposable
    {
        private AtomicTextStore? held = value;
        public AtomicTextStore Value => held!;
        public AtomicTextStore Take() { var result = held!; held = null; return result; }
        public void Dispose() => held?.Dispose();
    }
}
