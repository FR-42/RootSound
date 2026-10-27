using System.Drawing.Drawing2D;

namespace RootSound.ReferenceStudio.Controls;

internal static class ReferenceTheme
{
    internal static readonly Color Background = Color.FromArgb(17, 21, 28);
    internal static readonly Color Panel = Color.FromArgb(25, 31, 41);
    internal static readonly Color Raised = Color.FromArgb(35, 44, 57);
    internal static readonly Color Foreground = Color.FromArgb(223, 230, 240);
    internal static readonly Color Muted = Color.FromArgb(146, 160, 180);
    internal static readonly Color Accent = Color.FromArgb(102, 211, 201);
    internal static Button Button(string text) => new()
    {
        Text = text, AutoSize = true, AutoSizeMode = AutoSizeMode.GrowAndShrink,
        FlatStyle = FlatStyle.Flat, BackColor = Raised, ForeColor = Foreground,
        Padding = new Padding(10, 4, 10, 4), Margin = new Padding(4), Cursor = Cursors.Hand,
        MinimumSize = new Size(62, 32), UseVisualStyleBackColor = false
    };
    internal static Label Label(string text) => new()
    { Text = text, AutoSize = true, ForeColor = Muted, Margin = new Padding(8, 12, 4, 0) };
    internal static void Apply(Control parent)
    {
        foreach (Control child in parent.Controls)
        {
            if (child is TextBoxBase or ComboBox or NumericUpDown)
            { child.BackColor = Raised; child.ForeColor = Foreground; }
            else if (child is ToolStrip strip)
            {
                strip.BackColor = Panel; strip.ForeColor = Foreground;
                strip.Renderer = new ToolStripProfessionalRenderer(new Palette());
            }
            Apply(child);
        }
    }
    private sealed class Palette : ProfessionalColorTable
    {
        public override Color ToolStripGradientBegin => Panel;
        public override Color ToolStripGradientMiddle => Panel;
        public override Color ToolStripGradientEnd => Panel;
        public override Color ButtonSelectedHighlight => Raised;
        public override Color ButtonSelectedGradientBegin => Raised;
        public override Color ButtonSelectedGradientEnd => Raised;
        public override Color ButtonCheckedGradientBegin => Color.FromArgb(45, 81, 83);
        public override Color ButtonCheckedGradientEnd => Color.FromArgb(45, 81, 83);
        public override Color ButtonPressedGradientBegin => Raised;
        public override Color ButtonPressedGradientEnd => Raised;
        public override Color ToolStripBorder => Panel;
    }
}
