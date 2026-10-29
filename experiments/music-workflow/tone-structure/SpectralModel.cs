using RootSound.SampleEditor.Analysis;
using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Core;

namespace RootSound.ToneStructure;

internal static class SpectralTools
{
    internal static int Size(int rate)=>rate>=22050?4096:2048;
    internal static double[] Window(int size)=>Enumerable.Range(0,size).Select(i=>.5-.5*Math.Cos(2*Math.PI*i/size)).ToArray();
    internal static void Analyze(IAudioFrameSource source,long start,double[] window,float[] samples,double[][] real,double[][] imag,double[] magnitude)
    {
        int size=window.Length;Array.Clear(samples);long first=Math.Max(0,start);
        int pad=(int)(first-start),count=(int)Math.Max(0,Math.Min(size-pad,source.FrameCount-first));
        if(count>0 && source.ReadFrames(first,samples.AsSpan(pad*source.Channels,count*source.Channels))!=count)throw new EndOfStreamException("分析时读取音频失败。");
        Array.Clear(magnitude);
        for(int ch=0;ch<source.Channels;ch++)
        {
            for(int i=0;i<size;i++)real[ch][i]=samples[i*source.Channels+ch]*window[i];
            Array.Clear(imag[ch]);Radix2Fft.Transform(real[ch],imag[ch]);
            for(int f=0;f<magnitude.Length;f++)magnitude[f]+=real[ch][f]*real[ch][f]+imag[ch][f]*imag[ch][f];
        }
        for(int f=0;f<magnitude.Length;f++)magnitude[f]=Math.Sqrt(magnitude[f]/source.Channels);
    }
    internal static void Inverse(double[] real,double[] imag)
    {for(int i=0;i<imag.Length;i++)imag[i]=-imag[i];Radix2Fft.Transform(real,imag);for(int i=0;i<real.Length;i++)real[i]/=real.Length;}
}

