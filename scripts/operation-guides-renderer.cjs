const {app,BrowserWindow,session}=require('electron');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const config=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),root=config.root;
app.setPath('userData',path.join(root,'profile'));app.commandLine.appendSwitch('disable-gpu');app.commandLine.appendSwitch('force-device-scale-factor','1');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const lessons=[
 {id:'01-voices',title:'音色与音符组',summary:'左侧每个框管理一组音符；＋选择音色，建立新的音符组。'},
 {id:'02-notes',title:'写音符与扩展小节',summary:'横向是音高，纵向是时间。拖动末段下边界增加小节；＋新增一段卷帘。'},
 {id:'03-tempo',title:'速度、格数与敲击定速',summary:'120是每分钟120拍；4格是一拍分成四份。跟着节奏敲几下，就能估算速度。'},
 {id:'04-play',title:'试听、播放与暂停',summary:'琴键和音符组的▶用于试听；顶部▶播放，Ⅱ暂停，■停止并回到开头。'},
 {id:'05-navigation',title:'平移与缩放',summary:'右键空白取消选中，再拖动空白平移。滚轮上下，Shift＋滚轮左右；Ctrl缩放时间，Ctrl＋Shift缩放音高。'},
 {id:'06-files',title:'新建、打开与保存',summary:'下载工程保留可编辑内容；导出音频得到WAV。草稿不会自动保存，离开前先下载工程。'},
];
let win,lesson,frames=[],all=[],number=0,caption='',detail='',cursor={x:1100,y:600},focus=null,keys='',lastExpression='';
const js=code=>{lastExpression=code.slice(0,220);return win.webContents.executeJavaScript('(async()=>('+code+'))()');};
async function wait(check){for(let i=0;i<500;i++){if(await check())return;await delay(25);}throw Error('Timed out: '+lastExpression);}
const overlayCSS=`html,body{width:1280px!important;height:820px!important;background:#f4f5f7!important}#app{position:absolute!important;left:40px!important;top:76px!important;width:1200px!important;height:620px!important;border:1px solid #cbd2dc;border-radius:8px;overflow:hidden;box-shadow:0 8px 28px #25364a0a}#guide-title{position:fixed;left:40px;top:24px;font:600 23px 'Segoe UI','Microsoft YaHei',sans-serif;color:#252a30;z-index:1000}#guide-brand{position:fixed;right:40px;top:31px;font:14px 'Microsoft YaHei',sans-serif;color:#747d89;z-index:1000}#guide-caption{position:fixed;left:40px;right:40px;top:720px;z-index:1000;font:600 25px/1.45 'Microsoft YaHei',sans-serif;color:#252a30}#guide-detail{position:fixed;left:40px;right:40px;top:764px;z-index:1000;font:18px/1.5 'Microsoft YaHei',sans-serif;color:#586576}#guide-keys{position:fixed;right:60px;top:646px;background:#263b4deb;color:#fff;padding:8px 15px;border-radius:6px;font:16px 'Segoe UI','Microsoft YaHei',sans-serif;z-index:1100;box-shadow:0 3px 12px #263b4d22}#guide-focus{position:fixed;outline:3px solid #537bd0;outline-offset:3px;border-radius:5px;background:#537bd00a;z-index:900;pointer-events:none}#guide-cursor{position:fixed;width:29px;height:35px;z-index:1200;pointer-events:none;filter:drop-shadow(0 2px 2px #0004)}#guide-ring{position:fixed;width:34px;height:34px;border:4px solid #edb34d;border-radius:50%;z-index:1150;pointer-events:none;transform:translate(-50%,-50%)}[id^=guide-][hidden]{display:none!important}`;
async function fresh(index){
 lesson=lessons[index];frames=[];caption='';detail='';keys='';focus=null;cursor={x:1130,y:600};
 await win.loadURL(config.url);await wait(()=>js("!!document.querySelector('.melody-canvas')").catch(()=>false));
 await js(`(()=>{const style=document.createElement('style');style.textContent=${JSON.stringify(overlayCSS)}+'#guide-overlay{position:fixed;inset:0;width:1280px;height:820px;max-width:none;max-height:none;margin:0;padding:0;border:0;pointer-events:none;background:transparent;overflow:hidden}';document.head.append(style);const overlay=document.createElement('div');overlay.id='guide-overlay';overlay.setAttribute('popover','manual');document.body.append(overlay);for(const id of ['title','brand','caption','detail','keys','focus','ring','cursor']){const d=document.createElement('div');d.id='guide-'+id;overlay.append(d)}document.querySelector('#guide-cursor').innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="29" height="35" viewBox="0 0 29 35"><path d="M3 2v27l7-7 5 11 5-2-5-11h10Z" fill="white" stroke="#263b4d" stroke-width="1.7" stroke-linejoin="round"/></svg>';document.querySelector('#guide-title').textContent=${JSON.stringify(String(index+1).padStart(2,'0')+' / '+lesson.title)};document.querySelector('#guide-brand').textContent='简乐 · 操作演示'})()`);
 await delay(100);
}
async function rect(selector){return js(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)throw Error('Missing ${selector.replaceAll("'",'')}');const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()`);}
async function shot(ms=100,ring=false){
 await js(`(()=>{document.querySelector('#guide-caption').textContent=${JSON.stringify(caption)};document.querySelector('#guide-detail').textContent=${JSON.stringify(detail)};const k=document.querySelector('#guide-keys');k.hidden=${!keys};k.textContent=${JSON.stringify(keys)};const c=document.querySelector('#guide-cursor');c.style.left=${JSON.stringify(cursor.x+'px')};c.style.top=${JSON.stringify(cursor.y+'px')};const r=document.querySelector('#guide-ring');r.hidden=${!ring};r.style.left=${JSON.stringify(cursor.x+'px')};r.style.top=${JSON.stringify(cursor.y+'px')};const f=document.querySelector('#guide-focus');f.hidden=${!focus};${focus?`f.style.left='${focus.x}px';f.style.top='${focus.y}px';f.style.width='${focus.width}px';f.style.height='${focus.height}px';`:''}})()`);
 await js("(()=>{const o=document.querySelector('#guide-overlay');if(o.matches(':popover-open'))o.hidePopover();o.showPopover();return document.body.offsetHeight})()");
 await delay(60);const image=await win.webContents.capturePage();assert.deepEqual(image.getSize(),{width:1280,height:820});const filename=String(++number).padStart(5,'0')+'.png';
 fs.writeFileSync(path.join(root,filename),image.toPNG());frames.push({file:filename,duration:ms,caption,detail});
}
async function say(text,sub='',selector,ms=2000){caption=text;detail=sub;focus=selector?await rect(selector):null;await shot(ms);}
async function moveTo(x,y,steps=7){const from={...cursor};for(let i=1;i<=steps;i++){cursor={x:from.x+(x-from.x)*i/steps,y:from.y+(y-from.y)*i/steps};await shot(60);}}
async function click(selector,hold=500){const r=await rect(selector);await moveTo(r.x+r.width/2,r.y+r.height/2);await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await shot(140,true);await shot(hold);}
async function pointer(type,x,y,button=0,selector='document'){
 await js(`(()=>{const t=${selector==='document'?'document':`document.querySelector(${JSON.stringify(selector)})`};t.dispatchEvent(new PointerEvent(${JSON.stringify(type)},{bubbles:true,cancelable:true,button:${button},buttons:${type==='pointerup'?0:button===2?2:1},pointerId:71,isPrimary:true,pointerType:'mouse',clientX:${x},clientY:${y}}))})()`);
}
async function draw(beat,pitch,duration=.5,animated=false){
 const p=await js(`(()=>{const key=document.querySelector('[data-pitch-label="${pitch}"]'),k=key.getBoundingClientRect(),c=document.querySelector('.melody-canvas').getBoundingClientRect();return {x:k.x+k.width/2,y:c.y+${beat}*128+3}})()`);
 if(animated)await moveTo(p.x,p.y);cursor={x:p.x,y:p.y};
 await pointer('pointerdown',p.x,p.y,0,'.melody-canvas');if(animated)await shot(120,true);
 for(let i=1;i<=(animated?8:1);i++){const y=p.y+duration*128*i/(animated?8:1);cursor.y=y;await pointer('pointermove',p.x,y);if(animated)await shot(90);}
 await pointer('pointerup',p.x,p.y+duration*128);await delay(90);
 if(animated)await shot(1200);
}
async function seed(){await draw(.15,'C4',.5);await draw(1.15,'E4',.5);await draw(2.15,'G4',.5);await draw(3.15,'C5',.5);await wait(()=>js("!document.querySelector('.web-status').textContent.includes('正在')"));}
async function wheel(delta,options={},steps=5){
 const r=await rect('.melody-scroll');cursor={x:r.x+r.width*.72,y:r.y+r.height*.65};
 for(let i=0;i<steps;i++){await js(`document.querySelector('.melody-scroll').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:${delta/steps},clientX:${cursor.x},clientY:${cursor.y},...${JSON.stringify(options)}}))`);await shot(100);}
}
async function finish(){assert(!win.isVisible());const errors=await js('__guide.errors');assert.deepEqual(errors,[]);const duration=frames.reduce((n,f)=>n+f.duration,0);all.push({...lesson,frames,duration});console.log(JSON.stringify({chapter:lesson.id,frames:frames.length,seconds:duration/1000}));}
function elapsed(){return frames.reduce((n,f)=>n+f.duration,0)/1000;}

app.whenReady().then(async()=>{try{
 session.defaultSession.webRequest.onBeforeRequest({urls:['https://*/*']},(_d,cb)=>cb({cancel:true}));
 win=new BrowserWindow({show:false,width:1280,height:820,webPreferences:{sandbox:true,contextIsolation:true,backgroundThrottling:false}});
 win.setMenu(null);win.setContentSize(1280,820);
 win.webContents.on('will-prevent-unload',event=>event.preventDefault());
 // 1. Sound families and adding another voice.
 await fresh(0);await draw(.2,'C4');await draw(1.2,'E4');
 await say('左侧每个框，管理一组使用同一音色的音符','框上的“钢琴”是这组音符使用的音色。','.melody-tone-entry',2700);
 await say('点击下面的＋，选择另一种声音','每选一次，就创建一个新的音符组。','.melody-add-tone',2200);await click('.melody-add-tone');
 await say('在音色库里选择“长笛”','旁边的小 ▶ 可以先试听，再决定用哪一种。','.melody-library-grid',2100);
 await click('.melody-library-card[data-timbre-id*=".flute."] .melody-library-tone');
 await wait(()=>js("document.querySelectorAll('.melody-tone').length===2"));await draw(.7,'G4');await draw(1.7,'A4');
 await say('选中哪个音符组，就用它的音色写音符','不同音色有不同颜色；其他组的音符会变暗。','.melody-shelf',2600);
 await click('.melody-tone-entry:first-child .melody-tone');
 await say('点小 ▶，可以试听这组的音色','选中一组后播放，只听这一组；右键空白可取消选中。','.melody-tone-entry:first-child .melody-tone-preview',2500);await click('.melody-tone-entry:first-child .melody-tone-preview');await finish();
 // 2. Draw, length, axes, grow a roll and add a new one.
 await fresh(1);await say('横向是音高，纵向是时间','越往右，声音越高；越往下，越晚播放。','.melody-scroll',2700);
 await say('选好音符组，点一下空白处就能写音符','按住并向下拖动，可以直接画出更长的音符。',undefined,2200);await draw(.2,'C4',1,true);
 await say('拖动音符，改变音高和开始时间','右键音符可以删除；滚轮停在选中音符上可微调时长。','.melody-note',2200);
 await wheel(100000,{},1);await say('先滚动到当前卷帘的最下方','下边界上有一条细线，可以抓住它。','.melody-roll-end',2200);
 let edge=await rect('.melody-roll-end');cursor={x:edge.x+edge.width*.6,y:edge.y+5};await moveTo(cursor.x,cursor.y);await pointer('pointerdown',cursor.x,cursor.y,0,'.melody-roll-end');
 caption='向下拖边界，为当前这一段增加小节';detail='拖动时会显示小节数；向上拖则缩短这一段。';focus=null;const start={...cursor};
 for(let i=1;i<=12;i++){cursor.y=start.y+160*i/12;await pointer('pointermove',cursor.x,cursor.y);await shot(90);}await pointer('pointerup',cursor.x,cursor.y);await shot(1800);
 await wheel(100000,{},1);await say('底部＋是新增一段钢琴卷帘','新段可以设置不同速度；它不是“增加一小节”。','.melody-extend',2400);await click('.melody-extend');
 assert.equal(await js("document.querySelectorAll('.melody-bpm-roll').length"),2);
 await say('多个卷帘顺着时间接在一起','要给上方一段加长，可向下拖下一段左侧的 BPM 标签。','.melody-ruler',2500);await finish();
 // 3. BPM, subdivisions and tap tempo.
 await fresh(2);await seed();await say('120 = 每分钟 120 拍','数字越大，整段音乐播放得越快。','.melody-tempo-button',2500);await click('.melody-tempo-button');
 await say('点击数字，可以直接修改 BPM','这里改成 160，音符随音乐速度一起加快。','.melody-tempo-input',2200);
 await js("(()=>{const n=document.querySelector('.melody-tempo-input');n.value='160';n.dispatchEvent(new Event('change',{bubbles:true}))})()");await shot(1800,true);await click('.melody-tempo-button');
 await say('4 格 = 每一拍分成 4 份','它不是“一小节四拍”。格线用来辅助安排音符。','.melody-grid-select',2900);
 await js("(()=>{const s=document.querySelector('.melody-grid-select');s.value='3';s.dispatchEvent(new Event('change',{bubbles:true}))})()");await say('也可以把一拍分成 3 份','改变格数不会搬动已经写下的音符。','.melody-grid-select',2200);
 await click('.melody-tempo-button');await say('不熟悉 BPM 数字？试试敲击定速','点击数字右边的小按钮，跟着心里的节奏敲几下。','.melody-tap-tempo',2200);await click('.melody-tap-tempo');
 caption='跟着节奏按空格，或者点“敲一下”';detail='软件根据多次敲击的间隔，估算合适的 BPM。';focus=await rect('.tap-tempo-pad');keys='空格 / 点击';
 for(let i=0;i<6;i++){await click('.tap-tempo-pad',120);await delay(180);}
 assert.equal(await js("document.querySelector('.tap-tempo-apply').disabled"),false);
 keys='';await say('觉得合适后，点击“应用”','想重新测量，可以点“重来”。','.tap-tempo-apply',2100);await click('.tap-tempo-apply');await finish();
 // 4. An actual original four-note passage with its offline-exported sound.
 await fresh(3);await seed();await say('点上方的琴键，可以先听一个音高','有选中音符组时用它试听；未选中时用钢琴。','.melody-keys',2300);await click('[data-pitch-label="C4"]');
 await say('顶部 ▶：开始播放','播放头经过音符时，声音会依次响起。','.web-play',2200);
 await click('.web-play',0);await wait(()=>js("document.querySelector('.web-play').getAttribute('aria-pressed')==='true'"));focus=null;
 const audioWindows=[];let audioAt=elapsed();
 for(let i=0;i<20;i++){await js('__guide.now='+i/10);await shot(100);}audioWindows.push({at:audioAt,from:0,duration:2});
 await click('.web-play',200);await say('Ⅱ：暂停在当前位置','再次点击 ▶，就从刚才的位置继续。','.web-play',2200);
 await click('.web-play',0);audioAt=elapsed();for(let i=20;i<40;i++){await js('__guide.now='+i/10);await shot(100);}audioWindows.push({at:audioAt,from:2,duration:2});
 await say('■：停止，并把播放头归零','下一次点击 ▶，就从开头播放。','.web-stop',2300);await click('.web-stop',400);
 await js("document.querySelector('.web-export').click()");await wait(()=>js("__guide.downloads.some(d=>d.name.endsWith('.wav'))"));
 const b64=await js("(async()=>{const a=new Uint8Array(await __guide.downloads.find(d=>d.name.endsWith('.wav')).blob.arrayBuffer());let s='';for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode(...a.subarray(i,i+32768));return btoa(s)})()");fs.writeFileSync(path.join(root,'playback.wav'),Buffer.from(b64,'base64'));
 await finish();all.at(-1).audio='playback.wav';all.at(-1).audioWindows=audioWindows;
 // 5. Free pan and both independent zoom axes, measured by the actual UI.
 await fresh(4);await seed();await say('先在空白处右键一下，取消当前选中','然后按住空白处拖动，就能移动整个视角。',undefined,2600);
 let r=await rect('.melody-canvas');const blank={x:r.x+r.width*.8,y:r.y+r.height*.7};await pointer('pointerdown',blank.x,blank.y,2,'.melody-canvas');await pointer('pointerup',blank.x,blank.y,2);
 await moveTo(blank.x,blank.y);await pointer('pointerdown',blank.x,blank.y,0,'.melody-canvas');caption='按住空白斜向拖动：左右、上下可以同时移动';detail='只是移动视角，不会移动音乐里的音符。';
 for(let i=1;i<=12;i++){cursor={x:blank.x-135*i/12,y:blank.y-95*i/12};await pointer('pointermove',cursor.x,cursor.y);await shot(90);}await pointer('pointerup',cursor.x,cursor.y);await shot(1700);
 await say('普通滚轮：上下移动，浏览前后时间','把鼠标放在画布空白处再滚动。',undefined,2000);keys='滚轮';await wheel(260);await shot(1200);
 await say('Shift ＋ 滚轮：左右移动，浏览不同音高','触控板的横向滚动，也能左右移动。',undefined,2100);keys='Shift + 滚轮';await wheel(220,{shiftKey:true});await shot(1100);
 await say('Ctrl ＋ 滚轮：竖向缩放时间','放大后更容易调整音符的开始位置和长度。',undefined,2200);keys='Ctrl + 滚轮';await wheel(-230,{ctrlKey:true});await shot(1200);
 await say('Ctrl ＋ Shift ＋ 滚轮：横向缩放音高','Mac 上的滚轮缩放也可用 ⌘ 代替 Ctrl。',undefined,2400);keys='Ctrl + Shift + 滚轮';await wheel(-200,{ctrlKey:true,shiftKey:true});await shot(1700);await finish();
 // 6. Actual save/open/export actions; the OS picker is deliberately not filmed.
 await fresh(5);await seed();await say('新建：开始一份新的空白音乐','有尚未下载的修改时，会先询问是否放弃。','.web-new',2400);await click('.web-new');await say('不想丢掉草稿，就选“返回”','先下载工程，再新建下一首。','.web-dialog',2100);await click('.web-dialog button:first-of-type');
 await say('下载工程：保存可继续编辑的音乐','得到 .rootsound 文件，音符和音色都保留。','.web-save',2600);await click('.web-save');await wait(()=>js("__guide.downloads.some(d=>d.name.endsWith('.rootsound'))"));
 const saved=await js("__guide.downloads.find(d=>d.name.endsWith('.rootsound')).blob.text()");await shot(1000);
 await say('打开：导入已有工程，或 MIDI 曲谱','从电脑选择文件，就能继续编辑里面的音符。','.web-open',2400);await click('.web-new');await click('.web-open');
 await js(`(()=>{const f=document.querySelector('.web-file');Object.defineProperty(f,'files',{configurable:true,value:[new File([${JSON.stringify(saved)}],'演示音乐.rootsound',{type:'application/json'})]});f.dispatchEvent(new Event('change'))})()`);
 await wait(()=>js("document.querySelector('.web-status').textContent==='工程已打开。' && document.querySelectorAll('.melody-note').length>0"));await say('重新打开工程，原来的音符回来了','MIDI 导入时，网页会把乐器匹配到可用音色。','.melody-notes',2200);
 await say('导出音频：得到可以直接播放的 WAV','想继续改音符，就保留工程；想直接听，就导出音频。','.web-export',2800);await click('.web-export');await wait(()=>js("__guide.downloads.some(d=>d.name.endsWith('.wav'))"));
 await say('草稿不会自动保存','离开网页前，记得点击“下载工程”。','.web-save',3000);await finish();
 fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify({width:1280,height:820,lessons:all},null,2));
 fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({passed:true,chapters:all.length,frames:number,seconds:all.reduce((n,l)=>n+l.duration,0)/1000,visibleWindow:false,physicalAudio:false,userProjectsRead:false}));win.destroy();app.exit(0);
}catch(error){let state;try{state=await js("({status:document.querySelector('.web-status')?.textContent,notes:document.querySelectorAll('.melody-note').length,dialog:document.querySelector('dialog[open]')?.textContent})");fs.writeFileSync(path.join(root,'failure.png'),(await win.webContents.capturePage()).toPNG());}catch{}fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify({width:1280,height:820,lessons:all}));fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({error:String(error),stack:error.stack,expression:lastExpression,chapter:lesson?.id,state}));app.exit(1);}});
