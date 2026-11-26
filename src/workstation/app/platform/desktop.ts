import type { MaterialStorage } from '../../contracts/content.ts';
import { MAX_SOUND_FILE_BYTES, type AudioFilesPort, type ProjectFilesPort, type SampleFilesPort, type SoundFilesPort } from '../../contracts/files.ts';
import { audioBase64, audioFileName, checkAudioBytes } from './audio-bytes.ts';
import { projectFileName, projectText } from './project-text.ts';
import { createDesktopSampleFiles, type NativeSampleBridge } from './sample-files.ts';
import type { ProjectDirectoriesPort } from '../../contracts/project-directory.ts';
import { createDesktopProjectDirectories, type NativeProjectDirectoriesBridge } from './project-directories.ts';
import type { TimbreFilesPort } from '../../contracts/timbre-files.ts';
import { createDesktopTimbreFiles, type NativeTimbreFilesBridge } from './timbre-files.ts';
import { createDesktopSamplePayloads } from './sample-payloads.ts';
import type { SamplePayloadPort } from '../../contracts/sampling.ts';

export const DESKTOP_ORIGIN = 'https://rootsound.local';

/** 原生宿主只通过已声明能力提供磁盘存储及文件对话框。 */
export interface DesktopBridge {
  readInitialStorage?(): Promise<unknown>;
  asyncStorage?: {
    StartWriteScopedIfUnchanged(value: string, scope: string, revision: string): Promise<unknown>;
    ReadWriteResult(): Promise<unknown>;
    BeginWriteChunks?(scope: string, revision: string): Promise<unknown>;
    AppendWriteChunk?(value: string): Promise<unknown>;
    CommitWriteChunks?(): Promise<unknown>;
    AbortWriteChunks?(): Promise<unknown>;
  };
  storage: {
    Read(): unknown;
    Write(value: string): unknown;
    WriteScoped?(value: string, scope: string): unknown;
    WriteScopedIfUnchanged?(value: string, scope: string, revision: string): unknown;
    WriteScopedCheckpoint?(value: string, scope: string): unknown;
  };
  files: {
    Open(): Promise<unknown>;
    Save(text: string, suggestedName: string): Promise<unknown>;
  };
  audioFiles: { Save(base64: string, suggestedName: string): Promise<unknown> };
  projectFiles?: { Open(): Promise<unknown>; Save(text: string, suggestedName: string): Promise<unknown> };
  sampleFiles?: NativeSampleBridge;
  projectDirectories?: NativeProjectDirectoriesBridge;
  timbreFiles?: NativeTimbreFilesBridge;
}

export function isDesktopOrigin(origin = typeof location === 'undefined' ? '' : location.origin): boolean {
  return origin === DESKTOP_ORIGIN;
}

function fail(message: string): never { throw new Error(`桌面文件服务：${message}`); }

function response(raw: unknown): Record<string, unknown> {
  if (typeof raw !== 'string') fail('返回的数据格式无效。');
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return fail('返回的数据无法读取。'); }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) fail('返回的数据格式无效。');
  return parsed as Record<string, unknown>;
}

function responseError(value: Record<string, unknown>, key: 'error' | 'message'): never {
  const message = value[key];
  fail(typeof message === 'string' && message.trim() ? message : '操作未能完成，请保留原有文件后重试。');
}

function hostBridge(): DesktopBridge {
  if (!isDesktopOrigin()) fail('当前页面不是受信任的桌面界面。');
  const portable = (globalThis as typeof globalThis & { rootSoundDesktop?: DesktopBridge }).rootSoundDesktop;
  if (portable) return portable;
  const host = (globalThis as typeof globalThis & {
    chrome?: { webview?: { hostObjects?: { sync?: { storage?: DesktopBridge['storage'] }; files?: DesktopBridge['files']; audioFiles?: DesktopBridge['audioFiles']; projectFiles?: DesktopBridge['projectFiles']; sampleFiles?: DesktopBridge['sampleFiles']; projectDirectories?: NativeProjectDirectoriesBridge; timbreFiles?: NativeTimbreFilesBridge } } };
  }).chrome?.webview?.hostObjects;
  const storage = host?.sync?.storage;
  const files = host?.files;
  const audioFiles = host?.audioFiles;
  if (!storage || !files || !audioFiles) fail('未能连接本机存储，原有数据不会切换到浏览器保存。请重新打开 RootSound。');
  let projectFiles: DesktopBridge['projectFiles'];
  try { projectFiles = host?.projectFiles; } catch { /* An older native host may reject unknown optional capabilities. */ }
  let sampleFiles: DesktopBridge['sampleFiles'];
  try { sampleFiles = host?.sampleFiles; } catch { /* Optional on older hosts; unrelated music remains usable. */ }
  let projectDirectories: DesktopBridge['projectDirectories'];
  try { projectDirectories = host?.projectDirectories; } catch { /* Older hosts cannot create managed project folders. */ }
  let timbreFiles: DesktopBridge['timbreFiles'];
  try { timbreFiles = host?.timbreFiles; } catch { /* An older host keeps existing work usable. */ }
  const asyncStorage = (host as typeof host & { storage?: { Read(): Promise<unknown> } })?.storage;
  return { storage, files, audioFiles, projectFiles, sampleFiles, projectDirectories, timbreFiles, asyncStorage: asyncStorage as DesktopBridge['asyncStorage'],
    ...(asyncStorage ? { readInitialStorage: () => asyncStorage.Read() } : {}) };
}

