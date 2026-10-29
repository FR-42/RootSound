using System.Runtime.InteropServices;
using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Core;

namespace RootSound.ToneStructure;

internal enum SeparationMethod { Demucs,HarmonicPercussive,Repetition,MidSide,Templates }
internal enum ModelDevice { Auto,Gpu,Cpu }
internal sealed record ModelExecution(string Device,string Backend,bool UsedGpu,double Seconds,double InferenceSeconds,string? FallbackReason=null,bool CpuOperatorFallback=false,string Precision="fp32")
{
    internal string Description=>UsedGpu?$"GPU · {Device}"+(CpuOperatorFallback?"（部分运算由 CPU 协同）":""):FallbackReason is null?"CPU":$"CPU（GPU 未使用：{FallbackReason}）";
}
internal sealed record ModelOutput(AudioAsset[] Audio,ModelExecution Execution);
internal sealed record GpuAvailability(bool Available,string? Name,string? Backend,string? Reason);
internal sealed record MethodDescription(SeparationMethod Id,string Title,string Detail,string Limitation);
internal sealed record SeparationResult(AudioAsset[] Audio,string[] Names,ModelExecution? Execution=null);
internal static class SeparationMethods
{
    internal static readonly MethodDescription[] All=[
        new(SeparationMethod.Demucs,"乐器分轨 · Hybrid Demucs","训练模型估计鼓、贝斯、人声、其他，可选择 GPU；速度以实际设备为准。","电子音色可能被归错类，其他层包含重建残余；实际设备会显示在进度中。"),
        new(SeparationMethod.HarmonicPercussive,"持续声 / 打击声 · HPSS","比较频谱沿时间和频率的连续性，分开延续的音高与短促打击。","钢琴起音也可能进入打击层，鼓的长尾也可能进入持续层。"),
        new(SeparationMethod.Repetition,"重复伴奏 / 变化声 · REPET-SIM 思路","寻找相隔一段时间的相似频谱，用共同部分估计重复伴奏。","需要足够长且有重复的片段；反复出现的旋律也可能进入伴奏层。"),
        new(SeparationMethod.MidSide,"中央 / 侧边 · Mid / Side","按左右声道的共同成分和差异分解，适合中央声源与立体声空间。","只适用于双声道；同在中央的乐器仍会混在一起，侧边单声道相加会抵消。"),
        new(SeparationMethod.Templates,"频谱模板 · NMF（原方法）","学习反复出现的频谱轮廓，再估计每个轮廓随时间的强弱。","不识别乐器；同一乐器的不同音高可能进入不同层。")];
    internal static string? Unavailable(SeparationMethod method,int channels,string root)=>method switch
    {
        SeparationMethod.MidSide when channels!=2=>"此方法需要双声道输入。",
        SeparationMethod.Demucs when channels is not (1 or 2)=>"此模型只支持单声道或双声道输入。",
        SeparationMethod.Demucs=>DemucsRunner.Unavailable(root),
        _=>null
    };
    internal static SeparationResult Run(AudioAsset source,SeparationMethod method,int count,AudioStore store,string root,IProgress<AudioProgress>? progress,CancellationToken token,ModelDevice device=ModelDevice.Cpu)
    {
        token.ThrowIfCancellationRequested();string? unavailable=Unavailable(method,source.Channels,root);
        if(unavailable is not null)throw new InvalidOperationException(unavailable);
        AudioAsset[] audio;string[] names;ModelExecution? execution=null;
        switch(method)
        {
            case SeparationMethod.Demucs: var result=DemucsRunner.Split(source,store,root,progress,token,device);audio=result.Audio;execution=result.Execution;names=["鼓（模型估计）","贝斯（模型估计）","人声（模型估计）","其他 / 残余"];break;
            case SeparationMethod.HarmonicPercussive: audio=Decomposer.Render(source,new HarmonicPercussiveMasks(source),store,progress,token);names=["持续声","打击声"];break;
            case SeparationMethod.Repetition: audio=Decomposer.Render(source,new RepetitionMasks(source,progress,token),store,progress,token);names=["重复伴奏","变化声"];break;
            case SeparationMethod.MidSide: audio=MidSide(source,store,progress,token);names=["中央（共同成分）","侧边（声道差异）"];break;
            default:audio=Decomposer.Split(source,count,store,progress,token);names=Enumerable.Range(1,audio.Length).Select(i=>"频谱结构 "+i).ToArray();break;
        }
        return new(audio,names,execution);
    }
    private static AudioAsset[] MidSide(AudioAsset source,AudioStore store,IProgress<AudioProgress>? progress,CancellationToken token)
    {
        string[] paths=[store.AllocatePath(),store.AllocatePath()];var opened=new List<AudioAsset>();
        try
        {
            using(var output=new FileStream(paths[0],FileMode.CreateNew,FileAccess.Write,FileShare.None,262144))
            {
                float[] buffer=new float[65536];
                for(long frame=0;frame<source.FrameCount;)
                {
                    token.ThrowIfCancellationRequested();int take=(int)Math.Min(buffer.Length/2,source.FrameCount-frame);
                    source.ReadFrames(frame,buffer.AsSpan(0,take*2));
                    for(int i=0;i<take;i++){float mid=(float)(((double)buffer[i*2]+buffer[i*2+1])*.5);buffer[i*2]=buffer[i*2+1]=mid;}
                    output.Write(MemoryMarshal.AsBytes(buffer.AsSpan(0,take*2)));frame+=take;
                    progress?.Report(new AudioProgress(frame/(double)source.FrameCount,"正在分离中央与侧边…"));
                }
            }
            opened.Add(store.Open(paths[0],source.SampleRate,2,source.FrameCount));Decomposer.WriteResidual(source,opened,paths[1],token);
            opened.Add(store.Open(paths[1],source.SampleRate,2,source.FrameCount));token.ThrowIfCancellationRequested();return opened.ToArray();
        }
        catch{store.Discard(opened);foreach(string path in paths)AudioStore.TryDelete(path);throw;}
    }
}

