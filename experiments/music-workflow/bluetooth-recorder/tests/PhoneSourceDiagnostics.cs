using System.Text.Json;
using RootSound.BluetoothRecorder.PhoneAudio;
using Windows.Devices.Enumeration;
using Windows.Media.Audio;

namespace RootSound.BluetoothRecorder.Tests;

/// <summary>Read metadata only: never connect, start playback, or open an audio stream.</summary>
internal static class PhoneSourceDiagnostics
{
    internal static async Task<int> WriteAsync(string path)
    {
        List<object> devices = [];
        string selector = AudioPlaybackConnection.GetDeviceSelector();
        var found = await DeviceInformation.FindAllAsync(selector);
        foreach (var device in found)
        {
            List<object> queries = [];
            foreach (var properties in new[]
            {
                PhoneCaptureEndpointResolver.IdentityProperties,
                new[] { "System.Devices.DeviceInstanceId" },
                new[] { "System.Devices.AepService.AepId" }
            })
            {
                try
                {
                    var info = await DeviceInformation.CreateFromIdAsync(device.Id, properties, device.Kind);
                    queries.Add(new { Requested = properties, info?.Kind, Properties = info?.Properties });
                }
                catch (Exception error) { queries.Add(new { Requested = properties, Error = error.Message, error.HResult }); }
            }
            object identity;
            try { identity = await PhoneCaptureEndpointResolver.ReadPhoneIdentityAsync(device.Id, CancellationToken.None); }
            catch (Exception error) { identity = new { Error = error.ToString() }; }
            string? instanceId = PhoneMetadataNative.ReadInterfaceInstanceId(device.Id);
            devices.Add(new { device.Id, device.Kind, device.Name, Properties = device.Properties, Queries = queries,
                NativeInstanceId = instanceId, Lineage = instanceId is null ? null : PhoneMetadataNative.ReadLineage(instanceId), Identity = identity });
        }
        object? endpoints;
        try
        {
            endpoints = await Task.Run(() => PhoneCaptureEndpointResolver.ReadCaptureEndpoints(CancellationToken.None, includeInactive: true));
        }
        catch (Exception error) { endpoints = new { Error = error.ToString() }; }
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(new { Selector = selector, Devices = devices, Endpoints = endpoints,
            AudioStreamsOpened = false, ConnectionsChanged = false, DesktopControlled = false }, new JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine($"Metadata report saved; receivers={devices.Count}; audioStreamsOpened=false; connectionsChanged=false; desktopControlled=false");
        return 0;
    }
}
