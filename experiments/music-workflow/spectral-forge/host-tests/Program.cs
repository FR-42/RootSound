using System.Buffers.Binary;
using System.Text;
using System.Text.Json;
using RootSound.SpectralForge;

internal static class Program
{
    private static int passed;
    private static void Check(bool value, string message) { if (!value) throw new Exception(message); passed++; }
    private static void Reject(Action action, string message)
    { try { action(); } catch (Exception) { passed++; return; } throw new Exception(message); }
    private static byte[] Wav()
    {
        byte[] bytes = new byte[56];
        Encoding.ASCII.GetBytes("RIFF").CopyTo(bytes, 0); BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(4), 48);
        Encoding.ASCII.GetBytes("WAVEfmt ").CopyTo(bytes, 8); BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(16), 16);
        BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(20), 1); BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(22), 2);
        BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(24), 48000); BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(28), 288000);
        BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(32), 6); BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(34), 24);
        Encoding.ASCII.GetBytes("data").CopyTo(bytes, 36); BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(40), 12);
        bytes[47] = 7; return bytes;
    }
    private static int Main(string[] args)
    {
        string root = Path.GetFullPath(args.Length > 0 ? args[0] : throw new ArgumentException("Provide a dedicated test output directory."));
        Directory.CreateDirectory(root);
        try
        {
            const string patch = "{\"format\":\"RootSoundSpectralPatch\",\"version\":1,\"name\":\"细调测试\",\"points\":[{\"x\":20,\"y\":-0.123456789}]}";
            Check(NativeFiles.ValidatePatch(patch) == patch, "Patch text and exact points are preserved.");
            Reject(() => NativeFiles.ValidatePatch("{}"), "Unknown patch must fail.");
            Reject(() => NativeFiles.ValidatePatch(patch.Replace("\"version\":1", "\"version\":2")), "Future patch version must fail.");
            Reject(() => NativeFiles.ValidatePatch(patch.Replace("20,", "1e999,")), "Nonfinite JSON number must fail.");
            Reject(() => NativeFiles.ValidatePatch(patch.Replace("\"version\":1", "\"version\":1,\"version\":1")), "Duplicate property must fail.");
            Reject(() => NativeFiles.ValidatePatch(patch + new string(' ', NativeFiles.MaximumPatchBytes)), "Oversize patch must fail.");
            string file = Path.Combine(root, "精细 音色.rssynth");
            NativeFiles.WriteAtomic(file, NativeFiles.PatchBytes(patch), null);
            Check(NativeFiles.ReadPatch(file) == patch, "Atomic first save and reopen match.");
            string bom = Path.Combine(root, "外部编辑器.rssynth"); File.WriteAllText(bom, patch, new UTF8Encoding(true));
            Check(NativeFiles.ReadPatch(bom) == patch && File.ReadAllBytes(bom)[0] == 0xef, "BOM patch opens without rewriting its source.");
            string second = patch.Replace("-0.123456789", "-0.987654321");
            NativeFiles.WriteAtomic(file, NativeFiles.PatchBytes(second), NativeFiles.Observe(file));
            Check(NativeFiles.ReadPatch(file) == second && File.ReadAllText(file + ".bak") == patch, "Replacement retains prior backup.");
            byte[] old = File.ReadAllBytes(file);
            Reject(() => NativeFiles.WriteAtomic(file, [1, 2, 3], null), "Unexpected existing file must not be replaced.");
            Check(File.ReadAllBytes(file).SequenceEqual(old), "Refusal preserves target.");
            byte[]? observed = NativeFiles.Observe(file);
            Reject(() => NativeFiles.WriteAtomic(file, NativeFiles.PatchBytes(patch), observed, () => File.WriteAllText(file, "external")), "Concurrent change must fail.");
            Check(File.ReadAllText(file) == "external" && !Directory.GetFiles(root, ".spectral-write-*.tmp").Any(), "External edits survive; only own temporary removed.");
            File.WriteAllText(file, patch);
            using (var locked = new FileStream(file, FileMode.Open, FileAccess.Read, FileShare.Read))
                Reject(() => NativeFiles.WriteAtomic(file, NativeFiles.PatchBytes(second), NativeFiles.Observe(file)), "Locked replacement must fail.");
            Check(NativeFiles.ReadPatch(file) == patch, "Locked file remains intact.");
            string empty = Path.Combine(root, "empty.rssynth"); File.WriteAllBytes(empty, []);
            NativeFiles.WriteAtomic(empty, NativeFiles.PatchBytes(patch), NativeFiles.Observe(empty));
            Check(NativeFiles.ReadPatch(empty) == patch, "Explicit overwrite of an empty target works.");
            string bad = Path.Combine(root, "damaged.rssynth"); File.WriteAllText(bad, "{invalid");
            Reject(() => NativeFiles.ReadPatch(bad), "Corrupt patch must fail.");
            Check(File.ReadAllText(bad) == "{invalid", "Read error preserves source.");
            var store = new NativeFiles(Path.Combine(root, "independent-experiment"));
            Check(store.ReadRecovery() is null, "Empty recovery needs no synthetic default.");
            store.WriteRecovery(patch); Check(store.ReadRecovery() == patch, "Recovery can reopen exact patch.");
            store.WriteRecovery(second);
            store.ClearRecovery(); store.ClearRecovery(); Check(store.ReadRecovery() is null && !File.Exists(store.RecoveryPath + ".bak") && NativeFiles.ReadPatch(empty) == patch, "Recovery deletion is idempotent and does not touch exported files.");
            string folderA = Path.Combine(root, "外部 音色 A"), folderB = Path.Combine(root, "外部音色 B");
            Directory.CreateDirectory(folderA); Directory.CreateDirectory(folderB);
            string soundA = Path.Combine(folderA, "鼓声.rssynth"), soundB = Path.Combine(folderB, "低音.rssynth");
            File.WriteAllText(soundA, patch); File.WriteAllText(soundB, second);
            Check(store.OpenDirectory == store.OutputDirectory && !File.Exists(store.OpenDirectoryStatePath), "First open uses the existing default without writing a preference.");
            store.RememberOpenedFile(soundA);
            Check(store.OpenDirectory == folderA && NativeFiles.ReadPatch(soundA) == patch, "Choosing a sound remembers its parent, preserving the source.");
            var restarted = new NativeFiles(Path.Combine(root, "independent-experiment"));
            Check(restarted.OpenDirectory == folderA, "Open directory survives a fresh application file store.");
            restarted.RememberOpenedFile(soundB); restarted.WriteRecovery(patch); restarted.ClearRecovery();
            Check(new NativeFiles(Path.Combine(root, "independent-experiment")).OpenDirectory == folderB,
                "Latest choice replaces the earlier folder, and recovery cleanup preserves the preference.");
            string removedFolder = Path.Combine(root, "removed-open-folder"); Directory.CreateDirectory(removedFolder);
            restarted.RememberOpenedFile(Path.Combine(removedFolder, "selected.rssynth")); Directory.Delete(removedFolder);
            Check(restarted.OpenDirectory == restarted.OutputDirectory && new NativeFiles(Path.Combine(root, "independent-experiment")).OpenDirectory == restarted.OutputDirectory,
                "Unavailable folders fall back safely in this session and after restart.");
            File.WriteAllText(store.OpenDirectoryStatePath, "{corrupt");
            Check(new NativeFiles(Path.Combine(root, "independent-experiment")).OpenDirectory == store.OutputDirectory && File.ReadAllText(store.OpenDirectoryStatePath) == "{corrupt",
                "Corrupt optional state does not prevent startup or rewrite the bad file.");
            File.WriteAllText(store.OpenDirectoryStatePath, "{\"directory\":\"relative-folder\"}");
            Check(new NativeFiles(Path.Combine(root, "independent-experiment")).OpenDirectory == store.OutputDirectory, "Relative preferences cannot change with the process working directory.");
            File.WriteAllText(store.OpenDirectoryStatePath, "{}");
            using (var lockedPreference = new FileStream(store.OpenDirectoryStatePath, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                store.RememberOpenedFile(soundA);
                Check(store.OpenDirectory == folderA && NativeFiles.ReadPatch(soundA) == patch, "A locked optional preference does not block opening or session memory.");
            }
            Check(File.ReadAllText(store.OpenDirectoryStatePath) == "{}" && !Directory.GetFiles(store.OutputDirectory, ".spectral-write-*.tmp").Any(),
                "Failed preference writes preserve the target and clean their staging file.");
            byte[] wav = Wav(); NativeFiles.ValidateWav(wav);
            Check(NativeFiles.ValidateWavBase64(Convert.ToBase64String(wav)).SequenceEqual(wav), "WAV bytes remain exact.");
            Reject(() => NativeFiles.ValidateWavBase64("!"), "Bad audio encoding must fail.");
            Reject(() => NativeFiles.ValidateWavBase64(Convert.ToBase64String(wav) + "\n"), "Noncanonical audio encoding must fail.");
            byte[] wrongBits = (byte[])wav.Clone(); wrongBits[34] = 16;
            Reject(() => NativeFiles.ValidateWav(wrongBits), "Only stated 24bit audio is accepted.");
            Reject(() => NativeFiles.ValidateWav(wav[..^1]), "Truncated WAV must fail.");
            byte[] wrongBlock = (byte[])wav.Clone(); wrongBlock[40] = 11;
            Reject(() => NativeFiles.ValidateWav(wrongBlock), "Partial frame must fail.");
            string suggestion = NativeFiles.SuggestedName("../奇怪:name.wav", ".wav");
            Check(!suggestion.Contains('/') && !suggestion.Contains('\\') && !suggestion.Contains(':'), "Suggested name cannot supply a path.");
            Check(NativeFiles.SuggestedName("CON", ".rssynth") == "音色.rssynth", "Device names are not suggested.");
            Check(WebSecurity.Trusted("https://spectral.local/index.html") && !WebSecurity.Trusted("https://spectral.local.evil.test/")
                && !WebSecurity.Trusted("file:///C:/Windows/") && !WebSecurity.Trusted("https://user@spectral.local/") && !WebSecurity.Trusted("https://spectral.local:9443/"), "Only the precise local origin is trusted.");
            Check(WebSecurity.LocalResource(root, "https://spectral.local/engine.mjs") == Path.Combine(root, "engine.mjs"), "Local modules map inside UI.");
            Check(WebSecurity.LocalResource(root, "https://spectral.local/%2e%2e%5csecret.mjs") is null
                && WebSecurity.LocalResource(root, "https://spectral.local/%00.mjs") is null, "Encoded traversal and null paths fail.");
            var request = BridgeRequest.Parse("{\"id\":\"test\",\"method\":\"savePatch\",\"payload\":{\"text\":\"hello\"}}");
            Check(request.Id == "test" && request.Text("text") == "hello", "Bridge reads only explicit request fields.");
            Reject(() => BridgeRequest.Parse("{\"id\":\"test\",\"id\":\"other\",\"method\":\"openPatch\"}"), "Duplicate bridge field fails.");
            Reject(() => BridgeRequest.Parse("{\"id\":\"test\",\"method\":\"openPatch\",\"path\":\"C:/Windows\"}"), "Path injection is not an operation field.");
            string report = JsonSerializer.Serialize(new { passed, visibleWindowsCreated = false, soundDevicesOpened = false, files = root });
            File.WriteAllText(Path.Combine(root, "host-report.json"), report); Console.WriteLine(report); return 0;
        }
        catch (Exception error)
        {
            Console.Error.WriteLine(error); File.WriteAllText(Path.Combine(root, "host-report.json"), JsonSerializer.Serialize(new { passed, error = error.ToString() })); return 1;
        }
    }
}
