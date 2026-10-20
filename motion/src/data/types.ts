export type Color = 'coral' | 'violet' | 'blue' | 'mint' | 'amber';
export type Kpi = [string, string, Color];

export type ExtraBlock =
  | { type: 'steps'; items: [string, string][] }
  | { type: 'ba'; b: string[]; a: string[] }
  | { type: 'gallery'; items: ([string, string] | [string, string, string])[] }
  | { type: 'callout'; b: string; t: string; cls: string }
  | { type: 'kpis'; items: Kpi[] };

export interface Section {
  id: string;
  label: string;
  color: Color;
  h2: string;
  html: string;
  extra: ExtraBlock[];
}

export interface Project {
  slug: string;
  tag: string;
  color: Color;
  featured?: boolean;
  title: string;
  card: string;
  thumb: string;
  headline: string;
  lead: string;
  period: string;
  role: string;
  team: string;
  stack: string[];
  kpis: Kpi[];
  subnav?: [string, string][];
  sections: Section[];
  links: [string, string][];
}

export interface Work {
  id: string;
  t: string;
  c: string;
  award: string;
  color: Color;
  date: string;
  d: string;
  tools: string[];
  imgs: string[];
  ratio: string;
  cols?: number;
  light?: boolean;
}

export interface Profile {
  name: string;
  en: string;
  tagline: string;
  sub: string;
  school: string;
  kpis: Kpi[];
  links: { github: string; blog: string; old: string; email: string; phone: string };
}

export interface Principle { n: string; c: Color; t: string; q: string; d: string }
export type TimelineItem = [string, string, string, Color];
export type Award = [string, string, string];
export type SkillRow = [string, Color, string[]];
