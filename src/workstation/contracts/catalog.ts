import type { ContentRecord, Draft, SaveResult } from './content.ts';

export type CatalogKind = 'all' | 'rootsound.timbre' | 'rootsound.phrase' | 'rootsound.song' | 'rootsound.co-creation' | 'rootsound.sample';
export type MaterialUsage = { saved: ContentRecord[]; drafts: Draft[] };
export interface MaterialCatalogPort {
  project?(): { id: string; name: string } | undefined;
  list(query?: string, kind?: CatalogKind): ContentRecord[];
  listDrafts(query?: string, kind?: CatalogKind): Draft[];
  usage(contentId: string): MaterialUsage;
  duplicate(contentId: string, name: string, expectedRevision: number): SaveResult;
}
