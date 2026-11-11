using System.Runtime.InteropServices;
using System.Text.Json;

namespace RootSound.Desktop;

[ComVisible(true)]
[ClassInterface(ClassInterfaceType.AutoDual)]
public sealed class NativeProjectDirectories
{
    private readonly Form? owner;
    private readonly ProjectDirectoryManager manager;
    private readonly Func<string, string?> chooseLocation;
    private readonly Func<string?> chooseProject;
    private int operating;

    public NativeProjectDirectories(Form owner, ProjectDirectoryManager manager)
    {
        this.owner = owner;
        this.manager = manager;
        chooseLocation = path => PickFolder("选择本次歌曲项目的保存位置", path);
        chooseProject = PickProjectFile;
    }

    internal NativeProjectDirectories(ProjectDirectoryManager manager, Func<string, string?> chooseLocation, Func<string?> chooseProject)
    {
        this.manager = manager;
        this.chooseLocation = chooseLocation;
        this.chooseProject = chooseProject;
    }

    public string Read()
    {
        try { return JsonSerializer.Serialize(new { status = "ready", defaultLocation = manager.DefaultLocation, current = manager.Current, hasUnsavedChanges = manager.HasUnsavedChanges, doubleClickIntervalMs = SystemInformation.DoubleClickTime }); }
        catch (Exception error) { return Failure(error); }
    }

    public string ChooseLocation(string currentPath) => Run(() =>
    {
        string? path = chooseLocation(currentPath);
        return path is null ? Cancelled() : JsonSerializer.Serialize(new { status = "chosen", path = Path.GetFullPath(path) });
    });

    public string Create(string name, string parentPath, string libraryText) => Run(() =>
        JsonSerializer.Serialize(new { status = "created", project = manager.Create(name, parentPath, libraryText) }));

    public string CreateCopy(string name, string parentPath, string libraryText) => Run(() =>
        JsonSerializer.Serialize(new { status = "created", project = manager.CreateCopy(name, parentPath, libraryText) }));

    public string CreateDetached(string name, string parentPath, string libraryText) => Run(() =>
        JsonSerializer.Serialize(new { status = "created", project = manager.CreateDetached(name, parentPath, libraryText) }));

    public string Open() => Run(() =>
    {
        string? path = chooseProject();
        if (path is null) return Cancelled();
        if (NativeDocumentFiles.Format(path) is not null)
        {
            return SourceResult(manager.ReadDocumentFile(path));
        }
        return JsonSerializer.Serialize(new { status = "opened", project = manager.Open(path) });
    });

    public string List() => Run(() =>
        JsonSerializer.Serialize(new { status = "listed", projects = manager.List() }));

    public string Browse(string path = "") => Run(() =>
        JsonSerializer.Serialize(new { status = "browsed", page = manager.Browse(path) }));

    public string CreateLibraryFolder(string path, string name) => Run(() =>
    { manager.CreateLibraryFolder(path, name); return "{\"status\":\"ready\"}"; });

    public string RenameLibraryEntry(string path, string name) => Run(() =>
    { manager.RenameLibraryEntry(path, name); return "{\"status\":\"ready\"}"; });

    public string DeleteLibraryEntry(string path) => Run(() =>
    { manager.DeleteLibraryEntry(path); return "{\"status\":\"ready\"}"; });

    public string OpenKnown(string path) => Run(() => NativeDocumentFiles.Format(path) is not null
        ? SourceResult(manager.ReadDocumentFile(path, known: true))
        : JsonSerializer.Serialize(new { status = "opened", project = manager.OpenKnown(path) }));

    public string OpenDocument(string path, string token, string libraryText) => Run(() =>
        JsonSerializer.Serialize(new { status = "opened", project = manager.OpenDocument(path, token, libraryText) }));
    public string ReadDocument() => Run(() => manager.ReadDocument() is { } source ? SourceResult(source) : "{\"status\":\"none\"}");
    private static string SourceResult(EditableSourceData source) => JsonSerializer.Serialize(new { status = "document", source.Name, source.Path,
        source.Format, source.Base64, source.Token, source.LibraryText }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

    public string Delete(string path, string expectedId) => Run(() =>
    {
        manager.Delete(path, expectedId);
        return JsonSerializer.Serialize(new { status = "deleted", warning = manager.LastTimbreCleanupWarning });
    });

    public string Inspect(string path, string expectedId) => Run(() =>
    {
        var snapshot = manager.Inspect(path, expectedId);
        return LargeJsonText.Serialize(new { status = "snapshot", project = snapshot.Project, token = snapshot.Token }, "libraryText", snapshot.LibraryText);
    });

    public string Rename(string path, string expectedId, string name, string libraryText, string token) => Run(() =>
        JsonSerializer.Serialize(new { status = "renamed", project = manager.Rename(path, expectedId, name, libraryText, token) }));

    public string Save(string name = "") => Run(() =>
        JsonSerializer.Serialize(new { status = "saved", project = manager.Save(name, renameFile: false) }));

    public string FinishLoading() => Run(() =>
    {
        manager.FinishLoading();
        return "{\"status\":\"ready\"}";
    });

    public string Exit(string mode, string name = "") => Run(() =>
    {
        manager.Exit(mode, name, renameFile: false);
        return "{\"status\":\"exited\"}";
    });

    private string? PickFolder(string title, string path)
    {
        using var dialog = new FolderBrowserDialog
        {
            Description = title, UseDescriptionForTitle = true,
            InitialDirectory = Directory.Exists(path) ? path : Path.GetDirectoryName(manager.DefaultLocation) ?? manager.DefaultLocation,
            ShowNewFolderButton = true,
        };
        return dialog.ShowDialog(owner) == DialogResult.OK ? dialog.SelectedPath : null;
    }

    private string? PickProjectFile()
    {
        using var dialog = new OpenFileDialog
        {
            Title = "打开音乐文件",
            Filter = "可编辑音乐 (*.rootsound;*.mid;*.midi;*.smf;*.kar;*.rmi;*.musicxml;*.xml;*.mxl;*.rsproject)|*.rootsound;*.mid;*.midi;*.smf;*.kar;*.rmi;*.musicxml;*.xml;*.mxl;*.rsproject|简乐工程 (*.rootsound;*.rsproject)|*.rootsound;*.rsproject|MIDI (*.mid;*.midi;*.smf;*.kar;*.rmi)|*.mid;*.midi;*.smf;*.kar;*.rmi|MusicXML (*.musicxml;*.xml;*.mxl)|*.musicxml;*.xml;*.mxl|旧版项目说明 (project.json)|project.json",
            InitialDirectory = Directory.Exists(manager.DefaultLocation) ? manager.DefaultLocation : Path.GetDirectoryName(manager.DefaultLocation),
            CheckFileExists = true, Multiselect = false,
        };
        return dialog.ShowDialog(owner) == DialogResult.OK ? dialog.FileName : null;
    }

    private string Run(Func<string> action)
    {
        if (Interlocked.CompareExchange(ref operating, 1, 0) != 0)
            return JsonSerializer.Serialize(new { status = "error", message = "已有一个项目操作正在进行，请先完成或取消它。" });
        try { return owner?.InvokeRequired == true ? (string)owner.Invoke(action) : action(); }
        catch (Exception error) { return Failure(error); }
        finally { Volatile.Write(ref operating, 0); }
    }

    private static string Cancelled() => "{\"status\":\"cancelled\"}";
    private static string Failure(Exception error) => JsonSerializer.Serialize(new { status = "error", message = error.Message });
}
