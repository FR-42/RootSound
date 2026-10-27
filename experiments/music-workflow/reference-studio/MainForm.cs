using System.Security.Cryptography;
using RootSound.PhraseStudio.Controls;
using RootSound.PhraseStudio.Core;
using RootSound.ReferenceStudio.Audio;
using RootSound.ReferenceStudio.Controls;
using RootSound.ReferenceStudio.Core;
using RootSound.ReferenceStudio.Persistence;
using RootSound.SampleEditor.Audio;
using RootSound.TimbreLab.Instrument;

namespace RootSound.ReferenceStudio;

/// <summary>One shared timeline: listen to a reference, inspect a layer and keep every change editable.</summary>
internal sealed class MainForm : Form, IAsyncDisposable
{
    private readonly ReferencePlaybackSession audio = new();
    private readonly string? initialCasePath;
    private readonly string recoveryPath;
    private readonly ToolStrip toolbar = new() { GripStyle = ToolStripGripStyle.Hidden, Dock = DockStyle.Top, Padding = new Padding(10, 5, 10, 5) };
    private readonly ToolStripButton open = new("打开案例"), save = new("保存"), saveAs = new("另存为"), export = new("导出我的版本"), undo = new("撤销"), redo = new("重做"), cancel = new("取消操作") { Visible = false };
    private readonly ToolStripButton caseInfo = new("案例说明");
    private readonly ToolStripButton observe = new("听原曲分层") { Visible = false };
    private readonly Button reference = ReferenceTheme.Button("原曲"), reconstruction = ReferenceTheme.Button("我的版本"), play = ReferenceTheme.Button("播放"), stop = ReferenceTheme.Button("停止");
    private readonly CheckBox loop = new() { Text = "循环", Checked = true, AutoSize = true, Margin = new Padding(12, 12, 4, 0) };
    private readonly Label position = ReferenceTheme.Label("00:00.00"), sourceTime = ReferenceTheme.Label("");
    private readonly NumericUpDown compareGain = new() { Minimum = -60, Maximum = 12, DecimalPlaces = 1, Width = 65, Margin = new Padding(4, 9, 4, 0) };
    private readonly ReferenceTimeline timeline = new() { Dock = DockStyle.Fill };
    private readonly FlowLayoutPanel layerList = new() { Dock = DockStyle.Fill, FlowDirection = FlowDirection.TopDown, WrapContents = false, AutoScroll = true, Padding = new Padding(10, 12, 10, 0), BackColor = ReferenceTheme.Background };
    private readonly Dictionary<Guid, LayerRow> rows = [];
    private readonly Panel editorArea = new() { Dock = DockStyle.Fill, BackColor = ReferenceTheme.Background };
    private readonly VelocityLane velocityLane = new() { Dock = DockStyle.Bottom, Visible = false };
    private readonly ComboBox mode = new() { DropDownStyle = ComboBoxStyle.DropDownList, Width = 118, Margin = new Padding(4, 8, 4, 0) };
    private readonly ComboBox snap = new() { DropDownStyle = ComboBoxStyle.DropDownList, Width = 64, Margin = new Padding(4, 8, 4, 0) };
    private readonly NumericUpDown velocity = new() { Minimum = 1, Maximum = 100, Value = 80, Width = 51, Margin = new Padding(2, 9, 4, 0) };
    private readonly Button importTimbre = ReferenceTheme.Button("换音色"), rename = ReferenceTheme.Button("声音层"), zoomIn = ReferenceTheme.Button("＋"), zoomOut = ReferenceTheme.Button("－"), fit = ReferenceTheme.Button("全段");
    private readonly SoundSlider brightness = new() { Minimum = 0, Maximum = 100, AccessibleName = "明亮" };
    private readonly SoundSlider sweep = new() { Minimum = -100, Maximum = 100, AccessibleName = "渐暗或渐亮" };
    private readonly SoundSlider echo = new() { Minimum = 0, Maximum = 50, AccessibleName = "回声" };
    private readonly ToolTip soundTips = new();
    private readonly Label explanation = new() { Dock = DockStyle.Fill, ForeColor = ReferenceTheme.Foreground, AutoEllipsis = true, Padding = new Padding(13, 5, 13, 0) };
    private readonly Label origin = new() { Dock = DockStyle.Fill, ForeColor = ReferenceTheme.Muted, AutoEllipsis = true, Padding = new Padding(13, 0, 13, 4) };
    private readonly Label empty = new() { Dock = DockStyle.Fill, Text = "正在准备案例…", TextAlign = ContentAlignment.MiddleCenter, ForeColor = ReferenceTheme.Muted };
    private readonly ToolStripStatusLabel status = new() { Spring = true, TextAlign = ContentAlignment.MiddleLeft };
    private readonly System.Windows.Forms.Timer timer = new() { Interval = 40 };
    private readonly List<ReferenceProject> history = [];
    private readonly Stack<ReferenceProject> future = new();
    private ReferenceProject? project, savedSnapshot;
    private Control? editor;
    private Guid? selectedId, soloId;
    private string? savedPath, savedHash, lastPlaybackError, reconstructionCasePath, observationCasePath;
    private readonly HashSet<string> bundledProtectedPaths = new(StringComparer.OrdinalIgnoreCase);
    private bool updating, shown, busy, closing, allowClose, disposedAudio, recoveryBelongsToCurrent, observingCase;
    private Task operationTask = Task.CompletedTask, draftTask = Task.CompletedTask;
    private CancellationTokenSource? operationCts, draftCts;
    private FileStream? recoveryLease;
    private string? recoveryUnavailable;
    private long revision;

    internal ReferenceProject? Project => project;
    internal bool IsDirty => project is not null && !ReferenceEquals(project, savedSnapshot);
    internal bool CanUndo => history.Count > 0;
    internal bool CanRedo => future.Count > 0;
    internal Guid? SelectedLayer => selectedId;
    internal Guid? SoloLayer => soloId;
    internal int LayerRowCount => rows.Count;
    internal string? SavedPath => savedPath;

