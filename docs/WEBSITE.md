# 官网

官网：https://fr-42.github.io/RootSound/ 。

2026-11-26 用户批准重新设计官网并撤下在线试用。当前页面使用桌面软件的白色与柔和渐变体系，保留品牌、既有简介、Windows / Mac 下载、GitHub、发布记录、鸣谢及浏览器提示。
软件展示图由 `scripts/capture-website-product.mjs` 使用当前 `release-studio.ts` 与《初次创作》工程在隔离的不可见渲染器中生成，未截取用户桌面。

2026-11-27：静态下载链接同步到用户已发布的 `formal261126`，Windows 为 `default.exe`（676,944,870 字节），Mac ARM64 为 `default.pkg`（671,657,025 字节）。下载区下方新增两项新手功能展示：按住左 Alt 哼唱并实时高亮对应音调列、中键点击高亮参考列及再次点击取消。示意图为静态 SVG，未恢复在线编辑器或网页录音。

移除在线编辑器 iframe、试用入口及操作说明。构建只复制官网静态文件、展示图、图标、共用颜色变量与卡背；不构建或发布编辑器脚本、音源、示例工程。旧 `play/` 地址跳转回官网。
本地开发中保留的旧网页编辑模块不再是网站发布入口。

下载仍指向已经公开发布的安装包。页面可查询 GitHub 已发布版本，只有同一版本同时具备 EXE 和 PKG 才更新两个链接；API 不可用时保留有效回退链接。用户手动发布新版 Release，之后再同步静态回退链接。

## 构建与验证

```powershell
npm.cmd run build:website
node --test tests/workstation.web-demo.test.ts
node scripts/test-website.mjs
```

输出 `.cache/website`。测试覆盖无在线试用与音源、旧试用地址跳转、下载回退及双平台配对、1440 / 768 / 390 / 320 宽度、图像加载与横向溢出。渲染器始终不可见，不打开物理音频设备。

`.github/workflows/pages.yml` 在 main 推送后构建并部署 GitHub Pages。本次修改与部署已获批准；安装包不自动上传为 GitHub Release。
