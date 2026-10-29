using System.Diagnostics;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Web.WebView2.WinForms;
using RootSound.SampleEditor.Analysis;
using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Controls;
using RootSound.SampleEditor.Core;
using RootSound.SampleEditor.Playback;
using RootSound.ToneProcessor;

namespace RootSound.ToneProcessor.Tests;
internal static class Program
{
    private static int checks;
    [STAThread]
    private static int Main(string[] args)
    {
        string root=Path.GetFullPath(args[0]);Directory.CreateDirectory(root);
        try
        {
            Application.SetHighDpiMode(HighDpiMode.PerMonitorV2);Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);
            if(args.Length>1 && args[1]=="--merge"){MergeChecks.Run(root);return 0;}
            if(args.Length>1 && args[1]=="--blue"){BlueMarkerChecks.Run(root);return 0;}
            CheckRegions();CheckEq(root);CheckLoops();CheckPlayback();CheckSpectrum();CheckFiles(root);CheckFormats(root);CheckLayout(root);CheckWebEq(root);
            checks+=MergeChecks.Run(root);
            checks+=BlueMarkerChecks.Run(root);
            Console.WriteLine($"PASS: {checks} native checks. Evidence: {root}");return 0;
        }
        catch(Exception ex){Console.Error.WriteLine(ex);return 1;}
    }
    private static void CheckRegions()
    {
        var source=new Signal(48000,2,30000);var whole=new ClipSource(source,0,source.FrameCount);
        var part=whole.Trim(100,20000).Trim(17,217);float[] data=new float[402];
        Equal(117,part.Offset,"successive cuts preserve original offsets");Equal(200,part.FrameCount,"cut length");
        Equal(200,part.ReadFrames(0,data),"EOF count");Near(source.Value(117,0),data[0],1e-7,"cut starts at blue start");
        Near(0,data[400],0,"EOF clears remainder");Throws<ArgumentOutOfRangeException>(()=>whole.Trim(2,2));
        Equal(30000,whole.FrameCount,"undo region remains immutable");
    }
    private static void CheckEq(string root)
    {
        var source=new Signal(48000,2,34000);float[] expected=new float[66000],actual=new float[66000];source.ReadFrames(0,expected);
        var eq=new EqSource(source,EqKernel.Flat);eq.ReadFrames(0,actual);True(expected.SequenceEqual(actual),"flat EQ is bit-identical");
        float[] sparse=new float[8192];sparse[0]=.4f;sparse[1]=-.1f;sparse[2048]=.04f;sparse[8191]=.08f;
        eq.SetKernel(new EqKernel(sparse));
        foreach(long start in new long[]{0,8177,16371,33000,19,30000})
        {
            float[] result=new float[256];eq.ReadFrames(start,result);
            for(int i=0;i<128;i++)for(int ch=0;ch<2;ch++)
            {
                double reference=0;foreach(int tap in new[]{0,1,2048,8191})if(start+i>=tap)reference+=source.Value(start+i-tap,ch)*sparse[tap];
                Near(reference,result[i*2+ch],2e-6,"FFT convolution agrees with sparse direct FIR at arbitrary seeks");
            }
        }
        var impulse=JsonSerializer.Deserialize<float[]>(File.ReadAllText(Path.Combine(root,"eq-fixture.json")))!;
        eq.SetKernel(new EqKernel(impulse));
        foreach(long start in new long[]{0,8190,16400,33998})
        {
            float[] result=new float[8];int count=eq.ReadFrames(start,result);
            for(int i=0;i<count;i++)for(int ch=0;ch<2;ch++)
            {
                double reference=0;for(int tap=0;tap<8192 && tap<=start+i;tap++)reference+=source.Value(start+i-tap,ch)*impulse[tap];
                Near(reference,result[i*2+ch],3e-6,"unchanged JS EQ impulse matches native processed audio");
            }
        }
        var timer=Stopwatch.StartNew();long frames=0;float[] chunk=new float[4096*2];
        for(int repeat=0;repeat<5;repeat++)for(long p=0;p<source.FrameCount;p+=4096)frames+=eq.ReadFrames(p,chunk);
        timer.Stop();double speed=frames/48000d/timer.Elapsed.TotalSeconds;
        True(speed>1,"EQ processing exceeds realtime on this machine");Console.WriteLine($"EQ processing: {speed:0.0}× realtime (stereo, 48 kHz).");
        Throws<InvalidDataException>(()=>new EqKernel(new float[1]));
        float[] invalid=new float[8192];invalid[0]=float.NaN;Throws<InvalidDataException>(()=>new EqKernel(invalid));
    }
    private static void CheckLoops()
    {
        var source=new Signal(48000,2,20000);var loop=new LoopSource(source);loop.SetRange(101,108,105);
        float[] data=new float[202];loop.ReadFrames(0,data);
        for(int i=0;i<101;i++)for(int ch=0;ch<2;ch++)Near(source.Value(101+(4+i)%7,ch),data[i*2+ch],0,"loop never reads outside blue lines");
        Near(101,loop.Position(3),0,"red wraps at exclusive right boundary");
        loop.SetRange(500,501,999);loop.ReadFrames(12345,data);True(data.Where((_,i)=>i%2==0).All(x=>x==source.Value(500,0)),"one-frame loop is safe");
        Throws<ArgumentOutOfRangeException>(()=>loop.SetRange(1,1,1));
        loop.SetRange(1000,1100,1050);loop.ReadFrames(80,data);Near(source.Value(1030,0),data[0],0,"range replacement and seek");
    }
    private static void CheckPlayback()
    {
        var loop=new LoopSource(new Signal(48000,2,10000));loop.SetRange(1000,3400,1000);
        var factory=new FakeFactory();using var core=new PlaybackCore(loop,factory);
        core.Play();True(core.Snapshot.IsPlaying,"triangle starts playback");
        for(int i=0;i<5;i++){factory.Device.Advance(1200);core.Poll();True(loop.Position(core.Snapshot.PositionFrames)>=1000 && loop.Position(core.Snapshot.PositionFrames)<3400,"device clock stays inside blue range");}
        core.Pause();double saved=core.Snapshot.PositionFrames;factory.Device.Advance(200);core.Poll();Near(saved,core.Snapshot.PositionFrames,0,"pause preserves position");
        core.Play();True(core.Snapshot.IsPlaying,"play resumes after pause");core.Pause();loop.SetRange(1000,3400,1000);core.Seek(0);
        Near(1000,loop.Position(core.Snapshot.PositionFrames),0,"square resets to left blue line");core.Play();True(core.Snapshot.IsPlaying,"sound resumes after reset");
    }
    private static void CheckSpectrum()
    {
        var tone=new PhaseSignal();var trace=SignalSpectrum.Measure(tone,0,CancellationToken.None);
        True(trace.Length>50 && trace.Length<=321,"live EQ spectrum is bounded");
        var peak=trace.MaxBy(p=>p.y)!;True(Math.Abs(peak.x-1000)<100 && peak.y>-20,"opposite phase stereo retains true frequency energy");
        float[] impulse=new float[8192];impulse[0]=.5f;var reduced=SignalSpectrum.Measure(new EqSource(tone,new EqKernel(impulse)),8192,CancellationToken.None);
        Near(6.0206,peak.y-reduced.Max(p=>p.y),.1,"EQ overlay measures processed output");
    }
    private static void CheckFiles(string root)
    {
        string original=Path.Combine(root,"long-12m01s.wav");WriteWave(original,8000,721L*8000);
        string hash=Hash(original);var audio=AudioImporter.Import(original,null,CancellationToken.None,root);
        try
        {
            Equal(721L*8000,audio.FrameCount,"import retains audio longer than 10 minutes");Equal(8000,audio.SampleRate,"original sampling rate");
            float[] end=new float[20];Equal(20,audio.ReadFrames(audio.FrameCount-20,end),"long audio tail is readable");
            var full=new ClipSource(audio,0,audio.FrameCount);var analysis=AudioAnalysis.Analyze(full,0,full.FrameCount,160,64);
            Equal(160*64,analysis.Intensities.Length,"long spectrogram has bounded dimensions");
            using(var plot=new AudioPlot {Size=new Size(1000,300)})
            using(var image=new Bitmap(1000,300))
            using(var graphics=Graphics.FromImage(image))
            {plot.Timeline.Load(full.FrameCount,8000);plot.Timeline.Move(TimelineMarker.SelectionStart,8000*3);plot.Timeline.Move(TimelineMarker.SelectionEnd,8000*30);plot.SetAnalysis(analysis);plot.PaintGraph(graphics);image.Save(Path.Combine(root,"spectrogram.png"));}
            float[] attenuation=new float[8192];attenuation[0]=.5f;
            var eq=new EqSource(full,new EqKernel(attenuation));var selected=new ClipSource(eq,8000*650,8000*2);
            string output=Path.Combine(root,"selected-eq.wav");WavExport.Write(selected,audio,output);
            using(var reimported=AudioImporter.Import(output,null,CancellationToken.None,root))
            {
                Equal(16000,reimported.FrameCount,"export contains only the blue selection");Equal(8000,reimported.SampleRate,"export keeps sampling rate");
                float[] before=new float[512],after=new float[512];audio.ReadFrames(8000*650,before);reimported.ReadFrames(0,after);
                for(int i=0;i<after.Length;i++)Near(before[i]*.5,after[i],2e-7,"WAV contains actual EQ result");
            }
            Throws<IOException>(()=>WavExport.Write(selected,audio,original));Equal(hash,Hash(original),"source never overwritten");
            string longExport=Path.Combine(root,"long-export.wav");WavExport.Write(full,audio,longExport);
            using(var reimported=AudioImporter.Import(longExport,null,CancellationToken.None,root))Equal(audio.FrameCount,reimported.FrameCount,"full long export has no time limit");
            string target=Path.Combine(root,"preserve-on-cancel.wav");File.WriteAllText(target,"preserve");
            using var cancellation=new CancellationTokenSource();
            var report=new InlineProgress(_=>cancellation.Cancel());
            Throws<OperationCanceledException>(()=>WavExport.Write(full,audio,target,report,cancellation.Token));
            Equal("preserve",File.ReadAllText(target),"cancel preserves existing destination");
            True(!Directory.EnumerateFiles(root,".rootsound-tone-*.tmp").Any(),"cancel cleans staging files");
            using var alreadyCanceled=new CancellationTokenSource();alreadyCanceled.Cancel();
            Throws<OperationCanceledException>(()=>AudioImporter.Import(original,null,alreadyCanceled.Token,root));
            Equal(hash,Hash(original),"all operations preserve original bytes");
        }
        finally{audio.Dispose();}
        True(!Directory.EnumerateDirectories(root,"RootSound-Sample-*").Any(),"temporary decoded audio is cleaned on close");
        var prefs=new Preferences(root);prefs.RememberImport(original);prefs.RememberExport(Path.Combine(root,"nested","x.wav"));
        var restored=new Preferences(root);Equal(root,restored.ImportDirectory,"last import directory is remembered");
    }
    private static void CheckLayout(string root)
    {
        using var form=new MainForm(root);form.CreateControl();form.PerformLayout();
        True(form.Controls.Count>0,"native interface constructs without opening a window");
        foreach(Size size in new[]{new Size(1200,920),new Size(900,720)})
        {
            form.Size=size;form.PerformLayout();var split=Descendants(form).OfType<SplitContainer>().Single();
            True(split.Panel1.Height>=180 && split.Panel2.Height>=280,"both graphs retain usable space at supported window sizes");
        }
    }
    private static void CheckFormats(string root)
    {
        foreach(string extension in new[]{"mp3","flac","m4a"})
        {
            string path=Path.Combine(root,"format-fixture."+extension);
            var info=new ProcessStartInfo("ffmpeg") {UseShellExecute=false,CreateNoWindow=true,RedirectStandardError=true};
            foreach(string argument in new[]{"-v","error","-y","-i",Path.Combine(root,"long-12m01s.wav"),"-t","1.2","-ar","48000",path})info.ArgumentList.Add(argument);
            Process? process;
            try{process=Process.Start(info);}
            catch(System.ComponentModel.Win32Exception){Console.WriteLine("SKIP: FFmpeg is unavailable; compressed-format fixture checks skipped.");return;}
            using(process)
            {
                var read=process!.StandardError.ReadToEndAsync();if(!process.WaitForExit(20000)){process.Kill();throw new TimeoutException("Format fixture generation timed out.");}
                string diagnostic=read.GetAwaiter().GetResult();
                True(process.ExitCode==0,"create format fixture: "+diagnostic);
            }
            using var audio=Task.Run(()=>AudioImporter.Import(path,null,CancellationToken.None,root)).GetAwaiter().GetResult();
            Equal(48000,audio.SampleRate,"Windows decodes "+extension+" sampling rate");
            True(audio.DurationSeconds>=1.1 && audio.DurationSeconds<1.5,"Windows decodes full "+extension+" duration");
            float[] samples=new float[4096*audio.Channels];audio.ReadFrames(0,samples);
            True(samples.All(float.IsFinite) && samples.Any(x=>Math.Abs(x)>.01),extension+" contains usable audio");
        }
        Console.WriteLine("WAV, MP3, FLAC and M4A imports passed using the application's actual decoders.");
    }
    private static IEnumerable<Control> Descendants(Control parent)=>parent.Controls.Cast<Control>().SelectMany(c=>new[]{c}.Concat(Descendants(c)));
    private static void CheckWebEq(string root)
    {
        using var parent=new Form {Size=new Size(1100,500),ShowInTaskbar=false};
        using var panel=new EqPanel {Dock=DockStyle.Fill};parent.Controls.Add(panel);
        _=parent.Handle;_=panel.Handle;
        string? error=null;panel.Failed+=message=>error=message;
        var init=panel.InitializeAsync(Path.Combine(root,"webview-cache"));PumpUntil(()=>init.IsCompleted || error is not null);init.GetAwaiter().GetResult();
        PumpUntil(()=>panel.Ready || error is not null);True(error is null,"hidden WebView EQ initializes: "+error);True(panel.Kernel.Bypass,"web worker initializes flat EQ");
        var view=Descendants(panel).OfType<WebView2>().Single();
        Task<string> script=view.CoreWebView2.ExecuteScriptAsync("(() => {const p=document.querySelector('.curve-point-y');p.value='-12';p.dispatchEvent(new Event('input',{bubbles:true}));p.dispatchEvent(new Event('change',{bubbles:true}));return document.querySelector('.curve-svg')!==null;})()");
        PumpUntil(()=>script.IsCompleted);_=script.GetAwaiter().GetResult();
        var sync=panel.SynchronizeAsync();PumpUntil(()=>sync.IsCompleted || error is not null);sync.GetAwaiter().GetResult();
        True(error is null && panel.Ready && !panel.Kernel.Bypass,"numeric curve edit reaches native EQ before export sync completes");
        var rateKernel=panel.Kernel;panel.SetSampleRate(44100);PumpUntil(()=>panel.Ready || error is not null);
        True(error is null && !ReferenceEquals(rateKernel,panel.Kernel),"new audio rate rebuilds current EQ");
        script=view.CoreWebView2.ExecuteScriptAsync("document.getElementById('undo').click();");PumpUntil(()=>script.IsCompleted);_=script.GetAwaiter().GetResult();
        sync=panel.SynchronizeAsync();PumpUntil(()=>sync.IsCompleted || error is not null);sync.GetAwaiter().GetResult();
        True(panel.Kernel.Bypass,"undo applies original flat EQ through actual web bridge");
        Console.WriteLine("Hidden WebView2 module, worker and native EQ bridge checks passed; no window shown.");
    }
    private static void PumpUntil(Func<bool> complete)
    {
        var timer=Stopwatch.StartNew();
        while(!complete()){if(timer.Elapsed.TotalSeconds>25)throw new TimeoutException("Hidden EQ check timed out.");Application.DoEvents();Thread.Sleep(10);}
    }
    private static void WriteWave(string path,int rate,long frames)
    {
        using var output=File.Create(path);output.Write(AudioExporter.BuildHeader(rate,1,frames,4));
        float[] samples=new float[8192];byte[] bytes=new byte[samples.Length*3];
        for(long position=0;position<frames;)
        {
            int take=(int)Math.Min(samples.Length,frames-position);
            for(int i=0;i<take;i++)samples[i]=(float)(.3*Math.Sin((position+i)*2*Math.PI*440/rate));
            AudioExporter.EncodePcm24(samples.AsSpan(0,take),bytes);output.Write(bytes,0,take*3);position+=take;
        }
        if((frames*3&1)!=0)output.WriteByte(0);
    }
    private static string Hash(string path){using var stream=File.OpenRead(path);return Convert.ToHexString(SHA256.HashData(stream));}
    private static void True(bool value,string message){if(!value)throw new Exception(message);checks++;}
    private static void Near(double expected,double actual,double tolerance,string message)=>True(Math.Abs(expected-actual)<=tolerance,$"{message}: {expected} != {actual}");
    private static void Equal<T>(T expected,T actual,string message)=>True(EqualityComparer<T>.Default.Equals(expected,actual),$"{message}: {expected} != {actual}");
    private static void Throws<T>(Action action) where T:Exception{try{action();}catch(T){checks++;return;}throw new Exception("Expected "+typeof(T).Name);}
    private sealed class Signal(int rate,int channels,long frames):IAudioFrameSource
    {
        public int SampleRate=>rate;public int Channels=>channels;public long FrameCount=>frames;
        internal float Value(long frame,int ch)=>(float)(.2*Math.Sin(frame*(ch+1)*.031)+ch*.02);
        public int ReadFrames(long start,Span<float> data){int count=(int)Math.Min(FrameCount-start,data.Length/Channels);for(int i=0;i<count;i++)for(int ch=0;ch<Channels;ch++)data[i*Channels+ch]=Value(start+i,ch);data[(count*Channels)..].Clear();return count;}
    }
    private sealed class PhaseSignal:IAudioFrameSource
    {
        public int SampleRate=>48000;public int Channels=>2;public long FrameCount=>48000;
        public int ReadFrames(long start,Span<float> data){int count=(int)Math.Min(FrameCount-start,data.Length/2);for(int i=0;i<count;i++){float value=(float)(.25*Math.Sin(2*Math.PI*1000*(start+i)/48000));data[2*i]=value;data[2*i+1]=-value;}data[(count*2)..].Clear();return count;}
    }
    private sealed class InlineProgress(Action<AudioProgress> report):IProgress<AudioProgress>{public void Report(AudioProgress value)=>report(value);}
    private sealed class FakeFactory:IPlaybackDeviceFactory {internal FakeDevice Device=new();public IPlaybackDevice Open()=>Device;}
    private sealed class FakeDevice:IPlaybackDevice
    {
        private long submitted;private double clock;private bool running;
        public int SampleRate=>48000;public int Channels=>2;public int BufferFrames=>4800;public int PaddingFrames=>(int)Math.Max(0,submitted-clock);public double PlayedFrames=>clock;
        public void Write(ReadOnlySpan<float> samples){submitted+=samples.Length/2;}
        public void Start()=>running=true;public void Stop()=>running=false;public void Reset(){submitted=0;clock=0;}
        internal void Advance(int frames){if(running)clock=Math.Min(submitted,clock+frames);}
        public void Dispose()=>running=false;
    }
}
