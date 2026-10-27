using RootSound.PhraseStudio.Audio;
using RootSound.PhraseStudio.Controls;
using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Persistence;
using RootSound.TimbreLab.Instrument;

namespace RootSound.PhraseStudio.UI;

internal sealed class PhrasePane : UserControl, IAsyncDisposable
{
    private readonly DocumentHistory history;
    private readonly DraftStore store;
    private readonly Action<Func<CancellationToken, Task>> runOperation;
    private readonly InstrumentSources sources = new();
    private readonly PhrasePlaybackSession audio = new();
    private readonly FlowLayoutPanel channels = new() { Dock = DockStyle.Fill, FlowDirection = FlowDirection.TopDown, WrapContents = false, AutoScroll = true, Padding = new Padding(12) };
    private readonly Dictionary<Guid, ChannelStrip> strips = [];
    private readonly Panel detailArea = new() { Dock = DockStyle.Fill, Visible = false };
    private readonly Panel editorArea = new() { Dock = DockStyle.Fill };
    private readonly ToolStrip detailToolbar = new() { GripStyle = ToolStripGripStyle.Hidden, Dock = DockStyle.Top };
    private readonly ToolStripButton back = new("返回通道"), zoomIn = new("＋"), zoomOut = new("－"), fit = new("全句");
    private readonly ToolStripComboBox detailMode = new() { DropDownStyle = ComboBoxStyle.DropDownList, Width = 118 };
    private readonly ToolStripComboBox snap = new() { DropDownStyle = ComboBoxStyle.DropDownList, Width = 65 };
    private readonly ToolStripLabel detailName = new();
    private readonly NumericUpDown tempo = new() { Minimum = 20, Maximum = 300, DecimalPlaces = 1, Increment = 1, Width = 73 };
    private readonly NumericUpDown bars = new() { Minimum = 1, Maximum = 16, Width = 55 };
    private readonly Button addChannel = UiTheme.Button("新建通道"), play = UiTheme.Button("播放"), stop = UiTheme.Button("停止"), rename = UiTheme.Button("乐句");
    private readonly CheckBox loop = new() { Text = "循环", Checked = true, AutoSize = true, Margin = new Padding(10, 8, 8, 0) };
    private readonly Label position = new() { AutoSize = true, ForeColor = UiTheme.Muted, Margin = new Padding(10, 9, 0, 0) };
    private Control? editor;
    private Guid? detailChannel;
    private PhraseDocument? savedSnapshot;
    private CancellationTokenSource? draftCts;
    private Task draftTask = Task.CompletedTask;
    private long revision;
    private bool suppress, closing;
    private string? draftError, playbackError;

    internal event Action? Changed;
    internal PhraseDocument Document => history.Current;
    internal bool IsDirty => !ReferenceEquals(Document, savedSnapshot);
    internal bool CanSave => PhraseValidation.CanSave(Document);
    internal bool CanUndo => history.CanUndo;
    internal bool CanRedo => history.CanRedo;
    internal string? SavedPath { get; private set; }
    internal string? SavedSha256 { get; private set; }
    internal string Status { get; private set; } = "新建通道，导入音色后开始编辑。";

