param(
    [string]$Compiler = '.cache/installer-tools/nsis-3.0.4.1/makensis.exe',
    [string]$PackagePlan = '.cache/release-package-plan.json'
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Push-Location -LiteralPath $repo
try {
    $compilerPath = (Resolve-Path -LiteralPath $Compiler).Path
    $plan = Get-Content -LiteralPath $PackagePlan -Raw | ConvertFrom-Json
    $runtime = Join-Path $plan.windows 'resources/app/runtime'
    if (!(Test-Path -LiteralPath $runtime)) { $runtime = Join-Path $repo '.cache/release-legacy-reference/preview10/app-0.1.0-preview.10/resources/app/runtime' }
    $hostFiles = (Resolve-Path -LiteralPath '.cache/release-host').Path
    $run = Join-Path $repo ('.test-output/installer-upgrade-' + [Guid]::NewGuid().ToString('N'))
    $install = Join-Path $run '中文 自定义安装 RootSound'
    New-Item -ItemType Directory -Path (Join-Path $run 'temp') -Force | Out-Null
    $env:TEMP = Join-Path $run 'temp'
    $env:TMP = $env:TEMP
    $registryKey = 'Software\RootSound\InstallerFixture-' + [Guid]::NewGuid().ToString('N')
    $payload = Join-Path $run 'payload'
    $payloadApp = Join-Path $payload 'resources/app'
    $currentVersion = '0.1.0-preview.10'
    $current = Join-Path $install "app-$currentVersion"
    New-Item -ItemType Directory -Path $install, $payloadApp | Out-Null
    Copy-Item -LiteralPath $runtime -Destination (Join-Path $payloadApp 'runtime') -Recurse
    Copy-Item -LiteralPath $hostFiles -Destination (Join-Path $payloadApp 'host') -Recurse
    Set-Content -LiteralPath (Join-Path $payload 'RootSound.exe') -Value 'fixture executable'
    & python scripts/install-file-list.py $payload (Join-Path $payloadApp 'install-files.json')

    function New-VersionDirectory($Location, [switch]$Installed) {
        $versionApp = Join-Path $Location 'resources/app'
        New-Item -ItemType Directory -Path $versionApp | Out-Null
        Set-Content -LiteralPath (Join-Path $Location 'RootSound.exe') -Value 'fixture executable'
        New-Item -ItemType Directory -Path (Join-Path $versionApp 'runtime') | Out-Null
        Set-Content -LiteralPath (Join-Path $versionApp 'runtime/dotnet.exe') -Value 'fixture runtime'
        if ($Installed) {
            New-Item -ItemType File -Path (Join-Path $versionApp 'rootsound-installed') | Out-Null
            & python scripts/install-file-list.py $Location (Join-Path $versionApp 'install-files.json')
        }
    }

    function New-Installer($Source, $Output) {
        & $compilerPath /V2 /INPUTCHARSET UTF8 "/DINSTALL_REGISTRY_KEY=$registryKey" "/DVERSION=$currentVersion" "/DOUTPUT=$Output" "/DAPP_SOURCE=$Source" "/DAPP_ICON=$repo\desktop\assets\RootSound.ico" "$repo\scripts\RootSound-installer.nsi"
        if ($LASTEXITCODE -ne 0) { throw "Installer compilation failed: $LASTEXITCODE" }
    }

    function Invoke-Installer($Setup, $Location, $ExpectedExit) {
        $process = Start-Process -FilePath $Setup -ArgumentList @('/S', '/NO_DESKTOP_SHORTCUT', "/D=$Location") -WindowStyle Hidden -Wait -PassThru
        if ($process.ExitCode -ne $ExpectedExit) { throw "Expected installer exit $ExpectedExit, got $($process.ExitCode)" }
    }

    $old = Join-Path $install 'app-0.1.0-preview.9'
    $locked = Join-Path $install 'app-0.1.0-preview.8'
    $portable = Join-Path $install 'app-0.1.0-preview.7'
    $withProjects = Join-Path $install 'app-0.1.0-preview.6'
    $newer = Join-Path $install 'app-0.1.0-preview.11'
    $stable = Join-Path $install 'app-0.1.0'
    $outside = Join-Path $run 'outside'
    $linked = Join-Path $install 'app-0.1.0-preview.5'
    foreach ($location in @($old, $locked, $withProjects, $newer, $stable, $outside)) {
        New-VersionDirectory $location -Installed
    }
    New-VersionDirectory $portable
    New-Item -ItemType Directory -Path (Join-Path $withProjects 'project'), (Join-Path $install 'project') | Out-Null
    $song = Join-Path $install 'project/song.rootsound'
    Set-Content -LiteralPath $song -Value 'fixture music'
    New-Item -ItemType Junction -Path $linked -Target $outside | Out-Null
    New-Item -ItemType Junction -Path (Join-Path $withProjects 'resources/linked') -Target $outside | Out-Null
    $legacyUserSong = Join-Path $withProjects '我的作品.rootsound'
    Set-Content -LiteralPath $legacyUserSong -Value 'user music outside project'
    New-Item -ItemType Directory -Path (Join-Path $withProjects '自己建的空目录') | Out-Null
    $nestedSong = Join-Path $withProjects 'resources/app/我的作品.mid'
    Set-Content -LiteralPath $nestedSong -Value 'nested midi'

    $setup = Join-Path $run 'RootSound-UpgradeFixture.exe'
    New-Installer $payload $setup
    $heldFile = [IO.File]::Open((Join-Path $locked 'RootSound.exe'), 'Open', 'ReadWrite', 'None')
    $heldRuntime = [IO.File]::Open((Join-Path $withProjects 'resources/app/runtime/dotnet.exe'), 'Open', 'ReadWrite', 'None')
    try {
        Invoke-Installer $setup $install 3
        if (Test-Path -LiteralPath $old) { throw 'An unused older version survived the upgrade.' }
        if (!(Test-Path -LiteralPath (Join-Path $locked 'resources/app/rootsound-installed'))) { throw 'A locked version lost its marker.' }
        if (!(Test-Path -LiteralPath (Join-Path $withProjects 'RootSound.exe'))) { throw 'A running native version was partly deleted.' }
        $shortcut = (New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $install 'RootSound.lnk'))
        if ($shortcut.TargetPath -ne (Join-Path $current 'RootSound.exe')) { throw 'The shortcut does not target the installed version.' }
    } finally { $heldFile.Dispose(); $heldRuntime.Dispose() }

    Invoke-Installer $setup $install 0
    if (Test-Path -LiteralPath $locked) { throw 'Retry did not delete the previously locked version.' }
    foreach ($location in @($current, $portable, $newer, $stable, $linked, $outside)) {
        if (!(Test-Path -LiteralPath (Join-Path $location 'RootSound.exe'))) { throw "A protected directory was modified: $location" }
    }
    if ((Get-Content -LiteralPath $song) -ne 'fixture music') { throw 'The existing project was modified.' }
    if (!(Test-Path -LiteralPath (Join-Path $install '.skip-bundled-projects'))) { throw 'The upgraded installation did not disable demo import.' }
    if ((Get-Content -LiteralPath $legacyUserSong) -ne 'user music outside project') { throw 'A user song in the old program folder was lost.' }
    if ((Get-Content -LiteralPath $nestedSong) -ne 'nested midi') { throw 'A nested user song was lost.' }
    if (!(Test-Path -LiteralPath (Join-Path $withProjects '自己建的空目录'))) { throw 'A user-created empty folder was removed.' }
    if (Test-Path -LiteralPath (Join-Path $withProjects 'RootSound.exe')) { throw 'An old program survived beside user songs.' }
    $registered = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($registryKey)
    try { if ($registered.GetValue('Location') -ne $install) { throw 'Custom upgrade path was not remembered.' } }
    finally { $registered.Dispose() }

    $incomplete = Join-Path $run 'incomplete payload'
    $failedInstall = Join-Path $run 'failed install'
    $failedOld = Join-Path $failedInstall 'app-0.1.0-preview.9'
    New-VersionDirectory $incomplete
    New-VersionDirectory $failedOld -Installed
    $badSetup = Join-Path $run 'IncompleteSetup.exe'
    New-Installer $incomplete $badSetup
    Invoke-Installer $badSetup $failedInstall 1
    if (!(Test-Path -LiteralPath (Join-Path $failedOld 'RootSound.exe'))) { throw 'A failed upgrade removed the old version.' }
    if (Test-Path -LiteralPath (Join-Path $failedInstall "app-$currentVersion/resources/app/rootsound-installed")) { throw 'An incomplete installation received the installed marker.' }
    Write-Output "Installer upgrade checks passed. Fixtures: $run"
} finally {
    if ($registryKey) { [Microsoft.Win32.Registry]::CurrentUser.DeleteSubKeyTree($registryKey, $false) }
    Pop-Location
}
