import type { KeyboardPitch, PhraseBody, PhraseEditorPort, PhraseNote, PhrasePart } from '../../contracts/phrase.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import { createPhraseAudition } from './phrase-audition.ts';
import { phrasePitchRow } from './phrase-viewport.ts';
import { playlistSegmentIntersectsRect } from './playlist-geometry.ts';
import { melodyEntryKey, melodyEntryPitch, nextMelodyEntryStep } from './melody-key-entry.ts';
import { recordPerformanceEntry, undoPhraseEdit, redoPhraseEdit } from './phrase-performance-history.ts';
import { melodyBeats, melodyClamp, melodyDuration, melodyGrid, melodyNoteRect, melodyScale, melodySeconds,
  melodyTimeAt, clampMelodyView, zoomMelody, type MelodyView } from './melody-geometry.ts';
import './melody-workspace.css';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag); element.className = className; element.textContent = text; return element;
}
function button(text: string, className: string, callback: () => void): HTMLButtonElement {
  const element = node('button', className, text); element.type = 'button'; element.addEventListener('click', callback); return element;
}
type NoteChanges = Partial<Omit<PhraseNote, 'id'>>;
type Point = { x: number; y: number };
type Selection = { partId: string; noteId?: string };
type LibraryIntent = { kind: 'create' } | { kind: 'replace'; partId: string };
type Gesture = { id: number; capture: HTMLElement; base: PhraseBody; draftId: string; from: Point; last: Point } & (
  { kind: 'head' } | { kind: 'pan' } |
  { kind: 'erase'; refs: Map<string, { partId: string; noteId: string }> } |
  { kind: 'note' | 'create' | 'resize'; partId: string; targetPartId?: string; note: PhraseNote; changes: NoteChanges; rawY: number; moved: boolean });
type Mix = { partId: string; note: PhraseNote; base: PhraseBody; changes: NoteChanges; pointerId?: number };
const MIN_BEATS = 1 / 1024;
const COLORS = ['#8bb6e8', '#e9a184', '#8ac7b2', '#c0a3e2', '#e4c374', '#89c4d5', '#d89dbb', '#b3c982'];
const RHYTHM_PITCH = 261.6255653005986;
const TIMBRE_DRAG_TYPE = 'application/x-rootsound-timbre';

