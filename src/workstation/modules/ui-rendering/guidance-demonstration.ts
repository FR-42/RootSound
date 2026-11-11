import type { PracticeDocument } from '../../contracts/guidance.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import type { MusicWorkspaceState } from '../../contracts/workspace.ts';
import { mountPhraseComposition } from './phrase-composition.ts';
import { melodyDuration, melodyScale, melodySeconds } from './melody-geometry.ts';
import { phrasePitchRow } from './phrase-viewport.ts';
import { createGuidanceEffects, guideCenter, guideRect, type GuidePoint, type GuideRect } from './guidance-effects.ts';
import type { GuideSceneId } from './guidance-flow.ts';

const ease = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
const between = (a: GuidePoint, b: GuidePoint, t: number) => ({ x: a.x + (b.x - a.x) * ease(t), y: a.y + (b.y - a.y) * ease(t) });

export function createGuidanceDemonstration(shell: HTMLElement, host: HTMLElement, practice: PracticeDocument, sound: SoundRuntimePort, advanced: boolean) {
  const phrase = practice.phrase, tones = practice.listTimbres();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const piano = tones.find(tone => tone.name === '三角钢琴') ?? tones[0]!;
  const flute = tones.find(tone => tone.name === '管弦长笛') ?? tones[1]!;
  const first = phrase.read().body!.parts[0]!;
  phrase.setPartTimbre(first.id, piano.id);
  for (const part of phrase.read().body!.parts.slice(1)) phrase.removePart(part.id);
  const second = phrase.addPart(flute.id);
  let editor: ReturnType<typeof mountPhraseComposition> | undefined;
  let workspace: MusicWorkspaceState | undefined;
  let events = new Set<string>(), drag: { start: GuidePoint; end: GuidePoint } | undefined;
  let stage: GuideSceneId = 'rows', disposed = false;
  let demoNoteId: string | undefined;
  let anchor: GuideRect | undefined;
  let resumePlayback = false;
  let flight: { selector: string; at: number; start: GuidePoint } | undefined;
  const fx = createGuidanceEffects(shell);
  const captures = new Map<HTMLElement, { set: HTMLElement['setPointerCapture']; release: HTMLElement['releasePointerCapture'] }>();
  function patchCapture(node: HTMLElement) {
    if (captures.has(node)) return;
    captures.set(node, { set: node.setPointerCapture, release: node.releasePointerCapture });
    node.setPointerCapture = () => {}; node.releasePointerCapture = () => {};
  }
  function query<T extends HTMLElement = HTMLElement>(selector: string): T | null { return host.querySelector<T>(selector); }
  function click(selector: string) { query(selector)?.click(); }
  function once(name: string, time: number, at: number, action: () => void) { if (time >= at && !events.has(name)) { events.add(name); action(); } }
  function seed() {
    phrase.setTempo(100);
    phrase.setStepsPerBeat(4);
    for (const part of phrase.read().body!.parts) {
      for (const note of part.notes) phrase.removeNote(part.id, note.id);
    }
    phrase.setLength(8);
    const add = (partId: string, startBeat: number, pitch: number) => phrase.addNote(partId, {
      startBeat, durationBeats: .5, frequencyHz: 440 * 2 ** ((pitch - 69) / 12), velocity: .7,
    });
    add(first.id, 1, 60);
    demoNoteId = add(first.id, 1, 64);
    add(first.id, 3, 60);
    add(second, 1, 67);
    add(second, 3.5, 65);
  }
  function stop() { if (['暂停', '取消播放准备'].includes(query('.song-play')?.getAttribute('aria-label') ?? '')) click('.song-play'); }
  function pointer(type: string, target: HTMLElement, point: GuidePoint, button = 0) {
    for (const node of host.querySelectorAll<HTMLElement>('.melody-scroll,.melody-key,.melody-ruler,.melody-head-handle,.melody-tempo-marker,.melody-roll-end')) patchCapture(node);
    const event = new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 719, pointerType: 'mouse', button, buttons: type === 'pointerup' ? 0 : button === 2 ? 2 : 1, clientX: point.x, clientY: point.y });
    if (type === 'pointermove' || type === 'pointerup') document.dispatchEvent(event); else target.dispatchEvent(event);
  }
  function press(target: HTMLElement, point: GuidePoint, button = 0) {
    pointer('pointerdown', target, point, button);
    pointer('pointerup', target, point, button);
  }
  function rollPoint(pitch: string, beat: number): GuidePoint {
    const key = query('.melody-key[data-pitch-label="' + pitch + '"]')!.getBoundingClientRect();
    const canvas = query('.melody-canvas')!.getBoundingClientRect();
    const view = workspace!.viewport;
    const body = phrase.read().body!;
    const height = query('.melody-scroll')!.clientHeight - 48;
    return {
      x: key.left + key.width / 2,
      y: canvas.top + (melodySeconds(beat, body) - view.leftSeconds) * melodyScale(view, height, melodyDuration(body)),
    };
  }
  function startDrag(target: HTMLElement | null, from: GuidePoint | undefined, to: GuidePoint | undefined) {
    if (!target || !from || !to) return;
    drag = { start: from, end: to }; pointer('pointerdown', target, from);
  }
  function moveDrag(progress: number) { if (!drag) return; const p = between(drag.start, drag.end, progress); pointer('pointermove', query('.melody-scroll')!, p); fx.mouse(p, 'left'); }
  function endDrag(progress = 1) {
    if (!drag) return;
    const target = query('.melody-scroll')!;
    const point = between(drag.start, drag.end, progress);
    pointer('pointermove', target, point);
    pointer('pointerup', target, point);
    drag = undefined;
  }
  function change(selector: string, value: number, type = 'change') { const input = query<HTMLInputElement>(selector); if (input) { input.value = String(value); input.dispatchEvent(new Event(type, { bubbles: true })); } }
  function focus(selectors: string[], extra: GuideRect[] = [], strength = .85) {
    const rects = selectors.map(selector => guideRect(query(selector), 6)).filter((r): r is GuideRect => !!r);
    fx.begin([...rects, ...extra], strength);
  }
  function fly(selector: string, t: number, at: number, from?: GuidePoint): GuidePoint | undefined {
    const p = guideCenter(query(selector)); if (!p) return;
    if (!flight || flight.selector !== selector || flight.at !== at) flight = { selector, at, start: from ?? fx.pointer() ?? { x: innerWidth * .65, y: innerHeight * .7 } };
    return reduced.matches ? p : between(flight.start, p, (t - at) / .65);
  }
  function enter(next: GuideSceneId) {
    stage = next;
    events = new Set();
    drag = undefined;
    anchor = undefined;
    flight = undefined;
    resumePlayback = false;
    shell.dataset.action = '';
    if (!advanced && editor) return;

    shell.append(fx.layer);
    editor?.dispose();
    host.replaceChildren();
    workspace = undefined;
    for (let i = 0; i < 100 && phrase.read().body!.tempoSections?.length && phrase.read().canUndo; i++) phrase.undo();
    seed();
    if (!advanced) {
      const rowHeight = Math.max(12, Math.min(26, Math.floor((host.clientWidth - 170) / 9)));
      const c4 = phrasePitchRow(261.625565, phrase.keyboard());
      const leftMargin = Math.max(rowHeight, (host.clientWidth - 420) * .36);
      workspace = {
        viewport: { leftSeconds: 0, zoom: 2, top: c4 * rowHeight - leftMargin, rowHeight },
        showGridCells: true, orientation: 'vertical', playheadSeconds: 0, entryOctave: 4, noteLengths: {},
      };
    }
    if (stage === 'tap') phrase.setTempo(60);
    if (stage === 'boundary') phrase.addTempoSection();
    editor = mountPhraseComposition(host, {
      phrase, sound, directMusic: true, frameNotesOnMount: advanced,
      workspaceState: { read: () => workspace, write: value => { workspace = structuredClone(value); } },
      readMultipleTempoRolls: () => advanced,
      listTimbres: practice.listTimbres, onCreateNoteGroup: practice.addGroup, onChangeNoteGroupTimbre: practice.changeTone,
      onExit() {}, onLearningAction(value) { shell.dataset.action = value; },
    });
    host.inert = true;
  }
  function renderAxes(t: number) {
    const area = guideRect(query('.melody-scroll'))!;
    const firstRow = rollPoint('C4', 1);
    const secondRow = rollPoint('C4', 3);
    const onTime = stage === 'rows';
    const ink = onTime ? '#087f8c' : '#9358ad';
    const progress = reduced.matches ? 1 : ease(t / 1.15);
    const key = guideRect(query('.melody-key[data-pitch-label="C4"]'))!;
    const sameCell = { x: key.x, y: firstRow.y, width: key.width, height: (secondRow.y - firstRow.y) / 8 };
    focus(['.melody-scroll'], [], .88);
    if (onTime) {
      fx.band({ x: area.x, y: firstRow.y, width: area.width * progress, height: sameCell.height }, ink, .23);
      fx.line({ x: area.x, y: firstRow.y }, { x: area.x + area.width * progress, y: firstRow.y }, ink);
    } else {
      fx.band({ x: key.x, y: key.y, width: key.width, height: area.height * progress }, ink, .25);
      fx.line({ x: key.x, y: key.y + key.height }, { x: key.x, y: key.y + area.height * progress }, ink);
      if (t > 2.6) {
        fx.line({ x: area.x, y: firstRow.y }, { x: firstRow.x, y: firstRow.y }, '#087f8c');
        fx.band(sameCell, '#087f8c', .36);
      }
    }
    const matches = [...host.querySelectorAll<HTMLElement>('.melody-note')].filter(node => {
      const bounds = node.getBoundingClientRect();
      return onTime ? Math.abs(bounds.top - firstRow.y) < 2 : Math.abs(bounds.left - key.x) < 2;
    });
    if (t >= .9) for (const node of matches) fx.outline(guideRect(node, 2), ink);
  }

  function pointAt(target: GuidePoint, time: number, at: number, button: 'left' | 'right' = 'left') {
    if (!flight) flight = { selector: stage, at: 0, start: fx.pointer() ?? { x: target.x + 50, y: target.y + 55 } };
    const position = reduced.matches ? target : between(flight.start, target, time / (at - .35));
    if (time >= at - .15 && time < at + .55) fx.ring(target, 13, button === 'right' ? '#ce4949' : '#188369');
    fx.mouse(position, time >= at - .15 && time < at + .32 ? button : undefined);
  }

  function renderBasics(t: number) {
    if (stage === 'rows' || stage === 'columns') { renderAxes(t); return; }
    const canvas = query('.melody-canvas')!;
    const card = query('.melody-note-family[data-part-id="' + first.id + '"]')!;
    const noteElement = () => query('.melody-note[data-note-id="' + demoNoteId + '"]');
    const rememberAddedNote = () => {
      demoNoteId = phrase.read().body!.parts.find(part => part.id === first.id)!.notes.at(-1)!.id;
    };
    const target = noteElement()!;
    const current = guideCenter(target)!;
    const groupBox = guideRect(card, 2);
    const ink = '#188369';
    const highlightGroup = stage === 'group' || card.classList.contains('is-selected');
    focus(['.melody-scroll'], highlightGroup && groupBox ? [groupBox] : [], .88);

    if (stage === 'note' || stage === 'group') {
      const group = stage === 'group';
      const point = group ? guideCenter(card)! : current;
      once('select', t, 1.25, () => {
        if (group) card.click();
        else press(target, point);
      });
      if (t >= 1.25) {
        const nodes = group ? host.querySelectorAll('.melody-note[data-part-id="' + first.id + '"]') : [target];
          if (group) fx.outline(groupBox, ink);
        for (const node of nodes) {
          if (group) fx.line(point, guideCenter(node)!, ink, true);
          fx.outline(guideRect(node, 3), ink);
        }
      }
      pointAt(point, t, 1.25);
      return;
    }

    if (stage === 'add') {
      const point = rollPoint('D4', 2.26);
      once('add', t, 1.55, () => {
        press(canvas, point);
        rememberAddedNote();
      });
      if (t >= 1.55) fx.outline(guideRect(noteElement(), 3), ink);
      pointAt(point, t, 1.55);
      return;
    }

    if (stage === 'deselect') {
      once('clear', t, 1.55, () => press(target, current, 2));
      if (t < 1.55) fx.outline(guideRect(target, 3), ink);
      pointAt(current, t, 1.55, 'right');
      return;
    }

    const notePan = stage === 'note-pan';
    const pan = stage === 'pan' || notePan;
    const draw = stage === 'draw', resize = stage === 'resize';
    const handle = target.querySelector<HTMLElement>('.melody-note-resize')!;
    const from = pan ? rollPoint('G4', 4.6)
      : draw ? rollPoint('F4', 3.01)
      : resize ? guideCenter(handle)! : current;
    const to = pan ? {
      x: from.x + workspace!.viewport.rowHeight * (notePan ? .5 : -.72),
      y: rollPoint('G4', notePan ? 4.95 : 4).y,
    }
      : draw ? rollPoint('F4', 4.65)
      : resize ? { x: from.x, y: from.y + rollPoint('E4', 1).y - rollPoint('E4', 0).y }
      : { x: rollPoint('E4', 4.25).x, y: from.y + rollPoint('E4', 4.25).y - rollPoint('E4', 3).y };
    const start = 1.55, end = draw ? 4.9 : 3.75;
    once('start', t, start, () => {
      if (pan || draw) startDrag(canvas, from, to);
      else {
        anchor = guideRect(target);
        startDrag(resize ? handle : target, from, to);
      }
    });
    if (t < start) pointAt(from, t, start);
    if (drag) {
      const progress = (t - start) / (end - start);
      const extension = progress < .56 ? progress / .56 : 1 - Math.min(1, (progress - .56) / .44) * .31;
      moveDrag(draw ? extension : progress);
    }
    once('release', t, end, () => {
      endDrag(draw ? .69 : 1);
      if (draw) rememberAddedNote();
    });
    if (resize) fx.outline(guideRect(handle, 2), '#b56528');
    if (anchor && !resize) fx.outline(anchor, '#718d9e', true);
    const picked = draw && drag ? query('.melody-note.is-drawing') : noteElement();
    if ((notePan || !pan) && (!draw || t >= start)) fx.outline(guideRect(picked, 3), ink);
    if (t >= end) fx.mouse(fx.pointer());
  }

  function render(milliseconds: number) {
    if (disposed || !query('.melody-scroll')) return;
    const t = milliseconds / 1000, pulse = reduced.matches ? 0 : (t * 1.5) % 1;
    const allNotes = () => [...host.querySelectorAll<HTMLElement>('.melody-note')];
    if (!advanced) {
      renderBasics(t);
    } else if (stage === 'bpm' || stage === 'grid' || stage === 'tap') {
      once('panel', t, .8, () => click('.melody-tempo-button'));
      const panel = query('.melody-tempo-panel:not([hidden])');
      focus(stage === 'tap' && query('.tap-tempo-dialog') ? ['.tap-tempo-dialog'] : panel ? ['.melody-tempo-panel', '.melody-scroll', '.melody-tempo-dock'] : ['.melody-scroll', '.melody-tempo-dock']);
      if (stage === 'bpm') {
        fx.mouse(fly('.melody-tempo-input', t, .9), t > 1.4 && t < 2.2 || t > 6.2 && t < 7 ? 'left' : undefined);
        once('fast', t, 1.8, () => change('.melody-tempo-input', 180));
        once('closefast', t, 2.9, () => { click('.melody-tempo-button'); click('.song-play'); });
        once('stopfast', t, 5.8, () => click('.song-stop'));
        once('openslow', t, 6.1, () => click('.melody-tempo-button'));
        once('slow', t, 6.6, () => change('.melody-tempo-input', 60));
        once('closeslow', t, 7.6, () => { click('.melody-tempo-button'); click('.song-play'); });
      } else if (stage === 'grid') {
        fx.mouse(fly('.melody-tempo-grid', t, .9), pulse < .3 ? 'left' : undefined);
        [2, 3, 4].forEach((value, i) => once('grid' + i, t, 1.7 + i * 2.2, () => change('.melody-tempo-grid', value)));
        for (const n of allNotes()) { const r = guideRect(n); if (r) fx.band(r, '#9cb9a6', .12); }
      } else {
        once('tapopen', t, 1.6, () => click('.melody-tap-tempo'));
        for (let i = 0; i < 6; i++) once('keytap' + i, t, 2.8 + i * .5, () => document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true })));
        once('reset', t, 6.7, () => click('.tap-tempo-reset'));
        for (let i = 0; i < 5; i++) once('mousetap' + i, t, 7.8 + i * .6, () => click('.tap-tempo-pad'));
        once('apply', t, 12, () => click('.tap-tempo-apply'));
        if (t < 6.7) fx.keys(false, false, t >= 2.8 && t < 5.5 && (t - 2.8) % .5 < .17);
        fx.mouse(fly(t < 1.6 ? '.melody-tap-tempo' : t < 6.6 ? '.tap-tempo-pad' : t < 7.3 ? '.tap-tempo-reset' : t < 11.1 ? '.tap-tempo-pad' : '.tap-tempo-apply', t, 1), t >= 7.8 && t < 10.6 && (t - 7.8) % .6 < .17 || t > 12 && t < 12.3 ? 'left' : undefined);
        const p = guideCenter(query('.tap-tempo-display')); if (p && t > 3) fx.ring(p, 48 + pulse * 12, '#d6b16a');
      }
    } else if (stage === 'rolls' || stage === 'boundary') {
      focus(['.melody-scroll', '.melody-tempo-dock', '.melody-extend']);
      if (stage === 'rolls') { once('addroll', t, 2, () => click('.melody-extend')); fx.mouse(fly('.melody-extend', t, .7), t > 1.8 && t < 2.4 ? 'left' : undefined); }
      else {
        const target = query('.melody-tempo-marker:not([hidden])'), p = guideCenter(target);
        once('drag', t, 2, () => startDrag(target, p, p && { x: p.x, y: p.y + 100 }));
        if (t < 2) fx.mouse(p); else if (t < 5) moveDrag((t - 2) / 2.5);
        once('end', t, 5, () => endDrag());
      }
    } else focus(['.melody-scroll'], [], Math.max(0, .8 - t / 3));
  }
  return {
    enter, render, ready: () => !!query('.melody-canvas') && query<HTMLButtonElement>('.song-play')?.disabled === false,
    pause() { resumePlayback = ['暂停', '取消播放准备'].includes(query('.song-play')?.getAttribute('aria-label') ?? ''); stop(); if (!resumePlayback) sound.stopAll(); sound.cancelAudition(); },
    resume() { if (resumePlayback && query('.song-play')?.getAttribute('aria-label') === '播放') click('.song-play'); resumePlayback = false; },
    dispose() {
      if (disposed) return; disposed = true; shell.append(fx.layer); editor?.dispose(); fx.dispose();
      for (const [node, original] of captures) { node.setPointerCapture = original.set; node.releasePointerCapture = original.release; }
    },
  };
}
