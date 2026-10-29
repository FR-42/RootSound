from pathlib import Path
import sys,json,subprocess,time,hashlib,uuid
root=Path(r'D:\RootSound\experiments\music-workflow\ripx-separator')
sys.path.insert(0,str(root));import bootstrap
import numpy as np,soundfile as sf
source=Path((root/'last-test.txt').read_text(encoding='utf8'))/'generated A4.wav'
before=hashlib.sha256(source.read_bytes()).hexdigest()
run=root/'tests-output'/('gpu-'+uuid.uuid4().hex[:8]);run.mkdir()
results={}
for mode in ('4','6'):
    request=run/('request-'+mode+'.json');job=run/('split-'+mode)
    request.write_text(json.dumps(dict(action='separate',input=str(source),job=str(job),mode=mode,device='gpu',midi=False)),encoding='utf8')
    start=time.perf_counter()
    with (run/('worker-'+mode+'.log')).open('w',encoding='utf8') as log:
        process=subprocess.run([bootstrap.CONFIG['python'],'-u',str(root/'engine.py'),str(request)],stdout=log,stderr=subprocess.STDOUT,timeout=240,creationflags=subprocess.CREATE_NO_WINDOW)
    assert process.returncode==0,(run/('worker-'+mode+'.log')).read_text(encoding='utf8')[-4000:]
    manifest=json.loads((job/'project.json').read_text(encoding='utf8'))
    assert manifest['device']=='xpu' and len(manifest['stems'])==int(mode)
    combined=None
    for stem in manifest['stems']+[{'file':manifest['residual']}]:
        data,rate=sf.read(job/stem['file'],dtype='float32',always_2d=True)
        assert np.isfinite(data).all() and len(data)==manifest['frames']
        combined=data if combined is None else combined+data
    original,_=sf.read(source,dtype='float32',always_2d=True)
    error=float(np.abs(combined-original).max());assert error<2e-6
    results[mode]={'wall_seconds':time.perf_counter()-start,'actual_device':manifest['device'],'device_name':manifest['device_name'],'reconstruction_max_error':error}
    print(mode,results[mode],flush=True)
assert hashlib.sha256(source.read_bytes()).hexdigest()==before
import app
ui=app.Application(hidden=True);assert ui.device.get()=='gpu' and not ui.want_midi.get()
ui.load_project(str(run/'split-6'/'project.json'));ui.update_idletasks();ui.destroy()
results.update(source_unchanged=True,default_gpu=True,basic_pitch_default_off=True,hidden_ui_load=True)
(run/'results.json').write_text(json.dumps(results,indent=2),encoding='utf8')
(root/'last-gpu-test.txt').write_text(str(run),encoding='utf8')
print('GPU WORKFLOW PASS',run,flush=True)
