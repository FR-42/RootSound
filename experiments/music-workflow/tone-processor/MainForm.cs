using RootSound.SampleEditor.Analysis;
using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Controls;
using RootSound.SampleEditor.Core;
using RootSound.SampleEditor.Playback;

namespace RootSound.ToneProcessor;

internal sealed class MainForm : Form
{
    private readonly AudioPlot plot = new() { Dock=DockStyle.Fill, Margin=Padding.Empty };
    private readonly EqPanel eq = new() { Dock=DockStyle.Fill };
    private readonly HScrollBar scroll = new() { Dock=DockStyle.Fill, Maximum=1_000_000, SmallChange=2000, LargeChange=1_000_001, Margin=Padding.Empty };
    private readonly ToolStrip top=Bar(), tools=Bar();
    private readonly ToolStripButton back=Button("← 返回音色打磨");
    private readonly ToolStripButton play=Button("▶"), stop=Button("■"), import=Button("导入…"), export=Button("导出 WAV…"),
        cut=Button("剪切"), undoCut=Button("撤销剪切"), zoomIn=Button("放大 +"), zoomOut=Button("缩小 −"), fit=Button("全图"), cancel=Button("取消");
    private readonly ToolStripLabel file=new(), position=new();
    private readonly Label status=new() { Dock=DockStyle.Fill, TextAlign=ContentAlignment.MiddleLeft, AutoEllipsis=true, Margin=Padding.Empty };
    private readonly ProgressBar progress=new() { Dock=DockStyle.Fill, Maximum=1000, Visible=false, Margin=new Padding(8,6,0,6) };
    private readonly System.Windows.Forms.Timer clock=new() { Interval=30 }, debounce=new() { Interval=180 };
    private readonly HashSet<Task> analysisJobs=[];
    private readonly Stack<ClipSource> cutHistory=[];
    private readonly Preferences preferences;
    private readonly bool integrated;
    private readonly IPlaybackDeviceFactory? playbackFactory;
    internal event EventHandler? ReturnRequested;
    internal Func<CapturedSample,Task>? AddSample;
    internal Action<int,int,long>? ValidateSample;
    internal Func<IAudioFrameSource,ImportedAudio,CancellationToken,Task>? TransferSelection;
    private string transferDestination="采样栏";
    private ImportedAudio? audio;
    private ClipSource? clip;
    private EqSource? processed;
    private LoopSource? loop;
    private PlaybackEngine? player;
    private CancellationTokenSource? operationCancellation, analysisCancellation, traceCancellation;
    private Task operation=Task.CompletedTask;
    private Task initialization=Task.CompletedTask;
    private Task? shutdownTask;
    private Task? traceJob;
    private long lastTraceTick;
    private long analysisVersion, pendingSeek;
    private bool busy, closing, allowClose, seeking, resumeAfterSeek, syncingScroll;
    private bool selectingBlue, selectionRangeDirty, resumeAfterEmptySelection;
    private string? playbackError;

