using System.Text.Json;
using Microsoft.Web.WebView2.Core;

namespace RootSound.Desktop;

/// <summary>Sample import boundaries use isolated files and pure permission policy only.</summary>
internal static class SampleFilesSelfTests
{
    public static int Run(string testDir)
    {
        var root = Path.Combine(Path.GetFullPath(testDir), "sample-files-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root); int completed = 0;
        void Case(string name, Action<string> test)
        {
            var directory = Path.Combine(root, name); Directory.CreateDirectory(directory); test(directory); completed++;
        }
        Case("opaque-original-bytes-preserved", directory =>
        {
            var path = Path.Combine(directory, "雨声 🌧.wav");
            var original = Enumerable.Range(0, 256).Select(value => (byte)value).ToArray(); File.WriteAllBytes(path, original);
            var before = File.GetLastWriteTimeUtc(path); var imported = NativeSampleFiles.ReadBytes(path);
            Check(imported.SequenceEqual(original), "导入必须逐字节保留原件，不根据后缀改写内容。");
            imported[0] = 255;
            Check(File.ReadAllBytes(path).SequenceEqual(original), "修改内存结果不能改变原文件。");
            Check(File.GetLastWriteTimeUtc(path) == before, "读取不能更新原文件修改时间。");
            Check(Directory.GetFiles(directory).Length == 1, "导入不应创建备份、临时文件或输出锁。");
        });
        Case("read-only-source", directory =>
        {
            var path = Path.Combine(directory, "只读素材.bin"); byte[] original = [0, 255, 1, 128]; File.WriteAllBytes(path, original);
            var attributes = File.GetAttributes(path); File.SetAttributes(path, attributes | FileAttributes.ReadOnly);
            try
            {
                Check(NativeSampleFiles.ReadBytes(path).SequenceEqual(original), "只读素材应能导入。");
                Check((File.GetAttributes(path) & FileAttributes.ReadOnly) != 0, "读取不能改变文件权限。");
            }
            finally { File.SetAttributes(path, attributes); }
        });
        Case("exact-and-oversized-byte-boundary", directory =>
        {
            var path = Path.Combine(directory, "边界音频.bin");
            using (var stream = File.Create(path)) { stream.SetLength(NativeSampleFiles.MaximumBytes); stream.Position = stream.Length - 1; stream.WriteByte(255); }
            var imported = NativeSampleFiles.ReadBytes(path);
            Check(imported.Length == NativeSampleFiles.MaximumBytes && imported[^1] == 255, "16 MiB 边界应完整读取。");
            var large = Path.Combine(directory, "超限音频.bin"); using (var stream = File.Create(large)) stream.SetLength(NativeSampleFiles.MaximumBytes + 1L);
            ExpectFailure(() => NativeSampleFiles.ReadBytes(large), "超限素材必须在分配缓冲区之前被拒绝。");
            Check(new FileInfo(large).Length == NativeSampleFiles.MaximumBytes + 1L, "超限失败不能改变原件。");
        });
        Case("empty-source-retained", directory =>
        {
            var path = Path.Combine(directory, "空文件.wav"); File.WriteAllBytes(path, []);
            ExpectFailure(() => NativeSampleFiles.ReadBytes(path), "空文件必须清楚拒绝。");
            Check(File.Exists(path) && new FileInfo(path).Length == 0, "拒绝空文件不能删除原件。");
        });
        Case("missing-and-directory-source", directory =>
        {
            ExpectFailure(() => NativeSampleFiles.ReadBytes(Path.Combine(directory, "不存在.wav")), "失效路径不能伪装为成功。");
            var path = Path.Combine(directory, "目录.wav"); Directory.CreateDirectory(path); File.WriteAllText(Path.Combine(path, "keep.txt"), "保留目录");
            ExpectFailure(() => NativeSampleFiles.ReadBytes(path), "目录不能被作为素材读取。");
            Check(File.ReadAllText(Path.Combine(path, "keep.txt")) == "保留目录", "读取失败不能破坏目录。");
        });
        Case("locked-source-retained", directory =>
        {
            var path = Path.Combine(directory, "被占用.wav"); byte[] bytes = [7, 0, 255]; File.WriteAllBytes(path, bytes);
            using (var locked = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.None))
                ExpectFailure(() => NativeSampleFiles.ReadBytes(path), "无法读取的占用文件必须明确失败。");
            Check(File.ReadAllBytes(path).SequenceEqual(bytes), "读取冲突不能修改原件。");
        });
        Case("reentry-without-ui", _ =>
        {
            var files = new NativeSampleFiles(null!);
            typeof(NativeSampleFiles).GetField("opening", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic)!.SetValue(files, 1);
            using var result = JsonDocument.Parse(files.Open());
            Check(result.RootElement.GetProperty("status").GetString() == "error", "重入必须在访问窗口之前拒绝。");
        });
        Case("trusted-microphone-policy-without-devices", _ =>
        {
            foreach (var kind in Enum.GetValues<CoreWebView2PermissionKind>())
                Check(MainWindow.PermissionStateFor("https://rootsound.local/index.html", kind) ==
                    (kind == CoreWebView2PermissionKind.Microphone ? CoreWebView2PermissionState.Default : CoreWebView2PermissionState.Deny),
                    "受信页面仅可将麦克风请求交给默认用户授权流程，不能自动允许其它权限。");
            foreach (var origin in new[] { "", "not a URI", "http://rootsound.local", "https://rootsound.local:444/", "https://rootsound.local.evil.example/", "https://example.com/", "file:///D:/sample.html" })
                Check(MainWindow.PermissionStateFor(origin, CoreWebView2PermissionKind.Microphone) == CoreWebView2PermissionState.Deny,
                    "非受信来源不能申请麦克风权限。");
        });
        return completed;
    }

    private static void Check(bool condition, string message) { if (!condition) throw new InvalidOperationException("采样文件自测失败：" + message); }
    private static void ExpectFailure(Action action, string message)
    {
        try { action(); }
        catch (InvalidDataException) { return; }
        catch (IOException) { return; }
        catch (UnauthorizedAccessException) { return; }
        throw new InvalidOperationException("采样文件自测失败：" + message);
    }
}
