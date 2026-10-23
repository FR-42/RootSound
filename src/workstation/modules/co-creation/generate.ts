import type { ContentRecord } from '../../contracts/content.ts';
import type { PhraseBody, PhraseNote, PhrasePart } from '../../contracts/phrase.ts';
import type { TimbreBody } from '../../contracts/timbre.ts';
import { createPhraseReferenceAdapter, readPhraseBody } from '../phrase/public.ts';
import { createTimbreReferenceAdapter, readEditableTimbreBody, readTimbreBody } from '../timbre/public.ts';
import { createSampleReferenceAdapter } from '../sampling/public.ts';

export type IdeaDirection = 'light' | 'calm' | 'airy';
export type IdeaGraph = { phrase: ContentRecord; sounds: ContentRecord[]; assets?: ContentRecord[] };
export type GenerateIdeaInput = { seed?: IdeaGraph; direction: IdeaDirection; hasArrangement: boolean; round: number };

const MAX_PARTS = 8;
const MAX_NOTES = 512;
const MIN_NOTE_BEATS = 1 / 1024;
const TITLES: Record<IdeaDirection, string> = { light: '轻快', calm: '沉静', airy: '空灵' };

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function id(): string { return crypto.randomUUID(); }
function title(record: ContentRecord): void {
  if (typeof record.id !== 'string' || !record.id.trim() || typeof record.name !== 'string' || !record.name.trim()
    || !Number.isSafeInteger(record.revision) || record.revision < 1) throw new Error('这份素材的名称、身份或修订无效，原内容已保留。');
}
function voice(direction: IdeaDirection, round: number, role: 'melody' | 'bass' | 'bed'): TimbreBody {
  const variation = round % 3;
  let body: TimbreBody;
  if (direction === 'light') body = { model: 'basic-synth', version: 1, character: 'bright', attackSeconds: 0.006 + variation * 0.002,
    releaseSeconds: 0.16 + variation * 0.02, level: 0.46 };
  else if (direction === 'calm') body = { model: 'basic-synth', version: 1, character: 'warm', attackSeconds: 0.13 + variation * 0.02,
    releaseSeconds: 0.72 + variation * 0.08, level: 0.38 };
  else body = { model: 'basic-synth', version: 1, character: 'clear', attackSeconds: 0.3 + variation * 0.035,
    releaseSeconds: 1.5 + variation * 0.2, level: 0.33 };
  if (role === 'bass') body = { ...body, character: 'warm', attackSeconds: Math.min(body.attackSeconds, 0.12),
    releaseSeconds: Math.min(body.releaseSeconds, 0.6), level: body.level * 0.6 };
  if (role === 'bed') body = { ...body, attackSeconds: Math.min(2, body.attackSeconds + 0.12), level: body.level * 0.42 };
  return readTimbreBody(body);
}
function sound(name: string, body: TimbreBody): ContentRecord {
  return { id: id(), revision: 1, kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1, name, dependencies: [], body };
}
function freshMelody(round: number, timbreId: string): PhraseBody {
  const patterns = [[0, 4, 7, 9, 7, 4, 2, 0], [0, 4, 7, 12, 9, 7, 4, 0], [0, 2, 4, 7, 9, 7, 2, 0]];
  const pattern = patterns[round % patterns.length]!;
  const starts = [0, 0.75, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5];
  const durations = [0.5, 0.5, 0.75, 0.5, 0.75, 0.75, 0.5, 1.25];
  return { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 112, lengthBeats: 8,
    parts: [{ id: id(), name: '主旋律', timbreId, notes: pattern.map((step, index) => ({ id: id(), startBeat: starts[index]!,
      durationBeats: durations[index]!, frequencyHz: 220 * 2 ** (step / 12), velocity: index === 0 || index === 7 ? 0.76 : 0.66 })) }] };
}
/** Keeps the physical root, shifting octaves only; it does not infer a key or quantize the user's pitches. */
function octave(reference: number, minimum: number, maximum: number): number {
  let value = reference;
  while (value > maximum) value /= 2;
  while (value < minimum) value *= 2;
  return value;
}
function accompaniment(body: PhraseBody, direction: IdeaDirection, capacity: number, role: 'bass' | 'bed', reference: number): PhraseNote[] {
  const notes: PhraseNote[] = [];
  const step = role === 'bass' ? direction === 'light' ? 1 : direction === 'calm' ? 4 : 8 : direction === 'airy' ? 8 : 4;
  const gate = role === 'bass' ? direction === 'light' ? 0.38 : direction === 'calm' ? 3.4 : 7 : direction === 'light' ? 1.3 : direction === 'calm' ? 3.5 : 7.5;
  const base = role === 'bass' ? octave(reference, 20, 180) : octave(reference, 110, 440);
  const frequencies = role === 'bass' ? [base] : [base, base * 1.5];
  for (let startBeat = 0; startBeat < body.lengthBeats && notes.length < capacity; startBeat += step) {
    const remaining = body.lengthBeats - startBeat; if (remaining < MIN_NOTE_BEATS) break;
    for (const frequencyHz of frequencies) {
      if (notes.length >= capacity) break;
      notes.push({ id: id(), startBeat, durationBeats: Math.min(gate, remaining), frequencyHz, velocity: role === 'bass' ? 0.5 : 0.4 });
    }
  }
  return notes;
}

