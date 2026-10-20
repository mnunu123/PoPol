import React from 'react';
import { random, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Visual as VisualSpec } from '@/data/scenes';
import { C, E, MONO, FONT, fmt, pop, scramble, tween, typed } from './theme';

/* 모든 비주얼은 640×300 viewBox 안에서 그린다. 바깥에서 비율 유지하며 스케일. */
export const VW = 640;
export const VH = 300;

const mono = (size: number, fill: string, extra: React.SVGAttributes<SVGTextElement> = {}) => ({ fontFamily: MONO, fontSize: size, fill, ...extra });
const sans = (size: number, fill: string, weight = 700) => ({ fontFamily: FONT, fontSize: size, fill, fontWeight: weight });

/* ───────────── Pipeline ───────────── */
const Pipeline: React.FC<{ nodes: string[]; accent: string }> = ({ nodes, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = nodes.length;
  const gap = n > 4 ? 18 : 26;
  const w = Math.min(150, (VW - 20 - gap * (n - 1)) / n);
  const h = 92;
  const total = n * w + (n - 1) * gap;
  const x0 = (VW - total) / 2;
  const y0 = VH / 2 - h / 2 - 10;
  const step = n > 4 ? 10 : 12;
  const allIn = 8 + (n - 1) * step + 16;
  const pulseT = Math.max(0, frame - allIn);
  const chainLen = total - w;
  const pulseX = x0 + w / 2 + ((pulseT * 3.2) % (chainLen + 40));
  return (
    <g>
      {nodes.map((label, i) => {
        const [t, ...sub] = label.split('\n');
        const x = x0 + i * (w + gap);
        const s = pop(frame, fps, 8 + i * step);
        const cx = x + w / 2, cy = y0 + h / 2;
        const active = pulseT > 0 && pulseX > x && pulseX < x + w;
        return (
          <g key={i} transform={`translate(${cx} ${cy}) scale(${0.8 + 0.2 * s}) translate(${-cx} ${-cy})`} opacity={s}>
            <rect x={x} y={y0} width={w} height={h} rx={12} fill={active ? `${accent}22` : 'rgba(255,255,255,0.02)'} stroke={active ? accent : C.line2} strokeWidth={active ? 1.6 : 1} />
            <text x={x + 12} y={y0 + 20} {...mono(9, accent)} letterSpacing={2}>{String(i + 1).padStart(2, '0')}</text>
            <text x={x + 12} y={y0 + 44} {...sans(13.5, C.text)}>{t}</text>
            {sub.map((sl, k) => (
              <text key={k} x={x + 12} y={y0 + 62 + k * 13} {...sans(9.5, C.muted, 500)}>{sl}</text>
            ))}
          </g>
        );
      })}
      {nodes.slice(0, -1).map((_, i) => {
        const xa = x0 + i * (w + gap) + w;
        const xb = xa + gap;
        const y = y0 + h / 2;
        const d = tween(frame, 8 + i * step + 7, 9);
        return (
          <g key={`c${i}`}>
            <line x1={xa} y1={y} x2={xa + (xb - xa) * d} y2={y} stroke={C.line2} strokeWidth={1.2} />
            {d > 0.99 && <path d={`M${xb - 5} ${y - 4} L${xb} ${y} L${xb - 5} ${y + 4}`} fill="none" stroke={C.line2} strokeWidth={1.2} />}
          </g>
        );
      })}
      {pulseT > 0 && pulseX < x0 + total && (
        <g>
          <circle cx={pulseX} cy={y0 + h / 2} r={4} fill={accent} opacity={0.9} />
          <circle cx={pulseX} cy={y0 + h / 2} r={9} fill="none" stroke={accent} opacity={0.35} />
        </g>
      )}
      <text x={VW / 2} y={VH - 14} textAnchor="middle" {...mono(9, C.dim)} letterSpacing={3}>{pulseT > 0 ? 'DATA FLOW · LIVE' : 'INITIALIZING'}</text>
    </g>
  );
};

/* ───────────── Scope (릴레이 노이즈 → 0) ───────────── */
const buildScope = () => {
  const pts: { x: number; y: number; noisy: boolean }[] = [];
  const mid = VH / 2 + 10, amp = 48, period = 84, fixX = VW * 0.56;
  for (let x = 0; x <= VW; x += 2) {
    const phase = Math.floor(x / (period / 2)) % 2;
    let y = phase === 0 ? mid - amp : mid + amp;
    const noisy = x < fixX;
    if (noisy) {
      const r = random(`sc-${x}`);
      if (r > 0.9) y += (random(`sh-${x}`) - 0.5) * 120;
      else y += (random(`sj-${x}`) - 0.5) * 10;
    }
    pts.push({ x, y, noisy });
  }
  return { pts, fixX, mid, amp };
};
const SCOPE = buildScope();
const Scope: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const sweep = tween(frame, 4, 92, E.inOut) * VW;
  const { pts, fixX, mid, amp } = SCOPE;
  const vis = pts.filter((p) => p.x <= sweep);
  const noisyPath = vis.filter((p) => p.noisy).map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
  const cleanPts = vis.filter((p) => !p.noisy);
  const cleanPath = cleanPts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
  const passed = sweep > fixX;
  const head = vis[vis.length - 1];
  return (
    <g>
      {Array.from({ length: 17 }).map((_, i) => <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={VH} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 8 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * 40} x2={VW} y2={i * 40} stroke="rgba(255,255,255,0.05)" />)}
      <line x1={0} y1={mid} x2={VW} y2={mid} stroke="rgba(255,255,255,0.12)" strokeDasharray="2 4" />
      <text x={12} y={18} {...mono(9, C.dim)} letterSpacing={2}>CH1 · BUTTON_IN   2V/div   20ms/div</text>
      <text x={12} y={mid - amp - 10} {...mono(8, C.dim)}>CLOSE</text>
      <text x={12} y={mid + amp + 16} {...mono(8, C.dim)}>OPEN</text>
      <path d={noisyPath} fill="none" stroke={C.red} strokeWidth={1.8} opacity={0.95} />
      <path d={cleanPath} fill="none" stroke={accent} strokeWidth={2} />
      <line x1={fixX} y1={20} x2={fixX} y2={VH - 20} stroke={C.muted} strokeDasharray="3 4" opacity={passed ? 1 : 0.4} />
      <text x={fixX + 8} y={34} {...mono(9, passed ? accent : C.dim)} letterSpacing={2}>FIX · HW 4 + SW 2</text>
      {head && <circle cx={head.x} cy={head.y} r={3.5} fill={head.noisy ? C.red : accent} />}
      {head && <circle cx={head.x} cy={head.y} r={9} fill="none" stroke={head.noisy ? C.red : accent} opacity={0.4} />}
      <text x={VW - 12} y={18} textAnchor="end" {...mono(9, C.red)} letterSpacing={2} opacity={passed ? 0.4 : 1}>BEFORE · 오동작 100%</text>
      {passed && <text x={VW - 12} y={VH - 14} textAnchor="end" {...mono(11, accent)} letterSpacing={2}>{scramble('AFTER · 100 runs · 0 faults', frame, 56, 24, 'scope')}</text>}
    </g>
  );
};

