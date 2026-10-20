import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { awards, awardSummary, certs, profile, projects, skills, works } from '@/data';
import { FACTS } from '@/data/facts';

type Kind = 'in' | 'ok' | 'err' | 'sys' | 'hl';
interface Line { k: Kind; t: React.ReactNode; id: number }

const COMMANDS: Record<string, string> = {
  help: '명령 목록', ls: '프로젝트 목록 (ls projects | ls works)', open: 'open <slug> — 프로젝트 열기', whoami: '한 줄 소개',
  stat: '대표 수치 + 출처', awards: '수상 13건', skills: '실제로 쓴 스택', certs: '자격증', works: '작품 갤러리', contact: '연락처',
  resume: '이력서 페이지', boot: '부팅 시퀀스 다시 보기', uptime: '가동 시간', relay: '릴레이 노이즈 0건 이야기', ping: 'pong', clear: '화면 지우기', exit: '콘솔 닫기',
};

let seq = 0;
const mk = (k: Kind, t: React.ReactNode): Line => ({ k, t, id: seq++ });

export const Console: React.FC<{ open: boolean; onClose: () => void; onBoot: () => void }> = ({ open, onClose, onBoot }) => {
  const nav = useNavigate();
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const booted = useRef(false);

  const banner = useMemo(() => [
    mk('sys', 'Serial Monitor — 115200 8N1 — connected to SEJUN-PARK v2026.10'),
    mk('sys', `${projects.length} projects · ${works.length} works · ${awards.length} awards loaded`),
    mk('ok', <>ready. <b>help</b> 를 입력하거나 아래 버튼을 눌러 보세요.</>),
  ], []);

  useEffect(() => {
    if (open) {
      if (!booted.current) { setLines(banner); booted.current = true; }
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, banner]);
  useEffect(() => { bodyRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' }); }, [lines]);

  const push = (...ls: Line[]) => setLines((p) => [...p, ...ls]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    push(mk('in', cmd));
    setHist((h) => [cmd, ...h].slice(0, 50)); setHi(-1);
    const [c, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(' ');
    const out: Line[] = [];
    switch (c.toLowerCase()) {
      case 'help':
        out.push(mk('hl', 'COMMANDS'));
        Object.entries(COMMANDS).forEach(([k, v]) => out.push(mk('sys', `  ${k.padEnd(9)} ${v}`)));
        out.push(mk('sys', '  Tab 자동완성 · ↑↓ 히스토리 · ` 또는 Esc 로 닫기'));
        break;
      case 'ls': case 'dir':
        if (arg === 'works') { out.push(mk('hl', `WORKS (${works.length})`)); works.forEach((w) => out.push(mk('sys', `  ${w.award.padEnd(6)} ${w.t} — ${w.c}`))); out.push(mk('ok', <>전체 보기: <Link to="/works">/works</Link></>)); }
        else { out.push(mk('hl', `PROJECTS (${projects.length})`)); projects.forEach((p, i) => out.push(mk('sys', `  ${String(i + 1).padStart(2, '0')}  ${p.slug.padEnd(10)} ${p.title}`))); out.push(mk('ok', 'open <slug> 로 열기 · 예) open threebot')); }
        break;
      case 'open': case 'cd': {
        const p = projects.find((x) => x.slug === arg || x.title.includes(arg));
        if (!p) { out.push(mk('err', `no such project: ${arg || '(empty)'} — ls 로 목록 확인`)); break; }
        out.push(mk('ok', `opening ${p.slug} … ${p.title}`));
        setTimeout(() => { nav(`/project/${p.slug}`); onClose(); }, 350);
        break;
      }
      case 'whoami': case 'cat':
        out.push(mk('hl', `${profile.name} · ${profile.en}`));
        out.push(mk('sys', '  경북대학교 전자공학부 · 지식재산융합전공 복수전공 · 2027.02 졸업예정'));
        out.push(mk('sys', '  Co-founder/PM 노바로보틱스(쓰리봇) · STM32 펌웨어 · ROS2 · 비전 · FastAPI · AI 에이전트 · CAD'));
        out.push(mk('sys', '  구조를 그리고, 끝까지 작동하게 만들고, 검증 기준을 먼저 세웁니다.'));
        break;
      case 'stat': case 'stats':
        out.push(mk('hl', 'KEY NUMBERS · 출처와 조건'));
        FACTS.forEach((f) => out.push(mk('sys', `  ${f.v.padEnd(16)} ${f.l}  [${f.src} · ${f.cond}]`)));
        break;
      case 'awards': {
        const s = awardSummary();
        out.push(mk('hl', `AWARDS ${s.total}건 · ${s.counts.map(([g, n]) => `${g} ${n}`).join(' · ')}`));
        awards.forEach(([d, g, t]) => out.push(mk('sys', `  ${d.padEnd(8)} ${g.padEnd(4)} ${t}`)));
        break;
      }
      case 'skills':
        skills.forEach(([n, , tags]) => out.push(mk('sys', `  ${n}: ${tags.join(' · ')}`)));
        break;
      case 'certs':
        certs.forEach((c) => out.push(mk('sys', `  ${c}`)));
        break;
      case 'works':
        out.push(mk('ok', `${works.length}건 · 대상 ${works.filter((w) => w.award === '대상').length} · 결과 대기 ${works.filter((w) => w.award === '결과 대기').length}`));
        setTimeout(() => { nav('/works'); onClose(); }, 350);
        break;
      case 'contact':
        out.push(mk('sys', <>  GitHub  <a href={profile.links.github} target="_blank" rel="noopener">{profile.links.github}</a></>));
        out.push(mk('sys', <>  Blog    <a href={profile.links.blog} target="_blank" rel="noopener">{profile.links.blog}</a></>));
        out.push(mk('sys', <>  Email   <a href={`mailto:${profile.links.email}`}>{profile.links.email}</a></>));
        out.push(mk('sys', `  Phone   ${profile.links.phone}`));
        break;
      case 'resume': case 'cv':
        out.push(mk('ok', 'opening /resume …'));
        setTimeout(() => { nav('/resume'); onClose(); }, 350);
        break;
      case 'boot': case 'reboot':
        out.push(mk('ok', 'rebooting …'));
        setTimeout(() => { onClose(); onBoot(); }, 300);
        break;
      case 'uptime': {
        const d = Math.floor((Date.now() - new Date('2024-07-01').getTime()) / 86400000);
        out.push(mk('ok', `up ${d} days since 2024.07 (첫 비전 프로젝트) · load avg: 쓰리봇 0.50, 공모전 0.35, 취준 0.15`));
        break;
      }
      case 'relay':
        out.push(mk('hl', 'RELAY NOISE · 100% → 0%'));
        out.push(mk('sys', '  증상  OPEN 중 바닥 버튼이 CLOSE 로 오인식 → 즉시 실행 (매번)'));
        out.push(mk('sys', '  원인  역기전력 서지 + 버튼선·전원선 근접 + 긴 배선 인덕턴스'));
        out.push(mk('sys', '  HW    페라이트 코어 · 트위스트 1~2회/cm · 0.1µF + 100µF 바이패스 · 분리 배선'));
        out.push(mk('sys', '  SW    디바운스 20ms 재확인 · OPEN 중 CLOSE 입력 800ms 마스킹'));
        out.push(mk('ok', '  2026.01.14 · 100회 반복 테스트 · 오동작 0건'));
        break;
      case 'ping':
        out.push(mk('ok', 'pong — 0.23 ms (할증레이더 계산 엔진 기준)'));
        break;
      case 'sudo':
        out.push(mk('err', `${profile.name} is not in the sudoers file. This incident will be reported.`));
        break;
      case 'echo':
        out.push(mk('ok', arg));
        break;
      case 'clear': case 'cls':
        setLines([]); return;
      case 'exit': case 'quit': case 'close':
        onClose(); return;
      case 'rm':
        out.push(mk('err', 'read-only file system. 포트폴리오는 지울 수 없습니다.'));
        break;
      case 'git':
        out.push(mk('ok', <>origin → <a href={profile.links.github} target="_blank" rel="noopener">github.com/mnunu123</a> · 이 사이트 소스: PoPol/motion</>));
        break;
      default: {
        const p = projects.find((x) => x.slug === c.toLowerCase());
        if (p) { out.push(mk('ok', `opening ${p.slug} …`)); setTimeout(() => { nav(`/project/${p.slug}`); onClose(); }, 350); break; }
        out.push(mk('err', `command not found: ${c} — help 로 명령 목록 확인`));
      }
    }
    push(...out);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { run(input); setInput(''); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const [c, ...rest] = input.split(' ');
      if (rest.length === 0) { const m = Object.keys(COMMANDS).find((k) => k.startsWith(c)); if (m) setInput(m + (m === 'open' ? ' ' : '')); }
      else if (c === 'open') { const m = projects.find((p) => p.slug.startsWith(rest.join(' '))); if (m) setInput(`open ${m.slug}`); }
    }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.min(hist.length - 1, hi + 1); setHi(n); setInput(hist[n] ?? ''); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const n = Math.max(-1, hi - 1); setHi(n); setInput(n < 0 ? '' : hist[n]); }
    else if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="con-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="con" role="dialog" aria-label="시리얼 콘솔" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
            <div className="con-head">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="dots"><i style={{ background: '#FF5F57' }} /><i style={{ background: '#FEBC2E' }} /><i style={{ background: '#28C840' }} /></div>
                Serial Monitor · <span className="st">&nbsp;115200 · connected</span>
              </div>
              <button onClick={onClose}>close  esc</button>
            </div>
            <div className="con-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
              {lines.map((l) => <div key={l.id} className={`con-line ${l.k}`}>{l.t}</div>)}
            </div>
            <div className="con-sug">
              {['help', 'ls', 'open threebot', 'stat', 'awards', 'relay', 'resume', 'boot'].map((s) => <button key={s} onClick={() => { run(s); inputRef.current?.focus(); }}>{s}</button>)}
            </div>
            <div className="con-input">
              <span className="prompt">&gt;</span>
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} spellCheck={false} autoComplete="off" aria-label="명령 입력" placeholder="help" />
              <span className="hint">ACK/NACK 프로토콜 · UART1</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default Console;
