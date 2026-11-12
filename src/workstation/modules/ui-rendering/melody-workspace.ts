import type { KeyboardPitch, PhraseBody, PhraseEditorPort, PhraseNote, PhrasePart, PhraseView } from '../../contracts/phrase.ts';
import { phraseStepsPerBeat } from '../../contracts/phrase.ts';
import { phraseTempoAtBeat, phraseHeldSeconds, phraseHeldBeats, phraseStepsAtBeat } from '../../contracts/phrase-time.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import type { MusicWorkspaceStatePort } from '../../contracts/workspace.ts';
import type { LearningAction } from '../../contracts/guidance.ts';
import { createPhraseAudition } from './phrase-audition.ts';
import { defaultInstrumentInfo, DRUM_REFERENCE_FREQUENCY_HZ as RHYTHM_PITCH, instrumentCategories, studioLibraryGroups, unpitchedDrumKey } from '../timbre/instrument-catalog.ts';
import { attachConsoleHorizontalWheel } from './console-scroll.ts';
import { phrasePitchRow } from './phrase-viewport.ts';
import type { PhraseEditorViewport } from './phrase-editor-viewport.ts';
import { buildPhraseToneColors, toneColor as defaultToneColor } from './phrase-overview-notes.ts';
import { playlistSegmentIntersectsRect } from './playlist-geometry.ts';
import { melodyEntryKey, melodyEntryPitch, nextMelodyEntryStep } from './melody-key-entry.ts';
import { MAX_PHRASE_BEATS, MIN_NOTE_BEATS as MIN_BEATS, MIN_NOTE_SECONDS } from '../../contracts/phrase-limits.ts';
import { MIN_PITCH_HZ, MAX_PITCH_HZ, MIN_PITCH_OCTAVE, MAX_PITCH_OCTAVE } from '../../contracts/music-limits.ts';
import { recordPerformanceEntry, undoPhraseEdit, redoPhraseEdit } from './phrase-performance-history.ts';
import { formatPlayheadTime, melodyBeats, melodyClamp, melodyDuration, melodyDetailGrid, melodyDetailSteps, melodyNoteRect, melodyScale, melodySeconds,
  melodyPitchTop, melodyPitchHeight, melodyPitchAt,
  melodyTimeAt, clampMelodyView, initialMelodyView, zoomMelody, melodyScoreGrid, melodyScoreGridDepth, type MelodyView } from './melody-geometry.ts';
import './melody-workspace.css';
import { createMelodyNoteIndex, melodyFollowTarget, type IndexedMelodyNote } from './melody-note-index.ts';
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
  { kind: 'head'; seconds: number } | { kind: 'pan'; lastClient: Point } |
  { kind: 'erase'; refs: Map<string, { partId: string; noteId: string }>; moved: boolean; sampleTime?: number; touchRight?: boolean } |
  { kind: 'note' | 'create' | 'resize'; partId: string; targetPartId?: string; note: PhraseNote; changes: NoteChanges; rawY: number; moved: boolean; drumLane?: number; auditionOnClick?: boolean; touchDrag?: boolean; dragReadyAt?: number });
type Mix = { partId: string; note: PhraseNote; base: PhraseBody; changes: NoteChanges; pointerId?: number };
const DRUM_HIT_SECONDS = .05;
const DEFAULT_DRUM_LANE_WIDTH = 14;
const MIN_DRUM_LANE_WIDTH = 12;
const MAX_DRUM_LANE_WIDTH = 44;
const MIN_DRUM_HIT_HEIGHT = 4;
const MIN_PIANO_WIDTH = 32;
const NO_SOUNDING_NOTES: readonly IndexedMelodyNote[] = [];
const NOTE_DRAG_HOLD_MS = 120;
const GROUP_DRAG_TYPE = 'application/x-rootsound-note-group';
const TIMBRE_DRAG_TYPE = 'application/x-rootsound-timbre';

