/** A complete .rootsound song file; legacy project folders remain readable. */
export type EditableFileFormat = 'midi' | 'musicxml' | 'mxl' | 'rsproject';
export interface ProjectDirectory { id: string; name: string; path: string; format?: EditableFileFormat }
export type ProjectLibraryEntry =
  | ({ kind: 'project' } & ProjectDirectory)
  | { kind: 'folder'; name: string; path: string }
  | { kind: 'midi'; name: string; path: string }
  | { kind: 'document'; name: string; path: string };
export interface EditableFileSource { name: string; path: string; format: EditableFileFormat; bytes: Uint8Array; token: string; libraryText?: string }
export interface ProjectLibraryPage { root: string; path: string; parent?: string; entries: ProjectLibraryEntry[] }
/** A generic editable snapshot; musical interpretation belongs to application services. */
export interface ProjectLibrarySnapshot { project: ProjectDirectory; libraryText: string; token: string }
export type ProjectLocationResult = { status: 'chosen'; path: string } | { status: 'cancelled' };
export type ProjectExitMode = 'save' | 'discard';
export type ProjectSaveChoice = 'saved' | 'discarded' | 'cancelled';
export type ProjectRemovalResult = void | { warning: string };
/** Foreign music is validated in memory before activating its original source file. */
export type ProjectDirectoryOpenResult =
  | { status: 'opened'; project: ProjectDirectory }
  | { status: 'midi'; name: string; bytes: Uint8Array }
  | ({ status: 'document' } & EditableFileSource)
  | { status: 'cancelled' };
export interface ProjectDirectoriesPort {
  read(): Promise<{ defaultLocation: string; current?: ProjectDirectory; hasUnsavedChanges?: boolean; doubleClickIntervalMs?: number }>;
  chooseLocation(current: string): Promise<ProjectLocationResult>;
  create(name: string, location: string, libraryText: string): Promise<ProjectDirectory>;
  /** Explicit Save As may copy a dirty working project without overwriting it. */
  createCopy?(name: string, location: string, libraryText: string): Promise<ProjectDirectory>;
  /** Save an isolated practice score without activating it or changing the current draft. */
  createDetached?(name: string, location: string, libraryText: string): Promise<ProjectDirectory>;
  list?(): Promise<ProjectDirectory[]>;
  browse?(path?: string): Promise<ProjectLibraryPage>;
  createFolder?(path: string, name: string): Promise<void>;
  renameEntry?(path: string, name: string): Promise<void>;
  removeEntry?(path: string): Promise<void>;
  remove?(project: ProjectDirectory): Promise<ProjectRemovalResult>;
  inspect?(project: ProjectDirectory): Promise<ProjectLibrarySnapshot>;
  rename?(project: ProjectDirectory, name: string, libraryText: string, token: string): Promise<ProjectDirectory>;
  open(path?: string): Promise<ProjectDirectoryOpenResult>;
  save?(name?: string): Promise<ProjectDirectory>;
  finishLoading?(): Promise<void>;
  openDocument?(source: EditableFileSource, libraryText: string): Promise<ProjectDirectory>;
  readDocument?(): Promise<EditableFileSource | undefined>;
  exit?(mode: ProjectExitMode, name?: string): Promise<void>;
}
/** Application orchestration exposed to the minimal creation pages. */
export interface ProjectSetupPort {
  defaultLocation(): Promise<string>;
  chooseLocation(current: string): Promise<ProjectLocationResult>;
  create(name: string, location: string): Promise<void>;
  list?(): Promise<ProjectDirectory[]>;
  browse?(path?: string): Promise<ProjectLibraryPage>;
  createFolder?(path: string, name: string): Promise<void>;
  renameEntry?(path: string, name: string): Promise<void>;
  removeEntry?(path: string): Promise<void>;
  remove?(project: ProjectDirectory): Promise<ProjectRemovalResult>;
  rename?(project: ProjectDirectory, name: string): Promise<ProjectDirectory>;
  open(path?: string): Promise<void>;
  save?(): Promise<void>;
  saveAs?(name: string, location: string, mode?: 'edit' | 'exit' | 'close'): Promise<void>;
  readSaveSource?(): Promise<ProjectDirectory | undefined>;
  hasUnsavedChanges?(): Promise<boolean>;
  exit?(mode: ProjectExitMode): Promise<void>;
}
