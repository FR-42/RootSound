param(
    [Parameter(Mandatory = $true)][string]$LauncherPath,
    [Parameter(Mandatory = $true)][string]$EntryPath
)

$ErrorActionPreference = 'Stop'
$taskLauncherPath = [IO.Path]::GetFullPath($LauncherPath)
$taskEntryPath = [IO.Path]::GetFullPath($EntryPath)
if (![IO.File]::Exists($taskLauncherPath)) { throw 'The compiled desktop launcher is missing.' }

function Get-DesktopEntryHash([string]$Path) {
    $taskHasher = [Security.Cryptography.SHA256]::Create()
    $taskStream = [IO.File]::OpenRead($Path)
    try { return [Convert]::ToBase64String($taskHasher.ComputeHash($taskStream)) }
    finally { $taskStream.Dispose(); $taskHasher.Dispose() }
}

# Leave an identical entry alone, including when another process still uses it.
if ([IO.File]::Exists($taskEntryPath)) {
    $taskLauncherInfo = [IO.FileInfo]$taskLauncherPath
    $taskEntryInfo = [IO.FileInfo]$taskEntryPath
    if ($taskLauncherInfo.Length -eq $taskEntryInfo.Length -and
        (Get-DesktopEntryHash $taskLauncherPath) -eq
        (Get-DesktopEntryHash $taskEntryPath)) { return }
}

$taskPublishId = [Guid]::NewGuid().ToString('N')
$taskEntryCandidate = $taskEntryPath + '.' + $taskPublishId + '.tmp'
$taskEntryBackup = $taskEntryPath + '.' + $taskPublishId + '.bak'
try {
    [IO.File]::Copy($taskLauncherPath, $taskEntryCandidate, $false)
    if ([IO.File]::Exists($taskEntryPath)) {
        # Windows PowerShell converts a $null string argument to "" here. Use
        # an explicit sibling backup so File.Replace works on repeated builds.
        [IO.File]::Replace($taskEntryCandidate, $taskEntryPath, $taskEntryBackup)
    } else {
        [IO.File]::Move($taskEntryCandidate, $taskEntryPath)
    }
} finally {
    if ([IO.File]::Exists($taskEntryCandidate)) { [IO.File]::Delete($taskEntryCandidate) }
    if ([IO.File]::Exists($taskEntryBackup)) { [IO.File]::Delete($taskEntryBackup) }
}
