$ErrorActionPreference = 'Stop'
$root = (Get-Item -LiteralPath $PSScriptRoot).Parent.Parent.Parent.Parent.Parent.FullName
$cache = Join-Path $root '.cache\stretch-pilot'
$vsRoot = 'C:\Program Files\Microsoft Visual Studio\2022\Community'
$cmake = Join-Path $vsRoot 'Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe'
$ninja = Join-Path $vsRoot 'Common7\IDE\CommonExtensions\Microsoft\CMake\Ninja\ninja.exe'
$developer = Join-Path $vsRoot 'Common7\Tools\VsDevCmd.bat'
$configure = '"{0}" -S "{1}" -B "{2}" -G Ninja -DCMAKE_MAKE_PROGRAM="{3}" -DCMAKE_BUILD_TYPE=Release' -f $cmake, $PSScriptRoot, (Join-Path $cache 'build'), $ninja
$compile = '"{0}" --build "{1}" --parallel 4' -f $cmake, (Join-Path $cache 'build')
$command = 'call "{0}" -arch=x64 -host_arch=x64 >nul && {1} && {2}' -f $developer, $configure, $compile
& cmd.exe /d /s /c $command
if ($LASTEXITCODE -ne 0) { throw 'Stretch pilot build failed' }
