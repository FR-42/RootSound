using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace RootSound.Desktop;

/// <summary>Checks only use the supplied test root. No windows or audio devices are opened.</summary>
internal static class ProjectDirectoriesSelfTests
{
    public static int Run(string testRoot)
    {
        string run = Path.Combine(Path.GetFullPath(testRoot), "single-file-projects-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(run);
        int completed = 0;
        void Case(string name, Action<string> test)
        {
            string path = Path.Combine(run, name);
            Directory.CreateDirectory(path);
            test(path);
            completed++;
        }
        string seed = Path.Combine(Path.GetFullPath(testRoot), "ts-seed.json");
        if (File.Exists(seed)) Case("typescript-seed", root =>
        {
            string text = File.ReadAllText(seed);
            ProjectDirectoryInfo p;
            using (var m = new ProjectDirectoryManager(root))
            {
                p = m.Create("完整种子", m.DefaultLocation, text);
                Check(m.ReadLibrary().Value == text, "种子原文保存");
            }
            using var reopened = new ProjectDirectoryManager(root);
            reopened.Open(p.Path);
            Check(reopened.ReadLibrary().Value == text, "种子完整重开");
        });

        Case("welcome-memory", root =>
        {
            using (var m = new ProjectDirectoryManager(root))
            {
                var s = new NativeStorage(m);
                var snapshot = Snapshot(s);
                Check(snapshot.Value is null && m.Current is null, "启动为空内存");
                Check(Ok(s.WriteScoped(Library("欢迎"), snapshot.Scope)), "欢迎内存写入");
                Check(m.List().Count == 0 && !Directory.Exists(m.DefaultLocation), "欢迎不建目录");
            }
            using var again = new ProjectDirectoryManager(root);
            Check(again.ReadLibrary().Value is null, "重启不接管旧库");
        });

        Case("single-self-contained-file", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            string text = Library("全部参数 🌧", "{\"audio\":\"AAECAw==\",\"editable\":[1,2,3]}");
            var p = m.Create("雨后的琴声 🌧", m.DefaultLocation, text);
            Check(p.Path == Path.Combine(m.DefaultLocation, "雨后的琴声 🌧.rootsound") && File.Exists(p.Path), "默认目录单文件");
            Check(!Directory.EnumerateDirectories(m.DefaultLocation).Any() && Directory.EnumerateFiles(m.DefaultLocation).Count() == 1, "首次创建无子目录或旁文件");
            var e = Envelope(p.Path);
            Check(e["format"]!.GetValue<string>() == "RootSoundWorkspace" && e["version"]!.GetValue<int>() == 2 && e["id"]!.GetValue<string>() == p.Id && e["libraryText"]!.GetValue<string>() == text, "版本化文件完整封装");
            Check(m.ReadLibrary().Value == text && Guid.TryParse(p.Id, out _), "原文和身份有效");
        });

        Case("copy-to-another-installation", root =>
        {
            string other = Path.Combine(root, "另一台设备");
            Directory.CreateDirectory(other);
            string copy = Path.Combine(other, "转发.rootsound");
            ProjectDirectoryInfo p;
            using (var m = new ProjectDirectoryManager(root))
            {
                p = m.Create("可转发", m.DefaultLocation, Library("全部依赖", "{\"audio\":\"AAEC\"}"));
                File.Copy(p.Path, copy);
            }
            using var receiver = new ProjectDirectoryManager(other);
            Check(receiver.Open(copy).Id == p.Id && receiver.ReadLibrary().Value == DiskLibrary(p.Path), "单文件独立重开");
            receiver.WriteLibrary(Library("副本修改"));
            Check(DiskLibrary(p.Path) != receiver.ReadLibrary().Value, "副本修改隔离");
        });

        Case("independent-songs-and-save-as", root =>
        {
            ProjectDirectoryInfo a, b, c;
            using (var m = new ProjectDirectoryManager(root))
            {
                a = m.Create("甲", m.DefaultLocation, Library("甲"));
                m.WriteLibrary(Library("甲修改"));
                b = m.Create("乙", m.DefaultLocation, Library("乙"));
                c = m.Create("乙 1", m.DefaultLocation, m.ReadLibrary().Value!);
                Check(c.Id != b.Id, "另存为新身份");
                m.WriteLibrary(Library("副本"));
            }
            using var r = new ProjectDirectoryManager(root);
            r.Open(a.Path);
            Check(r.ReadLibrary().Value == Library("甲修改"), "甲独立恢复");
            r.Open(b.Path);
            Check(r.ReadLibrary().Value == Library("乙"), "乙保留原件");
            r.Open(c.Path);
            Check(r.ReadLibrary().Value == Library("副本"), "副本独立");
        });

        Case("custom-location", root =>
        {
            string other = Path.Combine(root, "自选位置");
            Directory.CreateDirectory(other);
            using var m = new ProjectDirectoryManager(Path.Combine(root, "安装根"));
            var p = m.Create("自选歌曲", other, Library("自选"));
            Check(p.Path == Path.Combine(other, "自选歌曲.rootsound") && !Directory.Exists(m.DefaultLocation), "一次性位置不改变默认目录");
        });

        Case("scope-invalidates-old-pages", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var s = new NativeStorage(m);
            string welcome = Snapshot(s).Scope;
            var a = m.Create("甲", m.DefaultLocation, Library("甲"));
            string first = Snapshot(s).Scope;
            var b = m.Create("乙", m.DefaultLocation, Library("乙"));
            Check(!Ok(s.WriteScoped(Library("旧欢迎"), welcome)) && !Ok(s.WriteScoped(Library("旧甲"), first)) && DiskLibrary(b.Path) == Library("乙"), "旧页面不能写当前项目");
            m.Open(a.Path);
            string reopened = Snapshot(s).Scope;
            m.Open(a.Path);
            Check(!Ok(s.WriteScoped(Library("旧同页"), reopened)) && !Ok(s.Write(Library("无身份"))) && !Ok(s.WriteScoped(Library("空身份"), "")), "重开废止旧身份");
            Check(Ok(s.WriteScoped(Library("当前"), Snapshot(s).Scope)), "当前页可保存");
        });

