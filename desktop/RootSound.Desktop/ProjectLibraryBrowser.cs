using System.Text.Json.Serialization;

namespace RootSound.Desktop;

public sealed record ProjectLibraryEntry(
    [property: JsonPropertyName("kind")] string Kind,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("path")] string Path,
    [property: JsonPropertyName("id"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Id = null);
public sealed record ProjectLibraryPage(
    [property: JsonPropertyName("root")] string Root,
    [property: JsonPropertyName("path")] string Path,
    [property: JsonPropertyName("parent"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Parent,
    [property: JsonPropertyName("entries")] IReadOnlyList<ProjectLibraryEntry> Entries);

public sealed partial class ProjectDirectoryManager
{
    private readonly Dictionary<string, (long Length, DateTime Modified, ProjectDirectoryInfo Project)> listingHeaders = new(StringComparer.OrdinalIgnoreCase);

    private ProjectDirectoryInfo ReadListedProject(string path)
    {
        var info = new FileInfo(path);
        if (listingHeaders.TryGetValue(path, out var cached) && cached.Length == info.Length && cached.Modified == info.LastWriteTimeUtc)
            return cached.Project;
        var project = ReadEnvelope(path).Project;
        listingHeaders[path] = (info.Length, info.LastWriteTimeUtc, project);
        return project;
    }

    public ProjectLibraryPage Browse(string path = "")
    {
        lock (gate)
        {
            ThrowIfDisposed();
            string folder = ResolveLibraryFolder(path);
            string? parent = SamePath(folder, DefaultLocation) ? null : Path.GetDirectoryName(folder);
            var entries = new List<ProjectLibraryEntry>();
            if (!Directory.Exists(folder)) return new(DefaultLocation, folder, parent, entries);
            var options = new EnumerationOptions { IgnoreInaccessible = true, AttributesToSkip = FileAttributes.ReparsePoint };
            foreach (var item in new DirectoryInfo(folder).EnumerateFileSystemInfos("*", options))
            {
                try
                {
                    if ((item.Attributes & FileAttributes.ReparsePoint) != 0 || IsLibraryStagingName(item.Name)) continue;
                    if (item is DirectoryInfo)
                    {
                        // Legacy folder projects are one library item, not an exposed materials directory.
                        if (SamePath(folder, DefaultLocation) && IsKnownProjectPath(item.FullName))
                        {
                            var legacy = ReadManifest(item.FullName);
                            entries.Add(new("project", legacy.Name, legacy.Path, legacy.Id));
                        }
                        else entries.Add(new("folder", item.Name, item.FullName));
                    }
                    else if (Path.GetExtension(item.Name).Equals(".rootsound", StringComparison.OrdinalIgnoreCase) && IsKnownProjectPath(item.FullName))
                    {
                        var project = ReadListedProject(item.FullName);
                        entries.Add(new("project", project.Name, project.Path, project.Id));
                    }
                    else if (NativeDocumentFiles.Format(item.FullName) is { } format)
                        entries.Add(new(format == "midi" ? "midi" : "document", Path.GetFileNameWithoutExtension(item.Name), item.FullName));
                }
                catch (IOException) { }
                catch (UnauthorizedAccessException) { }
                catch (InvalidDataException) { }
            }
            return new(DefaultLocation, folder, parent, entries.OrderBy(entry => entry.Kind == "folder" ? 0 : 1)
                .ThenBy(entry => entry.Name, StringComparer.OrdinalIgnoreCase).ThenBy(entry => entry.Path, StringComparer.OrdinalIgnoreCase).ToArray());
        }
    }

    public byte[] ReadKnownMidi(string path)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            path = Path.GetFullPath(path);
            _ = ResolveLibraryFolder(Path.GetDirectoryName(path) ?? "");
            if (!File.Exists(path) || IsLink(path) || !NativeMidiFiles.IsMidiPath(path))
                throw new IOException("这个 MIDI 已移动或不在乐曲库中，请重新选择。");
            return NativeMidiFiles.ReadBytes(path);
        }
    }

    public string ResolveLibrarySongPath(string path, string expectedId)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            path = FullDirectory(path);
            if (expectedId.Length == 0)
            {
                path = RequireLibraryEntry(path);
                if (!File.Exists(path)) throw new IOException("请选择乐曲文件。");
                return path;
            }
            if (!Guid.TryParse(expectedId, out _) || !IsKnownProjectPath(path))
                throw new IOException("请重新选择乐曲库中的歌曲。");
            bool file = File.Exists(path);
            var project = file ? ReadEnvelope(path).Project : ReadManifest(path);
            if (project.Id != expectedId) throw new IOException("这个位置的歌曲已被替换，请重新选择。");
            return file ? path : Path.Combine(path, "project.json");
        }
    }

    public void CreateLibraryFolder(string path, string name)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            string parent = ResolveLibraryFolder(path);
            if (SamePath(parent, DefaultLocation)) Directory.CreateDirectory(parent);
            if (!Directory.Exists(parent) || IsKnownProjectPath(parent)) throw new IOException("请选择乐曲库文件夹。");
            string target = LibraryDestination(parent, name);
            string staging = Path.Combine(parent, ".rootsound-create-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(staging);
            try { Directory.Move(staging, target); }
            finally { RemoveEmptyDeletionDirectory(staging); }
        }
    }

    public void RenameLibraryEntry(string path, string name)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            path = RequireLibraryEntry(path);
            bool folder = Directory.Exists(path);
            string parent = Path.GetDirectoryName(path)!;
            string target = LibraryDestination(parent, name, folder ? "" : Path.GetExtension(path), path);
            if (path == target) return;
            var entries = folder ? LibraryTree(path) : new[] { path };
            using var ownership = ClaimLibraryFiles(entries);
            Action<string, string> move = folder ? Directory.Move : (from, to) => File.Move(from, to);
            if (SamePath(path, target))
            {
                string staging = Path.Combine(parent, ".rootsound-rename-" + Guid.NewGuid().ToString("N"));
                move(path, staging);
                try { move(staging, target); }
                catch { move(staging, path); throw; }
            }
            else move(path, target);
            listingHeaders.Clear();
        }
    }

    public void DeleteLibraryEntry(string path)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            path = RequireLibraryEntry(path);
            bool folder = Directory.Exists(path);
            var entries = folder ? LibraryTree(path) : new[] { path };
            string[] directories = folder ? entries.Where(Directory.Exists).ToArray() : [];
            string[] files = entries.Where(File.Exists).ToArray();
            if (entries.Any(entry => (File.GetAttributes(entry) & FileAttributes.ReadOnly) != 0))
                throw new IOException("所选内容中有只读文件或目录。");
            using var ownership = ClaimLibraryFiles(entries);
            if (!folder)
            {
                using var captured = CaptureDeletionFiles(files);
                captured.VerifyUnchanged();
                File.Delete(path);
                return;
            }
            string staging = Path.Combine(Path.GetDirectoryName(path)!, ".rootsound-delete-" + Guid.NewGuid().ToString("N"));
            Directory.Move(path, staging);
            try
            {
                var staged = LibraryTree(staging, allowStagingRoot: true);
                var expected = entries.Select(entry => Path.GetRelativePath(path, entry)).ToHashSet(StringComparer.Ordinal);
                if (!expected.SetEquals(staged.Select(entry => Path.GetRelativePath(staging, entry))))
                    throw new IOException("文件夹内容已变化。");
                foreach (string file in files) File.Delete(Path.Combine(staging, Path.GetRelativePath(path, file)));
                foreach (string dir in directories.Reverse())
                    Directory.Delete(dir == path ? staging : Path.Combine(staging, Path.GetRelativePath(path, dir)));
            }
            catch (Exception error) when (error is IOException or UnauthorizedAccessException)
            {
                if (Directory.Exists(staging) && !Path.Exists(path)) Directory.Move(staging, path);
                throw new IOException("未能删除文件夹中的全部内容。", error);
            }
            listingHeaders.Clear();
        }
    }

    private string RequireLibraryEntry(string path)
    {
        path = FullDirectory(path);
        string parent = ResolveLibraryFolder(Path.GetDirectoryName(path) ?? "");
        if (SamePath(path, DefaultLocation) || !Path.Exists(path) || IsLink(path)
            || IsLibraryStagingName(Path.GetFileName(path)) || IsKnownProjectPath(path)
            || IsKnownProjectPath(parent) || !Directory.Exists(path) && NativeDocumentFiles.Format(path) is null)
            throw new IOException("请重新选择乐曲库中的文件或文件夹。");
        if (current is not null && (SamePath(current.Path, path)
            || current.Path.StartsWith(path + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)))
            throw new IOException("其中的歌曲正在编辑，请先退出歌曲。");
        return path;
    }

    private static string LibraryDestination(string parent, string name, string extension = "", string? original = null)
    {
        name = ValidateName(name);
        if (IsLibraryStagingName(name)) throw new IOException("请使用其他名称。");
        string target = Path.Combine(parent, name + extension);
        if (Path.Exists(target) && (original is null || !SamePath(target, original))) throw new IOException("当前目录已有同名文件或文件夹。");
        return target;
    }

    private static string[] LibraryTree(string path, bool allowStagingRoot = false)
    {
        var entries = new List<string> { path };
        for (int i = 0; i < entries.Count; i++)
        {
            string entry = entries[i];
            if (IsLink(entry) || (!allowStagingRoot || i != 0) && IsLibraryStagingName(Path.GetFileName(entry)))
                throw new IOException("文件夹中含有链接或正在处理的文件。");
            if (Directory.Exists(entry)) entries.AddRange(Directory.EnumerateFileSystemEntries(entry));
        }
        return entries.ToArray();
    }

    private sealed class LibraryFileClaims : IDisposable
    {
        internal readonly List<AtomicTextStore> Stores = [];
        public void Dispose() { foreach (var store in Stores) store.Dispose(); }
    }

    private static LibraryFileClaims ClaimLibraryFiles(IEnumerable<string> entries)
    {
        var claims = new LibraryFileClaims();
        try
        {
            foreach (string entry in entries)
                if (File.Exists(entry) && (NativeDocumentFiles.Format(entry) is not null || Path.GetExtension(entry).Equals(".rootsound", StringComparison.OrdinalIgnoreCase)))
                    claims.Stores.Add(AtomicTextStore.ForProjectFile(entry));
            return claims;
        }
        catch { claims.Dispose(); throw; }
    }

    private string ResolveLibraryFolder(string path)
    {
        string folder = string.IsNullOrWhiteSpace(path) ? DefaultLocation : Path.GetFullPath(path);
        string root = Path.TrimEndingDirectorySeparator(DefaultLocation);
        var comparison = OperatingSystem.IsWindows() ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal;
        if (!string.Equals(Path.TrimEndingDirectorySeparator(folder), root, comparison) && !folder.StartsWith(root + Path.DirectorySeparatorChar, comparison))
            throw new IOException("请在乐曲库目录中浏览。");
        for (string? currentFolder = folder; currentFolder is not null; currentFolder = Path.GetDirectoryName(currentFolder))
        {
            if (Directory.Exists(currentFolder) && IsLink(currentFolder)) throw new IOException("乐曲库不打开目录链接。");
            if (SamePath(currentFolder, root)) return folder;
            if (IsLibraryStagingName(Path.GetFileName(currentFolder))) throw new IOException("这个目录不是乐曲文件夹。");
        }
        throw new IOException("请在乐曲库目录中浏览。");
    }

    private static bool IsLibraryStagingName(string name) => new[] { ".rootsound-create-", ".rootsound-delete-", ".rootsound-rename-" }
        .Any(prefix => name.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
}
