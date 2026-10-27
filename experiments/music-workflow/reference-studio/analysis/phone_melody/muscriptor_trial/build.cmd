@echo off
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" >nul
if errorlevel 1 exit /b 1
set "MSLCMAKE=C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe"
set "PATH=C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\CommonExtensions\Microsoft\CMake\Ninja;%PATH%"
"%MSLCMAKE%" -S "D:/RootSound/experiments/music-workflow/reference-studio/analysis/phone_melody/muscriptor_trial" -B "D:/RootSound/.cache/muscriptor-experiment/build" -G Ninja -DCMAKE_BUILD_TYPE=Release -DMUSCRIPTOR_SOURCE="D:/RootSound/.cache/muscriptor-experiment/source/muscriptor.cpp-c8adc019677ed3479fa3c22c1a117d662382f347/cpp" -DFETCHCONTENT_SOURCE_DIR_GGML="D:/RootSound/.cache/muscriptor-experiment/ggml/ggml-e91ded11bdcd78c42f9c8d3978ff6686eb4c1226"
if errorlevel 1 exit /b 1
"%MSLCMAKE%" --build "D:/RootSound/.cache/muscriptor-experiment/build" --target muscriptor_short --parallel 4
exit /b %errorlevel%
