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
    public NativeStorage(AtomicTextStore store) => this.store = store;
    public NativeStorage(ProjectDirectoryManager manager) => this.manager = manager;

    public string Read()
    {
        try
        {
            var result = manager?.ReadLibrary() ?? (store!.Read(), scope);
            return LargeJsonText.Serialize(new { ok = true, scope = result.Item2 }, "value", result.Item1);
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
