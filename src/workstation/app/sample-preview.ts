import type { SamplingPort } from '../contracts/sampling.ts';
import type { SoundRuntimePort } from '../contracts/sound.ts';

/** Decoding may finish after navigation; it must never start an unsolicited late audition. */
export async function previewSavedSample(sampling: Pick<SamplingPort, 'audioForSaved'>,
  sound: Pick<SoundRuntimePort, 'previewAudio'>, id: string, signal?: AbortSignal) {
  if (signal?.aborted) throw new Error('这次试听已取消。');
  const audio = await sampling.audioForSaved(id);
  if (signal?.aborted) throw new Error('这次试听已取消。');
  return sound.previewAudio(audio);
}