    internal MainForm(string root, bool integrated = false, bool initializeEq = true, IPlaybackDeviceFactory? playbackFactory = null)
    {
        this.integrated=integrated;
        this.playbackFactory=playbackFactory;
        plot.Timeline.AllowSelectionCrossing=true;
        preferences=new Preferences(root);
        Text="音色器 · 音乐流程实验"; Font=new Font("Microsoft YaHei UI",9.5f);
        BackColor=Color.FromArgb(242,245,247); ForeColor=Color.FromArgb(31,45,59);
        ClientSize=new Size(1200,920); MinimumSize=new Size(900,720);
        AutoScaleMode=AutoScaleMode.Dpi; StartPosition=FormStartPosition.CenterScreen;
        Compose();
        play.ToolTipText="播放 / 暂停（空格）；只在两条蓝线之间循环"; play.AccessibleName="播放或暂停";
        stop.ToolTipText="暂停并回到左蓝线"; stop.AccessibleName="回到开始";
        cut.ToolTipText="删除两条蓝线外的内容，保留区域成为完整片段；不改原文件";
        export.Text=integrated?"导出到采样栏":"导出 WAV…";
        export.ToolTipText=integrated?"将蓝线之间的音频和 EQ 加工结果加入采样栏；歌曲继续保留":"只导出两条蓝线之间的音频，并保留 EQ 加工结果";
        back.Visible=integrated;
        back.Click+=(_,_)=>{if(!busy && !closing)ReturnRequested?.Invoke(this,EventArgs.Empty);};
        import.Click+=async (_,_)=>{operation=ImportAsync();await operation;};
        export.Click+=async (_,_)=>{operation=ExportAsync();await operation;};
        cut.Click+=async (_,_)=>{operation=TrimAsync(false);await operation;};
        undoCut.Click+=async (_,_)=>{operation=TrimAsync(true);await operation;};
        play.Click+=(_,_)=>TogglePlay(); stop.Click+=(_,_)=>Rewind(); cancel.Click+=(_,_)=>operationCancellation?.Cancel();
        zoomIn.Click+=(_,_)=>Zoom(2); zoomOut.Click+=(_,_)=>Zoom(.5); fit.Click+=(_,_)=>{plot.Timeline.Fit();ViewChanged();};
        plot.ViewChanged+=(_,_)=>ViewChanged();
        plot.SelectionStarted+=(_,_)=>BeginSelectionEdit();
        plot.SelectionChanged+=(_,_)=>
        {
            UpdateLoopSelection();
            RefreshSelection();UpdateEnabled();
        };
        plot.SelectionEnded+=(_,_)=>EndSelectionEdit();
        plot.SeekStarted+=(_,_)=>
        {
            if(seeking)return; seeking=true;resumeAfterSeek=player?.Snapshot.IsPlaying==true;
            player?.Pause();
        };
        plot.SeekRequested+=(_,_)=>{ConfigureLoop(plot.Timeline.Playhead);RefreshSelection();};
        plot.SeekEnded+=(_,_)=>
        {
            ConfigureLoop(plot.Timeline.Playhead);seeking=false;
            if(resumeAfterSeek && plot.Timeline.HasSelection)player?.Play();resumeAfterSeek=false;
        };
        plot.SizeChanged+=(_,_)=>ScheduleAnalysis();
        scroll.ValueChanged+=(_,_)=>
        {
            if(syncingScroll || clip is null)return;
            plot.Timeline.SetViewStart(scroll.Value/(double)Math.Max(1,scroll.Maximum-scroll.LargeChange+1)*(clip.FrameCount-plot.Timeline.ViewLength));
            ViewChanged();
        };
        eq.Changed+=(_,_)=>{if(eq.Ready)processed?.SetKernel(eq.Kernel);UpdateEnabled();};
        eq.Failed+=message=>status.Text=message;
        eq.PlayRequested+=(_,_)=>TogglePlay();
        clock.Tick+=(_,_)=>RefreshPlayback();
        debounce.Tick+=(_,_)=>{debounce.Stop();StartAnalysis();};
        Shown+=async (_,_)=>{clock.Start();if(initializeEq){initialization=eq.InitializeAsync();await initialization;}};
        FormClosing+=ClosingAsync;status.Text="导入音频后，拖动蓝线选择循环范围。支持超过 10 分钟的音频。";UpdateEnabled();
    }
    private void Compose()
    {
        var layout=new TableLayoutPanel {Dock=DockStyle.Fill,ColumnCount=1,RowCount=3,Padding=new Padding(14,8,14,8)};
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute,40));layout.RowStyles.Add(new RowStyle(SizeType.Percent,100));layout.RowStyles.Add(new RowStyle(SizeType.Absolute,30));
        Controls.Add(layout);top.Items.AddRange([back,play,stop,new ToolStripSeparator(),import,export,new ToolStripSeparator(),file]);
        file.AutoSize=false;file.Width=520;file.TextAlign=ContentAlignment.MiddleLeft;top.Dock=DockStyle.Fill;layout.Controls.Add(top,0,0);
        var split=new SplitContainer {Dock=DockStyle.Fill,Size=new Size(1160,800),Orientation=Orientation.Horizontal,SplitterDistance=330,Panel1MinSize=180,Panel2MinSize=280,SplitterWidth=7};
        var upper=new TableLayoutPanel {Dock=DockStyle.Fill,ColumnCount=1,RowCount=3,Margin=Padding.Empty};
        upper.RowStyles.Add(new RowStyle(SizeType.Percent,100));upper.RowStyles.Add(new RowStyle(SizeType.Absolute,17));upper.RowStyles.Add(new RowStyle(SizeType.Absolute,38));
        upper.Controls.Add(plot,0,0);upper.Controls.Add(scroll,0,1);
        tools.Items.AddRange([cut,undoCut,new ToolStripSeparator(),zoomIn,zoomOut,fit,new ToolStripSeparator(),position,cancel]);
        tools.Dock=DockStyle.Fill;cancel.Alignment=ToolStripItemAlignment.Right;upper.Controls.Add(tools,0,2);
        split.Panel1.Controls.Add(upper);split.Panel2.Controls.Add(eq);layout.Controls.Add(split,0,1);
        var row=new TableLayoutPanel {Dock=DockStyle.Fill,ColumnCount=2,Margin=Padding.Empty};
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Percent,100));row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute,150));
        row.Controls.Add(status,0,0);row.Controls.Add(progress,1,0);layout.Controls.Add(row,0,2);
    }
    private async Task ImportAsync()
    {
        if(busy || closing)return;
        using var dialog=new OpenFileDialog {
            Title="音色器 · 导入音频",Filter="音频文件|*.wav;*.mp3;*.flac;*.m4a;*.aac;*.wma;*.mp4;*.aif;*.aiff;*.ogg;*.opus|所有文件|*.*",
            CheckFileExists=true,Multiselect=false,RestoreDirectory=true,InitialDirectory=preferences.ImportDirectory
        };
        if(dialog.ShowDialog(this)!=DialogResult.OK)return;
        await LoadSongAsync(dialog.FileName);
    }
    internal Task LoadSongAsync(string path) => operation=LoadSongCoreAsync(path);
    private async Task LoadSongCoreAsync(string path)
    {
        if(busy || closing)return;
        busy=true;player?.Pause();operationCancellation=new();UpdateEnabled();ImportedAudio? incoming=null;
        try
        {
            incoming=await AudioImporter.ImportAsync(path,Progress(),operationCancellation.Token);
            operationCancellation.Token.ThrowIfCancellationRequested();
            var next=new ClipSource(incoming,0,incoming.FrameCount);
            var nextEq=new EqSource(next,eq.Kernel);var nextLoop=new LoopSource(nextEq);
            var nextPlayer=CreatePlayer(nextLoop,incoming.ChannelMask);
            await CancelAnalysisAsync();
            if(player is not null)await player.DisposeAsync();
            audio?.Dispose();audio=incoming;incoming=null;clip=next;processed=nextEq;loop=nextLoop;player=nextPlayer;
            cutHistory.Clear();pendingSeek=0;plot.ClearAnalysis();plot.Timeline.Load(clip.FrameCount,clip.SampleRate);
            eq.SetSampleRate(clip.SampleRate);eq.ShowSpectrum([]);preferences.RememberImport(path);
            file.Text=$"{audio.FileName} · {clip.SampleRate:N0} Hz · {clip.Channels} 声道";file.ToolTipText=audio.SourcePath;
            status.Text="拖动红线定位、蓝线选区；Shift＋滚轮缩放，滚轮左右移动。剪切后可撤销。";
            ViewChanged();RefreshSelection();
        }
        catch(OperationCanceledException){status.Text="已取消导入，保留原片段。";}
        catch(Exception ex){status.Text="导入失败："+ex.Message;}
        finally{incoming?.Dispose();operationCancellation.Dispose();operationCancellation=null;busy=false;UpdateEnabled();}
    }
    private async Task TrimAsync(bool undo)
    {
        if(busy || closing || clip is null || (!undo && !plot.Timeline.HasSelection) || (undo && cutHistory.Count==0))return;
        var next=undo?cutHistory.Peek():clip.Trim(plot.Timeline.SelectionStart,plot.Timeline.SelectionEnd);
        if(!undo && next.Offset==clip.Offset && next.FrameCount==clip.FrameCount)return;
        busy=true;UpdateEnabled();
        try
        {
            await CancelAnalysisAsync();if(player is not null)await player.DisposeAsync();
            if(undo)cutHistory.Pop();else cutHistory.Push(clip);
            clip=next;processed=new EqSource(clip,eq.Kernel);loop=new LoopSource(processed);player=CreatePlayer(loop,audio!.ChannelMask);
            pendingSeek=0;plot.ClearAnalysis();plot.Timeline.Load(clip.FrameCount,clip.SampleRate);ViewChanged();RefreshSelection();
            eq.ShowSpectrum([]);
            status.Text=undo?"已撤销上一次剪切。":"已保留蓝线内的音频，蓝线已覆盖整个新片段。";
        }
        catch(Exception ex){status.Text="剪切失败："+ex.Message;}
        finally{busy=false;UpdateEnabled();}
    }
    private async Task ExportAsync()
    {
        if(busy || closing || audio is null || clip is null || !eq.Ready || !plot.Timeline.HasSelection)return;
        if(integrated){await CaptureToLibraryAsync();return;}
        using var dialog=new SaveFileDialog {
            Title="导出蓝线范围内的音频及 EQ 加工结果",Filter="WAV 音频 (*.wav)|*.wav",DefaultExt="wav",AddExtension=true,
            FileName=Path.GetFileNameWithoutExtension(audio.FileName)+"-音色器.wav",InitialDirectory=preferences.ExportDirectory,
            OverwritePrompt=true,CheckPathExists=true,RestoreDirectory=true
        };
        if(dialog.ShowDialog(this)!=DialogResult.OK)return;
        busy=true;operationCancellation=new();UpdateEnabled();
        try
        {
            await eq.SynchronizeAsync();
            var equalized=new EqSource(clip,eq.Kernel);
            var source=new ClipSource(equalized,plot.Timeline.SelectionStart,plot.Timeline.SelectionEnd-plot.Timeline.SelectionStart);
            var original=audio;var report=Progress();var token=operationCancellation.Token;
            await Task.Run(()=>WavExport.Write(source,original,dialog.FileName,report,token),token);
            preferences.RememberExport(dialog.FileName);status.Text="已导出："+dialog.FileName;
        }
        catch(OperationCanceledException){status.Text="已取消导出。";}
        catch(Exception ex){status.Text="导出失败："+ex.Message;}
        finally{operationCancellation.Dispose();operationCancellation=null;busy=false;UpdateEnabled();}
    }
    internal async Task CaptureToLibraryAsync()
    {
        if(busy || closing || audio is null || clip is null || !eq.Ready || !plot.Timeline.HasSelection)return;
        busy=true;operationCancellation=new();UpdateEnabled();
        try
        {
            if(TransferSelection is not null)
            {
                await eq.SynchronizeAsync();
                var selection=new ClipSource(new EqSource(clip,eq.Kernel),plot.Timeline.SelectionStart,
                    plot.Timeline.SelectionEnd-plot.Timeline.SelectionStart);
                await TransferSelection(selection,audio,operationCancellation.Token);
                status.Text="已传入分析界面；歌曲、选区和 EQ 继续保留。";
                return;
            }
            if(AddSample is null || ValidateSample is null)throw new InvalidOperationException("采样栏尚未准备好。");
            long first=plot.Timeline.SelectionStart,last=plot.Timeline.SelectionEnd;
            ValidateSample(clip.SampleRate,clip.Channels,last-first);
            await eq.SynchronizeAsync();
            var current=clip;var kernel=eq.Kernel;var original=audio;var report=Progress();var token=operationCancellation.Token;
            var sample=await Task.Run(()=>SampleCapture.Create(current,kernel,first,last,original,report,token),token);
            token.ThrowIfCancellationRequested();
            await AddSample(sample);
            status.Text="已加入采样栏；歌曲、选区和 EQ 已保留，可以继续截取。";
        }
        catch(OperationCanceledException){status.Text=TransferSelection is null?"已取消，歌曲和采样栏保留。":"已取消，歌曲和"+transferDestination+"保留。";}
        catch(Exception ex){status.Text=(TransferSelection is null?"无法加入采样栏：":"无法传入"+transferDestination+"：")+ex.Message;}
        finally{operationCancellation.Dispose();operationCancellation=null;busy=false;UpdateEnabled();}
    }
    internal void SuspendForNavigation(){resumeAfterEmptySelection=resumeAfterSeek=false;clock.Stop();player?.Pause();}
    internal void SetTransferTarget(string destination)
    {
        transferDestination=destination;
        back.Text="← 返回"+destination;export.Text="导出到"+destination;
        export.ToolTipText="将蓝线之间的音频及 EQ 结果传入"+destination+"，歌曲继续保留";
    }
    internal void ResumeForNavigation(){if(!closing)clock.Start();}
    private PlaybackEngine CreatePlayer(LoopSource source,uint mask)=>playbackFactory is null
        ?new PlaybackEngine(source,mask):new PlaybackEngine(source,playbackFactory,mask);
    private void BeginSelectionEdit()
    {
        selectingBlue=true;
    }
    private void UpdateLoopSelection()
    {
        if(player is null || loop is null)return;
        var t=plot.Timeline;
        var snapshot=player.Snapshot;
        if(pendingSeek>snapshot.SeekRevision){selectionRangeDirty=true;return;}
        selectionRangeDirty=false;
        if(!t.HasSelection)
        {
            resumeAfterEmptySelection|=selectingBlue && snapshot.IsPlaying;
            player.Pause();t.Move(TimelineMarker.Playhead,t.SelectionStart);return;
        }
        // Reanchor the mapping at the existing device clock. Pointer movement must
        // not seek or restart playback; only a crossed boundary changes the position.
        loop.UpdateRange(t.SelectionStart,t.SelectionEnd,snapshot.PositionFrames);
        t.Move(TimelineMarker.Playhead,loop.Position(snapshot.PositionFrames));
        if(resumeAfterEmptySelection && !busy && !closing){player.Play();resumeAfterEmptySelection=false;}
    }
    private void EndSelectionEdit()
    {
        if(!selectingBlue)return;
        selectingBlue=false;
        if(selectionRangeDirty)UpdateLoopSelection();
        if(!plot.Timeline.HasSelection)resumeAfterEmptySelection=false;
        RefreshSelection();UpdateEnabled();
    }
    private void ConfigureLoop(double frame)
    {
        if(loop is null || player is null)return;
        var t=plot.Timeline;
        if(!t.HasSelection){player.Pause();return;}
        double first=t.SelectionStart,last=t.SelectionEnd;
        frame=Math.Clamp(frame,first,last-1);t.Move(TimelineMarker.Playhead,frame);
        // Pause/seek flushes queued audio when selection boundaries change.
        loop.SetRange(t.SelectionStart,t.SelectionEnd,frame);pendingSeek=player.Seek(0);plot.Invalidate();
    }
    private void TogglePlay()
    {
        if(busy || closing || seeking || player is null || !eq.Ready || !plot.Timeline.HasSelection)return;
        resumeAfterEmptySelection=false;
        if(player.Snapshot.IsPlaying)player.Pause();else{ConfigureLoop(plot.Timeline.Playhead);player.Play();}
    }
    private void Rewind()
    {
        if(busy || player is null)return;
        resumeAfterEmptySelection=false;
        player.Pause();ConfigureLoop(plot.Timeline.SelectionStart);RefreshSelection();
    }
    private void RefreshPlayback()
    {
        if(closing || player is null || loop is null)return;
        var s=player.Snapshot;
        if(s.Error is not null)pendingSeek=0;
        if(selectionRangeDirty && !seeking)UpdateLoopSelection();
        if(!seeking && plot.Timeline.HasSelection && (pendingSeek==0 || s.SeekRevision>=pendingSeek))
        {pendingSeek=0;plot.Timeline.Move(TimelineMarker.Playhead,loop.Position(s.PositionFrames));}
        play.Text=s.IsPlaying?"Ⅱ":"▶";
        if(s.Error is not null && s.Error!=playbackError)status.Text="播放失败："+s.Error;
        playbackError=s.Error;RefreshSelection();plot.Invalidate();
        if(s.IsPlaying && pendingSeek==0 && !busy && eq.Ready && Environment.TickCount64-lastTraceTick>=150 && traceJob?.IsCompleted!=false)
        {
            lastTraceTick=Environment.TickCount64;traceCancellation=new();
            traceJob=MeasureSpectrumAsync(loop,(long)s.PositionFrames,analysisVersion,traceCancellation);
            analysisJobs.Add(traceJob);_=RemoveAnalysisAsync(traceJob);
        }
    }
    private void RefreshSelection()
    {
        if(clip is null)return;var t=plot.Timeline;
        position.Text=$"{Time(t.Playhead/clip.SampleRate)}  |  {Time(t.SelectionStart/(double)clip.SampleRate)} → {Time(t.SelectionEnd/(double)clip.SampleRate)}";
        position.ToolTipText=$"红线位置 · 蓝线循环范围；当前片段 {Time(clip.FrameCount/(double)clip.SampleRate)}";
    }
    private void Zoom(double factor){if(clip is null)return;plot.Timeline.Zoom(factor,.5);ViewChanged();}
    private void ViewChanged()
    {
        var t=plot.Timeline;syncingScroll=true;
        try
        {
            scroll.LargeChange=t.HasAudio?Math.Clamp((int)Math.Round(t.ViewLength/t.FrameCount*1_000_000),1,1_000_001):1_000_001;
            int max=scroll.Maximum-scroll.LargeChange+1;
            scroll.Value=t.FrameCount>t.ViewLength?Math.Clamp((int)Math.Round(t.ViewStart/(t.FrameCount-t.ViewLength)*max),0,max):0;
            scroll.Enabled=!busy && t.FrameCount>t.ViewLength;
        }
        finally{syncingScroll=false;}
        plot.Invalidate();ScheduleAnalysis();
    }
    private void ScheduleAnalysis()
    {
        if(clip is null || closing)return;
        analysisVersion++;analysisCancellation?.Cancel();debounce.Stop();debounce.Start();plot.Analyzing=true;
    }
    private void StartAnalysis()
    {
        if(clip is null || closing)return;
        var source=clip;var area=plot.PlotBounds;var cancellation=new CancellationTokenSource();analysisCancellation=cancellation;
        long first=Math.Clamp((long)Math.Floor(plot.Timeline.ViewStart),0,source.FrameCount-1);
        long last=Math.Clamp((long)Math.Ceiling(plot.Timeline.ViewEnd),first+1,source.FrameCount);
        var task=AnalyzeAsync(source,first,last,Math.Max(1,area.Width),Math.Max(1,area.Height),analysisVersion,cancellation);
        analysisJobs.Add(task);_=RemoveAnalysisAsync(task);
    }
    private async Task AnalyzeAsync(ClipSource source,long first,long last,int width,int height,long version,CancellationTokenSource cancellation)
    {
        try
        {
            var result=await Task.Run(()=>AudioAnalysis.Analyze(source,first,last,width,height,cancellation.Token),cancellation.Token);
            if(!closing && !cancellation.IsCancellationRequested && version==analysisVersion)plot.SetAnalysis(result);
        }
        catch(OperationCanceledException){}
        catch(Exception ex){if(!closing && version==analysisVersion)status.Text="频谱分析失败："+ex.Message;}
        finally
        {
            if(ReferenceEquals(analysisCancellation,cancellation))analysisCancellation=null;cancellation.Dispose();
            if(!closing && version==analysisVersion){plot.Analyzing=false;plot.Invalidate();}
        }
    }
    private async Task RemoveAnalysisAsync(Task task){await task;analysisJobs.Remove(task);}
    private async Task MeasureSpectrumAsync(LoopSource source,long frame,long version,CancellationTokenSource cancellation)
    {
        try
        {
            var result=await Task.Run(()=>SignalSpectrum.Measure(source,frame,cancellation.Token),cancellation.Token);
            if(!closing && !cancellation.IsCancellationRequested && version==analysisVersion)eq.ShowSpectrum(result);
        }
        catch(OperationCanceledException){}
        catch(Exception ex){if(!closing && version==analysisVersion)status.Text="EQ 频谱分析失败："+ex.Message;}
        finally{if(ReferenceEquals(traceCancellation,cancellation))traceCancellation=null;cancellation.Dispose();}
    }
    private async Task CancelAnalysisAsync()
    {
        debounce.Stop();analysisVersion++;analysisCancellation?.Cancel();traceCancellation?.Cancel();
        if(analysisJobs.Count!=0)await Task.WhenAll(analysisJobs.ToArray());
    }
    private void UpdateEnabled()
    {
        import.Enabled=!busy && !closing;
        back.Enabled=!busy && !closing;
        play.Enabled=audio is not null && !busy && !closing && eq.Ready && plot.Timeline.HasSelection;
        stop.Enabled=audio is not null && !busy && !closing;
        export.Enabled=audio is not null && !busy && !closing && eq.Ready && plot.Timeline.HasSelection;
        cut.Enabled=audio is not null && !busy && !closing && plot.Timeline.HasSelection;
        undoCut.Enabled=cutHistory.Count>0 && !busy && !closing;
        zoomIn.Enabled=zoomOut.Enabled=fit.Enabled=audio is not null && !busy && !closing;
        plot.Enabled=eq.Enabled=!busy && !closing;scroll.Enabled=!busy && clip is not null && plot.Timeline.ViewLength<clip.FrameCount;
        cancel.Visible=busy;progress.Visible=busy;
    }
    private IProgress<AudioProgress> Progress()=>new Progress<AudioProgress>(p=>{if(closing)return;status.Text=p.Message;progress.Value=(int)Math.Round(Math.Clamp(p.Fraction,0,1)*1000);});
    protected override bool ProcessCmdKey(ref Message msg,Keys keyData)
    {
        if(keyData==Keys.Space){TogglePlay();return true;}
        if(keyData==(Keys.Control|Keys.O) && !busy){operation=ImportAsync();return true;}
        if(keyData==(Keys.Control|Keys.S) && !busy){operation=ExportAsync();return true;}
        if(keyData==Keys.Escape && busy){operationCancellation?.Cancel();return true;}
        return base.ProcessCmdKey(ref msg,keyData);
    }
    private async void ClosingAsync(object? sender,FormClosingEventArgs e)
    {
        if(allowClose)return;e.Cancel=true;if(closing)return;
        await ShutdownAsync();Close();
    }
    internal Task ShutdownAsync()=>shutdownTask??=ShutdownCoreAsync();
    private async Task ShutdownCoreAsync()
    {
        closing=true;clock.Stop();debounce.Stop();operationCancellation?.Cancel();analysisCancellation?.Cancel();UpdateEnabled();
        try{await operation;await initialization;await CancelAnalysisAsync();if(player is not null)await player.DisposeAsync();audio?.Dispose();}
        catch(Exception ex){MessageBox.Show(this,"关闭时遇到问题："+ex.Message,"音色器");}
        finally{clock.Dispose();debounce.Dispose();allowClose=true;}
    }
    private static string Time(double seconds)=>$"{(int)(seconds/60):00}:{seconds%60:00.000}";
    private static ToolStrip Bar()=>new(){GripStyle=ToolStripGripStyle.Hidden,BackColor=Color.Transparent,Padding=Padding.Empty,Margin=Padding.Empty};
    private static ToolStripButton Button(string text)=>new(text){DisplayStyle=ToolStripItemDisplayStyle.Text,Margin=new Padding(2,3,2,3),Padding=new Padding(7,2,7,2)};
}
