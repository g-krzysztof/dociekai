/**
 * Selftest czystych funkcji L14 (`legendy-prawda-i-fikcja`: legendy, kosci,
 * gluchy-telefon, przepis; plus pinezka legendy w timeline).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l13-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l14-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l14-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as L from '${root}/src/app/historia/klasa-4/components/lessons/legendy-prawda-i-fikcja/legendy';\n` +
    `export * as K from '${root}/src/app/historia/klasa-4/components/lessons/legendy-prawda-i-fikcja/kosci';\n` +
    `export * as G from '${root}/src/app/historia/klasa-4/components/lessons/legendy-prawda-i-fikcja/gluchy-telefon';\n` +
    `export * as R from '${root}/src/app/historia/klasa-4/components/lessons/legendy-prawda-i-fikcja/przepis';\n` +
    `export * as P from '${root}/src/app/historia/klasa-4/lib/timeline/pins';\n` +
    `export * as A from '${root}/src/app/historia/klasa-4/lib/timeline/axis-model';\n`
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

const { L, K, G, R, P, A } = lib;

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

/** Poprawne zakreślenia z szuflad: 'niewiadomo' przyjmujemy w obu kolorach. */
function correctMarks(legend, unknownAs) {
  const marks = {};
  for (const f of legend.fragments) {
    const ev = L.evidenceFor(legend, f.id);
    if (!ev) throw new Error(`fragment '${f.id}' bez szuflady`);
    marks[f.id] =
      ev.result === 'jest' ? 'sprawdzalne' : ev.result === 'brak' ? 'zmyslone' : unknownAs;
  }
  return marks;
}

const bone = (id) => K.BONES.find((b) => b.id === id);
const animal = (id) => K.ANIMALS.find((a) => a.id === id);

/* --- A) legendy: każdy fragment ma szufladę ---------------------------------- */

group('A) legendy: fragmentsWithoutEvidence', () => {
  t('fragmentsWithoutEvidence(SMOK) puste', () => {
    assert.deepEqual(L.fragmentsWithoutEvidence(L.SMOK), []);
  });
  t('fragmentsWithoutEvidence(LECH) puste', () => {
    assert.deepEqual(L.fragmentsWithoutEvidence(L.LECH), []);
  });
});

/* --- B) legendy: poprawne zakreślenia ---------------------------------------- */

group('B) legendy: poprawne zakreślenia z evidenceFor', () => {
  for (const legend of [L.SMOK, L.LECH]) {
    t(`judgeMarks(${legend.id}, niewiadomo→sprawdzalne) ok=true`, () => {
      assert.equal(L.judgeMarks(legend, correctMarks(legend, 'sprawdzalne')).ok, true);
    });
    t(`judgeMarks(${legend.id}, niewiadomo→zmyslone) ok=true`, () => {
      assert.equal(L.judgeMarks(legend, correctMarks(legend, 'zmyslone')).ok, true);
    });
  }
});

/* --- C) legendy: pomyłki i brak koloru --------------------------------------- */

group('C) legendy: pomyłki i brak koloru', () => {
  t("s4 na 'sprawdzalne' → ok=false, wrong ma 's4' z niepustą notatką", () => {
    const v = L.judgeMarks(L.SMOK, { ...correctMarks(L.SMOK, 'sprawdzalne'), s4: 'sprawdzalne' });
    assert.equal(v.ok, false);
    assert.ok(v.wrong.some((w) => w.id === 's4'), JSON.stringify(v.wrong.map((w) => w.id)));
    assert.ok(v.wrong[0].note.length > 0);
  });
  t("s1 na 'zmyslone' → wrong zawiera 's1'", () => {
    const v = L.judgeMarks(L.SMOK, { ...correctMarks(L.SMOK, 'sprawdzalne'), s1: 'zmyslone' });
    assert.equal(v.ok, false);
    assert.ok(v.wrong.some((w) => w.id === 's1'), JSON.stringify(v.wrong.map((w) => w.id)));
  });
  t('bez zakreślenia l1 → unmarked === 1, ok=false', () => {
    const marks = correctMarks(L.LECH, 'sprawdzalne');
    delete marks.l1;
    const v = L.judgeMarks(L.LECH, marks);
    assert.equal(v.ok, false);
    assert.equal(v.unmarked, 1);
  });
});

