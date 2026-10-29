RipX音色分离 — 独立实验工具

双击上一级目录的 RipX音色分离.exe。
1. 导入 WAV、MP3、FLAC、M4A 等 FFmpeg 支持的音频。
2. 选择四轨或六轨。默认使用GPU；也可显式选择CPU。
   实验性MIDI（Basic Pitch，非RipX）默认关闭，需要时再勾选。
3. 点击“开始分离”。每次建立新的结果目录，保留原输入。
4. 分离结束后勾选音轨、调音量，试听或导出组合 WAV。
5. MIDI 页可编辑音符音高、起止秒数、力度，删除音符并另存 MIDI。
6. “打开已有结果”选择 project.json，可以重新载入分离结果。

输出说明
- drums/bass/other/vocals.wav；六轨另有 guitar/piano.wav。
- 分轨 WAV 为44100Hz立体声32位浮点，避免单轨削波；不会自动播放。
- residual.wav 为原输入减去所有预测轨，用于补回模型未分配的部分。
  默认不勾选。全部预测轨加残余轨、音量都100%时可重建解码后的输入。
- 混音导出为24位PCM WAV。峰值超过0.98时统一降低增益，界面记录增益。
- all-stems.mid 和各旋律声部 .mid：Basic Pitch 估计的音符；鼓不转录。
- MIDI 是Format 1、256 PPQ，固定120 BPM承载实际秒数，不代表检测了节拍。
- notes.json 保存初始转录。界面编辑保存在当前会话中，须“导出修改后的 MIDI”；
  它不会回写 WAV，也不会自动保存为新的 notes.json。重新载入会恢复初始转录。
- 取消中途任务会保留已完成的分离结果；不完整的结果目录带有状态记录。

功能边界
这是根据分析所得的流程独立实现的本机工具，不是官方 RipX，也不是完整复刻。
没有复制或调用 RipX 的私有 DSP、授权机制、编辑器或 .rip 格式。
声部分离使用公开的 Hybrid Transformer Demucs 4.0.1：4源和实验性6源模型。
MIDI 使用 Spotify Basic Pitch 0.4.0 的 ONNX 模型；并非 RipX 私有音符识别算法。
当前音符导出不保留 Basic Pitch 弯音估计，不支持鼓事件识别、自动节拍量化、
音符级音频重合成或完整钢琴卷帘编辑器。复杂和弦、串音、电子音色可能误识别。
六轨的吉他/钢琴分类可能混淆；轨数多不意味着质量更高。
默认Intel Arc / XPU分窗运行神经网络，STFT/iSTFT仍在CPU，保持FP32。
GPU不可用时明确报错，不静默切到CPU。长曲会占用临时磁盘和更多时间。
本机模型暖运行约快4–6倍；完整短任务受初始化影响，不能套用此倍数。见GPU-VALIDATION.txt。
运行时禁用处理进程的网络连接，不会自动下载模型或上传音频。

运行组件（本机版）
EXE 是本机桌面启动入口，必须保留旁边整个 ripx-separator 文件夹。
使用 runtime.json 指定的现有 Anaconda Python与FFmpeg；本工具独立gpu-packages
提供PyTorch/Torchaudio 2.7.1+xpu和Intel运行库，共享CPU库保持原样。
并非可复制单个EXE到任意电脑的便携包；没有修改全局Python环境或系统环境变量。
通用依赖位于packages，GPU依赖位于gpu-packages；模型位于models，
来源/完整哈希见models/provenance.json和gpu-downloads中的provenance文件。
四轨权重复用本机已存在且匹配公开发布摘要的缓存；六轨从官方URL下载。

开源来源和许可
Demucs：https://github.com/facebookresearch/demucs （MIT）
Basic Pitch：https://github.com/spotify/basic-pitch （Apache-2.0）
第三方许可保留于 packages 中对应 dist-info 目录；依赖版本见 dependencies.json。
上述名称/模型归各自权利人。本工具标题按用户指定，仅用于标识本地实验。

验证
test_workflow.py 使用程序生成的信号，验证真实四轨/六轨推理、MIDI解析、混音、
输入保护和隐藏界面加载。测试记录见 last-test.txt 指向目录中的 results.json。
没有检查用户屏幕、播放测试音频或使用用户音乐；受控信号测试不代表真实音乐听感验收。

重建入口
执行 Build-RipXSeparator.ps1 可重新编译桌面启动器，不下载模型或安装任何软件。


RootSound 工程导出（2026-10-29）
重开分离工具后，可选“导出 RootSound 原音工程”或“导出 RootSound 音符工程”。
工程保存到 D:\RootSound\project，重名自动另起文件；重开 RootSound 使用更新后的多轨容量。
原音工程内嵌全部所选 WAV，保留采样精度；音符工程使用 Basic Pitch 识别并匹配合成音色，不含鼓点识别，也不是 RipX 原生音符算法。
原音工程较大，首次准备可能较慢。详情参见 ROOTSOUND-EXPORT-VALIDATION.txt。
