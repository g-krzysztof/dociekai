/**
 * Selftest czystych funkcji L17 (`mezopotamia`: kanały, sąd).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l16-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l17-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l17-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as K from '${root}/src/app/historia/klasa-4/components/lessons/mezopotamia/kanaly';\n` +
    `export * as H from '${root}/src/app/historia/klasa-4/components/lessons/mezopotamia/sad';\n`,
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

const { K, H } = lib;

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

/* --- A) kanały: extendPath -------------------------------------------------- */

group('A) kanały: extendPath', () => {
  t('extendPath([], [1,1]) → [[1,1]] (start przy rzece)', () => {
    assert.deepEqual(K.extendPath([], [1, 1]), [[1, 1]]);
  });
  t('extendPath([], [1,3]) → [] (start nie przy rzece)', () => {
    assert.deepEqual(K.extendPath([], [1, 3]), []);
  });
  t('extendPath([], [2,0]) → [] (rzeka nie jest startem)', () => {
    assert.deepEqual(K.extendPath([], [2, 0]), []);
  });
  t('kratka rzeki (kolumna 0) nie jest dokładana', () => {
    assert.deepEqual(K.extendPath([[1, 1]], [1, 0]), [[1, 1]]);
  });
  t('niesąsiednia kratka nie jest dokładana', () => {
    assert.deepEqual(K.extendPath([[1, 1]], [1, 3]), [[1, 1]]);
  });
  t('sąsiednia kratka jest dokładana', () => {
    assert.deepEqual(K.extendPath([[1, 1]], [2, 1]), [
      [1, 1],
      [2, 1],
    ]);
  });
  t('powrót na przedostatnią kratkę skraca ścieżkę', () => {
    assert.deepEqual(
      K.extendPath(
        [
          [1, 1],
          [2, 1],
        ],
        [1, 1],
      ),
      [[1, 1]],
    );
  });
  t('powtórzenie ostatniej kratki nie zmienia ścieżki', () => {
    assert.deepEqual(
      K.extendPath(
        [
          [1, 1],
          [2, 1],
        ],
        [2, 1],
      ),
      [
        [1, 1],
        [2, 1],
      ],
    );
  });
  t('powtórzenie wcześniejszej (nie przedostatniej) kratki nie zmienia ścieżki', () => {
    assert.deepEqual(
      K.extendPath(
        [
          [1, 1],
          [2, 1],
          [2, 2],
        ],
        [1, 1],
      ),
      [
        [1, 1],
        [2, 1],
        [2, 2],
      ],
    );
  });
});

/* --- B) kanały: woda staje pod górę ------------------------------------------ */

const BLOCKED = [
  [1, 1],
  [1, 2],
  [1, 3],
];

group('B) kanały: woda staje pod górę', () => {
  t('flow: blockedAt to [1,3]', () => {
    assert.deepEqual(K.flow(BLOCKED).blockedAt, [1, 3]);
  });
  t('flow: blockedFrom to 4', () => {
    assert.equal(K.flow(BLOCKED).blockedFrom, 4);
  });
  t('flow: wet === 2 (dwie kratki przed grzbietem)', () => {
    assert.equal(K.flow(BLOCKED).wet, 2);
  });
  t('judgeCanal: ok false', () => {
    assert.equal(K.judgeCanal(BLOCKED).ok, false);
  });
  t('judgeCanal: tekst zawiera „pod górę”', () => {
    assert.ok(K.judgeCanal(BLOCKED).text.includes('pod górę'), K.judgeCanal(BLOCKED).text);
  });
});

/* --- C) kanały: poprawna ścieżka ---------------------------------------------- */

const GOOD = [
  [1, 1],
  [2, 1],
  [2, 2],
  [3, 2],
  [3, 3],
  [3, 4],
  [2, 4],
  [2, 5],
  [2, 6],
  [1, 6],
  [1, 7],
];

group('C) kanały: poprawna ścieżka', () => {
  t('judgeCanal: ok true', () => {
    assert.equal(K.judgeCanal(GOOD).ok, true);
  });
  t('flow: wet === 11 (cała ścieżka)', () => {
    assert.equal(K.flow(GOOD).wet, 11);
  });
  t("flow: watered to ['a','b','c']", () => {
    assert.deepEqual(K.flow(GOOD).watered, ['a', 'b', 'c']);
  });
  t('flow: blockedAt null', () => {
    assert.equal(K.flow(GOOD).blockedAt, null);
  });
  t('judgeCanal: tekst mówi o wszystkich trzech polach', () => {
    assert.ok(K.judgeCanal(GOOD).text.includes('wszystkich trzech'), K.judgeCanal(GOOD).text);
  });
});

/* --- D) kanały: za krótka i pusta ścieżka -------------------------------------- */

const SHORT = [
  [1, 1],
  [2, 1],
  [2, 2],
];

