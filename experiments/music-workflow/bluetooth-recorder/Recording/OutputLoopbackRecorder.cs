using System.Diagnostics;
using System.Runtime.InteropServices;

namespace RootSound.BluetoothRecorder.Recording;

public enum RecordingStatus { Idle, Starting, Recording, Stopped, Failed }
public sealed record RecordingSnapshot(
    RecordingStatus Status, TimeSpan Duration, float Peak, long DataBytes,
    int Discontinuities, int TimestampErrors, string? Error, string? Path, string? EndpointName)
{
    public bool IsRecording => Status == RecordingStatus.Recording;
}
public sealed record RecordingResult(
    string Path, TimeSpan Duration, WaveFormat Format, string EndpointName,
    int Discontinuities, int TimestampErrors, string? Error);

/// <summary>
/// Captures the default multimedia playback output using shared WASAPI loopback.
/// This includes phone playback and other PC sounds, without opening a microphone.
/// COM objects are created, used and released on the same dedicated apartment thread.
/// </summary>
public sealed class OutputLoopbackRecorder : IAsyncDisposable, IDisposable
{
    private readonly object gate = new();
    private CancellationTokenSource? stop;
    private Task completion = Task.CompletedTask;
    private RecordingSnapshot snapshot = new(RecordingStatus.Idle, TimeSpan.Zero, 0, 0, 0, 0, null, null, null);
    private RecordingResult? result;
    private long stopRequestedTimestamp;
    private bool disposed;
    public event Action<RecordingSnapshot>? Changed;
    public RecordingSnapshot Snapshot { get { lock (gate) return snapshot; } }
    public RecordingResult? LastResult { get { lock (gate) return result; } }
    public Task Completion { get { lock (gate) return completion; } }

    public Task StartAsync(string path, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(path);
        if (!OperatingSystem.IsWindows()) throw new PlatformNotSupportedException("录音功能需要 Windows。");
        string absolutePath = System.IO.Path.GetFullPath(path);
        lock (gate)
        {
            ObjectDisposedException.ThrowIf(disposed, this);
            if (!completion.IsCompleted) throw new InvalidOperationException("录音尚未停止。");
            cancellationToken.ThrowIfCancellationRequested();
            stop?.Dispose(); stop = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            Interlocked.Exchange(ref stopRequestedTimestamp, 0);
            result = null;
            snapshot = new(RecordingStatus.Starting, TimeSpan.Zero, 0, 0, 0, 0, null, absolutePath, null);
            TaskCompletionSource started = new(TaskCreationOptions.RunContinuationsAsynchronously);
            TaskCompletionSource finished = new(TaskCreationOptions.RunContinuationsAsynchronously);
            completion = finished.Task;
            CancellationToken token = stop.Token;
            Thread worker = new(() => Capture(absolutePath, token, started, finished))
            { IsBackground = true, Name = "Bluetooth recorder WASAPI" };
            try { worker.SetApartmentState(ApartmentState.MTA); worker.Start(); }
            catch (Exception error)
            {
                snapshot = snapshot with { Status = RecordingStatus.Failed, Error = error.Message };
                finished.TrySetResult(); started.TrySetException(error);
            }
            return started.Task;
        }
    }

    public async Task<RecordingResult?> StopAsync()
    {
        Task pending;
        lock (gate)
        {
            if (!completion.IsCompleted)
                FreezeStopTimestamp(Stopwatch.GetTimestamp());
            stop?.Cancel(); pending = completion;
        }
        await pending.ConfigureAwait(false);
        return LastResult;
    }

    private void FreezeStopTimestamp(long requested)
    {
        long previous = Interlocked.Read(ref stopRequestedTimestamp);
        while (previous == 0 || requested < previous)
        {
            long observed = Interlocked.CompareExchange(ref stopRequestedTimestamp, requested, previous);
            if (observed == previous) return;
            previous = observed;
        }
    }

