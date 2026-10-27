using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Persistence;
using RootSound.SongStudio.Audio;
using RootSound.SongStudio.Controls;
using RootSound.SongStudio.Core;
using RootSound.SongStudio.Persistence;

namespace RootSound.SongStudio;

internal sealed class MainForm : Form
{
    private readonly SongHistory history = new();
    private readonly SongPlayback playback;
    private readonly SongDraft draft;
    private readonly SemaphoreSlim draftGate = new(1, 1);
    private readonly PlaylistView timeline = new() { Dock = DockStyle.Fill };
    private readonly ListBox library = new() { Dock = DockStyle.Fill, DrawMode = DrawMode.OwnerDrawFixed, ItemHeight = 64, BorderStyle = BorderStyle.None, IntegralHeight = false };
    private readonly FlowLayoutPanel toolbar = Flow(), projectBar = Flow(), clipBar = Flow(), trackBar = Flow();
    private readonly Label status = new() { Dock = DockStyle.Fill, AutoEllipsis = true, TextAlign = ContentAlignment.MiddleLeft, Height = 30 };
    private readonly Label position = new() { AutoSize = true, Margin = new(10, 9, 8, 5), Text = "第 1 小节 · 第 1 拍" };
    private readonly Label selectedName = new() { AutoSize = false, AutoEllipsis = true, Width = 172, Height = 24, Margin = new(8, 9, 8, 5) };
    private readonly TextBox songName = new() { Width = 160, MaxLength = 240 };
    private readonly NumericUpDown tempo = Number(20, 300, 120), master = Number(-60, 12, -6, 1);
    private readonly NumericUpDown bar = Number(1, 2048, 1), beat = Number(1, 4.999m, 1, 3), clipGain = Number(-60, 12, 0, 1), trackGain = Number(-60, 12, 0, 1);
    private readonly ComboBox clipTrack = new() { DropDownStyle = ComboBoxStyle.DropDownList, Width = 120 };
    private readonly TextBox trackName = new() { Width = 120, MaxLength = 240 };
    private readonly CheckBox followTempo = new() { Text = "跟随歌曲速度", AutoSize = true, Margin = new(8, 8, 4, 4) };
    private readonly CheckBox muted = new() { Text = "静音轨道", AutoSize = true, Margin = new(8, 8, 4, 4) };
    private readonly ComboBox snap = new() { DropDownStyle = ComboBoxStyle.DropDownList, Width = 88 };
    private readonly TrackBar zoom = new() { Minimum = 12, Maximum = 160, Value = 48, TickStyle = TickStyle.None, Width = 135, Height = 28 };
    private readonly Button play, undo, redo, cancel = new() { Text = "取消操作", AutoSize = true, Visible = false };
    private readonly System.Windows.Forms.Timer timer = new() { Interval = 33 };
    private readonly Control libraryCommands;
    private SongDocument? savedDocument, lastDraft;
    private string? savedPath, savedHash, lastError;
    private CancellationTokenSource? operation;
    private bool updating, busy, draftRunning, closing, readyToClose;
    private DateTime draftDue = DateTime.MaxValue;
    private Point libraryDown;
    private string message = "导入乐句后，从左侧拖到右侧时间线。双击列表中的乐句也可以放入。";
    private SongDocument Song => history.Current;
    private bool Dirty => !ReferenceEquals(Song, savedDocument);

