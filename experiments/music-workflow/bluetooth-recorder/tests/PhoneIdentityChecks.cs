using System.Runtime.InteropServices;
using RootSound.BluetoothRecorder.PhoneAudio;
using Windows.Devices.Enumeration;

namespace RootSound.BluetoothRecorder.Tests;

internal static class PhoneIdentityChecks
{
    // Same interface/devnode shapes returned by the failing PC; identifying values
    // are fabricated. In particular, keep the VID/PID, interface prefix and SNK suffix.
    private const string ServiceId = @"BTHENUM\{0000110a-0000-1000-8000-00805f9b34fb}_VID&000100e0_PID&0000\7&12345678&0&112233AABBCC_C00000000";
    private const string InterfaceId = @"\\?\BTHENUM#{0000110a-0000-1000-8000-00805f9b34fb}_VID&000100e0_PID&0000#7&12345678&0&112233AABBCC_C00000000#{6994ad04-93ef-11d0-a3cc-00a0c9223196}\SNK";
    private static readonly Guid Container = new("15b05ea0-794d-45ac-b345-a81359c684a8");

    internal static async Task<int> RunAsync()
    {
        int count = 0;
        await Check("actual Windows interface shape yields remote address, including VID/PID and SNK suffix", async () =>
        {
            Require(PhoneSourceSelection.AddressFromDeviceId(InterfaceId) == "112233AABBCC", "interface address");
            var identity = await Read(InterfaceId);
            Require(identity.Address == "112233AABBCC" && identity.IsKnown, "optional metadata unavailable still preserves exact interface identity");
            Require(PhoneSourceSelection.AddressFromDeviceId(InterfaceId.Replace("BTHENUM#", "USB#")) is null, "non-Bluetooth interface rejected");
        });
        await Check("native interface-to-devnode proof survives unavailable WinRT properties", async () =>
        {
            int propertyQueries = 0;
            var identity = await Read(InterfaceId, properties: (_, _, _) =>
                { propertyQueries++; throw new COMException("Element not found", unchecked((int)0x8002802b)); },
                native: id => id == InterfaceId ? ServiceId : null,
                lineage: id => id == ServiceId ? [Node()] : []);
            Require(identity == new PhoneIdentity("112233AABBCC", Container) && propertyQueries == 0, "native proof has no optional-property dependency");
        });
        await Check("WinRT devnode property resolves an opaque interface without using association container", async () =>
        {
            var identity = await Read("opaque-interface", properties: (_, kind, _) => Task.FromResult<IReadOnlyDictionary<string, object>?>(
                kind == DeviceInformationKind.DeviceInterface ? new Dictionary<string, object>
                { ["System.Devices.DeviceInstanceId"] = ServiceId, ["System.Devices.ContainerId"] = Guid.NewGuid() } : null),
                lineage: id => id == ServiceId ? [Node()] : []);
            Require(identity == new PhoneIdentity("112233AABBCC", Container), "PnP identity and container");
        });
        await Check("canonical AEP parent property is requested and followed", async () =>
        {
            Require(PhoneCaptureEndpointResolver.IdentityProperties.Contains("System.Devices.AepService.AepId"), "canonical Windows property");
            Require(!PhoneCaptureEndpointResolver.IdentityProperties.Contains("System.Devices.AepService.ParentAepId"), "invalid alias removed");
            const string aep = "Bluetooth#Bluetooth00:11:22:33:44:55-11:22:33:AA:BB:CC";
            var identity = await Read("opaque-service", properties: (id, kind, _) => Task.FromResult<IReadOnlyDictionary<string, object>?>(
                id == "opaque-service" && kind == DeviceInformationKind.AssociationEndpointService
                    ? new Dictionary<string, object> { ["System.Devices.AepService.AepId"] = aep }
                    : id == aep && kind == DeviceInformationKind.AssociationEndpoint
                    ? new Dictionary<string, object> { ["System.Devices.DeviceInstanceId"] = ServiceId } : null),
                lineage: id => id == ServiceId ? [Node()] : []);
            Require(identity == new PhoneIdentity("112233AABBCC", Container), "AEP relation resolves correct PnP identity");
        });
        await Check("unavailable optional properties cannot establish an unknown source", async () =>
        {
            var identity = await Read("unknown-interface", properties: (_, _, _) => throw new COMException("Element not found"));
            Require(!identity.IsKnown, "no name, default device or computer-container fallback");
        });
        await Check("conflicting native or WinRT addresses are rejected", async () =>
        {
            await Expect<InvalidOperationException>(() => Read(InterfaceId, native: _ => ServiceId.Replace("112233AABBCC", "112233AABBDD")));
            await Expect<InvalidOperationException>(() => Read(InterfaceId, properties: (_, _, _) => Task.FromResult<IReadOnlyDictionary<string, object>?>(
                new Dictionary<string, object> { ["System.Devices.Aep.DeviceAddress"] = "11:22:33:AA:BB:DD" })));
        });
        await Check("same-name microphone identity and computer-wide containers are never phone proof", async () =>
        {
            var identity = await Read("OPPO phone", native: _ => @"USB\MICROPHONE\1234", lineage: _ =>
                [new(@"USB\MICROPHONE\1234", "usbaudio", Container, [])]);
            Require(!identity.IsKnown, "microphone container rejected");
            identity = await Read(InterfaceId, lineage: _ => [Node() with { ContainerId = new("00000000-0000-0000-ffff-ffffffffffff") }]);
            Require(identity.Address == "112233AABBCC" && identity.ContainerId is null, "local machine container excluded");
        });
        await Check("cyclic or repeated device relations terminate", async () =>
        {
            int queries = 0;
            var identity = await Read("unknown", properties: (_, _, _) =>
            {
                queries++;
                return Task.FromResult<IReadOnlyDictionary<string, object>?>(new Dictionary<string, object> { ["System.Devices.Parent"] = "unknown" });
            });
            Require(!identity.IsKnown && queries == 4, "one inspection per id");
        });
        await Check("restart cancellation prevents native and WinRT reads, including a cancelled failed query", async () =>
        {
            using CancellationTokenSource cancel = new(); cancel.Cancel();
            await Expect<OperationCanceledException>(() => Read(InterfaceId, native: _ => throw new Exception("must not query native"), token: cancel.Token));
            using CancellationTokenSource duringQuery = new();
            await Expect<OperationCanceledException>(() => Read("unknown", properties: (_, _, _) =>
                { duringQuery.Cancel(); throw new COMException("unavailable"); }, token: duringQuery.Token));
        });
        await Check("resolved interface identity selects only its dedicated A2DP input", async () =>
        {
            var identity = await Read(InterfaceId, native: _ => ServiceId, lineage: _ => [Node()]);
            PhoneEndpointMetadata source = new("phone-input", "any name", true, 1, "adapter", ServiceId, Container, "112233AABBCC", true, true);
            var selected = PhoneSourceSelection.Select(identity, [source with { Id = "mic", HasRemoteA2dpSource = false },
                source with { Id = "other-phone", Address = "112233AABBDD" }, source]);
            Require(selected?.Id == "phone-input", "fixed identity retains strict source selection");
        });
        return count;

        async Task Check(string name, Func<Task> action) { await action(); count++; Console.WriteLine("PASS phone identity: " + name); }
    }

    private static PhoneDeviceNode Node() => new(ServiceId, "BthA2dp", Container, [ServiceId]);
    private static Task<PhoneIdentity> Read(string id,
        Func<string, DeviceInformationKind, CancellationToken, Task<IReadOnlyDictionary<string, object>?>>? properties = null,
        Func<string, string?>? native = null, Func<string, IReadOnlyList<PhoneDeviceNode>>? lineage = null, CancellationToken token = default) =>
        PhoneIdentityReader.ReadAsync(id, properties ?? ((_, _, _) => Task.FromResult<IReadOnlyDictionary<string, object>?>(null)),
            native ?? (_ => null), lineage ?? (_ => []), token);
    private static void Require(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
    private static async Task Expect<T>(Func<Task> action) where T : Exception
    { try { await action(); } catch (T) { return; } throw new InvalidOperationException("Expected " + typeof(T).Name); }
}
