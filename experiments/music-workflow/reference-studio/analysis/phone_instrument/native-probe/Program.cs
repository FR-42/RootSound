using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text.Json;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;
using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Persistence;
using RootSound.PhraseStudio.Audio;

// Offline experiment helper. It deliberately has no UI, audio-device, network or application-build code.
if (args.Length < 1) throw new ArgumentException("create <float.wav> <settings.json> <output.rstimbre> <name> | verify <input.rstimbre> <output-directory>");
var jsonOptions = new JsonSerializerOptions { WriteIndented = true };
if (args[0] == "create")
{
    if (args.Length != 5) throw new ArgumentException("create <float.wav> <settings.json> <output.rstimbre> <name>");
    var settings = JsonSerializer.Deserialize<InstrumentSettings>(File.ReadAllText(args[2])) ?? throw new InvalidDataException("settings missing");
    var audio = ReadFloatWave(args[1], args[4]);
    var patch = new InstrumentPatch(audio, settings, args[4]);
    await TimbreArchive.ExportAsync(patch, args[3], overwrite: false);
    var opened = await TimbreArchive.ImportAsync(args[3]);
    Require(opened.Settings == settings && opened.Audio.Samples.SequenceEqual(audio.Samples), "native archive changed settings or samples");
    Console.WriteLine(JsonSerializer.Serialize(new { Archive = Path.GetFullPath(args[3]), FrameCount = audio.FrameCount, audio.SampleRate, audio.Channels,
        NativeLoopSuggestion = LoopFinder.Find(audio, settings.RootMidi), NativeRoundtripExact = true }, jsonOptions));
    return;
}
if (args[0] != "verify" || args.Length != 3) throw new ArgumentException("verify <input.rstimbre> <output-directory>");
string archive = Path.GetFullPath(args[1]), output = Path.GetFullPath(args[2]);
Directory.CreateDirectory(output);
var inputHash = Hash(archive);
var imported = await TimbreArchive.ImportAsync(archive);
int root = (int)Math.Round(imported.Settings.RootMidi);
var checks = new List<object>();
int[] pitches = [Math.Clamp(root - 2, 0, 127), root, Math.Clamp(root + 2, 0, 127), Math.Clamp(root + 5, 0, 127)];
var audition = new List<float>();
foreach (int pitch in pitches)
{
    double hold = .35;
    var sound = InstrumentRenderer.Render(imported, pitch, hold);
    ValidateSound(sound);
    checks.Add(new { Kind = "native-render", Pitch = pitch, HeldSeconds = hold, sound.FrameCount, Statistics = Stats(sound),
        LoopBoundary = LoopBoundaryStatistics(sound, imported, pitch) });
    audition.AddRange(sound.Samples);
    audition.AddRange(new float[(int)(.16 * sound.SampleRate) * sound.Channels]);
}
string keyPreview = Path.Combine(output, "键盘移调测试.wav");
await PcmWaveExporter.ExportAsync(new PcmClip(imported.Audio.SampleRate, imported.Audio.Channels, audition.ToArray(), "键盘移调测试"), keyPreview);
var sustained = InstrumentRenderer.Render(imported, root, 2);
ValidateSound(sustained);
string heldPreview = Path.Combine(output, "原音高长按测试.wav");
await PcmWaveExporter.ExportAsync(sustained, heldPreview);
checks.Add(new { Kind = "native-held", Pitch = root, HeldSeconds = 2, sustained.FrameCount, Statistics = Stats(sustained),
    LoopBoundary = LoopBoundaryStatistics(sustained, imported, root) });

// Exercise the real phrase importer, embedded portable archive and playback renderer, without opening either app.
var channel = new PhraseChannel(Guid.NewGuid(), imported.Name, imported, EditorMode.PianoRoll, root, 0, false,
    pitches.Select((pitch, index) => new PhraseNote(Guid.NewGuid(), pitch, index * 960L, 600, .85)).ToArray());
