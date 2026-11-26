import { listDefaultInstruments, studioBank, studioInstrumentForMidi } from '../modules/timbre/instrument-catalog.ts';
import generalMidi from '../modules/timbre/general-midi.json' with { type: 'json' };

type ObjectValue = Record<string, unknown>;
type Tone = { value: ObjectValue; proposed?: string };
const object = (value: unknown): value is ObjectValue => !!value && typeof value === 'object' && !Array.isArray(value);
const instrumentNames = new Map(listDefaultInstruments().map(item => [item.key, item.name]));

function curatedName(value: ObjectValue): string | undefined {
  const body = value.body;
  if (!object(body) || body.model !== 'sample-bank' || body.version !== 1 || body.bank !== studioBank || typeof value.name !== 'string') return;
  const name = typeof body.instrument === 'string' ? instrumentNames.get(body.instrument) : undefined;
  if (!name) return;
  let oldName: string | undefined;
  if (typeof body.midiDrum === 'number' && Number.isInteger(body.midiDrum) && body.midiDrum >= 0 && body.midiDrum <= 127) {
    oldName = (generalMidi.drums as Record<number, string>)[body.midiDrum] ?? `鼓 ${body.midiDrum}`;
    if (value.name === `打击音 ${body.midiDrum}`) return name;
  } else if (typeof body.midiProgram === 'number' && Number.isInteger(body.midiProgram) && body.midiProgram >= 0 && body.midiProgram < 128) {
    oldName = generalMidi.programs[body.midiProgram];
  }
  if (!oldName || value.name === name) return;
  const suffix = value.name.startsWith(`${oldName} `) ? value.name.slice(oldName.length + 1) : '';
  if (value.name === oldName || /^(?:[2-9]|[1-9]\d+)$/u.test(suffix)) return name;
  return;
}

const legacyNames = new Set([...generalMidi.programs, ...Object.values(generalMidi.drums)]);
export function mayHaveLegacyTimbreNames(text: string): boolean {
  if (!text.includes('"midiProgram"') && !text.includes('"midiDrum"')) return false;
  for (const [, quoted] of text.matchAll(/"name"\s*:\s*("(?:[^"\\]|\\.)*")/gu)) {
    let name: string;
    try { name = quoted!.includes('\\') ? JSON.parse(quoted!) : quoted!.slice(1, -1); } catch { continue; }
    if (legacyNames.has(name) || legacyNames.has(name.replace(/ \d+$/u, '')) || /^(?:打击音|鼓) \d+/u.test(name)) return true;
  }
  return false;
}

export function normalizeImportedTimbreNames(text: string): string {
  if (!mayHaveLegacyTimbreNames(text)) return text;
  let state: unknown;
  try { state = JSON.parse(text); } catch { return text; }
  if (!object(state) || state.format !== 'RootSoundMaterialLibrary' || state.version !== 1) return text;
  const tones: Tone[] = [], drafts = new Map<string, Tone>();
  function visit(value: unknown) {
    if (Array.isArray(value)) { for (const item of value) visit(item); return; }
    if (!object(value)) return;
    if (value.kind === 'rootsound.timbre' && typeof value.id === 'string' && typeof value.name === 'string') {
      const tone: Tone = { value, proposed: curatedName(value) };
      tones.push(tone); drafts.set(value.id, tone);
    }
    for (const [field, item] of Object.entries(value)) if (field !== 'body') visit(item);
  }
  visit(state.contents); visit(state.drafts); visit(state.transactionHistory);
  if (object(state.editHistory) && Array.isArray(state.editHistory.entries)) for (const entry of state.editHistory.entries) {
    if (!object(entry)) continue;
    const draft = drafts.get(String(entry.draftId));
    if (!draft) continue;
    for (const field of ['past', 'future']) if (Array.isArray(entry[field])) for (const snapshot of entry[field]) {
      if (object(snapshot) && typeof snapshot.name === 'string') tones.push({ ...draft, value: snapshot, proposed: curatedName(snapshot) });
    }
  }
  if (!tones.some(tone => tone.proposed && tone.proposed !== tone.value.name)) return text;
  for (const tone of tones) if (tone.proposed) tone.value.name = tone.proposed;
  return JSON.stringify(state);
}


