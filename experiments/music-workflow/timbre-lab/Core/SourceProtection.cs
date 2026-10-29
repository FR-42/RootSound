using RootSound.SampleEditor.Audio;

namespace RootSound.TimbreLab.Core;

public sealed class SourceProtection
{
    private readonly List<(string Path, FileIdentity? Identity)> _sources = [];

    public void Remember(string path)
    {
        string full = Path.GetFullPath(path);
        using var handle = File.OpenHandle(full, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        _sources.Add((full, FileIdentity.Read(handle)));
    }

    // A capture comes from an already decoded, read-only snapshot. Keep the identity
    // acquired at import even if the original was moved while the song stayed open.
    internal void RememberSnapshot(string path, FileIdentity? identity)
    {
        string full = Path.GetFullPath(path);
        if (!_sources.Any(x => string.Equals(x.Path, full, StringComparison.OrdinalIgnoreCase) && x.Identity == identity))
            _sources.Add((full, identity));
    }

    public void CheckDestination(string path)
    {
        string full = Path.GetFullPath(path);
        if (_sources.Any(x => string.Equals(x.Path, full, StringComparison.OrdinalIgnoreCase)))
            throw new IOException("请换一个文件名，保留导入的原文件。");
        if (!File.Exists(full)) return;
        using var handle = File.OpenHandle(full, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        var target = FileIdentity.Read(handle);
        if (target is null || _sources.Any(x => x.Identity is null))
            throw new IOException("无法确认目标文件的身份，请换一个新的文件名。");
        if (_sources.Any(x => x.Identity == target))
            throw new IOException("这个位置指向导入的原文件，请换一个文件名。");
    }
}
