using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

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
            // Its metadata alone exceeds the former 128 MiB library boundary.
            const int metadataLength = 129 * 1024 * 1024;
            const string prefix = "{\"format\":\"RootSoundMaterialLibrary\",\"version\":1,\"contents\":[],\"drafts\":[],\"metadata\":\"";
            const string suffix = "\"}";
            string text = string.Create(prefix.Length + metadataLength + suffix.Length, 0, (span, _) =>
            {
                prefix.AsSpan().CopyTo(span);
                span.Slice(prefix.Length, metadataLength).Fill('x');
                suffix.AsSpan().CopyTo(span[(prefix.Length + metadataLength)..]);
            });
            string path = Path.Combine(directory, "materials.json");
            var timestamp = new DateTime(2026, 1, 2, 3, 4, 6, DateTimeKind.Utc);
            byte[] HashFile() { using var file = File.OpenRead(path); return SHA256.HashData(file); }
            byte[] originalHash;
            using (var store = new AtomicTextStore(directory))
            {
                store.Write(text);
                Check(new FileInfo(path).Length > 128L * 1024 * 1024, "工程大小的实际落盘库应超过旧 128 MiB 上限。");
                Check(new FileInfo(path).Length == Encoding.UTF8.GetByteCount(text), "大库写入必须保留所有 UTF-8 字节。");
                originalHash = HashFile();
                File.SetLastWriteTimeUtc(path, timestamp);
                Check(store.Read() == text, "大工程库写入后应立即全文读回。");
                using (var response = JsonDocument.Parse(new NativeStorage(store).Read()))
                {
                    Check(response.RootElement.GetProperty("ok").GetBoolean(), "大库必须通过实际原生桥接返回成功。");
                    Check(response.RootElement.GetProperty("value").GetString() == text,
                        "大库原生桥接的 JSON 字符串必须完整保留库文本。");
                    Check(!string.IsNullOrWhiteSpace(response.RootElement.GetProperty("scope").GetString()),
                        "大库原生桥接必须保留当前作用域。");
                }
                store.VerifyUnchanged();
                Check(File.GetLastWriteTimeUtc(path) == timestamp, "大库读取和指纹检查不能修改保存时间。");
            }
            Check(HashFile().AsSpan().SequenceEqual(originalHash) && File.GetLastWriteTimeUtc(path) == timestamp,
                "释放大库不能写入或改变原文件及时间。");
            using (var reopened = new AtomicTextStore(directory))
            {
                Check(reopened.Read() == text, "关闭后重开应完整保留超过旧 128 MiB 上限的工程库。");
                Check(HashFile().AsSpan().SequenceEqual(originalHash) && File.GetLastWriteTimeUtc(path) == timestamp,
                    "大库重开不能改写已保存字节或时间。");
                // Change one byte without changing size or mtime: conflict detection
                // must still inspect the actual content, not just file metadata.
                using (var file = new FileStream(path, FileMode.Open, FileAccess.Write, FileShare.Read))
                {
                    file.Position = prefix.Length + metadataLength / 2;
                    file.WriteByte((byte)'y');
                    file.Flush(true);
                }
                File.SetLastWriteTimeUtc(path, timestamp);
                byte[] externalHash = HashFile();
                Check(!externalHash.AsSpan().SequenceEqual(originalHash), "大库冲突夹具必须实际修改文件内容。");
                Expect<IOException>(() => reopened.VerifyUnchanged(), "大库等长、同时间的外部更改必须触发指纹冲突。");
                Expect<IOException>(() => reopened.Write(text), "大库冲突不能被覆盖保存。");
                Check(HashFile().AsSpan().SequenceEqual(externalHash) && File.GetLastWriteTimeUtc(path) == timestamp,
                    "大库冲突失败必须保留外部版本的所有字节和时间。");
            }
            Check(!File.Exists(path + ".bak"), "大库仅读取和拒绝冲突不能制造替换备份。");
            Check(Directory.GetFiles(directory, "*.tmp").Length == 0, "大库保存后不能遗留候选文件。");
        });

        Case("large-json-text-serialization", _ =>
        {
            string controls = string.Concat(Enumerable.Range(0, 32).Select(value => (char)value));
            string?[] values = [null, "", "plain ASCII", "单双引号 ' \" 与反斜线 \\ /",
                controls, "中文与 emoji 🎵🌧，以及行分隔\u2028段分隔\u2029", "\r\n\t\b\f\\\"",
                new string('x', 32767) + "🎵\"\\\n末尾", new string('x', 65535) + "🌧\u2028\u2029末尾"];
            foreach (string field in new[] { "value", "音色\"\\\n🎵" })
            foreach (string? value in values)
            {
                var metadata = new { ok = true, scope = "中文作用域 🎵", count = 3, nested = new { enabled = false } };
                using var parsed = JsonDocument.Parse(LargeJsonText.Serialize(metadata, field, value));
                var root = parsed.RootElement;
                Check(root.EnumerateObject().Count() == 5 && root.GetProperty("ok").GetBoolean()
                    && root.GetProperty("scope").GetString() == metadata.scope && root.GetProperty("count").GetInt32() == 3
                    && !root.GetProperty("nested").GetProperty("enabled").GetBoolean(),
                    "大文本 JSON 必须保留所有元数据且只附加一个目标字段。");
                var actual = root.GetProperty(field);
                using var baseline = JsonDocument.Parse(JsonSerializer.Serialize(new { value }));
                var expected = baseline.RootElement.GetProperty("value");
                Check(actual.ValueKind == expected.ValueKind && (value is null || actual.GetString() == expected.GetString()),
                    "大文本 JSON 对空值、控制字符、引号、斜线及 Unicode 的语义必须与标准序列化一致。");
            }
            foreach (string invalid in new[] { "\ud800", "\udfff", "\ud800x", "x\udfff", "\ud800\ud800" })
                Expect<InvalidDataException>(() => LargeJsonText.Serialize(new { ok = true }, "value", invalid),
                    "大文本 JSON 不得悄悄替换无效 UTF-16 而损失原文。");
            Expect<ArgumentException>(() => LargeJsonText.Serialize(new { value = "already here" }, "value", "replacement"),
                "大文本 JSON 必须拒绝覆盖元数据中已经存在的目标字段。");
            Expect<ArgumentException>(() => LargeJsonText.Serialize(new[] { 1, 2 }, "value", "text"),
                "大文本 JSON 必须拒绝非对象元数据。");
            Expect<ArgumentNullException>(() => LargeJsonText.Serialize(null!, "value", "text"),
                "大文本 JSON 必须拒绝空元数据对象。");
            Expect<ArgumentException>(() => LargeJsonText.Serialize(new { ok = true }, "", "text"),
                "大文本 JSON 必须拒绝空目标字段名称。");
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
