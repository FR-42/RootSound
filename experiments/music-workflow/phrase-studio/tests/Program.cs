namespace RootSound.PhraseStudio.Tests;

internal static class Program
{
    [STAThread]
    private static int Main(string[] args)
    {
        try
        {
            if (args.Length != 1) throw new ArgumentException("Pass an isolated output directory.");
            string root = Path.GetFullPath(args[0]); Directory.CreateDirectory(root);
            int core = CoreChecks.Run(Path.Combine(root, "core"));
            int persistence = PersistenceChecks.Run(Path.Combine(root, "persistence"));
            int audio = Task.Run(() => AudioChecks.Run(Path.Combine(root, "audio"))).GetAwaiter().GetResult();
            int editor = EditorChecks.Run(Path.Combine(root, "editor"));
            int workflow = WorkflowChecks.Run(Path.Combine(root, "workflow"));
            Console.WriteLine($"PASS {core + persistence + audio + editor + workflow} groups; core={core}, persistence={persistence}, audio={audio}, editor={editor}, workflow={workflow}; realAudioDevicesOpened=false; screenCaptured=false; desktopControlled=false");
            return 0;
        }
        catch (Exception ex) { Console.Error.WriteLine(ex); return 1; }
    }
}
