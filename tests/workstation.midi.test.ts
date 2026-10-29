import assert from 'node:assert/strict';
import test from 'node:test';
import { parseMidi } from '../src/workstation/modules/midi-import/public.ts';
import { MAX_MIDI_FILE_BYTES, MIDI_LIMITS } from '../src/workstation/contracts/midi.ts';

const word = (n: number) => [n >>> 8 & 255, n & 255];
const uint = (n: number) => [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255];
const ascii = (s: string) => [...s].map(c => c.charCodeAt(0));
function vlq(n: number): number[] {
  const result = [n & 127]; while ((n = Math.floor(n / 128))) result.unshift((n & 127) | 128); return result;
}
const event = (delta: number, ...bytes: number[]) => [...vlq(delta), ...bytes];
const meta = (delta: number, type: number, data: number[]) => event(delta, 0xff, type, ...vlq(data.length), ...data);
const end = (delta = 0) => meta(delta, 0x2f, []);
const track = (events: number[][]) => { const bytes = events.flat(); return [...ascii('MTrk'), ...uint(bytes.length), ...bytes]; };
function file(tracks: number[][][], { format = tracks.length === 1 ? 0 : 1, division = 480 } = {}): Uint8Array {
  return Uint8Array.from([...ascii('MThd'), ...uint(6), ...word(format), ...word(tracks.length), ...word(division), ...tracks.flatMap(track)]);
}
const simple = () => file([[event(0,0x90,60,100),event(480,0x80,60,64),end()]]);
const close = (actual: number, expected: number) => assert(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);

test('SMF0 running status, velocity-zero release, Unicode names, and offset input views preserve the original bytes', () => {
  const original = file([[meta(0,3,[...new TextEncoder().encode('第一声部')]),event(0,0x90,60,100),event(240,64,90),event(240,60,0),event(240,64,0),end()]]);
  const padded = new Uint8Array(original.length + 7); padded.set(original,3); const before = padded.slice();
  const song = parseMidi(padded.subarray(3,3+original.length));
  assert.equal(song.format,0); assert.equal(song.division,480); assert.equal(song.tracks[0]!.name,'第一声部');
  assert.equal(song.notes.length,2); assert.equal(song.notes[0]!.pitch,60); assert.equal(song.notes[1]!.pitch,64);
  close(song.notes[0]!.endSeconds,.5); close(song.notes[1]!.startSeconds,.25); close(song.notes[1]!.endSeconds,.75);
  close(song.notes[0]!.velocity,100/127); assert.equal(song.notes[0]!.level,1); assert.equal(song.notes[0]!.pan,0);
  assert.deepEqual(padded,before); assert.deepEqual(song.warnings,[]);
});

test('global tempo changes retain exact start and end times of a note crossing the boundary', () => {
  const song = parseMidi(file([
    [meta(0,0x51,[7,0xa1,0x20]),meta(480,0x51,[15,0x42,0x40]),end(960)],
    [event(0,0x90,60,100),event(960,0x80,60,0),event(0,0x90,64,100),event(480,0x80,64,0),end()],
  ]));
  assert.deepEqual(song.tempos,[{tick:0,beat:0,seconds:0,bpm:120},{tick:480,beat:1,seconds:.5,bpm:60}]);
  assert.equal(song.initialTempoBpm,120); close(song.durationSeconds,2.5); assert.equal(song.durationBeats,3);
  close(song.notes[0]!.endSeconds,1.5); close(song.notes[1]!.startSeconds,1.5); close(song.notes[1]!.endSeconds,2.5);
});

