"""Small note-document/SMF adapter. No audio decoding or pitch recognition."""
from collections import defaultdict, deque
from pathlib import Path
import bisect
import json
import math
import os
import struct
import tempfile


def _variable(data,position):
    value=0
    for _ in range(4):
        if position>=len(data):raise ValueError('MIDI事件被截断')
        byte=data[position];position+=1;value=(value<<7)|(byte&127)
        if not byte&128:return value,position
    raise ValueError('MIDI变长整数超过格式范围')


def _vlq(value):
    if not 0<=value<=0x0fffffff:raise ValueError('MIDI时间间隔超出格式范围')
    result=[value&127]
    while value>127:value>>=7;result.append((value&127)|128)
    return bytes(reversed(result))


def read_midi(path):
    """Read all note events, including running status and tempo changes."""
    path=Path(path)
    if path.stat().st_size>32*1024**2:raise ValueError('MIDI文件超过32MiB读取容量')
    data=path.read_bytes()
    if data[:4]!=b'MThd' or len(data)<14:raise ValueError('不是标准MIDI文件')
    size=struct.unpack_from('>I',data,4)[0]
    if size<6 or 8+size>len(data):raise ValueError('MIDI文件头不完整')
    kind,count,division=struct.unpack_from('>HHH',data,8)
    if kind not in (0,1):raise ValueError('目前支持同步的MIDI 0/1文件')
    if not division or division&0x8000:raise ValueError('目前支持以拍为时间单位的MIDI文件')
    cursor=8+size;tempos=[(0,500000)];raw_tracks=[];event_count=0
    for index in range(count):
        if cursor+8>len(data) or data[cursor:cursor+4]!=b'MTrk':raise ValueError('MIDI音轨不完整')
        length=struct.unpack_from('>I',data,cursor+4)[0];cursor+=8
        if cursor+length>len(data):raise ValueError('MIDI音轨被截断')
        chunk=data[cursor:cursor+length];cursor+=length
        position=tick=0;running=None;active=defaultdict(deque);notes=[];programs={};name=f'音轨 {index+1}'
        while position<len(chunk):
            delta,position=_variable(chunk,position);tick+=delta
            if position>=len(chunk):raise ValueError('MIDI事件缺少状态')
            status=chunk[position]
            if status&128:position+=1
            elif running is not None:status=running
            else:raise ValueError('MIDI缺少运行状态')
            event_count+=1
            if event_count>2000000:raise ValueError('MIDI事件超过界面读取容量')
            if status==255:
                # Meta events do not replace the preceding channel status.
                # Matches the installed mido SMF reader's owning boundary.
                if position>=len(chunk):raise ValueError('MIDI元事件不完整')
                meta=chunk[position];position+=1;size,position=_variable(chunk,position)
                if position+size>len(chunk):raise ValueError('MIDI元事件被截断')
                body=chunk[position:position+size];position+=size
                if meta==81 and size==3:
                    tempo=int.from_bytes(body,'big')
                    if tempo:tempos.append((tick,tempo))
                elif meta==3:name=body.decode('utf8',errors='replace')
                elif meta==47:break
                continue
            if status in (240,247):
                running=None;size,position=_variable(chunk,position)
                if position+size>len(chunk):raise ValueError('MIDI系统事件被截断')
                position+=size;continue
            if not 128<=status<240:raise ValueError('不支持此MIDI系统事件')
            running=status;operation=status>>4;channel=status&15
            size=1 if operation in (12,13) else 2
            values=chunk[position:position+size];position+=size
            if len(values)!=size or any(v>127 for v in values):raise ValueError('MIDI通道事件不完整')
            if operation==12:programs[channel]=values[0]
            elif operation==9 and values[1]:active[(channel,values[0])].append((tick,values[1]))
            elif operation==8 or operation==9:
                queue=active[(channel,values[0])]
                if queue:
                    start,velocity=queue.popleft()
                    if tick>start:notes.append((start,tick,values[0],velocity,channel))
        # A missing note-off ends at the recorded track boundary, never infinity.
        for (channel,pitch),queue in active.items():
            for start,velocity in queue:
                if tick>start:notes.append((start,tick,pitch,velocity,channel))
        raw_tracks.append((name,programs,notes))
    ordered={}
    for tick,tempo in sorted(tempos,key=lambda item:item[0]):ordered[tick]=tempo
    ticks=sorted(ordered);seconds=[0.0]
    for index in range(1,len(ticks)):
        seconds.append(seconds[-1]+(ticks[index]-ticks[index-1])*ordered[ticks[index-1]]/division/1000000)
    def time(tick):
        index=bisect.bisect_right(ticks,tick)-1
        return seconds[index]+(tick-ticks[index])*ordered[ticks[index]]/division/1000000
    tracks=[]
    for name,programs,events in raw_tracks:
        channels=sorted({event[4] for event in events})
        for channel in channels:
            tracks.append({'name':name if len(channels)==1 else f'{name} · {channel+1}',
                'program':programs.get(channel,0),'channel':channel,
                'notes':[{'pitch':pitch,'velocity':velocity,'start':time(start),'end':time(end)}
                    for start,end,pitch,velocity,ch in events if ch==channel]})
    return {'name':path.stem,'bpm':60000000/ordered[0],'tracks':tracks,'source':str(path)}


