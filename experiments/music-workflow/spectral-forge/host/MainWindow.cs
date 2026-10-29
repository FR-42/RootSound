using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace RootSound.SpectralForge;

internal sealed class MainWindow : Form
{
    private const string Origin = "https://spectral.local";
    private readonly WebView2 view = new() { Dock = DockStyle.Fill, DefaultBackgroundColor = Color.FromArgb(242, 244, 247) };
    private readonly NativeFiles files;
    private readonly SemaphoreSlim fileGate = new(1, 1);
    private bool dirty;
    private long dirtyGeneration;
    private bool dialogOpen;
    private bool closeRequested;
    private bool approvedClose;
    private bool askingClose;

    internal MainWindow(NativeFiles files)
    {
        this.files = files;
        Text = "RootSound · 精细音色生成器";
        ClientSize = new Size(1420, 940); MinimumSize = new Size(1000, 700);
        StartPosition = FormStartPosition.CenterScreen; BackColor = view.DefaultBackgroundColor;
        Controls.Add(view);
        Shown += async (_, _) => await Initialize();
        FormClosing += OnCloseRequested;
        FormClosed += (_, _) => view.Dispose();
    }

    private async Task Initialize()
    {
        try
        {
            string ui = Path.Combine(AppContext.BaseDirectory, "ui");
            if (!File.Exists(Path.Combine(ui, "index.html"))) throw new IOException("缺少界面文件，请重新构建本实验。");
            string browserData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RootSoundExperiments", "SpectralForge", "webview");
            var environment = await CoreWebView2Environment.CreateAsync(null, browserData);
            await view.EnsureCoreWebView2Async(environment);
            if (IsDisposed || Disposing) return;
            var core = view.CoreWebView2;
            core.Settings.IsStatusBarEnabled = false; core.Settings.AreDefaultContextMenusEnabled = false;
            core.Settings.AreDevToolsEnabled = true;
            core.SetVirtualHostNameToFolderMapping("spectral.local", ui, CoreWebView2HostResourceAccessKind.DenyCors);
            core.NavigationStarting += (_, e) => e.Cancel = !Trusted(e.Uri);
            core.FrameNavigationStarting += (_, e) => e.Cancel = !Trusted(e.Uri);
            core.NewWindowRequested += (_, e) => e.Handled = true;
            core.PermissionRequested += (_, e) => e.State = CoreWebView2PermissionState.Deny;
            core.AddWebResourceRequestedFilter("*", CoreWebView2WebResourceContext.All);
            core.WebResourceRequested += (_, e) =>
            {
                if (!Trusted(e.Request.Uri))
                { e.Response = environment.CreateWebResourceResponse(Stream.Null, 403, "Local content only", "Content-Type: text/plain"); return; }
                // Explicit module MIME avoids machine-dependent .mjs associations.
                if (!new Uri(e.Request.Uri).AbsolutePath.EndsWith(".mjs", StringComparison.OrdinalIgnoreCase)) return;
                string? file = LocalResource(ui, e.Request.Uri);
                if (file is null || !File.Exists(file))
                { e.Response = environment.CreateWebResourceResponse(Stream.Null, 404, "Not found", "Content-Type: text/plain"); return; }
                e.Response = environment.CreateWebResourceResponse(new FileStream(file, FileMode.Open, FileAccess.Read, FileShare.Read), 200, "OK",
                    "Content-Type: text/javascript; charset=utf-8\r\nX-Content-Type-Options: nosniff\r\nCross-Origin-Resource-Policy: same-origin");
            };
            core.WebMessageReceived += Received;
            core.Navigate(Origin + "/index.html");
        }
        catch (Exception error)
        {
            if (IsDisposed || Disposing) return;
            MessageBox.Show(this, "实验界面未能启动：" + error.Message, "精细音色生成器", MessageBoxButtons.OK, MessageBoxIcon.Error);
            approvedClose = true; Close();
        }
    }

    private static bool Trusted(string value) => WebSecurity.Trusted(value);
    private static string? LocalResource(string directory, string url) => WebSecurity.LocalResource(directory, url);

