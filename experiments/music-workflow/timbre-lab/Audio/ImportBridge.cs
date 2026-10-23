using RootSound.SampleEditor.Audio;
using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Audio;

/// <summary>Decode into a bounded, independently owned sample without modifying its source.</summary>
public static class ImportBridge
{
    public const int MaximumClipCount = 8;
    public const int MaximumChannels = 8;
    public const int MaximumSeconds = 30;
    public const long MaximumClipSamples = 16_000_000;
    public const long MaximumCollectionSamples = 64_000_000;

    public static async Task<PcmClip> ImportAsync(string path, IProgress<AudioProgress>? progress = null,
        CancellationToken cancellationToken = default)
    {
        await Task.Run(() => ValidateWaveBeforeDecode(path, cancellationToken), cancellationToken).ConfigureAwait(false);
        using var decoded = await AudioImporter.ImportAsync(path, progress, cancellationToken).ConfigureAwait(false);
        ValidateFormat(decoded.SampleRate, decoded.Channels, decoded.FrameCount);
        long sampleCount = checked(decoded.FrameCount * decoded.Channels);
        var samples = new float[checked((int)sampleCount)];
        const int chunkFrames = 8192;
        for (long frame = 0; frame < decoded.FrameCount;)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int count = (int)Math.Min(chunkFrames, decoded.FrameCount - frame);
            int received = decoded.ReadFrames(frame, samples.AsSpan(checked((int)(frame * decoded.Channels)), count * decoded.Channels));
            if (received != count) throw new EndOfStreamException("采样数据不完整，请重新导入。 ");
            frame += count;
        }
        cancellationToken.ThrowIfCancellationRequested();
        return new PcmClip(decoded.SampleRate, decoded.Channels, samples, Path.GetFileNameWithoutExtension(path));
    }

    public static void ValidateCollectionCanAdd(IEnumerable<PcmClip> existingClips, PcmClip incoming)
    {
        ArgumentNullException.ThrowIfNull(existingClips);
        ArgumentNullException.ThrowIfNull(incoming);
        long samples = incoming.Samples.LongLength;
        int count = 1;
        foreach (PcmClip clip in existingClips)
        {
            if (++count > MaximumClipCount)
                throw new InvalidOperationException("最多同时比较 8 段采样。请先移除不需要的片段。 ");
            samples = checked(samples + clip.Samples.LongLength);
            if (samples > MaximumCollectionSamples)
                throw new InvalidOperationException("这些采样占用的内存过多。请使用更短的片段或移除部分片段。 ");
        }
        if (samples > MaximumCollectionSamples)
            throw new InvalidOperationException("这些采样占用的内存过多。请使用更短的片段或移除部分片段。 ");
    }

    internal static void ValidateFormat(int sampleRate, int channels, long frameCount)
    {
        if (sampleRate is < 8000 or > 384000 || channels < 1 || channels > MaximumChannels || frameCount <= 0)
            throw new InvalidDataException("请导入 1～8 声道的有效采样。 ");
        if (frameCount > (long)sampleRate * MaximumSeconds)
            throw new InvalidDataException("每段采样最多 30 秒，请先在采样编辑中截取所需声音。 ");
        if (checked(frameCount * channels) > MaximumClipSamples)
            throw new InvalidDataException("这段采样的数据量过大，请减少时长或声道数。 ");
    }

    private static void ValidateWaveBeforeDecode(string path, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(path);
        cancellationToken.ThrowIfCancellationRequested();
        using var source = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        WaveLayout? wave = WaveDecoder.TryRead(source);
        if (wave is not null) ValidateFormat(wave.Format.SampleRate, wave.Format.Channels, wave.FrameCount);
    }
}
