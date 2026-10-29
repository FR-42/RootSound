using System.Diagnostics;
using System.Reflection;
using Microsoft.Web.WebView2.WinForms;
using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Controls;
using RootSound.SampleEditor.Core;
using RootSound.TimbreLab.Core;
using LabForm=RootSound.TimbreLab.MainForm;

namespace RootSound.ToneProcessor.Tests;
internal static class MergeChecks
{
    private static int checks;
    internal static int Run(string root)
    {
        // The hidden harness has no Application.Run loop to install this context.
        // Pump async continuations on the creating UI thread, just like the real app.
        SynchronizationContext.SetSynchronizationContext(new WindowsFormsSynchronizationContext());
        using var shell=new UnifiedForm(root,initializeCapture:false);
        _=shell.Handle;shell.PerformLayout();
        var lab=Field<LabForm>(shell,"lab");var capture=Field<MainForm>(shell,"capture");
        var workspace=Field<SampleWorkspace>(lab,"_workspace");
        var plot=Field<AudioPlot>(capture,"plot");var eq=Field<EqPanel>(capture,"eq");
        Check(!shell.Capturing && !lab.TopLevel && !capture.TopLevel,"initial page is integrated timbre lab");
        Check(Field<Button>(lab,"_capture").Text=="+","plus button is present beneath sample list");
        Check(Field<ToolStripButton>(capture,"export").Text=="导出到采样栏","capture exports directly to sample list");
        Wait(shell.ShowCaptureAsync());Check(shell.Capturing,"plus navigation enters capture page");
        Wait(capture.LoadSongAsync(Path.Combine(root,"long-12m01s.wav")));
        var imported=Field<ImportedAudio>(capture,"audio");
        var original=Field<ClipSource>(capture,"clip");
        Check(original.FrameCount==721L*8000,"integrated capture retains long-song support");
        string? eqError=null;eq.Failed+=message=>eqError=message;
        SynchronizationContext.SetSynchronizationContext(new WindowsFormsSynchronizationContext());
        _=eq.Handle;Wait(eq.InitializeAsync(Path.Combine(root,"merge-webview")));Until(()=>eq.Ready || eqError is not null);
        Check(eqError is null,"embedded EQ initialized: "+eqError);
        plot.Timeline.Move(TimelineMarker.SelectionStart,8000*8);plot.Timeline.Move(TimelineMarker.SelectionEnd,8000*13);
        Wait((Task)Invoke(capture,"TrimAsync",false)!);
        var trimmed=Field<ClipSource>(capture,"clip");Check(trimmed.Offset==64000 && trimmed.FrameCount==40000,"capture trimming works inside unified tool");
        plot.Timeline.Move(TimelineMarker.SelectionStart,2400);plot.Timeline.Move(TimelineMarker.SelectionEnd,10400);
        plot.Timeline.Move(TimelineMarker.Playhead,4000);Invoke(capture,"ConfigureLoop",4000d);
        plot.Timeline.Zoom(8,.4);var viewStart=plot.Timeline.ViewStart;var viewLength=plot.Timeline.ViewLength;
        var player=Field<object>(capture,"player");
        var web=Descendants(eq).OfType<WebView2>().Single();
        Wait(web.CoreWebView2.ExecuteScriptAsync("(() => {for(let i=0;i<6;i++){document.querySelector('.curve-point[data-index=\"'+i+'\"]').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));const p=document.querySelector('.curve-point-y');p.value='-12';p.dispatchEvent(new Event('input',{bubbles:true}));p.dispatchEvent(new Event('change',{bubbles:true}));}})()"));
        Wait(eq.SynchronizeAsync());Check(!eq.Kernel.Bypass,"captured sample uses current EQ");var kernel=eq.Kernel;
        Wait(capture.CaptureToLibraryAsync());
        Check(!shell.Capturing && workspace.Entries.Count==1 && workspace.PrimaryIndex==0,"first export returns and becomes primary");
        var first=workspace.Entries[0].Clip;
        Check(first.FrameCount==8000 && first.SampleRate==8000 && first.Channels==1,"only selected frames enter the list");
        float[] expected=new float[8000];new EqSource(trimmed,kernel).ReadFrames(2400,expected);
        Check(expected.Zip(first.Samples).All(x=>Math.Abs(x.First-x.Second)<1e-7),"direct transfer preserves processed samples without WAV quantization");
        float[] input=new float[8000];trimmed.ReadFrames(2400,input);
        double ratio=Math.Sqrt(first.Samples.Sum(x=>(double)x*x)/input.Sum(x=>(double)x*x));
        Check(Math.Abs(ratio-Math.Pow(10,-12d/20))<.002,"export applies -12 dB EQ rather than raw audio");
        var firstCopy=first.Samples.ToArray();
        Wait(shell.ShowCaptureAsync());
        Check(ReferenceEquals(imported,Field<ImportedAudio>(capture,"audio")) && ReferenceEquals(trimmed,Field<ClipSource>(capture,"clip")),"returning reuses song and trimmed clip");
        Check(ReferenceEquals(player,Field<object>(capture,"player")) && ReferenceEquals(kernel,eq.Kernel),"navigation preserves playback session and EQ");
        Check(plot.Timeline.SelectionStart==2400 && plot.Timeline.SelectionEnd==10400 && Math.Abs(plot.Timeline.Playhead-4000)<1,"navigation preserves markers");
        Check(plot.Timeline.ViewStart==viewStart && plot.Timeline.ViewLength==viewLength,"navigation preserves zoom and view");
        Check(Field<Stack<ClipSource>>(capture,"cutHistory").Count==1,"navigation preserves cut undo history");
        plot.Timeline.Move(TimelineMarker.SelectionEnd,16000);plot.Timeline.Move(TimelineMarker.SelectionStart,12000);
        var primary=workspace.Primary;
        Wait(capture.CaptureToLibraryAsync());
        Check(workspace.Entries.Count==2 && ReferenceEquals(primary,workspace.Primary),"second export appends reference without replacing primary");
        Check(first.Samples.SequenceEqual(firstCopy) && !ReferenceEquals(first.Samples,workspace.Entries[1].Clip.Samples),"captures own independent audio snapshots");
        Check(first.Name!=workspace.Entries[1].Clip.Name,"source timestamps distinguish captures");
        var protection=Field<SourceProtection>(lab,"_protection");Throws<IOException>(()=>protection.CheckDestination(imported.SourcePath));
        using(var canceled=new CancellationTokenSource())
        {
            canceled.Cancel();Throws<OperationCanceledException>(()=>SampleCapture.Create(trimmed,kernel,0,8000,imported,null,canceled.Token));
        }
        Throws<InvalidDataException>(()=>SampleCapture.Create(original,kernel,0,8000*31,imported,null,CancellationToken.None));
        for(int i=2;i<8;i++)lab.AddCapturedSample(new PcmClip(8000,1,new float[800],"reference "+i),imported.SourcePath,imported.SourceIdentity);
        Wait(shell.ShowCaptureAsync());Wait(capture.CaptureToLibraryAsync());
        Check(shell.Capturing && workspace.Entries.Count==8,"full list rejects transfer without navigating or deleting samples");
        Check(ReferenceEquals(imported,Field<ImportedAudio>(capture,"audio")) && plot.Timeline.SelectionStart==12000,"failed transfer retains song state");
        Wait(shell.ShowLabAsync());Wait(shell.ShowCaptureAsync());Wait(shell.ShowLabAsync());
        Check(workspace.Entries.Count==8,"manual back navigation retains all samples");
        Wait(shell.ShutdownAsync());
        Throws<ObjectDisposedException>(()=>imported.ReadFrames(0,new float[1]));
        Console.WriteLine($"PASS {checks} unified workflow checks; no window shown or real audio device opened.");return checks;
    }
    private static T Field<T>(object target,string name)=>(T)target.GetType().GetField(name,BindingFlags.Instance|BindingFlags.NonPublic)!.GetValue(target)!;
    private static object? Invoke(object target,string name,params object[] args)=>target.GetType().GetMethod(name,BindingFlags.Instance|BindingFlags.NonPublic)!.Invoke(target,args);
    private static IEnumerable<Control> Descendants(Control parent)=>parent.Controls.Cast<Control>().SelectMany(x=>new[]{x}.Concat(Descendants(x)));
    private static void Wait(Task task){Until(()=>task.IsCompleted);task.GetAwaiter().GetResult();}
    private static void Until(Func<bool> done){var timer=Stopwatch.StartNew();while(!done()){if(timer.Elapsed.TotalSeconds>30)throw new TimeoutException("Unified workflow check timed out.");Application.DoEvents();Thread.Sleep(5);}}
    private static void Check(bool value,string message){if(!value)throw new InvalidOperationException(message);checks++;}
    private static void Throws<T>(Action action)where T:Exception{try{action();}catch(T){checks++;return;}throw new Exception("Expected "+typeof(T).Name);}
}
