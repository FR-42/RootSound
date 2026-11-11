import type { SampleBankAudio } from '../src/workstation/modules/timbre/sample-bank.ts';
/** Score/UI clock tests use a tiny prepared voice; actual bank loading is covered separately. */
export const musicClockVoice: SampleBankAudio = {
  async prepare() {},
  plan(body,note) { return {kind:'sample',version:1,source:{id:'clock-fixture',revision:1,audio:{sampleRate:8000,channels:[new Float32Array([0,.1,0,-.1,0,.1,0,-.1])]}},
    startSeconds:0,endSeconds:.001,playbackRate:1,envelope:{attackSeconds:0,releaseSeconds:.01},note,level:body.level}; },
};
