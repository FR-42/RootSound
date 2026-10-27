namespace RootSound.Desktop;

/// <summary>Export pickers cannot replace the managed project's own storage or ownership files.</summary>
internal static class ProjectFileProtection
{
    internal static void RequireExportTarget(string target)
    {
        string name = Path.GetFileName(target).TrimEnd(' ', '.');
        if (name.Contains(':') || name.EndsWith(".rootsound", StringComparison.OrdinalIgnoreCase)
            || name.EndsWith(".rootsound.bak", StringComparison.OrdinalIgnoreCase)
            || new[] { "project.json", "project.json.bak", "materials.json", "materials.json.bak", "materials.lock" }
            .Contains(name, StringComparer.OrdinalIgnoreCase))
            throw new IOException("这个文件用于保存歌曲项目本身，请为导出文件选择另一个名称。");
    }
}
