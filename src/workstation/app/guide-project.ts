import type { ProjectDirectoriesPort, ProjectDirectory, ProjectLibraryEntry } from '../contracts/project-directory.ts';
import template from './templates/first-creation.json' with { type: 'json' };
import { createProjectCopyLibrary } from './project-setup.ts';

export async function prepareGuideProject(directories: ProjectDirectoriesPort, rememberedId?: string): Promise<ProjectDirectory> {
  if (!directories.browse || !directories.createDetached || !directories.inspect) throw new Error('当前程序无法准备引导项目，请重新打开更新后的简乐。');
  const root = (await directories.read()).defaultLocation;
  const page = await directories.browse(root);
  let entries: ProjectLibraryEntry[] = [...page.entries];
  const demos = page.entries.find(entry => entry.kind === 'folder' && entry.name === '演示项目');
  if (demos) entries = entries.concat((await directories.browse(demos.path)).entries);
  const candidates = entries.filter((entry): entry is { kind: 'project' } & ProjectDirectory =>
    entry.kind === 'project' && (entry.id === rememberedId || entry.id === template.id));
  candidates.sort((a, b) => Number(b.id === rememberedId) - Number(a.id === rememberedId));
  for (const candidate of candidates) {
    try {
      const snapshot = await directories.inspect(candidate);
      const library = JSON.parse(snapshot.libraryText) as { drafts?: { kind?: string }[] };
      if (library.drafts?.some(draft => draft.kind === 'rootsound.phrase')) return snapshot.project;
    } catch { }
  }
  const names = new Set(page.entries.map(entry => entry.name.replace(/\.rootsound$/iu, '').toLocaleLowerCase()));
  let name = template.name;
  if (names.has(name.toLocaleLowerCase())) {
    name = `${template.name}（引导）`;
    for (let index = 2; names.has(name.toLocaleLowerCase()); index++) name = `${template.name}（引导 ${index}）`;
  }
  const library = JSON.parse(template.libraryText) as { drafts: { id: string; kind: string }[] };
  const song = library.drafts.find(draft => draft.kind === 'rootsound.song');
  if (!song) throw new Error('内置引导模板不完整，请重新安装简乐。');
  return directories.createDetached(name, page.root, createProjectCopyLibrary(template.libraryText, name, song.id));
}
