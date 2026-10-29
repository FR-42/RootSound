from pathlib import Path
import sys,json,subprocess,os,uuid
root=Path(r'D:\RootSound\experiments\music-workflow\ripx-separator')
sys.path.insert(0,str(root));import bootstrap
run=Path((root/'last-gpu-test.txt').read_text(encoding='utf8'))
source=Path((root/'last-test.txt').read_text(encoding='utf8'))/'generated A4.wav'
job=run/'unavailable-gpu';request=run/'unavailable-request.json'
request.write_text(json.dumps(dict(action='separate',input=str(source),job=str(job),mode='4',device='gpu',midi=False)),encoding='utf8')
env=os.environ.copy();env['ONEAPI_DEVICE_SELECTOR']='level_zero:99';env['PYTHONIOENCODING']='utf-8'
result=subprocess.run([bootstrap.CONFIG['python'],'-u',str(root/'engine.py'),str(request)],env=env,capture_output=True,text=True,encoding='utf8',errors='replace',timeout=30,creationflags=subprocess.CREATE_NO_WINDOW)
(run/'gpu-unavailable.log').write_text(result.stdout+result.stderr,encoding='utf8')
assert result.returncode!=0 and not (job/'project.json').exists(),result.stdout+result.stderr
assert 'GPU 后端不可用' in result.stderr,result.stderr
record={'hardware_visibility_mask':'ONEAPI_DEVICE_SELECTOR=level_zero:99 (child process only)','exit_code':result.returncode,'reported_unavailable':True,'no_cpu_result_written':True}
(run/'gpu-unavailable.json').write_text(json.dumps(record,indent=2),encoding='utf8')
print('NO SILENT FALLBACK PASS',record)
