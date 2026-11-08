import type { TimedMidiExpressionLane, TimedMidiExpressionEvent } from '../../contracts/midi-expression.ts';
import { SoundBankLoader, SpessaSynthProcessor, SpessaLog, GeneratorTypes, type BasicSoundBank, type BasicPreset } from 'spessasynth_core';

import { compareTriggers, fontSchedule, type FontEvent, type FontSchedulePatch, type Trigger } from './soundfont-schedule.ts';
export type { FontEvent } from './soundfont-schedule.ts';
SpessaLog.setLogLevel(false,false,false);
export function loadSoundFont(bytes:ArrayBuffer):BasicSoundBank{return SoundBankLoader.fromArrayBuffer(bytes);}

/** One complete SF2 engine per stream, shared by every note in that stream. */
export class SoundFontStream {
  readonly sampleRate:number;
  readonly synth:SpessaSynthProcessor;
  readonly #events:readonly FontEvent[];
  readonly #drums:BasicPreset|undefined;
  #triggers:Trigger[];
  #noteTriggers = new Map<number, Trigger[]>();
  readonly #channels=new Map<number,number>();
  readonly #leases=new Map<number,{key:string;until:number}>();
  readonly #variants=new Map<string,number>();
  readonly #reserved=new Set<number>();
  readonly #variantUse=new Map<number,{base:string;key:string;until:number}>();
  readonly #history=new Map<string,TimedMidiExpressionEvent[]>();
  readonly #laneChannels=new Map<string,Set<number>>();
  #cursor=0;
  #disposed=false;
  position=0;
  constructor(bank:BasicSoundBank,sampleRate:number,events:readonly FontEvent[],expression:readonly TimedMidiExpressionLane[]=[]) {
    this.sampleRate=sampleRate;
    this.#events=events;
    this.#drums=bank.presets.find(preset=>preset.isGMGSDrum&&preset.program===0);
    this.synth=new SpessaSynthProcessor(sampleRate,{eventsEnabled:false,effectsEnabled:true});
    this.synth.soundBankManager.addSoundBank(bank,'rootsound');
    this.synth.setSystemParameter('autoAllocateVoices',true);
    this.#triggers=fontSchedule(events, expression);
    for (const trigger of this.#triggers) this.#index(trigger);
  }
  #index(trigger: Trigger): void {
    if (trigger.kind !== 'note') return;
    const pair = this.#noteTriggers.get(trigger.id);
    if (pair) pair.push(trigger);
    else this.#noteTriggers.set(trigger.id, [trigger]);
  }
  #insertionPoint(trigger: Trigger, afterEqual = false): number {
    let low = this.#cursor, high = this.#triggers.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      const order = compareTriggers(this.#triggers[middle]!, trigger);
      if (order < 0 || (afterEqual && order === 0)) low = middle + 1;
      else high = middle;
    }
    return low;
  }
  patchSchedule(patch: FontSchedulePatch): void {
    const future = patch.added.filter(trigger =>
      (trigger.kind === 'expression' ? trigger.time : trigger.event.atSeconds) >= this.position);
    if (!patch.replaceExpression && patch.removed.length + future.length <= 32) {
      for (const id of patch.removed) {
        for (const trigger of this.#noteTriggers.get(id) ?? []) {
          if (trigger.kind !== 'note' || (!trigger.on && this.#channels.has(id))) continue;
          let index = this.#insertionPoint(trigger);
          while (index < this.#triggers.length && compareTriggers(this.#triggers[index]!, trigger) === 0) {
            if (this.#triggers[index] === trigger) { this.#triggers.splice(index, 1); break; }
            index++;
          }
        }
        this.#noteTriggers.delete(id);
      }
      for (const trigger of future) {
        this.#triggers.splice(this.#insertionPoint(trigger, true), 0, trigger);
        this.#index(trigger);
      }
      return;
    }
    const removed = new Set(patch.removed);
    const retained = this.#triggers.slice(this.#cursor).filter(trigger => trigger.kind === 'expression'
      ? !patch.replaceExpression
      : !removed.has(trigger.id) || (!trigger.on && this.#channels.has(trigger.id)));
    const combined: Trigger[] = [];
    let i = 0, j = 0;
    while (i < retained.length && j < future.length) {
      if (compareTriggers(retained[i]!, future[j]!) <= 0) combined.push(retained[i++]!);
      else combined.push(future[j++]!);
    }
    this.#triggers = combined.concat(retained.slice(i), future.slice(j));
    this.#cursor = 0;
    this.#noteTriggers.clear();
    for (const trigger of this.#triggers) this.#index(trigger);
  }
  async ready():Promise<void>{await this.synth.ready;}
  #message(channel:number,event:TimedMidiExpressionEvent):void {
    if(event.type==='controller')this.synth.controllerChange(channel,event.controller as Parameters<SpessaSynthProcessor['controllerChange']>[1],event.value);
    else if(event.type==='pitch-bend')this.synth.pitchWheel(channel,event.value);
    else if(event.type==='channel-pressure')this.synth.channelPressure(channel,event.value);
    else this.synth.polyPressure(channel,event.key,event.value);
  }
  #expression(lane:string,event:TimedMidiExpressionEvent):void {
    const history=this.#history.get(lane)??[];history.push(event);this.#history.set(lane,history);
    for(const channel of this.#laneChannels.get(lane)??[])this.#message(channel,event);
  }
  #trigger(trigger:Trigger):void {
    if(trigger.kind==='expression'){this.#expression(trigger.lane,trigger.event);return;}
    const event=trigger.event,font=event.font;
    if(!trigger.on){const channel=this.#channels.get(trigger.id);if(channel!==undefined)this.synth.noteOff(channel,font.key);this.#channels.delete(trigger.id);this.#noteTriggers.delete(trigger.id);return;}
    if(!font.velocity||!event.level)return;
    if(font.midiChannelId){
      // Persistent logical MIDI channels preserve controller/RPN/mono state.
      // A sostenuto-captured retrigger gets its own gate so same-pitch note-offs
      // cannot release a more recent key that was not captured by the pedal.
      const base=JSON.stringify([font.midiChannelId,font.program,font.drums,font.cents,event.level,event.pan]);
      const captured=(font.sostenutoSeconds??event.holdSeconds)>event.holdSeconds+1e-8;
      const key=captured?`${base}:${trigger.id}`:base;
      let channel=this.#variants.get(key);
      if(channel===undefined&&captured){
        const reusable=[...this.#variantUse].find(([index,use])=>use.base===base&&use.until<=this.position&&this.synth.midiChannels[index]!.voiceCount===0);
        if(reusable){channel=reusable[0];this.#variants.delete(reusable[1].key);this.#variants.set(key,channel);}
      }
      if(channel===undefined){
        channel=Array.from({length:this.synth.midiChannels.length},(_,i)=>i).find(i=>!this.#reserved.has(i)&&!this.#leases.has(i));
        if(channel===undefined){channel=this.synth.midiChannels.length;this.synth.createMIDIChannel();}
        this.#variants.set(key,channel);this.#reserved.add(channel);
        const controls=this.synth.midiChannels[channel]!;controls.setDrums(font.drums);this.synth.programChange(channel,font.program);
        controls.setSystemParameter('gain',event.level);controls.setSystemParameter('pan',event.pan);controls.setSystemParameter('fineTune',font.cents);
        for(const message of this.#history.get(font.midiChannelId)??[])this.#message(channel,message);
        const group=this.#laneChannels.get(font.midiChannelId)??new Set<number>();group.add(channel);this.#laneChannels.set(font.midiChannelId,group);
      }
      this.#variantUse.set(channel,{base,key,until:Math.max(this.#variantUse.get(channel)?.until??0,event.atSeconds+(font.soundingSeconds??font.sostenutoSeconds??event.holdSeconds)+event.releaseSeconds)});
      this.#channels.set(trigger.id,channel);this.synth.noteOn(channel,font.key,font.velocity);return;
    }
    const exclusive=font.drums?this.#drums?.getVoiceParameters(font.key,font.velocity)
      .map(voice=>voice.generators[GeneratorTypes.exclusiveClass]).find(group=>group!==0):undefined;
    // Choke groups must survive individual hit gain/pan changes as well.
    const key=exclusive?`exclusive:${font.program}:${exclusive}`:JSON.stringify([font.program,font.drums,font.cents,event.level,event.pan]);
    // Drums with common controls share a channel, preserving hi-hat choke groups.
    let channel=font.drums?[...this.#leases].find(([,lease])=>lease.key===key)?.[0]:undefined;
    if(channel===undefined)channel=Array.from({length:this.synth.midiChannels.length},(_,i)=>i)
      .find(i=>!this.#reserved.has(i)&&(!this.#leases.has(i)||(this.#leases.get(i)!.until<=this.position&&this.synth.midiChannels[i]!.voiceCount===0)));
    if(channel===undefined){channel=this.synth.midiChannels.length;this.synth.createMIDIChannel();}
    const controls=this.synth.midiChannels[channel]!;
    controls.setDrums(font.drums);this.synth.programChange(channel,font.program);
    controls.setSystemParameter('gain',event.level);controls.setSystemParameter('pan',event.pan);controls.setSystemParameter('fineTune',font.cents);
    this.#channels.set(trigger.id,channel);this.#leases.set(channel,{key,until:Math.max(this.#leases.get(channel)?.until??0,event.atSeconds+event.holdSeconds+event.releaseSeconds)});
    this.synth.noteOn(channel,font.key,font.velocity);
  }
  process(left:Float32Array,right:Float32Array,start=0,count=left.length-start):void {
    let offset=start;
    while(offset<start+count) {
      while(this.#cursor<this.#triggers.length&&this.#triggers[this.#cursor]!.time<=this.position+.5/this.sampleRate)this.#trigger(this.#triggers[this.#cursor++]!);
      const next=this.#triggers[this.#cursor]?.time??Infinity;
      const size=Math.min(128,start+count-offset,Math.max(1,Math.round((next-this.position)*this.sampleRate)));
      this.synth.process(left,right,offset,size);this.position+=size/this.sampleRate;offset+=size;
    }
  }
  /** Render only surviving notes/tails during a seek; never replay expired music. */
  seek(seconds:number):void {
    const surviving=this.#events.filter(event=>event.atSeconds<seconds&&event.atSeconds+(event.font.soundingSeconds??event.holdSeconds)+event.releaseSeconds+3>seconds);
    const from=Math.min(seconds,...surviving.map(event=>event.atSeconds));
    this.position=from;
    while(this.#cursor<this.#triggers.length&&this.#triggers[this.#cursor]!.time<from){const trigger=this.#triggers[this.#cursor++]!;if(trigger.kind==='expression')this.#trigger(trigger);}
    const left=new Float32Array(128),right=new Float32Array(128);
    while(this.position+.5/this.sampleRate<seconds){left.fill(0);right.fill(0);this.process(left,right,0,Math.min(128,Math.round((seconds-this.position)*this.sampleRate)));}
  }
  dispose():void{
    if(this.#disposed)return;this.#disposed=true;
    // The parsed immutable bank is shared by concurrent preview/audition streams.
    // Core.destroy() also destroys attached banks, so detach our shared bank first.
    this.synth.soundBankManager.deleteSoundBank('rootsound');this.synth.destroy();
  }
}
