using System.Buffers;
using RootSound.PhraseStudio.Audio;
using RootSound.PhraseStudio.Core;
using RootSound.ReferenceStudio.Core;
using RootSound.SampleEditor.Core;
using RootSound.TimbreLab.Core;

namespace RootSound.ReferenceStudio.Audio;

public enum SourceMode { Reference, Reconstruction }

/// <summary>Both comparison sides and keyboard preview share this one hardware clock.</summary>
internal sealed class ReferenceMixSource : IAudioFrameSource
{
    private readonly object previewGate = new();
    private SceneState? state;
    private PreviewVoice[] previews = [];
    private long latestReadEnd;
    public int SampleRate => ReferenceRenderer.SampleRate;
    public int Channels => 2;
    public long FrameCount => (long)SampleRate * 7 * 86400;
    internal long LatestReadEnd => Interlocked.Read(ref latestReadEnd);
    internal double LastPreviewEnd { get { lock (previewGate) return previews.Length == 0 ? 0 : previews.Max(p => p.End); } }

    internal void SetScene(ReferenceRenderPlan plan, SourceMode mode, Guid? solo, bool enabled,
        bool loop, double anchorFrame, double anchorSongFrame, bool crossfade = true)
    {
        var scene = new Scene(plan, mode, solo, enabled, loop, anchorFrame, anchorSongFrame);
        Scene? previous = crossfade ? Volatile.Read(ref state)?.Current : null;
        Volatile.Write(ref state, new(scene, previous, LatestReadEnd, SampleRate / 200));
    }

    internal double SongFrameAt(double sourceFrame)
    {
        Scene? scene = Volatile.Read(ref state)?.Current;
        if (scene is null) return 0;
        double frame = scene.AnchorSongFrame + (scene.Enabled ? sourceFrame - scene.AnchorFrame : 0);
        frame = Math.Max(0, frame);
        return scene.Loop && scene.Enabled ? frame % scene.Plan.FrameCount : Math.Min(frame, scene.Plan.FrameCount);
    }

    internal double RawSongFrameAt(double sourceFrame)
    {
        Scene? scene = Volatile.Read(ref state)?.Current;
        return scene is null ? 0 : Math.Max(0, scene.AnchorSongFrame + (scene.Enabled ? sourceFrame - scene.AnchorFrame : 0));
    }

    internal void AddPreview(InstrumentVoice voice, double startFrame)
    {
        lock (previewGate)
        {
            var remaining = previews.Where(p => p.End > startFrame).ToArray();
            if (remaining.Length >= 32) throw new InvalidOperationException("试听音符过多，请稍候再试。");
            previews = [.. remaining, new PreviewVoice(startFrame, voice)];
        }
    }

    internal void ClearPreviews() { lock (previewGate) previews = []; }
    internal void ResetReadCursor() => Interlocked.Exchange(ref latestReadEnd, 0);

    public int ReadFrames(long startFrame, Span<float> destination)
    {
        if (startFrame < 0 || startFrame > FrameCount || destination.Length % 2 != 0)
            throw new ArgumentOutOfRangeException(nameof(startFrame));
        destination.Clear();
        int frames = (int)Math.Min(destination.Length / 2, FrameCount - startFrame);
        if (frames == 0) return 0;
        var current = Volatile.Read(ref state);
        Span<float> output = destination[..(frames * 2)];
        if (current is not null)
        {
            RenderScene(current.Current, startFrame, output);
            if (current.Previous is not null && startFrame < current.TransitionFrame + current.TransitionFrames)
            {
                float[] rented = ArrayPool<float>.Shared.Rent(output.Length);
                try
                {
                    Span<float> old = rented.AsSpan(0, output.Length); old.Clear();
                    RenderScene(current.Previous, startFrame, old);
                    for (int i = 0; i < frames; i++)
                    {
                        double blend = Math.Clamp((startFrame + i - current.TransitionFrame) / (double)current.TransitionFrames, 0, 1);
                        output[i * 2] = (float)(old[i * 2] * (1 - blend) + output[i * 2] * blend);
                        output[i * 2 + 1] = (float)(old[i * 2 + 1] * (1 - blend) + output[i * 2 + 1] * blend);
                    }
                }
                finally { ArrayPool<float>.Shared.Return(rented); }
                if (startFrame + frames >= current.TransitionFrame + current.TransitionFrames)
                    Interlocked.CompareExchange(ref state, current with { Previous = null }, current);
            }
        }
        PreviewVoice[] preview;
        lock (previewGate) preview = previews;
        foreach (var voice in preview)
            if (voice.Start < startFrame + frames && voice.End > startFrame)
                voice.Voice.Add(startFrame - voice.Start, output);
        ReferenceRenderer.ProtectPeaks(output);
        // Exactly one PlaybackEngine reads this source. A seek flushes that worker and
        // begins again at zero, so the latest submitted window must be allowed to rewind.
        Interlocked.Exchange(ref latestReadEnd, startFrame + frames);
        return frames;
    }

