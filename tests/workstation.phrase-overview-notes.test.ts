import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { KeyboardPitch, PhraseBody, PhraseNote, PhrasePart } from '../src/workstation/contracts/phrase.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor } from '../src/workstation/modules/phrase/public.ts';
import { createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { buildPhraseToneColors, centerTop, mountPhraseOverviewNotes, toneColor } from '../src/workstation/modules/ui-rendering/phrase-overview-notes.ts';

class Element {
  className = ''; dataset: Record<string, string> = {}; style: Record<string, string> = {};
  attributes = new Map<string, string>(); children: Element[] = []; parentElement?: Element;
  classList = { contains: (name: string) => this.className.split(' ').includes(name),
    toggle: (name: string, enabled: boolean) => {
      const names = this.className.split(' ').filter(value => value && value !== name);
      if (enabled) names.push(name); this.className = names.join(' '); return enabled;
    } };
  append(...nodes: Element[]) { for (const node of nodes) { node.remove(); node.parentElement = this; this.children.push(node); } }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(node => node !== this); this.parentElement = undefined; }
  setAttribute(key: string, value: string) { this.attributes.set(key, value); }
  addEventListener(): never { throw new Error('the overview must not register note editing or audition handlers'); }
}
function dom() {
  let created = 0;
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement() { created++; return new Element(); } } });
  return { root: new Element(), created: () => created, restore() {
    if (previous) Object.defineProperty(globalThis, 'document', previous); else Reflect.deleteProperty(globalThis, 'document');
  } };
}
const library = createMaterialLibrary();
const keyboard = createPhraseEditor(library, createTimbrePlayback(library)).keyboard();
const pitch = (label: string) => keyboard.find(key => key.label === label)!.frequencyHz;
const simpleKeys: KeyboardPitch[] = [
  { label: 'B3', frequencyHz: 246.941650628, accidental: false },
  { label: 'C4', frequencyHz: 261.625565301, accidental: false },
  { label: 'D4', frequencyHz: 293.664767917, accidental: false },
];
const note = (id: string, changes: Partial<PhraseNote> = {}): PhraseNote => ({
  id, startBeat: 2, durationBeats: 1, frequencyHz: simpleKeys[1]!.frequencyHz, velocity: .75, ...changes,
});
const part = (id: string, notes: PhraseNote[], changes: Partial<PhrasePart> = {}): PhrasePart => ({
  id, name: id, timbreId: 'tone-' + id, notes, ...changes,
});
const body = (parts: PhrasePart[], tempoBpm = 120): PhraseBody => ({
  model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm, lengthBeats: 16, parts,
});
const baseView = { horizontal: { leftSeconds: 0, zoom: 1 }, top: 0, width: 800, height: 300 };
const pixels = (element: Element, name: string) => Number.parseFloat(element.style[name]!);
const find = (root: Element, id: string) => root.children.find(element => element.dataset.noteId === id);
const close = (actual: number, expected: number) => assert(Math.abs(actual - expected) < 1e-7, actual + ' != ' + expected);
function frozen<T>(value: T): T {
  if (value && typeof value === 'object') { Object.freeze(value); for (const item of Object.values(value)) frozen(item); }
  return value;
}

