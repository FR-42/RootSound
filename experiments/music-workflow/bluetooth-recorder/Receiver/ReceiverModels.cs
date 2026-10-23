using System.Collections.ObjectModel;

namespace RootSound.BluetoothRecorder.Receiver;

public enum ReceiverAvailability
{
    NotChecked,
    Available,
    UnsupportedWindows,
    NoBluetoothAdapter,
    BluetoothOff,
    Failed
}

/// <summary>Discovery information. Bluetooth connection is only a hint, never permission to record.</summary>
public sealed record ReceiverDevice(string Id, string Name, bool IsBluetoothConnected);

public sealed record ReceiverSnapshot(
    long Revision,
    ReceiverAvailability Availability,
    bool IsEnabled,
    bool IsDiscovering,
    bool IsConnecting,
    bool EnumerationCompleted,
    IReadOnlyList<ReceiverDevice> Devices,
    string? SelectedDeviceId,
    string? ConnectedDeviceId,
    string? ConnectedDeviceName,
    string Status,
    string? Error)
{
    public bool CanRecord => IsEnabled && ConnectedDeviceId is not null;

    public static ReceiverSnapshot Initial { get; } = new(
        0, ReceiverAvailability.NotChecked, false, false, false, false,
        new ReadOnlyCollection<ReceiverDevice>(Array.Empty<ReceiverDevice>()),
        null, null, null, "尚未连接", null);
}

internal sealed record ReceiverAvailabilityResult(ReceiverAvailability Availability, string Message);
internal sealed record ReceiverOpenResult(bool Success, string? Error = null);

internal interface IReceiverBackend
{
    Task<ReceiverAvailabilityResult> CheckAvailabilityAsync(CancellationToken cancellationToken);
    IReceiverDiscovery CreateDiscovery();
    IReceiverConnection? CreateConnection(string deviceId);
}

internal interface IReceiverDiscovery : IDisposable
{
    event EventHandler<ReceiverDevice>? Added;
    event EventHandler<ReceiverDevice>? Updated;
    event EventHandler<string>? Removed;
    event EventHandler? EnumerationCompleted;
    event EventHandler<string?>? Stopped;
    void Start();
}

internal interface IReceiverConnection : IDisposable
{
    bool IsOpened { get; }
    event EventHandler? StateChanged;
    Task StartAsync(CancellationToken cancellationToken);
    Task<ReceiverOpenResult> OpenAsync(CancellationToken cancellationToken);
}
