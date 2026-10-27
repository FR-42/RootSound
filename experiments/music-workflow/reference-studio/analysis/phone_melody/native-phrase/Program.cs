using System.Security.Cryptography;
using System.Text.Json;
using RootSound.PhraseStudio.Audio;
using RootSound.PhraseStudio.Core;
using RootSound.PhraseStudio.Persistence;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;

// Offline export using the same archive and playback implementations as Phrase Studio.
// No application entry points, windows or audio devices are opened.
if (args.Length != 3)
    throw new ArgumentException("NativePhrase <input.rstimbre> <events.json> <new-output-directory>");

string instrumentPath = Path.GetFullPath(args[0]);
string eventPath = Path.GetFullPath(args[1]);
string output = Path.GetFullPath(args[2]);
Require(!Directory.Exists(output) || !Directory.EnumerateFileSystemEntries(output).Any(),
    "Output must be a new or empty directory; existing artifacts are never overwritten.");
var options = new JsonSerializerOptions { WriteIndented = true, PropertyNameCaseInsensitive = true,
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
var input = JsonSerializer.Deserialize<MelodyInput>(File.ReadAllText(eventPath), options)
    ?? throw new InvalidDataException("Missing event document.");
Require(double.IsFinite(input.DurationSeconds) && input.DurationSeconds is > 0 and <= 60,
    "durationSeconds must be finite and between 0 and 60.");
Require(input.Events is { Length: > 0 and <= PhraseValidation.MaximumNotes }, "No notes or too many notes.");
string instrumentHash = Hash(instrumentPath), eventHash = Hash(eventPath);
var timbre = await TimbreArchive.ImportAsync(instrumentPath);
double secondsPerTick = Timing.SecondsPerTick(input.Tempo);
Require(double.IsFinite(secondsPerTick) && secondsPerTick > 0, "Invalid tempo.");

var notes = new List<PhraseNote>();
var timingChecks = new List<object>();
double maxStartError = 0, maxEndError = 0, maxLengthError = 0;
foreach (var item in input.Events)
{
    Require(double.IsFinite(item.StartSeconds) && item.StartSeconds >= 0 &&
        double.IsFinite(item.DurationSeconds) && item.DurationSeconds > 0 &&
        item.StartSeconds + item.DurationSeconds <= input.DurationSeconds + 1e-8,
        "A note is outside durationSeconds or has invalid timing.");
    long start = checked((long)Math.Round(item.StartSeconds / secondsPerTick,
        MidpointRounding.AwayFromZero));
    long end = checked((long)Math.Round((item.StartSeconds + item.DurationSeconds) / secondsPerTick,
        MidpointRounding.AwayFromZero));
    Require(end > start, "Note is shorter than one timing tick; do not silently change it.");
    double startError = start * secondsPerTick - item.StartSeconds;
    double endError = end * secondsPerTick - item.StartSeconds - item.DurationSeconds;
    double lengthError = (end - start) * secondsPerTick - item.DurationSeconds;
    maxStartError = Math.Max(maxStartError, Math.Abs(startError));
    maxEndError = Math.Max(maxEndError, Math.Abs(endError));
    maxLengthError = Math.Max(maxLengthError, Math.Abs(lengthError));
    notes.Add(new PhraseNote(Guid.NewGuid(), item.Midi, start, end - start, item.Velocity));
    timingChecks.Add(new { item.Midi, RequestedStartSeconds = item.StartSeconds,
        RequestedDurationSeconds = item.DurationSeconds, StartTick = start, LengthTick = end - start,
        ActualStartSeconds = start * secondsPerTick, ActualDurationSeconds = (end - start) * secondsPerTick,
        StartErrorSeconds = startError, EndErrorSeconds = endError, LengthErrorSeconds = lengthError });
}
var channel = new PhraseChannel(Guid.NewGuid(), timbre.Name, timbre, EditorMode.PianoRoll,
    (int)Math.Round(timbre.Settings.RootMidi), 0, false, notes);
var document = new PhraseDocument(Guid.NewGuid(), input.Name, input.Tempo, input.Bars, [channel]);
PhraseValidation.Validate(document, requirePlayable: true, inspectSamples: true);
Require(Timing.DurationTicks(document) * secondsPerTick + 1e-8 >= input.DurationSeconds,
    "Bars do not cover the requested audio window.");
Directory.CreateDirectory(output);
string phrasePath = Path.Combine(output, "melody.rsphrase");
await PhraseArchive.SaveAsync(document, phrasePath);
var reopened = await PhraseArchive.LoadAsync(phrasePath);
var reopenedChannel = reopened.Channels.Single();
Require(reopened.Name == document.Name && reopened.Tempo == document.Tempo && reopened.Bars == document.Bars,
    "Phrase header did not round-trip exactly.");
Require(reopenedChannel.Notes.SequenceEqual(channel.Notes), "Notes did not round-trip exactly.");
Require(reopenedChannel.Timbre!.Settings == timbre.Settings, "Embedded instrument settings changed.");
Require(reopenedChannel.Timbre.Audio.Samples.SequenceEqual(timbre.Audio.Samples) &&
    reopenedChannel.Timbre.Audio.SampleRate == timbre.Audio.SampleRate &&
    reopenedChannel.Timbre.Audio.Channels == timbre.Audio.Channels,
    "Embedded instrument samples or format changed.");

int sampleRate = 48000;
int frames = checked((int)Math.Round(input.DurationSeconds * sampleRate, MidpointRounding.AwayFromZero));
float[] audio = new float[checked(frames * 2)];
var source = new PhraseMixSource(sampleRate) { Loop = false };
source.SetDocument(reopened, crossfade: false);
for (int frame = 0; frame < frames; frame += 1024)
{
    int amount = Math.Min(1024, frames - frame);
    Require(source.ReadFrames(frame, audio.AsSpan(frame * 2, amount * 2)) == amount,
        "Playback renderer did not fill the requested buffer.");
}
Require(audio.All(float.IsFinite), "Nonfinite audio.");
double peak = audio.Max(value => Math.Abs((double)value));
double rms = Math.Sqrt(audio.Sum(value => (double)value * value) / audio.Length);
Require(peak is > 1e-6 and <= 1, "Rendered audio is silent or exceeds the protected range.");
var clip = new PcmClip(sampleRate, 2, audio, input.Name);
string wavePath = Path.Combine(output, "melody-render.wav");
await PcmWaveExporter.ExportAsync(clip, wavePath);
Require(Hash(instrumentPath) == instrumentHash && Hash(eventPath) == eventHash, "An input file changed.");

var report = new
{
    InputInstrument = instrumentPath, InputInstrumentSha256 = instrumentHash, InputInstrumentUnchanged = true,
    InputEvents = eventPath, InputEventsSha256 = eventHash, InputEventsUnchanged = true,
    Format = "RootSound.Phrase", NoteCount = notes.Count,
    document.Name, document.Tempo, document.Bars, TimingPpq = Timing.Ppq,
    RequestedDurationSeconds = input.DurationSeconds, RenderedFrames = frames, RenderedDurationSeconds = frames / (double)sampleRate,
    PhraseDurationSeconds = Timing.DurationTicks(document) * secondsPerTick,
    RenderingUsesActualPhraseEngine = true, NoGridQuantization = true,
    EmbeddedSamplesExact = true, EmbeddedSettingsExact = true, NotesRoundtripExact = true,
    PortableNoExternalDependency = true,
    MaximumStartRoundingErrorSeconds = maxStartError, MaximumEndRoundingErrorSeconds = maxEndError,
    MaximumLengthRoundingErrorSeconds = maxLengthError,
    Audio = new { SampleRate = sampleRate, Channels = 2, Peak = peak, Rms = rms, AllFinite = true,
        FirstFrame = audio.Take(2), LastFrame = audio.TakeLast(2) },
    Timings = timingChecks,
    Outputs = new { Phrase = phrasePath, PhraseSha256 = Hash(phrasePath), Wave = wavePath, WaveSha256 = Hash(wavePath) },
    MusicalAccuracyIsNotEstablishedByTheseTechnicalChecks = true
};
string reportPath = Path.Combine(output, "native-verification.json");
await File.WriteAllTextAsync(reportPath, JsonSerializer.Serialize(report, options));
Console.WriteLine(JsonSerializer.Serialize(new { Report = reportPath, Notes = notes.Count,
    Peak = peak, DurationSeconds = frames / (double)sampleRate,
    MaximumStartRoundingErrorSeconds = maxStartError, InputInstrumentUnchanged = true }, options));

static string Hash(string path)
{
    using var stream = File.OpenRead(path);
    return Convert.ToHexString(SHA256.HashData(stream));
}
static void Require(bool condition, string message)
{
    if (!condition) throw new InvalidDataException(message);
}
internal sealed record MelodyInput(string Name, double Tempo, int Bars, double DurationSeconds, MelodyEvent[] Events);
internal sealed record MelodyEvent(double StartSeconds, double DurationSeconds, int Midi, double Velocity = .85);
