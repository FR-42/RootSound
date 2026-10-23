using System.Runtime.InteropServices;
using Windows.Devices.Bluetooth;
using Windows.Devices.Enumeration;
using Windows.Devices.Radios;
using Windows.Foundation.Metadata;
using Windows.Media.Audio;

namespace RootSound.BluetoothRecorder.Receiver;

/// <summary>Windows owns Bluetooth negotiation, decoding, and playback routing.</summary>
internal sealed class WindowsReceiverBackend : IReceiverBackend
{
    public async Task<ReceiverAvailabilityResult> CheckAvailabilityAsync(CancellationToken cancellationToken)
    {
        if (!OperatingSystem.IsWindowsVersionAtLeast(10, 0, 19041) ||
            !ApiInformation.IsTypePresent("Windows.Media.Audio.AudioPlaybackConnection"))
            return new(ReceiverAvailability.UnsupportedWindows, "需要 Windows 10 2004 或更新版本。");

        try
        {
            var adapter = await BluetoothAdapter.GetDefaultAsync().AsTask(cancellationToken).ConfigureAwait(false);
            if (adapter is null || !adapter.IsClassicSupported)
                return new(ReceiverAvailability.NoBluetoothAdapter, "没有可用的经典蓝牙适配器。");

            // Radio inspection is advisory. Desktop architecture/capability restrictions on
            // GetRadioAsync are not evidence that the separate A2DP playback API is unusable.
            // Unknown state also does not establish that the user switched Bluetooth off.
            var radio = await adapter.GetRadioAsync().AsTask(cancellationToken).ConfigureAwait(false);
            if (radio is not null && radio.State is RadioState.Off or RadioState.Disabled)
                return new(ReceiverAvailability.BluetoothOff, "请先打开电脑蓝牙，然后重试连接。");
        }
        catch (Exception error) when (error is UnauthorizedAccessException or COMException or NotSupportedException)
        {
            cancellationToken.ThrowIfCancellationRequested();
            // Follow Microsoft's receiver flow directly when optional adapter/radio
            // diagnostics are unavailable. Discovery and Start/Open report real failures.
        }

        return new(ReceiverAvailability.Available, "正在查找已配对的手机…");
    }

    public IReceiverDiscovery CreateDiscovery() => new WindowsReceiverDiscovery();

    public IReceiverConnection? CreateConnection(string deviceId)
    {
        var native = AudioPlaybackConnection.TryCreateFromId(deviceId);
        return native is null ? null : new WindowsReceiverConnection(native);
    }
}

internal sealed class WindowsReceiverConnection : IReceiverConnection
{
    private AudioPlaybackConnection? _native;

    public WindowsReceiverConnection(AudioPlaybackConnection native)
    {
        _native = native;
        native.StateChanged += OnStateChanged;
    }

    public event EventHandler? StateChanged;

    public bool IsOpened
    {
        get
        {
            var native = _native;
            return native is not null && native.State == AudioPlaybackConnectionState.Opened;
        }
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var native = _native ?? throw new ObjectDisposedException(nameof(WindowsReceiverConnection));
        await native.StartAsync().AsTask(cancellationToken).ConfigureAwait(false);
    }

    public async Task<ReceiverOpenResult> OpenAsync(CancellationToken cancellationToken)
    {
        var native = _native ?? throw new ObjectDisposedException(nameof(WindowsReceiverConnection));
        var result = await native.OpenAsync().AsTask(cancellationToken).ConfigureAwait(false);
        return result.Status switch
        {
            AudioPlaybackConnectionOpenResultStatus.Success => new(true),
            AudioPlaybackConnectionOpenResultStatus.RequestTimedOut => new(false, "手机尚未建立音频连接。请在手机蓝牙设置中连接这台电脑，或重试连接。"),
            AudioPlaybackConnectionOpenResultStatus.DeniedBySystem => new(false, "Windows 拒绝了音频连接。请检查蓝牙状态，并关闭其他蓝牙接收工具后重试。"),
            _ => new(false, result.ExtendedError is { } error
                ? $"音频连接失败：{error.Message}（0x{error.HResult:X8}）。"
                : "音频连接失败。请检查手机的媒体音频连接并重试。")
        };
    }

