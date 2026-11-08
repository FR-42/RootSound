const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

/** Import bundled examples once; never overwrite work or revive deleted examples. */
async function seedBundledProjects(source, dataDirectory) {
  const manifest = await fs.readFile(path.join(source, 'manifest.json'), 'utf8').then(JSON.parse).catch(error => {
    if (error.code === 'ENOENT') return undefined; throw error;
  });
  if (!manifest) return { copied: 0, skipped: 0 };
  const marker = path.join(dataDirectory, '.bundled-projects.json');
  let previous;
  try { previous = JSON.parse(await fs.readFile(marker, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw new Error('随包项目的导入记录无法读取，已有项目未改动。'); }
  const completed = new Set(previous?.files ?? []);
  if (![1, 2].includes(manifest.version) || !Array.isArray(manifest.projects)) throw new Error('随包项目清单无效。');
  const folder = manifest.version === 2 ? '演示项目' : '';
  const target = path.join(dataDirectory, 'project', folder);
  await fs.mkdir(target, { recursive: true });
  let copied = 0, skipped = 0;
  for (const item of manifest.projects) {
    const name = item.name;
    const parts = typeof name === 'string' ? name.split('/') : [];
    if (!parts.length || (!folder && parts.length !== 1) || parts.some(part => !part || part === '.' || part === '..' || /[\\:\u0000-\u001f]/u.test(part))
      || !name.endsWith('.rootsound')) throw new Error('随包项目名称无效。');
    const key = folder ? `${folder}/${name}` : name;
    if (completed.has(key)) { skipped++; continue; }
    const destination = path.join(target, ...parts);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    try { await fs.copyFile(path.join(source, ...parts), destination, fs.constants.COPYFILE_EXCL); copied++; }
    catch (error) { if (error.code !== 'EEXIST') throw error; skipped++; }
    completed.add(key);
    const temporary = `${marker}.${randomUUID()}.tmp`;
    await fs.writeFile(temporary, JSON.stringify({ version: 1, files: [...completed] }));
    await fs.rename(temporary, marker);
  }
  return { copied, skipped };
}
module.exports = { seedBundledProjects };
