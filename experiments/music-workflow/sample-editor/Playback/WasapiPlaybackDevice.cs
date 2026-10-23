using System.Buffers.Binary;
using System.Runtime.InteropServices;

namespace RootSound.SampleEditor.Playback;

internal sealed class WasapiPlaybackDeviceFactory : IPlaybackDeviceFactory
{
    public IPlaybackDevice Open() => new WasapiPlaybackDevice();
}

/// <summary>Shared-mode Windows output. All COM objects and buffer calls stay on one worker.</summary>
internal sealed class WasapiPlaybackDevice : IPlaybackDevice
{
    private IMMDeviceEnumerator? enumerator;
    private IMMDevice? endpoint;
    private IAudioClient? client;
    private IAudioRenderClient? renderer;
    private IAudioClock? clock;
    private readonly bool initializedCom;
    private readonly ushort bits;
    private readonly ushort blockAlign;
    private readonly bool floating;
    private readonly ulong clockFrequency;
    private byte[] encoded = [];
    private bool disposed;

    public int SampleRate { get; }
    public int Channels { get; }
    public int BufferFrames { get; }
    public int PaddingFrames
    {
        get
        {
            ObjectDisposedException.ThrowIf(disposed, this);
            Native.Check(client!.GetCurrentPadding(out uint value));
            if (value > BufferFrames) throw new InvalidDataException("播放设备缓冲区无效。");
            return checked((int)value);
        }
    }
    public double PlayedFrames
    {
        get
        {
            ObjectDisposedException.ThrowIf(disposed, this);
            Native.Check(clock!.GetPosition(out ulong position, out _));
            return position * (double)SampleRate / clockFrequency;
        }
    }

    internal WasapiPlaybackDevice()
    {
        int hr = Native.CoInitializeEx(IntPtr.Zero, 0);
        Native.Check(hr);
        initializedCom = true;
        IntPtr format = IntPtr.Zero;
        try
        {
            enumerator = (IMMDeviceEnumerator)new MMDeviceEnumeratorComObject();
            Native.Check(enumerator.GetDefaultAudioEndpoint(0, 1, out endpoint)); // eRender, eMultimedia
            Guid clientId = Native.AudioClientId;
            Native.Check(endpoint.Activate(ref clientId, 23, IntPtr.Zero, out object instance));
            client = (IAudioClient)instance;
            Native.Check(client.GetMixFormat(out format));
            if (format == IntPtr.Zero) throw new InvalidDataException("Windows 没有提供声音输出格式。");
            ushort tag = unchecked((ushort)Marshal.ReadInt16(format, 0));
            Channels = unchecked((ushort)Marshal.ReadInt16(format, 2));
            SampleRate = Marshal.ReadInt32(format, 4);
            blockAlign = unchecked((ushort)Marshal.ReadInt16(format, 12));
            bits = unchecked((ushort)Marshal.ReadInt16(format, 14));
            ushort extra = unchecked((ushort)Marshal.ReadInt16(format, 16));
            bool pcm = tag == 1;
            floating = tag == 3;
            if (tag == 0xfffe && extra >= 22)
            {
                byte[] id = new byte[16];
                Marshal.Copy(format + 24, id, 0, 16);
                Guid subtype = new(id);
                pcm = subtype == new Guid("00000001-0000-0010-8000-00aa00389b71");
                floating = subtype == new Guid("00000003-0000-0010-8000-00aa00389b71");
                ushort validBits = unchecked((ushort)Marshal.ReadInt16(format, 18));
                if (validBits == 0 || validBits > bits) throw new InvalidDataException("声音输出的有效位数无效。");
            }
            if (Channels is < 1 or > 32 || SampleRate is < 8000 or > 768000 || blockAlign != Channels * (bits / 8)
                || (!pcm && !floating) || (pcm && bits is not (8 or 16 or 24 or 32)) || (floating && bits is not (32 or 64)))
                throw new InvalidDataException("这个播放设备的声音格式暂不支持，请换用扬声器或耳机。");
            // Use the endpoint's exact mix format: Windows guarantees it for shared mode.
            // A 100 ms allocation provides headroom; the transport queues at most 50 ms.
            Native.Check(client.Initialize(0, 0x00080000, 1_000_000, 0, format, IntPtr.Zero));
            Native.Check(client.GetBufferSize(out uint bufferFrames));
            BufferFrames = checked((int)bufferFrames);
            if (BufferFrames < 1) throw new InvalidDataException("声音输出缓冲区为空。");
            Guid renderId = Native.RenderClientId;
            Native.Check(client.GetService(ref renderId, out object renderObject));
            renderer = (IAudioRenderClient)renderObject;
            Guid clockId = Native.ClockId;
            Native.Check(client.GetService(ref clockId, out object clockObject));
            clock = (IAudioClock)clockObject;
            Native.Check(clock.GetFrequency(out clockFrequency));
            if (clockFrequency == 0) throw new InvalidDataException("播放设备没有提供有效的声音时钟。");
        }
        catch { Dispose(); throw; }
        finally { if (format != IntPtr.Zero) Marshal.FreeCoTaskMem(format); }
    }

