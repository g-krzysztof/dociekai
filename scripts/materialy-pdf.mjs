/**
 * Generuje PDF-y materiałów do druku (dział /materialy) do private/materialy/<przedmiot>/.
 * Wymaga działającego dev serwera (domyślnie http://localhost:3011, env MATERIALY_BASE_URL).
 *
 *   node scripts/materialy-pdf.mjs [filtr-sluga]
 */
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { mkdtemp, rm, mkdir, writeFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const BASE = (process.env.MATERIALY_BASE_URL || 'http://localhost:3011').replace(/\/$/, '');
const filtr = process.argv[2];

// 1. Lista materiałów z TS
const tmp = await mkdtemp(join(tmpdir(), 'materialy-'));
const out = join(tmp, 'bundle.mjs');
await build({
  entryPoints: [join(ROOT, 'src/app/materialy/data/index.ts')],
  outfile: out,
  bundle: true,
  format: 'esm',
  platform: 'node',
  alias: { '@': join(ROOT, 'src') },
  logLevel: 'error',
});
const lib = await import(pathToFileURL(out).href);
await rm(tmp, { recursive: true, force: true });
const { MATERIALY, pdfFileName, wariantyPdf, drukHref } = lib;

const lista = MATERIALY.filter((m) => !filtr || m.slug.includes(filtr));
if (!lista.length) {
  console.error(`Brak materiałów pasujących do "${filtr}".`);
  process.exit(1);
}

// 2. Serwer
try {
  await fetch(BASE, { signal: AbortSignal.timeout(10000) });
} catch {
  console.error(`Serwer ${BASE} nie odpowiada — uruchom dev serwer (npm run dev) albo ustaw MATERIALY_BASE_URL.`);
  process.exit(1);
}

const countPages = (buf) => (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
const expected = (m, wariant) => {
  if (m.rodzaj === 'sciaga') return 1;
  const n = m.karty.length;
  return wariant === 'skladane' ? Math.ceil(n / 4) : Math.ceil(n / 8) * 2;
};

const browser = await chromium.launch();
const rows = [];
const errors = [];

for (const m of lista) {
  for (const wariant of wariantyPdf(m)) {
    const file = pdfFileName(m, wariant);
    const label = `${m.przedmiot}/${file}`;
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    try {
      await page.goto(BASE + drukHref(m, wariant), { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForSelector('[data-druk-root]');
      await page.evaluate(() => {
        const root = document.querySelector('[data-druk-root]');
        document.body.replaceChildren(root);
      });

      if (m.rodzaj === 'sciaga') {
        const over = await page.evaluate(() =>
          [...document.querySelectorAll('.kartka .sciaga')].map((el) => ({
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
          }))
        );
        if (!over.length) errors.push(`${label}: nie znaleziono elementu .kartka .sciaga`);
        for (const o of over) {
          if (o.scrollHeight > o.clientHeight + 1) {
            errors.push(`${label}: treść wystaje poza kartkę (scrollHeight=${o.scrollHeight}, clientHeight=${o.clientHeight})`);
          }
        }
      }

      await page.emulateMedia({ media: 'print' });
      const buf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
      const dir = join(ROOT, 'private/materialy', m.przedmiot);
      await mkdir(dir, { recursive: true });
      const path = join(dir, file);
      await writeFile(path, buf);

      const pages = countPages(buf);
      const exp = expected(m, wariant);
      if (pages !== exp) errors.push(`${label}: wyszło ${pages} stron, oczekiwano ${exp}`);
      rows.push({ plik: label, strony: pages, oczekiwane: exp, kB: ((await stat(path)).size / 1024).toFixed(1) });
    } catch (e) {
      errors.push(`${label}: ${e.message}`);
    } finally {
      await page.close();
    }
  }
}
await browser.close();

console.table(rows);
if (errors.length) {
  console.error('\nBŁĘDY:\n' + errors.map((e) => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log('Gotowe.');
