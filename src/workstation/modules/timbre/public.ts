import type { Draft, JsonValue, MaterialLibrary, SaveConfirmation } from '../../contracts/content.ts';
import type { SoundPlan } from '../../contracts/sound.ts';
import type { TimbreBody, TimbreEditorPort } from '../../contracts/timbre.ts';

export type { TimbreBody, TimbreEditorPort, TimbreView } from '../../contracts/timbre.ts';

const KIND = 'rootsound.timbre';
const OWNER = 'timbre';

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

/** Domain operations use the common custody port, never its internal objects. */
export function createTimbreEditor(library: MaterialLibrary): TimbreEditorPort {
  const drafts = library.listDrafts().filter(d => d.kind === KIND && d.schemaVersion === 1);
  let active: string;
  if (drafts.length) {
    active = drafts[drafts.length - 1]!.id;
    readTimbreBody(drafts[drafts.length - 1]!.body);
  } else {
    const sounds = library.listContent().filter(c => c.kind === KIND && c.schemaVersion === 1);
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
  function modify(change: Partial<TimbreBody>): void {
    const draft = current();
    const body = readTimbreBody({ ...readTimbreBody(draft.body), ...change });
    library.updateDraft(active, { body });
  }
  function changed(draft: Draft): boolean {
    const source = draft.sourceId ? library.readContent(draft.sourceId) : undefined;
    return !source || source.name !== draft.name || JSON.stringify(source.body) !== JSON.stringify(draft.body);
  }

  return {
    read() {
      const draft = current();
      return {
        draft, body: readTimbreBody(draft.body),
        savedSounds: library.listContent().filter(c => c.kind === KIND),
        unfinishedDrafts: library.listDrafts().filter(d => d.kind === KIND && changed(d)),
        changed: changed(draft),
      };
    },
    create() { active = fresh().id; },
    open(contentId) {
      const content = library.readContent(contentId);
      if (!content || content.kind !== KIND || content.schemaVersion !== 1) throw new Error('这份内容目前不能作为音色打开。');
      readTimbreBody(content.body);
      const existing = library.listDrafts().find(d => d.sourceId === contentId);
      active = existing?.id ?? library.createDraft({ sourceId: contentId }).id;
    },
    openDraft(draftId) {
      const draft = library.readDraft(draftId);
      if (!draft || draft.kind !== KIND || draft.schemaVersion !== 1) throw new Error('这份编辑稿目前无法打开。');
      readTimbreBody(draft.body);
      active = draft.id;
    },
    rename(name) {
      const value = name.trim();
      if (!value) throw new Error('给这个声音起个名字吧。');
      library.updateDraft(active, { name: value });
    },
    setCharacter(character) { modify({ character }); },
    setEnvelope(attackSeconds, releaseSeconds) { modify({ attackSeconds, releaseSeconds }); },
    setLevel(level) { modify({ level }); },
    previewPlan(): SoundPlan {
      const body = readTimbreBody(current().body);
      const sources: SoundPlan['sources'] = body.character === 'warm'
        ? [{ waveform: 'sine', frequencyRatio: 1, level: 0.8 }, { waveform: 'triangle', frequencyRatio: 1, level: 0.2 }]
        : body.character === 'clear'
          ? [{ waveform: 'sine', frequencyRatio: 1, level: 0.8 }, { waveform: 'sine', frequencyRatio: 2, level: 0.2 }]
          : [{ waveform: 'triangle', frequencyRatio: 1, level: 0.7 }, { waveform: 'sawtooth', frequencyRatio: 1, level: 0.3 }];
      return {
        kind: 'basic-synth', version: 1, sources,
        envelope: { attackSeconds: body.attackSeconds, releaseSeconds: body.releaseSeconds },
        note: { frequencyHz: 220, holdSeconds: Math.max(1, body.attackSeconds + 0.1), velocity: 0.7 },
        level: body.level,
      };
    },
    save(mode, confirmation?: SaveConfirmation) { return library.saveDraft(active, mode, confirmation); },
  };
}
