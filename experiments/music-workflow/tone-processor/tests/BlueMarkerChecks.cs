using System.Diagnostics;
using System.Reflection;
using RootSound.SampleEditor.Controls;
using RootSound.SampleEditor.Core;
using RootSound.SampleEditor.Playback;
using RootSound.TimbreLab.Audio;
using RootSound.TimbreLab.Controls;
using RootSound.TimbreLab.Core;

namespace RootSound.ToneProcessor.Tests;
internal static class BlueMarkerChecks
{
    private static int checks;
    internal static int Run(string root)
    {
        CheckTimeline();CheckLoopMapping();CheckPolishing();CheckLiveTransport(root);
        Console.WriteLine($"PASS {checks} blue-marker checks; live playback verified with simulated device.");return checks;
    }
    private static void CheckTimeline()
    {
        var t=new Timeline {AllowSelectionCrossing=true};t.Load(10000,1000);
        t.Move(TimelineMarker.SelectionStart,2000);t.Move(TimelineMarker.SelectionEnd,6000);
        t.BeginDrag(TimelineMarker.SelectionStart,0);t.Drag(500,1000,false);
        Check(t.Position(TimelineMarker.SelectionStart)==7000 && t.Position(TimelineMarker.SelectionEnd)==6000,"first blue marker crosses second without sticking or swapping identity");
        Check(t.SelectionStart==6000 && t.SelectionEnd==7000 && t.HasSelection,"selection is ordered independently of marker identity");
        t.Drag(490,1000,true);Check(t.Position(TimelineMarker.SelectionStart)==6990,"Shift precision remains continuous after crossing");
        t.Drag(200,1000,false);Check(t.Position(TimelineMarker.SelectionStart)==4090 && t.SelectionStart==4090,"same gesture can return across the other blue line");t.EndDrag();
        t.Move(TimelineMarker.SelectionEnd,1000);Check(t.SelectionStart==1000 && t.SelectionEnd==4090,"second blue line also crosses freely");
        Check(t.BoundaryMarker(true)==TimelineMarker.SelectionEnd,"numeric earlier boundary resolves the spatial marker");
        t.Move(TimelineMarker.SelectionStart,1000);Check(!t.HasSelection,"coincident markers produce an empty region");
        t.Nudge(TimelineMarker.SelectionStart,1,true);Check(t.SelectionEnd==1001,"one-frame selection remains possible");
        var legacy=new Timeline();legacy.Load(10000,1000);legacy.Move(TimelineMarker.SelectionEnd,3000);legacy.Move(TimelineMarker.SelectionStart,9000);
        Check(legacy.SelectionStart==3000 && legacy.SelectionEnd==3000,"other tools retain their existing default selection contract");
    }
    private static void CheckLoopMapping()
    {
        var loop=new LoopSource(new Ramp());loop.SetRange(1000,8000,2000);
        float[] data=new float[16];
        for(int i=0;i<40;i++)
        {
            long clock=100+i*10;double before=loop.Position(clock);
            loop.UpdateRange(1000+i,8000-i,clock);
            Check(loop.Position(clock)==before,"moving a boundary away from red preserves its exact position");
            loop.ReadFrames(clock,data);Check(Math.Abs(data[0]-(float)(before/20000))<1e-7,"live read follows the same uninterrupted sample clock");
        }
        loop.UpdateRange(4000,9000,500);Check(loop.Position(500)==4000,"boundary crossing the red position relocates it into the selection");
        Check(loop.Position(5499)==8999 && loop.Position(5500)==4000,"new edge loops at the correct time without resetting the clock");
        loop.UpdateRange(3500,10000,5490);Check(loop.Position(5490)==8990,"extending a range keeps red moving normally");
        loop.ReadFrames(5488,data);Check(data.All(float.IsFinite),"resampler history before a new anchor remains valid");
    }
    private static void CheckPolishing()
    {
        using var lab=new RootSound.TimbreLab.MainForm(new AuditionSession(),integrated:true);
        var workspace=Field<SampleWorkspace>(lab,"_workspace");
        var samples=Enumerable.Range(0,48000).Select(x=>(float)(.1*Math.Sin(x*.03))).ToArray();
        var clip=new PcmClip(48000,1,samples,"crossed selection");workspace.Add(new SampleEntry(clip,null));Invoke(lab,"ResetTrim");
        workspace.TryApply(workspace.Revision,new ProcessingResult(clip,60,1,[]));
        var graph=Field<SampleGraph>(lab,"_graph");graph.Timeline.Move(TimelineMarker.SelectionStart,38000);graph.Timeline.Move(TimelineMarker.SelectionEnd,14000);
        var patch=(InstrumentPatch)Invoke(lab,"GetPatch")!;
        Check(patch.Audio.FrameCount==24000 && patch.Audio.Samples[0]==samples[14000],"polishing saves the region between crossed markers");
        Invoke(lab,"ChangeSelection",TimelineMarker.SelectionStart,.35m);
        Check(graph.Timeline.Position(TimelineMarker.SelectionEnd)==16800 && graph.Timeline.Position(TimelineMarker.SelectionStart)==38000,"earlier numeric input edits the spatial earlier marker after crossing");
        Wait(lab.ShutdownAsync());
    }
    private static void CheckLiveTransport(string root)
    {
        SynchronizationContext.SetSynchronizationContext(new WindowsFormsSynchronizationContext());
        var factory=new Factory();using var form=new MainForm(root,initializeEq:false,playbackFactory:factory);
        _=form.Handle;Wait(form.LoadSongAsync(Path.Combine(root,"long-12m01s.wav")));
        var plot=Field<AudioPlot>(form,"plot");var timeline=plot.Timeline;
        timeline.Move(TimelineMarker.SelectionStart,1000);timeline.Move(TimelineMarker.SelectionEnd,8000);timeline.Move(TimelineMarker.Playhead,2000);
        timeline.Zoom(timeline.FrameCount/20000d,0);Invoke(form,"ConfigureLoop",2000d);
        var player=Field<PlaybackEngine>(form,"player");player.Play();Until(()=>player.Snapshot.IsPlaying);
        var device=factory.Device;int resets=device.Resets,stops=device.Stops;long revision=player.Snapshot.SeekRevision;
        int X(double frame)=>plot.PlotBounds.Left+(int)Math.Round(timeline.FractionAt(frame)*plot.PlotBounds.Width);
        plot.BeginGesture(new Point(X(1000),plot.PlotBounds.Bottom+6));
        double firstClock=player.Snapshot.PositionFrames;
        bool continuous=true,unmoved=true;
        for(int i=0;i<20;i++)
        {
            double previous=player.Snapshot.PositionFrames;device.Advance(16);Until(()=>player.Snapshot.PositionFrames>previous);
            double before=Field<LoopSource>(form,"loop").Position(player.Snapshot.PositionFrames);
            plot.MoveGesture(X(1000+i*20),false);Invoke(form,"RefreshPlayback");
            continuous&=player.Snapshot.IsPlaying;
            unmoved&=Math.Abs(timeline.Playhead-before)<1;
        }
        Check(continuous && player.Snapshot.PositionFrames>firstClock,"audio and red clock keep advancing during blue drag");
        Check(unmoved,"red position is unchanged by boundary moves while it stays inside");
        Check(player.Snapshot.SeekRevision==revision && device.Resets==resets && device.Stops==stops,"no seek, pause, device restart or repeated tiny replay during drag");
        plot.MoveGesture(X(9000),false);Invoke(form,"RefreshPlayback");
        Check(timeline.Position(TimelineMarker.SelectionStart)>timeline.Position(TimelineMarker.SelectionEnd),"playing blue marker can pass through the other marker");
        Check(timeline.Playhead>=timeline.SelectionStart && timeline.Playhead<timeline.SelectionEnd,"red changes position only when a moved edge crosses it");
        plot.EndGesture();Until(()=>player.Snapshot.IsPlaying);
        Check(player.Snapshot.SeekRevision==revision && device.Resets==resets,"releasing the blue marker also avoids seeking or restarting audio");
        player.Pause();Until(()=>!player.Snapshot.IsPlaying);stops=device.Stops;resets=device.Resets;
        plot.BeginGesture(new Point(X(timeline.Position(TimelineMarker.SelectionStart)),plot.PlotBounds.Bottom+6));
        plot.MoveGesture(X(9500),false);plot.EndGesture();
        Check(!player.Snapshot.IsPlaying && device.Stops==stops && device.Resets==resets,"editing a paused selection keeps it paused without changing the transport");
        Wait(form.ShutdownAsync());
    }
    private sealed class Ramp:IAudioFrameSource
    {
        public int SampleRate=>8000;public int Channels=>1;public long FrameCount=>20000;
        public int ReadFrames(long start,Span<float> data){int count=(int)Math.Min(FrameCount-start,data.Length);for(int i=0;i<count;i++)data[i]=(float)((start+i)/20000d);data[count..].Clear();return count;}
    }
    private sealed class Factory:IPlaybackDeviceFactory {internal Device Device=new();public IPlaybackDevice Open()=>Device;}
    private sealed class Device:IPlaybackDevice
    {
        private readonly object gate=new();private long submitted,clock;private bool playing;private int resets,stops;
        public int SampleRate=>8000;public int Channels=>1;public int BufferFrames=>800;
        public int Resets{get{lock(gate)return resets;}}public int Stops{get{lock(gate)return stops;}}
        public int PaddingFrames{get{lock(gate)return (int)Math.Max(0,submitted-clock);}}public double PlayedFrames{get{lock(gate)return clock;}}
        public void Write(ReadOnlySpan<float> samples){lock(gate)submitted+=samples.Length;}
        public void Start(){lock(gate)playing=true;}public void Stop(){lock(gate){playing=false;stops++;}}
        public void Reset(){lock(gate){submitted=clock=0;resets++;}}public void Dispose(){lock(gate)playing=false;}
        internal void Advance(int count){lock(gate)if(playing)clock=Math.Min(submitted,clock+count);}
    }
    private static T Field<T>(object target,string name)=>(T)target.GetType().GetField(name,BindingFlags.Instance|BindingFlags.NonPublic)!.GetValue(target)!;
    private static object? Invoke(object target,string name,params object[] args)=>target.GetType().GetMethod(name,BindingFlags.Instance|BindingFlags.NonPublic)!.Invoke(target,args);
    private static void Wait(Task task){Until(()=>task.IsCompleted);task.GetAwaiter().GetResult();}
    private static void Until(Func<bool> done){var timer=Stopwatch.StartNew();while(!done()){if(timer.Elapsed.TotalSeconds>15)throw new TimeoutException("Blue marker check timed out.");Application.DoEvents();Thread.Sleep(5);}}
    private static void Check(bool value,string message){if(!value)throw new InvalidOperationException(message);checks++;}
}
