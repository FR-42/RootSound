import type { ContentRecord, Draft, JsonValue, MaterialLibrary, SaveConfirmation } from '../../contracts/content.ts';
import type { ReferenceAdapter } from '../../contracts/references.ts';
import type { BasicWaveform, PlayableNotePlan, SoundPlan } from '../../contracts/sound.ts';
import type { EditableTimbreBody, SampleTimbreBody, SynthesizerBody, TimbreBody, TimbreEditorPort, TimbrePlaybackPort } from '../../contracts/timbre.ts';
import { readSynthesizerBody, synthesisPlan, timbrePresets } from './synthesis.ts';
import { createSpectralAudio, readSpectralTimbreBody, spectralTimbreBody, type SpectralAudio } from './spectral.ts';
export { createSpectralAudio, readSpectralPatch, spectralTimbreBody, readSpectralTimbreBody } from './spectral.ts';
export type { SpectralAudio, SpectralWorkerFactory } from './spectral.ts';
export type { SpectralPatch, SpectralTimbreBody } from '../../contracts/timbre.ts';
export { readSynthesizerBody, synthesisFromBasic, timbrePresets, previewTimbrePreset } from './synthesis.ts';
export type { SynthesizerBody, TimbrePreset } from '../../contracts/timbre.ts';
import type { SampleAudioPort } from '../../contracts/sampling.ts';
import { readSampleBody } from '../sampling/public.ts';

export type { TimbreBody, SampleTimbreBody, EditableTimbreBody, TimbreEditorPort, TimbrePlaybackPort, TimbreView } from '../../contracts/timbre.ts';

const KIND = 'rootsound.timbre';
const OWNER = 'timbre';

/** Pure, independent voice for a newly captured melody; creating it does not write any store. */
export function prepareBasicTimbre(name = '旋律的声音'): ContentRecord {
  if (typeof name !== 'string' || !name.trim() || name.length > 4096) throw new Error('请给旋律的声音起一个有效名称。');
  return { id: crypto.randomUUID(), kind: KIND, owner: OWNER, schemaVersion: 1, revision: 1,
    name: name.trim(), dependencies: [], body: readTimbreBody({ model: 'basic-synth', version: 1, character: 'warm',
      attackSeconds: 0.015, releaseSeconds: 0.12, level: 0.65 }) };
}

