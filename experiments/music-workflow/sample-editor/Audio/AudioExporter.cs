using System.Buffers.Binary;

namespace RootSound.SampleEditor.Audio;

public static class AudioExporter
{
    /// <summary>Exports the original decoded samples; audition speed never changes the exported sampling rate.</summary>
    public static Task ExportAsync(ImportedAudio audio, long startFrame, long endFrameExclusive,
        string destination, bool overwrite = false, IProgress<AudioProgress>? progress = null,
        CancellationToken cancellationToken = default) =>
        Task.Run(() => Export(audio, startFrame, endFrameExclusive, destination,
            overwrite, progress, cancellationToken), cancellationToken);

    internal static void Export(ImportedAudio audio, long startFrame, long endFrameExclusive,
        string destination, bool overwrite, IProgress<AudioProgress>? progress,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(audio);
        ArgumentException.ThrowIfNullOrWhiteSpace(destination);
        if (startFrame < 0 || endFrameExclusive > audio.FrameCount || endFrameExclusive <= startFrame)
            throw new ArgumentOutOfRangeException(nameof(startFrame), "请选择一段非空音频。 ");
        destination = Path.GetFullPath(destination);
        if (string.Equals(destination, audio.SourcePath, StringComparison.OrdinalIgnoreCase))
            throw new IOException("请使用新的文件名，不能覆盖导入的原始音频。 ");
        FileIdentity.ProtectOriginal(audio, destination);
        if (!Directory.Exists(Path.GetDirectoryName(destination)))
            throw new DirectoryNotFoundException("保存位置已不存在，请重新选择。 ");
        if (!overwrite && File.Exists(destination)) throw new IOException("文件已存在，请选择其他名称。 ");
        cancellationToken.ThrowIfCancellationRequested();
        string staging = Path.Combine(Path.GetDirectoryName(destination)!, ".rootsound-sample-" + Guid.NewGuid().ToString("N") + ".tmp");
        try
        {
            using var reader = audio.OpenReader();
            long frames = endFrameExclusive - startFrame;
            byte[] header = BuildHeader(audio.SampleRate, audio.Channels, frames, audio.ChannelMask);
            using (var output = new FileStream(staging, FileMode.CreateNew, FileAccess.Write,
                FileShare.None, 256 * 1024, FileOptions.SequentialScan))
            {
                output.Write(header);
                int bufferFrames = Math.Max(1, 65536 / audio.Channels);
                float[] samples = new float[checked(bufferFrames * audio.Channels)];
                byte[] pcm = new byte[checked(samples.Length * 3)];
                long done = 0;
                while (done < frames)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    int take = (int)Math.Min(bufferFrames, frames - done);
                    var selected = samples.AsSpan(0, checked(take * audio.Channels));
                    if (reader.ReadFrames(checked(startFrame + done), selected) != take)
                        throw new EndOfStreamException("导入的音频内容不完整，请重新导入。 ");
                    EncodePcm24(selected, pcm);
                    output.Write(pcm.AsSpan(0, checked(selected.Length * 3)));
                    done += take;
                    progress?.Report(new AudioProgress(Math.Min(0.999, done / (double)frames), "正在导出采样"));
                }
                if ((checked(frames * audio.Channels * 3) & 1) != 0) output.WriteByte(0);
                output.Flush(true);
            }
            cancellationToken.ThrowIfCancellationRequested();
            if (overwrite && File.Exists(destination))
                File.Replace(staging, destination, null, true);
            else
                File.Move(staging, destination, false);
            progress?.Report(new AudioProgress(1, "导出完成"));
        }
        finally
        {
            try { File.Delete(staging); } catch (IOException) { } catch (UnauthorizedAccessException) { }
        }
    }

    internal static void EncodePcm24(ReadOnlySpan<float> samples, Span<byte> bytes)
    {
        if (bytes.Length < checked(samples.Length * 3)) throw new ArgumentException("导出缓冲区太小。 ", nameof(bytes));
        for (int i = 0, p = 0; i < samples.Length; i++, p += 3)
        {
            if (!float.IsFinite(samples[i])) throw new InvalidDataException("音频包含无法导出的采样值。 ");
            int sample = (int)Math.Clamp(Math.Round(Math.Clamp((double)samples[i], -1, 1) * 8388608,
                MidpointRounding.AwayFromZero), -8388608, 8388607);
            bytes[p] = (byte)sample;
            bytes[p + 1] = (byte)(sample >> 8);
            bytes[p + 2] = (byte)(sample >> 16);
        }
    }

    internal static byte[] BuildHeader(int sampleRate, int channels, long frames, uint channelMask = 0)
    {
        if (sampleRate <= 0 || channels <= 0 || channels > ushort.MaxValue / 3 || frames < 0)
            throw new ArgumentOutOfRangeException(nameof(frames));
        long dataBytes = checked(frames * channels * 3);
        long riffBytes = checked(96 + dataBytes + (dataBytes & 1));
        bool rf64 = riffBytes > uint.MaxValue || dataBytes > uint.MaxValue;
        byte[] header = new byte[104];
        (rf64 ? "RF64"u8 : "RIFF"u8).CopyTo(header);
        BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(4), rf64 ? uint.MaxValue : (uint)riffBytes);
        "WAVE"u8.CopyTo(header.AsSpan(8));
        (rf64 ? "ds64"u8 : "JUNK"u8).CopyTo(header.AsSpan(12));
        BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(16), 28);
        if (rf64)
        {
            BinaryPrimitives.WriteUInt64LittleEndian(header.AsSpan(20), (ulong)riffBytes);
            BinaryPrimitives.WriteUInt64LittleEndian(header.AsSpan(28), (ulong)dataBytes);
            BinaryPrimitives.WriteUInt64LittleEndian(header.AsSpan(36), (ulong)frames);
        }
        "fmt "u8.CopyTo(header.AsSpan(48));
        BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(52), 40);
        BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(56), 0xfffe);
        BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(58), (ushort)channels);
        BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(60), (uint)sampleRate);
        BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(64), checked((uint)((long)sampleRate * channels * 3)));
        BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(68), checked((ushort)(channels * 3)));
        BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(70), 24);
        BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(72), 22);
        BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(74), 24);
        uint mask = channelMask != 0 ? channelMask : channels == 1 ? 4u : channels == 2 ? 3u : 0;
        BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(76), mask);
        new Guid("00000001-0000-0010-8000-00aa00389b71").TryWriteBytes(header.AsSpan(80));
        "data"u8.CopyTo(header.AsSpan(96));
        BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(100), rf64 ? uint.MaxValue : (uint)dataBytes);
        return header;
    }
}
