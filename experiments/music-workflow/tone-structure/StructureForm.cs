using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Core;
using RootSound.SampleEditor.Playback;
using RootSound.ToneProcessor;

namespace RootSound.ToneStructure;

internal sealed class StructureForm : Form
{
    private readonly ToolStrip top=new(){GripStyle=ToolStripGripStyle.Hidden,Dock=DockStyle.Top};
    private readonly ToolStripButton captureButton=new("＋ 导入／截取乐曲"),play=new("▶ 播放"),stop=new("■ 回到开始"),split=new("分解"),further=new("进一步分解"),undo=new("撤销分解"),export=new("导出选中层 WAV…"),exportMix=new("导出激活层混合…"),cancel=new("取消");
    private readonly ToolStripLabel position=new();
    private readonly CheckBox compare=new(){Text="原声对照",AutoSize=true};
    private readonly Label info=new(){Text="先导入歌曲或长片段，再点击“分解”。",Dock=DockStyle.Fill,AutoEllipsis=true,TextAlign=ContentAlignment.MiddleLeft};
    private readonly Label status=new(){Dock=DockStyle.Fill,TextAlign=ContentAlignment.MiddleLeft,AutoEllipsis=true};
    private readonly ProgressBar progress=new(){Dock=DockStyle.Fill,Maximum=1000,Visible=false};
    private readonly SpectrumView master=new(){Dock=DockStyle.Fill,Caption="总频谱 · 频率 Hz / 音量 dBFS"};
    private readonly TimeRuler ruler=new(){Dock=DockStyle.Fill};
    private readonly FlowLayoutPanel rows=new(){Dock=DockStyle.Fill,AutoScroll=true,FlowDirection=FlowDirection.TopDown,WrapContents=false,Margin=Padding.Empty};
    private readonly Dictionary<Guid,LayerRow> rowById=[];
    private readonly System.Windows.Forms.Timer clock=new(){Interval=30};
    private readonly Preferences preferences;
    private readonly string root;
    private SeparationMethod currentMethod;
    private ModelDevice currentDevice=ModelDevice.Cpu;
    private readonly IPlaybackDeviceFactory? playbackFactory;
    private StructureSession? session;
    private PlaybackEngine? player;
    private CancellationTokenSource? operationCancellation,traceCancellation;
    private Task operation=Task.CompletedTask,traceTask=Task.CompletedTask;
    private long traceGeneration,lastTraceTick,pendingSeek;
    private bool busy,closing,seeking,resumeSeek,syncRows,allowClose,traceDirty;
    private Task? shutdown;
    private Guid? selected;
    private string? lastError;
    internal event EventHandler? CaptureRequested;
    internal bool HasInput=>session is not null;

