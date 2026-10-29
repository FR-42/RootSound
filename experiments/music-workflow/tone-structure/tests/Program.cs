using System.Diagnostics;
using System.Reflection;
using System.Text.Json;
using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Core;
using RootSound.SampleEditor.Playback;
using RootSound.ToneProcessor;

namespace RootSound.ToneStructure.Tests;
internal static partial class Program
{
    private static int checks;
    [STAThread]
    private static int Main(string[] args)
    {
        try
        {
            Application.SetHighDpiMode(HighDpiMode.PerMonitorV2);Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);
            string root=Path.GetFullPath(args[0]);Directory.CreateDirectory(root);
            if(args.Contains("--ui-only")){CheckUiAndTransfer(root);CheckCpuDefault(root);}
            else{CheckDecomposition(root);CheckLongAndCancellation(root);CheckAlgorithms(root);CheckUiAndTransfer(root);CheckModel(root);}
            File.WriteAllText(Path.Combine(root,"test-summary.json"),JsonSerializer.Serialize(new{checks,desktopWindowShown=false,realAudioDeviceUsed=false}));
            Console.WriteLine($"PASS {checks} structure checks. Evidence: {root}");return 0;
        }
        catch(Exception ex){Console.Error.WriteLine(ex);return 1;}
    }
    private static void CheckDecomposition(string root)
    {
        using var store=new AudioStore(root);var source=new Synthetic(16000,2,16,true);var asset=store.Copy(source,null,CancellationToken.None);
        var watch=Stopwatch.StartNew();var children=Decomposer.Split(asset,4,store,null,CancellationToken.None);watch.Stop();
        Check(children.Length>=2 && children.Length<=4,"nontrivial mixture produces distinct components");
        Check(children.All(x=>x.FrameCount==source.FrameCount && x.Channels==2 && x.SampleRate==16000),"all layers preserve length, alignment and stereo format");
        double error=Reconstruction(asset,children);Check(error<2e-7,"components reconstruct parent rather than duplicate it");
        double[][] amplitudes=children.Select(x=>new[]{Amplitude(x,220),Amplitude(x,1320)}).ToArray();
        int low=Enumerable.Range(0,children.Length).MaxBy(i=>amplitudes[i][0]);int high=Enumerable.Range(0,children.Length).MaxBy(i=>amplitudes[i][1]);
        Check(low!=high,"different repeating tone families are assigned to different layers");
        double lowShare=amplitudes[low][0]/amplitudes.Sum(x=>x[0]),highShare=amplitudes[high][1]/amplitudes.Sum(x=>x[1]);
        Check(lowShare>.65 && highShare>.65,"controlled target components are concentrated, not uniformly copied across layers");
        Check(children.All(x=>Difference(asset,x)>.005),"no output is a full copy of the input");
        var origin=MakeOrigin(root,source,"decomposition-source.wav");
        using var session=new StructureSession(store,asset,origin);
        var initial=session.Layers[0];session.Commit(initial.Id,children);Check(session.Decomposed && session.Layers.Length==children.Length,"initial split replaces parent");
        var ids=session.Layers.Select(x=>x.Id).ToArray();session.SetActive(ids[0],false);
        Check(!session.Layers[0].Active && session.Layers.Skip(1).All(x=>x.Active),"mute affects only its layer");
        session.SetActive(ids[0],true);Check(Reconstruction(asset,[new MixAdapter(session.Mix)])<2e-7,"all-active playback reconstructs the input");
        AudioAsset[] fine=[];Layer? target=null;
        foreach(var layer in session.Layers)
        {fine=Decomposer.Split(layer.Audio,2,store,null,CancellationToken.None);if(fine.Length>1){target=layer;break;}}
        Check(target is not null,"at least one complex estimated layer supports finer decomposition");
        Check(Reconstruction(target!.Audio,fine)<2e-7,"finer components sum to their selected parent");
        session.SetActive(target.Id,false);var before=session.Layers.ToArray();session.Commit(target.Id,fine);
        Check(session.Layers.Length==before.Length-1+fine.Length && session.Layers.All(x=>x.Id!=target.Id),"further decomposition replaces only selected layer and never mixes parent with children");
        Check(session.Layers.Where(x=>fine.Contains(x.Audio)).All(x=>!x.Active),"new children inherit parent's mute state");
        session.Undo();Check(session.Layers.SequenceEqual(before),"undo restores exact previous layers and activation states");
        foreach(var id in ids)session.SetActive(id,true);
        var snapshot=session.Snapshot();var factory=new Factory(16000,2);using(var player=new PlaybackEngine(session.Mix,factory))
        {
            player.Play();Until(()=>player.Snapshot.IsPlaying);int resets=factory.Device.Resets;
            session.SetActive(ids[0],false);Check(factory.Device.Resets==resets && player.Snapshot.IsPlaying,"muting does not restart the shared playback clock");
            double at=player.Snapshot.PositionFrames;factory.Device.Advance(100);Until(()=>player.Snapshot.PositionFrames>at);
            Check(player.Snapshot.PositionFrames>at,"all layers share one advancing device clock");
            long revision=player.Seek(12345);Until(()=>player.Snapshot.SeekRevision>=revision);Check(Math.Abs(player.Snapshot.PositionFrames-12345)<1,"seek changes all layers together");
        }
        Check(Difference(snapshot,session.Mix)>.001,"export snapshots are independent of later activation changes");
        session.Undo();Check(!session.Decomposed && session.Layers.Length==1,"undo initial split returns to one input without extra tracks");
        string wav=Path.Combine(root,"structure-export.wav");WavExport.Write(session.Mix,origin,wav);
        using(var reimport=AudioImporter.Import(wav,null,CancellationToken.None,root))Check(reimport.FrameCount==source.FrameCount,"mix export preserves full duration");
        Throws<IOException>(()=>WavExport.Write(session.Mix,origin,origin.SourcePath));origin.Dispose();
        File.WriteAllText(Path.Combine(root,"separation-metrics.json"),JsonSerializer.Serialize(new{layers=children.Length,reconstructionMaximumError=error,lowShare,highShare,seconds=watch.Elapsed.TotalSeconds}));
        Console.WriteLine($"Decomposition: {children.Length} layers; max sum error {error:E2}; controlled separation {lowShare:0.000}/{highShare:0.000}; {watch.Elapsed.TotalSeconds:0.00}s.");
    }
    private static void CheckLongAndCancellation(string root)
    {
        using var store=new AudioStore(root);var longSource=new Synthetic(8000,1,721,false);var asset=store.Copy(longSource,null,CancellationToken.None);
        Check(asset.FrameCount==721L*8000,"disk-backed input supports more than ten minutes");
        float[] tail=new float[10];Check(asset.ReadFrames(asset.FrameCount-10,tail)==10 && tail.All(float.IsFinite),"long input tail remains readable");
        using var canceled=new CancellationTokenSource();canceled.Cancel();int before=Directory.GetFiles(store.DirectoryPath).Length;
        Throws<OperationCanceledException>(()=>store.Copy(longSource,null,canceled.Token));Check(Directory.GetFiles(store.DirectoryPath).Length==before,"canceled transfer preserves existing cache only");
        var complex=store.Copy(new Synthetic(8000,1,6,true),null,CancellationToken.None);before=Directory.GetFiles(store.DirectoryPath).Length;
        using var midCancel=new CancellationTokenSource();var report=new InlineProgress(p=>{if(p.Fraction>.34)midCancel.Cancel();});
        Throws<OperationCanceledException>(()=>Decomposer.Split(complex,4,store,report,midCancel.Token));
        Check(Directory.GetFiles(store.DirectoryPath).Length==before,"canceling a real decomposition removes only unfinished outputs");
        var silence=store.Copy(new Silence(),null,CancellationToken.None);Check(Decomposer.Split(silence,4,store,null,CancellationToken.None).Length==0,"silence does not create fake copies");
        var sine=store.Copy(new Synthetic(8000,1,8,false),null,CancellationToken.None);Check(Decomposer.Split(sine,4,store,null,CancellationToken.None).Length<2,"single stationary tone is not duplicated into fake independent layers");
    }
    private static void CheckUiAndTransfer(string root)
    {
        SynchronizationContext.SetSynchronizationContext(new WindowsFormsSynchronizationContext());
        using var structure=new StructureForm(root,new Factory(16000,2));using var capture=new RootSound.ToneProcessor.MainForm(root,integrated:true,initializeEq:false);
        Check(Field<ModelDevice>(structure,"currentDevice")==ModelDevice.Cpu,"structure form defaults to CPU as requested after performance comparison");
        _=structure.Handle;_=capture.Handle;structure.PerformLayout();
        capture.SetTransferTarget("结构分析");capture.TransferSelection=structure.LoadSelectionAsync;
        using var origin=MakeOrigin(root,new Synthetic(16000,2,45,true),"long-transfer.wav");
        RunUi(()=>capture.LoadSongAsync(origin.SourcePath));var plot=Field<RootSound.SampleEditor.Controls.AudioPlot>(capture,"plot");
        plot.Timeline.Move(TimelineMarker.SelectionEnd,40L*16000);
        var eq=Field<EqPanel>(capture,"eq");string? failure=null;eq.Failed+=message=>failure=message;
        SynchronizationContext.SetSynchronizationContext(new WindowsFormsSynchronizationContext());
        RunUi(()=>eq.InitializeAsync(Path.Combine(root,"webview-cache")));Until(()=>eq.Ready || failure is not null);Check(failure is null,"shared capture EQ starts in hidden host: "+failure);
        RunUi(()=>capture.CaptureToLibraryAsync());Check(structure.HasInput,"capture sends a selection directly to structure view");
        var current=Field<StructureSession>(structure,"session");Check(current.Original.FrameCount==40L*16000,"shared capture has no timbre-lab 30-second limit for this tool");
        var audio=Field<ImportedAudio>(capture,"audio");RunUi(()=>capture.LoadSongAsync(origin.SourcePath));
        Check(current.Original.ReadFrames(0,new float[100])==50,"structure input owns independent audio when capture replaces its song");
        Check(!ReferenceEquals(audio,Field<ImportedAudio>(capture,"audio")),"capture can keep working independently");
        Wait(Field<Task>(structure,"traceTask"));
        SynchronizationContext.SetSynchronizationContext(new WindowsFormsSynchronizationContext());
        Invoke(structure,"ScheduleTrace",0d);Invoke(structure,"Seek",100000d);
        Check(Field<bool>(structure,"traceDirty"),"rapid paused seek queues the latest spectrum instead of dropping it");
        Wait(Field<Task>(structure,"traceTask"));
        var player=Field<PlaybackEngine>(structure,"player");Until(()=>player.Snapshot.SeekRevision>=Field<long>(structure,"pendingSeek"));
        Thread.Sleep(110);Invoke(structure,"RefreshClock");Wait(Field<Task>(structure,"traceTask"));
        Check(!Field<bool>(structure,"traceDirty"),"queued spectrum refresh runs while playback remains paused");
        var master=Field<SpectrumView>(structure,"master");var toolbar=Field<ToolStrip>(structure,"top");
        Check(master.Top>=0 && structure.Controls.Count>=2,"analysis interface constructs without a visible window");
        using(var bitmap=new Bitmap(1000,180))
        using(var chart=new SpectrumView{Size=new Size(1000,180),SampleRate=16000,Caption="频率 Hz / 音量 dBFS"})
        {chart.SetPoints(SignalSpectrum.Measure(current.Original,12000,CancellationToken.None));chart.DrawToBitmap(bitmap,chart.ClientRectangle);bitmap.Save(Path.Combine(root,"line-spectrum.png"));}
        RunUi(()=>structure.DecomposeAsync(false,SeparationMethod.Templates));Check(current.Decomposed,"decompose button path commits real layers");
        Wait(Field<Task>(structure,"traceTask"));
        var beforeRefine=current.Layers.ToArray();structure.SelectLayer(beforeRefine[0].Id);current.SetActive(beforeRefine[0].Id,false);
        RunUi(()=>structure.DecomposeAsync(true,SeparationMethod.HarmonicPercussive));
        Check(current.Layers.Length==beforeRefine.Length+1 && current.Layers.Skip(2).Select(x=>x.Id).SequenceEqual(beforeRefine.Skip(1).Select(x=>x.Id)),"different-method refinement only replaces selected parent");
        Check(current.Layers.Take(2).All(x=>!x.Active),"different-method children inherit parent's mute state");
        RunUi(()=>structure.UndoAsync());current.SetActive(beforeRefine[0].Id,true);
        Wait(Field<Task>(structure,"traceTask"));
        LogicalVisibility(structure,true);
        try
        {
            LayoutTree(structure);
            using var bitmap=new Bitmap(structure.ClientSize.Width,structure.ClientSize.Height);
            using(var graphics=Graphics.FromImage(bitmap))
            {graphics.Clear(structure.BackColor);foreach(Control child in structure.Controls.Cast<Control>().Reverse())DrawChild(graphics,child,Point.Empty);}
            bitmap.Save(Path.Combine(root,"structure-layout.png"));
            Check(!IsWindowVisible(structure.Handle),"offscreen layout render never shows the native window");
            var plots=Descendants(structure).OfType<SpectrumView>().ToArray();
            Check(plots.All(x=>x.Width==master.Width && LeftInForm(x)==LeftInForm(master)),"master and all layer frequency axes align exactly even with scrolling");
        }
        finally{LogicalVisibility(structure,false);}
        var active=current.Layers.ToArray();structure.SelectLayer(active[0].Id);
        RunUi(()=>structure.DecomposeAsync(false,SeparationMethod.MidSide));Check(current.Layers.Length==2 && current.Layers[0].Name.Contains("中央"),"UI re-decomposition uses selected method on original");
        Check(Reconstruction(current.Original,current.Layers.Select(x=>x.Audio))<2e-7,"switching methods replaces the entire result without adding old layers");
        RunUi(()=>structure.UndoAsync());Check(current.Layers.Select(x=>x.Id).SequenceEqual(active.Select(x=>x.Id)),"undo restores previous algorithm results exactly");
        RunUi(()=>structure.UndoAsync());Check(!current.Decomposed,"UI undo restores input");
        using(var dialog=new MethodDialog(Experiment,1,SeparationMethod.Demucs,false,16))
        {
            _=dialog.Handle;RunUi(()=>dialog.DetectGpuAsync(Experiment));
            var device=Field<FlowLayoutPanel>(dialog,"device");
            Check(device.Enabled && dialog.SelectedDevice==ModelDevice.Cpu,"method chooser defaults to CPU after the user's measured-performance choice");
            Field<RadioButton>(dialog,"gpu").Checked=true;Check(dialog.SelectedDevice==ModelDevice.Gpu,"method chooser selects strict GPU mode");Field<RadioButton>(dialog,"automatic").Checked=true;Check(dialog.SelectedDevice==ModelDevice.Auto,"method chooser can explicitly select GPU-priority auto mode");Field<RadioButton>(dialog,"cpu").Checked=true;
            Check(Field<Label>(dialog,"deviceInfo").Text.Contains("可用 GPU"),"chooser displays actual detected GPU without a desktop window");
            LogicalVisibility(dialog,true);
            try
            {
                LayoutTree(dialog);using var bitmap=new Bitmap(dialog.ClientSize.Width,dialog.ClientSize.Height);
                using(var graphics=Graphics.FromImage(bitmap)){graphics.Clear(dialog.BackColor);foreach(Control child in dialog.Controls.Cast<Control>().Reverse())DrawChild(graphics,child,Point.Empty);}
                bitmap.Save(Path.Combine(root,"method-dialog.png"));
                Check(!IsWindowVisible(dialog.Handle),"algorithm chooser renders without showing a desktop window");
                var choices=Field<Dictionary<SeparationMethod,RadioButton>>(dialog,"choices");
                Check(choices.Count==5 && !choices[SeparationMethod.MidSide].Enabled,"chooser offers five methods and explains unavailable mono spatial split");
                choices[SeparationMethod.HarmonicPercussive].Checked=true;Check(dialog.Selected==SeparationMethod.HarmonicPercussive && choices.Values.Count(x=>x.Checked)==1,"method selection is exclusive across panels");
                Check(!device.Enabled,"GPU selector is disabled for the traditional CPU algorithms");
            }
            finally{LogicalVisibility(dialog,false);}
        }
        RunUi(()=>capture.ShutdownAsync());RunUi(()=>structure.ShutdownAsync());
        Console.WriteLine("Hidden shared capture, >30s transfer, live spectrum, decomposition and undo passed; no desktop/audio device used.");
    }
    private static ImportedAudio MakeOrigin(string root,IAudioFrameSource source,string name)
    {
        string path=Path.Combine(root,name);using(var stream=File.Create(path))
        {
            stream.Write(AudioExporter.BuildHeader(source.SampleRate,source.Channels,source.FrameCount));float[] buffer=new float[8192*source.Channels];byte[] pcm=new byte[buffer.Length*3];
            for(long frame=0;frame<source.FrameCount;){int take=source.ReadFrames(frame,buffer.AsSpan(0,(int)Math.Min(8192,source.FrameCount-frame)*source.Channels));AudioExporter.EncodePcm24(buffer.AsSpan(0,take*source.Channels),pcm);stream.Write(pcm,0,take*source.Channels*3);frame+=take;}
            if((source.FrameCount*source.Channels*3&1)!=0)stream.WriteByte(0);
        }
        return AudioImporter.Import(path,null,CancellationToken.None,root);
    }
    private static double Reconstruction(IAudioFrameSource parent,IEnumerable<IAudioFrameSource> children)
    {
        var parts=children.ToArray();float[] original=new float[4096*parent.Channels],sum=new float[original.Length],part=new float[original.Length];double error=0;
        for(long frame=0;frame<parent.FrameCount;frame+=4096){int count=parent.ReadFrames(frame,original);Array.Clear(sum);foreach(var child in parts){child.ReadFrames(frame,part);for(int i=0;i<count*parent.Channels;i++)sum[i]+=part[i];}for(int i=0;i<count*parent.Channels;i++)error=Math.Max(error,Math.Abs(sum[i]-original[i]));}return error;
    }
    private static double Difference(IAudioFrameSource a,IAudioFrameSource b)
    {
        float[] x=new float[4096*a.Channels],y=new float[x.Length];double sum=0;long samples=0;
        for(long frame=0;frame<a.FrameCount;frame+=4096){int count=a.ReadFrames(frame,x);b.ReadFrames(frame,y);for(int i=0;i<count*a.Channels;i++){double d=x[i]-y[i];sum+=d*d;}samples+=count*a.Channels;}return Math.Sqrt(sum/Math.Max(1,samples));
    }
    private static double Amplitude(IAudioFrameSource source,double hz)
    {
        float[] buffer=new float[4096*source.Channels];double re=0,im=0;
        for(long frame=0;frame<source.FrameCount;frame+=4096){int count=source.ReadFrames(frame,buffer);for(int i=0;i<count;i++){double phase=2*Math.PI*hz*(frame+i)/source.SampleRate;re+=buffer[i*source.Channels]*Math.Cos(phase);im+=buffer[i*source.Channels]*Math.Sin(phase);}}
        return Math.Sqrt(re*re+im*im)*2/source.FrameCount;
    }
    private sealed class MixAdapter(IAudioFrameSource source):IAudioFrameSource
    {public int SampleRate=>source.SampleRate;public int Channels=>source.Channels;public long FrameCount=>source.FrameCount;public int ReadFrames(long f,Span<float>d)=>source.ReadFrames(f,d);}
    private sealed class Synthetic(int rate,int channels,int seconds,bool complex):IAudioFrameSource
    {
        public int SampleRate=>rate;public int Channels=>channels;public long FrameCount=>(long)rate*seconds;
        public int ReadFrames(long start,Span<float> destination)
        {
            int count=(int)Math.Min(FrameCount-start,destination.Length/channels);
            for(int i=0;i<count;i++)
            {
                double t=(start+i)/(double)rate;
                double a=.18*Math.Sin(2*Math.PI*220*t)*(complex?(t%1<.48?1:.03):1);
                double b=complex?.15*Math.Sin(2*Math.PI*1320*t)*(t%1.37<.9?1:.02):0;
                double noise=complex && t%.73<.055?.07*Math.Sin(2*Math.PI*3217*t)*Math.Exp(-(t%.73)*45):0;
                for(int ch=0;ch<channels;ch++)destination[i*channels+ch]=(float)((ch==0?a:-a)+b+noise);
            }
            destination[(count*channels)..].Clear();return count;
        }
    }
    private sealed class Silence:IAudioFrameSource{public int SampleRate=>8000;public int Channels=>1;public long FrameCount=>8000;public int ReadFrames(long f,Span<float>d){d.Clear();return (int)Math.Min(FrameCount-f,d.Length);}}
    private sealed class InlineProgress(Action<AudioProgress> report):IProgress<AudioProgress>{public void Report(AudioProgress value)=>report(value);}
    private sealed class Factory(int rate,int channels):IPlaybackDeviceFactory{internal Device Device=new(rate,channels);public IPlaybackDevice Open()=>Device;}
    private sealed class Device(int rate,int channels):IPlaybackDevice
    {
        private readonly object gate=new();private long clock,submitted;private bool running;private int resets;
        public int SampleRate=>rate;public int Channels=>channels;public int BufferFrames=>rate/10;
        public int Resets{get{lock(gate)return resets;}}public int PaddingFrames{get{lock(gate)return (int)Math.Max(0,submitted-clock);}}public double PlayedFrames{get{lock(gate)return clock;}}
        public void Write(ReadOnlySpan<float>d){lock(gate)submitted+=d.Length/channels;}public void Start(){lock(gate)running=true;}public void Stop(){lock(gate)running=false;}public void Reset(){lock(gate){clock=submitted=0;resets++;}}public void Dispose(){lock(gate)running=false;}
        internal void Advance(int frames){lock(gate)if(running)clock=Math.Min(submitted,clock+frames);}
    }
    private static T Field<T>(object target,string name)=>(T)target.GetType().GetField(name,BindingFlags.Instance|BindingFlags.NonPublic)!.GetValue(target)!;
    private static object? Invoke(object target,string name,params object[] args)=>target.GetType().GetMethod(name,BindingFlags.Instance|BindingFlags.NonPublic)!.Invoke(target,args);
    private static void LayoutTree(Control control){control.PerformLayout();foreach(Control child in control.Controls)LayoutTree(child);}
    private static IEnumerable<Control> Descendants(Control control)=>control.Controls.Cast<Control>().SelectMany(x=>new[]{x}.Concat(Descendants(x)));
    private static int LeftInForm(Control control){int x=0;for(Control? current=control;current is not null && current is not Form;current=current.Parent)x+=current.Left;return x;}
    private static void DrawChild(Graphics target,Control control,Point origin)
    {
        var get=typeof(Control).GetMethod("GetState",BindingFlags.Instance|BindingFlags.NonPublic)!;
        bool visible=(bool)get.Invoke(control,[Enum.Parse(get.GetParameters()[0].ParameterType,"Visible")])!;
        if(!visible || control.Width<1 || control.Height<1)return;
        Point at=new(origin.X+control.Left,origin.Y+control.Top);
        using var image=new Bitmap(control.Width,control.Height);control.DrawToBitmap(image,new Rectangle(Point.Empty,control.Size));target.DrawImageUnscaled(image,at);
        var state=target.Save();target.SetClip(new Rectangle(at,control.Size),System.Drawing.Drawing2D.CombineMode.Intersect);
        foreach(Control child in control.Controls.Cast<Control>().Reverse())DrawChild(target,child,at);
        target.Restore(state);
    }
    private static void LogicalVisibility(Control control,bool visible)
    {
        var method=typeof(Control).GetMethod("SetState",BindingFlags.Instance|BindingFlags.NonPublic)!;
        method.Invoke(control,[Enum.Parse(method.GetParameters()[0].ParameterType,"Visible"),visible]);
    }
    [System.Runtime.InteropServices.DllImport("user32.dll")]
    [return:System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.Bool)]
    private static extern bool IsWindowVisible(nint window);
    private static void Wait(Task task){Until(()=>task.IsCompleted);task.GetAwaiter().GetResult();}
    private static void RunUi(Func<Task> action){SynchronizationContext.SetSynchronizationContext(new WindowsFormsSynchronizationContext());Wait(action());}
    private static void Until(Func<bool> done){var timer=Stopwatch.StartNew();while(!done()){if(timer.Elapsed.TotalSeconds>60)throw new TimeoutException("Structure check timed out.");Application.DoEvents();Thread.Sleep(5);}}
    private static void Check(bool value,string message){if(!value)throw new InvalidOperationException(message);checks++;}
    private static void Throws<T>(Action action)where T:Exception{try{action();}catch(T){checks++;return;}throw new InvalidOperationException("Expected "+typeof(T).Name);}
}
