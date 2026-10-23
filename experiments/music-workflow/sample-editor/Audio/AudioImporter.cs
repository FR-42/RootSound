using System.Runtime.InteropServices;

namespace RootSound.SampleEditor.Audio;

public static class AudioImporter
{
    public static Task<ImportedAudio> ImportAsync(string path, IProgress<AudioProgress>? progress = null,
        CancellationToken cancellationToken = default) =>
        Task.Run(() => Import(path, progress, cancellationToken), cancellationToken);

    internal static ImportedAudio Import(string path, IProgress<AudioProgress>? progress,
        CancellationToken cancellationToken, string? temporaryRoot = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(path);
        path = Path.GetFullPath(path);
        if (!File.Exists(path)) throw new FileNotFoundException("找不到要导入的音频文件。", path);
        cancellationToken.ThrowIfCancellationRequested();
        string directory = Path.Combine(temporaryRoot ?? Path.GetTempPath(), "RootSound-Sample-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(directory);
        string pcmPath = Path.Combine(directory, "audio.f32");
        try
        {
            AudioFormat format;
            long frameCount;
            FileIdentity? sourceIdentity;
            using (var output = new FileStream(pcmPath, FileMode.CreateNew, FileAccess.Write,
                FileShare.None, 256 * 1024, FileOptions.SequentialScan))
            {
                progress?.Report(new AudioProgress(0, "正在读取音频"));
                using var source = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read,
                    256 * 1024, FileOptions.SequentialScan);
                sourceIdentity = FileIdentity.Read(source.SafeFileHandle);
                WaveLayout? wave = WaveDecoder.TryRead(source);
                if (wave is not null)
                {
                    format = wave.Format;
                    frameCount = WaveDecoder.Decode(source, output, wave, progress, cancellationToken);
                }
                else
                {
                    // The file handle above also prevents a writer from replacing the source during decoding.
                    (format, frameCount) = MediaFoundationDecoder.Decode(path, output, progress, cancellationToken);
                }
                output.Flush(true);
            }
            cancellationToken.ThrowIfCancellationRequested();
            if (frameCount == 0) throw new InvalidDataException("这个文件没有可用的音频。 ");
            progress?.Report(new AudioProgress(1, "导入完成"));
            return new ImportedAudio(path, directory, pcmPath,
                format.SampleRate, format.Channels, frameCount, format.ChannelMask, sourceIdentity);
        }
        catch
        {
            try { File.Delete(pcmPath); } catch (IOException) { } catch (UnauthorizedAccessException) { }
            try { Directory.Delete(directory, false); } catch (IOException) { } catch (UnauthorizedAccessException) { }
            throw;
        }
    }
}

internal sealed record AudioFormat(int SampleRate, int Channels, int Bits, bool FloatingPoint,
    int BlockAlign, uint ChannelMask = 0, int ValidBits = 0)
{
    internal static AudioFormat Create(int sampleRate, int channels, int bits, bool floatingPoint,
        int blockAlign, uint channelMask = 0, int validBits = 0)
    {
        if (sampleRate <= 0 || channels <= 0 || channels > ushort.MaxValue ||
            (floatingPoint ? bits is not (32 or 64) : bits is not (8 or 16 or 24 or 32)) ||
            blockAlign != checked(channels * (bits / 8)) ||
            (validBits != 0 && (validBits < 1 || validBits > bits || (floatingPoint && validBits != bits))))
            throw new InvalidDataException("音频格式参数无效。 ");
        if (channelMask != 0 && System.Numerics.BitOperations.PopCount(channelMask) != channels)
            throw new InvalidDataException("音频声道布局与声道数不一致。 ");
        return new AudioFormat(sampleRate, channels, bits, floatingPoint, blockAlign, channelMask, validBits);
    }

    internal void Decode(ReadOnlySpan<byte> bytes, Span<float> samples)
    {
        int width = Bits / 8;
        if (bytes.Length % BlockAlign != 0 || samples.Length != bytes.Length / width)
            throw new InvalidDataException("音频数据未按完整采样帧对齐。 ");
        for (int i = 0, p = 0; i < samples.Length; i++, p += width)
        {
            float value;
            if (FloatingPoint)
            {
                value = Bits == 32
                    ? System.Buffers.Binary.BinaryPrimitives.ReadSingleLittleEndian(bytes[p..])
                    : (float)System.Buffers.Binary.BinaryPrimitives.ReadDoubleLittleEndian(bytes[p..]);
                if (!float.IsFinite(value)) throw new InvalidDataException("音频包含无法处理的非有限采样值。 ");
            }
            else
            {
                int signed = Bits switch
                {
                    8 => bytes[p] - 128,
                    16 => System.Buffers.Binary.BinaryPrimitives.ReadInt16LittleEndian(bytes[p..]),
                    24 => (bytes[p] | (bytes[p + 1] << 8) | (bytes[p + 2] << 16)) << 8 >> 8,
                    32 => System.Buffers.Binary.BinaryPrimitives.ReadInt32LittleEndian(bytes[p..]),
                    _ => throw new InvalidDataException("无法识别这个音频精度。 ")
                };
                int precision = ValidBits == 0 ? Bits : ValidBits;
                value = (signed >> (Bits - precision)) / (float)(1L << (precision - 1));
            }
            samples[i] = value;
        }
    }

    internal void WriteDecoded(FileStream output, ReadOnlySpan<byte> bytes, float[] scratch)
    {
        var samples = scratch.AsSpan(0, bytes.Length / (Bits / 8));
        Decode(bytes, samples);
        output.Write(MemoryMarshal.AsBytes(samples));
    }
}
