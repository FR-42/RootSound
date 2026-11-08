import generalMidi from '../modules/timbre/general-midi.json' with { type: 'json' };
import type { ContentRecord, Draft } from '../contracts/content.ts';
import type { MidiNote } from '../contracts/midi.ts';
import type { PhraseBody } from '../contracts/phrase.ts';
import type { SongBody, SongTrack } from '../contracts/song.ts';
import type { SampleBankTimbreBody } from '../contracts/timbre.ts';
import { MAX_SEQUENCE_EVENTS, MAX_SEQUENCE_SECONDS } from '../contracts/playback-limits.ts';
import { MAX_PHRASE_BEATS, MAX_PHRASE_NOTES } from '../contracts/phrase-limits.ts';
import { MIN_TEMPO_BPM, MAX_TEMPO_BPM, MIN_PITCH_HZ, MAX_PITCH_HZ } from '../contracts/music-limits.ts';
import { parseMidi } from '../modules/midi-import/public.ts';
import { createMaterialLibrary } from '../modules/materials/public.ts';
import { createTimbreReferenceAdapter, readEditableTimbreBody } from '../modules/timbre/public.ts';
import { createPhraseReferenceAdapter, readPhraseBody } from '../modules/phrase/public.ts';
import { createSongReferenceAdapter, readSongBody } from '../modules/song/public.ts';

export type MidiProjectResult = { libraryText: string; warnings: string[]; trackCount: number; noteCount: number };
const MAX_TRACKS = 128;
const MAX_CLIPS = 512;
const MAX_BEATS = 1024;
const EPSILON = 1e-8;

const PROGRAM_NAMES = generalMidi.programs;
const DRUM_NAMES: Record<number, string> = generalMidi.drums;

function cleanName(value: string, fallback: string): string {
  return [...value.replace(/[\u0000-\u001f\u007f]/gu, '').trim().normalize('NFC')].slice(0, 60).join('') || fallback;
}
function reserve(taken: Set<string>, proposed: string): string {
  const base = cleanName(proposed, '未命名'); let name = base, suffix = 2;
  while (taken.has(name.toLocaleLowerCase('en-US'))) name = `${base} ${suffix++}`;
  taken.add(name.toLocaleLowerCase('en-US')); return name;
}
function coordinateTempo(value: number): number {
  if (value < MIN_TEMPO_BPM || value > MAX_TEMPO_BPM) reject(`MIDI 速度超出 ${MIN_TEMPO_BPM}～${MAX_TEMPO_BPM} BPM 编辑范围`);
  return value;
}
function frequency(pitch: number): number { return 440 * 2 ** ((pitch - 69) / 12); }
// A same-tick GM drum note is a strike, not an instruction to drop that hit.
// Its source timestamp is unchanged; the native synth needs an audible gate.
function noteDuration(note: MidiNote): number {
  return note.channel === 9 && note.endSeconds === note.startSeconds ? .12 : note.endSeconds - note.startSeconds;
}
function reject(message: string): never { throw new Error(`${message}，尚未创建工程，原 MIDI 文件已保留。`); }