/* ───────────── Bars ───────────── */
const Bars: React.FC<{ items: [string, number][]; unit?: string; max?: number; caption?: string; invert?: boolean; accent: string }> = ({ items, unit = '', max, caption, invert, accent }) => {
  const frame = useCurrentFrame();
  const mx = max ?? Math.max(...items.map((i) => i[1]));
  const best = invert ? Math.min(...items.map((i) => i[1])) : Math.max(...items.map((i) => i[1]));
  const rowH = Math.min(58, (VH - 50) / items.length);
  const y0 = 18, labelW = 150, barW = VW - labelW - 90;
  return (
    <g>
      {items.map(([label, v], i) => {
        const t = tween(frame, 8 + i * 10, 34, E.expo);
        const y = y0 + i * rowH;
        const isBest = v === best;
        const col = isBest ? accent : C.dim;
        const w = (v / mx) * barW * t;
        return (
          <g key={i}>
            <text x={labelW - 12} y={y + rowH / 2 + 4} textAnchor="end" {...sans(12.5, isBest ? C.text : C.muted, isBest ? 700 : 500)}>{label}</text>
            <rect x={labelW} y={y + rowH / 2 - 11} width={barW} height={22} rx={4} fill="rgba(255,255,255,0.04)" />
            <rect x={labelW} y={y + rowH / 2 - 11} width={w} height={22} rx={4} fill={col} opacity={isBest ? 0.9 : 0.45} />
            <text x={labelW + w + 10} y={y + rowH / 2 + 4} {...mono(12, isBest ? accent : C.muted)} fontWeight={700}>{fmt(v * t, v % 1 ? 1 : 0)}{unit}</text>
          </g>
        );
      })}
      {caption && <text x={labelW} y={VH - 12} {...mono(9, C.dim)} letterSpacing={1.5}>{caption}</text>}
    </g>
  );
};

