using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Core;
using RootSound.TimbreLab.Audio;
using RootSound.TimbreLab.Core;

namespace RootSound.ToneProcessor;

internal sealed record CapturedSample(PcmClip Clip, string SourcePath, FileIdentity? SourceIdentity);
internal static class SampleCapture
{
    internal static CapturedSample Create(ClipSource clip, EqKernel kernel, long first, long last,
        ImportedAudio original, IProgress<AudioProgress>? progress, CancellationToken token)
    {
        if (first < 0 || last > clip.FrameCount || first >= last) throw new ArgumentException("请用蓝线选中一段声音。");
        long frames = last - first;
        ImportBridge.ValidateFormat(clip.SampleRate, clip.Channels, frames);
        token.ThrowIfCancellationRequested();
        // Process before taking the region, matching audition's FIR history at the left blue line.
        IAudioFrameSource selected = new ClipSource(new EqSource(clip, kernel), first, frames);
        float[] samples = new float[checked((int)(frames * clip.Channels))];
        const int chunk = 8192;
        for (long done = 0; done < frames;)
        {
            token.ThrowIfCancellationRequested();
            int take = (int)Math.Min(chunk, frames - done);
            if (selected.ReadFrames(done, samples.AsSpan(checked((int)(done * clip.Channels)), take * clip.Channels)) != take)
                throw new EndOfStreamException("截取的音频不完整，请重试。");
            done += take;
            progress?.Report(new AudioProgress(Math.Min(.999, done / (double)frames), "正在加入采样栏…"));
        }
        token.ThrowIfCancellationRequested();
        string name = Path.GetFileNameWithoutExtension(original.FileName);
        if (name.Length > 70) name = name[..70];
        double start = (clip.Offset + first) / (double)clip.SampleRate, end = (clip.Offset + last) / (double)clip.SampleRate;
        name += $" [{start:0.000}–{end:0.000}s]";
        return new(new PcmClip(clip.SampleRate, clip.Channels, samples, name), original.SourcePath, original.SourceIdentity);
    }
}
