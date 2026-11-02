#!/usr/bin/env node
/**
 * Sprawdza spójność mapy mediów z kodem. Uruchamiaj po migracji i po każdej
 * publikacji lekcji — wychwytuje trzy rzeczy, których TypeScript nie widzi:
 *
 *  1. odwołanie w kodzie bez wpisu w mapie i bez pliku lokalnego  -> martwy obrazek,
 *  2. wpis w mapie, do którego nikt się nie odwołuje              -> śmieć na Cloudinary,
 *  3. rozjazd między map.json a manifest.json                     -> błąd narzędzi.
 *
 * Usage:
 *   node scripts/media/check-media.mjs [--http]
 *
 * `--http` dodatkowo odpytuje każdy zmapowany adres (szerokość 256) i sprawdza,
 * czy wraca 200 — wolniejsze, ale to jedyny test, że plik naprawdę tam jest.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const MEDIA_DIR = path.join(PROJECT_ROOT, 'src', 'lib', 'media');
const REF = /['"](\/images\/(?:matematyka|informatyka|historia|jezyk-polski)\/[^'"]+)['"]/g;

async function readJson(p) {
  return JSON.parse(await fs.readFile(p, 'utf8'));
}

async function walk(dir, test) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, test)));
    else if (test(entry.name)) out.push(full);
  }
  return out;
}

async function main() {
  const httpCheck = process.argv.includes('--http');
  const map = await readJson(path.join(MEDIA_DIR, 'map.json'));
  const manifest = await readJson(path.join(MEDIA_DIR, 'manifest.json'));

  const sources = await walk(path.join(PROJECT_ROOT, 'src'), (n) => /\.tsx?$/.test(n));
  const refs = new Set();
  for (const file of sources) {
    if (file.startsWith(MEDIA_DIR)) continue;
    const text = await fs.readFile(file, 'utf8');
    for (const m of text.matchAll(REF)) refs.add(m[1]);
  }

  const mapped = new Set(Object.keys(map.images ?? {}));
  const problems = [];

  for (const ref of [...refs].sort()) {
    if (mapped.has(ref)) continue;
    const local = path.join(PROJECT_ROOT, 'public', ref.replace(/^\//, ''));
    const exists = await fs.stat(local).then(() => true, () => false);
    problems.push(
      exists
        ? { level: 'info', msg: `jeszcze lokalny (nie przeniesiony): ${ref}` }
        : { level: 'error', msg: `MARTWY: ${ref} — brak w mapie i brak pliku w public/` }
    );
  }

  for (const key of [...mapped].sort()) {
    if (!refs.has(key)) problems.push({ level: 'warn', msg: `osierocony wpis w mapie: ${key}` });
    if (!manifest.images?.[key]) problems.push({ level: 'error', msg: `rozjazd map/manifest: ${key}` });
  }

  let httpFailures = 0;
  if (httpCheck) {
    const keys = [...mapped];
    for (const [i, key] of keys.entries()) {
      const url = `${map.base}/f_auto,q_auto,c_limit,w_256/${map.images[key]}`;
      const res = await fetch(url, { method: 'HEAD', headers: { Accept: 'image/avif,image/webp,*/*' } })
        .catch(() => ({ ok: false, status: 0 }));
      if (!res.ok) {
        httpFailures += 1;
        problems.push({ level: 'error', msg: `HTTP ${res.status}: ${key}` });
      }
      if ((i + 1) % 50 === 0) console.log(`  ...sprawdzono ${i + 1}/${keys.length}`);
    }
  }

  const byLevel = (lvl) => problems.filter((p) => p.level === lvl);
  for (const lvl of ['error', 'warn', 'info']) {
    const items = byLevel(lvl);
    if (!items.length) continue;
    console.log(`\n${lvl.toUpperCase()} (${items.length}):`);
    for (const it of items.slice(0, 30)) console.log(`  ${it.msg}`);
    if (items.length > 30) console.log(`  ... i ${items.length - 30} więcej`);
  }

  console.log(
    `\nodwołań w kodzie: ${refs.size} | w mapie: ${mapped.size} | ` +
      `błędy: ${byLevel('error').length} | ostrzeżenia: ${byLevel('warn').length}` +
      (httpCheck ? ` | HTTP nieudane: ${httpFailures}` : '')
  );
  if (byLevel('error').length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