    private static void RenderScene(Scene scene, long sourceStart, Span<float> output)
    {
        if (!scene.Enabled) return;
        // Commands anchor at integral output frames. The hardware alone advances time.
        long first = checked((long)Math.Round(scene.AnchorSongFrame + sourceStart - scene.AnchorFrame));
        int count = output.Length / 2, done = 0;
        while (done < count)
        {
            long at = first + done;
            if (at < 0) { done += (int)Math.Min(count - done, -at); continue; }
            if (!scene.Loop && at >= scene.Plan.FrameCount) break;
            long local = scene.Loop ? at % scene.Plan.FrameCount : at;
            int take = (int)Math.Min(count - done, scene.Plan.FrameCount - local);
            scene.Plan.Render(local, output.Slice(done * 2, take * 2), scene.Mode, scene.Solo);
            done += take;
        }
    }

    private sealed record Scene(ReferenceRenderPlan Plan, SourceMode Mode, Guid? Solo, bool Enabled,
        bool Loop, double AnchorFrame, double AnchorSongFrame);
    private sealed record SceneState(Scene Current, Scene? Previous, long TransitionFrame, int TransitionFrames);
    private sealed record PreviewVoice(double Start, InstrumentVoice Voice) { internal double End => Start + Voice.TotalFrames; }
}

/// <summary>Immutable note plan. It generates voices for the requested window, never a baked backing track.</summary>
internal sealed class ReferenceRenderPlan
{
    private readonly ReferenceProject project;
    private readonly LayerPlan[] layers;
    private readonly VoiceBlockCache voiceCache;
    internal const int EffectBlockFrames = 256;
    private const int DryBlockFrames = 512;
    private const int VoiceBlockFrames = 512;
    private const int MaximumVoicesPerWindow = 128;
    internal long FrameCount => project.Reference.FrameCount;

    internal ReferenceRenderPlan(ReferenceProject project, ReferenceRenderPlan? previous = null)
    {
        ReferenceValidation.Validate(project);
        this.project = project;
        voiceCache = new VoiceBlockCache(project.Phrase.Channels.Select(c => c.Timbre).OfType<InstrumentPatch>(), previous?.voiceCache);
        double framesPerTick = Timing.SecondsPerTick(project.Phrase.Tempo) * ReferenceRenderer.SampleRate;
        layers = project.Phrase.Channels.Select(channel => new LayerPlan(channel,
            project.Sounds.Single(s => s.ChannelId == channel.Id), framesPerTick, voiceCache)).ToArray();
        // Reject an unplayable overlap before touching the active output. The limit applies
        // across the whole song, including releases, rather than independently to 32 layers.
        var events = layers.Where(l => !l.Channel.Muted).SelectMany(l => l.Voices)
            .SelectMany(v => new[] { (Frame: v.Start, Delta: 1), (Frame: v.End, Delta: -1) })
            .OrderBy(e => e.Frame).ThenBy(e => e.Delta);
        int concurrent = 0;
        foreach (var e in events)
            if ((concurrent += e.Delta) > MaximumVoicesPerWindow)
                throw new InvalidOperationException("同时发声音符超过 128 个，请减少重叠或缩短释音。工程内容仍完整保留。");
    }

