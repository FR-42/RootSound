import type { KeyboardPitch, PhraseBody, PhraseEditorPort, PhraseGainPoint, PhraseNote, PhrasePart, PhraseView } from '../../contracts/phrase.ts';
import type { CurveKind } from '../../contracts/gain-curve.ts';
import { phraseStepsPerBeat } from '../../contracts/phrase.ts';
import { phraseTempoAtBeat, phraseHeldSeconds, phraseHeldBeats, phraseStepsAtBeat, phraseBarBeats, phraseMeterBeatLength } from '../../contracts/phrase-time.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import type { MusicWorkspaceStatePort } from '../../contracts/workspace.ts';
import type { LearningAction } from '../../contracts/guidance.ts';
import { createPhraseAudition } from './phrase-audition.ts';
import { defaultInstrumentInfo, DRUM_REFERENCE_FREQUENCY_HZ as RHYTHM_PITCH, instrumentCategories, studioLibraryGroups, unpitchedDrumKey } from '../timbre/instrument-catalog.ts';
import { attachConsoleHorizontalWheel } from './console-scroll.ts';
import { phrasePitchRow } from './phrase-viewport.ts';
import type { PhraseEditorViewport } from './phrase-editor-viewport.ts';
import { buildPhraseToneColors, toneColor as defaultToneColor, windowsToneColor } from './phrase-overview-notes.ts';
import { playlistSegmentIntersectsRect } from './playlist-geometry.ts';
import { melodyEntryKey, melodyEntryPitch, nextMelodyEntryStep } from './melody-key-entry.ts';
import { MAX_PHRASE_BEATS, MIN_NOTE_BEATS as MIN_BEATS, MIN_NOTE_SECONDS } from '../../contracts/phrase-limits.ts';
import { MIN_PITCH_HZ, MAX_PITCH_HZ, MIN_PITCH_OCTAVE, MAX_PITCH_OCTAVE } from '../../contracts/music-limits.ts';
import { recordPerformanceEntry, undoPhraseEdit, redoPhraseEdit } from './phrase-performance-history.ts';
import { formatPlayheadTime, melodyBeats, melodyClamp, melodyDuration, melodyDetailGrid, melodyDetailSteps, melodyNoteRect, melodyScale, melodySeconds,
  melodyPitchTop, melodyPitchHeight, melodyPitchAt,
  melodyTimeAt, clampMelodyView, initialMelodyView, zoomMelody, melodyScoreGrid, melodyScoreGridDepth, type MelodyView } from './melody-geometry.ts';
import './melody-workspace.css';
import './pointer-ux.css';
import { createWorkspacePanel, type WorkspacePanel } from './workspace-panel.ts';
import { EDGE_COOLDOWN_MS, attachEdgeGesture, listenDesktopPointer, pointerPanVector, type PointerPanMode } from './pointer-gestures.ts';
import { createMelodyNoteIndex, melodyFollowTarget, type IndexedMelodyNote } from './melody-note-index.ts';
import { mountMelodyTempoRolls } from './melody-tempo-rolls.ts';
import { mountMelodyGainCurve } from './melody-gain-curve.ts';
import { createInstrumentIcon } from './instrument-icon.ts';
import { libraryIcon } from './library-icon.ts';
import { flyToneCard, mountToneHand, mountToneDeck, paintCardBacks, setMiniToneDrag,
  showToneCardFace, slideToneCards, stopToneCardFlights, takeToneCardPicture, toneCardPositions } from './melody-tone-cards.ts';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag); element.className = className; element.textContent = text; return element;
}
function button(text: string, className: string, callback: (event: MouseEvent) => void): HTMLButtonElement {
  const element = node('button', className, text); element.type = 'button'; element.addEventListener('click', callback); return element;
}
function addInstrumentIcon(button: HTMLButtonElement, key: string | undefined): void {
  const icon = createInstrumentIcon(key);
  if (!icon) return;
  button.classList.add('has-instrument-icon');
  button.append(icon);
}
type NoteChanges = Partial<Omit<PhraseNote, 'id'>>;
type Point = { x: number; y: number };
type RollPaintRegion = {
  start: number; end: number; origin: number; lowPitch: number; highPitch: number;
  zoom: number; rowHeight: number; duration: number;
};
type Selection = { partId: string; noteId?: string };
type LibraryIntent = { kind: 'create' } | { kind: 'replace'; partId: string };
type Gesture = { id: number; capture: HTMLElement; base: PhraseBody; draftId: string; from: Point; last: Point; clientFrom: Point; desktopClick?: boolean; button: number } & (
  { kind: 'head'; seconds: number; fromRuler: boolean; moved: boolean } | { kind: 'pan'; lastClient: Point } |
  { kind: 'erase'; refs: Map<string, { partId: string; noteId: string }>; moved: boolean; familyId?: string; sampleTime?: number; touchRight?: boolean } |
  { kind: 'note' | 'create' | 'resize'; partId: string; targetPartId?: string; note: PhraseNote; changes: NoteChanges; rawY: number; moved: boolean; drumLane?: number; auditionOnClick?: boolean; touchDrag?: boolean; dragReadyAt?: number });
