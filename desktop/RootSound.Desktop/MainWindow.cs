using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text.Json;

namespace RootSound.Desktop;

internal sealed class MainWindow : Form
{
    private const string Origin = DesktopResourceRouter.Origin;
    private const int CaptionColorAttribute = 35;
    private const int CaptionTextColorAttribute = 36;
    private const uint DefaultWindowColor = 0xffffffff;
    private const int CalculateClientRectangle = 0x0083;
    private const uint NonClientButtonDown = 0x00A1;
    private const int CaptionHit = 2;
    private static readonly TimeSpan CloseScriptTimeout = TimeSpan.FromSeconds(3);
    private static readonly TimeSpan CloseWorkTimeout = TimeSpan.FromSeconds(8);
    private static readonly Color WorkspaceBackground = Color.FromArgb(251, 233, 218);
    private static readonly Color CaptionBackground = Color.FromArgb(255, 240, 223);
    private static readonly Color CaptionInk = Color.FromArgb(66, 43, 52);
    private readonly WebView2 view = new() { Dock = DockStyle.Fill, DefaultBackgroundColor = WorkspaceBackground };
    private readonly bool useClientCaption = !SystemInformation.HighContrast;
    private readonly Panel captionBar = new() { Visible = false, BackColor = CaptionBackground };
    private readonly ProjectDirectoryManager projects;
    private readonly string dataDirectory;
    private bool closeAccepted;
    private bool preparingClose;
    private DesktopPointerInput? pointerInput;
    private readonly WindowCaptionVisibility captionVisibility = new();
    internal bool CaptionRevealed => captionVisibility.Visible;

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
        if (useClientCaption) CreateCaptionBar();
        Shown += async (_, _) => await InitializeView();
        FormClosing += ConfirmWindowClose;
        FormClosed += (_, _) => { pointerInput?.Dispose(); pointerInput = null; view.Dispose(); };
    }

    [DllImport("dwmapi.dll", ExactSpelling = true)]
    private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attribute, in uint value, int size);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool ReleaseCapture();

    [DllImport("user32.dll", ExactSpelling = true)]
    private static extern IntPtr SendMessageW(IntPtr hwnd, uint message, IntPtr wParam, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    private struct WindowRectangle { public int Left, Top, Right, Bottom; }

    private void CreateCaptionBar()
    {
        captionBar.Size = new Size(ClientSize.Width, LogicalToDeviceUnits(32));
        captionBar.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
        captionBar.Font = new Font("Segoe MDL2 Assets", 10);
        void ToggleMaximized() => WindowState = WindowState == FormWindowState.Maximized ? FormWindowState.Normal : FormWindowState.Maximized;
        var minimize = CaptionButton("\uE921", "最小化", () => WindowState = FormWindowState.Minimized);
        var maximize = CaptionButton("\uE922", "最大化", ToggleMaximized);
        var close = CaptionButton("\uE8BB", "关闭", Close);
        Resize += (_, _) =>
        {
            bool maximized = WindowState == FormWindowState.Maximized;
            maximize.Text = maximized ? "\uE923" : "\uE922";
            maximize.AccessibleName = maximized ? "还原" : "最大化";
        };
        captionBar.Controls.AddRange([minimize, maximize, close]);
        captionBar.MouseDown += (_, args) =>
        {
            if (args.Button != MouseButtons.Left) return;
            if (args.Clicks == 2) { ToggleMaximized(); return; }
            ReleaseCapture();
            SendMessageW(Handle, NonClientButtonDown, new IntPtr(CaptionHit), IntPtr.Zero);
        };
        Controls.Add(captionBar);
        captionBar.BringToFront();
    }

    private Button CaptionButton(string glyph, string name, Action activate)
    {
        var button = new Button
        {
            Text = glyph, AccessibleName = name, FlatStyle = FlatStyle.Flat, ForeColor = CaptionInk,
            Dock = DockStyle.Right, Width = LogicalToDeviceUnits(46), UseVisualStyleBackColor = false
        };
        button.FlatAppearance.BorderSize = 0;
        button.Click += (_, _) => activate();
        return button;
    }

    internal void UpdateCaption(Point pointer, Rectangle client)
    {
        if (!useClientCaption) return;
        bool wasVisible = captionVisibility.Visible;
        bool visible = captionVisibility.Update(pointer, client, captionBar.Height, LogicalToDeviceUnits(8), SystemInformation.FrameBorderSize.Height);
        if (wasVisible == visible) return;
        captionBar.Visible = visible;
        if (visible) captionBar.BringToFront();
    }

    protected override void OnHandleCreated(EventArgs e)
    {
        base.OnHandleCreated(e);
        UpdateCaptionColors();
    }

    protected override void WndProc(ref Message message)
    {
        pointerInput?.Read(message);
        if (useClientCaption && message.Msg == CalculateClientRectangle && message.LParam != IntPtr.Zero)
        {
            var window = Marshal.PtrToStructure<WindowRectangle>(message.LParam);
            base.WndProc(ref message);
            var client = Marshal.PtrToStructure<WindowRectangle>(message.LParam);
            client.Top = Math.Min(client.Bottom, window.Top + Math.Max(0, window.Bottom - client.Bottom));
            Marshal.StructureToPtr(client, message.LParam, false);
            message.Result = IntPtr.Zero;
            return;
        }
        base.WndProc(ref message);
    }

    protected override void OnDeactivate(EventArgs e)
    {
        captionVisibility.Reset();
        if (useClientCaption) captionBar.Visible = false;
        pointerInput?.Reset();
        base.OnDeactivate(e);
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

    private async void ConfirmWindowClose(object? sender, FormClosingEventArgs eventArgs)
    {
        if (closeAccepted) return;
        eventArgs.Cancel = true;
        if (preparingClose) return;
        preparingClose = true;
        try
        {
            try
            {
                if (!await CanCloseProject(projects, PrepareWindowClose)) return;
            }
            catch (Exception error)
            {
                if (IsDisposed || Disposing || !ConfirmCloseAfterFailure(error)) return;
            }
            closeAccepted = true; Close();
        }
        finally { preparingClose = false; }
    }

    internal static async Task<bool> CanCloseProject(ProjectDirectoryManager projects, Func<string, Task<ClosePreparation>> prepare)
    {
        if (!await Task.Run(() => projects.Current is not null).WaitAsync(CloseWorkTimeout)) return true;
        var preparation = await prepare("check");
        bool dirty = await Task.Run(() => projects.HasUnsavedChanges).WaitAsync(CloseWorkTimeout);
        if (preparation.StartupFailed && !dirty) return true;
        if (!preparation.Ready || !preparation.CanSave)
            throw new IOException(preparation.SaveMessage ?? preparation.Message ?? "当前编辑尚未准备好。");
        if (!dirty) return true;
        var choice = await prepare("save");
        if (choice.Cancelled) return false;
        if (!choice.Ready || !choice.CanSave)
            throw new IOException(choice.SaveMessage ?? choice.Message ?? "当前修改尚未保存。");
        if (!choice.Saved && !choice.Discarded)
            await Task.Run(() => projects.Save(choice.Name, renameFile: false)).WaitAsync(CloseWorkTimeout);
        return true;
    }

    private bool ConfirmCloseAfterFailure(Exception error)
    {
        var exit = new TaskDialogButton("直接退出");
        var back = new TaskDialogButton("返回");
        return TaskDialog.ShowDialog(this, new TaskDialogPage
        {
            Caption = "RootSound",
            Heading = "直接退出？",
            Text = (error is TimeoutException ? "编辑器或工程服务未及时响应。" : error.Message) + "\n\n直接退出可能丢失未保存的修改。",
            AllowCancel = true,
            DefaultButton = back,
            Buttons = { back, exit },
        }) == exit;
    }

    private async Task<ClosePreparation> PrepareWindowClose(string mode)
    {
        var core = view.CoreWebView2 ?? throw new IOException("编辑器尚未就绪。");
        string request = JsonSerializer.Serialize(Guid.NewGuid().ToString("N"));
        try
        {
            string started = await core.ExecuteScriptAsync($"globalThis.__rootSoundClose?.begin({request}, {JsonSerializer.Serialize(mode)})")
                .WaitAsync(CloseScriptTimeout);
            if (started != "true") throw new IOException("编辑器尚未就绪。");
            var working = Stopwatch.StartNew();
            while (!IsDisposed)
            {
                string json = await core.ExecuteScriptAsync($"globalThis.__rootSoundClose?.read({request})").WaitAsync(CloseScriptTimeout);
                using var document = JsonDocument.Parse(json);
                var state = document.RootElement;
                if (state.ValueKind != JsonValueKind.Object) throw new IOException("编辑器已切换，退出请求已中断。");
                if (state.TryGetProperty("result", out var result) && result.ValueKind != JsonValueKind.Null)
                    return ParseClosePreparation(result.GetRawText());
                if (mode == "save" && state.TryGetProperty("awaitingChoice", out var waiting) && waiting.ValueKind == JsonValueKind.True)
                    working.Restart();
                if (working.Elapsed >= CloseWorkTimeout) throw new TimeoutException();
                await Task.Delay(100);
            }
            throw new ObjectDisposedException(nameof(MainWindow));
        }
        finally
        {
            try { await core.ExecuteScriptAsync($"globalThis.__rootSoundClose?.cancel({request})").WaitAsync(TimeSpan.FromMilliseconds(500)); }
            catch (Exception) { }
        }
    }

    internal sealed record ClosePreparation(bool Ready, string? Name, bool CanSave, string? Message, string? SaveMessage,
        bool Saved = false, bool Cancelled = false, bool Discarded = false, bool StartupFailed = false);
    internal static ClosePreparation ParseClosePreparation(string json)
    {
        using var document = JsonDocument.Parse(json); var root = document.RootElement;
        if (root.ValueKind != JsonValueKind.Object || !root.TryGetProperty("ready", out var ready) || ready.ValueKind is not (JsonValueKind.True or JsonValueKind.False))
            throw new IOException("关闭准备返回无效结果，草稿仍保留。");
        string? Text(string key) => root.TryGetProperty(key, out var item) && item.ValueKind == JsonValueKind.String ? item.GetString() : null;
        bool canSave = root.TryGetProperty("canSave", out var value) && value.ValueKind == JsonValueKind.True;
        bool Flag(string key) => root.TryGetProperty(key, out var flag) && flag.ValueKind == JsonValueKind.True;
        return new(ready.GetBoolean(), Text("name"), canSave, Text("message"), Text("saveMessage"), Flag("saved"), Flag("cancelled"), Flag("discarded"), Flag("startupFailed"));
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
            }, UpdateCaption);
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
