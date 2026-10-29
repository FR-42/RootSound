import { normalizePatch, createDefaultPatch, curveValue, envelopeValue, releaseSeconds, effectivePolyphony, VOICE_UNIT_BUDGET, MAX_CURVE_POINTS } from './model.mjs';

const TAU = 2 * Math.PI;
const TABLE = 2048;
const HARMONICS = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1023];
const EQ_LENGTH = 8192;
const BLOCK = 128;
const FFT_BLOCK = BLOCK * 2;
const RATE_OPTIONS = [44100, 48000, 96000];
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const hz = midi => 440 * 2 ** ((midi - 69) / 12);
const finite = (value, label) => { if (!Number.isFinite(value)) throw new Error(`${label}不是有限数值。`); return value; };

/** In-place radix-two FFT. Inverse includes the 1/N normalization. */
export function fft(real, imag, inverse = false) {
  const n = real.length;
  if (n !== imag.length || n < 2 || (n & (n - 1))) throw new Error('FFT需要相同长度的2次幂数组。');
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { const r = real[i], m = imag[i]; real[i] = real[j]; imag[i] = imag[j]; real[j] = r; imag[j] = m; }
  }
  for (let size = 2; size <= n; size <<= 1) {
    const angle = (inverse ? TAU : -TAU) / size;
    const stepR = Math.cos(angle), stepI = Math.sin(angle), half = size >> 1;
    for (let start = 0; start < n; start += size) {
      let wr = 1, wi = 0;
      for (let j = 0; j < half; j++) {
        const a = start + j, b = a + half;
        const br = real[b] * wr - imag[b] * wi, bi = real[b] * wi + imag[b] * wr;
        real[b] = real[a] - br; imag[b] = imag[a] - bi;
        real[a] += br; imag[a] += bi;
        const next = wr * stepR - wi * stepI; wi = wr * stepI + wi * stepR; wr = next;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { real[i] /= n; imag[i] /= n; }
}

function tableFor(oscillator, count) {
  const real = new Float64Array(TABLE), imag = new Float64Array(TABLE);
  for (let h = 1; h <= count; h++) {
    let cosine = 0, sine = 0;
    if (oscillator.waveform === 'sine') sine = h === 1 ? 1 : 0;
    else if (oscillator.waveform === 'saw') sine = -2 / (Math.PI * h);
    else if (oscillator.waveform === 'triangle') sine = h % 2 ? 8 / (Math.PI ** 2 * h ** 2) * (h % 4 === 1 ? 1 : -1) : 0;
    else if (oscillator.waveform === 'pulse') {
      cosine = 2 * Math.sin(TAU * h * oscillator.pulseWidth) / (Math.PI * h);
      sine = 2 * (1 - Math.cos(TAU * h * oscillator.pulseWidth)) / (Math.PI * h);
    }
    real[h] = real[TABLE - h] = cosine * TABLE / 2;
    imag[h] = -sine * TABLE / 2; imag[TABLE - h] = sine * TABLE / 2;
  }
  fft(real, imag, true);
  const values = new Float32Array(TABLE + 1);
  values.set(real); values[TABLE] = values[0]; return values;
}

/** Minimum-phase arbitrary gain response. Resolution is sampleRate/8192 Hz. */
export function createSpectrumImpulse(spectrum, sampleRate) {
  const real = new Float64Array(EQ_LENGTH), imag = new Float64Array(EQ_LENGTH);
  for (let bin = 0; bin <= EQ_LENGTH / 2; bin++) {
    const db = curveValue(spectrum.points, Math.max(20, bin * sampleRate / EQ_LENGTH), true);
    const gain = Math.max(1e-6, 1 + spectrum.mix * (10 ** (db / 20) - 1));
    real[bin] = Math.log(gain);
    if (bin > 0 && bin < EQ_LENGTH / 2) real[EQ_LENGTH - bin] = real[bin];
  }
  // Real cepstrum -> causal minimum-phase cepstrum -> complex response.
  fft(real, imag, true);
  for (let i = 1; i < EQ_LENGTH / 2; i++) { real[i] *= 2; imag[i] = 0; }
  for (let i = EQ_LENGTH / 2 + 1; i < EQ_LENGTH; i++) { real[i] = 0; imag[i] = 0; }
  imag.fill(0); fft(real, imag);
  for (let i = 0; i < EQ_LENGTH; i++) {
    const magnitude = Math.exp(real[i]), angle = imag[i];
    real[i] = magnitude * Math.cos(angle); imag[i] = magnitude * Math.sin(angle);
  }
  fft(real, imag, true);
  const impulse = new Float32Array(EQ_LENGTH);
  for (let i = 0; i < EQ_LENGTH; i++) {
    const taper = i > EQ_LENGTH * .95 ? .5 + .5 * Math.cos(Math.PI * (i - EQ_LENGTH * .95) / (EQ_LENGTH * .05)) : 1;
    impulse[i] = real[i] * taper;
  }
  return impulse;
}

function partitionImpulse(impulse) {
  const partitions = EQ_LENGTH / BLOCK;
  const real = new Float32Array(partitions * FFT_BLOCK), imag = new Float32Array(partitions * FFT_BLOCK);
  for (let p = 0; p < partitions; p++) {
    const r = new Float64Array(FFT_BLOCK), i = new Float64Array(FFT_BLOCK);
    r.set(impulse.subarray(p * BLOCK, (p + 1) * BLOCK)); fft(r, i);
    real.set(r, p * FFT_BLOCK); imag.set(i, p * FFT_BLOCK);
  }
  return { real, imag, impulse };
}

function preparationKey(patch, sampleRate) {
  return JSON.stringify([sampleRate, patch.oscillators.map(o => [o.enabled, o.waveform, o.pulseWidth]), patch.spectrum]);
}

/** Prepared on a worker for interactive edits, then copied to the worklet. */
export function preparePatch(value, sampleRate = 48000, _midis = []) {
  if (!RATE_OPTIONS.includes(sampleRate)) throw new Error('当前支持44.1、48或96kHz。');
  const patch = normalizePatch(value);
  return { format: 'RootSoundSpectralPrepared', version: 1, sampleRate, key: preparationKey(patch, sampleRate),
    oscillators: patch.oscillators.map(o => !o.enabled ? null : o.waveform === 'noise' ? { waveform: 'noise', tables: null, noiseLevel: 1 } :
      { waveform: o.waveform, noiseLevel: 0, tables: HARMONICS.map(count => tableFor(o, count)) }),
    eq: partitionImpulse(createSpectrumImpulse(patch.spectrum, sampleRate)) };
}

function readPrepared(prepared, patch, sampleRate) {
  if (!prepared || prepared.format !== 'RootSoundSpectralPrepared' || prepared.version !== 1 || prepared.sampleRate !== sampleRate
    || prepared.key !== preparationKey(patch, sampleRate) || prepared.oscillators?.length !== 4) throw new Error('声音准备结果与当前参数不匹配。');
  for (let index = 0; index < 4; index++) {
    const o = patch.oscillators[index], bank = prepared.oscillators[index];
    if (!o.enabled) { if (bank !== null) throw new Error('振荡器准备结果无效。'); continue; }
    if (o.waveform === 'noise') { if (bank?.waveform !== 'noise' || bank.noiseLevel !== 1 || bank.tables !== null) throw new Error('噪声准备结果无效。'); continue; }
    if (bank?.waveform !== o.waveform || bank.tables?.length !== HARMONICS.length) throw new Error('带限波表不完整。');
    for (const table of bank.tables) {
      if (!(table instanceof Float32Array) || table.length !== TABLE + 1) throw new Error('带限波表格式无效。');
      for (const value of table) if (!Number.isFinite(value)) throw new Error('带限波表含有无效数值。');
    }
  }
  const eq = prepared.eq, length = EQ_LENGTH / BLOCK * FFT_BLOCK;
  for (const array of [eq?.real, eq?.imag, eq?.impulse]) {
    if (!(array instanceof Float32Array) || array.length !== (array === eq.impulse ? EQ_LENGTH : length)) throw new Error('频谱卷积数据不完整。');
    for (const value of array) if (!Number.isFinite(value)) throw new Error('频谱卷积数据无效。');
  }
  return prepared;
}

class SpectrumConvolver {
  constructor(eq, sampleRate) {
    this.current = eq; this.old = null; this.fade = 0; this.fadeLength = Math.round(sampleRate * .024);
    this.partitionCount = EQ_LENGTH / BLOCK; this.index = 0; this.position = 0;
    this.input = [new Float64Array(FFT_BLOCK), new Float64Array(FFT_BLOCK)];
    this.xReal = [new Float64Array(this.partitionCount * FFT_BLOCK), new Float64Array(this.partitionCount * FFT_BLOCK)];
    this.xImag = [new Float64Array(this.partitionCount * FFT_BLOCK), new Float64Array(this.partitionCount * FFT_BLOCK)];
    this.output = [new Float64Array(BLOCK), new Float64Array(BLOCK)];
    this.scratchR = new Float64Array(FFT_BLOCK); this.scratchI = new Float64Array(FFT_BLOCK);
    this.sumR = new Float64Array(FFT_BLOCK); this.sumI = new Float64Array(FFT_BLOCK);
    this.oldR = new Float64Array(FFT_BLOCK); this.oldI = new Float64Array(FFT_BLOCK);
  }
  set(eq) {
    if (this.old) {
      const amount = Math.min(1, this.fade / this.fadeLength);
      const real = new Float32Array(eq.real.length), imag = new Float32Array(eq.imag.length);
      for (let i = 0; i < real.length; i++) { real[i] = this.old.real[i] * (1 - amount) + this.current.real[i] * amount; imag[i] = this.old.imag[i] * (1 - amount) + this.current.imag[i] * amount; }
      this.old = { real, imag };
    } else this.old = this.current;
    this.current = eq; this.fade = 0;
  }
  clear() {
    for (const array of [...this.input, ...this.xReal, ...this.xImag, ...this.output]) array.fill(0);
    this.position = 0; this.index = 0; this.old = null;
  }
  block() {
    for (let channel = 0; channel < 2; channel++) {
      const r = this.scratchR, im = this.scratchI; r.set(this.input[channel]); im.fill(0); fft(r, im);
      const offset = this.index * FFT_BLOCK;
      this.xReal[channel].set(r, offset); this.xImag[channel].set(im, offset);
      const sr = this.sumR, si = this.sumI, or = this.oldR, oi = this.oldI;
      sr.fill(0); si.fill(0); if (this.old) { or.fill(0); oi.fill(0); }
      for (let partition = 0; partition < this.partitionCount; partition++) {
        const inputIndex = (this.index - partition + this.partitionCount) % this.partitionCount * FFT_BLOCK;
        const kernelIndex = partition * FFT_BLOCK;
        const xr = this.xReal[channel], xi = this.xImag[channel], kr = this.current.real, ki = this.current.imag;
        const oldKr = this.old?.real, oldKi = this.old?.imag;
        for (let bin = 0; bin < FFT_BLOCK; bin++) {
          const ar = xr[inputIndex + bin], ai = xi[inputIndex + bin], br = kr[kernelIndex + bin], bi = ki[kernelIndex + bin];
          sr[bin] += ar * br - ai * bi; si[bin] += ar * bi + ai * br;
          if (this.old) { const cr = oldKr[kernelIndex + bin], ci = oldKi[kernelIndex + bin]; or[bin] += ar * cr - ai * ci; oi[bin] += ar * ci + ai * cr; }
        }
      }
      fft(sr, si, true); if (this.old) fft(or, oi, true);
      for (let n = 0; n < BLOCK; n++) {
        const mix = this.old ? Math.min(1, (this.fade + n) / this.fadeLength) : 1;
        this.output[channel][n] = (this.old ? or[BLOCK + n] * (1 - mix) : 0) + sr[BLOCK + n] * mix;
      }
      this.input[channel].copyWithin(0, BLOCK); this.input[channel].fill(0, BLOCK);
    }
    this.fade += BLOCK; if (this.fade >= this.fadeLength) this.old = null;
    this.index = (this.index + 1) % this.partitionCount;
  }
  sample(left, right) {
    const position = this.position;
    const l = this.output[0][position], r = this.output[1][position];
    this.input[0][BLOCK + position] = left; this.input[1][BLOCK + position] = right;
    this.position++;
    if (this.position === BLOCK) { this.block(); this.position = 0; }
    this.left = l; this.right = r;
  }
}

function decimatorKernel() {
  const length = 63, values = new Float64Array(length); let sum = 0;
  for (let n = 0; n < length; n++) {
    const x = n - (length - 1) / 2;
    const sinc = x === 0 ? .45 : Math.sin(TAU * .225 * x) / (Math.PI * x);
    const window = .42 - .5 * Math.cos(TAU * n / (length - 1)) + .08 * Math.cos(2 * TAU * n / (length - 1));
    values[n] = sinc * window; sum += values[n];
  }
  for (let n = 0; n < length; n++) values[n] /= sum;
  return values;
}
const DECIMATOR = decimatorKernel();

function wave(bank, phase, allowed) {
  if (!bank?.tables || allowed < 1) return 0;
  let index = 0;
  while (index + 1 < HARMONICS.length && HARMONICS[index + 1] <= allowed) index++;
  const high = bank.tables[index], low = bank.tables[Math.max(0, index - 1)];
  const next = HARMONICS[Math.min(index + 1, HARMONICS.length - 1)];
  const mix = index === HARMONICS.length - 1 ? 1 : clamp((allowed - HARMONICS[index]) / Math.max(1, next - HARMONICS[index]), 0, 1);
  phase = phase - Math.floor(phase); const at = phase * TABLE, integer = Math.floor(at), fraction = at - integer;
  return (low[integer] + (low[integer + 1] - low[integer]) * fraction) * (1 - mix)
    + (high[integer] + (high[integer + 1] - high[integer]) * fraction) * mix;
}

function blendBanks(a, b, amount) {
  if (!a && !b) return null;
  const noiseLevel = (a?.noiseLevel ?? 0) * (1 - amount) + (b?.noiseLevel ?? 0) * amount;
  const tables = !a?.tables && !b?.tables ? null : HARMONICS.map((_, index) => {
    const values = new Float32Array(TABLE + 1), av = a?.tables?.[index], bv = b?.tables?.[index];
    for (let n = 0; n <= TABLE; n++) values[n] = (av?.[n] ?? 0) * (1 - amount) + (bv?.[n] ?? 0) * amount;
    return values;
  });
  return { waveform: 'blend', noiseLevel, tables };
}

function lfoValue(lfo, phase, seed) {
  if (lfo.waveform === 'triangle') return 1 - 4 * Math.abs((phase % 1) - .5);
  if (lfo.waveform === 'square') return phase % 1 < .5 ? 1 : -1;
  if (lfo.waveform === 'random') {
    let n = (Math.floor(phase) ^ seed) >>> 0; n = Math.imul(n ^ (n >>> 16), 0x7feb352d); n = Math.imul(n ^ (n >>> 15), 0x846ca68b);
    return ((n ^ (n >>> 16)) >>> 0) / 2147483648 - 1;
  }
  return Math.sin(TAU * phase);
}

/** Same synthesis path is used by live worklet and offline rendering. */
export class SpectralSynth {
  constructor(sampleRate = 48000, value = createDefaultPatch(), prepared = null) {
    if (!RATE_OPTIONS.includes(sampleRate)) throw new Error('当前支持44.1、48或96kHz。');
    this.sampleRate = sampleRate; this.internalRate = sampleRate * 2; this.voices = []; this.stealing = []; this.time = 0;
    this.patch = normalizePatch(value); this.prepared = readPrepared(prepared ?? preparePatch(this.patch, sampleRate), this.patch, sampleRate);
    this.oldPrepared = null; this.bankFade = 1; this.eq = new SpectrumConvolver(this.prepared.eq, sampleRate);
    this.history = [new Float64Array(DECIMATOR.length), new Float64Array(DECIMATOR.length)]; this.historyPosition = 0;
    this.delay = [new Float64Array(sampleRate * 2 + 4), new Float64Array(sampleRate * 2 + 4)]; this.delayPosition = 0;
    this.chorus = [new Float64Array(Math.ceil(sampleRate * .06)), new Float64Array(Math.ceil(sampleRate * .06))]; this.chorusPosition = 0;
    this.master = this.patch.master.level; this.delayTime = this.patch.effects.delaySeconds; this.stopRemaining = 0; this.lastPeak = 0;
    this.effectState = { ...this.patch.effects }; this.chorusPhase = 0;
    this.stealCompL = 0; this.stealCompR = 0;
    this.scratchL = 0; this.scratchR = 0; this.dcIn = [0, 0]; this.dcOut = [0, 0];
    this.silent = true; this.tailFramesRemaining = -1;
  }
  get activeVoices() { return this.voices.length + this.stealing.length; }
  get voiceLimit() { return effectivePolyphony(this.patch); }
  get stealTailLimit() {
    const units = this.patch.oscillators.reduce((sum, o) => sum + (o.enabled ? o.unison : 0), 0);
    return Math.max(1, Math.min(4, Math.floor(VOICE_UNIT_BUDGET / (Math.max(1, units) * 2))));
  }
  retire(voice) {
    if (voice.age === 0) return;
    voice.forcedFrames = Math.max(1, Math.round(this.sampleRate * .012));
    while (this.stealing.length >= this.stealTailLimit) {
      const discarded = this.stealing.shift();
      // A short continuity correction avoids a hard cut when extreme retriggers
      // exhaust the bounded release-tail budget. It needs no extra oscillator.
      this.stealCompL = clamp(this.stealCompL + (discarded.lastL ?? 0), -2, 2);
      this.stealCompR = clamp(this.stealCompR + (discarded.lastR ?? 0), -2, 2);
    }
    this.stealing.push(voice);
  }
  setPatch(value, prepared = null) {
    const patch = normalizePatch(value), key = preparationKey(patch, this.sampleRate);
    const next = key === this.prepared.key ? this.prepared : readPrepared(prepared ?? preparePatch(patch, this.sampleRate), patch, this.sampleRate);
    for (const voice of this.voices) {
      const oldAmp = this.ampAt(voice), oldPitch = this.pitchAt(voice);
      voice.ampCorrection = oldAmp - envelopeValue(patch.amplitude, voice.age, voice.releasedAt, voice.releaseAmp);
      voice.pitchCorrection = oldPitch - envelopeValue(patch.pitch, voice.age, voice.releasedAt, voice.releasePitch);
    }
    if (next !== this.prepared) {
      this.oldPrepared = this.silent ? null : this.oldPrepared ? { oscillators: this.prepared.oscillators.map((bank, index) =>
        blendBanks(this.oldPrepared.oscillators[index], bank, this.bankFade)) } : this.prepared;
      this.prepared = next; this.bankFade = this.silent ? 1 : 0;
      if (this.silent) { this.eq.current = next.eq; this.eq.old = null; } else this.eq.set(next.eq);
    }
    this.patch = patch;
    while (this.voices.length > this.voiceLimit) this.retire(this.voices.shift());
  }
  noteOn({ id, midi, velocity = .85 }) {
    if (typeof id !== 'string' || !id || id.length > 256 || !Number.isFinite(midi) || midi < 12 || midi > 120
      || !Number.isFinite(velocity) || velocity < 0 || velocity > 1) throw new Error('试听音符参数无效。');
    this.stopRemaining = 0; this.silent = false; this.tailFramesRemaining = -1;
    const previous = this.patch.master.polyphony === 1 ? this.voices.find(voice => voice.releasedAt === null) : null;
    if (previous && this.patch.master.glideSeconds > 0) {
      previous.startMidi = this.midiAt(previous); previous.midi = midi; previous.glideAge = 0; previous.id = id; previous.velocity = velocity; return;
    }
    const duplicate = this.voices.findIndex(voice => voice.id === id);
    if (duplicate >= 0) this.retire(this.voices.splice(duplicate, 1)[0]);
    if (this.voices.length >= this.voiceLimit) {
      const released = this.voices.findIndex(voice => voice.releasedAt !== null); this.retire(this.voices.splice(released < 0 ? 0 : released, 1)[0]);
    }
    const voice = { id, midi, startMidi: midi, glideAge: 0, velocity, age: 0, releasedAt: null, releaseAmp: null, releasePitch: null,
      ampCorrection: 0, pitchCorrection: 0, lfoPhases: new Float64Array(2), controls: new Float64Array([0, 1, 0, 0]),
      oscillators: this.patch.oscillators.map((o, index) => ({
        phases: Float64Array.from({ length: 5 }, (_, unit) => (unit * .137 + index * .071) % 1),
        modPhases: new Float64Array(5), gain: o.enabled ? o.level : 0,
        phase: o.phase, tune: o.semitones + o.cents / 100, fm: o.fmAmount, pan: o.pan, detune: o.detuneCents, spread: o.spread,
        unitGains: Float64Array.from({ length: 5 }, (_, unit) => unit < o.unison ? 1 / o.unison : 0),
        noise: Uint32Array.from({ length: 5 }, (_, unit) => (this.patch.seed + index * 214013 + unit * 2531011) >>> 0 || 1) })) };
    this.voices.push(voice);
  }
  noteOff(id) {
    for (const voice of this.voices) if (voice.id === id && voice.releasedAt === null) {
      voice.releaseAmp = this.ampAt(voice); voice.releasePitch = this.pitchAt(voice); voice.releasedAt = voice.age;
      voice.ampCorrection = voice.pitchCorrection = 0;
    }
  }
  allNotesOff(immediate = false) {
    if (immediate) this.stopRemaining = Math.max(1, Math.round(this.sampleRate * .008));
    else for (const voice of this.voices) this.noteOff(voice.id);
  }
  clear() {
    this.voices = []; this.stealing = [];
    for (const array of [...this.delay, ...this.chorus, ...this.history]) array.fill(0);
    this.dcIn.fill(0); this.dcOut.fill(0); this.eq.clear(); this.stopRemaining = 0;
    this.stealCompL = 0; this.stealCompR = 0;
    this.silent = true; this.tailFramesRemaining = -1;
  }
  midiAt(voice) {
    const amount = this.patch.master.glideSeconds === 0 ? 1 : Math.min(1, voice.glideAge / this.patch.master.glideSeconds);
    const smooth = amount * amount * (3 - 2 * amount);
    return voice.startMidi + (voice.midi - voice.startMidi) * smooth;
  }
  ampAt(voice) { return clamp(envelopeValue(this.patch.amplitude, voice.age, voice.releasedAt, voice.releaseAmp) + voice.ampCorrection, 0, 1); }
  pitchAt(voice) { return envelopeValue(this.patch.pitch, voice.age, voice.releasedAt, voice.releasePitch) + voice.pitchCorrection; }
  renderInternal() {
    let left = 0, right = 0;
    const patch = this.patch, rate = this.internalRate;
    for (let voiceIndex = 0; voiceIndex < this.voices.length + this.stealing.length; voiceIndex++) {
      const voice = voiceIndex < this.voices.length ? this.voices[voiceIndex] : this.stealing[voiceIndex - this.voices.length];
      const beforeL = left, beforeR = right;
      let pitchLfo = 0, ampLfo = 1, panLfo = 0, fmLfo = 0;
      for (let l = 0; l < patch.lfos.length; l++) {
        const mod = patch.lfos[l]; if (!mod.enabled || mod.depth === 0) continue;
        const value = lfoValue(mod, voice.lfoPhases[l], patch.seed + l * 131) * mod.depth;
        voice.lfoPhases[l] += mod.rateHz / rate;
        if (mod.target === 'pitch') pitchLfo += value * 2;
        else if (mod.target === 'amplitude') ampLfo *= 1 - mod.depth * .5 + value * .5;
        else if (mod.target === 'pan') panLfo += value;
        else fmLfo += value * 2;
      }
      voice.controls[0] += (pitchLfo - voice.controls[0]) * .002;
      voice.controls[1] += (ampLfo - voice.controls[1]) * .002;
      voice.controls[2] += (panLfo - voice.controls[2]) * .002;
      voice.controls[3] += (fmLfo - voice.controls[3]) * .002;
      const frequency = hz(this.midiAt(voice) + this.pitchAt(voice) + voice.controls[0]);
      const forcedGain = voice.forcedFrames === undefined ? 1 : voice.forcedFrames / Math.max(1, Math.round(this.sampleRate * .012));
      const amplitude = this.ampAt(voice) * (1 - patch.master.velocitySensitivity + patch.master.velocitySensitivity * voice.velocity) * voice.controls[1] * .42 * forcedGain;
      for (let index = 0; index < 4; index++) {
        const o = patch.oscillators[index], state = voice.oscillators[index];
        state.gain += ((o.enabled ? o.level : 0) - state.gain) * .002;
        const phaseDelta = ((o.phase - state.phase + 1.5) % 1) - .5; state.phase += phaseDelta * .002;
        state.tune += (o.semitones + o.cents / 100 - state.tune) * .002;
        state.fm += (o.fmAmount - state.fm) * .002; state.pan += (o.pan - state.pan) * .002;
        state.detune += (o.detuneCents - state.detune) * .002; state.spread += (o.spread - state.spread) * .002;
        if (state.gain < 1e-7) continue;
        const base = frequency * 2 ** (state.tune / 12);
        const fm = Math.max(0, state.fm + voice.controls[3]);
        for (let unit = 0; unit < 5; unit++) {
          state.unitGains[unit] += ((unit < o.unison ? 1 / o.unison : 0) - state.unitGains[unit]) * .002;
          if (state.unitGains[unit] < 1e-7) continue;
          const position = o.unison === 1 ? 0 : unit / (o.unison - 1) * 2 - 1;
          const f = base * 2 ** (position * state.detune / 1200);
          const boundedFm = Math.min(fm, Math.max(0, (rate * .42 / Math.max(.01, f) - 1) / o.fmRatio));
          const allowed = Math.max(1, this.sampleRate * .45 / Math.max(.01, f * (1 + boundedFm * o.fmRatio)));
          let value = 0, noiseValue = 0;
          if (this.prepared.oscillators[index]?.noiseLevel || this.oldPrepared?.oscillators[index]?.noiseLevel) {
            let seed = state.noise[unit]; seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; state.noise[unit] = seed >>> 0;
            noiseValue = (seed >>> 0) / 2147483648 - 1;
          }
          if (f < this.sampleRate * .46 || o.waveform === 'noise') {
            const phase = state.phases[unit] + state.phase + boundedFm * Math.sin(TAU * state.modPhases[unit]) / TAU;
            value = wave(this.prepared.oscillators[index], phase, allowed) + (this.prepared.oscillators[index]?.noiseLevel ?? 0) * noiseValue;
            if (this.oldPrepared) value = (wave(this.oldPrepared.oscillators[index], phase, allowed) + (this.oldPrepared.oscillators[index]?.noiseLevel ?? 0) * noiseValue) * (1 - this.bankFade) + value * this.bankFade;
          }
          state.phases[unit] = (state.phases[unit] + f / rate) % 1;
          state.modPhases[unit] = (state.modPhases[unit] + f * o.fmRatio / rate) % 1;
          const pan = clamp(state.pan + position * state.spread + voice.controls[2], -1, 1), angle = (pan + 1) * Math.PI / 4;
          const gain = amplitude * state.gain * state.unitGains[unit];
          left += value * gain * Math.cos(angle); right += value * gain * Math.sin(angle);
        }
      }
      voice.lastL = left - beforeL; voice.lastR = right - beforeR;
    }
    left += this.stealCompL; right += this.stealCompR;
    const compensationDecay = Math.exp(-1 / (rate * .003)); this.stealCompL *= compensationDecay; this.stealCompR *= compensationDecay;
    const drive = this.effectState.drive;
    if (drive > 0) { const gain = 1 + drive * 7; left = left * (1 - drive) + Math.tanh(left * gain) / gain * drive; right = right * (1 - drive) + Math.tanh(right * gain) / gain * drive; }
    this.internalL = left; this.internalR = right;
  }
  sample() {
    let l = 0, r = 0;
    const effects = this.effectState, target = this.patch.effects, rate = this.sampleRate;
    effects.drive += (target.drive - effects.drive) * .004;
    effects.chorusMix += (target.chorusMix - effects.chorusMix) * .004;
    effects.chorusDepthMs += (target.chorusDepthMs - effects.chorusDepthMs) * .004;
    effects.chorusRateHz += (target.chorusRateHz - effects.chorusRateHz) * .004;
    effects.delayMix += (target.delayMix - effects.delayMix) * .004;
    effects.delayFeedback += (target.delayFeedback - effects.delayFeedback) * .004;
    for (let sub = 0; sub < 2; sub++) {
      this.renderInternal();
      this.history[0][this.historyPosition] = this.internalL; this.history[1][this.historyPosition] = this.internalR;
      this.historyPosition = (this.historyPosition + 1) % DECIMATOR.length;
    }
    for (let n = 0; n < DECIMATOR.length; n++) {
      const at = (this.historyPosition - 1 - n + DECIMATOR.length) % DECIMATOR.length;
      l += this.history[0][at] * DECIMATOR[n]; r += this.history[1][at] * DECIMATOR[n];
    }
    for (let c = 0; c < 2; c++) {
      const input = c === 0 ? l : r;
      this.chorus[c][this.chorusPosition] = input;
      const delay = (.025 + effects.chorusDepthMs / 1000 * Math.sin(TAU * (this.chorusPhase + c * .25))) * rate;
      const at = (this.chorusPosition - delay + this.chorus[c].length * 2) % this.chorus[c].length;
      const a = Math.floor(at), f = at - a;
      const delayed = this.chorus[c][a] + (this.chorus[c][(a + 1) % this.chorus[c].length] - this.chorus[c][a]) * f;
      const output = input * (1 - effects.chorusMix) + delayed * effects.chorusMix;
      if (c === 0) this.scratchL = output; else this.scratchR = output;
    }
    this.chorusPhase = (this.chorusPhase + effects.chorusRateHz / rate) % 1;
    this.chorusPosition = (this.chorusPosition + 1) % this.chorus[0].length;
    this.delayTime += (target.delaySeconds - this.delayTime) * .001;
    const at = (this.delayPosition - this.delayTime * rate + this.delay[0].length * 2) % this.delay[0].length;
    const a = Math.floor(at), f = at - a;
    const dl = this.delay[0][a] + (this.delay[0][(a + 1) % this.delay[0].length] - this.delay[0][a]) * f;
    const dr = this.delay[1][a] + (this.delay[1][(a + 1) % this.delay[1].length] - this.delay[1][a]) * f;
    this.delay[0][this.delayPosition] = this.scratchL + dr * effects.delayFeedback;
    this.delay[1][this.delayPosition] = this.scratchR + dl * effects.delayFeedback;
    this.delayPosition = (this.delayPosition + 1) % this.delay[0].length;
    l = this.scratchL * (1 - effects.delayMix) + dl * effects.delayMix;
    r = this.scratchR * (1 - effects.delayMix) + dr * effects.delayMix;
    const dcL = l - this.dcIn[0] + .9995 * this.dcOut[0], dcR = r - this.dcIn[1] + .9995 * this.dcOut[1];
    this.dcIn[0] = l; this.dcIn[1] = r; this.dcOut[0] = dcL; this.dcOut[1] = dcR;
    this.eq.sample(dcL, dcR); l = this.eq.left; r = this.eq.right;
    this.master += (this.patch.master.level - this.master) * .002;
    let stop = 1;
    if (this.stopRemaining > 0) { stop = this.stopRemaining / Math.max(1, Math.round(rate * .008)); this.stopRemaining--; if (this.stopRemaining === 0) this.clear(); }
    l *= this.master * stop; r *= this.master * stop;
    if (Math.abs(l) > .94) l = Math.sign(l) * (.94 + .06 * (1 - Math.exp(-(Math.abs(l) - .94) / .06)));
    if (Math.abs(r) > .94) r = Math.sign(r) * (.94 + .06 * (1 - Math.exp(-(Math.abs(r) - .94) / .06)));
    this.time += 1 / rate;
    const correction = Math.exp(-1 / (rate * .012));
    for (let index = 0; index < this.voices.length + this.stealing.length; index++) {
      const voice = index < this.voices.length ? this.voices[index] : this.stealing[index - this.voices.length];
      voice.age += 1 / rate; voice.glideAge += 1 / rate; voice.ampCorrection *= correction; voice.pitchCorrection *= correction;
    }
    for (let index = this.stealing.length - 1; index >= 0; index--) if (--this.stealing[index].forcedFrames <= 0) this.stealing.splice(index, 1);
    for (let i = this.voices.length - 1; i >= 0; i--) {
      const voice = this.voices[i];
      if (voice.releasedAt !== null && voice.age - voice.releasedAt > releaseSeconds(this.patch.amplitude) + .015) this.voices.splice(i, 1);
    }
    if (this.voices.length === 0 && this.stealing.length === 0 && this.tailFramesRemaining < 0) {
      const feedbackTail = this.patch.effects.delayMix > 0
        ? Math.min(60, this.patch.effects.delaySeconds * Math.log(.0001) / Math.log(Math.max(.0001, this.patch.effects.delayFeedback))) : 0;
      this.tailFramesRemaining = Math.ceil(rate * (EQ_LENGTH / rate + .1 + feedbackTail));
    }
    if (this.tailFramesRemaining > 0 && --this.tailFramesRemaining === 0) this.clear();
    if (this.oldPrepared) { this.bankFade = Math.min(1, this.bankFade + 1 / (rate * .024)); if (this.bankFade === 1) this.oldPrepared = null; }
    this.sampleL = l; this.sampleR = r;
  }
  process(left, right) {
    if (!(left instanceof Float32Array) || !(right instanceof Float32Array) || left.length !== right.length) throw new Error('音频输出缓冲区无效。');
    if (this.silent) { left.fill(0); right.fill(0); this.lastPeak = 0; return 0; }
    let peak = 0;
    for (let index = 0; index < left.length; index++) {
      this.sample(); const l = this.sampleL, r = this.sampleR;
      if (!Number.isFinite(l) || !Number.isFinite(r)) { this.clear(); left.fill(0); right.fill(0); throw new Error('声音计算出现无效结果，已停止。'); }
      left[index] = l; right[index] = r; peak = Math.max(peak, Math.abs(l), Math.abs(r));
    }
    this.lastPeak = peak; return peak;
  }
}

export function renderPatch(value, options = {}) {
  const patch = normalizePatch(value);
  const sampleRate = options.sampleRate ?? 48000;
  const midi = options.midi ?? 60, velocity = options.velocity ?? .85, holdSeconds = options.holdSeconds ?? 2;
  if (!RATE_OPTIONS.includes(sampleRate)) throw new Error('导出支持44.1、48或96kHz。');
  if (!Number.isFinite(midi) || midi < 12 || midi > 120 || !Number.isFinite(velocity) || velocity < 0 || velocity > 1
    || !Number.isFinite(holdSeconds) || holdSeconds < .01 || holdSeconds > 59) throw new Error('导出音符参数无效。');
  const feedbackTail = patch.effects.delayMix > 0
    ? patch.effects.delaySeconds * Math.log(.0001) / Math.log(Math.max(.0001, patch.effects.delayFeedback)) : 0;
  const naturalTail = releaseSeconds(patch.amplitude) + EQ_LENGTH / sampleRate + .07 + feedbackTail;
  const tail = options.tailSeconds ?? Math.min(60 - holdSeconds, naturalTail);
  if (!Number.isFinite(tail) || tail < 0 || holdSeconds + tail > 60) throw new Error('导出总时长需要在60秒以内。');
  const frames = Math.ceil((holdSeconds + tail) * sampleRate);
  const synth = new SpectralSynth(sampleRate, patch);
  const left = new Float32Array(frames), right = new Float32Array(frames);
  synth.noteOn({ id: 'offline-note', midi, velocity });
  const heldFrames = Math.round(holdSeconds * sampleRate);
  let peak = 0;
  for (let start = 0; start < frames;) {
    if (start === heldFrames) synth.noteOff('offline-note');
    const end = Math.min(frames, start + BLOCK, start < heldFrames ? heldFrames : frames);
    if (end <= start) break;
    peak = Math.max(peak, synth.process(left.subarray(start, end), right.subarray(start, end))); start = end;
  }
  const edge = Math.min(Math.round((tail + 1e-6 < naturalTail ? .12 : .006) * sampleRate), frames);
  for (let index = 0; index < edge; index++) { const gain = 1 - index / Math.max(1, edge - 1); left[frames - edge + index] *= gain; right[frames - edge + index] *= gain; }
  return { sampleRate, channels: 2, left, right, peak, durationSeconds: frames / sampleRate,
    latencySeconds: (BLOCK + (DECIMATOR.length - 1) / 4) / sampleRate,
    spectrumResolutionHz: sampleRate / EQ_LENGTH, tailTruncated: tail + 1e-6 < naturalTail };
}

/** Ordinary stereo PCM24 WAV, same render as live synthesis. */
export function encodeWav24(rendered) {
  const { sampleRate, left, right } = rendered;
  if (!RATE_OPTIONS.includes(sampleRate) || !(left instanceof Float32Array) || !(right instanceof Float32Array) || left.length !== right.length
    || left.length > sampleRate * 60) throw new Error('导出音频格式无效。');
  const bytes = new Uint8Array(44 + left.length * 6), view = new DataView(bytes.buffer);
  const text = (offset, value) => { for (let i = 0; i < value.length; i++) bytes[offset + i] = value.charCodeAt(i); };
  text(0, 'RIFF'); view.setUint32(4, bytes.length - 8, true); text(8, 'WAVE'); text(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 2, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 6, true);
  view.setUint16(32, 6, true); view.setUint16(34, 24, true); text(36, 'data'); view.setUint32(40, left.length * 6, true);
  for (let frame = 0; frame < left.length; frame++) for (let channel = 0; channel < 2; channel++) {
    const value = finite((channel === 0 ? left : right)[frame], '导出采样');
    const scaled = Math.round(clamp(value, -1, 1) * (value < 0 ? 8388608 : 8388607));
    const at = 44 + frame * 6 + channel * 3; bytes[at] = scaled & 255; bytes[at + 1] = scaled >>> 8 & 255; bytes[at + 2] = scaled >>> 16 & 255;
  }
  return bytes;
}

export const DSP_LIMITS = Object.freeze({ curvePoints: MAX_CURVE_POINTS, oscillators: 4, unison: 5, polyphony: 12, exportSeconds: 60,
  oscillatorUnitBudget: VOICE_UNIT_BUDGET, voiceUnitBudget: VOICE_UNIT_BUDGET, voiceStealTails: 4, spectrumImpulseSamples: EQ_LENGTH, spectrumBlockSamples: BLOCK, oversampling: 2, tableSamples: TABLE });
