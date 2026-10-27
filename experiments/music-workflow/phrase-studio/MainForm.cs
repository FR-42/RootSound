using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Persistence;
using RootSound.PhraseStudio.UI;

namespace RootSound.PhraseStudio;

internal sealed class MainForm : Form
{
    private readonly WorkspaceRegistry registry;
    private readonly TabControl tabs = new() { Dock = DockStyle.Fill, DrawMode = TabDrawMode.OwnerDrawFixed, Padding = new Point(16, 6) };
    private readonly ToolStrip toolbar = new() { GripStyle = ToolStripGripStyle.Hidden, Padding = new Padding(8, 4, 8, 4) };
    private readonly ToolStripButton create = new("新建乐句");
    private readonly ToolStripButton open = new("从上一个乐句开始");
    private readonly ToolStripButton save = new("保存");
    private readonly ToolStripButton saveAs = new("另存为");
    private readonly ToolStripButton undo = new("撤销");
    private readonly ToolStripButton redo = new("重做");
    private readonly ToolStripButton closePane = new("关闭乐句");
    private readonly ToolStripButton restore = new("恢复上次工作") { Visible = false };
    private readonly ToolStripButton cancel = new("取消操作") { Enabled = false };
    private readonly ToolStripStatusLabel status = new() { Spring = true, TextAlign = ContentAlignment.MiddleLeft };
    private readonly System.Windows.Forms.Timer timer = new() { Interval = 50 };
    private readonly List<PaneEntry> entries = new();
    private readonly HashSet<Guid> knownIds = new();
    private CancellationTokenSource? operationCancellation;
    private Task operationTask = Task.CompletedTask;
    private bool busy, closing, allowClose, shown;
    private string? initializationError;
    private PaneEntry? Active => entries.FirstOrDefault(entry => ReferenceEquals(entry.Page, tabs.SelectedTab));

    internal MainForm(string? isolatedRoot = null)
    {
        registry = new WorkspaceRegistry(isolatedRoot);
        Text = "乐句谱写"; ClientSize = new Size(1400, 800); MinimumSize = new Size(900, 540);
        BackColor = UiTheme.Background; ForeColor = UiTheme.Foreground;
        StartPosition = FormStartPosition.CenterScreen; Font = new Font("Microsoft YaHei UI", 9);
        KeyPreview = true; AutoScaleMode = AutoScaleMode.Dpi;
        toolbar.Items.AddRange(new ToolStripItem[] { create, open, new ToolStripSeparator(), save, saveAs,
            new ToolStripSeparator(), undo, redo, new ToolStripSeparator(), closePane,
            new ToolStripSeparator(), restore, cancel });
        toolbar.Dock = DockStyle.Top; toolbar.BackColor = UiTheme.Panel; toolbar.ForeColor = UiTheme.Foreground;
        var statusBar = new StatusStrip { SizingGrip = false, BackColor = UiTheme.Panel, ForeColor = UiTheme.Muted }; statusBar.Items.Add(status);
        var workspace = new Panel { Dock = DockStyle.Fill, BackColor = UiTheme.Background };
        workspace.Controls.Add(tabs);
        Controls.Add(workspace); Controls.Add(statusBar); Controls.Add(toolbar);
        tabs.DrawItem += (_, args) =>
        {
            bool selected = args.Index == tabs.SelectedIndex;
            using var brush = new SolidBrush(selected ? UiTheme.Panel : UiTheme.Background);
            args.Graphics.FillRectangle(brush, args.Bounds);
            TextRenderer.DrawText(args.Graphics, tabs.TabPages[args.Index].Text, Font, args.Bounds,
                selected ? UiTheme.Foreground : UiTheme.Muted, TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);
        };
        create.Click += (_, _) => NewPhrase(); open.Click += (_, _) => OpenPhrase();
        save.Click += (_, _) => SavePhrase(false); saveAs.Click += (_, _) => SavePhrase(true);
        undo.Click += (_, _) => { Active?.Pane.Undo(); UpdateState(); };
        redo.Click += (_, _) => { Active?.Pane.Redo(); UpdateState(); };
        closePane.Click += (_, _) => { if (Active is { } entry) RunOperation(token => ClosePaneAsync(entry, token)); };
        restore.Click += (_, _) => RunOperation(RestoreAsync);
        cancel.Click += (_, _) => operationCancellation?.Cancel();
        tabs.SelectedIndexChanged += (_, _) =>
        {
            foreach (var entry in entries) if (!entry.Disposing && !entry.Pane.IsDisposed && !ReferenceEquals(entry, Active)) entry.Pane.Deactivate();
            UpdateState();
        };
        timer.Tick += (_, _) =>
        {
            foreach (var entry in entries.ToArray()) if (!entry.Disposing && !entry.Pane.IsDisposed) entry.Pane.Poll();
            UpdateState();
        };
        UiTheme.Apply(this); UpdateState();
    }