test('overview separates melody and rhythm using complete pitch rows and independent rhythm part rows', () => {
  const environment = dom(); const rhythmRoot = new Element();
  const melody = mountPhraseOverviewNotes(environment.root as unknown as HTMLElement, 'melody', keyboard);
  const rhythm = mountPhraseOverviewNotes(rhythmRoot as unknown as HTMLElement, 'rhythm', keyboard);
  const descending = [...keyboard].sort((a, b) => b.frequencyHz - a.frequencyHz);
  const c4Row = descending.findIndex(key => key.label === 'C4');
  const input = frozen(body([
    part('lead', [note('lead-note', { frequencyHz: pitch('C4') })], { section: 'melody' }),
    part('legacy', [note('legacy-note', { frequencyHz: pitch('D4') })]),
    part('kick', [note('kick-note', { frequencyHz: pitch('C1') })], { section: 'rhythm' }),
    part('snare', [note('snare-note', { frequencyHz: pitch('C7') })], { section: 'rhythm', unassigned: true }),
  ]));
  const before = JSON.stringify(input);
  try {
    melody.update({ ...baseView, body: input, top: (c4Row - 2) * 24 });
    rhythm.update({ ...baseView, body: input });
    assert.deepEqual(environment.root.children.map(element => element.dataset.partId), ['lead', 'legacy']);
    assert.deepEqual(rhythmRoot.children.map(element => element.dataset.partId), ['kick', 'snare']);
    close(pixels(find(environment.root, 'lead-note')!, 'top'), 49);
    close(pixels(find(environment.root, 'legacy-note')!, 'top'), 1);
    close(pixels(find(rhythmRoot, 'kick-note')!, 'top'), 7);
    close(pixels(find(rhythmRoot, 'snare-note')!, 'top'), 79);
    assert(find(rhythmRoot, 'snare-note')!.classList.contains('is-unassigned'));
    assert.equal(find(rhythmRoot, 'snare-note')!.style.backgroundColor, '#b6bcc4');
    assert.equal(JSON.stringify(input), before);
    assert(environment.root.children.every(element => element.classList.contains('phrase-overview-note')));
    assert(environment.root.children.every(element => element.attributes.get('aria-hidden') === 'true'));
  } finally { melody.dispose(); rhythm.dispose(); environment.restore(); }
});

test('shared seconds, zoom and tempo move both previews equally without stretching explicit held seconds', () => {
  const environment = dom(); const rhythmRoot = new Element();
  const melody = mountPhraseOverviewNotes(environment.root as unknown as HTMLElement, 'melody', simpleKeys);
  const rhythm = mountPhraseOverviewNotes(rhythmRoot as unknown as HTMLElement, 'rhythm', simpleKeys);
  const input = body([
    part('lead', [note('held', { durationBeats: .25, durationSeconds: 1.5 }), note('old-note', { frequencyHz: simpleKeys[2]!.frequencyHz })]),
    part('beat', [note('hit', { durationSeconds: 1.5 })], { section: 'rhythm' }),
  ]);
  const horizontal = { leftSeconds: .25, zoom: 2 };
  try {
    melody.update({ ...baseView, body: input, horizontal });
    rhythm.update({ ...baseView, body: input, horizontal });
    close(pixels(find(environment.root, 'held')!, 'left'), 150);
    close(pixels(find(environment.root, 'held')!, 'width'), 300);
    close(pixels(find(environment.root, 'old-note')!, 'width'), 100);
    close(pixels(find(rhythmRoot, 'hit')!, 'left'), 150);
    close(pixels(find(rhythmRoot, 'hit')!, 'width'), 300);
    const faster = { ...input, tempoBpm: 240 };
    melody.update({ ...baseView, body: faster, horizontal });
    rhythm.update({ ...baseView, body: faster, horizontal });
    close(pixels(find(environment.root, 'held')!, 'left'), 50);
    close(pixels(find(environment.root, 'held')!, 'width'), 300);
    close(pixels(find(environment.root, 'old-note')!, 'width'), 50);
    close(pixels(find(rhythmRoot, 'hit')!, 'left'), 50);
    const rhythmY = find(rhythmRoot, 'hit')!.style.top;
    melody.update({ ...baseView, body: faster, horizontal, top: 12, rowHeight: 36 });
    assert.equal(find(rhythmRoot, 'hit')!.style.top, rhythmY, 'melody vertical changes do not move rhythm');
    assert.equal(input.tempoBpm, 120);
  } finally { melody.dispose(); rhythm.dispose(); environment.restore(); }
});

