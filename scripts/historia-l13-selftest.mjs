/**
 * Selftest czystych funkcji L13 (`slady-historii-w-okolicy`: miasteczko, wies, spichlerz, panorama).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l12-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l13-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l13-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as M from '${root}/src/app/historia/klasa-4/components/lessons/slady-historii-w-okolicy/miasteczko';\n` +
    `export * as W from '${root}/src/app/historia/klasa-4/components/lessons/slady-historii-w-okolicy/wies';\n` +
    `export * as S from '${root}/src/app/historia/klasa-4/components/lessons/slady-historii-w-okolicy/spichlerz';\n` +
    `export * as P from '${root}/src/app/historia/klasa-4/components/lessons/slady-historii-w-okolicy/panorama';\n`
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

const { M, W, S, P } = lib;

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

/* --- A) miasteczko: dane i centuryOf ---------------------------------------- */

group('A) miasteczko: dane i centuryOf', () => {
  t('CENTURIES to wieki 13–21', () => {
    assert.deepEqual([...M.CENTURIES], [13, 14, 15, 16, 17, 18, 19, 20, 21]);
  });
  t('TRACES ma 7 tropów', () => {
    assert.equal(M.TRACES.length, 7);
  });
  t('id tropów są unikalne', () => {
    const ids = M.TRACES.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length);
  });
  t('każdy trop wskazuje regułę z RULES', () => {
    for (const x of M.TRACES) {
      assert.ok(M.RULES[x.rule] !== undefined, `'${x.id}' → '${x.rule}' spoza RULES`);
    }
  });
  t('getTrace zwraca trop o danym id', () => {
    for (const x of M.TRACES) {
      assert.equal(M.getTrace(x.id).id, x.id);
    }
  });
  t('dokładnie 3 tropy whatOnly (zamkowa, mlynska, garbarska)', () => {
    assert.deepEqual(
      M.TRACES.filter((x) => x.whatOnly).map((x) => x.id),
      ['zamkowa', 'mlynska', 'garbarska']
    );
  });
  t('centuryOf(1710) === 18', () => {
    assert.equal(M.centuryOf(1710), 18);
  });
  t('centuryOf(1885) === 19', () => {
    assert.equal(M.centuryOf(1885), 19);
  });
  t('centuryOf(1940) === 20', () => {
    assert.equal(M.centuryOf(1940), 20);
  });
  t('centuryOf(1900) === 19 (reguła kciuka: końcówka 00)', () => {
    assert.equal(M.centuryOf(1900), 19);
  });
  t('centuryOf(1901) === 20', () => {
    assert.equal(M.centuryOf(1901), 20);
  });
  t('centuryOf(2000) === 20', () => {
    assert.equal(M.centuryOf(2000), 20);
  });
  t('centuryOf(2001) === 21', () => {
    assert.equal(M.centuryOf(2001), 21);
  });
});

/* --- B) miasteczko: judgePlace ------------------------------------------------ */

const WHAT_ONLY = M.TRACES.filter((x) => x.whatOnly);

group('B) judgePlace: tropy whatOnly tylko na półkę', () => {
  for (const x of WHAT_ONLY) {
    t(`'${x.id}' na 'co' → ok true`, () => {
      assert.equal(M.judgePlace(x, 'co').ok, true);
    });
    for (const c of M.CENTURIES) {
      t(`'${x.id}' na wiek ${c} → ok false i notatka z 'KIEDY'`, () => {
        const v = M.judgePlace(x, c);
        assert.equal(v.ok, false);
        assert.ok(v.note.includes('KIEDY'), v.note);
      });
    }
  }
});

