import type { KeyboardPitch, PhraseBody, PhraseEditorPort, PhraseNote, PhrasePart, PhraseView } from '../../contracts/phrase.ts';
import { phraseStepsPerBeat } from '../../contracts/phrase.ts';
import { phraseTempoAtBeat, phraseHeldSeconds, phraseHeldBeats, phraseStepsAtBeat } from '../../contracts/phrase-time.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import type { MusicWorkspaceStatePort } from '../../contracts/workspace.ts';
import { createPhraseAudition } from './phrase-audition.ts';
import { defaultInstrumentInfo, instrumentCategories } from '../timbre/instrument-catalog.ts';
import { attachConsoleHorizontalWheel } from './console-scroll.ts';
import { phrasePitchRow } from './phrase-viewport.ts';
import type { PhraseEditorViewport } from './phrase-editor-viewport.ts';
import { buildPhraseToneColors, toneColor as defaultToneColor } from './phrase-overview-notes.ts';
import { playlistSegmentIntersectsRect } from './playlist-geometry.ts';
import { melodyEntryKey, melodyEntryPitch, nextMelodyEntryStep } from './melody-key-entry.ts';
import { MAX_PHRASE_BEATS, MIN_NOTE_BEATS as MIN_BEATS, MIN_NOTE_SECONDS } from '../../contracts/phrase-limits.ts';
import { recordPerformanceEntry, undoPhraseEdit, redoPhraseEdit } from './phrase-performance-history.ts';
import { melodyBeats, melodyClamp, melodyDuration, melodyDetailGrid, melodyDetailSteps, melodyNoteRect, melodyScale, melodySeconds,
  melodyPitchTop, melodyPitchHeight, melodyPitchAt,
  melodyTimeAt, clampMelodyView, initialMelodyView, zoomMelody, melodyScoreGrid, type MelodyView } from './melody-geometry.ts';
import './melody-workspace.css';
import { createMelodyNoteIndex, melodyFollowTarget } from './melody-note-index.ts';
import { mountMelodyTempoRolls } from './melody-tempo-rolls.ts';

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
type Gesture = { id: number; capture: HTMLElement; base: PhraseBody; draftId: string; from: Point; last: Point; clientFrom: Point } & (
  { kind: 'head' } | { kind: 'pan'; lastClient: Point } |
  { kind: 'erase'; refs: Map<string, { partId: string; noteId: string }> } |
  { kind: 'note' | 'create' | 'resize'; partId: string; targetPartId?: string; note: PhraseNote; changes: NoteChanges; rawY: number; moved: boolean });
type Mix = { partId: string; note: PhraseNote; base: PhraseBody; changes: NoteChanges; pointerId?: number };
const RHYTHM_PITCH = 261.6255653005986;
const TIMBRE_DRAG_TYPE = 'application/x-rootsound-timbre';

