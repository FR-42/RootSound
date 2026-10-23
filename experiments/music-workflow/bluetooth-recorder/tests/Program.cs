namespace RootSound.BluetoothRecorder.Tests;

internal static class Program
{
    private static async Task<int> Main(string[] args)
    {
        if (args is ["--inspect-phone-sources", var report])
            return await PhoneSourceDiagnostics.WriteAsync(Path.GetFullPath(report));
        if (args is ["--probe-output-loopback", var outputReport])
            return await OutputLoopbackProbe.WriteAsync(Path.GetFullPath(outputReport));
        string root = args.Length == 1 ? Path.GetFullPath(args[0]) : throw new ArgumentException("Pass an isolated test output directory.");
        Directory.CreateDirectory(root);
        try
        {
            int recording = RecordingChecks.Run(Path.Combine(root, "recording"));
            int receiver = await ReceiverChecks.RunAsync();
            int session = await SessionChecks.RunAsync(Path.Combine(root, "sessions"));
            int sources = PhoneSourceChecks.Run(Path.Combine(root, "sources"));
            int identities = await PhoneIdentityChecks.RunAsync();
            int bindings = await ConnectedCaptureChecks.RunAsync();
            Console.WriteLine($"PASS {recording + receiver + session + sources + identities + bindings} groups; recording={recording}, receiver={receiver}, session={session}, sources={sources}, identities={identities}, bindings={bindings}; realDevicesOpened=false; desktopControlled=false");
            return 0;
        }
        catch (Exception ex) { Console.Error.WriteLine(ex); return 1; }
    }
}
