import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createMaterialLibrary, createProjectPackages } from '../../../../src/workstation/modules/materials/public.ts';
import { createSampling, createSampleAudio, createSampleReferenceAdapter, readSampleBody } from '../../../../src/workstation/modules/sampling/public.ts';
import { decodePcmWav, decodeBase64 } from '../../../../src/workstation/modules/sampling/audio.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../../../../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../../../../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../../../../src/workstation/modules/song/public.ts';
import { projectName } from '../../../../src/workstation/app/project-setup.ts';
import { readPreview, noteDuration } from '../../../../src/workstation/modules/sound-runtime/plan.ts';
import type { ContentRecord, SaveResult } from '../../../../src/workstation/contracts/content.ts';
import type { PhraseNote, PhraseSection } from '../../../../src/workstation/contracts/phrase.ts';
import type { SynthesizerBody } from '../../../../src/workstation/contracts/timbre.ts';
import type { SoundSequencePlan } from '../../../../src/workstation/contracts/sound.ts';

export type ScoreInstrument = {
  id: string; name: string; wavPath?: string; rootMidi?: number; rootFrequencyHz?: number;
  synthesis?: SynthesizerBody; level?: number; attackSeconds?: number; releaseSeconds?: number;
  loop?: { startSeconds: number; endSeconds: number };
};
export type ScoreNote = {
  midi: number; startBeat: number; durationSeconds: number; durationBeats?: number;
  instrumentId?: string; velocity?: number; level?: number; pan?: number;
};
export type ScoreTrack = {
  name: string; instrumentId: string; section?: PhraseSection; level?: number; pan?: number;
  color?: string; midiProgram?: number; notes: ScoreNote[];
};
export type Score = {
  name: string; tempoBpm: number; lengthBeats: number; phraseBeats?: number; masterLevel?: number;
  instruments: ScoreInstrument[]; tracks: ScoreTrack[]; description?: string;
};

function number(value: number | undefined, fallback: number, label: string, low: number, high: number): number {
  const result = value ?? fallback;
  if (!Number.isFinite(result) || result < low || result > high) throw new Error(`${label} must be ${low}–${high}.`);
  return result;
}
function saved(result: SaveResult): ContentRecord {
  if (result.status !== 'saved') throw new Error(`Domain save failed: ${JSON.stringify(result)}`);
  return result.content;
}
function hz(midi: number): number { return 440 * 2 ** ((midi - 69) / 12); }
function hash(data: string | Uint8Array): string { return createHash('sha256').update(data).digest('hex'); }
function adapters() { return [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()]; }
function store(scoped = false) {
  let text: string | null = null;
  const storage = { read: () => text, write: (value: string) => { text = value; } };
  return { library: createMaterialLibrary(storage, scoped ? { project: { rootKind: 'rootsound.song', adapters: adapters() } } : undefined),
    storage, text: () => { assert(text !== null); return text; } };
}
const decoder = { async decode(bytes: Uint8Array) {
  const audio = decodePcmWav(bytes);
  if (!audio) throw new Error('Use an uncompressed integer PCM or Float32 WAV for the pilot instrument.');
  return audio;
} };

