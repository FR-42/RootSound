import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {BasicSoundBank,GeneratorTypes,SpessaSynthProcessor,Modulator,ModulatorSource} from 'spessasynth_core';
import {loadSoundFont,SoundFontStream,type FontEvent} from '../src/workstation/modules/sound-runtime/soundfont-engine.ts';
import {createSampleBankAudio} from '../src/workstation/modules/timbre/sample-bank.ts';
import {createMaterialLibrary} from '../src/workstation/modules/materials/public.ts';
import {readPreview} from '../src/workstation/modules/sound-runtime/plan.ts';

const file=readFileSync('public/instruments/generaluser-gs-2.0.3/GeneralUser-GS.sf2');
const bank=loadSoundFont(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength));
const event=(changes:Partial<FontEvent>={}):FontEvent=>({atSeconds:0,holdSeconds:.25,releaseSeconds:1,level:.7,pan:0,
  font:{bank:'generaluser-gs-2.0.3',program:73,key:69,velocity:100,cents:0,drums:false},...changes});
function render(source:ReturnType<typeof loadSoundFont>,events:FontEvent[],seconds=.6){
  const stream=new SoundFontStream(source,48000,events),left=new Float32Array(Math.round(seconds*48000)),right=new Float32Array(left.length);
  stream.process(left,right);return {stream,left,right};
}
const energy=(audio:Float32Array)=>audio.reduce((n,x)=>n+x*x,0);

test('RootSound note mapping matches the complete reference engine sample for sample',async()=>{
  const input=event();const actual=render(bank,[input]);
  const reference=new SpessaSynthProcessor(48000,{effectsEnabled:true,eventsEnabled:false});reference.soundBankManager.addSoundBank(bank,'reference');await reference.ready;
  const channel=reference.midiChannels[0]!;channel.setDrums(false);reference.programChange(0,73);channel.setSystemParameter('gain',.7);channel.setSystemParameter('pan',0);channel.setSystemParameter('fineTune',0);
  reference.noteOn(0,69,100);const left=new Float32Array(actual.left.length),right=new Float32Array(left.length);
  for(let offset=0;offset<left.length;){if(offset===12000)reference.noteOff(0,69);const count=Math.min(128,left.length-offset,offset<12000?12000-offset:128);reference.process(left,right,offset,count);offset+=count;}
  assert.deepEqual(actual.left,left);assert.deepEqual(actual.right,right);assert(energy(left)>0);
  actual.stream.dispose();reference.soundBankManager.deleteSoundBank('reference');reference.destroy();
});

test('SoundFont filter, modulation envelope and pitch LFO affect rendered PCM',()=>{
  function patch(mode:'plain'|'filter'|'lfo') {
    const source=loadSoundFont(BasicSoundBank.getSampleSoundBankFile());
    for(const instrument of source.instruments)for(const zone of [...instrument.zones,instrument.globalZone]){
      zone.setGenerator(GeneratorTypes.attackVolEnv,-12000);zone.setGenerator(GeneratorTypes.releaseVolEnv,-2400);
      if(mode==='filter'){zone.setGenerator(GeneratorTypes.initialFilterFc,4200);zone.setGenerator(GeneratorTypes.modEnvToFilterFc,6000);zone.setGenerator(GeneratorTypes.attackModEnv,-1200);}
      if(mode==='lfo'){zone.setGenerator(GeneratorTypes.delayModLFO,-12000);zone.setGenerator(GeneratorTypes.freqModLFO,0);zone.setGenerator(GeneratorTypes.modLfoToPitch,200);}
    }
    return source;
  }
  const input=event({font:{...event().font,program:0}}),plain=render(patch('plain'),[input]),filtered=render(patch('filter'),[input]),lfo=render(patch('lfo'),[input]);
  assert(energy(plain.left)>0);assert(energy(filtered.left)>0);assert(energy(lfo.left)>0);
  assert.notDeepEqual(plain.left,filtered.left);assert.notDeepEqual(plain.left,lfo.left);
  assert(energy(filtered.left)<energy(plain.left));
  for(const item of [plain,filtered,lfo])item.stream.dispose();
});

test('custom SoundFont velocity modulators remain active rather than being discarded',()=>{
  const original=loadSoundFont(BasicSoundBank.getSampleSoundBankFile()),modified=BasicSoundBank.copyFrom(original);
  const source=Object.assign(new ModulatorSource(),{index:2,isCC:false,isBipolar:false,isNegative:false,curveType:0});
  const constant=Object.assign(new ModulatorSource(),{index:0,isCC:false,isBipolar:false,isNegative:false,curveType:0});
  for(const instrument of modified.instruments)instrument.globalZone.modulators.push(new Modulator(source,constant,GeneratorTypes.initialFilterFc,-10000));
  const input=event({font:{...event().font,program:0}}),plain=render(original,[input]),modulated=render(modified,[input]);
  assert(energy(modulated.left)>0);assert(energy(modulated.left)<energy(plain.left)*.7);
  plain.stream.dispose();modulated.stream.dispose();
});

test('every GM program produces actual audio through the full SF2 engine',()=>{
  for(let program=0;program<128;program++){
    const sound=render(bank,[event({holdSeconds:.6,font:{...event().font,program,key:60}})],1.5);
    assert(sound.left.every(Number.isFinite)&&sound.right.every(Number.isFinite));
    assert(energy(sound.left)+energy(sound.right)>1e-12,`silent GM program ${program+1}`);sound.stream.dispose();
  }
});

test('all 47 standard percussion keys produce audio through the full SF2 engine',()=>{
  for(let key=35;key<=81;key++){
    const sound=render(bank,[event({holdSeconds:.05,font:{...event().font,program:0,key,drums:true}})],.6);
    assert(sound.left.every(Number.isFinite)&&sound.right.every(Number.isFinite));
    assert(energy(sound.left)+energy(sound.right)>1e-12,`silent GM drum ${key}`);sound.stream.dispose();
  }
});

