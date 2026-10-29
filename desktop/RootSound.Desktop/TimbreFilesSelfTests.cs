using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace RootSound.Desktop;

/// <summary>Dedicated fixture directories only; never creates windows or audio devices.</summary>
internal static class TimbreFilesSelfTests
{
    internal static int Run(string testRoot)
    {
        string run = Path.Combine(Path.GetFullPath(testRoot), "timbre-files-" + Guid.NewGuid().ToString("N")); Directory.CreateDirectory(run);
        int passed = 0;
        var failures = new List<Exception>();
        void Case(string name, Action<string> action) { string directory = Path.Combine(run, name); Directory.CreateDirectory(directory); try { action(directory); passed++; } catch (Exception error) { failures.Add(new IOException(name + ": " + error.Message, error)); } }
        Case("strict-text-original-preserved", directory =>
        {
            foreach (string extension in new[] { ".rssynth", ".RSSYNTH", ".rssound", ".RsSoUnD" })
            {
                string file = Path.Combine(directory, "细调音色 🌤" + extension); File.WriteAllText(file, Patch, new UTF8Encoding(true));
                byte[] original = File.ReadAllBytes(file); DateTime stamp = File.GetLastWriteTimeUtc(file);
                Check(NativeTimbreFiles.ReadText(file) == Patch, "参数及小数原样读取、去除文本BOM");
                Check(original.SequenceEqual(File.ReadAllBytes(file)) && File.GetLastWriteTimeUtc(file) == stamp, "原音色字节与时间戳未改变");
            }
        });
        Case("invalid-input-does-not-write", directory =>
        {
            foreach (var item in new[] { ("empty.rssynth", ""), ("bad.rssynth", "{bad"), ("array.rssynth", "[]"), ("wrong.wav", "{}"), ("old.rstimbre", "{}") })
            { string file = Path.Combine(directory, item.Item1); File.WriteAllText(file, item.Item2); Reject(() => NativeTimbreFiles.ReadText(file)); }
            string invalid = Path.Combine(directory, "utf8.rssynth"); File.WriteAllBytes(invalid, [0xc3, 0x28]); Reject(() => NativeTimbreFiles.ReadText(invalid));
        });
        Case("input-size-bounds", directory =>
        {
            string synth = Path.Combine(directory, "large.rssynth"); using (var file = File.Create(synth)) file.SetLength(NativeTimbreFiles.MaximumJsonBytes + 1L);
            Reject(() => NativeTimbreFiles.ReadText(synth));
            string sound = Path.Combine(directory, "large.rssound"); using (var file = File.Create(sound)) file.SetLength(NativeTimbreFiles.MaximumSoundBytes + 1L);
            Reject(() => NativeTimbreFiles.ReadText(sound));
            string accepted = Path.Combine(directory, "sample-graph.rssound"); File.WriteAllText(accepted, "{}" + new string(' ', NativeTimbreFiles.MaximumJsonBytes + 1));
            Check(NativeTimbreFiles.ReadText(accepted).Length > NativeTimbreFiles.MaximumJsonBytes, "采样图允许超过合成参数4MiB的独立32MiB上限");
        });
        Case("locked-selection-retry", directory =>
        {
            string file = Path.Combine(directory, "tone.rssynth"); File.WriteAllText(file, Patch);
            using (var locked = new FileStream(file, FileMode.Open, FileAccess.ReadWrite, FileShare.None)) Reject(() => NativeTimbreFiles.ReadText(file));
            Check(NativeTimbreFiles.ReadText(file) == Patch, "占用释放后重试可读");
        });
        Case("picker-remembers-directory-across-restart", directory =>
        {
            string source = Path.Combine(directory, "外部音色"); Directory.CreateDirectory(source); string file = Path.Combine(source, "tone.rssynth"); File.WriteAllText(file, Patch);
            using var manager = new ProjectDirectoryManager(directory); string data = Path.Combine(directory, "preferences");
            var first = new NativeTimbreFiles(manager, data, _ => file); Check(Status(first.Open()) == "opened", "选择成功");
            string? initial = null; var restarted = new NativeTimbreFiles(manager, data, value => { initial = value; return null; });
            Check(Status(restarted.Open()) == "cancelled" && initial == source, "新服务从持久记录恢复选择目录，取消不改变记录");
            Check(manager.Current is null && !Directory.Exists(Path.Combine(directory, "timbres")), "选择文件不激活项目或复制未经验证的音色");
        });
        Case("selection-is-read-only-for-current-project", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory); var project = manager.Create("当前歌", manager.DefaultLocation, Library());
            byte[] disk = File.ReadAllBytes(project.Path); var before = manager.ReadLibrary(); string mirror = manager.TimbreFilesState.directory!;
            int count = Directory.GetFiles(mirror).Length; string file = Path.Combine(directory, "source.rssynth"); File.WriteAllText(file, Patch);
            var bridge = new NativeTimbreFiles(manager, Path.Combine(directory, "data"), _ => file);
            Check(Status(bridge.Open()) == "opened", "只读选择");
            Check(manager.Current == project && manager.ReadLibrary() == before && File.ReadAllBytes(project.Path).SequenceEqual(disk) && Directory.GetFiles(mirror).Length == count, "选择没有工程写入或目录副本副作用");
        });
        Case("all-models-and-sample-closure", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory); var project = manager.Create("全部音色", manager.DefaultLocation, Library(all: true));
            Check(manager.TimbreFilesState.status == "mirrored", manager.TimbreFilesState.message ?? "镜像成功");
            string path = manager.TimbreFilesState.directory!; Check(path == Path.Combine(directory, "timbres", Guid.Parse(project.Id).ToString("N")), "按稳定工程身份隔离");
            var entries = Index(path); Check(entries.Count == 4, "每种音色都有独立文件");
            string spectralCopy = File.ReadAllText(Path.Combine(path, Entry(entries, "spectral")));
            var expectedPatch = JsonNode.Parse(Patch)!.AsObject(); expectedPatch["name"] = "光谱";
            Check(JsonNode.DeepEquals(JsonNode.Parse(spectralCopy), expectedPatch) && spectralCopy.Contains("-0.123456789012345", StringComparison.Ordinal), "光谱patch保留当前显示名、完整小数和参数");
            using var basic = JsonDocument.Parse(File.ReadAllText(Path.Combine(path, Entry(entries, "basic")))); Check(basic.RootElement.GetProperty("version").GetInt32() == 1, "内置简单音色正确可重开版本");
            using var synth = JsonDocument.Parse(File.ReadAllText(Path.Combine(path, Entry(entries, "synth")))); Check(synth.RootElement.GetProperty("version").GetInt32() == 2, "合成器正确文件版本");
            using var sample = JsonDocument.Parse(File.ReadAllText(Path.Combine(path, Entry(entries, "sample"))));
            Check(sample.RootElement.GetProperty("format").GetString() == "RootSoundTimbre" && sample.RootElement.GetProperty("contents")[0].GetProperty("id").GetString() == "audio", "采样音色包含完整素材依赖");
            Check(!Directory.EnumerateDirectories(manager.DefaultLocation).Any(), "歌曲默认目录仍保持单工程文件结构");
        });
        Case("unchanged-copies-skip-writes", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory); manager.Create("未变", manager.DefaultLocation, Library());
            string path = manager.TimbreFilesState.directory!; var stamps = Directory.GetFiles(path).ToDictionary(file => file, File.GetLastWriteTimeUtc);
            manager.WriteLibrary(Library()); manager.SyncTimbres();
            Check(stamps.All(item => File.GetLastWriteTimeUtc(item.Key) == item.Value), "未变音色与索引不反复写盘");
        });
        Case("spectral-rename-preserves-current-name-without-truncation", directory =>
        {
            var state = JsonNode.Parse(Library(all: true))!.AsObject(); var tone = state["contents"]!.AsArray().First(item => item!["id"]!.GetValue<string>() == "spectral")!;
            using var manager = new ProjectDirectoryManager(directory); manager.Create("改名", manager.DefaultLocation, state.ToJsonString()); string path = manager.TimbreFilesState.directory!;
            tone["name"] = "现在的铺底名"; manager.WriteLibrary(state.ToJsonString()); manager.Save(); string shortFile = Entry(Index(path), "spectral");
            using (var renamed = JsonDocument.Parse(File.ReadAllText(Path.Combine(path, shortFile)))) Check(renamed.RootElement.GetProperty("name").GetString() == "现在的铺底名", "镜像合成音色用当前实体名称");
            string longName = new('长', 121); tone["name"] = longName; manager.WriteLibrary(state.ToJsonString()); manager.Save(); string longFile = Entry(Index(path), "spectral");
            using var portable = JsonDocument.Parse(File.ReadAllText(Path.Combine(path, longFile)));
            Check(longFile.EndsWith(".rssound", StringComparison.Ordinal) && !File.Exists(Path.Combine(path, shortFile)) && portable.RootElement.GetProperty("timbre").GetProperty("name").GetString() == longName, "长名称改用完整图容器而不截断或产生无效rssynth");
        });
        Case("note-only-writes-never-read-large-unchanged-tone-copies", directory =>
        {
            var state = JsonNode.Parse(Library(all: true))!.AsObject(); var records = state["contents"]!.AsArray();
            records.First(item => item!["id"]!.GetValue<string>() == "audio")!["body"]!["audio"] = new string('A', 4 * 1024 * 1024);
            records.Add(JsonNode.Parse("{\"id\":\"phrase-for-edit\",\"kind\":\"rootsound.phrase\",\"revision\":1,\"name\":\"编辑乐句\",\"dependencies\":[],\"body\":{\"parts\":[],\"notePosition\":0}}"));
            using var manager = new ProjectDirectoryManager(directory); manager.Create("大采样", manager.DefaultLocation, state.ToJsonString());
            string path = manager.TimbreFilesState.directory!, sampleFile = Path.Combine(path, Entry(Index(path), "sample"));
            Check(new FileInfo(sampleFile).Length > 4 * 1024 * 1024, "多MiB采样图副本真实存在");
            long beforeRead = manager.TimbrePayloadBytesRead, beforeWrites = manager.TimbrePayloadFilesWritten;
            for (int note = 1; note <= 5; note++) { records[^1]!["body"]!["notePosition"] = note; manager.WriteLibrary(state.ToJsonString()); }
            Check(manager.TimbrePayloadBytesRead == beforeRead && manager.TimbrePayloadFilesWritten == beforeWrites, "只改乐句时自动镜像不读取或重写未变音色副本");
            File.AppendAllText(sampleFile, "外部改动"); manager.SyncTimbres();
            Check(manager.TimbreFilesState.status == "warning" && manager.TimbrePayloadBytesRead > beforeRead && File.ReadAllText(sampleFile).EndsWith("外部改动", StringComparison.Ordinal), "显式同步仍物理核验并保留外部改动");
            records[^1]!["body"]!["notePosition"] = 6; manager.WriteLibrary(state.ToJsonString()); Check(manager.TimbreFilesState.status == "warning", "普通自动写不虚报冲突已经修复");
            File.Delete(sampleFile); manager.Save(); Check(File.Exists(sampleFile) && manager.TimbreFilesState.status == "mirrored", "显式保存会补回缺失副本并重新核验");
        });
        Case("edit-draft-and-history", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory); manager.Create("编辑", manager.DefaultLocation, Library());
            string path = manager.TimbreFilesState.directory!; string originalFile = Entry(Index(path), "basic");
            JsonObject library = JsonNode.Parse(Library())!.AsObject(); var draft = JsonNode.Parse(Basic)!.AsObject(); draft["id"] = "draft-basic"; draft["sourceId"] = "basic"; draft["baseRevision"] = 1; draft["name"] = "修改中的音色"; draft.Remove("revision");
            library["drafts"] = new JsonArray(draft); library["editHistory"] = new JsonObject { ["retiredTone"] = JsonNode.Parse(Spectral) };
            byte[] originalCopy = File.ReadAllBytes(Path.Combine(path, originalFile)); manager.WriteLibrary(library.ToJsonString()); manager.SyncTimbres();
            Check(File.ReadAllBytes(Path.Combine(path, originalFile)).SequenceEqual(originalCopy), "草稿与显式同步不改正式音色副本");
            manager.Save(); var entries = Index(path);
            Check(entries.Count == 1 && Entry(entries, "basic") == originalFile, "草稿覆盖同一保存身份，不制造重名历史副本");
            using var copied = JsonDocument.Parse(File.ReadAllText(Path.Combine(path, originalFile))); Check(copied.RootElement.GetProperty("name").GetString() == "修改中的音色", "显式保存之后更新音色文件");
        });
        Case("remove-managed-leave-user-files", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory); manager.Create("移除", manager.DefaultLocation, Library(all: true)); string path = manager.TimbreFilesState.directory!;
            string user = Path.Combine(path, "用户记录.txt"); File.WriteAllText(user, "保留"); manager.WriteLibrary(Library()); manager.Save();
            Check(Index(path).Count == 1 && Directory.GetFiles(path).Length == 3 && File.ReadAllText(user) == "保留", "仅清理已登记且未被外部改动的旧音色文件");
        });
        Case("save-as-independent-and-portable-reopen", directory =>
        {
            string originalPath; string originalMirror; string text = Library(all: true);
            using (var manager = new ProjectDirectoryManager(directory))
            {
                var original = manager.Create("原歌", manager.DefaultLocation, text); originalPath = original.Path; originalMirror = manager.TimbreFilesState.directory!;
                var copy = manager.CreateCopy("原歌 1", manager.DefaultLocation, text); string copyMirror = manager.TimbreFilesState.directory!;
                Check(copy.Id != original.Id && copyMirror != originalMirror && Index(copyMirror).Count == 4, "另存为拥有完全独立音色目录");
                manager.WriteLibrary(Library()); manager.Save(); Check(Index(originalMirror).Count == 4 && Index(copyMirror).Count == 1, "修改副本不影响原歌音色");
            }
            string receiving = Path.Combine(directory, "另一台设备"); Directory.CreateDirectory(receiving); string received = Path.Combine(receiving, "收到.rootsound"); File.Copy(originalPath, received);
            using var receiver = new ProjectDirectoryManager(receiving); receiver.Open(received);
            Check(Index(receiver.TimbreFilesState.directory!).Count == 4 && receiver.ReadLibrary().Value == text, "单工程文件在新位置再生完整音色，无源路径依赖");
        });
        Case("modified-copy-preserved-with-visible-warning", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory); manager.Create("保护", manager.DefaultLocation, Library()); string path = manager.TimbreFilesState.directory!;
            string file = Path.Combine(path, Entry(Index(path), "basic")); File.WriteAllText(file, "外部修改");
            var changedState = JsonNode.Parse(Library())!.AsObject(); changedState["contents"]![0]!["name"] = "新名称"; string changed = changedState.ToJsonString(); manager.WriteLibrary(changed); manager.Save();
            Check(manager.ReadLibrary().Value == changed && manager.TimbreFilesState.status == "warning" && File.ReadAllText(file) == "外部修改", "工程写入成功，外部目录改动保留且告警可见");
            Check(manager.SyncTimbres().status == "warning", "明确同步仍报告冲突");
            File.Delete(file); Check(manager.SyncTimbres().status == "mirrored", "用户移走冲突副本后可恢复镜像");
        });
        Case("mirror-failure-does-not-reverse-project-success", directory =>
        {
            string blocked = Path.Combine(directory, "timbres"); File.WriteAllText(blocked, "目录被同名文件占用");
            using var manager = new ProjectDirectoryManager(directory); var project = manager.Create("恢复", manager.DefaultLocation, Library());
            Check(File.Exists(project.Path) && manager.TimbreFilesState.status == "warning", "不把成功工程提交误报失败");
            File.Delete(blocked); Check(manager.SyncTimbres().status == "mirrored" && Index(manager.TimbreFilesState.directory!).Count == 1, "原工程可重试目录恢复");
        });
        Case("failed-project-write-never-publishes-new-copy", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory); var project = manager.Create("冲突", manager.DefaultLocation, Library()); string path = manager.TimbreFilesState.directory!;
            var files = Directory.GetFiles(path).ToDictionary(file => file, File.ReadAllBytes); File.AppendAllText(project.Path, " ");
            Reject(() => manager.WriteLibrary(Library(all: true)));
            Check(files.All(item => File.ReadAllBytes(item.Key).SequenceEqual(item.Value)) && Directory.GetFiles(path).Length == files.Count, "工程提交失败不新增或改写音色副本");
            Check(manager.SyncTimbres().status == "warning", "同步不接管外部改动的工程");
        });
        Case("index-path-traversal-stays-within-project", directory =>
        {
            string projectPath; string mirror;
            using (var manager = new ProjectDirectoryManager(directory)) { projectPath = manager.Create("路径", manager.DefaultLocation, Library()).Path; mirror = manager.TimbreFilesState.directory!; }
            string outside = Path.Combine(directory, "outside.txt"); File.WriteAllText(outside, "不能改");
            var index = JsonNode.Parse(File.ReadAllText(Path.Combine(mirror, "index.json")))!.AsObject(); index["entries"]![0]!["file"] = "../../outside.txt";
            File.WriteAllText(Path.Combine(mirror, "index.json"), index.ToJsonString());
            using var reopened = new ProjectDirectoryManager(directory); reopened.Open(projectPath);
            Check(reopened.TimbreFilesState.status == "warning" && File.ReadAllText(outside) == "不能改", "恶意索引不能扩大文件操作范围");
        });
        Case("scoped-membership-live-and-stale-drafts", directory =>
        {
            JsonObject library = JsonNode.Parse(Library())!.AsObject(); JsonArray records = library["contents"]!.AsArray();
            var basic = records[0]!.AsObject(); basic["revision"] = 2; basic["body"]!["level"] = .8;
            foreach (string id in new[] { "member", "work", "added", "orphan", "foreign" }) { var tone = JsonNode.Parse(Basic)!.AsObject(); tone["id"] = id; tone["name"] = id; records.Add(tone); }
            records.Add(JsonNode.Parse("{\"id\":\"phrase\",\"kind\":\"rootsound.phrase\",\"revision\":1,\"name\":\"乐句\",\"dependencies\":[\"orphan\"],\"body\":{\"parts\":[{\"name\":\"旧\",\"timbreId\":\"orphan\",\"notes\":[{}]}]}}"));
            JsonObject Song(string id, string dependency) => new() { ["id"] = id, ["kind"] = "rootsound.song", ["name"] = id, ["dependencies"] = new JsonArray(dependency), ["body"] = new JsonObject() };
            JsonObject Work(string id, string source, int revision, double level) { var draft = JsonNode.Parse(Basic)!.AsObject(); draft["id"] = id; draft["sourceId"] = source; draft["baseRevision"] = revision; draft["name"] = id; draft["body"]!["level"] = level; draft.Remove("revision"); return draft; }
            var phraseDraft = JsonNode.Parse(records[^1]!.ToJsonString())!.AsObject(); phraseDraft["id"] = "working-phrase"; phraseDraft["sourceId"] = "phrase"; phraseDraft["baseRevision"] = 1; phraseDraft.Remove("revision");
            phraseDraft["dependencies"] = new JsonArray("added"); phraseDraft["body"]!["parts"]![0]!["timbreId"] = "added";
            library["drafts"] = new JsonArray(Song("song-a", "phrase"), Song("song-b", "foreign"), Work("stale", "basic", 1, .1), Work("current-work", "work", 1, .45), phraseDraft);
            library["projectScopes"] = new JsonObject { ["version"] = 1,
                ["roots"] = new JsonArray(new JsonObject { ["type"] = "draft", ["id"] = "song-a", ["scopeId"] = "a" }, new JsonObject { ["type"] = "draft", ["id"] = "song-b", ["scopeId"] = "b" }),
                ["contents"] = new JsonArray(records.Select(item => (JsonNode)new JsonObject { ["id"] = item!["id"]!.GetValue<string>(), ["scopeId"] = item["id"]!.GetValue<string>() == "foreign" ? "b" : "a" }).ToArray()),
                ["members"] = new JsonArray(new[] { "basic", "member", "work" }.Select(id => (JsonNode)new JsonObject { ["id"] = id, ["scopeId"] = "a" }).ToArray()) };
            using var manager = new ProjectDirectoryManager(directory); manager.Create("归属", manager.DefaultLocation, library.ToJsonString()); manager.SyncTimbres("song-a");
            string path = manager.TimbreFilesState.directory!; var entries = Index(path); string[] expected = ["added", "basic", "member", "work"];
            Check(entries.Select(item => item!["id"]!.GetValue<string>()).Order().SequenceEqual(expected), "只含当前根、显式成员和有效乐句工作稿引用，不含历史保管或其他歌曲");
            using var current = JsonDocument.Parse(File.ReadAllText(Path.Combine(path, Entry(entries, "work"))));
            Check(current.RootElement.GetProperty("name").GetString() == "current-work" && current.RootElement.GetProperty("timbre").GetProperty("level").GetDouble() == .45, "有效工作音色版本可见");
            using var saved = JsonDocument.Parse(File.ReadAllText(Path.Combine(path, Entry(entries, "basic")))); Check(saved.RootElement.GetProperty("timbre").GetProperty("level").GetDouble() == .8, "过期baseRevision工作稿不覆盖当前保存版");
            manager.WriteLibrary(library.ToJsonString()); Check(Index(path).Count == 4, "自动写入保留显式当前根，而非最后一个其他歌曲根");
        });
        Case("future-project-deletion-removes-only-owned-copies", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory); var first = manager.Create("待删除", manager.DefaultLocation, Library(all: true)); string firstMirror = manager.TimbreFilesState.directory!;
            var second = manager.Create("继续保留", manager.DefaultLocation, Library()); string secondMirror = manager.TimbreFilesState.directory!;
            manager.Delete(first.Path, first.Id); Check(!File.Exists(first.Path) && !Directory.Exists(firstMirror), "永久删除清理对应自有派生目录");
            Check(File.Exists(second.Path) && Index(secondMirror).Count == 1 && manager.Current == second && manager.LastTimbreCleanupWarning is null, "其他歌曲和当前编辑工程不受影响");
            Reject(() => manager.Delete(second.Path, second.Id)); Check(Directory.Exists(secondMirror), "拒绝删除正在编辑的歌时不清理音色");
        });
        Case("future-project-deletion-preserves-edited-and-unlisted-files", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory); var selected = manager.Create("有用户修改", manager.DefaultLocation, Library(all: true)); string mirror = manager.TimbreFilesState.directory!;
            string modified = Path.Combine(mirror, Entry(Index(mirror), "basic")); File.WriteAllText(modified, "用户修改"); string user = Path.Combine(mirror, "用户文件.txt"); File.WriteAllText(user, "保留"); manager.Exit("save");
            var bridge = new NativeProjectDirectories(manager, _ => null, () => null);
            using var result = JsonDocument.Parse(bridge.Delete(selected.Path, selected.Id));
            Check(result.RootElement.GetProperty("status").GetString() == "deleted" && !string.IsNullOrEmpty(result.RootElement.GetProperty("warning").GetString()), "主工程删除成功，副本剩余以独立警告告知");
            Check(!File.Exists(selected.Path) && File.ReadAllText(modified) == "用户修改" && File.ReadAllText(user) == "保留" && Directory.GetFiles(mirror).Length == 3, "仅保留改动文件、额外文件与索引，无递归删除");
        });
        string fixtures = Path.GetFullPath(Path.Combine(testRoot, ".."));
        string realLibrary = Path.Combine(fixtures, "real-library.json"), expectedIds = Path.Combine(fixtures, "expected-ids.json");
        if (File.Exists(realLibrary) && File.Exists(expectedIds)) Case("real-typescript-current-project-view", directory =>
        {
            using var expected = JsonDocument.Parse(File.ReadAllText(expectedIds)); string source = File.ReadAllText(realLibrary);
            using var manager = new ProjectDirectoryManager(directory); manager.Create("真实TS库", manager.DefaultLocation, source);
            manager.SyncTimbres(expected.RootElement.GetProperty("songDraftId").GetString()); string mirror = manager.TimbreFilesState.directory!;
            Check(manager.TimbreFilesState.status == "mirrored", manager.TimbreFilesState.message ?? "真实库镜像"); var entries = Index(mirror);
            string[] wanted = expected.RootElement.GetProperty("toneIds").EnumerateArray().Select(id => id.GetString()!).Order().ToArray();
            Check(entries.Select(item => item!["id"]!.GetValue<string>()).Order().SequenceEqual(wanted), "真实currentProjectView/listProjectTimbres音色身份精确一致");
            foreach (var tone in expected.RootElement.GetProperty("tones").EnumerateArray())
            {
                string file = Path.Combine(mirror, Entry(entries, tone.GetProperty("id").GetString()!)); using var copied = JsonDocument.Parse(File.ReadAllText(file));
                Check(copied.RootElement.GetProperty("name").GetString() == tone.GetProperty("name").GetString(), "当前工作音色名称一致");
                Check(JsonNode.DeepEquals(JsonNode.Parse(copied.RootElement.GetProperty("timbre").GetRawText()), JsonNode.Parse(tone.GetProperty("body").GetRawText())), "当前音色参数与TS预期一致");
            }
        });
        if (failures.Count > 0) throw new AggregateException(failures);
        return passed;
    }

    private const string Patch = "{\"format\":\"RootSoundSpectralPatch\",\"version\":1,\"name\":\"精细铺底\",\"points\":[{\"x\":20,\"y\":-0.123456789012345}]}";
    private const string Basic = "{\"id\":\"basic\",\"kind\":\"rootsound.timbre\",\"schemaVersion\":1,\"owner\":\"timbre\",\"name\":\"圆润\",\"revision\":1,\"dependencies\":[],\"body\":{\"model\":\"basic-synth\",\"version\":1,\"character\":\"warm\",\"attackSeconds\":0.1,\"releaseSeconds\":0.2,\"level\":0.5}}";
    private static string Spectral => "{\"id\":\"spectral\",\"kind\":\"rootsound.timbre\",\"schemaVersion\":1,\"owner\":\"timbre\",\"name\":\"光谱\",\"revision\":1,\"dependencies\":[],\"body\":{\"model\":\"spectral-synth\",\"version\":1,\"patch\":" + Patch + "}}";
    private static string Library(bool all = false)
    {
        var records = new JsonArray(JsonNode.Parse(Basic));
        if (all)
        {
            records.Add(JsonNode.Parse(Spectral)); var synth = JsonNode.Parse(Basic)!.AsObject(); synth["id"] = "synth"; synth["body"]!["model"] = "synthesizer"; records.Add(synth);
            var sample = JsonNode.Parse(Basic)!.AsObject(); sample["id"] = "sample"; sample["body"] = new JsonObject { ["model"] = "sample-instrument", ["version"] = 1, ["sampleId"] = "audio" }; sample["dependencies"] = new JsonArray("audio"); records.Add(sample);
            records.Add(JsonNode.Parse("{\"id\":\"audio\",\"kind\":\"rootsound.sample\",\"revision\":1,\"dependencies\":[],\"body\":{\"audio\":\"AQID\"}}"));
        }
        return new JsonObject { ["format"] = "RootSoundMaterialLibrary", ["version"] = 1, ["contents"] = records, ["drafts"] = new JsonArray() }.ToJsonString();
    }
    private static JsonArray Index(string directory) => JsonNode.Parse(File.ReadAllText(Path.Combine(directory, "index.json")))!["entries"]!.AsArray();
    private static string Entry(JsonArray entries, string id) => entries.First(item => item!["id"]!.GetValue<string>() == id)!["file"]!.GetValue<string>();
    private static string Status(string json) { using var document = JsonDocument.Parse(json); return document.RootElement.GetProperty("status").GetString()!; }
    private static void Check(bool value, string label) { if (!value) throw new InvalidOperationException(label); }
    private static void Reject(Action action) { try { action(); } catch (Exception) { return; } throw new InvalidOperationException("应拒绝无效或冲突操作"); }
}
