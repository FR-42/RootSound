原生重建搭建说明 — 2026-10-30

本轮按用户要求只搭建代码：未运行音频、数值套件、性能测试或界面自动化。
只做 Python AST 语法检查和源码接线检查。不要把历史测试结果当成本轮验证。

使用现有 D:\RootSound\experiments\music-workflow\RipX音色分离.exe；关闭旧窗口再打开即可加载新代码。

目前可由用户测试的入口
1. 导入音频 → 原生谱峰分析（CPU）。
   结果自动进入“原生阶段”页，预览频率、强度和原始FFT bin相位。
   预览有数量/体积限制；完整JSONL记录保存在结果目录。
   原始FFT bin相位不是最终细化的谐波相位。此入口不生成完整MIDI。
2. “原生阶段” → 导入原生分量任务。
   示例：native-examples/constant-component-task.json。
   示例只请求明确指定的440 Hz常频分量及采样窗口，适用于44.1/48 kHz且长度至少0.28秒的输入。
   它不是自动音符识别。默认subtract=false，只输出幅度、相位、能量和统计中间记录。
   用户将subtract改为true时，额外输出native-residual.wav；这是明确候选后的原生PCM核扣除。
   输入按已恢复的PCM16分支解码，输出余量为浮点WAV；原文件不覆盖。
3. “原生阶段” → 导入原生谐波帧。
   这是后续分析链的接线入口：仅接受RipXNativeHarmonicFrames v1、对应原件SHA256、
   frames_base64中真实细化后的0x4c记录、显式rate_98a1ac/timestep_9c3720/component_slots。
   输出初始音符结构和已有幅度缓存；未恢复的代表音高保留null，不写伪造音高或MIDI。

本轮实际安装内容
- 原生候选窗口规则、搜索描述和0x230种子结构。
- 原生raw PCM常频分支的相位/幅度估计；区分拟合窗口与能量窗口。
- 流式候选处理、原生查表/定点相位分量扣除。
- 谐波帧分组、初始音符结构、普通零/一帧gap续接、幅度缓存及JSON交接。
- 结果查看页面与两种任务入口。
所有原生入口不导入Demucs/Basic Pitch，也没有公开模型回退。
旧Demucs/Basic Pitch入口独立保留并明确标注。

仍未完成
输入音频 → 完整自动候选频率/变频优化 → 全部谐波追踪/细化 → 代表音高 →
最终音符清理 → 完整原生MIDI/音符级音频重建，尚未连成完整可用链。
当前不能称为RipX核心的1:1复刻。没有执行原RipX作动态差分。
原件内FFT有Kiss FFT来源线索；基础FFT不应宣传为RipX独创算法。

构建证据和范围
native-core/native-build-coverage.json
native-core/evidence/{spectral,resynthesis,notes}/

回退备份：pre-gpu-backup/before-native-build2-20261030-095759/
