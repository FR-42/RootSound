using System.Security.Cryptography;
using System.Text.Json;
using RootSound.Desktop;

if (args.Length != 1) throw new ArgumentException("Pass one generated pilot .rootsound file.");
string target = Path.GetFullPath(args[0]);
byte[] before = File.ReadAllBytes(target);
var original = JsonDocument.Parse(before).RootElement;
string expected = original.GetProperty("libraryText").GetString()!;
string name = original.GetProperty("name").GetString()!;
using (var manager = new ProjectDirectoryManager(Path.GetDirectoryName(target)!))
{
    var opened = manager.Open(target);
    if (opened.Name != name || manager.ReadLibrary().Value != expected || manager.HasUnsavedChanges)
        throw new InvalidDataException("Native project-open state differs from the exported workspace.");
}
if (!before.AsSpan().SequenceEqual(File.ReadAllBytes(target)))
    throw new IOException("Read-only validation unexpectedly changed the file.");
Console.WriteLine(JsonSerializer.Serialize(new { passed = true, nativeOpen = true, libraryPreserved = true,
    fileUnchanged = true, windowsOpened = false, soundDeviceOpened = false,
    name, bytes = before.Length, sha256 = Convert.ToHexString(SHA256.HashData(before)).ToLowerInvariant() }));
