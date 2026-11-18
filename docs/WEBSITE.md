# 官网与在线编辑器

官网：https://fr-42.github.io/RootSound/ 。独立体验：https://fr-42.github.io/RootSound/play/ 。

官网保留在线编辑体验，已移除全部操作引导入口、首次观看询问、重看按钮和场景启动逻辑。
旧的 `play/?guide=1` 链接直接进入编辑器；历史浏览器的观看选择不再影响启动。

在线体验仍使用用户提供的 40 音符、148 BPM 示例，每次访问建立独立的内存草稿。
只提供三角钢琴，按需准备其 WAV 采样。保留手机端右键模拟、删除、手指左侧拖动预览和双指缩放。
文件保存仍由桌面版承担，不暗示网站云端自动保存。

## 视觉来源

官网与在线编辑器共用 `src/workstation/app/release-colors.css` 的软件颜色变量。
构建将该文件和卡背 SVG 复制到网站 assets；在线编辑器直接导入同一文件，
Vite 仅将桌面专用颜色选择器映射到网页卷帘。网页布局适配位于 `website/styles.css`
和 `src/workstation/app/website-editor.css`，不复制一套近似调色板。

官网沿用品牌、简介、下载、GitHub、鸣谢及“建议使用非 Edge 浏览器”。
下载识别已发布的旧版命名和“简乐安装.exe / 简乐安装.pkg”，需要同一发布中的双平台资源配对。
API 暂不可用时保留当前已发布 preview.10 的有效下载链接；本地 preview.11 不等于已发布。

## 构建、检查与发布

```powershell
npm.cmd run check
npm.cmd run test:website
node scripts/test-web-demo.mjs
```

构建输出 `.cache/website`；只携带三角钢琴采样与许可。
真实浏览器检查使用隔离、不可见、离屏 Electron，覆盖首访、旧入口、颜色值、
1440/768/390/320 宽度、示例播放、手机删除/拖动/缩放、下载自动匹配。
音频测试使用离线时钟，不代表手机真机、Safari 或扬声器听感验收。

`.github/workflows/pages.yml` 在 main 推送后构建并部署现有 GitHub Pages。
本次用户已批准官网发布；GitHub Release 继续由用户手动发布，不上传安装包。
此前引导说明保存在 [历史快照](../history/2026-11-19-website-guide-removal/WEBSITE.md)。
