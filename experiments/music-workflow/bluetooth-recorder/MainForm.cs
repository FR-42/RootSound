using System.Diagnostics;
using RootSound.BluetoothRecorder.Receiver;
using RootSound.BluetoothRecorder.Recording;
using RootSound.BluetoothRecorder.Session;

namespace RootSound.BluetoothRecorder;

internal sealed class MainForm : Form
{
    private static readonly Color Ink = Color.FromArgb(30, 42, 54), Muted = Color.FromArgb(100, 113, 124);
    private readonly BluetoothReceiverService receiver = new();
    private readonly OutputLoopbackRecorder capture = new();
    private readonly WindowsReceiverPort receiverPort;
    private readonly WindowsCapturePort capturePort;
    private readonly RecorderSession session;
    private readonly ComboBox devices = new() { DropDownStyle = ComboBoxStyle.DropDownList, Dock = DockStyle.Fill, IntegralHeight = false, DropDownHeight = 180, AccessibleName = "选择手机" };
    private readonly Button connect = MakeButton("连接", true);
    private readonly Button record = MakeButton("开始录音", true), stop = MakeButton("结束录音"), export = MakeButton("导出为音频文件…");
    private readonly Button restart = MakeButton("重新开始");
    private readonly Label connection = MakeLabel("尚未连接", 12, true), state = MakeLabel("连接手机，开始这次录音。", 13);
    private readonly Label timer = MakeLabel("00:00", 38, true), output = MakeLabel("", 10), exported = MakeLabel("", 10);
    private readonly Label meter = new() { Dock = DockStyle.Fill, BackColor = Color.FromArgb(228, 234, 236), Height = 8, AccessibleName = "录音音量" };
    private readonly Panel meterFill = new() { Dock = DockStyle.Left, Width = 0, BackColor = Color.FromArgb(25, 142, 122) };
    private readonly TextBox message = new() { Multiline = true, ReadOnly = true, ScrollBars = ScrollBars.Vertical, BorderStyle = BorderStyle.None,
        BackColor = Color.FromArgb(251, 242, 225), ForeColor = Color.FromArgb(128, 74, 19), Dock = DockStyle.Fill, AccessibleName = "操作提示" };
    private readonly System.Windows.Forms.Timer refresh = new() { Interval = 100 };
    private long receiverRevision = -1;
    private bool closing, allowClose, rendering;

    public MainForm()
    {
        Text = "蓝牙录音 · 音乐流程实验";
        Font = new Font("Microsoft YaHei UI", 10);
        ForeColor = Ink; BackColor = Color.FromArgb(246, 248, 249);
        StartPosition = FormStartPosition.CenterScreen;
        ClientSize = new Size(780, 690); MinimumSize = new Size(690, 700);
        AutoScaleMode = AutoScaleMode.Dpi;
        receiverPort = new(receiver); receiverPort.Attach();
        capturePort = new(capture, receiver); capturePort.Attach();
        string temporaryRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RootSoundExperiments", "BluetoothRecorder", "takes");
        session = new(receiverPort, capturePort, temporaryRoot);
        Compose();
        connect.Click += async (_, _) => await session.ConnectAsync((devices.SelectedItem as DeviceOption)?.Id);
        record.Click += async (_, _) => await session.StartAsync();
        stop.Click += async (_, _) => await session.StopAsync();
        export.Click += async (_, _) => await ExportAsync();
        restart.Click += async (_, _) => await session.RestartAsync();
        refresh.Tick += (_, _) => Render();
        Shown += (_, _) => { refresh.Start(); Render(); };
        FormClosing += OnClosing;
        devices.SelectedIndexChanged += (_, _) => { if (!rendering) Render(); };
        AcceptButton = connect;
        Render();
    }

