import { MAX_RECORDING_SECONDS, type SamplingPort, type SamplingView } from '../../contracts/sampling.ts';
import { MAX_MELODY_INPUT_SECONDS, type MelodyRecognitionPort, type MelodyRecognitionView } from '../../contracts/melody-recognition.ts';
import type { ContentRecord, Draft } from '../../contracts/content.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import './sampling.css';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const value = document.createElement(tag); value.className = className; value.textContent = text; return value;
}
function button(label: string, className: string, callback: () => void): HTMLButtonElement {
  const value = node('button', className, label); value.type = 'button'; value.addEventListener('click', callback); return value;
}
function seconds(value: number): string {
  const total = Math.max(0, Number.isFinite(value) ? value : 0);
  return `${Math.floor(total / 60)}:${String(Math.floor(total % 60)).padStart(2, '0')}`;
}
function message(error: unknown): string { return error instanceof Error ? error.message : String(error); }

/** Audio acquisition and storage belong to the port; this view only presents its state. */
export function mountSamplingWorkspace(root: HTMLElement, options: {
  sampling: SamplingPort;
  sound: SoundRuntimePort;
  recognition?: MelodyRecognitionPort;
  onWelcome(): void;
  onCoCreation?(): void;
  onSound(): void;
  onPhrase?(): void;
  onSong?(): void;
  onLibrary?(): void;
  onSettings?(): void;
  initialSampleId?: string;
  onEditRecognizedPhrase?(result: { content: ContentRecord; draft: Draft }): void;
  onCoCreateRecognizedPhrase?(result: { content: ContentRecord; draft: Draft }): void;
  onCreateSampleTimbre?(sampleId: string): Promise<void>;
}): { dispose(): void; refresh(): void; notify(message: string, error?: boolean): void } {
  const { sampling, sound } = options;
  let disposed = false;
  let view: SamplingView | undefined;
  let actionGeneration = 0;
  let pendingAction: 'import' | 'record' | 'stop' | 'open' | 'timbre' | undefined;
  let previewGeneration = 0;
  let preparing = false;
  let sessionId: string | undefined;
  let previewTarget: 'sample' | 'melody' | undefined;
  let recognitionView: MelodyRecognitionView | undefined;
  let recognitionGeneration = 0;
  let recognitionPending = false;
  let updatingRecognition = false;
  let adopting = false;
  let warningSignature = '';
  let lastProblem: string | undefined;
  let listSignature = '';
  let waveformSignature = '';
  let replacementDialog: HTMLDialogElement | undefined;
  const savedControls = new Map<string, { row: HTMLElement; button: HTMLButtonElement }>();

  const page = node('div', 'studio sampling-studio');
  const toolbar = node('header', 'studio-toolbar');
  toolbar.append(button('RootSound', 'wordmark brand-button', () => leave(options.onWelcome)));
  const tabs = node('nav', 'workspace-tabs'); tabs.setAttribute('aria-label', '切换创作工作区');
  tabs.append(button('采样获取', 'workspace-tab is-active', () => {}), button('音色制作', 'workspace-tab', () => leave(options.onSound)));
  if (options.onPhrase) tabs.append(button('乐句谱写', 'workspace-tab', () => leave(options.onPhrase!)));
  if (options.onSong) tabs.append(button('歌曲编排', 'workspace-tab', () => leave(options.onSong!)));
  toolbar.append(tabs);
  const tools = node('nav', 'toolbar-tools');
  if (options.onLibrary) tools.append(button('素材', 'quiet', () => leave(options.onLibrary!)));
  if (options.onSettings) tools.append(button('设置', 'quiet', () => leave(options.onSettings!)));
  toolbar.append(tools); page.append(toolbar);

  const main = node('main', 'sampling-workspace');
  const heading = node('header', 'sampling-heading');
  heading.append(node('h1', '', '采样'));
  main.append(heading);
  const acquire = node('section', 'sampling-acquire'); acquire.setAttribute('aria-label', '获取采样');
  const importButton = button('导入音频…', 'primary', () => {
    if (!available()) return;
    replace('import', () => sampling.importFile());
  });
  const recordButton = button('录一段', 'secondary', () => {
    if (!available()) return;
    replace('record', () => sampling.startRecording());
  });
  importButton.title = '不超过 16 MiB、120 秒的可解码音频'; recordButton.title = `最长 ${MAX_RECORDING_SECONDS} 秒`;
  acquire.append(importButton, recordButton);
  main.append(acquire);

  const recording = node('section', 'sampling-recording'); recording.setAttribute('aria-label', '采样获取状态'); recording.hidden = true;
  const recordingInfo = node('div', 'sampling-recording-info');
  const phaseText = node('p', 'sampling-phase');
  const timer = node('span', 'sampling-timer'); timer.setAttribute('aria-label', '录音时长');
  const level = node('div', 'sampling-level'); level.setAttribute('role', 'meter'); level.setAttribute('aria-label', '麦克风输入音量'); level.setAttribute('aria-valuemin', '0'); level.setAttribute('aria-valuemax', '100');
  const levelFill = node('span', 'sampling-level-fill'); level.append(levelFill);
  recordingInfo.append(phaseText, timer, level);
  const recordingActions = node('div', 'sampling-recording-actions');
  const stopRecord = button('完成录音', 'primary', () => {
    if (view?.phase !== 'recording' || disposed) return;
    void run('stop', () => sampling.stopRecording());
  });
  const cancelRecord = button('取消录音', 'quiet', cancelRecording);
  recordingActions.append(stopRecord, cancelRecord); recording.append(recordingInfo, recordingActions); main.append(recording);

  const audio = node('section', 'sampling-audio'); audio.setAttribute('aria-label', '当前采样'); audio.hidden = true;
  const audioHeader = node('div', 'sampling-audio-header');
  const nameField = node('label', 'sampling-name-field'); nameField.append(node('span', '', '采样名称'));
  const name = node('input', 'sampling-name'); name.type = 'text'; name.maxLength = 100; name.setAttribute('aria-label', '采样名称'); nameField.append(name);
  const saveState = node('p', 'sampling-save-state'); nameField.append(saveState);
  const listen = button('听听', 'preview-button sampling-listen', () => { void preview(); });
  audioHeader.append(nameField, listen); audio.append(audioHeader);
  const waveform = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  waveform.classList.add('sampling-waveform'); waveform.setAttribute('viewBox', '0 0 1000 160'); waveform.setAttribute('preserveAspectRatio', 'none');
  waveform.setAttribute('role', 'img'); waveform.setAttribute('aria-label', '当前采样的声音波形');
  const center = document.createElementNS('http://www.w3.org/2000/svg', 'path'); center.classList.add('sampling-waveform-center'); center.setAttribute('d', 'M0 80H1000');
  const envelope = document.createElementNS('http://www.w3.org/2000/svg', 'path'); envelope.classList.add('sampling-waveform-shape'); waveform.append(center, envelope); audio.append(waveform);
  const audioFooter = node('div', 'sampling-audio-footer');
  const metadata = node('p', 'sampling-metadata');
  const saveButton = button('保存采样', 'primary', save);
  const useAsSound = button('用这段声音制作音色', 'secondary', () => { void createTimbre(); }); useAsSound.hidden = !options.onCreateSampleTimbre;
  audioFooter.append(metadata, useAsSound, saveButton); audio.append(audioFooter); main.append(audio);

  const melody = node('section', 'sampling-melody'); melody.setAttribute('aria-label', '从哼唱整理旋律'); melody.hidden = true;
  const melodyHeading = node('div', 'sampling-melody-heading');
  const melodyDescription = node('div');
  melodyDescription.append(node('h2', '', '让哼出的想法继续生长'), node('p', 'sampling-melody-scope', `离线识别 · 不使用 AI · ${MAX_MELODY_INPUT_SECONDS} 秒以内的单人清唱或哼唱`));
  const recognize = button('把哼唱变成旋律', 'secondary', () => { void analyze(); });
  melodyHeading.append(melodyDescription, recognize); melody.append(melodyHeading);
  melody.append(node('p', 'sampling-melody-help', '先听结果，再决定留下来。带伴奏或多人演唱时可能识别不准；音高和长短都能继续修改。'));
  const melodyLimit = node('p', 'sampling-melody-limit', `这段声音超过 ${MAX_MELODY_INPUT_SECONDS} 秒。请换一段较短的完整哼唱；不会自动截取或省略后面的声音。`); melodyLimit.hidden = true; melody.append(melodyLimit);
  const analysisProgress = node('div', 'sampling-analysis-progress'); analysisProgress.hidden = true;
  const progressInfo = node('div', 'sampling-analysis-info');
  const progressLabel = node('p', 'sampling-analysis-label'); progressLabel.setAttribute('role', 'status');
  const progressBar = node('progress', 'sampling-analysis-bar'); progressBar.max = 1; progressBar.setAttribute('aria-label', '旋律识别进度');
  progressInfo.append(progressLabel, progressBar);
  const cancelAnalysis = button('取消识别', 'quiet', () => {
    try { stopPreview(); stopRecognition(); report('识别已取消，原采样仍然保留。'); }
    catch (error) { report(message(error), true); }
  }); analysisProgress.append(progressInfo, cancelAnalysis); melody.append(analysisProgress);
  const melodyProblem = node('p', 'sampling-melody-problem'); melodyProblem.setAttribute('role', 'status'); melodyProblem.hidden = true; melody.append(melodyProblem);
  const melodyResult = node('div', 'sampling-melody-result'); melodyResult.hidden = true;
  const melodySummary = node('p', 'sampling-melody-summary');
  const melodyTiming = node('p', 'sampling-melody-timing');
  const melodyWarnings = node('ul', 'sampling-melody-warnings'); melodyWarnings.hidden = true;
  const melodyActions = node('div', 'sampling-melody-actions');
  const listenMelody = button('听听识别结果', 'secondary', () => { void preview('melody'); });
  const editMelody = button('去细调', 'quiet', () => adopt(options.onEditRecognizedPhrase)); editMelody.hidden = !options.onEditRecognizedPhrase;
  const coCreateMelody = button('继续共创', 'primary', () => adopt(options.onCoCreateRecognizedPhrase)); coCreateMelody.hidden = !options.onCoCreateRecognizedPhrase;
  melodyActions.append(listenMelody, editMelody, coCreateMelody);
  const melodySaveHint = node('p', 'sampling-melody-save-hint');
  melodyResult.append(melodySummary, melodyTiming, melodyWarnings, melodyActions, melodySaveHint); melody.append(melodyResult); main.append(melody);

  const empty = node('section', 'sampling-empty');
  empty.append(node('span', 'sampling-empty-mark', '∿')); main.append(empty);
  const notice = node('p', 'studio-notice'); notice.setAttribute('role', 'status'); main.append(notice);
  const library = node('section', 'sampling-library');
  const libraryHeader = node('div', 'sampling-library-heading'); libraryHeader.append(node('h2', '', '已保存的采样'));
  const savedCount = node('span', 'sampling-saved-count'); libraryHeader.append(savedCount); library.append(libraryHeader);
  const savedList = node('div', 'sampling-saved-list'); library.append(savedList); main.append(library);
  page.append(main); root.replaceChildren(page);

  function report(text: string, error = false): void { notice.textContent = text; notice.classList.toggle('is-error', error); }
  function available(): boolean { return !disposed && !pendingAction && view?.phase === 'idle'; }
  function hasAudio(): boolean { return typeof view?.durationSeconds === 'number' && view.durationSeconds > 0; }
  function syncControls(): void {
    const ready = available() && !replacementDialog;
    importButton.disabled = !ready; recordButton.disabled = !ready;
    name.disabled = !ready; saveButton.disabled = !ready || !hasAudio() || !view?.changed && name.value === view?.name;
    useAsSound.disabled = !ready || !hasAudio(); useAsSound.textContent = pendingAction === 'timbre' ? '正在准备音色…' : '用这段声音制作音色';
    listen.disabled = !ready || !hasAudio();
    const samplePreview = previewTarget === 'sample'; const melodyPreview = previewTarget === 'melody';
    listen.textContent = samplePreview && preparing ? '取消试听' : samplePreview && sessionId ? '■ 停止' : '听听';
    listen.classList.toggle('is-playing', samplePreview && !!sessionId);
    listen.setAttribute('aria-pressed', String(samplePreview && (preparing || !!sessionId))); listen.setAttribute('aria-busy', String(samplePreview && preparing));
    const analyzing = recognitionPending || recognitionView?.phase === 'analyzing';
    const overLimit = (view?.durationSeconds ?? 0) > MAX_MELODY_INPUT_SECONDS;
    recognize.disabled = !ready || !hasAudio() || !view?.audioToken || analyzing || overLimit || adopting;
    recognize.textContent = analyzing ? '正在识别…' : '把哼唱变成旋律';
    const resultReady = recognitionView?.phase === 'ready' && !!recognitionView.result?.notes.length;
    listenMelody.disabled = !ready || !resultReady || adopting;
    listenMelody.textContent = melodyPreview && preparing ? '取消试听' : melodyPreview && sessionId ? '■ 停止' : '听听识别结果';
    listenMelody.setAttribute('aria-pressed', String(melodyPreview && (preparing || !!sessionId))); listenMelody.setAttribute('aria-busy', String(melodyPreview && preparing));
    editMelody.disabled = !ready || !resultReady || adopting; coCreateMelody.disabled = !ready || !resultReady || adopting;
    stopRecord.hidden = view?.phase !== 'recording';
    cancelRecord.hidden = view?.phase !== 'requesting' && view?.phase !== 'recording' && pendingAction !== 'record';
    for (const control of savedControls.values()) control.button.disabled = !ready;
    for (const [id, control] of savedControls) control.row.classList.toggle('is-current', id === view?.currentId);
  }
  function stopPreview(): void {
    previewGeneration++; preparing = false; sessionId = undefined; previewTarget = undefined; sound.stopAll(); syncControls();
  }
  function stopRecognition(): void {
    recognitionGeneration++; recognitionPending = false; options.recognition?.cancel(); updateRecognition();
  }
  function commitName(): void {
    if (!hasAudio() || !view || name.value === view.name) return;
    sampling.rename(name.value);
  }
  function leave(callback: () => void): void {
    if (disposed) return;
    try {
      if (view?.phase === 'idle' && !pendingAction) commitName();
      replacementDialog?.close();
      actionGeneration++; pendingAction = undefined;
      stopPreview(); stopRecognition(); sampling.leave(); update(); callback();
    } catch (error) { if (!disposed) report(message(error), true); }
  }
  function cancelRecording(): void {
    if (disposed) return;
    actionGeneration++; pendingAction = undefined;
    try { stopPreview(); stopRecognition(); sampling.cancelRecording(); report('录音已取消。此前的采样仍然保留。'); }
    catch (error) { report(message(error), true); }
    update();
  }
  function replace(kind: 'import' | 'record' | 'open', action: () => Promise<void>): void {
    if (!available() || replacementDialog) return;
    try { commitName(); if (!sampling.read().changed) { void run(kind, action); return; } }
    catch (error) { report(message(error), true); return; }
    stopPreview();
    const dialog = node('dialog', 'sampling-replace-dialog'); replacementDialog = dialog;
    dialog.append(node('h2', '', '先留下这段声音？'), node('p', '', '当前采样还没保存。保存后再继续，或者放弃这次未保存的修改。'));
    const errorText = node('p', 'sampling-dialog-error'); errorText.setAttribute('role', 'status'); dialog.append(errorText);
    const actions = node('div', 'dialog-actions');
    const proceed = () => { dialog.close(); if (!disposed) void run(kind, action); };
    actions.append(button('保存后继续', 'primary', () => {
      if (disposed) return;
      try { commitName(); sampling.save(); proceed(); }
      catch (error) { errorText.textContent = message(error); report(message(error), true); }
    }), button('放弃并继续', 'secondary', proceed), button('返回', 'quiet', () => dialog.close()));
    dialog.append(actions);
    dialog.addEventListener('close', () => { dialog.remove(); if (replacementDialog === dialog) replacementDialog = undefined; syncControls(); }, { once: true });
    root.append(dialog); dialog.showModal(); syncControls();
  }
  function openSample(id: string): void {
    if (!available()) return;
    if (view?.currentId === id) { report('这份采样已经打开，可以直接试听。'); return; }
    replace('open', () => sampling.open(id));
  }
  async function run(kind: NonNullable<typeof pendingAction>, action: () => Promise<void>): Promise<void> {
    stopPreview(); stopRecognition();
    const request = ++actionGeneration; pendingAction = kind; syncControls();
    try {
      await action();
      if (disposed || request !== actionGeneration) return;
      const current = sampling.read();
      if (current.problem) report(current.problem, true);
      else if (kind === 'stop') report('这一段已录好。听听，再把它保存下来。');
      else if (kind === 'open') report('采样已打开，可以试听。');
      else if (kind === 'record' && current.phase === 'recording') report('正在录音。录好后点击“完成录音”，也可以随时取消。');
      else if (kind === 'import' && current.changed) report('音频已准备好。听听，再把它保存下来。');
    } catch (error) {
      if (!disposed && request === actionGeneration) report(message(error), true);
    } finally {
      if (!disposed && request === actionGeneration) { pendingAction = undefined; update(); }
    }
  }
  async function preview(target: 'sample' | 'melody' = 'sample'): Promise<void> {
    if (!available() || !hasAudio()) return;
    if (target === 'melody' && (recognitionView?.phase !== 'ready' || !recognitionView.result?.notes.length)) return;
    if (previewTarget === target && (preparing || sessionId)) { stopPreview(); report('试听已停止。'); return; }
    stopPreview();
    const request = ++previewGeneration; previewTarget = target; preparing = true; syncControls(); report('正在准备试听…');
    try {
      const result = target === 'melody' ? await sound.preview(options.recognition!.previewPlan()) : await sound.previewAudio(sampling.previewAudio());
      if (disposed || request !== previewGeneration) { sound.stop(result.id); return; }
      sessionId = result.status === 'playing' ? result.id : undefined;
      if (result.status === 'failed') report(result.error ?? '试听没有完成，请重试。', true);
      else report(sessionId ? target === 'melody' ? '正在试听识别出的旋律，可以和原采样交替听听。' : '正在试听原采样。' : '试听已结束。');
    } catch (error) {
      if (!disposed && request === previewGeneration) report(message(error), true);
    } finally {
      if (!disposed && request === previewGeneration) { preparing = false; if (!sessionId) previewTarget = undefined; syncControls(); }
    }
  }
  async function analyze(): Promise<void> {
    const recognition = options.recognition;
    if (!recognition || !available() || replacementDialog || recognitionPending || recognitionView?.phase === 'analyzing' || !hasAudio()) return;
    const request = ++recognitionGeneration;
    try {
      commitName(); const source = sampling.read();
      if (!source.audioToken) throw new Error('请先导入或完成一段哼唱，再整理旋律。');
      if ((source.durationSeconds ?? 0) > MAX_MELODY_INPUT_SECONDS) throw new Error(`首版只识别 ${MAX_MELODY_INPUT_SECONDS} 秒以内的完整哼唱，不会自动截取。请换一段较短的声音。`);
      stopPreview(); recognitionPending = true; updateRecognition(); report('正在把这段哼唱整理成旋律…');
      await recognition.analyze({ audio: sampling.previewAudio(), sourceToken: source.audioToken, sourceName: source.name });
      if (disposed || request !== recognitionGeneration) return;
      const current = recognition.read();
      if (current.problem) report(current.problem, true);
      else if (current.phase === 'ready') report('先听听识别结果。音高或长短有偏差时，可以继续细调。');
    } catch (error) {
      if (!disposed && request === recognitionGeneration) report(message(error), true);
    } finally {
      if (!disposed && request === recognitionGeneration) { recognitionPending = false; updateRecognition(); }
    }
  }
  function adopt(callback: typeof options.onEditRecognizedPhrase): void {
    if (!callback || !options.recognition || !available() || adopting || recognitionView?.phase !== 'ready' || !recognitionView.result?.notes.length) return;
    adopting = true; syncControls();
    try { commitName(); stopPreview(); const result = options.recognition.adopt(); callback(result); }
    catch (error) { if (!disposed) { report(message(error), true); updateRecognition(); } }
    finally { adopting = false; if (!disposed) syncControls(); }
  }
  function updateRecognition(): void {
    if (disposed || updatingRecognition) return;
    updatingRecognition = true;
    try {
      recognitionView = options.recognition?.read();
      melody.hidden = !options.recognition || !hasAudio();
      const analyzing = recognitionPending || recognitionView?.phase === 'analyzing';
      analysisProgress.hidden = !analyzing;
      const progressValue = recognitionView?.progress ?? 0;
      const progress = Number.isFinite(progressValue) ? Math.max(0, Math.min(1, progressValue)) : 0; progressBar.value = progress;
      progressLabel.textContent = `正在整理旋律… ${Math.round(progress * 100)}%`;
      melodyLimit.hidden = (view?.durationSeconds ?? 0) <= MAX_MELODY_INPUT_SECONDS;
      melodyProblem.textContent = recognitionView?.problem ?? ''; melodyProblem.hidden = !recognitionView?.problem;
      const result = recognitionView?.phase === 'ready' ? recognitionView.result : undefined;
      melodyResult.hidden = !result;
      melodySummary.textContent = result ? `整理出 ${result.notes.length} 个音符 · ${result.durationSeconds.toFixed(1)} 秒` : '';
      const warnings = result?.warnings.slice(0, 3) ?? [];
      const signature = JSON.stringify(warnings);
      if (signature !== warningSignature) { warningSignature = signature; melodyWarnings.replaceChildren(...warnings.map(warning => node('li', '', warning))); }
      melodyWarnings.hidden = !warnings.length;
      melodySaveHint.textContent = recognitionView?.adopted ? '这份旋律已保留，可继续细调或共创。原采样不变。' : '选择“去细调”或“继续共创”才保留为可编辑乐句，原采样不变。';
      if (previewTarget === 'melody' && !result) stopPreview();
      syncControls();
    } catch (error) { report(message(error), true); }
    finally { updatingRecognition = false; }
  }
  function save(): void {
    if (!available() || !hasAudio()) return;
    try {
      commitName();
      const result = sampling.save();
      report(`“${result.name}”已保存到素材。`); update();
    } catch (error) { report(message(error), true); update(); }
  }
  async function createTimbre(): Promise<void> {
    if (!available() || !hasAudio() || !options.onCreateSampleTimbre) return;
    const request = ++actionGeneration;
    try {
      commitName(); stopPreview(); stopRecognition(); pendingAction = 'timbre'; syncControls();
      const sample = sampling.save(); report('采样已保留，正在准备可演奏的音色…');
      await options.onCreateSampleTimbre(sample.id);
    } catch (error) { if (!disposed && request === actionGeneration) report(message(error), true); }
    finally { if (!disposed && request === actionGeneration) { pendingAction = undefined; update(); } }
  }
  function updateWaveform(values: number[]): void {
    const signature = values.join(','); if (signature === waveformSignature) return; waveformSignature = signature;
    if (!values.length) { envelope.removeAttribute('d'); return; }
    const peaks = values.map(value => Math.max(0, Math.min(1, Number.isFinite(value) ? Math.abs(value) : 0)));
    const x = (index: number) => peaks.length === 1 ? 500 : index * 1000 / (peaks.length - 1);
    const upper = peaks.map((value, index) => `${x(index).toFixed(2)} ${(80 - value * 65).toFixed(2)}`);
    const lower = peaks.map((value, index) => `${x(index).toFixed(2)} ${(80 + value * 65).toFixed(2)}`).reverse();
    envelope.setAttribute('d', `M${upper.join('L')}L${lower.join('L')}Z`);
  }
  function updateSaved(current: SamplingView): void {
    const signature = JSON.stringify(current.savedSamples);
    if (signature === listSignature) return; listSignature = signature;
    savedControls.clear(); savedList.replaceChildren(); savedCount.textContent = String(current.savedSamples.length);
    if (!current.savedSamples.length) { savedList.append(node('p', 'sampling-library-empty', '还没有保存的采样。')); return; }
    for (const sample of current.savedSamples.slice().reverse()) {
      const row = node('article', 'sampling-saved'); const info = node('div', 'sampling-saved-info');
      info.append(node('h3', '', sample.name), node('p', '', sample.durationSeconds === undefined ? '音频采样' : `${seconds(sample.durationSeconds)} · 音频采样`));
      const open = button('打开', 'quiet', () => openSample(sample.id));
      open.setAttribute('aria-label', `打开采样：${sample.name}`); row.append(info, open); savedControls.set(sample.id, { row, button: open }); savedList.append(row);
    }
  }
  function update(): void {
    if (disposed) return;
    try {
      const previousPhase = view?.phase; const previousAudio = view?.audioToken; view = sampling.read();
      const current = view;
      if (previousAudio && previousAudio !== current.audioToken) { stopPreview(); stopRecognition(); }
      if (document.activeElement !== name) name.value = current.name;
      const loaded = hasAudio(); audio.hidden = !loaded; empty.hidden = loaded || current.phase !== 'idle';
      saveState.textContent = current.changed ? '尚未保存到素材' : current.currentId ? '已保存在素材中' : '';
      const format = current.sampleRate ? `${Number((current.sampleRate / 1000).toFixed(1))} kHz` : '';
      const channels = current.channelCount === 1 ? '单声道' : current.channelCount === 2 ? '双声道' : current.channelCount ? `${current.channelCount} 声道` : '';
      metadata.textContent = [current.durationSeconds === undefined ? '' : `${seconds(current.durationSeconds)} · ${current.durationSeconds.toFixed(2)} 秒`, format, channels].filter(Boolean).join('  ·  ');
      recording.hidden = current.phase === 'idle' && pendingAction !== 'record';
      recording.classList.toggle('is-recording', current.phase === 'recording');
      phaseText.textContent = current.phase === 'requesting' || pendingAction === 'record' && current.phase === 'idle' ? '等待麦克风许可…' : current.phase === 'recording' ? '正在录音' : current.phase === 'processing' ? '正在整理这段声音…' : current.phase === 'loading' ? '正在读取音频…' : '';
      const isRecording = current.phase === 'recording'; timer.hidden = !isRecording; level.hidden = !isRecording;
      timer.textContent = `${seconds(current.elapsedSeconds)} / ${seconds(MAX_RECORDING_SECONDS)}`;
      const inputLevel = Math.round(Math.max(0, Math.min(1, current.inputLevel || 0)) * 100);
      levelFill.style.width = `${inputLevel}%`; level.setAttribute('aria-valuenow', String(inputLevel));
      updateWaveform(current.waveform); updateSaved(current); updateRecognition(); syncControls();
      if (current.problem && current.problem !== lastProblem) report(current.problem, true);
      else if (previousPhase === 'processing' && current.phase === 'idle' && !current.problem && current.changed) report('这一段已准备好。听听，再把它保存下来。');
      lastProblem = current.problem;
    } catch (error) { report(message(error), true); }
  }
  name.addEventListener('change', () => { try { commitName(); } catch (error) { report(message(error), true); } update(); });
  name.addEventListener('input', syncControls);
  const unsubscribeSampling = sampling.subscribe(update);
  const unsubscribeRecognition = options.recognition?.subscribe(updateRecognition);
  const unsubscribeSound = sound.subscribe(event => {
    if (disposed) return;
    if (event.type === 'session' && event.session.id === sessionId && event.session.status !== 'playing') {
      sessionId = undefined; previewTarget = undefined;
      report(event.session.status === 'failed' ? event.session.error ?? '试听没有完成，请重试。' : '试听已结束。', event.session.status === 'failed'); syncControls();
    } else if (event.type === 'device' && (event.status === 'failed' || event.status === 'suspended')) report(event.error ?? '声音设备暂不可用，请重新试听。', true);
  });
  update();
  if (options.initialSampleId && options.initialSampleId !== view?.currentId) openSample(options.initialSampleId);
  return {
    refresh: update,
    notify(text, error = false) { if (!disposed) report(text, error); },
    dispose() {
      if (disposed) return; disposed = true; actionGeneration++; pendingAction = undefined;
      replacementDialog?.close(); replacementDialog?.remove(); replacementDialog = undefined;
      unsubscribeSampling(); unsubscribeRecognition?.(); unsubscribeSound(); stopPreview(); stopRecognition(); sampling.leave();
    },
  };
}
