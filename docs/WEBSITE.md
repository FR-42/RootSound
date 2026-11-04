# 简乐网站

公开地址：<https://fr-42.github.io/RootSound/>。

2026-11-04 按用户要求精简：页面仅有中文名「简乐」、GitHub 仓库链接，以及
Windows x64／Mac Apple Silicon 两个下载链接。移除介绍、宣传语、截图、试听、
使用说明、问答和页脚。仓库地址和已有发布包文件名保持现有值。

同日按后续指示调整外观：「简乐」与灰色音符放在顶栏左侧，右侧是带 GitHub 图标的
小块（文字仅 GitHub）；Windows／Mac 恢复为带平台图标、平台信息和下载箭头的
卡片。仍只保留这三个链接，没有恢复其他宣传内容。

网站源码是 `website/`。推送 `main` 上的网站修改后，
`.github/workflows/pages.yml` 自动将此目录发布到 GitHub Pages。
初始下载链接指向 `preview261103`；页面会尝试从公开 Release 列表更新到最近
同时具备 Windows／Mac ZIP 的版本。API 失败或 JavaScript 不可用时保留初始链接。
新版本继续使用 `RootSound-Windows-x64-*.zip` 与
`RootSound-macOS-arm64-*.zip` 命名，并适时更新 HTML 中的初始链接。

本地查看：在 `website/` 下运行 `python -m http.server 8080`，访问
`http://localhost:8080`。网站不需要构建工具、账号或后端服务。

原宣传页的演示和素材生成流程已停用；历史内容可通过 Git 提交 f0ae5580 查看。
