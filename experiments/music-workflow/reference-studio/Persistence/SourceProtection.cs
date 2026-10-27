using RootSound.ReferenceStudio.Core;
using RootSound.SampleEditor.Audio;

namespace RootSound.ReferenceStudio.Persistence;

public static class SourceProtection
{
    public static void Check(ReferenceProject project, string destination)
    {
        string target = Path.GetFullPath(destination);
        if (project.Info.SourcePath is not { Length: > 0 } source) return;
        string original;
        try { original = Path.GetFullPath(source); }
        catch (Exception ex) when (ex is ArgumentException or NotSupportedException) { return; }
        if (StringComparer.OrdinalIgnoreCase.Equals(original, target))
            throw new IOException("请使用新的文件名，原曲会保留。");
        if (!File.Exists(original) || !File.Exists(target)) return;
        using var sourceHandle = File.OpenHandle(original, FileMode.Open, FileAccess.Read,
            FileShare.ReadWrite | FileShare.Delete);
        using var targetHandle = File.OpenHandle(target, FileMode.Open, FileAccess.Read,
            FileShare.ReadWrite | FileShare.Delete);
        var sourceId = FileIdentity.Read(sourceHandle);
        var targetId = FileIdentity.Read(targetHandle);
        if (sourceId is null || targetId is null)
            throw new IOException("无法确认目标文件是否为原曲，请换一个新的文件名。");
        if (sourceId == targetId) throw new IOException("请使用新的文件名，不能覆盖原曲或它的链接。");
    }
}
