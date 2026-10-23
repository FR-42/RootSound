using System.Drawing;
using System.Drawing.Imaging;
using RootSound.TimbreLab.Audio;
using RootSound.TimbreLab.Controls;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;
using RootSound.TimbreLab.Processing;

namespace RootSound.TimbreLab.Tests;

internal static class WorkflowChecks
{
    public static int Run(string directory)
    {
        Directory.CreateDirectory(directory);
        int passed = 0;
        void Check(string name, Action check) { check(); passed++; Console.WriteLine("PASS workflow: " + name); }
        void Require(bool value, string message) { if (!value) throw new InvalidOperationException(message); }
        const int rate = 16000;
        PcmClip Make(string name, double interfering, double pitch = 220)
        {
            float[] samples = new float[rate];
            for (int i = 0; i < samples.Length; i++)
            {
                double t = i / (double)rate;
                double fade = Math.Min(1, i / 80d) * Math.Min(1, (samples.Length - 1 - i) / 80d);
                samples[i] = (float)(fade * (.4 * Math.Sin(2 * Math.PI * pitch * t) + .14 * Math.Sin(4 * Math.PI * pitch * t) + .12 * Math.Sin(2 * Math.PI * interfering * t)));
            }
            return new PcmClip(rate, 1, samples, name);
        }
        var primary = Make("主采样", 771);
        var reference = Make("参考", 1137, 330);
        var workspace = new SampleWorkspace();
        ProcessingResult? result = null;
        Check("references change the result without changing either imported sample", () =>
        {
            var before = primary.Samples.ToArray(); var beforeRef = reference.Samples.ToArray();
            workspace.Add(new SampleEntry(primary, null)); workspace.Add(new SampleEntry(reference, null));
            long revision = workspace.Revision;
            result = SampleProcessor.Process(primary, workspace.References(), new CleanupSettings(.1, .8, .2, 30, 7000, 57));
            Require(workspace.TryApply(revision, result) && workspace.IsCurrent, "processed snapshot was not committed");
            Require(primary.Samples.SequenceEqual(before) && reference.Samples.SequenceEqual(beforeRef), "imported source was modified");
            Require(!result.Audio.Samples.SequenceEqual(primary.Samples), "cleaning did not affect the controlled mix");
        });
        Check("a late processing completion cannot replace a newer primary or deleted session", () =>
        {
            long old = workspace.Revision;
            workspace.SetPrimary(1);
            Require(!workspace.TryApply(old, result!) && !workspace.IsCurrent, "stale processing replaced the primary");
            workspace.Remove(0);
            Require(workspace.Primary?.Clip == reference && workspace.PrimaryIndex == 0, "removing reference changed primary identity");
            long removed = workspace.Revision; workspace.Clear();
            Require(!workspace.TryApply(removed, result!) && workspace.Primary is null && workspace.Result is null, "cleared session was revived");
        });
        Check("trim preserves exact sample frames and keeps attack margins", () =>
        {
            float[] data = new float[8000]; for (int i = 1000; i < 5000; i++) data[i] = .25f;
            var clip = new PcmClip(8000, 1, data, "空白边缘");
            var range = ClipPreparation.FindAudibleRange(clip);
            Require(range.Start < 1000 && range.End > 5000 && range.Start > 900 && range.End < 5100, "silence trim removed attack margin");
            var trim = ClipPreparation.Trim(clip, 1000, 5000);
            Require(trim.FrameCount == 4000 && trim.Samples.All(x => x == .25f) && data.Length == 8000, "trim interval differs");
        });
        Check("processed sound can be looped, retuned, saved, reopened and exported", () =>
        {
            var audio = result!.Audio;
            var loop = LoopFinder.Find(audio, 57) ?? throw new InvalidOperationException("controlled harmonic sound has no loop");
            var patch = new InstrumentPatch(audio, new InstrumentSettings(57, .008, .1, .75, .18, true, loop.Start, loop.End, loop.CrossfadeSeconds, -2), "打磨音色");
            var rendered = InstrumentRenderer.Render(patch, 69, 1.7);
            Require(rendered.FrameCount > audio.FrameCount && rendered.Samples.All(float.IsFinite), "instrument did not sustain beyond the clip");
            string archive = Path.Combine(directory, "打磨音色.rstimbre");
            TimbreArchive.ExportAsync(patch, archive).GetAwaiter().GetResult();
            var reopened = TimbreArchive.ImportAsync(archive).GetAwaiter().GetResult();
            var again = InstrumentRenderer.Render(reopened, 69, 1.7);
            Require(rendered.Samples.SequenceEqual(again.Samples) && reopened.Settings == patch.Settings, "reopened instrument changed performance");
            string wav = Path.Combine(directory, "处理后.wav");
            PcmWaveExporter.ExportAsync(reopened.Audio, wav).GetAwaiter().GetResult();
            var imported = Task.Run(() => ImportBridge.ImportAsync(wav)).GetAwaiter().GetResult();
            Require(imported.SampleRate == audio.SampleRate && imported.FrameCount == audio.FrameCount, "WAV is not accepted by the import workflow");
            Require(imported.Samples.Zip(audio.Samples).Max(x => Math.Abs(x.First - x.Second)) < 0.000001, "WAV export differs from processed audio");
        });
        Check("export protection refuses original paths and filesystem aliases", () =>
        {
            string source = Path.Combine(directory, "受保护.wav"); File.WriteAllBytes(source, [1, 2, 3, 4]);
            var guard = new SourceProtection(); guard.Remember(source);
            bool refused = false;
            try { guard.CheckDestination(source); } catch (IOException) { refused = true; }
            Require(refused && File.ReadAllBytes(source).SequenceEqual(new byte[] { 1, 2, 3, 4 }), "original path was not protected");
            guard.CheckDestination(Path.Combine(directory, "新文件.wav"));
            string different = Path.Combine(directory, "别的文件.wav"); File.WriteAllBytes(different, [1, 2, 3, 4]);
            guard.CheckDestination(different);
            // The identity check is exercised separately from the path comparison.
            var field = typeof(SourceProtection).GetField("_sources", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!;
            var entries = (System.Collections.IList)field.GetValue(guard)!;
            var pair = entries[0]!;
            var item2 = pair.GetType().GetField("Item2")!.GetValue(pair);
            var fabricatedPair = Activator.CreateInstance(pair.GetType(), Path.Combine(directory, "renamed-source.wav"), item2)!;
            entries[0] = fabricatedPair;
            refused = false; try { guard.CheckDestination(source); } catch (IOException) { refused = true; }
            Require(refused, "file identity guard was bypassed by a different pathname");
        });
        Check("offscreen waveform and loop positions render without a screen or window", () =>
        {
            using var graph = new SampleGraph { Size = new Size(1000, 300) };
            graph.SetAudio(primary, result!.Audio);
            graph.SetLoop(true, 4000, 12000);
            using var bitmap = new Bitmap(1000, 300);
            using (var graphics = Graphics.FromImage(bitmap)) graph.DrawGraph(graphics);
            Require(!graph.IsHandleCreated, "offscreen drawing created a native graph window");
            int x1 = 16 + (1000 - 32) * 4000 / rate, x2 = 16 + (1000 - 32) * 12000 / rate;
            Require(bitmap.GetPixel(x1, 30).B > 180 && bitmap.GetPixel(x2, 30).B > 180, "loop markers have incorrect time mapping");
            bitmap.Save(Path.Combine(directory, "清理与延音.png"), ImageFormat.Png);
        });
        return passed;
    }
}
