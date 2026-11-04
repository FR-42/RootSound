// Offscreen actual editor. Camera/cursor are composed afterwards at 30 fps.
const {app,BrowserWindow,session}=require('electron');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const config=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),root=config.root;
app.setPath('userData',path.join(root,'profile'));app.commandLine.appendSwitch('disable-gpu');app.commandLine.appendSwitch('force-device-scale-factor','1');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const lessons=[
 {id:'add-voice',title:'添加音色',description:'从＋选一个声音。',alt:'点击音色栏加号，选择长笛，左侧出现新的音符组。'},
 {id:'bpm',title:'BPM',description:'数字越大，节奏越快；也可以跟着节奏敲。',alt:'将BPM从120调到160，再调到90；跟着节奏敲击可以定速。'},
 {id:'cells',title:'格数',description:'每拍分几份，由你决定。',alt:'将每拍4格改为8格、3格，观察横线的疏密变化。'},
 {id:'zoom-horizontal',title:'横向缩放',description:'Ctrl＋Shift＋滚轮，展开音高。',alt:'按Ctrl和Shift滚动鼠标滚轮，琴键与音符的横向宽度改变。'},
 {id:'zoom-vertical',title:'竖向缩放',description:'Ctrl＋滚轮，展开时间。',alt:'按Ctrl滚动鼠标滚轮，时间方向的格子与音符拉开或收拢。'},
];
let win,lesson,frames=[],all=[],count=0,label='',keys='',camera={cx:600,cy:310,w:1200},cursor={x:70,y:70,down:false},last='';
const js=code=>{last=code.slice(0,180);return win.webContents.executeJavaScript('(async()=>('+code+'))()');};
async function wait(check){for(let i=0;i<400;i++){if(await check())return;await delay(25);}throw Error('Timed out: '+last);}
async function rect(selector){return js(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()`);}
function aim(r,width=650){const h=width*416/1072;camera={w:width,cx:Math.max(width/2,Math.min(1200-width/2,r.x+r.w/2)),cy:Math.max(h/2,Math.min(620-h/2,r.y+r.h/2))};}
async function focus(selector,width=650){aim(await rect(selector),width);}
async function snap(ms=80,transition=200){
 await js('document.body.offsetHeight');await delay(25);
 // Flush the hidden compositor before taking the frame used by the movie.
 await win.webContents.capturePage();const image=await win.webContents.capturePage();
 const png=image.toPNG();
 assert.deepEqual({width:png.readUInt32BE(16),height:png.readUInt32BE(20)},{width:1200,height:620});
 const file=String(++count).padStart(5,'0')+'.png';fs.writeFileSync(path.join(root,file),png);
 frames.push({file,duration:ms,label,keys,camera:{...camera},cursor:{...cursor},transition});
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
 await js("(()=>{const m=__tutorial.model,p=m.score.read().body.parts[0].id;m.score.addNotes(p,[{startBeat:.15,durationBeats:.5,frequencyHz:130.812783,velocity:.8},{startBeat:.65,durationBeats:.5,frequencyHz:164.813778,velocity:.8},{startBeat:1.15,durationBeats:.5,frequencyHz:195.997718,velocity:.8},{startBeat:1.65,durationBeats:.5,frequencyHz:220,velocity:.8}]);__tutorial.editor.refresh()})()");
 await delay(50);assert.equal(await js('__tutorial.model.score.read().body.parts[0].notes.length'),4);
}
async function wheel(delta,flags={},steps=18){
 const r=await rect('.melody-scroll');cursor={x:r.x+r.w*.65,y:r.y+r.h*.6,down:false};
 for(let i=0;i<steps;i++){await js(`document.querySelector('.melody-scroll').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:${delta/steps},clientX:${cursor.x},clientY:${cursor.y},...${JSON.stringify(flags)}}))`);await snap(34,0);}
 await snap(350,0);
}
async function end(){assert.deepEqual(await js('__guide.errors'),[]);assert(!win.isVisible());const duration=frames.reduce((n,f)=>n+f.duration,0);all.push({...lesson,version:3,frames,duration});console.log(JSON.stringify({id:lesson.id,frames:frames.length,seconds:duration/1000}));}
app.whenReady().then(async()=>{try{
 session.defaultSession.webRequest.onBeforeRequest({urls:['https://*/*']},(_d,cb)=>cb({cancel:true}));
 win=new BrowserWindow({show:false,useContentSize:true,width:1200,height:620,webPreferences:{offscreen:true,sandbox:true,contextIsolation:true,backgroundThrottling:false}});win.setMenu(null);win.setContentSize(1200,620);
 win.webContents.on('will-prevent-unload',e=>e.preventDefault());
 // Five self-contained gestures. No audio/video capture or unrelated topics.
 await fresh(0);label='点击＋';await focus('.melody-add-tone',600);const add=await rect('.melody-add-tone');cursor={x:add.x+add.w/2,y:add.y+add.h/2,down:false};await snap(800,0);
 cursor.down=true;await snap(130,0);await js("document.querySelector('.melody-add-tone').click()");cursor.down=false;
 label='选一个声音';await focus('.melody-library-card[data-timbre-id*=".flute."]',740);await snap(650,350);
 const voice=await rect('.melody-library-card[data-timbre-id*=".flute."] .melody-library-tone');cursor={x:voice.x+voice.w/2,y:voice.y+voice.h/2,down:false};await snap(250);cursor.down=true;await snap(130,0);
 await js("document.querySelector('.melody-library-card[data-timbre-id*=\".flute.\"] .melody-library-tone').click()");
 await wait(()=>js("document.querySelectorAll('.melody-tone').length===2"));cursor.down=false;
 label='已添加';await focus('.melody-tone-entry:nth-child(2)',650);await snap(1500,350);await end();

 await fresh(1);await seed();camera={cx:440,cy:208,w:880};label='120';await snap(800,0);await click('.melody-tempo-button',180);
 await focus('.melody-tempo-panel',760);
 const setTempo=async(bpm)=>{const r=await rect('.melody-tempo-input');cursor={x:r.x+r.w*.55,y:r.y+r.h*.5,down:true};await js(`(()=>{const n=document.querySelector('.melody-tempo-input');n.value='${bpm}';n.dispatchEvent(new Event('change',{bubbles:true}))})()`);await snap(160,0);cursor.down=false;await snap(600,0);};
 label='快一点';await setTempo(160);label='慢一点';await setTempo(90);await click('.melody-tempo-button',150);
 label='也可以跟着节奏敲';await click('.melody-tempo-button',100);await click('.melody-tap-tempo',150);await focus('.tap-tempo-dialog',1100);await snap(350,300);
 await js("(()=>{__guide.realNow=performance.now.bind(performance);__guide.tapNow=0;Object.defineProperty(performance,'now',{configurable:true,value:()=>__guide.tapNow})})()");
 const pad=await rect('.tap-tempo-pad');cursor={x:pad.x+pad.w/2,y:pad.y+pad.h/2,down:false};
 for(let i=0;i<5;i++){await js('__guide.tapNow='+i*500);await js("document.querySelector('.tap-tempo-pad').click()");cursor.down=true;await snap(150,0);cursor.down=false;await snap(350,0);}
 assert.equal(await js("document.querySelector('.tap-tempo-value').textContent"),'120');
 await js("Object.defineProperty(performance,'now',{configurable:true,value:__guide.realNow})");label='应用';await click('.tap-tempo-apply',650);await end();

 await fresh(2);await seed();await js("document.querySelector('.melody-scroll').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:-470,ctrlKey:true,clientX:500,clientY:130}))");await delay(60);
 camera={cx:440,cy:220,w:880};label='每拍4份';await snap(800,0);
 for(const n of [8,3,4]){const r=await rect('.melody-grid-select');cursor={x:r.x+r.w*.5,y:r.y+r.h*.5,down:true};label=`每拍${n}份`;await js(`(()=>{const n=document.querySelector('.melody-grid-select');n.value='${n}';n.dispatchEvent(new Event('change',{bubbles:true}))})()`);await snap(170,0);cursor.down=false;await snap(1100,0);}
 assert.equal(await js("document.querySelector('.melody-grid-select').value"),'4');await end();

 for(const [index,horizontal] of [[3,true],[4,false]]){
   await fresh(index);await seed();camera={cx:690,cy:230,w:1000};keys=horizontal?'Ctrl + Shift + 滚轮':'Ctrl + 滚轮';label=horizontal?'展开音高':'展开时间';await snap(800,0);
   const before=await js('__tutorial.editor.readViewport()');await wheel(-280,{ctrlKey:true,shiftKey:horizontal},28);await snap(600,0);
   const after=await js('__tutorial.editor.readViewport()');assert.notDeepEqual(after,before,'zoom example must change the actual viewport');
   label='收拢';await wheel(220,{ctrlKey:true,shiftKey:horizontal},28);await snap(800,0);await end();
 }
 const result={width:1200,height:620,pixelRatio:1,lessons:all};fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(result));fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({passed:true,version:3,chapters:all.length,frames:count,seconds:all.reduce((n,l)=>n+l.duration,0)/1000,visibleWindow:false,physicalAudio:false,userProjectsRead:false}));win.destroy();app.exit(0);
}catch(error){fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({error:String(error),stack:error.stack,last,chapter:lesson?.id}));app.exit(1);}});
