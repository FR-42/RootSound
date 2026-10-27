using RootSound.PhraseStudio.Core;

namespace RootSound.ReferenceStudio.Controls;

internal sealed class LayerRow : Panel
{
    private readonly Button name = ReferenceTheme.Button("");
    private readonly Label role = new() { AutoEllipsis = true, ForeColor = ReferenceTheme.Muted };
    private readonly CheckBox mute = new() { Text = "静音", AutoSize = true };
    private readonly CheckBox solo = new() { Text = "独听", AutoSize = true };
    private readonly NumericUpDown gain = new() { Minimum = -60, Maximum = 24, DecimalPlaces = 1, Width = 67, Increment = 1 };
    private readonly Guid id;
    private bool updating, selected;
    internal event Action<Guid>? Selected;
    internal event Action<Guid, bool>? MuteChanged;
    internal event Action<Guid, bool>? SoloChanged;
    internal event Action<Guid, double>? GainChanged;
    internal Guid ChannelId => id;
    internal bool IsSelected => selected;
    internal bool IsSolo => solo.Checked;
    internal bool IsMuted => mute.Checked;

    internal LayerRow(Guid id)
    {
        this.id = id; Height = 106; Width = 240; Margin = new Padding(0, 0, 0, 8);
        BackColor = ReferenceTheme.Panel; ForeColor = ReferenceTheme.Foreground;
        name.AutoSize = false; name.FlatAppearance.BorderSize = 0; name.TextAlign = ContentAlignment.MiddleLeft;
        name.Anchor = AnchorStyles.Left | AnchorStyles.Top | AnchorStyles.Right;
        name.SetBounds(9, 7, 220, 32); name.BackColor = ReferenceTheme.Panel;
        role.SetBounds(20, 42, 205, 20); role.Anchor = AnchorStyles.Left | AnchorStyles.Top | AnchorStyles.Right;
        mute.Location = new Point(16, 75); solo.Location = new Point(78, 75);
        gain.Location = new Point(145, 72);
        var db = new Label { Text = "dB", ForeColor = ReferenceTheme.Muted, AutoSize = true, Location = new Point(213, 76) };
        Controls.AddRange([name, role, mute, solo, gain, db]);
        name.Click += (_, _) => Selected?.Invoke(id); Click += (_, _) => Selected?.Invoke(id);
        role.Click += (_, _) => Selected?.Invoke(id);
        mute.CheckedChanged += (_, _) => { if (!updating) MuteChanged?.Invoke(id, mute.Checked); };
        solo.CheckedChanged += (_, _) => { if (!updating) SoloChanged?.Invoke(id, solo.Checked); };
        gain.ValueChanged += (_, _) => { if (!updating) GainChanged?.Invoke(id, (double)gain.Value); };
        ReferenceTheme.Apply(this);
    }
    internal void RefreshLayer(PhraseChannel channel, string roleText, bool isSelected, bool isSolo)
    {
        updating = true;
        try
        {
            name.Text = channel.Name; role.Text = roleText; mute.Checked = channel.Muted;
            solo.Checked = isSolo; gain.Value = (decimal)channel.GainDb; selected = isSelected;
            BackColor = selected ? Color.FromArgb(34, 54, 63) : ReferenceTheme.Panel;
            name.BackColor = BackColor; name.ForeColor = selected ? ReferenceTheme.Accent : ReferenceTheme.Foreground;
            Invalidate();
        }
        finally { updating = false; }
    }
    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        if (selected) { using var brush = new SolidBrush(ReferenceTheme.Accent); e.Graphics.FillRectangle(brush, 0, 0, 3, Height); }
    }
}
