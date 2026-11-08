# 历史制作工具（已停用为产品引导）

原短片已被用户否定，当前使用真实编辑器的无文字动态演示。此工具只保留历史恢复用途。

# 简乐引导短片

使用 Remotion 4.0.541 制作。基础篇 38 秒，速度与分段篇 27.2 秒；1280×720、30fps，H.264/AAC。
这是 2026-11-06 的首版分镜，艺术风格、节奏与教学效果仍待用户体验验收。

## 内容与运行

真实操作素材来自仓库已有的 `website/guides/*.webp`，与 Remotion 的抽象声波、音符、颜色、
镜头入场和交叉溶解交替剪辑。配乐由 `prepare.py` 的原创音序离线合成，是短片配乐，不是
录制用户音乐，也不是音源音质对照。章节定义与应用共享 `guidance-scenes.json`。

应用只播放已生成的视频，不加载 React 或 Remotion。首次静音自动播放，用户自选配乐；
减少动态效果偏好下初始暂停。章节导航、暂停、重播和进度拖动始终可用，观看不要求操作，
结尾自动记录看完。自由试用按需创建隔离练习，没有任务检查，也不强迫保存／导出。

原视频已归档到 `history/2026-11-06-remotion-onboarding/media`，不再随当前产品打包。桌面本地资源服务
对 MP4 提供 MIME 和字节范围响应，支持视频跳转。若视频损坏，章节文字和自由试用仍可访问。

## 重建

从项目根目录执行。需要 Node/npm、Python/Pillow 和本机 Chrome；输入素材和中间产物位于项目的 `.cache/guidance-film`。

```powershell
npm.cmd ci --prefix tools/guidance-film --cache .cache/npm
python tools/guidance-film/prepare.py
npm.cmd run render --prefix tools/guidance-film
npm.cmd run desktop:build
```

默认 Chrome 为 `C:\Program Files\Google\Chrome\Application\chrome.exe`，可通过
`ROOTSOUND_RENDER_CHROME` 指定。输入帧、临时视频、配乐 WAV 和中间静帧在 `.cache/guidance-film`，
历史预览 MP4、海报和渲染清单输出到 `.cache/guidance-film/exports`。开发分镜可用：

```powershell
npm.cmd run studio --prefix tools/guidance-film -- --public-dir ../../.cache/guidance-film/input
```

渲染使用 [Remotion 官方 renderer](https://www.remotion.dev/docs/renderer/render-media) 和
[Transitions](https://www.remotion.dev/docs/transitions)，版本与锁文件固定在制作子项目。
生成时不修改官网六页引导，不发布远端网站，不启动或控制用户桌面窗口。
