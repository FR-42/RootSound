using RootSound.BluetoothRecorder.PhoneAudio;

namespace RootSound.BluetoothRecorder.Tests;

/// <summary>Fabricated Windows device metadata only. No COM, Bluetooth, microphone or audio-device access.</summary>
internal static class PhoneSourceChecks
{
    internal static int Run(string directory)
    {
        _ = directory;
        int count = 0;
        Guid phoneContainer = new("15b05ea0-794d-45ac-b345-a81359c684a8");
        PhoneIdentity phone = new("112233AABBCC", phoneContainer);
        PhoneEndpointMetadata source = new("phone-a2dp", "用户可随意修改的名称", true, 1,
            @"{2}.\\?\bthenum#remote\SNK", @"BTHENUM\{0000110a-0000-1000-8000-00805f9b34fb}\1&2&0&112233AABBCC_C00000000",
            phoneContainer, "112233AABBCC", true, true);
        Check("selected phone's verified incoming A2DP endpoint wins over default microphone and mixed output", () =>
        {
            var selected = PhoneSourceSelection.Select(phone, [source with { Id = "default-mic", HasRemoteA2dpSource = false },
                source with { Id = "mixed-speakers", Flow = 0 }, source]);
            Require(selected?.Id == "phone-a2dp", "explicit verified source");
        });
        Check("name, capture direction, or matching container alone cannot prove A2DP", () =>
        {
            Require(PhoneSourceSelection.Select(phone, [source with { HasA2dpDriver = false },
                source with { Id = "hfp", HasRemoteA2dpSource = false },
                source with { Id = "inactive", Active = false }]) is null, "reject HFP, unknown driver, inactive source");
        });
        Check("another phone is rejected even when its display name matches", () =>
        {
            Require(PhoneSourceSelection.Select(phone, [source with { Address = "112233AABBDD", ContainerId = Guid.NewGuid() }]) is null,
                "same name is irrelevant");
            Require(PhoneSourceSelection.Select(phone, [source with { Address = "112233AABBDD" }]) is null, "conflicting address");
            Require(PhoneSourceSelection.Select(phone, [source with { ContainerId = Guid.NewGuid() }]) is null, "conflicting container");
        });
        Check("unknown/computer-wide container never grants microphone fallback", () =>
        {
            foreach (Guid? container in new Guid?[] { null, Guid.Empty, new("00000000-0000-0000-ffff-ffffffffffff") })
            {
                Expect<InvalidOperationException>(() => PhoneSourceSelection.Select(new(null, container), [source]));
                Require(PhoneSourceSelection.Select(new("112233AABBCC", container), [source with { Address = null, ContainerId = container }]) is null,
                    "no broad container identity");
            }
        });
        Check("one missing optional identity can use independent exact proof; conflicts still fail", () =>
        {
            Require(PhoneSourceSelection.Select(new(null, phoneContainer), [source])?.Id == source.Id, "container with profile and driver proof");
            Require(PhoneSourceSelection.Select(new(phone.Address, null), [source with { ContainerId = null }])?.Id == source.Id,
                "address with profile and driver proof");
        });
        Check("multiple equally verified endpoints fail rather than guess; duplicate enumeration of same ID is harmless", () =>
        {
            Expect<InvalidOperationException>(() => PhoneSourceSelection.Select(phone, [source, source with { Id = "other" }]));
            Require(PhoneSourceSelection.Select(phone, [source, source])?.Id == source.Id, "one underlying endpoint");
        });
        Check("only strict known Bluetooth identity shapes yield remote addresses", () =>
        {
            Require(PhoneSourceSelection.AddressFromDeviceId("Bluetooth#Bluetooth00:11:22:33:44:55-11:22:33:AA:BB:CC") == phone.Address, "AEP remote not local");
            Require(PhoneSourceSelection.AddressFromDeviceId(@"BTHENUM\DEV_112233AABBCC\7&abc&0&BluetoothDevice_112233AABBCC") == phone.Address, "PnP device");
            Require(PhoneSourceSelection.AddressFromDeviceId(source.AdapterInstanceId) == phone.Address, "PnP service");
            Require(PhoneSourceSelection.AddressFromDeviceId("Microphone 112233AABBCC") is null, "name not identity");
            Require(PhoneSourceSelection.AddressFromDeviceId(@"USB\DEV_112233AABBCC\x") is null, "non-Bluetooth rejected");
            Require(PhoneSourceSelection.NormalizeAddress("00:00:00:00:00:00") is null, "missing address rejected");
            Require(PhoneSourceSelection.NormalizeAddress("11:22:33:aa:bb:cc") == phone.Address, "canonical address");
        });
        Check("remote source service UUID110a distinguishes local incoming sink from headphones and HFP", () =>
        {
            Require(PhoneSourceSelection.IsRemoteA2dpSource(source.AdapterInstanceId!), "correct Microsoft driver profile");
            Require(!PhoneSourceSelection.IsRemoteA2dpSource(@"BTHENUM\{0000110b-0000-1000-8000-00805f9b34fb}\device"), "outgoing headphone rejected");
            Require(!PhoneSourceSelection.IsRemoteA2dpSource(@"BTHENUM\{0000111e-0000-1000-8000-00805f9b34fb}\device"), "handsfree rejected");
            Require(!PhoneSourceSelection.IsRemoteA2dpSource("A2DP SNK"), "friendly label rejected");
        });
        Check("cancelled source resolution stops before any Windows device query", () =>
        {
            using CancellationTokenSource cancellation = new();
            cancellation.Cancel();
            Expect<OperationCanceledException>(() => new PhoneCaptureEndpointResolver()
                .ResolveAsync("fabricated-device", cancellation.Token).GetAwaiter().GetResult());
        });
        Check("missing receiver identity is rejected before any Windows device query", () =>
            Expect<ArgumentException>(() => new PhoneCaptureEndpointResolver()
                .ResolveAsync(" ").GetAwaiter().GetResult()));
        return count;

        void Check(string name, Action body) { body(); count++; Console.WriteLine($"PASS phone source: {name}"); }
    }

    private static void Require(bool value, string message) { if (!value) throw new InvalidOperationException(message); }
    private static void Expect<T>(Action action) where T : Exception
    {
        try { action(); } catch (T) { return; }
        throw new InvalidOperationException($"Expected {typeof(T).Name}.");
    }
}
