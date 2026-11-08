# 网页版与本地构建

简乐首页「动手试试」首次打开时询问「是否观看引导」。「是」从第一幕开始，结束后进入
编辑区。「否」直接进入编辑区。「设置」中的「再次观看引导」和首页的「操作引导」可随时
重看，练习使用独立乐谱，退出时回到原来的草稿。

手机网页的引导始终显示播放／暂停。练习取消选中或删除音符时，可以打开「右键」模式，再用手指点击或划过卷帘。缩放一幕起可用双指横向缩放音高、纵向缩放时间，斜向可同时缩放。

网页体验区复用桌面版的钢琴卷帘和编辑操作，初始曲目为 40 个钢琴音符、148 BPM 的示例。
示例草稿留在当前页面。正式保存和 WAV 导出在桌面版使用。

网页可用同一套 175 个内置音色。打开网页时预加载钢琴、弦乐和长笛的小音源，
保留原有 SF2 录音和参数。用到其余音色时再加载完整音源。

公开页面为 https://fr-42.github.io/RootSound/。独立体验入口为 https://fr-42.github.io/RootSound/play/。

旧六页动图和复现说明保存在 history/2026-11-08-website-guide。

## 源码与命令

website/ 是宣传页，web/index.html 和 src/workstation/app/web-demo.ts 是在线编辑器。
scripts/build-web-demo.mjs 构建共用编辑器，并附带入门音源、完整音源及许可，输出 .cache/website。

```powershell
npm.cmd run build:website
npm.cmd run test:website
```

scripts/test-web-demo.mjs 在隔离隐藏 Electron 中测试真实构建；需要本机额外缓存，
不是干净克隆默认测试的前置条件。它不操作用户桌面、不打开物理声卡。
手机真机／Safari／实际音频设备和听感不能由隐藏 Chromium 结果代替。

.github/workflows/pages.yml 仍是仓库的 Pages 构建／部署流程，使用 Node 24。
首页从 GitHub 的公开发布中读取配对的 Windows EXE 和 Mac PKG 安装包。
暂时没有可用安装包时，首页提供发布记录入口。