const melodyInstruments = listDefaultInstruments().filter(item => item.drum === undefined);
const melodyByKey = new Map(melodyInstruments.map(item => [item.key, item]));
const melodyByName = new Map(melodyInstruments.map(item => [item.name, item]));
const drumByKey = new Map(listDefaultInstruments().filter(item => item.drum !== undefined).map(item => [item.key, item.drum!]));

export function normalizeProjectToneCards(text: string): string {
  let state: unknown;
  try { state = JSON.parse(text); } catch { return text; }
  if (!object(state) || state.format !== 'RootSoundMaterialLibrary' || state.version !== 1) return text;
  const tones: ObjectValue[] = [], parts: ObjectValue[] = [];
  const drafts = new Map<string, ObjectValue>();
  const snapshotSources = new Map<ObjectValue, string>();
  function collectBody(kind: unknown, record: ObjectValue) {
    if (kind === 'rootsound.timbre') tones.push(record);
    if (kind === 'rootsound.phrase' && object(record.body) && Array.isArray(record.body.parts))
      for (const part of record.body.parts) if (object(part) && part.unassigned !== true) parts.push(part);
  }
  function visit(value: unknown) {
    if (Array.isArray(value)) { for (const item of value) visit(item); return; }
    if (!object(value)) return;
    collectBody(value.kind, value);
    for (const [key, item] of Object.entries(value)) if (key !== 'body') visit(item);
  }
  visit(state.contents);
  visit(state.drafts);
  visit(state.transactionHistory);
  if (Array.isArray(state.drafts)) for (const draft of state.drafts)
    if (object(draft) && typeof draft.id === 'string') drafts.set(draft.id, draft);
  if (object(state.editHistory) && Array.isArray(state.editHistory.entries)) for (const entry of state.editHistory.entries) {
    if (!object(entry)) continue;
    const draft = drafts.get(String(entry.draftId));
    if (!draft) continue;
    for (const key of ['past', 'future']) if (Array.isArray(entry[key])) for (const snapshot of entry[key]) {
      if (!object(snapshot)) continue;
      collectBody(draft.kind, snapshot);
      if (draft.kind === 'rootsound.timbre') snapshotSources.set(snapshot, String(draft.sourceId ?? draft.id));
    }
  }
  const used = new Set(parts.map(part => part.timbreId));
  const names = new Map<unknown, string>();
  let changed = false;
  for (const tone of tones) {
    const id = tone.sourceId ?? tone.id ?? snapshotSources.get(tone);
    if (typeof id === 'string' && id.startsWith('rootsound.undefined-voice:')) continue;
    const body = object(tone.body) ? tone.body : undefined;
    const key = typeof body?.instrument === 'string' ? body.instrument : '';
    const exact = body?.model === 'sample-bank' && body.bank === studioBank ? melodyByKey.get(key) : undefined;
    if (!exact && !used.has(id)) continue;
    const drum = typeof body?.midiDrum === 'number' ? body.midiDrum : drumByKey.get(key);
    const program = typeof body?.midiProgram === 'number' && Number.isInteger(body.midiProgram)
      && body.midiProgram >= 0 && body.midiProgram < 128 ? body.midiProgram : undefined;
    const alias = typeof tone.name === 'string' ? melodyByName.get(tone.name) : undefined;
    const instrument = exact ?? (drum === undefined
      ? program === undefined ? alias ?? studioInstrumentForMidi(0) : studioInstrumentForMidi(program)
      : melodyByKey.get(drum <= 50 ? 'studio-bass' : 'studio-guitar')!);
    if (!exact) {
      tone.body = { model: 'sample-bank', version: 1, bank: studioBank, instrument: instrument.key,
        attackSeconds: 0, releaseSeconds: .03, level: typeof body?.level === 'number' ? body.level : .7,
        ...(drum !== undefined ? { midiDrum: drum } : program !== undefined ? { midiProgram: program } : {}) };
      tone.dependencies = [];
      changed = true;
    }
    if (tone.name !== instrument.name) { tone.name = instrument.name; changed = true; }
    if (id !== undefined) names.set(id, instrument.name);
  }
  for (const part of parts) {
    const name = names.get(part.timbreId);
    if (name !== undefined && part.name !== name) { part.name = name; changed = true; }
  }
  return changed ? JSON.stringify(state) : text;
}
