# 本地安装包

2026-11-26：本次修正版为 `0.1.0-preview.14`。用户批准修正 Windows 向导、引导项目缺失时的创建行为、重建双平台安装包及根项目提交和推送；GitHub Release 仍由用户手动发布。

## 平台与入口

Windows 安装版采用根项目使用的 .NET/WinForms/WebView2 桌面代码，保留原生鼠标输入和窗口顶栏行为。`RootSound.exe` 是启动器，调用安装目录内的私有 .NET Runtime 和 `resources/app/RootSound.dll`。界面资源也位于该目录内。固定版 WebView2 与程序一同安装，不要求用户另装浏览器环境。

macOS ARM64 使用 Electron、同一套编辑器源码和跨平台文件服务。Windows 专用的原始鼠标输入及自动隐藏顶栏没有自动移植到 Mac。当前 Mac 包完成结构、权限、框架链接、内容及本地签名校验，尚未完成真实 Mac 安装、运行、听音及这些系统交互的验收。

## Mac 源码对照发现的差异

2026-11-18 本轮只检查并说明，没有修改程序或重新打包。

- 已有通用浏览器鼠标判定；缺少 Windows 的原始鼠标位移桥接，不能保证抵住物理屏幕边缘后继续外推仍可靠触发。影响音色卡、详情页和乐曲库的相关边缘交互，不等于所有边缘操作都不存在。
- 缺少用户要求的顶栏自动隐藏及顶部召回逻辑，目前沿用 Mac 原生窗口样式。
- 主页乐曲库两端都没有任意更换库根目录的入口；文件夹图标用于选择音乐文件，项目内子目录可正常浏览。ChooseLibraryFolder 的代码差异具体落在 Windows 另存为界面的外部保存目录选择分支，Mac 尚未接通；不能将其表述为 Mac 缺少主页乐曲库切换功能。
- 未接通 StartLibraryDuration / ReadLibraryDuration，因此没有 Windows 的后台列表时长读取能力；不代表播放计时没有实现。
- 未暴露和转发 StartNew；前端回退到 Create，因此新建会直接创建歌曲文件，不具备 Windows 的先编辑、首次保存时再落盘路径。
- 未接通 ReadLibraryVersioned / WriteScopedIfUnchanged 的原子版本检查。Mac 前端已有写入前读取并比对内容的保护，但检查与写入分两步；Windows 后端还会在同一锁内核对数据修改标记并写入。这是内部保护强度的差异，不是缺少一个用户功能，也没有复现 Mac 因此丢失数据。

前端卷帘、音符、音色卡、曲线、BPM 与播放等代码，以及文件服务中的打开、保存、改名、删除能力已在包中；Mac 上的音频、性能、输入手感、退出及文件读写仍待实机验证。触控板缺少物理中键时，需要单独设计中键模式切换的替代操作。

窗口样式和项目接口具备明确的补齐路径；物理边缘继续外推时的输入稳定性、权限需求以及不同设备的手感，需 Mac 原型和实机验证。助手建议延后 Mac 完整适配，用户尚未确定具体版本安排。

## 安装与升级

- Windows 首次默认优先 `D:\Apps\RootSound`，没有 D 盘时寻找其他非 C 的本地磁盘。允许用户手动选择 C 盘。成功安装后记住位置，后续升级继续使用该位置。
- preview.14 修正自绘背景覆盖路径输入框和“更改位置”按钮的问题。首页可直接编辑路径或打开系统目录选择器；取消选择保留原路径。路径页、安装进度和完成页使用统一的浅色背景、标题与音符图形。开发用界面预览具有独立标题且禁用安装，不作为安装包交付。
- 每版程序位于安装根目录的 `app-<version>`。歌曲默认位于安装根目录的 `project`，与版本目录分开。
- 新版先解压到临时目录，校验文件清单后再改名发布并更新快捷方式。下载文件名为“简乐安装.exe”，版本信息保留在文件属性中。
- 清理只删除文件清单中路径与 SHA256 都匹配的旧程序文件。修改过的文件、清单外的用户文件、自建空目录及链接目标保留。运行中的程序或私有运行时被占用时保留旧版，关闭后重运行安装包清理。
- `desktop/installer/legacy-files` 的清单来自本地 preview.9 和 preview.10 安装包的隔离安装。没有可信清单的更旧目录保留，不猜测删除。
- 演示工程取当前工作区 `project/演示项目` 的内容。Windows 和 macOS 仅在 `project` 尚不存在、也没有导入或升级保护记录时首次导入演示曲。已有 `project` 无论是否为空都保持原样。Windows 安装器不提前创建 `project`，检测已有目录后设置禁止导入标记；同版本重装也受保护。
- Mac 使用系统 `.pkg` 安装器，提供自定义位置选项和应用包更新声明；作品保存在用户“音乐/RootSound/project”，不写入应用包。实际升级行为仍需 Mac 验证。

## 构建入口

`scripts/Build-Release.ps1 -Version 0.1.0-preview.14 -UseCachedRuntimes`

运行环境清单位于 `.cache/release-dependencies/manifest.json` 和 `desktop/installer/native-runtime-lock.json`。后者固定 Windows Desktop Runtime 与私有 WebView2 的来源、版本和校验值。构建阶段验证 WebView2 主程序的微软 Authenticode 签名。此验证不等于给简乐安装包签名。

成品保存到 `release/<version>/简乐安装.exe`、`简乐安装.pkg`，另附 SHA256SUMS 和更新说明。开发中间文件放在 D 盘缓存中，完成验证后清理本次多余的打包目录。

## 验证入口与限制

- `scripts/Test-InstallerUpgrade.ps1`：隔离的升级、文件占用、失败及用户文件保护检查。
- `scripts/Test-NativeRelease.ps1`：私有运行环境、资源、演示导入和已安装启动器检查，不显示窗口、不播放声音。
- `scripts/Test-ReleaseInstaller.ps1 -Version 0.1.0-preview.14 -PreviousVersion 0.1.0-preview.13`：实际成品的静默首次安装、旧版升级、同版本重装、已有空项目目录、没有安装记录的已有歌曲目录、同名演示曲、歌曲树一致性与快捷方式目标检查。
- `scripts/verify-installers.py`：独立读取 Mac XAR/CPIO，检查包内容、权限、链接、自定义目录和更新声明。

这些检查不代表安装界面的人工视觉验收，也不代表真实 Mac 运行验收。Windows 安装包尚无可信 Authenticode 签名，Mac 尚无 Developer ID 签名／公证，因此系统信任提示仍可能出现。
