import { createWebDemoModel, WEB_MAX_FILE_BYTES } from './web-demo-model.ts';
import { createWebExampleModel } from './web-demo-example.ts';
import starterExample from '../../../website/examples/starter.json';
import { createMidiProjectLibrary } from './midi-project.ts';
import { mountMelodyWorkspace } from '../modules/ui-rendering/melody-workspace.ts';
import { createPhraseCompositionTransport } from '../modules/ui-rendering/phrase-composition-transport.ts';
import { createBrowserSoundRuntime } from '../modules/sound-runtime/public.ts';
import { phraseDurationSeconds, phraseBeatSeconds, phraseHeldSeconds } from '../contracts/phrase-time.ts';
import type { PhraseBody } from '../contracts/phrase.ts';
import type { PlaylistTransportState } from '../modules/ui-rendering/playlist-transport.ts';
import './web-demo.css';

const app = document.querySelector<HTMLElement>('#app')!;
app.innerHTML = `<section class="web-studio" aria-label="简乐在线编曲">
  <header class="web-toolbar">
    <input class="web-name" aria-label="音乐名称" value="我的音乐" readonly title="双击修改名称">
    <div class="web-transport">
      <button class="web-stop" title="停止并回到开头" aria-label="停止并回到开头">■</button>
      <button class="web-play" title="播放 / 暂停（空格）" aria-label="播放" aria-pressed="false">▶</button>
      <output class="web-clock" aria-label="播放时间">00:00.000</output>
    </div>
    <div class="web-actions">
      <button class="web-undo" title="撤销（Ctrl/⌘ Z）" aria-label="撤销">↶</button>
      <button class="web-redo" title="重做（Ctrl/⌘ Shift Z）" aria-label="重做">↷</button>
      <button class="web-new" title="新建空白音乐">新建</button>
      <button class="web-open" title="打开工程或 MIDI">打开</button>
      <button class="web-save" title="下载可在桌面版继续编辑的工程">下载工程</button>
      <button class="web-export" title="导出 WAV 音频">导出音频</button>
    </div>
  </header>
  <div class="web-workspace"></div>
  <footer class="web-footer"><p class="web-status" role="status" aria-live="polite">选一个音符组，在空白处点按或拖动，即可写音符。</p><span class="web-limit">8 音色 · 最多 16 小节</span><button class="web-help" aria-label="使用帮助">?</button></footer>
  <input class="web-file" type="file" accept=".mid,.midi,.rootsound,.rsproject" hidden>
</section>`;
const q = <T extends HTMLElement = HTMLElement>(selector: string) => app.querySelector<T>(selector)!;
const name = q<HTMLInputElement>('.web-name'), play = q<HTMLButtonElement>('.web-play');
const status = q('.web-status'), file = q<HTMLInputElement>('.web-file');
let model = createWebExampleModel(starterExample);
let runtime = webSound();
let editor: ReturnType<typeof mountMelodyWorkspace> | undefined;
let transport: ReturnType<typeof createPhraseCompositionTransport> | undefined;
let state: PlaylistTransportState = { playing: false, preparing: false, position: 0, rate: 1 };
let temporary: PhraseBody | undefined, family: string | undefined;
let dirty = false, busy = false, frame = 0, disposed = false;
let showStarter = true;

function webSound() {
  const sound = createBrowserSoundRuntime();
  let request = 0;
  return { ...sound, async audition(plan: Parameters<typeof sound.audition>[0]) {
    if (parent !== window) parent.postMessage({ type: 'jianle:editor-playing' }, location.origin);
    const id = ++request; report('正在准备声音，首次试听需要加载音色…');
    try { await sound.audition(plan); if (id === request) report('右键删除音符；选中音符后滚轮可调整时长。'); }
    catch (error) { if (id === request) report(error); throw error; }
  }, cancelAudition() { request++; sound.cancelAudition(); } };
}

