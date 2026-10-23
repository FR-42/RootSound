using System.Runtime.InteropServices;

namespace RootSound.BluetoothRecorder.Recording;

internal static class WasapiNative
{
    internal const uint NoPersist = 0x00080000;
    internal const uint Loopback = 0x00020000;
    internal const uint Silent = 2;
    internal const uint Discontinuity = 1;
    internal const uint TimestampError = 4;
    internal static readonly Guid AudioClientId = new("1cb9ad4c-dbfa-4c32-b178-c2f568a703b2");
    internal static readonly Guid CaptureClientId = new("c8adbd64-e71e-48a0-a4de-185c395cd317");

    [DllImport("ole32.dll")] internal static extern int CoInitializeEx(IntPtr reserved, uint coInit);
    [DllImport("ole32.dll")] internal static extern void CoUninitialize();
    [DllImport("ole32.dll")] internal static extern int PropVariantClear(ref PropVariant value);

    internal static void Check(int hr)
    {
        if (hr < 0) Marshal.ThrowExceptionForHR(hr);
    }

    internal static void Release(object? value)
    {
        try { if (value is not null && Marshal.IsComObject(value)) Marshal.ReleaseComObject(value); }
        catch (InvalidComObjectException) { }
    }

    internal static string FriendlyName(IMMDevice device)
    {
        IPropertyStore? properties = null;
        PropVariant value = default;
        try
        {
            Check(device.OpenPropertyStore(0, out properties));
            PropertyKey key = new() { FormatId = new("a45c254e-df1c-4efd-8020-67d146a850e0"), PropertyId = 14 };
            Check(properties.GetValue(ref key, out value));
            return value.Type == 31 && value.Pointer != IntPtr.Zero
                ? Marshal.PtrToStringUni(value.Pointer) ?? "电脑播放输出"
                : "电脑播放输出";
        }
        catch { return "电脑播放输出"; }
        finally { PropVariantClear(ref value); Release(properties); }
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
    [PreserveSig] int Activate(ref Guid iid, uint context, IntPtr activationParameters, [MarshalAs(UnmanagedType.IUnknown)] out object instance);
    [PreserveSig] int OpenPropertyStore(uint access, out IPropertyStore properties);
    [PreserveSig] int GetId([MarshalAs(UnmanagedType.LPWStr)] out string id);
    [PreserveSig] int GetState(out uint state);
}

[ComImport, Guid("1be09788-6894-4089-8586-9a2a6c265ac5"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IMMEndpoint
{
    [PreserveSig] int GetDataFlow(out int flow);
}

[StructLayout(LayoutKind.Sequential)]
public struct PropertyKey { internal Guid FormatId; internal uint PropertyId; }
[StructLayout(LayoutKind.Explicit, Size = 24)]
internal struct PropVariant
{
    [FieldOffset(0)] internal ushort Type;
    [FieldOffset(8)] internal IntPtr Pointer;
}

[ComImport, Guid("886d8eeb-8cf2-4446-8d02-cdba1dbdcf99"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IPropertyStore
{
    [PreserveSig] int GetCount(out uint count);
    [PreserveSig] int GetAt(uint index, out PropertyKey key);
    [PreserveSig] int GetValue(ref PropertyKey key, out PropVariant value);
    [PreserveSig] int SetValue(ref PropertyKey key, ref PropVariant value);
    [PreserveSig] int Commit();
}

[ComImport, Guid("1cb9ad4c-dbfa-4c32-b178-c2f568a703b2"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IAudioClient
{
    [PreserveSig] int Initialize(int shareMode, uint flags, long duration, long periodicity, IntPtr format, IntPtr sessionGuid);
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

[ComImport, Guid("c8adbd64-e71e-48a0-a4de-185c395cd317"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IAudioCaptureClient
{
    [PreserveSig] int GetBuffer(out IntPtr data, out uint frames, out uint flags, out ulong devicePosition, out ulong qpcPosition);
    [PreserveSig] int ReleaseBuffer(uint frames);
    [PreserveSig] int GetNextPacketSize(out uint frames);
}
