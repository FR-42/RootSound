// Offscreen actual editor. Camera/cursor are composed afterwards at 30 fps.
const {app,BrowserWindow,session}=require('electron');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const config=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),root=config.root;
app.setPath('userData',path.join(root,'profile'));app.commandLine.appendSwitch('disable-gpu');app.commandLine.appendSwitch('force-device-scale-factor','1');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const lessons=[
 {id:'01-voices',title:'选声音',summary:'点＋加音色，分组写音符。',steps:['左边一个框是一组音符。','＋添加音色；小▶试听。','选中一组，再往画布写音符。']},
 {id:'02-notes',title:'写音符',summary:'拖着写，拉长小节。',steps:['左右是音高，上下是时间。','按住拖动画音符，拖音符可移动。','拖下边界加小节；＋新增一段卷帘。']},
 {id:'03-tempo',title:'调节奏',summary:'BPM管快慢，格数管细分。',steps:['120＝每分钟120拍。','4格＝每拍分4份，不是拍号。','敲击定速：跟节奏点几下，再应用。']},
 {id:'04-play',title:'播放',summary:'▶播放，Ⅱ暂停，■回到开头。',steps:['点击琴键可以试听。','▶播放，Ⅱ暂停，再点继续。','■停止并回到开头。']},
 {id:'05-navigation',title:'移动与缩放',summary:'拖动看位置，滚轮调视角。',steps:['右键空白取消选中，再拖动空白。','滚轮上下；Shift＋滚轮左右。','Ctrl＋滚轮缩放时间。','Ctrl＋Shift＋滚轮缩放音高。','Mac滚轮缩放也可用⌘。']},
 {id:'06-files',title:'保存',summary:'工程留着改，音频拿去听。',steps:['新建：空白音乐；打开：继续已有工程或MIDI。','下载工程：保留可编辑音符。','导出音频：得到可播放的WAV。','草稿不自动保存，离开前下载工程。']},
];
let win,lesson,frames=[],all=[],count=0,label='',keys='',camera={cx:600,cy:310,w:1200},cursor={x:70,y:70,down:false},last='';
const js=code=>{last=code.slice(0,180);return win.webContents.executeJavaScript('(async()=>('+code+'))()');};
async function wait(check){for(let i=0;i<400;i++){if(await check())return;await delay(25);}throw Error('Timed out: '+last);}
async function rect(selector){return js(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()`);}
function aim(r,width=650){const h=width*620/1200;camera={w:width,cx:Math.max(width/2,Math.min(1200-width/2,r.x+r.w/2)),cy:Math.max(h/2,Math.min(620-h/2,r.y+r.h/2))};}
async function focus(selector,width=650){aim(await rect(selector),width);}
async function snap(ms=80,transition=200){
 await js('document.body.offsetHeight');await delay(25);
 // Flush the hidden compositor before taking the frame used by the movie.
 await win.webContents.capturePage();const image=await win.webContents.capturePage();
 const png=image.toPNG();
 assert.deepEqual({width:png.readUInt32BE(16),height:png.readUInt32BE(20)},{width:1200,height:620});
 const file=String(++count).padStart(5,'0')+'.png';fs.writeFileSync(path.join(root,file),png);
 frames.push({file,duration:ms>=100?Math.round(ms*1.5):ms,label,keys,camera:{...camera},cursor:{...cursor},transition});
}
async function fresh(index){
 lesson=lessons[index];frames=[];label='';keys='';camera={cx:600,cy:310,w:1200};cursor={x:70,y:70,down:false};
 await win.loadURL(config.url);await wait(()=>js('!!globalThis.__tutorial?.editor').catch(()=>false));
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
 await js("(()=>{const m=__tutorial.model,p=m.score.read().body.parts[0].id;m.score.addNotes(p,[{startBeat:.1,durationBeats:.5,frequencyHz:261.625565,velocity:.8},{startBeat:.9,durationBeats:.5,frequencyHz:329.627557,velocity:.8},{startBeat:1.7,durationBeats:.5,frequencyHz:391.995436,velocity:.8},{startBeat:2.5,durationBeats:.5,frequencyHz:523.251131,velocity:.8}]);__tutorial.editor.refresh()})()");
 await delay(50);assert.equal(await js('__tutorial.model.score.read().body.parts[0].notes.length'),4);
}
async function draw(beat,pitch,beats=.65){
 const p=await js(`(()=>{const k=document.querySelector('[data-pitch-label="${pitch}"]').getBoundingClientRect(),c=document.querySelector('.melody-canvas').getBoundingClientRect(),s=document.querySelector('.melody-scroll'),v=__tutorial.editor.readViewport(),scale=(s.clientHeight-48)*v.zoom/8;return {x:k.x+k.width/2,y:c.y+(${beat}*.5-v.leftSeconds)*scale,scale}})()`);
 cursor={x:p.x,y:p.y,down:false};await snap(200);await pointer('pointerdown',p.x,p.y,'.melody-canvas');cursor.down=true;
 for(let i=1;i<=18;i++){cursor.y=p.y+beats*.5*p.scale*i/18;await pointer('pointermove',cursor.x,cursor.y);await snap(34,0);}
 await pointer('pointerup',cursor.x,cursor.y);cursor.down=false;await snap(500,0);
}
async function wheel(delta,flags={},steps=18){
 const r=await rect('.melody-scroll');cursor={x:r.x+r.w*.65,y:r.y+r.h*.6,down:false};
 for(let i=0;i<steps;i++){await js(`document.querySelector('.melody-scroll').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:${delta/steps},clientX:${cursor.x},clientY:${cursor.y},...${JSON.stringify(flags)}}))`);await snap(34,0);}
 await snap(350,0);
}
async function end(){assert.deepEqual(await js('__guide.errors'),[]);assert(!win.isVisible());const duration=frames.reduce((n,f)=>n+f.duration,0);all.push({...lesson,version:2,frames,duration});console.log(JSON.stringify({id:lesson.id,frames:frames.length,seconds:duration/1000}));}
const elapsed=()=>frames.reduce((n,f)=>n+f.duration,0)/1000;
app.whenReady().then(async()=>{try{
 session.defaultSession.webRequest.onBeforeRequest({urls:['https://*/*']},(_d,cb)=>cb({cancel:true}));
 win=new BrowserWindow({show:false,useContentSize:true,width:1200,height:620,webPreferences:{offscreen:true,sandbox:true,contextIsolation:true,backgroundThrottling:false}});win.setMenu(null);win.setContentSize(1200,620);
 win.webContents.on('will-prevent-unload',e=>e.preventDefault());
 // 1. A short, close-up add/select/write sequence.
 await fresh(0);await seed();label='＋ 选一种声音';await focus('.melody-add-tone',610);await snap(700,0);await click('.melody-add-tone',300);
 await focus('.melody-library-card[data-timbre-id*=".flute."]',750);label='长笛';await snap(450);await click('.melody-library-card[data-timbre-id*=".flute."] .melody-library-tone',350);
 await wait(()=>js("document.querySelectorAll('.melody-tone').length===2"));label='选中这一组，写长笛';camera={cx:600,cy:255,w:1100};await draw(1.3,'A4',.5);
 await focus('.melody-shelf',700);label='切回钢琴';await click('.melody-tone-entry:first-child .melody-tone',700);
 label='试听';await focus('.melody-tone-entry:first-child',540);await click('.melody-tone-entry:first-child .melody-tone-preview',800);await end();
 // 2. Direct gestures, then growing the actual lower boundary.
 await fresh(1);label='左右是音高，上下是时间';camera={cx:770,cy:280,w:850};await snap(950,0);
 label='按住，拖出一个音符';await draw(.35,'E4',1.1);
 const n=await rect('.melody-note');cursor={x:n.x+n.w/2,y:n.y+8,down:true};await pointer('pointerdown',cursor.x,cursor.y,'.melody-note');label='拖动，换个位置';
 const from={...cursor};for(let i=1;i<=18;i++){cursor.x=from.x+64*i/18;cursor.y=from.y+60*i/18;await pointer('pointermove',cursor.x,cursor.y);await snap(34,0);}await pointer('pointerup',cursor.x,cursor.y);cursor.down=false;await snap(450,0);
 await js("document.querySelector('.melody-scroll').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:100000,clientX:900,clientY:300}))");await delay(100);
 label='拉下边界，加小节';await focus('.melody-roll-end',1000);const edge=await rect('.melody-roll-end');cursor={x:edge.x+edge.w*.5,y:edge.y+5,down:false};await snap(650,0);await pointer('pointerdown',cursor.x,cursor.y,'.melody-roll-end');cursor.down=true;const top=cursor.y;
 const originalLength=await js('__tutorial.model.score.read().body.lengthBeats');
 for(let i=1;i<=18;i++){cursor.y=top+300*i/18;await pointer('pointermove',cursor.x,cursor.y);await snap(34,0);}await pointer('pointerup',cursor.x,cursor.y);cursor.down=false;await snap(550,0);
 assert((await js('__tutorial.model.score.read().body.lengthBeats'))>originalLength,'the demonstrated boundary drag must actually add bars');
 await js("document.querySelector('.melody-scroll').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:100000,clientX:900,clientY:300}))");await delay(80);label='＋ 另起一段';await focus('.melody-extend',1000);await click('.melody-extend',650);assert.equal(await js('__tutorial.model.score.read().body.tempoSections.length'),1);await end();
 // 3. Three short visual examples, no explanatory paragraphs.
 await fresh(2);await seed();label='120＝每分钟120拍';await focus('.melody-tempo-dock',550);await snap(1000,0);await click('.melody-tempo-button',200);
 label='160：快一点';await js("(()=>{const n=document.querySelector('.melody-tempo-input');n.value='160';n.dispatchEvent(new Event('change',{bubbles:true}))})()");await focus('.melody-tempo-panel',600);await snap(900);await click('.melody-tempo-button',150);
 label='4格＝每拍4份';await focus('.melody-grid-select',550);await snap(1000);await js("(()=>{const n=document.querySelector('.melody-grid-select');n.value='3';n.dispatchEvent(new Event('change',{bubbles:true}))})()");label='3格＝每拍3份';await snap(850);
 await click('.melody-tempo-button',100);await click('.melody-tap-tempo',100);label='跟着节奏敲';await focus('.tap-tempo-dialog',670);keys='空格';await snap(450);
 await js("(()=>{__guide.realNow=performance.now.bind(performance);__guide.tapNow=0;Object.defineProperty(performance,'now',{configurable:true,value:()=>__guide.tapNow})})()");
 const pad=await rect('.tap-tempo-pad');cursor={x:pad.x+pad.w/2,y:pad.y+pad.h/2,down:false};
 for(let i=0;i<5;i++){await js('__guide.tapNow='+i*500);await js("document.querySelector('.tap-tempo-pad').click()");cursor.down=true;await snap(100,0);cursor.down=false;await snap(233,0);}
 assert.equal(await js("document.querySelector('.tap-tempo-value').textContent"),'120');
 await js("Object.defineProperty(performance,'now',{configurable:true,value:__guide.realNow})");keys='';label='应用';await click('.tap-tempo-apply',500);await end();
 // 4. Pause in the middle of the melody so continuing has an audible result.
 await fresh(3);await seed();label='点琴键，先听一声';await focus('[data-pitch-label="C4"]',750);await click('[data-pitch-label="C4"]',450);
 label='播放';camera={cx:720,cy:270,w:1000};await click('.web-play',100);await wait(()=>js("document.querySelector('.web-play').getAttribute('aria-pressed')==='true'"));const windows=[];let at=elapsed();
 for(let i=0;i<18;i++){await js('__guide.now='+i/30);await snap(34,0);}windows.push({at,from:0,duration:.612});
 label='暂停';await focus('.web-play',800);await click('.web-play',700);label='继续';await click('.web-play',120);camera={cx:720,cy:270,w:1000};at=elapsed();
 for(let i=18;i<72;i++){await js('__guide.now='+i/30);await snap(34,i===18?200:0);}windows.push({at,from:.612,duration:1.836});
 label='回到开头';await focus('.web-stop',850);await click('.web-stop',600);
 await js("document.querySelector('.web-export').click()");await wait(()=>js("__guide.downloads.some(d=>d.name.endsWith('.wav'))"));const b64=await js("(async()=>{const a=new Uint8Array(await __guide.downloads.find(d=>d.name.endsWith('.wav')).blob.arrayBuffer());let s='';for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode(...a.subarray(i,i+32768));return btoa(s)})()");fs.writeFileSync(path.join(root,'playback.wav'),Buffer.from(b64,'base64'));await end();all.at(-1).audio='playback.wav';all.at(-1).audioWindows=windows;
 // 5. Each gesture visibly changes one thing; keyboard chips replace prose.
 await fresh(4);await seed();camera={cx:730,cy:300,w:940};label='右键空白，取消选中';const r=await rect('.melody-scroll');cursor={x:r.x+r.w*.8,y:r.y+r.h*.65,down:false};await snap(600,0);await pointer('pointerdown',cursor.x,cursor.y,'.melody-canvas',2);await pointer('pointerup',cursor.x,cursor.y,'document',2);await snap(250);
 label='拖动，移动视角';const start={...cursor};await pointer('pointerdown',cursor.x,cursor.y,'.melody-canvas');cursor.down=true;for(let i=1;i<=20;i++){cursor.x=start.x-120*i/20;cursor.y=start.y-85*i/20;await pointer('pointermove',cursor.x,cursor.y);await snap(34,0);}await pointer('pointerup',cursor.x,cursor.y);cursor.down=false;await snap(350);
 label='上下移动';keys='滚轮';await wheel(170);label='左右移动';keys='Shift + 滚轮';await wheel(160,{shiftKey:true});
 label='放大时间';keys='Ctrl + 滚轮';await wheel(-200,{ctrlKey:true});label='放大音高';keys='Ctrl + Shift + 滚轮';await wheel(-190,{ctrlKey:true,shiftKey:true});await snap(550);await end();
 // 6. Four actions and four outcomes, without replaying confirmation dialogs.
 await fresh(5);await seed();label='工程：留着改';await focus('.web-save',750);await click('.web-save',450);await wait(()=>js("__guide.downloads.some(d=>d.name.endsWith('.rootsound'))"));const saved=await js("__guide.downloads.find(d=>d.name.endsWith('.rootsound')).blob.text()");
 label='新建：一张空白画布';await click('.web-new',700);assert.equal(await js('__tutorial.model.score.read().body.parts[0].notes.length'),0);
 label='打开：接着改';await click('.web-open',200);await js(`(()=>{const f=document.querySelector('.web-file');Object.defineProperty(f,'files',{configurable:true,value:[new File([${JSON.stringify(saved)}],'我的音乐.rootsound',{type:'application/json'})]});f.dispatchEvent(new Event('change'))})()`);await wait(()=>js("document.querySelector('.web-status').textContent==='工程已打开。'"));camera={cx:720,cy:265,w:1050};await snap(850);assert.equal(await js('__tutorial.model.score.read().body.parts[0].notes.length'),4);
 label='音频：直接听';await focus('.web-export',750);await click('.web-export',450);await wait(()=>js("__guide.downloads.some(d=>d.name.endsWith('.wav'))"));label='离开前，下载工程';await focus('.web-save',750);await snap(1000);await end();
 const result={width:1200,height:620,pixelRatio:1,lessons:all};fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(result));fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({passed:true,version:2,chapters:all.length,frames:count,seconds:all.reduce((n,l)=>n+l.duration,0)/1000,visibleWindow:false,physicalAudio:false,userProjectsRead:false}));win.destroy();app.exit(0);
}catch(error){fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({error:String(error),stack:error.stack,last,chapter:lesson?.id}));app.exit(1);}});
