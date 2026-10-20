// motion/dist → 저장소 루트로 복사. 루트 assets/ 안의 이전 Vite 산출물(*.js, *.css)은 먼저 정리한다 (assets/img 등 하위 폴더는 손대지 않음).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, '../dist');
const root = path.resolve(here, '../..');
const assets = path.join(root, 'assets');

if (!fs.existsSync(path.join(dist, 'index.html'))) { console.error('dist/index.html 없음 — vite build 먼저'); process.exit(1); }
fs.mkdirSync(assets, { recursive: true });
let removed = 0;
for (const f of fs.readdirSync(assets)) {
  const full = path.join(assets, f);
  if (fs.statSync(full).isFile() && /\.(js|css|map)$/.test(f)) { fs.unlinkSync(full); removed++; }
}
let copied = 0;
for (const f of fs.readdirSync(path.join(dist, 'assets'))) { fs.copyFileSync(path.join(dist, 'assets', f), path.join(assets, f)); copied++; }
fs.copyFileSync(path.join(dist, 'index.html'), path.join(root, 'index.html'));
console.log(`deploy: index.html + assets ${copied}개 복사 (이전 산출물 ${removed}개 정리) → ${root}`);
