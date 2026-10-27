# Offline native instrument probe

This experiment links the actual existing TimbreLab and PhraseStudio archive,
validation, resampling, envelope, loop and mixing source. It does not launch or
build either application, create a UI handle, open an audio device, upload audio,
or change either application's selected release.

Build in this folder with .NET SDK 9, keeping the CLI home inside the workspace:

```powershell
$env:DOTNET_CLI_HOME = 'D:\RootSound\.cache\dotnet-home'
$env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'
$env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
dotnet build -c Release --ignore-failed-sources
```

Invoke the generated `bin/Release/net9.0-windows10.0.19041.0/NativeProbe.dll`
directly with `dotnet`. Output paths must be new, to preserve existing exports.

```text
create <32-bit-float.wav> <InstrumentSettings.json> <new.rstimbre> <name>
verify <existing.rstimbre> <fresh-output-directory>
```

`create` imports exact float samples and uses `TimbreArchive.ExportAsync`, then
checks a native import preserves all samples and settings. Its LoopFinder report
is a diagnostic suggestion; it never changes the requested loop settings.

`verify` imports the real instrument archive, renders notes at rounded root minus
two, root, root plus two, and root plus five semitones using InstrumentRenderer,
and renders a two-second root hold. It also saves and reopens a self-contained
four-note `.rsphrase` using the real PhraseArchive, and renders that reopened
phrase through PhraseMixSource/InstrumentVoice. These notes are keyboard checks,
not a transcription or reconstruction of the original melody.

The report records archive SHA256, exact roundtrip, embedded sample and setting
equality, finite protected peaks, endpoint values and numerical loop-boundary
differences. The numerical checks do not establish timbre fidelity, musical
quality or an inaudible loop seam. Those remain listening judgements.
