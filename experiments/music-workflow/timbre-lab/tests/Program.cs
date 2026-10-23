namespace RootSound.TimbreLab.Tests;

internal static class Program
{
    [STAThread]
    private static int Main(string[] args)
    {
        try
        {
            if (args.Length != 1) throw new ArgumentException("Pass an isolated output directory.");
            string root = Path.GetFullPath(args[0]); Directory.CreateDirectory(root);
            int host = Task.Run(() => HostChecks.Run(Path.Combine(root, "host"))).GetAwaiter().GetResult();
            int processing = ProcessingChecks.Run(Path.Combine(root, "processing"));
            int instrument = InstrumentChecks.Run(Path.Combine(root, "instrument"));
            int workflow = WorkflowChecks.Run(Path.Combine(root, "workflow"));
            Console.WriteLine($"PASS {host + processing + instrument + workflow} groups; host={host}, processing={processing}, instrument={instrument}, workflow={workflow}; realAudioDevicesOpened=false; screenCaptured=false; desktopControlled=false");
            return 0;
        }
        catch (Exception ex) { Console.Error.WriteLine(ex); return 1; }
    }
}
