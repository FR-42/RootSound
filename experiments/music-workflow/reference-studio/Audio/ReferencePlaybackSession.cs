using RootSound.PhraseStudio.Audio;
using RootSound.PhraseStudio.Core;
using RootSound.ReferenceStudio.Core;
using RootSound.SampleEditor.Playback;

namespace RootSound.ReferenceStudio.Audio;

public sealed record ReferencePlaybackSnapshot(double PositionSeconds, bool IsPlaying, string? Error);

/// <summary>Comparison and keyboard notes enter one source and one lazily opened output device.</summary>
public sealed class ReferencePlaybackSession : IAsyncDisposable
{
    private readonly object gate = new();
    private readonly ReferenceMixSource source = new();
    private readonly PlaybackEngine transport;
    private readonly System.Threading.Timer monitor;
    private readonly TaskCompletionSource disposeCompletion = new(TaskCreationOptions.RunContinuationsAsynchronously);
    private ReferenceRenderPlan? plan;
    private SourceMode mode = SourceMode.Reconstruction;
    private Guid? solo;
    private bool loop = true, musicPlaying, disposed;
    private string? commandError;
    private long pendingSeek;
    private double pendingSongFrame;
    private readonly List<InstrumentVoice> pendingPreviews = [];

    public ReferencePlaybackSession() : this(new WasapiPlaybackDeviceFactory()) { }
    internal ReferencePlaybackSession(IPlaybackDeviceFactory factory)
    {
        transport = new PlaybackEngine(source, factory);
        monitor = new System.Threading.Timer(Poll, null, 10, 10);
    }

    public ReferencePlaybackSnapshot Snapshot
    {
        get
        {
            lock (gate)
            {
                var clock = transport.Snapshot;
                double frame = AwaitingSeek(clock) ? pendingSongFrame : source.SongFrameAt(clock.PositionFrames);
                return new(frame / ReferenceRenderer.SampleRate, musicPlaying && clock.IsPlaying && !AwaitingSeek(clock),
                    commandError ?? clock.Error);
            }
        }
    }

    public SourceMode Mode
    {
        get { lock (gate) return mode; }
        set
        {
            if (!Enum.IsDefined(value)) throw new ArgumentOutOfRangeException(nameof(value));
            lock (gate) { ThrowIfDisposed(); if (mode == value) return; mode = value; RefreshScene(); }
        }
    }
    public bool Loop
    {
        get { lock (gate) return loop; }
        set { lock (gate) { ThrowIfDisposed(); if (loop == value) return; loop = value; RefreshScene(); } }
    }

    public void SetProject(ReferenceProject project)
    {
        ArgumentNullException.ThrowIfNull(project);
        // Build before replacing the audible state: invalid edits leave the old project intact.
        ReferenceRenderPlan next = new(project, plan);
        lock (gate)
        {
            ThrowIfDisposed();
            var clock = transport.Snapshot;
            double song = AwaitingSeek(clock) ? pendingSongFrame : source.SongFrameAt(clock.PositionFrames);
            bool newProject = plan is null;
            plan = next; commandError = null;
            source.SetScene(next, mode, solo, musicPlaying, loop, AwaitingSeek(clock) ? 0 : clock.PositionFrames,
                Math.Min(song, next.FrameCount), crossfade: !newProject && !AwaitingSeek(clock));
        }
    }

    public void SetSolo(Guid? channelId)
    {
        lock (gate) { ThrowIfDisposed(); solo = channelId; RefreshScene(); }
    }

