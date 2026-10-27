using System.ComponentModel;
using System.Drawing.Drawing2D;
using RootSound.SampleEditor.Core;
using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Controls;

public sealed class SampleGraph : Control
{
    private PcmClip? _original, _processed;
    private float[] _originalPeaks = [], _processedPeaks = [];
    private TimelineMarker? _drag;
    private TimelineMarker _active = TimelineMarker.Playhead;
    private bool _panning;
    private int _panX;
    internal static readonly Color Blue = Color.FromArgb(92, 172, 255), Red = Color.FromArgb(247, 94, 106);
    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    public Timeline Timeline { get; } = new();
    public event Action? SelectionChanged, SeekStarted, SeekRequested, SeekEnded, ViewChanged;
    internal Rectangle PlotBounds => new(16, 34, Math.Max(1, Width - 32), Math.Max(1, Height - 62));

    public SampleGraph()
    {
        DoubleBuffered = true;
        BackColor = Color.FromArgb(22, 29, 35);
        ForeColor = Color.FromArgb(211, 223, 231);
        MinimumSize = new Size(180, 150);
        TabStop = true;
        SetStyle(ControlStyles.ResizeRedraw, true);
    }

    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    public double PlayheadSeconds
    {
        get => Timeline.HasAudio ? Timeline.Playhead / Timeline.SampleRate : 0;
        set { Timeline.Move(TimelineMarker.Playhead, Math.Max(0, value) * Timeline.SampleRate); Invalidate(); }
    }

    public void SetAudio(PcmClip? original, PcmClip? processed)
    {
        bool reset = !ReferenceEquals(_original, original);
        _original = original; _processed = processed;
        if ((processed ?? original) is { } audio && (reset || !Timeline.HasAudio))
            Timeline.Load(audio.FrameCount, audio.SampleRate);
        RebuildPeaks(); Invalidate();
    }

    public void SetSelection(long start, long end)
    {
        // Expand the far endpoint first to avoid clamping against the old selection.
        Timeline.Move(TimelineMarker.SelectionStart, 0);
        Timeline.Move(TimelineMarker.SelectionEnd, end);
        Timeline.Move(TimelineMarker.SelectionStart, start);
        Invalidate();
    }

    public void Zoom(double factor, double anchor = .5)
    {
        if (!Timeline.HasAudio || !double.IsFinite(factor) || factor <= 0) return;
        double current = Timeline.FrameCount / Timeline.ViewLength;
        Timeline.Zoom(Math.Clamp(current * factor, 1, 10000) / current, anchor); ChangedView();
    }
    public void Fit() { Timeline.Fit(); ChangedView(); }
    public void Pan(double fraction) { Timeline.Pan(fraction); ChangedView(); }
    public void RevealPlayhead()
    {
        double previous = Timeline.ViewStart;
        Timeline.Reveal(Timeline.Playhead);
        if (previous != Timeline.ViewStart) ChangedView();
        else Invalidate();
    }
    private void ChangedView() { RebuildPeaks(); ViewChanged?.Invoke(); Invalidate(); }
    protected override void OnResize(EventArgs e) { base.OnResize(e); RebuildPeaks(); }
    private void RebuildPeaks()
    {
        _originalPeaks = Peaks(_original);
        _processedPeaks = Peaks(_processed);
    }
    private float[] Peaks(PcmClip? audio)
    {
        if (audio is null || !Timeline.HasAudio) return [];
        int width = PlotBounds.Width;
        float[] values = new float[width];
        for (int x = 0; x < width; x++)
        {
            long start = (long)Timeline.FrameAt(x / (double)width);
            long end = Math.Min(audio.FrameCount, Math.Max(start + 1, (long)Math.Ceiling(Timeline.FrameAt((x + 1d) / width))));
            for (long f = start; f < end; f++)
                for (int c = 0; c < audio.Channels; c++)
                    values[x] = Math.Max(values[x], Math.Abs(audio.Samples[checked((int)(f * audio.Channels + c))]));
        }
        return values;
    }

