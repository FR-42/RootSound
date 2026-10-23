using System.Buffers.Binary;
using System.Runtime.InteropServices;
using RootSound.SampleEditor.Audio;

namespace RootSound.SampleEditor.Tests;

internal static class AudioChecks
{
    internal static int Run(string directory)
    {
        directory = Path.Combine(directory, "run-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(directory);
        int count = 0;
        Check("all PCM widths decode their signed endpoints and preserve the source", () =>
        {
            foreach (int bits in new[] { 8, 16, 24, 32 })
            {
                string path = Path.Combine(directory, $"pcm-{bits}.wav");
                byte[] pcm = bits switch
                {
                    8 => [0, 64, 128, 192, 255],
                    16 => [0, 128, 0, 192, 0, 0, 0, 64, 255, 127],
                    24 => [0, 0, 128, 0, 0, 192, 0, 0, 0, 0, 0, 64, 255, 255, 127],
                    _ => [0, 0, 0, 128, 0, 0, 0, 192, 0, 0, 0, 0, 0, 0, 0, 64, 255, 255, 255, 127]
                };
                WriteWave(path, bits, false, 1, 32000, pcm);
                byte[] original = File.ReadAllBytes(path);
                using var audio = Import(path);
                Require(audio.SampleRate == 32000 && audio.Channels == 1 && audio.FrameCount == 5, "original format");
                float[] samples = new float[7];
                Require(audio.ReadFrames(0, samples) == 5, "frame count");
                Near(samples[0], -1); Near(samples[1], -.5f); Near(samples[2], 0); Near(samples[3], .5f);
                Require(samples[4] >= .99f && samples[5] == 0 && samples[6] == 0, "positive endpoint and zero-fill");
                Require(File.ReadAllBytes(path).SequenceEqual(original), "source unchanged");
            }
        });
        Check("float32 and float64 decode without integer quantization", () =>
        {
            foreach (int bits in new[] { 32, 64 })
            {
                string path = Path.Combine(directory, $"float-{bits}.wav");
                float[] wanted = [-1.25f, -.33333334f, 0, .12345679f, 1.25f];
                byte[] bytes = new byte[wanted.Length * (bits / 8)];
                for (int i = 0; i < wanted.Length; i++)
                    if (bits == 32) BinaryPrimitives.WriteSingleLittleEndian(bytes.AsSpan(i * 4), wanted[i]);
                    else BinaryPrimitives.WriteDoubleLittleEndian(bytes.AsSpan(i * 8), wanted[i]);
                WriteWave(path, bits, true, 1, 48000, bytes);
                using var audio = Import(path);
                float[] actual = new float[wanted.Length];
                audio.ReadFrames(0, actual);
                Require(actual.SequenceEqual(wanted), "float values exact");
            }
        });
        Check("extensible float recorder output including unknown chunks imports", () =>
        {
            string path = Path.Combine(directory, "recorder-float.wav");
            WriteWave(path, 32, true, 2, 48000, FloatBytes([.25f, -.5f, .75f, -.25f]), extensible: true, junk: true);
            using var audio = Import(path);
            Require(audio.FrameCount == 2 && audio.ChannelMask == 3, "extensible layout");
            float[] samples = new float[4];
            audio.ReadFrames(0, samples);
            Require(samples.SequenceEqual(new[] { .25f, -.5f, .75f, -.25f }), "interleaved samples");
        });
        Check("left-aligned valid PCM bits preserve the specified sample value", () =>
        {
            string path = Path.Combine(directory, "pcm-valid20.wav");
            WriteWave(path, 24, false, 1, 44100, [15, 0, 64, 15, 0, 192], extensible: true, validBits: 20);
            using var audio = Import(path);
            float[] samples = new float[2];
            audio.ReadFrames(0, samples);
            Near(samples[0], .5f); Near(samples[1], -.5f);
        });
        Check("two data chunks join frame-exactly across odd metadata padding", () =>
        {
            string path = Path.Combine(directory, "segments.wav");
            WriteWave(path, 16, false, 1, 44100, [0, 0, 0, 64]);
            using (var stream = new FileStream(path, FileMode.Open, FileAccess.ReadWrite))
            {
                stream.Position = stream.Length;
                using var writer = new BinaryWriter(stream, System.Text.Encoding.ASCII, true);
                writer.Write("LIST"u8); writer.Write(3u); writer.Write(new byte[] { 1, 2, 3, 0 });
                writer.Write("data"u8); writer.Write(2u); writer.Write((short)-16384);
                stream.Position = 4; writer.Write((uint)(stream.Length - 8));
            }
            using var audio = Import(path);
            float[] samples = new float[3];
            Require(audio.ReadFrames(0, samples) == 3, "joined length");
            Require(samples.SequenceEqual(new[] { 0f, .5f, -.5f }), "joined values");
        });
        Check("RF64 ds64 recorder-style header imports and validates 64-bit data length", () =>
        {
            string path = Path.Combine(directory, "rf64.wav");
            byte[] header = AudioExporter.BuildHeader(48000, 2, 2, 3);
            "RF64"u8.CopyTo(header); BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(4), uint.MaxValue);
            "ds64"u8.CopyTo(header.AsSpan(12));
            BinaryPrimitives.WriteUInt64LittleEndian(header.AsSpan(20), 108);
            BinaryPrimitives.WriteUInt64LittleEndian(header.AsSpan(28), 12);
            BinaryPrimitives.WriteUInt64LittleEndian(header.AsSpan(36), 2);
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(100), uint.MaxValue);
            File.WriteAllBytes(path, header.Concat(new byte[] { 0, 0, 64, 0, 0, 192, 0, 0, 0, 0, 0, 32 }).ToArray());
            using var audio = Import(path);
            float[] samples = new float[4];
            audio.ReadFrames(0, samples);
            Require(audio.FrameCount == 2 && samples.SequenceEqual(new[] { .5f, -.5f, 0, .25f }), "RF64 decoded");
        });
        Check("truncated chunks and incomplete frames fail without leaving temporary files", () =>
        {
            string cacheRoot = Path.Combine(directory, "invalid-cache"); Directory.CreateDirectory(cacheRoot);
            string path = Path.Combine(directory, "truncated.wav");
            WriteWave(path, 16, false, 2, 44100, [0, 0, 0]);
            Throws<InvalidDataException>(() => AudioImporter.Import(path, null, default, cacheRoot));
            Require(Directory.GetFileSystemEntries(cacheRoot).Length == 0, "partial frame cleanup");
            WriteWave(path, 16, false, 1, 44100, [0, 0]);
            byte[] truncated = File.ReadAllBytes(path); File.WriteAllBytes(path, truncated[..^1]);
            Throws<InvalidDataException>(() => AudioImporter.Import(path, null, default, cacheRoot));
            Require(Directory.GetFileSystemEntries(cacheRoot).Length == 0, "truncated cleanup");
        });
        Check("nonfinite float data rejects import atomically", () =>
        {
            string cacheRoot = Path.Combine(directory, "nonfinite-cache"); Directory.CreateDirectory(cacheRoot);
            string path = Path.Combine(directory, "invalid-float.wav");
            WriteWave(path, 32, true, 1, 44100, FloatBytes([float.NaN]));
            Throws<InvalidDataException>(() => AudioImporter.Import(path, null, default, cacheRoot));
            Require(Directory.GetFileSystemEntries(cacheRoot).Length == 0, "nonfinite cleanup");
        });
        Check("cancel during import cleans only its private temporary directory", () =>
        {
            string cacheRoot = Path.Combine(directory, "cancel-cache"); Directory.CreateDirectory(cacheRoot);
            string sentinel = Path.Combine(cacheRoot, "keep.txt"); File.WriteAllText(sentinel, "keep");
            string path = Path.Combine(directory, "cancel-import.wav");
            WriteWave(path, 16, false, 1, 44100, new byte[1024 * 1024]);
            using var cancellation = new CancellationTokenSource();
            Throws<OperationCanceledException>(() => AudioImporter.Import(path,
                new InlineProgress(_ => cancellation.Cancel()), cancellation.Token, cacheRoot));
            Require(Directory.GetFileSystemEntries(cacheRoot).SequenceEqual(new[] { sentinel }), "scoped cancellation cleanup");
        });
        Check("concurrent random readers preserve positions and zero-fill only trailing frames", () =>
        {
            string path = Path.Combine(directory, "random.wav");
            float[] values = Enumerable.Range(0, 4000).Select(x => x / 4096f).ToArray();
            WriteWave(path, 32, true, 2, 48000, FloatBytes(values));
            using var audio = Import(path);
            Parallel.For(0, 100, i =>
            {
                float[] samples = new float[40];
                Require(audio.ReadFrames(i * 10, samples) == 20, "random length");
                Require(samples.SequenceEqual(values.Skip(i * 20).Take(40)), "random values");
            });
            float[] tail = [9, 9, 9, 9, 9, 9];
            Require(audio.ReadFrames(1999, tail) == 1 && tail[2..].All(x => x == 0), "trailing zero fill");
            Require(audio.ReadFrames(2000, tail) == 0 && tail.All(x => x == 0), "EOF zero fill");
            Throws<ArgumentOutOfRangeException>(() => audio.ReadFrames(-1, tail));
            Throws<ArgumentOutOfRangeException>(() => audio.ReadFrames(2001, tail));
            Throws<ArgumentException>(() => audio.ReadFrames(0, new float[3]));
        });
        Check("disposing imported audio removes cache while an independent reader can finish", () =>
        {
            string cacheRoot = Path.Combine(directory, "dispose-cache"); Directory.CreateDirectory(cacheRoot);
            string path = Path.Combine(directory, "dispose.wav");
            WriteWave(path, 32, true, 1, 44100, FloatBytes([.75f]));
            var audio = AudioImporter.Import(path, null, default, cacheRoot);
            using (var reader = audio.OpenReader())
            {
                audio.Dispose(); audio.Dispose();
                float[] values = new float[1];
                Require(reader.ReadFrames(0, values) == 1 && values[0] == .75f, "reader independent lifetime");
                Throws<ObjectDisposedException>(() => audio.ReadFrames(0, values));
            }
            Require(!Directory.EnumerateFiles(cacheRoot, "*", SearchOption.AllDirectories).Any(), "cache removed");
        });
        Check("export selects exact frames and preserves sample rate, stereo order and source bytes", () =>
        {
            string path = Path.Combine(directory, "export-source.wav"), destination = Path.Combine(directory, "selection.wav");
            float[] values = [-.75f, .75f, -.5f, .5f, -.25f, .25f, 0, .125f];
            WriteWave(path, 32, true, 2, 32000, FloatBytes(values));
            byte[] original = File.ReadAllBytes(path);
            using var audio = Import(path);
            AudioExporter.Export(audio, 1, 3, destination, false, null, default);
            using var selected = Import(destination);
            Require(selected.FrameCount == 2 && selected.Channels == 2 && selected.SampleRate == 32000, "export format");
            float[] result = new float[4]; selected.ReadFrames(0, result);
            Require(result.SequenceEqual(values[2..6]), "selection exact");
            Require(File.ReadAllBytes(path).SequenceEqual(original), "original preserved");
        });
        Check("24-bit encoder handles clipping, midpoint rounding, and odd mono RIFF pad", () =>
        {
            byte[] pcm = new byte[21];
            AudioExporter.EncodePcm24([-2, -1, -.5f, 0, .5f, 1, 2], pcm);
            int[] wanted = [-8388608, -8388608, -4194304, 0, 4194304, 8388607, 8388607];
            for (int i = 0; i < wanted.Length; i++)
                Require(((pcm[i * 3] | pcm[i * 3 + 1] << 8 | pcm[i * 3 + 2] << 16) << 8 >> 8) == wanted[i], "PCM24 numerical endpoint");
            string path = Path.Combine(directory, "odd-source.wav"), destination = Path.Combine(directory, "odd-selection.wav");
            WriteWave(path, 32, true, 1, 48000, FloatBytes([.5f]));
            using var audio = Import(path);
            AudioExporter.Export(audio, 0, 1, destination, false, null, default);
            Require(new FileInfo(destination).Length == 108, "odd padding");
            using var result = Import(destination); Require(result.FrameCount == 1, "pad not a frame");
        });
        Check("export cancellation leaves an old destination untouched and removes staging", () =>
        {
            string path = Path.Combine(directory, "cancel-export-source.wav"), destination = Path.Combine(directory, "cancel-export.wav");
            WriteWave(path, 16, false, 1, 44100, new byte[512 * 1024]);
            File.WriteAllText(destination, "old bytes");
            using var audio = Import(path);
            using var cancel = new CancellationTokenSource();
            Throws<OperationCanceledException>(() => AudioExporter.Export(audio, 0, audio.FrameCount, destination, true,
                new InlineProgress(_ => cancel.Cancel()), cancel.Token));
            Require(File.ReadAllText(destination) == "old bytes", "old target exact");
            Require(!Directory.EnumerateFiles(directory, ".rootsound-sample-*").Any(), "no staging left");
        });
        Check("overwrite requires explicit choice and successful replace is atomic", () =>
        {
            string path = Path.Combine(directory, "overwrite-source.wav"), destination = Path.Combine(directory, "overwrite.wav");
            WriteWave(path, 32, true, 1, 44100, FloatBytes([.25f, -.5f]));
            File.WriteAllText(destination, "keep me");
            using var audio = Import(path);
            Throws<IOException>(() => AudioExporter.Export(audio, 0, 2, destination, false, null, default));
            Require(File.ReadAllText(destination) == "keep me", "no implicit overwrite");
            AudioExporter.Export(audio, 0, 2, destination, true, null, default);
            using var result = Import(destination); Require(result.FrameCount == 2, "replacement valid WAV");
        });
        Check("source path protection and selection validation precede any output writes", () =>
        {
            string path = Path.Combine(directory, "protected-source.wav"), destination = Path.Combine(directory, "must-not-exist.wav");
            WriteWave(path, 16, false, 1, 44100, [0, 0, 0, 0]);
            byte[] original = File.ReadAllBytes(path);
            using var audio = Import(path);
            Throws<IOException>(() => AudioExporter.Export(audio, 0, 1, path.ToUpperInvariant(), true, null, default));
            Throws<ArgumentOutOfRangeException>(() => AudioExporter.Export(audio, 1, 1, destination, false, null, default));
            Throws<ArgumentOutOfRangeException>(() => AudioExporter.Export(audio, -1, 1, destination, false, null, default));
            Throws<ArgumentOutOfRangeException>(() => AudioExporter.Export(audio, 0, 3, destination, false, null, default));
            Require(!File.Exists(destination) && File.ReadAllBytes(path).SequenceEqual(original), "no writes");
        });
        Check("RF64 export headers support sizes beyond 4 GiB without allocating the audio", () =>
        {
            long frames = uint.MaxValue / 6L + 100;
            byte[] header = AudioExporter.BuildHeader(96000, 2, frames, 3);
            Require(header.AsSpan(0, 4).SequenceEqual("RF64"u8), "RF64 tag");
            Require(BinaryPrimitives.ReadUInt64LittleEndian(header.AsSpan(28)) == (ulong)(frames * 6), "64-bit PCM length");
            Require(BinaryPrimitives.ReadUInt64LittleEndian(header.AsSpan(36)) == (ulong)frames, "64-bit frame count");
            Require(BinaryPrimitives.ReadUInt32LittleEndian(header.AsSpan(100)) == uint.MaxValue, "data sentinel");
            Throws<OverflowException>(() => AudioExporter.BuildHeader(48000, 2, long.MaxValue));
        });
        Check("file identity recognizes the original independently of path comparison", () =>
        {
            if (!OperatingSystem.IsWindows()) return;
            string path = Path.Combine(directory, "identity-source.wav"), other = Path.Combine(directory, "identity-other.wav");
            WriteWave(path, 32, true, 1, 44100, FloatBytes([.25f, -.5f]));
            File.Copy(path, other);
            using var audio = Import(path);
            byte[] original = File.ReadAllBytes(path);
            Require(audio.SourceIdentity is not null, "source identity captured");
            // Call the handle-identity guard directly, bypassing the exporter's path-string guard.
            Throws<IOException>(() => FileIdentity.ProtectOriginal(audio, path));
            FileIdentity.ProtectOriginal(audio, other);
            Require(File.ReadAllBytes(path).SequenceEqual(original) && File.ReadAllBytes(other).SequenceEqual(original), "identity checks do not write");
        });
        Check("real Windows Media Foundation decodes a generated local MP3 without opening an audio device", () =>
        {
            if (!OperatingSystem.IsWindows()) return;
            string path = Path.Combine(directory, "generated-silence.mp3"), decoded = Path.Combine(directory, "mf.f32");
            // MPEG-1 Layer III, 128 kbit/s, 44.1 kHz stereo. Empty spectral partitions encode silence.
            byte[] frames = new byte[417 * 30];
            for (int i = 0; i < 30; i++)
            {
                int offset = i * 417;
                frames[offset] = 0xff; frames[offset + 1] = 0xfb; frames[offset + 2] = 0x90; frames[offset + 3] = 0;
            }
            File.WriteAllBytes(path, frames);
            using var imported = Import(path);
            Require(imported.SampleRate == 44100 && imported.Channels == 2 && imported.FrameCount > 20000, "actual MP3 decoding");
            float[] samples = new float[4096];
            Require(imported.ReadFrames(0, samples) == 2048 && samples.All(x => x == 0), "generated MP3 silence");
        });
        Console.WriteLine($"Audio: PASS {count} groups; realAudioDevicesOpened=false; sourceFilesAreGeneratedFixtures=true");
        return count;

