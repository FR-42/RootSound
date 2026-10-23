/** 一个声音的文件出入口；声音内容是否有效由音色模块负责判断。 */
export interface SoundFilesPort {
  open(): Promise<
    | { status: 'opened'; name: string; text: string }
    | { status: 'cancelled' }
  >;
  save(text: string, suggestedName: string): Promise<
    | { status: 'saved'; name: string }
    | { status: 'download-started'; name: string }
    | { status: 'cancelled' }
  >;
}

/** 当前格式只携带一个无外部依赖的声音，不代表完整歌曲工程格式。 */
export const SOUND_FILE_EXTENSION = '.rssound';
export const MAX_SOUND_FILE_BYTES = 1024 * 1024;

/** A complete editable project; music and dependency validation belongs to materials. */
export interface ProjectFilesPort {
  open(): Promise<
    | { status: 'opened'; name: string; text: string }
    | { status: 'cancelled' }
  >;
  save(text: string, suggestedName: string): Promise<
    | { status: 'saved'; name: string }
    | { status: 'download-started'; name: string }
    | { status: 'cancelled' }
  >;
}

export const PROJECT_FILE_EXTENSION = '.rsproject';
export const MAX_PROJECT_FILE_BYTES = 32 * 1024 * 1024;

export interface AudioFilesPort {
  save(bytes: Uint8Array, suggestedName: string): Promise<
    | { status: 'saved'; name: string }
    | { status: 'download-started'; name: string }
    | { status: 'cancelled' }
  >;
}

export const AUDIO_FILE_EXTENSION = '.wav';
export const MAX_AUDIO_FILE_BYTES = 256 * 1024 * 1024;

/** Read original audio bytes; decoding and musical ownership belong to sampling. */
export interface SampleFilesPort {
  open(): Promise<{ status: 'opened'; name: string; bytes: Uint8Array; mimeType: string } | { status: 'cancelled' }>;
}
export const MAX_SAMPLE_FILE_BYTES = 16 * 1024 * 1024;
