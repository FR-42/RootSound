using System.Text;
using System.Text.Json;

namespace RootSound.Desktop;

/// <summary>Project transfer boundary tests use disk files only, never dialogs or windows.</summary>
internal static class ProjectFilesSelfTests
{
    public static int Run(string testDir)
    {
        var root = Path.Combine(Path.GetFullPath(testDir), "project-files-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root); int completed = 0;
        void Case(string name, Action<string> test)
        {
            var directory = Path.Combine(root, name); Directory.CreateDirectory(directory); test(directory); completed++;
        }
        Case("utf8-bom-and-opaque-music", directory =>
        {
            var text = Project("雨后的琴声 🌧", "{\"future-musical-body\":{\"不由平台解释\":true}}");
            Check(NativeProjectFiles.ValidateText(text) == text, "平台必须保留全部工程正文。");
            var path = Path.Combine(directory, "中文工程.rsproject");
            File.WriteAllText(path, text, new UTF8Encoding(true));
            Check(NativeProjectFiles.ReadProject(path) == text, "UTF-8 BOM 应能读取，不能成为 JSON 正文。");
            NativeProjectFiles.WriteAtomic(path, text);
            Check(!File.ReadAllBytes(path).Take(3).SequenceEqual(new byte[] { 0xef, 0xbb, 0xbf }), "写入工程不应添加 BOM。");
        });
        Case("new-replace-and-backup", directory =>
        {
            var path = Path.Combine(directory, "清晨 🌤.rsproject"); var first = Project("第一版"); var second = Project("第二版");
            NativeProjectFiles.WriteAtomic(path, first); Check(NativeProjectFiles.ReadProject(path) == first, "新工程应完整落盘。");
            NativeProjectFiles.WriteAtomic(path, second); Check(NativeProjectFiles.ReadProject(path) == second, "替换应保存新工程。");
            Check(File.ReadAllText(path + ".bak") == first, "备份应保留被替换版本。");
            NativeProjectFiles.WriteAtomic(path, first); Check(File.ReadAllText(path + ".bak") == second, "连续保存应留下上一版。");
            Clean(directory);
        });
        Case("strict-envelope-preserves-old-file", directory =>
        {
            var path = Path.Combine(directory, "安全.rsproject"); var good = Project("原始工程"); NativeProjectFiles.WriteAtomic(path, good);
            foreach (var invalid in new[] { "", "{", "null", "[]", "{}", "{\"format\":\"RootSoundSound\",\"version\":1}", "{\"format\":\"RootSoundProject\",\"version\":3}" })
            {
                ExpectFailure(() => NativeProjectFiles.WriteAtomic(path, invalid), "不可识别的封装不能覆盖工程。");
                Check(NativeProjectFiles.ReadProject(path) == good, "坏封装必须被拒绝在写入前。");
            }
            Clean(directory);
        });
        Case("v2-members-exact-roundtrip", directory =>
        {
            var path = Path.Combine(directory, "完整工程 🌧.rsproject"); var old = Project("旧格式");
            var text = "{\"format\":\"RootSoundProject\",\"version\":2,\"rootId\":\"歌曲\",\"memberIds\":[\"未编排乐句\",\"音色\"],\"contents\":[{\"保留原文\":\"🌧\\n素材由所属模块验证\"}]}";
            Check(NativeProjectFiles.ValidateText(text) == text, "平台必须接受版本 2，并把成员和音乐内容交由材料模块验证。");
            NativeProjectFiles.WriteAtomic(path, old); NativeProjectFiles.WriteAtomic(path, text);
            Check(NativeProjectFiles.ReadProject(path) == text, "版本 2 的显式成员工程必须原文读回。");
            Check(File.ReadAllText(path + ".bak") == old, "版本 2 替换仍须保留版本 1 备份。");
            File.WriteAllText(path, text, new UTF8Encoding(true));
            Check(NativeProjectFiles.ReadProject(path) == text, "带 BOM 的版本 2 也必须原文读回。");
            Clean(directory);
        });
        Case("unsupported-version-preserves-v2", directory =>
        {
            var path = Path.Combine(directory, "安全成员工程.rsproject");
            var good = "{\"format\":\"RootSoundProject\",\"version\":2,\"rootId\":\"歌曲\",\"memberIds\":[],\"contents\":[]}";
            NativeProjectFiles.WriteAtomic(path, Project("原备份")); NativeProjectFiles.WriteAtomic(path, good);
            var backup = File.ReadAllBytes(path + ".bak");
            foreach (var version in new[] { "0", "3", "1.5", "-1", "\"2\"", "null", "true" })
            {
                var invalid = "{\"format\":\"RootSoundProject\",\"version\":" + version + "}";
                ExpectFailure(() => NativeProjectFiles.WriteAtomic(path, invalid), "未知或非数字版本不能覆盖版本 2。");
                Check(NativeProjectFiles.ReadProject(path) == good, "错误版本须保留现有版本 2 原件。");
                Check(File.ReadAllBytes(path + ".bak").SequenceEqual(backup), "错误版本不能改写已有备份。");
                var input = Path.Combine(directory, "错误输入.rsproject"); File.WriteAllText(input, invalid, new UTF8Encoding(false, true));
                var evidence = File.ReadAllBytes(input);
                ExpectFailure(() => NativeProjectFiles.ReadProject(input), "读取也必须拒绝不支持的版本。");
                Check(File.ReadAllBytes(input).SequenceEqual(evidence), "读取拒绝须保留错误文件原字节。");
            }
            Clean(directory);
        });
        Case("invalid-unicode-and-utf8", directory =>
        {
            var path = Path.Combine(directory, "原文件.rsproject"); var good = Project("保留原件"); NativeProjectFiles.WriteAtomic(path, good);
            ExpectFailure(() => NativeProjectFiles.WriteAtomic(path, "{\"format\":\"RootSoundProject\",\"version\":1,\"bad\":\"\ud800\"}"), "不能静默替换无效 Unicode。");
            Check(NativeProjectFiles.ReadProject(path) == good, "无效 Unicode 不能改变原文件。");
            var damaged = Path.Combine(directory, "不合法UTF8.rsproject"); byte[] bytes = [0x7b, 0xc3, 0x28, 0x7d]; File.WriteAllBytes(damaged, bytes);
            ExpectFailure(() => NativeProjectFiles.ReadProject(damaged), "无效 UTF-8 必须明确拒绝。");
            Check(File.ReadAllBytes(damaged).SequenceEqual(bytes), "读取损坏文件不能修改证据。");
        });
        Case("byte-limit-before-read-or-write", directory =>
        {
            var path = Path.Combine(directory, "大小检查.rsproject"); var good = Project("仍然安全"); NativeProjectFiles.WriteAtomic(path, good);
            var oversized = Project(new string('声', NativeProjectFiles.MaximumBytes / 3 + 1));
            Check(oversized.Length < NativeProjectFiles.MaximumBytes, "边界测试应区分字符数与 UTF-8 字节数。");
            ExpectFailure(() => NativeProjectFiles.WriteAtomic(path, oversized), "按字节超限时不得保存。");
            Check(NativeProjectFiles.ReadProject(path) == good, "超限写入必须保留原工程。");
            var large = Path.Combine(directory, "超大.rsproject"); using (var stream = File.Create(large)) stream.SetLength(NativeProjectFiles.MaximumBytes + 1L);
            ExpectFailure(() => NativeProjectFiles.ReadProject(large), "读取前应检查磁盘文件大小。"); Clean(directory);
        });
        Case("locked-target-and-backup-preserved", directory =>
        {
            var path = Path.Combine(directory, "被占用.rsproject"); var first = Project("第一版"); var second = Project("第二版");
            NativeProjectFiles.WriteAtomic(path, first); NativeProjectFiles.WriteAtomic(path, second);
            using (var locked = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read))
                ExpectFailure(() => NativeProjectFiles.WriteAtomic(path, Project("不能保存")), "占用中的工程应明确失败。");
            Check(NativeProjectFiles.ReadProject(path) == second, "失败必须保留当前版本。");
            Check(File.ReadAllText(path + ".bak") == first, "失败必须保留已有备份。"); Clean(directory);
        });
        Case("directories-are-not-output-files", directory =>
        {
            var path = Path.Combine(directory, "目录.rsproject"); Directory.CreateDirectory(path); File.WriteAllText(Path.Combine(path, "keep.txt"), "保留目录");
            ExpectFailure(() => NativeProjectFiles.WriteAtomic(path, Project("失败")), "工程输出不能替换目录。");
            Check(File.ReadAllText(Path.Combine(path, "keep.txt")) == "保留目录", "目标目录不能被删除。");
            var normal = Path.Combine(directory, "工程.rsproject"); var before = Project("原版"); NativeProjectFiles.WriteAtomic(normal, before);
            Directory.CreateDirectory(normal + ".bak"); File.WriteAllText(Path.Combine(normal + ".bak", "keep.txt"), "保留备份目录");
            ExpectFailure(() => NativeProjectFiles.WriteAtomic(normal, Project("新版")), "备份路径是目录时必须明确失败。");
            Check(NativeProjectFiles.ReadProject(normal) == before, "备份失败应保留原件。");
            Check(File.ReadAllText(Path.Combine(normal + ".bak", "keep.txt")) == "保留备份目录", "不能破坏备份目录。"); Clean(directory);
        });
        Case("extension-and-unknown-lock-preserved", directory =>
        {
            var path = Path.Combine(directory, "materials.json"); File.WriteAllText(path, "现有素材库");
            ExpectFailure(() => NativeProjectFiles.WriteAtomic(path, Project("工程")), "工程保存不能覆盖其他后缀。");
            Check(File.ReadAllText(path) == "现有素材库", "错误后缀必须保持原文件。");
            var project = Path.Combine(directory, "工程.rsproject"); var before = Project("旧版"); NativeProjectFiles.WriteAtomic(project, before);
            var lockPath = project + ".rootsound-save.lock"; File.WriteAllText(lockPath, "另一个保存任务");
            ExpectFailure(() => NativeProjectFiles.WriteAtomic(project, Project("新版")), "未知输出锁不能接管。");
            Check(File.ReadAllText(lockPath) == "另一个保存任务", "未知锁不能删除。");
            Check(NativeProjectFiles.ReadProject(project) == before, "锁冲突不能覆盖工程。");
        });
        Case("concurrent-complete-versions", directory =>
        {
            var path = Path.Combine(directory, "并发.rsproject"); NativeProjectFiles.WriteAtomic(path, Project("初始"));
            var candidates = Enumerable.Range(0, 12).Select(index => Project("版本" + index)).ToArray(); int successful = 0;
            Parallel.ForEach(candidates, text =>
            {
                try { NativeProjectFiles.WriteAtomic(path, text); Interlocked.Increment(ref successful); }
                catch (IOException) { }
                catch (UnauthorizedAccessException) { }
            });
            Check(successful > 0, "至少一个并发工程保存应成功。");
            Check(candidates.Contains(NativeProjectFiles.ReadProject(path)), "并发不能混合不同版本。");
            _ = NativeProjectFiles.ReadProject(path + ".bak"); Clean(directory);
        });
        Case("reentry-rejected-without-opening-ui", _ =>
        {
            var files = new NativeProjectFiles(null!);
            typeof(NativeProjectFiles).GetField("operating", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic)!.SetValue(files, 1);
            using var opened = JsonDocument.Parse(files.Open()); using var saved = JsonDocument.Parse(files.Save(Project("不会显示"), "工程.rsproject"));
            Check(opened.RootElement.GetProperty("status").GetString() == "error", "重复打开必须拒绝在调用界面之前。");
            Check(saved.RootElement.GetProperty("status").GetString() == "error", "重复保存必须拒绝在调用界面之前。");
        });
        return completed;
    }

    private static string Project(string name, string opaque = "{}") => "{\"format\":\"RootSoundProject\",\"version\":1,\"name\":"
        + JsonSerializer.Serialize(name, new JsonSerializerOptions { Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping }) + ",\"opaque\":" + opaque + "}";
    private static void Clean(string directory)
    {
        Check(Directory.GetFiles(directory, "*.tmp").Length == 0, "完成后不能遗留临时候选文件。");
        Check(Directory.GetFiles(directory, "*.rootsound-save.lock").Length == 0, "完成后不能遗留本次输出锁。");
    }
    private static void Check(bool condition, string message) { if (!condition) throw new InvalidOperationException("工程文件自测失败：" + message); }
    private static void ExpectFailure(Action action, string message)
    {
        try { action(); }
        catch (InvalidDataException) { return; }
        catch (IOException) { return; }
        catch (UnauthorizedAccessException) { return; }
        catch (EncoderFallbackException) { return; }
        throw new InvalidOperationException("工程文件自测失败：" + message);
    }
}
