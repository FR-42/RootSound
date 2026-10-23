namespace RootSound.BluetoothRecorder.Session;

// Take commands share one gate and cancellation epoch. The Bluetooth receiver
// belongs to the session: restarting a take never cancels or stops it.
public sealed class RecorderSession : IAsyncDisposable
{
    private readonly IReceiverPort receiver;
    private readonly ICapturePort capture;
    private readonly string takeDirectory;
    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly CancellationTokenSource lifetime = new();
    private CancellationTokenSource epoch = new();
    private TakeFiles? files;
    private CaptureTake? take;
    private SessionPhase phase;
    private string status = "连接手机，开始这次录音。";
    private string? error, lastExport;
    private bool restarting, closed;
    private int userCommand;
    private Task? resetTask;
    private Task? connectionTask;
    private int connectionCommand;
    private readonly object resetLock = new();
    public event EventHandler? Changed;
    public SessionSnapshot Snapshot
    {
        get
        {
            var p = capture.Progress;
            bool live = phase is SessionPhase.Recording or SessionPhase.Starting or SessionPhase.Stopping;
            return new(restarting ? SessionPhase.Restarting : phase, receiver.IsConnected, receiver.DeviceName,
                live ? p.Duration : take?.Duration ?? TimeSpan.Zero, live ? p.Peak : 0,
                live ? p.DataBytes : take?.DataBytes ?? 0, live ? p.EndpointName : take?.EndpointName,
                restarting ? "正在重新开始…" : status, error, lastExport, files?.ExportCount ?? 0);
        }
    }
    public RecorderSession(IReceiverPort receiver, ICapturePort capture, string takeDirectory)
    {
        this.receiver = receiver; this.capture = capture; this.takeDirectory = takeDirectory;
        receiver.Changed += ReceiverChanged;
        capture.Changed += CaptureChanged;
    }
    public Task ConnectAsync(string? selectedId = null)
    {
        lock (resetLock)
        {
            if (closed || restarting || !Snapshot.CanConnect || userCommand != 0 || connectionCommand != 0)
                return Task.CompletedTask;
            connectionCommand = 1;
            connectionTask = ConnectCore(selectedId);
            return connectionTask;
        }
    }
    private async Task ConnectCore(string? selectedId)
    {
        try
        {
            await gate.WaitAsync();
            try
            {
                if (closed) return;
                error = null;
                Set(SessionPhase.Connecting, "正在连接手机…");
            }
            finally { gate.Release(); }
            // Do not hold the take gate while waiting for the phone. Restart
            // must still be able to clear a take without cancelling this wait.
            await receiver.ConnectAsync(selectedId, lifetime.Token);
        }
        catch (OperationCanceledException) when (lifetime.IsCancellationRequested) { }
        catch (Exception ex)
        {
            await gate.WaitAsync();
            try { if (!closed) error = ex.Message; }
            finally { gate.Release(); }
        }
        finally
        {
            await gate.WaitAsync();
            try
            {
                connectionCommand = 0;
                if (!closed && phase is SessionPhase.Connecting or SessionPhase.Idle or SessionPhase.Ready)
                {
                    phase = take is not null ? SessionPhase.Recorded : ConnectionPhase();
                    status = error is not null ? "暂时未能连接，请查看提示后重试。"
                        : receiver.IsConnected ? "已连接，可以开始录音。" : "等待手机连接。首次使用请先配对。";
                }
            }
            finally { gate.Release(); Notify(); }
        }
    }
    public Task StartAsync() => Command(async token =>
    {
        if (!Snapshot.CanRecord) return;
        files ??= new TakeFiles(takeDirectory);
        Set(SessionPhase.Starting, "正在准备录音…");
        try
        {
            await capture.StartAsync(files.RecordingPath, token);
            token.ThrowIfCancellationRequested();
            if (!receiver.IsConnected)
            {
                take = await capture.StopAsync();
                Set(SessionPhase.Recorded, "手机已断开，已保留录音。");
                return;
            }
            Set(SessionPhase.Recording, "正在录音");
            if (!capture.Progress.IsRecording)
                await FinishTake("录音已停止，已保留录到的部分。");
        }
        catch
        {
            var stopped = await capture.StopAsync();
            take = IsCurrentTake(stopped) ? stopped : null;
            if (take is not { DataBytes: > 0 }) { files.Dispose(); files = null; take = null; }
            phase = take is not null ? SessionPhase.Recorded : receiver.IsConnected ? SessionPhase.Ready : SessionPhase.Idle;
            throw;
        }
    });
    public Task StopAsync() => Command(async _ =>
    {
        if (phase is not (SessionPhase.Recording or SessionPhase.Starting)) return;
        Set(SessionPhase.Stopping, "正在结束录音…");
        await FinishTake("录音已结束，可以导出。");
    });
    public Task ExportAsync(string destination, bool overwrite = false) => Command(async token =>
    {
        if (!Snapshot.CanExport || files is null) return;
        Set(SessionPhase.Exporting, "正在导出…");
        try
        {
            lastExport = await files.ExportAsync(destination, overwrite, token);
            status = "已导出。可以重新开始下一次录音。";
        }
        finally { phase = SessionPhase.Recorded; }
    });

