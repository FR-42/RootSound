/* Input-only capture: every output sample stays zero, so the microphone is never monitored. */
class RootSoundCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.maximum = options.processorOptions.maxFrames;
    this.frames = 0;
    this.used = 0;
    this.batch = new Float32Array(4096);
    this.finished = false;
    this.port.onmessage = event => { if (event.data?.type === 'stop') this.finish(); };
  }
  flush() {
    if (!this.used) return;
    const data = this.batch.slice(0, this.used);
    this.port.postMessage({ type: 'chunk', data }, [data.buffer]);
    this.used = 0;
  }
  finish() {
    if (this.finished) return;
    this.finished = true; this.flush(); this.port.postMessage({ type: 'done' });
  }
  process(inputs, outputs) {
    for (const output of outputs) for (const channel of output) channel.fill(0);
    if (this.finished) return false;
    const input = inputs[0]?.[0];
    if (input) {
      for (const value of input) {
        if (this.frames >= this.maximum) break;
        this.batch[this.used++] = value; this.frames++;
        if (this.used === this.batch.length) this.flush();
      }
      if (this.frames >= this.maximum) this.finish();
    }
    return !this.finished;
  }
}
registerProcessor('rootsound-capture', RootSoundCaptureProcessor);
