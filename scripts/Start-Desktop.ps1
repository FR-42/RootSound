param([string]$DataDirectory, [switch]$PassThru)

$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
function Get-DesktopExecutable {
    $taskPointer = Join-Path $taskRoot '.cache\desktop-build.current'
    if (!(Test-Path -LiteralPath $taskPointer)) { return $null }
    $taskRelative = [IO.File]::ReadAllText($taskPointer).Trim()
    $taskBuildRoot = [IO.Path]::GetFullPath((Join-Path $taskRoot '.cache\desktop-builds')) + [IO.Path]::DirectorySeparatorChar
    $taskSelected = [IO.Path]::GetFullPath((Join-Path $taskRoot $taskRelative))
    if (!$taskSelected.StartsWith($taskBuildRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'The desktop build pointer is invalid.' }
    return (Join-Path $taskSelected 'RootSound.exe')
}
$taskExecutable = Get-DesktopExecutable
$taskStamp = Join-Path $taskRoot '.cache\desktop-build.stamp'
$taskNeedsBuild = !$taskExecutable -or !(Test-Path -LiteralPath $taskExecutable) -or !(Test-Path -LiteralPath $taskStamp) -or !(Test-Path -LiteralPath (Join-Path $taskRoot 'RootSound.exe'))
if (!$taskNeedsBuild) {
    $taskBuiltAt = (Get-Item -LiteralPath $taskStamp).LastWriteTimeUtc
    $taskInputs = @('src', 'scripts', 'desktop', 'index.html', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts')
    foreach ($taskInput in $taskInputs) {
        $taskFiles = Get-ChildItem -LiteralPath (Join-Path $taskRoot $taskInput) -File -Recurse | Where-Object { $_.FullName -notmatch '[\\/](bin|obj)[\\/]' }
        if ($taskFiles | Where-Object { $_.LastWriteTimeUtc -gt $taskBuiltAt }) { $taskNeedsBuild = $true; break }
    }
}
if ($taskNeedsBuild) { & (Join-Path $PSScriptRoot 'Build-Desktop.ps1') | Out-Host; $taskExecutable = Get-DesktopExecutable }
if (!(Test-Path -LiteralPath (Join-Path (Split-Path -Parent $taskExecutable) 'ui\index.html'))) {
    throw 'The desktop interface is missing. Run npm run desktop:build.'
}
# This is the interactive application requested by the user, so show its window.
$taskLaunch = @{ FilePath = $taskExecutable; WorkingDirectory = $taskRoot; WindowStyle = 'Normal' }
if ($DataDirectory) {
    $taskDataPath = [IO.Path]::GetFullPath($DataDirectory)
    if ($taskDataPath.Contains('"')) { throw 'The data directory contains an invalid quote.' }
    $taskLaunch.ArgumentList = @('--data-dir', ('"' + $taskDataPath + '"'))
}
$taskProcess = Start-Process @taskLaunch -PassThru
if ($PassThru) { $taskProcess }
