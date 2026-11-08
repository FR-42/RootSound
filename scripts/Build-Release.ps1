param([string]$Version = '0.1.0-preview.5', [switch]$UseCachedRuntimes)
$ErrorActionPreference = 'Stop'
if ($Version -notmatch '^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$') { throw 'Invalid release version.' }
$releaseTaskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Push-Location -LiteralPath $releaseTaskRoot
try {
    foreach ($releaseName in @("RootSound-Windows-x64-$Version-Setup.exe", "RootSound-macOS-arm64-$Version.pkg")) {
        if (Test-Path -LiteralPath "release/$Version/$releaseName") { throw 'Release files already exist. Choose a new version to preserve them.' }
    }
    $env:ROOTSOUND_RELEASE_VERSION = $Version
    $env:ROOTSOUND_RELEASE_OUTPUT = Join-Path $releaseTaskRoot ('.cache/release-zip-check/' + $Version + '-' + [Guid]::NewGuid().ToString('N'))
    $env:DOTNET_CLI_HOME = Join-Path $releaseTaskRoot '.cache/dotnet-home'
    $env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
    if (!(Test-Path -LiteralPath 'node_modules/.bin/vite.cmd') -or !(Test-Path -LiteralPath 'node_modules/@electron/osx-sign/dist/pkg-utils/walk.js')) {
        & npm.cmd ci; if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
    }
    & npm.cmd run check; if ($LASTEXITCODE -ne 0) { throw 'Type checking failed.' }
    & npx.cmd vite build --config vite.release.config.ts; if ($LASTEXITCODE -ne 0) { throw 'Public interface build failed.' }
    & dotnet build desktop/RootSound.Host/RootSound.Host.csproj -c Release --configfile desktop/NuGet.Config -o .cache/release-host
    if ($LASTEXITCODE -ne 0) { throw 'Portable file service build failed.' }
    & node --test tests/release-host.test.mjs; if ($LASTEXITCODE -ne 0) { throw 'Portable file service checks failed.' }
    if ($UseCachedRuntimes) { & python scripts/fetch-release-dependencies.py --offline }
    else { & python scripts/fetch-release-dependencies.py }
    if ($LASTEXITCODE -ne 0) { throw 'Runtime preparation failed.' }
    & python scripts/package-desktop-release.py prepare; if ($LASTEXITCODE -ne 0) { throw 'Package preparation failed.' }
    & python scripts/package-desktop-release.py sign-mac; if ($LASTEXITCODE -ne 0) { throw 'Local Mac signing failed.' }
    & python scripts/package-desktop-release.py archive; if ($LASTEXITCODE -ne 0) { throw 'ZIP creation failed.' }
    & python scripts/verify-release-package.py; if ($LASTEXITCODE -ne 0) { throw 'Release checks failed.' }
    $installerTools = (New-Item -ItemType Directory -Force -Path '.cache/installer-tools').FullName
    $installerArchive = Join-Path $installerTools 'nsis-3.0.4.1.7z'
    if (!(Test-Path -LiteralPath $installerArchive)) {
        Invoke-WebRequest -Uri 'https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-3.0.4.1/nsis-3.0.4.1.7z' -OutFile $installerArchive
    }
    if ((Get-FileHash -LiteralPath $installerArchive).Hash -ne '9877DF902530F96357D13A7A31AE2B9DF67F48B11FFC9A1700A7C961574EC5FA') { throw 'Unexpected NSIS tool checksum.' }
    $installerCompilerDirectory = (New-Item -ItemType Directory -Force -Path (Join-Path $installerTools 'nsis-3.0.4.1')).FullName
    & tar.exe -xf $installerArchive -C $installerCompilerDirectory
    if ($LASTEXITCODE -ne 0) { throw 'Could not extract NSIS.' }
    & node scripts/build-installers.mjs (Join-Path $installerCompilerDirectory 'makensis.exe')
    if ($LASTEXITCODE -ne 0) { throw 'Installer packaging failed.' }
} finally { Pop-Location }
