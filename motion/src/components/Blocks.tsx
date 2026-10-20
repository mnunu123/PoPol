import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LIGHT_THUMBS, img, thumbOf, trackOf } from '@/data';
import type { ExtraBlock, Project } from '@/data/types';
import { Lightbox } from './Chrome';
import { Html, Pill, Stat } from './ui';

/* ── 케이스 스터디 블록 렌더러 (site/data.mjs 의 extra 타입) ── */
export const Extra: React.FC<{ x: ExtraBlock; onZoom?: (src: string, cap: string) => void }> = ({ x, onZoom }) => {
  switch (x.type) {
    case 'steps':
      return (
        <div className="steps">
          {x.items.map(([t, d], i) => (
            <div className="step" key={i}><div className="n">{String(i + 1).padStart(2, '0')}</div><div><div className="t">{t}</div><div className="d">{d}</div></div></div>
          ))}
        </div>
      );
    case 'ba':
      return (
        <div className="ba">
          <div className="b"><div className="tag c-coral">BEFORE</div><ul className="list">{x.b.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
          <div className="a"><div className="tag c-mint">AFTER</div><ul className="list">{x.a.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
        </div>
      );
    case 'gallery':
      return (
        <div className="gallery">
          {x.items.map(([src, cap, light], i) => (
            <figure key={i} className={light ? 'light' : ''}>
              <img src={img(src)} alt={cap} loading="lazy" onClick={() => onZoom?.(img(src), cap)} />
              <figcaption>{cap}</figcaption>
            </figure>
          ))}
        </div>
      );
    case 'callout':
      return <div className={`callout ${x.cls}`}><b>{x.b}</b> — {x.t}</div>;
    case 'kpis':
      return <div className="cs-kpis" style={{ marginTop: 22 }}>{x.items.map(([v, l, c], i) => <Stat key={i} v={v} l={l} c={c} />)}</div>;
    default:
      return null;
  }
};

export const Sections: React.FC<{ project: Project }> = ({ project }) => {
  const [zoom, setZoom] = useState<{ src: string; cap: string } | null>(null);
  return (
    <>
      {project.sections.map((s) => (
        <section className="cs-section" id={s.id} key={s.id}>
          <div className="wrap">
            <div className="label" style={{ color: `var(--${s.color})` }}><i />{s.label}</div>
            <h2>{s.h2}</h2>
            <Html className="prose" html={s.html} />
            {(s.extra || []).map((x, i) => <Extra key={i} x={x} onZoom={(src, cap) => setZoom({ src, cap })} />)}
          </div>
        </section>
      ))}
      <Lightbox items={zoom ? [zoom] : []} index={zoom ? 0 : null} onClose={() => setZoom(null)} onIndex={() => {}} />
    </>
  );
};

/* ── 프로젝트 카드 ── */
export const ProjectCard: React.FC<{ p: Project; no: number; featured?: boolean }> = ({ p, no, featured }) => {
  const track = trackOf(p.slug);
  const thumb = thumbOf(p);
  const light = LIGHT_THUMBS.has(thumb);
  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <Link to={`/project/${p.slug}`} className={`pcard ${featured ? 'featured' : ''}`} onMouseMove={onMove}>
      <div>
        <div className="idx"><span>{String(no).padStart(2, '0')} · {track?.en.toUpperCase()}</span><span className="tag">{p.tag}</span></div>
        <h3>{p.title}</h3>
        <p>{p.card}</p>
        <div className="kp">
          {p.kpis.slice(0, featured ? 4 : 2).map(([v, l, c], i) => <Stat key={i} v={v} l={l} c={c} count={false} />)}
        </div>
        <div style={{ marginTop: 14 }}>{p.stack.slice(0, featured ? 4 : 2).map((s) => <Pill key={s}>{s}</Pill>)}</div>
      </div>
      <div className={`thumb ${light ? 'light' : ''}`}><img src={img(thumb)} alt="" loading="lazy" /></div>
      <span className="open">OPEN →</span>
    </Link>
  );
};
