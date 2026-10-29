import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tool = resolve(here, '../..');
const release = (await readFile(join(tool, '.current'), 'utf8')).trim();
const ui = join(tool, '.builds', release, 'ui');
const { createDefaultPatch, normalizePatch, effectivePolyphony } = await import(pathToFileURL(join(ui, 'model.mjs')));
const { SpectralSynth, renderPatch, encodeWav24 } = await import(pathToFileURL(join(ui, 'dsp.mjs')));
const p = (x,y,curve=0) => ({x,y,curve});
const patch = createDefaultPatch();
patch.name = 'Vulcanus · 和声铺底';
patch.master = { level: .9, polyphony: 6, glideSeconds: .04, velocitySensitivity: .25 };
patch.oscillators[0] = {...patch.oscillators[0],enabled:true,waveform:'saw',level:.92,unison:5,
  cents:-1.5,detuneCents:10.5,spread:.98,pan:-.05,phase:0};
patch.oscillators[1] = {...patch.oscillators[1],enabled:true,waveform:'saw',level:.16,semitones:12,
  unison:2,cents:3.5,detuneCents:7,spread:.96,pan:.08,phase:.31};
patch.oscillators[2] = {...patch.oscillators[2],enabled:true,waveform:'triangle',level:.22,semitones:0,
  unison:1,cents:.6,detuneCents:0,spread:0,pan:0,phase:.16};
patch.oscillators[3].enabled=false;
patch.spectrum={mix:1,points:[p(20,-66),p(90,-35),p(160,-10),p(300,0),p(650,1),p(1400,0),p(3000,-2),p(6000,-7),p(12000,-17),p(20000,-35)]};
patch.amplitude={points:[p(0,0),p(.015,.008,-.1),p(.065,.32,-.15),p(.14,.83,-.12),p(.23,1),p(.65,.91,.15),p(1.2,.88,-.15),p(2.05,0)],sustainIndex:6};
patch.pitch={points:[p(0,0),p(.1,0),p(.95,0)],sustainIndex:1};
patch.lfos=[{enabled:true,waveform:'sine',rateHz:.17,depth:.016,target:'pitch'},
  {enabled:true,waveform:'sine',rateHz:.09,depth:.12,target:'pan'}];
patch.effects={drive:0,chorusMix:.28,chorusRateHz:.23,chorusDepthMs:5.5,
  delaySeconds:60/212,delayFeedback:.27,delayMix:.065};
patch.seed=837219;
const fitFile=process.argv[2];
if(fitFile){
  const fit=JSON.parse(await readFile(resolve(fitFile),'utf8'));
  if(fit.spectrumPoints)patch.spectrum.points=fit.spectrumPoints;
  if(fit.adjustments){
    if(fit.adjustments.chorusMix!==undefined)patch.effects.chorusMix=fit.adjustments.chorusMix;
    if(fit.adjustments.masterLevel!==undefined)patch.master.level=fit.adjustments.masterLevel;
  }
}
const instrument=normalizePatch(patch);
const out=join(here, fitFile?'delivery':'calibration');
await mkdir(out,{recursive:true});
const sampleRate=48000, velocity=.8;
const single=renderPatch(instrument,{sampleRate,midi:60,velocity,holdSeconds:4.5});
function chord(midis,holdSeconds=4.2){
  const tail=single.durationSeconds-4.5;
  const frames=Math.ceil((holdSeconds+tail)*sampleRate), heldFrames=Math.round(holdSeconds*sampleRate);
  const synth=new SpectralSynth(sampleRate,instrument);
  if(effectivePolyphony(instrument)<midis.length)throw new Error('Insufficient native polyphony');
  midis.forEach((midi,index)=>synth.noteOn({id:`chord-${index}`,midi,velocity:.72}));
  const left=new Float32Array(frames),right=new Float32Array(frames);let at=0,peak=0;
  while(at<frames){
    if(at===heldFrames)midis.forEach((_midi,index)=>synth.noteOff(`chord-${index}`));
    const end=Math.min(frames,at+128,at<heldFrames?heldFrames:frames);
    peak=Math.max(peak,synth.process(left.subarray(at,end),right.subarray(at,end)));at=end;
  }
  // Match renderPatch's ordinary six millisecond end-of-file fade.
  const fade=Math.min(frames,Math.round(sampleRate*.006));
  for(let index=0;index<fade;index++){const gain=1-index/Math.max(1,fade-1);left[frames-fade+index]*=gain;right[frames-fade+index]*=gain;}
  return{sampleRate,left,right,peak,durationSeconds:frames/sampleRate,tailTruncated:false};
}
const fm=chord([53,56,60,63]),bb=fitFile?undefined:chord([58,62,65,68]);
function inspect(rendered){
  let squares=0,mid=0,side=0,dc=0,last=0;
  for(let i=0;i<rendered.left.length;i++){
    const l=rendered.left[i],r=rendered.right[i];
    if(!Number.isFinite(l)||!Number.isFinite(r)||Math.abs(l)>=1||Math.abs(r)>=1)throw new Error('Invalid or clipped output');
    squares+=l*l+r*r;dc+=l+r;mid+=(l+r)**2;side+=(l-r)**2;
    if(i>rendered.left.length-sampleRate*.1)last=Math.max(last,Math.abs(l),Math.abs(r));
  }
  if(rendered.peak<1e-5)throw new Error('Unexpected silence');
  return{durationSeconds:rendered.durationSeconds,peak:rendered.peak,rms:Math.sqrt(squares/(2*rendered.left.length)),
    sideToMidDb:10*Math.log10((side+1e-30)/(mid+1e-30)),dcMean:dc/(rendered.left.length*2),last100msPeak:last,
    finite:true,clipped:false,tailTruncated:rendered.tailTruncated};
}
const outputs=[['Vulcanus-铺底-C4.wav',single],['Vulcanus-铺底-和弦试听.wav',fm]];
if(bb)outputs.push(['calibration-Bb7.wav',bb]);
const reports=[];
for(const[name,result]of outputs){const metrics=inspect(result),bytes=encodeWav24(result);await writeFile(join(out,name),bytes,{flag:'wx'});reports.push({name,...metrics,sha256:createHash('sha256').update(bytes).digest('hex')});}
const text=JSON.stringify(instrument,null,2);
await writeFile(join(out,'Vulcanus-铺底音色.rssynth'),text,{flag:'wx'});
const report={release,engineDirectory:ui,reference:'D:\\Sound\\temp\\music\\vulcanus.mp3',referenceSeconds:[0,20],
  sourceAudioIncluded:false,construction:'Published SpectralSynth, oscillator synthesis only, no additional audio effects',
  listeningAccepted:false,patchSha256:createHash('sha256').update(text).digest('hex'),
  curveCounts:{spectrum:instrument.spectrum.points.length,amplitude:instrument.amplitude.points.length,pitch:instrument.pitch.points.length},
  effectivePolyphony:effectivePolyphony(instrument),singleNote:{midi:60,hz:440*2**((60-69)/12),holdSeconds:4.5},
  chordDemo:{midis:[53,56,60,63],holdSeconds:4.2,label:'Fm7 voicing for timbre audition, not a verified transcription'},reports};
await writeFile(join(out,'generation-verification.json'),JSON.stringify(report,null,2),{flag:'wx'});
process.stdout.write(JSON.stringify({directory:out,...report},null,2)+'\n');
