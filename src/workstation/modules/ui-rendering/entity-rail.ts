import type { CreativeEntity, ProjectEntitiesPort } from '../../contracts/entities.ts';
import { writeEntityDrag } from './entity-drag.ts';

/** Rebuilt with the owning editor, so saves and project changes refresh the same view. */
export function createEntityRail(entities: ProjectEntitiesPort, open: (entity: CreativeEntity) => void): HTMLElement {
  const rail = document.createElement('aside'); rail.className = 'entity-rail'; rail.setAttribute('aria-label', '本曲音色与乐句');
  const view = entities.read();
  const heading = document.createElement('header'); heading.className = 'entity-rail-heading';
  const title = document.createElement('strong'); title.textContent = view.project?.name ?? '素材'; title.title = title.textContent;
  heading.append(title); rail.append(heading);
  function group(items: CreativeEntity[], kind: CreativeEntity['kind'], parent: HTMLElement): void {
    const section = document.createElement('section'); section.className = 'entity-group';
    const label = document.createElement('h2'); label.textContent = kind === 'rootsound.timbre' ? '音色' : '乐句'; section.append(label);
    const matches = items.filter(item => item.kind === kind);
    for (const item of matches) {
      const row = document.createElement('button'); row.type = 'button'; row.className = 'entity-row'; row.draggable = true;
      row.textContent = item.name; row.title = `${item.name} · 拖入${kind === 'rootsound.timbre' ? '乐句' : '歌曲'}，双击编辑`;
      row.addEventListener('dragstart', event => { if (event.dataTransfer) writeEntityDrag(event.dataTransfer, item); });
      row.addEventListener('dblclick', () => open(item));
      row.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); open(item); } });
      section.append(row);
    }
    if (!matches.length) { const empty = document.createElement('p'); empty.className = 'entity-empty'; empty.textContent = '暂无'; section.append(empty); }
    parent.append(section);
  }
  if (view.project) {
    const local = document.createElement('div'); local.className = 'entity-current';
    group(view.current, 'rootsound.timbre', local); group(view.current, 'rootsound.phrase', local); rail.append(local);
  }
  if (view.available.length || !view.project) {
    const shared = document.createElement('details'); shared.className = 'entity-available'; shared.open = !view.project || !view.current.length;
    const summary = document.createElement('summary'); summary.textContent = '素材库'; shared.append(summary);
    group(view.available, 'rootsound.timbre', shared); group(view.available, 'rootsound.phrase', shared); rail.append(shared);
  }
  return rail;
}
