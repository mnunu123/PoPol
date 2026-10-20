import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { workImg, works } from '@/data';
import { Lightbox } from '@/components/Chrome';
import { Html, Pill, Reveal } from '@/components/ui';

const TYPE: Record<string, string> = {
  pandaepe: '카드뉴스', drainx: '도면', pv5: '도면', hangeul: '카드 디자인', oneisone: '카드 디자인', moving: '카드 디자인',
  cm: '웹툰', twelve: '웹툰', voice: '웹툰', gangnam: '웹툰', onesec: '웹툰', peace: '웹툰', co2: '웹툰',
  fishnet: '포스터', koroad: '포스터', emf: '포스터', toli: '캐릭터', video: '영상',
};
const FILTERS = ['전체', '카드뉴스', '도면', '카드 디자인', '웹툰', '포스터', '캐릭터', '영상'];

export const WorksPage: React.FC = () => {
  const [f, setF] = useState('전체');
  const [lb, setLb] = useState<{ id: string; i: number } | null>(null);
  const list = useMemo(() => works.filter((w) => f === '전체' || TYPE[w.id] === f), [f]);
  useEffect(() => { document.title = 'Works — 박세준 작품 갤러리'; return () => { document.title = '박세준 — Portfolio 2026 · Build & Verify'; }; }, []);
  const lbItems = lb ? works.find((w) => w.id === lb.id)!.imgs.map((im, i) => ({ src: workImg(im), cap: `${works.find((w) => w.id === lb.id)!.t} · ${i + 1}` })) : [];
  const grand = works.filter((w) => w.award === '대상').length;
  return (
    <>
      <header className="cs-head">
        <div className="wrap">
          <Link className="back" to="/">← HOME</Link>
          <Reveal>
            <div className="kicker" style={{ marginTop: 18 }}>04 / WORKS · {works.length} PIECES</div>
            <h1 className="h2" style={{ fontSize: 'clamp(30px, 4vw, 48px)' }}>만든 것들을 <em>그대로</em> 볼 수 있게</h1>
            <p className="lead">공모전에 제출한 작품 {works.length}건 · 대상 {grand}건. 콘셉트·대사·레이아웃·규격·금지 사항은 직접 정하고, 이미지 생성은 AI, CAD 도면은 계산값과 대조해 그렸습니다. 이미지를 누르면 크게 볼 수 있습니다.</p>
            <div className="filters">
              {FILTERS.map((x) => <button key={x} className={f === x ? 'on' : ''} onClick={() => setF(x)}>{x}{x !== '전체' && ` ${works.filter((w) => TYPE[w.id] === x).length}`}</button>)}
            </div>
          </Reveal>
        </div>
      </header>
      <div className="wrap">
        {list.map((w) => (
          <section className="work" id={w.id} key={w.id}>
            <Reveal>
              <div className="work-head">
                <div><div className="kicker plain" style={{ marginBottom: 8 }}>{w.c}</div><h2>{w.t}</h2></div>
                <div className="work-meta"><Pill c={w.award === '대상' ? 'amber' : w.color} solid={w.award === '대상'}>{w.award}</Pill><span>{w.date}</span></div>
              </div>
              <Html as="p" className="work-d" html={w.d.replace(/href="projects\//g, 'href="/project/').replace(/\.html"/g, '"')} />
              <div style={{ margin: '12px 0 4px' }}>{w.tools.map((t) => <Pill key={t} c={w.color}>{t}</Pill>)}</div>
              <div className={`work-grid ${w.light ? 'light' : ''}`} style={{ '--cols': w.cols || (['9/16', '2/3', '4/5', '3/4', '1/1'].includes(w.ratio) ? 5 : 3), '--ratio': w.ratio } as React.CSSProperties}>
                {w.imgs.map((im, i) => (
                  <a className="wi" key={im} href={workImg(im)} onClick={(e) => { e.preventDefault(); setLb({ id: w.id, i }); }}>
                    <img src={workImg(im)} alt={`${w.t} ${i + 1}`} loading="lazy" />
                  </a>
                ))}
              </div>
            </Reveal>
          </section>
        ))}
      </div>
      <Lightbox items={lbItems} index={lb ? lb.i : null} onClose={() => setLb(null)} onIndex={(i) => lb && setLb({ ...lb, i })} />
    </>
  );
};
export default WorksPage;
