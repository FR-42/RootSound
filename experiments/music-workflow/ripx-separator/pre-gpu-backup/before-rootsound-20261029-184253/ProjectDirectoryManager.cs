using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Nodes;
using System.Security.Cryptography;

namespace RootSound.Desktop;

public sealed record ProjectDirectoryInfo(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("path")] string Path);

public sealed record ProjectLibrarySnapshot(
    [property: JsonPropertyName("project")] ProjectDirectoryInfo Project,
    [property: JsonPropertyName("libraryText")] string LibraryText,
    [property: JsonPropertyName("token")] string Token);

/// <summary>One running session starts empty and owns at most one independent on-disk project.</summary>
public sealed class ProjectDirectoryManager : IDisposable
{
    private static readonly UTF8Encoding Utf8 = new(false, true);
    private readonly object gate = new();
    private readonly Action<string>? beforeCommit;
    private readonly Action<string>? beforeSaveCommit;
    private readonly Action<string>? beforeDeleteFile;
    private readonly Action<string>? beforeRenameCapture;
    private readonly ProjectTimbreMirror timbreMirror;
    private TimbreFilesState timbreFilesState = new("idle", null);
    private string? timbreSongDraftId;
    public string? LastTimbreCleanupWarning { get; private set; }
    internal long TimbrePayloadBytesRead => timbreMirror.PayloadBytesRead;
    internal long TimbrePayloadFilesWritten => timbreMirror.PayloadFilesWritten;
    private AtomicTextStore? activeStore;
    private ProjectDirectoryInfo? current;
    private string? currentSnapshot;
    private string? savedSnapshot;
    private string? committedSnapshot;
    private bool loadingCompleted;
    private byte[]? observedManifestHash;
    private JsonObject? fileEnvelope;
    private string? memory;
    private string scope = Guid.NewGuid().ToString("N");
    private bool disposed;

    public string DefaultLocation { get; }

    public ProjectDirectoryManager(string installationRoot) : this(installationRoot, null) { }

    internal ProjectDirectoryManager(string installationRoot, Action<string>? beforeCommit) : this(installationRoot, beforeCommit, null) { }

    internal ProjectDirectoryManager(string installationRoot, Action<string>? beforeCommit, Action<string>? beforeSaveCommit)
        : this(installationRoot, beforeCommit, beforeSaveCommit, null) { }

    internal ProjectDirectoryManager(string installationRoot, Action<string>? beforeCommit, Action<string>? beforeSaveCommit, Action<string>? beforeDeleteFile)
        : this(installationRoot, beforeCommit, beforeSaveCommit, beforeDeleteFile, null) { }

