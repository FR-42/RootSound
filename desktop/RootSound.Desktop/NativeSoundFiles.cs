using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;

namespace RootSound.Desktop;

[ComVisible(true)]
[ClassInterface(ClassInterfaceType.AutoDual)]
public sealed class NativeSoundFiles
{
    private const int MaximumBytes = 1024 * 1024;
    private readonly Form owner;
    public NativeSoundFiles(Form owner) => this.owner = owner;

    // Called through the asynchronous host proxy; dialogs never block a sync JS storage call.
    public string Open() => OnUi(() =>
    {
        using var dialog = new OpenFileDialog
        {
            Title = "打开声音文件", Filter = "RootSound 声音文件 (*.rssound)|*.rssound|JSON 文件 (*.json)|*.json",
            CheckFileExists = true, Multiselect = false,
        };
        if (dialog.ShowDialog(owner) != DialogResult.OK) return JsonSerializer.Serialize(new { status = "cancelled" });
        if (new FileInfo(dialog.FileName).Length > MaximumBytes) throw new IOException("这个文件超出了当前单个声音文件的大小范围。");
        return JsonSerializer.Serialize(new { status = "opened", name = Path.GetFileName(dialog.FileName), text = File.ReadAllText(dialog.FileName, new UTF8Encoding(false, true)) });
    });

    public string Save(string text, string suggestedName) => OnUi(() =>
    {
        if (Encoding.UTF8.GetByteCount(text) > MaximumBytes) throw new IOException("声音文件过大，尚未保存。");
        var name = new string(suggestedName.Where(c => !Path.GetInvalidFileNameChars().Contains(c)).ToArray()).Trim();
        using var dialog = new SaveFileDialog
        {
            Title = "保存声音文件", Filter = "RootSound 声音文件 (*.rssound)|*.rssound",
            DefaultExt = "rssound", AddExtension = true, OverwritePrompt = true,
            FileName = string.IsNullOrWhiteSpace(name) ? "我的声音.rssound" : name,
        };
        if (dialog.ShowDialog(owner) != DialogResult.OK) return JsonSerializer.Serialize(new { status = "cancelled" });
        var target = Path.GetFullPath(dialog.FileName);
        if (!string.Equals(Path.GetExtension(target), ".rssound", StringComparison.OrdinalIgnoreCase))
            throw new IOException("请使用 .rssound 后缀保存声音文件。");
        var temporary = target + "." + Guid.NewGuid().ToString("N") + ".tmp";
        try
        {
            using (var stream = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                var bytes = Encoding.UTF8.GetBytes(text);
                stream.Write(bytes);
                stream.Flush(true);
            }
            if (File.Exists(target)) File.Replace(temporary, target, target + ".bak");
            else File.Move(temporary, target);
        }
        finally
        {
            try { if (File.Exists(temporary)) File.Delete(temporary); } catch { /* Preserve the original failure. */ }
        }
        return JsonSerializer.Serialize(new { status = "saved", name = Path.GetFileName(target) });
    });

    private string OnUi(Func<string> action)
    {
        try { return owner.InvokeRequired ? (string)owner.Invoke(action) : action(); }
        catch (Exception error) { return JsonSerializer.Serialize(new { status = "error", message = error.Message }); }
    }
}
