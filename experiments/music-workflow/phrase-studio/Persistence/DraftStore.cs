using RootSound.PhraseStudio.Core;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;

namespace RootSound.PhraseStudio.Persistence;

public sealed record DraftState(PhraseDocument Document, string? SavedPath, string? SavedSha256);

/// <summary>Only its own manifest and content-addressed assets are touched. No directory scanning or old-asset deletion.</summary>
public sealed class DraftStore
{
    private readonly string directory;
    private readonly SemaphoreSlim gate = new(1, 1);
    public DraftStore(string directory) { this.directory = Path.GetFullPath(directory); }
    private string ManifestPath => Path.Combine(directory, "draft.json");
    public bool HasDraft => File.Exists(ManifestPath);

    public Task SaveAsync(PhraseDocument document, CancellationToken cancellationToken = default) =>
        SaveAsync(document, null, null, cancellationToken);

    public async Task SaveAsync(PhraseDocument document, string? savedPath, string? savedSha256,
        CancellationToken cancellationToken = default)
    {
        await gate.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            await Task.Run(() =>
            {
                var capture = DocumentFormat.Capture(document, savedPath, savedSha256, cancellationToken);
                byte[] manifest = DocumentFormat.Serialize(capture.Manifest);
                Directory.CreateDirectory(directory); string assetDirectory = Path.Combine(directory, "assets");
                Directory.CreateDirectory(assetDirectory);
                foreach (var asset in capture.Assets)
                {
                    cancellationToken.ThrowIfCancellationRequested(); string path = Path.Combine(assetDirectory, asset.Key + ".rstimbre");
                    if (!File.Exists(path)) TimbreArchive.Export(asset.Value, path, false, cancellationToken);
                }
                PhraseArchive.AtomicWrite(ManifestPath, true, cancellationToken, output => output.Write(manifest));
            }, cancellationToken).ConfigureAwait(false);
        }
        finally { gate.Release(); }
    }

    public async Task<PhraseDocument?> LoadAsync(CancellationToken cancellationToken = default) =>
        (await LoadStateAsync(cancellationToken).ConfigureAwait(false))?.Document;

    public async Task<DraftState?> LoadStateAsync(CancellationToken cancellationToken = default)
    {
        await gate.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            return await Task.Run(() =>
            {
                cancellationToken.ThrowIfCancellationRequested(); if (!HasDraft) return null;
                DocumentFormat.Manifest manifest;
                using (var input = File.OpenRead(ManifestPath)) manifest = DocumentFormat.Parse(input, input.Length);
                Dictionary<string, InstrumentPatch> assets = new(StringComparer.Ordinal);
                foreach (var asset in manifest.Assets)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    var patch = TimbreArchive.Import(Path.Combine(directory, "assets", asset.Key + ".rstimbre"), cancellationToken);
                    if (DocumentFormat.Identity(patch, cancellationToken).Key != asset.Key) throw new InvalidDataException("恢复稿音色校验失败。 ");
                    assets.Add(asset.Key, patch);
                }
                return new DraftState(DocumentFormat.Restore(manifest, assets), manifest.SavedPath, manifest.SavedSha256);
            }, cancellationToken).ConfigureAwait(false);
        }
        finally { gate.Release(); }
    }

    public void Clear()
    {
        gate.Wait();
        try { File.Delete(ManifestPath); }
        finally { gate.Release(); }
    }
}