/** Local synthesized starting voices, not sampled acoustic-instrument emulations. */
export function prepareMelodyTimbres(): ContentRecord[] {
  const patches: Array<{ key: string; name: string; attackSeconds: number; decaySeconds: number; sustain: number; releaseSeconds: number;
    cutoff: number; resonance?: number; pitch?: SynthesizerBody['pitch'];
    sources: Array<{ waveform: BasicWaveform; semitones: number; level: number; detuneCents?: number }> }> = [
    { key: 'piano', name: '钢琴', attackSeconds: .0025, decaySeconds: 1.35, sustain: .035, releaseSeconds: .22,
      cutoff: 4200, sources: [
        { waveform: 'sine', semitones: 0, level: .66 }, { waveform: 'triangle', semitones: 0, level: .18 },
        { waveform: 'sine', semitones: 12, level: .125 }, { waveform: 'sine', semitones: 24, level: .035 },
      ] },
    { key: 'flute', name: '长笛', attackSeconds: .045, decaySeconds: .12, sustain: .92, releaseSeconds: .14,
      cutoff: 5000, sources: [
        { waveform: 'sine', semitones: 0, level: .84 }, { waveform: 'sine', semitones: 12, level: .1 },
        { waveform: 'noise', semitones: 0, level: .025 }, { waveform: 'triangle', semitones: 0, level: .035 },
      ] },
    { key: 'bass-drum', name: '底鼓', attackSeconds: .0015, decaySeconds: .34, sustain: 0, releaseSeconds: .09,
      cutoff: 1700, pitch: { semitones: 19, seconds: .085 }, sources: [
        { waveform: 'sine', semitones: -24, level: .9 }, { waveform: 'triangle', semitones: -12, level: .065 },
        { waveform: 'noise', semitones: 0, level: .035 },
      ] },
    { key: 'kick', name: '踢', attackSeconds: .0005, decaySeconds: .2, sustain: 0, releaseSeconds: .045,
      cutoff: 4600, pitch: { semitones: 32, seconds: .035 }, sources: [
        { waveform: 'sine', semitones: -24, level: .8 }, { waveform: 'triangle', semitones: -12, level: .12 },
        { waveform: 'noise', semitones: 0, level: .08 },
      ] },
    { key: 'strings', name: '弦乐', attackSeconds: .13, decaySeconds: .24, sustain: .83, releaseSeconds: .48,
      cutoff: 3600, sources: [
        { waveform: 'sawtooth', semitones: 0, detuneCents: -7, level: .45 },
        { waveform: 'sawtooth', semitones: 0, detuneCents: 7, level: .4 },
        { waveform: 'triangle', semitones: 12, level: .15 },
      ] },
    { key: 'trumpet', name: '小号', attackSeconds: .025, decaySeconds: .16, sustain: .72, releaseSeconds: .12,
      cutoff: 4200, resonance: .35, pitch: { semitones: -.7, seconds: .065 }, sources: [
        { waveform: 'sawtooth', semitones: 0, level: .54 }, { waveform: 'triangle', semitones: 0, level: .22 },
        { waveform: 'square', semitones: 12, level: .12 }, { waveform: 'sine', semitones: 0, level: .12 },
      ] },
    { key: 'guitar', name: '吉他', attackSeconds: .001, decaySeconds: .8, sustain: .015, releaseSeconds: .18,
      cutoff: 3500, sources: [
        { waveform: 'triangle', semitones: 0, level: .45 }, { waveform: 'sine', semitones: 0, level: .395 },
        { waveform: 'triangle', semitones: 12, level: .13 }, { waveform: 'noise', semitones: 0, level: .025 },
      ] },
  ];
  return patches.map(patch => ({ id: crypto.randomUUID(), kind: KIND, owner: OWNER, schemaVersion: 1, revision: 1,
    name: patch.name, dependencies: [], body: readSynthesizerBody({ model: 'synthesizer', version: 1,
      sources: patch.sources.map((source, index) => ({ ...source, id: `rootsound.melody.${patch.key}.v1:${index}`,
        enabled: true, detuneCents: source.detuneCents ?? 0 })),
      attackSeconds: patch.attackSeconds, decaySeconds: patch.decaySeconds, sustain: patch.sustain,
      releaseSeconds: patch.releaseSeconds, level: .65,
      filter: { enabled: true, type: 'lowpass', frequencyHz: patch.cutoff, resonance: patch.resonance ?? .1 },
      pitch: patch.pitch ?? { semitones: 0, seconds: .12 } }) }));
}

/** The manager need not know whether this owner uses synthesis or samples. */
export function createTimbreReferenceAdapter(): ReferenceAdapter {
  function validate(record: ContentRecord | Draft): void {
    if (record.kind !== KIND || record.owner !== OWNER || record.schemaVersion !== 1) {
      throw new Error('这份声音的格式或引用暂不支持，原内容已保留。');
    }
    const body = readEditableTimbreBody(record.body); const expected = body.model === 'sample-instrument' ? [body.sampleId] : [];
    if (record.dependencies.length !== expected.length || expected.some(id => !record.dependencies.includes(id))) throw new Error('声音的采样引用与依赖记录不一致。');
  }
  return { kind: KIND,
    slots(record) { validate(record); const body = readEditableTimbreBody(record.body); return body.model === 'sample-instrument' ? [{ id: 'sample', targetId: body.sampleId, label: '原始采样' }] : []; },
    validateTarget(record, slotId, target) {
      validate(record); const body = readEditableTimbreBody(record.body);
      if (body.model !== 'sample-instrument' || slotId !== 'sample' || target.kind !== 'rootsound.sample' || target.owner !== 'sampling' || target.schemaVersion !== 1 || target.dependencies.length) throw new Error('采样音色需要当前支持的原始采样。');
      const sample = readSampleBody(target.body);
      if (body.endSeconds > sample.decoded.durationSeconds + 1e-9) throw new Error('音色裁切超出原始采样长度。');
    },
    replace(record, replacements) {
      validate(record); const body = readEditableTimbreBody(record.body);
      if (!replacements.length) return { body, dependencies: body.model === 'sample-instrument' ? [body.sampleId] : [] };
      if (body.model !== 'sample-instrument' || replacements.length !== 1 || replacements[0]!.slotId !== 'sample' || typeof replacements[0]!.targetId !== 'string' || !replacements[0]!.targetId.trim()) throw new Error('这份声音没有可替换的素材位置。');
      body.sampleId = replacements[0]!.targetId; return { body, dependencies: [body.sampleId] };
    },
  };
}

