using System;
using System.Diagnostics;
using System.IO;
using System.Text.RegularExpressions;
using System.Windows.Forms;

namespace RootSound.ToneProcessor.Launcher
{
    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            try
            {
                string root = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tone-processor");
                string marker = Path.Combine(root, ".current");
                if (!File.Exists(marker)) throw new IOException("还没有可用的构建。请先运行“构建并打开音色器.bat”。");
                string selected = File.ReadAllText(marker).Trim();
                if (!Regex.IsMatch(selected, @"^\d{8}-\d{6}-\d{3}-[a-f0-9]{6}$")) throw new IOException("实验构建入口记录无效，请重新构建。");
                string directory = Path.Combine(root, ".builds", selected);
                string target = Path.Combine(directory, "RootSound.ToneProcessor.exe");
                foreach (string name in new[] { "RootSound.ToneProcessor.exe", "RootSound.ToneProcessor.dll", "RootSound.ToneProcessor.runtimeconfig.json", "RootSound.ToneProcessor.deps.json", "ui/index.html" })
                    if (!File.Exists(Path.Combine(directory, name))) throw new IOException("音色器文件不完整，请重新构建。");
                Process.Start(new ProcessStartInfo(target) { WorkingDirectory = directory, UseShellExecute = false, CreateNoWindow = true,
                    Arguments = "--experiment-root \"" + root + "\"" });
            }
            catch (Exception error) { MessageBox.Show(error.Message, "音色器", MessageBoxButtons.OK, MessageBoxIcon.Information); }
        }
    }
}
