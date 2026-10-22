/** 共同素材规范：内容身份与名称分离，编辑稿与已保存内容分离。 */
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface ContentRecord<T = JsonValue> {
  id: string;
  kind: string;
  schemaVersion: number;
  owner: string;
  name: string;
  revision: number;
  dependencies: string[];
  body: T;
}

export interface Draft<T = JsonValue> {
  id: string;
  sourceId?: string;
  baseRevision?: number;
  name: string;
  kind: string;
  schemaVersion: number;
  owner: string;
  dependencies: string[];
  body: T;
}

export interface NewContent<T = JsonValue> {
  kind: string;
  schemaVersion: number;
  owner: string;
  name: string;
  dependencies?: string[];
  body: T;
}

export interface DraftChanges<T = JsonValue> {
  name?: string;
  dependencies?: string[];
  body?: T;
}

/** 确认只对应本次检查出的来源修订与影响范围。 */
export interface SaveConfirmation {
  expectedRevision: number;
  impactToken: string;
}

export type SaveResult =
  | { status: 'saved'; content: ContentRecord; draft: Draft }
  | { status: 'conflict'; reason: string; actualRevision?: number }
  | { status: 'needs-confirmation'; affectedContent: ContentRecord[]; confirmation: SaveConfirmation }
  | { status: 'storage-error'; message: string };

/** 桌面或临时浏览器适配器负责存储，核心不依赖具体平台。 */
export interface MaterialStorage {
  read(): string | null;
  write(value: string): void;
}

export interface MaterialLibrary {
  createDraft(input: NewContent | { sourceId: string }): Draft;
  readDraft(id: string): Draft | undefined;
  listDrafts(): Draft[];
  updateDraft(id: string, changes: DraftChanges): Draft;
  readContent(id: string): ContentRecord | undefined;
  listContent(): ContentRecord[];
  saveDraft(id: string, mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): SaveResult;
}
