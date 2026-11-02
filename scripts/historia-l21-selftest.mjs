/**
 * Selftest czystych funkcji L21 (`osiagniecia-egipcjan`: kartusze + imie + pole + papirus).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l20-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l21-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l21-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as K from '${root}/src/app/historia/klasa-4/components/lessons/osiagniecia-egipcjan/kartusze';\n` +
    `export * as I from '${root}/src/app/historia/klasa-4/components/lessons/osiagniecia-egipcjan/imie';\n` +
    `export * as P from '${root}/src/app/historia/klasa-4/components/lessons/osiagniecia-egipcjan/pole';\n` +
    `export * as Pa from '${root}/src/app/historia/klasa-4/components/lessons/osiagniecia-egipcjan/papirus';\n`,
);

/** Alias `@/` → `<root>/src/` (tsconfig paths), jak w Next. */
const aliasPlugin = {
  name: 'at-alias',
  setup(b) {
    b.onResolve({ filter: /^@\// }, (args) => {
      const base = join(root, 'src', args.path.slice(2));
      for (const cand of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')]) {
        if (existsSync(cand)) return { path: cand };
      }
      return { path: base };
    });
  },
};

await build({
  entryPoints: [entry],
  outfile: out,
  bundle: true,
  format: 'esm',
  platform: 'node',
  plugins: [aliasPlugin],
});

const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const { K, I, P, Pa } = lib;

let total = 0;
const failures = [];

function t(label, fn) {
  total += 1;
  try {
    fn();
  } catch (e) {
    failures.push(label);
    const detail = e instanceof Error ? e.message : String(e);
    console.error(`  ✗ ${label}\n      ${detail.split('\n').join('\n      ')}`);
  }
}

function group(name, fn) {
  console.log(`\n${name}`);
  fn();
}

/* --- A) kartusze: metoda Champolliona ------------------------------------------------ */

group('A) kartusze: metoda Champolliona', () => {
  t('allThreads() ma dokładnie 3 pary [0,4],[2,3],[3,1]', () => {
    assert.deepEqual(K.allThreads(), [
      [0, 4],
      [2, 3],
      [3, 1],
    ]);
  });
  t("judgeThread ten sam kartusz → reason 'ten-sam-kartusz'", () => {
    const r = K.judgeThread({ c: 'pt', i: 0 }, { c: 'pt', i: 1 }, []);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'ten-sam-kartusz');
  });
  t("judgeThread chleb (pt 1) i dłoń (kl 6) → reason 'rozne-znaki'", () => {
    const r = K.judgeThread({ c: 'pt', i: 1 }, { c: 'kl', i: 6 }, []);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'rozne-znaki');
  });
  t('judgeThread pt0/kl4 → ok', () => {
    const r = K.judgeThread({ c: 'pt', i: 0 }, { c: 'kl', i: 4 }, []);
    assert.equal(r.ok, true);
    assert.deepEqual(r.thread, [0, 4]);
  });
  t("judgeThread pt0/kl4 ponownie z existing → reason 'juz-jest'", () => {
    const r = K.judgeThread({ c: 'pt', i: 0 }, { c: 'kl', i: 4 }, [[0, 4]]);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'juz-jest');
  });
  t("judgeLetter([0,4],'P') → ok", () => {
    assert.equal(K.judgeLetter([0, 4], 'P').ok, true);
  });
  t("judgeLetter([0,4],'O') → nie ok, tekst zawiera '1.'", () => {
    const r = K.judgeLetter([0, 4], 'O');
    assert.equal(r.ok, false);
    assert.ok(r.text.includes('1.'), `tekst: ${r.text}`);
  });
  t("judgeLetter([3,1],'L') → ok", () => {
    assert.equal(K.judgeLetter([3, 1], 'L').ok, true);
  });
  t("judgeLetter([2,3],'O') → ok", () => {
    assert.equal(K.judgeLetter([2, 3], 'O').ok, true);
  });
  t("readThird() == ['A','L',null,'S',null,'T/D','R','S']", () => {
    assert.deepEqual(K.readThird(), ['A', 'L', null, 'S', null, 'T/D', 'R', 'S']);
  });
  t("judgeCandidate('aleksander') → ok", () => {
    assert.equal(K.judgeCandidate('aleksander').ok, true);
  });
  t("judgeCandidate('arsinoe') → nie ok", () => {
    assert.equal(K.judgeCandidate('arsinoe').ok, false);
  });
  t("judgeCandidate('antoniusz') → nie ok", () => {
    assert.equal(K.judgeCandidate('antoniusz').ok, false);
  });
});

