using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;
using RootSound.SampleEditor.Core;

namespace RootSound.SampleEditor.Audio;

public sealed record AudioProgress(double Fraction, string Message);

/// <summary>A private, disk-backed snapshot. The source file is only ever opened for reading.</summary>
public sealed class ImportedAudio : IAudioFrameSource, IDisposable
{
    private readonly string cacheDirectory;
    private readonly string pcmPath;
    private readonly SafeFileHandle handle;
    private int disposed;

    internal ImportedAudio(string sourcePath, string cacheDirectory, string pcmPath,
        int sampleRate, int channels, long frameCount, uint channelMask = 0, FileIdentity? sourceIdentity = null)
    {
        SourcePath = Path.GetFullPath(sourcePath);
        this.cacheDirectory = cacheDirectory;
        this.pcmPath = pcmPath;
        SampleRate = sampleRate;
        Channels = channels;
        FrameCount = frameCount;
        ChannelMask = channelMask;
        SourceIdentity = sourceIdentity;
        handle = File.OpenHandle(pcmPath, FileMode.Open, FileAccess.Read,
            FileShare.Read | FileShare.Delete, FileOptions.RandomAccess);
    }

    public string SourcePath { get; }
    public string FileName => Path.GetFileName(SourcePath);
    public int SampleRate { get; }
    public int Channels { get; }
    public long FrameCount { get; }
    public uint ChannelMask { get; }
    internal FileIdentity? SourceIdentity { get; }
    public double DurationSeconds => FrameCount / (double)SampleRate;

    public int ReadFrames(long startFrame, Span<float> interleaved)
    {
        ObjectDisposedException.ThrowIf(Volatile.Read(ref disposed) != 0, this);
        return AudioFrameReader.Read(handle, FrameCount, Channels, startFrame, interleaved);
    }

    public AudioFrameReader OpenReader()
    {
        ObjectDisposedException.ThrowIf(Volatile.Read(ref disposed) != 0, this);
        return new AudioFrameReader(pcmPath, SampleRate, Channels, FrameCount);
    }

    public void Dispose()
    {
        if (Interlocked.Exchange(ref disposed, 1) != 0) return;
        handle.Dispose();
        try { File.Delete(pcmPath); } catch (IOException) { } catch (UnauthorizedAccessException) { }
        try { Directory.Delete(cacheDirectory, false); } catch (IOException) { } catch (UnauthorizedAccessException) { }
    }
}

/// <summary>Each reader owns a handle; RandomAccess reads are independent and do not mutate a shared position.</summary>
public sealed class AudioFrameReader : IAudioFrameSource, IDisposable
{
    private readonly SafeFileHandle handle;
    internal AudioFrameReader(string pcmPath, int sampleRate, int channels, long frameCount)
    {
        SampleRate = sampleRate;
        Channels = channels;
        FrameCount = frameCount;
        handle = File.OpenHandle(pcmPath, FileMode.Open, FileAccess.Read,
            FileShare.Read | FileShare.Delete, FileOptions.RandomAccess);
    }

    public int SampleRate { get; }
    public int Channels { get; }
    public long FrameCount { get; }
    public int ReadFrames(long startFrame, Span<float> interleaved) =>
        Read(handle, FrameCount, Channels, startFrame, interleaved);

    internal static int Read(SafeFileHandle handle, long frameCount, int channels,
        long startFrame, Span<float> interleaved)
    {
        if (startFrame < 0 || startFrame > frameCount) throw new ArgumentOutOfRangeException(nameof(startFrame));
        if (interleaved.Length % channels != 0) throw new ArgumentException("音频缓冲区必须包含完整声道。", nameof(interleaved));
        int frames = (int)Math.Min(frameCount - startFrame, interleaved.Length / channels);
        var bytes = MemoryMarshal.AsBytes(interleaved[..checked(frames * channels)]);
        long offset = checked(startFrame * channels * sizeof(float));
        int read = 0;
        while (read < bytes.Length)
        {
            int next = RandomAccess.Read(handle, bytes[read..], checked(offset + read));
            if (next == 0) throw new EndOfStreamException("临时音频不完整，请重新导入。 ");
            read += next;
        }
        interleaved[checked(frames * channels)..].Clear();
        return frames;
    }

    public void Dispose() => handle.Dispose();
}
