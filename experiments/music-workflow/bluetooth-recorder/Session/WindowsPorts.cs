using RootSound.BluetoothRecorder.Receiver;
using RootSound.BluetoothRecorder.Recording;

namespace RootSound.BluetoothRecorder.Session;

public sealed class WindowsReceiverPort(BluetoothReceiverService service) : IReceiverPort, IDisposable
{
    public bool IsConnected => service.Snapshot.CanRecord;
    public string? DeviceName => service.Snapshot.ConnectedDeviceName;
    public event EventHandler? Changed;
    public void Attach() => service.SnapshotChanged += Forward;
    private void Forward(object? sender, ReceiverSnapshot snapshot) => Changed?.Invoke(this, EventArgs.Empty);
    public async Task ConnectAsync(string? selectedId, CancellationToken token)
    {
        if (!service.Snapshot.IsEnabled) await service.StartAsync(token);
        if (selectedId is not null) await service.ConnectAsync(selectedId, token);
        else if (service.Snapshot.SelectedDeviceId is not null && !service.Snapshot.CanRecord)
            await service.ReconnectAsync(token);
        if (service.Snapshot.Error is { } error) throw new InvalidOperationException(error);
    }
    public Task StopAsync() => service.StopAsync();
    public void Dispose() => service.SnapshotChanged -= Forward;
}

public sealed class WindowsCapturePort(OutputLoopbackRecorder recorder, BluetoothReceiverService receiver) : ICapturePort, IDisposable
{
    public CaptureProgress Progress
    {
        get
        {
            var value = recorder.Snapshot;
            return new(value.IsRecording, value.Duration, value.Peak, value.DataBytes, value.EndpointName, value.Error);
        }
    }
    public event EventHandler? Changed;
    public void Attach() => recorder.Changed += Forward;
    private void Forward(RecordingSnapshot value) => Changed?.Invoke(this, EventArgs.Empty);
    public Task StartAsync(string path, CancellationToken token) => ConnectedCaptureStart.StartAsync(
        () => { var current = receiver.Snapshot; return current.CanRecord ? current.ConnectedDeviceId : null; },
        cancellation => recorder.StartAsync(path, cancellation),
        () => recorder.StopAsync(), token);
    public async Task<CaptureTake?> StopAsync()
    {
        var result = await recorder.StopAsync();
        if (result is null) return null;
        string? warning = result.Error;
        if (result.Discontinuities > 0 || result.TimestampErrors > 0)
        {
            var message = $"设备报告 {result.Discontinuities} 次音频中断、{result.TimestampErrors} 次时间戳异常；导出后请试听检查。";
            warning = warning is null ? message : warning + Environment.NewLine + message;
        }
        return new(result.Path, result.Duration, recorder.Snapshot.DataBytes, result.EndpointName, warning);
    }
    public void Dispose() => recorder.Changed -= Forward;
}
