namespace RootSound.ToneStructure;
internal static class Program
{
    [STAThread]
    private static void Main(string[] args)
    {
        Application.SetHighDpiMode(HighDpiMode.PerMonitorV2);Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);
        Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
        Application.ThreadException+=(_,e)=>MessageBox.Show("操作遇到问题："+e.Exception.Message,"音色结构");
        try
        {
            int index=Array.IndexOf(args,"--experiment-root");
            string root=index>=0 && index+1<args.Length?Path.GetFullPath(args[index+1]):Path.GetFullPath(Path.Combine(AppContext.BaseDirectory,"..",".."));
            Application.Run(new StructureWindow(root));
        }
        catch(Exception ex){MessageBox.Show("无法启动音色结构："+ex.Message,"音色结构");}
    }
}
