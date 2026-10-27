using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Playback;
using RootSound.SampleEditor.Core;
using RootSound.TimbreLab.Audio;
using RootSound.TimbreLab.Controls;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;
using RootSound.TimbreLab.Processing;

namespace RootSound.TimbreLab;

public sealed class MainForm : Form
{
    private readonly SampleWorkspace _workspace = new();
    private readonly SourceProtection _protection = new();
    private readonly ListBox _samples = new() { Dock = DockStyle.Fill, IntegralHeight = false };
    private readonly SampleGraph _graph = new() { Dock = DockStyle.Fill };
    private readonly ToolStrip _toolbar = new() { GripStyle = ToolStripGripStyle.Hidden, Padding = new Padding(8, 6, 8, 6) };
    private readonly ToolStripButton _import = new("导入采样…"), _open = new("打开音色…"), _save = new("保存音色…"), _export = new("导出 WAV…"), _cancel = new("取消");
    private readonly Button _primary = new() { Text = "设为主采样", AutoSize = true }, _remove = new() { Text = "移除", AutoSize = true };
    private readonly Button _play = new() { Text = "试听采样", AutoSize = true }, _stop = new() { Text = "停止", AutoSize = true };
    private readonly Button _zoomIn = new() { Text = "+", AutoSize = true }, _zoomOut = new() { Text = "−", AutoSize = true }, _fit = new() { Text = "全图", AutoSize = true };
    private readonly NumericUpDown _zoom = Number(1, 10000, 1, 2, .25m);
    private readonly HScrollBar _pan = new() { Width = 180, Height = 20, Maximum = 10000, LargeChange = 1000, SmallChange = 100 };
    private readonly Button _reset = new() { Text = "清理归零", AutoSize = true }, _apply = new() { Text = "重新处理", AutoSize = true };
    private readonly CheckBox _compare = new() { Text = "听原声", AutoSize = true }, _autoPitch = new() { Text = "自动识别", Checked = true, AutoSize = true };
    private readonly CheckBox _loop = new() { Text = "延音循环", AutoSize = true };
    private readonly NumericUpDown _start = Number(0, 30, 0, 3, .001m), _end = Number(0, 30, 0, 3, .001m);
    private readonly NumericUpDown _attack = Number(0, 5, .005m, 3, .005m), _decay = Number(0, 5, .15m, 3, .01m);
    private readonly NumericUpDown _sustain = Number(0, 100, 80, 0, 1), _release = Number(0, 10, .2m, 3, .01m);
    private readonly NumericUpDown _gain = Number(-60, 24, 0, 1, .5m), _held = Number(.1m, 5, 1, 2, .1m);
    private readonly NumericUpDown _loopStart = Number(0, 30, 0, 3, .001m), _loopEnd = Number(0, 30, 0, 3, .001m);
    private readonly NumericUpDown _crossfade = Number(0, 1000, 15, 1, 1), _cents = Number(-50, 50, 0, 1, 1);
    private readonly ComboBox _root = new() { DropDownStyle = ComboBoxStyle.DropDownList, Width = 105 };
    private readonly TextBox _name = new() { Text = "我的音色", Width = 220, MaxLength = 120 };
    private readonly TrackBar _denoise = Slider(25), _common = Slider(50), _tonal = Slider(25);
    private readonly NumericUpDown _highPass = Number(0, 3000, 30, 0, 10), _lowPass = Number(100, 192000, 18000, 0, 100);
    private readonly Label _pitch = new() { Text = "导入后识别", AutoSize = true }, _notes = new() { AutoSize = false, AutoEllipsis = true, Dock = DockStyle.Fill, ForeColor = Color.FromArgb(82, 100, 112) };
    private readonly ToolStripStatusLabel _status = new("导入同一音色的短采样；第一段作为主采样。") { Spring = true, TextAlign = ContentAlignment.MiddleLeft };
    private readonly ToolStripProgressBar _progress = new() { Minimum = 0, Maximum = 1000, Visible = false, Width = 130 };
    private readonly ReferenceKeyboard _keys = new();
    private readonly RadioButton _pianoMode = new() { Text = "钢琴模式", Appearance = Appearance.Button, AutoSize = true, Checked = true };
    private readonly RadioButton _sampleMode = new() { Text = "采样模式", Appearance = Appearance.Button, AutoSize = true };
    private readonly Button _lowerKeys = new() { Text = "◀ 低八度", AutoSize = true }, _middleKeys = new() { Text = "中央 C4", AutoSize = true }, _higherKeys = new() { Text = "高八度 ▶", AutoSize = true };
    private readonly Label _keyPitch = new() { Text = "A0–C8 · 88 键", AutoSize = true, Margin = new Padding(8, 7, 0, 0) };
    private readonly Panel _settings = new() { Dock = DockStyle.Fill };
    private readonly System.Windows.Forms.Timer _debounce = new() { Interval = 550 }, _playTimer = new() { Interval = 30 };
    private readonly ToolTip _tips = new();
    private readonly AuditionSession _audition;
    private CancellationTokenSource? _processCts, _operationCts, _auditionCts;
    private Task _processTask = Task.CompletedTask, _operationTask = Task.CompletedTask, _auditionTask = Task.CompletedTask;
    private IAuditionVoice? _player => _audition.Current;
    private PcmClip? _originalPreview;
    private double _detectedRoot = 60;
    private bool _suppress, _busy, _processing, _closing, _closed;
    private string? _lastPlaybackError;
    private bool _seeking, _resumeAfterSeek;
    private long _seekRevision;
    private IAuditionVoice? _seekVoice;

    public MainForm() : this(new AuditionSession()) { }

