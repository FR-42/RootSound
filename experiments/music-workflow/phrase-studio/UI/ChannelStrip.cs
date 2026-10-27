using RootSound.PhraseStudio.Controls;
using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Editing;

namespace RootSound.PhraseStudio.UI;

internal sealed class ChannelStrip : UserControl
{
    private readonly Button name = UiTheme.Button("导入音色…"), detail = UiTheme.Button("详细编辑"), more = UiTheme.Button("⋯");
    private readonly ComboBox mode = new() { DropDownStyle = ComboBoxStyle.DropDownList, Dock = DockStyle.Fill };
    private readonly CheckBox mute = new() { Text = "静音", AutoSize = true, Anchor = AnchorStyles.None };
    private readonly NumericUpDown gain = new() { Minimum = -60, Maximum = 24, DecimalPlaces = 1, Increment = .5m, Width = 62, Dock = DockStyle.Fill };
    private readonly ChannelPreview preview = new() { Dock = DockStyle.Fill };
    private readonly ContextMenuStrip menu = new();
    private readonly ToolTip tips = new();
    private bool suppress;
    internal Guid ChannelId { get; }
    internal event Action<Guid>? ImportRequested, RenameRequested, RemoveRequested, DetailRequested;
    internal event Action<Guid, EditorMode>? ModeChanged;
    internal event Action<Guid, bool>? MuteChanged;
    internal event Action<Guid, double>? GainChanged;
    internal event Action<Guid, IReadOnlyList<PhraseNote>>? NotesChanged;
    internal event Action<Guid, int>? NoteAudition;

    internal ChannelStrip(Guid id)
    {
        ChannelId = id; Height = 79; Margin = new Padding(0, 0, 0, 9); Padding = new Padding(7);
        BackColor = UiTheme.Panel;
        var layout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 7, RowCount = 1 };
        foreach (int width in new[] { 176, 128 }) layout.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, width));
        layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        foreach (int width in new[] { 100, 57, 66, 40 }) layout.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, width));
        name.Dock = DockStyle.Fill; name.AutoSize = false; name.AutoEllipsis = true; name.TextAlign = ContentAlignment.MiddleLeft;
        detail.Dock = DockStyle.Fill; detail.AutoSize = false; more.Dock = DockStyle.Fill; more.AutoSize = false;
        mode.Items.AddRange(["步进音序器", "钢琴卷帘"]);
        var modeBox = new TableLayoutPanel { Dock = DockStyle.Fill, RowCount = 3, Padding = new Padding(0, 13, 0, 0) };
        modeBox.Controls.Add(mode);
        var volumeBox = new TableLayoutPanel { Dock = DockStyle.Fill, RowCount = 2 };
        volumeBox.Controls.Add(new Label { Text = "音量 dB", AutoSize = true, ForeColor = UiTheme.Muted }); volumeBox.Controls.Add(gain);
        layout.Controls.Add(name, 0, 0); layout.Controls.Add(modeBox, 1, 0); layout.Controls.Add(preview, 2, 0);
        layout.Controls.Add(detail, 3, 0); layout.Controls.Add(mute, 4, 0); layout.Controls.Add(volumeBox, 5, 0); layout.Controls.Add(more, 6, 0);
        Controls.Add(layout);
        menu.Items.Add("重命名…", null, (_, _) => RenameRequested?.Invoke(ChannelId));
        menu.Items.Add("更换音色…", null, (_, _) => ImportRequested?.Invoke(ChannelId));
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add("移除通道", null, (_, _) => RemoveRequested?.Invoke(ChannelId));
        more.Click += (_, _) => menu.Show(more, new Point(0, more.Height));
        detail.Click += (_, _) => DetailRequested?.Invoke(ChannelId);
        name.Click += (_, _) => { if (preview.Enabled) RenameRequested?.Invoke(ChannelId); else ImportRequested?.Invoke(ChannelId); };
        mode.SelectionChangeCommitted += (_, _) => { if (!suppress) ModeChanged?.Invoke(ChannelId, mode.SelectedIndex == 1 ? EditorMode.PianoRoll : EditorMode.StepSequencer); };
        mute.CheckedChanged += (_, _) => { if (!suppress) MuteChanged?.Invoke(ChannelId, mute.Checked); };
        gain.ValueChanged += (_, _) => { if (!suppress) GainChanged?.Invoke(ChannelId, (double)gain.Value); };
        preview.NotesChanged += notes => NotesChanged?.Invoke(ChannelId, notes);
        preview.NoteAudition += pitch => NoteAudition?.Invoke(ChannelId, pitch);
        preview.DetailedEditRequested += () => DetailRequested?.Invoke(ChannelId);
        UiTheme.Apply(this);
    }

    internal void RefreshChannel(PhraseChannel channel, long totalTicks)
    {
        suppress = true;
        try
        {
            name.Text = channel.Timbre is null ? "导入音色…" : channel.Name;
            mode.SelectedIndex = channel.Mode == EditorMode.PianoRoll ? 1 : 0;
            mute.Checked = channel.Muted; gain.Value = (decimal)channel.GainDb;
            preview.Mode = channel.Mode; preview.Enabled = detail.Enabled = channel.Timbre is not null;
            preview.SetNotes(channel.Notes, totalTicks, channel.StepPitch);
            tips.SetToolTip(name, channel.Timbre is null ? "选择音色打磨导出的 .rstimbre 文件" : channel.Name + " · 点击重命名，右侧 ⋯ 可更换音色");
            tips.SetToolTip(preview, channel.Mode == EditorMode.PianoRoll ? "双击进入钢琴卷帘" : "点击格子添加或移除；滚轮翻小节 · " + NoteEditMath.PitchName(channel.StepPitch));
        }
        finally { suppress = false; }
    }
    internal void SetPlayhead(double tick) => preview.PlayheadTick = tick;
    protected override void Dispose(bool disposing) { if (disposing) { menu.Dispose(); tips.Dispose(); } base.Dispose(disposing); }
}
