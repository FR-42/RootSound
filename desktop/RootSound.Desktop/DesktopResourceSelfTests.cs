using System.Text;

namespace RootSound.Desktop;

/// <summary>KB-sized route checks; no browser window, network or audio device.</summary>
internal static class DesktopResourceSelfTests
{
    internal const int MaximumFixtureBytes = 4096;
    internal static bool SymbolicLinkChecked { get; private set; }

    internal static int Run(string directory)
    {
        string root = Path.Combine(Path.GetFullPath(directory), "local-resources-" + Guid.NewGuid().ToString("N"));
        string ui = Path.Combine(root, "ui"); Directory.CreateDirectory(Path.Combine(ui, "assets"));
        byte[] index = Encoding.UTF8.GetBytes("<!doctype html><title>RootSound 本地</title><script type=module src=/assets/main.js></script>");
        byte[] script = Encoding.UTF8.GetBytes("export const ready = true;");
        byte[] sample = Enumerable.Range(0, 512).Select(i => (byte)i).ToArray();
        File.WriteAllBytes(Path.Combine(ui, "index.html"), index); File.WriteAllBytes(Path.Combine(ui, "assets", "main.js"), script);
        File.WriteAllText(Path.Combine(ui, "assets", "main.css"), "body{color:black}");
        File.WriteAllBytes(Path.Combine(ui, "assets", "processor.wasm"), [0, 97, 115, 109, 1, 0, 0, 0]);
        File.WriteAllBytes(Path.Combine(ui, "assets", "guide.mp4"), [0, 0, 0, 8, 102, 116, 121, 112]);
        File.WriteAllText(Path.Combine(root, "secret.txt"), "outside UI");
        string token = "rootsound-payload:" + new string('a', 32) + ":" + new string('b', 64);
        int opens = 0, passed = 0;
        var router = new DesktopResourceRouter(ui, value => { opens++; Check(value == token, "only authorized token reaches provider"); return new MemoryStream(sample, false); });
        const string origin = DesktopResourceRouter.Origin;
        void Case(Action action) { action(); passed++; }
        void Status(string url, string method, int expected)
        {
            var response = router.Open(url, method); using (response.Content) Check(response.StatusCode == expected, method + " " + url);
        }

        Case(() =>
        {
            var client = new Rectangle(408, 208, 1084, 704);
            Check(DesktopPointerInput.EdgePosition(new Point(408, 400), client, null)?.X == 0, "window left edge uses the first client pixel");
            Check(DesktopPointerInput.EdgePosition(new Point(1491, 400), client, null)?.X == 1, "window right edge uses the last client pixel");
            Check(DesktopPointerInput.EdgePosition(new Point(409, 400), client, null)?.X > 0, "window interior stays inside the left edge");
            Check(DesktopPointerInput.EdgePosition(new Point(1490, 400), client, null)?.X < 1, "window interior stays inside the right edge");
            Check(DesktopPointerInput.EdgePosition(new Point(900, 208), client, null)?.Y == 0, "window top edge uses the first client pixel");
        });
        Case(() =>
        {
            var monitor = new Rectangle(-2560, 0, 2560, 1440);
            var frame = new Rectangle(-2572, -12, 2584, 1410);
            Check(DesktopPointerInput.EdgePosition(new Point(-2560, 400), frame, monitor)?.X == 0, "maximized edge clips to physical monitor on the left");
            Check(DesktopPointerInput.EdgePosition(new Point(-2558, 400), frame, monitor)?.X > 0, "nearby interior pixels do not count as the physical edge");
            Check(DesktopPointerInput.EdgePosition(new Point(-2556, 400), frame, monitor)?.X > 0, "tolerance stays narrow on a scaled monitor");
            Check(DesktopPointerInput.EdgePosition(new Point(-2200, 0), frame, monitor)?.Y == 0, "maximized top edge clips to the physical monitor");
            Check(DesktopPointerInput.EdgePosition(new Point(-2200, 1397), frame, monitor)?.Y == 1, "frame bottom ends at the taskbar");
        });
        Case(() =>
        {
            var monitor = new Rectangle(0, 0, 1920, 1200);
            var frame = new Rectangle(-8, -8, 1936, 1216);
            Check(DesktopPointerInput.EdgePosition(new Point(0, 600), frame, monitor)?.X == 0, "leftmost screen pixel arms the left edge");
            Check(DesktopPointerInput.EdgePosition(new Point(1919, 600), frame, monitor)?.X == 1, "rightmost screen pixel arms the right edge");
            Check(DesktopPointerInput.EdgePosition(new Point(1915, 600), frame, monitor)?.X < 1, "interior motion does not arm the right edge");
        });
        Case(() =>
        {
            Check(DesktopTaskbar.ShouldMarkFullscreen(FormWindowState.Maximized, true, () => true),
                "active maximized window with auto-hide is marked full-screen");
            Check(!DesktopTaskbar.ShouldMarkFullscreen(FormWindowState.Normal, true, () => true),
                "restored window leaves full-screen");
            Check(!DesktopTaskbar.ShouldMarkFullscreen(FormWindowState.Minimized, true, () => true),
                "minimized window leaves full-screen");
            Check(!DesktopTaskbar.ShouldMarkFullscreen(FormWindowState.Maximized, false, () => true),
                "switching away from a maximized window leaves full-screen");
            Check(!DesktopTaskbar.ShouldMarkFullscreen(FormWindowState.Maximized, true, () => false),
                "an always-visible taskbar keeps normal maximized behavior");
        });
        Case(() =>
        {
            using var projects = new ProjectDirectoryManager(root);
            foreach (var state in new[] { FormWindowState.Normal, FormWindowState.Maximized })
            {
                using var window = new MainWindow(projects, root) { WindowState = state };
                var handle = window.Handle;
                var bounds = window.Bounds;
                var client = window.ClientSize;
                var content = window.RectangleToScreen(window.ClientRectangle);
                Check(window.ControlBox && window.MinimizeBox && window.MaximizeBox, "native caption controls are enabled");
                Check(content.Top - bounds.Top > bounds.Bottom - content.Bottom, "the caption stays above the editor");
                Check(window.Bounds == bounds && window.ClientSize == client && window.Handle == handle && window.WindowState == state && !window.Visible,
                    "the window and editor geometry are stable in normal and maximized states");
            }
        });
        Case(() =>
        {
            foreach (string url in new[] { origin + "/", origin + "/index.html", origin + "/?return=/assets/main.js" })
            {
                var response = router.Open(url, "GET"); using var content = response.Content; using var bytes = new MemoryStream(); content.CopyTo(bytes);
                Check(response.StatusCode == 200 && bytes.ToArray().SequenceEqual(index), "real index stream");
                Check(response.Headers.Contains("text/html; charset=utf-8") && response.Headers.Contains("Content-Length: " + index.Length)
                    && response.Headers.Contains("Cache-Control: no-store") && response.Headers.Contains("nosniff"), "index headers");
            }
            Check(opens == 0, "UI never touches audio");
        });
        Case(() =>
        {
            foreach (var item in new[] { ("main.js", "text/javascript"), ("main.css", "text/css"), ("processor.wasm", "application/wasm"), ("guide.mp4", "video/mp4") })
            {
                var response = router.Open(origin + "/assets/" + item.Item1 + "?v=1", "GET"); using var content = response.Content;
                Check(response.StatusCode == 200 && response.Headers.Contains(item.Item2), "module MIME");
            }
            var head = router.Open(origin + "/assets/main.js", "HEAD"); using var headContent = head.Content;
            Check(head.StatusCode == 200 && headContent.ReadByte() == -1 && head.Headers.Contains("Content-Length: " + script.Length), "HEAD returns length without body");
        });
        Case(() =>
        {
            foreach (string url in new[] { "http://rootsound.local/index.html", "https://example.com/index.html", "https://rootsound.local.evil/index.html", "https://u:p@rootsound.local/index.html", "https://rootsound.local:444/index.html", "file:///index.html" }) Status(url, "GET", 403);
            Check(DesktopResourceRouter.TrustedOrigin("https://rootsound.local:443/index.html"), "explicit default HTTPS port");
            Status(origin + "/index.html", "POST", 405);
            Status(origin + "/missing.js", "GET", 404); Status(origin + "/assets", "GET", 404);
        });
        Case(() =>
        {
            const string url = origin + "/assets/guide.mp4";
            foreach (var item in new[] { ("bytes=4-6", new byte[] { 102, 116, 121 }, "4-6/8"), ("bytes=6-", new byte[] { 121, 112 }, "6-7/8"), ("bytes=-2", new byte[] { 121, 112 }, "6-7/8"), ("bytes=6-99", new byte[] { 121, 112 }, "6-7/8") })
            {
                var response = router.Open(url, "GET", item.Item1); using var stream = response.Content; using var bytes = new MemoryStream(); stream.CopyTo(bytes);
                Check(response.StatusCode == 206 && bytes.ToArray().SequenceEqual(item.Item2), "exact video slice");
                Check(response.Headers.Contains("Content-Range: bytes " + item.Item3) && response.Headers.Contains("Accept-Ranges: bytes"), "seekable video headers");
                stream.Position = 0; Check(stream.ReadByte() == item.Item2[0] && stream.Length == item.Item2.Length, "media slice seek");
            }
            foreach (string range in new[] { "bytes=99-", "bytes=5-2", "bytes=-0", "bytes=0-1,3-4", "bytes=999999999999999999999999999-" })
            { var response = router.Open(url, "GET", range); using var stream = response.Content; Check(response.StatusCode == 416 && response.Headers.Contains("bytes */8"), "invalid range rejected"); }
        });
        Case(() =>
        {
            foreach (string path in new[] { "/../secret.txt", "/assets/../../secret.txt", "/%2e%2e/secret.txt", "/assets/%2e%2e/%2e%2e/secret.txt", "/assets/%5cmain.js", "/assets/main.js:stream", "/assets/%00main.js" }) Status(origin + path, "GET", 403);
            Check(opens == 0, "invalid static paths never open audio");
        });
        Case(() =>
        {
            var response = router.Open(origin + "/__payload/" + Uri.EscapeDataString(token), "GET"); using var content = response.Content; using var bytes = new MemoryStream(); content.CopyTo(bytes);
            Check(response.StatusCode == 200 && bytes.ToArray().SequenceEqual(sample), "payload stream reaches actual provider");
            Check(response.Headers.Contains("application/octet-stream") && response.Headers.Contains("Content-Length: 512") && response.Headers.Contains("no-store"), "payload length and no-cache");
            Check(opens == 1, "one payload opening");
        });
        Case(() =>
        {
            string good = origin + "/__payload/" + token;
            foreach (string url in new[] { good + "?x=1", good + "#x", good + "/", origin + "/__payload/not-a-token", origin + "/__payload/" + token.ToUpperInvariant() })
            { Check(DesktopResourceRouter.PayloadTokenFor(url) is null, "malformed token rejected"); Status(url, "GET", 404); }
            Status(good, "HEAD", 405); Check(opens == 1, "bad payload requests do not open source");
            var failed = new DesktopResourceRouter(ui, _ => throw new IOException("stale private session path"));
            var response = failed.Open(good, "GET"); using var content = response.Content;
            Check(response.StatusCode == 404 && !response.Headers.Contains("private"), "stale tokens do not leak internal details");
        });
        SymbolicLinkChecked = false;
        try
        {
            File.CreateSymbolicLink(Path.Combine(ui, "linked.txt"), Path.Combine(root, "secret.txt"));
            Case(() => Status(origin + "/linked.txt", "GET", 403)); SymbolicLinkChecked = true;
        }
        catch (Exception error) when (error is UnauthorizedAccessException or IOException or PlatformNotSupportedException) { }
        Case(() =>
        {
            string source = Path.Combine(root, "seeds"), data = Path.Combine(root, "installed data");
            Directory.CreateDirectory(source); Directory.CreateDirectory(data);
            byte[] song = Encoding.UTF8.GetBytes("fixture song");
            File.WriteAllBytes(Path.Combine(source, "新曲.rootsound"), song);
            var entry = new { name = "新曲.rootsound", bytes = song.Length, sha256 = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(song)) };
            File.WriteAllText(Path.Combine(source, "manifest.json"), System.Text.Json.JsonSerializer.Serialize(new { version = 2, projects = new[] { entry } }));
            Check(BundledProjects.Seed(source, data) == 1, "first launch imports demos");
            string destination = Path.Combine(data, "project/演示项目/新曲.rootsound");
            File.WriteAllText(destination, "user changes");
            Check(BundledProjects.Seed(source, data) == 0 && File.ReadAllText(destination) == "user changes", "upgrade preserves edited demos");
            File.Delete(destination);
            Check(BundledProjects.Seed(source, data) == 0 && !File.Exists(destination), "upgrade preserves user deletions");
            string other = Path.Combine(root, "existing data");
            Directory.CreateDirectory(Path.Combine(other, "project/演示项目"));
            File.WriteAllText(Path.Combine(other, "project/演示项目/新曲.rootsound"), "existing work");
            Check(BundledProjects.Seed(source, other) == 0, "same-name work is skipped");
            Check(File.ReadAllText(Path.Combine(other, "project/演示项目/新曲.rootsound")) == "existing work", "same-name work is never replaced");
        });
        Case(() =>
        {
            string source = Path.Combine(root, "seeds"), fresh = Path.Combine(root, "fresh install"), upgrade = Path.Combine(root, "upgrade install");
            Directory.CreateDirectory(Path.Combine(upgrade, "project"));
            Check(BundledProjects.SeedForInstallation(source, upgrade) == 0 &&
                !Directory.EnumerateFileSystemEntries(Path.Combine(upgrade, "project")).Any(), "existing empty project directory stays empty");
            Check(BundledProjects.SeedForInstallation(source, fresh) == 1, "fresh install without a project directory receives demos");
            string demo = Path.Combine(fresh, "project/演示项目/新曲.rootsound");
            File.Delete(demo);
            Check(BundledProjects.SeedForInstallation(source, fresh) == 0 && !File.Exists(demo), "relaunch never restores a removed demo");
            string userSong = Path.Combine(upgrade, "project/user.mid");
            File.WriteAllText(userSong, "user song");
            Check(BundledProjects.SeedForInstallation(source, upgrade) == 0 &&
                Directory.GetFileSystemEntries(Path.Combine(upgrade, "project")).Select(Path.GetFileName).SequenceEqual(new[] { "user.mid" }) &&
                File.ReadAllText(userSong) == "user song", "existing library without a seed record is untouched");
            File.Delete(userSong);
            File.WriteAllText(Path.Combine(upgrade, ".skip-bundled-projects"), "");
            Check(BundledProjects.SeedForInstallation(source, upgrade) == 0 &&
                !Directory.EnumerateFileSystemEntries(Path.Combine(upgrade, "project")).Any(), "empty library in an old install remains empty");
        });
        Case(() =>
        {
            string source = Path.Combine(root, "bad seeds"), data = Path.Combine(root, "bad data");
            Directory.CreateDirectory(source); Directory.CreateDirectory(data);
            foreach (string name in new[] { "../escape.rootsound", "sub/../../escape.rootsound", "C:/escape.rootsound" })
            {
                File.WriteAllText(Path.Combine(source, "manifest.json"), System.Text.Json.JsonSerializer.Serialize(new { version = 2, projects = new[] { new { name } } }));
                try { BundledProjects.Seed(source, data); throw new InvalidOperationException("unsafe seed accepted"); }
                catch (IOException) { }
            }
            Check(!File.Exists(Path.Combine(root, "escape.rootsound")), "unsafe names never escape the project folder");
        });
        Check(Directory.GetFiles(root, "*", SearchOption.AllDirectories).All(file => new FileInfo(file).Length <= MaximumFixtureBytes), "only KB fixtures");
        return passed;
    }

    private static void Check(bool condition, string message) { if (!condition) throw new InvalidOperationException("Local resource check failed: " + message); }
}