    private void Compose()
    {
        var layout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 12, Padding = new Padding(32, 22, 32, 18) };
        int[] heights = [44, 26, 42, 28, 32, 66, 10, 26, 50, -1, 26, 128];
        foreach (int height in heights) layout.RowStyles.Add(height < 0
            ? new RowStyle(SizeType.Percent, 100) : new RowStyle(SizeType.Absolute, height));
        Controls.Add(layout);
        var title = MakeLabel("把手机里的声音录下来", 21, true);
        layout.Controls.Add(title, 0, 0);
        var pc = MakeLabel("这台电脑：" + Environment.MachineName, 10); pc.ForeColor = Muted;
        layout.Controls.Add(pc, 0, 1);
        var row = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2, Margin = Padding.Empty };
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100)); row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 112));
        row.Controls.Add(devices, 0, 0); row.Controls.Add(connect, 1, 0);
        devices.Margin = new Padding(0, 5, 10, 0); connect.Margin = Padding.Empty;
        layout.Controls.Add(row, 0, 2);
        var pairing = new FlowLayoutPanel { Dock = DockStyle.Fill, Margin = Padding.Empty, WrapContents = false };
        var help = new LinkLabel { Text = "首次连接？打开蓝牙设置配对", AutoSize = true, LinkColor = Color.FromArgb(23, 112, 107), Margin = new Padding(0, 7, 0, 0) };
        help.LinkClicked += (_, _) => OpenSettings();
        pairing.Controls.Add(help); layout.Controls.Add(pairing, 0, 3);
        layout.Controls.Add(connection, 0, 4);
        timer.TextAlign = ContentAlignment.MiddleCenter; layout.Controls.Add(timer, 0, 5);
        meter.Controls.Add(meterFill); meter.Margin = new Padding(90, 3, 90, 3); layout.Controls.Add(meter, 0, 6);
        state.TextAlign = ContentAlignment.MiddleCenter; layout.Controls.Add(state, 0, 7);
        var actions = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 3, Margin = new Padding(0, 8, 0, 0) };
        actions.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 31)); actions.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 28)); actions.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 41));
        actions.Controls.Add(record, 0, 0); actions.Controls.Add(stop, 1, 0); actions.Controls.Add(export, 2, 0);
        record.Margin = new Padding(0, 0, 8, 0); stop.Margin = new Padding(0, 0, 8, 0); export.Margin = Padding.Empty;
        layout.Controls.Add(actions, 0, 8);
        message.Margin = new Padding(0, 12, 0, 5); layout.Controls.Add(message, 0, 9);
        output.ForeColor = Muted; output.AutoEllipsis = true; layout.Controls.Add(output, 0, 10);
        var bottom = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 5, Margin = Padding.Empty };
        bottom.RowStyles.Add(new RowStyle(SizeType.Absolute, 28));
        bottom.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        bottom.RowStyles.Add(new RowStyle(SizeType.Absolute, 40));
        bottom.RowStyles.Add(new RowStyle(SizeType.Absolute, 24));
        bottom.RowStyles.Add(new RowStyle(SizeType.Absolute, 24));
        exported.ForeColor = Muted; exported.AutoEllipsis = true; bottom.Controls.Add(exported, 0, 0);
        restart.Width = 132; restart.Dock = DockStyle.None; restart.Height = 38; restart.Anchor = AnchorStyles.Left | AnchorStyles.Bottom;
        bottom.Controls.Add(restart, 0, 2);
        var resetHint = MakeLabel("重新开始只清空本轮录音，保留连接和已导出的文件。", 9); resetHint.ForeColor = Muted; bottom.Controls.Add(resetHint, 0, 3);
        var captureHint = MakeLabel("录制电脑播放的声音，通知和其他程序声音也会录入。", 9); captureHint.ForeColor = Muted; bottom.Controls.Add(captureHint, 0, 4);
        layout.Controls.Add(bottom, 0, 11);
    }

    private void Render()
    {
        if (closing || IsDisposed) return;
        var r = receiver.Snapshot;
        var s = session.Snapshot;
        rendering = true;
        try
        {
            if (r.Revision != receiverRevision)
            {
                var selection = (devices.SelectedItem as DeviceOption)?.Id;
                receiverRevision = r.Revision;
                devices.BeginUpdate();
                devices.Items.Clear();
                if (r.Devices.Count == 0) devices.Items.Add(new DeviceOption(null, r.IsEnabled ? "等待已配对的手机…" : "点击连接，查找手机"));
                else foreach (var device in r.Devices) devices.Items.Add(new DeviceOption(device.Id, device.Name));
                string? preferred = r.ConnectedDeviceId ?? selection ?? r.SelectedDeviceId;
                int index = Enumerable.Range(0, devices.Items.Count).FirstOrDefault(i => (devices.Items[i] as DeviceOption)?.Id == preferred, -1);
                devices.SelectedIndex = index >= 0 ? index : 0;
                devices.EndUpdate();
            }
            bool pendingReceiver = r.IsConnecting || r.IsDiscovering;
            connect.Enabled = s.CanConnect && !pendingReceiver;
            connect.Text = r.IsConnecting || s.Phase == SessionPhase.Connecting ? "连接中…" : r.CanRecord ? "已连接" : "连接";
            devices.Enabled = s.CanConnect && !pendingReceiver;
            record.Enabled = s.CanRecord;
            stop.Enabled = s.CanStop;
            export.Enabled = s.CanExport;
            restart.Enabled = true;
            restart.Text = s.Phase == SessionPhase.Restarting ? "正在重新开始…" : "重新开始";
            connection.Text = r.CanRecord ? "●  已连接 · " + r.ConnectedDeviceName : "○  " + r.Status;
            connection.ForeColor = r.CanRecord ? Color.FromArgb(19, 126, 103) : Muted;
            state.Text = s.Phase == SessionPhase.Recording ? "正在录音" : s.Status;
            timer.Text = s.Duration.TotalHours >= 1 ? s.Duration.ToString(@"h\:mm\:ss") : s.Duration.ToString(@"mm\:ss");
            meterFill.Width = (int)(meter.ClientSize.Width * Math.Clamp(s.Peak, 0, 1));
            meterFill.BackColor = s.Peak >= .98f ? Color.FromArgb(194, 68, 53) : Color.FromArgb(25, 142, 122);
            output.Text = s.EndpointName is null ? "" : "声音来源：" + s.EndpointName + (s.DataBytes > 0 ? $"    {s.DataBytes / (1024d * 1024):0.0} MB" : "");
            exported.Text = s.LastExport is null ? "" : "已保存：" + s.LastExport;
            string? error = s.Error ?? r.Error;
            message.Text = error ?? (r.IsEnabled && r.Devices.Count == 0
                ? "请先在 Windows 蓝牙设置里与手机配对。配对后，工具会自动发现手机。"
                : r.Devices.Count > 1 && !r.CanRecord ? "请选择要使用的手机，然后点击连接。" : "");
            message.Visible = message.Text.Length > 0;
            PaintButton(record, true); PaintButton(connect, true);
        }
        finally { rendering = false; }
    }
    private async Task ExportAsync()
    {
        if (!session.Snapshot.CanExport) return;
        using SaveFileDialog dialog = new()
        {
            Title = "导出录音", Filter = "WAV 音频文件 (*.wav)|*.wav", DefaultExt = "wav", AddExtension = true,
            FileName = "手机录音-" + DateTime.Now.ToString("yyyyMMdd-HHmmss") + ".wav", OverwritePrompt = true,
            CheckPathExists = true, RestoreDirectory = true
        };
        if (dialog.ShowDialog(this) == DialogResult.OK)
            await session.ExportAsync(dialog.FileName, overwrite: true);
    }
    private void OpenSettings()
    {
        try { Process.Start(new ProcessStartInfo("ms-settings:bluetooth") { UseShellExecute = true }); }
        catch (Exception ex) { message.Text = "无法打开设置：" + ex.Message; message.Visible = true; }
    }
    private async void OnClosing(object? sender, FormClosingEventArgs e)
    {
        if (allowClose) return;
        e.Cancel = true;
        if (closing) return;
        var s = session.Snapshot;
        if ((s.Phase == SessionPhase.Recording || s.DataBytes > 0 && s.ExportCount == 0) &&
            MessageBox.Show(this, "录音尚未导出。退出并清空本次录音？", "退出录音", MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes)
            return;
        closing = true; refresh.Stop(); Enabled = false;
        try { await session.DisposeAsync(); await capture.DisposeAsync(); await receiver.DisposeAsync(); }
        catch (Exception ex) { MessageBox.Show(this, "停止工具时遇到问题：" + ex.Message, "蓝牙录音"); }
        finally
        {
            capturePort.Dispose(); receiverPort.Dispose(); refresh.Dispose(); allowClose = true; Close();
        }
    }
    private static Label MakeLabel(string text, float size, bool bold = false) => new()
    {
        Text = text, Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft,
        Font = new Font("Microsoft YaHei UI", size, bold ? FontStyle.Bold : FontStyle.Regular), Margin = Padding.Empty
    };
    private static Button MakeButton(string text, bool primary = false)
    {
        var button = new Button { Text = text, Dock = DockStyle.Fill, FlatStyle = FlatStyle.Flat, Cursor = Cursors.Hand, UseVisualStyleBackColor = false };
        button.FlatAppearance.BorderSize = primary ? 0 : 1; button.FlatAppearance.BorderColor = Color.FromArgb(204, 215, 219);
        PaintButton(button, primary); return button;
    }
    private static void PaintButton(Button button, bool primary)
    {
        button.BackColor = primary && button.Enabled ? Color.FromArgb(22, 123, 111) : Color.FromArgb(232, 238, 239);
        button.ForeColor = primary && button.Enabled ? Color.White : Ink;
    }
    private sealed record DeviceOption(string? Id, string Name) { public override string ToString() => Name; }
}
