import { build } from 'vite';
import { mkdir, cp, rm, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { SoundBankLoader, SpessaLog } from 'spessasynth_core';
import { WEB_STARTER_TONES } from '../src/workstation/contracts/web-audio.ts';

process.env.TZ = 'UTC';
SpessaLog.setLogLevel(false, false, false);
const root=path.resolve('.cache/website');
await mkdir(root,{recursive:true});
// Retire old generated tutorials as well as replacing current files.
await rm(path.join(root,'guides'),{recursive:true,force:true});
await cp('website',root,{recursive:true});
await build({configFile:path.resolve('vite.web.config.ts')});
await cp('public/instruments/generaluser-gs-2.0.3', path.join(root, 'play/instruments/generaluser-gs-2.0.3'), { recursive: true });
await cp('public/licenses', path.join(root, 'play/licenses'), { recursive: true });

const instruments = path.join(root, 'play/instruments/generaluser-gs-2.0.3');
const original = await readFile(path.join(instruments, 'GeneralUser-GS.sf2'));
const bank = SoundBankLoader.fromArrayBuffer(original.buffer.slice(original.byteOffset, original.byteOffset + original.byteLength));
const programs = new Set(Object.values(WEB_STARTER_TONES));
for (const preset of [...bank.presets]) {
  if (preset.isGMGSDrum || preset.bankMSB !== 0 || preset.bankLSB !== 0 || !programs.has(preset.program))
    bank.deletePreset(preset);
}
bank.removeUnusedElements();
const starter = Buffer.from(bank.writeSF2());
if (bank.presets.length !== programs.size || starter.length >= original.length) throw new Error('Unexpected starter SoundFont.');
await writeFile(path.join(instruments, 'GeneralUser-GS-starter.sf2'), starter);
const manifest = JSON.parse(await readFile(path.join(instruments, 'manifest.json'), 'utf8'));
manifest.instruments = Object.fromEntries(Object.keys(WEB_STARTER_TONES).map(tone => [tone, manifest.instruments[tone]]));
await writeFile(path.join(instruments, 'manifest.starter.json'), JSON.stringify(manifest));
console.log(`Starter SoundFont: ${starter.length} bytes (full bank: ${original.length} bytes)`);
