import type { ContentRecord, Draft } from '../contracts/content.ts';
import type { MidiNote } from '../contracts/midi.ts';
import type { PhraseBody } from '../contracts/phrase.ts';
import type { SongBody, SongTrack } from '../contracts/song.ts';
import type { SynthesizerBody } from '../contracts/timbre.ts';
import { MAX_SEQUENCE_EVENTS, MAX_SEQUENCE_SECONDS } from '../contracts/playback-limits.ts';
import { MAX_PHRASE_BEATS, MAX_PHRASE_NOTES } from '../contracts/phrase-limits.ts';
import { parseMidi } from '../modules/midi-import/public.ts';
import { createMaterialLibrary } from '../modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter, prepareMelodyTimbres, readSynthesizerBody, timbrePresets } from '../modules/timbre/public.ts';
import { createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter, readSongBody } from '../modules/song/public.ts';

export type MidiProjectResult = { libraryText: string; warnings: string[]; trackCount: number; noteCount: number };
const MAX_TRACKS = 128;
const MAX_CLIPS = 512;
const MAX_BEATS = 1024;
const EPSILON = 1e-8;

const PROGRAM_NAMES = [
  '大钢琴|明亮钢琴|电大钢琴|酒吧钢琴|电钢琴一|电钢琴二|羽管键琴|击弦古钢琴',
  '钢片琴|钟琴|音乐盒|颤音琴|马林巴|木琴|管钟|扬琴',
  '拉杆风琴|打击风琴|摇滚风琴|教堂管风琴|簧风琴|手风琴|口琴|探戈手风琴',
  '尼龙吉他|钢弦吉他|爵士吉他|清音吉他|闷音吉他|过载吉他|失真吉他|吉他泛音',
  '原声贝斯|指弹贝斯|拨片贝斯|无品贝斯|击弦贝斯一|击弦贝斯二|合成贝斯一|合成贝斯二',
  '小提琴|中提琴|大提琴|低音提琴|颤弓弦乐|拨奏弦乐|竖琴|定音鼓',
  '弦乐合奏一|弦乐合奏二|合成弦乐一|合成弦乐二|合唱啊声|人声哦声|合成人声|乐团齐奏',
  '小号|长号|大号|弱音小号|圆号|铜管合奏|合成铜管一|合成铜管二',
  '高音萨克斯|中音萨克斯|次中音萨克斯|上低音萨克斯|双簧管|英国管|巴松|单簧管',
  '短笛|长笛|竖笛|排箫|吹瓶声|尺八|哨音|陶笛',
  '方波主音|锯齿主音|汽笛主音|气音主音|拨弦主音|人声主音|五度主音|低音主音',
  '新世纪铺底|温暖铺底|合成铺底|合唱铺底|弓弦铺底|金属铺底|光晕铺底|扫频铺底',
  '雨声效果|配乐效果|水晶效果|氛围效果|明亮效果|奇幻效果|回声效果|科幻效果',
  '西塔琴|班卓琴|三味线|古筝|卡林巴|风笛|民间提琴|唢呐',
  '小铃|阿果果铃|钢鼓|木块|太鼓|旋律通鼓|合成鼓|反向镲',
  '吉他指板声|呼吸声|海浪|鸟鸣|电话铃|直升机|掌声|枪声',
].flatMap(group => group.split('|'));
const DRUM_NAMES: Record<number, string> = {
  35: '底鼓', 36: '踢', 37: '边击', 38: '军鼓', 39: '拍手', 40: '电子军鼓',
  41: '低落地通鼓', 42: '闭合踩镲', 43: '高落地通鼓', 44: '踏板踩镲', 45: '低通鼓',
  46: '开放踩镲', 47: '中低通鼓', 48: '中高通鼓', 49: '碎音镲', 50: '高通鼓',
  51: '叮叮镲', 52: '中国镲', 53: '镲帽', 54: '铃鼓', 55: '水镲', 56: '牛铃',
  57: '碎音镲二', 58: '振荡器', 59: '叮叮镲二', 60: '高邦戈', 61: '低邦戈',
  62: '闷高康加', 63: '开放高康加', 64: '低康加', 65: '高廷巴雷', 66: '低廷巴雷',
  67: '高阿果果铃', 68: '低阿果果铃', 69: '卡巴萨', 70: '沙锤', 71: '短哨',
  72: '长哨', 73: '短刮瓜', 74: '长刮瓜', 75: '击木', 76: '高木块', 77: '低木块',
  78: '闷库伊卡', 79: '开放库伊卡', 80: '闷三角铁', 81: '开放三角铁',
};