group('C) judgePlace: kolumna, dworzec, mural, rynek', () => {
  const kolumna = M.getTrace('kolumna');
  t("kolumna na 18 → ok true (1710 → XVIII)", () => {
    assert.equal(M.judgePlace(kolumna, 18).ok, true);
  });
  for (const c of M.CENTURIES) {
    if (c === 18) continue;
    t(`kolumna na ${c} → ok false`, () => {
      assert.equal(M.judgePlace(kolumna, c).ok, false);
    });
  }
  t("kolumna na 'co' → ok false i notatka z 'KIEDY'", () => {
    const v = M.judgePlace(kolumna, 'co');
    assert.equal(v.ok, false);
    assert.ok(v.note.includes('KIEDY'), v.note);
  });

  const dworzec = M.getTrace('dworzec');
  t("dworzec na 19 → ok true (1885 → XIX)", () => {
    assert.equal(M.judgePlace(dworzec, 19).ok, true);
  });
  for (const c of M.CENTURIES) {
    if (c === 19) continue;
    t(`dworzec na ${c} → ok false`, () => {
      assert.equal(M.judgePlace(dworzec, c).ok, false);
    });
  }
  t("dworzec na 'co' → ok false i notatka z 'KIEDY'", () => {
    const v = M.judgePlace(dworzec, 'co');
    assert.equal(v.ok, false);
    assert.ok(v.note.includes('KIEDY'), v.note);
  });

  const mural = M.getTrace('mural');
  t("mural na 20 → ok true (opowiada o 1940)", () => {
    assert.equal(M.judgePlace(mural, 20).ok, true);
  });
  t("mural na 21 → ok false i notatka z 'Mural jest nowy'", () => {
    const v = M.judgePlace(mural, 21);
    assert.equal(v.ok, false);
    assert.ok(v.note.includes('Mural jest nowy'), v.note);
  });
  for (const c of M.CENTURIES) {
    if (c === 20 || c === 21) continue;
    t(`mural na ${c} → ok false`, () => {
      assert.equal(M.judgePlace(mural, c).ok, false);
    });
  }
  t("mural na 'co' → ok false i notatka z 'KIEDY'", () => {
    const v = M.judgePlace(mural, 'co');
    assert.equal(v.ok, false);
    assert.ok(v.note.includes('KIEDY'), v.note);
  });

  const rynek = M.getTrace('rynek');
  t("rynek na 13 → ok true", () => {
    assert.equal(M.judgePlace(rynek, 13).ok, true);
  });
  t("rynek na 14 → ok true", () => {
    assert.equal(M.judgePlace(rynek, 14).ok, true);
  });
  for (const c of [15, 16, 17, 18, 19, 20, 21]) {
    t(`rynek na ${c} → ok false i notatka o XIII/XIV`, () => {
      const v = M.judgePlace(rynek, c);
      assert.equal(v.ok, false);
      assert.ok(v.note.includes('XIII'), v.note);
    });
  }
  t("rynek na 'co' → ok false", () => {
    assert.equal(M.judgePlace(rynek, 'co').ok, false);
  });
});

/* --- D) miasteczko: allPlaced i earnedRules ----------------------------------- */

const GOOD_TOWN = {
  rynek: 13,
  zamkowa: 'co',
  mlynska: 'co',
  garbarska: 'co',
  kolumna: 18,
  dworzec: 19,
  mural: 20,
};

group('D) miasteczko: allPlaced i earnedRules', () => {
  t('allPlaced({}) === false', () => {
    assert.equal(M.allPlaced({}), false);
  });
  t('allPlaced(poprawny komplet) === true', () => {
    assert.equal(M.allPlaced(GOOD_TOWN), true);
  });
  t('allPlaced z jednym złym (kolumna na 19) === false', () => {
    assert.equal(M.allPlaced({ ...GOOD_TOWN, kolumna: 19 }), false);
  });
  t('earnedRules(komplet) to 6 unikalnych reguł w kolejności tropów', () => {
    assert.deepEqual(M.earnedRules(GOOD_TOWN), [
      'ksztalt',
      'nazwa-budowla',
      'nazwa-zawod',
      'data',
      'budynek',
      'pamiec',
    ]);
  });
  t('earnedRules({}) to []', () => {
    assert.deepEqual(M.earnedRules({}), []);
  });
});

/* --- E) wieś: answerOk --------------------------------------------------------- */

const WABIKS = W.VILLAGE.filter((v) => !v.tells);
const ACCEPT = {
  wiek: ['kosciol'],
  praca: ['kowalska', 'mlyn'],
  zniklo: ['kowalska'],
  pamiec: ['szkola'],
  nieszczescie: ['kapliczka'],
};

group('E) wieś: answerOk', () => {
  t('VILLAGE ma 12 obiektów, id unikalne', () => {
    assert.equal(W.VILLAGE.length, 12);
    assert.equal(new Set(W.VILLAGE.map((v) => v.id)).size, 12);
  });
  t('wabiki to przystanek, boisko, sklep, nowy-dom', () => {
    assert.deepEqual(WABIKS.map((v) => v.id), ['przystanek', 'boisko', 'sklep', 'nowy-dom']);
  });
  t('OLDEST_YEAR === 1712', () => assert.equal(W.OLDEST_YEAR, 1712));
  t('5 pytań', () => assert.equal(W.QUESTIONS.length, 5));
  for (const q of W.QUESTIONS) {
    for (const v of W.VILLAGE) {
      const want = ACCEPT[q.id].includes(v.id);
      t(`answerOk('${q.id}', '${v.id}') === ${want}`, () => assert.equal(W.answerOk(q.id, v.id), want));
      if (!want)
        t(`whyNot('${q.id}', '${v.id}') niepuste`, () => assert.ok(W.whyNot(q.id, v.id).length > 10));
    }
  }
  t("whyNot('wiek','kapliczka') wspomina rok 1855 i starszą datę", () => {
    const s = W.whyNot('wiek', 'kapliczka');
    assert.ok(s.includes('1855') && s.includes('starsza'));
  });
  t("whyNot('zniklo','dworska') mówi, że dworek stoi", () => assert.ok(W.whyNot('zniklo', 'dworska').includes('stoi')));
});