function validateScore(score: Score): void {
  projectName(score.name);
  number(score.tempoBpm, 120, 'BPM', 40, 240);
  number(score.lengthBeats, 32, 'Song beats', .25, 1024);
  number(score.phraseBeats, 16, 'Phrase split beats', .25, 64);
  number(score.masterLevel, 1, 'Song level', 0, 1);
  if (!Array.isArray(score.instruments) || !score.instruments.length) throw new Error('Score needs instruments.');
  const instrumentIds = new Set<string>(); const names = new Set<string>();
  for (const instrument of score.instruments) {
    if (!instrument.id || instrumentIds.has(instrument.id)) throw new Error('Instrument IDs must be distinct.');
    instrumentIds.add(instrument.id);
    if (!instrument.name?.trim() || names.has(instrument.name.trim())) throw new Error('Instrument names must be distinct in this song.');
    names.add(instrument.name.trim());
    if (!!instrument.wavPath === !!instrument.synthesis) throw new Error(`${instrument.name}: choose exactly one WAV or synthesis body.`);
  }
  if (!Array.isArray(score.tracks) || !score.tracks.length || score.tracks.length > 128) throw new Error('Score needs 1–128 tracks.');
  let count = 0;
  for (const track of score.tracks) {
    if (!track.name?.trim() || !instrumentIds.has(track.instrumentId)) throw new Error('Track name/instrument is invalid.');
    number(track.level, 1, 'Track level', 0, 1); number(track.pan, 0, 'Track pan', -1, 1);
    if (track.section !== undefined && track.section !== 'melody' && track.section !== 'rhythm') throw new Error('Unknown section.');
    if (!Array.isArray(track.notes)) throw new Error('Track notes must be an array.');
    for (const note of track.notes) {
      count++;
      number(note.startBeat, -1, 'Note start', 0, score.lengthBeats - 1 / 1024);
      number(note.durationSeconds, -1, 'Note held seconds', .0001, 96);
      number(hz(note.midi), -1, 'Note frequency', 20, 5000);
      number(note.velocity, .75, 'Note velocity', 0, 1);
      number(note.level, 1, 'Note level', 0, 1); number(note.pan, 0, 'Note pan', -1, 1);
      if (note.instrumentId && !instrumentIds.has(note.instrumentId)) throw new Error('Note instrument is missing.');
    }
  }
  if (!count || count > 2048) throw new Error('This app version needs 1–2048 audible notes per song.');
}

function comparablePlan(plan: SoundSequencePlan) {
  return { ...plan, events: plan.events.map(event => ({ ...event, sound: event.sound.kind === 'sample'
    ? { ...event.sound, source: { ...event.sound.source, id: 'remapped-sample' } } : event.sound })) };
}

