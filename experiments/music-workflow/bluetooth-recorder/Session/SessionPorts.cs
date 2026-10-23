namespace RootSound.BluetoothRecorder.Session;

public interface IReceiverPort
{
    bool IsConnected { get; }
    string? DeviceName { get; }
    event EventHandler? Changed;
    Task ConnectAsync(string? selectedId, CancellationToken token);
    Task StopAsync();
}
public sealed record CaptureProgress(bool IsRecording, TimeSpan Duration, float Peak, long DataBytes, string? EndpointName, string? Error);
public sealed record CaptureTake(string Path, TimeSpan Duration, long DataBytes, string? EndpointName, string? Error);
public interface ICapturePort
{
    CaptureProgress Progress { get; }
    event EventHandler? Changed;
    Task StartAsync(string path, CancellationToken token);
    Task<CaptureTake?> StopAsync();
}
public enum SessionPhase { Idle, Connecting, Ready, Starting, Recording, Stopping, Recorded, Exporting, Restarting, Closed }
public sealed record SessionSnapshot(SessionPhase Phase, bool Connected, string? DeviceName, TimeSpan Duration,
    float Peak, long DataBytes, string? EndpointName, string Status, string? Error, string? LastExport, int ExportCount)
{
    public bool CanRecord => Phase == SessionPhase.Ready && Connected;
    public bool CanStop => Phase == SessionPhase.Recording;
    public bool CanExport => Phase == SessionPhase.Recorded && DataBytes > 0;
    public bool CanConnect => Phase is SessionPhase.Idle or SessionPhase.Ready or SessionPhase.Recorded;
}
