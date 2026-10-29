using System.Text.Json;
using RootSound.SampleEditor.Audio;

namespace RootSound.ToneStructure.Tests;
internal static partial class Program
{
    private static void CheckCpuDefault(string root)
    {
        using var store=new AudioStore(root);var audio=store.Copy(new FunctionSource(16000,1,2,(t,_)=>.1*Math.Sin(2*Math.PI*220*t)),null,CancellationToken.None);
        var result=SeparationMethods.Run(audio,SeparationMethod.Demucs,4,store,Experiment,null,CancellationToken.None);
        Check(result.Execution is {UsedGpu:false,Backend:"cpu",FallbackReason:null},"omitting device runs CPU directly even while a usable GPU runtime is installed");
        Check(Reconstruction(audio,result.Audio)<2e-7,"default CPU execution retains complete complementary audio");
        File.WriteAllText(Path.Combine(root,"cpu-default.json"),JsonSerializer.Serialize(result.Execution));
    }
    private static void CheckGpu(string root,AudioStore store,AudioAsset mono,AudioAsset stereo,SeparationResult cpu)
    {
        var probe=DemucsRunner.ProbeAsync(Experiment,CancellationToken.None).GetAwaiter().GetResult();
        Check(probe.Available && probe.Backend is "xpu" or "cuda","real GPU probe imports the isolated runtime and computes a matrix: "+probe.Reason);
        Check(cpu.Execution is {UsedGpu:false,Backend:"cpu"},"explicit CPU selection remains on the original CPU runtime");
        var gpu=SeparationMethods.Run(stereo,SeparationMethod.Demucs,4,store,Experiment,null,CancellationToken.None,ModelDevice.Gpu);
        Check(gpu.Execution is {UsedGpu:true} && gpu.Execution.Backend==probe.Backend,"explicit GPU model runs and returns its real device");
        Check(gpu.Audio.All(x=>x.Channels==2 && x.FrameCount==stereo.FrameCount && x.SampleRate==stereo.SampleRate),"GPU multi-window processing preserves complete stereo format");
        double reconstruction=Reconstruction(stereo,gpu.Audio);Check(reconstruction<2e-7,"GPU parts plus complementary residual reconstruct the parent");
        double difference=gpu.Audio.Select((x,i)=>Difference(x,cpu.Audio[i])).Max();
        Check(difference<.001,"GPU and CPU outputs agree within a meaningful floating-point tolerance");
        var automatic=SeparationMethods.Run(mono,SeparationMethod.Demucs,4,store,Experiment,null,CancellationToken.None,ModelDevice.Auto);
        Check(automatic.Execution is {UsedGpu:true,FallbackReason:null},"automatic mode actually selects the available GPU");
        Check(Reconstruction(mono,automatic.Audio)<2e-7,"automatic GPU mode preserves mono and complementary sum");
        using(var cancel=new CancellationTokenSource())
        {
            int before=Directory.GetFiles(store.DirectoryPath).Length;
            var progress=new InlineProgress(p=>{if(p.Fraction>.05)cancel.Cancel();});
            Throws<OperationCanceledException>(()=>SeparationMethods.Run(stereo,SeparationMethod.Demucs,4,store,Experiment,progress,cancel.Token,ModelDevice.Gpu));
            Check(Directory.GetFiles(store.DirectoryPath).Length==before,"canceling GPU after real inference terminates process and removes unfinished cache");
        }
        string? prior=Environment.GetEnvironmentVariable("ROOTSOUND_STRUCTURE_GPU_PACKAGES");
        try
        {
            // The real CPU-only library deliberately cannot satisfy a forced GPU request.
            string workspace=Path.GetFullPath(Path.Combine(Experiment,"..",".."));
            Environment.SetEnvironmentVariable("ROOTSOUND_STRUCTURE_GPU_PACKAGES",Path.Combine(workspace,".cache","reference-python"));
            int before=Directory.GetFiles(store.DirectoryPath).Length;
            Throws<InvalidOperationException>(()=>SeparationMethods.Run(mono,SeparationMethod.Demucs,4,store,Experiment,null,CancellationToken.None,ModelDevice.Gpu));
            Check(Directory.GetFiles(store.DirectoryPath).Length==before,"GPU-only mode reports unavailable backend without creating CPU results");
            var fallback=SeparationMethods.Run(mono,SeparationMethod.Demucs,4,store,Experiment,null,CancellationToken.None,ModelDevice.Auto);
            Check(fallback.Execution is {UsedGpu:false,Backend:"cpu",FallbackReason:not null},"auto mode retries CPU and explicitly reports the GPU failure");
            Environment.SetEnvironmentVariable("ROOTSOUND_STRUCTURE_GPU_PACKAGES",Path.Combine(store.DirectoryPath,"missing-gpu-runtime"));
            Throws<InvalidOperationException>(()=>SeparationMethods.Run(mono,SeparationMethod.Demucs,4,store,Experiment,null,CancellationToken.None,ModelDevice.Gpu));
            var missing=DemucsRunner.ProbeAsync(Experiment,CancellationToken.None).GetAwaiter().GetResult();
            Check(!missing.Available && missing.Reason is not null,"missing runtime is explained by the detector");
        }
        finally{Environment.SetEnvironmentVariable("ROOTSOUND_STRUCTURE_GPU_PACKAGES",prior);}
        File.WriteAllText(Path.Combine(root,"gpu-metrics.json"),JsonSerializer.Serialize(new{probe,cpu=cpu.Execution,gpu=gpu.Execution,maximumStemRmsDifference=difference,maximumReconstructionError=reconstruction,sameModelWeights=true,realMusicListeningAcceptance=false}));
        Console.WriteLine($"GPU {gpu.Execution!.Device}: {gpu.Execution.Seconds:F2}s total / {gpu.Execution.InferenceSeconds:F2}s inference; CPU {cpu.Execution!.Seconds:F2}s / {cpu.Execution.InferenceSeconds:F2}s; max RMS difference {difference:E2}.");
    }
}
