using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace RootSound.Desktop;

public sealed record TimbreFilesState(string status, string? directory, string? message = null);

/// <summary>Recoverable directory copies. The self-contained song remains authoritative.</summary>
internal sealed class ProjectTimbreMirror
{
    private static readonly UTF8Encoding Utf8 = new(false, true);
    private readonly string root;
    private readonly Dictionary<string, Dictionary<string, string>> observed = new(StringComparer.Ordinal);
    private readonly Dictionary<string, string> observedIndexes = new(StringComparer.Ordinal);
    internal long PayloadBytesRead { get; private set; }
    internal long PayloadFilesWritten { get; private set; }
    internal ProjectTimbreMirror(string installationRoot) => root = Path.Combine(Path.GetFullPath(installationRoot), "timbres");
    internal string DirectoryFor(string projectId) => Path.Combine(root, Guid.Parse(projectId).ToString("N"));

    internal string? RemoveProject(string projectId)
    {
        string directory = DirectoryFor(projectId);
        if (!Directory.Exists(directory)) return null;
        if ((File.GetAttributes(root) & FileAttributes.ReparsePoint) != 0 || (File.GetAttributes(directory) & FileAttributes.ReparsePoint) != 0)
            throw new IOException("音色目录已变为链接，保留其中内容。");
        var entries = ReadIndex(directory, projectId, reload: true);
        var preserved = new List<string>();
        foreach (var item in entries)
        {
            try
            {
                string path = SafeFile(directory, item.Key); if (!File.Exists(path)) continue;
                RequireHash(path, item.Value); File.Delete(path);
            }
            catch (Exception error) when (error is IOException or UnauthorizedAccessException) { preserved.Add(item.Key); }
        }
        var remaining = Directory.EnumerateFileSystemEntries(directory).Where(path => Path.GetFileName(path) != "index.json").ToArray();
        if (remaining.Length > 0 || preserved.Count > 0) return "歌曲已删除；音色目录中有用户添加或修改的文件，已保留：" + directory;
        string index = SafeFile(directory, "index.json"); if (File.Exists(index)) File.Delete(index);
        Directory.Delete(directory); observed.Remove(projectId); observedIndexes.Remove(projectId); return null;
    }

