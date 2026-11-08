import type {TimedMidiExpressionLane} from '../../contracts/midi-expression.ts';
import type {ScheduledPreview} from './plan.ts';
import { createFontScheduleEditor, type FontEvent } from './soundfont-schedule.ts';
import { WEB_STARTER_TONES } from '../../contracts/web-audio.ts';
type Bank = 'starter' | 'full';
export type SoundFontSource = AudioBufferSourceNode & {
  starterOnly: boolean;
  failure: Promise<never>;
  scheduled: Promise<void>;
  updateSchedule(events: readonly FontEvent[], expression: readonly TimedMidiExpressionLane[]): void;
};
const prepared = new WeakMap<BaseAudioContext, Map<Bank, Promise<void>>>();
const modules = new WeakMap<BaseAudioContext, Promise<void>>();
const readyContexts = new WeakMap<BaseAudioContext, Set<Bank>>();
const scheduling = new WeakMap<BaseAudioContext, Set<Promise<void>>>();
const downloads = new Map<Bank, Promise<ArrayBuffer>>();
const starterPrograms = new Set<number>(Object.values(WEB_STARTER_TONES));
const bankPath = (import.meta.env?.BASE_URL ?? '/') + 'instruments/generaluser-gs-2.0.3/';

export async function awaitSoundFontScheduling(audio: BaseAudioContext): Promise<void> { await Promise.all(scheduling.get(audio) ?? []); }
export const hasSoundFont = (preview: ScheduledPreview) => preview.events.some(event => event.sound.kind === 'sample' && !!event.sound.soundFont);
export function supportsStarterSoundFont(preview: ScheduledPreview): boolean {
  return import.meta.env?.MODE === 'website' && preview.events.every(({ sound }) =>
    sound.kind !== 'sample' || !sound.soundFont || !sound.soundFont.drums && starterPrograms.has(sound.soundFont.program));
}
export function soundFontReady(audio: BaseAudioContext, preview: ScheduledPreview): boolean {
  const ready = readyContexts.get(audio);
  return !!ready && (ready.has('full') || ready.has('starter') && supportsStarterSoundFont(preview));
}

function downloadBank(bank: Bank): Promise<ArrayBuffer> {
  let pending = downloads.get(bank);
  if (!pending) {
    const filename = bank === 'starter' ? 'GeneralUser-GS-starter.sf2' : 'GeneralUser-GS.sf2';
    pending = fetch(bankPath + filename).then(response => {
      if (!response.ok) throw Error('音源读取失败，请检查网络或安装资源后重试。');
      return response.arrayBuffer();
    }).catch(error => { downloads.delete(bank); throw error; });
    downloads.set(bank, pending);
  }
  return pending;
}

export async function preloadWebSoundFont(): Promise<void> {
  if (import.meta.env?.MODE === 'website' && typeof AudioWorkletNode === 'function') await downloadBank('starter');
}

function prepareBank(audio: BaseAudioContext, bank: Bank): Promise<void> {
  const banks = prepared.get(audio) ?? new Map<Bank, Promise<void>>();
  prepared.set(audio, banks);
  let pending = banks.get(bank);
  if (!pending) {
    let module = modules.get(audio);
    if (!module) {
      module = import('./soundfont-worklet.ts?worker&url').then(({ default: url }) => audio.audioWorklet.addModule(url))
        .catch(error => { modules.delete(audio); throw error; });
      modules.set(audio, module);
    }
    pending = Promise.all([module, downloadBank(bank)]).then(([, bytes]) => new Promise<void>((resolve, reject) => {
      const init = new AudioWorkletNode(audio, 'rootsound-soundfont', {
        numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2],
        processorOptions: { bank: bytes, starter: bank === 'starter' },
      });
      const timer = setTimeout(() => finish(Error('音源初始化超时。')), 30000);
      function finish(error?: Error) {
        clearTimeout(timer); init.onprocessorerror = null; init.port.close();
        if (error) reject(error); else resolve();
      }
      init.port.onmessage = event => finish(event.data.type === 'ready' ? undefined : Error(event.data.message));
      init.onprocessorerror = () => finish(Error('音源初始化失败。'));
    })).then(() => {
      const ready = readyContexts.get(audio) ?? new Set<Bank>();
      ready.add(bank); readyContexts.set(audio, ready);
    }).catch(error => { banks.delete(bank); throw error; });
    banks.set(bank, pending);
  }
  return pending;
}

export async function prepareSoundFont(audio: BaseAudioContext, preview: ScheduledPreview): Promise<void> {
  if (!hasSoundFont(preview) || soundFontReady(audio, preview)) return;
  const full = prepared.get(audio)?.get('full');
  if (full) return full;
  if (supportsStarterSoundFont(preview)) {
    try { await prepareBank(audio, 'starter'); return; }
    catch {}
  }
  await prepareBank(audio, 'full');
}
/** Adapts one streaming SF2 processor to the shared scheduled-source lifecycle. */
export function createSoundFontSource(audio:BaseAudioContext,events:FontEvent[],midiExpression:readonly TimedMidiExpressionLane[]=[]): SoundFontSource {
  const node=new AudioWorkletNode(audio,'rootsound-soundfont',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2],processorOptions:{events,midiExpression}});
  let rejectFailure:(error:Error)=>void=()=>{};
  const failure=new Promise<never>((_resolve,reject)=>{rejectFailure=reject;});
  void failure.catch(()=>{});
  let ready:()=>void=()=>{};
  const scheduled=Promise.race([new Promise<void>(resolve=>{ready=resolve;}),failure]);
  const tasks=scheduling.get(audio)??new Set<Promise<void>>();scheduling.set(audio,tasks);tasks.add(scheduled);
  void scheduled.then(()=>tasks.delete(scheduled),()=>tasks.delete(scheduled));
  let editSchedule: ReturnType<typeof createFontScheduleEditor> | undefined;
  const source={onended:null as null|(()=>void),
    failure,scheduled,starterOnly: !readyContexts.get(audio)?.has('full'),
    updateSchedule(nextEvents: readonly FontEvent[], nextExpression: readonly TimedMidiExpressionLane[]) {
      editSchedule ??= createFontScheduleEditor(events, midiExpression);
      const patch = editSchedule(nextEvents, nextExpression);
      if (patch) node.port.postMessage({ type: 'patch-schedule', patch });
    },
    connect(destination:AudioNode){node.connect(destination);},
    disconnect(){ready();node.port.postMessage({type:'dispose'});node.disconnect();node.port.close();},
    start(at=0,position=0){node.port.postMessage({type:'start',at,position});},
    stop(at=audio.currentTime){node.port.postMessage({type:'stop',at});},
  };
  node.port.onmessage=event=>{if(event.data.type==='scheduled')ready();if(event.data.type==='ended')source.onended?.();if(event.data.type==='error')rejectFailure(Error(event.data.message));};
  node.onprocessorerror=()=>rejectFailure(Error('SoundFont 后台音频处理失败。'));
  return source as unknown as SoundFontSource;
}