test('seek restores surviving notes without replaying attacks, within one modulation control quantum',()=>{
  const events=[event(),event({atSeconds:.4,holdSeconds:.4})],whole=render(bank,events,1);
  const stream=new SoundFontStream(bank,48000,events);stream.seek(.5);
  const left=new Float32Array(12000),right=new Float32Array(12000);stream.process(left,right);
  for(const [actual,reference] of [[left,whole.left.slice(24000,36000)],[right,whole.right.slice(24000,36000)]]){
    const error=actual!.reduce((sum,value,i)=>sum+(value-reference![i]!)**2,0);
    const relative=Math.sqrt(error/energy(reference!));assert(relative<.05,`seek relative RMS error ${relative}`);
    assert(energy(actual!)>0);
  }
  stream.dispose();whole.stream.dispose();
});

test('hi-hat choke groups share their SF2 channel even when hit gain and pan differ',()=>{
  const open=event({holdSeconds:.05,font:{...event().font,program:0,key:46,drums:true}});
  const closed=event({atSeconds:.1,holdSeconds:.05,level:.3,pan:.5,font:{...open.font,key:42}});
  const sound=render(bank,[open,closed],.2);
  assert.equal(sound.stream.synth.midiChannels[0]!.systemParameters.gain,.3);
  assert.equal(sound.stream.synth.midiChannels[0]!.systemParameters.pan,.5);
  assert(energy(sound.left)>0);sound.stream.dispose();
});

test('starting from a moved playback head skips negative-time expired attacks and restores a held note',()=>{
  const expired=event({atSeconds:-5,holdSeconds:.1,releaseSeconds:.1});
  const empty=new SoundFontStream(bank,48000,[expired]);empty.seek(0);
  const silent=new Float32Array(4800),silentR=new Float32Array(4800);empty.process(silent,silentR);assert.equal(energy(silent)+energy(silentR),0);empty.dispose();
  const reference=render(bank,[event({holdSeconds:.8})],.6);
  const restored=new SoundFontStream(bank,48000,[expired,event({atSeconds:-.2,holdSeconds:.8})]);restored.seek(0);
  const left=new Float32Array(4800),right=new Float32Array(4800);restored.process(left,right);
  assert(energy(left)>0);
  const wanted=reference.left.slice(9600,14400),error=left.reduce((sum,x,i)=>sum+(x-wanted[i]!)**2,0);
  assert(Math.sqrt(error/energy(wanted))<.05,'held notes should resume at their age, without an attack burst');
  restored.dispose();reference.stream.dispose();
});

test('a generated long score streams through bounded reusable audio blocks, with one SF2 engine',()=>{
  const events=Array.from({length:5267},(_,i)=>event({atSeconds:i*.03,holdSeconds:.015,releaseSeconds:.1,font:{...event().font,program:0,key:60+i%3}}));
  const stream=new SoundFontStream(bank,48000,events),left=new Float32Array(128),right=new Float32Array(128);
  while(stream.position<159){left.fill(0);right.fill(0);stream.process(left,right);}
  assert(stream.synth.midiChannels.length<128);assert.equal(stream.position>=159,true);stream.dispose();
});

test('full-bank plans stay thin and retain velocity, tuning, drum identity and gain independently',async()=>{
  const fetcher=(async()=>new Response(readFileSync('public/instruments/generaluser-gs-2.0.3/manifest.json'))) as typeof fetch;
  const full=createSampleBankAudio(createMaterialLibrary(),undefined,fetcher,{soundFont:true});
  const body={model:'sample-bank',version:1,bank:'generaluser-gs-2.0.3',instrument:'gm-73',attackSeconds:0,releaseSeconds:.03,level:.7} as const;
  const note={frequencyHz:440,holdSeconds:.2,velocity:.8};await full.prepare(body,[note]);const plan=full.plan(body,note);
  assert.equal(plan.soundFont?.program,73);assert.equal(plan.soundFont?.velocity,102);assert.equal(plan.note.velocity,1);
  assert.equal(plan.source.audio.channels[0]!.byteLength,4);assert.equal(readPreview(plan).samples.length,1);
  const drum={...body,instrument:'gm-drum-36',tuningSemitones:24};const pitch={...note,frequencyHz:440*2**((36-69)/12)};
  await full.prepare(drum,[pitch]);const hit=full.plan(drum,pitch);assert.equal(hit.soundFont?.key,36);assert.equal(hit.soundFont?.drums,true);assert(Math.abs(hit.soundFont!.cents)<1e-6);
});

test('SF2 polyphony does not attenuate a score using its placeholder sample as a peak estimate',async()=>{
  const fetcher=(async()=>new Response(readFileSync('public/instruments/generaluser-gs-2.0.3/manifest.json'))) as typeof fetch;
  const full=createSampleBankAudio(createMaterialLibrary(),undefined,fetcher,{soundFont:true});
  const body={model:'sample-bank',version:1,bank:'generaluser-gs-2.0.3',instrument:'gm-0',attackSeconds:0,releaseSeconds:1,level:.7} as const;
  const note={frequencyHz:440,holdSeconds:1,velocity:.75}; await full.prepare(body,[note]);
  const sound=full.plan(body,note);
  for(const count of [1,4,24]) {
    const preview=readPreview({kind:'sequence',version:1,durationSeconds:2,events:Array.from({length:count},()=>({atSeconds:0,sound}))});
    assert.equal(preview.normalization,1);assert.equal(preview.events.length,count);
    assert.equal(preview.events[0]!.sound.level,.7);
  }
});
