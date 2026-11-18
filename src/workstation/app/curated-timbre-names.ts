import { listDefaultInstruments, studioBank } from '../modules/timbre/instrument-catalog.ts';
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

export function normalizeImportedTimbreNames(text: string): string {
  if (!text.includes('"midiProgram"') && !text.includes('"midiDrum"')) return text;
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