/* --- D) legendy: stemple otwartej szuflady ----------------------------------- */

group('D) legendy: stampsFor', () => {
  t("stampsFor(SMOK, ['jaskinia']) ma s3 i s9 = 'jest', bez s4", () => {
    const s = L.stampsFor(L.SMOK, ['jaskinia']);
    assert.equal(s.s3, 'jest');
    assert.equal(s.s9, 'jest');
    assert.ok(!('s4' in s), JSON.stringify(s));
  });
});

/* --- E) kości: dopasowanie i sędzia ------------------------------------------ */

group('E) kosci: fittingAnimals', () => {
  t("fittingAnimals(żebro) === ['wieloryb']", () => {
    assert.deepEqual(K.fittingAnimals(bone('zebro')), ['wieloryb']);
  });
  t("fittingAnimals(noga) === ['mamut']", () => {
    assert.deepEqual(K.fittingAnimals(bone('noga')), ['mamut']);
  });
  t("fittingAnimals(czaszka) === ['nosorozec']", () => {
    assert.deepEqual(K.fittingAnimals(bone('czaszka')), ['nosorozec']);
  });
});

group('F) kosci: judgeFit', () => {
  t('judgeFit(noga, wieloryb) → ok=false, kind brak-kosci', () => {
    const v = K.judgeFit(bone('noga'), animal('wieloryb'));
    assert.equal(v.ok, false);
    assert.equal(v.kind, 'brak-kosci');
  });
  t('judgeFit(czaszka, krowa) → kind ksztalt', () => {
    const v = K.judgeFit(bone('czaszka'), animal('krowa'));
    assert.equal(v.ok, false);
    assert.equal(v.kind, 'ksztalt');
  });
  t("judgeFit(noga, kon) → kind dlugosc, why z '1,1 m' i '0,45 m'", () => {
    const v = K.judgeFit(bone('noga'), animal('kon'));
    assert.equal(v.ok, false);
    assert.equal(v.kind, 'dlugosc');
    assert.ok(v.why.includes('1,1 m') && v.why.includes('0,45 m'), v.why);
  });
});

/* --- G) głuchy telefon: nowości wynikają z porównania tekstów ---------------- */

group('G) gluchy-telefon: newChunks', () => {
  t('newChunks(0) puste', () => {
    assert.deepEqual(G.newChunks(0), []);
  });
  for (let g = 1; g < G.GENERATIONS.length; g += 1) {
    t(`newChunks(${g}) niepuste; wskazane nowe, niewskazane stare`, () => {
      const fresh = G.newChunks(g);
      assert.ok(fresh.length > 0, 'puste nowości');
      const prev = new Set(G.GENERATIONS[g - 1].chunks);
      const freshSet = new Set(fresh);
      G.GENERATIONS[g].chunks.forEach((c, i) => {
        if (freshSet.has(i)) assert.ok(!prev.has(c), `kawałek ${i} był już wcześniej`);
        else assert.ok(prev.has(c), `kawałek ${i} oznaczony jako nowy, a był wcześniej`);
      });
    });
  }
});

group('H) gluchy-telefon: kamienie w każdej wersji', () => {
  for (const s of G.STONES) {
    for (let g = 0; g < G.GENERATIONS.length; g += 1) {
      t(`hasStem(${g}, '${s.stem}') === true`, () => {
        assert.equal(G.hasStem(g, s.stem), true);
      });
    }
  }
});

group('I) gluchy-telefon: judgeDiff', () => {
  for (let g = 1; g < G.GENERATIONS.length; g += 1) {
    t(`judgeDiff(${g}, newChunks) ok=true`, () => {
      assert.equal(G.judgeDiff(g, G.newChunks(g)).ok, true);
    });
    t(`judgeDiff(${g}, +niezmieniony) → notNew zawiera go`, () => {
      const fresh = G.newChunks(g);
      const unchanged = G.GENERATIONS[g].chunks.findIndex((_, i) => !fresh.includes(i));
      assert.ok(unchanged >= 0, 'brak niezmienionego kawałka');
      const v = G.judgeDiff(g, [...fresh, unchanged]);
      assert.equal(v.ok, false);
      assert.ok(v.notNew.includes(unchanged), JSON.stringify(v.notNew));
    });
    t(`judgeDiff(${g}, bez jednej nowości) → missed === 1`, () => {
      const v = G.judgeDiff(g, G.newChunks(g).slice(1));
      assert.equal(v.ok, false);
      assert.equal(v.missed, 1);
    });
  }
});

