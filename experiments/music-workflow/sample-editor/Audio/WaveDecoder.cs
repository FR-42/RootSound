using System.Buffers.Binary;

namespace RootSound.SampleEditor.Audio;

internal sealed record WaveData(long Offset, long Length);
internal sealed record WaveLayout(AudioFormat Format, IReadOnlyList<WaveData> Data, long FrameCount);

/// <summary>Chunk lengths are checked as 64-bit values before seeking or allocating.</summary>
internal static class WaveDecoder
{
    private static readonly Guid Pcm = new("00000001-0000-0010-8000-00aa00389b71");
    private static readonly Guid Float = new("00000003-0000-0010-8000-00aa00389b71");

    internal static WaveLayout? TryRead(FileStream source)
    {
        source.Position = 0;
        Span<byte> header = stackalloc byte[12];
        if (source.Length < header.Length) return null;
        source.ReadExactly(header);
        bool rf64 = header[..4].SequenceEqual("RF64"u8);
        if ((!rf64 && !header[..4].SequenceEqual("RIFF"u8)) || !header[8..].SequenceEqual("WAVE"u8)) return null;
        uint riffLength = BinaryPrimitives.ReadUInt32LittleEndian(header[4..]);
        if (rf64 && riffLength != uint.MaxValue) throw new InvalidDataException("RF64 文件头无效。 ");
        long end = rf64 ? source.Length : checked((long)riffLength + 8);
        if (end < 12 || end > source.Length) throw new InvalidDataException("WAV 文件尚未写完整，或已损坏。 ");
        AudioFormat? format = null;
        bool unsupported = false;
        var data = new List<WaveData>();
        ulong? rf64DataLength = null;
        bool firstData = true;
        bool hasDs64 = false;
        var table = new Dictionary<uint, Queue<ulong>>();
        Span<byte> chunkHeader = stackalloc byte[8];
        Span<byte> ds64 = stackalloc byte[28];
        Span<byte> entry = stackalloc byte[12];
        while (source.Position < end)
        {
            if (end - source.Position < 8) throw new InvalidDataException("WAV 分段文件头不完整。 ");
            source.ReadExactly(chunkHeader);
            uint chunkId = BinaryPrimitives.ReadUInt32LittleEndian(chunkHeader);
            uint size = BinaryPrimitives.ReadUInt32LittleEndian(chunkHeader[4..]);
            long payload = source.Position;
            ulong length = size;
            bool isData = chunkHeader[..4].SequenceEqual("data"u8);
            if (size == uint.MaxValue)
            {
                if (!rf64 || !hasDs64) throw new InvalidDataException("音频缺少 RF64 长度信息。 ");
                if (isData && firstData && rf64DataLength is ulong firstLength) length = firstLength;
                else if (table.TryGetValue(chunkId, out var lengths) && lengths.Count != 0) length = lengths.Dequeue();
                else throw new InvalidDataException("RF64 分段长度信息不完整。 ");
            }
            if (length > long.MaxValue || (long)length > end - payload)
                throw new InvalidDataException("WAV 音频数据被截断。 ");
            long longLength = (long)length;
            if (chunkHeader[..4].SequenceEqual("ds64"u8))
            {
                if (!rf64 || hasDs64 || longLength < 28) throw new InvalidDataException("RF64 长度信息无效。 ");
                source.ReadExactly(ds64);
                ulong riff64 = BinaryPrimitives.ReadUInt64LittleEndian(ds64);
                if (riff64 > long.MaxValue - 8 || (long)riff64 + 8 > source.Length || (long)riff64 + 8 < payload + longLength)
                    throw new InvalidDataException("RF64 文件长度无效。 ");
                end = (long)riff64 + 8;
                rf64DataLength = BinaryPrimitives.ReadUInt64LittleEndian(ds64[8..]);
                uint count = BinaryPrimitives.ReadUInt32LittleEndian(ds64[24..]);
                if (count > (longLength - 28) / 12) throw new InvalidDataException("RF64 长度列表被截断。 ");
                for (uint i = 0; i < count; i++)
                {
                    source.ReadExactly(entry);
                    uint id = BinaryPrimitives.ReadUInt32LittleEndian(entry);
                    if (!table.TryGetValue(id, out var values)) table[id] = values = new Queue<ulong>();
                    values.Enqueue(BinaryPrimitives.ReadUInt64LittleEndian(entry[4..]));
                }
                hasDs64 = true;
            }
            else if (chunkHeader[..4].SequenceEqual("fmt "u8))
            {
                if (format is not null || unsupported || longLength < 16 || longLength > 65536)
                    throw new InvalidDataException("WAV 格式信息无效。 ");
                byte[] bytes = new byte[(int)longLength];
                source.ReadExactly(bytes);
                format = ParseFormat(bytes);
                unsupported = format is null;
            }
            else if (isData)
            {
                firstData = false;
                data.Add(new WaveData(payload, longLength));
            }
            long next = checked(payload + longLength + (longLength & 1));
            if (next > end)
            {
                // Some writers omit the last RIFF pad byte. The PCM bytes are still complete.
                if (payload + longLength != end) throw new InvalidDataException("WAV 分段对齐无效。 ");
                next = end;
            }
            source.Position = next;
        }
        if (rf64 && !hasDs64) throw new InvalidDataException("RF64 文件没有长度信息。 ");
        if (unsupported) return null; // Compressed WAV is decoded through Media Foundation.
        if (format is null || data.Count == 0) throw new InvalidDataException("WAV 没有完整的格式或音频内容。 ");
        long frames = 0;
        foreach (WaveData chunk in data)
        {
            if (chunk.Length % format.BlockAlign != 0) throw new InvalidDataException("WAV 末尾包含不完整采样帧。 ");
            frames = checked(frames + chunk.Length / format.BlockAlign);
        }
        return new WaveLayout(format, data, frames);
    }

