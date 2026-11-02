"""Main note workspace. Advanced REA carriers stay behind the More menu."""
from pathlib import Path
import datetime
import json
import os
import uuid
import tkinter as tk
from tkinter import ttk,filedialog,messagebox

from midi_document import read_midi,save_document
from piano_roll import PianoRoll


class NativePanel(ttk.Frame):
    def __init__(self,app,notebook):
        super().__init__(notebook,padding=10)
        self.app=app;self.result=None;self.document=None;self.dirty=False
        self.bpm=tk.StringVar(value='120')
        self.summary=tk.StringVar(value='导入音频后点击“开始分析”，识别结果会显示在卷帘中。也可直接打开 MIDI。')
        ttk.Label(self,textvariable=self.summary,wraplength=1050).pack(anchor='w',pady=(0,10))
        self.roll=PianoRoll(self,on_change=self._changed,can_edit=lambda:not self.app.busy)
        self.roll.pack(fill='both',expand=True)

    def confirm_replace(self):
        if not self.dirty:return True
        return messagebox.askyesno('尚有音符修改','当前音符修改还未导出。放弃这些修改并打开新的内容？',parent=self.app)

    def _changed(self,document):
        self.document=document;self.dirty=True
        self.summary.set('音符已修改。导出 MIDI 或音符工程可保存修改；重建 WAV 保留分析时的结果。')

    def _set_document(self,document,summary):
        self.document=document;self.dirty=False
        self.bpm.set(f"{float(document.get('bpm',120)):g}")
        self.roll.set_document(document);self.summary.set(summary)
        self.app.tabs.select(self)

    def show_midi(self,path):
        if not self.confirm_replace():return
        path=Path(path).resolve(strict=True);document=read_midi(path)
        self.result=None;self.app.native_result=None;self.app.project=None
        self.app.source.set('');self.app.display_source.set(str(path))
        self._set_document(document,f"{path.name} · {sum(len(t['notes']) for t in document['tracks'])} 个音符")
        self.app.status.set('MIDI 已载入，可在卷帘中编辑。')

    def show_legacy_notes(self,notes):
        self.result=None;self.app.native_result=None
        tracks=[] if not notes else notes['tracks']
        document={'tracks':tracks,'bpm':120,'name':'旧版识别音符'}
        self._set_document(document,'旧版公开模型结果。卷帘显示并编辑完整音符。' if notes else '该旧版结果没有音符。可在“更多 → 旧版分轨”中单独转录。')

    def show_result(self,path):
        if not self.confirm_replace():return
        path=Path(path).resolve(strict=True)
        if path.stat().st_size>16*1024**2:raise ValueError('结果说明超过16MiB，请选择轻量的native-song.json')
        value=json.loads(path.read_text(encoding='utf-8-sig'));kind=value.get('format')
        if kind=='RipXReconstructedNativeSong':
            filename=value.get('midi')
            if not isinstance(filename,str) or Path(filename).name!=filename:raise ValueError('结果中的MIDI路径无效')
            document=read_midi(path.parent/filename)
            document['name']=Path(value.get('source','原生音符')).stem
            document['bpm']=float(value.get('coordinate_bpm',document['bpm']))
            summary=f"原生识别 · {sum(len(t['notes']) for t in document['tracks'])} 个 MIDI 音符 · 重建音频与余量已保存在结果目录"
        elif kind=='RipXNativeInitialNotes':
            import sys
            sys.path.insert(0,str(Path(__file__).parent/'native-core'))
            from native_midi_parameters import native_note_number,native_velocity
            notes=[]
            for entry in value['notes']:
                cache=entry['cache'];pitch=cache.get('pitch_24');amplitude=cache.get('amplitude_28',0)
                if pitch is None or amplitude<=0:continue
                notes.append({'pitch':native_note_number(pitch),'start':entry['start_seconds'],
                    'end':entry['end_seconds'],'velocity':native_velocity(amplitude,1.,1)})
            document={'name':'谐波帧音符','bpm':120,'tracks':[{'name':'谐波音符','notes':notes,'channel':0,'program':0}]}
            summary='从谐波中间数据读取音符；此入口本身未执行整曲分析。'
        elif kind in ('RipXStaticNativeAnalysis','RipXNativeComponentSequence'):
            document={'tracks':[],'bpm':120,'name':'分析结果'}
            summary='这是中间分析结果，尚无 MIDI 音符。普通使用请导入音频并点击“开始分析”。'
        else:raise ValueError('无法识别此结果文件，请选择native-song.json、project.json或MIDI')
        self.result=path;self.app.native_result=path;self.app.project=None
        if value.get('source'):self.app.source.set(value['source'])
        self._set_document(document,summary)

    def choose_result(self):self.app.open_project()

    def _job(self,prefix):
        return str(Path(self.app.output.get())/(prefix+'-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'-'+uuid.uuid4().hex[:6]))

    def _complete(self,path):
        # Starting analysis explicitly already settled replacement of edits.
        self.dirty=False;self.show_result(path);self.app.status.set('识别完成，可在卷帘中查看、编辑和导出。')

    def start_song(self):
        if self.app.busy:return
        if not Path(self.app.source.get()).is_file():return messagebox.showinfo('导入音频','请先导入音频。')
        if not self.confirm_replace():return
        try:
            bpm=float(self.bpm.get())
            if not 40<=bpm<=240:raise ValueError()
        except ValueError:return messagebox.showerror('速度坐标无效','请在设置中填写40–240之间的BPM。')
        self.app.tabs.select(self)
        self.app.run_job({'action':'native_song','input':self.app.source.get(),
            'job':self._job('native-song'),'coordinate_bpm':bpm},self._complete)

    def export_midi(self):
        if not self.document or not any(t['notes'] for t in self.document['tracks']):
            return messagebox.showinfo('尚无音符','请先分析音频或导入MIDI。')
        directory=self.result.parent if self.result else Path(self.app.output.get())
        path=filedialog.asksaveasfilename(title='导出当前音符',initialdir=directory,
            initialfile='edited.mid',defaultextension='.mid',filetypes=[('MIDI','*.mid')])
        if not path:return
        try:
            if Path(path).exists():raise ValueError('请选择新的文件名，保留原始MIDI和已有文件。')
            save_document(self.document,path)
        except (OSError,ValueError,KeyError) as error:return messagebox.showerror('导出失败',str(error))
        self.dirty=False;self.summary.set('当前卷帘中的音符已导出为MIDI。');self.app.status.set('已保存：'+path)

    def export_rootsound(self,mode):
        if mode=='notes':
            if not self.document or not any(t['notes'] for t in self.document['tracks']):
                return messagebox.showinfo('尚无音符','请先分析音频或导入MIDI。')
            request={'action':'midi_rootsound','document':self.document,
                'name':self.document.get('name','原生音符')+' · 音符工程'}
        else:
            if not self.result:return messagebox.showinfo('尚无重建音频','请先完成或打开原生整曲结果。')
            request={'action':'native_rootsound','native_song':str(self.result),'mode':'audio'}
        def complete(path):
            if mode=='notes':self.dirty=False
            self.app.status.set('RootSound工程已保存：'+path)
        self.app.run_job(request,complete)

    def choose_component_task(self):
        if not Path(self.app.source.get()).is_file():return messagebox.showinfo('分析工具','请先导入音频。')
        path=filedialog.askopenfilename(title='选择原生分量任务',filetypes=[('任务JSON','*.json')])
        if not path:return
        try:
            file=Path(path)
            if file.stat().st_size>16*1024**2:raise ValueError('任务说明超过16MiB')
            task=json.loads(file.read_text(encoding='utf-8-sig'))
            if task.get('format')!='RipXNativeComponentTask' or task.get('version')!=1:raise ValueError('原生分量任务格式不匹配')
            self.app.run_job({'action':'native_component_sequence','input':self.app.source.get(),
                'job':self._job('native-components'),'candidates':task['candidates'],'subtract':task.get('subtract',False)},self._complete)
        except (OSError,ValueError,KeyError) as error:messagebox.showerror('任务无效',str(error))

    def choose_harmonic_frames(self):
        path=filedialog.askopenfilename(title='选择原生谐波帧',filetypes=[('谐波帧JSON','*.json')])
        if path:self.app.run_job({'action':'native_initial_notes','harmonic_frames':path,'job':self._job('native-notes')},self._complete)

    def open_folder(self):self.app.open_folder()