/** This portable file contains one basic sound; song/project packaging is separate. */
interface SoundFile {
  format: 'RootSoundSound';
  version: 1 | 2 | 3;
  name: string;
  timbre: Exclude<EditableTimbreBody, SampleTimbreBody>;
}

function readSoundFile(text: string): SoundFile {
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error('声音文件损坏，未改变当前声音。'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('这不是支持的声音文件。');
  }
  const file = value as Record<string, unknown>;
  const supported = ['format', 'version', 'name', 'timbre'];
  if (Object.keys(file).some(key => !supported.includes(key))) {
    throw new Error('声音文件包含尚不支持的设置或外部依赖，未改变当前声音。');
  }
  if (file.format !== 'RootSoundSound' || file.version !== 1 && file.version !== 2 && file.version !== 3
    || typeof file.name !== 'string' || !file.name.trim()) {
    throw new Error('声音文件格式、版本或名称无效，未改变当前声音。');
  }
  return { format: 'RootSoundSound', version: file.version, name: file.name,
    timbre: file.version === 1 ? readTimbreBody(file.timbre as JsonValue) : file.version === 2
      ? readSynthesizerBody(file.timbre as JsonValue) : readSpectralTimbreBody(file.timbre as JsonValue) };
}

/** One independent, portable tone; parsing never stores data or renders audio. */
export function prepareImportedTimbre(text: string, name?: string): ContentRecord {
  if (typeof text !== 'string' || new TextEncoder().encode(text).byteLength > 4 * 1024 * 1024) throw new Error('音色文件为空或超过当前4 MiB导入容量。');
  const source = text.startsWith('\ufeff') ? text.slice(1) : text;
  let parsed: unknown;
  try { parsed = JSON.parse(source); } catch { throw new Error('音色文件损坏，未改变资料。'); }
  const spectral = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    && (parsed as Record<string, unknown>).format === 'RootSoundSpectralPatch';
  const file = spectral ? undefined : readSoundFile(source);
  const body = spectral ? spectralTimbreBody(parsed) : file!.timbre;
  const title = (name ?? (spectral ? body.model === 'spectral-synth' ? body.patch.name : '' : file!.name)).trim();
  if (!title || title.length > 4096) throw new Error('音色名称无效或过长。');
  return { id: crypto.randomUUID(), kind: KIND, owner: OWNER, schemaVersion: 1, revision: 1,
    name: title, dependencies: [], body };
}

export function readTimbreBody(body: JsonValue): TimbreBody {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('这份内容不是可编辑的音色。');
  const supported = ['model', 'version', 'character', 'attackSeconds', 'releaseSeconds', 'level'];
  if (Object.keys(body).some(key => !supported.includes(key))) throw new Error('这份音色包含尚不支持的设置。原内容已保留。');
  const { model, version, character, attackSeconds, releaseSeconds, level } = body;
  if (model !== 'basic-synth' || version !== 1 ||
    (character !== 'warm' && character !== 'clear' && character !== 'bright') ||
    typeof attackSeconds !== 'number' || !Number.isFinite(attackSeconds) || attackSeconds < 0 || attackSeconds > 2 ||
    typeof releaseSeconds !== 'number' || !Number.isFinite(releaseSeconds) || releaseSeconds < 0.01 || releaseSeconds > 4 ||
    typeof level !== 'number' || !Number.isFinite(level) || level < 0 || level > 1) {
    throw new Error('这份音色使用了当前验证版尚不支持的设置。原内容已保留。');
  }
  return { model, version, character, attackSeconds, releaseSeconds, level };
}

