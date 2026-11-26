using System.Runtime.InteropServices;
using System.Text.Json;

namespace RootSound.Desktop;

[ComVisible(true)]
[ClassInterface(ClassInterfaceType.AutoDual)]
public sealed class NativeStorage
{
    private readonly AtomicTextStore? store;
    private readonly ProjectDirectoryManager? manager;
    private readonly string scope = Guid.NewGuid().ToString("N");
    private Task<string>? pendingWrite;
    private System.Text.StringBuilder? writeBuffer;
    private string? bufferScope;
    private string? bufferRevision;
    public NativeStorage(AtomicTextStore store) => this.store = store;
    public NativeStorage(ProjectDirectoryManager manager) => this.manager = manager;

    public string Read()
    {
        try
        {
            if (manager is null) return LargeJsonText.Serialize(new { ok = true, scope }, "value", store!.Read());
            var snapshot = manager.ReadLibraryVersioned();
            return LargeJsonText.Serialize(new { ok = true, scope = snapshot.Scope, revision = snapshot.Revision }, "value", snapshot.Value);
        }
        catch (Exception error) { return JsonSerializer.Serialize(new { ok = false, error = error.Message }); }
    }

    public string Write(string value)
    {
        try
        {
            if (manager is not null) throw new IOException("当前保存缺少歌曲项目标识，请重新打开歌曲后再编辑。");
            store!.Write(value);
            return "{\"ok\":true}";
        }
        catch (Exception error) { return JsonSerializer.Serialize(new { ok = false, error = error.Message }); }
    }

    public string WriteScoped(string value, string expectedScope)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(expectedScope)) throw new IOException("保存缺少当前歌曲项目标识，请重新打开歌曲后再编辑。");
            if (manager is not null) manager.WriteLibrary(value, expectedScope);
            else
            {
                if (!string.Equals(expectedScope, scope, StringComparison.Ordinal)) throw new IOException("当前歌曲项目已切换，这次旧页面的保存没有写入。");
                store!.Write(value);
            }
            return "{\"ok\":true}";
        }
        catch (Exception error) { return JsonSerializer.Serialize(new { ok = false, error = error.Message }); }
    }

    public string WriteScopedIfUnchanged(string value, string expectedScope, string expectedRevision)
    {
        try
        {
            if (manager is null || string.IsNullOrWhiteSpace(expectedScope) || string.IsNullOrWhiteSpace(expectedRevision))
                throw new IOException("保存缺少当前歌曲项目的版本标识，请重新打开歌曲后再编辑。");
            string revision = manager.WriteLibraryIfUnchanged(value, expectedScope, expectedRevision);
            return JsonSerializer.Serialize(new { ok = true, revision });
        }
        catch (Exception error) { return JsonSerializer.Serialize(new { ok = false, error = error.Message }); }
    }

    public string StartWriteScopedIfUnchanged(string value, string expectedScope, string expectedRevision)
    {
        if (pendingWrite is not null || writeBuffer is not null) return JsonSerializer.Serialize(new { ok = false, error = "已有一个保存操作正在进行。" });
        pendingWrite = Task.Run(() => WriteScopedIfUnchanged(value, expectedScope, expectedRevision));
        return "{\"ok\":true,\"pending\":true}";
    }

    public string BeginWriteChunks(string expectedScope, string expectedRevision)
    {
        if (pendingWrite is not null || writeBuffer is not null) return JsonSerializer.Serialize(new { ok = false, error = "已有一个保存操作正在进行。" });
        writeBuffer = new System.Text.StringBuilder(); bufferScope = expectedScope; bufferRevision = expectedRevision;
        return "{\"ok\":true}";
    }

    public string AppendWriteChunk(string value)
    {
        if (writeBuffer is null || value.Length > 1024 * 1024 || (long)writeBuffer.Length + value.Length > AtomicTextStore.MaximumBytes)
            return JsonSerializer.Serialize(new { ok = false, error = "保存数据传输无效。" });
        writeBuffer.Append(value);
        return "{\"ok\":true}";
    }

    public string CommitWriteChunks()
    {
        if (writeBuffer is null || pendingWrite is not null) return JsonSerializer.Serialize(new { ok = false, error = "没有可提交的保存数据。" });
        var buffer = writeBuffer; string expectedScope = bufferScope!, expectedRevision = bufferRevision!;
        writeBuffer = null; bufferScope = bufferRevision = null;
        pendingWrite = Task.Run(() => WriteScopedIfUnchanged(buffer.ToString(), expectedScope, expectedRevision));
        return "{\"ok\":true,\"pending\":true}";
    }

    public string AbortWriteChunks()
    {
        writeBuffer = null; bufferScope = bufferRevision = null;
        return "{\"ok\":true}";
    }

    public string ReadWriteResult()
    {
        var operation = pendingWrite;
        if (operation is null) return JsonSerializer.Serialize(new { ok = false, error = "没有等待完成的保存操作。" });
        if (!operation.IsCompleted) return "{\"ok\":true,\"pending\":true}";
        pendingWrite = null;
        return operation.GetAwaiter().GetResult();
    }

    /// <summary>Confirmed destructive edits still remain drafts until explicit project Save.</summary>
    public string WriteScopedCheckpoint(string value, string expectedScope)
    {
        try
        {
            if (manager is null || string.IsNullOrWhiteSpace(expectedScope)) throw new IOException("永久修改缺少当前歌曲项目标识，请重新打开歌曲后再编辑。");
            manager.WriteLibrary(value, expectedScope, checkpoint: true);
            return "{\"ok\":true}";
        }
        catch (Exception error) { return JsonSerializer.Serialize(new { ok = false, error = error.Message }); }
    }
}
