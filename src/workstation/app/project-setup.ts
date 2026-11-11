import type { ProjectDirectoriesPort, ProjectSetupPort } from '../contracts/project-directory.ts';
import { createMaterialLibrary } from '../modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../modules/song/public.ts';
import { createCoCreationReferenceAdapter } from '../modules/co-creation/public.ts';
import { createSampleReferenceAdapter } from '../modules/sampling/public.ts';
import { ensureProjectMelodyTimbres } from './project-timbres.ts';
import { openMusicDocument, commitMusicDocument } from './music-document.ts';

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
export function createInitialProjectLibrary(input: string, studio = false): string {
  const name = projectName(input);
  let snapshot: string | null = null;
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(),
    createCoCreationReferenceAdapter(), createSampleReferenceAdapter()];
  const library = createMaterialLibrary({ read: () => snapshot, write: text => { snapshot = text; } },
    { project: { rootKind: 'rootsound.song', adapters } });
  const phrases = createPhrasePlayback(library, createTimbrePlayback(library));
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source', initialTrackCount: 7 });
  song.create(); song.rename(name);
  ensureProjectMelodyTimbres(library, song.read().draft!.id, studio);
  const score = createPhraseEditor(library, createTimbrePlayback(library));
  openMusicDocument(library, song, score); commitMusicDocument(library, song, score);
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
  const score = createPhraseEditor(library, createTimbrePlayback(library));
  openMusicDocument(library, song, score); score.rename(name); commitMusicDocument(library, song, score);
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
  song.rename(name);
  const score = createPhraseEditor(library, createTimbrePlayback(library));
  openMusicDocument(library, song, score); score.rename(name); commitMusicDocument(library, song, score);
  return snapshot;
}

export function createProjectSetup(directories: ProjectDirectoriesPort, enter: () => void,
  source?: { read(): string; songDraftId(): string; name?(): string; prepareSave?(target?: 'source' | 'rootsound'): void | Promise<void> }): ProjectSetupPort {
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
      await directories.create(name, location.trim(), createInitialProjectLibrary(name, true));
      enter();
    }),
    async list() {
      if (!directories.list) throw new Error('当前窗口暂不支持列出项目，请重新打开 RootSound。');
      return directories.list();
    },
    ...(directories.browse ? { browse: (path?: string) => directories.browse!(path) } : {}),
    open: path => exclusive(async () => {
      const result = await directories.open(path);
      if (result.status === 'opened') enter();
      else if (result.status === 'document') {
        // Conversion completes before the host switches sessions. Opening never creates a music file.
        if (!directories.openDocument) throw new Error('请重新打开更新后的简乐，以原格式打开音乐文件。');
        const { readMusicFile } = await import('./music-file.ts');
        const imported = readMusicFile(result.bytes, result.name, result.format);
        await directories.openDocument(result, imported.libraryText);
        enter();
      } else if (result.status === 'midi') throw new Error('请关闭旧窗口，重新打开更新后的简乐；MIDI 不再自动转换成工程文件。');
    }),
    remove: selected => exclusive(async () => {
      if (!directories.remove) throw new Error('当前窗口尚不支持删除歌曲，请重新打开 RootSound。');
      return directories.remove(selected);
    }),
    rename: (selected, input) => exclusive(async () => {
      const name = projectName(input);
      if (!directories.inspect || !directories.rename) throw new Error('当前窗口尚不支持库内改名，请重新打开 RootSound。');
      const snapshot = await directories.inspect(selected);
      return directories.rename(snapshot.project, name, renameProjectLibrary(snapshot.libraryText, name), snapshot.token);
    }),
    save: () => exclusive(async () => {
      if (!directories.save) throw new Error('当前窗口尚不支持保存项目，请重新打开 RootSound。');
      await source?.prepareSave?.();
      await directories.save(source?.name?.());
    }),
    async hasUnsavedChanges() {
      const state = await directories.read();
      if (typeof state.hasUnsavedChanges !== 'boolean') throw new Error('当前窗口尚不支持检查未保存修改，请重新打开 RootSound。');
      return state.hasUnsavedChanges;
    },
    exit: mode => exclusive(async () => {
      if (!directories.exit) throw new Error('当前窗口尚不支持退出项目，请重新打开 RootSound。');
      if (mode === 'save') {
        await source?.prepareSave?.();
        await directories.exit('save', source?.name?.());
      } else await directories.exit('discard');
      enter();
    }),
    ...(source ? { saveAs: (input: string, location: string) => exclusive(async () => {
      const name = projectName(input);
      if (!location.trim()) throw new Error('请选择项目的存储位置。');
      await source.prepareSave?.('rootsound');
      const text = createProjectCopyLibrary(source.read(), name, source.songDraftId());
      if (directories.createCopy) await directories.createCopy(name, location.trim(), text);
      else await directories.create(name, location.trim(), text);
      enter();
    }) } : {}),
  };
}

/** A filesystem-safe suggestion derived from the selected source, never a path. */
export function midiProjectName(fileName: string): string {
  let name = fileName.split(/[\\/]/u).at(-1)!.replace(/\.(?:mid|midi)$/iu, '').normalize('NFC')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/gu, '_').trim().replace(/[. ]+$/u, '');
  if (!name || name === '.' || name === '..') name = '导入的 MIDI';
  if (/^(CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])(?:\.|$)/iu.test(name)) name = `导入 ${name}`;
  name = name.slice(0, 80).replace(/[\uD800-\uDBFF]$/u, '').trimEnd().replace(/[. ]+$/u, '');
  return projectName(name);
}