        void Check(string name, Action action)
        {
            try { action(); count++; Console.WriteLine("PASS audio: " + name); }
            catch (Exception error) { throw new Exception("Audio check failed: " + name, error); }
        }
        ImportedAudio Import(string path) => AudioImporter.Import(path, null, default, directory);
    }

    private static void WriteWave(string path, int bits, bool floating, int channels, int rate, byte[] pcm,
        bool extensible = false, bool junk = false, int validBits = 0)
    {
        using var stream = new FileStream(path, FileMode.Create, FileAccess.Write);
        using var writer = new BinaryWriter(stream, System.Text.Encoding.ASCII, true);
        writer.Write("RIFF"u8); writer.Write(0u); writer.Write("WAVE"u8);
        if (junk) { writer.Write("JUNK"u8); writer.Write(3u); writer.Write(new byte[] { 1, 2, 3, 0 }); }
        writer.Write("fmt "u8); writer.Write(extensible ? 40u : 16u);
        writer.Write(extensible ? (ushort)0xfffe : floating ? (ushort)3 : (ushort)1);
        writer.Write((ushort)channels); writer.Write((uint)rate); writer.Write((uint)(rate * channels * bits / 8));
        writer.Write((ushort)(channels * bits / 8)); writer.Write((ushort)bits);
        if (extensible)
        {
            writer.Write((ushort)22); writer.Write((ushort)(validBits == 0 ? bits : validBits));
            writer.Write(channels == 1 ? 4u : channels == 2 ? 3u : 0);
            writer.Write(new Guid(floating ? "00000003-0000-0010-8000-00aa00389b71" : "00000001-0000-0010-8000-00aa00389b71").ToByteArray());
        }
        writer.Write("data"u8); writer.Write((uint)pcm.Length); writer.Write(pcm);
        if ((pcm.Length & 1) != 0) writer.Write((byte)0);
        stream.Position = 4; writer.Write((uint)(stream.Length - 8));
    }
    private static byte[] FloatBytes(float[] values) => MemoryMarshal.AsBytes(values.AsSpan()).ToArray();
    private static void Require(bool condition, string message) { if (!condition) throw new Exception(message); }
    private static void Near(float actual, float expected) => Require(Math.Abs(actual - expected) < .000001, $"expected {expected}, got {actual}");
    private static void Throws<T>(Action action) where T : Exception
    {
        try { action(); } catch (T) { return; }
        throw new Exception("Expected " + typeof(T).Name);
    }
    private sealed class InlineProgress(Action<AudioProgress> action) : IProgress<AudioProgress>
    {
        public void Report(AudioProgress value) => action(value);
    }
}
