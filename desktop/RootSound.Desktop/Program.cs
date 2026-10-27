using System.Text.Json;

namespace RootSound.Desktop;

internal static class Program
{
    [STAThread]
    private static int Main(string[] args)
    {
        var projectTestDirectory = Argument(args, "--test-project-directories");
        if (projectTestDirectory is not null)
        {
            projectTestDirectory = Path.GetFullPath(projectTestDirectory);
            Directory.CreateDirectory(projectTestDirectory);
            try
            {
                int passed = ProjectDirectoriesSelfTests.Run(projectTestDirectory);
                File.WriteAllText(Path.Combine(projectTestDirectory, "project-directories-report.json"), JsonSerializer.Serialize(new { passed }));
                return 0;
            }
            catch (Exception error)
            {
                File.WriteAllText(Path.Combine(projectTestDirectory, "project-directories-report.json"), JsonSerializer.Serialize(new { error = error.ToString() }));
                return 1;
            }
        }
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
            // Hold the application-wide lock without reading or reviving the retired global library.
            using var applicationLock = AcquireApplicationLock(dataDirectory);
            using var projects = new ProjectDirectoryManager(ResolveInstallationRoot(Argument(args, "--install-root")));
            Application.Run(new MainWindow(projects, dataDirectory));
            return 0;
        }
        catch (Exception error)
        {
            MessageBox.Show(error.Message, "RootSound 暂时无法打开", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }

    internal static FileStream AcquireApplicationLock(string dataDirectory)
    {
        Directory.CreateDirectory(dataDirectory);
        try { return new FileStream(Path.Combine(dataDirectory, "materials.lock"), FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None); }
        catch (IOException error) { throw new IOException("已有另一个 RootSound 窗口正在使用本机资料，请关闭该窗口后重试。", error); }
    }

    internal static string ResolveInstallationRoot(string? explicitRoot)
    {
        if (!string.IsNullOrWhiteSpace(explicitRoot)) return Path.GetFullPath(explicitRoot);
        // Both launcher entry points set WorkingDirectory to the installation root.
        foreach (string start in new[] { Directory.GetCurrentDirectory(), AppContext.BaseDirectory })
            for (DirectoryInfo? candidate = new(start); candidate is not null; candidate = candidate.Parent)
                if (File.Exists(Path.Combine(candidate.FullName, "package.json")) && File.Exists(Path.Combine(candidate.FullName, "index.html")))
                    return candidate.FullName;
        return AppContext.BaseDirectory;
    }

    private static string? Argument(string[] args, string key)
    {
        var position = Array.IndexOf(args, key);
        return position >= 0 && position + 1 < args.Length ? args[position + 1] : null;
    }
}