function cleanName(value: string, fallback: string): string {
  return [...value.replace(/[\u0000-\u001f\u007f]/gu, '').trim().normalize('NFC')].slice(0, 60).join('') || fallback;
}
function reserve(taken: Set<string>, proposed: string): string {
  const base = cleanName(proposed, '未命名'); let name = base, suffix = 2;
  while (taken.has(name.toLocaleLowerCase('en-US'))) name = `${base} ${suffix++}`;
  taken.add(name.toLocaleLowerCase('en-US')); return name;
}
function coordinateTempo(value: number): number {
  let result = value;
  while (result > 240) result /= 2;
  while (result < 40) result *= 2;
  return result;
}
function frequency(pitch: number): number { return 440 * 2 ** ((pitch - 69) / 12); }
// A same-tick GM drum note is a strike, not an instruction to drop that hit.
// Its source timestamp is unchanged; the native synth needs an audible gate.
function noteDuration(note: MidiNote): number {
  return note.channel === 9 && note.endSeconds === note.startSeconds ? .12 : note.endSeconds - note.startSeconds;
}
function reject(message: string): never { throw new Error(`${message}，尚未创建工程，原 MIDI 文件已保留。`); }

function voices() {
  const starters = new Map(prepareMelodyTimbres().map(record => [record.name, record]));
  const presets = new Map(timbrePresets().map(preset => [preset.id, preset]));
  const names = new Set<string>(); const used = new Map<string, ContentRecord>();
  function starter(name: string): SynthesizerBody { return structuredClone(starters.get(name)!.body) as SynthesizerBody; }
  function preset(name: string): SynthesizerBody { return structuredClone(presets.get(name)!.body); }
  function melodic(program: number): SynthesizerBody {
    switch (Math.floor(program / 8)) {
      case 0: return starter('钢琴');
      case 1: return preset('bell');
      case 2: return { ...starter('长笛'), attackSeconds: .007, decaySeconds: .06, sustain: .93, releaseSeconds: .09 };
      case 3: return starter('吉他');
      case 4: return preset('bass');
      case 5: return program === 45 || program === 46 ? preset('pluck') : starter('弦乐');
      case 6: return starter('弦乐');
      case 7: case 8: return starter('小号');
      case 9: return starter('长笛');
      case 10: return preset('lead');
      case 11: return { ...preset('pad'), attackSeconds: .18, releaseSeconds: .65 };
      case 12: return program === 98 ? preset('bell') : preset('pad');
      case 13: return program === 109 || program === 111 ? starter('长笛') : starter('吉他');
      case 14: return preset('bell');
      default: return preset('wind');
    }
  }
  function percussion(pitch: number): SynthesizerBody {
    let body: SynthesizerBody;
    if (pitch === 35 || pitch === 36) body = starter(pitch === 35 ? '底鼓' : '踢');
    else if ([37, 38, 39, 40].includes(pitch)) body = preset('snare');
    else if ([42, 44, 46, 49, 51, 52, 53, 55, 57, 59, 69, 70, 73, 74, 80, 81].includes(pitch)) {
      body = preset('hat');
      if ([46, 49, 51, 52, 55, 57, 59, 81].includes(pitch)) { body.decaySeconds = .55; body.releaseSeconds = .16; }
    } else if ([41, 43, 45, 47, 48, 50, 60, 61, 62, 63, 64, 65, 66].includes(pitch)) {
      body = preset('kick'); body.pitch = { semitones: 7, seconds: .04 }; body.decaySeconds = .25;
    } else body = pitch >= 35 && pitch <= 81 ? preset('bell') : preset('hat');
    // MIDI keeps the drum number in the editable note. Tune the replacement
    // voice around C4, matching the workstation's native drum starter register.
    if (![41, 43, 45, 47, 48, 50, 60, 61, 62, 63, 64, 65, 66].includes(pitch)) {
      body.sources = body.sources.map(source => ({ ...source, semitones: source.waveform === 'noise' ? 0 : Math.max(-24, Math.min(24, source.semitones + 60 - pitch)) }));
    }
    return body;
  }
  function obtain(note: MidiNote): ContentRecord {
    const drum = note.channel === 9; const key = drum ? `drum-${note.pitch}` : `program-${note.program}`;
    const previous = used.get(key); if (previous) return previous;
    const body = drum ? percussion(note.pitch) : melodic(note.program);
    body.sources = body.sources.map((source, index) => ({ ...source, id: `${source.id}:midi-${key}-${index}` }));
    const record: ContentRecord = { id: crypto.randomUUID(), kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1, revision: 1,
      name: reserve(names, drum ? DRUM_NAMES[note.pitch] ?? `打击音 ${note.pitch}` : PROGRAM_NAMES[note.program] ?? `音色 ${note.program + 1}`),
      dependencies: [], body: readSynthesizerBody(body) };
    createTimbreReferenceAdapter().slots(record); used.set(key, record); return record;
  }
  return { obtain, contents: () => [...used.values()] };
}

