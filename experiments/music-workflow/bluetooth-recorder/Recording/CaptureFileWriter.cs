namespace RootSound.BluetoothRecorder.Recording;

/// <summary>Bounded memory, streaming WAV. A reserved JUNK chunk permits RF64 promotion past 4 GiB.</summary>
public sealed class CaptureFileWriter : IDisposable
{
    private readonly Stream stream;
    private readonly BinaryWriter writer;
    private readonly WaveFormat format;
    private readonly long dataSizeOffset;
    private readonly long factOffset;
    private readonly byte[] silence;
    private readonly bool leaveOpen;
    private bool disposed;
    public long DataBytes { get; private set; }
    public long Frames => DataBytes / format.BlockAlign;
    public TimeSpan Duration => TimeSpan.FromSeconds(Frames / (double)format.SampleRate);

    public CaptureFileWriter(string path, WaveFormat format)
        : this(new FileStream(path, FileMode.CreateNew, FileAccess.ReadWrite, FileShare.Read,
            64 * 1024, FileOptions.SequentialScan), format) { }

    internal CaptureFileWriter(Stream output, WaveFormat format, bool leaveOpen = false)
    {
        this.format = format;
        stream = output;
        this.leaveOpen = leaveOpen;
        writer = new BinaryWriter(stream, System.Text.Encoding.ASCII, leaveOpen: true);
        try
        {
            if (!stream.CanWrite || !stream.CanSeek || stream.Position != 0 || stream.Length != 0)
                throw new ArgumentException("录音输出必须是一个空的可定位写入流。", nameof(output));
            FourCC("RIFF"); writer.Write(0u); FourCC("WAVE");
            FourCC("JUNK"); writer.Write(28u); writer.Write(new byte[28]);
            FourCC("fmt "); writer.Write((uint)format.FormatBytes.Length); writer.Write(format.FormatBytes.Span);
            if ((format.FormatBytes.Length & 1) != 0) writer.Write((byte)0);
            if (!format.IsPcm)
            {
                FourCC("fact"); writer.Write(4u); factOffset = stream.Position; writer.Write(0u);
            }
            else factOffset = -1;
            FourCC("data"); dataSizeOffset = stream.Position; writer.Write(0u);
            silence = new byte[Math.Max(format.BlockAlign, 64 * 1024 / format.BlockAlign * format.BlockAlign)];
            format.FillSilence(silence);
        }
        catch { writer.Dispose(); if (!leaveOpen) stream.Dispose(); throw; }
    }

    private void FourCC(string value) => writer.Write(System.Text.Encoding.ASCII.GetBytes(value));
    public void Write(ReadOnlySpan<byte> samples)
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        if (samples.Length % format.BlockAlign != 0) throw new InvalidDataException("音频包没有对齐到完整采样帧。");
        stream.Write(samples);
        DataBytes = checked(DataBytes + samples.Length);
    }

    public void WriteSilence(long frames)
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        if (frames < 0) throw new ArgumentOutOfRangeException(nameof(frames));
        long bytes = checked(frames * format.BlockAlign);
        while (bytes > 0)
        {
            int count = (int)Math.Min(bytes, silence.Length);
            Write(silence.AsSpan(0, count)); bytes -= count;
        }
    }

    public void TruncateToFrames(long frames)
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        if (frames < 0 || frames > Frames) throw new ArgumentOutOfRangeException(nameof(frames));
        DataBytes = checked(frames * format.BlockAlign);
        stream.SetLength(checked(dataSizeOffset + 4 + DataBytes));
        stream.Position = stream.Length;
    }

    public void Dispose()
    {
        if (disposed) return;
        disposed = true;
        try
        {
            if ((DataBytes & 1) != 0) stream.WriteByte(0);
            long fileSize = stream.Position;
            bool rf64 = fileSize - 8 > uint.MaxValue || DataBytes > uint.MaxValue;
            stream.Position = 0; FourCC(rf64 ? "RF64" : "RIFF");
            writer.Write(rf64 ? uint.MaxValue : checked((uint)(fileSize - 8)));
            if (rf64)
            {
                stream.Position = 12; FourCC("ds64"); writer.Write(28u);
                writer.Write((ulong)(fileSize - 8)); writer.Write((ulong)DataBytes);
                writer.Write((ulong)Frames); writer.Write(0u);
            }
            if (factOffset >= 0)
            {
                stream.Position = factOffset; writer.Write((uint)Math.Min(Frames, uint.MaxValue));
            }
            stream.Position = dataSizeOffset; writer.Write(rf64 ? uint.MaxValue : checked((uint)DataBytes));
            if (stream is FileStream file) file.Flush(flushToDisk: true);
            else stream.Flush();
        }
        finally { writer.Dispose(); if (!leaveOpen) stream.Dispose(); }
    }
}

/// <summary>Places timestamped packets on a continuous recording timeline, including endpoint-idle silence.</summary>
public sealed class CaptureTimeline
{
    private readonly CaptureFileWriter writer;
    private readonly WaveFormat format;
    private readonly long startQpc100ns;
    private long? nextDevicePosition;
    public int Discontinuities { get; private set; }
    public int TimestampErrors { get; private set; }
    public CaptureTimeline(CaptureFileWriter writer, WaveFormat format, long startQpc100ns)
    { this.writer = writer; this.format = format; this.startQpc100ns = startQpc100ns; }

    public void Append(ReadOnlySpan<byte> bytes, int frames, bool silent, bool discontinuity,
        bool timestampError, long devicePosition, long qpc100ns, TimeSpan elapsed)
    {
        if (frames < 0 || (!silent && bytes.Length != checked(frames * format.BlockAlign)))
            throw new InvalidDataException("音频包长度无效。");
        if (discontinuity && writer.Frames > 0) Discontinuities++;
        if (timestampError) TimestampErrors++;
        long target = writer.Frames;
        if (!timestampError && qpc100ns > 0)
            target = checked((long)Math.Round((qpc100ns - startQpc100ns) * (format.SampleRate / 10_000_000d)));
        else if (nextDevicePosition is long expected && devicePosition >= expected)
            target = checked(writer.Frames + devicePosition - expected);
        if (target > (elapsed.TotalSeconds + 2) * format.SampleRate)
            throw new InvalidDataException("音频设备返回了异常的时间戳，录音已安全停止。");
        long gap = target - writer.Frames;
        if (gap > 2) writer.WriteSilence(gap);
        int skip = gap < -2 ? (int)Math.Min(frames, -gap) : 0;
        int retained = frames - skip;
        if (silent) writer.WriteSilence(retained);
        else writer.Write(bytes[(skip * format.BlockAlign)..]);
        nextDevicePosition = checked(devicePosition + frames);
    }

    public void Complete(TimeSpan elapsed)
    {
        long target = checked((long)Math.Round(elapsed.TotalSeconds * format.SampleRate));
        if (target > writer.Frames) writer.WriteSilence(target - writer.Frames);
        else if (target < writer.Frames) writer.TruncateToFrames(target);
    }
}
