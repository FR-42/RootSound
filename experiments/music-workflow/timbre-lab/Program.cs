namespace RootSound.TimbreLab;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
        Application.ThreadException += (_, args) => MessageBox.Show("操作遇到问题：" + args.Exception.Message, "音色打磨");
        try { Application.Run(new MainForm()); }
        catch (Exception ex) { MessageBox.Show("无法启动音色打磨：" + ex.Message, "音色打磨"); }
    }
}
