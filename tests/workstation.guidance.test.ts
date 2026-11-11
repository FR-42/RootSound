import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLearningSettings, restartLearning, LEARNING_KEY } from '../src/workstation/app/platform/learning-settings.ts';
import { createPracticeFactory } from '../src/workstation/app/practice-document.ts';
import { guideDuration, guideScenes, guideSceneAt, guideSceneStart, needsTempoRolls } from '../src/workstation/modules/ui-rendering/guidance-flow.ts';

function storage() {
  const map = new Map<string, string>([['music', 'untouched user score']]);
  return { map, getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); } };
}
test('learning defaults to one roll, retains completion and skip independently, and never writes music', () => {
  const store = storage(), prefs = createLearningSettings(store);
  assert.equal(prefs.read().multipleTempoRolls, false); assert.equal(prefs.read().guides.basics.status, 'new');
  assert.equal(store.map.size, 1, 'a status read is not an automatic write');
  prefs.record('basics', { status: 'skipped', step: 3 }); prefs.setMultipleTempoRolls(true);
  prefs.record('tempo-rolls', { status: 'learning', step: 2 });
  const next = createLearningSettings(store).read(); assert.equal(next.guides.basics.status, 'skipped'); assert.equal(next.guides['tempo-rolls'].step, 2);
  next.guides.basics.status = 'new'; assert.equal(prefs.read().guides.basics.status, 'skipped');
  assert.equal(store.map.get('music'), 'untouched user score');
});
test('failed local persistence cannot silently enable an advanced feature', () => {
  const prefs = createLearningSettings({ getItem: () => null, setItem() { throw new Error('quota'); } });
  assert.throws(() => prefs.setMultipleTempoRolls(true), /设置未能保存/);
  assert.equal(prefs.read().multipleTempoRolls, false);
  for (const malformed of ['not json', JSON.stringify({ version: 0 }), JSON.stringify({ version: 1, guides: { basics: { status: 'completed', step: -1 } } })]) {
    assert.equal(createLearningSettings({ getItem: () => malformed, setItem() {} }).read().guides.basics.status, 'new');
  }
});
test('demonstration scenes advance by time alone with no action prerequisite', () => {
  for (const id of ['basics', 'tempo-rolls'] as const) {
    const scenes = guideScenes(id);
    for (let index = 0; index < scenes.length; index++) {
      const start = guideSceneStart(id, index);
      assert.equal(guideSceneAt(id, start + .01), index);
      if (index) assert.equal(guideSceneAt(id, start - .01), index - 1);
    }
    assert.equal(guideSceneAt(id, guideDuration(id)), scenes.length - 1);
    assert.equal(guideSceneAt(id, -100), 0);
    assert.equal(guideSceneAt(id, NaN), 0);
    assert.equal(guideSceneAt(id, guideDuration(id) + 100), scenes.length - 1);
  }
  assert.equal(guideScenes('basics')[0]!.id, 'rows');
  assert.equal(needsTempoRolls(undefined), false); assert.equal(needsTempoRolls({ tempoSections: [] }), false);
  assert.equal(needsTempoRolls({ tempoSections: [{ id: 'second', startBeat: 8, tempoBpm: 90 }] }), true);
});
test('practice is an original playable short score isolated from other practice copies and user data', () => {
  const store = storage(); let saves = 0;
  const factory = createPracticeFactory(store, async () => { saves++; return 'saved'; });
  const first = factory('basics', false), second = factory('basics', false);
  const before = structuredClone(second.phrase.read().body!);
  assert.equal(before.tempoBpm, 110); assert.equal(before.lengthBeats, 16); assert.equal(needsTempoRolls(before), false);
  assert(before.parts.filter(part => part.notes.length).length >= 2);
  assert(before.parts.reduce((n, part) => n + part.notes.length, 0) <= 32);
  const group = first.phrase.read().body!.parts[0]!;
  first.phrase.updateNote(group.id, group.notes[0]!.id, { frequencyHz: 440 }); first.remember();
  assert.deepEqual(second.phrase.read().body, before);
  const resumed = factory('basics', true); assert.equal(resumed.phrase.read().body!.parts[0]!.notes[0]!.frequencyHz, 440);
  assert.equal(store.map.get('music'), 'untouched user score'); assert.equal(saves, 0, 'remembering a lesson is not saving a music file');
  assert(!store.map.has(LEARNING_KEY), 'document storage never changes feature choices');
});

test('the basic tour contains only the roll coordinates, selection and mouse workflow', () => {
  const scenes = guideScenes('basics');
  assert.deepEqual(scenes.map(scene => scene.id),
    ['rows', 'columns', 'pan', 'note', 'note-pan', 'group', 'add', 'draw', 'move', 'resize', 'deselect']);
  assert(scenes.every(scene => !('title' in scene) && !('caption' in scene) && !('prompt' in scene)));
  assert(guideDuration('basics') < 60);
});

test('explicit restart resets both lessons while retaining feature choices, practice and music', () => {
  const store = storage(), settings = createLearningSettings(store);
  settings.setMultipleTempoRolls(true);
  settings.record('basics', { status: 'completed', step: 10 });
  settings.record('tempo-rolls', { status: 'learning', step: 2 });
  store.setItem('rootsound.practice.basics.v1', 'preserved practice');
  restartLearning(store);
  const next = createLearningSettings(store).read();
  assert.equal(next.multipleTempoRolls, true);
  assert.deepEqual(next.guides.basics, { status: 'new', step: 0 });
  assert.deepEqual(next.guides['tempo-rolls'], { status: 'new', step: 0 });
  assert.equal(store.getItem('music'), 'untouched user score');
  assert.equal(store.getItem('rootsound.practice.basics.v1'), 'preserved practice');
});

test('old in-progress step numbers restart safely; old completions remain completed', () => {
  const store = storage();
  store.setItem(LEARNING_KEY, JSON.stringify({ version: 1, lessonVersion: 4, multipleTempoRolls: true, guides: {
    basics: { status: 'learning', step: 17 }, 'tempo-rolls': { status: 'completed', step: 4 },
  } }));
  const next = createLearningSettings(store).read();
  assert.deepEqual(next.guides.basics, { status: 'new', step: 0 });
  assert.equal(next.guides['tempo-rolls'].status, 'completed');
  assert.equal(next.multipleTempoRolls, true);
});


test('workbench is opt-in and survives reopening independently of tempo rolls', () => {
  const store = storage(), settings = createLearningSettings(store);
  assert.equal(settings.read().workbench, false);
  settings.setWorkbench(true);
  const reopened = createLearningSettings(store);
  assert.equal(reopened.read().workbench, true);
  assert.equal(reopened.read().multipleTempoRolls, false);
  reopened.setWorkbench(false);
  assert.equal(createLearningSettings(store).read().workbench, false);
});