var doc = new PhraseDocument(Guid.NewGuid(), imported.Name + " · 键盘测试", 120, 1, [channel]);
PhraseValidation.Validate(doc, requirePlayable: true, inspectSamples: true);
string phrase = Path.Combine(output, "可编辑键盘测试.rsphrase");
await PhraseArchive.SaveAsync(doc, phrase);
var reopened = await PhraseArchive.LoadAsync(phrase);
Require(reopened.Channels[0].Timbre!.Audio.Samples.SequenceEqual(imported.Audio.Samples), "phrase embedded sample changed");
Require(reopened.Channels[0].Timbre!.Settings == imported.Settings, "phrase embedded settings changed");
Require(reopened.Channels[0].Notes.SequenceEqual(channel.Notes), "phrase note roundtrip changed");
var mix = new PhraseMixSource(imported.Audio.SampleRate) { Loop = false };
mix.SetDocument(reopened, crossfade: false);
int phraseFrames = (int)Math.Ceiling((2.2 + imported.Settings.ReleaseSeconds) * imported.Audio.SampleRate);
float[] phraseSamples = new float[phraseFrames * 2];
for (int frame = 0; frame < phraseFrames; frame += 1024)
    mix.ReadFrames(frame, phraseSamples.AsSpan(frame * 2, Math.Min(1024, phraseFrames - frame) * 2));
var phraseAudio = new PcmClip(imported.Audio.SampleRate, 2, phraseSamples, "乐句模块实际渲染");
ValidateSound(phraseAudio);
await PcmWaveExporter.ExportAsync(phraseAudio, Path.Combine(output, "乐句模块实际渲染.wav"));
checks.Add(new { Kind = "phrase-archive-native-playback", EmbeddedSamplesExact = true, EmbeddedSettingsExact = true,
    NotesExact = true, PortableNoExternalPath = true, Statistics = Stats(phraseAudio) });

var suggestion = LoopFinder.Find(imported.Audio, imported.Settings.RootMidi);
string roundtrip = Path.Combine(output, "原生格式往返验证.rstimbre");
await TimbreArchive.ExportAsync(imported, roundtrip);
var reread = await TimbreArchive.ImportAsync(roundtrip);
Require(reread.Audio.Samples.SequenceEqual(imported.Audio.Samples) && reread.Settings == imported.Settings, "native archive roundtrip failed");
Require(inputHash == Hash(archive), "input archive was modified");
var report = new { InputArchive = archive, InputSha256 = inputHash, InputUnchanged = true, Format = "RootSound.Timbre/1",
    imported.Name, imported.Audio.SampleRate, imported.Audio.Channels, imported.Audio.FrameCount, imported.Audio.DurationSeconds,
    imported.Settings, NativeLoopSuggestion = suggestion, ArchiveRoundtripExact = true,
    AuditionIsKeyboardTestNotOriginalMelody = true, Checks = checks, Outputs = new { KeyPreview = keyPreview, HeldPreview = heldPreview, Phrase = phrase } };
string reportPath = Path.Combine(output, "native-verification.json");
await File.WriteAllTextAsync(reportPath, JsonSerializer.Serialize(report, jsonOptions));
Console.WriteLine(JsonSerializer.Serialize(new { Report = reportPath, Passed = checks.Count, InputUnchanged = true }, jsonOptions));