/** Local, explicit musical rules only. No store, device, network or hidden seed mutation. */
export function generateIdea(input: GenerateIdeaInput): IdeaGraph {
  const { seed, direction, hasArrangement, round } = input;
  if (!Object.hasOwn(TITLES, direction) || typeof hasArrangement !== 'boolean' || !Number.isSafeInteger(round) || round < 0) {
    throw new Error('请选择一个支持的创作方向，原有想法已保留。');
  }
  const sounds: ContentRecord[] = [];
  const assets = new Map<string, ContentRecord>();
  let body: PhraseBody; let name: string;
  if (seed) {
    title(seed.phrase); createPhraseReferenceAdapter().slots(seed.phrase);
    body = readPhraseBody(seed.phrase.body); name = seed.phrase.name;
    const sourceSounds = new Map<string, ContentRecord>();
    for (const source of seed.sounds) {
      if (sourceSounds.has(source.id)) throw new Error('声音素材身份重复，原有想法已保留。');
      sourceSounds.set(source.id, source);
    }
    const mapped = new Map<string, string>();
    for (const part of body.parts) {
      const existing = mapped.get(part.timbreId);
      if (existing) { part.timbreId = existing; continue; }
      const source = sourceSounds.get(part.timbreId);
      if (!source) throw new Error('这段乐句缺少使用的声音，请先恢复素材再继续。');
      title(source); const soundAdapter = createTimbreReferenceAdapter(); soundAdapter.slots(source);
      const original = readEditableTimbreBody(source.body);
      let next: ContentRecord;
      if (original.model === 'sample-instrument') {
        const asset = assets.get(original.sampleId) ?? seed.assets?.find(item => item.id === original.sampleId);
        if (!asset) throw new Error('这份采样声音缺少原始音频，原有手工设置已保留。');
        if (!assets.has(asset.id)) { title(asset); createSampleReferenceAdapter().slots(asset); assets.set(asset.id, asset); }
        soundAdapter.validateTarget!(source, 'sample', asset);
        // A direction may add accompaniment; it never erases a hand-shaped sampled instrument.
        next = { ...source, id: id(), revision: 1, dependencies: [...source.dependencies], body: original };
      } else next = sound(source.name, voice(direction, round, 'melody'));
      mapped.set(source.id, next.id); sounds.push(next); part.timbreId = next.id;
    }
  } else {
    const melody = sound('旋律的声音', voice(direction, round, 'melody')); sounds.push(melody);
    body = freshMelody(round, melody.id); name = `${TITLES[direction]}的小小灵感`;
  }
  if (!hasArrangement) {
    const first = body.parts.flatMap(part => part.notes).sort((a, b) => a.startBeat - b.startBeat)[0];
    const reference = first?.frequencyHz ?? 220;
    let remaining = MAX_NOTES - body.parts.reduce((sum, part) => sum + part.notes.length, 0);
    for (const role of ['bass', 'bed'] as const) {
      if (body.parts.length >= MAX_PARTS || remaining <= 0) break;
      const notes = accompaniment(body, direction, remaining, role, reference); if (!notes.length) continue;
      const name = role === 'bass' ? '低音' : '柔和的铺底'; const next = sound(name, voice(direction, round, role));
      const part: PhrasePart = { id: id(), name, timbreId: next.id, notes };
      sounds.push(next); body.parts.push(part); remaining -= notes.length;
    }
  }
  const phrase: ContentRecord = { id: id(), revision: 1, kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1,
    name, dependencies: [...new Set(body.parts.map(part => part.timbreId))], body: readPhraseBody(body) };
  createPhraseReferenceAdapter().slots(phrase);
  for (const next of sounds) createTimbreReferenceAdapter().slots(next);
  return { ...clone({ phrase, sounds }), ...(assets.size ? { assets: [...assets.values()] } : {}) };
}
