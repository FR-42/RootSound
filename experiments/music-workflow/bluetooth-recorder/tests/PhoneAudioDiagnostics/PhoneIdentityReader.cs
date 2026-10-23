using System.Runtime.InteropServices;
using Windows.Devices.Enumeration;

namespace RootSound.BluetoothRecorder.PhoneAudio;

// Retained for metadata diagnostics and historical regression checks, not the recording path.
internal static class PhoneIdentityReader
{
    internal static async Task<PhoneIdentity> ReadAsync(string receiverDeviceId,
        Func<string, DeviceInformationKind, CancellationToken, Task<IReadOnlyDictionary<string, object>?>> readProperties,
        Func<string, string?> readInterfaceInstanceId,
        Func<string, IReadOnlyList<PhoneDeviceNode>> readLineage, CancellationToken token)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(receiverDeviceId);
        token.ThrowIfCancellationRequested();
        string? address = PhoneSourceSelection.AddressFromDeviceId(receiverDeviceId);
        Guid? container = null;
        HashSet<string> inspected = new(StringComparer.OrdinalIgnoreCase);
        Queue<string> pending = new();
        pending.Enqueue(receiverDeviceId);
        while (pending.Count > 0 && inspected.Count < 8)
        {
            token.ThrowIfCancellationRequested();
            string id = pending.Dequeue();
            if (!inspected.Add(id)) continue;
            // Resolve the exact interface's devnode independently of optional WinRT
            // association properties. A missing property cannot erase native proof.
            string instanceId = readInterfaceInstanceId(id) ?? id;
            MergeAddress(PhoneSourceSelection.AddressFromDeviceId(instanceId));
            foreach (var node in readLineage(instanceId))
            {
                string? nodeAddress = PhoneSourceSelection.AddressFromDeviceId(node.InstanceId);
                if (nodeAddress is null) continue;
                MergeAddress(nodeAddress);
                // Association containers are not PnP hardware containers. Only use
                // the nearest remote Bluetooth devnode, never the computer/adapter.
                if (PhoneSourceSelection.IsPeripheralContainer(node.ContainerId)) container = node.ContainerId;
                break;
            }
            if (address is not null && PhoneSourceSelection.IsPeripheralContainer(container)) return new(address, container);
            foreach (DeviceInformationKind kind in new[] { DeviceInformationKind.DeviceInterface,
                DeviceInformationKind.AssociationEndpoint, DeviceInformationKind.AssociationEndpointService, DeviceInformationKind.Device })
            {
                token.ThrowIfCancellationRequested();
                IReadOnlyDictionary<string, object>? properties;
                try { properties = await readProperties(id, kind, token).ConfigureAwait(false); }
                catch (Exception error) when (error is ArgumentException or COMException or UnauthorizedAccessException)
                { token.ThrowIfCancellationRequested(); continue; }
                token.ThrowIfCancellationRequested();
                if (properties is null) continue;
                if (properties.TryGetValue("System.Devices.Aep.DeviceAddress", out object? rawAddress) && rawAddress is string value)
                    MergeAddress(PhoneSourceSelection.NormalizeAddress(value));
                foreach (string key in new[] { "System.Devices.DeviceInstanceId", "System.Devices.Parent", "System.Devices.AepService.AepId" })
                    if (properties.TryGetValue(key, out object? raw) && raw is string related && !string.IsNullOrWhiteSpace(related))
                    {
                        MergeAddress(PhoneSourceSelection.AddressFromDeviceId(related));
                        pending.Enqueue(related);
                    }
            }
        }
        return new(address, container);

        void MergeAddress(string? candidate)
        {
            if (candidate is null) return;
            if (address is not null && !address.Equals(candidate, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Windows 返回的手机身份信息互相冲突。请重新连接手机后重试。");
            address = candidate;
        }
    }
}
