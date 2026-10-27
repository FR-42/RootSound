param([switch]$Run, [switch]$Test)
$ErrorActionPreference = 'Stop'
$experimentRoot = $PSScriptRoot
$workspaceRoot = (Resolve-Path -LiteralPath (Join-Path $experimentRoot '..\..')).Path
$moduleRoot = Join-Path $experimentRoot 'reference-studio'
$projectPath = Join-Path $moduleRoot 'RootSound.ReferenceStudio.csproj'
$configPath = Join-Path $moduleRoot 'NuGet.Config'
$referenceTemp = Join-Path $workspaceRoot '.test-output\reference-studio\temp'
New-Item -ItemType Directory -Path $referenceTemp -Force | Out-Null
$env:TEMP = $referenceTemp
$env:TMP = $referenceTemp
$env:DOTNET_CLI_HOME = Join-Path $workspaceRoot '.cache\dotnet-home'
$env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
$env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'
$env:DOTNET_GENERATE_ASPNET_CERTIFICATE = 'false'
Push-Location -LiteralPath $workspaceRoot
try {
    if ($Test) {
        $testProject = Join-Path $moduleRoot 'tests\RootSound.ReferenceStudio.Tests.csproj'
        & dotnet restore $testProject --configfile $configPath --locked-mode
        if ($LASTEXITCODE -ne 0) { throw 'Could not restore the reference studio checks.' }
        $testOutput = Join-Path $workspaceRoot ('.test-output\reference-studio\' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6))
        & dotnet run --project $testProject -c Release --no-restore -- $testOutput (Join-Path $moduleRoot 'cases\Vulcanus')
        if ($LASTEXITCODE -ne 0) { throw 'Reference studio checks failed.' }
    }
    & dotnet restore $projectPath --configfile $configPath --locked-mode
    if ($LASTEXITCODE -ne 0) { throw 'Could not restore the reference studio Windows references.' }
    $testProject = Join-Path $moduleRoot 'tests\RootSound.ReferenceStudio.Tests.csproj'
    if (!$Test) {
        & dotnet restore $testProject --configfile $configPath --locked-mode
        if ($LASTEXITCODE -ne 0) { throw 'Could not restore the case packer.' }
    }
    $casePath = Join-Path $moduleRoot 'cases\Vulcanus.rscase'
    & dotnet run --project $testProject -c Release --no-restore -- --pack (Join-Path $moduleRoot 'cases\Vulcanus') $casePath
    if ($LASTEXITCODE -ne 0) { throw 'Could not package the editable reference case.' }
    $observationPath = Join-Path $moduleRoot 'cases\Vulcanus-声音观察.rscase'
    & dotnet run --project $testProject -c Release --no-restore -- --pack (Join-Path $moduleRoot 'cases\Vulcanus\sound-observation') $observationPath
    if ($LASTEXITCODE -ne 0) { throw 'Could not package the source-observation case.' }
    $releaseName = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6)
    $releasePath = Join-Path $moduleRoot ('.builds\' + $releaseName)
    & dotnet build $projectPath -c Release --no-restore --output $releasePath
    if ($LASTEXITCODE -ne 0) { throw 'Could not build reference studio. Previous build remains selected.' }
    foreach ($fileName in @('RootSound.ReferenceStudio.exe', 'RootSound.ReferenceStudio.dll', 'RootSound.ReferenceStudio.runtimeconfig.json', 'RootSound.ReferenceStudio.deps.json')) {
        if (!(Test-Path -LiteralPath (Join-Path $releasePath $fileName))) { throw "Build incomplete: $fileName" }
    }
    New-Item -ItemType Directory -Path (Join-Path $releasePath 'Cases') -Force | Out-Null
    Copy-Item -LiteralPath $casePath -Destination (Join-Path $releasePath 'Cases\Vulcanus.rscase')
    Copy-Item -LiteralPath $observationPath -Destination (Join-Path $releasePath 'Cases\Vulcanus-声音观察.rscase')
    $compilerPath = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
    $builtLauncher = Join-Path $releasePath 'ReferenceStudio.Launcher.exe'
    & $compilerPath /nologo /optimize+ /platform:x64 /langversion:5 /codepage:65001 /reference:System.Windows.Forms.dll /target:winexe "/out:$builtLauncher" (Join-Path $moduleRoot 'Launcher\Program.cs')
    if ($LASTEXITCODE -ne 0) { throw 'Could not build the reference studio entry.' }
    $entryPath = Join-Path $experimentRoot '拆解与改写.exe'
    $candidatePath = Join-Path $experimentRoot ('拆解与改写.' + [Guid]::NewGuid().ToString('N') + '.tmp')
    [IO.File]::Copy($builtLauncher, $candidatePath)
    if (Test-Path -LiteralPath $entryPath) { [IO.File]::Replace($candidatePath, $entryPath, (Join-Path $releasePath 'Previous.Launcher.exe')) }
    else { [IO.File]::Move($candidatePath, $entryPath) }
    $pointerPath = Join-Path $moduleRoot '.current'
    $pointerCandidate = $pointerPath + '.' + [Guid]::NewGuid().ToString('N') + '.tmp'
    [IO.File]::WriteAllText($pointerCandidate, $releaseName, (New-Object Text.UTF8Encoding($false)))
    if (Test-Path -LiteralPath $pointerPath) { [IO.File]::Replace($pointerCandidate, $pointerPath, (Join-Path $releasePath 'Previous.Current')) }
    else { [IO.File]::Move($pointerCandidate, $pointerPath) }
    Write-Output "Reference studio ready: $entryPath"
    if ($Run) { Start-Process -FilePath $entryPath -WorkingDirectory $experimentRoot -WindowStyle Hidden }
} finally { Pop-Location }
