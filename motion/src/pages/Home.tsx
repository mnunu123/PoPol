import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { TRACKS, awardSummary, awards, certs, education, gradeColor, principles, profile, projectBySlug, skills, timeline, workImg, works } from '@/data';
import { FACTS } from '@/data/facts';
import { SHOWREEL } from '@/data/scenes';
import { ScenePlayer } from '@/remotion/ScenePlayer';
import { Rain } from '@/components/Rain';
import { ProjectCard } from '@/components/Blocks';
import { Html, Pill, Reveal, SectionHead, Stat } from '@/components/ui';

const H1_LINES: React.ReactNode[] = ['하드웨어부터', '서비스까지,', '전체 구조를 이해하고', <><em>직접 구현</em>합니다</>];

const Hero: React.FC<{ onConsole: () => void }> = ({ onConsole }) => {
  const reduced = useReducedMotion();
  return (
    <section className="hero" id="boot">
      <Rain />
      <div className="wrap">
        <div>
          <div className="hero-eyebrow"><span className="dot" />SYSTEM READY · 01 / BOOT · {profile.en.toUpperCase()}</div>
          <h1 className="h1">
            {H1_LINES.map((l, i) => (
              <span className="line" key={i}>
                <motion.span initial={reduced ? false : { y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}>{l}</motion.span>
              </span>
            ))}
          </h1>
          <motion.div initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
            <Html as="p" className="hero-sub" html={profile.sub} />
            <div className="hero-cta">
              <a href="#build" className="btn-solid">프로젝트 14개 보기 ↓</a>
              <button className="btn-ghost" onClick={onConsole}><span className="mono">&gt;_</span> 콘솔 열기</button>
              <Link to="/resume" className="btn-ghost">이력서</Link>
            </div>
            <div className="hero-stats">
              {profile.kpis.map(([v, l], i) => <Stat key={i} v={v} l={l} c="mint" />)}
            </div>
          </motion.div>
        </div>
        <motion.div className="hero-player" initial={reduced ? false : { opacity: 0, y: 26, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <span className="corner bl rec">SHOWREEL · REMOTION PLAYER</span>
          <span className="corner br">4 TRACKS · 20s · LOOP</span>
          <ScenePlayer scene={SHOWREEL} reel loop showBar={false} />
        </motion.div>
      </div>
    </section>
  );
};

const Ticker: React.FC = () => {
  const items = timeline.map(([d, t]) => ({ d, t }));
  const row = [...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {row.map((it, i) => <span key={i}><b>[{it.d}]</b>{it.t}</span>)}
      </div>
    </div>
  );
};

const FEATURED = new Set(['threebot', 'drainx', 'agents', 'kamp']);

const Build: React.FC = () => {
  let no = 0;
  return (
    <section className="section" id="build">
      <div className="wrap">
        <SectionHead idx="02" name="BUILD" title={<>문제를 <em>어떻게</em> 풀었는지, 프로젝트 14개</>} lead={<>정량적 결과만 나열하지 않고, 어떤 문제를 왜 그렇게 판단해서 무엇을 바꿨는지를 씁니다. 각 프로젝트 페이지 상단에는 <b>Remotion으로 코드 작성한 모션 씬</b>이 문제 → 구조 → 검증 순서로 요약합니다.</>} />
        {TRACKS.map((tr) => (
          <Reveal key={tr.id}>
            <div className="track-head"><span className="no">{tr.no}</span><h3>{tr.ko}</h3><span className="en">{tr.en}</span><span className="rule" /></div>
            <div className="pgrid">
              {tr.slugs.map((slug) => { const p = projectBySlug(slug); if (!p) return null; no += 1; return <ProjectCard key={slug} p={p} no={no} featured={FEATURED.has(slug)} />; })}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

const Verify: React.FC = () => (
  <section className="section" id="verify">
    <div className="wrap">
      <SectionHead idx="03" name="VERIFY" title={<>숫자는 <em>출처와 조건</em>을 붙여서 적습니다</>} lead={<>어떤 데이터로, 어떤 기준으로 잰 숫자인지가 숫자 자체만큼 중요합니다. 대표 수치 10개의 출처와 측정 조건입니다.</>} />
      <Reveal>
        <div className="vtable">
          <div className="vrow head"><span>VALUE</span><span>WHAT</span><span>SOURCE</span><span>CONDITION</span></div>
          {FACTS.map((f, i) => (
            <Link to={`/project/${f.slug}`} className="vrow" key={i}>
              <span className="v" style={{ color: `var(--${f.c})` }}>{f.v}</span>
              <span className="l">{f.l}</span>
              <span className="s">{f.src}</span>
              <span className="c">{f.cond}</span>
            </Link>
          ))}
        </div>
      </Reveal>
      <div className="principles">
        {principles.map((p, i) => (
          <Reveal key={p.n} delay={i * 0.08}>
            <div className="principle">
              <div className="n">{p.n} · HOW I WORK</div>
              <h3>{p.t}</h3>
              <div className="q">{p.q}</div>
              <p>{p.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const WorksTeaser: React.FC = () => {
  const pick = ['pandaepe', 'drainx', 'moving', 'onesec', 'fishnet', 'video'].map((id) => works.find((w) => w.id === id)!).filter(Boolean);
  return (
    <section className="section" id="works">
      <div className="wrap">
        <SectionHead idx="04" name="WORKS" title={<>만든 것들을 <em>그대로</em> 볼 수 있게</>} lead={<>공모전에 제출한 작품 {works.length}건 — 카드뉴스, CAD 도면, 카드 디자인, 웹툰, 포스터, 영상. 콘셉트·대사·규격은 직접, 이미지 생성은 AI.</>} right={<Link to="/works" className="btn-ghost">전체 {works.length}건 →</Link>} />
        <Reveal>
          <div className="wstrip">
            {pick.map((w) => (
              <Link key={w.id} to={`/works#${w.id}`}>
                <img src={workImg(w.imgs[0])} alt={w.t} loading="lazy" />
                <div className="cap"><b>{w.award}</b>{w.t}</div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const Timeline: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [on, setOn] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let i = 0; const id = setInterval(() => { i += 1; setOn(i); if (i >= timeline.length) clearInterval(id); }, 140);
    return () => clearInterval(id);
  }, [inView]);
  return (
    <div className="timeline" ref={ref}>
      <div className="draw" style={{ height: `${(on / timeline.length) * 100}%`, transition: 'height .3s' }} />
      {timeline.map(([d, t, s], i) => (
        <div className={`tl-item ${i < on ? 'on' : ''}`} key={i} style={{ opacity: i < on ? 1 : 0.35, transition: 'opacity .3s' }}>
          <div className="d">{d}</div><div className="t">{t}</div><div className="s">{s}</div>
        </div>
      ))}
    </div>
  );
};

const Log: React.FC = () => {
  const s = awardSummary();
  return (
    <section className="section" id="log">
      <div className="wrap">
        <SectionHead idx="05" name="LOG" title={<>2024.07 → 2026.10, <em>기록</em>으로 남긴 것</>} lead={<>첫 비전 프로젝트에서 공동창업, 펌웨어 재설계, AI 에이전트, 제조 데이터, CAD 설계까지.</>} />
        <div className="log">
          <Reveal><Timeline /></Reveal>
          <Reveal delay={0.1}>
            <div className="award-sum">
              <Stat v={`${s.total}건`} l="공모전 수상" c="amber" />
              {s.counts.map(([g, n]) => <Stat key={g} v={`${n}`} l={g} c={gradeColor[g]} />)}
            </div>
            <div className="awards">
              {awards.map(([d, g, t], i) => (
                <div className={`award ${g === '대상' ? 'top' : ''}`} key={i}>
                  <span className={`g g-${gradeColor[g]}`}>{g}</span><span className="d">{d}</span><span>{t}</span>
                </div>
              ))}
            </div>
            <p className="dim" style={{ fontSize: 12.5, marginTop: 12 }}>+ 딥테크 예비창업패키지 우수기업 선정 → 청년창업사관학교 서류 면제 · 창의회로설계 Cadence Award</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const Skills: React.FC = () => (
  <section className="section" id="skills">
    <div className="wrap">
      <SectionHead idx="06" name="STACK" title={<>실제 프로젝트에서 <em>사용한 것만</em></>} />
      <Reveal>
        {skills.map(([n, c, tags]) => (
          <div className="skillrow" key={n}><div className="n" style={{ color: `var(--${c})` }}>{n}</div><div>{tags.map((t) => <Pill key={t}>{t}</Pill>)}</div></div>
        ))}
        <div className="skillrow"><div className="n">자격 · 교육</div><div><div className="certs">{certs.map((c) => <Pill key={c} c="mint">{c}</Pill>)}</div><div className="certs" style={{ marginTop: 8 }}>{education.map((e) => <Pill key={e}>{e}</Pill>)}</div></div></div>
      </Reveal>
    </div>
  </section>
);

const Contact: React.FC = () => (
  <section className="section" id="contact">
    <div className="wrap">
      <SectionHead idx="07" name="CONTACT" title={<>구조를 그리고, 끝까지 작동하게 만들고,<br />검증 기준을 먼저 세우는 엔지니어</>} lead="쓰리봇에서 전장·펌웨어·비전·백엔드·사업화를 한 번에 겪었고, 그 방식을 AI 자동화와 데이터 분석, 설계로 넓혀 왔습니다." />
      <Reveal>
        <div className="contact-grid">
          <div className="c"><div className="k">GITHUB</div><div className="v"><a href={profile.links.github} target="_blank" rel="noopener">github.com/mnunu123</a></div></div>
          <div className="c"><div className="k">BLOG</div><div className="v"><a href={profile.links.blog} target="_blank" rel="noopener">blog-1vld.vercel.app</a></div></div>
          <div className="c"><div className="k">EMAIL</div><div className="v"><a href={`mailto:${profile.links.email}`}>{profile.links.email}</a></div></div>
          <div className="c"><div className="k">PHONE</div><div className="v"><a href={`tel:${profile.links.phone.replace(/-/g, '')}`}>{profile.links.phone}</a></div></div>
        </div>
      </Reveal>
    </div>
  </section>
);

export const Home: React.FC<{ onConsole: () => void }> = ({ onConsole }) => (
  <>
    <Hero onConsole={onConsole} />
    <Ticker />
    <Build />
    <Verify />
    <WorksTeaser />
    <Log />
    <Skills />
    <Contact />
  </>
);
export default Home;
