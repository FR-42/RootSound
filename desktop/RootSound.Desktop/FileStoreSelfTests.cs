using System.Text;

namespace RootSound.Desktop;

/// <summary>Real disk checks, isolated beneath the explicitly supplied test directory.</summary>
public static class FileStoreSelfTests
{
    public static int Run(string testDir)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(testDir);
        string runDirectory = Path.Combine(Path.GetFullPath(testDir), $"atomic-store-{Guid.NewGuid():N}");
        Directory.CreateDirectory(runDirectory);
        int completed = 0;

        void Case(string name, Action<string> test)
        {
            string directory = Path.Combine(runDirectory, name);
            Directory.CreateDirectory(directory);
            test(directory);
            completed++;
        }

        Case("new-and-reopen", directory =>
        {
            const string text = "{\"name\":\"雨后的琴声 🌧\",\"drafts\":[]}";
            using (var store = new AtomicTextStore(directory))
            {
                Check(store.Read() is null, "新库应返回 null。");
                store.Write(text);
                Check(store.Read() == text, "新建库应立即读回中文。");
            }
            using var reopened = new AtomicTextStore(directory);
            Check(reopened.Read() == text, "重开应保留完整中文及非 BMP 字符。");
            Check(File.ReadAllBytes(reopened.FilePath).Take(3).SequenceEqual(new byte[] { 0xef, 0xbb, 0xbf }) == false,
                "新写入文件不应添加 UTF-8 BOM。");
        });

        Case("replace-and-backup", directory =>
        {
            using var store = new AtomicTextStore(directory);
            store.Write("第一版");
            store.Write("第二版");
            Check(File.ReadAllText(store.FilePath + ".bak") == "第一版", "备份应保存被替换版本。");
            store.Write("第三版");
            Check(store.Read() == "第三版", "多次替换应保持最新版本。");
            Check(File.ReadAllText(store.FilePath + ".bak") == "第二版", "备份应更新为上一个版本。");
            Check(Directory.GetFiles(directory, "*.tmp").Length == 0, "成功写入不应遗留候选文件。");
        });

        Case("exclusive-owner", directory =>
        {
            using (var store = new AtomicTextStore(directory))
            {
                Expect<IOException>(() => { using var second = new AtomicTextStore(directory); },
                    "第二实例必须明确拒绝取得同一库的写入权。");
                store.Write("仍属于第一个窗口");
            }
            using var reopened = new AtomicTextStore(directory);
            Check(reopened.Read() == "仍属于第一个窗口", "释放句柄后应允许下一实例打开。");
        });

        Case("external-change", directory =>
        {
            using var store = new AtomicTextStore(directory);
            store.Write("已知内容");
            _ = store.Read();
            File.WriteAllText(store.FilePath, "外部修改", new UTF8Encoding(false));
            Expect<IOException>(() => store.Write("不应覆盖"), "外部更改必须触发冲突。");
            Check(File.ReadAllText(store.FilePath) == "外部修改", "冲突必须保留外部更改。");
            Check(store.Read() == "外部修改", "显式重新读取应取得新内容。");
            store.Write("重新读取后保存");
            Check(File.ReadAllText(store.FilePath + ".bak") == "外部修改", "重新读取后的替换应备份外部版本。");
            File.Delete(store.FilePath);
            Expect<IOException>(() => store.Write("不应重建"), "外部移走文件不能静默重建。");
            Check(!File.Exists(store.FilePath), "冲突应保留外部删除状态。");
        });

        Case("invalid-json-is-untouched", directory =>
        {
            string path = Path.Combine(directory, "materials.json");
            const string broken = "{这不是完整 JSON，却必须保留下来";
            File.WriteAllText(path, broken, new UTF8Encoding(false));
            byte[] before = File.ReadAllBytes(path);
            using var store = new AtomicTextStore(directory);
            Check(store.Read() == broken, "原生文件层不应擅自解释或修复音乐数据。");
            Check(File.ReadAllBytes(path).SequenceEqual(before), "读取坏数据不能修改文件。");
            Check(!File.Exists(path + ".bak"), "仅读取不能制造替换备份。");
        });

