import type { ProjectDirectoriesPort, ProjectSetupPort } from '../contracts/project-directory.ts';
import { createMaterialLibrary } from '../modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../modules/timbre/public.ts';
import { createPhrasePlayback, createPhraseReferenceAdapter } from '../modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../modules/song/public.ts';
import { createCoCreationReferenceAdapter } from '../modules/co-creation/public.ts';
import { createSampleReferenceAdapter } from '../modules/sampling/public.ts';
import { ensureProjectMelodyTimbres } from './project-timbres.ts';

export function projectName(input: string): string {
  const name = input.trim();
  if (!name) throw new Error('先为歌曲起一个名字吧。');
  if ([...name].length > 80) throw new Error('歌曲名字请控制在 80 个字以内。');
  if (/[\\/:*?"<>|\u0000-\u001f]/u.test(name) || /[. ]$/u.test(name) || name === '.' || name === '..'
    || /^(CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])(?:\.|$)/iu.test(name))
    throw new Error('这个名字不能用于项目文件，请换一个名字。');
  return name;
}

/** Build a fresh named song through its domain, without reading the active library. */
export function createInitialProjectLibrary(input: string): string {
  const name = projectName(input);
  let snapshot: string | null = null;
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(),
    createCoCreationReferenceAdapter(), createSampleReferenceAdapter()];
  const library = createMaterialLibrary({ read: () => snapshot, write: text => { snapshot = text; } },
    { project: { rootKind: 'rootsound.song', adapters } });
  const phrases = createPhrasePlayback(library, createTimbrePlayback(library));
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source', initialTrackCount: 7 });
  song.create(); song.rename(name);
  ensureProjectMelodyTimbres(library, song.read().draft!.id);
  if (snapshot === null) throw new Error('未能准备新歌曲，尚未创建项目文件。');
  return snapshot;
}

export function createProjectCopyLibrary(text: string, input: string, draftId: string): string {
  const name = projectName(input);
  let snapshot = text;
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(),
    createCoCreationReferenceAdapter(), createSampleReferenceAdapter()];
  const library = createMaterialLibrary({ read: () => snapshot, write: value => { snapshot = value; } },
    { project: { rootKind: 'rootsound.song', adapters } });
  const song = createSongEditor(library, createPhrasePlayback(library, createTimbrePlayback(library)), { defaultTempoMode: 'source' });
  song.openDraft(draftId); song.rename(name);
  return snapshot;
}

/** Match startup's selected song draft and rename through its owner, never native JSON surgery. */
export function renameProjectLibrary(text: string, input: string): string {
  const name = projectName(input); let snapshot = text;
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(),
    createCoCreationReferenceAdapter(), createSampleReferenceAdapter()];
  const library = createMaterialLibrary({ read: () => snapshot, write: value => { snapshot = value; } },
    { project: { rootKind: 'rootsound.song', adapters } });
  const song = createSongEditor(library, createPhrasePlayback(library, createTimbrePlayback(library)), { defaultTempoMode: 'source' });
  if (!song.read().draft) throw new Error('这份项目没有可以改名的歌曲，原文件已保留。');
  song.rename(name); return snapshot;
}

export function createProjectSetup(directories: ProjectDirectoriesPort, enter: () => void,
  source?: { read(): string; songDraftId(): string; name?(): string }): ProjectSetupPort {
  let busy = false;
  async function exclusive<T>(action: () => Promise<T>): Promise<T> {
    if (busy) throw new Error('正在处理项目，请稍候。');
    busy = true;
    try { return await action(); } finally { busy = false; }
  }
  return {
    async defaultLocation() { return (await directories.read()).defaultLocation; },
    chooseLocation: current => directories.chooseLocation(current),
    create: (input, location) => exclusive(async () => {
      const name = projectName(input);
      if (!location.trim()) throw new Error('请选择项目的存储位置。');
      await directories.create(name, location.trim(), createInitialProjectLibrary(name));
      enter();
    }),
    async list() {
      if (!directories.list) throw new Error('当前窗口暂不支持列出项目，请重新打开 RootSound。');
      return directories.list();
    },
    open: path => exclusive(async () => {
      const result = await directories.open(path);
      if (result.status === 'opened') enter();
    }),
    remove: selected => exclusive(async () => {
      if (!directories.remove) throw new Error('当前窗口尚不支持删除歌曲，请重新打开 RootSound。');
      await directories.remove(selected);
    }),
    rename: (selected, input) => exclusive(async () => {
      const name = projectName(input);
      if (!directories.inspect || !directories.rename) throw new Error('当前窗口尚不支持库内改名，请重新打开 RootSound。');
      const snapshot = await directories.inspect(selected);
      return directories.rename(snapshot.project, name, renameProjectLibrary(snapshot.libraryText, name), snapshot.token);
    }),
    save: () => exclusive(async () => {
      if (!directories.save) throw new Error('当前窗口尚不支持保存项目，请重新打开 RootSound。');
      await directories.save(source?.name?.());
    }),
    async hasUnsavedChanges() {
      const state = await directories.read();
      if (typeof state.hasUnsavedChanges !== 'boolean') throw new Error('当前窗口尚不支持检查未保存修改，请重新打开 RootSound。');
      return state.hasUnsavedChanges;
    },
    exit: mode => exclusive(async () => {
      if (!directories.exit) throw new Error('当前窗口尚不支持退出项目，请重新打开 RootSound。');
      await directories.exit(mode, source?.name?.());
      enter();
    }),
    ...(source ? { saveAs: (input: string, location: string) => exclusive(async () => {
      const name = projectName(input);
      if (!location.trim()) throw new Error('请选择项目的存储位置。');
      const text = createProjectCopyLibrary(source.read(), name, source.songDraftId());
      await directories.create(name, location.trim(), text);
      enter();
    }) } : {}),
  };
}
