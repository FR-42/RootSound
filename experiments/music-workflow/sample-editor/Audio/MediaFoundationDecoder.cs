using System.Runtime.InteropServices;

namespace RootSound.SampleEditor.Audio;

/// <summary>Local-file decoding only. No audio renderer, capture device or network source is created.</summary>
internal static class MediaFoundationDecoder
{
    private const uint FirstAudio = 0xfffffffd;
    private static readonly Guid MajorType = new("48eba18e-f8c9-4687-bf11-0a74c9f96a8f");
    private static readonly Guid SubType = new("f7e34c9a-42e8-4714-b74b-cb29d72c35e5");
    private static readonly Guid AudioType = new("73647561-0000-0010-8000-00aa00389b71");
    private static readonly Guid FloatType = new("00000003-0000-0010-8000-00aa00389b71");
    private static readonly Guid PcmType = new("00000001-0000-0010-8000-00aa00389b71");
    private static readonly Guid ChannelsKey = new("37e48bf5-645e-4c5b-89de-ada9e29b696a");
    private static readonly Guid RateKey = new("5faeeae7-0290-4c31-9e8a-c534f68d9dba");
    private static readonly Guid BitsKey = new("f2deb57f-40fa-4764-aa33-ed4f2d1ff669");
    private static readonly Guid AlignmentKey = new("322de230-9eeb-43bd-ab7a-ff412251541d");
    private static readonly Guid MaskKey = new("55fb5765-644a-4caf-8479-938983bb1588");
    private static readonly Guid DurationKey = new("6c990d33-bb8e-477a-8598-0d5d96fcd88a");