    private void Publish(RecordingSnapshot value)
    {
        lock (gate) snapshot = value;
        Action<RecordingSnapshot>? listeners = Changed;
        if (listeners is null) return;
        foreach (Action<RecordingSnapshot> listener in listeners.GetInvocationList())
        {
            try { listener(value); }
            catch (Exception) { /* An observer cannot interrupt disk writing or resource cleanup. */ }
        }
    }

    private void Capture(string path, CancellationToken token,
        TaskCompletionSource started, TaskCompletionSource finished)
    {
        IMMDeviceEnumerator? devices = null;
        IMMDevice? device = null;
        IAudioClient? client = null;
        IAudioCaptureClient? capture = null;
        EndpointNotifications? notifications = null;
        IntPtr notificationPointer = IntPtr.Zero;
        bool notificationsRegistered = false;
        CaptureFileWriter? writer = null;
        CaptureTimeline? timeline = null;
        WaveFormat? format = null;
        IntPtr nativeFormat = IntPtr.Zero;
        Stopwatch elapsed = new();
        string endpointName = "电脑播放输出";
        string? errorText = null;
        bool comInitialized = false, audioStarted = false;
        long dataBytes = 0;
        TimeSpan recordedDuration = TimeSpan.Zero;
        long startTimestamp = 0;
        using CancellationTokenRegistration cancellationRegistration = token.Register(() =>
            FreezeStopTimestamp(Stopwatch.GetTimestamp()));
        try
        {
            token.ThrowIfCancellationRequested();
            WasapiNative.Check(WasapiNative.CoInitializeEx(IntPtr.Zero, 0));
            comInitialized = true;
            devices = (IMMDeviceEnumerator)new MMDeviceEnumeratorComObject();
            WasapiNative.Check(devices.GetDefaultAudioEndpoint(0, 1, out device)); // eRender, eMultimedia
            WasapiNative.Check(((IMMEndpoint)device).GetDataFlow(out int flow));
            if (flow != 0) throw new InvalidOperationException("所选通道不是电脑播放输出，未开始录音。");
            WasapiNative.Check(device.GetId(out string actualEndpointId));
            notifications = new(actualEndpointId, followsDefault: true);
            // Keep an explicit COM reference: MMDevice registration does not own the callback lifetime.
            notificationPointer = Marshal.GetComInterfaceForObject(notifications, typeof(IMMNotificationClient));
            WasapiNative.Check(devices.RegisterEndpointNotificationCallback(notificationPointer));
            notificationsRegistered = true;
            // A switch between initial selection and notification registration
            // must not silently leave us recording an old, now-silent output.
            IMMDevice? currentDefault = null;
            try
            {
                WasapiNative.Check(devices.GetDefaultAudioEndpoint(0, 1, out currentDefault));
                WasapiNative.Check(currentDefault.GetId(out string currentDefaultId));
                if (!string.Equals(actualEndpointId, currentDefaultId, StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException("电脑播放设备已切换，请重新开始录音。");
            }
            finally { WasapiNative.Release(currentDefault); }
            WasapiNative.Check(device.GetState(out uint deviceState));
            if (deviceState != 1 || notifications.Change != EndpointChange.None)
                throw new InvalidOperationException("电脑播放设备已断开或切换，请检查声音输出后重新录音。");
            endpointName = WasapiNative.FriendlyName(device);
            Guid clientId = WasapiNative.AudioClientId;
            WasapiNative.Check(device.Activate(ref clientId, 23, IntPtr.Zero, out object clientObject));
            client = (IAudioClient)clientObject;
            WasapiNative.Check(client.GetMixFormat(out nativeFormat));
            format = WaveFormat.FromNative(nativeFormat);
            // Read the playback mix without rendering a second copy, changing the
            // Bluetooth connection or modifying Windows' existing ListenTo playback.
            WasapiNative.Check(client.Initialize(0, WasapiNative.Loopback | WasapiNative.NoPersist,
                1_000_000, 0, nativeFormat, IntPtr.Zero));
            Guid captureId = WasapiNative.CaptureClientId;
            WasapiNative.Check(client.GetService(ref captureId, out object captureObject));
            capture = (IAudioCaptureClient)captureObject;
            token.ThrowIfCancellationRequested();
            writer = new(path, format);
            startTimestamp = Stopwatch.GetTimestamp();
            long startQpc = Qpc100ns(startTimestamp);
            elapsed.Start();
            timeline = new(writer, format, startQpc);
            WasapiNative.Check(client.Start()); audioStarted = true;
            Publish(new(RecordingStatus.Recording, TimeSpan.Zero, 0, 0, 0, 0, null, path, endpointName));
            started.TrySetResult();
            byte[] scratch = new byte[checked(format.BlockAlign * (int)Math.Max(1, format.SampleRate / 5))];
            long nextUpdate = 0;
            float peak = 0;
            void DrainPackets(bool stopping)
            {
                WasapiNative.Check(capture.GetNextPacketSize(out uint pendingFrames));
                while (pendingFrames > 0 && (stopping || (!token.IsCancellationRequested
                    && notifications.Change == EndpointChange.None)))
                {
                    WasapiNative.Check(capture.GetBuffer(out IntPtr data, out uint frames, out uint flags,
                        out ulong devicePosition, out ulong qpcPosition));
                    try
                    {
                        int byteCount = checked((int)frames * format.BlockAlign);
                        if (byteCount > checked((int)format.BytesPerSecond * 4))
                            throw new InvalidDataException("音频设备返回了异常大小的数据包。");
                        bool silent = (flags & WasapiNative.Silent) != 0;
                        if (scratch.Length < byteCount) scratch = new byte[byteCount];
                        if (!silent && byteCount > 0)
                        {
                            if (data == IntPtr.Zero) throw new InvalidDataException("音频设备返回了空数据包。");
                            Marshal.Copy(data, scratch, 0, byteCount);
                            peak = Math.Max(peak, format.Peak(scratch.AsSpan(0, byteCount)));
                        }
                        timeline.Append(silent ? ReadOnlySpan<byte>.Empty : scratch.AsSpan(0, byteCount),
                            checked((int)frames), silent, (flags & WasapiNative.Discontinuity) != 0,
                            (flags & WasapiNative.TimestampError) != 0, checked((long)devicePosition),
                            checked((long)qpcPosition), elapsed.Elapsed);
                    }
                    finally { WasapiNative.Check(capture.ReleaseBuffer(frames)); }
                    WasapiNative.Check(capture.GetNextPacketSize(out pendingFrames));
                }
            }
            while (!token.IsCancellationRequested && notifications.Change == EndpointChange.None)
            {
                DrainPackets(false);
                if (elapsed.ElapsedMilliseconds >= nextUpdate)
                {
                    Publish(new(RecordingStatus.Recording, elapsed.Elapsed, peak, writer.DataBytes,
                        timeline.Discontinuities, timeline.TimestampErrors, null, path, endpointName));
                    peak = 0; nextUpdate = elapsed.ElapsedMilliseconds + 100;
                }
                token.WaitHandle.WaitOne(8);
            }
            if (notifications.Change != EndpointChange.None)
            {
                FreezeStopTimestamp(notifications.Timestamp);
                errorText = ExplainChange(notifications.Change);
            }
            // Stop the producer before draining, then trim to the moment Stop was requested.
            // This preserves the last queued packet without recording cancellation scheduling delay.
            WasapiNative.Check(client.Stop()); audioStarted = false;
            DrainPackets(true);
        }
        catch (OperationCanceledException) when (token.IsCancellationRequested)
        { started.TrySetCanceled(token); }
        catch (Exception error)
        {
            if (notifications is not null && notifications.Change != EndpointChange.None)
            {
                FreezeStopTimestamp(notifications.Timestamp);
                errorText ??= ExplainChange(notifications.Change);
            }
            else errorText ??= Explain(error);
            started.TrySetException(new InvalidOperationException(errorText, error));
        }
        finally
        {
            elapsed.Stop();
            long stopTimestamp = Interlocked.Read(ref stopRequestedTimestamp);
            TimeSpan finalElapsed = startTimestamp == 0 ? TimeSpan.Zero
                : stopTimestamp > 0 ? TimeSpan.FromSeconds(Math.Max(0, stopTimestamp - startTimestamp) / (double)Stopwatch.Frequency)
                : elapsed.Elapsed;
            if (audioStarted && client is not null)
            {
                try { WasapiNative.Check(client.Stop()); }
                catch (Exception error) { errorText ??= Explain(error); }
            }
            if (writer is not null)
            {
                try
                {
                    timeline?.Complete(finalElapsed);
                    dataBytes = writer.DataBytes; recordedDuration = writer.Duration;
                }
                catch (Exception error) { errorText ??= "录音文件未能完整写入：" + error.Message; }
                finally
                {
                    try { writer.Dispose(); }
                    catch (Exception error) { errorText ??= "录音文件未能完整写入：" + error.Message; }
                }
            }
            if (nativeFormat != IntPtr.Zero) Marshal.FreeCoTaskMem(nativeFormat);
            bool notificationDetached = !notificationsRegistered;
            if (notificationsRegistered && devices is not null)
            {
                try
                {
                    int unregisterResult = devices.UnregisterEndpointNotificationCallback(notificationPointer);
                    notificationDetached = NotificationLifetime.IsDetached(unregisterResult);
                    if (!notificationDetached) WasapiNative.Check(unregisterResult);
                }
                catch (Exception error)
                {
                    errorText = (errorText is null ? "" : errorText + " ")
                        + "声音设备通知未能正常解除，保护引用将保留至程序退出：" + error.Message;
                }
            }
            if (notificationPointer != IntPtr.Zero)
            {
                if (notificationDetached) Marshal.Release(notificationPointer);
                else if (notifications is not null)
                    NotificationLifetime.Quarantine(notificationPointer, notifications);
            }
            GC.KeepAlive(notifications);
            WasapiNative.Release(capture); WasapiNative.Release(client);
            WasapiNative.Release(device); WasapiNative.Release(devices);
            if (comInitialized) WasapiNative.CoUninitialize();
            if (writer is not null && format is not null)
            {
                lock (gate) result = new(path, recordedDuration, format, endpointName,
                    timeline?.Discontinuities ?? 0, timeline?.TimestampErrors ?? 0, errorText);
            }
            Publish(new(errorText is null ? RecordingStatus.Stopped : RecordingStatus.Failed,
                recordedDuration, 0, dataBytes, timeline?.Discontinuities ?? 0,
                timeline?.TimestampErrors ?? 0, errorText, writer is null ? null : path, endpointName));
            // A cancelled initialization must always resolve StartAsync, even if no device was opened.
            if (!started.Task.IsCompleted) started.TrySetCanceled(token.IsCancellationRequested ? token : new(true));
            finished.TrySetResult();
        }
    }

    private static long Qpc100ns(long timestamp) => checked((long)(timestamp * (10_000_000d / Stopwatch.Frequency)));
    private static string ExplainChange(EndpointChange change) => change == EndpointChange.DefaultOutputChanged
        ? "电脑播放设备已切换，录音已停止，已有片段已保留。请重新开始，录制新的播放设备。"
        : "电脑播放设备已断开或不可用，录音已停止，已有片段已保留。";
    private static string Explain(Exception error)
    {
        uint hr = unchecked((uint)error.HResult);
        return hr switch
        {
            0x88890004 or 0x88890026 => "电脑播放设备已断开或发生变化，录音已停止。已有片段已保留。",
            0x88890010 => "Windows 音频服务没有运行。请检查系统声音后重试。",
            0x8889000a => "电脑播放设备正被独占使用，请关闭占用它的应用后重试。",
            0x80070005 => "Windows 拒绝访问电脑播放输出，请检查系统声音权限。",
            0x80070490 => "没有找到电脑的播放设备，请检查系统声音输出。",
            _ => "无法继续录音：" + error.Message
        };
    }

    public async ValueTask DisposeAsync()
    {
        lock (gate) { if (disposed) return; disposed = true; }
        await StopAsync().ConfigureAwait(false);
        lock (gate) { stop?.Dispose(); stop = null; }
    }
    public void Dispose() => DisposeAsync().AsTask().GetAwaiter().GetResult();
}
