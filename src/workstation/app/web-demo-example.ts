import { createWebDemoModel, checkWebScore, WEB_TONES } from './web-demo-model.ts';
import { readPhraseBody } from '../modules/phrase/public.ts';
import type { PhraseBody, PhrasePart } from '../contracts/phrase.ts';

type Model = ReturnType<typeof createWebDemoModel>;
export type WebExample = {
  format: 'RootSoundWebExample'; version: 1; name: string;
  body: Omit<PhraseBody, 'parts'> & { parts: Array<Omit<PhrasePart, 'timbreId'> & { tone: typeof WEB_TONES[number] }> };
};

/** Share the exact score without duplicating embedded recordings or local paths. */
export function webExampleSnapshot(model: Model): WebExample {
  const view = model.score.read();
  const body = structuredClone(view.body!);
  return { format: 'RootSoundWebExample', version: 1, name: view.draft!.name,
    body: { ...body, parts: body.parts.map(({ timbreId, ...part }) => {
      const voice = model.palette.find(tone => tone.id === timbreId);
      if (!voice) throw new Error('示例包含网页版未提供的音色。');
      return { ...part, tone: voice.key as typeof WEB_TONES[number] };
    }) } };
}

/** Each visitor receives a fresh editable document; edits never rewrite the example. */
export function createWebExampleModel(input: unknown, fetcher: typeof fetch = globalThis.fetch, instrumentKeys?: readonly string[]): Model {
  const example = input as WebExample;
  if (example?.format !== 'RootSoundWebExample' || example.version !== 1 || typeof example.name !== 'string')
    throw new Error('网页示例格式无效。');
  const model = createWebDemoModel(undefined, example.name, fetcher, instrumentKeys);
  const body = readPhraseBody({ ...example.body, parts: example.body.parts.map(({ tone, ...part }) => {
    const voice = model.palette.find(voice => voice.key === tone);
    if (!voice) throw new Error('示例包含网页版未提供的音色。');
    return { ...part, timbreId: voice.id };
  }) });
  checkWebScore(body);
  model.library.updateDraft(model.score.read().draft!.id, { body, dependencies: [...new Set(body.parts.map(part => part.timbreId))] });
  return model;
}
