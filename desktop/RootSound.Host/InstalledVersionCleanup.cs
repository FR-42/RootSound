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
                catch (Exception error) when (error is IOException or UnauthorizedAccessException)
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

    private static void RemoveInstalledVersion(DirectoryInfo candidate)
    {
        if (!IsRegularDirectory(candidate)) return;
        var resources = new DirectoryInfo(Path.Combine(candidate.FullName, "resources"));
        if (!IsRegularDirectory(resources)) return;
        var app = new DirectoryInfo(Path.Combine(resources.FullName, "app"));
        if (!IsRegularDirectory(app)) return;
        var marker = new FileInfo(Path.Combine(app.FullName, MarkerName));
        if (!IsInstalledMarker(marker) || Path.Exists(Path.Combine(candidate.FullName, "project"))) return;

        string executable = Path.Combine(candidate.FullName, "RootSound.exe");
        if (File.Exists(executable))
        {
            using var unlocked = File.Open(executable, FileMode.Open, FileAccess.Write, FileShare.None);
        }

        RemoveEntriesExcept(candidate, resources.Name);
        RemoveEntriesExcept(resources, app.Name);
        RemoveEntriesExcept(app, marker.Name);
        marker.Delete();
        app.Delete();
        resources.Delete();
        candidate.Delete();
    }

    private static void RemoveEntriesExcept(DirectoryInfo directory, string retainedName)
    {
        foreach (var entry in directory.GetFileSystemInfos())
        {
            if (entry.Name.Equals(retainedName, StringComparison.OrdinalIgnoreCase)) continue;
            if (entry is DirectoryInfo child) child.Delete(recursive: true);
            else entry.Delete();
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
