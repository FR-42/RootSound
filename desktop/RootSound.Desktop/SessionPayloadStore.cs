using System.Security.Cryptography;
using System.Text;

namespace RootSound.Desktop;

/// <summary>Owned, disposable binary custody. Tokens never contain a client-selected path.</summary>
internal sealed class SessionPayloadStore : IDisposable
{
    internal const int DefaultThreshold = 64 * 1024;
    private const int MaximumAudioBytes = 16 * 1024 * 1024;
    private readonly string session = Guid.NewGuid().ToString("N");
    private readonly Dictionary<string, int> owned = new(StringComparer.Ordinal);
    private bool disposed;
    internal int Threshold { get; }
    internal string DirectoryPath { get; }
    internal bool HasPayloads => owned.Count != 0;

    internal SessionPayloadStore(string root, int threshold = DefaultThreshold)
    {
        if (threshold < 1) throw new ArgumentOutOfRangeException(nameof(threshold));
        Threshold = threshold;
        root = Path.GetFullPath(root);
        Directory.CreateDirectory(root);
        if ((File.GetAttributes(root) & FileAttributes.ReparsePoint) != 0) throw new IOException("工程缓存目录不能是链接。");
        DirectoryPath = Path.Combine(root, session);
        Directory.CreateDirectory(DirectoryPath);
    }

    internal string AddBase64(string text, int expectedBytes)
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        if (expectedBytes < 1 || expectedBytes > MaximumAudioBytes || text.Length != ((expectedBytes + 2) / 3) * 4)
            throw new InvalidDataException("工程采样的编码长度无效，原文件已保留。");
        string temporary = Path.Combine(DirectoryPath, Guid.NewGuid().ToString("N") + ".tmp");
        try
        {
            using (var output = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                byte[] buffer = new byte[12 * 1024]; int written = 0;
                for (int offset = 0; offset < text.Length;)
                {
                    int count = Math.Min(16 * 1024, text.Length - offset);
                    var chars = text.AsSpan(offset, count);
                    foreach (char c in chars)
                        if (!(c is >= 'A' and <= 'Z' or >= 'a' and <= 'z' or >= '0' and <= '9' or '+' or '/' or '='))
                            throw new InvalidDataException("工程采样不是规范的 base64，原文件已保留。");
                    if (offset + count < text.Length && chars.Contains('=')) throw new InvalidDataException("工程采样的填充无效。");
                    if (!Convert.TryFromBase64Chars(chars, buffer, out int bytes)) throw new InvalidDataException("工程采样编码损坏。");
                    if (offset + count == text.Length && !Convert.ToBase64String(buffer, 0, bytes).AsSpan().SequenceEqual(chars))
                        throw new InvalidDataException("工程采样不是规范的 base64。");
                    output.Write(buffer, 0, bytes); written += bytes; offset += count;
                }
                if (written != expectedBytes) throw new InvalidDataException("工程采样的字节数不一致。");
                output.Flush(true);
            }
            string hash; using (var file = File.OpenRead(temporary)) hash = Convert.ToHexString(SHA256.HashData(file)).ToLowerInvariant();
            if (!owned.ContainsKey(hash)) { File.Move(temporary, Path.Combine(DirectoryPath, hash + ".bin")); owned.Add(hash, expectedBytes); }
            return "rootsound-payload:" + session + ":" + hash;
        }
        finally { try { File.Delete(temporary); } catch (IOException) { } catch (UnauthorizedAccessException) { } }
    }

    internal Stream Open(string token)
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        if ((File.GetAttributes(DirectoryPath) & FileAttributes.ReparsePoint) != 0) throw new IOException("音频缓存目录不能是链接。");
        string prefix = "rootsound-payload:" + session + ":";
        if (!token.StartsWith(prefix, StringComparison.Ordinal) || token.Length != prefix.Length + 64)
            throw new IOException("这个音频缓存不属于当前工程，请重新打开工程。");
        string hash = token[prefix.Length..];
        if (!hash.All(c => c is >= '0' and <= '9' or >= 'a' and <= 'f') || !owned.TryGetValue(hash, out int bytes))
            throw new IOException("这个音频缓存未获当前工程授权。");
        string path = Path.Combine(DirectoryPath, hash + ".bin");
        if ((File.GetAttributes(path) & FileAttributes.ReparsePoint) != 0) throw new IOException("音频缓存不能是链接。");
        var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read | FileShare.Delete);
        try
        {
            if (stream.Length != bytes || !string.Equals(Convert.ToHexString(SHA256.HashData(stream)), hash, StringComparison.OrdinalIgnoreCase))
                throw new IOException("音频缓存缺失或损坏，原工程尚未覆盖，请重新打开。");
            stream.Position = 0; return stream;
        }
        catch { stream.Dispose(); throw; }
    }

    internal void Validate(string token, int expectedBytes)
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        string prefix = "rootsound-payload:" + session + ":";
        if (!token.StartsWith(prefix, StringComparison.Ordinal) || token.Length != prefix.Length + 64
            || !owned.TryGetValue(token[prefix.Length..], out int bytes) || bytes != expectedBytes)
            throw new IOException("音频缓存不属于当前工程，或声明的字节数不符。");
    }

    public void Dispose()
    {
        if (disposed) return; disposed = true;
        if (!Directory.Exists(DirectoryPath) || (File.GetAttributes(DirectoryPath) & FileAttributes.ReparsePoint) != 0) { owned.Clear(); return; }
        foreach (string hash in owned.Keys)
        {
            string file = Path.Combine(DirectoryPath, hash + ".bin");
            try { File.Delete(file); } catch (IOException) { } catch (UnauthorizedAccessException) { }
        }
        try { Directory.Delete(DirectoryPath, false); } catch (IOException) { } catch (UnauthorizedAccessException) { }
        owned.Clear();
    }
}
