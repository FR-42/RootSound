import type { Draft, MaterialLibrary } from '../../contracts/content.ts';
import type { CreativeEntity, ProjectEntitiesPort } from '../../contracts/entities.ts';
export type { CreativeEntity, ProjectEntitiesPort, ProjectEntitiesView } from '../../contracts/entities.ts';

/** Lists opaque metadata; musical owners retain all editing and dependency meaning. */
export function createProjectAssets(library: MaterialLibrary, currentProject: () => Draft | undefined): ProjectEntitiesPort {
  return { read(context) {
    const focus = context ? library.readDraft(context.draftId) : currentProject();
    const currentView = focus ? library.currentProjectView?.(focus.id) : undefined;
    const scope = focus ? library.projectScopeOf?.({ type: 'draft', id: focus.id }) : undefined;
    const all = library.listContentInfo();
    const project = currentView?.project ?? (focus?.kind === 'rootsound.song' ? focus : scope
      ? library.listDrafts().find(item => item.kind === 'rootsound.song'
        && library.projectScopeOf?.({ type: 'draft', id: item.id }) === scope)
        ?? all.find(item => item.kind === 'rootsound.song'
          && library.projectScopeOf?.({ type: 'content', id: item.id }) === scope)
        ?? { id: scope, name: '本曲', dependencies: [] as string[] }
      : undefined);
    const eligible = new Set((focus && library.listContentInfoForDraft
      ? library.listContentInfoForDraft(focus.id) : all).map(item => item.id));
    const byId = new Map(all.map(item => [item.id, item]));
    const used = new Set<string>();
    function visit(id: string): void {
      if (used.has(id)) return;
      used.add(id); byId.get(id)?.dependencies.forEach(visit);
    }
    project?.dependencies.forEach(visit);
    const current: CreativeEntity[] = []; const available: CreativeEntity[] = [];
    for (const item of all) {
      if (item.kind !== 'rootsound.timbre' && item.kind !== 'rootsound.phrase') continue;
      const owner = library.projectScopeOf?.({ type: 'content', id: item.id });
      const entity = { ...item, kind: item.kind } as CreativeEntity;
      if (project && (currentView ? currentView.contents.some(content => content.id === item.id)
        : !library.currentProjectView && used.has(item.id))) current.push(entity);
      else if (!owner && eligible.has(item.id)) available.push(entity);
    }
    for (const draft of currentView?.drafts ?? []) {
      if (draft.kind !== 'rootsound.timbre' && draft.kind !== 'rootsound.phrase' || !draft.sourceId) continue;
      const saved = all.find(item => item.id === draft.sourceId); if (!saved) continue;
      current.push({ ...saved, name: draft.name, dependencies: [...draft.dependencies], kind: draft.kind, draftId: draft.id });
    }
    const sort = (items: CreativeEntity[]) => items.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    return { ...(project ? { project: { id: project.id, name: project.name } } : {}),
      current: sort(current), available: sort(available) };
  } };
}