group('D) kanały: za krótka i pusta ścieżka', () => {
  t('judgeCanal: za krótka ścieżka ok false', () => {
    assert.equal(K.judgeCanal(SHORT).ok, false);
  });
  t('judgeCanal: za krótka ścieżka — tekst mówi o suchych polach', () => {
    assert.ok(K.judgeCanal(SHORT).text.includes('suche'), K.judgeCanal(SHORT).text);
  });
  t('flow: za krótka ścieżka nawadnia tylko pole a', () => {
    assert.deepEqual(K.flow(SHORT).watered, ['a']);
  });
  t('judgeCanal: pusta ścieżka ok false', () => {
    assert.equal(K.judgeCanal([]).ok, false);
  });
  t('judgeCanal: pusta ścieżka — tekst odsyła do rzeki', () => {
    assert.ok(K.judgeCanal([]).text.includes('rzece'), K.judgeCanal([]).text);
  });
});

/* --- E) kanały: kopanie --------------------------------------------------------- */

group('E) kanały: kopanie', () => {
  t('daysNeeded(11, 8, false) === 55 (8 kopaczy bez nadzorcy: połowa wydajności)', () => {
    assert.equal(K.daysNeeded(11, 8, false), 55);
  });
  t('daysNeeded(11, 8, true) === 28 (nadzorca przywraca wydajność)', () => {
    assert.equal(K.daysNeeded(11, 8, true), 28);
  });
  t('daysNeeded(11, 4, false) === 55 (czterech kopaczy daje radę samym)', () => {
    assert.equal(K.daysNeeded(11, 4, false), 55);
  });
  t('efficiency(4, false) === 1', () => {
    assert.equal(K.efficiency(4, false), 1);
  });
  t('efficiency(5, false) === 0.5', () => {
    assert.equal(K.efficiency(5, false), 0.5);
  });
  t('efficiency(5, true) === 1', () => {
    assert.equal(K.efficiency(5, true), 1);
  });
  t('judgeDig(11, 8, false): ok false', () => {
    assert.equal(K.judgeDig(11, 8, false).ok, false);
  });
  t('judgeDig(11, 8, false): tekst zawiera „pokierować”', () => {
    assert.ok(K.judgeDig(11, 8, false).text.includes('pokierować'), K.judgeDig(11, 8, false).text);
  });
  t('judgeDig(11, 4, false): ok false', () => {
    assert.equal(K.judgeDig(11, 4, false).ok, false);
  });
  t('judgeDig(11, 4, false): tekst zawiera „Za mało rąk”', () => {
    assert.ok(K.judgeDig(11, 4, false).text.includes('Za mało rąk'), K.judgeDig(11, 4, false).text);
  });
  t('judgeDig(11, 8, true): ok true (28 dni ≤ 30)', () => {
    const r = K.judgeDig(11, 8, true);
    assert.equal(r.ok, true);
    assert.equal(r.days, 28);
  });
  t('daysNeeded z 0 kopaczy === Infinity', () => {
    assert.equal(K.daysNeeded(11, 0, false), Infinity);
  });
});

/* --- F) sąd: trafne prawa -------------------------------------------------------- */

group('F) sąd: trafne prawa', () => {
  for (const c of H.CASES) {
    t(`sprawa '${c.id}' z prawem '${c.law}' → ok`, () => {
      assert.equal(H.judgeCase(c.id, c.law).ok, true);
    });
    t(`sprawa '${c.id}' → tekst zawiera numer prawa`, () => {
      const law = H.LAWS.find((l) => l.id === c.law);
      assert.ok(law, `brak prawa ${c.law}`);
      assert.ok(H.judgeCase(c.id, c.law).text.includes(String(law.no)), H.judgeCase(c.id, c.law).text);
    });
  }
  t("sprawa 'niewolnik' z prawem 'p196' → nie ok", () => {
    assert.equal(H.judgeCase('niewolnik', 'p196').ok, false);
  });
  t("sprawa 'niewolnik' z prawem 'p196' → tekst zawiera „196”", () => {
    assert.ok(H.judgeCase('niewolnik', 'p196').text.includes('196'), H.judgeCase('niewolnik', 'p196').text);
  });
});

/* --- G) sąd: spójność danych ------------------------------------------------------ */

group('G) sąd: spójność danych', () => {
  t('wszystkie CASES wskazują istniejące LAWS', () => {
    for (const c of H.CASES) {
      assert.ok(
        H.LAWS.some((l) => l.id === c.law),
        `sprawa ${c.id} wskazuje nieistniejące prawo ${c.law}`,
      );
    }
  });
  t('prawa mają unikalne numery', () => {
    const nos = H.LAWS.map((l) => l.no);
    assert.equal(new Set(nos).size, nos.length);
  });
  t("dokładnie dwie sprawy mają harm 'oko'", () => {
    assert.equal(H.CASES.filter((c) => c.harm === 'oko').length, 2);
  });
  t("sprawy z harm 'oko': jedna victim 'obywatel', jedna 'niewolnik'", () => {
    const victims = H.CASES.filter((c) => c.harm === 'oko')
      .map((c) => c.victim)
      .sort();
    assert.deepEqual(victims, ['niewolnik', 'obywatel']);
  });
  t("prawa spraw z harm 'oko' mają różne werdykty", () => {
    const verdicts = H.CASES.filter((c) => c.harm === 'oko').map(
      (c) => H.LAWS.find((l) => l.id === c.law).verdict,
    );
    assert.notEqual(verdicts[0], verdicts[1]);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}
