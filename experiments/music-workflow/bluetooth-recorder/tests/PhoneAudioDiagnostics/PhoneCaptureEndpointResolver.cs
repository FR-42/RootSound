using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using RootSound.BluetoothRecorder.Recording;
using Windows.Devices.Enumeration;

namespace RootSound.BluetoothRecorder.PhoneAudio;

internal sealed record PhoneCaptureEndpoint(string Id, string Name, string Proof);

internal sealed record PhoneIdentity(string? Address, Guid? ContainerId)
{
    internal bool IsKnown => Address is not null || PhoneSourceSelection.IsPeripheralContainer(ContainerId);
}

internal sealed record PhoneEndpointMetadata(string Id, string Name, bool Active, int Flow,
    string AdapterId, string? AdapterInstanceId, Guid? ContainerId, string? Address,
    bool HasRemoteA2dpSource, bool HasA2dpDriver);

/// <summary>
/// Diagnostic for the retired phone-only recording approach. Not shipped in the app.
/// Finds the selected phone's incoming A2DP capture endpoint. Never opens a stream,
/// chooses a default input, uses endpoint names as identity, or captures the output mix.
/// Microsoft's inbox microsoft_bluetooth_a2dp_snk.inf binds remote UUID 110a to
/// BthA2dp; microsoft_bluetooth_a2dp.inf registers its SNK capture/ListenTo endpoint.
/// </summary>
internal sealed class PhoneCaptureEndpointResolver
{
    internal static readonly string[] IdentityProperties =
    [
        "System.Devices.Aep.DeviceAddress", "System.Devices.DeviceInstanceId", "System.Devices.Parent",
        "System.Devices.AepService.AepId"
    ];

    internal async Task<PhoneCaptureEndpoint> ResolveAsync(string receiverDeviceId, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(receiverDeviceId);
        cancellationToken.ThrowIfCancellationRequested();
        if (!OperatingSystem.IsWindows()) throw new PlatformNotSupportedException("蓝牙录音需要 Windows。");
        PhoneIdentity phone = await ReadPhoneIdentityAsync(receiverDeviceId, cancellationToken).ConfigureAwait(false);
        if (!phone.IsKnown)
            throw new InvalidOperationException("无法核实所选手机的音频来源。请重新连接手机后重试；不会改录电脑或麦克风的声音。");

        for (int attempt = 0; attempt < 13; attempt++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            // DeviceTopology and property-store COM objects are created and released on one MTA thread.
            var candidates = await Task.Run(() => ReadCaptureEndpoints(cancellationToken), cancellationToken).ConfigureAwait(false);
            PhoneCaptureEndpoint? selected = PhoneSourceSelection.Select(phone, candidates);
            if (selected is not null) return selected;
            if (attempt < 12) await Task.Delay(250, cancellationToken).ConfigureAwait(false);
        }
        throw new InvalidOperationException("手机已连接，但 Windows 尚未提供这台手机的独立蓝牙音频输入。请在手机上播放声音后重试；不会改录电脑或麦克风的声音。");
    }

    internal static Task<PhoneIdentity> ReadPhoneIdentityAsync(string receiverDeviceId, CancellationToken token) =>
        PhoneIdentityReader.ReadAsync(receiverDeviceId, async (id, kind, cancellation) =>
        {
            var information = await DeviceInformation.CreateFromIdAsync(id, IdentityProperties, kind)
                .AsTask(cancellation).ConfigureAwait(false);
            return information?.Properties;
        }, PhoneMetadataNative.ReadInterfaceInstanceId, PhoneMetadataNative.ReadLineage, token);

