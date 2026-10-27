using System.Buffers.Binary;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;

namespace RootSound.Desktop;

[ComVisible(true)]
[ClassInterface(ClassInterfaceType.AutoDual)]
public sealed class NativeAudioFiles
{
    internal const int MaximumBytes = 256 * 1024 * 1024;
    private readonly Form owner;
    private int saving;
    public NativeAudioFiles(Form owner) => this.owner = owner;

    // Only user-selected WAV output is exposed to JavaScript, never arbitrary paths.
    public string Save(string base64, string suggestedName)
    {
        // An asynchronous host object can be called again while a modal dialog
        // pumps the UI message loop. Never stack dialogs or decode two large jobs.
        if (Interlocked.CompareExchange(ref saving, 1, 0) != 0)
            return JsonSerializer.Serialize(new { status = "error", message = "已有一个音频保存窗口，请先完成或取消它。" });
        try
        {
            var bytes = DecodePayload(base64);
            return owner.InvokeRequired ? (string)owner.Invoke(() => SaveOnUi(bytes, suggestedName)) : SaveOnUi(bytes, suggestedName);
        }
        catch (Exception error) { return JsonSerializer.Serialize(new { status = "error", message = error.Message }); }
        finally { Volatile.Write(ref saving, 0); }
    }

    private string SaveOnUi(byte[] bytes, string suggestedName)
    {
        var name = new string(suggestedName.Where(c => !Path.GetInvalidFileNameChars().Contains(c)).ToArray()).Trim();
        using var dialog = new SaveFileDialog
        {
            Title = "导出音频", Filter = "WAV 音频文件 (*.wav)|*.wav",
            DefaultExt = "wav", AddExtension = true, OverwritePrompt = true,
            FileName = string.IsNullOrWhiteSpace(name) ? "我的音乐.wav" : name,
        };
        if (dialog.ShowDialog(owner) != DialogResult.OK) return JsonSerializer.Serialize(new { status = "cancelled" });
        var target = Path.GetFullPath(dialog.FileName);
        WriteAtomic(target, bytes);
        return JsonSerializer.Serialize(new { status = "saved", name = Path.GetFileName(target) });
    }

    internal static byte[] DecodePayload(string base64)
    {
        if (base64.Length > ((MaximumBytes + 2L) / 3) * 4) throw new IOException("音频超出当前文件大小范围，尚未保存。");
        var bytes = Convert.FromBase64String(base64);
        ValidateWave(bytes);
        return bytes;
    }

    internal static void ValidateWave(byte[] bytes)
    {
        if (bytes.Length > MaximumBytes) throw new IOException("音频超出当前文件大小范围，尚未保存。");
        if (bytes.Length < 50) throw new IOException("音频内容无效，尚未保存文件。");
        uint U32(int at) => BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(at, 4));
        ushort U16(int at) => BinaryPrimitives.ReadUInt16LittleEndian(bytes.AsSpan(at, 2));
        bool Label(int at, string text) => Encoding.ASCII.GetString(bytes, at, text.Length) == text;
        if (!Label(0, "RIFF") || !Label(8, "WAVE") || !Label(12, "fmt ") || !Label(36, "data")
            || U32(4) + 8L != bytes.Length || U32(16) != 16 || U16(20) != 1 || U16(22) != 2
            || U16(32) != 6 || U16(34) != 24 || U32(24) is not (44100 or 48000 or 96000)
            || U32(28) != U32(24) * 6 || U32(40) != bytes.Length - 44 || (bytes.Length - 44) % 6 != 0)
            throw new IOException("音频不是当前支持的双声道 24 位 WAV 文件，尚未保存。");
    }

    internal static void WriteAtomic(string target, byte[] bytes)
    {
        ProjectFileProtection.RequireExportTarget(target);
        if (!string.Equals(Path.GetExtension(target), ".wav", StringComparison.OrdinalIgnoreCase))
            throw new IOException("请使用 .wav 后缀导出音频。");
        ValidateWave(bytes);
        // File.Replace can remove an existing backup before failing. Coordinate
        // RootSound writers across threads/processes before either touches it.
        // CreateNew never claims or deletes a pre-existing unknown lock file.
        using var targetLock = new FileStream(target + ".rootsound-save.lock", FileMode.CreateNew,
            FileAccess.ReadWrite, FileShare.None, 1, FileOptions.DeleteOnClose);
        var temporary = target + "." + Guid.NewGuid().ToString("N") + ".tmp";
        try
        {
            using (var stream = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
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
    }
}