        Case("names-and-target-conflicts", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var active = m.Create("原件", m.DefaultLocation, Library("保留"));
            string scope = m.ReadLibrary().Scope;
            foreach (string name in new[]
            {
                ""," ",".","..","../越界","子目录/越界","子目录\\越界","有:冒号","末尾.","CON","nul.txt","COM1","lpt9.wav","COM¹","\ud800"
            }) ExpectFailure(() => m.Create(name, m.DefaultLocation, Library("拒绝")), "非法名称");
            ExpectFailure(() => m.Create("原件", m.DefaultLocation, Library("拒绝")), "不能覆盖同名文件");
            Directory.CreateDirectory(Path.Combine(m.DefaultLocation, "旧目录"));
            ExpectFailure(() => m.Create("旧目录", m.DefaultLocation, Library("拒绝")), "旧同名目录冲突");
            Check(m.Current == active && m.ReadLibrary().Scope == scope && DiskLibrary(active.Path) == Library("保留"), "冲突保留工程");
        });

        Case("invalid-library-before-creation", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            foreach (string text in new[]
            {
                "","{","null","[]","{}","{\"format\":\"RootSoundMaterialLibrary\",\"version\":2,\"contents\":[],\"drafts\":[]}",Library("\ud800")
            }) ExpectFailure(() => m.Create("无效", m.DefaultLocation, text), "无效资料");
            Check(!Directory.Exists(m.DefaultLocation), "校验失败不建目录");
            ExpectFailure(() => m.Create("相对路径", "relative", Library("有效")), "相对位置拒绝");
            ExpectFailure(() => m.Create("不存在", Path.Combine(root, "不存在"), Library("有效")), "非默认位置不存在拒绝");
        });

        Case("strict-unicode-and-byte-limit", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("大小保护", m.DefaultLocation, Library("原件"));
            byte[] before = File.ReadAllBytes(p.Path);
            string big = Library("占位").Replace(JsonSerializer.Serialize("占位"), "\"" + new string('界', AtomicTextStore.MaximumBytes / 3 + 1) + "\"");
            Check(big.Length < AtomicTextStore.MaximumBytes, "字节与字符不同");
            ExpectFailure(() => m.WriteLibrary(big), "UTF8字节超限");
            ExpectFailure(() => m.WriteLibrary("\ud800"), "无效Unicode");
            Check(File.ReadAllBytes(p.Path).SequenceEqual(before), "拒绝保留文件");
        });

        Case("racing-create", root =>
        {
            using var m = new ProjectDirectoryManager(root, target => File.WriteAllText(target, "竞争者文件"));
            m.WriteLibrary(Library("内存"));
            var before = m.ReadLibrary();
            ExpectFailure(() => m.Create("并发", m.DefaultLocation, Library("候选")), "竞争提交拒绝");
            Check(File.ReadAllText(Path.Combine(m.DefaultLocation, "并发.rootsound")) == "竞争者文件" && m.Current is null && m.ReadLibrary() == before, "竞争目标和内存保留");
            Check(!Directory.EnumerateFiles(m.DefaultLocation, ".rootsound-create-*").Any(), "候选清理");
        });

        Case("atomic-failure-and-backup", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("原子写", m.DefaultLocation, Library("一"));
            m.WriteLibrary(Library("二"));
            byte[] before = File.ReadAllBytes(p.Path), backup = File.ReadAllBytes(p.Path + ".bak");
            using (var blocker = new FileStream(p.Path, FileMode.Open, FileAccess.Read, FileShare.Read)) ExpectFailure(() => m.WriteLibrary(Library("不能提交")), "锁定替换拒绝");
            Check(File.ReadAllBytes(p.Path).SequenceEqual(before) && File.ReadAllBytes(p.Path + ".bak").SequenceEqual(backup), "失败保留原件及备份");
            Check(!Directory.EnumerateFiles(m.DefaultLocation, "*.tmp").Any(), "写候选清理");
            m.WriteLibrary(Library("恢复"));
            Check(DiskLibrary(p.Path) == Library("恢复"), "故障后可重试");
        });

        Case("external-library-and-missing-file", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("外部保护", m.DefaultLocation, Library("原件"));
            WriteDiskLibrary(p.Path, Library("外部修改"));
            ExpectFailure(() => m.WriteLibrary(Library("不能覆盖")), "外部修改保护");
            Check(m.ReadLibrary().Value == Library("外部修改"), "明确读取接纳有效版本");
            m.WriteLibrary(Library("合并"));
            Check(DiskLibrary(p.Path + ".bak") == Library("外部修改"), "备份外部版本");
            File.Delete(p.Path);
            ExpectFailure(() => m.ReadLibrary(), "缺失不能读空白");
            ExpectFailure(() => m.WriteLibrary(Library("不能重建")), "缺失不得重建");
            Check(!File.Exists(p.Path), "文件保持移走");
        });

        Case("failed-reopen-preserves-conflict", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("损坏保护", m.DefaultLocation, Library("原件"));
            string scope = m.ReadLibrary().Scope;
            File.WriteAllText(p.Path, "{外部损坏");
            ExpectFailure(() => m.Open(p.Path), "重开须校验封装");
            ExpectFailure(() => m.WriteLibrary(Library("不能覆盖"), scope), "失败不能接纳损坏基线");
            Check(m.Current == p && File.ReadAllText(p.Path) == "{外部损坏", "失败保留会话和外部字节");
        });

        Case("invalid-open-releases-lock", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("活动", m.DefaultLocation, Library("原件"));
            string broken = Path.Combine(root, "损坏.rootsound");
            File.WriteAllText(broken, "{}");
            ExpectFailure(() => m.Open(broken), "非法文件拒绝");
            using (var owner = AtomicTextStore.ForProjectFile(broken)) Check(owner.Read() == "{}", "失败释放候选锁");
            Check(m.Current == p && m.ReadLibrary().Value == Library("原件"), "失败不切换");
        });

        Case("envelope-validation-and-bom", root =>
        {
            string path;
            using (var maker = new ProjectDirectoryManager(root)) path = maker.Create("种子", maker.DefaultLocation, Library("原件")).Path;
            var seed = Envelope(path);
            string broken = Path.Combine(root, "格式测试.rootsound");
            foreach (string field in new[]
            {
                "format","version","id","name","createdAtUtc","libraryText"
            })
            {
                var e = (JsonObject)seed.DeepClone();
                e[field] = null;
                File.WriteAllText(broken, e.ToJsonString());
                using var m = new ProjectDirectoryManager(root);
                ExpectFailure(() => m.Open(broken), "必需字段校验：" + field);
            }
            foreach (string version in new[]
            {
                "1","3","1.1","\"2\""
            })
            {
                var e = (JsonObject)seed.DeepClone();
                e["version"] = JsonNode.Parse(version);
                File.WriteAllText(broken, e.ToJsonString());
                using var m = new ProjectDirectoryManager(root);
                ExpectFailure(() => m.Open(broken), "不兼容版本拒绝");
            }
            var bad = (JsonObject)seed.DeepClone();
            bad["libraryText"] = "{}";
            File.WriteAllText(broken, bad.ToJsonString());
            using (var m = new ProjectDirectoryManager(root)) ExpectFailure(() => m.Open(broken), "嵌套库也校验");
            File.WriteAllText(broken, seed.ToJsonString(), new UTF8Encoding(true));
            using (var m = new ProjectDirectoryManager(root)) Check(m.Open(broken).Name == "种子", "UTF8 BOM兼容");
        });

        Case("exclusive-owner-and-dispose", root =>
        {
            ProjectDirectoryInfo p;
            using (var first = new ProjectDirectoryManager(root))
            {
                p = first.Create("独占", first.DefaultLocation, Library("原件"));
                using var second = new ProjectDirectoryManager(root);
                ExpectFailure(() => second.Open(p.Path), "同时接管拒绝");
                Check(second.Current is null && second.List().Single().Id == p.Id, "只读目录不用锁");
            }
            using var again = new ProjectDirectoryManager(root);
            Check(again.Open(p.Path).Id == p.Id, "释放后能接管");
        });

        Case("bridge-cancel-and-file-picker-path", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("桥接", m.DefaultLocation, Library("原件"));
            var cancel = new NativeProjectDirectories(m, _ => null, () => null);
            Check(Status(cancel.Open()) == "cancelled" && Status(cancel.ChooseLocation("")) == "cancelled", "取消不切换");
            Check(Status(cancel.Create("CON", m.DefaultLocation, Library("拒绝"))) == "error" && m.Current == p, "错误明确");
            int calls = 0;
            var bridge = new NativeProjectDirectories(m, _ => root, () =>
            {
                calls++;
                return p.Path;
            });
            Check(Status(bridge.Open()) == "opened" && calls == 1 && m.Current == p, "自定义选择器接受文件路径");
        });

        Case("checkpoint-and-first-loader-baseline", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("检查点", m.DefaultLocation, Library("初始"));
            m.WriteLibrary(Library("加载脚手架"));
            Check(m.HasUnsavedChanges, "检测修改");
            m.FinishLoading();
            Check(!m.HasUnsavedChanges, "首次加载基线");
            m.WriteLibrary(Library("用户修改"));
            m.FinishLoading();
            Check(m.HasUnsavedChanges, "重复加载不能掩盖编辑");
            Check(m.Save().Id == p.Id && !m.HasUnsavedChanges && m.List().Count == 1, "保存只更新一个项目");
            m.WriteLibrary(Library("未保存"));
            m.Exit("discard");
            using var again = new ProjectDirectoryManager(root);
            again.Open(p.Path);
            Check(again.ReadLibrary().Value == Library("用户修改"), "丢弃恢复显式保存点");
        });

        Case("discard-releases-scope-and-file", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("丢弃", m.DefaultLocation, Library("保存点"));
            m.FinishLoading();
            m.WriteLibrary(Library("未保存"));
            string scope = m.ReadLibrary().Scope;
            m.Exit("discard");
            Check(m.Current is null && m.ReadLibrary().Value is null && m.ReadLibrary().Scope != scope && DiskLibrary(p.Path) == Library("保存点"), "丢弃恢复文件并释放身份");
            using var owner = new ProjectDirectoryManager(root);
            owner.Open(p.Path);
        });

        Case("clean-exit-no-rewrite", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("干净退出", m.DefaultLocation, Library("原件"));
            m.FinishLoading();
            byte[] bytes = File.ReadAllBytes(p.Path);
            var time = File.GetLastWriteTimeUtc(p.Path);
            m.Exit("discard");
            Check(File.ReadAllBytes(p.Path).SequenceEqual(bytes) && File.GetLastWriteTimeUtc(p.Path) == time && !File.Exists(p.Path + ".bak"), "干净退出不触碰文件和备份");
        });

        Case("save-exit-persists-title-and-music", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("旧名", m.DefaultLocation, Library("原件"));
            m.FinishLoading();
            m.WriteLibrary(Library("保存退出内容"));
            m.Exit("save", "新名");
            using var r = new ProjectDirectoryManager(root);
            Check(r.Open(p.Path).Name == "新名" && r.ReadLibrary().Value == Library("保存退出内容"), "标题与音乐一起保存退出");
        });

        Case("status-catalog-do-not-adopt-external-metadata", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("冲突", m.DefaultLocation, Library("原件"));
            m.FinishLoading();
            m.WriteLibrary(Library("本机修改"));
            var e = Envelope(p.Path);
            e["name"] = "外部标题";
            e["libraryText"] = Library("外部内容");
            string bytes = e.ToJsonString();
            File.WriteAllText(p.Path, bytes);
            var bridge = new NativeProjectDirectories(m, _ => null, () => null);
            Check(Status(bridge.Read()) == "ready" && m.HasUnsavedChanges && m.List().Single().Name == "外部标题", "查询不接纳写基线");
            ExpectFailure(() => m.Save("本机标题"), "保存冲突保护");
            ExpectFailure(() => m.Exit("discard"), "丢弃冲突保护");
            ExpectFailure(() => m.ReadLibrary(), "元信息变化须明确重开");
            Check(m.Current == p && File.ReadAllText(p.Path) == bytes, "外部字节与会话保留");
        });

        Case("failed-discard-keeps-state-and-retries", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("重试丢弃", m.DefaultLocation, Library("保存点"));
            m.FinishLoading();
            m.WriteLibrary(Library("未保存"));
            string scope = m.ReadLibrary().Scope;
            using (var blocker = new FileStream(p.Path, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                ExpectFailure(() => m.Exit("discard"), "写回失败阻止退出");
                Check(m.Current == p && m.HasUnsavedChanges && m.ReadLibrary().Scope == scope, "失败保留会话身份");
            }
            m.Exit("discard");
            Check(DiskLibrary(p.Path) == Library("保存点"), "解除故障可重试");
        });

        Case("missing-file-invalid-exit", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("退出保护", m.DefaultLocation, Library("原件"));
            ExpectFailure(() => m.Exit("unknown"), "未知模式拒绝");
            File.Delete(p.Path);
            ExpectFailure(() => m.Exit("discard"), "缺失不丢弃退出");
            ExpectFailure(() => m.Exit("save"), "缺失不重建保存");
            Check(m.Current == p && !File.Exists(p.Path), "错误保持当前会话且不重建文件");
        });

        Case("catalog-direct-valid-and-read-only", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var a = m.Create("乙歌曲", m.DefaultLocation, Library("乙"));
            var b = m.Create("甲歌曲", m.DefaultLocation, Library("甲"));
            m.WriteLibrary(Library("甲修改"));
            string nested = Path.Combine(m.DefaultLocation, "嵌套目录");
            Directory.CreateDirectory(nested);
            m.Create("嵌套", nested, Library("嵌套"));
            string external = Path.Combine(root, "自定义");
            Directory.CreateDirectory(external);
            var current = m.Create("外部", external, Library("外部"));
            File.WriteAllText(Path.Combine(m.DefaultLocation, "损坏.rootsound"), "{}");
            File.Copy(a.Path, Path.Combine(m.DefaultLocation, ".rootsound-create-leftover.tmp"));
            byte[] before = File.ReadAllBytes(a.Path);
            string scope = m.ReadLibrary().Scope;
            var list = m.List();
            Check(list.Count == 2 && list.Any(x => x.Path == a.Path) && list.Any(x => x.Path == b.Path), "只列默认目录有效直接项目，忽略备份临时损坏和嵌套文件");
            Check(list.Select(x => x.Name).SequenceEqual(list.Select(x => x.Name).OrderBy(x => x, StringComparer.OrdinalIgnoreCase)), "稳定排序");
            Check(m.Current == current && m.ReadLibrary().Scope == scope && File.ReadAllBytes(a.Path).SequenceEqual(before), "列表不接管不写入");
        });

        Case("known-open-does-not-pick-or-escape", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var known = m.Create("默认", m.DefaultLocation, Library("默认"));
            string other = Path.Combine(root, "外部");
            Directory.CreateDirectory(other);
            var custom = m.Create("外部", other, Library("外部"));
            int calls = 0;
            var bridge = new NativeProjectDirectories(m, _ => null, () =>
            {
                calls++;
                return custom.Path;
            });
            Check(Status(bridge.List()) == "listed" && Status(bridge.OpenKnown(known.Path)) == "opened" && calls == 0, "列表打开不弹选择器");
            string scope = m.ReadLibrary().Scope;
            foreach (string path in new[]
            {
                custom.Path,m.DefaultLocation,Path.GetPathRoot(root)!,"relative"
            }) Check(Status(bridge.OpenKnown(path)) == "error", "直接入口不能越界");
            Check(m.Current == known && m.ReadLibrary().Scope == scope, "非法路径不切换");
            Check(Status(bridge.Open()) == "opened" && calls == 1 && m.Current == custom, "文件夹图标入口使用选择器");
        });

        Case("title-preserves-id-path-extra-metadata", root =>
        {
            ProjectDirectoryInfo p;
            using (var maker = new ProjectDirectoryManager(root)) p = maker.Create("原名", maker.DefaultLocation, Library("原件"));
            var e = Envelope(p.Path);
            string created = e["createdAtUtc"]!.GetValue<string>();
            e["futureExtra"] = JsonNode.Parse("{\"keep\":[1,2,3]}");
            File.WriteAllText(p.Path, e.ToJsonString());
            using var m = new ProjectDirectoryManager(root);
            m.Open(p.Path);
            m.FinishLoading();
            m.WriteLibrary(Library("待保存"));
            var saved = m.Save("新名");
            var updated = Envelope(p.Path);
            Check(saved.Id == p.Id && saved.Path == p.Path && saved.Name == "新名" && !m.HasUnsavedChanges, "改标题保留身份路径");
            Check(updated["createdAtUtc"]!.GetValue<string>() == created && updated["futureExtra"]!.ToJsonString() == "{\"keep\":[1,2,3]}" && m.List().Single().Name == "新名", "保留创建日期和未知元信息");
        });

        Case("failed-title-save-and-retry", root =>
        {
            bool fail = true;
            using var m = new ProjectDirectoryManager(root, null, _ =>
            {
                if (fail) throw new IOException("测试提交失败");
            });
            var p = m.Create("原名", m.DefaultLocation, Library("保存点"));
            m.FinishLoading();
            m.WriteLibrary(Library("未保存"));
            byte[] before = File.ReadAllBytes(p.Path);
            ExpectFailure(() => m.Save("新名"), "提交故障不能报告成功");
            Check(m.Current == p && m.HasUnsavedChanges && File.ReadAllBytes(p.Path).SequenceEqual(before), "失败保留名称脏状态和文件");
            fail = false;
            m.Save("新名");
            Check(m.Current!.Name == "新名" && !m.HasUnsavedChanges, "解除故障可重试");
        });

        Case("invalid-title-before-checkpoint", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("原名", m.DefaultLocation, Library("原件"));
            m.FinishLoading();
            m.WriteLibrary(Library("未保存"));
            byte[] before = File.ReadAllBytes(p.Path);
            foreach (string name in new[]
            {
                "  ","坏/名字","坏:名字","CON","结尾.","\ud800"
            }) ExpectFailure(() => m.Save(name), "无效标题");
            Check(m.Current == p && m.HasUnsavedChanges && File.ReadAllBytes(p.Path).SequenceEqual(before), "无效标题不清除脏状态不写文件");
        });

        Case("legacy-folder-open-save-discard-and-file-entry", root =>
        {
            string path = Legacy(root, "旧版项目", Library("旧版材料"));
            using var m = new ProjectDirectoryManager(root);
            var p = m.OpenKnown(path);
            Check(p.Name == "旧版项目" && m.ReadLibrary().Value == Library("旧版材料") && m.List().Single().Path == path, "兼容旧目录识别");
            m.FinishLoading();
            m.WriteLibrary(Library("旧版新编辑"));
            m.Save("旧版新标题");
            m.WriteLibrary(Library("丢弃"));
            m.Exit("discard");
            using var r = new ProjectDirectoryManager(root);
            r.Open(Path.Combine(path, "project.json"));
            Check(r.Current!.Name == "旧版新标题" && r.ReadLibrary().Value == Library("旧版新编辑"), "旧说明文件入口、保存丢弃兼容");
            Check(Directory.Exists(path) && File.Exists(Path.Combine(path, "materials.json")), "不删除旧目录");
        });

        Case("legacy-metadata-conflict", root =>
        {
            string path = Legacy(root, "旧版保护", Library("原件"));
            using var m = new ProjectDirectoryManager(root);
            var p = m.Open(path);
            m.FinishLoading();
            m.WriteLibrary(Library("本机修改"));
            string file = Path.Combine(path, "project.json");
            var e = Envelope(file);
            e["name"] = "外部标题";
            string external = e.ToJsonString();
            File.WriteAllText(file, external);
            ExpectFailure(() => m.Save(), "旧元信息冲突保存保护");
            ExpectFailure(() => m.Exit("discard"), "旧元信息冲突丢弃保护");
            Check(m.Current == p && File.ReadAllText(file) == external, "保留外部说明");
        });

        Case("catalog-keeps-copied-project-paths", root =>
        {
            string path = Legacy(root, "旧版", Library("旧材料"));
            var legacy = Envelope(Path.Combine(path, "project.json"));
            using var m = new ProjectDirectoryManager(root);
            var p = m.Create("新文件", m.DefaultLocation, Library("新材料"));
            m.Exit("discard");
            var e = Envelope(p.Path);
            e["id"] = legacy["id"]!.GetValue<string>();
            File.WriteAllText(p.Path, e.ToJsonString());
            string copy = Path.Combine(m.DefaultLocation, "手动副本.rootsound");
            File.Copy(p.Path, copy);
            var list = m.List();
            Check(list.Count == 3 && list.Any(item => item.Path == p.Path) && list.Any(item => item.Path == copy) && Directory.Exists(path), "同身份不同路径的手动副本与旧目录都可见");
        });

        Case("oversized-and-invalid-utf8-files-are-ignored", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var active = m.Create("有效项目", m.DefaultLocation, Library("原件"));
            string oversized = Path.Combine(m.DefaultLocation, "超限.rootsound");
            using (var stream = new FileStream(oversized, FileMode.CreateNew, FileAccess.Write)) stream.SetLength((long)AtomicTextStore.MaximumBytes + 1);
            string invalid = Path.Combine(m.DefaultLocation, "编码损坏.rootsound");
            File.WriteAllBytes(invalid, [0xff, 0xfe]);
            ExpectFailure(() => m.Open(oversized), "超限工程拒绝打开");
            ExpectFailure(() => m.Open(invalid), "损坏编码工程拒绝打开");
            Check(m.List().Count == 1 && m.Current == active, "损坏和超限文件不破坏可用的项目列表或当前会话");
        });

        Case("legacy-corrupt-materials-do-not-break-catalog", root =>
        {
            string invalid = Legacy(root, "旧版编码损坏", Library("待损坏"));
            File.WriteAllBytes(Path.Combine(invalid, "materials.json"), [0xff, 0xfe]);
            string malformed = Legacy(root, "旧版结构损坏", Library("待损坏"));
            File.WriteAllText(Path.Combine(malformed, "materials.json"), "{}");
            using var m = new ProjectDirectoryManager(root);
            var active = m.Create("有效项目", m.DefaultLocation, Library("有效"));
            Check(m.List().Count == 1 && m.Current == active, "损坏的旧版材料应跳过，列表继续可用");
        });

        Case("duplicate-envelope-fields-do-not-break-catalog", root =>
        {
            using var m = new ProjectDirectoryManager(root);
            var active = m.Create("有效项目", m.DefaultLocation, Library("有效"));
            string duplicate = Path.Combine(m.DefaultLocation, "重复字段.rootsound");
            string valid = File.ReadAllText(active.Path);
            File.WriteAllText(duplicate, valid.Insert(1, "\"format\":\"RootSoundWorkspace\","));
            ExpectFailure(() => m.Open(duplicate), "重复字段的工程封装应报告格式无效");
            Check(m.List().Count == 1 && m.Current == active, "单个重复字段坏文件不能破坏整个列表");
        });

        Case("export-cannot-replace-project-file", root =>
        {
            foreach (string name in new[]
            {
                "project.json","PROJECT.JSON","materials.json","materials.json.bak","materials.lock","整首歌.rootsound","歌曲.ROOTSOUND","整首歌.rootsound.bak"
            })
            {
                string path = Path.Combine(root, name);
                File.WriteAllText(path, "原件");
                ExpectFailure(() => ProjectFileProtection.RequireExportTarget(path), "禁止导出覆盖工作空间");
                ExpectFailure(() => NativeProjectFiles.WriteAtomic(path, "{}"), "便携导出保护");
                ExpectFailure(() => NativeAudioFiles.WriteAtomic(path, []), "音频导出保护");
                Check(File.ReadAllText(path) == "原件", "拒绝保持字节");
            }
        });
        Case("delete-complete-file-and-backup", root =>
        {
            using var manager = new ProjectDirectoryManager(root);
            var project = manager.Create("删除歌曲", manager.DefaultLocation, Library("当前内容"));
            manager.WriteLibrary(Library("新内容")); manager.Save(); manager.Exit("save");
            Check(File.Exists(project.Path + ".bak"), "删除案例包含完整恢复副本");
            var bridge = new NativeProjectDirectories(manager, _ => null, () => null);
            Check(Status(bridge.Delete(project.Path, project.Id)) == "deleted", "删除桥接成功");
            Check(!File.Exists(project.Path) && !File.Exists(project.Path + ".bak"), "工程和备份同时移去");
            Check(manager.List().Count == 0 && !Directory.EnumerateFileSystemEntries(manager.DefaultLocation).Any(), "不留工程或临时目录");
        });
        Case("delete-another-project-preserves-active-session", root =>
        {
            using var manager = new ProjectDirectoryManager(root);
            var first = manager.Create("保留当前歌曲", manager.DefaultLocation, Library("当前"));
            manager.Exit("save");
            var other = manager.Create("另一首", manager.DefaultLocation, Library("另一首内容"));
            manager.Exit("save"); manager.Open(first.Path); manager.WriteLibrary(Library("当前未保存"));
            var snapshot = manager.ReadLibrary(); bool dirty = manager.HasUnsavedChanges;
            manager.Delete(other.Path, other.Id);
            Check(manager.Current == first && manager.ReadLibrary() == snapshot && manager.HasUnsavedChanges == dirty, "删除其他歌曲不改当前身份、草稿、脏状态或页面范围");
            Check(!File.Exists(other.Path) && File.Exists(first.Path), "只删所选歌曲");
        });
        Case("delete-refuses-current-and-other-window-lock", root =>
        {
            using var owner = new ProjectDirectoryManager(root);
            var project = owner.Create("正被使用", owner.DefaultLocation, Library("保留内容"));
            byte[] original = File.ReadAllBytes(project.Path);
            ExpectFailure(() => owner.Delete(project.Path, project.Id), "当前编辑歌曲拒绝删除");
            using var another = new ProjectDirectoryManager(root);
            ExpectFailure(() => another.Delete(project.Path, project.Id), "其他窗口持锁拒绝删除");
            Check(File.ReadAllBytes(project.Path).AsSpan().SequenceEqual(original), "拒绝不改字节");
            owner.Exit("discard"); another.Delete(project.Path, project.Id);
            Check(!File.Exists(project.Path), "关闭后可重试删除");
        });
        Case("delete-refuses-stale-identity-and-outside-default", root =>
        {
            using var manager = new ProjectDirectoryManager(root);
            var first = manager.Create("旧项目", manager.DefaultLocation, Library("旧内容")); manager.Exit("save");
            var replacement = manager.Create("新项目", manager.DefaultLocation, Library("新内容")); manager.Exit("save");
            File.Copy(replacement.Path, first.Path, overwrite: true); byte[] bytes = File.ReadAllBytes(first.Path);
            ExpectFailure(() => manager.Delete(first.Path, first.Id), "路径被不同歌曲替换时不能误删");
            Check(File.ReadAllBytes(first.Path).AsSpan().SequenceEqual(bytes), "新占用者保留");
            string outside = Path.Combine(root, "外部.rootsound"); File.Copy(replacement.Path, outside);
            ExpectFailure(() => manager.Delete(outside, replacement.Id), "不在默认库中的文件不能通过此入口删除");
            ExpectFailure(() => manager.Delete(manager.DefaultLocation, replacement.Id), "不能删除库根目录");
            Check(File.Exists(outside) && File.Exists(replacement.Path), "外部和其他项目保留");
        });
        Case("delete-preflight-refuses-readonly-backup-and-legacy-extras", root =>
        {
            using var manager = new ProjectDirectoryManager(root);
            var project = manager.Create("只读备份", manager.DefaultLocation, Library("工程")); manager.Save(); manager.Exit("save");
            string backup = project.Path + ".bak"; File.SetAttributes(backup, FileAttributes.ReadOnly);
            try { ExpectFailure(() => manager.Delete(project.Path, project.Id), "只读备份先拒绝，不先删工程"); Check(File.Exists(project.Path) && File.Exists(backup), "预检失败保留全部文件"); }
            finally { File.SetAttributes(backup, FileAttributes.Normal); }
            string legacy = Legacy(root, "有其他内容", Library("旧版内容"));
            string unknown = Path.Combine(legacy, "我的原始录音.wav"); File.WriteAllText(unknown, "用户额外文件");
            var info = manager.List().Single(item => item.Path == legacy);
            ExpectFailure(() => manager.Delete(legacy, info.Id), "旧工程包含不认识的文件时不递归删除");
            Check(File.Exists(unknown) && File.Exists(Path.Combine(legacy, "materials.json")), "未知内容与工程都保留");
        });
        Case("delete-known-legacy-project", root =>
        {
            string legacy = Legacy(root, "旧格式删除", Library("旧格式"));
            File.WriteAllText(Path.Combine(legacy, "materials.json.bak"), Library("旧备份"));
            File.WriteAllText(Path.Combine(legacy, "project.json.bak"), "旧说明备份");
            using var manager = new ProjectDirectoryManager(root);
            var project = manager.List().Single(); manager.Delete(project.Path, project.Id);
            Check(!Directory.Exists(legacy) && manager.List().Count == 0, "旧项目和已知备份全部删除");
            Check(!Directory.EnumerateFileSystemEntries(manager.DefaultLocation).Any(), "旧项目不留临时目录");
        });
        Case("failed-delete-restores-already-unlinked-file-bytes", root =>
        {
            ProjectDirectoryInfo project;
            using (var maker = new ProjectDirectoryManager(root)) { project = maker.Create("中断删除", maker.DefaultLocation, Library("当前内容")); maker.WriteLibrary(Library("最新内容")); maker.Save(); }
            byte[] original = File.ReadAllBytes(project.Path), backup = File.ReadAllBytes(project.Path + ".bak"); int deletes = 0;
            using (var manager = new ProjectDirectoryManager(root, null, null, _ => { if (++deletes == 2) throw new IOException("模拟第二份文件删除失败"); }))
            {
                ExpectFailure(() => manager.Delete(project.Path, project.Id), "删除中途失败");
                Check(deletes == 2 && File.ReadAllBytes(project.Path).AsSpan().SequenceEqual(original) && File.ReadAllBytes(project.Path + ".bak").AsSpan().SequenceEqual(backup), "先前已删除的字节也完整恢复");
                Check(manager.List().Single().Id == project.Id && manager.Current is null, "恢复后仍可识别且未激活工程");
            }
            using var retry = new ProjectDirectoryManager(root); retry.Delete(project.Path, project.Id);
            Check(!File.Exists(project.Path), "失败后可以重试");
        });
        Case("failed-legacy-delete-restores-current-and-backup", root =>
        {
            string legacy = Legacy(root, "旧工程恢复", Library("当前原文"));
            string library = Path.Combine(legacy, "materials.json"), backup = library + ".bak";
            File.WriteAllText(backup, Library("恢复原文")); byte[] currentBytes = File.ReadAllBytes(library), backupBytes = File.ReadAllBytes(backup);
            int deletes = 0;
            using var manager = new ProjectDirectoryManager(root, null, null, _ => { if (++deletes == 2) throw new IOException("模拟第二份文件失败"); });
            var project = manager.List().Single(); ExpectFailure(() => manager.Delete(project.Path, project.Id), "旧目录删除中途失败");
            Check(File.ReadAllBytes(library).AsSpan().SequenceEqual(currentBytes) && File.ReadAllBytes(backup).AsSpan().SequenceEqual(backupBytes), "旧库及备份内容恢复");
            Check(manager.List().Single().Id == project.Id, "恢复后旧工程可识别");
        });
        Case("delete-detects-change-during-confirmed-operation", root =>
        {
            ProjectDirectoryInfo project;
            using (var maker = new ProjectDirectoryManager(root)) project = maker.Create("外部变化", maker.DefaultLocation, Library("原内容"));
            byte[] external = File.ReadAllBytes(project.Path);
            using var manager = new ProjectDirectoryManager(root, path =>
            {
                var envelope = Envelope(path); envelope["libraryText"] = Library("后来的外部修改");
                string temporary = path + ".external"; File.WriteAllText(temporary, envelope.ToJsonString());
                File.Move(temporary, path, overwrite: true); external = File.ReadAllBytes(path);
            });
            ExpectFailure(() => manager.Delete(project.Path, project.Id), "删除前最后检查拦住外部替换");
            Check(File.ReadAllBytes(project.Path).AsSpan().SequenceEqual(external), "不覆盖外部较新内容");
        });
        Case("permanent-write-checkpoint-survives-discard-and-rejects-old-scope", root =>
        {
            using var manager = new ProjectDirectoryManager(root);
            var project = manager.Create("永久操作", manager.DefaultLocation, Library("旧状态"));
            var storage = new NativeStorage(manager); var scope = manager.ReadLibrary().Scope;
            manager.WriteLibrary(Library("操作前其他编辑"));
            Check(Ok(storage.WriteScopedCheckpoint(Library("已永久删除乐句"), scope)) && !manager.HasUnsavedChanges, "永久写入同时成为已保存基准");
            manager.WriteLibrary(Library("后来普通编辑")); Check(manager.HasUnsavedChanges, "后续普通编辑仍标脏");
            manager.Exit("discard"); manager.Open(project.Path);
            Check(manager.ReadLibrary().Value == Library("已永久删除乐句"), "放弃后续编辑不会恢复已删乐句");
            Check(!Ok(storage.WriteScopedCheckpoint(Library("旧页面错误保存"), scope)) && manager.ReadLibrary().Value == Library("已永久删除乐句"), "旧页面不能写永久基准");
        });
        Case("failed-permanent-write-keeps-snapshots-and-discard-baseline", root =>
        {
            using var manager = new ProjectDirectoryManager(root);
            var project = manager.Create("失败永久操作", manager.DefaultLocation, Library("已保存基准"));
            manager.FinishLoading(); manager.WriteLibrary(Library("尚未保存编辑"));
            string scope = manager.ReadLibrary().Scope; byte[] original = File.ReadAllBytes(project.Path);
            File.SetAttributes(project.Path, FileAttributes.ReadOnly);
            try
            {
                var storage = new NativeStorage(manager);
                Check(!Ok(storage.WriteScopedCheckpoint(Library("不应写入的删除"), scope)), "永久保存失败明确拒绝");
                Check(manager.ReadLibrary().Value == Library("尚未保存编辑") && manager.HasUnsavedChanges, "失败保持当前快照和脏状态");
                Check(File.ReadAllBytes(project.Path).AsSpan().SequenceEqual(original), "失败保留原文件");
            }
            finally { File.SetAttributes(project.Path, FileAttributes.Normal); }
            manager.Exit("discard"); manager.Open(project.Path);
            Check(manager.ReadLibrary().Value == Library("已保存基准"), "失败没有推进退出恢复基准");
        });
        Case("failed-delete-keeps-old-bytes-when-original-name-is-reoccupied", root =>
        {
            ProjectDirectoryInfo project;
            using (var maker = new ProjectDirectoryManager(root)) { project = maker.Create("恢复冲突", maker.DefaultLocation, Library("原来的音乐")); maker.Save(); }
            byte[] original = File.ReadAllBytes(project.Path), external = Encoding.UTF8.GetBytes("新的外部文件，不能被恢复覆盖");
            int deletes = 0; string failure = "";
            using var manager = new ProjectDirectoryManager(root, null, null, _ =>
            {
                if (++deletes != 2) return;
                File.WriteAllBytes(project.Path, external);
                throw new IOException("模拟删除中断且原位置已被占用");
            });
            try { manager.Delete(project.Path, project.Id); }
            catch (IOException error) { failure = error.Message; }
            Check(deletes == 2 && File.ReadAllBytes(project.Path).AsSpan().SequenceEqual(external), "外部新文件不被覆盖");
            string recovery = Directory.GetDirectories(manager.DefaultLocation, ".rootsound-delete-*").Single();
            Check(Directory.GetFiles(recovery).Any(file => File.ReadAllBytes(file).AsSpan().SequenceEqual(original)), "句柄释放前旧原件已保存为恢复文件");
            Check(failure.Contains(recovery, StringComparison.Ordinal) && failure.Contains("原位置已有新的文件", StringComparison.Ordinal), "错误明确说明冲突与恢复位置");
            Check(File.Exists(project.Path + ".bak"), "其他备份恢复到原位");
        });
        Case("legacy-permanent-write-rejects-external-manifest-without-advancing-baseline", root =>
        {
            string path = Legacy(root, "旧工程永久修改", Library("旧基准"));
            using var manager = new ProjectDirectoryManager(root); manager.Open(path); manager.FinishLoading();
            manager.WriteLibrary(Library("未保存编辑")); string scope = manager.ReadLibrary().Scope;
            string manifest = Path.Combine(path, "project.json"), material = Path.Combine(path, "materials.json");
            byte[] originalManifest = File.ReadAllBytes(manifest), originalMaterial = File.ReadAllBytes(material);
            var replacement = JsonNode.Parse(File.ReadAllText(manifest))!.AsObject(); replacement["id"] = Guid.NewGuid().ToString("N");
            File.WriteAllText(manifest, replacement.ToJsonString());
            Check(!Ok(new NativeStorage(manager).WriteScopedCheckpoint(Library("不该提交的永久删除"), scope)), "说明被替换后永久写入拒绝");
            Check(File.ReadAllBytes(material).AsSpan().SequenceEqual(originalMaterial) && manager.HasUnsavedChanges, "不写资料也不清脏状态");
            Check(manager.ReadLibrary().Value == Library("未保存编辑"), "当前编辑快照不改变");
            File.WriteAllBytes(manifest, originalManifest); manager.Exit("discard"); manager.Open(path);
            Check(manager.ReadLibrary().Value == Library("旧基准"), "失败没有推进退出恢复基准");
        });
        Case("library-rename-single-file", root =>
        {
            ProjectDirectoryInfo selected;
            using (var creator = new ProjectDirectoryManager(root)) selected = creator.Create("原名", creator.DefaultLocation, Library("音符音频与历史"));
            var before = Envelope(selected.Path);
            before["futureMetadata"] = "保留"; File.WriteAllText(selected.Path, before.ToJsonString());
            using var manager = new ProjectDirectoryManager(root);
            var snapshot = manager.Inspect(selected.Path, selected.Id);
            var renamed = manager.Rename(selected.Path, selected.Id, "新名称", Library("同一工程改名"), snapshot.Token);
            var after = Envelope(selected.Path);
            Check(renamed.Path == selected.Path && renamed.Id == selected.Id && renamed.Name == "新名称", "库改名不移动路径或改变身份");
            Check(after["createdAtUtc"]!.ToJsonString() == before["createdAtUtc"]!.ToJsonString() && after["futureMetadata"]!.GetValue<string>() == "保留", "工程说明其他字段保留");
            Check(after["name"]!.GetValue<string>() == "新名称" && DiskLibrary(selected.Path) == Library("同一工程改名"), "说明与调用方工程一起提交");
            Check(manager.Current is null && manager.ReadLibrary().Value is null, "改名不进入或切换工程");
            Check(manager.List().Single().Name == "新名称", "乐曲库显示新名");
        });

        Case("library-rename-stale-or-foreign", root =>
        {
            ProjectDirectoryInfo selected;
            using (var creator = new ProjectDirectoryManager(root)) selected = creator.Create("原名", creator.DefaultLocation, Library("旧资料"));
            using var manager = new ProjectDirectoryManager(root);
            var snapshot = manager.Inspect(selected.Path, selected.Id);
            WriteDiskLibrary(selected.Path, Library("外部更新")); string external = File.ReadAllText(selected.Path);
            ExpectFailure(() => manager.Rename(selected.Path, selected.Id, "不写入", Library("过时资料"), snapshot.Token), "拒绝过时快照");
            Check(File.ReadAllText(selected.Path) == external, "保留外部更新");
            ExpectFailure(() => manager.Inspect(selected.Path, Guid.NewGuid().ToString("N")), "拒绝已替换身份");
            string outside = Path.Combine(root, "外部.rootsound"); File.Copy(selected.Path, outside);
            ExpectFailure(() => manager.Inspect(outside, selected.Id), "外部工程不作为默认库条目改名");
            manager.Open(selected.Path); string active = manager.ReadLibrary().Value!;
            ExpectFailure(() => manager.Inspect(selected.Path, selected.Id), "正在编辑不改名");
            Check(manager.ReadLibrary().Value == active, "不改变当前资料");
        });

        Case("library-rename-lock-and-failure", root =>
        {
            ProjectDirectoryInfo selected;
            using (var creator = new ProjectDirectoryManager(root)) selected = creator.Create("原名", creator.DefaultLocation, Library("保留"));
            using var reader = new ProjectDirectoryManager(root); var snapshot = reader.Inspect(selected.Path, selected.Id);
            using (var locked = AtomicTextStore.ForProjectFile(selected.Path))
                ExpectFailure(() => reader.Inspect(selected.Path, selected.Id), "拒绝其他窗口占用");
            string original = File.ReadAllText(selected.Path);
            using var failed = new ProjectDirectoryManager(root, null, _ => throw new IOException("模拟写入失败"));
            ExpectFailure(() => failed.Rename(selected.Path, selected.Id, "失败的新名", Library("不应写入"), snapshot.Token), "改名失败");
            Check(File.ReadAllText(selected.Path) == original && !File.Exists(selected.Path + ".bak"), "失败不改变原件备份");
        });

        Case("library-rename-legacy-pair", root =>
        {
            string directory = Legacy(root, "旧目录", Library("原资料"));
            string manifestPath = Path.Combine(directory, "project.json"), materialPath = Path.Combine(directory, "materials.json");
            string id = JsonNode.Parse(File.ReadAllText(manifestPath))!["id"]!.GetValue<string>();
            File.WriteAllText(materialPath + ".bak", "旧恢复副本");
            using var manager = new ProjectDirectoryManager(root);
            var snapshot = manager.Inspect(directory, id);
            var renamed = manager.Rename(directory, id, "新标题", Library("新标题的完整资料"), snapshot.Token);
            Check(renamed.Path == directory && renamed.Id == id && renamed.Name == "新标题", "旧目录身份路径不变");
            Check(JsonNode.Parse(File.ReadAllText(manifestPath))!["name"]!.GetValue<string>() == "新标题" && File.ReadAllText(materialPath) == Library("新标题的完整资料"), "旧说明与资料一起改名");
            Check(File.ReadAllText(materialPath + ".bak") == "旧恢复副本" && Directory.GetDirectories(directory).Length == 0, "原备份保留且暂存清理");
        });

        Case("library-rename-legacy-mid-commit-rollback", root =>
        {
            string directory = Legacy(root, "旧目录", Library("原资料"));
            string manifestPath = Path.Combine(directory, "project.json"), materialPath = Path.Combine(directory, "materials.json");
            string id = JsonNode.Parse(File.ReadAllText(manifestPath))!["id"]!.GetValue<string>();
            string originalManifest = File.ReadAllText(manifestPath), originalMaterial = File.ReadAllText(materialPath);
            using var reader = new ProjectDirectoryManager(root); var snapshot = reader.Inspect(directory, id);
            using var failed = new ProjectDirectoryManager(root, null, path => { if (path == manifestPath) throw new IOException("模拟第二文件失败"); });
            ExpectFailure(() => failed.Rename(directory, id, "失败", Library("不应保留"), snapshot.Token), "第二个文件失败回滚");
            Check(File.ReadAllText(materialPath) == originalMaterial && File.ReadAllText(manifestPath) == originalManifest, "完整恢复说明和资料");
            Check(Directory.GetDirectories(directory).Length == 0 && !File.Exists(materialPath + ".bak"), "失败不新增备份或暂存");
        });

        Case("library-rename-legacy-stale-manifest", root =>
        {
            string directory = Legacy(root, "旧目录", Library("原资料"));
            string manifestPath = Path.Combine(directory, "project.json"), materialPath = Path.Combine(directory, "materials.json");
            string id = JsonNode.Parse(File.ReadAllText(manifestPath))!["id"]!.GetValue<string>();
            using var manager = new ProjectDirectoryManager(root); var snapshot = manager.Inspect(directory, id);
            var manifest = JsonNode.Parse(File.ReadAllText(manifestPath))!; manifest["name"] = "外部改名"; File.WriteAllText(manifestPath, manifest.ToJsonString());
            ExpectFailure(() => manager.Rename(directory, id, "过时改名", Library("不应写入"), snapshot.Token), "说明变更使旧快照失效");
            Check(File.ReadAllText(materialPath) == Library("原资料") && JsonNode.Parse(File.ReadAllText(manifestPath))!["name"]!.GetValue<string>() == "外部改名", "保留原资料和外部名称");
        });
        Case("library-rename-legacy-late-capture-change", root =>
        {
            string directory = Legacy(root, "原目录", Library("前端快照A"));
            string manifestPath = Path.Combine(directory, "project.json"), materialPath = Path.Combine(directory, "materials.json");
            string id = JsonNode.Parse(File.ReadAllText(manifestPath))!["id"]!.GetValue<string>();
            using var reader = new ProjectDirectoryManager(root); var snapshot = reader.Inspect(directory, id);
            string manifestBefore = File.ReadAllText(manifestPath); string newer = Library("外部晚到B"); int replacements = 0;
            using var racing = new ProjectDirectoryManager(root, null, path => { if (path == materialPath || path == manifestPath) replacements++; }, null,
                path => { if (path == materialPath) File.WriteAllText(materialPath, newer); });
            ExpectFailure(() => racing.Rename(directory, id, "过时前端名称", Library("前端由A生成"), snapshot.Token), "捕获前的晚到更改使操作失效");
            Check(File.ReadAllText(materialPath) == newer && File.ReadAllText(manifestPath) == manifestBefore, "晚到新资料和原说明保留");
            Check(replacements == 0 && Directory.GetDirectories(directory).Length == 0, "捕获token不符不进入任何替换并清理自有暂存");
        });

        Case("library-rename-legacy-capture-aba", root =>
        {
            string directory = Legacy(root, "原目录", Library("快照A"));
            string manifestPath = Path.Combine(directory, "project.json"), materialPath = Path.Combine(directory, "materials.json");
            string id = JsonNode.Parse(File.ReadAllText(manifestPath))!["id"]!.GetValue<string>(); string original = File.ReadAllText(materialPath);
            using var reader = new ProjectDirectoryManager(root); var snapshot = reader.Inspect(directory, id); int replacements = 0;
            using var racing = new ProjectDirectoryManager(root, null, path => { if (path == materialPath || path == manifestPath) replacements++; }, null,
                path => { if (path == materialPath) File.WriteAllText(materialPath, Library("捕获B")); else if (path == manifestPath) File.WriteAllText(materialPath, original); });
            ExpectFailure(() => racing.Rename(directory, id, "不应提交", Library("前端新资料"), snapshot.Token), "实时文件回到A也不能接受已捕获B");
            Check(File.ReadAllText(materialPath) == original && replacements == 0, "基于暂存原文token拒绝ABA，不只校验实时路径");
        });
        return completed;
    }

    private static JsonObject Envelope(string path) => JsonNode.Parse(File.ReadAllText(path))!.AsObject();
    private static string DiskLibrary(string path) => Envelope(path)["libraryText"]!.GetValue<string>();
    private static void WriteDiskLibrary(string path, string text)
    {
        var root = Envelope(path);
        root["libraryText"] = text;
        File.WriteAllText(path, root.ToJsonString(), new UTF8Encoding(false));
    }

    private static string Legacy(string installation, string name, string text)
    {
        string path = Path.Combine(installation, "project", name);
        Directory.CreateDirectory(path);
        File.WriteAllText(Path.Combine(path, "project.json"), JsonSerializer.Serialize(new
        {
            format = "RootSoundWorkspace",
            version = 1,
            id = Guid.NewGuid().ToString("N"),
            name,
            createdAtUtc = DateTimeOffset.UtcNow.ToString("O")
        }));
        File.WriteAllText(Path.Combine(path, "materials.json"), text);
        return path;
    }

    private static string Library(string marker, string opaque = "{}") => "{\"format\":\"RootSoundMaterialLibrary\",\"version\":1,\"contents\":[],\"drafts\":[],\"marker\":" + (marker.Contains('\ud800') ? "\"" + marker + "\"" : JsonSerializer.Serialize(marker)) + ",\"opaque\":" + opaque + "}";
    private static (string? Value, string Scope) Snapshot(NativeStorage storage)
    {
        using var d = JsonDocument.Parse(storage.Read());
        Check(d.RootElement.GetProperty("ok").GetBoolean(), "桥接读取成功");
        return (d.RootElement.GetProperty("value").GetString(), d.RootElement.GetProperty("scope").GetString()!);
    }

    private static bool Ok(string json)
    {
        using var d = JsonDocument.Parse(json);
        return d.RootElement.GetProperty("ok").GetBoolean();
    }

    private static string? Status(string json)
    {
        using var d = JsonDocument.Parse(json);
        return d.RootElement.GetProperty("status").GetString();
    }

    private static void Check(bool value, string message)
    {
        if (!value) throw new InvalidOperationException("歌曲项目自测失败：" + message);
    }

    private static void ExpectFailure(Action action, string message)
    {
        try
        {
            action();
        }
        catch (InvalidDataException)
        {
            return;
        }
        catch (IOException)
        {
            return;
        }
        catch (UnauthorizedAccessException)
        {
            return;
        }
        catch (ArgumentException)
        {
            return;
        }
        throw new InvalidOperationException("歌曲项目自测失败：" + message);
    }
}
