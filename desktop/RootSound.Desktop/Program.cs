using System.Text.Json;

namespace RootSound.Desktop;

internal static class Program
{
    [STAThread]
    private static int Main(string[] args)
    {
        var testDirectory = Argument(args, "--test-file-store");
        if (testDirectory is not null)
        {
            try
            {
                var count = FileStoreSelfTests.Run(Path.GetFullPath(testDirectory));
                var audioCount = AudioFilesSelfTests.Run(Path.GetFullPath(testDirectory));
                var projectCount = ProjectFilesSelfTests.Run(Path.GetFullPath(testDirectory));
                var sampleCount = SampleFilesSelfTests.Run(Path.GetFullPath(testDirectory));
                File.WriteAllText(Path.Combine(testDirectory, "file-store-report.json"), JsonSerializer.Serialize(new { passed = count + audioCount + projectCount + sampleCount, fileStorePassed = count, audioFilesPassed = audioCount, projectFilesPassed = projectCount, sampleFilesPassed = sampleCount }));
                return 0;
            }
            catch (Exception error)
            {
                Directory.CreateDirectory(testDirectory);
                File.WriteAllText(Path.Combine(testDirectory, "file-store-report.json"), JsonSerializer.Serialize(new { error = error.ToString() }));
                return 1;
            }
        }

        ApplicationConfiguration.Initialize();
        var dataDirectory = Path.GetFullPath(Argument(args, "--data-dir")
            ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RootSound"));
        try
        {
            using var store = new AtomicTextStore(dataDirectory);
            Application.Run(new MainWindow(store, dataDirectory));
            return 0;
        }
        catch (Exception error)
        {
            MessageBox.Show(error.Message, "RootSound 暂时无法打开", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }

    private static string? Argument(string[] args, string key)
    {
        var position = Array.IndexOf(args, key);
        return position >= 0 && position + 1 < args.Length ? args[position + 1] : null;
    }
}
