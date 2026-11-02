using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace RootSound.Desktop;

/// <summary>Small deterministic payload checks, isolated from user music and size-limit stress cases.</summary>
internal static class PayloadCacheSelfTests
{
    internal const int MaximumFixtureBytes = 64 * 1024;
    private static readonly UTF8Encoding Utf8 = new(false, true);

    internal static int Run(string directory)
    {
        string run = Path.Combine(Path.GetFullPath(directory), "payload-small-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(run); int passed = 0;
        void Case(string name, Action<string> test)
        {
            string root = Path.Combine(run, name); Directory.CreateDirectory(root);
            test(root); passed++;
            foreach (string file in Directory.EnumerateFiles(root, "*", SearchOption.AllDirectories))
                Check(new FileInfo(file).Length <= MaximumFixtureBytes, "小型检查不得生成重型文件：" + file);
        }

        Case("listing-reads-only-bounded-header", root =>
        {
            var fixture = WriteFixture(root);
            byte[] bytes = Utf8.GetBytes(Envelope(fixture.Library + new string(' ', 12000), "标题🎵", fixture.Id));
            Check(bytes.Length <= MaximumFixtureBytes, "发现测试保持小型");
            using var input = new HeaderBudgetStream(bytes);
            var header = StreamingWorkspaceCodec.ReadHeader(input)!;
            Check(header["name"]!.GetValue<string>() == "标题🎵" && input.Position <= 4096, "列表只读前4KiB，不遍历音乐和采样");
            using var manager = new ProjectDirectoryManager(root, 128);
            SmallWrite(fixture.Path, Utf8.GetString(bytes));
            Check(manager.List().Single().Id == fixture.Id && manager.ActivePayloadDirectory is null, "发现不激活音频或工作集");
            var reordered = JsonNode.Parse(Utf8.GetString(bytes))!.AsObject();
            var legacyOrder = new JsonObject { ["libraryText"] = reordered["libraryText"]!.DeepClone() };
            foreach (var item in reordered.Where(item => item.Key != "libraryText")) legacyOrder.Add(item.Key, item.Value?.DeepClone());
            SmallWrite(fixture.Path, legacyOrder.ToJsonString());
            Check(manager.List().Single().Id == fixture.Id, "旧字段顺序兼容完整扫描");
        });

        Case("opening-and-draft-reads-defer-derived-files", root =>
        {
            var fixture = WriteFixture(root); string originalHash = Hash(fixture.Path);
            using var manager = new ProjectDirectoryManager(root, 128); manager.Open(fixture.Path);
            Check(!Directory.Exists(Path.Combine(root, "timbres")), "打开不展开或重写派生音色目录");
            var snapshot = manager.ReadLibrary(); string changed = RenameDraft(snapshot.Value!, "工作稿");
            using (var locked = new FileStream(fixture.Path, FileMode.Open, FileAccess.Read, FileShare.None))
            {
                Check(manager.ReadLibrary() == snapshot, "读取草稿不读取被独占的原文件");
                manager.WriteLibrary(changed, snapshot.Scope); manager.FinishLoading();
                Check(manager.ReadLibrary().Value == changed, "工作稿更新不校验整个原文件");
            }
            Check(Hash(fixture.Path) == originalHash, "工作稿不自动保存");
            DateTime stamp = File.GetLastWriteTimeUtc(fixture.Path);
            byte[] external = File.ReadAllBytes(fixture.Path); external[^2] = (byte)' ';
            File.WriteAllBytes(fixture.Path, external); File.SetLastWriteTimeUtc(fixture.Path, stamp);
            Check(manager.ReadLibrary().Value == changed, "外部变化不会替换内存草稿");
            ExpectFailure(() => manager.Save(), "保存仍全量校验，阻止等长同时间外部冲突");
            Check(File.ReadAllBytes(fixture.Path).AsSpan().SequenceEqual(external), "外部文件保持原样");
        });

        Case("stream-codec-tiny-chunks-and-unicode", root =>
        {
            var fixture = WriteFixture(root); var expected = JsonNode.Parse(fixture.Library);
            foreach (int chunk in new[] { 1, 7, 31 })
            {
                using var cache = new SessionPayloadStore(Path.Combine(root, "chunks-" + chunk), 128);
                using var input = new ChunkStream(File.ReadAllBytes(fixture.Path), chunk);
                var read = StreamingWorkspaceCodec.Read(input, cache);
                Check(read.Metadata["name"]!.GetValue<string>() == "song", "流式读取保留工程名");
                Check(read.Metadata["futureExtra"]!["text"]!.GetValue<string>() == "引号\"、反斜线\\、换行\n和音符🎵", "元信息转义和Unicode保持");
                Check(input.LargestRead <= chunk, "受控短读生效");
                string token = Token(read.Library);
                using (var audio = cache.Open(token)) Check(ReadSmall(audio).AsSpan().SequenceEqual(fixture.Audio), "采样跨块解码保持原字节");
                string expanded = StreamingWorkspaceCodec.Expand(read.Library, cache, MaximumFixtureBytes);
                Check(JsonNode.DeepEquals(JsonNode.Parse(expanded), expected), "展开恢复完整库语义");
                using var output = new MemoryStream(); StreamingWorkspaceCodec.Write(output, read.Metadata, read.Library, cache);
                Check(output.Length <= MaximumFixtureBytes, "输出夹具保持小型");
                var written = JsonNode.Parse(output.ToArray())!;
                Check(JsonNode.DeepEquals(JsonNode.Parse(written["libraryText"]!.GetValue<string>()), expected), "再次编码的工程自包含");
                Check(!Utf8.GetString(output.ToArray()).Contains("rootsound-payload:", StringComparison.Ordinal), "正式文件不保留临时引用");
            }
        });

        Case("read-only-open-bridge-and-exact-audio", root =>
        {
            var fixture = WriteFixture(root); string before = Hash(fixture.Path); DateTime stamp = File.GetLastWriteTimeUtc(fixture.Path);
            using (var manager = new ProjectDirectoryManager(root, 128))
            {
                manager.Open(fixture.Path); var snapshot = manager.ReadLibrary(); string compact = snapshot.Value!;
                Check(compact.Contains("host-asset", StringComparison.Ordinal) && !compact.Contains(Convert.ToBase64String(fixture.Audio), StringComparison.Ordinal), "工作库仅有音频引用");
                Check(compact.Length + 256 < fixture.Library.Length, "轻量库不复制原音频");
                Check(!manager.HasUnsavedChanges, "打开不产生未保存修改");
                using var response = JsonDocument.Parse(new NativeStorage(manager).Read());
                Check(response.RootElement.GetProperty("ok").GetBoolean() && response.RootElement.GetProperty("value").GetString() == compact, "桥接仅返回工作库");
                string token = Token(compact);
                using (var audio = manager.OpenPayloadStream(token)) Check(ReadSmall(audio).AsSpan().SequenceEqual(fixture.Audio), "仅显式请求读取原采样");
                manager.FinishLoading(); manager.Exit("discard");
                ExpectFailure(() => { using var ignored = manager.OpenPayloadStream(token); }, "退出后的token失效");
            }
            Check(Hash(fixture.Path) == before && File.GetLastWriteTimeUtc(fixture.Path) == stamp && !File.Exists(fixture.Path + ".bak"), "只读流程不改工程、时间或备份");
        });

        Case("working-edit-explicit-save-backup-and-reopen", root =>
        {
            var fixture = WriteFixture(root); string originalHash = Hash(fixture.Path); DateTime stamp = File.GetLastWriteTimeUtc(fixture.Path);
            using var manager = new ProjectDirectoryManager(root, 128); manager.Open(fixture.Path); manager.FinishLoading();
            var snapshot = manager.ReadLibrary(); string changed = RenameDraft(snapshot.Value!, "修改后的歌曲");
            Check(new NativeStorage(manager).WriteScoped(changed, snapshot.Scope) == "{\"ok\":true}", "范围正确的草稿修改成功");
            Check(manager.HasUnsavedChanges && Hash(fixture.Path) == originalHash && File.GetLastWriteTimeUtc(fixture.Path) == stamp, "普通修改不写正式文件");
            manager.Save("修改后的歌曲");
            Check(!manager.HasUnsavedChanges && Hash(fixture.Path + ".bak") == originalHash, "明确保存才提交并备份");
            string saved = File.ReadAllText(fixture.Path, Utf8);
            Check(!saved.Contains("rootsound-payload:", StringComparison.Ordinal), "正式工程无会话token");
            Check(Audio(DiskLibrary(fixture.Path)).AsSpan().SequenceEqual(fixture.Audio), "保存的原始音频逐字节不变");
            manager.Exit("discard"); manager.Open(fixture.Path);
            Check(JsonNode.Parse(manager.ReadLibrary().Value!)!["drafts"]![0]!["name"]!.GetValue<string>() == "修改后的歌曲", "冷重开保留修改");
            using var audio = manager.OpenPayloadStream(Token(manager.ReadLibrary().Value!));
            Check(ReadSmall(audio).AsSpan().SequenceEqual(fixture.Audio), "重开恢复精确音频");
        });

        Case("save-as-is-portable-and-keeps-original-draft", root =>
        {
            var fixture = WriteFixture(root); string hash = Hash(fixture.Path);
            string copies = Path.Combine(root, "copies"); Directory.CreateDirectory(copies);
            string copy;
            using (var manager = new ProjectDirectoryManager(root, 128))
            {
                manager.Open(fixture.Path); string token = Token(manager.ReadLibrary().Value!);
                manager.WriteLibrary(RenameDraft(manager.ReadLibrary().Value!, "副本草稿"));
                copy = manager.CreateCopy("副本", copies, manager.ReadLibrary().Value!).Path;
                Check(Hash(fixture.Path) == hash && !File.Exists(fixture.Path + ".bak"), "另存不覆盖原件");
                Check(Audio(DiskLibrary(copy)).AsSpan().SequenceEqual(fixture.Audio), "副本包含完整音频");
                ExpectFailure(() => { using var ignored = manager.OpenPayloadStream(token); }, "成功切换后旧会话失效");
            }
            using var receiver = new ProjectDirectoryManager(Path.Combine(root, "empty-device"), 128); receiver.Open(copy);
            using var received = receiver.OpenPayloadStream(Token(receiver.ReadLibrary().Value!));
            Check(ReadSmall(received).AsSpan().SequenceEqual(fixture.Audio), "空缓存接收设备可独立打开");
        });

        Case("discard-and-scope-isolation", root =>
        {
            var fixture = WriteFixture(root); string hash = Hash(fixture.Path);
            using var first = new ProjectDirectoryManager(root, 128); first.Open(fixture.Path);
            var snapshot = first.ReadLibrary(); string token = Token(snapshot.Value!);
            first.WriteLibrary(RenameDraft(snapshot.Value!, "不会保存")); first.Exit("discard");
            Check(Hash(fixture.Path) == hash && !File.Exists(fixture.Path + ".bak"), "放弃仅清理工作态");
            first.Open(fixture.Path); var newer = first.ReadLibrary();
            Check(newer.Scope != snapshot.Scope && Token(newer.Value!) != token, "重开使用新隔离身份");
            ExpectFailure(() => first.WriteLibrary(snapshot.Value!, snapshot.Scope), "旧范围写入被拒绝");
            ExpectFailure(() => { using var ignored = first.OpenPayloadStream(token); }, "旧token被拒绝");
            string other = Path.Combine(root, "other"); var otherFixture = WriteFixture(other);
            using var second = new ProjectDirectoryManager(other, 128); second.Open(otherFixture.Path);
            ExpectFailure(() => { using var ignored = second.OpenPayloadStream(Token(newer.Value!)); }, "另一个工程无法读取此token");
        });

        Case("external-same-size-same-time-conflict", root =>
        {
            var fixture = WriteFixture(root); using var manager = new ProjectDirectoryManager(root, 128);
            manager.Open(fixture.Path); manager.WriteLibrary(RenameDraft(manager.ReadLibrary().Value!, "工作修改"));
            DateTime stamp = File.GetLastWriteTimeUtc(fixture.Path); byte[] external = File.ReadAllBytes(fixture.Path);
            byte[] name = Utf8.GetBytes("\"name\":\"song\""); int offset = external.AsSpan().IndexOf(name);
            Check(offset >= 0, "测试夹具包含明确名称"); external[offset + name.Length - 5] = (byte)'S';
            File.WriteAllBytes(fixture.Path, external); File.SetLastWriteTimeUtc(fixture.Path, stamp);
            ExpectFailure(() => manager.Save(), "等长同mtime外部更改仍阻止保存");
            Check(File.ReadAllBytes(fixture.Path).AsSpan().SequenceEqual(external) && manager.HasUnsavedChanges, "外部原件与工作稿都保留");
            manager.Exit("discard"); Check(File.ReadAllBytes(fixture.Path).AsSpan().SequenceEqual(external), "放弃不会把旧原件写回");
        });

        Case("failed-save-retains-draft-and-can-retry", root =>
        {
            var fixture = WriteFixture(root); string hash = Hash(fixture.Path);
            using var manager = new ProjectDirectoryManager(root, 128); manager.Open(fixture.Path);
            string changed = RenameDraft(manager.ReadLibrary().Value!, "待保存"); manager.WriteLibrary(changed);
            Directory.CreateDirectory(fixture.Path + ".bak");
            ExpectFailure(() => manager.Save(), "备份路径冲突时保存失败");
            Check(manager.HasUnsavedChanges && manager.ReadLibrary().Value == changed && Hash(fixture.Path) == hash, "失败保留草稿与原件");
            Directory.Delete(fixture.Path + ".bak", false); manager.Save();
            Check(!manager.HasUnsavedChanges && Audio(DiskLibrary(fixture.Path)).AsSpan().SequenceEqual(fixture.Audio), "解除冲突后可重试");
        });

        Case("corrupt-cache-blocks-read-and-save", root =>
        {
            var fixture = WriteFixture(root); string hash = Hash(fixture.Path);
            using var manager = new ProjectDirectoryManager(root, 128); manager.Open(fixture.Path);
            string compact = manager.ReadLibrary().Value!, token = Token(compact);
            string cache = Directory.GetFiles(manager.ActivePayloadDirectory!, "*.bin").Single();
            byte[] changed = File.ReadAllBytes(cache); changed[^1] ^= 1; File.WriteAllBytes(cache, changed);
            ExpectFailure(() => { using var ignored = manager.OpenPayloadStream(token); }, "等长缓存损坏也被发现");
            ExpectFailure(() => manager.Save(), "缓存损坏不能保存坏的便携工程");
            Check(Hash(fixture.Path) == hash && !File.Exists(fixture.Path + ".bak"), "失败不覆盖原件或制造新备份");
            manager.Exit("discard"); manager.Open(fixture.Path);
            using var recovered = manager.OpenPayloadStream(Token(manager.ReadLibrary().Value!));
            Check(ReadSmall(recovered).AsSpan().SequenceEqual(fixture.Audio), "重开从未改原件恢复缓存");
        });

        Case("list-and-inspect-rename-without-persisting-cache-paths", root =>
        {
            var fixture = WriteFixture(root); string hash = Hash(fixture.Path);
            using var manager = new ProjectDirectoryManager(root, 128);
            var listed = manager.List(); Check(listed.Count == 1 && listed[0].Name == "song" && manager.Current is null, "列表不激活工程");
            Check(Hash(fixture.Path) == hash && manager.ActivePayloadDirectory is null, "列表不建立活动音频工作集");
            var selected = manager.Inspect(fixture.Path, fixture.Id);
            Check(selected.LibraryText.Contains("host-asset", StringComparison.Ordinal), "改名检查也是轻量库");
            var renamed = manager.Rename(fixture.Path, fixture.Id, "库中新名", RenameDraft(selected.LibraryText, "库中新名"), selected.Token);
            Check(renamed.Name == "库中新名" && manager.Current is null && manager.List().Single().Name == "库中新名", "库中改名不进入工程");
            Check(Audio(DiskLibrary(fixture.Path)).AsSpan().SequenceEqual(fixture.Audio), "库中改名仍保存自包含音频");
            Check(!File.ReadAllText(fixture.Path, Utf8).Contains("rootsound-payload:", StringComparison.Ordinal), "改名不泄漏cache引用");
        });

        Case("foreign-embedded-cache-reference-is-rejected", root =>
        {
            var fixture = WriteFixture(root); using var manager = new ProjectDirectoryManager(root, 128); manager.Open(fixture.Path);
            var before = manager.ReadLibrary(); string originalHash = Hash(fixture.Path);
            string foreign = Path.Combine(root, "foreign.rootsound");
            SmallWrite(foreign, Envelope(before.Value!, "foreign", Guid.NewGuid().ToString("N")));
            ExpectFailure(() => manager.Open(foreign), "外部磁盘工程不可携带会话引用");
            Check(manager.Current!.Path == fixture.Path && manager.ReadLibrary() == before && Hash(fixture.Path) == originalHash, "失败打开保留原会话");
            Check(File.Exists(foreign), "拒绝不删除外来文件");
        });

        Case("small-expansion-budget-is-enforced", root =>
        {
            var fixture = WriteFixture(root); using var manager = new ProjectDirectoryManager(root, 128); manager.Open(fixture.Path);
            string compact = manager.ReadLibrary().Value!;
            ExpectFailure(() => manager.ExpandPayloadText(compact, Utf8.GetByteCount(compact) + 16), "小额测试预算也在展开时生效");
            string expanded = manager.ExpandPayloadText(compact, MaximumFixtureBytes);
            Check(Audio(expanded).AsSpan().SequenceEqual(fixture.Audio), "正常预算可导出完整内容");
        });

        Case("canonical-padding-and-cache-deduplication", root =>
        {
            using var cache = new SessionPayloadStore(Path.Combine(root, "owned"), 1);
            foreach (int size in new[] { 1, 2, 3, 12287, 12288, 12289, 16385 })
            {
                byte[] bytes = Enumerable.Range(0, size).Select(index => (byte)(index * 37)).ToArray(); string text = Convert.ToBase64String(bytes);
                string token = cache.AddBase64(text, bytes.Length);
                Check(cache.AddBase64(text, bytes.Length) == token, "相同源字节使用一个缓存身份");
                using var loaded = cache.Open(token); Check(ReadSmall(loaded).AsSpan().SequenceEqual(bytes), "小边界载入不漏帧或填充");
            }
            Check(Directory.GetFiles(cache.DirectoryPath, "*.bin").Length == 7, "重复引用不重复写缓存");
            foreach (string bad in new[] { "AAB=", "AA A", "AA=!", "A===", "AAA", "AA==\n" })
                ExpectFailure(() => cache.AddBase64(bad, 2), "拒绝非规范base64");
            Check(Directory.GetFiles(cache.DirectoryPath, "*.tmp").Length == 0, "失败清理自己的临时文件");
        });

        Case("malformed-streams-reject-without-changing-active-song", root =>
        {
            var fixture = WriteFixture(root); string original = File.ReadAllText(fixture.Path, Utf8);
            using var manager = new ProjectDirectoryManager(root, 128); manager.Open(fixture.Path); var before = manager.ReadLibrary();
            string escapedName = JsonSerializer.Serialize("song");
            foreach (string bad in new[] { original[..^7], original + " trailing", original.Replace("\"libraryText\":", "\"libraryText\":null,\"again\":", StringComparison.Ordinal),
                original.Replace("\"name\":" + escapedName, "\"name\":\"\\ud800\"", StringComparison.Ordinal),
                original.Replace("\"version\":2", "\"version\":2,\"version\":2", StringComparison.Ordinal) })
            {
                string path = Path.Combine(root, "invalid.rootsound"); SmallWrite(path, bad);
                ExpectFailure(() => manager.Open(path), "损坏流式工程必须拒绝");
                Check(manager.ReadLibrary() == before && manager.Current!.Path == fixture.Path, "损坏输入不切换或破坏原会话");
            }
        });

        Case("future-outer-metadata-retains-embedded-source", root =>
        {
            var fixture = WriteFixture(root); var envelope = JsonNode.Parse(File.ReadAllText(fixture.Path, Utf8))!;
            JsonNode expected = JsonNode.Parse(fixture.Library)!["contents"]![0]!["body"]!.DeepClone();
            envelope["futureExtra"] = expected.DeepClone(); SmallWrite(fixture.Path, envelope.ToJsonString());
            using var manager = new ProjectDirectoryManager(root, 128); manager.Open(fixture.Path);
            Check(manager.ReadLibrary().Value!.Contains("host-asset", StringComparison.Ordinal), "仅内层工程音频进入缓存");
            manager.Save();
            var saved = JsonNode.Parse(File.ReadAllText(fixture.Path, Utf8))!;
            Check(JsonNode.DeepEquals(saved["futureExtra"], expected), "未知外层metadata原样保持");
            Check(saved["futureExtra"]!["audio"]!["encoding"]!.GetValue<string>() == "base64", "未知外层素材不能替换成工作缓存");
            Check(!saved.ToJsonString().Contains("rootsound-payload:", StringComparison.Ordinal), "正式文件所有位置均无临时token");
            manager.Exit("discard"); manager.Open(fixture.Path); manager.Save();
            Check(JsonNode.DeepEquals(JsonNode.Parse(File.ReadAllText(fixture.Path, Utf8))!["futureExtra"], expected), "再次打开保存仍保持未来metadata");
        });

        Case("bare-session-references-cannot-enter-file-or-working-state", root =>
        {
            var fixture = WriteFixture(root); string hash = Hash(fixture.Path);
            using var manager = new ProjectDirectoryManager(root, 128); manager.Open(fixture.Path); var before = manager.ReadLibrary();
            var naked = new JsonObject { ["encoding"] = "host-asset", ["byteLength"] = fixture.Audio.Length, ["data"] = Token(before.Value!) };
            var working = JsonNode.Parse(before.Value!)!; working["futureBare"] = naked.DeepClone();
            ExpectFailure(() => manager.WriteLibrary(working.ToJsonString(), before.Scope), "裸引用不能混入工作状态");
            Check(manager.ReadLibrary() == before && !manager.HasUnsavedChanges && Hash(fixture.Path) == hash, "拒绝不改变原工作状态和文件");
            var external = JsonNode.Parse(fixture.Library)!; external["futureBare"] = naked.DeepClone();
            string foreign = Path.Combine(root, "bare-inner.rootsound"); SmallWrite(foreign, Envelope(external.ToJsonString(), "foreign", Guid.NewGuid().ToString("N")));
            ExpectFailure(() => manager.Open(foreign), "裸引用外部工程拒绝");
            var metadata = JsonNode.Parse(Envelope(fixture.Library, "foreign", Guid.NewGuid().ToString("N")))!; metadata["futureBare"] = naked.DeepClone();
            string outer = Path.Combine(root, "bare-outer.rootsound"); SmallWrite(outer, metadata.ToJsonString());
            ExpectFailure(() => manager.Open(outer), "裸引用外层metadata也拒绝");
            Check(manager.ReadLibrary() == before && Hash(fixture.Path) == hash, "所有拒绝保留可用工程和音频");
        });

        Case("all-unicode-positions-and-bad-json-listing-remain-safe", root =>
        {
            var fixture = WriteFixture(root); string original = File.ReadAllText(fixture.Path, Utf8);
            string innerBadValue = fixture.Library.Replace("\"name\":\"song\"", "\"name\":\"\\udfff\"", StringComparison.Ordinal);
            string innerBadKey = fixture.Library.Replace("\"contents\":", "\"\\ud800\":", StringComparison.Ordinal);
            string[] badValues = [
                original.Replace("\"name\":\"song\"", "\"name\":\"\\ud800\"", StringComparison.Ordinal),
                original.Replace("\"futureExtra\":", "\"\\udfff\":", StringComparison.Ordinal),
                Envelope(innerBadValue, "invalid", Guid.NewGuid().ToString("N")),
                Envelope(innerBadKey, "invalid", Guid.NewGuid().ToString("N")),
                original.Replace("\"libraryText\":", "\"libraryText\":\"\\ud800\",\"ignored\":", StringComparison.Ordinal),
                original.Replace("\"version\":2", "\"version\":not-json", StringComparison.Ordinal),
                original.Replace("\"futureExtra\":", "\"unknown\":truefalse,\"futureExtra\":", StringComparison.Ordinal),
                Envelope("{bad", "invalid", Guid.NewGuid().ToString("N")),
            ];
            using var manager = new ProjectDirectoryManager(root, 128); manager.Open(fixture.Path); var before = manager.ReadLibrary();
            for (int index = 0; index < badValues.Length; index++)
            {
                string invalid = Path.Combine(root, "project", "invalid-" + index + ".rootsound"); SmallWrite(invalid, badValues[index]);
                ExpectFailure(() => manager.Open(invalid), "各层无效Unicode或JSON应由项目入口拒绝");
                var listed = manager.List(); Check(listed.Any(item => item.Path == fixture.Path), "坏输入不阻断列表也不隐藏正常项目；正文由打开入口校验");
                Check(manager.ReadLibrary() == before, "失败读取不改变活动会话");
            }
            foreach (int chunk in new[] { 1, 3, 7 })
            {
                using var stream = new ChunkStream(Utf8.GetBytes(original), chunk);
                var metadata = StreamingWorkspaceCodec.Read(stream, null, metadataOnly: true).Metadata;
                Check(metadata["futureExtra"]!["text"]!.GetValue<string>().EndsWith("🎵", StringComparison.Ordinal), "有效Unicode跨块pair在轻量列表保留");
            }
        });

        Case("expanded-budget-rejects-before-opening-owned-audio", root =>
        {
            var fixture = WriteFixture(root); using var manager = new ProjectDirectoryManager(root, 128); manager.Open(fixture.Path);
            string compact = manager.ReadLibrary().Value!;
            string cache = Directory.GetFiles(manager.ActivePayloadDirectory!, "*.bin").Single();
            using (var inaccessible = new FileStream(cache, FileMode.Open, FileAccess.Read, FileShare.None))
            {
                try { manager.ExpandPayloadText(compact, Utf8.GetByteCount(compact) + 16); throw new InvalidOperationException("未拒绝超出小预算的展开。"); }
                catch (InvalidDataException error) { Check(error.Message.Contains("尚未载入", StringComparison.Ordinal), "预算应前置拒绝而非先打开音频"); }
            }
            Check(Audio(manager.ExpandPayloadText(compact, MaximumFixtureBytes)).AsSpan().SequenceEqual(fixture.Audio), "放开预算和只读锁后原音频仍完整");
        });

        return passed;
    }

    private sealed record Fixture(string Path, string Library, byte[] Audio, string Id);
    private static Fixture WriteFixture(string root)
    {
        string projects = Path.Combine(root, "project"); Directory.CreateDirectory(projects);
        byte[] audio = Wave(); string id = Guid.NewGuid().ToString("N");
        var sample = new { id = "sample", kind = "rootsound.sample", owner = "sampling", schemaVersion = 1, revision = 1, name = "原音🎵", dependencies = Array.Empty<string>(),
            body = new { model = "audio-sample", version = 1, source = new { kind = "file", name = "原音\\\"\n🎵.wav", mimeType = "audio/wav" },
                audio = new { encoding = "base64", byteLength = audio.Length, data = Convert.ToBase64String(audio) },
                decoded = new { sampleRate = 8000, channels = 1, frames = 256, durationSeconds = .032 } } };
        var tone = new { id = "tone", kind = "rootsound.timbre", owner = "timbre", schemaVersion = 1, revision = 1, name = "采样音色", dependencies = new[] { "sample" },
            body = new { model = "sample-instrument", version = 1, sampleId = "sample", startSeconds = 0, endSeconds = .032, rootFrequencyHz = 440, attackSeconds = 0, releaseSeconds = .01, level = .5 } };
        var phrase = new { id = "phrase", kind = "rootsound.phrase", owner = "phrase", schemaVersion = 1, revision = 1, name = "音乐", dependencies = new[] { "tone" },
            body = new { model = "note-phrase", version = 1, timeUnit = "beat", tempoBpm = 120, lengthBeats = 16,
                parts = new[] { new { id = "part", name = "原音", timbreId = "tone", notes = new[] { new { id = "note", startBeat = 0, durationBeats = .064, durationSeconds = .032, frequencyHz = 440, velocity = 1 } } } } } };
        var song = new { id = "song-draft", kind = "rootsound.song", owner = "song", schemaVersion = 1, name = "song", dependencies = new[] { "phrase" },
            body = new { model = "phrase-arrangement", version = 1, timeUnit = "beat", tempoBpm = 120, tempoMode = "source", lengthBeats = 16,
                tracks = new[] { new { id = "row", name = "行1", level = 1, pan = 0, muted = false, solo = false, clips = new[] { new { id = "clip", phraseId = "phrase", startBeat = 0 } } } } } };
        string library = JsonSerializer.Serialize(new { format = "RootSoundMaterialLibrary", version = 1, contents = new object[] { sample, tone, phrase }, drafts = new[] { song } });
        string path = Path.Combine(projects, "song.rootsound"); SmallWrite(path, Envelope(library, "song", id));
        return new(path, library, audio, id);
    }
    private static string Envelope(string library, string name, string id) => JsonSerializer.Serialize(new
    {
        format = "RootSoundWorkspace", version = 2, id, name, createdAtUtc = "2026-10-30T00:00:00.0000000+00:00",
        futureExtra = new { text = "引号\"、反斜线\\、换行\n和音符🎵", nested = new object?[] { null, 1, true } }, libraryText = library,
    });
    private static string RenameDraft(string library, string name)
    { var state = JsonNode.Parse(library)!; state["drafts"]![0]!["name"] = name; return state.ToJsonString(); }
    private static string Token(string library)
    { var audio = JsonNode.Parse(library)!["contents"]![0]!["body"]!["audio"]!; Check(audio["encoding"]!.GetValue<string>() == "host-asset", "采样应被置入会话缓存"); return audio["data"]!.GetValue<string>(); }
    private static string DiskLibrary(string path) => JsonNode.Parse(File.ReadAllText(path, Utf8))!["libraryText"]!.GetValue<string>();
    private static byte[] Audio(string library)
    { var audio = JsonNode.Parse(library)!["contents"]![0]!["body"]!["audio"]!; Check(audio["encoding"]!.GetValue<string>() == "base64", "正式采样必须内嵌base64"); return Convert.FromBase64String(audio["data"]!.GetValue<string>()); }
    private static byte[] ReadSmall(Stream stream)
    { Check(stream.Length <= MaximumFixtureBytes, "不得读取大型fixture"); using var output = new MemoryStream(); stream.CopyTo(output); return output.ToArray(); }
    private static void SmallWrite(string path, string text)
    { Check(Utf8.GetByteCount(text) <= MaximumFixtureBytes, "不得写入大型fixture"); File.WriteAllText(path, text, Utf8); }
    private static string Hash(string path)
    { Check(new FileInfo(path).Length <= MaximumFixtureBytes, "不得校验大型fixture"); using var input = File.OpenRead(path); return Convert.ToHexString(SHA256.HashData(input)); }
    private static void Check(bool value, string message)
    { if (!value) throw new InvalidOperationException("轻量音频缓存检查失败：" + message); }
    private static void ExpectFailure(Action action, string message)
    {
        try { action(); }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException or JsonException or ArgumentException or InvalidDataException or ObjectDisposedException) { return; }
        throw new InvalidOperationException("轻量音频缓存检查失败：" + message);
    }
    private static byte[] Wave()
    {
        using var output = new MemoryStream(); using var writer = new BinaryWriter(output, Encoding.ASCII, leaveOpen: true);
        writer.Write(Encoding.ASCII.GetBytes("RIFF")); writer.Write(36 + 256 * 2); writer.Write(Encoding.ASCII.GetBytes("WAVEfmt "));
        writer.Write(16); writer.Write((short)1); writer.Write((short)1); writer.Write(8000); writer.Write(16000); writer.Write((short)2); writer.Write((short)16);
        writer.Write(Encoding.ASCII.GetBytes("data")); writer.Write(256 * 2);
        for (int index = 0; index < 256; index++) writer.Write((short)(Math.Sin(index * .3) * 4000));
        writer.Flush(); return output.ToArray();
    }
    private sealed class HeaderBudgetStream(byte[] bytes) : MemoryStream(bytes, writable: false)
    {
        public override int Read(byte[] buffer, int offset, int count)
        { if (Position + count > 4096) throw new InvalidOperationException("列表不应读入正文"); return base.Read(buffer, offset, count); }
    }
    private sealed class ChunkStream(byte[] bytes, int chunk) : MemoryStream(bytes, writable: false)
    {
        internal int LargestRead { get; private set; }
        public override int Read(byte[] buffer, int offset, int count)
        { int result = base.Read(buffer, offset, Math.Min(count, chunk)); LargestRead = Math.Max(LargestRead, result); return result; }
        public override int Read(Span<byte> buffer)
        { int result = base.Read(buffer[..Math.Min(buffer.Length, chunk)]); LargestRead = Math.Max(LargestRead, result); return result; }
    }
}
