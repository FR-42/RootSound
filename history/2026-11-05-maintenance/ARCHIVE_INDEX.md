# 2026-11-05 整理索引

原始状态：a68f96f7。此目录冻结维护前内容；[MANIFEST.json](MANIFEST.json) 逐项记录来源路径、
快照路径、字节数、SHA-256 和处理理由。更新后的说明在 [当前文档](../../docs/README.md)。

## 保存范围

131 份原始文件：21 份 Markdown、104 份 tests 下的测试、5 份脚本及 1 份首页 HTML。有效测试和保留文档也有
维护前快照，便于比较；“有快照”不等于“已撤下”。快照不改原文，不据其旧链接判断当前目录。

## 从现行位置撤下的文件

| 类型 | 文件／原因 |
| --- | --- |
| 旧重建方案／日志 | docs/REBUILD_PLAN、REBUILD_FOUNDATION、REBUILD_ARCHITECTURE、REBUILD_PROGRESS；分别由当前决策、架构、状态与待办替代 |
| 一次性记录 | docs/INTEGRATION_2026-11-05、TEST_FAILURE_AUDIT_2026-11-05；保留当时证据，最新结论看本轮维护报告 |
| 旧协作条款 | governance/history 和 governance/AItoHUMAN/history 下的 2026-10-23 记录；不再散放于现行治理目录 |
| 撤掉的旧界面测试 | phrase-studio-integration、phrase-composition-ui、phrase-library-creation-ui、playlist-ui、rhythm-workspace、welcome-library |
| 被替代的流程测试 | midi-project（旧导入新工程路径）、playlist-refinement-project（另存为仍保留旧编排 UI 元数据的预期）；现行音乐文件／文档检查继续保留 |
| 未上线的原型测试 | co-creation、co-creation-generation、co-creation-rename；源码保留，恢复功能时先重新审核原检查 |
| 旧生成／验收脚本 | capture-website-assets.mjs、build-website-assets.mjs、test-workspace-layout.mjs |

未按整份淘汰：project-phrases、project-timbres、phrase-library、phrase-inspector 等混合测试。
它们仍保护工程归属、原子写盘、引用、撤销和便携数据；维护夹具和当前名称后继续参与默认检查。
旧分屏领域数据的兼容检查同样保留，不把撤掉旧界面误当成可以丢掉用户旧数据。

## 如何追溯

从 MANIFEST 的 source 找到 snapshot；检查 action 和 reason 区分已归档、已更新、保留。
`npm run check:docs` 核对每份快照的字节数与 SHA-256。还原旧测试时应主动复制并改回文件名，
审查相对导入、当前产品合同与运行条件；不要直接把整份旧测试接回默认测试命令。

当前剩余问题与完整验证结果见 [维护报告](../../docs/MAINTENANCE_2026-11-05.md)。
维护前 191 项失败及本轮处置分列于 [检查处置清单](TEST_DISPOSITIONS.json)。
