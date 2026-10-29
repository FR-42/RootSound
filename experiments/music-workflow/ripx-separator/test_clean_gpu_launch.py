import os, sys, subprocess, json, time, uuid, hashlib
from pathlib import Path
ROOT=Path(r'D:\RootSound\experiments\music-workflow\ripx-separator')
PYTHON=Path(r'C:\Users\38053\anaconda3\python.exe')

if '--child' not in sys.argv:
    env=os.environ.copy()
    env['PATH']=r'C:\Windows\System32;C:\Windows'
    for key in ('PYTHONPATH','PYTHONHOME','CONDA_PREFIX','CONDA_DEFAULT_ENV'):
        env.pop(key,None)
    result=subprocess.run([str(PYTHON),__file__,'--child'],env=env,timeout=180)
    if result.returncode: sys.exit(result.returncode)
    result=subprocess.run([str(ROOT.parent/'RipX音色分离.exe'),'--smoke'],env=env,timeout=30)
    assert result.returncode==0
    print('PASS: clean-PATH GUI worker 4/6 and EXE hidden startup')
    sys.exit(0)

sys.path.insert(0,str(ROOT))
import bootstrap
import app
import numpy as np
import soundfile as sf
run=ROOT/'tests-output'/('clean-launch-'+uuid.uuid4().hex[:8])
run.mkdir(parents=True)
rate=44100
t=np.arange(rate*2)/rate
signal=.15*np.sin(2*np.pi*440*t)*np.minimum(1,t/.03)*np.minimum(1,(2-t)/.03)
source=run/'generated.wav'
sf.write(source,np.column_stack((signal,signal)),rate,subtype='FLOAT')
before=hashlib.sha256(source.read_bytes()).hexdigest()
errors=[]
app.messagebox.showerror=lambda title,text:errors.append((title,text))
ui=app.Application(hidden=True)
results={'launch_environment':'PATH contains only Windows directories before bootstrap; no Conda/PYTHONPATH activation','modes':{}}
for mode in ('4','6'):
    job=run/('split-'+mode)
    ui.run_job({'action':'separate','input':str(source),'mode':mode,'midi':False,'device':'gpu','job':str(job)},ui.load_project)
    end=time.monotonic()+75
    while ui.busy and time.monotonic()<end:
        ui.update(); time.sleep(.05)
    if ui.busy:
        ui.cancel(); raise AssertionError('GPU worker timeout')
    assert not errors,errors
    data=json.loads((job/'project.json').read_text(encoding='utf8'))
    assert data['device']=='xpu'
    assert len(data['stems'])==int(mode)
    assert ui.project==job/'project.json'
    for track in data['stems']:
        samples,sr=sf.read(job/track['file'])
        assert sr==rate and samples.shape==(len(t),2) and np.isfinite(samples).all()
    results['modes'][mode]={'device':data['device'],'device_name':data['device_name'],'frames':data['frames'],'ui_result_loaded':True}
ui.destroy()
assert hashlib.sha256(source.read_bytes()).hexdigest()==before
results['source_unchanged']=True
(run/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'last-clean-launch-test.txt').write_text(str(run),encoding='utf8')
print(json.dumps(results,ensure_ascii=True),flush=True)