test('unified creation previews legacy rhythm notes at their pitches without rewriting data or duplicating returning nodes', () => {
  const environment = dom(); const renderer = mountPhraseOverviewNotes(environment.root as unknown as HTMLElement, 'melody', simpleKeys, { includeAllSections: true });
  const input = frozen(body([
    part('lead', [note('shared-note-id', { frequencyHz: simpleKeys[1]!.frequencyHz })]),
    part('old-rhythm', [note('shared-note-id', { frequencyHz: simpleKeys[2]!.frequencyHz, durationSeconds: 1.5 })], { section: 'rhythm' }),
    part('unassigned-rhythm', [note('unassigned', { frequencyHz: simpleKeys[0]!.frequencyHz })], { section: 'rhythm', unassigned: true }),
  ]));
  const before = JSON.stringify(input);
  const view = { ...baseView, body: input, height: 72 };
  try {
    renderer.update(view);
    assert.deepEqual(environment.root.children.map(element => element.dataset.partId), ['lead', 'old-rhythm', 'unassigned-rhythm']);
    const lead = environment.root.children.find(element => element.dataset.partId === 'lead')!;
    const oldRhythm = environment.root.children.find(element => element.dataset.partId === 'old-rhythm')!;
    assert.notEqual(lead, oldRhythm, 'shared note IDs in different families keep separate identities');
    close(pixels(lead, 'top'), 25); close(pixels(oldRhythm, 'top'), 1);
    close(pixels(oldRhythm, 'width'), 150);
    assert(find(environment.root, 'unassigned')!.classList.contains('is-unassigned'));
    const created = environment.created();
    for (let index = 0; index < 100; index++) renderer.update({ ...view, horizontal: { leftSeconds: index / 200, zoom: 1 } });
    assert.equal(environment.created(), created);
    assert.equal(environment.root.children.find(element => element.dataset.partId === 'old-rhythm'), oldRhythm);
    renderer.update({ ...view, top: 1000 }); assert.equal(environment.root.children.length, 0);
    renderer.update({ ...view, body: JSON.parse(before) as PhraseBody });
    assert.equal(environment.root.children.find(element => element.dataset.partId === 'old-rhythm'), oldRhythm);
    assert.equal(environment.created(), created);
    assert.equal(JSON.stringify(input), before); assert.equal(input.parts[1]!.section, 'rhythm');
  } finally { renderer.dispose(); environment.restore(); }
});

test('preview clips all four viewport edges and reuses visible and returning notes without replacing sibling content', () => {
  const environment = dom(); const marker = new Element(); environment.root.append(marker);
  const renderer = mountPhraseOverviewNotes(environment.root as unknown as HTMLElement, 'melody', simpleKeys);
  const input = frozen(body([part('lead', [note('long', { startBeat: 0, durationSeconds: 1 }),
    note('future', { startBeat: 10, durationSeconds: 1 })])]));
  const view = { ...baseView, body: input, width: 80, height: 20, top: 30, horizontal: { leftSeconds: .2, zoom: 10 } };
  try {
    renderer.update(view);
    const block = find(environment.root, 'long')!;
    close(pixels(block, 'left'), 0); close(pixels(block, 'width'), 80);
    close(pixels(block, 'top'), 0); close(pixels(block, 'height'), 17);
    assert.equal(find(environment.root, 'future'), undefined);
    const created = environment.created();
    for (let index = 0; index < 100; index++) renderer.update({ ...view, horizontal: { ...view.horizontal, leftSeconds: .2 + index / 1000 } });
    assert.equal(environment.created(), created, 'view movement reuses the same note node');
    renderer.update({ ...view, horizontal: { ...view.horizontal, leftSeconds: 4.8 } });
    assert.equal(find(environment.root, 'long'), undefined); assert(find(environment.root, 'future'));
    renderer.update(view); assert.equal(find(environment.root, 'long') === block, true);
    renderer.update({ ...view, top: 1000 }); assert.deepEqual(environment.root.children, [marker]);
    renderer.update(view); assert.equal(find(environment.root, 'long') === block, true);
    renderer.update({ ...view, width: 0 }); assert.deepEqual(environment.root.children, [marker]);
    renderer.update(view); assert.equal(find(environment.root, 'long') === block, true);
    renderer.dispose(); renderer.dispose(); assert.deepEqual(environment.root.children, [marker]);
    renderer.update(view); assert.deepEqual(environment.root.children, [marker]);
  } finally { renderer.dispose(); environment.restore(); }
});

