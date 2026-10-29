import { createCurveEditor } from './shared/curve-editor.mjs';
import { EqHistory, flatSpectrum } from './eq-state.mjs';

const byId = id => document.getElementById(id);
const post = value => window.chrome?.webview?.postMessage(value);
const state = new EqHistory(), worker = new Worker('eq-worker.mjs',{type:'module'});
let sampleRate=48000, revision=0, applied=0, current=state.value, timer, waiters=[];
const status = message => { byId('eq-status').textContent=message; };
function schedule(spectrum=current) {
  current=state.preview(spectrum); revision++;
  post({type:'pending',revision,sampleRate}); status('正在更新 EQ…');
  clearTimeout(timer); timer=setTimeout(build,45);
}
function build() { clearTimeout(timer); timer=undefined; worker.postMessage({revision,sampleRate,spectrum:current}); }
function finishWaiters() {
  if (applied!==revision) return;
  for (const id of waiters) post({type:'synced',id,revision}); waiters=[];
}
worker.onmessage = ({data}) => {
  if (data.revision!==revision || data.sampleRate && data.sampleRate!==sampleRate) return;
  if (data.error) { status(`EQ 更新失败：${data.error}`); post({type:'error',message:data.error}); return; }
  post({type:'kernel',revision,sampleRate,impulse:Array.from(data.impulse)});
};
worker.onerror = () => { status('EQ 未能启动，请重新打开工具。'); post({type:'error',message:'EQ 计算未能启动。'}); };
const readable = n => Number(n.toPrecision(6)).toString();
function commit(spectrum) { state.commit(spectrum); paint(); schedule(state.value); }
const editor=createCurveEditor(byId('spectrum-editor'), {
  kind:'spectrum',label:'频率 → 强弱',xMin:20,xMax:20000,yMin:-96,yMax:24,logX:true,
  points:state.value.points,maxPoints:10,lockEndpoints:true,
  formatX:n=>n>=1000?`${readable(n/1000)}k`:readable(n),formatY:n=>`${readable(n)} dB`,
  onPreview:points=>schedule({...current,points}),
  onCommit:points=>commit({...current,points}), onCancel:()=>{paint();schedule(state.value);},
});
function paint() {
  current=state.value; editor.setPoints(current.points);
  byId('mix').value=String(current.mix); byId('mix-value').value=`${Math.round(current.mix*100)}%`;
  byId('undo').disabled=!state.past.length; byId('redo').disabled=!state.future.length;
}
byId('mix').addEventListener('input',()=>{ const mix=Number(byId('mix').value); byId('mix-value').value=`${Math.round(mix*100)}%`; schedule({...current,mix}); });
byId('mix').addEventListener('change',()=>commit(current));
byId('undo').onclick=()=>{state.undo();paint();schedule(state.value);};
byId('redo').onclick=()=>{state.redo();paint();schedule(state.value);};
byId('reset').onclick=()=>commit(flatSpectrum());
window.chrome?.webview?.addEventListener('message',({data})=>{
  if(data.type==='rate') {sampleRate=data.sampleRate;schedule(current);}
  if(data.type==='analysis') editor.setAnalysis(data.points,{label:data.points.length?'EQ 后频谱 · dBFS':'试听后显示实际频谱',filled:true});
  if(data.type==='applied' && data.revision===revision) {applied=revision;status('EQ 已生效 · 试听和导出使用相同的加工');finishWaiters();}
  if(data.type==='sync') {waiters.push(data.id);if(applied===revision)finishWaiters();else if(timer)build();}
});
document.addEventListener('keydown',e=>{
  if(e.code==='Space' && !['INPUT','TEXTAREA','BUTTON'].includes(e.target.tagName)) {e.preventDefault();post({type:'play'});}
  if(e.ctrlKey && e.key.toLowerCase()==='z' && e.target.tagName!=='INPUT') {e.preventDefault();byId(e.shiftKey?'redo':'undo').click();}
});
paint(); post({type:'ready'});
