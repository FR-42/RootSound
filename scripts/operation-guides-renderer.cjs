// Offscreen actual editor. Camera/cursor are composed afterwards at 30 fps.
const {app,BrowserWindow,session}=require('electron');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const config=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),root=config.root;
app.setPath('userData',path.join(root,'profile'));app.commandLine.appendSwitch('disable-gpu');app.commandLine.appendSwitch('force-device-scale-factor','1');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const lessons=[
 {id:'add-voice',title:'添加音色',description:'选音色 → 点卷帘写音符 → 向下拉长。',alt:'添加长笛，在卷帘中写下音符，再拖住音符下边缘向下延长。'},
 {id:'bpm',title:'BPM',description:'数字越大，每拍越短。敲击定速：跟着节奏按空格。',alt:'左侧调整BPM，右侧以相同缩放显示拍线间距变化；按空格敲击定速。'},
 {id:'cells',title:'格数',description:'格数是每拍的细分，不是拍号；4/4也可以每拍分3格。',alt:'同样一拍分别分成2格、3格、4格；格数与一小节有几拍是两回事。'},
 {id:'zoom-horizontal',title:'横向缩放',description:'Ctrl＋Shift＋滚轮，展开音高。',alt:'按Ctrl和Shift滚动鼠标滚轮，琴键与音符的横向宽度改变。'},
 {id:'zoom-vertical',title:'竖向缩放',description:'Ctrl＋滚轮，展开时间。',alt:'按Ctrl滚动鼠标滚轮，时间方向的格子与音符拉开或收拢。'},
];
let win,lesson,frames=[],all=[],count=0,label='',keys='',camera={cx:600,cy:310,w:1200},cursor={x:70,y:70,down:false},last='',mode='normal';
const js=code=>{last=code.slice(0,180);return win.webContents.executeJavaScript('(async()=>('+code+'))()');};
async function wait(check){for(let i=0;i<400;i++){if(await check())return;await delay(25);}throw Error('Timed out: '+last);}
async function rect(selector){return js(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()`);}
function aim(r,width=650){const h=width*920/1840;camera={w:width,cx:Math.max(width/2,Math.min(1200-width/2,r.x+r.w/2)),cy:Math.max(h/2,Math.min(620-h/2,r.y+r.h/2))};}
async function focus(selector,width=650){aim(await rect(selector),width);}
async function snap(ms=80,transition=200){
 await js('document.body.offsetHeight');await delay(25);
 // Flush the hidden compositor before taking the frame used by the animation.
 await win.webContents.capturePage();const image=await win.webContents.capturePage();
 const png=image.toPNG();
 assert.deepEqual({width:png.readUInt32BE(16),height:png.readUInt32BE(20)},{width:2400,height:1240});
 const file=String(++count).padStart(5,'0')+'.png';fs.writeFileSync(path.join(root,file),png);
 const metrics=await js(`(()=>{const s=document.querySelector('.melody-scroll'),v=__tutorial.editor.readViewport(),b=__tutorial.model.score.read().body,c=document.querySelector('.melody-canvas').getBoundingClientRect(),d=document.querySelector('.melody-tempo-dock').getBoundingClientRect();return {bpm:b.tempoBpm,steps:b.stepsPerBeat||4,beatsPerBar:b.beatsPerBar||4,scale:(s.clientHeight-48)*v.zoom/8,canvasY:c.y,leftSeconds:v.leftSeconds,dock:{x:d.x,y:d.y,w:d.width,h:d.height}}})()`);
 frames.push({file,duration:ms,label,keys,mode,metrics,camera:{...camera},cursor:{...cursor},transition});
}
async function fresh(index){
 lesson=lessons[index];frames=[];label='';keys='';mode='normal';camera={cx:600,cy:310,w:1200};cursor={x:70,y:70,down:false};
 await win.loadURL(config.url);const zoomChanged=win.webContents.getZoomFactor()!==2;win.webContents.setZoomFactor(2);if(zoomChanged)await win.loadURL(config.url);await wait(()=>js('!!globalThis.__tutorial?.editor').catch(()=>false));
 await js("document.querySelector('.web-footer').style.visibility='hidden'");await delay(100);
}
async function click(selector,hold=450){
 const r=await rect(selector);cursor={x:r.x+r.w/2,y:r.y+r.h/2,down:false};await snap(160);
 await js(`document.querySelector(${JSON.stringify(selector)}).click()`);cursor.down=true;await snap(100,0);cursor.down=false;await snap(hold,0);
}
async function pointer(type,x,y,selector='document',button=0){
 await js(`(()=>{const t=${selector==='document'?'document':`document.querySelector(${JSON.stringify(selector)})`};t.dispatchEvent(new PointerEvent(${JSON.stringify(type)},{bubbles:true,cancelable:true,button:${button},buttons:${type==='pointerup'?0:button===2?2:1},pointerId:77,isPrimary:true,pointerType:'mouse',clientX:${x},clientY:${y}}))})()`);
}
async function seed(){
 await js("(()=>{const m=__tutorial.model,p=m.score.read().body.parts[0].id;m.score.addNotes(p,[{startBeat:.15,durationBeats:.5,frequencyHz:130.812783,velocity:.8},{startBeat:.65,durationBeats:.5,frequencyHz:164.813778,velocity:.8},{startBeat:1.15,durationBeats:.5,frequencyHz:195.997718,velocity:.8},{startBeat:1.65,durationBeats:.5,frequencyHz:220,velocity:.8}]);__tutorial.editor.refresh()})()");
 await delay(50);assert.equal(await js('__tutorial.model.score.read().body.parts[0].notes.length'),4);
}
async function wheel(delta,flags={},steps=18){
 const r=await rect('.melody-scroll');cursor={x:r.x+r.w*.65,y:r.y+r.h*.6,down:false};
 for(let i=0;i<steps;i++){await js(`document.querySelector('.melody-scroll').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:${delta/steps},clientX:${cursor.x},clientY:${cursor.y},...${JSON.stringify(flags)}}))`);await snap(34,0);}
 await snap(350,0);
}
async function end(){assert.deepEqual(await js('__guide.errors'),[]);assert(!win.isVisible());const duration=frames.reduce((n,f)=>n+f.duration,0);all.push({...lesson,version:4,frames,duration});console.log(JSON.stringify({id:lesson.id,frames:frames.length,seconds:duration/1000}));}
app.whenReady().then(async()=>{try{
 session.defaultSession.webRequest.onBeforeRequest({urls:['https://*/*']},(_d,cb)=>cb({cancel:true}));
 win=new BrowserWindow({show:false,useContentSize:true,width:2400,height:1240,webPreferences:{offscreen:true,sandbox:true,contextIsolation:true,backgroundThrottling:false}});win.setMenu(null);win.setContentSize(2400,1240);
 win.webContents.on('will-prevent-unload',e=>e.preventDefault());
 // Five self-contained gestures. No audio/video capture or unrelated topics.
 await fresh(0);label='点击＋';await focus('.melody-add-tone',600);const add=await rect('.melody-add-tone');cursor={x:add.x+add.w/2,y:add.y+add.h/2,down:false};await snap(800,0);
 cursor.down=true;await snap(130,0);await js("document.querySelector('.melody-add-tone').click()");cursor.down=false;
 label='选一个声音';await focus('.melody-library-card[data-timbre-id*=".flute."]',740);await snap(650,350);
 const voice=await rect('.melody-library-card[data-timbre-id*=".flute."] .melody-library-tone');cursor={x:voice.x+voice.w/2,y:voice.y+voice.h/2,down:false};await snap(250);cursor.down=true;await snap(130,0);
 await js("document.querySelector('.melody-library-card[data-timbre-id*=\".flute.\"] .melody-library-tone').click()");
 await wait(()=>js("document.querySelectorAll('.melody-tone').length===2"));cursor.down=false;
 label='已添加';await focus('.melody-tone-entry:nth-child(2)',650);await snap(800,350);
 camera={cx:600,cy:300,w:1100};label='在卷帘中点一下';
 const point=await js("(()=>{const k=document.querySelector('[data-pitch-label=\"C4\"]').getBoundingClientRect(),c=document.querySelector('.melody-canvas').getBoundingClientRect(),s=document.querySelector('.melody-scroll'),v=__tutorial.editor.readViewport();return {x:k.x+k.width/2,y:c.y+.15*(s.clientHeight-48)*v.zoom/8}})()");
 assert(point.x>150&&point.x<1150&&point.y>110&&point.y<560,'created note must be visible in the teaching viewport');cursor={...point,down:false};await snap(550,350);await pointer('pointerdown',point.x,point.y,'.melody-canvas');await pointer('pointerup',point.x,point.y);await snap(650,0);
 assert.equal(await js('__tutorial.model.score.read().body.parts.reduce((n,p)=>n+p.notes.length,0)'),1);
 const lengthBefore=await js('__tutorial.model.score.read().body.parts.flatMap(p=>p.notes)[0].durationBeats');
 const note=await rect('.melody-note');label='拖住下边缘，向下拉长';cursor={x:note.x+note.w/2,y:note.y+note.h-2,down:false};await snap(550);await pointer('pointerdown',cursor.x,cursor.y,'.melody-note-resize');cursor.down=true;const startY=cursor.y;
 for(let i=1;i<=24;i++){cursor.y=startY+115*i/24;await pointer('pointermove',cursor.x,cursor.y);await snap(34,0);}await pointer('pointerup',cursor.x,cursor.y);cursor.down=false;await snap(1200,0);
 assert((await js('__tutorial.model.score.read().body.parts.flatMap(p=>p.notes)[0].durationBeats'))>lengthBefore*2);await end();

 await fresh(1);await seed();mode='bpm';label='120 BPM：每分钟120拍';await click('.melody-tempo-button',850);
 const changeTempo=async(target,steps)=>{const before=await js('__tutorial.model.score.read().body.tempoBpm');const r=await rect('.melody-tempo-input');cursor={x:r.x+r.w*.55,y:r.y+r.h*.5,down:true};for(let i=1;i<=steps;i++){const bpm=Math.round(before+(target-before)*i/steps);await js(`(()=>{const n=document.querySelector('.melody-tempo-input');n.value='${bpm}';n.dispatchEvent(new Event('change',{bubbles:true}))})()`);await snap(34,0);}cursor.down=false;await snap(1400,0);assert.equal(await js('__tutorial.model.score.read().body.tempoBpm'),target);};
 label='BPM变大，拍线靠近';await changeTempo(180,20);label='BPM变小，拍线拉开';await changeTempo(60,26);
 mode='normal';keys='空格';label='敲击定速：跟着节奏按空格';await js("document.querySelector('.melody-tap-tempo').click()");await focus('.tap-tempo-dialog',1100);await snap(850,300);
 await js("(()=>{__guide.realNow=performance.now.bind(performance);__guide.tapNow=0;Object.defineProperty(performance,'now',{configurable:true,value:()=>__guide.tapNow})})()");
 for(let i=0;i<5;i++){await js('__guide.tapNow='+i*500);await js("document.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:' ',code:'Space'}))");keys='空格 ↓';await snap(150,0);keys='空格';await snap(350,0);}
 assert.equal(await js("document.querySelector('.tap-tempo-value').textContent"),'120');
 await js("Object.defineProperty(performance,'now',{configurable:true,value:__guide.realNow})");label='应用这个速度';await click('.tap-tempo-apply',150);mode='bpm';keys='';label='回到120 BPM，每拍0.5秒';await snap(1300,300);await end();

 await fresh(2);await seed();mode='cells';label='同样一拍，分法不同';
 for(const n of [2,3,4,3]){const r=await rect('.melody-grid-select');cursor={x:r.x+r.w*.5,y:r.y+r.h*.5,down:true};await js(`(()=>{const n=document.querySelector('.melody-grid-select');n.value='${n}';n.dispatchEvent(new Event('change',{bubbles:true}))})()`);await snap(160,0);cursor.down=false;await snap(1300,0);assert.equal(await js('__tutorial.model.score.read().body.stepsPerBeat'),n);}
 await end();

 for(const [index,horizontal] of [[3,true],[4,false]]){
   await fresh(index);await seed();camera={cx:690,cy:230,w:1000};keys=horizontal?'Ctrl + Shift + 滚轮':'Ctrl + 滚轮';label=horizontal?'展开音高':'展开时间';await snap(800,0);
   const before=await js('__tutorial.editor.readViewport()');await wheel(-280,{ctrlKey:true,shiftKey:horizontal},28);await snap(600,0);
   const after=await js('__tutorial.editor.readViewport()');assert.notDeepEqual(after,before,'zoom example must change the actual viewport');
   label='收拢';await wheel(220,{ctrlKey:true,shiftKey:horizontal},28);await snap(800,0);await end();
 }
 const result={width:1200,height:620,pixelRatio:2,lessons:all};fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(result));fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({passed:true,version:4,chapters:all.length,frames:count,seconds:all.reduce((n,l)=>n+l.duration,0)/1000,visibleWindow:false,physicalAudio:false,userProjectsRead:false}));win.destroy();app.exit(0);
}catch(error){fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({error:String(error),stack:error.stack,last,chapter:lesson?.id}));app.exit(1);}});
