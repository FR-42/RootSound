import type { SaveConfirmation, SaveResult } from '../../contracts/content.ts';
import type { SongBody, SongClip, SongClipRef, SongEditorPort } from '../../contracts/song.ts';
import type { PlaybackSession, SoundRuntimePort } from '../../contracts/sound.ts';
import { songGridTempoAt } from '../song/public.ts';
import { readEntityDrag } from './entity-drag.ts';
import { createSongSaveAction, isSongSaveShortcut } from './song-save.ts';
import type { ReferenceEditorContext } from './reference-ui.ts';
import { createPlaylistTransport } from './playlist-transport.ts';
import { clampPlaylist, playlistBeats, playlistClipRect, playlistGridLines, playlistSeconds, playlistSegmentIntersectsRect,
  playlistTrackAt, zoomPlaylist, type PlaylistViewport } from './playlist-geometry.ts';
import { PLAYLIST_COLORS, playlistColorInk, playlistPhraseColor } from './playlist-colors.ts';
import { createSongInspector, type SongInspectorView } from './song-inspector.ts';
import { createSongPhraseAudition } from './song-phrase-audition.ts';
import { libraryClickDelay } from './library-click.ts';
import './song.css';

const DOUBLE_NUDGE_WINDOW_MS = 150;
const ROW_HORIZONTAL_DRAG_RATE = .75;

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const result = document.createElement(tag); result.className = className; result.textContent = text; return result;
}
function action(label: string, className: string, callback: () => void): HTMLButtonElement {
  const button = node('button', className, label); button.type = 'button'; button.addEventListener('click', callback); return button;
}
function icon(kind: 'play' | 'pause' | 'stop' | 'tempo' | 'volume' | 'solo' | 'mute' | 'trash'): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  const paths = { play: 'M8 5v14l11-7z', pause: 'M7 5h3v14H7zM14 5h3v14h-3z', stop: 'M6 6h12v12H6z',
    tempo: 'M9 3h6l5 18H4zM12 6v10m-3-4 7-5M8 18h8', volume: 'M4 9h4l5-4v14l-5-4H4zM16 8q5 4 0 8M19 5q7 7 0 14',
    solo: 'M4 9h4l5-4v14l-5-4H4zM17 8v8m3-10v12', mute: 'M4 9h4l5-4v14l-5-4H4zM17 9l5 6m0-6-5 6',
    trash: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7' };
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', paths[kind]);
  path.setAttribute('fill', ['play', 'pause', 'stop'].includes(kind) ? 'currentColor' : 'none');
  path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '1.5'); path.setAttribute('stroke-linejoin', 'round'); svg.append(path); return svg;
}
function timeLabel(seconds: number): string {
  const sign = seconds < 0 ? '−' : ''; const value = Math.abs(seconds);
  return `${sign}${Math.floor(value / 60)}:${(value % 60).toFixed(value % 1 > .01 ? 1 : 0).padStart(2, '0')}`;
}
type PickedClip = SongClipRef & { clip: SongClip; trackIndex: number };
type Point = { x: number; y: number };
type DragMove = { trackId: string; seconds: number };
type PhraseDisplay = { id: string; name: string; tempoBpm?: number; durationSeconds?: number };
type RowSelection = { draftId?: string; clips: string[]; trackId?: string; phraseId?: string };
type Gesture =
  | { kind: 'head'; pointerId: number }
  | { kind: 'pan'; pointerId: number; last: Point }
  | { kind: 'row'; pointerId: number; from: Point; trackId: string; sourceIndex: number; targetIndex: number; deltaY: number; deltaX: number;
      moved: boolean; nameClicked: boolean; selection: RowSelection; snapshot: SongBody['tracks'][number] }
  | { kind: 'erase'; pointerId: number; previous: Point; refs: Map<string, SongClipRef> }
  | { kind: 'clip'; pointerId: number; from: Point; lastX: number; rawDeltaX: number; clips: PickedClip[]; anchor: PickedClip; moved: boolean; valid: boolean; moves: Map<string, DragMove>; deltaX: number; deltaY: number };

