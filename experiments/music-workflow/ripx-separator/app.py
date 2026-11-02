from bootstrap import ROOT, CONFIG
from pathlib import Path
import datetime,json,os,queue,subprocess,sys,threading,uuid,winsound
import tkinter as tk
from tkinter import ttk,filedialog,messagebox


class Application(tk.Tk):
    def __init__(self,hidden=False):
        super().__init__()
        if hidden:self.withdraw()
        self.title('RipX音色分离 · 原生实验版6')
        self.geometry('1180x790');self.minsize(850,580);self.configure(bg='#f3f5f9')
        self.source=tk.StringVar();self.display_source=tk.StringVar(value='尚未导入')
        self.source.trace_add('write',lambda *args:self.display_source.set(self.source.get()) if self.source.get() else None)
        self.mode=tk.StringVar(value='4');self.device=tk.StringVar(value='gpu');self.want_midi=tk.BooleanVar(value=False)
        self.output=tk.StringVar(value=str(ROOT/'output'));self.status=tk.StringVar(value='导入音频或MIDI，开始工作。')
        self.events=queue.Queue();self.process=None;self.busy=False;self.project=None;self.native_result=None
        self.notes=None;self.controls=[];self.stem_vars={};self.callback=None;self.legacy_page=None
        style=ttk.Style(self);style.theme_use('clam')
        style.configure('.',font=('Microsoft YaHei UI',10))
        style.configure('TFrame',background='#f3f5f9');style.configure('TLabel',background='#f3f5f9')
        style.configure('Title.TLabel',font=('Microsoft YaHei UI',19,'bold'),foreground='#17283e')
        style.configure('TButton',padding=(11,6));style.configure('Treeview',rowheight=26)
        outer=ttk.Frame(self,padding=16);outer.pack(fill='both',expand=True)
        title=ttk.Frame(outer);title.pack(fill='x',pady=(0,12))
        ttk.Label(title,text='RipX 音色分离',style='Title.TLabel').pack(side='left')
        ttk.Label(title,text='原生实验版6 · CPU',foreground='#687a90').pack(side='left',padx=12)
        self.toolbar=ttk.Frame(outer);self.toolbar.pack(fill='x',pady=(0,12))
        self.button(self.toolbar,'导入…',self.open_project).pack(side='left')
        ttk.Entry(self.toolbar,textvariable=self.display_source,state='readonly').pack(side='left',fill='x',expand=True,padx=8)
        self.button(self.toolbar,'开始分析',lambda:self.native_panel.start_song()).pack(side='left')
        export=ttk.Menubutton(self.toolbar,text='导出 ▾');export.pack(side='left',padx=8);self.controls.append(export)
        export_menu=tk.Menu(export,tearoff=False);export.configure(menu=export_menu)
        export_menu.add_command(label='MIDI 文件…',command=lambda:self.native_panel.export_midi())
        export_menu.add_command(label='RootSound 音符工程',command=lambda:self.native_panel.export_rootsound('notes'))
        export_menu.add_command(label='RootSound 重建音频工程',command=lambda:self.native_panel.export_rootsound('audio'))
        more=ttk.Menubutton(self.toolbar,text='更多 ▾');more.pack(side='left');self.controls.append(more)
        more_menu=tk.Menu(more,tearoff=False);more.configure(menu=more_menu)
        more_menu.add_command(label='设置…',command=self.settings)
        more_menu.add_command(label='打开结果文件夹',command=self.open_folder)
        more_menu.add_separator()
        more_menu.add_command(label='旧版公开模型分轨…',command=self.legacy_options)
        analysis=tk.Menu(more_menu,tearoff=False);more_menu.add_cascade(label='分析工具',menu=analysis)
        analysis.add_command(label='仅分析谱峰',command=self.start_native)
        analysis.add_command(label='导入分量任务…',command=lambda:self.native_panel.choose_component_task())
        analysis.add_command(label='导入谐波帧…',command=lambda:self.native_panel.choose_harmonic_frames())
        more_menu.add_separator();more_menu.add_command(label='当前完成程度',command=self.progress_info)
        self.cancel_button=ttk.Button(self.toolbar,text='取消处理',command=self.cancel,state='disabled')
        self.tabs=ttk.Notebook(outer);self.tabs.pack(fill='both',expand=True)
        from native_panel import NativePanel
        self.native_panel=NativePanel(self,self.tabs);self.tabs.add(self.native_panel,text='  MIDI 卷帘  ')
        self.logpage=ttk.Frame(self.tabs,padding=10);self.tabs.add(self.logpage,text='  运行记录  ')
        self.log=tk.Text(self.logpage,wrap='word',state='disabled',font=('Consolas',10));self.log.pack(fill='both',expand=True)
        self.progress=ttk.Progressbar(outer,maximum=100);self.progress.pack(fill='x',pady=(10,5))
        ttk.Label(outer,textvariable=self.status,wraplength=1050).pack(anchor='w')
        self.protocol('WM_DELETE_WINDOW',self.close);self.after(120,self.poll)

    def open_project(self):
        path=filedialog.askopenfilename(title='导入音频、MIDI或已有结果',initialdir=self.output.get(),
            filetypes=[('音频 / MIDI / 结果','*.wav *.mp3 *.flac *.ogg *.m4a *.aac *.aiff *.wma *.mid *.midi *.json'),
                       ('MIDI','*.mid *.midi'),('结果说明','*.json'),('所有文件','*.*')])
        if not path:return
        try:
            file=Path(path)
            if file.suffix.lower() in ('.mid','.midi'):self.native_panel.show_midi(file)
            elif file.suffix.lower()=='.json':
                if file.stat().st_size>16*1024**2:raise ValueError('请选择轻量的结果说明文件')
                value=json.loads(file.read_text(encoding='utf-8-sig'))
                if 'stems' in value:
                    if not self.native_panel.confirm_replace():return
                    self._ensure_legacy();self.load_project(file)
                else:self.native_panel.show_result(file)
            else:
                self.source.set(path);self.status.set('音频已选择，点击“开始分析”。')
        except (OSError,ValueError,KeyError,TypeError) as error:messagebox.showerror('导入失败',str(error))

    def settings(self):
        dialog=tk.Toplevel(self);dialog.title('设置');dialog.transient(self);dialog.grab_set()
        ttk.Label(dialog,text='保存目录').grid(row=0,column=0,padx=15,pady=12,sticky='w')
        ttk.Entry(dialog,textvariable=self.output,state='readonly',width=48).grid(row=0,column=1,padx=8,pady=12)
        ttk.Button(dialog,text='选择…',command=self.choose_output).grid(row=0,column=2,padx=10)
        ttk.Label(dialog,text='新分析的速度坐标').grid(row=1,column=0,padx=15,pady=10,sticky='w')
        bpm=tk.StringVar(value=self.native_panel.bpm.get())
        ttk.Entry(dialog,textvariable=bpm,width=10).grid(row=1,column=1,padx=8,pady=10,sticky='w')
        ttk.Label(dialog,text='BPM，用于工程网格；目前尚未恢复自动测速。').grid(row=2,column=0,columnspan=3,padx=15,pady=6,sticky='w')
        def save():
            try:
                value=float(bpm.get())
                if not 40<=value<=240:raise ValueError()
            except ValueError:return messagebox.showerror('数值无效','请输入40–240 BPM。',parent=dialog)
            self.native_panel.bpm.set(f'{value:g}');dialog.destroy()
        ttk.Button(dialog,text='完成',command=save).grid(row=3,column=0,columnspan=3,pady=14)

    def progress_info(self):
        messagebox.showinfo('当前完成程度',
            '已搭建：原生立体声融合、普通谐波与鼓噪残差分析、原件签名乐器分类、分音轨WAV、多轨MIDI及RootSound工程。\n\n'
            '卷帘支持完整MIDI与基本编辑。鼓噪负类型按原件规则保留为音频，不编造MIDI鼓键。\n\n'
            '这些原生阶段由本工具组合调度；原件完整多预设流程、自动测速和全部编辑效果仍未复刻。原生链目前在CPU运行。\n\n'
            '仅搭建与源码检查，未做整曲或原件运行对比。实际效果尚待测试。')

    def legacy_options(self):
        self._ensure_legacy();self.tabs.select(self.legacy_page)

    def _ensure_legacy(self):
        if self.legacy_page is not None:return
        self.legacy_page=ttk.Frame(self.tabs,padding=10);self.tabs.add(self.legacy_page,text='  旧版分轨  ')
        page=self.legacy_page
        ttk.Label(page,text='此处使用 Demucs / Basic Pitch，与原生识别入口独立。').pack(anchor='w',pady=(0,10))
        settings=ttk.Frame(page);settings.pack(fill='x',pady=(0,10))
        for label,value in [('四轨','4'),('六轨','6')]:
            control=ttk.Radiobutton(settings,text=label,variable=self.mode,value=value);control.pack(side='left',padx=8);self.controls.append(control)
        control=ttk.Checkbutton(settings,text='Basic Pitch MIDI',variable=self.want_midi);control.pack(side='left',padx=10);self.controls.append(control)
        device=ttk.Combobox(settings,textvariable=self.device,values=['gpu','cpu'],width=6,state='readonly');device.pack(side='left',padx=8);self.controls.append(device)
        self.button(settings,'开始旧版分轨',self.start).pack(side='left',padx=8)
        self.button(settings,'单独转录 MIDI',self.transcribe).pack(side='left')
        self.stem_area=ttk.Frame(page);self.stem_area.pack(fill='both',expand=True)
        self.stems_page=page
        actions=ttk.Frame(page);actions.pack(fill='x',pady=8)
        self.button(actions,'试听混音',self.preview).pack(side='left')
        self.button(actions,'导出混音',self.export_mix).pack(side='left',padx=8)
        self.button(actions,'保存原音工程',lambda:self.export_rootsound('audio')).pack(side='left')

    def refresh_notes(self):
        self.native_panel.show_legacy_notes(self.notes)

    def button(self,parent,text,command):
        control=ttk.Button(parent,text=text,command=command); self.controls.append(control); return control

    def choose_input(self):
        path=filedialog.askopenfilename(title='选择音频',filetypes=[('音频','*.wav *.mp3 *.flac *.ogg *.m4a *.aac *.aiff *.wma'),('所有文件','*.*')])
        if path: self.source.set(path)

    def choose_output(self):
        path=filedialog.askdirectory(title='保存目录',initialdir=self.output.get())
        if path: self.output.set(path)

    def start_native(self):
        if not Path(self.source.get()).is_file(): return messagebox.showinfo('导入音频','请先选择一个音频文件。')
        job=Path(self.output.get())/('native-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'-'+uuid.uuid4().hex[:6])
        def complete(path):
            self.native_result=Path(path)
            self.native_panel.show_result(path)
            self.status.set('原生谱峰分析已保存：'+path+'；最终音符切分尚未完成。')
        self.run_job({'action':'native_analysis','input':self.source.get(),'job':str(job)},complete)

    def start(self):
        if not self.native_panel.confirm_replace(): return
        if not Path(self.source.get()).is_file(): return messagebox.showinfo('导入音频','请先选择一个音频文件。')
        job=Path(self.output.get())/(datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'-'+uuid.uuid4().hex[:6])
        self.run_job({'action':'separate','input':self.source.get(),'mode':self.mode.get(),'device':self.device.get(),'midi':self.want_midi.get(),'job':str(job)},self.load_project)

    def run_job(self,request,callback):
        if self.busy: return
        winsound.PlaySound(None,0)
        self.busy=True; self.cancelled=False; self.cancel_event=threading.Event(); self.callback=callback; self.current_request=request
        for control in self.controls: control.configure(state='disabled')
        self.cancel_button.pack(side='left',padx=8)
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
                if code!=0 and request.get('action') in ('separate','native_analysis','native_component_sequence','native_song'):
                    # Only scratch children of this newly allocated job are disposable.
                    import shutil
                    job=Path(request['job']).resolve()
                    if (job/'status.json').is_file():
                        for child in job.iterdir():
                            if child.is_dir() and child.resolve().parent==job and child.name.startswith(('.work-','.midi-','.native-')):
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
                    self.cancel_button.pack_forget()
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
        if not self.native_panel.confirm_replace(): return
        winsound.PlaySound(None,0); self.destroy()

    def close_after_job(self):
        if self.busy: self.after(150,self.close_after_job)
        else: winsound.PlaySound(None,0); self.destroy()

    def load_project(self,path):
        self.native_result=None
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
        path=self.native_result.parent if self.native_result else (self.project.parent if self.project else Path(self.output.get()))
        if path.exists(): os.startfile(path)

    def transcribe(self):
        if not self.require_project(): return
        if self.notes and not messagebox.askyesno('重新转录','重新转录会替换当前项目中的原始 MIDI。未导出的音符编辑将丢失，继续？'): return
        self.run_job({'action':'midi','project':str(self.project)},self.load_project)

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