/// <summary>Unsupervised nonnegative spectral templates learned from repeated/similar frames.</summary>
internal sealed class SpectralModel
{
    internal double[][] Templates {get;}
    private readonly double[,] gram;
    private SpectralModel(double[][] templates)
    {
        Templates=templates;int k=templates.Length;gram=new double[k,k];
        for(int a=0;a<k;a++)for(int b=0;b<k;b++)for(int f=0;f<templates[a].Length;f++)gram[a,b]+=templates[a][f]*templates[b][f];
    }
    internal void Activations(double[] v,double[] h)
    {
        int k=Templates.Length;Span<double> dot=stackalloc double[k];
        for(int a=0;a<k;a++)for(int f=0;f<v.Length;f++)dot[a]+=Templates[a][f]*v[f];
        for(int pass=0;pass<18;pass++)for(int a=0;a<k;a++)
        {
            double residual=dot[a];for(int b=0;b<k;b++)if(b!=a)residual-=gram[a,b]*h[b];
            h[a]=Math.Max(0,residual/Math.Max(1e-20,gram[a,a]));
        }
    }
    internal static SpectralModel Learn(IAudioFrameSource source,int requested,IProgress<AudioProgress>? progress,CancellationToken token)
    {
        int size=SpectralTools.Size(source.SampleRate),bins=size/2+1,columns=(int)Math.Min(256,Math.Max(16,source.FrameCount/(size/4)));
        double[] window=SpectralTools.Window(size),v=new double[columns*bins];
        float[] samples=new float[size*source.Channels];
        var real=Enumerable.Range(0,source.Channels).Select(_=>new double[size]).ToArray();
        var imag=Enumerable.Range(0,source.Channels).Select(_=>new double[size]).ToArray();double[] magnitude=new double[bins];
        var energy=new double[columns];
        for(int t=0;t<columns;t++)
        {
            token.ThrowIfCancellationRequested();
            // Train on full windows so zero-padding at file edges is not mistaken
            // for an independent recurring source in a stationary tone.
            long center=source.FrameCount>=size?size/2+(long)((source.FrameCount-size)*(t+.5)/columns):source.FrameCount/2;
            SpectralTools.Analyze(source,center-size/2,window,samples,real,imag,magnitude);
            double maximum=magnitude.Max();if(maximum<1e-8)continue;
            for(int f=0;f<bins;f++){double x=magnitude[f]/maximum;v[t*bins+f]=x;energy[t]+=x*x;}
        }
        var seeds=new List<int>();int first=Array.IndexOf(energy,energy.Max());
        if(energy[first]<1e-12)return new([]);seeds.Add(first);
        while(seeds.Count<requested)
        {
            double farthest=0;int selected=-1;
            for(int t=0;t<columns;t++)
            {
                if(energy[t]<1e-12)continue;double distance=1;
                foreach(int s in seeds)
                {
                    double dot=0;for(int f=0;f<bins;f++)dot+=v[t*bins+f]*v[s*bins+f];
                    distance=Math.Min(distance,1-dot/Math.Sqrt(energy[t]*energy[s]));
                }
                if(distance>farthest){farthest=distance;selected=t;}
            }
            if(selected<0 || farthest<.012)break;seeds.Add(selected);
        }
        int k=seeds.Count;var w=new double[k][];double[] h=new double[columns*k],ratio=new double[v.Length];
        for(int a=0;a<k;a++)
        {
            w[a]=new double[bins];double sum=0;
            for(int f=0;f<bins;f++){w[a][f]=v[seeds[a]*bins+f]+1e-7;sum+=w[a][f];}
            for(int f=0;f<bins;f++)w[a][f]/=sum;
        }
        for(int t=0;t<columns;t++)for(int a=0;a<k;a++)h[t*k+a]=1+v[t*bins+bins/4];
        for(int iteration=0;iteration<32;iteration++)
        {
            token.ThrowIfCancellationRequested();
            for(int t=0;t<columns;t++)for(int f=0;f<bins;f++)
            {double estimate=0;for(int a=0;a<k;a++)estimate+=w[a][f]*h[t*k+a];ratio[t*bins+f]=v[t*bins+f]/Math.Max(1e-20,estimate);}
            for(int t=0;t<columns;t++)for(int a=0;a<k;a++)
            {double sum=0;for(int f=0;f<bins;f++)sum+=w[a][f]*ratio[t*bins+f];h[t*k+a]=Math.Max(1e-12,h[t*k+a]*sum);}
            for(int t=0;t<columns;t++)for(int f=0;f<bins;f++)
            {double estimate=0;for(int a=0;a<k;a++)estimate+=w[a][f]*h[t*k+a];ratio[t*bins+f]=v[t*bins+f]/Math.Max(1e-20,estimate);}
            for(int a=0;a<k;a++)
            {
                double denominator=0;for(int t=0;t<columns;t++)denominator+=h[t*k+a];
                double norm=0;
                for(int f=0;f<bins;f++)
                {double sum=0;for(int t=0;t<columns;t++)sum+=ratio[t*bins+f]*h[t*k+a];w[a][f]=Math.Max(1e-15,w[a][f]*sum/Math.Max(1e-20,denominator));norm+=w[a][f];}
                for(int f=0;f<bins;f++)w[a][f]/=norm;
                for(int t=0;t<columns;t++)h[t*k+a]*=norm;
            }
            progress?.Report(new AudioProgress(.06+.24*(iteration+1)/32,"正在寻找相似和重复的频谱结构…"));
        }
        var distinct=new List<double[]>();
        foreach(var candidate in w)
        {
            bool duplicate=distinct.Any(previous=>Cosine(previous,candidate)>.992);
            if(!duplicate)distinct.Add(candidate);
        }
        return new(distinct.ToArray());
    }
    private static double Cosine(double[] a,double[] b)
    {double dot=0,aa=0,bb=0;for(int i=0;i<a.Length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];}return dot/Math.Sqrt(aa*bb);}
}
