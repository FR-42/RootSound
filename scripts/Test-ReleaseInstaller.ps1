param([string]$Version = '0.1.0-preview.11')
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Push-Location -LiteralPath $repo
try {
    $setup = (Resolve-Path -LiteralPath "release/$Version/简乐安装.exe").Path
    $legacy = (Resolve-Path -LiteralPath '.cache/release-legacy-reference/preview10').Path
    $expectedLegacy = Join-Path $repo '.cache\release-legacy-reference\preview10'
    if ($legacy -ne $expectedLegacy) { throw 'Unexpected fixture installation root.' }
    $run = Join-Path $repo ('.test-output/final-installer-' + [Guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $run, (Join-Path $run 'temp') | Out-Null
    $env:TEMP = Join-Path $run 'temp'
    $env:TMP = $env:TEMP
    $old = Join-Path $legacy 'app-0.1.0-preview.10'
    if (!(Test-Path -LiteralPath (Join-Path $old 'RootSound.exe'))) { throw 'The old release fixture is unavailable.' }
    $userFiles = @(
        (Join-Path $legacy 'project/用户作品.rootsound'),
        (Join-Path $legacy 'project/演示项目/钟.rootsound'),
        (Join-Path $old '旧程序旁的作品.rootsound'),
        (Join-Path $old 'resources/app/用户自己的.mid')
    )
    $hashes = @{}
    foreach ($file in $userFiles) {
        New-Item -ItemType Directory -Path (Split-Path -Parent $file) -Force | Out-Null
        [IO.File]::WriteAllText($file, 'fixture user music - must survive upgrade')
        $hashes[$file] = (Get-FileHash -LiteralPath $file).Hash
    }
    function Install-To([string]$Location) {
        $process = Start-Process -FilePath $setup -ArgumentList @('/S', '/NO_DESKTOP_SHORTCUT', '/NO_REGISTER', "/D=$Location") -WindowStyle Hidden -Wait -PassThru
        if ($process.ExitCode -ne 0) { throw "Release installer failed: $($process.ExitCode)" }
    }
    Install-To $legacy
    $current = Join-Path $legacy "app-$Version"
    if (Test-Path -LiteralPath (Join-Path $old 'RootSound.exe')) { throw 'The old program was not cleaned.' }
    foreach ($file in $userFiles) {
        if (!(Test-Path -LiteralPath $file) -or (Get-FileHash -LiteralPath $file).Hash -ne $hashes[$file]) { throw "A song changed during upgrade: $file" }
    }
    $shortcut = (New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $legacy 'RootSound.lnk'))
    if ($shortcut.TargetPath -ne (Join-Path $current 'RootSound.exe')) { throw 'The shortcut does not target the new native release.' }
    & (Join-Path $PSScriptRoot 'Test-NativeRelease.ps1') -PackagedDirectory $current
    $fresh = Join-Path $run '中文 空格 全新安装'
    Install-To $fresh
    $freshApp = Join-Path $fresh "app-$Version/resources/app"
    & (Join-Path $freshApp 'runtime/dotnet.exe') (Join-Path $freshApp 'host/RootSound.Host.dll') --verify-installation
    if ($LASTEXITCODE -ne 0) { throw 'The fresh installation failed verification.' }
    $report = [ordered]@{ passed = $true; version = $Version; finalInstallerExecuted = $true; freshInstallation = $true; upgradeFromPreview10 = $true;
        sourceRoot = $legacy; preservedUserFiles = $userFiles.Count; shortcutUpdated = $true; oldProgramRemoved = $true;
        chineseAndSpacePath = $true; desktopShortcutWritten = $false; productionRegistrationChanged = $false; visibleWindow = $false }
    $report | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $run 'report.json') -Encoding utf8
    $report | ConvertTo-Json
    Write-Output "Evidence: $run"
} finally { Pop-Location }