    protected override void OnPaint(PaintEventArgs e) { base.OnPaint(e); DrawGraph(e.Graphics); }
    internal float X(double frame) => PlotBounds.Left + (float)(Timeline.FractionAt(frame) * PlotBounds.Width);
    internal void DrawGraph(Graphics g)
    {
        g.Clear(BackColor); g.SmoothingMode = SmoothingMode.AntiAlias;
        var area = PlotBounds;
        if (_original is null && _processed is null)
        {
            TextRenderer.DrawText(g, "导入一段采样", Font, area, ForeColor, TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
            return;
        }
        using var axis = new Pen(Color.FromArgb(51, 65, 77));
        g.DrawLine(axis, area.Left, area.Top + area.Height / 2, area.Right, area.Top + area.Height / 2);
        void Wave(float[] peaks, Color color)
        {
            using var pen = new Pen(color);
            for (int x = 0; x < peaks.Length; x++)
            {
                float center = area.Top + area.Height / 2f, peak = Math.Min(1.2f, peaks[x]) * area.Height * .43f;
                g.DrawLine(pen, area.Left + x, center - peak, area.Left + x, center + peak);
            }
        }
        Wave(_originalPeaks, Color.FromArgb(100, 111, 123));
        Wave(_processedPeaks, Color.FromArgb(103, 218, 178));
        var saved = g.Save();
        g.SetClip(area);
        using var shade = new SolidBrush(Color.FromArgb(145, 9, 16, 24));
        float a = Math.Clamp(X(Timeline.SelectionStart), area.Left, area.Right), b = Math.Clamp(X(Timeline.SelectionEnd), area.Left, area.Right);
        g.FillRectangle(shade, area.Left, area.Top, a - area.Left, area.Height);
        g.FillRectangle(shade, b, area.Top, area.Right - b, area.Height);
        g.Restore(saved);
        DrawMarker(g, TimelineMarker.SelectionStart, Blue);
        DrawMarker(g, TimelineMarker.SelectionEnd, Blue);
        DrawMarker(g, TimelineMarker.Playhead, Red);
        using var labels = new SolidBrush(ForeColor);
        g.DrawString(_processed is null ? "原声" : "灰：原声    绿：处理后", Font, labels, 15, 9);
        g.DrawString($"{Timeline.ViewStart / Timeline.SampleRate:0.000} s", Font, labels, area.Left, Height - 24);
        string end = $"{Timeline.ViewEnd / Timeline.SampleRate:0.000} s";
        g.DrawString(end, Font, labels, area.Right - g.MeasureString(end, Font).Width, Height - 24);
    }
    private void DrawMarker(Graphics g, TimelineMarker marker, Color color)
    {
        var area = PlotBounds; float x = X(Timeline.Position(marker));
        if (x < area.Left - .5 || x > area.Right + .5) return;
        using var pen = new Pen(color, 2);
        using var brush = new SolidBrush(color);
        g.DrawLine(pen, x, area.Top - 5, x, area.Bottom + 5);
        PointF[] handle = marker switch
        {
            TimelineMarker.Playhead => [new(x - 7, area.Top - 14), new(x + 7, area.Top - 14), new(x, area.Top - 4)],
            TimelineMarker.SelectionStart => [new(x - 9, area.Bottom + 10), new(x, area.Bottom - 2), new(x, area.Bottom + 10)],
            _ => [new(x + 9, area.Bottom + 10), new(x, area.Bottom - 2), new(x, area.Bottom + 10)]
        };
        g.FillPolygon(brush, handle);
    }
    internal TimelineMarker? HitMarker(Point point)
    {
        if (!Timeline.HasAudio) return null;
        var area = PlotBounds;
        var hits = Enum.GetValues<TimelineMarker>().Where(m => X(Timeline.Position(m)) >= area.Left - 1 && X(Timeline.Position(m)) <= area.Right + 1
            && Math.Abs(X(Timeline.Position(m)) - point.X) <= 12 * DeviceDpi / 96f).ToArray();
        if (point.Y < area.Top + 8 && hits.Contains(TimelineMarker.Playhead)) return TimelineMarker.Playhead;
        if (point.Y > area.Bottom - 14)
        {
            var blues = hits.Where(m => m != TimelineMarker.Playhead).ToArray();
            if (blues.Length == 2 && Math.Abs(X(Timeline.SelectionStart) - X(Timeline.SelectionEnd)) < .5)
                return point.X >= X(Timeline.SelectionEnd) ? TimelineMarker.SelectionEnd : TimelineMarker.SelectionStart;
            if (blues.Length > 0) return blues.OrderBy(m => Math.Abs(X(Timeline.Position(m)) - point.X)).First();
        }
        return hits.OrderBy(m => Math.Abs(X(Timeline.Position(m)) - point.X)).Select(m => (TimelineMarker?)m).FirstOrDefault();
    }
    internal void BeginGesture(Point point)
    {
        _active = HitMarker(point) ?? TimelineMarker.Playhead; _drag = _active;
        if (_active == TimelineMarker.Playhead)
        {
            SeekStarted?.Invoke();
            if (HitMarker(point) is null) Timeline.Move(_active, Timeline.FrameAt((point.X - PlotBounds.Left) / (double)PlotBounds.Width));
            SeekRequested?.Invoke();
        }
        Timeline.BeginDrag(_active, point.X); Invalidate();
    }
    internal void MoveGesture(int x, bool precise)
    {
        if (_drag is not { } marker) return;
        Timeline.Drag(x, PlotBounds.Width, precise);
        if (marker == TimelineMarker.Playhead) SeekRequested?.Invoke(); else SelectionChanged?.Invoke();
        Invalidate();
    }
    internal void EndGesture()
    {
        bool seeking = _drag == TimelineMarker.Playhead;
        _drag = null; _panning = false; Timeline.EndDrag();
        if (seeking) SeekEnded?.Invoke();
    }
    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e); if (!Timeline.HasAudio || (_original is null && _processed is null)) return;
        Focus();
        if (e.Button == MouseButtons.Middle) { _panning = true; _panX = e.X; Capture = true; return; }
        if (e.Button != MouseButtons.Left || e.X < PlotBounds.Left - 12 || e.X > PlotBounds.Right + 12) return;
        BeginGesture(e.Location); Capture = true;
    }
    protected override void OnMouseMove(MouseEventArgs e)
    {
        base.OnMouseMove(e);
        if (_panning) { Pan((_panX - e.X) / (double)PlotBounds.Width); _panX = e.X; }
        else if (_drag is not null) MoveGesture(e.X, (ModifierKeys & Keys.Shift) != 0);
        else Cursor = HitMarker(e.Location) is null ? Cursors.Cross : Cursors.SizeWE;
    }
    protected override void OnMouseUp(MouseEventArgs e)
    { base.OnMouseUp(e); EndGesture(); Capture = false; }
    protected override void OnMouseCaptureChanged(EventArgs e)
    { base.OnMouseCaptureChanged(e); if (!Capture) EndGesture(); }
    protected override void OnMouseWheel(MouseEventArgs e)
    {
        base.OnMouseWheel(e); if (_drag is not null || _panning) return;
        if ((ModifierKeys & Keys.Shift) != 0) Zoom(Math.Pow(1.25, e.Delta / 120d), (e.X - PlotBounds.Left) / (double)PlotBounds.Width);
        else Pan(-e.Delta / 120d * .12);
    }
    protected override bool IsInputKey(Keys keyData) => (keyData & Keys.KeyCode) is Keys.Left or Keys.Right or Keys.Home or Keys.End || base.IsInputKey(keyData);
    protected override void OnKeyDown(KeyEventArgs e)
    {
        base.OnKeyDown(e); if (!Timeline.HasAudio || e.KeyCode is not (Keys.Left or Keys.Right or Keys.Home or Keys.End)) return;
        if (_active == TimelineMarker.Playhead) SeekStarted?.Invoke();
        if (e.KeyCode is Keys.Home or Keys.End) Timeline.Move(_active, e.KeyCode == Keys.Home ? 0 : Timeline.FrameCount);
        else Timeline.Nudge(_active, e.KeyCode == Keys.Left ? -1 : 1, e.Shift);
        if (_active == TimelineMarker.Playhead) { SeekRequested?.Invoke(); SeekEnded?.Invoke(); }
        else SelectionChanged?.Invoke();
        RevealPlayhead(); e.Handled = true; e.SuppressKeyPress = true;
    }
}
