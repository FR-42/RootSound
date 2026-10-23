namespace RootSound.BluetoothRecorder.Session;

// The actual Bluetooth connection gates playback-output recording. Starting no
// longer depends on Windows exposing an independent phone capture endpoint.
internal static class ConnectedCaptureStart
{
    internal static async Task StartAsync(Func<string?> connectedPhone,
        Func<CancellationToken, Task> start, Func<Task> stop,
        CancellationToken token)
    {
        token.ThrowIfCancellationRequested();
        string phoneId = connectedPhone() ?? throw new InvalidOperationException("请先连接手机的媒体音频，再开始录音。");
        try
        {
            await start(token);
            token.ThrowIfCancellationRequested();
            if (!SamePhone()) throw new InvalidOperationException("手机连接已发生变化，录音已停止。");
        }
        catch
        {
            await stop();
            throw;
        }
        bool SamePhone() => string.Equals(connectedPhone(), phoneId, StringComparison.Ordinal);
    }
}
