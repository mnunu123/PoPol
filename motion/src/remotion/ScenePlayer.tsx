import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import type { SceneConfig } from '@/data/scenes';
import { FPS, chapterStarts, sceneDuration } from '@/data/scenes';
import { ProjectScene, H, W } from './ProjectScene';

interface Props {
  scene: SceneConfig;
  loop?: boolean;
  reel?: boolean;
  /** 화면에 보일 때 자동 재생 */
  playWhenVisible?: boolean;
  showBar?: boolean;
  className?: string;
}

const fmtT = (f: number) => `${String(Math.floor(f / FPS / 60)).padStart(2, '0')}:${String(Math.floor(f / FPS) % 60).padStart(2, '0')}`;

export const ScenePlayer: React.FC<Props> = ({ scene, loop = true, reel, playWhenVisible = true, showBar = true, className }) => {
  const ref = useRef<PlayerRef>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const total = useMemo(() => sceneDuration(scene), [scene]);
  const chapters = useMemo(() => chapterStarts(scene), [scene]);
  const inputProps = useMemo(() => ({ scene, reel }), [scene, reel]);
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    const onPlay = () => { setPlaying(true); setStarted(true); };
    const onPause = () => setPlaying(false);
    p.addEventListener('frameupdate', onFrame);
    p.addEventListener('play', onPlay);
    p.addEventListener('pause', onPause);
    return () => { p.removeEventListener('frameupdate', onFrame); p.removeEventListener('play', onPlay); p.removeEventListener('pause', onPause); };
  }, []);

  // 뷰포트 진입 시 재생 / 이탈 시 정지 — play() 가 조용히 무시되는 경우가 있어 상태를 폴링으로 맞춘다
  const wantPlay = useRef(false);
  useEffect(() => {
    if (!playWhenVisible || reduced || !wrap.current) return;
    const io = new IntersectionObserver((entries) => {
      const e = entries[0];
      wantPlay.current = e.isIntersecting && e.intersectionRatio >= 0.35;
      if (wantPlay.current) ref.current?.play(); else ref.current?.pause();
    }, { threshold: [0, 0.35, 0.6] });
    io.observe(wrap.current);
    const tick = setInterval(() => {
      const p = ref.current; if (!p) return;
      const isP = p.isPlaying();
      if (wantPlay.current && !isP && document.visibilityState === 'visible') p.play();
      setPlaying(p.isPlaying());
      if (p.isPlaying()) setStarted(true);
    }, 500);
    return () => { io.disconnect(); clearInterval(tick); };
  }, [playWhenVisible, reduced]);

  const seekFrac = useCallback((frac: number) => {
    const f = Math.max(0, Math.min(total - 1, Math.round(frac * total)));
    ref.current?.seekTo(f); setFrame(f);
  }, [total]);
  const onTrack = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    seekFrac((e.clientX - r.left) / r.width);
  };
  const toggle = () => { const p = ref.current; if (!p) return; p.isPlaying() ? p.pause() : p.play(); };
  const curIdx = chapters.findIndex((c, i) => frame >= c.from && (i === chapters.length - 1 || frame < chapters[i + 1].from));

  return (
    <div className={`player ${className ?? ''}`} ref={wrap}>
      <div className="stage" onClick={toggle} role="button" aria-label="재생/일시정지" tabIndex={-1}>
        <Player
          ref={ref}
          component={ProjectScene as unknown as React.FC<Record<string, unknown>>}
          inputProps={inputProps as unknown as Record<string, unknown>}
          durationInFrames={total}
          fps={FPS}
          compositionWidth={W}
          compositionHeight={H}
          style={{ width: '100%', height: '100%' }}
          controls={false}
          loop={loop}
          autoPlay={false}
          clickToPlay={false}
          spaceKeyToPlayOrPause={false}
          initiallyMuted
          acknowledgeRemotionLicense
        />
        {!started && !playing && (
          <div className="poster" onClick={(e) => { e.stopPropagation(); ref.current?.play(); }}>
            <div className="play">▶</div>
          </div>
        )}
      </div>
      {showBar && (
        <div className="pbar">
          <button onClick={toggle} aria-label={playing ? '일시정지' : '재생'}>{playing ? '❚❚' : '▶'}</button>
          <span className="time">{fmtT(frame)} / {fmtT(total)}</span>
          <div className="track" onClick={onTrack}>
            <div className="rail" />
            <div className="fill" style={{ width: `${(frame / total) * 100}%` }} />
            {chapters.map((c, i) => (
              <div key={c.id} className={`mark ${i === curIdx ? 'on' : ''}`} style={{ left: `${(c.from / total) * 100}%` }} onClick={(e) => { e.stopPropagation(); seekFrac(c.from / total); ref.current?.play(); }} title={c.label}>
                <i /><span>{c.label}</span>
              </div>
            ))}
          </div>
          <span className={`chip ${loop ? 'on' : ''}`}>LOOP</span>
          <span className="chip">{W}×{H} · {FPS}FPS</span>
          <button onClick={() => ref.current?.requestFullscreen()} aria-label="전체화면" title="전체화면">⤢</button>
        </div>
      )}
    </div>
  );
};

export default ScenePlayer;
