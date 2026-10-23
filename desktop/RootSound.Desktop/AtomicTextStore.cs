using System.Security.Cryptography;
using System.Text;

namespace RootSound.Desktop;

/// <summary>Owns one local text library; musical content is interpreted by the workstation.</summary>
public sealed class AtomicTextStore : IDisposable
{
    public const int MaximumBytes = 128 * 1024 * 1024;
    private static readonly UTF8Encoding Utf8 = new(false, true);
    private readonly object gate = new();
    private readonly string directory;
    private FileStream? ownership;
    private byte[]? observedHash;
    private bool disposed;

    public string FilePath { get; }

    public AtomicTextStore(string directory)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(directory);
        this.directory = Path.GetFullPath(directory);
        FilePath = Path.Combine(this.directory, "materials.json");
        Directory.CreateDirectory(this.directory);
        try
        {
            // Keep the handle open. The mere presence of a lock file is not a lock.
            ownership = new FileStream(Path.Combine(this.directory, "materials.lock"),
                FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None);
        }
        catch (IOException error)
        {
            throw new IOException("无法独占打开声音库，可能已有另一个 RootSound 窗口正在使用它。请关闭该窗口后重试。", error);
        }
        try
        {
            observedHash = Fingerprint(ReadBytes());
        }
        catch
        {
            ownership.Dispose();
            ownership = null;
            throw;
        }
    }

    public string? Read()
    {
        lock (gate)
        {
            ThrowIfDisposed();
            byte[]? bytes = ReadBytes();
            // Decode first: an unreadable file must not become an accepted new baseline.
            string? text = bytes is null ? null : Decode(bytes);
            observedHash = Fingerprint(bytes);
            return text;
        }
    }

    public void Write(string value)
    {
        ArgumentNullException.ThrowIfNull(value);
        if (value.Length > MaximumBytes || Utf8.GetByteCount(value) > MaximumBytes)
            throw new InvalidDataException($"声音库超过当前 {MaximumBytes / (1024 * 1024)} MiB 的文件大小上限，原文件没有被覆盖。");
        byte[] bytes = Utf8.GetBytes(value);
        lock (gate)
        {
            ThrowIfDisposed();
            RequireUnchanged();
            string temporary = Path.Combine(directory, $".materials.{Guid.NewGuid():N}.tmp");
            try
            {
                using (var stream = new FileStream(temporary, FileMode.CreateNew,
                    FileAccess.Write, FileShare.None))
                {
                    stream.Write(bytes);
                    stream.Flush(flushToDisk: true);
                }
                // Catch another program changing the file while the candidate was written.
                RequireUnchanged();
                if (observedHash is null)
                    File.Move(temporary, FilePath); // Never overwrite an unexpected new file.
                else
                    File.Replace(temporary, FilePath, FilePath + ".bak");
                observedHash = SHA256.HashData(bytes);
            }
            finally
            {
                // Only our uniquely named candidate is eligible for cleanup.
                try { File.Delete(temporary); }
                catch (IOException) { }
                catch (UnauthorizedAccessException) { }
            }
        }
    }

    public void Dispose()
    {
        lock (gate)
        {
            if (disposed) return;
            disposed = true;
            ownership?.Dispose();
            ownership = null;
            // Do not delete the lock file: unlinking it can race a new owner.
        }
    }

    private byte[]? ReadBytes()
    {
        FileStream stream;
        try { stream = new FileStream(FilePath, FileMode.Open, FileAccess.Read, FileShare.Read); }
        catch (FileNotFoundException) { return null; }
        using (stream)
        {
            if (stream.Length > MaximumBytes)
                throw new InvalidDataException($"声音库超过当前 {MaximumBytes / (1024 * 1024)} MiB 的文件大小上限，原文件已保留。");
            byte[] bytes = new byte[checked((int)stream.Length)];
            stream.ReadExactly(bytes);
            return bytes;
        }
    }

    private static string Decode(byte[] bytes)
    {
        // Accept a UTF-8 BOM from an external text editor without inserting it into JSON.
        int offset = bytes.Length >= 3 && bytes[0] == 0xef && bytes[1] == 0xbb && bytes[2] == 0xbf ? 3 : 0;
        try { return Utf8.GetString(bytes, offset, bytes.Length - offset); }
        catch (DecoderFallbackException error)
        {
            throw new InvalidDataException("声音库不是有效的 UTF-8 文本，原文件已保留。", error);
        }
    }

    private static byte[]? Fingerprint(byte[]? bytes) => bytes is null ? null : SHA256.HashData(bytes);

    private void RequireUnchanged()
    {
        byte[]? actual = Fingerprint(ReadBytes());
        if ((actual is null) != (observedHash is null)
            || (actual is not null && observedHash is not null && !actual.AsSpan().SequenceEqual(observedHash)))
            throw new IOException("声音库已被其他程序修改或移走。为保护这些更改，本次没有覆盖保存；请重新打开声音库后再编辑。");
    }

    private void ThrowIfDisposed() => ObjectDisposedException.ThrowIf(disposed, this);
}