    internal static (AudioFormat Format, long Frames) Decode(string path, FileStream output,
        IProgress<AudioProgress>? progress, CancellationToken cancellationToken)
    {
        if (!OperatingSystem.IsWindows()) throw new PlatformNotSupportedException("压缩音频解码需要 Windows。 ");
        int initialized = CoInitializeEx(IntPtr.Zero, 0);
        if (initialized < 0) Marshal.ThrowExceptionForHR(initialized);
        bool started = false;
        IntPtr reader = IntPtr.Zero;
        IntPtr native = IntPtr.Zero;
        try
        {
            Check(MFStartup(0x20070, 0));
            started = true;
            cancellationToken.ThrowIfCancellationRequested();
            Check(MFCreateSourceReaderFromURL(path, IntPtr.Zero, out reader));
            var selection = Method<SetSelection>(reader, 4);
            Check(selection(reader, 0xfffffffe, 0));
            Check(selection(reader, FirstAudio, 1));
            Check(Method<GetNativeType>(reader, 5)(reader, FirstAudio, 0, out native));
            uint nativeRate = GetOptionalUInt(native, RateKey);
            uint nativeChannels = GetOptionalUInt(native, ChannelsKey);

            // Float output avoids lowering a 24-bit/32-bit source to the default PCM16 format.
            // Some older codecs only negotiate PCM; request 32-bit there before using their native precision.
            int result = Configure(reader, FloatType, nativeRate, nativeChannels, 32);
            if (result < 0) result = Configure(reader, PcmType, nativeRate, nativeChannels, 32);
            if (result < 0) result = Configure(reader, PcmType, nativeRate, nativeChannels, 0);
            Check(result);
            AudioFormat format = ReadFormat(reader);
            if ((nativeRate != 0 && format.SampleRate != nativeRate) ||
                (nativeChannels != 0 && format.Channels != nativeChannels))
                throw new InvalidDataException("解码器尝试改变原音频的采样率或声道数，已停止导入。 ");

            long duration = GetDuration(reader);
            var readSample = Method<ReadSample>(reader, 9);
            long frames = 0;
            long? firstTimestamp = null;
            byte[] bytes = new byte[Math.Max(format.BlockAlign, 262144 / format.BlockAlign * format.BlockAlign)];
            float[] floats = new float[bytes.Length / (format.Bits / 8)];
            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();
                IntPtr sample = IntPtr.Zero;
                try
                {
                    Check(readSample(reader, FirstAudio, 0, out _, out uint flags, out long timestamp, out sample));
                    if ((flags & 1) != 0) throw new InvalidDataException("Windows 解码器无法继续读取这个音频。 ");
                    if ((flags & 0x20) != 0 && ReadFormat(reader) != format)
                        throw new InvalidDataException("文件中途改变了音频格式，无法无损地合并为一个采样。 ");
                    if (sample != IntPtr.Zero)
                    {
                        firstTimestamp ??= timestamp;
                        // Keep actual silent gaps; sub-frame timestamp rounding does not add/remove PCM frames.
                        double timelineFrame = (timestamp - (double)firstTimestamp.Value) * format.SampleRate / 10000000d;
                        if (timelineFrame > long.MaxValue) throw new InvalidDataException("音频时间信息无效。 ");
                        long desired = (long)Math.Round(Math.Max(0, timelineFrame));
                        if (desired > frames + 2)
                        {
                            WriteSilence(output, desired - frames, format.Channels, cancellationToken);
                            frames = desired;
                        }
                        frames = checked(frames + CopySample(sample, output, format, bytes, floats, cancellationToken));
                        double fraction = duration > 0 ? Math.Clamp(timestamp / (double)duration, 0, 0.999) : 0;
                        progress?.Report(new AudioProgress(fraction, "正在解码音频"));
                    }
                    if ((flags & 2) != 0) break;
                }
                finally { Release(ref sample); }
            }
            return (format, frames);
        }
        catch (COMException error)
        {
            throw new InvalidDataException("Windows 无法解码这个文件；它可能损坏、受保护，或缺少对应解码器。", error);
        }
        finally
        {
            Release(ref native);
            Release(ref reader);
            if (started) _ = MFShutdown();
            CoUninitialize();
        }
    }

    private static int Configure(IntPtr reader, Guid subtype, uint rate, uint channels, uint bits)
    {
        IntPtr type = IntPtr.Zero;
        try
        {
            Check(MFCreateMediaType(out type));
            var setGuid = Method<SetGuid>(type, 24);
            Check(setGuid(type, MajorType, AudioType));
            Check(setGuid(type, SubType, subtype));
            var setUInt = Method<SetUInt>(type, 21);
            if (rate != 0) Check(setUInt(type, RateKey, rate));
            if (channels != 0) Check(setUInt(type, ChannelsKey, channels));
            if (bits != 0) Check(setUInt(type, BitsKey, bits));
            return Method<SetCurrentType>(reader, 7)(reader, FirstAudio, IntPtr.Zero, type);
        }
        finally { Release(ref type); }
    }

    private static AudioFormat ReadFormat(IntPtr reader)
    {
        IntPtr type = IntPtr.Zero;
        try
        {
            Check(Method<GetCurrentType>(reader, 6)(reader, FirstAudio, out type));
            var getGuid = Method<GetGuid>(type, 10);
            Check(getGuid(type, SubType, out Guid subtype));
            if (subtype != PcmType && subtype != FloatType) throw new InvalidDataException("解码器没有提供可编辑音频。 ");
            uint rate = GetUInt(type, RateKey), channels = GetUInt(type, ChannelsKey);
            uint bits = GetUInt(type, BitsKey), align = GetUInt(type, AlignmentKey);
            if (rate > int.MaxValue || channels > int.MaxValue || bits > int.MaxValue || align > int.MaxValue)
                throw new InvalidDataException("解码后的音频参数无效。 ");
            return AudioFormat.Create((int)rate, (int)channels, (int)bits, subtype == FloatType,
                (int)align, GetOptionalUInt(type, MaskKey));
        }
        finally { Release(ref type); }
    }

    private static long CopySample(IntPtr sample, FileStream output, AudioFormat format,
        byte[] bytes, float[] floats, CancellationToken cancellationToken)
    {
        IntPtr buffer = IntPtr.Zero;
        bool locked = false;
        try
        {
            Check(Method<ToBuffer>(sample, 41)(sample, out buffer));
            Check(Method<LockBuffer>(buffer, 3)(buffer, out IntPtr data, out _, out uint length));
            locked = true;
            if (length % format.BlockAlign != 0) throw new InvalidDataException("解码器返回了不完整音频帧。 ");
            uint copied = 0;
            while (copied < length)
            {
                cancellationToken.ThrowIfCancellationRequested();
                int take = (int)Math.Min((uint)bytes.Length, length - copied);
                Marshal.Copy(new IntPtr(checked(data.ToInt64() + copied)), bytes, 0, take);
                format.WriteDecoded(output, bytes.AsSpan(0, take), floats);
                copied += (uint)take;
            }
            return length / format.BlockAlign;
        }
        finally
        {
            if (locked) _ = Method<UnlockBuffer>(buffer, 4)(buffer);
            Release(ref buffer);
        }
    }

    private static void WriteSilence(FileStream output, long frames, int channels, CancellationToken cancellationToken)
    {
        byte[] zero = new byte[262144];
        long remaining = checked(frames * channels * sizeof(float));
        while (remaining > 0)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int take = (int)Math.Min(zero.Length, remaining);
            output.Write(zero, 0, take);
            remaining -= take;
        }
    }

    private static uint GetUInt(IntPtr type, Guid key)
    {
        Check(Method<GetUInt32>(type, 7)(type, key, out uint value));
        return value;
    }
    private static uint GetOptionalUInt(IntPtr type, Guid key) =>
        Method<GetUInt32>(type, 7)(type, key, out uint value) >= 0 ? value : 0;

    private static long GetDuration(IntPtr reader)
    {
        var variant = new PropVariant();
        try
        {
            int result = Method<GetPresentation>(reader, 12)(reader, 0xffffffff, DurationKey, out variant);
            return result >= 0 && variant.Type is 20 or 21 && variant.Value <= long.MaxValue ? (long)variant.Value : 0;
        }
        finally { _ = PropVariantClear(ref variant); }
    }

    private static T Method<T>(IntPtr instance, int index) where T : Delegate =>
        Marshal.GetDelegateForFunctionPointer<T>(Marshal.ReadIntPtr(Marshal.ReadIntPtr(instance), index * IntPtr.Size));
    private static void Check(int hr) { if (hr < 0) Marshal.ThrowExceptionForHR(hr); }
    private static void Release(ref IntPtr pointer)
    {
        if (pointer == IntPtr.Zero) return;
        Marshal.Release(pointer);
        pointer = IntPtr.Zero;
    }

    [StructLayout(LayoutKind.Explicit, Size = 24)]
    private struct PropVariant
    {
        [FieldOffset(0)] internal ushort Type;
        [FieldOffset(8)] internal ulong Value;
    }

    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int SetSelection(IntPtr self, uint stream, int selected);
    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int GetNativeType(IntPtr self, uint stream, uint index, out IntPtr mediaType);
    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int GetCurrentType(IntPtr self, uint stream, out IntPtr mediaType);
    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int SetCurrentType(IntPtr self, uint stream, IntPtr reserved, IntPtr mediaType);
    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int SetGuid(IntPtr self, in Guid key, in Guid value);
    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int GetGuid(IntPtr self, in Guid key, out Guid value);
    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int SetUInt(IntPtr self, in Guid key, uint value);
    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int GetUInt32(IntPtr self, in Guid key, out uint value);
    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int ReadSample(IntPtr self, uint stream, uint flags, out uint actualStream, out uint streamFlags, out long timestamp, out IntPtr sample);
    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int ToBuffer(IntPtr self, out IntPtr buffer);
    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int LockBuffer(IntPtr self, out IntPtr data, out uint maximumLength, out uint currentLength);
    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int UnlockBuffer(IntPtr self);
    [UnmanagedFunctionPointer(CallingConvention.StdCall)] private delegate int GetPresentation(IntPtr self, uint stream, in Guid key, out PropVariant value);
    [DllImport("ole32.dll")] private static extern int CoInitializeEx(IntPtr reserved, uint apartment);
    [DllImport("ole32.dll")] private static extern void CoUninitialize();
    [DllImport("ole32.dll")] private static extern int PropVariantClear(ref PropVariant value);
    [DllImport("mfplat.dll")] private static extern int MFStartup(uint version, uint flags);
    [DllImport("mfplat.dll")] private static extern int MFShutdown();
    [DllImport("mfplat.dll")] private static extern int MFCreateMediaType(out IntPtr type);
    [DllImport("mfreadwrite.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
    private static extern int MFCreateSourceReaderFromURL(string path, IntPtr attributes, out IntPtr reader);
}
