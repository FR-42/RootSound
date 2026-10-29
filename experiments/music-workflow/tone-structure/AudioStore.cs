using System.Runtime.InteropServices;
using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Core;

namespace RootSound.ToneStructure;

internal sealed class AudioAsset : IAudioFrameSource,IDisposable
{
    private readonly AudioFrameReader reader;
    internal string Path {get;}
    public int SampleRate {get;}
    public int Channels {get;}
    public long FrameCount {get;}
    internal AudioAsset(string path,int rate,int channels,long frames)
    {Path=path;SampleRate=rate;Channels=channels;FrameCount=frames;reader=new(path,rate,channels,frames);}
    public int ReadFrames(long frame,Span<float> destination)=>reader.ReadFrames(frame,destination);
    public void Dispose(){reader.Dispose();try{File.Delete(Path);}catch(IOException){}catch(UnauthorizedAccessException){}}
}

internal sealed class AudioStore : IDisposable
{
    internal string DirectoryPath {get;}
    private readonly List<AudioAsset> assets=[];
    private int disposed;
    internal AudioStore(string? parent=null)
    {DirectoryPath=System.IO.Path.Combine(parent??System.IO.Path.GetTempPath(),"RootSound-Structure-"+Guid.NewGuid().ToString("N"));Directory.CreateDirectory(DirectoryPath);}
    internal string AllocatePath()=>System.IO.Path.Combine(DirectoryPath,Guid.NewGuid().ToString("N")+".f32");
    internal AudioAsset Open(string path,int rate,int channels,long frames)
    {
        if(!string.Equals(System.IO.Path.GetDirectoryName(System.IO.Path.GetFullPath(path)),DirectoryPath,StringComparison.OrdinalIgnoreCase))throw new IOException("音频缓存位置无效。");
        if(new FileInfo(path).Length!=checked(frames*channels*4))throw new InvalidDataException("音频缓存不完整。");
        var asset=new AudioAsset(path,rate,channels,frames);assets.Add(asset);return asset;
    }
    internal AudioAsset Copy(IAudioFrameSource source,IProgress<AudioProgress>? progress,CancellationToken token)
    {
        string path=AllocatePath();
        try
        {
            using(var output=new FileStream(path,FileMode.CreateNew,FileAccess.Write,FileShare.None,262144))
            {
                float[] buffer=new float[65536/source.Channels*source.Channels];
                for(long frame=0;frame<source.FrameCount;)
                {
                    token.ThrowIfCancellationRequested();int count=(int)Math.Min(buffer.Length/source.Channels,source.FrameCount-frame);
                    var data=buffer.AsSpan(0,count*source.Channels);
                    if(source.ReadFrames(frame,data)!=count)throw new EndOfStreamException("原片段读取不完整。");
                    foreach(float value in data)if(!float.IsFinite(value))throw new InvalidDataException("音频含无效数值。");
                    output.Write(MemoryMarshal.AsBytes(data));frame+=count;
                    progress?.Report(new AudioProgress(frame/(double)source.FrameCount,"正在接收乐曲片段…"));
                }
                output.Flush(true);
            }
            token.ThrowIfCancellationRequested();return Open(path,source.SampleRate,source.Channels,source.FrameCount);
        }
        catch{TryDelete(path);throw;}
    }
    internal void Retain(IEnumerable<AudioAsset> retained)
    {
        var keep=retained.ToHashSet();
        foreach(var asset in assets.Where(a=>!keep.Contains(a)).ToArray()){asset.Dispose();assets.Remove(asset);}
    }
    internal void Discard(IEnumerable<AudioAsset> removed)
    {foreach(var asset in removed.ToArray()){asset.Dispose();assets.Remove(asset);}}
    internal static void TryDelete(string path){try{File.Delete(path);}catch(IOException){}catch(UnauthorizedAccessException){}}
    public void Dispose()
    {
        if(Interlocked.Exchange(ref disposed,1)!=0)return;
        foreach(var asset in assets)asset.Dispose();assets.Clear();
        // Only this store's uniquely owned files; never recursively remove a directory.
        foreach(string file in Directory.EnumerateFiles(DirectoryPath,"*.f32"))TryDelete(file);
        try{Directory.Delete(DirectoryPath,false);}catch(IOException){}catch(UnauthorizedAccessException){}
    }
}