        Case("locked-target-failure", directory =>
        {
            using var store = new AtomicTextStore(directory);
            store.Write("锁定前的内容");
            using (var target = new FileStream(store.FilePath, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                Expect<IOException>(() => store.Write("本次不应成功"), "目标不能替换时必须报告写入失败。");
                Check(File.ReadAllText(store.FilePath) == "锁定前的内容", "替换失败必须保留原文件。");
            }
            store.Write("解除锁定后可保存");
            Check(store.Read() == "解除锁定后可保存", "一次失败不能提前推进已保存指纹。");
            Check(Directory.GetFiles(directory, "*.tmp").Length == 0, "失败后应清理自己的候选文件。");
        });

        Case("backup-directory-failure", directory =>
        {
            using var store = new AtomicTextStore(directory);
            store.Write("安全原件");
            Directory.CreateDirectory(store.FilePath + ".bak");
            ExpectFileFailure(() => store.Write("不可提交"), "备份路径是目录时应报告失败。");
            Check(File.ReadAllText(store.FilePath) == "安全原件", "目录冲突不能导致原件被删除。");
            Check(Directory.Exists(store.FilePath + ".bak"), "不能删除阻碍保存的既有目录。");
        });

        Case("target-is-directory", directory =>
        {
            string path = Path.Combine(directory, "materials.json");
            Directory.CreateDirectory(path);
            File.WriteAllText(Path.Combine(path, "keep.txt"), "保留此目录");
            ExpectFileFailure(() => { using var store = new AtomicTextStore(directory); },
                "库路径是目录时应报告读取失败。");
            Check(File.ReadAllText(Path.Combine(path, "keep.txt")) == "保留此目录", "错误路径不能清空目录。");
        });

        Case("file-size-limit", directory =>
        {
            using (var store = new AtomicTextStore(directory))
            {
                store.Write("原始小文件");
                Expect<InvalidDataException>(() => store.Write(new string('界', AtomicTextStore.MaximumBytes / 3 + 1)),
                    "大小上限必须按 UTF-8 字节计算。");
                Check(store.Read() == "原始小文件", "超大写入不能覆盖原文件。");
            }
            string path = Path.Combine(directory, "materials.json");
            using (var oversized = new FileStream(path, FileMode.Create, FileAccess.Write))
                oversized.SetLength(AtomicTextStore.MaximumBytes + 1L);
            Expect<InvalidDataException>(() => { using var store = new AtomicTextStore(directory); },
                "超大已存文件必须明确拒绝读取。");
            Check(new FileInfo(path).Length == AtomicTextStore.MaximumBytes + 1L, "超大读取失败不能截断文件。");
        });

        Case("project-sized-library-write-and-reopen", directory =>
        {
            // This is valid opaque library JSON, not a synthetic length check.
            // Its metadata alone exceeds the former 16 MiB library boundary.
            const int metadataLength = 18 * 1024 * 1024;
            var text = "{\"format\":\"RootSoundMaterialLibrary\",\"version\":1,\"contents\":[],\"drafts\":[],\"metadata\":\""
                + new string('x', metadataLength) + "\"}";
            using (var store = new AtomicTextStore(directory))
            {
                store.Write(text);
                Check(new FileInfo(store.FilePath).Length > 16L * 1024 * 1024, "工程大小的实际落盘库应超过旧上限。");
                Check(store.Read() == text, "大工程库写入后应立即全文读回。");
            }
            using var reopened = new AtomicTextStore(directory);
            Check(reopened.Read() == text, "关闭后重开应完整保留超过旧上限的工程库。");
            Check(Directory.GetFiles(directory, "*.tmp").Length == 0, "大库保存后不能遗留候选文件。");
        });

        Case("utf8-bom-and-invalid-bytes", directory =>
        {
            string path = Path.Combine(directory, "materials.json");
            const string text = "带 BOM 的中文";
            File.WriteAllText(path, text, new UTF8Encoding(true));
            using (var store = new AtomicTextStore(directory))
                Check(store.Read() == text, "读取应接受 UTF-8 BOM 而不把它插入正文。");
            File.WriteAllBytes(path, new byte[] { 0xff, 0xfe, 0xff });
            using var invalid = new AtomicTextStore(directory);
            Expect<InvalidDataException>(() => invalid.Read(), "无效 UTF-8 必须明确报错，不能静默替换字符。");
            Check(File.ReadAllBytes(path).SequenceEqual(new byte[] { 0xff, 0xfe, 0xff }), "编码错误不能改写原始字节。");
        });

        return completed;
    }

    private static void Check(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException("声音库文件自测失败：" + message);
    }

    private static void Expect<T>(Action action, string message) where T : Exception
    {
        try { action(); }
        catch (T) { return; }
        throw new InvalidOperationException("声音库文件自测失败：" + message);
    }

    private static void ExpectFileFailure(Action action, string message)
    {
        try { action(); }
        catch (IOException) { return; }
        catch (UnauthorizedAccessException) { return; }
        throw new InvalidOperationException("声音库文件自测失败：" + message);
    }
}