/* --- B) imie: kartusz dziecka ---------------------------------------------------------- */

group('B) imie: kartusz dziecka', () => {
  t("toSounds('Szymon') == ['SZ','Y','M','O','N']", () => {
    assert.deepEqual(I.toSounds('Szymon'), ['SZ', 'Y', 'M', 'O', 'N']);
  });
  t("toSounds('Rzeżucha') zaczyna się od 'RZ' i zawiera 'CH'", () => {
    const s = I.toSounds('Rzeżucha');
    assert.equal(s[0], 'RZ');
    assert.ok(s.includes('CH'), `głoski: ${s.join(',')}`);
  });
  t("toSounds('Ola!') == ['O','L','A']", () => {
    assert.deepEqual(I.toSounds('Ola!'), ['O', 'L', 'A']);
  });
  t("judgeName('Ola', ['lasso','lew','sep']) → ok", () => {
    assert.equal(I.judgeName('Ola', ['lasso', 'lew', 'sep']).ok, true);
  });
  t("judgeName('Ola', ['lasso','usta','sep']) → nie ok, index 1", () => {
    const r = I.judgeName('Ola', ['lasso', 'usta', 'sep']);
    assert.equal(r.ok, false);
    assert.equal(r.index, 1);
  });
  t("judgeName('Ola', ['lasso','lew']) → nie ok, index 2", () => {
    const r = I.judgeName('Ola', ['lasso', 'lew']);
    assert.equal(r.ok, false);
    assert.equal(r.index, 2);
  });
  t('za dużo znaków → nie ok', () => {
    const r = I.judgeName('Ola', ['lasso', 'lew', 'sep', 'sep']);
    assert.equal(r.ok, false);
  });
  t("judgeName('', []) → nie ok", () => {
    assert.equal(I.judgeName('', []).ok, false);
  });
  for (const name of ['Łukasz', 'Żaneta', 'Wiktoria', 'Ćwiek', 'Jędrzej', 'Xawery', 'Quinn']) {
    t(`każda głoska '${name}' ma signFor != undefined`, () => {
      for (const s of I.toSounds(name)) {
        assert.ok(I.signFor(s) !== undefined, `głoska bez znaku: ${s}`);
      }
    });
  }
});

/* --- C) pole: mierniczy ----------------------------------------------------------------- */

