using System;
using System.Diagnostics;
using System.IO;
using System.Text.RegularExpressions;
using System.Windows.Forms;

namespace RootSound.TimbreLab.Launcher
{
    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            try
            {
                string root = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "timbre-lab");
                string marker = Path.Combine(root, ".current");
                if (!File.Exists(marker)) throw new IOException("还没有可用的构建。请先运行旁边的“构建并打开音色打磨.bat”。");
                string selected = File.ReadAllText(marker).Trim();
                if (!Regex.IsMatch(selected, @"^\d{8}-\d{6}-\d{3}-[a-f0-9]{6}$")) throw new IOException("构建入口记录无效，请重新构建。");
                string directory = Path.Combine(root, ".builds", selected);
                string target = Path.Combine(directory, "RootSound.TimbreLab.exe");
                if (!File.Exists(target) || !File.Exists(Path.Combine(directory, "RootSound.TimbreLab.dll")) ||
                    !File.Exists(Path.Combine(directory, "RootSound.TimbreLab.runtimeconfig.json")) ||
                    !File.Exists(Path.Combine(directory, "RootSound.TimbreLab.deps.json")))
                    throw new IOException("音色打磨工具文件不完整，请重新构建。");
                Process.Start(new ProcessStartInfo(target) { WorkingDirectory = directory, UseShellExecute = false, CreateNoWindow = true });
            }
            catch (Exception ex) { MessageBox.Show(ex.Message, "音色打磨", MessageBoxButtons.OK, MessageBoxIcon.Information); }
        }
    }
}
