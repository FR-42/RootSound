$ErrorActionPreference = 'Stop'
$caseRoot = $PSScriptRoot
$deliveryRoot = [IO.Path]::GetFullPath((Join-Path $caseRoot 'delivery-final'))
$targetRoot = [IO.Path]::GetFullPath('D:\Sound\temp\tone')
if ($targetRoot -ne 'D:\Sound\temp\tone') { throw 'Unexpected delivery destination.' }
$proof = Get-Content -LiteralPath (Join-Path $deliveryRoot 'delivery-verification.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$before = Get-Content -LiteralPath (Join-Path $caseRoot 'target-existing-before.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$sourceHash = (Get-FileHash -LiteralPath $before.source -Algorithm SHA256).Hash
if ($sourceHash -ne $before.sourceSha256) { throw 'Reference changed before delivery.' }
$jobs = @()
foreach ($item in $proof.files) {
    if ([IO.Path]::GetFileName($item.name) -ne $item.name) { throw 'Invalid delivery filename.' }
    $sourcePath = [IO.Path]::GetFullPath((Join-Path $deliveryRoot $item.name))
    $targetPath = [IO.Path]::GetFullPath((Join-Path $targetRoot $item.name))
    if (![String]::Equals([IO.Path]::GetDirectoryName($sourcePath), $deliveryRoot, [StringComparison]::OrdinalIgnoreCase) -or
        ![String]::Equals([IO.Path]::GetDirectoryName($targetPath), $targetRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'A path escaped the delivery directory.'
    }
    if ((Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash -ne $item.sha256) { throw 'Staged delivery failed verification.' }
    $alreadyPresent = Test-Path -LiteralPath $targetPath
    if ($alreadyPresent -and (Get-FileHash -LiteralPath $targetPath -Algorithm SHA256).Hash -ne $item.sha256) {
        throw ('An existing file must not be overwritten: ' + $targetPath)
    }
    $jobs += [pscustomobject]@{ Source = $sourcePath; Target = $targetPath; Sha256 = $item.sha256; AlreadyPresent = $alreadyPresent }
}
[IO.Directory]::CreateDirectory($targetRoot) | Out-Null
$ownedStages = New-Object 'System.Collections.Generic.List[string]'
try {
    foreach ($job in $jobs) {
        if ($job.AlreadyPresent) { continue }
        $stage = Join-Path $targetRoot ('.rootsound-kick-' + [Guid]::NewGuid().ToString('N') + '.tmp')
        $input = $null; $output = $null
        try {
            $input = [IO.File]::OpenRead($job.Source)
            $output = New-Object IO.FileStream($stage, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
            $ownedStages.Add($stage)
            $input.CopyTo($output); $output.Flush($true)
        } finally {
            if ($output) { $output.Dispose() }
            if ($input) { $input.Dispose() }
        }
        if ((Get-FileHash -LiteralPath $stage -Algorithm SHA256).Hash -ne $job.Sha256) { throw 'Delivery copy failed verification.' }
        [IO.File]::Move($stage, $job.Target)
    }
} finally {
    foreach ($stage in $ownedStages) {
        if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage }
    }
}
$preserved = @()
foreach ($original in $before.files) {
    $path = Join-Path $targetRoot $original.Name
    $matches = (Test-Path -LiteralPath $path) -and (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash -eq $original.Sha256
    $preserved += [ordered]@{ name = $original.Name; unchanged = $matches }
}
$delivered = @($jobs | ForEach-Object {
    $hash = (Get-FileHash -LiteralPath $_.Target -Algorithm SHA256).Hash
    if ($hash -ne $_.Sha256) { throw 'A delivered file changed unexpectedly.' }
    [ordered]@{ path = $_.Target; bytes = (Get-Item -LiteralPath $_.Target).Length; sha256 = $hash }
})
$result = [ordered]@{
    destination = $targetRoot; delivered = $delivered; existingFiles = $preserved
    referenceUnchanged = ((Get-FileHash -LiteralPath $before.source -Algorithm SHA256).Hash -eq $before.sourceSha256)
    applicationRelease = $proof.release; audioInputSupported = $false; listeningAccepted = $false
}
$result | ConvertTo-Json -Depth 7 | Set-Content -LiteralPath (Join-Path $caseRoot 'delivery-copy-verification.json') -Encoding UTF8
$result | ConvertTo-Json -Depth 7