export function readSampleTimbreBody(value: JsonValue): SampleTimbreBody {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('这份内容不是采样音色。');
  const allowed = ['model', 'version', 'sampleId', 'startSeconds', 'endSeconds', 'rootFrequencyHz', 'attackSeconds', 'releaseSeconds', 'level'];
  if (value.version === 2) allowed.push('loop');
  if (Object.keys(value).length !== allowed.length || allowed.some(key => !Object.hasOwn(value, key))) throw new Error('采样音色包含缺失或尚不支持的设置。');
  const finite = (input: JsonValue | undefined, minimum: number, maximum: number): input is number => typeof input === 'number' && Number.isFinite(input) && input >= minimum && input <= maximum;
  if (value.model !== 'sample-instrument' || value.version !== 1 && value.version !== 2 || typeof value.sampleId !== 'string' || !value.sampleId.trim()
    || !finite(value.startSeconds, 0, 120) || !finite(value.endSeconds, 0, 120) || value.endSeconds <= value.startSeconds
    || !finite(value.rootFrequencyHz, 20, 5000) || !finite(value.attackSeconds, 0, 2) || !finite(value.releaseSeconds, 0.01, 4) || !finite(value.level, 0, 1)) throw new Error('采样音色的范围、原始音高或包络无效。');
  let loop: SampleTimbreBody['loop'];
  if (value.version === 2) {
    const input = value.loop;
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== 2
      || !finite(input.startSeconds, value.startSeconds, value.endSeconds) || !finite(input.endSeconds, value.startSeconds, value.endSeconds) || input.endSeconds <= input.startSeconds) throw new Error('循环范围需要在播放范围之内，结束晚于开始。');
    loop = { startSeconds: input.startSeconds, endSeconds: input.endSeconds };
  }
  return { model: 'sample-instrument', version: value.version, sampleId: value.sampleId, startSeconds: value.startSeconds, endSeconds: value.endSeconds,
    rootFrequencyHz: value.rootFrequencyHz, attackSeconds: value.attackSeconds, releaseSeconds: value.releaseSeconds, level: value.level, ...(loop ? { loop } : {}) };
}
export function readEditableTimbreBody(value: JsonValue): EditableTimbreBody {
  if (value && typeof value === 'object' && !Array.isArray(value) && value.model === 'spectral-synth') return readSpectralTimbreBody(value);
  if (value && typeof value === 'object' && !Array.isArray(value) && value.model === 'synthesizer') return readSynthesizerBody(value);
  return value && typeof value === 'object' && !Array.isArray(value) && value.model === 'sample-instrument' ? readSampleTimbreBody(value) : readTimbreBody(value);
}

function createReader(library: MaterialLibrary) {
  const samples = new Map<string, { revision: number; name: string; durationSeconds: number }>();
  function sample(id: string) {
    const header = library.readContentInfo(id);
    if (!header || header.kind !== 'rootsound.sample' || header.owner !== 'sampling' || header.schemaVersion !== 1 || header.dependencies.length) throw new Error('音色引用的原始采样不存在或暂不支持。');
    const cached = samples.get(id); if (cached?.revision === header.revision) return cached;
    const record = library.readContent(id)!; const body = readSampleBody(record.body);
    const metadata = { revision: header.revision, name: header.name, durationSeconds: body.decoded.durationSeconds }; samples.set(id, metadata); return metadata;
  }
  const adapter = createTimbreReferenceAdapter();
  function validate(record: ContentRecord | Draft): EditableTimbreBody {
    adapter.slots(record); const body = readEditableTimbreBody(record.body);
    if (body.model === 'sample-instrument' && body.endSeconds > sample(body.sampleId).durationSeconds + 1e-9) throw new Error('音色裁切超出原始采样长度。');
    return body;
  }
  return { sample, validate };
}

