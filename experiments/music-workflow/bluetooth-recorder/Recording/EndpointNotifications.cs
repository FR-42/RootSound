using System.Diagnostics;
using System.Collections.Concurrent;
using System.Runtime.InteropServices;

namespace RootSound.BluetoothRecorder.Recording;

// Native callbacks only record atomic state. Device calls, UI callbacks, stopping and disk I/O
// belong to the recording worker, never an MMDevice notification thread.
[ComVisible(true), Guid("7991eec9-7e89-4d85-8390-6c703cec60c0"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IMMNotificationClient
{
    [PreserveSig] int OnDeviceStateChanged([MarshalAs(UnmanagedType.LPWStr)] string deviceId, uint state);
    [PreserveSig] int OnDeviceAdded([MarshalAs(UnmanagedType.LPWStr)] string deviceId);
    [PreserveSig] int OnDeviceRemoved([MarshalAs(UnmanagedType.LPWStr)] string deviceId);
    [PreserveSig] int OnDefaultDeviceChanged(int flow, int role, [MarshalAs(UnmanagedType.LPWStr)] string? deviceId);
    [PreserveSig] int OnPropertyValueChanged([MarshalAs(UnmanagedType.LPWStr)] string deviceId, PropertyKey key);
}

internal enum EndpointChange { None, DefaultOutputChanged, OutputUnavailable }

/// <summary>
/// MMDevice does not AddRef registered callbacks. If unregistration unexpectedly fails,
/// the explicit CCW reference must remain alive until process exit rather than dangling.
/// Entries are deliberately never released or finalized; all other capture COM objects still close.
/// </summary>
internal static class NotificationLifetime
{
    private sealed record RetainedCallback(IntPtr InterfacePointer, EndpointNotifications Callback);
    private static readonly ConcurrentBag<RetainedCallback> Quarantined = new();
    internal static bool IsDetached(int unregisterResult) => unregisterResult >= 0
        || unchecked((uint)unregisterResult) == 0x80070490; // E_NOTFOUND: already detached.
    internal static void Quarantine(IntPtr pointer, EndpointNotifications callback)
        => Quarantined.Add(new(pointer, callback));
}

[ComVisible(true), ClassInterface(ClassInterfaceType.None)]
public sealed class EndpointNotifications : IMMNotificationClient
{
    private readonly string endpointId;
    private readonly bool followsDefault;
    private int change;
    private long timestamp;
    internal EndpointChange Change => (EndpointChange)Volatile.Read(ref change);
    internal long Timestamp => Interlocked.Read(ref timestamp);
    internal EndpointNotifications(string endpointId, bool followsDefault)
    { this.endpointId = endpointId; this.followsDefault = followsDefault; }

    private void Mark(EndpointChange reason)
    {
        Interlocked.CompareExchange(ref timestamp, Stopwatch.GetTimestamp(), 0);
        Interlocked.CompareExchange(ref change, (int)reason, 0);
    }
    public int OnDeviceStateChanged(string deviceId, uint state)
    {
        if (state != 1 && string.Equals(deviceId, endpointId, StringComparison.OrdinalIgnoreCase))
            Mark(EndpointChange.OutputUnavailable);
        return 0;
    }
    public int OnDeviceAdded(string deviceId) => 0;
    public int OnDeviceRemoved(string deviceId)
    {
        if (string.Equals(deviceId, endpointId, StringComparison.OrdinalIgnoreCase))
            Mark(EndpointChange.OutputUnavailable);
        return 0;
    }
    public int OnDefaultDeviceChanged(int flow, int role, string? deviceId)
    {
        if (followsDefault && flow == 0 && role == 1
            && !string.Equals(deviceId, endpointId, StringComparison.OrdinalIgnoreCase))
            Mark(EndpointChange.DefaultOutputChanged);
        return 0;
    }
    public int OnPropertyValueChanged(string deviceId, PropertyKey key) => 0;
}