/* ───────────── MapDots (400만 건 → 뷰포트) ───────────── */
const DOTS = (() => {
  const out: { x: number; y: number; t: number }[] = [];
  const cols = 34, rows = 14;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const seed = `${r}-${c}`;
    out.push({ x: 14 + c * ((VW - 28) / (cols - 1)) + (random(`jx${seed}`) - 0.5) * 12, y: 26 + r * ((VH - 60) / (rows - 1)) + (random(`jy${seed}`) - 0.5) * 10, t: random(`t${seed}`) * 38 });
  }
  return out;
})();
const MapDots: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vp = tween(frame, 48, 22, E.expo);
  const vw = 250 * vp, vh = 130 * vp;
  const cx = VW / 2 + 40, cy = VH / 2;
  const inside = (d: { x: number; y: number }) => Math.abs(d.x - cx) < vw / 2 && Math.abs(d.y - cy) < vh / 2;
  const visible = DOTS.filter((d) => inside(d)).length;
  const phaseB = frame >= 48;
  const count = Math.round(tween(frame, 2, 40, E.expo) * 4_000_000);
  const lag = !phaseB && frame > 30 && Math.floor(frame / 4) % 2 === 0;
  return (
    <g>
      {DOTS.map((d, i) => {
        const a = tween(frame, d.t, 6);
        const inn = inside(d);
        const op = !phaseB ? a * 0.75 : inn ? 1 : 0.12;
        return <circle key={i} cx={d.x} cy={d.y} r={phaseB && inn ? 2.4 : 1.8} fill={phaseB && inn ? accent : C.muted} opacity={op} />;
      })}
      {phaseB && (
        <g>
          <rect x={cx - vw / 2} y={cy - vh / 2} width={vw} height={vh} fill={`${accent}10`} stroke={accent} strokeWidth={1.4} />
          <text x={cx - vw / 2} y={cy - vh / 2 - 8} {...mono(9, accent)} letterSpacing={2}>BBOX  minLat..maxLng</text>
        </g>
      )}
      <rect x={12} y={10} width={210} height={44} rx={8} fill="rgba(13,16,19,0.85)" stroke={C.line2} />
      <text x={24} y={28} {...mono(9, C.dim)} letterSpacing={2}>{phaseB ? 'VIEWPORT ROWS' : 'TOTAL ROWS'}</text>
      <text x={24} y={46} {...mono(14, phaseB ? accent : C.text)} fontWeight={700}>{phaseB ? fmt(visible) : fmt(count)}</text>
      <g opacity={pop(frame, fps, 30)}>
        <rect x={VW - 212} y={10} width={200} height={28} rx={6} fill={phaseB ? `${accent}22` : 'rgba(255,77,77,0.18)'} stroke={phaseB ? accent : C.red} />
        <text x={VW - 112} y={28} textAnchor="middle" {...mono(9.5, phaseB ? accent : C.red)} letterSpacing={2} opacity={lag ? 0.3 : 1}>{phaseB ? 'SPATIAL INDEX · OK' : 'LAG · FULL SCAN'}</text>
      </g>
      <text x={VW / 2} y={VH - 8} textAnchor="middle" {...mono(9, C.dim)} letterSpacing={2}>{phaseB ? 'deck.gl viewport rendering · idle → fetch bbox' : 'drag → 전체 순회 조회 → 렉'}</text>
    </g>
  );
};

