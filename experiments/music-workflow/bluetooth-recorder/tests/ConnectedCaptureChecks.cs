using RootSound.BluetoothRecorder.Session;

namespace RootSound.BluetoothRecorder.Tests;

internal static class ConnectedCaptureChecks
{
    internal static async Task<int> RunAsync()
    {
        int count = 0;
        await Check("disconnected phones cannot start output recording", async () =>
        {
            FakeBinding fake = new() { Phone = null };
            await Expect<InvalidOperationException>(fake.Start);
            Require(fake.Starts == 0 && fake.Stops == 0, "no output opened without a connection");
        });
        await Check("connected phone starts output directly without any independent phone input", async () =>
        {
            FakeBinding fake = new(); await fake.Start();
            Require(fake.Starts == 1 && fake.Stops == 0, "no phone identity or source-discovery prerequisite");
        });
        await Check("disconnect while output opens closes that recording", async () =>
        {
            FakeBinding fake = new(); fake.StartHook = () => { fake.Phone = null; return Task.CompletedTask; };
            await Expect<InvalidOperationException>(fake.Start);
            Require(fake.Starts == 1 && fake.Stops == 1, "no recording left after disconnect");
        });
        await Check("changing phone while output opens closes that recording", async () =>
        {
            FakeBinding fake = new(); fake.StartHook = () => { fake.Phone = "phone-b"; return Task.CompletedTask; };
            await Expect<InvalidOperationException>(fake.Start);
            Require(fake.Starts == 1 && fake.Stops == 1, "stale recording stopped");
        });
        await Check("restart cancellation before start never opens output", async () =>
        {
            using CancellationTokenSource cancel = new(); cancel.Cancel();
            FakeBinding fake = new() { Token = cancel.Token };
            await Expect<OperationCanceledException>(fake.Start);
            Require(fake.Starts == 0 && fake.Stops == 0, "cancelled operation cannot begin");
        });
        await Check("restart cancellation during startup closes the completed output stream", async () =>
        {
            using CancellationTokenSource cancel = new();
            FakeBinding fake = new() { Token = cancel.Token };
            fake.StartHook = () => { cancel.Cancel(); return Task.CompletedTask; };
            await Expect<OperationCanceledException>(fake.Start);
            Require(fake.Starts == 1 && fake.Stops == 1, "no late recording after reset");
        });
        await Check("failed startup closes only the recording and permits retry on the same connection", async () =>
        {
            FakeBinding fake = new() { StartHook = () => throw new IOException("fabricated output failure") };
            await Expect<IOException>(fake.Start);
            Require(fake.Stops == 1 && fake.Phone == "phone-a", "no receiver stop");
            fake.StartHook = null; await fake.Start();
            Require(fake.Starts == 2 && fake.Stops == 1, "retry does not need a new connection");
        });
        return count;
        async Task Check(string name, Func<Task> action)
        { await action(); count++; Console.WriteLine("PASS connected capture: " + name); }
    }
    private sealed class FakeBinding
    {
        internal string? Phone = "phone-a";
        internal Func<Task>? StartHook;
        internal int Starts, Stops;
        internal CancellationToken Token;
        internal Task Start() => ConnectedCaptureStart.StartAsync(() => Phone, Open,
            () => { Stops++; return Task.CompletedTask; }, Token);
        private async Task Open(CancellationToken token)
        { Starts++; if (StartHook is not null) await StartHook(); }
    }
    private static async Task Expect<T>(Func<Task> task) where T : Exception
    { try { await task(); } catch (T) { return; } throw new InvalidOperationException("Expected " + typeof(T).Name); }
    private static void Require(bool value, string reason) { if (!value) throw new InvalidOperationException(reason); }
}
