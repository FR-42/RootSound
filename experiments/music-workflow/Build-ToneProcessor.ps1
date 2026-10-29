param([switch]$Run, [switch]$Test)
$ErrorActionPreference = 'Stop'
$taskExperimentRoot = $PSScriptRoot
$taskWorkspaceRoot = (Resolve-Path -LiteralPath (Join-Path $taskExperimentRoot '..\..')).Path
$taskModuleRoot = Join-Path $taskExperimentRoot 'tone-processor'
$taskProject = Join-Path $taskModuleRoot 'RootSound.ToneProcessor.csproj'
$taskConfig = Join-Path $taskModuleRoot 'NuGet.Config'
$env:DOTNET_CLI_HOME = Join-Path $taskWorkspaceRoot '.cache\dotnet-home'
$env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
$env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'
Push-Location -LiteralPath $taskWorkspaceRoot
try {
    & dotnet restore $taskProject --configfile $taskConfig --locked-mode
    if ($LASTEXITCODE -ne 0) { throw 'Could not restore Tone Processor dependencies.' }
    $taskReleaseName = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6)
    $taskReleasePath = Join-Path $taskModuleRoot ('.builds\' + $taskReleaseName)
    & dotnet build $taskProject -c Release --no-restore --output $taskReleasePath
    if ($LASTEXITCODE -ne 0) { throw 'Could not build Tone Processor; previous release remains selected.' }
    foreach ($taskName in @('RootSound.ToneProcessor.exe','RootSound.ToneProcessor.dll','RootSound.ToneProcessor.deps.json','RootSound.ToneProcessor.runtimeconfig.json','Microsoft.Web.WebView2.Core.dll','Microsoft.Web.WebView2.WinForms.dll','ui\index.html','ui\processor.mjs','ui\processor.css','ui\eq-state.mjs','ui\eq-worker.mjs','ui\shared\curve-editor.mjs','ui\shared\curve-density.mjs','ui\shared\model.mjs','ui\shared\dsp.mjs','ui\shared\styles.css')) {
        if (!(Test-Path -LiteralPath (Join-Path $taskReleasePath $taskName))) { throw "Incomplete release: $taskName" }
    }
    if ($Test) {
        $taskNode = Get-Command node -ErrorAction Stop
        $taskTestOutput = Join-Path $taskWorkspaceRoot ('.test-output\tone-processor\' + $taskReleaseName)
        $env:ROOTSOUND_TONE_UI = Join-Path $taskReleasePath 'ui'
        $env:ROOTSOUND_TONE_TEST_OUTPUT = $taskTestOutput
        & $taskNode.Source --test (Join-Path $taskModuleRoot 'tests\processor.test.mjs') (Join-Path $taskExperimentRoot 'spectral-forge\tests\curve-editor.test.mjs')
        if ($LASTEXITCODE -ne 0) { throw 'EQ editor or DSP checks failed.' }
        $taskTests = Join-Path $taskModuleRoot 'tests\RootSound.ToneProcessor.Tests.csproj'
        & dotnet restore $taskTests --configfile $taskConfig --locked-mode
        if ($LASTEXITCODE -ne 0) { throw 'Could not restore native checks.' }
        & dotnet run --project $taskTests -c Release --no-restore -- $taskTestOutput
        if ($LASTEXITCODE -ne 0) { throw 'Native audio or file checks failed.' }
        $taskLabTests = Join-Path $taskExperimentRoot 'timbre-lab\tests\RootSound.TimbreLab.Tests.csproj'
        & dotnet restore $taskLabTests --configfile (Join-Path $taskExperimentRoot 'timbre-lab\NuGet.Config') --locked-mode
        if ($LASTEXITCODE -ne 0) { throw 'Could not restore timbre processing regression checks.' }
        & dotnet run --project $taskLabTests -c Release --no-restore -- (Join-Path $taskTestOutput 'lab-regression')
        if ($LASTEXITCODE -ne 0) { throw 'Timbre processing regression checks failed.' }
    }
    $taskCompiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
    $taskBuiltLauncher = Join-Path $taskReleasePath 'ToneProcessor.Launcher.exe'
    & $taskCompiler /nologo /optimize+ /platform:x64 /langversion:5 /codepage:65001 /reference:System.Windows.Forms.dll /target:winexe "/out:$taskBuiltLauncher" (Join-Path $taskModuleRoot 'Launcher\Program.cs')
    if ($LASTEXITCODE -ne 0) { throw 'Could not build Tone Processor launcher.' }
    foreach ($taskEntryName in @('音色器')) {
        $taskEntry = Join-Path $taskExperimentRoot ($taskEntryName + '.exe')
        $taskCandidate = Join-Path $taskExperimentRoot ($taskEntryName + '.' + [Guid]::NewGuid().ToString('N') + '.tmp')
        try {
            [IO.File]::Copy($taskBuiltLauncher, $taskCandidate)
            if (Test-Path -LiteralPath $taskEntry) { [IO.File]::Replace($taskCandidate, $taskEntry, (Join-Path $taskReleasePath ('Previous.' + $taskEntryName + '.exe'))) }
            else { [IO.File]::Move($taskCandidate, $taskEntry) }
        } finally { if (Test-Path -LiteralPath $taskCandidate) { Remove-Item -LiteralPath $taskCandidate } }
    }
    $taskEntry = Join-Path $taskExperimentRoot '音色器.exe'
    $taskPointer = Join-Path $taskModuleRoot '.current'
    $taskPointerCandidate = $taskPointer + '.' + [Guid]::NewGuid().ToString('N') + '.tmp'
    try {
        [IO.File]::WriteAllText($taskPointerCandidate, $taskReleaseName, (New-Object Text.UTF8Encoding($false)))
        if (Test-Path -LiteralPath $taskPointer) { [IO.File]::Replace($taskPointerCandidate, $taskPointer, (Join-Path $taskReleasePath 'Previous.Current')) }
        else { [IO.File]::Move($taskPointerCandidate, $taskPointer) }
    } finally { if (Test-Path -LiteralPath $taskPointerCandidate) { Remove-Item -LiteralPath $taskPointerCandidate } }
    Write-Output "Tone Processor ready: $taskEntry"
    if ($Run) { Start-Process -FilePath $taskEntry -WorkingDirectory $taskExperimentRoot -WindowStyle Hidden }
} finally { Pop-Location }
