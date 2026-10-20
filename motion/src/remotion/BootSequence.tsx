import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, E, FONT, MONO, pop, tween, typed } from './theme';

export const BOOT_FRAMES = 160;

const LINES: [string, string, string?][] = [
  ['SEJUN-PARK bootloader v2026.10 · build & verify', '', 'dim'],
  ['CPU      STM32F407 @ 168 MHz · FSM 5-layer', 'OK'],
  ['UART1    115200 8N1 · ACK/NACK · DONE/FAIL', 'OK'],
  ['VISION   ZED Mini ×3 · YOLOv8-seg', 'mAP@50 87.3%'],
  ['RELAY    noise guard · 100 runs', '0 faults'],
  ['DB       PostgreSQL 15 · spatial index', '4,000,000 rows'],
  ['AGENTS   pipeline 5/5 · JSON handoff', 'ONLINE'],
  ['CAD      ZYXCAD AX · 6 sheets · LISP check', 'OK'],
  ['AWARDS   loaded', '13'],
  ['mount    /portfolio', 'DONE'],
];
const STEP = 9;
const LOG_END = 8 + LINES.length * STEP; // ≈ 98

export const BootSequence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logOut = interpolate(frame, [LOG_END + 6, LOG_END + 14], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flash = interpolate(frame, [LOG_END + 10, LOG_END + 13, LOG_END + 24], [0, 0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleS = pop(frame, fps, LOG_END + 16, { damping: 16, stiffness: 110 });
  const ruleW = tween(frame, LOG_END + 24, 26, E.expo);
  const subA = tween(frame, LOG_END + 34, 14);
  const progress = tween(frame, 2, LOG_END - 2, (t) => t);
  const endFade = interpolate(frame, [BOOT_FRAMES - 10, BOOT_FRAMES], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: MONO, color: C.text, opacity: endFade }}>
      <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px)', opacity: 0.6 }} />
      <AbsoluteFill style={{ background: 'radial-gradient(800px 500px at 50% 60%, rgba(46,230,197,.06), transparent 60%)' }} />
      {/* 로그 */}
      <div style={{ position: 'absolute', left: 120, top: 120, right: 120, opacity: logOut, fontSize: 19, lineHeight: 1.75 }}>
        {LINES.map(([text, status, kind], i) => {
          const start = 8 + i * STEP;
          if (frame < start) return null;
          const shown = typed(text, frame, start, 2.6);
          const st = pop(frame, fps, start + 6, { damping: 12, stiffness: 200 });
          const ok = status === 'OK' || status === 'DONE' || status === 'ONLINE';
          return (
            <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'baseline', color: kind === 'dim' ? C.dim : C.muted }}>
              <span style={{ color: C.dim, fontSize: 12, width: 70 }}>[{(start / 60).toFixed(3)}]</span>
              <span style={{ whiteSpace: 'pre', minWidth: 560 }}>{shown}{shown.length < text.length ? <span style={{ color: C.mint }}>▋</span> : null}</span>
              {status && shown.length >= text.length && (
                <span style={{ display: 'inline-block', transform: `scale(${0.7 + 0.3 * st})`, opacity: st, fontSize: 13, letterSpacing: '0.15em', padding: '2px 10px', border: `1px solid ${ok ? C.mint : C.amber}`, color: ok ? C.mint : C.amber, borderRadius: 6 }}>{status}</span>
              )}
            </div>
          );
        })}
      </div>
      {/* 진행 바 */}
      <div style={{ position: 'absolute', left: 120, right: 120, bottom: 110, opacity: logOut }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '0.3em', color: C.dim, marginBottom: 10 }}>
          <span>POST · POWER-ON SELF TEST</span><span>{Math.round(progress * 100)}%</span>
        </div>
        <div style={{ height: 2, background: C.line2 }}><div style={{ height: 2, width: `${progress * 100}%`, background: C.mint, boxShadow: `0 0 12px ${C.mint}` }} /></div>
      </div>
      {/* 플래시 */}
      <AbsoluteFill style={{ background: C.mint, opacity: flash * 0.25 }} />
      {/* 타이틀 */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: titleS }}>
        <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.5em', color: C.mint, marginBottom: 26, opacity: subA }}>SYSTEM READY</div>
        <div style={{ fontFamily: FONT, fontSize: 112, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, transform: `scale(${0.92 + 0.08 * titleS})` }}>SEJUN PARK</div>
        <div style={{ width: `${ruleW * 420}px`, height: 2, background: C.mint, margin: '28px 0 22px', boxShadow: `0 0 14px ${C.mint}` }} />
        <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '0.45em', color: C.muted, opacity: subA }}>PORTFOLIO 2026 · BUILD & VERIFY</div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', right: 40, top: 32, fontSize: 11, letterSpacing: '0.3em', color: C.dim }}>{String(Math.floor(frame / 30)).padStart(2, '0')}:{String(frame % 30).padStart(2, '0')}</div>
      <div style={{ position: 'absolute', left: 40, top: 32, fontSize: 11, letterSpacing: '0.3em', color: C.dim }}>BOOT ● 1280×720 · 30 FPS</div>
    </AbsoluteFill>
  );
};

export default BootSequence;