function report(value: unknown) { status.textContent = value instanceof Error ? value.message : String(value); }
function clock(seconds: number) {
  const milliseconds = Math.max(0, Math.floor(seconds * 1000));
  return `${String(Math.floor(milliseconds / 60000)).padStart(2, '0')}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, '0')}.${String(milliseconds % 1000).padStart(3, '0')}`;
}
function paintClock() {
  if (disposed) return;
  const position = transport?.position() ?? 0;
  q('.web-clock').textContent = clock(position); editor?.setPlayhead(position, state.playing);
  if (state.playing) frame = requestAnimationFrame(paintClock);
}
function refreshButtons() {
  const history = model.library.readDraftHistory(model.score.read().draft!.id);
  q<HTMLButtonElement>('.web-undo').disabled = busy || !history.past.length;
  q<HTMLButtonElement>('.web-redo').disabled = busy || !history.future.length;
  q('.web-name').classList.toggle('is-dirty', dirty);
  q('.web-save').toggleAttribute('data-unsaved', dirty);
  play.textContent = state.preparing ? '…' : state.playing ? 'Ⅱ' : '▶';
  play.setAttribute('aria-label', state.playing ? '暂停' : '播放');
  play.setAttribute('aria-pressed', String(state.playing));
}
function changed() {
  dirty = true;
  queueMicrotask(() => { if (!disposed) refreshButtons(); });
}
function refreshMusic() { temporary = undefined; editor?.refresh(); transport?.refresh(); refreshButtons(); }
function planBody() {
  const body = temporary ?? model.score.read().body!;
  return family ? { ...body, parts: body.parts.filter(part => part.id === family) } : body;
}

function starterViewport() {
  if (!showStarter) return undefined;
  const body = model.score.read().body!, notes = body.parts.flatMap(part => part.notes);
  if (!notes.length) return undefined;
  const keys = model.score.keyboard();
  const indices = notes.map(note => keys.reduce((best, key, index) =>
    Math.abs(key.frequencyHz - note.frequencyHz) < Math.abs(keys[best]!.frequencyHz - note.frequencyHz) ? index : best, 0));
  const first = Math.max(0, Math.min(...indices) - 3), last = Math.min(keys.length, Math.max(...indices) + 4);
  const rowHeight = Math.max(12, Math.min(32, (q('.web-workspace').clientWidth - 140) / (last - first)));
  const end = Math.max(...notes.map(note => phraseBeatSeconds(body, note.startBeat) + phraseHeldSeconds(body, note)));
  return { leftSeconds: 0, zoom: 8 / Math.max(2, end + .4), rowHeight, top: first * rowHeight };
}

function mount() {
  model.subscribeEdit(changed);
  name.value = model.score.read().draft!.name;
  transport = createPhraseCompositionTransport({
    runtime, readPlan: () => model.score.previewPlan(planBody(), { allowSilence: true }),
    prepare: () => model.score.preparePreview(planBody()), tempoBpm: () => model.score.read().body!.tempoBpm,
    durationSeconds: () => phraseDurationSeconds(model.score.read().body!), readBody: planBody,
    onChange(next) {
      if (next.playing && !state.playing && parent !== window) parent.postMessage({ type: 'jianle:editor-playing' }, location.origin);
      state = next; cancelAnimationFrame(frame); paintClock(); refreshButtons();
    }, onError: report,
  });
  editor = mountMelodyWorkspace(q('.web-workspace'), {
    phrase: model.score, sound: runtime, orientation: 'vertical', includeAllSections: true,
    initialViewport: starterViewport(),
    initialSelection: !model.score.read().body!.parts.some(part => part.notes.length) && model.score.read().body!.parts[0]
      ? { partId: model.score.read().body!.parts[0]!.id } : undefined,
    gridBpm: () => model.score.read().body!.tempoBpm,
    onChange: () => { temporary = undefined; transport?.refresh(); refreshButtons(); },
    onPreview(body) { temporary = body; transport?.refresh(); },
    onSeek: seconds => transport!.seek(seconds),
    readPlayhead: () => transport?.position() ?? 0, readIsPlaying: () => state.playing,
    onPlaybackFamilyChange(id) { family = id; transport?.refresh(); },
    listTimbres: () => model.palette,
    onAddTimbre: id => model.addGroup(id), onCreateNoteGroup: id => model.addGroup(id),
    onChangeNoteGroupTimbre: (partId, id) => model.changeTone(partId, id),
  });
  refreshButtons();
}

