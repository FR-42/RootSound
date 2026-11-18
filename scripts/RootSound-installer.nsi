Unicode true
!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "nsDialogs.nsh"

!ifndef INSTALL_REGISTRY_KEY
!define INSTALL_REGISTRY_KEY "Software\RootSound\Installer"
!endif
!ifndef APP_ART
!define APP_ART "${__FILEDIR__}\..\.cache\installer-art\background.bmp"
!endif
!ifndef VERSION_NUMBER
!define VERSION_NUMBER "0.1.0.11"
!endif
Name "简乐 ${VERSION}"
Caption "简乐安装"
OutFile "${OUTPUT}"
Icon "${APP_ICON}"
InstallDir ""
RequestExecutionLevel user
ShowInstDetails nevershow
SetCompressor /SOLID lzma
SetDatablockOptimize on
XPStyle on
BrandingText "简乐"
VIProductVersion "${VERSION_NUMBER}"
VIAddVersionKey /LANG=2052 "ProductName" "简乐"
VIAddVersionKey /LANG=2052 "FileDescription" "简乐安装程序"
VIAddVersionKey /LANG=2052 "ProductVersion" "${VERSION}"
VIAddVersionKey /LANG=2052 "FileVersion" "${VERSION}"
VIAddVersionKey /LANG=2052 "LegalCopyright" "RootSound"
Page custom LocationPage LocationLeave
Page instfiles
Page custom FinishPage FinishLeave
LoadLanguageFile "${NSISDIR}\Contrib\Language files\SimpChinese.nlf"

Var AppDirectory
Var StageDirectory
Var PathInput
Var Dialog
Var Bitmap
Var BitmapHandle
Var TitleFont
Var BodyFont
Var Launch

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
    MessageBox MB_OK|MB_ICONEXCLAMATION "请先关闭其他简乐安装程序。" /SD IDOK
    SetErrorLevel 2
    Abort
  ${EndIf}
  ${If} $INSTDIR == ""
    ReadRegStr $0 HKCU "${INSTALL_REGISTRY_KEY}" "Location"
    ${If} ${FileExists} "$0\RootSound.lnk"
      StrCpy $INSTDIR $0
    ${EndIf}
  ${EndIf}
  ${If} $INSTDIR == ""
    ${If} ${FileExists} "D:\*.*"
      StrCpy $INSTDIR "D:\Apps\RootSound"
    ${Else}
      ${GetDrives} "HDD" FindDrive
    ${EndIf}
  ${EndIf}
  CreateFont $TitleFont "Microsoft YaHei UI" 24 500
  CreateFont $BodyFont "Microsoft YaHei UI" 10 400
  InitPluginsDir
  File /oname=$PLUGINSDIR\background.bmp "${APP_ART}"
  SetCtlColors $HWNDPARENT 422B34 FFFBF6
FunctionEnd

Function MakePage
  nsDialogs::Create 1018
  Pop $Dialog
  SetCtlColors $Dialog 422B34 FFFBF6
  ${NSD_CreateBitmap} 0 0 100% 100% ""
  Pop $Bitmap
  ${NSD_SetStretchedImage} $Bitmap "$PLUGINSDIR\background.bmp" $BitmapHandle
  ${NSD_CreateLabel} 20u 18u 240u 40u "简乐"
  Pop $0
  SetCtlColors $0 422B34 transparent
  SendMessage $0 ${WM_SETFONT} $TitleFont 1
  ${NSD_CreateLabel} 22u 62u 250u 14u "${VERSION}"
  Pop $0
  SetCtlColors $0 69505A transparent
  SendMessage $0 ${WM_SETFONT} $BodyFont 1
FunctionEnd

Function LocationPage
  Call MakePage
  ${NSD_CreateLabel} 22u 91u 240u 14u "安装位置"
  Pop $0
  SetCtlColors $0 422B34 transparent
  SendMessage $0 ${WM_SETFONT} $BodyFont 1
  ${NSD_CreateText} 22u 111u 198u 22u "$INSTDIR"
  Pop $PathInput
  SetCtlColors $PathInput 422B34 F0E4F5
  ${NSD_CreateButton} 226u 111u 55u 22u "更改位置"
  Pop $0
  ${NSD_OnClick} $0 BrowseLocation
  GetDlgItem $0 $HWNDPARENT 1
  ${If} ${FileExists} "$INSTDIR\RootSound.lnk"
    SendMessage $0 ${WM_SETTEXT} 0 "STR:升级"
  ${Else}
    SendMessage $0 ${WM_SETTEXT} 0 "STR:安装"
  ${EndIf}
  nsDialogs::Show
  ${NSD_FreeBitmap} $BitmapHandle
FunctionEnd

Function BrowseLocation
  Pop $0
  ${NSD_GetText} $PathInput $0
  nsDialogs::SelectFolderDialog "安装位置" "$0"
  Pop $0
  ${If} $0 != error
    ${NSD_SetText} $PathInput $0
  ${EndIf}
FunctionEnd

