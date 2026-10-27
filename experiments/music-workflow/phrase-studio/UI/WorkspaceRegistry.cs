using System.Text.Json;
using System.Text.Json.Serialization;
using RootSound.PhraseStudio.Persistence;

namespace RootSound.PhraseStudio.UI;

/// <summary>Exact, private workspace index. Never searches other projects or deletes indexed paths.</summary>
internal sealed class WorkspaceRegistry
{
    internal const int MaximumPanes = 128;
    private static readonly JsonSerializerOptions JsonOptions = new()
    { WriteIndented = true, UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow, MaxDepth = 8 };
    internal WorkspaceRegistry(string? root = null)
    {
        RootDirectory = Path.GetFullPath(root ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "RootSoundExperiments", "PhraseStudio"));
    }
    internal string RootDirectory { get; }
    internal string IndexPath => Path.Combine(RootDirectory, "ownindex.json");
    internal DraftStore Store(Guid id)
    {
        if (id == Guid.Empty) throw new ArgumentException("工作区编号无效。 ", nameof(id));
        return new DraftStore(Path.Combine(RootDirectory, "drafts", id.ToString("N")));
    }

    internal IReadOnlyList<Guid> ReadIndex()
    {
        if (!File.Exists(IndexPath)) return Array.Empty<Guid>();
        using var stream = new FileStream(IndexPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        if (stream.Length is <= 0 or > 64 * 1024) throw new InvalidDataException("上次工作记录过大或不完整。 ");
        RegistryData? data;
        try { data = JsonSerializer.Deserialize<RegistryData>(stream, JsonOptions); }
        catch (JsonException ex) { throw new InvalidDataException("无法读取上次工作记录。 ", ex); }
        if (data is null || data.Format != "RootSound.PhraseWorkspace" || data.Version != 1 || data.Entries is null)
            throw new InvalidDataException("尚不支持这份工作区记录。 ");
        Validate(data.Entries);
        return Array.AsReadOnly(data.Entries);
    }

    internal void WriteIndex(IEnumerable<Guid> entries, CancellationToken cancellationToken = default)
    {
        Guid[] ids = entries.ToArray(); Validate(ids);
        byte[] data = JsonSerializer.SerializeToUtf8Bytes(new RegistryData("RootSound.PhraseWorkspace", 1, ids), JsonOptions);
        cancellationToken.ThrowIfCancellationRequested(); Directory.CreateDirectory(RootDirectory);
        PhraseArchive.AtomicWrite(IndexPath, true, cancellationToken, output => output.Write(data));
    }

    private static void Validate(Guid[] ids)
    {
        if (ids.Length > MaximumPanes || ids.Any(id => id == Guid.Empty) || ids.Distinct().Count() != ids.Length)
            throw new InvalidDataException("工作区编号重复、无效，或超过了 128 个乐句。 ");
    }
    private sealed record RegistryData(string Format, int Version, Guid[] Entries);
}
