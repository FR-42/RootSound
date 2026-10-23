using RootSound.SampleEditor.Analysis;
using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Controls;
using RootSound.SampleEditor.Core;
using RootSound.SampleEditor.Playback;

namespace RootSound.SampleEditor;

internal sealed class MainForm : Form
{
    private readonly AudioPlot plot = new() { Dock = DockStyle.Fill, Margin = Padding.Empty };
    private readonly HScrollBar scroll = new() { Dock = DockStyle.Fill, Minimum = 0, Maximum = 1_000_000, SmallChange = 2000, LargeChange = 100_000, Margin = Padding.Empty };
    private readonly ToolStrip top = Bar(), transport = Bar();
    private readonly ToolStripButton import = Button("导入…"), play = Button("播放"), speed = Button("倍速 1.000×"), export = Button("导出…"), fit = Button("全图"), mode = Button("频谱"), cancel = Button("取消");
    private readonly ToolStripLabel file = new(""), info = new(""), selection = new("");
    private readonly Label status = new() { Dock = DockStyle.Fill, AutoEllipsis = true, TextAlign = ContentAlignment.MiddleLeft, ForeColor = Color.FromArgb(87, 102, 116), Margin = Padding.Empty };
    private readonly ProgressBar progress = new() { Dock = DockStyle.Fill, Maximum = 1000, Visible = false };
    private readonly System.Windows.Forms.Timer clock = new() { Interval = 16 }, debounce = new() { Interval = 130 };
    private readonly ToolStripDropDown ratePopup = new() { Padding = new Padding(8), AutoClose = true };
    private readonly TrackBar rateSlider = new() { Minimum = 750, Maximum = 1250, Value = 1000, TickStyle = TickStyle.None, Width = 230, Height = 32, SmallChange = 1, LargeChange = 10 };
    private readonly NumericUpDown rateNumber = new() { Minimum = .750m, Maximum = 1.250m, Value = 1m, DecimalPlaces = 3, Increment = .001m, Width = 90 };
    private ImportedAudio? audio;
    private PlaybackEngine? player;
    private CancellationTokenSource? operationCancellation, analysisCancellation;
    private Task operation = Task.CompletedTask;
    private readonly HashSet<Task> analysisJobs = [];
    private long analysisVersion;
    private long pendingSeek;
    private bool busy, importing, closing, allowClose, seeking, resumeAfterSeek, syncingScroll, syncingRate;
    private double rate = 1;
    private string? lastPlaybackError;

