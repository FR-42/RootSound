$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskRunName = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6)
$taskRunDirectory = Join-Path $taskRoot ('.test-output\launcher\' + $taskRunName)
New-Item -ItemType Directory -Force -Path $taskRunDirectory | Out-Null
$taskHarness = Join-Path $taskRunDirectory 'Launcher.Tests.exe'
& (Join-Path $PSScriptRoot 'Build-Launcher.ps1') -OutputPath $taskHarness -TestHarness
$taskProcess = Start-Process -FilePath $taskHarness -ArgumentList ('"' + $taskRunDirectory + '"') -WindowStyle Hidden -Wait -PassThru `
    -RedirectStandardOutput (Join-Path $taskRunDirectory 'stdout.log') -RedirectStandardError (Join-Path $taskRunDirectory 'stderr.log')
Get-Content -LiteralPath (Join-Path $taskRunDirectory 'stdout.log')
if ($taskProcess.ExitCode -ne 0) {
    Get-Content -LiteralPath (Join-Path $taskRunDirectory 'stderr.log')
    throw "Launcher checks failed. Reports: $taskRunDirectory"
}
Write-Output "Launcher reports: $taskRunDirectory"
