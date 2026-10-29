namespace RootSound.SpectralForge;

internal static class Program
{
    [STAThread]
    private static int Main(string[] args)
    {
        try
        {
            string? experiment = null;
            int index = Array.IndexOf(args, "--experiment-root");
            if (index >= 0 && index + 1 < args.Length) experiment = args[index + 1];
            if (experiment is null)
            {
                for (var directory = new DirectoryInfo(AppContext.BaseDirectory); directory is not null; directory = directory.Parent)
                    if (Directory.Exists(Path.Combine(directory.FullName, "host")) && Directory.Exists(Path.Combine(directory.FullName, "web")))
                    { experiment = directory.FullName; break; }
            }
            if (experiment is null || !Directory.Exists(experiment)) throw new IOException("未找到独立实验目录，请使用旁边的“精细音色生成器.exe”。");
            ApplicationConfiguration.Initialize();
            Application.Run(new MainWindow(new NativeFiles(experiment)));
            return 0;
        }
        catch (Exception error)
        {
            MessageBox.Show(error.Message, "精细音色生成器", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }
}
