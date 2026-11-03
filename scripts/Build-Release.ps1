param([string]$Version = '0.1.0-preview.2', [switch]$IncludeCurrentProjects)
$ErrorActionPreference = 'Stop'
if ($Version -notmatch '^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$') { throw 'Invalid release version.' }
$releaseTaskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Push-Location -LiteralPath $releaseTaskRoot
try {
    foreach ($releasePlatform in @('Windows-x64', 'macOS-arm64')) {
        if (Test-Path -LiteralPath "release/RootSound-$releasePlatform-$Version.zip") { throw 'Release files already exist. Choose a new version to preserve them.' }
    }
    $env:ROOTSOUND_RELEASE_VERSION = $Version
    $env:ROOTSOUND_INCLUDE_PROJECTS = if ($IncludeCurrentProjects) { '1' } else { '0' }
    $env:DOTNET_CLI_HOME = Join-Path $releaseTaskRoot '.cache/dotnet-home'
    $env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
    if (!(Test-Path -LiteralPath 'node_modules/.bin/vite.cmd')) { & npm.cmd ci; if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' } }
    & npm.cmd run check; if ($LASTEXITCODE -ne 0) { throw 'Type checking failed.' }
    & npx.cmd vite build --config vite.release.config.ts; if ($LASTEXITCODE -ne 0) { throw 'Public interface build failed.' }
    & dotnet build desktop/RootSound.Host/RootSound.Host.csproj -c Release --configfile desktop/NuGet.Config -o .cache/release-host
    if ($LASTEXITCODE -ne 0) { throw 'Portable file service build failed.' }
    & node --test tests/release-host.test.mjs; if ($LASTEXITCODE -ne 0) { throw 'Portable file service checks failed.' }
    & python scripts/fetch-release-dependencies.py; if ($LASTEXITCODE -ne 0) { throw 'Runtime downloads failed.' }
    & python scripts/package-desktop-release.py prepare; if ($LASTEXITCODE -ne 0) { throw 'Package preparation failed.' }
    & python scripts/package-desktop-release.py sign-mac; if ($LASTEXITCODE -ne 0) { throw 'Local Mac signing failed.' }
    & python scripts/package-desktop-release.py archive; if ($LASTEXITCODE -ne 0) { throw 'ZIP creation failed.' }
    & python scripts/verify-release-package.py; if ($LASTEXITCODE -ne 0) { throw 'Release checks failed.' }
} finally { Pop-Location }
