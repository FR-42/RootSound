namespace RootSound.ReferenceStudio;

internal static class Program
{
    [STAThread]
    private static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();
        Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
        Application.ThreadException += (_, e) => MessageBox.Show("操作遇到问题：" + e.Exception.Message, "拆解与改写");
        try { Application.Run(new MainForm(args.FirstOrDefault())); }
        catch (Exception ex) { MessageBox.Show("无法启动：" + ex.Message, "拆解与改写"); }
    }
}
