param(
    [string]$OutputPath = '.cache\launcher-build\RootSound.exe',
    [switch]$TestHarness,
    [string]$ReleaseVersion
)

$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskOutput = if ([IO.Path]::IsPathRooted($OutputPath)) { [IO.Path]::GetFullPath($OutputPath) }
    else { [IO.Path]::GetFullPath((Join-Path $taskRoot $OutputPath)) }
$taskRootPrefix = $taskRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
if (!$taskOutput.StartsWith($taskRootPrefix, [StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetExtension($taskOutput) -ne '.exe') {
    throw 'Launcher output must be an EXE inside this workspace.'
}
$taskCompiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (!(Test-Path -LiteralPath $taskCompiler)) { $taskCompiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe' }
if (!(Test-Path -LiteralPath $taskCompiler)) { throw 'The Windows .NET Framework compiler is unavailable; the previous launcher remains unchanged.' }
$taskSources = @('Launcher.cs', 'Program.cs')
$taskMain = 'RootSound.Launcher.Program'
$taskTarget = 'winexe'
if ($TestHarness) { $taskSources += 'LauncherSelfTests.cs'; $taskMain = 'RootSound.Launcher.LauncherSelfTests'; $taskTarget = 'exe' }
$taskSourcePaths = @($taskSources | ForEach-Object { Join-Path $taskRoot ('desktop\RootSound.Launcher\' + $_) })
foreach ($taskSource in $taskSourcePaths) { if (!(Test-Path -LiteralPath $taskSource)) { throw "Missing launcher source: $taskSource" } }
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $taskOutput) | Out-Null
if ($ReleaseVersion) {
    if ($ReleaseVersion -notmatch '^(\d+)\.(\d+)\.(\d+)(?:-preview\.(\d+))?$') { throw 'Unsupported launcher release version.' }
    $revision = if ($Matches[4]) { $Matches[4] } else { '9999' }
    $fileVersion = "$($Matches[1]).$($Matches[2]).$($Matches[3]).$revision"
    $metadataPath = Join-Path (Split-Path -Parent $taskOutput) 'ReleaseAssemblyInfo.cs'
    [IO.File]::WriteAllText($metadataPath, "using System.Reflection;`n[assembly: AssemblyTitle(""RootSound"")]`n[assembly: AssemblyProduct(""RootSound"")]`n[assembly: AssemblyFileVersion(""$fileVersion"")]`n[assembly: AssemblyInformationalVersion(""$ReleaseVersion"")]`n", [Text.UTF8Encoding]::new($false))
    $taskSourcePaths += $metadataPath
}
$taskArguments = @('/nologo', '/optimize+', '/platform:x64', '/langversion:5', '/codepage:65001', '/reference:System.Windows.Forms.dll',
    "/target:$taskTarget", "/main:$taskMain", "/out:$taskOutput", "/win32icon:$(Join-Path $taskRoot 'desktop/assets/RootSound.ico')") + $taskSourcePaths
& $taskCompiler @taskArguments
if ($LASTEXITCODE -ne 0 -or !(Test-Path -LiteralPath $taskOutput)) { throw 'Could not compile the Windows launcher.' }
