using System.Diagnostics;
using System.Text;
using System.Text.Json;
using RootSound.SampleEditor.Audio;
using RootSound.SampleEditor.Core;

namespace RootSound.ToneStructure;

internal static class DemucsRunner
{
    private sealed record RuntimePaths(string Python,string Packages,string GpuPackages,string Weights,string Script);
    private static RuntimePaths Locate(string root)
    {
        // The launcher passes this module's directory, while tests may pass the
        // experiment directory. Resolve the repository from either entry point.
        var directory=new DirectoryInfo(Path.GetFullPath(root));
        while(directory.Parent is not null && !File.Exists(Path.Combine(directory.FullName,"governance","NORMS.md")))directory=directory.Parent;
        string workspace=directory.FullName;
        return new(Environment.GetEnvironmentVariable("ROOTSOUND_STRUCTURE_PYTHON")??Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),"anaconda3","python.exe"),
            Path.Combine(workspace,".cache","reference-python"),Environment.GetEnvironmentVariable("ROOTSOUND_STRUCTURE_GPU_PACKAGES")??Path.Combine(workspace,".cache","tone-structure-gpu","packages"),
            Path.Combine(workspace,".cache","reference-downloads","hdemucs_high_trained.pt"),Path.Combine(AppContext.BaseDirectory,"demucs_worker.py"));
    }
    internal static string? Unavailable(string root)
    {
        var paths=Locate(root);
        if(!File.Exists(paths.Python) || !File.Exists(Path.Combine(paths.Packages,"torch","__init__.py")) || !File.Exists(Path.Combine(paths.Packages,"torchaudio","__init__.py")) || !File.Exists(paths.Weights) || !File.Exists(paths.Script))
            return "本机模型或运行组件不齐全；可先选择其他方法，不会自动下载或改用别的方法。";
        return null;
    }
    internal static ModelOutput Split(AudioAsset source,AudioStore store,string root,IProgress<AudioProgress>? progress,CancellationToken token,ModelDevice device=ModelDevice.Cpu)
    {
        var paths=Locate(root);string[] outputs=Enumerable.Range(0,4).Select(_=>store.AllocatePath()).ToArray();
        string weights=store.AllocatePath(),request=Path.Combine(store.DirectoryPath,Guid.NewGuid().ToString("N")+".json"),executionPath=Path.Combine(store.DirectoryPath,Guid.NewGuid().ToString("N")+".json");var opened=new List<AudioAsset>();
        try
        {
            bool gpuReady=File.Exists(Path.Combine(paths.GpuPackages,"torch","__init__.py"));
            if(device==ModelDevice.Gpu && !gpuReady)throw new InvalidOperationException("GPU 运行组件未安装，当前分解结果保留。可选择 CPU。");
            bool useGpu=device!=ModelDevice.Cpu && gpuReady;string? fallback=device==ModelDevice.Auto && !gpuReady?"运行组件未安装":null;
            for(int attempt=0;;attempt++)
            {
                token.ThrowIfCancellationRequested();
                File.WriteAllText(request,JsonSerializer.Serialize(new{input=source.Path,rate=source.SampleRate,channels=source.Channels,frames=source.FrameCount,outputs=outputs.Take(3).ToArray(),sums=weights,packages=useGpu?paths.GpuPackages:paths.Packages,support=paths.Packages,weights=paths.Weights,device=useGpu?"gpu":"cpu",execution=executionPath}),new UTF8Encoding(false));
                var result=RunProcess(paths,request,progress,token);
                if(result.ExitCode==0)break;
                string reason=ShortError(result.Error);
                if(device==ModelDevice.Auto && useGpu && attempt==0 && result.ExitCode==3)
                {
                    fallback=reason;useGpu=false;foreach(string path in outputs)AudioStore.TryDelete(path);AudioStore.TryDelete(weights);AudioStore.TryDelete(executionPath);
                    progress?.Report(new AudioProgress(.01,"GPU 未能完成，自动改用 CPU："+reason));continue;
                }
                throw new InvalidOperationException((useGpu?"GPU":"CPU")+" 乐器模型处理失败："+reason);
            }
            var execution=JsonSerializer.Deserialize<ModelExecution>(File.ReadAllText(executionPath))??throw new InvalidDataException("模型没有报告实际运行设备。");
            if(useGpu!=execution.UsedGpu)throw new InvalidDataException("模型运行设备与选择不一致。");
            execution=execution with{FallbackReason=fallback};
            foreach(string path in outputs.Take(3))opened.Add(store.Open(path,source.SampleRate,source.Channels,source.FrameCount));
            Decomposer.WriteResidual(source,opened,outputs[3],token);opened.Add(store.Open(outputs[3],source.SampleRate,source.Channels,source.FrameCount));token.ThrowIfCancellationRequested();
            progress?.Report(new AudioProgress(1,"乐器模型分轨完成 · "+execution.Description));return new(opened.ToArray(),execution);
        }
        catch{store.Discard(opened);foreach(string path in outputs)AudioStore.TryDelete(path);throw;}
        finally{AudioStore.TryDelete(weights);AudioStore.TryDelete(request);AudioStore.TryDelete(executionPath);}
    }
    internal static Task<GpuAvailability> ProbeAsync(string root,CancellationToken token)=>Task.Run(()=>
    {
        var paths=Locate(root);
        if(!File.Exists(Path.Combine(paths.GpuPackages,"torch","__init__.py")))return new GpuAvailability(false,null,null,"GPU 运行组件未安装");
        string request=Path.Combine(Path.GetTempPath(),"RootSound-GpuProbe-"+Guid.NewGuid().ToString("N")+".json");
        try
        {
            File.WriteAllText(request,JsonSerializer.Serialize(new{probe=true,packages=paths.GpuPackages,support=paths.Packages}));
            var result=RunProcess(paths,request,null,token);
            if(result.ExitCode!=0)return new GpuAvailability(false,null,null,ShortError(result.Error));
            using var data=JsonDocument.Parse(result.Output.Trim());var value=data.RootElement;
            return new GpuAvailability(value.GetProperty("available").GetBoolean(),value.GetProperty("name").GetString(),value.GetProperty("backend").GetString(),null);
        }
        catch(OperationCanceledException){throw;}
        catch(Exception ex){return new GpuAvailability(false,null,null,ShortError(ex.Message));}
        finally{AudioStore.TryDelete(request);}
    },token);
    private static string ShortError(string error)
    {string last=error.Split(['\r','\n'],StringSplitOptions.RemoveEmptyEntries).LastOrDefault()??"未知错误";return last.Length>240?last[..240]:last;}
    private static (int ExitCode,string Error,string Output) RunProcess(RuntimePaths paths,string request,IProgress<AudioProgress>? progress,CancellationToken token)
    {
        token.ThrowIfCancellationRequested();
        var info=new ProcessStartInfo(paths.Python){UseShellExecute=false,CreateNoWindow=true,RedirectStandardOutput=true,RedirectStandardError=true,StandardOutputEncoding=Encoding.UTF8,StandardErrorEncoding=Encoding.UTF8};
        info.ArgumentList.Add("-u");info.ArgumentList.Add(paths.Script);info.ArgumentList.Add(request);
        info.Environment["PYTHONIOENCODING"]="utf-8";info.Environment["PYTHONDONTWRITEBYTECODE"]="1";info.Environment["OMP_NUM_THREADS"]="4";info.Environment["MKL_THREADING_LAYER"]="SEQUENTIAL";
        using var process=new Process{StartInfo=info};process.Start();
        using var cancellation=token.Register(()=>{try{if(!process.HasExited)process.Kill(true);}catch(InvalidOperationException){}catch(System.ComponentModel.Win32Exception){}});
        var errorTask=ReadErrorAsync(process.StandardError);var output=new StringBuilder();
        try
        {
            string? line;while((line=process.StandardOutput.ReadLine())is not null)
            {
                token.ThrowIfCancellationRequested();
                try
                {
                    using var value=JsonDocument.Parse(line);
                    if(value.RootElement.TryGetProperty("progress",out var fraction))progress?.Report(new AudioProgress(fraction.GetDouble(),value.RootElement.GetProperty("message").GetString()??"本地模型处理中…"));
                    else{output.AppendLine(line);if(output.Length>12000)output.Remove(0,output.Length-12000);}
                }
                catch(JsonException){}
            }
        }
        finally{process.WaitForExit();}
        token.ThrowIfCancellationRequested();return(process.ExitCode,errorTask.GetAwaiter().GetResult(),output.ToString());
    }
    private static async Task<string> ReadErrorAsync(StreamReader reader)
    {
        var text=new StringBuilder();char[] buffer=new char[2048];int count;
        while((count=await reader.ReadAsync(buffer))>0){text.Append(buffer,0,count);if(text.Length>6000)text.Remove(0,text.Length-6000);}
        return text.ToString().Trim();
    }
}
