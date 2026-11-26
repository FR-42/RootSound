using System.Text.Json.Serialization;
using System.Security.Cryptography;

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
    private string? selectedLibraryRoot;
    private sealed record LibraryTransfer(string Source, string Destination, bool Moved, string[] Contents);
    private readonly Stack<LibraryTransfer> libraryTransfers = new();
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

    public ProjectLibraryPage BrowseSelectedFolder(string path)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            string folder = Path.GetFullPath(path);
            if (!Directory.Exists(folder) || IsLink(folder) || IsLibraryStagingName(Path.GetFileName(folder)))
                throw new IOException("请选择可以打开的乐曲文件夹。");
            string? previous = selectedLibraryRoot;
            selectedLibraryRoot = WithinLibrary(folder, DefaultLocation) ? null : folder;
            try { return Browse(folder); }
            catch { selectedLibraryRoot = previous; throw; }
        }
    }

    public string ReadLibraryScore(string path)
    {
        FileStream stream;
        lock (gate)
        {
            ThrowIfDisposed();
            path = FullDirectory(path);
            if (!IsKnownProjectPath(path)) throw new IOException("请重新选择乐曲库中的歌曲。");
            if (Directory.Exists(path))
            {
                using var legacy = new AtomicTextStore(path);
                return legacy.Read() ?? throw new IOException("找不到歌曲资料。");
            }
            stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        }
        using (stream)
        {
            if (stream.Length > AtomicTextStore.MaximumBytes) throw new IOException("歌曲文件超过当前大小上限。");
            var score = StreamingWorkspaceCodec.Read(stream, null, omitAssetData: true);
            _ = ProjectFromMetadata(path, score.Metadata);
            return score.Library;
        }
    }

    public ProjectLibraryPage Browse(string path = "")
    {
        lock (gate)
        {
            ThrowIfDisposed();
            string folder = ResolveLibraryFolder(path);
            string root = LibraryRootFor(folder);
            string? parent = SamePath(folder, root) ? null : Path.GetDirectoryName(folder);
            var entries = new List<ProjectLibraryEntry>();
            if (!Directory.Exists(folder)) return new(root, folder, parent, entries);
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
            return new(root, folder, parent, entries.OrderBy(entry => entry.Kind == "folder" ? 0 : 1)
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

    public void TransferLibraryEntry(string source, string directory, bool move)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            source = RequireTransferEntry(source);
            directory = ResolveLibraryFolder(directory);
            if (!Directory.Exists(directory) || IsKnownProjectPath(directory))
                throw new IOException("请选择用于粘贴的文件夹。");
            bool folder = Directory.Exists(source);
            if (folder && WithinLibrary(directory, source))
                throw new IOException("不能把文件夹粘贴到它自己或它的子目录。");
            var entries = folder ? LibraryTree(source) : [source];
            string destination = Path.Combine(directory, Path.GetFileName(source));
            if (move && SamePath(source, destination)) return;
            if (move && Path.Exists(destination)) throw new IOException("当前目录已有同名文件或文件夹。");
            if (!move && Path.Exists(destination))
            {
                string extension = folder ? "" : Path.GetExtension(source);
                string name = folder ? Path.GetFileName(source) : Path.GetFileNameWithoutExtension(source);
                int number = 1;
                do
                {
                    destination = Path.Combine(directory, name + (number == 1 ? " - 副本" : $" - 副本 ({number})") + extension);
                    number++;
                } while (Path.Exists(destination));
            }
            using var ownership = ClaimLibraryFiles(entries);
            if (move)
            {
                var contents = TransferContents(source, entries);
                MoveLibraryItem(source, destination, folder);
                libraryTransfers.Push(new(source, destination, true, contents));
            }
            else
            {
                string staged = Path.Combine(directory, ".rootsound-create-" + Guid.NewGuid().ToString("N"));
                try
                {
                    foreach (string entry in entries)
                    {
                        string target = SamePath(entry, source) ? staged : Path.Combine(staged, Path.GetRelativePath(source, entry));
                        if (IsLink(entry)) throw new IOException("复制过程中发现目录链接。");
                        if (Directory.Exists(entry)) Directory.CreateDirectory(target);
                        else
                        {
                            File.Copy(entry, target);
                            File.SetAttributes(target, File.GetAttributes(target) & ~FileAttributes.ReadOnly);
                        }
                    }
                    var contents = TransferContents(staged, folder ? LibraryTree(staged, true) : [staged]);
                    MoveLibraryItem(staged, destination, folder);
                    libraryTransfers.Push(new(source, destination, false, contents));
                }
                finally
                {
                    if (Directory.Exists(staged)) Directory.Delete(staged, true);
                    else File.Delete(staged);
                }
            }
            listingHeaders.Clear();
        }
    }

    public void UndoLibraryTransfer()
    {
        lock (gate)
        {
            ThrowIfDisposed();
            if (!libraryTransfers.TryPeek(out var change)) return;
            string destination = RequireTransferEntry(change.Destination);
            bool folder = Directory.Exists(destination);
            var entries = folder ? LibraryTree(destination) : [destination];
            using var ownership = ClaimLibraryFiles(entries);
            if (!change.Contents.SequenceEqual(TransferContents(destination, entries)))
                throw new IOException("粘贴的内容已发生变化，无法撤销这次操作。");
            if (change.Moved)
            {
                string parent = ResolveLibraryFolder(Path.GetDirectoryName(change.Source)!);
                if (!Directory.Exists(parent) || Path.Exists(change.Source))
                    throw new IOException("原位置已不存在或已有同名文件。");
                MoveLibraryItem(destination, change.Source, folder);
            }
            else
            {
                string staged = Path.Combine(Path.GetDirectoryName(destination)!, ".rootsound-delete-" + Guid.NewGuid().ToString("N"));
                MoveLibraryItem(destination, staged, folder);
                try
                {
                    if (folder) Directory.Delete(staged, true);
                    else File.Delete(staged);
                }
                catch
                {
                    if (Path.Exists(staged) && !Path.Exists(destination)) MoveLibraryItem(staged, destination, folder);
                    throw;
                }
            }
            libraryTransfers.Pop();
            listingHeaders.Clear();
        }
    }

    private string RequireTransferEntry(string path)
    {
        path = FullDirectory(path);
        string parent = ResolveLibraryFolder(Path.GetDirectoryName(path) ?? "");
        if (SamePath(path, LibraryRootFor(path)) || !Path.Exists(path) || IsLink(path) ||
            IsLibraryStagingName(Path.GetFileName(path)) || IsKnownProjectPath(parent) ||
            !Directory.Exists(path) && !IsKnownProjectPath(path) && NativeDocumentFiles.Format(path) is null)
            throw new IOException("请重新选择乐曲库中的文件或文件夹。");
        if (current is not null && WithinLibrary(current.Path, path))
            throw new IOException("其中的歌曲正在编辑，请先退出歌曲。");
        return path;
    }

    private static void MoveLibraryItem(string source, string destination, bool folder)
    {
        if (folder) Directory.Move(source, destination);
        else File.Move(source, destination);
    }

    private static string[] TransferContents(string root, IEnumerable<string> entries) =>
        entries.Select(entry =>
        {
            string name = Path.GetRelativePath(root, entry);
            if (Directory.Exists(entry)) return $"目录:{name}";
            using var stream = File.OpenRead(entry);
            return $"文件:{name}:{Convert.ToHexString(SHA256.HashData(stream))}";
        }).Order(StringComparer.Ordinal).ToArray();

    public void RenameLibraryEntry(string path, string name)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            if (sourceDocument is not null && current is not null && SamePath(current.Path, path))
            {
                _ = ResolveLibraryFolder(Path.GetDirectoryName(path)!);
                Rename(path, current.Id, name, savedSnapshot!, RenameToken(path));
                return;
            }
            path = RequireLibraryEntry(path, allowEditing: true);
            bool folder = Directory.Exists(path);
            string parent = Path.GetDirectoryName(path)!;
            string target = LibraryDestination(parent, name, folder ? "" : Path.GetExtension(path), path);
            if (path == target) return;
            var entries = folder ? LibraryTree(path) : new[] { path };
            bool containsActive = folder && current is { PendingSave: false } && WithinLibrary(current.Path, path);
            using var ownership = ClaimLibraryFiles(entries.Where(entry => !containsActive || !SamePath(entry, current!.Path)));
            if (containsActive)
            {
                activeStore!.MoveParent(path, target);
                current = current! with { Path = activeStore.FilePath };
                if (sourceDocument is not null) sourceDocument = sourceDocument with { Path = activeStore.FilePath };
                listingHeaders.Clear();
                return;
            }
            Action<string, string> move = folder ? Directory.Move : (from, to) => File.Move(from, to);
            if (SamePath(path, target))
            {
                string staging = Path.Combine(parent, ".rootsound-rename-" + Guid.NewGuid().ToString("N"));
                move(path, staging);
                try { move(staging, target); }
                catch { move(staging, path); throw; }
            }
            else move(path, target);
            if (current is { PendingSave: true } pending && folder && WithinLibrary(pending.Path, path))
                current = pending with { Path = Path.Combine(target, Path.GetRelativePath(path, pending.Path)) };
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

    private string RequireLibraryEntry(string path, bool allowEditing = false)
    {
        path = FullDirectory(path);
        string parent = ResolveLibraryFolder(Path.GetDirectoryName(path) ?? "");
        if (SamePath(path, DefaultLocation) || !Path.Exists(path) || IsLink(path)
            || IsLibraryStagingName(Path.GetFileName(path)) || IsKnownProjectPath(path)
            || IsKnownProjectPath(parent) || !Directory.Exists(path) && NativeDocumentFiles.Format(path) is null)
            throw new IOException("请重新选择乐曲库中的文件或文件夹。");
        if (!allowEditing && current is not null && (SamePath(current.Path, path)
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
        string root = LibraryRootFor(folder);
        if (!WithinLibrary(folder, root))
            throw new IOException("请在乐曲库目录中浏览。");
        for (string? currentFolder = folder; currentFolder is not null; currentFolder = Path.GetDirectoryName(currentFolder))
        {
            if (Directory.Exists(currentFolder) && IsLink(currentFolder)) throw new IOException("乐曲库不打开目录链接。");
            if (SamePath(currentFolder, root)) return folder;
            if (IsLibraryStagingName(Path.GetFileName(currentFolder))) throw new IOException("这个目录不是乐曲文件夹。");
        }
        throw new IOException("请在乐曲库目录中浏览。");
    }

    private string LibraryRootFor(string path) => selectedLibraryRoot is { } selected && WithinLibrary(path, selected) ? selected : DefaultLocation;

    private static bool WithinLibrary(string path, string root)
    {
        string relative = Path.GetRelativePath(root, path);
        return !Path.IsPathRooted(relative) && relative != ".."
            && !relative.StartsWith(".." + Path.DirectorySeparatorChar, StringComparison.Ordinal);
    }

    private static bool IsLibraryStagingName(string name) => new[] { ".rootsound-create-", ".rootsound-delete-", ".rootsound-rename-" }
        .Any(prefix => name.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
}