async function replace(next: ReturnType<typeof createWebDemoModel>) {
  cancelAnimationFrame(frame);
  // Dispose the old view before switching model closures or the audio boundary.
  editor?.dispose(); transport?.dispose(); await runtime.dispose();
  model = next; showStarter = false; runtime = webSound(); editor = undefined; transport = undefined;
  family = undefined; temporary = undefined; state = { playing: false, preparing: false, position: 0, rate: 1 };
  dirty = false; mount();
}

function download(bytes: BlobPart, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.hidden = true;
  document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}

async function exclusive(action: () => Promise<void>) {
  if (busy) return;
  try {
    editor?.flush(); busy = true; transport?.pause();
    q('.web-workspace').inert = true;
    for (const button of app.querySelectorAll<HTMLButtonElement>('.web-toolbar button')) button.disabled = true;
    name.disabled = true;
    await action();
  } catch (error) { report(error); }
  finally {
    busy = false; q('.web-workspace').inert = false; name.disabled = false;
    for (const button of app.querySelectorAll<HTMLButtonElement>('.web-toolbar button')) button.disabled = false;
    refreshButtons();
  }
}

// Start/resume in the original user gesture, before waiting for samples.
app.addEventListener('pointerdown', event => {
  if (!busy && event.isTrusted && (event.target as HTMLElement).closest('.web-play,.web-workspace'))
    void runtime.activate?.().catch(report);
}, { capture: true });
play.addEventListener('click', () => { if (!busy) { editor?.flush(); void transport?.toggle().catch(report); } });
q('.web-stop').addEventListener('click', () => transport?.stop());
q('.web-undo').addEventListener('click', () => { try { editor?.flush(); model.score.undo(); refreshMusic(); } catch (error) { report(error); } });
q('.web-redo').addEventListener('click', () => { try { editor?.flush(); model.score.redo(); refreshMusic(); } catch (error) { report(error); } });
q('.web-save').addEventListener('click', () => void exclusive(async () => {
  report('正在准备工程…');
  const text = await model.save();
  download(text, `${model.score.read().draft!.name}.rootsound`, 'application/json');
  dirty = false; report('已发起工程下载，可在简乐桌面版中继续编辑。');
}));
q('.web-export').addEventListener('click', () => void exclusive(async () => {
  if (!model.score.read().body!.parts.some(part => !part.unassigned && part.notes.length)) throw new Error('先写几个音符，再导出音频。');
  report('正在导出音频…');
  // Export all families regardless of the temporary audition selection.
  await model.score.preparePreview();
  const output = await runtime.render(model.score.previewPlan(), { sampleRate: 44100,
    onProgress: progress => report(`正在导出音频… ${Math.round(progress * 100)}%`) });
  download(new Uint8Array(output.bytes).buffer, `${model.score.read().draft!.name}.wav`, output.mimeType);
  report('已发起 WAV 音频下载。');
}));
q('.web-open').addEventListener('click', () => { if (!busy) { file.value = ''; file.click(); } });
file.addEventListener('change', () => {
  const chosen = file.files?.[0]; if (!chosen) return;
  void exclusive(async () => {
    if (chosen.size > WEB_MAX_FILE_BYTES) throw new Error('网页版支持 16 MiB 以内的文件，更大的工程请使用桌面版。');
    report('正在打开…');
    const bytes = new Uint8Array(await chosen.arrayBuffer()), midi = /\.midi?$/i.test(chosen.name);
    const name = chosen.name.replace(/\.(?:mid|midi|rootsound|rsproject)$/i, '').slice(0, 80) || '我的音乐';
    const imported = midi ? createMidiProjectLibrary(bytes, name) : undefined;
    const text = imported?.libraryText ?? new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    // Candidate validation happens before the current document can be replaced.
    const next = createWebDemoModel(text, name);
    next.rename(name);
    if (dirty && !await confirmDiscard('打开另一首音乐？')) { report('已取消打开。'); return; }
    const replacements = next.replaced;
    await replace(next);
    dirty = midi || replacements > 0;
    report(replacements ? `已打开；${replacements} 个音符组已匹配为网页版音色，音符保持不变。`
      : midi ? 'MIDI 已导入，可继续编辑并下载工程。' : '工程已打开。');
  });
});
q('.web-new').addEventListener('click', () => void exclusive(async () => {
  if (dirty && !await confirmDiscard('新建空白音乐？')) return;
  await replace(createWebDemoModel()); report('选一个音符组，在空白处点按或拖动，即可写音符。');
}));

