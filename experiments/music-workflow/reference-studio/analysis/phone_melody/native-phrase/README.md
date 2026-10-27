# Offline native phrase exporter

Uses the existing Phrase Studio archive reader/writer and playback renderer, with
the supplied `.rstimbre` embedded unchanged. Does not open an app, audio device,
network connection or UI. Does not modify application sources or release pointers.

Build with the installed .NET 9 SDK:

```powershell
dotnet build NativePhrase.csproj -c Release
```

Run the built `NativePhrase.dll` with three arguments: input instrument path,
events JSON path, and a new or empty output directory. Existing outputs are never
overwritten.

```json
{
  "name": "Reference melody",
  "tempo": 120,
  "bars": 4,
  "durationSeconds": 8,
  "events": [
    { "startSeconds": 0.05, "durationSeconds": 0.18, "midi": 80, "velocity": 0.85 }
  ]
}
```

`tempo` must be 20–300 and `bars` 1–16, matching the app. Bars must cover the
requested audio duration and notes. Note starts and ends are independently
rounded to the nearest native PPQ 960 tick, without editor-grid quantization.
Durations shorter than one tick are rejected rather than silently extended.

Outputs are `melody.rsphrase`, `melody-render.wav` and
`native-verification.json`. The WAV is 48 kHz stereo and exactly the requested
duration rounded to a sample. The report records any timing rounding, exact
archive round-trip and embedded-timbre checks, finite nonzero playback output,
hashes, and unchanged inputs. Those are technical checks; melodic accuracy still
requires comparison against the reference and user listening.