    internal void Render(long firstFrame, Span<float> destination, SourceMode mode, Guid? solo = null)
    {
        if (firstFrame < 0 || destination.Length % 2 != 0) throw new ArgumentOutOfRangeException(nameof(firstFrame));
        destination.Clear();
        int count = (int)Math.Min(destination.Length / 2, Math.Max(0, FrameCount - firstFrame));
        if (count == 0) return;
        Span<float> output = destination[..(count * 2)];
        if (mode == SourceMode.Reference)
        {
            project.Reference.Samples.AsSpan(checked((int)(firstFrame * 2)), count * 2).CopyTo(output);
            ApplyGain(output, Math.Pow(10, project.ReferenceGainDb / 20));
        }
        else
        {
            float[] blockBuffer = ArrayPool<float>.Shared.Rent(EffectBlockFrames * 2);
            try
            {
                foreach (var layer in layers)
                {
                    if (layer.Channel.Muted || (solo.HasValue && layer.Channel.Id != solo)) continue;
                    long block = firstFrame / EffectBlockFrames;
                    while (block * EffectBlockFrames < firstFrame + count)
                    {
                        long blockStart = block++ * EffectBlockFrames;
                        Span<float> rendered = blockBuffer.AsSpan(0, EffectBlockFrames * 2);
                        RenderLayerBlock(layer, blockStart, rendered);
                        long begin = Math.Max(firstFrame, blockStart), end = Math.Min(firstFrame + count, blockStart + EffectBlockFrames);
                        int source = checked((int)(begin - blockStart) * 2), target = checked((int)(begin - firstFrame) * 2);
                        for (int i = 0; i < (end - begin) * 2; i++) output[target + i] += rendered[source + i];
                    }
                }
            }
            finally { ArrayPool<float>.Shared.Return(blockBuffer); }
            ApplyGain(output, Math.Pow(10, project.MasterGainDb / 20));
        }
        for (int i = 0; i < count; i++)
        {
            // A 3 ms cosine edge removes a clip-boundary discontinuity without normalizing the music.
            double edge = Math.Min(1, Math.Min((firstFrame + i) / 144d, (FrameCount - 1 - firstFrame - i) / 144d));
            double gain = .5 - .5 * Math.Cos(Math.PI * Math.Max(0, edge));
            output[i * 2] *= (float)gain; output[i * 2 + 1] *= (float)gain;
        }
    }

    private void RenderLayerBlock(LayerPlan layer, long start, Span<float> destination)
    {
        double progress = Math.Clamp((start + EffectBlockFrames * .5) / FrameCount, 0, 1);
        double cutoff = Math.Clamp(layer.Sound.BrightnessHz * Math.Pow(2, layer.Sound.Sweep * 4 * (progress - .5)), 80, 20000);
        double r = Math.Exp(-2 * Math.PI * cutoff / ReferenceRenderer.SampleRate), a = 1 - r;
        // A finite, normalized exponential kernel has exact random access. Fixed absolute blocks
        // make offline export, seeking and arbitrarily split playback reads agree bit for bit.
        int history = Math.Clamp((int)Math.Ceiling(Math.Log(1e-6) / Math.Log(r)), 2, 2048);
        double tail = Math.Pow(r, history), scale = 1 / (1 - tail);
        float[] rented = ArrayPool<float>.Shared.Rent((EffectBlockFrames + history) * 2);
        try
        {
            Span<float> dry = rented.AsSpan(0, (EffectBlockFrames + history) * 2); dry.Clear();
            long first = start - history;
            AddDry(layer, first, dry, 1);
            if (layer.Sound.EchoMix > 0)
            {
                double delay = ReferenceRenderer.SampleRate * 60 / project.Phrase.Tempo * .5;
                for (int tap = 1; tap <= 3; tap++)
                    AddDry(layer, first - (long)Math.Round(delay * tap), dry, layer.Sound.EchoMix * Math.Pow(.45, tap - 1));
            }
            double left = 0, right = 0;
            for (int i = 0; i < history; i++)
            {
                left = a * dry[i * 2] + r * left;
                right = a * dry[i * 2 + 1] + r * right;
            }
            for (int i = 0; i < EffectBlockFrames; i++)
            {
                int at = (i + history) * 2;
                left = a * dry[at] + r * left - a * tail * dry[i * 2];
                right = a * dry[at + 1] + r * right - a * tail * dry[i * 2 + 1];
                destination[i * 2] = (float)(left * scale); destination[i * 2 + 1] = (float)(right * scale);
            }
        }
        finally { ArrayPool<float>.Shared.Return(rented); }
    }

