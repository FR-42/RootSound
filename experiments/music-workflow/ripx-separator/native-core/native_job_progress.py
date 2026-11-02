"""Own worker progress, durable logs and passive Python-stack diagnostics."""
from pathlib import Path
import faulthandler
import json
import os
import threading
import time


class NativeJobProgress:
    def __init__(self,job,callback):
        self.job=Path(job);self.callback=callback;self.started=time.monotonic()
        self.changed=self.started;self.fraction=0.;self.message='初始化原生处理'
        self.lock=threading.Lock();self.stop=threading.Event()
        self.log=(self.job/'native-progress.log').open('a',encoding='utf8',buffering=1)
        self.stacks=(self.job/'native-stacks.log').open('w',encoding='utf8')
        faulthandler.dump_traceback_later(90,repeat=True,file=self.stacks)
        self.thread=threading.Thread(target=self._heartbeat,name='native-progress',daemon=True);self.thread.start()

    def _publish(self,message,**extra):
        elapsed=round(time.monotonic()-self.started,1)
        value={'progress':self.fraction,'message':message,'elapsed_seconds':elapsed,**extra}
        self.log.write(json.dumps(value,ensure_ascii=False,allow_nan=False)+'\n')
        pending=self.job/'native-progress.json.new';pending.write_text(json.dumps(value,ensure_ascii=False,allow_nan=False),encoding='utf8')
        os.replace(pending,self.job/'native-progress.json')
        self.callback(self.fraction,message,**extra)

    def report(self,fraction,message,**extra):
        with self.lock:
            self.fraction=max(self.fraction,float(fraction));self.message=message;self.changed=time.monotonic()
            self._publish(message,**extra)

    def _heartbeat(self):
        while not self.stop.wait(5):
            with self.lock:
                silent=time.monotonic()-self.changed
                if silent>=4:
                    self._publish(f'{self.message}（仍在处理，距上次进度 {int(silent)} 秒）',heartbeat=True)

    def close(self):
        self.stop.set();self.thread.join(timeout=2)
        faulthandler.cancel_dump_traceback_later();self.stacks.close()
        #The heartbeat writer owns its stream until its thread has stopped.
        if not self.thread.is_alive():self.log.close()
