using RootSound.PhraseStudio.Core;

namespace RootSound.ReferenceStudio.Controls;

/// <summary>Editable per-note strength, aligned with the piano canvas time range.</summary>
internal sealed class VelocityLane : Control
{
    private IReadOnlyList<PhraseNote> notes = [];
    private IReadOnlyList<PhraseNote>? before;
    private double viewStart, visibleTicks = 3840;
    private Guid? dragging;
    private int gridLeft = 72, gridWidth = 800;
    internal event Action<IReadOnlyList<PhraseNote>>? PreviewChanged;
    internal event Action<IReadOnlyList<PhraseNote>>? NotesChanged;
    internal event Action? PreviewCancelled;
    internal VelocityLane()
    {
        Height = 86; DoubleBuffered = true; ResizeRedraw = true; BackColor = ReferenceTheme.Panel;
        ForeColor = ReferenceTheme.Muted; Cursor = Cursors.SizeNS; AccessibleName = "音符力度；拖动竖条调整已有音符的力度";
    }
    internal void SetNotes(IReadOnlyList<PhraseNote> value) { notes = value.ToArray(); Invalidate(); }
    internal void SetView(double start, double count, Rectangle grid)
    { viewStart = start; visibleTicks = Math.Max(1, count); gridLeft = grid.Left; gridWidth = Math.Max(1, grid.Width); Invalidate(); }
    internal RectangleF BarBounds(PhraseNote note)
    {
        float x = gridLeft + (float)((note.StartTick - viewStart) / visibleTicks * gridWidth);
        float height = (float)note.Velocity * 58;
        return new RectangleF(x - 3, Height - 9 - height, 6, height);
    }
    protected override void OnPaint(PaintEventArgs e) { base.OnPaint(e); RenderCanvas(e.Graphics); }
    internal void RenderCanvas(Graphics graphics)
    {
        graphics.Clear(BackColor); using var brush = new SolidBrush(Color.FromArgb(85, 155, 171));
        using var label = new SolidBrush(ForeColor); graphics.DrawString("力度", Font, label, 17, 10);
        graphics.DrawString("拖动", Font, label, 17, 34);
        var state = graphics.Save(); graphics.SetClip(new Rectangle(gridLeft, 3, gridWidth, Height - 4));
        foreach (var note in notes) if (note.StartTick >= viewStart && note.StartTick <= viewStart + visibleTicks) graphics.FillRectangle(brush, BarBounds(note));
        graphics.Restore(state);
    }
    private PhraseNote? Hit(Point point) => notes.Where(n => n.StartTick >= viewStart && n.StartTick <= viewStart + visibleTicks)
        .Select(n => (Note: n, Bounds: BarBounds(n))).Where(v => Math.Abs(point.X - (v.Bounds.Left + 3)) <= 8)
        .OrderBy(v => Math.Abs(point.Y - v.Bounds.Top)).Select(v => v.Note).FirstOrDefault();
    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e); if (e.Button != MouseButtons.Left || Hit(e.Location) is not { } note) return;
        before = notes; dragging = note.Id; Capture = true; ChangeAt(e.Y);
    }
    protected override void OnMouseMove(MouseEventArgs e) { base.OnMouseMove(e); if (dragging is not null) ChangeAt(e.Y); }
    private void ChangeAt(int y)
    {
        double value = Math.Clamp((Height - 9 - y) / 58d, .01, 1);
        notes = notes.Select(n => n.Id == dragging ? n with { Velocity = value } : n).ToArray(); Invalidate(); PreviewChanged?.Invoke(notes);
    }
    protected override void OnMouseUp(MouseEventArgs e)
    {
        base.OnMouseUp(e); if (e.Button != MouseButtons.Left || dragging is null) return;
        dragging = null; before = null; Capture = false; NotesChanged?.Invoke(notes);
    }
    protected override void OnMouseCaptureChanged(EventArgs e)
    {
        base.OnMouseCaptureChanged(e); if (Capture || dragging is null) return;
        dragging = null; if (before is not null) notes = before; before = null; Invalidate(); PreviewCancelled?.Invoke();
    }
}
