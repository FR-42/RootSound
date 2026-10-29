import { SpectralSynth } from './dsp.mjs';

const BaseProcessor = globalThis.AudioWorkletProcessor ?? class { constructor() { this.port = { onmessage: null, postMessage() {} }; } };
export class SpectralSynthProcessor extends BaseProcessor {
  constructor() {
    super();
    this.synth = null; this.frames = 0; this.failed = false;
    this.rate = globalThis.sampleRate ?? 48000;
    this.port.onmessage = event => {
      const message = event.data;
      try {
        if (message.type === 'patch') {
          if (!message.prepared) throw new Error('请先在后台准备音色。');
          if (this.synth) this.synth.setPatch(message.patch, message.prepared);
          else this.synth = new SpectralSynth(this.rate, message.patch, message.prepared);
          this.failed = false;
        } else if (message.type === 'noteOn') {
          if (!this.synth) throw new Error('音色尚未准备。');
          this.synth.noteOn(message);
        } else if (message.type === 'noteOff') this.synth?.noteOff(message.id);
        else if (message.type === 'allNotesOff') this.synth?.allNotesOff(message.immediate === true);
        else throw new Error('不支持这个演奏请求。');
      } catch (error) { this.port.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) }); }
    };
    this.port.postMessage({ type: 'ready' });
  }
  process(_inputs, outputs) {
    const output = outputs[0]; if (!output?.length) return true;
    if (!output[1]) { output[0].fill(0); return true; }
    try {
      if (this.synth) this.synth.process(output[0], output[1]);
      else { output[0].fill(0); output[1].fill(0); }
      this.frames += output[0].length;
      if (this.frames >= this.rate / 5) {
        this.frames = 0; this.port.postMessage({ type: 'status', voices: this.synth?.activeVoices ?? 0,
          voiceLimit: this.synth?.voiceLimit ?? 0, peak: this.synth?.lastPeak ?? 0 });
      }
    } catch (error) {
      output[0].fill(0); output[1].fill(0); this.synth?.clear();
      if (!this.failed) this.port.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
      this.failed = true;
    }
    return true;
  }
}

if (typeof globalThis.registerProcessor === 'function') globalThis.registerProcessor('rootsound-spectral-synth', SpectralSynthProcessor);