type DesktopErase = Extract<Gesture, { kind: 'erase' }> & { tapPitch?: number };
type WheelEdit = {
  draftId: string; partId: string; note: PhraseNote; changes: NoteChanges;
  initialSeconds: number; minimumSeconds: number; maximumSeconds: number; stepSeconds: number;
  seconds: number; create: boolean; remove: boolean;
};
type WheelAnchor = { x: number; y: number; draftId: string; partId: string; noteId: string };
type PointerPosition = Pick<PointerEvent, 'clientX' | 'clientY' | 'timeStamp'>;
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
  desktopPointerUx?: boolean;
  readPointerSensitivity?(): number;
  editorSettings?: { isOpen(): boolean; setOpen(open: boolean): void };
  showPlayheadTime?: boolean;
  onViewportChange?(viewport: PhraseEditorViewport): void;
  onChange(view?: PhraseView, preserveSounding?: boolean, noteOnly?: boolean): void; onPreview(body?: PhraseBody): void; onSeek(seconds: number): void | Promise<void>;
  /** A family selection solos that family; individual note selection does not. */
  onPlaybackFamilyChange?(partId?: string): void;
  readPlayhead?(): number;
  readIsPlaying?(): boolean;
  readPerformanceMode?(): boolean;
  listTimbres(): Array<{ id: string; name: string; requiresDeleteConfirmation?: boolean }>; onAddTimbre(id: string): string;
  onCreateNoteGroup?(id: string, draftId: string): string;
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
  enableGainCurve?: boolean;
  onLearningAction?(action: LearningAction): void;
  readLessonInput?(): 'locked' | 'pan' | 'draw' | 'zoom' | 'edit';
  mobileTouch?: { readRightButton(): boolean };
}): { refresh(view?: PhraseView): void; dispose(): void; flush(persist?: boolean, writeDraft?: boolean): void; setPlayhead(seconds: number, playing?: boolean, displaySeconds?: number, frameTime?: number): void; isStepInputActive(): boolean; cancelInteraction(): boolean; settingsVisibilityChanged(): void; readViewport(): PhraseEditorViewport; frameNotes(reserveEndSpace?: boolean): void; previewTempoRate(value?: number, sectionId?: string): void } {
  const { phrase, sound } = options;
  const readEditor = () => options.desktopPointerUx ? phrase.read({ includeCatalog: false, sharedDraft: true }) : phrase.read();
  let current = options.initialView ?? readEditor(); let disposed = false;
  const rhythm = options.section === 'rhythm';
  const vertical = options.orientation === 'vertical';
  const drumRoll = vertical && !rhythm;
  const pointerUx = vertical && !rhythm && options.desktopPointerUx === true;
  const windowsPalette = pointerUx && document.documentElement?.classList.contains('windows-desktop-colors');
  const unassignedColor = windowsPalette ? '#a99b9e' : '#b6bcc4';
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
  let wheelEdit: WheelEdit | undefined;
  let wheelAnchor: WheelAnchor | undefined;
  let wheelScrollPoint: Point | undefined;
  let dragSample: PointerPosition | undefined;
  let dragFrame = 0;
  let wheelTimer = 0, wheelFrame = 0, edgeFrame = 0, edgeLastTime = 0;
  let highlightedKey: HTMLButtonElement | undefined;
  let auditionPitch: number | undefined;
  let auditionPitchTimer = 0;
  let toneCardsOpen = false;
  let toneRevealBand: { top: number; bottom: number } | undefined;
  let panMode: PointerPanMode = 'ready';
  let desktopErase: DesktopErase | undefined;
  let hoveredToneId: string | undefined;
  let toneCooldownUntil = 0;
  let pointerPan = { x: 0, y: 0 };
  let gainPartId: string | undefined;
  let gainDraft: { kind: CurveKind; points: PhraseGainPoint[] } | undefined;
  let playbackFamilyId: string | undefined;
  let playheadSeconds = restored?.playheadSeconds ?? 0; let library: WorkspacePanel | undefined; let observer: ResizeObserver | undefined;
  let playheadPlaying = false;
  let displayedPlayheadSeconds = playheadSeconds;
  let clockFrame = -1;
  let entryOctave = restored?.entryOctave ?? 4;
  let entryToneId: string | undefined = vertical ? selection?.partId : restored?.entryToneId;
  let deleteToneArmed: { partId: string; at: number } | undefined;
  let libraryRefresh: (() => void) | undefined; let libraryError: HTMLElement | undefined;
  let draggedGroup: { id: string; draftId: string; from: Point; card: HTMLButtonElement; pinned: boolean } | undefined;
  let suppressGroupClickUntil = 0;
  let draggedTone: { id: string; draftId: string } | undefined; let suppressLibraryClickUntil = 0;
  let toneDeleteDialog: WorkspacePanel | undefined; let toneDeleteDraftId: string | undefined;
  let resetToneOrder: (() => void) | undefined;
  let noticeTimer = 0; const addedParts = new Set<string>(); const noteNodes = new Map<string, HTMLButtonElement>();
  const noteLayers = new Map<HTMLElement, Map<string, HTMLElement>>();
  const noteRects = new WeakMap<HTMLElement, { x: number; y: number; width: number; height: number }>();
  const noteHighlights = new Map<HTMLElement, HTMLCanvasElement>();
  let highlightFrame = 0;
  let noteLayerSelection: string | undefined;
  let noteLayerHover: string | undefined;
  const toneEntries = new Map<string, { entry: HTMLElement; card: HTMLButtonElement; appearance: string }>();
  const noteLabels = new WeakMap<HTMLButtonElement, string>();
  const noteAppearance = new WeakMap<HTMLButtonElement, string>();
  const gridNodes: HTMLElement[] = [];
  let gridSnapTimes: number[] = [];
  const drumGridNodes: HTMLElement[] = [];
  let headWidth = 1;
  let rollPitchWidth = 0;
  let rollRegion: RollPaintRegion | undefined;
  let drawnGrid = '';
  let drawnNotes: RollPaintRegion | undefined;
  let drawnNoteBody: PhraseBody | undefined;
  let drawnNoteAppearance = '';
  let drawnNoteWidth = 0;
  const retainedGridLines = new Map<HTMLElement, Map<number, HTMLElement>>();
  let layerOffset = NaN;
  let viewportFrame = 0;
  let zoomBounds: { pitch: number; time: number } | undefined;
  let pendingPitchOffset: number | undefined;
  let previewFrame = 0;
  let indexedBody: PhraseBody | undefined;
  let noteIndex: ReturnType<typeof createMelodyNoteIndex> | undefined;
  let lastSoundingNotes: readonly IndexedMelodyNote[] | undefined;
  const cachedPitchRows = new Map<number, number>();
  function pitchRow(frequency: number): number {
    let row = cachedPitchRows.get(frequency);
    if (row === undefined) { row = phrasePitchRow(frequency, keys); cachedPitchRows.set(frequency, row); }
    return row;
  }
  let followResumeAt = 0;
  let lastFollowFrame: { time: number; seconds: number; zoom: number } | undefined;
  let browseLastSeconds = view.leftSeconds, browseLastAt = -Infinity, browseSince = 0, browseDistance = 0;
  let quickHideTimer = 0, handHoverTimer = 0, quickHover = false, quickFocused = false;
  let quickThumbTop = 0, quickThumbHeight = 28, quickTrackHeight = 1;
  let measureQuickTrack = true;
  let quickDescription = '';
  let quickDrag: { id: number; top: number; grab: number } | undefined;
  let keyPan: { id: number; capture: HTMLElement; fromX: number; offset: number; moved: boolean } | undefined;
  let suppressKeyClickUntil = 0;
  let tempoPreview: PhraseBody | undefined;
  let tempoRatePreview: PhraseBody | undefined;
  let tempoPreviewBoundaryOnly = false;
  let panMoved = false;
  const touches = vertical && options.mobileTouch ? new Map<number, Point>() : undefined;
  let pinch: { x: number; y: number; axis?: 'x' | 'y' | 'both' } | undefined;
  let pinchFrame = 0;
  const sounding = new Set<string>();
  const keyNodes: HTMLButtonElement[] = [];
  const pitchRows: HTMLElement[] = [];
  let soundingKeys = new Map<number, string>();
  let toneColors = new Map<string, string>();
  let toneNames = new Map<string, string>();
  const instrumentIcons = vertical;
  let instrumentKeys = new Map<string, string>();
  const drumKeys = new Map<string, number>();
  const page = node('div', 'melody-workspace'); const main = node('div', 'melody-main'); const shelf = node('aside', 'melody-shelf');
  const pointerArea = root.closest<HTMLElement>('.music-editor') ?? main;
  let cardMenuTarget: { card: HTMLButtonElement; id: string } | undefined;
  const cardMenu = node('div', 'melody-card-menu');
  cardMenu.hidden = true; cardMenu.setAttribute('role', 'menu');
  const deleteCard = button('删除', '', () => {
    const target = cardMenuTarget;
    closeCardMenu(true);
    if (target) requestRemoveFamily(target.id, true);
  });
  deleteCard.setAttribute('role', 'menuitem'); deleteCard.tabIndex = -1;
  deleteCard.append(libraryIcon('trash')); cardMenu.append(deleteCard); page.append(cardMenu);
  page.classList.toggle('rhythm-workspace', rhythm);
  page.classList.toggle('is-vertical', vertical);
  let keyboardHeight = 48;
  let toneKeyboardInset = 0;
  function sizeDesktopKeyboard(): void {
    const height = Math.round(melodyClamp(window.innerHeight * .12, 100, 148));
    if (keyboardHeight === height) return;
    keyboardHeight = height;
    page.style.setProperty('--melody-keyboard-height', `${height}px`);
    if (pointerArea !== main) pointerArea.style.setProperty('--melody-keyboard-height', `${height}px`);
  }
  const toneHand = pointerUx ? node('div', 'melody-tone-hand') : shelf;
  const handMotion = pointerUx ? mountToneHand(toneHand) : undefined;
  let toggleToneDeck: (() => void) | undefined;
  const tonePile = pointerUx ? button('', 'melody-add-tone melody-add-note-family melody-tone-pile', () => {
    if (toggleToneDeck) toggleToneDeck(); else openLibrary();
  }) : undefined;
  if (pointerUx) {
    page.classList.add('has-pointer-roll');
    sizeDesktopKeyboard();
    const handMask = node('div', 'melody-tone-hand-mask');
    const backs = node('span', 'melody-card-backs');
    backs.setAttribute('aria-hidden', 'true');
    paintCardBacks(backs, 7);
    const empty = node('span', 'melody-tone-pile-empty', '×');
    empty.setAttribute('aria-hidden', 'true');
    tonePile!.append(backs, empty);
    tonePile!.setAttribute('aria-label', '添加音色');
    tonePile!.setAttribute('aria-expanded', 'false');
    handMask.append(toneHand); shelf.append(handMask, tonePile!);
  }
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
  const endHandle = button('', 'melody-roll-end', () => {}); endHandle.setAttribute('aria-label', '调整末段长度');
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
  const pinnedTone = pointerUx ? node('div', 'melody-pinned-tone') : undefined;
  if (pinnedTone) { pinnedTone.hidden = true; main.append(pinnedTone); }
  const audition = createPhraseAudition(phrase, sound, () => selection?.partId, message => report(message), vertical, pointerUx ? () => current : undefined);
  const toneEdges = pointerUx ? { left: node('div', 'melody-tone-edge is-left'), right: node('div', 'melody-tone-edge is-right') } : undefined;
  const toneShortcut = pointerUx ? button('', 'pointer-keyboard-entry melody-tone-shortcut', toggleToneCards) : undefined;
  if (toneEdges && toneShortcut) {
    for (const edge of Object.values(toneEdges)) edge.setAttribute('aria-hidden', 'true');
    toneShortcut.setAttribute('aria-label', '音色栏');
    toneShortcut.append(libraryIcon('musicLibrary'));
    toneShortcut.setAttribute('aria-expanded', 'false');
    page.prepend(toneShortcut);
    pointerArea.append(toneEdges.left, toneEdges.right);
    shelf.inert = true;
  }
  const toneTrash = node('div', 'melody-tone-trash'); toneTrash.hidden = true; toneTrash.setAttribute('role', 'region'); toneTrash.setAttribute('aria-label', '移除音色');
  const trashIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); trashIcon.setAttribute('viewBox', '0 0 24 24'); trashIcon.setAttribute('aria-hidden', 'true');
  const trashPath = document.createElementNS('http://www.w3.org/2000/svg', 'path'); trashPath.setAttribute('d', 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7');
  for (const [key, value] of Object.entries({ fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) trashPath.setAttribute(key, value);
  trashIcon.append(trashPath); toneTrash.append(trashIcon); page.append(toneTrash);
  const width = () => Math.max(1, vertical ? scroll.clientHeight - keyboardHeight : canvas.clientWidth || scroll.clientWidth - (rhythm ? 0 : 64));
  const pitchSpan = () => vertical ? scroll.clientWidth : scroll.clientHeight;
  const pitchOffset = () => pendingPitchOffset ?? (vertical ? scroll.scrollLeft : scroll.scrollTop);
  const noteArea = (target: Node) => canvas.contains(target) || drumCanvas.contains(target);
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
  const gainCurve: ReturnType<typeof mountMelodyGainCurve> | undefined = vertical && !options.readLessonInput && options.enableGainCurve !== false && typeof phrase.setPartGainCurve === 'function'
    ? mountMelodyGainCurve(roll, {
      geometry() {
        const value = body(); if (!gainPartId || !value) return;
        return { body: value, start: view.leftSeconds, scale: melodyScale(view, width(), melodyDuration(value)),
          width: scroll.clientWidth + (drumStrip.hidden ? 0 : drumStrip.clientWidth), height: width() };
      },
      points(kind) {
        if (!gainPartId) return;
        const voice = part(gainPartId);
        return (kind === 'gain' ? voice?.gainCurve : voice?.performanceCurves?.[kind]) ?? [];
      },
      preview(kind, points) { gainDraft = points && { kind, points }; if (points) previewEdit(); else preview(); },
      commit(kind, points) {
        if (!gainPartId) return;
        gainDraft = undefined;
        try {
          if (kind === 'gain') phrase.setPartGainCurve(gainPartId, points);
          else phrase.setPartPerformanceCurve(gainPartId, kind, points);
          refresh(); notify();
        }
        catch (error) { report(error instanceof Error ? error.message : String(error)); }
        finally { gainDraft = undefined; preview(); gainCurve?.paint(); }
      },
      close: () => setGainMode(),
    }) : undefined;
  gainCurve?.layer.addEventListener('wheel', wheel, { passive: false });
  gainCurve?.layer.addEventListener('pointerdown', event => {
    if (event.button === 0 && !(event.target as HTMLElement).closest('button, select') && !startTouch(event)) begin(event);
  });
  function setGainMode(id?: string) {
    if (!gainCurve || disposed) return;
    gainCurve.finish(true);
    gainCurve.clearSelection();
    gainPartId = id; gainDraft = undefined;
    page.classList.toggle('is-gain-editing', !!id);
    keyboard.inert = !!id; drumKeyboard.inert = !!id; notes.inert = !!id; drumNotes.inert = !!id;
    tempoDock.inert = !!id; shelf.inert = !!id || (pointerUx && (!toneCardsOpen || options.editorSettings?.isOpen() === true));
    if (pinnedTone) pinnedTone.inert = !!id;
    paintShelf(); paintConsole(); paintViewport(); scheduleViewport();
    if (id) scroll.focus({ preventScroll: true });
    else console.querySelector<HTMLButtonElement>('.melody-edit-gain-curve')?.focus({ preventScroll: true });
  }
  const editSteps = (value: PhraseBody, beat = melodyBeats(view.leftSeconds, value)) => {
    const steps = phraseStepsAtBeat(value, beat), scale = melodyScale(view, width(), melodyDuration(value));
    const detailPixels = revealConfiguredGrid ? 0 : undefined;
    const divisions = value.tempoSections?.length ? steps ** melodyScoreGridDepth(value, scale, detailPixels)
      : melodyDetailSteps(phraseTempoAtBeat(value, beat), steps, scale, detailPixels, phraseMeterBeatLength(value));
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
    const steps = editSteps(value, startBeat); const cell = 60 / phraseTempoAtBeat(value, startBeat) * phraseMeterBeatLength(value) / steps;
    const available = Math.min(96, melodyDuration(value) - melodySeconds(startBeat, value));
    return { cell: Math.min(cell, available), maximum: available };
  }
  const sectionParts = (value = body()) => (value?.parts ?? []).filter(part => !rhythm && options.includeAllSections
    || (part.section ?? 'melody') === (rhythm ? 'rhythm' : 'melody'));
  function clampView(next: MelodyView, duration: number): MelodyView {
    const safe = { ...next, leftSeconds: Number.isFinite(next.leftSeconds) ? next.leftSeconds : 0,
      rowHeight: Number.isFinite(next.rowHeight) ? next.rowHeight : rhythm ? 72 : 32 };
    // Leave room after the last roll to reach and pull its actual lower edge.
    const clamped = clampMelodyView(safe, vertical ? duration + 6 / melodyClamp(safe.zoom, .25, 256) : duration, pointerUx ? .5 : 0);
    if (pointerUx && safe.zoom === view.zoom) {
      const left = -4 / clamped.zoom;
      const right = Math.max(clamped.leftSeconds, Math.min(view.leftSeconds, duration - 4 / view.zoom));
      clamped.leftSeconds = melodyClamp(safe.leftSeconds, left, right);
    }
    return rhythm ? { ...clamped, rowHeight: melodyClamp(safe.rowHeight, 48, 120) } : clamped;
  }
  function maximumTop(): number {
    const height = rhythm ? Math.max(1, visibleParts().length) * view.rowHeight + 52 : melodyPitchTop(keys, keys.length, view.rowHeight);
    return Math.max(0, height - Math.max(0, pointerUx && rollPitchWidth ? rollPitchWidth : pitchSpan()));
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
    if (!pointerUx) setTop(pitchOffset());
    if (!viewportReady || disposed) return;
    if (remember) persistWorkspace();
    const next = pointerUx ? { ...view, top: pitchOffset() } : readViewport();
    if (lastViewport && next.leftSeconds === lastViewport.leftSeconds && next.zoom === lastViewport.zoom && next.top === lastViewport.top && next.rowHeight === lastViewport.rowHeight) return;
    lastViewport = next; options.onViewportChange?.({ ...next });
  }
  function paintViewport(remember = true, updateHead = true): void {
    cancelAnimationFrame(viewportFrame); viewportFrame = 0;
    if (disposed) return;
    const zooming = zoomBounds !== undefined;
    zoomBounds = undefined;
    const zoomOffset = pendingPitchOffset;
    if (zoomOffset !== undefined) paintRows();
    if (rhythm) paintShelf();
    const value = body();
    const reuse = pointerUx && !!value && !tempoRatePreview && !!rollPitchWidth
      && drawnNoteBody === value && drawnNotes === currentRollRegion(value, zooming)
      && !desktopErase && !mix && !wheelEdit && !(gesture && 'note' in gesture);
    if (reuse) {
      moveRollLayers();
      scheduleNoteHighlights();
      paintRollOverlays(value, headWidth);
      if (updateHead) positionHead();
    } else {
      paintGrid(zooming);
      paintNotes(undefined, updateHead);
    }
    if (zoomOffset !== undefined) {
      setTop(zoomOffset);
      pendingPitchOffset = undefined;
    }
    gainCurve?.paint(); paintQuickScroll(); reportViewport(remember);
  }
  function scheduleViewport(): void {
    if (!viewportFrame) viewportFrame = requestAnimationFrame(() => paintViewport());
  }
  function headInView(seconds = playheadSeconds): boolean {
    return seconds >= view.leftSeconds && seconds <= view.leftSeconds + 8 / view.zoom;
  }
  function manualNavigation(fromQuick = false): void {
    wheelAnchor = undefined;
    // Browsing away pauses following; small pans and returning resume it.
    if (!vertical) return;
    const now = performance.now(), delta = Math.abs(view.leftSeconds - browseLastSeconds);
    followResumeAt = now + (headInView() ? pointerUx ? 900 : 0 : 30_000);
    lastFollowFrame = undefined;
    browseLastSeconds = view.leftSeconds;
    if (!fromQuick && delta > 0) {
      if (now - browseLastAt > 700) { browseSince = now; browseDistance = 0; }
      browseLastAt = now;
      const viewportWidth = pointerUx && headWidth > 1 ? headWidth : width();
      browseDistance += delta * melodyScale(view, viewportWidth, melodyDuration(body()!));
      if (quick.hidden && (browseDistance >= viewportWidth * .75 || now - browseSince >= 600 && browseDistance >= 48)) {
        quick.hidden = false; measureQuickTrack = true;
      }
    }
    if (!quick.hidden) deferQuickHide();
  }
  function deferQuickHide(): void {
    window.clearTimeout(quickHideTimer);
    if (quickDrag || quickHover || quickFocused) return;
    quickHideTimer = window.setTimeout(() => { quick.hidden = true; quickHint.hidden = true; }, 2000);
  }
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
    if (!pointerUx || measureQuickTrack) { quickTrackHeight = Math.max(1, quick.clientHeight); measureQuickTrack = false; }
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
  function notify(preserveSounding = false, noteOnly = false): void { if (!disposed) options.onChange(current, preserveSounding, noteOnly); }
  function preview(value?: PhraseBody): void {
    cancelAnimationFrame(previewFrame); previewFrame = 0;
    if (!disposed) options.onPreview(value);
  }
  function previewEdit(): void {
    // Idle editing needs no full-score audio copy. During playback, coalesce
    // pointer events and compile only the latest change at the next frame.
    if (options.readIsPlaying?.() === false || (pointerUx && options.readIsPlaying)) return;
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
    return toneColors.get(id) ?? (windowsPalette ? windowsToneColor(id) : defaultToneColor(id));
  }
  function editingFamilyId(): string | undefined {
    return vertical && selection?.noteId ? undefined : selection?.partId;
  }
  function picked(): PhraseNote | undefined { return part()?.notes.find(value => value.id === selection?.noteId); }
  function displayedBody(): PhraseBody | undefined {
    const active = gesture; const base = mix?.base ?? active?.base ?? (tempoPreviewBoundaryOnly ? current.body : body()); if (!base) return;
    if (gainDraft) {
      const { kind, points } = gainDraft;
      return { ...base, parts: base.parts.map(voice => voice.id !== gainPartId ? voice : kind === 'gain'
        ? { ...voice, gainCurve: points } : { ...voice, performanceCurves: { ...voice.performanceCurves, [kind]: points } }) };
    }
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
  function choose(next: Selection, moveCards?: () => void): void {
    if (gainPartId || !safeFlush()) return;
    const repaintNotes = !pointerUx || selection?.noteId !== next.noteId;
    wheelAnchor = undefined;
    if (pointerUx) suspendRollPointer();
    selection = next; entryToneId = !rhythm && !next.noteId ? next.partId : undefined; deleteToneArmed = undefined;
    audition.sync(current); paintShelf(); syncDrumStrip(); paintConsole();
    moveCards?.();
    if (repaintNotes) paintNotes();
    persistWorkspace();
    if (!next.noteId) options.onLearningAction?.('select-group');
  }
  function syncPlaybackFamily(): void {
    const next = hoveredToneId ?? (selection && !selection.noteId ? part()?.id : undefined);
    if (next === playbackFamilyId) return;
    playbackFamilyId = next;
    lastSoundingNotes = undefined;
    options.onPlaybackFamilyChange?.(next);
  }
  function showHoveredTone(id?: string): void {
    if (hoveredToneId === id) return;
    hoveredToneId = id;
    syncPlaybackFamily();
    scheduleNoteHighlights();
  }
  function paintNoteLayer(layer: HTMLElement, id: string, selected: string | undefined): void {
    const dim = !!selected && selected !== id;
    if (layer.inert !== dim) layer.inert = dim;
    layer.classList.toggle('is-dim', dim);
    layer.classList.toggle('is-current-tone', id === selected);
    layer.classList.toggle('is-tone-preview', id === hoveredToneId);
    layer.classList.toggle('is-tone-preview-dim', !!hoveredToneId && id !== hoveredToneId);
  }
  function syncNoteLayers(selected = editingFamilyId()): void {
    if (noteLayerSelection === selected && noteLayerHover === hoveredToneId) return;
    for (const layers of noteLayers.values()) for (const [id, layer] of layers) paintNoteLayer(layer, id, selected);
    noteLayerSelection = selected;
    noteLayerHover = hoveredToneId;
  }
  function scheduleNoteHighlights(): void {
    if (!pointerUx || highlightFrame) return;
    if (!hoveredToneId && !editingFamilyId() && !noteLayerSelection && !noteLayerHover) return;
    highlightFrame = requestAnimationFrame(() => {
      highlightFrame = 0;
      if (disposed) return;
      const selected = editingFamilyId();
      const hovered = hoveredToneId;
      const active = hovered ?? selected;
      const offset = pitchOffset();
      syncNoteLayers(selected);
      for (const parent of [notes, drumNotes]) {
        const layer = active ? noteLayers.get(parent)?.get(active) : undefined;
        let highlight = noteHighlights.get(parent);
        if (!layer || !rollPitchWidth || !headWidth || !Number.isFinite(layerOffset)) {
          if (highlight) highlight.hidden = true;
          continue;
        }
        if (!highlight) {
          highlight = node('canvas', 'melody-note-highlights');
          highlight.setAttribute('aria-hidden', 'true');
          parent.append(highlight);
          noteHighlights.set(parent, highlight);
        }
        const width = parent === notes ? rollPitchWidth : visibleDrumLanes * drumLaneWidth;
        const x = parent === notes ? offset : 0, y = -layerOffset;
        const ratio = window.devicePixelRatio || 1;
        const pixelsWide = Math.round(width * ratio), pixelsHigh = Math.round(headWidth * ratio);
        if (highlight.width !== pixelsWide) highlight.width = pixelsWide;
        if (highlight.height !== pixelsHigh) highlight.height = pixelsHigh;
        highlight.style.width = `${width}px`;
        highlight.style.height = `${headWidth}px`;
        highlight.style.translate = `${x}px ${y}px`;
        highlight.hidden = false;
        const drawing = highlight.getContext?.('2d');
        if (!drawing) continue;
        drawing.setTransform(ratio, 0, 0, ratio, 0, 0);
        drawing.clearRect(0, 0, width, headWidth);
        const voice = part(active);
        const color = !voice || voice.unassigned ? unassignedColor : toneColor(voice.timbreId);
        drawing.strokeStyle = windowsPalette ? `color-mix(in srgb, ${color} 35%, #fffdf7)`
          : `color-mix(in srgb, ${color} 76%, #294458)`;
        drawing.lineWidth = 1;
        drawing.beginPath();
        for (const block of layer.children) {
          const rect = noteRects.get(block as HTMLElement);
          if (!rect || rect.x + rect.width <= x || rect.x >= x + width || rect.y + rect.height <= y || rect.y >= y + headWidth) continue;
          if (windowsPalette) {
            if (rect.width < 2 || rect.height < 2) continue;
            drawing.roundRect(rect.x - x + 1, rect.y - y + 1, rect.width - 2, rect.height - 2, .5);
          } else drawing.roundRect(rect.x - x + .5, rect.y - y + .5,
            Math.max(0, rect.width - 1), Math.max(0, rect.height - 1), 2);
        }
        if (!windowsPalette && hovered && hovered !== selected) {
          drawing.shadowColor = `color-mix(in srgb, ${color} 35%, transparent)`;
          drawing.shadowBlur = 6;
        } else drawing.shadowBlur = 0;
        drawing.stroke();
      }
    });
  }
  function noteLayer(parent: HTMLElement, id: string): HTMLElement {
    if (!pointerUx) return parent;
    let layers = noteLayers.get(parent);
    if (!layers) noteLayers.set(parent, layers = new Map());
    let layer = layers.get(id);
    if (!layer) {
      layer = node('div', 'melody-tone-note-layer');
      paintNoteLayer(layer, id, editingFamilyId());
      layers.set(id, layer);
      parent.append(layer);
    }
    return layer;
  }
  function noteDimmed(block: HTMLElement): boolean {
    if (!pointerUx) return block.classList.contains('is-dim');
    const selected = editingFamilyId();
    return !!selected && block.dataset.partId !== selected;
  }
  function returnToneCard(picture: ReturnType<typeof takeToneCardPicture>, id: string): void {
    const target = toneHand.querySelector<HTMLElement>(`[data-part-id="${id}"] .melody-note-family`);
    flyToneCard(picture, target, main, 'return');
  }
  function clearToneCard(release?: DragEvent): void {
    const id = editingFamilyId();
    if (!id || !safeFlush()) return;
    stopToneCardFlights(main);
    const previous = toneCardsOpen ? toneCardPositions(toneHand) : undefined;
    const card = pinnedTone?.querySelector<HTMLElement>('.melody-note-family');
    const outgoing = card && takeToneCardPicture(card, release);
    selection = undefined; entryToneId = undefined; deleteToneArmed = undefined;
    audition.sync(current); paintShelf(); syncDrumStrip(); paintConsole();
    if (previous) slideToneCards(toneHand, previous);
    if (outgoing) returnToneCard(outgoing, id);
    else scroll.focus({ preventScroll: true });
    persistWorkspace();
    options.onLearningAction?.('deselect');
  }
  function activateToneCard(card: HTMLButtonElement, id: string): void {
    if (!pointerUx) { choose({ partId: id }); scroll.focus({ preventScroll: true }); return; }
    if (options.editorSettings?.isOpen() || !part(id)) return;
    const selected = editingFamilyId();
    if (selected === id) {
      clearToneCard();
      return;
    }
    if (!toneCardsOpen) return;
    stopToneCardFlights(main);
    const previous = toneCardPositions(toneHand);
    const incoming = takeToneCardPicture(card);
    const pinned = pinnedTone?.querySelector<HTMLElement>('.melody-note-family');
    const outgoing = pinned && takeToneCardPicture(pinned);
    choose({ partId: id }, () => {
      slideToneCards(toneHand, previous);
      if (outgoing && selected) returnToneCard(outgoing, selected);
      flyToneCard(incoming, pinnedTone?.querySelector<HTMLElement>('.melody-note-family'), main, 'pin');
      scroll.focus({ preventScroll: true });
      prepareVisibleTone(id);
    });
  }
  function prepareVisibleTone(id: string): void {
    const record = current.availableSounds.find(sound => sound.id === part(id)?.timbreId)?.body;
    if (!record || typeof record !== 'object' || Array.isArray(record) || record.model !== 'sample-bank' || record.zones) return;
    const first = Math.max(0, melodyPitchAt(keys, pitchOffset(), view.rowHeight));
    const last = Math.min(keys.length - 1, melodyPitchAt(keys, pitchOffset() + pitchSpan(), view.rowHeight));
    void phrase.prepareNoteAudition?.(id, keys.slice(first, last + 1).map(key => key.frequencyHz)).catch(() => {});
  }
  function changeGroupTimbre(partId: string, timbreId: string): void {
    if (options.onChangeNoteGroupTimbre) options.onChangeNoteGroupTimbre(partId, timbreId);
    else phrase.setPartTimbre(partId, timbreId);
  }
  function endGroupDrag(): void {
    if (draggedGroup) {
      suppressGroupClickUntil = Date.now() + 250;
      draggedGroup.card.classList.remove('is-group-dragging');
    }
    draggedGroup = undefined;
    for (const entry of shelf.querySelectorAll('.melody-tone-entry')) entry.classList.remove('is-merge-target');
    for (const card of shelf.querySelectorAll('.melody-note-family')) card.classList.remove('is-group-dragging');
  }
  function paintShelf(): void {
    closeCardMenu();
    const editingFamily = editingFamilyId();
    canvas.classList.toggle('is-write-mode', !!editingFamily);
    hoveredToneId = undefined;
    syncPlaybackFamily();
    scheduleNoteHighlights();
    if (!pointerUx) toneHand.replaceChildren();
    const hand: HTMLElement[] = [];
    let pinned: HTMLElement | undefined;
    const present = new Set<string>();
    for (const [index, value] of visibleParts().entries()) {
      const label = partLabel(value);
      const color = toneColor(value.timbreId);
      const selected = editingFamily === value.id;
      const appearance = JSON.stringify([value.timbreId, label, color, value.unassigned, instrumentKeys.get(value.timbreId)]);
      if (pointerUx) {
        present.add(value.id);
        const saved = toneEntries.get(value.id);
        if (saved?.appearance === appearance) {
          const wasSelected = saved.card.classList.contains('is-selected');
          if (wasSelected !== selected) {
            saved.card.classList.toggle('is-selected', selected);
            saved.card.setAttribute('aria-pressed', String(selected));
          }
          if (selected) pinned = saved.entry;
          else hand.push(saved.entry);
          continue;
        }
        saved?.entry.remove();
      }
      const entry = node('div', 'melody-tone-entry');
      const card = button(label, rhythm ? 'melody-tone' : 'melody-tone melody-note-family', () => {
        if (!disposed && Date.now() >= suppressGroupClickUntil) activateToneCard(card, value.id);
      });
      if (!rhythm) card.title = label;
      if (!options.readLessonInput) {
        card.setAttribute('aria-haspopup', 'menu');
        card.addEventListener('contextmenu', event => {
          event.preventDefault(); event.stopPropagation();
          if (disposed || gainPartId || library || toneDeleteDialog) return;
          cardMenuTarget = { card, id: value.id }; cardMenu.hidden = false;
          const anchor = card.getBoundingClientRect();
          const { width, height } = cardMenu.getBoundingClientRect();
          const fromKeyboard = event.button !== 2 && !event.clientX && !event.clientY;
          cardMenu.style.left = `${Math.max(0, Math.min(fromKeyboard ? anchor.left : event.clientX, window.innerWidth - width))}px`;
          cardMenu.style.top = `${Math.max(0, Math.min(fromKeyboard ? anchor.bottom : event.clientY, window.innerHeight - height))}px`;
          deleteCard.focus({ preventScroll: true });
        });
      }
      const separator = drumKey(value) === undefined ? -1 : label.indexOf(' · ');
      if (separator >= 0) {
        card.classList.add('is-drum-family');
        card.setAttribute('aria-label', label);
        card.replaceChildren(node('span', 'melody-drum-family-kit', label.slice(0, separator)),
          node('span', '', label.slice(separator + 3)));
      } else if (instrumentIcons && !value.unassigned) addInstrumentIcon(card, instrumentKeys.get(value.timbreId));
      if (pointerUx) showToneCardFace(card);
      card.dataset.partId = value.id; card.style.setProperty('--tone-color', color); card.classList.toggle('is-selected', selected);
      if (vertical) {
        card.setAttribute('aria-pressed', String(selected));
        if (!pointerUx) card.addEventListener('dblclick', () => openLibrary({ kind: 'replace', partId: value.id }));
      }
      card.classList.toggle('is-unassigned', !!value.unassigned);
      if (!rhythm) {
        card.draggable = pointerUx || !value.unassigned;
        card.addEventListener('dragstart', event => {
          if (disposed || !current.draft || !event.dataTransfer || (!pointerUx && value.unassigned) || !safeFlush()) { event.preventDefault(); return; }
          audition.cancel(); draggedGroup = { id: value.id, draftId: current.draft.id, from: { x: event.clientX, y: event.clientY }, card,
            pinned: pinnedTone?.contains(card) === true };
          event.dataTransfer.setData(GROUP_DRAG_TYPE, value.id); event.dataTransfer.effectAllowed = 'move';
          if (pointerUx && !draggedGroup.pinned) setMiniToneDrag(event.dataTransfer, card);
          card.classList.add('is-group-dragging');
        });
        const accepts = () => {
          if (disposed || !draggedGroup || draggedGroup.pinned || draggedGroup.draftId !== current.draft?.id || draggedGroup.id === value.id) return false;
          const source = part(draggedGroup.id), target = part(value.id);
          return !!source && !!target && !source.unassigned && !target.unassigned && source.timbreId === target.timbreId;
        };
        const replacement = () => pointerUx && draggedTone && draggedTone.draftId === current.draft?.id && part(value.id) ? draggedTone : undefined;
        entry.addEventListener('dragover', event => {
          if ((!accepts() && !replacement()) || !event.dataTransfer) return;
          event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = 'move'; entry.classList.add('is-merge-target');
        });
        entry.addEventListener('dragleave', () => entry.classList.remove('is-merge-target'));
        entry.addEventListener('drop', event => {
          const tint = replacement();
          if (tint && event.dataTransfer?.getData(TIMBRE_DRAG_TYPE) === tint.id) {
            event.preventDefault(); event.stopPropagation(); endToneDrag();
            if (!safeFlush()) return;
            try { changeGroupTimbre(value.id, tint.id); refresh(undefined, !pointerUx, 'rebind'); notify(); }
            catch (error) { report(error instanceof Error ? error.message : String(error)); }
            return;
          }
          if (pointerUx && !accepts()) return;
          event.preventDefault(); event.stopPropagation();
          const source = draggedGroup;
          const valid = accepts() && event.dataTransfer?.getData(GROUP_DRAG_TYPE) === source?.id;
          endGroupDrag();
          if (!valid || !source || !safeFlush()) return;
          try {
            phrase.mergeParts(source.id, value.id); addedParts.delete(source.id);
            if (selection?.partId === source.id) selection = undefined;
            if (entryToneId === source.id) entryToneId = undefined;
            deleteToneArmed = undefined;
            refresh(); persistWorkspace(); notify();
          } catch (error) { report(error instanceof Error ? error.message : String(error)); }
        });
        card.addEventListener('dragend', endGroupDrag);
      }
      if (pointerUx) {
        entry.dataset.partId = value.id;
        toneEntries.set(value.id, { entry, card, appearance });
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
      if (pointerUx) {
        if (selected) pinned = entry;
        else hand.push(entry);
      } else toneHand.append(entry);
    }
    if (tonePile) {
      for (const [id, view] of toneEntries) if (!present.has(id)) {
        view.entry.remove();
        toneEntries.delete(id);
      }
      if (pinned && pinned.parentElement !== pinnedTone) pinnedTone!.append(pinned);
      const orderChanged = toneHand.children.length !== hand.length || hand.some((entry, index) => toneHand.children[index] !== entry);
      if (orderChanged) {
        hand.forEach((entry, index) => {
          if (toneHand.children[index] !== entry) toneHand.insertBefore(entry, toneHand.children[index] ?? null);
        });
        handMotion?.update(hand);
      }
      if (pinnedTone) pinnedTone.hidden = !pinned;
      toneHand.classList.toggle('is-dense', hand.length > 7);
      paintEntryRange();
      return;
    }
    const add = button('+', rhythm ? 'melody-add-tone' : 'melody-add-tone melody-add-note-family', () => openLibrary());
    const addLabel = rhythm || vertical ? '添加音色' : '新建总音符';
    add.setAttribute('aria-label', addLabel);
    if (vertical && !pointerUx) {
      const mark = node('span', 'melody-add-tone-icon', '+');
      mark.setAttribute('aria-hidden', 'true');
      add.replaceChildren(mark, node('span', '', addLabel));
    }
    shelf.append(add);
    paintEntryRange();
  }
  function openLibrary(intent: LibraryIntent = { kind: 'create' }): void {
    if (disposed || library || toneDeleteDialog || !safeFlush()) return;
    if (!rhythm && intent.kind === 'replace' && !part(intent.partId)) { report('找不到这个总音符，请重新选择。'); return; }
    const openedDraftId = current.draft?.id;
    if (pointerUx && !toneCardsOpen) {
      options.editorSettings?.setOpen(false);
      setToneCards(true);
    }
    const dialog = createWorkspacePanel(pointerUx); dialog.className += ' melody-tone-library'; library = dialog; dialog.setAttribute('aria-label', '音色库');
    const heading = node('div', 'melody-library-heading'); const close = button('→', 'melody-library-close', dismiss); close.setAttribute('aria-label', '关闭音色库');
    const libraryTitle = node('h2', '', '音色库');
    if (instrumentIcons) libraryTitle.append(libraryIcon('score'));
    heading.append(libraryTitle, close); const tiles = node('div', 'melody-library-grid'); const error = node('p', 'melody-library-error'); error.hidden = true;
    const deckRow = pointerUx ? node('div', 'melody-library-deck') : undefined;
    const deck = deckRow ? (() => {
      const left = node('div', 'melody-card-backs is-left'), right = node('div', 'melody-card-backs is-right');
      left.setAttribute('aria-hidden', 'true'); right.setAttribute('aria-hidden', 'true');
      deckRow.tabIndex = 0; deckRow.setAttribute('aria-label', '音色库');
      deckRow.append(left, tiles, right);
      return mountToneDeck(main, deckRow, tiles, left, right);
    })() : undefined;
    let category = '全部';
    const tools = deck ? undefined : node('div', 'melody-library-tools');
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
      return category === '全部' ? entries : entries.filter(({ group }) => group === category);
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
    tools?.append(categories);
    let importing = false;
    let importControl: HTMLButtonElement | undefined;
    const cards = new Map<string, HTMLElement>();
    function updateDeckCards(): void {
      for (const [id, frame] of cards) {
        const tile = frame.querySelector('.melody-library-tone') as HTMLElement;
        tile.style.setProperty('--tone-color', toneColor(id));
        tile.setAttribute('aria-disabled', 'false');
      }
    }
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
        && readEditor().draft?.id === openedDraftId;
      endToneDrag();
      if (!matches) return;
      try {
        const currentIds = filteredTimbres(libraryEntries()).map(({ timbre }) => timbre.id);
        const relevantIds = deck ? currentIds.filter(id => completed.ids.includes(id)) : currentIds;
        if (relevantIds.length !== completed.ids.length || relevantIds.some((id, index) => id !== completed.ids[index])) throw new Error('音色库刚刚发生变化，请重新拖动。');
        if (completed.source !== completed.target) {
          const target = options.listTimbres().findIndex(timbre => timbre.id === completed.ids[completed.target]);
          options.onReorderTimbres?.(completed.id, target); refresh(); notify();
        }
      } catch (reason) { error.hidden = false; error.textContent = reason instanceof Error ? reason.message : String(reason); }
    });
    libraryError = error;
    libraryRefresh = () => {
      if (draggedTone) endToneDrag();
      const entries = libraryEntries();
      if (tools) paintCategories(entries);
      cards.clear(); if (!deck) tiles.replaceChildren();
      importControl?.remove();
      const selectedTimbres = new Set(visibleParts().filter(part => !part.unassigned).map(part => part.timbreId));
      for (const { timbre, info, group } of filteredTimbres(entries)) {
        const selected = selectedTimbres.has(timbre.id);
        const frame = node('div', 'melody-library-card'); frame.draggable = true; frame.dataset.timbreId = timbre.id;
        if (!deck) frame.title = `${group} · ${timbre.name}`;
        const tile = button(timbre.name, 'melody-library-tone', () => {
          if (disposed || library !== dialog || dialog.inert || draggedTone || Date.now() < suppressLibraryClickUntil || !safeFlush()) return;
          try {
            error.hidden = true; error.textContent = '';
            if (!rhythm) {
              const snapshot = readEditor();
              if (!openedDraftId || snapshot.draft?.id !== openedDraftId) throw new Error('当前音乐已改变，请重新打开音色库。');
              let id: string;
              if (intent.kind === 'replace') {
                changeGroupTimbre(intent.partId, timbre.id);
                id = intent.partId;
              }
              else id = options.onCreateNoteGroup ? options.onCreateNoteGroup(timbre.id, openedDraftId) : phrase.addPart(timbre.id, 'melody');
              current = readEditor(); if (!part(id)) throw new Error('这个总音符暂时无法创建，请重试。');
              if (deck && intent.kind === 'create') {
                const previous = toneCardPositions(toneHand);
                const incoming = takeToneCardPicture(tile);
                addedParts.add(id); refresh(current, false, 'empty'); updateDeckCards(); notify();
                slideToneCards(toneHand, previous);
                flyToneCard(incoming, toneHand.querySelector<HTMLElement>(`[data-part-id="${id}"] .melody-note-family`), main, 'deal');
                options.onLearningAction?.('add-group');
                return;
              }
              addedParts.add(id); selection = { partId: id }; entryToneId = id; deleteToneArmed = undefined;
              dismiss(); refresh(current); notify(); scroll.focus({ preventScroll: true }); if (intent.kind === 'create') options.onLearningAction?.('add-group'); return;
            }
            const matches = sectionParts().filter(part => part.timbreId === timbre.id);
            if (matches.length) phrase.setPartsVisible(matches.map(part => part.id), !selected);
            else { const id = options.onAddTimbre(timbre.id); current = phrase.read(); if (!part(id)) throw new Error('这个音色暂时无法加入音乐。'); addedParts.add(id); }
            current = phrase.read(); const voice = sectionParts().find(part => part.timbreId === timbre.id);
            if (voice) { addedParts.add(voice.id); selection = { partId: voice.id }; entryToneId = rhythm ? undefined : voice.id; }
            deleteToneArmed = undefined; refresh(); notify();
          } catch (reason) { error.hidden = false; error.textContent = reason instanceof Error ? reason.message : String(reason); }
        });
        if (instrumentIcons) addInstrumentIcon(tile, info?.key);
        if (deck) showToneCardFace(tile);
        tile.dataset.timbreId = timbre.id; if (rhythm) { tile.setAttribute('aria-pressed', String(selected)); tile.classList.toggle('is-on-shelf', selected); }
        frame.append(tile);
        if (!deck) {
          const play = button('▶', 'melody-tone-preview melody-library-preview', () => { if (!disposed && library === dialog) void audition.requestTimbre(timbre.id); });
          play.setAttribute('aria-label', `试听${timbre.name}`); frame.append(play);
        }
        frame.addEventListener('dragstart', event => {
          if (disposed || library !== dialog || !event.dataTransfer || !current.draft) { event.preventDefault(); return; }
          audition.cancel(); draggedTone = { id: timbre.id, draftId: current.draft.id }; event.dataTransfer.setData(TIMBRE_DRAG_TYPE, timbre.id); event.dataTransfer.effectAllowed = 'move';
          if (!deck) toneTrash.hidden = false;
          if (deck) setMiniToneDrag(event.dataTransfer, tile);
          if (options.onReorderTimbres) {
            const ids = deck ? [...tiles.children].map(card => (card as HTMLElement).dataset.timbreId!) : [...cards.keys()];
            const rectangles = ids.map(id => cards.get(id)!.getBoundingClientRect());
            order = { id: timbre.id, source: ids.indexOf(timbre.id), target: ids.indexOf(timbre.id), ids, rectangles, scrollTop: tiles.scrollTop };
            const rect = frame.getBoundingClientRect();
            if (!deck) event.dataTransfer.setDragImage?.(frame, Math.max(0, event.clientX - rect.left), Math.max(0, event.clientY - rect.top));
            frame.classList.add('is-library-dragging');
          }
        });
        frame.addEventListener('dragend', () => { if (library === dialog) endToneDrag(); }); cards.set(timbre.id, frame);
        if (!deck) tiles.append(frame);
      }
      if (deck) {
        updateDeckCards();
        deck.setCards([...cards.values()]);
      }
      if (!deck && options.onImportTimbre) {
        const add = button('+', 'melody-library-import', () => {
          if (disposed || library !== dialog || importing || !safeFlush()) return;
          importing = true; add.disabled = true; add.setAttribute('aria-busy', 'true'); error.hidden = true;
          void Promise.resolve().then(() => options.onImportTimbre!()).then(imported => {
            if (!imported || disposed || library !== dialog) return;
            category = '自定义';
            refresh(); notify();
          }).catch(reason => {
            if (disposed || library !== dialog) return;
            error.hidden = false; error.textContent = reason instanceof Error ? reason.message : String(reason);
          }).finally(() => {
            importing = false;
            if (!disposed && library === dialog) libraryRefresh?.();
          });
        });
        add.setAttribute('aria-label', '导入音色文件'); add.title = '导入音色文件'; add.disabled = importing;
        importControl = add; tiles.append(add);
      }
    };
    let closed = false;
    function cleanup() {
      if (closed) return; closed = true; toneDeleteDialog?.close();
      if (library === dialog) { library = undefined; libraryRefresh = undefined; libraryError = undefined; }
      toggleToneDeck = undefined;
      deck?.dispose();
      if (deck) stopToneCardFlights(main);
      tonePile?.classList.remove('is-library-spread');
      tonePile?.setAttribute('aria-expanded', 'false');
      tonePile?.setAttribute('aria-label', '添加音色');
      page.classList.remove('is-tone-library-open');
      endToneDrag(); resetToneOrder = undefined; audition.cancel(); page.append(toneTrash); dialog.remove();
    }
    function dismiss() { dialog.close(); cleanup(); }
    libraryRefresh();
    if (deckRow) dialog.append(deckRow, error);
    else dialog.append(heading, tools!, tiles, error, toneTrash);
    if (deck && options.editorSettings) dialog.addEventListener('cancel', event => {
      event.preventDefault(); options.editorSettings!.setOpen(true);
    });
    dialog.addEventListener('close', cleanup); (pointerUx ? main : root).append(dialog); dialog.showModal();
    deckRow?.focus({ preventScroll: true });
    deck?.resize();
    if (deck && tonePile) {
      tonePile.classList.add('is-library-spread');
      tonePile.setAttribute('aria-expanded', 'true');
      tonePile.setAttribute('aria-label', '收起音色库');
      page.classList.add('is-tone-library-open');
      toggleToneDeck = () => deck.toggle(tonePile, dismiss);
      deck.dealFrom(tonePile);
    }
  }
  const toneRemovalTarget: HTMLElement = tonePile ?? toneTrash;
  function endToneDrag(): void { resetToneOrder?.(); if (draggedTone) suppressLibraryClickUntil = Date.now() + 250; draggedTone = undefined; toneTrash.hidden = true; toneRemovalTarget.classList.remove('is-over'); }
  toneRemovalTarget.addEventListener('dragover', event => { if (!draggedTone) return; event.preventDefault(); toneRemovalTarget.classList.add('is-over'); if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'; });
  toneRemovalTarget.addEventListener('dragleave', () => toneRemovalTarget.classList.remove('is-over'));
  toneRemovalTarget.addEventListener('drop', event => {
    if (!draggedTone) return;
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
    const owner = library; const warning = createWorkspacePanel(pointerUx); warning.className += ' melody-tone-delete-dialog';
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
    (pointerUx ? library ?? main : root).append(warning); warning.showModal();
  }
  function positionPitch(key: HTMLButtonElement, row: HTMLElement, index: number): void {
    const start = melodyPitchTop(keys, index, view.rowHeight);
    const size = melodyPitchHeight(keys, index, view.rowHeight);
    if (!vertical) {
      key.style.top = row.style.top = `${start}px`;
      key.style.height = row.style.height = `${size}px`;
      return;
    }
    row.style.left = `${start}px`;
    row.style.width = `${size}px`;
    if (!pointerUx) {
      key.style.left = row.style.left;
      key.style.width = row.style.width;
      return;
    }
    if (keys[index]!.accidental) {
      key.style.left = `${start + size * .07}px`;
      key.style.width = `${size * .86}px`;
      return;
    }
    const before = keys[index - 1]?.accidental ? melodyPitchHeight(keys, index - 1, view.rowHeight) / 2 : 0;
    const after = keys[index + 1]?.accidental ? melodyPitchHeight(keys, index + 1, view.rowHeight) / 2 : 0;
    key.style.left = `${start - before}px`;
    key.style.width = `${size + before + after}px`;
    key.style.setProperty('--key-notch-left', `${before * .86}px`);
    key.style.setProperty('--key-notch-right', `${after * .86}px`);
  }
  function paintRows(): void {
    if (rhythm) {
      world.style.height = `${Math.max(1, visibleParts().length) * view.rowHeight + 52}px`; keyboard.replaceChildren(); rows.replaceChildren();
      visibleParts().forEach((voice, index) => { const row = node('div', 'melody-pitch-row rhythm-tone-row'); row.dataset.partId = voice.id; row.dataset.rowIndex = String(index); row.style.top = `${index * view.rowHeight}px`; row.style.height = `${view.rowHeight}px`; rows.append(row); });
      return;
    }
    const pitchLength = melodyPitchTop(keys, keys.length, view.rowHeight);
    world.style.height = vertical ? '100%' : `${pitchLength}px`; if (vertical) world.style.width = `${pitchLength}px`;
    if (pointerUx && pitchRows.length === keys.length) {
      keys.forEach((pitch, index) => {
        const key = keyNodes[index]!, row = pitchRows[index]!;
        positionPitch(key, row, index);
        if (/^C-?\d+$/u.test(pitch.label)) {
          const stacked = view.rowHeight < 22;
          if (key.classList.contains('is-stacked-label') !== stacked) {
            key.classList.toggle('is-stacked-label', stacked);
            key.textContent = stacked ? `C\n${pitch.label.slice(1)}` : pitch.label;
          }
        }
      });
      return;
    }
    keyboard.replaceChildren(); rows.replaceChildren();
    keyNodes.length = pitchRows.length = 0;
    keys.forEach((pitch, index) => {
      const octaveLabel = /^C(-?\d+)$/u.exec(pitch.label);
      const key = button(vertical ? octaveLabel ? pitch.label : '' : pitch.label, 'melody-key', event => {
        if (disposed || drumKey(part()) !== undefined || performance.now() < suppressKeyClickUntil) return;
        if (!pointerUx) void audition.requestKeyboard(pitch.frequencyHz);
        else if (!event.detail) auditionColumn(pitch.frequencyHz);
      });
      key.dataset.pitchLabel = pitch.label;
      if (vertical && octaveLabel && view.rowHeight < 22) { key.textContent = `C\n${octaveLabel[1]}`; key.classList.add('is-stacked-label'); }
      key.classList.toggle('is-accidental', pitch.accidental);
      key.dataset.frequencyHz = String(pitch.frequencyHz);
      key.setAttribute('aria-label', `${pitch.label} ${Number(pitch.frequencyHz.toFixed(2))} Hz`);
      keyNodes.push(key);
      const flash = soundingKeys.get(index);
      if (flash !== undefined) { key.style.setProperty('--key-flash-color', flash); key.classList.add('is-sounding'); }
      keyboard.append(key);
      const row = node('div', 'melody-pitch-row'); row.classList.toggle('is-accidental', pitch.accidental);
      positionPitch(key, row, index); rows.append(row);
      pitchRows.push(row);
      if (index === auditionPitch) {
        key.classList.add('is-auditioning');
        row.classList.add('is-auditioning');
      }
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
      const title = `${key.dataset.pitchLabel ?? ''}${active ? ' · 键盘输入音区 · Z / X 切换' : ''}`;
      if (key.title !== title) key.title = title;
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
  function currentRollRegion(score: PhraseBody, zooming = false): RollPaintRegion {
    const span = 8 / view.zoom, duration = melodyDuration(score);
    const pitch = pitchOffset();
    const enoughPitch = rollRegion && pitch >= rollRegion.lowPitch && pitch + rollPitchWidth <= rollRegion.highPitch;
    if (rollRegion?.duration === duration && rollRegion.zoom === view.zoom && rollRegion.rowHeight === view.rowHeight && enoughPitch
      && Math.max(0, view.leftSeconds) >= rollRegion.start && (rollRegion.end >= duration || view.leftSeconds + span <= rollRegion.end - span * .2)) return rollRegion;

    const noteCount = score.parts.reduce((sum, voice) => sum + voice.notes.length, 0);
    const fullScore = duration <= 3 * span && noteCount <= 2400;
    const stride = span * .5;
    const denseZoom = zooming && noteCount > 2400;
    const start = fullScore ? 0 : Math.max(0, denseZoom ? view.leftSeconds - span * .12 : Math.floor(view.leftSeconds / stride) * stride - stride);
    const notesPerScreen = noteCount * span / Math.max(span, duration);
    const screens = melodyClamp(1050 / Math.max(1, notesPerScreen), 2.25, 5);
    const end = fullScore ? duration : Math.max(start + stride, Math.min(duration, denseZoom ? view.leftSeconds + span * 1.28 : start + screens * span));
    const pitchStride = Math.max(1, rollPitchWidth * .5);
    const lowPitch = noteCount <= 2400 ? -Infinity : denseZoom ? pitch - pitchStride * .35 : Math.floor(pitch / pitchStride) * pitchStride - pitchStride;
    const highPitch = noteCount <= 2400 ? Infinity : denseZoom ? pitch + rollPitchWidth + pitchStride * .35 : lowPitch + pitchStride * 5;
    const origin = fullScore ? 0 : Math.floor(start / (span * 32)) * span * 32;
    return rollRegion = { start, end, origin, lowPitch, highPitch, zoom: view.zoom, rowHeight: view.rowHeight, duration };
  }
  function moveRollLayers(): void {
    const offset = rollRegion ? (rollRegion.origin - view.leftSeconds) * melodyScale(view, headWidth, rollRegion.duration) : 0;
    if (offset === layerOffset) return;
    layerOffset = offset;
    const translate = offset ? `0 ${offset}px` : '';
    for (const layer of [grid, notes, drumGrid, drumNotes]) layer.style.translate = translate;
    scheduleNoteHighlights();
  }
  function paintRollOverlays(value: PhraseBody, canvasWidth: number): void {
    const duration = melodyDuration(value);
    const scale = melodyScale(view, canvasWidth, duration);
    tempoRolls?.paint(value, { scale, height: canvasWidth });
    const endX = (duration - view.leftSeconds) * scale;
    const hidden = endX > canvasWidth;
    if (afterEnd.hidden !== hidden) afterEnd.hidden = hidden;
    if (drumEnd.hidden !== hidden) drumEnd.hidden = hidden;
    if (hidden) return;
    const offset = `${Math.max(0, endX)}px`;
    if (vertical) {
      if (afterEnd.style.top !== offset) afterEnd.style.top = offset;
      if (drumEnd.style.top !== offset) drumEnd.style.top = offset;
    } else if (afterEnd.style.left !== offset) afterEnd.style.left = offset;
  }
  function paintGrid(zooming = false): void {
    const value = tempoRatePreview ?? body();
    if (!value) {
      tempoRolls?.paint(value);
      drawnGrid = ''; rollRegion = drawnNotes = undefined; drawnNoteBody = undefined; retainedGridLines.clear(); moveRollLayers();
      grid.replaceChildren(); drumGrid.replaceChildren(); gridNodes.length = drumGridNodes.length = 0; gridSnapTimes = [];
      return;
    }
    // Read layout before changing any lines. Reading clientWidth after each
    // append/style write otherwise forces a fresh layout for every grid line.
    const cachedSize = pointerUx && zooming && rollPitchWidth > 0;
    const canvasWidth = cachedSize ? headWidth : width(); headWidth = canvasWidth;
    const duration = melodyDuration(value); const scale = melodyScale(view, canvasWidth, duration);
    const detailPixels = revealConfiguredGrid ? 0 : 48;
    const pixelRatio = window.devicePixelRatio || 1;
    const pixelScale = pixelRatio / Math.max(1, Math.round(pixelRatio));
    let region: RollPaintRegion | undefined;
    if (pointerUx) {
      const nextPitchWidth = cachedSize ? rollPitchWidth : pitchSpan();
      if (nextPitchWidth !== rollPitchWidth) { rollPitchWidth = nextPitchWidth; rollRegion = undefined; }
      region = currentRollRegion(body() ?? value, zooming);
      moveRollLayers();
    }
    paintRollOverlays(value, canvasWidth);
    const paintView = region ? { ...view, leftSeconds: region.start } : view;
    const paintSeconds = region ? region.end - region.start : 8 / view.zoom;
    const tempo = vertical ? value.tempoBpm : options.gridBpm();
    const steps = phraseStepsPerBeat(value), beatsPerBar = phraseBarBeats(value), beatSize = phraseMeterBeatLength(value);
    if (region) {
      const key = JSON.stringify([region.start, region.end, region.origin, scale, pixelScale, tempo, steps, beatsPerBar, beatSize,
        duration, detailPixels, value.pickupBeats, value.tempoSections, drumStrip.hidden]);
      if (key === drawnGrid) return;
      drawnGrid = key;
    }
    const lines = value.tempoSections?.length ? melodyScoreGrid(value, paintView, canvasWidth, detailPixels, paintSeconds)
      : melodyDetailGrid(duration, tempo, steps, paintView, canvasWidth, beatsPerBar, value.pickupBeats ?? 0, detailPixels, beatSize, paintSeconds);
    const pixels = new Map<number, (typeof lines)[number]>();
    const weight = (line: (typeof lines)[number]) => line.bar ? 3 : line.beat ? 2 : 1;
    for (const line of lines) {
      const relative = (line.seconds - paintView.leftSeconds) * scale * pixelScale;
      if (region ? relative < -.51 || relative > paintSeconds * scale * pixelScale + .51
        : Math.round(relative) < 0 || Math.round(relative) >= canvasWidth * pixelScale) continue;
      const pixel = Math.round((line.seconds - (region?.origin ?? paintView.leftSeconds)) * scale * pixelScale);
      const previous = pixels.get(pixel);
      if (!previous || weight(line) > weight(previous)) pixels.set(pixel, line);
    }
    gridSnapTimes = Array.from(pixels.values(), line => line.seconds).sort((a, b) => a - b);
    const grids = drumStrip.hidden ? [[grid, gridNodes] as const] : [[grid, gridNodes] as const, [drumGrid, drumGridNodes] as const];
    for (const [layer, elements] of grids) {
      layer.style.setProperty('--melody-grid-stroke', `${1 / pixelScale}px`);
      if (region) {
        updateRetainedGrid(layer, pixels, pixelScale);
        continue;
      }
      let index = 0;
      for (const [pixel, line] of pixels) {
        let element = elements[index++];
        if (!element) { element = node('i', 'melody-grid-line'); elements.push(element); layer.append(element); }
        element.classList.toggle('is-beat', line.beat || line.bar);
        element.classList.toggle('is-bar', line.bar);
        element.classList.toggle('is-cell', line.cell);
        element.style[vertical ? 'top' : 'left'] = `${pixel / pixelScale}px`;
      }
      while (elements.length > index) elements.pop()!.remove();
    }
  }
  function updateRetainedGrid(layer: HTMLElement, pixels: Map<number, { beat: boolean; bar: boolean; cell: boolean }>, pixelScale: number): void {
    let retained = retainedGridLines.get(layer);
    if (!retained) { retained = new Map(); retainedGridLines.set(layer, retained); }
    for (const [pixel, element] of retained) {
      if (!pixels.has(pixel)) { element.remove(); retained.delete(pixel); }
    }
    for (const [pixel, line] of pixels) {
      let element = retained.get(pixel);
      if (!element) { element = node('i', 'melody-grid-line'); layer.append(element); retained.set(pixel, element); }
      const classes = `melody-grid-line${line.beat || line.bar ? ' is-beat' : ''}${line.cell ? ' is-cell' : ''}`;
      if (element.className !== classes) element.className = classes;
      const top = `${pixel / pixelScale}px`;
      if (element.style.top !== top) element.style.top = top;
    }
  }
  function paintNotes(onlyNoteId?: string, updateHead = true, committed = false, retainGeometry = false): void {
    const activeEdit = mix ?? (gesture && 'note' in gesture ? gesture : wheelEdit);
    // During one-note gestures the rest of the score does not need copying.
    const value = onlyNoteId || gainPartId ? body() : displayedBody(); const seen = new Set<string>();
    if (!value || !viewportReady) return;
    const region = pointerUx ? rollRegion : undefined;
    const canvasWidth = region ? headWidth : width(); headWidth = canvasWidth;
    const pitchStart = region?.lowPitch ?? pitchOffset() - view.rowHeight;
    const pitchEnd = region?.highPitch ?? pitchStart + pitchSpan() + 2 * view.rowHeight;
    const timeStart = region?.start ?? view.leftSeconds, timeEnd = region?.end ?? view.leftSeconds + 8 / view.zoom;
    const originShift = (view.leftSeconds - (region?.origin ?? timeStart)) * melodyScale(view, canvasWidth, melodyDuration(value));
    const rowParts = rhythm ? visibleParts(value) : [];
    const rhythmRows = rhythm ? new Map(rowParts.map((part, index) => [part.id, index])) : undefined;
    const editingFamily = editingFamilyId();
    const selectedTimbreId = editingFamily ? part(editingFamily)?.timbreId : undefined;
    const active = gesture;
    const workbench = workbenchEnabled();
    const appearanceKey = region && !activeEdit && !active ? [canvasWidth, view.zoom, view.rowHeight, pointerUx ? undefined : editingFamily, selection?.noteId, gainPartId, visibleDrumLanes, drumLaneWidth, workbench].join('/') : '';
    const reuseGeometry = !!appearanceKey && (drawnNoteBody === value || retainGeometry) && drawnNotes && drawnNotes.origin === region?.origin
      && drawnNotes.zoom === view.zoom && drawnNotes.rowHeight === view.rowHeight && drawnNoteWidth === canvasWidth;
    const reuseNotes = reuseGeometry && drawnNoteBody === value && drawnNoteAppearance === appearanceKey;
    const originalDragRow = rhythm && active?.kind === 'note'
      ? visibleParts(active.base).findIndex(part => part.id === active.partId) : undefined;
    if (indexedBody !== value) { indexedBody = value; noteIndex = createMelodyNoteIndex(value, sectionParts(value)); }
    let candidates = onlyNoteId ? [noteIndex!.byId.get(onlyNoteId)].filter((entry): entry is NonNullable<typeof entry> => !!entry)
      : noteIndex!.visible(timeStart, timeEnd);
    if (onlyNoteId && activeEdit && activeEdit.note.id === onlyNoteId) {
      const voice = part('targetPartId' in activeEdit && activeEdit.targetPartId || activeEdit.partId);
      if (voice) candidates = [{ voice, note: { ...activeEdit.note, ...activeEdit.changes }, start: 0, end: 0 }];
    } else if (!onlyNoteId && wheelEdit) {
      const editing = wheelEdit;
      candidates = candidates.filter(entry => entry.note.id !== editing.note.id);
      const voice = part(editing.partId);
      if (!editing.remove && voice) {
        const note = { ...editing.note, ...editing.changes };
        const start = melodySeconds(note.startBeat, value);
        candidates.push({ voice, note, start, end: start + phraseHeldSeconds(value, note) });
      }
    }
    if (!onlyNoteId && selection?.noteId && selection.noteId !== wheelEdit?.note.id && !candidates.some(entry => entry.note.id === selection?.noteId)) {
      const selected = noteIndex!.byId.get(selection.noteId); if (selected) candidates.push(selected);
    }
    for (const { voice, note, start, end } of candidates) {
      if (gainPartId && voice.id !== gainPartId) continue;
      // Dragging/mixing changes one note. Leave every unrelated DOM block
      // untouched, including its position, color and selection classes.
      if (note.startBeat >= value!.lengthBeats || note.startBeat + note.durationBeats <= 0 || (active?.kind === 'erase' && active.refs.has(note.id) || desktopErase?.refs.has(note.id))) continue;
      const key = drumKey(voice);
      const lane = key === undefined ? undefined : drumLane(note, key);
      if (lane !== undefined && lane >= visibleDrumLanes) continue;
      const row = lane === undefined ? pitchRow(note.frequencyHz) : -1;
      if ((!onlyNoteId || committed) && note.id !== selection?.noteId && !(active && 'note' in active && active.note.id === note.id)) {
        if (start > timeEnd || end < timeStart) continue;
        // Keep one pitch of overscan; selected/dragged notes remain mounted.
        const top = rhythm ? (rhythmRows!.get(voice.id) ?? 0) * view.rowHeight : row * view.rowHeight;
        if (lane === undefined && (top > pitchEnd || top + view.rowHeight < pitchStart)) continue;
      }
      seen.add(note.id); let block = noteNodes.get(note.id);
      if (block && reuseNotes && !onlyNoteId) continue;
      const updateGeometry = !block || !reuseGeometry || !!onlyNoteId || lane !== undefined && !reuseNotes;
      if (!block) {
        block = button('', 'melody-note', () => {}); block.append(node('span', 'melody-note-resize'));
        block.classList.toggle('is-sounding', sounding.has(note.id));
        noteNodes.set(note.id, block);
      }
      const layer = noteLayer(lane === undefined ? notes : drumNotes, voice.id);
      if (block.parentElement !== layer) layer.append(block);
      const name = partLabel(voice);
      const label = lane !== undefined ? `${name} · 打击 ${lane + 1}` : rhythm ? name : `${name} ${keys[row]?.label ?? ''}`;
      const labelKey = JSON.stringify([note.id, voice.id, label]);
      if (noteLabels.get(block) !== labelKey) {
        block.dataset.noteId = note.id; block.dataset.partId = voice.id; block.setAttribute('aria-label', label);
        noteLabels.set(block, labelKey);
      }
      if (updateGeometry) {
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
        const timePosition = rect.x + originShift;
        if (pointerUx) noteRects.set(block, { x: top, y: timePosition, width: rect.height, height: rect.width });
        const left = `${vertical ? top : timePosition}px`, y = `${vertical ? timePosition : top}px`;
        const width = `${vertical ? rect.height : rect.width}px`, height = `${vertical ? rect.width : rect.height}px`;
        if (block.style.left !== left) block.style.left = left;
        if (block.style.top !== y) block.style.top = y;
        if (block.style.width !== width) block.style.width = width;
        if (block.style.height !== height) block.style.height = height;
      }
      const color = voice.unassigned ? unassignedColor : toneColor(voice.timbreId);
      const inactive = !pointerUx && !!editingFamily && selection?.noteId !== note.id && (rhythm ? selectedTimbreId !== voice.timbreId : editingFamily !== voice.id);
      const drawing = active?.kind === 'create' && active.note.id === note.id;
      const selected = (!vertical || workbench) && (selection?.noteId === note.id || drawing);
      const dragging = !!active && 'note' in active && active.note.id === note.id && (active.dragReadyAt === undefined || active.moved);
      const appearance = `${color}/${!!voice.unassigned}/${inactive}/${selected}/${dragging}/${drawing}`;
      if (noteAppearance.get(block) !== appearance) {
        block.style.setProperty('--tone-color', color); block.classList.toggle('is-unassigned', !!voice.unassigned);
        if (!pointerUx) {
          block.classList.toggle('is-dim', inactive); block.setAttribute('aria-disabled', String(inactive)); block.tabIndex = inactive ? -1 : 0;
        }
        block.classList.toggle('is-selected', selected); block.classList.toggle('is-dragging', dragging); block.classList.toggle('is-drawing', drawing);
        noteAppearance.set(block, appearance);
      }
    }
    if (!onlyNoteId) {
      drawnNoteAppearance = appearanceKey;
      drawnNoteWidth = appearanceKey ? canvasWidth : 0;
      drawnNotes = region;
      drawnNoteBody = value;
      for (const [id, element] of noteNodes) if (!seen.has(id)) { element.remove(); noteNodes.delete(id); }
      lastSoundingNotes = undefined;
    } else if (committed && !seen.has(onlyNoteId)) {
      noteNodes.get(onlyNoteId)?.remove();
      noteNodes.delete(onlyNoteId);
    }
    for (const layers of noteLayers.values()) for (const [id, layer] of layers) {
      if (!layer.children.length) { layer.remove(); layers.delete(id); }
    }
    scheduleNoteHighlights();
    if (updateHead) positionHead();
  }
  function positionHead(displaySeconds = pointerUx && playheadPlaying ? displayedPlayheadSeconds : playheadSeconds): void {
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
    const pixel = melodyClamp((visualPosition - view.leftSeconds) * scale, 0, headWidth - 1);
    const coordinate = pointerUx ? Math.round(pixel * 1000) / 1000 : pixel;
    // Compositor translation avoids relayout on every audio-clock frame.
    const axis = vertical ? 'translateY' : 'translateX';
    if (!hidden) {
      const transform = `${axis}(${coordinate}px)`;
      if (head.style.transform !== transform) head.style.transform = transform;
      if (!drumStrip.hidden && drumHead.style.transform !== transform) drumHead.style.transform = transform;
      const handleTransform = `${axis}(${coordinate - 7}px)`;
      if (headHandle.style.transform !== handleTransform) headHandle.style.transform = handleTransform;
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
        const timeTransform = coordinate < 19 ? `translateY(${coordinate + 4}px)` : `translateY(calc(${coordinate}px - 100% - 3px))`;
        if (headTime.style.transform !== timeTransform) headTime.style.transform = timeTransform;
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
      if (gainCurve && !voice.unassigned) {
        const editCurve = button('演奏曲线', 'melody-edit-gain-curve', () => {
          if (gainPartId) setGainMode();
          else if (safeFlush()) setGainMode(voice.id);
        });
        editCurve.setAttribute('aria-pressed', String(!!gainPartId)); console.append(editCurve);
      }
      if (gainPartId) { console.hidden = true; page.classList.remove('has-workbench'); return; }
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
        input.addEventListener('change', () => { if (!safeFlush()) return; try { phrase.setPartMix(voice.id, { [property]: Number(input.value) }); refreshNoteEdit([voice.id]); notify(true); } catch (error) { report(String(error)); } });
        field(label, input, output);
      }
      if (rhythm) paintShelf(); return;
    }
    slider('音量', 'level', note.level ?? 1, 0); slider('声像', 'pan', note.pan ?? 0, -1);
    if (vertical) {
      if (!pointerUx) numberField('发音时间 / 秒', phraseHeldSeconds(body()!, note), 'durationBeats');
      return;
    }
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
  function refreshNoteEdit(affectedParts: readonly string[], noteIds?: readonly string[], edited?: PhraseView): void {
    const oldBody = body();
    const snapshot = edited ?? readEditor();
    if (!pointerUx || !oldBody || affectedParts.some(id => drumKey(part(id)) !== undefined)) { refresh(snapshot); return; }
    const previous = visibleParts().map(voice => voice.id);
    const next = visibleParts(snapshot.body).map(voice => voice.id);
    if (!snapshot.body || previous.length !== next.length || previous.some((id, index) => id !== next[index])
      || selection?.noteId || editingFamilyId() !== playbackFamilyId || current.draft?.id !== snapshot.draft?.id) { refresh(snapshot); return; }
    current = snapshot;
    if (!edited) phrase.prepareDraftNoteEdit?.();
    audition.sync(current);
    let patched = !!(noteIds && noteIndex && indexedBody === oldBody && drawnNoteBody === oldBody && !tempoPreview && !gesture);
    if (patched) {
      const updated = new Map<string, { voice: PhrasePart; note: PhraseNote }>();
      const ids = new Set(noteIds);
      for (const voice of sectionParts(snapshot.body)) {
        if (affectedParts.includes(voice.id)) for (const note of voice.notes) if (ids.has(note.id)) updated.set(note.id, { voice, note });
      }
      patched = noteIds!.every(id => {
        const entry = updated.get(id);
        return noteIndex!.replace(snapshot.body!, id, entry?.voice, entry?.note);
      });
    }
    if (patched) {
      indexedBody = drawnNoteBody = snapshot.body;
      for (const id of noteIds!) paintNotes(id, false, true);
      if (!playheadPlaying && !edited) positionHead();
    } else paintNotes(undefined, !playheadPlaying);
    if (!patched) paintConsole();
    persistWorkspace();
  }
  function refresh(snapshot?: PhraseView, refreshLibrary = true, cardEdit?: 'empty' | 'rebind'): void {
    if (disposed) return;
    if (vertical && !workbenchEnabled() && selection?.noteId) selection = undefined;
    const previous = part(), previousColors = toneColors, oldBody = drawnNoteBody, previousDrumLanes = visibleDrumLanes;
    const previousDrumKeys = cardEdit === 'rebind' ? new Map(drumKeys) : undefined;
    current = snapshot ?? readEditor();
    const next = body();
    if (pointerUx && next) phrase.prepareDraftNoteEdit?.();
    if (toneDeleteDialog && current.draft?.id !== toneDeleteDraftId) toneDeleteDialog.close();
    // The view already contains project-scoped sound names. Re-listing the
    // complete project here re-read/validated the same records on every edit.
    toneNames = new Map(current.availableSounds.map(record => [record.id, record.name] as const));
    if (instrumentIcons) instrumentKeys = new Map(current.availableSounds.flatMap(record => {
      const key = defaultInstrumentInfo(record.id, record.body)?.key;
      return key ? [[record.id, key] as const] : [];
    }));
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
    toneColors = buildPhraseToneColors(next?.parts.map(value => value.timbreId) ?? [], windowsPalette);
    if (gainPartId && (!part(gainPartId) || !workbenchEnabled())) { gainCurve?.finish(false); setGainMode(); }
    if (next) view = clampView(view, melodyDuration(next));
    audition.sync(current); paintShelf(); syncDrumStrip();
    if (rhythm) paintRows();
    const retainGeometry = pointerUx && cardEdit && next && oldBody && oldBody === indexedBody && noteIndex && drawnNotes === rollRegion
      && !viewportFrame && !gainPartId && !selection?.noteId && visibleDrumLanes === previousDrumLanes
      && next.parts.filter(voice => voice.notes.length).every(voice => {
        const before = oldBody.parts.find(part => part.id === voice.id);
        if (cardEdit === 'empty') return before === voice;
        return before?.notes === voice.notes && previousDrumKeys?.get(before.timbreId) === drumKeys.get(voice.timbreId);
      });
    if (retainGeometry && cardEdit === 'empty' && next.parts.every(voice => !voice.notes.length
      || previousColors.get(voice.timbreId) === toneColors.get(voice.timbreId))) indexedBody = drawnNoteBody = next;
    else {
      drawnNoteAppearance = '';
      if (!retainGeometry) paintGrid();
      paintNotes(undefined, true, false, !!retainGeometry);
    }
    gainCurve?.paint(); if (!mix) paintConsole();
    extend.disabled = !next || next.lengthBeats + phraseBarBeats(next) * (vertical ? 4 : 1) > MAX_PHRASE_BEATS;
    extend.title = extend.disabled ? '已达当前长度上限' : vertical ? '新增钢琴卷帘' : '增加一个小节';
    if (refreshLibrary) libraryRefresh?.();
    reportViewport(); persistWorkspace();
  }
  function deleteToneNotes(): void {
    if (!safeFlush()) return; const voice = part(); if (!voice) return;
    try {
      phrase.removePart(voice.id); addedParts.delete(voice.id); deleteToneArmed = undefined; refresh(); notify();
    } catch (error) { report(error instanceof Error ? error.message : String(error)); }
  }
  function closeCardMenu(restoreFocus = false): void {
    const target = cardMenuTarget;
    if (!target) return;
    cardMenuTarget = undefined; cardMenu.hidden = true;
    if (restoreFocus) target.card.focus({ preventScroll: true });
  }
  function dismissCardMenu(event: Event): void {
    if (cardMenuTarget && !cardMenu.contains(event.target as Node)) closeCardMenu();
  }
  function requestRemoveFamily(id: string, fromCardMenu = false): void {
    if (disposed || toneDeleteDialog || !safeFlush()) return;
    const voice = part(id); if (!voice) return;
    const noteCount = voice.notes.length + (voice.hiddenNotes?.length ?? 0);
    const remove = () => {
      try {
        phrase.removePart(id); addedParts.delete(id); deleteToneArmed = undefined;
        refresh(undefined, true, noteCount === 0 ? 'empty' : undefined); notify();
      } catch(error) { report(error instanceof Error ? error.message : String(error)); }
    };
    if (!noteCount && (pointerUx || !fromCardMenu)) { remove(); return; }
    const draftId=current.draft!.id, warning=createWorkspacePanel(pointerUx); warning.className += ' melody-tone-delete-dialog';
    toneDeleteDialog=warning; toneDeleteDraftId=draftId;
    const question = fromCardMenu ? '删除这张音色卡？' : '移除这组音符？';
    warning.setAttribute('aria-label', question);
    warning.append(node('h2','',question),node('p','',fromCardMenu
      ? `将删除“${partLabel(voice)}”及其全部音符。`
      : `“${partLabel(voice)}”和其中的 ${noteCount} 个音符将一起移除。`));
    const actions=node('div','melody-tone-delete-actions');
    const cancelRemoval = button('取消','melody-tone-delete-cancel',()=>warning.close());
    actions.append(cancelRemoval,button(fromCardMenu ? '删除' : '移除','melody-tone-delete-confirm',()=>{
      warning.close();
      if (!disposed && readEditor().draft?.id === draftId) {
        remove();
        if (fromCardMenu) scroll.focus({ preventScroll: true });
      }
    }));
    warning.append(actions); warning.addEventListener('close',()=>{if(toneDeleteDialog===warning){toneDeleteDialog=undefined;toneDeleteDraftId=undefined;}warning.remove();}); (pointerUx ? main : root).append(warning);warning.showModal();
    cancelRemoval.focus({ preventScroll: true });
  }
  function extendMeasure(): void {
    if (disposed || library || !safeFlush()) return; const value = body(); if (!value || value.lengthBeats >= MAX_PHRASE_BEATS) return;
    if (vertical) { tempoRolls?.addRoll(); return; }
    try {
      const length = Math.min(MAX_PHRASE_BEATS, value.lengthBeats + phraseBarBeats(value)); phrase.setLength(length);
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
    active.moved ||= Math.abs(delta) >= 4;
    active.seconds = melodyTimeAt(view, headWidth, melodyDuration(active.base), active.from.x + delta);
    positionHead();
  }
  function begin(event: PointerEvent, headGesture = false, mouseButton = event.button, target = event.target as HTMLElement): void {
    const pendingToneHit = pointerUx && noteLayerSelection !== editingFamilyId();
    if (zoomBounds || pendingToneHit) {
      if (zoomBounds) paintViewport();
      if (pendingToneHit) syncNoteLayers();
      target = (document.elementFromPoint?.(event.clientX, event.clientY) as HTMLElement | null) ?? target;
    }
    const curvePan = !!gainPartId && !headGesture && mouseButton === 0 && !!gainCurve?.layer.contains(target);
    if (gainPartId && !headGesture && !curvePan) return;
    const inDrumStrip = !drumStrip.hidden && drumCanvas.contains(target);
    const touchRight = event.pointerType === 'touch' && mouseButton === 0 && !headGesture && (canvas.contains(target) || inDrumStrip)
      && !!options.mobileTouch?.readRightButton();
    const button = touchRight ? 2 : mouseButton;
    if (disposed || (pointerUx ? pointerOverlayOpen(true, false) : library) || (button !== 0 && button !== 1 && button !== 2)) return;
    const mode = options.readLessonInput?.() ?? 'edit';
    const hitNote = target.closest<HTMLElement>('.melody-note');
    const dimmed = !headGesture && !!hitNote && noteDimmed(hitNote);
    const block = (vertical && dimmed) || (button === 0 && hitNote?.dataset.noteId && desktopErase?.refs.has(hitNote.dataset.noteId)) ? undefined : hitNote;
    if (mode === 'locked' || (!touchRight && ((mode !== 'edit' && block) || (mode === 'pan' && button !== 0)))) return;
    if (dimmed && !vertical) { event.preventDefault(); event.stopPropagation(); return; }
    if (pointerUx && event.pointerType === 'mouse' && button === 1) {
      stopRollPointer();
      const position = rollPanVector(event.clientX, event.clientY);
      setPanMode(panMode !== 'off' ? 'off' : position.x || position.y ? 'waiting' : 'ready');
      return;
    }
    const key = target.closest<HTMLElement>('.melody-key');
    if (key && !headGesture) {
      if (vertical && !(pointerUx && event.pointerType === 'mouse') && button === 0 && safeFlush()) {
        event.preventDefault(); keyPan = { id: event.pointerId, capture: key, fromX: event.clientX, offset: pitchOffset(), moved: false };
        key.setPointerCapture?.(event.pointerId);
      }
      return;
    }
    const desktopCanvas = pointerUx && event.pointerType === 'mouse' && !headGesture && !curvePan && (canvas.contains(target) || inDrumStrip);
    if (pointerUx && event.pointerType === 'mouse') suspendRollPointer();
    if (desktopCanvas && button === 2) {
      beginDesktopErase(event, block ?? undefined, !hitNote ? inDrumStrip ? RHYTHM_PITCH : pitchAt(event) : undefined);
      return;
    }
    if (!desktopCanvas) event.preventDefault();
    if (!safeFlush()) return; const value = body(); if (!value) return; scroll.focus({ preventScroll: true }); panMoved = false;
    const from = point(event);
    const desktopClick = desktopCanvas && button === 0 ? true : undefined;
    const capture = desktopCanvas && desktopErase ? desktopErase.capture
      : curvePan ? gainCurve!.layer : inDrumStrip ? drumCanvas : headGesture && ruler.contains(target) ? ruler : scroll;
    const base = { id: event.pointerId, capture, base: value, draftId: current.draft!.id, from, last: from, clientFrom: { x: event.clientX, y: event.clientY }, desktopClick, button };
    if (tempoRolls && !headGesture && button === 0 && (canvas.contains(target) || inDrumStrip) && from.x >= 0 && from.x < width()) {
      tempoRolls.selectAt(melodyTimeAt(view, width(), melodyDuration(value), from.x));
    }
    if (headGesture) {
      gesture = { ...base, kind: 'head', seconds: playheadSeconds, fromRuler: ruler.contains(target), moved: false };
      capture.setPointerCapture?.(event.pointerId);
      moveHead(gesture, event);
      return;
    }
    else if (button === 2) {
      if (vertical) {
        const refs = new Map<string, { partId: string; noteId: string }>();
        const familyId = editingFamilyId();
        const noteId = block?.dataset.noteId, partId = block?.dataset.partId;
        if (noteId && partId && (!familyId || partId === familyId)) refs.set(noteId, { partId, noteId });
        gesture = { ...base, kind: 'erase', refs, moved: false, familyId, touchRight };
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
    else if (curvePan || button === 1 || desktopClick && !block || !desktopClick && (event.altKey || !block && !editingFamilyId())) gesture = { ...base, kind: 'pan', lastClient: { x: event.clientX, y: event.clientY } };
    else {
      const voice = block ? part(block.dataset.partId) : rhythm ? visibleParts(value)[Math.floor(from.y / view.rowHeight)] : part(); const note = voice?.notes.find(item => item.id === block?.dataset.noteId);
      const drum = drumKey(voice);
      if (block && voice && note) {
        if (!desktopClick && (!vertical || workbenchEnabled())) { selection = { partId: voice.id, noteId: note.id }; entryToneId = undefined; audition.sync(current); }
        const bounds = pointerUx ? undefined : block.getBoundingClientRect();
        const resizing = !!bounds && drum === undefined && (!!target.closest('.melody-note-resize')
          || (vertical ? event.clientY >= bounds.bottom - Math.min(7, bounds.height * .25) : event.clientX >= bounds.right - Math.min(7, bounds.width * .25)));
        const dragReadyAt = !desktopClick && vertical && event.pointerType === 'mouse' ? event.timeStamp + NOTE_DRAG_HOLD_MS : undefined;
        const auditionOnClick = !desktopClick && (dragReadyAt !== undefined || options.readIsPlaying?.() === true);
        gesture = { ...base, kind: resizing ? 'resize' : 'note', partId: voice.id, note, changes: {}, rawY: 0, moved: false, auditionOnClick,
          drumLane: drum === undefined ? undefined : drumLane(note, drum), touchDrag: vertical && !!options.mobileTouch && event.pointerType === 'touch', dragReadyAt };
        if (!auditionOnClick && !desktopClick) void audition.requestNote(voice.id, note, value);
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
        const seconds = inDrumStrip ? DRUM_HIT_SECONDS : noteLengths.get(voice.id) ?? 60 / phraseTempoAtBeat(value, start) * phraseMeterBeatLength(value) / editSteps(value, start);
        const note: PhraseNote = { id: crypto.randomUUID(), startBeat: start, durationBeats: Math.min(limit - start, phraseHeldBeats(value, start, seconds)),
          durationSeconds: seconds, frequencyHz, velocity: .75, ...(lane === undefined ? {} : { drumLane: lane }) };
        gesture = { ...base, kind: 'create', partId: voice.id, note, changes: {}, rawY: 0, moved: false, drumLane: lane };
      }
    }
    if (gesture) gesture.capture.setPointerCapture?.(event.pointerId);
    if (gesture?.kind === 'create') paintNotes(gesture.note.id);
    else if (!desktopClick) { paintShelf(); paintNotes(); paintConsole(); } persistWorkspace();
  }
  function beginDesktopErase(event: PointerEvent, block: HTMLElement | undefined, tapPitch: number | undefined): void {
    if (desktopErase || pointerOverlayOpen(true, false) || finishWheelEdit()) return;
    const base = body(), draftId = current.draft?.id;
    if (!base || !draftId) return;
    const from = point(event), familyId = editingFamilyId();
    const refs = new Map<string, { partId: string; noteId: string }>();
    const partId = block?.dataset.partId, noteId = block?.dataset.noteId;
    const leftNote = gesture && 'note' in gesture ? gesture.note.id : undefined;
    if (noteId && noteId !== leftNote && partId && (!familyId || familyId === partId)) refs.set(noteId, { partId, noteId });
    const capture = gesture?.capture ?? scroll;
    desktopErase = { kind: 'erase', id: event.pointerId, capture, base, draftId, from, last: from,
      clientFrom: { x: event.clientX, y: event.clientY }, refs, moved: false, familyId, tapPitch, button: 2 };
    document.addEventListener('pointerrawupdate', eraseRaw);
    if (refs.size) paintNotes();
  }
  function finishDesktopErase(commit: boolean, event?: PointerEvent): void {
    const active = desktopErase;
    if (!active) return;
    if (event) erasePath(active, event);
    desktopErase = undefined;
    document.removeEventListener('pointerrawupdate', eraseRaw);
    cancelAnimationFrame(eraseFrame); eraseFrame = 0;
    if (!gesture && active.capture.hasPointerCapture?.(active.id)) active.capture.releasePointerCapture(active.id);
    if (commit && current.draft?.id === active.draftId) {
      const editingNote = gesture && 'note' in gesture ? gesture.note.id : undefined;
      const removals = Array.from(active.refs.values()).filter(ref => ref.noteId !== editingNote);
      if (removals.length) {
        try {
          phrase.removeNotes(removals);
          if (selection?.noteId && active.refs.has(selection.noteId) && selection.noteId !== editingNote) selection = { partId: selection.partId };
          refreshNoteEdit([...new Set(removals.map(ref => ref.partId))], removals.map(ref => ref.noteId)); notify(true); options.onLearningAction?.('delete-note');
          return;
        } catch (error) { report(error instanceof Error ? error.message : String(error)); }
      } else if (!active.refs.size && !active.moved && active.tapPitch !== undefined) auditionColumn(active.tapPitch);
    }
    if (active.refs.size) paintNotes();
  }
  function erase(from: Point, to: Point, active = gesture): void {
    if (!active || active.kind !== 'erase') return;
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
        if ((active.familyId && voice.id !== active.familyId) || active.refs.has(note.id) || note.startBeat >= active.base.lengthBeats
          || (active === desktopErase && gesture && 'note' in gesture && gesture.note.id === note.id)) continue;
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
      const hit = active === desktopErase && document.elementFromPoint?.(sample.clientX, sample.clientY);
      if (!hit || noteArea(hit)) erase(active.last, next, active);
      else active.moved = true;
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
    const active = desktopErase ?? gesture;
    if (active?.kind !== 'erase' || active.id !== pointer.pointerId || desktopErase && !(pointer.buttons & 2)) return;
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
    const mode = options.readLessonInput?.() ?? 'edit';
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
      view = zoomMelody(view, width(), melodyDuration(value), point(span).x, Math.max(24, span.y) / Math.max(24, pinch.y), pointerUx ? .5 : 0);
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
  let desktopButtons = 0;
  let desktopPointerId: number | undefined;
  function updateDesktopButtons(event: PointerEvent, target = event.target): void {
    const pressed = event.buttons & ~desktopButtons, released = desktopButtons & ~event.buttons;
    desktopButtons = event.buttons;
    if (released & 2) finishDesktopErase(true, event);
    if (gesture && released & (gesture.button === 0 ? 1 : gesture.button === 1 ? 4 : 2)) up(event);
    if (!(pressed & 7)) return;
    const hit = (document.elementFromPoint?.(event.clientX, event.clientY) ?? target) as HTMLElement;
    if (!hit || !noteArea(hit)) return;
    if (pressed & 4) begin(event, false, 1, hit);
    if (pressed & 1) begin(event, hit === head || hit === drumHead, 0, hit);
    if (pressed & 2) begin(event, false, 2, hit);
  }
  function mouseChord(event: MouseEvent): void {
    if (desktopPointerId === undefined || event.buttons === desktopButtons) return;
    const pointer = new PointerEvent('pointermove', { pointerId: desktopPointerId, pointerType: 'mouse',
      button: event.button, buttons: event.buttons, clientX: event.clientX, clientY: event.clientY,
      ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey, altKey: event.altKey });
    updateDesktopButtons(pointer, event.target);
  }
  function move(event: PointerEvent): void {
    if (pointerUx && event.pointerType === 'mouse' && typeof event.buttons === 'number') {
      updateDesktopButtons(event);
      if (desktopErase?.id === event.pointerId && event.buttons & 2) erasePath(desktopErase, event);
    }
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
    if (!startsDrag(active, event)) return;
    if (active.kind === 'note' && active.desktopClick === false) {
      dragSample = event;
      if (!dragFrame) dragFrame = requestAnimationFrame(() => flushNoteDrag(true));
    } else moveGesture(active, event);
  }
  function startsDrag(active: Gesture, position: PointerPosition): boolean {
    if (!active.desktopClick) return true;
    if (Math.hypot(position.clientX - active.clientFrom.x, position.clientY - active.clientFrom.y) <= 4) return false;
    active.desktopClick = false;
    return true;
  }
  function flushNoteDrag(apply: boolean, final?: PointerPosition): void {
    if (dragFrame) cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    const sample = final ?? dragSample;
    dragSample = undefined;
    if (apply && sample && gesture && startsDrag(gesture, sample)) moveGesture(gesture, sample, !final);
  }
  function moveGesture(active: Gesture, event: PointerPosition, paint = true): void {
    if (active.kind === 'pan') {
      const client = { x: event.clientX, y: event.clientY };
      const before = view.leftSeconds, pitch = pitchOffset(), duration = melodyDuration(active.base);
      const scale = melodyScale(view, pointerUx ? headWidth : width(), duration);
      view = clampView({ ...view, leftSeconds: before + (vertical ? active.lastClient.y - client.y : active.lastClient.x - client.x) / scale }, duration);
      setTop(pitch + (vertical ? active.lastClient.x - client.x : active.lastClient.y - client.y)); active.lastClient = client;
      panMoved ||= before !== view.leftSeconds || pitch !== pitchOffset();
      manualNavigation(); scheduleViewport();
      return;
    }
    if (active.kind === 'head') return;
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
    else if (active.kind === 'erase') { erase(active.last, now); active.last = now; }
    else {
      if (active.dragReadyAt !== undefined && event.timeStamp < active.dragReadyAt) return;
      const lane = active.drumLane === undefined ? undefined : drumLaneAt(now.y);
      const timeMoved = Math.abs(now.x - active.from.x) > 1;
      const positionMoved = lane === undefined ? Math.abs(now.y - active.from.y) > 1 : lane !== active.drumLane;
      active.moved ||= timeMoved || positionMoved;
      if (active.dragReadyAt !== undefined && !active.moved) return;
      const scale = melodyScale(view, pointerUx ? headWidth : width(), melodyDuration(active.base)); const delta = (now.x - active.from.x) / scale; const limit = active.base.lengthBeats;
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
          ...(startBeat === active.note.startBeat ? {} : { startBeat, ...(seconds <= 96 ? { durationSeconds: seconds } : {}),
            durationBeats: melodyClamp(phraseHeldBeats(active.base, startBeat, seconds), MIN_BEATS, limit - startBeat) }),
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
            if (seconds <= 96) active.changes.durationSeconds = seconds;
            active.changes.durationBeats = melodyClamp(phraseHeldBeats(active.base, startBeat, seconds), MIN_BEATS, limit - startBeat);
          }
        }
      }
      active.last = now;
      if (paint) {
        if (!options.readIsPlaying) previewEdit();
        paintNotes(active.note.id);
      }
    }
  }
  function finish(commit: boolean, releasedAt?: number): Error | undefined {
    flushNoteDrag(commit);
    const active = gesture; gesture = undefined; if (!active) return;
    if (vertical && active.kind === 'erase') {
      document.removeEventListener('pointerrawupdate', eraseRaw);
      cancelAnimationFrame(eraseFrame); eraseFrame = 0;
    }
    if (!desktopErase && active.capture.hasPointerCapture?.(active.id)) active.capture.releasePointerCapture(active.id);
    if (active.kind === 'head') {
      if (commit && current.draft?.id === active.draftId) {
        playheadSeconds = active.seconds;
        void options.onSeek(playheadSeconds);
        persistWorkspace();
        if (active.fromRuler && active.moved) options.onLearningAction?.('drag-playhead-ruler');
      }
      positionHead();
      return;
    }
    if (commit && releasedAt !== undefined && active.desktopClick && current.draft?.id === active.draftId) {
      if (active.kind === 'note') { void audition.requestNote(active.partId, active.note, active.base); return; }
      playheadSeconds = melodyTimeAt(view, width(), melodyDuration(active.base), active.from.x);
      void options.onSeek(playheadSeconds);
      positionHead(); persistWorkspace();
    }
    if (active.kind === 'pan') { reportViewport(); if (commit && panMoved) options.onLearningAction?.('pan'); return; }
    if (active.kind === 'create' && !commit) { paintNotes(); return; }
    if ((active.kind === 'note' || active.kind === 'resize') && !active.moved
      && (active.desktopClick !== undefined || active.dragReadyAt !== undefined || options.readIsPlaying)) {
      paintNotes(active.note.id);
      const withinClickWindow = active.dragReadyAt === undefined || (releasedAt !== undefined && releasedAt < active.dragReadyAt);
      if (commit && active.auditionOnClick && withinClickWindow && current.draft?.id === active.draftId) {
        const note = active.note;
        void audition.requestNote(active.partId, note, active.base);
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
          if (changes.startBeat !== undefined) {
            const lastStart = lastNoteStart(active.base);
            changes.startBeat = lastStart === undefined ? active.note.startBeat : melodyClamp(changes.startBeat, 0, lastStart);
            const seconds = changes.durationSeconds ?? phraseHeldSeconds(active.base, active.note);
            changes.durationBeats = melodyClamp(phraseHeldBeats(active.base, changes.startBeat, seconds), MIN_BEATS, active.base.lengthBeats - changes.startBeat);
          }
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
    preview();
    if (changed) {
      if ('note' in active) {
        if (created && created.id !== active.note.id) {
          noteNodes.get(active.note.id)?.remove();
          noteNodes.delete(active.note.id);
        }
        const affected = active.kind === 'note' && active.targetPartId ? [active.partId, active.targetPartId] : [active.partId];
        refreshNoteEdit(affected, [created?.id ?? active.note.id]);
      } else refresh();
      notify(true);
    } else if (!pointerUx) refresh();
    else if ('note' in active) paintNotes(active.note.id, !playheadPlaying);
    if (learningAction) options.onLearningAction?.(learningAction);
    if (created && !failure && active.kind === 'create') void audition.requestNote(active.partId, created, body() ?? active.base);
    return failure;
  }
  function flush(persist = true, writeDraft = persist): void {
    if (disposed) return;
    if (persist) { gainCurve?.finish(true); finishDesktopErase(true); }
    tempoRolls?.flush();
    const failure = finishWheelEdit() ?? finish(true) ?? commitMix();
    if (failure) throw failure;
    if (writeDraft) phrase.flushNoteWrites?.();
    if (persist) persistWorkspace(true);
  }
  function safeFlush(): boolean { try { flush(false); return true; } catch { return false; } }
  function pointerOverlayOpen(blockForSettings = true, blockForLibrary = true): boolean {
    const inlineSelector = `.workspace-inline-panel[open]${blockForSettings ? '' : ':not(.song-editor-controls)'}${blockForLibrary ? '' : ':not(.melody-tone-library)'}`;
    return !!(blockForLibrary && library || toneDeleteDialog || document.querySelector(`dialog[open], ${inlineSelector}, .project-library-overlay:not([hidden])`));
  }
  function pointerRollBusy(): boolean {
    return disposed || options.editorSettings?.isOpen() === true
      || !!(gesture || desktopErase || mix || draggedGroup || draggedTone || quickDrag || drumDividerDrag || cardMenuTarget || gainPartId)
      || pointerOverlayOpen(true, false);
  }
  function toggleToneCards(): void {
    if (options.editorSettings?.isOpen()) {
      options.editorSettings.setOpen(false);
      if (!toneCardsOpen) setToneCards(true);
      return;
    }
    setToneCards(!toneCardsOpen);
  }
  function measureToneRevealBand(): void {
    const frame = main.getBoundingClientRect();
    const rollBottom = scroll.getBoundingClientRect().bottom;
    const inset = Math.max(0, frame.bottom - rollBottom);
    if (inset !== toneKeyboardInset) {
      toneKeyboardInset = inset;
      page.style.setProperty('--tone-keyboard-inset', `${inset}px`);
    }
    const bottom = rollBottom - keyboardHeight;
    toneRevealBand = { top: bottom - melodyClamp(frame.height * .15, 90, 180), bottom };
    handMotion?.measure();
  }
  function resetToneHover(): void {
    toneHand.classList.remove('is-revealed');
    showHoveredTone();
  }
  function trackTonePointer(event: PointerEvent): void {
    if (!toneRevealBand || event.pointerType !== 'mouse' || event.buttons || draggedGroup || draggedTone || toneDeleteDialog) return;
    const card = (event.target as HTMLElement)?.closest?.<HTMLElement>('.melody-note-family');
    const overHand = !!card && toneHand.contains(card);
    toneHand.classList.toggle('is-revealed', overHand
      || event.clientY >= toneRevealBand.top && event.clientY < toneRevealBand.bottom);
    showHoveredTone(overHand || card && pinnedTone?.contains(card) ? card?.dataset.partId : undefined);
  }
  function scrollToneHand(event: WheelEvent): void {
    if (!toneCardsOpen || options.editorSettings?.isOpen() || gainPartId || draggedGroup || draggedTone || toneDeleteDialog) return;
    if ((event.target as HTMLElement)?.closest?.('.melody-library-deck, .project-library, .workspace-inline-panel')) return;
    if (handMotion?.wheel(event)) {
      showHoveredTone();
      window.clearTimeout(handHoverTimer);
      handHoverTimer = window.setTimeout(() => {
        if (disposed || !toneCardsOpen || options.editorSettings?.isOpen()) return;
        const card = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('.melody-note-family');
        if (card && toneHand.contains(card)) showHoveredTone(card.dataset.partId);
      }, 230);
    }
  }
  function syncToneVisibility(): void {
    const covered = options.editorSettings?.isOpen() === true;
    const open = toneCardsOpen && !covered;
    page.classList.toggle('is-tone-settings-covered', covered);
    shelf.inert = !open || !!gainPartId;
    if (library) library.inert = covered;
    if (pinnedTone) pinnedTone.inert = covered;
    page.classList.toggle('is-tone-shelf-open', open);
    toneShortcut?.setAttribute('aria-expanded', String(open));
    if (open) measureToneRevealBand();
    else { toneRevealBand = undefined; resetToneHover(); }
  }
  function settingsVisibilityChanged(): void {
    if (!pointerUx) return;
    syncToneVisibility();
    if (options.editorSettings?.isOpen()) {
      stopToneCardFlights(main);
      suspendRollPointer();
    }
    resetToneEdges();
  }
  function setToneCards(open: boolean): void {
    toneCardsOpen = open;
    if (!open) { library?.close(); stopToneCardFlights(main); }
    syncToneVisibility();
    resetToneEdges();
    stopRollPointer();
  }
  function pointerPitchIndex(event: Pick<PointerEvent, 'clientX'>): number | undefined {
    const offset = event.clientX - scroll.getBoundingClientRect().left + pitchOffset();
    if (offset < 0 || offset >= melodyPitchTop(keys, keys.length, view.rowHeight)) return undefined;
    return melodyPitchAt(keys, offset, view.rowHeight);
  }
  function pitchAt(event: Pick<PointerEvent, 'clientX'>): number | undefined {
    const index = pointerPitchIndex(event);
    return index === undefined ? undefined : keys[index]?.frequencyHz;
  }
  function highlightColumn(index?: number): void {
    const next = index === undefined ? undefined : keyNodes[index];
    if (next === highlightedKey) return;
    highlightedKey?.classList.remove('is-pointer-pitch');
    highlightedKey = next;
    highlightedKey?.classList.add('is-pointer-pitch');
  }
  function highlightAuditionPitch(index?: number): void {
    if (index === auditionPitch) return;
    if (auditionPitch !== undefined) {
      keyNodes[auditionPitch]?.classList.remove('is-auditioning');
      pitchRows[auditionPitch]?.classList.remove('is-auditioning');
    }
    auditionPitch = index;
    if (index !== undefined) {
      keyNodes[index]?.classList.add('is-auditioning');
      pitchRows[index]?.classList.add('is-auditioning');
    }
  }
  function auditionColumn(frequencyHz: number): void {
    audition.prepareColumn(frequencyHz)();
    if (frequencyHz === RHYTHM_PITCH && drumKey(part()) !== undefined) return;
    highlightAuditionPitch(pitchRow(frequencyHz));
    window.clearTimeout(auditionPitchTimer);
    auditionPitchTimer = window.setTimeout(() => highlightAuditionPitch(), 180);
  }
  const panKeys = new Set<string>();
  let panVelocity = { x: 0, y: 0 };
  let precisePitch: number | undefined;
  let rollPointerVisited = false;
  let pointerMotion: { x: number; y: number; time: number } | undefined;
  let pointerSlowTimer = 0;
  let previewPitchTimer = 0;
  let previewPitch = '';
  function preparePointerPitch(index?: number): void {
    const voice = index === undefined ? undefined : part(editingFamilyId());
    const pitch = index === undefined ? undefined : keys[index]?.frequencyHz;
    const key = voice && !voice.unassigned && pitch ? `${voice.id}/${voice.timbreId}/${pitch}` : '';
    if (key === previewPitch) return;
    previewPitch = key;
    window.clearTimeout(previewPitchTimer);
    if (key && voice && pitch) {
      previewPitchTimer = window.setTimeout(() => {
        if (editingFamilyId() === voice.id && part(voice.id)?.timbreId === voice.timbreId) {
          void phrase.previewNotePlan(voice.id, { frequencyHz: pitch, holdSeconds: .35, velocity: .75 }).catch(() => {});
        }
      }, 75);
    }
  }
  let panCursor = { x: 0, y: 0 };
  const rollPanVector = (x: number, y: number) => pointerPanVector(x, y, window.innerWidth, window.innerHeight, options.readPointerSensitivity?.() ?? .65);
  let panIndicatorMoving = false;
  function showPanMode(): void {
    document.dispatchEvent?.(new CustomEvent<PointerPanMode>('rootsound-pan-mode', { detail: panMode }));
  }
  function setPanMode(next: PointerPanMode): void {
    if (panMode === next) return;
    panMode = next;
    showPanMode();
  }
  function showPanDirection(x: number, y: number): void {
    if (!panIndicatorMoving && !x && !y) return;
    panIndicatorMoving = !!(x || y);
    document.dispatchEvent?.(new CustomEvent('rootsound-pan', { detail: { x, y, clientX: panCursor.x, clientY: panCursor.y } }));
  }
  function suspendRollPointer(): void {
    if (panMode === 'ready') setPanMode('waiting');
    stopRollPointer();
  }
  function panPosition(x: number, y: number): void {
    if (panMode === 'off') return;
    panCursor = { x, y };
    const next = rollPanVector(x, y);
    if (panMode === 'waiting') {
      if (!next.x && !next.y) setPanMode('ready');
      return;
    }
    if (pointerSlowTimer) return;
    pointerPan = next;
    if (!edgeFrame && (pointerPan.x || pointerPan.y || panVelocity.x || panVelocity.y)) edgeFrame = requestAnimationFrame(tickPointerPan);
  }
  function tickPointerPan(time: number): void {
    edgeFrame = 0;
    const value = body();
    if (!value || panMode !== 'ready' || desktopButtons || panKeys.size || pointerRollBusy()) { stopRollPointer(); return; }
    const elapsed = edgeLastTime ? Math.min(40, Math.max(0, time - edgeLastTime)) : 16;
    edgeLastTime = time;
    const ease = 1 - Math.exp(-elapsed / 66);
    panVelocity = { x: panVelocity.x + (pointerPan.x - panVelocity.x) * ease, y: panVelocity.y + (pointerPan.y - panVelocity.y) * ease };
    if (!pointerPan.x && !pointerPan.y && Math.hypot(panVelocity.x, panVelocity.y) < .012) {
      stopRollPointer();
      return;
    }
    const pitch = pitchOffset(), seconds = view.leftSeconds, duration = melodyDuration(value);
    const speed = 1.9 + (options.readPointerSensitivity?.() ?? .65) * .95;
    const previous = precisePitch ?? pitch;
    const pitchLimit = rollPitchWidth ? Math.max(0, keys.length * view.rowHeight - rollPitchWidth) : maximumTop();
    precisePitch = melodyClamp(previous + panVelocity.x * elapsed * speed, 0, pitchLimit);
    if (precisePitch !== previous) scroll.scrollLeft = precisePitch;
    view = clampView({ ...view, leftSeconds: seconds + panVelocity.y * elapsed * speed / melodyScale(view, headWidth, duration) }, duration);
    if (pitchOffset() !== pitch || view.leftSeconds !== seconds) {
      manualNavigation();
      paintViewport();
    }
    showPanDirection(precisePitch !== previous ? panVelocity.x : 0, view.leftSeconds !== seconds ? panVelocity.y : 0);
    if (precisePitch !== previous || view.leftSeconds !== seconds || (!pointerPan.x && !pointerPan.y)) edgeFrame = requestAnimationFrame(tickPointerPan);
    else { edgeLastTime = 0; precisePitch = undefined; }
  }
  function stopRollPointer(): void {
    cancelAnimationFrame(edgeFrame); edgeFrame = edgeLastTime = 0;
    pointerPan = panVelocity = { x: 0, y: 0 };
    precisePitch = undefined;
    showPanDirection(0, 0);
    highlightColumn();
  }
  function trackRollPointer(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    if (wheelScrollPoint && !atScrollPoint(event)) wheelScrollPoint = undefined;
    if (wheelAnchor && !atWheelAnchor(event)) wheelAnchor = undefined;
    const target = event.target as HTMLElement;
    rollPointerVisited = (roll.contains(target) || !!target.closest('.song-topbar'))
      && !target.closest('.melody-roll-end, .melody-tempo-marker, .melody-tempo-dock, .melody-console');
    const { clientX: x, clientY: y, timeStamp: time } = event;
    const previous = pointerMotion;
    pointerMotion = { x, y, time };
    const busy = !rollPointerVisited || event.buttons || panKeys.size || pointerRollBusy();
    const index = !busy && canvas.contains(target) ? pointerPitchIndex(event) : undefined;
    preparePointerPitch(index);
    if (busy || panMode === 'off') { stopRollPointer(); return; }
    const elapsed = previous ? time - previous.time : NaN;
    if (previous && elapsed > 0 && elapsed < 110
      && Math.hypot(x - previous.x, y - previous.y) > Math.max(window.innerWidth, window.innerHeight) * .0014 * Math.max(8, elapsed)) {
      window.clearTimeout(pointerSlowTimer);
      stopRollPointer();
      pointerSlowTimer = window.setTimeout(() => {
        pointerSlowTimer = 0;
        if (rollPointerVisited && !desktopButtons && !panKeys.size && !pointerRollBusy()) panPosition(panCursor.x, panCursor.y);
      }, 90);
    }
    highlightColumn(index);
    panPosition(x, y);
  }
  function atScrollPoint({ clientX, clientY }: Pick<MouseEvent, 'clientX' | 'clientY'>): boolean {
    return wheelScrollPoint?.x === clientX && wheelScrollPoint.y === clientY;
  }
  function atWheelAnchor({ clientX, clientY }: Pick<MouseEvent, 'clientX' | 'clientY'>): boolean {
    return wheelAnchor?.x === clientX && wheelAnchor.y === clientY && wheelAnchor.draftId === current.draft?.id;
  }
  function finishWheelEdit(commit = true): Error | undefined {
    const active = wheelEdit;
    wheelEdit = undefined;
    window.clearTimeout(wheelTimer); wheelTimer = 0;
    cancelAnimationFrame(wheelFrame); wheelFrame = 0;
    if (!active || current.draft?.id !== active.draftId) return;
    const anchor = wheelAnchor?.noteId === active.note.id ? wheelAnchor : undefined;
    if (!commit || active.create && active.remove) {
      if (!commit && anchor) wheelAnchor = undefined;
      paintNotes(undefined, !playheadPlaying);
      return;
    }
    if (!active.create && !active.remove && Math.abs(active.initialSeconds - active.seconds) <= 1e-9) return;
    let changedId = active.note.id;
    let edited: PhraseView | undefined;
    try {
      if (phrase.editDraftNote) {
        const edit = active.remove ? { kind: 'remove' as const, id: changedId }
          : active.create ? { kind: 'add' as const, note: { ...active.note, ...active.changes } }
            : { kind: 'duration' as const, id: changedId, durationBeats: active.changes.durationBeats!, durationSeconds: active.changes.durationSeconds };
        const result = phrase.editDraftNote(active.draftId, active.partId, edit);
        const matchingTones = result.body.parts.every((voice, index) => voice.timbreId === body()?.parts[index]?.timbreId);
        if (matchingTones) edited = { ...current, ...result, changed: true, canUndo: true, canRedo: false };
      } else if (active.remove) {
        phrase.removeNote(active.partId, active.note.id);
      } else if (active.create) {
        const { id: _id, ...note } = { ...active.note, ...active.changes };
        changedId = phrase.addNote(active.partId, note);
        const block = noteNodes.get(active.note.id);
        noteNodes.delete(active.note.id);
        if (block) noteNodes.set(changedId, block);
      } else {
        phrase.updateNote(active.partId, active.note.id, active.changes);
      }
      if (active.remove) {
        if (selection?.noteId === active.note.id) selection = { partId: active.partId };
      } else if (active.create) {
        if (anchor) anchor.noteId = changedId;
      } else {
        rememberLength(active.partId, active.note, active.changes);
      }
    } catch (error) {
      if (anchor) wheelAnchor = undefined;
      const failure = error instanceof Error ? error : new Error(String(error));
      report(failure.message);
      paintNotes(undefined, !playheadPlaying);
      return failure;
    }
    refreshNoteEdit([active.partId], [changedId], edited);
    notify(true, !!edited);
  }
  function editWithWheel(event: WheelEvent, pinned: string | undefined): boolean {
    if (!Number.isFinite(event.deltaY)) return false;
    const anchor = atWheelAnchor(event) ? wheelAnchor : undefined;
    const anchored = anchor && (pinned === undefined || anchor.partId === pinned) ? anchor : undefined;
    const target = anchored ? null : (document.elementFromPoint
      ? document.elementFromPoint(event.clientX, event.clientY)
      : event.target) as HTMLElement | null;
    if (!anchored && (!target || !noteArea(target) || target.closest('.melody-roll-end, .melody-tempo-marker, .melody-playhead'))) return false;
    let active = wheelEdit;
    const candidate = target?.closest<HTMLElement>('.melody-note');
    const centered = candidate && !noteDimmed(candidate)
      && (pinned === undefined || candidate.dataset.partId === pinned)
      && !(active?.remove && active.note.id === candidate.dataset.noteId) ? candidate : undefined;
    const hitId = anchored?.noteId ?? centered?.dataset.noteId;
    const hitPart = anchored?.partId ?? centered?.dataset.partId;
    if (active && active.note.id !== hitId) {
      if (finishWheelEdit()) return true;
      active = undefined;
    }
    const value = body(), draftId = current.draft?.id;
    if (!value || !draftId) return false;
    if (!active) {
      const voice = hitPart ? part(hitPart) : undefined;
      const indexed = hitId ? noteIndex?.byId.get(hitId) : undefined;
      const existing = hitId && voice && indexed?.voice.id === voice.id ? indexed.note : hitId ? voice?.notes.find(note => note.id === hitId) : undefined;
      if (hitId && !existing) return !!anchored;
      const writer = existing ? voice : pinned && event.deltaY > 0 ? part(pinned) : undefined;
      if (!writer || !existing && (writer.unassigned || drumKey(writer) !== undefined || !canvas.contains(target))) return false;
      const duration = melodyDuration(value);
      const position = existing ? undefined : point(event);
      const limit = position && lastNoteStart(value);
      const frequencyHz = existing?.frequencyHz ?? pitchAt(event);
      const scale = melodyScale(view, headWidth, duration);
      if (!existing && (limit === undefined || frequencyHz === undefined || !position
        || position.x < Math.max(0, -view.leftSeconds * scale) || position.x >= Math.min(headWidth, (duration - view.leftSeconds) * scale))) return false;
      const startBeat = existing?.startBeat ?? noteStartAt(value, melodyTimeAt(view, headWidth, duration, position!.x), limit!, scale);
      const extent = drawExtent(value, startBeat);
      const start = melodySeconds(startBeat, value);
      const available = duration - start;
      const minimum = Math.max(MIN_NOTE_SECONDS, melodySeconds(startBeat + MIN_BEATS, value) - start);
      if (!existing && available + 1e-9 < minimum) return false;
      const initial = existing ? phraseHeldSeconds(value, existing)
        : melodyClamp(noteLengths.get(writer.id) ?? extent.cell, minimum, Math.max(minimum, extent.maximum));
      const note = existing ?? { id: crypto.randomUUID(), startBeat, frequencyHz: frequencyHz!, velocity: .75,
        durationSeconds: initial, durationBeats: Math.min(value.lengthBeats - startBeat, phraseHeldBeats(value, startBeat, initial)) };
      active = { draftId, partId: writer.id, note, changes: {}, initialSeconds: initial, seconds: initial,
        minimumSeconds: minimum, maximumSeconds: Math.max(minimum, initial, extent.maximum), stepSeconds: Math.max(minimum, extent.cell / 2),
        create: !existing, remove: false };
      wheelEdit = active;
      if (active.create) void audition.requestNewNote(writer.id, note);
    }
    if (!anchored) wheelAnchor = { x: event.clientX, y: event.clientY, draftId, partId: active.partId, noteId: active.note.id };
    const units = event.deltaMode === 1 ? 3 : event.deltaMode === 2 ? 1 : 100;
    const amount = melodyClamp(event.deltaY / units, -4, 4);
    if (!active.remove) {
      if (amount < 0 && active.seconds <= active.minimumSeconds + 1e-9) active.remove = true;
      else {
        const first = active.create && active.changes.durationBeats === undefined;
        const steps = first ? Math.max(0, amount - 1) : amount;
        const held = melodyClamp(active.seconds + steps * active.stepSeconds, active.minimumSeconds, active.maximumSeconds);
        active.seconds = held;
        active.changes = { durationBeats: melodyClamp(phraseHeldBeats(value, active.note.startBeat, held), MIN_BEATS, value.lengthBeats - active.note.startBeat),
          ...(held <= 96 ? { durationSeconds: held } : {}) };
      }
    }
    if (active.remove && !active.create) { finishWheelEdit(); return true; }
    if (!wheelFrame) wheelFrame = requestAnimationFrame(() => {
      wheelFrame = 0;
      if (!wheelEdit) return;
      if (wheelEdit.remove) { noteNodes.get(wheelEdit.note.id)?.remove(); noteNodes.delete(wheelEdit.note.id); }
      else paintNotes(wheelEdit.note.id, !playheadPlaying);
    });
    window.clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(finishWheelEdit, 260);
    return true;
  }
  function zoomPitchAt(client: number, factor: number): void {
    const origin = pointerUx ? getZoomBounds().pitch : vertical ? scroll.getBoundingClientRect().left : scroll.getBoundingClientRect().top;
    const y = client - origin;
    const row = (pitchOffset() + y) / view.rowHeight;
    const rowHeight = melodyClamp(view.rowHeight * factor, rhythm ? 48 : 12, rhythm ? 120 : 44);
    if (rowHeight === view.rowHeight) return;
    view = { ...view, rowHeight };
    const offset = row * rowHeight - y;
    if (pointerUx) pendingPitchOffset = melodyClamp(offset, 0, maximumTop());
    else { paintRows(); setTop(offset); }
  }
  function getZoomBounds() {
    return zoomBounds ??= { pitch: scroll.getBoundingClientRect().left, time: canvas.getBoundingClientRect().top };
  }
  function wheel(event: WheelEvent): void {
    if (disposed || !body() || (!pointerUx && (library || root.querySelector('dialog[open]') || document.querySelector('dialog[open]')))) return;
    event.preventDefault();
    const mode = options.readLessonInput?.() ?? 'edit';
    if (mode === 'locked' || ((mode === 'pan' || mode === 'draw') && (event.ctrlKey || event.metaKey)) || (mode !== 'edit' && event.altKey)) return;
    const target = event.target as HTMLElement | null;
    const control = event.ctrlKey || event.metaKey;
    if (pointerUx) {
      suspendRollPointer();
      if (gesture || desktopErase || mix || draggedGroup || pointerOverlayOpen(true, false)) return;
      if (wheelScrollPoint && !atScrollPoint(event)) wheelScrollPoint = undefined;
      if (wheelAnchor && !atWheelAnchor(event)) wheelAnchor = undefined;
      if (!control) {
        if (zoomBounds) paintViewport();
        const pinned = !pinnedTone?.hidden ? editingFamilyId() : undefined;
        if (!wheelScrollPoint && mode === 'edit' && !gainPartId && !event.shiftKey && event.deltaY && editWithWheel(event, pinned)) return;
        if (pinned) return;
        if (!event.shiftKey && event.deltaY) wheelScrollPoint = { x: event.clientX, y: event.clientY };
      }
      wheelAnchor = undefined;
    }
    if (!safeFlush()) return;
    const value = body(); if (!value) return;
    const previousView = { ...view }, previousOffset = pitchOffset(), previousDrumWidth = drumLaneWidth;
    const hoveredNote = target?.closest?.<HTMLElement>('.melody-note');
    const hoveredPartId = hoveredNote?.dataset.partId;
    const partId = vertical ? (hoveredNote && noteDimmed(hoveredNote) ? undefined : hoveredPartId) : selection?.partId;
    const adjustsDuration = gainPartId || pointerUx ? false : vertical ? event.altKey
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
    const pitchZoom = control && (vertical ? event.shiftKey : !event.shiftKey);
    const timeZoom = control && (vertical ? !event.shiftKey : event.shiftKey);
    if (pitchZoom && visibleDrumLanes && target && drumStrip.contains(target)) {
      const limit = Math.max(drumLaneWidth, Math.min(MAX_DRUM_LANE_WIDTH, Math.floor(availableDrumWidth() / visibleDrumLanes)));
      drumLaneWidth = melodyClamp(drumLaneWidth * Math.exp(-event.deltaY * .002), MIN_DRUM_LANE_WIDTH, limit);
      syncDrumStrip();
    } else if (pitchZoom) zoomPitchAt(vertical ? event.clientX : event.clientY, Math.exp(-event.deltaY * .002));
    else if (timeZoom) {
      const rowHeight = view.rowHeight;
      const coordinate = pointerUx ? event.clientY - getZoomBounds().time : point(event).x;
      view = zoomMelody(view, pointerUx ? headWidth : width(), melodyDuration(value), coordinate, Math.exp(-event.deltaY * .002), pointerUx ? .5 : 0);
      if (rhythm) view.rowHeight = rowHeight;
    }
    else if (vertical) {
      setTop(pitchOffset() + (event.shiftKey ? event.deltaX || event.deltaY : event.deltaX || 0));
      if (!event.shiftKey) view = clampView({ ...view, leftSeconds: view.leftSeconds + event.deltaY / melodyScale(view, width(), melodyDuration(value)) }, melodyDuration(value));
    }
    else if (!event.shiftKey && !event.deltaX) setTop(pitchOffset() + event.deltaY);
    else view = clampView({ ...view, leftSeconds: view.leftSeconds + (event.deltaX || event.deltaY) / melodyScale(view, width(), melodyDuration(value)) }, melodyDuration(value));
    manualNavigation(); scheduleViewport();
    const moved = view.zoom !== previousView.zoom || view.rowHeight !== previousView.rowHeight || view.leftSeconds !== previousView.leftSeconds
      || pitchOffset() !== previousOffset || drumLaneWidth !== previousDrumWidth;
    if (moved) options.onLearningAction?.(pitchZoom ? vertical ? 'zoom-x' : 'zoom-y' : timeZoom ? vertical ? 'zoom-y' : 'zoom-x'
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
    const steps = phraseStepsPerBeat(value); const step = nextMelodyEntryStep(beforeSeconds, value.tempoBpm, value.lengthBeats, steps, phraseMeterBeatLength(value));
    if (!step || !rest && !step.canWrite) { report('已到音乐结尾。'); return true; }
    const heldSeconds = drum === undefined ? noteLengths.get(voice.id) ?? step.durationSeconds : DRUM_HIT_SECONDS;
    let entered: PhraseNote | undefined;
    if (!rest) {
      const input = { startBeat: step.startBeat, durationBeats: Math.min(value.lengthBeats - step.startBeat, melodyBeats(heldSeconds, value.tempoBpm)), durationSeconds: heldSeconds, frequencyHz: pitch!, velocity: .75 };
      let noteId: string;
      try { noteId = phrase.addNote(voice.id, input); }
      catch (error) { report(error instanceof Error ? error.message : String(error)); return true; }
      entered = { ...input, id: noteId };
      recordPerformanceEntry(phrase, noteId, melodyBeats(beforeSeconds, value.tempoBpm), step.startBeat);
      if (!vertical) selection = { partId: voice.id, noteId };
      refresh(); notify(true);
    }
    playheadSeconds = step.seconds; const ready = options.onSeek(step.seconds);
    if (entered) void audition.requestNote(voice.id, entered, body() ?? value, ready);
    revealEntry(step.seconds, drum === undefined ? pitch : undefined);
    return true;
  }
  function cancelInteraction(): boolean {
    if (cardMenuTarget) { closeCardMenu(true); return true; }
    if (tempoRolls?.cancelInteraction()) return true;
    if (gesture || desktopErase) { finishDesktopErase(false); finish(false); return true; }
    if (wheelEdit) { finishWheelEdit(false); return true; }
    if (mix) { mix = undefined; preview(); refresh(); return true; }
    if (gainPartId) { gainCurve?.finish(false); setGainMode(); return true; }
    if (toneCardsOpen && !options.editorSettings) { setToneCards(false); scroll.focus({ preventScroll: true }); return true; }
    return false;
  }
  function keydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    if (cardMenuTarget) {
      if (event.key === 'Escape' || event.key === 'Tab') {
        if (event.key === 'Escape') event.preventDefault();
        closeCardMenu(true);
      }
      return;
    }
    if (root.closest('[inert]') || options.readLessonInput && options.readLessonInput() !== 'edit') return;
    const rangeUndo = event.key === 'Backspace' && event.target instanceof HTMLInputElement && event.target.type === 'range';
    if (disposed || event.isComposing || event.keyCode === 229 || isEditable(event.target) && !rangeUndo
      || pointerOverlayOpen(true, !pointerUx)) return;
    const key = event.key.toLowerCase();
    if (key === 'escape') { if (cancelInteraction()) event.preventDefault(); return; }
    if (gainPartId && key === 'delete') { event.preventDefault(); return; }
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
        const rowHeight = view.rowHeight; view = zoomMelody(view, width(), melodyDuration(value), width() / 2, forward !== vertical ? 1.15 : 1 / 1.15, pointerUx ? .5 : 0); if (rhythm) view.rowHeight = rowHeight;
      } else if (event.ctrlKey) {
        const row = (pitchOffset() + pitchSpan() / 2) / view.rowHeight;
        view.rowHeight = melodyClamp(view.rowHeight * (forward === vertical ? 1.15 : 1 / 1.15), rhythm ? 48 : 12, rhythm ? 120 : 44); paintRows();
        setTop(row * view.rowHeight - pitchSpan() / 2);
      } else if (timeAxis) view = clampView({ ...view, leftSeconds: view.leftSeconds + (forward ? 64 : -64) / melodyScale(view, width(), melodyDuration(value)) }, melodyDuration(value));
      else setTop(pitchOffset() + (forward ? view.rowHeight : -view.rowHeight));
      manualNavigation(); paintViewport(); return;
    }
    if (!gainPartId && typeStep(event, key)) return;
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
    if (pointerUx && event.pointerType === 'mouse') desktopButtons = event.buttons ?? 0;
    if (desktopErase?.id === event.pointerId && event.button === 2) finishDesktopErase(true, event);
    endTouch(event);
    if (keyPan?.id === event.pointerId) finishKeyPan();
    if (quickDrag?.id === event.pointerId) finishQuickScroll();
    if (gesture?.id === event.pointerId) {
      if (event.pointerType === 'mouse' && gesture.desktopClick !== undefined) flushNoteDrag(true, event);
      if (vertical && gesture.kind === 'erase' && (event.button === 2 || gesture.touchRight)) {
        if (gesture.touchRight || !options.readLessonInput || options.readLessonInput() === 'edit') erase(gesture.last, point(event));
        else gesture.moved ||= Math.hypot(event.clientX - gesture.clientFrom.x, event.clientY - gesture.clientFrom.y) > 4;
      }
      finish(true, event.timeStamp);
    }
    if (mix?.pointerId === event.pointerId) commitMix();
  };
  const cancel = (event: PointerEvent) => { if (desktopErase?.id === event.pointerId) finishDesktopErase(false); endTouch(event); if (keyPan?.id === event.pointerId) finishKeyPan(true); if (quickDrag?.id === event.pointerId) finishQuickScroll(); if (gesture?.id === event.pointerId) finish(false); if (mix?.pointerId === event.pointerId) { mix = undefined; preview(); refresh(); } };
  const resize = () => {
    if (disposed) return;
    if (pointerUx) {
      sizeDesktopKeyboard();
      if (toneCardsOpen && !options.editorSettings?.isOpen()) measureToneRevealBand();
    }
    rollPitchWidth = 0; rollRegion = undefined; measureQuickTrack = true;
    closeCardMenu(); syncDrumStrip(); setTop(pitchOffset()); scheduleViewport();
  };
  const toneGestures = toneEdges ? (['left', 'right'] as const).filter(side => side === 'left' || options.editorSettings).map(side =>
    attachEdgeGesture(pointerArea, side, {
      enabled: () => !disposed && !panKeys.size && Date.now() >= toneCooldownUntil
        && (side !== 'left' || !options.editorSettings?.isOpen())
        && !(gesture || desktopErase || wheelEdit || mix || draggedGroup || draggedTone || quickDrag || drumDividerDrag || cardMenuTarget || gainPartId)
        && !pointerOverlayOpen(false, false),
      open(y) {
        const settingsOpen = options.editorSettings?.isOpen(), cardsOpen = toneCardsOpen;
        suspendRollPointer();
        if (side === 'left') toggleToneCards();
        else options.editorSettings?.setOpen(!settingsOpen);
        if (cardsOpen === toneCardsOpen && settingsOpen === options.editorSettings?.isOpen()) return;
        toneCooldownUntil = Date.now() + EDGE_COOLDOWN_MS;
        if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
          const edge = toneEdges[side];
          edge.style.setProperty('--tone-edge-y', `${y * 100}%`);
          edge.animate?.([{ opacity: .5 }, { opacity: 0 }], { duration: 160, easing: 'ease-out' });
        }
      },
    })) : [];
  function resetToneEdges(): void { for (const edge of toneGestures) edge.reset(); }
  function canDropGroupForDeletion(event: DragEvent): boolean {
    if (!draggedGroup || !toneCardsOpen) return false;
    const dy = event.clientY - draggedGroup.from.y;
    const pile = tonePile?.getBoundingClientRect();
    const keys = main.getBoundingClientRect();
    const keyboardBottom = keys.bottom - toneKeyboardInset;
    return !!(pile && event.clientX - draggedGroup.from.x > 18 && event.clientX >= pile.left && event.clientX <= pile.right
      && event.clientY >= pile.top && event.clientY <= pile.bottom)
      || (dy > 18 && event.clientX >= keys.left && event.clientX <= keys.right
        && event.clientY >= keyboardBottom - keyboardHeight && event.clientY <= keyboardBottom);
  }
  if (pointerUx) {
    main.addEventListener('dragover', event => {
      if (!event.dataTransfer || !draggedGroup || draggedGroup.draftId !== current.draft?.id || options.editorSettings?.isOpen() || toneDeleteDialog
        || (!draggedGroup.pinned && !canDropGroupForDeletion(event))) return;
      event.preventDefault(); event.dataTransfer.dropEffect = 'move';
    });
    main.addEventListener('drop', event => {
      const source = draggedGroup;
      if (!source || source.draftId !== current.draft?.id || options.editorSettings?.isOpen() || toneDeleteDialog
        || (!source.pinned && !canDropGroupForDeletion(event)) || event.dataTransfer?.getData(GROUP_DRAG_TYPE) !== source.id) return;
      event.preventDefault(); endGroupDrag();
      if (source.pinned && editingFamilyId() === source.id) clearToneCard(event);
      else if (!source.pinned) requestRemoveFamily(source.id, true);
    });
  }
  const leaveRollPointer = () => {
    wheelAnchor = undefined;
    preparePointerPitch();
    window.clearTimeout(pointerSlowTimer); pointerSlowTimer = 0;
    if (!gesture) finishDesktopErase(true);
    stopRollPointer();
  };
  const resetPointerPan = () => {
    desktopButtons = 0; desktopPointerId = undefined; rollPointerVisited = false; previousNativePosition = undefined;
    pointerMotion = undefined; window.clearTimeout(pointerSlowTimer); pointerSlowTimer = 0;
    wheelAnchor = undefined;
    finishDesktopErase(false); panKeys.clear(); suspendRollPointer();
  };
  const pausePanOnKey = (event: KeyboardEvent) => { panKeys.add(event.code || event.key); wheelAnchor = undefined; resetToneEdges(); suspendRollPointer(); };
  const releasePanKey = (event: KeyboardEvent) => panKeys.delete(event.code || event.key);
  const pausePanOnWheel = () => { resetToneEdges(); suspendRollPointer(); };
  const stopOnPress = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') { desktopButtons = event.buttons; desktopPointerId = event.pointerId; }
    wheelAnchor = undefined;
    resetToneEdges();
    if (event.button === 1) stopRollPointer(); else suspendRollPointer();
  };
  let previousNativePosition: { x: number; y: number } | undefined;
  const removeNativePan = pointerUx ? listenDesktopPointer(sample => {
    const moved = sample.dx || sample.dy || previousNativePosition?.x !== sample.x || previousNativePosition?.y !== sample.y;
    previousNativePosition = sample;
    if (sample.pressed || sample.held) { stopRollPointer(); return; }
    if (!moved) return;
    if (panMode === 'off' || !rollPointerVisited || desktopButtons || panKeys.size || pointerRollBusy()) return;
    const exterior = sample.x <= 0 || sample.x >= 1 || sample.y <= 0 || sample.y >= 1;
    if (exterior) panPosition(sample.clientX * window.innerWidth, sample.clientY * window.innerHeight);
    else if (sample.clientY < 0 || sample.clientY > 1 || sample.clientX < 0 || sample.clientX > 1) stopRollPointer();
  }, resetPointerPan) : undefined;
  if (pointerUx) {
    showPanMode();
    pointerArea.addEventListener('pointermove', trackTonePointer);
    pointerArea.addEventListener('wheel', scrollToneHand, { capture: true, passive: false });
    pointerArea.addEventListener('pointerleave', resetToneHover);
    pointerArea.addEventListener('pointermove', trackRollPointer);
    pointerArea.addEventListener('pointerleave', leaveRollPointer);
    document.addEventListener('pointerdown', stopOnPress, true);
    document.addEventListener('mousedown', mouseChord, true);
    document.addEventListener('wheel', pausePanOnWheel, { passive: true, capture: true });
    document.addEventListener('mouseup', mouseChord, true);
    document.addEventListener('keydown', pausePanOnKey, true);
    document.addEventListener('keyup', releasePanKey, true);
    window.addEventListener('blur', resetPointerPan);
  }
  const beginRoll = (event: PointerEvent) => {
    if (pointerUx && event.pointerType === 'mouse') desktopButtons = event.buttons ?? (event.button === 0 ? 1 : event.button === 1 ? 4 : 2);
    if (!startTouch(event)) begin(event, (event.target === head || event.target === drumHead) && event.button === 0);
  };
  scroll.addEventListener('pointerdown', beginRoll);
  if (pointerUx) {
    const blockMiddleDefault = (event: MouseEvent) => { if (event.button === 1) event.preventDefault(); };
    roll.addEventListener('mousedown', blockMiddleDefault);
    roll.addEventListener('auxclick', blockMiddleDefault);
  }
  drumCanvas.addEventListener('pointerdown', beginRoll);
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
  if (pointerUx) keyboard.addEventListener('auxclick', event => {
    if (disposed || event.button !== 2 || drumKey(part()) !== undefined || pointerOverlayOpen(true, false)) return;
    const key = (event.target as HTMLElement).closest('.melody-key') as HTMLElement | null;
    const frequencyHz = Number(key?.dataset.frequencyHz);
    if (!Number.isFinite(frequencyHz)) return;
    event.preventDefault();
    auditionColumn(frequencyHz);
  });
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
  const scrolled = () => {
    if (disposed || pointerUx && edgeFrame) return;
    if (!pointerUx) setTop(pitchOffset());
    scheduleViewport();
  };
  scroll.addEventListener('scroll', scrolled);
  const lost = (event: PointerEvent) => { if (desktopErase?.id === event.pointerId) finishDesktopErase(false); if (keyPan?.id === event.pointerId) finishKeyPan(true); if (gesture?.id === event.pointerId) finish(false); };
  gainCurve?.layer.addEventListener('lostpointercapture', lost);
  keyboard.addEventListener('lostpointercapture', lost);
  scroll.addEventListener('lostpointercapture', lost); ruler.addEventListener('lostpointercapture', lost); drumCanvas.addEventListener('lostpointercapture', lost);
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', cancel); document.addEventListener('keydown', keydown); window.addEventListener('resize', resize);
  document.addEventListener('pointerdown', dismissCardMenu, true); document.addEventListener('wheel', dismissCardMenu, true);
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
  const restoredTone = pointerUx && editingFamilyId();
  if (restoredTone) prepareVisibleTone(restoredTone);
  return { refresh, flush, isStepInputActive, cancelInteraction, settingsVisibilityChanged, readViewport, previewTempoRate, frameNotes(reserveEndSpace = false) {
    const value = body(); if (!value) return;
    const trailingSeconds = reserveEndSpace ? phraseBarBeats(value) * 60 / phraseTempoAtBeat(value, value.lengthBeats) : 0;
    view = { ...view, leftSeconds: 0, zoom: 8 / Math.max(2, melodyDuration(value) + trailingSeconds + .3), rowHeight: 28 };
    const pitches = sectionParts().flatMap(part => part.notes.map(note => phrasePitchRow(note.frequencyHz, keys)));
    if (pitches.length) {
      const low = Math.min(...pitches), high = Math.max(...pitches);
      view.rowHeight = melodyClamp((pitchSpan() - 36) / (high - low + 5), 12, 32);
      paintRows(); setTop(Math.max(0, (low - 2) * view.rowHeight));
    }
    paintViewport(); reportViewport();
  }, setPlayhead(seconds, playing = false, displaySeconds = seconds, frameTime?: number) { if (!disposed) {
    const playbackChanged = playheadPlaying !== playing;
    const positionChanged = playheadSeconds !== seconds;
    playheadPlaying = playing; playheadSeconds = seconds; displayedPlayheadSeconds = displaySeconds;
    if (playbackChanged) page.classList.toggle('is-playing', playing);
    if (!playing && (playbackChanged || positionChanged)) persistWorkspace();
    if (pointerUx ? playbackChanged && playing : headInView()) followResumeAt = 0;
    const now = frameTime ?? performance.now();
    const canFollow = vertical && playing && !gesture && !desktopErase && !wheelEdit && !mix && !quickDrag && !keyPan
      && !drumDividerDrag && !pinch && !edgeFrame && !tempoRolls?.isDragging() && !!body() && now >= followResumeAt;
    if (!canFollow || frameTime === undefined || playbackChanged) lastFollowFrame = undefined;
    if (canFollow) {
      const span = 8 / view.zoom;
      let target: number | undefined;
      if (pointerUx) {
        const previous = lastFollowFrame;
        lastFollowFrame = { time: now, seconds: displaySeconds, zoom: view.zoom };
        if (previous?.zoom === view.zoom) {
          const elapsed = melodyClamp(now - previous.time, 0, 40);
          const center = displaySeconds - span / 2;
          const error = view.leftSeconds - (previous.seconds - span / 2);
          target = center + (Math.abs(error) * headWidth / span < .35 ? 0 : error * Math.exp(-elapsed / 140));
        }
      } else {
        target = melodyFollowTarget(seconds, view.leftSeconds, span, melodyDuration(body()!), span * 2 / Math.max(1, headWidth));
      }
      if (target !== undefined && target !== view.leftSeconds) {
        wheelAnchor = undefined;
        view = { ...view, leftSeconds: target };
        browseLastSeconds = target;
        paintViewport(false, false);
      }
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
    if (disposed) return; endGroupDrag(); finishKeyPan(true); finishDesktopErase(false); finish(false); mix = undefined; gainCurve?.dispose(); persistWorkspace(true); preview(); audition.cancel(); tempoRolls?.dispose(); disposed = true; closeCardMenu(); toneDeleteDialog?.close(); library?.close(); observer?.disconnect(); removeConsoleWheel(); window.clearTimeout(noticeTimer); window.clearTimeout(workspaceTimer);
    window.clearTimeout(quickHideTimer); window.clearTimeout(handHoverTimer); handMotion?.dispose(); quickDrag = undefined;
    cancelAnimationFrame(highlightFrame);
    for (const edge of toneGestures) edge.dispose();
    if (toneEdges) { toneEdges.left.remove(); toneEdges.right.remove(); }
    removeNativePan?.();
    if (pointerUx) {
      pointerArea.removeEventListener('pointermove', trackTonePointer);
      pointerArea.removeEventListener('wheel', scrollToneHand, true);
      pointerArea.removeEventListener('pointerleave', resetToneHover);
      pointerArea.removeEventListener('pointermove', trackRollPointer);
      pointerArea.removeEventListener('pointerleave', leaveRollPointer);
      if (pointerArea !== main) pointerArea.style.setProperty('--melody-keyboard-height', '');
      document.removeEventListener('pointerdown', stopOnPress, true);
      document.removeEventListener('mousedown', mouseChord, true);
      document.removeEventListener('wheel', pausePanOnWheel, true);
      document.removeEventListener('mouseup', mouseChord, true);
      document.removeEventListener('keydown', pausePanOnKey, true);
      document.removeEventListener('keyup', releasePanKey, true);
      window.removeEventListener('blur', resetPointerPan);
      window.clearTimeout(pointerSlowTimer);
      window.clearTimeout(previewPitchTimer);
      window.clearTimeout(auditionPitchTimer);
      stopRollPointer();
      setPanMode('off');
    }
    window.clearTimeout(wheelTimer); cancelAnimationFrame(wheelFrame); cancelAnimationFrame(edgeFrame);
    cancelAnimationFrame(viewportFrame); viewportFrame = 0;
    cancelAnimationFrame(pinchFrame); pinchFrame = 0; touches?.clear(); pinch = undefined;
    scroll.removeEventListener('scroll', scrolled);
    document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', cancel); document.removeEventListener('keydown', keydown); window.removeEventListener('resize', resize);
    document.removeEventListener('pointerdown', dismissCardMenu, true); document.removeEventListener('wheel', dismissCardMenu, true);
  } };
}
