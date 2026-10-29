import { createSpectrumImpulse } from './shared/dsp.mjs';
import { validateSpectrum } from './eq-state.mjs';
self.onmessage = ({data}) => {
  try {
    if (!Number.isInteger(data.sampleRate) || data.sampleRate<8000 || data.sampleRate>768000) throw new Error('采样率无效。');
    const impulse=createSpectrumImpulse(validateSpectrum(data.spectrum), data.sampleRate);
    self.postMessage({revision:data.revision,sampleRate:data.sampleRate,impulse}, [impulse.buffer]);
  } catch(error) { self.postMessage({revision:data.revision,error:error.message}); }
};
