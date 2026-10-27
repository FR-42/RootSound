using System.IO.Compression;
using System.Security.Cryptography;
using System.Text.Json;
using System.Runtime.InteropServices;
using RootSound.PhraseStudio.Core;
using RootSound.ReferenceStudio.Core;
using RootSound.ReferenceStudio.Persistence;
using RootSound.TimbreLab.Core;

namespace RootSound.ReferenceStudio.Tests;

internal static class TestProject
{
    internal static ReferenceProject Create()
    {
        float[] pcm = new float[4800];
        for (int i = 0; i < pcm.Length; i++) pcm[i] = (float)(.1 * Math.Sin(2 * Math.PI * 220 * i / 48000));
        var patch = new InstrumentPatch(new PcmClip(48000, 1, pcm, "合成测试音色"),
            new InstrumentSettings(57, .001, .02, .6, .02, true, 0, 4800, .003), "合成测试音色");
        var channel = PhraseFactory.Channel([]) with { Name = "旋律", Timbre = patch,
            Notes = [new(Guid.NewGuid(), 57, 0, 960, .8), new(Guid.NewGuid(), 60, 1920, 960, .7)] };
        var phrase = PhraseFactory.New("测试案例", 240) with { Channels = [channel] };
        float[] reference = new float[48000 * 2];
        for (int i = 0; i < reference.Length; i++) reference[i] = (float)(.07 * Math.Sin(i * .05));
        return new(phrase, new PcmClip(48000, 2, reference, "参考"),
            new CaseInfo("测试案例", "原曲.wav", 5, 20, new string('A', 64), "节奏和旋律的测试", "合成测试，不是真实分轨"),
            [new(channel.Id, "旋律", "在这里改变音高", "离线合成")], [new(channel.Id, 9000, .4, .2)])
            { ReferenceGainDb = -2, MasterGainDb = -1 };
    }
}

