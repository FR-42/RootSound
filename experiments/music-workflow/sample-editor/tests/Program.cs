namespace RootSound.SampleEditor.Tests;

internal static class Program
{
    [STAThread]
    private static int Main(string[] args)
    {
        try
        {
            if (args.Length != 1) throw new ArgumentException("Pass an isolated output directory.");
            string root = Path.GetFullPath(args[0]); Directory.CreateDirectory(root);
            int audio = Task.Run(() => AudioChecks.Run(Path.Combine(root, "audio"))).GetAwaiter().GetResult();
            int playback = PlaybackChecks.Run();
            int analysis = AnalysisChecks.Run();
            int timeline = TimelineChecks.Run();
            int plots = PlotRenderChecks.Run(Path.Combine(root, "plots"));
            Console.WriteLine($"PASS {audio + playback + analysis + timeline + plots} groups; audio={audio}, playback={playback}, analysis={analysis}, timeline={timeline}, plots={plots}; realAudioDevicesOpened=false; screenCaptured=false; desktopControlled=false; plotImagesRenderedOffscreen=true");
            return 0;
        }
        catch (Exception ex) { Console.Error.WriteLine(ex); return 1; }
    }
}
