import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,unlink} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const {seedBundledProjects}=createRequire(import.meta.url)('../desktop/electron/bundled-projects.cjs');

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
