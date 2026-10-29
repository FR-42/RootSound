# Vulcanus：两份 Kick 合成近似

2026-10-28，用户指定 `D:/Sound/temp/music/vulcanus.mp3` 前20秒，使用已发布“精细音色生成器”
制作两种 kick；补充时间线索：3～10秒密集、10秒后稀疏但清晰。交付到 `D:/Sound/temp/tone/`。

当前运行环境不支持音频输入，不能直接听取原曲。这里根据音频瞬态、局部频率下滑和尾音，
制作两个方向的首版合成近似；**没有确认原曲恰有两个独立 kick、没有确认 A/B 对应或听感相似度**。
混音中的持续低音、人声、镲声以及背景旋律会干扰对鼓的判断。

- A：密集段短击，主体约80Hz逐步降至60余Hz，99%输出能量集中在约145ms内。
- B：下潜重击，较大的起始下滑，主体降至约50Hz，99%输出能量集中在约220ms内。
- 两份的短高次振荡层形成起音轮廓，正弦与三角层提供主体。声像居中、关闭合唱和回声。
- 原生音色以 C4 为参考键，按住约0.3秒可听完整自衰减。单击WAV可直接作为音频采样使用。
- 音高/音量/频谱各10点，四个振荡单元；没有在音色或输出中加入原曲采样或工具外效果。

使用当前发布 `20261028-055644-757-e7928b/ui` 的 `model.mjs`、`dsp.mjs` 和原生WAV编码器，
未修改工具。通过工具内频谱曲线的整体增益调齐单击峰值约0.70（−3.1dBFS）；未对导出音频外加归一化。

`delivery-final/` 为实际交付版本。较早的 `draft/` 和 `delivery/` 是较弱起音的内部候选，未复制到目标目录。
交付包含2份 `.rssynth`、2份48kHz/24位立体声单击WAV、1份先A后B的对比试听，以及说明。
对比节奏是便于试听的示例，不是原曲转写。原曲与目标目录先前6个文件摘要不变。

核验：音色冷读后重渲染与交付WAV逐字节相同；长按能自衰减而无持续低音；无削波/非有限值，
尾部60ms已归零，PCM24量化最大误差1.20e−7。信号检查不等于听感确认。

证据：`analysis/kick-events.json`、`grouped-targets.json`、`attack-details.png`、`native-output-check.png`，
`delivery-final/{generation-verification,delivery-verification,audio-measurements}.json`，
以及 `delivery-copy-verification.json`。`inspect-kicks.py` 的初始全低频检测含低音波动误报，
后续结合85～180Hz主体、人工选取的攻击窗口和用户时间线索比较；分组只是合成依据，不是分离结论。

`author-kicks.mjs <新的输出目录>` 可用该已发布引擎重现；写文件均禁止覆盖。
`verify-delivery.mjs <输出目录>` 与 `check-audio.py <输出目录>` 执行冷读/音频核验。
`Deliver-Kicks.ps1` 先核验全部摘要，再原子写入目标中的新文件，不替换任何不同内容的已有文件。
