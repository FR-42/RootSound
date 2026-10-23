import type { ContentRecord, Draft } from './content.ts';

/** A portable snapshot contains the current root and all its transitive dependencies. */
export type ProjectExport = { text: string; name: string; contentCount: number };
export type ProjectImportResult =
  | { status: 'imported'; content: ContentRecord; draft: Draft; contentCount: number }
  | { status: 'conflict'; reason: string }
  | { status: 'storage-error'; message: string };

export interface ProjectPackagesPort {
  /** Captures the draft's current music and saved dependencies without changing the library. */
  exportDraft(draftId: string): ProjectExport;
  /** Validates first; imports fresh identities and one root draft atomically. */
  importProject(text: string): ProjectImportResult;
}
