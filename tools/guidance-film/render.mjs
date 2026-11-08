import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia, renderStill } from '@remotion/renderer';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '../..');
const input = path.join(root, '.cache/guidance-film/input'), output = path.join(root, '.cache/guidance-film/exports');
await mkdir(output, { recursive: true });
const cli = path.join(here, 'node_modules/@remotion/cli/remotion-cli.js');
async function run(args) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, 'ffmpeg', ...args], { cwd: input, windowsHide: true, stdio: 'ignore' });
    child.on('error', reject); child.on('exit', code => code ? reject(new Error('Clip conversion failed: ' + args.join(' '))) : resolve());
  });
}
for (const name of ['add-voice', 'editing', 'zoom', 'bpm', 'cells', 'extend']) {
  await run(['-y', '-safe', '0', '-i', `${name}.ffconcat`, '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', `${name}.mp4`]);
  console.log('Prepared ' + name);
}
const browserExecutable = process.env.ROOTSOUND_RENDER_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const serveUrl = await bundle({ entryPoint: path.join(here, 'src/index.tsx'), publicDir: input, outDir: path.join(root, '.cache/guidance-film/bundle') });
const compositions = await getCompositions(serveUrl, { browserExecutable });
const reports = [];
for (const composition of compositions) {
  let last = -1;
  await renderMedia({ composition, serveUrl, codec: 'h264', audioCodec: 'aac', crf: 21,
    outputLocation: path.join(output, composition.id + '.mp4'), browserExecutable, concurrency: 2,
    onProgress({ progress }) { const percent = Math.floor(progress * 10) * 10; if (percent !== last) { last = percent; console.log(`${composition.id}: ${percent}%`); } },
  });
  await renderStill({ composition, serveUrl, output: path.join(output, composition.id + '.jpg'), imageFormat: 'jpeg', frame: 45, browserExecutable });
  for (const frame of composition.id === 'basics' ? [45, 210, 450, 690, 870, 1080] : [75, 390, 630, 780]) {
    await renderStill({ composition, serveUrl, output: path.join(root, `.cache/guidance-film/${composition.id}-${frame}.png`), frame: Math.min(frame, composition.durationInFrames - 1), browserExecutable });
  }
  reports.push({ id: composition.id, frames: composition.durationInFrames, fps: composition.fps, width: composition.width, height: composition.height });
}
await writeFile(path.join(output, 'manifest.json'), JSON.stringify({ renderer: 'Remotion', version: '4.0.541', source: 'tools/guidance-film', compositions: reports }, null, 2));
console.log(JSON.stringify(reports));
