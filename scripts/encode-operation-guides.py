"""Encode captured own-app frames as GIF/WebP and subtitled MP4 chapters."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import json, subprocess, sys

video_only='--video-only' in sys.argv
arguments=[arg for arg in sys.argv[1:] if arg!='--video-only']
root=Path(arguments[0]) if arguments else Path(json.loads(Path('.test-output/rb131/latest.json').read_text())['root'])
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
output=Path('website/guides');output.mkdir(parents=True,exist_ok=True)
chapters=[]
font_path='C:/Windows/Fonts/msyh.ttc'
heading_font=ImageFont.truetype(font_path,23)
caption_font=ImageFont.truetype(font_path,25)
detail_font=ImageFont.truetype(font_path,18)
brand_font=ImageFont.truetype(font_path,14)
def run(args):
    process=subprocess.run(args,capture_output=True,text=True)
    if process.returncode:raise RuntimeError(process.stderr[-3000:])
def stamp(seconds):
    ms=round(seconds*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}'
for lesson in manifest['lessons']:
    identity=lesson['id'];frames=lesson['frames'];duration=lesson['duration']/1000
    images=[]
    for frame in frames:
        image=Image.open(root/frame['file']).convert('RGB')
        assert image.size==(1280,820),image.size
        # Burn the authored titles/subtitles deterministically. Hidden compositor
        # captures can otherwise show a caption one paint behind the UI action.
        draw=ImageDraw.Draw(image)
        draw.rectangle((0,0,1279,71),fill='#f4f5f7')
        draw.rectangle((0,708,1279,819),fill='#f4f5f7')
        draw.text((40,23),identity[:2]+' / '+lesson['title'],font=heading_font,fill='#252a30')
        draw.text((1120,28),'简乐 · 操作演示',font=brand_font,fill='#747d89')
        draw.text((40,720),frame['caption'],font=caption_font,fill='#252a30')
        draw.text((40,766),frame['detail'],font=detail_font,fill='#586576')
        # Leave room below subtitles for the browser's native video controls.
        finished=root/('sub-'+frame['file']);padded=ImageOps.expand(image,border=(0,0,0,80),fill='#f4f5f7');padded.save(finished);padded.close()
        images.append(image)
    durations=[frame['duration'] for frame in frames]
    poster=ImageOps.expand(images[0],border=(0,0,0,80),fill='#f4f5f7');poster.save(output/(identity+'.jpg'),quality=92,subsampling=0);poster.close()
    palette=[]
    if not video_only:
        images[0].save(output/(identity+'.webp'),save_all=True,append_images=images[1:],duration=durations,loop=0,lossless=True,method=4)
        palette=[image.quantize(colors=192,dither=Image.Dither.NONE) for image in images]
        palette[0].save(output/(identity+'.gif'),save_all=True,append_images=palette[1:],duration=durations,loop=0,optimize=True,disposal=1)
    for image in images+palette:image.close()
    listing=root/(identity+'.ffconcat')
    listing.write_text('ffconcat version 1.0\n'+''.join(f"file '{(root/('sub-'+f['file'])).as_posix()}'\nduration {f['duration']/1000:.3f}\n" for f in frames)+f"file '{(root/('sub-'+frames[-1]['file'])).as_posix()}'\n",encoding='utf-8')
    command=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(listing),'-f','lavfi','-i','anullsrc=r=44100:cl=stereo']
    if lesson.get('audio'):
        command+=['-i',str(root/lesson['audio'])]
        windows=lesson['audioWindows'];count=len(windows)
        filters=[f"[2:a]asplit={count}"+''.join(f'[a{i}]' for i in range(count))]
        for i,window in enumerate(windows):
            filters.append(f"[a{i}]atrim=start={window['from']}:duration={window['duration']},asetpts=PTS-STARTPTS,adelay={round(window['at']*1000)}:all=1[s{i}]")
        filters.append('[1:a]'+''.join(f'[s{i}]' for i in range(count))+f'amix=inputs={count+1}:duration=first:normalize=0[sound]')
        command+=['-filter_complex',';'.join(filters),'-map','0:v:0','-map','[sound]']
    else:command+=['-map','0:v:0','-map','1:a:0']
    command+=['-vf','fps=15,format=yuv420p','-c:v','libx264','-preset','fast','-crf','19','-c:a','aac','-b:a','96k','-t',str(duration),'-movflags','+faststart',str(output/(identity+'.mp4'))]
    run(command)
    text=[];time=0
    for frame in frames:
        line=frame['caption']+'\n'+frame['detail'];end=time+frame['duration']/1000
        if text and text[-1]['line']==line:text[-1]['end']=end
        else:text.append({'start':time,'end':end,'line':line})
        time=end
    (output/(identity+'.vtt')).write_text('WEBVTT\n\n'+'\n\n'.join(f"{stamp(item['start'])} --> {stamp(item['end'])}\n{item['line']}" for item in text)+'\n',encoding='utf-8')
    chapters.append({key:lesson[key] for key in ['id','title','summary']}|{'duration':duration,'hasAudio':bool(lesson.get('audio')),'steps':list(dict.fromkeys(frame['caption']+'：'+frame['detail'] for frame in frames))})
    print(json.dumps({'chapter':identity,'seconds':duration,'gifBytes':(output/(identity+'.gif')).stat().st_size,'mp4Bytes':(output/(identity+'.mp4')).stat().st_size}),flush=True)
combined=root/'combined.ffconcat';combined.write_text('ffconcat version 1.0\n'+''.join(f"file '{(output/(lesson['id']+'.mp4')).resolve().as_posix()}'\n" for lesson in chapters),encoding='utf-8')
run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(combined),'-c:v','copy','-c:a','aac','-b:a','96k','-movflags','+faststart',str(output/'jianle-quickstart.mp4')])
(output/'lessons.json').write_text(json.dumps(chapters,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'passed':True,'chapters':len(chapters),'totalSeconds':sum(c['duration'] for c in chapters),'output':str(output.resolve())}),flush=True)
