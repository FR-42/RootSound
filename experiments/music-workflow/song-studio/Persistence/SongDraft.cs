using RootSound.PhraseStudio.Persistence;
using RootSound.SongStudio.Core;
using RootSound.TimbreLab.Core;

namespace RootSound.SongStudio.Persistence;
internal sealed class SongDraft(string root)
{
    private string ManifestPath => Path.Combine(root, "draft.json");
    internal bool Exists => File.Exists(ManifestPath);
    internal void Save(SongDocument song, CancellationToken token)
    {
        var capture = SongFormat.Capture(song, token); var json = SongFormat.Serialize(capture.Manifest);
        Directory.CreateDirectory(Path.Combine(root, "assets"));
        foreach (var pair in capture.Assets)
        {
            string path = Path.Combine(root, "assets", pair.Key + ".f32");
            if (!File.Exists(path)) PhraseArchive.AtomicWrite(path, false, token, stream => SongArchive.WriteAudio(stream, pair.Value.Audio, token));
        }
        PhraseArchive.AtomicWrite(ManifestPath, true, token, stream => stream.Write(json));
    }
    internal SongDocument Load(CancellationToken token)
    {
        using var input = File.OpenRead(ManifestPath); var manifest = SongFormat.Parse(input, input.Length);
        Dictionary<string, InstrumentPatch> assets = new(StringComparer.Ordinal);
        foreach (var pair in SongFormat.Assets(manifest))
        {
            token.ThrowIfCancellationRequested(); using var audio = File.OpenRead(Path.Combine(root, "assets", pair.Key + ".f32"));
            assets.Add(pair.Key, SongArchive.ReadAudio(audio, audio.Length, pair.Value, token));
        }
        return SongFormat.Restore(manifest, assets);
    }
    internal void Clear() { if (File.Exists(ManifestPath)) File.Delete(ManifestPath); }
}
