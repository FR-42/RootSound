import assert from 'node:assert/strict';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)), output=join(here,'delivery'), tool=resolve(here,'../..');
const release=(await readFile(join(tool,'.current'),'utf8')).trim(), ui=join(tool,'.builds',release,'ui');
const {normalizePatch,importPatch,effectivePolyphony}=await import(pathToFileURL(join(ui,'model.mjs')));
const {renderPatch,encodeWav24}=await import(pathToFileURL(join(ui,'dsp.mjs')));
const patch=normalizePatch(JSON.parse(await readFile(join(output,'Vulcanus-铺底音色.rssynth'),'utf8')));
assert.deepEqual(importPatch(patch),{patch,reduced:false});
assert(effectivePolyphony(patch)>=4);
for(const key of ['spectrum','amplitude','pitch'])assert(patch[key].points.length<=10);
const rerendered=encodeWav24(renderPatch(patch,{sampleRate:48000,midi:60,velocity:.8,holdSeconds:4.5}));
const saved=new Uint8Array(await readFile(join(output,'Vulcanus-铺底-C4.wav')));
assert.deepEqual(rerendered,saved,'Saved parameters must reproduce the delivered audio exactly in a cold process');
const files=[];
for(const name of await readdir(output)){
  if(!/\.(wav|rssynth|txt)$/iu.test(name))continue;
  const bytes=await readFile(join(output,name));
  if(name.endsWith('.wav')){
    assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WAVE');
    assert.equal(bytes.readUInt16LE(20),1);assert.equal(bytes.readUInt16LE(22),2);
    assert.equal(bytes.readUInt32LE(24),48000);assert.equal(bytes.readUInt16LE(34),24);
    assert.equal(bytes.readUInt32LE(40),bytes.length-44);
  }
  files.push({name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
const source='D:\\Sound\\temp\\music\\vulcanus.mp3';
const sourceHash=createHash('sha256').update(await readFile(source)).digest('hex');
assert.equal(sourceHash,'fd358c65504e24fb95173f825ffe50ad5b4f5458ae3067513a8e1a72f3729926');
const proof={release,coldPatchRoundtrip:true,pcm24Stereo48k:true,referenceUnchanged:true,sourceHash,
  sourceAudioIncluded:false,realAudioDeviceOpened:false,listeningAccepted:false,files};
await writeFile(join(output,'delivery-verification.json'),JSON.stringify(proof,null,2),{flag:'wx'});
process.stdout.write(JSON.stringify(proof,null,2)+'\n');
