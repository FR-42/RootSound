export type {
  JsonValue, ContentRecord, ContentInfo, Draft, NewContent, DraftChanges, DraftSnapshot, DraftHistory, DraftEditOptions,
  SaveConfirmation, SaveResult, MaterialStorage, MaterialLibrary, MaterialTransaction, MaterialTransactionResult,
} from '../../contracts/content.ts';
export { createMaterialLibrary } from './library.ts';
export { createMaterialCatalog } from './catalog.ts';
export { createReferenceEditing } from './reference-editing.ts';
export { createProjectPackages } from './project.ts';
export { countUsagePositions } from './usage-positions.ts';
export type { ProjectExport, ProjectImportResult, ProjectPackagesPort } from '../../contracts/project.ts';
export type {
  ReferenceRoot, ReferenceContext, ReferenceSlot, ReferenceReplacement, ReferenceAdapter, ReferenceSession,
  ReferenceLocation, ReferenceLocations, ReferenceApplyResult, ReferenceOperationResult, ReferenceEditingPort, ReferenceEditingFactory,
} from '../../contracts/references.ts';
export type { MaterialCatalogPort, MaterialUsage, CatalogKind } from '../../contracts/catalog.ts';
