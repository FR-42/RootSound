from pathlib import Path
import sys,time,json,statistics,hashlib,os
root=Path(r'D:\RootSound\experiments\music-workflow\ripx-separator')
sys.path.insert(0,str(root));import bootstrap
sys.path.insert(0,str(root/'gpu-packages'))
dll_handles=[os.add_dll_directory(str(p)) for p in (root/'gpu-packages'/'Library'/'bin',root/'gpu-packages'/'bin') if p.is_dir()]
import torch,numpy as np,soundfile as sf
from engine import load_separator
from demucs.apply import apply_model
torch.set_num_threads(4)
assert torch.xpu.is_available()
test=Path((root/'last-test.txt').read_text(encoding='utf8'))
source=test/'generated A4.wav';audio,rate=sf.read(source,dtype='float32',always_2d=True)
audio=audio[:int(7.8*rate)]
tensor=torch.from_numpy(audio.T.copy())[None]
tensor=(tensor-tensor.mean())/tensor.mean(1).std().clamp_min(1e-6)
report={'torch':torch.__version__,'device':str(torch.xpu.get_device_properties(0)),
        'source':str(source),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
        'samples_per_channel':tensor.shape[-1],'rate':rate,'precision':'float32; no autocast','modes':{}}
for mode in ('4','6'):
    model=load_separator(mode)
    outputs={}; measurements={}
    with torch.inference_mode():
        for device in ('cpu','xpu'):
            model=model.to(device);inp=tensor.to(device)
            times=[]
            if device=='xpu':torch.xpu.reset_peak_memory_stats()
            for run in range(3):
                if device=='xpu':torch.xpu.synchronize()
                begin=time.perf_counter()
                out=apply_model(model,inp,device=device,shifts=0,split=False,progress=False)
                if device=='xpu':torch.xpu.synchronize()
                times.append(time.perf_counter()-begin)
                assert out.device.type==device and torch.isfinite(out).all()
                print(mode,device,run,times[-1],flush=True)
            outputs[device]=out.cpu().numpy()
            measurements[device]={'cold_seconds':times[0],'warm_seconds':times[1:],'warm_median_seconds':statistics.median(times[1:])}
            if device=='xpu':measurements[device]['peak_allocated_bytes']=torch.xpu.max_memory_allocated()
        a,b=outputs['cpu'],outputs['xpu'];difference=np.abs(a-b)
        measurements.update(shape=list(a.shape),max_absolute_difference=float(difference.max()),rms_difference=float(np.sqrt(np.mean(difference**2))),
                            warm_speedup=measurements['cpu']['warm_median_seconds']/measurements['xpu']['warm_median_seconds'])
        assert a.shape==b.shape and np.isfinite(b).all()
        # Same float32 model, tolerate backend accumulation differences, never a different model.
        assert float(difference.max())<.005,measurements
        report['modes'][mode]=measurements
        (root/'gpu-validation.json').write_text(json.dumps(report,indent=2),encoding='utf8')
        print('PASS',mode,measurements,flush=True)
    del model,out,outputs
    torch.xpu.empty_cache()
