using System.ComponentModel;
using System.Drawing.Drawing2D;
using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Editing;

namespace RootSound.PhraseStudio.Controls;

internal sealed class PianoRollEditor : Control
{
    private readonly VScrollBar vertical = new() { Dock = DockStyle.Right, SmallChange = 1 };
    private readonly HScrollBar horizontal = new() { Dock = DockStyle.Bottom, SmallChange = 240 };
    private IReadOnlyList<PhraseNote> notes = [];
    private long totalTicks = 3840, snapTicks = 240;
    private double viewStart, visibleTicks = 15360, topRow = 48;
    private double playheadTick = -1;
    private bool synchronizing, initialized, emptyClick, panning;
    private Point lastPointer, downPointer;
    private NoteDrag? drag;
    private Guid? activeNote;
    private const int KeyboardWidth = 72, RulerHeight = 27, RowHeight = 21;
    internal event Action<IReadOnlyList<PhraseNote>>? NotesChanged;
    internal event Action<int>? NoteAudition;
    internal event Action? ViewChanged;
    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    internal long SnapTicks { get => snapTicks; set => snapTicks = Math.Clamp(value, 1, 3840); }
    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    internal double DefaultVelocity { get; set; } = .8;
    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    internal double PlayheadTick { get => playheadTick; set { playheadTick = value; Invalidate(); } }
    internal double ViewStartTick => viewStart;
    internal double VisibleTicks => visibleTicks;
    internal IReadOnlyList<PhraseNote> Notes => notes;
    internal Rectangle GridBounds => new(KeyboardWidth, RulerHeight,
        Math.Max(1, Width - KeyboardWidth - vertical.Width), Math.Max(1, Height - RulerHeight - horizontal.Height));