export async function buildProject(score: Score, scoreDirectory: string) {
  validateScore(score);
  const source = store(); const library = source.library;
  const audio = createSampleAudio(library, decoder);
  const tone = createTimbreEditor(library, audio);
  const timbreIds = new Map<string, string>();
  const sampleIds = new Map<string, string>();
  const media: Array<{ instrumentId: string; name: string; wavPath: string; sha256: string; bytes: number; seconds: number }> = [];
  for (const instrument of score.instruments) {
    if (instrument.wavPath) {
      const filePath = path.resolve(scoreDirectory, instrument.wavPath);
      const bytes = new Uint8Array(await readFile(filePath)); const digest = hash(bytes);
      let sampleId = sampleIds.get(digest);
      const pcm = await decoder.decode(bytes);
      if (!sampleId) {
        const sampling = createSampling(library, { decoder,
          files: { async open() { return { status: 'opened', name: path.basename(filePath), mimeType: 'audio/wav', bytes }; } },
          capture: { async start() { throw new Error('No recording or playback device is used by this packager.'); }, cancel() {} } });
        await sampling.importFile(); sampling.rename(`${instrument.name} · 素材`);
        sampleId = sampling.save().id; sampleIds.set(digest, sampleId); sampling.dispose();
      }
      await tone.createFromSample(sampleId); tone.rename(instrument.name);
      tone.setRootFrequency(instrument.rootFrequencyHz ?? hz(instrument.rootMidi ?? 60));
      tone.setEnvelope(instrument.attackSeconds ?? .005, instrument.releaseSeconds ?? .1);
      tone.setLevel(instrument.level ?? 1);
      if (instrument.loop) tone.setSampleLoop(instrument.loop);
      media.push({ instrumentId: instrument.id, name: instrument.name, wavPath: instrument.wavPath, sha256: digest,
        bytes: bytes.byteLength, seconds: pcm.channels[0]!.length / pcm.sampleRate });
    } else {
      tone.create(); tone.rename(instrument.name); tone.setSynthesis(instrument.synthesis!);
      if (instrument.level !== undefined) tone.setLevel(instrument.level);
    }
    timbreIds.set(instrument.id, saved(tone.save('new')).id);
  }
  const tones = createTimbrePlayback(library, audio);
  const phrases = createPhrasePlayback(library, tones);
  const phrase = createPhraseEditor(library, tones);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source', initialTrackCount: score.tracks.length });
  song.create(); song.rename(score.name); song.setTempo(score.tempoBpm); song.setLength(score.lengthBeats);
  song.setMasterLevel(score.masterLevel ?? 1);
  const phraseBeats = score.phraseBeats ?? 16; let phraseCount = 0;
  for (let trackIndex = 0; trackIndex < score.tracks.length; trackIndex++) {
    const inputTrack = score.tracks[trackIndex]!; const trackId = song.read().body!.tracks[trackIndex]!.id;
    song.updateTrack(trackId, { name: inputTrack.name, level: inputTrack.level ?? 1, pan: inputTrack.pan ?? 0,
      ...(inputTrack.color ? { color: inputTrack.color } : {}) });
    const chunks = new Map<number, ScoreNote[]>();
    for (const note of inputTrack.notes) {
      const chunk = Math.floor((note.startBeat + 1e-9) / phraseBeats);
      if (!chunks.has(chunk)) chunks.set(chunk, []);
      chunks.get(chunk)!.push(note);
    }
    for (const [chunk, chunkNotes] of [...chunks].sort((a, b) => a[0] - b[0])) {
      const byInstrument = new Map<string, ScoreNote[]>();
      for (const note of chunkNotes) {
        const id = note.instrumentId ?? inputTrack.instrumentId;
        if (!byInstrument.has(id)) byInstrument.set(id, []);
        byInstrument.get(id)!.push(note);
      }
      // Eight tone uses per phrase is the current editor limit. Multiple clips on
      // the same arrangement row preserve larger multi-sample instruments.
      const entries = [...byInstrument];
      for (let first = 0; first < entries.length; first += 8) {
        const batch = entries.slice(first, first + 8);
        phrase.create(timbreIds.get(batch[0]![0])!);
        phrase.removePart(phrase.read().body!.parts[0]!.id);
        phrase.rename(`${inputTrack.name} · ${chunk + 1}${first ? `-${first / 8 + 1}` : ''}`);
        phrase.setTempo(score.tempoBpm);
        const chunkStart = chunk * phraseBeats;
        const noteBeats = (note: ScoreNote) => note.durationBeats ?? note.durationSeconds * score.tempoBpm / 60;
        const required = Math.max(...batch.flatMap(([, notes]) => notes.map(note => note.startBeat - chunkStart + noteBeats(note))));
        const length = Math.min(64, Math.max(Math.min(phraseBeats, score.lengthBeats - chunkStart), Math.ceil(required * 4 - 1e-8) / 4));
        phrase.setLength(length);
        for (const [instrumentId, notes] of batch) {
          const part = phrase.addPart(timbreIds.get(instrumentId)!, inputTrack.section ?? 'melody');
          phrase.addNotes(part, notes.map(note => {
            const startBeat = note.startBeat - chunkStart;
            return { startBeat, durationBeats: Math.min(noteBeats(note), length - startBeat),
              durationSeconds: note.durationSeconds, frequencyHz: hz(note.midi), velocity: note.velocity ?? .75,
              ...(note.level === undefined ? {} : { level: note.level }), ...(note.pan === undefined ? {} : { pan: note.pan }) } satisfies Omit<PhraseNote, 'id'>;
          }));
        }
        const record = saved(phrase.save('new')); song.addClip(trackId, record.id, chunkStart); phraseCount++;
      }
    }
  }
  saved(song.save('new')); await song.preparePreview(); const expected = song.previewPlan();
  const transfer = createProjectPackages(library, adapters(), { rootKind: 'rootsound.song' });
  const portable = transfer.exportDraft(song.read().draft!.id);
  // Importing the official portable closure removes preparation drafts, histories
  // and unrelated unused assets. This becomes the single-song workspace library.
  const clean = store(true);
  const imported = createProjectPackages(clean.library, adapters(), { rootKind: 'rootsound.song' }).importProject(portable.text);
  if (imported.status !== 'imported') throw new Error(`Round-trip import failed: ${JSON.stringify(imported)}`);
  assert.equal(clean.library.listDrafts().length, 1);
  const restoredAudio = createSampleAudio(clean.library, decoder);
  const restoredPhrases = createPhrasePlayback(clean.library, createTimbrePlayback(clean.library, restoredAudio));
  const restored = createSongEditor(clean.library, restoredPhrases, { defaultTempoMode: 'source' });
  restored.openDraft(imported.draft.id); await restored.preparePreview(); const actual = restored.previewPlan();
  assert.deepEqual(comparablePlan(actual), comparablePlan(expected));
  const noteCount = score.tracks.reduce((sum, track) => sum + track.notes.length, 0);
  assert.equal(actual.events.length, noteCount, 'Every score note must remain a separately playable note.');
  const scheduled = readPreview(actual);
  const sampleHashes = new Map<string, string>();
  const summaryEvents = scheduled.events.map(event => {
    const sound = event.sound;
    const common = { atSeconds: event.atSeconds, durationSeconds: noteDuration(sound),
      level: sound.level, velocity: sound.note.velocity, pan: event.pan ?? 0,
      frequencyHz: sound.note.frequencyHz, holdSeconds: sound.note.holdSeconds, envelope: sound.envelope };
    if (sound.kind !== 'sample') return { ...common, kind: sound.kind, sources: sound.sources,
      ...('filter' in sound ? { filter: sound.filter } : {}), ...('pitch' in sound ? { pitch: sound.pitch } : {}) };
    let digest = sampleHashes.get(sound.source.id);
    if (!digest) {
      const sample = readSampleBody(clean.library.readContent(sound.source.id)!.body);
      digest = hash(decodeBase64(sample.audio.data, sample.audio.byteLength)); sampleHashes.set(sound.source.id, digest);
    }
    const original = media.find(item => item.sha256 === digest);
    assert(original, 'Each embedded sample must map to the original instrument WAV.');
    return { ...common, kind: 'sample', wavKey: original.instrumentId, wavPath: original.wavPath,
      sampleSha256: digest, playbackRate: sound.playbackRate, startSeconds: sound.startSeconds,
      endSeconds: sound.endSeconds, ...(sound.loop ? { loop: sound.loop } : {}) };
  });
  const compiledSummary = { format: 'RootSoundPilotPlaybackSummary', version: 1,
    normalization: scheduled.normalization, durationSeconds: scheduled.durationSeconds,
    nominalSeconds: score.lengthBeats * 60 / score.tempoBpm, events: summaryEvents };
  const workspace = JSON.stringify({ format: 'RootSoundWorkspace', version: 2, id: crypto.randomUUID(), name: score.name,
    createdAtUtc: new Date().toISOString(), libraryText: clean.text() });
  const verification = {
    name: score.name, tempoBpm: score.tempoBpm, nominalBeats: score.lengthBeats,
    nominalSeconds: score.lengthBeats * 60 / score.tempoBpm, playableSeconds: actual.durationSeconds,
    tracks: score.tracks.length, instruments: timbreIds.size, phrases: phraseCount, notes: noteCount,
    contentRecords: imported.contentCount, portableBytes: Buffer.byteLength(portable.text), workspaceBytes: Buffer.byteLength(workspace),
    workspaceSha256: hash(workspace), portableSha256: hash(portable.text), media,
    checks: { officialDomainConstruction: true, officialPortableExportImport: true, coldSampleDecode: true,
      identicalPlaybackAfterIdentityRemap: true, separateEventForEveryNote: true, oneSongDraftOnly: true,
      soundRuntimePlanValidation: true,
      desktopOperated: false, soundDeviceOpened: false, listeningAccepted: false },
    limitations: ['No new engine features: sample transposition changes playback speed and formants.',
      'MIDI contains note/mix/tempo data, not the custom instrument samples.',
      'Articulations/effects baked into an instrument WAV remain part of that instrument audio.'],
  };
  return { workspace, portable: portable.text, midi: makeMidi(score), verification, plan: actual,
    compiledSummary, libraryText: clean.text() };
}

