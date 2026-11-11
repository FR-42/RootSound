import type { EditableFileFormat, EditableFileSource, ProjectDirectoriesPort, ProjectDirectory, ProjectLibraryEntry, ProjectLibraryPage } from '../../contracts/project-directory.ts';
import { MAX_MIDI_FILE_BYTES } from '../../contracts/midi.ts';

export interface NativeProjectDirectoriesBridge {
  Read(): Promise<unknown>;
  ChooseLocation(current: string): Promise<unknown>;
  Create(name: string, location: string, libraryText: string): Promise<unknown>;
  CreateCopy?(name: string, location: string, libraryText: string): Promise<unknown>;
  CreateDetached?(name: string, location: string, libraryText: string): Promise<unknown>;
  Open(): Promise<unknown>;
  List?(): Promise<unknown>;
  Browse?(path: string): Promise<unknown>;
  CreateLibraryFolder?(path: string, name: string): Promise<unknown>;
  RenameLibraryEntry?(path: string, name: string): Promise<unknown>;
  DeleteLibraryEntry?(path: string): Promise<unknown>;
  Delete?(path: string, expectedId: string): Promise<unknown>;
  Inspect?(path: string, expectedId: string): Promise<unknown>;
  Rename?(path: string, expectedId: string, name: string, libraryText: string, token: string): Promise<unknown>;
  OpenKnown?(path: string): Promise<unknown>;
  Save?(name?: string): Promise<unknown>;
  FinishLoading?(): Promise<unknown>;
  OpenDocument?(path: string, token: string, libraryText: string): Promise<unknown>;
  ReadDocument?(): Promise<unknown>;
  Exit?(mode: string, name?: string): Promise<unknown>;
}

function fail(message = '项目服务返回无效结果，请关闭旧窗口后重新打开 RootSound。'): never { throw new Error(message); }
async function call(action: () => Promise<unknown>): Promise<Record<string, unknown>> {
  let raw: unknown;
  try { raw = await action(); }
  catch { return fail('无法连接本机项目服务，请关闭旧窗口后重新打开 RootSound。'); }
  let value: unknown;
  try { value = typeof raw === 'string' ? JSON.parse(raw) : undefined; } catch { return fail(); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail();
  const result = value as Record<string, unknown>;
  if (result.status === 'error') return fail(typeof result.message === 'string' && result.message.trim() ? result.message : '项目操作未能完成。');
  return result;
}
function project(value: unknown): ProjectDirectory {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail();
  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'string' || !item.id.trim() || typeof item.name !== 'string' || !item.name.trim()
    || typeof item.path !== 'string' || !item.path.trim()) return fail();
  return { id: item.id, name: item.name, path: item.path, ...(item.format ? { format: fileFormat(item.format) } : {}) };
}

function fileFormat(value: unknown): EditableFileFormat {
  if (value === 'midi' || value === 'musicxml' || value === 'mxl' || value === 'rsproject') return value;
  return fail('不支持这种音乐文件格式。');
}
function documentSource(result: Record<string, unknown>): EditableFileSource {
  if (typeof result.name !== 'string' || typeof result.path !== 'string' || typeof result.token !== 'string'
    || typeof result.base64 !== 'string' || result.base64.length > 44739244) return fail();
  let binary: string; try { binary = atob(result.base64); } catch { return fail(); }
  return { name: result.name, path: result.path, format: fileFormat(result.format), token: result.token,
    bytes: Uint8Array.from(binary, character => character.charCodeAt(0)), ...(typeof result.libraryText === 'string' ? { libraryText: result.libraryText } : {}) };
}

function libraryPage(value: unknown): ProjectLibraryPage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail();
  const page = value as Record<string, unknown>;
  if (typeof page.root !== 'string' || !page.root.trim() || typeof page.path !== 'string' || !page.path.trim()
    || !Array.isArray(page.entries)) return fail();
  const normalized = (path: string) => path.replaceAll('\\', '/').replace(/\/+$/u, '').toLocaleLowerCase('en-US');
  const root = normalized(page.root), current = normalized(page.path);
  if (current !== root && !current.startsWith(root + '/')) return fail();
  if (page.parent !== undefined && (typeof page.parent !== 'string' || normalized(page.parent) !== current.slice(0, current.lastIndexOf('/')))) return fail();
  if (current === root ? page.parent !== undefined : page.parent === undefined) return fail();
  const entries = page.entries.map((raw): ProjectLibraryEntry => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fail();
    const entry = raw as Record<string, unknown>;
    if (!['folder', 'project', 'midi', 'document'].includes(String(entry.kind)) || typeof entry.name !== 'string' || !entry.name.trim()
      || typeof entry.path !== 'string' || normalized(entry.path).slice(0, normalized(entry.path).lastIndexOf('/')) !== current) return fail();
    if (entry.kind === 'project') return { kind: 'project', ...project(entry) };
    return entry.kind === 'midi' || entry.kind === 'document' ? { kind: entry.kind, name: entry.name, path: entry.path }
      : { kind: 'folder', name: entry.name, path: entry.path };
  });
  if (new Set(entries.map(entry => normalized(entry.path))).size !== entries.length) return fail();
  return { root: page.root, path: page.path, ...(page.parent === undefined ? {} : { parent: page.parent as string }), entries };
}