    private static AudioFormat? ParseFormat(ReadOnlySpan<byte> bytes)
    {
        ushort tag = BinaryPrimitives.ReadUInt16LittleEndian(bytes);
        int channels = BinaryPrimitives.ReadUInt16LittleEndian(bytes[2..]);
        uint rate = BinaryPrimitives.ReadUInt32LittleEndian(bytes[4..]);
        int align = BinaryPrimitives.ReadUInt16LittleEndian(bytes[12..]);
        int bits = BinaryPrimitives.ReadUInt16LittleEndian(bytes[14..]);
        int validBits = 0;
        uint mask = 0;
        if (tag == 0xfffe)
        {
            if (bytes.Length < 40 || BinaryPrimitives.ReadUInt16LittleEndian(bytes[16..]) < 22)
                throw new InvalidDataException("扩展 WAV 格式信息不完整。 ");
            validBits = BinaryPrimitives.ReadUInt16LittleEndian(bytes[18..]);
            mask = BinaryPrimitives.ReadUInt32LittleEndian(bytes[20..]);
            Guid subtype = new(bytes.Slice(24, 16));
            tag = subtype == Pcm ? (ushort)1 : subtype == Float ? (ushort)3 : (ushort)0;
        }
        if (tag is not (1 or 3)) return null;
        if (rate > int.MaxValue) throw new InvalidDataException("音频采样率无效。 ");
        return AudioFormat.Create((int)rate, channels, bits, tag == 3, align, mask, validBits);
    }

    internal static long Decode(FileStream source, FileStream output, WaveLayout layout,
        IProgress<AudioProgress>? progress, CancellationToken cancellationToken)
    {
        int bufferFrames = Math.Max(1, 262144 / layout.Format.BlockAlign);
        byte[] input = new byte[checked(bufferFrames * layout.Format.BlockAlign)];
        float[] samples = new float[checked(bufferFrames * layout.Format.Channels)];
        long done = 0;
        foreach (WaveData chunk in layout.Data)
        {
            source.Position = chunk.Offset;
            long remaining = chunk.Length;
            while (remaining > 0)
            {
                cancellationToken.ThrowIfCancellationRequested();
                int take = (int)Math.Min(input.Length, remaining);
                source.ReadExactly(input.AsSpan(0, take));
                layout.Format.WriteDecoded(output, input.AsSpan(0, take), samples);
                done += take / layout.Format.BlockAlign;
                remaining -= take;
                progress?.Report(new AudioProgress(done / (double)Math.Max(1, layout.FrameCount), "正在读取音频"));
            }
        }
        return done;
    }
}
