import { build } from 'vite';
import { mkdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';

process.env.TZ = 'UTC';
const root=path.resolve('.cache/website');
await mkdir(root,{recursive:true});
// Retire old generated tutorials as well as replacing current files.
await rm(path.join(root,'guides'),{recursive:true,force:true});
await cp('website',root,{recursive:true});
await build({configFile:path.resolve('vite.web.config.ts')});
await cp('public/instruments/rootsound-studio-v1', path.join(root, 'play/instruments/rootsound-studio-v1'), { recursive: true });
await cp('public/licenses', path.join(root, 'play/licenses'), { recursive: true });
