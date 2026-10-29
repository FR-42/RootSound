import type { TimbreEditorPort } from '../../contracts/timbre.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import type { ReferenceEditorContext } from './reference-ui.ts';
import { createReferenceNavigation } from './reference-ui.ts';

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag); node.className = className; node.textContent = text; return node;
}
/** Imported synthesis keeps its complete recipe instead of opening a simpler editor. */
export function mountImportedSpectralWorkspace(root: HTMLElement, options: {
  timbre: TimbreEditorPort; sound: SoundRuntimePort; onWelcome(): void; onSave(): void;
  onPhrase?(): void; onSong?(): void; onSettings?(): void;
  referenceContext?: ReferenceEditorContext; onApplyElsewhere?(): void;
}) {
  let disposed = false; let generation = 0;
  const page = element('div', 'studio synth-studio'); const toolbar = element('header', 'studio-toolbar');
  const button = (label: string, action: () => void) => { const node = element('button', 'quiet', label); node.type = 'button'; node.addEventListener('click', () => { if (!disposed) action(); }); return node; };
  const title = element('input', 'sound-name'); title.setAttribute('aria-label', '音色名称'); title.maxLength = 120;
  const message = element('p', 'save-state'); message.hidden = true;
  function notify(text: string, error = false): void { if (disposed) return; message.textContent = text; message.hidden = !text; message.classList.toggle('is-error', error); }
  const safe = (action: () => void) => { try { action(); refresh(); } catch (error) { notify(error instanceof Error ? error.message : String(error), true); } };
  const save = () => safe(() => {
    const view = options.timbre.read();
    if (title.value.trim() !== view.draft.name) options.timbre.rename(title.value);
    if (Number(level.value) !== view.body.level) options.timbre.setLevel(Number(level.value));
    options.onSave();
  });
  toolbar.append(button('RootSound', options.onWelcome), title);
  if (options.onPhrase) toolbar.append(button('乐句谱写', options.onPhrase));
  if (options.onSong) toolbar.append(button('歌曲编排', options.onSong));
  if (options.onSettings) toolbar.append(button('设置', options.onSettings));
  toolbar.append(button('保存', save));
  const main = element('main', 'synth-workspace'); const navigation = element('div', 'synth-navigation');
  const heading = element('div', 'synth-heading');
  const listen = button('▶ 试听', () => {
    const request = ++generation; listen.disabled = true;
    void options.timbre.preparePreview().then(async () => {
      if (!disposed && request === generation) await options.sound.audition(options.timbre.previewPlan());
    }).catch(error => { if (!disposed && request === generation) notify(error instanceof Error ? error.message : String(error), true); })
      .finally(() => { if (!disposed && request === generation) listen.disabled = false; });
  });
  const level = element('input'); level.type = 'range'; level.min = '0'; level.max = '1'; level.step = '.01'; level.setAttribute('aria-label', '音色音量');
  const label = element('label', '', '音量 '); label.append(level); heading.append(listen, label);
  const summary = element('p', 'save-state');
  main.append(navigation, heading, summary, element('p', 'save-state', '完整曲线可在精细音色生成器中调整后重新导入。'), message); page.append(toolbar, main); root.replaceChildren(page);
  title.addEventListener('change', () => safe(() => options.timbre.rename(title.value)));
  level.addEventListener('change', () => safe(() => options.timbre.setLevel(Number(level.value))));
  function refresh(context = options.referenceContext, onApplyElsewhere = options.onApplyElsewhere): void {
    if (disposed) return; options.referenceContext = context; options.onApplyElsewhere = onApplyElsewhere;
    const view = options.timbre.read(); if (view.body.model !== 'spectral-synth') return;
    title.value = view.draft.name; level.value = String(view.body.level);
    summary.textContent = `${view.body.patch.oscillators.filter(source => source.enabled).length} 个振荡器 · 频谱、音量、音高曲线已保留`;
    navigation.replaceChildren(); if (context) navigation.append(createReferenceNavigation(context));
  }
  const key = (event: KeyboardEvent) => {
    if (!disposed && !root.querySelector('dialog[open]') && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save(); }
  };
  document.addEventListener('keydown', key); refresh();
  return { refresh, notify, dispose() { if (disposed) return; disposed = true; generation++; options.sound.cancelAudition(); document.removeEventListener('keydown', key); } };
}