    internal PhrasePane(PhraseDocument document, DraftStore store,
        Action<Func<CancellationToken, Task>> runOperation, string? savedPath = null,
        string? savedSha256 = null, bool restored = false)
    {
        history = new DocumentHistory(document); this.store = store; this.runOperation = runOperation;
        SavedPath = savedPath; SavedSha256 = savedSha256;
        if (savedPath is not null && !restored) savedSnapshot = Document;
        BackColor = UiTheme.Background; ForeColor = UiTheme.Foreground; Dock = DockStyle.Fill;
        var header = new FlowLayoutPanel { Dock = DockStyle.Top, Height = 49, WrapContents = false, Padding = new Padding(8, 5, 8, 0), BackColor = UiTheme.Panel };
        rename.Width = 156; rename.AutoSize = false; rename.AutoEllipsis = true;
        header.Controls.AddRange([rename, addChannel, Label("速度"), tempo, Label("小节"), bars, loop, play, stop, position]);
        detailMode.Items.AddRange(["步进音序器", "钢琴卷帘"]); snap.Items.AddRange(["1/16", "1/32"]); snap.SelectedIndex = 0;
        detailToolbar.BackColor = UiTheme.Panel; detailToolbar.ForeColor = UiTheme.Foreground;
        detailToolbar.Items.AddRange([back, new ToolStripSeparator(), detailName, detailMode, new ToolStripSeparator(), new ToolStripLabel("网格"), snap, zoomOut, zoomIn, fit]);
        detailArea.Controls.Add(editorArea); detailArea.Controls.Add(detailToolbar);
        Controls.Add(channels); Controls.Add(detailArea); Controls.Add(header);
        back.Click += (_, _) => ShowChannels();
        addChannel.Click += (_, _) => AddChannel();
        rename.Click += (_, _) => { var value = NamePrompt.Ask(FindForm()!, "乐句名称", Document.Name); if (value is not null) Rename(value); };
        tempo.ValueChanged += (_, _) => { if (!suppress) Commit(Document with { Tempo = (double)tempo.Value }); };
        bars.ValueChanged += (_, _) => ChangeLength();
        loop.CheckedChanged += (_, _) => { audio.Loop = loop.Checked; };
        play.Click += (_, _) => TogglePlayback();
        stop.Click += (_, _) => { audio.Stop(); Poll(); };
        detailMode.SelectedIndexChanged += (_, _) =>
        {
            if (suppress || detailChannel is not { } id) return;
            var mode = detailMode.SelectedIndex == 1 ? EditorMode.PianoRoll : EditorMode.StepSequencer;
            ModifyChannel(id, channel => channel with { Mode = mode });
        };
        snap.SelectedIndexChanged += (_, _) => { if (editor is PianoRollEditor piano) piano.SnapTicks = snap.SelectedIndex == 1 ? 120 : 240; };
        zoomIn.Click += (_, _) => { if (editor is PianoRollEditor piano) piano.ZoomTime(1.5); };
        zoomOut.Click += (_, _) => { if (editor is PianoRollEditor piano) piano.ZoomTime(1 / 1.5); };
        fit.Click += (_, _) => { if (editor is PianoRollEditor piano) piano.FitTime(); };
        channels.SizeChanged += (_, _) => ResizeRows();
        RefreshDocument();
        UiTheme.Apply(this);
    }

    private static Label Label(string text) => new() { Text = text, AutoSize = true, Margin = new Padding(9, 9, 2, 0), ForeColor = UiTheme.Muted };

    internal void AddChannel()
    {
        if (Document.Channels.Count >= PhraseValidation.MaximumChannels) return;
        var channel = PhraseFactory.Channel(Document.Channels);
        Commit(Document with { Channels = Document.Channels.Append(channel).ToArray() });
        ShowChannels();
    }

    internal void Rename(string value) => Commit(Document with { Name = value.Trim() });
    internal void TogglePlayback()
    {
        if (closing || !play.Enabled) return;
        if (audio.IsPlaying) audio.Pause(); else audio.Play();
        Poll();
    }
    internal void Undo() { if (!history.CanUndo) return; history.Undo(); OnDocumentChanged(); }
    internal void Redo() { if (!history.CanRedo) return; history.Redo(); OnDocumentChanged(); }

    private void Commit(PhraseDocument document)
    {
        if (closing) return;
        try { history.Apply(document); OnDocumentChanged(); }
        catch (Exception ex) when (ex is ArgumentException or InvalidDataException) { SetStatus(ex.Message); }
    }

    private void OnDocumentChanged()
    {
        revision++;
        RefreshDocument(); QueueDraft();
        SetStatus(CanSave ? "修改已更新；正在本机保留编辑稿。" : "每个通道都需导入音色，才能保存乐句文件。");
        Changed?.Invoke();
    }

    private void ModifyChannel(Guid id, Func<PhraseChannel, PhraseChannel> change)
    {
        if (!Document.Channels.Any(x => x.Id == id)) return;
        Commit(Document with { Channels = Document.Channels.Select(x => x.Id == id ? change(x) : x).ToArray() });
    }

