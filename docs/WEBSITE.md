# 网页版与本地构建

当前网页为宣传页、六页操作动图和缩减在线音乐编辑器。当前产品名称为“简乐”。
网页动图与编辑器内的操作式学习分别保留；桌面学习改版不等于网站动图已经撤掉。

公开链接沿用 https://fr-42.github.io/RootSound/；本文描述仓库实现，不保证远端与本地同版本。
当前维护任务没有部署网站或上传发布包的授权。

## 范围

共用音乐画布、领域模型、撤销、播放／暂停、音符组、原格式入口、WAV 和原生工程下载。
网页使用独立内存草稿，下载不直接覆盖本机原文件。支持 MIDI、原生／便携工程、MusicXML／MXL，
总长最多 64 拍、16 组、2048 音符，打开上限 16 MiB；超限明确拒绝，不能静默裁掉内容。
固定八种音色：钢琴、长笛、弦乐、贝斯、八音盒、底鼓、军鼓、闭镲。
实际裁剪的 SF2 保留原音源规则与录音、相关许可。格式损失见 MUSIC_FILES.md。

首次学习与高级功能练习使用单独的可编辑项目，不改公共示例和访问者音乐。
固定公共示例来自用户提供的 40 个钢琴音符、148 BPM，每次访问取得新的可编辑副本；
不是把所有访问者修改自动存入公共示例。刷新／离开后的草稿依实际提示，不声称云保存已实现。

六页动图仍由 website/guides/lessons.json 和 JPG/WebP 提供，site.js 负责翻页、左右键、滑动、
停用动图与减少动画设置。保留 scripts/render-operation-guides.mjs、operation-guides-renderer.cjs
和 encode-operation-guides.py；它们是单独的素材制作链，需要隐藏 Electron、Python/Pillow
与本机缓存，正常网页构建直接使用现有资源。“写音符与拖动画布”已重录，展示单选时拖空白移动卷帘，以及组选后在空白处写入。
已撤下的宣传截图／试听素材生成器归入 history；它们的产物不再被当前首页引用。

## 源码与命令

website/ 是宣传页，web/index.html 和 src/workstation/app/web-demo.ts 是在线编辑器。
scripts/build-web-demo.mjs 复制宣传页、构建编辑器、裁剪音源和保留许可，输出 .cache/website。

```powershell
npm.cmd run build:website
npm.cmd run test:website
```

scripts/test-web-demo.mjs 在隔离隐藏 Electron 中测试真实构建；需要本机额外缓存，
不是干净克隆默认测试的前置条件。它不操作用户桌面、不打开物理声卡。
手机真机／Safari／实际音频设备和听感不能由隐藏 Chromium 结果代替。

.github/workflows/pages.yml 仍是仓库的 Pages 构建／部署流程，使用 Node 24。
运行本地 build 不等于已执行该远端工作流。下载链接来自页面配置与公开发布信息，
修改远端版本或部署需要用户明确指示。