test('many tempo sections agree with an independent per-tick clock without quantizing musical positions', () => {
  const division=960;
  const changes=new Map<number,number>([[0,428571],[137,625000],[619,333333],[1200,1000000],[1733,500000],[2201,400000]]);
  const tempoEvents: number[][]=[]; let previous=0;
  for(const [tick,microseconds] of changes){tempoEvents.push(meta(tick-previous,0x51,[(microseconds>>>16)&255,(microseconds>>>8)&255,microseconds&255]));previous=tick;}
  tempoEvents.push(end(3000-previous));
  const positions=[[11,1300],[333,1901],[1001,2999]];
  const noteTracks=positions.map(([start,finish],index)=>[
    event(start!,0x90+index,60+index,90),event(finish!-start!,0x80+index,60+index,0),end(3000-finish!),
  ]);
  const song=parseMidi(file([tempoEvents,...noteTracks],{division}));
  const tickClock=[0]; let current=500000;
  for(let tick=0;tick<3000;tick++){current=changes.get(tick)??current;tickClock.push(tickClock.at(-1)!+current/division/1e6);}
  song.notes.forEach((note,index)=>{
    close(note.startSeconds,tickClock[positions[index]![0]!]!);close(note.endSeconds,tickClock[positions[index]![1]!]!);
    close(note.startBeat,positions[index]![0]!/division);close(note.endBeat,positions[index]![1]!/division);
  });
  close(song.durationSeconds,tickClock[3000]!);
});

test('controller/program events in another track apply globally and sustain is baked into duration', () => {
  const song = parseMidi(file([
    [event(0,0xc0,40),event(0,0xb0,7,100),event(0,0xb0,11,80),event(0,0xb0,10,127),event(0,0xb0,64,127),event(960,0xb0,64,0),end()],
    [event(0,0x90,60,100),event(480,0x80,60,0),end(480)],
  ]));
  const note = song.notes[0]!; assert.equal(note.trackIndex,1); assert.equal(note.channel,0); assert.equal(note.program,40);
  close(note.level,100/127*80/127); assert.equal(note.pan,1); assert.equal(note.endTick,960); close(note.endSeconds,1);
  assert.deepEqual(song.warnings,[]);
});

test('overlapping equal pitches pair FIFO rather than losing or indefinitely holding a note', () => {
  const song = parseMidi(file([[event(0,0x90,60,100),event(120,0x90,60,90),event(120,0x80,60,0),event(120,0x90,60,0),end()]]));
  assert.deepEqual(song.notes.map(n=>[n.startTick,n.endTick]),[[0,240],[120,360]]); assert.deepEqual(song.warnings,[]);
});

test('program changes affect later notes while held notes retain their original instrument', () => {
  const song = parseMidi(file([[event(0,0xc2,9),event(0,0x92,60,100),event(240,0xc2,55),event(0,0x92,64,100),event(240,0x82,60,0),event(0,0x82,64,0),end()]]));
  assert.deepEqual(song.notes.map(n=>[n.channel,n.program]),[[2,9],[2,55]]);
});

test('all-notes-off obeys a held pedal, all-sound-off ends it, and reset controllers releases deferred notes', () => {
  const song = parseMidi(file([[event(0,0xb0,64,127),event(0,0x90,60,100),event(240,0xb0,123,0),event(240,0xb0,120,0),
    event(0,0x90,62,100),event(120,0x80,62,0),event(120,0xb0,121,0),event(0,0x90,64,100),event(120,0x80,64,0),end()]]));
  assert.deepEqual(song.notes.map(n=>[n.pitch,n.endTick]),[[60,480],[62,720],[64,840]]);
  assert.deepEqual(song.warnings,[]);
});

test('EOF safely completes unmatched notes and zero-duration entries are discarded explicitly', () => {
  const song = parseMidi(file([[event(0,0x90,60,100),event(120,0x90,62,100),event(0,0x80,62,0),end(120)]]));
  assert.equal(song.notes.length,1); assert.equal(song.notes[0]!.endTick,240);
  assert(song.warnings.some(w=>w.includes('缺少结束'))); assert(song.warnings.some(w=>w.includes('长度为零')));
  assert.throws(()=>parseMidi(file([[event(0,0x90,60,100),event(0,0x80,60,0),end()]])),/有效音符/);
});

test('zero-gate percussion triggers are retained even when the entire MIDI has zero elapsed time', () => {
  const song=parseMidi(file([[event(0,0x99,36,110),event(0,0x89,36,0),event(0,0x99,42,80),event(0,0x99,42,0),end()]]));
  assert.equal(song.durationSeconds,0); assert.equal(song.durationBeats,0); assert.equal(song.notes.length,2);
  for(const note of song.notes){assert.equal(note.channel,9);assert.equal(note.startTick,0);assert.equal(note.endTick,0);assert.equal(note.startSeconds,0);assert.equal(note.endSeconds,0);}
  assert(song.warnings.some(w=>w.includes('保留击发点')));
  assert.equal(song.warnings.some(w=>w.includes('长度为零的音符已忽略')),false);
});

