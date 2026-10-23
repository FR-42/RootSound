import type { MaterialStorage } from '../../contracts/content.ts';
import { MAX_SOUND_FILE_BYTES, type AudioFilesPort, type ProjectFilesPort, type SampleFilesPort, type SoundFilesPort } from '../../contracts/files.ts';
import { audioBase64, audioFileName, checkAudioBytes } from './audio-bytes.ts';
import { projectFileName, projectText } from './project-text.ts';
import { createDesktopSampleFiles, type NativeSampleBridge } from './sample-files.ts';

export const DESKTOP_ORIGIN = 'https://rootsound.local';

/** 原生宿主只通过已声明能力提供磁盘存储及文件对话框。 */
export interface DesktopBridge {
  storage: {
    Read(): unknown;
    Write(value: string): unknown;
  };
  files: {
    Open(): Promise<unknown>;
    Save(text: string, suggestedName: string): Promise<unknown>;
  };
  audioFiles: { Save(base64: string, suggestedName: string): Promise<unknown> };
  projectFiles?: { Open(): Promise<unknown>; Save(text: string, suggestedName: string): Promise<unknown> };
  sampleFiles?: NativeSampleBridge;
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
  const host = (globalThis as typeof globalThis & {
    chrome?: { webview?: { hostObjects?: { sync?: { storage?: DesktopBridge['storage'] }; files?: DesktopBridge['files']; audioFiles?: DesktopBridge['audioFiles']; projectFiles?: DesktopBridge['projectFiles']; sampleFiles?: DesktopBridge['sampleFiles'] } } };
  }).chrome?.webview?.hostObjects;
  const storage = host?.sync?.storage;
  const files = host?.files;
  const audioFiles = host?.audioFiles;
  if (!storage || !files || !audioFiles) fail('未能连接本机存储，原有数据不会切换到浏览器保存。请重新打开 RootSound。');
  let projectFiles: DesktopBridge['projectFiles'];
  try { projectFiles = host?.projectFiles; } catch { /* An older native host may reject unknown optional capabilities. */ }
  let sampleFiles: DesktopBridge['sampleFiles'];
  try { sampleFiles = host?.sampleFiles; } catch { /* Optional on older hosts; unrelated music remains usable. */ }
  return { storage, files, audioFiles, projectFiles, sampleFiles };
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
} {
  return {
    sampleFiles: createDesktopSampleFiles(bridge.sampleFiles),
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
      read() {
        const result = response(bridge.storage.Read());
        if (result.ok === false) responseError(result, 'error');
        if (result.ok !== true || (result.value !== null && typeof result.value !== 'string')) {
          fail('素材库读取结果无效，尚未覆盖原有数据。');
        }
        return result.value as string | null;
      },
      write(value) {
        const result = response(bridge.storage.Write(value));
        if (result.ok === false) responseError(result, 'error');
        if (result.ok !== true) fail('素材库写入结果无效，无法确认保存成功。');
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
