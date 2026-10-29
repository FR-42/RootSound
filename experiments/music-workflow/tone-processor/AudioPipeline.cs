using RootSound.SampleEditor.Analysis;
using RootSound.SampleEditor.Core;

namespace RootSound.ToneProcessor;

/// <summary>Immutable edit region. Trimming never writes to the imported file or its PCM cache.</summary>
internal sealed class ClipSource : IAudioFrameSource
{
    private readonly IAudioFrameSource original;
    internal long Offset { get; }
    public int SampleRate => original.SampleRate;
    public int Channels => original.Channels;
    public long FrameCount { get; }
    internal ClipSource(IAudioFrameSource original, long offset, long count)
    {
        if (offset < 0 || count < 1 || offset > original.FrameCount - count) throw new ArgumentOutOfRangeException(nameof(count));
        this.original = original; Offset = offset; FrameCount = count;
    }
    internal ClipSource Trim(long first, long last)
    {
        if (first < 0 || last > FrameCount || first >= last) throw new ArgumentOutOfRangeException(nameof(first));
        return new ClipSource(original, checked(Offset + first), last - first);
    }
    public int ReadFrames(long startFrame, Span<float> destination)
    {
        if (startFrame < 0 || startFrame > FrameCount || destination.Length % Channels != 0) throw new ArgumentOutOfRangeException(nameof(startFrame));
        int count = (int)Math.Min(FrameCount - startFrame, destination.Length / Channels);
        if (count > 0 && original.ReadFrames(Offset + startFrame, destination[..(count * Channels)]) != count)
            throw new EndOfStreamException("音频片段不完整，请重新导入。");
        destination[(count * Channels)..].Clear(); return count;
    }
}

/// <summary>The unmodified Spectral Forge DSP builds this impulse in a web worker.</summary>
internal sealed class EqKernel
{
    internal const int Length = 8192, Block = 8192, FftSize = 16384;
    internal readonly double[] Real = new double[FftSize], Imaginary = new double[FftSize];
    internal bool Bypass { get; }
    internal EqKernel(float[] impulse)
    {
        if (impulse.Length != Length || impulse.Any(x => !float.IsFinite(x) || Math.Abs(x) > 64))
            throw new InvalidDataException("EQ 音频数据无效。");
        Bypass = Math.Abs(impulse[0] - 1) < 1e-7 && impulse.Skip(1).All(x => Math.Abs(x) < 1e-9);
        for (int i = 0; i < Length; i++) Real[i] = impulse[i];
        Radix2Fft.Transform(Real, Imaginary);
    }
    internal static EqKernel Flat { get; } = new(CreateFlat());
    private static float[] CreateFlat() { var result = new float[Length]; result[0] = 1; return result; }
}

/// <summary>Bounded-memory random-access overlap-save FIR. Playback, seeking and export use the same processing.</summary>
internal sealed class EqSource : IAudioFrameSource
{
    private readonly IAudioFrameSource source;
    private readonly object gate = new();
    private EqKernel kernel;
    private long cachedBlock = -1;
    private readonly float[] cache, input;
    private readonly double[] real = new double[EqKernel.FftSize], imaginary = new double[EqKernel.FftSize];
    public int SampleRate => source.SampleRate;
    public int Channels => source.Channels;
    public long FrameCount => source.FrameCount;
    internal EqKernel Kernel { get { lock (gate) return kernel; } }
    internal EqSource(IAudioFrameSource source, EqKernel kernel)
    {
        this.source = source; this.kernel = kernel;
        cache = new float[EqKernel.Block * Channels]; input = new float[EqKernel.FftSize * Channels];
    }
    internal void SetKernel(EqKernel next) { lock (gate) { kernel = next; cachedBlock = -1; } }
    public int ReadFrames(long startFrame, Span<float> destination)
    {
        if (startFrame < 0 || startFrame > FrameCount || destination.Length % Channels != 0) throw new ArgumentOutOfRangeException(nameof(startFrame));
        lock (gate)
        {
            int count = (int)Math.Min(FrameCount - startFrame, destination.Length / Channels);
            if (kernel.Bypass) return source.ReadFrames(startFrame, destination);
            int done = 0;
            while (done < count)
            {
                long position = startFrame + done, block = position / EqKernel.Block;
                if (cachedBlock != block) RenderBlock(block);
                int offset = (int)(position % EqKernel.Block), take = Math.Min(count - done, EqKernel.Block - offset);
                cache.AsSpan(offset * Channels, take * Channels).CopyTo(destination[(done * Channels)..]);
                done += take;
            }
            destination[(count * Channels)..].Clear(); return count;
        }
    }
    private void RenderBlock(long block)
    {
        long first = checked(block * EqKernel.Block) - (EqKernel.Length - 1), readStart = Math.Max(0, first);
        int padding = (int)(readStart - first), take = (int)Math.Min(EqKernel.FftSize - padding, FrameCount - readStart);
        Array.Clear(input);
        if (take > 0 && source.ReadFrames(readStart, input.AsSpan(padding * Channels, take * Channels)) != take)
            throw new EndOfStreamException("音频加工时读取失败。");
        for (int ch = 0; ch < Channels; ch++)
        {
            for (int i = 0; i < real.Length; i++) real[i] = input[i * Channels + ch];
            Array.Clear(imaginary); Radix2Fft.Transform(real, imaginary);
            for (int i = 0; i < real.Length; i++)
            {
                double re = real[i] * kernel.Real[i] - imaginary[i] * kernel.Imaginary[i];
                imaginary[i] = -(real[i] * kernel.Imaginary[i] + imaginary[i] * kernel.Real[i]); real[i] = re;
            }
            Radix2Fft.Transform(real, imaginary);
            for (int i = 0; i < EqKernel.Block; i++)
            {
                double value = real[EqKernel.Length - 1 + i] / EqKernel.FftSize;
                if (!double.IsFinite(value)) throw new InvalidDataException("EQ 加工产生了无效声音。");
                cache[i * Channels + ch] = (float)value;
            }
        }
        cachedBlock = block;
    }
}

