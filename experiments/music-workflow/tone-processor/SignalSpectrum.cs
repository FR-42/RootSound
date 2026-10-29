using RootSound.SampleEditor.Analysis;
using RootSound.SampleEditor.Core;
namespace RootSound.ToneProcessor;

internal sealed record FrequencyPoint(double x,double y);
internal static class SignalSpectrum
{
    // Measure the EQ output feeding the playback device. Average channel powers so opposite phases do not cancel.
    internal static FrequencyPoint[] Measure(IAudioFrameSource source,long clock,CancellationToken token)
    {
        const int size=4096;
        float[] samples=new float[size*source.Channels];
        int count=source.ReadFrames(Math.Max(0,clock-size/2),samples);if(count==0)return [];
        double[] real=new double[size],imaginary=new double[size],power=new double[size/2+1];
        double sum=0;for(int i=0;i<size;i++)sum+=.5-.5*Math.Cos(2*Math.PI*i/(size-1));
        for(int ch=0;ch<source.Channels;ch++)
        {
            token.ThrowIfCancellationRequested();
            for(int i=0;i<size;i++)real[i]=samples[i*source.Channels+ch]*(.5-.5*Math.Cos(2*Math.PI*i/(size-1)));
            Array.Clear(imaginary);Radix2Fft.Transform(real,imaginary);
            for(int bin=1;bin<power.Length;bin++)power[bin]+=(real[bin]*real[bin]+imaginary[bin]*imaginary[bin])*4/(sum*sum*source.Channels);
        }
        var points=new List<FrequencyPoint>();double maximum=Math.Min(20000,source.SampleRate/2d);int previous=0;
        for(int i=0;i<=320;i++)
        {
            int bin=Math.Clamp((int)Math.Round(20*Math.Pow(maximum/20,i/320d)*size/source.SampleRate),1,size/2);
            if(bin<=previous)continue;
            double peak=0;for(int b=previous+1;b<=bin;b++)peak=Math.Max(peak,power[b]);previous=bin;
            double hz=bin*(double)source.SampleRate/size;if(hz<20 || hz>20000)continue;
            points.Add(new(hz,Math.Clamp(10*Math.Log10(Math.Max(1e-12,peak)),-96,24)));
        }
        return points.ToArray();
    }
}