    private void RefreshDocument()
    {
        suppress = true;
        try
        {
            rename.Text = Document.Name; tempo.Value = (decimal)Document.Tempo; bars.Value = Document.Bars;
            addChannel.Enabled = Document.Channels.Count < PhraseValidation.MaximumChannels;
            play.Enabled = Document.Channels.Any(x => x.Timbre is not null && x.Notes.Count > 0);
            long duration = Timing.DurationTicks(Document);
            var ids = Document.Channels.Select(x => x.Id).ToHashSet();
            foreach (var dead in strips.Keys.Where(x => !ids.Contains(x)).ToArray())
            { channels.Controls.Remove(strips[dead]); strips[dead].Dispose(); strips.Remove(dead); }
            channels.SuspendLayout();
            foreach (var channel in Document.Channels)
            {
                if (!strips.TryGetValue(channel.Id, out var row))
                {
                    row = new ChannelStrip(channel.Id);
                    row.ImportRequested += id => runOperation(ct => ImportTimbreAsync(id, ct));
                    row.RenameRequested += RenameChannel;
                    row.RemoveRequested += RemoveChannel;
                    row.DetailRequested += OpenDetail;
                    row.ModeChanged += (id, mode) => ModifyChannel(id, c => c with { Mode = mode });
                    row.MuteChanged += (id, muted) => ModifyChannel(id, c => c with { Muted = muted });
                    row.GainChanged += (id, gain) => ModifyChannel(id, c => c with { GainDb = gain });
                    row.NotesChanged += (id, notes) => ModifyChannel(id, c => c with { Notes = notes });
                    row.NoteAudition += Audition;
                    strips.Add(channel.Id, row); channels.Controls.Add(row);
                }
                row.RefreshChannel(channel, duration);
                channels.Controls.SetChildIndex(row, Document.Channels.ToList().FindIndex(x => x.Id == channel.Id));
            }
            channels.ResumeLayout(); ResizeRows();
            if (detailChannel is { } selected)
            {
                var channel = Document.Channels.FirstOrDefault(x => x.Id == selected);
                if (channel?.Timbre is null) ShowChannels();
                else RefreshEditor(channel, duration);
            }
            audio.SetDocument(Document);
        }
        finally { suppress = false; }
    }

    private void ResizeRows()
    {
        int width = Math.Max(700, channels.ClientSize.Width - channels.Padding.Horizontal - SystemInformation.VerticalScrollBarWidth - 2);
        foreach (var row in strips.Values) row.Width = width;
    }

    private void ChangeLength()
    {
        if (suppress) return;
        int value = (int)bars.Value;
        long duration = (long)value * Timing.TicksPerBar;
        if (Document.Channels.SelectMany(x => x.Notes).Any(x => x.StartTick + x.LengthTick > duration))
        {
            suppress = true; bars.Value = Document.Bars; suppress = false;
            SetStatus("有音符超出这个长度，请先移动或删除这些音符。");
            return;
        }
        Commit(Document with { Bars = value });
    }

    private async Task ImportTimbreAsync(Guid id, CancellationToken cancellationToken)
    {
        var channel = Document.Channels.FirstOrDefault(x => x.Id == id); if (channel is null) return;
        using var dialog = new OpenFileDialog { Title = "导入音色打磨文件", Filter = "RootSound 音色|*.rstimbre" };
        if (dialog.ShowDialog(FindForm()) != DialogResult.OK) return;
        var patch = await TimbreArchive.ImportAsync(dialog.FileName, cancellationToken);
        cancellationToken.ThrowIfCancellationRequested();
        sources.Remember(dialog.FileName);
        string name = PhraseFactory.UniqueName(Path.GetFileNameWithoutExtension(dialog.FileName), Document.Channels.Where(x => x.Id != id).Select(x => x.Name));
        ModifyChannel(id, c => c with { Timbre = patch, Name = name, StepPitch = Math.Clamp((int)Math.Round(patch.Settings.RootMidi), 0, 127) });
        SetStatus("已导入 " + name + "，可选择编辑模式并开始谱写。");
    }

    private void RenameChannel(Guid id)
    {
        var channel = Document.Channels.FirstOrDefault(x => x.Id == id); if (channel is null) return;
        var value = NamePrompt.Ask(FindForm()!, "通道名称", channel.Name); if (value is null) return;
        string name = PhraseFactory.UniqueName(value, Document.Channels.Where(x => x.Id != id).Select(x => x.Name));
        ModifyChannel(id, c => c with { Name = name });
    }

