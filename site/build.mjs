// 정적 사이트 생성기: node site/build.mjs → index.html, projects/*.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { profile, principles, timeline, awards, gradeColor, certs, education, skills, projects } from './data.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const esc = (s) => String(s).replace(/&(?![a-z#0-9]+;)/g, '&amp;');
const pills = (arr, c, cls = '') => arr.map((t) => `<span class="pill ${c} ${cls}">${t}</span>`).join('');

const head = (title, desc, base) => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${base}assets/img/robot_frame.jpg">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%230b0f1e'/><text x='50' y='68' font-size='52' text-anchor='middle' fill='%23ff7a6b' font-family='sans-serif' font-weight='800'>S</text></svg>">
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="${base}assets/css/style.css">
</head>
<body>`;

const nav = (base) => `<nav class="nav"><div class="wrap">
<a class="brand" href="${base}index.html">박세준 <span>Portfolio 2026</span></a>
<button class="menu-btn" onclick="document.getElementById('menu').classList.toggle('open')">메뉴</button>
<ul id="menu">
<li><a href="${base}index.html#projects">Projects</a></li>
<li><a href="${base}index.html#how">How I Work</a></li>
<li><a href="${base}index.html#timeline">Timeline</a></li>
<li><a href="${base}index.html#awards">Awards</a></li>
<li><a href="${base}index.html#skills">Skills</a></li>
<li><a href="${profile.links.blog}" target="_blank" rel="noopener">Blog ↗</a></li>
<li><a href="${profile.links.github}" target="_blank" rel="noopener">GitHub ↗</a></li>
</ul></div></nav>`;

const footer = (base) => `<footer><div class="wrap">
<div>© 2026 박세준 · 사실과 수치는 개발일지·보고서·GitHub 기준으로 적었습니다.</div>
<div><a href="${profile.links.old}" target="_blank" rel="noopener">이전 포트폴리오 ↗</a> &nbsp;·&nbsp; <a href="${profile.links.blog}" target="_blank" rel="noopener">블로그 ↗</a> &nbsp;·&nbsp; <a href="${profile.links.github}" target="_blank" rel="noopener">GitHub ↗</a></div>
</div></footer>
<script src="${base}assets/js/main.js"></script>
</body></html>`;

const kpiGrid = (items, cls = 'cs-kpis') => `<div class="${cls}">${items.map(([v, l, c]) => `<div class="kpi"><div class="v c-${c}">${v}</div><div class="l">${l}</div></div>`).join('')}</div>`;

const extraBlock = (x, base) => {
  if (x.type === 'steps') return `<div class="steps">${x.items.map(([t, d], i) => `<div class="step"><div class="n">${String(i + 1).padStart(2, '0')}</div><div><div class="t">${t}</div><div class="d">${d}</div></div></div>`).join('')}</div>`;
  if (x.type === 'ba') return `<div class="ba"><div class="b"><div class="tag c-coral">BEFORE</div><ul class="list">${x.b.map((t) => `<li>${t}</li>`).join('')}</ul></div><div class="a"><div class="tag c-mint">AFTER</div><ul class="list">${x.a.map((t) => `<li>${t}</li>`).join('')}</ul></div></div>`;
  if (x.type === 'gallery') return `<div class="gallery">${x.items.map(([img, cap, light]) => `<figure class="${light ? 'light' : ''}"><img src="${base}assets/img/${img}" alt="${cap}" loading="lazy"><figcaption>${cap}</figcaption></figure>`).join('')}</div>`;
  if (x.type === 'callout') return `<div class="callout ${x.cls}"><b>${x.b}</b> — ${x.t}</div>`;
  if (x.type === 'kpis') return `<div class="cs-kpis" style="margin-top:22px">${x.items.map(([v, l, c]) => `<div class="kpi"><div class="v c-${c}">${v}</div><div class="l">${l}</div></div>`).join('')}</div>`;
  return '';
};

// ---------- index ----------
function buildIndex() {
  const base = './';
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const pcard = (pr) => `<a class="pcard ${pr.featured ? 'featured' : ''} reveal" href="projects/${pr.slug}.html">
<div class="thumb"><img src="assets/img/${pr.thumb}" alt="${pr.title}" loading="lazy"></div>
<div class="body"><div class="tag c-${pr.color}">${pr.tag}</div><h3>${pr.title}</h3><p>${pr.card}</p>
<div class="meta"><span>${pr.period}</span><span>자세히 →</span></div></div></a>`;

  const html = `${head('박세준 — Portfolio 2026', '하드웨어부터 서비스까지, 전체 구조를 이해하고 직접 구현하는 엔지니어의 문제 해결 기록', base)}
