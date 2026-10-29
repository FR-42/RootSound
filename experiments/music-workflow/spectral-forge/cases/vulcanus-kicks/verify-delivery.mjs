import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const here=dirname(fileURLToPath(import.meta.url)),out=process.argv[2]?resolve(process.argv[2]):join(here,'delivery-final');
const report=JSON.parse(await readFile(join(out,'generation-verification.json'),'utf8'));
const {normalizePatch,importPatch}=await import(pathToFileURL(join(report.engineDirectory,'model.mjs')));
const {renderPatch,encodeWav24}=await import(pathToFileURL(join(report.engineDirectory,'dsp.mjs')));
const before=JSON.parse((await readFile(join(here,'target-existing-before.json'),'utf8')).replace(/^\uFEFF/,''));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
if(sha(await readFile(before.source)).toUpperCase()!==before.sourceSha256.toUpperCase())throw new Error('Reference changed');
const results=[];
for(const item of report.patches){
  const bytes=await readFile(join(out,item.name+'.rssynth'));
  const loaded=importPatch(JSON.parse(bytes.toString('utf8')));normalizePatch(loaded.patch);
  if(loaded.reduced||Object.values(item.curveCounts).some(n=>n>10))throw new Error('Patch not native editable');
  const rendered=renderPatch(loaded.patch,{sampleRate:48000,midi:60,velocity:1,holdSeconds:item.holdSeconds});
  const expected=await readFile(join(out,item.name+'-单击.wav'));
  if(!Buffer.from(encodeWav24(rendered)).equals(expected))throw new Error('Cold reopened patch differs from delivered audio');
  const longHold=renderPatch(loaded.patch,{sampleRate:48000,midi:60,velocity:1,holdSeconds:1});
  let continuedPeak=0;
  for(let i=Math.round(.55*48000);i<longHold.left.length;i++)continuedPeak=Math.max(continuedPeak,Math.abs(longHold.left[i]),Math.abs(longHold.right[i]));
  if(continuedPeak>1e-5)throw new Error('Holding the key leaves a bass drone');
  results.push({name:item.name,coldReopenWavExact:true,heldKeySelfDecays:true,continuedPeak,sha256:sha(bytes)});
}
for(const item of report.files)if(sha(await readFile(join(out,item.name)))!==item.sha256)throw new Error('Delivery file hash mismatch');
const engines=[];
for(const filename of ['model.mjs','dsp.mjs','curve-density.mjs'])engines.push({filename,sha256:sha(await readFile(join(report.engineDirectory,filename)))});
const notes=`Vulcanus 前20秒：两份 Kick 合成近似\r\n\r\n`+
`A「密集短击」：按3～10秒的密集鼓点方向制作，主体较高、收尾较快。\r\n`+
`B「下潜重击」：按10秒后明显重击方向制作，下滑更明显，低频更深、尾音更长。\r\n\r\n`+
`用“精细音色生成器”打开 .rssynth，以 C4 试听；按住约0.3秒，让鼓声自然结束。\r\n`+
`音量、音高、静态频谱每条10个控制点，可继续修改。无需下载插件或音源。\r\n`+
`同名“单击.wav”是可直接使用的48kHz / 24位立体声单次鼓声。\r\n`+
`“AB-对比试听.wav”前半段是A的密集示例，停顿后是B的稀疏示例；不是原曲节奏转写。\r\n`+
`两份单击峰值均约-3.1dBFS，保留输出余量。\r\n\r\n`+
`使用当前已发布工具 ${report.release} 的原始合成引擎生成。\r\n`+
`没有截取或嵌入原曲采样，没有修改工具或原曲。\r\n`+
`当前环境不支持直接听音，依据瞬态、频率下滑及尾音分析制作；\r\n`+
`它们是两种方向的首版合成近似，尚不能确认与原曲两种kick的对应或相似度。\r\n`;
const notesFile='Vulcanus-Kick-使用说明.txt';await writeFile(join(out,notesFile),notes,{flag:'wx'});
const notesBytes=await readFile(join(out,notesFile));
report.files.push({name:notesFile,bytes:notesBytes.length,sha256:sha(notesBytes)});
const proof={release:report.release,referenceSha256:before.sourceSha256,referenceUnchanged:true,
  sourceAudioIncluded:false,audioInputSupported:false,listeningAccepted:false,realAudioDeviceOpened:false,
  applicationEngineUsed:true,toolChanged:false,engineHashes:engines,checks:results,files:report.files};
await writeFile(join(out,'delivery-verification.json'),JSON.stringify(proof,null,2),{flag:'wx'});
console.log(JSON.stringify(proof,null,2));
