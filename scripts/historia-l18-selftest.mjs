/**
 * Selftest czystych funkcji L18 (`od-pisma-do-alfabetu`: pismo).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduł esbuildem — jak scripts/historia-l17-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l18-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l18-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as P from '${root}/src/app/historia/klasa-4/components/lessons/od-pisma-do-alfabetu/pismo';\n`,
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

const { P } = lib;

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

/** Deterministyczny generator (LCG) — ziarno daje powtarzalną dostawę. */
function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/* --- A) dostawa: kształt ---------------------------------------------------- */

group('A) dostawa: kształt', () => {
  const goodIds = new Set(P.GOODS.map((g) => g.id));
  for (let seed = 1; seed <= 50; seed++) {
    t(`makeDelivery(lcg(${seed})): 12 pozycji, owiec 3–5, olej 2–4, wszystko z GOODS`, () => {
      const d = P.makeDelivery(lcg(seed));
      assert.equal(d.length, 12, `długość ${d.length}`);
      const c = P.countGoods(d);
      assert.ok(c.owca >= 3 && c.owca <= 5, `owiec ${c.owca}`);
      assert.ok(c.olej >= 2 && c.olej <= 4, `olej ${c.olej}`);
      for (const it of d) assert.ok(goodIds.has(it), `nieznany towar ${it}`);
      assert.equal(c.owca + c.jeczmien + c.olej + c.ryba, 12);
    });
  }
});

/* --- B) countGoods + judgeWarehouse ------------------------------------------- */

const ITEMS = [
  ...Array(4).fill('owca'),
  ...Array(3).fill('olej'),
  ...Array(3).fill('jeczmien'),
  ...Array(2).fill('ryba'),
];
const FULL_TALLY = { owca: 4, jeczmien: 3, olej: 3, ryba: 2 };

group('B) magazyn: liczenie i sędzia', () => {
  t('countGoods liczy poprawnie', () => {
    assert.deepEqual(P.countGoods(ITEMS), FULL_TALLY);
  });
  t('judgeWarehouse: dobre odpowiedzi → ok true', () => {
    assert.equal(P.judgeWarehouse(ITEMS, { owca: 4, olej: 3 }, null).ok, true);
  });
  t('judgeWarehouse: dobre odpowiedzi → 2 linie', () => {
    assert.equal(P.judgeWarehouse(ITEMS, { owca: 4, olej: 3 }, null).lines.length, 2);
  });
  t('judgeWarehouse: zła odpowiedź bez tabliczki → ok false', () => {
    assert.equal(P.judgeWarehouse(ITEMS, { owca: 1, olej: 3 }, null).ok, false);
  });
  t('judgeWarehouse: bez tabliczki linia zawiera „przyszło”', () => {
    const r = P.judgeWarehouse(ITEMS, { owca: 1, olej: 3 }, null);
    assert.ok(r.lines[0].includes('przyszło'), r.lines[0]);
  });
  t('judgeWarehouse: na tabliczce brakuje kreski → „bez znaku”', () => {
    const r = P.judgeWarehouse(ITEMS, { owca: 1, olej: 3 }, { ...FULL_TALLY, owca: 2 });
    assert.equal(r.ok, false);
    assert.ok(r.lines[0].includes('bez znaku'), r.lines[0]);
  });
  t('judgeWarehouse: za dużo kresek → „za dużo”', () => {
    const r = P.judgeWarehouse(ITEMS, { owca: 1, olej: 3 }, { ...FULL_TALLY, owca: 6 });
    assert.equal(r.ok, false);
    assert.ok(r.lines[0].includes('za dużo'), r.lines[0]);
  });
  t('judgeWarehouse: tabliczka dobra, odpowiedź zła → „Policz kreski”', () => {
    const r = P.judgeWarehouse(ITEMS, { owca: 1, olej: 3 }, FULL_TALLY);
    assert.equal(r.ok, false);
    assert.ok(r.lines[0].includes('Policz kreski'), r.lines[0]);
  });
});

