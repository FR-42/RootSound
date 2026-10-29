using System.Buffers.Binary;
using System.Text.Json;

namespace RootSound.Desktop;

/// <summary>Only workspace fixtures; no window, audio device, or user project is opened.</summary>
internal static class MidiFilesSelfTests
{
    internal static int Run(string testRoot)
    {
        string root = Path.Combine(Path.GetFullPath(testRoot), "midi-files-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);
        int passed = 0;
        void Case(string name, Action<string> action)
        {
            string directory = Path.Combine(root, name); Directory.CreateDirectory(directory);
            action(directory); passed++;
        }
        Case("all-midi-extensions", directory =>
        {
            foreach (string extension in new[] { ".mid", ".midi", ".MID", ".MiDi" })
            {
                string path = Path.Combine(directory, "旋律 🌤" + extension); byte[] expected = Midi();
                File.WriteAllBytes(path, expected); DateTime stamp = File.GetLastWriteTimeUtc(path);
                Check(NativeMidiFiles.IsMidiPath(path) && NativeMidiFiles.ReadBytes(path).SequenceEqual(expected), "原字节传输");
                Check(File.ReadAllBytes(path).SequenceEqual(expected) && File.GetLastWriteTimeUtc(path) == stamp, "读取不修改原文件");
            }
        });
        Case("wrong-extension", directory =>
        {
            string path = Path.Combine(directory, "伪装.wav"); File.WriteAllBytes(path, Midi());
            Check(!NativeMidiFiles.IsMidiPath(path), "其他格式不是MIDI选择");
            ExpectFailure(() => NativeMidiFiles.ReadBytes(path));
        });
        Case("short-file", directory =>
        {
            foreach (int length in new[] { 0, 4, 8, 13 })
            {
                string path = Path.Combine(directory, length + ".mid"); File.WriteAllBytes(path, new byte[length]);
                ExpectFailure(() => NativeMidiFiles.ReadBytes(path));
            }
        });
        Case("invalid-header", directory =>
        {
            string path = Path.Combine(directory, "坏头.mid"); byte[] bytes = Midi(); bytes[0] = (byte)'x'; File.WriteAllBytes(path, bytes);
            ExpectFailure(() => NativeMidiFiles.ReadBytes(path)); Check(File.ReadAllBytes(path).SequenceEqual(bytes), "坏文件保留");
        });
        Case("header-length-underflow", directory =>
        {
            string path = Path.Combine(directory, "短头.mid"); byte[] bytes = Midi(); BinaryPrimitives.WriteUInt32BigEndian(bytes.AsSpan(4), 5); File.WriteAllBytes(path, bytes);
            ExpectFailure(() => NativeMidiFiles.ReadBytes(path));
        });
        Case("header-length-overflow", directory =>
        {
            string path = Path.Combine(directory, "长头.mid"); byte[] bytes = Midi(); BinaryPrimitives.WriteUInt32BigEndian(bytes.AsSpan(4), uint.MaxValue); File.WriteAllBytes(path, bytes);
            ExpectFailure(() => NativeMidiFiles.ReadBytes(path));
        });
        Case("oversized-file", directory =>
        {
            string path = Path.Combine(directory, "超限.mid");
            using (var stream = File.Create(path)) stream.SetLength(NativeMidiFiles.MaximumBytes + 1L);
            ExpectFailure(() => NativeMidiFiles.ReadBytes(path)); Check(new FileInfo(path).Length == NativeMidiFiles.MaximumBytes + 1L, "超限原件保留");
        });
        Case("locked-retry", directory =>
        {
            string path = Path.Combine(directory, "占用.mid"); File.WriteAllBytes(path, Midi());
            using (var locked = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.None)) ExpectFailure(() => NativeMidiFiles.ReadBytes(path));
            Check(NativeMidiFiles.ReadBytes(path).SequenceEqual(Midi()), "占用结束可以重试");
        });
        Case("selection-preserves-empty-session", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory);
            string path = Path.Combine(directory, "旋律.mid"); File.WriteAllBytes(path, Midi());
            var before = manager.ReadLibrary();
            var bridge = new NativeProjectDirectories(manager, _ => null, () => path);
            using var result = JsonDocument.Parse(bridge.Open()); var selected = result.RootElement;
            Check(selected.GetProperty("status").GetString() == "midi" && selected.GetProperty("name").GetString() == "旋律.mid", "MIDI返回新状态");
            Check(Convert.FromBase64String(selected.GetProperty("base64").GetString()!).SequenceEqual(Midi()), "base64原字节");
            Check(manager.Current is null && manager.ReadLibrary() == before && !Directory.Exists(manager.DefaultLocation), "选择不创建或激活歌曲");
        });
        Case("selection-preserves-active-unsaved-song", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory);
            var current = manager.Create("原歌曲", manager.DefaultLocation, Library("原保存")); manager.FinishLoading();
            manager.WriteLibrary(Library("正在编辑")); Check(manager.HasUnsavedChanges, "测试有未保存修改");
            string path = Path.Combine(directory, "另一个.MIDI"); File.WriteAllBytes(path, Midi());
            var before = manager.ReadLibrary(); byte[] projectBefore = File.ReadAllBytes(current.Path), midiBefore = File.ReadAllBytes(path);
            var bridge = new NativeProjectDirectories(manager, _ => null, () => path);
            using var result = JsonDocument.Parse(bridge.Open()); Check(result.RootElement.GetProperty("status").GetString() == "midi", "选择成功");
            Check(manager.Current == current && manager.ReadLibrary() == before && manager.HasUnsavedChanges, "不切换当前工程或scope");
            Check(File.ReadAllBytes(current.Path).SequenceEqual(projectBefore) && File.ReadAllBytes(path).SequenceEqual(midiBefore), "两个原件保留");
        });
        Case("cancel-preserves-session", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory); var before = manager.ReadLibrary();
            var bridge = new NativeProjectDirectories(manager, _ => null, () => null);
            using var result = JsonDocument.Parse(bridge.Open()); Check(result.RootElement.GetProperty("status").GetString() == "cancelled", "取消状态");
            Check(manager.Current is null && manager.ReadLibrary() == before, "取消不触及当前资料");
        });
        Case("bad-selection-preserves-session-and-allows-retry", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory); var before = manager.ReadLibrary();
            string path = Path.Combine(directory, "损坏.mid"); File.WriteAllBytes(path, new byte[20]);
            var bridge = new NativeProjectDirectories(manager, _ => null, () => path);
            using (var failed = JsonDocument.Parse(bridge.Open())) Check(failed.RootElement.GetProperty("status").GetString() == "error", "错误结果");
            Check(manager.Current is null && manager.ReadLibrary() == before && !Directory.Exists(manager.DefaultLocation), "错误不创建工程");
            File.WriteAllBytes(path, Midi());
            using var retry = JsonDocument.Parse(bridge.Open()); Check(retry.RootElement.GetProperty("status").GetString() == "midi", "操作锁释放可重试");
        });
        Case("known-project-route-rejects-midi", directory =>
        {
            using var manager = new ProjectDirectoryManager(directory);
            string path = Path.Combine(directory, "外部.mid"); File.WriteAllBytes(path, Midi());
            var bridge = new NativeProjectDirectories(manager, _ => null, () => null);
            using var result = JsonDocument.Parse(bridge.OpenKnown(path)); Check(result.RootElement.GetProperty("status").GetString() == "error", "列表不接管MIDI路径");
            Check(manager.Current is null, "仍未激活歌曲");
        });
        Case("rootsound-selection-remains-working", directory =>
        {
            string path;
            using (var creator = new ProjectDirectoryManager(directory)) path = creator.Create("现有工程", creator.DefaultLocation, Library("已保存")).Path;
            using var manager = new ProjectDirectoryManager(directory);
            var bridge = new NativeProjectDirectories(manager, _ => null, () => path);
            using var result = JsonDocument.Parse(bridge.Open());
            Check(result.RootElement.GetProperty("status").GetString() == "opened" && manager.Current?.Path == path, "已有工程照常激活");
        });
        return passed;
    }

    private static byte[] Midi() => [77, 84, 104, 100, 0, 0, 0, 6, 0, 0, 0, 1, 1, 224,
        77, 84, 114, 107, 0, 0, 0, 13, 0, 144, 60, 100, 131, 96, 128, 60, 0, 0, 255, 47, 0];
    private static string Library(string marker) => JsonSerializer.Serialize(new { format = "RootSoundMaterialLibrary", version = 1, contents = Array.Empty<object>(), drafts = Array.Empty<object>(), marker });
    private static void Check(bool condition, string message) { if (!condition) throw new InvalidOperationException("MIDI 文件自测失败：" + message); }
    private static void ExpectFailure(Action action)
    {
        try { action(); }
        catch (InvalidDataException) { return; }
        catch (IOException) { return; }
        catch (UnauthorizedAccessException) { return; }
        catch (ArgumentException) { return; }
        throw new InvalidOperationException("MIDI 文件自测失败：无效读取应被拒绝。");
    }
}
