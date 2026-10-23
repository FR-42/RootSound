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
/** Lightweight independent metadata; large source assets stay in custody until requested. */
export type ContentInfo = Omit<ContentRecord, 'body'>;

/** Current document membership, independent of custody/undo retention. */
export type CurrentProjectView = {
  project: Draft | ContentRecord;
  contents: ContentInfo[];
  /** One working representation per saved identity; contents excludes those identities. */
  drafts: Draft[];
  /** Explicit members that may be unused by the current arrangement. */
  memberIds: string[];
};

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
  /** Draft-only context owned by the editing workflow; never saved as musical content. */
  editingContext?: JsonValue;
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

/** History contains editable fields only, never saved content or source identity. */
export interface DraftSnapshot<T = JsonValue> {
  name: string;
  dependencies: string[];
  body: T;
  /** The library restores all associated records atomically, including missing redo dependencies. */
  transactionId?: string;
}

export interface DraftHistory {
  past: DraftSnapshot[];
  future: DraftSnapshot[];
}

export interface DraftEditOptions {
  remember: true;
  /** Reject changes if validation used an older draft snapshot. */
  expected: Draft;
}

/** A caller supplies complete records and their identities; storage knows no musical structure. */
export interface MaterialTransaction {
  expectedToken: string;
  label: string;
  /** Associates the entire operation with one step in this draft's undo timeline. */
  anchorDraftId?: string;
  createContents?: ContentRecord[];
  createDrafts?: Draft[];
  /** User-chosen names must be accepted exactly or rejected; generated names may get a numeric suffix. */
  exactNameIds?: string[];
  replaceContents?: { expected: ContentRecord; replacement: ContentRecord }[];
  replaceDrafts?: { expected: Draft; replacement: Draft }[];
  deleteContents?: ContentRecord[];
  deleteDrafts?: Draft[];
  /** Explicit project assets, distinct from history retention and playback references. */
  projectMembers?: { rootId: string; contentIds: string[] }[];
}

export type MaterialTransactionResult =
  | { status: 'committed'; transactionId: string }
  | { status: 'conflict'; reason: string }
  | { status: 'storage-error'; message: string };

/** 确认只对应本次检查出的来源修订与影响范围。 */
export interface SaveConfirmation {
  expectedRevision: number;
  impactToken: string;
}

export type SaveResult =
  | { status: 'saved'; content: ContentRecord; draft: Draft }
  | { status: 'conflict'; reason: string; actualRevision?: number }
  | { status: 'needs-confirmation'; affectedContent: ContentRecord[]; affectedDrafts: Draft[]; confirmation: SaveConfirmation }
  | { status: 'storage-error'; message: string };

/** 桌面或临时浏览器适配器负责存储，核心不依赖具体平台。 */
export interface MaterialStorage {
  read(): string | null;
  write(value: string): void;
}

export interface MaterialLibrary {
  /** Invalidated by every successful write, including changes to unrelated usage locations. */
  currentToken(): string;
  /** All record changes and the optional composite undo step persist in one write. */
  commitTransaction(transaction: MaterialTransaction): MaterialTransactionResult;
  createDraft(input: NewContent | { sourceId: string }): Draft;
  readDraft(id: string): Draft | undefined;
  listDrafts(): Draft[];
  /** Plain external writes invalidate history; remembered edits persist history atomically. */
  updateDraft(id: string, changes: DraftChanges, options?: DraftEditOptions): Draft;
  readDraftHistory(id: string): DraftHistory;
  /** Callers validate ordinary targets; transaction targets restore their entire validated patch atomically. */
  travelDraft(id: string, direction: 'undo' | 'redo', expected: Draft): Draft;
  readContent(id: string): ContentRecord | undefined;
  readContentInfo(id: string): ContentInfo | undefined;
  listContentInfo(): ContentInfo[];
  /** Optional project policy: the owning song scope, independent of display names. */
  projectScopeOf?(reference: { type: 'draft' | 'content'; id: string }): string | undefined;
  /** Current song's materials and unadopted starts; hides other songs and already adopted public origins. */
  listContentInfoForDraft?(draftId: string): ContentInfo[];
  /** Current root/graph and explicit assets only; never includes historical saved roots. */
  currentProjectView?(draftId: string): CurrentProjectView | undefined;
  listContent(): ContentRecord[];
  saveDraft(id: string, mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): SaveResult;
  /** Copies the item; dependencies stay shared within its song, while a new song adopts an independent graph. */
  duplicateContent(id: string, name?: string, expectedRevision?: number): SaveResult;
}
