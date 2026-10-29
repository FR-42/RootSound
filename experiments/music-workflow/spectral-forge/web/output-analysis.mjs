/** Read-only measurements of the final audio output. Never creates a device or edits a patch. */
export const ANALYSIS_FFT_SIZE = 8192;
const FLOOR_DB = -96;
const MAX_TRACE = 1536;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

/** Log bands retain the loudest FFT bin, so narrow harmonics survive display reduction. */
export function spectrumTrace(db, sampleRate, fftSize = ANALYSIS_FFT_SIZE, bands = 512) {
  if (!(sampleRate > 0) || !db?.length || !Number.isInteger(fftSize) || fftSize < 2) return [];
  bands = clamp(Math.round(bands) || 512, 16, 1024);
  const high = Math.min(20000, sampleRate / 2), spacing = sampleRate / fftSize;
  if (high <= 20) return [];
  const points = []; let previous = -1;
  for (let i = 0; i < bands; i++) {
    const lo = 20 * (high / 20) ** (i / bands), hi = 20 * (high / 20) ** ((i + 1) / bands);
    const first = Math.max(1, Math.ceil(lo / spacing));
    const last = Math.min(db.length - 1, Math.max(first, Math.ceil(hi / spacing) - 1));
    if (first > last || first <= previous) continue;
    let bin = first;
    for (let j = first + 1; j <= last; j++) if (db[j] > db[bin]) bin = j;
    points.push({ x: bin * spacing, y: Number.isFinite(db[bin]) ? clamp(db[bin], FLOOR_DB, 0) : FLOOR_DB }); previous = bin;
  }
  return points;
}

/** Conservative YIN estimate. Silence, aperiodic noise and short windows remain undefined. */
export function estimatePitch(samples, sampleRate, validFrames = samples?.length ?? 0, dominantHz) {
  if (!samples?.length || !(sampleRate > 0)) return undefined;
  const length = Math.min(samples.length, Math.floor(sampleRate * .12), Math.floor(validFrames));
  // High tones must stay at the native sample rate instead of folding into a
  // false low note during decimation. The FFT peak bounds their search cost.
  const highTone = Number.isFinite(dominantHz) && dominantHz > 1800;
  const stride = highTone ? 1 : Math.max(1, Math.round(sampleRate / 12000));
  const count = Math.floor(length / stride), rate = sampleRate / stride;
  if (count < 64) return undefined;
  const values = new Float64Array(count), offset = samples.length - length; let mean = 0, energy = 0;
  for (let i = 0; i < count; i++) {
    let sum = 0; for (let j = 0; j < stride; j++) { const x = samples[offset + i * stride + j]; if (!Number.isFinite(x)) return undefined; sum += x; }
    values[i] = sum / stride; mean += values[i];
  }
  mean /= count;
  for (let i = 0; i < count; i++) { values[i] -= mean; energy += values[i] ** 2; }
  if (Math.sqrt(energy / count) < .0005) return undefined;
  const lowHz = highTone ? Math.max(25, dominantHz / 8) : 25;
  const highHz = highTone ? Math.min(sampleRate * .4, 16000) : 3500;
  const minLag = Math.max(2, Math.floor(rate / highHz)), maxLag = Math.min(Math.floor(rate / lowHz), Math.floor(count / 2));
  if (maxLag <= minLag + 2) return undefined;
  const window = count - maxLag, differences = new Float64Array(maxLag + 1); let cumulative = 0;
  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < window; i++) { const delta = values[i] - values[i + lag]; sum += delta * delta; }
    cumulative += sum; differences[lag] = cumulative > 1e-20 ? sum * lag / cumulative : 1;
  }
  for (let lag = minLag; lag < maxLag; lag++) {
    if (differences[lag] >= .12) continue;
    while (lag + 1 <= maxLag && differences[lag + 1] < differences[lag]) lag++;
    if (lag === maxLag) return undefined;
    const a = differences[lag - 1], b = differences[lag], c = differences[lag + 1], denominator = a - 2 * b + c;
    const fractional = lag + (Math.abs(denominator) > 1e-12 ? clamp((a - c) / (2 * denominator), -.5, .5) : 0);
    const frequency = rate / fractional;
    if (frequency < lowHz || frequency > highHz) return undefined;
    return { frequency, confidence: 1 - b, windowSeconds: length / sampleRate };
  }
  return undefined;
}

