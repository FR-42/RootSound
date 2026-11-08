# 实验与兼容源码的范围

当前公开产品是一份音乐直接进入钢琴卷帘。仓库仍保留旧 song／phrase／sampling／
melody-recognition／co-creation 模块，它们可能承担文件兼容或内部处理，不代表旧页面重新上线。
测试和文档需要区分当前入口、有效兼容合同和过时原型步骤。

本机 experiments/ 依 .gitignore 保存独立任务，包含 music-workflow 下的 reference-studio、
original-pilot、phrase-studio、song-studio、sample-editor、timbre-lab、spectral-forge、
tone-structure、tone-processor 等。先读具体目录 README 和对应用户指示，再恢复任务。
它们不是当前正式 UI、安装依赖或 Git 全量测试所必需的内容；未纳入本次文件迁移。
第三方运行库、模型、用户录音、实验音乐和 legacy/ 恢复档案没有因此删除或重新处理。

Vulcanus 的若干早期还原、音色及分离结果曾被用户拒绝，不能把文件仍在或数值通过
解释为听感满意。方法选择、GPU／模型、蓝线或结构层等规则仅属于相应实验范围。
尚未确认的模型／云服务／算法选择不进入主产品正式决策。

历史实验决定与结果可在 history/2026-11-05-maintenance/governance/DECISIONS.md、
同目录 TODO.md 中按任务名查证。本次归档的是指导性文档和检查快照，不是把功能源码
或实验成果当作“过时垃圾”一并删除。
