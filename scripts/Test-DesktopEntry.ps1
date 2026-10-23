$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskRunName = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6)
$taskRunDirectory = Join-Path $taskRoot ('.test-output\desktop-entry\' + $taskRunName)
New-Item -ItemType Directory -Force -Path $taskRunDirectory | Out-Null
$taskPublisher = Join-Path $PSScriptRoot 'Publish-DesktopEntry.ps1'
$taskChecks = New-Object 'Collections.Generic.List[string]'

function Assert-EntryCheck([bool]$Condition, [string]$Name) {
    if (!$Condition) { throw "Desktop entry check failed: $Name" }
    $taskChecks.Add($Name)
}

function Assert-NoPublishFiles([string]$Directory, [string]$Name) {
    $taskLeftovers = @(Get-ChildItem -LiteralPath $Directory -File | Where-Object { $_.Extension -in @('.tmp', '.bak') })
    Assert-EntryCheck ($taskLeftovers.Count -eq 0) $Name
}

function Read-FixtureBytes([string]$Path) { return [Convert]::ToBase64String([IO.File]::ReadAllBytes($Path)) }

$taskFixture = Join-Path $taskRunDirectory 'entry with spaces'
New-Item -ItemType Directory -Path $taskFixture | Out-Null
$taskSource = Join-Path $taskFixture 'compiled-launcher.exe'
$taskEntry = Join-Path $taskFixture 'RootSound.exe'
[IO.File]::WriteAllBytes($taskSource, [byte[]](1, 2, 3, 4))

# Exercise the same production publisher as Build-Desktop, using real Windows
# Copy/Move/Replace operations. No fixture executable is ever launched.
& $taskPublisher -LauncherPath $taskSource -EntryPath $taskEntry
Assert-EntryCheck ((Read-FixtureBytes $taskSource) -eq (Read-FixtureBytes $taskEntry)) 'first publish copies the compiled entry'
Assert-NoPublishFiles $taskFixture 'first publish cleans candidates'

$taskOriginalStamp = [DateTime]::UtcNow.AddDays(-1)
[IO.File]::SetLastWriteTimeUtc($taskEntry, $taskOriginalStamp)
$taskLockedEntry = [IO.File]::Open($taskEntry, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
try {
    & $taskPublisher -LauncherPath $taskSource -EntryPath $taskEntry
    Assert-EntryCheck ([IO.File]::GetLastWriteTimeUtc($taskEntry) -eq $taskOriginalStamp) 'identical repeat preserves the existing file even while locked'
} finally { $taskLockedEntry.Dispose() }
Assert-NoPublishFiles $taskFixture 'identical repeat creates no publish files'

[IO.File]::WriteAllBytes($taskSource, [byte[]](5, 6, 7, 8))
& $taskPublisher -LauncherPath $taskSource -EntryPath $taskEntry
Assert-EntryCheck ((Read-FixtureBytes $taskSource) -eq (Read-FixtureBytes $taskEntry)) 'changed build atomically replaces an existing entry'
Assert-NoPublishFiles $taskFixture 'changed build cleans candidate and backup'

$taskPreviousBytes = Read-FixtureBytes $taskEntry
[IO.File]::WriteAllBytes($taskSource, [byte[]](9, 10, 11, 12))
$taskLockedEntry = [IO.File]::Open($taskEntry, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
$taskPublishFailed = $false
try {
    try { & $taskPublisher -LauncherPath $taskSource -EntryPath $taskEntry }
    catch { $taskPublishFailed = $true }
} finally { $taskLockedEntry.Dispose() }
Assert-EntryCheck $taskPublishFailed 'Windows replacement failure is reported'
Assert-EntryCheck ((Read-FixtureBytes $taskEntry) -eq $taskPreviousBytes) 'failed replacement preserves the previous entry bytes'
Assert-NoPublishFiles $taskFixture 'failed replacement cleans candidates and backups'

& $taskPublisher -LauncherPath $taskSource -EntryPath $taskEntry
Assert-EntryCheck ((Read-FixtureBytes $taskSource) -eq (Read-FixtureBytes $taskEntry)) 'retry after replacement failure succeeds'
Assert-NoPublishFiles $taskFixture 'successful retry cleans candidates and backups'

$taskPreviousBytes = Read-FixtureBytes $taskEntry
$taskPublishFailed = $false
try { & $taskPublisher -LauncherPath (Join-Path $taskFixture 'missing.exe') -EntryPath $taskEntry }
catch { $taskPublishFailed = $true }
Assert-EntryCheck $taskPublishFailed 'missing compiled launcher is rejected'
Assert-EntryCheck ((Read-FixtureBytes $taskEntry) -eq $taskPreviousBytes) 'missing launcher preserves the previous entry'
Assert-NoPublishFiles $taskFixture 'missing launcher creates no publish files'

# A nested Windows PowerShell can inherit a PSModulePath that lacks its optional
# utility module. Run the production publisher with that module truly absent.
$taskRestrictedFixture = Join-Path $taskRunDirectory 'without utility modules'
New-Item -ItemType Directory -Path $taskRestrictedFixture | Out-Null
$taskRestrictedScript = Join-Path $taskRunDirectory 'restricted-modules.ps1'
$taskRestrictedSource = @'
param([string]$Publisher, [string]$Fixture)
$ErrorActionPreference = 'Stop'
$PSModuleAutoLoadingPreference = 'None'
$env:PSModulePath = ''
Remove-Module Microsoft.PowerShell.Utility -Force -ErrorAction SilentlyContinue
if (Get-Command Get-FileHash -ErrorAction SilentlyContinue) { throw 'The restricted fixture still exposes Get-FileHash.' }
$taskSource = [IO.Path]::Combine($Fixture, 'compiled.exe')
$taskEntry = [IO.Path]::Combine($Fixture, 'RootSound.exe')
[IO.File]::WriteAllBytes($taskSource, [byte[]](1, 2, 3, 4))
& $Publisher -LauncherPath $taskSource -EntryPath $taskEntry
& $Publisher -LauncherPath $taskSource -EntryPath $taskEntry
[IO.File]::WriteAllBytes($taskSource, [byte[]](5, 6, 7, 8))
& $Publisher -LauncherPath $taskSource -EntryPath $taskEntry
if ([Convert]::ToBase64String([IO.File]::ReadAllBytes($taskEntry)) -ne 'BQYHCA==') { throw 'Restricted publishing did not update the entry.' }
foreach ($taskFile in [IO.Directory]::GetFiles($Fixture)) {
    if ([IO.Path]::GetExtension($taskFile) -in @('.tmp', '.bak')) { throw 'Restricted publishing leaked a temporary file.' }
}
[IO.File]::WriteAllText([IO.Path]::Combine($Fixture, 'passed.txt'), $PSVersionTable.PSVersion.ToString())
'@
[IO.File]::WriteAllText($taskRestrictedScript, $taskRestrictedSource, (New-Object Text.UTF8Encoding($false)))
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $taskRestrictedScript -Publisher $taskPublisher -Fixture $taskRestrictedFixture
Assert-EntryCheck ($LASTEXITCODE -eq 0 -and [IO.File]::Exists((Join-Path $taskRestrictedFixture 'passed.txt'))) 'first, repeat and updated publish succeed without Get-FileHash or module autoloading'

$taskReport = [ordered]@{
    powershell = $PSVersionTable.PSVersion.ToString()
    checks = $taskChecks.Count
    passed = @($taskChecks.ToArray())
    realUIStarted = $false
    fixtureDirectory = $taskFixture
}
[IO.File]::WriteAllText((Join-Path $taskRunDirectory 'entry-report.json'), ($taskReport | ConvertTo-Json -Depth 4), (New-Object Text.UTF8Encoding($false)))
Write-Output "$($taskChecks.Count) desktop entry checks passed. Reports: $taskRunDirectory"