    internal MainForm()
    {
        Text = "采样编辑 · 音乐流程实验";
        Font = new Font("Microsoft YaHei UI", 9.5f);
        BackColor = Color.FromArgb(242, 245, 247);
        ForeColor = Color.FromArgb(31, 45, 59);
        StartPosition = FormStartPosition.CenterScreen;
        ClientSize = new Size(1180, 640); MinimumSize = new Size(790, 460);
        AutoScaleMode = AutoScaleMode.Dpi;
        Compose(); ComposeRatePopup();
        import.Click += async (_, _) => { operation = ImportAsync(); await operation; };
        export.Click += async (_, _) => { operation = ExportAsync(); await operation; };
        play.Click += (_, _) => TogglePlay();
        fit.Click += (_, _) => { plot.Timeline.Fit(); ViewChanged(); };
        mode.Click += (_, _) => { plot.ShowSpectrum = !plot.ShowSpectrum; mode.Text = plot.ShowSpectrum ? "频谱" : "波形"; plot.Invalidate(); };
        speed.Click += (_, _) =>
        {
            if (ratePopup.Visible) ratePopup.Close();
            else ratePopup.Show(transport, new Point(speed.Bounds.Left, transport.Height));
        };
        cancel.Click += (_, _) => operationCancellation?.Cancel();
        plot.ViewChanged += (_, _) => ViewChanged();
        plot.SelectionChanged += (_, _) => RefreshSelection();
        plot.SeekStarted += (_, _) =>
        {
            if (seeking) return;
            seeking = true; resumeAfterSeek = player?.Snapshot.IsPlaying == true;
            if (resumeAfterSeek) player!.Pause();
        };
        plot.SeekRequested += (_, _) => { pendingSeek = player?.Seek(plot.Timeline.Playhead) ?? 0; RefreshSelection(); };
        plot.SeekEnded += (_, _) =>
        {
            if (!seeking) return;
            pendingSeek = player?.Seek(plot.Timeline.Playhead) ?? 0; seeking = false;
            if (resumeAfterSeek) player?.Play(); resumeAfterSeek = false;
        };
        plot.SizeChanged += (_, _) => { if (audio is not null) ScheduleAnalysis(); };
        scroll.ValueChanged += (_, _) =>
        {
            if (syncingScroll || audio is null) return;
            double maximum = Math.Max(1, scroll.Maximum - scroll.LargeChange + 1);
            plot.Timeline.SetViewStart(scroll.Value / maximum * (plot.Timeline.FrameCount - plot.Timeline.ViewLength));
            ViewChanged();
        };
        clock.Tick += (_, _) => RefreshPlayback();
        debounce.Tick += (_, _) => { debounce.Stop(); StartAnalysis(); };
        Shown += (_, _) => clock.Start();
        FormClosing += ClosingAsync;
        UpdateEnabled();
    }
    private void Compose()
    {
        var layout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 7, Padding = new Padding(18, 12, 18, 12) };
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 38));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 10));
        layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 16));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 38));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 26));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 24));
        Controls.Add(layout);
        top.Items.Add(import); top.Items.Add(new ToolStripSeparator()); top.Items.Add(file); top.Items.Add(info);
        info.ForeColor = Color.FromArgb(113, 127, 140); file.Margin = new Padding(9, 1, 10, 1);
        file.AutoSize = false; file.Width = 320; file.TextAlign = ContentAlignment.MiddleLeft;
        top.Dock = DockStyle.Fill; layout.Controls.Add(top, 0, 0);
        layout.Controls.Add(plot, 0, 2); layout.Controls.Add(scroll, 0, 3);
        transport.Items.AddRange([play, speed, export, new ToolStripSeparator(), mode, fit, new ToolStripSeparator(), selection, cancel]);
        mode.ToolTipText = "切换频谱 / 波形";
        fit.ToolTipText = "恢复整首音乐的视野";
        speed.ToolTipText = "调节试听速度（音高随速度变化）；导出保持原速";
        export.ToolTipText = "导出两条蓝线之间的原速音频";
        cancel.Alignment = ToolStripItemAlignment.Right;
        transport.Dock = DockStyle.Fill; layout.Controls.Add(transport, 0, 4);
        var statusRow = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2, Margin = Padding.Empty };
        statusRow.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100)); statusRow.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 140));
        statusRow.Controls.Add(status, 0, 0); statusRow.Controls.Add(progress, 1, 0);
        progress.Margin = new Padding(8, 7, 0, 7); layout.Controls.Add(statusRow, 0, 5);
        layout.Controls.Add(new Label { Text = "红线试听 · 蓝线选区 · Shift 精调 · Shift＋滚轮缩放 · 滚轮左右移动", Dock = DockStyle.Fill,
            TextAlign = ContentAlignment.MiddleLeft, ForeColor = Color.FromArgb(119, 132, 145), Font = new Font(Font.FontFamily, 8.5f), Margin = Padding.Empty }, 0, 6);
    }
    private void ComposeRatePopup()
    {
        var panel = new TableLayoutPanel { Width = 330, Height = 68, ColumnCount = 2, RowCount = 2, BackColor = Color.White };
        panel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100)); panel.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 94));
        panel.RowStyles.Add(new RowStyle(SizeType.Absolute, 34)); panel.RowStyles.Add(new RowStyle(SizeType.Absolute, 30));
        panel.Controls.Add(rateSlider, 0, 0); panel.Controls.Add(rateNumber, 1, 0);
        var reset = new System.Windows.Forms.Button { Text = "1×", Width = 50, Height = 26, FlatStyle = FlatStyle.Flat };
        reset.Click += (_, _) => SetRate(1);
        panel.Controls.Add(new Label { Text = "试听速度", AutoSize = true, ForeColor = Color.DimGray }, 0, 1); panel.Controls.Add(reset, 1, 1);
        ratePopup.Items.Add(new ToolStripControlHost(panel) { AutoSize = false, Size = panel.Size, Margin = Padding.Empty, Padding = Padding.Empty });
        rateSlider.ValueChanged += (_, _) => { if (!syncingRate) SetRate(rateSlider.Value / 1000d); };
        rateNumber.ValueChanged += (_, _) => { if (!syncingRate) SetRate((double)rateNumber.Value); };
    }
    private void SetRate(double value)
    {
        rate = Math.Clamp(value, .75, 1.25);
        syncingRate = true;
        try { rateSlider.Value = (int)Math.Round(rate * 1000); rateNumber.Value = (decimal)rate; }
        finally { syncingRate = false; }
        speed.Text = $"倍速 {rate:0.000}×"; player?.SetRate(rate);
    }
    private async Task ImportAsync()
    {
        if (busy || closing) return;
        using var dialog = new OpenFileDialog
        {
            Title = "导入音乐", Filter = "音乐文件|*.wav;*.mp3;*.flac;*.m4a;*.aac;*.wma;*.mp4;*.aif;*.aiff;*.ogg;*.opus|所有文件|*.*",
            CheckFileExists = true, Multiselect = false, RestoreDirectory = true
        };
        if (dialog.ShowDialog(this) != DialogResult.OK) return;
        busy = importing = true; player?.Pause(); lastPlaybackError = null;
        operationCancellation = new(); UpdateEnabled();
        ImportedAudio? incoming = null;
        PlaybackEngine? incomingPlayer = null;
        try
        {
            var token = operationCancellation.Token;
            incoming = await AudioImporter.ImportAsync(dialog.FileName, Progress(), token);
            token.ThrowIfCancellationRequested();
            incomingPlayer = new PlaybackEngine(incoming, incoming.ChannelMask); incomingPlayer.SetRate(rate);
            await CancelAnalysisAsync();
            token.ThrowIfCancellationRequested();
            if (player is not null) { await player.DisposeAsync(); player = null; }
            audio?.Dispose(); audio = incoming; incoming = null;
            player = incomingPlayer; incomingPlayer = null;
            pendingSeek = 0;
            plot.Timeline.Load(audio.FrameCount, audio.SampleRate); plot.ClearAnalysis();
            file.Text = audio.FileName; file.ToolTipText = audio.SourcePath;
            info.Text = $"{FormatTime(audio.DurationSeconds)}  ·  {audio.SampleRate:N0} Hz  ·  {audio.Channels} 声道";
            status.Text = ""; RefreshSelection(); ViewChanged();
        }
        catch (OperationCanceledException) { status.Text = "已取消导入，原内容保留。"; }
        catch (Exception ex) { status.Text = "导入失败：" + ex.Message; }
        finally
        {
            if (incomingPlayer is not null) await incomingPlayer.DisposeAsync();
            incoming?.Dispose(); operationCancellation.Dispose(); operationCancellation = null;
            busy = importing = false; UpdateEnabled();
        }
    }
    private async Task ExportAsync()
    {
        if (busy || closing || audio is null || !plot.Timeline.HasSelection) return;
        var source = audio; long first = plot.Timeline.SelectionStart, last = plot.Timeline.SelectionEnd;
        using SaveFileDialog dialog = new()
        {
            Title = "导出采样", Filter = "WAV 音频文件 (*.wav)|*.wav", DefaultExt = "wav", AddExtension = true,
            FileName = Path.GetFileNameWithoutExtension(source.FileName) + "-采样.wav", OverwritePrompt = true,
            CheckPathExists = true, RestoreDirectory = true
        };
        if (dialog.ShowDialog(this) != DialogResult.OK) return;
        busy = true; operationCancellation = new(); UpdateEnabled();
        try
        {
            await AudioExporter.ExportAsync(source, first, last, dialog.FileName, overwrite: true,
                progress: Progress(), cancellationToken: operationCancellation.Token);
            status.Text = "已导出：" + dialog.FileName;
        }
        catch (OperationCanceledException) { status.Text = "已取消导出。"; }
        catch (Exception ex) { status.Text = "导出失败：" + ex.Message; }
        finally { operationCancellation.Dispose(); operationCancellation = null; busy = false; UpdateEnabled(); }
    }
    private IProgress<AudioProgress> Progress() => new Progress<AudioProgress>(value =>
    {
        if (closing) return;
        status.Text = value.Message; progress.Value = (int)Math.Round(Math.Clamp(value.Fraction, 0, 1) * 1000);
    });
    private void TogglePlay()
    {
        if (player is null || importing || closing || seeking) return;
        if (player.Snapshot.IsPlaying) player.Pause();
        else
        {
            double position = pendingSeek > 0 ? plot.Timeline.Playhead : player.Snapshot.PositionFrames;
            plot.Timeline.Reveal(position >= audio!.FrameCount ? 0 : position); ViewChanged();
            if (lastPlaybackError is not null) status.Text = "";
            player.Play();
        }
    }
    private void RefreshPlayback()
    {
        if (closing || player is null) return;
        var state = player.Snapshot;
        if (state.Error is not null) pendingSeek = 0;
        if (!seeking && (pendingSeek == 0 || state.SeekRevision >= pendingSeek))
        {
            pendingSeek = 0;
            var timeline = plot.Timeline;
            bool previouslyVisible = timeline.Playhead >= timeline.ViewStart && timeline.Playhead <= timeline.ViewEnd;
            timeline.Move(TimelineMarker.Playhead, state.PositionFrames);
            if (state.IsPlaying && previouslyVisible && state.PositionFrames > timeline.ViewEnd)
            { timeline.Reveal(state.PositionFrames); ViewChanged(); }
        }
        play.Text = state.IsPlaying ? "暂停" : "播放";
        if (state.Error is not null && state.Error != lastPlaybackError)
        { lastPlaybackError = state.Error; status.Text = "播放失败：" + state.Error; }
        else if (state.Error is null) lastPlaybackError = null;
        RefreshSelection(); plot.Invalidate();
    }
    private void RefreshSelection()
    {
        if (audio is null) return;
        var t = plot.Timeline;
        selection.Text = $"{FormatTime(t.Playhead / audio.SampleRate)}   |   {FormatTime(t.SelectionStart / (double)audio.SampleRate)} → {FormatTime(t.SelectionEnd / (double)audio.SampleRate)}";
        selection.ToolTipText = $"播放位置 · 选区起止；选中 {t.SelectionEnd - t.SelectionStart:N0} 帧，{(t.SelectionEnd - t.SelectionStart) / (double)audio.SampleRate:0.000000} 秒";
        export.Enabled = !busy && t.HasSelection;
    }
    private void ViewChanged()
    {
        var t = plot.Timeline; syncingScroll = true;
        try
        {
            scroll.LargeChange = t.HasAudio ? Math.Clamp((int)Math.Round(t.ViewLength / t.FrameCount * 1_000_000), 1, 1_000_001) : 1_000_001;
            int maximum = scroll.Maximum - scroll.LargeChange + 1;
            scroll.Value = t.FrameCount > t.ViewLength ? Math.Clamp((int)Math.Round(t.ViewStart / (t.FrameCount - t.ViewLength) * maximum), 0, maximum) : 0;
            scroll.Enabled = !busy && t.FrameCount > t.ViewLength;
        }
        finally { syncingScroll = false; }
        plot.Invalidate(); ScheduleAnalysis();
    }
    private void ScheduleAnalysis()
    {
        if (audio is null || closing) return;
        analysisVersion++; analysisCancellation?.Cancel(); debounce.Stop(); debounce.Start();
        plot.Analyzing = true;
    }
    private void StartAnalysis()
    {
        if (audio is null || closing) return;
        var source = audio; var area = plot.PlotBounds;
        var token = new CancellationTokenSource(); analysisCancellation = token;
        long version = analysisVersion;
        long start = Math.Clamp((long)Math.Floor(plot.Timeline.ViewStart), 0, source.FrameCount - 1);
        long end = Math.Clamp((long)Math.Ceiling(plot.Timeline.ViewEnd), start + 1, source.FrameCount);
        var task = AnalyzeAsync(source, start, end, Math.Max(1, area.Width), Math.Max(1, area.Height), version, token);
        analysisJobs.Add(task); _ = RemoveWhenComplete(task);
    }
    private async Task AnalyzeAsync(ImportedAudio source, long first, long last, int width, int height, long version, CancellationTokenSource cancellation)
    {
        try
        {
            var result = await Task.Run(() => AudioAnalysis.Analyze(source, first, last, width, height, cancellation.Token), cancellation.Token);
            if (!closing && !cancellation.IsCancellationRequested && version == analysisVersion) plot.SetAnalysis(result);
        }
        catch (OperationCanceledException) { }
        catch (Exception ex) { if (!closing && version == analysisVersion) status.Text = "图形分析失败：" + ex.Message; }
        finally
        {
            if (ReferenceEquals(analysisCancellation, cancellation)) analysisCancellation = null;
            cancellation.Dispose();
            if (!closing && version == analysisVersion) { plot.Analyzing = false; plot.Invalidate(); }
        }
    }
    private async Task RemoveWhenComplete(Task task) { await task; analysisJobs.Remove(task); }
    private async Task CancelAnalysisAsync()
    {
        debounce.Stop(); analysisVersion++; analysisCancellation?.Cancel();
        if (analysisJobs.Count != 0) await Task.WhenAll(analysisJobs.ToArray());
    }
    private void UpdateEnabled()
    {
        import.Enabled = !busy && !closing;
        play.Enabled = audio is not null && !importing && !closing;
        export.Enabled = audio is not null && !busy && !closing && plot.Timeline.HasSelection;
        speed.Enabled = mode.Enabled = fit.Enabled = audio is not null && !importing && !closing;
        plot.Enabled = !busy && !closing;
        scroll.Enabled = !busy && audio is not null && plot.Timeline.ViewLength < plot.Timeline.FrameCount;
        cancel.Visible = busy; progress.Visible = busy;
    }
    protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
    {
        if (keyData == Keys.Space && !ratePopup.Visible) { TogglePlay(); return true; }
        if (keyData == (Keys.Control | Keys.O) && !busy) { operation = ImportAsync(); return true; }
        if (keyData == (Keys.Control | Keys.S) && !busy) { operation = ExportAsync(); return true; }
        if (keyData == Keys.Escape && busy) { operationCancellation?.Cancel(); return true; }
        return base.ProcessCmdKey(ref msg, keyData);
    }
    private async void ClosingAsync(object? sender, FormClosingEventArgs e)
    {
        if (allowClose) return;
        e.Cancel = true; if (closing) return;
        closing = true; clock.Stop(); operationCancellation?.Cancel(); analysisCancellation?.Cancel(); debounce.Stop(); Enabled = false;
        try
        {
            await operation; await CancelAnalysisAsync();
            if (player is not null) { await player.DisposeAsync(); player = null; }
            audio?.Dispose(); audio = null;
        }
        catch (Exception ex) { MessageBox.Show(this, "结束工具时遇到问题：" + ex.Message, "采样编辑"); }
        finally { clock.Dispose(); debounce.Dispose(); ratePopup.Dispose(); allowClose = true; Close(); }
    }
    private static string FormatTime(double seconds) => $"{(int)(seconds / 60):00}:{seconds % 60:00.000}";
    private static ToolStrip Bar() => new() { GripStyle = ToolStripGripStyle.Hidden, BackColor = Color.Transparent, Renderer = new ToolStripProfessionalRenderer(), Padding = Padding.Empty, Margin = Padding.Empty, CanOverflow = true };
    private static ToolStripButton Button(string text) => new(text) { DisplayStyle = ToolStripItemDisplayStyle.Text, AutoSize = true, Margin = new Padding(2, 3, 2, 3), Padding = new Padding(6, 2, 6, 2) };
}