static string Hash(string path) { using var stream = File.OpenRead(path); return Convert.ToHexString(SHA256.HashData(stream)); }
static void Require(bool condition, string message) { if (!condition) throw new InvalidDataException(message); }
static void ValidateSound(PcmClip sound)
{
    Require(sound.Samples.All(float.IsFinite), "nonfinite rendered sample");
    Require(sound.Samples.Max(value => Math.Abs(value)) is > 1e-6f and <= 1, "rendered output silent or unprotected");
    Require(sound.Samples.Take(sound.Channels).All(value => Math.Abs(value) < 1e-7), "nonzero onset endpoint");
    Require(sound.Samples.TakeLast(sound.Channels).All(value => Math.Abs(value) < 1e-6), "nonzero release endpoint");
}
static object Stats(PcmClip clip)
{
    double sum = 0, peak = 0, maxStep = 0;
    for (int i = 0; i < clip.Samples.Length; i++)
    {
        double value = clip.Samples[i]; sum += value * value; peak = Math.Max(peak, Math.Abs(value));
        if (i >= clip.Channels) maxStep = Math.Max(maxStep, Math.Abs(value - clip.Samples[i - clip.Channels]));
    }
    return new { Peak = peak, Rms = Math.Sqrt(sum / clip.Samples.Length), MaximumAdjacentSampleStep = maxStep,
        Finite = clip.Samples.All(float.IsFinite), FirstFrame = clip.Samples.Take(clip.Channels).ToArray(), LastFrame = clip.Samples.TakeLast(clip.Channels).ToArray() };
}
static object? LoopBoundaryStatistics(PcmClip rendered, InstrumentPatch patch, int pitch)
{
    if (!patch.Settings.LoopEnabled) return null;
    double step = Math.Pow(2, (pitch - patch.Settings.RootMidi) / 12.0);
    double crossfade = patch.Settings.LoopCrossfadeSeconds * patch.Audio.SampleRate;
    double cycle = patch.Settings.LoopEnd - patch.Settings.LoopStart - crossfade;
    var boundaries = new List<object>();
    for (double position = patch.Settings.LoopEnd; position / step < rendered.FrameCount; position += cycle)
    {
        int center = (int)Math.Round(position / step); double maxStep = 0;
        for (int frame = Math.Max(1, center - 4); frame <= Math.Min(rendered.FrameCount - 1, center + 4); frame++)
            for (int channel = 0; channel < rendered.Channels; channel++)
                maxStep = Math.Max(maxStep, Math.Abs(rendered.Samples[frame * rendered.Channels + channel] - rendered.Samples[(frame - 1) * rendered.Channels + channel]));
        boundaries.Add(new { Frame = center, MaximumAdjacentSampleStepInNineFrames = maxStep });
        if (boundaries.Count == 1000) break;
    }
    return new { DiagnosticOnlyNotAuditoryGuarantee = true, Boundaries = boundaries };
}
static PcmClip ReadFloatWave(string path, string name)
{
    using var stream = File.OpenRead(path); using var reader = new BinaryReader(stream);
    Require(new string(reader.ReadChars(4)) == "RIFF", "requires RIFF WAV"); reader.ReadUInt32();
    Require(new string(reader.ReadChars(4)) == "WAVE", "requires WAVE");
    ushort format = 0, channels = 0, bits = 0; int rate = 0; byte[]? data = null;
    while (stream.Position + 8 <= stream.Length)
    {
        string chunk = new(reader.ReadChars(4)); uint size = reader.ReadUInt32(); long next = stream.Position + size + (size & 1);
        Require(size <= int.MaxValue && next <= stream.Length + 1, "invalid WAV chunk");
        if (chunk == "fmt ")
        {
            format = reader.ReadUInt16(); channels = reader.ReadUInt16(); rate = reader.ReadInt32();
            reader.ReadUInt32(); reader.ReadUInt16(); bits = reader.ReadUInt16();
            if (format == 0xfffe && size >= 40) { reader.ReadUInt16(); reader.ReadUInt16(); reader.ReadUInt32(); format = reader.ReadUInt16(); }
        }
        else if (chunk == "data") data = reader.ReadBytes((int)size);
        stream.Position = next;
    }
    Require(format == 3 && bits == 32 && data is not null && data.Length % (channels * 4) == 0, "create expects 32-bit float WAV");
    float[] samples = new float[data!.Length / 4];
    for (int i = 0; i < samples.Length; i++) samples[i] = BinaryPrimitives.ReadSingleLittleEndian(data.AsSpan(i * 4));
    return new PcmClip(rate, channels, samples, name);
}
