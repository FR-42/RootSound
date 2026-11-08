import React from 'react';
import { AbsoluteFill, Audio, Composition, OffthreadVideo, interpolate, registerRoot, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import chapters from '../../../history/2026-11-06-remotion-onboarding/guidance-scenes.json';

type Scene = { id: string; name: string; title: string; caption: string; frames: number; label: string; clip?: string };
const colour = ['#a7d9c1', '#f3b38e', '#b6b7e7'];
const font = '"Microsoft YaHei", "Segoe UI", sans-serif';
const bound = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

function Ribbons({ voices = false }: { voices?: boolean }) {
  const frame = useCurrentFrame(), t = frame / 30;
  return <svg viewBox="0 0 1280 720" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    <defs><radialGradient id="halo"><stop stopColor="#69b09c" stopOpacity=".18"/><stop offset="1" stopColor="#69b09c" stopOpacity="0"/></radialGradient></defs>
    <ellipse cx="810" cy="340" rx="560" ry="340" fill="url(#halo)"/>
    {[0, 1, 2].map(layer => {
      const path = Array.from({ length: 181 }, (_, i) => {
        const x = i * 8 - 80, edge = Math.sin(i / 180 * Math.PI);
        const y = 350 + Math.sin(x / (voices ? 100 + layer * 24 : 145) - t * .7 + layer * .9) * (72 + layer * 23) * edge;
        return `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
      }).join(' ');
      return <g key={layer}><path d={path} fill="none" stroke={colour[layer]} strokeWidth={layer === 0 ? 2.5 : 1.4} opacity={.58 - layer * .1}/>
        {Array.from({ length: 7 }, (_, i) => {
          const x = 350 + i * 115, y = 350 + Math.sin(x / (voices ? 100 + layer * 24 : 145) - t * .7 + layer * .9) * (72 + layer * 23);
          const growth = spring({ frame: frame - i * 5 - layer * 8, fps: 30, config: { damping: 22, stiffness: 85 } });
          return <rect key={i} x={x} y={y} width={16 * growth} height={(32 + i % 3 * 19) * growth} rx="5" fill={colour[layer]} opacity={.7}/>;
        })}</g>;
    })}
    {[0,1,2,3].map(i => <circle key={i} cx="920" cy="350" r={100 + i * 60 + Math.sin(t * .5) * 20} fill="none" stroke="#adcac4" opacity={.08 - i * .012}/>) }
  </svg>;
}

function SceneView({ scene, index }: { scene: Scene; index: number }) {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const reveal = spring({ frame: frame - 6, fps, config: { damping: 25, stiffness: 75 } });
  const abstract = !scene.clip;
  const ending = scene.id === 'begin';
  const clipLength: Record<string, number> = { 'add-voice': 5.6667, editing: 6.2, zoom: 9.5, bpm: 10.5334, cells: 5.8334, extend: 4.8 };
  const speed = scene.clip ? Math.max(.8, clipLength[scene.clip]! / ((scene.frames - 25) / fps)) : 1;
  return <AbsoluteFill style={{ background: '#0a2027', color: '#f0f2e9', fontFamily: font, overflow: 'hidden' }}>
    <Ribbons voices={scene.id === 'voices'}/>
    <AbsoluteFill style={{ background: abstract ? 'linear-gradient(90deg,#0a202700,#0a202700)' : 'linear-gradient(180deg,#0a202700,#0a2027a0)' }}/>
    <div style={{ position: 'absolute', left: 66, top: 38, fontSize: 12, letterSpacing: 3, color: '#94afa8' }}>简乐 <span style={{ padding: '0 15px', opacity: .5 }}>/</span> {scene.label}</div>
    <div style={{ position: 'absolute', right: 66, top: 38, fontSize: 12, color: '#8fa89f', letterSpacing: 3 }}>0{index + 1}</div>
    {abstract ? <>
      <div style={{ position: 'absolute', left: 84, top: ending ? 166 : 153, width: 780, opacity: reveal, transform: `translateY(${(1 - reveal) * 30}px)` }}>
        <div style={{ width: 50, height: 2, background: colour[scene.id === 'voices' ? 1 : 0], marginBottom: 28 }}/>
        <h1 style={{ fontSize: ending ? 68 : 64, fontWeight: 500, lineHeight: 1.45, letterSpacing: -2, margin: 0, textShadow: '0 4px 40px #0a2027' }}>{scene.title}</h1>
        <p style={{ fontSize: 20, lineHeight: 1.8, color: '#b7cbc4', marginTop: 28 }}>{scene.caption}</p>
      </div>
      {scene.id === 'voices' && <div style={{ position: 'absolute', bottom: 98, left: 88, display: 'flex', gap: 58 }}>{['钢琴','长笛','弦乐'].map((name,i) => <span key={name} style={{ color: colour[i], opacity: interpolate(frame, [i * 27, i * 27 + 24], [.15,1], bound), fontSize: 18, letterSpacing: 4 }}><span style={{ fontSize: 10, marginRight: 12 }}>●</span>{name}</span>)}</div>}
      {ending && <div style={{ position: 'absolute', left: 88, bottom: 92, color: '#a7d9c1', fontSize: 16, letterSpacing: 6 }}>听见 · 看见 · 写下</div>}
    </> : <>
      <div style={{ position: 'absolute', left: 80, top: 90, opacity: reveal, transform: `translateY(${(1 - reveal) * 15}px)` }}>
        <h1 style={{ fontSize: 37, fontWeight: 500, margin: 0, letterSpacing: -.5 }}>{scene.title}</h1>
        <p style={{ margin: '13px 0 0', fontSize: 17, color: '#bacdc5' }}>{scene.caption}</p>
      </div>
      <div style={{ position: 'absolute', top: 207, left: 194, width: 892, height: 502, overflow: 'hidden', borderRadius: 12, boxShadow: '0 25px 90px #0007', border: '1px solid #b2d0c130', transformOrigin: '50% 50%', transform: `translateY(${(1 - reveal) * 36}px) scale(${.97 + reveal * .03})`, opacity: reveal }}>
        <OffthreadVideo src={staticFile(`${scene.clip}.mp4`)} muted playbackRate={speed} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        <div style={{ position: 'absolute', inset: 0, border: '1px solid #ffffff30', borderRadius: 12, pointerEvents: 'none' }}/>
      </div>
      <div style={{ position: 'absolute', left: 80, bottom: 100, writingMode: 'vertical-rl', letterSpacing: 5, fontSize: 11, color: '#a6c4b4', opacity: .75 }}>真实操作演示</div>
    </>}
  </AbsoluteFill>;
}

function Film({ id }: { id: 'basics' | 'tempo-rolls' }) {
  const scenes: Scene[] = chapters[id];
  return <AbsoluteFill style={{ background: '#0a2027' }}>
    <TransitionSeries>{scenes.flatMap((scene, index) => [
      ...(index ? [<TransitionSeries.Transition key={`transition-${index}`} presentation={fade()} timing={linearTiming({ durationInFrames: chapters.transitionFrames })}/>] : []),
      <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.frames}><SceneView scene={scene} index={index}/></TransitionSeries.Sequence>,
    ])}</TransitionSeries>
    <Audio src={staticFile('overture.wav')} volume={frame => interpolate(frame, [0, 35, length(id) - 60, length(id) - 1], [0, .7, .7, 0], bound)}/>
  </AbsoluteFill>;
}
const length = (id: 'basics' | 'tempo-rolls') => chapters[id].reduce((sum, scene) => sum + scene.frames, 0) - (chapters[id].length - 1) * chapters.transitionFrames;
const Root = () => <>{(['basics', 'tempo-rolls'] as const).map(id => <Composition key={id} id={id} component={Film} defaultProps={{ id }} fps={chapters.fps} width={1280} height={720} durationInFrames={length(id)}/>)}</>;
registerRoot(Root);
