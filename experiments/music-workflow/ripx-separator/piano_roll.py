"""Editable, scrollable Tk piano roll over actual MIDI note events."""
import math
import tkinter as tk
from tkinter import ttk,messagebox

from midi_document import validate_document

PALETTE=('#55b1f2','#a482ee','#39c3b2','#eeb85d','#ed88a9','#8cbf70')
NAMES=('C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B')


def note_name(pitch):return f'{NAMES[pitch%12]}{pitch//12-1}'


class PianoRoll(ttk.Frame):
    def __init__(self,parent,on_change=None,can_edit=lambda:True):
        super().__init__(parent)
        self.on_change=on_change;self.can_edit=can_edit
        self.document={'tracks':[],'bpm':120};self.scale=90.;self.height=18
        self.selection=set();self.items={};self.drag=None;self.pending=None
        self.undo_stack=[];self.redo_stack=[]
        self.filter=tk.StringVar(value='全部音轨');self.snap=tk.StringVar(value='1/16')
        self.detail=tk.StringVar(value='导入音频并开始分析，或直接导入 MIDI。')
        toolbar=ttk.Frame(self);toolbar.pack(fill='x',pady=(0,6))
        ttk.Label(toolbar,text='音轨').pack(side='left')
        self.tracks=ttk.Combobox(toolbar,textvariable=self.filter,values=['全部音轨'],state='readonly',width=22)
        self.tracks.pack(side='left',padx=(5,15));self.tracks.bind('<<ComboboxSelected>>',lambda event:self._schedule())
        ttk.Label(toolbar,text='吸附').pack(side='left')
        snapping=ttk.Combobox(toolbar,textvariable=self.snap,values=['自由','1/16','1/8','1/4','1/2'],state='readonly',width=8)
        snapping.pack(side='left',padx=5)
        ttk.Button(toolbar,text='−',width=3,command=lambda:self.zoom(.8)).pack(side='right')
        ttk.Button(toolbar,text='＋',width=3,command=lambda:self.zoom(1.25)).pack(side='right',padx=4)
        ttk.Button(toolbar,text='全曲',command=self.fit).pack(side='right',padx=(4,12))
        frame=ttk.Frame(self);frame.pack(fill='both',expand=True)
        frame.rowconfigure(1,weight=1);frame.columnconfigure(1,weight=1)
        self.ruler=tk.Canvas(frame,height=28,bg='#e9eef5',highlightthickness=0)
        self.ruler.grid(row=0,column=1,sticky='ew')
        self.keys=tk.Canvas(frame,width=64,bg='#edf1f6',highlightthickness=0)
        self.keys.grid(row=1,column=0,sticky='ns')
        ttk.Label(frame,text='音高',anchor='center',width=8).grid(row=0,column=0)
        self.canvas=tk.Canvas(frame,bg='#182333',highlightthickness=0,takefocus=True)
        self.canvas.grid(row=1,column=1,sticky='nsew')
        self.horizontal=ttk.Scrollbar(frame,orient='horizontal',command=self.canvas.xview)
        self.horizontal.grid(row=2,column=1,sticky='ew')
        self.vertical=ttk.Scrollbar(frame,orient='vertical',command=self.canvas.yview)
        self.vertical.grid(row=1,column=2,sticky='ns')
        self.canvas.configure(xscrollcommand=self._xscroll,yscrollcommand=self._yscroll)
        self.canvas.bind('<Configure>',lambda event:self._schedule())
        self.canvas.bind('<Button-1>',self.press)
        self.canvas.bind('<B1-Motion>',self.motion)
        self.canvas.bind('<ButtonRelease-1>',self.release)
        self.canvas.bind('<Double-1>',self.double_click)
        self.canvas.bind('<MouseWheel>',self.wheel)
        self.keys.bind('<MouseWheel>',self.wheel)
        self.canvas.bind('<Delete>',lambda event:self.delete_selected())
        self.canvas.bind('<BackSpace>',lambda event:self.delete_selected())
        self.canvas.bind('<Control-a>',self.select_all)
        self.canvas.bind('<Control-z>',lambda event:self.undo(False))
        self.canvas.bind('<Control-y>',lambda event:self.undo(True))
        self.canvas.bind('<Escape>',lambda event:self.clear_selection())
        ttk.Label(self,textvariable=self.detail).pack(anchor='w',pady=(6,0))
        ttk.Label(self,text='拖动移动 · 拖右侧改时长 · 双击编辑／添加 · Delete 删除 · Ctrl＋Z 撤销 · Ctrl＋滚轮缩放',foreground='#697990').pack(anchor='w',pady=(3,0))
        self._extent()

    def _notes(self):
        chosen=self.tracks.current()-1
        return [(index,note) for index,track in enumerate(self.document['tracks'])
            if chosen<0 or index==chosen for note in track['notes']]

    def set_document(self,document):
        validate_document(document);self.document=document;self.selection.clear()
        self.undo_stack.clear();self.redo_stack.clear();self.drag=None
        self.tracks.configure(values=['全部音轨']+[f'{i+1} · {t.get("name","音轨")}' for i,t in enumerate(document['tracks'])])
        self.tracks.current(0);self.scale=90.;self._extent()
        notes=self._notes();high=max((n['pitch'] for _,n in notes),default=76)
        self.canvas.yview_moveto(max(0,(127-min(127,high+4))*self.height)/(128*self.height))
        self.canvas.xview_moveto(0);self._details();self._schedule()

    def _extent(self):
        duration=max((n['end'] for t in self.document['tracks'] for n in t['notes']),default=12)
        width=max(self.canvas.winfo_width(),(duration+2)*self.scale,600)
        self.canvas.configure(scrollregion=(0,0,width,128*self.height))

    def _xscroll(self,*values):self.horizontal.set(*values);self._schedule()
    def _yscroll(self,*values):self.vertical.set(*values);self._schedule()
    def _schedule(self):
        if self.pending is None:self.pending=self.after_idle(self.draw)

    def draw(self):
        self.pending=None;self.canvas.delete('all');self.keys.delete('all');self.ruler.delete('all');self.items={}
        width=max(1,self.canvas.winfo_width());height=max(1,self.canvas.winfo_height())
        x0=self.canvas.canvasx(0);x1=x0+width;y0=self.canvas.canvasy(0);y1=y0+height
        low=max(0,127-int(y1/self.height));high=min(127,127-int(y0/self.height))
        for pitch in range(low,high+1):
            y=(127-pitch)*self.height;black=pitch%12 in (1,3,6,8,10)
            self.canvas.create_rectangle(x0,y,x1,y+self.height,fill='#1b293b' if black else '#202f43',outline='')
            self.canvas.create_line(x0,y+self.height,x1,y+self.height,fill='#354459' if pitch%12==0 else '#27374c')
            ky=y-y0
            self.keys.create_rectangle(0,ky,64,ky+self.height,fill='#cbd3de' if black else '#f7f9fc',outline='#a6b3c3')
            if black:self.keys.create_rectangle(0,ky,37,ky+self.height,fill='#344155',outline='')
            if pitch%12==0 or self.height>=20:self.keys.create_text(58,ky+self.height/2,text=note_name(pitch),anchor='e',fill='#21344a',font=('Segoe UI',8))
        bpm=float(self.document.get('bpm',120));beat=60/bpm
        step=beat
        while step*self.scale<18:step*=2
        first=max(0,math.floor(x0/self.scale/step))
        for index in range(first,math.ceil(x1/self.scale/step)+1):
            seconds=index*step;x=seconds*self.scale;is_bar=abs(seconds/beat/4-round(seconds/beat/4))<.00001
            self.canvas.create_line(x,y0,x,y1,fill='#455770' if is_bar else '#304159')
        ruler_step=1
        while ruler_step*self.scale<75:ruler_step*=2
        for second in range(max(0,int(x0/self.scale)//ruler_step*ruler_step),math.ceil(x1/self.scale)+1,ruler_step):
            x=second*self.scale-x0
            self.ruler.create_line(x,18,x,28,fill='#8697ab')
            self.ruler.create_text(x+4,9,text=f'{second//60}:{second%60:02}',anchor='w',fill='#394c63',font=('Segoe UI',9))
        shown=0
        for track,note in self._notes():
            left=note['start']*self.scale;right=note['end']*self.scale;y=(127-note['pitch'])*self.height
            if right<x0 or left>x1 or y+self.height<y0 or y>y1:continue
            selected=id(note) in self.selection
            color=PALETTE[track%len(PALETTE)]
            item=self.canvas.create_rectangle(left,y+2,max(left+3,right),y+self.height-2,
                fill='#f3d785' if selected else color,outline='#fff3bf' if selected else '#132132',width=2 if selected else 1)
            self.items[item]=(track,note)
            if right-left>42:
                label=self.canvas.create_text(left+5,y+self.height/2,text=note_name(note['pitch']),anchor='w',fill='#112133',font=('Segoe UI',8))
                self.items[label]=(track,note)
            shown+=1
        if not self._notes():
            self.canvas.create_text(x0+width/2,y0+height/2,text='MIDI 卷帘\n\n导入 MIDI，或开始分析音频',fill='#9bb0c9',justify='center',font=('Microsoft YaHei UI',14))

    def _hit(self,event):
        x=self.canvas.canvasx(event.x);y=self.canvas.canvasy(event.y)
        for item in reversed(self.canvas.find_overlapping(x-2,y-2,x+2,y+2)):
            if item in self.items:return self.items[item]
        return None

    def _quantize(self,seconds):
        divisor={'1/16':4,'1/8':2,'1/4':1,'1/2':.5}.get(self.snap.get())
        if divisor is None:return max(0,seconds)
        step=60/float(self.document.get('bpm',120))/divisor
        return max(0,round(seconds/step)*step)

    def press(self,event):
        self.canvas.focus_set();hit=self._hit(event);self.drag=None
        if hit is None:self.clear_selection();return
        _,note=hit;control=bool(event.state&0x4)
        if control:
            if id(note) in self.selection:self.selection.remove(id(note))
            else:self.selection.add(id(note))
        elif id(note) not in self.selection:self.selection={id(note)}
        x=self.canvas.canvasx(event.x);resize=abs(x-note['end']*self.scale)<=7
        self.drag={'x':x,'y':self.canvas.canvasy(event.y),'resize':resize,'changed':False,
            'notes':[(n,n['start'],n['end'],n['pitch']) for _,n in self._notes() if id(n) in self.selection]}
        self._details();self._schedule()

    def motion(self,event):
        if not self.drag or not self.can_edit():return
        drag=self.drag
        if not drag['notes']:return
        delta=(self.canvas.canvasx(event.x)-drag['x'])/self.scale
        pitch_delta=round((drag['y']-self.canvas.canvasy(event.y))/self.height)
        if drag['resize']:
            for note,start,end,pitch in drag['notes']:note['end']=max(start+.01,self._quantize(end+delta))
        else:
            delta=max(-min(start for _,start,_,_ in drag['notes']),delta)
            # Quantize one anchor, then retain chords' original relative timing.
            anchor=min(start for _,start,_,_ in drag['notes']);delta=self._quantize(anchor+delta)-anchor
            pitch_delta=max(-min(p for _,_,_,p in drag['notes']),min(127-max(p for _,_,_,p in drag['notes']),pitch_delta))
            for note,start,end,pitch in drag['notes']:note.update(start=start+delta,end=end+delta,pitch=pitch+pitch_delta)
        drag['changed']=any((n['start'],n['end'],n['pitch'])!=(start,end,pitch) for n,start,end,pitch in drag['notes'])
        self._details();self._schedule()

    def release(self,event):
        if self.drag and self.drag['changed']:
            updates=[(n,{'start':s,'end':e,'pitch':p,'velocity':n['velocity']},dict(n)) for n,s,e,p in self.drag['notes']]
            self._record('update',updates);self._changed()
        self.drag=None

    def _record(self,operation,changes):
        self.undo_stack.append((operation,changes));self.undo_stack=self.undo_stack[-100:];self.redo_stack.clear()

    def undo(self,redo=False):
        if not self.can_edit():return 'break'
        source=self.redo_stack if redo else self.undo_stack
        target=self.undo_stack if redo else self.redo_stack
        if not source:return 'break'
        operation,changes=source.pop()
        if operation=='update':
            for note,before,after in changes:note.update(after if redo else before)
        else:
            insert=(operation=='add')==redo
            for track,position,note in sorted(changes,key=lambda item:(item[0],item[1])):
                notes=self.document['tracks'][track]['notes']
                if insert:notes.insert(min(position,len(notes)),note)
                else:notes[:]=[value for value in notes if value is not note]
        target.append((operation,changes));self.selection.clear();self.drag=None;self._changed();return 'break'

    def _changed(self):
        self._extent();self._details();self._schedule()
        if self.on_change:self.on_change(self.document)

    def clear_selection(self):self.selection.clear();self._details();self._schedule()
    def select_all(self,event=None):self.selection={id(n) for _,n in self._notes()};self._details();self._schedule();return 'break'
    def delete_selected(self):
        if not self.can_edit() or not self.selection:return
        deleted=[(index,position,note) for index,track in enumerate(self.document['tracks'])
            for position,note in enumerate(track['notes']) if id(note) in self.selection]
        self._record('delete',deleted)
        for track in self.document['tracks']:track['notes'][:]=[n for n in track['notes'] if id(n) not in self.selection]
        self.selection.clear();self._changed()

    def _details(self):
        selected=[n for _,n in self._notes() if id(n) in self.selection];total=sum(len(t['notes']) for t in self.document['tracks'])
        if len(selected)==1:
            n=selected[0];self.detail.set(f"{note_name(n['pitch'])}  ·  {n['start']:.3f}–{n['end']:.3f} 秒  ·  力度 {n['velocity']}  |  共 {total} 个音符")
        else:self.detail.set(f"共 {total} 个音符  ·  选中 {len(selected)} 个  ·  {float(self.document.get('bpm',120)):g} BPM 网格")

    def double_click(self,event):
        if not self.can_edit():return
        hit=self._hit(event);new=hit is None
        if new:
            start=self._quantize(self.canvas.canvasx(event.x)/self.scale)
            pitch=max(0,min(127,127-int(self.canvas.canvasy(event.y)/self.height)))
            note={'pitch':pitch,'start':start,'end':start+60/float(self.document.get('bpm',120))/4,'velocity':90}
            track=max(0,self.tracks.current()-1)
        else:track,note=hit
        dialog=tk.Toplevel(self);dialog.title('添加音符' if new else '编辑音符');dialog.transient(self.winfo_toplevel());dialog.grab_set()
        variables={}
        for row,(key,label) in enumerate((('pitch','音高 0–127'),('start','开始 / 秒'),('end','结束 / 秒'),('velocity','力度 1–127'))):
            ttk.Label(dialog,text=label).grid(row=row,column=0,padx=15,pady=8)
            variables[key]=tk.StringVar(value=str(note[key]));ttk.Entry(dialog,textvariable=variables[key]).grid(row=row,column=1,padx=15,pady=8)
        def save():
            try:
                value={k:int(v.get()) if k in ('pitch','velocity') else float(v.get()) for k,v in variables.items()}
                validate_document({'tracks':[{'notes':[value]}]})
            except (ValueError,KeyError):return messagebox.showerror('数值无效','请检查音高、时间和力度范围。',parent=dialog)
            if new:
                if not self.document['tracks']:
                    self.document['tracks'].append({'name':'音轨 1','program':0,'channel':0,'notes':[]})
                    self.tracks.configure(values=['全部音轨','1 · 音轨 1'])
                position=len(self.document['tracks'][track]['notes'])
                self.document['tracks'][track]['notes'].append(value);self.selection={id(value)}
                self._record('add',[(track,position,value)])
            else:
                self._record('update',[(note,dict(note),dict(value))])
                note.update(value);self.selection={id(note)}
            dialog.destroy();self.drag=None;self._changed()
        ttk.Button(dialog,text='确定',command=save).grid(row=4,column=0,columnspan=2,pady=12)

    def zoom(self,factor,anchor=None):
        x=max(0,self.canvas.canvasx(0));offset=self.canvas.winfo_width()/2 if anchor is None else anchor
        time=(x+offset)/self.scale;self.scale=max(.02,min(1600,self.scale*factor));self._extent()
        total=float(self.canvas.cget('scrollregion').split()[2]);self.canvas.xview_moveto(max(0,time*self.scale-offset)/total);self._schedule()

    def fit(self):
        duration=max((n['end'] for t in self.document['tracks'] for n in t['notes']),default=12)
        self.scale=max(.02,min(500,(max(300,self.canvas.winfo_width())-25)/max(1,duration+1)))
        self._extent();self.canvas.xview_moveto(0);self._schedule()

    def wheel(self,event):
        delta=-1 if event.delta>0 else 1
        if event.state&0x4:self.zoom(1.2 if delta<0 else 1/1.2,anchor=event.x)
        elif event.state&0x1:self.canvas.xview_scroll(delta*3,'units')
        else:self.canvas.yview_scroll(delta*3,'units')
        self._schedule();return 'break'
