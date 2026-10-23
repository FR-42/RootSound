import type { ContentInfo } from './content.ts';

export type CreativeEntityKind = 'rootsound.timbre' | 'rootsound.phrase';
export type CreativeEntity = ContentInfo & { kind: CreativeEntityKind; draftId?: string };
export type ProjectEntitiesView = {
  project?: { id: string; name: string };
  current: CreativeEntity[];
  available: CreativeEntity[];
};
export interface ProjectEntitiesPort { read(context?: { draftId: string }): ProjectEntitiesView }
