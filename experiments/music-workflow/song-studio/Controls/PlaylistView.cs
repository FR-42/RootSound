using System.Drawing.Drawing2D;
using RootSound.PhraseStudio.Core;
using RootSound.SongStudio.Core;

namespace RootSound.SongStudio.Controls;

internal sealed class PlaylistView : Control
{
    internal const string PhraseDragFormat = "RootSound.SongStudio.Phrase";
    private readonly HScrollBar horizontal = new() { Dock = DockStyle.Bottom, SmallChange = 48 };
    private readonly VScrollBar vertical = new() { Dock = DockStyle.Right, SmallChange = 70 };
    private SongDocument song = SongRules.New();
    private double pixelsPerBeat = 48, cursor;
    private SongClip? dragging, ghost;
    private Point down;
    private double grabTick;
    private bool seeking;
    internal event Action<Guid, Guid, long>? PhraseDropped;
    internal event Action<Guid, Guid, long>? ClipMoved;
    internal event Action? SelectionChanged;
    internal event Action<double>? SeekRequested;
    internal event Action<Guid>? TrackDoubleClicked;
    internal event Action<double>? ZoomChanged;
    internal Guid? SelectedClip { get; private set; }
    internal Guid SelectedTrack { get; private set; }
    [System.ComponentModel.DesignerSerializationVisibility(System.ComponentModel.DesignerSerializationVisibility.Hidden)]
    internal long SnapTicks { get; set; } = Timing.TicksPerStep;
    internal int HeaderWidth => Math.Max(128, Font.Height * 7);
    internal int RowHeight => Math.Max(72, Font.Height * 4);
    internal int RulerHeight => Math.Max(36, Font.Height * 2);
    private Rectangle Viewport => new(0, 0, Math.Max(0, ClientSize.Width - vertical.Width), Math.Max(0, ClientSize.Height - horizontal.Height));
    internal PlaylistView()
    {
        SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.UserPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.Selectable, true);
        BackColor = Color.FromArgb(25, 29, 38); ForeColor = Color.FromArgb(224, 230, 240);
        AllowDrop = true; TabStop = true; Controls.Add(vertical); Controls.Add(horizontal);
        horizontal.ValueChanged += (_, _) => Invalidate(); vertical.ValueChanged += (_, _) => Invalidate();
        AccessibleName = "歌曲时间线";
    }
    internal void SetSong(SongDocument value)
    {
        song = value;
        if (!song.Clips.Any(c => c.Id == SelectedClip)) SelectedClip = null;
        if (!song.Tracks.Any(t => t.Id == SelectedTrack)) SelectedTrack = song.Tracks[0].Id;
        UpdateScroll(); Invalidate();
    }
    internal void SelectClip(Guid? id)
    {
        SelectedClip = id;
        if (song.Clips.FirstOrDefault(c => c.Id == id) is { } clip) SelectedTrack = clip.TrackId;
        SelectionChanged?.Invoke(); Invalidate();
    }
    internal void SetCursor(double tick, bool reveal = false)
    {
        cursor = tick;
        if (reveal && dragging is null && !seeking)
        {
            double x = X(tick); int width = Viewport.Width;
            if (x > width - 32 || x < HeaderWidth) SetScroll(horizontal, (int)(tick / Timing.Ppq * pixelsPerBeat - (width - HeaderWidth) * .2));
        }
        Invalidate();
    }
    internal void SetZoom(double value, int? anchorX = null)
    {
        int x = anchorX ?? HeaderWidth; double tick = TickAt(x);
        pixelsPerBeat = Math.Clamp(value, 12, 160); UpdateScroll();
        SetScroll(horizontal, (int)(tick / Timing.Ppq * pixelsPerBeat - x + HeaderWidth));
        ZoomChanged?.Invoke(pixelsPerBeat); Invalidate();
    }
    internal (Guid Track, long Tick) DropLocation(Point point, bool bypassSnap = false) =>
        (song.Tracks[Math.Clamp((point.Y - RulerHeight + vertical.Value) / RowHeight, 0, song.Tracks.Count - 1)].Id,
            SongRules.Snap(TickAt(point.X), bypassSnap ? 0 : SnapTicks));
    internal RectangleF ClipBounds(SongClip clip)
    {
        int track = song.Tracks.ToList().FindIndex(t => t.Id == clip.TrackId);
        return new((float)X(clip.StartTick), RulerHeight + track * RowHeight - vertical.Value + 4,
            Math.Max(3, (float)(SongRules.ClipTicks(song, clip) / Timing.Ppq * pixelsPerBeat)), RowHeight - 8);
    }
    private double X(double tick) => HeaderWidth + tick / Timing.Ppq * pixelsPerBeat - horizontal.Value;
    private double TickAt(int x) => Math.Clamp((x - HeaderWidth + horizontal.Value) / pixelsPerBeat * Timing.Ppq, 0, SongRules.MaximumTicks);
    protected override void OnResize(EventArgs e) { base.OnResize(e); UpdateScroll(); }
    protected override void OnFontChanged(EventArgs e) { base.OnFontChanged(e); if (horizontal is not null) UpdateScroll(); }
    private void UpdateScroll()
    {
        if (horizontal is null || vertical is null) return;
        double ticks = Math.Min(SongRules.MaximumTicks, Math.Max(64 * Timing.TicksPerBar,
            Math.Max(SongRules.EndTick(song), cursor) + 8 * Timing.TicksPerBar));
        Configure(horizontal, (int)Math.Ceiling(ticks / Timing.Ppq * pixelsPerBeat), Viewport.Width - HeaderWidth);
        Configure(vertical, song.Tracks.Count * RowHeight, Viewport.Height - RulerHeight);
    }
    private static void Configure(ScrollBar bar, int extent, int page)
    {
        bar.LargeChange = Math.Max(1, page); bar.Maximum = Math.Max(0, extent - 1);
        SetScroll(bar, bar.Value);
    }
    private static void SetScroll(ScrollBar bar, int value) => bar.Value = Math.Clamp(value, 0, Math.Max(0, bar.Maximum - bar.LargeChange + 1));
    protected override void OnPaint(PaintEventArgs e)
    {
        var g = e.Graphics; var view = Viewport; g.SetClip(view);
        using var grid = new Pen(Color.FromArgb(43, 49, 62));
        using var major = new Pen(Color.FromArgb(72, 82, 101));
        using var header = new SolidBrush(Color.FromArgb(35, 41, 53));
        using var selectedRow = new SolidBrush(Color.FromArgb(33, 39, 51));
        for (int i = 0; i < song.Tracks.Count; i++)
        {
            int y = RulerHeight + i * RowHeight - vertical.Value;
            if (y + RowHeight < RulerHeight || y > view.Bottom) continue;
            if (song.Tracks[i].Id == SelectedTrack) g.FillRectangle(selectedRow, HeaderWidth, y, view.Width - HeaderWidth, RowHeight);
            g.DrawLine(grid, HeaderWidth, y + RowHeight, view.Right, y + RowHeight);
        }
        g.SetClip(new Rectangle(HeaderWidth, 0, Math.Max(0, view.Width - HeaderWidth), view.Height));
        double firstBeat = Math.Floor(TickAt(HeaderWidth) / Timing.Ppq);
        int stride = pixelsPerBeat < 24 ? 4 : 1;
        for (long beat = (long)(firstBeat / stride) * stride; X(beat * Timing.Ppq) < view.Right; beat += stride)
        {
            float x = (float)X(beat * Timing.Ppq); bool bar = beat % 4 == 0;
            g.DrawLine(bar ? major : grid, x, 0, x, view.Bottom);
            if (bar) TextRenderer.DrawText(g, (beat / 4 + 1).ToString(), Font, new Point((int)x + 5, 8), ForeColor);
            if (pixelsPerBeat >= 80)
                for (int quarter = 1; quarter < 4; quarter++) g.DrawLine(grid, x + (float)pixelsPerBeat * quarter / 4, RulerHeight,
                    x + (float)pixelsPerBeat * quarter / 4, view.Bottom);
        }
        g.SetClip(new Rectangle(HeaderWidth, RulerHeight, Math.Max(0, view.Width - HeaderWidth), Math.Max(0, view.Height - RulerHeight)));
        foreach (var clip in song.Clips)
            if (dragging?.Id != clip.Id) DrawClip(g, clip, false);
        if (ghost is not null) DrawClip(g, ghost, true);
        g.SetClip(view); g.FillRectangle(header, 0, 0, HeaderWidth, view.Height);
        TextRenderer.DrawText(g, "轨道 / 小节", Font, new Rectangle(10, 6, HeaderWidth - 16, RulerHeight - 8), ForeColor);
        for (int i = 0; i < song.Tracks.Count; i++)
        {
            var track = song.Tracks[i]; int y = RulerHeight + i * RowHeight - vertical.Value;
            if (y < RulerHeight - RowHeight || y > view.Bottom) continue;
            g.SetClip(new Rectangle(0, RulerHeight, HeaderWidth, Math.Max(0, view.Height - RulerHeight)));
            TextRenderer.DrawText(g, track.Name, Font, new Rectangle(10, y + 8, HeaderWidth - 18, Font.Height + 3),
                track.Id == SelectedTrack ? Color.FromArgb(117, 207, 255) : ForeColor, TextFormatFlags.EndEllipsis | TextFormatFlags.SingleLine);
            TextRenderer.DrawText(g, track.Muted ? "已静音" : $"{track.GainDb:+0.#;-0.#;0} dB", Font,
                new Rectangle(10, y + Font.Height + 14, HeaderWidth - 18, Font.Height + 2), Color.FromArgb(153, 166, 187));
        }
        g.SetClip(new Rectangle(HeaderWidth, 0, Math.Max(0, view.Width - HeaderWidth), view.Height));
        using var red = new Pen(Color.FromArgb(255, 99, 109), 2);
        float cursorX = (float)X(cursor); g.DrawLine(red, cursorX, 0, cursorX, view.Bottom);
        using var redBrush = new SolidBrush(red.Color); g.FillPolygon(redBrush, new PointF[] { new(cursorX - 5, 0), new(cursorX + 5, 0), new(cursorX, 9) });
        g.ResetClip(); base.OnPaint(e);
    }
    private void DrawClip(Graphics g, SongClip clip, bool preview)
    {
        var bounds = ClipBounds(clip); if (bounds.Right < HeaderWidth || bounds.Left > Viewport.Right || bounds.Bottom < RulerHeight || bounds.Top > Viewport.Bottom) return;
        var phrase = song.Phrases.First(p => p.Id == clip.PhraseId);
        int index = song.Phrases.ToList().FindIndex(p => p.Id == clip.PhraseId);
        Color[] colors = [Color.FromArgb(60, 139, 160), Color.FromArgb(122, 102, 172), Color.FromArgb(167, 121, 69), Color.FromArgb(73, 146, 114), Color.FromArgb(166, 87, 119)];
        var color = colors[index % colors.Length]; if (song.Tracks.First(t => t.Id == clip.TrackId).Muted) color = Color.FromArgb(75, 80, 90);
        using var fill = new SolidBrush(Color.FromArgb(preview ? 140 : 230, color)); g.FillRectangle(fill, bounds);
        using var border = new Pen(clip.Id == SelectedClip ? Color.FromArgb(255, 217, 129) : Color.FromArgb(140, 190, 210), clip.Id == SelectedClip ? 2 : 1);
        g.DrawRectangle(border, bounds.X, bounds.Y, bounds.Width, bounds.Height);
        TextRenderer.DrawText(g, phrase.Name, Font, Rectangle.Round(new(bounds.X + 5, bounds.Y + 3, Math.Max(0, bounds.Width - 10), Font.Height + 2)),
            Color.White, TextFormatFlags.EndEllipsis | TextFormatFlags.SingleLine | TextFormatFlags.NoPadding);
        var notes = phrase.Phrase.Channels.Where(c => !c.Muted).SelectMany(c => c.Notes).Take(300).ToArray();
        if (notes.Length == 0) return;
        int min = notes.Min(n => n.Pitch), max = Math.Max(min + 12, notes.Max(n => n.Pitch));
        using var ink = new Pen(Color.FromArgb(160, 230, 245, 255), 2);
        g.SmoothingMode = SmoothingMode.None;
        foreach (var note in notes)
        {
            float x = bounds.X + (float)(note.StartTick / (double)Timing.DurationTicks(phrase.Phrase) * bounds.Width);
            float width = Math.Max(2, (float)(note.LengthTick / (double)Timing.DurationTicks(phrase.Phrase) * bounds.Width));
            float y = bounds.Bottom - 7 - (note.Pitch - min) / (float)(max - min) * Math.Max(5, bounds.Height - Font.Height - 18);
            g.DrawLine(ink, x + 1, y, Math.Min(bounds.Right - 1, x + width), y);
        }
    }
    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e); if (e.Button != MouseButtons.Left || !Viewport.Contains(e.Location)) return;
        Focus(); down = e.Location;
        if (e.X < HeaderWidth && e.Y >= RulerHeight)
        { SelectedTrack = DropLocation(e.Location).Track; SelectedClip = null; SelectionChanged?.Invoke(); Invalidate(); return; }
        if (e.X < HeaderWidth) return;
        if (e.Y < RulerHeight) { seeking = true; Capture = true; RequestSeek(e.X); return; }
        dragging = song.Clips.Reverse().FirstOrDefault(c => ClipBounds(c).Contains(e.Location));
        SelectClip(dragging?.Id);
        if (dragging is not null) { grabTick = TickAt(e.X) - dragging.StartTick; Capture = true; }
        else { SelectedTrack = DropLocation(e.Location).Track; RequestSeek(e.X); SelectionChanged?.Invoke(); }
    }
    protected override void OnMouseMove(MouseEventArgs e)
    {
        base.OnMouseMove(e);
        if (seeking) { RequestSeek(e.X); return; }
        if (dragging is null || Math.Abs(e.X - down.X) + Math.Abs(e.Y - down.Y) < 4) return;
        if (e.X > Viewport.Right - 24) SetScroll(horizontal, horizontal.Value + 24);
        else if (e.X < HeaderWidth + 24) SetScroll(horizontal, horizontal.Value - 24);
        var target = DropLocation(e.Location);
        ghost = dragging with { TrackId = target.Track, StartTick = SongRules.Snap(TickAt(e.X) - grabTick,
            (ModifierKeys & Keys.Shift) != 0 ? 0 : SnapTicks) };
        Invalidate();
    }
    protected override void OnMouseUp(MouseEventArgs e)
    {
        var moved = ghost; dragging = ghost = null; seeking = false; Capture = false; Invalidate();
        if (moved is not null) ClipMoved?.Invoke(moved.Id, moved.TrackId, moved.StartTick);
        base.OnMouseUp(e);
    }
    protected override void OnMouseCaptureChanged(EventArgs e)
    { if (!Capture) { dragging = ghost = null; seeking = false; Invalidate(); } base.OnMouseCaptureChanged(e); }
    protected override void OnMouseDoubleClick(MouseEventArgs e)
    { base.OnMouseDoubleClick(e); if (e.X < HeaderWidth && e.Y >= RulerHeight) TrackDoubleClicked?.Invoke(DropLocation(e.Location).Track); }
    private void RequestSeek(int x) => SeekRequested?.Invoke(SongRules.Snap(TickAt(x), (ModifierKeys & Keys.Shift) != 0 ? 0 : SnapTicks));
    protected override void OnMouseWheel(MouseEventArgs e)
    {
        if ((ModifierKeys & Keys.Control) != 0) SetZoom(pixelsPerBeat * (e.Delta > 0 ? 1.2 : 1 / 1.2), e.X);
        else if ((ModifierKeys & Keys.Shift) != 0) SetScroll(horizontal, horizontal.Value - e.Delta);
        else SetScroll(vertical, vertical.Value - e.Delta);
        base.OnMouseWheel(e);
    }
    protected override void OnDragEnter(DragEventArgs e) { base.OnDragEnter(e); e.Effect = e.Data?.GetDataPresent(PhraseDragFormat) == true ? DragDropEffects.Copy : DragDropEffects.None; }
    protected override void OnDragOver(DragEventArgs e)
    {
        OnDragEnter(e); var point = PointToClient(new(e.X, e.Y));
        if (point.X > Viewport.Right - 24) SetScroll(horizontal, horizontal.Value + 24);
        else if (point.X < HeaderWidth + 24) SetScroll(horizontal, horizontal.Value - 24);
    }
    protected override void OnDragDrop(DragEventArgs e)
    {
        base.OnDragDrop(e); if (e.Data?.GetData(PhraseDragFormat) is not string text || !Guid.TryParse(text, out var id) || !song.Phrases.Any(p => p.Id == id)) return;
        var point = PointToClient(new(e.X, e.Y)); if (point.X < HeaderWidth || point.Y < RulerHeight) return;
        var target = DropLocation(point, (e.KeyState & 4) != 0); PhraseDropped?.Invoke(id, target.Track, target.Tick);
    }
}
