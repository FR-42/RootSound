const fs = require('node:fs/promises');
const path = require('node:path');

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
  const target = path.join(dataDirectory, 'project'); await fs.mkdir(target, { recursive: true });
  let copied = 0, skipped = 0;
  for (const item of manifest.projects) {
    const name = item.name;
    if (typeof name !== 'string' || path.basename(name) !== name || /[\\/]/.test(name) || !name.endsWith('.rootsound')) throw new Error('随包项目名称无效。');
    if (completed.has(name)) { skipped++; continue; }
    try { await fs.copyFile(path.join(source, name), path.join(target, name), fs.constants.COPYFILE_EXCL); copied++; }
    catch (error) { if (error.code !== 'EEXIST') throw error; skipped++; }
    completed.add(name);
    const temporary = marker + '.tmp';
    await fs.writeFile(temporary, JSON.stringify({ version: 1, files: [...completed] })); await fs.rename(temporary, marker);
  }
  return { copied, skipped };
}
module.exports = { seedBundledProjects };
