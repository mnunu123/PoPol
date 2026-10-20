import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BootOverlay, Fabs, Footer, Nav } from '@/components/Chrome';
import { Console } from '@/components/Console';
import { ScrollProgress } from '@/components/ui';
import { Home } from '@/pages/Home';

const ProjectPage = lazy(() => import('@/pages/Project'));
const WorksPage = lazy(() => import('@/pages/Works'));
const ResumePage = lazy(() => import('@/pages/Resume'));
const NotFound = lazy(() => import('@/pages/NotFound'));

/* 라우트 변경 시 스크롤 처리: 해시가 있으면 해당 요소로, 없으면 맨 위로 */
const ScrollManager: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      let tries = 0;
      const go = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else if (tries++ < 20) setTimeout(go, 80);
      };
      const t = setTimeout(go, 60);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
};

const Shell: React.FC = () => {
  const loc = useLocation();
  const [con, setCon] = useState(false);
  const [boot, setBoot] = useState(() => {
    try {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return !reduced && loc.pathname === '/' && !sessionStorage.getItem('booted');
    } catch { return false; }
  });
  const doneBoot = useCallback(() => { setBoot(false); try { sessionStorage.setItem('booted', '1'); } catch { /* noop */ } }, []);
  const reboot = useCallback(() => { window.scrollTo({ top: 0 }); setBoot(true); }, []);

  // ` 키로 콘솔 토글 (입력 중이 아닐 때)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === '`' && tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); setCon((c) => !c); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <ScrollProgress />
      <Nav onConsole={() => setCon(true)} />
      <ScrollManager />
      <main>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            <Suspense fallback={<div className="wrap mono dim" style={{ padding: '80px 28px', letterSpacing: '.2em', fontSize: 12 }}>LOADING …</div>}>
              <Routes location={loc}>
                <Route path="/" element={<Home onConsole={() => setCon(true)} />} />
                <Route path="/project/:slug" element={<ProjectPage />} />
                <Route path="/works" element={<WorksPage />} />
                <Route path="/resume" element={<ResumePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <Fabs onConsole={() => setCon(true)} />
      <Console open={con} onClose={() => setCon(false)} onBoot={reboot} />
      <BootOverlay show={boot} onDone={doneBoot} />
    </>
  );
};

export const App: React.FC = () => (
  <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
    <Shell />
  </BrowserRouter>
);
export default App;