function midiBytes(name: unknown, base64: unknown): { name: string; bytes: Uint8Array } {
  if (typeof name !== 'string' || !name.trim() || name.length > 255 || /[\\/\u0000-\u001f]/u.test(name) || !/\.midi?$/iu.test(name))
    return fail('MIDI 文件名称无效，尚未创建歌曲项目。');
  if (typeof base64 !== 'string' || !base64 || base64.length > Math.ceil(MAX_MIDI_FILE_BYTES / 3) * 4
    || base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/u.test(base64))
    return fail('MIDI 文件传输内容无效或超过 10 MiB，尚未创建歌曲项目。');
  let binary: string;
  try { binary = atob(base64); }
  catch { return fail('MIDI 文件传输内容无法读取，尚未创建歌曲项目。'); }
  if (binary.length < 14 || binary.length > MAX_MIDI_FILE_BYTES || btoa(binary) !== base64)
    return fail('MIDI 文件传输内容无效或超过 10 MiB，尚未创建歌曲项目。');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < bytes.length; index++) bytes[index] = binary.charCodeAt(index);
  const length = new DataView(bytes.buffer).getUint32(4, false);
  if (binary.slice(0, 4) !== 'MThd' || length < 6 || length > bytes.length - 8)
    return fail('这个文件没有有效的 MIDI 文件头，尚未创建歌曲项目。');
  return { name, bytes };
}

