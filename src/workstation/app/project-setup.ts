import type { EditableFileSource, ProjectDirectoriesPort, ProjectSetupPort } from '../contracts/project-directory.ts';
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
export function createInitialProjectLibrary(input: string, instrumentKeys?: readonly string[]): string {
  const name = projectName(input);
  let snapshot: string | null = null;
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(),
    createCoCreationReferenceAdapter(), createSampleReferenceAdapter()];
  const library = createMaterialLibrary({ read: () => snapshot, write: text => { snapshot = text; } },
    { project: { rootKind: 'rootsound.song', adapters } });
  const phrases = createPhrasePlayback(library, createTimbrePlayback(library));
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source', initialTrackCount: 7 });
  song.create(); song.rename(name);
  ensureProjectMelodyTimbres(library, song.read().draft!.id, instrumentKeys);
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

export async function createProjectCopyLibraryAsync(text: string, name: string, draftId: string): Promise<string> {
  if (typeof Worker !== 'function') return createProjectCopyLibrary(text, name, draftId);
  const worker = new Worker(new URL('./project-copy-worker.ts', import.meta.url), { type: 'module' });
  try {
    return await new Promise<string>((resolve, reject) => {
      worker.onmessage = ({ data }) => {
        if (typeof data?.error === 'string') reject(new Error(data.error));
        else if (typeof data?.text === 'string') resolve(data.text);
        else reject(new Error('另存为数据准备失败，请重试。'));
      };
      worker.onerror = () => reject(new Error('另存为数据准备失败，请重试。'));
      worker.onmessageerror = () => reject(new Error('另存为数据准备失败，请重试。'));
      worker.postMessage({ text, name, draftId });
    });
  } finally { worker.terminate(); }
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

let durationWorker: Worker | undefined;
let durationRequest = 0;
const pendingDurations = new Map<number, (duration: number | undefined) => void>();
async function readDuration(source: string | EditableFileSource): Promise<number | undefined> {
  if (typeof Worker !== 'function') return (await import('./library-duration-worker.ts')).measureLibraryDuration(source);
  if (!durationWorker) {
    durationWorker = new Worker(new URL('./library-duration-worker.ts', import.meta.url), { type: 'module' });
    const failed = () => {
      durationWorker?.terminate(); durationWorker = undefined;
      for (const resolve of pendingDurations.values()) resolve(undefined);
      pendingDurations.clear();
    };
    durationWorker.onerror = event => { event.preventDefault(); failed(); };
    durationWorker.onmessageerror = failed;
    durationWorker.onmessage = (event: MessageEvent<{ id: number; duration?: number }>) => {
      const { id, duration } = event.data;
      const resolve = pendingDurations.get(id);
      pendingDurations.delete(id);
      resolve?.(duration);
    };
  }
  const worker = durationWorker;
  return new Promise((resolve, reject) => {
    const id = ++durationRequest;
    const transfer = typeof source !== 'string' && source.bytes.buffer instanceof ArrayBuffer ? [source.bytes.buffer] : [];
    pendingDurations.set(id, resolve);
    try { worker.postMessage({ id, source }, transfer); }
    catch (error) { pendingDurations.delete(id); reject(error); }
  });
}

export function createProjectSetup(directories: ProjectDirectoriesPort, enter: (savedDetails?: boolean) => void,
  source?: { read(): string; songDraftId(): string; name?(): string; hasDeferredChanges?(): boolean;
    flushDraft?(): void | Promise<void>; prepareSave?(target?: 'source' | 'rootsound'): void | Promise<void>; renamed?(name: string): void }): ProjectSetupPort {
  let busy = false;
  let guidePreparation: Promise<import('../contracts/project-directory.ts').ProjectDirectory> | undefined;
  async function exclusive<T>(action: () => Promise<T>): Promise<T> {
    if (busy) throw new Error('正在处理项目，请稍候。');
    busy = true;
    try { return await action(); } finally { busy = false; }
  }
  return {
    prepareGuideProject(rememberedId) {
      return guidePreparation ??= exclusive(async () => {
        const { prepareGuideProject } = await import('./guide-project.ts');
        return prepareGuideProject(directories, rememberedId);
      }).finally(() => { guidePreparation = undefined; });
    },
    async defaultLocation() { return (await directories.read()).defaultLocation; },
    chooseLocation: current => directories.chooseLocation(current),
    create: (input, location) => exclusive(async () => {
      const name = projectName(input);
      if (!location.trim()) throw new Error('请选择项目的存储位置。');
      await directories.create(name, location.trim(), createInitialProjectLibrary(name));
      enter();
    }),
    ...(directories.startNew ? { startNew: (input: string, location: string) => exclusive(async () => {
      const name = projectName(input);
      if (!location.trim()) throw new Error('请选择项目的存储位置。');
      await directories.startNew!(name, location.trim(), createInitialProjectLibrary(name));
      enter();
    }) } : {}),
    async list() {
      if (!directories.list) throw new Error('当前窗口暂不支持列出项目，请重新打开 RootSound。');
      return directories.list();
    },
    ...(directories.chooseLibraryFolder ? { chooseLibraryFolder: (current: string) => exclusive(() => directories.chooseLibraryFolder!(current)) } : {}),
    ...(directories.readLibraryScore ? { async readLibraryDuration(path: string) {
      const source = await directories.readLibraryScore!(path);
      return source === undefined ? undefined : readDuration(source);
    } } : {}),
    ...(directories.browse ? { browse: (path?: string) => directories.browse!(path) } : {}),
    ...(directories.createFolder ? { createFolder: (path: string, name: string) => exclusive(() => directories.createFolder!(path, projectName(name))) } : {}),
    ...(directories.renameEntry ? { renameEntry: (path: string, input: string) => exclusive(async () => {
      const name = projectName(input);
      const current = (await directories.read()).current;
      await directories.renameEntry!(path, name);
      if (current?.path === path) source?.renamed?.(name);
    }) } : {}),
    ...(directories.removeEntry ? { removeEntry: (path: string) => exclusive(() => directories.removeEntry!(path)) } : {}),
    ...(directories.transferEntry ? { transferEntry: (path: string, directory: string, cut: boolean) =>
      exclusive(() => directories.transferEntry!(path, directory, cut)) } : {}),
    ...(directories.undoEntryTransfer ? { undoEntryTransfer: () => exclusive(() => directories.undoEntryTransfer!()) } : {}),
    ...(directories.reveal ? { reveal: (entry: Parameters<NonNullable<ProjectDirectoriesPort['reveal']>>[0]) => exclusive(() => directories.reveal!(entry)) } : {}),
    ...(source && directories.browse ? { async readSaveSource() { return (await directories.read()).current; } } : {}),
    open: path => exclusive(async () => {
      if (source?.hasDeferredChanges?.()) await source.flushDraft?.();
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
      const renamed = await directories.rename(snapshot.project, name, renameProjectLibrary(snapshot.libraryText, name), snapshot.token);
      if ((await directories.read()).current?.id === selected.id) source?.renamed?.(name);
      return renamed;
    }),
    renameCurrent: input => exclusive(async () => {
      const name = projectName(input);
      const selected = (await directories.read()).current;
      if (!selected) throw new Error('先打开一个音乐项目。');
      if (selected.pendingSave) return;
      if (!directories.inspect || !directories.rename) throw new Error('当前窗口尚不支持改名，请重新打开 RootSound。');
      const snapshot = await directories.inspect(selected);
      await directories.rename(snapshot.project, name, renameProjectLibrary(snapshot.libraryText, name), snapshot.token);
    }),
    save: () => exclusive(async () => {
      if (!directories.save) throw new Error('当前窗口尚不支持保存项目，请重新打开 RootSound。');
      await source?.prepareSave?.();
      await directories.save(source?.name?.());
    }),
    async hasUnsavedChanges() {
      if (source?.hasDeferredChanges?.()) return true;
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
    ...(source ? { saveAs: (input: string, location: string, mode: 'edit' | 'exit' | 'close' | 'details' = 'edit') => exclusive(async () => {
      const name = projectName(input);
      if (!location.trim()) throw new Error('请选择项目的存储位置。');
      await source.prepareSave?.('rootsound');
      const text = await createProjectCopyLibraryAsync(source.read(), name, source.songDraftId());
      if (directories.createCopy) await directories.createCopy(name, location.trim(), text);
      else await directories.create(name, location.trim(), text);
      if (mode === 'exit') await directories.exit?.('discard');
      if (mode !== 'close') enter(mode === 'details');
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
