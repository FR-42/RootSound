namespace RootSound.TimbreLab.Instrument;

internal static class AtomicFile
{
    internal static void Write(string destination, bool overwrite, CancellationToken cancellationToken, Action<Stream> write)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(destination);
        destination = Path.GetFullPath(destination);
        string directory = Path.GetDirectoryName(destination)!;
        if (!Directory.Exists(directory)) throw new DirectoryNotFoundException("保存位置已不存在。 ");
        if (!overwrite && File.Exists(destination)) throw new IOException("文件已存在，请选择新的名称。 ");
        cancellationToken.ThrowIfCancellationRequested();
        string stage = Path.Combine(directory, ".rootsound-timbre-" + Guid.NewGuid().ToString("N") + ".tmp");
        try
        {
            using (var stream = new FileStream(stage, FileMode.CreateNew, FileAccess.Write, FileShare.None, 128 * 1024))
            {
                write(stream);
                cancellationToken.ThrowIfCancellationRequested();
                stream.Flush(true);
            }
            cancellationToken.ThrowIfCancellationRequested();
            if (overwrite && File.Exists(destination)) File.Replace(stage, destination, null, true);
            else File.Move(stage, destination, false);
        }
        finally
        {
            try { File.Delete(stage); } catch (IOException) { } catch (UnauthorizedAccessException) { }
        }
    }
}