${nav(base)}
<header class="hero"><div class="wrap">
<div>
<div class="kicker">Portfolio 2026 · Embedded · Robotics · AI Automation</div>
<h1>${profile.tagline}</h1>
<p class="sub">${profile.sub}</p>
<div style="margin-top:6px">${pills(['STM32 · FSM 펌웨어', 'ROS2 · Jetson · ZED', 'YOLOv8 · SAM', 'FastAPI · PostgreSQL · Next.js', 'Claude · Gemini 멀티에이전트', '정보처리기사'], 'violet')}</div>
<div style="margin-top:22px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn primary" href="#projects">프로젝트 보기</a><a class="btn" href="${profile.links.github}" target="_blank" rel="noopener">GitHub ↗</a><a class="btn" href="${profile.links.blog}" target="_blank" rel="noopener">기술 블로그 ↗</a></div>
<div class="kpis">${profile.kpis.map(([v, l, c]) => `<div><div class="v c-${c}">${v}</div><div class="l">${l}</div></div>`).join('')}</div>
</div>
<div class="photo"><img src="assets/img/robot_frame2.jpg" alt="쓰리봇 시제품 전장"><div class="cap">쓰리봇 시제품 · STM32 전장 + 4축 스테퍼 + 윈치. 사진·수치는 모두 실제 개발 기록에서 가져왔습니다.</div></div>
</div></header>

<section class="section" id="about"><div class="wrap">
<div class="grid g2" style="align-items:start">
<div>
<div class="kicker">About</div>
<h2 class="h2">문제를 보면 <span class="c-violet">구조부터 그리고</span>,<br>끝까지 <span class="c-coral">작동하는 흐름</span>으로 바꿉니다</h2>
<p class="lead">${profile.name} · ${profile.school}</p>
<p class="lead" style="margin-top:14px">반복적이고 위험한 작업을 자동화해 안전하고 효율적인 현장을 만드는 엔지니어. 아이디어보다 구현하고 검증하는 사람. 노바로보틱스 Co-founder·PM으로 딥테크 예비창업패키지 과제를 수행했고, 그 과정에서 전장·펌웨어·비전·백엔드·사업화를 한 번에 겪었습니다.</p>
<p class="lead" style="margin-top:14px">이 사이트는 <a href="${profile.links.old}" target="_blank" rel="noopener" style="color:var(--blue)">이전 포트폴리오</a>와 달리 결과 수치보다 <b style="color:var(--text)">어떤 문제를, 왜 그렇게 판단해서, 무엇을 바꿨고, 무엇을 배웠는지</b>를 케이스 스터디로 적었습니다. 검증하지 못한 것은 검증하지 못했다고 적었습니다.</p>
</div>
<div class="card"><div class="kicker">Profile</div>
<div style="display:grid;grid-template-columns:96px 1fr;gap:18px;align-items:center"><img src="assets/img/profile.jpg" alt="박세준" style="border-radius:12px;width:96px"><div><div style="font-size:22px;font-weight:800">박세준 <span class="muted" style="font-size:14px;font-weight:500">Sejun Park</span></div><div class="muted" style="font-size:14px">경북대 전자공학부 + 지식재산융합전공 · 2027.02 졸업예정</div><div class="muted" style="font-size:14px">Co-founder · PM, 노바로보틱스 (2025.09~2026.02)</div></div></div>
<div class="contact-grid" style="grid-template-columns:1fr 1fr;margin-top:20px">
<div class="c"><div class="k c-coral">GITHUB</div><div class="v"><a href="${profile.links.github}" target="_blank" rel="noopener">github.com/mnunu123</a></div></div>
<div class="c"><div class="k c-violet">BLOG</div><div class="v"><a href="${profile.links.blog}" target="_blank" rel="noopener">blog-1vld.vercel.app</a></div></div>
<div class="c"><div class="k c-blue">EMAIL</div><div class="v"><a href="mailto:${profile.links.email}">${profile.links.email}</a></div></div>
<div class="c"><div class="k c-mint">PHONE</div><div class="v"><a href="tel:${profile.links.phone.replace(/-/g, '')}">${profile.links.phone}</a></div></div>
</div></div>
</div></div></section>

