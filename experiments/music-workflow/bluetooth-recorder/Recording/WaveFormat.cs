using System.Buffers.Binary;
using System.Runtime.InteropServices;

namespace RootSound.BluetoothRecorder.Recording;

/// <summary>The actual Windows mixer format. Captured samples are never resampled or requantized.</summary>
public sealed class WaveFormat
{
    private readonly byte[] bytes;
    public ushort Tag { get; }
    public ushort Channels { get; }
    public uint SampleRate { get; }
    public uint BytesPerSecond { get; }
    public ushort BlockAlign { get; }
    public ushort BitsPerSample { get; }
    public bool IsFloat { get; }
    public bool IsPcm { get; }
    public ReadOnlyMemory<byte> FormatBytes => bytes;

    public WaveFormat(ReadOnlySpan<byte> format)
    {
        if (format.Length < 16) throw new InvalidDataException("音频格式头不完整。");
        Tag = BinaryPrimitives.ReadUInt16LittleEndian(format);
        Channels = BinaryPrimitives.ReadUInt16LittleEndian(format[2..]);
        SampleRate = BinaryPrimitives.ReadUInt32LittleEndian(format[4..]);
        BytesPerSecond = BinaryPrimitives.ReadUInt32LittleEndian(format[8..]);
        BlockAlign = BinaryPrimitives.ReadUInt16LittleEndian(format[12..]);
        BitsPerSample = BinaryPrimitives.ReadUInt16LittleEndian(format[14..]);
        int size = Tag == 1 && format.Length == 16 ? 16 : 18;
        if (size == 18)
        {
            if (format.Length < 18) throw new InvalidDataException("音频扩展格式头不完整。");
            size += BinaryPrimitives.ReadUInt16LittleEndian(format[16..]);
        }
        if (format.Length != size || Channels is < 1 or > 32 || SampleRate is < 8000 or > 768000
            || BitsPerSample is not (8 or 16 or 24 or 32 or 64)
            || BlockAlign != Channels * (BitsPerSample / 8)
            || BytesPerSecond != SampleRate * BlockAlign)
            throw new InvalidDataException("Windows 输出了不支持或不完整的音频格式。");
        IsPcm = Tag == 1;
        IsFloat = Tag == 3;
        if (Tag == 0xfffe)
        {
            if (size < 40) throw new InvalidDataException("扩展音频格式不完整。");
            Guid subtype = new(format.Slice(24, 16));
            IsPcm = subtype == new Guid("00000001-0000-0010-8000-00aa00389b71");
            IsFloat = subtype == new Guid("00000003-0000-0010-8000-00aa00389b71");
            ushort validBits = BinaryPrimitives.ReadUInt16LittleEndian(format[18..]);
            if (validBits == 0 || validBits > BitsPerSample)
                throw new InvalidDataException("音频有效位数无效。");
        }
        if ((!IsPcm && !IsFloat) || (IsFloat && BitsPerSample is not (32 or 64)))
            throw new InvalidDataException("仅支持未压缩 PCM 或浮点音频。");
        bytes = format.ToArray();
    }

    internal static WaveFormat FromNative(IntPtr pointer)
    {
        if (pointer == IntPtr.Zero) throw new InvalidDataException("Windows 没有提供音频格式。");
        ushort extra = unchecked((ushort)Marshal.ReadInt16(pointer, 16));
        if (extra > 1024) throw new InvalidDataException("Windows 提供的音频格式过大。");
        byte[] data = new byte[18 + extra];
        Marshal.Copy(pointer, data, 0, data.Length);
        return new(data);
    }

    public float Peak(ReadOnlySpan<byte> packet)
    {
        float peak = 0;
        int sampleBytes = BitsPerSample / 8;
        for (int offset = 0; offset + sampleBytes <= packet.Length; offset += sampleBytes)
        {
            double value;
            ReadOnlySpan<byte> sample = packet[offset..];
            if (IsFloat)
                value = BitsPerSample == 32
                    ? BitConverter.Int32BitsToSingle(BinaryPrimitives.ReadInt32LittleEndian(sample))
                    : BitConverter.Int64BitsToDouble(BinaryPrimitives.ReadInt64LittleEndian(sample));
            else
                value = BitsPerSample switch
                {
                    8 => (sample[0] - 128) / 128d,
                    16 => BinaryPrimitives.ReadInt16LittleEndian(sample) / 32768d,
                    24 => ((sample[0] | sample[1] << 8 | sample[2] << 16) << 8 >> 8) / 8388608d,
                    32 => BinaryPrimitives.ReadInt32LittleEndian(sample) / 2147483648d,
                    64 => BinaryPrimitives.ReadInt64LittleEndian(sample) / 9223372036854775808d,
                    _ => 0
                };
            if (double.IsFinite(value)) peak = Math.Max(peak, (float)Math.Min(1, Math.Abs(value)));
        }
        return peak;
    }

    internal void FillSilence(Span<byte> destination) => destination.Fill(IsPcm && BitsPerSample == 8 ? (byte)128 : (byte)0);
}