/* ───────────── Blueprint (DRAIN-X) ───────────── */
const Blueprint: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const draw = (from: number, dur: number) => 1 - tween(frame, from, dur, E.inOut);
  const boom = tween(frame, 50, 34, E.inOut);
  const chain = tween(frame, 88, 30, E.inOut);
  const arc = tween(frame, 28, 30, E.inOut);
  const bodyX = 110, bodyY = 118, bodyW = 180, bodyH = 90;
  const ground = 236;
  const boomX2 = bodyX + bodyW + 150 * boom;
  const chainY2 = 150 + 100 * chain;
  const dimStroke = { stroke: C.muted, strokeWidth: 0.8 } as const;
  const ink = accent;
  return (
    <g>
      {Array.from({ length: 33 }).map((_, i) => <line key={`g${i}`} x1={i * 20} y1={0} x2={i * 20} y2={VH} stroke={`${accent}12`} />)}
      {Array.from({ length: 16 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * 20} x2={VW} y2={i * 20} stroke={`${accent}12`} />)}
      {/* 보도 · 연석 · 차도 */}
      <path d={`M0 ${ground} H360 V${ground + 16} H640`} fill="none" stroke={C.muted} strokeWidth={1.2} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(0, 24)} />
      <text x={30} y={ground + 30} {...mono(8, C.dim)} letterSpacing={2}>SIDEWALK</text>
      <text x={560} y={ground + 40} {...mono(8, C.dim)} letterSpacing={2}>ROAD</text>
      {/* 빗물받이 */}
      <rect x={400} y={ground + 16} width={70} height={6} fill="none" stroke={C.muted} strokeWidth={1} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(10, 20)} />
      <text x={400} y={ground + 38} {...mono(7.5, C.dim)}>STORM DRAIN 300×400</text>
      {/* 본체 */}
      <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} rx={6} fill="none" stroke={ink} strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(6, 36)} />
      <rect x={bodyX + 14} y={bodyY + 14} width={60} height={30} fill="none" stroke={ink} strokeWidth={0.8} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(20, 20)} />
      <text x={bodyX + 18} y={bodyY + 33} {...mono(7, C.dim)}>48V SWAP</text>
      <text x={bodyX + 100} y={bodyY + 33} {...mono(7, C.dim)}>HOPPER 160L</text>
      {[bodyX + 40, bodyX + 140].map((wx, i) => (
        <circle key={i} cx={wx} cy={ground - 14} r={14} fill="none" stroke={ink} strokeWidth={1.4} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(30 + i * 6, 18)} />
      ))}
      {/* 플리퍼 아크 162° */}
      <path d={`M${bodyX + 30 - 60} ${bodyY} A 60 60 0 0 1 ${bodyX + 30 + 60 * Math.cos((342 * Math.PI) / 180)} ${bodyY + 60 * Math.sin((342 * Math.PI) / 180)}`} fill="none" stroke={C.violet} strokeWidth={1} strokeDasharray="3 3" pathLength={1} strokeDashoffset={1 - arc} />
      <text x={bodyX - 2} y={bodyY - 60} {...mono(9, C.violet)} opacity={arc} fontWeight={700}>162°</text>
      <text x={bodyX - 2} y={bodyY - 48} {...mono(7, C.dim)} opacity={arc}>FLIPPER SWING</text>
      {/* 텔레스코픽 붐 */}
      <rect x={bodyX + bodyW} y={140} width={boomX2 - (bodyX + bodyW)} height={14} fill={`${accent}22`} stroke={ink} strokeWidth={1.2} />
      {/* 치수선 650 */}
      <g opacity={boom}>
        <line x1={bodyX + bodyW} y1={110} x2={boomX2} y2={110} {...dimStroke} />
        <line x1={bodyX + bodyW} y1={104} x2={bodyX + bodyW} y2={116} {...dimStroke} />
        <line x1={boomX2} y1={104} x2={boomX2} y2={116} {...dimStroke} />
        <text x={(bodyX + bodyW + boomX2) / 2} y={104} textAnchor="middle" {...mono(10, accent)} fontWeight={700}>{fmt(Math.round(650 * boom))}</text>
        <text x={(bodyX + bodyW + boomX2) / 2} y={128} textAnchor="middle" {...mono(7, C.dim)}>SIDE REACH</text>
      </g>
      {/* Z 집체인 + 클램셸 */}
      <line x1={boomX2 - 10} y1={154} x2={boomX2 - 10} y2={chainY2} stroke={ink} strokeWidth={1.6} strokeDasharray="4 3" />
      <path d={`M${boomX2 - 22} ${chainY2} l6 14 h12 l6 -14 z`} fill={`${accent}30`} stroke={ink} strokeWidth={1} opacity={chain > 0.05 ? 1 : 0} />
      <g opacity={chain}>
        <line x1={boomX2 + 22} y1={154} x2={boomX2 + 22} y2={chainY2 + 14} {...dimStroke} />
        <text x={boomX2 + 28} y={(154 + chainY2) / 2 + 4} {...mono(10, accent)} fontWeight={700}>{fmt(Math.round(1950 * chain))}</text>
        <text x={boomX2 + 28} y={(154 + chainY2) / 2 + 16} {...mono(7, C.dim)}>Z STROKE</text>
      </g>
      {/* 타이틀 블록 */}
      <g opacity={tween(frame, 100, 16)}>
        <rect x={VW - 196} y={10} width={184} height={46} fill="rgba(13,16,19,0.85)" stroke={C.line2} />
        <text x={VW - 186} y={26} {...mono(8.5, C.text)} fontWeight={700}>DRAIN-X · 2035 자율 준설 로봇</text>
        <text x={VW - 186} y={39} {...mono(7.5, C.dim)}>S04 WORK SECTION · 1:20 · ZYXCAD AX</text>
        <text x={VW - 186} y={50} {...mono(7.5, C.dim)}>DRAWN 박세준 · 2026-10-05 · REV A</text>
      </g>
      <text x={14} y={16} {...mono(8, accent)} letterSpacing={2}>{typed('W 850 · H 1,450 · 450 kg ≤ · 15 km/h ≤', frame, 4, 0.9)}</text>
    </g>
  );
};

