using System.Buffers.Binary;
using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Instrument;

/// <summary>Exports the polished native-pitch sampling data, without the performance envelope.</summary>
public static class PcmWaveExporter
{
    public static Task ExportAsync(PcmClip audio, string destination, bool overwrite = false,
        CancellationToken cancellationToken = default) =>
        Task.Run(() => Export(audio, destination, overwrite, cancellationToken), cancellationToken);

    internal static void Export(PcmClip audio, string destination, bool overwrite, CancellationToken cancellationToken)
    {
        InstrumentValidation.Clip(audio, inspectSamples: true);
        AtomicFile.Write(destination, overwrite, cancellationToken, stream =>
        {
            int bytes = checked(audio.Samples.Length * 3);
            byte[] header = new byte[68];
            "RIFF"u8.CopyTo(header);
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(4), checked((uint)(60 + bytes + (bytes & 1))));
            "WAVEfmt "u8.CopyTo(header.AsSpan(8));
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(16), 40);
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(20), 0xfffe);
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(22), (ushort)audio.Channels);
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(24), (uint)audio.SampleRate);
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(28), checked((uint)(audio.SampleRate * audio.Channels * 3)));
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(32), (ushort)(audio.Channels * 3));
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(34), 24);
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(36), 22);
            BinaryPrimitives.WriteUInt16LittleEndian(header.AsSpan(38), 24);
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(40), audio.Channels == 1 ? 4u : audio.Channels == 2 ? 3u : 0u);
            new Guid("00000001-0000-0010-8000-00aa00389b71").TryWriteBytes(header.AsSpan(44));
            "data"u8.CopyTo(header.AsSpan(60));
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(64), (uint)bytes);
            stream.Write(header);
            byte[] buffer = new byte[49152];
            int offset = 0;
            while (offset < audio.Samples.Length)
            {
                cancellationToken.ThrowIfCancellationRequested();
                int take = Math.Min(buffer.Length / 3, audio.Samples.Length - offset);
                for (int i = 0; i < take; i++)
                {
                    int sample = (int)Math.Clamp(Math.Round(Math.Clamp((double)audio.Samples[offset + i], -1, 1) * 8388608,
                        MidpointRounding.AwayFromZero), -8388608, 8388607);
                    buffer[i * 3] = (byte)sample;
                    buffer[i * 3 + 1] = (byte)(sample >> 8);
                    buffer[i * 3 + 2] = (byte)(sample >> 16);
                }
                stream.Write(buffer, 0, take * 3);
                offset += take;
            }
            if ((bytes & 1) != 0) stream.WriteByte(0);
        });
    }
}
