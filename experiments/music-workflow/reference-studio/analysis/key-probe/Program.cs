using System.Text.Json;
using System.Security.Cryptography;
using System.IO.Compression;
var options = new JsonSerializerOptions { WriteIndented = true };
using var zip = ZipFile.OpenRead(args[0]);
using var stream = zip.GetEntry("manifest.json")!.Open();
using var json = JsonDocument.Parse(stream);
foreach (var asset in json.RootElement.GetProperty("Assets").EnumerateArray())
{
    string name = asset.GetProperty("Name").GetString()!;
    int rate = asset.GetProperty("SampleRate").GetInt32();
    int channels = asset.GetProperty("Channels").GetInt32();
    long frames = asset.GetProperty("Frames").GetInt64();
    string hash = asset.GetProperty("AudioSha256").GetString()!;
    var settings = asset.GetProperty("Settings").Deserialize<InstrumentSettings>()!;
    byte[] native=JsonSerializer.SerializeToUtf8Bytes(new { name, rate, channels, frames, hash, settings },options);
    Console.WriteLine(name + ": " + Convert.ToHexString(SHA256.HashData(native)) + " expected " + asset.GetProperty("Key").GetString());
    File.WriteAllBytes(Path.Combine(args[1],name+"-native-key.json"),native);
}
public sealed record InstrumentSettings(double RootMidi = 60,double AttackSeconds = .005,double DecaySeconds = .15,double Sustain = .8,double ReleaseSeconds = .2,bool LoopEnabled = false,long LoopStart = 0,long LoopEnd = 0,double LoopCrossfadeSeconds = .015,double GainDb = 0);
