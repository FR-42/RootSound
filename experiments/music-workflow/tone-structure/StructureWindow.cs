using CaptureForm=RootSound.ToneProcessor.MainForm;

namespace RootSound.ToneStructure;

internal sealed class StructureWindow:Form
{
    private readonly StructureForm structure;
    private readonly CaptureForm capture;
    private readonly Panel pages=new(){Dock=DockStyle.Fill};
    private bool capturing,switching,closing,allowClose;
    internal StructureWindow(string root,bool initializeCapture=true)
    {
        Text="音色结构 · 结构分析";ClientSize=new Size(1320,950);MinimumSize=new Size(1080,760);
        Font=new Font("Microsoft YaHei UI",9.5f);AutoScaleMode=AutoScaleMode.Dpi;StartPosition=FormStartPosition.CenterScreen;
        Controls.Add(pages);structure=new StructureForm(root);capture=new CaptureForm(root,integrated:true,initializeEq:initializeCapture);capture.SetTransferTarget("结构分析");
        Embed(structure);Embed(capture);structure.Show();structure.BringToFront();
        structure.CaptureRequested+=(_,_)=>ShowCapture();capture.ReturnRequested+=(_,_)=>ShowStructure();
        capture.TransferSelection=async(source,origin,token)=>
        {
            if(structure.HasInput && MessageBox.Show(this,"传入新的片段将替换当前分析和分解，已导出的文件会保留。继续吗？","音色结构",MessageBoxButtons.OKCancel,MessageBoxIcon.Question)!=DialogResult.OK)
                throw new OperationCanceledException();
            await structure.LoadSelectionAsync(source,origin,token);if(!closing)ShowStructure();
        };
        FormClosing+=ClosingAsync;
    }
    private void Embed(Form page){page.TopLevel=false;page.FormBorderStyle=FormBorderStyle.None;page.Dock=DockStyle.Fill;page.MinimumSize=Size.Empty;pages.Controls.Add(page);}
    private void ShowCapture()
    {
        if(capturing || closing || switching)return;switching=true;
        try{structure.SuspendForNavigation();structure.Hide();capture.Show();capture.BringToFront();capture.ResumeForNavigation();capturing=true;Text="音色结构 · 歌曲截取";}
        finally{switching=false;}
    }
    private void ShowStructure()
    {
        if(closing || !capturing)return;capture.SuspendForNavigation();capture.Hide();structure.Show();structure.BringToFront();structure.ResumeForNavigation();capturing=false;Text="音色结构 · 结构分析";
    }
    private async void ClosingAsync(object? sender,FormClosingEventArgs e)
    {
        if(allowClose)return;e.Cancel=true;if(closing)return;closing=true;Enabled=false;
        try{await capture.ShutdownAsync();await structure.ShutdownAsync();allowClose=true;Close();}
        catch(Exception ex){closing=false;Enabled=true;MessageBox.Show(this,"关闭时遇到问题："+ex.Message,"音色结构");}
    }
    protected override void Dispose(bool disposing){if(disposing){capture.Dispose();structure.Dispose();}base.Dispose(disposing);}
}
