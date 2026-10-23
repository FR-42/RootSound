namespace RootSound.BluetoothRecorder;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        if (!OperatingSystem.IsWindowsVersionAtLeast(10, 0, 19041))
        {
            MessageBox.Show("蓝牙录音需要 Windows 10 2004 或更新版本。", "蓝牙录音"); return;
        }
        ApplicationConfiguration.Initialize();
        Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
        Application.ThreadException += (_, args) => MessageBox.Show("操作遇到问题：" + args.Exception.Message, "蓝牙录音");
        try { Application.Run(new MainForm()); }
        catch (Exception ex) { MessageBox.Show("无法启动蓝牙录音：" + ex.Message, "蓝牙录音"); }
    }
}