    internal static IReadOnlyList<PhoneEndpointMetadata> ReadCaptureEndpoints(CancellationToken token, bool includeInactive = false)
    {
        WasapiNative.Check(WasapiNative.CoInitializeEx(IntPtr.Zero, 0));
        IMMDeviceEnumerator? enumerator = null;
        IPhoneDeviceCollection? collection = null;
        IntPtr pointer = IntPtr.Zero;
        List<PhoneEndpointMetadata> result = [];
        try
        {
            enumerator = (IMMDeviceEnumerator)new MMDeviceEnumeratorComObject();
            WasapiNative.Check(enumerator.EnumAudioEndpoints(1, includeInactive ? 15u : 1u, out pointer)); // eCapture
            collection = (IPhoneDeviceCollection)Marshal.GetObjectForIUnknown(pointer);
            WasapiNative.Check(collection.GetCount(out uint count));
            for (uint index = 0; index < count; index++)
            {
                token.ThrowIfCancellationRequested();
                IMMDevice? endpoint = null;
                try
                {
                    WasapiNative.Check(collection.Item(index, out endpoint));
                    if (ReadEndpoint(enumerator, endpoint, includeInactive) is { } value) result.Add(value);
                }
                catch (Exception error) when (error is COMException or InvalidCastException or ArgumentException)
                { /* A disappearing or unsupported endpoint is not a verified phone source. */ }
                finally { WasapiNative.Release(endpoint); }
            }
            return result;
        }
        finally
        {
            WasapiNative.Release(collection);
            if (pointer != IntPtr.Zero) Marshal.Release(pointer);
            WasapiNative.Release(enumerator);
            WasapiNative.CoUninitialize();
        }
    }

    private static PhoneEndpointMetadata? ReadEndpoint(IMMDeviceEnumerator enumerator, IMMDevice endpoint, bool includeInactive)
    {
        WasapiNative.Check(endpoint.GetState(out uint state));
        if (state != 1 && !includeInactive) return null;
        var endpointInterface = (IPhoneEndpoint)endpoint;
        WasapiNative.Check(endpointInterface.GetDataFlow(out int flow));
        if (flow != 1) return null;
        WasapiNative.Check(endpoint.GetId(out string id));
        Guid topologyId = typeof(IPhoneDeviceTopology).GUID;
        IPhoneDeviceTopology? topology = null;
        IPhoneConnector? connector = null;
        IMMDevice? adapter = null;
        try
        {
            WasapiNative.Check(endpoint.Activate(ref topologyId, 23, IntPtr.Zero, out object topologyObject));
            topology = (IPhoneDeviceTopology)topologyObject;
            WasapiNative.Check(topology.GetConnectorCount(out uint connectorCount));
            if (connectorCount != 1) return null; // An ambiguous hardware path is not evidence of a selected phone.
            WasapiNative.Check(topology.GetConnector(0, out connector));
            WasapiNative.Check(connector.GetDeviceIdConnectedTo(out string adapterId));
            WasapiNative.Check(enumerator.GetDevice(adapterId, out adapter));
            string? instanceId = ReadString(adapter, PhoneMetadataNative.InstanceId);
            if (string.IsNullOrWhiteSpace(instanceId)) return null;
            var lineage = PhoneMetadataNative.ReadLineage(instanceId);
            bool source = lineage.Any(node => PhoneSourceSelection.IsRemoteA2dpSource(node.InstanceId) ||
                node.HardwareIds.Any(PhoneSourceSelection.IsRemoteA2dpSource));
            bool driver = lineage.Any(node => node.Service?.Equals("BthA2dp", StringComparison.OrdinalIgnoreCase) is true);
            Guid? container = new[] { ReadGuid(adapter, PhoneMetadataNative.ContainerId), ReadGuid(endpoint, PhoneMetadataNative.ContainerId) }
                .Concat(lineage.Select(node => node.ContainerId)).FirstOrDefault(PhoneSourceSelection.IsPeripheralContainer);
            string? address = lineage.Select(node => PhoneSourceSelection.AddressFromDeviceId(node.InstanceId)).FirstOrDefault(value => value is not null);
            return new(id, ReadString(endpoint, PhoneMetadataNative.FriendlyName) ?? "手机蓝牙音频", state == 1, flow,
                adapterId, instanceId, container, address, source, driver);
        }
        finally
        {
            WasapiNative.Release(adapter);
            WasapiNative.Release(connector);
            WasapiNative.Release(topology);
        }
    }