def validate_document(document):
    bpm=float(document.get('bpm',120))
    if not math.isfinite(bpm) or not 1<=bpm<=1000:raise ValueError('MIDI速度坐标无效')
    tracks=document.get('tracks')
    if not isinstance(tracks,list) or len(tracks)>1024:raise ValueError('MIDI音轨列表无效')
    total=0
    for track in tracks:
        if not isinstance(track.get('notes'),list):raise ValueError('MIDI音符列表无效')
        program=track.get('program',0);channel=track.get('channel',0)
        if type(program) is not int or not 0<=program<=127 or type(channel) is not int or not 0<=channel<=15:
            raise ValueError('MIDI音色或通道无效')
        for note in track['notes']:
            if type(note['pitch']) is not int or not 0<=note['pitch']<=127 or type(note['velocity']) is not int or not 1<=note['velocity']<=127:
                raise ValueError('音符的音高或力度超出范围')
            if type(note['start']) not in (int,float) or type(note['end']) not in (int,float):
                raise ValueError('音符时间必须是数值')
            start,end=float(note['start']),float(note['end'])
            if not math.isfinite(start) or not math.isfinite(end) or not 0<=start<end:raise ValueError('音符起止时间无效')
        total+=len(track['notes'])
        if total>200000:raise ValueError('MIDI音符超过界面编辑容量')
    return document


def midi_bytes(document):
    validate_document(document);bpm=float(document.get('bpm',120));ppq=480
    tempo=min(0xffffff,max(1,round(60000000/bpm)))
    tracks=[b'\0\xff\x51\x03'+tempo.to_bytes(3,'big')+b'\0\xff\x2f\0']
    for index,track in enumerate(document['tracks']):
        channel=track.get('channel',index%16);program=track.get('program',0)
        name=track.get('name',f'音轨 {index+1}').encode('utf8')
        body=bytearray(b'\0\xff\x03'+_vlq(len(name))+name+b'\0'+bytes((0xc0|channel,program)))
        events=[]
        for ordinal,note in enumerate(track['notes']):
            start=round(note['start']*ppq*1000000/tempo);end=max(start+1,round(note['end']*ppq*1000000/tempo))
            events.extend(((start,1,ordinal,bytes((0x90|channel,note['pitch'],note['velocity']))),
                (end,0,ordinal,bytes((0x80|channel,note['pitch'],0)))))
        previous=0
        for tick,_,_,message in sorted(events):body.extend(_vlq(tick-previous));body.extend(message);previous=tick
        body.extend(b'\0\xff\x2f\0');tracks.append(bytes(body))
    return b'MThd'+struct.pack('>IHHH',6,1,len(tracks),ppq)+b''.join(b'MTrk'+struct.pack('>I',len(body))+body for body in tracks)


def save_document(document,path):
    """New export only; leave imported/native MIDI and reconstruction intact."""
    path=Path(path);data=midi_bytes(document)
    with path.open('xb') as target:target.write(data)


def export_rootsound_notes(request,report,config,root):
    import subprocess
    root=Path(root);cache=root/'.cache';cache.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='midi-edit-',dir=cache) as temporary:
        work=Path(temporary);midi=work/'edited.mid';save_document(request['document'],midi)
        payload={'mode':'notes','name':request.get('name','原生音符 · 编辑'),
            'destination':request.get('destination',str(root.parents[2]/'project')),'midi':str(midi)}
        path=work/'request.json';path.write_text(json.dumps(payload,ensure_ascii=False),encoding='utf8')
        report(.3,'保存当前卷帘中的音符到RootSound工程')
        result=subprocess.run([config.get('node','node'),'--max-old-space-size=8192',str(root/'rootsound-export.mjs'),str(path)],
            capture_output=True,text=True,encoding='utf8',creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
        if result.returncode:raise RuntimeError(result.stderr[-4000:])
        output=json.loads(result.stdout)
        for warning in output.get('warnings',[]):report(.95,warning)
        report(1,'音符工程已保存',result=output['path'])
