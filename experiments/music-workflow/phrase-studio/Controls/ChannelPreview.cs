using System.ComponentModel;
using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Editing;

namespace RootSound.PhraseStudio.Controls;

/// <summary>Compact step editing or a deliberately simple piano-roll overview.</summary>
internal sealed class ChannelPreview : Control
{
    private IReadOnlyList<PhraseNote> notes = [];
    private long totalTicks = 3840;
    private int stepPitch = 60, firstStep;
    private EditorMode mode = EditorMode.PianoRoll;
    private double playheadTick = -1;
    internal event Action<IReadOnlyList<PhraseNote>>? NotesChanged;
    internal event Action<int>? NoteAudition;
    internal event Action? DetailedEditRequested;
    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    internal EditorMode Mode { get => mode; set { mode = value; Invalidate(); } }
    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    internal int StepPitch { get => stepPitch; set { stepPitch = Math.Clamp(value, 0, 127); Invalidate(); } }
    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    internal double PlayheadTick { get => playheadTick; set { playheadTick = value; Invalidate(); } }
    internal IReadOnlyList<PhraseNote> Notes => notes;
    internal ChannelPreview()
    {
        DoubleBuffered = true; ResizeRedraw = true; TabStop = true;
        BackColor = Color.FromArgb(24, 30, 39); ForeColor = Color.FromArgb(91, 191, 198);
        AccessibleName = "通道预览；步进模式可直接点击，钢琴卷帘模式双击进入详细编辑";
    }
    internal void SetNotes(IReadOnlyList<PhraseNote> value, long durationTicks, int selectedPitch = 60)
    { notes = value.ToArray(); totalTicks = Math.Max(1, durationTicks); StepPitch = selectedPitch; ClampFirstStep(); Invalidate(); }
    private int VisibleStepCount => Math.Max(1, (Width - 12) / 22);
    private int StepCount => (int)Math.Ceiling(totalTicks / 240d);
    private void ClampFirstStep() => firstStep = Math.Clamp(firstStep, 0, Math.Max(0, StepCount - VisibleStepCount));
    protected override void OnResize(EventArgs e) { base.OnResize(e); ClampFirstStep(); }
    protected override void OnPaint(PaintEventArgs e) { base.OnPaint(e); RenderCanvas(e.Graphics, ClientRectangle); }
    internal void RenderCanvas(Graphics graphics, Rectangle bounds)
    {
        graphics.Clear(BackColor);
        using var foreground = new SolidBrush(ForeColor);
        if (mode == EditorMode.StepSequencer)
        {
            using var a = new SolidBrush(Color.FromArgb(48, 59, 74));
            using var b = new SolidBrush(Color.FromArgb(63, 73, 89));
            int last = Math.Min(StepCount, firstStep + VisibleStepCount);
            for (int step = firstStep; step < last; step++)
            {
                var rect = new Rectangle(6 + (step - firstStep) * 22, 10, 18, Math.Max(8, Height - 25));
                graphics.FillRectangle(NoteEditMath.IsStepOn(notes, stepPitch, step * 240L) ? foreground : step / 4 % 2 == 0 ? a : b, rect);
                if (step % 16 == 0)
                { using var label = new SolidBrush(Color.FromArgb(177, 188, 201)); graphics.DrawString((step / 16 + 1).ToString(), Font, label, rect.X, Math.Max(0, Height - 15)); }
            }
            if (playheadTick >= firstStep * 240L && playheadTick <= last * 240L)
            {
                float x = 6 + (float)(playheadTick / 240d - firstStep) * 22;
                using var head = new Pen(Color.FromArgb(255, 97, 104), 2); graphics.DrawLine(head, x, 4, x, Height - 4);
            }
        }
        else
        {
            int minPitch = notes.Count == 0 ? 48 : Math.Max(0, notes.Min(note => note.Pitch) - 2);
            int maxPitch = notes.Count == 0 ? 72 : Math.Min(127, notes.Max(note => note.Pitch) + 2);
            int range = Math.Max(12, maxPitch - minPitch + 1);
            using var grid = new Pen(Color.FromArgb(47, 58, 72));
            for (int bar = 0; bar * 3840L <= totalTicks; bar++)
            { float x = 6 + bar * 3840f / totalTicks * (Width - 12); graphics.DrawLine(grid, x, 4, x, Height - 4); }
            foreach (var note in notes)
            {
                float x = 6 + note.StartTick / (float)totalTicks * (Width - 12);
                float y = 5 + (maxPitch - note.Pitch) / (float)range * (Height - 12);
                float width = Math.Max(3, note.LengthTick / (float)totalTicks * (Width - 12));
                graphics.FillRectangle(foreground, x, y, width, Math.Clamp((Height - 12f) / range, 2, 5));
            }
            if (playheadTick >= 0 && playheadTick <= totalTicks)
            { float x = 6 + (float)(playheadTick / totalTicks * (Width - 12)); using var head = new Pen(Color.FromArgb(255, 97, 104), 2); graphics.DrawLine(head, x, 4, x, Height - 4); }
        }
    }
    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e); Focus();
        if (mode != EditorMode.StepSequencer || e.Button != MouseButtons.Left || e.X < 6 || e.Y < 6 || e.Y > Height - 12) return;
        int index = firstStep + (e.X - 6) / 22;
        if (index >= Math.Min(StepCount, firstStep + VisibleStepCount)) return;
        bool wasOn = NoteEditMath.IsStepOn(notes, stepPitch, index * 240L);
        notes = NoteEditMath.ToggleStep(notes, stepPitch, index, totalTicks);
        if (!wasOn) NoteAudition?.Invoke(stepPitch);
        Invalidate(); NotesChanged?.Invoke(notes);
    }
    protected override void OnMouseDoubleClick(MouseEventArgs e)
    { base.OnMouseDoubleClick(e); if (mode == EditorMode.PianoRoll && e.Button == MouseButtons.Left) DetailedEditRequested?.Invoke(); }
    protected override void OnMouseWheel(MouseEventArgs e)
    {
        base.OnMouseWheel(e);
        if (mode != EditorMode.StepSequencer) return;
        firstStep -= e.Delta / 120 * 16; ClampFirstStep(); Invalidate();
    }
}