    private static string? ReadString(IMMDevice device, PropertyKey key) => ReadProperty(device, key, value =>
        value.Type == 31 && value.Pointer != IntPtr.Zero ? Marshal.PtrToStringUni(value.Pointer) : null);
    private static Guid? ReadGuid(IMMDevice device, PropertyKey key) => ReadProperty<Guid?>(device, key, value =>
        value.Type == 72 && value.Pointer != IntPtr.Zero ? Marshal.PtrToStructure<Guid>(value.Pointer) : null);
    private static T? ReadProperty<T>(IMMDevice device, PropertyKey key, Func<PropVariant, T?> read)
    {
        IPropertyStore? store = null;
        PropVariant value = default;
        try
        {
            if (device.OpenPropertyStore(0, out store) < 0 || store.GetValue(ref key, out value) < 0) return default;
            return read(value);
        }
        finally { WasapiNative.PropVariantClear(ref value); WasapiNative.Release(store); }
    }
}

internal static partial class PhoneSourceSelection
{
    private static readonly Guid ComputerContainer = new("00000000-0000-0000-ffff-ffffffffffff");
    internal static bool IsPeripheralContainer(Guid? value) => value is { } id && id != Guid.Empty && id != ComputerContainer;
    internal static string? NormalizeAddress(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        string compact = value.Replace(":", "").Replace("-", "").Trim();
        return compact.Length == 12 && compact.All(Uri.IsHexDigit) && compact != "000000000000"
            ? compact.ToUpperInvariant() : null;
    }

