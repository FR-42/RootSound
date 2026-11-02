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
            foreach (var item in new[] { ("main.js", "text/javascript"), ("main.css", "text/css"), ("processor.wasm", "application/wasm") })
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
        Check(Directory.GetFiles(root, "*", SearchOption.AllDirectories).All(file => new FileInfo(file).Length <= MaximumFixtureBytes), "only KB fixtures");
        return passed;
    }

    private static void Check(bool condition, string message) { if (!condition) throw new InvalidOperationException("Local resource check failed: " + message); }
}
