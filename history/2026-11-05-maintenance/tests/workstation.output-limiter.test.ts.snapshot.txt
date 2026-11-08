import assert from 'node:assert/strict';
import { test } from 'node:test';
import { outputPeakSample } from '../src/workstation/modules/sound-runtime/output-limiter.ts';

test('ordinary samples retain exact unity gain regardless of earlier overloads',()=>{
  const inputs=[.1,.1,8,.1,-16,.1,0,.1];
  const outputs=inputs.map(outputPeakSample);
  assert.deepEqual(outputs.filter((_,i)=>inputs[i]===.1),[.1,.1,.1,.1,.1]);
  for(let i=-950;i<=950;i++)assert.equal(outputPeakSample(i/1000),i/1000);
});
test('peak protection is symmetric, continuous, bounded and monotonic without gain recovery',()=>{
  let last=0;
  for(let i=0;i<=10000;i++){
    const x=i/100,y=outputPeakSample(x);
    assert(y>=last&&y<=1);assert.equal(outputPeakSample(-x),-y);last=y;
  }
  assert(Math.abs(outputPeakSample(.950001)-.950001)<1e-9);
});
