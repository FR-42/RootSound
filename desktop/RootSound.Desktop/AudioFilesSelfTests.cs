using System.Buffers.Binary;
using System.Text;

namespace RootSound.Desktop;

/// <summary>Real byte validation and disk replacement tests under a dedicated test directory.</summary>
internal static class AudioFilesSelfTests
{
    public static int Run(string testDir)
    {
        var root = Path.Combine(Path.GetFullPath(testDir), "audio-files-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);
        int completed = 0;
        void Case(string name, Action<string> test)
        {
            var directory = Path.Combine(root, name);
            Directory.CreateDirectory(directory);
            test(directory);
            completed++;
        }

        Case("base64-and-pcm-bytes", _ =>
        {
            var bytes = Wave();
            var decoded = NativeAudioFiles.DecodePayload(Convert.ToBase64String(bytes));
            Check(bytes.SequenceEqual(decoded), "Base64 传输必须保持每一个 PCM 字节。");
            ExpectFailure(() => NativeAudioFiles.DecodePayload("bad_base64"), "损坏的传输内容不能被当成音频保存。");
        });
        Case("strict-wave-header", _ =>
        {
            foreach (uint sampleRate in new uint[] { 44100, 48000, 96000 }) NativeAudioFiles.ValidateWave(Wave(sampleRate));
            foreach (int offset in new int[] { 0, 4, 8, 12, 16, 20, 22, 24, 28, 32, 34, 36, 40 })
            {
                var invalid = Wave();
                invalid[offset] ^= 1;
                ExpectFailure(() => NativeAudioFiles.ValidateWave(invalid), "无效的 WAV 标记与尺寸必须被拒绝。");
            }
            ExpectFailure(() => NativeAudioFiles.ValidateWave(new byte[44]), "没有采样的 WAV 不能保存。");
        });
        Case("new-replace-and-backup", directory =>
        {
            var path = Path.Combine(directory, "雨后的光 🌧.wav");
            var first = Wave();
            NativeAudioFiles.WriteAtomic(path, first);
            Check(File.ReadAllBytes(path).SequenceEqual(first), "新音频应按原字节落盘。");
            var second = Wave(); second[44] = 17;
            NativeAudioFiles.WriteAtomic(path, second);
            Check(File.ReadAllBytes(path).SequenceEqual(second), "替换应保存新版。");
            Check(File.ReadAllBytes(path + ".bak").SequenceEqual(first), "替换应保留上一版音频。");
            NativeAudioFiles.WriteAtomic(path, first);
            Check(File.ReadAllBytes(path + ".bak").SequenceEqual(second), "反复保存时备份应保持上一版。");
            var candidates = Enumerable.Range(0, 12).Select(index => { var bytes = Wave(); bytes[44] = (byte)index; return bytes; }).ToArray();
            int successful = 0;
            Parallel.ForEach(candidates, bytes =>
            {
                try { NativeAudioFiles.WriteAtomic(path, bytes); Interlocked.Increment(ref successful); }
                catch (IOException) { /* Concurrent replacement may explicitly reject one writer. */ }
                catch (UnauthorizedAccessException) { /* It must still leave a complete version. */ }
            });
            Check(successful > 0, "并发输出中至少应有一个完整写入成功。");
            Check(candidates.Any(bytes => bytes.SequenceEqual(File.ReadAllBytes(path))), "并发替换只能留下完整版本，不能混合音频字节。");
            NativeAudioFiles.ValidateWave(File.ReadAllBytes(path + ".bak"));
            Check(Directory.GetFiles(directory, "*.tmp").Length == 0, "完成后不应遗留候选文件。");
            Check(Directory.GetFiles(directory, "*.rootsound-save.lock").Length == 0, "完成后应释放临时输出锁。");
        });
        Case("locked-target-preserved", directory =>
        {
            var path = Path.Combine(directory, "锁定的音乐.wav");
            var before = Wave(); NativeAudioFiles.WriteAtomic(path, before);
            using (var locked = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read))
                ExpectFailure(() => NativeAudioFiles.WriteAtomic(path, Wave(44100)), "被占用文件的替换失败必须明确返回。");
            Check(File.ReadAllBytes(path).SequenceEqual(before), "替换失败不能删除旧音频。");
            Check(Directory.GetFiles(directory, "*.tmp").Length == 0, "失败后应清理候选文件。");
            string lockPath = path + ".rootsound-save.lock";
            File.WriteAllText(lockPath, "另一个保存任务的记录");
            ExpectFailure(() => NativeAudioFiles.WriteAtomic(path, Wave(96000)), "存在未知输出锁时不能并行写入。");
            Check(File.ReadAllText(lockPath) == "另一个保存任务的记录", "不能接管或删除既有输出锁。");
            Check(File.ReadAllBytes(path).SequenceEqual(before), "输出锁冲突必须保留原音频。");
        });
        Case("backup-path-is-directory", directory =>
        {
            var path = Path.Combine(directory, "我的音乐.wav"); var before = Wave();
            NativeAudioFiles.WriteAtomic(path, before);
            Directory.CreateDirectory(path + ".bak");
            File.WriteAllText(Path.Combine(path + ".bak", "keep.txt"), "保留此目录");
            ExpectFailure(() => NativeAudioFiles.WriteAtomic(path, Wave(96000)), "不能替换备份目录时应明确失败。");
            Check(File.ReadAllBytes(path).SequenceEqual(before), "备份失败必须保留原音频。");
            Check(File.ReadAllText(Path.Combine(path + ".bak", "keep.txt")) == "保留此目录", "不能删除既有目录。");
        });
        Case("extension-and-invalid-content-preserved", directory =>
        {
            var path = Path.Combine(directory, "materials.json");
            File.WriteAllText(path, "保留工程库");
            ExpectFailure(() => NativeAudioFiles.WriteAtomic(path, Wave()), "音频导出不能覆盖工程 JSON 文件。");
            Check(File.ReadAllText(path) == "保留工程库", "后缀错误时不能改写旧文件。");
            var audio = Path.Combine(directory, "安全.wav"); var before = Wave();
            NativeAudioFiles.WriteAtomic(audio, before);
            ExpectFailure(() => NativeAudioFiles.WriteAtomic(audio, Encoding.UTF8.GetBytes("这不是音频")), "坏音频不能覆盖原件。");
            Check(File.ReadAllBytes(audio).SequenceEqual(before), "坏音频必须被拒绝在写入之前。");
        });
        Case("target-is-directory", directory =>
        {
            var path = Path.Combine(directory, "这是一份目录.wav");
            Directory.CreateDirectory(path);
            File.WriteAllText(Path.Combine(path, "keep.txt"), "仍然保留");
            ExpectFailure(() => NativeAudioFiles.WriteAtomic(path, Wave()), "不能把目录覆盖成音频。");
            Check(File.ReadAllText(Path.Combine(path, "keep.txt")) == "仍然保留", "不能修改原目录。");
            Check(Directory.GetFiles(directory, "*.tmp").Length == 0, "目标异常时不应遗留候选文件。");
        });
        return completed;
    }

    private static byte[] Wave(uint rate = 48000)
    {
        var bytes = new byte[50];
        void Label(int at, string label) => Encoding.ASCII.GetBytes(label).CopyTo(bytes, at);
        void U32(int at, uint value) => BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(at, 4), value);
        void U16(int at, ushort value) => BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(at, 2), value);
        Label(0, "RIFF"); U32(4, 42); Label(8, "WAVE"); Label(12, "fmt "); U32(16, 16);
        U16(20, 1); U16(22, 2); U32(24, rate); U32(28, rate * 6); U16(32, 6); U16(34, 24);
        Label(36, "data"); U32(40, 6); bytes[46] = 64; bytes[49] = 192;
        return bytes;
    }
    private static void Check(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException("音频文件自测失败：" + message);
    }
    private static void ExpectFailure(Action action, string message)
    {
        try { action(); }
        catch (IOException) { return; }
        catch (UnauthorizedAccessException) { return; }
        catch (FormatException) { return; }
        throw new InvalidOperationException("音频文件自测失败：" + message);
    }
}
