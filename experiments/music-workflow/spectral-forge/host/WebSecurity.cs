namespace RootSound.SpectralForge;

internal static class WebSecurity
{
    internal static bool Trusted(string value) => Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && uri.Scheme == Uri.UriSchemeHttps && uri.Host == "spectral.local" && uri.IsDefaultPort && uri.UserInfo.Length == 0;

    internal static string? LocalResource(string directory, string url)
    {
        if (!Trusted(url)) return null;
        try
        {
            string relative = Uri.UnescapeDataString(new Uri(url).AbsolutePath).TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            if (relative.Contains(':') || relative.Contains('\0')) return null;
            string root = Path.GetFullPath(directory).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            string target = Path.GetFullPath(Path.Combine(root, relative));
            return target.StartsWith(root, StringComparison.OrdinalIgnoreCase) ? target : null;
        }
        catch (ArgumentException) { return null; }
        catch (NotSupportedException) { return null; }
    }
}
