using RootSound.SampleEditor.Playback;
using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Audio;

public interface IAuditionVoice : IAsyncDisposable
{
    PlaybackSnapshot Snapshot { get; }
    bool IsNote { get; }
    void Play();
    void Pause();
    long Seek(double frame);
}

/// <summary>
/// Serialize replacement and cleanup while allowing the newest request to supersede queued ones.
/// Callers must cancel a pending note render before StopAsync and pass that token to SetAsync.
/// </summary>
public sealed class AuditionSession : IAsyncDisposable
{
    private readonly Func<PcmClip, bool, IAuditionVoice> factory;
    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly TaskCompletionSource disposeCompletion = new(TaskCreationOptions.RunContinuationsAsynchronously);
    private IAuditionVoice? current;
    private long revision;
    private long initialSeekRevision;
    private int disposed;

    public AuditionSession() : this(static (clip, note) => new PlaybackVoice(clip, note)) { }
    internal AuditionSession(Func<PcmClip, bool, IAuditionVoice> factory) => this.factory = factory ?? throw new ArgumentNullException(nameof(factory));

    public IAuditionVoice? Current => Volatile.Read(ref current);
    public long InitialSeekRevision => Interlocked.Read(ref initialSeekRevision);

    public async Task SetAsync(PcmClip clip, bool note, double position = 0, bool play = true,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(clip);
        if (!double.IsFinite(position) || position < 0) throw new ArgumentOutOfRangeException(nameof(position));
        ObjectDisposedException.ThrowIf(Volatile.Read(ref disposed) != 0, this);
        cancellationToken.ThrowIfCancellationRequested();
        long request = Interlocked.Increment(ref revision);
        await gate.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            if (Volatile.Read(ref disposed) != 0 || request != Volatile.Read(ref revision)) return;
            var previous = Interlocked.Exchange(ref current, null);
            if (previous is not null) await previous.DisposeAsync().ConfigureAwait(false);
            cancellationToken.ThrowIfCancellationRequested();
            if (Volatile.Read(ref disposed) != 0 || request != Volatile.Read(ref revision)) return;

            IAuditionVoice? candidate = factory(clip, note);
            try
            {
                long seek = position > 0 ? candidate.Seek(Math.Min(position, clip.FrameCount)) : 0;
                cancellationToken.ThrowIfCancellationRequested();
                if (Volatile.Read(ref disposed) != 0 || request != Volatile.Read(ref revision)) return;
                if (play) candidate.Play();
                Interlocked.Exchange(ref initialSeekRevision, seek);
                Volatile.Write(ref current, candidate);
                candidate = null;
            }
            finally { if (candidate is not null) await candidate.DisposeAsync().ConfigureAwait(false); }
        }
        finally { gate.Release(); }
    }

    public async Task StopAsync()
    {
        long request = Interlocked.Increment(ref revision);
        await gate.WaitAsync().ConfigureAwait(false);
        try
        {
            if (request != Volatile.Read(ref revision)) return;
            var previous = Interlocked.Exchange(ref current, null);
            if (previous is not null) await previous.DisposeAsync().ConfigureAwait(false);
        }
        finally { gate.Release(); }
    }

    public async ValueTask DisposeAsync()
    {
        if (Interlocked.Exchange(ref disposed, 1) != 0)
        {
            await disposeCompletion.Task.ConfigureAwait(false);
            return;
        }
        Interlocked.Increment(ref revision);
        await gate.WaitAsync().ConfigureAwait(false);
        try
        {
            var previous = Interlocked.Exchange(ref current, null);
            if (previous is not null) await previous.DisposeAsync().ConfigureAwait(false);
            disposeCompletion.TrySetResult();
        }
        catch (Exception ex) { disposeCompletion.TrySetException(ex); throw; }
        finally { gate.Release(); }
    }

    private sealed class PlaybackVoice : IAuditionVoice
    {
        private readonly PlaybackEngine engine;
        private int disposed;
        internal PlaybackVoice(PcmClip clip, bool note)
        {
            engine = new PlaybackEngine(new PcmClipAdapter(clip));
            IsNote = note;
        }
        public PlaybackSnapshot Snapshot => engine.Snapshot;
        public bool IsNote { get; }
        public void Play() => Command(engine.Play);
        public void Pause() => Command(engine.Pause);
        public long Seek(double frame)
        {
            if (Volatile.Read(ref disposed) != 0) return 0;
            try { return engine.Seek(frame); }
            catch (ObjectDisposedException) when (Volatile.Read(ref disposed) != 0) { return 0; }
        }
        public ValueTask DisposeAsync()
        {
            Interlocked.Exchange(ref disposed, 1);
            return engine.DisposeAsync();
        }
        private void Command(Action command)
        {
            if (Volatile.Read(ref disposed) != 0) return;
            try { command(); }
            catch (ObjectDisposedException) when (Volatile.Read(ref disposed) != 0) { }
        }
    }
}
