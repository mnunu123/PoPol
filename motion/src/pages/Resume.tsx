import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { awards, awardSummary, certs, education, profile, projects, skills, timeline } from '@/data';
import { Pill } from '@/components/ui';

/** 인쇄 가능한 한 장 이력서 — 데이터는 사이트와 같은 소스 */
export const ResumePage: React.FC = () => {
  useEffect(() => { document.title = '이력서 — 박세준'; return () => { document.title = '박세준 — Portfolio 2026 · Build & Verify'; }; }, []);
  const s = awardSummary();
  const featured = ['threebot', 'agents', 'kamp', 'helmet', 'drainx', 'radar', 'inmoov', 'robotarm'].map((x) => projects.find((p) => p.slug === x)!).filter(Boolean);
  return (
    <div className="resume">
      <div className="tools">
        <Link to="/" className="btn-ghost">← 홈</Link>
        <button className="btn-solid" onClick={() => window.print()}>인쇄 · PDF 저장</button>
      </div>
      <div className="top">
        <div>
          <div className="en">RESUME · 2026.10</div>
          <h1 style={{ marginTop: 6 }}>{profile.name} <span className="dim" style={{ fontSize: 16, fontWeight: 500 }}>{profile.en}</span></h1>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>{profile.school}</div>
        </div>
        <div className="contact">
          <div>{profile.links.email}</div>
          <div>{profile.links.phone}</div>
          <div>{profile.links.github.replace('https://', '')}</div>
          <div>{profile.links.blog.replace('https://', '')}</div>
        </div>
      </div>
      <p className="sum"><b>하드웨어부터 서비스까지 전체 구조를 이해하고 직접 구현하는 엔지니어.</b> 빗물받이 청소 로봇 스타트업(딥테크 예비창업패키지, 우수기업)에서 Co-founder/PM으로 STM32 펌웨어·전장, 비전 파이프라인, FastAPI 백엔드·관제 플랫폼, 사업화 문서를 한 번에 맡았고, 이후 AI 에이전트 파이프라인, 제조 데이터 분석(KAMP), CAD 설계(ZYXCAD)로 넓혔습니다. 숫자는 재현 조건과 출처를 붙여 적습니다.</p>

      <h2>Projects</h2>
      {featured.map((p) => (
        <div className="row" key={p.slug}>
          <div className="d">{p.period}</div>
          <div>
            <div className="t">{p.title}</div>
            <div className="s">{p.card}</div>
            <div className="r">{p.role} · {p.team} · {p.kpis.slice(0, 3).map(([v, l]) => `${v} ${l}`).join(' · ')}</div>
          </div>
        </div>
      ))}

      <h2>Timeline</h2>
      {timeline.map(([d, t, sub], i) => (
        <div className="row" key={i}><div className="d">{d}</div><div><div className="t">{t}</div><div className="s">{sub}</div></div></div>
      ))}

      <h2>Awards · {s.total}건 ({s.counts.map(([g, n]) => `${g} ${n}`).join(' · ')})</h2>
      {awards.map(([d, g, t], i) => (
        <div className="row" key={i}><div className="d">{d}</div><div><span className="t">{g}</span> <span className="s">{t}</span></div></div>
      ))}
      <div className="row"><div className="d">2026.02</div><div><span className="t">우수기업</span> <span className="s">딥테크 예비창업패키지 최종 선정 → 청년창업사관학교 서류 면제</span></div></div>

      <h2>Skills</h2>
      {skills.map(([n, , tags]) => (
        <div className="row" key={n}><div className="d">{n}</div><div>{tags.map((t) => <Pill key={t}>{t}</Pill>)}</div></div>
      ))}

      <h2>Certificates · Education</h2>
      <div className="row"><div className="d">자격</div><div className="s">{certs.join(' · ')}</div></div>
      {education.map((e, i) => <div className="row" key={i}><div className="d">교육 · 활동</div><div className="s">{e}</div></div>)}

      <div className="dim mono" style={{ fontSize: 11, marginTop: 28, letterSpacing: '.1em' }}>PORTFOLIO · my-project-one-sigma-74.vercel.app/v3 · WORKS 18 · 2026.10</div>
    </div>
  );
};
export default ResumePage;
