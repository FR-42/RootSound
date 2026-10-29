using System.Diagnostics;
using System.Text.Json;
using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Core;

namespace RootSound.ToneStructure.Tests;
internal static partial class Program
{
    private static string Experiment=>Path.GetFullPath(Path.Combine(AppContext.BaseDirectory,"..","..","..","..",".."));
    private static void CheckAlgorithms(string root)
    {
        using var store=new AudioStore(root);const int rate=16000;
        double Tone(double t)=>.2*Math.Sin(2*Math.PI*220*t);
        double Hit(double t)
        {
            double phase=t%.7;if(phase>.045)return 0;
            uint x=(uint)(t*rate)+12345;x^=x<<13;x^=x>>17;x^=x<<5;
            return .5*(x/(double)uint.MaxValue*2-1)*Math.Exp(-phase*75);
        }
        var hpInput=new FunctionSource(rate,1,8,(t,_)=>Tone(t)+Hit(t));var hpAsset=store.Copy(hpInput,null,CancellationToken.None);
        var hp=SeparationMethods.Run(hpAsset,SeparationMethod.HarmonicPercussive,2,store,Experiment,null,CancellationToken.None);
        double sustained=Projection(hp.Audio[0],Tone),attacks=Projection(hp.Audio[1],Hit);
        Check(sustained>.85,"HPSS retains the controlled sustained pitch in the harmonic layer");
        Check(attacks>.6,"HPSS assigns controlled broadband attacks to the percussive layer");
        Check(Amplitude(hp.Audio[1],220)<.03,"HPSS percussive layer suppresses the sustained tone");
        Check(Reconstruction(hpAsset,hp.Audio)<2e-7,"HPSS reconstructs parent at identical frame positions");
        double Background(double t)=>.16*Math.Sin(2*Math.PI*(t%1<.5?220:440)*t);
        double Lead(double t)=>t>3.1 && t<3.55?.18*Math.Sin(2*Math.PI*1320*t):0;
        var repeat=store.Copy(new FunctionSource(rate,1,8,(t,_)=>Background(t)+Lead(t)),null,CancellationToken.None);
        var rep=SeparationMethods.Run(repeat,SeparationMethod.Repetition,2,store,Experiment,null,CancellationToken.None);
        double background=Projection(rep.Audio[0],Background),foreground=Projection(rep.Audio[1],Lead);
        Check(background>.75,"non-local median retains the controlled repeating accompaniment");
        Check(foreground>.6,"non-local median isolates the controlled one-off lead from repeated accompaniment");
        Check(Reconstruction(repeat,rep.Audio)<2e-7,"repeating and changing layers are complementary");
        var stereo=store.Copy(new FunctionSource(rate,2,4,(t,ch)=>.2*Math.Sin(2*Math.PI*330*t)+(ch==0?1:-1)*.13*Math.Sin(2*Math.PI*1200*t)),null,CancellationToken.None);
        var spatial=SeparationMethods.Run(stereo,SeparationMethod.MidSide,2,store,Experiment,null,CancellationToken.None);
        Check(Math.Abs(Amplitude(spatial.Audio[0],330)-.2)<1e-5 && Amplitude(spatial.Audio[0],1200)<1e-5,"mid retains only the controlled common stereo source");
        Check(Math.Abs(Amplitude(spatial.Audio[1],1200)-.13)<1e-5 && Amplitude(spatial.Audio[1],330)<1e-5,"side retains only the controlled opposite-phase source");
        Check(Reconstruction(stereo,spatial.Audio)<2e-7,"mid and side sum back to full stereo input");
        Throws<InvalidOperationException>(()=>SeparationMethods.Run(repeat,SeparationMethod.MidSide,2,store,Experiment,null,CancellationToken.None));
        foreach(var method in new[]{SeparationMethod.HarmonicPercussive,SeparationMethod.Repetition,SeparationMethod.MidSide})
        {
            using var cancellation=new CancellationTokenSource();int files=Directory.GetFiles(store.DirectoryPath).Length;
            var progress=new InlineProgress(p=>{if(p.Fraction>.5)cancellation.Cancel();});
            Throws<OperationCanceledException>(()=>SeparationMethods.Run(stereo,method,2,store,Experiment,progress,cancellation.Token));
            Check(Directory.GetFiles(store.DirectoryPath).Length==files,$"canceling {method} removes partial outputs");
        }
        var longAsset=store.Copy(new FunctionSource(8000,1,721,(t,_)=>.1*Math.Sin(2*Math.PI*220*t)),null,CancellationToken.None);
        var longRepetition=new RepetitionMasks(longAsset,null,CancellationToken.None);
        double[] magnitude=new double[1025];magnitude[56]=1;double[][] mask=[new double[1025]];
        longRepetition.Fill(longAsset.FrameCount-1024,magnitude,mask,CancellationToken.None);
        Check(mask[0].All(x=>double.IsFinite(x) && x>=0 && x<=1),"repeating method trains bounded references spanning a >10 minute input");
        var longHp=new HarmonicPercussiveMasks(longAsset);longHp.Fill(longAsset.FrameCount-1024,magnitude,mask,CancellationToken.None);
        Check(mask[0].All(x=>double.IsFinite(x) && x>=0 && x<=1),"HPSS can analyze the tail beyond ten minutes with local context");
        using var sessionStore=new AudioStore(root);var own=sessionStore.Copy(hpAsset,null,CancellationToken.None);
        using var origin=MakeOrigin(root,hpInput,"methods-source.wav");using var session=new StructureSession(sessionStore,own,origin);
        var first=hp.Audio.Select(x=>sessionStore.Copy(x,null,CancellationToken.None)).ToArray();
        session.Commit(session.Layers[0].Id,first,hp.Names,true);var old=session.Layers.ToArray();session.SetActive(old[1].Id,false);
        var next=rep.Audio.Select(x=>sessionStore.Copy(x,null,CancellationToken.None)).ToArray();
        session.Commit(Guid.Empty,next,rep.Names,true);Check(session.Layers.Length==2 && session.Layers[0].Name=="重复伴奏","method comparison replaces layers and uses meaningful names");
        session.Undo();Check(session.Layers.Select(x=>x.Id).SequenceEqual(old.Select(x=>x.Id)) && !session.Layers[1].Active,"method comparison undo restores exact prior tracks and mute state");
        File.WriteAllText(Path.Combine(root,"algorithm-metrics.json"),JsonSerializer.Serialize(new{sustained,attacks,background,foreground,spatialMaximumError=Reconstruction(stereo,spatial.Audio)}));
        Console.WriteLine($"Methods: HPSS sustained/attacks {sustained:F3}/{attacks:F3}; repetition background/foreground {background:F3}/{foreground:F3}.");
    }
    private static void CheckModel(string root)
    {
        string? unavailable=DemucsRunner.Unavailable(Experiment);Check(unavailable is null,"cached local Demucs runtime is available: "+unavailable);
        Check(DemucsRunner.Unavailable(Path.Combine(Experiment,"tone-structure")) is null,"model discovery also works with the actual launcher module directory");
        using var store=new AudioStore(root);var audio=store.Copy(new FunctionSource(16000,1,2,(t,_)=>.15*Math.Sin(2*Math.PI*220*t)),null,CancellationToken.None);
        var watch=Stopwatch.StartNew();var model=SeparationMethods.Run(audio,SeparationMethod.Demucs,4,store,Experiment,null,CancellationToken.None,ModelDevice.Cpu);
        Check(model.Audio.Length==4 && model.Audio.All(x=>x.Channels==1 && x.FrameCount==audio.FrameCount && x.SampleRate==16000),"real pretrained worker preserves mono duration and input rate");
        double error=Reconstruction(audio,model.Audio);Check(error<2e-7,"real model estimates plus residual reconstruct input");
        Check(Directory.GetFiles(store.DirectoryPath).Length==5,"successful model run removes scratch counts and request files");
        var stereo=store.Copy(new FunctionSource(22050,2,8,(t,ch)=>.15*Math.Sin(2*Math.PI*220*t)+(ch==0?1:-1)*.07*Math.Sin(2*Math.PI*1320*t)),null,CancellationToken.None);
        var multi=SeparationMethods.Run(stereo,SeparationMethod.Demucs,4,store,Experiment,null,CancellationToken.None,ModelDevice.Cpu);
        Check(multi.Audio.All(x=>x.Channels==2 && x.FrameCount==stereo.FrameCount && x.SampleRate==22050),"real model overlap processing preserves stereo at a non-model rate");
        Check(Reconstruction(stereo,multi.Audio)<2e-7,"multiple model windows with short final chunk reconstruct parent");
        Check(multi.Audio.All(x=>double.IsFinite(Projection(x,t=>Math.Sin(2*Math.PI*220*t)))),"all stereo model outputs contain finite samples across overlap boundaries");
        CheckGpu(root,store,audio,stereo,multi);
        using var cancellation=new CancellationTokenSource();int before=Directory.GetFiles(store.DirectoryPath).Length;
        var report=new InlineProgress(p=>{if(p.Fraction>=.01)cancellation.Cancel();});
        Throws<OperationCanceledException>(()=>SeparationMethods.Run(audio,SeparationMethod.Demucs,4,store,Experiment,report,cancellation.Token,ModelDevice.Cpu));
        Check(Directory.GetFiles(store.DirectoryPath).Length==before,"canceling model process terminates worker and removes scratch files");
        File.WriteAllText(Path.Combine(root,"model-metrics.json"),JsonSerializer.Serialize(new{model="HDEMUCS_HIGH_MUSDB_PLUS",seconds=watch.Elapsed.TotalSeconds,maximumReconstructionError=error,cachedWeights=true,networkAllowed=false,semanticListeningAcceptance=false}));
        Console.WriteLine($"Local model: 4 outputs, max sum error {error:E2}, {watch.Elapsed.TotalSeconds:F1}s; semantic listening not claimed.");
    }
    private static double Projection(IAudioFrameSource source,Func<double,double> target)
    {
        float[] samples=new float[4096*source.Channels];double dot=0,power=0;
        for(long frame=0;frame<source.FrameCount;frame+=4096)
        {int take=source.ReadFrames(frame,samples);for(int i=0;i<take;i++){double expected=target((frame+i)/(double)source.SampleRate);dot+=samples[i*source.Channels]*expected;power+=expected*expected;}}
        return dot/Math.Max(1e-20,power);
    }
    private sealed class FunctionSource(int rate,int channels,int seconds,Func<double,int,double> sample):IAudioFrameSource
    {
        public int SampleRate=>rate;public int Channels=>channels;public long FrameCount=>(long)rate*seconds;
        public int ReadFrames(long start,Span<float> destination)
        {int count=(int)Math.Min(FrameCount-start,destination.Length/channels);for(int i=0;i<count;i++)for(int ch=0;ch<channels;ch++)destination[i*channels+ch]=(float)sample((start+i)/(double)rate,ch);destination[(count*channels)..].Clear();return count;}
    }
}
