using System.IO.Compression;
using System.Text;
using System.Text.Json.Nodes;
using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Persistence;

namespace RootSound.PhraseStudio.Tests;

internal static class PersistenceChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory); int checks = 0;
        var document = CoreChecks.Document(); string path = Path.Combine(directory, "song.rsphrase");
        PhraseArchive.SaveAsync(document, path).GetAwaiter().GetResult();
        var loaded = PhraseArchive.LoadAsync(path).GetAwaiter().GetResult();
        CoreChecks.Assert(loaded.Id == document.Id && loaded.Tempo == 110 && loaded.Bars == 2 && loaded.Name == document.Name &&
            loaded.Channels[0].Notes.SequenceEqual(document.Channels[0].Notes) && loaded.Channels[0].Timbre!.Settings == document.Channels[0].Timbre!.Settings &&
            loaded.Channels[0].Timbre!.Audio.Samples.SequenceEqual(document.Channels[0].Timbre!.Audio.Samples), "exact roundtrip"); checks++;
        using (var zip = ZipFile.OpenRead(path)) CoreChecks.Assert(zip.Entries.Count == 2, "shared sound deduplicated");
        CoreChecks.Assert(ReferenceEquals(loaded.Channels[0].Timbre, loaded.Channels[1].Timbre), "loaded sound shares immutable patch"); checks++;
        byte[] original = File.ReadAllBytes(path);
        Reject(() => PhraseArchive.SaveAsync(document with { Name = "changed" }, path).GetAwaiter().GetResult());
        CoreChecks.Assert(original.SequenceEqual(File.ReadAllBytes(path)), "no overwrite preserves"); checks++;
        using (var cancel = new CancellationTokenSource())
        {
            cancel.Cancel(); Reject(() => PhraseArchive.SaveAsync(document, path, true, cancel.Token).GetAwaiter().GetResult());
        }
        CoreChecks.Assert(original.SequenceEqual(File.ReadAllBytes(path)), "cancel preserves original");
        CoreChecks.Assert(!Directory.EnumerateFiles(directory, ".rootsound-phrase-*.tmp").Any(), "no stages"); checks++;
        Reject(() => PhraseArchive.AtomicWrite(path, true, CancellationToken.None, output =>
        { output.Write("partial"u8); throw new IOException("simulated storage failure"); }));
        CoreChecks.Assert(original.SequenceEqual(File.ReadAllBytes(path)) && !Directory.EnumerateFiles(directory, ".rootsound-phrase-*.tmp").Any(),
            "failure during writing preserves target and cleans stage"); checks++;
        using (var cancelDuringWrite = new CancellationTokenSource())
            Reject(() => PhraseArchive.AtomicWrite(path, true, cancelDuringWrite.Token, output =>
            { output.Write("partial"u8); cancelDuringWrite.Cancel(); }));
        CoreChecks.Assert(original.SequenceEqual(File.ReadAllBytes(path)), "cancel after stage write preserves target"); checks++;
        PhraseArchive.SaveAsync(document with { Name = "新版本" }, path, true).GetAwaiter().GetResult();
        CoreChecks.Assert(PhraseArchive.LoadAsync(path).GetAwaiter().GetResult().Name == "新版本", "explicit replace"); checks++;
        string moved = Path.Combine(directory, "renamed-portable.rsphrase"); File.Move(path, moved);
        CoreChecks.Assert(PhraseArchive.LoadAsync(moved).GetAwaiter().GetResult().Channels[0].Timbre!.Name == "测试音色", "portable renamed self-contained"); checks++;
        Reject(() => PhraseArchive.SaveAsync(PhraseFactory.New("空"), Path.Combine(directory, "empty.rsphrase")).GetAwaiter().GetResult());
        Reject(() => PhraseArchive.SaveAsync(PhraseFactory.New("空") with { Channels = new[] { PhraseFactory.Channel(Array.Empty<PhraseChannel>()) } }, Path.Combine(directory, "missing.rsphrase")).GetAwaiter().GetResult()); checks++;
        string corrupt = Path.Combine(directory, "corrupt.rsphrase"); File.Copy(moved, corrupt);
        using (var zip = ZipFile.Open(corrupt, ZipArchiveMode.Update))
        {
            var entry = zip.Entries.Single(item => item.FullName.EndsWith(".f32", StringComparison.Ordinal));
            string name = entry.FullName; byte[] audio;
            using (var input = entry.Open()) { using var memory = new MemoryStream(); input.CopyTo(memory); audio = memory.ToArray(); }
            entry.Delete(); audio[20] ^= 1;
            using var output = zip.CreateEntry(name).Open(); output.Write(audio);
        }
        Reject(() => PhraseArchive.LoadAsync(corrupt).GetAwaiter().GetResult()); checks++;
        string traversal = Path.Combine(directory, "unknown.rsphrase"); File.Copy(moved, traversal);
        using (var zip = ZipFile.Open(traversal, ZipArchiveMode.Update))
        { using var output = zip.CreateEntry("../escape.bin").Open(); output.WriteByte(1); }
        Reject(() => PhraseArchive.LoadAsync(traversal).GetAwaiter().GetResult());
        CoreChecks.Assert(!File.Exists(Path.Combine(directory, "escape.bin")), "never extracts entries"); checks++;
        string duplicate = Path.Combine(directory, "duplicate.rsphrase"); File.Copy(moved, duplicate);
        using (var zip = ZipFile.Open(duplicate, ZipArchiveMode.Update))
        { using var output = zip.CreateEntry("manifest.json").Open(); output.Write("{}"u8); }
        Reject(() => PhraseArchive.LoadAsync(duplicate).GetAwaiter().GetResult()); checks++;
        foreach (string change in new[] { "version", "notes", "key" })
        {
            string changed = Path.Combine(directory, change + ".rsphrase"); File.Copy(moved, changed);
            MutateManifest(changed, manifest =>
            {
                if (change == "version") manifest["Version"] = 2;
                if (change == "notes") manifest["Channels"]![0]!["Notes"]![0]!["LengthTick"] = long.MaxValue;
                if (change == "key") manifest["Assets"]![0]!["Key"] = new string('A', 64);
            });
            Reject(() => PhraseArchive.LoadAsync(changed).GetAwaiter().GetResult());
        }
        checks++;
        var draft = new DraftStore(Path.Combine(directory, "own-draft")); string hash = PhraseArchive.FileHashAsync(moved).GetAwaiter().GetResult();
        draft.SaveAsync(document, moved, hash).GetAwaiter().GetResult(); var recovered = draft.LoadStateAsync().GetAwaiter().GetResult()!;
        CoreChecks.Assert(recovered.Document.Channels.Count == 2 && recovered.SavedPath == moved && recovered.SavedSha256 == hash, "draft metadata recovery");
        var assets = Directory.GetFiles(Path.Combine(directory, "own-draft", "assets"));
        CoreChecks.Assert(assets.Length == 1, "draft dedup"); var timestamp = File.GetLastWriteTimeUtc(assets[0]);
        draft.SaveAsync(document with { Name = "下一步" }, moved, hash).GetAwaiter().GetResult();
        CoreChecks.Assert(File.GetLastWriteTimeUtc(assets[0]) == timestamp, "edits rewrite manifest only"); checks++;
        var emptyDraft = new DraftStore(Path.Combine(directory, "empty-draft"));
        var unfinished = PhraseFactory.New("未完成") with { Channels = new[] { PhraseFactory.Channel(Array.Empty<PhraseChannel>()) } };
        emptyDraft.SaveAsync(unfinished).GetAwaiter().GetResult();
        CoreChecks.Assert(emptyDraft.LoadAsync().GetAwaiter().GetResult()!.Channels[0].Timbre is null, "unfinished draft recovery"); checks++;
        string foreign = Path.Combine(directory, "own-draft", "unrelated.txt"); File.WriteAllText(foreign, "keep"); draft.Clear();
        CoreChecks.Assert(!draft.HasDraft && File.Exists(foreign) && File.Exists(assets[0]) && File.Exists(moved), "clear own manifest only"); checks++;
        string draftManifest = Path.Combine(directory, "empty-draft", "draft.json"); string before = File.ReadAllText(draftManifest);
        using (var cancel = new CancellationTokenSource())
        { cancel.Cancel(); Reject(() => emptyDraft.SaveAsync(unfinished with { Name = "cancel" }, cancel.Token).GetAwaiter().GetResult()); }
        CoreChecks.Assert(before == File.ReadAllText(draftManifest), "cancel preserves recovery draft"); checks++;
        draft.SaveAsync(document).GetAwaiter().GetResult(); File.WriteAllBytes(assets[0], "broken"u8.ToArray());
        Reject(() => draft.LoadAsync().GetAwaiter().GetResult()); checks++;
        CheckHashCancellation(); checks++;
        Console.WriteLine($"Persistence: {checks} groups passed"); return checks;
    }

    internal static void CheckHashCancellation()
    {
        var hashPatch = CoreChecks.Patch() with
        {
            Audio = new RootSound.TimbreLab.Core.PcmClip(8000, 1, Enumerable.Repeat(.1f, 32768).ToArray(), "取消测试")
        };
        using (var cancelHash = new CancellationTokenSource())
        {
            int completedSamples = 0; bool cancelled = false;
            try
            {
                DocumentFormat.Identity(hashPatch, cancelHash.Token, count =>
                { completedSamples = count; cancelHash.Cancel(); });
            }
            catch (OperationCanceledException) { cancelled = true; }
            CoreChecks.Assert(cancelled && completedSamples == 16384, "real PCM hash cancels after first complete chunk");
        }
        int retrySamples = 0;
        var identity = DocumentFormat.Identity(hashPatch, chunkProcessed: count => retrySamples = count);
        CoreChecks.Assert(retrySamples == 32768 && identity.AudioSha256.Length == 64, "cancelled identity was not cached; retry hashes complete PCM");
    }

    private static void MutateManifest(string path, Action<JsonNode> mutate)
    {
        using var zip = ZipFile.Open(path, ZipArchiveMode.Update); var entry = zip.GetEntry("manifest.json")!; JsonNode node;
        using (var input = entry.Open()) node = JsonNode.Parse(input)!;
        mutate(node); entry.Delete(); using var output = zip.CreateEntry("manifest.json").Open();
        output.Write(Encoding.UTF8.GetBytes(node.ToJsonString()));
    }
    private static void Reject(Action action)
    {
        try { action(); } catch (Exception ex) when (ex is IOException or InvalidDataException or ArgumentException or OperationCanceledException) { return; }
        throw new InvalidOperationException("invalid or cancelled persistence operation accepted");
    }
}
