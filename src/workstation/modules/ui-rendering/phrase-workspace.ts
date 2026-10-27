import type { PhraseBody, PhraseEditorPort, PhraseNote, PhrasePart } from '../../contracts/phrase.ts';
import type { SaveConfirmation, SaveResult } from '../../contracts/content.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import { createLivePreview } from './live-preview.ts';
import { initialPhraseViewport, phrasePitchRow } from './phrase-viewport.ts';
import { createPhraseAudition } from './phrase-audition.ts';
import { readEntityDrag } from './entity-drag.ts';
import { createReferenceNavigation, showReferenceActions, type ReferenceEditorContext } from './reference-ui.ts';
import './phrase.css';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const result = document.createElement(tag); result.className = className; result.textContent = text; return result;
}
function action(text: string, className: string, callback: () => void): HTMLButtonElement {
  const result = node('button', className, text); result.type = 'button'; result.addEventListener('click', callback); return result;
}

/** Only the focused task is mounted. The phrase unit owns notes, pitch and musical time. */
export function mountPhraseWorkspace(root: HTMLElement, options: {
  phrase: PhraseEditorPort; sound: SoundRuntimePort; onSound(): void; onWelcome(): void;
  onSong?(): void; onLibrary?(): void; onSettings?(): void; onExport?(): void; onCoCreation?(): void; onSampling?(): void;
  referenceContext?: ReferenceEditorContext;
  renderEntities?(): HTMLElement;
  onSave?(): void; onApplyElsewhere?(): void;
  onNewPhrase?(timbreId?: string): void;
  onSaved?(id: string): void;
  onEditSound?(partId: string, chooseLocations?: boolean): void;
}): { dispose(): void; refresh(context?: ReferenceEditorContext, onApplyElsewhere?: () => void): void } {
  const { phrase, sound } = options;
  let selectedPart: string | undefined;
  let renderedParts: PhrasePart[] = [];
  let selectedNotes = new Set<string>();
  let selectedDraft: string | undefined;
  let noteClipboard: Array<Omit<PhraseNote, 'id'>> = [];
  let pasteBeat = 0;
  let zoom = 1;
  let snap = 0.5;
  let scrollLeft = 0;
  let nextScrollLeft: number | undefined;
  let scrollTop = 0;
  let disposed = false;
  let sessionId: string | undefined;
  let liveBody: PhraseBody | undefined;
  const livePreview = createLivePreview(sound, () => sessionId, error => report(error instanceof Error ? error.message : String(error), true), undefined, () => phrase.preparePreview());
  const noteAudition = createPhraseAudition(phrase, sound, () => selectedPart, error => report(error, true));
  let playbackTempo = 120;
  let playbackGeneration = 0;
  let preparing = false;
  let frame = 0;
  let layoutFrame = 0;
  let viewportWidth = 0;
  let layoutObserver: ResizeObserver | undefined;
  let stopGesture: (() => void) | undefined;
  let status = '';
  let isError = false;
  let notice: HTMLElement | undefined;
  let playButton: HTMLButtonElement | undefined;
  let cursor: HTMLElement | undefined;
  let beatPixels = 82;

  function selected(): { part: PhrasePart; notes: PhraseNote[] } | undefined {
    // Selection feedback uses the already displayed snapshot. Domain commands
    // still validate the latest draft before their single durable write.
    const part = renderedParts.find(item => item.id === selectedPart);
    return part ? { part, notes: part.notes.filter(note => selectedNotes.has(note.id)) } : undefined;
  }
  function syncSelection(): void {
    const state = selected();
    root.querySelectorAll<HTMLButtonElement>('.phrase-note:not(.is-ghost)').forEach(block => {
      const active = selectedNotes.has(block.dataset.noteId!);
      block.classList.toggle('is-selected', active); block.setAttribute('aria-pressed', String(active));
    });
    const count = root.querySelector<HTMLElement>('.phrase-selection-count');
    if (count) count.textContent = state?.notes.length ? `已选 ${state.notes.length}` : '';
    const pastePosition = root.querySelector<HTMLElement>('.phrase-paste-position');
    if (pastePosition) pastePosition.textContent = `粘贴到第 ${Number((pasteBeat + 1).toFixed(3))} 拍`;
    root.querySelectorAll<HTMLButtonElement>('[data-needs-selection]').forEach(button => { button.disabled = !state?.notes.length; });
    const velocity = root.querySelector<HTMLInputElement>('.phrase-velocity');
    const amount = root.querySelector<HTMLElement>('.phrase-velocity-value');
    if (velocity) { velocity.disabled = !state?.notes.length; velocity.value = String(Math.round((state?.notes[0]?.velocity ?? 0.75) * 100)); }
    if (amount && velocity) amount.textContent = `${velocity.value}%`;
  }
  function copyNotes(): void {
    const state = selected();
    if (!state?.notes.length) return;
    const first = Math.min(...state.notes.map(note => note.startBeat));
    noteClipboard = state.notes.map(({ id: _id, ...note }) => ({ ...note, startBeat: note.startBeat - first }));
    pasteBeat = Math.max(...state.notes.map(note => note.startBeat + note.durationBeats));
    report(`已复制 ${noteClipboard.length} 个音符。`);
    const paste = root.querySelector<HTMLButtonElement>('.phrase-paste'); if (paste) paste.disabled = false;
    syncSelection();
  }
  function pasteNotes(duplicate = false): void {
    const state = selected(); const body = phrase.read().body;
    if (!state || !body) return;
    if (duplicate) { if (!state.notes.length) return; copyNotes(); }
    if (!noteClipboard.length) return;
    const span = Math.max(...noteClipboard.map(note => note.startBeat + note.durationBeats));
    const target = duplicate ? Math.max(...state.notes.map(note => note.startBeat + note.durationBeats)) : pasteBeat;
    if (target < 0 || target + span > body.lengthBeats + 1e-10) { report('当前位置放不下这些音符，请先延长乐句或换一个粘贴位置。', true); return; }
    edit(() => { selectedNotes = new Set(phrase.addNotes(state.part.id, noteClipboard.map(note => ({ ...note, startBeat: note.startBeat + target })))); pasteBeat = target + span; }, `已${duplicate ? '重复' : '粘贴'} ${noteClipboard.length} 个音符。`);
  }
  function deleteNotes(): void {
    const state = selected(); if (!state?.notes.length) return;
    edit(() => { phrase.removeNotes(state.notes.map(note => ({ partId: state.part.id, noteId: note.id }))); selectedNotes.clear(); });
  }

  function report(text: string, error = false): void {
    status = text; isError = error;
    if (notice) { notice.textContent = text; notice.classList.toggle('is-error', error); }
  }
  function edit(change: () => void, text = '编辑稿已保留。'): boolean {
    const editorHadFocus = document.activeElement instanceof HTMLElement && !!document.activeElement.closest('.phrase-grid');
    const previousDraft = phrase.read().draft?.id;
    liveBody = undefined;
    let success = false;
    try { change(); success = true; report(text); } catch (error) { report(error instanceof Error ? error.message : String(error), true); }
    if (phrase.read().draft?.id !== previousDraft) stopPlayback();
    else { playbackTempo = phrase.read().body?.tempoBpm ?? playbackTempo; livePreview.flush(() => phrase.previewPlan(undefined, { allowSilence: true })); }
    render();
    if (editorHadFocus) {
      // Rendering replaces note elements. Restore the editor focus so a second
      // shortcut immediately applies to the newly selected notes, not a field.
      const target = root.querySelector<HTMLElement>('.phrase-note.is-selected:not(.is-ghost)') ?? root.querySelector<HTMLElement>('.phrase-grid');
      target?.focus({ preventScroll: true });
    }
    return success;
  }
  function updatePlayback(): void {
    if (playButton) { playButton.textContent = preparing ? '取消准备' : sessionId ? '■ 停止' : '▶ 听整段'; playButton.disabled = false; }
    if (cursor) cursor.hidden = !sessionId;
  }
  function stopPlayback(): void {
    noteAudition.cancel();
    livePreview.cancel(); liveBody = undefined;
    // Invalidate before cancelling the device: old promise continuations must
    // not report an intentional cancellation or overwrite a newer transport.
    playbackGeneration++; preparing = false; sessionId = undefined;
    cancelAnimationFrame(frame); sound.stopAll(); updatePlayback();
  }
  function tick(): void {
    if (disposed || !sessionId) return;
    const position = sound.position(sessionId);
    if (cursor && position !== undefined) {
      cursor.style.left = `${position * playbackTempo / 60 * beatPixels}px`;
    }
    frame = requestAnimationFrame(tick);
  }
  async function play(): Promise<void> {
    if (preparing) { stopPlayback(); report('试听准备已取消。'); return; }
    if (sessionId) { stopPlayback(); report('演奏已停止。'); return; }
    noteAudition.cancel();
    const generation = ++playbackGeneration;
    preparing = true; updatePlayback();
    const snapshot = JSON.stringify(phrase.read().draft);
    try {
      report('正在准备乐句使用的声音…'); await phrase.preparePreview();
      if (disposed || generation !== playbackGeneration) return;
      if (JSON.stringify(phrase.read().draft) !== snapshot) throw new Error('乐句已改变，请重新试听当前内容。');
      playbackTempo = phrase.read().body?.tempoBpm ?? 120;
      const session = await sound.preview(phrase.previewPlan(liveBody));
      if (disposed || generation !== playbackGeneration) { sound.stop(session.id); return; }
      sessionId = session.status === 'playing' ? session.id : undefined;
      if (sessionId) livePreview.flush(() => phrase.previewPlan(liveBody, { allowSilence: true }));
    } catch (error) { if (!disposed && generation === playbackGeneration) report(error instanceof Error ? error.message : String(error), true); }
    finally {
      if (!disposed && generation === playbackGeneration) { preparing = false; updatePlayback(); cancelAnimationFrame(frame); tick(); }
    }
  }
  function save(mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): void {
    try {
      const result = phrase.save(mode, confirmation);
      if (result.status === 'saved') { options.onSaved?.(result.content.id); report(`“${result.content.name}”已保存。`); render(); }
      else if (result.status === 'needs-confirmation') confirmSave(result);
      else report(result.status === 'conflict' ? result.reason : result.message, true);
    } catch (error) { report(error instanceof Error ? error.message : String(error), true); render(); }
  }
  function saveCurrent(): void {
    try {
      const callback = options.referenceContext?.onSave ?? options.onSave;
      if (callback) {
        callback();
        const view = phrase.read();
        if (view.draft?.sourceId && !view.changed) options.onSaved?.(view.draft.sourceId);
      } else save(phrase.read().draft?.sourceId ? 'overwrite' : 'new');
    } catch (error) { report(error instanceof Error ? error.message : String(error), true); }
  }
  function editSound(partId: string, chooseLocations = false): void {
    if (!options.onEditSound) return;
    try { stopGesture?.(); stopPlayback(); options.onEditSound(partId, chooseLocations); }
    catch (error) { report(error instanceof Error ? error.message : String(error), true); }
  }
  function confirmSave(result: Extract<SaveResult, { status: 'needs-confirmation' }>): void {
    const dialog = node('dialog', 'save-dialog');
    dialog.append(node('h2', '', '这段乐句正在被使用'), node('p', '', '覆盖后，以下内容会采用修改后的乐句：'));
    const list = node('ul');
    result.affectedContent.forEach(item => list.append(node('li', '', item.name)));
    result.affectedDrafts.forEach(item => list.append(node('li', '', `${item.name} · 编辑稿`)));
    dialog.append(list);
    const buttons = node('div', 'dialog-actions');
    const close = () => { dialog.close(); dialog.remove(); };
    buttons.append(action('返回编辑', 'secondary', close), action('另存为新乐句', 'secondary', () => { close(); save('new'); }),
      action('确认覆盖', 'primary', () => { close(); save('overwrite', result.confirmation); }));
    dialog.append(buttons); dialog.addEventListener('cancel', () => dialog.remove()); root.append(dialog); dialog.showModal();
  }
  function openLibrary(): void {
    const view = phrase.read();
    const dialog = node('dialog', 'library-dialog');
    const header = node('div', 'library-heading'); header.append(node('h2', '', '我的乐句'), action('关闭', 'quiet', () => dialog.close())); dialog.append(header);
    if (!view.savedPhrases.length && !view.unfinishedDrafts.length) dialog.append(node('p', '', '写下第一段旋律，它会留在这里。'));
    for (const draft of view.unfinishedDrafts) dialog.append(action(`${draft.name} · 编辑稿 ↗`, 'library-sound', () => {
      dialog.close(); edit(() => { phrase.openDraft(draft.id); selectedPart = undefined; selectedNotes.clear(); });
    }));
    for (const content of view.savedPhrases) dialog.append(action(`${content.name} ↗`, 'library-sound', () => {
      dialog.close(); edit(() => { phrase.open(content.id); selectedPart = undefined; selectedNotes.clear(); });
    }));
    dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
  }
  function startPhrase(): void {
    if (options.onNewPhrase) {
      edit(() => { options.onNewPhrase!(); selectedPart = undefined; selectedNotes.clear(); scrollLeft = 0; pasteBeat = 0; }, '已新建乐句。');
      return;
    }
    const sounds = phrase.read().availableSounds;
    if (!sounds.length) { report('先制作并保存一个声音，再来写旋律。'); render(); return; }
    const dialog = node('dialog', 'library-dialog');
    dialog.append(node('h2', '', '选择音色'));
    for (const content of sounds) dialog.append(action(content.name + ' ↗', 'library-sound', () => {
      dialog.close(); edit(() => { phrase.create(content.id); selectedPart = undefined; selectedNotes.clear(); scrollLeft = 0; pasteBeat = 0; }, '已新建乐句。');
    }));
    dialog.append(action('返回', 'quiet', () => dialog.close())); dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
  }
  function rememberScroll(): void {
    const scroller = root.querySelector<HTMLElement>('.phrase-scroll');
    if (scroller) { scrollLeft = scroller.scrollLeft; scrollTop = scroller.scrollTop; if (scroller.clientWidth) viewportWidth = scroller.clientWidth; }
  }
  function showHelp(hasOtherSounds: boolean): void {
    const dialog = node('dialog', 'phrase-help-dialog');
    dialog.append(node('h2', '', '音符操作'),
      node('p', '', '点击空白添加；单击音符选中，拖动移动，拖右端调整长短。右键或双击删除。'),
      node('p', '', '拖空白框选。方向键微移，Shift＋上下移八度。按住 Ctrl：A 全选，C 复制，V 粘贴，D 重复，Z 撤销。空格试听。'),
      node('p', '', 'Ctrl＋点击空白设置粘贴位置。'));
    if (hasOtherSounds) dialog.append(node('p', '', '淡色音符属于其他音色，仍会播放；点一下切换编辑。'));
    dialog.append(action('关闭', 'primary', () => dialog.close()));
    dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
  }
  function render(): void {
    if (disposed) return;
    const pageScrollTop = document.scrollingElement?.scrollTop ?? 0;
    rememberScroll();
    layoutObserver?.disconnect();
    if (nextScrollLeft !== undefined) { scrollLeft = nextScrollLeft; nextScrollLeft = undefined; }
    stopGesture?.(); stopGesture = undefined;
    const view = phrase.read();
    renderedParts = view.body?.parts ?? [];
    const sameDraft = !!view.draft && view.draft.id === selectedDraft;
    let incomingFrequencies: number[] | undefined;
    if (!sameDraft) {
      selectedDraft = view.draft?.id; selectedNotes.clear(); pasteBeat = 0;
      const focused = view.body?.parts.find(part => part.id === selectedPart) ?? view.body?.parts[0];
      const notes = focused?.notes.length ? focused.notes : view.body?.parts.flatMap(part => part.notes) ?? [];
      incomingFrequencies = notes.map(note => note.frequencyHz);
      const viewport = initialPhraseViewport(incomingFrequencies, phrase.keyboard().slice().reverse());
      scrollLeft = 0; scrollTop = viewport.scrollTop;
    }
    const existingIds = new Set(view.body?.parts.flatMap(part => part.notes.map(note => note.id)) ?? []);
    selectedNotes = new Set([...selectedNotes].filter(id => existingIds.has(id)));
    root.replaceChildren();
    const page = node('div', 'studio phrase-studio');
    const toolbar = node('header', 'studio-toolbar');
    toolbar.append(action('RootSound', 'wordmark brand-button', options.onWelcome));
    const modules = node('nav', 'workspace-tabs'); modules.setAttribute('aria-label', '切换创作工作区');
    if (options.onSampling) modules.append(action('采样获取', 'workspace-tab', options.onSampling));
    modules.append(action('音色制作', 'workspace-tab', options.onSound), action('乐句谱写', 'workspace-tab is-active', () => {}));
    if (options.onSong) modules.append(action('歌曲编排', 'workspace-tab', options.onSong));
    toolbar.append(modules);
    const tools = node('nav', 'toolbar-tools');
    if (!options.referenceContext) tools.append(action('新建乐句', 'quiet', startPhrase), action('我的乐句', 'quiet', openLibrary));
    if (options.onLibrary) tools.append(action('素材', 'quiet', options.onLibrary));
    if (options.onExport) tools.append(action('导出音频', 'quiet', () => { stopPlayback(); options.onExport!(); }));
    if (options.onSettings) tools.append(action('设置', 'quiet', options.onSettings));
    if (view.body && view.draft) tools.append(action('保存', 'primary', saveCurrent));
    toolbar.append(tools); page.append(toolbar);
    const main = node('main', 'phrase-workspace');
    main.addEventListener('dragover', event => {
      if (!event.dataTransfer?.types.includes('application/x-rootsound-entity')) return;
      // Browsers protect the payload during dragover; inspect the actual kind,
      // identity and current project membership only when the drop opens it.
      event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; main.classList.add('is-entity-drop');
    });
    main.addEventListener('dragleave', event => {
      if (!(event.relatedTarget instanceof Node) || !main.contains(event.relatedTarget)) main.classList.remove('is-entity-drop');
    });
    main.addEventListener('drop', event => {
      main.classList.remove('is-entity-drop');
      if (!event.dataTransfer) return;
      const incoming = readEntityDrag(event.dataTransfer);
      if (!incoming || incoming.kind !== 'rootsound.timbre') return;
      event.preventDefault(); event.stopPropagation();
      const current = phrase.read();
      if (!current.availableSounds.some(item => item.id === incoming.id)) { report('这个音色不属于当前可用素材。', true); return; }
      if (current.body && current.body.parts.length >= 8) { report('一段乐句最多使用 8 个音色。', true); return; }
      edit(() => {
        if (current.body && current.draft) selectedPart = phrase.addPart(incoming.id);
        else { if (options.onNewPhrase) options.onNewPhrase(incoming.id); else phrase.create(incoming.id); selectedPart = undefined; scrollLeft = 0; pasteBeat = 0; }
        selectedNotes.clear();
      }, '已加入音色。');
    });
    if (options.referenceContext) main.append(createReferenceNavigation(options.referenceContext));
    if (!view.body || !view.draft) {
      const empty = node('section', 'phrase-empty');
      empty.append(node('h1', '', view.problem ? '暂时无法打开乐句' : '新建乐句'));
      if (view.problem) empty.append(node('p', 'muted', view.problem + ' 原稿已保留。'));
      empty.append(action(view.availableSounds.length ? '选择音色' : '制作音色', 'primary', view.availableSounds.length ? startPhrase : options.onSound));
      main.append(empty);
    } else {
      const body = view.body;
      let part = body.parts.find(item => item.id === selectedPart) ?? body.parts[0];
      selectedPart = part?.id;
      const heading = node('div', 'phrase-heading');
      const title = node('div', 'phrase-title');
      const name = node('input', 'sound-name'); name.value = view.draft.name; name.maxLength = 100; name.setAttribute('aria-label', '乐句名称');
      const saveState = node('p', 'save-state', view.changed ? '编辑稿已保留' : '已保存');
      name.addEventListener('change', () => {
        try {
          phrase.rename(name.value); const current = phrase.read();
          name.value = current.draft!.name; saveState.textContent = current.changed ? '编辑稿已保留' : '已保存';
          const undo = root.querySelector<HTMLButtonElement>('.phrase-undo'); if (undo) undo.disabled = !current.canUndo;
          const redo = root.querySelector<HTMLButtonElement>('.phrase-redo'); if (redo) redo.disabled = !current.canRedo;
          report('修改已保留为编辑稿。');
        } catch (error) { name.value = phrase.read().draft!.name; report(error instanceof Error ? error.message : String(error), true); }
      });
      title.append(name, saveState);
      const transport = node('div', 'phrase-transport'); playButton = action('', 'preview-button', () => { void play(); }); transport.append(playButton);
      if (view.draft.sourceId && !options.referenceContext) transport.append(action('另存', 'quiet', () => save('new')));
      const applyElsewhere = options.referenceContext?.onApplyElsewhere ?? options.onApplyElsewhere;
      if (applyElsewhere) transport.append(action('应用到其他位置…', 'quiet', applyElsewhere));
      heading.append(title, transport); main.append(heading);

      const controls = node('div', 'phrase-controls');
      const tempoLabel = node('label', 'phrase-tempo');
      const tempoText = node('span', '', `速度 ${body.tempoBpm}`); const tempo = node('input'); tempo.type = 'range'; tempo.min = '40'; tempo.max = '240'; tempo.step = '1'; tempo.value = String(body.tempoBpm); tempo.setAttribute('aria-label', '乐句速度');
      tempo.addEventListener('input', () => {
        tempoText.textContent = `速度 ${tempo.value}`;
        liveBody = { ...phrase.read().body!, tempoBpm: Number(tempo.value) }; playbackTempo = liveBody.tempoBpm;
        livePreview.request(() => phrase.previewPlan(liveBody, { allowSilence: true }));
      });
      tempo.addEventListener('pointercancel', () => {
        liveBody = undefined; const restored = phrase.read().body!; tempo.value = String(restored.tempoBpm);
        tempoText.textContent = `速度 ${tempo.value}`; playbackTempo = restored.tempoBpm;
        livePreview.flush(() => phrase.previewPlan(undefined, { allowSilence: true }));
      });
      tempo.addEventListener('change', () => edit(() => phrase.setTempo(Number(tempo.value)))); tempoLabel.append(tempoText, tempo); controls.append(tempoLabel);
      function select(label: string, values: Array<[string, string]>, value: string, change: (value: string) => void): HTMLSelectElement {
        const field = node('label', 'phrase-field', label); const input = node('select'); input.setAttribute('aria-label', label);
        for (const [id, text] of values) { const option = node('option', '', text); option.value = id; input.append(option); }
        if (!values.some(([id]) => id === value)) { const option = node('option', '', label === '长度' ? `${value} 拍` : value); option.value = value; input.append(option); }
        input.value = value; input.addEventListener('change', () => change(input.value)); field.append(input); controls.append(field); return input;
      }
      select('长度', [4, 8, 16, 32, 64].map(n => [String(n), `${n} 拍`]), String(body.lengthBeats), value => edit(() => phrase.setLength(Number(value))));
      select('落点', [['1', '每拍'], ['0.5', '半拍'], ['0.25', '四分之一拍'], ['0', '自由']], String(snap), value => { snap = Number(value); });
      select('缩放', [['0.5', '50%'], ['0.75', '75%'], ['1', '100%'], ['1.5', '150%'], ['2', '200%'], ['3', '300%']], String(zoom), value => { rememberScroll(); nextScrollLeft = scrollLeft * Number(value) / zoom; zoom = Number(value); render(); });
      const undo = action('↶ 撤销', 'quiet phrase-undo', () => edit(() => phrase.undo())); undo.disabled = !view.canUndo;
      const redo = action('↷ 重做', 'quiet phrase-redo', () => edit(() => phrase.redo())); redo.disabled = !view.canRedo;
      const help = action('?', 'quiet phrase-help-button', () => showHelp(body.parts.length > 1)); help.title = '操作帮助'; help.setAttribute('aria-label', '音符操作帮助');
      controls.append(undo, redo, help); main.append(controls);

      const voices = node('div', 'phrase-voices');
      const tabs = node('div', 'phrase-part-tabs'); tabs.setAttribute('aria-label', '这段乐句使用的声音');
      body.parts.forEach((item, index) => {
        const soundName = view.availableSounds.find(sound => sound.id === item.timbreId)?.name ?? item.name;
        const tab = action(`${index + 1}  ${soundName}`, 'phrase-part' + (item.id === selectedPart ? ' is-active' : ''), () => { selectedPart = item.id; selectedNotes.clear(); render(); });
        if (options.onEditSound) {
          tab.title = '选中这条声音；右键可以调整这一处声音。';
          tab.addEventListener('contextmenu', event => {
            event.preventDefault();
            showReferenceActions(root, { label: soundName, onEdit: () => editSound(item.id), onChoose: () => editSound(item.id, true) });
          });
        }
        tab.setAttribute('aria-pressed', String(item.id === selectedPart)); tabs.append(tab);
      }); voices.append(tabs);
      if (part) {
        const picker = node('select', 'phrase-sound-picker'); picker.setAttribute('aria-label', '当前旋律使用的声音');
        for (const item of view.availableSounds) { const option = node('option', '', item.name); option.value = item.id; picker.append(option); }
        picker.value = part.timbreId; picker.addEventListener('change', () => edit(() => phrase.setPartTimbre(part!.id, picker.value))); voices.append(picker);
        if (options.onEditSound) voices.append(action('调整音色', 'quiet phrase-edit-sound', () => editSound(part!.id)));
        const add = action('＋ 音色', 'quiet', () => edit(() => { selectedPart = phrase.addPart(picker.value); selectedNotes.clear(); })); add.disabled = body.parts.length >= 8; voices.append(add);
        const removePart = action('移除', 'quiet', () => {
          const remove = () => edit(() => { phrase.removePart(part!.id); selectedPart = undefined; selectedNotes.clear(); });
          if (!part!.notes.length) { remove(); return; }
          const dialog = node('dialog');
          dialog.append(node('h2', '', '移除这条声音？'), node('p', '', `这条声音中的 ${part!.notes.length} 个音符也会移除，可以通过撤销找回。`));
          const buttons = node('div', 'dialog-actions');
          buttons.append(action('返回', 'secondary', () => dialog.close()), action('移除', 'primary', () => { dialog.close(); remove(); }));
          dialog.append(buttons); dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
        });
        removePart.disabled = body.parts.length <= 1; voices.append(removePart);
      }
      main.append(voices);
      const keys = phrase.keyboard().slice().reverse();
      const rowHeight = 25;
      const availableWidth = Math.max(260, (viewportWidth || root.clientWidth - 24) - 60);
      beatPixels = (body.lengthBeats <= 8 ? Math.max(64, availableWidth / body.lengthBeats) : 72) * zoom;
      const scroller = node('div', 'phrase-scroll');
      scroller.setAttribute('role', 'region'); scroller.setAttribute('aria-label', '连续钢琴卷帘；上下滚动查看全部音高');
      const roll = node('div', 'phrase-roll'); roll.style.width = `${58 + body.lengthBeats * beatPixels}px`;
      const ruler = node('div', 'phrase-ruler'); ruler.style.paddingLeft = '58px';
      for (let beat = 0; beat < body.lengthBeats; beat++) {
        const mark = node('span', beat % 4 === 0 ? 'is-strong' : '', String(beat + 1)); mark.style.width = `${beatPixels}px`; ruler.append(mark);
      }
      roll.append(ruler);
      const lanes = node('div', 'phrase-lanes'); lanes.style.height = `${keys.length * rowHeight}px`;
      const keyboard = node('div', 'phrase-keyboard');
      for (const key of keys) {
        const label = action(key.label, 'phrase-key' + (key.accidental ? ' is-accidental' : ''), () => { void noteAudition.request(key.frequencyHz); });
        label.style.height = `${rowHeight}px`; label.title = `用当前声音试听 ${key.label}`;
        label.setAttribute('aria-label', `试听 ${key.label}，${Number(key.frequencyHz.toFixed(3))} Hz，当前声音`); keyboard.append(label);
      }
      const grid = node('div', 'phrase-grid'); grid.style.width = `${body.lengthBeats * beatPixels}px`; grid.style.height = `${keys.length * rowHeight}px`;
      grid.style.setProperty('--beat-width', `${beatPixels}px`); grid.style.setProperty('--row-height', `${rowHeight}px`);
      keys.forEach((key, index) => { if (key.accidental) { const band = node('div', 'phrase-dark-lane'); band.style.top = `${index * rowHeight}px`; band.style.height = `${rowHeight}px`; grid.append(band); } });
      cursor = node('div', 'phrase-playhead'); cursor.hidden = !sessionId; grid.append(cursor);
      function rowFor(frequency: number): number {
        return phrasePitchRow(frequency, keys);
      }
      function position(event: PointerEvent): { beat: number; row: number } {
        const rect = grid.getBoundingClientRect();
        return { beat: (event.clientX - rect.left) / beatPixels, row: Math.floor((event.clientY - rect.top) / rowHeight) };
      }
      function quantize(value: number): number { return snap ? Math.round(value / snap) * snap : value; }
      function place(note: HTMLElement, value: PhraseNote): void {
        note.style.left = `${value.startBeat * beatPixels + 2}px`; note.style.width = `${Math.max(20, value.durationBeats * beatPixels - 4)}px`; note.style.top = `${rowFor(value.frequencyHz) * rowHeight}px`;
        note.style.setProperty('--note-velocity', String(value.velocity));
      }
      function startDrag(event: PointerEvent, owner: PhrasePart, original: PhraseNote, block: HTMLButtonElement): void {
        if (event.button !== 0) return;
        event.preventDefault(); event.stopPropagation();
        // preventDefault suppresses the browser's usual focus transfer. Leave
        // any name/range field before a selection or drag takes over the keys.
        block.focus({ preventScroll: true });
        if (!block.isConnected) return; // Committing a field may have rebuilt this view.
        selectedPart = owner.id;
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (selectedNotes.has(original.id)) selectedNotes.delete(original.id); else selectedNotes.add(original.id);
          syncSelection(); block.focus({ preventScroll: true }); return;
        }
        if (!selectedNotes.has(original.id)) selectedNotes = new Set([original.id]);
        syncSelection();
        const originals = owner.notes.filter(note => selectedNotes.has(note.id));
        const blocks = new Map([...grid.querySelectorAll<HTMLButtonElement>('.phrase-note:not(.is-ghost)')].map(item => [item.dataset.noteId!, item]));
        const origin = position(event);
        const resize = (event.target as Element).classList.contains('phrase-resize-handle');
        const minStart = Math.min(...originals.map(note => note.startBeat));
        const maxEnd = Math.max(...originals.map(note => note.startBeat + note.durationBeats));
        const dragThreshold = 5;
        let moved = false; let candidates = originals.map(note => ({ ...note }));
        block.setPointerCapture(event.pointerId);
        const move = (input: PointerEvent) => {
          const dx = input.clientX - event.clientX; const dy = input.clientY - event.clientY;
          if (Math.abs(dx) > dragThreshold || (!resize && Math.abs(dy) > dragThreshold)) moved = true;
          if (!moved) return;
          const target = position(input);
          if (resize) {
            // Resize the explicit handle only; selection is retained for later group edits.
            const length = Math.max(1 / 1024, Math.min(body.lengthBeats - original.startBeat, original.durationBeats + target.beat - origin.beat));
            candidates = [{ ...original, durationBeats: Math.min(body.lengthBeats - original.startBeat, Math.max(1 / 1024, quantize(length))) }];
            place(block, { ...original, durationBeats: length });
          } else {
            const rawDelta = Math.max(-minStart, Math.min(body.lengthBeats - maxEnd, Math.abs(dx) <= dragThreshold ? 0 : target.beat - origin.beat));
            const landedDelta = Math.abs(dx) <= dragThreshold ? 0 : Math.max(-minStart, Math.min(body.lengthBeats - maxEnd, quantize(original.startBeat + rawDelta) - original.startBeat));
            const rowDelta = Math.abs(dy) <= dragThreshold ? 0 : target.row - origin.row;
            const minRowDelta = Math.ceil(12 * Math.log2(Math.max(...originals.map(note => note.frequencyHz)) / 5000));
            const maxRowDelta = Math.floor(12 * Math.log2(Math.min(...originals.map(note => note.frequencyHz)) / 20));
            const limitedRowDelta = Math.max(minRowDelta, Math.min(maxRowDelta, rowDelta));
            candidates = originals.map(note => ({ ...note, startBeat: note.startBeat + landedDelta,
              frequencyHz: limitedRowDelta ? note.frequencyHz * 2 ** (-limitedRowDelta / 12) : note.frequencyHz }));
            originals.forEach(note => {
              const element = blocks.get(note.id); if (!element) return;
              place(element, { ...note, startBeat: note.startBeat + rawDelta });
              element.style.top = `${Math.max(0, Math.min((keys.length - 1) * rowHeight, rowFor(note.frequencyHz) * rowHeight + dy))}px`;
            });
          }
          const byId = new Map(candidates.map(note => [note.id, note]));
          liveBody = { ...body, parts: body.parts.map(part => part.id !== owner.id ? part :
            { ...part, notes: part.notes.map(note => byId.get(note.id) ?? note) }) };
          livePreview.request(() => phrase.previewPlan(liveBody, { allowSilence: true }));
        };
        const cleanup = () => {
          block.removeEventListener('pointermove', move); block.removeEventListener('pointerup', up); block.removeEventListener('pointercancel', cancel); block.removeEventListener('lostpointercapture', cancel);
          if (block.hasPointerCapture(event.pointerId)) block.releasePointerCapture(event.pointerId); stopGesture = undefined;
        };
        const up = () => {
          cleanup();
          const changed = candidates.some(candidate => {
            const before = originals.find(note => note.id === candidate.id)!;
            return candidate.startBeat !== before.startBeat || candidate.durationBeats !== before.durationBeats || candidate.frequencyHz !== before.frequencyHz;
          });
          if (moved && changed) edit(() => phrase.updateNotes(candidates.map(({ id, ...changes }) => ({ partId: owner.id, noteId: id, changes }))));
          else {
            liveBody = undefined;
            if (moved) livePreview.flush(() => phrase.previewPlan(undefined, { allowSilence: true }));
            originals.forEach(note => { const element = blocks.get(note.id); if (element) place(element, note); });
            block.focus({ preventScroll: true });
          }
        };
        const cancel = () => {
          cleanup(); liveBody = undefined; livePreview.flush(() => phrase.previewPlan(undefined, { allowSilence: true }));
          originals.forEach(note => { const element = blocks.get(note.id); if (element) place(element, note); });
        };
        stopGesture?.(); stopGesture = cancel;
        block.addEventListener('pointermove', move); block.addEventListener('pointerup', up); block.addEventListener('pointercancel', cancel); block.addEventListener('lostpointercapture', cancel);
      }
      for (const owner of body.parts) for (const note of owner.notes) {
        const otherSound = owner.id !== selectedPart;
        const soundName = view.availableSounds.find(sound => sound.id === owner.timbreId)?.name ?? owner.name;
        const activateSound = () => {
          if (selectedPart === owner.id) return;
          selectedPart = owner.id; selectedNotes = new Set([note.id]); render();
          [...root.querySelectorAll<HTMLButtonElement>('.phrase-note')].find(block => block.dataset.noteId === note.id)?.focus({ preventScroll: true });
          report(`已切换到“${soundName}”。可以拖动调整，右键或双击删除。`);
        };
        const block = action('', 'phrase-note' + (otherSound ? ' is-ghost' : '') + (selectedNotes.has(note.id) ? ' is-selected' : ''), activateSound);
        block.dataset.noteId = note.id;
        const row = rowFor(note.frequencyHz);
        const label = (Math.abs(Math.log(note.frequencyHz / keys[row]!.frequencyHz)) < 1e-8 ? '' : '≈') + keys[row]!.label;
        block.append(node('span', 'phrase-note-label', label), node('span', 'phrase-resize-handle'));
        const description = `${soundName}，${label}（${Number(note.frequencyHz.toFixed(3))} Hz），第 ${Number((note.startBeat + 1).toFixed(3))} 拍，持续 ${Number(note.durationBeats.toFixed(3))} 拍`;
        block.setAttribute('aria-label', (otherSound ? '其他声音：' : '') + description);
        block.title = description + (otherSound ? '；来自其他声音，单击切换，右键删除。' : '；单击选中，拖动移动，右键或双击删除。'); place(block, note);
        const removeThisNote = () => {
          stopGesture?.();
          block.focus({ preventScroll: true });
          if (selectedPart !== owner.id) selectedNotes.clear();
          selectedPart = owner.id;
          edit(() => { phrase.removeNote(owner.id, note.id); selectedNotes.delete(note.id); }, '已删除音符，可按 Ctrl+Z 撤销。');
        };
        block.addEventListener('contextmenu', event => { event.preventDefault(); event.stopPropagation(); removeThisNote(); });
        if (!otherSound) {
          block.addEventListener('pointerdown', event => startDrag(event, owner, note, block));
          block.addEventListener('dblclick', event => { if (event.button === 0 && !(event.ctrlKey || event.metaKey || event.shiftKey)) { event.preventDefault(); event.stopPropagation(); removeThisNote(); } });
        } else block.addEventListener('pointerdown', event => {
          if (event.button !== 0) return;
          event.preventDefault(); event.stopPropagation();
          block.focus({ preventScroll: true });
          if (block.isConnected) activateSound();
        });
        grid.append(block);
      }
      grid.addEventListener('pointerdown', event => {
        if (event.button !== 0 || (event.target as Element).closest('.phrase-note') || !part) return;
        event.preventDefault(); grid.focus({ preventScroll: true });
        const point = position(event); const key = keys[Math.max(0, Math.min(keys.length - 1, point.row))]!;
        const start = Math.max(0, Math.min(Math.max(0, body.lengthBeats - Math.min(snap || 0.25, body.lengthBeats)), snap ? Math.floor(point.beat / snap) * snap : point.beat));
        const before = new Set(selectedNotes); const additive = event.ctrlKey || event.metaKey || event.shiftKey;
        const box = node('div', 'phrase-marquee'); grid.append(box); grid.setPointerCapture(event.pointerId);
        const rect = grid.getBoundingClientRect(); const startX = event.clientX - rect.left; const startY = event.clientY - rect.top;
        let moved = false;
        const move = (input: PointerEvent) => {
          const x = input.clientX - rect.left; const y = input.clientY - rect.top;
          if (Math.abs(x - startX) > 3 || Math.abs(y - startY) > 3) moved = true;
          if (!moved) return;
          const left = Math.min(startX, x); const right = Math.max(startX, x); const top = Math.min(startY, y); const bottom = Math.max(startY, y);
          Object.assign(box.style, { left: `${left}px`, top: `${top}px`, width: `${right - left}px`, height: `${bottom - top}px` });
          selectedNotes = new Set(additive ? before : []);
          for (const note of part!.notes) {
            const noteTop = rowFor(note.frequencyHz) * rowHeight;
            if (note.startBeat * beatPixels < right && (note.startBeat + note.durationBeats) * beatPixels > left && noteTop < bottom && noteTop + rowHeight > top) selectedNotes.add(note.id);
          }
          syncSelection();
        };
        const cleanup = () => {
          grid.removeEventListener('pointermove', move); grid.removeEventListener('pointerup', up); grid.removeEventListener('pointercancel', cancel); grid.removeEventListener('lostpointercapture', cancel);
          if (grid.hasPointerCapture(event.pointerId)) grid.releasePointerCapture(event.pointerId); box.remove(); stopGesture = undefined;
        };
        const up = () => {
          cleanup(); pasteBeat = start;
          if (moved) { syncSelection(); report(selectedNotes.size ? `已选 ${selectedNotes.size} 个音符，可一起移动、复制或删除。` : '框内没有音符。'); return; }
          if (additive) { selectedNotes.clear(); syncSelection(); report(`粘贴位置：第 ${Number((start + 1).toFixed(3))} 拍。`); return; }
          const input = { startBeat: start, durationBeats: Math.min(snap || 0.5, body.lengthBeats - start), frequencyHz: key.frequencyHz, velocity: 0.75 };
          if (edit(() => { selectedNotes = new Set([phrase.addNote(part!.id, input)]); })) {
            void noteAudition.request(input.frequencyHz, input.durationBeats * 60 / body.tempoBpm, input.velocity);
          }
        };
        const cancel = () => { cleanup(); selectedNotes = before; syncSelection(); };
        stopGesture?.(); stopGesture = cancel;
        grid.addEventListener('pointermove', move); grid.addEventListener('pointerup', up); grid.addEventListener('pointercancel', cancel); grid.addEventListener('lostpointercapture', cancel);
      });
      grid.tabIndex = 0; grid.setAttribute('aria-label', '音符编辑区；点击空白添加，点击音符选中，右键或双击删除，拖空白框选，方向键移动选中音符');
      lanes.append(keyboard, grid); roll.append(lanes); scroller.append(roll); main.append(scroller);
      scroller.scrollLeft = scrollLeft; scroller.scrollTop = scrollTop;
      // Assign again after attaching: browser scroll dimensions are then available.
      queueMicrotask(() => {
        if (!scroller.isConnected) return;
        if (incomingFrequencies !== undefined) scrollTop = initialPhraseViewport(incomingFrequencies, keys, scroller.clientHeight).scrollTop;
        scroller.scrollLeft = scrollLeft; scroller.scrollTop = scrollTop;
      });
      const editing = node('div', 'phrase-selection-tools');
      editing.append(node('span', 'phrase-selection-count'));
      const copy = action('复制', 'quiet', copyNotes); copy.dataset.needsSelection = '';
      const paste = action('粘贴', 'quiet phrase-paste', () => pasteNotes()); paste.disabled = !noteClipboard.length;
      const duplicate = action('重复', 'quiet', () => pasteNotes(true)); duplicate.dataset.needsSelection = '';
      const remove = action('删除', 'quiet delete-selected-note', deleteNotes); remove.dataset.needsSelection = '';
      const velocityLabel = node('label', 'phrase-velocity-label', '力度');
      const velocity = node('input', 'phrase-velocity'); velocity.type = 'range'; velocity.min = '0'; velocity.max = '100'; velocity.step = '1'; velocity.setAttribute('aria-label', '选中音符力度');
      const amount = node('span', 'phrase-velocity-value');
      velocity.addEventListener('input', () => {
        amount.textContent = `${velocity.value}%`; const state = selected(); if (!state?.notes.length) return;
        liveBody = { ...body, parts: body.parts.map(part => part.id !== state.part.id ? part : { ...part,
          notes: part.notes.map(note => selectedNotes.has(note.id) ? { ...note, velocity: Number(velocity.value) / 100 } : note) }) };
        livePreview.request(() => phrase.previewPlan(liveBody, { allowSilence: true }));
      });
      velocity.addEventListener('pointercancel', () => { liveBody = undefined; syncSelection(); livePreview.flush(() => phrase.previewPlan(undefined, { allowSilence: true })); });
      velocity.addEventListener('change', () => { const state = selected(); if (state?.notes.length) edit(() => phrase.updateNotes(state.notes.map(note => ({ partId: state.part.id, noteId: note.id, changes: { velocity: Number(velocity.value) / 100 } })))); });
      velocityLabel.append(velocity, amount); editing.append(copy, paste, duplicate, remove, node('span', 'phrase-paste-position'), velocityLabel); main.append(editing);
    }
    noteAudition.sync();
    notice = node('p', 'studio-notice' + (isError ? ' is-error' : ''), status); notice.setAttribute('role', 'status'); main.append(notice); page.append(main);
    if (options.renderEntities) { page.classList.add('has-entity-rail'); page.append(options.renderEntities()); }
    root.append(page); updatePlayback(); syncSelection();
    const scroller = root.querySelector<HTMLElement>('.phrase-scroll');
    if (scroller) {
      layoutObserver ??= new ResizeObserver(entries => {
        const width = Math.round(entries[0]?.contentRect.width ?? 0);
        if (disposed || !width || Math.abs(width - viewportWidth) < 2) return;
        viewportWidth = width; resize();
      });
      layoutObserver.observe(scroller);
    }
    const restorePageScroll = () => {
      // Replacing the page temporarily collapses its height. Restore only after
      // the new page is attached, and never carry another draft's view position.
      if (!disposed && page.isConnected && document.scrollingElement) document.scrollingElement.scrollTop = sameDraft ? pageScrollTop : 0;
    };
    restorePageScroll(); queueMicrotask(restorePageScroll);
  }
  const unsubscribe = sound.subscribe(event => {
    if (disposed) return;
    if (event.type === 'session') {
      if (event.session.status === 'playing') { sessionId = event.session.id; report('正在演奏…'); cancelAnimationFrame(frame); tick(); }
      else if (event.session.id === sessionId) {
        sessionId = undefined; cancelAnimationFrame(frame); report(event.session.status === 'failed' ? event.session.error ?? '演奏未能完成。' : '播放结束。', event.session.status === 'failed');
      }
      updatePlayback();
    } else if (event.status === 'failed' || event.status === 'suspended') report(event.error ?? '声音设备暂不可用。', true);
  });
  const keydown = (event: KeyboardEvent) => {
    if (root.querySelector('dialog[open]')) return;
    const command = event.ctrlKey || event.metaKey;
    const saveShortcut = event.code === 'KeyS' || (!/^Key[A-Z]$/u.test(event.code) && event.key.toLowerCase() === 's');
    if (command && saveShortcut) {
      event.preventDefault();
      // Commit the focused name/number field before saving its surrounding work.
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      saveCurrent(); return;
    }
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement || (event.target instanceof HTMLElement && event.target.isContentEditable)) return;
    if (event.key === 'Escape') { stopGesture?.(); selectedNotes.clear(); syncSelection(); return; }
    if (stopGesture) return;
    if ((event.code === 'Space' || event.key === ' ') && (!(event.target instanceof HTMLButtonElement) || event.target.classList.contains('phrase-note'))) { event.preventDefault(); void play(); }
    if (command) {
      // Virtual/accessibility keyboards may provide a key without a physical code.
      const shortcut = (letter: string) => /^Key[A-Z]$/u.test(event.code)
        ? event.code === `Key${letter.toUpperCase()}` : event.key.toLowerCase() === letter;
      if (shortcut('z')) { event.preventDefault(); edit(() => event.shiftKey ? phrase.redo() : phrase.undo()); }
      if (shortcut('y')) { event.preventDefault(); edit(() => phrase.redo()); }
      if (shortcut('a')) { event.preventDefault(); selectedNotes = new Set(selected()?.part.notes.map(note => note.id) ?? []); syncSelection(); }
      if (shortcut('c')) { event.preventDefault(); copyNotes(); }
      if (shortcut('v')) { event.preventDefault(); pasteNotes(); }
      if (shortcut('d')) { event.preventDefault(); pasteNotes(true); }
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); deleteNotes(); return; }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    const state = selected(); const body = phrase.read().body;
    if (!state?.notes.length || !body) return;
    event.preventDefault();
    const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
    const step = (snap || 0.125) * (event.shiftKey ? 4 : 1) * (event.key === 'ArrowLeft' ? -1 : 1);
    const first = Math.min(...state.notes.map(note => note.startBeat));
    const last = Math.max(...state.notes.map(note => note.startBeat + note.durationBeats));
    const delta = Math.max(-first, Math.min(body.lengthBeats - last, step));
    const semitones = (event.shiftKey ? 12 : 1) * (event.key === 'ArrowDown' ? -1 : 1);
    edit(() => phrase.updateNotes(state.notes.map(note => ({ partId: state.part.id, noteId: note.id,
      changes: horizontal ? { startBeat: note.startBeat + delta } : { frequencyHz: note.frequencyHz * 2 ** (semitones / 12) } }))));
  };
  const resize = () => {
    cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(() => { if (!disposed && !stopGesture) render(); });
  };
  document.addEventListener('keydown', keydown); window.addEventListener('resize', resize); render();
  return {
    refresh(context, onApplyElsewhere) {
      if (disposed) return;
      options.referenceContext = context; options.onApplyElsewhere = onApplyElsewhere; render();
    },
    dispose() { disposed = true; layoutObserver?.disconnect(); stopPlayback(); stopGesture?.(); unsubscribe(); cancelAnimationFrame(frame); cancelAnimationFrame(layoutFrame); document.removeEventListener('keydown', keydown); window.removeEventListener('resize', resize); },
  };
}
