using System.Text.Json;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;

// Neutral reference for a short listening check of note selection only.
// No user timbre, UI, device or network. Not presented as timbre reconstruction.
if (args.Length != 2) throw new ArgumentException("PianoCheck <events.json> <new-output.wav>");
if (File.Exists(args[1])) throw new IOException("Preserve existing listening output; choose a new path.");
var settings = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
var input = JsonSerializer.Deserialize<Input>(File.ReadAllText(args[0]), settings)
    ?? throw new InvalidDataException("Missing event input.");
if (!double.IsFinite(input.DurationSeconds) || input.DurationSeconds is <= 0 or > 8 ||
    input.Events.Length is < 1 or > 400) throw new InvalidDataException("Short checks require1--400notes and at most8s.");
const int rate = PianoReference.SampleRate;
float[] mix = new float[(int)Math.Round(input.DurationSeconds * rate) * 2];
foreach (var item in input.Events)
{
    if (item.Midi is < 21 or > 108 || !double.IsFinite(item.StartSeconds) || item.StartSeconds < 0 ||
        !double.IsFinite(item.DurationSeconds) || item.DurationSeconds is < .1 or > 8 ||
        !double.IsFinite(item.Velocity) || item.Velocity is <= 0 or > 1)
        throw new InvalidDataException("Invalid reference event; do not silently alter pitches or durations.");
    var clip = PianoReference.Render(item.Midi, item.DurationSeconds);
    int start = (int)Math.Round(item.StartSeconds * rate);
    for (int frame = 0; frame < clip.FrameCount && start + frame < mix.Length / 2; frame++)
    {
        float value = (float)(clip.Samples[frame] * item.Velocity);
        mix[(start + frame) * 2] += value;
        mix[(start + frame) * 2 + 1] += value;
    }
}
double before = mix.Max(value => Math.Abs(value));
if (before < 1e-8 || mix.Any(value => !float.IsFinite(value))) throw new InvalidDataException("Invalid/silent output.");
double gain = Math.Min(1, .8 / before);
for (int frame = 0; frame < mix.Length / 2; frame++)
{
    double edge = Math.Min(1, Math.Min(frame, mix.Length / 2 - 1 - frame) / 96d);
    mix[frame * 2] *= (float)(gain * edge); mix[frame * 2 + 1] *= (float)(gain * edge);
}
await PcmWaveExporter.ExportAsync(new PcmClip(rate, 2, mix, "旋律核对 · 钢琴参考"), args[1]);
Console.WriteLine(JsonSerializer.Serialize(new { Notes = input.Events.Length, DurationSeconds = input.DurationSeconds,
    Gain = gain, Peak = mix.Max(value => Math.Abs(value)), Purpose = "Neutral melody check, not timbre recreation" }));

internal sealed record Input(double DurationSeconds, Note[] Events);
internal sealed record Note(double StartSeconds, double DurationSeconds, int Midi, double Velocity = .75);
