/**
 * Selftest nagrań lektora (E4a kursu polskiego) — `src/app/jezyk-polski/klasa-4/lib/lektor/`.
 *
 * Wzorzec: `scripts/polski-pisarnia-selftest.mjs` — esbuild bundluje moduły TS,
 * potem asercje na czystych funkcjach. Odpalany przez `npm run test:unit`.
 *
 * Część A: czyste funkcje (`staleClips`, `formatMs`) na danych z testu.
 * Część B: bramka nagrań — każdy manifest `*.audio.ts` pod
 * `src/app/jezyk-polski/` ma istniejące pliki mp3 i tekst zgodny ze źródłem.
 * Manifesty i źródła tekstu wczytujemy dynamicznie (osobny bundle na plik),
 * więc test sam znajduje nowe nagrania. W tle może trwać nagrywanie —
 * częściowy manifest słusznie zgłasza `brak-nagrania`; to raport do
 * podsumowania, nie powód do poprawiania nagrań.
 *
 *   node scripts/polski-lektor-selftest.mjs
 */

import { build } from 'esbuild';
import { mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = process.cwd();

/** Bundluje esbuildem wpis z podanych linii i zwraca namespace importu. */
async function bundleLines(lines, tag) {
  const dir = await mkdtemp(join(tmpdir(), tag));
  try {
    const entry = join(dir, 'entry.ts');
    const outfile = join(dir, 'bundle.mjs');
    await writeFile(entry, `${lines.join('\n')}\n`, 'utf8');
    await build({ entryPoints: [entry], outfile, bundle: true, format: 'esm', platform: 'node' });
    return await import(pathToFileURL(outfile).href);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// Wpis celowo omija `lib/lektor/index` — tam jest hook Reacta (`use-lektor`).
const lib = await bundleLines(
  [
    `export { staleClips, formatMs } from '${repoRoot}/src/app/jezyk-polski/klasa-4/lib/lektor/stale';`,
    `export { buildKorpus } from '${repoRoot}/src/app/jezyk-polski/klasa-4/lib/korpus/index';`,
  ],
  'polski-lektor-a-',
);

const { staleClips, formatMs, buildKorpus } = lib;

let failures = 0;
let checks = 0;
/** Numery (z etykiet) niezdanych przypadków — do końcowego podsumowania. */
const failedNums = [];

function numOf(label) {
  const m = /^(\d+)/.exec(label);
  return m ? m[1] : label;
}

function check(label, actual, expected) {
  checks += 1;
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures += 1;
    failedNums.push(numOf(label));
    console.error(`  ✗ ${label}\n      oczekiwano: ${JSON.stringify(expected)}\n      otrzymano:  ${JSON.stringify(actual)}`);
  }
}

/** Asercja na warunku. */
function cond(label, value) {
  checks += 1;
  if (!value) {
    failures += 1;
    failedNums.push(numOf(label));
    console.error(`  ✗ ${label}\n      oczekiwano: prawda\n      otrzymano:  ${JSON.stringify(value)}`);
  }
}

async function group(name, fn) {
  console.log(`\n${name}`);
  await fn();
}

function isPlainObject(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/* --- A. czyste funkcje ------------------------------------------------------ */

await group('A. staleClips i formatMs (dane z testu)', () => {
  const K = buildKorpus({ id: 't', layout: 'prose', body: 'Ala ma kota. Kot śpi.\n\nKoniec.' });
  const M = {
    id: 't',
    voice: 'Hope',
    clips: [
      { id: 's0', src: '/x/s0.mp3', ms: 1000, text: 'Ala ma kota.', block: 0 },
      { id: 's1', src: '/x/s1.mp3', ms: 900, text: 'Kot śpi.', block: 0 },
      { id: 's2', src: '/x/s2.mp3', ms: 500, text: 'Koniec.', block: 1 },
    ],
  };

  check('1. zgodny manifest bez zaległości', staleClips(M, K), []);

  const zmieniony = { ...M, clips: M.clips.map((c) => (c.id === 's1' ? { ...c, text: 'Kot je.' } : c)) };
  check('2. zmienione zdanie (s1)', staleClips(zmieniony, K), [{ id: 's1', reason: 'zmienione' }]);

  const bezS2 = { ...M, clips: M.clips.filter((c) => c.id !== 's2') };
  check('3. brak klipu (s2)', staleClips(bezS2, K), [{ id: 's2', reason: 'brak-nagrania' }]);

  const extra = { ...M, clips: [...M.clips, { id: 's9', src: '/x/s9.mp3', ms: 100, text: 'Halo.' }] };
  check('4. klip bez zdania (s9)', staleClips(extra, K), [{ id: 's9', reason: 'brak-zdania' }]);

  const mowa = { ...M, clips: M.clips.map((c) => (c.id === 's2' ? { ...c, text: 'To koniec.' } : c)) };
  check('5. forma mówiona z override (s2)', staleClips(mowa, K, { s2: 'To koniec.' }), []);
  check('6. forma mówiona bez override (s2)', staleClips(mowa, K), [{ id: 's2', reason: 'zmienione' }]);

  check('7. formatMs(0)', formatMs(0), '0:00');
  check('7. formatMs(61_499)', formatMs(61_499), '1:01');
  check('7. formatMs(59_600)', formatMs(59_600), '1:00');
  check('7. formatMs(-5)', formatMs(-5), '0:00');
});

/* --- B. prawdziwe nagrania kursu -------------------------------------------- */

/** Wiersze do końcowego podsumowania części B (manifest → wynik). */
const bNotes = [];

await group('B. nagrania kursu (*.audio.ts)', async () => {
  const root = join(repoRoot, 'src/app/jezyk-polski');
  const found = await readdir(root, { recursive: true });
  const audioFiles = found
    .filter((f) => f.endsWith('.audio.ts'))
    .sort()
    .map((f) => join(root, f));

  cond('8. są nagrania (*.audio.ts)', audioFiles.length > 0);

  for (const abs of audioFiles) {
    const name = basename(abs);
    const rel = relative(repoRoot, abs);
    let audioMod = null;
    try {
      audioMod = await bundleLines([`export { AUDIO } from ${JSON.stringify(abs)};`], 'polski-lektor-b-');
    } catch {
      audioMod = null;
    }
    cond(`8. ${name}: manifest ładuje się (eksport AUDIO)`, audioMod !== null && audioMod.AUDIO !== undefined);
    if (audioMod === null || audioMod.AUDIO === undefined) {
      bNotes.push(`${rel}: nie ładuje się (brak eksportu AUDIO)`);
      continue;
    }
    const AUDIO = audioMod.AUDIO;
    const clips = Array.isArray(AUDIO.clips) ? AUDIO.clips : [];
    console.log(`  • ${rel}: ${clips.length} klipów`);

    cond(`8. ${name}: ma klipy`, clips.length > 0);
    const ids = clips.map((c) => c.id);
    cond(`8. ${name}: id klipów unikalne`, new Set(ids).size === ids.length);

    for (const clip of clips) {
      cond(`9. ${name} ${clip.id}: src pod /audio/jezyk-polski/`, typeof clip.src === 'string' && clip.src.startsWith('/audio/jezyk-polski/'));
      cond(`9. ${name} ${clip.id}: ms > 0`, typeof clip.ms === 'number' && clip.ms > 0);
      let size = -1;
      try {
        const st = await stat(join(repoRoot, 'public', clip.src));
        if (st.isFile()) size = st.size;
      } catch {
        size = -1;
      }
      cond(`9. ${name} ${clip.id}: mp3 istnieje i ma > 1000 B`, size > 1000);
    }

    const base = name.replace(/\.audio\.ts$/, '');
    const dot = base.split('.');
    if (dot.length !== 2 || !dot[0] || !dot[1]) {
      console.log('    (10. pominięto: nazwa spoza konwencji <modul>.<eksport>.audio.ts)');
      bNotes.push(`${rel}: pominięto krok 10 (nazwa spoza konwencji)`);
      continue;
    }
    const [modul, eksportLower] = dot;
    const modulAbs = join(dirname(abs), `${modul}.ts`);
    let textMod = null;
    try {
      textMod = await bundleLines([`export * from ${JSON.stringify(modulAbs)};`], 'polski-lektor-b-');
    } catch {
      textMod = null;
    }
    cond(`10. ${name}: moduł tekstu ${modul}.ts ładuje się`, textMod !== null);
    if (textMod === null) {
      bNotes.push(`${rel}: brak modułu tekstu ${modul}.ts`);
      continue;
    }
    const exportName = Object.keys(textMod).find((k) => k.toLowerCase() === eksportLower);
    cond(`10. ${name}: eksport „${eksportLower}” istnieje`, exportName !== undefined);
    if (exportName === undefined) {
      bNotes.push(`${rel}: brak eksportu „${eksportLower}” w ${modul}.ts`);
      continue;
    }
    const srcExp = textMod[exportName];
    if (isPlainObject(srcExp) && typeof srcExp.body === 'string' && (srcExp.layout === 'prose' || srcExp.layout === 'verse')) {
      const speechRaw = textMod[`${exportName}_SPEECH`];
      const speech = isPlainObject(speechRaw) ? speechRaw : {};
      let stale = null;
      try {
        stale = staleClips(AUDIO, buildKorpus(srcExp), speech);
      } catch (e) {
        stale = null;
        cond(`10. ${name}: korpus buduje się`, false);
        bNotes.push(`${rel}: buildKorpus rzucił: ${e instanceof Error ? e.message : String(e)}`);
        continue;
      }
      check(`10. ${name}: nagrania aktualne (staleClips [])`, stale, []);
      bNotes.push(`${rel}: ${clips.length} klipów, staleClips → ${stale.length === 0 ? 'aktualne' : JSON.stringify(stale)}`);
    } else if (isPlainObject(srcExp)) {
      const expected = Object.entries(srcExp);
      const textOf = (spec) => (typeof spec === 'string' ? spec : spec?.text);
      const known = expected.every(([, spec]) => typeof textOf(spec) === 'string');
      cond(`10. ${name}: słownik klipów ma znany kształt`, known);
      if (known) {
        check(`10. ${name}: klucze słownika == id klipów`, Object.keys(srcExp).sort(), ids.slice().sort());
        check(
          `10. ${name}: teksty klipów == warianty`,
          clips.map((c) => c.text),
          clips.map((c) => textOf(srcExp[c.id])),
        );
      }
      bNotes.push(`${rel}: słownik ${expected.length} wariantów, ${clips.length} klipów`);
    } else {
      cond(`10. ${name}: znany kształt eksportu (korpus albo słownik klipów)`, false);
      bNotes.push(`${rel}: nieznany kształt eksportu „${exportName}”`);
    }
  }
});

const total = checks;
if (failures === 0) {
  console.log(`\n✓ ${total}/${total} OK\n`);
} else {
  console.log(`\n✗ ${failures} z ${total} nie przeszło`);
  console.log(`Niezdane przypadki: ${[...new Set(failedNums)].join(', ')}`);
}
console.log('Część B — podsumowanie nagrań:');
if (bNotes.length === 0) console.log('  (brak manifestów)');
for (const n of bNotes) console.log(`  • ${n}`);
process.exit(failures === 0 ? 0 : 1);
