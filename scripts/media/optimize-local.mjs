#!/usr/bin/env node
/**
 * Rekompresuje obrazy, które zostają w `public/` (logo, ikony, tła, okładki gier).
 *
 * Po przejściu na custom loader (`src/lib/media/loader.ts`) pliki lokalne idą do
 * przeglądarki w oryginale — nikt ich już po drodze nie zmniejsza. Ten skrypt
 * robi to raz, na dysku: zachowuje ścieżkę, nazwę i format, więc żadna referencja
 * w kodzie się nie zmienia.
 *
 * Usage:
 *   node scripts/media/optimize-local.mjs [--dry-run] [--min-gain 5] [ścieżka ...]
 *
 * Bez ścieżek bierze domyślny zestaw z TARGETS (obrazy realnie renderowane w kodzie).
 * `--min-gain` to minimalny zysk w procentach, poniżej którego plik zostaje nietknięty.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PROJECT_ROOT = process.cwd();

/**
 * `maxWidth` ustawiony tylko tam, gdzie wiadomo, jak duży jest realny slot.
 * Okładki gier zostają w pełnym rozmiarze — służą też za obrazy OG (1360x768).
 */
const TARGETS = [
  { glob: 'public/images/general-photos', maxWidth: null },
  { glob: 'public/images/games', maxWidth: null },
  { glob: 'public/images/hero', maxWidth: null },
  // Ikony RoundIconButton renderują się w 56/80/112 px, FloatingCta w 120 px.
  { glob: 'public/images/icons', maxWidth: 320 },
];

const QUALITY = { jpeg: 85, webp: 82, png: null };

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      positional.push(a);
      continue;
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i += 1;
    }
  }
  return { flags, positional };
}

async function collectFiles(inputs) {
  const out = [];
  for (const input of inputs) {
    const abs = path.resolve(PROJECT_ROOT, input);
    const stat = await fs.stat(abs).catch(() => null);
    if (!stat) continue;
    if (stat.isFile()) {
      out.push(abs);
      continue;
    }
    for (const entry of await fs.readdir(abs, { withFileTypes: true })) {
      if (entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name)) {
        out.push(path.join(abs, entry.name));
      }
    }
  }
  return out;
}

async function reencode(absPath, maxWidth) {
  const input = await fs.readFile(absPath);
  const meta = await sharp(input).metadata();
  const format = String(meta.format || '').toLowerCase();

  let pipeline = sharp(input);
  const willResize = Boolean(maxWidth && meta.width && meta.width > maxWidth);
  if (willResize) pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });

  if (format === 'png') pipeline = pipeline.png({ compressionLevel: 9, palette: true });
  else if (format === 'webp') pipeline = pipeline.webp({ quality: QUALITY.webp });
  else pipeline = pipeline.jpeg({ quality: QUALITY.jpeg, mozjpeg: true });

  const output = await pipeline.toBuffer();
  return { input, output, meta, willResize, format };
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const dryRun = Boolean(flags['dry-run']);
  const minGain = Number(flags['min-gain'] ?? 5);

  const jobs = positional.length
    ? positional.map((p) => ({ glob: p, maxWidth: flags['max-width'] ? Number(flags['max-width']) : null }))
    : TARGETS;

  let totalBefore = 0;
  let totalAfter = 0;
  const rows = [];

  for (const job of jobs) {
    for (const abs of await collectFiles([job.glob])) {
      const { input, output, meta, willResize } = await reencode(abs, job.maxWidth);
      const gain = ((input.length - output.length) / input.length) * 100;
      const rel = path.relative(PROJECT_ROOT, abs);

      if (gain < minGain) {
        totalBefore += input.length;
        totalAfter += input.length;
        rows.push({ rel, before: input.length, after: input.length, gain: 0, skipped: true });
        continue;
      }

      if (!dryRun) await fs.writeFile(abs, output);
      totalBefore += input.length;
      totalAfter += output.length;
      rows.push({
        rel,
        before: input.length,
        after: output.length,
        gain: Math.round(gain),
        resized: willResize ? `${meta.width} -> ${job.maxWidth}` : null,
      });
    }
  }

  const kb = (n) => `${Math.round(n / 1024)} kB`;
  for (const r of rows.sort((a, b) => b.before - a.before)) {
    if (r.skipped) {
      console.log(`  =  ${kb(r.before).padStart(8)}  ${r.rel}  (bez zmian)`);
    } else {
      const note = r.resized ? `  [${r.resized} px]` : '';
      console.log(`  ↓  ${kb(r.before).padStart(8)} -> ${kb(r.after).padStart(8)}  (-${r.gain}%)  ${r.rel}${note}`);
    }
  }
  console.log(
    `\n${dryRun ? '[dry-run] ' : ''}Razem: ${kb(totalBefore)} -> ${kb(totalAfter)} ` +
      `(-${Math.round(((totalBefore - totalAfter) / totalBefore) * 100)}%), plików: ${rows.length}`
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
