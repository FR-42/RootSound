param([switch]$Run, [switch]$Test)
$ErrorActionPreference = 'Stop'
$experimentRoot = $PSScriptRoot
$workspaceRoot = (Resolve-Path -LiteralPath (Join-Path $experimentRoot '..\..')).Path
$moduleRoot = Join-Path $experimentRoot 'timbre-lab'
$projectPath = Join-Path $moduleRoot 'RootSound.TimbreLab.csproj'
$configPath = Join-Path $moduleRoot 'NuGet.Config'
$env:DOTNET_CLI_HOME = Join-Path $workspaceRoot '.cache\dotnet-home'
$env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
$env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'
$env:DOTNET_GENERATE_ASPNET_CERTIFICATE = 'false'
Push-Location -LiteralPath $workspaceRoot
try {
    if ($Test) {
        $testProject = Join-Path $moduleRoot 'tests\RootSound.TimbreLab.Tests.csproj'
        & dotnet restore $testProject --configfile $configPath --locked-mode
        if ($LASTEXITCODE -ne 0) { throw 'Could not restore the timbre lab checks.' }
        $testOutput = Join-Path $workspaceRoot ('.test-output\timbre-lab\' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6))
        & dotnet run --project $testProject -c Release --no-restore -- $testOutput
        if ($LASTEXITCODE -ne 0) { throw 'Timbre lab checks failed.' }
    }
    & dotnet restore $projectPath --configfile $configPath --locked-mode
    if ($LASTEXITCODE -ne 0) { throw 'Could not restore the timbre lab Windows references.' }
    $releaseName = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6)
    $releasePath = Join-Path $moduleRoot ('.builds\' + $releaseName)
    & dotnet build $projectPath -c Release --no-restore --output $releasePath
    if ($LASTEXITCODE -ne 0) { throw 'Could not build timbre lab. Previous build remains selected.' }
    foreach ($fileName in @('RootSound.TimbreLab.exe', 'RootSound.TimbreLab.dll', 'RootSound.TimbreLab.runtimeconfig.json', 'RootSound.TimbreLab.deps.json')) {
        if (!(Test-Path -LiteralPath (Join-Path $releasePath $fileName))) { throw "Build incomplete: $fileName" }
    }
    $compilerPath = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
    $builtLauncher = Join-Path $releasePath 'TimbreLab.Launcher.exe'
    & $compilerPath /nologo /optimize+ /platform:x64 /langversion:5 /codepage:65001 /reference:System.Windows.Forms.dll /target:winexe "/out:$builtLauncher" (Join-Path $moduleRoot 'Launcher\Program.cs')
    if ($LASTEXITCODE -ne 0) { throw 'Could not build the timbre lab entry.' }
    $entryPath = Join-Path $experimentRoot '音色打磨.exe'
    $candidatePath = Join-Path $experimentRoot ('音色打磨.' + [Guid]::NewGuid().ToString('N') + '.tmp')
    [IO.File]::Copy($builtLauncher, $candidatePath)
    if (Test-Path -LiteralPath $entryPath) { [IO.File]::Replace($candidatePath, $entryPath, (Join-Path $releasePath 'Previous.Launcher.exe')) }
    else { [IO.File]::Move($candidatePath, $entryPath) }
    $pointerPath = Join-Path $moduleRoot '.current'
    $pointerCandidate = $pointerPath + '.' + [Guid]::NewGuid().ToString('N') + '.tmp'
    [IO.File]::WriteAllText($pointerCandidate, $releaseName, (New-Object Text.UTF8Encoding($false)))
    if (Test-Path -LiteralPath $pointerPath) { [IO.File]::Replace($pointerCandidate, $pointerPath, (Join-Path $releasePath 'Previous.Current')) }
    else { [IO.File]::Move($pointerCandidate, $pointerPath) }
    Write-Output "Timbre lab ready: $entryPath"
    if ($Run) { Start-Process -FilePath $entryPath -WorkingDirectory $experimentRoot -WindowStyle Hidden }
} finally { Pop-Location }
