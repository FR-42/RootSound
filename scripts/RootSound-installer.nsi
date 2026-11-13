Unicode true
!include "FileFunc.nsh"
!include "LogicLib.nsh"

Name "RootSound ${VERSION}"
OutFile "${OUTPUT}"
Icon "${APP_ICON}"
InstallDir ""
RequestExecutionLevel user
AutoCloseWindow true
Page instfiles
SetCompressor /SOLID lzma

Var AppDirectory

Function FindDrive
  ${If} $9 != "C:\"
    StrCpy $INSTDIR "$9Apps\RootSound"
    Push "StopGetDrives"
  ${Else}
    Push ""
  ${EndIf}
FunctionEnd

Function .onInit
  System::Call 'kernel32::CreateMutexW(p 0, i 0, w "Local\RootSound.Setup") p .r1 ?e'
  Pop $0
  ${If} $0 == 183
  ${OrIf} $1 == 0
    MessageBox MB_OK|MB_ICONEXCLAMATION "请先关闭其他 RootSound 安装程序。" /SD IDOK
    SetErrorLevel 2
    Abort
  ${EndIf}
  ${If} $INSTDIR == ""
    ${If} ${FileExists} "D:\*.*"
      StrCpy $INSTDIR "D:\Apps\RootSound"
    ${Else}
      ${GetDrives} "HDD" FindDrive
    ${EndIf}
  ${EndIf}
  StrCmp $INSTDIR "" invalid
  System::Call 'kernel32::GetFullPathNameW(w "$INSTDIR", i ${NSIS_MAX_STRLEN}, w .r0, p 0) i.r1'
  IntCmp $1 0 invalid
  IntCmp $1 ${NSIS_MAX_STRLEN} invalid +2 invalid
  Goto invalid
  StrCpy $INSTDIR $0
  ${GetRoot} "$INSTDIR" $0
  ${If} $0 == ""
  ${OrIf} $0 == "C:"
  ${OrIf} "$0\" == "$INSTDIR"
    Goto invalid
  ${EndIf}
  StrCpy $AppDirectory "$INSTDIR\app-${VERSION}"
  Return

invalid:
  MessageBox MB_OK|MB_ICONSTOP "未找到 C 盘以外的可用安装位置。" /SD IDOK
  SetErrorLevel 2
  Abort
FunctionEnd

Section
  IfFileExists "$AppDirectory\resources\app\rootsound-installed" verify
  ClearErrors
  SetOutPath "$AppDirectory"
  File /r "${APP_SOURCE}\*"
  IfErrors failed

verify:
  IfFileExists "$AppDirectory\RootSound.exe" 0 failed
  IfFileExists "$AppDirectory\resources\app\runtime\dotnet.exe" 0 failed
  IfFileExists "$AppDirectory\resources\app\host\RootSound.Host.dll" 0 failed
  CreateDirectory "$INSTDIR\project"
  IfErrors failed
  IfFileExists "$AppDirectory\resources\app\rootsound-installed" shortcut
  FileOpen $0 "$AppDirectory\resources\app\rootsound-installed" w
  IfErrors failed
  FileClose $0

shortcut:
  SetOutPath "$AppDirectory"
  ClearErrors
  CreateShortCut "$INSTDIR\RootSound.lnk" "$AppDirectory\RootSound.exe" "" "$AppDirectory\RootSound.exe" 0
  IfErrors failed
  ${GetParameters} $0
  ClearErrors
  ${GetOptions} $0 "/NO_DESKTOP_SHORTCUT" $1
  ${If} ${Errors}
    ClearErrors
    CopyFiles /SILENT "$INSTDIR\RootSound.lnk" "$DESKTOP"
    IfErrors failed
  ${EndIf}
  nsExec::ExecToLog '"$AppDirectory\resources\app\runtime\dotnet.exe" "$AppDirectory\resources\app\host\RootSound.Host.dll" --cleanup-installed-versions'
  Pop $0
  StrCmp $0 "0" cleanupDone
  MessageBox MB_OK|MB_ICONEXCLAMATION "新版已安装，部分旧版文件未能删除。关闭 RootSound 后可再次运行安装包清理。" /SD IDOK
  SetErrorLevel 3
  Goto done

cleanupDone:
  SetErrorLevel 0
  Goto done

failed:
  MessageBox MB_OK|MB_ICONSTOP "安装未完成。请检查安装磁盘的可用空间和写入权限。" /SD IDOK
  SetErrorLevel 1
done:
SectionEnd
