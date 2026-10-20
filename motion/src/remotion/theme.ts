import { Easing, interpolate, random, spring } from 'remotion';
import type { Color } from '@/data/types';

export const C = {
  bg: '#0D1013', bg2: '#13171B', card: '#171C21', line: '#2A3138', line2: '#3A4149',
  text: '#FFFFFF', muted: '#AEB4BD', dim: '#6F767E',
  mint: '#2EE6C5', coral: '#FF7A6B', violet: '#8B7CF6', blue: '#5B8CFF', amber: '#FFB454', red: '#FF4D4D',
};
export const FONT = "'Pretendard Variable', Pretendard, 'Noto Sans KR', system-ui, sans-serif";
export const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
export const accentOf = (c?: Color | string) => (C as Record<string, string>)[c ?? 'mint'] ?? C.mint;

export const E = {
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  expo: Easing.out(Easing.exp),
  back: Easing.out(Easing.back(1.4)),
};
const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0→1 보간 (프레임 from 에서 dur 동안) */
export const tween = (frame: number, from: number, dur: number, easing: (t: number) => number = E.out) =>
  interpolate(frame, [from, from + dur], [0, 1], { ...CLAMP, easing });

/** 스프링 팝 (delay 이전엔 0) */
export const pop = (frame: number, fps: number, delay: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  frame < delay ? 0 : spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 140, mass: 0.7, ...cfg } });

/** 마지막 len 프레임 동안 1→0 */
export const fadeOut = (frame: number, total: number, len = 10) => interpolate(frame, [total - len, total], [1, 0], CLAMP);
export const fadeIn = (frame: number, len = 8) => interpolate(frame, [0, len], [0, 1], CLAMP);

/** [[강조]] 마크업 분해 */
export const segments = (title: string): { text: string; hl: boolean }[] => {
  const out: { text: string; hl: boolean }[] = [];
  const re = /\[\[(.+?)\]\]/g;
  let last = 0; let m: RegExpExecArray | null;
  while ((m = re.exec(title))) {
    if (m.index > last) out.push({ text: title.slice(last, m.index), hl: false });
    out.push({ text: m[1], hl: true });
    last = m.index + m[0].length;
  }
  if (last < title.length) out.push({ text: title.slice(last), hl: false });
  return out;
};

const CHARSET = '0123456789ABCDEF#%&*+-=/<>ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ';
/** 디코드(스크램블) 텍스트 효과 — start 부터 dur 동안 왼쪽부터 확정 */
export const scramble = (text: string, frame: number, start: number, dur: number, seed = 's') => {
  if (frame >= start + dur) return text;
  if (frame < start) return '';
  const chars = Array.from(text);
  const t = (frame - start) / dur;
  return chars
    .map((ch, i) => {
      if (ch === ' ') return ' ';
      const resolveAt = (i / Math.max(1, chars.length - 1)) * 0.85;
      if (t >= resolveAt) return ch;
      const r = random(`${seed}-${i}-${Math.floor(frame / 2)}`);
      return CHARSET[Math.floor(r * CHARSET.length)];
    })
    .join('');
};

/** 타자 효과 — 글자 수 */
export const typed = (text: string, frame: number, start: number, cps = 1.2) => {
  const n = Math.max(0, Math.floor((frame - start) * cps));
  return Array.from(text).slice(0, n).join('');
};

export const fmt = (n: number, decimals = 0) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
