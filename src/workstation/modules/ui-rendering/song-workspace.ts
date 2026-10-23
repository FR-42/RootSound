import type { SaveConfirmation, SaveResult } from '../../contracts/content.ts';
import type { SongBody, SongClip, SongClipRef, SongEditorPort } from '../../contracts/song.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import type { PostProductionSettings } from '../../contracts/post-production.ts';
import { readEntityDrag } from './entity-drag.ts';
import { createLivePreview } from './live-preview.ts';
import { createSongSaveAction, isSongSaveShortcut } from './song-save.ts';
import { createReferenceNavigation, showReferenceActions, type ReferenceEditorContext } from './reference-ui.ts';
import './song.css';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const result = document.createElement(tag); result.className = className; result.textContent = text; return result;
}
function action(label: string, className: string, callback: () => void): HTMLButtonElement {
  const button = node('button', className, label); button.type = 'button'; button.addEventListener('click', callback); return button;
}

/** The timeline receives a public song editor; it never reads phrase implementation data. */
export function mountSongWorkspace(root: HTMLElement, options: {
  song: SongEditorPort; sound: SoundRuntimePort; onSound(): void; onPhrase(): void; onWelcome(): void;
  onLibrary?(): void; onSettings?(): void; onExport?(): void; onCoCreation?(): void; onSampling?(): void;
  onOpenProject?(): void | Promise<void>; onSaveProject?(): void | Promise<void>;
  referenceContext?: ReferenceEditorContext;
  onSave?(): void; onApplyElsewhere?(): void;
  onEditPhrase?(ref: SongClipRef, chooseLocations?: boolean): void;
  renderEntities?(): HTMLElement;
}): { dispose(): void; refresh(context?: ReferenceEditorContext, onApplyElsewhere?: () => void): void; notify(message: string, error?: boolean): void } {
  const { song, sound } = options;
  let selectedTrack: string | undefined;
  let renderedDraftId: string | undefined;
  let selected = new Set<string>();
  let clipboard: Array<{ trackOffset: number; phraseId: string; beatOffset: number }> = [];
  let snap = 1;
  let beatPixels = 44;
  let scrollLeft = 0;
  let scrollTop = 0;
  let disposed = false;
  let sessionId: string | undefined;
  let liveBody: SongBody | undefined;
  const livePreview = createLivePreview(sound, () => sessionId, error => report(error instanceof Error ? error.message : String(error), true), undefined, () => song.preparePreview());
  let preparing = false;
  let playbackGeneration = 0;
  let playbackTempo = 120;
  let frame = 0;
  let notice: HTMLElement | undefined;
  let playButton: HTMLButtonElement | undefined;
  let playhead: HTMLElement | undefined;
  let stopGesture: (() => void) | undefined;
  let pointerDown = false;
  let deferredLayout = false;
  let layoutTimer = 0;
  let status = '';
  let postOpen = false;
  let isError = false;
  let fieldCommitError: string | undefined;
  const report = (message: string, error = false) => { status = message; isError = error; if (notice) { notice.textContent = message; notice.classList.toggle('is-error', error); } };
  function stopPlayback(): void {
    livePreview.cancel(); liveBody = undefined;
    playbackGeneration++; preparing = false; sessionId = undefined; cancelAnimationFrame(frame);
    sound.stopAll(); updatePlayback();
  }
  function edit(change: () => void, message = '修改已保留为编辑稿。'): void {
    const previousDraft = song.read().draft?.id;
    liveBody = undefined;
    try { change(); report(message); } catch (error) { fieldCommitError = error instanceof Error ? error.message : String(error); report(fieldCommitError, true); }
    if (song.read().draft?.id !== previousDraft) stopPlayback();
    else { playbackTempo = song.read().body?.tempoBpm ?? playbackTempo; livePreview.flush(() => song.previewPlan(undefined, { allowSilence: true })); }
    render();
  }
  function quietEdit(change: () => void): boolean {
    liveBody = undefined;
    try {
      change(); const view = song.read(); report('修改已保留为编辑稿。');
      const saveState = root.querySelector<HTMLElement>('.save-state'); if (saveState) saveState.textContent = '本机编辑稿已保留';
      const undo = root.querySelector<HTMLButtonElement>('.song-undo'); if (undo) undo.disabled = !view.canUndo;
      const redo = root.querySelector<HTMLButtonElement>('.song-redo'); if (redo) redo.disabled = !view.canRedo;
      playbackTempo = view.body?.tempoBpm ?? playbackTempo; livePreview.flush(() => song.previewPlan(undefined, { allowSilence: true }));
      return true;
    } catch (error) {
      playbackTempo = song.read().body?.tempoBpm ?? playbackTempo;
      livePreview.flush(() => song.previewPlan(undefined, { allowSilence: true }));
      fieldCommitError = error instanceof Error ? error.message : String(error);
      report(fieldCommitError, true); render(); return false;
    }
  }
  function quantize(value: number): number { return snap ? Math.round(value / snap) * snap : value; }
  function picked(): Array<SongClipRef & { clip: SongClip; trackIndex: number }> {
    return song.read().body?.tracks.flatMap((track, trackIndex) => track.clips.filter(clip => selected.has(clip.id)).map(clip => ({ trackId: track.id, clipId: clip.id, clip, trackIndex }))) ?? [];
  }
  function updateSelection(): void {
    root.querySelectorAll<HTMLElement>('.song-clip').forEach(block => {
      const active = selected.has(block.dataset.clipId!); block.classList.toggle('is-selected', active); block.setAttribute('aria-pressed', String(active));
    });
    root.querySelectorAll<HTMLButtonElement>('[data-song-selection-action]').forEach(button => { button.disabled = !selected.size; });
    root.querySelectorAll<HTMLButtonElement>('[data-song-single-selection-action]').forEach(button => { button.disabled = selected.size !== 1; });
  }
  function copy(): void {
    const refs = picked(); if (!refs.length) return;
    const beat = Math.min(...refs.map(ref => ref.clip.startBeat)); const track = Math.min(...refs.map(ref => ref.trackIndex));
    clipboard = refs.map(ref => ({ trackOffset: ref.trackIndex - track, phraseId: ref.clip.phraseId, beatOffset: ref.clip.startBeat - beat }));
    const pasteButton = root.querySelector<HTMLButtonElement>('.song-paste'); if (pasteButton) pasteButton.disabled = false;
    report(`已复制 ${refs.length} 个片段，选择轨道后粘贴。`);
  }
  function paste(): void {
    const body = song.read().body; if (!body || !clipboard.length) return;
    const trackIndex = Math.max(0, body.tracks.findIndex(track => track.id === selectedTrack));
    if (clipboard.some(ref => trackIndex + ref.trackOffset >= body.tracks.length)) { report('目标位置没有足够的轨道，请先添加轨道。', true); return; }
    const target = body.tracks[trackIndex]!;
    const start = Math.max(0, ...target.clips.map(clip => clip.startBeat + song.clipLengthBeats(clip.phraseId)));
    edit(() => { selected = new Set(song.addClips(clipboard.map(ref => ({ trackId: body.tracks[trackIndex + ref.trackOffset]!.id, phraseId: ref.phraseId, startBeat: start + ref.beatOffset })))); });
  }
  function duplicate(): void {
    const refs = picked(); if (!refs.length) return;
    const first = Math.min(...refs.map(ref => ref.clip.startBeat));
    const last = Math.max(...refs.map(ref => ref.clip.startBeat + song.clipLengthBeats(ref.clip.phraseId)));
    edit(() => { selected = new Set(song.addClips(refs.map(ref => ({ trackId: ref.trackId, phraseId: ref.clip.phraseId, startBeat: ref.clip.startBeat + last - first })))); });
  }
  function remove(): void { const refs = picked(); if (refs.length) edit(() => { song.removeClips(refs); selected.clear(); }); }
  function updatePlayback(): void {
    if (playButton) { playButton.textContent = preparing ? '取消准备' : sessionId ? '■ 停止' : '▶ 听整首'; playButton.disabled = false; }
    if (playhead) playhead.hidden = !sessionId;
  }
  function tick(): void {
    if (disposed || !sessionId) return;
    const position = sound.position(sessionId);
    if (playhead && position !== undefined) playhead.style.left = `${180 + position * playbackTempo / 60 * beatPixels}px`;
    frame = requestAnimationFrame(tick);
  }
  async function play(): Promise<void> {
    if (preparing) { stopPlayback(); report('试听准备已取消。'); return; }
    if (sessionId) { stopPlayback(); report('已停止。'); return; }
    const request = ++playbackGeneration; preparing = true; updatePlayback();
    const snapshot = JSON.stringify(song.read().draft);
    try {
      report('正在准备歌曲使用的声音…'); await song.preparePreview();
      if (disposed || request !== playbackGeneration) return;
      if (JSON.stringify(song.read().draft) !== snapshot) throw new Error('歌曲已改变，请重新试听当前内容。');
      playbackTempo = song.read().body?.tempoBpm ?? 120;
      const session = await sound.preview(song.previewPlan(liveBody));
      if (disposed || request !== playbackGeneration) { sound.stop(session.id); return; }
      sessionId = session.status === 'playing' ? session.id : undefined;
      if (sessionId) livePreview.flush(() => song.previewPlan(liveBody, { allowSilence: true }));
      if (sessionId) report('正在演奏…');
    } catch (error) { if (!disposed && request === playbackGeneration) report(error instanceof Error ? error.message : String(error), true); }
    finally { if (!disposed && request === playbackGeneration) { preparing = false; updatePlayback(); cancelAnimationFrame(frame); tick(); } }
  }
  function save(saveMode: 'overwrite' | 'new', confirmation?: SaveConfirmation): void {
    try {
      const result = song.save(saveMode, confirmation);
      if (result.status === 'saved') { report(`“${result.content.name}”已保存。`); render(); }
      else if (result.status === 'needs-confirmation') confirmSave(result);
      else report(result.status === 'conflict' ? result.reason : result.message, true);
    } catch (error) { report(error instanceof Error ? error.message : String(error), true); }
  }
  function confirmSave(result: Extract<SaveResult, { status: 'needs-confirmation' }>): void {
    const dialog = node('dialog', 'save-dialog'); dialog.append(node('h2', '', '这首歌曲正在被使用'), node('p', '', '覆盖后，以下内容也会使用修改后的歌曲。'));
    const list = node('ul'); result.affectedContent.forEach(item => list.append(node('li', '', item.name))); result.affectedDrafts.forEach(item => list.append(node('li', '', `${item.name} · 编辑稿`))); dialog.append(list);
    const buttons = node('div', 'dialog-actions');
    buttons.append(action('返回', 'secondary', () => dialog.close()), action('另存为新歌曲', 'secondary', () => { dialog.close(); save('new'); }), action('确认覆盖', 'primary', () => { dialog.close(); save('overwrite', result.confirmation); }));
    dialog.append(buttons); dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
  }
  function saveLocal(): void {
    try {
      const callback = options.referenceContext?.onSave ?? options.onSave;
      if (callback) callback(); else save(song.read().draft?.sourceId ? 'overwrite' : 'new');
    } catch (error) { report(error instanceof Error ? error.message : String(error), true); }
  }
  const saveAction = createSongSaveAction({
    prepare() {
      fieldCommitError = undefined;
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      if (fieldCommitError) throw new Error(fieldCommitError);
    },
    saveProject: options.onSaveProject ? () => options.onSaveProject!() : undefined,
    saveLocal,
    active: () => !disposed && !!song.read().draft,
    onBusy(busy) {
      root.querySelectorAll<HTMLButtonElement>('.song-save-project').forEach(button => {
        button.disabled = busy;
        button.textContent = busy ? '正在保存…' : '保存工程…';
      });
    },
    onError: error => report(error instanceof Error ? error.message : String(error), true),
  });
  function saveCurrent(): void { void saveAction.run(); }
  function editPhrase(ref: SongClipRef, chooseLocations = false): void {
    if (!options.onEditPhrase) return;
    try { stopGesture?.(); stopPlayback(); options.onEditPhrase(ref, chooseLocations); }
    catch (error) { report(error instanceof Error ? error.message : String(error), true); }
  }
  async function projectFile(callback: () => void | Promise<void>): Promise<void> {
    try {
      if (!disposed) await callback();
    } catch (error) {
      if (!disposed) report(error instanceof Error ? error.message : String(error), true);
    }
  }
  function openSongs(): void {
    stopPlayback(); const view = song.read(); const dialog = node('dialog', 'library-dialog');
    const heading = node('div', 'library-heading'); heading.append(node('h2', '', '我的歌曲'), action('关闭', 'quiet', () => dialog.close())); dialog.append(heading);
    if (!view.savedSongs.length && !view.unfinishedDrafts.length) dialog.append(node('p', '', '第一首歌会留在这里。'));
    for (const draft of view.unfinishedDrafts) dialog.append(action(`${draft.name} · 编辑稿 ↗`, 'library-sound', () => { dialog.close(); edit(() => { song.openDraft(draft.id); selected.clear(); selectedTrack = undefined; }); }));
    for (const content of view.savedSongs) dialog.append(action(`${content.name} ↗`, 'library-sound', () => { dialog.close(); edit(() => { song.open(content.id); selected.clear(); selectedTrack = undefined; }); }));
    dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
  }
  function rememberScroll(): void { const scroller = root.querySelector<HTMLElement>('.song-scroll'); if (scroller) { scrollLeft = scroller.scrollLeft; scrollTop = scroller.scrollTop; } }
  function render(): void {
    if (disposed) return;
    const pageScrollTop = document.scrollingElement?.scrollTop ?? 0;
    window.clearTimeout(layoutTimer); deferredLayout = false; rememberScroll(); stopGesture?.(); stopGesture = undefined;
    const view = song.read(); const body = view.body;
    const sameDraft = !!view.draft && view.draft.id === renderedDraftId;
    if (!sameDraft) {
      renderedDraftId = view.draft?.id; selectedTrack = undefined; selected.clear(); scrollLeft = 0; scrollTop = 0;
    }
    const lengths = new Map<string, number>(Object.entries(view.clipLengths ?? {}));
    const lengthFor = (id: string) => { let length = lengths.get(id); if (length === undefined) { length = song.clipLengthBeats(id); lengths.set(id, length); } return length; };
    if (body) { selectedTrack = body.tracks.some(track => track.id === selectedTrack) ? selectedTrack : body.tracks[0]!.id; selected = new Set([...selected].filter(id => body.tracks.some(track => track.clips.some(clip => clip.id === id)))); }
    root.replaceChildren(); const page = node('div', 'studio song-studio'); const toolbar = node('header', 'studio-toolbar');
    toolbar.append(action('RootSound', 'wordmark brand-button', options.onWelcome));
    const tabs = node('nav', 'workspace-tabs'); tabs.setAttribute('aria-label', '切换创作工作区');
    if (options.onSampling) tabs.append(action('采样获取', 'workspace-tab', options.onSampling));
    tabs.append(action('音色制作', 'workspace-tab', options.onSound), action('乐句谱写', 'workspace-tab', options.onPhrase), action('歌曲编排', 'workspace-tab is-active', () => {})); toolbar.append(tabs);
    const tools = node('nav', 'toolbar-tools');
    if (!options.referenceContext) tools.append(action('新建歌曲', 'quiet', () => edit(() => { song.create(); selected.clear(); selectedTrack = undefined; scrollLeft = 0; })), action('我的歌曲', 'quiet', openSongs));
    if (options.onOpenProject) tools.append(action('打开工程…', 'quiet song-open-project', () => { void projectFile(options.onOpenProject!); }));
    if (options.onLibrary) tools.append(action('素材', 'quiet', () => { stopPlayback(); options.onLibrary!(); }));
    if (options.onSettings) tools.append(action('设置', 'quiet', () => { stopPlayback(); options.onSettings!(); })); toolbar.append(tools); page.append(toolbar);
    const main = node('main', 'song-workspace');
    if (options.referenceContext) main.append(createReferenceNavigation(options.referenceContext));
    if (!body || !view.draft) {
      const empty = node('section', 'song-empty'); empty.append(node('h1', '', view.problem ? '歌曲无法打开' : '歌曲编排'));
      if (view.problem) empty.append(node('p', 'muted', view.problem));
      empty.append(action('新建歌曲', 'primary', () => edit(() => { song.create(); selected.clear(); selectedTrack = undefined; })));
      if (!view.availablePhrases.length) empty.append(action('先写一段乐句', 'quiet', options.onPhrase)); main.append(empty);
    } else {
      const heading = node('div', 'song-heading'); const title = node('div');
      const name = node('input', 'sound-name'); name.value = view.draft.name; name.maxLength = 100; name.setAttribute('aria-label', '歌曲名称'); name.addEventListener('change', () => { if (quietEdit(() => song.rename(name.value))) name.value = song.read().draft!.name; });
      title.append(name, node('p', 'save-state', '本机编辑稿已保留')); heading.append(title);
      const transport = node('div', 'song-transport'); playButton = action('▶ 听整首', 'preview-button', () => { void play(); });
      const saveButton = action(options.onSaveProject ? (saveAction.busy ? '正在保存…' : '保存工程…') : '保存歌曲', 'primary compact' + (options.onSaveProject ? ' song-save-project' : ''), saveCurrent);
      saveButton.disabled = saveAction.busy;
      transport.append(playButton, saveButton);
      if (!options.onSaveProject && view.draft.sourceId && !options.referenceContext) transport.append(action('另存', 'quiet', () => save('new')));
      const applyElsewhere = options.referenceContext?.onApplyElsewhere ?? options.onApplyElsewhere;
      if (applyElsewhere) transport.append(action('应用到其他位置…', 'quiet', applyElsewhere));
      if (options.onExport) transport.append(action('导出音频', 'secondary', () => { stopPlayback(); options.onExport!(); })); heading.append(transport); main.append(heading);
      const controls = node('div', 'song-controls');
      const tempoLabel = node('label', 'song-field'); tempoLabel.append(node('span', '', '歌曲速度'));
      const tempo = node('input'); tempo.type = 'number'; tempo.min = '40'; tempo.max = '240'; tempo.step = '1'; tempo.value = String(body.tempoBpm); tempo.setAttribute('aria-label', '歌曲速度'); tempo.addEventListener('change', () => {
        if (!quietEdit(() => song.setTempo(Number(tempo.value)))) return;
        if (pointerDown) deferredLayout = true; else render();
      }); tempoLabel.append(tempo); controls.append(tempoLabel);
      tempo.addEventListener('input', () => {
        const value = Number(tempo.value); if (!Number.isFinite(value) || value < 40 || value > 240) return;
        liveBody = { ...song.read().body!, tempoBpm: value }; playbackTempo = value;
        livePreview.request(() => song.previewPlan(liveBody, { allowSilence: true }));
      });
      const tempoModeLabel = node('label', 'song-field'); tempoModeLabel.append(node('span', '', '乐句速度')); const tempoMode = node('select'); tempoMode.setAttribute('aria-label', '乐句播放速度规则');
      for (const [value, label] of [['source', '各自保留原速'], ['song', '跟随歌曲速度']]) { const option = node('option', '', label); option.value = value!; tempoMode.append(option); }
      tempoMode.value = body.tempoMode; tempoMode.addEventListener('change', () => edit(() => song.setTempoMode(tempoMode.value as 'source' | 'song'))); tempoModeLabel.append(tempoMode); controls.append(tempoModeLabel);
      const snapLabel = node('label', 'song-field'); snapLabel.append(node('span', '', '对齐')); const snapSelect = node('select'); snapSelect.setAttribute('aria-label', '片段移动对齐');
      for (const [value, label] of [['1', '一拍'], ['0.5', '半拍'], ['0.25', '四分之一拍'], ['0', '自由移动']]) { const option = node('option', '', label); option.value = value!; snapSelect.append(option); }
      snapSelect.value = String(snap); snapSelect.addEventListener('change', () => { snap = Number(snapSelect.value); }); snapLabel.append(snapSelect); controls.append(snapLabel);
      const zoomLabel = node('label', 'song-field song-zoom'); zoomLabel.append(node('span', '', '缩放')); const zoom = node('input'); zoom.type = 'range'; zoom.min = '20'; zoom.max = '100'; zoom.step = '4'; zoom.value = String(beatPixels); zoom.setAttribute('aria-label', '歌曲时间线缩放'); zoom.addEventListener('change', () => { beatPixels = Number(zoom.value); render(); }); zoomLabel.append(zoom); controls.append(zoomLabel);
      const undo = action('撤销', 'quiet song-undo', () => edit(() => song.undo())); undo.disabled = !view.canUndo; const redo = action('重做', 'quiet song-redo', () => edit(() => song.redo())); redo.disabled = !view.canRedo; controls.append(undo, redo); main.append(controls);
      const post = node('details', 'song-post'); post.open = postOpen;
      post.addEventListener('toggle', () => { postOpen = post.open; });
      const summary = node('summary', '', '后期'); summary.title = '最终输出处理；试听和导出使用相同设置，自动峰值保护始终开启。'; post.append(summary);
      const postControls = node('div', 'song-post-controls');
      const readSettings = (): PostProductionSettings => song.read().body!.postProduction ?? { enabled: true, level: 1, fadeInSeconds: 0, fadeOutSeconds: 0 };
      const original = node('label', 'song-field'); const bypass = node('input'); bypass.type = 'checkbox'; bypass.checked = !readSettings().enabled;
      bypass.addEventListener('change', () => {
        if (quietEdit(() => song.setPostProduction({ ...readSettings(), enabled: !bypass.checked }))) {
          postControls.querySelectorAll<HTMLInputElement>('[data-post-control]').forEach(input => { input.disabled = bypass.checked; });
        }
      }); original.append(bypass, node('span', '', '原声对比')); postControls.append(original);
      for (const field of ['level', 'fadeInSeconds', 'fadeOutSeconds'] as const) {
        const label = node('label', 'song-field'); const caption = field === 'level' ? '总音量' : field === 'fadeInSeconds' ? '淡入 / 秒' : '淡出 / 秒';
        label.append(node('span', '', caption)); const input = node('input'); input.dataset.postControl = '';
        input.type = field === 'level' ? 'range' : 'number'; input.min = '0'; input.max = field === 'level' ? '1' : '30'; input.step = field === 'level' ? '0.01' : '0.1';
        input.value = String(readSettings()[field]); input.disabled = bypass.checked; input.setAttribute('aria-label', caption);
        input.title = field === 'level' ? '整首歌输出音量' : '按整首歌的时间计算，包含末尾收音；过长时自动收缩到歌长。';
        const value = node('output', 'song-output-value', `${Math.round(Number(input.value) * 100)}%`);
        input.addEventListener('input', () => {
          const setting = Number(input.value); if (!Number.isFinite(setting) || setting < 0 || setting > Number(input.max)) return;
          value.textContent = `${Math.round(setting * 100)}%`;
          liveBody = { ...song.read().body!, postProduction: { ...readSettings(), [field]: setting } };
          livePreview.request(() => song.previewPlan(liveBody, { allowSilence: true }));
        });
        input.addEventListener('pointercancel', () => {
          liveBody = undefined; input.value = String(readSettings()[field]); value.textContent = `${Math.round(Number(input.value) * 100)}%`;
          livePreview.flush(() => song.previewPlan(undefined, { allowSilence: true }));
        });
        input.addEventListener('change', () => { quietEdit(() => song.setPostProduction({ ...readSettings(), [field]: Number(input.value) })); });
        label.append(input); if (field === 'level') label.append(value); postControls.append(label);
      }
      post.append(postControls); main.append(post);
      if (!options.renderEntities) {
      const palette = node('section', 'song-palette'); palette.setAttribute('aria-label', '可用乐句');
      if (!view.availablePhrases.length) palette.append(node('span', 'muted', '这里还没有乐句。'), action('去写一段 ↗', 'quiet', options.onPhrase));
      else {
        palette.append(node('span', 'song-palette-label', '我的乐句'));
        for (const phrase of view.availablePhrases) {
          const card = action(`＋ ${phrase.name}`, 'song-phrase-card', () => {
            const target = body.tracks.find(track => track.id === selectedTrack)!;
            const start = Math.max(0, ...target.clips.map(clip => clip.startBeat + lengthFor(clip.phraseId)));
            edit(() => { selected = new Set([song.addClip(target.id, phrase.id, start)]); });
          });
          card.draggable = true; card.title = '拖到时间线上；点击会接在当前轨道末尾。';
          card.addEventListener('dragstart', event => { event.dataTransfer?.setData('application/x-rootsound-phrase', phrase.id); if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy'; }); palette.append(card);
        }
      }
      main.append(palette);
      }
      const scroller = node('div', 'song-scroll'); const timeline = node('div', 'song-timeline');
      const displayBeats = Math.max(16, Math.ceil(view.lengthBeats / 4) * 4 + 4); timeline.style.width = `${180 + displayBeats * beatPixels}px`;
      const ruler = node('div', 'song-ruler'); ruler.append(node('span', 'song-ruler-corner', '时间 · 拍'));
      for (let beat = 0; beat < displayBeats; beat++) { const mark = node('span', beat % 4 === 0 ? 'is-strong' : '', String(beat + 1)); mark.style.width = `${beatPixels}px`; ruler.append(mark); } timeline.append(ruler);
      const rows: Array<{ id: string; grid: HTMLElement }> = [];
      const clipElements = new Map<string, HTMLElement>();
      body.tracks.forEach((track, trackIndex) => {
        const row = node('section', 'song-track' + (track.id === selectedTrack ? ' is-active' : '') + (track.muted ? ' is-muted' : '')); row.dataset.trackId = track.id;
        const sidebar = node('div', 'song-track-controls'); sidebar.addEventListener('click', () => { selectedTrack = track.id; root.querySelectorAll('.song-track').forEach(item => item.classList.toggle('is-active', (item as HTMLElement).dataset.trackId === track.id)); });
        const trackName = node('input', 'song-track-name'); trackName.value = track.name; trackName.maxLength = 60; trackName.setAttribute('aria-label', `轨道 ${trackIndex + 1} 名称`); trackName.addEventListener('change', () => { quietEdit(() => song.updateTrack(track.id, { name: trackName.value.trim() })); }); sidebar.append(trackName);
        const switches = node('div', 'song-track-switches');
        const mute = action('静音', 'song-toggle' + (track.muted ? ' is-on' : ''), () => edit(() => song.updateTrack(track.id, { muted: !track.muted }))); mute.setAttribute('aria-pressed', String(track.muted)); mute.setAttribute('aria-label', `${track.name}静音`);
        const solo = action('单独听', 'song-toggle' + (track.solo ? ' is-on' : ''), () => edit(() => song.updateTrack(track.id, { solo: !track.solo }))); solo.setAttribute('aria-pressed', String(track.solo)); solo.setAttribute('aria-label', `${track.name}单独听`); switches.append(mute, solo);
        const removeTrack = action('×', 'song-remove-track', () => {
          if (!track.clips.length) { edit(() => song.removeTrack(track.id)); return; }
          const dialog = node('dialog'); dialog.append(node('h2', '', '移除这条轨道？'), node('p', '', `${track.clips.length} 个乐句片段也会移除，可用撤销找回。`)); const buttons = node('div', 'dialog-actions');
          buttons.append(action('返回', 'secondary', () => dialog.close()), action('移除', 'primary', () => { dialog.close(); edit(() => song.removeTrack(track.id)); })); dialog.append(buttons); dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
        }); removeTrack.disabled = body.tracks.length === 1; removeTrack.setAttribute('aria-label', `移除${track.name}轨道`); switches.append(removeTrack); sidebar.append(switches);
        for (const field of ['level', 'pan'] as const) {
          const label = node('label', 'song-mix'); label.append(node('span', '', field === 'level' ? '音量' : '左右'));
          const input = node('input'); input.type = 'range'; input.min = field === 'level' ? '0' : '-1'; input.max = '1'; input.step = '0.01'; input.value = String(track[field]); input.setAttribute('aria-label', `${track.name}${field === 'level' ? '音量' : '左右位置'}`);
          input.addEventListener('input', () => {
            const current = song.read().body!;
            liveBody = { ...current, tracks: current.tracks.map(item => item.id === track.id ? { ...item, [field]: Number(input.value) } : item) };
            livePreview.request(() => song.previewPlan(liveBody, { allowSilence: true }));
            report(`${track.name} · ${field === 'level' ? `音量 ${Math.round(Number(input.value) * 100)}%` : Number(input.value) === 0 ? '居中' : `${Number(input.value) < 0 ? '偏左' : '偏右'} ${Math.abs(Math.round(Number(input.value) * 100))}%`}`);
          });
          input.addEventListener('pointercancel', () => {
            liveBody = undefined; input.value = String(song.read().body!.tracks.find(item => item.id === track.id)![field]);
            livePreview.flush(() => song.previewPlan(undefined, { allowSilence: true }));
          });
          input.addEventListener('change', () => edit(() => song.updateTrack(track.id, { [field]: Number(input.value) }))); label.append(input); sidebar.append(label);
        }
        const grid = node('div', 'song-track-grid'); grid.style.width = `${displayBeats * beatPixels}px`; grid.style.setProperty('--song-beat-width', `${beatPixels}px`); rows.push({ id: track.id, grid });
        // Overlapping phrases get separate visual rows without changing their musical overlap.
        const ends: number[] = [];
        [...track.clips].sort((a, b) => a.startBeat - b.startBeat).forEach(clip => {
          const length = lengthFor(clip.phraseId); let lane = ends.findIndex(end => end <= clip.startBeat + 1e-8); if (lane < 0) lane = ends.length; ends[lane] = clip.startBeat + length;
          const phraseName = view.availablePhrases.find(item => item.id === clip.phraseId)?.name ?? '乐句';
          const block = action(phraseName, 'song-clip' + (selected.has(clip.id) ? ' is-selected' : ''), () => {}); block.dataset.clipId = clip.id;
          clipElements.set(clip.id, block);
          block.style.left = `${clip.startBeat * beatPixels + 2}px`; block.style.width = `${Math.max(12, length * beatPixels - 4)}px`; block.style.top = `${14 + lane * 39}px`;
          const description = `${phraseName}，${track.name}，第 ${Number((clip.startBeat + 1).toFixed(3))} 拍，持续 ${Number(length.toFixed(3))} 拍`;
          block.setAttribute('aria-label', description); block.title = description; block.setAttribute('aria-pressed', String(selected.has(clip.id)));
          if (options.onEditPhrase) {
            block.title += '；双击编辑这一处乐句，右键可选择联合修改。';
            block.addEventListener('dblclick', event => {
              if (event.ctrlKey || event.metaKey || event.shiftKey) return;
              event.preventDefault(); event.stopPropagation(); editPhrase({ trackId: track.id, clipId: clip.id });
            });
            block.addEventListener('contextmenu', event => {
              event.preventDefault(); event.stopPropagation();
              selected = new Set([clip.id]); selectedTrack = track.id; updateSelection();
              const ref = { trackId: track.id, clipId: clip.id };
              showReferenceActions(root, { label: phraseName, onEdit: () => editPhrase(ref), onChoose: () => editPhrase(ref, true) });
            });
          }
          block.addEventListener('pointerdown', event => {
            if (event.button !== 0) return; event.preventDefault(); event.stopPropagation();
            // Preventing the browser's pointer default preserves our drag gesture,
            // so explicitly leave any text field before using workspace shortcuts.
            block.focus({ preventScroll: true });
            if (!block.isConnected) return; // A rejected field edit may have rebuilt the authoritative view.
            if (event.ctrlKey || event.metaKey || event.shiftKey) { if (selected.has(clip.id)) selected.delete(clip.id); else selected.add(clip.id); selectedTrack = track.id; updateSelection(); return; }
            if (!selected.has(clip.id)) selected = new Set([clip.id]); selectedTrack = track.id; updateSelection();
            const refs = picked(); const originX = event.clientX; const originY = event.clientY;
            const minBeat = Math.min(...refs.map(ref => ref.clip.startBeat));
            const maxEnd = Math.max(...refs.map(ref => ref.clip.startBeat + lengthFor(ref.clip.phraseId)));
            const originals = refs.map(ref => ({ ...ref, element: clipElements.get(ref.clipId) }));
            let delta = 0; let targetIndex = trackIndex; let moved = false;
            block.setPointerCapture(event.pointerId); block.classList.add('is-dragging');
            const move = (input: PointerEvent) => {
              moved ||= Math.abs(input.clientX - originX) > 2 || Math.abs(input.clientY - originY) > 2;
              if (!moved) return;
              delta = Math.max(-minBeat, Math.min(1024 - maxEnd, (input.clientX - originX) / beatPixels));
              const hovered = rows.findIndex(item => { const rect = item.grid.getBoundingClientRect(); return input.clientY >= rect.top && input.clientY <= rect.bottom; });
              targetIndex = hovered >= 0 ? hovered : targetIndex;
              const minIndex = Math.min(...refs.map(ref => ref.trackIndex)); const maxIndex = Math.max(...refs.map(ref => ref.trackIndex));
              const trackDelta = Math.max(-minIndex, Math.min(body.tracks.length - 1 - maxIndex, targetIndex - trackIndex)); targetIndex = trackIndex + trackDelta;
              for (const ref of originals) if (ref.element) { const current = rows[ref.trackIndex]!.grid.getBoundingClientRect(); const target = rows[ref.trackIndex + trackDelta]!.grid.getBoundingClientRect(); ref.element.style.transform = `translate(${delta * beatPixels}px, ${target.top - current.top}px)`; ref.element.classList.add('is-dragging'); }
              const moving = new Map(refs.map(ref => [ref.clipId, { ...ref.clip, startBeat: Math.max(0, ref.clip.startBeat + delta), target: ref.trackIndex + trackDelta }]));
              liveBody = { ...body, tracks: body.tracks.map((item, index) => ({ ...item,
                clips: [...item.clips.filter(clip => !moving.has(clip.id)), ...[...moving.values()].filter(clip => clip.target === index).map(({ target: _target, ...clip }) => clip)] })) };
              livePreview.request(() => song.previewPlan(liveBody, { allowSilence: true }));
            };
            const cleanup = () => { block.removeEventListener('pointermove', move); block.removeEventListener('pointerup', up); block.removeEventListener('pointercancel', cancel); block.removeEventListener('lostpointercapture', cancel); if (block.hasPointerCapture(event.pointerId)) block.releasePointerCapture(event.pointerId); originals.forEach(ref => { if (ref.element) { ref.element.style.transform = ''; ref.element.classList.remove('is-dragging'); } }); stopGesture = undefined; };
            const up = () => {
              cleanup();
              if (moved) {
                const landing = Math.max(-minBeat, Math.min(1024 - maxEnd, quantize(delta)));
                edit(() => song.moveClips(refs.map(ref => ({ trackId: ref.trackId, clipId: ref.clipId, targetTrackId: body.tracks[ref.trackIndex + targetIndex - trackIndex]!.id, startBeat: Math.max(0, ref.clip.startBeat + landing) }))));
              } else block.focus({ preventScroll: true });
            };
            const cancel = () => { cleanup(); liveBody = undefined; livePreview.flush(() => song.previewPlan(undefined, { allowSilence: true })); };
            stopGesture?.(); stopGesture = cancel; block.addEventListener('pointermove', move); block.addEventListener('pointerup', up); block.addEventListener('pointercancel', cancel); block.addEventListener('lostpointercapture', cancel);
          });
          block.addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey && options.onEditPhrase) {
              event.preventDefault(); event.stopPropagation(); editPhrase({ trackId: track.id, clipId: clip.id }); return;
            }
            if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !event.ctrlKey && !event.metaKey) {
              event.preventDefault(); const refs = picked(); const delta = (event.key === 'ArrowLeft' ? -1 : 1) * (snap || 0.1);
              edit(() => song.moveClips(refs.map(ref => ({ trackId: ref.trackId, clipId: ref.clipId, targetTrackId: ref.trackId, startBeat: ref.clip.startBeat + delta }))));
            }
          }); grid.append(block);
        });
        grid.style.height = `${Math.max(144, ends.length * 39 + 28)}px`;
        grid.addEventListener('pointerdown', event => { if ((event.target as Element).closest('.song-clip')) return; selectedTrack = track.id; selected.clear(); updateSelection(); root.querySelectorAll('.song-track').forEach(item => item.classList.toggle('is-active', (item as HTMLElement).dataset.trackId === track.id)); });
        grid.addEventListener('dragover', event => { if (event.dataTransfer?.types.some(type => type === 'application/x-rootsound-phrase' || type === 'application/x-rootsound-entity')) { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; grid.classList.add('is-drop-target'); } });
        grid.addEventListener('dragleave', () => grid.classList.remove('is-drop-target'));
        grid.addEventListener('drop', event => {
          event.preventDefault(); grid.classList.remove('is-drop-target'); if (!event.dataTransfer) return;
          const entity = readEntityDrag(event.dataTransfer); const id = entity?.kind === 'rootsound.phrase' ? entity.id : event.dataTransfer.getData('application/x-rootsound-phrase');
          if (!id || !song.read().availablePhrases.some(phrase => phrase.id === id)) return;
          const beat = Math.max(0, quantize((event.clientX - grid.getBoundingClientRect().left) / beatPixels));
          edit(() => { selectedTrack = track.id; selected = new Set([song.addClip(track.id, id, beat)]); });
        });
        row.append(sidebar, grid); timeline.append(row);
      });
      playhead = node('div', 'song-playhead'); playhead.hidden = !sessionId; timeline.append(playhead); scroller.append(timeline); main.append(scroller);
      queueMicrotask(() => { if (scroller.isConnected) { scroller.scrollLeft = scrollLeft; scroller.scrollTop = scrollTop; } });
      const footer = node('div', 'song-edit-tools'); footer.append(action('＋ 添加轨道', 'quiet', () => edit(() => { selectedTrack = song.addTrack(); })), action('延长 16 拍', 'quiet', () => edit(() => song.setLength(Math.ceil(view.lengthBeats / 16) * 16 + 16))));
      for (const [label, callback] of [['复制一份', duplicate], ['复制', copy], ['删除选中', remove]] as const) { const button = action(label, 'quiet', callback); button.dataset.songSelectionAction = ''; button.disabled = !selected.size; footer.append(button); }
      if (options.onEditPhrase) {
        const open = action('编辑乐句', 'quiet song-edit-phrase', () => { const refs = picked(); if (refs.length === 1) editPhrase(refs[0]!); });
        open.dataset.songSingleSelectionAction = ''; open.disabled = selected.size !== 1; footer.append(open);
      }
      const pasteButton = action('粘贴到末尾', 'quiet song-paste', paste); pasteButton.disabled = !clipboard.length; footer.append(pasteButton); main.append(footer);
    }
    notice = node('p', 'studio-notice' + (isError ? ' is-error' : ''), status); notice.setAttribute('role', 'status'); main.append(notice); page.append(main);
    if (options.renderEntities) { page.append(options.renderEntities()); page.classList.add('has-entity-rail'); }
    root.append(page); updatePlayback();
    const restoreScroll = () => {
      if (disposed || !page.isConnected) return;
      // Replacing the document collapses its height momentarily. Keep this draft's
      // page and timeline positions, and start another draft at its own beginning.
      if (document.scrollingElement) document.scrollingElement.scrollTop = sameDraft ? pageScrollTop : 0;
      const scroller = page.querySelector<HTMLElement>('.song-scroll');
      if (scroller) { scroller.scrollLeft = scrollLeft; scroller.scrollTop = scrollTop; }
    };
    restoreScroll(); queueMicrotask(restoreScroll);
  }
  const unsubscribe = sound.subscribe(event => {
    if (event.type === 'session') {
      if (event.session.status === 'playing') {
        if (preparing) { sessionId = event.session.id; report('正在演奏…'); cancelAnimationFrame(frame); tick(); }
      } else if (event.session.id === sessionId) { sessionId = undefined; cancelAnimationFrame(frame); report(event.session.status === 'failed' ? event.session.error ?? '演奏未能完成。' : '已结束。', event.session.status === 'failed'); }
      updatePlayback();
    } else if (event.status === 'failed' || event.status === 'suspended') report(event.error ?? '声音设备暂不可用。', true);
  });
  const keydown = (event: KeyboardEvent) => {
    if (root.querySelector('dialog[open]')) return;
    if (isSongSaveShortcut(event)) {
      event.preventDefault();
      if (!event.repeat) saveCurrent(); return;
    }
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement || (event.target as HTMLElement)?.isContentEditable) return;
    if ((event.code === 'Space' || event.key === ' ') && (!(event.target instanceof HTMLButtonElement) || event.target.classList.contains('song-clip'))) { event.preventDefault(); void play(); }
    if (event.key === 'Delete' || event.key === 'Backspace' || event.code === 'Delete' || event.code === 'Backspace') { event.preventDefault(); remove(); }
    if (event.ctrlKey || event.metaKey) {
      // Virtual/accessibility keyboards can supply a key without a physical code.
      const shortcut = (letter: string) => /^Key[A-Z]$/u.test(event.code)
        ? event.code === `Key${letter.toUpperCase()}` : event.key.toLowerCase() === letter;
      if (shortcut('z')) { event.preventDefault(); edit(() => event.shiftKey ? song.redo() : song.undo()); }
      if (shortcut('y')) { event.preventDefault(); edit(() => song.redo()); }
      if (shortcut('a')) { event.preventDefault(); selected = new Set(song.read().body?.tracks.flatMap(track => track.clips.map(clip => clip.id))); updateSelection(); }
      if (shortcut('c')) { event.preventDefault(); copy(); }
      if (shortcut('v')) { event.preventDefault(); paste(); }
      if (shortcut('d')) { event.preventDefault(); duplicate(); }
    }
  };
  const beginPointer = () => { pointerDown = true; };
  const applyDeferredLayout = () => {
    if (disposed) return;
    const dialog = root.querySelector<HTMLDialogElement>('dialog[open]');
    // The click following a field blur may open settings or export. Keep that dialog alive.
    if (dialog) { dialog.addEventListener('close', () => { layoutTimer = window.setTimeout(applyDeferredLayout, 0); }, { once: true }); return; }
    render();
  };
  const endPointer = () => { pointerDown = false; if (deferredLayout) { deferredLayout = false; layoutTimer = window.setTimeout(applyDeferredLayout, 0); } };
  document.addEventListener('keydown', keydown); document.addEventListener('pointerdown', beginPointer, true); document.addEventListener('pointerup', endPointer, true); document.addEventListener('pointercancel', endPointer, true); render();
  return {
    notify(message, error = false) { if (!disposed) report(message, error); },
    refresh(context, onApplyElsewhere) {
      if (disposed) return;
      options.referenceContext = context; options.onApplyElsewhere = onApplyElsewhere; render();
    },
    dispose() { disposed = true; stopPlayback(); stopGesture?.(); unsubscribe(); cancelAnimationFrame(frame); window.clearTimeout(layoutTimer); document.removeEventListener('keydown', keydown); document.removeEventListener('pointerdown', beginPointer, true); document.removeEventListener('pointerup', endPointer, true); document.removeEventListener('pointercancel', endPointer, true); },
  };
}
