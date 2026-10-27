using RootSound.SampleEditor.Playback;
using RootSound.SongStudio.Core;

namespace RootSound.SongStudio.Audio;

internal sealed record SongPlaybackSnapshot(double Tick, bool Playing, string? Error);
internal sealed class SongPlayback : IAsyncDisposable
{
    private readonly object gate = new();
    private readonly SongMixSource mix = new();
    private readonly PlaybackEngine engine;
    private readonly System.Threading.Timer monitor;
    private SongDocument? document;
    private bool disposed, atEnd;
    private long pendingSeek;
    private double pendingTick;
    internal SongPlayback() : this(new WasapiPlaybackDeviceFactory()) { }
    internal SongPlayback(IPlaybackDeviceFactory factory)
    { engine = new(mix, factory); monitor = new(Poll, null, 10, 10); }
    internal SongPlaybackSnapshot Snapshot
    {
        get { lock (gate) { var s = engine.Snapshot; return new(atEnd ? mix.EndTick :
            pendingSeek != 0 && s.SeekRevision < pendingSeek ? pendingTick : Math.Clamp(mix.Position(s.PositionFrames), 0, Math.Max(mix.EndTick, pendingTick)),
            !atEnd && s.IsPlaying, s.Error); } }
    }
    internal void SetDocument(SongDocument song)
    {
        lock (gate)
        {
            var s = engine.Snapshot;
            bool awaiting = pendingSeek != 0 && s.SeekRevision < pendingSeek;
            double tick = document is null ? 0 : awaiting ? pendingTick : atEnd ? mix.EndTick : Math.Max(0, mix.Position(s.PositionFrames));
            mix.SetDocument(song, awaiting ? 0 : s.PositionFrames, tick);
            document = song; atEnd = false;
        }
    }
    internal void Play()
    {
        lock (gate)
        {
            if (document is null || document.Clips.Count == 0) return;
            var s = engine.Snapshot;
            double tick = pendingSeek != 0 && s.SeekRevision < pendingSeek ? pendingTick : mix.Position(s.PositionFrames);
            if (atEnd || tick >= mix.PlaybackEndTick) Seek(0);
            engine.Play();
        }
    }
    internal void Pause() { lock (gate) engine.Pause(); }
    internal void Stop() { lock (gate) { engine.Pause(); Seek(0); } }
    internal void Seek(double tick)
    {
        lock (gate)
        {
            if (document is null || !double.IsFinite(tick)) return;
            pendingTick = Math.Clamp(tick, 0, SongRules.MaximumTicks);
            mix.ResetReadCursor(); mix.SetDocument(document, 0, pendingTick, false);
            pendingSeek = engine.Seek(0); atEnd = false;
        }
    }
    private void Poll(object? state)
    {
        lock (gate)
        {
            if (disposed) return;
            var s = engine.Snapshot;
            if (s.IsPlaying && (pendingSeek == 0 || s.SeekRevision >= pendingSeek) && mix.Position(s.PositionFrames) >= mix.PlaybackEndTick)
            { atEnd = true; engine.Pause(); }
        }
    }
    public async ValueTask DisposeAsync()
    { lock (gate) { disposed = true; monitor.Dispose(); } await engine.DisposeAsync().ConfigureAwait(false); }
}