    internal StructureForm(string root,IPlaybackDeviceFactory? playbackFactory=null)
    {
        this.root=root;this.playbackFactory=playbackFactory;preferences=new(root);
        currentMethod=DemucsRunner.Unavailable(root)is null?SeparationMethod.Demucs:SeparationMethod.HarmonicPercussive;
        Font=new Font("Microsoft YaHei UI",9.5f);BackColor=Color.FromArgb(241,245,248);
        ClientSize=new Size(1260,920);MinimumSize=new Size(1050,730);Text="音色结构";
        Compose();
        captureButton.Click+=(_,_)=>{if(!busy && !closing)CaptureRequested?.Invoke(this,EventArgs.Empty);};
        play.Click+=(_,_)=>TogglePlay();stop.Click+=(_,_)=>{player?.Pause();Seek(0);};
        split.Click+=async(_,_)=>await ChooseAndDecomposeAsync(false);
        further.Click+=async(_,_)=>await ChooseAndDecomposeAsync(true);
        undo.Click+=async(_,_)=>{operation=UndoAsync();await operation;};
        export.Click+=async(_,_)=>{operation=ExportAsync(false);await operation;};
        exportMix.Click+=async(_,_)=>{operation=ExportAsync(true);await operation;};
        cancel.Click+=(_,_)=>operationCancellation?.Cancel();
        compare.CheckedChanged+=(_,_)=>ApplyMix();
        ruler.SeekStarted+=()=>{seeking=true;resumeSeek=player?.Snapshot.IsPlaying==true;player?.Pause();};
        ruler.SeekRequested+=Seek;
        ruler.SeekEnded+=()=>{seeking=false;if(resumeSeek)player?.Play();resumeSeek=false;};
        rows.SizeChanged+=(_,_)=>ResizeRows();clock.Tick+=(_,_)=>RefreshClock();
        Shown+=(_,_)=>clock.Start();FormClosing+=ClosingAsync;UpdateEnabled();
    }
    private void Compose()
    {
        top.Items.AddRange([captureButton,new ToolStripSeparator(),play,stop,new ToolStripSeparator(),split,further,undo,new ToolStripSeparator(),export,exportMix,cancel]);
        top.CanOverflow=true;Controls.Add(top);
        var layout=new TableLayoutPanel{Dock=DockStyle.Fill,Padding=new Padding(14,8,14,8),ColumnCount=1,RowCount=6};
        foreach(var style in new[]{new RowStyle(SizeType.Absolute,32),new RowStyle(SizeType.Absolute,175),new RowStyle(SizeType.Absolute,50),new RowStyle(SizeType.Absolute,34),new RowStyle(SizeType.Percent,100),new RowStyle(SizeType.Absolute,29)})layout.RowStyles.Add(style);
        layout.Controls.Add(info,0,0);
        master.Dock=ruler.Dock=DockStyle.None;
        var masterHost=new Panel{Dock=DockStyle.Fill,Margin=Padding.Empty};masterHost.Controls.Add(master);layout.Controls.Add(masterHost,0,1);
        var rulerHost=new Panel{Dock=DockStyle.Fill,Margin=Padding.Empty};rulerHost.Controls.Add(ruler);layout.Controls.Add(rulerHost,0,2);
        masterHost.SizeChanged+=(_,_)=>ResizeRows();rulerHost.SizeChanged+=(_,_)=>ResizeRows();
        var commands=new FlowLayoutPanel{Dock=DockStyle.Fill};commands.Controls.Add(compare);
        commands.Controls.Add(new Label{Text="各图：横轴频率，纵轴音量；时间条拖动播放头。选中某层可进一步分解。",AutoSize=true,Margin=new Padding(18,6,0,0)});
        layout.Controls.Add(commands,0,3);layout.Controls.Add(rows,0,4);
        var statusRow=new TableLayoutPanel{Dock=DockStyle.Fill,ColumnCount=2,Margin=Padding.Empty};statusRow.ColumnStyles.Add(new ColumnStyle(SizeType.Percent,100));statusRow.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute,140));
        statusRow.Controls.Add(status,0,0);statusRow.Controls.Add(progress,1,0);layout.Controls.Add(statusRow,0,5);
        Controls.Add(layout);layout.BringToFront();
    }
    internal Task LoadSelectionAsync(IAudioFrameSource source,ImportedAudio origin,CancellationToken token=default)=>operation=LoadCoreAsync(source,origin,token);
    private async Task LoadCoreAsync(IAudioFrameSource source,ImportedAudio origin,CancellationToken external)
    {
        if(busy || closing)throw new InvalidOperationException("正在处理，请稍后再试。");
        busy=true;operationCancellation=CancellationTokenSource.CreateLinkedTokenSource(external);UpdateEnabled();
        var store=new AudioStore();StructureSession? incoming=null;
        try
        {
            var report=Progress();var token=operationCancellation.Token;
            var asset=await Task.Run(()=>store.Copy(source,report,token),token);incoming=new(store,asset,origin);token.ThrowIfCancellationRequested();
            await CancelTraceAsync();if(player is not null)await player.DisposeAsync();session?.Dispose();
            session=incoming;incoming=null;player=NewPlayer(session.Mix,origin.ChannelMask);pendingSeek=0;selected=session.Layers[0].Id;
            compare.Checked=false;ruler.Frames=asset.FrameCount;ruler.SampleRate=asset.SampleRate;ruler.MoveTo(0);master.SampleRate=asset.SampleRate;
            info.Text=$"{origin.FileName} · {TimeRuler.Format(asset.FrameCount/(double)asset.SampleRate)} · {asset.SampleRate:N0} Hz · {asset.Channels} 声道";
            BuildRows();status.Text="片段已接收。点击“分解…”选择方法；全部激活可重新合成输入。";
            ScheduleTrace(0);
        }
        catch{incoming?.Dispose();if(session?.Store!=store)store.Dispose();throw;}
        finally{operationCancellation.Dispose();operationCancellation=null;busy=false;UpdateEnabled();}
    }
    private PlaybackEngine NewPlayer(IAudioFrameSource source,uint mask)=>playbackFactory is null?new(source,mask):new(source,playbackFactory,mask);
    private async Task ChooseAndDecomposeAsync(bool refine)
    {
        if(busy || closing || session is null)return;
        using var dialog=new MethodDialog(root,session.Original.Channels,currentMethod,refine,refine?StructureSession.MaximumLayers-session.Layers.Length+1:StructureSession.MaximumLayers,currentDevice);
        if(dialog.ShowDialog(this)!=DialogResult.OK)return;
        currentMethod=dialog.Selected;currentDevice=dialog.SelectedDevice;operation=DecomposeAsync(refine,currentMethod,dialog.LayerCount,currentDevice);await operation;
    }
    internal async Task DecomposeAsync(bool refine,SeparationMethod? method=null,int? count=null,ModelDevice? device=null)
    {
        if(busy || closing || session is null)return;
        var target=refine?session.Layers.FirstOrDefault(x=>x.Id==selected):session.Layers.FirstOrDefault();
        if(target is null)return;
        var algorithm=method??currentMethod;
        int wanted=algorithm==SeparationMethod.Demucs?4:algorithm==SeparationMethod.Templates?(count??(refine?2:4)):2;
        if(refine && session.Layers.Length-1+wanted>StructureSession.MaximumLayers){status.Text="当前最多显示 16 层，请先撤销一部分分解。";return;}
        busy=true;operationCancellation=new();UpdateEnabled();
        try
        {
            var source=session;var report=Progress();var token=operationCancellation.Token;
            var result=await Task.Run(()=>SeparationMethods.Run(refine?target.Audio:source.Original,algorithm,wanted,source.Store,root,report,token,device??currentDevice),token);var children=result.Audio;
            token.ThrowIfCancellationRequested();
            if(children.Length<2){status.Text="没有找到足够可区分的结构，当前结果保留；可以换更长或变化更多的片段。";return;}
            await CancelTraceAsync();bool playing=player?.Snapshot.IsPlaying==true;double frame=player?.Snapshot.PositionFrames??ruler.Position;
            player?.Pause();session.Commit(target.Id,children,result.Names,fromOriginal:!refine);selected=session.Layers.First(x=>children.Contains(x.Audio)).Id;
            ApplyMix();BuildRows();Seek(frame);if(playing)player?.Play();
            currentMethod=algorithm;status.Text=$"{SeparationMethods.All.First(x=>x.Id==algorithm).Title}：已生成 {session.Layers.Length} 个对齐层。"+(result.Execution is null?"可重新选方法比较，或撤销恢复上次结果。":"使用设备："+result.Execution.Description);ScheduleTrace(frame);
        }
        catch(OperationCanceledException){session?.Collect();status.Text="已取消，之前的分解结果保留。";}
        catch(Exception ex){session?.Collect();status.Text="分解失败："+ex.Message;}
        finally{operationCancellation.Dispose();operationCancellation=null;busy=false;UpdateEnabled();}
    }
    internal async Task UndoAsync()
    {
        if(busy || closing || session?.CanUndo!=true)return;busy=true;UpdateEnabled();
        try
        {
            await CancelTraceAsync();bool playing=player?.Snapshot.IsPlaying==true;double frame=player?.Snapshot.PositionFrames??0;
            player?.Pause();session.Undo();selected=session.Layers[0].Id;ApplyMix();BuildRows();Seek(frame);if(playing)player?.Play();
            status.Text="已撤销上一次分解，之前的层和激活状态已恢复。";ScheduleTrace(frame);
        }
        finally{busy=false;UpdateEnabled();}
    }
    private void ApplyMix()
    {
        if(session is null)return;
        session.Mix.SetLayers(compare.Checked?[new(Guid.Empty,"原声",session.Original,true)]:session.Layers);
        master.Caption=compare.Checked?"总频谱 · 原声对照":"总频谱 · 当前激活层的混合";
        ScheduleTrace(ruler.Position);
    }
    private void BuildRows()
    {
        syncRows=true;rows.SuspendLayout();foreach(Control row in rows.Controls.Cast<Control>().ToArray())row.Dispose();rows.Controls.Clear();rowById.Clear();
        if(session is not null)foreach(var layer in session.Layers)
        {
            var row=new LayerRow(layer,layer.Id==selected,session.Original.SampleRate);
            row.Active.CheckedChanged+=(_,_)=>
            {
                if(syncRows || session is null)return;session.SetActive(layer.Id,row.Active.Checked);
                row.Active.Text=row.Active.Checked?"激活":"沉默";row.Plot.TraceColor=row.Active.Checked?Color.FromArgb(57,172,211):Color.FromArgb(116,132,147);
                ApplyMix();
            };
            row.Selector.CheckedChanged+=(_,_)=>{if(!syncRows && row.Selector.Checked)SelectLayer(layer.Id);};
            row.Plot.Click+=(_,_)=>SelectLayer(layer.Id);
            rowById.Add(layer.Id,row);rows.Controls.Add(row);
        }
        rows.ResumeLayout();syncRows=false;ResizeRows();UpdateEnabled();
    }
    internal void SelectLayer(Guid id)
    {
        selected=id;syncRows=true;foreach(var pair in rowById)pair.Value.Selector.Checked=pair.Key==id;syncRows=false;UpdateEnabled();
    }
    private void ResizeRows()
    {
        int width=Math.Max(400,rows.ClientSize.Width-4);
        foreach(Control row in rows.Controls)row.Width=width;
        master.SetBounds(0,0,width,master.Parent?.ClientSize.Height??175);
        ruler.SetBounds(0,0,width,ruler.Parent?.ClientSize.Height??50);
    }
    private void TogglePlay(){if(player is null || seeking)return;if(player.Snapshot.IsPlaying)player.Pause();else{if(ruler.Position>=ruler.Frames)Seek(0);player.Play();}}
    private void Seek(double frame)
    {if(player is null)return;pendingSeek=player.Seek(frame);ruler.MoveTo(frame);ScheduleTrace(frame);}
    private void RefreshClock()
    {
        if(closing || player is null || session is null)return;var s=player.Snapshot;
        if(!seeking && (pendingSeek==0 || s.SeekRevision>=pendingSeek)){pendingSeek=0;ruler.MoveTo(s.PositionFrames);}
        play.Text=s.IsPlaying?"Ⅱ 暂停":"▶ 播放";
        if(s.Error is not null && s.Error!=lastError){lastError=s.Error;status.Text="播放失败："+s.Error;}
        if((s.IsPlaying || traceDirty) && Environment.TickCount64-lastTraceTick>=100)ScheduleTrace(ruler.Position);
    }
    private void ScheduleTrace(double frame)
    {
        if(closing || session is null)return;
        if(!traceTask.IsCompleted){traceDirty=true;return;}
        traceDirty=false;lastTraceTick=Environment.TickCount64;traceCancellation=new();var current=session;
        var sources=current.Layers;var mix=current.Snapshot();if(compare.Checked)mix.SetLayers([new(Guid.Empty,"原声",current.Original,true)]);
        traceTask=MeasureAsync(mix,sources,Math.Clamp((long)frame,0,current.Original.FrameCount-1),traceGeneration,traceCancellation);
    }
    private async Task MeasureAsync(IAudioFrameSource mix,Layer[] layers,long frame,long generation,CancellationTokenSource cancellation)
    {
        try
        {
            var measured=await Task.Run(()=>
            {
                var top=SignalSpectrum.Measure(mix,frame,cancellation.Token);
                var parts=new Dictionary<Guid,FrequencyPoint[]>();
                foreach(var layer in layers){cancellation.Token.ThrowIfCancellationRequested();parts[layer.Id]=SignalSpectrum.Measure(layer.Audio,frame,cancellation.Token);}
                return(top,parts);
            },cancellation.Token);
            if(closing || cancellation.IsCancellationRequested || generation!=traceGeneration)return;
            master.SetPoints(measured.top);foreach(var pair in measured.parts)if(rowById.TryGetValue(pair.Key,out var row))row.Plot.SetPoints(pair.Value);
        }
        catch(OperationCanceledException){}catch(Exception ex){if(!closing)status.Text="频谱更新失败："+ex.Message;}
        finally{if(ReferenceEquals(traceCancellation,cancellation))traceCancellation=null;cancellation.Dispose();}
    }
    private async Task CancelTraceAsync(){traceGeneration++;traceDirty=false;traceCancellation?.Cancel();await traceTask;}
    private async Task ExportAsync(bool mix)
    {
        if(busy || session is null)return;
        var layer=session.Layers.FirstOrDefault(x=>x.Id==selected);if(!mix && layer is null)return;
        using var dialog=new SaveFileDialog{Title=mix?"导出当前激活层的混合":"导出选中结构层",Filter="WAV 音频|*.wav",DefaultExt="wav",AddExtension=true,OverwritePrompt=true,InitialDirectory=preferences.ExportDirectory,FileName=(mix?"结构混合":layer!.Name)+".wav"};
        if(dialog.ShowDialog(this)!=DialogResult.OK)return;
        busy=true;operationCancellation=new();UpdateEnabled();
        try
        {
            IAudioFrameSource source=mix?session.Snapshot():layer!.Audio;var origin=session.Origin;var report=Progress();var token=operationCancellation.Token;
            await Task.Run(()=>WavExport.Write(source,origin,dialog.FileName,report,token),token);preferences.RememberExport(dialog.FileName);status.Text="已导出："+dialog.FileName;
        }
        catch(OperationCanceledException){status.Text="已取消导出，已有文件保留。";}catch(Exception ex){status.Text="导出失败："+ex.Message;}
        finally{operationCancellation.Dispose();operationCancellation=null;busy=false;UpdateEnabled();}
    }
    private IProgress<AudioProgress> Progress()=>new Progress<AudioProgress>(p=>{if(closing)return;status.Text=p.Message;progress.Value=(int)(Math.Clamp(p.Fraction,0,1)*1000);});
    private void UpdateEnabled()
    {
        captureButton.Enabled=!busy && !closing;split.Enabled=!busy && session is not null;
        split.Text=session?.Decomposed==true?"重新分解…":"分解…";further.Text="进一步分解…";
        further.Enabled=!busy && session is {Decomposed:true} && selected is not null;undo.Enabled=!busy && session?.CanUndo==true;
        play.Enabled=stop.Enabled=session is not null && !closing;export.Enabled=exportMix.Enabled=!busy && session is not null;
        compare.Enabled=session is not null;cancel.Visible=progress.Visible=busy;
    }
    internal void SuspendForNavigation(){resumeSeek=false;clock.Stop();player?.Pause();}
    internal void ResumeForNavigation(){if(!closing){clock.Start();ScheduleTrace(ruler.Position);}}
    internal Task ShutdownAsync()=>shutdown??=ShutdownCoreAsync();
    private async Task ShutdownCoreAsync()
    {
        closing=true;clock.Stop();operationCancellation?.Cancel();
        try{await operation;}catch(OperationCanceledException){}catch(Exception){}
        await CancelTraceAsync();
        if(player is not null)await player.DisposeAsync();session?.Dispose();clock.Dispose();allowClose=true;
    }
    private async void ClosingAsync(object? sender,FormClosingEventArgs e){if(allowClose)return;e.Cancel=true;if(closing)return;await ShutdownAsync();Close();}
    protected override bool ProcessCmdKey(ref Message msg,Keys keys)
    {if(keys==Keys.Space){TogglePlay();return true;}return base.ProcessCmdKey(ref msg,keys);}
    private sealed class LayerRow:Panel
    {
        internal readonly RadioButton Selector=new(){AutoSize=true};internal readonly CheckBox Active=new(){AutoSize=true};
        internal readonly SpectrumView Plot=new(){Dock=DockStyle.Fill};
        internal LayerRow(Layer layer,bool selected,int rate)
        {
            Height=180;Margin=new Padding(0,3,0,9);BackColor=Color.FromArgb(222,232,240);
            Selector.Text=layer.Name;Selector.Checked=selected;Active.Text=layer.Active?"激活":"沉默";Active.Checked=layer.Active;
            var header=new FlowLayoutPanel{Dock=DockStyle.Top,Height=29};header.Controls.Add(Selector);header.Controls.Add(Active);
            Plot.SampleRate=rate;Plot.Caption="频率 Hz / 音量 dBFS";Plot.TraceColor=layer.Active?Color.FromArgb(57,172,211):Color.FromArgb(116,132,147);Controls.Add(Plot);Controls.Add(header);
        }
    }
}