function confirmDiscard(title: string): Promise<boolean> {
  return new Promise(resolve => {
    const dialog = document.createElement('dialog'); dialog.className = 'web-dialog';
    const heading = document.createElement('h2'); heading.textContent = title;
    const copy = document.createElement('p'); copy.textContent = '当前有尚未下载的修改。继续后，这份草稿将被丢弃。';
    const cancel = document.createElement('button'); cancel.textContent = '返回';
    const confirm = document.createElement('button'); confirm.textContent = '放弃草稿并继续';
    cancel.addEventListener('click', () => dialog.close('cancel')); confirm.addEventListener('click', () => dialog.close('discard'));
    dialog.append(heading, copy, cancel, confirm); app.append(dialog);
    dialog.addEventListener('close', () => { const accepted = dialog.returnValue === 'discard'; dialog.remove(); resolve(accepted); }, { once: true });
    dialog.showModal();
  });
}

name.addEventListener('dblclick', () => { if (!busy) { name.readOnly = false; name.select(); } });
name.addEventListener('blur', () => {
  if (name.readOnly) return;
  try { model.rename(name.value); } catch (error) { report(error); }
  name.value = model.score.read().draft!.name; name.readOnly = true; refreshButtons();
});
name.addEventListener('keydown', event => { if (event.key === 'Enter') name.blur(); if (event.key === 'Escape') { name.value = model.score.read().draft!.name; name.blur(); } });
q('.web-help').addEventListener('click', () => {
  const dialog = document.createElement('dialog'); dialog.className = 'web-dialog';
  dialog.innerHTML = `<h2>在线编曲</h2><p>左侧 + 选择音色。选中音符组后，点击或拖动画布写音符；拖动音符移动位置，拖动尾端改变长度，右键删除。</p><p>滚轮上下移动，Shift 左右移动，Ctrl 缩放。悬停选中音符时，滚轮微调时长。选中音符组时只播放这一组；右键空白处取消选中，可听完整音乐。</p><p>左侧 BPM 数字可调整速度和敲击定速；下方 + 新建速度段，拖动段边界调整长度。网页版总长最多 64 拍。</p><p>每次打开先载入示例。请使用“下载工程”保存自己的修改；刷新后会回到示例。打开按钮支持 MIDI 和小型工程；超出音色范围时会使用网页版音色替代。</p><p>音色为 GeneralUser GS 2.0.3 的裁剪版本，保留原始录音及播放规则。<a href="instruments/generaluser-gs-2.0.3/LICENSE.txt" target="_blank" rel="noopener">音源许可与来源说明</a> · <a href="instruments/generaluser-gs-2.0.3/spessasynth_core-LICENSE.txt" target="_blank" rel="noopener">播放内核许可</a></p><form method="dialog"><button>知道了</button></form>`;
  dialog.addEventListener('close', () => dialog.remove(), { once: true }); app.append(dialog); dialog.showModal();
});

document.addEventListener('keydown', event => {
  if (busy && !(event.target as HTMLElement).closest('dialog')) { event.preventDefault(); event.stopImmediatePropagation(); }
}, { capture: true });
document.addEventListener('keydown', event => {
  const target = event.target as HTMLElement;
  if (event.defaultPrevented || busy || target.closest('input,textarea,select,dialog,[contenteditable="true"]')) return;
  if (event.code === 'Space' && !target.closest('button')) {
    event.preventDefault(); void runtime.activate?.().then(() => transport?.toggle()).catch(report);
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); q<HTMLButtonElement>('.web-save').click(); }
});
window.addEventListener('beforeunload', event => { editor?.flush(); if (dirty) { event.preventDefault(); event.returnValue = ''; } });
window.addEventListener('message', event => {
  if (event.origin === location.origin && event.source === parent && event.data?.type === 'jianle:pause-for-guide') {
    transport?.pause(); runtime.cancelAudition();
  }
});
window.addEventListener('pagehide', () => { disposed = true; cancelAnimationFrame(frame); editor?.dispose(); transport?.dispose(); void runtime.dispose(); });

try { mount(); report('示例已载入，可以直接播放或编辑。'); } catch (error) { report(error); }