<section class="section" id="how"><div class="wrap">
<div class="kicker">How I Work</div>
<h2 class="h2">기억에 의존하지 않고 <span class="c-coral">기록을 쌓아</span> 다음 문제를 풉니다</h2>
<p class="lead">프로젝트마다 도메인은 달랐지만(로보틱스, 핀테크 계산, 마케팅 자동화, 영상 제작, 제조 데이터) 지켜온 기준은 같습니다.</p>
<div class="grid g3" style="margin-top:34px">${principles.map((x) => `<div class="card principle reveal"><div class="num c-${x.c}">${x.n}</div><h3>${x.t}</h3><div class="q">${x.q}</div><p class="muted" style="font-size:15px">${x.d}</p></div>`).join('')}</div>
<div class="callout" style="max-width:900px"><b>협업에서 바꾼 것</b> — 예창패 개발 중 팀원에게 "문제가 생기면 혼자 붙잡지 말고 먼저 공유해 달라"는 피드백을 받았습니다. 이후 막힌 문제는 원인, 시도한 방법, 필요한 도움을 먼저 공유하는 방식으로 바꿨고, 통합 검토에서 펌웨어 결함 4건을 함께 찾아낸 것도 그 결과였습니다.</div>
</div></section>

<section class="section" id="projects"><div class="wrap">
<div class="kicker">Case Studies</div>
<h2 class="h2">무엇을 만들었는지보다 <span class="c-violet">어떻게 풀었는지</span></h2>
<p class="lead">각 페이지는 문제 → 판단 → 행동 → 결과 → 배운 점 순서로 적었습니다. 구현하지 못한 범위는 따로 표시했습니다.</p>
<div class="grid g2" style="margin-top:34px">${featured.map(pcard).join('')}${rest.map(pcard).join('')}</div>
</div></section>

<section class="section" id="timeline"><div class="wrap">
<div class="grid g2" style="align-items:start">
<div><div class="kicker">Timeline</div><h2 class="h2">2024 → 2026</h2>
<div class="tl" style="margin-top:28px">${timeline.map(([d, t, s, c]) => `<div class="item" style="--c:var(--${c})"><div class="d">${d}</div><div class="t">${t}</div><div class="s">${s}</div></div>`).join('')}</div></div>
<div><div class="kicker">Education · Activities · Certificates</div><h2 class="h2">교육 · 활동 · 자격</h2>
<div class="card" style="margin-top:28px"><h3 class="c-violet">교육 · 활동</h3><ul class="list" style="font-size:14.5px">${education.map((e) => `<li>${e}</li>`).join('')}</ul></div>
<div class="card" style="margin-top:14px"><h3 class="c-mint">자격</h3><div>${pills(certs, 'mint')}</div></div>
</div></div></div></section>

<section class="section" id="awards"><div class="wrap">
<div class="kicker">Recognition</div>
<h2 class="h2"><span class="c-coral">12건</span> 수상 · 대상 1 · 최우수 4 · 우수 4 · 은상 1 · 장려 2</h2>
<p class="lead">2025년 9월부터 12월까지 쓰리봇 한 프로젝트로 9개 대회에서 수상했습니다. 기술형·창업형·사회문제형 대회의 심사 기준에 맞춰 같은 기술을 다르게 설명했고 발표는 직접 했습니다.</p>
<div class="grid g2" style="margin-top:30px;gap:10px">${awards.map(([d, g, t]) => `<div class="award"><span class="pill solid ${gradeColor[g]}" style="margin:0;text-align:center">${g}</span><span class="d">${d}</span><span>${t}</span></div>`).join('')}</div>
<p class="muted" style="margin-top:16px;font-size:14px">+ 딥테크 예비창업패키지 우수기업 선정 → 청년창업사관학교 서류 면제 · 창의회로설계 Cadence Award</p>
</div></section>

