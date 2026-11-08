using System.Globalization;
using System.Text.RegularExpressions;

namespace RootSound.Desktop;

internal sealed record DesktopResourceResponse(Stream Content, int StatusCode, string Reason, string Headers);

/// <summary>One same-origin HTTP surface for packaged UI and authorized session audio.</summary>
internal sealed class DesktopResourceRouter
{
    internal const string Origin = "https://rootsound.local";
    private const string PayloadPrefix = "/__payload/";
    private static readonly Regex PayloadPattern = new("^rootsound-payload:[a-f0-9]{32}:[a-f0-9]{64}$", RegexOptions.CultureInvariant);
    private readonly string root;
    private readonly Func<string, Stream> openPayload;

    internal DesktopResourceRouter(string uiDirectory, Func<string, Stream> openPayload)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(uiDirectory); ArgumentNullException.ThrowIfNull(openPayload);
        root = Path.TrimEndingDirectorySeparator(Path.GetFullPath(uiDirectory));
        this.openPayload = openPayload;
    }

    internal static bool TrustedOrigin(string value) => Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && uri.Scheme == Uri.UriSchemeHttps && uri.Host == "rootsound.local" && uri.IsDefaultPort && uri.UserInfo.Length == 0 && !value.Contains('\\');

    internal static string? PayloadTokenFor(string value)
    {
        if (!TrustedOrigin(value)) return null;
        var uri = new Uri(value);
        if (!uri.AbsolutePath.StartsWith(PayloadPrefix, StringComparison.Ordinal) || uri.Query.Length != 0 || uri.Fragment.Length != 0) return null;
        string token;
        try { token = Uri.UnescapeDataString(uri.AbsolutePath[PayloadPrefix.Length..]); }
        catch (UriFormatException) { return null; }
        return token.Length == 115 && PayloadPattern.IsMatch(token) ? token : null;
    }

    internal DesktopResourceResponse Open(string value, string method, string? range = null)
    {
        if (!TrustedOrigin(value)) return Empty(403, "Local content only");
        if (method is not "GET" and not "HEAD") return Empty(405, "Method not allowed", "Allow: GET, HEAD\r\n");
        var uri = new Uri(value);
        if (uri.AbsolutePath.StartsWith(PayloadPrefix, StringComparison.Ordinal))
        {
            if (method != "GET") return Empty(405, "Method not allowed", "Allow: GET\r\n");
            string? token = PayloadTokenFor(value);
            if (token is null) return Empty(404, "Sample unavailable");
            Stream? content = null;
            try
            {
                content = openPayload(token);
                if (!content.CanRead || !content.CanSeek) throw new IOException("不可读的采样缓存。");
                content.Position = 0;
                return Response(content, "application/octet-stream", content.Length);
            }
            catch (Exception error) when (error is IOException or UnauthorizedAccessException or InvalidDataException or InvalidOperationException or ArgumentException)
            {
                content?.Dispose(); return Empty(404, "Sample unavailable");
            }
        }

        try
        {
            // Inspect the original path too: Uri canonicalization otherwise erases ../.
            int authority = value.IndexOf("://", StringComparison.Ordinal);
            int pathStart = authority < 0 ? -1 : value.IndexOfAny(['/', '?', '#'], authority + 3);
            string original = pathStart < 0 || value[pathStart] != '/' ? "/" : value[pathStart..].Split('?', '#')[0];
            string path = Uri.UnescapeDataString(original);
            if (path.Contains('\\') || path.Contains(':') || path.Contains('\0') || !path.StartsWith('/')) return Empty(403, "Invalid local path");
            if (path == "/") path = "/index.html";
            string[] segments = path[1..].Split('/');
            if (segments.Any(segment => segment is "." or ".." || segment.Length == 0)) return Empty(403, "Invalid local path");
            string file = Path.GetFullPath(Path.Combine(root, Path.Combine(segments)));
            if (!file.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) return Empty(403, "Invalid local path");
            string cursor = root;
            if ((File.GetAttributes(cursor) & FileAttributes.ReparsePoint) != 0) return Empty(403, "Linked content is unavailable");
            for (int i = 0; i < segments.Length; i++)
            {
                cursor = Path.Combine(cursor, segments[i]);
                var attributes = File.GetAttributes(cursor);
                if ((attributes & FileAttributes.ReparsePoint) != 0) return Empty(403, "Linked content is unavailable");
                if (i < segments.Length - 1 && (attributes & FileAttributes.Directory) == 0) return Empty(404, "Not found");
                if (i == segments.Length - 1 && (attributes & FileAttributes.Directory) != 0) return Empty(404, "Not found");
            }
            var input = new FileStream(file, FileMode.Open, FileAccess.Read, FileShare.Read | FileShare.Delete);
            string mime = Mime(Path.GetExtension(file));
            if (mime == "video/mp4")
            {
                long total = input.Length;
                if (method == "HEAD") { input.Dispose(); return MediaResponse(Stream.Null, total, total); }
                if (range is not null)
                {
                    if (!TryMediaRange(range, total, out long start, out long length))
                    { input.Dispose(); return Empty(416, "Range not satisfiable", "Content-Range: bytes */" + total.ToString(CultureInfo.InvariantCulture) + "\r\n"); }
                    return MediaResponse(new MediaSlice(input, start, length), length, total, start);
                }
                return MediaResponse(input, total, total);
            }
            if (method == "HEAD") { long length = input.Length; input.Dispose(); return Response(Stream.Null, mime, length); }
            return Response(input, mime, input.Length);
        }
        catch (UnauthorizedAccessException) { return Empty(403, "Local content unavailable"); }
        catch (Exception error) when (error is IOException or ArgumentException or NotSupportedException) { return Empty(404, "Not found"); }
    }

    private static DesktopResourceResponse Response(Stream content, string mime, long length) => new(content, 200, "OK",
        "Content-Type: " + mime + "\r\nContent-Length: " + length.ToString(CultureInfo.InvariantCulture)
        + "\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff");

    private static DesktopResourceResponse MediaResponse(Stream content, long length, long total, long? start = null) => new(content,
        start.HasValue ? 206 : 200, start.HasValue ? "Partial Content" : "OK",
        "Content-Type: video/mp4\r\nAccept-Ranges: bytes\r\nContent-Length: " + length.ToString(CultureInfo.InvariantCulture)
        + (start.HasValue ? "\r\nContent-Range: bytes " + start.Value.ToString(CultureInfo.InvariantCulture) + "-" + (start.Value + length - 1).ToString(CultureInfo.InvariantCulture) + "/" + total.ToString(CultureInfo.InvariantCulture) : "")
        + "\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff");

    private static bool TryMediaRange(string value, long total, out long start, out long length)
    {
        start = length = 0;
        var match = Regex.Match(value, "^bytes=([0-9]*)-([0-9]*)$", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
        if (!match.Success || total <= 0) return false;
        string left = match.Groups[1].Value, right = match.Groups[2].Value;
        if (left.Length == 0)
        {
            if (!long.TryParse(right, NumberStyles.None, CultureInfo.InvariantCulture, out long suffix) || suffix <= 0) return false;
            length = Math.Min(suffix, total); start = total - length; return true;
        }
        if (!long.TryParse(left, NumberStyles.None, CultureInfo.InvariantCulture, out start) || start >= total) return false;
        long end = total - 1;
        if (right.Length > 0 && (!long.TryParse(right, NumberStyles.None, CultureInfo.InvariantCulture, out end) || end < start)) return false;
        length = Math.Min(end, total - 1) - start + 1; return true;
    }

    private sealed class MediaSlice(Stream source, long start, long length) : Stream
    {
        private long position;
        public override bool CanRead => true;
        public override bool CanSeek => true;
        public override bool CanWrite => false;
        public override long Length => length;
        public override long Position { get => position; set => Seek(value, SeekOrigin.Begin); }
        public override int Read(byte[] buffer, int offset, int count)
        {
            if (position >= length) return 0;
            source.Position = start + position;
            int read = source.Read(buffer, offset, (int)Math.Min(count, length - position)); position += read; return read;
        }
        public override long Seek(long offset, SeekOrigin origin)
        {
            long next = checked((origin == SeekOrigin.Begin ? 0 : origin == SeekOrigin.Current ? position : length) + offset);
            if (next < 0 || next > length) throw new IOException("Invalid media position.");
            position = next; return position;
        }
        public override void Flush() { }
        public override void SetLength(long value) => throw new NotSupportedException();
        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();
        protected override void Dispose(bool disposing) { if (disposing) source.Dispose(); base.Dispose(disposing); }
    }

    private static DesktopResourceResponse Empty(int status, string reason, string extra = "") => new(Stream.Null, status, reason,
        "Content-Type: text/plain; charset=utf-8\r\nContent-Length: 0\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\n" + extra);

    private static string Mime(string extension) => extension.ToLowerInvariant() switch
    {
        ".html" => "text/html; charset=utf-8", ".js" or ".mjs" => "text/javascript; charset=utf-8", ".css" => "text/css; charset=utf-8",
        ".json" or ".map" => "application/json; charset=utf-8", ".svg" => "image/svg+xml", ".png" => "image/png", ".jpg" or ".jpeg" => "image/jpeg",
        ".gif" => "image/gif", ".webp" => "image/webp", ".mp4" => "video/mp4", ".ico" => "image/x-icon", ".woff2" => "font/woff2", ".woff" => "font/woff", ".ttf" => "font/ttf",
        ".wasm" => "application/wasm", _ => "application/octet-stream",
    };
}
