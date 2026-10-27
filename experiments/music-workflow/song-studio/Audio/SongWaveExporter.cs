using System.Buffers.Binary;
using RootSound.PhraseStudio.Persistence;
using RootSound.SongStudio.Core;

namespace RootSound.SongStudio.Audio;
internal static class SongWaveExporter
{
    internal static void Export(SongDocument song, string destination, bool overwrite, CancellationToken token,
        IProgress<int>? progress = null)
    {
        if (song.Clips.Count == 0) throw new InvalidOperationException("先把乐句放到时间线上。 ");
        var source = new SongMixSource(finite: true); source.SetDocument(song, crossfade: false);
        long bytes = checked(source.FrameCount * 6);
        if (bytes > uint.MaxValue - 36) throw new InvalidOperationException("歌曲过长，无法保存为普通 WAV。 ");
        PhraseArchive.AtomicWrite(destination, overwrite, token, stream =>
        {
            byte[] header = new byte[44]; "RIFF"u8.CopyTo(header); "WAVEfmt "u8.CopyTo(header.AsSpan(8));
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(4), (uint)(36 + bytes));
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(16), 16);
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(20), 1);
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(22), 2);
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(24), 48000);
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(28), 48000 * 6);
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(32), 6);
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(34), 24);
            "data"u8.CopyTo(header.AsSpan(36)); BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(40), (uint)bytes);
            stream.Write(header); float[] samples = new float[4096 * 2]; byte[] pcm = new byte[4096 * 6];
            int lastProgress = -1;
            for (long frame = 0; frame < source.FrameCount;)
            {
                token.ThrowIfCancellationRequested();
                int count = source.ReadFrames(frame, samples);
                for (int i = 0; i < count * 2; i++)
                {
                    int value = (int)Math.Clamp(Math.Round(samples[i] * 8388608.0, MidpointRounding.AwayFromZero), -8388608, 8388607);
                    pcm[i * 3] = (byte)value; pcm[i * 3 + 1] = (byte)(value >> 8); pcm[i * 3 + 2] = (byte)(value >> 16);
                }
                stream.Write(pcm, 0, count * 6); frame += count;
                int percent = (int)(frame * 100 / source.FrameCount);
                if (percent != lastProgress) { progress?.Report(percent); lastProgress = percent; }
            }
        });
    }
}