    internal void Sync(string projectId, string libraryText, string? songDraftId = null, bool verifyPhysicalFiles = false)
    {
        string directory = DirectoryFor(projectId);
        RequireDirectory(root); RequireDirectory(directory);
        using var library = JsonDocument.Parse(libraryText, new JsonDocumentOptions { MaxDepth = 256 });
        JsonElement state = library.RootElement;
        var contents = new Dictionary<string, JsonElement>(StringComparer.Ordinal);
        if (state.TryGetProperty("contents", out var source)) foreach (var item in source.EnumerateArray()) contents.Add(item.GetProperty("id").GetString()!, item);
        var projection = CurrentProject(state, contents, songDraftId);
        contents = projection.Records;
        var parts = contents.Values.Where(item => item.GetProperty("kind").GetString() == "rootsound.phrase")
            .SelectMany(item => item.GetProperty("body").GetProperty("parts").EnumerateArray()).ToArray();
        var tones = contents.Where(item => IsTone(item.Value) && (!projection.Scoped || projection.Owned.Contains(item.Key)))
            .Where(item => projection.Members.Contains(item.Key) || !parts.Any(part => part.GetProperty("timbreId").GetString() == item.Key)
                || !parts.Where(part => part.GetProperty("timbreId").GetString() == item.Key).All(part => EmptyPlaceholder(part, item.Value)))
            .ToDictionary(item => item.Key, item => item.Value, StringComparer.Ordinal);
        var previous = ReadIndex(directory, projectId);
        var next = new Dictionary<string, string>(StringComparer.Ordinal);
        var entries = new List<object>();
        foreach (var item in tones.OrderBy(item => item.Key, StringComparer.Ordinal))
        {
            string id = item.Key; JsonElement tone = item.Value; JsonElement body = tone.GetProperty("body");
            string model = body.GetProperty("model").GetString()!; string name = tone.GetProperty("name").GetString()!;
            bool spectralFile = model == "spectral-synth" && name.Length <= 120 && !name.Any(char.IsControl);
            string extension = spectralFile ? ".rssynth" : ".rssound";
            string file = Convert.ToHexString(SHA256.HashData(Utf8.GetBytes(id))).ToLowerInvariant() + extension;
            string text;
            if (spectralFile) { var patch = JsonNode.Parse(body.GetProperty("patch").GetRawText())!.AsObject(); patch["name"] = name; text = patch.ToJsonString(); }
            else if (model is "basic-synth" or "synthesizer") text = JsonSerializer.Serialize(new { format = "RootSoundSound", version = model == "basic-synth" ? 1 : 2, name, timbre = body });
            else text = JsonSerializer.Serialize(new { format = "RootSoundTimbre", version = 1, timbre = tone, contents = Closure(tone, contents) });
            byte[] bytes = Utf8.GetBytes(text); string hash = Convert.ToHexString(SHA256.HashData(bytes));
            if (verifyPhysicalFiles || previous.GetValueOrDefault(file) != hash) WriteManaged(directory, file, bytes, hash, previous.GetValueOrDefault(file));
            next.Add(file, hash); entries.Add(new { id, name, file, sha256 = hash });
        }
        // Never remove unlisted user files or an externally modified managed copy.
        foreach (var stale in previous.Where(item => !next.ContainsKey(item.Key)))
        {
            string path = SafeFile(directory, stale.Key);
            if (!File.Exists(path)) continue;
            RequireHash(path, stale.Value); File.Delete(path);
        }
        byte[] index = JsonSerializer.SerializeToUtf8Bytes(new { format = "RootSoundTimbreDirectory", version = 1, projectId, entries });
        string indexHash = Convert.ToHexString(SHA256.HashData(index));
        if (verifyPhysicalFiles || observedIndexes.GetValueOrDefault(projectId) != indexHash) WriteManaged(directory, "index.json", index, indexHash, null, indexFile: true);
        observed[projectId] = next;
        observedIndexes[projectId] = indexHash;
    }