/** Timbre algorithms remain here; the runtime releases short notes along their actual attack. */
function validateNote(note: SoundPlan['note']): void {
  if (!note || Object.keys(note).some(key => !['frequencyHz', 'holdSeconds', 'velocity'].includes(key))
    || !Number.isFinite(note.frequencyHz) || note.frequencyHz < 1 || note.frequencyHz > 10000
    || !Number.isFinite(note.holdSeconds) || note.holdSeconds <= 0 || note.holdSeconds > 120
    || !Number.isFinite(note.velocity) || note.velocity < 0 || note.velocity > 1) {
    throw new Error('这个音符的音高、时长或力度超出当前声音支持的范围。');
  }
}
function soundPlan(body: TimbreBody, note: SoundPlan['note']): SoundPlan {
  validateNote(note);
  const sources: SoundPlan['sources'] = body.character === 'warm'
    ? [{ waveform: 'sine', frequencyRatio: 1, level: 0.8 }, { waveform: 'triangle', frequencyRatio: 1, level: 0.2 }]
    : body.character === 'clear'
      ? [{ waveform: 'sine', frequencyRatio: 1, level: 0.8 }, { waveform: 'sine', frequencyRatio: 2, level: 0.2 }]
      : [{ waveform: 'triangle', frequencyRatio: 1, level: 0.7 }, { waveform: 'sawtooth', frequencyRatio: 1, level: 0.3 }];
  return {
    kind: 'basic-synth', version: 1, sources,
    envelope: { attackSeconds: body.attackSeconds, releaseSeconds: body.releaseSeconds },
    note: { frequencyHz: note.frequencyHz, holdSeconds: note.holdSeconds, velocity: note.velocity },
    level: body.level,
  };
}

function playable(body: EditableTimbreBody, note: SoundPlan['note'], sampleAudio?: SampleAudioPort, spectralAudio?: SpectralAudio): PlayableNotePlan {
  if (body.model === 'spectral-synth') {
    validateNote(note);
    if (!spectralAudio) throw new Error('精细音色尚未连接后台声音准备。');
    return spectralAudio.plan(body, note);
  }
  if (body.model === 'synthesizer') { validateNote(note); return synthesisPlan(body, note); }
  if (body.model === 'basic-synth') return soundPlan(body, note);
  validateNote(note);
  if (!sampleAudio) throw new Error('采样声音尚未连接原始音频，请先准备声音。');
  const source = sampleAudio.readPrepared(body.sampleId);
  if (source.id !== body.sampleId) throw new Error('准备的声音与原始采样身份不一致，请重新载入。');
  if (body.endSeconds > source.audio.channels[0]!.length / source.audio.sampleRate + 1e-9) throw new Error('音色裁切超出解码后的原始采样长度。');
  const playbackRate = note.frequencyHz / body.rootFrequencyHz;
  if (playbackRate < 1 / 256 || playbackRate > 256) throw new Error('这个音高与原始采样相差过大，请调整原始音高或使用较近的音区。');
  return { kind: 'sample', version: 1, source: { id: source.id, revision: source.revision, audio: source.audio },
    startSeconds: body.startSeconds, endSeconds: body.endSeconds, playbackRate,
    envelope: { attackSeconds: body.attackSeconds, releaseSeconds: body.releaseSeconds }, note: { ...note }, level: body.level, ...(body.loop ? { loop: { ...body.loop } } : {}) };
}
function savedSounds(library: MaterialLibrary, draftId?: string): ContentRecord[] {
  const items = draftId && library.listContentInfoForDraft ? library.listContentInfoForDraft(draftId) : library.listContentInfo();
  return items.filter(content => content.kind === KIND).map(content => library.readContent(content.id)!);
}
export function createTimbrePlayback(library: MaterialLibrary, sampleAudio?: SampleAudioPort, spectralAudio: SpectralAudio = createSpectralAudio()): TimbrePlaybackPort {
  const reader = createReader(library);
  const bodies = new Map<string, { revision: number; body: EditableTimbreBody }>();
  function readSaved(id: string) {
    const content = library.readContent(id);
    if (!content) throw new Error('引用的声音不存在，原内容已保留。');
    return { content, body: reader.validate(content) };
  }
  function planBody(id: string): EditableTimbreBody {
    const header = library.readContentInfo(id); const old = bodies.get(id);
    if (!header || header.kind !== KIND || header.owner !== OWNER || header.schemaVersion !== 1) { bodies.delete(id); throw new Error('引用的声音不存在或格式不支持，原内容已保留。'); }
    if (old?.revision === header.revision) { bodies.delete(id); bodies.set(id, old); return old.body; }
    const body = readSaved(id).body;
    if (bodies.size >= 128) bodies.delete(bodies.keys().next().value!);
    bodies.set(id, { revision: header.revision, body }); return body;
  }
  return {
    listSaved: () => savedSounds(library),
    readSaved,
    async prepareForSaved(id, notes) {
      const before = readSaved(id); const body = before.body;
      if (body.model === 'spectral-synth') {
        await spectralAudio.prepare(body, notes ?? [{ frequencyHz: 220, holdSeconds: Math.max(1, body.attackSeconds + .1), velocity: .7 }]);
        const after = readSaved(id);
        if (after.content.revision !== before.content.revision || JSON.stringify(after.body) !== JSON.stringify(body)) throw new Error('准备期间声音发生变化，请重试。');
        return;
      }
      if (body.model !== 'sample-instrument') return;
      if (!sampleAudio) throw new Error('采样声音尚未连接原始音频。');
      await sampleAudio.prepare([body.sampleId]);
      const after = readSaved(id);
      if (after.content.revision !== before.content.revision || JSON.stringify(after.body) !== JSON.stringify(body)) throw new Error('准备期间声音发生变化，请重试。');
    },
    planForSaved(contentId, note) {
      return playable(planBody(contentId), note, sampleAudio, spectralAudio);
    },
  };
}

