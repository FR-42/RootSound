"""A separate, sparse opening candidate. Does not replace the main case."""
import sys,json
import numpy as np
from scipy.io import wavfile
from analyze_vulcanus import CASE,SOURCE
from model_refinement import harmonic_features
import build_vulcanus_case as builder
import verify_vulcanus_case as verifier

def main():
    destination=CASE/'alternate-intro';destination.mkdir(exist_ok=True)
    start=6.1;sr,source=wavfile.read(SOURCE,mmap=True)
    clip=np.asarray(source[round(start*sr):round(start*sr)+builder.N]).copy()
    features=harmonic_features(clip)
    np.savez_compressed(destination/'transcription_features.npz',**features)
    builder.START=start;builder.CASE=destination
    provisional,evidence=builder.extract_notes(features,63,84,'intro')
    usable=[x for x in evidence if (x['startSeconds']+x['endSeconds'])/2>.7 and (x['startSeconds']+x['endSeconds'])/2<builder.DURATION-.7]
    best=max(usable,key=lambda x:(x['endSeconds']-x['startSeconds'])*x['harmonicDominance'])
    builder.TONE_CENTER_SECONDS=start+(best['startSeconds']+best['endSeconds'])/2
    builder.TONE_ROOT_MIDI=best['pitch']
    sys.argv=[sys.argv[0]];builder.main()
    info=json.loads((destination/'case.json').read_text(encoding='utf-8'))
    info['Info']['Title']='Vulcanus · 开场备用片段'
    info['Info']['Summary']='约 6 秒起的 8 小节，声音较稀疏的备用案例；保留作分析难度对照。'
    (destination/'case.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf-8')
    verifier.CASE=destination;verifier.main()
if __name__=='__main__':main()
