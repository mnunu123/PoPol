import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Chapter, SceneConfig, Stat } from '@/data/scenes';
import { chapterStarts, sceneDuration } from '@/data/scenes';
import { C, E, FONT, MONO, accentOf, fadeIn, fadeOut, pop, scramble, segments, tween } from './theme';
import { VH, VW, Visual } from './visuals';

export const W = 1280;
export const H = 720;
const PAD = 64;

/* ── 배경: 격자 + 비네트 + 액센트 글로우 + 스캔라인 ── */
const Backdrop: React.FC<{ accent: string }> = ({ accent }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <AbsoluteFill style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)', backgroundSize: '48px 48px', opacity: 0.6 }} />
    <AbsoluteFill style={{ background: `radial-gradient(700px 420px at 85% 0%, ${accent}1f, transparent 60%), radial-gradient(500px 400px at 0% 100%, ${accent}0d, transparent 60%)` }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.45))' }} />
    <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 3px)', opacity: 0.5, mixBlendMode: 'overlay' }} />
  </AbsoluteFill>
);

/* ── 키네틱 타이틀: 단어 단위 스태거 ── */
const Kinetic: React.FC<{ text: string; size: number; accent: string; delay?: number; maxWidth?: number; weight?: number }> = ({ text, size, accent, delay = 0, maxWidth, weight = 800 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let k = 0;
  return (
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: weight, lineHeight: 1.18, letterSpacing: '-0.025em', color: C.text, maxWidth, wordBreak: 'keep-all' }}>
      {segments(text).map((seg, si) => (
        <span key={si} style={{ color: seg.hl ? accent : C.text }}>
          {seg.text.split(' ').map((word, wi, arr) => {
            const idx = k++;
            const s = pop(frame, fps, delay + idx * 2.2, { damping: 16, stiffness: 150 });
            return (
              <span key={wi} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
                <span style={{ display: 'inline-block', transform: `translateY(${(1 - s) * 110}%)`, opacity: Math.min(1, s * 1.4), filter: `blur(${(1 - s) * 6}px)` }}>{word}</span>
                {wi < arr.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
};

/* ── 스탯 카드 (스크램블 숫자) ── */
const StatCard: React.FC<{ s: Stat; i: number; big?: boolean }> = ({ s, i, big }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, 12 + i * 7, { damping: 18 });
  const col = accentOf(s.c);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 22}px)`, borderLeft: `2px solid ${col}`, paddingLeft: 18 }}>
      <div style={{ fontFamily: FONT, fontSize: big ? 52 : 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: col, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {scramble(s.v, frame, 12 + i * 7, 22, `st${i}`)}
      </div>
      <div style={{ fontFamily: FONT, fontSize: big ? 15 : 13.5, color: C.muted, marginTop: 10, fontWeight: 500 }}>{s.l}</div>
    </div>
  );
};

/* ── 챕터 ── */
const ChapterView: React.FC<{ ch: Chapter; idx: number; total: number; scene: SceneConfig; reel?: boolean }> = ({ ch, idx, total, scene, reel }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = accentOf(scene.accent);
  const inA = fadeIn(frame, 8);
  const outA = fadeOut(frame, ch.dur, 10);
  const alpha = Math.min(inA, outA);
  const slide = (1 - inA) * 18 - (1 - outA) * 14;
  const hasVisual = !!ch.visual && ch.visual.type !== 'none';
  const hasStats = !!ch.stats?.length;
  const prog = tween(frame, 0, ch.dur, (t) => t);
  // 레이아웃 결정
  const titleSize = hasVisual || hasStats ? (reel ? 40 : 38) : 54;
  const visualTop = reel ? 186 : 178;
  const visualH = reel ? 372 : hasStats ? 300 : ch.lines?.length ? 410 : 450;
  return (
    <AbsoluteFill style={{ opacity: alpha, transform: `translateY(${slide}px)` }}>
      {/* 상단 바 */}
      <div style={{ position: 'absolute', left: PAD, right: PAD, top: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: MONO, fontSize: 13, letterSpacing: '0.28em', color: C.muted }}>
        <div style={{ color: accent }}>{scene.kicker}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: C.dim }}>{String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          <span style={{ color: C.text }}>{ch.label}</span>
          <span style={{ width: 120, height: 2, background: C.line2, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${prog * 100}%`, background: accent }} />
          </span>
        </div>
      </div>
      {/* 큰 배경 숫자 */}
      <div style={{ position: 'absolute', right: PAD - 10, bottom: -40, fontFamily: MONO, fontSize: 360, fontWeight: 700, color: 'rgba(255,255,255,0.025)', lineHeight: 1, letterSpacing: '-0.06em', pointerEvents: 'none' }}>{String(idx + 1).padStart(2, '0')}</div>

      {/* 타이틀 */}
      <div style={{ position: 'absolute', left: PAD, top: hasVisual || hasStats ? 104 : 150, right: PAD }}>
        <Kinetic text={ch.title} size={titleSize} accent={accent} delay={4} maxWidth={hasVisual || hasStats ? 1100 : 980} />
      </div>

      {/* 라인 */}
      {ch.lines && !hasVisual && (
        <div style={{ position: 'absolute', left: PAD, top: 150 + (ch.title.length > 34 ? 190 : 130) + 10, right: PAD, display: 'grid', gap: 14 }}>
          {ch.lines.map((l, i) => {
            const p = pop(frame, fps, 28 + i * 8, { damping: 18 });
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: p, transform: `translateX(${(1 - p) * 24}px)`, fontFamily: FONT, fontSize: 24, color: C.muted, fontWeight: 500 }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: accent, letterSpacing: '0.2em' }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ width: 28, height: 1, background: C.line2 }} />
                <span>{l}</span>
              </div>
            );
          })}
        </div>
      )}
      {ch.lines && hasVisual && (
        <div style={{ position: 'absolute', left: PAD, top: visualTop + visualH + 14, right: PAD, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {ch.lines.map((l, i) => {
            const p = pop(frame, fps, 30 + i * 6, { damping: 18 });
            return (
              <span key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 10}px)`, fontFamily: FONT, fontSize: 14, color: C.muted, border: `1px solid ${C.line2}`, borderRadius: 8, padding: '6px 12px', background: 'rgba(13,16,19,0.7)' }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: accent, marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</span>{l}
              </span>
            );
          })}
        </div>
      )}

      {/* 비주얼 */}
      {hasVisual && ch.visual && (
        <div style={{ position: 'absolute', left: PAD, right: PAD, top: visualTop, height: visualH, opacity: tween(frame, 10, 12) }}>
          <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
            <Visual v={ch.visual} accent={accent} />
          </svg>
        </div>
      )}

      {/* 스탯 */}
      {hasStats && ch.stats && (
        <div style={{ position: 'absolute', left: PAD, right: PAD, top: hasVisual ? visualTop + visualH + (reel ? 10 : 16) : 236, display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, ch.stats.length)}, 1fr)`, gap: hasVisual ? '18px 32px' : '40px 32px' }}>
          {ch.stats.map((s, i) => <StatCard key={i} s={s} i={i} big={!hasVisual && ch.stats!.length <= 4} />)}
        </div>
      )}
      {ch.note && (
        <div style={{ position: 'absolute', left: PAD, right: PAD, bottom: 44, fontFamily: FONT, fontSize: 14, color: C.amber, opacity: tween(frame, 40, 12), display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.25em', border: `1px solid ${C.amber}`, borderRadius: 6, padding: '2px 8px' }}>HONEST</span>{ch.note}
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ── 씬 전체 ── */
export const ProjectScene: React.FC<{ scene: SceneConfig; reel?: boolean }> = ({ scene, reel }) => {
  const frame = useCurrentFrame();
  const accent = accentOf(scene.accent);
  const chapters = chapterStarts(scene);
  const total = sceneDuration(scene);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text, overflow: 'hidden' }}>
      <Backdrop accent={accent} />
      {chapters.map((ch, i) => (
        <Sequence key={ch.id} from={ch.from} durationInFrames={ch.dur} name={ch.label}>
          <ChapterView ch={ch} idx={i} total={chapters.length} scene={scene} reel={reel} />
        </Sequence>
      ))}
      {/* 하단 전체 진행선 + 챕터 눈금 */}
      <div style={{ position: 'absolute', left: PAD, right: PAD, bottom: 24, height: 2, background: C.line2 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(frame / total) * 100}%`, background: accent, boxShadow: `0 0 10px ${accent}` }} />
        {chapters.slice(1).map((c) => <div key={c.id} style={{ position: 'absolute', left: `${(c.from / total) * 100}%`, top: -3, width: 1, height: 8, background: C.dim }} />)}
      </div>
      {!reel && <div style={{ position: 'absolute', left: PAD, bottom: 32, fontFamily: MONO, fontSize: 10, letterSpacing: '0.3em', color: C.dim }}>SEJUN PARK · PORTFOLIO 2026</div>}
      {!reel && <div style={{ position: 'absolute', right: PAD, bottom: 32, fontFamily: MONO, fontSize: 10, letterSpacing: '0.2em', color: C.dim }}>{String(Math.floor(frame / 30)).padStart(2, '0')}:{String(frame % 30).padStart(2, '0')} / {String(Math.floor(total / 30)).padStart(2, '0')}s</div>}
    </AbsoluteFill>
  );
};

export default ProjectScene;
