using RootSound.BluetoothRecorder.Session;

namespace RootSound.BluetoothRecorder.Tests;

// Fake Bluetooth/audio ports and files created below this test's isolated directory only.
internal static class SessionChecks
{
    internal static async Task<int> RunAsync(string directory)
    {
        Directory.CreateDirectory(directory);
        int count = 0;
        await Check("connection gates recording and normal close keeps export", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            string output = Path.Combine(folder, "keep.wav");
            await using (RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes")))
            {
                Require(!session.Snapshot.CanRecord && !session.Snapshot.CanExport, "disconnected gates");
                await session.ConnectAsync(); Require(session.Snapshot.CanRecord, "open connection enables recording");
                await session.StartAsync(); Require(session.Snapshot.CanStop && !session.Snapshot.CanExport, "recording gates");
                await session.StopAsync(); Require(session.Snapshot.CanExport && !session.Snapshot.CanStop, "stopped take enables export");
                await session.ExportAsync(output); Require(session.Snapshot.ExportCount == 1 && File.Exists(output), "export tracked");
            }
            Require(File.Exists(output), "normal close preserves exported file");
            Require(!Directory.EnumerateFiles(Path.Combine(folder, "takes"), "*", SearchOption.AllDirectories).Any(), "normal close clears private take");
        });
        await Check("restart clears private take and preserves every exported file", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await Prepare(session);
            string first = Path.Combine(folder, "one.wav"), second = Path.Combine(folder, "two.wav"), unrelated = Path.Combine(folder, "unrelated.wav");
            File.WriteAllText(unrelated, "keep me");
            await session.ExportAsync(first); await session.ExportAsync(first, true); await session.ExportAsync(second);
            byte[] original = File.ReadAllBytes(first);
            string privateTake = capture.CurrentPath!;
            Require(session.Snapshot.ExportCount == 2, "same target counted once");
            await session.RestartAsync();
            Require(File.ReadAllBytes(first).SequenceEqual(original) && File.ReadAllBytes(second).SequenceEqual(original), "all exports remain byte-identical");
            Require(File.ReadAllText(unrelated) == "keep me", "unrelated file untouched");
            Require(session.Snapshot.Phase == SessionPhase.Ready && session.Snapshot.CanRecord && !session.Snapshot.CanExport
                && session.Snapshot.Duration == TimeSpan.Zero && session.Snapshot.DataBytes == 0
                && session.Snapshot.LastExport is null && session.Snapshot.ExportCount == 0, "only current take state reset");
            Require(receiver.IsConnected && receiver.Stops == 0 && receiver.Connects == 1, "Bluetooth session remains untouched");
            Require(!File.Exists(privateTake), "private take removed");
        });
        await Check("externally edited and replaced exports are preserved", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await Prepare(session);
            string edited = Path.Combine(folder, "edited.wav"), replaced = Path.Combine(folder, "replaced.wav");
            await session.ExportAsync(edited); await session.ExportAsync(replaced);
            byte[] original = File.ReadAllBytes(replaced);
            File.WriteAllText(edited, "external user work");
            string replacement = Path.Combine(folder, "replacement.wav"); File.WriteAllBytes(replacement, original);
            File.Move(replacement, replaced, true);
            await session.RestartAsync();
            Require(File.ReadAllText(edited) == "external user work", "edited bytes preserved");
            Require(File.ReadAllBytes(replaced).SequenceEqual(original), "same bytes with different file identity preserved");
            Require(session.Snapshot.ExportCount == 0 && session.Snapshot.Error is null, "exports are user documents without ownership checks");
        });
        await Check("restart never opens or modifies locked exports", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await Prepare(session);
            string output = Path.Combine(folder, "busy.wav"); await session.ExportAsync(output);
            byte[] original = File.ReadAllBytes(output);
            using (FileStream locked = new(output, FileMode.Open, FileAccess.Read, FileShare.None))
            {
                await session.RestartAsync();
                Require(File.Exists(output) && session.Snapshot.ExportCount == 0 && session.Snapshot.CanRecord, "locked export does not obstruct restart");
                Require(session.Snapshot.Error is null, "no export deletion attempted");
            }
            await session.RestartAsync();
            Require(File.ReadAllBytes(output).SequenceEqual(original) && session.Snapshot.ExportCount == 0, "repeated restart preserves export");
        });
        await Check("failed export preserves stopped take and target", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await Prepare(session);
            string existing = Path.Combine(folder, "existing.wav"); File.WriteAllText(existing, "other work");
            await session.ExportAsync(existing);
            Require(File.ReadAllText(existing) == "other work" && session.Snapshot.CanExport, "no implicit overwrite and take retained");
            Require(session.Snapshot.Error is not null && session.Snapshot.ExportCount == 0, "failure reported, no ownership claim");
            await session.ExportAsync(Path.Combine(folder, "retry.wav"));
            Require(session.Snapshot.Error is null && session.Snapshot.ExportCount == 1, "successful retry clears error");
        });
        await Check("restart cancels pending start and duplicate start is ignored", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            TaskCompletionSource entered = new(TaskCreationOptions.RunContinuationsAsynchronously);
            capture.StartHook = async token => { entered.TrySetResult(); await Task.Delay(Timeout.Infinite, token); };
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await session.ConnectAsync();
            Task pending = session.StartAsync(); await entered.Task;
            await session.StartAsync(); Require(capture.Starts == 1, "double start ignored");
            await session.RestartAsync(); await pending;
            Require(session.Snapshot.Phase == SessionPhase.Ready && session.Snapshot.CanRecord && !session.Snapshot.CanStop && !session.Snapshot.CanExport, "cancelled start cannot resurrect take or disconnect phone");
            Require(!Directory.EnumerateFiles(Path.Combine(folder, "takes"), "*", SearchOption.AllDirectories).Any(), "cancelled private file removed");
            capture.StartHook = null;
            await session.StartAsync(); await session.StopAsync();
            Require(session.Snapshot.CanExport && receiver.Connects == 1 && receiver.Stops == 0, "recording can start again without reconnecting");
        });
        await Check("disconnect during starting preserves any captured data", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            capture.StartHook = _ => { receiver.SetConnected(false); return Task.CompletedTask; };
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await session.ConnectAsync(); await session.StartAsync();
            Require(session.Snapshot.Phase == SessionPhase.Recorded && session.Snapshot.CanExport, "disconnect reconciled after start");
        });
        await Check("capture failure arriving before Start returns is not lost", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            capture.StartHook = _ => { capture.Fail("fabricated endpoint loss"); return Task.CompletedTask; };
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await session.ConnectAsync(); await session.StartAsync();
            Require(session.Snapshot.Phase == SessionPhase.Recorded && session.Snapshot.CanExport && !session.Snapshot.CanStop,
                "failed producer must not leave phantom Recording state");
            Require(session.Snapshot.Error?.Contains("fabricated endpoint loss", StringComparison.Ordinal) == true, "underlying failure shown");
        });
        await Check("disconnect during recording automatically ends and retains take", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await session.ConnectAsync(); await session.StartAsync();
            TaskCompletionSource ended = new(TaskCreationOptions.RunContinuationsAsynchronously);
            session.Changed += (_, _) => { if (session.Snapshot.Phase == SessionPhase.Recorded) ended.TrySetResult(); };
            receiver.SetConnected(false); await ended.Task.WaitAsync(TimeSpan.FromSeconds(3));
            Require(session.Snapshot.CanExport && !session.Snapshot.CanStop && !capture.Progress.IsRecording,
                "disconnect stops producer and retains exportable take");
            Require(session.Snapshot.Status.Contains("断开", StringComparison.Ordinal), "disconnect explanation");
        });
        await Check("unexpected producer stop while recording exposes failure and export", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await session.ConnectAsync(); await session.StartAsync();
            TaskCompletionSource ended = new(TaskCreationOptions.RunContinuationsAsynchronously);
            session.Changed += (_, _) => { if (session.Snapshot.Phase == SessionPhase.Recorded) ended.TrySetResult(); };
            capture.Fail("fabricated mid-recording loss"); await ended.Task.WaitAsync(TimeSpan.FromSeconds(3));
            Require(session.Snapshot.CanExport && !session.Snapshot.CanStop, "stopped producer recovered");
            Require(session.Snapshot.Error?.Contains("fabricated mid-recording loss", StringComparison.Ordinal) == true, "failure retained");
        });
        await Check("restart interrupts pending export without stale state or deleting prior export", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await Prepare(session);
            string prior = Path.Combine(folder, "previous-export.wav"), cancelled = Path.Combine(folder, "cancelled-export.wav");
            await session.ExportAsync(prior);
            byte[] priorBytes = File.ReadAllBytes(prior);
            Task? reset = null;
            session.Changed += (_, _) =>
            {
                if (reset is null && session.Snapshot.Phase == SessionPhase.Exporting)
                    reset = session.RestartAsync();
            };
            await session.ExportAsync(cancelled);
            Require(reset is not null, "restart injected after export begins"); await reset!;
            Require(session.Snapshot.Phase == SessionPhase.Ready && session.Snapshot.ExportCount == 0
                && session.Snapshot.LastExport is null && !session.Snapshot.CanExport, "late export cannot restore take");
            Require(!File.Exists(cancelled) && File.ReadAllBytes(prior).SequenceEqual(priorBytes), "cancelled export absent and prior export intact");
            Require(!Directory.EnumerateFiles(folder, ".rootsound-recording-*.tmp").Any(), "staging file cleaned");
        });
        await Check("private cleanup failure retains stopped take for export and retry without touching connection", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await session.ConnectAsync(); await session.StartAsync();
            string current = capture.CurrentPath!;
            using (FileStream locked = new(current, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                await session.RestartAsync();
                Require(session.Snapshot.Phase == SessionPhase.Recorded && session.Snapshot.CanExport && !capture.Progress.IsRecording,
                    "failed reset leaves stopped current take visible");
                Require(File.Exists(current) && session.Snapshot.Error is not null && receiver.IsConnected && receiver.Stops == 0,
                    "current data and cleanup failure retained, receiver untouched");
            }
            string recovered = Path.Combine(folder, "recovered.wav"); await session.ExportAsync(recovered);
            byte[] recoveredBytes = File.ReadAllBytes(current);
            Require(File.ReadAllBytes(recovered).SequenceEqual(recoveredBytes), "retained take can be exported");
            await session.RestartAsync();
            Require(session.Snapshot.Phase == SessionPhase.Ready && !File.Exists(current)
                && File.ReadAllBytes(recovered).SequenceEqual(recoveredBytes), "retry clears private take and preserves recovery export");
        });
        await Check("failed fresh start cannot adopt a stale stopped result from previous take", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await Prepare(session);
            string previous = capture.CurrentPath!;
            await session.RestartAsync();
            // An old result may outlive its private take; make its path exist again so
            // a mere File.Exists check cannot accidentally qualify it as this take.
            Directory.CreateDirectory(Path.GetDirectoryName(previous)!);
            File.WriteAllBytes(previous, [9, 8, 7, 6]);
            capture.BeforeStartHook = _ => Task.FromException(new IOException("fabricated failure before capture state reset"));
            await session.ConnectAsync(); await session.StartAsync();
            Require(!session.Snapshot.CanExport && session.Snapshot.DataBytes == 0 && session.Snapshot.CanRecord,
                "old capture result is not attached to new take");
            Require(session.Snapshot.Error?.Contains("fabricated failure before capture state reset", StringComparison.Ordinal) == true,
                "fresh start failure exposed");
            Require(File.ReadAllBytes(previous).SequenceEqual(new byte[] { 9, 8, 7, 6 }), "unrelated old-path bytes untouched");
            capture.BeforeStartHook = null;
            await session.StartAsync(); await session.StopAsync();
            Require(session.Snapshot.CanExport && capture.CurrentPath != previous, "fresh start remains recoverable");
            Require(File.ReadAllBytes(previous).SequenceEqual(new byte[] { 9, 8, 7, 6 }), "successful retry does not alter stale path");
        });
        await Check("restart from idle and ready never stops or reopens Bluetooth", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await session.RestartAsync();
            Require(session.Snapshot.Phase == SessionPhase.Idle && receiver.Stops == 0 && receiver.Connects == 0,
                "idle restart has no receiver lifecycle effect");
            await session.ConnectAsync();
            for (int i = 0; i < 3; i++) await session.RestartAsync();
            Require(session.Snapshot.CanRecord && receiver.IsConnected && receiver.Stops == 0 && receiver.Connects == 1,
                "ready restarts preserve existing session");
        });
        await Check("repeated recording and restart cycles retain receiver and previous exports", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            await session.ConnectAsync();
            var exports = new Dictionary<string, byte[]>();
            var privatePaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            for (int i = 0; i < 4; i++)
            {
                await session.StartAsync();
                Require(session.Snapshot.Phase == SessionPhase.Recording && capture.Progress.IsRecording,
                    "fresh producer is running after every restart");
                privatePaths.Add(capture.CurrentPath!);
                if (i % 2 == 0)
                {
                    await session.StopAsync();
                    string destination = Path.Combine(folder, $"take-{i}.wav");
                    await session.ExportAsync(destination);
                    exports.Add(destination, File.ReadAllBytes(destination));
                }
                await session.RestartAsync();
                Require(session.Snapshot.CanRecord && !capture.Progress.IsRecording && session.Snapshot.Duration == TimeSpan.Zero,
                    "recorded and recording takes both restart into ready state");
                Require(privatePaths.All(path => !File.Exists(path)), "each private recording has been discarded");
                Require(exports.All(pair => File.ReadAllBytes(pair.Key).SequenceEqual(pair.Value)), "all completed exports survive subsequent takes");
            }
            Require(capture.Starts == 4 && privatePaths.Count == 4 && receiver.Connects == 1 && receiver.Stops == 0,
                "new takes have distinct storage and share one continuous receiver session");
        });
        await Check("restart during pending connection clears take without cancelling connection", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            TaskCompletionSource entered = new(TaskCreationOptions.RunContinuationsAsynchronously);
            TaskCompletionSource finish = new(TaskCreationOptions.RunContinuationsAsynchronously);
            CancellationToken connectionToken = default;
            receiver.ConnectHook = async token =>
            {
                connectionToken = token;
                entered.TrySetResult();
                await finish.Task.WaitAsync(token);
            };
            await using RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            Task connection = session.ConnectAsync();
            await entered.Task.WaitAsync(TimeSpan.FromSeconds(3));
            await session.RestartAsync().WaitAsync(TimeSpan.FromSeconds(3));
            Require(!connectionToken.IsCancellationRequested && !connection.IsCompleted && receiver.Stops == 0,
                "restart neither cancels connection nor waits for phone");
            Require(session.Snapshot.Phase == SessionPhase.Connecting && !session.Snapshot.CanRecord,
                "pending receiver remains represented while current take is empty");
            finish.TrySetResult(); await connection.WaitAsync(TimeSpan.FromSeconds(3));
            Require(session.Snapshot.CanRecord && receiver.Connects == 1, "original connection completion enables recording");
            await session.StartAsync(); await session.StopAsync();
            Require(session.Snapshot.CanExport, "recording uses fresh take cancellation token after pending-connection reset");
        });
        await Check("normal close cancels pending connection and stops receiver exactly once", async folder =>
        {
            FakeReceiver receiver = new(); FakeCapture capture = new();
            TaskCompletionSource entered = new(TaskCreationOptions.RunContinuationsAsynchronously);
            CancellationToken connectionToken = default;
            receiver.ConnectHook = async token =>
            {
                connectionToken = token; entered.TrySetResult();
                await Task.Delay(Timeout.Infinite, token);
            };
            RecorderSession session = new(receiver, capture, Path.Combine(folder, "takes"));
            Task connection = session.ConnectAsync(); await entered.Task.WaitAsync(TimeSpan.FromSeconds(3));
            await session.DisposeAsync().AsTask().WaitAsync(TimeSpan.FromSeconds(3)); await connection;
            Require(connectionToken.IsCancellationRequested && receiver.Stops == 1 && session.Snapshot.Phase == SessionPhase.Closed,
                "session close owns cancellation and receiver shutdown");
            await session.DisposeAsync();
            Require(receiver.Stops == 1, "repeated close has no lifecycle duplication");
        });
        await Check("cancelled export cannot overwrite an existing user file", async folder =>
        {
            using TakeFiles files = new(Path.Combine(folder, "takes"));
            File.WriteAllBytes(files.RecordingPath, [1, 2, 3, 4]);
            string existing = Path.Combine(folder, "existing.wav");
            byte[] original = [9, 8, 7, 6]; File.WriteAllBytes(existing, original);
            using CancellationTokenSource token = new(); token.Cancel();
            bool cancelled = false;
            try { await files.ExportAsync(existing, true, token.Token); }
            catch (OperationCanceledException) { cancelled = true; }
            Require(cancelled && files.ExportCount == 0 && File.ReadAllBytes(existing).SequenceEqual(original),
                "cancellation occurs before any publication or ownership claim");
            files.Dispose();
            Require(File.ReadAllBytes(existing).SequenceEqual(original), "private disposal cannot modify user destination");
        });
        return count;

        async Task Check(string title, Func<string, Task> action)
        {
            string folder = Path.Combine(directory, (count + 1).ToString("D2")); Directory.CreateDirectory(folder);
            await action(folder); count++; Console.WriteLine("PASS session: " + title);
        }
    }

    private static async Task Prepare(RecorderSession session)
    { await session.ConnectAsync(); await session.StartAsync(); await session.StopAsync(); Require(session.Snapshot.CanExport, "fixture ready"); }
    private static void Require(bool value, string message)
    { if (!value) throw new InvalidOperationException(message); }

    private sealed class FakeReceiver : IReceiverPort
    {
        public bool IsConnected { get; private set; }
        public string? DeviceName => IsConnected ? "fake phone" : null;
        public int Connects { get; private set; }
        public int Stops { get; private set; }
        public Func<CancellationToken, Task>? ConnectHook { get; set; }
        public event EventHandler? Changed;
        public async Task ConnectAsync(string? selectedId, CancellationToken token)
        {
            Connects++; token.ThrowIfCancellationRequested();
            if (ConnectHook is not null) await ConnectHook(token);
            token.ThrowIfCancellationRequested(); SetConnected(true);
        }
        public Task StopAsync() { Stops++; SetConnected(false); return Task.CompletedTask; }
        public void SetConnected(bool connected) { IsConnected = connected; Changed?.Invoke(this, EventArgs.Empty); }
    }
    private sealed class FakeCapture : ICapturePort
    {
        private string? path;
        public string? CurrentPath => path;
        public int Starts { get; private set; }
        public Func<CancellationToken, Task>? BeforeStartHook { get; set; }
        public Func<CancellationToken, Task>? StartHook { get; set; }
        public CaptureProgress Progress { get; private set; } = new(false, TimeSpan.Zero, 0, 0, null, null);
        public event EventHandler? Changed;
        public async Task StartAsync(string nextPath, CancellationToken token)
        {
            Starts++;
            if (BeforeStartHook is not null) await BeforeStartHook(token);
            path = nextPath;
            File.WriteAllBytes(path, [82, 73, 70, 70, 1, 2, 3, 4]);
            Progress = new(true, TimeSpan.FromMilliseconds(10), .25f, 8, "fake output", null);
            Changed?.Invoke(this, EventArgs.Empty);
            if (StartHook is not null) await StartHook(token);
        }
        public Task<CaptureTake?> StopAsync()
        {
            Progress = Progress with { IsRecording = false }; Changed?.Invoke(this, EventArgs.Empty);
            return Task.FromResult(path is null ? null : new CaptureTake(path, Progress.Duration,
                Progress.DataBytes, Progress.EndpointName, Progress.Error));
        }
        public void Fail(string error)
        { Progress = Progress with { IsRecording = false, Error = error }; Changed?.Invoke(this, EventArgs.Empty); }
    }
}
