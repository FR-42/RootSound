"""Render the code-native monochrome SVG geometry into desktop icon formats."""
from pathlib import Path
from io import BytesIO
import struct
from PIL import Image, ImageDraw

out=Path(__file__).resolve().parents[1]/'desktop/assets';out.mkdir(exist_ok=True)
svg='''<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<rect x="32" y="32" width="960" height="960" rx="196" fill="white"/>
<g fill="#868686"><polygon points="410,330 710,250 710,346 410,426"/>
<rect x="410" y="345" width="54" height="365"/><rect x="656" y="275" width="54" height="355"/>
<ellipse cx="365" cy="704" rx="104" ry="76" transform="rotate(-18 365 704)"/>
<ellipse cx="608" cy="630" rx="104" ry="76" transform="rotate(-18 608 630)"/></g></svg>'''
(out/'RootSound.svg').write_text(svg,encoding='utf-8')
s=4;image=Image.new('RGBA',(1024*s,1024*s));draw=ImageDraw.Draw(image)
draw.rounded_rectangle((32*s,32*s,992*s,992*s),radius=196*s,fill='white')
draw.polygon([(410*s,330*s),(710*s,250*s),(710*s,346*s),(410*s,426*s)],fill='#868686')
for x,y,w,h in [(410,345,54,365),(656,275,54,355)]:draw.rectangle((x*s,y*s,(x+w)*s,(y+h)*s),fill='#868686')
for x,y in [(365,704),(608,630)]:
    head=Image.new('RGBA',(208*s,152*s));ImageDraw.Draw(head).ellipse((0,0,208*s-1,152*s-1),fill='#868686')
    head=head.rotate(18,resample=Image.Resampling.BICUBIC,expand=True)
    image.alpha_composite(head,(round(x*s-head.width/2),round(y*s-head.height/2)))
image=image.resize((1024,1024),Image.Resampling.LANCZOS);image.save(out/'RootSound.png')
image.save(out/'RootSound.ico',format='ICO',sizes=[(n,n) for n in [16,24,32,48,64,128,256]])
chunks=[]
for tag,size in [('icp4',16),('icp5',32),('icp6',64),('ic07',128),('ic08',256),('ic09',512),('ic10',1024)]:
    data=BytesIO();image.resize((size,size),Image.Resampling.LANCZOS).save(data,format='PNG');raw=data.getvalue()
    chunks.append(tag.encode()+struct.pack('>I',len(raw)+8)+raw)
payload=b''.join(chunks);(out/'RootSound.icns').write_bytes(b'icns'+struct.pack('>I',len(payload)+8)+payload)
print('Created SVG, PNG, ICO and ICNS app icons.')
