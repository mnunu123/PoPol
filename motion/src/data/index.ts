import * as raw from '../../../site/data.mjs';
import type { Award, Color, Principle, Profile, Project, SkillRow, TimelineItem, Work } from './types';

// site/data.mjs 는 타입 없는 JS — 여기서 한 번만 캐스팅
export const profile = raw.profile as unknown as Profile;
export const principles = raw.principles as unknown as Principle[];
export const timeline = raw.timeline as unknown as TimelineItem[];
export const awards = raw.awards as unknown as Award[];
export const gradeColor = raw.gradeColor as unknown as Record<string, Color>;
export const certs = raw.certs as unknown as string[];
export const education = raw.education as unknown as string[];
export const skills = raw.skills as unknown as SkillRow[];
export const projects = raw.projects as unknown as Project[];
export const works = raw.works as unknown as Work[];

/** 이미지 경로: 기존 사이트의 /assets/img 를 그대로 참조 (같은 도메인 루트) */
export const img = (p: string) => (p.startsWith('http') ? p : `/assets/img/${p.replace(/^\.\.\//, '')}`);
export const workImg = (p: string) => (p.startsWith('../') ? `/assets/img/${p.slice(3)}` : `/assets/img/works/${p}`);

export const ACCENT: Record<Color, string> = {
  coral: '#FF7A6B',
  violet: '#8B7CF6',
  blue: '#5B8CFF',
  mint: '#2EE6C5',
  amber: '#FFB454',
};

/** 수상 요약: 목록에서 계산 */
export const awardSummary = () => {
  const grades = ['대상', '최우수', '우수', '은상', '장려'];
  const counts = grades.map((g) => [g, awards.filter((a) => a[1] === g).length] as const).filter(([, n]) => n > 0);
  return { total: awards.length, counts };
};

/** 4개 트랙으로 프로젝트 묶기 */
export const TRACKS: { id: string; no: string; en: string; ko: string; color: Color; slugs: string[] }[] = [
  { id: 'threebot', no: '01', en: 'Three-Bot', ko: '쓰리봇 · 로봇 · 관제', color: 'coral', slugs: ['threebot', 'drainx'] },
  { id: 'vision', no: '02', en: 'Vision & Robotics', ko: '비전 · 로보틱스', color: 'violet', slugs: ['helmet', 'robotarm', 'inmoov', 'moodlight'] },
  { id: 'ai', no: '03', en: 'AI & Data', ko: 'AI 자동화 · 데이터', color: 'blue', slugs: ['agents', 'kamp', 'radar', 'software'] },
  { id: 'design', no: '04', en: 'Design & Craft', ko: '설계 · 기획 · AI 도구', color: 'amber', slugs: ['pv5', 'docs', 'video', 'design'] },
];

/** 카드 썸네일 보정 (원본 썸네일이 카드에 안 맞는 경우) */
export const THUMB: Record<string, string> = { kamp: 'kamp_arch.png', helmet: 'helmet_collage.png' };
export const LIGHT_THUMBS = new Set(['kamp_arch.png', 'kamp_curve.png', 'helmet_arch.png', 'pv5_plan.png', 'pv5_circuit.png', 'yc_roadmap.png', 'works/drainx_c_s03_main.jpg', 'arch_wide1.png']);
export const thumbOf = (p: Project) => THUMB[p.slug] ?? p.thumb;

export const projectBySlug = (slug: string): Project | undefined => projects.find((p) => p.slug === slug);
export const projectIndex = (slug: string) => projects.findIndex((p) => p.slug === slug);
export const trackOf = (slug: string) => TRACKS.find((t) => t.slugs.includes(slug));

/** 텍스트에서 HTML 태그 제거 (콘솔·메타 용) */
export const strip = (s: string) => s.replace(/<[^>]+>/g, '');

/** 숫자 문자열 → count-up 용 파싱: "6,100만 원" → { num: 6100, pre:'', post:'만 원' } */
export const parseNum = (s: string): { num: number; pre: string; post: string; decimals: number } | null => {
  const m = s.match(/^([^0-9\-−]*)([\-−]?[0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/);
  if (!m) return null;
  const raw = m[2].replace(/,/g, '').replace('−', '-');
  const num = Number(raw);
  if (Number.isNaN(num)) return null;
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
  return { num, pre: m[1], post: m[3], decimals };
};
