using System.Collections.ObjectModel;

namespace RootSound.BluetoothRecorder.Receiver;

/// <summary>
/// An inert-at-construction Bluetooth audio receiver. Events may arrive on a worker thread.
/// A paired Bluetooth device is never treated as an open audio connection.
/// </summary>
public sealed class BluetoothReceiverService : IAsyncDisposable
{
    private readonly IReceiverBackend _backend;
    private readonly SemaphoreSlim _operations = new(1, 1);
    private readonly object _signalSync = new();
    private readonly Dictionary<string, ReceiverDevice> _devices = new(StringComparer.Ordinal);
    private ReceiverSnapshot _snapshot = ReceiverSnapshot.Initial;
    private SessionSignal? _signal;
    private SessionSignal? _resourceSignal;
    private IReceiverDiscovery? _discovery;
    private IReceiverConnection? _connection;
    private string? _connectionDeviceId;
    private string? _selectedDeviceId;
    private string? _autoAttemptedId;
    private bool _enumerationCompleted;
    private bool _connecting;
    private bool _enabled;
    private bool _disposed;
    private ReceiverAvailability _availability = ReceiverAvailability.NotChecked;
    private long _generation;
    private long _revision;

    public BluetoothReceiverService() : this(new WindowsReceiverBackend()) { }

    internal BluetoothReceiverService(IReceiverBackend backend) => _backend = backend;

    public ReceiverSnapshot Snapshot => Volatile.Read(ref _snapshot);
    public event EventHandler<ReceiverSnapshot>? SnapshotChanged;