/* --- J) przepis: zwój z kafelków --------------------------------------------- */

const GOOD_SCROLL = { l1: 'dab', l2: 'kasia', l3: 'diabel', l4: 'nazwa', imie: 'imie-kasia' };

group('J) przepis: dobry zwój', () => {
  t('kamien ok', () => assert.equal(R.judgeRecipe(GOOD_SCROLL).kamien.ok, true));
  t('bohater ok', () => assert.equal(R.judgeRecipe(GOOD_SCROLL).bohater.ok, true));
  t('cud ok', () => assert.equal(R.judgeRecipe(GOOD_SCROLL).cud.ok, true));
  t('koniec ok', () => assert.equal(R.judgeRecipe(GOOD_SCROLL).koniec.ok, true));
  t("placeName === 'Dąb Kasi'", () => assert.equal(R.placeName(GOOD_SCROLL), 'Dąb Kasi'));
  t("legendText zawiera '„Dąb Kasi”'", () => {
    assert.ok(R.legendText(GOOD_SCROLL).includes('„Dąb Kasi”'), R.legendText(GOOD_SCROLL));
  });
});

group('K) przepis: nazwa musi wynikać z opowieści', () => {
  t("imie z cudu spoza legendy → koniec false, reszta ok", () => {
    const v = R.judgeRecipe({ ...GOOD_SCROLL, imie: 'imie-ptak' });
    assert.equal(v.koniec.ok, false);
    assert.equal(v.kamien.ok, true);
    assert.equal(v.bohater.ok, true);
    assert.equal(v.cud.ok, true);
  });
});

group('L) przepis: złe kafelki i pusty zwój', () => {
  t("l1:'palac' → kamien false", () => {
    assert.equal(R.judgeRecipe({ ...GOOD_SCROLL, l1: 'palac' }).kamien.ok, false);
  });
  t("l4:'szczesliwie' → koniec false", () => {
    assert.equal(R.judgeRecipe({ ...GOOD_SCROLL, l4: 'szczesliwie' }).koniec.ok, false);
  });
  t("l2:'diabel' (cud zamiast bohatera) → bohater false", () => {
    assert.equal(R.judgeRecipe({ ...GOOD_SCROLL, l2: 'diabel' }).bohater.ok, false);
  });
  t('pusty scroll {} → wszystkie false', () => {
    const v = R.judgeRecipe({});
    assert.equal(v.kamien.ok, false);
    assert.equal(v.bohater.ok, false);
    assert.equal(v.cud.ok, false);
    assert.equal(v.koniec.ok, false);
  });
});

group('M) przepis: kafelki', () => {
  t('id kafelków w ALL_TILES są unikalne', () => {
    const ids = R.ALL_TILES.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length);
  });
  t('NAMES ma tyle elementów co HEROES + WONDERS', () => {
    assert.equal(R.NAMES.length, R.HEROES.length + R.WONDERS.length);
  });
});

/* --- N) timeline: pinezka legendy -------------------------------------------- */

group('N) timeline: pinezka lech', () => {
  t("CORE_PINS ma pinezkę 'lech' z polem mist", () => {
    const pin = P.CORE_PINS.find((p) => p.id === 'lech');
    assert.ok(pin !== undefined);
    assert.ok(pin.mist !== undefined);
  });
  t("toAxisPin(lech, 'piramidy', 2026) ma variant 'legend'", () => {
    const pin = P.CORE_PINS.find((p) => p.id === 'lech');
    assert.equal(A.toAxisPin(pin, 'piramidy', 2026).variant, 'legend');
  });
  t("toAxisPin(lech, 'piramidy', 2026) when === 'czas legendy — przed 966'", () => {
    const pin = P.CORE_PINS.find((p) => p.id === 'lech');
    assert.equal(A.toAxisPin(pin, 'piramidy', 2026).when, 'czas legendy — przed 966');
  });
  t('mgła lecha: mist.fromU < mist.toU', () => {
    const pin = P.CORE_PINS.find((p) => p.id === 'lech');
    const axis = A.toAxisPin(pin, 'piramidy', 2026);
    assert.ok(axis.mist.fromU < axis.mist.toU, JSON.stringify(axis.mist));
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}
