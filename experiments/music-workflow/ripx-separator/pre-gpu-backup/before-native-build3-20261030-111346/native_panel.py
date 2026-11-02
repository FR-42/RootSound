"""Small result viewer; opening a report never decodes or plays audio."""
from pathlib import Path
import datetime
import json
import os
import uuid
import tkinter as tk
from tkinter import ttk, filedialog, messagebox


class NativePanel(ttk.Frame):
    def __init__(self, app, notebook):
        super().__init__(notebook, padding=12)
        self.app = app
        self.result = None
        self.summary = tk.StringVar(value='已接入原生谱峰、常频幅度／相位估计和分量扣除模块。完整自动音符链仍在搭建。')
        ttk.Label(self, textvariable=self.summary, wraplength=970).pack(anchor='w', pady=(0, 10))
        actions = ttk.Frame(self); actions.pack(fill='x')
        app.button(actions, '打开原生结果', self.choose_result).pack(side='left')
        app.button(actions, '导入原生分量任务', self.choose_component_task).pack(side='left', padx=8)
        app.button(actions, '导入原生谐波帧', self.choose_harmonic_frames).pack(side='left')
        app.button(actions, '打开原生结果目录', self.open_folder).pack(side='right')
        ttk.Label(self, text='仅预览前 200 项；完整记录保存在结果目录。分量任务需要明确的候选参数，不会自动调用其他模型。',
                  wraplength=970).pack(anchor='w', pady=10)
        body = ttk.Frame(self); body.pack(fill='both', expand=True)
        self.table = ttk.Treeview(body, columns=('channel', 'time', 'frequency', 'amplitude', 'phase'),
                                 show='headings', selectmode='browse')
        for name, label, width in [('channel','声道 / 项目',130),('time','时间 / 秒',130),
                ('frequency','频率 / Hz',150),('amplitude','强度 / 幅度',150),('phase','相位 / 弧度',150)]:
            self.table.heading(name, text=label); self.table.column(name, width=width, anchor='center')
        scroll = ttk.Scrollbar(body, command=self.table.yview)
        self.table.configure(yscrollcommand=scroll.set)
        self.table.pack(side='left', fill='both', expand=True); scroll.pack(side='right', fill='y')

    def choose_result(self):
        path = filedialog.askopenfilename(title='打开原生结果说明', initialdir=self.app.output.get(),
                                         filetypes=[('原生结果 JSON','*.json')])
        if path:
            try: self.show_result(path)
            except (ValueError, OSError, KeyError) as error: messagebox.showerror('无法打开原生结果', str(error))

    def _rows(self, file):
        """Bound preview I/O independently of the complete retained result."""
        consumed = 0
        with file.open(encoding='utf8') as source:
            for _ in range(200):
                line = source.readline(512 * 1024 + 1)
                consumed += len(line)
                if not line or len(line) > 512 * 1024 or consumed > 2 * 1024 * 1024: break
                yield json.loads(line)

    def _add(self, channel, time=None, frequency=None, amplitude=None, phase=None):
        def display(value): return '—' if value is None else f'{value:.5f}'
        self.table.insert('', 'end', values=(channel, display(time), display(frequency), display(amplitude), display(phase)))

    def show_result(self, path):
        path = Path(path).resolve(strict=True)
        if path.stat().st_size > 2 * 1024 * 1024:
            self.table.delete(*self.table.get_children())
            self.result = path; self.app.native_result = path
            self.summary.set('该原生结果较大，已保留完整文件；请在结果目录中查看。')
            self.app.tabs.select(self)
            return
        value = json.loads(path.read_text(encoding='utf-8-sig'))
        kind = value.get('format')
        if kind not in ('RipXStaticNativeAnalysis','RipXNativeComponentSequence','RipXNativeInitialNotes'):
            raise ValueError('此文件不是当前支持的原生分析结果')
        self.table.delete(*self.table.get_children())
        rows = 0
        if kind == 'RipXStaticNativeAnalysis':
            self.summary.set(f"原生谱峰：{value['channels']} 声道，{value['spectral_peaks']} 个峰。此结果尚未包含最终音乐音符。")
            for channel in range(value['channels']):
                if not 1 <= value['channels'] <= 8: raise ValueError('原生结果声道数无效')
                file = path.parent / f'channel-{channel+1}-spectral-peaks.jsonl'
                for frame in self._rows(file):
                    for peak in frame['peaks']:
                        self._add(channel+1, frame['time_seconds'], peak['frequency_hz'], peak['strength'],
                                  peak.get('center_bin_phase_radians'))
                        rows += 1
                        if rows >= 200: break
                    if rows >= 200: break
                if rows >= 200: break
        elif kind == 'RipXNativeComponentSequence':
            self.summary.set(f"原生常频分量：{value['components']} 项。" +
                ('已输出 native-residual.wav；这是提供候选参数后的局部核处理。' if value.get('residual') else '已输出幅度、相位和能量记录。'))
            if Path(value['records']).name != value['records']: raise ValueError('结果记录路径无效')
            for item in self._rows(path.parent/value['records']):
                fit = item['estimate']
                self._add(item['channel']+1, fit['frame_index']*fit['hop']/value['sample_rate'],
                          fit['frequency'], fit['amplitude'], fit['phase_at_frame'])
        else:
            self.summary.set(f"原生初始音符：{len(value['notes'])} 项。代表音高和最终清理尚未完成，不可视作完整 MIDI 转录。")
            for note in value['notes'][:200]:
                cache = note['cache']
                self._add(note['index']+1, note['start_seconds'], cache.get('frequency_20'),
                          cache.get('amplitude_28'))
        self.result = path; self.app.native_result = path
        self.app.tabs.select(self)

    def _job(self, prefix):
        return str(Path(self.app.output.get())/(prefix+'-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'-'+uuid.uuid4().hex[:6]))

    def _complete(self, path):
        self.show_result(path)
        self.app.status.set('原生阶段结果已保存：'+path)

    def choose_component_task(self):
        if not Path(self.app.source.get()).is_file():
            return messagebox.showinfo('原生分量任务', '请先选择输入音频。')
        path = filedialog.askopenfilename(title='选择包含明确候选参数的原生任务', filetypes=[('原生任务 JSON','*.json')])
        if not path: return
        try:
            file = Path(path)
            if file.stat().st_size > 16 * 1024 * 1024: raise ValueError('任务说明超过 16 MiB')
            task = json.loads(file.read_text(encoding='utf-8-sig'))
            if task.get('format') != 'RipXNativeComponentTask' or task.get('version') != 1:
                raise ValueError('需要 RipXNativeComponentTask v1 任务说明')
            request = {'action':'native_component_sequence','input':self.app.source.get(),
                'job':self._job('native-components'),'candidates':task['candidates'], 'subtract':task.get('subtract',False)}
            self.app.run_job(request, self._complete)
        except (OSError, ValueError, KeyError) as error: messagebox.showerror('原生任务无效', str(error))

    def choose_harmonic_frames(self):
        path = filedialog.askopenfilename(title='选择已细化的原生 0x4c 谐波帧',filetypes=[('谐波中间记录 JSON','*.json')])
        if path:
            self.app.run_job({'action':'native_initial_notes','harmonic_frames':path,
                              'job':self._job('native-notes')}, self._complete)

    def open_folder(self):
        path = self.result.parent if self.result else Path(self.app.output.get())
        if path.exists(): os.startfile(path)