    internal MainForm(bool recoverDraft = true, SongPlayback? testPlayback = null, string? draftRoot = null)
    {
        Text = "歌曲编排 · RootSound"; Font = new("Microsoft YaHei UI", 10);
        BackColor = Color.FromArgb(25, 29, 38); ForeColor = Color.FromArgb(225, 231, 240);
        AutoScaleMode = AutoScaleMode.Dpi; ClientSize = new(1320, 850); MinimumSize = new(1050, 720); KeyPreview = true;
        playback = testPlayback ?? new SongPlayback();
        draft = new(draftRoot ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RootSoundExperiments", "SongStudio"));
        var root = new TableLayoutPanel { Dock = DockStyle.Fill, RowCount = 6, ColumnCount = 1, Padding = new(8) };
        root.RowStyles.Add(new(SizeType.AutoSize)); root.RowStyles.Add(new(SizeType.AutoSize)); root.RowStyles.Add(new(SizeType.Percent, 100));
        root.RowStyles.Add(new(SizeType.AutoSize)); root.RowStyles.Add(new(SizeType.AutoSize)); root.RowStyles.Add(new(SizeType.Absolute, 32));
        Controls.Add(root); root.Controls.Add(toolbar, 0, 0); root.Controls.Add(projectBar, 0, 1);
        toolbar.Controls.Add(Btn("新建", async () => await NewAsync()));
        toolbar.Controls.Add(Btn("打开歌曲", async () => await OpenAsync()));
        toolbar.Controls.Add(Btn("保存歌曲项目", async () => await SaveAsync(false)));
        toolbar.Controls.Add(Btn("另存为", async () => await SaveAsync(true)));
        toolbar.Controls.Add(Btn("导出 WAV", async () => await ExportAsync()));
        play = Btn("播放 / 暂停", TogglePlay); toolbar.Controls.Add(play);
        toolbar.Controls.Add(Btn("停止", () => { playback.Stop(); timeline.SetCursor(0); }));
        undo = Btn("撤销", () => { history.Undo(); RefreshSong(); }); redo = Btn("重做", () => { history.Redo(); RefreshSong(); });
        toolbar.Controls.Add(undo); toolbar.Controls.Add(redo); toolbar.Controls.Add(position);
        projectBar.Controls.AddRange([Caption("歌曲名"), songName, Caption("歌曲速度"), tempo, Caption("总音量 dB"), master,
            Caption("吸附"), snap, Caption("缩放"), zoom, Btn("＋轨道", AddTrack)]);
        snap.Items.AddRange(["自由", "1/4 拍", "1 拍", "1 小节"]); snap.SelectedIndex = 1;
        var body = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2, RowCount = 1, Margin = new(0, 6, 0, 4) };
        body.ColumnStyles.Add(new(SizeType.Absolute, 236)); body.ColumnStyles.Add(new(SizeType.Percent, 100)); root.Controls.Add(body, 0, 2);
        var left = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 4, Margin = new(0, 0, 8, 0) };
        left.RowStyles.Add(new(SizeType.AutoSize)); left.RowStyles.Add(new(SizeType.Percent, 100)); left.RowStyles.Add(new(SizeType.AutoSize)); left.RowStyles.Add(new(SizeType.AutoSize));
        left.Controls.Add(Caption("已导入的乐句"), 0, 0); left.Controls.Add(library, 0, 1);
        var actions = Flow(); libraryCommands = actions;
        actions.Controls.Add(Btn("导入乐句", async () => await ImportAsync()));
        actions.Controls.Add(Btn("放入", PlaceSelected)); actions.Controls.Add(Btn("移除", RemovePhrase)); left.Controls.Add(actions, 0, 2);
        var hint = new Label { Text = "导入 .rsphrase 乐句文件\n拖拽放置，双击也能放入\n拖动乐句块调整位置\nShift：自由微调\nCtrl＋滚轮：缩放\nShift＋滚轮：横向滚动\n双击轨道名：切换静音", AutoSize = true, ForeColor = Color.FromArgb(151, 166, 188), Margin = new(5, 10, 3, 8) };
        left.Controls.Add(hint, 0, 3); body.Controls.Add(left, 0, 0); body.Controls.Add(timeline, 1, 0);
        clipBar.Controls.AddRange([selectedName, Caption("小节"), bar, Caption("拍"), beat, Caption("轨道"), clipTrack,
            Caption("乐句音量 dB"), clipGain, followTempo, Btn("复制", DuplicateClip), Btn("删除乐句块", DeleteClip)]);
        trackBar.Controls.AddRange([Caption("选中轨道"), trackName, Caption("轨道音量 dB"), trackGain, muted,
            Btn("删除空轨道", RemoveTrack)]);
        foreach (var field in new Control[] { songName, tempo, master, bar, beat, clipGain, trackGain, clipTrack, trackName, snap })
        { field.BackColor = Color.FromArgb(39, 46, 61); field.ForeColor = Color.FromArgb(235, 240, 249); }
        root.Controls.Add(clipBar, 0, 3); root.Controls.Add(trackBar, 0, 4);
        var statusRow = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2 }; statusRow.ColumnStyles.Add(new(SizeType.Percent, 100)); statusRow.ColumnStyles.Add(new(SizeType.AutoSize));
        statusRow.Controls.Add(status, 0, 0); statusRow.Controls.Add(cancel, 1, 0); root.Controls.Add(statusRow, 0, 5);
        library.BackColor = Color.FromArgb(33, 39, 51); library.ForeColor = ForeColor;
        library.DrawItem += DrawLibrary; library.MouseDown += (_, e) => libraryDown = e.Location;
        library.MouseMove += DragLibrary; library.DoubleClick += (_, _) => PlaceSelected();
        timeline.PhraseDropped += (id, track, tick) => Try(() => Place(id, track, tick));
        timeline.ClipMoved += (id, track, tick) => Try(() => Apply(Song with { Clips = Song.Clips.Select(c => c.Id == id ? c with { TrackId = track, StartTick = tick } : c).ToArray() }));
        timeline.SelectionChanged += RefreshSelection;
        timeline.SeekRequested += tick => { playback.Seek(tick); timeline.SetCursor(tick); };
        timeline.TrackDoubleClicked += id => Try(() => Apply(Song with { Tracks = Song.Tracks.Select(t => t.Id == id ? t with { Muted = !t.Muted } : t).ToArray() }));
        timeline.ZoomChanged += value => { updating = true; zoom.Value = Math.Clamp((int)value, zoom.Minimum, zoom.Maximum); updating = false; };
        zoom.ValueChanged += (_, _) => { if (!updating) timeline.SetZoom(zoom.Value); };
        snap.SelectedIndexChanged += (_, _) => timeline.SnapTicks = snap.SelectedIndex switch { 1 => Timing.TicksPerStep, 2 => Timing.Ppq, 3 => Timing.TicksPerBar, _ => 0 };
        songName.Validated += (_, _) => Try(() => { if (!updating && songName.Text.Trim() != Song.Name) Apply(Song with { Name = songName.Text.Trim() }); });
        tempo.ValueChanged += (_, _) => Try(() => { if (!updating) Apply(Song with { Tempo = (double)tempo.Value }); });
        master.ValueChanged += (_, _) => Try(() => { if (!updating) Apply(Song with { GainDb = (double)master.Value }); });
        foreach (var numeric in new[] { bar, beat, clipGain }) numeric.ValueChanged += (_, _) => UpdateClip();
        clipTrack.SelectedIndexChanged += (_, _) => UpdateClip(); followTempo.CheckedChanged += (_, _) => UpdateClip();
        trackName.Validated += (_, _) => UpdateTrack(); trackGain.ValueChanged += (_, _) => UpdateTrack(); muted.CheckedChanged += (_, _) => UpdateTrack();
        cancel.Click += (_, _) => operation?.Cancel();
        timer.Tick += async (_, _) => await TickAsync(); timer.Start();
        FormClosing += ClosingAsync;
        savedDocument = Song; RefreshSong();
        if (recoverDraft) Shown += async (_, _) => await RecoverAsync();
    }
    private static FlowLayoutPanel Flow() => new() { Dock = DockStyle.Fill, AutoSize = true, WrapContents = true, Margin = new(0), Padding = new(0, 2, 0, 2) };
    private static Label Caption(string text) => new() { Text = text, AutoSize = true, Margin = new(6, 9, 4, 4) };
    private static NumericUpDown Number(decimal min, decimal max, decimal value, int decimals = 0) => new()
    { Minimum = min, Maximum = max, Value = value, DecimalPlaces = decimals, Increment = decimals > 0 ? .1m : 1, Width = decimals == 3 ? 83 : 70, Margin = new(2, 4, 4, 3) };
    private Button Btn(string label, Action action)
    {
        var b = new Button { Text = label, AutoSize = true, Height = 31, FlatStyle = FlatStyle.Flat, BackColor = Color.FromArgb(47, 57, 74), ForeColor = ForeColor, Margin = new(3) };
        b.Click += (_, _) => Try(action); return b;
    }
    private sealed record LibraryItem(Guid Id, string Name, string Detail);
    private sealed record TrackItem(Guid Id, string Name) { public override string ToString() => Name; }
    private void DrawLibrary(object? sender, DrawItemEventArgs e)
    {
        if (e.Index < 0) return; e.DrawBackground(); var item = (LibraryItem)library.Items[e.Index];
        TextRenderer.DrawText(e.Graphics, item.Name, Font, new Rectangle(e.Bounds.X + 8, e.Bounds.Y + 6, e.Bounds.Width - 16, 25), e.ForeColor,
            TextFormatFlags.EndEllipsis | TextFormatFlags.SingleLine);
        TextRenderer.DrawText(e.Graphics, item.Detail, Font, new Rectangle(e.Bounds.X + 8, e.Bounds.Y + 32, e.Bounds.Width - 16, 23), e.ForeColor,
            TextFormatFlags.EndEllipsis | TextFormatFlags.SingleLine); e.DrawFocusRectangle();
    }
    private void DragLibrary(object? sender, MouseEventArgs e)
    {
        if (busy || e.Button != MouseButtons.Left || library.SelectedItem is not LibraryItem item ||
            Math.Abs(e.X - libraryDown.X) + Math.Abs(e.Y - libraryDown.Y) < 5) return;
        var data = new DataObject(); data.SetData(PlaylistView.PhraseDragFormat, item.Id.ToString()); library.DoDragDrop(data, DragDropEffects.Copy);
    }
    private void Apply(SongDocument song)
    {
        if (song == Song || song.Name == Song.Name && song.Tempo == Song.Tempo && song.GainDb == Song.GainDb &&
            song.Phrases.SequenceEqual(Song.Phrases) && song.Tracks.SequenceEqual(Song.Tracks) && song.Clips.SequenceEqual(Song.Clips)) return;
        // Compile before accepting the edit, so an unplayable overlap never replaces the current song.
        playback.SetDocument(song); history.Apply(song); RefreshSong(false);
    }
    private void RefreshSong(bool updatePlayback = true)
    {
        if (updatePlayback) playback.SetDocument(Song);
        updating = true;
        try
        {
            songName.Text = Song.Name; tempo.Value = (decimal)Song.Tempo; master.Value = (decimal)Song.GainDb;
            var selected = (library.SelectedItem as LibraryItem)?.Id;
            library.BeginUpdate(); library.Items.Clear();
            foreach (var item in Song.Phrases)
            {
                int i = library.Items.Add(new LibraryItem(item.Id, item.Name, $"{item.Phrase.Bars} 小节 · {item.Phrase.Tempo:0.#} BPM"));
                if (item.Id == selected) library.SelectedIndex = i;
            }
            library.EndUpdate(); timeline.SetSong(Song);
            clipTrack.Items.Clear(); foreach (var track in Song.Tracks) clipTrack.Items.Add(new TrackItem(track.Id, track.Name));
        }
        finally { updating = false; }
        RefreshSelection(); undo.Enabled = history.CanUndo; redo.Enabled = history.CanRedo;
        Text = $"{(Dirty ? "* " : "")}{Song.Name} · 歌曲编排";
        if (Dirty) draftDue = DateTime.UtcNow.AddSeconds(2); else draftDue = DateTime.MaxValue;
    }
    private void RefreshSelection()
    {
        updating = true;
        try
        {
            var clip = Song.Clips.FirstOrDefault(c => c.Id == timeline.SelectedClip);
            clipBar.Enabled = clip is not null && !busy;
            selectedName.Text = clip is null ? "选中乐句块后调整" : Song.Phrases.First(p => p.Id == clip.PhraseId).Name;
            if (clip is not null)
            {
                bar.Value = clip.StartTick / Timing.TicksPerBar + 1;
                beat.Value = 1 + (decimal)(clip.StartTick % Timing.TicksPerBar) / Timing.Ppq;
                clipGain.Value = (decimal)clip.GainDb; followTempo.Checked = clip.FollowSongTempo;
                clipTrack.SelectedIndex = Song.Tracks.ToList().FindIndex(t => t.Id == clip.TrackId);
            }
            var track = Song.Tracks.First(t => t.Id == timeline.SelectedTrack);
            trackName.Text = track.Name; trackGain.Value = (decimal)track.GainDb; muted.Checked = track.Muted;
        }
        finally { updating = false; }
    }
    private void UpdateClip()
    {
        if (updating || busy || Song.Clips.FirstOrDefault(c => c.Id == timeline.SelectedClip) is not { } clip || clipTrack.SelectedItem is not TrackItem track) return;
        Try(() => Apply(Song with { Clips = Song.Clips.Select(c => c.Id == clip.Id ? c with { TrackId = track.Id,
            StartTick = (long)((bar.Value - 1) * Timing.TicksPerBar + Math.Round((beat.Value - 1) * Timing.Ppq)),
            GainDb = (double)clipGain.Value, FollowSongTempo = followTempo.Checked } : c).ToArray() }));
    }
    private void UpdateTrack()
    {
        if (updating || busy) return;
        Try(() => Apply(Song with { Tracks = Song.Tracks.Select(t => t.Id == timeline.SelectedTrack ? t with
        { Name = trackName.Text.Trim(), GainDb = (double)trackGain.Value, Muted = muted.Checked } : t).ToArray() }));
    }
    private void Place(Guid id, Guid track, long tick)
    {
        var next = SongRules.Place(Song, id, track, tick); Apply(next); timeline.SelectClip(next.Clips[^1].Id);
        message = "已放入乐句。拖动可调整位置；复制可接在后面。";
    }
    private void PlaceSelected()
    {
        if (busy || library.SelectedItem is not LibraryItem item) return;
        Place(item.Id, timeline.SelectedTrack, SongRules.Snap(playback.Snapshot.Tick, timeline.SnapTicks));
    }
    private void DuplicateClip()
    {
        if (Song.Clips.FirstOrDefault(c => c.Id == timeline.SelectedClip) is not { } clip) return;
        var copy = clip with { Id = Guid.NewGuid(), StartTick = (long)Math.Round(clip.StartTick + SongRules.ClipTicks(Song, clip)) };
        Apply(Song with { Clips = Song.Clips.Append(copy).ToArray() }); timeline.SelectClip(copy.Id);
    }
    private void DeleteClip()
    {
        if (timeline.SelectedClip is null) return;
        Apply(Song with { Clips = Song.Clips.Where(c => c.Id != timeline.SelectedClip).ToArray() });
    }
    private void RemovePhrase()
    {
        if (library.SelectedItem is not LibraryItem item) return;
        if (Song.Clips.Any(c => c.PhraseId == item.Id)) { message = "这个乐句仍在时间线上使用，请先删除它的乐句块。"; return; }
        Apply(Song with { Phrases = Song.Phrases.Where(p => p.Id != item.Id).ToArray() });
    }
    private void AddTrack() => Apply(Song with { Tracks = Song.Tracks.Append(new SongTrack(Guid.NewGuid(),
        PhraseFactory.UniqueName("新轨道", Song.Tracks.Select(t => t.Name)))).ToArray() });
    private void RemoveTrack()
    {
        if (Song.Tracks.Count == 1 || Song.Clips.Any(c => c.TrackId == timeline.SelectedTrack)) { message = "只可删除空轨道，且至少保留一条轨道。"; return; }
        Apply(Song with { Tracks = Song.Tracks.Where(t => t.Id != timeline.SelectedTrack).ToArray() });
    }
    private void TogglePlay()
    {
        if (Song.Clips.Count == 0) { message = "先把乐句放到时间线上。"; return; }
        if (playback.Snapshot.Playing) playback.Pause(); else playback.Play();
    }
    private async Task ImportAsync()
    {
        using var dialog = new OpenFileDialog { Title = "导入乐句", Filter = "RootSound 乐句 (*.rsphrase)|*.rsphrase", Multiselect = true };
        if (dialog.ShowDialog(this) != DialogResult.OK) return;
        var before = Song;
        await WorkAsync("正在导入乐句…", async token =>
        {
            var next = await Task.Run(() =>
            {
                var list = before.Phrases.ToList();
                if (list.Count + dialog.FileNames.Length > SongRules.MaximumPhrases) throw new InvalidOperationException("最多导入 64 个乐句。 ");
                foreach (string path in dialog.FileNames)
                {
                    token.ThrowIfCancellationRequested(); var phrase = PhraseArchive.Load(path, token);
                    list.Add(new(Guid.NewGuid(), PhraseFactory.UniqueName(phrase.Name, list.Select(p => p.Name)), phrase));
                    SongRules.Validate(before with { Phrases = list });
                }
                return before with { Phrases = list.ToArray() };
            }, token);
            Apply(next); message = $"已导入 {dialog.FileNames.Length} 个乐句，拖到时间线上即可编排。";
        });
    }
    private async Task<bool> SaveAsync(bool saveAs)
    {
        if (busy) return false;
        // Ctrl+S also commits the text field that still owns keyboard focus.
        try
        {
            ValidateChildren();
            Apply(Song with { Name = songName.Text.Trim(), Tracks = Song.Tracks.Select(t => t.Id == timeline.SelectedTrack ?
                t with { Name = trackName.Text.Trim() } : t).ToArray() });
        }
        catch (Exception ex) { ShowError(ex); return false; }
        string? path = saveAs ? null : savedPath;
        if (path is not null && File.Exists(path))
        {
            string current;
            try { current = await PhraseArchive.FileHashAsync(path); }
            catch (Exception ex) { ShowError(ex); return false; }
            if (savedHash != current) { message = "原项目在其他位置被修改，请另存为新文件。"; path = null; }
        }
        if (path is null)
        {
            using var dialog = new SaveFileDialog { Title = "保存可继续编辑的歌曲项目", Filter = "RootSound 歌曲项目 (*.rssong)|*.rssong", DefaultExt = "rssong", FileName = SafeName(Song.Name) + ".rssong" };
            if (dialog.ShowDialog(this) != DialogResult.OK) return false; path = dialog.FileName;
        }
        if (!string.Equals(Path.GetExtension(path), ".rssong", StringComparison.OrdinalIgnoreCase)) { message = "歌曲项目请使用 .rssong 扩展名。"; return false; }
        string target = path; var snapshot = Song;
        return await WorkAsync("正在保存歌曲项目…", async token =>
        {
            await Task.Run(() => SongArchive.Save(snapshot, target, true, token), token);
            savedHash = await PhraseArchive.FileHashAsync(target); savedPath = target; savedDocument = snapshot;
            await ClearDraftAsync(); RefreshSong(false); message = "歌曲项目已保存，乐句和音色已一起装入文件。";
        });
    }
    private async Task OpenAsync()
    {
        using var dialog = new OpenFileDialog { Title = "打开歌曲项目", Filter = "RootSound 歌曲项目 (*.rssong)|*.rssong" };
        if (dialog.ShowDialog(this) != DialogResult.OK || !await ConfirmLeaveAsync()) return;
        string path = dialog.FileName;
        await WorkAsync("正在打开歌曲项目…", async token =>
        {
            string beforeHash = await PhraseArchive.FileHashAsync(path, token);
            var loaded = await Task.Run(() => SongArchive.Load(path, token), token);
            string hash = await PhraseArchive.FileHashAsync(path, token);
            if (beforeHash != hash) throw new IOException("歌曲项目在读取期间被其他程序修改，请重新打开。 ");
            // A failed load/compile leaves the current document available.
            playback.SetDocument(loaded); playback.Stop(); history.Reset(loaded);
            savedDocument = loaded; savedPath = path; savedHash = hash;
            await ClearDraftAsync(); RefreshSong(false); message = "歌曲项目已打开。";
        });
    }
    private async Task NewAsync()
    {
        if (!await ConfirmLeaveAsync()) return;
        playback.Stop(); history.Reset(SongRules.New()); savedDocument = Song; savedPath = savedHash = null;
        await ClearDraftAsync(); RefreshSong(); message = "已新建歌曲。";
    }
    private async Task ExportAsync()
    {
        if (Song.Clips.Count == 0) { message = "先把乐句放到时间线上。"; return; }
        using var dialog = new SaveFileDialog { Title = "导出整首歌曲", Filter = "WAV 音频 (*.wav)|*.wav", DefaultExt = "wav", FileName = SafeName(Song.Name) + ".wav" };
        if (dialog.ShowDialog(this) != DialogResult.OK) return;
        if (!string.Equals(Path.GetExtension(dialog.FileName), ".wav", StringComparison.OrdinalIgnoreCase)) { message = "音频请使用 .wav 扩展名。"; return; }
        var snapshot = Song;
        await WorkAsync("正在导出 WAV…", async token =>
        {
            var progress = new Progress<int>(p => message = $"正在导出 WAV… {p}%");
            await Task.Run(() => SongWaveExporter.Export(snapshot, dialog.FileName, true, token, progress), token);
            message = "WAV 已导出：48 kHz / 24 位 / 立体声。";
        });
    }
    private async Task<bool> WorkAsync(string text, Func<CancellationToken, Task> work)
    {
        if (busy) return false;
        busy = true; operation = new(); playback.Pause(); message = text; SetBusy(true);
        try { await work(operation.Token); return true; }
        catch (OperationCanceledException) { message = "操作已取消，原有文件保持完整。"; return false; }
        catch (Exception ex) when (ex is not OutOfMemoryException) { ShowError(ex); return false; }
        finally { operation.Dispose(); operation = null; busy = false; SetBusy(false); }
    }
    private void SetBusy(bool value)
    {
        toolbar.Enabled = projectBar.Enabled = libraryCommands.Enabled = library.Enabled = timeline.Enabled = trackBar.Enabled = !value;
        cancel.Visible = value; RefreshSelection();
    }
    private async Task TickAsync()
    {
        if (closing) return;
        var s = playback.Snapshot; timeline.SetCursor(s.Tick, s.Playing); play.Text = s.Playing ? "暂停" : "播放";
        position.Text = $"第 {(long)(s.Tick / Timing.TicksPerBar) + 1} 小节 · 第 {s.Tick % Timing.TicksPerBar / Timing.Ppq + 1:0.00} 拍";
        if (s.Error is { } error && error != lastError) { lastError = error; message = "播放遇到问题：" + error; }
        status.Text = message;
        if (!busy && !draftRunning && Dirty && !ReferenceEquals(lastDraft, Song) && DateTime.UtcNow >= draftDue)
        {
            draftRunning = true; var snapshot = Song;
            await draftGate.WaitAsync();
            try { await Task.Run(() => draft.Save(snapshot, CancellationToken.None)); lastDraft = snapshot; }
            catch (Exception ex) { message = "自动恢复副本未能保存，请手动保存歌曲项目：" + ex.Message; draftDue = DateTime.UtcNow.AddMinutes(1); }
            finally { draftGate.Release(); draftRunning = false; }
        }
    }
    private async Task ClearDraftAsync()
    {
        await draftGate.WaitAsync();
        try { draft.Clear(); lastDraft = null; }
        finally { draftGate.Release(); }
    }
    private async Task RecoverAsync()
    {
        if (!draft.Exists) return;
        if (MessageBox.Show(this, "发现上次未保存的歌曲，是否恢复？", "恢复歌曲", MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes)
        { await ClearDraftAsync(); return; }
        await WorkAsync("正在恢复歌曲…", async token =>
        {
            var loaded = await Task.Run(() => draft.Load(token), token);
            playback.SetDocument(loaded); history.Reset(loaded); savedDocument = null; savedPath = savedHash = null;
            lastDraft = loaded; RefreshSong(false); message = "歌曲已恢复，请保存为歌曲项目。";
        });
    }
    private async Task<bool> ConfirmLeaveAsync()
    {
        if (!Dirty) return true;
        var choice = MessageBox.Show(this, "当前歌曲有未保存的修改，是否保存？", "保存歌曲", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Question);
        return choice == DialogResult.No || choice == DialogResult.Yes && await SaveAsync(false);
    }
    private async void ClosingAsync(object? sender, FormClosingEventArgs e)
    {
        if (readyToClose) return; e.Cancel = true;
        if (closing) return;
        if (busy) { message = "请先等待当前操作完成，或点击“取消操作”。"; return; }
        if (!await ConfirmLeaveAsync()) return;
        closing = true; timer.Stop();
        try { await ClearDraftAsync(); await playback.DisposeAsync(); }
        catch (Exception ex) { message = ex.Message; }
        readyToClose = true; Close();
    }
    protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
    {
        if (busy) return base.ProcessCmdKey(ref msg, keyData);
        bool editing = ActiveControl is TextBoxBase or NumericUpDown || ContainsFocus && (songName.ContainsFocus || trackName.ContainsFocus || bar.ContainsFocus || beat.ContainsFocus || clipGain.ContainsFocus || tempo.ContainsFocus || master.ContainsFocus || trackGain.ContainsFocus);
        if (keyData == (Keys.Control | Keys.S)) { _ = SaveAsync(false); return true; }
        if (!editing)
        {
            if (keyData == Keys.Space) { Try(TogglePlay); return true; }
            if (keyData == Keys.Delete) { Try(DeleteClip); return true; }
            if (keyData == (Keys.Control | Keys.D)) { Try(DuplicateClip); return true; }
            if (keyData == (Keys.Control | Keys.Z)) { Try(() => { history.Undo(); RefreshSong(); }); return true; }
            if (keyData == (Keys.Control | Keys.Y)) { Try(() => { history.Redo(); RefreshSong(); }); return true; }
        }
        return base.ProcessCmdKey(ref msg, keyData);
    }
    private static string SafeName(string name) => string.Concat(name.Select(c => Path.GetInvalidFileNameChars().Contains(c) ? '_' : c));
    private void Try(Action action) { try { action(); } catch (Exception ex) when (ex is not OutOfMemoryException) { ShowError(ex); RefreshSelection(); } }
    private void ShowError(Exception ex) { message = ex.Message; MessageBox.Show(this, ex.Message, "歌曲编排", MessageBoxButtons.OK, MessageBoxIcon.Information); }
    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            timer.Stop(); timer.Dispose(); operation?.Cancel();
            playback.DisposeAsync().AsTask().GetAwaiter().GetResult();
        }
        base.Dispose(disposing);
    }
}