test('tone replacement, unassignment, reordering and reopened snapshots refresh the existing note identity', () => {
  const environment = dom(); const renderer = mountPhraseOverviewNotes(environment.root as unknown as HTMLElement, 'rhythm', simpleKeys);
  const first = part('first', [note('first-note')], { section: 'rhythm', timbreId: 'piano' });
  const second = part('second', [note('second-note')], { section: 'rhythm', timbreId: 'flute' });
  try {
    renderer.update({ ...baseView, body: body([first, second]) });
    const block = find(environment.root, 'first-note')!;
    assert.equal(block.style.backgroundColor, toneColor('piano'));
    renderer.update({ ...baseView, body: body([second, { ...first, timbreId: 'flute' }]) });
    assert.equal(find(environment.root, 'first-note') === block, true);
    close(pixels(block, 'top'), 79); assert.equal(block.style.backgroundColor, toneColor('flute'));
    renderer.update({ ...baseView, body: body([{ ...first, unassigned: true }]) });
    assert(block.classList.contains('is-unassigned')); assert.equal(block.style.backgroundColor, '#b6bcc4');
    assert.equal(find(environment.root, 'second-note'), undefined);
    renderer.update({ ...baseView, body: JSON.parse(JSON.stringify(body([first]))) as PhraseBody });
    assert.equal(find(environment.root, 'first-note') === block, true);
    assert.equal(block.classList.contains('is-unassigned'), false); assert.equal(block.style.backgroundColor, toneColor('piano'));
    renderer.update({ ...baseView }); assert.equal(environment.root.children.length, 0);
    renderer.update({ ...baseView, body: body([first]) }); assert.equal(find(environment.root, 'first-note') === block, false);
  } finally { renderer.dispose(); environment.restore(); }
});

test('tone colors are stable across independent mounts and unaffected by other tones or part order', () => {
  const environment = dom(); const otherRoot = new Element();
  const first = mountPhraseOverviewNotes(environment.root as unknown as HTMLElement, 'melody', simpleKeys);
  const second = mountPhraseOverviewNotes(otherRoot as unknown as HTMLElement, 'rhythm', simpleKeys);
  const melody = part('melody', [note('melody-note')], { timbreId: 'shared-tone' });
  const rhythm = part('rhythm', [note('rhythm-note')], { section: 'rhythm', timbreId: 'shared-tone' });
  try {
    first.update({ ...baseView, body: body([melody]) });
    second.update({ ...baseView, body: body([part('other', [note('other-note')], { section: 'rhythm' }), rhythm]) });
    assert.equal(find(environment.root, 'melody-note')!.style.backgroundColor, find(otherRoot, 'rhythm-note')!.style.backgroundColor);
    assert.equal(toneColor('shared-tone'), toneColor('shared-tone'));
  } finally { first.dispose(); second.dispose(); environment.restore(); }
});

test('initial melody focus uses the full keyboard, ignores rhythm notes, and chooses a populated register', () => {
  const descending = [...keyboard].sort((a, b) => b.frequencyHz - a.frequencyHz);
  const rowHeight = 24; const height = 120;
  const expected = (descending.findIndex(key => key.label === 'C4') + .5) * rowHeight - height / 2;
  const input = frozen(body([part('melody', [note('a', { frequencyHz: pitch('C4') }), note('b', { frequencyHz: pitch('C4') }),
    note('c', { frequencyHz: pitch('C4') }), note('outlier', { frequencyHz: pitch('C7') })]),
  part('rhythm', Array.from({ length: 20 }, (_, index) => note('r-' + index, { frequencyHz: pitch('C1') })), { section: 'rhythm' })]));
  close(centerTop(input, frozen([...keyboard]), height), expected);
  close(centerTop(undefined, keyboard, height), expected);
  close(centerTop(body([part('only-rhythm', [note('r', { frequencyHz: pitch('C1') })], { section: 'rhythm' })]), keyboard, height), expected);
  assert.equal(centerTop(input, [], height), 0);
  assert.equal(centerTop(input, keyboard, keyboard.length * rowHeight + 1), 0);
  const changedHeight = centerTop(input, keyboard, height, 36);
  close(changedHeight, (descending.findIndex(key => key.label === 'C4') + .5) * 36 - height / 2);
});

