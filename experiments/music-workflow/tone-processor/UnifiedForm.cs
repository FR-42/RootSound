using RootSound.TimbreLab.Audio;
using LabForm = RootSound.TimbreLab.MainForm;

namespace RootSound.ToneProcessor;

/// <summary>Owns two persistent editing pages. Navigation pauses audio without rebuilding either page.</summary>
internal sealed class UnifiedForm : Form
{
    private readonly LabForm lab;
    private readonly MainForm capture;
    private readonly Panel pages=new() {Dock=DockStyle.Fill};
    private bool switching,closing,allowClose;
    internal bool Capturing {get;private set;}
    internal UnifiedForm(string root,bool initializeCapture=true)
    {
        Text="音色器 · 音色打磨";ClientSize=new Size(1240,930);MinimumSize=new Size(1000,820);
        AutoScaleMode=AutoScaleMode.Dpi;Font=new Font("Microsoft YaHei UI",9);
        StartPosition=FormStartPosition.CenterScreen;Controls.Add(pages);
        lab=new LabForm(new AuditionSession(),integrated:true);
        capture=new MainForm(root,integrated:true,initializeEq:initializeCapture);
        Embed(lab);Embed(capture);lab.Show();lab.BringToFront();
        lab.CaptureRequested+=async (_,_)=>await ShowCaptureAsync();
        capture.ReturnRequested+=async (_,_)=>await ShowLabAsync();
        capture.ValidateSample=lab.ValidateCapturedSample;
        capture.AddSample=AcceptCaptureAsync;
        FormClosing+=ClosingAsync;
    }
    private void Embed(Form page)
    {
        page.TopLevel=false;page.FormBorderStyle=FormBorderStyle.None;page.Dock=DockStyle.Fill;
        page.MinimumSize=Size.Empty;pages.Controls.Add(page);
    }
    internal async Task ShowCaptureAsync()
    {
        if(switching || closing || Capturing)return;switching=true;
        try
        {
            await lab.SuspendForNavigationAsync();
            if(closing)return;
            lab.Hide();capture.Show();capture.BringToFront();capture.ResumeForNavigation();
            Capturing=true;Text="音色器 · 歌曲截取";
        }
        finally{switching=false;}
    }
    internal Task ShowLabAsync()
    {
        if(closing || !Capturing)return Task.CompletedTask;
        capture.SuspendForNavigation();capture.Hide();lab.Show();lab.BringToFront();lab.ResumeForNavigation();
        Capturing=false;Text="音色器 · 音色打磨";return Task.CompletedTask;
    }
    internal async Task AcceptCaptureAsync(CapturedSample sample)
    {
        if(closing)throw new OperationCanceledException();
        lab.AddCapturedSample(sample.Clip,sample.SourcePath,sample.SourceIdentity);
        await ShowLabAsync();
    }
    internal async Task ShutdownAsync()
    {
        if(allowClose)return;
        closing=true;Enabled=false;
        await capture.ShutdownAsync();await lab.ShutdownAsync();allowClose=true;
    }
    private async void ClosingAsync(object? sender,FormClosingEventArgs e)
    {
        if(allowClose)return;e.Cancel=true;if(closing)return;
        try{await ShutdownAsync();Close();}
        catch(Exception ex){closing=false;Enabled=true;MessageBox.Show(this,"关闭时遇到问题："+ex.Message,"音色器");}
    }
    protected override void Dispose(bool disposing)
    {
        if(disposing){capture.Dispose();lab.Dispose();}
        base.Dispose(disposing);
    }
}
