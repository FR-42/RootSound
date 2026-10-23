using System.Collections.Concurrent;
using RootSound.BluetoothRecorder.Receiver;

namespace RootSound.BluetoothRecorder.Tests;

/// <summary>Fabricated discovery and connection events only; never instantiates the Windows backend.</summary>
internal static class ReceiverChecks
{
    internal static async Task<int> RunAsync()
    {
        var count = 0;
        await Check("receiver construction is inert", async () =>
        {
            var backend = new FakeBackend();
            await using var receiver = new BluetoothReceiverService(backend);
            Require(backend.CheckCalls == 0 && backend.Discoveries.IsEmpty, "constructor did not inspect hardware");
            Require(!receiver.Snapshot.CanRecord && !receiver.Snapshot.IsEnabled, "initially disabled");
        });

        await Check("unavailable adapter reports a concrete disabled state", async () =>
        {
            var backend = new FakeBackend
            {
                Availability = new(ReceiverAvailability.NoBluetoothAdapter, "No fabricated adapter")
            };
            await using var receiver = new BluetoothReceiverService(backend);
            await receiver.StartAsync();
            Require(receiver.Snapshot.Availability == ReceiverAvailability.NoBluetoothAdapter, "availability exposed");
            Require(!receiver.Snapshot.CanRecord && !receiver.Snapshot.IsEnabled && backend.Discoveries.IsEmpty, "no watcher or record readiness");
        });

        await Check("empty discovery stays enabled waiting for later pairing", async () =>
        {
            var backend = new FakeBackend();
            await using var receiver = new BluetoothReceiverService(backend);
            await receiver.StartAsync();
            backend.CurrentDiscovery.Complete();
            await Until(() => receiver.Snapshot.EnumerationCompleted);
            Require(receiver.Snapshot.IsEnabled && !receiver.Snapshot.CanRecord, "waiting is not connection");
            Require(receiver.Snapshot.Devices.Count == 0 && backend.ConnectionCreations.IsEmpty, "no phantom source");
            var connection = new FakeConnection { OpenSetsOpened = true };
            backend.Connections.Enqueue(connection);
            backend.CurrentDiscovery.Add(Phone("later"));
            await Until(() => receiver.Snapshot.CanRecord);
            Require(receiver.Snapshot.ConnectedDeviceId == "later", "later paired phone auto opens");
        });

        await Check("pairing and successful open request never substitute for actual Opened", async () =>
        {
            var backend = new FakeBackend();
            var connection = new FakeConnection { OpenSetsOpened = false };
            backend.Connections.Enqueue(connection);
            await using var receiver = new BluetoothReceiverService(backend);
            await receiver.StartAsync();
            backend.CurrentDiscovery.Add(Phone("a", connected: true));
            backend.CurrentDiscovery.Complete();
            await Until(() => connection.OpenCalls == 1 && !receiver.Snapshot.IsConnecting);
            Require(!receiver.Snapshot.CanRecord, "paired and OpenAsync Success are insufficient");
            connection.ChangeState(true);
            await Until(() => receiver.Snapshot.CanRecord);
            Require(receiver.Snapshot.ConnectedDeviceId == "a", "actual Opened enables");
            connection.ChangeState(false);
            await Until(() => !receiver.Snapshot.CanRecord);
            await Task.Delay(35);
            Require(connection.OpenCalls == 1, "remote disconnect does not provoke a reopen loop");
        });

        await Check("several paired sources require explicit selection", async () =>
        {
            var backend = new FakeBackend();
            var connection = new FakeConnection { OpenSetsOpened = true };
            backend.Connections.Enqueue(connection);
            await using var receiver = new BluetoothReceiverService(backend);
            await receiver.StartAsync();
            backend.CurrentDiscovery.Add(Phone("a"));
            backend.CurrentDiscovery.Add(Phone("b"));
            backend.CurrentDiscovery.Complete();
            await Until(() => receiver.Snapshot.EnumerationCompleted && receiver.Snapshot.Devices.Count == 2);
            Require(backend.ConnectionCreations.IsEmpty && !receiver.Snapshot.CanRecord, "no arbitrary phone selected");
            await receiver.ConnectAsync("b");
            Require(receiver.Snapshot.CanRecord && receiver.Snapshot.SelectedDeviceId == "b", "selected phone connected");
            Require(backend.ConnectionCreations.Single() == "b", "only selected source enabled");
            var list = (IList<ReceiverDevice>)receiver.Snapshot.Devices;
            Expect<NotSupportedException>(() => list.Add(Phone("illegal")));
        });

        await Check("device removal closes only the owned link", async () =>
        {
            var backend = new FakeBackend();
            var connection = new FakeConnection { OpenSetsOpened = true };
            backend.Connections.Enqueue(connection);
            await using var receiver = new BluetoothReceiverService(backend);
            await receiver.StartAsync();
            backend.CurrentDiscovery.Add(Phone("a"));
            backend.CurrentDiscovery.Complete();
            await Until(() => receiver.Snapshot.CanRecord);
            backend.CurrentDiscovery.Remove("a");
            await Until(() => !receiver.Snapshot.CanRecord && receiver.Snapshot.Devices.Count == 0);
            Require(connection.Disposed && receiver.Snapshot.SelectedDeviceId is null, "removed connection fully released");
            connection.ChangeState(true);
            await Task.Delay(25);
            Require(!receiver.Snapshot.CanRecord, "late removed connection callback ignored");
        });

        await Check("stop cancels an in-flight availability request", async () =>
        {
            var backend = new FakeBackend { AvailabilityGate = NewGate() };
            await using var receiver = new BluetoothReceiverService(backend);
            var starting = receiver.StartAsync();
            await Until(() => backend.CheckCalls == 1);
            await receiver.StopAsync().WaitAsync(TimeSpan.FromSeconds(2));
            await ExpectAsync<OperationCanceledException>(() => starting);
            Require(!receiver.Snapshot.CanRecord && !receiver.Snapshot.IsEnabled, "stop cleared readiness");
            Require(backend.Discoveries.IsEmpty, "cancelled availability never created a watcher");
        });

        await Check("stop during open and stale old callbacks cannot enable a new session", async () =>
        {
            var backend = new FakeBackend();
            var old = new FakeConnection { OpenGate = NewGate(), OpenSetsOpened = true };
            backend.Connections.Enqueue(old);
            await using var receiver = new BluetoothReceiverService(backend);
            await receiver.StartAsync();
            var oldDiscovery = backend.CurrentDiscovery;
            oldDiscovery.Add(Phone("old"));
            oldDiscovery.Complete();
            await Until(() => old.OpenCalls == 1);
            var stopping = receiver.StopAsync();
            Require(!receiver.Snapshot.CanRecord && !receiver.Snapshot.IsEnabled, "stop invalidates immediately");
            await stopping.WaitAsync(TimeSpan.FromSeconds(2));
            Require(old.Disposed && oldDiscovery.Disposed, "pending resources closed");
            var next = new FakeConnection { OpenSetsOpened = false };
            backend.Connections.Enqueue(next);
            await receiver.StartAsync();
            backend.CurrentDiscovery.Add(Phone("new"));
            backend.CurrentDiscovery.Complete();
            await Until(() => next.OpenCalls == 1 && !receiver.Snapshot.IsConnecting);
            old.OpenGate!.TrySetResult();
            old.ChangeState(true);
            oldDiscovery.Add(Phone("stale"));
            await Task.Delay(35);
            Require(!receiver.Snapshot.CanRecord && receiver.Snapshot.SelectedDeviceId == "new", "old Opened ignored");
            Require(receiver.Snapshot.Devices.All(device => device.Id != "stale"), "old watcher ignored");
        });

        await Check("caller cancellation during selected start preserves discovery for retry", async () =>
        {
            var backend = new FakeBackend();
            var pending = new FakeConnection { StartGate = NewGate() };
            backend.Connections.Enqueue(pending);
            await using var receiver = new BluetoothReceiverService(backend);
            await receiver.StartAsync();
            backend.CurrentDiscovery.Add(Phone("a"));
            backend.CurrentDiscovery.Add(Phone("b"));
            backend.CurrentDiscovery.Complete();
            await Until(() => receiver.Snapshot.EnumerationCompleted);
            using var cancellation = new CancellationTokenSource();
            var connecting = receiver.ConnectAsync("b", cancellation.Token);
            await Until(() => pending.StartCalls == 1);
            cancellation.Cancel();
            await ExpectAsync<OperationCanceledException>(() => connecting);
            Require(pending.Disposed && receiver.Snapshot.IsEnabled && !receiver.Snapshot.IsConnecting, "cancel closes only pending link");
            var retry = new FakeConnection { OpenSetsOpened = true };
            backend.Connections.Enqueue(retry);
            await receiver.ReconnectAsync();
            Require(receiver.Snapshot.CanRecord && receiver.Snapshot.ConnectedDeviceId == "b", "explicit retry works");
        });

        await Check("superseding a pending start cancels it without suppressing the new start", async () =>
        {
            var backend = new FakeBackend { AvailabilityGate = NewGate() };
            await using var receiver = new BluetoothReceiverService(backend);
            var first = receiver.StartAsync();
            await Until(() => backend.CheckCalls == 1);
            backend.AvailabilityGate = null;
            var second = receiver.StartAsync();
            await ExpectAsync<OperationCanceledException>(() => first);
            await second;
            Require(receiver.Snapshot.IsEnabled && backend.CheckCalls == 2 && backend.Discoveries.Count == 1, "only new session owns discovery");
        });

        await Check("a cancelled queued start still releases the superseded session", async () =>
        {
            var gate = NewGate();
            var backend = new FakeBackend { AvailabilityGate = gate, IgnoreAvailabilityCancellation = true };
            await using var receiver = new BluetoothReceiverService(backend);
            var first = receiver.StartAsync();
            await Until(() => backend.CheckCalls == 1);
            using var cancellation = new CancellationTokenSource();
            var queued = receiver.StartAsync(cancellation.Token);
            cancellation.Cancel();
            backend.AvailabilityGate = null;
            gate.TrySetResult();
            await ExpectAsync<OperationCanceledException>(() => first);
            await ExpectAsync<OperationCanceledException>(() => queued);
            Require(!receiver.Snapshot.IsEnabled && !receiver.Snapshot.CanRecord, "cancelled queued start cannot leave old ready state");
            Require(backend.CheckCalls == 1 && backend.Discoveries.IsEmpty, "cancelled queued start never touches backend");
            await receiver.StartAsync();
            Require(receiver.Snapshot.IsEnabled && backend.CheckCalls == 2, "new start remains possible after cancelled queue");
        });

        await Check("open failure remains nonrecordable and exposes diagnostics", async () =>
        {
            var backend = new FakeBackend();
            var connection = new FakeConnection { OpenResult = new(false, "fabricated denied") };
            backend.Connections.Enqueue(connection);
            await using var receiver = new BluetoothReceiverService(backend);
            receiver.SnapshotChanged += (_, _) => throw new InvalidOperationException("fabricated consumer failure");
            await receiver.StartAsync();
            backend.CurrentDiscovery.Add(Phone("a"));
            backend.CurrentDiscovery.Complete();
            await Until(() => connection.OpenCalls == 1 && !receiver.Snapshot.IsConnecting);
            Require(!receiver.Snapshot.CanRecord && receiver.Snapshot.Error == "fabricated denied", "failure visible despite bad consumer");
            await receiver.StopAsync();
            Require(connection.Disposed && !receiver.Snapshot.IsEnabled, "shutdown unaffected by bad consumer");
        });

        await Check("dispose is idempotent and rejects later starts", async () =>
        {
            var backend = new FakeBackend();
            var receiver = new BluetoothReceiverService(backend);
            await receiver.StartAsync();
            var discovery = backend.CurrentDiscovery;
            await receiver.DisposeAsync();
            await receiver.DisposeAsync();
            Require(discovery.Disposed && !receiver.Snapshot.IsEnabled, "discovery released");
            await ExpectAsync<ObjectDisposedException>(() => receiver.StartAsync());
        });

        return count;

        async Task Check(string name, Func<Task> action)
        {
            await action();
            count++;
            Console.WriteLine($"PASS {name}");
        }
    }

