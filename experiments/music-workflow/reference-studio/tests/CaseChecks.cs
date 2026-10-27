using System.Security.Cryptography;
using System.Text.Json;
using RootSound.ReferenceStudio.Audio;
using RootSound.ReferenceStudio.Persistence;
using RootSound.SampleEditor.Audio;

namespace RootSound.ReferenceStudio.Tests;

internal static class CaseChecks
{
    internal static int Run(string directory, string casePath)
    {
        Directory.CreateDirectory(directory); int count = 0;
        var project = CaseArchive.LoadAsync(casePath).GetAwaiter().GetResult();
        Check("real case has editable notes and explicitly attributed layers", () =>
        {
            PersistenceChecks.Assert(project.Phrase.Channels.Count >= 3, "At least three distinct layers.");
            PersistenceChecks.Assert(project.Phrase.Channels.All(c => c.Timbre is not null && c.Notes.Count > 0), "Every layer has notes/timbre.");
            PersistenceChecks.Assert(project.Layers.All(l => l.Origin.Contains("合成") || l.Origin.Contains("重建") || l.Origin.Contains("截取") || (l.Origin.Contains("模型") && l.Origin.Contains("估计"))), "Provenance explicit.");
        });
        string saved = Path.Combine(directory, "Vulcanus-copy.rscase");
        Check("prepared case saves and reopens self-contained", () =>
        {
            CaseArchive.SaveAsync(project, saved).GetAwaiter().GetResult(); var restored = CaseArchive.LoadAsync(saved).GetAwaiter().GetResult();
            PersistenceChecks.Assert(project.Reference.Samples.SequenceEqual(restored.Reference.Samples), "Reference preserved.");
            PersistenceChecks.Assert(project.Phrase.Channels.SelectMany(c => c.Notes).SequenceEqual(restored.Phrase.Channels.SelectMany(c => c.Notes)), "Notes preserved.");
        });
        var rendered = ReferenceRenderer.Render(project);
        Check("actual case renders a finite nonempty reconstruction", () =>
        {
            PersistenceChecks.Assert(rendered.FrameCount == project.Reference.FrameCount, "Aligned duration.");
            PersistenceChecks.Assert(rendered.Samples.All(float.IsFinite) && rendered.Samples.Max(Math.Abs) < 1, "Finite controlled peaks.");
            PersistenceChecks.Assert(rendered.Samples.Any(s => Math.Abs(s) > .01), "Audible signal.");
        });
        Check("changing a layer's note pitch changes the rendered result", () =>
        {
            var channel = project.Phrase.Channels.First(c => c.Notes.Count > 0);
            var changed = channel with { Notes = channel.Notes.Select(n => n with { Pitch = Math.Min(127, n.Pitch + 3) }).ToArray() };
            var edit = project with { Phrase = project.Phrase with { Channels = project.Phrase.Channels.Select(c => c.Id == changed.Id ? changed : c).ToArray() } };
            var next = ReferenceRenderer.Render(edit);
            double difference = next.Samples.Zip(rendered.Samples).Sum(p => Math.Abs(p.First - p.Second)) / next.Samples.Length;
            PersistenceChecks.Assert(difference > .0001, "A note edit affects reconstruction.");
        });
        Check("exported reconstruction is an independent 24-bit WAV", () =>
        {
            string destination = Path.Combine(directory, "我的版本.wav");
            ReferenceRenderer.ExportAsync(project, destination).GetAwaiter().GetResult();
            using var input = new FileStream(destination, FileMode.Open, FileAccess.Read, FileShare.Read);
            var layout = WaveDecoder.TryRead(input)!;
            PersistenceChecks.Assert(layout.Format.Bits == 24 && layout.Format.Channels == 2 && layout.FrameCount == rendered.FrameCount, "WAV format and duration.");
        });
        if (project.Info.SourcePath is { } original && File.Exists(original))
            Check("original excerpt and file fingerprint match the supplied source", () =>
            {
                using var input = new FileStream(original, FileMode.Open, FileAccess.Read, FileShare.Read);
                string hash = Convert.ToHexString(SHA256.HashData(input));
                PersistenceChecks.Assert(hash.Equals(project.Info.SourceSha256, StringComparison.OrdinalIgnoreCase), "Original untouched.");
                input.Position = 0; var layout = WaveDecoder.TryRead(input)!;
                PersistenceChecks.Assert(layout.Format.SampleRate == 48000 && layout.Format.Channels == 2 && layout.Format.FloatingPoint, "Source format.");
                long start = (long)Math.Round(project.Info.SourceStartSeconds * 48000);
                // This actual source is an ordinary single-data-block float WAV; compare every reference frame.
                PersistenceChecks.Assert(layout.Data.Count == 1, "Single data block.");
                input.Position = layout.Data[0].Offset + start * 8;
                byte[] bytes = new byte[project.Reference.Samples.Length * 4]; input.ReadExactly(bytes);
                for (int i = 0; i < project.Reference.Samples.Length; i++)
                    PersistenceChecks.Assert(BitConverter.ToSingle(bytes, i * 4) == project.Reference.Samples[i], "Reference is the original excerpt.");
            });
        File.WriteAllText(Path.Combine(directory, "summary.json"), JsonSerializer.Serialize(new
        {
            project.Info.Title, project.Info.SourceStartSeconds, project.DurationSeconds, project.Phrase.Tempo,
            layers = project.Phrase.Channels.Select(c => new { c.Name, notes = c.Notes.Count }),
            referenceRms = Math.Sqrt(project.Reference.Samples.Average(s => (double)s * s)),
            reconstructionRms = Math.Sqrt(rendered.Samples.Average(s => (double)s * s)),
            subjectiveSimilarityVerified = false, passed = count
        }, new JsonSerializerOptions { WriteIndented = true }));
        return count;
        void Check(string name, Action action) { action(); count++; Console.WriteLine("PASS real case: " + name); }
    }
}