type Lane = { name: string; tone: ContentRecord; notes: MidiNote[]; rhythm: boolean };
type Group = { startSeconds: number; bpm: number; nominalEnd: number; notes: MidiNote[] };

/** Build and validate a wholly private song; no current project or file is read or written. */
export function createMidiProjectLibrary(bytes: Uint8Array, inputName: string): MidiProjectResult {
  const name = inputName.trim();
  if (!name || [...name].length > 80) reject('请给导入歌曲填写80字以内的名称');
  const midi = parseMidi(bytes);
  if (midi.notes.length > MAX_SEQUENCE_EVENTS) reject(`这份 MIDI 有 ${midi.notes.length} 个音符，超过当前整曲可试听的 ${MAX_SEQUENCE_EVENTS} 个音符范围`);
  if (midi.durationSeconds > MAX_SEQUENCE_SECONDS) reject('这份 MIDI 超过当前整曲10分钟范围');
  const warnings = [...midi.warnings, 'MIDI 不包含原始音色；已按乐器类型匹配可更换的合成音色，声音会与原曲不同。'];
  const drumTriggers = midi.notes.filter(note => note.channel === 9 && note.endSeconds === note.startSeconds).length;
  if (drumTriggers) warnings.push(`${drumTriggers} 个零长度打击触发已使用0.12秒击发时长，鼓点开始位置保持不变。`);
  const tempos = midi.tempos.filter((tempo, index, all) => !index || tempo.bpm !== all[index - 1]!.bpm)
    .map(tempo => ({ ...tempo, coordinateBpm: coordinateTempo(tempo.bpm) }));
  if (tempos.some(tempo => tempo.bpm !== tempo.coordinateBpm)) warnings.push('部分 MIDI 速度超出40～240 BPM，已使用半速或倍速编辑坐标；所有音符的实际开始时间和持续秒数保持原值。');
  if (tempos.length > 2048) reject('这份 MIDI 的速度分段超过当前2048段范围');
  let baseBpm = coordinateTempo(midi.initialTempoBpm);
  while ((midi.durationSeconds + .4) * baseBpm / 60 > MAX_BEATS && baseBpm / 2 >= 40) baseBpm /= 2;
  if ((midi.durationSeconds + .4) * baseBpm / 60 > MAX_BEATS) baseBpm = 40;
  const palette = voices(), lanes = new Map<string, Lane>(), rowNames = new Set<string>();
  for (const note of midi.notes) {
    const pitch = frequency(note.pitch), duration = noteDuration(note);
    if (pitch < 20 || pitch > 5000) reject(`音符 ${note.pitch} 的音高超出当前20～5000 Hz编辑范围`);
    if (duration < .0001 || duration > 96) reject('部分音符的持续时间超出当前0.1毫秒～96秒范围');
    const rhythm = note.channel === 9;
    const key = `${note.trackIndex}:${note.channel}:${rhythm ? `drum:${note.pitch}` : `program:${note.program}`}`;
    let lane = lanes.get(key);
    if (!lane) {
      const tone = palette.obtain(note), track = midi.tracks.find(track => track.index === note.trackIndex);
      lane = { name: reserve(rowNames, `${cleanName(track?.name ?? '', `声部 ${note.trackIndex + 1}`)} · ${tone.name}`), tone, notes: [], rhythm };
      lanes.set(key, lane);
    }
    lane.notes.push(note);
  }
  if (!lanes.size) reject('这份 MIDI 没有可以导入的音符');
  if (lanes.size > MAX_TRACKS) reject(`分开乐器和打击音后共有 ${lanes.size} 个声部，超过当前 ${MAX_TRACKS} 行范围`);
  const phrases: ContentRecord[] = [], tracks: SongTrack[] = [], phraseNames = new Set<string>();
  for (const lane of lanes.values()) {
    const groups = new Map<string, Group>();
    for (const [index, note] of lane.notes.entries()) {
      let tempoIndex = 0, upper = tempos.length - 1;
      while (upper > tempoIndex) {
        const middle = Math.ceil((tempoIndex + upper) / 2);
        if (tempos[middle]!.seconds <= note.startSeconds + 1e-12) tempoIndex = middle;
        else upper = middle - 1;
      }
      const tempo = tempos[tempoIndex]!, bpm = tempo.coordinateBpm, secondsPerBeat = 60 / bpm;
      // Keep a complete source lane together. Only a real coordinate budget or
      // source tempo boundary needs another independently editable phrase.
      const block = Math.floor((note.startSeconds - tempo.seconds) / (MAX_PHRASE_BEATS * secondsPerBeat) + 1e-10);
      let startSeconds = tempo.seconds + block * MAX_PHRASE_BEATS * secondsPerBeat;
      let key = `${tempoIndex}:${block}`;
      const durationBeats = noteDuration(note) / secondsPerBeat;
      if (durationBeats > MAX_PHRASE_BEATS + EPSILON) reject(`部分长音超过当前单个乐句${MAX_PHRASE_BEATS}拍范围`);
      if ((note.startSeconds - startSeconds) / secondsPerBeat + Math.max(1 / 1024, durationBeats) > MAX_PHRASE_BEATS) {
        startSeconds = note.startSeconds; key += `:long-${index}`;
      }
      let group = groups.get(key);
      if (!group) {
        group = { startSeconds, bpm,
          nominalEnd: Math.min(startSeconds + MAX_PHRASE_BEATS * secondsPerBeat, tempos[tempoIndex + 1]?.seconds ?? Infinity, midi.durationSeconds), notes: [] };
        groups.set(key, group);
      }
      group.notes.push(note);
    }
    const track: SongTrack = { id: crypto.randomUUID(), name: lane.name, level: 1, pan: 0, muted: false, solo: false, clips: [] };
    for (const group of [...groups.values()].sort((a, b) => a.startSeconds - b.startSeconds)) {
      const notes = [...group.notes].sort((a, b) => a.startSeconds - b.startSeconds || a.pitch - b.pitch);
      for (let offset = 0; offset < notes.length; offset += MAX_PHRASE_NOTES) {
        const batch = notes.slice(offset, offset + MAX_PHRASE_NOTES);
        const startSeconds = offset ? batch[0]!.startSeconds : group.startSeconds, rate = group.bpm / 60;
        const converted = batch.map(note => {
          const startBeat = Math.max(0, (note.startSeconds - startSeconds) * rate);
          return { id: crypto.randomUUID(), startBeat,
            durationBeats: Math.min(MAX_PHRASE_BEATS - startBeat, Math.max(1 / 1024, noteDuration(note) * rate)), durationSeconds: noteDuration(note),
            frequencyHz: frequency(note.pitch), velocity: note.velocity, level: note.level, pan: note.pan };
        });
        const lengthBeats = converted.reduce((end, note) => Math.max(end, note.startBeat + note.durationBeats),
          Math.max(.25, (group.nominalEnd - startSeconds) * rate));
        if (lengthBeats > MAX_PHRASE_BEATS + EPSILON) reject(`部分音符超出当前单个乐句${MAX_PHRASE_BEATS}拍范围`);
        const body: PhraseBody = readPhraseBody({ model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: group.bpm,
          lengthBeats: Math.min(MAX_PHRASE_BEATS, lengthBeats), parts: [{ id: crypto.randomUUID(), name: lane.tone.name, timbreId: lane.tone.id,
            section: lane.rhythm ? 'rhythm' : 'melody', notes: converted }] });
        const record: ContentRecord = { id: crypto.randomUUID(), kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1, revision: 1,
          name: reserve(phraseNames, `${lane.name} ${track.clips.length + 1}`), dependencies: [lane.tone.id], body };
        createPhraseReferenceAdapter().slots(record); phrases.push(record);
        track.clips.push({ id: crypto.randomUUID(), phraseId: record.id, startBeat: startSeconds * baseBpm / 60 });
      }
    }
    tracks.push(track);
  }
  if (phrases.length > MAX_CLIPS) reject(`这份 MIDI 需要 ${phrases.length} 个乐句片段，超过当前 ${MAX_CLIPS} 个范围`);
  const byPhrase = new Map(phrases.map(record => [record.id, readPhraseBody(record.body)]));
  const extent = Math.max(16, midi.durationSeconds * baseBpm / 60, ...tracks.flatMap(track => track.clips.map(clip => {
    const phrase = byPhrase.get(clip.phraseId)!; return clip.startBeat + phrase.lengthBeats * baseBpm / phrase.tempoBpm;
  })));
  if (extent > MAX_BEATS + EPSILON) reject('这份 MIDI 超过当前1024拍的歌曲编排范围');
  const body: SongBody = readSongBody({ model: 'phrase-arrangement', version: 1, timeUnit: 'beat', tempoBpm: baseBpm,
    gridTempoBpm: tempos[0]!.coordinateBpm,
    gridTempoChanges: tempos.slice(1).filter(tempo => tempo.seconds > 0).map(tempo => ({ atSeconds: tempo.seconds, tempoBpm: tempo.coordinateBpm })),
    tempoMode: 'source', lengthBeats: Math.min(MAX_BEATS, extent), tracks });
  const root: Draft = { id: crypto.randomUUID(), kind: 'rootsound.song', owner: 'song', schemaVersion: 1, name,
    dependencies: phrases.map(record => record.id), body };
  const contents = [...palette.contents(), ...phrases];
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
  const policy = { project: { rootKind: 'rootsound.song', adapters } }; let snapshot: string | null = null;
  const library = createMaterialLibrary({ read: () => snapshot, write: text => { snapshot = text; } }, policy);
  const result = library.commitTransaction({ expectedToken: library.currentToken(), label: '导入 MIDI 歌曲',
    createContents: contents, createDrafts: [root], exactNameIds: [...contents.map(record => record.id), root.id],
    projectMembers: [{ rootId: root.id, contentIds: contents.map(record => record.id) }] });
  if (result.status !== 'committed' || snapshot === null) reject(result.status === 'storage-error' ? result.message : result.status === 'conflict' ? result.reason : '未能准备歌曲数据');
  const libraryText: string = snapshot;
  const reopened = createMaterialLibrary({ read: () => libraryText, write: () => { throw new Error('导入校验不可写入'); } }, policy);
  const song = createSongEditor(reopened, createPhrasePlayback(reopened, createTimbrePlayback(reopened)), { defaultTempoMode: 'source' });
  const plan = song.previewPlan();
  if (plan.events.length !== midi.notes.length) reject('导入后的音符数量与源文件不一致');
  // Compare identities as multisets, then times within each identity. Tiny
  // coordinate roundoff must not reorder simultaneous notes in separate clips.
  const expected = new Map<string, { times: number[]; cursor: number }>();
  for (const note of midi.notes) {
    const tone = readSynthesizerBody(palette.obtain(note).body);
    const key = JSON.stringify([noteDuration(note), frequency(note.pitch), note.velocity, note.pan, tone.level * note.level]);
    const group = expected.get(key) ?? { times: [], cursor: 0 }; group.times.push(note.startSeconds); expected.set(key, group);
  }
  for (const group of expected.values()) group.times.sort((a, b) => a - b);
  for (const event of plan.events) {
    const key = JSON.stringify([event.sound.note.holdSeconds, event.sound.note.frequencyHz, event.sound.note.velocity, event.pan ?? 0, event.sound.level]);
    const group = expected.get(key), time = group ? group.times[group.cursor++] : undefined;
    if (time === undefined || Math.abs(event.atSeconds - time) > EPSILON) reject('导入后的演奏时间与源文件不一致');
  }
  return { libraryText, warnings: [...new Set(warnings)], trackCount: tracks.length, noteCount: midi.notes.length };
}
