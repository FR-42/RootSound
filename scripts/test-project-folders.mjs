// Isolated real file-service checks. User music is never opened for editing.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { randomUUID, createHash } from 'node:crypto';
import { createInitialProjectLibrary, createProjectSetup } from '../src/workstation/app/project-setup.ts';
import { createDesktopProjectDirectories } from '../src/workstation/app/platform/project-directories.ts';

const evidence = path.resolve('.test-output/library-folders');
await fs.mkdir(evidence, { recursive: true });
const installation = await fs.mkdtemp(path.join(evidence, 'native-'));
const root = path.join(installation, 'project'), folder = path.join(root, 'my music'), deep = path.join(folder, 'deep');
await fs.mkdir(deep, { recursive: true });
const libraryText = createInitialProjectLibrary('歌曲');
async function workspace(filename, text = libraryText) {
  const data = { format: 'RootSoundWorkspace', version: 2, id: randomUUID(), name: '内部旧名称', createdAtUtc: new Date().toISOString(), libraryText: text };
  await fs.writeFile(filename, JSON.stringify(data)); return data;
}
await workspace(path.join(root, '根曲.rootsound')); await workspace(path.join(folder, '子曲.ROOTSOUND'));
await workspace(path.join(deep, '深曲.rootsound')); await fs.writeFile(path.join(root, '损坏.rootsound'), 'invalid');
const track = delay => { const b = [...(delay ? [0x83, 0x60] : [0]), 0x90, 60, 96, 0x83, 0x60, 0x80, 60, 0, 0, 255, 47, 0]; return [...Buffer.from('MTrk'), 0, 0, 0, b.length, ...b]; };
const midi = Buffer.from([...Buffer.from('MThd'), 0, 0, 0, 6, 0, 1, 0, 2, 1, 0xe0, ...track(480), ...track(0)]);
const midiPath = path.join(folder, '参考.MID'); await fs.writeFile(midiPath, midi);
const legacy = path.join(root, '旧歌曲'); await fs.mkdir(legacy);
await fs.writeFile(path.join(legacy, 'project.json'), JSON.stringify({ format: 'RootSoundWorkspace', version: 1, id: randomUUID(), name: '旧歌曲', createdAtUtc: new Date().toISOString() }));
await fs.writeFile(path.join(legacy, 'materials.json'), libraryText);
await fs.mkdir(path.join(root, '.rootsound-create-test.tmp')); await workspace(path.join(root, '.rootsound-create-test.tmp', '暂存.rootsound'));
const outside = path.join(installation, 'outside'); await fs.mkdir(outside); await fs.writeFile(path.join(outside, '外部.mid'), midi);
await fs.symlink(outside, path.join(root, '外部链接'), process.platform === 'win32' ? 'junction' : 'dir');

let sequence = 0, checks = 0; const details = [];
function check(value, label) { assert(value, label); checks++; }
function hostAt(directory) {
  const assembly = path.resolve(process.argv[2] ?? '.test-output/library-folders/after-host/RootSound.Host.dll');
  const processHost = spawn('dotnet', [assembly, directory], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  const lines = createInterface({ input: processHost.stdout }); let error = ''; processHost.stderr.on('data', b => { error += b; });
  return {
    async raw(method, args = []) {
      const next = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('File service timeout: ' + method + error)), 30000);
        lines.once('line', line => { clearTimeout(timeout); resolve(line); });
      });
      processHost.stdin.write(JSON.stringify({ id: ++sequence, method, args }) + '\n');
      return JSON.parse(await next).result;
    },
    async call(method, args = []) { return JSON.parse(await this.raw(method, args)); },
    async close() { processHost.stdin.end(); await new Promise(resolve => processHost.once('exit', resolve)); lines.close(); },
  };
}
const host = hostAt(installation);
try {
  const top = (await host.call('project.Browse')).page;
  check(top.path === root && top.parent === undefined, 'root page');
  check(top.entries.some(e => e.kind === 'folder' && e.name === 'my music'), 'folder visible');
  check(!top.entries.some(e => e.name === '深曲' || e.name === '参考'), 'no recursive flattening');
  check(!top.entries.some(e => e.name === '外部链接' || e.name === '损坏' || e.name.startsWith('.rootsound-')), 'links, bad projects and staging excluded');
  check(top.entries.some(e => e.kind === 'project' && e.name === '旧歌曲'), 'legacy folder stays a project');
  const child = (await host.call('project.Browse', [folder])).page;
  check(child.parent === root && child.entries.length === 3, 'child lists direct content');
  check(child.entries.some(e => e.kind === 'midi' && e.path === midiPath), 'MIDI visible');
  check(child.entries.some(e => e.kind === 'project' && e.name === '子曲'), 'filename title and uppercase extension');
  check((await host.call('project.Browse', [outside])).status === 'error', 'outside folder rejected');
  check((await host.call('project.Browse', [path.join(root, '外部链接')])).status === 'error', 'linked navigation rejected');
  check((await host.call('project.OpenKnown', [path.join(outside, '外部.mid')])).status === 'error', 'outside MIDI cannot masquerade as a library item');
  const port = createDesktopProjectDirectories(Object.fromEntries(['Read', 'Create', 'List', 'Browse', 'OpenKnown', 'OpenDocument', 'Inspect', 'Rename', 'Delete', 'Exit']
    .map(name => [name, (...args) => host.raw('project.' + name, args)])));
  const selected = child.entries.find(e => e.kind === 'project');
  check((await port.open(selected.path)).status === 'opened', 'nested project opens');
  await port.exit('discard');
  let entered = 0;
  const setup = createProjectSetup(port, () => { entered++; });
  const renamed = await setup.rename(selected, '改名后的子曲');
  check(path.dirname(renamed.path) === folder && renamed.id === selected.id, 'nested rename keeps folder and identity');
  check((await port.browse(folder)).entries.some(e => e.name === '改名后的子曲'), 'rename refreshes cache');
  await setup.remove(renamed);
  check(!(await port.browse(folder)).entries.some(e => e.kind === 'project'), 'nested delete refreshes page');
  await setup.open(midiPath);
  check(entered === 1 && (await host.call('project.Read')).current.path === midiPath, 'MIDI opens its original file');
  check((await fs.readFile(midiPath)).equals(midi), 'source MIDI unchanged');
  await port.exit('discard');
  await setup.open(midiPath);
  check((await host.call('project.Read')).current.path === midiPath, 'reopening uses the same source file');
  check((await fs.readFile(midiPath)).equals(midi), 'repeated import leaves source unchanged');
  await port.exit('discard');
  const externalEdit = await workspace(path.join(root, '根曲.rootsound'));
  check((await port.browse(root)).entries.find(e => e.name === '根曲').id === externalEdit.id, 'external edit invalidates header cache');
  details.push({ checks, fixture: installation, sourceMidiSha256: createHash('sha256').update(midi).digest('hex') });
} finally { await host.close(); }

// Read-only timing of the user's current directory. No Open/Create/Save calls.
const actual = hostAt(process.cwd()), timing = [];
try {
  for (const target of ['', '', path.resolve('project/MIDI-20261105T042409Z-1-001'), path.resolve('project/MIDI-20261105T042409Z-1-001/MIDI'), '']) {
    const start = performance.now(), result = await actual.call('project.Browse', [target]);
    timing.push({ folder: target || 'root', milliseconds: Number((performance.now() - start).toFixed(2)), entries: result.page?.entries.length, status: result.status });
  }
} finally { await actual.close(); }
const report = { checks, details, timing, desktopObserved: false, soundDeviceOpened: false };
await fs.writeFile(path.join(evidence, 'native-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
