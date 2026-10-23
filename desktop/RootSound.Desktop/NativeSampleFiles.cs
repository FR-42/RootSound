using System.Runtime.InteropServices;
using System.Text.Json;

namespace RootSound.Desktop;

[ComVisible(true)]
[ClassInterface(ClassInterfaceType.AutoDual)]
public sealed class NativeSampleFiles
{
    internal const int MaximumBytes = 16 * 1024 * 1024;
    private readonly Form owner;
    private int opening;
    public NativeSampleFiles(Form owner) => this.owner = owner;

    public string Open()
    {
        if (Interlocked.CompareExchange(ref opening, 1, 0) != 0)
            return JsonSerializer.Serialize(new { status = "error", message = "已有一个采样文件窗口，请先完成或取消它。" });
        try { return owner.InvokeRequired ? (string)owner.Invoke(OpenOnUi) : OpenOnUi(); }
        catch (Exception error) { return JsonSerializer.Serialize(new { status = "error", message = error.Message }); }
        finally { Volatile.Write(ref opening, 0); }
    }

    private string OpenOnUi()
    {
        using var dialog = new OpenFileDialog
        {
            Title = "选择音频素材", Filter = "音频素材|*.wav;*.mp3;*.flac;*.ogg;*.m4a;*.aac;*.aif;*.aiff;*.webm;*.mp4|所有文件|*.*",
            CheckFileExists = true, Multiselect = false,
        };
        if (dialog.ShowDialog(owner) != DialogResult.OK) return JsonSerializer.Serialize(new { status = "cancelled" });
        var bytes = ReadBytes(dialog.FileName);
        // The extension is not proof of an audio format. The browser decoder
        // checks the actual bytes and reports unsupported files honestly.
        return JsonSerializer.Serialize(new { status = "opened", name = Path.GetFileName(dialog.FileName),
            base64 = Convert.ToBase64String(bytes), mimeType = "application/octet-stream" });
    }

    internal static byte[] ReadBytes(string path)
    {
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        var length = stream.Length;
        if (length <= 0) throw new InvalidDataException("这个文件没有可读取的声音内容。");
        if (length > MaximumBytes) throw new InvalidDataException("采样文件超出当前 16 MiB 的大小范围，原文件已保留。");
        var bytes = new byte[checked((int)length)]; stream.ReadExactly(bytes);
        if (stream.Length != length || stream.ReadByte() != -1)
            throw new IOException("文件在读取时发生变化，请重新选择。原文件已保留。");
        return bytes;
    }
}