    internal static string? AddressFromDeviceId(string? id)
    {
        if (string.IsNullOrWhiteSpace(id)) return null;
        // AudioPlaybackConnection returns a device-interface symbolic link, whereas
        // PnP properties return a devnode ID. Both contain the same remote address.
        if (id.StartsWith(@"\\?\", StringComparison.Ordinal)) id = id[4..];
        Match match = BluetoothAepAddress().Match(id);
        if (!match.Success) match = BluetoothNodeAddress().Match(id);
        if (!match.Success) match = BluetoothServiceAddress().Match(id);
        return match.Success ? NormalizeAddress(match.Groups[1].Value) : null;
    }

    internal static bool IsRemoteA2dpSource(string value) =>
        value.StartsWith("BTHENUM\\{0000110a-0000-1000-8000-00805f9b34fb}", StringComparison.OrdinalIgnoreCase);

    internal static PhoneCaptureEndpoint? Select(PhoneIdentity phone, IEnumerable<PhoneEndpointMetadata> metadata)
    {
        if (!phone.IsKnown) throw new InvalidOperationException("无法核实所选手机的音频来源。");
        var matches = metadata.Where(endpoint =>
        {
            if (!endpoint.Active || endpoint.Flow != 1 || !endpoint.HasRemoteA2dpSource || !endpoint.HasA2dpDriver) return false;
            bool addressMatch = phone.Address is not null && endpoint.Address is not null &&
                phone.Address.Equals(endpoint.Address, StringComparison.OrdinalIgnoreCase);
            bool containerMatch = IsPeripheralContainer(phone.ContainerId) && IsPeripheralContainer(endpoint.ContainerId) &&
                phone.ContainerId == endpoint.ContainerId;
            // Conflicting known metadata always wins over a partial match.
            if (phone.Address is not null && endpoint.Address is not null && !addressMatch) return false;
            if (IsPeripheralContainer(phone.ContainerId) && IsPeripheralContainer(endpoint.ContainerId) && !containerMatch) return false;
            return addressMatch || containerMatch;
        }).DistinctBy(endpoint => endpoint.Id, StringComparer.OrdinalIgnoreCase).ToArray();
        if (matches.Length > 1)
            throw new InvalidOperationException("Windows 提供了多个无法区分的手机音频输入。请断开其他蓝牙音频接收程序，再连接手机后重试。");
        if (matches.Length == 0) return null;
        var selected = matches[0];
        return new(selected.Id, selected.Name, "独立 A2DP 输入；已核对手机标识与 Windows 蓝牙接收驱动");
    }

    [GeneratedRegex(@"^Bluetooth#Bluetooth[0-9a-f]{2}(?::[0-9a-f]{2}){5}-([0-9a-f]{2}(?::[0-9a-f]{2}){5})(?:$|[\\#])", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant)]
    private static partial Regex BluetoothAepAddress();
    [GeneratedRegex(@"^BTHENUM[\\#]DEV_([0-9a-f]{12})(?:$|[\\#])", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant)]
    private static partial Regex BluetoothNodeAddress();
    [GeneratedRegex(@"^BTHENUM[\\#]\{[0-9a-f-]{36}\}[^\\#]*[\\#][^\\#]*&([0-9a-f]{12})_C[0-9a-f]+(?:$|[\\#])", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant)]
    private static partial Regex BluetoothServiceAddress();
}

internal sealed record PhoneDeviceNode(string InstanceId, string? Service, Guid? ContainerId, IReadOnlyList<string> HardwareIds);

internal static class PhoneMetadataNative
{
    internal static readonly PropertyKey InstanceId = Key("78c34fc8-104a-4aca-9ea4-524d52996e57", 256);
    internal static readonly PropertyKey ContainerId = Key("8c7ed206-3f8a-4827-b3ab-ae9e1faefc6c", 2);
    internal static readonly PropertyKey FriendlyName = Key("a45c254e-df1c-4efd-8020-67d146a850e0", 14);
    private static readonly PropertyKey Service = Key("a45c254e-df1c-4efd-8020-67d146a850e0", 6);
    private static readonly PropertyKey HardwareIds = Key("a45c254e-df1c-4efd-8020-67d146a850e0", 3);
    private static PropertyKey Key(string guid, uint id) => new() { FormatId = new(guid), PropertyId = id };

    internal static string? ReadInterfaceInstanceId(string interfaceId)
    {
        if (!interfaceId.StartsWith(@"\\?\", StringComparison.Ordinal)) return null;
        PropertyKey key = InstanceId;
        uint size = 0;
        if (CM_Get_Device_Interface_PropertyW(interfaceId, ref key, out uint type, null, ref size, 0) != 0x1a
            || size == 0 || size > 65536) return null;
        byte[] bytes = new byte[size];
        if (CM_Get_Device_Interface_PropertyW(interfaceId, ref key, out type, bytes, ref size, 0) != 0
            || type != 0x12 || size > bytes.Length || size % 2 != 0) return null;
        return Encoding.Unicode.GetString(bytes.AsSpan(0, checked((int)size))).TrimEnd('\0');
    }

    internal static IReadOnlyList<PhoneDeviceNode> ReadLineage(string instanceId)
    {
        List<PhoneDeviceNode> nodes = [];
        if (CM_Locate_DevNodeW(out uint current, instanceId, 0) != 0) return nodes;
        HashSet<uint> visited = [];
        while (visited.Count < 12 && visited.Add(current))
        {
            if (CM_Get_Device_ID_Size(out uint length, current, 0) != 0 || length > 32767) break;
            StringBuilder id = new(checked((int)length + 1));
            if (CM_Get_Device_IDW(current, id, checked(length + 1), 0) != 0) break;
            byte[]? service = ReadDeviceProperty(current, Service, 0x12);
            byte[]? hardware = ReadDeviceProperty(current, HardwareIds, 0x2012);
            byte[]? container = ReadDeviceProperty(current, ContainerId, 0x0d);
            nodes.Add(new(id.ToString(), service is null ? null : Encoding.Unicode.GetString(service).TrimEnd('\0'),
                container is { Length: 16 } ? new Guid(container) : null,
                hardware is null ? [] : Encoding.Unicode.GetString(hardware).Split('\0', StringSplitOptions.RemoveEmptyEntries)));
            if (CM_Get_Parent(out uint parent, current, 0) != 0) break;
            current = parent;
        }
        return nodes;
    }

    private static byte[]? ReadDeviceProperty(uint node, PropertyKey key, uint expectedType)
    {
        uint size = 0;
        uint result = CM_Get_DevNode_PropertyW(node, ref key, out uint type, null, ref size, 0);
        if (result != 0x1a || size == 0 || size > 65536) return null; // CR_BUFFER_SMALL
        byte[] bytes = new byte[size];
        if (CM_Get_DevNode_PropertyW(node, ref key, out type, bytes, ref size, 0) != 0 || type != expectedType || size > bytes.Length) return null;
        return bytes.AsSpan(0, checked((int)size)).ToArray();
    }

    [DllImport("cfgmgr32.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
    private static extern uint CM_Get_Device_Interface_PropertyW(string id, ref PropertyKey key, out uint type,
        [Out] byte[]? buffer, ref uint size, uint flags);
    [DllImport("cfgmgr32.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
    private static extern uint CM_Locate_DevNodeW(out uint node, string id, uint flags);
    [DllImport("cfgmgr32.dll", ExactSpelling = true)]
    private static extern uint CM_Get_Parent(out uint parent, uint node, uint flags);
    [DllImport("cfgmgr32.dll", ExactSpelling = true)]
    private static extern uint CM_Get_Device_ID_Size(out uint length, uint node, uint flags);
    [DllImport("cfgmgr32.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
    private static extern uint CM_Get_Device_IDW(uint node, StringBuilder id, uint length, uint flags);
    [DllImport("cfgmgr32.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
    private static extern uint CM_Get_DevNode_PropertyW(uint node, ref PropertyKey key, out uint type,
        [Out] byte[]? buffer, ref uint size, uint flags);
}

[ComImport, Guid("0bd7a1be-7a1a-44db-8397-cc5392387b5e"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IPhoneDeviceCollection
{
    [PreserveSig] int GetCount(out uint count);
    [PreserveSig] int Item(uint index, out IMMDevice device);
}

[ComImport, Guid("1be09788-6894-4089-8586-9a2a6c265ac5"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IPhoneEndpoint { [PreserveSig] int GetDataFlow(out int flow); }

[ComImport, Guid("2a07407e-6497-4a18-9787-32f79bd0d98f"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IPhoneDeviceTopology
{
    [PreserveSig] int GetConnectorCount(out uint count);
    [PreserveSig] int GetConnector(uint index, out IPhoneConnector connector);
    [PreserveSig] int GetSubunitCount(out uint count);
    [PreserveSig] int GetSubunit(uint index, out IntPtr unit);
    [PreserveSig] int GetPartById(uint id, out IntPtr part);
    [PreserveSig] int GetDeviceId([MarshalAs(UnmanagedType.LPWStr)] out string id);
    [PreserveSig] int GetSignalPath(IntPtr from, IntPtr to, [MarshalAs(UnmanagedType.Bool)] bool reject, out IntPtr parts);
}

[ComImport, Guid("9c2c4058-23f5-41de-877a-df3af236a09e"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IPhoneConnector
{
    [PreserveSig] int GetType(out int type);
    [PreserveSig] int GetDataFlow(out int flow);
    [PreserveSig] int ConnectTo(IPhoneConnector connector);
    [PreserveSig] int Disconnect();
    [PreserveSig] int IsConnected([MarshalAs(UnmanagedType.Bool)] out bool connected);
    [PreserveSig] int GetConnectedTo(out IPhoneConnector connector);
    [PreserveSig] int GetConnectorIdConnectedTo([MarshalAs(UnmanagedType.LPWStr)] out string id);
    [PreserveSig] int GetDeviceIdConnectedTo([MarshalAs(UnmanagedType.LPWStr)] out string id);
}