Function ValidateLocation
  StrCmp $INSTDIR "" invalid
  StrCpy $0 $INSTDIR 2
  StrCpy $1 $INSTDIR 1 2
  StrCpy $2 $0 1 1
  ${If} $2 != ":"
  ${OrIf} $1 != "\"
    Goto invalid
  ${EndIf}
  System::Call 'kernel32::GetFullPathNameW(w "$INSTDIR", i ${NSIS_MAX_STRLEN}, w .r0, p 0) i.r1'
  IntCmp $1 0 invalid
  IntCmp $1 ${NSIS_MAX_STRLEN} invalid +2 invalid
  Goto invalid
  StrCpy $INSTDIR $0
  ${GetRoot} "$INSTDIR" $0
  ${If} "$0\" == "$INSTDIR"
    Goto invalid
  ${EndIf}
  StrCpy $AppDirectory "$INSTDIR\app-${VERSION}"
  ClearErrors
  Return
invalid:
  SetErrors
FunctionEnd

Function LocationLeave
  ${NSD_GetText} $PathInput $INSTDIR
  Call ValidateLocation
  ${If} ${Errors}
    MessageBox MB_OK|MB_ICONEXCLAMATION "请选择完整的安装文件夹。"
    Abort
  ${EndIf}
FunctionEnd

Function FinishPage
  Call MakePage
  ${NSD_CreateLabel} 22u 94u 250u 22u "安装完成"
  Pop $0
  SetCtlColors $0 422B34 transparent
  SendMessage $0 ${WM_SETFONT} $BodyFont 1
  ${NSD_CreateCheckbox} 22u 118u 220u 18u "打开简乐"
  Pop $Launch
  SetCtlColors $Launch 422B34 F6EDF4
  ${NSD_Check} $Launch
  GetDlgItem $0 $HWNDPARENT 1
  SendMessage $0 ${WM_SETTEXT} 0 "STR:完成"
  GetDlgItem $0 $HWNDPARENT 3
  ShowWindow $0 ${SW_HIDE}
  nsDialogs::Show
  ${NSD_FreeBitmap} $BitmapHandle
FunctionEnd

Function FinishLeave
  ${NSD_GetState} $Launch $0
  ${If} $0 == ${BST_CHECKED}
    ExecShell "open" "$AppDirectory\RootSound.exe"
  ${EndIf}
FunctionEnd

Section
  Call ValidateLocation
  IfErrors invalid
  IfFileExists "$AppDirectory\resources\app\rootsound-installed" existing
  IfFileExists "$AppDirectory\*.*" failed
  CreateDirectory "$INSTDIR"
  IfErrors failed
  GetTempFileName $StageDirectory "$INSTDIR"
  Delete "$StageDirectory"
  ClearErrors
  SetOutPath "$StageDirectory"
  File /r "${APP_SOURCE}\*"
  IfErrors failed
  nsExec::ExecToLog '"$StageDirectory\resources\app\runtime\dotnet.exe" "$StageDirectory\resources\app\host\RootSound.Host.dll" --verify-installation'
  Pop $0
  StrCmp $0 "0" 0 failed
  ${If} ${FileExists} "$StageDirectory\resources\app\webview\msedgewebview2.exe"
    nsExec::ExecToLog '"$SYSDIR\icacls.exe" "$StageDirectory\resources\app\webview" /grant "*S-1-15-2-1:(OI)(CI)(RX)" "*S-1-15-2-2:(OI)(CI)(RX)" /T /C /Q'
    Pop $0
    StrCmp $0 "0" 0 failed
  ${EndIf}
  FileOpen $0 "$StageDirectory\resources\app\rootsound-installed" w
  IfErrors failed
  FileClose $0
  SetOutPath "$INSTDIR"
  Rename "$StageDirectory" "$AppDirectory"
  IfErrors failed
  StrCpy $StageDirectory ""
  Goto shortcut

existing:
  nsExec::ExecToLog '"$AppDirectory\resources\app\runtime\dotnet.exe" "$AppDirectory\resources\app\host\RootSound.Host.dll" --verify-installation'
  Pop $0
  StrCmp $0 "0" 0 failed

shortcut:
  ClearErrors
  CreateDirectory "$INSTDIR\project"
  IfErrors failed
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
  ${GetParameters} $0
  ClearErrors
  ${GetOptions} $0 "/NO_REGISTER" $1
  ${If} ${Errors}
    WriteRegStr HKCU "${INSTALL_REGISTRY_KEY}" "Location" "$INSTDIR"
  ${EndIf}
  nsExec::ExecToLog '"$AppDirectory\resources\app\runtime\dotnet.exe" "$AppDirectory\resources\app\host\RootSound.Host.dll" --cleanup-installed-versions'
  Pop $0
  ${If} $0 != "0"
    MessageBox MB_OK|MB_ICONEXCLAMATION "新版已安装。关闭正在运行的旧版后，再次运行安装包即可清理旧程序。" /SD IDOK
  ${EndIf}
  SetErrorLevel $0
  Goto done

invalid:
  MessageBox MB_OK|MB_ICONSTOP "请选择完整的安装文件夹。" /SD IDOK
  SetErrorLevel 2
  Quit

failed:
  SetOutPath "$INSTDIR"
  ${If} $StageDirectory != ""
    RMDir /r "$StageDirectory"
  ${EndIf}
  MessageBox MB_OK|MB_ICONSTOP "安装未完成，请检查可用空间和写入权限。" /SD IDOK
  SetErrorLevel 1
  Quit
done:
SectionEnd