    public void Write(ReadOnlySpan<float> interleaved)
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        if (interleaved.Length == 0 || interleaved.Length % Channels != 0) throw new ArgumentException("音频帧不完整。");
        int frames = interleaved.Length / Channels;
        int bytes = checked(frames * blockAlign);
        if (encoded.Length < bytes) encoded = new byte[bytes];
        Encode(interleaved, encoded.AsSpan(0, bytes), bits, floating);
        Native.Check(renderer!.GetBuffer(checked((uint)frames), out IntPtr pointer));
        bool released = false;
        try
        {
            Marshal.Copy(encoded, 0, pointer, bytes);
            Native.Check(renderer.ReleaseBuffer((uint)frames, 0));
            released = true;
        }
        finally
        {
            // A failed copy must still release the packet on the same thread.
            if (!released) renderer.ReleaseBuffer(0, 0);
        }
    }

    internal static void Encode(ReadOnlySpan<float> input, Span<byte> output, ushort bits, bool floating)
    {
        int bytesPerSample = bits / 8;
        if (output.Length != input.Length * bytesPerSample) throw new ArgumentException("音频输出缓冲区长度不匹配。");
        for (int i = 0; i < input.Length; i++)
        {
            float value = float.IsFinite(input[i]) ? Math.Clamp(input[i], -1, 1) : 0;
            Span<byte> target = output.Slice(i * bytesPerSample, bytesPerSample);
            if (floating)
            {
                if (bits == 32) BinaryPrimitives.WriteInt32LittleEndian(target, BitConverter.SingleToInt32Bits(value));
                else if (bits == 64) BinaryPrimitives.WriteInt64LittleEndian(target, BitConverter.DoubleToInt64Bits(value));
                else throw new InvalidDataException("不支持的浮点声音格式。");
                continue;
            }
            switch (bits)
            {
                case 8: target[0] = (byte)Math.Clamp((int)Math.Round(value * 128 + 128), 0, 255); break;
                case 16: BinaryPrimitives.WriteInt16LittleEndian(target, (short)Math.Clamp((int)Math.Round(value * 32768d), short.MinValue, short.MaxValue)); break;
                case 24:
                    int pcm24 = Math.Clamp((int)Math.Round(value * 8388608d), -8388608, 8388607);
                    target[0] = (byte)pcm24; target[1] = (byte)(pcm24 >> 8); target[2] = (byte)(pcm24 >> 16);
                    break;
                case 32: BinaryPrimitives.WriteInt32LittleEndian(target, (int)Math.Clamp(Math.Round(value * 2147483648d), int.MinValue, int.MaxValue)); break;
                default: throw new InvalidDataException("不支持的 PCM 声音格式。");
            }
        }
    }

    public void Start() { ObjectDisposedException.ThrowIf(disposed, this); Native.Check(client!.Start()); }
    public void Stop() { ObjectDisposedException.ThrowIf(disposed, this); Native.Check(client!.Stop()); }
    public void Reset() { ObjectDisposedException.ThrowIf(disposed, this); Native.Check(client!.Reset()); }

    public void Dispose()
    {
        if (disposed) return;
        disposed = true;
        try { client?.Stop(); } catch { }
        Native.Release(clock); clock = null;
        Native.Release(renderer); renderer = null;
        Native.Release(client); client = null;
        Native.Release(endpoint); endpoint = null;
        Native.Release(enumerator); enumerator = null;
        encoded = [];
        if (initializedCom) Native.CoUninitialize();
    }
}

