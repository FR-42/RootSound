using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;

namespace RootSound.Desktop;

[ComVisible(true)]
[ClassInterface(ClassInterfaceType.AutoDual)]
public sealed class NativeTimbreFiles
{
    internal const int MaximumJsonBytes = 4 * 1024 * 1024;
    internal const int MaximumSoundBytes = 32 * 1024 * 1024;
    private static readonly UTF8Encoding Utf8 = new(false, true);
    private readonly Form? owner;
    private readonly ProjectDirectoryManager manager;
    private readonly string preferences;
    private readonly Func<string, string?> choose;
    private int operating;

    public NativeTimbreFiles(Form owner, ProjectDirectoryManager manager, string dataDirectory)
        : this(manager, dataDirectory, null) { this.owner = owner; choose = Pick; }

    internal NativeTimbreFiles(ProjectDirectoryManager manager, string dataDirectory, Func<string, string?>? choose)
    {
        this.manager = manager;
        preferences = Path.Combine(Path.GetFullPath(dataDirectory), "timbre-file-picker.json");
        this.choose = choose ?? (_ => null);
    }

    public string Open() => Run(() =>
    {
        string? path = choose(LastDirectory());
        if (path is null) return "{\"status\":\"cancelled\"}";
        string text = ReadText(path);
        Remember(Path.GetDirectoryName(Path.GetFullPath(path))!);
        return JsonSerializer.Serialize(new { status = "opened", name = Path.GetFileName(path), text });
    });

    public string Sync(string songDraftId = "") => Run(() => JsonSerializer.Serialize(manager.SyncTimbres(songDraftId)));
    public string State() => Run(() => JsonSerializer.Serialize(manager.TimbreFilesState));

    internal string LastDirectory()
    {
        try
        {
            if (File.Exists(preferences) && new FileInfo(preferences).Length <= 65536)
            {
                using var document = JsonDocument.Parse(File.ReadAllText(preferences, Utf8));
                string? path = document.RootElement.GetProperty("lastDirectory").GetString();
                if (path is not null && Path.IsPathFullyQualified(path) && Directory.Exists(path)) return path;
            }
        }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException or JsonException or KeyNotFoundException or InvalidOperationException or DecoderFallbackException) { }
        return Directory.Exists(manager.DefaultLocation) ? manager.DefaultLocation : Path.GetDirectoryName(manager.DefaultLocation)!;
    }

    private void Remember(string directory)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(preferences)!);
        string temporary = preferences + "." + Guid.NewGuid().ToString("N") + ".tmp";
        try
        {
            File.WriteAllText(temporary, JsonSerializer.Serialize(new { lastDirectory = directory }), Utf8);
            File.Move(temporary, preferences, true);
        }
        finally { try { File.Delete(temporary); } catch (IOException) { } catch (UnauthorizedAccessException) { } }
    }

    private string? Pick(string directory)
    {
        using var picker = new OpenFileDialog { Title = "导入音色", Filter = "RootSound 音色|*.rssynth;*.rssound|合成音色 (*.rssynth)|*.rssynth|声音文件 (*.rssound)|*.rssound",
            InitialDirectory = directory, CheckFileExists = true, Multiselect = false };
        return picker.ShowDialog(owner) == DialogResult.OK ? picker.FileName : null;
    }

    internal static string ReadText(string path)
    {
        string extension = Path.GetExtension(path).ToLowerInvariant();
        if (extension == ".rstimbre") throw new InvalidDataException(".rstimbre 是旧实验工具的采样音色包，当前音色库还不能忠实读取它。请选择 .rssynth 或 .rssound 文件。");
        if (extension is not ".rssynth" and not ".rssound") throw new InvalidDataException("请选择 .rssynth 或 .rssound 音色文件。");
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        if (stream.Length <= 0 || stream.Length > (extension == ".rssound" ? MaximumSoundBytes : MaximumJsonBytes))
            throw new InvalidDataException("音色文件为空或超出当前大小范围，原文件已保留。");
        byte[] bytes = new byte[checked((int)stream.Length)]; stream.ReadExactly(bytes);
        if (stream.ReadByte() != -1) throw new IOException("音色文件在读取时发生变化，请重新选择。");
        int offset = bytes.AsSpan().StartsWith(new byte[] { 0xef, 0xbb, 0xbf }) ? 3 : 0;
        string text;
        try { text = Utf8.GetString(bytes, offset, bytes.Length - offset); }
        catch (DecoderFallbackException error) { throw new InvalidDataException("音色文件不是有效的 UTF-8 文本。", error); }
        using var json = JsonDocument.Parse(text, new JsonDocumentOptions { MaxDepth = 256 });
        if (json.RootElement.ValueKind != JsonValueKind.Object) throw new InvalidDataException("音色文件需要包含完整的参数对象。");
        return text;
    }

    private string Run(Func<string> action)
    {
        if (Interlocked.CompareExchange(ref operating, 1, 0) != 0) return JsonSerializer.Serialize(new { status = "error", message = "已有一个音色文件操作正在进行，请稍后重试。" });
        try { return owner?.InvokeRequired == true ? (string)owner.Invoke(action) : action(); }
        catch (Exception error) { return JsonSerializer.Serialize(new { status = "error", message = error.Message }); }
        finally { Volatile.Write(ref operating, 0); }
    }
}