    internal PianoRollEditor()
    {
        DoubleBuffered = true; ResizeRedraw = true; TabStop = true;
        BackColor = Color.FromArgb(19, 23, 29); ForeColor = Color.FromArgb(203, 211, 224);
        SetStyle(ControlStyles.Selectable, true);
        Controls.Add(vertical); Controls.Add(horizontal);
        vertical.ValueChanged += (_, _) => { if (!synchronizing) { topRow = vertical.Value; Invalidate(); ViewChanged?.Invoke(); } };
        horizontal.ValueChanged += (_, _) => { if (!synchronizing) { viewStart = horizontal.Value; Invalidate(); ViewChanged?.Invoke(); } };
        AccessibleName = "钢琴卷帘；点击添加或删除，拖动移动，右边缘调整长度，滚轮滚动音阶，Ctrl 或 Shift 加滚轮缩放时间";
        UpdateScrollbars();
    }
    internal void SetNotes(IReadOnlyList<PhraseNote> value, long durationTicks, int stepPitch = 60)
    {
        notes = value.ToArray(); totalTicks = Math.Max(1, durationTicks);
        if (!initialized) { visibleTicks = Math.Min(15360, totalTicks); initialized = true; ScrollToPitch(stepPitch); }
        visibleTicks = Math.Clamp(visibleTicks, Math.Min(120, totalTicks), totalTicks);
        viewStart = Math.Clamp(viewStart, 0, Math.Max(0, totalTicks - visibleTicks));
        UpdateScrollbars(); Invalidate();
    }
    internal void ScrollToPitch(int pitch)
    {
        topRow = Math.Clamp(127 - pitch - GridBounds.Height / (double)RowHeight / 2, 0, Math.Max(0, 128 - GridBounds.Height / (double)RowHeight));
        UpdateScrollbars(); Invalidate();
    }
    internal void FitTime()
    { viewStart = 0; visibleTicks = totalTicks; UpdateScrollbars(); Invalidate(); ViewChanged?.Invoke(); }
    internal void ZoomTime(double factor, double anchor = .5)
    {
        anchor = Math.Clamp(anchor, 0, 1);
        double at = viewStart + anchor * visibleTicks;
        visibleTicks = Math.Clamp(visibleTicks / factor, Math.Min(120, totalTicks), totalTicks);
        viewStart = Math.Clamp(at - anchor * visibleTicks, 0, totalTicks - visibleTicks);
        UpdateScrollbars(); Invalidate(); ViewChanged?.Invoke();
    }
    internal void FollowPlayhead()
    {
        if (playheadTick < 0 || playheadTick >= viewStart && playheadTick <= viewStart + visibleTicks) return;
        viewStart = Math.Clamp(playheadTick - visibleTicks * .15, 0, totalTicks - visibleTicks);
        UpdateScrollbars(); Invalidate(); ViewChanged?.Invoke();
    }
    protected override void OnResize(EventArgs e) { base.OnResize(e); UpdateScrollbars(); }
    private void UpdateScrollbars()
    {
        synchronizing = true;
        try
        {
            int rows = Math.Clamp(GridBounds.Height / RowHeight, 1, 128);
            topRow = Math.Clamp(topRow, 0, Math.Max(0, 128 - rows));
            vertical.Minimum = 0; vertical.Maximum = 127; vertical.LargeChange = rows;
            vertical.Value = Math.Clamp((int)topRow, 0, 128 - rows);
            int large = Math.Max(1, (int)Math.Ceiling(visibleTicks));
            horizontal.Minimum = 0; horizontal.Maximum = (int)Math.Min(int.MaxValue - 1, totalTicks - 1);
            horizontal.LargeChange = Math.Min(large, horizontal.Maximum + 1);
            horizontal.Value = Math.Clamp((int)viewStart, 0, Math.Max(0, horizontal.Maximum - horizontal.LargeChange + 1));
            horizontal.Enabled = visibleTicks < totalTicks;
        }
        finally { synchronizing = false; }
    }
    private float X(double tick) => GridBounds.Left + (float)((tick - viewStart) / visibleTicks * GridBounds.Width);
    private float Y(double pitch) => GridBounds.Top + (float)((127 - pitch - topRow) * RowHeight);
    private double TickAt(int x) => viewStart + (x - GridBounds.Left) / (double)GridBounds.Width * visibleTicks;
    private int PitchAt(int y) => Math.Clamp(127 - (int)Math.Floor(topRow + (y - GridBounds.Top) / (double)RowHeight), 0, 127);
    internal RectangleF BoundsFor(PhraseNote note) => new(X(note.StartTick), Y(note.Pitch) + 2, Math.Max(5, X(note.StartTick + note.LengthTick) - X(note.StartTick)), RowHeight - 3);
    internal PhraseNote? HitNote(Point point) => notes.LastOrDefault(note => BoundsFor(note).Contains(point));
    protected override void OnPaint(PaintEventArgs e) { base.OnPaint(e); RenderCanvas(e.Graphics, ClientRectangle); }
    internal void RenderCanvas(Graphics graphics, Rectangle bounds)
    {
        graphics.Clear(BackColor);
        var area = GridBounds;
        using var black = new SolidBrush(Color.FromArgb(23, 28, 35));
        using var white = new SolidBrush(Color.FromArgb(29, 35, 43));
        using var darkKey = new SolidBrush(Color.FromArgb(33, 39, 48));
        using var lightKey = new SolidBrush(Color.FromArgb(197, 205, 216));
        using var gridPen = new Pen(Color.FromArgb(44, 52, 64));
        using var octavePen = new Pen(Color.FromArgb(78, 91, 109));
        int first = Math.Max(0, (int)Math.Floor(topRow));
        int last = Math.Min(127, (int)Math.Ceiling(topRow + area.Height / (double)RowHeight));
        for (int row = first; row <= last; row++)
        {
            int pitch = 127 - row; float y = Y(pitch);
            var rect = new RectangleF(area.Left, y, area.Width, RowHeight);
            graphics.FillRectangle(NoteEditMath.IsBlackKey(pitch) ? black : white, rect);
            graphics.FillRectangle(NoteEditMath.IsBlackKey(pitch) ? darkKey : lightKey, 0, y, KeyboardWidth - 2, RowHeight - 1);
            graphics.DrawLine(pitch % 12 == 0 ? octavePen : gridPen, area.Left, y + RowHeight, area.Right, y + RowHeight);
            using var textBrush = new SolidBrush(NoteEditMath.IsBlackKey(pitch) ? ForeColor : Color.FromArgb(34, 41, 52));
            graphics.DrawString(NoteEditMath.PitchName(pitch), Font, textBrush, 13, y + 2);
        }
        graphics.FillRectangle(black, 0, 0, Width, RulerHeight);
        long fine = visibleTicks / area.Width * 8 > snapTicks ? 960 : snapTicks;
        using var rulerText = new SolidBrush(ForeColor);
        for (long tick = (long)Math.Floor(viewStart / fine) * fine; tick <= viewStart + visibleTicks; tick += fine)
        {
            float x = X(tick); bool bar = tick % 3840 == 0, beat = tick % 960 == 0;
            graphics.DrawLine(bar ? octavePen : gridPen, x, RulerHeight, x, area.Bottom);
            if (bar || beat && visibleTicks <= 15360)
                graphics.DrawString(bar ? (tick / 3840 + 1).ToString() : $"{tick / 3840 + 1}.{tick % 3840 / 960 + 1}", Font, rulerText, x + 3, 5);
        }
        var state = graphics.Save(); graphics.SetClip(area);
        using var noteBrush = new SolidBrush(Color.FromArgb(85, 185, 200));
        using var movingBrush = new SolidBrush(Color.FromArgb(150, 230, 224));
        using var labelBrush = new SolidBrush(Color.FromArgb(14, 37, 46));
        foreach (var note in notes)
        {
            if (note.StartTick + note.LengthTick < viewStart || note.StartTick > viewStart + visibleTicks) continue;
            bool moving = drag?.Original.Id == note.Id;
            RectangleF rect = moving ? new(X(drag!.Tick), Y(drag.Pitch) + 2, Math.Max(5, X(drag.Tick + drag.Length) - X(drag.Tick)), RowHeight - 3) : BoundsFor(note);
            if (rect.Bottom < area.Top || rect.Top > area.Bottom) continue;
            graphics.FillRectangle(moving ? movingBrush : noteBrush, rect);
            graphics.DrawRectangle(Pens.DarkSlateGray, rect.X, rect.Y, rect.Width, rect.Height);
            if (rect.Width > 37) graphics.DrawString(NoteEditMath.PitchName(note.Pitch), Font, labelBrush, rect.X + 4, rect.Y + 1);
            if (rect.Width > 12) graphics.DrawLine(Pens.DarkSlateGray, rect.Right - 4, rect.Top + 4, rect.Right - 4, rect.Bottom - 4);
        }
        if (playheadTick >= viewStart && playheadTick <= viewStart + visibleTicks)
        {
            using var cursor = new Pen(Color.FromArgb(255, 97, 104), 2);
            graphics.DrawLine(cursor, X(playheadTick), area.Top, X(playheadTick), area.Bottom);
        }
        graphics.Restore(state);
    }
    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e); Focus(); var area = GridBounds;
        if (e.Y >= area.Top && e.Y < area.Bottom && e.X < area.Left && e.Button == MouseButtons.Left)
        { NoteAudition?.Invoke(PitchAt(e.Y)); return; }
        if (!area.Contains(e.Location)) return;
        if (e.Button == MouseButtons.Middle) { panning = true; lastPointer = e.Location; Capture = true; return; }
        var hit = HitNote(e.Location);
        if (e.Button == MouseButtons.Right) { if (hit is not null) Publish(NoteEditMath.Remove(notes, hit.Id)); return; }
        if (e.Button != MouseButtons.Left) return;
        downPointer = lastPointer = e.Location; Capture = true;
        if (hit is not null)
        {
            activeNote = hit.Id;
            RectangleF rect = BoundsFor(hit);
            drag = new NoteDrag(hit, rect.Width > 12 && e.X >= rect.Right - 6);
            NoteAudition?.Invoke(hit.Pitch);
        }
        else { emptyClick = true; activeNote = null; NoteAudition?.Invoke(PitchAt(e.Y)); }
        Invalidate();
    }
    protected override void OnMouseMove(MouseEventArgs e)
    {
        base.OnMouseMove(e);
        int dx = e.X - lastPointer.X, dy = e.Y - lastPointer.Y;
        if (panning)
        {
            viewStart = Math.Clamp(viewStart - dx / (double)GridBounds.Width * visibleTicks, 0, totalTicks - visibleTicks);
            topRow = Math.Clamp(topRow - dy / (double)RowHeight, 0, Math.Max(0, 128 - GridBounds.Height / (double)RowHeight));
            UpdateScrollbars(); ViewChanged?.Invoke(); Invalidate();
        }
        else if (drag is not null)
        {
            drag.Advance(dx, dy, visibleTicks / GridBounds.Width, RowHeight, (ModifierKeys & Keys.Shift) != 0, totalTicks);
            Invalidate();
        }
        else
        {
            var hit = HitNote(e.Location);
            Cursor = hit is null ? Cursors.Cross : BoundsFor(hit).Width > 12 && e.X >= BoundsFor(hit).Right - 6 ? Cursors.SizeWE : Cursors.SizeAll;
        }
        lastPointer = e.Location;
    }
    protected override void OnMouseUp(MouseEventArgs e)
    {
        base.OnMouseUp(e);
        var gesture = drag; drag = null; bool adding = emptyClick; emptyClick = false;
        panning = false; Capture = false;
        if (e.Button != MouseButtons.Left) return;
        if (gesture is not null)
        {
            if (gesture.Moved) Publish(NoteEditMath.Replace(notes, gesture.Commit(totalTicks, snapTicks, (ModifierKeys & Keys.Shift) != 0)));
            else if (!gesture.Resizing) { activeNote = null; Publish(NoteEditMath.Remove(notes, gesture.Original.Id)); }
        }
        else if (adding && Math.Abs(e.X - downPointer.X) + Math.Abs(e.Y - downPointer.Y) < 8)
        {
            var added = NoteEditMath.Add(notes, PitchAt(downPointer.Y), TickAt(downPointer.X), totalTicks, snapTicks);
            var newId = added.First(value => !notes.Any(existing => existing.Id == value.Id)).Id;
            added = added.Select(note => note.Id == newId ? note with { Velocity = Math.Clamp(DefaultVelocity, .01, 1) } : note).ToArray();
            activeNote = newId; Publish(added);
        }
        Invalidate();
    }
    protected override void OnMouseCaptureChanged(EventArgs e)
    { base.OnMouseCaptureChanged(e); if (!Capture) { drag = null; panning = false; emptyClick = false; Invalidate(); } }
    protected override void OnMouseWheel(MouseEventArgs e)
    {
        base.OnMouseWheel(e);
        if ((ModifierKeys & (Keys.Shift | Keys.Control)) != 0) ZoomTime(Math.Pow(1.25, e.Delta / 120d), (e.X - GridBounds.Left) / (double)GridBounds.Width);
        else { topRow = Math.Clamp(topRow - e.Delta / 120d * 3, 0, Math.Max(0, 128 - GridBounds.Height / (double)RowHeight)); UpdateScrollbars(); Invalidate(); ViewChanged?.Invoke(); }
    }
    protected override bool IsInputKey(Keys keyData) => (keyData & Keys.KeyCode) is Keys.Left or Keys.Right or Keys.Up or Keys.Down or Keys.Delete || base.IsInputKey(keyData);
    protected override void OnKeyDown(KeyEventArgs e)
    {
        base.OnKeyDown(e);
        if (e.KeyCode == Keys.Delete && activeNote is Guid id) { Publish(NoteEditMath.Remove(notes, id)); activeNote = null; e.Handled = true; }
        else if (activeNote is Guid noteId && notes.FirstOrDefault(note => note.Id == noteId) is { } selected)
        {
            long ticks = e.Shift ? 1 : snapTicks;
            PhraseNote? updated = e.KeyCode switch
            {
                Keys.Left => NoteEditMath.Move(selected, selected.StartTick - ticks, selected.Pitch, totalTicks, 1),
                Keys.Right => NoteEditMath.Move(selected, selected.StartTick + ticks, selected.Pitch, totalTicks, 1),
                Keys.Up => selected with { Pitch = Math.Min(127, selected.Pitch + 1) },
                Keys.Down => selected with { Pitch = Math.Max(0, selected.Pitch - 1) }, _ => null
            };
            if (updated is not null) { Publish(NoteEditMath.Replace(notes, updated)); NoteAudition?.Invoke(updated.Pitch); e.Handled = true; }
        }
    }
    private void Publish(IReadOnlyList<PhraseNote> updated)
    { notes = updated; Invalidate(); NotesChanged?.Invoke(updated); }
}
