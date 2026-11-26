import { mkdir, cp, rm, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.cache/website');
const workspace = path.resolve('.cache');
if (!root.startsWith(workspace + path.sep)) throw new Error('Invalid website output');
await rm(root, { recursive: true, force: true });
await mkdir(root, { recursive: true });
for (const name of ['index.html', 'styles.css', 'site.js', 'assets']) {
  await cp(path.join('website', name), path.join(root, name), { recursive: true });
}
const colors = await readFile('src/workstation/app/release-colors.css', 'utf8');
const palette = colors.slice(0, colors.indexOf('\n\n'));
await writeFile(path.join(root, 'assets/app-colors.css'), palette.replace('../modules/ui-rendering/tone-card-back.svg', './tone-card-back.svg'));
await cp('src/workstation/modules/ui-rendering/tone-card-back.svg', path.join(root, 'assets/tone-card-back.svg'));
await mkdir(path.join(root, 'play'), { recursive: true });
await writeFile(path.join(root, 'play/index.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=../"><title>简乐</title><link rel="canonical" href="../"><a href="../">简乐</a></html>');
console.log('Built download website without the retired online editor or audio assets.');
