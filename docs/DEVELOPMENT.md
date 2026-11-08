# 开发、构建与并行工作树

更新于 2026-11-08。Windows 主项目为 D:\RootSound；其他设备请使用实际检出路径。

## 前置环境

源码检查使用 Node.js 24、npm 和锁文件。Windows 桌面构建另需 .NET 9 SDK、Windows
Desktop 运行时／WebView2 及项目 NuGet 依赖。发布包由单独的跨平台脚本生成。
不要把本机存在的缓存、依赖和 SDK 当作干净克隆自带内容。

```powershell
npm.cmd ci
npm.cmd run check
npm.cmd test
npm.cmd run desktop:build
```

Build-Desktop.ps1 在缺少前端工具时会尝试 npm ci；先做类型检查，再构建发布界面与原生宿主，
成功后原子更新根启动器及 .cache/desktop-build.current。普通双击 RootSound.exe 不构建源码。
构建失败应保留上一次可用发布；不能拿旧 exe 当作新代码已生效的证据。

npm run dev／npm run build 使用 index.html 的开发工作站入口；正式桌面要用 desktop:build。
网页用 build:website。跨平台打包需要独立运行时缓存与打包依赖。

```powershell
powershell -File scripts/Build-Release.ps1 -Version 0.1.0-preview.4
```

发布文件在 release 目录。Windows x64 使用单文件安装程序，默认安装至
D:\Apps\RootSound，并创建桌面快捷方式。D 盘缺失时选择其他非 C 盘的固定磁盘。
安装版工程目录为安装根目录的 project，更新程序版本时继续使用此目录。
Mac 使用安装到 /Applications 的 Apple 芯片版 PKG，最低 macOS 13。
预览包中的 Mac 应用使用临时签名，PKG 未经 Apple 公证。
默认安装包不含本地工程。显式使用 IncludeCurrentProjects 仅打包演示目录的原生工程。

## 原生 Git worktree

按 D:\CodexWorkTrees\项目名\聊天名 组织目录；每个并行任务独立目录、独立分支。
新增工作树使用 git worktree add，重命名／移动使用 git worktree move；不直接改 .git 指针。
共享历史不等于共享未提交文件。普通聊天需从对应目录开始，并报告真实目录和分支。

```powershell
git rev-parse --show-toplevel
git branch --show-current
git status --short
git worktree list
```

本机四个原生任务目录为“引导”“RootSound”“修复手机音源核验错误”“实验问答”。
2026-11-05 用户已要求将 main 同步回这四个目录。干净且已被 main 包含的任务分支使用
git merge --ff-only main；仍保留各自分支名。存在新提交或未提交修改时先保留并处理差异。
修改共享父目录说明不会改变分支文件或聊天绑定，Git 同步也不会更新忽略的本机构建缓存。
父目录 README.md 是本机共享交接，不在任一工作树的 Git 提交范围内。

## 同时运行多个版本

默认副本共用 %LOCALAPPDATA%\RootSound，并独占其中 materials.lock。Git 工作树不自动
隔离用户数据。保留此数据锁，测试启动时明确指定各自 D 盘数据目录：

```powershell
$taskRoot = (Get-Location).Path
& (Join-Path $taskRoot 'RootSound.exe') --data-dir (Join-Path $taskRoot '.cache\app-data')
```

直接双击仍用默认目录。共同打开同一个外部 MIDI／工程文件仍会共享该文件，测试应使用
自己的小型副本。不要用用户真实音乐来验证破坏性保存、删除或转换。

## 文件维护

代码、当前文档和有效测试入库；node_modules、.cache、.test-output、release、实验数据
按 .gitignore 保留本地。project 下仅跟踪 project/演示项目 中的 .rootsound 工程，
其余本地音乐保留在磁盘。第三方许可和素材来源说明须随对应资源保留。
项目默认创作目录可能随设置变化，交付音乐前应读取应用报告的位置。
