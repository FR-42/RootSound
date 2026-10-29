$ErrorActionPreference='Stop'
$taskRoot=$PSScriptRoot
$taskCompiler=Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$taskEntry=Join-Path (Split-Path -Parent $taskRoot) 'RipX音色分离.exe'
$taskCandidate=Join-Path $taskRoot ('launcher-'+[guid]::NewGuid().ToString('N')+'.exe')
& $taskCompiler /nologo /optimize+ /platform:x64 /codepage:65001 /reference:System.Windows.Forms.dll /target:winexe "/out:$taskCandidate" (Join-Path $taskRoot 'Launcher.cs')
if($LASTEXITCODE -ne 0){throw '启动器编译失败，现有入口未修改。'}
if(Test-Path -LiteralPath $taskEntry){
    $taskBackup=Join-Path $taskRoot ('launcher-backup-'+[DateTime]::UtcNow.ToString('yyyyMMddHHmmssfff')+'.exe')
    [IO.File]::Replace($taskCandidate,$taskEntry,$taskBackup)
}else{[IO.File]::Move($taskCandidate,$taskEntry)}
Write-Output "已生成 $taskEntry"
