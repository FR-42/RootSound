# RootSound

让普通人把想象中的音乐或一段声音，尽快变成能听见、能修改、能继续创作的成果，减少表达想法所需的学习和操作。

**当前是新架构的单音色验证版，Windows 桌面软件优先。** 已实现“制作声音 → 试听 → 保存或另存 → 重新打开继续编辑”。目前使用浏览器验证模块协作，尚未产出 Windows 桌面程序，也没有完成乐句、歌曲或 AI 共创。

## 一键打开

**双击根目录的 `RootSound.bat` 即可打开新项目。** 首次会安装依赖，随后启动本地服务并打开浏览器；需要已安装 Node.js 和 npm。关闭标题为 `RootSound server` 的窗口即可停止服务。

手动启动：

```powershell
npm install
npm run dev
```

按启动输出中的地址打开。日常测试请保持同一个地址和端口。

## 当前可以体验

1. 从欢迎页选择“开始旅途”或“直接进入创作”。
2. 选择一种声音感觉，点击“听听看”；空格也可试听或停止。
3. 拖动声音起落曲线上的圆点，或操作滑杆，调整声音的出现与消散。
4. 改名并保存；已有声音也可“另存为新声音”。
5. 重新打开相同地址，通过“继续创作”或“我的声音”找回已保存内容与未完成编辑稿。

当前调整参数会停止旧试听，再次点击试听使用新设置；连续实时调整声音尚未实现。

**数据暂存在当前浏览器中。** 换地址、换端口、换浏览器或清除浏览器数据，均不会自动搬运这些内容。Windows 文件保存、普通音频导出和完整可编辑工程导出尚未实现。当前基本合成能力与参数范围仅用于验证流程，不是未来工作站的能力上限。

## 开发与验证

建议使用 Node.js 24 或更新版本；测试使用 Node.js 直接执行 TypeScript。

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动新项目开发服务 |
| `npm run check` | 检查新项目类型 |
| `npm run test:workstation` | 验证保存、声音运行、模块边界与跨模块流程 |
| `npm run build` | 构建新项目到 `dist/` |

新源码位于 `src/workstation/`，由公共规范、应用装配和独立模块组成。实际实现范围与验证记录见[重建进展](docs/REBUILD_PROGRESS.md)。根项目不导入或构建旧原型。

## 设计与协作入口

| 文档 | 内容 |
| --- | --- |
| [新架构草案](docs/REBUILD_ARCHITECTURE.md) | 目的、组织、模块、交流与已确认原则 |
| [基础设计](docs/REBUILD_FOUNDATION.md) | 声音运行、内容引用、编辑稿与最小交流能力 |
| [重建计划](docs/REBUILD_PLAN.md) | 分阶段目标与验收依据 |
| [重建进展](docs/REBUILD_PROGRESS.md) | 已实现、已验证与尚未实现的范围 |
| [正式决策](governance/DECISIONS.md) | 当前项目已确定的结论 |
| [待办](governance/TODO.md) | 当前工作队列 |
| [协作规范](governance/NORMS.md) | 对话与文件修改规则 |
| [治理记录中文说明](governance/AItoHUMAN/) | 治理文件的白话中文镜像 |

设计文档区分已确认、建议与待定；写入草案不代表所有细节都已定案。

## 旧项目档案

旧原型的代码、样式、测试、文档与原治理记录已集中到 [`legacy/prototype/`](legacy/prototype/)，作为独立旧项目保存。旧页面不再出现在新界面或新构建中；需要比较旧实现时，可双击该目录自己的 `RootSound.bat`，或运行：

```powershell
npm --prefix legacy/prototype install
npm --prefix legacy/prototype run dev
```

旧原型使用独立的 `http://localhost:5174/`，新旧数据不自动转换。浏览器数据按地址和端口分别保存；此前旧页面保存的数据仍属于其原地址，文件迁移不会搬运这些数据。

此前的[旧工作文件快照](legacy/prototype/docs/history/2026-10-22-prototype/SOURCE_SNAPSHOT.md)保留；本次迁移前工作区与旧 Git 历史另有 `legacy/` 内的压缩备份。活动 Git 已重新初始化，新历史仅跟踪新项目；`legacy/` 留作本机档案，不纳入新 Git。具体备份与恢复说明见 [`legacy/README.md`](legacy/README.md)。