    /// <summary>Enable discovery. One discovered source is opened automatically; several require selection.</summary>
    public async Task StartAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var signal = BeginSession();
        using var operation = CancellationTokenSource.CreateLinkedTokenSource(signal.Token, cancellationToken);
        var acquired = false;
        try
        {
            await _operations.WaitAsync(operation.Token).ConfigureAwait(false);
            acquired = true;
            EnsureCurrent(signal);
            CleanupResources();
            _resourceSignal = signal;
            _enabled = true;
            _availability = ReceiverAvailability.NotChecked;
            PublishState(signal, "正在检查蓝牙…");

            var availability = await _backend.CheckAvailabilityAsync(operation.Token).ConfigureAwait(false);
            EnsureCurrent(signal);
            _availability = availability.Availability;
            if (_availability != ReceiverAvailability.Available)
            {
                _enabled = false;
                PublishState(signal, availability.Message);
                return;
            }

            var discovery = _backend.CreateDiscovery();
            _discovery = discovery;
            discovery.Added += (_, device) => QueueEvent(signal, () => HandleDeviceAsync(signal, device));
            discovery.Updated += (_, device) => QueueEvent(signal, () => HandleDeviceAsync(signal, device));
            discovery.Removed += (_, id) => QueueEvent(signal, () => HandleRemovedAsync(signal, id));
            discovery.EnumerationCompleted += (_, _) => QueueEvent(signal, () => HandleEnumerationAsync(signal));
            discovery.Stopped += (_, error) => QueueEvent(signal, () => HandleStoppedAsync(signal, discovery, error));
            PublishState(signal, availability.Message);
            discovery.Start();
        }
        catch (OperationCanceledException)
        {
            if (IsCurrent(signal))
            {
                signal.Cancel();
                if (!acquired)
                {
                    await _operations.WaitAsync().ConfigureAwait(false);
                    acquired = true;
                }
                if (IsGenerationCurrent(signal.Generation))
                {
                    CleanupResources();
                    PublishState(signal, "连接已取消");
                }
            }
            throw;
        }
        catch (Exception error)
        {
            if (acquired && IsCurrent(signal))
            {
                CleanupResources();
                _availability = ReceiverAvailability.Failed;
                PublishState(signal, "蓝牙接收暂时不可用", Describe(error));
            }
        }
        finally
        {
            if (acquired) _operations.Release();
            if (!ReferenceEquals(_resourceSignal, signal)) signal.Dispose();
        }
    }

    /// <summary>Explicit retry or selection. No automatic loop forces a disconnected phone to reconnect.</summary>
    public async Task ConnectAsync(string deviceId, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(deviceId);
        SessionSignal signal;
        lock (_signalSync)
            signal = _signal ?? throw new InvalidOperationException("请先点击连接，开始查找手机。");
        using var operation = CancellationTokenSource.CreateLinkedTokenSource(signal.Token, cancellationToken);
        await _operations.WaitAsync(operation.Token).ConfigureAwait(false);
        try
        {
            EnsureCurrent(signal);
            if (!_enabled || _availability != ReceiverAvailability.Available)
                throw new InvalidOperationException("蓝牙接收尚未启用，请重新点击连接。");
            if (!_devices.ContainsKey(deviceId))
                throw new InvalidOperationException("这个设备已经离开列表，请重新选择手机。");
            await ConnectCoreAsync(signal, deviceId, operation.Token).ConfigureAwait(false);
        }
        finally { _operations.Release(); }
    }

    public Task ReconnectAsync(CancellationToken cancellationToken = default)
    {
        var snapshot = Snapshot;
        return snapshot.IsEnabled && snapshot.SelectedDeviceId is { } selected
            ? ConnectAsync(selected, cancellationToken)
            : StartAsync(cancellationToken);
    }

    /// <summary>Invalidate pending operations immediately, then finish releasing this service's resources.</summary>
    public async Task StopAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        SessionSignal? previous;
        long generation;
        lock (_signalSync)
        {
            previous = _signal;
            _signal = null;
            generation = ++_generation;
        }
        previous?.Cancel();
        Publish(Snapshot with
        {
            IsEnabled = false, IsDiscovering = false, IsConnecting = false,
            ConnectedDeviceId = null, ConnectedDeviceName = null, Status = "尚未连接", Error = null
        }, generation);

        // Once stop is signalled, cleanup is mandatory even if the caller cancels its UI action.
        await _operations.WaitAsync().ConfigureAwait(false);
        try
        {
            if (IsGenerationCurrent(generation))
            {
                CleanupResources();
                PublishState(generation, "尚未连接");
            }
        }
        finally
        {
            _operations.Release();
            if (!ReferenceEquals(_resourceSignal, previous)) previous?.Dispose();
        }
    }

    private SessionSignal BeginSession()
    {
        SessionSignal signal;
        SessionSignal? previous;
        lock (_signalSync)
        {
            ObjectDisposedException.ThrowIf(_disposed, this);
            previous = _signal;
            signal = new SessionSignal(++_generation);
            _signal = signal;
        }
        previous?.Cancel();
        return signal;
    }

    private async Task ConnectCoreAsync(SessionSignal signal, string deviceId, CancellationToken cancellationToken)
    {
        EnsureCurrent(signal);
        ReleaseConnection();
        _selectedDeviceId = deviceId;
        _autoAttemptedId = deviceId;
        _connecting = true;
        PublishState(signal, "正在建立手机音频连接…");
        try
        {
            var connection = _backend.CreateConnection(deviceId);
            if (connection is null)
            {
                PublishState(signal, "这个设备暂不支持发送媒体音频", "请检查手机蓝牙设置中的媒体音频选项，然后重试。");
                return;
            }
            _connection = connection;
            _connectionDeviceId = deviceId;
            connection.StateChanged += (_, _) => QueueEvent(signal, () => HandleConnectionStateAsync(signal, connection));
            await connection.StartAsync(cancellationToken).ConfigureAwait(false);
            EnsureCurrent(signal);
            var result = await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
            EnsureCurrent(signal);
            _connecting = false;
            PublishState(signal, connection.IsOpened ? "手机音频已连接" : "等待手机连接音频…",
                connection.IsOpened || result.Success ? null : result.Error);
        }
        catch (OperationCanceledException)
        {
            if (IsCurrent(signal))
            {
                ReleaseConnection();
                _connecting = false;
                PublishState(signal, "连接已取消");
            }
            throw;
        }
        catch (Exception error)
        {
            if (IsCurrent(signal))
            {
                ReleaseConnection();
                PublishState(signal, "无法建立手机音频连接", Describe(error));
            }
        }
        finally
        {
            _connecting = false;
            if (IsCurrent(signal)) PublishState(signal, Snapshot.Status, Snapshot.Error);
        }
    }

    private async Task HandleDeviceAsync(SessionSignal signal, ReceiverDevice device)
    {
        _devices[device.Id] = device;
        PublishWaitingState(signal);
        await MaybeAutoConnectAsync(signal).ConfigureAwait(false);
    }

    private async Task HandleEnumerationAsync(SessionSignal signal)
    {
        _enumerationCompleted = true;
        PublishWaitingState(signal);
        await MaybeAutoConnectAsync(signal).ConfigureAwait(false);
    }

    private Task HandleRemovedAsync(SessionSignal signal, string deviceId)
    {
        _devices.Remove(deviceId);
        if (_connectionDeviceId == deviceId) ReleaseConnection();
        if (_selectedDeviceId == deviceId) _selectedDeviceId = null;
        if (_autoAttemptedId == deviceId) _autoAttemptedId = null;
        PublishWaitingState(signal);
        return Task.CompletedTask;
    }

    private Task HandleConnectionStateAsync(SessionSignal signal, IReceiverConnection connection)
    {
        if (ReferenceEquals(_connection, connection))
            PublishState(signal, connection.IsOpened ? "手机音频已连接" : "手机音频已断开，等待重新连接…");
        return Task.CompletedTask;
    }

    private Task HandleStoppedAsync(SessionSignal signal, IReceiverDiscovery discovery, string? error)
    {
        if (!ReferenceEquals(_discovery, discovery)) return Task.CompletedTask;
        ReleaseConnection();
        _discovery = null;
        discovery.Dispose();
        _enabled = false;
        _availability = ReceiverAvailability.Failed;
        PublishState(signal, "蓝牙设备检测已停止", error ?? "请重新点击连接。");
        return Task.CompletedTask;
    }

    private async Task MaybeAutoConnectAsync(SessionSignal signal)
    {
        if (!_enumerationCompleted || _devices.Count != 1 || _connection is not null) return;
        var device = _devices.Values.Single();
        if (_autoAttemptedId == device.Id) return;
        await ConnectCoreAsync(signal, device.Id, signal.Token).ConfigureAwait(false);
    }

    private void PublishWaitingState(SessionSignal signal)
    {
        if (_connection?.IsOpened == true)
            PublishState(signal, "手机音频已连接");
        else if (_connecting)
            PublishState(signal, "正在建立手机音频连接…");
        else
            PublishState(signal, !_enumerationCompleted ? "正在查找已配对的手机…" : _devices.Count switch
            {
                0 => "请将手机与这台电脑配对，完成后会自动继续。",
                1 => "等待手机连接音频…",
                _ => "请选择用于播放音乐的手机，然后点击连接。"
            });
    }

    private void QueueEvent(SessionSignal signal, Func<Task> action) => _ = ProcessEventAsync(signal, action);

    private async Task ProcessEventAsync(SessionSignal signal, Func<Task> action)
    {
        var acquired = false;
        try
        {
            await _operations.WaitAsync(signal.Token).ConfigureAwait(false);
            acquired = true;
            if (!IsCurrent(signal)) return;
            await action().ConfigureAwait(false);
        }
        catch (OperationCanceledException) { }
        catch (ObjectDisposedException) { }
        catch (Exception error)
        {
            if (IsCurrent(signal))
            {
                ReleaseConnection();
                PublishState(signal, "蓝牙接收遇到问题，请重试连接", Describe(error));
            }
        }
        finally { if (acquired) _operations.Release(); }
    }

    private void PublishState(SessionSignal signal, string status, string? error = null) => PublishState(signal.Generation, status, error);

    private void PublishState(long generation, string status, string? error = null)
    {
        var opened = _enabled && _connection?.IsOpened == true;
        var connectedId = opened ? _connectionDeviceId : null;
        var name = connectedId is not null && _devices.TryGetValue(connectedId, out var device) ? device.Name : null;
        var devices = _devices.Values.OrderBy(device => device.Name, StringComparer.CurrentCultureIgnoreCase)
            .ThenBy(device => device.Id, StringComparer.Ordinal).ToArray();
        Publish(new(0, _availability, _enabled, _discovery is not null && !_enumerationCompleted,
            _connecting, _enumerationCompleted, new ReadOnlyCollection<ReceiverDevice>(devices),
            _selectedDeviceId, connectedId, name, status, error), generation);
    }

    private void Publish(ReceiverSnapshot snapshot, long generation)
    {
        lock (_signalSync)
        {
            if (_generation != generation) return;
            snapshot = snapshot with { Revision = ++_revision };
            Volatile.Write(ref _snapshot, snapshot);
        }
        // Consumer failures must not escape into Windows' native event callbacks.
        if (SnapshotChanged is { } handlers)
            foreach (EventHandler<ReceiverSnapshot> handler in handlers.GetInvocationList())
                try { handler(this, snapshot); } catch { }
    }

    private bool IsCurrent(SessionSignal signal)
    {
        lock (_signalSync)
            return ReferenceEquals(_signal, signal) && _generation == signal.Generation && !signal.Token.IsCancellationRequested;
    }

    private bool IsGenerationCurrent(long generation)
    {
        lock (_signalSync) return _generation == generation;
    }

    private void EnsureCurrent(SessionSignal signal)
    {
        signal.Token.ThrowIfCancellationRequested();
        if (!IsCurrent(signal)) throw new OperationCanceledException(signal.Token);
    }

    private void ReleaseConnection()
    {
        var connection = _connection;
        _connection = null;
        _connectionDeviceId = null;
        if (connection is not null)
            try { connection.Dispose(); } catch { }
    }

    private void CleanupResources()
    {
        ReleaseConnection();
        var discovery = _discovery;
        _discovery = null;
        if (discovery is not null)
            try { discovery.Dispose(); } catch { }
        _devices.Clear();
        _selectedDeviceId = null;
        _autoAttemptedId = null;
        _enumerationCompleted = false;
        _connecting = false;
        _enabled = false;
        _resourceSignal?.Cancel();
        _resourceSignal?.Dispose();
        _resourceSignal = null;
    }

    private static string Describe(Exception error) => $"{error.Message}（0x{error.HResult:X8}）";

    public async ValueTask DisposeAsync()
    {
        lock (_signalSync)
        {
            if (_disposed) return;
            _disposed = true;
        }
        await StopAsync().ConfigureAwait(false);
        // Keep the semaphore alive for already-queued, cancelled native callbacks.
        GC.SuppressFinalize(this);
    }

    private sealed class SessionSignal : IDisposable
    {
        private readonly CancellationTokenSource _cancellation = new();
        public SessionSignal(long generation)
        {
            Generation = generation;
            Token = _cancellation.Token;
        }
        public long Generation { get; }
        public CancellationToken Token { get; }
        public void Cancel() { try { _cancellation.Cancel(); } catch (ObjectDisposedException) { } }
        public void Dispose() => _cancellation.Dispose();
    }
}
