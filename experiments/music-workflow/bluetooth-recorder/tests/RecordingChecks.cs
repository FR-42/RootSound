using System.Buffers.Binary;
using RootSound.BluetoothRecorder.Recording;

namespace RootSound.BluetoothRecorder.Tests;

/// <summary>Pure files and fabricated packets only: no COM, audio endpoint, microphone or Bluetooth access.</summary>
internal static class RecordingChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory);
        int count = 0;
        Check("PCM format and peak", () =>
        {
            WaveFormat format = MakeFormat(1, 2, 48000, 16);
            Require(format.IsPcm && !format.IsFloat && format.BlockAlign == 4, "PCM identity");
            byte[] data = [0, 0x80, 0xff, 0x7f];
            Require(format.Peak(data) == 1, "PCM peak");
        });
        Check("float preserves nonfinite samples but meters safely", () =>
        {
            WaveFormat format = MakeFormat(3, 1, 44100, 32);
            byte[] data = new byte[12];
            BinaryPrimitives.WriteSingleLittleEndian(data, float.NaN);
            BinaryPrimitives.WriteSingleLittleEndian(data.AsSpan(4), -0.75f);
            BinaryPrimitives.WriteSingleLittleEndian(data.AsSpan(8), float.PositiveInfinity);
            Require(format.IsFloat && format.Peak(data) == 0.75f, "float meter");
        });
        Check("extensible format exact preservation", () =>
        {
            byte[] data = new byte[40];
            MakeFormat(3, 2, 48000, 32).FormatBytes.Span[..18].CopyTo(data);
            BinaryPrimitives.WriteUInt16LittleEndian(data, 0xfffe);
            BinaryPrimitives.WriteUInt16LittleEndian(data.AsSpan(16), 22);
            BinaryPrimitives.WriteUInt16LittleEndian(data.AsSpan(18), 32);
            BinaryPrimitives.WriteUInt32LittleEndian(data.AsSpan(20), 3);
            new Guid("00000003-0000-0010-8000-00aa00389b71").TryWriteBytes(data.AsSpan(24));
            WaveFormat format = new(data);
            Require(format.IsFloat && format.FormatBytes.Span.SequenceEqual(data), "extensible bytes");
            string path = System.IO.Path.Combine(directory, "extensible.wav");
            using (CaptureFileWriter writer = new(path, format)) writer.Write(new byte[16]);
            byte[] output = File.ReadAllBytes(path);
            Require(Chunk(output, "fmt ").SequenceEqual(data), "fmt chunk");
            Require(BinaryPrimitives.ReadUInt32LittleEndian(Chunk(output, "fact")) == 2, "float fact frames");
        });
        Check("WAV frame, RIFF and data sizes", () =>
        {
            string path = System.IO.Path.Combine(directory, "stereo.wav");
            using (CaptureFileWriter writer = new(path, MakeFormat(1, 2, 48000, 16)))
            {
                writer.Write([0, 0, 1, 0, 2, 0, 3, 0]);
                writer.WriteSilence(2);
                Require(writer.Frames == 4 && writer.DataBytes == 16, "frame accounting");
                Expect<InvalidDataException>(() => writer.Write([1]));
            }
            byte[] output = File.ReadAllBytes(path);
            Require(System.Text.Encoding.ASCII.GetString(output, 0, 4) == "RIFF", "standard WAV");
            Require(BinaryPrimitives.ReadUInt32LittleEndian(output.AsSpan(4)) == output.Length - 8, "RIFF size");
            Require(Chunk(output, "data").SequenceEqual(new byte[] { 0, 0, 1, 0, 2, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0 }), "streamed bytes");
            Expect<IOException>(() => { using CaptureFileWriter ignored = new(path, MakeFormat(1, 2, 48000, 16)); });
            Require(File.ReadAllBytes(path).SequenceEqual(output), "existing recording not overwritten");
        });
        Check("8-bit silence and odd-byte padding", () =>
        {
            string path = System.IO.Path.Combine(directory, "eight-bit.wav");
            using (CaptureFileWriter writer = new(path, MakeFormat(1, 1, 8000, 8))) writer.WriteSilence(3);
            byte[] output = File.ReadAllBytes(path);
            Require(Chunk(output, "data").SequenceEqual(new byte[] { 128, 128, 128 }), "unsigned silence");
            Require(output.Length % 2 == 0 && output[^1] == 0, "RIFF chunk pad");
        });
        Check("long recordings promote to RF64 without data-size overflow", () =>
        {
            using SparseCountingStream stream = new();
            WaveFormat format = MakeFormat(1, 2, 48000, 16);
            long frames = (uint.MaxValue + 1L) / format.BlockAlign;
            using (CaptureFileWriter writer = new(stream, format, leaveOpen: true)) writer.WriteSilence(frames);
            byte[] header = stream.Header;
            Require(System.Text.Encoding.ASCII.GetString(header, 0, 4) == "RF64", "RF64 tag");
            Require(BinaryPrimitives.ReadUInt32LittleEndian(header.AsSpan(4)) == uint.MaxValue, "RF64 marker");
            Require(System.Text.Encoding.ASCII.GetString(header, 12, 4) == "ds64", "reserved chunk replaced");
            Require(BinaryPrimitives.ReadUInt64LittleEndian(header.AsSpan(20)) == (ulong)stream.Length - 8, "64-bit RIFF length");
            Require(BinaryPrimitives.ReadUInt64LittleEndian(header.AsSpan(28)) == 1UL << 32, "64-bit audio length");
            Require(BinaryPrimitives.ReadUInt64LittleEndian(header.AsSpan(36)) == (ulong)frames, "64-bit frame count");
            Require(BinaryPrimitives.ReadUInt32LittleEndian(header.AsSpan(78)) == uint.MaxValue, "data size marker");
        });
        Check("timeline records initial and idle silence", () =>
        {
            string path = System.IO.Path.Combine(directory, "timeline.wav");
            WaveFormat format = MakeFormat(1, 1, 8000, 16);
            using (CaptureFileWriter writer = new(path, format))
            {
                CaptureTimeline timeline = new(writer, format, 1_000_000);
                timeline.Append([1, 0, 2, 0], 2, false, true, false, 0, 1_010_000, TimeSpan.FromMilliseconds(2));
                timeline.Append(ReadOnlySpan<byte>.Empty, 2, true, true, false, 20, 1_030_000, TimeSpan.FromMilliseconds(4));
                timeline.Complete(TimeSpan.FromMilliseconds(5));
                Require(writer.Frames == 40 && timeline.Discontinuities == 1, "timed frame count and first-packet flag");
            }
            byte[] data = Chunk(File.ReadAllBytes(path), "data");
            Require(data[16] == 1 && data[18] == 2 && data.Sum(value => value) == 3, "silence positions");
        });
        Check("timeline trims overlaps and handles timestamp-error position gaps", () =>
        {
            string path = System.IO.Path.Combine(directory, "overlap.wav");
            WaveFormat format = MakeFormat(1, 1, 8000, 16);
            using CaptureFileWriter writer = new(path, format);
            CaptureTimeline timeline = new(writer, format, 0);
            timeline.Append(new byte[20], 10, false, false, false, 0, 0, TimeSpan.Zero);
            timeline.Append(new byte[20], 10, false, false, false, 5, 6250, TimeSpan.FromMilliseconds(2));
            Require(writer.Frames == 15, "overlap skipped");
            timeline.Append(ReadOnlySpan<byte>.Empty, 4, true, true, true, 20, 0, TimeSpan.FromMilliseconds(4));
            Require(writer.Frames == 24 && timeline.TimestampErrors == 1 && timeline.Discontinuities == 1, "position fallback");
            Expect<InvalidDataException>(() => timeline.Append(new byte[2], 1, false, false, false, 24,
                100_000_000, TimeSpan.FromMilliseconds(4)));
            Require(writer.Frames == 24, "bad timestamp cannot extend file");
        });
        Check("recording boundaries trim queued pre-start and post-stop audio", () =>
        {
            string path = System.IO.Path.Combine(directory, "boundaries.wav");
            WaveFormat format = MakeFormat(1, 1, 8000, 16);
            using (CaptureFileWriter writer = new(path, format))
            {
                CaptureTimeline timeline = new(writer, format, 10_000_000);
                timeline.Append([1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0], 8,
                    false, false, false, 0, 9_995_000, TimeSpan.FromMilliseconds(1));
                Require(writer.Frames == 4, "negative start timestamp drops first four frames");
                timeline.Complete(TimeSpan.FromSeconds(2d / 8000));
                Require(writer.Frames == 2 && writer.DataBytes == 4, "frozen stop boundary truncates queued tail");
            }
            Require(Chunk(File.ReadAllBytes(path), "data").SequenceEqual(new byte[] { 5, 0, 6, 0 }), "requested interval only");
        });
        Check("invalid formats rejected", () =>
        {
            Expect<InvalidDataException>(() => new WaveFormat(new byte[12]));
            byte[] invalid = MakeFormat(1, 2, 48000, 16).FormatBytes.ToArray();
            invalid[12] = 1;
            Expect<InvalidDataException>(() => new WaveFormat(invalid));
            invalid = MakeFormat(1, 2, 48000, 16).FormatBytes.ToArray();
            invalid[0] = 6;
            Expect<InvalidDataException>(() => new WaveFormat(invalid));
        });
        Check("unused recorder can stop and dispose without opening a device", () =>
        {
            using OutputLoopbackRecorder recorder = new();
            Require(recorder.Snapshot.Status == RecordingStatus.Idle, "initial state");
            Require(recorder.StopAsync().GetAwaiter().GetResult() is null, "empty stop");
            if (OperatingSystem.IsWindows())
            {
                using CancellationTokenSource cancelled = new(); cancelled.Cancel();
                Expect<OperationCanceledException>(() => recorder.StartAsync(
                    System.IO.Path.Combine(directory, "never-opened.wav"), cancellationToken: cancelled.Token));
                Require(!File.Exists(System.IO.Path.Combine(directory, "never-opened.wav")), "cancelled before COM");
            }
        });
        Check("invalid recording paths are rejected before opening playback output", () =>
        {
            using OutputLoopbackRecorder recorder = new();
            Expect<ArgumentException>(() => recorder.StartAsync(" "));
            Require(recorder.Snapshot.Status == RecordingStatus.Idle, "invalid path does not start a device");
        });
        Check("default-output callbacks detect switches without touching a device", () =>
        {
            EndpointNotifications notifications = new("output-a", followsDefault: true);
            Require(notifications.OnDefaultDeviceChanged(1, 1, "input-b") == 0, "capture notification HRESULT");
            notifications.OnDefaultDeviceChanged(0, 0, "console-b");
            notifications.OnDefaultDeviceChanged(0, 2, "communications-b");
            notifications.OnDefaultDeviceChanged(0, 1, "OUTPUT-A");
            notifications.OnDeviceStateChanged("unrelated", 2);
            notifications.OnDeviceStateChanged("output-a", 1);
            notifications.OnDeviceAdded("other");
            notifications.OnPropertyValueChanged("output-a", default);
            Require(notifications.Change == EndpointChange.None && notifications.Timestamp == 0, "unrelated notifications ignored");
            notifications.OnDefaultDeviceChanged(0, 1, "output-b");
            long firstTimestamp = notifications.Timestamp;
            Require(notifications.Change == EndpointChange.DefaultOutputChanged && firstTimestamp > 0, "default switch freezes stop");
            notifications.OnDeviceRemoved("output-a");
            Require(notifications.Change == EndpointChange.DefaultOutputChanged && notifications.Timestamp == firstTimestamp, "first reason and boundary retained");
            EndpointNotifications noDefault = new("output-a", followsDefault: true);
            noDefault.OnDefaultDeviceChanged(0, 1, null);
            Require(noDefault.Change == EndpointChange.DefaultOutputChanged, "null default endpoint stops capture");
        });
        Check("explicit output ignores default moves but stops on removal or inactive state", () =>
        {
            EndpointNotifications notifications = new("explicit-output", followsDefault: false);
            notifications.OnDefaultDeviceChanged(0, 1, "another-default");
            notifications.OnDeviceRemoved("unrelated");
            Require(notifications.Change == EndpointChange.None, "explicit endpoint remains bound");
            Parallel.For(0, 32, _ => notifications.OnDeviceStateChanged("explicit-output", 2));
            Require(notifications.Change == EndpointChange.OutputUnavailable && notifications.Timestamp > 0, "concurrent invalidation callbacks safely mark state");
            EndpointNotifications removed = new("explicit-output", followsDefault: false);
            removed.OnDeviceRemoved("EXPLICIT-OUTPUT");
            Require(removed.Change == EndpointChange.OutputUnavailable, "removal stops capture");
        });
        Check("callback ownership releases only after confirmed detachment", () =>
        {
            Require(NotificationLifetime.IsDetached(0) && NotificationLifetime.IsDetached(1), "successful unregistration releases explicit reference");
            Require(NotificationLifetime.IsDetached(unchecked((int)0x80070490)), "already absent callback can release");
            Require(!NotificationLifetime.IsDetached(unchecked((int)0x80004005))
                && !NotificationLifetime.IsDetached(unchecked((int)0x80070005)), "unexpected native failures require lifetime quarantine");
        });
        return count;

        void Check(string title, Action action)
        {
            action(); count++; Console.WriteLine("PASS recording: " + title);
        }
    }

    private static WaveFormat MakeFormat(ushort tag, ushort channels, uint rate, ushort bits)
    {
        byte[] data = new byte[18];
        ushort align = (ushort)(channels * (bits / 8));
        BinaryPrimitives.WriteUInt16LittleEndian(data, tag);
        BinaryPrimitives.WriteUInt16LittleEndian(data.AsSpan(2), channels);
        BinaryPrimitives.WriteUInt32LittleEndian(data.AsSpan(4), rate);
        BinaryPrimitives.WriteUInt32LittleEndian(data.AsSpan(8), rate * align);
        BinaryPrimitives.WriteUInt16LittleEndian(data.AsSpan(12), align);
        BinaryPrimitives.WriteUInt16LittleEndian(data.AsSpan(14), bits);
        return new(data);
    }
    private static byte[] Chunk(byte[] wave, string name)
    {
        for (int position = 12; position + 8 <= wave.Length;)
        {
            uint size = BinaryPrimitives.ReadUInt32LittleEndian(wave.AsSpan(position + 4));
            if (System.Text.Encoding.ASCII.GetString(wave, position, 4) == name)
                return wave.AsSpan(position + 8, checked((int)size)).ToArray();
            position = checked(position + 8 + (int)size + (int)(size & 1));
        }
        throw new InvalidDataException("Missing WAV chunk: " + name);
    }
    private static void Require(bool condition, string message)
    { if (!condition) throw new InvalidOperationException(message); }
    private static void Expect<T>(Action action) where T : Exception
    {
        try { action(); } catch (T) { return; }
        throw new InvalidOperationException("Expected " + typeof(T).Name);
    }

    private sealed class SparseCountingStream : Stream
    {
        internal byte[] Header { get; } = new byte[512];
        private long length;
        public override bool CanRead => false;
        public override bool CanSeek => true;
        public override bool CanWrite => true;
        public override long Length => length;
        public override long Position { get; set; }
        public override void Flush() { }
        public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException();
        public override void Write(byte[] buffer, int offset, int count) => Write(buffer.AsSpan(offset, count));
        public override void Write(ReadOnlySpan<byte> buffer)
        {
            if (Position < Header.Length)
                buffer[..(int)Math.Min(buffer.Length, Header.Length - Position)].CopyTo(Header.AsSpan((int)Position));
            Position += buffer.Length; length = Math.Max(length, Position);
        }
        public override long Seek(long offset, SeekOrigin origin)
        {
            Position = checked((origin == SeekOrigin.Begin ? 0 : origin == SeekOrigin.Current ? Position : length) + offset);
            return Position;
        }
        public override void SetLength(long value) { length = value; if (Position > value) Position = value; }
    }
}
