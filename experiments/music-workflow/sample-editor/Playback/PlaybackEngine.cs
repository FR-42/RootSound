using System.Collections.Concurrent;
using RootSound.SampleEditor.Core;

namespace RootSound.SampleEditor.Playback;

public sealed record PlaybackSnapshot(double PositionFrames, bool IsPlaying, double Rate, string? Error, long SeekRevision = 0);

/// <summary>
/// Owns playback on one worker. Construction never opens an output device. The imported
/// audio must outlive this object; Dispose/DisposeAsync wait for the worker to release it.
/// </summary>
public sealed class PlaybackEngine : IDisposable, IAsyncDisposable
{
    private readonly ConcurrentQueue<Action<PlaybackCore>> commands = new();
    private readonly AutoResetEvent wake = new(false);
    private readonly TaskCompletionSource completion = new(TaskCreationOptions.RunContinuationsAsynchronously);
    private readonly Thread worker;
    private readonly IAudioFrameSource source;
    private readonly IPlaybackDeviceFactory factory;
    private readonly uint sourceChannelMask;
    private readonly object seekGate = new();
    private double pendingSeek;
    private long pendingSeekRevision;
    private long nextSeekRevision;
    private long appliedSeekRevision;
    private bool seekQueued;
    private PlaybackSnapshot snapshot = new(0, false, 1, null);
    private int disposed;

    public event EventHandler? Changed;
    public PlaybackSnapshot Snapshot => Volatile.Read(ref snapshot);

    public PlaybackEngine(IAudioFrameSource source, uint channelMask = 0) : this(source, new WasapiPlaybackDeviceFactory(), channelMask) { }

    internal PlaybackEngine(IAudioFrameSource source, IPlaybackDeviceFactory factory, uint channelMask = 0)
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(factory);
        if (source.SampleRate is < 8000 or > 768000 || source.Channels is < 1 or > 32 || source.FrameCount < 1)
            throw new ArgumentException("这段音频的声音格式或长度无效。", nameof(source));
        this.source = source;
        this.factory = factory;
        sourceChannelMask = channelMask;
        worker = new Thread(Run) { Name = "RootSound sample playback", IsBackground = true };
        worker.SetApartmentState(ApartmentState.MTA);
        worker.Start();
    }

    public void Play() => Enqueue(static core => core.Play());
    public void Pause() => Enqueue(static core => core.Pause());

    public long Seek(double frame)
    {
        if (!double.IsFinite(frame)) throw new ArgumentOutOfRangeException(nameof(frame));
        lock (seekGate)
        {
            ObjectDisposedException.ThrowIf(Volatile.Read(ref disposed) != 0, this);
            pendingSeek = frame;
            long revision = pendingSeekRevision = checked(++nextSeekRevision);
            if (seekQueued) return revision;
            seekQueued = true;
            Enqueue(core =>
            {
                double latest;
                long latestRevision;
                lock (seekGate) { latest = pendingSeek; latestRevision = pendingSeekRevision; seekQueued = false; }
                core.Seek(latest);
                // Publish acknowledgment only after flushing/seeking/restarting succeeds.
                // A coalesced later ticket also acknowledges every superseded earlier one.
                appliedSeekRevision = latestRevision;
            });
            return revision;
        }
    }

    public void SetRate(double rate)
    {
        PlaybackCore.ValidateRate(rate);
        Enqueue(core => core.SetRate(rate));
    }

    private void Enqueue(Action<PlaybackCore> command)
    {
        ObjectDisposedException.ThrowIf(Volatile.Read(ref disposed) != 0, this);
        commands.Enqueue(command);
        // Dispose can race a caller, so the event stays alive until the worker exits.
        wake.Set();
    }

    private void Run()
    {
        using PlaybackCore core = new(source, factory, sourceChannelMask);
        try
        {
            while (Volatile.Read(ref disposed) == 0)
            {
                while (commands.TryDequeue(out Action<PlaybackCore>? command))
                {
                    if (Volatile.Read(ref disposed) != 0) break;
                    try { command(core); }
                    catch (Exception ex) { core.Fail(ex); }
                }
                try { core.Poll(); }
                catch (Exception ex) { core.Fail(ex); }
                Publish(core.Snapshot);
                wake.WaitOne(core.Snapshot.IsPlaying ? 4 : 1000);
            }
        }
        finally
        {
            core.Dispose();
            Publish(core.Snapshot);
            wake.Dispose();
            completion.TrySetResult();
        }
    }

    private void Publish(PlaybackSnapshot next)
    {
        next = next with { SeekRevision = appliedSeekRevision };
        if (Snapshot == next) return;
        Volatile.Write(ref snapshot, next);
        // A UI handler must marshal to its own thread. A closing form cannot kill audio cleanup.
        if (Changed is not { } handlers) return;
        foreach (EventHandler handler in handlers.GetInvocationList())
            try { handler(this, EventArgs.Empty); } catch { }
    }

    public void Dispose()
    {
        RequestDispose();
        if (Thread.CurrentThread != worker) completion.Task.GetAwaiter().GetResult();
    }

    public async ValueTask DisposeAsync()
    {
        RequestDispose();
        if (Thread.CurrentThread != worker) await completion.Task.ConfigureAwait(false);
    }

    private void RequestDispose()
    {
        if (Interlocked.Exchange(ref disposed, 1) == 0) wake.Set();
        GC.SuppressFinalize(this);
    }
}

internal interface IPlaybackDeviceFactory
{
    IPlaybackDevice Open();
}

/// <summary>Every call, including disposal, happens on the engine's worker.</summary>
internal interface IPlaybackDevice : IDisposable
{
    int SampleRate { get; }
    int Channels { get; }
    int BufferFrames { get; }
    int PaddingFrames { get; }
    double PlayedFrames { get; }
    void Write(ReadOnlySpan<float> interleaved);
    void Start();
    void Stop();
    void Reset();
}
