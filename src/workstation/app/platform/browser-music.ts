import type { MaterialStorage } from '../../contracts/content.ts';
import { MAX_PROJECT_FILE_BYTES } from '../../contracts/files.ts';
import type { EditableFileSource, ProjectDirectoriesPort, ProjectDirectory } from '../../contracts/project-directory.ts';
import { createMaterialLibrary } from '../../modules/materials/public.ts';
import { musicFileFormat } from '../music-interchange-model.ts';
import { projectName } from '../project-setup.ts';
import { createBrowserAudioFiles } from './browser-files.ts';
import { createBrowserTimbreFiles } from './timbre-files.ts';

const directory = 'project';
const acceptMusic = '.rootsound,.rsproject,.mid,.midi,.smf,.kar,.rmi,.musicxml,.xml,.mxl';

interface SavedMusic {
  project: ProjectDirectory;
  text: string;
  extension: string;
  createdAtUtc: string;
  source?: EditableFileSource;
}
interface OpenMusic extends SavedMusic {
  baseline: string;
  pendingBytes?: Uint8Array;
}

function pickMusicFile(): Promise<File | undefined> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = acceptMusic; input.hidden = true;
    function finish(file?: File) { input.remove(); resolve(file); }
    input.addEventListener('cancel', () => finish(), { once: true });
    input.addEventListener('change', () => finish(input.files?.[0]), { once: true });
    document.body.append(input);
    try { input.click(); } catch (error) { input.remove(); reject(error); }
  });
}

function snapshot(text: string): string {
  const library = JSON.parse(text);
  delete library.editHistory;
  delete library.transactionHistory;
  return JSON.stringify(library);
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = name; link.hidden = true;
  try { document.body.append(link); link.click(); }
  finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
}

