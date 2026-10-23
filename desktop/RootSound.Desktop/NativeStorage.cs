using System.Runtime.InteropServices;
using System.Text.Json;

namespace RootSound.Desktop;

[ComVisible(true)]
[ClassInterface(ClassInterfaceType.AutoDual)]
public sealed class NativeStorage
{
    private readonly AtomicTextStore store;
    public NativeStorage(AtomicTextStore store) => this.store = store;

    public string Read()
    {
        try { return JsonSerializer.Serialize(new { ok = true, value = store.Read() }); }
        catch (Exception error) { return JsonSerializer.Serialize(new { ok = false, error = error.Message }); }
    }

    public string Write(string value)
    {
        try { store.Write(value); return "{\"ok\":true}"; }
        catch (Exception error) { return JsonSerializer.Serialize(new { ok = false, error = error.Message }); }
    }
}