/* --- C) kliny ----------------------------------------------------------------- */

group('C) tabliczka: pociągnięcie i sędzia', () => {
  t("strokeToWedge(0, 30) → 'pionowy'", () => {
    assert.equal(P.strokeToWedge(0, 30), 'pionowy');
  });
  t("strokeToWedge(30, 0) → 'katowy'", () => {
    assert.equal(P.strokeToWedge(30, 0), 'katowy');
  });
  t("strokeToWedge(-30, 5) → 'katowy'", () => {
    assert.equal(P.strokeToWedge(-30, 5), 'katowy');
  });
  t('strokeToWedge(0, -30) → null (w górę)', () => {
    assert.equal(P.strokeToWedge(0, -30), null);
  });
  t('strokeToWedge(3, 3) → null (za krótkie)', () => {
    assert.equal(P.strokeToWedge(3, 3), null);
  });
  t('wedgeValue: 2 × katowy + 3 × pionowy = 23', () => {
    assert.equal(
      P.wedgeValue([
        { kind: 'katowy', x: 0, y: 0 },
        { kind: 'katowy', x: 0, y: 0 },
        { kind: 'pionowy', x: 0, y: 0 },
        { kind: 'pionowy', x: 0, y: 0 },
        { kind: 'pionowy', x: 0, y: 0 },
      ]),
      23,
    );
  });
});

const GOOD_23 = [
  { kind: 'katowy', x: 110, y: 100 },
  { kind: 'katowy', x: 130, y: 100 },
  { kind: 'pionowy', x: 160, y: 100 },
  { kind: 'pionowy', x: 175, y: 100 },
  { kind: 'pionowy', x: 190, y: 100 },
];

group('D) tabliczka: 23 i kolejność', () => {
  t('judgeTablet(23): dwa kątowe + trzy pionowe → ok', () => {
    assert.equal(P.judgeTablet(GOOD_23, 23).ok, true);
  });
  t('judgeTablet: kątowy po prawej od jedności → ok false', () => {
    const mixed = [
      { kind: 'katowy', x: 130, y: 100 },
      { kind: 'katowy', x: 200, y: 100 },
      { kind: 'pionowy', x: 160, y: 100 },
      { kind: 'pionowy', x: 175, y: 100 },
      { kind: 'pionowy', x: 190, y: 100 },
    ];
    assert.equal(P.judgeTablet(mixed, 23).ok, false);
  });
  t('judgeTablet: pomieszane kliny — tekst zawiera „po lewej”', () => {
    const mixed = [
      { kind: 'katowy', x: 130, y: 100 },
      { kind: 'katowy', x: 200, y: 100 },
      { kind: 'pionowy', x: 160, y: 100 },
      { kind: 'pionowy', x: 175, y: 100 },
      { kind: 'pionowy', x: 190, y: 100 },
    ];
    assert.ok(P.judgeTablet(mixed, 23).text.includes('po lewej'), P.judgeTablet(mixed, 23).text);
  });
  t('judgeTablet: 24 zamiast 23 → ok false', () => {
    const off = [...GOOD_23, { kind: 'pionowy', x: 205, y: 100 }];
    assert.equal(P.judgeTablet(off, 23).ok, false);
  });
  t('judgeTablet: 24 zamiast 23 — tekst zawiera „stoi 24”', () => {
    const off = [...GOOD_23, { kind: 'pionowy', x: 205, y: 100 }];
    assert.ok(P.judgeTablet(off, 23).text.includes('stoi 24'), P.judgeTablet(off, 23).text);
  });
  t('judgeTablet: pusta tabliczka → ok false', () => {
    assert.equal(P.judgeTablet([], 23).ok, false);
  });
  t('judgeTablet: 4 (same jedności) → ok', () => {
    const four = [
      { kind: 'pionowy', x: 160, y: 100 },
      { kind: 'pionowy', x: 175, y: 100 },
      { kind: 'pionowy', x: 190, y: 100 },
      { kind: 'pionowy', x: 205, y: 100 },
    ];
    assert.equal(P.judgeTablet(four, 4).ok, true);
  });
});

