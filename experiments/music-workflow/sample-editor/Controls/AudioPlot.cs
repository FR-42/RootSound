using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.ComponentModel;
using RootSound.SampleEditor.Analysis;
using RootSound.SampleEditor.Core;

namespace RootSound.SampleEditor.Controls;

internal sealed class AudioPlot : Control
{
    internal Timeline Timeline { get; } = new();
    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    internal bool ShowSpectrum { get; set; } = true;
    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    internal bool Analyzing { get; set; }
    internal event EventHandler? ViewChanged, SelectionChanged, SeekRequested, SeekStarted, SeekEnded;
    internal event EventHandler? SelectionStarted, SelectionEnded;
    private bool keyboardSelection;
    private AnalysisFrame? analysis;
    private Bitmap? spectrum;
    private TimelineMarker active = TimelineMarker.Playhead;
    private TimelineMarker? drag;
    private bool panning;
    private int panX;
    private readonly ToolTip tip = new() { InitialDelay = 550, ReshowDelay = 200 };
    private string? currentTip;
    private static readonly Color Red = Color.FromArgb(255, 75, 85), Blue = Color.FromArgb(76, 165, 255);
    private static readonly int[] Colors = Enumerable.Range(0, 256).Select(value => Palette((byte)value)).ToArray();
    internal Rectangle PlotBounds => new(56, 22, Math.Max(1, ClientSize.Width - 72), Math.Max(1, ClientSize.Height - 52));