    public Task RestartAsync()
    {
        lock (resetLock)
        {
            if (closed) return Task.CompletedTask;
            if (restarting) return resetTask ?? Task.CompletedTask;
            if (resetTask is { IsCompleted: false }) return resetTask;
            restarting = true;
            epoch.Cancel();
            Notify();
            resetTask = ResetCore();
            return resetTask;
        }
    }
    private async Task ResetCore()
    {
        await gate.WaitAsync();
        try
        {
            var stopped = await capture.StopAsync();
            if (IsCurrentTake(stopped)) take = stopped;
            files?.Dispose(); files = null; take = null; lastExport = null;
            phase = ConnectionPhase();
            status = receiver.IsConnected ? "已重新开始，可以再次录音。"
                : connectionCommand != 0 ? "已清空录音，继续等待手机连接。" : "已重新开始。连接手机，开始新的录音。";
            error = null;
        }
        catch (Exception ex)
        {
            error = ex.Message; status = "重新开始未完成，请重试。";
            if (!IsCurrentTake(take)) take = null;
            phase = take is { DataBytes: > 0 } ? SessionPhase.Recorded
                : capture.Progress.IsRecording ? SessionPhase.Recording : ConnectionPhase();
        }
        finally
        {
            epoch.Dispose(); epoch = new(); restarting = false;
            gate.Release(); Notify();
        }
    }
    private async Task Command(Func<CancellationToken, Task> action)
    {
        if (closed || restarting || Interlocked.CompareExchange(ref userCommand, 1, 0) != 0) return;
        await gate.WaitAsync();
        try
        {
            if (closed || restarting) return;
            error = null;
            await action(epoch.Token);
        }
        catch (OperationCanceledException) when (epoch.IsCancellationRequested) { }
        catch (Exception ex) { error = ex.Message; status = "暂时未能完成，请查看提示后重试。"; }
        finally { gate.Release(); Interlocked.Exchange(ref userCommand, 0); Notify(); }
    }
    private async Task FinishTake(string message)
    {
        take = await capture.StopAsync();
        phase = SessionPhase.Recorded;
        status = message;
        error = take?.Error;
        if (take is not { DataBytes: > 0 })
        {
            status = "没有录到音频，请重新开始。";
            error ??= "请确认手机已经播放音乐，电脑声音输出正常。";
        }
    }
    private void ReceiverChanged(object? sender, EventArgs e)
    {
        if (closed || restarting) return;
        _ = ReconcileAsync();
    }
    private void CaptureChanged(object? sender, EventArgs e)
    {
        if (closed || restarting) return;
        if (phase == SessionPhase.Recording && !capture.Progress.IsRecording)
            _ = ReconcileAsync();
        Notify();
    }
    private async Task ReconcileAsync()
    {
        await gate.WaitAsync();
        try
        {
            if (closed || restarting) return;
            if (phase == SessionPhase.Recording && (!receiver.IsConnected || !capture.Progress.IsRecording))
            {
                string message = !receiver.IsConnected ? "手机已断开，已保留录音。" : "录音已停止，已保留录到的部分。";
                Set(SessionPhase.Stopping, "正在保留录音…");
                await FinishTake(message);
            }
            else if (phase is SessionPhase.Idle or SessionPhase.Ready)
            {
                phase = receiver.IsConnected ? SessionPhase.Ready : SessionPhase.Idle;
                status = receiver.IsConnected ? "已连接，可以开始录音。" : "等待手机连接。";
            }
        }
        catch (Exception ex) { error = ex.Message; status = "未能结束录音，请重试。"; }
        finally { gate.Release(); Notify(); }
    }
    private void Set(SessionPhase next, string message) { phase = next; status = message; Notify(); }
    private SessionPhase ConnectionPhase() => receiver.IsConnected ? SessionPhase.Ready
        : connectionCommand != 0 ? SessionPhase.Connecting : SessionPhase.Idle;
    private bool IsCurrentTake(CaptureTake? value) => files is not null && value is not null
        && string.Equals(value.Path, files.RecordingPath, StringComparison.OrdinalIgnoreCase)
        && File.Exists(files.RecordingPath);
    private void Notify() => Changed?.Invoke(this, EventArgs.Empty);
    public async ValueTask DisposeAsync()
    {
        if (closed) return;
        closed = true;
        lifetime.Cancel();
        epoch.Cancel();
        if (resetTask is { IsCompleted: false }) await resetTask;
        if (connectionTask is { IsCompleted: false }) await connectionTask;
        await gate.WaitAsync();
        try
        {
            receiver.Changed -= ReceiverChanged; capture.Changed -= CaptureChanged;
            await capture.StopAsync(); await receiver.StopAsync();
            files?.Dispose(); files = null;
            phase = SessionPhase.Closed;
        }
        finally { gate.Release(); epoch.Dispose(); lifetime.Dispose(); }
    }
}
