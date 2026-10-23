namespace RootSound.BluetoothRecorder.Session;

// Only the private recording belongs to this take. Exported files are user
// documents: their paths are counted for the UI, never retained for deletion.
public sealed class TakeFiles : IDisposable
{
    private readonly string directory;
    private readonly HashSet<string> exports = new(StringComparer.OrdinalIgnoreCase);
    private bool disposed;
    public string RecordingPath { get; }
    public int ExportCount => exports.Count;
    public TakeFiles(string parentDirectory)
    {
        directory = Path.Combine(Path.GetFullPath(parentDirectory), Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(directory);
        RecordingPath = Path.Combine(directory, "recording.wav");
    }

    public async Task<string> ExportAsync(string destination, bool overwrite, CancellationToken token)
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        token.ThrowIfCancellationRequested();
        string target = Path.GetFullPath(destination);
        if (!string.Equals(Path.GetExtension(target), ".wav", StringComparison.OrdinalIgnoreCase))
            throw new IOException("请选择 WAV 音频文件名。");
        if (target.StartsWith(directory + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
            throw new IOException("请把音频导出到录音临时目录之外。");
        var parent = Path.GetDirectoryName(target)!;
        if (!Directory.Exists(parent)) throw new DirectoryNotFoundException("保存文件夹不存在。");
        if (File.Exists(target) && (File.GetAttributes(target) & FileAttributes.ReparsePoint) != 0)
            throw new IOException("不能覆盖文件链接，请选择另一个位置。");
        string stage = Path.Combine(parent, ".rootsound-recording-" + Guid.NewGuid().ToString("N") + ".tmp");
        try
        {
            await using (var input = new FileStream(RecordingPath, FileMode.Open, FileAccess.Read, FileShare.Read, 131072, true))
            await using (var output = new FileStream(stage, FileMode.CreateNew, FileAccess.Write, FileShare.None, 131072, true))
            {
                await input.CopyToAsync(output, token);
                await output.FlushAsync(token);
                output.Flush(true);
            }
            token.ThrowIfCancellationRequested();
            File.Move(stage, target, overwrite);
            exports.Add(target);
            return target;
        }
        finally { if (File.Exists(stage)) File.Delete(stage); }
    }

    public void Dispose()
    {
        if (disposed) return;
        if (File.Exists(RecordingPath)) File.Delete(RecordingPath);
        if (Directory.Exists(directory) && !Directory.EnumerateFileSystemEntries(directory).Any()) Directory.Delete(directory);
        disposed = true;
    }
}
