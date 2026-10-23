namespace RootSound.TimbreLab.Core;

public sealed record SampleEntry(PcmClip Clip, string? SourcePath);

/// <summary>Session-only inputs; processed snapshots never replace imported originals.</summary>
public sealed class SampleWorkspace
{
    private readonly List<SampleEntry> _entries = [];
    public IReadOnlyList<SampleEntry> Entries => _entries.AsReadOnly();
    public int PrimaryIndex { get; private set; } = -1;
    public SampleEntry? Primary => PrimaryIndex < 0 ? null : _entries[PrimaryIndex];
    public long Revision { get; private set; }
    public ProcessingResult? Result { get; private set; }
    public bool IsCurrent { get; private set; }

    public void Add(SampleEntry entry)
    {
        if (_entries.Count >= 8) throw new InvalidOperationException("最多同时使用八段采样。请先移除不需要的参考。");
        if (_entries.Sum(x => x.Clip.Samples.LongLength) + entry.Clip.Samples.LongLength > 64_000_000)
            throw new InvalidOperationException("这些采样的总大小过大。请先缩短采样或移除参考。");
        _entries.Add(entry);
        if (PrimaryIndex < 0) PrimaryIndex = 0;
        Invalidate();
    }

    public void SetPrimary(int index)
    {
        if ((uint)index >= (uint)_entries.Count) throw new ArgumentOutOfRangeException(nameof(index));
        PrimaryIndex = index;
        Invalidate();
    }

    public void Remove(int index)
    {
        if ((uint)index >= (uint)_entries.Count) return;
        _entries.RemoveAt(index);
        if (_entries.Count == 0) PrimaryIndex = -1;
        else if (index < PrimaryIndex) PrimaryIndex--;
        else if (index == PrimaryIndex) PrimaryIndex = Math.Min(index, _entries.Count - 1);
        Invalidate();
    }

    public void Clear()
    {
        _entries.Clear();
        PrimaryIndex = -1;
        Result = null;
        Invalidate();
    }

    public long Invalidate()
    {
        IsCurrent = false;
        return ++Revision;
    }

    public bool TryApply(long revision, ProcessingResult result)
    {
        if (revision != Revision || Primary is null) return false;
        Result = result;
        IsCurrent = true;
        return true;
    }

    public IReadOnlyList<PcmClip> References() => _entries.Where((_, i) => i != PrimaryIndex).Select(x => x.Clip).ToArray();
}

public static class ClipPreparation
{
    public static PcmClip Trim(PcmClip source, long start, long end)
    {
        if (start < 0 || end > source.FrameCount || end <= start)
            throw new ArgumentException("请保留一段非空的声音。");
        var samples = source.Samples.AsSpan(checked((int)(start * source.Channels)), checked((int)((end - start) * source.Channels))).ToArray();
        return new PcmClip(source.SampleRate, source.Channels, samples, source.Name);
    }

    public static (long Start, long End) FindAudibleRange(PcmClip source)
    {
        var peak = source.Samples.Max(x => Math.Abs((double)x));
        if (!double.IsFinite(peak) || peak < 1e-8) return (0, source.FrameCount);
        double threshold = Math.Max(peak * .006, 1e-7);
        long first = 0, last = source.FrameCount - 1;
        bool Quiet(long frame)
        {
            for (int c = 0; c < source.Channels; c++)
                if (Math.Abs(source.Samples[checked((int)(frame * source.Channels + c))]) > threshold) return false;
            return true;
        }
        while (first < last && Quiet(first)) first++;
        while (last > first && Quiet(last)) last--;
        long margin = Math.Max(1, source.SampleRate / 300);
        return (Math.Max(0, first - margin), Math.Min(source.FrameCount, last + margin + 1));
    }
}