    private static void AddDry(LayerPlan layer, long start, Span<float> destination, double gain)
    {
        int frames = destination.Length / 2, done = 0;
        while (done < frames)
        {
            long at = start + done;
            if (at < 0) { done += (int)Math.Min(frames - done, -at); continue; }
            long index = at / DryBlockFrames;
            int offset = (int)(at - index * DryBlockFrames), take = Math.Min(frames - done, DryBlockFrames - offset);
            float[] block = layer.GetDryBlock(index);
            for (int i = 0; i < take * 2; i++) destination[done * 2 + i] += (float)(block[offset * 2 + i] * gain);
            done += take;
        }
    }

    private static void ApplyGain(Span<float> output, double gain)
    {
        if (gain == 1) return;
        for (int i = 0; i < output.Length; i++) output[i] *= (float)gain;
    }

    private sealed class LayerPlan
    {
        internal readonly PhraseChannel Channel;
        internal readonly LayerSound Sound;
        internal readonly ScheduledVoice[] Voices;
        private readonly double[] prefixEnds;
        private readonly VoiceBlockCache cache;
        private readonly object dryGate = new();
        private readonly Dictionary<long, float[]> dryBlocks = [];
        private readonly Queue<long> dryOrder = [];
        private const int MaximumDryBlocks = 32;
        internal LayerPlan(PhraseChannel channel, LayerSound sound, double framesPerTick, VoiceBlockCache cache)
        {
            Channel = channel; Sound = sound; this.cache = cache;
            Voices = channel.Timbre is null ? [] : channel.Notes.Select(note => new ScheduledVoice(note.StartTick * framesPerTick,
                new InstrumentVoice(channel.Timbre, note.Pitch, note.LengthTick * framesPerTick / ReferenceRenderer.SampleRate,
                    note.Velocity, channel.GainDb, ReferenceRenderer.SampleRate),
                new VoiceIdentity(channel.Timbre, note.Pitch, note.LengthTick * framesPerTick / ReferenceRenderer.SampleRate,
                    note.Velocity, channel.GainDb))).OrderBy(v => v.Start).ToArray();
            prefixEnds = new double[Voices.Length]; double end = 0;
            for (int i = 0; i < Voices.Length; i++) prefixEnds[i] = end = Math.Max(end, Voices[i].End);
        }
        internal float[] GetDryBlock(long index)
        {
            lock (dryGate) if (dryBlocks.TryGetValue(index, out var found)) return found;
            long start = index * DryBlockFrames;
            float[] values = new float[DryBlockFrames * 2];
            int low = FirstEndAfter(start), high = FirstStartAtOrAfter(start + DryBlockFrames), active = 0;
            for (int i = low; i < high; i++)
            {
                var voice = Voices[i]; if (voice.End <= start) continue;
                if (++active > MaximumVoicesPerWindow) throw new InvalidOperationException("同一声音层同时发声音符过多，请减少重叠或缩短释音。");
                cache.Add(voice, start - voice.Start, values);
            }
            lock (dryGate)
            {
                if (dryBlocks.TryGetValue(index, out var found)) return found;
                if (dryBlocks.Count >= MaximumDryBlocks) dryBlocks.Remove(dryOrder.Dequeue());
                dryBlocks.Add(index, values); dryOrder.Enqueue(index); return values;
            }
        }
        internal int FirstEndAfter(double value)
        {
            int low = 0, high = prefixEnds.Length;
            while (low < high) { int mid = low + (high - low) / 2; if (prefixEnds[mid] <= value) low = mid + 1; else high = mid; }
            return low;
        }
        internal int FirstStartAtOrAfter(double value)
        {
            int low = 0, high = Voices.Length;
            while (low < high) { int mid = low + (high - low) / 2; if (Voices[mid].Start < value) low = mid + 1; else high = mid; }
            return low;
        }
    }
    private sealed record ScheduledVoice(double Start, InstrumentVoice Voice, VoiceIdentity Identity)
    { internal double End => Start + Voice.TotalFrames; }
    private readonly record struct VoiceIdentity(InstrumentPatch Patch, int Pitch, double HeldSeconds, double Velocity, double GainDb);
    private readonly record struct VoiceBlockKey(VoiceIdentity Identity, long FractionBits, long Index);

