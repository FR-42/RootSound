using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System.Text.Json;

namespace RootSound.Desktop;

internal sealed class MainWindow : Form
{
    private const string Origin = "https://rootsound.local";
    private readonly WebView2 view = new() { Dock = DockStyle.Fill, DefaultBackgroundColor = Color.FromArgb(20, 23, 21) };
    private readonly ProjectDirectoryManager projects;
    private readonly string dataDirectory;
    private bool closeAccepted;
    private bool preparingClose;

    public MainWindow(ProjectDirectoryManager projects, string dataDirectory)
    {
        this.projects = projects;
        this.dataDirectory = dataDirectory;
        Text = "RootSound";
        ClientSize = new Size(1180, 800);
        MinimumSize = new Size(860, 640);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.FromArgb(20, 23, 21);
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
            var preparation = await PrepareWindowClose();
            if (!preparation.Ready) throw new IOException(preparation.Message ?? "当前编辑还未准备好，请稍后再关闭。");
            bool dirty = projects.HasUnsavedChanges || !preparation.CanSave;
            DialogResult choice = dirty ? MessageBox.Show(this,
                "当前还有未保存的草稿。\n\n是：保存并关闭\n否：放弃草稿并关闭\n取消：继续编辑",
                "关闭 RootSound", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Question, MessageBoxDefaultButton.Button3) : DialogResult.No;
            if (choice == DialogResult.Cancel) return;
            if (choice == DialogResult.Yes)
            {
                if (!preparation.CanSave) throw new IOException(preparation.SaveMessage ?? "请先完成或放弃正在编辑的乐句，再保存歌曲。");
                projects.Save(preparation.Name);
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

    private async Task<ClosePreparation> PrepareWindowClose()
    {
        if (projects.Current is null) return new(true, null, true, null, null);
        var core = view.CoreWebView2 ?? throw new IOException("界面仍在准备中，请稍后再试。");
        string id = Guid.NewGuid().ToString("N");
        // ExecuteScriptAsync does not await a JavaScript Promise. Keep this
        // handshake scoped to one request and poll its completed JSON result.
        string request = JsonSerializer.Serialize(id);
        await core.ExecuteScriptAsync("(() => { const id = " + request + "; globalThis.__rootSoundCloseHandshake = { id, result: null }; Promise.resolve().then(() => { if (typeof globalThis.__rootSoundPrepareClose !== 'function') throw new Error('界面仍在准备中，请稍后再试。'); return globalThis.__rootSoundPrepareClose(); }).then(result => { if (globalThis.__rootSoundCloseHandshake?.id === id) globalThis.__rootSoundCloseHandshake.result = result; }, error => { if (globalThis.__rootSoundCloseHandshake?.id === id) globalThis.__rootSoundCloseHandshake.result = { ready: false, message: error?.message ?? String(error) }; }); })()");
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
                throw new IOException("缺少界面文件。请从项目根目录重新运行 RootSound.bat。");
            var environment = await CoreWebView2Environment.CreateAsync(null, Path.Combine(dataDirectory, "webview"));
            await view.EnsureCoreWebView2Async(environment);
            var core = view.CoreWebView2;
            core.Settings.IsStatusBarEnabled = false;
            core.Settings.AreDefaultContextMenusEnabled = false;
            core.SetVirtualHostNameToFolderMapping("rootsound.local", uiDirectory, CoreWebView2HostResourceAccessKind.DenyCors);
            core.AddHostObjectToScript("storage", new NativeStorage(projects));
            core.AddHostObjectToScript("projectDirectories", new NativeProjectDirectories(this, projects));
            core.AddHostObjectToScript("files", new NativeSoundFiles(this));
            core.AddHostObjectToScript("audioFiles", new NativeAudioFiles(this));
            core.AddHostObjectToScript("projectFiles", new NativeProjectFiles(this));
            core.AddHostObjectToScript("sampleFiles", new NativeSampleFiles(this));
            core.AddHostObjectToScript("timbreFiles", new NativeTimbreFiles(this, projects, dataDirectory));
            core.NavigationStarting += (_, e) => e.Cancel = !Trusted(e.Uri);
            core.FrameNavigationStarting += (_, e) => e.Cancel = !Trusted(e.Uri);
            core.NewWindowRequested += (_, e) => e.Handled = true;
            core.PermissionRequested += (_, e) => e.State = PermissionStateFor(e.Uri, e.PermissionKind);
            core.AddWebResourceRequestedFilter("*", CoreWebView2WebResourceContext.All);
            core.WebResourceRequested += (_, e) =>
            {
                if (!Trusted(e.Request.Uri))
                    e.Response = environment.CreateWebResourceResponse(Stream.Null, 403, "Local content only", "Content-Type: text/plain");
            };
            core.Navigate(Origin + "/index.html");
        }
        catch (Exception error)
        {
            MessageBox.Show(this, "桌面界面未能启动：" + error.Message, "RootSound", MessageBoxButtons.OK, MessageBoxIcon.Error);
            Close();
        }
    }

    private static bool Trusted(string value) => Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && uri.Scheme == Uri.UriSchemeHttps && uri.Host == "rootsound.local" && uri.IsDefaultPort;

    // Default delegates the trusted microphone request to WebView2's ordinary
    // user prompt. This never grants access without the user's decision.
    internal static CoreWebView2PermissionState PermissionStateFor(string uri, CoreWebView2PermissionKind kind) =>
        Trusted(uri) && kind == CoreWebView2PermissionKind.Microphone ? CoreWebView2PermissionState.Default : CoreWebView2PermissionState.Deny;
}
