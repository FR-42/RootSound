import { DOMParser, type Element } from '@xmldom/xmldom';
import { unzipSync, zipSync, strToU8, strFromU8 } from 'fflate';
import type { ExchangeNote, ExchangeScore } from './music-interchange-model.ts';

const MAX_XML_BYTES = 32 * 1024 * 1024;
function parse(text: string) {
  if (/<!ENTITY\s/iu.test(text)) throw new Error('不支持含自定义实体的 MusicXML 文件。');
  // xmldom does not fetch a public MusicXML DTD or any external resources.
  return new DOMParser({ onError: level => { if (level !== 'warning') throw new Error('MusicXML 文件格式有误。'); } }).parseFromString(text, 'application/xml');
}
function children(node: Element, tag?: string): Element[] {
  const result: Element[] = [];
  for (let child = node.firstChild; child; child = child.nextSibling) if (child.nodeType === 1) {
    const element = child as Element; if (!tag || element.localName === tag) result.push(element);
  }
  return result;
}
const child = (node: Element, tag: string) => children(node, tag)[0];
const text = (node: Element, tag: string) => child(node, tag)?.textContent?.trim() ?? '';
function numeric(node: Element, tag: string, fallback = 0): number {
  const value = text(node, tag); if (!value) return fallback;
  const result = Number(value); if (!Number.isFinite(result)) throw new Error(`MusicXML 的 ${tag} 不是有效数字。`); return result;
}
function positive(value: number, label: string): number { if (!(value > 0)) throw new Error(`MusicXML 的 ${label} 必须大于零。`); return value; }
function unpack(bytes: Uint8Array, compressed: boolean): string {
  if (!compressed) return new TextDecoder(bytes[0] === 255 && bytes[1] === 254 ? 'utf-16le' : bytes[0] === 254 && bytes[1] === 255 ? 'utf-16be' : 'utf-8', { fatal: true }).decode(bytes);
  const container = unzipSync(bytes, { filter: item => item.name === 'META-INF/container.xml' && item.originalSize <= 65536 });
  if (!container['META-INF/container.xml']) throw new Error('MXL 缺少 META-INF/container.xml。');
  const manifest = parse(strFromU8(container['META-INF/container.xml']));
  const rootfiles = Array.from(manifest.getElementsByTagName('rootfile'));
  const root = rootfiles.find(item => item.getAttribute('media-type') === 'application/vnd.recordare.musicxml+xml') ?? rootfiles[0];
  const path = root?.getAttribute('full-path');
  if (!path || path.includes('..') || /^[\\/]/u.test(path)) throw new Error('MXL 的乐谱路径无效。');
  const entries = unzipSync(bytes, { filter: item => item.name === path && item.originalSize <= MAX_XML_BYTES });
  if (!entries[path]) throw new Error('MXL 的乐谱缺失或超过 32 MiB。');
  return strFromU8(entries[path]);
}

