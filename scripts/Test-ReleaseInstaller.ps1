param([string]$Version = '0.1.0-preview.12', [string]$PreviousVersion = '0.1.0-preview.11')
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Push-Location -LiteralPath $repo
try {
    $setup = (Resolve-Path -LiteralPath "release/$Version/简乐安装.exe").Path
    $previousSetup = (Resolve-Path -LiteralPath "release/$PreviousVersion/简乐安装.exe").Path
    $run = Join-Path $repo ('.test-output/final-installer-' + [Guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $run, (Join-Path $run 'temp') | Out-Null
    $env:TEMP = Join-Path $run 'temp'
    $env:TMP = $env:TEMP
    function Install-To([string]$Installer, [string]$Location) {
        $process = Start-Process -FilePath $Installer -ArgumentList @('/S', '/NO_DESKTOP_SHORTCUT', '/NO_REGISTER', "/D=$Location") -WindowStyle Hidden -Wait -PassThru
        if ($process.ExitCode -ne 0) { throw "Release installer failed: $($process.ExitCode)" }
    }
    function Read-ProjectTree([string]$Location) {
        Get-ChildItem -LiteralPath $Location -Recurse -Force | Sort-Object FullName | ForEach-Object {
            $relative = [IO.Path]::GetRelativePath($Location, $_.FullName)
            if ($_.PSIsContainer) { "directory $relative" }
            else { "file $relative $((Get-FileHash -LiteralPath $_.FullName).Hash)" }
        }
    }
    $legacy = Join-Path $run '中文 空格 升级安装'
    Install-To $previousSetup $legacy
    $old = Join-Path $legacy "app-$PreviousVersion"
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
    $projectRoot = Join-Path $legacy 'project'
    $before = @(Read-ProjectTree $projectRoot)
    Install-To $setup $legacy
    $current = Join-Path $legacy "app-$Version"
    if (Test-Path -LiteralPath (Join-Path $old 'RootSound.exe')) { throw 'The old program was not cleaned.' }
    foreach ($file in $userFiles) {
        if (!(Test-Path -LiteralPath $file) -or (Get-FileHash -LiteralPath $file).Hash -ne $hashes[$file]) { throw "A song changed during upgrade: $file" }
    }
    $shortcut = (New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $legacy 'RootSound.lnk'))
    if ($shortcut.TargetPath -ne (Join-Path $current 'RootSound.exe')) { throw 'The shortcut does not target the new native release.' }
    & (Join-Path $PSScriptRoot 'Test-NativeRelease.ps1') -PackagedDirectory $current
    $upgradeApp = Join-Path $current 'resources/app'
    $native = [Reflection.Assembly]::LoadFrom((Join-Path $upgradeApp 'RootSound.dll'))
    $seed = $native.GetType('RootSound.Desktop.BundledProjects').GetMethod('SeedForInstallation', [Reflection.BindingFlags]'NonPublic,Static')
    if (!(Test-Path -LiteralPath (Join-Path $legacy '.skip-bundled-projects')) -or
        $seed.Invoke($null, [object[]]@([string](Join-Path $upgradeApp 'seed-projects'), [string]$legacy)) -ne 0 -or
        @(Compare-Object $before @(Read-ProjectTree $projectRoot)).Count -ne 0) { throw 'Upgrade or first launch changed the project tree.' }
    $fresh = Join-Path $run '中文 空格 全新安装'
    Install-To $setup $fresh
    $freshApp = Join-Path $fresh "app-$Version/resources/app"
    & (Join-Path $freshApp 'runtime/dotnet.exe') (Join-Path $freshApp 'host/RootSound.Host.dll') --verify-installation
    if ($LASTEXITCODE -ne 0) { throw 'The fresh installation failed verification.' }
    $freshSeeds = Join-Path $freshApp 'seed-projects'
    $manifest = Get-Content -LiteralPath (Join-Path $freshSeeds 'manifest.json') -Raw | ConvertFrom-Json
    if ($seed.Invoke($null, [object[]]@([string]$freshSeeds, [string]$fresh)) -ne $manifest.projects.Count) { throw 'The fresh installation did not seed its demo library.' }
    $freshBefore = @(Read-ProjectTree (Join-Path $fresh 'project'))
    Install-To $setup $fresh
    if (@(Compare-Object $freshBefore @(Read-ProjectTree (Join-Path $fresh 'project'))).Count -ne 0) { throw 'Repeated installation changed songs.' }
    foreach ($case in @('已有空目录', '已有歌曲无安装记录')) {
        $location = Join-Path $run $case
        $library = Join-Path $location 'project'
        New-Item -ItemType Directory -Path $library | Out-Null
        if ($case -eq '已有歌曲无安装记录') {
            $sameName = Join-Path $library ('演示项目/' + $manifest.projects[0].name)
            New-Item -ItemType Directory -Path (Split-Path -Parent $sameName), (Join-Path $library '用户空目录') -Force | Out-Null
            [IO.File]::WriteAllText($sameName, 'user owns this same-name demo')
            [IO.File]::WriteAllBytes((Join-Path $library '用户.mid'), [byte[]]@(1, 2, 3, 4))
        }
        $expected = @(Read-ProjectTree $library)
        Install-To $setup $location
        $caseSeeds = Join-Path $location "app-$Version/resources/app/seed-projects"
        if ($seed.Invoke($null, [object[]]@([string]$caseSeeds, [string]$location)) -ne 0) { throw "Existing project was seeded: $case" }
        if (@(Compare-Object $expected @(Read-ProjectTree $library)).Count -ne 0) { throw "Project tree changed: $case" }
    }
    $report = [ordered]@{ passed = $true; version = $Version; finalInstallerExecuted = $true; freshInstallation = $true; upgradedFrom = $PreviousVersion;
        projectTreePreserved = $true; existingEmptyProjectPreserved = $true; repeatedInstallationPreserved = $true; existingUnregisteredLibraryPreserved = $true; freshlySeededProjects = $manifest.projects.Count
        sourceRoot = $legacy; preservedUserFiles = $userFiles.Count; shortcutUpdated = $true; oldProgramRemoved = $true;
        chineseAndSpacePath = $true; desktopShortcutWritten = $false; productionRegistrationChanged = $false; visibleWindow = $false }
    $report | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $run 'report.json') -Encoding utf8
    $report | ConvertTo-Json
    Write-Output "Evidence: $run"
} finally { Pop-Location }
