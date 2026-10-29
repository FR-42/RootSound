using System.Buffers;
using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Core;

namespace RootSound.ToneStructure;

internal sealed record Layer(Guid Id,string Name,AudioAsset Audio,bool Active);
internal sealed class LayerMixSource : IAudioFrameSource
{
    private Layer[] layers;
    public int SampleRate {get;}
    public int Channels {get;}
    public long FrameCount {get;}
    internal LayerMixSource(AudioAsset original,Layer[] layers)
    {SampleRate=original.SampleRate;Channels=original.Channels;FrameCount=original.FrameCount;this.layers=layers;}
    internal void SetLayers(Layer[] value)=>Volatile.Write(ref layers,value);
    public int ReadFrames(long start,Span<float> destination)
    {
        if(start<0 || start>FrameCount || destination.Length%Channels!=0)throw new ArgumentOutOfRangeException(nameof(start));
        int frames=(int)Math.Min(FrameCount-start,destination.Length/Channels);destination.Clear();
        if(frames==0)return 0;
        float[] buffer=ArrayPool<float>.Shared.Rent(frames*Channels);
        try
        {
            var data=buffer.AsSpan(0,frames*Channels);
            foreach(var layer in Volatile.Read(ref layers))if(layer.Active)
            {
                if(layer.Audio.ReadFrames(start,data)!=frames)throw new EndOfStreamException("声部缓存不完整。");
                for(int i=0;i<data.Length;i++)destination[i]+=data[i];
            }
            return frames;
        }
        finally{ArrayPool<float>.Shared.Return(buffer);}
    }
}

internal sealed class StructureSession : IDisposable
{
    internal const int MaximumLayers=16;
    internal AudioStore Store {get;}
    internal AudioAsset Original {get;}
    internal ImportedAudio Origin {get;}
    internal Layer[] Layers {get;private set;}
    internal LayerMixSource Mix {get;}
    private readonly List<Layer[]> history=[];
    internal bool CanUndo=>history.Count>0;
    internal bool Decomposed=>Layers.Length!=1 || !ReferenceEquals(Layers[0].Audio,Original);
    internal StructureSession(AudioStore store,AudioAsset original,ImportedAudio origin)
    {
        Store=store;Original=original;Origin=origin;
        Layers=[new(Guid.NewGuid(),"原片段",original,true)];Mix=new(original,Layers);
    }
    internal void SetActive(Guid id,bool active)
    {Layers=Layers.Select(x=>x.Id==id?x with{Active=active}:x).ToArray();Mix.SetLayers(Layers);}
    internal void Commit(Guid id,AudioAsset[] children,string[]? names=null,bool fromOriginal=false)
    {
        int index=Array.FindIndex(Layers,x=>x.Id==id);
        if((!fromOriginal && index<0) || children.Length<2 || (fromOriginal?children.Length:Layers.Length-1+children.Length)>MaximumLayers)throw new InvalidOperationException("本次分解已不适用，原结果保留。");
        if(children.Any(x=>x.FrameCount!=Original.FrameCount || x.SampleRate!=Original.SampleRate || x.Channels!=Original.Channels))throw new InvalidDataException("声部没有与原片段对齐。");
        if(names is not null && names.Length!=children.Length)throw new InvalidDataException("声部名称与结果不一致。");
        var parent=fromOriginal?new Layer(Guid.Empty,"原片段",Original,true):Layers[index];history.Add(Layers);if(history.Count>8)history.RemoveAt(0);
        string prefix=ReferenceEquals(parent.Audio,Original)?"结构":parent.Name+"·";
        var created=children.Select((audio,i)=>new Layer(Guid.NewGuid(),names is null?prefix+(i+1):(fromOriginal || ReferenceEquals(parent.Audio,Original)?names[i]:parent.Name+" / "+names[i]),audio,parent.Active));
        Layers=fromOriginal?created.ToArray():Layers.Take(index).Concat(created).Concat(Layers.Skip(index+1)).ToArray();Mix.SetLayers(Layers);Collect();
    }
    internal void Undo()
    {
        if(!CanUndo)return;Layers=history[^1];history.RemoveAt(history.Count-1);Mix.SetLayers(Layers);Collect();
    }
    internal void Collect()=>Store.Retain(history.SelectMany(x=>x).Select(x=>x.Audio).Concat(Layers.Select(x=>x.Audio)).Append(Original));
    internal LayerMixSource Snapshot()=>new(Original,Layers.ToArray());
    public void Dispose()=>Store.Dispose();
}
