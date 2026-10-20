# 박세준 포트폴리오 v3 — Build & Verify (Vite + React + Remotion Player)

저장소 루트로 배포되는 모션 그래픽 포트폴리오 사이트. 콘텐츠 소스는 `site/data.mjs`.

- 라이브: https://my-project-one-sigma-74.vercel.app
- 소스: `motion/` · 빌드 결과: `motion/dist` → `scripts/deploy.mjs` 가 루트 `index.html` + `assets/*.js|css` 로 복사 (저장소에 커밋 — Vercel 설정 변경 없이 서비스)

## 구조

```
motion/
  src/
    data/
      index.ts      site/data.mjs 를 타입 붙여 재수출 + 트랙(4개) 정의 + 썸네일 보정
      scenes.ts     프로젝트 14개 Remotion 씬 정의 (챕터 · 비주얼 · 수치) + 홈 쇼릴
      facts.ts      VERIFY 표 (수치 · 출처 · 조건)
    remotion/
      theme.ts      색 · 폰트 · tween/pop/scramble 헬퍼
      visuals.tsx   비주얼 모듈 9종 (pipeline · scope · bars · mapdots · blueprint · boxes · grid6 · fsm · checks) — 640×300 viewBox
      ProjectScene.tsx  챕터형 씬 (1280×720 · 30fps) — 타이틀 키네틱, 라인 칩, 비주얼, 스탯 스크램블
      BootSequence.tsx  부팅(POST) 시퀀스 160프레임
      ScenePlayer.tsx   @remotion/player 래퍼 — 커스텀 스크러버 · 챕터 마커 · 뷰포트 자동재생
    components/
      Chrome.tsx    Nav · Footer · 플로팅 버튼 · BootOverlay · Lightbox
      Console.tsx   시리얼 모니터 콘솔 (help · ls · open · stat · awards · relay · resume · boot …)
      Blocks.tsx    케이스 스터디 블록 렌더러 (steps/ba/gallery/callout/kpis) · ProjectCard
      Rain.tsx      히어로 캔버스 (빗줄기 + 그레이팅 글린트)
      ui.tsx        Reveal · CountUp · Stat · SectionHead · Html
    pages/          Home · Project · Works · Resume · NotFound
    styles/global.css
```

## 개발 / 빌드

```bash
cd motion
npm install
npm run dev        # http://localhost:5173/  (이미지는 /assets/img 를 쓰므로 루트도 같이 서빙해야 보임)
npm run build      # dist 빌드 + 루트로 복사 → git add -A && commit → Vercel 자동 배포
```

로컬에서 이미지까지 보려면 저장소 루트에서 SPA fallback 되는 정적 서버를 띄우고 `/` 로 접속.

## 콘텐츠 수정

- 프로젝트 본문 · 수상 · 스킬 · 작품: `site/data.mjs` → `npm run build`
- 모션 씬 문구 · 챕터 · 수치: `motion/src/data/scenes.ts`
- VERIFY 표: `motion/src/data/facts.ts`
- 콘솔 명령 추가: `motion/src/components/Console.tsx` 의 `run()` switch

## 수치 원칙

씬 · 표에 들어간 숫자는 전부 `site/data.mjs` 기준. 측정 조건은 FACTS 의 `cond` 에 적는다. 미검증·미구현·결과 대기 같은 표현은 사이트에 쓰지 않는다 (2026.10 결정).

## 라이선스 메모

Remotion 은 개인 · 3인 이하 조직은 무료. 회사 포트폴리오로 쓰거나 4인 이상 팀이 쓰면 회사 라이선스 필요.
