namespace RootSound.PhraseStudio;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
        Application.ThreadException += (_, args) => MessageBox.Show("操作遇到问题：" + args.Exception.Message, "乐句谱写");
        try { Application.Run(new MainForm()); }
        catch (Exception ex) { MessageBox.Show("无法启动乐句谱写：" + ex.Message, "乐句谱写"); }
    }
}
