using System.Text;
using System.Text.Json;
using RootSound.Desktop;

// Stdio is private to the Electron parent. No listening socket or arbitrary
// filesystem RPC is exposed to the renderer or to other applications.
Console.InputEncoding = new UTF8Encoding(false);
Console.OutputEncoding = new UTF8Encoding(false);
if (args.Length != 1) return 2;
Directory.CreateDirectory(args[0]);
using var manager = new ProjectDirectoryManager(Path.GetFullPath(args[0]));
for (string? line; (line = Console.ReadLine()) is not null;)
{
    long id = 0;
    string result;
    try
    {
        using var input = JsonDocument.Parse(line, new JsonDocumentOptions { MaxDepth = 256 });
        var request = input.RootElement; id = request.GetProperty("id").GetInt64();
        var values = request.GetProperty("args");
        string A(int index) => values.GetArrayLength() > index ? values[index].GetString() ?? "" : "";
        string Pack(object value) => JsonSerializer.Serialize(value);
        result = request.GetProperty("method").GetString() switch
        {
            "storage.Read" => ReadStorage(),
            "storage.WriteScoped" => WriteStorage(A(0), A(1), false),
            "storage.WriteScopedCheckpoint" => WriteStorage(A(0), A(1), true),
            "project.Read" => Pack(new { status = "ready", defaultLocation = manager.DefaultLocation, current = manager.Current,
                hasUnsavedChanges = manager.HasUnsavedChanges, doubleClickIntervalMs = 500 }),
            "project.Create" => Pack(new { status = "created", project = manager.Create(A(0), A(1), A(2)) }),
            "project.CreateCopy" => Pack(new { status = "created", project = manager.CreateCopy(A(0), A(1), A(2)) }),
            "project.CreateDetached" => Pack(new { status = "created", project = manager.CreateDetached(A(0), A(1), A(2)) }),
            "project.List" => Pack(new { status = "listed", projects = manager.List() }),
            "project.Browse" => Pack(new { status = "browsed", page = manager.Browse(A(0)) }),
            "project.CreateLibraryFolder" => ChangeLibrary(() => manager.CreateLibraryFolder(A(0), A(1))),
            "project.RenameLibraryEntry" => ChangeLibrary(() => manager.RenameLibraryEntry(A(0), A(1))),
            "project.DeleteLibraryEntry" => ChangeLibrary(() => manager.DeleteLibraryEntry(A(0))),
            "project.OpenPath" => NativeDocumentFiles.Format(A(0)) is not null ? Source(manager.ReadDocumentFile(A(0))) : Pack(new { status = "opened", project = manager.Open(A(0)) }),
            "project.OpenKnown" => NativeDocumentFiles.Format(A(0)) is not null
                ? Source(manager.ReadDocumentFile(A(0), known: true))
                : Pack(new { status = "opened", project = manager.OpenKnown(A(0)) }),
            "project.OpenDocument" => Pack(new { status = "opened", project = manager.OpenDocument(A(0), A(1), A(2)) }),
            "project.ReadDocument" => manager.ReadDocument() is { } source ? Source(source) : "{\"status\":\"none\"}",
            "project.Save" => Pack(new { status = "saved", project = manager.Save(A(0), renameFile: false) }),
            "project.FinishLoading" => FinishLoading(),
            "project.Exit" => ExitProject(A(0), A(1)),
            "project.Inspect" => Inspect(A(0), A(1)),
            "project.Rename" => Pack(new { status = "renamed", project = manager.Rename(A(0), A(1), A(2), A(3), A(4)) }),
            "project.Delete" => Delete(A(0), A(1)),
            "timbres.Sync" => Pack(manager.SyncTimbres(A(0))),
            "timbres.State" => Pack(manager.TimbreFilesState),
            "timbres.OpenPath" => OpenTone(A(0)),
            "payload.Open" => Payload(A(0)),
            _ => throw new IOException("当前版本没有这个功能。"),
        };
    }
    catch (Exception error) { result = JsonSerializer.Serialize(new { ok = false, error = error.Message, status = "error", message = error.Message }); }
    Console.WriteLine(JsonSerializer.Serialize(new { id, result }));
    Console.Out.Flush();
}
return 0;

string Source(EditableSourceData source) => JsonSerializer.Serialize(new { status = "document", source.Name, source.Path, source.Format,
    source.Base64, source.Token, source.LibraryText }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
string ChangeLibrary(Action action) { action(); return "{\"status\":\"ready\"}"; }

string ReadStorage()
{
    var state = manager.ReadLibrary();
    return LargeJsonText.Serialize(new { ok = true, scope = state.Scope }, "value", state.Value);
}
string WriteStorage(string value, string scope, bool checkpoint)
{
    if (string.IsNullOrWhiteSpace(scope)) throw new IOException("缺少当前工程标识，请重新打开工程。");
    manager.WriteLibrary(value, scope, checkpoint); return "{\"ok\":true}";
}
string FinishLoading() { manager.FinishLoading(); return "{\"status\":\"ready\"}"; }
string ExitProject(string mode, string name) { manager.Exit(mode, name, renameFile: false); return "{\"status\":\"exited\"}"; }
string Delete(string path, string id)
{
    manager.Delete(path, id); return JsonSerializer.Serialize(new { status = "deleted", warning = manager.LastTimbreCleanupWarning });
}
string Inspect(string path, string id)
{
    var state = manager.Inspect(path, id);
    return LargeJsonText.Serialize(new { status = "snapshot", project = state.Project, token = state.Token }, "libraryText", state.LibraryText);
}
string Payload(string token)
{
    using var input = manager.OpenPayloadStream(token);
    if (input is not FileStream file) throw new IOException("采样缓存不可用。");
    return JsonSerializer.Serialize(new { status = "payload", path = file.Name, bytes = file.Length });
}
string OpenTone(string path)
{
    var extension = Path.GetExtension(path).ToLowerInvariant();
    if (extension is not ".rssynth" and not ".rssound") throw new IOException("请选择 .rssynth 或 .rssound 音色文件。");
    using var stream = File.OpenRead(path);
    if (stream.Length <= 0 || stream.Length > (extension == ".rssynth" ? 4 : 32) * 1024 * 1024) throw new IOException("音色文件为空或过大。");
    using var reader = new StreamReader(stream, new UTF8Encoding(false, true), true);
    string text = reader.ReadToEnd(); using var document = JsonDocument.Parse(text, new JsonDocumentOptions { MaxDepth = 256 });
    if (document.RootElement.ValueKind != JsonValueKind.Object) throw new IOException("音色文件格式无效。");
    return JsonSerializer.Serialize(new { status = "opened", name = Path.GetFileName(path), text });
}

namespace RootSound.Desktop
{
    // Same portable-file limit as the existing desktop importer. No Windows
    // picker or inactive sound-editor implementation is linked into this host.
    internal static class NativeTimbreFiles { internal const int MaximumSoundBytes = 32 * 1024 * 1024; }
}
