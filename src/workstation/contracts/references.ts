import type { ContentRecord, Draft, DraftChanges, MaterialLibrary } from './content.ts';

/** A location is an occurrence, not merely the identity of a shared asset. */
export type ReferenceRoot = { type: 'draft' | 'content'; id: string };
export type ReferenceContext = { root: ReferenceRoot; path: string[] };
export type ReferenceSlot = { id: string; targetId: string; label: string };
export type ReferenceReplacement = { slotId: string; targetId: string };

/** Each owner alone interprets its content. The common manager only walks slots. */
export interface ReferenceAdapter {
  kind: string;
  slots(record: ContentRecord | Draft): ReferenceSlot[];
  replace(record: ContentRecord | Draft, replacements: ReferenceReplacement[]): DraftChanges;
  /** Rewrite non-musical identity metadata when a complete graph receives new ids. */
  remapMetadata?(record: ContentRecord | Draft, identities: ReadonlyMap<string, string>): Pick<DraftChanges, 'body'>;
  /** The owner verifies which content kinds each slot can consume. */
  validateTarget?(record: ContentRecord | Draft, slotId: string, target: ContentRecord): void;
}

export type ReferenceSession = {
  draftId: string;
  targetId: string;
  targetKind: string;
  rootKind?: string;
  labels?: string[];
  /** Nested joint changes wait for the containing edit to be saved atomically. */
  pendingApplyCount?: number;
  context?: ReferenceContext;
};
export type ReferenceLocation = ReferenceContext & {
  id: string;
  labels: string[];
  current: boolean;
};
export type ReferenceLocations = { token: string; locations: ReferenceLocation[] };
export type ReferenceApplyResult =
  | { status: 'applied'; content: ContentRecord; roots: ReferenceRoot[]; workingDraftId?: string; staged?: boolean }
  | { status: 'conflict'; reason: string }
  | { status: 'storage-error'; message: string };
export type ReferenceOperationResult =
  | { status: 'done' }
  | { status: 'conflict'; reason: string }
  | { status: 'storage-error'; message: string };

export interface ReferenceEditingPort {
  begin(context: ReferenceContext): ReferenceSession;
  /** A library save overwrites a singly used item; multiple uses receive a new independent item. */
  beginLibrary(contentId: string, draftId?: string): ReferenceSession;
  resume(draftId: string): ReferenceSession | undefined;
  /** Includes temporarily clean child edits, so exports cannot overlook unfinished handoffs. */
  sessions(): ReferenceSession[];
  locations(draftId: string): ReferenceLocations;
  /** Omitted selection means the current occurrence only. Only multiple logical uses require a new identity. */
  apply(draftId: string, options?: {
    locationIds?: string[]; expectedToken?: string;
    /** Explicit whole-entity editing may retain identity only when every logical use in its song is selected. */
    reuseIfAllSelected?: boolean;
  }): ReferenceApplyResult;
  cancel(draftId: string): ReferenceOperationResult;
}

export type ReferenceEditingFactory = (library: MaterialLibrary, adapters: ReferenceAdapter[]) => ReferenceEditingPort;
