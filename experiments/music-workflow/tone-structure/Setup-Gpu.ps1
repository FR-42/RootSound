param([string]$Python = 'python')
$ErrorActionPreference = 'Stop'
$taskModuleRoot = $PSScriptRoot
$taskWorkspaceRoot = (Resolve-Path -LiteralPath (Join-Path $taskModuleRoot '..\..\..')).Path
$taskGpuRoot = Join-Path $taskWorkspaceRoot '.cache\tone-structure-gpu'
$taskPreviousTemp = $env:TEMP
$taskPreviousTmp = $env:TMP
$taskPreviousEncoding = $env:PYTHONIOENCODING
$taskPreviousBytecode = $env:PYTHONDONTWRITEBYTECODE
New-Item -ItemType Directory -Force -Path $taskGpuRoot,(Join-Path $taskGpuRoot 'tmp') > $null
try {
    $env:TEMP = Join-Path $taskGpuRoot 'tmp'
    $env:TMP = $env:TEMP
    $env:PYTHONIOENCODING = 'utf-8'
    $env:PYTHONDONTWRITEBYTECODE = '1'
    & $Python -c "import sys,struct; assert sys.platform=='win32' and sys.version_info[:2]==(3,13) and struct.calcsize('P')==8, 'This locked runtime requires 64-bit Windows Python 3.13'"
    if ($LASTEXITCODE -ne 0) { throw 'This runtime requires 64-bit Windows Python 3.13.' }
    & $Python -u (Join-Path $taskModuleRoot 'download_gpu_runtime.py')
    if ($LASTEXITCODE -ne 0) { throw 'Official GPU wheel download or verification failed.' }
    & $Python -u (Join-Path $taskModuleRoot 'download_gpu_dependencies.py')
    if ($LASTEXITCODE -ne 0) { throw 'Official Intel dependency download or verification failed.' }
    $taskWheels = @(Get-ChildItem -LiteralPath (Join-Path $taskGpuRoot 'wheels') -Filter '*.whl' | Select-Object -ExpandProperty FullName)
    & $Python -m pip install --no-index --no-deps --upgrade --target (Join-Path $taskGpuRoot 'packages') @taskWheels
    if ($LASTEXITCODE -ne 0) { throw 'GPU runtime installation failed; the existing CPU runtime is separate.' }
    $taskRequest = Join-Path $taskGpuRoot ('probe-' + [Guid]::NewGuid().ToString('N') + '.json')
    try {
        @{probe=$true;packages=(Join-Path $taskGpuRoot 'packages');support=(Join-Path $taskWorkspaceRoot '.cache\reference-python')} | ConvertTo-Json | Set-Content -LiteralPath $taskRequest -Encoding utf8
        $taskProbe = & $Python -u (Join-Path $taskModuleRoot 'demucs_worker.py') $taskRequest
        if ($LASTEXITCODE -ne 0) { throw 'GPU runtime installed but hardware verification failed.' }
        $taskProbe | Set-Content -LiteralPath (Join-Path $taskGpuRoot 'verified-device.json') -Encoding utf8
        Write-Output $taskProbe
    } finally { if (Test-Path -LiteralPath $taskRequest) { Remove-Item -LiteralPath $taskRequest } }
} finally {
    $env:TEMP=$taskPreviousTemp
    $env:TMP=$taskPreviousTmp
    $env:PYTHONIOENCODING=$taskPreviousEncoding
    $env:PYTHONDONTWRITEBYTECODE=$taskPreviousBytecode
}
