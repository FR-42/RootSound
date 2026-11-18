internal static class InstalledVersionCleanup
{
    private const string MarkerName = "rootsound-installed";

    internal static int Run()
    {
        if (!OperatingSystem.IsWindows()) return 2;

        var host = new DirectoryInfo(AppContext.BaseDirectory);
        var app = host.Parent;
        var current = app?.Parent?.Parent;
        var root = current?.Parent;
        if (host.Name != "host" || app?.Name != "app" || app.Parent?.Name != "resources"
            || current is null || root is null || root.Parent is null
            || ReadVersion(current.Name) is not { } version || !File.Exists(Path.Combine(current.FullName, "RootSound.exe"))) return 2;

        try
        {
            for (DirectoryInfo? ancestor = host; ancestor is not null; ancestor = ancestor.Parent)
            {
                if (!IsRegularDirectory(ancestor)) return 2;
            }
            if (!IsInstalledMarker(new FileInfo(Path.Combine(app.FullName, MarkerName)))) return 2;

            bool failed = false;
            foreach (var candidate in root.GetDirectories("app-*"))
            {
                if (ReadVersion(candidate.Name) is not { } previous || previous.CompareTo(version) >= 0) continue;

                try { RemoveInstalledVersion(candidate); }
                catch (Exception error) when (error is IOException or UnauthorizedAccessException or System.Text.Json.JsonException)
                {
                    failed = true;
                    Console.Error.WriteLine(error.Message);
                }
            }
            return failed ? 3 : 0;
        }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException)
        {
            Console.Error.WriteLine(error.Message);
            return 3;
        }
    }

    internal static int VerifyPayload()
    {
        try
        {
            var root = new DirectoryInfo(Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../..")));
            var manifest = ReadFileList(Path.Combine(root.FullName, "resources/app/install-files.json"));
            if (manifest is null || !new[] { "RootSound.exe", "resources/app/runtime/dotnet.exe", "resources/app/host/RootSound.Host.dll" }
                .All(required => manifest.Files.Any(file => file.Path == required))) return 1;
            return manifest.Files.All(file => Matches(root, file)) ? 0 : 1;
        }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException or System.Text.Json.JsonException)
        {
            Console.Error.WriteLine(error.Message);
            return 1;
        }
    }

    private static void RemoveInstalledVersion(DirectoryInfo candidate)
    {
        if (!IsRegularDirectory(candidate)) return;
        var resources = new DirectoryInfo(Path.Combine(candidate.FullName, "resources"));
        if (!IsRegularDirectory(resources)) return;
        var app = new DirectoryInfo(Path.Combine(resources.FullName, "app"));
        if (!IsRegularDirectory(app)) return;
        var marker = new FileInfo(Path.Combine(app.FullName, MarkerName));
        if (!IsInstalledMarker(marker)) return;
        string ownList = Path.Combine(app.FullName, "install-files.json");
        var manifest = ReadFileList(ownList) ?? ReadFileList(Path.Combine(AppContext.BaseDirectory,
            "../legacy-install-files", candidate.Name + ".json"));
        if (manifest is null) return;

        foreach (string relative in new[] { "RootSound.exe", "resources/app/runtime/dotnet.exe", "resources/app/webview/msedgewebview2.exe" })
        {
            string executable = Path.Combine(candidate.FullName, relative);
            if (File.Exists(executable))
            {
                using var unlocked = File.Open(executable, FileMode.Open, FileAccess.Write, FileShare.None);
            }
        }

        foreach (var file in manifest.Files)
        {
            if (Matches(candidate, file)) File.Delete(Path.Combine(candidate.FullName, file.Path));
        }
        RemoveEmptyDirectories(candidate, manifest);
        bool hasUnknown = candidate.EnumerateFileSystemInfos().Any(entry => entry.Name != "resources")
            || resources.EnumerateFileSystemInfos().Any(entry => entry.Name != "app")
            || app.EnumerateFileSystemInfos().Any(entry => entry.Name != MarkerName && entry.Name != "install-files.json");
        if (!hasUnknown)
        {
            if (File.Exists(ownList)) File.Delete(ownList);
            marker.Delete();
            RemoveEmptyDirectories(candidate, manifest);
            if (!candidate.EnumerateFileSystemInfos().Any()) candidate.Delete();
        }
    }

    private sealed record ProgramFile(string Path, long Bytes, string Sha256);
    private sealed record ProgramFileList(int Version, ProgramFile[] Files);

    private static ProgramFileList? ReadFileList(string filename)
    {
        var source = new FileInfo(filename);
        if (!source.Exists || (source.Attributes & FileAttributes.ReparsePoint) != 0 || source.Length > 32 * 1024 * 1024) return null;
        var manifest = System.Text.Json.JsonSerializer.Deserialize<ProgramFileList>(File.ReadAllText(filename),
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (manifest?.Version != 1 || manifest.Files is null || manifest.Files.Length > 100000) return null;
        var paths = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var file in manifest.Files)
        {
            if (file.Path is null || file.Bytes < 0 || file.Sha256 is null || file.Sha256.Length != 64
                || !file.Sha256.All(char.IsAsciiHexDigit) || file.Path.Contains('\\') || file.Path.Contains(':')
                || file.Path.Split('/').Any(part => part is "" or "." or "..") || !paths.Add(file.Path)) return null;
        }
        return manifest;
    }

    private static bool Matches(DirectoryInfo root, ProgramFile file)
    {
        string path = Path.GetFullPath(Path.Combine(root.FullName, file.Path));
        if (!path.StartsWith(root.FullName + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) return false;
        var info = new FileInfo(path);
        if (!info.Exists || info.Length != file.Bytes || (info.Attributes & FileAttributes.ReparsePoint) != 0) return false;
        for (var parent = info.Directory; parent is not null && parent.FullName != root.FullName; parent = parent.Parent)
            if (!IsRegularDirectory(parent)) return false;
        using var stream = info.OpenRead();
        return Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(stream)).Equals(file.Sha256, StringComparison.OrdinalIgnoreCase);
    }

    private static void RemoveEmptyDirectories(DirectoryInfo root, ProgramFileList manifest)
    {
        var directories = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            Path.Combine(root.FullName, "resources"), Path.Combine(root.FullName, "resources/app")
        };
        foreach (var file in manifest.Files)
            for (var parent = new FileInfo(Path.Combine(root.FullName, file.Path)).Directory;
                parent is not null && parent.FullName != root.FullName; parent = parent.Parent)
                directories.Add(parent.FullName);
        foreach (var path in directories.OrderByDescending(value => value.Length))
        {
            var directory = new DirectoryInfo(path);
            bool linked = false;
            for (var parent = directory; parent is not null && parent.FullName != root.FullName; parent = parent.Parent)
                if (parent.Exists && !IsRegularDirectory(parent)) linked = true;
            if (!linked && directory.Exists && !directory.EnumerateFileSystemInfos().Any()) directory.Delete();
        }
    }

    private static bool IsRegularDirectory(DirectoryInfo directory) => directory.Exists
        && (directory.Attributes & FileAttributes.ReparsePoint) == 0;

    private static bool IsInstalledMarker(FileInfo marker) => marker.Exists
        && (marker.Attributes & FileAttributes.ReparsePoint) == 0 && marker.Length == 0;

    private static ReleaseVersion? ReadVersion(string directory)
    {
        if (!directory.StartsWith("app-", StringComparison.OrdinalIgnoreCase)) return null;
        var parts = directory[4..].Split('-', 2);
        if (!Version.TryParse(parts[0], out var number) || number.Build < 0 || number.Revision >= 0) return null;
        var identifiers = parts.Length == 2 ? parts[1].Split('.') : [];
        if (identifiers.Any(part => part.Length == 0 || part.Any(c => !char.IsAsciiLetterOrDigit(c) && c != '-'))) return null;
        return new ReleaseVersion(number, identifiers);
    }

    private sealed record ReleaseVersion(Version Number, string[] Prerelease)
    {
        internal int CompareTo(ReleaseVersion other)
        {
            int result = Number.CompareTo(other.Number);
            if (result != 0) return result;
            if (Prerelease.Length == 0 || other.Prerelease.Length == 0)
                return (Prerelease.Length == 0).CompareTo(other.Prerelease.Length == 0);

            for (int i = 0; i < Math.Min(Prerelease.Length, other.Prerelease.Length); i++)
            {
                string left = Prerelease[i], right = other.Prerelease[i];
                bool leftNumeric = left.All(char.IsAsciiDigit), rightNumeric = right.All(char.IsAsciiDigit);
                if (leftNumeric != rightNumeric) return leftNumeric ? -1 : 1;
                if (leftNumeric)
                {
                    left = left.TrimStart('0');
                    right = right.TrimStart('0');
                    result = left.Length.CompareTo(right.Length);
                    if (result != 0) return result;
                }
                result = string.CompareOrdinal(left, right);
                if (result != 0) return result;
            }
            return Prerelease.Length.CompareTo(other.Prerelease.Length);
        }
    }
}