    internal MainForm(AuditionSession audition)
    {
        _audition = audition;
        Text = "音色打磨 · RootSound 实验";
        AutoScaleMode = AutoScaleMode.Dpi;
        Font = new Font("Microsoft YaHei UI", 9);
        BackColor = Color.FromArgb(245, 247, 249);
        ClientSize = new Size(1210, 810);
        MinimumSize = new Size(980, 780);
        StartPosition = FormStartPosition.CenterScreen;
        BuildInterface();
        HookEvents();
        Shown += (_, _) => { _playTimer.Start(); _keys.CenterOn(60); };
        UpdateEnabled();
    }

    private void BuildInterface()
    {
        _toolbar.Items.AddRange([_import, _open, new ToolStripSeparator(), _save, _export, new ToolStripSeparator(), _cancel]);
        _toolbar.Dock = DockStyle.Top;
        var status = new StatusStrip();
        status.Items.AddRange([_status, _progress]);
        var body = new TableLayoutPanel { Dock = DockStyle.Fill, Padding = new Padding(12), ColumnCount = 2, RowCount = 1 };
        body.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 215));
        body.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        var left = new TableLayoutPanel { Dock = DockStyle.Fill, RowCount = 4, Padding = new Padding(0, 0, 12, 0) };
        left.RowStyles.Add(new RowStyle(SizeType.Absolute, 30));
        left.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        left.RowStyles.Add(new RowStyle(SizeType.Absolute, 42));
        left.RowStyles.Add(new RowStyle(SizeType.Absolute, 70));
        left.Controls.Add(new Label { Text = "采样 · 最多 8 段", AutoSize = true }, 0, 0);
        left.Controls.Add(_samples, 0, 1);
        left.Controls.Add(Row(_primary, _remove), 0, 2);
        left.Controls.Add(new Label { Text = "主采样决定声音。\n参考请选同一音色、不同伴奏的片段。", Dock = DockStyle.Fill, ForeColor = _notes.ForeColor }, 0, 3);
        body.Controls.Add(left, 0, 0);

        var right = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 6 };
        right.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        right.RowStyles.Add(new RowStyle(SizeType.Absolute, 70));
        right.RowStyles.Add(new RowStyle(SizeType.Absolute, 244));
        right.RowStyles.Add(new RowStyle(SizeType.Absolute, 37));
        right.RowStyles.Add(new RowStyle(SizeType.Absolute, 108));
        right.RowStyles.Add(new RowStyle(SizeType.Absolute, 47));
        right.Controls.Add(_graph, 0, 0);
        var trim = new Button { Text = "去首尾空白", AutoSize = true };
        trim.Click += (_, _) => TrimSilence();
        var graphTools = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 2, Margin = Padding.Empty };
        graphTools.RowStyles.Add(new RowStyle(SizeType.Absolute, 34));
        graphTools.RowStyles.Add(new RowStyle(SizeType.Absolute, 34));
        var transport = Row(_play, _stop, _compare, TextLabel("缩放"), _zoomOut, _zoom, TextLabel("×"), _zoomIn, _fit);
        var selection = Row(TextLabel("蓝线保留"), _start, TextLabel("至"), _end, TextLabel("秒"), trim, _pan);
        transport.Margin = selection.Margin = Padding.Empty;
        transport.AutoScroll = selection.AutoScroll = true;
        foreach (var button in new[] { _play, _stop, _zoomIn, _zoomOut, _fit, trim })
        { button.AutoSizeMode = AutoSizeMode.GrowAndShrink; button.Padding = new Padding(3, 0, 3, 0); button.Margin = new Padding(1); button.MinimumSize = new Size(28, 25); }
        _zoom.Width = 68; _pan.Margin = new Padding(6, 4, 0, 0);
        graphTools.Controls.Add(transport, 0, 0); graphTools.Controls.Add(selection, 0, 1);
        right.Controls.Add(graphTools, 0, 1);
        var tabs = new TabControl { Dock = DockStyle.Fill };
        var cleanupTab = new TabPage("清理干扰") { Padding = new Padding(9), BackColor = BackColor };
        var cleanup = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 3, RowCount = 4 };
        cleanup.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 110));
        cleanup.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        cleanup.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 100));
        AddSlider(cleanup, 0, "减少底噪", _denoise);
        AddSlider(cleanup, 1, "多段对照", _common);
        AddSlider(cleanup, 2, "减少打击声", _tonal);
        var filters = Row(TextLabel("低切 Hz"), _highPass, TextLabel("高切 Hz"), _lowPass, _apply, _reset);
        cleanup.Controls.Add(filters, 0, 3); cleanup.SetColumnSpan(filters, 3);
        cleanupTab.Controls.Add(cleanup);
        var performanceTab = new TabPage("演奏方式") { Padding = new Padding(9), BackColor = BackColor };
        var performance = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 4 };
        foreach (int i in Enumerable.Range(0, 4)) performance.RowStyles.Add(new RowStyle(SizeType.Absolute, i == 3 ? 70 : 39));
        performance.Controls.Add(Row(TextLabel("起音 s"), _attack, TextLabel("衰减 s"), _decay, TextLabel("保持 %"), _sustain, TextLabel("释音 s"), _release), 0, 0);
        var findLoop = new Button { Text = "寻找延音区", AutoSize = true };
        findLoop.Click += (_, _) => StartOperation(FindLoopAsync);
        performance.Controls.Add(Row(_loop, findLoop, TextLabel("起点 s"), _loopStart, TextLabel("终点 s"), _loopEnd, TextLabel("衔接 ms"), _crossfade), 0, 1);
        performance.Controls.Add(Row(TextLabel("音量 dB"), _gain, TextLabel("试听按键时长 s"), _held), 0, 2);
        performance.Controls.Add(new Label { Text = "图中蓝线决定保留片段；延音区在这里设置。琴键试听和保存音色采用保留片段，WAV 导出不加演奏包络。", Dock = DockStyle.Fill, ForeColor = _notes.ForeColor }, 0, 3);
        performanceTab.Controls.Add(performance);
        tabs.TabPages.AddRange([cleanupTab, performanceTab]);
        _settings.Controls.Add(tabs);
        right.Controls.Add(_settings, 0, 2);
        for (int midi = 0; midi <= 127; midi++) _root.Items.Add(NoteName(midi));
        _root.SelectedIndex = 60;
        right.Controls.Add(Row(TextLabel("原音高"), _autoPitch, _root, TextLabel("微调 音分"), _cents, _pitch), 0, 3);
        var keyboard = new TableLayoutPanel { Dock = DockStyle.Fill, Margin = Padding.Empty, ColumnCount = 1, RowCount = 2 };
        keyboard.RowStyles.Add(new RowStyle(SizeType.Absolute, 30)); keyboard.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        var keyboardTools = Row(_pianoMode, _sampleMode, _lowerKeys, _middleKeys, _higherKeys, _keyPitch);
        keyboardTools.Margin = Padding.Empty; keyboardTools.Padding = Padding.Empty;
        foreach (var button in new[] { _lowerKeys, _middleKeys, _higherKeys })
        { button.AutoSizeMode = AutoSizeMode.GrowAndShrink; button.Margin = new Padding(2, 1, 2, 0); }
        _pianoMode.Margin = _sampleMode.Margin = new Padding(1, 0, 3, 0);
        keyboard.Controls.Add(keyboardTools, 0, 0); keyboard.Controls.Add(_keys, 0, 1);
        right.Controls.Add(keyboard, 0, 4);
        right.Controls.Add(Row(TextLabel("音色名称"), _name, _notes), 0, 5);
        _notes.Width = 470; _notes.Height = 42; _notes.Dock = DockStyle.None;
        body.Controls.Add(right, 1, 0);
        Controls.Add(body); Controls.Add(_toolbar); Controls.Add(status);
        _tips.SetToolTip(_common, "需要至少一段同音色参考；不同音高会尝试对齐共同谐波。相同伴奏也可能被保留。");
        _tips.SetToolTip(_tonal, "更适合持续的乐音；较强处理也会削弱目标乐器起音。打击乐建议设为零。");
        _tips.SetToolTip(_denoise, "从采样中估计底噪，无法保证分离重叠乐器；越强越容易改变音色。");
        _tips.SetToolTip(_autoPitch, "识别的是最明显的周期性声音，混合乐器可能识别错。取消后可手动校准。");
        _export.ToolTipText = "只导出两条蓝线之间的处理后音频。";
        _save.ToolTipText = "只保留两条蓝线之间的处理后音频，并保存演奏设置。";
        _tips.SetToolTip(_graph, "红线：播放位置；蓝线：保留范围。拖动或 Shift 精调；Shift+滚轮缩放，中键拖动或滚轮平移。");
        _tips.SetToolTip(_pianoMode, "内置合成钢琴参考声，A4 = 440 Hz。先点“试听采样”听原调，再找相近的钢琴键。");
        _tips.SetToolTip(_sampleMode, "用蓝线之间的采样按琴键音高演奏；保留音色的原音高、起落、音量和循环设置。");
    }

    private static NumericUpDown Number(decimal minimum, decimal maximum, decimal value, int decimals, decimal step) =>
        new() { Minimum = minimum, Maximum = maximum, Value = value, DecimalPlaces = decimals, Increment = step, Width = decimals > 0 ? 80 : 73 };
    private static TrackBar Slider(int value) => new() { Minimum = 0, Maximum = 100, Value = value, TickStyle = TickStyle.None, Dock = DockStyle.Fill, Height = 33 };
    private static Label TextLabel(string text) => new() { Text = text, AutoSize = true, Margin = new Padding(3, 7, 3, 0) };
    private static FlowLayoutPanel Row(params Control[] controls)
    {
        var row = new FlowLayoutPanel { Dock = DockStyle.Fill, WrapContents = false, AutoSize = false, Padding = new Padding(0, 4, 0, 0) };
        row.Controls.AddRange(controls);
        return row;
    }
    private void AddSlider(TableLayoutPanel panel, int row, string label, TrackBar slider)
    {
        panel.RowStyles.Add(new RowStyle(SizeType.Absolute, 43));
        var value = TextLabel(slider.Value + "%");
        slider.ValueChanged += (_, _) => value.Text = slider.Value + "%";
        panel.Controls.Add(TextLabel(label), 0, row); panel.Controls.Add(slider, 1, row); panel.Controls.Add(value, 2, row);
    }

    private void HookEvents()
    {
        _keys.NotePressed += note => { _ = AuditionKeyAsync(note); };
        _lowerKeys.Click += (_, _) => _keys.ShiftOctave(-1);
        _middleKeys.Click += (_, _) => _keys.CenterOn(60);
        _higherKeys.Click += (_, _) => _keys.ShiftOctave(1);
        _pianoMode.CheckedChanged += (_, _) => { if (_pianoMode.Checked) KeyboardModeChanged(); };
        _sampleMode.CheckedChanged += (_, _) => { if (_sampleMode.Checked) KeyboardModeChanged(); };
        _import.Click += (_, _) => StartOperation(ImportAsync);
        _open.Click += (_, _) => StartOperation(OpenPatchAsync);
        _save.Click += (_, _) => StartOperation(ct => ExportAsync(true, ct));
        _export.Click += (_, _) => StartOperation(ct => ExportAsync(false, ct));
        _cancel.Click += (_, _) => { _operationCts?.Cancel(); _processCts?.Cancel(); _auditionCts?.Cancel(); _debounce.Stop(); };
        _primary.Click += (_, _) => { if (_samples.SelectedIndex >= 0) { _workspace.SetPrimary(_samples.SelectedIndex); ResetTrim(); RefreshSamples(); QueueProcess(); } };
        _remove.Click += (_, _) => { if (_samples.SelectedIndex >= 0) { bool primary = _samples.SelectedIndex == _workspace.PrimaryIndex; _workspace.Remove(_samples.SelectedIndex); if (primary) ResetTrim(); RefreshSamples(); QueueProcess(); } };
        _samples.SelectedIndexChanged += (_, _) => UpdateEnabled();
        foreach (var slider in new[] { _denoise, _common, _tonal }) slider.ValueChanged += (_, _) => QueueProcess();
        foreach (var number in new[] { _highPass, _lowPass }) number.ValueChanged += (_, _) => QueueProcess();
        _start.ValueChanged += (_, _) => ChangeSelection(TimelineMarker.SelectionStart, _start.Value);
        _end.ValueChanged += (_, _) => ChangeSelection(TimelineMarker.SelectionEnd, _end.Value);
        _graph.SelectionChanged += SyncSelection;
        _zoomIn.Click += (_, _) => _graph.Zoom(1.5);
        _zoomOut.Click += (_, _) => _graph.Zoom(1 / 1.5);
        _fit.Click += (_, _) => _graph.Fit();
        _zoom.ValueChanged += (_, _) => { if (!_suppress && _graph.Timeline.HasAudio) _graph.Zoom((double)_zoom.Value / (_graph.Timeline.FrameCount / _graph.Timeline.ViewLength)); };
        _pan.Scroll += (_, _) => { _graph.Timeline.SetViewStart(_pan.Value / (double)(_pan.Maximum - _pan.LargeChange + 1) * (_graph.Timeline.FrameCount - _graph.Timeline.ViewLength)); _graph.Zoom(1); };
        _graph.ViewChanged += SyncView;
        _graph.SeekStarted += () =>
        {
            _auditionCts?.Cancel(); _seeking = true;
            _seekVoice = _player is { IsNote: false } voice ? voice : null;
            _resumeAfterSeek = _seekVoice?.Snapshot.IsPlaying == true;
            _seekVoice?.Pause();
            if (_player is { IsNote: true }) _ = _audition.StopAsync();
        };
        _graph.SeekRequested += () =>
        { if (_seekVoice is { } voice && ReferenceEquals(voice, _player)) _seekRevision = voice.Seek(_graph.Timeline.Playhead); };
        _graph.SeekEnded += () =>
        {
            _seeking = false;
            if (_resumeAfterSeek && _graph.Timeline.Playhead < _graph.Timeline.FrameCount && _seekVoice is { } voice && ReferenceEquals(voice, _player)) voice.Play();
            _resumeAfterSeek = false; _seekVoice = null;
        };
        _autoPitch.CheckedChanged += (_, _) => { _root.Enabled = _cents.Enabled = !_autoPitch.Checked; QueueProcess(); };
        _root.SelectedIndexChanged += (_, _) => { if (!_autoPitch.Checked) QueueProcess(); };
        _cents.ValueChanged += (_, _) => { if (!_autoPitch.Checked) QueueProcess(); };
        _apply.Click += (_, _) => QueueProcess(immediate: true);
        _reset.Click += (_, _) =>
        {
            _suppress = true;
            _denoise.Value = _common.Value = _tonal.Value = 0;
            _highPass.Value = 0; _lowPass.Value = Math.Min(_lowPass.Maximum, (_workspace.Primary?.Clip.SampleRate ?? 48000) / 2);
            _suppress = false; QueueProcess(immediate: true);
        };
        _loop.CheckedChanged += (_, _) => { if (!_suppress && _loop.Checked && _workspace.Result is { } r && _loopEnd.Value <= _loopStart.Value) SetDefaultLoop(r.Audio); };
        _play.Click += async (_, _) => await ToggleSampleAsync();
        _compare.CheckedChanged += async (_, _) =>
        {
            if (_player is not { IsNote: false } player) return;
            bool resume = player.Snapshot.IsPlaying;
            double position = _graph.Timeline.Playhead;
            PcmClip? clip = _compare.Checked ? _originalPreview : _workspace.Result?.Audio;
            if (clip is not null) await PlayAsync(clip, false, position, resume);
        };
        _stop.Click += async (_, _) => await StopPlaybackAsync();
        _debounce.Tick += (_, _) => { _debounce.Stop(); BeginProcessing(); };
        _playTimer.Tick += (_, _) => RefreshPlayback();
        FormClosing += HandleClosing;
    }

    internal async Task ToggleSampleAsync()
    {
        if (_busy || _closing || !_workspace.IsCurrent) return;
        if (_player is { IsNote: false } player)
        { if (player.Snapshot.IsPlaying) player.Pause(); else player.Play(); return; }
        _auditionCts?.Cancel();
        PcmClip? clip = _compare.Checked ? _originalPreview : _workspace.Result?.Audio;
        if (clip is not null) await PlayAsync(clip, false, _graph.Timeline.Playhead);
    }

    internal void RefreshPlayback()
    {
        if (_player is not { } player) { _play.Text = "试听采样"; return; }
        var snapshot = player.Snapshot;
        _play.Text = snapshot.IsPlaying && !player.IsNote ? "暂停采样" : "试听采样";
        if (!player.IsNote && !_seeking && snapshot.SeekRevision >= _seekRevision && _workspace.Primary is not null)
        { _graph.Timeline.Move(TimelineMarker.Playhead, snapshot.PositionFrames); _graph.RevealPlayhead(); }
        if (snapshot.Error is { } error && error != _lastPlaybackError) { _lastPlaybackError = error; _status.Text = "试听失败：" + error; }
    }

    private void RefreshSamples()
    {
        int selected = _samples.SelectedIndex;
        _samples.BeginUpdate(); _samples.Items.Clear();
        for (int i = 0; i < _workspace.Entries.Count; i++)
        {
            var clip = _workspace.Entries[i].Clip;
            _samples.Items.Add($"{(i == _workspace.PrimaryIndex ? "主" : "参考")} · {clip.Name} ({clip.DurationSeconds:0.##}s)");
        }
        _samples.EndUpdate();
        if (_samples.Items.Count > 0) _samples.SelectedIndex = Math.Clamp(selected, 0, _samples.Items.Count - 1);
        UpdateEnabled();
    }

    private void ResetTrim()
    {
        _ = StopPlaybackAsync();
        _graph.SetAudio(_workspace.Primary?.Clip, null);
        _originalPreview = _workspace.Primary?.Clip;
        _suppress = true;
        _start.Value = 0;
        _end.Value = (decimal)(_workspace.Primary?.Clip.DurationSeconds ?? 0);
        _loop.Checked = false; _loopStart.Value = _loopEnd.Value = 0;
        if (_workspace.Primary is { } p) _name.Text = p.Clip.Name;
        _suppress = false;
        SyncView();
    }

    private async Task ImportAsync(CancellationToken ct)
    {
        using var dialog = new OpenFileDialog { Title = "导入同一音色的采样", Filter = "音乐文件|*.wav;*.mp3;*.flac;*.m4a;*.aac;*.wma;*.aif;*.aiff|所有文件|*.*", Multiselect = true };
        if (dialog.ShowDialog(this) != DialogResult.OK) return;
        var incoming = new List<SampleEntry>();
        foreach (string path in dialog.FileNames)
        {
            ct.ThrowIfCancellationRequested();
            var progress = new Progress<AudioProgress>(p => SetProgress(p.Fraction, p.Message));
            var clip = await ImportBridge.ImportAsync(path, progress, ct);
            ImportBridge.ValidateCollectionCanAdd(_workspace.Entries.Select(x => x.Clip).Concat(incoming.Select(x => x.Clip)), clip);
            incoming.Add(new SampleEntry(clip, Path.GetFullPath(path)));
        }
        // Commit the entire import selection only after every file was validated.
        ct.ThrowIfCancellationRequested();
        foreach (var entry in incoming) if (entry.SourcePath is { } path) _protection.Remember(path);
        bool first = _workspace.Primary is null;
        foreach (var entry in incoming) _workspace.Add(entry);
        if (first) ResetTrim();
        RefreshSamples();
        _status.Text = "已导入，正在准备处理。";
        QueueProcess(immediate: true);
    }

    private void ChangeSelection(TimelineMarker marker, decimal seconds)
    {
        if (_suppress || !_graph.Timeline.HasAudio) return;
        _graph.Timeline.Move(marker, Math.Round((double)seconds * _graph.Timeline.SampleRate));
        SyncSelection(); _graph.Invalidate();
    }

    private void SyncSelection()
    {
        var timeline = _graph.Timeline;
        if (!timeline.HasAudio) return;
        _suppress = true;
        _start.Value = (decimal)timeline.SelectionStart / timeline.SampleRate;
        _end.Value = (decimal)timeline.SelectionEnd / timeline.SampleRate;
        _suppress = false;
        if (_auditionCts is not null || _player is { IsNote: true })
        { _auditionCts?.Cancel(); _ = _audition.StopAsync(); }
        UpdateEnabled();
    }

    private void SyncView()
    {
        var timeline = _graph.Timeline;
        if (!timeline.HasAudio) return;
        _suppress = true;
        _zoom.Value = Math.Clamp((decimal)(timeline.FrameCount / timeline.ViewLength), _zoom.Minimum, _zoom.Maximum);
        _pan.Enabled = timeline.ViewLength < timeline.FrameCount;
        _pan.Value = _pan.Enabled ? (int)Math.Round(timeline.ViewStart / (timeline.FrameCount - timeline.ViewLength) * (_pan.Maximum - _pan.LargeChange + 1)) : 0;
        _suppress = false;
    }

    private void TrimSilence()
    {
        if (_workspace.Primary is not { } primary || _busy) return;
        var range = ClipPreparation.FindAudibleRange(primary.Clip);
        _suppress = true;
        _start.Value = (decimal)range.Start / primary.Clip.SampleRate;
        _end.Value = (decimal)range.End / primary.Clip.SampleRate;
        _suppress = false;
        _graph.SetSelection(range.Start, range.End); SyncSelection();
    }

    private void QueueProcess(bool immediate = false)
    {
        if (_suppress || _closing) return;
        _workspace.Invalidate();
        _processCts?.Cancel();
        _auditionCts?.Cancel();
        _debounce.Stop();
        UpdateEnabled();
        if (_workspace.Primary is null) { _originalPreview = null; _graph.SetAudio(null, null); _ = StopPlaybackAsync(); return; }
        _status.Text = "参数已改变，准备处理…";
        _debounce.Interval = immediate ? 1 : 550;
        _debounce.Start();
    }

    private void BeginProcessing()
    {
        if (_closing || _busy || _workspace.Primary is null) { if (!_closing && _workspace.Primary is not null) { _debounce.Interval = 150; _debounce.Start(); } return; }
        var primary = _workspace.Primary.Clip;
        if (_lowPass.Value <= _highPass.Value) { _status.Text = "高切频率需要高于低切频率。"; return; }
        var settings = new CleanupSettings(_denoise.Value / 100d, _common.Value / 100d, _tonal.Value / 100d,
            (double)_highPass.Value, Math.Min((double)_lowPass.Value, primary.SampleRate / 2d),
            _autoPitch.Checked ? null : Math.Clamp(_root.SelectedIndex + (double)_cents.Value / 100, 0, 127));
        long revision = _workspace.Revision;
        var references = _workspace.References();
        _processCts?.Cancel();
        var previous = _processTask;
        var cts = _processCts = new CancellationTokenSource();
        _processTask = ProcessAsync(previous, primary, references, settings, revision, cts);
    }

    private async Task ProcessAsync(Task previous, PcmClip primary, IReadOnlyList<PcmClip> references, CleanupSettings settings, long revision, CancellationTokenSource cts)
    {
        try
        {
            await previous;
            cts.Token.ThrowIfCancellationRequested();
            _processing = true; _progress.Visible = true; _status.Text = "正在打磨…"; UpdateEnabled();
            var progress = new Progress<double>(p => { if (revision == _workspace.Revision && !_closing) SetProgress(p, "正在打磨…"); });
            var result = await Task.Run(() => SampleProcessor.Process(primary, references, settings, progress, cts.Token), cts.Token);
            cts.Token.ThrowIfCancellationRequested();
            if (_closing || !_workspace.TryApply(revision, result)) return;
            var previousPlayer = _player;
            bool hadPlayback = previousPlayer is { IsNote: false };
            bool resume = hadPlayback && previousPlayer!.Snapshot.IsPlaying;
            double position = _graph.Timeline.Playhead;
            _originalPreview = primary;
            _detectedRoot = Math.Clamp(result.RootMidi ?? 60, 0, 127);
            if (_autoPitch.Checked)
            {
                _suppress = true;
                _root.SelectedIndex = Math.Clamp((int)Math.Round(_detectedRoot), 0, 127);
                _cents.Value = Math.Clamp((decimal)((_detectedRoot - _root.SelectedIndex) * 100), -50, 50);
                _suppress = false;
            }
            _pitch.Text = !_autoPitch.Checked ? "手动原音高" : result.RootMidi is { } note ? $"估计 {NoteName((int)Math.Round(note))} · 周期性 {result.PitchConfidence:P0}" : "音高不确定；暂按 C4，可手动校正";
            _notes.Text = result.Notes.FirstOrDefault(x => x.StartsWith("使用 ", StringComparison.Ordinal) || x.StartsWith("共同提纯未启用", StringComparison.Ordinal))
                ?? (result.RootMidi is null ? "原音高不确定；请手动校正。" : "可对比原声，再用琴键试听。");
            _tips.SetToolTip(_notes, string.Join(Environment.NewLine, result.Notes));
            if (_loop.Checked && (_loopEnd.Value <= _loopStart.Value || (double)_loopEnd.Value > result.Audio.DurationSeconds)) SetDefaultLoop(result.Audio);
            _graph.SetAudio(primary, result.Audio); SyncSelection(); SyncView();
            _status.Text = references.Count == 0 ? "处理完成。可加入同音色的其他片段进行对照。" : "处理完成。请对比原声，确认目标声音没有被削弱。";
            if (hadPlayback) await PlayAsync(_compare.Checked ? primary : result.Audio, false, position, resume);
        }
        catch (OperationCanceledException) { if (revision == _workspace.Revision && !_closing) _status.Text = "已取消处理，原采样保留。"; }
        catch (Exception ex) { if (!_closing && revision == _workspace.Revision) ShowError("处理失败", ex); }
        finally
        {
            if (ReferenceEquals(_processCts, cts)) { _processCts = null; _processing = false; _progress.Visible = _busy; UpdateEnabled(); }
            cts.Dispose();
        }
    }

    private InstrumentPatch GetPatch()
    {
        if (!_workspace.IsCurrent || _workspace.Result is not { } result) throw new InvalidOperationException("请等待当前处理完成后再保存或演奏。");
        long start = Math.Clamp((long)Math.Round((double)_loopStart.Value * result.Audio.SampleRate), 0, result.Audio.FrameCount);
        long end = Math.Clamp((long)Math.Round((double)_loopEnd.Value * result.Audio.SampleRate), 0, result.Audio.FrameCount);
        if (_loop.Checked && end - start < 4) throw new InvalidOperationException("请扩大延音循环范围，或关闭延音循环。");
        double crossfade = Math.Min((double)_crossfade.Value / 1000, Math.Max(0, (end - start) / (double)result.Audio.SampleRate * .45));
        double root = Math.Clamp(_autoPitch.Checked ? _detectedRoot : _root.SelectedIndex + (double)_cents.Value / 100, 0, 127);
        var settings = new InstrumentSettings(root, (double)_attack.Value, (double)_decay.Value, (double)_sustain.Value / 100,
            (double)_release.Value, _loop.Checked, start, end, crossfade, (double)_gain.Value);
        var patch = new InstrumentPatch(result.Audio, settings, string.IsNullOrWhiteSpace(_name.Text) ? result.Audio.Name : _name.Text.Trim());
        return InstrumentSelection.Crop(patch, _graph.Timeline.SelectionStart, _graph.Timeline.SelectionEnd);
    }

    private async Task FindLoopAsync(CancellationToken ct)
    {
        var patch = GetPatch();
        var found = await Task.Run(() => LoopFinder.Find(patch.Audio, patch.Settings.RootMidi, ct), ct);
        if (found is null) { _status.Text = "未找到可靠的延音区；可在演奏方式中手动设置起止时间。"; return; }
        _suppress = true;
        _loopStart.Value = (decimal)(found.Value.Start + _graph.Timeline.SelectionStart) / patch.Audio.SampleRate;
        _loopEnd.Value = (decimal)(found.Value.End + _graph.Timeline.SelectionStart) / patch.Audio.SampleRate;
        _crossfade.Value = Math.Clamp((decimal)(found.Value.CrossfadeSeconds * 1000), 0, 100);
        _loop.Checked = true;
        _suppress = false;
        _status.Text = "已找到延音区，请用琴键试听衔接。";
    }

    private void SetDefaultLoop(PcmClip clip)
    {
        _suppress = true;
        double start = _graph.Timeline.SelectionStart / (double)clip.SampleRate;
        double duration = (_graph.Timeline.SelectionEnd - _graph.Timeline.SelectionStart) / (double)clip.SampleRate;
        _loopStart.Value = (decimal)(start + duration * .25);
        _loopEnd.Value = (decimal)(start + duration * .8);
        _suppress = false;
    }

    private void KeyboardModeChanged()
    {
        bool pendingNote = _auditionCts is not null;
        _auditionCts?.Cancel();
        if (pendingNote || _player is { IsNote: true }) _ = _audition.StopAsync();
        _status.Text = _pianoMode.Checked ? "钢琴参考：先听采样原调，再找相近的琴键。"
            : _workspace.IsCurrent ? "采样模式：琴键演奏蓝线之间的声音。" : "采样模式：请先导入采样并等待处理完成。";
        UpdateEnabled();
    }

    internal Task AuditionKeyAsync(int note)
    {
        if (_busy || _closing || !_pianoMode.Checked && (!_workspace.IsCurrent || !_graph.Timeline.HasSelection)) return Task.CompletedTask;
        InstrumentPatch? patch = null;
        if (!_pianoMode.Checked)
        {
            try { patch = GetPatch(); } catch (Exception ex) { ShowError("暂时不能演奏", ex); return Task.CompletedTask; }
        }
        _auditionCts?.Cancel();
        var previous = _auditionTask;
        var cts = _auditionCts = new CancellationTokenSource();
        double held = (double)_held.Value;
        _keys.Highlight(note);
        _keyPitch.Text = $"{NoteName(note)} · {PianoReference.Frequency(note):0.##} Hz";
        _auditionTask = RenderAndPlayAsync(previous, patch, note, held, cts);
        return _auditionTask;
    }

    private async Task RenderAndPlayAsync(Task previous, InstrumentPatch? patch, int note, double held, CancellationTokenSource cts)
    {
        try
        {
            await previous;
            cts.Token.ThrowIfCancellationRequested();
            var rendered = await Task.Run(() => patch is null ? PianoReference.Render(note, held, cts.Token)
                : InstrumentRenderer.Render(patch, note, held, cts.Token), cts.Token);
            cts.Token.ThrowIfCancellationRequested();
            if (!_closing) { await PlayAsync(rendered, true, cancellationToken: cts.Token); _status.Text = $"{(patch is null ? "钢琴" : "采样")} · {NoteName(note)} · {PianoReference.Frequency(note):0.##} Hz"; }
        }
        catch (OperationCanceledException) { }
        catch (Exception ex) { if (!_closing) ShowError("试听失败", ex); }
        finally { if (ReferenceEquals(_auditionCts, cts)) _auditionCts = null; cts.Dispose(); UpdateEnabled(); }
    }

    private async Task PlayAsync(PcmClip clip, bool note, double position = 0, bool play = true, CancellationToken cancellationToken = default)
    {
        if (_closing) return;
        _lastPlaybackError = null;
        await _audition.SetAsync(clip, note, position, play, cancellationToken);
        _seekRevision = _audition.InitialSeekRevision;
        UpdateEnabled();
    }

    private async Task StopPlaybackAsync()
    {
        _auditionCts?.Cancel();
        await _audition.StopAsync();
        _seekRevision = 0; _seeking = _resumeAfterSeek = false; _seekVoice = null;
        _graph.PlayheadSeconds = 0; _graph.Invalidate(); _play.Text = "试听采样";
        UpdateEnabled();
    }

    private async Task ExportAsync(bool instrument, CancellationToken ct)
    {
        InstrumentPatch patch = GetPatch();
        using var dialog = new SaveFileDialog { Title = instrument ? "保存可编辑音色" : "导出清理后的采样", Filter = instrument ? "RootSound 实验音色|*.rstimbre" : "WAV 音频|*.wav", AddExtension = true, OverwritePrompt = true, FileName = SafeName(patch.Name) + (instrument ? ".rstimbre" : "_打磨.wav") };
        if (dialog.ShowDialog(this) != DialogResult.OK) return;
        _protection.CheckDestination(dialog.FileName);
        if (instrument) await TimbreArchive.ExportAsync(patch, dialog.FileName, true, ct);
        else await PcmWaveExporter.ExportAsync(patch.Audio, dialog.FileName, true, ct);
        _status.Text = "已保存：" + dialog.FileName;
    }

    private async Task OpenPatchAsync(CancellationToken ct)
    {
        using var dialog = new OpenFileDialog { Title = "打开音色打磨文件", Filter = "RootSound 实验音色|*.rstimbre" };
        if (dialog.ShowDialog(this) != DialogResult.OK) return;
        if (_workspace.Primary is not null && MessageBox.Show(this, "打开后会替换当前未保存的工作。继续？", "打开音色", MessageBoxButtons.OKCancel, MessageBoxIcon.Question) != DialogResult.OK) return;
        var patch = await TimbreArchive.ImportAsync(dialog.FileName, ct);
        ct.ThrowIfCancellationRequested();
        _protection.Remember(dialog.FileName);
        await StopPlaybackAsync();
        _workspace.Clear(); _workspace.Add(new SampleEntry(patch.Audio, Path.GetFullPath(dialog.FileName)));
        ResetTrim();
        _originalPreview = patch.Audio;
        _workspace.TryApply(_workspace.Revision, new ProcessingResult(patch.Audio, patch.Settings.RootMidi, 1, ["已载入保存的处理后音色；原始参考不在此文件中。"]));
        _suppress = true;
        _denoise.Value = _common.Value = _tonal.Value = 0; _highPass.Value = 0; _lowPass.Value = patch.Audio.SampleRate / 2;
        _autoPitch.Checked = false;
        _detectedRoot = patch.Settings.RootMidi;
        _root.SelectedIndex = (int)Math.Round(_detectedRoot); _cents.Value = (decimal)((_detectedRoot - _root.SelectedIndex) * 100);
        _attack.Value = (decimal)patch.Settings.AttackSeconds; _decay.Value = (decimal)patch.Settings.DecaySeconds;
        _sustain.Value = (decimal)patch.Settings.Sustain * 100; _release.Value = (decimal)patch.Settings.ReleaseSeconds;
        _loopStart.Value = (decimal)patch.Settings.LoopStart / patch.Audio.SampleRate; _loopEnd.Value = (decimal)patch.Settings.LoopEnd / patch.Audio.SampleRate;
        _loop.Checked = patch.Settings.LoopEnabled; _crossfade.Value = (decimal)(patch.Settings.LoopCrossfadeSeconds * 1000); _gain.Value = (decimal)patch.Settings.GainDb;
        _name.Text = patch.Name;
        _suppress = false;
        _root.Enabled = _cents.Enabled = true;
        _pitch.Text = "保存的原音高"; _notes.Text = "音色已载入，可继续调整演奏方式。";
        _graph.SetAudio(patch.Audio, patch.Audio); SyncSelection(); SyncView(); RefreshSamples();
        _status.Text = "已打开音色。";
    }

    private void StartOperation(Func<CancellationToken, Task> action)
    {
        if (_busy || _closing) return;
        _operationTask = OperateAsync(action);
    }

    private async Task OperateAsync(Func<CancellationToken, Task> action)
    {
        _busy = true; _progress.Visible = true; _operationCts = new CancellationTokenSource(); UpdateEnabled();
        try { await action(_operationCts.Token); }
        catch (OperationCanceledException) { if (!_closing) _status.Text = "已取消，现有内容保留。"; }
        catch (Exception ex) { if (!_closing) ShowError("无法完成", ex); }
        finally { _operationCts.Dispose(); _operationCts = null; _busy = false; _progress.Visible = _processing; UpdateEnabled(); }
    }

    private void UpdateEnabled()
    {
        if (_closing) return;
        _import.Enabled = _open.Enabled = !_busy;
        _save.Enabled = _export.Enabled = !_busy && _workspace.IsCurrent && _graph.Timeline.HasSelection;
        _cancel.Enabled = _busy || _processing;
        _primary.Enabled = _remove.Enabled = !_busy && _samples.SelectedIndex >= 0;
        _play.Enabled = !_busy && _workspace.IsCurrent;
        _stop.Enabled = _player is not null || _auditionCts is not null;
        _settings.Enabled = !_busy && _workspace.Primary is not null;
        _start.Enabled = _end.Enabled = _autoPitch.Enabled = !_busy && _workspace.Primary is not null;
        _keys.Enabled = !_busy && (_pianoMode.Checked || _workspace.IsCurrent && _graph.Timeline.HasSelection);
        _pianoMode.Enabled = _sampleMode.Enabled = _lowerKeys.Enabled = _middleKeys.Enabled = _higherKeys.Enabled = !_busy;
        _graph.Enabled = _zoomIn.Enabled = _zoomOut.Enabled = _fit.Enabled = _zoom.Enabled = !_busy && _workspace.Primary is not null;
        _root.Enabled = _cents.Enabled = !_busy && !_autoPitch.Checked;
    }

    private void SetProgress(double fraction, string message)
    {
        if (_closing) return;
        _progress.Value = (int)Math.Clamp(fraction * 1000, 0, 1000);
        _status.Text = message;
    }

    private void ShowError(string title, Exception ex)
    {
        _status.Text = ex.Message;
        MessageBox.Show(this, ex.Message, title, MessageBoxButtons.OK, MessageBoxIcon.Information);
    }

    private async void HandleClosing(object? sender, FormClosingEventArgs e)
    {
        if (_closed) return;
        e.Cancel = true;
        if (_closing) return;
        _closing = true;
        Enabled = false; _debounce.Stop(); _playTimer.Stop();
        _operationCts?.Cancel(); _processCts?.Cancel(); _auditionCts?.Cancel();
        await Task.WhenAll(_operationTask, _processTask, _auditionTask);
        await StopPlaybackAsync();
        await _audition.DisposeAsync();
        _debounce.Dispose(); _playTimer.Dispose(); _tips.Dispose();
        _closed = true;
        Close();
    }

    internal static string NoteName(int midi) => new[] { "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B" }[Math.Clamp(midi, 0, 127) % 12] + (midi / 12 - 1);
    private static string SafeName(string name) => string.Join("_", name.Split(Path.GetInvalidFileNameChars(), StringSplitOptions.RemoveEmptyEntries));
}