    private sealed record Projection(Dictionary<string, JsonElement> Records, HashSet<string> Members, HashSet<string> Owned, bool Scoped);
    private static Projection CurrentProject(JsonElement state, Dictionary<string, JsonElement> records, string? songDraftId)
    {
        JsonElement[] drafts = state.TryGetProperty("drafts", out var rawDrafts) ? rawDrafts.EnumerateArray().ToArray() : [];
        var roots = drafts.Where(item => item.GetProperty("kind").GetString() == "rootsound.song").ToArray();
        JsonElement? project = roots.FirstOrDefault(item => item.GetProperty("id").GetString() == songDraftId);
        if (project.Value.ValueKind == JsonValueKind.Undefined) project = roots.Length > 0 ? roots[^1] : null;
        project ??= records.Values.LastOrDefault(item => item.GetProperty("kind").GetString() == "rootsound.song");
        bool scoped = state.TryGetProperty("projectScopes", out var scopes);
        string? scope = null;
        if (project is { ValueKind: JsonValueKind.Object } root && scoped)
        {
            string id = root.GetProperty("id").GetString()!;
            foreach (var item in scopes.GetProperty("roots").EnumerateArray()) if (item.GetProperty("id").GetString() == id) scope = item.GetProperty("scopeId").GetString();
            if (scope is null && root.TryGetProperty("sourceId", out var source)) foreach (var item in scopes.GetProperty("contents").EnumerateArray())
                if (item.GetProperty("id").GetString() == source.GetString()) scope = item.GetProperty("scopeId").GetString();
        }
        var members = new HashSet<string>(StringComparer.Ordinal); var owned = new HashSet<string>(StringComparer.Ordinal);
        if (scope is not null)
        {
            foreach (var item in scopes.GetProperty("contents").EnumerateArray()) if (item.GetProperty("scopeId").GetString() == scope) owned.Add(item.GetProperty("id").GetString()!);
            if (scopes.TryGetProperty("members", out var declared)) foreach (var item in declared.EnumerateArray())
                if (item.GetProperty("scopeId").GetString() == scope && records.ContainsKey(item.GetProperty("id").GetString()!)) members.Add(item.GetProperty("id").GetString()!);
        }
        var result = new Dictionary<string, JsonElement>(StringComparer.Ordinal);
        var pending = new Stack<string>();
        if (project is { ValueKind: JsonValueKind.Object } selected)
        {
            foreach (var id in selected.GetProperty("dependencies").EnumerateArray()) pending.Push(id.GetString()!);
            foreach (string id in members) pending.Push(id);
        }
        // Compatibility for standalone pre-project libraries without ownership metadata.
        else if (!scoped) foreach (string id in records.Keys) pending.Push(id);
        while (pending.TryPop(out string? id))
        {
            if (result.ContainsKey(id) || !records.TryGetValue(id, out var saved)) continue;
            JsonElement effective = saved;
            foreach (var draft in drafts.Reverse())
            {
                if (!draft.TryGetProperty("sourceId", out var source) || source.GetString() != id || !draft.TryGetProperty("baseRevision", out var revision)
                    || revision.GetInt32() != saved.GetProperty("revision").GetInt32()) continue;
                bool dirty = draft.GetProperty("name").GetString() != saved.GetProperty("name").GetString()
                    || !JsonNode.DeepEquals(JsonNode.Parse(draft.GetProperty("body").GetRawText()), JsonNode.Parse(saved.GetProperty("body").GetRawText()))
                    || !JsonNode.DeepEquals(JsonNode.Parse(draft.GetProperty("dependencies").GetRawText()), JsonNode.Parse(saved.GetProperty("dependencies").GetRawText()));
                if (!dirty) continue;
                var normalized = JsonNode.Parse(draft.GetRawText())!.AsObject(); normalized["id"] = id; normalized["revision"] = saved.GetProperty("revision").GetInt32();
                normalized.Remove("sourceId"); normalized.Remove("baseRevision"); normalized.Remove("editingContext");
                using var document = JsonDocument.Parse(normalized.ToJsonString()); effective = document.RootElement.Clone(); break;
            }
            result.Add(id, effective);
            foreach (var child in effective.GetProperty("dependencies").EnumerateArray()) pending.Push(child.GetString()!);
        }
        return new(result, members, owned, scoped);
    }

    private static bool EmptyPlaceholder(JsonElement part, JsonElement tone)
    {
        string name = part.GetProperty("name").GetString()!;
        if (part.GetProperty("notes").GetArrayLength() != 0 || !Regex.IsMatch(name, "^乐句 [1-9]\\d* 音色$") || tone.GetProperty("name").GetString() != name || tone.GetProperty("dependencies").GetArrayLength() != 0) return false;
        var body = tone.GetProperty("body");
        return body.GetProperty("model").GetString() == "basic-synth" && body.GetProperty("character").GetString() == "warm"
            && body.GetProperty("attackSeconds").GetDouble() == .025 && body.GetProperty("releaseSeconds").GetDouble() == .55 && body.GetProperty("level").GetDouble() == .65;
    }