export function envelopeTime(age, note, envelope) {
  const sustain = envelope.points[envelope.sustainIndex].x;
  const releaseAge = note.released === null ? Infinity : note.released - note.started;
  return age <= releaseAge ? Math.min(age, sustain) : sustain + age - releaseAge;
}

function appendTrace(points, x, y, preservePeaks = false) {
  if (!Number.isFinite(x)) return;
  const previous = points.at(-1);
  if (previous && x < previous.x - 1e-8) return;
  if (previous && Math.abs(x - previous.x) < 1e-8) { previous.y = y; return; }
  points.push({ x, y });
  if (points.length <= MAX_TRACE) return;
  const reduced = [points[0]];
  for (let i = 1; i < points.length - 1; i += 2) {
    const a = points[i], b = points[i + 1];
    reduced.push(preservePeaks && b?.y > a.y ? b : a);
  }
  if (reduced.at(-1) !== points.at(-1)) reduced.push(points.at(-1));
  points.splice(0, points.length, ...reduced);
}

export function createOutputAnalysis() {
  let token, capturedFrame = 0, sinceAge = 0, lastPitchAge = -Infinity, polyphonic = false;
  let frame;
  function clear(note) {
    token = note?.serial; sinceAge = Math.max(0, note?.age ?? 0); capturedFrame = 0; lastPitchAge = -Infinity; polyphonic = Boolean(note?.polyphonic);
    frame = { spectrum: [], amplitude: [], pitch: [], referenceMidi: note?.midi,
      pitchStatus: '试听后显示主音高', measured: false };
    return frame;
  }
  clear();
  function update({ samples, frequencyDb, sampleRate, note, patch, multipleKeys = false }) {
    if (!note || !samples?.length || !(sampleRate > 0)) return frame;
    if (token !== note.serial) { clear(); token = note.serial; }
    polyphonic ||= multipleKeys || Boolean(note.polyphonic);
    frame.referenceMidi = note.midi;
    const end = Math.max(0, Math.round(note.age * sampleRate)), start = end - samples.length;
    let cursor = Math.max(capturedFrame, start, Math.round(sinceAge * sampleRate), 0), peak = 0;
    const step = Math.max(1, Math.round(sampleRate * .004));
    while (cursor < end) {
      const next = Math.min(end, cursor + step); let maximum = 0;
      for (let i = cursor; i < next; i++) { const x = samples[i - start]; if (Number.isFinite(x)) maximum = Math.max(maximum, Math.abs(x)); }
      peak = Math.max(peak, maximum);
      const age = (cursor + next) / (2 * sampleRate), x = envelopeTime(age, note, patch.amplitude);
      if (x <= patch.amplitude.points.at(-1).x) appendTrace(frame.amplitude, x, clamp(maximum, 0, 1), true);
      cursor = next;
    }
    capturedFrame = end;
    if (peak > .0001) { frame.spectrum = spectrumTrace(frequencyDb, sampleRate); frame.measured = true; }
    if (note.age - lastPitchAge < .05) return frame;
    lastPitchAge = note.age;
    let strongest = 1;
    if (frequencyDb?.length) for (let i = Math.max(1, Math.ceil(25 * ANALYSIS_FFT_SIZE / sampleRate)); i < frequencyDb.length; i++)
      if (frequencyDb[i] > frequencyDb[strongest]) strongest = i;
    const dominantHz = frequencyDb?.length ? strongest * sampleRate / ANALYSIS_FFT_SIZE : undefined;
    const pitch = polyphonic ? undefined : estimatePitch(samples, sampleRate, Math.max(0, end - sinceAge * sampleRate), dominantHz);
    const age = Math.max(sinceAge, note.age - (pitch?.windowSeconds ?? .05) / 2);
    const x = envelopeTime(age, note, patch.pitch);
    const y = pitch ? 12 * Math.log2(pitch.frequency / (440 * 2 ** ((note.midi - 69) / 12))) : null;
    if (x <= patch.pitch.points.at(-1).x) appendTrace(frame.pitch, x, y);
    frame.pitchStatus = polyphonic ? '多音叠加 · 主音高留空' : pitch ? `主音高约 ${pitch.frequency.toFixed(1)} Hz` : '未测出稳定主音高';
    return frame;
  }
  return { clear, update, get frame() { return frame; } };
}
