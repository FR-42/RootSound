"""Expand the local palette without changing the identities of existing starters."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIR = ROOT / 'src/workstation/modules/timbre'
gm = json.loads((DIR / 'general-midi.json').read_text(encoding='utf-8'))
old = json.loads((DIR / 'sampled-instrument-definitions.json').read_text(encoding='utf-8'))
programs = dict(zip('piano bright-piano electric-piano fm-piano harpsichord organ accordion nylon-guitar steel-guitar clean-guitar distorted-guitar harp guzheng violin viola cello contrabass string-ensemble piccolo flute clarinet oboe bassoon saxophone trumpet horn trombone tuba electric-bass synth-bass sub-bass xylophone marimba celesta tubular-bells saw-lead square-lead synth-pluck warm-pad airy-pad bell-pluck vocal-ah choir'.split(),
    [0,1,4,5,6,19,21,24,25,27,30,46,107,40,41,42,43,48,72,73,71,68,70,65,56,60,57,58,33,38,39,13,12,8,14,81,80,45,89,91,10,53,52]))
drums = dict(zip('acoustic-kick electronic-kick snare clap closed-hat open-hat crash tom tambourine shaker'.split(), [35,36,38,39,42,46,49,45,54,70]))
for item in old:
    key = item['key']
    if key in programs: item.update(program=programs[key], introduced=1)
    elif key in drums: item.update(drum=drums[key], introduced=1)

def category(p):
    if p < 8 or 16 <= p < 24: return '键盘'
    if p < 16 or p == 47 or p == 55 or 112 <= p < 120: return '打击'
    if 24 <= p < 32 or p in (46,104,105,106,107,108): return '拨弦'
    if 32 <= p < 40: return '低音'
    if 40 <= p < 52 or p == 110: return '弦乐'
    if 52 <= p < 55: return '人声'
    if 56 <= p < 64: return '铜管'
    if 64 <= p < 80 or p in (109,111): return '木管'
    return '电子'

result = []
for p, name in enumerate(gm['programs']):
    result.append(next((item for item in old if item.get('program') == p and item.get('introduced') == 1),
        dict(category=category(p), key=f'gm-{p}', name=name, midi=36 if 32 <= p < 40 else 60, program=p, introduced=2)))
for p, name in gm['drums'].items():
    p = int(p)
    result.append(next((item for item in old if item.get('drum') == p and item.get('introduced') == 1),
        dict(category='打击', key=f'gm-drum-{p}', name=name, midi=60, drum=p, introduced=2)))
assert len(result) == 175 and len({x['name'] for x in result}) == 175
(DIR / 'sampled-instrument-definitions.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('128 GM programs + 47 percussion voices; existing identities retained')