    internal ProjectDirectoryManager(string installationRoot, Action<string>? beforeCommit, Action<string>? beforeSaveCommit, Action<string>? beforeDeleteFile, Action<string>? beforeRenameCapture)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(installationRoot);
        DefaultLocation = Path.Combine(Path.GetFullPath(installationRoot), "project");
        timbreMirror = new ProjectTimbreMirror(installationRoot);
        this.beforeCommit = beforeCommit;
        this.beforeSaveCommit = beforeSaveCommit;
        this.beforeDeleteFile = beforeDeleteFile;
        this.beforeRenameCapture = beforeRenameCapture;
    }

    public ProjectDirectoryInfo? Current
    {
        get { lock (gate) { ThrowIfDisposed(); return current; } }
    }

    public TimbreFilesState TimbreFilesState { get { lock (gate) { ThrowIfDisposed(); return timbreFilesState; } } }

    public TimbreFilesState SyncTimbres(string? songDraftId = null)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            if (current is null || committedSnapshot is null) return timbreFilesState = new("idle", null);
            if (!string.IsNullOrEmpty(songDraftId))
            {
                using var document = JsonDocument.Parse(committedSnapshot);
                if (!document.RootElement.GetProperty("drafts").EnumerateArray().Any(item => item.GetProperty("id").GetString() == songDraftId && item.GetProperty("kind").GetString() == "rootsound.song"))
                    throw new IOException("当前歌曲编辑稿标识无效，音色目录尚未切换。");
                timbreSongDraftId = songDraftId;
            }
            try { activeStore?.VerifyUnchanged(); }
            catch (Exception error) { return timbreFilesState = new("warning", timbreMirror.DirectoryFor(current.Id), "音色目录副本尚未更新：" + error.Message); }
            MirrorTimbres(committedSnapshot, verifyPhysicalFiles: true); return timbreFilesState;
        }
    }

    private void MirrorTimbres(string library, bool verifyPhysicalFiles = false)
    {
        if (current is null) return;
        string directory = timbreMirror.DirectoryFor(current.Id);
        try
        {
            string? previousWarning = timbreFilesState.status == "warning" ? timbreFilesState.message : null;
            timbreMirror.Sync(current.Id, library, timbreSongDraftId, verifyPhysicalFiles);
            timbreFilesState = !verifyPhysicalFiles && previousWarning is not null ? new("warning", directory, previousWarning) : new("mirrored", directory);
        }
        catch (Exception error) { timbreFilesState = new("warning", directory, "音色已保存在工程，目录副本暂未写入：" + error.Message); }
    }

    // Status reads must never adopt another program's bytes as an accepted write baseline.
    public bool HasUnsavedChanges
    {
        get { lock (gate) { ThrowIfDisposed(); return current is not null && !string.Equals(currentSnapshot, savedSnapshot, StringComparison.Ordinal); } }
    }

    public (string? Value, string Scope) ReadLibrary()
    {
        lock (gate)
        {
            ThrowIfDisposed();
            if (activeStore is null) return (memory, scope);
            // The library is this session's working copy. A status/read call must
            // neither replace it with disk nor accept external changes as a baseline.
            activeStore.VerifyUnchanged();
            if (fileEnvelope is null) RequireManifestUnchanged();
            return (currentSnapshot, scope);
        }
    }

    public void WriteLibrary(string value, string? expectedScope = null, bool checkpoint = false)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            if (expectedScope is not null && !string.Equals(expectedScope, scope, StringComparison.Ordinal))
                throw new IOException("当前歌曲项目已切换，这次旧页面的保存没有写入。请重新打开当前歌曲后再编辑。");
            ValidateLibrary(value);
            if (checkpoint && activeStore is null) throw new IOException("请先创建或打开歌曲项目，再执行永久删除。");
            if (activeStore is null) memory = value;
            else
            {
                if (!File.Exists(activeStore.FilePath)) throw new IOException("当前歌曲项目文件已被移走，本次没有重建或覆盖它。");
                activeStore.VerifyUnchanged();
                if (fileEnvelope is null) RequireManifestUnchanged();
                currentSnapshot = value;
            }
        }
    }

    public ProjectDirectoryInfo Create(string name, string parentPath, string libraryText) => CreateCore(name, parentPath, libraryText, false);

    /// <summary>An explicit Save As may activate a saved copy without saving the original draft.</summary>
    public ProjectDirectoryInfo CreateCopy(string name, string parentPath, string libraryText) => CreateCore(name, parentPath, libraryText, true);

    private ProjectDirectoryInfo CreateCore(string name, string parentPath, string libraryText, bool copy)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            if (!copy) RequireCleanForSwitch();
            name = ValidateName(name);
            string text = ValidateLibrary(libraryText);
            string parent = FullDirectory(parentPath);
            if (!Directory.Exists(parent))
            {
                if (!SamePath(parent, DefaultLocation)) throw new DirectoryNotFoundException("选择的保存位置不存在，请重新选择文件夹。");
                Directory.CreateDirectory(parent);
            }
            string target = Path.GetFullPath(Path.Combine(parent, name + ".rootsound"));
            if (!SamePath(Path.GetDirectoryName(target)!, parent)) throw new IOException("歌曲名称不能改变保存位置。");
            if (Path.Exists(target) || Path.Exists(Path.Combine(parent, name))) throw new IOException("这里已经有同名歌曲文件或旧版项目文件夹，请换一个歌曲名称或保存位置。");

            string staging = Path.Combine(parent, ".rootsound-create-" + Guid.NewGuid().ToString("N") + ".tmp");
            bool ownsStaging = false;
            try
            {
                // Claim one uniquely named file; never create a per-song directory.
                using var stagingOwner = new FileStream(staging, FileMode.CreateNew, FileAccess.Write, FileShare.None);
                ownsStaging = true;
                string id = Guid.NewGuid().ToString("N");
                var manifest = JsonSerializer.Serialize(new
                {
                    format = "RootSoundWorkspace", version = 2, id, name,
                    createdAtUtc = DateTimeOffset.UtcNow.ToString("O", CultureInfo.InvariantCulture),
                    libraryText = text,
                });
                ValidateEncodingAndSize(manifest);
                stagingOwner.Write(Utf8.GetBytes(manifest)); stagingOwner.Flush(true); stagingOwner.Dispose();
                beforeCommit?.Invoke(target);
                File.Move(staging, target); // A racing destination is never overwritten.
                ownsStaging = false;
                try { return ActivateFile(target); }
                catch (Exception error)
                {
                    throw new IOException("歌曲文件已创建，但暂时无法打开。现有歌曲仍保持原状；可稍后从乐曲库打开：" + target + "。原因：" + error.Message, error);
                }
            }
            finally
            {
                // Only the uniquely claimed staging file is ours; never remove a racing target.
                if (ownsStaging && SamePath(Path.GetDirectoryName(staging)!, parent)
                    && Path.GetFileName(staging).StartsWith(".rootsound-create-", StringComparison.Ordinal)
                    && File.Exists(staging) && (File.GetAttributes(staging) & FileAttributes.ReparsePoint) == 0)
                {
                    try { File.Delete(staging); } catch (IOException) { } catch (UnauthorizedAccessException) { }
                }
            }
        }
    }

    public ProjectDirectoryInfo Save(string? name = null)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            if (current is null || activeStore is null) throw new IOException("先创建或打开一个歌曲项目，再保存。");
            string nextName = string.IsNullOrEmpty(name) ? current.Name : ValidateName(name);
            var nextProject = current with { Name = nextName };
            if (fileEnvelope is not null)
            {
                activeStore.VerifyUnchanged();
                beforeSaveCommit?.Invoke(current.Path);
                WriteStoredLibrary(currentSnapshot ?? throw new IOException("当前歌曲资料不可用。"), nextName, verifyTimbres: true);
                current = nextProject; committedSnapshot = savedSnapshot = currentSnapshot; loadingCompleted = true;
                return current;
            }
            byte[] originalManifest = RequireManifestUnchanged();
            activeStore.VerifyUnchanged();
            string library = currentSnapshot ?? throw new IOException("当前歌曲资料不可用。");
            if (!string.Equals(nextName, current.Name, StringComparison.Ordinal))
            {
                int offset = originalManifest.AsSpan().StartsWith(new byte[] { 0xef, 0xbb, 0xbf }) ? 3 : 0;
                var manifest = JsonNode.Parse(Utf8.GetString(originalManifest, offset, originalManifest.Length - offset))!.AsObject(); manifest["name"] = nextName;
                byte[] nextManifest = Utf8.GetBytes(manifest.ToJsonString());
                if (nextManifest.Length > 64 * 1024) throw new InvalidDataException("项目说明文件过大，本次未修改名称。");
                string materialPath = Path.Combine(current.Path, "materials.json"); string manifestPath = Path.Combine(current.Path, "project.json");
                RenameLegacyFiles(current.Path, [(materialPath, Utf8.GetBytes(library)), (manifestPath, nextManifest)], RenameToken(manifestPath, materialPath));
                activeStore.ReadValidated(text => { if (text != library) throw new IOException("保存后项目资料再次变化，请重新打开项目。"); });
                observedManifestHash = SHA256.HashData(nextManifest);
            }
            else
            {
                beforeSaveCommit?.Invoke(activeStore.FilePath); RequireManifestUnchanged();
                WriteStoredLibrary(library, verifyTimbres: true);
            }
            current = nextProject;
            committedSnapshot = savedSnapshot = currentSnapshot;
            loadingCompleted = true;
            MirrorTimbres(currentSnapshot!, verifyPhysicalFiles: true);
            return current;
        }
    }

    /// <summary>Accept only the first loader-created editor scaffolding of this activation.</summary>
    public void FinishLoading()
    {
        lock (gate)
        {
            ThrowIfDisposed();
            if (current is null || loadingCompleted) return;
            savedSnapshot = currentSnapshot;
            loadingCompleted = true;
        }
    }

    /// <summary>Leave the current song, restoring its manual checkpoint when requested.</summary>
    public void Exit(string mode, string? name = null)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            if (mode is not "save" and not "discard") throw new ArgumentException("请选择保存退出或直接退出。", nameof(mode));
            if (current is not null && activeStore is not null)
            {
                if (mode == "save") Save(name);
                activeStore.Dispose();
            }
            activeStore = null;
            current = null; timbreFilesState = new("idle", null); timbreSongDraftId = null;
            currentSnapshot = null;
            savedSnapshot = null;
            committedSnapshot = null;
            memory = null;
            loadingCompleted = false;
            observedManifestHash = null;
            fileEnvelope = null;
            scope = Guid.NewGuid().ToString("N");
        }
    }

    public ProjectDirectoryInfo Open(string path)
    {
        lock (gate)
        {
            ThrowIfDisposed();
            RequireCleanForSwitch();
            path = FullDirectory(path);
            if (File.Exists(path) && string.Equals(Path.GetFileName(path), "project.json", StringComparison.OrdinalIgnoreCase)) path = Path.GetDirectoryName(path)!;
            if (File.Exists(path))
            {
                if (!string.Equals(Path.GetExtension(path), ".rootsound", StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("请选择 RootSound 歌曲项目文件（.rootsound）。");
                return ActivateFile(path);
            }
            if (current is not null && SamePath(current.Path, path))
            {
                // Reopening the same project still invalidates writes from the old page.
                byte[] manifest = ReadManifestBytes(path);
                var refreshed = ParseManifest(path, manifest);
                currentSnapshot = committedSnapshot = savedSnapshot = activeStore!.ReadValidated(text => ValidateLibrary(text ?? throw new InvalidDataException("这个项目缺少 materials.json。")));
                loadingCompleted = false;
                if (!ReadManifestBytes(path).AsSpan().SequenceEqual(manifest)) throw new IOException("读取期间项目说明发生变化，请重试。");
                current = refreshed; timbreSongDraftId = null;
                observedManifestHash = SHA256.HashData(manifest);
                scope = Guid.NewGuid().ToString("N");
                MirrorTimbres(committedSnapshot!, verifyPhysicalFiles: true);
                return current;
            }
            return Activate(path);
        }
    }

    /// <summary>Read only direct project files and supported legacy folders in the default location.</summary>
    public IReadOnlyList<ProjectDirectoryInfo> List()
    {
        lock (gate)
        {
            ThrowIfDisposed();
            if (!Directory.Exists(DefaultLocation) || IsLink(DefaultLocation)) return Array.Empty<ProjectDirectoryInfo>();
            var projects = new List<ProjectDirectoryInfo>();
            foreach (string path in Directory.EnumerateFiles(DefaultLocation, "*.rootsound"))
            {
                try { if (IsKnownProjectPath(path)) projects.Add(ReadEnvelope(path).Project); }
                catch (IOException) { } catch (UnauthorizedAccessException) { } catch (InvalidDataException) { }
            }
            foreach (string path in Directory.EnumerateDirectories(DefaultLocation))
            {
                try
                {
                    if (Path.GetFileName(path).StartsWith(".rootsound-create-", StringComparison.OrdinalIgnoreCase)
                        || Path.GetFileName(path).StartsWith(".rootsound-delete-", StringComparison.OrdinalIgnoreCase) || !IsKnownProjectPath(path)) continue;
                    var info = ReadManifest(path);
                    ReadLegacyLibrary(path);
                    projects.Add(info);
                }
                catch (IOException) { }
                catch (UnauthorizedAccessException) { }
                catch (InvalidDataException) { }
            }
            return projects.OrderBy(project => project.Name, StringComparer.OrdinalIgnoreCase)
                .ThenBy(project => project.Path, StringComparer.OrdinalIgnoreCase).ToArray();
        }
    }

    public ProjectDirectoryInfo OpenKnown(string path)
    {
        lock (gate)
        {
            ThrowIfDisposed(); path = FullDirectory(path);
            if (!IsKnownProjectPath(path)) throw new IOException("这个项目不在默认保存目录中，请使用乐曲库底部的文件夹按钮选择项目文件。");
            return Open(path);
        }
    }

    /// <summary>Read a generic snapshot for the application's domain-level metadata edit.</summary>
    public ProjectLibrarySnapshot Inspect(string path, string expectedId)
    {
        lock (gate)
        {
            ThrowIfDisposed(); path = RequireEditableSelection(path, expectedId);
            if (File.Exists(path))
            {
                using var ownership = AtomicTextStore.ForProjectFile(path);
                var parsed = ParseEnvelope(path, ownership.Read() ?? throw new IOException("歌曲文件已被移走。"));
                RequireSelectedIdentity(parsed.Project, expectedId);
                string token = RenameToken(path); ownership.VerifyUnchanged();
                return new(parsed.Project, parsed.Library, token);
            }
            using var legacy = new AtomicTextStore(path);
            byte[] manifest = ReadManifestBytes(path); var selected = ParseManifest(path, manifest);
            RequireSelectedIdentity(selected, expectedId);
            string library = ValidateLibrary(legacy.Read() ?? throw new IOException("项目资料已被移走。"));
            string legacyToken = RenameToken(Path.Combine(path, "project.json"), Path.Combine(path, "materials.json"));
            legacy.VerifyUnchanged();
            if (!ReadManifestBytes(path).AsSpan().SequenceEqual(manifest)) throw new IOException("项目说明刚刚变化，请重新选择歌曲。");
            return new(selected, library, legacyToken);
        }
    }

    /// <summary>Only storage metadata is edited here; the application supplies the renamed library.</summary>
    public ProjectDirectoryInfo Rename(string path, string expectedId, string name, string libraryText, string expectedToken)
    {
        lock (gate)
        {
            ThrowIfDisposed(); path = RequireEditableSelection(path, expectedId); name = ValidateName(name);
            libraryText = ValidateLibrary(libraryText);
            if (string.IsNullOrWhiteSpace(expectedToken)) throw new IOException("歌曲快照已过期，请重新打开乐曲库。");
            if (File.Exists(path))
            {
                using var ownership = AtomicTextStore.ForProjectFile(path);
                var parsed = ParseEnvelope(path, ownership.Read() ?? throw new IOException("歌曲文件已被移走。"));
                RequireSelectedIdentity(parsed.Project, expectedId);
                if (RenameToken(path) != expectedToken) throw new IOException("这首歌刚刚发生变化，请重新选择后改名。");
                var envelope = (JsonObject)parsed.Envelope.DeepClone(); envelope["name"] = name; envelope["libraryText"] = libraryText;
                string replacement = envelope.ToJsonString(); ValidateEncodingAndSize(replacement);
                beforeSaveCommit?.Invoke(path);
                RequireEditableSelection(path, expectedId); ownership.VerifyUnchanged();
                if (RenameToken(path) != expectedToken) throw new IOException("这首歌刚刚发生变化，本次未修改名称。");
                ownership.Write(replacement);
                return parsed.Project with { Name = name };
            }
            using var legacy = new AtomicTextStore(path);
            byte[] originalManifest = ReadManifestBytes(path); var selected = ParseManifest(path, originalManifest);
            RequireSelectedIdentity(selected, expectedId); _ = ValidateLibrary(legacy.Read() ?? throw new IOException("项目资料已被移走。"));
            string manifestPath = Path.Combine(path, "project.json"); string materialPath = Path.Combine(path, "materials.json");
            if (RenameToken(manifestPath, materialPath) != expectedToken) throw new IOException("这首歌刚刚发生变化，请重新选择后改名。");
            int offset = originalManifest.AsSpan().StartsWith(new byte[] { 0xef, 0xbb, 0xbf }) ? 3 : 0;
            JsonObject manifest;
            try { manifest = JsonNode.Parse(Utf8.GetString(originalManifest, offset, originalManifest.Length - offset))!.AsObject(); manifest["name"] = name; }
            catch (Exception error) when (error is JsonException or ArgumentException or InvalidOperationException) { throw new InvalidDataException("项目说明文件无效，原项目已保留。", error); }
            byte[] replacementManifest = Utf8.GetBytes(manifest.ToJsonString());
            if (replacementManifest.Length > 64 * 1024) throw new InvalidDataException("项目说明文件过大，原名称已保留。");
            beforeSaveCommit?.Invoke(path);
            RequireEditableSelection(path, expectedId); legacy.VerifyUnchanged();
            if (RenameToken(manifestPath, materialPath) != expectedToken) throw new IOException("这首歌刚刚发生变化，本次未修改名称。");
            RenameLegacyFiles(path, [(materialPath, Utf8.GetBytes(libraryText)), (manifestPath, replacementManifest)], expectedToken);
            return selected with { Name = name };
        }
    }

    private string RequireEditableSelection(string path, string expectedId)
    {
        path = FullDirectory(path);
        if (!Guid.TryParse(expectedId, out _) || !IsKnownProjectPath(path)) throw new IOException("请重新选择乐曲库中的歌曲。");
        if (current is not null && SamePath(current.Path, path)) throw new IOException("这首歌正在编辑，请先退出歌曲后再在库里改名。");
        return path;
    }

    private static string RenameToken(params string[] paths)
    {
        using var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
        foreach (string path in paths)
        {
            using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read | FileShare.Delete);
            if (stream.Length > AtomicTextStore.MaximumBytes) throw new InvalidDataException("歌曲文件超过当前大小上限。");
            hash.AppendData(SHA256.HashData(stream));
        }
        return Convert.ToHexString(hash.GetHashAndReset());
    }

    // Legacy projects have two files. Prepare both replacements and durable original
    // copies before changing either name; ordinary exceptions roll the pair back.
    private void RenameLegacyFiles(string directory, (string Path, byte[] Bytes)[] replacements, string expectedToken)
    {
        string staging = Path.Combine(directory, ".rootsound-rename-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(staging);
        var originals = new Dictionary<string, (string Recovery, byte[] Hash)>();
        var changed = new Dictionary<string, byte[]>(); var owned = new List<string>();
        bool recovered = false;
        try
        {
            foreach (var replacement in replacements)
            {
                beforeRenameCapture?.Invoke(replacement.Path);
                if (IsLink(replacement.Path) || (File.GetAttributes(replacement.Path) & FileAttributes.ReadOnly) != 0)
                    throw new IOException("项目文件只读或包含链接，本次没有改名。");
                string old = Path.Combine(staging, Path.GetFileName(replacement.Path) + ".original");
                string next = Path.Combine(staging, Path.GetFileName(replacement.Path) + ".next");
                using (var source = new FileStream(replacement.Path, FileMode.Open, FileAccess.Read, FileShare.Read | FileShare.Delete))
                using (var backup = new FileStream(old, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                { source.CopyTo(backup); backup.Flush(true); }
                owned.Add(old); originals.Add(replacement.Path, (old, SHA256.HashData(File.ReadAllBytes(old))));
                using (var candidate = new FileStream(next, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                { candidate.Write(replacement.Bytes); candidate.Flush(true); }
                owned.Add(next);
            }
            // The durable originals, not a later reread of live paths, must match
            // the snapshot edited by the application. A late external write (or
            // an A/B/A change while capturing) must never become our new baseline.
            string capturedToken = RenameToken(originals[Path.Combine(directory, "project.json")].Recovery,
                originals[Path.Combine(directory, "materials.json")].Recovery);
            if (capturedToken != expectedToken) throw new IOException("捕获的歌曲快照已变化，本次没有修改名称。请重新选择歌曲。");
            foreach (var replacement in replacements)
            {
                beforeSaveCommit?.Invoke(replacement.Path);
                if (!HasCapturedBytes(replacement.Path, originals[replacement.Path].Hash)) throw new IOException("项目文件已被外部修改，本次没有覆盖它。");
                File.Replace(Path.Combine(staging, Path.GetFileName(replacement.Path) + ".next"), replacement.Path, null);
                changed.Add(replacement.Path, SHA256.HashData(replacement.Bytes));
            }
            recovered = true;
        }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException)
        {
            try
            {
                foreach (var change in changed)
                {
                    if (!HasCapturedBytes(change.Key, change.Value)) throw new IOException("原位置出现更新的内容，未覆盖它。");
                    string restore = Path.Combine(staging, Guid.NewGuid().ToString("N") + ".restore"); owned.Add(restore);
                    using (var source = new FileStream(originals[change.Key].Recovery, FileMode.Open, FileAccess.Read, FileShare.Read))
                    using (var target = new FileStream(restore, FileMode.CreateNew, FileAccess.Write, FileShare.None)) { source.CopyTo(target); target.Flush(true); }
                    if (!HasCapturedBytes(change.Key, change.Value)) throw new IOException("恢复前原位置再次变化，未覆盖它。");
                    File.Replace(restore, change.Key, null);
                }
                recovered = true;
            }
            catch (Exception recovery) when (recovery is IOException or UnauthorizedAccessException)
            { throw new IOException("改名未完成，原始文件保留在恢复目录：" + staging + "。原因：" + recovery.Message, error); }
            throw new IOException("未能改名，原项目已保留。原因：" + error.Message, error);
        }
        finally
        {
            if (recovered || changed.Count == 0)
            {
                foreach (string file in owned) { try { File.Delete(file); } catch (IOException) { } catch (UnauthorizedAccessException) { } }
                RemoveEmptyDeletionDirectory(staging);
            }
        }
    }

    /// <summary>Called only after the library's explicit permanent-delete confirmation.</summary>
    public void Delete(string path, string expectedId)
    {
        lock (gate)
        {
            ThrowIfDisposed(); path = FullDirectory(path);
            if (!Guid.TryParse(expectedId, out _)) throw new IOException("歌曲标识无效，请重新打开乐曲库。");
            if (!IsKnownProjectPath(path)) throw new IOException("只能删除乐曲库中默认保存位置的歌曲，请重新打开乐曲库。");
            if (current is not null && SamePath(current.Path, path)) throw new IOException("这首歌正在编辑，请先退出歌曲后再删除。");
            if (File.Exists(path)) DeleteProjectFile(path, expectedId);
            else DeleteLegacyProject(path, expectedId);
            try { LastTimbreCleanupWarning = timbreMirror.RemoveProject(expectedId); }
            catch (Exception error) { LastTimbreCleanupWarning = "歌曲已删除，音色目录中仍有未清理的副本：" + error.Message; }
        }
    }

    private void DeleteProjectFile(string path, string expectedId)
    {
        using var ownership = AtomicTextStore.ForProjectFile(path);
        var selected = ParseEnvelope(path, ownership.Read() ?? throw new IOException("歌曲文件已被移走。"));
        RequireSelectedIdentity(selected.Project, expectedId);
        string backup = path + ".bak";
        string[] files = Path.Exists(backup) ? [path, backup] : [path];
        using var captured = CaptureDeletionFiles(files);
        beforeCommit?.Invoke(path);
        if (!IsKnownProjectPath(path)) throw new IOException("歌曲路径已变化，请重新打开乐曲库。");
        ownership.VerifyUnchanged();
        captured.VerifyUnchanged();
        if (Path.Exists(backup) != files.Contains(backup)) throw new IOException("歌曲备份刚刚发生变化，本次没有删除。");
        string staging = NewDeletionPath();
        Directory.CreateDirectory(staging);
        try { DeleteCaptured(path, staging, captured, isDirectory: false); }
        finally { captured.Dispose(); ownership.Dispose(); RemoveEmptyDeletionDirectory(staging); }
    }

    private void DeleteLegacyProject(string path, string expectedId)
    {
        string[] allowed = ["project.json", "project.json.bak", "materials.json", "materials.json.bak", "materials.lock"];
        RequireLegacyDeletionFiles(path, allowed);
        string lockPath = Path.Combine(path, "materials.lock");
        // Delete sharing allows our rename/removal but still denies another writer's ownership.
        using var ownership = new FileStream(lockPath, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.Delete);
        RequireLegacyDeletionFiles(path, allowed);
        var selected = ReadManifest(path); RequireSelectedIdentity(selected, expectedId);
        ValidateLibrary(File.ReadAllText(Path.Combine(path, "materials.json"), Utf8));
        string[] files = Directory.GetFiles(path).Where(file => !SamePath(file, lockPath)).ToArray();
        using var captured = CaptureDeletionFiles(files);
        beforeCommit?.Invoke(path);
        RequireLegacyDeletionFiles(path, allowed);
        RequireSelectedIdentity(ReadManifest(path), expectedId);
        captured.VerifyUnchanged();
        var currentFiles = Directory.GetFiles(path).Where(file => !SamePath(file, lockPath)).OrderBy(file => file, StringComparer.OrdinalIgnoreCase);
        if (!currentFiles.SequenceEqual(files.OrderBy(file => file, StringComparer.OrdinalIgnoreCase), StringComparer.OrdinalIgnoreCase))
            throw new IOException("歌曲文件列表刚刚发生变化，本次没有删除。");
        string staging = NewDeletionPath();
        Directory.CreateDirectory(staging);
        bool deleted = false;
        try { DeleteCaptured(path, staging, captured, isDirectory: true); deleted = true; }
        finally
        {
            captured.Dispose(); ownership.Dispose(); RemoveEmptyDeletionDirectory(staging);
            if (deleted) RemoveEmptyDeletionDirectory(path);
        }
    }

    private static void RequireSelectedIdentity(ProjectDirectoryInfo selected, string expectedId)
    {
        if (!string.Equals(selected.Id, expectedId, StringComparison.Ordinal))
            throw new IOException("这个位置的歌曲已被替换，本次没有删除。请重新打开乐曲库后再选择。");
    }

    private static void RequireLegacyDeletionFiles(string path, string[] allowed)
    {
        if (IsLink(path)) throw new IOException("不能删除链接目录。");
        foreach (string item in Directory.EnumerateFileSystemEntries(path))
        {
            if (IsLink(item) || Directory.Exists(item) || !allowed.Contains(Path.GetFileName(item), StringComparer.OrdinalIgnoreCase))
                throw new IOException("旧项目目录中还有其他文件，本次没有删除。请先移出这些文件。");
        }
    }

    private string NewDeletionPath()
    {
        string path = Path.Combine(DefaultLocation, ".rootsound-delete-" + Guid.NewGuid().ToString("N"));
        if (!SamePath(Path.GetDirectoryName(path)!, DefaultLocation) || Path.Exists(path)) throw new IOException("无法准备歌曲删除，请重试。");
        return path;
    }

    private static CapturedDeletionFiles CaptureDeletionFiles(string[] files) => new(files);

    private static void RemoveEmptyDeletionDirectory(string path)
    {
        try { if (Directory.Exists(path) && !Directory.EnumerateFileSystemEntries(path).Any()) Directory.Delete(path); }
        catch (IOException) { } catch (UnauthorizedAccessException) { }
    }

    private sealed class CapturedDeletionFiles : IDisposable
    {
        internal readonly List<(string Path, FileStream Stream, byte[] Hash, FileAttributes Attributes)> Files = [];
        internal CapturedDeletionFiles(string[] paths)
        {
            try
            {
                foreach (string path in paths)
                {
                    var attributes = File.GetAttributes(path);
                    if ((attributes & (FileAttributes.ReparsePoint | FileAttributes.ReadOnly | FileAttributes.Directory)) != 0)
                        throw new IOException("歌曲文件被设为只读或包含链接，本次没有删除。");
                    var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read | FileShare.Delete);
                    try { Files.Add((path, stream, SHA256.HashData(stream), attributes)); }
                    catch { stream.Dispose(); throw; }
                }
            }
            catch { Dispose(); throw; }
        }
        internal void VerifyUnchanged()
        {
            foreach (var file in Files)
            {
                if (IsLink(file.Path)) throw new IOException("歌曲文件已变为链接，本次没有删除。");
                using var stream = new FileStream(file.Path, FileMode.Open, FileAccess.Read, FileShare.Read | FileShare.Delete);
                if (!SHA256.HashData(stream).AsSpan().SequenceEqual(file.Hash)) throw new IOException("歌曲文件刚刚发生变化，本次没有删除。");
            }
        }
        public void Dispose() { foreach (var file in Files) file.Stream.Dispose(); }
    }

    private void DeleteCaptured(string original, string staging, CapturedDeletionFiles captured, bool isDirectory)
    {
        try
        {
            foreach (var file in captured.Files) File.Move(file.Path, Path.Combine(staging, Path.GetFileName(file.Path)));
            foreach (var capturedFile in captured.Files)
            {
                string file = Path.Combine(staging, Path.GetFileName(capturedFile.Path));
                beforeDeleteFile?.Invoke(file);
                File.Delete(file);
            }
            if (isDirectory)
            {
                string lockFile = Path.Combine(original, "materials.lock");
                beforeDeleteFile?.Invoke(lockFile); File.Delete(lockFile);
            }
        }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException)
        {
            bool occupiedOriginal = false;
            try
            {
                // Open delete-sharing handles still retain bytes after unlink. Restore every
                // original if an error occurs halfway through removal, without overwriting a race.
                if (isDirectory && !Directory.Exists(original)) Directory.CreateDirectory(original);
                foreach (var file in captured.Files)
                {
                    string staged = Path.Combine(staging, Path.GetFileName(file.Path));
                    if (Path.Exists(file.Path))
                    {
                        if (HasCapturedBytes(file.Path, file.Hash)) continue;
                        // Another writer may reclaim the original name after our unlink.
                        // Keep its new bytes and persist our last old copy before closing it.
                        if (!HasCapturedBytes(staged, file.Hash))
                        {
                            string recoveryFile = Path.Combine(staging, "recovered-" + Guid.NewGuid().ToString("N") + Path.GetExtension(file.Path));
                            file.Stream.Position = 0;
                            using var recovered = new FileStream(recoveryFile, FileMode.CreateNew, FileAccess.Write, FileShare.None);
                            file.Stream.CopyTo(recovered); recovered.Flush(true);
                        }
                        occupiedOriginal = true;
                        continue;
                    }
                    if (File.Exists(staged)) File.Move(staged, file.Path);
                    else
                    {
                        file.Stream.Position = 0;
                        using var restored = new FileStream(file.Path, FileMode.CreateNew, FileAccess.Write, FileShare.None);
                        file.Stream.CopyTo(restored); restored.Flush(true);
                    }
                    File.SetAttributes(file.Path, file.Attributes);
                }
            }
            catch (Exception recovery) when (recovery is IOException or UnauthorizedAccessException)
            {
                throw new IOException("删除未能完成，恢复也遇到问题。请保留原位置及恢复目录：" + staging + "。原因：" + recovery.Message, error);
            }
            if (occupiedOriginal)
                throw new IOException("删除未能完成，原位置已有新的文件，本次没有覆盖它。原来的文件已保留在恢复目录：" + staging, error);
            throw new IOException("未能删除歌曲，原项目文件已恢复。请关闭占用文件的程序后重试。", error);
        }
    }

    private static bool HasCapturedBytes(string path, byte[] hash)
    {
        try
        {
            if (!File.Exists(path) || IsLink(path)) return false;
            using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
            return SHA256.HashData(stream).AsSpan().SequenceEqual(hash);
        }
        catch (IOException) { return false; }
        catch (UnauthorizedAccessException) { return false; }
    }

    private bool IsKnownProjectPath(string path)
    {
        string? parent = Path.GetDirectoryName(path);
        if (parent is null || !SamePath(parent, DefaultLocation) || !Path.Exists(path) || !Directory.Exists(DefaultLocation) || IsLink(DefaultLocation) || IsLink(path)) return false;
        if (File.Exists(path)) return string.Equals(Path.GetExtension(path), ".rootsound", StringComparison.OrdinalIgnoreCase)
            && new FileInfo(path).Length is > 0 and <= AtomicTextStore.MaximumBytes;
        foreach (string name in new[] { "project.json", "materials.json" })
        {
            string file = Path.Combine(path, name);
            if (!File.Exists(file) || IsLink(file)) return false;
        }
        var material = new FileInfo(Path.Combine(path, "materials.json"));
        return material.Length > 0 && material.Length <= AtomicTextStore.MaximumBytes;
    }

    private static bool IsLink(string path) => (File.GetAttributes(path) & FileAttributes.ReparsePoint) != 0;

    private static string ReadLegacyLibrary(string path)
    {
        using var stream = new FileStream(Path.Combine(path, "materials.json"), FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        if (stream.Length > AtomicTextStore.MaximumBytes) throw new InvalidDataException("旧版项目资料超过当前 128 MiB 上限。");
        byte[] bytes = new byte[checked((int)stream.Length)]; stream.ReadExactly(bytes);
        int offset = bytes.AsSpan().StartsWith(new byte[] { 0xef, 0xbb, 0xbf }) ? 3 : 0;
        try { return ValidateLibrary(Utf8.GetString(bytes, offset, bytes.Length - offset)); }
        catch (DecoderFallbackException error) { throw new InvalidDataException("旧版项目资料不是有效的 UTF-8 文本。", error); }
    }

    private void WriteStoredLibrary(string library, string? name = null, bool verifyTimbres = false)
    {
        if (fileEnvelope is null) { activeStore!.Write(library); MirrorTimbres(library, verifyTimbres); return; }
        var envelope = (JsonObject)fileEnvelope.DeepClone();
        envelope["libraryText"] = library;
        if (name is not null) envelope["name"] = name;
        string text = envelope.ToJsonString();
        ValidateEncodingAndSize(text);
        activeStore!.Write(text);
        fileEnvelope = envelope; MirrorTimbres(library, verifyTimbres);
    }

    private ProjectDirectoryInfo ActivateFile(string path)
    {
        if (IsLink(path)) throw new IOException("请选择实际的歌曲项目文件，不能使用链接文件。");
        if (current is not null && SamePath(current.Path, path))
        {
            (ProjectDirectoryInfo Project, JsonObject Envelope, string Library)? parsed = null;
            activeStore!.ReadValidated(text => parsed = ParseEnvelope(path, text ?? throw new IOException("歌曲文件已被移走。")));
            var result = parsed!.Value;
            timbreSongDraftId = null; current = result.Project; fileEnvelope = result.Envelope; currentSnapshot = committedSnapshot = savedSnapshot = result.Library; loadingCompleted = false;
            scope = Guid.NewGuid().ToString("N");
            MirrorTimbres(currentSnapshot!, verifyPhysicalFiles: true);
            return current;
        }
        AtomicTextStore? candidate = null;
        try
        {
            candidate = AtomicTextStore.ForProjectFile(path);
            var parsed = ParseEnvelope(path, candidate.Read() ?? throw new IOException("歌曲文件已被移走。"));
            var previous = activeStore;
            activeStore = candidate; candidate = null;
            timbreSongDraftId = null; current = parsed.Project; fileEnvelope = parsed.Envelope;
            currentSnapshot = committedSnapshot = savedSnapshot = parsed.Library; loadingCompleted = false;
            observedManifestHash = null; memory = null; scope = Guid.NewGuid().ToString("N");
            previous?.Dispose();
            MirrorTimbres(currentSnapshot!, verifyPhysicalFiles: true);
            return current;
        }
        finally { candidate?.Dispose(); }
    }

    private static (ProjectDirectoryInfo Project, JsonObject Envelope, string Library) ReadEnvelope(string path)
    {
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        if (stream.Length > AtomicTextStore.MaximumBytes) throw new InvalidDataException("歌曲文件超过当前 128 MiB 上限。");
        byte[] bytes = new byte[checked((int)stream.Length)]; stream.ReadExactly(bytes);
        int offset = bytes.AsSpan().StartsWith(new byte[] { 0xef, 0xbb, 0xbf }) ? 3 : 0;
        try { return ParseEnvelope(path, Utf8.GetString(bytes, offset, bytes.Length - offset)); }
        catch (DecoderFallbackException error) { throw new InvalidDataException("歌曲文件不是有效的 UTF-8 文本。", error); }
    }

    private static (ProjectDirectoryInfo Project, JsonObject Envelope, string Library) ParseEnvelope(string path, string text)
    {
        try
        {
            ValidateEncodingAndSize(text);
            var root = JsonNode.Parse(text, documentOptions: new JsonDocumentOptions { MaxDepth = 256 }) as JsonObject;
            if (root is null || root["format"]?.GetValueKind() != JsonValueKind.String || root["format"]!.GetValue<string>() != "RootSoundWorkspace"
                || root["version"]?.GetValueKind() != JsonValueKind.Number || !root["version"]!.AsValue().TryGetValue<int>(out int version) || version != 2
                || root["id"]?.GetValueKind() != JsonValueKind.String || !Guid.TryParse(root["id"]!.GetValue<string>(), out _)
                || root["name"]?.GetValueKind() != JsonValueKind.String || string.IsNullOrWhiteSpace(root["name"]!.GetValue<string>())
                || root["createdAtUtc"]?.GetValueKind() != JsonValueKind.String
                || !DateTimeOffset.TryParse(root["createdAtUtc"]!.GetValue<string>(), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var timestamp) || timestamp.Offset != TimeSpan.Zero
                || root["libraryText"]?.GetValueKind() != JsonValueKind.String)
                throw new InvalidDataException("所选文件不是受支持的 RootSound 歌曲项目。");
            string library = ValidateLibrary(root["libraryText"]!.GetValue<string>());
            return (new ProjectDirectoryInfo(root["id"]!.GetValue<string>(), root["name"]!.GetValue<string>(), Path.GetFullPath(path)), root, library);
        }
        catch (JsonException error) { throw new InvalidDataException("歌曲项目文件不是完整的 JSON 文本。", error); }
        catch (ArgumentException error) { throw new InvalidDataException("歌曲项目文件包含重复字段或无效的数据结构。", error); }
    }

    private ProjectDirectoryInfo Activate(string path)
    {
        byte[] manifest = ReadManifestBytes(path);
        ProjectDirectoryInfo project = ParseManifest(path, manifest);
        AtomicTextStore? candidate = null;
        try
        {
            // Check missing data before AtomicTextStore can create a new lock file.
            if (!File.Exists(Path.Combine(path, "materials.json"))) throw new InvalidDataException("这个项目缺少 materials.json，请选择完整的歌曲项目文件夹。");
            candidate = new AtomicTextStore(path);
            string text = ValidateLibrary(candidate.Read() ?? throw new InvalidDataException("这个项目缺少 materials.json。"));
            if (!ReadManifestBytes(path).AsSpan().SequenceEqual(manifest)) throw new IOException("读取期间项目说明发生变化，请重试。");
            var previous = activeStore;
            activeStore = candidate;
            candidate = null;
            current = project; timbreSongDraftId = null;
            observedManifestHash = SHA256.HashData(manifest);
            fileEnvelope = null;
            currentSnapshot = committedSnapshot = text;
            savedSnapshot = text;
            loadingCompleted = false;
            memory = null;
            scope = Guid.NewGuid().ToString("N");
            previous?.Dispose();
            MirrorTimbres(currentSnapshot!, verifyPhysicalFiles: true);
            return project;
        }
        finally { candidate?.Dispose(); }
    }

    internal static string ValidateLibrary(string text)
    {
        ValidateEncodingAndSize(text);
        string normalized = text.StartsWith('\uFEFF') ? text[1..] : text;
        try
        {
            using var document = JsonDocument.Parse(normalized, new JsonDocumentOptions { MaxDepth = 256 });
            var root = document.RootElement;
            if (root.ValueKind != JsonValueKind.Object
                || !root.TryGetProperty("format", out var format) || format.ValueKind != JsonValueKind.String || format.GetString() != "RootSoundMaterialLibrary"
                || !root.TryGetProperty("version", out var version) || version.ValueKind != JsonValueKind.Number || !version.TryGetInt32(out int number) || number != 1
                || !root.TryGetProperty("contents", out var contents) || contents.ValueKind != JsonValueKind.Array
                || !root.TryGetProperty("drafts", out var drafts) || drafts.ValueKind != JsonValueKind.Array)
                throw new InvalidDataException("歌曲资料库的格式或版本无效，现有资料没有被覆盖。");
        }
        catch (JsonException error) { throw new InvalidDataException("歌曲资料库不是完整的 JSON 文本，现有资料没有被覆盖。", error); }
        return normalized;
    }

    internal static void ValidateEncodingAndSize(string text)
    {
        ArgumentNullException.ThrowIfNull(text);
        try
        {
            if (text.Length > AtomicTextStore.MaximumBytes || Utf8.GetByteCount(text) > AtomicTextStore.MaximumBytes)
                throw new InvalidDataException("歌曲资料库超过当前 128 MiB 的文件大小上限，现有资料没有被覆盖。");
        }
        catch (EncoderFallbackException error) { throw new InvalidDataException("歌曲资料库含有无效的 Unicode 文本，现有资料没有被覆盖。", error); }
    }

    private static ProjectDirectoryInfo ReadManifest(string path)
    {
        return ParseManifest(path, ReadManifestBytes(path));
    }

    private static ProjectDirectoryInfo ParseManifest(string path, byte[] bytes)
    {
        try
        {
            int offset = bytes.AsSpan().StartsWith(new byte[] { 0xef, 0xbb, 0xbf }) ? 3 : 0;
            using var document = JsonDocument.Parse(Utf8.GetString(bytes, offset, bytes.Length - offset));
            var root = document.RootElement;
            if (root.ValueKind != JsonValueKind.Object
                || !root.TryGetProperty("format", out var format) || format.ValueKind != JsonValueKind.String || format.GetString() != "RootSoundWorkspace"
                || !root.TryGetProperty("version", out var version) || version.ValueKind != JsonValueKind.Number || !version.TryGetInt32(out int number) || number != 1
                || !root.TryGetProperty("id", out var id) || id.ValueKind != JsonValueKind.String || !Guid.TryParse(id.GetString(), out _)
                || !root.TryGetProperty("name", out var name) || name.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(name.GetString())
                || !root.TryGetProperty("createdAtUtc", out var created) || created.ValueKind != JsonValueKind.String
                || !DateTimeOffset.TryParse(created.GetString(), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var timestamp) || timestamp.Offset != TimeSpan.Zero)
                throw new InvalidDataException("所选文件夹不是受支持的 RootSound 歌曲项目。");
            return new ProjectDirectoryInfo(id.GetString()!, name.GetString()!, Path.GetFullPath(path));
        }
        catch (DecoderFallbackException error) { throw new InvalidDataException("项目说明文件不是有效的 UTF-8 文本。", error); }
        catch (JsonException error) { throw new InvalidDataException("项目说明文件不是完整的 JSON 文本。", error); }
    }

    private static byte[] ReadManifestBytes(string path)
    {
        using var stream = new FileStream(Path.Combine(path, "project.json"), FileMode.Open, FileAccess.Read, FileShare.Read);
        if (stream.Length > 64 * 1024) throw new InvalidDataException("项目说明文件过大，请选择 RootSound 歌曲项目文件夹。");
        byte[] bytes = new byte[checked((int)stream.Length)]; stream.ReadExactly(bytes); return bytes;
    }

    private byte[] RequireManifestUnchanged()
    {
        if (current is null || observedManifestHash is null) throw new IOException("当前没有打开的歌曲项目。");
        byte[] bytes = ReadManifestBytes(current.Path);
        if (!SHA256.HashData(bytes).AsSpan().SequenceEqual(observedManifestHash)) throw new IOException("项目说明文件已被外部修改，本次没有覆盖它。请重新打开项目后再保存。");
        return bytes;
    }

    private static string ValidateName(string name)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        name = name.Trim();
        string stem = name.Split('.')[0].TrimEnd();
        bool reserved = new[] { "CON", "PRN", "AUX", "NUL", "CONIN$", "CONOUT$" }.Contains(stem, StringComparer.OrdinalIgnoreCase)
            || (stem.Length == 4 && (stem.StartsWith("COM", StringComparison.OrdinalIgnoreCase) || stem.StartsWith("LPT", StringComparison.OrdinalIgnoreCase)) && "123456789¹²³".Contains(stem[3]));
        if (name.Length > 245 || name is "." or ".." || name.EndsWith('.') || name.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0 || reserved)
            throw new IOException("歌曲名称不能用作 Windows 文件名，请去掉斜线、特殊符号或结尾的点，并换开系统保留名称。");
        try { _ = Utf8.GetByteCount(name); }
        catch (EncoderFallbackException error) { throw new InvalidDataException("歌曲名称含有无效的 Unicode 文本。", error); }
        return name;
    }

    private static string FullDirectory(string path)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(path);
        if (!Path.IsPathFullyQualified(path)) throw new IOException("请选择完整的保存位置。");
        return Path.TrimEndingDirectorySeparator(Path.GetFullPath(path));
    }

    private static bool SamePath(string left, string right) => string.Equals(
        Path.TrimEndingDirectorySeparator(Path.GetFullPath(left)), Path.TrimEndingDirectorySeparator(Path.GetFullPath(right)), StringComparison.OrdinalIgnoreCase);

    public void Dispose()
    {
        lock (gate)
        {
            if (disposed) return;
            disposed = true;
            activeStore?.Dispose();
            activeStore = null;
        }
    }

    private void ThrowIfDisposed() => ObjectDisposedException.ThrowIf(disposed, this);
    private void RequireCleanForSwitch()
    {
        if (current is not null && !string.Equals(currentSnapshot, savedSnapshot, StringComparison.Ordinal))
            throw new IOException("当前歌曲还有未保存的草稿，请先保存或放弃，再切换项目。");
    }
}
