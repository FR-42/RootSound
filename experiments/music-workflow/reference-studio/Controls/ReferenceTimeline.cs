using System.ComponentModel;
using System.Drawing.Drawing2D;
using RootSound.TimbreLab.Core;

namespace RootSound.ReferenceStudio.Controls;

internal sealed class ReferenceTimeline : Control
{
    private float[] peaks = [];
    private double duration = 1, position, sourceStart;
    private bool dragging;
    internal event Action<double>? SeekRequested;
    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    internal double PositionSeconds { get => position; set { position = Math.Clamp(value, 0, duration); Invalidate(); } }
    internal double DurationSeconds => duration;
    internal ReferenceTimeline()
    {
        DoubleBuffered = true; ResizeRedraw = true; Height = 86;
        BackColor = ReferenceTheme.Background; ForeColor = ReferenceTheme.Muted;
        Cursor = Cursors.Hand; AccessibleName = "原曲片段总览；点击或拖动定位，两种试听共用播放位置";
    }
    internal void SetReference(PcmClip clip, double start)
    {
        duration = clip.DurationSeconds; sourceStart = start; position = Math.Clamp(position, 0, duration);
        int buckets = Math.Min(1800, (int)clip.FrameCount); peaks = new float[buckets];
        for (int bucket = 0; bucket < buckets; bucket++)
        {
            long begin = bucket * clip.FrameCount / buckets, end = (bucket + 1L) * clip.FrameCount / buckets;
            long stride = Math.Max(1, (end - begin) / 40);
            float maximum = 0;
            for (long frame = begin; frame < end; frame += stride)
                for (int channel = 0; channel < clip.Channels; channel++)
                    maximum = Math.Max(maximum, Math.Abs(clip.Samples[checked((int)(frame * clip.Channels + channel))]));
            peaks[bucket] = float.IsFinite(maximum) ? Math.Clamp(maximum, 0, 1) : 0;
        }
        Invalidate();
    }
    internal double SecondsAt(int x) => Math.Clamp((x - 18) / (double)Math.Max(1, Width - 36), 0, 1) * duration;
    protected override void OnPaint(PaintEventArgs e) { base.OnPaint(e); RenderCanvas(e.Graphics); }
    internal void RenderCanvas(Graphics graphics)
    {
        graphics.Clear(BackColor); graphics.SmoothingMode = SmoothingMode.AntiAlias;
        float width = Math.Max(1, Width - 36), center = 31;
        using var waveform = new Pen(Color.FromArgb(67, 105, 122), Math.Max(1, width / Math.Max(1, peaks.Length)));
        for (int i = 0; i < peaks.Length; i++)
        { float x = 18 + i * width / peaks.Length, height = peaks[i] * 24; graphics.DrawLine(waveform, x, center - height, x, center + height); }
        using var grid = new Pen(Color.FromArgb(53, 65, 82));
        using var text = new SolidBrush(ForeColor);
        for (int i = 0; i <= 4; i++)
        {
            float x = 18 + width * i / 4; graphics.DrawLine(grid, x, 6, x, 58);
            string label = Format(sourceStart + duration * i / 4);
            var size = graphics.MeasureString(label, Font);
            graphics.DrawString(label, Font, text, Math.Clamp(x - size.Width / 2, 2, Math.Max(2, Width - size.Width)), 62);
        }
        float playhead = 18 + (float)(position / duration) * width;
        using var head = new Pen(Color.FromArgb(255, 116, 124), 2);
        graphics.DrawLine(head, playhead, 3, playhead, 59);
    }
    internal static string Format(double seconds)
    { seconds = Math.Max(0, seconds); return $"{(int)(seconds / 60):00}:{seconds % 60:00.00}"; }
    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e); if (e.Button != MouseButtons.Left) return;
        dragging = true; Capture = true; SeekAt(e.X);
    }
    protected override void OnMouseMove(MouseEventArgs e) { base.OnMouseMove(e); if (dragging) SeekAt(e.X); }
    protected override void OnMouseUp(MouseEventArgs e)
    { base.OnMouseUp(e); if (e.Button != MouseButtons.Left) return; dragging = false; Capture = false; }
    protected override void OnMouseCaptureChanged(EventArgs e) { base.OnMouseCaptureChanged(e); if (!Capture) dragging = false; }
    private void SeekAt(int x) { PositionSeconds = SecondsAt(x); SeekRequested?.Invoke(position); }
}
