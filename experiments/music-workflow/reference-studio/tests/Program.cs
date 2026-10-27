using System.Text.Json;
using RootSound.ReferenceStudio.Audio;
using RootSound.ReferenceStudio.Persistence;

namespace RootSound.ReferenceStudio.Tests;

internal static class Program
{
    [STAThread]
    private static int Main(string[] args)
    {
        try
        {
            if (args.Length == 3 && args[0] == "--pack")
            {
                var project = CaseArchive.LoadAsync(args[1]).GetAwaiter().GetResult();
                CaseArchive.SaveAsync(project, args[2]).GetAwaiter().GetResult();
                var restored = CaseArchive.LoadAsync(args[2]).GetAwaiter().GetResult();
                Console.WriteLine($"PACKED {restored.Info.Title}; duration={restored.DurationSeconds:F6}; layers={restored.Layers.Count}");
                return 0;
            }
            if (args.Length == 3 && args[0] == "--render")
            {
                var project = CaseArchive.LoadAsync(args[1]).GetAwaiter().GetResult();
                ReferenceRenderer.ExportAsync(project, args[2], overwrite: true).GetAwaiter().GetResult();
                Console.WriteLine("RENDERED " + args[2]); return 0;
            }
            if (args.Length == 3 && args[0] == "--case-check")
            {
                int count = CaseChecks.Run(args[2], args[1]);
                Console.WriteLine("PASS actual case: " + count); return 0;
            }
            if (args.Length is 2 or 3 && args[0] == "--audio-only")
            {
                int count = Task.Run(() => AudioChecks.Run(args[1])).GetAwaiter().GetResult();
                if (args.Length == 3) AudioChecks.BenchmarkCase(args[1], args[2]);
                Console.WriteLine("PASS audio: " + count); return 0;
            }
            if (args.Length == 2 && args[0] == "--ui-only")
            {
                int count = UiChecks.Run(args[1]) + UiChecks.RunLayoutChecks(Path.Combine(args[1], "layout"));
                Console.WriteLine("PASS UI: " + count); return 0;
            }
            if (args.Length == 3 && args[0] == "--benchmark-case")
            {
                AudioChecks.BenchmarkCase(args[2], args[1]); return 0;
            }
            if (args.Length is < 1 or > 2) throw new ArgumentException("Pass an isolated output directory and optional prepared case.");
            string root = Path.GetFullPath(args[0]); Directory.CreateDirectory(root);
            int persistence = PersistenceChecks.Run(Path.Combine(root, "persistence"));
            int audio = Task.Run(() => AudioChecks.Run(Path.Combine(root, "audio"))).GetAwaiter().GetResult();
            int ui = UiChecks.Run(Path.Combine(root, "ui"));
            int layout = UiChecks.RunLayoutChecks(Path.Combine(root, "layout"));
            int actualCase = args.Length == 2 ? CaseChecks.Run(Path.Combine(root, "case"), args[1]) : 0;
            string? observationPath = args.Length == 2 && Directory.Exists(args[1]) ? Path.Combine(args[1], "sound-observation") : null;
            int observation = observationPath is not null && Directory.Exists(observationPath)
                ? CaseChecks.Run(Path.Combine(root, "observation"), observationPath) : 0;
            var report = new { persistence, audio, ui, layout, actualCase, observation,
                total = persistence + audio + ui + layout + actualCase + observation,
                realAudioDevicesOpened = false, screenCaptured = false, desktopControlled = false,
                actualListeningVerified = false };
            File.WriteAllText(Path.Combine(root, "checks.json"), JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true }));
            Console.WriteLine("PASS " + JsonSerializer.Serialize(report)); return 0;
        }
        catch (Exception ex) { Console.Error.WriteLine(ex); return 1; }
    }
}
