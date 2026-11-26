using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System.Runtime.InteropServices;

namespace RootSound.Desktop;

internal sealed class MainWindow : Form
{
    private const string Origin = DesktopResourceRouter.Origin;
    private const int CaptionColorAttribute = 35;
    private const int CaptionTextColorAttribute = 36;
    private const uint DefaultWindowColor = 0xffffffff;
    private const int WindowSizeMessage = 0x0005;
    private const int SettingsChangedMessage = 0x001a;
    private static readonly Color WorkspaceBackground = Color.FromArgb(247, 247, 250);
    private static readonly Color CaptionBackground = Color.FromArgb(250, 250, 253);
    private static readonly Color CaptionInk = Color.FromArgb(51, 46, 60);
    private readonly WebView2 view = new() { Dock = DockStyle.Fill, DefaultBackgroundColor = WorkspaceBackground };
    private readonly ProjectDirectoryManager projects;
    private readonly string dataDirectory;
    private DesktopPointerInput? pointerInput;
    private bool windowActive;
    private bool markedFullscreen;

    public MainWindow(ProjectDirectoryManager projects, string dataDirectory)
    {
        this.projects = projects;
        this.dataDirectory = dataDirectory;
        Text = "RootSound";
        var packagedIcon = Path.Combine(AppContext.BaseDirectory, "icon.ico");
        Icon = File.Exists(packagedIcon) ? new Icon(packagedIcon) : System.Drawing.Icon.ExtractAssociatedIcon(Application.ExecutablePath);
        ClientSize = new Size(1180, 800);
        MinimumSize = new Size(860, 640);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = WorkspaceBackground;
        Controls.Add(view);
        Shown += async (_, _) => await InitializeView();
        FormClosed += (_, _) => { pointerInput?.Dispose(); pointerInput = null; view.Dispose(); };
    }

    [DllImport("dwmapi.dll", ExactSpelling = true)]
    private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attribute, in uint value, int size);

    protected override void OnHandleCreated(EventArgs e)
    {
        base.OnHandleCreated(e);
        UpdateCaptionColors();
    }

    protected override void WndProc(ref Message message)
    {
        pointerInput?.Read(message);
        base.WndProc(ref message);
        if (message.Msg is WindowSizeMessage or SettingsChangedMessage) UpdateTaskbarFullscreen();
    }

    protected override void OnActivated(EventArgs e)
    {
        windowActive = true;
        UpdateTaskbarFullscreen();
        base.OnActivated(e);
    }

    protected override void OnDeactivate(EventArgs e)
    {
        windowActive = false;
        UpdateTaskbarFullscreen();
        pointerInput?.Reset();
        base.OnDeactivate(e);
    }

    protected override void OnHandleDestroyed(EventArgs e)
    {
        windowActive = false;
        markedFullscreen = false;
        base.OnHandleDestroyed(e);
    }

    private void UpdateTaskbarFullscreen()
    {
        if (!IsHandleCreated || Disposing || IsDisposed) return;
        var fullscreen = DesktopTaskbar.ShouldMarkFullscreen(WindowState, windowActive, DesktopTaskbar.AutoHideEnabled);
        if (fullscreen == markedFullscreen) return;
        var previous = markedFullscreen;
        markedFullscreen = fullscreen;
        if (!DesktopTaskbar.TryMarkFullscreen(Handle, fullscreen)) markedFullscreen = previous;
    }

    protected override void OnSystemColorsChanged(EventArgs e)
    {
        base.OnSystemColorsChanged(e);
        UpdateCaptionColors();
    }

    private void UpdateCaptionColors()
    {
        if (!IsHandleCreated || !OperatingSystem.IsWindowsVersionAtLeast(10, 0, 22000)) return;
        var caption = SystemInformation.HighContrast ? DefaultWindowColor : (uint)ColorTranslator.ToWin32(CaptionBackground);
        var text = SystemInformation.HighContrast ? DefaultWindowColor : (uint)ColorTranslator.ToWin32(CaptionInk);
        DwmSetWindowAttribute(Handle, CaptionColorAttribute, in caption, sizeof(uint));
        DwmSetWindowAttribute(Handle, CaptionTextColorAttribute, in text, sizeof(uint));
    }

    private async Task InitializeView()
    {
        try
        {
            var uiDirectory = Path.Combine(AppContext.BaseDirectory, "ui");
            if (!File.Exists(Path.Combine(uiDirectory, "index.html")))
                throw new IOException("缺少界面文件，请重新安装或构建 RootSound。");
            var privateBrowser = Path.Combine(AppContext.BaseDirectory, "webview");
            var environment = await CoreWebView2Environment.CreateAsync(
                File.Exists(Path.Combine(privateBrowser, "msedgewebview2.exe")) ? privateBrowser : null,
                Path.Combine(dataDirectory, "webview"));
            if (IsDisposed) return;
            await view.EnsureCoreWebView2Async(environment);
            if (IsDisposed) return;
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
            core.NavigationStarting += (_, e) =>
            {
                e.Cancel = !Trusted(e.Uri);
            };
            core.FrameNavigationStarting += (_, e) => e.Cancel = !Trusted(e.Uri);
            core.NewWindowRequested += (_, e) => e.Handled = true;
            core.PermissionRequested += (_, e) => e.State = PermissionStateFor(e.Uri, e.PermissionKind);
            core.AddWebResourceRequestedFilter("*", CoreWebView2WebResourceContext.All, CoreWebView2WebResourceRequestSourceKinds.All);
            core.WebResourceRequested += (_, e) =>
            {
                var resource = resources.Open(e.Request.Uri, e.Request.Method, e.Request.Headers.Contains("Range") ? e.Request.Headers.GetHeader("Range") : null);
                e.Response = environment.CreateWebResourceResponse(resource.Content, resource.StatusCode, resource.Reason, resource.Headers);
            };
            pointerInput = new DesktopPointerInput(this, json =>
            {
                if (Trusted(core.Source)) core.PostWebMessageAsJson(json);
            });
            core.Navigate(Origin + "/index.html");
        }
        catch (Exception error)
        {
            if (IsDisposed) return;
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
