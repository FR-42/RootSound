using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Playback;
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
    private readonly FlowLayoutPanel _keys = new() { Dock = DockStyle.Fill, WrapContents = false, AutoScroll = true, Padding = new Padding(0, 6, 0, 0) };
    private readonly Panel _settings = new() { Dock = DockStyle.Fill };
    private readonly System.Windows.Forms.Timer _debounce = new() { Interval = 550 }, _playTimer = new() { Interval = 30 };
    private readonly ToolTip _tips = new();
    private readonly AuditionSession _audition = new();
    private CancellationTokenSource? _processCts, _operationCts, _auditionCts;
    private Task _processTask = Task.CompletedTask, _operationTask = Task.CompletedTask, _auditionTask = Task.CompletedTask;
    private IAuditionVoice? _player => _audition.Current;
    private PcmClip? _trimmed;
    private double _detectedRoot = 60;
    private bool _suppress, _busy, _processing, _closing, _closed;
    private string? _lastPlaybackError;

    public MainForm()
    {
        Text = "音色打磨 · RootSound 实验";
        AutoScaleMode = AutoScaleMode.Dpi;
        Font = new Font("Microsoft YaHei UI", 9);
        BackColor = Color.FromArgb(245, 247, 249);
        ClientSize = new Size(1210, 810);
        MinimumSize = new Size(980, 710);
        StartPosition = FormStartPosition.CenterScreen;
        BuildInterface();
        HookEvents();
        Shown += (_, _) => _playTimer.Start();
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
        right.RowStyles.Add(new RowStyle(SizeType.Absolute, 44));
        right.RowStyles.Add(new RowStyle(SizeType.Absolute, 244));
        right.RowStyles.Add(new RowStyle(SizeType.Absolute, 37));
        right.RowStyles.Add(new RowStyle(SizeType.Absolute, 70));
        right.RowStyles.Add(new RowStyle(SizeType.Absolute, 47));
        right.Controls.Add(_graph, 0, 0);
        var trim = new Button { Text = "去首尾空白", AutoSize = true };
        trim.Click += (_, _) => TrimSilence();
        right.Controls.Add(Row(_play, _stop, _compare, TextLabel("保留"), _start, TextLabel("至"), _end, TextLabel("秒"), trim), 0, 1);
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
        performance.Controls.Add(new Label { Text = "蓝线可拖动延音区，Shift 精调。琴键试听包含起落和循环；WAV 导出保留清理后的原调采样。", Dock = DockStyle.Fill, ForeColor = _notes.ForeColor }, 0, 3);
        performanceTab.Controls.Add(performance);
        tabs.TabPages.AddRange([cleanupTab, performanceTab]);
        _settings.Controls.Add(tabs);
        right.Controls.Add(_settings, 0, 2);
        for (int midi = 0; midi <= 127; midi++) _root.Items.Add(NoteName(midi));
        _root.SelectedIndex = 60;
        right.Controls.Add(Row(TextLabel("原音高"), _autoPitch, _root, TextLabel("微调 音分"), _cents, _pitch), 0, 3);
        for (int midi = 48; midi <= 72; midi++)
        {
            int note = midi;
            bool black = new[] { 1, 3, 6, 8, 10 }.Contains(midi % 12);
            var button = new Button { Text = NoteName(midi), Width = 35, Height = black ? 43 : 55, Margin = new Padding(1), BackColor = black ? Color.FromArgb(53, 66, 78) : Color.White, ForeColor = black ? Color.White : Color.FromArgb(35, 50, 64), FlatStyle = FlatStyle.Flat };
            button.Click += (_, _) => AuditionNote(note);
            _tips.SetToolTip(button, "试听此音高；按键时长可在演奏方式中调整");
            _keys.Controls.Add(button);
        }
        right.Controls.Add(_keys, 0, 4);
        right.Controls.Add(Row(TextLabel("音色名称"), _name, _notes), 0, 5);
        _notes.Width = 470; _notes.Height = 42; _notes.Dock = DockStyle.None;
        body.Controls.Add(right, 1, 0);
        Controls.Add(body); Controls.Add(_toolbar); Controls.Add(status);
        _tips.SetToolTip(_common, "需要至少一段同音色参考；不同音高会尝试对齐共同谐波。相同伴奏也可能被保留。");
        _tips.SetToolTip(_tonal, "更适合持续的乐音；较强处理也会削弱目标乐器起音。打击乐建议设为零。");
        _tips.SetToolTip(_denoise, "从采样中估计底噪，无法保证分离重叠乐器；越强越容易改变音色。");
        _tips.SetToolTip(_autoPitch, "识别的是最明显的周期性声音，混合乐器可能识别错。取消后可手动校准。");
        _export.ToolTipText = "导出清理后的原调采样；起落、音量、延音设置由“保存音色”保管。";
        _save.ToolTipText = "保存可再次打开的音色，含处理后音频和全部演奏设置。";
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
        _import.Click += (_, _) => StartOperation(ImportAsync);
        _open.Click += (_, _) => StartOperation(OpenPatchAsync);
        _save.Click += (_, _) => StartOperation(ct => ExportAsync(true, ct));
        _export.Click += (_, _) => StartOperation(ct => ExportAsync(false, ct));
        _cancel.Click += (_, _) => { _operationCts?.Cancel(); _processCts?.Cancel(); _auditionCts?.Cancel(); _debounce.Stop(); };
        _primary.Click += (_, _) => { if (_samples.SelectedIndex >= 0) { _workspace.SetPrimary(_samples.SelectedIndex); ResetTrim(); RefreshSamples(); QueueProcess(); } };
        _remove.Click += (_, _) => { if (_samples.SelectedIndex >= 0) { bool primary = _samples.SelectedIndex == _workspace.PrimaryIndex; _workspace.Remove(_samples.SelectedIndex); if (primary) ResetTrim(); RefreshSamples(); QueueProcess(); } };
        _samples.SelectedIndexChanged += (_, _) => UpdateEnabled();
        foreach (var slider in new[] { _denoise, _common, _tonal }) slider.ValueChanged += (_, _) => QueueProcess();
        foreach (var number in new[] { _start, _end, _highPass, _lowPass }) number.ValueChanged += (_, _) => QueueProcess();
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
        _loop.CheckedChanged += (_, _) => { if (!_suppress && _loop.Checked && _workspace.Result is { } r && _loopEnd.Value <= _loopStart.Value) SetDefaultLoop(r.Audio); UpdateLoopGraph(); };
        _loopStart.ValueChanged += (_, _) => UpdateLoopGraph(); _loopEnd.ValueChanged += (_, _) => UpdateLoopGraph();
        _graph.LoopChanged += (start, end) =>
        {
            if (_workspace.Result is not { } r) return;
            _suppress = true;
            _loopStart.Value = (decimal)start / r.Audio.SampleRate;
            _loopEnd.Value = (decimal)end / r.Audio.SampleRate;
            _suppress = false;
        };
        _play.Click += async (_, _) =>
        {
            if (_player is { IsNote: false } player) { if (player.Snapshot.IsPlaying) player.Pause(); else player.Play(); return; }
            PcmClip? clip = _compare.Checked ? _trimmed : _workspace.Result?.Audio;
            if (clip is not null) await PlayAsync(clip, false);
        };
        _compare.CheckedChanged += async (_, _) =>
        {
            if (_player is not { IsNote: false } player) return;
            bool resume = player.Snapshot.IsPlaying;
            double position = player.Snapshot.PositionFrames;
            PcmClip? clip = _compare.Checked ? _trimmed : _workspace.Result?.Audio;
            if (clip is not null) await PlayAsync(clip, false, position, resume);
        };
        _stop.Click += async (_, _) => await StopPlaybackAsync();
        _debounce.Tick += (_, _) => { _debounce.Stop(); BeginProcessing(); };
        _playTimer.Tick += (_, _) =>
        {
            if (_player is not { } player) return;
            var snapshot = player.Snapshot;
            _play.Text = snapshot.IsPlaying && !player.IsNote ? "暂停采样" : "试听采样";
            if (!player.IsNote && _workspace.Result is { } result) { _graph.PlayheadSeconds = snapshot.PositionFrames / result.Audio.SampleRate; _graph.Invalidate(); }
            if (snapshot.Error is { } error && error != _lastPlaybackError) { _lastPlaybackError = error; _status.Text = "试听失败：" + error; }
        };
        FormClosing += HandleClosing;
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
        _suppress = true;
        _start.Value = 0;
        _end.Value = (decimal)(_workspace.Primary?.Clip.DurationSeconds ?? 0);
        _loop.Checked = false; _loopStart.Value = _loopEnd.Value = 0;
        if (_workspace.Primary is { } p) _name.Text = p.Clip.Name;
        _suppress = false;
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

    private void TrimSilence()
    {
        if (_workspace.Primary is not { } primary || _busy) return;
        var range = ClipPreparation.FindAudibleRange(primary.Clip);
        _suppress = true;
        _start.Value = (decimal)range.Start / primary.Clip.SampleRate;
        _end.Value = (decimal)range.End / primary.Clip.SampleRate;
        _suppress = false;
        QueueProcess(immediate: true);
    }

    private void QueueProcess(bool immediate = false)
    {
        if (_suppress || _closing) return;
        _workspace.Invalidate();
        _processCts?.Cancel();
        _auditionCts?.Cancel();
        _debounce.Stop();
        UpdateEnabled();
        if (_workspace.Primary is null) { _trimmed = null; _graph.SetAudio(null, null); _ = StopPlaybackAsync(); return; }
        _status.Text = "参数已改变，准备处理…";
        _debounce.Interval = immediate ? 1 : 550;
        _debounce.Start();
    }

    private void BeginProcessing()
    {
        if (_closing || _busy || _workspace.Primary is null) { if (!_closing && _workspace.Primary is not null) { _debounce.Interval = 150; _debounce.Start(); } return; }
        var primary = _workspace.Primary.Clip;
        long start = Math.Clamp((long)Math.Round((double)_start.Value * primary.SampleRate), 0, primary.FrameCount);
        long end = Math.Clamp((long)Math.Round((double)_end.Value * primary.SampleRate), 0, primary.FrameCount);
        if (end <= start) { _status.Text = "请保留一段非空声音：终点必须在起点之后。"; return; }
        if (_lowPass.Value <= _highPass.Value) { _status.Text = "高切频率需要高于低切频率。"; return; }
        var settings = new CleanupSettings(_denoise.Value / 100d, _common.Value / 100d, _tonal.Value / 100d,
            (double)_highPass.Value, Math.Min((double)_lowPass.Value, primary.SampleRate / 2d),
            _autoPitch.Checked ? null : Math.Clamp(_root.SelectedIndex + (double)_cents.Value / 100, 0, 127));
        long revision = _workspace.Revision;
        var references = _workspace.References();
        _processCts?.Cancel();
        var previous = _processTask;
        var cts = _processCts = new CancellationTokenSource();
        _processTask = ProcessAsync(previous, primary, references, settings, start, end, revision, cts);
    }

    private async Task ProcessAsync(Task previous, PcmClip primary, IReadOnlyList<PcmClip> references, CleanupSettings settings, long start, long end, long revision, CancellationTokenSource cts)
    {
        try
        {
            await previous;
            cts.Token.ThrowIfCancellationRequested();
            _processing = true; _progress.Visible = true; _status.Text = "正在打磨…"; UpdateEnabled();
            var progress = new Progress<double>(p => { if (revision == _workspace.Revision && !_closing) SetProgress(p, "正在打磨…"); });
            var trimmed = await Task.Run(() => ClipPreparation.Trim(primary, start, end), cts.Token);
            var result = await Task.Run(() => SampleProcessor.Process(trimmed, references, settings, progress, cts.Token), cts.Token);
            cts.Token.ThrowIfCancellationRequested();
            if (_closing || !_workspace.TryApply(revision, result)) return;
            var previousPlayer = _player;
            bool hadPlayback = previousPlayer is { IsNote: false };
            bool resume = hadPlayback && previousPlayer!.Snapshot.IsPlaying;
            double position = hadPlayback ? previousPlayer!.Snapshot.PositionFrames : 0;
            _trimmed = trimmed;
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
            _graph.SetAudio(trimmed, result.Audio); UpdateLoopGraph();
            _status.Text = references.Count == 0 ? "处理完成。可加入同音色的其他片段进行对照。" : "处理完成。请对比原声，确认目标声音没有被削弱。";
            if (hadPlayback) await PlayAsync(_compare.Checked ? trimmed : result.Audio, false, position, resume);
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
        if (_loop.Checked && end - start < 4) throw new InvalidOperationException("请把两条延音蓝线拉开，或关闭延音循环。");
        double crossfade = Math.Min((double)_crossfade.Value / 1000, Math.Max(0, (end - start) / (double)result.Audio.SampleRate * .45));
        double root = Math.Clamp(_autoPitch.Checked ? _detectedRoot : _root.SelectedIndex + (double)_cents.Value / 100, 0, 127);
        var settings = new InstrumentSettings(root, (double)_attack.Value, (double)_decay.Value, (double)_sustain.Value / 100,
            (double)_release.Value, _loop.Checked, start, end, crossfade, (double)_gain.Value);
        return new InstrumentPatch(result.Audio, settings, string.IsNullOrWhiteSpace(_name.Text) ? result.Audio.Name : _name.Text.Trim());
    }

    private async Task FindLoopAsync(CancellationToken ct)
    {
        var patch = GetPatch();
        var found = await Task.Run(() => LoopFinder.Find(patch.Audio, patch.Settings.RootMidi, ct), ct);
        if (found is null) { _status.Text = "未找到可靠的延音区；可在演奏方式中手动打开并拖动蓝线。"; return; }
        _suppress = true;
        _loopStart.Value = (decimal)found.Value.Start / patch.Audio.SampleRate;
        _loopEnd.Value = (decimal)found.Value.End / patch.Audio.SampleRate;
        _crossfade.Value = Math.Clamp((decimal)(found.Value.CrossfadeSeconds * 1000), 0, 100);
        _loop.Checked = true;
        _suppress = false;
        UpdateLoopGraph();
        _status.Text = "已找到延音区，请用琴键试听衔接。";
    }

    private void SetDefaultLoop(PcmClip clip)
    {
        _suppress = true;
        _loopStart.Value = (decimal)(clip.DurationSeconds * .25);
        _loopEnd.Value = (decimal)(clip.DurationSeconds * .8);
        _suppress = false;
        UpdateLoopGraph();
    }

    private void UpdateLoopGraph()
    {
        if (_suppress || _workspace.Result is not { } result) return;
        _graph.SetLoop(_loop.Checked,
            Math.Clamp((long)Math.Round((double)_loopStart.Value * result.Audio.SampleRate), 0, result.Audio.FrameCount),
            Math.Clamp((long)Math.Round((double)_loopEnd.Value * result.Audio.SampleRate), 0, result.Audio.FrameCount));
    }

    private void AuditionNote(int note)
    {
        if (!_workspace.IsCurrent || _busy || _closing) return;
        InstrumentPatch patch;
        try { patch = GetPatch(); } catch (Exception ex) { ShowError("暂时不能演奏", ex); return; }
        _auditionCts?.Cancel();
        var previous = _auditionTask;
        var cts = _auditionCts = new CancellationTokenSource();
        double held = (double)_held.Value;
        _auditionTask = RenderAndPlayAsync(previous, patch, note, held, cts);
    }

    private async Task RenderAndPlayAsync(Task previous, InstrumentPatch patch, int note, double held, CancellationTokenSource cts)
    {
        try
        {
            await previous;
            cts.Token.ThrowIfCancellationRequested();
            var rendered = await Task.Run(() => InstrumentRenderer.Render(patch, note, held, cts.Token), cts.Token);
            cts.Token.ThrowIfCancellationRequested();
            if (!_closing) { await PlayAsync(rendered, true, cancellationToken: cts.Token); _status.Text = $"试听 {NoteName(note)}"; }
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
        UpdateEnabled();
    }

    private async Task StopPlaybackAsync()
    {
        _auditionCts?.Cancel();
        await _audition.StopAsync();
        _graph.PlayheadSeconds = -1; _graph.Invalidate(); _play.Text = "试听采样";
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
        _trimmed = patch.Audio;
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
        _graph.SetAudio(patch.Audio, patch.Audio); UpdateLoopGraph(); RefreshSamples();
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
        _save.Enabled = _export.Enabled = !_busy && _workspace.IsCurrent;
        _cancel.Enabled = _busy || _processing;
        _primary.Enabled = _remove.Enabled = !_busy && _samples.SelectedIndex >= 0;
        _play.Enabled = !_busy && _workspace.IsCurrent;
        _stop.Enabled = _player is not null || _auditionCts is not null;
        _settings.Enabled = !_busy && _workspace.Primary is not null;
        _start.Enabled = _end.Enabled = _autoPitch.Enabled = !_busy && _workspace.Primary is not null;
        _keys.Enabled = !_busy && _workspace.IsCurrent;
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