test('preserving zero-gate drums does not change overlapping or pedal-extended drum lifetimes', () => {
  const overlap=parseMidi(file([[event(0,0x99,36,100),event(0,0x99,36,90),event(0,0x89,36,0),event(240,0x89,36,0),end()]]));
  assert.deepEqual(overlap.notes.map(n=>[n.startTick,n.endTick]),[[0,0],[0,240]]);
  const pedal=parseMidi(file([[event(0,0xb9,64,127),event(0,0x99,36,100),event(0,0x89,36,0),event(120,0x99,36,90),
    event(0,0x89,36,0),event(360,0xb9,64,0),event(0,0x99,42,80),event(0,0x89,42,0),end()]]));
  assert.deepEqual(pedal.notes.map(n=>[n.startTick,n.endTick]),[[0,480],[120,480],[480,480]]);
});

test('missing end-of-track metadata is tolerated with an explicit warning and exact finite notes', () => {
  const song = parseMidi(file([[event(0,0x90,60,100),event(480,0x80,60,0)]]));
  assert(song.warnings.some(w=>w.includes('没有结束标记'))); close(song.notes[0]!.endSeconds,.5);
});

test('legacy Chinese track names are decoded without treating them as music data or failing the import', () => {
  const song=parseMidi(file([[meta(0,3,[0xb5,0xda,0xd2,0xbb]),event(0,0x90,60,90),event(480,0x80,60,0),end()]]));
  assert.equal(song.tracks[0]!.name,'第一'); assert(song.warnings.some(w=>w.includes('旧文字编码')));
});

test('unsupported expression, pitch bend, pressure, SysEx and meter are summarized without silently discarding them', () => {
  const song = parseMidi(file([[meta(0,0x58,[3,2,24,8]),meta(0,5,ascii('la')),
    event(0,0x90,60,100),event(20,0xe0,0,80),event(20,0xe0,0,90),event(20,0xa0,60,90),event(20,0xd0,80),
    event(20,0xb0,7,60),event(20,0xb0,1,90),event(20,0xb0,0,2),event(20,0xf0,3,0x7d,0,0xf7),
    event(320,0x80,60,0),end()]]));
  for(const fragment of ['非 4/4','歌词','弯音','触后','连续变化','连续控制器','自定义音色库','系统专用'])assert(song.warnings.some(w=>w.includes(fragment)),fragment);
  assert.equal(song.warnings.filter(w=>w.includes('弯音')).length,1);
  assert.deepEqual(song.timeSignatures,[{tick:0,beat:0,numerator:3,denominator:4}]); assert.equal(song.notes[0]!.level,1);
});

test('volume, expression and pan snapshots include silent notes and both pan endpoints', () => {
  const song = parseMidi(file([[event(0,0xb0,7,0),event(0,0xb0,10,0),event(0,0x90,60,90),event(120,0x80,60,0),
    event(0,0xb0,7,127),event(0,0xb0,11,64),event(0,0xb0,10,127),event(0,0x90,62,90),event(120,0x80,62,0),end()]]));
  assert.equal(song.notes[0]!.level,0); assert.equal(song.notes[0]!.pan,-1); close(song.notes[1]!.level,64/127); assert.equal(song.notes[1]!.pan,1);
});

test('port metadata separates simultaneous channel states without conflating instruments or pedals', () => {
  const song = parseMidi(file([
    [event(0,0xc0,10),event(0,0xb0,64,127),event(0,0x90,60,90),event(120,0x80,60,0),event(360,0xb0,64,0),end()],
    [meta(0,0x21,[1]),event(0,0xc0,40),event(0,0x90,64,90),event(120,0x80,64,0),end(360)],
  ]));
  assert.deepEqual(song.notes.map(n=>[n.program,n.endTick]),[[10,480],[40,120]]);
});