<section class="section" id="skills"><div class="wrap">
<div class="kicker">Skills</div>
<h2 class="h2">실제 프로젝트에서 사용한 것만</h2>
<div style="margin-top:20px">${skills.map(([n, c, tags]) => `<div class="skillrow"><div class="n c-${c}">${n}</div><div>${pills(tags, c)}</div></div>`).join('')}</div>
</div></section>

<section class="section" id="contact"><div class="wrap">
<div class="kicker">Contact</div>
<h2 class="h2">구조를 그리고, 끝까지 작동하게 만들고,<br>검증 기준을 먼저 세우는 엔지니어</h2>
<p class="lead">쓰리봇에서 전장·펌웨어·비전·백엔드·사업화를 한 번에 겪었고, 그 방식을 AI 자동화와 데이터 분석으로 넓혀 왔습니다.</p>
<div class="contact-grid">
<div class="c"><div class="k c-coral">GITHUB</div><div class="v"><a href="${profile.links.github}" target="_blank" rel="noopener">github.com/mnunu123</a></div></div>
<div class="c"><div class="k c-violet">BLOG</div><div class="v"><a href="${profile.links.blog}" target="_blank" rel="noopener">blog-1vld.vercel.app</a></div></div>
<div class="c"><div class="k c-blue">EMAIL</div><div class="v"><a href="mailto:${profile.links.email}">${profile.links.email}</a></div></div>
<div class="c"><div class="k c-mint">PHONE</div><div class="v"><a href="tel:${profile.links.phone.replace(/-/g, '')}">${profile.links.phone}</a></div></div>
</div></div></section>
${footer(base)}`;
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
}

// ---------- project pages ----------
function buildProject(pr, i) {
  const base = '../';
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const sections = pr.sections.map((s) => `<section class="cs-section" id="${s.id}"><div class="wrap">
<div class="label c-${s.color}"><i></i>${s.label}</div>
<h2>${s.h2}</h2>
<div class="prose">${s.html}</div>
${(s.extra || []).map((x) => extraBlock(x, base)).join('')}
</div></section>`).join('');
  const html = `${head(`${pr.title} — 박세준`, pr.card, base)}
${nav(base)}
<header class="cs-head"><div class="wrap">
<a class="back" href="../index.html#projects">← 모든 프로젝트</a>
<div class="kicker c-${pr.color}">${pr.tag}</div>
<h1>${pr.headline}</h1>
<p class="lead">${pr.lead}</p>
<div class="cs-meta">
<div class="m"><div class="k">Period</div><div class="v">${pr.period}</div></div>
<div class="m"><div class="k">Role</div><div class="v">${pr.role}</div></div>
<div class="m"><div class="k">Team</div><div class="v">${pr.team}</div></div>
<div class="m"><div class="k">Stack</div><div class="v" style="font-size:13px">${pr.stack.join(' · ')}</div></div>
</div>
${kpiGrid(pr.kpis)}
${pr.subnav ? `<div class="subnav">${pr.subnav.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('')}</div>` : ''}
</div></header>
${sections}
${pr.links && pr.links.length ? `<section class="cs-section"><div class="wrap"><div class="label c-blue"><i></i>Links</div><div style="display:flex;flex-wrap:wrap;gap:10px">${pr.links.map(([t, u]) => `<a class="btn" href="${u}" target="_blank" rel="noopener">${t} ↗</a>`).join('')}</div></div></section>` : ''}
<div class="wrap"><div class="nextprev">
<a href="${prev.slug}.html"><div class="k">← PREV</div><div class="t">${prev.title}</div></a>
<a href="${next.slug}.html" style="text-align:right"><div class="k">NEXT →</div><div class="t">${next.title}</div></a>
</div></div>
${footer(base)}`;
  fs.mkdirSync(path.join(ROOT, 'projects'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'projects', `${pr.slug}.html`), html);
}

buildIndex();
projects.forEach(buildProject);
console.log('built index.html +', projects.length, 'project pages');