test('unified creation focus includes preserved rhythm notes while the default melody focus remains compatible', () => {
  const descending = [...keyboard].sort((a, b) => b.frequencyHz - a.frequencyHz);
  const height = 120; const rowHeight = 24;
  const input = frozen(body([
    part('lead', [note('lead', { frequencyHz: pitch('C4') })]),
    part('old-rhythm', Array.from({ length: 12 }, (_, index) => note('hit-' + index, { frequencyHz: pitch('C1') })), { section: 'rhythm' }),
  ]));
  const before = JSON.stringify(input);
  const expected = (label: string) => Math.max(0, Math.min(keyboard.length * rowHeight - height,
    (descending.findIndex(key => key.label === label) + .5) * rowHeight - height / 2));
  close(centerTop(input, keyboard, height), expected('C4'));
  close(centerTop(input, keyboard, height, rowHeight, true), expected('C1'));
  const rhythmOnly = frozen(body([input.parts[1]!]));
  close(centerTop(rhythmOnly, keyboard, height, rowHeight, true), expected('C1'));
  assert.equal(centerTop(input, [], height, rowHeight, true), 0);
  assert.equal(JSON.stringify(input), before);
});

test('the phrase-wide palette resolves eight colliding tones consistently across sections and part reordering', () => {
  const ids = Array.from({ length: 8 }, (_, index) => 'tone-' + String.fromCharCode(97 + index * 8));
  assert.equal(new Set(ids.map(toneColor)).size, 1, 'the fixture deliberately collides in the base hash');
  const expected = buildPhraseToneColors(ids);
  assert.equal(expected.size, 8); assert.equal(new Set(expected.values()).size, 8);
  assert.deepEqual(buildPhraseToneColors([...ids].reverse()), expected);
  assert.deepEqual(buildPhraseToneColors([...ids, ...ids]), expected);
  const environment = dom(); const rhythmRoot = new Element();
  const melody = mountPhraseOverviewNotes(environment.root as unknown as HTMLElement, 'melody', simpleKeys);
  const rhythm = mountPhraseOverviewNotes(rhythmRoot as unknown as HTMLElement, 'rhythm', simpleKeys);
  const parts = ids.map((id, index) => part('m-' + index, [note('mn-' + index)], { timbreId: id }));
  parts.push(part('shared-rhythm', [note('rhythm-collision')], { section: 'rhythm', timbreId: ids[7]! }));
  const input = frozen(body(parts));
  try {
    melody.update({ ...baseView, body: input }); rhythm.update({ ...baseView, body: input });
    assert.equal(new Set(environment.root.children.map(element => element.style.backgroundColor)).size, 8);
    assert.equal(find(environment.root, 'mn-7')!.style.backgroundColor, find(rhythmRoot, 'rhythm-collision')!.style.backgroundColor);
    const oldNode = find(environment.root, 'mn-7');
    const reordered = body([...parts].reverse());
    melody.update({ ...baseView, body: reordered }); rhythm.update({ ...baseView, body: reordered });
    assert.equal(find(environment.root, 'mn-7') === oldNode, true);
    for (let index = 0; index < ids.length; index++) assert.equal(find(environment.root, 'mn-' + index)!.style.backgroundColor, expected.get(ids[index]!));
    assert.equal(find(rhythmRoot, 'rhythm-collision')!.style.backgroundColor, expected.get(ids[7]!));
  } finally { melody.dispose(); rhythm.dispose(); environment.restore(); }
});
