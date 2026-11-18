using System.Security.Cryptography;
using System.Text.Json;

namespace RootSound.Desktop;

internal static class BundledProjects
{
    internal static int Seed(string source, string dataRoot)
    {
        string manifest = Path.Combine(source, "manifest.json");
        if (!File.Exists(manifest)) return 0;
        using var definition = JsonDocument.Parse(File.ReadAllText(manifest));
        int version = definition.RootElement.GetProperty("version").GetInt32();
        if (version is not (1 or 2)) throw new IOException("随包项目清单无效。");
        string marker = Path.Combine(dataRoot, ".bundled-projects.json");
        var completed = new HashSet<string>(StringComparer.Ordinal);
        if (File.Exists(marker))
        {
            using var record = JsonDocument.Parse(File.ReadAllText(marker));
            foreach (var item in record.RootElement.GetProperty("files").EnumerateArray())
                completed.Add(item.GetString() ?? throw new IOException("随包项目的导入记录无法读取。"));
        }
        string folder = version == 2 ? "演示项目" : "";
        string target = Path.Combine(dataRoot, "project", folder);
        int copied = 0;
        foreach (var item in definition.RootElement.GetProperty("projects").EnumerateArray())
        {
            string name = item.GetProperty("name").GetString() ?? "";
            var parts = name.Split('/');
            if (!name.EndsWith(".rootsound", StringComparison.Ordinal) || version == 1 && parts.Length != 1
                || parts.Any(part => part is "" or "." or ".." || part.Any(c => c < 32 || c is '\\' or ':' || Path.GetInvalidFileNameChars().Contains(c))))
                throw new IOException("随包项目名称无效。");
            string key = folder.Length > 0 ? folder + "/" + name : name;
            if (completed.Contains(key)) continue;
            string destination = Path.Combine(target, Path.Combine(parts));
            if (!File.Exists(destination))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
                for (var parent = new DirectoryInfo(Path.GetDirectoryName(destination)!); parent is not null; parent = parent.Parent)
                    if ((parent.Attributes & FileAttributes.ReparsePoint) != 0) throw new IOException("随包项目目录不能使用链接。");
                string original = Path.Combine(source, Path.Combine(parts));
                using (var stream = File.OpenRead(original))
                {
                    if (stream.Length != item.GetProperty("bytes").GetInt64()
                        || !Convert.ToHexString(SHA256.HashData(stream)).Equals(item.GetProperty("sha256").GetString(), StringComparison.OrdinalIgnoreCase))
                        throw new IOException("随包项目校验失败。");
                }
                string temporary = destination + "." + Guid.NewGuid().ToString("N") + ".tmp";
                try
                {
                    File.Copy(original, temporary);
                    try { File.Move(temporary, destination); copied++; }
                    catch (IOException) when (File.Exists(destination)) { }
                }
                finally { if (File.Exists(temporary)) File.Delete(temporary); }
            }
            completed.Add(key);
            string pending = marker + "." + Guid.NewGuid().ToString("N") + ".tmp";
            try
            {
                File.WriteAllText(pending, JsonSerializer.Serialize(new { version = 1, files = completed.ToArray() }));
                File.Move(pending, marker, overwrite: true);
            }
            finally { if (File.Exists(pending)) File.Delete(pending); }
        }
        return copied;
    }
}