/* --- F) wieś: judgeVillage ------------------------------------------------------- */

const GOOD_VILLAGE = { wiek: 'kosciol', praca: 'mlyn', zniklo: 'kowalska', pamiec: 'szkola', nieszczescie: 'kapliczka' };

group('F) wieś: judgeVillage', () => {
  t('judgeVillage({}): wszystkie ok=false', () => {
    const v = W.judgeVillage({});
    for (const q of W.QUESTIONS) assert.equal(v[q.id].ok, false);
  });
  t('dobry zestaw: wszystkie ok=true', () => {
    const v = W.judgeVillage(GOOD_VILLAGE);
    for (const q of W.QUESTIONS) assert.equal(v[q.id].ok, true, q.id);
  });
  t('praca: kowalska też dobra', () => assert.equal(W.judgeVillage({ ...GOOD_VILLAGE, praca: 'kowalska' }).praca.ok, true));
  t('wiek: cmentarz (1831) zły, notatka z rokiem', () => {
    const v = W.judgeVillage({ ...GOOD_VILLAGE, wiek: 'cmentarz' }).wiek;
    assert.equal(v.ok, false);
    assert.ok(v.note.includes('1831'));
  });
  t('pamiec: boisko → notatka wabika', () => {
    const v = W.judgeVillage({ ...GOOD_VILLAGE, pamiec: 'boisko' }).pamiec;
    assert.equal(v.ok, false);
    assert.ok(v.note.includes('Boisko'));
  });
  t('kryteria TaskShell = id pytań', () => {
    assert.deepEqual(Object.keys(W.judgeVillage({})), W.QUESTIONS.map((q) => q.id));
  });
});

/* --- G) spichlerz: stageOf i CAPTIONS ---------------------------------------------- */

group('G) spichlerz: stageOf i CAPTIONS', () => {
  t('stageOf(2026) === 0', () => {
    assert.equal(S.stageOf(2026), 0);
  });
  t('stageOf(2027) === 0', () => {
    assert.equal(S.stageOf(2027), 0);
  });
  t('stageOf(2028) === 1', () => {
    assert.equal(S.stageOf(2028), 1);
  });
  t('stageOf(2039) === 2', () => {
    assert.equal(S.stageOf(2039), 2);
  });
  t('stageOf(2040) === 3', () => {
    assert.equal(S.stageOf(2040), 3);
  });
  t('stageOf(2046) === 4', () => {
    assert.equal(S.stageOf(2046), 4);
  });
  t('stageOf(2032) === 2', () => {
    assert.equal(S.stageOf(2032), 2);
  });
  t('stageOf(2050) === 4', () => {
    assert.equal(S.stageOf(2050), 4);
  });
  t('CAPTIONS.parking ma YEARS.length elementów', () => {
    assert.equal(S.CAPTIONS.parking.length, S.YEARS.length);
  });
  t('CAPTIONS.spichlerz ma YEARS.length elementów', () => {
    assert.equal(S.CAPTIONS.spichlerz.length, S.YEARS.length);
  });
  t('wszystkie podpisy parkingu są niepuste', () => {
    for (const c of S.CAPTIONS.parking) assert.ok(c.length > 0);
  });
  t('wszystkie podpisy spichlerza są niepuste', () => {
    for (const c of S.CAPTIONS.spichlerz) assert.ok(c.length > 0);
  });
});

/* --- H) panorama ------------------------------------------------------------------- */

group('H) panorama', () => {
  t('FORM_COUNT === 4', () => {
    assert.equal(P.FORM_COUNT, 4);
  });
  t('każda forma (tablica, ulica, pomnik, mural) występuje dokładnie raz', () => {
    for (const f of Object.keys(P.FORMS)) {
      assert.equal(
        P.THINGS.filter((x) => x.form === f).length,
        1,
        `forma '${f}'`
      );
    }
  });
  t('wabiki (form null) to 4 rzeczy', () => {
    assert.equal(P.THINGS.filter((x) => x.form === null).length, 4);
  });
  t('id w THINGS są unikalne', () => {
    const ids = P.THINGS.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length);
  });
  t('clampPan(-10, 600) === 0', () => {
    assert.equal(P.clampPan(-10, 600), 0);
  });
  t('clampPan(5000, 600) === PANORAMA_W - 600', () => {
    assert.equal(P.clampPan(5000, 600), P.PANORAMA_W - 600);
  });
  t('clampPan(100, 600) === 100 (środek bez zmian)', () => {
    assert.equal(P.clampPan(100, 600), 100);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}
