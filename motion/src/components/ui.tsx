import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { parseNum } from '@/data';
import type { Color, Kpi } from '@/data/types';

/* ── 스크롤 진행 바 ── */
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  return <motion.div className="scroll-progress" style={{ scaleX: x }} />;
};

/* ── 뷰포트 진입 시 등장 ── */
export const Reveal: React.FC<{ children: React.ReactNode; delay?: number; y?: number; className?: string; style?: React.CSSProperties; once?: boolean }> = ({ children, delay = 0, y = 22, className, style, once = true }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-10% 0px -8% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ── 카운트업 숫자 ── */
export const CountUp: React.FC<{ value: string; duration?: number; className?: string }> = ({ value, duration = 1.4, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5% 0px' });
  const reduced = useReducedMotion();
  const parsed = parseNum(value);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || !parsed || reduced) return;
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / (duration * 1000));
      const e = 1 - Math.pow(1 - p, 4);
      setN(parsed.num * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!parsed || reduced) return <span ref={ref} className={className}>{value}</span>;
  const shown = inView ? n : 0;
  return <span ref={ref} className={className}>{parsed.pre}{shown.toLocaleString('en-US', { minimumFractionDigits: parsed.decimals, maximumFractionDigits: parsed.decimals })}{parsed.post}</span>;
};

/* ── 스탯 (큰 숫자 + 단위 + 라벨) ── */
export const Stat: React.FC<{ v: string; l: string; c?: Color; count?: boolean; className?: string }> = ({ v, l, c = 'mint', count = true, className }) => (
  <div className={`stat ${c} ${className ?? ''}`}>
    <div className="v">{count ? <CountUp value={v} /> : v}</div>
    <div className="l">{l}</div>
  </div>
);

export const KpiGrid: React.FC<{ items: Kpi[]; className?: string }> = ({ items, className }) => (
  <div className={className ?? 'cs-kpis'}>
    {items.map(([v, l, c], i) => <Stat key={i} v={v} l={l} c={c} />)}
  </div>
);

export const Pill: React.FC<{ c?: Color | ''; solid?: boolean; children: React.ReactNode }> = ({ c = '', solid, children }) => (
  <span className={`pill ${c} ${solid ? 'solid' : ''}`}>{children}</span>
);

/* ── 섹션 헤더 ── */
export const SectionHead: React.FC<{ idx: string; name: string; title: React.ReactNode; lead?: React.ReactNode; right?: React.ReactNode }> = ({ idx, name, title, lead, right }) => (
  <Reveal>
    <div className="sec-head">
      <div>
        <div className="kicker">{idx} / {name}</div>
        <h2 className="h2">{title}</h2>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {right}
    </div>
  </Reveal>
);

/* ── HTML 문자열 렌더 (자체 콘텐츠) ── */
export const Html: React.FC<{ html: string; as?: keyof React.JSX.IntrinsicElements; className?: string }> = ({ html, as = 'div', className }) =>
  React.createElement(as, { className, dangerouslySetInnerHTML: { __html: html } });
