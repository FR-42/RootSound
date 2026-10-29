import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ui=resolve(process.env.ROOTSOUND_TONE_UI ?? '.test-output/tone-processor/development/ui');
const output=resolve(process.env.ROOTSOUND_TONE_TEST_OUTPUT ?? '.test-output/tone-processor/checks');
const source=resolve(dirname(fileURLToPath(import.meta.url)),'../../spectral-forge/web');
const load=name=>import(pathToFileURL(resolve(ui,name)).href);
const {EqHistory,flatSpectrum,validateSpectrum}=await load('eq-state.mjs');
const {createSpectrumImpulse,fft}=await load('shared/dsp.mjs');

test('EQ graph, styles and DSP are byte-identical to Spectral Forge',async()=>{
  for(const name of ['curve-editor.mjs','curve-density.mjs','styles.css','model.mjs','dsp.mjs'])
    assert.deepEqual(await readFile(resolve(ui,'shared',name)),await readFile(resolve(source,name)),name);
});
test('flat import is transparent, EQ mix and frequency response use original DSP',()=>{
  for(const sampleRate of [8000,44100,48000,96000,192000]) {
    const flat=createSpectrumImpulse(flatSpectrum(),sampleRate);
    assert.ok(Math.abs(flat[0]-1)<1e-7);assert.ok(flat.slice(1).every(x=>Math.abs(x)<1e-9));
    const spectrum={mix:1,points:[{x:20,y:-12,curve:0},{x:20000,y:-12,curve:0}]};
    const reduced=createSpectrumImpulse(spectrum,sampleRate);
    assert.ok(Math.abs(reduced[0]-10**(-12/20))<1e-7);
    assert.ok(Math.abs(createSpectrumImpulse({...spectrum,mix:.5},sampleRate)[0]-(1+10**(-12/20))/2)<1e-7);
  }
});
test('undo, redo, cancel preview and 10-point validation preserve committed settings',()=>{
  const h=new EqHistory(), original=structuredClone(h.value);
  const preview=h.preview({...h.value,mix:.2});assert.equal(h.value.mix,1);
  h.commit(preview);assert.equal(h.value.mix,.2);h.undo();assert.deepEqual(h.value,original);h.redo();assert.equal(h.value.mix,.2);
  h.commit(flatSpectrum());assert.equal(h.future.length,0);
  assert.throws(()=>validateSpectrum({mix:NaN,points:[]}));
  assert.throws(()=>validateSpectrum({mix:1,points:Array.from({length:11},(_,i)=>({x:20+i*100,y:0}))}));
  assert.throws(()=>validateSpectrum({mix:1,points:[{x:20,y:0},{x:20,y:1}]}));
});
test('actual worker returns finite kernels and rejects invalid rate',async()=>{
  const messages=[];globalThis.self={postMessage:value=>messages.push(value)};
  await load('eq-worker.mjs');
  self.onmessage({data:{revision:7,sampleRate:48000,spectrum:flatSpectrum()}});
  assert.equal(messages[0].revision,7);assert.equal(messages[0].impulse.length,8192);assert.equal(messages[0].impulse[0],1);
  self.onmessage({data:{revision:8,sampleRate:NaN,spectrum:flatSpectrum()}});
  assert.match(messages[1].error,/采样率/);delete globalThis.self;
});
test('nontrivial curved EQ produces native comparison fixture',async()=>{
  const spectrum={mix:.81,points:[{x:20,y:-8,curve:.2},{x:180,y:5,curve:-.3},{x:1500,y:-12,curve:.5},{x:6200,y:2,curve:0},{x:20000,y:-23,curve:0}]};
  const impulse=createSpectrumImpulse(spectrum,48000);
  assert.ok(impulse.every(Number.isFinite));
  const real=Float64Array.from(impulse),imag=new Float64Array(real.length);fft(real,imag);
  assert.ok(Math.hypot(real[256],imag[256])<Math.hypot(real[32],imag[32]));
  await mkdir(output,{recursive:true});await writeFile(resolve(output,'eq-fixture.json'),JSON.stringify(Array.from(impulse)));
});