function vlq(value: number): number[] {
  if (!Number.isInteger(value) || value < 0 || value > 0x0fffffff) throw new Error('MIDI delta out of range.');
  const bytes = [value & 127]; while ((value >>= 7)) bytes.unshift((value & 127) | 128); return bytes;
}
function u32(value: number): Buffer { const out = Buffer.alloc(4); out.writeUInt32BE(value); return out; }
function midiTrack(events: Array<{ tick: number; order: number; bytes: number[] }>, endTick: number): Buffer {
  events.sort((a, b) => a.tick - b.tick || a.order - b.order);
  let tick = 0; const bytes: number[] = [];
  for (const event of events) { bytes.push(...vlq(event.tick - tick), ...event.bytes); tick = event.tick; }
  bytes.push(...vlq(Math.max(0, endTick - tick)), 0xff, 0x2f, 0);
  return Buffer.concat([Buffer.from('MTrk'), u32(bytes.length), Buffer.from(bytes)]);
}
function textMeta(text: string): number[] { const utf8 = [...Buffer.from(text, 'utf8')]; return [0xff, 0x03, ...vlq(utf8.length), ...utf8]; }
export function makeMidi(score: Score): Buffer {
  const ppq = 960; const tempo = Math.round(60_000_000 / score.tempoBpm);
  const endTick = Math.round(score.lengthBeats * ppq);
  const tracks = [midiTrack([{ tick: 0, order: 0, bytes: textMeta(score.name) },
    { tick: 0, order: 1, bytes: [0xff, 0x51, 3, (tempo >> 16) & 255, (tempo >> 8) & 255, tempo & 255] },
    { tick: 0, order: 2, bytes: [0xff, 0x58, 4, 4, 2, 24, 8] }], endTick)];
  score.tracks.forEach((track, index) => {
    const channel = index % 15 < 9 ? index % 15 : index % 15 + 1;
    const events = [{ tick: 0, order: 0, bytes: textMeta(track.name) },
      { tick: 0, order: 1, bytes: [0xb0 | channel, 7, Math.round((track.level ?? 1) * 127)] },
      { tick: 0, order: 1, bytes: [0xb0 | channel, 10, Math.round(((track.pan ?? 0) + 1) * 63.5)] }];
    if (track.midiProgram !== undefined) events.push({ tick: 0, order: 1, bytes: [0xc0 | channel, track.midiProgram] });
    for (const note of track.notes) {
      const pitch = Math.round(note.midi);
      if (Math.abs(note.midi - pitch) > 1e-6) throw new Error('MIDI export currently requires integer note pitches. RootSound stores exact frequency.');
      const start = Math.round(note.startBeat * ppq);
      const length = Math.max(1, Math.round(note.durationSeconds * score.tempoBpm / 60 * ppq));
      events.push({ tick: start, order: 3, bytes: [0x90 | channel, pitch, Math.max(1, Math.round((note.velocity ?? .75) * (note.level ?? 1) * 127))] });
      events.push({ tick: start + length, order: 2, bytes: [0x80 | channel, pitch, 0] });
    }
    tracks.push(midiTrack(events, endTick));
  });
  const header = Buffer.alloc(14); header.write('MThd'); header.writeUInt32BE(6, 4);
  header.writeUInt16BE(1, 8); header.writeUInt16BE(tracks.length, 10); header.writeUInt16BE(ppq, 12);
  return Buffer.concat([header, ...tracks]);
}

async function main() {
  const [scorePath, outputDirectory] = process.argv.slice(2);
  if (!scorePath || !outputDirectory) throw new Error('Usage: node build-project.ts <score.json> <new output directory>');
  const score = JSON.parse(await readFile(scorePath, 'utf8')) as Score;
  const result = await buildProject(score, path.dirname(path.resolve(scorePath)));
  await mkdir(outputDirectory, { recursive: true });
  const name = projectName(score.name);
  // Exclusive writes: never replace an existing user project or prior iteration.
  await writeFile(path.join(outputDirectory, `${name}.rootsound`), result.workspace, { flag: 'wx' });
  await writeFile(path.join(outputDirectory, `${name}.rsproject`), result.portable, { flag: 'wx' });
  await writeFile(path.join(outputDirectory, `${name}.mid`), result.midi, { flag: 'wx' });
  await writeFile(path.join(outputDirectory, '工程核验.json'), JSON.stringify(result.verification, null, 2), { flag: 'wx' });
  await writeFile(path.join(outputDirectory, '播放计划.json'), JSON.stringify(result.compiledSummary, null, 2), { flag: 'wx' });
  console.log(JSON.stringify(result.verification, null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
