using System.Security.Cryptography;
using System.Text;
using RootSound.SampleEditor.Playback;
using RootSound.TimbreLab.Audio;
using RootSound.TimbreLab.Core;

namespace RootSound.TimbreLab.Tests;

internal static class HostChecks
{
    internal static int Run(string directory)
    {
        Directory.CreateDirectory(directory);
        int groups = 0;
        string path = Path.Combine(directory, "原始-立体声.wav");
        float[] expected = Enumerable.Range(0, 800).Select(i => (float)(Math.Sin(i * .2) * .5)).ToArray();
        WriteWave(path, 8000, 2, expected);
        string originalHash = Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(path)));
        PcmClip imported = ImportBridge.ImportAsync(path).GetAwaiter().GetResult();
        Require(imported.SampleRate == 8000 && imported.Channels == 2 && imported.FrameCount == 400,
            "Import must preserve frame/rate/channel identity.");
        Require(imported.Samples.SequenceEqual(expected), "Float WAV import changed samples.");
        Require(imported.Name == "原始-立体声", "Import name should come from the file name.");
        groups++;

        Require(Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(path))) == originalHash,
            "Import must never modify its source file.");
        using (File.Open(path, FileMode.Open, FileAccess.ReadWrite, FileShare.None)) { }
        groups++;

        using (var cancelled = new CancellationTokenSource())
        {
            cancelled.Cancel();
            Expect<OperationCanceledException>(() => ImportBridge.ImportAsync(path, cancellationToken: cancelled.Token).GetAwaiter().GetResult());
        }
        groups++;

        string invalid = Path.Combine(directory, "invalid.wav");
        File.WriteAllBytes(invalid, [0x52, 0x49, 0x46, 0x46]);
        Expect<Exception>(() => ImportBridge.ImportAsync(invalid).GetAwaiter().GetResult());
        Expect<FileNotFoundException>(() => ImportBridge.ImportAsync(Path.Combine(directory, "missing.wav")).GetAwaiter().GetResult());
        groups++;

        string longPath = Path.Combine(directory, "too-long.wav");
        WriteWave(longPath, 8000, 1, new float[8000 * 31]);
        Expect<InvalidDataException>(() => ImportBridge.ImportAsync(longPath).GetAwaiter().GetResult());
        ImportBridge.ValidateFormat(8000, 1, 8000 * 30);
        Expect<InvalidDataException>(() => ImportBridge.ValidateFormat(8000, 1, 8000 * 30 + 1));
        groups++;

        ImportBridge.ValidateFormat(192000, 2, 192000 * 30);
        Expect<InvalidDataException>(() => ImportBridge.ValidateFormat(8000, 9, 800));
        Expect<InvalidDataException>(() => ImportBridge.ValidateFormat(192000, 8, 192000 * 30));
        Expect<InvalidDataException>(() => ImportBridge.ValidateFormat(8000, 1, 0));
        groups++;

        PcmClip tiny = new(8000, 1, [.1f, -.1f], "tiny");
        ImportBridge.ValidateCollectionCanAdd(Enumerable.Repeat(tiny, 7), tiny);
        Expect<InvalidOperationException>(() => ImportBridge.ValidateCollectionCanAdd(Enumerable.Repeat(tiny, 8), tiny));
        groups++;

        var adapter = new PcmClipAdapter(imported);
        float saved = imported.Samples[0];
        imported.Samples[0] = 1;
        float[] probe = new float[4];
        Require(adapter.ReadFrames(0, probe) == 2 && probe[0] == saved,
            "Preview source must own a stable snapshot.");
        imported.Samples[0] = saved;
        groups++;

        var tail = new float[8];
        Array.Fill(tail, float.NaN);
        Require(adapter.ReadFrames(adapter.FrameCount - 1, tail) == 1, "Tail read returned wrong count.");
        Require(tail[0] == expected[^2] && tail[1] == expected[^1] && tail.Skip(2).All(v => v == 0),
            "Tail read must preserve channels and zero-fill padding.");
        Require(adapter.ReadFrames(adapter.FrameCount, tail) == 0 && tail.All(v => v == 0),
            "EOF read must succeed and clear output.");
        groups++;

        Expect<ArgumentOutOfRangeException>(() => adapter.ReadFrames(-1, new float[2]));
        Expect<ArgumentOutOfRangeException>(() => adapter.ReadFrames(adapter.FrameCount + 1, new float[2]));
        Expect<ArgumentException>(() => adapter.ReadFrames(0, new float[3]));
        groups++;

        Parallel.For(0, 64, i =>
        {
            long frame = i % adapter.FrameCount;
            var values = new float[16];
            int read = adapter.ReadFrames(frame, values);
            Require(read == 8 && values[0] == expected[checked((int)(frame * 2))], "Concurrent reads interfered.");
        });
        groups++;

        string eightPath = Path.Combine(directory, "eight-channel.wav");
        float[] eight = Enumerable.Range(0, 80).Select(i => i / 100f).ToArray();
        WriteWave(eightPath, 8000, 8, eight);
        PcmClip eightClip = ImportBridge.ImportAsync(eightPath).GetAwaiter().GetResult();
        Require(eightClip.Channels == 8 && eightClip.FrameCount == 10 && eightClip.Samples.SequenceEqual(eight),
            "Eight-channel import must preserve complete interleaved frames.");
        groups++;

        CheckUnshownFormInitialization();
        groups++;

        groups += CheckAuditionSessionAsync().GetAwaiter().GetResult();

        File.WriteAllText(Path.Combine(directory, "host-summary.txt"),
            $"PASS {groups} host checks; generated fixtures only; no output device opened; source unchanged; formConstructorAndLayoutChecked=true; formShown=false.\n", new UTF8Encoding(false));
        return groups;
    }

    internal static void CheckUnshownFormInitialization()
    {
        Exception? error = null;
        var thread = new Thread(() =>
        {
            try
            {
                using var form = new MainForm();
                form.PerformLayout();
                Require(!form.Visible && !form.IsHandleCreated, "Constructor/layout must not show the Form or create its handle.");
                var pending = new Stack<Control>();
                pending.Push(form);
                int count = 0;
                while (pending.TryPop(out var control))
                {
                    Require(!control.IsHandleCreated && !control.Visible,
                        "Constructor/layout unexpectedly created or displayed a public child-control handle: " + control.GetType().Name);
                    foreach (Control child in control.Controls) pending.Push(child);
                    count++;
                }
                Require(count > 60, "Expected the complete editor control tree to be initialized.");
                form.Size = form.MinimumSize;
                form.PerformLayout();
                void LayoutTree(Control control)
                { control.PerformLayout(); foreach (Control child in control.Controls) LayoutTree(child); }
                LayoutTree(form);
                foreach (string field in new[] { "_play", "_stop", "_zoomIn", "_zoomOut", "_fit", "_pan", "_pianoMode", "_sampleMode", "_lowerKeys", "_middleKeys", "_higherKeys", "_keyPitch", "_keys" })
                {
                    var control = (Control)typeof(MainForm).GetField(field, System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic)!.GetValue(form)!;
                    Require(control.Parent is not null && control.Right <= control.Parent.ClientSize.Width && control.Bottom <= control.Parent.ClientSize.Height,
                        $"Compact graph control is clipped at minimum size: {field}; control={control.Bounds}; parent={control.Parent?.ClientSize}; parentBounds={control.Parent?.Bounds}");
                }
                Require(!form.Visible && !form.IsHandleCreated, "Minimum-size layout must remain offscreen.");
            }
            catch (Exception ex) { error = ex; }
        }) { IsBackground = true };
        thread.SetApartmentState(ApartmentState.STA);
        thread.Start();
        Require(thread.Join(TimeSpan.FromSeconds(20)), "Unshown constructor/layout check timed out.");
        if (error is not null) throw new InvalidOperationException("Unshown Form constructor/layout check failed.", error);
    }

    private static async Task<int> CheckAuditionSessionAsync()
    {
        int groups = 0;
        static PcmClip Clip(string name) => new(8000, 1, [.1f, .2f, .3f, .4f], name);

        var created = new List<FakeVoice>();
        await using (var session = new AuditionSession((clip, note) => { var voice = new FakeVoice(clip.Name, note); created.Add(voice); return voice; }))
        {
            await session.SetAsync(Clip("normal"), true, 999, false);
            Require(session.Current is { IsNote: true } && session.Current.Snapshot.PositionFrames == 4 && !session.Current.Snapshot.IsPlaying,
                "Session must preserve note mode, clamp seek and honor paused state.");
            var voice = session.Current ?? throw new InvalidOperationException("Missing preview voice.");
            voice.Play(); Require(voice.Snapshot.IsPlaying, "Voice play missing.");
            voice.Pause(); Require(!voice.Snapshot.IsPlaying, "Voice pause missing.");
            await session.StopAsync();
            Require(session.Current is null && created[0].DisposeCount == 1, "Stop must own and release the current voice.");
        }
        groups++;

        created.Clear();
        var gate = NewCompletion();
        await using (var session = new AuditionSession((clip, note) => { var voice = new FakeVoice(clip.Name, note, clip.Name == "A" ? gate.Task : null); created.Add(voice); return voice; }))
        {
            await session.SetAsync(Clip("A"), false);
            Task replacement = session.SetAsync(Clip("B"), false);
            await created[0].DisposeStarted.Task;
            Task latest = session.SetAsync(Clip("C"), true);
            gate.SetResult();
            await Task.WhenAll(replacement, latest);
            Require(created.Select(v => v.Name).SequenceEqual(["A", "C"]) && ReferenceEquals(session.Current, created[1]),
                "A newer request must supersede a queued replacement rather than leak a second playing voice.");
            Require(created[0].DisposeCount == 1 && created[1].DisposeCount == 0, "Voice lifetime accounting is wrong.");
        }
        groups++;

        created.Clear(); gate = NewCompletion();
        await using (var session = new AuditionSession((clip, note) => { var voice = new FakeVoice(clip.Name, note, gate.Task); created.Add(voice); return voice; }))
        {
            await session.SetAsync(Clip("A"), false);
            Task replacement = session.SetAsync(Clip("B"), false);
            await created[0].DisposeStarted.Task;
            Task stop = session.StopAsync();
            gate.SetResult();
            await Task.WhenAll(replacement, stop);
            Require(created.Count == 1 && session.Current is null, "Stop must invalidate replacement waiting for old voice cleanup.");
            await session.StopAsync();
        }
        groups++;

        created.Clear();
        await using (var session = new AuditionSession((clip, note) => { var voice = new FakeVoice(clip.Name, note); created.Add(voice); return voice; }))
        using (var renderCancellation = new CancellationTokenSource())
        {
            await session.SetAsync(Clip("A"), false);
            var renderGate = NewCompletion();
            Task lateRender = Task.Run(async () =>
            {
                await renderGate.Task;
                await session.SetAsync(Clip("late-note"), true, cancellationToken: renderCancellation.Token);
            });
            renderCancellation.Cancel();
            await session.StopAsync();
            renderGate.SetResult();
            await ExpectAsync<OperationCanceledException>(lateRender);
            Require(session.Current is null && created.Count == 1, "A cancelled note render must not resurrect playback after stop.");
        }
        groups++;

        created.Clear(); gate = NewCompletion();
        await using (var session = new AuditionSession((clip, note) => { var voice = new FakeVoice(clip.Name, note, clip.Name == "A" ? gate.Task : null); created.Add(voice); return voice; }))
        using (var cancelled = new CancellationTokenSource())
        {
            await session.SetAsync(Clip("A"), false);
            Task replacement = session.SetAsync(Clip("cancelled-B"), false, cancellationToken: cancelled.Token);
            await created[0].DisposeStarted.Task;
            cancelled.Cancel(); gate.SetResult();
            await ExpectAsync<OperationCanceledException>(replacement);
            Require(session.Current is null && created.Count == 1, "Cancellation after cleanup must not create a candidate voice.");
            await session.SetAsync(Clip("C"), false);
            Require(created.Count == 2 && ReferenceEquals(session.Current, created[1]), "Cancelled replacement must release the serialization gate.");
        }
        groups++;

        created.Clear(); gate = NewCompletion();
        var disposedSession = new AuditionSession((clip, note) => { var voice = new FakeVoice(clip.Name, note, gate.Task); created.Add(voice); return voice; });
        await disposedSession.SetAsync(Clip("A"), false);
        Task pending = disposedSession.SetAsync(Clip("B"), false);
        await created[0].DisposeStarted.Task;
        Task dispose = disposedSession.DisposeAsync().AsTask();
        gate.SetResult(); await Task.WhenAll(pending, dispose);
        Require(disposedSession.Current is null && created.Count == 1, "Closing must invalidate all queued replacements.");
        await disposedSession.DisposeAsync();
        await ExpectAsync<ObjectDisposedException>(disposedSession.SetAsync(Clip("after-close"), false));
        groups++;

        created.Clear();
        await using (var session = new AuditionSession((clip, note) =>
        {
            if (clip.Name == "failure") throw new InvalidOperationException("fixture factory failure");
            var voice = new FakeVoice(clip.Name, note); created.Add(voice); return voice;
        }))
        {
            await session.SetAsync(Clip("A"), false);
            await ExpectAsync<InvalidOperationException>(session.SetAsync(Clip("failure"), false));
            Require(session.Current is null && created[0].DisposeCount == 1, "Factory error must release the previous voice.");
            await session.SetAsync(Clip("recovered"), false);
            Require(created.Count == 2 && ReferenceEquals(session.Current, created[1]), "Factory error must not leave the gate locked.");
        }
        groups++;

        created.Clear();
        await using (var session = new AuditionSession((clip, note) => { var voice = new FakeVoice(clip.Name, note) { FailPlay = true }; created.Add(voice); return voice; }))
        {
            await ExpectAsync<InvalidOperationException>(session.SetAsync(Clip("failure"), false));
            Require(session.Current is null && created.Single().DisposeCount == 1, "A candidate that fails to start must be disposed.");
        }
        groups++;
        return groups;
    }

    private static TaskCompletionSource NewCompletion() => new(TaskCreationOptions.RunContinuationsAsynchronously);
    private static async Task ExpectAsync<T>(Task task) where T : Exception
    {
        try { await task; }
        catch (T) { return; }
        throw new InvalidOperationException("Expected asynchronous exception: " + typeof(T).Name);
    }

    private sealed class FakeVoice(string name, bool note, Task? cleanup = null) : IAuditionVoice
    {
        public string Name { get; } = name;
        public bool IsNote { get; } = note;
        public bool FailPlay { get; init; }
        public PlaybackSnapshot Snapshot { get; private set; } = new(0, false, 1, null);
        public int DisposeCount { get; private set; }
        public TaskCompletionSource DisposeStarted { get; } = NewCompletion();
        public void Play() { if (FailPlay) throw new InvalidOperationException("fixture play failure"); Snapshot = Snapshot with { IsPlaying = true }; }
        public void Pause() => Snapshot = Snapshot with { IsPlaying = false };
        public long Seek(double frame)
        { Snapshot = Snapshot with { PositionFrames = frame, SeekRevision = Snapshot.SeekRevision + 1 }; return Snapshot.SeekRevision; }
        public async ValueTask DisposeAsync()
        {
            DisposeStarted.TrySetResult();
            if (cleanup is not null) await cleanup;
            DisposeCount++;
            Snapshot = Snapshot with { IsPlaying = false };
        }
    }

    private static void WriteWave(string path, int sampleRate, int channels, float[] samples)
    {
        using var stream = new FileStream(path, FileMode.Create, FileAccess.Write);
        using var writer = new BinaryWriter(stream, Encoding.ASCII);
        int dataBytes = checked(samples.Length * sizeof(float));
        writer.Write("RIFF"u8); writer.Write(36 + dataBytes); writer.Write("WAVEfmt "u8); writer.Write(16);
        writer.Write((ushort)3); writer.Write((ushort)channels); writer.Write(sampleRate);
        writer.Write(checked(sampleRate * channels * sizeof(float))); writer.Write((ushort)(channels * sizeof(float)));
        writer.Write((ushort)32); writer.Write("data"u8); writer.Write(dataBytes);
        foreach (float sample in samples) writer.Write(sample);
    }

    private static void Require(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException(message);
    }

    private static void Expect<T>(Action action) where T : Exception
    {
        try { action(); }
        catch (T) { return; }
        throw new InvalidOperationException("Expected exception: " + typeof(T).Name);
    }
}
