"""Independently verify and collect the native editable phrase and comparison."""
from pathlib import Path
import hashlib
import json
import shutil
import sys
import zipfile
import numpy as np
from scipy.io import wavfile

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE.parent/'phone_trial'))
from prepare_comparison import pcm24
CASE=HERE.parents[1]/'cases/phone-recording-20261023-233819'
WORK=CASE/'melody'
OUT=CASE/'乐句'
NATIVE=WORK/'native-final'

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    if OUT.exists():
        # Refresh only this script's own unchanged delivery. Never overwrite a
        # user-edited phrase or an unfamiliar file while iterating on previews.
        prior=json.loads((OUT/'phrase-delivery.json').read_text('utf-8'))
        owned={item['file']:item['sha256'] for item in prior['files']
               if item['file']!='phrase-delivery.json'}
        assert {p.name for p in OUT.iterdir()}==set(owned)|{'phrase-delivery.json'}
        assert all(sha(OUT/name)==value for name,value in owned.items())
    review=json.loads((WORK/'transcription-review.json').read_text('utf-8'))
    expected=json.loads((WORK/'events-final.json').read_text('utf-8'))
    checks=json.loads((NATIVE/'native-verification.json').read_text('utf-8'))
    source=Path(review['source']);instrument=Path(review['instrument'])
    assert sha(source)==review['sourceSha256'] and sha(instrument)==review['instrumentSha256']
    assert checks['inputInstrumentUnchanged'] and checks['embeddedSamplesExact']
    assert checks['embeddedSettingsExact'] and checks['notesRoundtripExact']
    with zipfile.ZipFile(NATIVE/'melody.rsphrase') as phrase,zipfile.ZipFile(instrument) as patch:
        manifest=json.loads(phrase.read('manifest.json'))
        patch_manifest=json.loads(patch.read('manifest.json'))
        assert manifest['Format']=='RootSound.Phrase' and manifest['Version']==1
        assert len(manifest['Channels'])==len(manifest['Assets'])==1
        channel=manifest['Channels'][0];asset=manifest['Assets'][0]
        assert channel['AssetKey']==asset['Key'] and channel['Mode']==1
        assert phrase.read('assets/'+asset['Key']+'.f32')==patch.read('audio.f32')
        assert asset['Settings']==patch_manifest['Settings']
        assert len(channel['Notes'])==len(expected['events'])==33
        actual=channel['Notes'];seconds_per_tick=60/(manifest['Tempo']*960)
        errors=[]
        for note,event in zip(actual,expected['events']):
            assert note['Pitch']==event['midi'] and note['Velocity']==event['velocity']
            errors.append(abs(note['StartTick']*seconds_per_tick-event['startSeconds']))
            errors.append(abs((note['StartTick']+note['LengthTick'])*seconds_per_tick-
                              event['startSeconds']-event['durationSeconds']))
        assert max(errors)<=seconds_per_tick/2+1e-9
    sr,raw=wavfile.read(NATIVE/'melody-render.wav')
    fs,reference_pcm=wavfile.read(source)
    assert sr==fs==48000 and raw.shape==reference_pcm.shape==(384000,2)
    render=raw.astype(np.float64)/2**31
    reference=reference_pcm.astype(np.float64)/2**31
    assert np.isfinite(render).all() and 1e-6<np.max(abs(render))<1
    OUT.mkdir(exist_ok=True)
    copies={'手机旋律-45至53秒.rsphrase':NATIVE/'melody.rsphrase'}
    for name,path in copies.items():
        shutil.copyfile(path,OUT/name);assert sha(OUT/name)==sha(path)
    # Comparison is07 then reconstruction. Apply the same2ms edge ramps to
    # audition COPIES to avoid arbitrary crop-boundary clicks; no EQ or gain.
    fade=np.linspace(0,1,96)
    for sound in (reference,render):
        sound[:96]*=fade[:,None];sound[-96:]*=fade[::-1,None]
    # The8s excerpt cuts the final note before its native release has ended.
    # The editable phrase preserves that release; audition-only edge ramps
    # prevent a pop from the arbitrary crop boundary in the standalone WAV.
    pcm24(OUT/'试听-主旋律还原.wav',render,48000)
    combined=np.concatenate([reference,np.zeros((12000,2)),render])
    pcm24(OUT/'对照-07原选段与还原.wav',combined,48000)
    (OUT/'使用说明.txt').write_text('''手机旋律 · 45至53秒 · 还原草稿

打开“乐句谱写”，点击“从上一个乐句开始”，选择“手机旋律-45至53秒.rsphrase”。
音色已经放在文件里，不需要再次导入。只有一个主旋律通道，可修改音符、时值和力度。

“试听-主旋律还原.wav”由现有乐句播放引擎渲染，8秒首尾各2毫秒缓变，避免截断爆音。
“对照-07原选段与还原.wav”：先听07的8秒，停0.25秒，再听还原的8秒。
对照两段使用相同的2毫秒首尾缓变，没有额外调音或分别增大音量；07含其他声部，
本次只试着谱写主旋律。原文件未改动。

33个音符，约193拍/分。时间、音高、力度是还原估计，不是作者的原始乐谱。
部分重叠声部仍有歧义，特别是约46.1、49.7、50.6～51.1秒附近，需要试听后再修。
工程以完整小节保存：7小节覆盖8秒，末尾有约0.705秒空白。

本次使用原来的“手机旋律·短音”，没有修改其采样、音高基准或包络。
0.28秒短采样没有延音循环，高音移调后更短，部分长音会提前结束；尖锐程度和音色
变化也不会仅靠恢复音符就自动消失。不能将本版当成完全复原了原曲或原作者音色。

已验证原生乐句保存、重开、音符和内嵌采样一致，并通过实际乐句引擎渲染。
可以“另存为”保留自己的修改版本。听感尚待你判断。
''',encoding='utf-8')
    report={'status':'Delivered editable draft; musical listening pending','noteCount':33,
        'sourceSha256':sha(source),'instrumentSha256':sha(instrument),
        'sourceAndInstrumentUnchanged':True,'embeddedSampleBytesExact':True,
        'embeddedSettingsExact':True,'independentNoteAndTimingCheck':True,
        'maximumTimingRoundingErrorSeconds':max(errors),'audioFrames':len(render),
        'sampleRate':sr,'previewRms':float(np.sqrt(np.mean(render**2))),
        'referenceRms':float(np.sqrt(np.mean(reference**2))),
        'comparisonGainBoth':1,'comparisonEdgeFadeSeconds':.002,
        'evidence':'../melody/native-final/native-verification.json',
        'transcriptionReview':'../melody/transcription-review.json',
        'previewEdgeFadeSeconds':.002,
        'files':[{'file':p.name,'sha256':sha(p)}for p in OUT.iterdir()
                 if p.is_file() and p.name!='phrase-delivery.json']}
    (OUT/'phrase-delivery.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    assert sha(source)==review['sourceSha256'] and sha(instrument)==review['instrumentSha256']
    print(json.dumps({'directory':str(OUT),'notes':33,'frames':len(render),
        'maximumTimingErrorMs':max(errors)*1000,'sourceAndInstrumentUnchanged':True}))

if __name__=='__main__':main()
