import type { ProjectDirectoriesPort, ProjectDirectory } from '../../contracts/project-directory.ts';

export interface NativeProjectDirectoriesBridge {
  Read(): Promise<unknown>;
  ChooseLocation(current: string): Promise<unknown>;
  Create(name: string, location: string, libraryText: string): Promise<unknown>;
  Open(): Promise<unknown>;
  List?(): Promise<unknown>;
  Delete?(path: string, expectedId: string): Promise<unknown>;
  Inspect?(path: string, expectedId: string): Promise<unknown>;
  Rename?(path: string, expectedId: string, name: string, libraryText: string, token: string): Promise<unknown>;
  OpenKnown?(path: string): Promise<unknown>;
  Save?(name?: string): Promise<unknown>;
  FinishLoading?(): Promise<unknown>;
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
  return { id: item.id, name: item.name, path: item.path };
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
    async list() {
      if (!bridge.List) return fail('当前窗口尚不支持项目列表，请关闭旧窗口后重新打开 RootSound。');
      const result = await call(() => bridge.List!());
      if (result.status !== 'listed' || !Array.isArray(result.projects)) return fail();
      const projects = result.projects.map(project);
      if (new Set(projects.map(item => item.path.toLocaleLowerCase('en-US'))).size !== projects.length) return fail();
      return projects;
    },
    async open(path) {
      if (path !== undefined && (!path.trim() || !bridge.OpenKnown)) return fail('当前窗口尚不支持直接打开这个项目，请重新打开 RootSound。');
      const result = await call(() => path === undefined ? bridge.Open() : bridge.OpenKnown!(path));
      if (result.status === 'cancelled') return { status: 'cancelled' };
      if (result.status !== 'opened') return fail();
      return { status: 'opened', project: project(result.project) };
    },
    async remove(selected) {
      const target = project(selected);
      if (!bridge.Delete) return fail('当前窗口尚不支持删除歌曲，请关闭旧窗口后重新打开 RootSound。');
      const result = await call(() => bridge.Delete!(target.path, target.id));
      if (result.status !== 'deleted') return fail();
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
      if (renamed.id !== target.id || renamed.path !== target.path || renamed.name !== name.trim()) return fail();
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
    async exit(mode, name) {
      if (mode !== 'save' && mode !== 'discard') return fail('请选择保存退出或直接退出。');
      if (!bridge.Exit) return fail('当前窗口尚不支持退出项目，请关闭旧窗口后重新打开 RootSound。');
      const result = await call(() => bridge.Exit!(mode, name ?? ''));
      if (result.status !== 'exited') return fail();
    },
  };
}
