namespace RootSound.SongStudio;
internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        using var instance = new Mutex(false, "Local\\RootSoundExperiments.SongStudio");
        try { if (!instance.WaitOne(0)) { MessageBox.Show("歌曲编排已经打开，请使用现有窗口。", "歌曲编排"); return; } }
        catch (AbandonedMutexException) { }
        Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
        Application.ThreadException += (_, e) => MessageBox.Show("操作遇到问题：" + e.Exception.Message, "歌曲编排");
        try { Application.Run(new MainForm()); }
        catch (Exception ex) { MessageBox.Show("无法启动歌曲编排：" + ex.Message, "歌曲编排"); }
        finally { instance.ReleaseMutex(); }
    }
}
