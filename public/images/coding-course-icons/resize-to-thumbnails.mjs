import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'thumbnails');
const SIZE = 100;

const files = await readdir(__dirname);
const pngs = files.filter(f => extname(f).toLowerCase() === '.png');

if (pngs.length === 0) {
  console.log('Brak plików PNG w folderze.');
  process.exit(0);
}

await mkdir(OUTPUT_DIR, { recursive: true });

for (const file of pngs) {
  const input = join(__dirname, file);
  const output = join(OUTPUT_DIR, file);
  await sharp(input)
    .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(output);
  console.log(`✓ ${file} → thumbnails/${file} (${SIZE}x${SIZE})`);
}

console.log(`\nGotowe! Zmniejszono ${pngs.length} plik${pngs.length === 1 ? '' : pngs.length < 5 ? 'i' : 'ów'}.`);
