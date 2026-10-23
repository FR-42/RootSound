using System.Buffers.Binary;
using System.IO.Compression;
using System.Text;
using System.Text.Json.Nodes;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;

namespace RootSound.TimbreLab.Tests;

internal static class InstrumentChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory);
        int groups = 0;
        var tone = Sine(48000, 1, 1.6, 440);
        var basic = new InstrumentSettings(69, .01, .04, 1, .08);
        var patch = new InstrumentPatch(tone, basic, "测试音色");

        var root = InstrumentRenderer.Render(patch, 69, .6);
        Near(Frequency(root, .1, .5), 440, 3, "根音试听应保留原音高");
        var octave = InstrumentRenderer.Render(patch, 81, .4);
        Near(Frequency(octave, .08, .3), 880, 5, "高八度应为两倍频率");
        groups++;

        double fractionalRoot = 69.31;
        var detuned = new InstrumentPatch(Sine(48000, 1, 1.6, 440 * Math.Pow(2, .31 / 12)), basic with { RootMidi = fractionalRoot }, "校准");
        var tuned = InstrumentRenderer.Render(detuned, 69, .5);
        Near(Frequency(tuned, .08, .4), 440, 4, "小数根音应准确校准");
        groups++;

        var envelope = InstrumentRenderer.Render(patch with { Settings = basic with { AttackSeconds = .2, DecaySeconds = .1, Sustain = .3, ReleaseSeconds = .2 } }, 69, .6);
        Check(Rms(envelope, .02, .05) < Rms(envelope, .17, .19) * .4, "渐入应逐渐增强");
        Check(Rms(envelope, .4, .5) < Rms(envelope, .17, .19) * .5, "衰减后应到达保持音量");
        Check(Rms(envelope, .75, .78) < Rms(envelope, .61, .64) * .25, "释放应逐渐衰减");
        Check(envelope.Samples[0] == 0 && Math.Abs(envelope.Samples[^1]) < 1e-8, "首尾应消除点击");
        groups++;

        var loop = LoopFinder.Find(tone, 69) ?? throw new Exception("稳定正弦应找到循环");
        Check(loop.Start > 0 && loop.End <= tone.FrameCount && loop.End > loop.Start && loop.Score > .95, "循环应位于源采样内且连续");
        var loopSettings = basic with { LoopEnabled = true, LoopStart = loop.Start, LoopEnd = loop.End, LoopCrossfadeSeconds = loop.CrossfadeSeconds };
        var longNote = InstrumentRenderer.Render(patch with { Settings = loopSettings }, 69, 3);
        Check(Rms(longNote, 2.5, 2.8) > .1, "循环应在源采样结束后继续发声");
        double largestStep = 0;
        for (int i = 24000; i < 140000; i++) largestStep = Math.Max(largestStep, Math.Abs(longNote.Samples[i] - longNote.Samples[i - 1]));
        Check(largestStep < .12, "循环接缝不应出现大的波形跳变");
        var lowTone = Sine(48000, 1, 1.6, 220);
        var lowLoop = LoopFinder.Find(lowTone, 57) ?? throw new Exception("低音稳定正弦应找到循环");
        var lowSettings = basic with { RootMidi = 57, LoopEnabled = true, LoopStart = lowLoop.Start, LoopEnd = lowLoop.End, LoopCrossfadeSeconds = lowLoop.CrossfadeSeconds };
        var lowLooped = InstrumentRenderer.Render(new InstrumentPatch(lowTone, lowSettings, "低音循环"), 57, 3);
        double overlapStart = lowLoop.End / 48000.0 - lowLoop.CrossfadeSeconds;
        double levelBefore = Rms(lowLooped, overlapStart - .05, overlapStart - .02);
        double levelDuring = Rms(lowLooped, overlapStart + lowLoop.CrossfadeSeconds * .25, overlapStart + lowLoop.CrossfadeSeconds * .75);
        Check(levelDuring > levelBefore * .82, "自动循环的交叠不能因为反相抵消而吞掉持续低音");
        groups++;

        var nonloop = InstrumentRenderer.Render(new InstrumentPatch(Sine(48000, 1, .2, 440), basic, "短音"), 69, 1);
        Check(Rms(nonloop, .3, .8) == 0, "未循环采样结束后应静音");
        var zeroEnvelope = InstrumentRenderer.Render(patch with { Settings = basic with { AttackSeconds = 0, ReleaseSeconds = 0 } }, 69, .2);
        Check(zeroEnvelope.Samples[0] == 0 && Math.Abs(zeroEnvelope.Samples[^1]) < 1e-8, "零包络仍应防止首尾点击");
        groups++;

        var stereo = Sine(48000, 2, 1, 440);
        for (int i = 0; i < stereo.Samples.Length; i += 2) stereo.Samples[i + 1] = -stereo.Samples[i];
        var stereoRendered = InstrumentRenderer.Render(new InstrumentPatch(stereo, basic, "反相双声道"), 69, .3);
        Check(stereoRendered.Channels == 2 && Rms(stereoRendered, .05, .2) > .1, "双声道不能因反相而丢失");
        for (int i = 1000; i < 5000; i += 2) Near(stereoRendered.Samples[i] + stereoRendered.Samples[i + 1], 0, 1e-7, "应保留声道相位");
        Check(LoopFinder.Find(stereo, 69) is not null, "反相双声道也应可寻找循环");
        groups++;

        Check(LoopFinder.Find(new PcmClip(48000, 1, new float[48000], "静音"), 69) is null, "静音不应虚构循环");
        Check(LoopFinder.Find(new PcmClip(48000, 1, Enumerable.Repeat(.2f, 48000).ToArray(), "直流"), 69) is null, "直流不应虚构循环");
        Check(LoopFinder.Find(Sine(48000, 1, .05, 440), 69) is null, "极短采样应保守地跳过循环");
        groups++;

        Throws<InvalidDataException>(() => InstrumentRenderer.Render(patch with { Settings = basic with { LoopEnabled = true, LoopStart = 90, LoopEnd = 80 } }, 69, .2));
        Throws<InvalidDataException>(() => InstrumentRenderer.Render(patch with { Settings = basic with { RootMidi = double.NaN } }, 69, .2));
        Throws<ArgumentOutOfRangeException>(() => InstrumentRenderer.Render(patch, 69, double.NaN));
        Throws<ArgumentOutOfRangeException>(() => InstrumentRenderer.Render(patch, 69, 11));
        using (var cancelled = new CancellationTokenSource())
        {
            cancelled.Cancel();
            Throws<OperationCanceledException>(() => InstrumentRenderer.Render(patch, 69, 1, cancelled.Token));
            Throws<OperationCanceledException>(() => LoopFinder.Find(tone, 69, cancelled.Token));
        }
        groups++;

        string archive = Path.Combine(directory, "测试音色.rstimbre");
        var portable = new InstrumentPatch(tone, loopSettings with { RootMidi = 69.123, GainDb = -3.5 }, "可编辑音色");
        TimbreArchive.ExportAsync(portable, archive).GetAwaiter().GetResult();
        var restored = TimbreArchive.ImportAsync(archive).GetAwaiter().GetResult();
        Check(restored.Name == portable.Name && restored.Settings == portable.Settings && restored.Audio.SampleRate == tone.SampleRate &&
            restored.Audio.Channels == tone.Channels && restored.Audio.Samples.SequenceEqual(tone.Samples), "音色包应无损往返保留全部设置和采样");
        groups++;

        string wave = Path.Combine(directory, "精修采样.wav");
        PcmWaveExporter.ExportAsync(stereo, wave).GetAwaiter().GetResult();
        byte[] wav = File.ReadAllBytes(wave);
        Check(Encoding.ASCII.GetString(wav, 0, 4) == "RIFF" && Encoding.ASCII.GetString(wav, 8, 4) == "WAVE", "应输出 WAV");
        Check(BinaryPrimitives.ReadUInt16LittleEndian(wav.AsSpan(22)) == 2 && BinaryPrimitives.ReadUInt16LittleEndian(wav.AsSpan(34)) == 24 &&
            BinaryPrimitives.ReadUInt32LittleEndian(wav.AsSpan(24)) == 48000 && BinaryPrimitives.ReadUInt32LittleEndian(wav.AsSpan(64)) == stereo.Samples.Length * 3,
            "WAV 应保留声道、采样率和 24 位原调采样");
        Check(wav.Length == 68 + stereo.Samples.Length * 3, "WAV 数据长度应精确");
        groups++;

        byte[] originalArchive = File.ReadAllBytes(archive), originalWave = File.ReadAllBytes(wave);
        Throws<IOException>(() => TimbreArchive.ExportAsync(portable, archive).GetAwaiter().GetResult());
        Throws<IOException>(() => PcmWaveExporter.ExportAsync(stereo, wave).GetAwaiter().GetResult());
        using (var cancelled = new CancellationTokenSource())
        {
            cancelled.Cancel();
            Throws<OperationCanceledException>(() => TimbreArchive.ExportAsync(portable, archive, true, cancelled.Token).GetAwaiter().GetResult());
            Throws<OperationCanceledException>(() => PcmWaveExporter.ExportAsync(stereo, wave, true, cancelled.Token).GetAwaiter().GetResult());
        }
        Check(File.ReadAllBytes(archive).SequenceEqual(originalArchive) && File.ReadAllBytes(wave).SequenceEqual(originalWave), "失败或取消不得损坏已有导出");
        Check(!Directory.GetFiles(directory, ".rootsound-timbre-*.tmp").Any(), "不应遗留暂存文件");
        groups++;

        string corrupt = Path.Combine(directory, "校验损坏.rstimbre");
        RewriteArchive(archive, corrupt, null, data => data[0] ^= 1);
        Throws<InvalidDataException>(() => TimbreArchive.ImportAsync(corrupt).GetAwaiter().GetResult());
        string badVersion = Path.Combine(directory, "未知版本.rstimbre");
        RewriteArchive(archive, badVersion, manifest => manifest["Version"] = 500, null);
        Throws<InvalidDataException>(() => TimbreArchive.ImportAsync(badVersion).GetAwaiter().GetResult());
        groups++;

        string oversized = Path.Combine(directory, "过大参数.rstimbre");
        RewriteArchive(archive, oversized, manifest => manifest["Frames"] = long.MaxValue, null);
        Throws<InvalidDataException>(() => TimbreArchive.ImportAsync(oversized).GetAwaiter().GetResult());
        string invalidLoop = Path.Combine(directory, "无效循环.rstimbre");
        RewriteArchive(archive, invalidLoop, manifest => manifest["Settings"]!["LoopEnd"] = long.MaxValue, null);
        Throws<InvalidDataException>(() => TimbreArchive.ImportAsync(invalidLoop).GetAwaiter().GetResult());
        groups++;

        string traversal = Path.Combine(directory, "额外条目.rstimbre");
        File.Copy(archive, traversal, true);
        using (var zip = ZipFile.Open(traversal, ZipArchiveMode.Update))
        using (var extra = zip.CreateEntry("../outside.txt").Open()) extra.WriteByte(1);
        Throws<InvalidDataException>(() => TimbreArchive.ImportAsync(traversal).GetAwaiter().GetResult());
        string duplicate = Path.Combine(directory, "重复条目.rstimbre");
        File.Copy(archive, duplicate, true);
        using (var zip = ZipFile.Open(duplicate, ZipArchiveMode.Update))
        using (var extra = zip.CreateEntry("manifest.json").Open()) extra.WriteByte(1);
        Throws<InvalidDataException>(() => TimbreArchive.ImportAsync(duplicate).GetAwaiter().GetResult());
        groups++;

        string validAgain = Path.Combine(directory, "替换.rstimbre");
        File.WriteAllText(validAgain, "old");
        TimbreArchive.ExportAsync(portable, validAgain, true).GetAwaiter().GetResult();
        Check(TimbreArchive.ImportAsync(validAgain).GetAwaiter().GetResult().Audio.Samples.SequenceEqual(tone.Samples), "已确认覆盖应原子替换为完整新音色");
        var invalidAudio = new PcmClip(48000, 1, new[] { float.NaN }, "坏音频");
        Throws<InvalidDataException>(() => PcmWaveExporter.ExportAsync(invalidAudio, wave, true).GetAwaiter().GetResult());
        Check(File.ReadAllBytes(wave).SequenceEqual(originalWave), "非法音频不得覆盖现有文件");
        groups++;

        string partial = Path.Combine(directory, "中途取消.bin");
        File.WriteAllText(partial, "preserve existing");
        using (var cancelled = new CancellationTokenSource())
        {
            Throws<OperationCanceledException>(() => AtomicFile.Write(partial, true, cancelled.Token, stream =>
            {
                stream.Write(new byte[20000]);
                cancelled.Cancel();
            }));
        }
        Check(File.ReadAllText(partial) == "preserve existing" && !Directory.GetFiles(directory, ".rootsound-timbre-*.tmp").Any(),
            "写入已经开始后的取消仍应保留旧文件并清理暂存");
        groups++;
        return groups;
    }

    private static PcmClip Sine(int sampleRate, int channels, double seconds, double hertz)
    {
        int frames = (int)(sampleRate * seconds);
        float[] samples = new float[frames * channels];
        for (int i = 0; i < frames; i++)
            for (int channel = 0; channel < channels; channel++)
                samples[i * channels + channel] = (float)(.45 * Math.Sin(2 * Math.PI * hertz * i / sampleRate));
        return new PcmClip(sampleRate, channels, samples, "正弦");
    }

    private static double Frequency(PcmClip audio, double from, double to)
    {
        int crossings = 0, first = -1, last = -1;
        for (int frame = (int)(from * audio.SampleRate) + 1; frame < to * audio.SampleRate; frame++)
            if (audio.Samples[(frame - 1) * audio.Channels] <= 0 && audio.Samples[frame * audio.Channels] > 0)
            { crossings++; if (first < 0) first = frame; last = frame; }
        return (crossings - 1) * audio.SampleRate / (double)(last - first);
    }

    private static double Rms(PcmClip audio, double from, double to)
    {
        double sum = 0; int count = 0;
        for (int frame = (int)(from * audio.SampleRate); frame < Math.Min(audio.FrameCount, to * audio.SampleRate); frame++)
            for (int channel = 0; channel < audio.Channels; channel++)
            { double value = audio.Samples[frame * audio.Channels + channel]; sum += value * value; count++; }
        return Math.Sqrt(sum / Math.Max(1, count));
    }

    private static void RewriteArchive(string source, string destination, Action<JsonNode>? changeManifest, Action<byte[]>? changeAudio)
    {
        using var original = ZipFile.OpenRead(source);
        using var output = ZipFile.Open(destination, ZipArchiveMode.Create);
        foreach (var entry in original.Entries)
        {
            using var memory = new MemoryStream();
            using (var stream = entry.Open()) stream.CopyTo(memory);
            byte[] data = memory.ToArray();
            if (entry.FullName == "manifest.json" && changeManifest is not null)
            {
                JsonNode node = JsonNode.Parse(data)!;
                changeManifest(node);
                data = Encoding.UTF8.GetBytes(node.ToJsonString());
            }
            if (entry.FullName == "audio.f32") changeAudio?.Invoke(data);
            using var target = output.CreateEntry(entry.FullName).Open();
            target.Write(data);
        }
    }

    private static void Check(bool condition, string message) { if (!condition) throw new Exception(message); }
    private static void Near(double actual, double expected, double tolerance, string message) => Check(Math.Abs(actual - expected) <= tolerance, message + $" ({actual} vs {expected})");
    private static void Throws<T>(Action action) where T : Exception
    { try { action(); } catch (T) { return; } throw new Exception("Expected " + typeof(T).Name); }
}
