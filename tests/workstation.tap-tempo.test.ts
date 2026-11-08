import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createTapTempo } from '../src/workstation/modules/ui-rendering/tap-tempo-model.ts';

test('four beat taps produce tempo and subsequent timing refines a rolling estimate',()=>{
  const tap=createTapTempo();assert.deepEqual(tap.read(),{count:0});
  for(const at of [0,500,1000])assert.equal(tap.tap(at).bpm,undefined);
  assert.deepEqual(tap.tap(1500),{count:4,bpm:120});
  tap.reset();for(let i=0;i<8;i++)tap.tap(i*400);assert.equal(tap.read().bpm,150);
  tap.reset();for(const at of [0,500,1010,1505,2005])tap.tap(at);assert.equal(tap.read().bpm,120);
});
test('accidental doubles and one missed beat do not halve or double the estimate',()=>{
  const tap=createTapTempo();for(const at of [0,500,550,1000,2000,2500])tap.tap(at);
  assert.equal(tap.read().bpm,120);assert.equal(tap.read().count,5);
});
test('a long pause or reset starts a new estimate and the rolling window follows a new tempo',()=>{
  const tap=createTapTempo();for(const at of [0,500,1000,1500])tap.tap(at);
  assert.deepEqual(tap.tap(5000),{count:1});for(const at of [5400,5800,6200])tap.tap(at);assert.equal(tap.read().bpm,150);
  for(let i=1;i<=9;i++)tap.tap(6200+i*600);assert.equal(tap.read().bpm,100);
  assert.deepEqual(tap.reset(),{count:0});
});
test('unsupported speeds are reported honestly instead of being silently clamped',()=>{
  const tap=createTapTempo();for(const at of [0,200,400,600])tap.tap(at);assert.equal(tap.read().bpm,300);
  tap.reset();for(const at of [0,2000,4000,6000])tap.tap(at);assert.equal(tap.read().bpm,30);
});
test('inconsistent taps leave tempo unconfirmed until enough matching intervals arrive', () => {
  const tap = createTapTempo();
  for (const at of [0, 360, 860, 1540]) tap.tap(at);
  assert.deepEqual(tap.read(), { count: 4 });
  for (const at of [2040, 2540]) tap.tap(at);
  assert.equal(tap.read().bpm, 120);
  tap.reset();
  for (const at of [0, 500, 1000, 2000, 3000]) tap.tap(at);
  assert.deepEqual(tap.read(), { count: 5 });
});