/** Domain operations use the common custody port, never its internal objects. */
export function createTimbreEditor(library: MaterialLibrary, sampleAudio?: SampleAudioPort, spectralAudio: SpectralAudio = createSpectralAudio()): TimbreEditorPort {
  const reader = createReader(library);
  let generation = 0;
  let lastCreated: { sampleId: string; revision: number; draft: Draft } | undefined;
  const drafts = library.listDrafts().filter(d => d.kind === KIND && d.schemaVersion === 1);
  let active: string;
  if (drafts.length) {
    active = drafts[drafts.length - 1]!.id;
    reader.validate(drafts[drafts.length - 1]!);
  } else {
    const sounds = savedSounds(library).filter(c => c.schemaVersion === 1);
    active = sounds.length
      ? library.createDraft({ sourceId: sounds[sounds.length - 1]!.id }).id
      : fresh().id;
  }

  function fresh(): Draft {
    return library.createDraft({
      kind: KIND, schemaVersion: 1, owner: OWNER, name: '我的第一个声音', dependencies: [],
      body: { model: 'basic-synth', version: 1, character: 'warm', attackSeconds: 0.025, releaseSeconds: 0.55, level: 0.65 },
    });
  }
  function current(): Draft {
    const draft = library.readDraft(active);
    if (!draft) throw new Error('当前编辑稿已不存在，请重新打开音色。');
    return draft;
  }
  function modify(change: Partial<EditableTimbreBody>): void {
    const draft = current();
    const body = readEditableTimbreBody({ ...reader.validate(draft), ...change });
    const dependencies = body.model === 'sample-instrument' ? [body.sampleId] : [];
    reader.validate({ ...draft, body, dependencies });
    generation++; library.updateDraft(active, { body, dependencies }, { remember: true, expected: draft });
  }
  function changed(draft: Draft): boolean {
    const source = draft.sourceId ? library.readContent(draft.sourceId) : undefined;
    return !source || source.name !== draft.name || JSON.stringify(source.body) !== JSON.stringify(draft.body);
  }
  function travel(direction: 'undo' | 'redo'): void {
    const draft = current(); const history = library.readDraftHistory(draft.id);
    const target = (direction === 'undo' ? history.past : history.future).at(-1); if (!target) return;
    if (!target.transactionId) reader.validate({ ...draft, ...target });
    library.travelDraft(active, direction, draft); generation++;
  }

  return {
    read() {
      const draft = current();
      const body = reader.validate(draft);
      let sample: { name: string; durationSeconds: number; waveform: readonly number[]; ready: boolean } | undefined;
      if (body.model === 'sample-instrument') {
        const header = reader.sample(body.sampleId); let waveform: readonly number[] = []; let ready = false;
        try { waveform = sampleAudio!.readPrepared(body.sampleId).waveform; ready = true; } catch { /* Preparation is explicit; editing never requires a decoder. */ }
        sample = { name: header.name, durationSeconds: header.durationSeconds, waveform, ready };
      }
      return {
        draft, body, ...(sample ? { sample } : {}),
        savedSounds: savedSounds(library, draft.id),
        unfinishedDrafts: library.listDrafts().filter(d => d.kind === KIND && changed(d)),
        changed: changed(draft), canUndo: library.readDraftHistory(draft.id).past.length > 0, canRedo: library.readDraftHistory(draft.id).future.length > 0,
      };
    },
    create() { generation++; active = fresh().id; },
    createFromPreset(id) {
      const preset = timbrePresets().find(item => item.id === id);
      if (!preset) throw new Error('这个音色起点不存在。');
      const draft = library.createDraft({ kind: KIND, schemaVersion: 1, owner: OWNER, name: preset.name, dependencies: [], body: preset.body });
      generation++; active = draft.id;
    },
    setSynthesis(body) {
      const draft = current(); const next = readSynthesizerBody(body);
      // Converting an electronic sound never drops a sample reference silently.
      const existing = reader.validate(draft);
      if (existing.model === 'sample-instrument' || existing.model === 'spectral-synth') throw new Error('请新建普通电子音色，原音色的精细参数和依赖仍然保留。');
      generation++; library.updateDraft(active, { body: next, dependencies: [] }, { remember: true, expected: draft });
    },
    undo() { travel('undo'); },
    redo() { travel('redo'); },
    async createFromSample(sampleId, signal) {
      const checkCancelled = () => { if (signal?.aborted) throw new DOMException('已经离开采样工作区，原编辑稿已保留。', 'AbortError'); };
      checkCancelled();
      const header = reader.sample(sampleId); const request = ++generation;
      if (lastCreated?.sampleId === sampleId && lastCreated.revision === header.revision) {
        const draft = library.readDraft(lastCreated.draft.id);
        if (draft && JSON.stringify(draft) === JSON.stringify(lastCreated.draft)) { checkCancelled(); active = draft.id; return; }
      }
      if (!sampleAudio) throw new Error('原始采样尚未连接音频解码器。');
      await sampleAudio.prepare([sampleId]);
      checkCancelled();
      if (request !== generation) throw new Error('已经切换到另一份声音，原编辑稿已保留。');
      if (reader.sample(sampleId).revision !== header.revision) throw new Error('原始采样已变化，请重试。');
      const prepared = sampleAudio.readPrepared(sampleId);
      const body = readSampleTimbreBody({ model: 'sample-instrument', version: 1, sampleId, startSeconds: 0,
        endSeconds: Math.min(header.durationSeconds, prepared.audio.channels[0]!.length / prepared.audio.sampleRate),
        rootFrequencyHz: 220, attackSeconds: 0.015, releaseSeconds: 0.12, level: 0.65 });
      const draft = library.createDraft({ kind: KIND, owner: OWNER, schemaVersion: 1, name: `${header.name}的声音`, dependencies: [sampleId], body });
      active = draft.id; lastCreated = { sampleId, revision: header.revision, draft };
    },
    open(contentId) {
      const content = library.readContent(contentId);
      if (!content || content.kind !== KIND || content.schemaVersion !== 1) throw new Error('这份内容目前不能作为音色打开。');
      reader.validate(content);
      const existing = library.listDrafts().find(d => d.sourceId === contentId);
      if (existing) reader.validate(existing);
      generation++;
      active = existing?.id ?? library.createDraft({ sourceId: contentId }).id;
    },
    openDraft(draftId) {
      const draft = library.readDraft(draftId);
      if (!draft || draft.kind !== KIND || draft.schemaVersion !== 1) throw new Error('这份编辑稿目前无法打开。');
      reader.validate(draft); generation++;
      active = draft.id;
    },
    rename(name) {
      const value = name.trim();
      if (!value) throw new Error('给这个声音起个名字吧。');
      const draft = current(); generation++; library.updateDraft(active, { name: value }, { remember: true, expected: draft });
    },
    setCharacter(character) { if (reader.validate(current()).model !== 'basic-synth') throw new Error('当前音色不能切换为固定配方，请调整声音组成或新建电子音色。'); modify({ character }); },
    setEnvelope(attackSeconds, releaseSeconds) {
      if (reader.validate(current()).model === 'spectral-synth') throw new Error('精细音色使用多点包络，请在精细音色生成器中调整后重新导入；没有替换原参数。');
      modify({ attackSeconds, releaseSeconds });
    },
    setLevel(level) {
      const draft = current(); const body = reader.validate(draft);
      if (body.model !== 'spectral-synth') { modify({ level }); return; }
      const next = spectralTimbreBody({ ...body.patch, master: { ...body.patch.master, level } });
      library.updateDraft(active, { body: next }, { remember: true, expected: draft }); generation++;
    },
    setSampleRange(startSeconds, endSeconds) {
      const body = reader.validate(current()); if (body.model !== 'sample-instrument') throw new Error('先从采样制作一份声音。');
      if (!body.loop) { modify({ startSeconds, endSeconds }); return; }
      const start = Math.max(startSeconds, body.loop.startSeconds); const end = Math.min(endSeconds, body.loop.endSeconds);
      modify({ startSeconds, endSeconds, loop: end > start ? { startSeconds: start, endSeconds: end } : { startSeconds, endSeconds } });
    },
    setRootFrequency(rootFrequencyHz) { if (reader.validate(current()).model !== 'sample-instrument') throw new Error('先从采样制作一份声音。'); modify({ rootFrequencyHz }); },
    setSampleLoop(loop) {
      const draft = current(); const body = reader.validate(draft);
      if (body.model !== 'sample-instrument') throw new Error('当前音色没有可循环的原始采样。');
      const { loop: _old, ...plain } = body;
      const next = readSampleTimbreBody({ ...plain, version: loop ? 2 : 1, ...(loop ? { loop } : {}) });
      library.updateDraft(active, { body: next }, { remember: true, expected: draft }); generation++;
    },
    async preparePreview(notes) {
      const draft = current(); const body = reader.validate(draft);
      if (body.model === 'spectral-synth') {
        await spectralAudio.prepare(body, notes ?? [{ frequencyHz: 220, holdSeconds: Math.max(1, body.attackSeconds + .1), velocity: .7 }]);
        if (JSON.stringify(current()) !== JSON.stringify(draft)) throw new Error('准备期间声音发生变化，请重新试听。');
        return;
      }
      if (body.model !== 'sample-instrument') return;
      if (!sampleAudio) throw new Error('原始采样尚未连接音频解码器。');
      await sampleAudio.prepare([body.sampleId]);
      if (JSON.stringify(current()) !== JSON.stringify(draft)) throw new Error('准备期间声音发生变化，请重新试听。');
    },
    previewPlan(bodyOverride, note): PlayableNotePlan {
      const draft = current(); const body = reader.validate({ ...draft, body: bodyOverride ?? draft.body });
      return playable(body, note ?? { frequencyHz: 220, holdSeconds: Math.max(1, body.attackSeconds + 0.1), velocity: 0.7 }, sampleAudio, spectralAudio);
    },
    save(mode, confirmation?: SaveConfirmation) { reader.validate(current()); return library.saveDraft(active, mode, confirmation); },
    exportSound() {
      const draft = current();
      if (draft.dependencies.length) throw new Error('当前声音含有外部依赖，暂不能导出为独立声音文件。');
      const body = readEditableTimbreBody(draft.body);
      if (body.model === 'sample-instrument') throw new Error('采样音色请使用歌曲工程携带原始采样。');
      const file: SoundFile = { format: 'RootSoundSound', version: body.model === 'spectral-synth' ? 3 : body.model === 'synthesizer' ? 2 : 1, name: draft.name, timbre: body };
      return JSON.stringify(file, null, 2);
    },
    importSound(text) {
      const imported = prepareImportedTimbre(text);
      // createDraft persists before returning, so a failed write cannot change active.
      const draft = library.createDraft({
        kind: KIND, schemaVersion: 1, owner: OWNER, name: imported.name,
        dependencies: [], body: imported.body,
      });
      generation++; active = draft.id;
    },
  };
}