    public void Play()
    {
        lock (gate)
        {
            ThrowIfDisposed(); if (plan is null || musicPlaying && transport.Snapshot.IsPlaying) return;
            var clock = transport.Snapshot;
            double position = AwaitingSeek(clock) ? pendingSongFrame : source.SongFrameAt(clock.PositionFrames);
            if (!loop && position >= plan.FrameCount) Seek(0);
            musicPlaying = true; commandError = null; RefreshScene(); transport.Play();
        }
    }
    public void Pause()
    {
        lock (gate)
        {
            ThrowIfDisposed(); if (!musicPlaying) return;
            FreezeMusic();
            if (source.LastPreviewEnd <= transport.Snapshot.PositionFrames) transport.Pause();
        }
    }
    public void Stop()
    {
        lock (gate)
        {
            ThrowIfDisposed(); musicPlaying = false; pendingPreviews.Clear(); source.ClearPreviews(); transport.Pause(); Seek(0);
        }
    }
    public void Seek(double seconds)
    {
        if (!double.IsFinite(seconds)) throw new ArgumentOutOfRangeException(nameof(seconds));
        lock (gate)
        {
            ThrowIfDisposed(); if (plan is null) return;
            double frame = Math.Clamp(Math.Round(seconds * ReferenceRenderer.SampleRate), 0, plan.FrameCount);
            if (!loop && frame >= plan.FrameCount) musicPlaying = false;
            pendingPreviews.Clear(); source.ClearPreviews(); source.ResetReadCursor();
            source.SetScene(plan, mode, solo, musicPlaying, loop, 0, frame, crossfade: false);
            pendingSongFrame = frame; pendingSeek = transport.Seek(0); commandError = null;
        }
    }
    public void Audition(PhraseChannel channel, int pitch, double heldSeconds = .45, double velocity = .8)
    {
        ArgumentNullException.ThrowIfNull(channel);
        lock (gate)
        {
            ThrowIfDisposed(); if (channel.Timbre is null) return;
            if (!double.IsFinite(heldSeconds) || heldSeconds is <= 0 or > 30) throw new ArgumentOutOfRangeException(nameof(heldSeconds));
            InstrumentVoice voice = new(channel.Timbre, pitch, heldSeconds, velocity, channel.GainDb, ReferenceRenderer.SampleRate);
            var clock = transport.Snapshot;
            // Preview starts after already queued samples and never rewinds the comparison transport.
            if (AwaitingSeek(clock))
            {
                if (pendingPreviews.Count >= 32) throw new InvalidOperationException("试听音符过多，请稍候再试。");
                pendingPreviews.Add(voice);
            }
            else source.AddPreview(voice, Math.Max(clock.PositionFrames, source.LatestReadEnd));
            commandError = null; transport.Play();
        }
    }

    private bool AwaitingSeek(PlaybackSnapshot clock) => pendingSeek != 0 && clock.SeekRevision < pendingSeek;

    private void RefreshScene()
    {
        if (plan is null) return;
        var clock = transport.Snapshot;
        bool awaiting = AwaitingSeek(clock);
        double song = awaiting ? pendingSongFrame : source.SongFrameAt(clock.PositionFrames);
        source.SetScene(plan, mode, solo, musicPlaying, loop, awaiting ? 0 : clock.PositionFrames, song, crossfade: !awaiting);
    }

    private void FreezeMusic()
    {
        if (plan is null) { musicPlaying = false; return; }
        var clock = transport.Snapshot;
        bool awaiting = AwaitingSeek(clock);
        double song = awaiting ? pendingSongFrame : source.SongFrameAt(clock.PositionFrames);
        musicPlaying = false;
        source.SetScene(plan, mode, solo, false, loop, awaiting ? 0 : clock.PositionFrames, song, crossfade: !awaiting);
    }

    private void Poll(object? unused)
    {
        lock (gate)
        {
            if (disposed) return;
            try
            {
                var clock = transport.Snapshot;
                if (clock.Error is not null) { FreezeMusic(); return; }
                if (!AwaitingSeek(clock) && pendingPreviews.Count > 0)
                {
                    double start = Math.Max(clock.PositionFrames, source.LatestReadEnd);
                    foreach (var preview in pendingPreviews) source.AddPreview(preview, start);
                    pendingPreviews.Clear(); transport.Play();
                }
                if (musicPlaying && !loop && plan is not null && !AwaitingSeek(clock) &&
                    source.RawSongFrameAt(clock.PositionFrames) >= plan.FrameCount) FreezeMusic();
                if (!musicPlaying && pendingPreviews.Count == 0 && clock.IsPlaying && clock.PositionFrames >= source.LastPreviewEnd) transport.Pause();
            }
            catch (Exception ex) when (ex is not OutOfMemoryException)
            {
                commandError = "播放无法继续：" + ex.Message; musicPlaying = false; transport.Pause();
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        bool already;
        lock (gate) { already = disposed; if (!disposed) { disposed = true; monitor.Dispose(); } }
        if (already) { await disposeCompletion.Task.ConfigureAwait(false); return; }
        try { await transport.DisposeAsync().ConfigureAwait(false); disposeCompletion.TrySetResult(); }
        catch (Exception ex) { disposeCompletion.TrySetException(ex); throw; }
    }
    private void ThrowIfDisposed() => ObjectDisposedException.ThrowIf(disposed, this);
}
