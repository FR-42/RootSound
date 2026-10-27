using RootSound.PhraseStudio.Core;
using RootSound.SampleEditor.Playback;

namespace RootSound.PhraseStudio.Audio;

public sealed record PhrasePlaybackSnapshot(double PositionTick, bool IsPlaying, long LoopIndex, string? Error);

/// <summary>Phrase and keyboard audition share immutable patches, never user files or a pre-rendered song.</summary>
public sealed class PhrasePlaybackSession : IAsyncDisposable
{
    private readonly object gate = new();
    private readonly PhraseMixSource mix;
    private readonly PreviewMixSource preview;
    private readonly PlaybackEngine transport;
    private readonly PlaybackEngine audition;
    private readonly System.Threading.Timer monitor;
    private readonly TaskCompletionSource disposeCompletion = new(TaskCreationOptions.RunContinuationsAsynchronously);
    private PhraseDocument? document;
    private bool loop = true;
    private bool atEnd;
    private bool disposed;
    private string? commandError;
    private long pendingSeek;
    private double pendingSeekTick;

    public PhrasePlaybackSession() : this(new WasapiPlaybackDeviceFactory()) { }

    internal PhrasePlaybackSession(IPlaybackDeviceFactory factory, int sampleRate = 48000)
    {
        mix = new PhraseMixSource(sampleRate);
        preview = new PreviewMixSource(sampleRate);
        transport = new PlaybackEngine(mix, factory);
        audition = new PlaybackEngine(preview, factory);
        monitor = new System.Threading.Timer(Poll, null, 10, 10);
    }

    public PhrasePlaybackSnapshot Snapshot
    {
        get
        {
            lock (gate)
            {
                var source = transport.Snapshot;
                (double tick, long cycle) = mix.Position(source.PositionFrames);
                if (pendingSeek != 0 && source.SeekRevision < pendingSeek) { tick = pendingSeekTick; cycle = 0; }
                if (atEnd) tick = mix.DurationTicks;
                return new(tick, !atEnd && source.IsPlaying, cycle,
                    commandError ?? source.Error ?? audition.Snapshot.Error);
            }
        }
    }
    public double PositionTick => Snapshot.PositionTick;
    public bool IsPlaying => Snapshot.IsPlaying;
    public string? Error => Snapshot.Error;
    public bool Loop
    {
        get { lock (gate) return loop; }
        set
        {
            lock (gate)
            {
                ThrowIfDisposed();
                if (loop == value) return;
                var source = transport.Snapshot;
                bool awaitingSeek = pendingSeek != 0 && source.SeekRevision < pendingSeek;
                double tick = awaitingSeek ? pendingSeekTick : mix.Position(source.PositionFrames).Tick;
                loop = value;
                mix.Loop = value;
                if (document is not null) mix.SetDocument(document, awaitingSeek ? 0 : source.PositionFrames, tick);
                atEnd = false;
            }
        }
    }

    public void SetDocument(PhraseDocument value)
    {
        ArgumentNullException.ThrowIfNull(value);
        lock (gate)
        {
            ThrowIfDisposed();
            var source = transport.Snapshot;
            bool awaitingSeek = pendingSeek != 0 && source.SeekRevision < pendingSeek;
            double tick = document is null ? 0 : awaitingSeek ? pendingSeekTick : mix.Position(source.PositionFrames).Tick;
            mix.SetDocument(value, awaitingSeek ? 0 : source.PositionFrames, Math.Min(tick, Timing.DurationTicks(value)));
            document = value;
            commandError = null;
            atEnd = false;
        }
    }

    public void Play()
    {
        lock (gate)
        {
            ThrowIfDisposed();
            if (document is null) return;
            var source = transport.Snapshot;
            double rawTick = pendingSeek != 0 && source.SeekRevision < pendingSeek
                ? pendingSeekTick : mix.RawPosition(source.PositionFrames);
            if (atEnd || (!loop && rawTick >= mix.PlaybackEndTick)) Seek(0);
            commandError = null;
            transport.Play();
        }
    }

    public void Pause()
    {
        lock (gate) { ThrowIfDisposed(); transport.Pause(); }
    }

    public void Stop()
    {
        lock (gate)
        {
            ThrowIfDisposed();
            transport.Pause();
            Seek(0);
            audition.Pause();
            audition.Seek(0);
            preview.Clear();
        }
    }

    public void Seek(double tick)
    {
        if (!double.IsFinite(tick)) throw new ArgumentOutOfRangeException(nameof(tick));
        lock (gate)
        {
            ThrowIfDisposed();
            if (document is null) return;
            tick = Math.Clamp(tick, 0, Timing.DurationTicks(document));
            mix.ResetReadCursor();
            mix.SetDocument(document, 0, tick, crossfade: false);
            pendingSeekTick = tick;
            pendingSeek = transport.Seek(0);
            atEnd = !loop && tick >= mix.PlaybackEndTick;
            commandError = null;
        }
    }

    public void Audition(PhraseChannel channel, int pitch, double heldSeconds = .45, double velocity = .8)
    {
        ArgumentNullException.ThrowIfNull(channel);
        lock (gate)
        {
            ThrowIfDisposed();
            if (channel.Timbre is null) return;
            if (!double.IsFinite(heldSeconds) || heldSeconds is <= 0 or > 30)
                throw new ArgumentOutOfRangeException(nameof(heldSeconds));
            InstrumentVoice voice = new(channel.Timbre, pitch, heldSeconds, velocity, channel.GainDb, preview.SampleRate);
            var current = audition.Snapshot;
            double start = current.IsPlaying ? Math.Max(current.PositionFrames, preview.LatestReadEnd) : current.PositionFrames;
            preview.Add(voice, start);
            commandError = null;
            audition.Play();
        }
    }

    private void Poll(object? unused)
    {
        lock (gate)
        {
            if (disposed) return;
            try
            {
                var source = transport.Snapshot;
                bool awaitingSeek = pendingSeek != 0 && source.SeekRevision < pendingSeek;
                if (!loop && !awaitingSeek && source.IsPlaying && mix.RawPosition(source.PositionFrames) >= mix.PlaybackEndTick)
                {
                    atEnd = true;
                    transport.Pause();
                }
                var note = audition.Snapshot;
                if (note.IsPlaying && note.PositionFrames >= preview.LastVoiceEnd) audition.Pause();
            }
            catch (Exception ex) when (ex is not OutOfMemoryException)
            {
                commandError = "播放无法继续：" + ex.Message;
                transport.Pause(); audition.Pause();
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        bool alreadyDisposing;
        lock (gate)
        {
            alreadyDisposing = disposed;
            if (!disposed) { disposed = true; monitor.Dispose(); }
        }
        if (alreadyDisposing) { await disposeCompletion.Task.ConfigureAwait(false); return; }
        try
        {
            await Task.WhenAll(transport.DisposeAsync().AsTask(), audition.DisposeAsync().AsTask()).ConfigureAwait(false);
            disposeCompletion.TrySetResult();
        }
        catch (Exception ex) { disposeCompletion.TrySetException(ex); throw; }
    }

    private void ThrowIfDisposed() => ObjectDisposedException.ThrowIf(disposed, this);
}
