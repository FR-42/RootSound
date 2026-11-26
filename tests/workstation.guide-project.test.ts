import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareGuideProject } from '../src/workstation/app/guide-project.ts';
import template from '../src/workstation/app/templates/first-creation.json' with { type: 'json' };
import type { ProjectDirectoriesPort, ProjectDirectory, ProjectLibraryEntry } from '../src/workstation/contracts/project-directory.ts';

function fixture() {
  const root = 'D:/Music/project';
  const files = new Map<string, { project: ProjectDirectory; text: string }>();
  const folders = new Set<string>();
  let created = 0;
  let rejectCreation = false;
  const directories: ProjectDirectoriesPort = {
    read: async () => ({ defaultLocation: root }),
    chooseLocation: async () => ({ status: 'cancelled' }),
    create: async () => { throw new Error('must not activate a new session'); },
    open: async () => { throw new Error('must not open a project while preparing'); },
    async browse(path = root) {
      const entries: ProjectLibraryEntry[] = [];
      for (const folder of folders) if (folder.slice(0, folder.lastIndexOf('/')) === path) entries.push({ kind: 'folder', name: folder.split('/').at(-1)!, path: folder });
      for (const { project } of files.values()) if (project.path.slice(0, project.path.lastIndexOf('/')) === path) entries.push({ kind: 'project', ...project });
      return { root, path, entries };
    },
    async inspect(project) {
      const file = files.get(project.path);
      if (!file) throw new Error('missing');
      return { project: file.project, libraryText: file.text, token: 'current' };
    },
    async createDetached(name, directory, text) {
      if (rejectCreation) throw new Error('没有写入权限');
      assert.equal(directory, root);
      const path = `${directory}/${name}.rootsound`;
      assert(!files.has(path), 'existing file must not be overwritten');
      const project = { id: `practice-${++created}`, name, path };
      files.set(path, { project, text });
      return project;
    },
  };
  return { root, files, folders, directories, count: () => created, fail: () => { rejectCreation = true; } };
}

test('a missing demo library creates an independent root-level guide project with identical music', async () => {
  const f = fixture();
  const project = await prepareGuideProject(f.directories);
  assert.equal(project.path, `${f.root}/初次创作.rootsound`);
  assert.notEqual(project.id, template.id);
  const original = JSON.parse(template.libraryText);
  const created = JSON.parse(f.files.get(project.path)!.text);
  const phrase = (library: typeof original) => library.drafts.find((draft: { kind: string }) => draft.kind === 'rootsound.phrase').body;
  assert.deepEqual(phrase(created), phrase(original));
  assert.equal(f.folders.size, 0);
  assert.deepEqual(await prepareGuideProject(f.directories, project.id), project);
  assert.equal(f.count(), 1);
});

test('an existing authentic demo remains untouched and can still be used for the guide', async () => {
  const f = fixture();
  const folder = `${f.root}/演示项目`;
  f.folders.add(folder);
  const project = { id: template.id, name: template.name, path: `${folder}/初次创作.rootsound` };
  f.files.set(project.path, { project, text: template.libraryText });
  assert.deepEqual(await prepareGuideProject(f.directories), project);
  assert.equal(f.files.get(project.path)!.text, template.libraryText);
  assert.equal(f.count(), 0);
  f.files.delete(project.path);
  const replacement = await prepareGuideProject(f.directories, project.id);
  assert.equal(replacement.path, `${f.root}/初次创作.rootsound`);
});

test('a same-name user song is preserved and a guide copy uses another name', async () => {
  const f = fixture();
  const existing = { id: 'user', name: template.name, path: `${f.root}/初次创作.rootsound` };
  f.files.set(existing.path, { project: existing, text: 'user-owned data' });
  const project = await prepareGuideProject(f.directories);
  assert.equal(project.path, `${f.root}/初次创作（引导）.rootsound`);
  assert.equal(f.files.get(existing.path)!.text, 'user-owned data');
  f.files.delete(project.path);
  assert.equal((await prepareGuideProject(f.directories, project.id)).path, project.path);
});

test('creation failure is reported without touching existing work', async () => {
  const f = fixture();
  f.fail();
  await assert.rejects(prepareGuideProject(f.directories), /没有写入权限/);
  assert.equal(f.files.size, 0);
});
