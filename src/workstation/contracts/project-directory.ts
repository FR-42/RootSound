/** A complete .rootsound song file; legacy project folders remain readable. */
export interface ProjectDirectory { id: string; name: string; path: string }
/** A generic editable snapshot; musical interpretation belongs to application services. */
export interface ProjectLibrarySnapshot { project: ProjectDirectory; libraryText: string; token: string }
export type ProjectLocationResult = { status: 'chosen'; path: string } | { status: 'cancelled' };
export type ProjectExitMode = 'save' | 'discard';
export interface ProjectDirectoriesPort {
  read(): Promise<{ defaultLocation: string; current?: ProjectDirectory; hasUnsavedChanges?: boolean; doubleClickIntervalMs?: number }>;
  chooseLocation(current: string): Promise<ProjectLocationResult>;
  create(name: string, location: string, libraryText: string): Promise<ProjectDirectory>;
  list?(): Promise<ProjectDirectory[]>;
  remove?(project: ProjectDirectory): Promise<void>;
  inspect?(project: ProjectDirectory): Promise<ProjectLibrarySnapshot>;
  rename?(project: ProjectDirectory, name: string, libraryText: string, token: string): Promise<ProjectDirectory>;
  open(path?: string): Promise<{ status: 'opened'; project: ProjectDirectory } | { status: 'cancelled' }>;
  save?(name?: string): Promise<ProjectDirectory>;
  finishLoading?(): Promise<void>;
  exit?(mode: ProjectExitMode, name?: string): Promise<void>;
}
/** Application orchestration exposed to the minimal creation pages. */
export interface ProjectSetupPort {
  defaultLocation(): Promise<string>;
  chooseLocation(current: string): Promise<ProjectLocationResult>;
  create(name: string, location: string): Promise<void>;
  list?(): Promise<ProjectDirectory[]>;
  remove?(project: ProjectDirectory): Promise<void>;
  rename?(project: ProjectDirectory, name: string): Promise<ProjectDirectory>;
  open(path?: string): Promise<void>;
  save?(): Promise<void>;
  saveAs?(name: string, location: string): Promise<void>;
  hasUnsavedChanges?(): Promise<boolean>;
  exit?(mode: ProjectExitMode): Promise<void>;
}