    private void Post(object value)
    {
        if (!IsDisposed && !view.IsDisposed && view.CoreWebView2 is not null)
            view.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(value));
    }

    private async void Received(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        if (!Trusted(e.Source)) return;
        string? id = null;
        try
        {
            BridgeRequest request = BridgeRequest.Parse(e.WebMessageAsJson); id = request.Id;
            object result = await Dispatch(request);
            Post(new { id, ok = true, result });
        }
        catch (Exception error) { Post(new { id, ok = false, error = error.Message }); }
    }

    private async Task<T> FileOperation<T>(Func<T> action)
    {
        await fileGate.WaitAsync();
        try { return await Task.Run(action); }
        finally { fileGate.Release(); }
    }

    private async Task<object> Dispatch(BridgeRequest request)
    {
        switch (request.Method)
        {
            case "getInfo": return new { version = 1, outputDirectory = files.OutputDirectory, patchExtension = ".rssynth" };
            case "setDirty":
                if (!request.Payload.TryGetProperty("dirty", out var value) || value.ValueKind is not (JsonValueKind.True or JsonValueKind.False))
                    throw new InvalidDataException("修改状态无效。");
                dirty = value.GetBoolean(); dirtyGeneration++;
                Text = (dirty ? "* " : "") + "RootSound · 精细音色生成器";
                return new { status = "updated" };
            case "loadRecovery":
                string? recovery = await FileOperation(files.ReadRecovery);
                return recovery is null ? new { status = "empty" } : (object)new { status = "opened", text = recovery };
            case "saveRecovery":
                string text = request.Text("text"); NativeFiles.ValidatePatch(text);
                long recoveryGeneration = dirtyGeneration;
                await fileGate.WaitAsync();
                try
                {
                    if (dirty && recoveryGeneration == dirtyGeneration) await Task.Run(() => files.WriteRecovery(text));
                }
                finally { fileGate.Release(); }
                return new { status = "saved" };
            case "clearRecovery":
                await FileOperation(() => { files.ClearRecovery(); return true; }); return new { status = "cleared" };
            case "openPatch": return await OpenPatch();
            case "savePatch": return await Save(request, false);
            case "exportWav": return await Save(request, true);
            default: throw new InvalidDataException("不支持这个实验操作。");
        }
    }

    private void BeginDialog()
    {
        if (dialogOpen) throw new InvalidOperationException("请先完成当前文件选择。");
        dialogOpen = true;
    }

    private async Task<object> OpenPatch()
    {
        BeginDialog();
        try
        {
            if (dirty && MessageBox.Show(this, "放下当前修改并打开另一个音色？", "打开音色", MessageBoxButtons.OKCancel, MessageBoxIcon.Question) != DialogResult.OK)
                return new { status = "cancelled" };
            using var picker = new OpenFileDialog { Title = "打开音色设置", Filter = "RootSound 精细音色|*.rssynth", InitialDirectory = files.OpenDirectory, RestoreDirectory = true, Multiselect = false, CheckFileExists = true };
            if (picker.ShowDialog(this) != DialogResult.OK) return new { status = "cancelled" };
            string path = picker.FileName;
            string text = await FileOperation(() =>
            {
                files.RememberOpenedFile(path);
                if (!Path.GetExtension(path).Equals(".rssynth", StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("请选择 .rssynth 音色设置。");
                return NativeFiles.ReadPatch(path);
            });
            return new { status = "opened", text, path, name = Path.GetFileName(path) };
        }
        finally { dialogOpen = false; }
    }

    private async Task<object> Save(BridgeRequest request, bool wav)
    {
        byte[] bytes = wav ? await Task.Run(() => NativeFiles.ValidateWavBase64(request.Text("base64"))) : NativeFiles.PatchBytes(request.Text("text"));
        long saveGeneration = dirtyGeneration;
        string extension = wav ? ".wav" : ".rssynth";
        BeginDialog();
        try
        {
            using var picker = new SaveFileDialog { Title = wav ? "导出音色音频" : "保存音色设置", Filter = wav ? "24位 WAV 音频|*.wav" : "RootSound 精细音色|*.rssynth",
                DefaultExt = extension[1..], AddExtension = true, OverwritePrompt = true, CheckPathExists = true,
                InitialDirectory = files.OutputDirectory, FileName = NativeFiles.SuggestedName(request.OptionalText("name"), extension) };
            if (picker.ShowDialog(this) != DialogResult.OK) { if (!wav) closeRequested = false; return new { status = "cancelled" }; }
            string target = picker.FileName;
            if (!Path.GetExtension(target).Equals(extension, StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("请使用 " + extension + " 文件扩展名。");
            byte[]? observed = await Task.Run(() => NativeFiles.Observe(target));
            await FileOperation(() => { NativeFiles.WriteAtomic(target, bytes, observed); return true; });
            if (!wav && saveGeneration == dirtyGeneration)
            {
                // A new edit or recovery write may arrive while file IO is in
                // flight. Do not delete that recovery or mark its editor clean.
                await fileGate.WaitAsync();
                try
                {
                    if (saveGeneration == dirtyGeneration) await Task.Run(files.ClearRecovery);
                }
                finally { fileGate.Release(); }
                if (saveGeneration == dirtyGeneration)
                {
                    // Clear dirty only after cleanup succeeds; otherwise the
                    // frontend receives a failure and still has unsaved edits.
                    dirty = false; Text = "RootSound · 精细音色生成器";
                    if (closeRequested)
                    {
                        closeRequested = false;
                        var timer = new System.Windows.Forms.Timer { Interval = 100 };
                        timer.Tick += (_, _) => { timer.Stop(); timer.Dispose(); if (!dirty && !IsDisposed) { approvedClose = true; Close(); } };
                        timer.Start();
                    }
                }
            }
            return new { status = "saved", path = target, name = Path.GetFileName(target) };
        }
        catch { if (!wav) closeRequested = false; throw; }
        finally { dialogOpen = false; }
    }

    private async void OnCloseRequested(object? sender, FormClosingEventArgs e)
    {
        if (approvedClose || !dirty) { Post(new { @event = "beforeClose" }); return; }
        e.Cancel = true;
        if (askingClose || dialogOpen) return;
        // If the front end could not honor a previous save request, another
        // close gesture must still allow the user to discard or cancel.
        closeRequested = false;
        askingClose = true;
        try
        {
            DialogResult choice = MessageBox.Show(this, "保存当前音色修改后再关闭？", "精细音色生成器", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Question);
            if (choice == DialogResult.Yes) { closeRequested = true; Post(new { @event = "requestSave", reason = "close" }); }
            else if (choice == DialogResult.No)
            {
                await FileOperation(() => { files.ClearRecovery(); return true; });
                approvedClose = true; Close();
            }
        }
        catch (Exception error) { MessageBox.Show(this, error.Message, "暂时无法关闭", MessageBoxButtons.OK, MessageBoxIcon.Error); }
        finally { askingClose = false; }
    }
}