/* --- E) spółgłoski, fenicki, grecki -------------------------------------------- */

group('E) spółgłoski, fenicki, grecki', () => {
  t("toConsonants('Zuzanna') === 'ZZNN'", () => {
    assert.equal(P.toConsonants('Zuzanna'), 'ZZNN');
  });
  t("toConsonants('kot') === 'KT'", () => {
    assert.equal(P.toConsonants('kot'), 'KT');
  });
  t('toConsonants wycina spacje i cyfry', () => {
    assert.equal(P.toConsonants('a b2'), 'B');
  });
  t("toPhoenician('kot') ma 2 znaki kodowe", () => {
    assert.equal([...P.toPhoenician('kot')].length, 2);
  });
  t("toPhoenician('kot') zaczyna się od U+1090A", () => {
    assert.ok(P.toPhoenician('kot').startsWith('𐤊'), P.toPhoenician('kot'));
  });
  t("toPhoenician('szal') → U+10914 potem U+1090B (dwuznak sz)", () => {
    assert.equal(P.toPhoenician('szal'), '𐤔𐤋');
  });
  t("toPhoenician('ala') → samo U+1090B (jeden znak)", () => {
    assert.equal(P.toPhoenician('ala'), '𐤋');
  });
  t("toGreek('kot') === 'κοτ'", () => {
    assert.equal(P.toGreek('kot'), 'κοτ');
  });
  t("toGreek('las') kończy się na 'ς'", () => {
    assert.ok(P.toGreek('las').endsWith('ς'), P.toGreek('las'));
  });
});

/* --- F) szkielety ---------------------------------------------------------------- */

group('F) szkielety samogłoskowe', () => {
  for (const s of P.SKELETONS) {
    t(`szkielet '${s.id}' ma ≥ WORDS_NEEDED (${P.WORDS_NEEDED}) słów`, () => {
      assert.ok(Object.keys(s.words).length >= P.WORDS_NEEDED, Object.keys(s.words).join(','));
    });
    for (const word of Object.keys(s.words)) {
      t(`szkielet '${s.id}': słowo '${word}' = before + samogłoska + after`, () => {
        const mid = word.slice(s.before.length, word.length - s.after.length);
        assert.equal(s.before.toLowerCase() + mid + s.after.toLowerCase(), word);
        assert.equal(mid.length, 1, `środek '${mid}'`);
        assert.ok(P.VOWEL_TILES.includes(mid), `środek '${mid}' nie jest kafelikiem`);
        assert.equal(word, word.toLowerCase());
      });
    }
  }
});

/* --- G) alef ---------------------------------------------------------------------- */

group('G) z głowy wołu litera A', () => {
  t('ALEF_STAGES: 4 etapy', () => {
    assert.equal(P.ALEF_STAGES.length, 4);
  });
  t('ALEF_STAGES: lata rosnące', () => {
    const years = P.ALEF_STAGES.map((s) => s.year);
    const sorted = [...years].sort((a, b) => a - b);
    assert.deepEqual(years, sorted);
  });
  t("ALEF_STAGES: ostatni glyph to 'A'", () => {
    assert.equal(P.ALEF_STAGES[P.ALEF_STAGES.length - 1].glyph, 'A');
  });
  t('snaps(-80, -90) → true', () => {
    assert.equal(P.snaps(-80, -90), true);
  });
  t('snaps(-70, -90) → false', () => {
    assert.equal(P.snaps(-70, -90), false);
  });
  t('ALEF_TURN ma długość 3', () => {
    assert.equal(P.ALEF_TURN.length, 3);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}
