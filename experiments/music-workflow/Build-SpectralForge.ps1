param([switch]$Run, [switch]$Test)
$ErrorActionPreference = 'Stop'
$taskExperimentRoot = $PSScriptRoot
$taskWorkspaceRoot = (Resolve-Path -LiteralPath (Join-Path $taskExperimentRoot '..\..')).Path
$taskModuleRoot = Join-Path $taskExperimentRoot 'spectral-forge'
$taskProject = Join-Path $taskModuleRoot 'host\RootSound.SpectralForge.csproj'
$taskConfig = Join-Path $taskModuleRoot 'NuGet.Config'
$env:DOTNET_CLI_HOME = Join-Path $taskWorkspaceRoot '.cache\dotnet-home'
$env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
$env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'
$env:DOTNET_GENERATE_ASPNET_CERTIFICATE = 'false'
Push-Location -LiteralPath $taskWorkspaceRoot
try {
    if ($Test) {
        $taskTestProject = Join-Path $taskModuleRoot 'host-tests\RootSound.SpectralForge.HostTests.csproj'
        & dotnet restore $taskTestProject --configfile $taskConfig --locked-mode
        if ($LASTEXITCODE -ne 0) { throw 'Could not restore the spectral experiment file checks.' }
        $taskTestOutput = Join-Path $taskWorkspaceRoot ('.test-output\spectral-forge\host-' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6))
        & dotnet run --project $taskTestProject -c Release --no-restore -- $taskTestOutput
        if ($LASTEXITCODE -ne 0) { throw 'Spectral experiment file checks failed.' }
        $taskNode = Get-Command node -ErrorAction SilentlyContinue
        if ($taskNode) {
            $taskNodeTests = @(Get-ChildItem -LiteralPath (Join-Path $taskModuleRoot 'tests') -Filter '*.test.mjs' -File | ForEach-Object { $_.FullName })
            if ($taskNodeTests.Count -eq 0) { throw 'Spectral experiment JavaScript checks are missing.' }
            & $taskNode.Source --test @taskNodeTests
            if ($LASTEXITCODE -ne 0) { throw 'Spectral experiment JavaScript checks failed.' }
        } else { Write-Warning 'Node.js is unavailable; only the native file checks were run.' }
    }
    & dotnet restore $taskProject --configfile $taskConfig --locked-mode
    if ($LASTEXITCODE -ne 0) { throw 'Could not restore the spectral experiment Windows references.' }
    $taskReleaseName = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6)
    $taskReleasePath = Join-Path $taskModuleRoot ('.builds\' + $taskReleaseName)
    & dotnet build $taskProject -c Release --no-restore --output $taskReleasePath
    if ($LASTEXITCODE -ne 0) { throw 'Could not build the spectral experiment; previous build remains selected.' }
    foreach ($taskName in @('RootSound.SpectralForge.exe', 'RootSound.SpectralForge.dll', 'RootSound.SpectralForge.runtimeconfig.json', 'RootSound.SpectralForge.deps.json', 'ui\index.html', 'ui\app.mjs', 'ui\document-state.mjs', 'ui\audio-client.mjs', 'ui\host-bridge.mjs', 'ui\model.mjs', 'ui\dsp.mjs', 'ui\synth-worklet.mjs', 'ui\render-worker.mjs', 'ui\curve-editor.mjs', 'ui\curve-density.mjs', 'ui\output-analysis.mjs', 'ui\styles.css')) {
        if (!(Test-Path -LiteralPath (Join-Path $taskReleasePath $taskName))) { throw "Spectral experiment incomplete: $taskName" }
    }
    $taskCompiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
    $taskBuiltLauncher = Join-Path $taskReleasePath 'SpectralForge.Launcher.exe'
    & $taskCompiler /nologo /optimize+ /platform:x64 /langversion:5 /codepage:65001 /reference:System.Windows.Forms.dll /target:winexe "/out:$taskBuiltLauncher" (Join-Path $taskModuleRoot 'Launcher\Program.cs')
    if ($LASTEXITCODE -ne 0) { throw 'Could not build the spectral experiment launcher.' }
    $taskEntry = Join-Path $taskExperimentRoot '精细音色生成器.exe'
    $taskCandidate = Join-Path $taskExperimentRoot ('精细音色生成器.' + [Guid]::NewGuid().ToString('N') + '.tmp')
    try {
        [IO.File]::Copy($taskBuiltLauncher, $taskCandidate)
        if (Test-Path -LiteralPath $taskEntry) { [IO.File]::Replace($taskCandidate, $taskEntry, (Join-Path $taskReleasePath 'Previous.Launcher.exe')) }
        else { [IO.File]::Move($taskCandidate, $taskEntry) }
    } finally { if (Test-Path -LiteralPath $taskCandidate) { Remove-Item -LiteralPath $taskCandidate } }
    $taskPointer = Join-Path $taskModuleRoot '.current'
    $taskPointerCandidate = $taskPointer + '.' + [Guid]::NewGuid().ToString('N') + '.tmp'
    try {
        [IO.File]::WriteAllText($taskPointerCandidate, $taskReleaseName, (New-Object Text.UTF8Encoding($false)))
        if (Test-Path -LiteralPath $taskPointer) { [IO.File]::Replace($taskPointerCandidate, $taskPointer, (Join-Path $taskReleasePath 'Previous.Current')) }
        else { [IO.File]::Move($taskPointerCandidate, $taskPointer) }
    } finally { if (Test-Path -LiteralPath $taskPointerCandidate) { Remove-Item -LiteralPath $taskPointerCandidate } }
    Write-Output "Spectral experiment ready: $taskEntry"
    if ($Run) { Start-Process -FilePath $taskEntry -WorkingDirectory $taskExperimentRoot -WindowStyle Hidden }
} finally { Pop-Location }
