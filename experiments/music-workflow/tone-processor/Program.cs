namespace RootSound.ToneProcessor;
internal static class Program
{
    [STAThread]
    private static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();
        Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
        Application.ThreadException+=(_,e)=>MessageBox.Show("操作遇到问题："+e.Exception.Message,"音色器");
        try
        {
            int index=Array.IndexOf(args,"--experiment-root");
            string root=index>=0 && index+1<args.Length?Path.GetFullPath(args[index+1]):Path.GetFullPath(Path.Combine(AppContext.BaseDirectory,"..",".."));
            Application.Run(new UnifiedForm(root));
        }
        catch(Exception ex){MessageBox.Show("无法启动音色器："+ex.Message,"音色器");}
    }
}