    internal MainForm(string? initialCasePath = null, string? privateRoot = null)
    {
        this.initialCasePath = initialCasePath;
        recoveryPath = Path.Combine(privateRoot ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RootSoundExperiments", "ReferenceStudio"), "Recovery.rscase");
        Text = "拆解与改写"; ClientSize = new Size(1450, 870); MinimumSize = new Size(1060, 650);
        BackColor = ReferenceTheme.Background; ForeColor = ReferenceTheme.Foreground;
        StartPosition = FormStartPosition.CenterScreen; Font = new Font("Microsoft YaHei UI", 9); AutoScaleMode = AutoScaleMode.Dpi; KeyPreview = true;
        toolbar.Items.AddRange([open, new ToolStripSeparator(), save, saveAs, export, new ToolStripSeparator(), undo, redo, new ToolStripSeparator(), observe, caseInfo, cancel]);
        mode.Items.AddRange(["钢琴卷帘", "步进音序器"]); snap.Items.AddRange(["1/16", "1/32"]); snap.SelectedIndex = 0;
        var transport = new FlowLayoutPanel { Dock = DockStyle.Fill, WrapContents = false, BackColor = ReferenceTheme.Panel, Padding = new Padding(9, 5, 8, 0) };
        transport.Controls.AddRange([reference, reconstruction, play, stop, loop, position, ReferenceTheme.Label("音量"), compareGain, ReferenceTheme.Label("dB"), sourceTime]);
        var detailHeader = new FlowLayoutPanel { Name = "DetailToolbar", Dock = DockStyle.Top, AutoSize = true, AutoSizeMode = AutoSizeMode.GrowAndShrink, MinimumSize = new Size(0, 49), WrapContents = true, BackColor = ReferenceTheme.Panel, Padding = new Padding(8, 3, 0, 0) };
        rename.AutoSize = false; rename.Width = 145; rename.AutoEllipsis = true;
        zoomIn.MinimumSize = zoomOut.MinimumSize = new Size(32, 32); zoomIn.Padding = zoomOut.Padding = new Padding(4);
        detailHeader.Controls.AddRange([rename, mode, importTimbre, ReferenceTheme.Label("新音符力度"), velocity, ReferenceTheme.Label("网格"), snap, zoomOut, zoomIn, fit]);
        var soundControls = new FlowLayoutPanel { Dock = DockStyle.Fill, WrapContents = false, BackColor = ReferenceTheme.Panel, Padding = new Padding(5, 0, 0, 0) };
        soundControls.Controls.AddRange([ReferenceTheme.Label("明亮"), brightness, ReferenceTheme.Label("渐暗 ← → 渐亮"), sweep, ReferenceTheme.Label("回声"), echo]);
        var lower = new TableLayoutPanel { Dock = DockStyle.Bottom, Height = 110, RowCount = 3, ColumnCount = 1, BackColor = ReferenceTheme.Panel, Margin = new Padding(0) };
        lower.RowStyles.Add(new RowStyle(SizeType.Absolute, 43)); lower.RowStyles.Add(new RowStyle(SizeType.Percent, 53)); lower.RowStyles.Add(new RowStyle(SizeType.Percent, 47));
        lower.Controls.Add(soundControls, 0, 0); lower.Controls.Add(explanation, 0, 1); lower.Controls.Add(origin, 0, 2);
        var detail = new Panel { Dock = DockStyle.Fill, BackColor = ReferenceTheme.Background };
        detail.Controls.Add(editorArea); detail.Controls.Add(lower); detail.Controls.Add(detailHeader);
        var split = new SplitContainer { Size = new Size(1400, 600), Dock = DockStyle.Fill, BackColor = ReferenceTheme.Background, SplitterWidth = 5, FixedPanel = FixedPanel.Panel1, SplitterDistance = 260 };
        split.Panel1MinSize = 250; split.Panel2MinSize = 650;
        split.Panel1.Controls.Add(layerList); split.Panel2.Controls.Add(detail);
        var content = new Panel { Dock = DockStyle.Fill }; content.Controls.Add(split); content.Controls.Add(empty);
        var layout = new TableLayoutPanel { Dock = DockStyle.Fill, RowCount = 3, ColumnCount = 1, Margin = new Padding(0), Padding = new Padding(0) };
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 53)); layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 86)); layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        layout.Controls.Add(transport, 0, 0); layout.Controls.Add(timeline, 0, 1); layout.Controls.Add(content, 0, 2);
        transport.Margin = timeline.Margin = content.Margin = new Padding(0);
        var statusbar = new StatusStrip { SizingGrip = false, BackColor = ReferenceTheme.Panel, ForeColor = ReferenceTheme.Muted }; statusbar.Items.Add(status);
        Controls.Add(layout); Controls.Add(statusbar); Controls.Add(toolbar);
        reference.Click += (_, _) => ChangeSource(SourceMode.Reference);
        reconstruction.Click += (_, _) => ChangeSource(SourceMode.Reconstruction);
        play.Click += (_, _) => TogglePlayback(); stop.Click += (_, _) => { audio.Stop(); Poll(); };
        loop.CheckedChanged += (_, _) => audio.Loop = loop.Checked;
        timeline.SeekRequested += seconds => { audio.Seek(seconds); Poll(); };
        compareGain.ValueChanged += (_, _) =>
        {
            if (updating || project is null) return;
            Commit(audio.Mode == SourceMode.Reference ? project with { ReferenceGainDb = (double)compareGain.Value } : project with { MasterGainDb = (double)compareGain.Value });
        };
        open.Click += (_, _) => RunOperation(OpenCaseAsync);
        save.Click += (_, _) => RunOperation(ct => SaveCaseAsync(false, ct));
        saveAs.Click += (_, _) => RunOperation(ct => SaveCaseAsync(true, ct));
        export.Click += (_, _) => RunOperation(ExportAsync);
        observe.Click += (_, _) => RunOperation(SwitchBundledCaseAsync);
        caseInfo.Click += (_, _) =>
        {
            if (project is not null) MessageBox.Show(this, project.Info.Summary + "\n\n" + project.Info.AnalysisCaveat + "\n\n来源：" + project.Info.SourceFileName + " · " + ReferenceTimeline.Format(project.Info.SourceStartSeconds) + " 起", "案例说明", MessageBoxButtons.OK, MessageBoxIcon.Information);
        };
        undo.Click += (_, _) => Undo(); redo.Click += (_, _) => Redo();
        cancel.Click += (_, _) => operationCts?.Cancel();
        mode.SelectedIndexChanged += (_, _) => { if (!updating) ChangeSelected(c => c with { Mode = mode.SelectedIndex == 1 ? EditorMode.StepSequencer : EditorMode.PianoRoll }); };
        importTimbre.Click += (_, _) => RunOperation(ImportTimbreAsync);
        rename.Click += (_, _) => RenameLayer();
        snap.SelectedIndexChanged += (_, _) => { if (editor is PianoRollEditor piano) piano.SnapTicks = snap.SelectedIndex == 1 ? 120 : 240; };
        velocity.ValueChanged += (_, _) => { if (editor is PianoRollEditor piano) piano.DefaultVelocity = (double)velocity.Value / 100; };
        zoomIn.Click += (_, _) => { if (editor is PianoRollEditor piano) piano.ZoomTime(1.5); };
        zoomOut.Click += (_, _) => { if (editor is PianoRollEditor piano) piano.ZoomTime(1 / 1.5); };
        fit.Click += (_, _) => { if (editor is PianoRollEditor piano) piano.FitTime(); };
        brightness.PreviewRequested += value => { soundTips.SetToolTip(brightness, $"明亮：{SoundSlider.BrightnessHz(value):0} Hz"); PreviewSound(s => s with { BrightnessHz = SoundSlider.BrightnessHz(value) }); };
        sweep.PreviewRequested += value => { soundTips.SetToolTip(sweep, $"渐暗／渐亮：{value:+0;-0;0}%"); PreviewSound(s => s with { Sweep = value / 100d }); };
        echo.PreviewRequested += value => { soundTips.SetToolTip(echo, $"回声：{value}%"); PreviewSound(s => s with { EchoMix = value / 100d }); };
        brightness.CommitRequested += value => ChangeSound(s => s with { BrightnessHz = SoundSlider.BrightnessHz(value) });
        sweep.CommitRequested += value => ChangeSound(s => s with { Sweep = value / 100d });
        echo.CommitRequested += value => ChangeSound(s => s with { EchoMix = value / 100d });
        brightness.PreviewCancelled += RestorePreview; sweep.PreviewCancelled += RestorePreview; echo.PreviewCancelled += RestorePreview;
        velocityLane.NotesChanged += notes => ChangeSelected(c => c with { Notes = notes });
        velocityLane.PreviewChanged += PreviewNotes;
        velocityLane.PreviewCancelled += () => { if (project is not null) audio.SetProject(project); };
        layerList.SizeChanged += (_, _) => ResizeRows();
        timer.Tick += (_, _) => Poll();
        audio.Loop = loop.Checked; ReferenceTheme.Apply(this); UpdateActions();
    }

    protected override void OnShown(EventArgs e)
    {
        base.OnShown(e); if (shown) return; shown = true; timer.Start();
        RunOperation(async ct =>
        {
            RefreshBundledPaths();
            AcquireRecoveryLease();
            bool restored = false;
            if (recoveryLease is not null && File.Exists(recoveryPath) && MessageBox.Show(this, "恢复上次尚未保存的修改？", "继续创作", MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.Yes)
            {
                try { SetProject(await CaseArchive.LoadAsync(recoveryPath, ct), null, isSaved: false); recoveryBelongsToCurrent = true; restored = true; SetStatus("已恢复本机编辑稿；保存时请选择文件位置。"); }
                catch (OperationCanceledException) { throw; }
                catch (Exception ex) { MessageBox.Show(this, "恢复稿仍保留，暂时无法读取：\n" + ex.Message, "恢复编辑稿", MessageBoxButtons.OK, MessageBoxIcon.Information); }
            }
            if (!restored)
            {
                string? path = initialCasePath ?? reconstructionCasePath;
                if (path is null) { empty.Text = "点击“打开案例”开始"; SetStatus("尚未找到随附案例。"); return; }
                var loaded = await CaseArchive.LoadAsync(path, ct);
                bool bundled = initialCasePath is null || IsBundledCase(path);
                SetProject(loaded, !bundled && File.Exists(path) ? Path.GetFullPath(path) : null, isSaved: true, observation: SameFile(path, observationCasePath));
                if (savedPath is not null) savedHash = await FileHashAsync(savedPath, ct);
                SetStatus(loaded.Info.Summary);
            }
        });
    }

    private void RefreshBundledPaths()
    {
        reconstructionCasePath = FindBundledCase(false); observationCasePath = FindBundledCase(true);
        foreach (string path in new[] { reconstructionCasePath, observationCasePath }.OfType<string>())
        {
            if (File.Exists(path)) bundledProtectedPaths.Add(Path.GetFullPath(path));
            else if (Directory.Exists(path))
                foreach (string name in new[] { "reference.wav", "reconstruction.wav", "reconstruction.rsphrase", "case.json" })
                {
                    string file = Path.Combine(path, name); if (File.Exists(file)) bundledProtectedPaths.Add(Path.GetFullPath(file));
                }
        }
    }
    private bool IsBundledCase(string path) => SameFile(path, reconstructionCasePath) || SameFile(path, observationCasePath);
    private static bool SameFile(string path, string? other)
    {
        if (other is null) return false;
        if (string.Equals(Path.GetFullPath(path), Path.GetFullPath(other), StringComparison.OrdinalIgnoreCase)) return true;
        if (!File.Exists(path) || !File.Exists(other)) return false;
        using var a = File.OpenHandle(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        using var b = File.OpenHandle(other, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        var left = FileIdentity.Read(a); var right = FileIdentity.Read(b); return left is not null && left == right;
    }
    private static string? FindBundledCase(bool observation)
    {
        string packaged = Path.Combine(AppContext.BaseDirectory, "Cases", BundledCaseNavigation.FileName(observation));
        if (File.Exists(packaged)) return packaged;
        foreach (string root in new[] { AppContext.BaseDirectory, Environment.CurrentDirectory })
        {
            var directory = new DirectoryInfo(root);
            for (int level = 0; directory is not null && level < 8; level++, directory = directory.Parent)
            {
                string candidate = Path.Combine(directory.FullName, "cases", "Vulcanus");
                if (observation) candidate = Path.Combine(candidate, "sound-observation");
                if (Directory.Exists(candidate)) return candidate;
                candidate = Path.Combine(directory.FullName, "experiments", "music-workflow", "reference-studio", "cases", "Vulcanus");
                if (observation) candidate = Path.Combine(candidate, "sound-observation");
                if (Directory.Exists(candidate)) return candidate;
            }
        }
        return null;
    }

    private void SetProject(ReferenceProject value, string? path, bool isSaved, bool observation = false)
    {
        ReferenceValidation.Validate(value);
        ReferenceProject next = Freeze(value);
        // Audio compilation can reject an otherwise valid document, e.g. excessive simultaneous voices.
        // Accept it before replacing the visible project or its saved/undo state.
        audio.SetProject(next); audio.Stop(); project = next; savedSnapshot = isSaved ? project : null;
        savedPath = path; savedHash = null; observingCase = observation; history.Clear(); future.Clear();
        soloId = null; selectedId = project.Phrase.Channels.FirstOrDefault(c => c.Mode == EditorMode.PianoRoll)?.Id ?? project.Phrase.Channels[0].Id;
        audio.SetSolo(null); audio.Mode = SourceMode.Reference;
        timeline.SetReference(project.Reference, project.Info.SourceStartSeconds); lastPlaybackError = null;
        RefreshProject(resetEditor: true); SetStatus(project.Info.Summary);
    }

    private static ReferenceProject Freeze(ReferenceProject value) => value with
    {
        Phrase = value.Phrase with { Channels = Array.AsReadOnly(value.Phrase.Channels.Select(c => c with { Notes = Array.AsReadOnly(c.Notes.ToArray()) }).ToArray()) },
        Layers = Array.AsReadOnly(value.Layers.ToArray()), Sounds = Array.AsReadOnly(value.Sounds.ToArray())
    };

    private void Commit(ReferenceProject next, bool hearReconstruction = false)
    {
        if (project is null || closing || busy) return;
        try
        {
            ReferenceValidation.Validate(next); ReferenceProject accepted = Freeze(next); audio.SetProject(accepted);
            if (hearReconstruction) audio.Mode = SourceMode.Reconstruction;
            history.Add(project); if (history.Count > 100) history.RemoveAt(0);
            project = accepted; future.Clear(); OnChanged();
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidDataException or InvalidOperationException) { SetStatus(ex.Message); RefreshProject(); }
    }

    private void OnChanged()
    {
        revision++; if (project is null) return;
        RefreshProject(); SetStatus("修改已更新"); QueueDraft();
    }
    private void Undo()
    {
        if (busy || closing) return; FinishSoundGestures(); if (project is null || history.Count == 0) return;
        try
        {
            ReferenceProject candidate = history[^1]; audio.SetProject(candidate);
            future.Push(project); project = candidate; history.RemoveAt(history.Count - 1); OnChanged();
        }
        catch (InvalidOperationException ex) { SetStatus(ex.Message); }
    }
    private void Redo()
    {
        if (busy || closing) return; FinishSoundGestures(); if (project is null || future.Count == 0) return;
        try
        {
            ReferenceProject candidate = future.Peek(); audio.SetProject(candidate);
            history.Add(project); project = future.Pop(); OnChanged();
        }
        catch (InvalidOperationException ex) { SetStatus(ex.Message); }
    }
    private void ChangeSelected(Func<PhraseChannel, PhraseChannel> change)
    {
        if (updating || project is null || selectedId is not { } id) return;
        Commit(project with { Phrase = project.Phrase with { Channels = project.Phrase.Channels.Select(c => c.Id == id ? change(c) : c).ToArray() } }, hearReconstruction: true);
    }
    private void ChangeSound(Func<LayerSound, LayerSound> change)
    {
        if (updating || project is null || selectedId is not { } id) return;
        Commit(project with { Sounds = project.Sounds.Select(s => s.ChannelId == id ? change(s) : s).ToArray() }, hearReconstruction: true);
    }
    private void SelectLayer(Guid id)
    {
        if (project is null || !project.Phrase.Channels.Any(c => c.Id == id)) return;
        bool changed = selectedId != id; selectedId = id; RefreshProject(changed);
    }
    private void SetSolo(Guid id, bool value)
    {
        if (project is null || !project.Phrase.Channels.Any(c => c.Id == id)) return;
        soloId = value ? id : soloId == id ? null : soloId; audio.SetSolo(soloId);
        if (value) ChangeSource(SourceMode.Reconstruction);
        RefreshProject();
    }

    private void RefreshProject(bool resetEditor = false)
    {
        if (project is null) { UpdateActions(); return; }
        updating = true;
        try
        {
            empty.Visible = false; Text = project.Info.Title + " · 拆解与改写" + (IsDirty ? " *" : "");
            var ids = project.Phrase.Channels.Select(c => c.Id).ToHashSet();
            foreach (Guid stale in rows.Keys.Where(id => !ids.Contains(id)).ToArray())
            { layerList.Controls.Remove(rows[stale]); rows[stale].Dispose(); rows.Remove(stale); }
            layerList.SuspendLayout();
            foreach (var channel in project.Phrase.Channels)
            {
                if (!rows.TryGetValue(channel.Id, out var row))
                {
                    row = new LayerRow(channel.Id); rows.Add(channel.Id, row); layerList.Controls.Add(row);
                    row.Selected += SelectLayer;
                    row.MuteChanged += (id, mute) => { if (project is not null) Commit(project with { Phrase = project.Phrase with { Channels = project.Phrase.Channels.Select(c => c.Id == id ? c with { Muted = mute } : c).ToArray() } }, hearReconstruction: true); };
                    row.SoloChanged += SetSolo;
                    row.GainChanged += (id, gain) => { if (project is not null) Commit(project with { Phrase = project.Phrase with { Channels = project.Phrase.Channels.Select(c => c.Id == id ? c with { GainDb = gain } : c).ToArray() } }, hearReconstruction: true); };
                }
                row.RefreshLayer(channel, project.Layers.Single(l => l.ChannelId == channel.Id).Role, selectedId == channel.Id, soloId == channel.Id);
            }
            layerList.ResumeLayout(); ResizeRows();
            if (selectedId is { } selected && project.Phrase.Channels.FirstOrDefault(c => c.Id == selected) is { } current)
            {
                RefreshEditor(current, resetEditor); var sound = project.Sounds.Single(s => s.ChannelId == selected);
                brightness.SetValueSilently(SoundSlider.BrightnessPosition(sound.BrightnessHz)); sweep.SetValueSilently((int)Math.Round(sound.Sweep * 100)); echo.SetValueSilently((int)Math.Round(sound.EchoMix * 100));
                soundTips.SetToolTip(brightness, $"明亮：{sound.BrightnessHz:0} Hz"); soundTips.SetToolTip(sweep, $"渐暗／渐亮：{sound.Sweep * 100:+0;-0;0}%"); soundTips.SetToolTip(echo, $"回声：{sound.EchoMix * 100:0}%");
                var description = project.Layers.Single(l => l.ChannelId == selected);
                explanation.Text = description.Explanation; origin.Text = description.Origin;
            }
            RefreshComparisonControls();
            sourceTime.Text = $"原曲 {ReferenceTimeline.Format(project.Info.SourceStartSeconds)} 起 · {project.Phrase.Tempo:0.#} BPM";
        }
        finally { updating = false; }
        UpdateActions(); Poll();
    }
    private void RefreshComparisonControls()
    {
        if (project is null) return; bool wasUpdating = updating; updating = true;
        try
        {
            compareGain.Value = (decimal)(audio.Mode == SourceMode.Reference ? project.ReferenceGainDb : project.MasterGainDb);
            reference.BackColor = audio.Mode == SourceMode.Reference ? Color.FromArgb(43, 91, 90) : ReferenceTheme.Raised;
            reconstruction.BackColor = audio.Mode == SourceMode.Reconstruction ? Color.FromArgb(43, 91, 90) : ReferenceTheme.Raised;
        }
        finally { updating = wasUpdating; }
    }

    private void ResizeRows()
    { foreach (var row in rows.Values) row.Width = Math.Max(235, layerList.ClientSize.Width - layerList.Padding.Horizontal - (layerList.VerticalScroll.Visible ? SystemInformation.VerticalScrollBarWidth : 0)); }

    private void RefreshEditor(PhraseChannel channel, bool reset)
    {
        bool piano = channel.Mode == EditorMode.PianoRoll;
        if (editor is null || piano != (editor is PianoRollEditor) || reset)
        {
            editorArea.Controls.Clear(); editor?.Dispose();
            if (piano)
            {
                var roll = new PianoRollEditor { Dock = DockStyle.Fill, SnapTicks = snap.SelectedIndex == 1 ? 120 : 240, DefaultVelocity = (double)velocity.Value / 100 };
                roll.NotesChanged += notes => ChangeSelected(c => c with { Notes = notes });
                roll.NoteAudition += Audition; roll.ViewChanged += SyncVelocityView; roll.Resize += (_, _) => SyncVelocityView(); editor = roll;
            }
            else
            {
                var steps = new StepEditor { Dock = DockStyle.Fill };
                steps.NotesChanged += notes => ChangeSelected(c => c with { Notes = notes });
                steps.NoteAudition += Audition; steps.StepPitchChanged += pitch => ChangeSelected(c => c with { StepPitch = pitch }); editor = steps;
            }
            editorArea.Controls.Add(editor); editorArea.Controls.Add(velocityLane); ReferenceTheme.Apply(editor);
        }
        velocityLane.Visible = piano;
        long ticks = Timing.DurationTicks(project!.Phrase);
        if (editor is PianoRollEditor pianoRoll)
        {
            pianoRoll.SetNotes(channel.Notes, ticks, channel.StepPitch);
            if (reset) pianoRoll.ScrollToPitch(channel.Notes.Count > 0 ? (int)channel.Notes.Average(n => n.Pitch) : channel.StepPitch);
            velocityLane.SetNotes(channel.Notes); SyncVelocityView();
        }
        else if (editor is StepEditor sequencer) sequencer.SetNotes(channel.Notes, ticks, channel.StepPitch);
        rename.Text = channel.Name; mode.SelectedIndex = piano ? 0 : 1;
        snap.Enabled = velocity.Enabled = zoomIn.Enabled = zoomOut.Enabled = fit.Enabled = piano;
    }
    private void SyncVelocityView()
    { if (editor is PianoRollEditor piano) velocityLane.SetView(piano.ViewStartTick, piano.VisibleTicks, piano.GridBounds); }
    private void PreviewNotes(IReadOnlyList<PhraseNote> notes)
    {
        if (project is null || selectedId is not { } id || busy || closing) return;
        try
        {
            audio.SetProject(project with { Phrase = project.Phrase with { Channels = project.Phrase.Channels.Select(c => c.Id == id ? c with { Notes = notes } : c).ToArray() } });
            audio.Mode = SourceMode.Reconstruction; RefreshComparisonControls();
        }
        catch (InvalidOperationException ex) { audio.SetProject(project); SetStatus(ex.Message); }
    }
    private void PreviewSound(Func<LayerSound, LayerSound> change)
    {
        if (updating || project is null || selectedId is not { } id || busy || closing) return;
        try
        {
            audio.SetProject(project with { Sounds = project.Sounds.Select(s => s.ChannelId == id ? change(s) : s).ToArray() });
            audio.Mode = SourceMode.Reconstruction; RefreshComparisonControls();
        }
        catch (InvalidOperationException ex) { RestorePreview(); SetStatus(ex.Message); }
    }
    private void RestorePreview() { if (project is not null && !disposedAudio) audio.SetProject(project); }
    private void FinishSoundGestures() { brightness.FinishGesture(); sweep.FinishGesture(); echo.FinishGesture(); }
    private void Audition(int pitch)
    {
        if (project?.Phrase.Channels.FirstOrDefault(c => c.Id == selectedId) is not { } channel) return;
        try { audio.Audition(channel, pitch); }
        catch (InvalidOperationException ex) { SetStatus(ex.Message); }
    }
    private void ChangeSource(SourceMode value)
    { if (project is null) return; audio.Mode = value; RefreshProject(); }
    private void TogglePlayback()
    { if (project is null || busy || closing) return; if (audio.Snapshot.IsPlaying) audio.Pause(); else audio.Play(); Poll(); }
    private void Poll()
    {
        if (closing || disposedAudio) return;
        var snapshot = audio.Snapshot; play.Text = snapshot.IsPlaying ? "暂停" : "播放";
        timeline.PositionSeconds = snapshot.PositionSeconds; position.Text = ReferenceTimeline.Format(snapshot.PositionSeconds);
        if (project is not null)
        {
            double tick = snapshot.PositionSeconds / Timing.SecondsPerTick(project.Phrase.Tempo);
            if (editor is PianoRollEditor piano) { piano.PlayheadTick = tick; if (snapshot.IsPlaying) piano.FollowPlayhead(); }
            else if (editor is StepEditor steps) steps.PlayheadTick = tick;
        }
        if (snapshot.Error is { } error && error != lastPlaybackError) { lastPlaybackError = error; SetStatus("试听：" + error); }
    }

    private void RenameLayer()
    {
        if (project?.Phrase.Channels.FirstOrDefault(c => c.Id == selectedId) is not { } channel) return;
        using var dialog = new Form { Text = "声音层名称", ClientSize = new Size(360, 110), FormBorderStyle = FormBorderStyle.FixedDialog, MaximizeBox = false, MinimizeBox = false, StartPosition = FormStartPosition.CenterParent, BackColor = ReferenceTheme.Panel, ForeColor = ReferenceTheme.Foreground, Font = Font };
        var text = new TextBox { Text = channel.Name, Left = 15, Top = 17, Width = 330, MaxLength = 240 };
        var ok = ReferenceTheme.Button("确定"); ok.Location = new Point(185, 60); ok.DialogResult = DialogResult.OK;
        var no = ReferenceTheme.Button("取消"); no.Location = new Point(265, 60); no.DialogResult = DialogResult.Cancel;
        dialog.Controls.AddRange([text, ok, no]); dialog.AcceptButton = ok; dialog.CancelButton = no; ReferenceTheme.Apply(dialog);
        if (dialog.ShowDialog(this) != DialogResult.OK || string.IsNullOrWhiteSpace(text.Text)) return;
        string name = PhraseFactory.UniqueName(text.Text, project.Phrase.Channels.Where(c => c.Id != channel.Id).Select(c => c.Name));
        ChangeSelected(c => c with { Name = name });
    }

    private async Task ImportTimbreAsync(CancellationToken ct)
    {
        if (project?.Phrase.Channels.FirstOrDefault(c => c.Id == selectedId) is not { } channel) return;
        using var picker = new OpenFileDialog { Title = "为声音层更换音色", Filter = "RootSound 音色|*.rstimbre", CheckFileExists = true };
        if (picker.ShowDialog(this) != DialogResult.OK) return;
        var patch = await TimbreArchive.ImportAsync(picker.FileName, ct); ct.ThrowIfCancellationRequested();
        // A file operation owns the busy flag, but this one validated edit must still enter undo history.
        ApplyOperationEdit(project with { Phrase = project.Phrase with { Channels = project.Phrase.Channels.Select(c => c.Id == channel.Id ? c with { Timbre = patch } : c).ToArray() },
            Layers = project.Layers.Select(l => l.ChannelId == channel.Id ? l with { Origin = "用户导入音色：" + Path.GetFileName(picker.FileName) } : l).ToArray() });
    }
    private void ApplyOperationEdit(ReferenceProject value)
    {
        if (project is null) return; ReferenceValidation.Validate(value);
        ReferenceProject accepted = Freeze(value); audio.SetProject(accepted); audio.Mode = SourceMode.Reconstruction;
        history.Add(project); if (history.Count > 100) history.RemoveAt(0); future.Clear(); project = accepted; OnChanged();
    }

    private async Task OpenCaseAsync(CancellationToken ct)
    {
        using var picker = new OpenFileDialog { Title = "打开案例", Filter = "RootSound 案例|*.rscase", CheckFileExists = true,
            InitialDirectory = savedPath is not null ? Path.GetDirectoryName(savedPath) : Path.Combine(AppContext.BaseDirectory, "Cases") };
        if (picker.ShowDialog(this) != DialogResult.OK) return;
        string path = Path.GetFullPath(picker.FileName);
        if (!await ConfirmLeaveAsync(ct)) return;
        // Preserve the current project until the replacement has been fully validated.
        var loaded = await CaseArchive.LoadAsync(path, ct); string hash = await FileHashAsync(path, ct);
        await StopDraftAsync(); ct.ThrowIfCancellationRequested();
        RefreshBundledPaths(); bool bundled = IsBundledCase(path);
        SetProject(loaded, bundled ? null : path, isSaved: true, observation: SameFile(path, observationCasePath)); savedHash = bundled ? null : hash; ClearRecovery();
    }

    private async Task SwitchBundledCaseAsync(CancellationToken ct)
    {
        if (project is null) return; RefreshBundledPaths();
        bool nextObservation = !observingCase;
        string? path = BundledCaseNavigation.Target(observingCase, reconstructionCasePath, observationCasePath);
        if (path is null) { SetStatus("这个随附案例暂不可用。"); UpdateActions(); return; }
        if (!await ConfirmLeaveAsync(ct)) return;
        var loaded = await CaseArchive.LoadAsync(path, ct);
        await StopDraftAsync(); ct.ThrowIfCancellationRequested();
        var previous = audio.Snapshot;
        SetProject(loaded, null, isSaved: true, observation: nextObservation); ClearRecovery();
        audio.Mode = SourceMode.Reconstruction;
        audio.Seek(BundledCaseNavigation.Position(previous.PositionSeconds, loaded.DurationSeconds));
        if (previous.IsPlaying) audio.Play();
        RefreshComparisonControls(); Poll();
    }

    private async Task<bool> ConfirmLeaveAsync(CancellationToken ct)
    {
        if (!IsDirty) return true;
        DialogResult choice = MessageBox.Show(this, "保存当前修改？", "继续创作", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Question);
        if (choice == DialogResult.Cancel) return false;
        if (choice == DialogResult.Yes) return await SaveCaseAsync(false, ct);
        return true;
    }

    private async Task<bool> SaveCaseAsync(bool asNewFile, CancellationToken ct)
    {
        if (project is null) return false;
        string? destination = asNewFile ? null : savedPath;
        if (destination is null)
        {
            using var picker = new SaveFileDialog { Title = "保存可编辑案例", Filter = "RootSound 案例|*.rscase", DefaultExt = "rscase", AddExtension = true, OverwritePrompt = true, FileName = SafeName(project.Info.Title) + "-我的版本.rscase" };
            if (savedPath is not null) picker.InitialDirectory = Path.GetDirectoryName(savedPath);
            if (picker.ShowDialog(this) != DialogResult.OK) return false;
            destination = Path.GetFullPath(picker.FileName);
        }
        else if (File.Exists(destination))
        {
            string currentHash = await FileHashAsync(destination, ct);
            string warning = savedHash is not null && !string.Equals(savedHash, currentHash, StringComparison.OrdinalIgnoreCase) ? "这个文件在打开后已被其他操作修改。\n覆盖会替换那些修改。" : "覆盖已保存的案例文件？";
            if (MessageBox.Show(this, warning + "\n\n" + destination, "保存案例", MessageBoxButtons.OKCancel, MessageBoxIcon.Warning) != DialogResult.OK) return false;
        }
        if (!string.Equals(Path.GetExtension(destination), ".rscase", StringComparison.OrdinalIgnoreCase)) throw new IOException("请选择 .rscase 案例文件名。");
        SourceProtection.Check(project, destination); ProtectBundledCase(destination); ct.ThrowIfCancellationRequested();
        ReferenceProject snapshot = project; await CaseArchive.SaveAsync(snapshot, destination, ct);
        savedPath = destination; savedSnapshot = snapshot;
        try { savedHash = await FileHashAsync(destination, CancellationToken.None); await StopDraftAsync(); ClearRecovery(); SetStatus("已保存：" + destination); }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { SetStatus("案例已保存；本机恢复稿更新失败：" + ex.Message); }
        RefreshProject(); return true;
    }

    private async Task ExportAsync(CancellationToken ct)
    {
        if (project is null) return;
        using var picker = new SaveFileDialog { Title = "导出我的版本", Filter = "WAV 音频|*.wav", DefaultExt = "wav", AddExtension = true, OverwritePrompt = true, FileName = SafeName(project.Info.Title) + "-我的版本.wav" };
        if (picker.ShowDialog(this) != DialogResult.OK) return;
        string destination = Path.GetFullPath(picker.FileName);
        if (!string.Equals(Path.GetExtension(destination), ".wav", StringComparison.OrdinalIgnoreCase)) throw new IOException("请选择 .wav 音频文件名。");
        SourceProtection.Check(project, destination); ProtectBundledCase(destination); ProtectOpenedCase(destination); ct.ThrowIfCancellationRequested();
        audio.Pause(); await ReferenceRenderer.ExportAsync(project, destination, overwrite: true, cancellationToken: ct);
        SetStatus("已导出：" + destination + "（整段、全部未静音层）");
    }

    private void ProtectOpenedCase(string destination)
    {
        if (savedPath is not null) ProtectCaseIdentity(savedPath, destination, "不能用音频覆盖打开的案例，请使用新的文件名。");
    }
    private void ProtectBundledCase(string destination)
    {
        foreach (string path in bundledProtectedPaths) ProtectCaseIdentity(path, destination, "随附案例保留作为对照，请为自己的版本选择其他位置或名称。");
    }
    private static void ProtectCaseIdentity(string origin, string destination, string message)
    {
        if (string.Equals(Path.GetFullPath(origin), Path.GetFullPath(destination), StringComparison.OrdinalIgnoreCase)) throw new IOException(message);
        if (!File.Exists(origin)) return;
        if (!File.Exists(destination)) return;
        using var source = File.OpenHandle(origin, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        using var target = File.OpenHandle(destination, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        var a = FileIdentity.Read(source); var b = FileIdentity.Read(target);
        if (a is null || b is null || a == b) throw new IOException(message);
    }

    private void QueueDraft()
    {
        if (!shown || project is null || !IsDirty) return;
        if (recoveryLease is null) { SetStatus("请手动保存；本机恢复稿暂不可用：" + recoveryUnavailable); return; }
        draftCts?.Cancel(); var previous = draftTask; var cts = draftCts = new CancellationTokenSource();
        ReferenceProject snapshot = project; long version = revision;
        draftTask = SaveDraftLaterAsync(previous, snapshot, version, cts);
    }
    private async Task SaveDraftLaterAsync(Task previous, ReferenceProject value, long version, CancellationTokenSource cts)
    {
        try
        {
            await previous; await Task.Delay(700, cts.Token);
            Directory.CreateDirectory(Path.GetDirectoryName(recoveryPath)!);
            if (!recoveryBelongsToCurrent && File.Exists(recoveryPath))
            {
                // An unreadable or declined recovery belongs to an earlier session; never replace it.
                string preserved = Path.Combine(Path.GetDirectoryName(recoveryPath)!, "Recovery-preserved-" + DateTime.UtcNow.ToString("yyyyMMdd-HHmmss") + "-" + Guid.NewGuid().ToString("N")[..8] + ".rscase");
                File.Move(recoveryPath, preserved);
            }
            await CaseArchive.SaveAsync(value, recoveryPath, cts.Token);
            recoveryBelongsToCurrent = true;
            if (!closing && version == revision) SetStatus("修改已在本机保留；点击保存选择案例文件位置。");
        }
        catch (OperationCanceledException) { }
        catch (Exception ex) { if (!closing) SetStatus("本机保留失败，请手动保存：" + ex.Message); }
        finally { if (ReferenceEquals(draftCts, cts)) draftCts = null; cts.Dispose(); }
    }
    private async Task StopDraftAsync() { draftCts?.Cancel(); await draftTask; }
    private void AcquireRecoveryLease()
    {
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(recoveryPath)!);
            recoveryLease = new FileStream(Path.Combine(Path.GetDirectoryName(recoveryPath)!, "Recovery.lock"), FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None);
            recoveryUnavailable = null;
        }
        catch (IOException) { recoveryUnavailable = "另一个窗口正在使用恢复稿，或该目录暂时无法写入。"; }
        catch (UnauthorizedAccessException) { recoveryUnavailable = "该目录暂时无法写入。"; }
    }
    private void ClearRecovery()
    {
        if (recoveryBelongsToCurrent && File.Exists(recoveryPath)) File.Delete(recoveryPath);
        recoveryBelongsToCurrent = false;
    }

    private void RunOperation(Func<CancellationToken, Task> operation)
    { if (!busy && !closing) { FinishSoundGestures(); operationTask = RunOperationAsync(operation); } }
    private async Task RunOperationAsync(Func<CancellationToken, Task> operation)
    {
        busy = true; using var cts = new CancellationTokenSource(); operationCts = cts; UpdateActions(); SetStatus("正在处理…");
        try { await operation(cts.Token); }
        catch (OperationCanceledException) { if (!closing) SetStatus("已取消"); }
        catch (Exception ex)
        {
            if (!closing) { SetStatus(ex.Message); MessageBox.Show(this, ex.Message, "暂时无法完成这个操作", MessageBoxButtons.OK, MessageBoxIcon.Information); }
        }
        finally { operationCts = null; busy = false; UpdateActions(); }
    }
    private void UpdateActions()
    {
        bool ready = project is not null && !busy && !closing;
        open.Enabled = !busy && !closing; save.Enabled = saveAs.Enabled = export.Enabled = caseInfo.Enabled = ready;
        observe.Text = BundledCaseNavigation.Caption(observingCase);
        observe.Visible = BundledCaseNavigation.Target(observingCase, reconstructionCasePath, observationCasePath) is not null;
        observe.Enabled = ready;
        undo.Enabled = ready && CanUndo; redo.Enabled = ready && CanRedo;
        reference.Enabled = reconstruction.Enabled = play.Enabled = stop.Enabled = loop.Enabled = compareGain.Enabled = timeline.Enabled = ready;
        layerList.Enabled = editorArea.Enabled = mode.Enabled = importTimbre.Enabled = rename.Enabled = brightness.Enabled = sweep.Enabled = echo.Enabled = ready;
        cancel.Visible = busy; cancel.Enabled = busy && !closing;
    }
    private void SetStatus(string text) { if (!IsDisposed) status.Text = text; }
    private static string SafeName(string name) => string.Join("_", name.Split(Path.GetInvalidFileNameChars(), StringSplitOptions.RemoveEmptyEntries));
    private static async Task<string> FileHashAsync(string path, CancellationToken ct)
    { await using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, 131072, FileOptions.Asynchronous | FileOptions.SequentialScan); return Convert.ToHexString(await SHA256.HashDataAsync(stream, ct)); }

    protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
    {
        if (keyData == Keys.Escape && busy) { operationCts?.Cancel(); return true; }
        if (!busy && !closing)
        {
            if (keyData == (Keys.Control | Keys.S)) { RunOperation(ct => SaveCaseAsync(false, ct)); return true; }
            if (keyData == (Keys.Control | Keys.Shift | Keys.S)) { RunOperation(ct => SaveCaseAsync(true, ct)); return true; }
            if (keyData == (Keys.Control | Keys.O)) { RunOperation(OpenCaseAsync); return true; }
            Control? focus = FocusedLeaf(this);
            if (focus is not TextBoxBase)
            {
                if (keyData == (Keys.Control | Keys.Z)) { Undo(); return true; }
                if (keyData == (Keys.Control | Keys.Y)) { Redo(); return true; }
            }
            if (keyData == Keys.Space && focus is not (TextBoxBase or ComboBox or UpDownBase)) { TogglePlayback(); return true; }
        }
        return base.ProcessCmdKey(ref msg, keyData);
    }
    private static Control? FocusedLeaf(Control parent)
    { Control current = parent; while (current.Controls.Cast<Control>().FirstOrDefault(c => c.ContainsFocus) is { } child) current = child; return current.ContainsFocus ? current : null; }

    protected override async void OnFormClosing(FormClosingEventArgs e)
    {
        if (allowClose) { base.OnFormClosing(e); return; }
        e.Cancel = true; base.OnFormClosing(e); if (closing) return;
        FinishSoundGestures(); closing = true; operationCts?.Cancel(); UpdateActions();
        try
        {
            await operationTask;
            // Saving from this prompt must be able to refresh the interface without permitting other input.
            if (!await ConfirmLeaveAsync(CancellationToken.None)) { closing = false; UpdateActions(); return; }
            await StopDraftAsync(); ClearRecovery(); timer.Stop(); await audio.DisposeAsync(); disposedAudio = true;
            allowClose = true; Close();
        }
        catch (Exception ex)
        {
            closing = false; UpdateActions();
            MessageBox.Show(this, "窗口仍保持打开，原稿已保留。\n" + ex.Message, "无法退出", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
    }

    internal void LoadForChecks(ReferenceProject value) => SetProject(value, null, isSaved: true);
    internal void EditNotesForChecks(Guid id, IReadOnlyList<PhraseNote> notes)
    { SelectLayer(id); ChangeSelected(c => c with { Notes = notes }); }
    internal void EditSoundForChecks(Guid id, LayerSound value)
    { SelectLayer(id); ChangeSound(_ => value); }
    internal void SelectForChecks(Guid id) => SelectLayer(id);
    internal void SoloForChecks(Guid id, bool value) => SetSolo(id, value);
    internal void UndoForChecks() => Undo();
    internal void RedoForChecks() => Redo();
    internal bool AcquireRecoveryForChecks() { AcquireRecoveryLease(); return recoveryLease is not null; }
    internal void BrightnessGestureForChecks(Guid id, int[] values)
    { SelectLayer(id); brightness.BeginForChecks(); foreach (int value in values) brightness.MoveForChecks(value); brightness.FinishGesture(); }

    public async ValueTask DisposeAsync()
    {
        if (!disposedAudio) { closing = true; await StopDraftAsync(); await audio.DisposeAsync(); disposedAudio = true; }
        Dispose();
    }
    protected override void Dispose(bool disposing)
    {
        if (disposing) { timer.Dispose(); soundTips.Dispose(); operationCts?.Cancel(); draftCts?.Cancel(); recoveryLease?.Dispose(); recoveryLease = null; if (!disposedAudio) _ = audio.DisposeAsync(); }
        base.Dispose(disposing);
    }
}