    private void RemoveChannel(Guid id)
    {
        var channel = Document.Channels.FirstOrDefault(x => x.Id == id); if (channel is null) return;
        if (channel.Notes.Count > 0 && MessageBox.Show(FindForm(), "移除“" + channel.Name + "”及其音符？可使用撤销恢复。", "移除通道", MessageBoxButtons.OKCancel, MessageBoxIcon.Question) != DialogResult.OK) return;
        Commit(Document with { Channels = Document.Channels.Where(x => x.Id != id).ToArray() });
    }

    private void Audition(Guid id, int pitch)
    {
        var channel = Document.Channels.FirstOrDefault(x => x.Id == id);
        if (channel?.Timbre is not null) audio.Audition(channel, pitch);
    }

    private void OpenDetail(Guid id)
    {
        var channel = Document.Channels.FirstOrDefault(x => x.Id == id); if (channel?.Timbre is null) return;
        detailChannel = id;
        channels.Visible = false; detailArea.Visible = true; detailArea.BringToFront();
        PerformLayout(); detailArea.PerformLayout();
        suppress = true; RefreshEditor(channel, Timing.DurationTicks(Document)); suppress = false;
        editorArea.PerformLayout();
        if (editor is PianoRollEditor piano)
            piano.ScrollToPitch(channel.Notes.Count > 0 ? (int)Math.Round(channel.Notes.Average(x => x.Pitch)) : channel.StepPitch);
        editor?.Focus();
    }

    private void ShowChannels()
    {
        detailChannel = null; detailArea.Visible = false; channels.Visible = true; channels.BringToFront();
    }

    private void RefreshEditor(PhraseChannel channel, long duration)
    {
        detailName.Text = channel.Name;
        detailMode.SelectedIndex = channel.Mode == EditorMode.PianoRoll ? 1 : 0;
        bool piano = channel.Mode == EditorMode.PianoRoll;
        if (piano != (editor is PianoRollEditor) || editor is null)
        {
            editorArea.Controls.Clear(); editor?.Dispose();
            if (piano)
            {
                var control = new PianoRollEditor { Dock = DockStyle.Fill, SnapTicks = snap.SelectedIndex == 1 ? 120 : 240 };
                control.NotesChanged += notes => { if (detailChannel is { } id) ModifyChannel(id, c => c with { Notes = notes }); };
                control.NoteAudition += pitch => { if (detailChannel is { } id) Audition(id, pitch); };
                editor = control;
            }
            else
            {
                var control = new StepEditor { Dock = DockStyle.Fill };
                control.NotesChanged += notes => { if (detailChannel is { } id) ModifyChannel(id, c => c with { Notes = notes }); };
                control.NoteAudition += pitch => { if (detailChannel is { } id) Audition(id, pitch); };
                control.StepPitchChanged += pitch => { if (detailChannel is { } id) ModifyChannel(id, c => c with { StepPitch = pitch }); };
                editor = control;
            }
            editorArea.Controls.Add(editor);
            UiTheme.Apply(editor);
        }
        if (editor is PianoRollEditor roll) roll.SetNotes(channel.Notes, duration, channel.StepPitch);
        else if (editor is StepEditor steps) steps.SetNotes(channel.Notes, duration, channel.StepPitch);
        snap.Enabled = zoomIn.Enabled = zoomOut.Enabled = fit.Enabled = piano;
    }

    internal void Poll()
    {
        if (closing) return;
        var snapshot = audio.Snapshot;
        play.Text = snapshot.IsPlaying ? "暂停" : "播放";
        double tick = snapshot.IsPlaying || snapshot.PositionTick > 0 ? snapshot.PositionTick : -1;
        foreach (var row in strips.Values) row.SetPlayhead(tick);
        if (editor is PianoRollEditor piano) { piano.PlayheadTick = tick; if (snapshot.IsPlaying) piano.FollowPlayhead(); }
        else if (editor is StepEditor steps) steps.PlayheadTick = tick;
        position.Text = snapshot.PositionTick <= 0 ? "" : $"{(int)(snapshot.PositionTick / 3840) + 1} : {(int)(snapshot.PositionTick / 960) % 4 + 1}";
        if (snapshot.Error is { } error && error != playbackError) { playbackError = error; SetStatus("试听：" + error); }
    }

    internal void Deactivate() { if (!closing) { audio.Stop(); Poll(); } }

    private void QueueDraft()
    {
        draftCts?.Cancel();
        var previous = draftTask;
        var cts = draftCts = new CancellationTokenSource();
        var document = Document; long version = revision;
        string? path = SavedPath, hash = SavedSha256;
        draftTask = SaveDraftLaterAsync(previous, document, path, hash, version, cts);
    }

