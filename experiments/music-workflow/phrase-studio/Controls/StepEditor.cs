using System.ComponentModel;
using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Editing;

namespace RootSound.PhraseStudio.Controls;

internal sealed class StepEditor : Control
{
    private readonly HScrollBar scroll = new() { Dock = DockStyle.Bottom, SmallChange = 32 };
    private readonly ComboBox pitch = new() { DropDownStyle = ComboBoxStyle.DropDownList, Width = 100 };
    private IReadOnlyList<PhraseNote> notes = [];
    private long totalTicks = 3840;
    private int stepPitch = 60, scrollPixels;
    private double playheadTick = -1;
    private const int CellWidth = 38, LeftMargin = 28;
    private int selectedStep;
    private bool editingVelocity;
    private IReadOnlyList<PhraseNote>? velocityBefore;
    internal event Action<IReadOnlyList<PhraseNote>>? NotesChanged;
    internal event Action<int>? NoteAudition;
    internal event Action<int>? StepPitchChanged;
    internal IReadOnlyList<PhraseNote> Notes => notes;
    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    internal int StepPitch
    {
        get => stepPitch;
        set { stepPitch = Math.Clamp(value, 0, 127); if (pitch.SelectedIndex != stepPitch) pitch.SelectedIndex = stepPitch; Invalidate(); }
    }
    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    internal double PlayheadTick { get => playheadTick; set { playheadTick = value; Invalidate(); } }
    internal Rectangle StepsBounds => new(LeftMargin, 100, Math.Max(1, Width - LeftMargin * 2), Math.Clamp((Height - 150) / 2, 48, 100));
    internal StepEditor()
    {
        DoubleBuffered = true; ResizeRedraw = true; TabStop = true;
        SetStyle(ControlStyles.Selectable, true);
        BackColor = Color.FromArgb(19, 23, 29); ForeColor = Color.FromArgb(203, 211, 224);
        Controls.Add(scroll); Controls.Add(pitch);
        for (int i = 0; i < 128; i++) pitch.Items.Add(NoteEditMath.PitchName(i));
        pitch.SelectedIndex = stepPitch; pitch.Location = new Point(82, 18);
        pitch.SelectionChangeCommitted += (_, _) => { StepPitch = pitch.SelectedIndex; StepPitchChanged?.Invoke(stepPitch); NoteAudition?.Invoke(stepPitch); };
        scroll.ValueChanged += (_, _) => { scrollPixels = scroll.Value; Invalidate(); };
        AccessibleName = "步进音序器；每小节十六格，点击开关，滚轮横向滚动；不同音高的音符保留在钢琴卷帘中";
        UpdateScroll();
    }
    internal void SetNotes(IReadOnlyList<PhraseNote> value, long durationTicks, int selectedPitch = 60)
    { notes = value.ToArray(); totalTicks = Math.Max(1, durationTicks); StepPitch = selectedPitch; UpdateScroll(); Invalidate(); }
    protected override void OnResize(EventArgs e) { base.OnResize(e); UpdateScroll(); }
    private void UpdateScroll()
    {
        int content = (int)Math.Ceiling(totalTicks / 240d) * CellWidth;
        int width = Math.Max(1, Width - 2 * LeftMargin);
        scroll.Minimum = 0; scroll.LargeChange = width; scroll.Maximum = Math.Max(width - 1, content - 1);
        scrollPixels = Math.Clamp(scrollPixels, 0, Math.Max(0, content - width)); scroll.Value = scrollPixels;
        scroll.Enabled = content > width;
    }
    internal Rectangle CellBounds(int index) => new(LeftMargin + index * CellWidth - scrollPixels + 2, StepsBounds.Top, CellWidth - 5, StepsBounds.Height);
    protected override void OnPaint(PaintEventArgs e) { base.OnPaint(e); RenderCanvas(e.Graphics, ClientRectangle); }
    internal void RenderCanvas(Graphics graphics, Rectangle bounds)
    {
        graphics.Clear(BackColor);
        using var text = new SolidBrush(ForeColor);
        using var muted = new SolidBrush(Color.FromArgb(134, 148, 167));
        graphics.DrawString("音高", Font, text, 28, 22);
        int hidden = notes.Count(note => note.Pitch != stepPitch);
        string description = hidden > 0 ? $"另有 {hidden} 个其他音高的音符，可在钢琴卷帘中编辑" : "点击格子添加或移除音符";
        graphics.DrawString(description, Font, muted, 205, 22);
        var clip = graphics.Save(); graphics.SetClip(new Rectangle(LeftMargin, 58, Math.Max(1, Width - LeftMargin * 2), Math.Max(1, Height - 90)));
        int first = Math.Max(0, scrollPixels / CellWidth), count = (int)Math.Ceiling(totalTicks / 240d);
        int last = Math.Min(count - 1, (scrollPixels + Width) / CellWidth);
        using var on = new SolidBrush(Color.FromArgb(89, 195, 198));
        using var offA = new SolidBrush(Color.FromArgb(41, 50, 63));
        using var offB = new SolidBrush(Color.FromArgb(57, 65, 80));
        using var border = new Pen(Color.FromArgb(78, 92, 111));
        using var velocity = new SolidBrush(Color.FromArgb(71, 131, 148));
        for (int index = first; index <= last; index++)
        {
            Rectangle rect = CellBounds(index);
            if (index % 16 == 0) graphics.DrawString($"第 {index / 16 + 1} 小节", Font, text, rect.Left, 65);
            else if (index % 4 == 0) graphics.DrawString((index % 16 / 4 + 1).ToString(), Font, muted, rect.Left + 8, 78);
            bool lit = NoteEditMath.IsStepOn(notes, stepPitch, index * 240L);
            graphics.FillRectangle(lit ? on : index / 4 % 2 == 0 ? offA : offB, rect);
            graphics.DrawRectangle(border, rect);
            if (lit)
            {
                double strength = notes.Where(note => note.Pitch == stepPitch && note.StartTick >= index * 240L && note.StartTick < (index + 1) * 240L).Max(note => note.Velocity);
                int height = (int)Math.Round(Math.Clamp(strength, 0, 1) * 48);
                graphics.FillRectangle(velocity, rect.Left, rect.Bottom + 65 - height, rect.Width, height);
            }
            if (Focused && selectedStep == index) graphics.DrawRectangle(Pens.White, rect.Left + 2, rect.Top + 2, rect.Width - 4, rect.Height - 4);
        }
        graphics.DrawString("力度 · 拖动调整", Font, muted, LeftMargin, StepsBounds.Bottom + 74);
        if (playheadTick >= 0 && playheadTick <= totalTicks)
        {
            float x = LeftMargin + (float)(playheadTick / 240 * CellWidth) - scrollPixels;
            using var head = new Pen(Color.FromArgb(255, 97, 104), 2);
            graphics.DrawLine(head, x, 82, x, StepsBounds.Bottom + 65);
        }
        graphics.Restore(clip);
    }
    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e); Focus();
        if (e.Button != MouseButtons.Left || e.X < LeftMargin || e.X > Width - LeftMargin) return;
        int index = (e.X - LeftMargin + scrollPixels) / CellWidth;
        if (index * 240L >= totalTicks) return;
        if (e.Y >= StepsBounds.Bottom + 16 && e.Y <= StepsBounds.Bottom + 65)
        {
            if (!NoteEditMath.IsStepOn(notes, stepPitch, index * 240L)) return;
            selectedStep = index; velocityBefore = notes; editingVelocity = true; Capture = true;
            UpdateVelocity(e.Y); return;
        }
        if (e.Y < StepsBounds.Top || e.Y > StepsBounds.Bottom) return;
        selectedStep = index;
        bool wasOn = NoteEditMath.IsStepOn(notes, stepPitch, index * 240L);
        notes = NoteEditMath.ToggleStep(notes, stepPitch, index, totalTicks);
        if (!wasOn) NoteAudition?.Invoke(stepPitch);
        NotesChanged?.Invoke(notes); Invalidate();
    }
    private void UpdateVelocity(int y)
    { notes = NoteEditMath.SetStepVelocity(notes, stepPitch, selectedStep, (StepsBounds.Bottom + 65 - y) / 48d); Invalidate(); }
    protected override void OnMouseMove(MouseEventArgs e)
    { base.OnMouseMove(e); if (editingVelocity) UpdateVelocity(e.Y); }
    protected override void OnMouseUp(MouseEventArgs e)
    {
        base.OnMouseUp(e);
        if (!editingVelocity) return;
        editingVelocity = false; Capture = false; velocityBefore = null;
        NotesChanged?.Invoke(notes);
    }
    protected override void OnMouseCaptureChanged(EventArgs e)
    {
        base.OnMouseCaptureChanged(e);
        if (!Capture && editingVelocity)
        { editingVelocity = false; if (velocityBefore is not null) notes = velocityBefore; velocityBefore = null; Invalidate(); }
    }
    protected override void OnMouseWheel(MouseEventArgs e)
    { base.OnMouseWheel(e); scroll.Value = Math.Clamp(scroll.Value - e.Delta / 120 * CellWidth * 4, 0, Math.Max(0, scroll.Maximum - scroll.LargeChange + 1)); }
    protected override bool IsInputKey(Keys keyData) => (keyData & Keys.KeyCode) is Keys.Left or Keys.Right or Keys.Up or Keys.Down || base.IsInputKey(keyData);
    protected override void OnKeyDown(KeyEventArgs e)
    {
        base.OnKeyDown(e);
        if (e.KeyCode is Keys.Left or Keys.Right)
        {
            selectedStep = Math.Clamp(selectedStep + (e.KeyCode == Keys.Left ? -1 : 1), 0, Math.Max(0, (int)Math.Ceiling(totalTicks / 240d) - 1));
            int left = selectedStep * CellWidth, right = left + CellWidth;
            scroll.Value = Math.Clamp(left < scroll.Value ? left : right > scroll.Value + scroll.LargeChange ? right - scroll.LargeChange : scroll.Value, 0, scroll.Maximum - scroll.LargeChange + 1);
            e.Handled = true; Invalidate();
        }
        else if (e.KeyCode is Keys.Up or Keys.Down)
        {
            StepPitch += e.KeyCode == Keys.Up ? 1 : -1; StepPitchChanged?.Invoke(stepPitch); NoteAudition?.Invoke(stepPitch); e.Handled = true;
        }
        // Space is deliberately left to the phrase transport in the parent window.
        else if (e.KeyCode == Keys.Enter)
        {
            bool wasOn = NoteEditMath.IsStepOn(notes, stepPitch, selectedStep * 240L);
            notes = NoteEditMath.ToggleStep(notes, stepPitch, selectedStep, totalTicks);
            if (!wasOn) NoteAudition?.Invoke(stepPitch);
            NotesChanged?.Invoke(notes); e.Handled = true; Invalidate();
        }
    }
}
