export type SongInspectorView = {
  key: string;
  kind: 'clip' | 'row' | 'phrase';
  name: string;
  details: Array<{ label: string; value: string }>;
  onRename?(name: string): void;
  level?: number;
  pan?: number;
  onMix?(field: 'level' | 'pan', value: number, commit: boolean): void;
  color?: string;
  onColor?(): void;
  onDetail?(): void;
  onAudition?(): void;
  auditioning?: boolean;
  preparingAudition?: boolean;
};

const panText = (value: number) => Math.abs(value) < .005 ? '居中' : `${value < 0 ? '左' : '右'} ${Math.round(Math.abs(value) * 100)}%`;

/** Stable controls survive live playback/viewport paints while a slider is held. */
export function createSongInspector(onError: (error: unknown) => void) {
  const root = document.createElement('section'); root.className = 'song-inspector'; root.setAttribute('aria-label', '编排控制台');
  let view: SongInspectorView | undefined;
  let name: HTMLInputElement | undefined;
  const controls = new Map<'level' | 'pan', { input: HTMLInputElement; value: HTMLOutputElement; dirty: boolean; commit(): void }>();
  const detailNodes: HTMLElement[] = [];
  let dragging: 'level' | 'pan' | undefined;
  let auditionButton: HTMLButtonElement | undefined;

  function updateAudition(): void {
    if (!auditionButton) return;
    const playing = !!view?.auditioning; const preparing = !!view?.preparingAudition;
    auditionButton.setAttribute('aria-label', preparing ? '取消演奏准备' : playing ? '停止演奏' : '演奏');
    auditionButton.setAttribute('aria-pressed', String(playing || preparing));
    auditionButton.title = preparing ? '取消演奏准备' : playing ? '停止演奏' : '演奏';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '16'); svg.setAttribute('height', '16'); svg.setAttribute('fill', 'currentColor');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', playing || preparing ? 'M6 6h12v12H6z' : 'M8 5v14l11-7z'); svg.append(path); auditionButton.replaceChildren(svg);
  }

  function commitName(): void {
    if (!name || name.readOnly || !view) return;
    name.readOnly = true;
    const next = name.value.trim();
    if (!next || next === view.name) { name.value = view.name; return; }
    try { view.onRename?.(next); }
    catch (error) { name.value = view.name; onError(error); }
  }
  function setControl(field: 'level' | 'pan', value: number): void {
    const control = controls.get(field); if (!control) return;
    control.input.value = String(value);
    control.value.textContent = field === 'pan' ? panText(value) : `${Math.round(value * 100)}%`;
    control.input.style.setProperty?.('--fill', `${field === 'pan' ? (value + 1) * 50 : value * 100}%`);
  }
  function mixControl(field: 'level' | 'pan', label: string, value: number): HTMLElement {
    const wrapper = document.createElement('label'); wrapper.className = `song-inspector-mix song-inspector-${field}`;
    const title = document.createElement('span'); title.textContent = label;
    const input = document.createElement('input'); input.type = 'range'; input.min = field === 'pan' ? '-1' : '0'; input.max = '1'; input.step = '.01';
    input.setAttribute('aria-label', label);
    const output = document.createElement('output');
    const commit = () => {
      dragging = undefined;
      const control = controls.get(field); if (!control?.dirty) return; control.dirty = false;
      try { view?.onMix?.(field, Number(input.value), true); } catch (error) { onError(error); }
    };
    controls.set(field, { input, value: output, dirty: false, commit }); setControl(field, value);
    input.addEventListener('pointerdown', () => { if (dragging && dragging !== field) controls.get(dragging)?.commit(); dragging = field; });
    input.addEventListener('input', () => {
      const next = Number(input.value); controls.get(field)!.dirty = true; setControl(field, next);
      try { view?.onMix?.(field, next, false); } catch (error) { onError(error); }
    });
    input.addEventListener('change', commit); input.addEventListener('blur', commit);
    input.addEventListener('wheel', event => {
      event.preventDefault(); event.stopPropagation(); if (!event.deltaY && !event.deltaX) return;
      const delta = (event.deltaY || event.deltaX) < 0 ? .01 : -.01;
      const next = Math.min(1, Math.max(field === 'pan' ? -1 : 0, Number(input.value) + delta));
      if (next === Number(input.value)) return;
      setControl(field, next);
      try { view?.onMix?.(field, next, true); } catch (error) { onError(error); }
    }, { passive: false });
    wrapper.append(title, input, output); return wrapper;
  }
  function update(next?: SongInspectorView): void {
    if (!next) {
      commitName(); view = undefined; name = undefined; auditionButton = undefined; controls.clear(); detailNodes.length = 0; root.replaceChildren(); root.hidden = true; return;
    }
    root.hidden = false;
    const changed = view?.key !== next.key || view.kind !== next.kind;
    if (changed) {
      commitName(); view = next; auditionButton = undefined; controls.clear(); detailNodes.length = 0;
      const identity = document.createElement('div'); identity.className = 'song-inspector-identity';
      name = document.createElement('input'); name.type = 'text'; name.className = 'song-inspector-name'; name.value = next.name; name.readOnly = true;
      name.setAttribute('aria-label', next.kind === 'row' ? '行名称' : '乐句名称'); name.title = '双击修改名称';
      name.addEventListener('dblclick', event => { if (!view?.onRename) return; event.preventDefault(); name!.readOnly = false; name!.focus(); name!.select?.(); });
      name.addEventListener('blur', commitName);
      name.addEventListener('keydown', event => {
        if (event.key === 'Enter') { event.preventDefault(); name!.blur(); }
        if (event.key === 'Escape') { event.preventDefault(); name!.value = view?.name ?? ''; name!.readOnly = true; name!.blur(); }
      });
      identity.append(name);
      if (next.onAudition && next.kind !== 'row') {
        auditionButton = document.createElement('button'); auditionButton.type = 'button'; auditionButton.className = 'song-inspector-detail song-inspector-audition';
        auditionButton.addEventListener('click', () => { commitName(); try { view?.onAudition?.(); } catch (error) { onError(error); } });
        updateAudition(); identity.append(auditionButton);
      }
      if (next.onDetail) {
        const detail = document.createElement('button'); detail.type = 'button'; detail.className = 'song-inspector-detail'; detail.textContent = '详细修改';
        detail.addEventListener('click', () => { commitName(); try { view?.onDetail?.(); } catch (error) { onError(error); } }); identity.append(detail);
      }
      if (next.onColor) {
        const color = document.createElement('button'); color.type = 'button'; color.className = 'song-inspector-color'; color.title = '颜色'; color.setAttribute('aria-label', '行颜色');
        color.style.backgroundColor = next.color ?? '#cbd3dc'; color.addEventListener('click', () => { try { view?.onColor?.(); } catch (error) { onError(error); } }); identity.append(color);
      }
      const details = document.createElement('div'); details.className = 'song-inspector-details';
      for (const item of next.details) {
        const group = document.createElement('div'); const label = document.createElement('span'); label.textContent = item.label;
        const value = document.createElement('strong'); value.textContent = item.value; group.append(label, value); details.append(group); detailNodes.push(value);
      }
      const mix = document.createElement('div'); mix.className = 'song-inspector-sliders';
      if (next.onMix && next.level !== undefined) mix.append(mixControl('level', next.kind === 'row' ? '音量增益' : '音量', next.level));
      if (next.onMix && next.pan !== undefined) mix.append(mixControl('pan', next.kind === 'row' ? '声像增益' : '声像', next.pan));
      root.replaceChildren(identity, details, mix);
    } else {
      view = next;
      if (name && name.readOnly) name.value = next.name;
      next.details.forEach((detail, index) => { if (detailNodes[index]) detailNodes[index]!.textContent = detail.value; });
      for (const field of ['level', 'pan'] as const) if (dragging !== field && next[field] !== undefined) setControl(field, next[field]!);
      const color = root.querySelector<HTMLElement>('.song-inspector-color'); if (color) color.style.backgroundColor = next.color ?? '#cbd3dc';
      updateAudition();
    }
  }
  return { element: root, update,
    flush() { commitName(); if (dragging) controls.get(dragging)?.commit(); for (const control of controls.values()) if (control.dirty) control.commit(); },
    pointerEnd() { if (dragging) controls.get(dragging)?.commit(); },
    cancel() { dragging = undefined; for (const control of controls.values()) control.dirty = false; },
  };
}
