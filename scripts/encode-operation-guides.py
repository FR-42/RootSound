"""Animated teaching images, composed from real isolated editor states. No video."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, sys

root=Path(sys.argv[1]) if len(sys.argv)>1 else Path(json.loads(Path('.test-output/rb133/latest.json').read_text())['root'])
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
out=Path('website/guides');out.mkdir(parents=True,exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',24)
key_font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',18)
FPS=30;W=1120;H=500;PW=1072;PH=416

def ease(t):return t*t*(3-2*t)
def mix(a,b,t):return a+(b-a)*t

def compose(raw,scene,previous,t):
    c={k:mix(previous['camera'][k],scene['camera'][k],t) for k in ['cx','cy','w']}
    h=c['w']*PH/PW
    c['cx']=max(c['w']/2,min(1200-c['w']/2,c['cx']));c['cy']=max(h/2,min(620-h/2,c['cy']))
    left=c['cx']-c['w']/2;top=max(56,c['cy']-h/2);ratio=manifest['pixelRatio']
    picture=raw.transform((PW,PH),Image.Transform.EXTENT,(left*ratio,top*ratio,(left+c['w'])*ratio,(top+h)*ratio),resample=Image.Resampling.BICUBIC)
    frame=Image.new('RGB',(W,H),'white');frame.paste(picture,(24,60));picture.close();d=ImageDraw.Draw(frame)
    d.text((W/2,28),scene['label'],font=font,fill='#344459',anchor='mm')
    if scene['keys']:
        text=scene['keys'];box=d.textbbox((0,0),text,font=key_font);width=box[2]-box[0]+20
        d.rounded_rectangle((W-24-width,12,W-24,43),radius=5,fill='#f0f3f7');d.text((W-34,27),text,font=key_font,anchor='rm',fill='#53667f')
    p=scene['cursor'];old=previous['cursor'];x=mix(old['x'],p['x'],t);y=mix(old['y'],p['y'],t)
    x=24+(x-left)*PW/c['w'];y=60+(y-top)*PH/h
    if 25<=x<W-45 and 61<=y<H-40:
        if p.get('down'):d.ellipse((x-13,y-13,x+13,y+13),outline='#7694bc',width=2)
        d.polygon([(x,y),(x,y+24),(x+6,y+18),(x+11,y+27),(x+15,y+25),(x+11,y+16),(x+20,y+16)],fill='white',outline='#344459',width=2)
        if '滚轮' in scene['keys']:
            d.rounded_rectangle((x+25,y-14,x+41,y+12),radius=7,fill='white',outline='#7694bc',width=2);d.line((x+33,y-9,x+33,y-2),fill='#7694bc',width=3)
    return frame

selected=set(sys.argv[2].split(',')) if len(sys.argv)>2 else None
cached={c['id']:c for c in json.loads((out/'lessons.json').read_text(encoding='utf-8'))} if selected else {}
lessons=[];expected={'lessons.json'}
for chapter in manifest['lessons']:
    identity=chapter['id'];expected.update(identity+suffix for suffix in ['.jpg','.webp','.gif'])
    if selected and identity not in selected:
        lessons.append(cached[identity]);continue
    scenes=chapter['frames'];previous=scenes[0];clock=0;number=0;frames=[];gif_frames=[];gif_indices=[]
    for scene in scenes:
        with Image.open(root/scene['file']) as source:raw=source.convert('RGB')
        end=clock+scene['duration']/1000;stop=round(end*FPS);transition=min(scene.get('transition',200)/1000,scene['duration']/1000)
        while number<stop:
            local=max(0,(number+1)/FPS-clock);t=ease(min(1,local/transition)) if transition>0 else 1
            frame=compose(raw,scene,previous,t);frames.append(frame)
            if number%2==0:gif_frames.append(frame.quantize(colors=192,dither=Image.Dither.NONE));gif_indices.append(number)
            number+=1
        previous=scene;clock=end;raw.close()
    frames[0].save(out/(identity+'.jpg'),quality=94,subsampling=0)
    durations=[round((n+1)/FPS*1000)-round(n/FPS*1000) for n in range(number)]
    frames[0].save(out/(identity+'.webp'),save_all=True,append_images=frames[1:],duration=durations,loop=0,lossless=True,method=3)
    gif_durations=[round((gif_indices[i+1] if i+1<len(gif_indices) else number)/FPS*100)*10-round(n/FPS*100)*10 for i,n in enumerate(gif_indices)]
    gif_frames[0].save(out/(identity+'.gif'),save_all=True,append_images=gif_frames[1:],duration=gif_durations,loop=0,optimize=True,disposal=1)
    frames[round(number*.6)].save(root/(identity+'-review.png'))
    for frame in frames+gif_frames:frame.close()
    expected.update(identity+suffix for suffix in ['.jpg','.webp','.gif'])
    lessons.append({k:chapter[k] for k in ['id','title','description','alt','version']}|{'duration':number/FPS})
    print(json.dumps({'id':identity,'seconds':number/FPS,'frames':number}),flush=True)
(out/'lessons.json').write_text(json.dumps(lessons,ensure_ascii=False,indent=2),encoding='utf-8')
# This directory contains only generated guides. Retire the superseded movies,
# subtitle tracks and six old chapters from the public website.
for file in out.iterdir():
    if file.is_file() and file.name not in expected:file.unlink()
print(json.dumps({'passed':True,'chapters':len(lessons),'videoFiles':0,'imageSize':[W,H],'bytes':sum(p.stat().st_size for p in out.iterdir() if p.is_file())}),flush=True)
