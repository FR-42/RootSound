import { createTapTempo } from './tap-tempo-model.ts';
import './tap-tempo.css';

export function showTapTempo(root:HTMLElement, options:{onApply(bpm:number):void; onClose?():void; now?():number}):{dispose():void} {
  const model=createTapTempo();let closed=false;let timer=0;
  const dialog=document.createElement('dialog');dialog.className='tap-tempo-dialog';dialog.setAttribute('aria-label','敲击定速');
  const title=document.createElement('h2');title.textContent='敲击定速';
  const hint=document.createElement('p');hint.className='tap-tempo-hint';hint.textContent='跟着节奏敲空格，也可以点击下方按钮。';
  const display=document.createElement('div');display.className='tap-tempo-display';
  const value=document.createElement('strong');value.className='tap-tempo-value';const unit=document.createElement('span');unit.textContent='BPM';display.append(value,unit);
  const status=document.createElement('p');status.className='tap-tempo-status';status.setAttribute('role','status');
  function button(text:string,className:string,action:()=>void):HTMLButtonElement {const node=document.createElement('button');node.type='button';node.className=className;node.textContent=text;node.addEventListener('click',action);return node;}
  const pad=button('敲一下','tap-tempo-pad',tap);pad.setAttribute('aria-label','敲一下');
  const actions=document.createElement('div');actions.className='tap-tempo-actions';
  const reset=button('重来','tap-tempo-reset',()=>{model.reset();refresh();pad.focus();});
  const cancel=button('取消','tap-tempo-cancel',close);
  const apply=button('应用','tap-tempo-apply',()=>{
    if(closed || apply.disabled)return;const bpm=model.read().bpm;if(bpm===undefined)return;
    try{options.onApply(bpm);close();}catch(error){status.textContent=error instanceof Error?error.message:String(error);}
  });
  function refresh():void {
    const state=model.read();value.textContent=state.bpm===undefined?'—':String(state.bpm);
    const valid=state.bpm!==undefined&&state.bpm>=40&&state.bpm<=240;apply.disabled=!valid;
    status.textContent=state.count<4?`再敲 ${4-state.count} 次`:valid?`已敲 ${state.count} 次，可继续敲得更准`:'当前支持 40～240 BPM，请调整敲击速度。';
  }
  function tap():void {
    if(closed)return;model.tap(options.now?.()??performance.now());refresh();
    pad.classList.add('is-tapped');window.clearTimeout(timer);timer=window.setTimeout(()=>pad.classList.remove('is-tapped'),100);
  }
  function keydown(event:KeyboardEvent):void {
    if(closed)return;
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
    if(event.code!=='Space'&&event.key!==' ')return;
    event.preventDefault();event.stopPropagation();
    if(!event.repeat&&!event.ctrlKey&&!event.metaKey&&!event.altKey)tap();
  }
  function dispose():void {
    if(closed)return;closed=true;window.clearTimeout(timer);document.removeEventListener('keydown',keydown,true);dialog.remove();options.onClose?.();
  }
  function close():void {if(!closed)dialog.close();}
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.addEventListener('close',dispose,{once:true});
  actions.append(reset,cancel,apply);dialog.append(title,hint,display,pad,status,actions);root.append(dialog);refresh();
  document.addEventListener('keydown',keydown,true);dialog.showModal();pad.focus();
  return {dispose};
}
