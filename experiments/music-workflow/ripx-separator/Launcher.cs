using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
class Launcher {
  [STAThread] static int Main(string[] args) {
    try {
      string root=Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"ripx-separator");
      string python=File.ReadAllText(Path.Combine(root,"python-path.txt")).Trim();
      if(!File.Exists(python)||!File.Exists(Path.Combine(root,"app.py"))) throw new Exception("运行组件缺失，请保留 exe 旁边的 ripx-separator 文件夹。");
      var start=new ProcessStartInfo(python,"\""+Path.Combine(root,"app.py")+"\""+(Array.IndexOf(args,"--smoke")>=0?" --smoke":""));
      start.UseShellExecute=false; start.CreateNoWindow=true; start.WorkingDirectory=root;
      start.EnvironmentVariables["PYTHONIOENCODING"]="utf-8";
      using(var child=Process.Start(start)) {
        if(Array.IndexOf(args,"--smoke")>=0) { child.WaitForExit(); return child.ExitCode; }
      }
      return 0;
    } catch(Exception e) { MessageBox.Show(e.Message,"RipX音色分离"); return 1; }
  }
}