export function createBrowserMusicWorkspace(example: { name: string; text: string }) {
  const saved = new Map<string, SavedMusic>();
  let current: OpenMusic | undefined;
  const audioFiles = createBrowserAudioFiles(), timbreFiles = createBrowserTimbreFiles();

  function makeRecord(name: string, text: string, extension = '.rootsound', source?: EditableFileSource): SavedMusic {
    return { project: { id: crypto.randomUUID(), name, path: `${directory}/${name}${extension}`, ...(source ? { format: source.format } : {}) },
      text, extension, createdAtUtc: new Date().toISOString(), source };
  }
  function activate(record: SavedMusic) {
    current = { ...record, baseline: record.text };
    return record.project;
  }
  function readRecord(project: ProjectDirectory) {
    const record = saved.get(project.path);
    if (record?.project.id !== project.id) throw new Error('歌曲已改变，请重新打开。');
    return record;
  }
  function checkPath(path: string, id?: string) {
    const record = saved.get(path);
    if (record && record.project.id !== id) throw new Error('乐曲库已有同名文件，请换一个名称。');
  }
  function writeFile(record: SavedMusic, bytes?: Uint8Array) {
    const file = bytes
      ? new Blob([new Uint8Array(bytes).buffer], { type: 'application/octet-stream' })
      : new Blob([JSON.stringify({ format: 'RootSoundWorkspace', version: 2, id: record.project.id,
        name: record.project.name, createdAtUtc: record.createdAtUtc, libraryText: record.text })], { type: 'application/json' });
    if (file.size > MAX_PROJECT_FILE_BYTES) throw new Error('工程超出 32 MiB，尚未发起下载。');
    download(file, record.project.name + record.extension);
  }
  function saveCurrent(name?: string) {
    if (!current) throw new Error('请先打开一首歌曲。');
    const original = current.project;
    const nextName = projectName(name ?? original.name);
    const path = `${directory}/${nextName}${current.extension}`;
    checkPath(path, original.id);
    const project = { ...original, name: nextName, path };
    const text = snapshot(current.text);
    const bytes = current.pendingBytes;
    const source = current.source;
    if (source && !bytes) throw new Error('尚未准备原格式内容。');
    const record = { project, text, extension: current.extension, createdAtUtc: current.createdAtUtc,
      source: source && { ...source, path, name: nextName + current.extension, bytes: bytes!, libraryText: text } };
    writeFile(record, bytes);
    saved.delete(original.path); saved.set(path, record);
    Object.assign(current, { project, source: record.source, baseline: current.text, pendingBytes: undefined });
    return project;
  }
  function create(name: string, location: string, text: string, copy: boolean) {
    if (location !== directory) throw new Error('浏览器工程的位置为 project。');
    const record = makeRecord(name, snapshot(text));
    checkPath(record.project.path);
    if (copy) writeFile(record);
    saved.set(record.project.path, record);
    return activate(record);
  }

  const seed = makeRecord(example.name, snapshot(example.text));
  saved.set(seed.project.path, seed);
  const dirty = () => !!current && current.text !== current.baseline;
  const projectDirectories: ProjectDirectoriesPort = {
    async read() { return { defaultLocation: directory, current: current?.project, hasUnsavedChanges: dirty() }; },
    async chooseLocation() { return { status: 'chosen', path: directory }; },
    async create(name, location, text) { return create(name, location, text, false); },
    async createCopy(name, location, text) { return create(name, location, text, true); },
    async browse() {
      return { root: directory, path: directory, entries: Array.from(saved.values(), ({ project }) => ({
        kind: project.format === 'midi' ? 'midi' : project.format ? 'document' : 'project', ...project,
      })) };
    },
    async remove(project) { readRecord(project); saved.delete(project.path); },
    async inspect(project) { const record = readRecord(project); return { project: record.project, libraryText: record.text, token: record.project.id }; },
    async rename(project, name, libraryText, token) {
      const record = readRecord(project);
      if (token !== record.project.id) throw new Error('歌曲已改变，请重新打开。');
      const path = `${directory}/${name}${record.extension}`;
      checkPath(path, project.id);
      const next = { ...record, text: snapshot(libraryText), project: { ...project, name, path } };
      saved.delete(project.path); saved.set(path, next);
      return next.project;
    },
    async open(path) {
      if (path !== undefined) {
        const record = saved.get(path);
        if (!record) throw new Error('找不到所选歌曲。');
        return { status: 'opened', project: activate(record) };
      }
      const file = await pickMusicFile();
      if (!file) return { status: 'cancelled' };
      if (file.size > MAX_PROJECT_FILE_BYTES) throw new Error('音乐文件超出 32 MiB。');
      const format = musicFileFormat(file.name);
      const bytes = await file.arrayBuffer();
      if (format) return { status: 'document', format, name: file.name, path: file.name,
        token: crypto.randomUUID(), bytes: new Uint8Array(bytes) };
      if (!file.name.toLowerCase().endsWith('.rootsound')) throw new Error('请选择简乐、MIDI 或 MusicXML 文件。');
      const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      const envelope = JSON.parse(decoded);
      const text = envelope.format === 'RootSoundWorkspace' && envelope.version === 2 ? envelope.libraryText : decoded;
      if (typeof text !== 'string' || !createMaterialLibrary({ read: () => text, write: () => {} }).listDrafts().some(draft => draft.kind === 'rootsound.song'))
        throw new Error('工程缺少可编辑的歌曲。');
      const name = projectName([...file.name.slice(0, -'.rootsound'.length)].slice(0, 80).join(''));
      const record = makeRecord(name, text);
      const previous = saved.get(record.project.path);
      if (previous && previous.project.id === envelope.id) record.project.id = previous.project.id;
      return { status: 'opened', project: activate(record) };
    },
    async openDocument(source, text) {
      const extension = source.name.match(/\.[^.]+$/u)![0];
      const name = projectName([...source.name.slice(0, -extension.length)].slice(0, 80).join(''));
      const record = makeRecord(name, text, extension, { ...source, libraryText: text });
      const previous = saved.get(record.project.path);
      if (previous?.project.format === source.format) record.project.id = previous.project.id;
      return activate(record);
    },
    async readDocument() { return current?.source; },
    async prepareDocumentSave(bytes) {
      if (!current?.source) throw new Error('请先打开原格式音乐。');
      current.pendingBytes = bytes;
    },
    async finishLoading() { if (current) current.baseline = current.text; },
    async save(name) { return saveCurrent(name); },
    async exit(mode, name) { if (mode === 'save') saveCurrent(name); current = undefined; },
  };

  return { dirty, platform() {
    const session = current;
    const storage: MaterialStorage = {
      read: () => session?.text ?? null,
      write(value) { if (session) session.text = value; },
    };
    return { storage, projectDirectories, audioFiles, timbreFiles };
  } };
}
