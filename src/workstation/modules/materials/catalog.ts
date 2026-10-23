import type { Draft, MaterialLibrary } from '../../contracts/content.ts';
import type { CatalogKind, MaterialCatalogPort } from '../../contracts/catalog.ts';

/** The common manager indexes opaque content and references, without interpreting music. */
export function createMaterialCatalog(library: MaterialLibrary, options?: { currentProject: () => Draft | undefined }): MaterialCatalogPort {
  function matches(value: { name: string; kind: string }, query = '', kind: CatalogKind = 'all'): boolean {
    return (kind === 'all' || value.kind === kind) && value.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  }
  const current = () => {
    const draft = options?.currentProject();
    return draft ? library.currentProjectView?.(draft.id) : undefined;
  };
  return {
    ...(options ? { project() { const project = current()?.project; return project ? { id: project.id, name: project.name } : undefined; } } : {}),
    list(query, kind) { return (options ? current()?.contents ?? [] : library.listContentInfo()).filter(item => matches(item, query, kind)).map(item => library.readContent(item.id)!); },
    listDrafts(query, kind) {
      if (options) return (current()?.drafts ?? []).filter(item => matches(item, query, kind));
      return library.listDrafts().filter(item => {
        if (!matches(item, query, kind)) return false;
        const saved = item.sourceId ? library.readContent(item.sourceId) : undefined;
        return !saved || item.name !== saved.name || JSON.stringify(item.body) !== JSON.stringify(saved.body)
          || JSON.stringify(item.dependencies) !== JSON.stringify(saved.dependencies);
      });
    },
    usage(contentId) {
      if (!library.readContentInfo(contentId)) throw new Error('找不到这份素材。');
      const view = options ? current() : undefined;
      const contents = options ? view?.contents ?? [] : library.listContentInfo();
      const drafts = options ? view?.drafts ?? [] : library.listDrafts();
      if (options && !contents.some(item => item.id === contentId) && !drafts.some(item => item.sourceId === contentId)) throw new Error('这份素材不属于当前歌曲工程。');
      const reached = new Set([contentId]);
      const nodes = options ? [...contents, ...drafts] : contents;
      let changed = true;
      while (changed) {
        changed = false;
        for (const item of nodes) {
          const identity = 'sourceId' in item && item.sourceId ? item.sourceId : item.id;
          if (!reached.has(identity) && item.dependencies.some(id => reached.has(id))) {
            reached.add(identity); changed = true;
          }
        }
      }
      return { saved: contents.filter(item => item.id !== contentId && reached.has(item.id)).map(item => library.readContent(item.id)!),
        drafts: drafts.filter(item => (item.sourceId ?? item.id) !== contentId && item.dependencies.some(id => reached.has(id))) };
    },
    duplicate(contentId, name, expectedRevision) {
      if (options && !current()?.contents.some(item => item.id === contentId)) return { status: 'conflict', reason: '这份素材已不在当前歌曲工程中，请重新查看。' };
      return library.duplicateContent(contentId, name, expectedRevision);
    },
  };
}
