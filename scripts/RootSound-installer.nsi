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
  IfFileExists "$AppDirectory\resources\app\rootsound-installed" shortcut
  ClearErrors
  SetOutPath "$AppDirectory"
  File /r "${APP_SOURCE}\*"
  IfErrors failed
  CreateDirectory "$INSTDIR\project"
  IfErrors failed
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
  SetErrorLevel 0
  Goto done

failed:
  MessageBox MB_OK|MB_ICONSTOP "安装未完成。请检查安装磁盘的可用空间和写入权限。" /SD IDOK
  SetErrorLevel 1
done:
SectionEnd
