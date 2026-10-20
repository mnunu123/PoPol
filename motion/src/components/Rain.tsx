import React, { useEffect, useRef } from 'react';

/** 히어로 배경 — 빗물받이 테마: 떨어지는 빗줄기 + 바닥 그레이팅에서 튀는 민트 글린트 */
export const Rain: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    type Drop = { x: number; y: number; l: number; v: number; a: number; mint: boolean };
    type Spark = { x: number; y: number; vx: number; vy: number; life: number };
    let drops: Drop[] = []; const sparks: Spark[] = [];
    const resize = () => {
      const r = cv.parentElement!.getBoundingClientRect();
      w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 9000);
      drops = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, l: 10 + Math.random() * 18, v: 3 + Math.random() * 5, a: 0.08 + Math.random() * 0.22, mint: Math.random() < 0.18 }));
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv.parentElement!);
    let visible = true;
    const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; }); io.observe(cv);
    const gratingY = () => h * 0.86;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // 그레이팅 (바닥 격자)
      const gy = gratingY();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
      for (let x = (w % 22) / 2; x < w; x += 22) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, h); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(46,230,197,0.12)'; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      // 빗줄기
      for (const d of drops) {
        ctx.strokeStyle = d.mint ? `rgba(46,230,197,${d.a + 0.1})` : `rgba(200,210,220,${d.a})`;
        ctx.lineWidth = d.mint ? 1.2 : 1;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 0.6, d.y + d.l); ctx.stroke();
        if (!reduced) {
          d.y += d.v; d.x -= 0.12;
          if (d.y > gy) {
            if (Math.random() < 0.35) for (let k = 0; k < 2; k++) sparks.push({ x: d.x, y: gy, vx: (Math.random() - 0.5) * 1.6, vy: -(0.6 + Math.random() * 1.4), life: 1 });
            d.y = -d.l - Math.random() * 80; d.x = Math.random() * w;
          }
        }
      }
      // 튀는 물방울
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        ctx.fillStyle = `rgba(46,230,197,${0.6 * s.life})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2); ctx.fill();
        s.x += s.vx; s.y += s.vy; s.vy += 0.09; s.life -= 0.045;
        if (s.life <= 0) sparks.splice(i, 1);
      }
      if (!reduced && visible) raf = requestAnimationFrame(draw); else if (reduced) { /* 정지 화면 한 번 */ } else raf = requestAnimationFrame(() => setTimeout(draw, 250));
    };
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);
  return <div className="hero-bg" aria-hidden="true"><canvas ref={ref} /></div>;
};
export default Rain;
