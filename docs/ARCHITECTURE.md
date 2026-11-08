# 当前源码架构

更新：2026-11-05。本文件描述代码事实；内部组织是可调整实现，不替代用户目的与原则。

| 层 | 文件／目录 | 职责 |
| --- | --- | --- |
| 当前桌面界面入口 | src/workstation/app/release.ts | 文件服务、音乐文档、音色、编辑器、声音运行的组合 |
| 网页入口 | src/workstation/app/web-demo.ts、web/、website/ | 小范围在线创作与宣传页，内存草稿与浏览器下载 |
| 历史开发入口 | index.html → app/browser.ts | 保留旧工作站开发路径；npm run dev 不等于正式桌面入口 |
| 应用边界 | src/workstation/app/ | 文件格式转换、草稿与工程、项目音色、平台适配与关闭准备 |
| 共同合同 | src/workstation/contracts/ | 内容、时间、声音、文件和平台端口；不能反向依赖具体实现 |
| 素材与编辑 | modules/materials、phrase、timbre、song、sampling | 草稿、引用、历史、音符与音色数据；song 保留工程兼容边界 |
| 界面 | modules/ui-rendering/ | 当前音乐卷帘、乐曲库、学习；也含未挂载旧页面的兼容实现 |
| 实际发声 | modules/sound-runtime/ | 统一实时试听／播放／离线输出，SF2／PCM 及节点生命周期 |
| Windows 宿主 | desktop/RootSound.Desktop/ | WebView2、原子文件操作、音乐工程与本机服务 |
| 根启动器 | desktop/RootSound.Launcher/ | 校验当前构建指针并转发参数 |
| 跨平台发布宿主 | desktop/electron/、desktop/RootSound.Host/ | Electron 与 .NET 文件服务；不等同于原生 Windows 构建 |

## 公开边界与检查

大多数模块通过 public.ts 对外。当前还存在明确的辅助公开入口，静态检查逐项列举，
不放开任意内部路径：timbre 的 sample-bank／instrument-catalog／general-midi 数据，
sampling 的 audio 编解码，以及 ui-rendering 的音乐画布、输出音量和运输适配器。
网页示例 JSON 是明确的捆绑数据输入；Vite 的 worker/url 查询参数不是不存在的源码文件。
列表以 tests/workstation.boundaries.test.ts 为准。调整入口时应同时更新此处和检查，
说明理由；不能仅把所有现有依赖自动加入白名单来消除失败。

保留检查：合同层不能依赖实现；模块不能反向依赖应用组织层；不能通过别名进入旧工程；
未声明的跨模块内部路径、未解析的加载目标仍然报告问题。共同规范下的自由交流不等于
任意访问其他模块私有实现。

## 构建与兼容

vite.release.config.ts 把桌面界面切换到 release.ts，并记录实际捆绑模块。
旧共创／识别／采样页面不应因静态导入重新进入正式包；host-assets 等测试检查这一边界。
旧格式及旧音符分部需要兼容，不能因为归档旧 UI 测试就删除其转换／数据保护源码。

原设计草案、基础分工和全部重建计划快照在 history/2026-11-05-maintenance/docs/。
历史待定设计不自动成为当前公开接口，当前源码事实也不自动成为用户定案。
