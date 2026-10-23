using System.Runtime.InteropServices;
using System.Text.Json;
using RootSound.BluetoothRecorder.Recording;

namespace RootSound.BluetoothRecorder.Tests;

// Explicit opt-in hardware compatibility check. Initialize only: never Start,
// read capture packets, render sound, change connections or open a microphone.
internal static class OutputLoopbackProbe
{
    internal static async Task<int> WriteAsync(string path)
    {
        object report = await Task.Run(Inspect);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine("Default playback output accepts shared loopback; audioStarted=false; packetsRead=0; desktopControlled=false");
        return 0;
    }

    private static object Inspect()
    {
        WasapiNative.Check(WasapiNative.CoInitializeEx(IntPtr.Zero, 0));
        IMMDeviceEnumerator? devices = null;
        IMMDevice? device = null;
        IAudioClient? client = null;
        IAudioCaptureClient? capture = null;
        IntPtr nativeFormat = IntPtr.Zero;
        try
        {
            devices = (IMMDeviceEnumerator)new MMDeviceEnumeratorComObject();
            WasapiNative.Check(devices.GetDefaultAudioEndpoint(0, 1, out device));
            WasapiNative.Check(((IMMEndpoint)device).GetDataFlow(out int flow));
            if (flow != 0) throw new InvalidOperationException("Expected a playback output.");
            WasapiNative.Check(device.GetState(out uint state));
            if (state != 1) throw new InvalidOperationException("Playback output is unavailable.");
            Guid clientId = WasapiNative.AudioClientId;
            WasapiNative.Check(device.Activate(ref clientId, 23, IntPtr.Zero, out object clientObject));
            client = (IAudioClient)clientObject;
            WasapiNative.Check(client.GetMixFormat(out nativeFormat));
            var format = WaveFormat.FromNative(nativeFormat);
            WasapiNative.Check(client.Initialize(0, WasapiNative.Loopback | WasapiNative.NoPersist,
                1_000_000, 0, nativeFormat, IntPtr.Zero));
            Guid captureId = WasapiNative.CaptureClientId;
            WasapiNative.Check(client.GetService(ref captureId, out object captureObject));
            capture = (IAudioCaptureClient)captureObject;
            return new { Output = WasapiNative.FriendlyName(device), format.SampleRate, format.Channels,
                LoopbackInitialized = true, AudioStarted = false, PacketsRead = 0, MicrophoneOpened = false,
                ConnectionsChanged = false, DesktopControlled = false };
        }
        finally
        {
            if (nativeFormat != IntPtr.Zero) Marshal.FreeCoTaskMem(nativeFormat);
            WasapiNative.Release(capture); WasapiNative.Release(client);
            WasapiNative.Release(device); WasapiNative.Release(devices);
            WasapiNative.CoUninitialize();
        }
    }
}
