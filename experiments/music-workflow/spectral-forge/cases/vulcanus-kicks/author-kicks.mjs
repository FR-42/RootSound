/** Author native editable patches through the selected application's unmodified DSP. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)), tool=resolve(here,'../..');
const release=(await readFile(join(tool,'.current'),'utf8')).trim();
if(!/^\d{8}-\d{6}-\d{3}-[a-f0-9]{6}$/.test(release))throw new Error('Invalid selected tool release');
const ui=join(tool,'.builds',release,'ui');
const {createDefaultPatch,normalizePatch,importPatch,curveValue,effectivePolyphony}=await import(pathToFileURL(join(ui,'model.mjs')));
const {renderPatch,encodeWav24,SpectralSynth}=await import(pathToFileURL(join(ui,'dsp.mjs')));
const point=(x,y,curve=0)=>({x,y,curve});
const base=()=>{
  const p=createDefaultPatch();
  p.master={level:.96,glideSeconds:0,polyphony:4,velocitySensitivity:.3};
  p.lfos.forEach(l=>l.enabled=false);
  p.effects={drive:0,chorusMix:0,chorusRateHz:.3,chorusDepthMs:5,delaySeconds:.25,delayFeedback:.2,delayMix:0};
  p.oscillators.forEach(o=>{o.enabled=false;o.unison=1;o.detuneCents=0;o.spread=0;o.pan=0;o.cents=0;o.fmAmount=0;});
  return p;
};
const a=base();a.name='Vulcanus Kick A · 密集段短击';a.seed=281037;
a.oscillators[0]={...a.oscillators[0],enabled:true,waveform:'sine',level:1,semitones:-22,phase:.035,fmRatio:2,fmAmount:.06};
a.oscillators[1]={...a.oscillators[1],enabled:true,waveform:'triangle',level:.14,semitones:-10,phase:.929};
a.oscillators[2]={...a.oscillators[2],enabled:true,waveform:'sine',level:.24,semitones:14,phase:.108};
a.oscillators[3]={...a.oscillators[3],enabled:true,waveform:'noise',level:.003};
a.spectrum={mix:1,points:[point(20,-72),point(38,-18),point(65,6),point(95,4),point(170,-2),point(400,-14),point(1000,-30),point(2800,-8),point(7000,-25),point(20000,-72)]};
a.amplitude={points:[point(0,0),point(.0006,1),point(.005,.95),point(.018,.80),point(.04,.65),point(.07,.45),point(.105,.21),point(.145,.05),point(.185,0),point(.235,0)],sustainIndex:8};
a.pitch={points:[point(0,39,-.2),point(.0015,24,-.15),point(.005,13,-.1),point(.013,5.8,-.15),point(.029,1.9,-.12),point(.055,.45),point(.095,-1.1),point(.145,-2.6),point(.185,-3.2),point(.235,-3.2)],sustainIndex:8};
a.effects.drive=.10;
const b=base();b.name='Vulcanus Kick B · 下潜重击';b.seed=281039;
b.oscillators[0]={...b.oscillators[0],enabled:true,waveform:'sine',level:1,semitones:-27,phase:.025,fmRatio:2,fmAmount:.16};
b.oscillators[1]={...b.oscillators[1],enabled:true,waveform:'triangle',level:.23,semitones:-15,phase:.929};
b.oscillators[2]={...b.oscillators[2],enabled:true,waveform:'sine',level:.32,semitones:21,phase:.108,fmRatio:1.5,fmAmount:.08};
b.oscillators[3]={...b.oscillators[3],enabled:true,waveform:'noise',level:.0025};
b.spectrum={mix:1,points:[point(20,-66),point(32,-16),point(49,8),point(77,6),point(125,2),point(250,-7),point(800,-26),point(2800,-7),point(7000,-25),point(20000,-72)]};
b.amplitude={points:[point(0,0),point(.0004,.97),point(.008,1),point(.022,.92),point(.05,.73),point(.085,.52),point(.13,.29),point(.19,.10),point(.27,0),point(.32,0)],sustainIndex:8};
b.pitch={points:[point(0,48,-.15),point(.002,36,-.12),point(.008,23,-.08),point(.020,14,-.12),point(.038,7.3,-.08),point(.064,2.2),point(.105,-.5),point(.17,-2.1),point(.27,-2.5),point(.32,-2.5)],sustainIndex:8};
b.effects.drive=.32;

const out=resolve(process.argv[2]??join(here,'draft'));await mkdir(out,{recursive:true});
const choices=[['A','Vulcanus-Kick-A-密集短击',a,.25],['B','Vulcanus-Kick-B-下潜重击',b,.34]];
const report={release,engineDirectory:ui,referenceWindowSeconds:[0,20],
  source:String.raw`D:\Sound\temp\music\vulcanus.mp3`,sourceAudioIncluded:false,audioInputSupported:false,
  construction:'Published SpectralSynth/renderPatch only. Native oscillators, pitch/volume curves and static spectrum; no external audio effect or sample.',
  interpretation:'Two provisional designs guided by the user dense 3–10s / sparse after10s cue. No claim of recovered original presets or proven kick identities.',
  listeningAccepted:false,patches:[],files:[]};
function inspect(rendered){
  let squares=0,peak=0,endPeak=0,dc=0,lr=0;
  for(let n=0;n<rendered.left.length;n++){
    const l=rendered.left[n],r=rendered.right[n];
    if(!Number.isFinite(l)||!Number.isFinite(r))throw new Error('Nonfinite output');
    peak=Math.max(peak,Math.abs(l),Math.abs(r));squares+=l*l+r*r;dc+=l+r;lr=Math.max(lr,Math.abs(l-r));
    if(n>=rendered.left.length-rendered.sampleRate*.06)endPeak=Math.max(endPeak,Math.abs(l),Math.abs(r));
  }
  if(peak<.01||peak>=.97||endPeak>1e-4||rendered.tailTruncated)throw new Error('Insufficient output headroom or tail');
  return {sampleRate:rendered.sampleRate,frames:rendered.left.length,durationSeconds:rendered.durationSeconds,
    peak,rms:Math.sqrt(squares/(2*rendered.left.length)),dcMean:dc/(rendered.left.length*2),
    last60msPeak:endPeak,maximumLeftRightDifference:lr,tailTruncated:rendered.tailTruncated};
}
for(const[id,name,value,holdSeconds]of choices){
  // Match audition peaks inside the tool's own spectrum controls; never apply
  // normalization or an external effect to the exported audio afterwards.
  const calibration=renderPatch(normalizePatch(value),{sampleRate:48000,midi:60,velocity:1,holdSeconds});
  const gainDb=20*Math.log10(.70/calibration.peak);
  value.spectrum.points=value.spectrum.points.map(p=>({...p,y:p.y+gainDb}));
  const patch=normalizePatch(value);const text=JSON.stringify(patch,null,2)+'\n';
  const reopened=importPatch(JSON.parse(text));
  if(reopened.reduced||JSON.stringify(reopened.patch)!==JSON.stringify(patch))throw new Error('Patch import changes the design');
  const rendered=renderPatch(reopened.patch,{sampleRate:48000,midi:60,velocity:1,holdSeconds});
  await writeFile(join(out,name+'.rssynth'),text,{flag:'wx'});
  const wav=encodeWav24(rendered);await writeFile(join(out,name+'-单击.wav'),wav,{flag:'wx'});
  // Float data is diagnostic only; the delivered WAV is produced by the app encoder.
  const floats=new Float32Array(rendered.left.length*2);
  rendered.left.forEach((v,n)=>{floats[n*2]=v;floats[n*2+1]=rendered.right[n];});
  await writeFile(join(out,name+'.f32'),new Uint8Array(floats.buffer),{flag:'wx'});
  report.patches.push({id,name,midi:60,velocity:1,holdSeconds,curveCounts:{spectrum:patch.spectrum.points.length,
    amplitude:patch.amplitude.points.length,pitch:patch.pitch.points.length},effectivePolyphony:effectivePolyphony(patch),
    bodyPitchHz:[.005,.015,.035,.065,.11,.17].map(t=>({seconds:t,hz:440*2**((60+patch.oscillators[0].semitones+curveValue(patch.pitch.points,t)-69)/12)})),
    auditionPeakCalibrationDb:gainDb,...inspect(rendered)});
  for(const filename of[name+'.rssynth',name+'-单击.wav']){
    const bytes=await readFile(join(out,filename));report.files.push({name:filename,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
  }
}
// A denser example, a gap, then isolated B hits. This is an audition pattern,
// not a transcription or an audio excerpt of the reference.
const sampleRate=48000,length=6.2,frames=Math.round(sampleRate*length),left=new Float32Array(frames),right=new Float32Array(frames);
for(const[id,,value,hold]of choices){
  const synth=new SpectralSynth(sampleRate,normalizePatch(value));
  const beats=id==='A'?[0,.283,.4245,.566,.849,1.132,1.2735,1.415,1.698,1.981]:[3.0,3.85,4.7,5.55];
  const events=beats.flatMap((t,i)=>[{frame:Math.round(t*sampleRate),on:true,id:`${id}-${i}`},
    {frame:Math.round((t+hold)*sampleRate),on:false,id:`${id}-${i}`}]).sort((a,b)=>a.frame-b.frame||Number(a.on)-Number(b.on));
  let e=0,at=0;
  while(at<frames){
    while(e<events.length&&events[e].frame<=at){const event=events[e++];if(event.on)synth.noteOn({id:event.id,midi:60,velocity:1});else synth.noteOff(event.id);}
    const end=Math.min(frames,at+128,e<events.length?events[e].frame:frames);
    const l=new Float32Array(end-at),r=new Float32Array(end-at);synth.process(l,r);
    for(let n=0;n<l.length;n++){left[at+n]+=l[n];right[at+n]+=r[n];}at=end;
  }
}
const comparison={sampleRate,left,right,durationSeconds:length,tailTruncated:false};
report.comparison=inspect(comparison);report.comparison.auditionOnly=true;
const comparisonName='Vulcanus-Kick-AB-对比试听.wav';const bytes=encodeWav24(comparison);
await writeFile(join(out,comparisonName),bytes,{flag:'wx'});report.files.push({name:comparisonName,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
await writeFile(join(out,'generation-verification.json'),JSON.stringify(report,null,2),{flag:'wx'});
console.log(JSON.stringify({directory:out,...report},null,2));