/** MusicXML partwise and timewise scores: voices, chords, ties, transposition and tempi. */
export function readExchangeXml(bytes: Uint8Array, name: string, compressed: boolean): { score: ExchangeScore; warnings: string[] } {
  const xml = parse(unpack(bytes, compressed)), root = xml.documentElement;
  if (!root || !['score-partwise', 'score-timewise'].includes(root.localName ?? '')) throw new Error('这个 XML 不是 MusicXML 乐谱。');
  const partList = child(root, 'part-list'); if (!partList) throw new Error('MusicXML 缺少声部列表。');
  const warnings = new Set<string>(), parts: ExchangeScore['parts'] = [], tempoMap = new Map<number, number>([[0, 120]]);
  let scoreLength = .25;
  for (const definition of children(partList, 'score-part')) {
    const partId = definition.getAttribute('id')!, title = text(definition, 'part-name') || partId;
    const instruments = children(definition, 'midi-instrument');
    const instrumentMap = new Map(instruments.map(item => [item.getAttribute('id'), {
      program: Math.max(0, Math.min(127, numeric(item, 'midi-program', 1) - 1)),
      drum: text(item, 'midi-unpitched') ? numeric(item, 'midi-unpitched') - 1 : undefined,
      level: Math.max(0, Math.min(1, numeric(item, 'volume', 100) / 100)), pan: Math.max(-1, Math.min(1, numeric(item, 'pan') / 90)),
    }]));
    const defaultInstrument = [...instrumentMap.values()][0] ?? { program: 0, drum: undefined, level: 1, pan: 0 };
    const groups = new Map<string, ExchangeScore['parts'][number]>();
    const ties = new Map<string, ExchangeNote>();
    let divisions = 1, barLength = 4, transpose = 0, position = 0, velocity = .75;
    const measures: Element[] = root.localName === 'score-partwise'
      ? children(children(root, 'part').find(item => item.getAttribute('id') === partId) ?? root, 'measure')
      : children(root, 'measure').map(measure => children(measure, 'part').find(item => item.getAttribute('id') === partId)).filter((item): item is Element => !!item);
    for (const measure of measures) {
      let cursor = 0, extent = 0, chordAt = 0;
      for (const item of children(measure)) {
        if (item.localName === 'attributes') {
          divisions = positive(numeric(item, 'divisions', divisions), 'divisions');
          const time = child(item, 'time');
          if (time) {
            const beats = text(time, 'beats').split('+').reduce((sum, part) => sum + Number(part), 0);
            if (beats) barLength = positive(beats * 4 / positive(numeric(time, 'beat-type', 4), 'beat-type'), '小节长度');
          }
          const trans = child(item, 'transpose'); if (trans) transpose = numeric(trans, 'chromatic') + numeric(trans, 'octave-change') * 12;
        } else if (item.localName === 'backup') cursor -= numeric(item, 'duration') / divisions;
        else if (item.localName === 'forward') { cursor += numeric(item, 'duration') / divisions; extent = Math.max(extent, cursor); }
        else if (item.localName === 'direction' || item.localName === 'sound') {
          const sound = item.localName === 'sound' ? item : child(item, 'sound');
          const offset = numeric(item, 'offset') / divisions, at = Math.max(0, position + cursor + offset);
          const tempo = Number(sound?.getAttribute('tempo'));
          if (tempo > 0) tempoMap.set(at, tempo);
          else {
            const metronome = item.getElementsByTagName('metronome')[0];
            if (metronome) {
              const unit = text(metronome, 'beat-unit'), factors: Record<string, number> = { whole: 4, half: 2, quarter: 1, eighth: .5, '16th': .25 };
              const perMinute = numeric(metronome, 'per-minute');
              if (perMinute > 0) tempoMap.set(at, perMinute * (factors[unit] ?? 1) * (children(metronome, 'beat-unit-dot').length ? 1.5 : 1));
            }
          }
          const dynamics = Number(sound?.getAttribute('dynamics')); if (sound?.hasAttribute('dynamics') && dynamics >= 0) velocity = Math.min(1, dynamics / 100);
          if (sound) for (const setting of children(sound, 'midi-instrument')) {
            const instrument = instrumentMap.get(setting.getAttribute('id')) ?? defaultInstrument;
            if (text(setting, 'pan')) instrument.pan = Math.max(-1, Math.min(1, numeric(setting, 'pan') / 90));
            if (text(setting, 'volume')) instrument.level = Math.max(0, Math.min(1, numeric(setting, 'volume') / 100));
          }
        } else if (item.localName === 'note') {
          const duration = numeric(item, 'duration') / divisions;
          if (child(item, 'grace')) { warnings.add('装饰音尚未展开为实际演奏。'); continue; }
          const chord = !!child(item, 'chord'), start = position + (chord ? chordAt : cursor);
          if (!chord) { chordAt = cursor; cursor += duration; }
          extent = Math.max(extent, cursor);
          if (child(item, 'rest')) continue;
          if (!(duration > 0) || start < 0) throw new Error('MusicXML 音符时值或位置无效。');
          const inst = child(item, 'instrument')?.getAttribute('id');
          const instrument = instrumentMap.get(inst ?? '') ?? defaultInstrument;
          const pitchNode = child(item, 'pitch'), unpitched = child(item, 'unpitched');
          const pitches: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
          const pitch = pitchNode ? (numeric(pitchNode, 'octave', 4) + 1) * 12 + (pitches[text(pitchNode, 'step')] ?? NaN)
            + numeric(pitchNode, 'alter') + transpose : unpitched ? instrument.drum ?? 38 : NaN;
          if (!Number.isFinite(pitch)) throw new Error('MusicXML 音高无效。');
          const drum = unpitched ? instrument.drum ?? 38 : undefined;
          const key = `${instrument.program}:${drum ?? ''}`;
          let group = groups.get(key); if (!group) { group = { name: title, program: instrument.program, ...(drum === undefined ? {} : { drum }), notes: [] }; groups.set(key, group); }
          const tieElements = [...children(item, 'tie'), ...Array.from(item.getElementsByTagName('tied'))];
          const tieKey = `${key}:${text(item, 'voice')}:${text(item, 'staff')}:${pitch}`, previous = ties.get(tieKey);
          const stop = tieElements.some(tie => tie.getAttribute('type') === 'stop'), begin = tieElements.some(tie => tie.getAttribute('type') === 'start');
          let note: ExchangeNote;
          if (stop && previous && Math.abs(previous.beat + previous.duration - start) < 1e-7) { previous.duration += duration; note = previous; }
          else { note = { beat: start, duration, pitch, velocity, level: instrument.level, pan: instrument.pan }; group.notes.push(note); }
          if (begin) ties.set(tieKey, note); else ties.delete(tieKey);
        }
      }
      const implicit = measure.getAttribute('implicit') === 'yes' || root.localName === 'score-timewise' && (measure.parentNode as Element).getAttribute('implicit') === 'yes';
      position += implicit ? Math.max(.000001, extent) : Math.max(extent, barLength);
      scoreLength = Math.max(scoreLength, position);
    }
    parts.push(...groups.values());
  }
  if (root.getElementsByTagName('repeat').length) warnings.add('反复记号暂按谱面顺序播放一遍。');
  if (root.getElementsByTagName('ornaments').length || root.getElementsByTagName('articulations').length) warnings.add('装饰音及部分演奏法未转成发声效果。');
  const tempos = [...tempoMap].sort((a, b) => a[0] - b[0]).filter(([beat]) => beat < scoreLength).map(([beat, bpm]) => ({ beat, bpm }));
  return { score: { name, length: scoreLength, tempos, parts }, warnings: [...warnings] };
}
const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
/** Each note has its own voice, so arbitrary overlaps do not become accidental chords. */
export function writeExchangeXml(score: ExchangeScore, compressed: boolean): Uint8Array {
  if (!score.parts.length) score = { ...score, parts: [{ name: '音乐', program: 0, notes: [] }] };
  const divisions = 9600, ticks = (beat: number) => Math.round(beat * divisions);
  const definitions = score.parts.map((part, i) => `<score-part id="P${i}"><part-name>${escape(part.name)}</part-name><score-instrument id="I${i}"><instrument-name>${escape(part.name)}</instrument-name></score-instrument><midi-instrument id="I${i}"><midi-channel>${part.drum === undefined ? i % 9 + 1 : 10}</midi-channel><midi-program>${part.program + 1}</midi-program>${part.drum === undefined ? '' : `<midi-unpitched>${part.drum + 1}</midi-unpitched>`}</midi-instrument></score-part>`).join('');
  const parts = score.parts.map((part, i) => {
    const bars = Array.from({ length: Math.max(1, Math.ceil(score.length / 4)) }, (_, bar) => {
      const start = bar * 4, length = Math.min(4, score.length - start), finish = start + length;
      const tempi = i ? '' : score.tempos.filter(point => point.beat >= start && point.beat < finish).map(point => `<sound tempo="${point.bpm}"><offset>${ticks(point.beat - start)}</offset></sound>`).join('');
      const notes = part.notes.map((note, index) => {
      if (note.beat >= finish || note.beat + note.duration <= start) return '';
      const midi = Math.round(note.pitch), names = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
      const chroma = ((midi % 12) + 12) % 12, sourceOctave = Math.floor(midi / 12) - 1;
      // MusicXML octave numbers start at0; a chromatic alteration keeps MIDI's
      // lower octave exact without writing the invalid octave number -1.
      const octave = Math.max(0, sourceOctave), alter = ([1, 3, 6, 8, 10].includes(chroma) ? 1 : 0) + 12 * (sourceOctave - octave);
      const pitch = part.drum === undefined ? `<pitch><step>${names[chroma]}</step>${alter ? `<alter>${alter}</alter>` : ''}<octave>${octave}</octave></pitch>`
        : '<unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched>';
      const offset = ticks(Math.max(start,note.beat)-start), gate = Math.max(1, ticks(Math.min(finish,note.beat+note.duration)-start) - offset);
      const ties = `${note.beat < start ? '<tie type="stop"/>' : ''}${note.beat + note.duration > finish ? '<tie type="start"/>' : ''}`;
      return `${offset ? `<forward><duration>${offset}</duration></forward>` : ''}<sound dynamics="${note.velocity * note.level * 100}"><midi-instrument id="I${i}"><volume>100</volume><pan>${note.pan * 90}</pan></midi-instrument></sound><note>${pitch}<duration>${gate}</duration>${ties}<instrument id="I${i}"/><voice>${index + 1}</voice></note><backup><duration>${offset + gate}</duration></backup>`;
    }).join('');
      return `<measure number="${bar+1}"${length<4?' implicit="yes"':''}>${bar?'':`<attributes><divisions>${divisions}</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>`}${tempi}${notes}<forward><duration>${ticks(length)}</duration></forward></measure>`;
    }).join('');
    return `<part id="P${i}">${bars}</part>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="utf-8"?><score-partwise version="4.0"><work><work-title>${escape(score.name)}</work-title></work><part-list>${definitions}</part-list>${parts}</score-partwise>`;
  if (!compressed) return strToU8(xml);
  return zipSync({ mimetype: [strToU8('application/vnd.recordare.musicxml'), { level: 0 }],
    'META-INF/container.xml': strToU8('<?xml version="1.0"?><container><rootfiles><rootfile full-path="score.musicxml" media-type="application/vnd.recordare.musicxml+xml"/></rootfiles></container>'),
    'score.musicxml': strToU8(xml) });
}
