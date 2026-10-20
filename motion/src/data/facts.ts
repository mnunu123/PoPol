import type { Color } from './types';

/** VERIFY 섹션 — 대표 수치와 출처·조건. 포트폴리오 PPT 제작노트의 출처 표와 같은 기준. */
export interface Fact { v: string; l: string; src: string; cond: string; c: Color; slug: string }

export const FACTS: Fact[] = [
  { v: '360h → 18h', l: '빗물받이 라벨링 소요 시간', src: '쓰리봇 발표자료 2026.06', cond: '3,000장 기준 추정 · 모델 선라벨 + 사람 검수', c: 'coral', slug: 'threebot' },
  { v: '87.3%', l: 'mAP@50 · 구멍 인스턴스 분할', src: '최종 학습 로그 · 10,000+장', cond: '중간 시점(1,347장) 61.8%에서 개선', c: 'violet', slug: 'threebot' },
  { v: '0 / 100', l: '릴레이 노이즈 오동작 · 반복 테스트', src: '개발기록 2026.01.14', cond: 'HW 대책 4 + SW 대책 2 모두 적용 후', c: 'mint', slug: 'threebot' },
  { v: '400만 건', l: '지도 포인트 · 뷰포트 조회로 해결', src: '상세 기록 2026.08', cond: '더미 데이터 400만 건 생성해 테스트', c: 'blue', slug: 'threebot' },
  { v: '6,100만 원', l: '정부 R&D 과제 · 87.14% 집행', src: '예창패 최종보고서', cond: '팀 5명 · 본인 Co-founder/PM', c: 'coral', slug: 'threebot' },
  { v: 'P 0.932 · R 0.912', l: '안전보호구 검출 Precision · Recall', src: '결과보고서', cond: '검증셋 · 2,548장 · RTX A6000', c: 'mint', slug: 'helmet' },
  { v: '−32%', l: 'KAMP 검사 작업량 (1,000 → 682)', src: '결과보고서 표 13·14·23', cond: '날짜순 walk-forward · 불량 25/25 포착', c: 'blue', slug: 'kamp' },
  { v: '95.2% / 98.2%', l: '할증레이더 추출 · 자동 승인 정확도', src: '기획서 · 정답셋 45건', cond: 'test 294 레코드 · 선사 7곳', c: 'mint', slug: 'radar' },
  { v: '13건', l: '공모전 수상 (대상 2 · 최우수 4)', src: '수상경력 · 상장', cond: '2025.09 ~ 2026.10', c: 'amber', slug: 'design' },
  { v: '100%', l: '손동작 분류 정확도', src: 'train.ipynb', cond: '자체 검증셋 · 일반화 미검증', c: 'violet', slug: 'moodlight' },
];