function checkSize(text: string): void {
  if (new TextEncoder().encode(text).byteLength > MAX_SOUND_FILE_BYTES) fail('这个文件超出了当前单个声音文件的大小范围。');
}

async function projectCall(action: () => Promise<unknown>): Promise<unknown> {
  try { return await action(); }
  catch { return fail('无法连接本机工程文件服务，请关闭旧窗口后重新打开 RootSound。'); }
}

export function createDesktopPlatform(bridge: DesktopBridge = hostBridge()): {
  storage: MaterialStorage;
  files: SoundFilesPort;
  audioFiles: AudioFilesPort;
  projectFiles: ProjectFilesPort;
  sampleFiles: SampleFilesPort;
  samplePayloads: SamplePayloadPort;
  timbreFiles: TimbreFilesPort;
  projectDirectories?: ProjectDirectoriesPort;
} {
  let storageScope: string | undefined;
  let observed: { value: string | null; revision: string } | undefined;
  function observeStorage(raw: unknown): string | null {
    const result = response(raw);
    if (result.ok === false) responseError(result, 'error');
    if (result.ok !== true || (result.value !== null && typeof result.value !== 'string')) {
      fail('素材库读取结果无效，尚未覆盖原有数据。');
    }
    if (result.scope !== undefined) {
      if (typeof result.scope !== 'string' || !result.scope || storageScope !== undefined && storageScope !== result.scope)
        fail('项目已切换，请重新打开界面后继续。');
      storageScope = result.scope;
    } else if (bridge.projectDirectories) fail('项目存储缺少隔离标识，请关闭旧窗口后重新打开 RootSound。');
    const value = result.value as string | null;
    observed = typeof result.revision === 'string' && result.revision ? { value, revision: result.revision } : undefined;
    return value;
  }
  return {
    ...(bridge.projectDirectories ? { projectDirectories: createDesktopProjectDirectories(bridge.projectDirectories) } : {}),
    sampleFiles: createDesktopSampleFiles(bridge.sampleFiles),
    samplePayloads: createDesktopSamplePayloads(),
    timbreFiles: createDesktopTimbreFiles(bridge.timbreFiles),
    projectFiles: {
      async open() {
        if (!bridge.projectFiles) fail('当前桌面窗口尚不支持工程文件，请关闭旧窗口后重新打开 RootSound。');
        const result = response(await projectCall(() => bridge.projectFiles!.Open()));
        if (result.status === 'cancelled') return { status: 'cancelled' };
        if (result.status === 'error') responseError(result, 'message');
        if (result.status !== 'opened' || typeof result.name !== 'string' || !result.name || typeof result.text !== 'string') fail('打开工程文件的结果无效。');
        return { status: 'opened', name: result.name, text: projectText(result.text) };
      },
      async save(text, suggestedName) {
        if (!bridge.projectFiles) fail('当前桌面窗口尚不支持工程文件，请关闭旧窗口后重新打开 RootSound。');
        const checked = projectText(text);
        const result = response(await projectCall(() => bridge.projectFiles!.Save(checked, projectFileName(suggestedName))));
        if (result.status === 'cancelled') return { status: 'cancelled' };
        if (result.status === 'error') responseError(result, 'message');
        if (result.status !== 'saved' || typeof result.name !== 'string' || !result.name) fail('保存工程文件的结果无效，无法确认保存成功。');
        return { status: 'saved', name: result.name };
      },
    },
    storage: {
      ...(bridge.asyncStorage ? { async writeIfUnchangedAsync(value: string, expected: string | null) {
        if ((!observed || observed.value !== expected) && this.read() !== expected)
          fail('素材库已被其他窗口修改，请重新打开后继续。原数据未被覆盖。');
        if (!observed || storageScope === undefined) { this.write(value); return; }
        const native = bridge.asyncStorage!;
        let result: Record<string, unknown>;
        if (value.length > 1_000_000 && native.BeginWriteChunks && native.AppendWriteChunk && native.CommitWriteChunks && native.AbortWriteChunks) {
          const check = (raw: unknown) => {
            const result = response(raw);
            if (result.ok !== true) responseError(result, 'error');
            return result;
          };
          check(await native.BeginWriteChunks(storageScope, observed.revision));
          try {
            for (let offset = 0; offset < value.length;) {
              await new Promise(resolve => setTimeout(resolve, 0));
              let end = Math.min(value.length, offset + 512 * 1024);
              const code = value.charCodeAt(end - 1);
              if (end < value.length && code >= 0xd800 && code <= 0xdbff) end--;
              check(await native.AppendWriteChunk(value.slice(offset, end)));
              offset = end;
            }
            result = check(await native.CommitWriteChunks());
          } catch (error) { await native.AbortWriteChunks().catch(() => {}); throw error; }
        } else result = response(await native.StartWriteScopedIfUnchanged(value, storageScope, observed.revision));
        while (result.ok === true && result.pending === true) {
          await new Promise(resolve => setTimeout(resolve, 16));
          result = response(await bridge.asyncStorage!.ReadWriteResult());
        }
        if (result.ok === false) responseError(result, 'error');
        if (result.ok !== true || typeof result.revision !== 'string' || !result.revision) fail('素材库写入结果无效，无法确认保存成功。');
        observed = { value, revision: result.revision };
      } } : {}),
      ...(bridge.readInitialStorage ? { async readInitial() { return observeStorage(await bridge.readInitialStorage!()); } } : {}),
      read() { return observeStorage(bridge.storage.Read()); },
      write(value) {
        if (storageScope !== undefined && !bridge.storage.WriteScoped) fail('当前窗口缺少项目隔离保存，请重新打开 RootSound。');
        const result = response(storageScope === undefined ? bridge.storage.Write(value) : bridge.storage.WriteScoped!(value, storageScope));
        if (result.ok === false) responseError(result, 'error');
        if (result.ok !== true) fail('素材库写入结果无效，无法确认保存成功。');
        observed = undefined;
      },
      writeIfUnchanged(value, expected) {
        if ((!observed || observed.value !== expected) && this.read() !== expected)
          fail('素材库已被其他窗口修改，请重新打开后继续。原数据未被覆盖。');
        if (!observed || storageScope === undefined) { this.write(value); return; }
        const result = response(bridge.storage.WriteScopedIfUnchanged!(value, storageScope, observed.revision));
        if (result.ok === false) responseError(result, 'error');
        if (result.ok !== true || typeof result.revision !== 'string' || !result.revision)
          fail('素材库写入结果无效，无法确认保存成功。');
        observed = { value, revision: result.revision };
      },
      writePermanent(value) {
        if (storageScope === undefined || !bridge.storage.WriteScopedCheckpoint)
          fail('当前窗口尚不支持永久删除，请关闭旧窗口后重新打开 RootSound。');
        const result = response(bridge.storage.WriteScopedCheckpoint(value, storageScope));
        if (result.ok === false) responseError(result, 'error');
        if (result.ok !== true) fail('永久删除的保存结果无效，无法确认操作成功。');
        observed = undefined;
      },
    },
    audioFiles: {
      async save(bytes, suggestedName) {
        checkAudioBytes(bytes);
        const result = response(await bridge.audioFiles.Save(audioBase64(bytes), audioFileName(suggestedName)));
        if (result.status === 'cancelled') return { status: 'cancelled' };
        if (result.status === 'error') responseError(result, 'message');
        if (result.status !== 'saved' || typeof result.name !== 'string' || !result.name) {
          fail('写入音频的结果无效，无法确认保存成功。');
        }
        return { status: 'saved', name: result.name };
      },
    },
    files: {
      async open() {
        const result = response(await bridge.files.Open());
        if (result.status === 'cancelled') return { status: 'cancelled' };
        if (result.status === 'error') responseError(result, 'message');
        if (result.status !== 'opened' || typeof result.name !== 'string' || !result.name
          || typeof result.text !== 'string') fail('打开文件的结果无效。');
        checkSize(result.text);
        return { status: 'opened', name: result.name, text: result.text };
      },
      async save(text, suggestedName) {
        checkSize(text);
        const result = response(await bridge.files.Save(text, suggestedName));
        if (result.status === 'cancelled') return { status: 'cancelled' };
        if (result.status === 'error') responseError(result, 'message');
        if (result.status !== 'saved' || typeof result.name !== 'string' || !result.name) {
          fail('写入文件的结果无效，无法确认保存成功。');
        }
        return { status: 'saved', name: result.name };
      },
    },
  };
}