    private Dictionary<string, string> ReadIndex(string directory, string projectId, bool reload = false)
    {
        if (!reload && observed.TryGetValue(projectId, out var cached)) return cached;
        string file = SafeFile(directory, "index.json");
        if (!File.Exists(file)) return new(StringComparer.Ordinal);
        if (new FileInfo(file).Length > 4 * 1024 * 1024) throw new IOException("音色目录索引过大，未覆盖目录文件。");
        using var document = JsonDocument.Parse(File.ReadAllText(file, Utf8)); var value = document.RootElement;
        if (value.GetProperty("format").GetString() != "RootSoundTimbreDirectory" || value.GetProperty("version").GetInt32() != 1 || value.GetProperty("projectId").GetString() != projectId)
            throw new IOException("音色目录归属不匹配，未覆盖目录文件。");
        var result = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var item in value.GetProperty("entries").EnumerateArray())
        {
            string name = item.GetProperty("file").GetString()!, hash = item.GetProperty("sha256").GetString()!;
            if (name.Length != 72 || !name.Take(64).All(Uri.IsHexDigit) || !name.EndsWith(".rssound", StringComparison.Ordinal) && !name.EndsWith(".rssynth", StringComparison.Ordinal) || hash.Length != 64 || !hash.All(Uri.IsHexDigit))
                throw new IOException("音色目录索引包含无效路径，未改动目录。");
            SafeFile(directory, name); result.Add(name, hash);
        }
        return result;
    }

    private static JsonElement[] Closure(JsonElement tone, Dictionary<string, JsonElement> contents)
    {
        var visited = new HashSet<string>(StringComparer.Ordinal); var result = new List<JsonElement>();
        void Visit(JsonElement record)
        {
            foreach (var dependency in record.GetProperty("dependencies").EnumerateArray())
            {
                string id = dependency.GetString()!; if (!visited.Add(id)) continue;
                if (!contents.TryGetValue(id, out var child)) throw new IOException("音色的工程依赖不完整，目录副本尚未生成。");
                Visit(child); result.Add(child);
            }
        }
        Visit(tone); return [.. result];
    }

    private static bool IsTone(JsonElement item) => item.ValueKind == JsonValueKind.Object && item.TryGetProperty("kind", out var kind) && kind.GetString() == "rootsound.timbre";
    private static string SafeFile(string directory, string name)
    {
        if (Path.GetFileName(name) != name || name is "." or "..") throw new IOException("音色目录包含无效文件名。");
        string file = Path.GetFullPath(Path.Combine(directory, name));
        if (!string.Equals(Path.GetDirectoryName(file), directory, StringComparison.OrdinalIgnoreCase) || Path.Exists(file) && (File.GetAttributes(file) & FileAttributes.ReparsePoint) != 0)
            throw new IOException("音色目录副本不能使用链接或外部路径。");
        return file;
    }
    private static void RequireDirectory(string directory)
    {
        if (Path.Exists(directory) && (File.GetAttributes(directory) & FileAttributes.ReparsePoint) != 0) throw new IOException("音色保存目录不能使用链接。");
        Directory.CreateDirectory(directory);
    }
    private byte[] ReadManagedBytes(string file)
    {
        byte[] bytes = File.ReadAllBytes(file); if (Path.GetFileName(file) != "index.json") PayloadBytesRead += bytes.LongLength; return bytes;
    }
    private void RequireHash(string file, string expected)
    {
        if (new FileInfo(file).Length > AtomicTextStore.MaximumBytes || !string.Equals(Convert.ToHexString(SHA256.HashData(ReadManagedBytes(file))), expected, StringComparison.OrdinalIgnoreCase))
            throw new IOException("音色目录副本被外部修改，已保留这些修改；工程中的音色仍完整可用。");
    }
    private void WriteManaged(string directory, string name, byte[] bytes, string hash, string? previous, bool indexFile = false)
    {
        string file = SafeFile(directory, name);
        string? observedHash = null;
        if (File.Exists(file))
        {
            if (new FileInfo(file).Length > AtomicTextStore.MaximumBytes) throw new IOException("音色目录副本超过大小范围，尚未覆盖它。");
            observedHash = Convert.ToHexString(SHA256.HashData(ReadManagedBytes(file)));
            if (observedHash == hash) return;
            if (!indexFile)
            {
                if (previous is null) throw new IOException("音色目录已有不同内容的同名文件，尚未覆盖它。");
                RequireHash(file, previous);
            }
        }
        string temporary = Path.Combine(directory, ".timbre-" + Guid.NewGuid().ToString("N") + ".tmp");
        try
        {
            using (var stream = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None)) { stream.Write(bytes); stream.Flush(true); }
            SafeFile(directory, name);
            if (observedHash is not null) { RequireHash(file, observedHash); File.Replace(temporary, file, null); }
            else File.Move(temporary, file);
            if (!indexFile) PayloadFilesWritten++;
        }
        finally { try { File.Delete(temporary); } catch (IOException) { } catch (UnauthorizedAccessException) { } }
    }
}