/** A seconds-based, viewport-sized playlist. Song beats remain its storage boundary. */
export function mountSongWorkspace(root: HTMLElement, options: {
  song: SongEditorPort; sound: SoundRuntimePort; onSound(): void; onPhrase(): void; onWelcome(): void;
  onLibrary?(): void; onSettings?(): void; onExport?(): void; onCoCreation?(): void; onSampling?(): void;
  onOpenProject?(): void | Promise<void>; onSaveProject?(): void | Promise<void>; onSaveProjectAs?(): void | Promise<void>;
  onExit?(): void | Promise<void>;
  projectName?(): string; onRenameProject?(name: string): void;
  doubleClickIntervalMs?: number;
  phrases?(): Array<{ id: string; name: string; tempoBpm?: number; durationSeconds?: number }>;
  onRenamePhrase?(id: string, name: string, ref?: SongClipRef): void | { id: string } | Promise<void | { id: string }>; onOpenPhrase?(id: string): void;
  onNewPhrase?(tempoBpm?: number): void; onKeepPhrases?(ids: string[]): void;
  onDeletePhrase?(id: string): void | Promise<void>;
  onPreviewPhrase?(id: string, signal: AbortSignal): Promise<PlaybackSession>;
  referenceContext?: ReferenceEditorContext; onSave?(): void; onApplyElsewhere?(): void;
  onEditPhrase?(ref: SongClipRef, chooseLocations?: boolean): void; renderEntities?(): HTMLElement;
}): { dispose(): void; refresh(context?: ReferenceEditorContext, onApplyElsewhere?: () => void): void; notify(message: string, error?: boolean): void; flush(): void } {
  const { song, sound } = options;
  let disposed = false; let current = song.read(); let draftId = current.draft?.id;
  let view: PlaylistViewport = { leftSeconds: 0, top: 0, pixelsPerSecond: 88, rowHeight: 60 };
  let selected = new Set<string>(); let selectedTrack: string | undefined; let selectedPhrase: string | undefined; let gesture: Gesture | undefined;
  let viewport: HTMLElement; let content: HTMLElement; let ruler: HTMLElement; let erasures: HTMLElement;
  let notice: HTMLElement; let playButton: HTMLButtonElement; let playhead: HTMLElement; let headHandle: HTMLElement; let clock: HTMLElement; let rowControls: HTMLElement; let rowTrash: HTMLElement;
  const clipNodes = new Map<string, HTMLElement>(); const rowNodes = new Map<string, HTMLElement[]>();
  const rowCache = new Map<string, { row: HTMLElement; control: HTMLElement; track?: SongBody['tracks'][number]; armed?: boolean }>();
  let phraseSnapshot: PhraseDisplay[] = []; let phraseById = new Map<string, PhraseDisplay>();
  const phraseDurations = new Map<string, number>();
  let gridLayer: HTMLElement; let gridNodes: HTMLElement[] = []; let addTrackButton: HTMLButtonElement; let dropPreviewNode: HTMLElement;
  let createSongButton: HTMLButtonElement | undefined;
  let viewFrame = 0;
  let tempoInput: HTMLInputElement; let masterInput: HTMLInputElement;
  let frame = 0; let noticeTimer = 0; let observer: ResizeObserver | undefined;
  let fieldCommitError: string | undefined; let pendingCommit: (() => void) | undefined;
  let saveAsRequested = false; let exiting = false; let dragPhraseId: string | undefined;
  let dropPreview: { phraseId: string; seconds: number; trackIndex: number } | undefined;
  let transportState = { playing: false, preparing: false, position: 0, rate: 1 };
  let doubleNudge: { key: string; identity: string; at: number; starts: Map<string, number>; beat: number } | undefined;
  let deleteArmed: string | undefined; let deleteTimer = 0; let tempoEditAt: number | undefined; let tempoEdited = false;
  let lastNamePointer: string | undefined;
  let paletteList: HTMLElement; let newPhraseButton: HTMLElement; const phraseCards = new Map<string, HTMLElement>();
  let trash: HTMLElement; let phraseLibrary: HTMLDialogElement | undefined;
  let libraryDragId: string | undefined; let phraseDeleteDialog: HTMLDialogElement | undefined;
  let rowDeleteDialog: HTMLDialogElement | undefined;
  let lastClipPointer: SongClipRef | undefined;
  let previousClipPointer: (SongClipRef & { at: number; point: Point }) | undefined;
  let lastPointerActivation: (SongClipRef & { at: number }) | undefined;
  let shelfDrag: { id: string; source: number; target: number; startY: number; deltaY: number; pitch: number } | undefined;
  let shelfPress: { id: string; pointerId: number; from: Point; moved: boolean } | undefined;
  let previousShelfPointer: { id: string; at: number; point: Point } | undefined;
  let lastShelfActivation: { id: string; at: number } | undefined;
  let suppressShelfClick = false;
  let mixPreview: { kind: 'clip' | 'row'; trackId: string; clipId?: string; field: 'level' | 'pan'; value: number } | undefined;
  let pendingRename = 0;
  function report(message: string, error = false): void {
    if (disposed || !notice) return;
    notice.textContent = message; notice.classList.toggle('is-error', error); notice.hidden = !message;
    window.clearTimeout(noticeTimer); noticeTimer = window.setTimeout(() => { if (notice) notice.hidden = true; }, error ? 7000 : 3200);
  }
  const inspector = createSongInspector(error => report(error instanceof Error ? error.message : String(error), true));
  const transport = createPlaylistTransport({ runtime: sound, prepare: () => song.preparePreview(),
    readPlan: () => song.previewPlan(previewBody(), { allowSilence: true }),
    onError: error => report(error instanceof Error ? error.message : String(error), true),
    onChange(state) { transportState = state; updatePlayback(); },
  });
  const audition = options.onPreviewPhrase ? createSongPhraseAudition({ runtime: sound, preview: options.onPreviewPhrase,
    onChange: () => updateInspector(), onError: error => report(error instanceof Error ? error.message : String(error), true) }) : undefined;
  function auditionControls(id: string) {
    const state = audition?.read();
    return { onAudition: audition ? () => { transport.pause(); void audition.toggle(id); } : undefined,
      auditioning: state?.phraseId === id && state.playing, preparingAudition: state?.phraseId === id && state.preparing };
  }
  function previewBody(): SongBody | undefined {
    const active = gesture; let body = current.body;
    if (body && mixPreview) {
      const mix = mixPreview;
      body = { ...body, tracks: body.tracks.map(track => track.id !== mix.trackId ? track
        : mix.kind === 'row' ? { ...track, [mix.field === 'pan' ? 'panOffset' : mix.field]: mix.value }
          : { ...track, clips: track.clips.map(clip => clip.id === mix.clipId ? { ...clip, [mix.field]: mix.value } : clip) }) };
    }
    if (mixPreview && (!active || active.kind === 'head' || active.kind === 'row' || active.kind === 'pan')) return body;
    if (!body || !active || active.kind === 'head' || active.kind === 'row' || active.kind === 'pan') return undefined;
    if (active.kind === 'erase') {
      if (!active.refs.size) return undefined;
      return { ...body, tracks: body.tracks.map(track => ({ ...track, clips: track.clips.filter(clip => !active.refs.has(clip.id)) })) };
    }
    if (!active.moved || !active.valid || !active.moves.size) return undefined;
    const tracks = body.tracks.map(track => ({ ...track, clips: track.clips.filter(clip => !active.moves.has(clip.id)) }));
    for (const ref of active.clips) {
      const move = active.moves.get(ref.clipId)!; const target = tracks.find(track => track.id === move.trackId)!;
      target.clips.push({ ...ref.clip, startBeat: playlistBeats(move.seconds, body.tempoBpm) });
    }
    return { ...body, tracks };
  }
  function updatePlayback(): void {
    if (!playButton || disposed) return;
    playButton.replaceChildren(icon(transportState.playing ? 'pause' : 'play'));
    playButton.setAttribute('aria-label', transportState.preparing ? '取消播放准备' : transportState.playing ? '暂停' : '播放');
    playButton.classList.toggle('is-preparing', transportState.preparing);
    cancelAnimationFrame(frame); positionPlayhead(); if (transportState.playing) frame = requestAnimationFrame(tick);
  }
  function positionPlayhead(): void {
    const seconds = transport.position(); const x = (seconds - view.leftSeconds) * view.pixelsPerSecond;
    if (playhead) playhead.style.left = `${x}px`;
    if (headHandle) headHandle.style.left = `${x}px`;
    if (clock) { const ms = Math.round(seconds * 1000); clock.textContent = `${Math.floor(ms / 60000).toString().padStart(2, '0')}:${Math.floor(ms / 1000 % 60).toString().padStart(2, '0')}.${(ms % 1000).toString().padStart(3, '0')}`; }
    if (tempoInput && document.activeElement !== tempoInput && current.body) tempoInput.value = String(songGridTempoAt(current.body, seconds));
  }
  function tick(): void { if (disposed) return; positionPlayhead(); if (transportState.playing) frame = requestAnimationFrame(tick); }
  function sync(): void {
    current = song.read();
    phraseSnapshot = options.phrases?.() ?? current.availablePhrases;
    phraseById = new Map(phraseSnapshot.map(phrase => [phrase.id, phrase])); phraseDurations.clear();
    const phraseIds = new Set([...phraseById.keys(), ...current.body?.tracks.flatMap(track => track.clips.map(clip => clip.phraseId)) ?? []]);
    for (const id of phraseIds) {
      const beats = current.clipLengths?.[id]; const sourceSeconds = phraseById.get(id)?.durationSeconds;
      const seconds = beats !== undefined ? playlistSeconds(beats, current.body?.tempoBpm ?? 120)
        : sourceSeconds !== undefined && (!current.body || current.body.tempoMode === 'source') ? sourceSeconds
          : current.body ? playlistSeconds(song.clipLengthBeats(id), current.body.tempoBpm) : 0;
      phraseDurations.set(id, seconds);
    }
    if (draftId !== current.draft?.id) {
      draftId = current.draft?.id; selected.clear(); selectedTrack = undefined; selectedPhrase = undefined; mixPreview = undefined; inspector.cancel(); view = { ...view, leftSeconds: 0, top: 0 }; transport.stop();
    }
    const ids = new Set(current.body?.tracks.flatMap(track => track.clips.map(clip => clip.id)));
    selected = new Set([...selected].filter(id => ids.has(id)));
    if (!current.body?.tracks.some(track => track.id === selectedTrack)) selectedTrack = undefined;
    if (selectedPhrase && !phrases().some(phrase => phrase.id === selectedPhrase)) selectedPhrase = undefined;
  }
  function mutate(change: () => void, refreshAudio = true): boolean {
    if (exiting) return false;
    try { change(); fieldCommitError = undefined; sync(); if (refreshAudio) transport.refresh(); paint(); return true; }
    catch (error) { fieldCommitError = error instanceof Error ? error.message : String(error); report(fieldCommitError, true); sync(); paint(); return false; }
  }
  function duration(phraseId: string): number {
    return phraseDurations.get(phraseId) ?? 0;
  }
  function phrases(): PhraseDisplay[] { return phraseSnapshot; }
  function orderedPhrases() {
    const all = phrases().slice().sort((a, b) => a.name.localeCompare(b.name, 'zh-CN') || a.id.localeCompare(b.id));
    const order = new Map((current.body?.phraseShelfOrder ?? []).map((id, index) => [id, index]));
    return all.map((phrase, index) => ({ phrase, index })).sort((a, b) => (order.get(a.phrase.id) ?? order.size + a.index) - (order.get(b.phrase.id) ?? order.size + b.index)).map(item => item.phrase);
  }
  function shelfPhrases() { const hidden = new Set(current.body?.hiddenPhraseIds); return orderedPhrases().filter(phrase => !hidden.has(phrase.id)); }
  function picked(): PickedClip[] {
    if (selectedPhrase) return [];
    return current.body?.tracks.flatMap((track, trackIndex) => track.clips.filter(clip => selectedTrack ? track.id === selectedTrack : selected.has(clip.id))
      .map(clip => ({ trackId: track.id, clipId: clip.id, clip, trackIndex }))) ?? [];
  }
  function mixValue(kind: 'clip' | 'row', trackId: string, field: 'level' | 'pan', clipId?: string, storedOnly = false): number {
    if (!storedOnly && mixPreview?.kind === kind && mixPreview.trackId === trackId && mixPreview.field === field && mixPreview.clipId === clipId) return mixPreview.value;
    const track = current.body!.tracks.find(item => item.id === trackId)!;
    if (kind === 'row') return field === 'level' ? track.level : track.panOffset ?? 0;
    const clip = track.clips.find(item => item.id === clipId)!;
    return field === 'level' ? clip.level ?? 1 : clip.pan ?? track.pan;
  }
  function changeMix(kind: 'clip' | 'row', trackId: string, clipId: string | undefined, field: 'level' | 'pan', value: number, commit: boolean): void {
    if (exiting) return;
    if (!commit) { mixPreview = { kind, trackId, clipId, field, value }; transport.refresh(); return; }
    const before = mixValue(kind, trackId, field, clipId, true);
    mixPreview = undefined;
    if (Math.abs(before - value) < 1e-9) { updateInspector(); transport.refresh(); return; }
    mutate(() => kind === 'row' ? song.updateTrack(trackId, field === 'pan' ? { panOffset: value } : { level: value })
      : song.updateClip(trackId, clipId!, { [field]: value }));
  }
  function phraseInfo(id: string) {
    const item = phraseById.get(id);
    return { id, name: item?.name ?? '乐句', tempoBpm: item?.tempoBpm, durationSeconds: item?.durationSeconds ?? duration(id) };
  }
  function editPhrase(ref: SongClipRef): void {
    inspector.flush(); finishGesture(false); audition?.stop(); transport.pause();
    try { options.onEditPhrase?.(ref); } catch (error) { report(error instanceof Error ? error.message : String(error), true); }
  }
  function renamePhrase(id: string, name: string, ref?: SongClipRef): void {
    if (!options.onRenamePhrase) throw new Error('当前窗口暂不支持修改乐句名称。');
    const apply = (result: void | { id: string }) => { if (result && selectedPhrase === id) selectedPhrase = result.id; if (!disposed) { sync(); paint(); } };
    const result = options.onRenamePhrase(id, name, ref);
    if (result instanceof Promise) {
      pendingRename++; void result.then(apply).catch(error => { if (!disposed) { sync(); paint(); report(error instanceof Error ? error.message : String(error), true); } }).finally(() => { pendingRename--; });
    } else apply(result);
  }
  function updateInspector(): void {
    if (disposed) return;
    inspector.element.style.visibility = '';
    if (!current.body) { inspector.update(); return; }
    const focusedPhrase = selectedPhrase ?? (!selectedTrack && picked().length === 1 ? picked()[0]!.clip.phraseId : undefined);
    if (audition?.read().phraseId && audition.read().phraseId !== focusedPhrase) audition.stop();
    let data: SongInspectorView | undefined;
    if (selectedPhrase) {
      const info = phraseInfo(selectedPhrase); const id = selectedPhrase;
      data = { key: `phrase:${id}`, kind: 'phrase', name: info.name, ...auditionControls(id),
        details: [{ label: '时长', value: `${Number(info.durationSeconds.toFixed(3))} 秒` }],
        onRename: options.onRenamePhrase ? name => renamePhrase(id, name) : undefined,
        onDetail: () => { inspector.flush(); transport.pause(); options.onOpenPhrase?.(id); } };
    } else if (selectedTrack) {
      const track = current.body.tracks.find(item => item.id === selectedTrack)!;
      data = { key: `row:${track.id}`, kind: 'row', name: track.name, color: track.color,
        details: [], level: mixValue('row', track.id, 'level'), pan: mixValue('row', track.id, 'pan'),
        onRename: name => mutate(() => song.updateTrack(track.id, { name }), false),
        onColor: () => colorRow(track.id), onMix: (field, value, commit) => changeMix('row', track.id, undefined, field, value, commit) };
    } else {
      const refs = picked();
      if (refs.length === 1) {
        const ref = refs[0]!; const info = phraseInfo(ref.clip.phraseId);
        data = { key: `clip:${ref.clipId}`, kind: 'clip', name: info.name, ...auditionControls(ref.clip.phraseId),
          details: [{ label: 'BPM', value: info.tempoBpm === undefined ? '—' : String(info.tempoBpm) },
            { label: '时长', value: `${Number(info.durationSeconds.toFixed(3))} 秒` },
            { label: '播放时间点', value: `${playlistSeconds(ref.clip.startBeat, current.body.tempoBpm).toFixed(3)} 秒` }],
          level: mixValue('clip', ref.trackId, 'level', ref.clipId), pan: mixValue('clip', ref.trackId, 'pan', ref.clipId),
          onRename: options.onRenamePhrase ? name => renamePhrase(ref.clip.phraseId, name, ref) : undefined,
          onDetail: () => editPhrase(ref), onMix: (field, value, commit) => changeMix('clip', ref.trackId, ref.clipId, field, value, commit) };
      }
    }
    inspector.update(data);
  }
  function selectPhrase(id: string): void {
    if (disposed || exiting) return;
    previousClipPointer = undefined; lastClipPointer = undefined;
    inspector.flush(); finishGesture(false); selectedPhrase = id; selectedTrack = undefined; selected.clear(); doubleNudge = undefined;
    viewport.focus({ preventScroll: true }); paint();
  }
  function openShelfPhrase(id: string): void {
    if (disposed || exiting || !shelfPhrases().some(phrase => phrase.id === id) || !options.onOpenPhrase) return;
    inspector.flush(); finishGesture(false); audition?.stop(); transport.pause();
    previousShelfPointer = undefined; lastShelfActivation = { id, at: Date.now() };
    try { options.onOpenPhrase(id); } catch (error) { report(error instanceof Error ? error.message : String(error), true); }
  }
  function finishShelfPress(event: PointerEvent): void {
    const press = shelfPress; if (!press || press.pointerId !== event.pointerId) return; shelfPress = undefined;
    if (disposed || exiting || suppressShelfClick || press.moved || Math.hypot(event.clientX - press.from.x, event.clientY - press.from.y) > 6) { previousShelfPointer = undefined; suppressShelfClick = true; return; }
    const previous = previousShelfPointer; const now = Date.now();
    const interval = options.doubleClickIntervalMs && Number.isFinite(options.doubleClickIntervalMs) ? options.doubleClickIntervalMs : 400;
    const paired = previous?.id === press.id && now - previous.at <= interval && Math.hypot(previous.point.x - press.from.x, previous.point.y - press.from.y) <= 6;
    previousShelfPointer = paired ? undefined : { id: press.id, at: now, point: press.from };
    if (paired) openShelfPhrase(press.id);
  }
  function syncPalette(): void {
    if (!paletteList) return;
    const items = shelfPhrases(); const ids = new Set(items.map(item => item.id));
    for (const [id, card] of phraseCards) if (!ids.has(id) && id !== dragPhraseId) { card.remove(); phraseCards.delete(id); }
    for (const phrase of items) {
      let card = phraseCards.get(phrase.id);
      if (!card) {
        card = node('div', 'song-phrase-card'); card.draggable = true; card.tabIndex = 0; card.dataset.phraseId = phrase.id;
        card.addEventListener('pointerdown', event => {
          if (disposed || exiting || event.button !== 0) return;
          suppressShelfClick = false; shelfPress = { id: phrase.id, pointerId: event.pointerId, from: { x: event.clientX, y: event.clientY }, moved: false };
        });
        card.addEventListener('click', () => { if (!suppressShelfClick && !(lastShelfActivation?.id === phrase.id && Date.now() - lastShelfActivation.at < 500)) selectPhrase(phrase.id); });
        card.addEventListener('dblclick', event => {
          if (disposed || exiting || suppressShelfClick || dragPhraseId) return; event.preventDefault(); event.stopPropagation();
          if (lastShelfActivation?.id === phrase.id && Date.now() - lastShelfActivation.at < 500) return;
          openShelfPhrase(phrase.id);
        });
        card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectPhrase(phrase.id); } });
        card.addEventListener('dragstart', event => {
          if (!event.dataTransfer || exiting) { event.preventDefault(); return; }
          shelfPress = undefined; previousShelfPointer = undefined; lastShelfActivation = undefined; suppressShelfClick = true;
          inspector.flush(); finishGesture(false); dragPhraseId = phrase.id;
          const items = shelfPhrases(); const index = items.findIndex(item => item.id === phrase.id);
          const first = phraseCards.get(items[0]?.id ?? '')!; const second = phraseCards.get(items[1]?.id ?? '');
          const layoutPitch = second ? second.offsetTop - first.offsetTop : first.offsetHeight + 12;
          const pitch = Number.isFinite(layoutPitch) && layoutPitch > 0 ? layoutPitch
            : second ? Math.abs(second.getBoundingClientRect().top - first.getBoundingClientRect().top) : first.getBoundingClientRect().height + 12;
          shelfDrag = { id: phrase.id, source: index, target: index, startY: event.clientY, deltaY: 0, pitch };
          updateInspector();
          event.dataTransfer.effectAllowed = 'copyMove'; event.dataTransfer.setData('application/x-rootsound-phrase', phrase.id); showTrash('shelf');
        });
        card.addEventListener('dragend', () => { resetShelfDrag(); dropPreview = undefined; hideTrash(); paint(); });
        phraseCards.set(phrase.id, card); paletteList.append(card);
      }
      card.textContent = phrase.name; card.title = phrase.name; const color = playlistPhraseColor(phrase.id);
      card.style.backgroundColor = color; card.style.color = playlistColorInk(color); card.classList.toggle('is-selected', selectedPhrase === phrase.id);
      card.setAttribute('aria-selected', String(selectedPhrase === phrase.id));
    }
    if (!shelfDrag) {
      const cards = items.flatMap(item => phraseCards.get(item.id) ?? []);
      if (cards.some((card, index) => paletteList.children[index] !== card)) for (const card of cards) paletteList.append(card);
    }
    newPhraseButton?.classList.toggle('is-highlighted', !items.length);
  }
  function resetShelfDrag(): void {
    shelfDrag = undefined; dragPhraseId = undefined; paletteList?.classList.remove('is-sorting');
    for (const card of phraseCards.values()) { card.style.transform = ''; card.classList.remove('is-shelf-dragging'); }
  }
  function reorderShelfPreview(event: DragEvent): void {
    if (!shelfDrag || !dragPhraseId || exiting || !event.dataTransfer) return;
    event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = 'move';
    const items = shelfPhrases(); const pitch = shelfDrag.pitch;
    if (pitch <= 0) return;
    const drag = shelfDrag; drag.deltaY = event.clientY - drag.startY;
    drag.target = clampPlaylist(drag.source + Math.round(drag.deltaY / pitch), 0, items.length - 1);
    paletteList.classList.add('is-sorting');
    items.forEach((item, index) => {
      const card = phraseCards.get(item.id); if (!card) return;
      const delta = item.id === drag.id ? drag.deltaY
        : drag.target > drag.source && index > drag.source && index <= drag.target ? -pitch
          : drag.target < drag.source && index >= drag.target && index < drag.source ? pitch : 0;
      card.style.transform = `translateY(${delta}px)`; card.classList.toggle('is-shelf-dragging', item.id === drag.id);
    });
  }
  function dropShelfOrder(event: DragEvent): void {
    if (!shelfDrag || !dragPhraseId || exiting || !event.dataTransfer) return;
    event.preventDefault(); event.stopPropagation();
    const drag = shelfDrag; const id = readDropId(event.dataTransfer);
    resetShelfDrag(); hideTrash();
    if (id === drag.id && drag.source !== drag.target) mutate(() => song.reorderPhraseShelf(drag.id, drag.target), false);
    else paint();
  }
  function openPhraseLibrary(): void {
    if (exiting || phraseLibrary) return;
    inspector.flush(); finishGesture(false); audition?.stop(); transport.pause();
    const dialog = node('dialog', 'song-phrase-library'); phraseLibrary = dialog;
    dialog.setAttribute('aria-label', '乐句库'); const heading = node('header', 'song-library-heading');
    let opening = false; const addTimers = new Map<string, { timer: number }>();
    const cancelAdd = (id?: string) => { for (const [key, pending] of addTimers) if (!id || key === id) { window.clearTimeout(pending.timer); addTimers.delete(key); } };
    heading.append(node('h2', '', '乐句库'), action('→', 'song-library-close', () => { if (!opening) dialog.close(); }));
    heading.querySelector('button')!.setAttribute('aria-label', '返回歌曲编排');
    const grid = node('div', 'song-library-grid'); let suppressClickUntil = 0;
    const openError = node('p', 'song-library-open-error'); openError.setAttribute('role', 'alert'); openError.hidden = true;
    const active = () => !disposed && phraseLibrary === dialog;
    const resetDrag = () => { libraryDragId = undefined; hideTrash(); updateInspector(); };
    const refreshLibrary = () => {
      if (!active()) return;
      grid.replaceChildren(); const visible = new Set(shelfPhrases().map(phrase => phrase.id));
      for (const phrase of phrases()) {
        const tile = node('div', 'song-library-phrase', phrase.name); tile.tabIndex = 0; tile.setAttribute('role', 'button');
        const toggle = () => {
          addTimers.delete(phrase.id); if (!active() || opening || phraseDeleteDialog || libraryDragId) return;
          const shown = shelfPhrases().some(item => item.id === phrase.id);
          const focused = document.activeElement === tile;
          if (mutate(() => { song.setPhraseShelfVisible(phrase.id, !shown); if (shown && selectedPhrase === phrase.id) selectedPhrase = undefined; }, false)) {
            refreshLibrary(); if (focused) [...grid.querySelectorAll<HTMLElement>('.song-library-phrase')].find(item => item.dataset.phraseId === phrase.id)?.focus({ preventScroll: true });
          }
        };
        tile.addEventListener('click', () => {
          if (!active() || opening || phraseDeleteDialog || libraryDragId || Date.now() < suppressClickUntil) return;
          cancelAdd(phrase.id); const pending = { timer: 0 };
          pending.timer = window.setTimeout(() => { if (addTimers.get(phrase.id) === pending) toggle(); }, libraryClickDelay(options.doubleClickIntervalMs));
          addTimers.set(phrase.id, pending);
        });
        tile.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); cancelAdd(phrase.id); toggle(); } });
        tile.addEventListener('dblclick', event => {
          event.preventDefault(); event.stopPropagation(); cancelAdd();
          if (!active() || opening || phraseDeleteDialog || libraryDragId || Date.now() < suppressClickUntil || !phrases().some(item => item.id === phrase.id)) return;
          opening = true; openError.hidden = true;
          try {
            if (!options.onOpenPhrase) throw new Error('当前窗口暂不支持打开乐句，请重新打开 RootSound。');
            prepareFileAction(); options.onOpenPhrase(phrase.id);
            if (active()) dialog.close();
          } catch (reason) {
            if (active()) { openError.textContent = reason instanceof Error ? reason.message : String(reason); openError.hidden = false; }
          } finally { opening = false; }
        });
        tile.draggable = true; tile.dataset.phraseId = phrase.id; tile.title = phrase.name; tile.classList.toggle('is-on-shelf', visible.has(phrase.id));
        tile.classList.toggle('is-selected', visible.has(phrase.id)); tile.setAttribute('aria-pressed', String(visible.has(phrase.id)));
        tile.setAttribute('aria-label', `${visible.has(phrase.id) ? '隐藏' : '显示'}${phrase.name}`);
        tile.addEventListener('dragstart', event => {
          cancelAdd();
          if (!active() || opening || phraseDeleteDialog || !event.dataTransfer) { event.preventDefault(); return; }
          libraryDragId = phrase.id; suppressClickUntil = Date.now() + 250; updateInspector();
          event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('application/x-rootsound-library-phrase', phrase.id); showTrash('library');
        });
        tile.addEventListener('dragend', () => { if (!active()) return; suppressClickUntil = Date.now() + 250; resetDrag(); });
        grid.append(tile);
      }
      const create = action('+', 'song-library-new', () => {
        cancelAdd(); if (!active() || opening || phraseDeleteDialog || libraryDragId) return;
        try {
          prepareFileAction();
          const tempoBpm = current.body ? songGridTempoAt(current.body, transport.position()) : 120;
          dialog.close();
          if (options.onNewPhrase) options.onNewPhrase(tempoBpm); else options.onPhrase();
        }
        catch (error) { report(error instanceof Error ? error.message : String(error), true); }
      });
      create.setAttribute('aria-label', '新建乐句'); grid.append(create);
    };
    const requestDelete = (id: string) => {
      if (!active() || phraseDeleteDialog) return;
      const phrase = phrases().find(item => item.id === id); if (!phrase) return;
      const warning = node('dialog', 'song-library-delete-dialog'); phraseDeleteDialog = warning;
      warning.setAttribute('aria-label', '彻底删除乐句'); warning.append(node('h2', '', '彻底删除乐句？'),
        node('p', '', `“${phrase.name}”及其使用位置将从当前工程移除，相关撤销记录会清除。保存工程后生效；保存前仍可退出并放弃本次修改。`));
      const error = node('p', 'song-library-delete-error'); error.hidden = true; error.setAttribute('role', 'alert');
      let busy = false;
      const cancel = action('取消', 'song-library-delete-cancel', () => { if (!busy) warning.close(); });
      const confirm = action('彻底删除', 'song-library-delete-confirm', () => { void remove(); });
      async function remove(): Promise<void> {
        if (busy || !active() || phraseDeleteDialog !== warning) return;
        busy = true; cancel.disabled = true; confirm.disabled = true; error.hidden = true;
        try {
          if (!options.onDeletePhrase) throw new Error('当前窗口暂不支持删除乐句，请重新打开 RootSound。');
          await options.onDeletePhrase(id);
          if (!active() || phraseDeleteDialog !== warning) return;
          warning.close(); sync(); paint(); refreshLibrary(); transport.refresh();
        } catch (reason) {
          if (active() && phraseDeleteDialog === warning) { error.textContent = reason instanceof Error ? reason.message : String(reason); error.hidden = false; }
        } finally { busy = false; if (active()) { cancel.disabled = false; confirm.disabled = false; } }
      }
      const buttons = node('div', 'song-library-delete-actions'); buttons.append(cancel, confirm); warning.append(error, buttons);
      warning.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
      warning.addEventListener('close', () => { if (phraseDeleteDialog === warning) phraseDeleteDialog = undefined; warning.remove(); }, { once: true });
      root.append(warning); warning.showModal(); cancel.focus();
    };
    const libraryDrop = (event: DragEvent) => {
      if (!active() || !libraryDragId || !event.dataTransfer) return;
      event.preventDefault(); event.stopPropagation();
      const id = event.dataTransfer.getData('application/x-rootsound-library-phrase');
      if (id !== libraryDragId) return;
      resetDrag(); requestDelete(id);
    };
    trash.addEventListener('drop', libraryDrop);
    refreshLibrary(); dialog.append(heading, grid, openError, trash);
    dialog.addEventListener('cancel', event => { if (opening) event.preventDefault(); });
    dialog.addEventListener('click', event => { if (!opening && event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      cancelAdd(); resetDrag(); trash.removeEventListener('drop', libraryDrop); phraseDeleteDialog?.close();
      viewport.append(trash); dialog.remove();
      if (phraseLibrary === dialog) phraseLibrary = undefined; if (!disposed && !opening) newPhraseButton?.focus();
    }, { once: true });
    root.append(dialog); dialog.showModal();
  }
  function showTrash(source: 'shelf' | 'playlist' | 'library', over = false): void {
    if (!trash) return;
    trash.hidden = false; trash.classList.toggle('is-over', over); trash.dataset.source = source;
    const label = source === 'library' ? '彻底删除乐句' : source === 'shelf' ? '从乐句栏移除' : '从播放列表移除'; trash.setAttribute('aria-label', label);
  }
  function hideTrash(): void { if (trash) { trash.hidden = true; trash.classList.remove('is-over'); } }
  function overTrash(event: Pick<PointerEvent, 'clientX' | 'clientY'>): boolean {
    if (!trash || trash.hidden) return false;
    const rect = trash.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.left + rect.width && event.clientY >= rect.top && event.clientY <= rect.top + rect.height;
  }
  function shelfDragMove(event: DragEvent): void {
    if ((!dragPhraseId && !libraryDragId) || exiting) return;
    const over = overTrash(event); showTrash(libraryDragId ? 'library' : 'shelf', over);
    if (over) { event.preventDefault(); if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'; if (dropPreview) { dropPreview = undefined; paint(); } }
  }
  function shelfTrashDrop(event: DragEvent): void {
    event.preventDefault(); event.stopPropagation(); if (exiting || !dragPhraseId || !event.dataTransfer) return;
    const id = readDropId(event.dataTransfer); if (id !== dragPhraseId) return;
    resetShelfDrag(); dropPreview = undefined; hideTrash();
    mutate(() => { song.setPhraseShelfVisible(id, false); if (selectedPhrase === id) selectedPhrase = undefined; }, false);
  }
  function localPoint(event: Pick<PointerEvent, 'clientX' | 'clientY'>): Point {
    const bounds = content.getBoundingClientRect(); return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }
  function trackAt(point: Point): number | undefined { return point.x < 0 ? undefined : playlistTrackAt(point.y, view.top, view.rowHeight, current.body?.tracks.length ?? 0); }
  function timeAt(x: number): number { return view.leftSeconds + x / view.pixelsPerSecond; }
  function clipRect(ref: PickedClip) {
    return playlistClipRect(playlistSeconds(ref.clip.startBeat, current.body!.tempoBpm), duration(ref.clip.phraseId), ref.trackIndex, view);
  }
  function flashErase(ref: PickedClip): void {
    const rect = clipRect(ref); const ghost = node('div', 'song-clip-erasure');
    Object.assign(ghost.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    ghost.append(node('span')); erasures.append(ghost); ghost.addEventListener('animationend', () => ghost.remove(), { once: true }); window.setTimeout(() => ghost.remove(), 350);
  }
  function sweep(from: Point, to: Point, target: Extract<Gesture, { kind: 'erase' }>): void {
    const body = current.body; if (!body) return; const previousCount = target.refs.size;
    body.tracks.forEach((track, trackIndex) => track.clips.forEach(clip => {
      if (target.refs.has(clip.id)) return;
      const ref = { trackId: track.id, clipId: clip.id, clip, trackIndex };
      if (!playlistSegmentIntersectsRect(from, to, clipRect(ref))) return;
      target.refs.set(clip.id, { trackId: track.id, clipId: clip.id }); selected.delete(clip.id); flashErase(ref);
    })); paint(); if (target.refs.size !== previousCount) transport.refresh();
  }
  function finishGesture(commit = true, toTrash = false, rowReleased = false): void {
    const finished = gesture; gesture = undefined; viewport?.classList.remove('is-erasing', 'is-moving-clip', 'is-moving-row');
    viewport?.classList.remove('is-deleting-row');
    if (gridLayer) gridLayer.style.maskImage = '';
    if (rowTrash) { rowTrash.hidden = true; rowTrash.style.opacity = '0'; rowTrash.classList.remove('is-armed'); }
    if (!dragPhraseId) hideTrash();
    if (!finished) return;
    if (viewport.hasPointerCapture?.(finished.pointerId)) viewport.releasePointerCapture(finished.pointerId);
    if (finished.kind === 'head') { positionPlayhead(); return; }
    if (finished.kind === 'pan') { viewport.classList.remove('is-panning'); return; }
    if (finished.kind === 'clip' && !finished.moved) {
      const ref = { trackId: finished.anchor.trackId, clipId: finished.anchor.clipId };
      lastClipPointer = commit && previousClipPointer?.clipId === ref.clipId && previousClipPointer.trackId === ref.trackId ? ref : undefined;
      const now = Date.now(); const previous = previousClipPointer;
      const paired = !!lastClipPointer && !!previous && now - previous.at <= 400
        && Math.hypot(finished.from.x - previous.point.x, finished.from.y - previous.point.y) <= 6;
      previousClipPointer = commit && !paired ? { ...ref, at: now, point: finished.from } : undefined;
      updateSelection();
      if (paired) { lastPointerActivation = { ...ref, at: now }; editPhrase(ref); }
      return;
    }
    previousClipPointer = undefined; lastClipPointer = undefined;
    if (finished.kind === 'row' && !finished.moved) {
      lastNamePointer = commit && finished.nameClicked ? finished.trackId : undefined;
      return;
    }
    if (finished.kind === 'row' && finished.moved) lastNamePointer = undefined;
    if (finished.kind === 'row' && (!commit || !rowReleased || finished.deltaX >= rowTravelLimit())) {
      if (!commit || !rowReleased) restoreRowSelection(finished.selection);
      settleRowDrag(finished);
      if (commit && rowReleased && finished.deltaX >= rowTravelLimit()) requestRowDeletion(finished.trackId, finished.snapshot, finished.selection);
      return;
    }
    const oldRects = new Map([...clipNodes].map(([id, element]) => [id, element.getBoundingClientRect()]));
    const oldRows = new Map([...rowNodes].map(([id, elements]) => [id, elements.slice(0, 2).map(element => element.getBoundingClientRect())]));
    if (commit && finished.kind === 'erase' && finished.refs.size) removeRefs([...finished.refs.values()], false);
    else if (commit && finished.kind === 'row' && finished.moved) mutate(() => song.reorderTrack(finished.trackId, finished.targetIndex), false);
    else if (commit && toTrash && finished.kind === 'clip' && finished.moved) { finished.clips.forEach(flashErase); removeRefs(finished.clips, false); }
    else if (commit && finished.kind === 'clip' && finished.moved && finished.valid) {
      const tempo = current.body!.tempoBpm;
      mutate(() => song.moveClips(finished.clips.map(ref => ({ trackId: ref.trackId, clipId: ref.clipId,
        targetTrackId: finished.moves.get(ref.clipId)!.trackId, startBeat: playlistBeats(finished.moves.get(ref.clipId)!.seconds, tempo) }))), false);
    } else paint();
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && (finished.kind === 'clip' || finished.kind === 'row')) for (const [id, element] of clipNodes) {
      const previous = oldRects.get(id); if (!previous) continue; const next = element.getBoundingClientRect();
      element.animate?.([{ transform: `translate(${previous.left - next.left}px, ${previous.top - next.top}px)` }, { transform: 'translate(0, 0)' }], { duration: 130, easing: 'ease-out' });
    }
    if (!reduceMotion && finished.kind === 'row') for (const [id, elements] of rowNodes) elements.slice(0, 2).forEach((element, index) => {
      const previous = oldRows.get(id)?.[index]; if (!previous) return; const next = element.getBoundingClientRect();
      element.animate?.([{ transform: `translate(${previous.left - next.left}px, ${previous.top - next.top}px)` }, { transform: 'translate(0, 0)' }], { duration: 130, easing: 'ease-out' });
    });
    if (finished.kind !== 'row') transport.refresh();
  }
  function rowTravelLimit(): number { return rowControls.getBoundingClientRect().width || rowControls.clientWidth || 144; }
  function settleRowDrag(active: Extract<Gesture, { kind: 'row' }>): void {
    const before = new Map([...rowNodes.values()].flat().map(element => [element, element.getBoundingClientRect()]));
    paint();
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !active.moved) return;
    for (const [element, previous] of before) {
      if (!element.parentElement) continue;
      const next = element.getBoundingClientRect();
      element.animate?.([{ transform: `translate(${previous.left - next.left}px, ${previous.top - next.top}px)` }, { transform: 'translate(0, 0)' }], { duration: 130, easing: 'ease-out' });
    }
  }
  function updateRowDrag(active: Extract<Gesture, { kind: 'row' }>, event: Pick<PointerEvent, 'clientX' | 'clientY'>): void {
    const dx = event.clientX - active.from.x; const dy = event.clientY - active.from.y;
    if (!active.moved && Math.hypot(dx, dy) < 3) return;
    active.moved = true;
    active.deltaX = clampPlaylist(dx * ROW_HORIZONTAL_DRAG_RATE, 0, rowTravelLimit());
    active.deltaY = clampPlaylist(dy, -active.sourceIndex * view.rowHeight, (current.body!.tracks.length - 1 - active.sourceIndex) * view.rowHeight);
    active.targetIndex = clampPlaylist(active.sourceIndex + Math.round(active.deltaY / view.rowHeight), 0, current.body!.tracks.length - 1);
  }
  function updateSelection(): void {
    for (const [id, block] of clipNodes) {
      const track = current.body?.tracks.find(item => item.id === block.dataset.trackId);
      const clip = track?.clips.find(item => item.id === id);
      const value = !!clip && (selected.has(id) || selectedTrack === track!.id || selectedPhrase === clip.phraseId);
      block.classList.toggle('is-selected', value); block.setAttribute('aria-pressed', String(value));
    }
    syncPalette(); updateInspector();
  }
  function selectRow(id: string): void {
    if (exiting) return;
    inspector.flush(); selectedPhrase = undefined;
    lastNamePointer = undefined;
    selected.clear(); selectedTrack = id; doubleNudge = undefined;
    if (deleteArmed && deleteArmed !== id) {
      deleteArmed = undefined; window.clearTimeout(deleteTimer);
      for (const button of rowControls.querySelectorAll('.song-row-delete')) button.classList.remove('is-armed');
    }
    for (const element of rowControls.querySelectorAll<HTMLElement>('.song-row-control')) {
      element.classList.toggle('is-selected', element.dataset.trackId === id); element.setAttribute('aria-selected', String(element.dataset.trackId === id));
    }
    for (const element of content.querySelectorAll<HTMLElement>('.song-clip')) {
      element.classList.toggle('is-selected', element.dataset.trackId === id); element.setAttribute('aria-pressed', String(element.dataset.trackId === id));
    }
    updateInspector(); syncPalette();
  }
  function activateRowName(name: HTMLInputElement, trackId: string): void {
    if (exiting) return;
    if (deleteArmed) { deleteArmed = undefined; window.clearTimeout(deleteTimer); for (const button of rowControls.querySelectorAll('.song-row-delete')) button.classList.remove('is-armed'); }
    selectRow(trackId); name.readOnly = false; name.focus(); name.select?.();
  }
  function pointerDown(event: PointerEvent): void {
    if (disposed || exiting || rowDeleteDialog || !current.body || (event.button !== 0 && event.button !== 2)) return;
    const target = event.target as Element;
    const rowName = target.closest<HTMLInputElement>('.song-row-name');
    if (target.closest('.song-add-track') || (rowName && !rowName.readOnly) || target.closest('.song-row-color') || target.closest('.song-row-delete') || target.closest('.song-row-mix-button') || target.closest('.song-empty-curtain')) return;
    inspector.flush(); finishGesture(false); lastNamePointer = undefined; const point = localPoint(event);
    lastClipPointer = undefined;
    if (event.button === 0 && (target.closest('.song-playhead-handle') || target.closest('.song-ruler'))) {
      previousClipPointer = undefined;
      event.preventDefault(); viewport.focus({ preventScroll: true });
      audition?.stop();
      gesture = { kind: 'head', pointerId: event.pointerId }; transport.seek(Math.max(0, timeAt(point.x))); positionPlayhead();
    } else if (target.closest('.song-row-control')) {
      previousClipPointer = undefined;
      if (event.button !== 0) return; event.preventDefault(); viewport.focus({ preventScroll: true });
      const selection = readRowSelection();
      const id = target.closest<HTMLElement>('.song-row-control')!.dataset.trackId!; selectRow(id);
      const index = current.body.tracks.findIndex(track => track.id === id);
      gesture = { kind: 'row', pointerId: event.pointerId, from: { x: event.clientX, y: event.clientY }, trackId: id,
        sourceIndex: index, targetIndex: index, deltaX: 0, deltaY: 0, moved: false, nameClicked: !!rowName,
        selection, snapshot: structuredClone(current.body.tracks[index]!) };
    } else {
      if (point.x < 0 || point.y < 0 || !phrases().length) return;
      event.preventDefault(); viewport.focus({ preventScroll: true }); selectedTrack = undefined; selectedPhrase = undefined; deleteArmed = undefined;
      if (event.button === 2) {
        previousClipPointer = undefined;
        const hitsClip = current.body.tracks.some((track, trackIndex) => track.clips.some(clip =>
          playlistSegmentIntersectsRect(point, point, clipRect({ trackId: track.id, clipId: clip.id, clip, trackIndex }))));
        if (!hitsClip) selected.clear();
        doubleNudge = undefined; window.clearTimeout(deleteTimer);
        gesture = { kind: 'erase', pointerId: event.pointerId, previous: point, refs: new Map() }; viewport.classList.add('is-erasing'); sweep(point, point, gesture);
      } else {
        const clipId = target.closest<HTMLElement>('.song-clip')?.dataset.clipId;
        if (clipId) {
          if (event.ctrlKey || event.metaKey) { if (selected.has(clipId)) selected.delete(clipId); else selected.add(clipId); }
          else if (!selected.has(clipId)) selected = new Set([clipId]);
          const clips = picked(); const anchor = clips.find(ref => ref.clipId === clipId); if (!anchor) { paint(); return; }
          gesture = { kind: 'clip', pointerId: event.pointerId, from: point, lastX: point.x, rawDeltaX: 0, clips, anchor, moved: false, valid: true, moves: new Map(), deltaX: 0, deltaY: 0 }; viewport.classList.add('is-moving-clip');
        } else {
          previousClipPointer = undefined;
          selected.clear(); gesture = { kind: 'pan', pointerId: event.pointerId, last: { x: event.clientX, y: event.clientY } }; viewport.classList.add('is-panning');
        }
        lastNamePointer = undefined;
        doubleNudge = undefined; updateSelection();
      }
    }
    if (gesture) viewport.setPointerCapture?.(event.pointerId);
  }
  function paintGesture(): void {
    const active = gesture; if (!active) return;
    if (active.kind === 'clip') for (const ref of active.clips) {
      const block = clipNodes.get(ref.clipId); if (!block) continue;
      block.style.transform = `translate(${active.deltaX}px, ${active.deltaY}px)`;
      block.classList.toggle('is-dragging', active.moved); block.classList.toggle('is-invalid', !active.valid);
    }
    if (active.kind === 'row') {
      const limit = rowTravelLimit(); active.deltaX = clampPlaylist(active.deltaX, 0, limit);
      const progress = active.deltaX / limit;
      const top = active.sourceIndex * view.rowHeight - view.top + active.deltaY;
      rowTrash.hidden = progress === 0;
      viewport.classList.toggle('is-deleting-row', progress > 0);
      if (progress > 0) {
        rowTrash.style.top = `${top}px`; rowTrash.style.height = `${view.rowHeight}px`;
        rowTrash.style.opacity = String(progress ** 2);
        rowTrash.classList.toggle('is-armed', progress >= 1);
      }
      // The beat lines share one reused layer. Mask only the dragged row's
      // visible band, so the other rows retain their full grid contrast.
      const bandTop = Math.max(0, top); const bandBottom = Math.max(bandTop, top + view.rowHeight);
      const ink = `rgba(0, 0, 0, ${1 - progress})`;
      gridLayer.style.maskImage = progress > 0 ? `linear-gradient(to bottom, #000 0px, #000 ${bandTop}px, ${ink} ${bandTop}px, ${ink} ${bandBottom}px, #000 ${bandBottom}px, #000 100%)` : '';
      current.body!.tracks.forEach((track, index) => {
      let shift = 0;
      if (track.id === active.trackId) shift = active.deltaY;
      else if (active.targetIndex > active.sourceIndex && index > active.sourceIndex && index <= active.targetIndex) shift = -view.rowHeight;
      else if (active.targetIndex < active.sourceIndex && index >= active.targetIndex && index < active.sourceIndex) shift = view.rowHeight;
      for (const element of rowNodes.get(track.id) ?? []) {
        element.style.transform = track.id === active.trackId ? `translate(${active.deltaX}px, ${shift}px)` : `translateY(${shift}px)`;
        element.classList.toggle('is-row-dragging', track.id === active.trackId && active.moved);
      }
      });
    }
  }
  function pointerMove(event: PointerEvent): void {
    if (shelfPress?.pointerId === event.pointerId && Math.hypot(event.clientX - shelfPress.from.x, event.clientY - shelfPress.from.y) > 6) { shelfPress.moved = true; previousShelfPointer = undefined; suppressShelfClick = true; }
    const active = gesture; if (!active || active.pointerId !== event.pointerId) return;
    event.preventDefault();
    if (active.kind === 'pan') {
      view.leftSeconds -= (event.clientX - active.last.x) / view.pixelsPerSecond;
      view.top -= event.clientY - active.last.y;
      active.last = { x: event.clientX, y: event.clientY }; constrainTop(); scheduleViewportPaint(); return;
    }
    const point = localPoint(event);
    if (active.kind === 'head') { transport.seek(Math.max(0, timeAt(point.x))); positionPlayhead(); return; }
    if (active.kind === 'erase') { sweep(active.previous, point, active); active.previous = point; return; }
    if (active.kind === 'row') {
      updateRowDrag(active, event); if (!active.moved) return;
      viewport.classList.add('is-moving-row'); paintGesture(); return;
    }
    if (Math.hypot(point.x - active.from.x, point.y - active.from.y) < 4 && !active.moved) return;
    active.moved = true; const targetRow = trackAt(point); const trackDelta = (targetRow ?? -999) - active.anchor.trackIndex;
    active.valid = point.x >= 0 && targetRow !== undefined && active.clips.every(ref => ref.trackIndex + trackDelta >= 0 && ref.trackIndex + trackDelta < current.body!.tracks.length);
    const earliest = Math.min(...active.clips.map(ref => playlistSeconds(ref.clip.startBeat, current.body!.tempoBpm)));
    active.rawDeltaX = Math.max(-earliest * view.pixelsPerSecond, active.rawDeltaX + (point.x - active.lastX) * (event.shiftKey ? .1 : 1)); active.lastX = point.x;
    active.deltaX = active.rawDeltaX; active.deltaY = point.y - active.from.y;
    showTrash('playlist'); trash.classList.toggle('is-over', overTrash(event));
    if (active.valid) {
      const delta = Math.max(-earliest, active.deltaX / view.pixelsPerSecond);
      active.moves = new Map(active.clips.map(ref => [ref.clipId, { trackId: current.body!.tracks[ref.trackIndex + trackDelta]!.id,
        seconds: playlistSeconds(ref.clip.startBeat, current.body!.tempoBpm) + delta }]));
    }
    paintGesture(); transport.refresh();
  }
  function constrainTop(): void {
    view.leftSeconds = Math.max(0, view.leftSeconds);
    view.top = clampPlaylist(view.top, 0, Math.max(0, ((current.body?.tracks.length ?? 0) + 1) * view.rowHeight - (content?.clientHeight || 300)));
  }
  function wheel(event: WheelEvent): void {
    if (exiting) { event.preventDefault(); return; }
    lastNamePointer = undefined;
    event.preventDefault(); if (gesture) finishGesture(gesture.kind !== 'row'); const point = localPoint(event);
    const overControls = !!(event.target as Element | null)?.closest?.('.song-row-controls');
    const vertical = overControls ? !event.shiftKey : event.shiftKey;
    if (event.ctrlKey || event.metaKey) view = zoomPlaylist(view, Math.max(0, point.x), point.y, Math.exp(-(event.deltaY || event.deltaX) * .002), vertical);
    else if (vertical) view.top += event.deltaY || event.deltaX;
    else view.leftSeconds = Math.max(0, view.leftSeconds + (event.deltaX || event.deltaY) / view.pixelsPerSecond);
    constrainTop(); scheduleViewportPaint();
  }
  function readDropId(transfer: DataTransfer): string | undefined {
    const entity = readEntityDrag(transfer); return (entity?.kind === 'rootsound.phrase' ? entity.id : transfer.getData('application/x-rootsound-phrase')) || dragPhraseId;
  }
  function dragOver(event: DragEvent): void {
    if (exiting) return;
    if (!event.dataTransfer || !event.dataTransfer.types.some(type => type === 'application/x-rootsound-phrase' || type === 'application/x-rootsound-entity')) return;
    const point = localPoint(event); const index = trackAt(point); if (index === undefined) { dropPreview = undefined; scheduleViewportPaint(); return; }
    event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; const id = readDropId(event.dataTransfer);
    if (id && phrases().some(phrase => phrase.id === id)) {
      const raw = Math.max(0, timeAt(point.x));
      dropPreview = { phraseId: id, seconds: raw, trackIndex: index }; scheduleViewportPaint();
    }
  }
  function drop(event: DragEvent): void {
    event.preventDefault(); if (exiting || !event.dataTransfer) return;
    const point = localPoint(event); const index = trackAt(point); const id = readDropId(event.dataTransfer);
    if (index === undefined || !id || !phrases().some(phrase => phrase.id === id)) { dropPreview = undefined; paint(); return; }
    const seconds = Math.max(0, timeAt(point.x));
    dropPreview = undefined; resetShelfDrag(); hideTrash();
    inspector.flush();
    mutate(() => { selectedTrack = undefined; selectedPhrase = undefined; selected = new Set([song.addClip(current.body!.tracks[index]!.id, id, playlistBeats(seconds, current.body!.tempoBpm))]); });
  }
  function colorRow(trackId: string): void {
    if (exiting) return;
    const track = current.body?.tracks.find(item => item.id === trackId); if (!track) return;
    const dialog = node('dialog', 'song-color-dialog'); dialog.append(node('div', 'song-color-title', track.name));
    const swatches = node('div', 'song-color-swatches');
    for (const color of PLAYLIST_COLORS) {
      const swatch = action('', 'song-color-swatch', () => { mutate(() => song.updateTrack(trackId, { color }), false); dialog.close(); });
      swatch.style.background = color; swatch.setAttribute('aria-label', color); swatches.append(swatch);
    }
    const custom = node('input'); custom.type = 'color'; custom.value = track.color ?? '#cbd3dc'; custom.setAttribute('aria-label', '自定义行颜色');
    const buttons = node('div', 'dialog-actions'); buttons.append(action('取消', 'secondary', () => dialog.close()), action('应用', 'primary', () => { mutate(() => song.updateTrack(trackId, { color: custom.value }), false); dialog.close(); }));
    dialog.append(swatches, custom, buttons); dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
  }
  function deleteRow(trackId: string): void {
    if (disposed || exiting || rowDeleteDialog) return;
    window.clearTimeout(deleteTimer);
    if (deleteArmed !== trackId) {
      deleteArmed = trackId; selectRow(trackId); paint();
      deleteTimer = window.setTimeout(() => { deleteArmed = undefined; paint(); }, 1800); return;
    }
    const track = current.body?.tracks.find(item => item.id === trackId); if (!track) return;
    deleteArmed = undefined;
    requestRowDeletion(trackId, structuredClone(track), readRowSelection());
  }
  function readRowSelection(): RowSelection {
    return { draftId: current.draft?.id, clips: [...selected], trackId: selectedTrack, phraseId: selectedPhrase };
  }
  function restoreRowSelection(selection: RowSelection): void {
    if (disposed || current.draft?.id !== selection.draftId) return;
    const ids = new Set(current.body?.tracks.flatMap(track => track.clips.map(clip => clip.id)));
    selected = new Set(selection.clips.filter(id => ids.has(id)));
    selectedTrack = current.body?.tracks.some(track => track.id === selection.trackId) ? selection.trackId : undefined;
    selectedPhrase = phraseById.has(selection.phraseId ?? '') ? selection.phraseId : undefined;
  }
  function requestRowDeletion(trackId: string, snapshot: SongBody['tracks'][number], selection: RowSelection): void {
    if (disposed || exiting || rowDeleteDialog) return;
    const activeDraftId = current.draft?.id;
    const unchanged = () => {
      const latest = song.read();
      return latest.draft?.id === activeDraftId && JSON.stringify(latest.body?.tracks.find(track => track.id === trackId)) === JSON.stringify(snapshot);
    };
    const remove = () => {
      if (!unchanged()) throw new Error('这一行已发生变化，请取消后重新操作。');
      options.onKeepPhrases?.([...new Set(snapshot.clips.map(clip => clip.phraseId))]);
      if (!unchanged()) throw new Error('这一行已发生变化，请取消后重新操作。');
      song.removeTrack(trackId);
    };
    if (!unchanged()) { sync(); restoreRowSelection(selection); paint(); report('这一行已发生变化，请重新操作。', true); return; }
    if (!snapshot.clips.length) { mutate(remove); return; }
    const dialog = node('dialog', 'song-library-delete-dialog song-row-delete-dialog'); rowDeleteDialog = dialog;
    dialog.setAttribute('aria-label', '删除这一行'); dialog.append(node('h2', '', '删除这一行？'),
      node('p', '', `将移除“${snapshot.name}”和这一行的 ${snapshot.clips.length} 个乐句片段。乐句库里的原乐句会保留。`));
    const error = node('p', 'song-library-delete-error'); error.hidden = true; error.setAttribute('role', 'alert');
    let removed = false;
    const cancel = action('取消', 'song-row-delete-cancel', () => dialog.close());
    const confirm = action('删除这一行', 'song-library-delete-confirm song-row-delete-confirm', () => {
      if (disposed || rowDeleteDialog !== dialog) return;
      if (!unchanged()) { error.textContent = '这一行已发生变化，请取消后重新操作。'; error.hidden = false; confirm.disabled = true; return; }
      removed = mutate(remove);
      if (removed) dialog.close();
      else { error.textContent = fieldCommitError ?? '暂时无法删除，请稍后再试。'; error.hidden = false; }
    });
    const buttons = node('div', 'song-library-delete-actions'); buttons.append(cancel, confirm); dialog.append(error, buttons);
    dialog.addEventListener('cancel', event => { event.preventDefault(); dialog.close(); });
    dialog.addEventListener('close', () => {
      const active = rowDeleteDialog === dialog; if (active) rowDeleteDialog = undefined; dialog.remove();
      if (!active || disposed) return;
      if (!removed) { sync(); restoreRowSelection(selection); paint(); }
      viewport.focus({ preventScroll: true });
    }, { once: true });
    paint(); root.append(dialog); dialog.showModal();
  }
  function rowControl(track: NonNullable<typeof current.body>['tracks'][number], trackIndex: number): HTMLElement {
    const control = node('div', 'song-row-control'); control.dataset.trackId = track.id; control.tabIndex = 0;
    if (track.color) control.style.backgroundColor = `${track.color}25`;
    control.classList.toggle('is-selected', selectedTrack === track.id); control.setAttribute('aria-label', `${track.name}，行调控`);
    const color = action('', 'song-row-color', () => { selectRow(track.id); colorRow(track.id); }); color.style.background = track.color ?? '#cbd3dc'; color.setAttribute('aria-label', `为${track.name}选择颜色`);
    const name = node('input', 'song-row-name'); name.value = track.name; name.maxLength = 32; name.readOnly = true; name.setAttribute('aria-label', `第${trackIndex + 1}行名称`);
    name.title = '双击修改名称';
    name.addEventListener('click', () => { if (name.readOnly) { selectRow(track.id); viewport.focus({ preventScroll: true }); } });
    name.addEventListener('dblclick', event => { event.preventDefault(); event.stopPropagation(); finishGesture(false); activateRowName(name, track.id); });
    name.addEventListener('blur', () => {
      name.readOnly = true; const value = name.value.trim(); const savedName = current.body?.tracks.find(item => item.id === track.id)?.name ?? track.name;
      if (exiting || !value || value === savedName) { name.value = savedName; return; }
      // A blur can be caused by pressing a neighboring button. Preserve that
      // button until its pending click is dispatched rather than rebuilding rows.
      try { song.updateTrack(track.id, { name: value }); fieldCommitError = undefined; sync(); }
      catch (error) { fieldCommitError = error instanceof Error ? error.message : String(error); report(fieldCommitError, true); sync(); }
      const updatedName = current.body?.tracks.find(item => item.id === track.id)?.name ?? savedName;
      name.value = updatedName; control.setAttribute('aria-label', `${updatedName}，行调控`);
      color.setAttribute('aria-label', `为${updatedName}选择颜色`); remove.setAttribute('aria-label', `删除${updatedName}，连续点击两次`);
      solo.setAttribute('aria-label', `独奏${updatedName}`); mute.setAttribute('aria-label', `静默${updatedName}`);
      rowNodes.get(track.id)?.[0]?.setAttribute('aria-label', updatedName);
      updateInspector();
    });
    name.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); name.blur(); viewport.focus(); } else if (event.key === 'Escape') { name.value = current.body?.tracks.find(item => item.id === track.id)?.name ?? track.name; name.blur(); viewport.focus(); } });
    const remove = action('×', 'song-row-delete', () => deleteRow(track.id)); remove.setAttribute('aria-label', `删除${track.name}，连续点击两次`); remove.classList.toggle('is-armed', deleteArmed === track.id); remove.title = deleteArmed === track.id ? '再次点击删除这一行' : '连续点击两次删除';
    const solo = action('', 'song-row-mix-button song-row-solo', () => mutate(() => song.toggleTrackSolo(track.id)));
    solo.append(icon('solo')); solo.setAttribute('aria-label', `独奏${track.name}`); solo.setAttribute('aria-pressed', String(track.solo)); solo.classList.toggle('is-on', track.solo);
    const mute = action('', 'song-row-mix-button song-row-mute', () => mutate(() => song.toggleTrackMute(track.id)));
    mute.append(icon('mute')); mute.setAttribute('aria-label', `静默${track.name}`); mute.setAttribute('aria-pressed', String(track.muted)); mute.classList.toggle('is-on', track.muted);
    control.append(color, name, solo, mute, remove); return control;
  }
  function scheduleViewportPaint(): void {
    if (disposed || viewFrame) return;
    viewFrame = requestAnimationFrame(() => { viewFrame = 0; paintViewport(); });
  }
  function refreshRowControl(control: HTMLElement, track: NonNullable<typeof current.body>['tracks'][number], index: number): void {
    control.style.backgroundColor = track.color ? `${track.color}25` : '';
    control.classList.toggle('is-selected', selectedTrack === track.id); control.setAttribute('aria-selected', String(selectedTrack === track.id));
    control.setAttribute('aria-label', `${track.name}，行调控`);
    const name = control.querySelector<HTMLInputElement>('.song-row-name')!;
    if (document.activeElement !== name) name.value = track.name;
    name.setAttribute('aria-label', `第${index + 1}行名称`);
    const color = control.querySelector<HTMLElement>('.song-row-color')!; color.style.background = track.color ?? '#cbd3dc'; color.setAttribute('aria-label', `为${track.name}选择颜色`);
    const remove = control.querySelector<HTMLElement>('.song-row-delete')!; remove.classList.toggle('is-armed', deleteArmed === track.id);
    remove.setAttribute('aria-label', `删除${track.name}，连续点击两次`); remove.title = deleteArmed === track.id ? '再次点击删除这一行' : '连续点击两次删除';
    for (const [kind, enabled] of [['solo', track.solo], ['mute', track.muted]] as const) {
      const button = control.querySelector<HTMLElement>(`.song-row-${kind}`)!;
      button.classList.toggle('is-on', enabled); button.setAttribute('aria-pressed', String(enabled)); button.setAttribute('aria-label', `${kind === 'solo' ? '独奏' : '静默'}${track.name}`);
    }
  }
  /** Content/selection refresh. Camera movement uses paintViewport directly. */
  function paint(): void {
    if (disposed || !content) return;
    cancelAnimationFrame(viewFrame); viewFrame = 0;
    const curtain = viewport.querySelector('.song-empty-curtain');
    if (!phrases().length && !curtain) {
      const empty = node('div', 'song-empty-curtain'); empty.append(node('p', '', '先创建乐句吧'), node('span', 'song-empty-arrow', '←')); viewport.append(empty);
    } else if (phrases().length) curtain?.remove();
    syncPalette(); paintViewport(true); updateInspector();
  }
  /** Reuse visible nodes and cached display data; never reads a song or a library. */
  function paintViewport(refreshContent = false): void {
    if (disposed || !content) return;
    const body = current.body; const width = content.clientWidth || viewport.clientWidth || 1000; const height = content.clientHeight || 600;
    constrainTop();
    if (!body) {
      gridLayer.hidden = true; addTrackButton.hidden = true; dropPreviewNode.hidden = true;
      if (!createSongButton) { createSongButton = action('新建歌曲', 'song-create', () => { if (mutate(() => song.create())) render(); }); content.append(createSongButton); }
      return;
    }
    createSongButton?.remove(); createSongButton = undefined;
    gridLayer.hidden = false; gridLayer.style.maskImage = ''; gridLayer.style.height = `${Math.max(0, Math.min(height, body.tracks.length * view.rowHeight - view.top))}px`;
    const lines = playlistGridLines(view.leftSeconds, width, view.pixelsPerSecond, body.gridTempoBpm ?? body.tempoBpm, body.gridOffsetSeconds ?? 0, body.gridTempoChanges);
    lines.forEach((line, index) => {
      let mark = gridNodes[index]; if (!mark) { mark = node('i'); gridNodes.push(mark); gridLayer.append(mark); }
      mark.hidden = false; mark.className = line.strong ? 'is-bar' : 'is-beat'; mark.style.left = `${line.x}px`;
    });
    for (let index = lines.length; index < gridNodes.length; index++) gridNodes[index]!.hidden = true;
    const start = Math.max(0, Math.floor(view.top / view.rowHeight)); const end = Math.min(body.tracks.length, Math.ceil((view.top + height) / view.rowHeight));
    const visibleRows = new Set<string>(); rowNodes.clear();
    for (let trackIndex = start; trackIndex < end; trackIndex++) {
      const track = body.tracks[trackIndex]!; visibleRows.add(track.id);
      let pair = rowCache.get(track.id);
      if (!pair) { const row = node('div', 'song-track'); row.dataset.trackId = track.id; pair = { row, control: rowControl(track, trackIndex) }; rowCache.set(track.id, pair); }
      const { row, control } = pair;
      if (row.parentElement !== content) content.append(row);
      if (control.parentElement !== rowControls) rowControls.append(control);
      row.style.top = `${trackIndex * view.rowHeight - view.top}px`; row.style.height = `${view.rowHeight}px`;
      row.style.transform = ''; control.style.transform = ''; row.classList.remove('is-row-dragging'); control.classList.remove('is-row-dragging');
      row.setAttribute('aria-label', track.name); row.style.backgroundColor = track.color ? `${track.color}16` : '';
      control.style.top = row.style.top; control.style.height = row.style.height;
      const rowSelected = selectedTrack === track.id; const armed = deleteArmed === track.id;
      // Selection handlers can update attached controls without a repaint. Always
      // reconcile the real reused node, rather than trusting a second cached flag.
      control.classList.toggle('is-selected', rowSelected); control.setAttribute('aria-selected', String(rowSelected));
      if (refreshContent || pair.track !== track || pair.armed !== armed) {
        refreshRowControl(control, track, trackIndex); pair.track = track; pair.armed = armed;
      }
      rowNodes.set(track.id, [row, control]);
    }
    const trackIds = new Set(body.tracks.map(track => track.id));
    for (const [id, pair] of rowCache) if (!visibleRows.has(id)) {
      // Browsers need not dispatch blur when removing an active input. Finish a
      // name edit explicitly only when its control genuinely leaves the view.
      const focused = document.activeElement;
      if (focused instanceof HTMLInputElement && pair.control.contains(focused)) focused.blur();
      pair.row.remove(); pair.control.remove(); if (!trackIds.has(id)) rowCache.delete(id);
    }
    const orderedRows = [...visibleRows].map(id => rowCache.get(id)!);
    const renderedControls = rowControls.querySelectorAll('.song-row-control');
    if (orderedRows.some((pair, index) => renderedControls[index] !== pair.control)) for (const pair of orderedRows) rowControls.append(pair.control);
    const renderedRows = content.querySelectorAll('.song-track');
    if (orderedRows.some((pair, index) => renderedRows[index] !== pair.row)) for (const pair of orderedRows) content.append(pair.row);
    const visibleClips = new Set<string>();
    body.tracks.forEach((track, sourceIndex) => track.clips.forEach(clip => {
      if (gesture?.kind === 'erase' && gesture.refs.has(clip.id)) return;
      const seconds = playlistSeconds(clip.startBeat, body.tempoBpm); const rect = playlistClipRect(seconds, duration(clip.phraseId), sourceIndex, view);
      if (rect.x + rect.width < 0 || rect.x > width || rect.y + rect.height < 0 || rect.y > height) return;
      visibleClips.add(clip.id); let block = clipNodes.get(clip.id);
      const created = !block;
      if (!block) { block = action('', 'song-clip', () => {}); block.dataset.clipId = clip.id; clipNodes.set(clip.id, block); content.append(block); }
      block.dataset.trackId = track.id;
      const isSelected = selected.has(clip.id) || selectedTrack === track.id || selectedPhrase === clip.phraseId;
      block.classList.toggle('is-selected', isSelected); block.setAttribute('aria-pressed', String(isSelected));
      if (created || refreshContent) {
        block.textContent = phraseById.get(clip.phraseId)?.name ?? '乐句';
        block.title = `${block.textContent} · ${timeLabel(seconds)} · 音量 ${Math.round((clip.level ?? 1) * 100)}% · 声像 ${Math.round((clip.pan ?? track.pan) * 100)}`;
        const color = track.color ?? playlistPhraseColor(clip.phraseId);
        block.style.backgroundColor = color; block.style.color = playlistColorInk(color); block.style.borderLeftColor = color;
      }
      Object.assign(block.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${Math.max(1, rect.width)}px`, height: `${rect.height}px`, transform: '' });
      block.classList.remove('is-dragging', 'is-invalid', 'is-row-dragging');
      rowNodes.get(track.id)?.push(block);
    }));
    for (const [id, block] of clipNodes) if (!visibleClips.has(id)) { block.remove(); clipNodes.delete(id); }
    dropPreviewNode.hidden = !dropPreview;
    if (dropPreview) {
      if (dropPreviewNode.parentElement !== content) content.append(dropPreviewNode);
      const rect = playlistClipRect(dropPreview.seconds, duration(dropPreview.phraseId), dropPreview.trackIndex, view);
      Object.assign(dropPreviewNode.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    } else dropPreviewNode.remove();
    const addY = body.tracks.length * view.rowHeight - view.top;
    addTrackButton.hidden = !(addY < height && addY + view.rowHeight > 0);
    addTrackButton.style.top = `${addY}px`; addTrackButton.style.height = `${view.rowHeight}px`;
    paintGesture(); positionPlayhead();
  }
  function localSave(mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): void {
    const result = song.save(mode, confirmation);
    if (result.status === 'saved') { sync(); report('已保存。'); }
    else if (result.status === 'needs-confirmation') confirmSave(result);
    else throw new Error(result.status === 'conflict' ? result.reason : result.message);
  }
  function confirmSave(result: Extract<SaveResult, { status: 'needs-confirmation' }>): void {
    const dialog = node('dialog', 'save-dialog'); dialog.append(node('h2', '', '这首歌曲正在被使用'));
    const list = node('ul'); [...result.affectedContent, ...result.affectedDrafts].forEach(item => list.append(node('li', '', item.name))); dialog.append(list);
    const buttons = node('div', 'dialog-actions'); buttons.append(action('返回', 'secondary', () => dialog.close()),
      action('另存为新歌曲', 'secondary', () => { dialog.close(); localSave('new'); }), action('确认覆盖', 'primary', () => { dialog.close(); localSave('overwrite', result.confirmation); }));
    dialog.append(buttons); dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
  }
  function prepareFileAction(): void {
    if (pendingRename) throw new Error('名称正在保存，请稍后再试。');
    fieldCommitError = undefined; inspector.flush();
    if (pendingRename) throw new Error('名称正在保存，请稍后再试。');
    if (mixPreview) { const mix = mixPreview; changeMix(mix.kind, mix.trackId, mix.clipId, mix.field, mix.value, true); }
    finishGesture();
    if (fieldCommitError) throw new Error(fieldCommitError);
    pendingCommit?.();
    if (fieldCommitError) throw new Error(fieldCommitError);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    if (fieldCommitError) throw new Error(fieldCommitError);
  }
  function fileBusy(busy: boolean): void {
    [...root.querySelectorAll<HTMLButtonElement>('.song-save'), ...root.querySelectorAll<HTMLButtonElement>('.song-settings'), ...root.querySelectorAll<HTMLButtonElement>('.song-exit')].forEach(button => { button.disabled = busy || exiting; });
  }
  const saveAction = createSongSaveAction({
    prepare: prepareFileAction,
    saveProject: options.onSaveProject || options.onSaveProjectAs ? () => saveAsRequested && options.onSaveProjectAs ? options.onSaveProjectAs() : options.onSaveProject?.() : undefined,
    saveLocal() {
      if (saveAsRequested) localSave('new');
      else { const callback = options.referenceContext?.onSave ?? options.onSave; if (callback) callback(); else localSave(current.draft?.sourceId ? 'overwrite' : 'new'); }
    },
    active: () => !disposed && !!song.read().draft,
    onBusy: fileBusy,
    onError: error => report(error instanceof Error ? error.message : String(error), true),
  });
  function saveCurrent(as = false): void { if (saveAction.busy || exiting) return; saveAsRequested = as; void saveAction.run(); }
  async function exitCurrent(): Promise<void> {
    if (saveAction.busy || exiting || disposed) return;
    try {
      prepareFileAction(); exiting = true; fileBusy(true);
      const page = root.querySelector<HTMLElement>('.song-studio'); if (page) page.inert = true;
      await (options.onExit ?? options.onWelcome)();
    }
    catch (error) { report(error instanceof Error ? error.message : String(error), true); }
    finally {
      exiting = false;
      if (!disposed) { const page = root.querySelector<HTMLElement>('.song-studio'); if (page) page.inert = false; fileBusy(false); }
    }
  }
  function popover(label: string, contents: HTMLElement, kind?: 'tempo' | 'volume'): HTMLElement {
    const wrapper = node('div', 'song-popover'); const button = action(kind ? '' : label, 'song-icon-button', () => {});
    if (kind) button.append(icon(kind)); button.setAttribute('aria-label', label); button.title = label;
    contents.classList.add('song-popover-panel'); wrapper.append(button, contents); return wrapper;
  }
  function render(): void {
    if (disposed) return; rowDeleteDialog?.close(); phraseLibrary?.close(); inspector.flush(); finishGesture(false); observer?.disconnect(); sync();
    cancelAnimationFrame(viewFrame); viewFrame = 0; clipNodes.clear(); rowNodes.clear(); rowCache.clear(); gridNodes = []; createSongButton = undefined;
    const page = node('div', 'song-studio'); const top = node('header', 'song-topbar');
    const projectTitle = node('div', 'song-project-name', options.projectName?.() ?? current.draft?.name ?? '新项目');
    projectTitle.title = '双击修改项目名称';
    projectTitle.addEventListener('dblclick', () => {
      if (exiting || projectTitle.querySelector('input')) return;
      const previous = projectTitle.textContent ?? ''; const input = node('input', 'song-project-name-input'); input.value = previous; input.maxLength = 80;
      input.setAttribute('aria-label', '项目名称'); let done = false;
      const commit = () => {
        if (done) return; done = true; const name = input.value.trim(); let display = previous;
        if (name && name !== previous) {
          try { if (options.onRenameProject) options.onRenameProject(name); else song.rename(name); sync(); fieldCommitError = undefined; display = name; }
          catch (error) { fieldCommitError = error instanceof Error ? error.message : String(error); report(fieldCommitError, true); }
        }
        projectTitle.replaceChildren(); projectTitle.textContent = display;
      };
      input.addEventListener('blur', commit); input.addEventListener('keydown', event => {
        if (event.key === 'Enter') { event.preventDefault(); input.blur(); viewport.focus(); }
        if (event.key === 'Escape') { event.preventDefault(); input.value = previous; input.blur(); viewport.focus(); }
      });
      projectTitle.replaceChildren(input); input.focus(); input.select?.();
    });
    const projectIdentity = node('div', 'song-project-identity'); projectIdentity.append(projectTitle, node('span', 'song-project-kind', '乐曲')); top.append(projectIdentity);
    const controls = node('div', 'song-transport');
    const stopButton = action('', 'song-icon-button song-stop', () => { finishGesture(false); audition?.stop(); transport.stop(); }); stopButton.append(icon('stop')); stopButton.setAttribute('aria-label', '停止并回到开头');
    playButton = action('', 'song-icon-button song-play', () => { audition?.stop(); void transport.toggle(); }); clock = node('output', 'song-clock'); clock.setAttribute('aria-label', '当前时间'); controls.append(stopButton, playButton, clock);
    const rates = node('div', 'song-rate-options'); const rateWrapper = popover(`${transportState.rate}x`, rates); const rateButton = rateWrapper.querySelector<HTMLButtonElement>('button')!;
    for (const rate of [1, .75, 1.25]) rates.append(action(`${rate}x`, 'song-rate-choice', () => { transport.setRate(rate); rateButton.textContent = `${rate}x`; })); controls.append(rateWrapper);
    const tempoPanel = node('div', 'song-tempo-panel'); tempoInput = node('input'); tempoInput.type = 'number'; tempoInput.min = '40'; tempoInput.max = '240'; tempoInput.step = '1'; tempoInput.required = true;
    tempoInput.value = String(current.body ? songGridTempoAt(current.body, transport.position()) : 120); tempoInput.setAttribute('aria-label', '网格 BPM');
    const commitTempo = () => {
      if (exiting) return;
      const value = Number(tempoInput.value);
      if (!tempoInput.value.trim() || !Number.isFinite(value) || value < 40 || value > 240) { fieldCommitError = 'BPM 应在 40 至 240 之间。'; report(fieldCommitError, true); return; }
      const at = tempoEditAt ?? transport.position();
      const resetsFuture = tempoEdited && current.body?.gridTempoChanges?.some(change => change.atSeconds >= at);
      if (current.body && (value !== songGridTempoAt(current.body, at) || resetsFuture)) {
        if (mutate(() => song.setGridTempo(value, at), false)) tempoEdited = false;
      } else { fieldCommitError = undefined; tempoEdited = false; }
    };
    tempoInput.addEventListener('focus', () => { tempoEditAt = transport.position(); tempoEdited = false; pendingCommit = commitTempo; });
    pendingCommit = commitTempo; tempoInput.addEventListener('blur', () => { commitTempo(); tempoEditAt = undefined; });
    tempoInput.addEventListener('input', () => { tempoEdited = true; const value = Number(tempoInput.value); if (tempoInput.value && value >= 40 && value <= 240) commitTempo(); });
    tempoPanel.append(node('span', '', 'BPM'), tempoInput); controls.append(popover('BPM', tempoPanel, 'tempo'));
    const volumePanel = node('div', 'song-volume-panel'); masterInput = node('input'); masterInput.type = 'range'; masterInput.min = '0'; masterInput.max = '1'; masterInput.step = '.01';
    masterInput.value = String(current.body?.masterLevel ?? 1); masterInput.setAttribute('aria-label', '总音量');
    masterInput.addEventListener('input', () => mutate(() => song.setMasterLevel(Number(masterInput.value)))); volumePanel.append(masterInput); controls.append(popover('总音量', volumePanel, 'volume'));
    const files = node('div', 'song-file-actions');
    if (options.onSettings) files.append(action('设置', 'song-settings', () => {
      if (disposed || exiting || saveAction.busy) return;
      try { prepareFileAction(); options.onSettings!(); }
      catch (error) { report(error instanceof Error ? error.message : String(error), true); }
    }));
    files.append(action('保存', 'song-save', () => saveCurrent()), action('另存为', 'song-save', () => saveCurrent(true)), action('退出', 'song-exit', () => { void exitCurrent(); }));
    top.append(controls, files); page.append(top);
    const main = node('main', 'song-workspace'); const palette = node('aside', 'song-palette'); palette.setAttribute('aria-label', '当前歌曲乐句');
    paletteList = node('div', 'song-phrase-list'); phraseCards.clear();
    paletteList.addEventListener('dragover', reorderShelfPreview); paletteList.addEventListener('drop', dropShelfOrder);
    newPhraseButton = action('+', 'song-new-phrase', openPhraseLibrary); newPhraseButton.setAttribute('aria-label', '打开乐句库'); palette.append(paletteList, newPhraseButton);
    viewport = node('section', 'song-scroll'); viewport.tabIndex = -1; viewport.setAttribute('aria-label', '歌曲编排');
    ruler = node('div', 'song-ruler'); content = node('div', 'song-timeline'); playhead = node('div', 'song-playhead'); headHandle = node('div', 'song-playhead-handle'); headHandle.setAttribute('aria-label', '拖动播放头');
    gridLayer = node('div', 'song-grid-lines'); dropPreviewNode = node('div', 'song-drop-preview'); dropPreviewNode.hidden = true;
    addTrackButton = action('+', 'song-add-track', () => mutate(() => { song.addTrack(); })); addTrackButton.setAttribute('aria-label', '添加行');
    addTrackButton.addEventListener('pointerdown', event => event.stopPropagation());
    content.append(gridLayer, dropPreviewNode, addTrackButton, playhead); ruler.append(headHandle);
    rowControls = node('div', 'song-row-controls'); rowControls.setAttribute('aria-label', '行调控');
    rowTrash = node('div', 'song-row-trash'); rowTrash.hidden = true; rowTrash.setAttribute('aria-hidden', 'true'); rowTrash.append(icon('trash')); rowControls.append(rowTrash);
    erasures = node('div', 'song-erasures'); notice = node('div', 'song-notice'); notice.setAttribute('role', 'status'); notice.hidden = true;
    viewport.append(rowControls, ruler, content, erasures, notice);
    if (!phrases().length) { const curtain = node('div', 'song-empty-curtain'); curtain.append(node('p', '', '先创建乐句吧'), node('span', 'song-empty-arrow', '←')); viewport.append(curtain); }
    const arrangement = node('div', 'song-arrangement'); arrangement.append(viewport, inspector.element);
    main.append(palette, arrangement); page.append(main);
    trash = node('div', 'song-phrase-trash'); trash.hidden = true; trash.setAttribute('role', 'region');
    const trashIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); trashIcon.setAttribute('viewBox', '0 0 24 24'); trashIcon.setAttribute('aria-hidden', 'true');
    const trashPath = document.createElementNS('http://www.w3.org/2000/svg', 'path'); trashPath.setAttribute('d', 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7');
    trashPath.setAttribute('fill', 'none'); trashPath.setAttribute('stroke', 'currentColor'); trashPath.setAttribute('stroke-width', '1.6'); trashPath.setAttribute('stroke-linecap', 'round'); trashPath.setAttribute('stroke-linejoin', 'round');
    trashIcon.append(trashPath); trash.append(trashIcon);
    trash.addEventListener('dragover', event => { if (!dragPhraseId && !libraryDragId) return; event.preventDefault(); event.stopPropagation(); if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'; showTrash(libraryDragId ? 'library' : 'shelf', true); });
    trash.addEventListener('dragleave', event => { if (!(event.relatedTarget instanceof Node) || !trash.contains(event.relatedTarget)) trash.classList.remove('is-over'); });
    trash.addEventListener('drop', shelfTrashDrop); viewport.append(trash); root.replaceChildren(page);
    viewport.addEventListener('pointerdown', pointerDown); viewport.addEventListener('wheel', wheel, { passive: false });
    viewport.addEventListener('lostpointercapture', event => { if (gesture?.pointerId === event.pointerId) finishGesture(false); });
    viewport.addEventListener('dblclick', event => {
      if (exiting) return;
      // Pointer capture retargets the browser's double-click to the viewport.
      // Retain only the last stationary name target, while letting the browser
      // decide double-click timing according to the user's system settings.
      if (lastNamePointer) {
        const id = lastNamePointer; lastNamePointer = undefined;
        const control = [...rowControls.querySelectorAll<HTMLElement>('.song-row-control')].find(element => element.dataset.trackId === id);
        const name = control?.querySelector<HTMLInputElement>('.song-row-name');
        if (name) { event.preventDefault(); finishGesture(false); activateRowName(name, id); return; }
      }
      if (lastClipPointer) {
        const ref = lastClipPointer; lastClipPointer = undefined;
        if (current.body?.tracks.find(track => track.id === ref.trackId)?.clips.some(clip => clip.id === ref.clipId)) {
          if (lastPointerActivation?.clipId === ref.clipId && Date.now() - lastPointerActivation.at <= 500) { lastPointerActivation = undefined; return; }
          event.preventDefault(); editPhrase(ref); return;
        }
      }
      if ((event.target as Element).closest('.song-row-controls') || (event.target as Element).closest('.song-ruler') || (event.target as Element).closest('.song-playhead')) return;
      const direct = (event.target as Element).closest<HTMLElement>('.song-clip');
      const clipId = direct?.dataset.clipId;
      const ref = current.body?.tracks.flatMap(track => track.clips.map(clip => ({ trackId: track.id, clipId: clip.id }))).find(item => item.clipId === clipId);
      if (ref && lastPointerActivation?.clipId === ref.clipId && Date.now() - lastPointerActivation.at <= 500) { lastPointerActivation = undefined; return; }
      if (!ref) return; event.preventDefault(); editPhrase(ref);
    });
    viewport.addEventListener('contextmenu', event => event.preventDefault()); viewport.addEventListener('dragover', dragOver); viewport.addEventListener('drop', drop);
    viewport.addEventListener('dragleave', event => { if (!(event.relatedTarget instanceof Node) || !viewport.contains(event.relatedTarget)) { dropPreview = undefined; paint(); } });
    observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(scheduleViewportPaint); observer?.observe(viewport); paint(); updatePlayback();
  }
  function removeRefs(refs: SongClipRef[], refreshAudio = true): void {
    mutate(() => {
      const ids = new Set(refs.map(ref => current.body?.tracks.find(track => track.id === ref.trackId)?.clips.find(clip => clip.id === ref.clipId)?.phraseId).filter((id): id is string => !!id));
      options.onKeepPhrases?.([...ids]); song.removeClips(refs);
    }, refreshAudio);
  }
  function removeSelected(): void { const refs = picked(); if (!refs.length) return; refs.forEach(flashErase); removeRefs(refs); }
  function adjust(key: string, repeat = false): void {
    if (selectedPhrase) return;
    if (selectedTrack && ['q', 'e', 'w', 's'].includes(key)) {
      const track = current.body?.tracks.find(item => item.id === selectedTrack); if (!track) return;
      mutate(() => song.updateTrack(track.id, key === 'q' || key === 'e'
        ? { panOffset: clampPlaylist((track.panOffset ?? 0) + (key === 'q' ? -.05 : .05), -1, 1) }
        : { level: clampPlaylist(track.level + (key === 's' ? -.05 : .05), 0, 1) })); return;
    }
    const refs = picked(); const body = current.body; if (!body || !refs.length) return;
    if (key === 'a' || key === 'd') {
      const identity = selectedTrack ? `row:${selectedTrack}` : [...selected].sort().join(':'); const now = Date.now();
      const earliest = Math.min(...refs.map(ref => playlistSeconds(ref.clip.startBeat, body.tempoBpm)));
      const pair = doubleNudge;
      if (!repeat && pair && pair.key === key && pair.identity === identity && now - pair.at <= DOUBLE_NUDGE_WINDOW_MS) {
        const minimum = Math.min(...pair.starts.values()); const delta = Math.max(-minimum, (key === 'a' ? -1 : 1) * pair.beat);
        doubleNudge = undefined;
        mutate(() => song.moveClips(refs.map(ref => ({ trackId: ref.trackId, clipId: ref.clipId, targetTrackId: ref.trackId,
          startBeat: playlistBeats(pair.starts.get(ref.clipId)! + delta, body.tempoBpm) })))); return;
      }
      if (!repeat) doubleNudge = { key, identity, at: now, starts: new Map(refs.map(ref => [ref.clipId, playlistSeconds(ref.clip.startBeat, body.tempoBpm)])), beat: 60 / songGridTempoAt(body, transport.position()) };
      const delta = Math.max(-earliest, (key === 'a' ? -1 : 1) * .025);
      if (Math.abs(delta) > 1e-8) mutate(() => song.moveClips(refs.map(ref => ({ trackId: ref.trackId, clipId: ref.clipId, targetTrackId: ref.trackId, startBeat: playlistBeats(playlistSeconds(ref.clip.startBeat, body.tempoBpm) + delta, body.tempoBpm) }))));
    } else {
      doubleNudge = undefined;
      mutate(() => song.updateClips(refs.map(ref => key === 'q' || key === 'e'
        ? { trackId: ref.trackId, clipId: ref.clipId, pan: clampPlaylist((ref.clip.pan ?? body.tracks[ref.trackIndex]!.pan) + (key === 'q' ? -.05 : .05), -1, 1) }
        : { trackId: ref.trackId, clipId: ref.clipId, level: clampPlaylist((ref.clip.level ?? 1) + (key === 's' ? -.05 : .05), 0, 1) })));
    }
  }
  function keydown(event: KeyboardEvent): void {
    if (disposed || exiting || event.isComposing || event.keyCode === 229) return;
    previousClipPointer = undefined; lastClipPointer = undefined;
    lastNamePointer = undefined;
    if (root.querySelector('dialog[open]')) return;
    if (isSongSaveShortcut(event)) { event.preventDefault(); if (!event.repeat) saveCurrent(event.shiftKey); return; }
    const target = event.target as HTMLElement;
    const rangeUndo = event.key === 'Backspace' && target instanceof HTMLInputElement && target.type === 'range';
    if (target instanceof HTMLInputElement && !rangeUndo || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement || target?.isContentEditable) return;
    if (event.altKey) return;
    if (event.key === 'Escape' && gesture?.kind === 'row') { event.preventDefault(); finishGesture(false); return; }
    if (!event.metaKey && !event.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault(); if (gesture) finishGesture();
      const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
      const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      if (event.ctrlKey) {
        const factor = (horizontal ? forward : !forward) ? 1.15 : 1 / 1.15;
        view = zoomPlaylist(view, (content.clientWidth || viewport.clientWidth) / 2, (content.clientHeight || viewport.clientHeight) / 2, factor, !horizontal);
      } else if (horizontal) view.leftSeconds += (forward ? 64 : -64) / view.pixelsPerSecond;
      else view.top += forward ? view.rowHeight : -view.rowHeight;
      doubleNudge = undefined; constrainTop(); paintViewport(); return;
    }
    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase();
      if (key === 'z' || key === 'y') { event.preventDefault(); if (!event.repeat) mutate(() => key === 'y' || event.shiftKey ? song.redo() : song.undo()); }
      if (key === 'a') { event.preventDefault(); inspector.flush(); selectedTrack = undefined; selectedPhrase = undefined; selected = new Set(current.body?.tracks.flatMap(track => track.clips.map(clip => clip.id))); paint(); } return;
    }
    const key = event.key.toLowerCase();
    if (key !== 'a' && key !== 'd') doubleNudge = undefined;
    if (event.code === 'Space' || key === ' ') { event.preventDefault(); if (!event.repeat) { audition?.stop(); void transport.toggle(); } }
    else if (key === 'backspace' && !event.shiftKey) { event.preventDefault(); if (!event.repeat) mutate(() => song.undo()); }
    else if (key === 'delete') { event.preventDefault(); removeSelected(); }
    else if (['q', 'e', 'w', 's', 'a', 'd'].includes(key) && !selectedPhrase && (selected.size || selectedTrack)) { event.preventDefault(); adjust(key, event.repeat); }
    else if (key === 'enter' && !selectedTrack && selected.size === 1 && options.onEditPhrase) { event.preventDefault(); const ref = picked()[0]!; transport.pause(); options.onEditPhrase(ref); }
  }
  const pointerUp = (event: PointerEvent) => {
    finishShelfPress(event); if (disposed) return;
    if (gesture?.pointerId === event.pointerId) {
      // Use the release position too: the final move event can be coalesced or
      // missing when the pointer returns below the threshold just before release.
      if (gesture.kind === 'row' && gesture.moved) { updateRowDrag(gesture, event); paintGesture(); }
      finishGesture(true, gesture.kind === 'clip' && gesture.moved && overTrash(event), true);
    }
    inspector.pointerEnd(); updateInspector();
  };
  const pointerCancel = (event: PointerEvent) => { if (shelfPress?.pointerId === event.pointerId) { shelfPress = undefined; previousShelfPointer = undefined; } if (gesture?.pointerId === event.pointerId) finishGesture(false); if (mixPreview) { mixPreview = undefined; inspector.cancel(); transport.refresh(); } updateInspector(); };
  const resized = () => scheduleViewportPaint();
  const outsideClipPress = (event: PointerEvent) => {
    const target = event.target as Element;
    if (event.button !== 0 || !target || !viewport.contains(target) || !target.closest('.song-clip')) { previousClipPointer = undefined; lastClipPointer = undefined; }
    if (event.button !== 0 || !target?.closest('.song-phrase-card')) { shelfPress = undefined; previousShelfPointer = undefined; }
  };
  document.addEventListener('pointermove', pointerMove); document.addEventListener('pointerup', pointerUp); document.addEventListener('pointercancel', pointerCancel);
  document.addEventListener('pointerdown', outsideClipPress);
  document.addEventListener('keydown', keydown); document.addEventListener('dragover', shelfDragMove); window.addEventListener('resize', resized); render();
  return {
    flush() { if (disposed) throw new Error('当前歌曲页面已关闭。'); prepareFileAction(); },
    notify(message, error = false) { report(message, error); },
    refresh(context, onApplyElsewhere) { if (disposed) return; options.referenceContext = context; options.onApplyElsewhere = onApplyElsewhere; render(); transport.refresh(); },
    dispose() {
      if (disposed) return; rowDeleteDialog?.close(); phraseLibrary?.close(); finishGesture(false); resetShelfDrag(); hideTrash(); mixPreview = undefined; inspector.cancel(); inspector.dispose(); audition?.dispose(); disposed = true; transport.dispose(); cancelAnimationFrame(frame); cancelAnimationFrame(viewFrame); viewFrame = 0; observer?.disconnect(); window.clearTimeout(noticeTimer); window.clearTimeout(deleteTimer);
      document.removeEventListener('pointermove', pointerMove); document.removeEventListener('pointerup', pointerUp); document.removeEventListener('pointercancel', pointerCancel);
      document.removeEventListener('pointerdown', outsideClipPress);
      document.removeEventListener('keydown', keydown); document.removeEventListener('dragover', shelfDragMove); window.removeEventListener('resize', resized);
    },
  };
}