    /// <summary>At most 8 MiB of reusable voice windows, plus 128 KiB per layer of dry audio.
    /// A new edit inherits only windows for unchanged immutable patches; no complete song is baked.</summary>
    private sealed class VoiceBlockCache
    {
        private const int MaximumBlocks = 2048;
        private readonly object gate = new();
        private readonly Dictionary<VoiceBlockKey, LinkedListNode<Entry>> blocks = [];
        private readonly LinkedList<Entry> order = [];
        private sealed record Entry(VoiceBlockKey Key, float[] Samples);

        internal VoiceBlockCache(IEnumerable<InstrumentPatch> allowedPatches, VoiceBlockCache? previous)
        {
            if (previous is null) return;
            var allowed = allowedPatches.ToHashSet();
            lock (previous.gate)
                foreach (var entry in previous.order)
                    if (allowed.Contains(entry.Key.Identity.Patch))
                    { var node = order.AddLast(entry); blocks.Add(entry.Key, node); }
        }

        internal void Add(ScheduledVoice voice, double firstVoiceFrame, Span<float> destination)
        {
            int frames = destination.Length / 2;
            int begin = Math.Max(0, (int)Math.Ceiling(-firstVoiceFrame));
            int end = Math.Min(frames, (int)Math.Ceiling(voice.Voice.TotalFrames - firstVoiceFrame));
            if (end <= begin) return;
            long firstInteger = checked((long)Math.Floor(firstVoiceFrame));
            double fraction = firstVoiceFrame - firstInteger;
            for (int done = begin; done < end;)
            {
                long at = firstInteger + done, index = (long)Math.Floor(at / (double)VoiceBlockFrames);
                int offset = checked((int)(at - index * VoiceBlockFrames)), take = Math.Min(end - done, VoiceBlockFrames - offset);
                var key = new VoiceBlockKey(voice.Identity, BitConverter.DoubleToInt64Bits(fraction), index);
                float[] block = Get(key, voice.Voice, fraction);
                for (int i = 0; i < take * 2; i++) destination[done * 2 + i] += block[offset * 2 + i];
                done += take;
            }
        }

        private float[] Get(VoiceBlockKey key, InstrumentVoice voice, double fraction)
        {
            lock (gate)
                if (blocks.TryGetValue(key, out var existing))
                { order.Remove(existing); order.AddLast(existing); return existing.Value.Samples; }
            float[] samples = new float[VoiceBlockFrames * 2];
            voice.Add(key.Index * VoiceBlockFrames + fraction, samples);
            lock (gate)
            {
                if (blocks.TryGetValue(key, out var existing)) return existing.Value.Samples;
                if (blocks.Count >= MaximumBlocks)
                { var first = order.First!; blocks.Remove(first.Value.Key); order.RemoveFirst(); }
                var node = order.AddLast(new Entry(key, samples)); blocks.Add(key, node); return samples;
            }
        }
    }
}
