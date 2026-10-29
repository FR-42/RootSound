import { validateCurve } from './shared/model.mjs';
export const flatSpectrum = () => ({ mix: 1, points: [20,79.6214341107,316.978638492,1261.91468896,5023.77286302,20000].map(x => ({ x, y:0, curve:0 })) });
export function validateSpectrum(value) {
  if (!value || !Number.isFinite(value.mix) || value.mix < 0 || value.mix > 1) throw new Error('EQ 混合值无效。');
  return { mix:value.mix, points:validateCurve(value.points, {minX:20,maxX:20000,minY:-96,maxY:24,logarithmic:true,maxPoints:10}) };
}
export class EqHistory {
  constructor() { this.value = flatSpectrum(); this.past=[]; this.future=[]; }
  preview(value) { return validateSpectrum(value); }
  commit(value) {
    const next=validateSpectrum(value);
    if (JSON.stringify(next) === JSON.stringify(this.value)) return false;
    this.past.push(this.value); if (this.past.length>100) this.past.shift(); this.future=[]; this.value=next; return true;
  }
  undo() { if (!this.past.length) return; this.future.push(this.value); this.value=this.past.pop(); }
  redo() { if (!this.future.length) return; this.past.push(this.value); this.value=this.future.pop(); }
}
