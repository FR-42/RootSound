namespace RootSound.SampleEditor.Core;

public enum TimelineMarker { Playhead, SelectionStart, SelectionEnd }

public sealed class Timeline
{
    public long FrameCount { get; private set; }
    public int SampleRate { get; private set; }
    public double Playhead { get; private set; }
    public long SelectionStart { get; private set; }
    public long SelectionEnd { get; private set; }
    public double ViewStart { get; private set; }
    public double ViewLength { get; private set; }
    public double ViewEnd => ViewStart + ViewLength;
    public bool HasAudio => FrameCount > 0;
    public bool HasSelection => HasAudio && SelectionEnd > SelectionStart;
    private TimelineMarker? dragging;
    private double lastX, dragPosition;

    public void Load(long frames, int sampleRate)
    {
        if (frames < 1 || sampleRate < 1) throw new ArgumentOutOfRangeException(nameof(frames));
        FrameCount = frames; SampleRate = sampleRate;
        Playhead = SelectionStart = 0; SelectionEnd = frames;
        ViewStart = 0; ViewLength = frames; dragging = null;
    }
    public double Position(TimelineMarker marker) => marker switch
    {
        TimelineMarker.Playhead => Playhead,
        TimelineMarker.SelectionStart => SelectionStart,
        TimelineMarker.SelectionEnd => SelectionEnd,
        _ => throw new ArgumentOutOfRangeException(nameof(marker))
    };
    public void Move(TimelineMarker marker, double frame)
    {
        if (!HasAudio || !double.IsFinite(frame)) return;
        frame = Math.Clamp(frame, 0, FrameCount);
        switch (marker)
        {
            case TimelineMarker.Playhead: Playhead = frame; break;
            case TimelineMarker.SelectionStart: SelectionStart = Math.Min(SelectionEnd, (long)Math.Round(frame)); break;
            case TimelineMarker.SelectionEnd: SelectionEnd = Math.Max(SelectionStart, (long)Math.Round(frame)); break;
            default: throw new ArgumentOutOfRangeException(nameof(marker));
        }
    }
    public double FrameAt(double fraction) => !HasAudio ? 0 : Math.Clamp(ViewStart + fraction * ViewLength, 0, FrameCount);
    public double FractionAt(double frame) => HasAudio ? (frame - ViewStart) / ViewLength : 0;
    public void Fit() { if (HasAudio) { ViewStart = 0; ViewLength = FrameCount; } }
    public void SetViewStart(double frame)
    { if (HasAudio && double.IsFinite(frame)) ViewStart = Math.Clamp(frame, 0, FrameCount - ViewLength); }
    public void Pan(double fraction) => SetViewStart(ViewStart + fraction * ViewLength);
    public void Zoom(double factor, double anchorFraction)
    {
        if (!HasAudio || !double.IsFinite(factor) || factor <= 0 || !double.IsFinite(anchorFraction)) return;
        anchorFraction = Math.Clamp(anchorFraction, 0, 1);
        double anchor = FrameAt(anchorFraction);
        ViewLength = Math.Clamp(ViewLength / factor, Math.Min(16, FrameCount), FrameCount);
        ViewStart = Math.Clamp(anchor - ViewLength * anchorFraction, 0, FrameCount - ViewLength);
    }
    public void Reveal(double frame)
    {
        if (!HasAudio || frame >= ViewStart && frame <= ViewEnd) return;
        SetViewStart(frame - ViewLength * .2);
    }
    public void BeginDrag(TimelineMarker marker, double x)
    { dragging = marker; lastX = x; dragPosition = Position(marker); }
    public void Drag(double x, double pixelWidth, bool precise)
    {
        if (dragging is not { } marker || !HasAudio || pixelWidth <= 0 || !double.IsFinite(x)) return;
        double change = (x - lastX) * ViewLength / pixelWidth * (precise ? .1 : 1);
        lastX = x;
        dragPosition = Math.Clamp(dragPosition + change, 0, FrameCount);
        if (marker == TimelineMarker.SelectionStart) dragPosition = Math.Min(dragPosition, SelectionEnd);
        else if (marker == TimelineMarker.SelectionEnd) dragPosition = Math.Max(dragPosition, SelectionStart);
        Move(marker, dragPosition);
    }
    public void EndDrag() => dragging = null;
    public void Nudge(TimelineMarker marker, int direction, bool precise)
    { if (HasAudio) Move(marker, Position(marker) + direction * (precise ? 1 : Math.Max(1, SampleRate / 100))); }
}
