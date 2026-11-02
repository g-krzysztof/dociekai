#!/usr/bin/env node
/**
 * Normalizuje obraz do formatu lekcji: 1168x880 JPEG (cover) poniżej 145 kB.
 *
 * Użycie:
 *   node scripts/polski-obrazy.mjs <plik-wejściowy> <plik-wyjściowy.jpg>
 *   node scripts/polski-obrazy.mjs --batch <katalog-wejściowy> <katalog-wyjściowy>
 *
 * Tryb wsadowy przetwarza wszystkie .webp/.png/.jpg z katalogu wejściowego;
 * nazwa wyjściowa to nazwa bez rozszerzenia + .jpg.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const WIDTH = 1168;
const HEIGHT = 880;
const MAX_BYTES = 145000;
const Q_START = 85;
const Q_MIN = 50;
const Q_STEP = 5;

function usage() {
  console.log('Użycie:');
  console.log('  node scripts/polski-obrazy.mjs <plik-wejściowy> <plik-wyjściowy.jpg>');
  console.log('  node scripts/polski-obrazy.mjs --batch <katalog-wejściowy> <katalog-wyjściowy>');
}

async function processOne(inputPath, outputPath) {
  await fs.mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });

  let buffer = null;
  let usedQ = Q_START;
  for (let q = Q_START; q >= Q_MIN; q -= Q_STEP) {
    const candidate = await sharp(inputPath)
      .resize(WIDTH, HEIGHT, { fit: 'cover' })
      .jpeg({ quality: q, mozjpeg: true })
      .toBuffer();
    usedQ = q;
    buffer = candidate;
    if (candidate.length < MAX_BYTES) break;
  }

  if (!buffer) throw new Error(`Nie wygenerowano obrazu: ${inputPath}`);
  await fs.writeFile(outputPath, buffer);

  const tooBig = buffer.length >= MAX_BYTES;
  const kb = (buffer.length / 1024).toFixed(1);
  const line = `${outputPath} ${WIDTH}x${HEIGHT} q=${usedQ} ${kb} kB`;
  console.log(tooBig ? `OSTRZEŻENIE: plik nadal >= 145 kB: ${line}` : line);
  return tooBig;
}

async function runBatch(inputDir, outputDir) {
  const entries = await fs.readdir(inputDir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && /\.(webp|png|jpe?g)$/i.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, 'pl'));

  await fs.mkdir(path.resolve(outputDir), { recursive: true });

  let warned = false;
  for (const name of files) {
    const base = name.replace(/\.[^.]+$/, '');
    const out = path.join(outputDir, `${base}.jpg`);
    const tooBig = await processOne(path.join(inputDir, name), out);
    if (tooBig) warned = true;
  }
  return warned;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    usage();
    process.exit(2);
  }

  if (args[0] === '--batch') {
    if (args.length !== 3) {
      usage();
      process.exit(2);
    }
    const warned = await runBatch(args[1], args[2]);
    process.exit(warned ? 1 : 0);
  }

  if (args.length !== 2) {
    usage();
    process.exit(2);
  }
  const tooBig = await processOne(args[0], args[1]);
  process.exit(tooBig ? 1 : 0);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