/** Piano-roll editing owns no audio clock: every audition/preview uses the common sound boundary. */
export function mountMelodyWorkspace(root: HTMLElement, options: {
  phrase: PhraseEditorPort; sound: SoundRuntimePort; gridBpm(): number;
  initialView?: PhraseView;
  initialSelection?: { partId: string; noteId?: string };
  initialViewport?: PhraseEditorViewport;
  workspaceState?: MusicWorkspaceStatePort;
  orientation?: 'horizontal' | 'vertical';
  showPlayheadTime?: boolean;
  onViewportChange?(viewport: PhraseEditorViewport): void;
  onChange(view?: PhraseView, preserveSounding?: boolean): void; onPreview(body?: PhraseBody): void; onSeek(seconds: number): void | Promise<void>;
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
  readMultipleTempoRolls?(): boolean;
  readDrumLanes?(): boolean;
  readWorkbench?(): boolean;
  onLearningAction?(action: LearningAction): void;
  readLessonInput?(): 'locked' | 'pan' | 'draw' | 'zoom' | 'edit';
  mobileTouch?: { readRightButton(): boolean };
}): { refresh(view?: PhraseView): void; dispose(): void; flush(): void; setPlayhead(seconds: number, playing?: boolean, displaySeconds?: number): void; isStepInputActive(): boolean; readViewport(): PhraseEditorViewport; frameNotes(reserveEndSpace?: boolean): void; previewTempoRate(value?: number, sectionId?: string): void } {
  const { phrase, sound } = options; let current = options.initialView ?? phrase.read(); let disposed = false;
  const rhythm = options.section === 'rhythm';
  const vertical = options.orientation === 'vertical';
  const drumRoll = vertical && !rhythm;
  const keys: KeyboardPitch[] = phrase.keyboard().slice(); if (!vertical) keys.reverse();
  const restored = options.workspaceState?.read();
  let requestedDrumLanes = restored?.drumLanes;
  let drumLaneWidth = melodyClamp(restored?.drumLaneWidth ?? DEFAULT_DRUM_LANE_WIDTH, MIN_DRUM_LANE_WIDTH, MAX_DRUM_LANE_WIDTH);
  let defaultDrumLanes = 0;
  let visibleDrumLanes = 0;
  let drumDividerDrag: { id: number; fromX: number; count: number } | undefined;
  const initialViewport = options.initialViewport ?? restored?.viewport;
  const restorePitchOffset = !vertical || options.initialViewport || restored?.orientation === 'vertical' ? initialViewport?.top : undefined;
  const noteLengths = new Map(Object.entries(restored?.noteLengths ?? {}));
  let workspaceTimer = 0;
  let view: MelodyView = { leftSeconds: initialViewport?.leftSeconds ?? 0,
    zoom: initialViewport?.zoom ?? 1, rowHeight: initialViewport?.rowHeight ?? (rhythm ? 72 : 32) };
  let revealConfiguredGrid = restored?.showGridCells ?? false;
  let viewportReady = false; let lastViewport: PhraseEditorViewport | undefined;
  const initialSelection = options.initialSelection ?? restored?.selection;
  const workbenchEnabled = () => options.readWorkbench?.() === true;
  let selection = vertical && !workbenchEnabled() && initialSelection?.noteId ? undefined : initialSelection;
  let gesture: Gesture | undefined; let mix: Mix | undefined;
  let playbackFamilyId: string | undefined;
  let playheadSeconds = restored?.playheadSeconds ?? 0; let library: HTMLDialogElement | undefined; let observer: ResizeObserver | undefined;
  let playheadPlaying = false;
  let clockFrame = -1;
  let entryOctave = restored?.entryOctave ?? 4;
  let entryToneId: string | undefined = vertical ? selection?.partId : restored?.entryToneId;
  let deleteToneArmed: { partId: string; at: number } | undefined;
  let libraryRefresh: (() => void) | undefined; let libraryError: HTMLElement | undefined;
  let draggedGroup: { id: string; draftId: string } | undefined;
  let suppressGroupClickUntil = 0;
  let draggedTone: { id: string; draftId: string } | undefined; let suppressLibraryClickUntil = 0;
  let toneDeleteDialog: HTMLDialogElement | undefined; let toneDeleteDraftId: string | undefined;
  let resetToneOrder: (() => void) | undefined;
  let noticeTimer = 0; const addedParts = new Set<string>(); const noteNodes = new Map<string, HTMLButtonElement>();
  const noteLabels = new WeakMap<HTMLButtonElement, string>();
  const noteAppearance = new WeakMap<HTMLButtonElement, string>();
  const gridNodes: HTMLElement[] = [];
  let gridSnapTimes: number[] = [];
  const drumGridNodes: HTMLElement[] = [];
  let headWidth = 1;
  let viewportFrame = 0;
  let previewFrame = 0;
  let indexedBody: PhraseBody | undefined;
  let noteIndex: ReturnType<typeof createMelodyNoteIndex> | undefined;
  let lastSoundingNotes: readonly IndexedMelodyNote[] | undefined;
  const pitchRows = new Map<number, number>();
  function pitchRow(frequency: number): number {
    let row = pitchRows.get(frequency);
    if (row === undefined) { row = phrasePitchRow(frequency, keys); pitchRows.set(frequency, row); }
    return row;
  }
  let followResumeAt = 0;
  let browseLastSeconds = view.leftSeconds, browseLastAt = -Infinity, browseSince = 0, browseDistance = 0;
  let quickHideTimer = 0, quickHover = false, quickFocused = false;
  let quickThumbTop = 0, quickThumbHeight = 28, quickTrackHeight = 1;
  let quickDescription = '';
  let quickDrag: { id: number; top: number; grab: number } | undefined;
  let keyPan: { id: number; capture: HTMLElement; fromX: number; offset: number; moved: boolean } | undefined;
  let suppressKeyClickUntil = 0;
  let tempoPreview: PhraseBody | undefined;
  let tempoRatePreview: PhraseBody | undefined;
  let tempoPreviewBoundaryOnly = false;
  let panMoved = false;
  const touches = vertical && options.mobileTouch && options.readLessonInput ? new Map<number, Point>() : undefined;
  let pinch: { x: number; y: number; axis?: 'x' | 'y' | 'both' } | undefined;
  let pinchFrame = 0;
  const sounding = new Set<string>();
  const keyNodes: HTMLButtonElement[] = [];
  let soundingKeys = new Map<number, string>();
  let toneColors = new Map<string, string>();
  let toneNames = new Map<string, string>();
  const drumKeys = new Map<string, number>();
  const page = node('div', 'melody-workspace'); const main = node('div', 'melody-main'); const shelf = node('aside', 'melody-shelf');
  page.classList.toggle('rhythm-workspace', rhythm);
  page.classList.toggle('is-vertical', vertical);
  shelf.setAttribute('aria-label', rhythm ? '音色栏' : '音符栏');
  const roll = node('div', 'melody-roll'); const rulerRow = node('div', 'melody-ruler-row'); const ruler = node('div', 'melody-ruler');
  const headHandle = button('', 'melody-head-handle', () => {}); headHandle.setAttribute('aria-label', rhythm ? '节奏播放线' : '旋律播放线'); headHandle.setAttribute('role', 'slider');
  headHandle.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
  ruler.append(headHandle); rulerRow.append(node('div', 'melody-ruler-spacer'), ruler, node('div', 'melody-extend-cap'));
  const scroll = node('div', 'melody-scroll'); scroll.tabIndex = 0; scroll.setAttribute('aria-label', rhythm ? '节奏步进音序器' : '旋律钢琴卷帘');
  const world = node('div', 'melody-world'); const keyboard = node('div', 'melody-keys'); const canvas = node('div', 'melody-canvas');
  const rows = node('div', 'melody-rows'); const grid = node('div', 'melody-grid'); const notes = node('div', 'melody-notes');
  const tempoBands = node('div', 'melody-tempo-bands');
  const head = node('div', 'melody-playhead'); head.setAttribute('aria-hidden', 'true'); const afterEnd = node('div', 'melody-after-end'); canvas.append(tempoBands, rows, grid, notes, head, afterEnd); world.append(keyboard, canvas); scroll.append(world);
  const endHandle = button('', 'melody-roll-end', () => {}); endHandle.setAttribute('aria-label', '调整末段小节数');
  if (vertical) canvas.append(endHandle);
  const editor = node('div', 'melody-editor'); const extend = button('+', 'melody-extend', extendMeasure); extend.setAttribute('aria-label', vertical ? '新增钢琴卷帘' : '增加一个小节'); editor.append(scroll, extend);
  const console = node('div', 'melody-console'); console.hidden = true; roll.append(rulerRow, editor); roll.append(console); main.append(shelf, roll);
  const drumStrip = node('div', 'melody-drum-strip'); drumStrip.hidden = true; drumStrip.setAttribute('aria-label', '打击位');
  const drumCanvas = node('div', 'melody-drum-canvas');
  const drumGrid = node('div', 'melody-grid'); const drumNotes = node('div', 'melody-notes');
  const drumHead = node('div', 'melody-playhead'); drumHead.setAttribute('aria-hidden', 'true');
  const drumEnd = node('div', 'melody-after-end');
  const drumKeyboard = node('div', 'melody-drum-keys');
  const drumKeyNodes: HTMLButtonElement[] = [];
  const drumDivider = node('div', 'melody-drum-divider');
  drumDivider.tabIndex = 0;
  drumDivider.hidden = true;
  drumDivider.setAttribute('role', 'separator');
  drumDivider.setAttribute('aria-orientation', 'vertical');
  drumDivider.setAttribute('aria-label', '打击列宽度');
    drumDivider.setAttribute('aria-valuemin', '1');
  drumCanvas.append(drumGrid, drumNotes, drumHead, drumEnd);
  drumStrip.append(drumCanvas, drumKeyboard);
  if (drumRoll) {
    page.style.setProperty('--melody-drum-width', '0px');
    roll.append(drumStrip, drumDivider);
  }
  const headTime = vertical && options.showPlayheadTime ? node('span', 'melody-playhead-time') : undefined;
  if (headTime) {
    headTime.hidden = true;
    headTime.setAttribute('aria-hidden', 'true');
    roll.append(headTime);
  }
  const quick = node('div', 'melody-quick-scroll'); quick.hidden = true;
  const quickThumb = button('', 'melody-quick-thumb', () => {}); quickThumb.setAttribute('role', 'slider');
  quickThumb.setAttribute('aria-label', '快速定位'); quickThumb.setAttribute('aria-orientation', 'vertical');
  const quickHint = node('div', 'melody-quick-hint'); quickHint.hidden = true; quickHint.setAttribute('aria-hidden', 'true');
  quick.append(quickThumb, quickHint); if (vertical) roll.append(quick);
  const removeConsoleWheel = vertical ? () => {} : attachConsoleHorizontalWheel(console);
  if (vertical) shelf.setAttribute('aria-label', '音色栏');
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
  const drumOrigin = () => pitchOffset() + pitchSpan();
  const drumLaneAt = (y: number) => melodyClamp(visibleDrumLanes - 1 - Math.floor((y - drumOrigin()) / drumLaneWidth), 0, visibleDrumLanes - 1);
  const body = () => tempoPreview ?? current.body;
  const tempoDock = node('div', 'melody-tempo-dock'); if (vertical) roll.append(tempoDock);
  const tempoRolls = vertical ? mountMelodyTempoRolls({ root: page, dock: tempoDock, ruler, bands: tempoBands, extend, end: endHandle, phrase,
    readMultipleTempoRolls: options.readMultipleTempoRolls, onLearningAction: options.onLearningAction, previewRate: previewTempoRate, inGuide: !!options.readLessonInput,
    readBody: body, readView: () => view, scale: () => melodyScale(view, width(), melodyDuration(body()!)), height: width,
    flush: safeFlush, changed(committed = true, preserveSounding = false) { refresh(); if (committed) notify(preserveSounding); }, report,
    gridChanged() {
      revealConfiguredGrid = true;
    },
    preview(value, boundaryOnly) {
      tempoPreview = value;
      tempoPreviewBoundaryOnly = boundaryOnly ?? false;
      if (!value) {
        if (!options.readIsPlaying) preview();
        return;
      }
      if (boundaryOnly) paintGrid();
      else paintViewport();
      if (!options.readIsPlaying) previewEdit();
    },
    navigate(seconds) { view = clampView({ ...view, leftSeconds: seconds }, melodyDuration(body()!)); manualNavigation(); paintViewport(); },
  }) : undefined;
  if (vertical) tempoDock.append(extend);
  const editSteps = (value: PhraseBody, beat = melodyBeats(view.leftSeconds, value)) => {
    const steps = phraseStepsAtBeat(value, beat), scale = melodyScale(view, width(), melodyDuration(value));
    const detailPixels = revealConfiguredGrid ? 0 : undefined;
    const divisions = value.tempoSections?.length ? steps ** melodyScoreGridDepth(value, scale, detailPixels)
      : melodyDetailSteps(phraseTempoAtBeat(value, beat), steps, scale, detailPixels);
    return Math.max(steps, divisions);
  };
  function lastNoteStart(value: PhraseBody): number | undefined {
    const minimum = Math.max(MIN_BEATS, MIN_NOTE_SECONDS * phraseTempoAtBeat(value, value.lengthBeats) / 60);
    return value.lengthBeats >= minimum ? value.lengthBeats - minimum : undefined;
  }
  function noteStartAt(value: PhraseBody, seconds: number, limit: number, scale: number): number {
    let low = 0, high = gridSnapTimes.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (gridSnapTimes[middle]! < seconds) low = middle + 1;
      else high = middle;
    }
    const lastSeconds = melodySeconds(limit, value);
    let target = seconds, bestDistance = Infinity;
    for (const index of [low - 1, low]) {
      const time = gridSnapTimes[index];
      if (time === undefined || time > lastSeconds) continue;
      const gap = Math.min(time - (gridSnapTimes[index - 1] ?? -Infinity), (gridSnapTimes[index + 1] ?? Infinity) - time);
      const radius = Math.min(5 / scale, gap / 4);
      const distance = Math.abs(time - seconds);
      if (distance <= radius && distance < bestDistance) { target = time; bestDistance = distance; }
    }
    return melodyClamp(melodyBeats(target, value), 0, limit);
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
        ...(drumRoll && requestedDrumLanes !== undefined ? { drumLanes: requestedDrumLanes } : {}),
        ...(drumRoll && drumLaneWidth !== DEFAULT_DRUM_LANE_WIDTH ? { drumLaneWidth } : {}),
        playheadSeconds: Math.max(0, Math.min(melodyDuration(body()!), playheadSeconds)), entryOctave, entryToneId,
        noteLengths: Object.fromEntries([...noteLengths].filter(([id]) => !!part(id))) });
    } else if (!workspaceTimer) workspaceTimer = window.setTimeout(() => { workspaceTimer = 0; persistWorkspace(true); }, 200);
  }
  function rememberLength(partId: string, note: PhraseNote, changes: NoteChanges): void {
    if (changes.durationSeconds !== undefined && Math.abs(changes.durationSeconds - phraseHeldSeconds(body()!, note)) > 1e-10) {
      noteLengths.set(partId, melodyClamp(changes.durationSeconds, MIN_NOTE_SECONDS, 96)); persistWorkspace();
    }
  }
  function reportViewport(remember = true): void {
    setTop(pitchOffset()); if (!viewportReady || disposed) return;
    if (remember) persistWorkspace();
    const next = readViewport();
    if (lastViewport && next.leftSeconds === lastViewport.leftSeconds && next.zoom === lastViewport.zoom && next.top === lastViewport.top && next.rowHeight === lastViewport.rowHeight) return;
    lastViewport = next; options.onViewportChange?.({ ...next });
  }
  function paintViewport(remember = true, updateHead = true): void {
    cancelAnimationFrame(viewportFrame); viewportFrame = 0;
    if (disposed) return;
    if (rhythm) paintShelf();
    paintGrid(); paintNotes(undefined, updateHead); paintQuickScroll(); reportViewport(remember);
  }
  function scheduleViewport(): void {
    if (!viewportFrame) viewportFrame = requestAnimationFrame(() => paintViewport());
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
    if (quickHint.hidden !== quick.hidden) quickHint.hidden = quick.hidden;
    const duration = melodyDuration(body()!);
    const top = melodyClamp(playheadSeconds / Math.max(duration + 6 / view.zoom, 1e-8), 0, 1) * quickTrackHeight;
    quickHint.style.transform = `translateY(${top - 1}px)`;
    const description = playheadSeconds < view.leftSeconds ? '播放线在上方'
      : playheadSeconds > view.leftSeconds + 8 / view.zoom ? '播放线在下方' : '播放线在视野内';
    if (quickDescription !== description) {
      quickDescription = description;
      quickThumb.setAttribute('aria-description', description);
    }
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
  function notify(preserveSounding = false): void { if (!disposed) options.onChange(current, preserveSounding); }
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
  function drumKey(voice?: PhrasePart): number | undefined {
    return drumRoll && voice && !voice.unassigned ? drumKeys.get(voice.timbreId) : undefined;
  }
  function drumLane(note: PhraseNote, key: number): number {
    return note.drumLane ?? (key === 35 || key === 36 ? 0 : key >= 37 && key <= 40 ? 1 : 2);
  }
  function availableDrumWidth(): number {
    return roll.clientWidth - (rulerRow.offsetWidth ?? rulerRow.clientWidth) - MIN_PIANO_WIDTH;
  }
  function maxVisibleDrumLanes(): number {
    return Math.max(1, Math.floor(availableDrumWidth() / drumLaneWidth));
  }
  function syncDrumStrip(): void {
    if (!drumRoll) return;
    const maximum = maxVisibleDrumLanes();
    const enabled = options.readDrumLanes?.() === true;
    const count = enabled && defaultDrumLanes > 0 ? melodyClamp(requestedDrumLanes ?? defaultDrumLanes, 1, maximum) : 0;
    visibleDrumLanes = count;
    drumDivider.hidden = count === 0;
    drumDivider.setAttribute('aria-valuemax', String(maximum));
    drumDivider.setAttribute('aria-valuenow', String(count));
    drumStrip.hidden = count === 0;
    page.classList.toggle('has-drum-strip', count > 0);
    page.style.setProperty('--melody-drum-lane-width', `${drumLaneWidth}px`);
    page.style.setProperty('--melody-drum-width', `${count * drumLaneWidth}px`);
    while (drumKeyNodes.length > count) drumKeyNodes.pop()!.remove();
    while (drumKeyNodes.length < count) {
      const lane = drumKeyNodes.length;
      const key = button('', 'melody-drum-key', () => {
        if (!disposed && drumKey(part()) !== undefined) void audition.requestKeyboard(RHYTHM_PITCH);
      });
      key.setAttribute('aria-label', '试听打击音色');
      const color = soundingKeys.get(keys.length + lane);
      if (color) { key.style.setProperty('--key-flash-color', color); key.classList.add('is-sounding'); }
      drumKeyNodes.push(key);
      drumKeyboard.append(key);
    }
    const armed = drumKey(part()) !== undefined;
    for (const key of drumKeyNodes) key.disabled = !armed;
  }
  function setDrumLanes(count: number): void {
    if (!visibleDrumLanes) return;
    const next = melodyClamp(count, 1, maxVisibleDrumLanes());
    if (next === visibleDrumLanes) return;
    requestedDrumLanes = next;
    syncDrumStrip();
    scheduleViewport();
  }
  function partLabel(value: PhrasePart): string { return value.unassigned ? '未定义' : rhythm ? value.name : toneNames.get(value.timbreId) ?? value.name; }
  function toneColor(id: string): string {
    return toneColors.get(id) ?? defaultToneColor(id);
  }
  function editingFamilyId(): string | undefined {
    return vertical && selection?.noteId ? undefined : selection?.partId;
  }
  function picked(): PhraseNote | undefined { return part()?.notes.find(value => value.id === selection?.noteId); }
  function displayedBody(): PhraseBody | undefined {
    const active = gesture; const base = mix?.base ?? active?.base ?? (tempoPreviewBoundaryOnly ? current.body : body()); if (!base) return;
    if (mix) return replaceNote(base, mix.partId, mix.note.id, { ...mix.note, ...mix.changes });
    if (!active || active.kind === 'pan' || active.kind === 'head') return base;
    if ((active.kind === 'note' || active.kind === 'resize') && !active.moved) return base;
    if (active.kind === 'erase') return vertical ? base : { ...base, parts: base.parts.map(value => ({ ...value, notes: value.notes.filter(note => !active.refs.has(note.id)) })) };
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
  function choose(next: Selection): void { if (!safeFlush()) return; selection = next; entryToneId = !rhythm && !next.noteId ? next.partId : undefined; deleteToneArmed = undefined; audition.sync(current); paintShelf(); syncDrumStrip(); paintNotes(); paintConsole(); persistWorkspace(); if (!next.noteId) options.onLearningAction?.('select-group'); }
  function endGroupDrag(): void {
    if (draggedGroup) suppressGroupClickUntil = Date.now() + 250;
    draggedGroup = undefined;
    for (const entry of shelf.querySelectorAll('.melody-tone-entry')) entry.classList.remove('is-merge-target');
    for (const card of shelf.querySelectorAll('.melody-note-family')) card.classList.remove('is-group-dragging');
  }
  function paintShelf(): void {
    const editingFamily = editingFamilyId();
    canvas.classList.toggle('is-write-mode', !!editingFamily);
    const nextPlaybackFamily = selection && !selection.noteId ? part()?.id : undefined;
    if (nextPlaybackFamily !== playbackFamilyId) {
      playbackFamilyId = nextPlaybackFamily; options.onPlaybackFamilyChange?.(playbackFamilyId);
    }
    shelf.replaceChildren();
    for (const [index, value] of visibleParts().entries()) {
      const entry = node('div', 'melody-tone-entry');
      const label = partLabel(value);
      const card = button(label, rhythm ? 'melody-tone' : 'melody-tone melody-note-family', () => { if (!disposed && Date.now() >= suppressGroupClickUntil) { choose({ partId: value.id }); scroll.focus({ preventScroll: true }); } });
      if (!rhythm) card.title = label;
      const separator = drumKey(value) === undefined ? -1 : label.indexOf(' · ');
      if (separator >= 0) {
        card.classList.add('is-drum-family');
        card.setAttribute('aria-label', label);
        card.replaceChildren(node('span', 'melody-drum-family-kit', label.slice(0, separator)),
          node('span', '', label.slice(separator + 3)));
      }
      card.dataset.partId = value.id; card.style.setProperty('--tone-color', toneColor(value.timbreId)); card.classList.toggle('is-selected', editingFamily === value.id);
      if (vertical) card.addEventListener('dblclick', () => openLibrary({ kind: 'replace', partId: value.id }));
      card.classList.toggle('is-unassigned', !!value.unassigned);
      if (!rhythm) {
        card.draggable = !value.unassigned;
        card.addEventListener('dragstart', event => {
          if (disposed || !current.draft || !event.dataTransfer || value.unassigned || !safeFlush()) { event.preventDefault(); return; }
          audition.cancel(); draggedGroup = { id: value.id, draftId: current.draft.id };
          event.dataTransfer.setData(GROUP_DRAG_TYPE, value.id); event.dataTransfer.effectAllowed = 'move';
          card.classList.add('is-group-dragging');
        });
        const accepts = () => {
          if (disposed || !draggedGroup || draggedGroup.draftId !== current.draft?.id || draggedGroup.id === value.id) return false;
          const source = part(draggedGroup.id), target = part(value.id);
          return !!source && !!target && !source.unassigned && !target.unassigned && source.timbreId === target.timbreId;
        };
        entry.addEventListener('dragover', event => {
          if (!accepts() || !event.dataTransfer) return;
          event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = 'move'; entry.classList.add('is-merge-target');
        });
        entry.addEventListener('dragleave', () => entry.classList.remove('is-merge-target'));
        entry.addEventListener('drop', event => {
          event.preventDefault(); event.stopPropagation();
          const source = draggedGroup;
          const valid = accepts() && event.dataTransfer?.getData(GROUP_DRAG_TYPE) === source?.id;
          endGroupDrag();
          if (!valid || !source || !safeFlush()) return;
          try {
            phrase.mergeParts(source.id, value.id); addedParts.delete(source.id);
            selection = { partId: value.id }; entryToneId = value.id; deleteToneArmed = undefined;
            refresh(); persistWorkspace(); notify();
          } catch (error) { report(error instanceof Error ? error.message : String(error)); }
        });
        card.addEventListener('dragend', endGroupDrag);
      }
      entry.append(card);
      if (!vertical) {
        const play = button('▶', 'melody-tone-preview', () => { if (!disposed && !value.unassigned) void audition.requestTimbre(value.timbreId); });
        play.setAttribute('aria-label', `试听${partLabel(value)}`); play.disabled = !!value.unassigned; play.title = value.unassigned ? '尚未定义音色' : '试听音色'; entry.append(play);
        const remove = button('×', 'melody-family-remove', () => requestRemoveFamily(value.id));
        remove.setAttribute('aria-label', `移除${partLabel(value)}`); entry.append(remove);
      }
      if (rhythm) {
        const top = 24 + index * view.rowHeight - scroll.scrollTop; const bottom = Math.min(24 + scroll.clientHeight, shelf.clientHeight - 44);
        entry.style.top = `${top}px`; entry.style.height = `${view.rowHeight}px`; entry.style.clipPath = `inset(${Math.max(0, 24 - top)}px 0 ${Math.max(0, top + view.rowHeight - bottom)}px 0)`; card.dataset.rowIndex = String(index); card.style.height = `${view.rowHeight}px`;
      }
      shelf.append(entry);
    }
    const add = button('+', rhythm ? 'melody-add-tone' : 'melody-add-tone melody-add-note-family', () => openLibrary()); add.setAttribute('aria-label', rhythm || vertical ? '添加音色' : '新建总音符'); shelf.append(add);
    paintEntryRange();
  }
  function openLibrary(intent: LibraryIntent = { kind: 'create' }): void {
    if (disposed || library || toneDeleteDialog || !safeFlush()) return;
    if (!rhythm && intent.kind === 'replace' && !part(intent.partId)) { report('找不到这个总音符，请重新选择。'); return; }
    const openedDraftId = current.draft?.id;
    const dialog = node('dialog', 'melody-tone-library'); library = dialog; dialog.setAttribute('aria-label', '音色库');
    const heading = node('div', 'melody-library-heading'); const close = button('→', 'melody-library-close', dismiss); close.setAttribute('aria-label', '关闭音色库');
    heading.append(node('h2', '', '音色库'), close); const tiles = node('div', 'melody-library-grid'); const error = node('p', 'melody-library-error'); error.hidden = true;
    let category = '全部'; let query = '';
    const tools = node('div', 'melody-library-tools');
    const search = node('input', 'melody-library-search'); search.type = 'search'; search.placeholder = '搜索音色'; search.setAttribute('aria-label', '搜索音色');
    const categories = node('div', 'melody-library-categories');
    const categoryButtons = new Map<string, HTMLButtonElement>();
    function libraryEntries() {
      const bodies = new Map(current.availableSounds.map(record => [record.id, record.body]));
      const showDrums = !drumRoll || options.readDrumLanes?.() === true;
      const entries = options.listTimbres().map(timbre => ({ timbre, info: defaultInstrumentInfo(timbre.id, bodies.get(timbre.id)) }))
        .filter(({ info }) => showDrums || info?.drum === undefined);
      return entries.map(({ timbre, info }) => ({
        timbre, info, group: info?.libraryGroup ?? '自定义',
      }));
    }
    function filteredTimbres(entries: ReturnType<typeof libraryEntries>) {
      return entries.filter(({ timbre, info, group }) => (category === '全部' || group === category)
        && (!query || `${timbre.name} ${info?.aliases ?? ''} ${info?.category ?? ''} ${group}`.toLocaleLowerCase().includes(query)));
    }
    function selectCategory(value: string): void {
      category = value; libraryRefresh?.();
    }
    function paintCategories(entries: ReturnType<typeof libraryEntries>): void {
      const present = new Set(entries.map(entry => entry.group));
      const values = ['全部', ...new Set([...studioLibraryGroups, ...instrumentCategories, '自定义'].filter(value => present.has(value)))];
      if (!values.includes(category)) category = '全部';
      if (values.length !== categoryButtons.size || values.some(value => !categoryButtons.has(value))) {
        categoryButtons.clear(); categories.replaceChildren();
        for (const value of values) {
          const item = button(value, 'melody-library-category', () => selectCategory(value));
          categoryButtons.set(value, item); categories.append(item);
        }
      }
      for (const [value, item] of categoryButtons) {
        const selected = value === category;
        item.classList.toggle('is-active', selected); item.setAttribute('aria-pressed', String(selected));
      }
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
        const currentIds = filteredTimbres(libraryEntries()).map(({ timbre }) => timbre.id);
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
      const entries = libraryEntries(); paintCategories(entries);
      cards.clear(); tiles.replaceChildren();
      for (const { timbre, info, group } of filteredTimbres(entries)) {
        const uses = sectionParts().filter(part => part.timbreId === timbre.id); const selected = uses.some(part => !part.unassigned && visibleParts().some(visible => visible.id === part.id));
        const frame = node('div', 'melody-library-card'); frame.draggable = true; frame.dataset.timbreId = timbre.id;
        frame.title = `${group} · ${timbre.name}${info && 'program' in info ? ` · GM ${info.program! + 1}` : ''}`;
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
              dismiss(); refresh(); notify(); scroll.focus({ preventScroll: true }); if (intent.kind === 'create') options.onLearningAction?.('add-group'); return;
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
            query = ''; search.value = ''; category = '自定义';
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
    let closed = false;
    function cleanup() {
      if (closed) return; closed = true; toneDeleteDialog?.close();
      if (library === dialog) { library = undefined; libraryRefresh = undefined; libraryError = undefined; }
      endToneDrag(); resetToneOrder = undefined; audition.cancel(); page.append(toneTrash); dialog.remove();
    }
    function dismiss() { dialog.close(); cleanup(); }
    libraryRefresh(); dialog.append(heading, tools, tiles, error, toneTrash); dialog.addEventListener('close', cleanup); root.append(dialog); dialog.showModal();
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
    keyNodes.length = 0;
    keys.forEach((pitch, index) => {
      const octaveLabel = /^C(-?\d+)$/u.exec(pitch.label);
      const key = button(vertical ? octaveLabel ? pitch.label : '' : pitch.label, 'melody-key', () => {
        if (!disposed && drumKey(part()) === undefined && performance.now() >= suppressKeyClickUntil) void audition.requestKeyboard(pitch.frequencyHz);
      });
      key.dataset.pitchLabel = pitch.label;
      if (vertical && octaveLabel && view.rowHeight < 22) { key.textContent = `C\n${octaveLabel[1]}`; key.classList.add('is-stacked-label'); }
      key.classList.toggle('is-accidental', pitch.accidental);
      const start = `${melodyPitchTop(keys, index, view.rowHeight)}px`, size = `${melodyPitchHeight(keys, index, view.rowHeight)}px`;
      if (vertical) { key.style.left = start; key.style.width = size; } else { key.style.top = start; key.style.height = size; }
      key.dataset.frequencyHz = String(pitch.frequencyHz);
      key.setAttribute('aria-label', `${pitch.label} ${Number(pitch.frequencyHz.toFixed(2))} Hz`);
      keyNodes.push(key);
      const flash = soundingKeys.get(index);
      if (flash !== undefined) { key.style.setProperty('--key-flash-color', flash); key.classList.add('is-sounding'); }
      keyboard.append(key);
      const row = node('div', 'melody-pitch-row'); row.classList.toggle('is-accidental', pitch.accidental);
      if (vertical) { row.style.left = start; row.style.width = size; } else { row.style.top = start; row.style.height = size; } rows.append(row);
    });
    paintEntryRange();
  }
  function paintEntryRange(): void {
    const entry = entryToneId ? part(entryToneId) : undefined;
    const armed = !rhythm && (options.readPerformanceMode?.() ?? false) && !!entry && drumKey(entry) === undefined;
    for (const key of keyboard.querySelectorAll<HTMLButtonElement>('.melody-key')) {
      const midi = Math.round(69 + 12 * Math.log2(Number(key.dataset.frequencyHz) / 440));
      const active = armed && Math.floor(midi / 12) - 1 === entryOctave;
      key.classList.toggle('is-entry-range', active);
      key.title = `${key.dataset.pitchLabel ?? ''}${active ? ' · 键盘输入音区 · Z / X 切换' : ''}`;
    }
  }
  function noteRect(note: PhraseNote, voice: PhrasePart, value: PhraseBody, canvasWidth = width(), rhythmRows?: Map<string, number>) {
    const rect = melodyNoteRect(note, value, keys, view, canvasWidth, pitchRow(note.frequencyHz));
    return rhythm ? { ...rect, y: (rhythmRows?.get(voice.id) ?? visibleParts(value).findIndex(part => part.id === voice.id)) * view.rowHeight + 7, height: view.rowHeight - 14 } : rect;
  }
  function drumRect(note: PhraseNote, lane: number, value: PhraseBody, canvasWidth: number) {
    const scale = melodyScale(view, canvasWidth, melodyDuration(value));
    const x = (melodySeconds(note.startBeat, value) - view.leftSeconds) * scale;
    return { x, y: (visibleDrumLanes - 1 - lane) * drumLaneWidth + 2,
      width: Math.max(MIN_DRUM_HIT_HEIGHT, phraseHeldSeconds(value, note) * scale), height: drumLaneWidth - 4 };
  }
  function previewTempoRate(tempoBpm?: number, sectionId?: string): void {
    const value = body();
    if (!tempoRatePreview && tempoBpm === undefined) return;
    tempoRatePreview = value && tempoBpm !== undefined ? sectionId
      ? { ...value, tempoSections: value.tempoSections?.map(section => section.id === sectionId ? { ...section, tempoBpm } : section) }
      : { ...value, tempoBpm }
      : undefined;
    paintGrid();
  }
  function paintGrid(): void {
    const value = tempoRatePreview ?? body();
    tempoRolls?.paint(value);
    if (!value) { grid.replaceChildren(); drumGrid.replaceChildren(); gridNodes.length = drumGridNodes.length = 0; gridSnapTimes = []; return; }
    // Read layout before changing any lines. Reading clientWidth after each
    // append/style write otherwise forces a fresh layout for every grid line.
    const canvasWidth = width(); headWidth = canvasWidth;
    const duration = melodyDuration(value); const scale = melodyScale(view, canvasWidth, duration);
    const detailPixels = revealConfiguredGrid ? 0 : 48;
    const lines = value.tempoSections?.length ? melodyScoreGrid(value, view, canvasWidth, detailPixels)
      : melodyDetailGrid(duration, vertical ? value.tempoBpm : options.gridBpm(), phraseStepsPerBeat(value), view, canvasWidth, value.beatsPerBar ?? 4, value.pickupBeats ?? 0, detailPixels);
    const pixelRatio = window.devicePixelRatio || 1;
    const pixelScale = pixelRatio / Math.max(1, Math.round(pixelRatio));
    const pixels = new Map<number, (typeof lines)[number]>();
    const weight = (line: (typeof lines)[number]) => line.beat ? 2 : line.cell ? 1 : 0;
    for (const line of lines) {
      const pixel = Math.round((line.seconds - view.leftSeconds) * scale * pixelScale);
      if (pixel < 0 || pixel >= canvasWidth * pixelScale) continue;
      const previous = pixels.get(pixel);
      if (!previous || weight(line) > weight(previous)) pixels.set(pixel, line);
    }
    gridSnapTimes = Array.from(pixels.values(), line => line.seconds).sort((a, b) => a - b);
    const grids = drumStrip.hidden ? [[grid, gridNodes] as const] : [[grid, gridNodes] as const, [drumGrid, drumGridNodes] as const];
    for (const [layer, elements] of grids) {
      layer.style.setProperty('--melody-grid-stroke', `${1 / pixelScale}px`);
      let index = 0;
      for (const [pixel, line] of pixels) {
        let element = elements[index++];
        if (!element) { element = node('i', 'melody-grid-line'); elements.push(element); layer.append(element); }
        element.classList.toggle('is-beat', line.beat);
        element.classList.toggle('is-cell', line.cell);
        element.style[vertical ? 'top' : 'left'] = `${pixel / pixelScale}px`;
      }
      while (elements.length > index) elements.pop()!.remove();
    }
    const endX = (duration - view.leftSeconds) * scale; afterEnd.hidden = endX > canvasWidth;
    if (vertical) afterEnd.style.top = `${Math.max(0, endX)}px`; else afterEnd.style.left = `${Math.max(0, endX)}px`;
    drumEnd.hidden = afterEnd.hidden; drumEnd.style.top = afterEnd.style.top;
  }
  function paintNotes(onlyNoteId?: string, updateHead = true): void {
    const activeEdit = mix ?? (gesture && 'note' in gesture ? gesture : undefined);
    // During one-note gestures the rest of the score does not need copying.
    const value = onlyNoteId ? body() : displayedBody(); const seen = new Set<string>();
    if (!value || !viewportReady) return;
    const canvasWidth = width(); headWidth = canvasWidth;
    const pitchStart = pitchOffset() - view.rowHeight;
    const pitchEnd = pitchStart + pitchSpan() + 2 * view.rowHeight;
    const rowParts = rhythm ? visibleParts(value) : [];
    const rhythmRows = rhythm ? new Map(rowParts.map((part, index) => [part.id, index])) : undefined;
    const editingFamily = editingFamilyId();
    const selectedTimbreId = editingFamily ? part(editingFamily)?.timbreId : undefined;
    const active = gesture;
    const originalDragRow = rhythm && active?.kind === 'note'
      ? visibleParts(active.base).findIndex(part => part.id === active.partId) : undefined;
    if (indexedBody !== value) { indexedBody = value; noteIndex = createMelodyNoteIndex(value, sectionParts(value)); }
    let candidates = onlyNoteId ? [noteIndex!.byId.get(onlyNoteId)].filter((entry): entry is NonNullable<typeof entry> => !!entry)
      : noteIndex!.visible(view.leftSeconds, view.leftSeconds + 8 / view.zoom);
    if (onlyNoteId && activeEdit && activeEdit.note.id === onlyNoteId) {
      const voice = part('targetPartId' in activeEdit && activeEdit.targetPartId || activeEdit.partId);
      if (voice) candidates = [{ voice, note: { ...activeEdit.note, ...activeEdit.changes }, start: 0, end: 0 }];
    } else if (!onlyNoteId && selection?.noteId && !candidates.some(entry => entry.note.id === selection?.noteId)) {
      const selected = noteIndex!.byId.get(selection.noteId); if (selected) candidates.push(selected);
    }
    for (const { voice, note, start, end } of candidates) {
      // Dragging/mixing changes one note. Leave every unrelated DOM block
      // untouched, including its position, color and selection classes.
      if (note.startBeat >= value!.lengthBeats || note.startBeat + note.durationBeats <= 0 || active?.kind === 'erase' && active.refs.has(note.id)) continue;
      const key = drumKey(voice);
      const lane = key === undefined ? undefined : drumLane(note, key);
      if (lane !== undefined && lane >= visibleDrumLanes) continue;
      const row = lane === undefined ? pitchRow(note.frequencyHz) : -1;
      if (!onlyNoteId && note.id !== selection?.noteId && !(active && 'note' in active && active.note.id === note.id)) {
        if (start > view.leftSeconds + 8 / view.zoom || end < view.leftSeconds) continue;
        // Keep one pitch of overscan; selected/dragged notes remain mounted.
        const top = rhythm ? (rhythmRows!.get(voice.id) ?? 0) * view.rowHeight : row * view.rowHeight;
        if (lane === undefined && (top > pitchEnd || top + view.rowHeight < pitchStart)) continue;
      }
      seen.add(note.id); let block = noteNodes.get(note.id);
      if (!block) {
        block = button('', 'melody-note', () => {}); block.append(node('span', 'melody-note-resize'));
        block.classList.toggle('is-sounding', sounding.has(note.id));
        noteNodes.set(note.id, block);
      }
      const layer = lane === undefined ? notes : drumNotes;
      if (block.parentElement !== layer) layer.append(block);
      const name = partLabel(voice);
      const label = lane !== undefined ? `${name} · 打击 ${lane + 1}` : rhythm ? name : `${name} ${keys[row]?.label ?? ''}`;
      const labelKey = JSON.stringify([note.id, voice.id, label]);
      if (noteLabels.get(block) !== labelKey) {
        block.dataset.noteId = note.id; block.dataset.partId = voice.id; block.setAttribute('aria-label', label);
        noteLabels.set(block, labelKey);
      }
      const rect = lane === undefined ? noteRect(note, voice, value!, canvasWidth, rhythmRows) : drumRect(note, lane, value!, canvasWidth);
      let top = rect.y;
      if (lane === undefined && active?.kind === 'note' && active.note.id === note.id) {
        top = rhythm ? originalDragRow! * view.rowHeight + 7 + active.rawY
          : melodyPitchTop(keys, phrasePitchRow(active.note.frequencyHz, keys), view.rowHeight) + 1 + active.rawY;
        if (active.touchDrag && active.moved) {
          const leftOfFinger = active.last.y - rect.height - 16;
          top = Math.max(pitchOffset(), Math.min(top, leftOfFinger));
        }
      }
      const left = `${vertical ? top : rect.x}px`, y = `${vertical ? rect.x : top}px`;
      const width = `${vertical ? rect.height : rect.width}px`, height = `${vertical ? rect.width : rect.height}px`;
      if (block.style.left !== left) block.style.left = left;
      if (block.style.top !== y) block.style.top = y;
      if (block.style.width !== width) block.style.width = width;
      if (block.style.height !== height) block.style.height = height;
      const color = voice.unassigned ? '#b6bcc4' : toneColor(voice.timbreId);
      const inactive = !!editingFamily && selection?.noteId !== note.id && (rhythm ? selectedTimbreId !== voice.timbreId : editingFamily !== voice.id);
      const drawing = active?.kind === 'create' && active.note.id === note.id;
      const selected = (!vertical || workbenchEnabled()) && (selection?.noteId === note.id || drawing);
      const dragging = !!active && 'note' in active && active.note.id === note.id && (active.dragReadyAt === undefined || active.moved);
      const appearance = `${color}/${!!voice.unassigned}/${inactive}/${selected}/${dragging}/${drawing}`;
      if (noteAppearance.get(block) !== appearance) {
        block.style.setProperty('--tone-color', color); block.classList.toggle('is-unassigned', !!voice.unassigned);
        block.classList.toggle('is-dim', inactive); block.setAttribute('aria-disabled', String(inactive)); block.tabIndex = inactive ? -1 : 0;
        block.classList.toggle('is-selected', selected); block.classList.toggle('is-dragging', dragging); block.classList.toggle('is-drawing', drawing);
        noteAppearance.set(block, appearance);
      }
    }
    if (!onlyNoteId) {
      for (const [id, element] of noteNodes) if (!seen.has(id)) { element.remove(); noteNodes.delete(id); }
      lastSoundingNotes = undefined;
    }
    if (updateHead) positionHead();
  }
  function positionHead(displaySeconds = playheadSeconds): void {
    if (!quick.hidden) paintQuickHint();
    const value = body(); if (!value) return;
    // The resize observer/viewport paints maintain headWidth. The audio-clock
    // animation must not force layout by reading clientWidth every frame.
    const seconds = gesture?.kind === 'head' ? gesture.seconds : playheadSeconds;
    const visualPosition = gesture?.kind === 'head' ? seconds : displaySeconds;
    const scale = melodyScale(view, headWidth, melodyDuration(value));
    const x = (seconds - view.leftSeconds) * scale;
    const hidden = x < 0 || x > headWidth;
    if (head.hidden !== hidden) head.hidden = headHandle.hidden = hidden;
    const coordinate = melodyClamp((visualPosition - view.leftSeconds) * scale, 0, headWidth - 1);
    // Compositor translation avoids relayout on every audio-clock frame.
    const axis = vertical ? 'translateY' : 'translateX';
    if (!hidden) {
      const transform = `${axis}(${coordinate}px)`;
      head.style.transform = transform;
      if (!drumStrip.hidden) drumHead.style.transform = transform;
      headHandle.style.transform = `${axis}(${coordinate - 7}px)`;
    }
    if (!drumStrip.hidden && drumHead.hidden !== hidden) drumHead.hidden = hidden;
    const frame = Math.floor(seconds * 30);
    const updateClock = !playheadPlaying || gesture?.kind === 'head' || frame !== clockFrame || !!headTime && headTime.hidden !== hidden;
    if (updateClock) { clockFrame = frame; headHandle.setAttribute('aria-valuenow', String(seconds)); }
    if (headTime) {
      if (headTime.hidden !== hidden) headTime.hidden = hidden;
      if (!hidden) {
        if (updateClock) {
          const text = formatPlayheadTime(seconds);
          if (headTime.textContent !== text) {
            headTime.textContent = text;
            headHandle.setAttribute('aria-valuetext', text);
          }
        }
        headTime.style.transform = `translateY(${coordinate < 14 ? coordinate + 4 : coordinate - 14}px)`;
      }
    }
  }
  function field(label: string, input: HTMLElement, output?: HTMLElement): void {
    const wrap = node('label', 'melody-field'); const line = node('span', 'melody-field-head', label); if (output) line.append(output); wrap.append(line, input); console.append(wrap);
  }
  function beginMix(): Mix | undefined {
    if (mix) return mix; const selected = picked(); const value = body(); if (!selection || !selected || !value) return;
    return mix = { partId: selection.partId, note: selected, base: value, changes: {} };
  }
  function inputPreview(changes: NoteChanges): void { const active = beginMix(); if (!active) return; active.changes = { ...active.changes, ...changes }; if (!options.readIsPlaying) previewEdit(); paintNotes(active.note.id); }
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
    if (vertical && !workbenchEnabled()) { console.hidden = true; page.classList.remove('has-workbench'); return; }
    page.classList.toggle('has-workbench', !!part());
    console.replaceChildren(); const voice = part(); const note = picked(); console.hidden = !voice; if (!voice) { if (rhythm) paintShelf(); return; }
    console.append(node('strong', 'melody-console-name', vertical ? (note ? '音符控制台' : '音色控制台') : partLabel(voice)));
    if (!note) {
      if (!rhythm) {
        const change = button('更换音色', 'melody-change-timbre', () => { if (!disposed) openLibrary({ kind: 'replace', partId: voice.id }); });
        change.setAttribute('aria-label', '更换总音符的音色'); console.append(change);
      }
      const remove = button(vertical ? '删除此音色' : '移除', 'melody-delete-tone-notes', () => requestRemoveFamily(voice.id)); remove.setAttribute('aria-label', '移除这组音符'); remove.classList.toggle('is-armed', deleteToneArmed?.partId === voice.id);
      console.append(remove);
      if (vertical) for (const property of ['level', 'pan'] as const) {
        const label = property === 'level' ? '音量' : '声像';
        const input = node('input'); input.type = 'range'; input.min = property === 'level' ? '0' : '-1'; input.max = '1'; input.step = '.01'; input.value = String(voice[property] ?? (property === 'level' ? 1 : 0)); input.setAttribute('aria-label', label);
        const output = node('output'); output.textContent = String(Math.round(Number(input.value) * 100));
        input.addEventListener('input', () => { output.textContent = String(Math.round(Number(input.value) * 100)); });
        input.addEventListener('change', () => { if (!safeFlush()) return; try { phrase.setPartMix(voice.id, { [property]: Number(input.value) }); refresh(); notify(true); } catch (error) { report(String(error)); } });
        field(label, input, output);
      }
      if (rhythm) paintShelf(); return;
    }
    slider('音量', 'level', note.level ?? 1, 0); slider('声像', 'pan', note.pan ?? 0, -1);
    if (vertical) { numberField('发音时间 / 秒', phraseHeldSeconds(body()!, note), 'durationBeats'); return; }
    if (!rhythm) { const pitch = node('select'); pitch.setAttribute('aria-label', '音高');
    const exact = keys.some(key => key.frequencyHz === note.frequencyHz);
    if (!exact) { const option = node('option', '', `${Number(note.frequencyHz.toFixed(2))} Hz`); option.value = String(note.frequencyHz); pitch.append(option); }
    for (const key of keys) { const option = node('option', '', key.label); option.value = String(key.frequencyHz); pitch.append(option); } pitch.value = String(note.frequencyHz);
    pitch.addEventListener('change', () => { if (disposed || !selection) return; const hz = Number(pitch.value); if (Number.isFinite(hz)) { inputPreview({ frequencyHz: melodyClamp(hz, MIN_PITCH_HZ, MAX_PITCH_HZ) }); commitMix(); void audition.request(hz); } }); field('音高', pitch); }
    numberField('开始 / 秒', melodySeconds(note.startBeat, body()!), 'startBeat'); numberField('时长 / 秒', phraseHeldSeconds(body()!, note), 'durationBeats'); slider('力度', 'velocity', note.velocity, 0);
    if (rhythm) paintShelf();
  }
  function commitMix(): Error | undefined {
    const active = mix; if (!active || disposed) return; mix = undefined;
    try { if (Object.keys(active.changes).length) { phrase.updateNote(active.partId, active.note.id, active.changes); rememberLength(active.partId, active.note, active.changes); } preview(); refresh(); if (Object.keys(active.changes).length) notify(true); }
    catch (error) { preview(); const failure = error instanceof Error ? error : new Error(String(error)); report(failure.message); refresh(); return failure; }
  }
  function refresh(snapshot?: PhraseView): void {
    if (disposed) return; if (vertical && !workbenchEnabled() && selection?.noteId) selection = undefined; const previous = part(); current = snapshot ?? phrase.read(); const next = body();
    if (toneDeleteDialog && current.draft?.id !== toneDeleteDraftId) toneDeleteDialog.close();
    // The view already contains project-scoped sound names. Re-listing the
    // complete project here re-read/validated the same records on every edit.
    toneNames = new Map(current.availableSounds.map(record => [record.id, record.name] as const));
    drumKeys.clear();
    for (const record of current.availableSounds) {
      const key = unpitchedDrumKey(record.body);
      if (key !== undefined) drumKeys.set(record.id, key);
    }
    defaultDrumLanes = 0;
    if (drumRoll) {
      for (const voice of sectionParts(next)) {
        const key = drumKey(voice);
        if (key === undefined) continue;
        defaultDrumLanes = Math.max(1, defaultDrumLanes);
        if (requestedDrumLanes !== undefined) break;
        for (const note of voice.notes) defaultDrumLanes = Math.max(defaultDrumLanes, drumLane(note, key) + 1);
      }
    }
    if (selection && !part()) {
      const replacement = vertical ? undefined : sectionParts(next).find(value => value.timbreId === previous?.timbreId || value.name === previous?.name);
      selection = replacement ? { partId: replacement.id } : undefined;
    }
    if (selection?.noteId && !picked()) selection = { partId: selection.partId };
    if (entryToneId && !part(entryToneId)) entryToneId = undefined;
    toneColors = buildPhraseToneColors(next?.parts.map(value => value.timbreId) ?? []);
    if (next) view = clampView(view, melodyDuration(next)); audition.sync(current); paintShelf(); syncDrumStrip(); if (rhythm) paintRows(); paintGrid(); paintNotes(); if (!mix) paintConsole();
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
  function moveHead(active: Extract<Gesture, { kind: 'head' }>, event: Pick<PointerEvent, 'clientX' | 'clientY'>): void {
    const delta = vertical ? event.clientY - active.clientFrom.y : event.clientX - active.clientFrom.x;
    active.seconds = melodyTimeAt(view, headWidth, melodyDuration(active.base), active.from.x + delta);
    positionHead();
  }
  function begin(event: PointerEvent, headGesture = false): void {
    const target = event.target as HTMLElement;
    const inDrumStrip = !drumStrip.hidden && drumCanvas.contains(target);
    const touchRight = event.pointerType === 'touch' && event.button === 0 && !headGesture && (canvas.contains(target) || inDrumStrip)
      && !!options.mobileTouch?.readRightButton();
    const button = touchRight ? 2 : event.button;
    if (disposed || library || (button !== 0 && button !== 1 && button !== 2)) return;
    const mode = options.readLessonInput?.() ?? 'edit';
    const block = target.closest<HTMLElement>('.melody-note');
    if (mode === 'locked' || (!touchRight && ((mode !== 'edit' && block) || (mode === 'pan' && button !== 0)))) return;
    if (!headGesture && block?.classList.contains('is-dim') && (!vertical || button !== 2)) { event.preventDefault(); event.stopPropagation(); return; }
    const key = target.closest<HTMLElement>('.melody-key');
    if (key && !headGesture) {
      if (vertical && button === 0 && safeFlush()) {
        event.preventDefault(); keyPan = { id: event.pointerId, capture: key, fromX: event.clientX, offset: pitchOffset(), moved: false };
        key.setPointerCapture?.(event.pointerId);
      }
      return;
    }
    event.preventDefault(); if (!safeFlush()) return; const value = body(); if (!value) return; scroll.focus({ preventScroll: true }); panMoved = false;
    const from = point(event); const base = { id: event.pointerId, capture: headGesture ? ruler : inDrumStrip ? drumCanvas : scroll, base: value, draftId: current.draft!.id, from, last: from, clientFrom: { x: event.clientX, y: event.clientY } };
    if (headGesture) {
      gesture = { ...base, kind: 'head', seconds: playheadSeconds };
      ruler.setPointerCapture?.(event.pointerId);
      moveHead(gesture, event);
      return;
    }
    else if (button === 2) {
      if (vertical) {
        const refs = new Map<string, { partId: string; noteId: string }>();
        const noteId = block?.dataset.noteId, partId = block?.dataset.partId;
        if (noteId && partId) refs.set(noteId, { partId, noteId });
        gesture = { ...base, kind: 'erase', refs, moved: false, touchRight };
        if (mode === 'edit' && !touchRight) document.addEventListener('pointerrawupdate', eraseRaw);
      } else {
        gesture = { ...base, kind: 'erase', refs: new Map(), moved: false };
        if (block) erase(from, from);
        else {
          selection = undefined;
          entryToneId = undefined;
          deleteToneArmed = undefined;
          audition.sync(current);
          options.onLearningAction?.('deselect');
        }
      }
    }
    else if (button === 1 || event.altKey || (!block && !editingFamilyId())) gesture = { ...base, kind: 'pan', lastClient: { x: event.clientX, y: event.clientY } };
    else {
      const voice = block ? part(block.dataset.partId) : rhythm ? visibleParts(value)[Math.floor(from.y / view.rowHeight)] : part(); const note = voice?.notes.find(item => item.id === block?.dataset.noteId);
      const drum = drumKey(voice);
      if (block && voice && note) {
        if (!vertical || workbenchEnabled()) { selection = { partId: voice.id, noteId: note.id }; entryToneId = undefined; audition.sync(current); }
        const bounds = block.getBoundingClientRect();
        const resizing = drum === undefined && (!!target.closest('.melody-note-resize') || (vertical ? event.clientY >= bounds.bottom - Math.min(7, bounds.height * .25) : event.clientX >= bounds.right - Math.min(7, bounds.width * .25)));
        const dragReadyAt = vertical && event.pointerType === 'mouse' ? event.timeStamp + NOTE_DRAG_HOLD_MS : undefined;
        const auditionOnClick = dragReadyAt !== undefined || options.readIsPlaying?.() === true;
        gesture = { ...base, kind: resizing ? 'resize' : 'note', partId: voice.id, note, changes: {}, rawY: 0, moved: false, auditionOnClick,
          drumLane: drum === undefined ? undefined : drumLane(note, drum), touchDrag: vertical && !!options.mobileTouch && event.pointerType === 'touch', dragReadyAt };
        if (!auditionOnClick) void audition.request(note.frequencyHz, phraseHeldSeconds(value, note), note.velocity, undefined, note.level ?? 1, voice.id);
      } else if (voice) {
        if (inDrumStrip !== (drum !== undefined)) return;
        const canvasWidth = width(), duration = melodyDuration(value);
        const scale = melodyScale(view, canvasWidth, duration);
        if (from.x < 0 || from.x >= (duration - view.leftSeconds) * scale) return;
        const limit = value.lengthBeats; const lastStart = lastNoteStart(value);
        if (lastStart === undefined) return;
        const start = noteStartAt(value, melodyTimeAt(view, canvasWidth, duration, from.x), lastStart, scale);
        const frequencyHz = rhythm || inDrumStrip ? RHYTHM_PITCH : keys[melodyPitchAt(keys, from.y, view.rowHeight)]?.frequencyHz;
        if (frequencyHz === undefined) return;
        const lane = inDrumStrip ? drumLaneAt(from.y) : undefined;
        const seconds = inDrumStrip ? DRUM_HIT_SECONDS : noteLengths.get(voice.id) ?? 60 / phraseTempoAtBeat(value, start) / editSteps(value, start);
        const note: PhraseNote = { id: crypto.randomUUID(), startBeat: start, durationBeats: Math.min(limit - start, phraseHeldBeats(value, start, seconds)),
          durationSeconds: seconds, frequencyHz, velocity: .75, ...(lane === undefined ? {} : { drumLane: lane }) };
        gesture = { ...base, kind: 'create', partId: voice.id, note, changes: {}, rawY: 0, moved: false, drumLane: lane };
      }
    }
    if (gesture) gesture.capture.setPointerCapture?.(event.pointerId);
    if (gesture?.kind === 'create') paintNotes(gesture.note.id);
    else { paintShelf(); paintNotes(); paintConsole(); } persistWorkspace();
  }
  function erase(from: Point, to: Point): void {
    const active = gesture; if (!active || active.kind !== 'erase') return;
    if (vertical) {
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      if (!distance) return;
      active.moved ||= Math.hypot(to.x - active.from.x, to.y - active.from.y) > 3;
      const timeRadius = active.moved ? Math.min(8, 3 + Math.max(0, distance - 8) / 8) : 0;
      const pitchRadius = Math.min(timeRadius, view.rowHeight / 3);
      const canvasWidth = width(), pitchTop = pitchOffset(), drumTop = drumOrigin();
      const start = Math.max(0, Math.min(from.x, to.x) - timeRadius);
      const end = Math.min(canvasWidth, Math.max(from.x, to.x) + timeRadius);
      if (end < start) return;
      const scale = melodyScale(view, canvasWidth, melodyDuration(active.base));
      if (indexedBody !== active.base) { indexedBody = active.base; noteIndex = createMelodyNoteIndex(active.base, sectionParts(active.base)); }
      for (const { voice, note } of noteIndex!.visible(view.leftSeconds + Math.max(0, start - (visibleDrumLanes ? MIN_DRUM_HIT_HEIGHT : 0)) / scale, view.leftSeconds + end / scale)) {
        if (active.refs.has(note.id) || note.startBeat >= active.base.lengthBeats) continue;
        const key = drumKey(voice);
        const lane = key === undefined ? undefined : drumLane(note, key);
        if (lane !== undefined && lane >= visibleDrumLanes) continue;
        const top = lane === undefined ? pitchTop : drumTop;
        const bottom = lane === undefined ? drumTop : drumTop + visibleDrumLanes * drumLaneWidth;
        const rect = lane === undefined ? noteRect(note, voice, active.base, canvasWidth) : drumRect(note, lane, active.base, canvasWidth);
        if (lane !== undefined) rect.y += drumTop;
        const x = Math.max(0, rect.x), y = Math.max(top, rect.y);
        const right = Math.min(canvasWidth, rect.x + rect.width), lower = Math.min(bottom, rect.y + rect.height);
        if (right <= x || lower <= y) continue;
        const hitX = Math.max(0, x - timeRadius), hitY = Math.max(top, y - pitchRadius);
        if (playlistSegmentIntersectsRect(from, to, { x: hitX, y: hitY,
          width: Math.min(canvasWidth, right + timeRadius) - hitX, height: Math.min(bottom, lower + pitchRadius) - hitY }))
          active.refs.set(note.id, { partId: voice.id, noteId: note.id });
      }
      return;
    }
    for (const voice of sectionParts(active.base)) for (const note of voice.notes) {
      if (selection && (rhythm ? voice.timbreId !== part(selection.partId)?.timbreId : voice.id !== selection.partId)) continue;
      if (note.startBeat >= active.base.lengthBeats) continue;
      if (playlistSegmentIntersectsRect(from, to, noteRect(note, voice, active.base))) active.refs.set(note.id, { partId: voice.id, noteId: note.id });
    }
    previewEdit(); paintNotes();
  }
  let eraseFrame = 0;
  function erasePath(active: Extract<Gesture, { kind: 'erase' }>, event: PointerEvent): void {
    const before = active.refs.size;
    const samples = event.getCoalescedEvents?.();
    for (const sample of samples?.length ? samples : [event]) {
      if (active.sampleTime !== undefined && sample.timeStamp < active.sampleTime) continue;
      const next = point(sample);
      erase(active.last, next);
      active.last = next;
      if (Number.isFinite(sample.timeStamp)) active.sampleTime = sample.timeStamp;
    }
    if (before !== active.refs.size && !eraseFrame) eraseFrame = requestAnimationFrame(() => {
      eraseFrame = 0;
      paintNotes();
    });
  }
  function eraseRaw(event: Event): void {
    const pointer = event as PointerEvent;
    const active = gesture;
    if (active?.kind !== 'erase' || active.id !== pointer.pointerId) return;
    erasePath(active, pointer);
  }
  function touchSpan() {
    const [first, second] = [...touches!.values()];
    if (!first || !second) return;
    return { x: Math.abs(first.x - second.x), y: Math.abs(first.y - second.y),
      clientX: (first.x + second.x) / 2, clientY: (first.y + second.y) / 2 };
  }
  function startTouch(event: PointerEvent): boolean {
    if (!touches || event.pointerType !== 'touch' || disposed || library) return false;
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (touches.size === 1) return false;
    event.preventDefault();
    if (touches.size === 2) {
      finish(false);
      finishKeyPan(true);
      for (const id of touches.keys()) scroll.setPointerCapture?.(id);
      pinch = touchSpan();
    }
    return true;
  }
  function endTouch(event: PointerEvent): void {
    if (!touches?.has(event.pointerId)) return;
    if (pinchFrame) {
      cancelAnimationFrame(pinchFrame); pinchFrame = 0;
      if (event.type === 'pointerup') paintPinch();
    }
    touches.delete(event.pointerId);
    if (pinch) pinch = touchSpan();
  }
  function paintPinch(): void {
    pinchFrame = 0;
    const mode = options.readLessonInput?.();
    if (!pinch || disposed || (mode !== 'zoom' && mode !== 'edit')) return;
    const span = touchSpan(), value = body();
    if (!span || !value) return;
    if (!pinch.axis) {
      const dx = Math.abs(span.x - pinch.x), dy = Math.abs(span.y - pinch.y);
      if (Math.max(dx, dy) < 8) return;
      pinch.axis = dx > 1.6 * dy ? 'x' : dy > 1.6 * dx ? 'y' : 'both';
    }
    const previous = view;
    if (pinch.axis !== 'x' && span.y !== pinch.y) {
      view = zoomMelody(view, width(), melodyDuration(value), point(span).x, Math.max(24, span.y) / Math.max(24, pinch.y));
    }
    if (pinch.axis !== 'y' && span.x !== pinch.x) {
      zoomPitchAt(span.clientX, Math.max(24, span.x) / Math.max(24, pinch.x));
    }
    pinch.x = span.x; pinch.y = span.y;
    if (view.zoom === previous.zoom && view.rowHeight === previous.rowHeight) return;
    manualNavigation(); paintViewport();
    if (view.zoom !== previous.zoom) options.onLearningAction?.('zoom-y');
    if (view.rowHeight !== previous.rowHeight) options.onLearningAction?.('zoom-x');
  }
  function move(event: PointerEvent): void {
    if (touches?.has(event.pointerId)) {
      touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (touches.size >= 2) {
        event.preventDefault();
        if (!pinchFrame) pinchFrame = requestAnimationFrame(paintPinch);
        return;
      }
    }
    if (keyPan?.id === event.pointerId) {
      event.preventDefault(); const delta = event.clientX - keyPan.fromX;
      if (Math.abs(delta) > 3) keyPan.moved = true;
      if (keyPan.moved) { setTop(keyPan.offset - delta); scheduleViewport(); }
      return;
    }
    if (quickDrag?.id === event.pointerId) { event.preventDefault(); moveQuickScroll(event.clientY); return; }
    const active = gesture; if (disposed || !active || active.id !== event.pointerId) return; event.preventDefault();
    if (active.kind === 'head') { moveHead(active, event); return; }
    if (vertical && active.kind === 'erase') {
      if (!active.touchRight && options.readLessonInput && options.readLessonInput() !== 'edit') {
        active.moved ||= Math.hypot(event.clientX - active.clientFrom.x, event.clientY - active.clientFrom.y) > 4;
        return;
      }
      erasePath(active, event);
      if (!active.touchRight && typeof event.buttons === 'number' && !(event.buttons & 2)) finish(true);
      return;
    }
    const now = point(event);
    if (active.kind === 'create') {
      if (active.drumLane !== undefined) return;
      const mode = options.readLessonInput?.();
      if (mode && mode !== 'edit' && mode !== 'draw') return;
      const scale = melodyScale(view, width(), melodyDuration(active.base));
      const extent = drawExtent(active.base, active.note.startBeat);
      const seconds = melodyClamp(view.leftSeconds + now.x / scale - melodySeconds(active.note.startBeat, active.base), extent.cell, extent.maximum);
      active.moved = active.moved || (vertical ? Math.abs(event.clientY - active.clientFrom.y) : Math.abs(event.clientX - active.clientFrom.x)) > 4;
      active.changes = { durationSeconds: seconds, durationBeats: melodyClamp(phraseHeldBeats(active.base, active.note.startBeat, seconds), MIN_BEATS, active.base.lengthBeats - active.note.startBeat) };
      paintNotes(active.note.id);
    }
    else if (active.kind === 'pan') {
      const client = { x: event.clientX, y: event.clientY };
      const beforeSeconds = view.leftSeconds, beforeOffset = pitchOffset();
      view = clampView({ ...view, leftSeconds: view.leftSeconds + (vertical ? active.lastClient.y - client.y : active.lastClient.x - client.x) / melodyScale(view, width(), melodyDuration(active.base)) }, melodyDuration(active.base));
      setTop(pitchOffset() + (vertical ? active.lastClient.x - client.x : active.lastClient.y - client.y)); active.lastClient = client;
      panMoved ||= beforeSeconds !== view.leftSeconds || beforeOffset !== pitchOffset();
      manualNavigation(); scheduleViewport();
    }
    else if (active.kind === 'erase') { erase(active.last, now); active.last = now; }
    else {
      if (active.dragReadyAt !== undefined && event.timeStamp < active.dragReadyAt) return;
      const lane = active.drumLane === undefined ? undefined : drumLaneAt(now.y);
      const timeMoved = Math.abs(now.x - active.from.x) > 1;
      const positionMoved = lane === undefined ? Math.abs(now.y - active.from.y) > 1 : lane !== active.drumLane;
      active.moved ||= timeMoved || positionMoved;
      if (active.dragReadyAt !== undefined && !active.moved) return;
      const scale = melodyScale(view, width(), melodyDuration(active.base)); const delta = (now.x - active.from.x) / scale; const limit = active.base.lengthBeats;
      if (active.kind === 'resize') {
        const seconds = melodyClamp(phraseHeldSeconds(active.base, active.note) + delta, MIN_NOTE_SECONDS, 96);
        active.changes = { durationSeconds: seconds, durationBeats: melodyClamp(phraseHeldBeats(active.base, active.note.startBeat, seconds), MIN_BEATS, limit - active.note.startBeat) };
      }
      else if (lane !== undefined) {
        const startBeat = timeMoved
          ? noteStartAt(active.base, melodySeconds(active.note.startBeat, active.base) + delta, lastNoteStart(active.base) ?? active.note.startBeat, scale)
          : active.note.startBeat;
        const seconds = phraseHeldSeconds(active.base, active.note);
        active.changes = {
          ...(startBeat === active.note.startBeat ? {} : { startBeat, durationSeconds: seconds, durationBeats: melodyClamp(phraseHeldBeats(active.base, startBeat, seconds), MIN_BEATS, limit - startBeat) }),
          ...(lane === active.drumLane ? {} : { drumLane: lane }),
        };
      } else {
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
        active.changes = !rhythm && offset && pitch ? { frequencyHz: pitch.frequencyHz } : {};
        if (timeMoved) {
          const startBeat = noteStartAt(active.base, melodySeconds(active.note.startBeat, active.base) + delta, lastNoteStart(active.base) ?? active.note.startBeat, scale);
          if (Math.abs(startBeat - active.note.startBeat) > 1e-10) {
            const seconds = phraseHeldSeconds(active.base, active.note);
            active.changes.startBeat = startBeat;
            active.changes.durationSeconds = seconds;
            active.changes.durationBeats = melodyClamp(phraseHeldBeats(active.base, startBeat, seconds), MIN_BEATS, limit - startBeat);
          }
        }
      }
      active.last = now;
      if (!options.readIsPlaying) previewEdit();
      paintNotes(active.note.id);
    }
  }
  function finish(commit: boolean, releasedAt?: number): Error | undefined {
    const active = gesture; gesture = undefined; if (!active) return;
    if (vertical && active.kind === 'erase') {
      document.removeEventListener('pointerrawupdate', eraseRaw);
      cancelAnimationFrame(eraseFrame); eraseFrame = 0;
    }
    if (active.capture.hasPointerCapture?.(active.id)) active.capture.releasePointerCapture(active.id);
    if (active.kind === 'head') {
      if (commit && current.draft?.id === active.draftId) {
        playheadSeconds = active.seconds;
        void options.onSeek(playheadSeconds);
        persistWorkspace();
      }
      positionHead();
      return;
    }
    if (active.kind === 'pan') { reportViewport(); if (commit && panMoved) options.onLearningAction?.('pan'); return; }
    if (active.kind === 'create' && !commit) { paintNotes(); return; }
    if ((active.kind === 'note' || active.kind === 'resize') && !active.moved && (active.dragReadyAt !== undefined || options.readIsPlaying)) {
      paintNotes(active.note.id);
      const withinClickWindow = active.dragReadyAt === undefined || (releasedAt !== undefined && releasedAt < active.dragReadyAt);
      if (commit && active.auditionOnClick && withinClickWindow && current.draft?.id === active.draftId) {
        const note = active.note;
        void audition.request(note.frequencyHz, phraseHeldSeconds(active.base, note), note.velocity, undefined, note.level ?? 1, active.partId);
      }
      return;
    }
    let created: PhraseNote | undefined;
    let learningAction: LearningAction | undefined;
    let changed = false; let failure: Error | undefined;
    try {
      if (commit && current.draft?.id === active.draftId) {
        if (active.kind === 'erase') {
          if (active.refs.size) {
            phrase.removeNotes([...active.refs.values()]); changed = true;
            learningAction = 'delete-note';
            if (selection?.noteId && active.refs.has(selection.noteId)) selection = { partId: selection.partId };
          } else if (vertical && !active.moved) {
            selection = undefined; entryToneId = undefined; deleteToneArmed = undefined;
            options.onLearningAction?.('deselect');
          }
        }
        else if (active.kind === 'create') {
          const extent = drawExtent(active.base, active.note.startBeat);
          const held = active.changes.durationSeconds ?? active.note.durationSeconds ?? extent.cell;
          const seconds = active.moved ? melodyClamp(Math.round(held / extent.cell) * extent.cell, extent.cell, extent.maximum)
            : active.note.durationSeconds ?? extent.cell;
          const { id: _id, ...note } = { ...active.note, durationSeconds: seconds, durationBeats: Math.min(active.base.lengthBeats - active.note.startBeat, phraseHeldBeats(active.base, active.note.startBeat, seconds)) };
          const id = phrase.addNote(active.partId, note);
          if (!vertical) {
            selection = { partId: active.partId, noteId: id };
            entryToneId = rhythm ? undefined : active.partId;
          }
          created = { ...note, id };
          changed = true;
          learningAction = 'draw-note';
          if (active.moved) rememberLength(active.partId, active.note, { durationSeconds: seconds });
        } else if ((active.kind === 'note' || active.kind === 'resize') && active.moved) {
          const changes = { ...active.changes };
          if (active.drumLane !== undefined && !Object.keys(changes).length) { preview(); paintNotes(active.note.id); return; }
          if (changes.startBeat !== undefined) { const lastStart = lastNoteStart(active.base); changes.startBeat = lastStart === undefined ? active.note.startBeat : melodyClamp(changes.startBeat, 0, lastStart); changes.durationBeats = melodyClamp(phraseHeldBeats(active.base, changes.startBeat, changes.durationSeconds!), MIN_BEATS, active.base.lengthBeats - changes.startBeat); }
          const targetPartId = rhythm ? active.targetPartId ?? active.partId : active.partId;
          if (targetPartId !== active.partId) {
            phrase.moveNote(active.partId, active.note.id, targetPartId, changes); selection = { partId: targetPartId, noteId: active.note.id };
          } else if (Object.keys(changes).length) phrase.updateNote(active.partId, active.note.id, changes);
          if (active.kind === 'resize') {
            rememberLength(active.partId, active.note, changes);
            if (options.onLearningAction && changes.durationSeconds !== undefined
              && Math.abs(changes.durationSeconds - phraseHeldSeconds(active.base, active.note)) > 1e-10) learningAction = 'resize-note';
          } else if (targetPartId !== active.partId || changes.frequencyHz !== undefined || changes.drumLane !== undefined
            || (changes.startBeat !== undefined && Math.abs(changes.startBeat - active.note.startBeat) > 1e-10)) learningAction = 'move-note';
          changed = targetPartId !== active.partId || Object.keys(changes).length > 0;
        }
      }
    } catch (error) { failure = error instanceof Error ? error : new Error(String(error)); report(failure.message); }
    preview(); refresh(); if (changed) notify(true);
    if (learningAction) options.onLearningAction?.(learningAction);
    if (created && !failure) void audition.request(created.frequencyHz, phraseHeldSeconds(active.base, created), created.velocity, undefined, created.level ?? 1);
    return failure;
  }
  function flush(persist = true): void { if (disposed) return; tempoRolls?.flush(); const failure = finish(true) ?? commitMix(); if (persist) persistWorkspace(true); if (failure) throw failure; }
  function safeFlush(): boolean { try { flush(false); return true; } catch { return false; } }
  function zoomPitchAt(client: number, factor: number): void {
    const bounds = scroll.getBoundingClientRect();
    const y = client - (vertical ? bounds.left : bounds.top);
    const row = (pitchOffset() + y) / view.rowHeight;
    const rowHeight = melodyClamp(view.rowHeight * factor, rhythm ? 48 : 12, rhythm ? 120 : 44);
    if (rowHeight === view.rowHeight) return;
    view = { ...view, rowHeight };
    paintRows(); setTop(row * rowHeight - y);
  }
  function wheel(event: WheelEvent): void {
    if (disposed || !body() || library || root.querySelector('dialog[open]') || document.querySelector('dialog[open]')) return;
    event.preventDefault();
    const mode = options.readLessonInput?.() ?? 'edit';
    if (mode === 'locked' || ((mode === 'pan' || mode === 'draw') && (event.ctrlKey || event.metaKey)) || (mode !== 'edit' && event.altKey) || !safeFlush()) return;
    const value = body(); if (!value) return;
    const previousView = { ...view }, previousOffset = pitchOffset(), previousDrumWidth = drumLaneWidth;
    const target = event.target as HTMLElement | null;
    const hoveredNote = target?.closest?.<HTMLElement>('.melody-note');
    const hoveredPartId = hoveredNote?.dataset.partId;
    const partId = vertical ? (hoveredNote?.classList.contains('is-dim') ? undefined : hoveredPartId) : selection?.partId;
    const adjustsDuration = vertical ? event.altKey
      : !event.altKey && hoveredNote?.dataset.noteId === selection?.noteId && hoveredPartId === partId;
    const note = adjustsDuration && partId
      ? (vertical ? part(partId)?.notes.find(note => note.id === hoveredNote?.dataset.noteId) : picked()) : undefined;
    if (note && partId && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.deltaY !== 0) {
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
      try { phrase.updateNote(partId, note.id, changes); rememberLength(partId, note, changes); refresh(); notify(true); options.onLearningAction?.('resize-note'); }
      catch (error) { report(error instanceof Error ? error.message : String(error)); }
      return;
    }
    const control = event.ctrlKey || event.metaKey;
    const pitchZoom = control && (vertical ? event.shiftKey : !event.shiftKey);
    const timeZoom = control && (vertical ? !event.shiftKey : event.shiftKey);
    if (pitchZoom && visibleDrumLanes && target && drumStrip.contains(target)) {
      const limit = Math.max(drumLaneWidth, Math.min(MAX_DRUM_LANE_WIDTH, Math.floor(availableDrumWidth() / visibleDrumLanes)));
      drumLaneWidth = melodyClamp(drumLaneWidth * Math.exp(-event.deltaY * .002), MIN_DRUM_LANE_WIDTH, limit);
      syncDrumStrip();
    } else if (pitchZoom) zoomPitchAt(vertical ? event.clientX : event.clientY, Math.exp(-event.deltaY * .002));
    else if (timeZoom) { const rowHeight = view.rowHeight; view = zoomMelody(view, width(), melodyDuration(value), point(event).x, Math.exp(-event.deltaY * .002)); if (rhythm) view.rowHeight = rowHeight; }
    else if (vertical) {
      setTop(pitchOffset() + (event.shiftKey ? event.deltaX || event.deltaY : event.deltaX || 0));
      if (!event.shiftKey) view = clampView({ ...view, leftSeconds: view.leftSeconds + event.deltaY / melodyScale(view, width(), melodyDuration(value)) }, melodyDuration(value));
    }
    else if (!event.shiftKey && !event.deltaX) setTop(pitchOffset() + event.deltaY);
    else view = clampView({ ...view, leftSeconds: view.leftSeconds + (event.deltaX || event.deltaY) / melodyScale(view, width(), melodyDuration(value)) }, melodyDuration(value));
    manualNavigation(); scheduleViewport();
    if (view.zoom !== previousView.zoom || view.rowHeight !== previousView.rowHeight || view.leftSeconds !== previousView.leftSeconds || pitchOffset() !== previousOffset || drumLaneWidth !== previousDrumWidth)
      options.onLearningAction?.(pitchZoom ? vertical ? 'zoom-x' : 'zoom-y' : timeZoom ? vertical ? 'zoom-y' : 'zoom-x'
        : event.shiftKey || (event.deltaX && !event.deltaY) ? 'scroll-x' : 'scroll-y');
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
    const drum = drumKey(voice);
    if (key === 'z' || key === 'x') {
      entryOctave = melodyClamp(entryOctave + (key === 'z' ? -1 : 1), MIN_PITCH_OCTAVE, MAX_PITCH_OCTAVE); paintEntryRange();
      const active = [...keyboard.querySelectorAll<HTMLButtonElement>('.melody-key')].filter(key => key.classList.contains('is-entry-range'));
      if (active.length) {
        const start = vertical ? 'left' : 'top', size = vertical ? 'width' : 'height';
        const centre = (Number.parseFloat(active[0]!.style[start]) + Number.parseFloat(active.at(-1)!.style[start]) + Number.parseFloat(active.at(-1)!.style[size])) / 2;
        setTop(centre - pitchSpan() / 2); reportViewport();
      }
      return true;
    }
    const pitch = rest ? undefined : drum === undefined ? melodyEntryPitch(key, entryOctave) : RHYTHM_PITCH;
    if (!rest && pitch === undefined) { report('这个音符超出当前支持的音高范围。'); return true; }
    const beforeSeconds = options.readPlayhead?.() ?? playheadSeconds;
    const steps = phraseStepsPerBeat(value); const step = nextMelodyEntryStep(beforeSeconds, value.tempoBpm, value.lengthBeats, steps);
    if (!step || !rest && !step.canWrite) { report('已到音乐结尾。'); return true; }
    const heldSeconds = drum === undefined ? noteLengths.get(voice.id) ?? step.durationSeconds : DRUM_HIT_SECONDS;
    if (!rest) {
      let noteId: string;
      try { noteId = phrase.addNote(voice.id, { startBeat: step.startBeat, durationBeats: Math.min(value.lengthBeats - step.startBeat, melodyBeats(heldSeconds, value.tempoBpm)), durationSeconds: heldSeconds, frequencyHz: pitch!, velocity: .75 }); }
      catch (error) { report(error instanceof Error ? error.message : String(error)); return true; }
      recordPerformanceEntry(phrase, noteId, melodyBeats(beforeSeconds, value.tempoBpm), step.startBeat);
      if (!vertical) selection = { partId: voice.id, noteId };
      refresh(); notify(true);
    }
    playheadSeconds = step.seconds; const ready = options.onSeek(step.seconds);
    if (!rest) void audition.request(pitch!, heldSeconds, .75, ready);
    revealEntry(step.seconds, drum === undefined ? pitch : undefined);
    return true;
  }
  function keydown(event: KeyboardEvent): void {
    if (root.closest('[inert]') || options.readLessonInput && options.readLessonInput() !== 'edit') return;
    const rangeUndo = event.key === 'Backspace' && event.target instanceof HTMLInputElement && event.target.type === 'range';
    if (disposed || library || event.isComposing || event.keyCode === 229 || isEditable(event.target) && !rangeUndo || root.querySelector('dialog[open]') || document.querySelector('dialog[open]')) return;
    const key = event.key.toLowerCase();
    if (key !== 'delete') deleteToneArmed = undefined;
    if (key === 'backspace' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      event.preventDefault(); if (event.repeat || !safeFlush() || !current.canUndo) return;
      try { historyMove(false); options.onLearningAction?.('undo'); } catch (error) { report(error instanceof Error ? error.message : String(error)); }
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
      if (key === 'z' || key === 'y') { event.preventDefault(); if (!safeFlush()) return; try { const redo = key === 'y' || event.shiftKey; if (redo ? current.canRedo : current.canUndo) { historyMove(redo); if (!redo) options.onLearningAction?.('undo'); } } catch (error) { report(String(error)); } } return;
    }
    if (vertical && key === 'delete') {
      if (event.shiftKey && !event.altKey && selection && !event.repeat) {
        event.preventDefault();
        requestRemoveFamily(selection.partId);
      }
      return;
    }
    if (key === 'delete' && selection && !selection.noteId && !event.altKey && !event.shiftKey) {
      event.preventDefault(); if (event.repeat) return;
      const now = Date.now();
      if (deleteToneArmed?.partId === selection.partId && now - deleteToneArmed.at <= 500) { deleteToneArmed = undefined; deleteToneNotes(); }
      else { deleteToneArmed = { partId: selection.partId, at: now }; paintConsole(); }
      return;
    }
    if (key === 'delete' && selection?.noteId) { event.preventDefault(); if (!safeFlush() || !selection?.noteId) return; const selected = selection; try { phrase.removeNote(selected.partId, selected.noteId!); if (!vertical) selection = { partId: selected.partId }; refresh(); notify(true); options.onLearningAction?.('delete-note'); } catch (error) { report(String(error)); } }
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
  const up = (event: PointerEvent) => {
    endTouch(event);
    if (keyPan?.id === event.pointerId) finishKeyPan();
    if (quickDrag?.id === event.pointerId) finishQuickScroll();
    if (gesture?.id === event.pointerId) {
      if (vertical && gesture.kind === 'erase' && (event.button === 2 || gesture.touchRight)) {
        if (gesture.touchRight || !options.readLessonInput || options.readLessonInput() === 'edit') erase(gesture.last, point(event));
        else gesture.moved ||= Math.hypot(event.clientX - gesture.clientFrom.x, event.clientY - gesture.clientFrom.y) > 4;
      }
      finish(true, event.timeStamp);
    }
    if (mix?.pointerId === event.pointerId) commitMix();
  };
  const cancel = (event: PointerEvent) => { endTouch(event); if (keyPan?.id === event.pointerId) finishKeyPan(true); if (quickDrag?.id === event.pointerId) finishQuickScroll(); if (gesture?.id === event.pointerId) finish(false); if (mix?.pointerId === event.pointerId) { mix = undefined; preview(); refresh(); } };
  const resize = () => { if (!disposed) { syncDrumStrip(); setTop(pitchOffset()); scheduleViewport(); } };
  scroll.addEventListener('pointerdown', event => { if (!startTouch(event)) begin(event, event.target === head && event.button === 0); });
  drumCanvas.addEventListener('pointerdown', event => { if (!startTouch(event)) begin(event, event.target === drumHead && event.button === 0); });
  drumCanvas.addEventListener('contextmenu', event => event.preventDefault());
  drumStrip.addEventListener('wheel', wheel, { passive: false });
  drumDivider.addEventListener('pointerdown', event => {
    if (disposed || drumDivider.hidden || event.button !== 0 || !safeFlush()) return;
    event.preventDefault();
    drumDivider.focus({ preventScroll: true });
    drumDividerDrag = { id: event.pointerId, fromX: event.clientX, count: visibleDrumLanes };
    drumDivider.setPointerCapture(event.pointerId);
  });
  drumDivider.addEventListener('pointermove', event => {
    const drag = drumDividerDrag;
    if (drag?.id === event.pointerId) {
      const delta = melodyClamp(Math.round((drag.fromX - event.clientX) / drumLaneWidth), -1, 1);
      setDrumLanes(drag.count + delta);
    }
  });
  const finishDrumDivider = (event: PointerEvent) => {
    if (drumDividerDrag?.id !== event.pointerId) return;
    drumDividerDrag = undefined;
    persistWorkspace(true);
  };
  drumDivider.addEventListener('pointerup', finishDrumDivider);
  drumDivider.addEventListener('lostpointercapture', finishDrumDivider);
  drumDivider.addEventListener('keydown', event => {
    if (drumDivider.hidden || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault(); event.stopPropagation();
    if (safeFlush()) setDrumLanes(visibleDrumLanes + (event.key === 'ArrowLeft' ? 1 : -1));
  });
  ruler.addEventListener('pointerdown', event => { if (event.button === 0) begin(event, true); });
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
  const scrolled = () => { if (!disposed) { setTop(pitchOffset()); scheduleViewport(); } };
  scroll.addEventListener('scroll', scrolled);
  const lost = (event: PointerEvent) => { if (keyPan?.id === event.pointerId) finishKeyPan(true); if (gesture?.id === event.pointerId) finish(false); };
  keyboard.addEventListener('lostpointercapture', lost);
  scroll.addEventListener('lostpointercapture', lost); ruler.addEventListener('lostpointercapture', lost); drumCanvas.addEventListener('lostpointercapture', lost);
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
  const frequencies = sectionParts().flatMap(value => value.notes.map(note => note.frequencyHz));
  let lowFrequency = Infinity, highFrequency = 0; for (const frequency of frequencies) { lowFrequency = Math.min(lowFrequency, frequency); highFrequency = Math.max(highFrequency, frequency); }
  const centre = picked()?.frequencyHz ?? (frequencies.length ? vertical ? Math.sqrt(lowFrequency * highFrequency) : frequencies[Math.floor(frequencies.length / 2)]! : 261.625565);
  setTop(restorePitchOffset ?? (rhythm ? 0 : melodyPitchTop(keys, phrasePitchRow(centre, keys), view.rowHeight) - Math.max(view.rowHeight, pitchSpan()) / 2));
  if (rhythm) paintShelf(); viewportReady = true; paintNotes(); reportViewport();
  return { refresh, flush, isStepInputActive, readViewport, previewTempoRate, frameNotes(reserveEndSpace = false) {
    const value = body(); if (!value) return;
    const trailingSeconds = reserveEndSpace ? (value.beatsPerBar ?? 4) * 60 / phraseTempoAtBeat(value, value.lengthBeats) : 0;
    view = { ...view, leftSeconds: 0, zoom: 8 / Math.max(2, melodyDuration(value) + trailingSeconds + .3), rowHeight: 28 };
    const pitches = sectionParts().flatMap(part => part.notes.map(note => phrasePitchRow(note.frequencyHz, keys)));
    if (pitches.length) {
      const low = Math.min(...pitches), high = Math.max(...pitches);
      view.rowHeight = melodyClamp((pitchSpan() - 36) / (high - low + 5), 12, 32);
      paintRows(); setTop(Math.max(0, (low - 2) * view.rowHeight));
    }
    paintViewport(); reportViewport();
  }, setPlayhead(seconds, playing = false, displaySeconds = seconds) { if (!disposed) {
    const playbackChanged = playheadPlaying !== playing;
    const positionChanged = playheadSeconds !== seconds;
    playheadPlaying = playing; playheadSeconds = seconds;
    if (playbackChanged) page.classList.toggle('is-playing', playing);
    if (!playing && (playbackChanged || positionChanged)) persistWorkspace();
    if (headInView()) followResumeAt = 0;
    if (vertical && playing && !gesture && !mix && !quickDrag && !keyPan && !drumDividerDrag && !tempoRolls?.isDragging() && body() && performance.now() >= followResumeAt) {
      const span = 8 / view.zoom, duration = melodyDuration(body()!);
      const target = melodyFollowTarget(seconds, view.leftSeconds, span, duration, span * 2 / Math.max(1, headWidth));
      // Following may leave blank space after the ending so the last page also
      // puts the head at the top. Manual navigation retains its normal bounds.
      if (target !== undefined) { view = { ...view, leftSeconds: target }; browseLastSeconds = target; paintViewport(false, false); }
    }
    if (gesture?.kind !== 'head') positionHead(displaySeconds);
    const onsets = playing && noteIndex && (body()?.masterLevel ?? 1) > 0
      ? noteIndex.startingBetween(seconds - .13, seconds) : NO_SOUNDING_NOTES;
    if (onsets === lastSoundingNotes) return;
    lastSoundingNotes = onsets;
    const nextSounding = new Set<string>();
    const nextKeys = new Map<number, string>();
    for (const { voice, note } of onsets) {
      if (voice.unassigned || (playbackFamilyId && voice.id !== playbackFamilyId)
        || note.velocity <= 0 || (note.level ?? 1) <= 0) continue;
      if (noteNodes.has(note.id)) nextSounding.add(note.id);
      if (vertical && !rhythm) {
        const drum = drumKey(voice);
        const key = drum === undefined ? pitchRow(note.frequencyHz) : keys.length + drumLane(note, drum);
        nextKeys.set(key, toneColor(voice.timbreId));
      }
    }
    for (const index of soundingKeys.keys()) {
      if (!nextKeys.has(index)) (keyNodes[index] ?? drumKeyNodes[index - keys.length])?.classList.remove('is-sounding');
    }
    for (const [index, color] of nextKeys) {
      const key = keyNodes[index] ?? drumKeyNodes[index - keys.length];
      if (key && soundingKeys.get(index) !== color) {
        key.style.setProperty('--key-flash-color', color);
        key.classList.add('is-sounding');
      }
    }
    soundingKeys = nextKeys;
    for (const id of sounding) if (!nextSounding.has(id)) { noteNodes.get(id)?.classList.remove('is-sounding'); sounding.delete(id); }
    for (const id of nextSounding) if (!sounding.has(id)) { noteNodes.get(id)?.classList.add('is-sounding'); sounding.add(id); }
  } }, dispose() {
    if (disposed) return; endGroupDrag(); finishKeyPan(true); finish(false); mix = undefined; persistWorkspace(true); preview(); audition.cancel(); tempoRolls?.dispose(); disposed = true; library?.close(); observer?.disconnect(); removeConsoleWheel(); window.clearTimeout(noticeTimer); window.clearTimeout(workspaceTimer);
    window.clearTimeout(quickHideTimer); quickDrag = undefined;
    cancelAnimationFrame(viewportFrame); viewportFrame = 0;
    cancelAnimationFrame(pinchFrame); pinchFrame = 0; touches?.clear(); pinch = undefined;
    scroll.removeEventListener('scroll', scrolled);
    document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', cancel); document.removeEventListener('keydown', keydown); window.removeEventListener('resize', resize);
  } };
}
