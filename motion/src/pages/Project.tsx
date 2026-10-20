import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectBySlug, projectIndex, projects, trackOf } from '@/data';
import { sceneOf } from '@/data/scenes';
import { ScenePlayer } from '@/remotion/ScenePlayer';
import { Sections } from '@/components/Blocks';
import { Html, KpiGrid, Reveal } from '@/components/ui';
import { NotFound } from './NotFound';

export const ProjectPage: React.FC = () => {
  const { slug = '' } = useParams();
  const p = projectBySlug(slug);
  useEffect(() => { if (p) document.title = `${p.title} — 박세준`; return () => { document.title = '박세준 — Portfolio 2026 · Build & Verify'; }; }, [p]);
  if (!p) return <NotFound />;
  const i = projectIndex(slug);
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const scene = sceneOf(slug);
  const track = trackOf(slug);
  return (
    <>
      <header className="cs-head">
        <div className="wrap">
          <Link className="back" to="/#build">← ALL PROJECTS</Link>
          <Reveal>
            <div className="tblock">
              <div className="main">
                <div className="kicker plain" style={{ color: `var(--${p.color})` }}>{String(i + 1).padStart(2, '0')} · {track?.en.toUpperCase()} · {p.tag}</div>
                <Html as="h1" html={p.headline} />
                <Html as="p" className="lead" html={p.lead} />
              </div>
              <div>
                <div className="meta">
                  <div className="m"><div className="k">PERIOD</div><div className="v">{p.period}</div></div>
                  <div className="m"><div className="k">TEAM</div><div className="v">{p.team}</div></div>
                  <div className="m wide"><div className="k">ROLE</div><div className="v">{p.role}</div></div>
                  <div className="m wide"><div className="k">STACK</div><div className="v" style={{ fontSize: 12.5, color: 'var(--muted)' }}>{p.stack.join(' · ')}</div></div>
                </div>
                <div className="sheet"><span>SHEET {String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span><span>REV 2026.10</span><span>DRAWN · 박세준</span></div>
              </div>
            </div>
          </Reveal>
          {scene && (
            <Reveal delay={0.1}>
              <div style={{ marginTop: 22 }}>
                <div className="kicker" style={{ marginBottom: 10 }}>MOTION SUMMARY · {scene.chapters.length} CHAPTERS · {Math.round(scene.chapters.reduce((a, c) => a + c.dur, 0) / 30)}s</div>
                <ScenePlayer scene={scene} loop />
              </div>
            </Reveal>
          )}
          <Reveal delay={0.15}><KpiGrid items={p.kpis} /></Reveal>
          {p.subnav && (
            <div className="subnav">{p.subnav.map(([id, t]) => <a key={id} href={`#${id}`}>{t}</a>)}</div>
          )}
        </div>
      </header>
      <Sections project={p} />
      {p.links?.length > 0 && (
        <section className="cs-section"><div className="wrap">
          <div className="label c-blue"><i />Links</div>
          <div className="links">{p.links.map(([t, u]) => <a key={u} className="btn-ghost" href={u} target="_blank" rel="noopener">{t} ↗</a>)}</div>
        </div></section>
      )}
      <div className="wrap"><div className="nextprev">
        <Link to={`/project/${prev.slug}`}><div className="k">← PREV</div><div className="t">{prev.title}</div></Link>
        <Link to={`/project/${next.slug}`} style={{ textAlign: 'right' }}><div className="k">NEXT →</div><div className="t">{next.title}</div></Link>
      </div></div>
    </>
  );
};
export default ProjectPage;
