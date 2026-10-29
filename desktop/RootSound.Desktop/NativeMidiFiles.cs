using System.Buffers.Binary;

namespace RootSound.Desktop;

/// <summary>Read-only transport of selected MIDI bytes; musical interpretation belongs to the MIDI module.</summary>
internal static class NativeMidiFiles
{
    internal const int MaximumBytes = 10 * 1024 * 1024;

    internal static bool IsMidiPath(string path)
    {
        string extension = Path.GetExtension(path);
        return extension.Equals(".mid", StringComparison.OrdinalIgnoreCase)
            || extension.Equals(".midi", StringComparison.OrdinalIgnoreCase);
    }

    internal static byte[] ReadBytes(string path)
    {
        if (!IsMidiPath(path)) throw new InvalidDataException("请选择 .mid 或 .midi 文件，原文件已保留。");
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        long length = stream.Length;
        if (length < 14) throw new InvalidDataException("MIDI 文件头不完整，尚未创建歌曲项目。");
        if (length > MaximumBytes) throw new InvalidDataException("MIDI 文件超出当前 10 MiB 的大小范围，原文件已保留。");
        var bytes = new byte[checked((int)length)];
        stream.ReadExactly(bytes);
        if (stream.Length != length || stream.ReadByte() != -1)
            throw new IOException("MIDI 文件在读取时发生变化，请重新选择。原文件已保留。");
        uint headerLength = BinaryPrimitives.ReadUInt32BigEndian(bytes.AsSpan(4, 4));
        if (!bytes.AsSpan(0, 4).SequenceEqual("MThd"u8) || headerLength < 6 || headerLength > (ulong)bytes.Length - 8)
            throw new InvalidDataException("这个文件没有有效的 MIDI 文件头，尚未创建歌曲项目。");
        return bytes;
    }
}
