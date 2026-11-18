import { build } from 'vite';
import { mkdir, cp, rm, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

process.env.TZ = 'UTC';
const root=path.resolve('.cache/website');
await mkdir(root,{recursive:true});
// Retire old generated tutorials as well as replacing current files.
await rm(path.join(root,'guides'),{recursive:true,force:true});
await cp('website',root,{recursive:true});
const colors = await readFile('src/workstation/app/release-colors.css', 'utf8');
await writeFile(path.join(root, 'assets/app-colors.css'), colors.replace('../modules/ui-rendering/tone-card-back.svg', './tone-card-back.svg'));
await cp('src/workstation/modules/ui-rendering/tone-card-back.svg', path.join(root, 'assets/tone-card-back.svg'));
await build({configFile:path.resolve('vite.web.config.ts')});
const bank = 'rootsound-studio-v1';
const source = path.join('public/instruments', bank);
const target = path.join(root, 'play/instruments', bank);
const manifest = JSON.parse(await readFile(path.join(source, 'manifest.json'), 'utf8'));
const piano = manifest.instruments['studio-piano'];
await mkdir(target, { recursive: true });
await writeFile(path.join(target, 'manifest.json'), JSON.stringify({ bank, instruments: { 'studio-piano': piano } }));
const files = ['CREDITS.md', 'README-Salamander.txt', ...new Set(piano.map(zone => zone.asset))];
for (const file of files) await cp(path.join(source, file), path.join(target, file));
await cp('public/licenses', path.join(root, 'play/licenses'), { recursive: true });