    internal AudioPlot()
    {
        DoubleBuffered = true; ResizeRedraw = true; TabStop = true;
        BackColor = Color.FromArgb(12, 18, 28); ForeColor = Color.FromArgb(143, 160, 179);
        SetStyle(ControlStyles.Selectable, true);
        AccessibleName = "声音时间图，红线为播放位置，蓝线为选区边界";
        Cursor = Cursors.Cross;
    }
    internal void SetAnalysis(AnalysisFrame value)
    {
        var image = MakeBitmap(value);
        spectrum?.Dispose(); spectrum = image; analysis = value; Invalidate();
    }
    internal void ClearAnalysis() { spectrum?.Dispose(); spectrum = null; analysis = null; Invalidate(); }
    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        PaintGraph(e.Graphics);
    }
    internal void PaintGraph(Graphics g)
    {
        if (!Timeline.HasAudio) return;
        var area = PlotBounds;
        g.SmoothingMode = SmoothingMode.None;
        if (analysis is { } data && spectrum is not null)
        {
            double from = Math.Max(Timeline.ViewStart, data.StartFrame), to = Math.Min(Timeline.ViewEnd, data.EndFrame);
            if (to > from)
            {
                if (ShowSpectrum)
                {
                    var dest = new RectangleF(X(from), area.Top, (float)((to - from) / Timeline.ViewLength * area.Width), area.Height);
                    var src = new RectangleF((float)((from - data.StartFrame) / (data.EndFrame - (double)data.StartFrame) * data.Width), 0,
                        (float)((to - from) / (data.EndFrame - (double)data.StartFrame) * data.Width), data.Height);
                    g.InterpolationMode = InterpolationMode.NearestNeighbor; g.PixelOffsetMode = PixelOffsetMode.Half;
                    g.DrawImage(spectrum, dest, src, GraphicsUnit.Pixel);
                }
                else DrawWave(g, area, data);
            }
        }
        using var line = new Pen(Color.FromArgb(32, 180, 199, 218));
        if (ShowSpectrum)
        {
            foreach (int hz in new[] { 50, 100, 250, 500, 1000, 2000, 5000, 10000, 20000 })
            {
                if (hz >= Timeline.SampleRate / 2d) continue;
                float y = area.Top + (float)AudioAnalysis.RowForHz(hz, area.Height, Timeline.SampleRate);
                if (!float.IsFinite(y) || y < area.Top || y > area.Bottom) continue;
                g.DrawLine(line, area.Left, y, area.Right, y);
                TextRenderer.DrawText(g, hz >= 1000 ? (hz / 1000d).ToString("0.#") + "k" : hz.ToString(), Font,
                    new Rectangle(0, (int)y - 9, area.Left - 7, 18), ForeColor, TextFormatFlags.Right | TextFormatFlags.VerticalCenter);
            }
        }
        else
        {
            g.DrawLine(line, area.Left, area.Top + area.Height / 2, area.Right, area.Top + area.Height / 2);
            TextRenderer.DrawText(g, "1", Font, new Point(35, area.Top), ForeColor);
            TextRenderer.DrawText(g, "−1", Font, new Point(25, area.Bottom - 18), ForeColor);
        }
        DrawTimeAxis(g, area, line);
        var clip = g.Save(); g.SetClip(new Rectangle(area.Left - 13, 0, area.Width + 27, ClientSize.Height));
        float a = X(Timeline.SelectionStart), b = X(Timeline.SelectionEnd);
        using var shade = new SolidBrush(Color.FromArgb(122, 8, 14, 23));
        if (a > area.Left) g.FillRectangle(shade, area.Left, area.Top, Math.Min(area.Right, a) - area.Left, area.Height);
        if (b < area.Right) g.FillRectangle(shade, Math.Max(area.Left, b), area.Top, area.Right - Math.Max(area.Left, b), area.Height);
        DrawMarker(g, TimelineMarker.SelectionStart, Blue, area);
        DrawMarker(g, TimelineMarker.SelectionEnd, Blue, area);
        DrawMarker(g, TimelineMarker.Playhead, Red, area);
        g.Restore(clip);
        if (Analyzing)
            TextRenderer.DrawText(g, "分析中…", Font, new Rectangle(area.Right - 86, 1, 85, 20), Color.FromArgb(160, 179, 199), TextFormatFlags.Right);
    }
    private void DrawWave(Graphics g, Rectangle area, AnalysisFrame data)
    {
        using var pen = new Pen(Color.FromArgb(92, 202, 205));
        using var rms = new Pen(Color.FromArgb(87, 126, 171));
        float mid = area.Top + area.Height / 2f, scale = area.Height * .47f;
        for (int i = 0; i < data.Width; i++)
        {
            double frame = data.StartFrame + (i + .5) * (data.EndFrame - (double)data.StartFrame) / data.Width;
            float x = X(frame); if (x < area.Left - 1 || x > area.Right + 1) continue;
            float high = Math.Clamp(data.Maximum[i], -1, 1), low = Math.Clamp(data.Minimum[i], -1, 1);
            g.DrawLine(pen, x, mid - high * scale, x, mid - low * scale);
            float level = Math.Clamp(data.Rms[i], 0, 1);
            g.DrawLine(rms, x, mid - level * scale, x, mid + level * scale);
        }
    }
    private void DrawTimeAxis(Graphics g, Rectangle area, Pen grid)
    {
        double seconds = Timeline.ViewLength / Timeline.SampleRate;
        double ideal = seconds / Math.Max(2, area.Width / 115d);
        double magnitude = Math.Pow(10, Math.Floor(Math.Log10(Math.Max(.000001, ideal))));
        double step = new[] { 1d, 2d, 5d, 10d }.First(value => value * magnitude >= ideal) * magnitude;
        double start = Timeline.ViewStart / Timeline.SampleRate;
        int decimals = Math.Clamp((int)-Math.Floor(Math.Log10(step)), 0, 5);
        for (double time = Math.Ceiling(start / step) * step; time <= start + seconds; time += step)
        {
            float x = X(time * Timeline.SampleRate);
            g.DrawLine(grid, x, area.Top, x, area.Bottom);
            string label = time >= 60 ? $"{(int)(time / 60)}:{(time % 60).ToString(decimals > 0 ? "00." + new string('0', decimals) : "00")}" : time.ToString("F" + decimals) + "s";
            TextRenderer.DrawText(g, label, Font, new Rectangle((int)x - 48, area.Bottom + 7, 96, 20), ForeColor, TextFormatFlags.HorizontalCenter);
        }
    }
    private void DrawMarker(Graphics g, TimelineMarker marker, Color color, Rectangle area)
    {
        float x = X(Timeline.Position(marker));
        if (x < area.Left - 1 || x > area.Right + 1) return;
        using var pen = new Pen(color, marker == active && Focused ? 2 : 1.4f);
        using var fill = new SolidBrush(color);
        g.DrawLine(pen, x, area.Top, x, area.Bottom);
        PointF[] triangle = marker switch
        {
            TimelineMarker.Playhead => [new(x - 7, area.Top - 12), new(x + 7, area.Top - 12), new(x, area.Top)],
            _ when marker == Timeline.BoundaryMarker(true) => [new(x - 11, area.Bottom + 2), new(x, area.Bottom - 10), new(x, area.Bottom + 13)],
            _ => [new(x + 11, area.Bottom + 2), new(x, area.Bottom - 10), new(x, area.Bottom + 13)]
        };
        g.FillPolygon(fill, triangle);
    }
    private float X(double frame) => PlotBounds.Left + (float)(Timeline.FractionAt(frame) * PlotBounds.Width);
    internal TimelineMarker? HitMarker(Point point)
    {
        var area = PlotBounds;
        var candidates = Enum.GetValues<TimelineMarker>().Where(marker => Math.Abs(X(Timeline.Position(marker)) - point.X) <= 12 * DeviceDpi / 96f).ToArray();
        if (point.Y < area.Top + 7 && candidates.Contains(TimelineMarker.Playhead)) return TimelineMarker.Playhead;
        if (point.Y > area.Bottom - 13)
        {
            var blues = candidates.Where(marker => marker != TimelineMarker.Playhead).ToArray();
            if (blues.Length == 2 && Math.Abs(X(Timeline.SelectionStart) - X(Timeline.SelectionEnd)) < .5f)
                return point.X >= X(Timeline.SelectionEnd) ? TimelineMarker.SelectionEnd : TimelineMarker.SelectionStart;
            if (blues.Length != 0) return blues.OrderBy(marker => Math.Abs(X(Timeline.Position(marker)) - point.X)).First();
        }
        return candidates.OrderBy(marker => Math.Abs(X(Timeline.Position(marker)) - point.X)).Select(marker => (TimelineMarker?)marker).FirstOrDefault();
    }
    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e); if (!Timeline.HasAudio) return;
        Focus();
        if (e.Button == MouseButtons.Middle) { panning = true; panX = e.X; Capture = true; Cursor = Cursors.Hand; return; }
        if (e.Button != MouseButtons.Left) return;
        var area = PlotBounds;
        if (e.X < area.Left - 12 || e.X > area.Right + 12) return;
        BeginGesture(e.Location); Capture = true;
    }
    internal void BeginGesture(Point point)
    {
        var area = PlotBounds;
        active = HitMarker(point) ?? TimelineMarker.Playhead;
        drag = active;
        if (active == TimelineMarker.Playhead)
        {
            SeekStarted?.Invoke(this, EventArgs.Empty);
            if (HitMarker(point) is null)
                Timeline.Move(active, Math.Round(Timeline.FrameAt((point.X - area.Left) / (double)area.Width)));
            SeekRequested?.Invoke(this, EventArgs.Empty);
        }
        else SelectionStarted?.Invoke(this, EventArgs.Empty);
        Timeline.BeginDrag(active, point.X); Invalidate();
    }
    protected override void OnMouseEnter(EventArgs e)
    { base.OnMouseEnter(e); if (FindForm()?.ContainsFocus == true) Focus(); }
    protected override void OnMouseMove(MouseEventArgs e)
    {
        base.OnMouseMove(e);
        if (panning)
        {
            Timeline.Pan((panX - e.X) / (double)PlotBounds.Width); panX = e.X;
            ViewChanged?.Invoke(this, EventArgs.Empty); Invalidate(); return;
        }
        if (drag is { } marker)
        {
            MoveGesture(e.X, (ModifierKeys & Keys.Shift) != 0); return;
        }
        var hit = Timeline.HasAudio ? HitMarker(e.Location) : null;
        Cursor = hit is not null ? Cursors.SizeWE : Cursors.Cross;
        string? text = hit switch { TimelineMarker.Playhead => "播放位置 · 拖动 / Shift 精调", not null => "蓝线 · 拖动 / Shift 精调", _ => null };
        if (text != currentTip) { currentTip = text; tip.SetToolTip(this, text); }
    }
    protected override void OnMouseUp(MouseEventArgs e)
    {
        base.OnMouseUp(e); if (e.Button is not (MouseButtons.Left or MouseButtons.Middle)) return;
        EndGesture();
    }
    protected override void OnMouseCaptureChanged(EventArgs e)
    { base.OnMouseCaptureChanged(e); if (!Capture) EndGesture(); }
    internal void MoveGesture(int x, bool precise)
    {
        if (drag is not { } marker) return;
        Timeline.Drag(x, PlotBounds.Width, precise);
        if (marker == TimelineMarker.Playhead) SeekRequested?.Invoke(this, EventArgs.Empty);
        else SelectionChanged?.Invoke(this, EventArgs.Empty);
        Invalidate();
    }
    internal void EndGesture()
    {
        bool wasSeeking = drag == TimelineMarker.Playhead;
        bool wasSelecting = drag is TimelineMarker.SelectionStart or TimelineMarker.SelectionEnd;
        drag = null; panning = false; Timeline.EndDrag(); Capture = false; Cursor = Cursors.Cross;
        if (wasSeeking) SeekEnded?.Invoke(this, EventArgs.Empty);
        else if (wasSelecting) SelectionEnded?.Invoke(this, EventArgs.Empty);
    }
    protected override void OnMouseWheel(MouseEventArgs e)
    {
        if (!Timeline.HasAudio || drag is not null || panning) return;
        if ((ModifierKeys & Keys.Shift) != 0)
            Timeline.Zoom(Math.Pow(1.25, e.Delta / 120d), (e.X - PlotBounds.Left) / (double)PlotBounds.Width);
        else Timeline.Pan(-e.Delta / 120d * .12);
        ViewChanged?.Invoke(this, EventArgs.Empty); Invalidate();
    }
    protected override bool IsInputKey(Keys keyData) => (keyData & Keys.KeyCode) is Keys.Left or Keys.Right or Keys.Home or Keys.End || base.IsInputKey(keyData);
    protected override void OnKeyDown(KeyEventArgs e)
    {
        base.OnKeyDown(e); if (!Timeline.HasAudio) return;
        if (e.KeyCode is not (Keys.Left or Keys.Right or Keys.Home or Keys.End)) return;
        if (active == TimelineMarker.Playhead) SeekStarted?.Invoke(this, EventArgs.Empty);
        else if (!keyboardSelection) { keyboardSelection = true; SelectionStarted?.Invoke(this, EventArgs.Empty); }
        if (e.KeyCode is Keys.Home or Keys.End) Timeline.Move(active, e.KeyCode == Keys.Home ? 0 : Timeline.FrameCount);
        else Timeline.Nudge(active, e.KeyCode == Keys.Left ? -1 : 1, e.Shift);
        if (active == TimelineMarker.Playhead) { SeekRequested?.Invoke(this, EventArgs.Empty); SeekEnded?.Invoke(this, EventArgs.Empty); }
        else SelectionChanged?.Invoke(this, EventArgs.Empty);
        Invalidate(); e.Handled = true; e.SuppressKeyPress = true;
    }
    protected override void OnKeyUp(KeyEventArgs e)
    {
        base.OnKeyUp(e);
        if (e.KeyCode is Keys.Left or Keys.Right or Keys.Home or Keys.End) EndKeyboardSelection();
    }
    protected override void OnLostFocus(EventArgs e) { base.OnLostFocus(e); EndKeyboardSelection(); }
    private void EndKeyboardSelection()
    {
        if (!keyboardSelection) return;
        keyboardSelection = false; SelectionEnded?.Invoke(this, EventArgs.Empty);
    }
    private static Bitmap MakeBitmap(AnalysisFrame value)
    {
        var result = new Bitmap(value.Width, value.Height, PixelFormat.Format32bppArgb);
        var bits = result.LockBits(new Rectangle(0, 0, result.Width, result.Height), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        try
        {
            int[] pixels = new int[value.Width * value.Height];
            for (int i = 0; i < pixels.Length; i++) pixels[i] = Colors[value.Intensities[i]];
            for (int y = 0; y < value.Height; y++) Marshal.Copy(pixels, y * value.Width, bits.Scan0 + y * bits.Stride, value.Width);
        }
        finally { result.UnlockBits(bits); }
        return result;
    }
    private static int Palette(byte value)
    {
        Color[] stops = [Color.FromArgb(10, 17, 28), Color.FromArgb(20, 43, 90), Color.FromArgb(87, 52, 140), Color.FromArgb(185, 70, 92), Color.FromArgb(244, 157, 57), Color.FromArgb(255, 242, 174)];
        double at = value / 255d * (stops.Length - 1);
        int index = Math.Min(stops.Length - 2, (int)at); double mix = at - index;
        var a = stops[index]; var b = stops[index + 1];
        return Color.FromArgb((int)(a.R + (b.R - a.R) * mix), (int)(a.G + (b.G - a.G) * mix), (int)(a.B + (b.B - a.B) * mix)).ToArgb();
    }
    protected override void Dispose(bool disposing)
    { if (disposing) { spectrum?.Dispose(); tip.Dispose(); } base.Dispose(disposing); }
}
