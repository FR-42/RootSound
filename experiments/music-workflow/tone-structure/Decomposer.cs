using System.Runtime.InteropServices;
using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Core;

namespace RootSound.ToneStructure;

internal static class Decomposer
{
    internal static AudioAsset[] Split(IAudioFrameSource source,int count,AudioStore store,IProgress<AudioProgress>? progress,CancellationToken token)
    {
        var model=SpectralModel.Learn(source,count,progress,token);int k=model.Templates.Length;
        if(k<2)return [];
        return Render(source,new TemplateMasks(model),store,progress,token);
    }
    internal static AudioAsset[] Render(IAudioFrameSource source,IMaskPlan plan,AudioStore store,IProgress<AudioProgress>? progress,CancellationToken token)
    {
        int k=plan.Count;
        int n=SpectralTools.Size(source.SampleRate),hop=n/4,bins=n/2+1,channels=source.Channels;
        string[] paths=Enumerable.Range(0,k).Select(_=>store.AllocatePath()).ToArray();
        var streams=new List<FileStream>();var opened=new List<AudioAsset>();
        try
        {
            for(int a=0;a<k-1;a++)streams.Add(new FileStream(paths[a],FileMode.CreateNew,FileAccess.Write,FileShare.None,262144));
            double[] window=SpectralTools.Window(n),weights=new double[n],magnitude=new double[bins];
            var rings=Enumerable.Range(0,k-1).Select(_=>new double[n*channels]).ToArray();
            var real=Enumerable.Range(0,channels).Select(_=>new double[n]).ToArray();
            var imag=Enumerable.Range(0,channels).Select(_=>new double[n]).ToArray();
            var masks=Enumerable.Range(0,k-1).Select(_=>new double[bins]).ToArray();
            float[] samples=new float[n*channels],output=new float[hop*channels];double[] r=new double[n],im=new double[n];
            for(long start=-n/2;start<source.FrameCount;start+=hop)
            {
                token.ThrowIfCancellationRequested();SpectralTools.Analyze(source,start,window,samples,real,imag,magnitude);plan.Fill(start,magnitude,masks,token);
                for(int a=0;a<k-1;a++)for(int ch=0;ch<channels;ch++)
                {
                    token.ThrowIfCancellationRequested();
                    for(int i=0;i<n;i++){double gain=masks[a][Math.Min(i,n-i)];r[i]=real[ch][i]*gain;im[i]=imag[ch][i]*gain;}
                    SpectralTools.Inverse(r,im);
                    for(int i=0;i<n;i++)rings[a][i*channels+ch]+=r[i]*window[i];
                }
                for(int i=0;i<n;i++)weights[i]+=window[i]*window[i];
                int from=(int)Math.Max(0,-start),to=(int)Math.Min(hop,source.FrameCount-start);
                if(to>from)for(int a=0;a<k-1;a++)
                {
                    for(int i=from;i<to;i++)for(int ch=0;ch<channels;ch++)
                    {
                        double value=weights[i]>1e-20?rings[a][i*channels+ch]/weights[i]:0;
                        if(!double.IsFinite(value))throw new InvalidDataException("分解产生了无效声音。");output[(i-from)*channels+ch]=(float)value;
                    }
                    streams[a].Write(MemoryMarshal.AsBytes(output.AsSpan(0,(to-from)*channels)));
                }
                foreach(var ring in rings){Array.Copy(ring,hop*channels,ring,0,(n-hop)*channels);Array.Clear(ring,(n-hop)*channels,hop*channels);}
                Array.Copy(weights,hop,weights,0,n-hop);Array.Clear(weights,n-hop,hop);
                if(start%(hop*16)==0)progress?.Report(new AudioProgress(.3+.6*Math.Clamp((start+hop)/(double)source.FrameCount,0,1),"正在分配声音成分并生成对齐声部…"));
            }
            foreach(var stream in streams){stream.Flush(true);stream.Dispose();}streams.Clear();
            for(int a=0;a<k-1;a++)opened.Add(store.Open(paths[a],source.SampleRate,channels,source.FrameCount));
            // The final child is a complementary residual. Summing the children returns
            // the parent, rather than adding a copy of the original on every layer.
            WriteResidual(source,opened,paths[k-1],token);
            opened.Add(store.Open(paths[k-1],source.SampleRate,channels,source.FrameCount));token.ThrowIfCancellationRequested();
            progress?.Report(new AudioProgress(1,"分解完成"));return opened.ToArray();
        }
        catch
        {
            foreach(var stream in streams)stream.Dispose();store.Discard(opened);
            foreach(string path in paths)AudioStore.TryDelete(path);throw;
        }
    }
    internal static void WriteResidual(IAudioFrameSource source,IReadOnlyList<AudioAsset> opened,string path,CancellationToken token)
    {
        using var outputFile=new FileStream(path,FileMode.CreateNew,FileAccess.Write,FileShare.None,262144);
        int channels=source.Channels;float[] parent=new float[65536/channels*channels],part=new float[parent.Length];
        for(long frame=0;frame<source.FrameCount;)
        {
            token.ThrowIfCancellationRequested();int take=(int)Math.Min(parent.Length/channels,source.FrameCount-frame);
            if(source.ReadFrames(frame,parent.AsSpan(0,take*channels))!=take)throw new EndOfStreamException();
            foreach(var asset in opened){asset.ReadFrames(frame,part.AsSpan(0,take*channels));for(int i=0;i<take*channels;i++)parent[i]-=part[i];}
            foreach(float value in parent.AsSpan(0,take*channels))if(!float.IsFinite(value))throw new InvalidDataException("分解产生了无效声音。");
            outputFile.Write(MemoryMarshal.AsBytes(parent.AsSpan(0,take*channels)));frame+=take;
        }
        outputFile.Flush(true);
    }
}

internal interface IMaskPlan
{
    int Count {get;}
    void Fill(long start,double[] magnitude,double[][] masks,CancellationToken token);
}
internal sealed class TemplateMasks(SpectralModel model):IMaskPlan
{
    public int Count=>model.Templates.Length;
    private readonly double[] h=new double[model.Templates.Length];
    public void Fill(long start,double[] magnitude,double[][] masks,CancellationToken token)
    {
        model.Activations(magnitude,h);
        for(int f=0;f<magnitude.Length;f++)
        {
            double denominator=0;for(int a=0;a<Count;a++){double score=model.Templates[a][f]*h[a];denominator+=score*score;}
            for(int a=0;a<Count-1;a++){double score=model.Templates[a][f]*h[a];masks[a][f]=denominator>1e-24?score*score/denominator:0;}
        }
    }
}
