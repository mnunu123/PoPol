import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Player } from '@remotion/player';
import { AnimatePresence, motion } from 'framer-motion';
import { profile } from '@/data';
import { BootSequence, BOOT_FRAMES } from '@/remotion/BootSequence';
import { FPS } from '@/data/scenes';

const NAV = [
  { i: '01', t: 'BOOT', to: '/#boot' }, { i: '02', t: 'BUILD', to: '/#build' }, { i: '03', t: 'VERIFY', to: '/#verify' },
  { i: '04', t: 'WORKS', to: '/works' }, { i: '05', t: 'LOG', to: '/#log' },
];

/* ── 상단 내비 ── */
export const Nav: React.FC<{ onConsole: () => void }> = ({ onConsole }) => {
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [hide, setHide] = useState(false);
  const [active, setActive] = useState('');
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHide(y > 120 && y > last && !open);
      last = y;
      if (loc.pathname === '/') {
        const ids = ['boot', 'build', 'verify', 'log'];
        let cur = '';
        for (const id of ids) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= 120) cur = id; }
        setActive(cur);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [loc.pathname, open]);
  const isActive = (n: typeof NAV[number]) => (n.to === '/works' ? loc.pathname.startsWith('/works') : loc.pathname === '/' && active === n.t.toLowerCase());
  return (
    <nav className={`nav ${hide ? 'hide' : ''}`}>
      <div className="wrap">
        <Link to="/" className="brand" aria-label="홈"><b>SEJUN PARK</b><span className="full">PORTFOLIO 2026 · BUILD & VERIFY</span><span className="short">PORTFOLIO 2026</span></Link>
        <ul className={`nav-links ${open ? 'open' : ''}`} id="menu">
          {NAV.map((n) => (
            <li key={n.t}><Link to={n.to} className={isActive(n) ? 'active' : ''}><i>{n.i}</i>{n.t}</Link></li>
          ))}
        </ul>
        <div className="nav-right">
          <button className="btn-con" onClick={onConsole} aria-label="콘솔 열기">CONSOLE <kbd>`</kbd></button>
          <Link to="/resume" className="btn-solid">이력서</Link>
          <button className="btn-con menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="menu">MENU</button>
        </div>
      </div>
    </nav>
  );
};

/* ── 푸터 ── */
export const Footer: React.FC = () => (
  <footer className="footer">
    <div className="wrap">
      <span>© 2026 {profile.name} · Vite + React + Remotion Player · 모션 그래픽은 전부 코드로 그렸습니다</span>
      <span><a href={profile.links.github} target="_blank" rel="noopener">github</a> · <a href={profile.links.blog} target="_blank" rel="noopener">blog</a> · <a href={profile.links.old} target="_blank" rel="noopener">v1 site</a></span>
    </div>
  </footer>
);

/* ── 플로팅 버튼 ── */
export const Fabs: React.FC<{ onConsole: () => void }> = ({ onConsole }) => (
  <>
    <div className="fab left"><button onClick={onConsole}><span className="mono">&gt;_</span> CONSOLE</button></div>
    <div className="fab right"><Link to="/resume">이력서 바로 보기</Link></div>
  </>
);

/* ── 부팅 오버레이 ── */
export const BootOverlay: React.FC<{ show: boolean; onDone: () => void }> = ({ show, onDone }) => {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDone, (BOOT_FRAMES / FPS) * 1000 + 80);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') onDone(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [show, onDone]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="boot" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
          <div className="frame">
            <Player component={BootSequence} durationInFrames={BOOT_FRAMES} fps={FPS} compositionWidth={1280} compositionHeight={720} style={{ width: '100%', height: '100%' }} autoPlay loop={false} controls={false} clickToPlay={false} initiallyMuted acknowledgeRemotionLicense />
          </div>
          <button className="skip" onClick={onDone}>SKIP  ⏎</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── 라이트박스 ── */
export const Lightbox: React.FC<{ items: { src: string; cap: string }[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }> = ({ items, index, onClose, onIndex }) => {
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % items.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [index, items.length, onClose, onIndex]);
  return (
    <AnimatePresence>
      {index !== null && items[index] && (
        <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.img key={items[index].src} src={items[index].src} alt={items[index].cap} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()} />
          <div className="cap">{items[index].cap} · {index + 1} / {items.length}</div>
          <button className="x" onClick={onClose} aria-label="닫기">×</button>
          {items.length > 1 && <button className="p" onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + items.length) % items.length); }} aria-label="이전">‹</button>}
          {items.length > 1 && <button className="n" onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % items.length); }} aria-label="다음">›</button>}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
