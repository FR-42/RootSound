using RootSound.TimbreLab.Instrument;

namespace RootSound.TimbreLab.Controls;

/// <summary>Continuous 88-key keyboard with readable keys and a horizontal scrollbar.</summary>
public sealed class ReferenceKeyboard : Panel
{
    private const int WhiteWidth = 32, WhiteHeight = 57, BlackWidth = 22, BlackHeight = 35;
    private readonly Dictionary<int, Button> keys = [];
    public event Action<int>? NotePressed;
    internal IReadOnlyDictionary<int, Button> KeysByNote => keys;

    public ReferenceKeyboard()
    {
        Dock = DockStyle.Fill; AutoScroll = true; Margin = Padding.Empty;
        int whites = 0;
        for (int note = PianoReference.LowestNote; note <= PianoReference.HighestNote; note++)
        {
            int midi = note;
            bool black = IsBlack(note);
            int x = black ? whites * WhiteWidth - BlackWidth / 2 : whites * WhiteWidth;
            var button = new Button
            {
                Text = NoteName(note), Tag = note, Bounds = new Rectangle(x, 1, black ? BlackWidth : WhiteWidth, black ? BlackHeight : WhiteHeight),
                BackColor = black ? Color.FromArgb(42, 52, 64) : Color.White,
                ForeColor = black ? Color.White : Color.FromArgb(35, 50, 64),
                FlatStyle = FlatStyle.Flat, TextAlign = ContentAlignment.BottomCenter,
                Margin = Padding.Empty, Padding = Padding.Empty,
                Font = new Font("Microsoft YaHei UI", black ? 6.5f : 8),
                AccessibleName = $"{NoteName(note)} · {PianoReference.Frequency(note):0.##} Hz"
            };
            button.FlatAppearance.BorderColor = Color.FromArgb(100, 113, 124);
            button.Click += (_, _) => NotePressed?.Invoke(midi);
            keys.Add(note, button); Controls.Add(button);
            if (!black) whites++;
        }
        foreach (var pair in keys.Where(pair => IsBlack(pair.Key))) pair.Value.BringToFront();
        AutoScrollMinSize = new Size(whites * WhiteWidth + 1, WhiteHeight + 3);
    }

    public void CenterOn(int note)
        => AutoScrollPosition = new Point(CenterOffset(note), 0);

    // Keep the geometry separately testable without creating a native window.
    // WinForms applies AutoScrollPosition only after the control is created.
    internal int CenterOffset(int note)
    {
        int target = Math.Clamp(note, PianoReference.LowestNote, PianoReference.HighestNote);
        var key = keys[target];
        int current = -AutoScrollPosition.X;
        return Math.Clamp(key.Left + current + key.Width / 2 - ClientSize.Width / 2,
            0, Math.Max(0, AutoScrollMinSize.Width - ClientSize.Width));
    }
    public void ShiftOctave(int direction)
        => CenterOn(OctaveTarget(direction, -AutoScrollPosition.X));

    internal int OctaveTarget(int direction, int offset)
    {
        int current = -AutoScrollPosition.X;
        int middle = keys.MinBy(pair => Math.Abs(pair.Value.Left + current + pair.Value.Width / 2 - offset - ClientSize.Width / 2)).Key;
        return Math.Clamp(middle + Math.Sign(direction) * 12, PianoReference.LowestNote, PianoReference.HighestNote);
    }
    public void Highlight(int note)
    {
        foreach (var pair in keys)
            pair.Value.BackColor = pair.Key == note ? Color.FromArgb(54, 151, 136) : IsBlack(pair.Key) ? Color.FromArgb(42, 52, 64) : Color.White;
    }
    protected override void OnMouseWheel(MouseEventArgs e)
    {
        int current = -AutoScrollPosition.X;
        AutoScrollPosition = new Point(Math.Max(0, current - e.Delta / 120 * WhiteWidth * 3), 0);
        if (e is HandledMouseEventArgs handled) handled.Handled = true;
    }
    private static bool IsBlack(int note) => note % 12 is 1 or 3 or 6 or 8 or 10;
    internal static string NoteName(int note) => new[] { "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B" }[note % 12] + (note / 12 - 1);
}