/* ───────────── Boxes (비전 검출) ───────────── */
const BOX_COL: Record<string, string> = { helmet: C.mint, no_helmet: C.red, mask: C.blue, no_mask: C.amber, hole: C.mint, storm_drain: C.violet };
const Boxes: React.FC<{ labels: string[]; accent: string }> = ({ labels, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scan = tween(frame, 0, 44, E.inOut) * VH;
  const boxes = [
    { x: 70, y: 60, w: 80, h: 110, l: 0 }, { x: 200, y: 90, w: 70, h: 100, l: 1 }, { x: 330, y: 50, w: 90, h: 130, l: 2 },
    { x: 470, y: 100, w: 64, h: 96, l: 0 }, { x: 560, y: 70, w: 60, h: 110, l: labels.length > 3 ? 3 : 1 },
  ];
  const fpsCount = Math.round(tween(frame, 10, 20) * 30);
  return (
    <g>
      <rect x={0} y={0} width={VW} height={VH} fill="rgba(255,255,255,0.02)" />
      {boxes.map((b, i) => (
        <g key={`s${i}`} opacity={0.18}>
          <circle cx={b.x + b.w / 2} cy={b.y + 18} r={14} fill={C.muted} />
          <rect x={b.x + 8} y={b.y + 34} width={b.w - 16} height={b.h - 34} rx={8} fill={C.muted} />
        </g>
      ))}
      <line x1={0} y1={scan} x2={VW} y2={scan} stroke={accent} strokeWidth={1} opacity={frame < 46 ? 0.8 : 0} />
      <rect x={0} y={Math.max(0, scan - 30)} width={VW} height={30} fill={`url(#scan)`} opacity={frame < 46 ? 0.5 : 0} />
      <defs><linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={accent} stopOpacity="0" /><stop offset="1" stopColor={accent} stopOpacity="0.35" /></linearGradient></defs>
      {boxes.map((b, i) => {
        const s = pop(frame, fps, 14 + i * 9);
        const lab = labels[b.l % labels.length];
        const col = BOX_COL[lab] ?? accent;
        const conf = 0.82 + random(`conf${i}`) * 0.15;
        const L = 10;
        return (
          <g key={i} opacity={s} transform={`translate(${b.x + b.w / 2} ${b.y + b.h / 2}) scale(${0.9 + 0.1 * s}) translate(${-(b.x + b.w / 2)} ${-(b.y + b.h / 2)})`}>
            <path d={`M${b.x} ${b.y + L} V${b.y} H${b.x + L} M${b.x + b.w - L} ${b.y} H${b.x + b.w} V${b.y + L} M${b.x + b.w} ${b.y + b.h - L} V${b.y + b.h} H${b.x + b.w - L} M${b.x + L} ${b.y + b.h} H${b.x} V${b.y + b.h - L}`} fill="none" stroke={col} strokeWidth={2} />
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={col} opacity={0.06} />
            <rect x={b.x} y={b.y - 16} width={Math.max(54, lab.length * 6.6 + 34)} height={15} rx={3} fill={col} />
            <text x={b.x + 5} y={b.y - 5} {...mono(8.5, C.bg)} fontWeight={700}>{lab} {conf.toFixed(2)}</text>
          </g>
        );
      })}
      <text x={12} y={VH - 10} {...mono(9, C.dim)} letterSpacing={2}>YOLOv8 · imgsz 640 · conf ≥ 0.5</text>
      <text x={VW - 12} y={VH - 10} textAnchor="end" {...mono(9, accent)} letterSpacing={2}>{fpsCount} FPS · 1.9 ms</text>
      <text x={12} y={16} {...mono(9, C.dim)} letterSpacing={2}>CAM 01 · SITE</text>
      <text x={VW - 12} y={16} textAnchor="end" {...mono(9, C.red)} letterSpacing={2} opacity={Math.floor(frame / 12) % 2 ? 0.3 : 1}>● REC</text>
    </g>
  );
};

/* ───────────── Grid6 (PV5 적재구역) ───────────── */
const Grid6: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const door = tween(frame, 4, 24, E.inOut);
  const cells = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6'];
  const cw = 118, ch = 86, gx = 10, gy = 10, x0 = 60, y0 = 70;
  const lit = frame > 52;
  const target = 2; // Z3
  const glow = 0.5 + 0.5 * Math.sin(frame / 5);
  return (
    <g>
      {/* 뒷문 */}
      <g transform={`translate(${x0 + (cw * 3 + gx * 2) / 2} ${y0 - 24}) rotate(${-70 * door})`}>
        <rect x={-(cw * 3 + gx * 2) / 2} y={-6} width={cw * 3 + gx * 2} height={6} fill={C.muted} opacity={0.8} />
      </g>
      <text x={x0} y={y0 - 34} {...mono(8.5, door > 0.9 ? accent : C.dim)} letterSpacing={2}>{door > 0.9 ? 'DOOR OPEN · P · 목적지 반경 ✓' : 'TAILGATE'}</text>
      {cells.map((c, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = x0 + col * (cw + gx), y = y0 + row * (ch + gy);
        const s = pop(frame, fps, 26 + i * 4);
        const isT = lit && i === target;
        return (
          <g key={c} opacity={s}>
            <rect x={x} y={y} width={cw} height={ch} rx={8} fill={isT ? `${accent}${Math.round(40 + glow * 40).toString(16).padStart(2, '0')}` : 'rgba(255,255,255,0.02)'} stroke={isT ? accent : C.line2} strokeWidth={isT ? 1.8 : 1} />
            {Array.from({ length: 10 }).map((_, k) => (
              <circle key={k} cx={x + 10 + k * ((cw - 20) / 9)} cy={y + 8} r={2} fill={isT ? accent : C.line2} opacity={isT ? 0.6 + 0.4 * glow : 0.6} />
            ))}
            <text x={x + 12} y={y + 32} {...mono(12, isT ? accent : C.muted)} fontWeight={700}>{c}</text>
            <text x={x + 12} y={y + 50} {...mono(7.5, C.dim)}>{row === 0 ? 'TOP' : 'MID'} · {col === 0 ? 'DOOR' : col === 1 ? 'MID' : 'FRONT'}</text>
            {isT && <text x={x + 12} y={y + 72} {...sans(13, C.text)}>상자 2개 · 꺼내세요</text>}
            {lit && !isT && <text x={x + 12} y={y + 72} {...mono(8, C.dim)}>off</text>}
          </g>
        );
      })}
      {/* OLED 표시창 */}
      <g opacity={tween(frame, 40, 10)}>
        <rect x={VW - 170} y={y0} width={150} height={72} rx={8} fill="#000" stroke={C.line2} />
        <text x={VW - 158} y={y0 + 18} {...mono(7.5, C.dim)} letterSpacing={2}>OLED 0.96"</text>
        <text x={VW - 158} y={y0 + 50} {...mono(24, lit ? accent : C.dim)} fontWeight={700}>{lit ? typed('Z3 x2', frame, 54, 0.6) : '----'}</text>
      </g>
      <g opacity={tween(frame, 60, 10)}>
        <text x={VW - 158} y={y0 + 100} {...mono(8.5, C.muted)}>BLE JSON · zone:3 · count:2</text>
        <text x={VW - 158} y={y0 + 114} {...mono(8.5, C.muted)}>LED 10/60 · 0.3 A · 60 %</text>
        <text x={VW - 158} y={y0 + 128} {...mono(8.5, C.dim)}>10 s 무신호 → 소등</text>
      </g>
      <text x={VW / 2} y={VH - 10} textAnchor="middle" {...mono(9, C.dim)} letterSpacing={2}>3단 × 2열 · 한 칸 약 752 × 783 mm · 빠른 배송은 문 쪽 1단</text>
    </g>
  );
};

