using System;
using System.Diagnostics;
using System.Windows.Forms;

namespace RootSound.Launcher
{
    internal static class Program
    {
        [STAThread]
        private static int Main(string[] args)
        {
            try
            {
                ProcessStartInfo start = Launcher.CreateStartInfo(AppDomain.CurrentDomain.BaseDirectory, args);
                using (Process process = Process.Start(start))
                {
                    if (process == null) throw new InvalidOperationException("系统未能启动 RootSound。");
                }
                return 0;
            }
            catch (Exception error)
            {
                MessageBox.Show(
                    error.Message + "\n\n请将 RootSound.exe 保留在项目根目录。需要构建或修复时，运行同目录的 RootSound.bat。",
                    "RootSound 暂时无法打开", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return 1;
            }
        }
    }
}
