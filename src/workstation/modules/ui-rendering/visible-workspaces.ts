import type { WorkspaceId } from '../../contracts/workspace.ts';

/** Retain dormant co-creation data without routing users back into its unfinished UI. */
export function visibleWorkspace(workspace: WorkspaceId): WorkspaceId {
  return workspace === 'co-creation' ? 'sound' : workspace;
}