internal static class PersistenceChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory); int count = 0;
        var project = TestProject.Create(); string file = Path.Combine(directory, "案例.rscase");
        Check("self-contained archive preserves float samples, notes and sound controls", () =>
        {
            CaseArchive.Save(project, file, default); var loaded = CaseArchive.Load(file, default);
            Assert(loaded.Reference.Samples.SequenceEqual(project.Reference.Samples), "Reference floats exact.");
            Assert(loaded.Phrase.Channels[0].Timbre!.Audio.Samples.SequenceEqual(project.Phrase.Channels[0].Timbre!.Audio.Samples), "Timbre floats exact.");
            Assert(loaded.Phrase.Channels[0].Notes.SequenceEqual(project.Phrase.Channels[0].Notes), "Notes preserved.");
            Assert(loaded.Sounds.SequenceEqual(project.Sounds) && loaded.Layers.SequenceEqual(project.Layers), "Descriptions/effects preserved.");
            Assert(loaded.ReferenceGainDb == -2 && loaded.MasterGainDb == -1, "Comparison gains preserved.");
        });
        Check("canceled save preserves existing archive", () =>
        {
            byte[] before = File.ReadAllBytes(file); using var cancel = new CancellationTokenSource(); cancel.Cancel();
            Throws<OperationCanceledException>(() => CaseArchive.Save(project, file, cancel.Token));
            Assert(File.ReadAllBytes(file).SequenceEqual(before), "Existing file unchanged.");
        });
        Check("invalid edit cannot replace an existing archive", () =>
        {
            byte[] before = File.ReadAllBytes(file);
            Throws<InvalidDataException>(() => CaseArchive.Save(project with { Sounds = [] }, file, default));
            Assert(File.ReadAllBytes(file).SequenceEqual(before), "Invalid save unchanged.");
        });
        Check("reference and phrase duration must agree", () =>
            Throws<InvalidDataException>(() => ReferenceValidation.Validate(project with { Phrase = project.Phrase with { Tempo = 120 } })));
        Check("layer identities must match channels exactly", () =>
            Throws<InvalidDataException>(() => ReferenceValidation.Validate(project with { Layers = [project.Layers[0] with { ChannelId = Guid.NewGuid() }] })));
        Check("non-finite effects are rejected", () =>
            Throws<InvalidDataException>(() => ReferenceValidation.Validate(project with { Sounds = [project.Sounds[0] with { Sweep = double.NaN }] })));
        Check("non-finite reference sample is rejected before saving", () =>
        {
            var samples = (float[])project.Reference.Samples.Clone(); samples[10] = float.NaN;
            Throws<InvalidDataException>(() => ReferenceValidation.Validate(project with { Reference = new PcmClip(48000, 2, samples, "坏数据") }, true));
        });
        Check("saved reference hash detects tampering", () =>
        {
            string tampered = Path.Combine(directory, "损坏参考.rscase");
            Rewrite(file, tampered, "reference.f32", bytes => { bytes[100] ^= 1; return bytes; });
            Throws<InvalidDataException>(() => CaseArchive.Load(tampered, default));
        });
        Check("saved phrase hash detects tampering", () =>
        {
            string tampered = Path.Combine(directory, "损坏乐句.rscase");
            Rewrite(file, tampered, "reconstruction.rsphrase", bytes => { bytes[20] ^= 1; return bytes; });
            Throws<InvalidDataException>(() => CaseArchive.Load(tampered, default));
        });
        Check("unknown and duplicate archive entries are rejected", () =>
        {
            string extra = Path.Combine(directory, "未知内容.rscase"); File.Copy(file, extra);
            using (var zip = ZipFile.Open(extra, ZipArchiveMode.Update)) zip.CreateEntry("../outside.txt");
            Throws<InvalidDataException>(() => CaseArchive.Load(extra, default));
            string duplicate = Path.Combine(directory, "重复内容.rscase"); File.Copy(file, duplicate);
            using (var zip = ZipFile.Open(duplicate, ZipArchiveMode.Update)) zip.CreateEntry("case.json");
            Throws<InvalidDataException>(() => CaseArchive.Load(duplicate, default));
        });
        Check("format and extension are explicit", () =>
        {
            Throws<IOException>(() => CaseArchive.Save(project, Path.Combine(directory, "歌曲.wav"), default));
            string newer = Path.Combine(directory, "新版.rscase");
            Rewrite(file, newer, "case.json", bytes => System.Text.Encoding.UTF8.GetBytes(System.Text.Encoding.UTF8.GetString(bytes).Replace("\"Version\": 1", "\"Version\": 99")));
            Throws<InvalidDataException>(() => CaseArchive.Load(newer, default));
        });
        Check("source path is provenance, not a reopening dependency", () =>
        {
            var portable = project with { Info = project.Info with { SourcePath = Path.Combine(directory, "已不存在的原曲.wav") } };
            string destination = Path.Combine(directory, "便携.rscase"); CaseArchive.Save(portable, destination, default);
            Assert(CaseArchive.Load(destination, default).Info.SourcePath == portable.Info.SourcePath, "Reopens without original.");
        });
        Check("original file and alternate path spelling are protected", () =>
        {
            string original = Path.Combine(directory, "原曲.wav"); File.WriteAllText(original, "preserve original");
            var protectedProject = project with { Info = project.Info with { SourcePath = original } };
            Throws<IOException>(() => SourceProtection.Check(protectedProject, original));
            Throws<IOException>(() => SourceProtection.Check(protectedProject, Path.Combine(directory, ".", "原曲.wav")));
            Assert(File.ReadAllText(original) == "preserve original", "Original unchanged.");
        });
        Check("a hard-link alias of the original is also protected", () =>
        {
            string original = Path.Combine(directory, "原曲.wav"), alias = Path.Combine(directory, "原曲链接.wav");
            if (!File.Exists(alias) && !CreateHardLink(alias, original, IntPtr.Zero))
                throw new IOException("Cannot create test hard link: " + Marshal.GetLastWin32Error());
            var protectedProject = project with { Info = project.Info with { SourcePath = original } };
            Throws<IOException>(() => SourceProtection.Check(protectedProject, alias));
            Assert(File.ReadAllText(original) == "preserve original", "Linked original unchanged.");
        });
        Check("truncated archive is rejected", () =>
        {
            string truncated = Path.Combine(directory, "截断.rscase"); var bytes = File.ReadAllBytes(file);
            File.WriteAllBytes(truncated, bytes[..^10]); Throws<InvalidDataException>(() => CaseArchive.Load(truncated, default));
        });
        Check("out-of-range source timestamps are rejected", () =>
            Throws<InvalidDataException>(() => ReferenceValidation.Validate(project with { Info = project.Info with { SourceStartSeconds = 19.8 } })));
        File.WriteAllText(Path.Combine(directory, "summary.json"), JsonSerializer.Serialize(new { passed = count, realFilesTouched = false }));
        return count;

        void Check(string name, Action action) { action(); count++; Console.WriteLine("PASS archive: " + name); }
    }

    private static void Rewrite(string source, string destination, string entryName, Func<byte[], byte[]> replace)
    {
        using var input = ZipFile.OpenRead(source); using var output = ZipFile.Open(destination, ZipArchiveMode.Create);
        foreach (var entry in input.Entries)
        {
            using var bytes = new MemoryStream(); using (var stream = entry.Open()) stream.CopyTo(bytes);
            using var target = output.CreateEntry(entry.FullName, CompressionLevel.Fastest).Open();
            target.Write(entry.FullName == entryName ? replace(bytes.ToArray()) : bytes.ToArray());
        }
    }
    internal static void Assert(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
    internal static void Throws<T>(Action action) where T : Exception
    { try { action(); } catch (T) { return; } throw new InvalidOperationException("Expected " + typeof(T).Name); }
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool CreateHardLink(string fileName, string existingFileName, IntPtr securityAttributes);
}