/** Piano-roll editing owns no audio clock: every audition/preview uses the common sound boundary. */
export function mountMelodyWorkspace(root: HTMLElement, options: {
  phrase: PhraseEditorPort; sound: SoundRuntimePort; gridBpm(): number;
  onChange(): void; onPreview(body?: PhraseBody): void; onSeek(seconds: number): void | Promise<void>;
  readPlayhead?(): number;
  readPerformanceMode?(): boolean;
  listTimbres(): Array<{ id: string; name: string }>; onAddTimbre(id: string): string;
  onCreateNoteGroup?(id: string): string;
  onChangeNoteGroupTimbre?(partId: string, timbreId: string): void;
  onRemoveTimbre?(id: string): void;
  section?: 'melody' | 'rhythm';
}): { refresh(): void; dispose(): void; flush(): void; setPlayhead(seconds: number): void; isStepInputActive(): boolean } {
  const { phrase, sound } = options; let current = phrase.read(); let disposed = false;
  const rhythm = options.section === 'rhythm';
  const keys: KeyboardPitch[] = phrase.keyboard().slice().reverse();
  let view: MelodyView = { leftSeconds: 0, zoom: current.body ? 8 / melodyDuration(current.body) : 1, rowHeight: rhythm ? 72 : 24 };
  let selection: Selection | undefined; let gesture: Gesture | undefined; let mix: Mix | undefined;
  let playheadSeconds = 0; let library: HTMLDialogElement | undefined; let observer: ResizeObserver | undefined;
  let entryOctave = 4;
  let entryToneId: string | undefined;
  let deleteToneArmed: { partId: string; at: number } | undefined;
  let libraryRefresh: (() => void) | undefined; let libraryError: HTMLElement | undefined;
  let draggedTone: { id: string; draftId: string } | undefined; let suppressLibraryClickUntil = 0;
  let doubleNudge: { key: string; identity: string; at: number; start: number; beat: number } | undefined;
  let noticeTimer = 0; const addedParts = new Set<string>(); const noteNodes = new Map<string, HTMLButtonElement>();
  const toneColors = new Map<string, number>();
  let toneNames = new Map<string, string>();
  const page = node('div', 'melody-workspace'); const main = node('div', 'melody-main'); const shelf = node('aside', 'melody-shelf');
  page.classList.toggle('rhythm-workspace', rhythm);
  shelf.setAttribute('aria-label', rhythm ? '音色栏' : '音符栏');
  const roll = node('div', 'melody-roll'); const rulerRow = node('div', 'melody-ruler-row'); const ruler = node('div', 'melody-ruler');
  const headHandle = button('', 'melody-head-handle', () => {}); headHandle.setAttribute('aria-label', rhythm ? '节奏播放头' : '旋律播放头'); headHandle.setAttribute('role', 'slider');
  ruler.append(headHandle); rulerRow.append(node('div', 'melody-ruler-spacer'), ruler, node('div', 'melody-extend-cap'));
  const scroll = node('div', 'melody-scroll'); scroll.tabIndex = 0; scroll.setAttribute('aria-label', rhythm ? '节奏步进音序器' : '旋律钢琴卷帘');
  const world = node('div', 'melody-world'); const keyboard = node('div', 'melody-keys'); const canvas = node('div', 'melody-canvas');
  const rows = node('div', 'melody-rows'); const grid = node('div', 'melody-grid'); const notes = node('div', 'melody-notes');
  const head = node('div', 'melody-playhead'); head.setAttribute('aria-hidden', 'true'); const afterEnd = node('div', 'melody-after-end'); canvas.append(rows, grid, notes, head, afterEnd); world.append(keyboard, canvas); scroll.append(world);
  const editor = node('div', 'melody-editor'); const extend = button('+', 'melody-extend', extendMeasure); extend.setAttribute('aria-label', '增加一个小节'); editor.append(scroll, extend);
  const console = node('div', 'melody-console'); console.hidden = true; roll.append(rulerRow, editor, console); main.append(shelf, roll);
  const notice = node('div', 'melody-notice'); notice.hidden = true; notice.setAttribute('role', 'status'); page.append(main, notice); root.replaceChildren(page);
  const audition = createPhraseAudition(phrase, sound, () => selection?.partId, message => report(message));
  const toneTrash = node('div', 'melody-tone-trash'); toneTrash.hidden = true; toneTrash.setAttribute('role', 'region'); toneTrash.setAttribute('aria-label', '从当前乐句删除音色');
  const trashIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); trashIcon.setAttribute('viewBox', '0 0 24 24'); trashIcon.setAttribute('aria-hidden', 'true');
  const trashPath = document.createElementNS('http://www.w3.org/2000/svg', 'path'); trashPath.setAttribute('d', 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7');
  for (const [key, value] of Object.entries({ fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) trashPath.setAttribute(key, value);
  trashIcon.append(trashPath); toneTrash.append(trashIcon); page.append(toneTrash);
  const width = () => Math.max(1, canvas.clientWidth || scroll.clientWidth - (rhythm ? 0 : 64));
  const body = () => current.body;
  const sectionParts = (value = body()) => (value?.parts ?? []).filter(part => (part.section ?? 'melody') === (rhythm ? 'rhythm' : 'melody'));
  function clampView(next: MelodyView, duration: number): MelodyView {
    const clamped = clampMelodyView(next, duration);
    return rhythm ? { ...clamped, rowHeight: melodyClamp(next.rowHeight, 48, 120) } : clamped;
  }
  function report(message: string): void {
    if (disposed) return; notice.textContent = message; notice.hidden = !message;
    if (libraryError) { libraryError.textContent = message; libraryError.hidden = !message; }
    window.clearTimeout(noticeTimer); noticeTimer = window.setTimeout(() => { if (!disposed) notice.hidden = true; }, 6000);
  }
  function notify(): void { if (!disposed) options.onChange(); }
  function preview(value?: PhraseBody): void { if (!disposed) options.onPreview(value); }
  function part(id = selection?.partId): PhrasePart | undefined { return sectionParts().find(value => value.id === id); }
  function partLabel(value: PhrasePart): string { return value.unassigned ? '未定义' : rhythm ? value.name : toneNames.get(value.timbreId) ?? value.name; }
  function toneColor(id: string): string {
    let index = toneColors.get(id);
    if (index === undefined) {
      let hash = 0; for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
      index = hash % COLORS.length; const used = new Set(toneColors.values());
      while (used.has(index) && used.size < COLORS.length) index = (index + 1) % COLORS.length;
      toneColors.set(id, index);
    }
    return COLORS[index]!;
  }
  function picked(): PhraseNote | undefined { return part()?.notes.find(value => value.id === selection?.noteId); }
  function displayedBody(): PhraseBody | undefined {
    const active = gesture; const base = mix?.base ?? active?.base ?? body(); if (!base) return;
    if (mix) return replaceNote(base, mix.partId, mix.note.id, { ...mix.note, ...mix.changes });
    if (!active || active.kind === 'pan' || active.kind === 'head') return base;
    if (active.kind === 'erase') return { ...base, parts: base.parts.map(value => ({ ...value, notes: value.notes.filter(note => !active.refs.has(note.id)) })) };
    const next = { ...active.note, ...active.changes };
    if (active.kind === 'note' && active.targetPartId && active.targetPartId !== active.partId) {
      return { ...base, parts: base.parts.map(value => value.id === active.partId ? { ...value, notes: value.notes.filter(note => note.id !== next.id) }
        : value.id === active.targetPartId ? { ...value, notes: [...value.notes, next] } : value) };
    }
    return replaceNote(base, active.partId, active.note.id, next, active.kind === 'create');
  }
  function replaceNote(base: PhraseBody, partId: string, noteId: string, next: PhraseNote, create = false): PhraseBody {
    return { ...base, parts: base.parts.map(value => value.id !== partId ? value : { ...value,
      notes: create ? [...value.notes, next] : value.notes.map(note => note.id === noteId ? next : note) }) };
  }
  function visibleParts(value = body()): PhrasePart[] {
    return sectionParts(value).filter(value => {
      if (value.unassigned || value.notes.length || addedParts.has(value.id) || !/^乐句 [1-9]\d* 音色$/u.test(value.name)) return true;
      const record = current.availableSounds.find(record => record.id === value.timbreId); const voice = record?.body;
      return !record || record.name !== value.name || record.dependencies.length !== 0 || !voice || typeof voice !== 'object' || Array.isArray(voice)
        || voice.model !== 'basic-synth' || voice.character !== 'warm' || voice.attackSeconds !== .025 || voice.releaseSeconds !== .55 || voice.level !== .65;
    });
  }
  function choose(next: Selection): void { if (!safeFlush()) return; selection = next; entryToneId = !rhythm && !next.noteId ? next.partId : undefined; doubleNudge = undefined; deleteToneArmed = undefined; audition.sync(); paintShelf(); paintNotes(); paintConsole(); }
  function paintShelf(): void {
    shelf.replaceChildren();
    for (const [index, value] of visibleParts().entries()) {
      const entry = node('div', 'melody-tone-entry');
      const card = button(partLabel(value), rhythm ? 'melody-tone' : 'melody-tone melody-note-family', () => { if (!disposed) { choose({ partId: value.id }); scroll.focus({ preventScroll: true }); } });
      if (!rhythm) card.title = '总音符';
      card.dataset.partId = value.id; card.style.setProperty('--tone-color', toneColor(value.timbreId)); card.classList.toggle('is-selected', selection?.partId === value.id);
      card.classList.toggle('is-unassigned', !!value.unassigned);
      const play = button('▶', 'melody-tone-preview', () => { if (!disposed && !value.unassigned) void audition.requestTimbre(value.timbreId); });
      play.setAttribute('aria-label', `试听${partLabel(value)}`); play.disabled = !!value.unassigned; play.title = value.unassigned ? '尚未定义音色' : '试听音色'; entry.append(card, play);
      if (rhythm) {
        const top = 24 + index * view.rowHeight - scroll.scrollTop; const bottom = Math.min(24 + scroll.clientHeight, shelf.clientHeight - 44);
        entry.style.top = `${top}px`; entry.style.height = `${view.rowHeight}px`; entry.style.clipPath = `inset(${Math.max(0, 24 - top)}px 0 ${Math.max(0, top + view.rowHeight - bottom)}px 0)`; card.dataset.rowIndex = String(index); card.style.height = `${view.rowHeight}px`;
      }
      shelf.append(entry);
    }
    const add = button('+', rhythm ? 'melody-add-tone' : 'melody-add-tone melody-add-note-family', () => openLibrary()); add.setAttribute('aria-label', rhythm ? '添加音色' : '新建总音符'); shelf.append(add);
  }
  function openLibrary(intent: LibraryIntent = { kind: 'create' }): void {
    if (disposed || library || !safeFlush()) return;
    if (!rhythm && intent.kind === 'replace' && !part(intent.partId)) { report('找不到这个总音符，请重新选择。'); return; }
    const openedDraftId = current.draft?.id;
    const dialog = node('dialog', 'melody-tone-library'); library = dialog; dialog.setAttribute('aria-label', '音色库');
    const heading = node('div', 'melody-library-heading'); const close = button('→', 'melody-library-close', () => dialog.close()); close.setAttribute('aria-label', '关闭音色库');
    heading.append(node('h2', '', '音色库'), close); const tiles = node('div', 'melody-library-grid'); const error = node('p', 'melody-library-error'); error.hidden = true;
    libraryError = error;
    libraryRefresh = () => {
      tiles.replaceChildren();
      for (const timbre of options.listTimbres()) {
        const uses = sectionParts().filter(part => part.timbreId === timbre.id); const selected = uses.some(part => !part.unassigned && visibleParts().some(visible => visible.id === part.id));
        const frame = node('div', 'melody-library-card'); frame.draggable = true; frame.dataset.timbreId = timbre.id;
        const tile = button(timbre.name, 'melody-library-tone', () => {
          if (disposed || library !== dialog || draggedTone || Date.now() < suppressLibraryClickUntil || !safeFlush()) return;
          try {
            error.hidden = true; error.textContent = '';
            if (!rhythm) {
              if (!openedDraftId || phrase.read().draft?.id !== openedDraftId) throw new Error('当前乐句已改变，请重新打开音色库。');
              let id: string;
              if (intent.kind === 'replace') {
                if (options.onChangeNoteGroupTimbre) options.onChangeNoteGroupTimbre(intent.partId, timbre.id);
                else phrase.setPartTimbre(intent.partId, timbre.id);
                id = intent.partId;
              }
              else id = options.onCreateNoteGroup ? options.onCreateNoteGroup(timbre.id) : phrase.addPart(timbre.id, 'melody');
              current = phrase.read(); if (!part(id)) throw new Error('这个总音符暂时无法创建，请重试。');
              addedParts.add(id); selection = { partId: id }; entryToneId = id; deleteToneArmed = undefined;
              dialog.close(); refresh(); notify(); scroll.focus({ preventScroll: true }); return;
            }
            const matches = sectionParts().filter(part => part.timbreId === timbre.id);
            if (matches.length) phrase.setPartsVisible(matches.map(part => part.id), !selected);
            else { const id = options.onAddTimbre(timbre.id); current = phrase.read(); if (!part(id)) throw new Error('这个音色暂时无法加入乐句。'); addedParts.add(id); }
            current = phrase.read(); const voice = sectionParts().find(part => part.timbreId === timbre.id);
            if (voice) { addedParts.add(voice.id); selection = { partId: voice.id }; entryToneId = rhythm ? undefined : voice.id; }
            deleteToneArmed = undefined; refresh(); notify();
          } catch (reason) { error.hidden = false; error.textContent = reason instanceof Error ? reason.message : String(reason); }
        });
        tile.dataset.timbreId = timbre.id; if (rhythm) { tile.setAttribute('aria-pressed', String(selected)); tile.classList.toggle('is-on-shelf', selected); }
        const play = button('▶', 'melody-tone-preview melody-library-preview', () => { if (!disposed && library === dialog) void audition.requestTimbre(timbre.id); });
        play.setAttribute('aria-label', `试听${timbre.name}`); frame.append(tile, play);
        frame.addEventListener('dragstart', event => {
          if (disposed || library !== dialog || !event.dataTransfer || !current.draft) { event.preventDefault(); return; }
          audition.cancel(); draggedTone = { id: timbre.id, draftId: current.draft.id }; event.dataTransfer.setData(TIMBRE_DRAG_TYPE, timbre.id); event.dataTransfer.effectAllowed = 'move'; toneTrash.hidden = false;
        });
        frame.addEventListener('dragend', endToneDrag); tiles.append(frame);
      }
    };
    libraryRefresh(); dialog.append(heading, tiles, error, toneTrash); dialog.addEventListener('close', () => { if (library === dialog) { library = undefined; libraryRefresh = undefined; libraryError = undefined; } endToneDrag(); audition.cancel(); page.append(toneTrash); dialog.remove(); }); root.append(dialog); dialog.showModal();
  }
  function endToneDrag(): void { if (draggedTone) suppressLibraryClickUntil = Date.now() + 250; draggedTone = undefined; toneTrash.hidden = true; toneTrash.classList.remove('is-over'); }
  toneTrash.addEventListener('dragover', event => { if (!draggedTone) return; event.preventDefault(); toneTrash.classList.add('is-over'); if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'; });
  toneTrash.addEventListener('dragleave', () => toneTrash.classList.remove('is-over'));
  toneTrash.addEventListener('drop', event => {
    event.preventDefault(); event.stopPropagation(); const dragged = draggedTone;
    if (!dragged || disposed || current.draft?.id !== dragged.draftId || event.dataTransfer?.getData(TIMBRE_DRAG_TYPE) !== dragged.id) { endToneDrag(); return; }
    try {
      if (options.onRemoveTimbre) options.onRemoveTimbre(dragged.id);
      else { const ids = sectionParts().filter(part => part.timbreId === dragged.id).map(part => part.id); if (ids.length) phrase.removeParts(ids); }
      endToneDrag(); refresh(); notify();
    } catch (error) { endToneDrag(); report(error instanceof Error ? error.message : String(error)); }
  });
  function paintRows(): void {
    if (rhythm) {
      world.style.height = `${Math.max(1, visibleParts().length) * view.rowHeight + 52}px`; keyboard.replaceChildren(); rows.replaceChildren();
      visibleParts().forEach((voice, index) => { const row = node('div', 'melody-pitch-row rhythm-tone-row'); row.dataset.partId = voice.id; row.dataset.rowIndex = String(index); row.style.top = `${index * view.rowHeight}px`; row.style.height = `${view.rowHeight}px`; rows.append(row); });
      return;
    }
    world.style.height = `${keys.length * view.rowHeight}px`; keyboard.replaceChildren(); rows.replaceChildren();
    keys.forEach((pitch, index) => {
      const key = button(pitch.label, 'melody-key', () => { if (!disposed && selection) void audition.request(pitch.frequencyHz); });
      key.classList.toggle('is-accidental', pitch.accidental); key.style.top = `${index * view.rowHeight}px`; key.style.height = `${view.rowHeight}px`; key.dataset.frequencyHz = String(pitch.frequencyHz);
      key.setAttribute('aria-label', `${pitch.label} ${Number(pitch.frequencyHz.toFixed(2))} Hz`); keyboard.append(key);
      const row = node('div', 'melody-pitch-row'); row.classList.toggle('is-accidental', pitch.accidental); row.style.top = key.style.top; row.style.height = key.style.height; rows.append(row);
    });
    paintEntryRange();
  }
  function paintEntryRange(): void {
    const armed = !rhythm && (options.readPerformanceMode?.() ?? false) && !!entryToneId && !!part(entryToneId);
    for (const key of keyboard.querySelectorAll<HTMLButtonElement>('.melody-key')) {
      const midi = Math.round(69 + 12 * Math.log2(Number(key.dataset.frequencyHz) / 440));
      const active = armed && Math.floor(midi / 12) - 1 === entryOctave;
      key.classList.toggle('is-entry-range', active);
      key.title = active ? '键盘输入音区 · Z / X 切换' : '';
    }
  }
  function noteRect(note: PhraseNote, voice: PhrasePart, value: PhraseBody) {
    const rect = melodyNoteRect(note, value, keys, view, width());
    return rhythm ? { ...rect, y: visibleParts(value).findIndex(part => part.id === voice.id) * view.rowHeight + 7, height: view.rowHeight - 14 } : rect;
  }
  function paintGrid(): void {
    const value = body(); grid.replaceChildren(); if (!value) return;
    const duration = melodyDuration(value); const scale = melodyScale(view, width(), duration);
    for (const line of melodyGrid(duration, options.gridBpm())) {
      const x = (line.seconds - view.leftSeconds) * scale; if (x < -1 || x > width() + 1) continue;
      const element = node('i', 'melody-grid-line'); element.classList.toggle('is-bar', line.bar); element.classList.toggle('is-beat', line.beat); element.style.left = `${x}px`; grid.append(element);
    }
    const endX = (duration - view.leftSeconds) * scale; afterEnd.hidden = endX > width(); afterEnd.style.left = `${Math.max(0, endX)}px`;
  }
  function paintNotes(): void {
    const value = displayedBody(); const seen = new Set<string>();
    for (const voice of sectionParts(value)) for (const note of voice.notes) {
      if (note.startBeat >= value!.lengthBeats || note.startBeat + note.durationBeats <= 0) continue;
      seen.add(note.id); let block = noteNodes.get(note.id);
      if (!block) { block = button('', 'melody-note', () => {}); const resize = node('span', 'melody-note-resize'); block.append(resize); notes.append(block); noteNodes.set(note.id, block); }
      const name = partLabel(voice);
      block.dataset.noteId = note.id; block.dataset.partId = voice.id; block.setAttribute('aria-label', rhythm ? name : `${name} ${keys[phrasePitchRow(note.frequencyHz, keys)]?.label ?? ''}`);
      block.title = rhythm ? name : `${name} · ${Number(note.frequencyHz.toFixed(2))} Hz`;
      const rect = noteRect(note, voice, value!);
      const active = gesture; let top = rect.y;
      if (active && active.kind === 'note' && active.note.id === note.id) top = rhythm
        ? visibleParts(active.base).findIndex(part => part.id === active.partId) * view.rowHeight + 7 + active.rawY
        : phrasePitchRow(active.note.frequencyHz, keys) * view.rowHeight + 1 + active.rawY;
      block.style.left = `${rect.x}px`; block.style.top = `${top}px`; block.style.width = `${rect.width}px`; block.style.height = `${rect.height}px`;
      block.style.setProperty('--tone-color', voice.unassigned ? '#b6bcc4' : toneColor(voice.timbreId)); block.classList.toggle('is-unassigned', !!voice.unassigned); block.classList.toggle('is-dim', !!selection && selection.noteId !== note.id && (rhythm ? part(selection.partId)?.timbreId !== voice.timbreId : selection.partId !== voice.id));
      block.classList.toggle('is-selected', selection?.noteId === note.id); block.classList.toggle('is-dragging', !!active && 'note' in active && active.note.id === note.id);
    }
    for (const [id, element] of noteNodes) if (!seen.has(id)) { element.remove(); noteNodes.delete(id); }
    paintEntryRange(); positionHead();
  }
  function positionHead(): void {
    const value = body(); if (!value) return;
    const x = (playheadSeconds - view.leftSeconds) * melodyScale(view, width(), melodyDuration(value));
    const hidden = x < 0 || x > width(); head.hidden = headHandle.hidden = hidden;
    head.style.left = headHandle.style.left = `${melodyClamp(x, 0, width() - 1)}px`; headHandle.setAttribute('aria-valuenow', String(playheadSeconds));
  }
  function field(label: string, input: HTMLElement, output?: HTMLElement): void {
    const wrap = node('label', 'melody-field'); const line = node('span', 'melody-field-head', label); if (output) line.append(output); wrap.append(line, input); console.append(wrap);
  }
  function beginMix(): Mix | undefined {
    if (mix) return mix; const selected = picked(); const value = body(); if (!selection || !selected || !value) return;
    return mix = { partId: selection.partId, note: selected, base: value, changes: {} };
  }
  function inputPreview(changes: NoteChanges): void { const active = beginMix(); if (!active) return; active.changes = { ...active.changes, ...changes }; preview(displayedBody()); paintNotes(); }
  function slider(label: string, property: 'level' | 'pan' | 'velocity', value: number, min: number): void {
    const input = node('input'); input.type = 'range'; input.min = String(min); input.max = '1'; input.step = '.01'; input.value = String(value); input.setAttribute('aria-label', label);
    const output = node('output'); const text = (amount: number) => property === 'pan' ? Math.abs(amount) < .005 ? '中' : `${amount < 0 ? '左' : '右'}${Math.round(Math.abs(amount) * 100)}` : `${Math.round(amount * 100)}%`;
    output.textContent = text(value);
    input.addEventListener('pointerdown', event => { const active = beginMix(); if (active) active.pointerId = event.pointerId; });
    input.addEventListener('input', () => { if (disposed) return; const amount = Number(input.value); if (!Number.isFinite(amount)) return; const next = melodyClamp(amount, min, 1); output.textContent = text(next); inputPreview({ [property]: next }); });
    input.addEventListener('change', commitMix); input.addEventListener('blur', commitMix); field(label, input, output);
  }
  function numberField(label: string, value: number, property: 'startBeat' | 'durationBeats'): void {
    const input = node('input'); input.type = 'number'; input.min = property === 'startBeat' ? '0' : '.01'; input.max = property === 'startBeat' ? String(melodySeconds(body()!.lengthBeats - .25, body()!.tempoBpm)) : '96'; input.step = property === 'startBeat' ? String(60 / body()!.tempoBpm / 4) : '.01'; input.value = String(Number(value.toFixed(4))); input.setAttribute('aria-label', label);
    input.addEventListener('input', () => {
      if (disposed || !input.value.trim()) return; const seconds = Number(input.value); const active = beginMix(); if (!Number.isFinite(seconds) || !active) return;
      const note = { ...active.note, ...active.changes }; const limit = active.base.lengthBeats;
      const hold = property === 'durationBeats' ? melodyClamp(seconds, .01, 96) : note.durationSeconds ?? melodySeconds(note.durationBeats, active.base.tempoBpm);
      const start = property === 'startBeat' ? melodyClamp(Math.round(melodyBeats(seconds, active.base.tempoBpm) * 4) / 4, 0, limit - .25) : note.startBeat;
      inputPreview({ startBeat: start, durationSeconds: hold, durationBeats: melodyClamp(melodyBeats(hold, active.base.tempoBpm), MIN_BEATS, active.base.lengthBeats - start) });
    }); input.addEventListener('change', commitMix); input.addEventListener('blur', commitMix); field(label, input);
  }
  function paintConsole(): void {
    console.replaceChildren(); const voice = part(); const note = picked(); console.hidden = !voice; if (!voice) { if (rhythm) paintShelf(); return; }
    console.append(node('strong', 'melody-console-name', partLabel(voice)));
    if (!note) {
      if (!rhythm) {
        const change = button('更换音色', 'melody-change-timbre', () => { if (!disposed) openLibrary({ kind: 'replace', partId: voice.id }); });
        change.setAttribute('aria-label', '更换总音符的音色'); console.append(change);
      }
      const remove = button('删除', 'melody-delete-tone-notes', () => {}); remove.title = '双击删除这个音色的全部音符'; remove.setAttribute('aria-label', '删除这个音色的全部音符'); remove.classList.toggle('is-armed', deleteToneArmed?.partId === voice.id);
      remove.addEventListener('dblclick', event => { event.preventDefault(); deleteToneNotes(); }); console.append(remove);
      if (rhythm) paintShelf(); return;
    }
    slider('音量', 'level', note.level ?? 1, 0); slider('声像', 'pan', note.pan ?? 0, -1);
    if (!rhythm) { const pitch = node('select'); pitch.setAttribute('aria-label', '音高');
    const exact = keys.some(key => key.frequencyHz === note.frequencyHz);
    if (!exact) { const option = node('option', '', `${Number(note.frequencyHz.toFixed(2))} Hz`); option.value = String(note.frequencyHz); pitch.append(option); }
    for (const key of keys) { const option = node('option', '', key.label); option.value = String(key.frequencyHz); pitch.append(option); } pitch.value = String(note.frequencyHz);
    pitch.addEventListener('change', () => { if (disposed || !selection) return; const hz = Number(pitch.value); if (Number.isFinite(hz)) { inputPreview({ frequencyHz: melodyClamp(hz, 20, 5000) }); commitMix(); void audition.request(hz); } }); field('音高', pitch); }
    numberField('开始 / 秒', melodySeconds(note.startBeat, body()!.tempoBpm), 'startBeat'); numberField('时长 / 秒', note.durationSeconds ?? melodySeconds(note.durationBeats, body()!.tempoBpm), 'durationBeats'); slider('力度', 'velocity', note.velocity, 0);
    if (rhythm) paintShelf();
  }
  function commitMix(): Error | undefined {
    const active = mix; if (!active || disposed) return; mix = undefined;
    try { if (Object.keys(active.changes).length) phrase.updateNote(active.partId, active.note.id, active.changes); preview(); current = phrase.read(); refresh(); if (Object.keys(active.changes).length) notify(); }
    catch (error) { preview(); const failure = error instanceof Error ? error : new Error(String(error)); report(failure.message); current = phrase.read(); refresh(); return failure; }
  }
  function refresh(): void {
    if (disposed) return; const previous = part(); current = phrase.read(); const next = body();
    toneNames = new Map([...current.availableSounds.map(record => [record.id, record.name] as const), ...options.listTimbres().map(record => [record.id, record.name] as const)]);
    if (selection && !part()) { const replacement = sectionParts(next).find(value => value.timbreId === previous?.timbreId || value.name === previous?.name); selection = replacement ? { partId: replacement.id } : undefined; }
    if (selection?.noteId && !picked()) selection = { partId: selection.partId };
    if (entryToneId && !part(entryToneId)) entryToneId = undefined;
    const ids = new Set(next?.parts.map(value => value.timbreId)); for (const id of toneColors.keys()) if (!ids.has(id)) toneColors.delete(id);
    for (const voice of next?.parts ?? []) toneColor(voice.timbreId);
    if (next) view = clampView(view, melodyDuration(next)); audition.sync(); paintShelf(); if (rhythm) paintRows(); paintGrid(); paintNotes(); if (!mix) paintConsole();
    extend.disabled = !next || next.lengthBeats >= 64; extend.title = extend.disabled ? '已达当前长度上限' : '增加一个小节'; libraryRefresh?.();
  }
  function deleteToneNotes(): void {
    if (!safeFlush()) return; const voice = part(); if (!voice) return;
    try {
      if (voice.notes.length) { phrase.removeNotes(voice.notes.map(note => ({ partId: voice.id, noteId: note.id }))); deleteToneArmed = undefined; refresh(); notify(); }
    } catch (error) { report(error instanceof Error ? error.message : String(error)); }
  }
  function extendMeasure(): void {
    if (disposed || library || !safeFlush()) return; const value = body(); if (!value || value.lengthBeats >= 64) return;
    try {
      phrase.setLength(Math.min(64, value.lengthBeats + 4)); current = phrase.read();
      const duration = melodyDuration(body()!); view = clampView({ ...view, leftSeconds: Math.max(0, duration - 8 / view.zoom) }, duration);
      refresh(); notify(); scroll.focus({ preventScroll: true });
    } catch (error) { report(error instanceof Error ? error.message : String(error)); }
  }
  function point(event: Pick<PointerEvent, 'clientX' | 'clientY'>): Point { return { x: event.clientX - canvas.getBoundingClientRect().left, y: event.clientY - scroll.getBoundingClientRect().top + scroll.scrollTop }; }
  function seek(event: Pick<PointerEvent, 'clientX' | 'clientY'>): void {
    const value = body(); if (!value) return; playheadSeconds = melodyTimeAt(view, width(), melodyDuration(value), point(event).x); options.onSeek(playheadSeconds); positionHead();
  }
  function begin(event: PointerEvent, headGesture = false): void {
    if (disposed || library || (event.button !== 0 && event.button !== 1 && event.button !== 2)) return;
    const target = event.target as HTMLElement;
    if (target.closest('.melody-key') && !headGesture) return;
    event.preventDefault(); if (!safeFlush()) return; const value = body(); if (!value) return; scroll.focus({ preventScroll: true });
    const from = point(event); const base = { id: event.pointerId, capture: headGesture ? ruler : scroll, base: value, draftId: current.draft!.id, from, last: from };
    if (headGesture) { gesture = { ...base, kind: 'head' }; seek(event); }
    else if (event.button === 2) {
      gesture = { ...base, kind: 'erase', refs: new Map() };
      if (target.closest('.melody-note')) erase(from, from);
      else { selection = undefined; entryToneId = undefined; doubleNudge = undefined; deleteToneArmed = undefined; audition.sync(); }
    }
    else if (event.button === 1 || event.altKey || (!rhythm && !selection && !target.closest('.melody-note'))) gesture = { ...base, kind: 'pan' };
    else {
      const block = target.closest<HTMLElement>('.melody-note'); const voice = block ? part(block.dataset.partId) : rhythm ? visibleParts(value)[Math.floor(from.y / view.rowHeight)] : part(); const note = voice?.notes.find(item => item.id === block?.dataset.noteId);
      if (block && voice && note) {
        selection = { partId: voice.id, noteId: note.id }; entryToneId = undefined; audition.sync();
        const bounds = block.getBoundingClientRect();
        const resizing = !!target.closest('.melody-note-resize') || event.clientX >= bounds.right - Math.min(7, bounds.width * .25);
        gesture = { ...base, kind: resizing ? 'resize' : 'note', partId: voice.id, note, changes: {}, rawY: 0, moved: false };
        void audition.request(note.frequencyHz, note.durationSeconds ?? melodySeconds(note.durationBeats, value.tempoBpm), note.velocity);
      } else if (voice) {
        if (from.x < 0 || from.x >= (melodyDuration(value) - view.leftSeconds) * melodyScale(view, width(), melodyDuration(value))) return;
        const limit = value.lengthBeats; const start = melodyClamp(Math.floor(melodyBeats(melodyTimeAt(view, width(), melodyDuration(value), from.x), value.tempoBpm) * 4) / 4, 0, limit - .25);
        const row = melodyClamp(Math.floor(from.y / view.rowHeight), 0, keys.length - 1); const pitch = rhythm ? { frequencyHz: RHYTHM_PITCH } : keys[row]; if (!pitch) return;
        const seconds = 60 / options.gridBpm() / 4;
        const note: PhraseNote = { id: crypto.randomUUID(), startBeat: start, durationBeats: Math.min(limit - start, melodyBeats(seconds, value.tempoBpm)), durationSeconds: seconds, frequencyHz: pitch.frequencyHz, velocity: .75 };
        gesture = { ...base, kind: 'create', partId: voice.id, note, changes: {}, rawY: 0, moved: false }; selection = { partId: voice.id, noteId: note.id }; entryToneId = rhythm ? undefined : voice.id; preview(displayedBody());
        void audition.request(note.frequencyHz, seconds, note.velocity);
      }
    }
    if (gesture) gesture.capture.setPointerCapture?.(event.pointerId); doubleNudge = undefined; paintShelf(); paintNotes(); paintConsole();
  }
  function erase(from: Point, to: Point): void {
    const active = gesture; if (!active || active.kind !== 'erase') return;
    for (const voice of sectionParts(active.base)) for (const note of voice.notes) {
      if (note.startBeat >= active.base.lengthBeats) continue;
      if (playlistSegmentIntersectsRect(from, to, noteRect(note, voice, active.base))) active.refs.set(note.id, { partId: voice.id, noteId: note.id });
    }
    preview(displayedBody()); paintNotes();
  }
  function move(event: PointerEvent): void {
    const active = gesture; if (disposed || !active || active.id !== event.pointerId) return; event.preventDefault(); const now = point(event);
    if (active.kind === 'head') seek(event);
    else if (active.kind === 'pan') { view = clampView({ ...view, leftSeconds: view.leftSeconds + (active.last.x - now.x) / melodyScale(view, width(), melodyDuration(active.base)) }, melodyDuration(active.base)); scroll.scrollTop += active.last.y - now.y; if (rhythm) paintShelf(); paintGrid(); paintNotes(); }
    else if (active.kind === 'erase') erase(active.last, now);
    else {
      const scale = melodyScale(view, width(), melodyDuration(active.base)); const delta = melodyBeats((now.x - active.from.x) / scale, active.base.tempoBpm); const limit = active.base.lengthBeats;
      active.moved = active.moved || Math.abs(now.x - active.from.x) > 1 || Math.abs(now.y - active.from.y) > 1;
      if (active.kind === 'resize' || active.kind === 'create') {
        const seconds = melodyClamp((active.note.durationSeconds ?? melodySeconds(active.note.durationBeats, active.base.tempoBpm)) + (now.x - active.from.x) / scale, .01, 96);
        active.changes = { durationSeconds: seconds, durationBeats: melodyClamp(melodyBeats(seconds, active.base.tempoBpm), MIN_BEATS, limit - active.note.startBeat) };
      }
      else {
        const rowParts = visibleParts(active.base);
        const originalRow = rhythm ? rowParts.findIndex(part => part.id === active.partId) : phrasePitchRow(active.note.frequencyHz, keys);
        const rowCount = rhythm ? rowParts.length : keys.length;
        active.rawY = melodyClamp(now.y - active.from.y, -originalRow * view.rowHeight, (rowCount - 1 - originalRow) * view.rowHeight);
        const offset = Math.round(active.rawY / view.rowHeight); const pitch = keys[originalRow + offset];
        if (rhythm) active.targetPartId = rowParts[originalRow + offset]!.id;
        const startBeat = melodyClamp(active.note.startBeat + delta, 0, limit - .25);
        const seconds = active.note.durationSeconds ?? melodySeconds(active.note.durationBeats, active.base.tempoBpm);
        active.changes = { startBeat, durationSeconds: seconds, durationBeats: melodyClamp(melodyBeats(seconds, active.base.tempoBpm), MIN_BEATS, limit - startBeat), ...(!rhythm && offset && pitch ? { frequencyHz: pitch.frequencyHz } : {}) };
      }
      preview(displayedBody()); paintNotes();
    }
    // Pan changes the world's scroll offset: retain the point on its new clock,
    // so the next client-space movement is not cancelled by the previous scroll.
    active.last = active.kind === 'pan' ? point(event) : now;
  }
  function finish(commit: boolean): Error | undefined {
    const active = gesture; gesture = undefined; if (!active) return;
    if (active.capture.hasPointerCapture?.(active.id)) active.capture.releasePointerCapture(active.id);
    let changed = false; let failure: Error | undefined;
    try {
      if (commit && current.draft?.id === active.draftId) {
        if (active.kind === 'erase' && active.refs.size) { phrase.removeNotes([...active.refs.values()]); changed = true; if (selection?.noteId && active.refs.has(selection.noteId)) selection = { partId: selection.partId }; }
        else if (active.kind === 'create') {
          const { id: _id, ...note } = { ...active.note, ...active.changes }; const id = phrase.addNote(active.partId, note); selection = { partId: active.partId, noteId: id }; changed = true;
        } else if ((active.kind === 'note' || active.kind === 'resize') && active.moved) {
          const changes = { ...active.changes };
          if (changes.startBeat !== undefined) { changes.startBeat = melodyClamp(Math.round(changes.startBeat * 4) / 4, 0, active.base.lengthBeats - .25); changes.durationBeats = melodyClamp(melodyBeats(changes.durationSeconds!, active.base.tempoBpm), MIN_BEATS, active.base.lengthBeats - changes.startBeat); }
          if (rhythm && active.targetPartId && active.targetPartId !== active.partId) {
            phrase.moveNote(active.partId, active.note.id, active.targetPartId, changes); selection = { partId: active.targetPartId, noteId: active.note.id };
          } else phrase.updateNote(active.partId, active.note.id, changes);
          changed = true;
        }
      }
    } catch (error) { failure = error instanceof Error ? error : new Error(String(error)); report(failure.message); }
    preview(); refresh(); if (changed) notify();
    return failure;
  }
  function flush(): void { if (disposed) return; const failure = finish(true) ?? commitMix(); if (failure) throw failure; }
  function safeFlush(): boolean { try { flush(); return true; } catch { return false; } }
  function wheel(event: WheelEvent): void {
    const value = body(); if (disposed || !value || library) return; event.preventDefault(); if (!safeFlush()) return;
    if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
      const y = event.clientY - scroll.getBoundingClientRect().top; const row = (scroll.scrollTop + y) / view.rowHeight;
      view = { ...view, rowHeight: melodyClamp(view.rowHeight * Math.exp(-event.deltaY * .002), rhythm ? 48 : 12, rhythm ? 120 : 44) }; paintRows(); scroll.scrollTop = Math.max(0, row * view.rowHeight - y);
    } else if (event.ctrlKey || event.metaKey) { const rowHeight = view.rowHeight; view = zoomMelody(view, width(), melodyDuration(value), point(event).x, Math.exp(-event.deltaY * .002)); if (rhythm) view.rowHeight = rowHeight; }
    else if (event.shiftKey) scroll.scrollTop += event.deltaY || event.deltaX;
    else view = clampView({ ...view, leftSeconds: view.leftSeconds + (event.deltaX || event.deltaY) / melodyScale(view, width(), melodyDuration(value)) }, melodyDuration(value));
    if (rhythm) paintShelf(); paintGrid(); paintNotes();
  }
  function adjust(key: string, repeat: boolean): void {
    if (!safeFlush()) return;
    const note = picked(); const value = body(); if (!selection || !note || !value) return; const changes: NoteChanges = {};
    if (key === 'q' || key === 'e') changes.pan = melodyClamp((note.pan ?? 0) + (key === 'q' ? -.05 : .05), -1, 1);
    else if (key === 'w' || key === 's') changes.level = melodyClamp((note.level ?? 1) + (key === 's' ? -.05 : .05), 0, 1);
    else {
      const now = Date.now(); const prior = doubleNudge; const start = melodySeconds(note.startBeat, value.tempoBpm); let next = start + (key === 'a' ? -1 : 1) * 60 / options.gridBpm() / 4;
      if (!repeat && prior && prior.key === key && prior.identity === note.id && now - prior.at <= 150) { next = prior.start + (key === 'a' ? -prior.beat : prior.beat); doubleNudge = undefined; }
      else if (!repeat) doubleNudge = { key, identity: note.id, at: now, start, beat: 60 / options.gridBpm() };
      changes.startBeat = melodyClamp(Math.round(melodyBeats(next, value.tempoBpm) * 4) / 4, 0, value.lengthBeats - .25);
      changes.durationSeconds = note.durationSeconds ?? melodySeconds(note.durationBeats, value.tempoBpm); changes.durationBeats = melodyClamp(melodyBeats(changes.durationSeconds, value.tempoBpm), MIN_BEATS, value.lengthBeats - changes.startBeat);
    }
    try { phrase.updateNote(selection.partId, note.id, changes); refresh(); notify(); } catch (error) { report(error instanceof Error ? error.message : String(error)); }
  }
  function isEditable(target: EventTarget | null | undefined): boolean {
    return target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement || !!(target as HTMLElement | null)?.isContentEditable;
  }
  function isStepInputActive(): boolean {
    return !disposed && !rhythm && (options.readPerformanceMode?.() ?? false) && !!entryToneId && !!part(entryToneId) && !!body() && !library
      && !isEditable(document.activeElement) && !root.querySelector('dialog[open]') && !document.querySelector('dialog[open]');
  }
  function revealEntry(seconds: number, frequencyHz?: number): void {
    const value = body(); if (!value) return;
    const extent = melodyDuration(value); const scale = melodyScale(view, width(), extent); const span = width() / scale;
    if (seconds < view.leftSeconds || seconds >= view.leftSeconds + span) view = clampView({ ...view, leftSeconds: seconds < view.leftSeconds ? seconds : seconds - span + 60 / value.tempoBpm }, extent);
    if (frequencyHz !== undefined) {
      const top = phrasePitchRow(frequencyHz, keys) * view.rowHeight;
      if (top < scroll.scrollTop) scroll.scrollTop = top;
      else if (top + view.rowHeight > scroll.scrollTop + scroll.clientHeight) scroll.scrollTop = Math.max(0, top + view.rowHeight - scroll.clientHeight);
    }
    paintGrid(); paintNotes(); positionHead();
  }
  function typeStep(event: KeyboardEvent, key: string): boolean {
    const rest = event.code === 'Space' || key === ' ';
    if (!isStepInputActive() || event.ctrlKey || event.metaKey || event.altKey || !rest && key !== 'z' && key !== 'x' && !melodyEntryKey(key)) return false;
    event.preventDefault(); if (event.repeat || !safeFlush()) return true;
    const voice = part(entryToneId); const value = body(); if (!voice || !value) return true;
    if (key === 'z' || key === 'x') {
      entryOctave = melodyClamp(entryOctave + (key === 'z' ? -1 : 1), 0, 8); paintEntryRange();
      const active = [...keyboard.querySelectorAll<HTMLButtonElement>('.melody-key')].filter(key => key.classList.contains('is-entry-range'));
      if (active.length) {
        const centre = (Number.parseFloat(active[0]!.style.top) + Number.parseFloat(active.at(-1)!.style.top) + view.rowHeight) / 2;
        scroll.scrollTop = melodyClamp(centre - scroll.clientHeight / 2, 0, Math.max(0, keys.length * view.rowHeight - scroll.clientHeight));
      }
      return true;
    }
    const pitch = rest ? undefined : melodyEntryPitch(key, entryOctave);
    if (!rest && pitch === undefined) { report('这个音符超出当前支持的音高范围。'); return true; }
    const beforeSeconds = options.readPlayhead?.() ?? playheadSeconds;
    const step = nextMelodyEntryStep(beforeSeconds, value.tempoBpm, value.lengthBeats);
    if (!step || !rest && !step.canWrite) { report('已到乐句结尾。'); return true; }
    if (!rest) {
      let noteId: string;
      try { noteId = phrase.addNote(voice.id, { startBeat: step.startBeat, durationBeats: .25, durationSeconds: step.durationSeconds, frequencyHz: pitch!, velocity: .75 }); }
      catch (error) { report(error instanceof Error ? error.message : String(error)); return true; }
      recordPerformanceEntry(phrase, noteId, melodyBeats(beforeSeconds, value.tempoBpm), step.startBeat);
      selection = { partId: voice.id, noteId }; current = phrase.read(); refresh(); notify();
    }
    playheadSeconds = step.seconds; const ready = options.onSeek(step.seconds);
    if (!rest) void audition.request(pitch!, step.durationSeconds, .75, ready);
    revealEntry(step.seconds, pitch);
    return true;
  }
  function keydown(event: KeyboardEvent): void {
    const rangeUndo = event.key === 'Backspace' && event.target instanceof HTMLInputElement && event.target.type === 'range';
    if (disposed || library || event.isComposing || event.keyCode === 229 || isEditable(event.target) && !rangeUndo || root.querySelector('dialog[open]') || document.querySelector('dialog[open]')) return;
    const key = event.key.toLowerCase();
    if (key !== 'delete') deleteToneArmed = undefined;
    if (key === 'backspace' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      event.preventDefault(); if (event.repeat || !safeFlush() || !phrase.read().canUndo) return;
      try { historyMove(false); } catch (error) { report(error instanceof Error ? error.message : String(error)); }
      return;
    }
    if (!event.metaKey && !event.altKey && !event.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault(); if (!safeFlush()) return; const value = body(); if (!value) return;
      const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
      const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      if (event.ctrlKey && horizontal) {
        const rowHeight = view.rowHeight; view = zoomMelody(view, width(), melodyDuration(value), width() / 2, forward ? 1.15 : 1 / 1.15); if (rhythm) view.rowHeight = rowHeight;
      } else if (event.ctrlKey) {
        const row = (scroll.scrollTop + scroll.clientHeight / 2) / view.rowHeight;
        view.rowHeight = melodyClamp(view.rowHeight * (forward ? 1 / 1.15 : 1.15), rhythm ? 48 : 12, rhythm ? 120 : 44); paintRows();
        scroll.scrollTop = Math.max(0, row * view.rowHeight - scroll.clientHeight / 2);
      } else if (horizontal) view = clampView({ ...view, leftSeconds: view.leftSeconds + (forward ? 64 : -64) / melodyScale(view, width(), melodyDuration(value)) }, melodyDuration(value));
      else scroll.scrollTop = melodyClamp(scroll.scrollTop + (forward ? view.rowHeight : -view.rowHeight), 0, Math.max(0, (rhythm ? Math.max(1, visibleParts().length) * view.rowHeight + 52 : keys.length * view.rowHeight) - scroll.clientHeight));
      doubleNudge = undefined; if (rhythm) paintShelf(); paintGrid(); paintNotes(); return;
    }
    if (typeStep(event, key)) return;
    if (key === 'escape') { event.preventDefault(); if (gesture) finish(false); else if (mix) { mix = undefined; preview(); refresh(); } return; }
    if (event.ctrlKey || event.metaKey) {
      if (key === 'z' || key === 'y') { event.preventDefault(); if (!safeFlush()) return; try { historyMove(key === 'y' || event.shiftKey); } catch (error) { report(String(error)); } } return;
    }
    if (key === 'delete' && selection && !selection.noteId && !event.altKey && !event.shiftKey) {
      event.preventDefault(); if (event.repeat) return;
      const now = Date.now();
      if (deleteToneArmed?.partId === selection.partId && now - deleteToneArmed.at <= 500) { deleteToneArmed = undefined; deleteToneNotes(); }
      else { deleteToneArmed = { partId: selection.partId, at: now }; paintConsole(); }
      return;
    }
    if (!selection?.noteId) return; if (key !== 'a' && key !== 'd') doubleNudge = undefined;
    if (['q', 'e', 'w', 's', 'a', 'd'].includes(key)) { event.preventDefault(); adjust(key, event.repeat); }
    else if (key === 'delete') { event.preventDefault(); if (!safeFlush() || !selection?.noteId) return; const selected = selection; try { phrase.removeNote(selected.partId, selected.noteId!); selection = { partId: selected.partId }; refresh(); notify(); } catch (error) { report(String(error)); } }
  }
  function historyMove(redo: boolean): void {
    const seconds = redo ? redoPhraseEdit(phrase) : undoPhraseEdit(phrase);
    if (seconds !== undefined) { playheadSeconds = seconds; void options.onSeek(seconds); }
    refresh(); notify();
  }
  const up = (event: PointerEvent) => { if (gesture?.id === event.pointerId) finish(true); if (mix?.pointerId === event.pointerId) commitMix(); };
  const cancel = (event: PointerEvent) => { if (gesture?.id === event.pointerId) finish(false); if (mix?.pointerId === event.pointerId) { mix = undefined; preview(); refresh(); } };
  const resize = () => { if (!disposed) { if (rhythm) paintShelf(); paintGrid(); paintNotes(); } };
  scroll.addEventListener('pointerdown', event => begin(event)); ruler.addEventListener('pointerdown', event => { if (event.button === 0) begin(event, true); });
  scroll.addEventListener('contextmenu', event => event.preventDefault()); scroll.addEventListener('wheel', wheel, { passive: false }); ruler.addEventListener('wheel', wheel, { passive: false });
  if (rhythm) scroll.addEventListener('scroll', paintShelf);
  const lost = (event: PointerEvent) => { if (gesture?.id === event.pointerId) finish(false); };
  scroll.addEventListener('lostpointercapture', lost); ruler.addEventListener('lostpointercapture', lost);
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', cancel); document.addEventListener('keydown', keydown); window.addEventListener('resize', resize);
  if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(resize); observer.observe(canvas); observer.observe(scroll); }
  paintRows(); refresh();
  const frequencies = body()?.parts.flatMap(value => value.notes.map(note => note.frequencyHz)) ?? []; const centre = frequencies.length ? frequencies[Math.floor(frequencies.length / 2)]! : 261.625565;
  scroll.scrollTop = rhythm ? 0 : Math.max(0, phrasePitchRow(centre, keys) * view.rowHeight - Math.max(view.rowHeight, scroll.clientHeight) / 2);
  return { refresh, flush, isStepInputActive, setPlayhead(seconds) { if (!disposed) { playheadSeconds = seconds; positionHead(); } }, dispose() {
    if (disposed) return; finish(false); mix = undefined; preview(); audition.cancel(); disposed = true; library?.close(); observer?.disconnect(); window.clearTimeout(noticeTimer);
    document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', cancel); document.removeEventListener('keydown', keydown); window.removeEventListener('resize', resize);
  } };
}