internal static class Native
{
    internal static readonly Guid AudioClientId = new("1cb9ad4c-dbfa-4c32-b178-c2f568a703b2");
    internal static readonly Guid RenderClientId = new("f294acfc-3146-4483-a7bf-addca7c260e2");
    internal static readonly Guid ClockId = new("cd63314f-3fba-4a1b-812c-ef96358728e7");
    [DllImport("ole32.dll")] internal static extern int CoInitializeEx(IntPtr reserved, uint coInit);
    [DllImport("ole32.dll")] internal static extern void CoUninitialize();
    internal static void Check(int hr) { if (hr < 0) Marshal.ThrowExceptionForHR(hr); }
    internal static void Release(object? value)
    {
        if (value is not null && Marshal.IsComObject(value))
            try { Marshal.ReleaseComObject(value); } catch (InvalidComObjectException) { }
    }
}

[ComImport, Guid("bcde0395-e52f-467c-8e3d-c4579291692e")]
internal class MMDeviceEnumeratorComObject { }

[ComImport, Guid("a95664d2-9614-4f35-a746-de8db63617e6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IMMDeviceEnumerator
{
    [PreserveSig] int EnumAudioEndpoints(int flow, uint mask, out IntPtr devices);
    [PreserveSig] int GetDefaultAudioEndpoint(int flow, int role, out IMMDevice device);
    [PreserveSig] int GetDevice([MarshalAs(UnmanagedType.LPWStr)] string id, out IMMDevice device);
    [PreserveSig] int RegisterEndpointNotificationCallback(IntPtr callback);
    [PreserveSig] int UnregisterEndpointNotificationCallback(IntPtr callback);
}

[ComImport, Guid("d666063f-1587-4e43-81f1-b948e807363f"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IMMDevice
{
    [PreserveSig] int Activate(ref Guid iid, uint context, IntPtr parameters, [MarshalAs(UnmanagedType.IUnknown)] out object instance);
    [PreserveSig] int OpenPropertyStore(uint access, out IntPtr properties);
    [PreserveSig] int GetId([MarshalAs(UnmanagedType.LPWStr)] out string id);
    [PreserveSig] int GetState(out uint state);
}

[ComImport, Guid("1cb9ad4c-dbfa-4c32-b178-c2f568a703b2"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IAudioClient
{
    [PreserveSig] int Initialize(int shareMode, uint flags, long duration, long periodicity, IntPtr format, IntPtr session);
    [PreserveSig] int GetBufferSize(out uint frames);
    [PreserveSig] int GetStreamLatency(out long latency);
    [PreserveSig] int GetCurrentPadding(out uint frames);
    [PreserveSig] int IsFormatSupported(int shareMode, IntPtr format, out IntPtr closest);
    [PreserveSig] int GetMixFormat(out IntPtr format);
    [PreserveSig] int GetDevicePeriod(out long normal, out long minimum);
    [PreserveSig] int Start();
    [PreserveSig] int Stop();
    [PreserveSig] int Reset();
    [PreserveSig] int SetEventHandle(IntPtr handle);
    [PreserveSig] int GetService(ref Guid iid, [MarshalAs(UnmanagedType.IUnknown)] out object instance);
}

[ComImport, Guid("f294acfc-3146-4483-a7bf-addca7c260e2"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IAudioRenderClient
{
    [PreserveSig] int GetBuffer(uint frames, out IntPtr data);
    [PreserveSig] int ReleaseBuffer(uint frames, uint flags);
}

[ComImport, Guid("cd63314f-3fba-4a1b-812c-ef96358728e7"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IAudioClock
{
    [PreserveSig] int GetFrequency(out ulong frequency);
    [PreserveSig] int GetPosition(out ulong position, out ulong qpc);
    [PreserveSig] int GetCharacteristics(out uint characteristics);
}
