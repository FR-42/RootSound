using System.ComponentModel;
using System.Drawing.Drawing2D;
using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Controls;

public sealed class SampleGraph : Control
{
    private PcmClip? _original, _processed;
    private float[] _originalPeaks = [], _processedPeaks = [];
    private long _loopStart, _loopEnd;
    private bool _showLoop;
    private int _drag;
    private Point _lastPointer;
    private double _dragRemainder;
    public event Action<long, long>? LoopChanged;

    public SampleGraph()
    {
        DoubleBuffered = true;
        BackColor = Color.FromArgb(22, 29, 35);
        ForeColor = Color.FromArgb(211, 223, 231);
        MinimumSize = new Size(180, 150);
        SetStyle(ControlStyles.ResizeRedraw, true);
    }

    [DesignerSerializationVisibility(DesignerSerializationVisibility.Hidden)]
    public double PlayheadSeconds { get; set; } = -1;

    public void SetAudio(PcmClip? original, PcmClip? processed)
    {
        _original = original;
        _processed = processed;
        RebuildPeaks();
        Invalidate();
    }

    public void SetLoop(bool enabled, long start, long end)
    {
        _showLoop = enabled;
        _loopStart = start;
        _loopEnd = end;
        Invalidate();
    }

    protected override void OnResize(EventArgs e)
    {
        base.OnResize(e);
        RebuildPeaks();
    }

    private void RebuildPeaks()
    {
        _originalPeaks = Peaks(_original, Math.Max(1, ClientSize.Width - 32));
        _processedPeaks = Peaks(_processed, Math.Max(1, ClientSize.Width - 32));
    }

    private static float[] Peaks(PcmClip? audio, int width)
    {
        if (audio is null) return [];
        float[] values = new float[width];
        for (int x = 0; x < width; x++)
        {
            long start = x * audio.FrameCount / width, end = (x + 1L) * audio.FrameCount / width;
            end = Math.Max(start + 1, end);
            for (long f = start; f < Math.Min(end, audio.FrameCount); f++)
                for (int c = 0; c < audio.Channels; c++)
                    values[x] = Math.Max(values[x], Math.Abs(audio.Samples[checked((int)(f * audio.Channels + c))]));
        }
        return values;
    }

    protected override void OnPaint(PaintEventArgs e) { base.OnPaint(e); DrawGraph(e.Graphics); }

    internal void DrawGraph(Graphics g)
    {
        g.Clear(BackColor);
        g.SmoothingMode = SmoothingMode.AntiAlias;
        var bounds = new RectangleF(16, 34, Math.Max(1, Width - 32), Math.Max(1, Height - 62));
        using var axis = new Pen(Color.FromArgb(51, 65, 77));
        g.DrawLine(axis, bounds.Left, bounds.Top + bounds.Height / 2, bounds.Right, bounds.Top + bounds.Height / 2);
        if (_original is null && _processed is null)
        {
            TextRenderer.DrawText(g, "导入一段采样", Font, Rectangle.Round(bounds), ForeColor,
                TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
            return;
        }
        var audio = _processed ?? _original!;
        if (_showLoop && _loopEnd > _loopStart)
        {
            float x1 = bounds.Left + bounds.Width * _loopStart / audio.FrameCount;
            float x2 = bounds.Left + bounds.Width * _loopEnd / audio.FrameCount;
            using var area = new SolidBrush(Color.FromArgb(31, 81, 160, 211));
            g.FillRectangle(area, x1, bounds.Top, x2 - x1, bounds.Height);
        }
        void Wave(float[] data, Color color)
        {
            using var pen = new Pen(color);
            for (int x = 0; x < data.Length; x++)
            {
                float center = bounds.Top + bounds.Height / 2;
                float peak = Math.Min(1.2f, data[x]) * bounds.Height * .43f;
                g.DrawLine(pen, bounds.Left + x, center - peak, bounds.Left + x, center + peak);
            }
        }
        Wave(_originalPeaks, Color.FromArgb(100, 111, 123));
        Wave(_processedPeaks, Color.FromArgb(103, 218, 178));
        using var labelBrush = new SolidBrush(ForeColor);
        g.DrawString(_processed is null ? "原声" : "灰：原声    绿：处理后", Font, labelBrush, 15, 9);
        g.DrawString("0", Font, labelBrush, bounds.Left, Height - 24);
        string duration = audio.DurationSeconds.ToString("0.000") + " s";
        g.DrawString(duration, Font, labelBrush, bounds.Right - g.MeasureString(duration, Font).Width, Height - 24);
        if (_showLoop)
        {
            using var line = new Pen(Color.FromArgb(100, 178, 255), 2);
            foreach (long frame in new[] { _loopStart, _loopEnd })
            {
                float x = bounds.Left + bounds.Width * frame / audio.FrameCount;
                g.DrawLine(line, x, bounds.Top - 6, x, bounds.Bottom + 5);
                using var handle = new SolidBrush(line.Color);
                g.FillEllipse(handle, x - 5, bounds.Bottom - 1, 10, 10);
            }
        }
        if (PlayheadSeconds >= 0 && PlayheadSeconds <= audio.DurationSeconds)
        {
            using var playPen = new Pen(Color.FromArgb(247, 111, 116), 1.6f);
            float x = bounds.Left + bounds.Width * (float)(PlayheadSeconds / audio.DurationSeconds);
            g.DrawLine(playPen, x, bounds.Top, x, bounds.Bottom);
        }
    }

    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e);
        if (e.Button != MouseButtons.Left || !_showLoop || (_processed ?? _original) is not { } audio) return;
        double x1 = 16 + (Width - 32d) * _loopStart / audio.FrameCount;
        double x2 = 16 + (Width - 32d) * _loopEnd / audio.FrameCount;
        if (Math.Min(Math.Abs(e.X - x1), Math.Abs(e.X - x2)) > 18) return;
        double firstDistance = Math.Abs(e.X - x1), secondDistance = Math.Abs(e.X - x2);
        _drag = Math.Abs(firstDistance - secondDistance) < .01
            ? (e.X <= (x1 + x2) / 2 ? 1 : 2)
            : (firstDistance < secondDistance ? 1 : 2);
        _lastPointer = e.Location;
        _dragRemainder = 0;
        Capture = true;
    }

    protected override void OnMouseMove(MouseEventArgs e)
    {
        base.OnMouseMove(e);
        if (_drag == 0 || (_processed ?? _original) is not { } audio) return;
        double factor = (ModifierKeys & Keys.Shift) != 0 ? .1 : 1;
        double exact = _dragRemainder + (e.X - _lastPointer.X) * audio.FrameCount / Math.Max(1d, Width - 32) * factor;
        long movement = (long)Math.Truncate(exact);
        _dragRemainder = exact - movement;
        _lastPointer = e.Location;
        if (_drag == 1) _loopStart = Math.Clamp(_loopStart + movement, 0, Math.Max(0, _loopEnd - 4));
        else _loopEnd = Math.Clamp(_loopEnd + movement, Math.Min(audio.FrameCount, _loopStart + 4), audio.FrameCount);
        LoopChanged?.Invoke(_loopStart, _loopEnd);
        Invalidate();
    }

    protected override void OnMouseUp(MouseEventArgs e) { _drag = 0; Capture = false; base.OnMouseUp(e); }
    protected override void OnMouseCaptureChanged(EventArgs e) { if (!Capture) _drag = 0; base.OnMouseCaptureChanged(e); }
}
