namespace RootSound.SampleEditor;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
        Application.ThreadException += (_, args) => MessageBox.Show("操作遇到问题：" + args.Exception.Message, "采样编辑");
        try { Application.Run(new MainForm()); }
        catch (Exception ex) { MessageBox.Show("无法启动采样编辑：" + ex.Message, "采样编辑"); }
    }
}