/* ───────────── FSM ───────────── */
const Fsm: React.FC<{ states: string[]; caption?: string; accent: string }> = ({ states, caption, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = states.length;
  const w = Math.min(120, (VW - 40 - 30 * (n - 1)) / n), h = 50, gap = (VW - 40 - w * n) / (n - 1);
  const y = VH / 2 - h / 2 - 6;
  const cur = Math.min(n - 1, Math.floor(Math.max(0, frame - 20) / 18));
  return (
    <g>
      {states.map((s, i) => {
        const x = 20 + i * (w + gap);
        const p = pop(frame, fps, 6 + i * 7);
        const on = i === cur, done = i < cur;
        return (
          <g key={i} opacity={p}>
            <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={on ? `${accent}26` : 'rgba(255,255,255,0.02)'} stroke={on ? accent : done ? `${accent}88` : C.line2} strokeWidth={on ? 1.8 : 1} />
            <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" {...mono(10.5, on ? accent : done ? C.text : C.muted)} fontWeight={700}>{s}</text>
            {i < n - 1 && (
              <g>
                <line x1={x + w} y1={y + h / 2} x2={x + w + gap - 6} y2={y + h / 2} stroke={done ? accent : C.line2} strokeWidth={1.2} />
                <path d={`M${x + w + gap - 11} ${y + h / 2 - 4} L${x + w + gap - 6} ${y + h / 2} L${x + w + gap - 11} ${y + h / 2 + 4}`} fill="none" stroke={done ? accent : C.line2} strokeWidth={1.2} />
              </g>
            )}
            {on && <circle cx={x + w / 2} cy={y - 14} r={3} fill={accent} opacity={0.5 + 0.5 * Math.sin(frame / 3)} />}
          </g>
        );
      })}
      <text x={20} y={y - 30} {...mono(9, C.dim)} letterSpacing={2}>STATE  {String(cur + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}   ·   {states[cur]}</text>
      {caption && <text x={VW / 2} y={VH - 14} textAnchor="middle" {...mono(9, C.dim)} letterSpacing={1.5}>{caption}</text>}
    </g>
  );
};

/* ───────────── Checks (A/B 게이트) ───────────── */
const Checks: React.FC<{ items: [string, boolean][]; verdict: string; accent: string }> = ({ items, verdict, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rowH = 48, y0 = 26;
  const allAt = 14 + items.length * 13 + 10;
  const v = pop(frame, fps, allAt);
  return (
    <g>
      <text x={40} y={16} {...mono(9, C.dim)} letterSpacing={2}>ab_decide.py · 4 GATES</text>
      {items.map(([label, ok], i) => {
        const y = y0 + i * rowH;
        const s = pop(frame, fps, 14 + i * 13);
        const col = ok ? accent : C.coral;
        return (
          <g key={i} opacity={tween(frame, 4 + i * 6, 8)}>
            <rect x={40} y={y + 10} width={330} height={34} rx={8} fill="rgba(255,255,255,0.02)" stroke={C.line2} />
            <rect x={52} y={y + 19} width={16} height={16} rx={4} fill={s > 0.5 ? `${col}33` : 'none'} stroke={s > 0.5 ? col : C.line2} />
            {s > 0.5 && (ok
              ? <path d={`M55 ${y + 27} l4 4 l7 -8`} fill="none" stroke={col} strokeWidth={2} transform={`translate(${60} ${y + 27}) scale(${s}) translate(${-60} ${-(y + 27)})`} />
              : <path d={`M56 ${y + 23} l8 8 M64 ${y + 23} l-8 8`} fill="none" stroke={col} strokeWidth={2} transform={`translate(${60} ${y + 27}) scale(${s}) translate(${-60} ${-(y + 27)})`} />)}
            <text x={80} y={y + 32} {...sans(12.5, C.text, 600)}>{label}</text>
            <text x={356} y={y + 32} textAnchor="end" {...mono(9, s > 0.5 ? col : C.dim)} letterSpacing={1.5}>{s > 0.5 ? (ok ? 'PASS' : 'FAIL') : '...'}</text>
          </g>
        );
      })}
      <g opacity={v} transform={`translate(500 150) scale(${0.85 + 0.15 * v}) translate(-500 -150)`}>
        <rect x={400} y={100} width={200} height={100} rx={14} fill={`${C.amber}1a`} stroke={C.amber} strokeWidth={1.4} />
        <text x={500} y={128} textAnchor="middle" {...mono(8.5, C.amber)} letterSpacing={2}>VERDICT</text>
        <text x={500} y={158} textAnchor="middle" {...mono(20, C.amber)} fontWeight={700}>{verdict}</text>
        <text x={500} y={182} textAnchor="middle" {...sans(10.5, C.muted, 500)}>노출 4 · 클릭 2 → 승자 선언 보류</text>
      </g>
      <text x={40} y={VH - 14} {...mono(9, C.dim)} letterSpacing={1.5}>신뢰할 조건을 전부 통과할 때만 declare_winner</text>
    </g>
  );
};

/* ───────────── switch ───────────── */
export const Visual: React.FC<{ v: VisualSpec; accent: string }> = ({ v, accent }) => {
  switch (v.type) {
    case 'pipeline': return <Pipeline nodes={v.nodes} accent={accent} />;
    case 'scope': return <Scope accent={accent} />;
    case 'bars': return <Bars items={v.items} unit={v.unit} max={v.max} caption={v.caption} invert={v.invert} accent={accent} />;
    case 'mapdots': return <MapDots accent={accent} />;
    case 'blueprint': return <Blueprint accent={accent} />;
    case 'boxes': return <Boxes labels={v.labels} accent={accent} />;
    case 'grid6': return <Grid6 accent={accent} />;
    case 'fsm': return <Fsm states={v.states} caption={v.caption} accent={accent} />;
    case 'checks': return <Checks items={v.items} verdict={v.verdict} accent={accent} />;
    default: return null;
  }
};
