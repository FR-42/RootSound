export type TapTempoState = { count: number; bpm?: number };
import { MIN_TEMPO_BPM, MAX_TEMPO_BPM } from '../../contracts/music-limits.ts';

/** A short rolling estimate, resistant to one missed beat or an accidental double tap. */
export function createTapTempo(): { tap(nowMilliseconds: number): TapTempoState; read(): TapTempoState; reset(): TapTempoState } {
  let count=0; let previous:number|undefined; let intervals:number[]=[];
  function read():TapTempoState {
    if(count<4)return {count};
    const sorted=[...intervals].sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);
    const median=sorted.length%2?sorted[middle]!:(sorted[middle-1]!+sorted[middle]!)/2;
    const regular=intervals.filter(interval=>Math.abs(interval-median)<=median*.12);
    if(regular.length<2 || regular.length*2<=intervals.length)return {count};
    const average=regular.reduce((sum,value)=>sum+value,0)/regular.length;
    return {count,bpm:Math.round(60000/average)};
  }
  function reset():TapTempoState {count=0;previous=undefined;intervals=[];return read();}
  return {read,reset,tap(now){
    if(!Number.isFinite(now))return read();
    if(previous!==undefined){
      const gap=now-previous;if(gap<60000/MAX_TEMPO_BPM)return read();
      const sorted=[...intervals].sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length/2)];
      if(gap>60000/MIN_TEMPO_BPM || intervals.length>=2&&gap>Math.max(2500,median!*3))reset();
      else intervals=[...intervals,gap].slice(-8);
    }
    previous=now;count++;return read();
  }};
}