    private async Task SaveDraftLaterAsync(Task previous, PhraseDocument document, string? path, string? hash, long version, CancellationTokenSource cts)
    {
        try
        {
            await previous; await Task.Delay(550, cts.Token);
            await store.SaveAsync(document, path, hash, cts.Token);
            if (version == revision && !closing)
            {
                draftError = null;
                SetStatus(IsDirty ? "修改已在本机保留；点击保存导出乐句文件。" : "文件已保存，编辑稿已保留。");
            }
        }
        catch (OperationCanceledException) { }
        catch (Exception ex) { draftError = ex.Message; if (!closing) SetStatus("本机保留失败，请手动保存：" + ex.Message); }
        finally { if (ReferenceEquals(draftCts, cts)) draftCts = null; cts.Dispose(); }
    }

    internal async Task FlushDraftAsync(CancellationToken cancellationToken = default)
    {
        draftCts?.Cancel(); await draftTask;
        await store.SaveAsync(Document, SavedPath, SavedSha256, cancellationToken);
        draftError = null;
    }

    internal async Task<bool> SaveFileAsync(bool saveAs, IWin32Window owner, CancellationToken cancellationToken)
    {
        if (!CanSave)
        {
            MessageBox.Show(owner, "请先为每个通道导入音色，或移除不需要的空通道，再保存乐句。", "乐句尚未完成", MessageBoxButtons.OK, MessageBoxIcon.Information);
            return false;
        }
        string? destination = saveAs ? null : SavedPath;
        if (destination is null)
        {
            using var dialog = new SaveFileDialog { Title = "保存乐句文件", Filter = "RootSound 乐句|*.rsphrase", AddExtension = true, DefaultExt = "rsphrase", OverwritePrompt = true, FileName = SafeName(Document.Name) + ".rsphrase" };
            if (SavedPath is { } previous) dialog.InitialDirectory = Path.GetDirectoryName(previous);
            if (dialog.ShowDialog(owner) != DialogResult.OK) return false;
            destination = Path.GetFullPath(dialog.FileName);
        }
        else if (File.Exists(destination))
        {
            string currentHash = await PhraseArchive.FileHashAsync(destination, cancellationToken);
            string warning = SavedSha256 is { } old && !string.Equals(old, currentHash, StringComparison.OrdinalIgnoreCase)
                ? "文件在打开后已被其他操作更改。覆盖会替换那些内容。\n\n" : "保存会覆盖原乐句文件。\n\n";
            warning += destination + "\n\n继续覆盖？若要保留原件，请取消后使用“另存为”。";
            if (MessageBox.Show(owner, warning, "覆盖乐句文件", MessageBoxButtons.OKCancel, MessageBoxIcon.Warning) != DialogResult.OK) return false;
        }
        cancellationToken.ThrowIfCancellationRequested();
        if (!string.Equals(Path.GetExtension(destination), ".rsphrase", StringComparison.OrdinalIgnoreCase))
            throw new IOException("请使用 .rsphrase 扩展名保存乐句文件。");
        sources.CheckDestination(destination);
        var capture = Document;
        await PhraseArchive.SaveAsync(capture, destination, overwrite: true, cancellationToken);
        SavedPath = destination;
        SavedSha256 = null;
        savedSnapshot = capture;
        try
        {
            SavedSha256 = await PhraseArchive.FileHashAsync(destination, CancellationToken.None);
            await FlushDraftAsync(CancellationToken.None);
            SetStatus("已保存：" + destination);
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
        {
            // The user file has already been committed. Do not misreport draft failure as file-save failure.
            SetStatus("乐句文件已保存；本机恢复稿更新失败：" + ex.Message);
        }
        Changed?.Invoke();
        return true;
    }

    private void SetStatus(string value) { Status = value; Changed?.Invoke(); }
    private static string SafeName(string name) => string.Join("_", name.Split(Path.GetInvalidFileNameChars(), StringSplitOptions.RemoveEmptyEntries));

    internal void DiscardDraft() => store.Clear();

    public async ValueTask DisposeAsync()
    {
        if (closing) return;
        closing = true; draftCts?.Cancel(); await draftTask; await audio.DisposeAsync();
        Dispose();
    }
}
