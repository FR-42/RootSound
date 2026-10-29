using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Core;

namespace RootSound.ToneProcessor;

internal static class WavExport
{
    internal static void Write(IAudioFrameSource source, ImportedAudio original, string destination,
        IProgress<AudioProgress>? progress = null, CancellationToken token = default)
    {
        destination = Path.GetFullPath(destination);
        if (string.Equals(destination, original.SourcePath, StringComparison.OrdinalIgnoreCase))
            throw new IOException("请使用新的文件名，不能覆盖导入的原始音频。");
        FileIdentity.ProtectOriginal(original, destination);
        string staging = Path.Combine(Path.GetDirectoryName(destination)!, ".rootsound-tone-" + Guid.NewGuid().ToString("N") + ".tmp");
        try
        {
            using (var output = new FileStream(staging, FileMode.CreateNew, FileAccess.Write, FileShare.None, 262144))
            {
                output.Write(AudioExporter.BuildHeader(source.SampleRate, source.Channels, source.FrameCount, original.ChannelMask));
                int chunk = Math.Max(1, 65536 / source.Channels);
                float[] samples = new float[chunk * source.Channels]; byte[] pcm = new byte[samples.Length * 3];
                for (long position = 0; position < source.FrameCount;)
                {
                    token.ThrowIfCancellationRequested();
                    int take = (int)Math.Min(chunk, source.FrameCount - position);
                    var data = samples.AsSpan(0, take * source.Channels);
                    if (source.ReadFrames(position, data) != take) throw new EndOfStreamException("音频内容不完整。");
                    AudioExporter.EncodePcm24(data, pcm); output.Write(pcm, 0, data.Length * 3); position += take;
                    progress?.Report(new AudioProgress(Math.Min(.999, position / (double)source.FrameCount), "正在导出 WAV…"));
                }
                if ((source.FrameCount * source.Channels * 3 & 1) != 0) output.WriteByte(0);
                output.Flush(true);
            }
            token.ThrowIfCancellationRequested();
            FileIdentity.ProtectOriginal(original, destination);
            if (File.Exists(destination)) File.Replace(staging, destination, null, true);
            else File.Move(staging, destination, false);
            progress?.Report(new AudioProgress(1, "导出完成"));
        }
        finally { try { File.Delete(staging); } catch (IOException) { } catch (UnauthorizedAccessException) { } }
    }
}
