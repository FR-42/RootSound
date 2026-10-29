from bootstrap import ROOT, CONFIG
from pathlib import Path
import datetime, json, os, queue, subprocess, sys, threading, uuid, winsound
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

class Application(tk.Tk):
    def __init__(self, hidden=False):
        super().__init__()
        if hidden: self.withdraw()
        self.title('RipX音色分离 · 独立实验版')
        self.geometry('1180x800'); self.minsize(1050,700)
        self.configure(bg='#f3f5f9')
        self.source=tk.StringVar(); self.mode=tk.StringVar(value='4')
        self.want_midi=tk.BooleanVar(value=False); self.status=tk.StringVar(value='导入音频，选择分轨模式，然后开始。')
        self.output=tk.StringVar(value=str(ROOT/'output'))
        self.events=queue.Queue(); self.process=None; self.busy=False; self.project=None
        self.notes=None; self.note_refs={}; self.controls=[]; self.stem_vars={}; self.callback=None
        style=ttk.Style(self); style.theme_use('clam')
        style.configure('.',font=('Microsoft YaHei UI',10))
        style.configure('TFrame',background='#f3f5f9'); style.configure('TLabel',background='#f3f5f9')
        style.configure('Title.TLabel',font=('Microsoft YaHei UI',23,'bold'),foreground='#17283e')
        style.configure('TButton',padding=(12,7)); style.configure('Treeview',rowheight=27)
        outer=ttk.Frame(self,padding=22); outer.pack(fill='both',expand=True)
        ttk.Label(outer,text='RipX 音色分离',style='Title.TLabel').pack(anchor='w')
        ttk.Label(outer,text='本地 AI 分轨  /  自由组合音轨  /  音频转 MIDI',foreground='#52667e').pack(anchor='w',pady=(3,14))
        row=ttk.Frame(outer); row.pack(fill='x')
        self.button(row,'导入音频',self.choose_input).pack(side='left')
        ttk.Entry(row,textvariable=self.source,state='readonly').pack(side='left',fill='x',expand=True,padx=8)
        self.button(row,'打开已有结果',self.open_project).pack(side='right')
        settings=ttk.Frame(outer); settings.pack(fill='x',pady=12)
        for label,value in [('四轨：人声 / 鼓 / 贝斯 / 其他','4'),('六轨：再分吉他 / 钢琴','6')]:
            control=ttk.Radiobutton(settings,text=label,variable=self.mode,value=value); control.pack(side='left',padx=(0,20)); self.controls.append(control)
        control=ttk.Checkbutton(settings,text='实验性 MIDI（Basic Pitch，非 RipX）',variable=self.want_midi); control.pack(side='left'); self.controls.append(control)
        self.device=tk.StringVar(value='gpu')
        backend=ttk.Frame(outer); backend.pack(fill='x',pady=(0,8))
        ttk.Label(backend,text='运算设备：').pack(side='left')
        for label,value in [('GPU（Intel Arc / XPU）','gpu'),('CPU（兼容模式）','cpu')]:
            control=ttk.Radiobutton(backend,text=label,variable=self.device,value=value); control.pack(side='left',padx=(0,18)); self.controls.append(control)
        pathrow=ttk.Frame(outer); pathrow.pack(fill='x',pady=(0,12))
        ttk.Label(pathrow,text='保存目录').pack(side='left')
        ttk.Entry(pathrow,textvariable=self.output,state='readonly').pack(side='left',fill='x',expand=True,padx=10)
        self.button(pathrow,'选择目录',self.choose_output).pack(side='left')
        self.button(pathrow,'开始分离',self.start).pack(side='left',padx=(12,0))
        self.cancel_button=ttk.Button(pathrow,text='取消',command=self.cancel,state='disabled'); self.cancel_button.pack(side='left',padx=(8,0))
        self.tabs=ttk.Notebook(outer); self.tabs.pack(fill='both',expand=True)
        self.stems_page=ttk.Frame(self.tabs,padding=16); self.tabs.add(self.stems_page,text='  音轨与混音  ')
        ttk.Label(self.stems_page,text='勾选要保留的音轨，可调整音量。原始分轨 WAV 已保存在结果目录。').pack(anchor='w')
        self.stem_area=ttk.Frame(self.stems_page); self.stem_area.pack(fill='both',expand=True,pady=10)
        ttk.Label(self.stem_area,text='分离完成后，音轨会显示在这里。',foreground='#708095').pack(pady=50)
        buttons=ttk.Frame(self.stems_page); buttons.pack(fill='x')
        self.button(buttons,'试听所选组合',self.preview).pack(side='left')
        ttk.Button(buttons,text='停止试听',command=lambda:winsound.PlaySound(None,0)).pack(side='left',padx=8)
        self.button(buttons,'导出所选组合 WAV',self.export_mix).pack(side='left')
        ttk.Button(buttons,text='打开结果文件夹',command=self.open_folder).pack(side='right')
        exports=ttk.Frame(self.stems_page); exports.pack(fill='x',pady=(8,0))
        self.button(exports,'导出 RootSound 原音工程',lambda:self.export_rootsound('audio')).pack(side='left')
        self.button(exports,'导出 RootSound 音符工程',lambda:self.export_rootsound('notes')).pack(side='left',padx=8)
        notespage=ttk.Frame(self.tabs,padding=12); self.tabs.add(notespage,text='  MIDI 音符  ')
        ttk.Label(notespage,text='此页为 Basic Pitch 实验功能，非 RipX 原生转录。双击可编辑音高、时间和力度。').pack(anchor='w',pady=(0,8))
        table=ttk.Frame(notespage); table.pack(fill='both',expand=True)
        self.tree=ttk.Treeview(table,columns=('track','pitch','start','end','velocity'),show='headings',selectmode='extended')
        for key,label,width in [('track','声部',130),('pitch','MIDI 音高',100),('start','起点 / 秒',130),('end','终点 / 秒',130),('velocity','力度',90)]:
            self.tree.heading(key,text=label); self.tree.column(key,width=width,anchor='center')
        scrollbar=ttk.Scrollbar(table,command=self.tree.yview); self.tree.configure(yscrollcommand=scrollbar.set)
        self.tree.pack(side='left',fill='both',expand=True); scrollbar.pack(side='right',fill='y')
        self.tree.bind('<Double-1>',lambda event:self.edit_note())
        tools=ttk.Frame(notespage); tools.pack(fill='x',pady=(10,0))
        self.button(tools,'转录 / 重新转录 MIDI',self.transcribe).pack(side='left')
        self.button(tools,'编辑音符',self.edit_note).pack(side='left',padx=8)
        self.button(tools,'删除所选音符',self.delete_notes).pack(side='left')
        self.button(tools,'导出修改后的 MIDI',self.export_notes).pack(side='right')
        logpage=ttk.Frame(self.tabs,padding=10); self.tabs.add(logpage,text='  运行记录  ')
        self.log=tk.Text(logpage,wrap='word',height=6,state='disabled',font=('Consolas',10)); self.log.pack(fill='both',expand=True)
        self.progress=ttk.Progressbar(outer,maximum=100); self.progress.pack(fill='x',pady=(12,6))
        ttk.Label(outer,textvariable=self.status,wraplength=1020).pack(anchor='w')
        ttk.Label(outer,text='RipX 原生音符核心仍在解析。当前分轨为 Demucs；可选 Basic Pitch MIDI 不代表 RipX 算法。',foreground='#6b7788').pack(anchor='w',pady=(8,0))
        self.protocol('WM_DELETE_WINDOW',self.close)
        self.after(120,self.poll)

    def button(self,parent,text,command):
        control=ttk.Button(parent,text=text,command=command); self.controls.append(control); return control

    def choose_input(self):
        path=filedialog.askopenfilename(title='选择音频',filetypes=[('音频','*.wav *.mp3 *.flac *.ogg *.m4a *.aac *.aiff *.wma'),('所有文件','*.*')])
        if path: self.source.set(path)

    def choose_output(self):
        path=filedialog.askdirectory(title='保存目录',initialdir=self.output.get())
        if path: self.output.set(path)

    def start(self):
        if not Path(self.source.get()).is_file(): return messagebox.showinfo('导入音频','请先选择一个音频文件。')
        job=Path(self.output.get())/(datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'-'+uuid.uuid4().hex[:6])
        self.run_job({'action':'separate','input':self.source.get(),'mode':self.mode.get(),'device':self.device.get(),'midi':self.want_midi.get(),'job':str(job)},self.load_project)

    def run_job(self,request,callback):
        if self.busy: return
        winsound.PlaySound(None,0)
        self.busy=True; self.cancelled=False; self.cancel_event=threading.Event(); self.callback=callback; self.current_request=request
        for control in self.controls: control.configure(state='disabled')
        self.cancel_button.configure(state='normal'); self.progress['value']=0; self.status.set('启动本地处理…')
        cache=ROOT/'.cache'; cache.mkdir(exist_ok=True)
        request_file=cache/(uuid.uuid4().hex+'.json'); request_file.write_text(json.dumps(request,ensure_ascii=False),encoding='utf8')
        def work():
            result=None; lines=[]
            try:
                info=dict(stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding='utf8',errors='replace',creationflags=subprocess.CREATE_NO_WINDOW)
                env=os.environ.copy(); env['PYTHONIOENCODING']='utf-8'
                with subprocess.Popen([CONFIG['python'],'-u',str(ROOT/'engine.py'),str(request_file)],env=env,**info) as process:
                    self.process=process
                    if self.cancel_event.is_set():
                        subprocess.run(['taskkill','/PID',str(process.pid),'/T','/F'],capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
                    for line in process.stdout:
                        lines.append(line); lines=lines[-60:]
                        try:
                            item=json.loads(line)
                            if 'progress' not in item: raise ValueError()
                            result=item.get('result',result); self.events.put(('progress',item))
                        except (ValueError,TypeError): self.events.put(('log',line))
                    code=process.wait()
                if code!=0 and request.get('action')=='separate':
                    # Only scratch children of this newly allocated job are disposable.
                    import shutil
                    job=Path(request['job']).resolve()
                    if (job/'status.json').is_file():
                        for child in job.iterdir():
                            if child.is_dir() and child.resolve().parent==job and child.name.startswith(('.work-','.midi-')):
                                shutil.rmtree(child)
                        (job/'status.json').write_text(json.dumps({'status':'cancelled' if self.cancel_event.is_set() else 'failed'}),encoding='utf8')
                self.events.put(('done',(code,result,''.join(lines))))
            except Exception as error: self.events.put(('done',(-1,None,str(error))))
            finally: request_file.unlink(missing_ok=True)
        threading.Thread(target=work,daemon=True).start()

    def poll(self):
        try:
            while True:
                kind,value=self.events.get_nowait()
                if kind=='progress':
                    self.progress['value']=value['progress']*100; self.status.set(value['message']); self.append_log(value['message']+'\n')
                elif kind=='log': self.append_log(value)
                else:
                    self.busy=False; self.process=None
                    for control in self.controls: control.configure(state='normal')
                    self.cancel_button.configure(state='disabled')
                    code,result,error=value
                    if code==0 and result:
                        if self.callback:
                            try: self.callback(result)
                            except Exception as error:
                                self.status.set('无法读取结果。'); messagebox.showerror('结果读取失败',str(error))
                    else:
                        self.status.set('处理已取消。' if getattr(self,'cancelled',False) else '处理失败；请查看运行记录。')
                        if not getattr(self,'cancelled',False): messagebox.showerror('处理失败',error[-2500:])
                        # A complete separation can survive a later MIDI cancellation.
                        job=self.current_request.get('job')
                        if job and (Path(job)/'project.json').exists(): self.load_project(str(Path(job)/'project.json'))
                    self.cancelled=False
        except queue.Empty: pass
        self.after(120,self.poll)

    def append_log(self,text):
        self.log.configure(state='normal'); self.log.insert('end',text)
        if int(self.log.index('end-1c').split('.')[0])>1500: self.log.delete('1.0','300.0')
        self.log.see('end'); self.log.configure(state='disabled')

    def cancel(self):
        self.cancel_event.set(); self.cancelled=True
        process=self.process
        if process is None or process.poll() is not None: return
        self.cancelled=True; self.cancel_button.configure(state='disabled'); self.status.set('正在停止处理…')
        def kill():
            subprocess.run(['taskkill','/PID',str(process.pid),'/T','/F'],capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
        threading.Thread(target=kill,daemon=True).start()

    def close(self):
        if self.busy:
            if not messagebox.askyesno('正在处理','停止当前任务并退出？'): return
            self.cancel()
            self.after(150,self.close_after_job); return
        winsound.PlaySound(None,0); self.destroy()

    def close_after_job(self):
        if self.busy: self.after(150,self.close_after_job)
        else: winsound.PlaySound(None,0); self.destroy()

    def open_project(self):
        path=filedialog.askopenfilename(title='打开结果 project.json',initialdir=self.output.get(),filetypes=[('分离项目','project.json')])
        if path:
            try: self.load_project(path)
            except Exception as error: messagebox.showerror('打开失败',str(error))

    def load_project(self,path):
        project=Path(path); manifest=json.loads(project.read_text(encoding='utf8'))
        if manifest.get('version')!=1: raise ValueError('无法识别的项目版本。')
        for item in manifest['stems']:
            if Path(item['file']).name!=item['file'] or not (project.parent/item['file']).is_file(): raise ValueError('项目音轨缺失或路径无效。')
        self.project=project; self.manifest=manifest; self.source.set(manifest['source'])
        for child in self.stem_area.winfo_children(): child.destroy()
        self.stem_vars={}
        for stem in [*manifest['stems'],{'name':'residual','label':'残余（用于完整重建）'}]:
            name=stem['name']; row=ttk.Frame(self.stem_area); row.pack(fill='x',pady=4)
            enabled=tk.BooleanVar(value=name!='residual'); gain=tk.DoubleVar(value=100)
            ttk.Checkbutton(row,text=stem['label'],variable=enabled,width=26).pack(side='left')
            ttk.Scale(row,from_=0,to=200,variable=gain).pack(side='left',fill='x',expand=True,padx=16)
            value=ttk.Label(row,width=8); value.pack(side='left')
            def update(*args,v=gain,label=value): label.configure(text=f'{v.get():.0f}%')
            gain.trace_add('write',update); update()
            self.stem_vars[name]=(enabled,gain)
        self.notes=None
        if manifest.get('notes'): self.notes=json.loads((project.parent/manifest['notes']).read_text(encoding='utf8'))
        self.refresh_notes()
        detail='MIDI 已生成' if manifest.get('midi_status')=='complete' else '尚无 MIDI，可单独转录'
        if manifest.get('midi_status')=='failed': detail='MIDI 失败：'+manifest.get('midi_error','')
        self.status.set(f"已载入 {manifest['duration']:.1f} 秒 / {len(manifest['stems'])} 轨 / {manifest.get('device_name','历史结果')}；{detail}")

    def selections(self):
        return [{'name':name,'gain':gain.get()/100} for name,(enabled,gain) in self.stem_vars.items() if enabled.get()]

    def require_project(self):
        if not self.project: messagebox.showinfo('尚无结果','请先分离音频或打开已有结果。'); return False
        return True

    def preview(self):
        if not self.require_project(): return
        path=ROOT/'.cache'/'preview.wav'
        def play(result):
            try: winsound.PlaySound(result,winsound.SND_FILENAME|winsound.SND_ASYNC|winsound.SND_NODEFAULT)
            except RuntimeError as error: messagebox.showerror('试听失败',str(error))
        self.run_job({'action':'mix','project':str(self.project),'tracks':self.selections(),'output':str(path),'preview':True},play)

    def export_mix(self):
        if not self.require_project(): return
        path=filedialog.asksaveasfilename(title='导出混音',initialdir=self.project.parent,initialfile='mix.wav',defaultextension='.wav',filetypes=[('WAV','*.wav')])
        if path: self.run_job({'action':'mix','project':str(self.project),'tracks':self.selections(),'output':path},lambda p:self.status.set('已保存：'+p))

    def export_rootsound(self, mode):
        if not self.require_project(): return
        request={'action':'rootsound','mode':mode,'project':str(self.project),'tracks':self.selections()}
        if mode=='notes' and self.notes is not None: request['notes']=self.notes
        self.run_job(request,lambda path:self.status.set('工程已保存，重新打开 RootSound 歌曲库即可查看：'+path))

    def open_folder(self):
        path=self.project.parent if self.project else Path(self.output.get())
        if path.exists(): os.startfile(path)

    def transcribe(self):
        if not self.require_project(): return
        if self.notes and not messagebox.askyesno('重新转录','重新转录会替换当前项目中的原始 MIDI。未导出的音符编辑将丢失，继续？'): return
        self.run_job({'action':'midi','project':str(self.project)},self.load_project)

    def refresh_notes(self):
        self.tree.delete(*self.tree.get_children()); self.note_refs={}
        if not self.notes: return
        for track in self.notes['tracks']:
            for note in track['notes']:
                key=self.tree.insert('','end',values=(track['name'],note['pitch'],f"{note['start']:.3f}",f"{note['end']:.3f}",note['velocity']))
                self.note_refs[key]=(track,note)

    def edit_note(self):
        if self.busy: return
        selected=self.tree.selection()
        if not selected: return
        _,note=self.note_refs[selected[0]]
        dialog=tk.Toplevel(self); dialog.title('编辑音符'); dialog.transient(self); dialog.grab_set()
        values={}
        for row,(key,label) in enumerate([('pitch','音高 0–127'),('start','起点（秒）'),('end','终点（秒）'),('velocity','力度 1–127')]):
            ttk.Label(dialog,text=label).grid(row=row,column=0,padx=15,pady=10)
            var=tk.StringVar(value=str(note[key])); values[key]=var; ttk.Entry(dialog,textvariable=var).grid(row=row,column=1,padx=15)
        def save():
            import math
            try:
                updated={k:(int(v.get()) if k in ('pitch','velocity') else float(v.get())) for k,v in values.items()}
                if not all(math.isfinite(x) for x in updated.values()) or not (0<=updated['pitch']<=127 and 1<=updated['velocity']<=127 and 0<=updated['start']<updated['end']): raise ValueError()
                note.update(updated); self.refresh_notes(); dialog.destroy()
            except ValueError: messagebox.showerror('数值无效','请检查范围；终点必须晚于起点。',parent=dialog)
        ttk.Button(dialog,text='保存修改',command=save).grid(row=4,column=0,columnspan=2,pady=15)

    def delete_notes(self):
        for key in self.tree.selection():
            track,note=self.note_refs[key]; track['notes'].remove(note)
        self.refresh_notes()

    def export_notes(self):
        if not self.notes: return messagebox.showinfo('尚无音符','请先转录 MIDI。')
        path=filedialog.asksaveasfilename(title='导出编辑结果',initialdir=self.project.parent,initialfile='edited.mid',defaultextension='.mid',filetypes=[('MIDI','*.mid')])
        if path:
            protected=[Path(self.manifest['source']).resolve(),self.project.resolve()]+[(self.project.parent/x['file']).resolve() for x in self.manifest['stems']]
            if Path(path).resolve() in protected: return messagebox.showerror('不能覆盖','请选择新的 MIDI 文件。')
            self.run_job({'action':'save_notes','notes':self.notes,'output':path},lambda p:self.status.set('已保存：'+p))

if __name__=='__main__':
    try:
        hidden='--smoke' in sys.argv
        app=Application(hidden=hidden)
        if hidden:
            app.update_idletasks(); app.destroy()
            (ROOT/'smoke-result.json').write_text(json.dumps({'ui_created':True,'desktop_shown':False}),encoding='utf8')
        else: app.mainloop()
    except Exception:
        import traceback
        error=traceback.format_exc(); (ROOT/'startup-error.log').write_text(error,encoding='utf8')
        if '--smoke' not in sys.argv: messagebox.showerror('启动失败',error[-2000:])
        raise
