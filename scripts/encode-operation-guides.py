"""Retina UI crops and measured beat comparisons. Output animated images only."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, sys
root=Path(sys.argv[1]) if len(sys.argv)>1 else Path(json.loads(Path('.test-output/rb135/latest.json').read_text())['root'])
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
out=Path('website/guides');out.mkdir(parents=True,exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',44)
small=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',32)
large=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',72)
FPS=30;W=1920;H=1080;PW=1840;PH=920

def ease(t):return t*t*(3-2*t)
def mix(a,b,t):return a+(b-a)*t

def cursor_at(frame,scene,previous,t,crop,area):
    p=scene['cursor'];old=previous['cursor'];x=mix(old['x'],p['x'],t);y=mix(old['y'],p['y'],t)
    left,top,right,bottom=crop;ax,ay,bx,by=area
    if not(left<=x<=right-12 and top<=y<=bottom-20):return
    x=ax+(x-left)*(bx-ax)/(right-left);y=ay+(y-top)*(by-ay)/(bottom-top);d=ImageDraw.Draw(frame)
    if p.get('down'):d.ellipse((x-22,y-22,x+22,y+22),outline='#7392b8',width=4)
    d.polygon([(x,y),(x,y+38),(x+10,y+28),(x+17,y+43),(x+24,y+40),(x+17,y+25),(x+32,y+25)],fill='white',outline='#344459',width=3)
    if '滚轮' in scene['keys']:
        d.rounded_rectangle((x+39,y-22,x+66,y+20),radius=12,fill='white',outline='#7392b8',width=3);d.line((x+52,y-15,x+52,y-3),fill='#7392b8',width=4)

def paste_crop(frame,raw,crop,area):
    ratio=manifest['pixelRatio'];ax,ay,bx,by=area
    picture=raw.transform((bx-ax,by-ay),Image.Transform.EXTENT,tuple(n*ratio for n in crop),resample=Image.Resampling.BICUBIC)
    frame.paste(picture,(ax,ay));picture.close()

def compose(raw,scene,previous,t):
    frame=Image.new('RGB',(W,H),'white');d=ImageDraw.Draw(frame)
    d.text((W/2,45),scene['label'],font=font,fill='#344459',anchor='mm')
    mode=scene.get('mode','normal');m=scene['metrics']
    if mode in ['bpm','cells']:
        dock=m['dock'];crop=(dock['x']-14,56,dock['x']+210,294);area=(70,265,625,855)
        d.text((335,170),'调整 BPM' if mode=='bpm' else '每拍格数',font=font,fill='#42536a',anchor='mm')
        paste_crop(frame,raw,crop,area);cursor_at(frame,scene,previous,t,crop,area)
        if mode=='bpm':
            crop=(330,60,1130,610);area=(735,170,1865,947);paste_crop(frame,raw,crop,area)
            d=ImageDraw.Draw(frame);d.text((1300,125),'保持相同缩放，观察拍线',font=small,fill='#67778b',anchor='mm')
            ratio=(area[3]-area[1])/(crop[3]-crop[1]);start=area[1]+(m['canvasY']-m['leftSeconds']*m['scale']-crop[1])*ratio
            height=m['scale']*60/m['bpm']*ratio
            x=1828;y0=round(start);y1=round(start+height)
            if 180<y0<y1<945:
                d.line((765,y0,1844,y0),fill='#6387b5',width=3);d.line((765,y1,1844,y1),fill='#6387b5',width=3)
                d.line((x,y0+3,x,y1-3),fill='#6387b5',width=4);d.line((x-9,y0,x+9,y0),fill='#6387b5',width=4);d.line((x-9,y1,x+9,y1),fill='#6387b5',width=4)
                d.rounded_rectangle((1640,(y0+y1)/2-28,1795,(y0+y1)/2+28),radius=7,fill='white');d.text((1718,(y0+y1)/2),'一拍',font=small,anchor='mm',fill='#456b9a')
            d.text((335,900),f"1 拍 = {60/m['bpm']:.2f} 秒",font=small,fill='#506b8f',anchor='mm')
            d.text((W/2,1020),'BPM 越大，拍线越密，节奏越快',font=small,fill='#697686',anchor='mm')
        else:
            d.text((1320,150),'同样长度的一拍',font=font,fill='#42536a',anchor='mm')
            for i,n in enumerate([2,3,4]):
                x=800+i*350;y=270;ww=240;hh=540;active=n==m['steps'];color='#567ba7' if active else '#c9d0d9'
                d.text((x+ww/2,220),f'{n} 格',font=font,fill='#3d5f88' if active else '#9ca6b3',anchor='mm')
                for cell in range(n):
                    a=y+hh*cell/n;b=y+hh*(cell+1)/n
                    d.rectangle((x,a,x+ww,b),fill='#e8f0fa' if active else '#f7f9fc',outline=color,width=3 if active else 2)
                    d.text((x+ww/2,(a+b)/2),str(cell+1),font=small,fill='#4e739e' if active else '#b2bac5',anchor='mm')
                d.text((x+ww/2,858),'1 拍',font=small,fill=color,anchor='mm')
            d.text((335,900),f"一拍分 {m['steps']} 格",font=small,fill='#506b8f',anchor='mm')
            d.text((W/2,1005),'每拍格数：把一拍分成几格',font=small,fill='#697686',anchor='mm')
        return frame
    c={k:mix(previous['camera'][k],scene['camera'][k],t) for k in ['cx','cy','w']}
    h=min(564,c['w']*PH/PW);left=max(0,min(1200-c['w'],c['cx']-c['w']/2));top=max(56,min(620-h,c['cy']-h/2))
    crop=(left,top,left+c['w'],top+h);area=(40,105,1880,1025);paste_crop(frame,raw,crop,area);cursor_at(frame,scene,previous,t,crop,area)
    if scene['keys']:
        text=scene['keys'];box=d.textbbox((0,0),text,font=small);width=box[2]-box[0]+34
        d.rounded_rectangle((W-40-width,18,W-40,75),radius=7,fill='#eff3f8');d.text((W-57,46),text,font=small,anchor='rm',fill='#536a86')
    return frame

selected=set(sys.argv[2].split(',')) if len(sys.argv)>2 else None
cached={c['id']:c for c in json.loads((out/'lessons.json').read_text(encoding='utf-8'))} if selected else {}
lessons=[];expected={'lessons.json'}
for chapter in manifest['lessons']:
    identity=chapter['id'];expected.update(identity+suffix for suffix in ['.jpg','.webp'])
    if selected and identity not in selected:
        lessons.append(cached[identity]|{k:chapter[k] for k in ['id','title','description','alt','version']});continue
    scenes=chapter['frames'];previous=scenes[0];clock=0;number=0;frames=[];durations=[]
    for scene in scenes:
        with Image.open(root/scene['file']) as source:raw=source.convert('RGB')
        end=clock+scene['duration']/1000;stop=round(end*FPS);transition=min(scene.get('transition',200)/1000,scene['duration']/1000)
        tween=scene['camera']!=previous['camera'] or any(scene['cursor'][k]!=previous['cursor'][k] for k in ['x','y'])
        held=False
        while number<stop:
            local=max(0,(number+1)/FPS-clock);t=ease(min(1,local/transition)) if transition>0 else 1
            dt=round((number+1)/FPS*1000)-round(number/FPS*1000)
            if held and (not tween or t==1):durations[-1]+=dt
            else:
                frames.append(compose(raw,scene,previous,t));durations.append(dt)
                held=not tween or t==1
            number+=1
        previous=scene;clock=end;raw.close()
    frames[0].save(out/(identity+'.jpg'),quality=96,subsampling=0)
    frames[0].save(out/(identity+'.webp'),save_all=True,append_images=frames[1:],duration=durations,loop=0,lossless=True,method=3)
    frames[round((len(frames)-1)*.6)].save(root/(identity+'-review.png'))
    for f in frames:f.close()
    lessons.append({k:chapter[k] for k in ['id','title','description','alt','version']}|{'duration':number/FPS,'width':W,'height':H})
    print(json.dumps({'id':identity,'seconds':number/FPS,'uniqueFrames':len(frames)}),flush=True)
(out/'lessons.json').write_text(json.dumps(lessons,ensure_ascii=False,indent=2),encoding='utf-8')
for file in out.iterdir():
    if file.is_file() and file.name not in expected:file.unlink()
print(json.dumps({'passed':True,'chapters':len(lessons),'videoFiles':0,'imageSize':[W,H],'sourcePixelRatio':manifest['pixelRatio'],'bytes':sum(p.stat().st_size for p in out.iterdir() if p.is_file())}),flush=True)
