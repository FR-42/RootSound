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

    private string ResolveLibraryFolder(string path)
    {
        string folder = string.IsNullOrWhiteSpace(path) ? DefaultLocation : Path.GetFullPath(path);
        string root = Path.TrimEndingDirectorySeparator(DefaultLocation);
        if (!SamePath(folder, root) && !folder.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
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
