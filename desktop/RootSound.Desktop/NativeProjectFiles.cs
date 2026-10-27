using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;

namespace RootSound.Desktop;

[ComVisible(true)]
[ClassInterface(ClassInterfaceType.AutoDual)]
public sealed class NativeProjectFiles
{
    internal const int MaximumBytes = 32 * 1024 * 1024;
    private static readonly UTF8Encoding Utf8 = new(false, true);
    private readonly Form owner;
    private int operating;
    public NativeProjectFiles(Form owner) => this.owner = owner;

    public string Open() => OnUi(() =>
    {
        using var dialog = new OpenFileDialog
        {
            Title = "打开工程文件", Filter = "RootSound 工程文件 (*.rsproject)|*.rsproject|JSON 文件 (*.json)|*.json",
            CheckFileExists = true, Multiselect = false,
        };
        if (dialog.ShowDialog(owner) != DialogResult.OK) return JsonSerializer.Serialize(new { status = "cancelled" });
        return JsonSerializer.Serialize(new { status = "opened", name = Path.GetFileName(dialog.FileName), text = ReadProject(dialog.FileName) });
    });

    public string Save(string text, string suggestedName) => OnUi(() =>
    {
        var checkedText = ValidateText(text);
        var name = new string(suggestedName.Where(c => !Path.GetInvalidFileNameChars().Contains(c)).ToArray()).Trim();
        using var dialog = new SaveFileDialog
        {
            Title = "保存完整工程", Filter = "RootSound 工程文件 (*.rsproject)|*.rsproject",
            DefaultExt = "rsproject", AddExtension = true, OverwritePrompt = true,
            FileName = string.IsNullOrWhiteSpace(name) ? "我的音乐.rsproject" : name,
        };
        if (dialog.ShowDialog(owner) != DialogResult.OK) return JsonSerializer.Serialize(new { status = "cancelled" });
        WriteAtomic(Path.GetFullPath(dialog.FileName), checkedText);
        return JsonSerializer.Serialize(new { status = "saved", name = Path.GetFileName(dialog.FileName) });
    });

    private string OnUi(Func<string> action)
    {
        // Modal dialogs pump messages, so another asynchronous bridge call could
        // otherwise open a second project picker inside the first one.
        if (Interlocked.CompareExchange(ref operating, 1, 0) != 0)
            return JsonSerializer.Serialize(new { status = "error", message = "已有一个工程文件窗口，请先完成或取消它。" });
        try { return owner.InvokeRequired ? (string)owner.Invoke(action) : action(); }
        catch (Exception error) { return JsonSerializer.Serialize(new { status = "error", message = error.Message }); }
        finally { Volatile.Write(ref operating, 0); }
    }

    internal static string ValidateText(string text)
    {
        ArgumentNullException.ThrowIfNull(text);
        try
        {
            if (text.Length > MaximumBytes || Utf8.GetByteCount(text) > MaximumBytes)
                throw new InvalidDataException("工程文件超出当前 32 MiB 的大小范围，原文件已保留。");
        }
        catch (EncoderFallbackException error) { throw new InvalidDataException("工程文件含有无效的 Unicode 文本，原文件已保留。", error); }
        var normalized = text.StartsWith('\uFEFF') ? text[1..] : text;
        try
        {
            using var document = JsonDocument.Parse(normalized, new JsonDocumentOptions { MaxDepth = 256 });
            var root = document.RootElement;
            if (root.ValueKind != JsonValueKind.Object || !root.TryGetProperty("format", out var format)
                || format.ValueKind != JsonValueKind.String || format.GetString() != "RootSoundProject"
                || !root.TryGetProperty("version", out var version) || version.ValueKind != JsonValueKind.Number
                || version.GetDouble() is not (1 or 2))
                throw new InvalidDataException("暂不支持这个工程文件的格式或版本，原文件已保留。");
        }
        catch (JsonException error) { throw new InvalidDataException("工程文件不是完整的 JSON 文本，原文件已保留。", error); }
        return normalized;
    }

    internal static string ReadProject(string path)
    {
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        if (stream.Length > MaximumBytes) throw new InvalidDataException("工程文件超出当前 32 MiB 的大小范围，原文件已保留。");
        var bytes = new byte[checked((int)stream.Length)]; stream.ReadExactly(bytes);
        int offset = bytes.Length >= 3 && bytes[0] == 0xef && bytes[1] == 0xbb && bytes[2] == 0xbf ? 3 : 0;
        try { return ValidateText(Utf8.GetString(bytes, offset, bytes.Length - offset)); }
        catch (DecoderFallbackException error) { throw new InvalidDataException("工程文件不是有效的 UTF-8 文本，原文件已保留。", error); }
    }

    internal static void WriteAtomic(string target, string text)
    {
        ProjectFileProtection.RequireExportTarget(target);
        if (!string.Equals(Path.GetExtension(target), ".rsproject", StringComparison.OrdinalIgnoreCase))
            throw new IOException("请使用 .rsproject 后缀保存工程文件。");
        var bytes = Utf8.GetBytes(ValidateText(text));
        using var targetLock = new FileStream(target + ".rootsound-save.lock", FileMode.CreateNew,
            FileAccess.ReadWrite, FileShare.None, 1, FileOptions.DeleteOnClose);
        var temporary = target + "." + Guid.NewGuid().ToString("N") + ".tmp";
        try
        {
            using (var stream = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                stream.Write(bytes); stream.Flush(true);
            }
            if (File.Exists(target)) File.Replace(temporary, target, target + ".bak");
            else File.Move(temporary, target);
        }
        finally
        {
            try { if (File.Exists(temporary)) File.Delete(temporary); } catch { /* Preserve the original failure. */ }
        }
    }
}