group('C) pole: mierniczy', () => {
  t("judgeStakes z 3 palikami → 'za-malo'", () => {
    const r = P.judgeStakes([
      { x: 1, y: 1 },
      { x: 11, y: 1 },
      { x: 11, y: 5 },
    ]);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'za-malo');
  });
  t('judgeStakes z FIELD.corners → ok, w=10, h=4, area=40', () => {
    const r = P.judgeStakes(P.FIELD.corners);
    assert.equal(r.ok, true);
    assert.equal(r.w, 10);
    assert.equal(r.h, 4);
    assert.equal(r.area, 40);
  });
  t("judgeStakes z palikiem y=7 → 'w-wodzie'", () => {
    const r = P.judgeStakes([
      { x: 1, y: 1 },
      { x: 11, y: 1 },
      { x: 11, y: 7 },
      { x: 1, y: 5 },
    ]);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'w-wodzie');
  });
  t("prostokąt (1,1),(11,1),(11,4),(1,4) → 'brzeg'", () => {
    const r = P.judgeStakes([
      { x: 1, y: 1 },
      { x: 11, y: 1 },
      { x: 11, y: 4 },
      { x: 1, y: 4 },
    ]);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'brzeg');
  });
  t("prostokąt (2,1),(11,1),(11,5),(2,5) → 'kamien'", () => {
    const r = P.judgeStakes([
      { x: 2, y: 1 },
      { x: 11, y: 1 },
      { x: 11, y: 5 },
      { x: 2, y: 5 },
    ]);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'kamien');
  });
  t("romb nieprostokątny → 'krzywo'", () => {
    const r = P.judgeStakes([
      { x: 1, y: 1 },
      { x: 11, y: 1 },
      { x: 10, y: 5 },
      { x: 2, y: 5 },
    ]);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'krzywo');
  });
  t("dwa paliki w tym samym punkcie → 'zdublowany'", () => {
    const r = P.judgeStakes([
      { x: 1, y: 1 },
      { x: 11, y: 1 },
      { x: 11, y: 5 },
      { x: 1, y: 1 },
    ]);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'zdublowany');
  });
  t('taxFor(40) === 4', () => {
    assert.equal(P.taxFor(40), 4);
  });
  t('taxFor(60) === 6', () => {
    assert.equal(P.taxFor(60), 6);
  });
  t('judgeTax(40,4) → ok', () => {
    assert.equal(P.judgeTax(40, 4).ok, true);
  });
  t('judgeTax(40,6) → nie ok', () => {
    assert.equal(P.judgeTax(40, 6).ok, false);
  });
  t('judgeTax(40,2) → nie ok', () => {
    assert.equal(P.judgeTax(40, 2).ok, false);
  });
  t('judgeTax(40,0) → nie ok', () => {
    assert.equal(P.judgeTax(40, 0).ok, false);
  });
  t('ringOrder 4 rogów: kolejne punkty sąsiadują (różnią się tylko x albo tylko y)', () => {
    const ring = P.ringOrder(P.FIELD.corners);
    assert.equal(ring.length, 4);
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % ring.length];
      const sameX = a.x === b.x;
      const sameY = a.y === b.y;
      assert.ok(sameX !== sameY, `(${a.x},${a.y}) → (${b.x},${b.y})`);
    }
  });
  t('knots({x:1,y:1},{x:11,y:1}) === 10', () => {
    assert.equal(
      P.knots({ x: 1, y: 1 }, { x: 11, y: 1 }),
      10,
    );
  });
  t('knots po przekątnej === null', () => {
    assert.equal(
      P.knots({ x: 1, y: 1 }, { x: 11, y: 5 }),
      null,
    );
  });
});

/* --- D) papirus: kartka i lekarz ------------------------------------------------------------ */

group('D) papirus: kartka i lekarz', () => {
  t("judgeSheet([]) → 'pusto'", () => {
    const r = Pa.judgeSheet([]);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'pusto');
  });
  t("same 'v' 0..STRIPS-1 → 'jedna-warstwa'", () => {
    const strips = Array.from({ length: Pa.STRIPS }, (_, i) => ({ dir: 'v', idx: i }));
    const r = Pa.judgeSheet(strips);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'jedna-warstwa');
  });
  t('pełne v i h → ok', () => {
    const strips = [];
    for (let i = 0; i < Pa.STRIPS; i++) {
      strips.push({ dir: 'v', idx: i });
      strips.push({ dir: 'h', idx: i });
    }
    assert.equal(Pa.judgeSheet(strips).ok, true);
  });
  t("pełne v, h bez idx 2 → 'dziura', tekst zawiera '3'", () => {
    const strips = [];
    for (let i = 0; i < Pa.STRIPS; i++) {
      strips.push({ dir: 'v', idx: i });
      if (i !== 2) strips.push({ dir: 'h', idx: i });
    }
    const r = Pa.judgeSheet(strips);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'dziura');
    assert.ok(r.text.includes('3'), `tekst: ${r.text}`);
  });
  t('judgeMarks({}) → nie ok', () => {
    assert.equal(Pa.judgeMarks({}).ok, false);
  });
  t('judgeMarks z prawdą z ALL_SEGMENTS → ok', () => {
    const marks = Object.fromEntries(Pa.ALL_SEGMENTS.map((s) => [s.id, s.truth]));
    assert.equal(Pa.judgeMarks(marks).ok, true);
  });
  t('judgeMarks z jedną zamienioną → nie ok, wrong ma 1 element', () => {
    const marks = Object.fromEntries(Pa.ALL_SEGMENTS.map((s) => [s.id, s.truth]));
    const first = Pa.ALL_SEGMENTS[0];
    marks[first.id] = first.truth === 'cialo' ? 'slowa' : 'cialo';
    const r = Pa.judgeMarks(marks);
    assert.equal(r.ok, false);
    assert.equal(r.wrong.length, 1);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}
