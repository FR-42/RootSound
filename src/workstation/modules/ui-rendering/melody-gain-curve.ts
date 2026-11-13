import type { PhraseBody, PhraseGainPoint } from '../../contracts/phrase.ts';
import { phraseBarBeats, phraseBeatSeconds, phraseGainTimeline, phraseMeterBeatLength, phraseSecondsBeat, phraseTempoSpans } from '../../contracts/phrase-time.ts';
import { CURVE_LIMITS, gainAtTime, gainSegmentControls, isPedalCurve, MAX_GAIN_CURVE_POINTS, PERFORMANCE_CURVES, splitGainSegment, stepGainAtTime, type CurveKind } from '../../contracts/gain-curve.ts';
import './melody-gain-curve.css';

const labels = { gain: '音量增益', pitch: '音高偏移', velocity: '力度', sustain: '延音踏板', sostenuto: '选择性延音', soft: '弱音踏板' };

export function mountMelodyGainCurve(host: HTMLElement, options: {
  geometry(): { body: PhraseBody; start: number; scale: number; width: number; height: number } | undefined;
  points(kind: CurveKind): readonly PhraseGainPoint[] | undefined;
  preview(kind: CurveKind, points?: PhraseGainPoint[]): void;
  commit(kind: CurveKind, points: PhraseGainPoint[]): void;
  close(): void;
}) {
  const layer = document.createElement('div'); layer.className = 'melody-gain-curve'; layer.hidden = true;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); svg.append(path);
  const toolbar = document.createElement('div'); toolbar.className = 'melody-gain-toolbar';
  const value = document.createElement('output'); value.hidden = true;
  const picker = document.createElement('select'); picker.className = 'melody-curve-picker'; picker.setAttribute('aria-label', '演奏曲线');
  for (const kind of ['gain', ...PERFORMANCE_CURVES] as const) {
    const option = document.createElement('option'); option.value = kind; option.textContent = labels[kind]; picker.append(option);
  }
  const close = document.createElement('button'); close.type = 'button'; close.className = 'melody-curve-close';
  close.setAttribute('aria-label', '退出曲线编辑'); close.addEventListener('click', options.close);
  toolbar.append(picker, close); layer.append(svg, value, toolbar); host.append(layer);
  const handles = new Map<string, HTMLButtonElement>();
  let kind: CurveKind = 'gain', selected: number | undefined;
  let guides: PhraseGainPoint[] = [];
  let drag: { pointer: number; index: number; key: string; points: PhraseGainPoint[]; capture: HTMLButtonElement; x: number; y: number; moved: boolean } | undefined;
  let draft: PhraseGainPoint[] | undefined;

  picker.addEventListener('change', () => {
    finish(true);
    selected = undefined;
    kind = picker.value as CurveKind;
    paint();
  });

  const defaults = (body: PhraseBody): PhraseGainPoint[] => [{ beat: 0, db: 0 }, { beat: body.lengthBeats, db: 0 }];
  const range = (width: number) => width / 2 - Math.min(54, width / 8);
  const xAt = (db: number, width: number) => width / 2 + (isPedalCurve(kind) ? db * 2 - 1 : db / CURVE_LIMITS[kind]) * range(width);
  const gainLabel = (db: number) => isPedalCurve(kind) ? db ? '开启' : '关闭'
    : `${db > 0 ? '+' : ''}${Number(db.toFixed(1))}${kind === 'gain' ? ' dB' : kind === 'pitch' ? ' 半音' : '%'}`;
  const limitValue = (db: number) => isPedalCurve(kind) ? Number(db >= .5)
    : Math.max(-CURVE_LIMITS[kind], Math.min(CURVE_LIMITS[kind], Math.round(db * 10) / 10));

  function splitAt(body: PhraseBody, points: PhraseGainPoint[], beat: number) {
    const timeline = phraseGainTimeline(body, points), seconds = phraseBeatSeconds(body, beat);
    const right = points.findIndex(point => point.beat > beat);
    const index = right < 0 ? points.length : right;
    const db = isPedalCurve(kind) ? stepGainAtTime(timeline, seconds) : gainAtTime(timeline, seconds);
    if (isPedalCurve(kind) || index === 0 || index === points.length) points.splice(index, 0, { beat, db });
    else {
      freezeControls(points, timeline, index - 1, index);
      const split = splitGainSegment(timeline, index - 1, seconds);
      points[index - 1] = { ...points[index - 1]!, after: split.left };
      points[index] = { ...points[index]!, before: split.right };
      points.splice(index, 0, { beat, db: split.db, before: split.before, after: split.after });
    }
  }

  function freezeControls(points: PhraseGainPoint[], timeline: ReturnType<typeof phraseGainTimeline>, start: number, end: number) {
    for (let index = Math.max(0, start); index <= Math.min(points.length - 1, end); index++) {
      points[index] = { ...points[index]!,
        ...(index > 0 ? { before: gainSegmentControls(timeline, index - 1)[1] } : {}),
        ...(index < points.length - 1 ? { after: gainSegmentControls(timeline, index)[0] } : {}) };
    }
  }

  function startEdit(saved: readonly PhraseGainPoint[], body: PhraseBody, key: string) {
    const points = saved.length ? [...saved] : defaults(body);
    const guide = key.startsWith('guide:');
    const beat = guide ? Number(key.slice(6)) : points[Number(key)]?.beat;
    if (beat === undefined) return;
    if (guide) {
      if (points.length >= MAX_GAIN_CURVE_POINTS || points.some(point => Math.abs(point.beat - beat) < .001)) return;
      splitAt(body, points, beat);
    }
    if (!isPedalCurve(kind)) {
      const index = points.findIndex(point => point.beat === beat);
      const above = guides.filter(point => point.beat < beat && point.beat > (points[index - 1]?.beat ?? 0)).at(-1);
      const below = guides.find(point => point.beat > beat && point.beat < (points[index + 1]?.beat ?? body.lengthBeats));
      for (const anchor of [above, below]) {
        if (anchor && points.length < MAX_GAIN_CURVE_POINTS && !points.some(point => Math.abs(point.beat - anchor.beat) < .001)) splitAt(body, points, anchor.beat);
      }
      const target = points.findIndex(point => point.beat === beat);
      freezeControls(points, phraseGainTimeline(body, points), target - 1, target + 1);
    }
    return { points, index: points.findIndex(point => point.beat === beat) };
  }
  function paint() {
    const geometry = options.geometry(), points = options.points(kind);
    layer.hidden = !geometry || !points;
    if (!geometry || !points) return;
    const { body, start, scale, width, height } = geometry;
    if (width < 2 || height < 2) return;
    const saved = points.length ? points : defaults(body);
    const current = draft ?? saved;
    const timeline = phraseGainTimeline(body, current);
    const bottom = start + height / scale;
    const yAt = (seconds: number) => (seconds - start) * scale;
    const pedal = isPedalCurve(kind), at = pedal ? stepGainAtTime : gainAtTime;
    layer.classList.toggle('is-pedal', pedal);
    const commands: string[] = [];
    for (let index = 0; index + 1 < timeline.length; index++) {
      const from = timeline[index]!, to = timeline[index + 1]!;
      if (to.atSeconds < start || from.atSeconds >= bottom) continue;
      const y = yAt(from.atSeconds), end = yAt(to.atSeconds), span = (end - y) / 3;
      if (!commands.length) {
        const first = pedal && y > 0 ? 0 : from.db;
        commands.push(`M${xAt(first, width)} ${Math.min(0, y)} V${y} H${xAt(from.db, width)}`);
      }
      if (pedal) commands.push(`V${end} H${xAt(to.db, width)}`);
      else {
        const [a, b] = gainSegmentControls(timeline, index);
        commands.push(`C${xAt(a, width)} ${y + span} ${xAt(b, width)} ${end - span} ${xAt(to.db, width)} ${end}`);
      }
    }
    if (!commands.length) {
      commands.push(`M${xAt(at(timeline, start), width)} 0`);
      if (pedal && timeline.length === 1 && yAt(timeline[0]!.atSeconds) > 0 && timeline[0]!.atSeconds < bottom) {
        commands.push(`V${yAt(timeline[0]!.atSeconds)} H${xAt(timeline[0]!.db, width)}`);
      }
    }
    if (pedal) commands.push(`V${height} H${xAt(at(timeline, bottom), width)}`);
    else commands.push(`L${xAt(at(timeline, bottom), width)} ${height}`);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    path.setAttribute('d', commands.join(' '));
    const seen = new Set<string>();
    function paintHandle(point: PhraseGainPoint, y: number, key: string, active = false, guide = false) {
      let handle = handles.get(key);
      if (!handle) {
        handle = document.createElement('button'); handle.type = 'button'; handle.className = 'melody-gain-point'; handle.dataset.point = key;
        handle.addEventListener('pointerdown', event => {
          if (event.button !== 0) return;
          event.preventDefault(); event.stopPropagation();
          const live = options.points(kind), geom = options.geometry(); if (!live || !geom || drag) return;
          const edit = startEdit(live, geom.body, key); if (!edit?.points[edit.index]) return;
          selected = edit.index;
          drag = { ...edit, key, pointer: event.pointerId, capture: handle!, x: event.clientX, y: event.clientY, moved: false };
          handle!.focus({ preventScroll: true }); handle!.setPointerCapture?.(event.pointerId);
          paint();
        });
        handle.addEventListener('lostpointercapture', event => { if (drag?.pointer === event.pointerId) finish(false); });
        handle.addEventListener('keydown', event => editPoint(event, key));
        layer.append(handle); handles.set(key, handle);
      }
      seen.add(key);
      handle.style.left = `${xAt(point.db, width)}px`; handle.style.top = `${Math.max(8, Math.min(height - 8, y))}px`;
      handle.setAttribute('aria-label', `第 ${Number((point.beat + 1).toFixed(2))} 拍，${gainLabel(point.db)}`);
      handle.classList.toggle('is-active', active);
      handle.classList.toggle('is-guide', guide);
    }
    saved.forEach((point, index) => {
      const key = String(index), y = yAt(phraseBeatSeconds(body, point.beat));
      if (key !== drag?.key && point.beat <= body.lengthBeats && y >= -1e-7 && y <= height + 1e-7) {
        paintHandle(point, y, key, !drag && selected === index);
      }
    });
    if (!drag) {
      guides = [];
      const beatSize = phraseMeterBeatLength(body);
      let lastY = -Infinity, knotIndex = 0;
      for (const span of phraseTempoSpans(body)) {
        if (span.endSeconds <= start || span.startSeconds >= bottom || current.length >= MAX_GAIN_CURVE_POINTS) continue;
        const pixelsPerBeat = scale * 60 / span.tempoBpm;
        const bar = phraseBarBeats(body);
        const step = pedal && pixelsPerBeat * bar < 95 ? Math.max(bar, bar * Math.ceil(24 / (pixelsPerBeat * bar)))
          : beatSize * 2 ** Math.max(-7, Math.ceil(Math.log2(24 / (pixelsPerBeat * beatSize))));
        const origin = pedal ? span.startBeat - (span.gridOffsetBeats ?? 0) + (span.startBeat === 0 ? body.pickupBeats ?? 0 : 0) : 0;
        const from = Math.max(span.startBeat, phraseSecondsBeat(body, start - 25 / scale));
        const to = Math.min(span.endBeat, phraseSecondsBeat(body, bottom + 25 / scale));
        for (let cell = Math.ceil((from - origin) / step); origin + cell * step < to; cell++) {
          const beat = origin + cell * step, seconds = phraseBeatSeconds(body, beat), y = yAt(seconds);
          if (beat <= 0 || y - lastY < 21) continue;
          while (timeline[knotIndex] && timeline[knotIndex]!.atSeconds < seconds - 13 / scale) knotIndex++;
          if (timeline[knotIndex] && Math.abs(timeline[knotIndex]!.atSeconds - seconds) <= 13 / scale) continue;
          guides.push({ beat, db: at(timeline, seconds) });
          lastY = y;
        }
      }
    }
    for (const guide of guides) {
      const key = `guide:${guide.beat}`, seconds = phraseBeatSeconds(body, guide.beat);
      const y = yAt(seconds);
      if (key !== drag?.key && y >= 0 && y <= height - 8) paintHandle({ ...guide, db: at(timeline, seconds) }, y, key, false, true);
    }
    if (drag) {
      const point = (draft ?? drag.points)[drag.index]!;
      paintHandle(point, yAt(phraseBeatSeconds(body, point.beat)), drag.key, true);
    }
    for (const [key, handle] of handles) if (!seen.has(key)) { handle.remove(); handles.delete(key); }
    const activeKey = drag?.key ?? String(selected);
    const active = selected === undefined || !seen.has(activeKey) ? undefined : (draft ?? drag?.points ?? current)[selected];
    value.hidden = !active;
    if (active) {
      const x = xAt(active.db, width), y = yAt(phraseBeatSeconds(body, active.beat));
      value.textContent = gainLabel(active.db);
      value.style.left = `${Math.max(36, Math.min(width - 36, x))}px`;
      value.style.top = `${Math.max(5, Math.min(height - 24, y < 35 ? y + 14 : y - 30))}px`;
    }
  }
  function movedPoint(points: PhraseGainPoint[], index: number, beat: number, db: number, body: PhraseBody) {
    const point = points[index]!;
    const length = body.lengthBeats;
    const min = points[index - 1]?.beat ?? 0, max = Math.min(length, points[index + 1]?.beat ?? length);
    const room = max - min;
    const nextBeat = point.beat === 0 || point.beat === length || room <= 0 ? point.beat
      : Math.max(min + Math.min(.001, room / 3), Math.min(max - Math.min(.001, room / 3), beat));
    const nextDb = limitValue(db);
    const result = [...points];
    if (isPedalCurve(kind)) { result[index] = { beat: nextBeat, db: nextDb }; return result; }
    const valueShift = nextDb - point.db, limit = CURVE_LIMITS[kind];
    const fit = (value: number) => Math.max(-limit, Math.min(limit, value));
    const from = phraseBeatSeconds(body, point.beat), to = phraseBeatSeconds(body, nextBeat);
    const previous = points[index - 1], next = points[index + 1];
    const left = previous && phraseBeatSeconds(body, previous.beat), right = next && phraseBeatSeconds(body, next.beat);
    const leftRatio = left === undefined ? 1 : (to - left) / (from - left);
    const rightRatio = right === undefined ? 1 : (right - to) / (right - from);
    result[index] = { beat: nextBeat, db: nextDb,
      ...(point.before === undefined ? {} : { before: fit(point.db + valueShift + (point.before - point.db) * leftRatio) }),
      ...(point.after === undefined ? {} : { after: fit(point.db + valueShift + (point.after - point.db) * rightRatio) }) };
    if (previous?.after !== undefined) result[index - 1] = { ...previous, after: fit(previous.db + (previous.after - previous.db) * leftRatio) };
    if (next?.before !== undefined) result[index + 1] = { ...next, before: fit(next.db + (next.before - next.db) * rightRatio) };
    return result;
  }
  function editPoint(event: KeyboardEvent, key: string) {
    if (event.ctrlKey || event.metaKey || event.altKey || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const geometry = options.geometry(), saved = options.points(kind); if (!geometry || !saved || drag) return;
    if (event.key === 'Delete') {
      const index = Number(key);
      if (index > 0 && index < saved.length - 1) { selected = undefined; options.commit(kind, saved.filter((_, i) => i !== index)); }
      return;
    }
    const edit = startEdit(saved, geometry.body, key); if (!edit) return;
    const { points, index } = edit, point = points[index]!;
    selected = index;
    const step = isPedalCurve(kind) ? 1 : .5;
    const db = point.db + (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0);
    const beat = point.beat + (event.key === 'ArrowUp' ? -.25 : event.key === 'ArrowDown' ? .25 : 0);
    options.commit(kind, movedPoint(points, index, beat, db, geometry.body));
    handles.get(String(index))?.focus({ preventScroll: true });
  }
  const move = (event: PointerEvent) => {
    const active = drag, geometry = options.geometry(); if (!active || active.pointer !== event.pointerId || !geometry) return;
    if (!active.moved && Math.hypot(event.clientX - active.x, event.clientY - active.y) < 2) return;
    active.moved = true;
    const point = active.points[active.index]!, { body, width, scale } = geometry;
    const db = point.db + (event.clientX - active.x) * (isPedalCurve(kind) ? .5 : CURVE_LIMITS[kind]) / range(width);
    const beat = phraseSecondsBeat(body, phraseBeatSeconds(body, point.beat) + (event.clientY - active.y) / scale);
    draft = movedPoint(active.points, active.index, beat, db, body);
    options.preview(kind, draft); paint();
  };
  function finish(commit: boolean) {
    const active = drag; if (!active) return;
    const point = active.points[active.index]!;
    const geometry = options.geometry();
    const points = draft ?? (commit && isPedalCurve(kind) && geometry ? movedPoint(active.points, active.index, point.beat, 1 - point.db, geometry.body) : undefined);
    drag = undefined; draft = undefined;
    if (active.capture.hasPointerCapture?.(active.pointer)) active.capture.releasePointerCapture(active.pointer);
    if (!commit || !points) selected = undefined;
    if (commit && points) options.commit(kind, points);
    else if (points) options.preview(kind);
    paint();
  }
  const up = (event: PointerEvent) => { if (drag?.pointer === event.pointerId) finish(true); };
  const cancel = (event: PointerEvent) => { if (drag?.pointer === event.pointerId) finish(false); };
  layer.addEventListener('dblclick', event => {
    if ((event.target as HTMLElement).closest('button, select') || drag) return;
    const geometry = options.geometry(), saved = options.points(kind); if (!geometry || !saved) return;
    const { body, start, scale, width } = geometry, box = layer.getBoundingClientRect();
    const points = saved.length ? [...saved] : defaults(body);
    const beat = phraseSecondsBeat(body, start + (event.clientY - box.top) / scale);
    if (points.length >= MAX_GAIN_CURVE_POINTS || beat <= 0 || beat >= body.lengthBeats || points.some(point => Math.abs(point.beat - beat) < .001)) return;
    splitAt(body, points, beat);
    const index = points.findIndex(point => point.beat === beat);
    const direction = (event.clientX - box.left - width / 2) / range(width);
    const db = isPedalCurve(kind) ? (direction + 1) / 2 : direction * CURVE_LIMITS[kind];
    selected = index;
    options.commit(kind, movedPoint(points, index, beat, db, body));
  });
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', cancel);
  return { layer, paint, finish, clearSelection() { selected = undefined; }, dispose() {
    finish(false); layer.remove(); document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', cancel);
  } };
}