function voices() {
  const names=new Set<string>();const used=new Map<string,ContentRecord>();
  function obtain(note:MidiNote):ContentRecord {
    const drum=note.channel===9,key=drum?`drum-${note.pitch}`:`program-${note.program}`;
    const existing=used.get(key);if(existing)return existing;
    const pitch=Math.max(35,Math.min(81,note.pitch));
    const body:SampleBankTimbreBody={model:'sample-bank',version:1,bank:'generaluser-gs-2.0.3',
      instrument:drum?`gm-drum-${pitch}`:`gm-${note.program}`,attackSeconds:0,releaseSeconds:.03,level:.7,
      ...(drum?{tuningSemitones:60-note.pitch}:{})};
    const record:ContentRecord={id:crypto.randomUUID(),kind:'rootsound.timbre',owner:'timbre',schemaVersion:1,revision:1,
      name:reserve(names,drum?DRUM_NAMES[note.pitch]??`打击音 ${note.pitch}`:PROGRAM_NAMES[note.program]??`音色 ${note.program+1}`),dependencies:[],body};
    createTimbreReferenceAdapter().slots(record);used.set(key,record);return record;
  }
  return {obtain,contents:()=>[...used.values()]};
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
  const warnings = [...midi.warnings, 'MIDI 不包含原始音色；已按乐器编号匹配可更换的采样音色，声音会与原曲不同。'];
  const drumTriggers = midi.notes.filter(note => note.channel === 9 && note.endSeconds === note.startSeconds).length;
  if (drumTriggers) warnings.push(`${drumTriggers} 个零长度打击触发已使用0.12秒击发时长，鼓点开始位置保持不变。`);
  const tempos = midi.tempos.filter((tempo, index, all) => !index || tempo.bpm !== all[index - 1]!.bpm)
    .map(tempo => ({ ...tempo, coordinateBpm: coordinateTempo(tempo.bpm) }));
  if (tempos.length > 2048) reject('这份 MIDI 的速度分段超过当前2048段范围');
  let baseBpm = coordinateTempo(midi.initialTempoBpm);
  while ((midi.durationSeconds + .4) * baseBpm / 60 > MAX_BEATS && baseBpm / 2 >= MIN_TEMPO_BPM) baseBpm /= 2;
  if ((midi.durationSeconds + .4) * baseBpm / 60 > MAX_BEATS) baseBpm = MIN_TEMPO_BPM;
  const palette = voices(), lanes = new Map<string, Lane>(), rowNames = new Set<string>();
  for (const note of midi.notes) {
    const pitch = frequency(note.pitch), duration = noteDuration(note);
    if (pitch < MIN_PITCH_HZ || pitch > MAX_PITCH_HZ) reject(`音符 ${note.pitch} 的音高超出当前完整 MIDI 音域`);
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
      if (durationBeats > MAX_PHRASE_BEATS + EPSILON) reject(`部分长音超过当前单个音乐${MAX_PHRASE_BEATS}拍范围`);
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
        if (lengthBeats > MAX_PHRASE_BEATS + EPSILON) reject(`部分音符超出当前单个音乐${MAX_PHRASE_BEATS}拍范围`);
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
  if (phrases.length > MAX_CLIPS) reject(`这份 MIDI 需要 ${phrases.length} 个音乐片段，超过当前 ${MAX_CLIPS} 个范围`);
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
  // Validate musical coordinates without loading a recording or requiring an audio device during import.
  const byTone=new Map(palette.contents().map(tone=>[tone.id,readEditableTimbreBody(tone.body)]));
  const events=tracks.flatMap(track=>track.clips.flatMap(clip=>{
    const phrase=byPhrase.get(clip.phraseId)!;
    return phrase.parts.flatMap(part=>part.notes.map(note=>({atSeconds:clip.startBeat*60/baseBpm+note.startBeat*60/phrase.tempoBpm,
      sound:{note:{holdSeconds:note.durationSeconds??note.durationBeats*60/phrase.tempoBpm,frequencyHz:note.frequencyHz,velocity:note.velocity},level:byTone.get(part.timbreId)!.level*(note.level??1)},pan:note.pan??0})));
  }));
  const plan={events};
  if (plan.events.length !== midi.notes.length) reject('导入后的音符数量与源文件不一致');
  // Compare identities as multisets, then times within each identity. Tiny
  // coordinate roundoff must not reorder simultaneous notes in separate clips.
  const expected = new Map<string, { times: number[]; cursor: number }>();
  for (const note of midi.notes) {
    const tone = readEditableTimbreBody(palette.obtain(note).body);
    const key = JSON.stringify([noteDuration(note), frequency(note.pitch), note.velocity, note.pan, tone.level * note.level]);
    const group = expected.get(key) ?? { times: [], cursor: 0 }; group.times.push(note.startSeconds); expected.set(key, group);
  }
  for (const group of expected.values()) group.times.sort((a, b) => a - b);
  for (const event of [...plan.events].sort((a, b) => a.atSeconds - b.atSeconds)) {
    const key = JSON.stringify([event.sound.note.holdSeconds, event.sound.note.frequencyHz, event.sound.note.velocity, event.pan ?? 0, event.sound.level]);
    const group = expected.get(key), time = group ? group.times[group.cursor++] : undefined;
    if (time === undefined || Math.abs(event.atSeconds - time) > EPSILON) reject('导入后的演奏时间与源文件不一致');
  }
  return { libraryText, warnings: [...new Set(warnings)], trackCount: tracks.length, noteCount: midi.notes.length };
}
