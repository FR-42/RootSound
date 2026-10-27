using System.Buffers.Binary;
using RootSound.ReferenceStudio.Core;
using RootSound.ReferenceStudio.Persistence;
using RootSound.TimbreLab.Core;
using RootSound.TimbreLab.Instrument;

namespace RootSound.ReferenceStudio.Audio;

public static class ReferenceRenderer
{
    public const int SampleRate = 48000;

    public static PcmClip Render(ReferenceProject project, SourceMode mode = SourceMode.Reconstruction,
        Guid? solo = null, CancellationToken cancellationToken = default)
    {
        if (!Enum.IsDefined(mode)) throw new ArgumentOutOfRangeException(nameof(mode));
        ReferenceValidation.Validate(project, inspectSamples: true);
        ReferenceRenderPlan plan = new(project);
        float[] samples = new float[checked((int)plan.FrameCount * 2)];
        for (int at = 0; at < plan.FrameCount; at += 4096)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int count = (int)Math.Min(4096, plan.FrameCount - at);
            Span<float> output = samples.AsSpan(at * 2, count * 2);
            plan.Render(at, output, mode, solo); ProtectPeaks(output);
        }
        cancellationToken.ThrowIfCancellationRequested();
        return new(SampleRate, 2, samples, project.Phrase.Name);
    }

    public static Task ExportAsync(ReferenceProject project, string destination, bool overwrite = false,
        CancellationToken cancellationToken = default) => Task.Run(() =>
    {
        if (!StringComparer.OrdinalIgnoreCase.Equals(Path.GetExtension(destination), ".wav"))
            throw new IOException("音频导出请使用 .wav 文件名。");
        ReferenceValidation.Validate(project, inspectSamples: true);
        SourceProtection.Check(project, destination);
        ReferenceRenderPlan plan = new(project);
        AtomicFile.Write(destination, overwrite, cancellationToken, stream =>
        {
            int bytes = checked((int)plan.FrameCount * 2 * 3);
            byte[] header = new byte[44];
            "RIFF"u8.CopyTo(header); BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(4), checked((uint)(36 + bytes)));
            "WAVEfmt "u8.CopyTo(header.AsSpan(8)); BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(16), 16);
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(20), 1);
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(22), 2);
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(24), SampleRate);
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(28), SampleRate * 6);
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(32), 6); BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(34), 24);
            "data"u8.CopyTo(header.AsSpan(36)); BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(40), (uint)bytes);
            stream.Write(header);
            float[] values = new float[8192]; byte[] buffer = new byte[24576];
            for (long at = 0; at < plan.FrameCount; at += 4096)
            {
                cancellationToken.ThrowIfCancellationRequested();
                int frames = (int)Math.Min(4096, plan.FrameCount - at), count = frames * 2;
                Span<float> output = values.AsSpan(0, count);
                plan.Render(at, output, SourceMode.Reconstruction); ProtectPeaks(output);
                for (int i = 0; i < count; i++)
                {
                    int sample = (int)Math.Clamp(Math.Round((double)output[i] * 8388608,
                        MidpointRounding.AwayFromZero), -8388608, 8388607);
                    buffer[i * 3] = (byte)sample; buffer[i * 3 + 1] = (byte)(sample >> 8); buffer[i * 3 + 2] = (byte)(sample >> 16);
                }
                stream.Write(buffer, 0, count * 3);
            }
            // Resolve the original again after rendering, immediately before AtomicFile commits.
            SourceProtection.Check(project, destination);
        });
    }, cancellationToken);

    internal static void ProtectPeaks(Span<float> output)
    {
        for (int i = 0; i < output.Length; i++)
        {
            double value = output[i], magnitude = Math.Abs(value);
            output[i] = !double.IsFinite(value) ? 0 : magnitude > .98
                ? (float)Math.CopySign(.98 + .02 * Math.Tanh((magnitude - .98) / .02), value) : (float)value;
        }
    }
}
