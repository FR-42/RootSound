param([switch]$Run, [switch]$Test)
$ErrorActionPreference = 'Stop'
$taskExperimentRoot = $PSScriptRoot
$taskWorkspaceRoot = (Resolve-Path -LiteralPath (Join-Path $taskExperimentRoot '..\..')).Path
$taskModuleRoot = Join-Path $taskExperimentRoot 'tone-structure'
$taskProject = Join-Path $taskModuleRoot 'RootSound.ToneStructure.csproj'
$taskConfig = Join-Path $taskModuleRoot 'NuGet.Config'
$env:DOTNET_CLI_HOME = Join-Path $taskWorkspaceRoot '.cache\dotnet-home'
$env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
$env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'
Push-Location -LiteralPath $taskWorkspaceRoot
try {
    & dotnet restore $taskProject --configfile $taskConfig --locked-mode
    if ($LASTEXITCODE -ne 0) { throw 'Could not restore Tone Structure.' }
    $taskReleaseName = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff') + '-' + [Guid]::NewGuid().ToString('N').Substring(0,6)
    $taskReleasePath = Join-Path $taskModuleRoot ('.builds\' + $taskReleaseName)
    & dotnet build $taskProject -c Release --no-restore -m:1 --output $taskReleasePath
    if ($LASTEXITCODE -ne 0) { throw 'Could not build Tone Structure; previous release remains selected.' }
    foreach ($taskFile in @('RootSound.ToneStructure.exe','RootSound.ToneStructure.dll','RootSound.ToneStructure.deps.json','RootSound.ToneStructure.runtimeconfig.json','RootSound.ToneProcessor.dll','Microsoft.Web.WebView2.Core.dll','Microsoft.Web.WebView2.WinForms.dll','demucs_worker.py','ui\index.html','ui\processor.mjs','ui\eq-worker.mjs','ui\shared\dsp.mjs','ui\shared\curve-editor.mjs')) {
        if (!(Test-Path -LiteralPath (Join-Path $taskReleasePath $taskFile))) { throw "Missing release file: $taskFile" }
    }
    if ($Test) {
        $taskTestOutput = Join-Path $taskWorkspaceRoot ('.test-output\tone-structure\' + $taskReleaseName)
        $taskTests = Join-Path $taskModuleRoot 'tests\RootSound.ToneStructure.Tests.csproj'
        & dotnet restore $taskTests --configfile $taskConfig --locked-mode
        if ($LASTEXITCODE -ne 0) { throw 'Could not restore structure checks.' }
        & dotnet build $taskTests -c Release --no-restore -m:1
        if ($LASTEXITCODE -ne 0) { throw 'Could not build structure checks.' }
        & dotnet run --project $taskTests -c Release --no-build --no-restore -- $taskTestOutput
        if ($LASTEXITCODE -ne 0) { throw 'Structure checks failed.' }
        $env:ROOTSOUND_TONE_UI = Join-Path $taskReleasePath 'ui'
        $env:ROOTSOUND_TONE_TEST_OUTPUT = Join-Path $taskTestOutput 'capture-regression'
        & node --test (Join-Path $taskExperimentRoot 'tone-processor\tests\processor.test.mjs') (Join-Path $taskExperimentRoot 'spectral-forge\tests\curve-editor.test.mjs')
        if ($LASTEXITCODE -ne 0) { throw 'Shared EQ checks failed.' }
        $taskCaptureTests = Join-Path $taskExperimentRoot 'tone-processor\tests\RootSound.ToneProcessor.Tests.csproj'
        & dotnet restore $taskCaptureTests --configfile (Join-Path $taskExperimentRoot 'tone-processor\NuGet.Config') --locked-mode
        if ($LASTEXITCODE -ne 0) { throw 'Could not restore shared capture checks.' }
        & dotnet build $taskCaptureTests -c Release --no-restore -m:1
        if ($LASTEXITCODE -ne 0) { throw 'Could not build shared capture checks.' }
        & dotnet run --project $taskCaptureTests -c Release --no-build --no-restore -- $env:ROOTSOUND_TONE_TEST_OUTPUT
        if ($LASTEXITCODE -ne 0) { throw 'Shared capture checks failed.' }
    }
    $taskCompiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
    $taskBuiltLauncher = Join-Path $taskReleasePath 'ToneStructure.Launcher.exe'
    & $taskCompiler /nologo /optimize+ /platform:x64 /langversion:5 /codepage:65001 /reference:System.Windows.Forms.dll /target:winexe "/out:$taskBuiltLauncher" (Join-Path $taskModuleRoot 'Launcher\Program.cs')
    if ($LASTEXITCODE -ne 0) { throw 'Could not build the launcher.' }
    $taskEntry = Join-Path $taskExperimentRoot '音色结构.exe'
    $taskCandidate = Join-Path $taskExperimentRoot ('音色结构.' + [Guid]::NewGuid().ToString('N') + '.tmp')
    try {
        [IO.File]::Copy($taskBuiltLauncher,$taskCandidate)
        if (Test-Path -LiteralPath $taskEntry) { [IO.File]::Replace($taskCandidate,$taskEntry,(Join-Path $taskReleasePath 'Previous.Launcher.exe')) }
        else { [IO.File]::Move($taskCandidate,$taskEntry) }
    } finally { if (Test-Path -LiteralPath $taskCandidate) { Remove-Item -LiteralPath $taskCandidate } }
    $taskPointer = Join-Path $taskModuleRoot '.current'
    $taskPointerCandidate = $taskPointer + '.' + [Guid]::NewGuid().ToString('N') + '.tmp'
    try {
        [IO.File]::WriteAllText($taskPointerCandidate,$taskReleaseName,(New-Object Text.UTF8Encoding($false)))
        if (Test-Path -LiteralPath $taskPointer) { [IO.File]::Replace($taskPointerCandidate,$taskPointer,(Join-Path $taskReleasePath 'Previous.Current')) }
        else { [IO.File]::Move($taskPointerCandidate,$taskPointer) }
    } finally { if (Test-Path -LiteralPath $taskPointerCandidate) { Remove-Item -LiteralPath $taskPointerCandidate } }
    Write-Output "Tone Structure ready: $taskEntry"
    if ($Run) { Start-Process -FilePath $taskEntry -WorkingDirectory $taskExperimentRoot -WindowStyle Hidden }
} finally { Pop-Location }
