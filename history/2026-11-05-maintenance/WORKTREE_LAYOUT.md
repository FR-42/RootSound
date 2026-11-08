# RootSound 工作树使用入口

本文件随 Git 版本保存。机器上的共享现状说明位于：

`D:\CodexWorkTrees\RootSound\README.md`

各工作树的目录与分支映射、独立构建、用户数据隔离和清理规则，以共享说明及
重新执行的 Git 检查为准；不要把早期快照中的路径、未提交状态或构建记录当作当前事实。

## 2026-11-05 整合

四个原生分支已纳入主项目 main，来源、冲突处理和验证限制见
[整合记录](docs/INTEGRATION_2026-11-05.md)。按用户本次要求，暂不把整合结果
同步回四个工作树。后续工作继续留在自己的任务分支，未经核对不要强制重置或覆盖。

## 开始开发前

在自己的工作根目录执行 git status --short、git branch --show-current 和
 git rev-parse --show-toplevel，阅读 AGENTS.md 与 governance/NORMS.md。
运行文件不随 Git 自动构建；修改源码后在自己的目录执行 npm.cmd run desktop:build。
并行运行时给每个进程指定不同的 --data-dir，不能通过移除用户数据锁来代替隔离。
