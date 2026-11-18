# 录音音色库与 MIDI

桌面音色库有 13 种有音高乐器，以及 A、B 两套鼓的 22 个鼓件音色。本次新增的“木吉他”使用钢弦民谣吉他的录音，与已有的尼龙弦“古典吉他”独立。采样按需读取，工程引用当前安装资源；网页部署及已发布安装包按各自构建状态提供音色。[采样来源与许可](../public/instruments/rootsound-studio-v1/CREDITS.md)

MIDI 的 128 个乐器编号和打击键按类别匹配现有采样，没有同名乐器时使用替代录音。导入音色保留原乐器编号或打击键，供导出使用。用户更换音色后，导出采用新音色对应的编号。[文件与演奏信息](MUSIC_FILES.md)

128 是 GM 的乐器编号数量，不代表当前另外安装了 128 套独立音色。当前活动资源为 rootsound-studio-v1。首发 preview261103 曾使用 generaluser-gs-2.0.3，历史 manifest 有 128 个 GM 乐器映射和 47 个鼓键映射；它不是当前仍在并行使用的另一套默认资源。

修改前的实现沿用 MIDI 名称表生成导入卡片名：编号 0 的“大钢琴”对应当前 studio-piano，与库中“三角钢琴”使用相同录音。已核对根项目中的 MIDI演奏效果演示、Animenz KICK BACK 和 Grand Escape 工程，其“大钢琴”记录均引用当前 studio-piano。

2026-11-18 最新命名决定：默认名称统一采用实际精选音色名称，包括 MIDI 导入，不再按来源显示 GM 名称，也不增加编号。例如不同 MIDI 钢琴映射至 studio-piano 后都叫“三角钢琴”；同名声部仍保留独立标识和演奏数据。两个导入入口使用固定精选名称；加载已有工程时，仅转换可确认的 GM 默认名，并同步保留音色编辑历史，用户自定义名称保留。正常保存后写入歌曲文件，单纯打开或放弃修改不会覆盖原文件。原 10 张手牌上限已取消；手牌通过滚轮沿扇形横向翻动，两侧卡片转入钢琴下方隐藏，没有左右手牌堆。GM 表仍用于文件识别，当前有音高录音乐器为 13 种，缺少对应录音时仍使用已有乐器替代。

录音采样由 scripts/build-studio-instruments.py 构建。npm run test:music 和默认测试覆盖音色库、MIDI 匹配与导出。

木吉他对应零起算的 MIDI Program 25（界面编号 26），古典吉他对应 Program 24。音色目录版本 4 仅向版本 3 的现有歌曲补入木吉他，保持原音色、顺序及用户删除结果。新增采样可单独重建：将随库 sources/FSS-SteelStringGuitar-SF2-20200521.tar.xz 解包至 .cache/curated-sources/steel-guitar，运行 `python scripts/build-studio-instruments.py --instrument steel-guitar`；不会要求重新下载其他乐器。
