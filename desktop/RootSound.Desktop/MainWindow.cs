using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace RootSound.Desktop;

internal sealed class MainWindow : Form
{
    private const string Origin = "https://rootsound.local";
    private readonly WebView2 view = new() { Dock = DockStyle.Fill, DefaultBackgroundColor = Color.FromArgb(20, 23, 21) };
    private readonly AtomicTextStore store;
    private readonly string dataDirectory;

    public MainWindow(AtomicTextStore store, string dataDirectory)
    {
        this.store = store;
        this.dataDirectory = dataDirectory;
        Text = "RootSound";
        ClientSize = new Size(1180, 800);
        MinimumSize = new Size(860, 640);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.FromArgb(20, 23, 21);
        Controls.Add(view);
        Shown += async (_, _) => await InitializeView();
        FormClosed += (_, _) => view.Dispose();
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
            core.AddHostObjectToScript("storage", new NativeStorage(store));
            core.AddHostObjectToScript("files", new NativeSoundFiles(this));
            core.AddHostObjectToScript("audioFiles", new NativeAudioFiles(this));
            core.AddHostObjectToScript("projectFiles", new NativeProjectFiles(this));
            core.AddHostObjectToScript("sampleFiles", new NativeSampleFiles(this));
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
