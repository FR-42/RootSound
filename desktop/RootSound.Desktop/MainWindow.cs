using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System.Text.Json;

namespace RootSound.Desktop;

internal sealed class MainWindow : Form
{
    private const string Origin = DesktopResourceRouter.Origin;
    private readonly WebView2 view = new() { Dock = DockStyle.Fill, DefaultBackgroundColor = Color.FromArgb(250, 251, 253) };
    private readonly ProjectDirectoryManager projects;
    private readonly string dataDirectory;
    private bool closeAccepted;
    private bool preparingClose;

    public MainWindow(ProjectDirectoryManager projects, string dataDirectory)
    {
        this.projects = projects;
        this.dataDirectory = dataDirectory;
        Text = "RootSound";
        Icon = System.Drawing.Icon.ExtractAssociatedIcon(Application.ExecutablePath);
        ClientSize = new Size(1180, 800);
        MinimumSize = new Size(860, 640);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.FromArgb(250, 251, 253);
        Controls.Add(view);
        Shown += async (_, _) => await InitializeView();
        FormClosing += ConfirmWindowClose;
        FormClosed += (_, _) => view.Dispose();
    }

    private async void ConfirmWindowClose(object? sender, FormClosingEventArgs eventArgs)
    {
        if (closeAccepted) return;
        eventArgs.Cancel = true;
        if (preparingClose) return;
        preparingClose = true;
        try
        {
            var preparation = await PrepareWindowClose("check");
            if (!preparation.Ready) throw new IOException(preparation.Message ?? "当前编辑还未准备好，请稍后再关闭。");
            bool dirty = projects.HasUnsavedChanges || !preparation.CanSave;
            DialogResult choice = dirty ? MessageBox.Show(this,
                "当前还有未保存的草稿。\n\n是：保存并关闭\n否：放弃草稿并关闭\n取消：继续编辑",
                "关闭 RootSound", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Question, MessageBoxDefaultButton.Button3) : DialogResult.No;
            if (choice == DialogResult.Cancel) return;
            if (choice == DialogResult.Yes)
            {
                var save = await PrepareWindowClose("save");
                if (!save.Ready || !save.CanSave) throw new IOException(save.SaveMessage ?? save.Message ?? "请先完成或放弃正在编辑的音乐，再保存歌曲。");
                projects.Save(save.Name);
            }
            projects.Exit("discard");
            closeAccepted = true; Close();
        }
        catch (Exception error)
        {
            if (!IsDisposed && !Disposing) MessageBox.Show(this, "暂时无法关闭：" + error.Message, "RootSound", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
        finally { preparingClose = false; }
    }

    private async Task<ClosePreparation> PrepareWindowClose(string mode)
    {
        if (projects.Current is null) return new(true, null, true, null, null);
        var core = view.CoreWebView2 ?? throw new IOException("界面仍在准备中，请稍后再试。");
        string id = Guid.NewGuid().ToString("N");
        // ExecuteScriptAsync does not await a JavaScript Promise. Keep this
        // handshake scoped to one request and poll its completed JSON result.
        string request = JsonSerializer.Serialize(id);
        await core.ExecuteScriptAsync("(() => { const id = " + request + "; globalThis.__rootSoundCloseHandshake = { id, result: null }; Promise.resolve().then(() => { if (typeof globalThis.__rootSoundPrepareClose !== 'function') throw new Error('界面仍在准备中，请稍后再试。'); return globalThis.__rootSoundPrepareClose(" + JsonSerializer.Serialize(mode) + "); }).then(result => { if (globalThis.__rootSoundCloseHandshake?.id === id) globalThis.__rootSoundCloseHandshake.result = result; }, error => { if (globalThis.__rootSoundCloseHandshake?.id === id) globalThis.__rootSoundCloseHandshake.result = { ready: false, message: error?.message ?? String(error) }; }); })()");
        var deadline = DateTime.UtcNow.AddSeconds(30);
        while (DateTime.UtcNow < deadline)
        {
            await Task.Delay(25);
            string json = await core.ExecuteScriptAsync("globalThis.__rootSoundCloseHandshake?.id === " + request + " ? globalThis.__rootSoundCloseHandshake.result : null");
            if (json is "null" or "undefined") continue;
            return ParseClosePreparation(json);
        }
        throw new IOException("等待当前编辑完成超时，草稿仍在窗口中，请重试。");
    }

    internal sealed record ClosePreparation(bool Ready, string? Name, bool CanSave, string? Message, string? SaveMessage);
    internal static ClosePreparation ParseClosePreparation(string json)
    {
        using var document = JsonDocument.Parse(json); var root = document.RootElement;
        if (root.ValueKind != JsonValueKind.Object || !root.TryGetProperty("ready", out var ready) || ready.ValueKind is not (JsonValueKind.True or JsonValueKind.False))
            throw new IOException("关闭准备返回无效结果，草稿仍保留。");
        string? Text(string key) => root.TryGetProperty(key, out var item) && item.ValueKind == JsonValueKind.String ? item.GetString() : null;
        bool canSave = root.TryGetProperty("canSave", out var value) && value.ValueKind == JsonValueKind.True;
        return new(ready.GetBoolean(), Text("name"), canSave, Text("message"), Text("saveMessage"));
    }

    private async Task InitializeView()
    {
        try
        {
            var uiDirectory = Path.Combine(AppContext.BaseDirectory, "ui");
            if (!File.Exists(Path.Combine(uiDirectory, "index.html")))
                throw new IOException("缺少界面文件，请重新安装或构建 RootSound。");
            var environment = await CoreWebView2Environment.CreateAsync(null, Path.Combine(dataDirectory, "webview"));
            await view.EnsureCoreWebView2Async(environment);
            var core = view.CoreWebView2;
            core.Settings.IsStatusBarEnabled = false;
            core.Settings.AreDefaultContextMenusEnabled = false;
            var resources = new DesktopResourceRouter(uiDirectory, projects.OpenPayloadStream);
            core.AddHostObjectToScript("storage", new NativeStorage(projects));
            core.AddHostObjectToScript("projectDirectories", new NativeProjectDirectories(this, projects));
            core.AddHostObjectToScript("files", new NativeSoundFiles(this, projects));
            core.AddHostObjectToScript("audioFiles", new NativeAudioFiles(this));
            core.AddHostObjectToScript("projectFiles", new NativeProjectFiles(this, projects));
            core.AddHostObjectToScript("sampleFiles", new NativeSampleFiles(this));
            core.AddHostObjectToScript("timbreFiles", new NativeTimbreFiles(this, projects, dataDirectory));
            core.NavigationStarting += (_, e) => e.Cancel = !Trusted(e.Uri);
            core.FrameNavigationStarting += (_, e) => e.Cancel = !Trusted(e.Uri);
            core.NewWindowRequested += (_, e) => e.Handled = true;
            core.PermissionRequested += (_, e) => e.State = PermissionStateFor(e.Uri, e.PermissionKind);
            core.AddWebResourceRequestedFilter("*", CoreWebView2WebResourceContext.All, CoreWebView2WebResourceRequestSourceKinds.All);
            core.WebResourceRequested += (_, e) =>
            {
                var resource = resources.Open(e.Request.Uri, e.Request.Method, e.Request.Headers.Contains("Range") ? e.Request.Headers.GetHeader("Range") : null);
                e.Response = environment.CreateWebResourceResponse(resource.Content, resource.StatusCode, resource.Reason, resource.Headers);
            };
            core.Navigate(Origin + "/index.html");
        }
        catch (Exception error)
        {
            MessageBox.Show(this, "桌面界面未能启动：" + error.Message, "RootSound", MessageBoxButtons.OK, MessageBoxIcon.Error);
            Close();
        }
    }

    private static bool Trusted(string value) => DesktopResourceRouter.TrustedOrigin(value);

    internal static string? PayloadTokenFor(string value)
    {
        return DesktopResourceRouter.PayloadTokenFor(value);
    }

    // Default delegates the trusted microphone request to WebView2's ordinary
    // user prompt. This never grants access without the user's decision.
    internal static CoreWebView2PermissionState PermissionStateFor(string uri, CoreWebView2PermissionKind kind) =>
        Trusted(uri) && kind == CoreWebView2PermissionKind.Microphone ? CoreWebView2PermissionState.Default : CoreWebView2PermissionState.Deny;
}
