using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using RootSound.SpectralForge;

namespace RootSound.ToneProcessor;

internal sealed class EqPanel : UserControl
{
    private readonly WebView2 view = new() { Dock = DockStyle.Fill, DefaultBackgroundColor = Color.FromArgb(242,245,247) };
    private readonly Dictionary<string, TaskCompletionSource> syncing = [];
    private bool webReady;
    private long revision;
    private int sampleRate = 48000;
    internal bool Ready { get; private set; }
    internal EqKernel Kernel { get; private set; } = EqKernel.Flat;
    internal event EventHandler? Changed, PlayRequested;
    internal event Action<string>? Failed;
    internal EqPanel() { Controls.Add(view); }
    internal async Task InitializeAsync(string? browserDataDirectory = null)
    {
        try
        {
            string ui = Path.Combine(AppContext.BaseDirectory, "ui");
            string data = browserDataDirectory ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RootSoundExperiments", "ToneProcessor", "webview");
            var environment = await CoreWebView2Environment.CreateAsync(null, data);
            await view.EnsureCoreWebView2Async(environment);
            if (IsDisposed) return;
            var core = view.CoreWebView2;
            core.Settings.IsStatusBarEnabled = false; core.Settings.AreDefaultContextMenusEnabled = false;
            core.SetVirtualHostNameToFolderMapping("spectral.local", ui, CoreWebView2HostResourceAccessKind.DenyCors);
            core.NavigationStarting += (_,e) => e.Cancel = !WebSecurity.Trusted(e.Uri);
            core.FrameNavigationStarting += (_,e) => e.Cancel = !WebSecurity.Trusted(e.Uri);
            core.NewWindowRequested += (_,e) => e.Handled = true;
            core.PermissionRequested += (_,e) => e.State = CoreWebView2PermissionState.Deny;
            core.AddWebResourceRequestedFilter("*",CoreWebView2WebResourceContext.All);
            core.WebResourceRequested += (_,e) =>
            {
                if (!WebSecurity.Trusted(e.Request.Uri))
                { e.Response=environment.CreateWebResourceResponse(Stream.Null,403,"Local content only","Content-Type: text/plain"); return; }
                if (!new Uri(e.Request.Uri).AbsolutePath.EndsWith(".mjs",StringComparison.OrdinalIgnoreCase)) return;
                string? file=WebSecurity.LocalResource(ui,e.Request.Uri);
                e.Response=file is not null && File.Exists(file)
                    ? environment.CreateWebResourceResponse(File.OpenRead(file),200,"OK","Content-Type: text/javascript; charset=utf-8\r\nX-Content-Type-Options: nosniff")
                    : environment.CreateWebResourceResponse(Stream.Null,404,"Not found","Content-Type: text/plain");
            };
            core.WebMessageReceived += Received;
            core.ProcessFailed += (_,_) => { Ready=false; Changed?.Invoke(this,EventArgs.Empty); Failed?.Invoke("EQ 界面已停止，请重新打开音色器。"); FailSync(); };
            core.Navigate("https://spectral.local/index.html");
        }
        catch(Exception ex) { Failed?.Invoke("EQ 界面未能启动："+ex.Message); }
    }
    internal void SetSampleRate(int value)
    {
        sampleRate=value; Ready=false; Changed?.Invoke(this,EventArgs.Empty);
        if(webReady) Post(new {type="rate",sampleRate});
    }
    internal void ShowSpectrum(FrequencyPoint[] points)=>Post(new {type="analysis",points});
    internal async Task SynchronizeAsync()
    {
        if(!webReady) throw new InvalidOperationException("EQ 还没有准备好。");
        string id=Guid.NewGuid().ToString("N"); var completion=new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        syncing.Add(id,completion); Post(new {type="sync",id});
        try { await completion.Task.WaitAsync(TimeSpan.FromSeconds(20)); }
        finally { syncing.Remove(id); }
    }
    private async void Received(object? sender,CoreWebView2WebMessageReceivedEventArgs e)
    {
        if(!WebSecurity.Trusted(e.Source) || IsDisposed) return;
        try
        {
            if(e.WebMessageAsJson.Length>400000) throw new InvalidDataException("EQ 数据过大。");
            using var json=JsonDocument.Parse(e.WebMessageAsJson); var p=json.RootElement;
            switch(p.GetProperty("type").GetString())
            {
                case "ready": webReady=true; Post(new {type="rate",sampleRate}); break;
                case "play": PlayRequested?.Invoke(this,EventArgs.Empty); break;
                case "pending":
                    if(p.GetProperty("sampleRate").GetInt32()!=sampleRate) break;
                    revision=p.GetProperty("revision").GetInt64(); Ready=false; Changed?.Invoke(this,EventArgs.Empty); break;
                case "kernel":
                    long expected=p.GetProperty("revision").GetInt64(); int rate=p.GetProperty("sampleRate").GetInt32();
                    if(expected!=revision || rate!=sampleRate) break;
                    var array=p.GetProperty("impulse");
                    if(array.GetArrayLength()!=EqKernel.Length) throw new InvalidDataException("EQ 数据长度无效。");
                    float[] impulse=array.EnumerateArray().Select(x=>x.GetSingle()).ToArray();
                    var kernel=await Task.Run(()=>new EqKernel(impulse));
                    if(IsDisposed || expected!=revision || rate!=sampleRate) break;
                    Kernel=kernel; Ready=true; Changed?.Invoke(this,EventArgs.Empty); Post(new {type="applied",revision}); break;
                case "synced":
                    if(Ready && p.GetProperty("revision").GetInt64()==revision && syncing.TryGetValue(p.GetProperty("id").GetString()!,out var waiter)) waiter.TrySetResult(); break;
                case "error": throw new InvalidDataException(p.GetProperty("message").GetString());
            }
        }
        catch(Exception ex) { Ready=false; Changed?.Invoke(this,EventArgs.Empty); Failed?.Invoke("EQ 更新失败："+ex.Message); FailSync(); }
    }
    private void Post(object message) { if(!IsDisposed && view.CoreWebView2 is not null) view.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(message)); }
    private void FailSync() { foreach(var item in syncing.Values) item.TrySetException(new IOException("EQ 未能完成更新。")); }
    protected override void Dispose(bool disposing) { if(disposing) { FailSync(); view.Dispose(); } base.Dispose(disposing); }
}
