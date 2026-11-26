import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,unlink} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const {seedBundledProjects,seedForInstallation}=createRequire(import.meta.url)('../desktop/electron/bundled-projects.cjs');

test('bundled projects import once without overwriting existing songs or restoring deliberate deletions',async()=>{
  await mkdir('.test-output/release-seeds',{recursive:true});
  const root=await mkdtemp(path.resolve('.test-output/release-seeds/case-'));
  const source=path.join(root,'seed'),data=path.join(root,'data');await mkdir(source);await mkdir(path.join(data,'project'),{recursive:true});
  await writeFile(path.join(source,'第一首.rootsound'),'bundle A');await writeFile(path.join(source,'同名.rootsound'),'bundle B');
  await writeFile(path.join(data,'project/同名.rootsound'),'user edit');
  await writeFile(path.join(source,'manifest.json'),JSON.stringify({version:1,projects:[{name:'第一首.rootsound'},{name:'同名.rootsound'}]}));
  assert.deepEqual(await seedBundledProjects(source,data),{copied:1,skipped:1});
  assert.equal(await readFile(path.join(data,'project/第一首.rootsound'),'utf8'),'bundle A');
  assert.equal(await readFile(path.join(data,'project/同名.rootsound'),'utf8'),'user edit');
  await unlink(path.join(data,'project/第一首.rootsound'));
  assert.deepEqual(await seedBundledProjects(source,data),{copied:0,skipped:2});
  await assert.rejects(readFile(path.join(data,'project/第一首.rootsound')),{code:'ENOENT'});
  assert.deepEqual(await seedBundledProjects(path.join(root,'no-seed'),data),{copied:0,skipped:0});
  await writeFile(path.join(source,'manifest.json'),JSON.stringify({version:1,projects:[{name:'../escape.rootsound'}]}));
  await assert.rejects(seedBundledProjects(source,data),/名称无效/);
});

test('current demo manifest preserves the folder, nested files, existing work and deletions', async () => {
  await mkdir('.test-output/release-seeds', { recursive: true });
  const root = await mkdtemp(path.resolve('.test-output/release-seeds/demo-'));
  const source = path.join(root, 'seed'), data = path.join(root, 'data');
  const demo = path.join(data, 'project', '演示项目');
  await mkdir(path.join(source, '子目录'), { recursive: true });
  await mkdir(demo, { recursive: true });
  await writeFile(path.join(source, '子目录/示例.rootsound'), 'demo');
  await writeFile(path.join(source, '已有.rootsound'), 'bundled');
  await writeFile(path.join(demo, '已有.rootsound'), 'user edit');
  const manifest = path.join(source, 'manifest.json');
  await writeFile(manifest, JSON.stringify({ version: 2, projects: [{ name: '子目录/示例.rootsound' }, { name: '已有.rootsound' }] }));
  assert.deepEqual(await seedBundledProjects(source, data), { copied: 1, skipped: 1 });
  assert.equal(await readFile(path.join(demo, '子目录/示例.rootsound'), 'utf8'), 'demo');
  assert.equal(await readFile(path.join(demo, '已有.rootsound'), 'utf8'), 'user edit');
  await unlink(path.join(demo, '子目录/示例.rootsound'));
  assert.deepEqual(await seedBundledProjects(source, data), { copied: 0, skipped: 2 });
  await assert.rejects(readFile(path.join(demo, '子目录/示例.rootsound')), { code: 'ENOENT' });
  await writeFile(manifest, JSON.stringify({ version: 2, projects: [{ name: '子目录/../逃逸.rootsound' }] }));
  await assert.rejects(seedBundledProjects(source, data), /名称无效/);
});


test('installed startup never writes to any existing project directory, including empty directories', async () => {
  const root = await mkdtemp(path.resolve('.test-output/release-seeds/install-'));
  const source = path.join(root, 'seed');
  await mkdir(source);
  await writeFile(path.join(source, 'demo.rootsound'), 'bundled demo');
  await writeFile(path.join(source, 'manifest.json'), JSON.stringify({ version: 2, projects: [{ name: 'demo.rootsound' }] }));
  const empty = path.join(root, 'empty-directory');
  await mkdir(path.join(empty, 'project'), { recursive: true });
  assert.deepEqual(await seedForInstallation(source, empty), { copied: 0, skipped: 0 });
  await assert.rejects(readFile(path.join(empty, 'project/演示项目/demo.rootsound')), { code: 'ENOENT' });
  for (const populated of [false, true]) {
    const data = path.join(root, populated ? 'populated' : 'empty');
    await mkdir(path.join(data, 'project/演示项目'), { recursive: true });
    if (populated) await writeFile(path.join(data, 'project/演示项目/demo.rootsound'), 'user music');
    assert.deepEqual(await seedForInstallation(source, data), { copied: 0, skipped: 0 });
    if (populated) assert.equal(await readFile(path.join(data, 'project/演示项目/demo.rootsound'), 'utf8'), 'user music');
    else await assert.rejects(readFile(path.join(data, 'project/演示项目/demo.rootsound')), { code: 'ENOENT' });
    await assert.rejects(readFile(path.join(data, '.bundled-projects.json')), { code: 'ENOENT' });
  }
  const fresh = path.join(root, 'fresh');
  assert.deepEqual(await seedForInstallation(source, fresh), { copied: 1, skipped: 0 });
  await unlink(path.join(fresh, 'project/演示项目/demo.rootsound'));
  assert.deepEqual(await seedForInstallation(source, fresh), { copied: 0, skipped: 0 });
  await assert.rejects(readFile(path.join(fresh, 'project/演示项目/demo.rootsound')), { code: 'ENOENT' });
});
