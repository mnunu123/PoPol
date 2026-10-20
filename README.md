# 박세준 포트폴리오 (PoPol)

Vite + React + Remotion Player 로 만든 모션 그래픽 포트폴리오. 빌드 결과(`index.html`, `assets/*.js|css`)를 저장소에 커밋해서 Vercel(Framework **Other**, Output `.`)이 그대로 서비스한다.

- 라이브: https://my-project-one-sigma-74.vercel.app
- 소스: `motion/` (구조·수정 방법은 `motion/README.md`)
- 콘텐츠: `site/data.mjs` — 프로젝트 본문 · 수상 · 스킬 · 작품 전부 여기
- 모션 씬 문구·수치: `motion/src/data/scenes.ts` · VERIFY 표: `motion/src/data/facts.ts`
- 이미지: `assets/img/` (작품은 `assets/img/works/`)

## 수정 → 배포
```bash
cd motion && npm install && npm run build   # dist 빌드 후 루트 index.html + assets/ 로 복사
git add -A && git commit -m "..." && git push   # Vercel 자동 배포
```

`vercel.json` 이 모든 경로를 `index.html` 로 넘기는 SPA 설정이고, 예전 주소(`/projects/<slug>`, `/v3/...`)는 새 주소로 리다이렉트된다.
