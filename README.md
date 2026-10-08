# 박세준 포트폴리오 (PoPol)

정적 사이트. 빌드 도구 없이 Vercel에 바로 배포됩니다.

- `index.html` — 메인 (소개 · 일하는 방식 · 케이스 스터디 목록 · 타임라인 · 수상 · 스킬 · 연락처)
- `projects/*.html` — 프로젝트별 케이스 스터디 (문제 → 판단 → 행동 → 결과 → 배운 점)
- `works.html` — 작품 갤러리 (카드뉴스·도면·웹툰·포스터, 라이트박스). 작품 데이터는 `site/data.mjs`의 `works`, 이미지는 `assets/img/works/`
- `assets/` — CSS · JS · 이미지
- `site/data.mjs` — **모든 텍스트 콘텐츠**. 여기만 고치면 됨
- `site/build.mjs` — HTML 생성기

## 내용 수정 방법
1. `site/data.mjs` 수정
2. `node site/build.mjs` 실행 → `index.html`, `projects/*.html` 재생성
3. commit & push → Vercel 자동 배포

## Vercel 배포
Import Git Repository → Framework Preset: **Other** → Build Command 비움 → Output Directory `.` (루트)
