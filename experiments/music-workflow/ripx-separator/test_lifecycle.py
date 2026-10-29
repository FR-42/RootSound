from bootstrap import ROOT, CONFIG
from pathlib import Path
import json, time, subprocess, uuid, hashlib
import app

test=Path((ROOT/'last-test.txt').read_text(encoding='utf8'))
source=test/'generated A4.wav'; original=hashlib.sha256(source.read_bytes()).hexdigest()
ui=app.Application(hidden=True)
job=test/('cancel-'+uuid.uuid4().hex[:6])
ui.run_job({'action':'separate','input':str(source),'mode':'6','midi':False,'job':str(job)},None)
deadline=time.monotonic()+40
while time.monotonic()<deadline and not list(job.glob('.work-*')):
    ui.update(); time.sleep(.05)
assert list(job.glob('.work-*')),'Worker never reached its owned scratch directory'
ui.cancel()
while ui.busy and time.monotonic()<deadline:
    ui.update(); time.sleep(.05)
assert not ui.busy,'Cancellation did not finish'
assert not list(job.glob('.work-*')),'Scratch cleanup failed'
assert json.loads((job/'status.json').read_text())['status']=='cancelled'
assert all(str(control['state'])!='disabled' for control in ui.controls)
ui.destroy()
assert hashlib.sha256(source.read_bytes()).hexdigest()==original
entry=ROOT.parent/'RipX音色分离.exe'
result=subprocess.run([str(entry),'--smoke'],timeout=20,creationflags=subprocess.CREATE_NO_WINDOW)
assert result.returncode==0
assert json.loads((ROOT/'smoke-result.json').read_text())['ui_created']
record={'cancel_real_worker':True,'scratch_cleaned':True,'controls_reenabled':True,'input_unchanged':True,'exe_hidden_startup':True}
(test/'lifecycle.json').write_text(json.dumps(record,indent=2),encoding='utf8')
print('LIFECYCLE PASS',record)