internal static class MaskMath
{
    internal static double Median(Span<double> values)
    {values.Sort();int middle=values.Length/2;return values.Length%2==0?(values[middle-1]+values[middle])*.5:values[middle];}
    internal static double Ratio(double a,double b)=>a*a/Math.Max(1e-30,a*a+b*b);
}

/// <summary>Temporal median emphasizes sustained ridges; frequency median emphasizes attacks.</summary>
internal sealed class HarmonicPercussiveMasks:IMaskPlan
{
    public int Count=>2;
    private readonly IAudioFrameSource source;
    private readonly int n,hop,radius;
    private readonly double[] window;
    private readonly Dictionary<long,double[]> cache=[];
    private readonly float[] samples;
    private readonly double[][] real,imag;
    internal HarmonicPercussiveMasks(IAudioFrameSource source)
    {
        this.source=source;n=SpectralTools.Size(source.SampleRate);hop=n/4;radius=Math.Clamp((int)Math.Round(.15*source.SampleRate/hop),3,15);
        window=SpectralTools.Window(n);samples=new float[n*source.Channels];real=Enumerable.Range(0,source.Channels).Select(_=>new double[n]).ToArray();imag=real.Select(_=>new double[n]).ToArray();
    }
    public void Fill(long start,double[] magnitude,double[][] masks,CancellationToken token)
    {
        foreach(long old in cache.Keys.Where(x=>x<start-radius*hop).ToArray())cache.Remove(old);
        var temporal=new List<double[]>();
        for(int offset=-radius;offset<=radius;offset++)
        {
            token.ThrowIfCancellationRequested();long at=start+offset*hop;
            if(at< -n/2 || at>=source.FrameCount)continue;
            if(at==start){temporal.Add(magnitude);continue;}
            if(!cache.TryGetValue(at,out var data)){data=new double[magnitude.Length];SpectralTools.Analyze(source,at,window,samples,real,imag,data);cache[at]=data;}
            temporal.Add(data);
        }
        Span<double> times=stackalloc double[31];Span<double> frequencies=stackalloc double[17];
        for(int f=0;f<magnitude.Length;f++)
        {
            for(int t=0;t<temporal.Count;t++)times[t]=temporal[t][f];double harmonic=MaskMath.Median(times[..temporal.Count]);
            int lo=Math.Max(0,f-8),hi=Math.Min(magnitude.Length-1,f+8),length=hi-lo+1;
            magnitude.AsSpan(lo,length).CopyTo(frequencies);double percussive=MaskMath.Median(frequencies[..length]);
            masks[0][f]=MaskMath.Ratio(harmonic,percussive);
        }
    }
}

