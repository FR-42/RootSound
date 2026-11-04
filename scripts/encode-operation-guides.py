"""Focused, short lessons: smooth camera/cursor, one label, real UI states."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, subprocess, sys, math

root=Path(sys.argv[1]) if len(sys.argv)>1 else Path(json.loads(Path('.test-output/rb132/latest.json').read_text())['root'])
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
out=Path('website/guides');out.mkdir(parents=True,exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',28)
small=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',17)
key_font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',19)
FPS=30;W=1280;H=800;lessons=[]
selected=set(sys.argv[2].split(',')) if len(sys.argv)>2 else None
cached={c['id']:c for c in json.loads((out/'lessons.json').read_text(encoding='utf-8'))} if selected else {}
def run(args):
    r=subprocess.run(args,capture_output=True,text=True)
    if r.returncode:raise RuntimeError(r.stderr[-2500:])
def ease(t):return t*t*(3-2*t)
def mix(a,b,t):return a+(b-a)*t
def timecode(t):
    n=round(t*1000);return f'{n//3600000:02}:{n//60000%60:02}:{n//1000%60:02}.{n%1000:03}'
def compose(raw,scene,previous,t):
    c={k:mix(previous['camera'][k],scene['camera'][k],t) for k in ['cx','cy','w']}
    h=c['w']*620/1200
    c['cx']=max(c['w']/2,min(1200-c['w']/2,c['cx']));c['cy']=max(h/2,min(620-h/2,c['cy']))
    left=c['cx']-c['w']/2;top=c['cy']-h/2;ratio=manifest['pixelRatio']
    picture=raw.transform((1200,620),Image.Transform.EXTENT,(left*ratio,top*ratio,(left+c['w'])*ratio,(top+h)*ratio),resample=Image.Resampling.BICUBIC)
    frame=Image.new('RGB',(W,H),'#f4f5f7');frame.paste(picture,(40,82));d=ImageDraw.Draw(frame)
    d.rectangle((39,81,1240,702),outline='#d4dbe4',width=1)
    d.text((40,28),chapter['id'][:2]+' / '+chapter['title'],font=small,fill='#626d7b')
    d.text((640,32),scene['label'],font=font,fill='#253b52',anchor='mm')
    if scene['keys']:
        text=scene['keys'];box=d.textbbox((0,0),text,font=key_font);width=box[2]-box[0]+24
        d.rounded_rectangle((1240-width,19,1240,54),radius=6,fill='#e6edf7');d.text((1228,35),text,font=key_font,anchor='rm',fill='#345a8f')
    p=scene['cursor'];old=previous['cursor'];x=mix(old['x'],p['x'],t);y=mix(old['y'],p['y'],t)
    x=40+(x-left)*1200/c['w'];y=82+(y-top)*620/h
    if 42<=x<=1220 and 84<=y<=680:
        if p.get('down'):d.ellipse((x-15,y-15,x+15,y+15),outline='#527ec1',width=3)
        d.polygon([(x,y),(x,y+27),(x+7,y+20),(x+12,y+31),(x+17,y+29),(x+12,y+18),(x+23,y+18)],fill='white',outline='#263b4d',width=2)
        if '滚轮' in scene['keys']:
            d.rounded_rectangle((x+28,y-17,x+46,y+12),radius=8,fill='#fff',outline='#527ec1',width=2);d.line((x+37,y-11,x+37,y-3),fill='#527ec1',width=3)
    return frame

for chapter in manifest['lessons']:
    identity=chapter['id']
    if selected and identity not in selected:
        lessons.append(cached[identity]);continue
    scenes=chapter['frames'];seconds=chapter['duration']/1000
    silent=root/(identity+'-silent.mp4');err=open(root/(identity+'-encoder.log'),'w')
    command=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',str(silent)]
    encoder=subprocess.Popen(command,stdin=subprocess.PIPE,stderr=err)
    previous=scenes[0];clock=0;frame_number=0;animated=[];sample_frames=[];poster=None;vtt=[]
    try:
        for scene in scenes:
            raw=Image.open(root/scene['file']).convert('RGB');end=clock+scene['duration']/1000
            stop=round(end*FPS);transition=min(scene.get('transition',200)/1000,scene['duration']/1000)
            while frame_number<stop:
                local=max(0,(frame_number+1)/FPS-clock);t=ease(min(1,local/transition)) if transition>0 else 1
                image=compose(raw,scene,previous,t)
                if poster is None:poster=image.copy();poster.save(out/(identity+'.jpg'),quality=94,subsampling=0)
                encoder.stdin.write(image.tobytes())
                if frame_number%2==0:animated.append(image.resize((1024,640),Image.Resampling.LANCZOS));sample_frames.append(frame_number)
                if frame_number in [round(seconds*FPS*.3),round(seconds*FPS*.7)]:image.save(root/(identity+f'-review-{frame_number}.png'))
                image.close();frame_number+=1
            if vtt and vtt[-1]['label']==scene['label']:vtt[-1]['end']=end
            else:vtt.append({'start':clock,'end':end,'label':scene['label']})
            previous=scene;clock=end;raw.close()
    finally:encoder.stdin.close();encoder.wait();err.close()
    if encoder.returncode:raise RuntimeError((root/(identity+'-encoder.log')).read_text())
    durations=[round((sample_frames[i+1] if i+1<len(sample_frames) else frame_number)/FPS*100)*10-round(n/FPS*100)*10 for i,n in enumerate(sample_frames)]
    animated[0].save(out/(identity+'.webp'),save_all=True,append_images=animated[1:],duration=durations,loop=0,lossless=True,method=4)
    palette=[image.quantize(colors=192,dither=Image.Dither.NONE) for image in animated]
    palette[0].save(out/(identity+'.gif'),save_all=True,append_images=palette[1:],duration=durations,loop=0,optimize=True,disposal=1)
    for image in animated+palette:image.close()
    if poster:poster.close()
    audio=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(silent),'-f','lavfi','-i','anullsrc=r=44100:cl=stereo']
    if chapter.get('audio'):
        audio+=['-i',str(root/chapter['audio'])];windows=chapter['audioWindows'];count=len(windows)
        filters=[f'[2:a]asplit={count}'+''.join(f'[a{i}]' for i in range(count))]
        for i,item in enumerate(windows):filters.append(f"[a{i}]atrim=start={item['from']}:duration={item['duration']},asetpts=PTS-STARTPTS,volume=3,adelay={round(item['at']*1000)}:all=1[s{i}]")
        filters.append('[1:a]'+''.join(f'[s{i}]' for i in range(count))+f'amix=inputs={count+1}:duration=first:normalize=0[sound]');audio+=['-filter_complex',';'.join(filters),'-map','0:v:0','-map','[sound]']
    else:audio+=['-map','0:v:0','-map','1:a:0']
    audio+=['-c:v','copy','-c:a','aac','-b:a','96k','-t',str(frame_number/FPS),'-movflags','+faststart',str(out/(identity+'.mp4'))];run(audio)
    (out/(identity+'.vtt')).write_text('WEBVTT\n\n'+'\n\n'.join(f"{timecode(c['start'])} --> {timecode(c['end'])}\n{c['label']}" for c in vtt)+'\n',encoding='utf-8')
    lessons.append({k:chapter[k] for k in ['id','title','summary','steps','version']}|{'duration':frame_number/FPS,'hasAudio':bool(chapter.get('audio'))})
    print(json.dumps({'id':identity,'seconds':frame_number/FPS,'fps':FPS,'animatedFrames':len(animated)}),flush=True)

listing=root/'combined.ffconcat';listing.write_text('ffconcat version 1.0\n'+''.join(f"file '{(out/(c['id']+'.mp4')).resolve().as_posix()}'\n" for c in lessons),encoding='utf-8')
run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(listing),'-c:v','copy','-c:a','aac','-b:a','96k','-movflags','+faststart',str(out/'jianle-quickstart.mp4')])
(out/'lessons.json').write_text(json.dumps(lessons,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'passed':True,'seconds':sum(c['duration'] for c in lessons),'chapters':6,'videoSize':[1280,800],'fps':30}),flush=True)
