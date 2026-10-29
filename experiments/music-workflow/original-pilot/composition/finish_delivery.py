"""Package a small, self-contained listening/editing handoff; no app launch."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT=Path(__file__).resolve().parent.parent
DELIVERY=ROOT/'delivery-v1'

guide='''余焰 · 第一稿

先听 01-余焰-完整试听.wav（约18.84秒）。
02-人声与背景旋律.wav 用于检查人声及背景，不含低音与鼓组。

编辑：运行项目根目录的 RootSound.bat 或现有 RootSound.exe。
欢迎页“开始” → 乐曲库底部文件夹框 → 选择“余焰 · 第一稿.rootsound”。
双击歌曲编排行上的乐句，进入旋律部或节奏部细调。
8条音乐轨、356个独立音符；全部音色和声音素材已在工程内，不需另找文件。
在本机工作目录里，未经编辑的工程另存于“原始交付”子目录；完整ZIP内直接位于顶层。
若RootSound已打开，请保存自己的修改后重新启动，以使用本轮采样校验性能修正。

试听文件按工程的正式播放计划离线生成，统一提高6.81dB供试听；
RootSound内播放会较轻，音符、乐器及混音比例相同。
“工程原音量.wav”是未提高试听音量的核对文件，不是另一版作曲。

部分女声滑音已预处理在采样里；改变音符之后不会自动重新计算连音。
本轮是可编辑试作，不代表主程序已经具备完整的歌声合成功能。

另附MIDI保留音符，用其他DAW打开后需要自行配置音色。
分轨目录是各层的音频，使用相同试听音量，可相加还原完整片段。

人声原录音来自VocalSet，作者Julia Wilkins、Prem Seetharaman、Alison Wahl、Bryan Pardo，
采用CC BY 4.0；已裁切、调音、延长并加效果，详见“素材来源与许可.txt”。
Vulcanus仅用于参照，成品未复制其原音频。

目前只是第一稿，尚未经过你的听感验收。
'''
(DELIVERY/'使用说明.txt').write_text(guide,encoding='utf-8-sig')
project=DELIVERY/'原始交付'/'余焰 · 第一稿.rootsound'
if not project.is_file():project=DELIVERY/'余焰 · 第一稿.rootsound'
members=[DELIVERY/'01-余焰-完整试听.wav',DELIVERY/'02-人声与背景旋律.wav',
    project,DELIVERY/'余焰 · 第一稿.mid',
    DELIVERY/'使用说明.txt',DELIVERY/'素材来源与许可.txt',
    DELIVERY/'LICENSE-VocalSet-CC-BY-4.0.txt',*sorted((DELIVERY/'分轨').glob('*.wav'))]
assert len(list((DELIVERY/'分轨').glob('*.wav')))==8
for file in members:
    assert file.is_file(),file
manifest=[dict(path=str(p.relative_to(DELIVERY)),bytes=p.stat().st_size,
               sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in members]
(DELIVERY/'交付清单.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
archive=ROOT/'余焰-第一稿-完整交付.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for file in members:
        relative=Path(file.name) if file==project else file.relative_to(DELIVERY)
        z.write(file,arcname=str(Path('余焰-第一稿')/relative))
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert len(z.infolist())==len(members)
original=Path(r'D:\Sound\temp\music\vulcanus.mp3')
assert hashlib.sha256(original.read_bytes()).hexdigest()=='fd358c65504e24fb95173f825ffe50ad5b4f5458ae3067513a8e1a72f3729926'
print(json.dumps(dict(archive=str(archive),bytes=archive.stat().st_size,
    files=len(members),zipCrcCheck=True,referenceUnchanged=True),ensure_ascii=False,indent=2))