    protected override void OnShown(EventArgs e)
    {
        base.OnShown(e); if (shown) return; shown = true; timer.Start();
        RunOperation(async token =>
        {
            try
            {
                var ids = await Task.Run(registry.ReadIndex, token);
                foreach (Guid id in ids) knownIds.Add(id);
                initializationError = null;
            }
            catch (Exception ex) when (ex is IOException or InvalidDataException or UnauthorizedAccessException)
            {
                // Preserve the unreadable index; new drafts must not silently replace it.
                initializationError = ex.Message; throw;
            }
        });
    }

    private void NewPhrase()
    {
        if (busy || closing) return;
        string? name = NamePrompt.Ask(this, "新建乐句", "新乐句"); if (name is null) return;
        RunOperation(token => AddPaneAsync(PhraseFactory.New(name), Guid.NewGuid(), null, null, false, token));
    }

    private void OpenPhrase()
    {
        if (busy || closing) return;
        using var dialog = new OpenFileDialog { Title = "从上一个乐句开始", Filter = "RootSound 乐句 (*.rsphrase)|*.rsphrase",
            CheckFileExists = true, Multiselect = false };
        if (dialog.ShowDialog(this) != DialogResult.OK) return;
        string path = Path.GetFullPath(dialog.FileName);
        RunOperation(async token =>
        {
            var document = await PhraseArchive.LoadAsync(path, token);
            string hash = await PhraseArchive.FileHashAsync(path, token);
            await AddPaneAsync(document, Guid.NewGuid(), path, hash, false, token);
        });
    }

    private void SavePhrase(bool asNewFile)
    {
        if (busy || closing || Active is not { } entry) return;
        RunOperation(async token =>
        {
            if (await entry.Pane.SaveFileAsync(asNewFile, this, token)) UpdateState();
        });
    }

    private async Task AddPaneAsync(PhraseDocument document, Guid workspaceId, string? savedPath,
        string? savedHash, bool restored, CancellationToken token)
    {
        if (initializationError is not null) throw new IOException("上次工作记录尚未恢复正常，为保护原记录，暂时不能新建工作区。 " + initializationError);
        if (entries.Count >= WorkspaceRegistry.MaximumPanes) throw new InvalidOperationException("同时打开的乐句过多，请先关闭部分乐句。 ");
        var pane = new PhrasePane(document, registry.Store(workspaceId), RunOperation, savedPath, savedHash, restored) { Dock = DockStyle.Fill };
        try
        {
            await pane.FlushDraftAsync(token);
            var next = knownIds.Append(workspaceId).Distinct().ToArray();
            await Task.Run(() => registry.WriteIndex(next, token), token);
            token.ThrowIfCancellationRequested();
            var page = new TabPage(document.Name) { Padding = new Padding(0), BackColor = UiTheme.Background };
            var entry = new PaneEntry(workspaceId, pane, page); page.Controls.Add(pane);
            entries.Add(entry); knownIds.Add(workspaceId);
            pane.Changed += UpdateState; tabs.TabPages.Add(page); tabs.SelectedTab = page;
            UpdateState();
        }
        catch { await pane.DisposeAsync(); pane.Dispose(); throw; }
    }

    private async Task RestoreAsync(CancellationToken token)
    {
        Guid[] ids = knownIds.Where(id => entries.All(entry => entry.Id != id)).ToArray();
        List<string> errors = new();
        foreach (Guid id in ids)
        {
            token.ThrowIfCancellationRequested();
            try
            {
                DraftState? state = await registry.Store(id).LoadStateAsync(token);
                if (state is null) { knownIds.Remove(id); continue; }
                await AddPaneAsync(state.Document, id, state.SavedPath, state.SavedSha256, true, token);
            }
            catch (OperationCanceledException) { throw; }
            catch (Exception ex) { errors.Add(id.ToString("N")[..8] + "：" + ex.Message); }
        }
        await Task.Run(() => registry.WriteIndex(knownIds.ToArray(), token), token);
        if (errors.Count > 0) throw new IOException("部分乐句没有恢复；原稿仍保留，可再次尝试。\n" + string.Join("\n", errors));
    }

    private async Task ClosePaneAsync(PaneEntry entry, CancellationToken token)
    {
        if (entry.Pane.IsDirty)
        {
            DialogResult choice = MessageBox.Show(this, $"保存“{entry.Pane.Document.Name}”的修改吗？\n选择“否”将放弃这份工作区稿。",
                "关闭乐句", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Question);
            if (choice == DialogResult.Cancel) return;
            if (choice == DialogResult.Yes && !await entry.Pane.SaveFileAsync(false, this, token)) return;
        }
        token.ThrowIfCancellationRequested();
        var next = knownIds.Where(id => id != entry.Id).ToArray();
        await Task.Run(() => registry.WriteIndex(next, token), token);
        entry.Disposing = true;
        try
        {
            entry.Pane.Deactivate(); await entry.Pane.DisposeAsync(); entry.Pane.DiscardDraft();
        }
        catch
        {
            // If releasing the editor or clearing its draft fails, retain its recovery entry.
            entry.Disposing = false;
            await Task.Run(() => registry.WriteIndex(knownIds.ToArray()));
            throw;
        }
        entry.Pane.Changed -= UpdateState; entries.Remove(entry); knownIds.Remove(entry.Id);
        tabs.TabPages.Remove(entry.Page); entry.Page.Dispose(); UpdateState();
    }

