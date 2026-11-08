# 网页版与本地构建

简乐首页「动手试试」内嵌和桌面版共用的欢迎页、乐曲库、卷帘、设置、音色库与十幕操作引导。
官网标题旁也提供「操作引导」入口。它在同一界面打开独立练习，退出时回到原来的页面和草稿。

公开页面为 https://fr-42.github.io/RootSound/。独立应用入口为 https://fr-42.github.io/RootSound/play/。

## 文件与音源

从欢迎页点「开始」，可以在乐曲库打开示例、新建歌曲或选择本机文件。示例是原有的 40 个钢琴音符、
148 BPM 曲目。网页和桌面使用同一套 175 个内置音色及完整的 GeneralUser GS 采样库。

浏览器按需读取用户选中的文件，保存和音频导出会发起下载。浏览器乐曲库中的新建和已保存版本
留在当前标签页会话，跨会话保留请下载工程文件。网页支持原生工程、MIDI、MusicXML 和便携工程，
原格式保存及格式边界见 MUSIC_FILES.md。

旧六页动图和复现说明保存在 history/2026-11-08-website-guide。

## 源码与命令

website/ 是宣传页，web/index.html 和 src/workstation/app/web-demo.ts 是在线编辑器。
scripts/build-web-demo.mjs 复制宣传页、构建共用的桌面界面并附带完整音源及许可，输出 .cache/website。

```powershell
npm.cmd run build:website
npm.cmd run test:website
```

scripts/test-web-demo.mjs 在隔离隐藏 Electron 中测试真实构建；需要本机额外缓存，
不是干净克隆默认测试的前置条件。它不操作用户桌面、不打开物理声卡。
手机真机／Safari／实际音频设备和听感不能由隐藏 Chromium 结果代替。

.github/workflows/pages.yml 仍是仓库的 Pages 构建／部署流程，使用 Node 24。
运行本地 build 不等于已执行该远端工作流。下载链接来自页面配置与公开发布信息，
首页的下载入口使用 Windows EXE 和 Mac PKG 安装包。
