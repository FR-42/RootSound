import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parseMidi } from '../../src/workstation/modules/midi-import/public.ts';
import { writeMusicProject } from '../two-music-projects/project-writer.mjs';

// Strip sustain only from a private copy; leave the downloaded source intact.
function keyDownOnly(input) {
  const data = Buffer.from(input); let at = 8 + data.readUInt32BE(4), pedals = 0;
  function variable() { let value = 0, byte; do { byte = data[at++]; value = value * 128 + (byte & 127); } while (byte & 128); return value; }
  while (at < data.length) {
    const tag = data.toString('ascii', at, at + 4), end = at + 8 + data.readUInt32BE(at + 4); at += 8;
    if (tag !== 'MTrk') { at = end; continue; }
    let running = 0;
    while (at < end) {
      variable(); let status = data[at++]; if (status < 128) { assert(running); at--; status = running; }
      if (status < 0xf0) {
        running = status; const first = data[at++];
        if ((status & 0xe0) !== 0xc0) { if ((status & 0xf0) === 0xb0 && first === 64) { data[at] = 0; pedals++; } at++; }
      } else if (status === 0xff) { running = 0; at++; const size = variable(); at += size; }
      else if (status === 0xf0 || status === 0xf7) { running = 0; const size = variable(); at += size; }
      else throw new Error('Unexpected MIDI event');
      assert(at <= end);
    }
  }
  return { bytes: new Uint8Array(data), pedals };
}
const here = new URL('./', import.meta.url), original = await readFile(new URL('source.mid', here));
const sourceHash = createHash('sha256').update(original).digest('hex');
const keyed = keyDownOnly(original), source = parseMidi(new Uint8Array(original)), midi = parseMidi(keyed.bytes);
assert.equal(midi.notes.length, 4077); assert.equal(source.notes.length, midi.notes.length);
assert(midi.notes.every(note => note.program === 0));
let shortened = 0;
for (let i = 0; i < midi.notes.length; i++) {
  assert.equal(midi.notes[i].pitch, source.notes[i].pitch); assert.equal(midi.notes[i].startTick, source.notes[i].startTick);
  assert(midi.notes[i].endSeconds <= source.notes[i].endSeconds + 1e-8);
  if (midi.notes[i].endSeconds < source.notes[i].endSeconds - 1e-8) shortened++;
}
// This performance MIDI uses a fixed120 clock for expressive, off-grid timing.
// Use two dotted-quarter pulses per 6/8 bar, each divided into three eighths.
// 60 dotted-quarter pulses/minute equals the previous90 quarter-note clock;
// converting seconds to this coordinate preserves the complete performance.
const notes = midi.notes.map(note => ({ at: note.startSeconds, hold: note.endSeconds - note.startSeconds,
  pitch: note.pitch, velocity: note.velocity, level: note.level, pan: note.pan }));
assert(notes.every(note => note.hold > 0));
const result = await writeMusicProject({ name: '李斯特 · 钟 La Campanella S.141 No.3', bpm: 60, beatsPerBar: 2, stepsPerBeat: 3,
  durationSeconds: midi.durationSeconds, master: .82,
  parts: [{ name: '钢琴 · 演奏', instrument: 'gm-0', level: .7, release: .06, origin: 'Kuhmann / Disklavier World public performance MIDI', notes }],
  source: { composer: 'Franz Liszt', work: 'La Campanella, Grandes études de Paganini, S.141 No.3',
    url: 'https://www.alexanderpeppe.com/midi/242-liszt-la-campanella-from-paganinis-2nd-conc-a7ab7bc9/',
    download: 'https://www.alexanderpeppe.com/midi-download/9441/', collection: 'Kuhmann / Disklavier World, Classical 5',
    sourceSha256: sourceHash, scoreReference: 'https://noctavepiano.com/en/sheet-music/liszt-la-campanella/',
    meter: '6/8', editingBeatUnit: 'dotted-quarter', editingBpm: 60, editingQuarterBpm: 90,
    changes: 'All 4077 performance pitches, onset seconds, velocities and key-down durations retained. Sustain-controller prolongation removed, modest piano release only. Source fixed MIDI clock is not used as a tempo claim; the editing grid has two dotted-quarter pulses per bar at60 BPM, with three eighth-note cells per pulse. This does not quantize the performance or guarantee bar-perfect alignment of expressive playing. No claim of original composition or live piano recording.' } });
const holds = notes.map(note => note.hold).sort((a,b) => a-b);
Object.assign(result, { shortenedPedalNotes: shortened, removedPedalEvents: keyed.pedals, sourceSha256: sourceHash,
  holdSeconds: { median: holds[Math.floor(holds.length / 2)], p95: holds[Math.floor(holds.length * .95)], max: holds.at(-1) },
  meter: '6/8', gridBpm: 60, gridBeatUnit: 'dotted-quarter', beatsPerBar: 2, stepsPerBeat: 3 });
await writeFile(new URL('result.json', here), JSON.stringify(result, null, 2));
await writeFile(new URL('key-down.mid', here), keyed.bytes);
await writeFile(new URL('SOURCE.txt', here), `李斯特《钟》La Campanella，S.141 No.3\n\n完整演奏MIDI：Alex’s Piano Service / Kuhmann – Disklavier World\nhttps://www.alexanderpeppe.com/midi/242-liszt-la-campanella-from-paganinis-2nd-conc-a7ab7bc9/\n公开下载：https://www.alexanderpeppe.com/midi-download/9441/\n来源SHA256：${sourceHash}\n\n保留4077音符的音高、起点、力度和实际按键时长，去除踏板延长；钢琴仅加60毫秒释放。使用60附点四分大拍BPM／每小节2大拍、每拍3格的6/8编辑背景，不量化演奏时间，不声称原MIDI时钟是乐谱速度。录入为一个完整可编辑钢琴音符族。\n\n配合核对的公开乐谱：\nhttps://noctavepiano.com/en/sheet-music/liszt-la-campanella/\n本地reference.mxl内含该乐谱的CC0标注；它不代表上述演奏MIDI也拥有同样许可，未作此宣称。\n\n音源为RootSound内置GeneralUser GS 2.0.3，工程内嵌所用钢琴录音与许可。本次未作声卡试听，不声称真人录音或演奏家级诠释。\n`);
assert.equal(createHash('sha256').update(await readFile(new URL('source.mid', here))).digest('hex'), sourceHash);
console.log(JSON.stringify(result, null, 2));
