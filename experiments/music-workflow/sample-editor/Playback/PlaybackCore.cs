using RootSound.SampleEditor.Core;

namespace RootSound.SampleEditor.Playback;

/// <summary>
/// Hardware-free transport state machine. The playhead follows the device clock through
/// submitted source/rate segments, rather than the cursor that is already queued ahead.
/// </summary>
internal sealed class PlaybackCore : IDisposable
{
    private readonly IAudioFrameSource source;
    private readonly IPlaybackDeviceFactory factory;
    private readonly uint sourceChannelMask;
    private readonly List<Segment> timeline = new();
    private IPlaybackDevice? device;
    private float[] output = [];
    private double position;
    private double renderPosition;
    private double rate = 1;
    private bool playing;
    private string? error;
    private long submitted;
    private bool disposed;

    public PlaybackSnapshot Snapshot => new(position, playing, rate, error);

    internal PlaybackCore(IAudioFrameSource source, IPlaybackDeviceFactory factory, uint sourceChannelMask = 0)
    {
        this.source = source;
        this.factory = factory;
        this.sourceChannelMask = sourceChannelMask;
    }

    internal static void ValidateRate(double value)
    {
        if (!double.IsFinite(value) || value is < .5 or > 1.5)
            throw new ArgumentOutOfRangeException(nameof(value), "倍速应在 0.500 到 1.500 之间。");
    }

    public void Play()
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        if (playing) return;
        device ??= factory.Open();
        if (device.SampleRate is < 8000 or > 768000 || device.Channels is < 1 or > 32 || device.BufferFrames < 1)
            throw new InvalidOperationException("Windows 播放设备提供了无效的声音格式。");
        if (position >= source.FrameCount) position = 0;
        error = null;
        ResetStream();
        Fill();
        device.Start();
        playing = true;
    }

    public void Pause()
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        if (!playing || device is null) return;
        device.Stop();
        UpdatePosition(device.PlayedFrames);
        playing = false;
        ResetStream();
    }

    public void Seek(double frame)
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        if (!double.IsFinite(frame)) throw new ArgumentOutOfRangeException(nameof(frame));
        bool resume = playing;
        if (device is not null) device.Stop();
        playing = false;
        position = Math.Clamp(frame, 0, source.FrameCount);
        error = null;
        if (device is not null)
        {
            ResetStream();
            if (resume && position < source.FrameCount)
            {
                Fill();
                device.Start();
                playing = true;
            }
        }
    }

    public void SetRate(double value)
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        ValidateRate(value);
        rate = Math.Round(value, 3, MidpointRounding.AwayFromZero);
        // Previously queued packets keep their own rate mapping. No flush, pause or
        // discontinuity is inserted when the small speed control changes.
    }

    public void Poll()
    {
        if (!playing || device is null) return;
        double played = device.PlayedFrames;
        UpdatePosition(played);
        if (renderPosition >= source.FrameCount && played >= submitted && device.PaddingFrames == 0)
        {
            device.Stop();
            position = source.FrameCount;
            playing = false;
            ResetStream();
            return;
        }
        Fill(played);
    }

    private void ResetStream()
    {
        device!.Reset();
        timeline.Clear();
        submitted = 0;
        renderPosition = position;
    }

    private void Fill(double? playedPosition = null)
    {
        if (device is null || renderPosition >= source.FrameCount) return;
        int target = Math.Max(1, Math.Min(device.BufferFrames, device.SampleRate / 20));
        int frames = target - device.PaddingFrames;
        if (frames <= 0) return;
        double step = rate * source.SampleRate / device.SampleRate;
        frames = (int)Math.Min(frames, Math.Ceiling((source.FrameCount - renderPosition) / step));
        if (frames <= 0) return;
        int samples = checked(frames * device.Channels);
        if (output.Length < samples) output = new float[samples];
        PcmResampler.Render(source, renderPosition, step, output.AsSpan(0, samples), device.Channels, sourceChannelMask);
        // Reading/resampling can outlive the queued packet on a slow drive. Read the
        // clock after that work so the new timeline starts where this packet can play,
        // rather than where the device was before the disk read began.
        double played = Math.Max(playedPosition ?? 0, device.PlayedFrames);
        if (playedPosition.HasValue && played > playedPosition.Value) UpdatePosition(played);
        // If an unusually slow disk leaves the stream empty, the device clock can run
        // ahead. Leave a gap in the timeline instead of jumping over unplayed music.
        long first = Math.Max(submitted, checked((long)Math.Ceiling(played)));
        double start = renderPosition;
        device.Write(output.AsSpan(0, samples));
        renderPosition = Math.Min(source.FrameCount, renderPosition + frames * step);
        timeline.Add(new(first, frames, start, renderPosition));
        submitted = checked(first + frames);
    }

    private void UpdatePosition(double played)
    {
        if (!double.IsFinite(played) || played < 0) throw new InvalidOperationException("播放设备返回了无效的进度。");
        while (timeline.Count > 1 && played >= timeline[0].End) timeline.RemoveAt(0);
        if (timeline.Count == 0) return;
        Segment segment = timeline[0];
        if (played < segment.First) return;
        double fraction = Math.Clamp((played - segment.First) / segment.Frames, 0, 1);
        position = Math.Clamp(segment.SourceStart + (segment.SourceEnd - segment.SourceStart) * fraction, 0, source.FrameCount);
    }

    public void Fail(Exception exception)
    {
        // Never leave the UI showing "playing" after a device or file failure.
        playing = false;
        error = exception switch
        {
            System.Runtime.InteropServices.COMException => "无法继续播放。请检查扬声器或耳机连接，再点击播放。",
            _ => "无法继续播放：" + exception.Message
        };
        CloseDevice();
        timeline.Clear();
        submitted = 0;
        renderPosition = position;
    }

    public void Dispose()
    {
        if (disposed) return;
        disposed = true;
        if (playing && device is not null)
            try { device.Stop(); UpdatePosition(device.PlayedFrames); } catch { }
        playing = false;
        CloseDevice();
        timeline.Clear();
        output = [];
    }

    private void CloseDevice()
    {
        IPlaybackDevice? old = device;
        device = null;
        if (old is null) return;
        try { old.Stop(); } catch { }
        try { old.Dispose(); } catch { }
    }

    private sealed record Segment(long First, int Frames, double SourceStart, double SourceEnd)
    {
        internal long End => First + Frames;
    }
}