test('same-tick tempo conflicts resolve deterministically and preserve subsequent cumulative seconds', () => {
  const song = parseMidi(file([
    [meta(0,0x51,[7,0xa1,0x20]),meta(480,0x51,[15,0x42,0x40]),end(960)],
    [meta(480,0x51,[3,0xd0,0x90]),event(0,0x90,60,90),event(960,0x80,60,0),end()],
  ]));
  assert.equal(song.tempos.at(-1)!.bpm,240); close(song.notes[0]!.startSeconds,.5); close(song.notes[0]!.endSeconds,1);
  assert(song.warnings.some(w=>w.includes('多个不同速度')));
});

test('header variants and unsupported timing formats fail before any import document is produced', () => {
  for(const [format,division,pattern] of [[2,480,/格式 2/],[0,0xE728,/SMPTE/],[0,0,/不能为零/]] as const)
    assert.throws(()=>parseMidi(file([[event(0,0x90,60,90),event(480,0x80,60,0),end()]],{format,division})),pattern);
  const invalidFormat0=file([[end()],[end()]],{format:0}); assert.throws(()=>parseMidi(invalidFormat0),/轨道数量/);
  const badHeader=simple(); badHeader[7]=5; assert.throws(()=>parseMidi(badHeader),/文件头/);
  const wrongTag=simple(); wrongTag[0]=0; assert.throws(()=>parseMidi(wrongTag),/标准 MIDI/);
  assert.throws(()=>parseMidi(file([[end()]])),/有效音符/);
});

test('all truncated prefixes and invalid lengths are rejected without mutating the source', () => {
  const valid=simple(), before=valid.slice();
  for(let length=0;length<valid.length;length++)assert.throws(()=>parseMidi(valid.subarray(0,length)),`prefix ${length}`);
  assert.deepEqual(valid,before);
  const overflow=simple(); overflow.set([0xff,0xff,0xff,0xff],18); assert.throws(()=>parseMidi(overflow),/不完整/);
  assert.throws(()=>parseMidi(file([[event(0,0x90,60,100),event(10,0xff,0x51,2,0,1),end()]])),/速度事件不完整/);
  assert.throws(()=>parseMidi(file([[event(0,0x90,60,100),event(10,0xff,0x51,3,0,0,0),end()]])),/速度事件不能为零/);
});

test('invalid running status, high data bytes, oversized VLQs and events after EOT are rejected', () => {
  for(const events of [
    [event(0,60,100),end()],
    [event(0,0x90,60,100),meta(1,0x7f,[]),event(1,60,0),end()],
    [event(0,0x90,60,128),end()],
    [[0x81,0x80,0x80,0x80,0,0x90,60,90],end()],
    [event(0,0xf1,0),end()],
    [event(0,0x90,60,90),end(),event(10,0x80,60,0)],
  ])assert.throws(()=>parseMidi(file([events])));
});

test('unknown metadata and chunks are safely skipped, while extra declared music tracks are rejected', () => {
  const original=file([[meta(0,0x7f,[1,2,3,4]),event(0,0x90,60,90),event(480,0x80,60,0),end()]]);
  const extended=Uint8Array.from([...original.slice(0,14),...ascii('JUNK'),...uint(3),1,2,3,...original.slice(14)]);
  const song=parseMidi(extended); assert.equal(song.notes.length,1); assert(song.warnings.some(w=>w.includes('非音乐扩展')));
  assert.throws(()=>parseMidi(Uint8Array.from([...original,...track([end()])])),/实际轨道/);
});

test('file, duration, event and note budgets bound adversarial imports', () => {
  assert.equal(MAX_MIDI_FILE_BYTES,10*1024*1024); assert.throws(()=>parseMidi(new Uint8Array(MAX_MIDI_FILE_BYTES+1)),/10 MiB/);
  assert.throws(()=>parseMidi(file([[event(0,0x90,60,90),event(6_912_001,0x80,60,0),end()]])),/两小时/);
  const tooManyEvents=Array.from({length:MIDI_LIMITS.events+1},()=>meta(0,0x7f,[]));
  assert.throws(()=>parseMidi(file([tooManyEvents])),/200000/);
  const tooManyNotes=Array.from({length:MIDI_LIMITS.notes+1},()=>event(0,0x90,60,90)); tooManyNotes.push(end(480));
  assert.throws(()=>parseMidi(file([tooManyNotes])),/50000/);
});