    private void OnStateChanged(AudioPlaybackConnection sender, object args) => StateChanged?.Invoke(this, EventArgs.Empty);

    public void Dispose()
    {
        var native = Interlocked.Exchange(ref _native, null);
        if (native is null) return;
        native.StateChanged -= OnStateChanged;
        native.Dispose();
    }
}

internal sealed class WindowsReceiverDiscovery : IReceiverDiscovery
{
    private const string ConnectedProperty = "System.Devices.Aep.IsConnected";
    private readonly object _sync = new();
    private readonly Dictionary<string, DeviceInformation> _devices = new(StringComparer.Ordinal);
    private DeviceWatcher? _watcher;

    public WindowsReceiverDiscovery()
    {
        _watcher = DeviceInformation.CreateWatcher(AudioPlaybackConnection.GetDeviceSelector(), [ConnectedProperty]);
        _watcher.Added += OnAdded;
        _watcher.Updated += OnUpdated;
        _watcher.Removed += OnRemoved;
        _watcher.EnumerationCompleted += OnEnumerationCompleted;
        _watcher.Stopped += OnStopped;
    }

    public event EventHandler<ReceiverDevice>? Added;
    public event EventHandler<ReceiverDevice>? Updated;
    public event EventHandler<string>? Removed;
    public event EventHandler? EnumerationCompleted;
    public event EventHandler<string?>? Stopped;

    public void Start() => (_watcher ?? throw new ObjectDisposedException(nameof(WindowsReceiverDiscovery))).Start();

    private void OnAdded(DeviceWatcher sender, DeviceInformation information)
    {
        ReceiverDevice device;
        lock (_sync)
        {
            if (!ReferenceEquals(sender, _watcher)) return;
            _devices[information.Id] = information;
            device = Snapshot(information);
        }
        Added?.Invoke(this, device);
    }

    private void OnUpdated(DeviceWatcher sender, DeviceInformationUpdate update)
    {
        ReceiverDevice device;
        lock (_sync)
        {
            if (!ReferenceEquals(sender, _watcher) || !_devices.TryGetValue(update.Id, out var information)) return;
            information.Update(update);
            device = Snapshot(information);
        }
        Updated?.Invoke(this, device);
    }

    private void OnRemoved(DeviceWatcher sender, DeviceInformationUpdate update)
    {
        lock (_sync)
        {
            if (!ReferenceEquals(sender, _watcher)) return;
            _devices.Remove(update.Id);
        }
        Removed?.Invoke(this, update.Id);
    }

    private void OnEnumerationCompleted(DeviceWatcher sender, object args)
    {
        lock (_sync) if (!ReferenceEquals(sender, _watcher)) return;
        EnumerationCompleted?.Invoke(this, EventArgs.Empty);
    }

    private void OnStopped(DeviceWatcher sender, object args)
    {
        lock (_sync) if (!ReferenceEquals(sender, _watcher)) return;
        Stopped?.Invoke(this, sender.Status == DeviceWatcherStatus.Aborted
            ? "蓝牙设备检测意外停止。请检查电脑蓝牙，然后重试连接。" : null);
    }

    private static ReceiverDevice Snapshot(DeviceInformation information) => new(
        information.Id,
        string.IsNullOrWhiteSpace(information.Name) ? "未命名蓝牙设备" : information.Name,
        information.Properties.TryGetValue(ConnectedProperty, out var connected) && connected is true);

    public void Dispose()
    {
        DeviceWatcher? watcher;
        lock (_sync)
        {
            watcher = _watcher;
            _watcher = null;
            _devices.Clear();
        }
        if (watcher is null) return;
        watcher.Added -= OnAdded;
        watcher.Updated -= OnUpdated;
        watcher.Removed -= OnRemoved;
        watcher.EnumerationCompleted -= OnEnumerationCompleted;
        watcher.Stopped -= OnStopped;
        if (watcher.Status is DeviceWatcherStatus.Started or DeviceWatcherStatus.EnumerationCompleted)
            watcher.Stop();
    }
}
