param([string]$PackagedDirectory)
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Push-Location -LiteralPath $repo
try {
    $plan = Get-Content -LiteralPath '.cache/release-package-plan.json' -Raw | ConvertFrom-Json
    if (!$PackagedDirectory) { $PackagedDirectory = $plan.windows }
    $packageRoot = (Resolve-Path -LiteralPath $PackagedDirectory).Path
    $app = Join-Path $packageRoot 'resources/app'
    $metadata = Get-Content -LiteralPath (Join-Path $app 'package.json') -Raw | ConvertFrom-Json
    if ($metadata.shell -ne 'native-windows' -or $metadata.version -ne $plan.version) { throw 'Unexpected desktop payload.' }
    foreach ($name in @('RootSound.dll', 'RootSound.runtimeconfig.json', 'webview/msedgewebview2.exe', 'runtime/dotnet.exe', 'Microsoft.Web.WebView2.Core.dll', 'ui/index.html')) {
        if (!(Test-Path -LiteralPath (Join-Path $app $name))) { throw "Missing native dependency: $name" }
    }
    $run = Join-Path $repo ('.test-output/native-release-' + [Guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $run | Out-Null
    $core = [Reflection.Assembly]::LoadFrom((Join-Path $app 'Microsoft.Web.WebView2.Core.dll'))
    $browserVersion = [Microsoft.Web.WebView2.Core.CoreWebView2Environment]::GetAvailableBrowserVersionString([string](Join-Path $app 'webview'))
    if (!$browserVersion) { throw 'The private WebView2 engine is unavailable.' }
    & (Join-Path $app 'runtime/dotnet.exe') (Join-Path $app 'host/RootSound.Host.dll') --verify-installation
    if ($LASTEXITCODE -ne 0) { throw 'Installed payload checksum failed.' }
    $resourceOutput = Join-Path $run 'resources'
    $entryTested = Test-Path -LiteralPath (Join-Path $app 'rootsound-installed')
    if ($entryTested) {
        $process = Start-Process -FilePath (Join-Path $packageRoot 'RootSound.exe') -ArgumentList @('--test-local-resources', ('"' + $resourceOutput + '"')) -WindowStyle Hidden -Wait -PassThru
        if ($process.ExitCode -ne 0) { throw 'Installed entry launcher failed.' }
        $deadline = [DateTime]::UtcNow.AddSeconds(20)
        while (!(Test-Path -LiteralPath (Join-Path $resourceOutput 'local-resources-report.json')) -and [DateTime]::UtcNow -lt $deadline) { Start-Sleep -Milliseconds 100 }
    } else {
        & (Join-Path $app 'runtime/dotnet.exe') (Join-Path $app 'RootSound.dll') --test-local-resources $resourceOutput
        if ($LASTEXITCODE -ne 0) { throw 'Native resource checks failed.' }
    }
    $resources = Get-Content -LiteralPath (Join-Path $resourceOutput 'local-resources-report.json') -Raw | ConvertFrom-Json
    if ($resources.error -or $resources.passed -lt 15) { throw 'Native resource checks failed.' }
    $native = [Reflection.Assembly]::LoadFrom((Join-Path $app 'RootSound.dll'))
    $seed = $native.GetType('RootSound.Desktop.BundledProjects').GetMethod('Seed', [Reflection.BindingFlags]'NonPublic,Static')
    $seeds = Join-Path $app 'seed-projects'
    $data = Join-Path $run 'songs'
    $manifest = Get-Content -LiteralPath (Join-Path $seeds 'manifest.json') -Raw | ConvertFrom-Json
    $existing = Join-Path $data ('project/演示项目/' + $manifest.projects[0].name)
    New-Item -ItemType Directory -Path (Split-Path -Parent $existing) | Out-Null
    [IO.File]::WriteAllText($existing, 'user-owned demo with same name')
    $copied = $seed.Invoke($null, [object[]]@([string]$seeds, [string]$data))
    if ($copied -ne $manifest.projects.Count - 1) { throw 'Unexpected seed count.' }
    if ([IO.File]::ReadAllText($existing) -ne 'user-owned demo with same name') { throw 'An existing song was overwritten.' }
    $deleted = Join-Path $data ('project/演示项目/' + $manifest.projects[1].name)
    Remove-Item -LiteralPath $deleted
    if ($seed.Invoke($null, [object[]]@([string]$seeds, [string]$data)) -ne 0 -or (Test-Path -LiteralPath $deleted)) { throw 'A user deletion was revived.' }
    $report = [ordered]@{ passed = $true; nativeResourceChecks = $resources.passed; browserVersion = $browserVersion; privateRuntimeUsed = $true;
        installedEntryTested = $entryTested; bundledProjects = $manifest.projects.Count; existingSongsPreserved = $true; userDeletionsPreserved = $true;
        visibleWindow = $false; screenCaptured = $false; physicalAudio = $false; packageRoot = $packageRoot }
    $report | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $run 'report.json') -Encoding utf8
    $report | ConvertTo-Json
    Write-Output "Evidence: $run"
} finally { Pop-Location }