/** Piano-roll editing owns no audio clock: every audition/preview uses the common sound boundary. */
export function mountMelodyWorkspace(root: HTMLElement, options: {
  phrase: PhraseEditorPort; sound: SoundRuntimePort; gridBpm(): number;
  initialView?: PhraseView;
  initialSelection?: { partId: string; noteId?: string };
  initialViewport?: PhraseEditorViewport;
  workspaceState?: MusicWorkspaceStatePort;
  orientation?: 'horizontal' | 'vertical';
  onViewportChange?(viewport: PhraseEditorViewport): void;
  onChange(view?: PhraseView): void; onPreview(body?: PhraseBody): void; onSeek(seconds: number): void | Promise<void>;
  /** A family selection solos that family; individual note selection does not. */
  onPlaybackFamilyChange?(partId?: string): void;
  readPlayhead?(): number;
  readIsPlaying?(): boolean;
  readPerformanceMode?(): boolean;
  listTimbres(): Array<{ id: string; name: string; requiresDeleteConfirmation?: boolean }>; onAddTimbre(id: string): string;
  onCreateNoteGroup?(id: string): string;
  onChangeNoteGroupTimbre?(partId: string, timbreId: string): void;
  onRemoveTimbre?(id: string): void;
  onImportTimbre?(): Promise<boolean>;
  onReorderTimbres?(id: string, targetIndex: number): void;
  section?: 'melody' | 'rhythm';
  /** Show legacy departments together without rewriting their stored identity. */
  includeAllSections?: boolean;
}): { refresh(view?: PhraseView): void; dispose(): void; flush(): void; setPlayhead(seconds: number, playing?: boolean): void; isStepInputActive(): boolean; readViewport(): PhraseEditorViewport } {
  const { phrase, sound } = options; let current = options.initialView ?? phrase.read(); let disposed = false;
  const rhythm = options.section === 'rhythm';
  const vertical = options.orientation === 'vertical';
  const keys: KeyboardPitch[] = phrase.keyboard().slice(); if (!vertical) keys.reverse();
  const restored = options.workspaceState?.read();
  const initialViewport = options.initialViewport ?? restored?.viewport;
  const restorePitchOffset = !vertical || options.initialViewport || restored?.orientation === 'vertical' ? initialViewport?.top : undefined;
  const noteLengths = new Map(Object.entries(restored?.noteLengths ?? {}));
  let workspaceTimer = 0;
  let view: MelodyView = { leftSeconds: initialViewport?.leftSeconds ?? 0,
    zoom: initialViewport?.zoom ?? 1, rowHeight: initialViewport?.rowHeight ?? (rhythm ? 72 : 32) };
  let revealConfiguredGrid = restored?.showGridCells ?? false;
  let viewportReady = false; let lastViewport: PhraseEditorViewport | undefined;
  let selection: Selection | undefined = options.initialSelection ?? restored?.selection; let gesture: Gesture | undefined; let mix: Mix | undefined;
  let playbackFamilyId: string | undefined;
  let playheadSeconds = restored?.playheadSeconds ?? 0; let library: HTMLDialogElement | undefined; let observer: ResizeObserver | undefined;
  let entryOctave = restored?.entryOctave ?? 4;
  let entryToneId: string | undefined = restored?.entryToneId;
  let deleteToneArmed: { partId: string; at: number } | undefined;
  let libraryRefresh: (() => void) | undefined; let libraryError: HTMLElement | undefined;
  let draggedTone: { id: string; draftId: string } | undefined; let suppressLibraryClickUntil = 0;
  let toneDeleteDialog: HTMLDialogElement | undefined; let toneDeleteDraftId: string | undefined;
  let resetToneOrder: (() => void) | undefined;
  let noticeTimer = 0; const addedParts = new Set<string>(); const noteNodes = new Map<string, HTMLButtonElement>();
  const gridNodes = new Map<number, HTMLElement>();
  let gridOrder: number[] = [];
  let headWidth = 1;
  let viewportFrame = 0;
  let previewFrame = 0;
  let indexedBody: PhraseBody | undefined;
  let noteIndex: ReturnType<typeof createMelodyNoteIndex> | undefined;
  let followResumeAt = 0;
  let browseLastSeconds = view.leftSeconds, browseLastAt = -Infinity, browseSince = 0, browseDistance = 0;
  let quickHideTimer = 0, quickHover = false, quickFocused = false;
  let quickThumbTop = 0, quickThumbHeight = 28, quickTrackHeight = 1;
  let quickDrag: { id: number; top: number; grab: number } | undefined;
  let keyPan: { id: number; capture: HTMLElement; fromX: number; offset: number; moved: boolean } | undefined;
  let suppressKeyClickUntil = 0;
  let tempoPreview: PhraseBody | undefined;
  let toneColors = new Map<string, string>();
  let toneNames = new Map<string, string>();
  const page = node('div', 'melody-workspace'); const main = node('div', 'melody-main'); const shelf = node('aside', 'melody-shelf');
  page.classList.toggle('rhythm-workspace', rhythm);
  page.classList.toggle('is-vertical', vertical);
  shelf.setAttribute('aria-label', rhythm ? '音色栏' : '音符栏');
  const roll = node('div', 'melody-roll'); const rulerRow = node('div', 'melody-ruler-row'); const ruler = node('div', 'melody-ruler');
  const headHandle = button('', 'melody-head-handle', () => {}); headHandle.setAttribute('aria-label', rhythm ? '节奏播放头' : '旋律播放头'); headHandle.setAttribute('role', 'slider');
  headHandle.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
  ruler.append(headHandle); rulerRow.append(node('div', 'melody-ruler-spacer'), ruler, node('div', 'melody-extend-cap'));
  const scroll = node('div', 'melody-scroll'); scroll.tabIndex = 0; scroll.setAttribute('aria-label', rhythm ? '节奏步进音序器' : '旋律钢琴卷帘');
  const world = node('div', 'melody-world'); const keyboard = node('div', 'melody-keys'); const canvas = node('div', 'melody-canvas');
  const rows = node('div', 'melody-rows'); const grid = node('div', 'melody-grid'); const notes = node('div', 'melody-notes');
  const tempoBands = node('div', 'melody-tempo-bands');
  const head = node('div', 'melody-playhead'); head.setAttribute('aria-hidden', 'true'); const afterEnd = node('div', 'melody-after-end'); canvas.append(tempoBands, rows, grid, notes, head, afterEnd); world.append(keyboard, canvas); scroll.append(world);
  const endHandle = button('', 'melody-roll-end', () => {}); endHandle.setAttribute('aria-label', '调整末段小节数'); endHandle.title = '拖动调整小节数';
  if (vertical) canvas.append(endHandle);
  const editor = node('div', 'melody-editor'); const extend = button('+', 'melody-extend', extendMeasure); extend.setAttribute('aria-label', vertical ? '新增钢琴卷帘' : '增加一个小节'); editor.append(scroll, extend);
  const console = node('div', 'melody-console'); console.hidden = true; roll.append(rulerRow, editor); if (!vertical) roll.append(console); main.append(shelf, roll);
  const quick = node('div', 'melody-quick-scroll'); quick.hidden = true;
  const quickThumb = button('', 'melody-quick-thumb', () => {}); quickThumb.setAttribute('role', 'slider');
  quickThumb.setAttribute('aria-label', '快速定位'); quickThumb.setAttribute('aria-orientation', 'vertical');
  const quickHint = node('div', 'melody-quick-hint'); quickHint.hidden = true; quickHint.setAttribute('aria-hidden', 'true');
  quick.append(quickThumb, quickHint); if (vertical) roll.append(quick);
  const removeConsoleWheel = vertical ? () => {} : attachConsoleHorizontalWheel(console);
  if (vertical) shelf.setAttribute('aria-label', '音符组栏');
  const notice = node('div', 'melody-notice'); notice.hidden = true; notice.setAttribute('role', 'status'); page.append(main, notice); root.replaceChildren(page);
  const audition = createPhraseAudition(phrase, sound, () => selection?.partId, message => report(message));
  const toneTrash = node('div', 'melody-tone-trash'); toneTrash.hidden = true; toneTrash.setAttribute('role', 'region'); toneTrash.setAttribute('aria-label', '移除音色');
  const trashIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); trashIcon.setAttribute('viewBox', '0 0 24 24'); trashIcon.setAttribute('aria-hidden', 'true');
  const trashPath = document.createElementNS('http://www.w3.org/2000/svg', 'path'); trashPath.setAttribute('d', 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7');
  for (const [key, value] of Object.entries({ fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) trashPath.setAttribute(key, value);
  trashIcon.append(trashPath); toneTrash.append(trashIcon); page.append(toneTrash);
  const width = () => Math.max(1, vertical ? scroll.clientHeight - 48 : canvas.clientWidth || scroll.clientWidth - (rhythm ? 0 : 64));
  const pitchSpan = () => vertical ? scroll.clientWidth : scroll.clientHeight;
  const pitchOffset = () => vertical ? scroll.scrollLeft : scroll.scrollTop;
  const body = () => tempoPreview ?? current.body;
  const tempoDock = node('div', 'melody-tempo-dock'); if (vertical) roll.append(tempoDock);
  const tempoRolls = vertical ? mountMelodyTempoRolls({ root: page, dock: tempoDock, ruler, bands: tempoBands, extend, end: endHandle, phrase,
    readBody: body, readView: () => view, scale: () => melodyScale(view, width(), melodyDuration(body()!)), height: width,
    flush: safeFlush, changed(committed = true) { refresh(); if (committed) notify(); }, report,
    gridChanged() {
      revealConfiguredGrid = true;
    },
    preview(value) { tempoPreview = value; if (value) { paintViewport(); previewEdit(); } else preview(); },
    navigate(seconds) { view = clampView({ ...view, leftSeconds: seconds }, melodyDuration(body()!)); manualNavigation(); paintViewport(); },
  }) : undefined;
  const editSteps = (value: PhraseBody, beat = melodyBeats(view.leftSeconds, value)) => Math.max(phraseStepsAtBeat(value, beat), melodyDetailSteps(phraseTempoAtBeat(value, beat), phraseStepsAtBeat(value, beat), melodyScale(view, width(), melodyDuration(value))));
  function lastNoteStart(value: PhraseBody): number | undefined {
    const minimum = Math.max(MIN_BEATS, MIN_NOTE_SECONDS * phraseTempoAtBeat(value, value.lengthBeats) / 60);
    return value.lengthBeats >= minimum ? value.lengthBeats - minimum : undefined;
  }
  function drawExtent(value: PhraseBody, startBeat: number): { cell: number; maximum: number } {
    const steps = editSteps(value, startBeat); const cell = 60 / phraseTempoAtBeat(value, startBeat) / steps;
    const available = Math.min(96, melodyDuration(value) - melodySeconds(startBeat, value));
    return { cell: Math.min(cell, available), maximum: available };
  }
  const sectionParts = (value = body()) => (value?.parts ?? []).filter(part => !rhythm && options.includeAllSections
    || (part.section ?? 'melody') === (rhythm ? 'rhythm' : 'melody'));
  function clampView(next: MelodyView, duration: number): MelodyView {
    const safe = { ...next, leftSeconds: Number.isFinite(next.leftSeconds) ? next.leftSeconds : 0,
      rowHeight: Number.isFinite(next.rowHeight) ? next.rowHeight : rhythm ? 72 : 32 };
    // Leave room after the last roll to reach and pull its actual lower edge.
    const clamped = clampMelodyView(safe, vertical ? duration + 6 / melodyClamp(safe.zoom, .25, 256) : duration);
    return rhythm ? { ...clamped, rowHeight: melodyClamp(safe.rowHeight, 48, 120) } : clamped;
  }
  function maximumTop(): number {
    const height = rhythm ? Math.max(1, visibleParts().length) * view.rowHeight + 52 : melodyPitchTop(keys, keys.length, view.rowHeight);
    return Math.max(0, height - Math.max(0, pitchSpan()));
  }
  function setTop(top: number): void { const next = melodyClamp(Number.isFinite(top) ? top : 0, 0, maximumTop()); if (vertical) scroll.scrollLeft = next; else scroll.scrollTop = next; }
  function readViewport(): PhraseEditorViewport { return { ...view, top: melodyClamp(pitchOffset(), 0, maximumTop()) }; }
  function persistWorkspace(immediate = false): void {
    if (!options.workspaceState || !viewportReady || disposed) return;
    if (immediate) {
      window.clearTimeout(workspaceTimer); workspaceTimer = 0;
      options.workspaceState.write({ ...(revealConfiguredGrid ? { showGridCells: true } : {}), ...(vertical ? { orientation: 'vertical' as const } : {}), viewport: readViewport(), selection: selection ? { ...selection } : undefined,
        playheadSeconds: Math.max(0, Math.min(melodyDuration(body()!), playheadSeconds)), entryOctave, entryToneId,
        noteLengths: Object.fromEntries([...noteLengths].filter(([id]) => !!part(id))) });
    } else if (!workspaceTimer) workspaceTimer = window.setTimeout(() => { workspaceTimer = 0; persistWorkspace(true); }, 200);
  }
  function rememberLength(partId: string, note: PhraseNote, changes: NoteChanges): void {
    if (changes.durationSeconds !== undefined && Math.abs(changes.durationSeconds - phraseHeldSeconds(body()!, note)) > 1e-10) {
      noteLengths.set(partId, melodyClamp(changes.durationSeconds, MIN_NOTE_SECONDS, 96)); persistWorkspace();
    }
  }
  function reportViewport(): void {
    setTop(pitchOffset()); if (!viewportReady || disposed) return;
    persistWorkspace();
    const next = readViewport();
    if (lastViewport && next.leftSeconds === lastViewport.leftSeconds && next.zoom === lastViewport.zoom && next.top === lastViewport.top && next.rowHeight === lastViewport.rowHeight) return;
    lastViewport = next; options.onViewportChange?.({ ...next }); persistWorkspace();
  }
  function paintViewport(): void {
    cancelAnimationFrame(viewportFrame); viewportFrame = 0;
    if (disposed) return;
    if (rhythm) paintShelf();
    paintGrid(); paintNotes(); paintQuickScroll(); reportViewport();
  }
  function scheduleViewport(): void {
    if (!viewportFrame) viewportFrame = requestAnimationFrame(paintViewport);
  }
  function headInView(seconds = playheadSeconds): boolean {
    return seconds >= view.leftSeconds && seconds <= view.leftSeconds + 8 / view.zoom;
  }
  function manualNavigation(fromQuick = false): void {
    // Browsing away pauses following; small pans and returning resume it.
    if (vertical) followResumeAt = headInView() ? 0 : performance.now() + 30_000;
    if (!vertical) return;
    const now = performance.now(), delta = Math.abs(view.leftSeconds - browseLastSeconds);
    browseLastSeconds = view.leftSeconds;
    if (!fromQuick && delta > 0) {
      if (now - browseLastAt > 700) { browseSince = now; browseDistance = 0; }
      browseLastAt = now;
      browseDistance += delta * melodyScale(view, width(), melodyDuration(body()!));
      if (browseDistance >= width() * .75 || now - browseSince >= 600 && browseDistance >= 48) revealQuickScroll();
    }
    if (!quick.hidden) deferQuickHide();
  }
  function deferQuickHide(): void {
    window.clearTimeout(quickHideTimer);
    if (quickDrag || quickHover || quickFocused) return;
    quickHideTimer = window.setTimeout(() => { quick.hidden = true; quickHint.hidden = true; }, 2000);
  }
  function revealQuickScroll(): void { quick.hidden = false; deferQuickHide(); }
  function paintQuickHint(): void {
    quickHint.hidden = quick.hidden;
    quickHint.textContent = '';
    const duration = melodyDuration(body()!);
    quickHint.style.top = `${melodyClamp(playheadSeconds / Math.max(duration + 6 / view.zoom, 1e-8), 0, 1) * quickTrackHeight}px`;
    quickThumb.setAttribute('aria-description', playheadSeconds < view.leftSeconds ? '播放头在上方'
      : playheadSeconds > view.leftSeconds + 8 / view.zoom ? '播放头在下方' : '播放头在视野内');
  }
  function paintQuickScroll(): void {
    if (!vertical || quick.hidden || !body()) return;
    const duration = melodyDuration(body()!) + 6 / view.zoom, span = 8 / view.zoom, maximum = Math.max(0, duration - span);
    quickTrackHeight = Math.max(1, quick.clientHeight);
    quickThumbHeight = Math.min(quickTrackHeight, Math.max(28, quickTrackHeight * Math.min(1, span / duration)));
    quickThumbTop = maximum ? melodyClamp(view.leftSeconds / maximum, 0, 1) * (quickTrackHeight - quickThumbHeight) : 0;
    quickThumb.style.height = `${quickThumbHeight}px`; quickThumb.style.transform = `translateY(${quickThumbTop}px)`;
    quickThumb.setAttribute('aria-valuemin', '0'); quickThumb.setAttribute('aria-valuemax', String(maximum));
    quickThumb.setAttribute('aria-valuenow', String(Math.min(view.leftSeconds, maximum)));
    quickThumb.setAttribute('aria-valuetext', `${view.leftSeconds.toFixed(1)} 秒`); paintQuickHint();
  }
  function moveQuickScroll(clientY: number): void {
    if (!quickDrag || !body()) return;
    const maximum = Math.max(0, melodyDuration(body()!) - 2 / view.zoom), travel = quickTrackHeight - quickThumbHeight;
    const ratio = travel > 0 ? melodyClamp((clientY - quickDrag.top - quickDrag.grab) / travel, 0, 1) : 0;
    view = clampView({ ...view, leftSeconds: ratio * maximum }, melodyDuration(body()!));
    manualNavigation(true); scheduleViewport();
  }
  function finishQuickScroll(): void {
    const active = quickDrag; if (!active) return;
    quickDrag = undefined; quickHint.hidden = true; quick.classList.remove('is-dragging');
    if (quick.hasPointerCapture?.(active.id)) quick.releasePointerCapture(active.id);
    deferQuickHide(); reportViewport();
  }
  function report(message: string): void {
    if (disposed) return; notice.textContent = message; notice.hidden = !message;
    if (libraryError) { libraryError.textContent = message; libraryError.hidden = !message; }
    window.clearTimeout(noticeTimer); noticeTimer = window.setTimeout(() => { if (!disposed) notice.hidden = true; }, 6000);
  }
  function notify(): void { if (!disposed) options.onChange(current); }
  function preview(value?: PhraseBody): void {
    cancelAnimationFrame(previewFrame); previewFrame = 0;
    if (!disposed) options.onPreview(value);
  }
  function previewEdit(): void {
    // Idle editing needs no full-score audio copy. During playback, coalesce
    // pointer events and compile only the latest change at the next frame.
    if (options.readIsPlaying?.() === false) return;
    if (!options.readIsPlaying) { preview(displayedBody()); return; }
    if (!previewFrame) previewFrame = requestAnimationFrame(() => { previewFrame = 0; preview(displayedBody()); });
  }
  function part(id = selection?.partId): PhrasePart | undefined { return sectionParts().find(value => value.id === id); }
  function partLabel(value: PhrasePart): string { return value.unassigned ? '未定义' : rhythm ? value.name : toneNames.get(value.timbreId) ?? value.name; }
  function toneColor(id: string): string {
    return toneColors.get(id) ?? defaultToneColor(id);
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
      if (value.unassigned || value.notes.length || value.hiddenNotes?.length || addedParts.has(value.id) || !/^音乐 [1-9]\d* 音色$/u.test(value.name)) return true;
      const record = current.availableSounds.find(record => record.id === value.timbreId); const voice = record?.body;
      return !record || record.name !== value.name || record.dependencies.length !== 0 || !voice || typeof voice !== 'object' || Array.isArray(voice)
        || voice.model !== 'basic-synth' || voice.character !== 'warm' || voice.attackSeconds !== .025 || voice.releaseSeconds !== .55 || voice.level !== .65;
    });
  }
  function choose(next: Selection): void { if (!safeFlush()) return; selection = next; entryToneId = !rhythm && !next.noteId ? next.partId : undefined; deleteToneArmed = undefined; audition.sync(current); paintShelf(); paintNotes(); paintConsole(); persistWorkspace(); }
  function paintShelf(): void {
    const nextPlaybackFamily = selection && !selection.noteId ? part()?.id : undefined;
    if (nextPlaybackFamily !== playbackFamilyId) {
      playbackFamilyId = nextPlaybackFamily; options.onPlaybackFamilyChange?.(playbackFamilyId);
    }
    shelf.replaceChildren();
    for (const [index, value] of visibleParts().entries()) {
      const entry = node('div', 'melody-tone-entry');
      const card = button(partLabel(value), rhythm ? 'melody-tone' : 'melody-tone melody-note-family', () => { if (!disposed) { choose({ partId: value.id }); scroll.focus({ preventScroll: true }); } });
      if (!rhythm) card.title = '总音符';
      card.dataset.partId = value.id; card.style.setProperty('--tone-color', toneColor(value.timbreId)); card.classList.toggle('is-selected', selection?.partId === value.id);
      if (vertical) { card.title = '双击更换音色'; card.addEventListener('dblclick', () => openLibrary({ kind: 'replace', partId: value.id })); }
      card.classList.toggle('is-unassigned', !!value.unassigned);
      const play = button('▶', 'melody-tone-preview', () => { if (!disposed && !value.unassigned) void audition.requestTimbre(value.timbreId); });
      play.setAttribute('aria-label', `试听${partLabel(value)}`); play.disabled = !!value.unassigned; play.title = value.unassigned ? '尚未定义音色' : '试听音色'; entry.append(card, play);
      const remove = button('×', 'melody-family-remove', () => requestRemoveFamily(value.id));
      remove.setAttribute('aria-label', `移除${partLabel(value)}`); remove.title = '移除这组音符'; entry.append(remove);
      if (rhythm) {
        const top = 24 + index * view.rowHeight - scroll.scrollTop; const bottom = Math.min(24 + scroll.clientHeight, shelf.clientHeight - 44);
        entry.style.top = `${top}px`; entry.style.height = `${view.rowHeight}px`; entry.style.clipPath = `inset(${Math.max(0, 24 - top)}px 0 ${Math.max(0, top + view.rowHeight - bottom)}px 0)`; card.dataset.rowIndex = String(index); card.style.height = `${view.rowHeight}px`;
      }
      shelf.append(entry);
    }
    const add = button('+', rhythm ? 'melody-add-tone' : 'melody-add-tone melody-add-note-family', () => openLibrary()); add.setAttribute('aria-label', rhythm ? '添加音色' : '新建总音符'); shelf.append(add);
  }
  function openLibrary(intent: LibraryIntent = { kind: 'create' }): void {
    if (disposed || library || toneDeleteDialog || !safeFlush()) return;
    if (!rhythm && intent.kind === 'replace' && !part(intent.partId)) { report('找不到这个总音符，请重新选择。'); return; }
    const openedDraftId = current.draft?.id;
    const dialog = node('dialog', 'melody-tone-library'); library = dialog; dialog.setAttribute('aria-label', '音色库');
    const heading = node('div', 'melody-library-heading'); const close = button('→', 'melody-library-close', () => dialog.close()); close.setAttribute('aria-label', '关闭音色库');
    heading.append(node('h2', '', '音色库'), close); const tiles = node('div', 'melody-library-grid'); const error = node('p', 'melody-library-error'); error.hidden = true;
    let category = '全部'; let query = '';
    const tools = node('div', 'melody-library-tools');
    const search = node('input', 'melody-library-search'); search.type = 'search'; search.placeholder = '搜索音色'; search.setAttribute('aria-label', '搜索音色');
    const categories = node('div', 'melody-library-categories');
    const categoryButtons: HTMLButtonElement[] = [];
    const filteredTimbres = () => options.listTimbres().filter(timbre => {
      const info = defaultInstrumentInfo(timbre.id, current.availableSounds.find(record => record.id === timbre.id)?.body);
      return (category === '全部' || (info?.category ?? '自定义') === category)
        && (!query || `${timbre.name} ${info?.aliases ?? ''} ${info?.category ?? ''}`.toLocaleLowerCase().includes(query));
    });
    function selectCategory(value: string): void {
      category = value;
      for (const item of categoryButtons) { const selected = item.textContent === category; item.classList.toggle('is-active', selected); item.setAttribute('aria-pressed', String(selected)); }
      libraryRefresh?.();
    }
    for (const value of ['全部', ...instrumentCategories, '自定义']) {
      const item = button(value, 'melody-library-category', () => selectCategory(value));
      item.classList.toggle('is-active', value === category); item.setAttribute('aria-pressed', String(value === category)); categoryButtons.push(item); categories.append(item);
    }
    search.addEventListener('input', () => { query = search.value.trim().toLocaleLowerCase(); libraryRefresh?.(); });
    tools.append(search, categories);
    let importing = false;
    const cards = new Map<string, HTMLElement>();
    type ToneOrder = { id: string; source: number; target: number; ids: string[]; rectangles: DOMRect[]; scrollTop: number };
    let order: ToneOrder | undefined;
    const resetOrder = () => {
      order = undefined; tiles.classList.remove('is-sorting');
      for (const frame of cards.values()) { frame.style.transform = ''; frame.classList.remove('is-library-dragging'); }
    };
    resetToneOrder = resetOrder;
    const active = () => !disposed && library === dialog && current.draft?.id === openedDraftId;
    tiles.addEventListener('dragover', event => {
      if (!active() || !order || !draggedTone || !event.dataTransfer) return;
      event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = 'move';
      const deltaScroll = tiles.scrollTop - order.scrollTop;
      let nearest = 0; let best = Infinity;
      order.rectangles.forEach((rect, index) => {
        const distance = (event.clientX - rect.left - rect.width / 2) ** 2 + (event.clientY - rect.top + deltaScroll - rect.height / 2) ** 2;
        if (distance < best) { best = distance; nearest = index; }
      });
      order.target = nearest;
      const sequence = order.ids.filter(id => id !== order!.id); sequence.splice(nearest, 0, order.id);
      tiles.classList.add('is-sorting');
      order.ids.forEach((id, index) => {
        const frame = cards.get(id); const origin = order!.rectangles[index]; const target = order!.rectangles[sequence.indexOf(id)];
        if (frame && origin && target) frame.style.transform = 'translate(' + (target.left - origin.left) + 'px, ' + (target.top - origin.top) + 'px)';
      });
    });
    tiles.addEventListener('drop', event => {
      if (!active() || !order || !draggedTone || !event.dataTransfer) return;
      event.preventDefault(); event.stopPropagation(); const completed = order;
      const matches = event.dataTransfer.getData(TIMBRE_DRAG_TYPE) === completed.id
        && phrase.read().draft?.id === openedDraftId;
      endToneDrag();
      if (!matches) return;
      try {
        const currentIds = filteredTimbres().map(timbre => timbre.id);
        if (currentIds.length !== completed.ids.length || currentIds.some((id, index) => id !== completed.ids[index])) throw new Error('音色库刚刚发生变化，请重新拖动。');
        if (completed.source !== completed.target) {
          const target = options.listTimbres().findIndex(timbre => timbre.id === completed.ids[completed.target]);
          options.onReorderTimbres?.(completed.id, target); refresh(); notify();
        }
      } catch (reason) { error.hidden = false; error.textContent = reason instanceof Error ? reason.message : String(reason); }
    });
    libraryError = error;
    libraryRefresh = () => {
      if (draggedTone) endToneDrag();
      cards.clear(); tiles.replaceChildren();
      for (const timbre of filteredTimbres()) {
        const uses = sectionParts().filter(part => part.timbreId === timbre.id); const selected = uses.some(part => !part.unassigned && visibleParts().some(visible => visible.id === part.id));
        const frame = node('div', 'melody-library-card'); frame.draggable = true; frame.dataset.timbreId = timbre.id;
        const info = defaultInstrumentInfo(timbre.id, current.availableSounds.find(record => record.id === timbre.id)?.body);
        frame.title = `${info?.category ?? '自定义'} · ${timbre.name}${info && 'program' in info ? ` · GM ${info.program! + 1}` : ''}`;
        const tile = button(timbre.name, 'melody-library-tone', () => {
          if (disposed || library !== dialog || draggedTone || Date.now() < suppressLibraryClickUntil || !safeFlush()) return;
          try {
            error.hidden = true; error.textContent = '';
            if (!rhythm) {
              if (!openedDraftId || phrase.read().draft?.id !== openedDraftId) throw new Error('当前音乐已改变，请重新打开音色库。');
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
            else { const id = options.onAddTimbre(timbre.id); current = phrase.read(); if (!part(id)) throw new Error('这个音色暂时无法加入音乐。'); addedParts.add(id); }
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
          if (options.onReorderTimbres) {
            const ids = [...cards.keys()]; const rectangles = ids.map(id => cards.get(id)!.getBoundingClientRect());
            order = { id: timbre.id, source: ids.indexOf(timbre.id), target: ids.indexOf(timbre.id), ids, rectangles, scrollTop: tiles.scrollTop };
            const rect = frame.getBoundingClientRect();
            event.dataTransfer.setDragImage?.(frame, Math.max(0, event.clientX - rect.left), Math.max(0, event.clientY - rect.top));
            frame.classList.add('is-library-dragging');
          }
        });
        frame.addEventListener('dragend', () => { if (library === dialog) endToneDrag(); }); cards.set(timbre.id, frame); tiles.append(frame);
      }
      if (options.onImportTimbre) {
        const add = button('+', 'melody-library-import', () => {
          if (disposed || library !== dialog || importing || !safeFlush()) return;
          importing = true; add.disabled = true; add.setAttribute('aria-busy', 'true'); error.hidden = true;
          void Promise.resolve().then(() => options.onImportTimbre!()).then(imported => {
            if (!imported || disposed || library !== dialog) return;
            query = ''; search.value = ''; selectCategory('自定义');
            current = phrase.read(); refresh(); notify();
          }).catch(reason => {
            if (disposed || library !== dialog) return;
            error.hidden = false; error.textContent = reason instanceof Error ? reason.message : String(reason);
          }).finally(() => {
            importing = false;
            if (!disposed && library === dialog) libraryRefresh?.();
          });
        });
        add.setAttribute('aria-label', '导入音色文件'); add.title = '导入音色文件'; add.disabled = importing; tiles.append(add);
      }
    };
    libraryRefresh(); dialog.append(heading, tools, tiles, error, toneTrash); dialog.addEventListener('close', () => { toneDeleteDialog?.close(); if (library === dialog) { library = undefined; libraryRefresh = undefined; libraryError = undefined; } endToneDrag(); resetToneOrder = undefined; audition.cancel(); page.append(toneTrash); dialog.remove(); }); root.append(dialog); dialog.showModal();
  }
  function endToneDrag(): void { resetToneOrder?.(); if (draggedTone) suppressLibraryClickUntil = Date.now() + 250; draggedTone = undefined; toneTrash.hidden = true; toneTrash.classList.remove('is-over'); }
  toneTrash.addEventListener('dragover', event => { if (!draggedTone) return; event.preventDefault(); toneTrash.classList.add('is-over'); if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'; });
  toneTrash.addEventListener('dragleave', () => toneTrash.classList.remove('is-over'));
  toneTrash.addEventListener('drop', event => {
    event.preventDefault(); event.stopPropagation(); const dragged = draggedTone;
    if (!dragged || disposed || toneDeleteDialog || current.draft?.id !== dragged.draftId || event.dataTransfer?.getData(TIMBRE_DRAG_TYPE) !== dragged.id) { endToneDrag(); return; }
    const timbre = options.listTimbres().find(timbre => timbre.id === dragged.id);
    endToneDrag();
    if (!timbre) return;
    if (timbre.requiresDeleteConfirmation || sectionParts().some(part => part.timbreId === dragged.id && (part.notes.length || part.hiddenNotes?.length))) { confirmRemoveTone(dragged.id, timbre.name, dragged.draftId); return; }
    removeTone(dragged.id);
  });
  function removeTone(id: string): boolean {
    try {
      if (options.onRemoveTimbre) options.onRemoveTimbre(id);
      else { const ids = sectionParts().filter(part => part.timbreId === id).map(part => part.id); if (ids.length) phrase.removeParts(ids); }
      refresh(); notify(); return true;
    } catch (error) { report(error instanceof Error ? error.message : String(error)); return false; }
  }
  function confirmRemoveTone(id: string, name: string, draftId: string): void {
    if (toneDeleteDialog || disposed) return;
    const owner = library; const warning = node('dialog', 'melody-tone-delete-dialog');
    toneDeleteDialog = warning; toneDeleteDraftId = draftId; warning.setAttribute('aria-label', '移除音色确认');
    warning.append(node('h2', '', '移除这个音色？'), node('p', '', '“' + name + '”'), node('p', '', '已有音符会保留为未定义音色。'));
    const error = node('p', 'melody-tone-delete-error'); error.hidden = true;
    let removing = false;
    const cancel = button('取消', 'melody-tone-delete-cancel', () => { if (!removing) warning.close(); });
    const confirm = button('移除', 'melody-tone-delete-confirm', () => {
      if (removing || disposed || toneDeleteDialog !== warning) return;
      const fresh = options.listTimbres().find(timbre => timbre.id === id);
      if (library !== owner || current.draft?.id !== draftId || phrase.read().draft?.id !== draftId || !fresh || fresh.name !== name) { warning.close(); return; }
      removing = true; confirm.disabled = true;
      if (removeTone(id)) warning.close();
      else { removing = false; confirm.disabled = false; error.hidden = false; error.textContent = '未能移除，请重试。'; }
    });
    const actions = node('div', 'melody-tone-delete-actions'); actions.append(cancel, confirm); warning.append(error, actions);
    warning.addEventListener('cancel', event => { event.preventDefault(); if (!removing) warning.close(); });
    warning.addEventListener('close', () => {
      if (toneDeleteDialog === warning) { toneDeleteDialog = undefined; toneDeleteDraftId = undefined; }
      warning.remove();
    });
    root.append(warning); warning.showModal();
  }
  function paintRows(): void {
    if (rhythm) {
      world.style.height = `${Math.max(1, visibleParts().length) * view.rowHeight + 52}px`; keyboard.replaceChildren(); rows.replaceChildren();
      visibleParts().forEach((voice, index) => { const row = node('div', 'melody-pitch-row rhythm-tone-row'); row.dataset.partId = voice.id; row.dataset.rowIndex = String(index); row.style.top = `${index * view.rowHeight}px`; row.style.height = `${view.rowHeight}px`; rows.append(row); });
      return;
    }
    const pitchLength = melodyPitchTop(keys, keys.length, view.rowHeight);
    world.style.height = vertical ? '100%' : `${pitchLength}px`; if (vertical) world.style.width = `${pitchLength}px`;
    keyboard.replaceChildren(); rows.replaceChildren();
    keys.forEach((pitch, index) => {
      const octaveLabel = /^C(-?\d+)$/u.exec(pitch.label);
      const key = button(vertical ? octaveLabel ? pitch.label : '' : pitch.label, 'melody-key', () => {
        if (!disposed && performance.now() >= suppressKeyClickUntil) void audition.requestKeyboard(pitch.frequencyHz);
      });
      key.dataset.pitchLabel = pitch.label;
      if (vertical && octaveLabel && view.rowHeight < 22) { key.textContent = `C\n${octaveLabel[1]}`; key.classList.add('is-stacked-label'); }
      key.classList.toggle('is-accidental', pitch.accidental);
      const start = `${melodyPitchTop(keys, index, view.rowHeight)}px`, size = `${melodyPitchHeight(keys, index, view.rowHeight)}px`;
      if (vertical) { key.style.left = start; key.style.width = size; } else { key.style.top = start; key.style.height = size; }
      key.dataset.frequencyHz = String(pitch.frequencyHz);
      key.setAttribute('aria-label', `${pitch.label} ${Number(pitch.frequencyHz.toFixed(2))} Hz`); keyboard.append(key);
      const row = node('div', 'melody-pitch-row'); row.classList.toggle('is-accidental', pitch.accidental);
      if (vertical) { row.style.left = start; row.style.width = size; } else { row.style.top = start; row.style.height = size; } rows.append(row);
    });
    paintEntryRange();
  }
  function paintEntryRange(): void {
    const armed = !rhythm && (options.readPerformanceMode?.() ?? false) && !!entryToneId && !!part(entryToneId);
    for (const key of keyboard.querySelectorAll<HTMLButtonElement>('.melody-key')) {
      const midi = Math.round(69 + 12 * Math.log2(Number(key.dataset.frequencyHz) / 440));
      const active = armed && Math.floor(midi / 12) - 1 === entryOctave;
      key.classList.toggle('is-entry-range', active);
      key.title = `${key.dataset.pitchLabel ?? ''}${active ? ' · 键盘输入音区 · Z / X 切换' : ''}`;
    }
  }
  function noteRect(note: PhraseNote, voice: PhrasePart, value: PhraseBody, canvasWidth = width(), rhythmRows?: Map<string, number>) {
    const rect = melodyNoteRect(note, value, keys, view, canvasWidth);
    return rhythm ? { ...rect, y: (rhythmRows?.get(voice.id) ?? visibleParts(value).findIndex(part => part.id === voice.id)) * view.rowHeight + 7, height: view.rowHeight - 14 } : rect;
  }
  function paintGrid(): void {
    tempoRolls?.paint();
    const value = body();
    if (!value) { grid.replaceChildren(); gridNodes.clear(); gridOrder = []; return; }
    // Read layout before changing any lines. Reading clientWidth after each
    // append/style write otherwise forces a fresh layout for every grid line.
    const canvasWidth = width(); headWidth = canvasWidth;
    const duration = melodyDuration(value); const scale = melodyScale(view, canvasWidth, duration);
    const seen = new Set<number>(); const ordered: HTMLElement[] = []; const order: number[] = [];
    const detailPixels = revealConfiguredGrid ? 0 : 48;
    for (const line of value.tempoSections?.length ? melodyScoreGrid(value, view, canvasWidth, detailPixels) : melodyDetailGrid(duration, options.gridBpm(), phraseStepsPerBeat(value), view, canvasWidth, value.beatsPerBar ?? 4, value.pickupBeats ?? 0, detailPixels)) {
      const x = (line.seconds - view.leftSeconds) * scale; if (x < -1 || x > canvasWidth + 1) continue;
      seen.add(line.seconds); let element = gridNodes.get(line.seconds);
      if (!element) { element = node('i', 'melody-grid-line'); gridNodes.set(line.seconds, element); }
      element.classList.toggle('is-beat', line.beat); element.classList.toggle('is-cell', line.cell); if (vertical) element.style.top = `${x}px`; else element.style.left = `${x}px`;
      order.push(line.seconds); ordered.push(element);
    }
    for (const [seconds, element] of gridNodes) if (!seen.has(seconds)) { element.remove(); gridNodes.delete(seconds); }
    if (order.length !== gridOrder.length || order.some((seconds, index) => seconds !== gridOrder[index])) grid.replaceChildren(...ordered);
    gridOrder = order;
    const endX = (duration - view.leftSeconds) * scale; afterEnd.hidden = endX > canvasWidth;
    if (vertical) afterEnd.style.top = `${Math.max(0, endX)}px`; else afterEnd.style.left = `${Math.max(0, endX)}px`;
  }
  function paintNotes(onlyNoteId?: string): void {
    const activeEdit = mix ?? (gesture && 'note' in gesture ? gesture : undefined);
    // During one-note gestures the rest of the score does not need copying.
    const value = onlyNoteId ? body() : displayedBody(); const seen = new Set<string>();
    if (!value) return;
    const canvasWidth = width(); headWidth = canvasWidth;
    const rowParts = rhythm ? visibleParts(value) : [];
    const rhythmRows = rhythm ? new Map(rowParts.map((part, index) => [part.id, index])) : undefined;
    const selectedTimbreId = selection ? part(selection.partId)?.timbreId : undefined;
    const active = gesture;
    const originalDragRow = rhythm && active?.kind === 'note'
      ? visibleParts(active.base).findIndex(part => part.id === active.partId) : undefined;
    if (indexedBody !== value) { indexedBody = value; noteIndex = createMelodyNoteIndex(value, sectionParts(value)); }
    let candidates = onlyNoteId ? [noteIndex!.byId.get(onlyNoteId)].filter((entry): entry is NonNullable<typeof entry> => !!entry)
      : vertical ? noteIndex!.visible(view.leftSeconds, view.leftSeconds + 8 / view.zoom) : [...noteIndex!.byId.values()];
    if (onlyNoteId && activeEdit && activeEdit.note.id === onlyNoteId) {
      const voice = part('targetPartId' in activeEdit && activeEdit.targetPartId || activeEdit.partId);
      if (voice) candidates = [{ voice, note: { ...activeEdit.note, ...activeEdit.changes }, start: 0, end: 0 }];
    } else if (!onlyNoteId && selection?.noteId && !candidates.some(entry => entry.note.id === selection?.noteId)) {
      const selected = noteIndex!.byId.get(selection.noteId); if (selected) candidates.push(selected);
    }
    for (const { voice, note } of candidates) {
      // Dragging/mixing changes one note. Leave every unrelated DOM block
      // untouched, including its position, title, color and selection classes.
      if (note.startBeat >= value!.lengthBeats || note.startBeat + note.durationBeats <= 0) continue;
      if (vertical && note.id !== selection?.noteId && !(active && 'note' in active && active.note.id === note.id)) {
        const start = melodySeconds(note.startBeat, value!), held = phraseHeldSeconds(value!, note);
        if (start > view.leftSeconds + 8 / view.zoom || start + held < view.leftSeconds) continue;
      }
      seen.add(note.id); let block = noteNodes.get(note.id);
      if (!block) { block = button('', 'melody-note', () => {}); const resize = node('span', 'melody-note-resize'); block.append(resize); notes.append(block); noteNodes.set(note.id, block); }
      const name = partLabel(voice);
      block.dataset.noteId = note.id; block.dataset.partId = voice.id; block.setAttribute('aria-label', rhythm ? name : `${name} ${keys[phrasePitchRow(note.frequencyHz, keys)]?.label ?? ''}`);
      block.title = rhythm ? name : `${name} · ${keys[phrasePitchRow(note.frequencyHz, keys)]?.label ?? ''} · ${Number(phraseHeldSeconds(value!, note).toFixed(4))} 秒`;
      const rect = noteRect(note, voice, value!, canvasWidth, rhythmRows);
      let top = rect.y;
      if (active && active.kind === 'note' && active.note.id === note.id) top = rhythm
        ? originalDragRow! * view.rowHeight + 7 + active.rawY
        : melodyPitchTop(keys, phrasePitchRow(active.note.frequencyHz, keys), view.rowHeight) + 1 + active.rawY;
      block.style.left = `${vertical ? top : rect.x}px`; block.style.top = `${vertical ? rect.x : top}px`;
      block.style.width = `${vertical ? rect.height : rect.width}px`; block.style.height = `${vertical ? rect.width : rect.height}px`;
      block.style.setProperty('--tone-color', voice.unassigned ? '#b6bcc4' : toneColor(voice.timbreId)); block.classList.toggle('is-unassigned', !!voice.unassigned); block.classList.toggle('is-dim', !!selection && selection.noteId !== note.id && (rhythm ? selectedTimbreId !== voice.timbreId : selection.partId !== voice.id));
      const inactive=block.classList.contains('is-dim'); block.setAttribute('aria-disabled', String(inactive)); block.tabIndex=inactive?-1:0;
      block.classList.toggle('is-selected', selection?.noteId === note.id); block.classList.toggle('is-dragging', !!active && 'note' in active && active.note.id === note.id);
      const drawing = active?.kind === 'create' && active.note.id === note.id;
      block.classList.toggle('is-drawing', drawing); if (drawing) block.classList.add('is-selected');
    }
    if (!onlyNoteId) {
      for (const [id, element] of noteNodes) if (!seen.has(id)) { element.remove(); noteNodes.delete(id); }
      paintEntryRange();
    }
    positionHead();
  }
  function positionHead(): void {
    if (!quick.hidden) paintQuickHint();
    const value = body(); if (!value) return;
    // The resize observer/viewport paints maintain headWidth. The audio-clock
    // animation must not force layout by reading clientWidth every frame.
    const x = (playheadSeconds - view.leftSeconds) * melodyScale(view, headWidth, melodyDuration(value));
    const hidden = x < 0 || x > headWidth; head.hidden = headHandle.hidden = hidden;
    const coordinate = melodyClamp(x, 0, headWidth - 1);
    // Compositor translation avoids relayout on every audio-clock frame.
    head.style.transform = vertical ? `translateY(${coordinate}px)` : `translateX(${coordinate}px)`;
    headHandle.style.transform = vertical ? `translateY(${coordinate - 7}px)` : `translateX(${coordinate - 7}px)`;
    headHandle.setAttribute('aria-valuenow', String(playheadSeconds));
  }
  function field(label: string, input: HTMLElement, output?: HTMLElement): void {
    const wrap = node('label', 'melody-field'); const line = node('span', 'melody-field-head', label); if (output) line.append(output); wrap.append(line, input); console.append(wrap);
  }
  function beginMix(): Mix | undefined {
    if (mix) return mix; const selected = picked(); const value = body(); if (!selection || !selected || !value) return;
    return mix = { partId: selection.partId, note: selected, base: value, changes: {} };
  }
  function inputPreview(changes: NoteChanges): void { const active = beginMix(); if (!active) return; active.changes = { ...active.changes, ...changes }; previewEdit(); paintNotes(active.note.id); }
  function slider(label: string, property: 'level' | 'pan' | 'velocity', value: number, min: number): void {
    const input = node('input'); input.type = 'range'; input.min = String(min); input.max = '1'; input.step = '.01'; input.value = String(value); input.setAttribute('aria-label', label);
    const output = node('output'); const text = (amount: number) => property === 'pan' ? Math.abs(amount) < .005 ? '中' : `${amount < 0 ? '左' : '右'}${Math.round(Math.abs(amount) * 100)}` : `${Math.round(amount * 100)}%`;
    output.textContent = text(value);
    input.addEventListener('pointerdown', event => { const active = beginMix(); if (active) active.pointerId = event.pointerId; });
    input.addEventListener('input', () => { if (disposed) return; const amount = Number(input.value); if (!Number.isFinite(amount)) return; const next = melodyClamp(amount, min, 1); output.textContent = text(next); inputPreview({ [property]: next }); });
    input.addEventListener('wheel', event => {
      event.preventDefault(); event.stopPropagation(); if (disposed || !event.deltaY && !event.deltaX) return;
      const next = melodyClamp(Number(input.value) + ((event.deltaY || event.deltaX) < 0 ? .01 : -.01), min, 1);
      if (next !== Number(input.value)) { input.value = String(next); output.textContent = text(next); inputPreview({ [property]: next }); commitMix(); }
    }, { passive: false });
    input.addEventListener('change', commitMix); input.addEventListener('blur', commitMix); field(label, input, output);
  }
  function numberField(label: string, value: number, property: 'startBeat' | 'durationBeats'): void {
    const input = node('input'); input.type = 'number'; input.min = property === 'startBeat' ? '0' : String(MIN_NOTE_SECONDS); input.max = property === 'startBeat' ? String(melodySeconds(lastNoteStart(body()!) ?? 0, body()!)) : '96'; input.step = String(MIN_NOTE_SECONDS); input.value = String(Number(value.toFixed(4))); input.setAttribute('aria-label', label);
    input.addEventListener('input', () => {
      if (disposed || !input.value.trim()) return; const seconds = Number(input.value); const active = beginMix(); if (!Number.isFinite(seconds) || !active) return;
      const note = { ...active.note, ...active.changes };
      const hold = property === 'durationBeats' ? melodyClamp(seconds, MIN_NOTE_SECONDS, 96) : phraseHeldSeconds(active.base, note);
      const lastStart = lastNoteStart(active.base);
      if (property === 'startBeat' && lastStart === undefined) { mix = undefined; return; }
      const start = property === 'startBeat' ? melodyClamp(melodyBeats(seconds, active.base), 0, lastStart!) : note.startBeat;
      inputPreview({ startBeat: start, durationSeconds: hold, durationBeats: melodyClamp(phraseHeldBeats(active.base, start, hold), MIN_BEATS, active.base.lengthBeats - start) });
    }); input.addEventListener('change', commitMix); input.addEventListener('blur', commitMix); field(label, input);
  }
  function paintConsole(): void {
    if (vertical) return;
    console.replaceChildren(); const voice = part(); const note = picked(); console.hidden = !voice; if (!voice) { if (rhythm) paintShelf(); return; }
    console.append(node('strong', 'melody-console-name', partLabel(voice)));
    if (!note) {
      if (!rhythm) {
        const change = button('更换音色', 'melody-change-timbre', () => { if (!disposed) openLibrary({ kind: 'replace', partId: voice.id }); });
        change.setAttribute('aria-label', '更换总音符的音色'); console.append(change);
      }
      const remove = button('移除', 'melody-delete-tone-notes', () => requestRemoveFamily(voice.id)); remove.title = '移除这组音符'; remove.setAttribute('aria-label', '移除这组音符'); remove.classList.toggle('is-armed', deleteToneArmed?.partId === voice.id);
      console.append(remove);
      if (rhythm) paintShelf(); return;
    }
    slider('音量', 'level', note.level ?? 1, 0); slider('声像', 'pan', note.pan ?? 0, -1);
    if (!rhythm) { const pitch = node('select'); pitch.setAttribute('aria-label', '音高');
    const exact = keys.some(key => key.frequencyHz === note.frequencyHz);
    if (!exact) { const option = node('option', '', `${Number(note.frequencyHz.toFixed(2))} Hz`); option.value = String(note.frequencyHz); pitch.append(option); }
    for (const key of keys) { const option = node('option', '', key.label); option.value = String(key.frequencyHz); pitch.append(option); } pitch.value = String(note.frequencyHz);
    pitch.addEventListener('change', () => { if (disposed || !selection) return; const hz = Number(pitch.value); if (Number.isFinite(hz)) { inputPreview({ frequencyHz: melodyClamp(hz, 20, 5000) }); commitMix(); void audition.request(hz); } }); field('音高', pitch); }
    numberField('开始 / 秒', melodySeconds(note.startBeat, body()!), 'startBeat'); numberField('时长 / 秒', phraseHeldSeconds(body()!, note), 'durationBeats'); slider('力度', 'velocity', note.velocity, 0);
    if (rhythm) paintShelf();
  }
  function commitMix(): Error | undefined {
    const active = mix; if (!active || disposed) return; mix = undefined;
    try { if (Object.keys(active.changes).length) { phrase.updateNote(active.partId, active.note.id, active.changes); rememberLength(active.partId, active.note, active.changes); } preview(); refresh(); if (Object.keys(active.changes).length) notify(); }
    catch (error) { preview(); const failure = error instanceof Error ? error : new Error(String(error)); report(failure.message); refresh(); return failure; }
  }
  function refresh(snapshot?: PhraseView): void {
    if (disposed) return; const previous = part(); current = snapshot ?? phrase.read(); const next = body();
    if (toneDeleteDialog && current.draft?.id !== toneDeleteDraftId) toneDeleteDialog.close();
    // The view already contains project-scoped sound names. Re-listing the
    // complete project here re-read/validated the same records on every edit.
    toneNames = new Map(current.availableSounds.map(record => [record.id, record.name] as const));
    if (selection && !part()) { const replacement = sectionParts(next).find(value => value.timbreId === previous?.timbreId || value.name === previous?.name); selection = replacement ? { partId: replacement.id } : undefined; }
    if (selection?.noteId && !picked()) selection = { partId: selection.partId };
    if (entryToneId && !part(entryToneId)) entryToneId = undefined;
    toneColors = buildPhraseToneColors(next?.parts.map(value => value.timbreId) ?? []);
    if (next) view = clampView(view, melodyDuration(next)); audition.sync(current); paintShelf(); if (rhythm) paintRows(); paintGrid(); paintNotes(); if (!mix) paintConsole();
    extend.disabled = !next || next.lengthBeats + (vertical ? (next.beatsPerBar ?? 4) * 4 : next.beatsPerBar ?? 4) > MAX_PHRASE_BEATS;
    extend.title = extend.disabled ? '已达当前长度上限' : vertical ? '新增钢琴卷帘' : '增加一个小节'; libraryRefresh?.(); reportViewport(); persistWorkspace();
  }
  function deleteToneNotes(): void {
    if (!safeFlush()) return; const voice = part(); if (!voice) return;
    try {
      phrase.removePart(voice.id); addedParts.delete(voice.id); deleteToneArmed = undefined; refresh(); notify();
    } catch (error) { report(error instanceof Error ? error.message : String(error)); }
  }
  function requestRemoveFamily(id: string): void {
    if (disposed || toneDeleteDialog || !safeFlush()) return;
    const voice = part(id); if (!voice) return;
    const remove = () => { try { phrase.removePart(id); addedParts.delete(id); deleteToneArmed = undefined; refresh(); notify(); } catch(error) { report(error instanceof Error ? error.message : String(error)); } };
    const noteCount = voice.notes.length + (voice.hiddenNotes?.length ?? 0);
    if (!noteCount) { remove(); return; }
    const draftId=current.draft!.id, warning=node('dialog','melody-tone-delete-dialog');
    toneDeleteDialog=warning; toneDeleteDraftId=draftId;
    warning.append(node('h2','','移除这组音符？'),node('p','',`“${partLabel(voice)}”和其中的 ${noteCount} 个音符将一起移除。`));
    const actions=node('div','melody-tone-delete-actions');
    actions.append(button('取消','melody-tone-delete-cancel',()=>warning.close()),button('移除','melody-tone-delete-confirm',()=>{
      warning.close(); if(!disposed && phrase.read().draft?.id===draftId)remove();
    }));
    warning.append(actions); warning.addEventListener('close',()=>{if(toneDeleteDialog===warning){toneDeleteDialog=undefined;toneDeleteDraftId=undefined;}warning.remove();}); root.append(warning);warning.showModal();
  }
  function extendMeasure(): void {
    if (disposed || library || !safeFlush()) return; const value = body(); if (!value || value.lengthBeats >= MAX_PHRASE_BEATS) return;
    if (vertical) { tempoRolls?.addRoll(); return; }
    try {
      const length = Math.min(MAX_PHRASE_BEATS, value.lengthBeats + (value.beatsPerBar ?? 4)); phrase.setLength(length);
      const duration = melodyDuration(phrase.read().body!); view = clampView({ ...view, leftSeconds: Math.max(0, duration - 8 / view.zoom) }, duration);
      refresh(); notify(); scroll.focus({ preventScroll: true });
    } catch (error) { report(error instanceof Error ? error.message : String(error)); }
  }
  function point(event: Pick<PointerEvent, 'clientX' | 'clientY'>): Point {
    return vertical ? { x: event.clientY - canvas.getBoundingClientRect().top, y: event.clientX - scroll.getBoundingClientRect().left + pitchOffset() }
      : { x: event.clientX - canvas.getBoundingClientRect().left, y: event.clientY - scroll.getBoundingClientRect().top + pitchOffset() };
  }
  function seek(event: Pick<PointerEvent, 'clientX' | 'clientY'>): void {
    const value = body(); if (!value) return; playheadSeconds = melodyTimeAt(view, width(), melodyDuration(value), point(event).x); options.onSeek(playheadSeconds); positionHead(); persistWorkspace();
  }
  function begin(event: PointerEvent, headGesture = false): void {
    if (disposed || library || (event.button !== 0 && event.button !== 1 && event.button !== 2)) return;
    const target = event.target as HTMLElement;
    if (!headGesture && target.closest('.melody-note')?.classList.contains('is-dim')) { event.preventDefault(); event.stopPropagation(); return; }
    const key = target.closest<HTMLElement>('.melody-key');
    if (key && !headGesture) {
      if (vertical && event.button === 0 && safeFlush()) {
        event.preventDefault(); keyPan = { id: event.pointerId, capture: key, fromX: event.clientX, offset: pitchOffset(), moved: false };
        key.setPointerCapture?.(event.pointerId);
      }
      return;
    }
    event.preventDefault(); if (!safeFlush()) return; const value = body(); if (!value) return; scroll.focus({ preventScroll: true });
    const from = point(event); const base = { id: event.pointerId, capture: headGesture ? ruler : scroll, base: value, draftId: current.draft!.id, from, last: from, clientFrom: { x: event.clientX, y: event.clientY } };
    if (headGesture) { gesture = { ...base, kind: 'head' }; seek(event); }
    else if (event.button === 2) {
      gesture = { ...base, kind: 'erase', refs: new Map() };
      if (target.closest('.melody-note')) erase(from, from);
      else { selection = undefined; entryToneId = undefined; deleteToneArmed = undefined; audition.sync(current); }
    }
    else if (event.button === 1 || event.altKey || (!selection && !target.closest('.melody-note'))) gesture = { ...base, kind: 'pan', lastClient: { x: event.clientX, y: event.clientY } };
    else {
      const block = target.closest<HTMLElement>('.melody-note'); const voice = block ? part(block.dataset.partId) : rhythm ? visibleParts(value)[Math.floor(from.y / view.rowHeight)] : part(); const note = voice?.notes.find(item => item.id === block?.dataset.noteId);
      if (block && voice && note) {
        selection = { partId: voice.id, noteId: note.id }; entryToneId = undefined; audition.sync(current);
        const bounds = block.getBoundingClientRect();
        const resizing = !!target.closest('.melody-note-resize') || (vertical ? event.clientY >= bounds.bottom - Math.min(7, bounds.height * .25) : event.clientX >= bounds.right - Math.min(7, bounds.width * .25));
        gesture = { ...base, kind: resizing ? 'resize' : 'note', partId: voice.id, note, changes: {}, rawY: 0, moved: false };
        void audition.request(note.frequencyHz, phraseHeldSeconds(value, note), note.velocity);
      } else if (voice) {
        if (from.x < 0 || from.x >= (melodyDuration(value) - view.leftSeconds) * melodyScale(view, width(), melodyDuration(value))) return;
        const limit = value.lengthBeats; const lastStart = lastNoteStart(value);
        if (lastStart === undefined) return;
        const start = melodyClamp(melodyBeats(melodyTimeAt(view, width(), melodyDuration(value), from.x), value), 0, lastStart);
        const steps = editSteps(value, start);
        const row = melodyPitchAt(keys, from.y, view.rowHeight); const pitch = rhythm ? { frequencyHz: RHYTHM_PITCH } : keys[row]; if (!pitch) return;
        const seconds = noteLengths.get(voice.id) ?? 60 / phraseTempoAtBeat(value, start) / steps;
        const note: PhraseNote = { id: crypto.randomUUID(), startBeat: start, durationBeats: Math.min(limit - start, phraseHeldBeats(value, start, seconds)), durationSeconds: seconds, frequencyHz: pitch.frequencyHz, velocity: .75 };
        gesture = { ...base, kind: 'create', partId: voice.id, note, changes: {}, rawY: 0, moved: false };
      }
    }
    if (gesture) gesture.capture.setPointerCapture?.(event.pointerId);
    if (gesture?.kind === 'create') paintNotes(gesture.note.id);
    else { paintShelf(); paintNotes(); paintConsole(); } persistWorkspace();
  }
  function erase(from: Point, to: Point): void {
    const active = gesture; if (!active || active.kind !== 'erase') return;
    for (const voice of sectionParts(active.base)) for (const note of voice.notes) {
      if (selection && (rhythm ? voice.timbreId !== part(selection.partId)?.timbreId : voice.id !== selection.partId)) continue;
      if (note.startBeat >= active.base.lengthBeats) continue;
      if (playlistSegmentIntersectsRect(from, to, noteRect(note, voice, active.base))) active.refs.set(note.id, { partId: voice.id, noteId: note.id });
    }
    previewEdit(); paintNotes();
  }
  function move(event: PointerEvent): void {
    if (keyPan?.id === event.pointerId) {
      event.preventDefault(); const delta = event.clientX - keyPan.fromX;
      if (Math.abs(delta) > 3) keyPan.moved = true;
      if (keyPan.moved) { setTop(keyPan.offset - delta); scheduleViewport(); }
      return;
    }
    if (quickDrag?.id === event.pointerId) { event.preventDefault(); moveQuickScroll(event.clientY); return; }
    const active = gesture; if (disposed || !active || active.id !== event.pointerId) return; event.preventDefault();
    const now = point(event);
    if (active.kind === 'head') seek(event);
    else if (active.kind === 'create') {
      const scale = melodyScale(view, width(), melodyDuration(active.base));
      const extent = drawExtent(active.base, active.note.startBeat);
      const seconds = melodyClamp(view.leftSeconds + now.x / scale - melodySeconds(active.note.startBeat, active.base), extent.cell, extent.maximum);
      active.moved = active.moved || (vertical ? Math.abs(event.clientY - active.clientFrom.y) : Math.abs(event.clientX - active.clientFrom.x)) > 4;
      active.changes = { durationSeconds: seconds, durationBeats: melodyClamp(phraseHeldBeats(active.base, active.note.startBeat, seconds), MIN_BEATS, active.base.lengthBeats - active.note.startBeat) };
      paintNotes(active.note.id);
    }
    else if (active.kind === 'pan') {
      const client = { x: event.clientX, y: event.clientY };
      view = clampView({ ...view, leftSeconds: view.leftSeconds + (vertical ? active.lastClient.y - client.y : active.lastClient.x - client.x) / melodyScale(view, width(), melodyDuration(active.base)) }, melodyDuration(active.base));
      setTop(pitchOffset() + (vertical ? active.lastClient.x - client.x : active.lastClient.y - client.y)); active.lastClient = client;
      manualNavigation(); scheduleViewport();
    }
    else if (active.kind === 'erase') erase(active.last, now);
    else {
      const scale = melodyScale(view, width(), melodyDuration(active.base)); const delta = (now.x - active.from.x) / scale; const limit = active.base.lengthBeats;
      active.moved = active.moved || Math.abs(now.x - active.from.x) > 1 || Math.abs(now.y - active.from.y) > 1;
      if (active.kind === 'resize') {
        const seconds = melodyClamp(phraseHeldSeconds(active.base, active.note) + delta, MIN_NOTE_SECONDS, 96);
        active.changes = { durationSeconds: seconds, durationBeats: melodyClamp(phraseHeldBeats(active.base, active.note.startBeat, seconds), MIN_BEATS, limit - active.note.startBeat) };
      }
      else {
        const rowParts = visibleParts(active.base);
        const originalRow = rhythm ? rowParts.findIndex(part => part.id === active.partId) : phrasePitchRow(active.note.frequencyHz, keys);
        const rowCount = rhythm ? rowParts.length : keys.length;
        const originalTop = rhythm ? originalRow * view.rowHeight : melodyPitchTop(keys, originalRow, view.rowHeight);
        const lastTop = rhythm ? (rowCount - 1) * view.rowHeight : melodyPitchTop(keys, rowCount - 1, view.rowHeight);
        active.rawY = melodyClamp(now.y - active.from.y, -originalTop, lastTop - originalTop);
        const destination = rhythm ? originalRow + Math.round(active.rawY / view.rowHeight)
          : melodyPitchAt(keys, originalTop + melodyPitchHeight(keys, originalRow, view.rowHeight) / 2 + active.rawY, view.rowHeight);
        const offset = destination - originalRow; const pitch = keys[destination];
        if (rhythm) active.targetPartId = rowParts[originalRow + offset]!.id;
        const startBeat = melodyClamp(melodyBeats(melodySeconds(active.note.startBeat, active.base) + delta, active.base), 0, lastNoteStart(active.base) ?? active.note.startBeat);
        const seconds = phraseHeldSeconds(active.base, active.note);
        active.changes = { startBeat, durationSeconds: seconds, durationBeats: melodyClamp(phraseHeldBeats(active.base, startBeat, seconds), MIN_BEATS, limit - startBeat), ...(!rhythm && offset && pitch ? { frequencyHz: pitch.frequencyHz } : {}) };
      }
      previewEdit(); paintNotes(active.note.id);
    }
    if (active.kind !== 'pan') active.last = now;
  }
  function finish(commit: boolean): Error | undefined {
    const active = gesture; gesture = undefined; if (!active) return;
    if (active.capture.hasPointerCapture?.(active.id)) active.capture.releasePointerCapture(active.id);
    if (active.kind === 'pan') { reportViewport(); return; }
    if (active.kind === 'create' && !commit) { paintNotes(); return; }
    let created: PhraseNote | undefined;
    let changed = false; let failure: Error | undefined;
    try {
      if (commit && current.draft?.id === active.draftId) {
        if (active.kind === 'erase' && active.refs.size) { phrase.removeNotes([...active.refs.values()]); changed = true; if (selection?.noteId && active.refs.has(selection.noteId)) selection = { partId: selection.partId }; }
        else if (active.kind === 'create') {
          const extent = drawExtent(active.base, active.note.startBeat);
          const held = active.changes.durationSeconds ?? active.note.durationSeconds ?? extent.cell;
          const seconds = active.moved ? melodyClamp(Math.round(held / extent.cell) * extent.cell, extent.cell, extent.maximum)
            : active.note.durationSeconds ?? extent.cell;
          const { id: _id, ...note } = { ...active.note, durationSeconds: seconds, durationBeats: Math.min(active.base.lengthBeats - active.note.startBeat, phraseHeldBeats(active.base, active.note.startBeat, seconds)) };
          const id = phrase.addNote(active.partId, note); selection = { partId: active.partId, noteId: id }; entryToneId = rhythm ? undefined : active.partId; created = { ...note, id }; changed = true;
          if (active.moved) rememberLength(active.partId, active.note, { durationSeconds: seconds });
        } else if ((active.kind === 'note' || active.kind === 'resize') && active.moved) {
          const changes = { ...active.changes };
          if (changes.startBeat !== undefined) { const lastStart = lastNoteStart(active.base); changes.startBeat = lastStart === undefined ? active.note.startBeat : melodyClamp(changes.startBeat, 0, lastStart); changes.durationBeats = melodyClamp(phraseHeldBeats(active.base, changes.startBeat, changes.durationSeconds!), MIN_BEATS, active.base.lengthBeats - changes.startBeat); }
          if (rhythm && active.targetPartId && active.targetPartId !== active.partId) {
            phrase.moveNote(active.partId, active.note.id, active.targetPartId, changes); selection = { partId: active.targetPartId, noteId: active.note.id };
          } else phrase.updateNote(active.partId, active.note.id, changes);
          if (active.kind === 'resize') rememberLength(active.partId, active.note, changes);
          changed = true;
        }
      }
    } catch (error) { failure = error instanceof Error ? error : new Error(String(error)); report(failure.message); }
    preview(); refresh(); if (changed) notify();
    if (created && !failure) void audition.request(created.frequencyHz, phraseHeldSeconds(active.base, created), created.velocity);
    return failure;
  }
  function flush(persist = true): void { if (disposed) return; tempoRolls?.flush(); const failure = finish(true) ?? commitMix(); if (persist) persistWorkspace(true); if (failure) throw failure; }
  function safeFlush(): boolean { try { flush(false); return true; } catch { return false; } }
  function wheel(event: WheelEvent): void {
    if (disposed || !body() || library || root.querySelector('dialog[open]') || document.querySelector('dialog[open]')) return;
    event.preventDefault(); if (!safeFlush()) return;
    const value = body(); if (!value) return;
    const target = event.target as HTMLElement | null;
    const note = picked();
    const hoveredNote = target?.closest?.<HTMLElement>('.melody-note');
    const onSelectedNote = hoveredNote?.dataset.noteId === selection?.noteId && hoveredNote?.dataset.partId === selection?.partId;
    if (note && selection && onSelectedNote && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.deltaY !== 0) {
      if (!Number.isFinite(event.deltaY)) return;
      // A normal wheel notch is about 100 pixels or 3 lines. Fractional input
      // remains fine-grained; large device deltas cannot cause a sudden jump.
      const unit = event.deltaMode === 1 ? 3 : event.deltaMode === 2 ? 1 : 100;
      const held = phraseHeldSeconds(value, note);
      const next = melodyClamp(held - melodyClamp(event.deltaY / unit, -4, 4) * Math.min(.01, held / 10), MIN_NOTE_SECONDS, Math.max(96, held));
      if (Math.abs(next - held) < 1e-10) return;
      const changes: NoteChanges = { durationBeats: melodyClamp(phraseHeldBeats(value, note.startBeat, next), MIN_BEATS, value.lengthBeats - note.startBeat),
        ...(next <= 96 ? { durationSeconds: next } : {}) };
      // Very long legacy notes keep beat storage until they fit the explicit
      // seconds range, so shortening never suddenly truncates them to 96s.
      try { phrase.updateNote(selection.partId, note.id, changes); rememberLength(selection.partId, note, changes); refresh(); notify(); }
      catch (error) { report(error instanceof Error ? error.message : String(error)); }
      return;
    }
    const control = event.ctrlKey || event.metaKey;
    const pitchZoom = control && (vertical ? event.shiftKey : !event.shiftKey);
    const timeZoom = control && (vertical ? !event.shiftKey : event.shiftKey);
    if (pitchZoom) {
      const y = vertical ? event.clientX - scroll.getBoundingClientRect().left : event.clientY - scroll.getBoundingClientRect().top;
      const row = (pitchOffset() + y) / view.rowHeight;
      view = { ...view, rowHeight: melodyClamp(view.rowHeight * Math.exp(-event.deltaY * .002), rhythm ? 48 : 12, rhythm ? 120 : 44) }; paintRows(); setTop(row * view.rowHeight - y);
    } else if (timeZoom) { const rowHeight = view.rowHeight; view = zoomMelody(view, width(), melodyDuration(value), point(event).x, Math.exp(-event.deltaY * .002)); if (rhythm) view.rowHeight = rowHeight; }
    else if (vertical) {
      setTop(pitchOffset() + (event.shiftKey ? event.deltaX || event.deltaY : event.deltaX || 0));
      if (!event.shiftKey) view = clampView({ ...view, leftSeconds: view.leftSeconds + event.deltaY / melodyScale(view, width(), melodyDuration(value)) }, melodyDuration(value));
    }
    else if (!event.shiftKey && !event.deltaX) setTop(pitchOffset() + event.deltaY);
    else view = clampView({ ...view, leftSeconds: view.leftSeconds + (event.deltaX || event.deltaY) / melodyScale(view, width(), melodyDuration(value)) }, melodyDuration(value));
    manualNavigation(); scheduleViewport();
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
      const row = phrasePitchRow(frequencyHz, keys); const top = melodyPitchTop(keys, row, view.rowHeight); const height = melodyPitchHeight(keys, row, view.rowHeight);
      if (top < pitchOffset()) setTop(top);
      else if (top + height > pitchOffset() + pitchSpan()) setTop(top + height - pitchSpan());
    }
    paintGrid(); paintNotes(); positionHead(); reportViewport();
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
        const start = vertical ? 'left' : 'top', size = vertical ? 'width' : 'height';
        const centre = (Number.parseFloat(active[0]!.style[start]) + Number.parseFloat(active.at(-1)!.style[start]) + Number.parseFloat(active.at(-1)!.style[size])) / 2;
        setTop(centre - pitchSpan() / 2); reportViewport();
      }
      return true;
    }
    const pitch = rest ? undefined : melodyEntryPitch(key, entryOctave);
    if (!rest && pitch === undefined) { report('这个音符超出当前支持的音高范围。'); return true; }
    const beforeSeconds = options.readPlayhead?.() ?? playheadSeconds;
    const steps = phraseStepsPerBeat(value); const step = nextMelodyEntryStep(beforeSeconds, value.tempoBpm, value.lengthBeats, steps);
    if (!step || !rest && !step.canWrite) { report('已到音乐结尾。'); return true; }
    const heldSeconds = noteLengths.get(voice.id) ?? step.durationSeconds;
    if (!rest) {
      let noteId: string;
      try { noteId = phrase.addNote(voice.id, { startBeat: step.startBeat, durationBeats: Math.min(value.lengthBeats - step.startBeat, melodyBeats(heldSeconds, value.tempoBpm)), durationSeconds: heldSeconds, frequencyHz: pitch!, velocity: .75 }); }
      catch (error) { report(error instanceof Error ? error.message : String(error)); return true; }
      recordPerformanceEntry(phrase, noteId, melodyBeats(beforeSeconds, value.tempoBpm), step.startBeat);
      selection = { partId: voice.id, noteId }; refresh(); notify();
    }
    playheadSeconds = step.seconds; const ready = options.onSeek(step.seconds);
    if (!rest) void audition.request(pitch!, heldSeconds, .75, ready);
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
      const timeAxis = vertical ? !horizontal : horizontal;
      const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      if (event.ctrlKey && timeAxis) {
        const rowHeight = view.rowHeight; view = zoomMelody(view, width(), melodyDuration(value), width() / 2, forward !== vertical ? 1.15 : 1 / 1.15); if (rhythm) view.rowHeight = rowHeight;
      } else if (event.ctrlKey) {
        const row = (pitchOffset() + pitchSpan() / 2) / view.rowHeight;
        view.rowHeight = melodyClamp(view.rowHeight * (forward === vertical ? 1.15 : 1 / 1.15), rhythm ? 48 : 12, rhythm ? 120 : 44); paintRows();
        setTop(row * view.rowHeight - pitchSpan() / 2);
      } else if (timeAxis) view = clampView({ ...view, leftSeconds: view.leftSeconds + (forward ? 64 : -64) / melodyScale(view, width(), melodyDuration(value)) }, melodyDuration(value));
      else setTop(pitchOffset() + (forward ? view.rowHeight : -view.rowHeight));
      manualNavigation(); paintViewport(); return;
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
    if (key === 'delete' && selection?.noteId) { event.preventDefault(); if (!safeFlush() || !selection?.noteId) return; const selected = selection; try { phrase.removeNote(selected.partId, selected.noteId!); selection = { partId: selected.partId }; refresh(); notify(); } catch (error) { report(String(error)); } }
  }
  function historyMove(redo: boolean): void {
    const seconds = redo ? redoPhraseEdit(phrase) : undoPhraseEdit(phrase);
    if (seconds !== undefined) { playheadSeconds = seconds; void options.onSeek(seconds); }
    refresh(); notify();
  }
  function finishKeyPan(cancelled = false): void {
    const active = keyPan; if (!active) return; keyPan = undefined;
    if (active.moved || cancelled) suppressKeyClickUntil = performance.now() + 250;
    if (active.capture.hasPointerCapture?.(active.id)) active.capture.releasePointerCapture(active.id);
    reportViewport();
  }
  const up = (event: PointerEvent) => { if (keyPan?.id === event.pointerId) finishKeyPan(); if (quickDrag?.id === event.pointerId) finishQuickScroll(); if (gesture?.id === event.pointerId) finish(true); if (mix?.pointerId === event.pointerId) commitMix(); };
  const cancel = (event: PointerEvent) => { if (keyPan?.id === event.pointerId) finishKeyPan(true); if (quickDrag?.id === event.pointerId) finishQuickScroll(); if (gesture?.id === event.pointerId) finish(false); if (mix?.pointerId === event.pointerId) { mix = undefined; preview(); refresh(); } };
  const resize = () => { if (!disposed) { setTop(pitchOffset()); scheduleViewport(); } };
  scroll.addEventListener('pointerdown', event => begin(event)); ruler.addEventListener('pointerdown', event => { if (event.button === 0) begin(event, true); });
  scroll.addEventListener('contextmenu', event => event.preventDefault()); scroll.addEventListener('wheel', wheel, { passive: false }); ruler.addEventListener('wheel', wheel, { passive: false });
  if (rhythm) shelf.addEventListener('wheel', wheel, { passive: false });
  quick.addEventListener('pointerdown', event => {
    if (disposed || event.button !== 0 || !safeFlush()) return;
    event.preventDefault(); event.stopPropagation(); paintQuickScroll();
    quickDrag = { id: event.pointerId, top: quick.getBoundingClientRect().top,
      grab: (event.target as HTMLElement).closest('.melody-quick-thumb') ? event.clientY - quick.getBoundingClientRect().top - quickThumbTop : quickThumbHeight / 2 };
    quick.classList.add('is-dragging'); quick.setPointerCapture(event.pointerId);
    window.clearTimeout(quickHideTimer); moveQuickScroll(event.clientY);
  });
  quick.addEventListener('lostpointercapture', finishQuickScroll);
  quick.addEventListener('pointerenter', () => { quickHover = true; window.clearTimeout(quickHideTimer); });
  quick.addEventListener('pointerleave', () => { quickHover = false; deferQuickHide(); });
  quickThumb.addEventListener('focus', () => { quickFocused = true; window.clearTimeout(quickHideTimer); });
  quickThumb.addEventListener('blur', () => { quickFocused = false; deferQuickHide(); });
  quickThumb.addEventListener('keydown', event => {
    if (!body() || !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation(); if (!safeFlush()) return;
    const span = 8 / view.zoom, maximum = Math.max(0, melodyDuration(body()!) - span / 4);
    const delta = (event.key.endsWith('Up') ? -1 : 1) * span * (event.key.startsWith('Page') ? 1 : .1);
    view = clampView({ ...view, leftSeconds: event.key === 'Home' ? 0 : event.key === 'End' ? maximum : view.leftSeconds + delta }, melodyDuration(body()!));
    manualNavigation(true); scheduleViewport();
  });
  const scrolled = () => { if (!disposed) { setTop(pitchOffset()); if (rhythm) paintShelf(); reportViewport(); } };
  scroll.addEventListener('scroll', scrolled);
  const lost = (event: PointerEvent) => { if (keyPan?.id === event.pointerId) finishKeyPan(true); if (gesture?.id === event.pointerId) finish(false); };
  keyboard.addEventListener('lostpointercapture', lost);
  scroll.addEventListener('lostpointercapture', lost); ruler.addEventListener('lostpointercapture', lost);
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', cancel); document.addEventListener('keydown', keydown); window.addEventListener('resize', resize);
  if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(resize); observer.observe(canvas); observer.observe(scroll); }
  if (body()) {
    if (!initialViewport) {
      view = { ...initialMelodyView(body()!, width()), rowHeight: rhythm ? 72 : 32 };
      if (vertical) {
        const pitches = body()!.parts.flatMap(part => part.notes.map(note => phrasePitchRow(note.frequencyHz, keys)));
        if (pitches.length) {
          let low = keys.length, high = 0; for (const pitch of pitches) { low = Math.min(low, pitch); high = Math.max(high, pitch); }
          view.rowHeight = melodyClamp((pitchSpan() - 32) / (high - low + 3), 12, 32);
        }
      }
    }
    view = clampView(view, melodyDuration(body()!));
  }
  paintRows(); refresh(current);
  const frequencies = body()?.parts.flatMap(value => value.notes.map(note => note.frequencyHz)) ?? [];
  let lowFrequency = Infinity, highFrequency = 0; for (const frequency of frequencies) { lowFrequency = Math.min(lowFrequency, frequency); highFrequency = Math.max(highFrequency, frequency); }
  const centre = picked()?.frequencyHz ?? (frequencies.length ? vertical ? Math.sqrt(lowFrequency * highFrequency) : frequencies[Math.floor(frequencies.length / 2)]! : 261.625565);
  setTop(restorePitchOffset ?? (rhythm ? 0 : melodyPitchTop(keys, phrasePitchRow(centre, keys), view.rowHeight) - Math.max(view.rowHeight, pitchSpan()) / 2));
  if (rhythm) paintShelf(); viewportReady = true; reportViewport();
  return { refresh, flush, isStepInputActive, readViewport, setPlayhead(seconds, playing = false) { if (!disposed) {
    if (playheadSeconds !== seconds) { playheadSeconds = seconds; persistWorkspace(); }
    if (headInView()) followResumeAt = 0;
    if (vertical && playing && !gesture && !mix && !quickDrag && !keyPan && !tempoRolls?.isDragging() && body() && performance.now() >= followResumeAt) {
      const span = 8 / view.zoom, duration = melodyDuration(body()!);
      const target = melodyFollowTarget(seconds, view.leftSeconds, span, duration, span * 2 / Math.max(1, headWidth));
      // Following may leave blank space after the ending so the last page also
      // puts the head at the top. Manual navigation retains its normal bounds.
      if (target !== undefined) { view = { ...view, leftSeconds: target }; browseLastSeconds = target; paintViewport(); }
    }
    positionHead();
  } }, dispose() {
    if (disposed) return; finishKeyPan(true); finish(false); mix = undefined; persistWorkspace(true); preview(); audition.cancel(); tempoRolls?.dispose(); disposed = true; library?.close(); observer?.disconnect(); removeConsoleWheel(); window.clearTimeout(noticeTimer); window.clearTimeout(workspaceTimer);
    window.clearTimeout(quickHideTimer); quickDrag = undefined;
    cancelAnimationFrame(viewportFrame); viewportFrame = 0;
    scroll.removeEventListener('scroll', scrolled);
    document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', cancel); document.removeEventListener('keydown', keydown); window.removeEventListener('resize', resize);
  } };
}