/// <summary>Maps a long playback clock into the exclusive blue range, including reads crossing its end.</summary>
internal sealed class LoopSource : IAudioFrameSource
{
    private sealed record Range(long First, long Last, long Origin, long ClockOrigin=0);
    private Range range;
    private readonly IAudioFrameSource source;
    public int SampleRate => source.SampleRate;
    public int Channels => source.Channels;
    public long FrameCount => (long)SampleRate * 86400 * 365;
    internal LoopSource(IAudioFrameSource source) { this.source = source; range = new(0, source.FrameCount, 0); }
    internal void SetRange(long first, long last, double position)
    {
        if (first < 0 || last > source.FrameCount || first >= last) throw new ArgumentOutOfRangeException(nameof(first));
        long origin = (long)Math.Clamp(position, first, last - 1);
        Volatile.Write(ref range, new(first, last, origin));
    }
    internal double Position(double clock)
    {
        var r = Volatile.Read(ref range);
        return Position(r,Math.Max(0,clock));
    }
    private static double Position(Range r,double clock)
    {
        long length=r.Last-r.First;
        double relative=(r.Origin-r.First+clock-r.ClockOrigin)%length;
        return r.First+(relative<0?relative+length:relative);
    }
    /// <summary>Change boundaries while preserving the playback clock and current sample.
    /// No seek, device reset, or replay is needed while the current sample remains inside.</summary>
    internal void UpdateRange(long first,long last,double clock)
    {
        if(first<0 || last>source.FrameCount || first>=last || !double.IsFinite(clock) || clock<0)
            throw new ArgumentOutOfRangeException(nameof(first));
        long anchor=(long)Math.Floor(clock);
        long position=(long)Math.Floor(Position(Volatile.Read(ref range),anchor));
        if(position<first || position>=last)position=first;
        Volatile.Write(ref range,new(first,last,position,anchor));
    }
    public int ReadFrames(long startFrame, Span<float> destination)
    {
        if (startFrame < 0 || startFrame > FrameCount || destination.Length % Channels != 0) throw new ArgumentOutOfRangeException(nameof(startFrame));
        var r = Volatile.Read(ref range); long length = r.Last - r.First;
        int frames = (int)Math.Min(FrameCount - startFrame, destination.Length / Channels), done = 0;
        while (done < frames)
        {
            long relative=(r.Origin-r.First+startFrame+done-r.ClockOrigin)%length;
            long position=r.First+(relative<0?relative+length:relative);
            int take = (int)Math.Min(frames - done, r.Last - position);
            if (source.ReadFrames(position, destination.Slice(done * Channels, take * Channels)) != take)
                throw new EndOfStreamException("循环试听读取失败。");
            done += take;
        }
        destination[(frames * Channels)..].Clear(); return frames;
    }
}
