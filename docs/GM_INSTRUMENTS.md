# 录音音色库与 MIDI

桌面、网页和演示曲使用同一套内置录音。音色库有 12 种有音高乐器，以及 A、B 两套鼓的 22 个鼓件音色。采样按需读取，工程引用当前安装资源。[采样来源与许可](../public/instruments/rootsound-studio-v1/CREDITS.md)

MIDI 的 128 个乐器编号和打击键按类别匹配现有采样，没有同名乐器时使用替代录音。导入音色保留原乐器编号或打击键，供导出使用。用户更换音色后，导出采用新音色对应的编号。[文件与演奏信息](MUSIC_FILES.md)

录音采样由 scripts/build-studio-instruments.py 构建。npm run test:music 和默认测试覆盖音色库、MIDI 匹配与导出。