export function createDesktopProjectDirectories(bridge: NativeProjectDirectoriesBridge): ProjectDirectoriesPort {
  return {
    async read() {
      const result = await call(() => bridge.Read());
      if (result.status !== 'ready' || typeof result.defaultLocation !== 'string' || !result.defaultLocation.trim()) return fail();
      if (result.hasUnsavedChanges !== undefined && typeof result.hasUnsavedChanges !== 'boolean') return fail();
      if (result.doubleClickIntervalMs !== undefined && (typeof result.doubleClickIntervalMs !== 'number'
        || !Number.isSafeInteger(result.doubleClickIntervalMs) || result.doubleClickIntervalMs <= 0 || result.doubleClickIntervalMs > 10000)) return fail();
      return { defaultLocation: result.defaultLocation, ...(result.current == null ? {} : { current: project(result.current) }),
        ...(result.hasUnsavedChanges === undefined ? {} : { hasUnsavedChanges: result.hasUnsavedChanges }),
        ...(result.doubleClickIntervalMs === undefined ? {} : { doubleClickIntervalMs: result.doubleClickIntervalMs }) };
    },
    async chooseLocation(current) {
      const result = await call(() => bridge.ChooseLocation(current));
      if (result.status === 'cancelled') return { status: 'cancelled' };
      if (result.status !== 'chosen' || typeof result.path !== 'string' || !result.path.trim()) return fail();
      return { status: 'chosen', path: result.path };
    },
    async create(name, location, libraryText) {
      const result = await call(() => bridge.Create(name, location, libraryText));
      if (result.status !== 'created') return fail();
      return project(result.project);
    },
    ...(bridge.CreateCopy ? { async createCopy(name: string, location: string, libraryText: string) {
      const result = await call(() => bridge.CreateCopy!(name, location, libraryText));
      if (result.status !== 'created') return fail();
      return project(result.project);
    } } : {}),
    ...(bridge.CreateDetached ? { async createDetached(name: string, location: string, libraryText: string) {
      const result = await call(() => bridge.CreateDetached!(name, location, libraryText));
      if (result.status !== 'created') return fail();
      return project(result.project);
    } } : {}),
    async list() {
      if (!bridge.List) return fail('当前窗口尚不支持项目列表，请关闭旧窗口后重新打开 RootSound。');
      const result = await call(() => bridge.List!());
      if (result.status !== 'listed' || !Array.isArray(result.projects)) return fail();
      const projects = result.projects.map(project);
      if (new Set(projects.map(item => item.path.toLocaleLowerCase('en-US'))).size !== projects.length) return fail();
      return projects;
    },
    ...(bridge.Browse ? { async browse(path?: string) {
      const result = await call(() => bridge.Browse!(path ?? ''));
      if (result.status !== 'browsed') return fail();
      return libraryPage(result.page);
    } } : {}),
    ...(bridge.CreateLibraryFolder ? { async createFolder(path: string, name: string) {
      if ((await call(() => bridge.CreateLibraryFolder!(path, name))).status !== 'ready') fail();
    } } : {}),
    ...(bridge.RenameLibraryEntry ? { async renameEntry(path: string, name: string) {
      if ((await call(() => bridge.RenameLibraryEntry!(path, name))).status !== 'ready') fail();
    } } : {}),
    ...(bridge.DeleteLibraryEntry ? { async removeEntry(path: string) {
      if ((await call(() => bridge.DeleteLibraryEntry!(path))).status !== 'ready') fail();
    } } : {}),
    async open(path) {
      if (path !== undefined && (!path.trim() || !bridge.OpenKnown)) return fail('当前窗口尚不支持直接打开这个项目，请重新打开 RootSound。');
      const result = await call(() => path === undefined ? bridge.Open() : bridge.OpenKnown!(path));
      if (result.status === 'cancelled') return { status: 'cancelled' };
      if (result.status === 'document') {
        const source = documentSource(result);
        if (path !== undefined && source.path.replaceAll('\\','/').toLocaleLowerCase() !== path.replaceAll('\\','/').toLocaleLowerCase()) return fail('选中的文件不能被替换为其他文件。');
        return { status: 'document', ...source };
      }
      if (result.status === 'midi') {
        if (path !== undefined && !/\.midi?$/iu.test(path)) return fail('这个工程不能被替换为 MIDI 文件。');
        return { status: 'midi', ...midiBytes(result.name, result.base64) };
      }
      if (result.status !== 'opened') return fail();
      return { status: 'opened', project: project(result.project) };
    },
    async remove(selected) {
      const target = project(selected);
      if (!bridge.Delete) return fail('当前窗口尚不支持删除歌曲，请关闭旧窗口后重新打开 RootSound。');
      const result = await call(() => bridge.Delete!(target.path, target.id));
      if (result.status !== 'deleted') return fail();
      if (typeof result.warning === 'string' && result.warning.trim()) return { warning: result.warning };
    },
    async inspect(selected) {
      const target = project(selected);
      if (!bridge.Inspect) return fail('当前窗口尚不支持库内改名，请关闭旧窗口后重新打开 RootSound。');
      const result = await call(() => bridge.Inspect!(target.path, target.id));
      if (result.status !== 'snapshot' || typeof result.libraryText !== 'string' || !result.libraryText
        || typeof result.token !== 'string' || !result.token) return fail();
      const found = project(result.project);
      if (found.id !== target.id || found.path !== target.path) return fail();
      return { project: found, libraryText: result.libraryText, token: result.token };
    },
    async rename(selected, name, libraryText, token) {
      const target = project(selected);
      if (!bridge.Rename) return fail('当前窗口尚不支持库内改名，请关闭旧窗口后重新打开 RootSound。');
      if (!name.trim() || !libraryText || !token.trim()) return fail('请重新选择歌曲并填写名称。');
      const result = await call(() => bridge.Rename!(target.path, target.id, name, libraryText, token));
      if (result.status !== 'renamed') return fail();
      const renamed = project(result.project);
      if (renamed.id !== target.id || renamed.name !== name.trim()) return fail();
      if (renamed.path !== target.path && (renamed.path.replace(/[^\\/]+$/u, '') !== target.path.replace(/[^\\/]+$/u, '')
        || renamed.path.split(/[\\/]/u).at(-1) !== `${name.trim()}.rootsound`)) return fail();
      return renamed;
    },
    async save(name) {
      if (!bridge.Save) return fail('当前窗口尚不支持保存项目，请关闭旧窗口后重新打开 RootSound。');
      const result = await call(() => bridge.Save!(name ?? ''));
      if (result.status !== 'saved') return fail();
      return project(result.project);
    },
    async finishLoading() {
      if (!bridge.FinishLoading) return;
      const result = await call(() => bridge.FinishLoading!());
      if (result.status !== 'ready') return fail();
    },
    ...(bridge.OpenDocument ? { async openDocument(source: EditableFileSource, libraryText: string) {
      const result = await call(() => bridge.OpenDocument!(source.path, source.token, libraryText));
      if (result.status !== 'opened') return fail();
      return project(result.project);
    } } : {}),
    ...(bridge.ReadDocument ? { async readDocument() {
      const result = await call(() => bridge.ReadDocument!());
      if (result.status === 'none') return undefined;
      if (result.status !== 'document') return fail();
      return documentSource(result);
    } } : {}),
    async exit(mode, name) {
      if (mode !== 'save' && mode !== 'discard') return fail('请选择保存退出或直接退出。');
      if (!bridge.Exit) return fail('当前窗口尚不支持退出项目，请关闭旧窗口后重新打开 RootSound。');
      const result = await call(() => bridge.Exit!(mode, name ?? ''));
      if (result.status !== 'exited') return fail();
    },
  };
}
