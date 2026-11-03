(() => {
  'use strict';
  const audio=document.querySelector('#demo-audio'),demo=document.querySelector('[data-demo]');
  const play=document.querySelector('.play-button'),seek=document.querySelector('.audio-seek');
  const status=document.querySelector('.audio-status'),time=document.querySelector('.audio-time'),wave=document.querySelector('.waveform');
  let metadata,variant='piano',frame=0,loadSequence=0;
  const clock=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
  function paint(){
    const duration=Number.isFinite(audio.duration)?audio.duration:metadata?.duration||1;
    const progress=Math.min(1,audio.currentTime/duration);seek.value=String(Math.round(progress*1000));
    seek.setAttribute('aria-valuetext',`${clock(audio.currentTime)} / ${clock(duration)}`);time.textContent=clock(audio.currentTime);
    wave.querySelectorAll('rect').forEach((bar,index)=>bar.classList.toggle('is-heard',index/72<progress));
    if(!audio.paused)frame=requestAnimationFrame(paint);
  }
  function state(){const playing=!audio.paused&&!audio.ended;demo.classList.toggle('is-playing',playing);play.setAttribute('aria-pressed',String(playing));play.setAttribute('aria-label',playing?'暂停原创演示':'播放原创演示');cancelAnimationFrame(frame);paint();}
  function draw(){wave.replaceChildren();for(const height of metadata.waveforms[variant]){const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');const size=Math.max(5,height*68);rect.setAttribute('x',String(wave.childElementCount*10+2));rect.setAttribute('y',String((80-size)/2));rect.setAttribute('width','5');rect.setAttribute('height',String(size));rect.setAttribute('rx','2.5');wave.append(rect);}paint();}
  play.addEventListener('click',async()=>{try{if(audio.paused){status.textContent='正在加载声音…';await audio.play();status.textContent='主旋律 '+(variant==='piano'?'钢琴':'八音盒')+' · 原创演示';}else audio.pause();}catch{status.textContent='声音加载失败，请再试一次，或下载旋律示例。';}});
  for(const event of ['play','pause','ended'])audio.addEventListener(event,state);
  audio.addEventListener('error',()=>{status.textContent='声音暂时无法加载，你仍可下载旋律示例。';demo.classList.remove('is-playing');play.setAttribute('aria-pressed','false');});
  seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration)){audio.currentTime=Number(seek.value)/1000*audio.duration;paint();}});
  document.querySelectorAll('[name="tone"]').forEach(input=>input.addEventListener('change',()=>{
    const wasPlaying=!audio.paused,position=audio.currentTime,sequence=++loadSequence;audio.pause();variant=input.value;audio.src=`assets/demo-${variant}.mp3`;draw();
    status.textContent='主旋律 '+(variant==='piano'?'钢琴':'八音盒')+' · 原创演示';
    audio.addEventListener('loadedmetadata',async()=>{if(sequence!==loadSequence)return;audio.currentTime=Math.min(position,audio.duration);paint();if(wasPlaying)try{await audio.play();}catch{status.textContent='点播放继续试听。';}},{once:true});
    if(wasPlaying||position>0)audio.load();
  }));
  fetch('assets/demo.json').then(response=>{if(!response.ok)throw Error();return response.json();}).then(value=>{metadata=value;draw();play.disabled=false;seek.disabled=false;document.querySelector('.tone-picker').disabled=false;status.textContent='点击播放 · 主旋律 钢琴';}).catch(()=>{status.textContent='试听暂时不可用，可以下载旋律示例。';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();});

  // The verified release links in HTML remain usable without JS, API access or quota.
  async function refreshRelease(){
    try{
      const cacheKey='rootsound-public-release-v1';let release;
      try{const saved=JSON.parse(sessionStorage.getItem(cacheKey)||'null');if(saved&&Date.now()-saved.at<600000)release=saved.release;}catch{}
      if(!release){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),4000);try{
        const response=await fetch('https://api.github.com/repos/FR-42/RootSound/releases?per_page=5',{signal:controller.signal,headers:{Accept:'application/vnd.github+json'}});if(!response.ok)return;
        const releases=await response.json();release=releases.find(item=>!item.draft&&item.assets?.some(asset=>/^RootSound-Windows-x64-.*\.zip$/.test(asset.name))&&item.assets?.some(asset=>/^RootSound-macOS-arm64-.*\.zip$/.test(asset.name)));
      }finally{clearTimeout(timeout);}if(!release)return;try{sessionStorage.setItem(cacheKey,JSON.stringify({at:Date.now(),release}));}catch{}}
      const safe=url=>{try{const parsed=new URL(url);return parsed.protocol==='https:'&&parsed.hostname==='github.com'&&parsed.pathname.startsWith('/FR-42/RootSound/releases/');}catch{return false;}};
      for(const [platform,pattern] of [['windows',/^RootSound-Windows-x64-(.+)\.zip$/],['mac',/^RootSound-macOS-arm64-(.+)\.zip$/]]){
        const asset=release.assets.find(item=>pattern.test(item.name));if(!asset||!safe(asset.browser_download_url))continue;
        document.querySelector(`[data-platform="${platform}"]`).href=asset.browser_download_url;
        document.querySelector(`[data-size="${platform}"]`).textContent=`约 ${Math.round(asset.size/1e6)} MB`;
        document.querySelector('[data-release-version]').textContent=asset.name.match(pattern)[1];
      }
      const checksum=release.assets.find(asset=>asset.name==='SHA256SUMS.txt');if(checksum&&safe(checksum.browser_download_url))document.querySelector('[data-checksum]').href=checksum.browser_download_url;
    }catch{/* Static last-known-good download links are the intended offline fallback. */}
  }
  void refreshRelease();
})();
