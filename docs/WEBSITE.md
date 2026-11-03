# RootSound 宣传网站

公开地址：<https://fr-42.github.io/RootSound/>。源码在 `website/`，通过
`.github/workflows/pages.yml` 部署到 GitHub Pages。推送 `main` 上的网站修改
会自动发布，也可以在 GitHub Actions 手动运行 **Publish RootSound website**。
不需要域名、数据库、服务器或付费建站服务。

## 内容与下载

- 白底灰色音符品牌、真实软件界面、原创试听、简短使用说明和 Windows／Apple
  Silicon Mac 下载。只介绍当前能访问的功能，明确是开发预览版。
- 下载初始指向已存在的 `preview261103` / `0.1.0-preview.3`。页面随后查询公开
  Release 列表，选择最近同时包含 `RootSound-Windows-x64-*.zip` 和
  `RootSound-macOS-arm64-*.zip` 的版本。发布新包时保持这个命名即可。
  API 限流／网络失败或关闭 JavaScript 时，仍保留 HTML 中的下载链接。
  将来更新时也应修改 HTML 的初始链接，避免长期停留在旧版本。
- 没有账号、追踪脚本或访问者数据上传；试听只在访客按下播放后开始。
  GitHub Pages 和 Release／API 请求仍由 GitHub 托管处理。
- 网站发布的仅是 `website/`。不上传本机工程、实验目录、开发缓存或安装包；
  安装包继续由现有 GitHub Release 托管。

## 原创素材

「微光 / Shimmer」为本页新作的 4 小节演示，提供钢琴／八音盒两种主旋律，
相同的贝斯和电钢琴伴奏。可下载的 MIDI 含三轨、66 个音符，不含歌曲录音。
播放采用产品实际内置的 GeneralUser GS 2.0.3 / SpessaSynth 内核离线渲染，
不是第三方歌曲的录音或重建。许可与采样来源边界见网站说明及
[音源说明](GM_INSTRUMENTS.md)。网页 UI 图片来自此原创工程的隔离隐藏实例，
没有拍摄用户桌面或读取用户歌曲。

素材再生成（已安装项目依赖与 FFmpeg；后两项需要本机发布缓存里的 Electron
及已编译的服务／公开界面）：

```powershell
node scripts/build-website-assets.mjs
node scripts/capture-website-assets.mjs
python -c "from PIL import Image; Image.open('.test-output/rb127/workspace.png').convert('RGB').save('website/assets/workspace.webp',quality=92,method=6)"
node scripts/test-website.mjs
```

测试在 `/RootSound/` 子路径下检查 1440／768／390／320 像素布局、图片载入、
试听文件离线解码、交互、发布查询失败回退和新版本更新。窗口始终隐藏，
不操作用户桌面，不打开物理声卡。测试同时生成 `social-card.png` 分享预览图。
试听音质仍由用户实际聆听评价；自动检查不代表听感验收。

本地查看可在 `website` 下运行 `python -m http.server 8080`，访问
`http://localhost:8080`。部署不依赖任何构建工具；所有必要素材已包含。