/// <summary>Bounded non-local neighbor median, in the spirit of REPET-SIM, not an instrument model.</summary>
internal sealed class RepetitionMasks:IMaskPlan
{
    public int Count=>2;
    private const int Bands=64,Neighbors=7;
    private readonly double[][] references,descriptors;
    private readonly long[] positions;
    private readonly int[] bandByBin;
    private readonly int rate;
    internal RepetitionMasks(IAudioFrameSource source,IProgress<AudioProgress>? progress,CancellationToken token)
    {
        rate=source.SampleRate;int n=SpectralTools.Size(rate),bins=n/2+1,hop=n/4;
        int count=(int)Math.Min(1536,Math.Max(1,(source.FrameCount+hop-1)/hop));
        references=new double[count][];descriptors=new double[count][];positions=new long[count];
        bandByBin=Enumerable.Range(0,bins).Select(f=>Math.Clamp((int)(Math.Log(1+f*rate/(double)n/50)/Math.Log(1+rate/100.0)*Bands),0,Bands-1)).ToArray();
        double[] window=SpectralTools.Window(n);float[] samples=new float[n*source.Channels];
        var real=Enumerable.Range(0,source.Channels).Select(_=>new double[n]).ToArray();var imag=real.Select(_=>new double[n]).ToArray();
        for(int i=0;i<count;i++)
        {
            token.ThrowIfCancellationRequested();long start=count==1?0:(long)Math.Round(i*(source.FrameCount-1)/(double)(count-1));start=start/hop*hop;
            positions[i]=start;references[i]=new double[bins];SpectralTools.Analyze(source,start,window,samples,real,imag,references[i]);descriptors[i]=Describe(references[i]);
            if(i%16==0)progress?.Report(new AudioProgress(.3*i/count,"正在寻找非相邻的重复频谱…"));
        }
    }
    private double[] Describe(double[] magnitude)
    {
        var data=new double[Bands];for(int f=0;f<magnitude.Length;f++)data[bandByBin[f]]+=magnitude[f];
        double norm=Math.Sqrt(data.Sum(x=>x*x));if(norm>1e-15)for(int i=0;i<Bands;i++)data[i]/=norm;return data;
    }
    public void Fill(long start,double[] magnitude,double[][] masks,CancellationToken token)
    {
        var query=Describe(magnitude);Span<double> scores=stackalloc double[Neighbors];Span<int> matches=stackalloc int[Neighbors];scores.Fill(-1);matches.Fill(-1);
        for(int i=0;i<references.Length;i++)
        {
            if(i%128==0)token.ThrowIfCancellationRequested();if(Math.Abs(positions[i]-start)<rate*.35)continue;
            double cosine=0;for(int b=0;b<Bands;b++)cosine+=query[b]*descriptors[i][b];
            if(cosine<.55 || cosine<=scores[^1])continue;
            int slot=Neighbors-1;while(slot>0 && cosine>scores[slot-1]){scores[slot]=scores[slot-1];matches[slot]=matches[slot-1];slot--;}
            scores[slot]=cosine;matches[slot]=i;
        }
        int count=0;while(count<Neighbors && matches[count]>=0)count++;
        if(count<3){Array.Clear(masks[0]);return;}
        Span<double> values=stackalloc double[Neighbors];
        for(int f=0;f<magnitude.Length;f++)
        {
            for(int i=0;i<count;i++)values[i]=references[matches[i]][f];
            double background=Math.Min(magnitude[f],MaskMath.Median(values[..count]));double foreground=Math.Max(0,magnitude[f]-background);
            masks[0][f]=MaskMath.Ratio(background,foreground);
        }
    }
}