    private void RunOperation(Func<CancellationToken, Task> operation)
    {
        if (busy || closing) return;
        operationTask = RunOperationAsync(operation);
    }

    private async Task RunOperationAsync(Func<CancellationToken, Task> operation)
    {
        busy = true; var pane = Active?.Pane; if (pane is not null) pane.Enabled = false;
        using var cancellation = new CancellationTokenSource(); operationCancellation = cancellation; UpdateState();
        try { await operation(cancellation.Token); }
        catch (OperationCanceledException) { if (!closing) status.Text = "已取消"; }
        catch (Exception ex)
        {
            if (!closing) MessageBox.Show(this, ex.Message, "暂时无法完成这个操作", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        finally
        {
            operationCancellation = null; busy = false;
            if (pane is not null && !pane.IsDisposed) pane.Enabled = true;
            UpdateState();
        }
    }

    private void UpdateState()
    {
        if (IsDisposed) return;
        tabs.Visible = entries.Count > 0;
        var pane = Active?.Pane;
        foreach (var entry in entries)
        {
            string title = entry.Pane.Document.Name + (entry.Pane.IsDirty ? " *" : "");
            if (entry.Page.Text != title) entry.Page.Text = title;
        }
        create.Enabled = open.Enabled = !busy && !closing && initializationError is null;
        save.Enabled = !busy && !closing && pane?.CanSave == true;
        saveAs.Visible = pane?.SavedPath is not null;
        saveAs.Enabled = !busy && !closing && pane?.CanSave == true;
        undo.Enabled = !busy && !closing && pane?.CanUndo == true;
        redo.Enabled = !busy && !closing && pane?.CanRedo == true;
        closePane.Enabled = !busy && !closing && pane is not null;
        restore.Visible = knownIds.Any(id => entries.All(entry => entry.Id != id));
        restore.Enabled = !busy && !closing && initializationError is null;
        cancel.Enabled = busy && !closing;
        status.Text = initializationError is not null ? "工作区记录读取失败，原记录已保留" :
            closing ? "正在保留工作区…" : pane?.Status ?? (busy ? "正在处理…" : "");
    }

    protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
    {
        if (!busy && !closing)
        {
            Control? focus = FocusedLeaf(this);
            if ((keyData == (Keys.Control | Keys.Z) || keyData == (Keys.Control | Keys.Y)) && focus is TextBoxBase)
                return base.ProcessCmdKey(ref msg, keyData);
            if (keyData == Keys.Space && focus is not (TextBoxBase or ComboBox or UpDownBase))
            { Active?.Pane.TogglePlayback(); return true; }
            if (keyData == (Keys.Control | Keys.N)) { NewPhrase(); return true; }
            if (keyData == (Keys.Control | Keys.O)) { OpenPhrase(); return true; }
            if (keyData == (Keys.Control | Keys.S)) { SavePhrase(false); return true; }
            if (keyData == (Keys.Control | Keys.Shift | Keys.S)) { SavePhrase(true); return true; }
            if (keyData == (Keys.Control | Keys.Z)) { Active?.Pane.Undo(); UpdateState(); return true; }
            if (keyData == (Keys.Control | Keys.Y)) { Active?.Pane.Redo(); UpdateState(); return true; }
        }
        if (keyData == Keys.Escape && busy) { operationCancellation?.Cancel(); return true; }
        return base.ProcessCmdKey(ref msg, keyData);
    }

    private static Control? FocusedLeaf(Control parent)
    {
        Control current = parent;
        while (current.Controls.Cast<Control>().FirstOrDefault(control => control.ContainsFocus) is { } child) current = child;
        return current.ContainsFocus ? current : null;
    }

    protected override async void OnFormClosing(FormClosingEventArgs e)
    {
        if (allowClose) { base.OnFormClosing(e); return; }
        e.Cancel = true; base.OnFormClosing(e); if (closing) return;
        closing = true; operationCancellation?.Cancel(); UpdateState();
        try
        {
            await operationTask;
            foreach (var entry in entries) { entry.Pane.Deactivate(); await entry.Pane.FlushDraftAsync(); }
            if (initializationError is null) await Task.Run(() => registry.WriteIndex(knownIds.ToArray()));
            timer.Stop();
            foreach (var entry in entries) { entry.Disposing = true; await entry.Pane.DisposeAsync(); }
            allowClose = true; Close();
        }
        catch (Exception ex)
        {
            closing = false; if (shown) timer.Start(); UpdateState();
            MessageBox.Show(this, "工作区尚未完整保留，窗口仍保持打开。\n" + ex.Message, "无法退出", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing) { timer.Dispose(); operationCancellation?.Cancel(); }
        base.Dispose(disposing);
    }

    private sealed record PaneEntry(Guid Id, PhrasePane Pane, TabPage Page)
    {
        internal bool Disposing { get; set; }
    }
}