    private static ReceiverDevice Phone(string id, bool connected = false) => new(id, $"Phone {id}", connected);
    private static TaskCompletionSource NewGate() => new(TaskCreationOptions.RunContinuationsAsynchronously);
    private static async Task Until(Func<bool> condition)
    {
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(3));
        while (!condition()) await Task.Delay(5, timeout.Token);
    }
    private static void Require(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException(message);
    }
    private static void Expect<T>(Action action) where T : Exception
    {
        try { action(); }
        catch (T) { return; }
        throw new InvalidOperationException($"Expected {typeof(T).Name}");
    }
    private static async Task ExpectAsync<T>(Func<Task> action) where T : Exception
    {
        try { await action(); }
        catch (T) { return; }
        throw new InvalidOperationException($"Expected {typeof(T).Name}");
    }

    private sealed class FakeBackend : IReceiverBackend
    {
        private int _checkCalls;
        public int CheckCalls => Volatile.Read(ref _checkCalls);
        public ReceiverAvailabilityResult Availability = new(ReceiverAvailability.Available, "fabricated ready");
        public TaskCompletionSource? AvailabilityGate;
        public bool IgnoreAvailabilityCancellation;
        public readonly ConcurrentQueue<FakeDiscovery> Discoveries = new();
        public readonly ConcurrentQueue<FakeConnection> Connections = new();
        public readonly ConcurrentQueue<string> ConnectionCreations = new();
        public FakeDiscovery CurrentDiscovery => Discoveries.Last();

        public async Task<ReceiverAvailabilityResult> CheckAvailabilityAsync(CancellationToken cancellationToken)
        {
            var gate = AvailabilityGate;
            Interlocked.Increment(ref _checkCalls);
            if (gate is not null)
                await (IgnoreAvailabilityCancellation ? gate.Task : gate.Task.WaitAsync(cancellationToken));
            return Availability;
        }
        public IReceiverDiscovery CreateDiscovery()
        {
            var discovery = new FakeDiscovery();
            Discoveries.Enqueue(discovery);
            return discovery;
        }
        public IReceiverConnection? CreateConnection(string deviceId)
        {
            ConnectionCreations.Enqueue(deviceId);
            return Connections.TryDequeue(out var connection) ? connection : null;
        }
    }

    private sealed class FakeDiscovery : IReceiverDiscovery
    {
        public bool Disposed;
        public event EventHandler<ReceiverDevice>? Added;
        public event EventHandler<ReceiverDevice>? Updated;
        public event EventHandler<string>? Removed;
        public event EventHandler? EnumerationCompleted;
        public event EventHandler<string?>? Stopped;
        public void Start() { }
        public void Add(ReceiverDevice device) => Added?.Invoke(this, device);
        public void Update(ReceiverDevice device) => Updated?.Invoke(this, device);
        public void Remove(string id) => Removed?.Invoke(this, id);
        public void Complete() => EnumerationCompleted?.Invoke(this, EventArgs.Empty);
        public void Stop(string? error) => Stopped?.Invoke(this, error);
        public void Dispose() => Disposed = true;
    }

    private sealed class FakeConnection : IReceiverConnection
    {
        private int _startCalls;
        private int _openCalls;
        private bool _opened;
        public int StartCalls => Volatile.Read(ref _startCalls);
        public int OpenCalls => Volatile.Read(ref _openCalls);
        public bool IsOpened => Volatile.Read(ref _opened);
        public bool Disposed;
        public bool OpenSetsOpened;
        public TaskCompletionSource? StartGate;
        public TaskCompletionSource? OpenGate;
        public ReceiverOpenResult OpenResult = new(true);
        public event EventHandler? StateChanged;
        public async Task StartAsync(CancellationToken cancellationToken)
        {
            Interlocked.Increment(ref _startCalls);
            if (StartGate is not null) await StartGate.Task.WaitAsync(cancellationToken);
        }
        public async Task<ReceiverOpenResult> OpenAsync(CancellationToken cancellationToken)
        {
            Interlocked.Increment(ref _openCalls);
            if (OpenGate is not null) await OpenGate.Task.WaitAsync(cancellationToken);
            if (OpenSetsOpened) ChangeState(true);
            return OpenResult;
        }
        public void ChangeState(bool opened)
        {
            Volatile.Write(ref _opened, opened);
            StateChanged?.Invoke(this, EventArgs.Empty);
        }
        public void Dispose() => Disposed = true;
    }
}
