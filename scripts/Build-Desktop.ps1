$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Push-Location -LiteralPath $taskRoot
try {
    $env:DOTNET_CLI_HOME = Join-Path $taskRoot '.cache\dotnet-home'
    $env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
    $env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'
    $env:DOTNET_GENERATE_ASPNET_CERTIFICATE = 'false'
    if (!(Test-Path -LiteralPath 'node_modules\.bin\vite.cmd')) {
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw 'Could not install frontend dependencies.' }
    }
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'Could not build the interface.' }
    & dotnet restore 'desktop/RootSound.Desktop/RootSound.Desktop.csproj' --configfile 'desktop/NuGet.Config' --locked-mode
    if ($LASTEXITCODE -ne 0) { throw 'Could not restore desktop dependencies.' }
    $taskReleaseName = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6)
    $taskReleaseRelative = '.cache\desktop-builds\' + $taskReleaseName
    $taskReleaseDirectory = Join-Path $taskRoot $taskReleaseRelative
    & dotnet build 'desktop/RootSound.Desktop/RootSound.Desktop.csproj' -c Release --no-restore --output $taskReleaseDirectory
    if ($LASTEXITCODE -ne 0) { throw 'Could not build RootSound desktop.' }
    New-Item -ItemType Directory -Force -Path '.cache' | Out-Null
    if (!(Test-Path -LiteralPath (Join-Path $taskReleaseDirectory 'RootSound.exe')) -or !(Test-Path -LiteralPath (Join-Path $taskReleaseDirectory 'ui\index.html'))) {
        throw 'The new desktop build is incomplete; the previous build remains selected.'
    }
    # The stable entry is a tiny WinExe. Compile before publishing either entry
    # or pointer, so a failed launcher build cannot select an incomplete update.
    $taskLauncher = Join-Path $taskReleaseDirectory 'RootSound.Launcher.exe'
    & (Join-Path $PSScriptRoot 'Build-Launcher.ps1') -OutputPath $taskLauncher
    $taskEntry = Join-Path $taskRoot 'RootSound.exe'
    & (Join-Path $PSScriptRoot 'Publish-DesktopEntry.ps1') -LauncherPath $taskLauncher -EntryPath $taskEntry
    $taskPointer = Join-Path $taskRoot '.cache\desktop-build.current'
    $taskCandidate = $taskPointer + '.' + [Guid]::NewGuid().ToString('N') + '.tmp'
    [IO.File]::WriteAllText($taskCandidate, $taskReleaseRelative, (New-Object Text.UTF8Encoding($false)))
    if (Test-Path -LiteralPath $taskPointer) { [IO.File]::Replace($taskCandidate, $taskPointer, $taskPointer + '.bak') }
    else { [IO.File]::Move($taskCandidate, $taskPointer) }
    [IO.File]::WriteAllText((Join-Path $taskRoot '.cache\desktop-build.stamp'), [DateTime]::UtcNow.ToString('O'))
} finally { Pop-Location }
