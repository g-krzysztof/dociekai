/**
 * Selftest czystych funkcji L26 (`od-wioski-do-imperium`: legenda + ustroje + imperium + zolw).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l25-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l26-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l26-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as Lg from '${root}/src/app/historia/klasa-4/components/lessons/od-wioski-do-imperium/legenda';\n` +
    `export * as Us from '${root}/src/app/historia/klasa-4/components/lessons/od-wioski-do-imperium/ustroje';\n` +
    `export * as Im from '${root}/src/app/historia/klasa-4/components/lessons/od-wioski-do-imperium/imperium';\n` +
    `export * as Geo from '${root}/src/app/historia/klasa-4/components/lessons/od-wioski-do-imperium/geo-imperium';\n` +
    `export * as Zw from '${root}/src/app/historia/klasa-4/components/lessons/od-wioski-do-imperium/zolw';\n`,
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

const { Lg, Us, Im, Geo, Zw } = lib;

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

/* --- A) legenda ----------------------------------------------------------------- */

const ALL_TRUTH = Object.fromEntries(Lg.LEGENDA.map((s) => [s.id, s.truth]));

group('A) legenda', () => {
  t('odpowiedzi równe truth -> agree == total', () => {
    const r = Lg.scoreMarks({ ...ALL_TRUTH });
    assert.equal(r.agree, r.total);
    assert.equal(r.total, Lg.LEGENDA.length);
  });
  t('odpowiedzi równe truth -> wrong pusty', () => {
    assert.deepEqual(Lg.scoreMarks({ ...ALL_TRUTH }).wrong, []);
  });
  t('puste znaczniki -> agree 0', () => {
    assert.equal(Lg.scoreMarks({}).agree, 0);
  });
  t('puste znaczniki -> wrong.length == total', () => {
    const r = Lg.scoreMarks({});
    assert.equal(r.wrong.length, r.total);
  });
  t('jedna zmiana -> wrong.length 1', () => {
    const first = Lg.LEGENDA[0];
    const flipped = first.truth === 'sprawdzic' ? 'legenda' : 'sprawdzic';
    const r = Lg.scoreMarks({ ...ALL_TRUTH, [first.id]: flipped });
    assert.equal(r.wrong.length, 1);
    assert.equal(r.wrong[0].id, first.id);
  });
  t('jedna zmiana -> agree == total - 1', () => {
    const first = Lg.LEGENDA[0];
    const flipped = first.truth === 'sprawdzic' ? 'legenda' : 'sprawdzic';
    const r = Lg.scoreMarks({ ...ALL_TRUTH, [first.id]: flipped });
    assert.equal(r.agree, r.total - 1);
  });
  t("jest co najmniej jedno zdanie 'sprawdzic' i jedno 'legenda'", () => {
    const truths = Lg.LEGENDA.map((s) => s.truth);
    assert.ok(truths.includes('sprawdzic'), 'brak zdania sprawdzalnego');
    assert.ok(truths.includes('legenda'), 'brak zdania-legenda');
  });
  t('id zdań unikalne', () => {
    const ids = Lg.LEGENDA.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

/* --- B) ustroje ----------------------------------------------------------------- */

group('B) ustroje', () => {
  t('REGIMES ma 3 ustroje', () => {
    assert.equal(Us.REGIMES.length, 3);
  });
  for (const r of Us.REGIMES) {
    t(`${r.id}: 3 węzły`, () => {
      assert.equal(r.nodes.length, 3);
    });
    t(`${r.id}: unikalne id węzłów`, () => {
      const ids = r.nodes.map((n) => n.id);
      assert.equal(new Set(ids).size, ids.length);
    });
  }
  t("królestwo: krok do 'krol' -> ok", () => {
    const r = Us.step('krolestwo', Us.startTrip(), 'krol');
    assert.equal(r.ok, true);
  });
  t("królestwo: krok do 'krol' -> decided", () => {
    const r = Us.step('krolestwo', Us.startTrip(), 'krol');
    assert.equal(r.ok, true);
    assert.equal(r.trip.decided, true);
  });
  t("królestwo: krok do 'senat' -> ok false", () => {
    assert.equal(Us.step('krolestwo', Us.startTrip(), 'senat').ok, false);
  });
  t("królestwo: krok do 'lud' -> ok false", () => {
    assert.equal(Us.step('krolestwo', Us.startTrip(), 'lud').ok, false);
  });
  t("cesarstwo: krok do 'cesarz' -> ok i decided", () => {
    const r = Us.step('cesarstwo', Us.startTrip(), 'cesarz');
    assert.equal(r.ok, true);
    assert.equal(r.trip.decided, true);
  });
  t("cesarstwo: krok do 'senat' -> ok false", () => {
    assert.equal(Us.step('cesarstwo', Us.startTrip(), 'senat').ok, false);
  });
  t("republika: start -> 'zgromadzenie' ok false", () => {
    assert.equal(Us.step('republika', Us.startTrip(), 'zgromadzenie').ok, false);
  });
  t("republika: start -> 'konsulowie' ok false", () => {
    assert.equal(Us.step('republika', Us.startTrip(), 'konsulowie').ok, false);
  });
  t("republika: start -> 'senat' ok", () => {
    assert.equal(Us.step('republika', Us.startTrip(), 'senat').ok, true);
  });

  // Pełna droga republiki: senat → konsulowie → zgromadzenie (NIE) → konsulowie → zgromadzenie (TAK).
  const s1 = Us.step('republika', Us.startTrip(), 'senat');
  t("republika: 'senat' znowu -> ok false", () => {
    assert.equal(s1.ok, true);
    assert.equal(Us.step('republika', s1.trip, 'senat').ok, false);
  });
  const s2 = Us.step('republika', s1.trip, 'konsulowie');
  t("republika: po senacie 'konsulowie' ok", () => {
    assert.equal(s2.ok, true);
  });
  const s3 = Us.step('republika', s2.trip, 'zgromadzenie');
  t("republika: pierwsze głosowanie ok, votes 1", () => {
    assert.equal(s3.ok, true);
    assert.equal(s3.trip.votes, 1);
  });
  t('republika: pierwsze głosowanie NIE decyduje (decided false)', () => {
    assert.equal(s3.ok, true);
    assert.equal(s3.trip.decided, false);
  });
  t("republika: 'zgromadzenie' od razu znowu -> ok false", () => {
    assert.equal(Us.step('republika', s3.trip, 'zgromadzenie').ok, false);
  });
  const s4 = Us.step('republika', s3.trip, 'konsulowie');
  t("republika: po odrzuceniu 'konsulowie' ok", () => {
    assert.equal(s4.ok, true);
  });
  const s5 = Us.step('republika', s4.trip, 'zgromadzenie');
  t("republika: drugie głosowanie ok, votes 2, decided true", () => {
    assert.equal(s5.ok, true);
    assert.equal(s5.trip.votes, 2);
    assert.equal(s5.trip.decided, true);
  });
  t('republika: path ma długość 5', () => {
    assert.equal(s5.ok, true);
    assert.deepEqual(s5.trip.path, ['senat', 'konsulowie', 'zgromadzenie', 'konsulowie', 'zgromadzenie']);
  });
  t('republika: po decided każdy krok ok false', () => {
    assert.equal(s5.ok, true);
    for (const to of ['senat', 'konsulowie', 'zgromadzenie', 'krol', 'cesarz', 'lud']) {
      assert.equal(Us.step('republika', s5.trip, to).ok, false, to);
    }
  });
  t("królestwo: po decided krok do 'krol' ok false", () => {
    const d = Us.step('krolestwo', Us.startTrip(), 'krol');
    assert.equal(d.ok, true);
    assert.equal(Us.step('krolestwo', d.trip, 'krol').ok, false);
  });
  t("cesarstwo: po decided krok do 'cesarz' ok false", () => {
    const d = Us.step('cesarstwo', Us.startTrip(), 'cesarz');
    assert.equal(d.ok, true);
    assert.equal(Us.step('cesarstwo', d.trip, 'cesarz').ok, false);
  });
});

/* --- C) imperium ---------------------------------------------------------------- */

group('C) imperium', () => {
  t('IMPERIUM_STAGES rosnące po year', () => {
    for (let i = 1; i < Geo.IMPERIUM_STAGES.length; i++) {
      assert.ok(
        Geo.IMPERIUM_STAGES[i].year > Geo.IMPERIUM_STAGES[i - 1].year,
        `${Geo.IMPERIUM_STAGES[i - 1].year} !< ${Geo.IMPERIUM_STAGES[i].year}`,
      );
    }
  });
  t('km2 niemalejące do 117 włącznie', () => {
    const upto = Geo.IMPERIUM_STAGES.filter((s) => s.year <= 117);
    assert.ok(upto.length >= 2, 'za mało etapów do 117');
    for (let i = 1; i < upto.length; i++) {
      assert.ok(upto[i].km2 >= upto[i - 1].km2, `${upto[i - 1].year}:${upto[i - 1].km2} > ${upto[i].year}:${upto[i].km2}`);
    }
  });
  t('km2 etapu 271 < km2 etapu 117', () => {
    const e117 = Geo.IMPERIUM_STAGES.find((s) => s.year === 117);
    const e271 = Geo.IMPERIUM_STAGES.find((s) => s.year === 271);
    assert.ok(e117 && e271, 'brak etapu 117 lub 271');
    assert.ok(e271.km2 < e117.km2, `271:${e271.km2} vs 117:${e117.km2}`);
  });
  t('MAX_KM2 == km2 etapu 117', () => {
    const e117 = Geo.IMPERIUM_STAGES.find((s) => s.year === 117);
    assert.equal(Im.MAX_KM2, e117.km2);
  });
  for (const [year, expected] of [[-500, -500], [-1, -44], [116, 14], [117, 117], [394, 271], [395, 395]]) {
    t(`stageAt(${year}).year == ${expected}`, () => {
      assert.equal(Im.stageAt(year).year, expected);
    });
  }
  t('judgeLargest(117) ok', () => {
    assert.deepEqual(Im.judgeLargest(117), { ok: true });
  });
  t('judgeLargest(200) ok (wciąż etap 117)', () => {
    assert.equal(Im.stageAt(200).year, 117);
    assert.deepEqual(Im.judgeLargest(200), { ok: true });
  });
  t("judgeLargest(50) ok false, message z 'dalej'", () => {
    const r = Im.judgeLargest(50);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('dalej'), r.message);
  });
  t("judgeLargest(300) ok false, message z 'Cofnij'", () => {
    const r = Im.judgeLargest(300);
    assert.equal(r.ok, false);
    assert.ok(r.message.includes('Cofnij'), r.message);
  });
  for (const [id, expected] of [
    ['ITA', 'cale'],
    ['ESP', 'cale'],
    ['FRA', 'cale'],
    ['GRC', 'cale'],
    ['POL', 'poza'],
    ['DEU', 'czesc'],
    ['ROU', 'czesc'],
    ['IRL', 'poza'],
  ]) {
    t(`countryClass('${id}') == '${expected}'`, () => {
      assert.equal(Im.countryClass(id), expected);
    });
  }
  t("countryClass('XXX') == null", () => {
    assert.equal(Im.countryClass('XXX'), null);
  });
  t("państw z klasą != 'poza' jest co najmniej COUNTRIES_GOAL", () => {
    const n = Object.keys(Geo.SHARE_117).filter((id) => Im.countryClass(id) !== 'poza').length;
    assert.ok(n >= Im.COUNTRIES_GOAL, `${n} < ${Im.COUNTRIES_GOAL}`);
  });
  t('każdy region z każdego etapu istnieje w IMPERIUM_REGIONS', () => {
    for (const st of Geo.IMPERIUM_STAGES) {
      for (const r of st.regions) assert.ok(Geo.IMPERIUM_REGIONS[r], `etap ${st.year}: brak regionu ${r}`);
    }
  });
  t("ścieżka każdego regionu zaczyna się od 'M' i kończy 'Z'", () => {
    for (const [id, d] of Object.entries(Geo.IMPERIUM_REGIONS)) {
      assert.ok(d.startsWith('M'), `${id}: nie zaczyna się od M`);
      assert.ok(d.endsWith('Z'), `${id}: nie kończy się na Z`);
    }
  });
});

/* --- D) zolw -------------------------------------------------------------------- */

group('D) zolw', () => {
  t('hits(marching()) niepuste', () => {
    assert.ok(Zw.hits(Zw.marching()).length > 0);
  });
  t('hits(marching()) zawiera trafienia z przodu dla 4 kolumn', () => {
    const front = Zw.hits(Zw.marching()).filter((h) => h.from === 'przod');
    assert.deepEqual(
      front.map((h) => h.c).sort(),
      [0, 1, 2, 3],
    );
    assert.ok(front.every((h) => h.r === 0), 'trafienia z przodu tylko w 1. szeregu');
  });
  t("szereg 0 'przod', szeregi 1-3 'gora' -> hits pusty (prawdziwy żółw)", () => {
    const g = [
      ['przod', 'przod', 'przod', 'przod'],
      ['gora', 'gora', 'gora', 'gora'],
      ['gora', 'gora', 'gora', 'gora'],
      ['gora', 'gora', 'gora', 'gora'],
    ];
    assert.deepEqual(Zw.hits(g), []);
  });
  t("wszystkie 'gora' -> 4 trafienia", () => {
    const g = Array.from({ length: Zw.ROWS }, () => Array.from({ length: Zw.COLS }, () => 'gora'));
    assert.equal(Zw.hits(g).length, 4);
  });
  t("wszystkie 'gora' -> wszystkie trafienia z przodu", () => {
    const g = Array.from({ length: Zw.ROWS }, () => Array.from({ length: Zw.COLS }, () => 'gora'));
    const hs = Zw.hits(g);
    assert.ok(hs.length > 0);
    assert.ok(hs.every((h) => h.from === 'przod'), JSON.stringify(hs));
  });
  t("szereg 0 'przod', szereg 1 kolumna 2 'bok' -> trafienia (0,2,'gora') i (1,2,'gora')", () => {
    const g = [
      ['przod', 'przod', 'przod', 'przod'],
      ['gora', 'gora', 'bok', 'gora'],
      ['gora', 'gora', 'gora', 'gora'],
      ['gora', 'gora', 'gora', 'gora'],
    ];
    assert.deepEqual(Zw.hits(g), [
      { r: 0, c: 2, from: 'gora' },
      { r: 1, c: 2, from: 'gora' },
    ]);
  });
  t('NEXT tworzy cykl bok->przod->gora->bok', () => {
    assert.equal(Zw.NEXT['bok'], 'przod');
    assert.equal(Zw.NEXT['przod'], 'gora');
    assert.equal(Zw.NEXT['gora'], 'bok');
  });
  t("describeHit zwraca tekst z numerem szeregu ('1. szereg')", () => {
    const g = [
      ['bok', 'bok', 'bok', 'bok'],
      ['bok', 'bok', 'bok', 'bok'],
      ['bok', 'bok', 'bok', 'bok'],
      ['bok', 'bok', 'bok', 'bok'],
    ];
    const text = Zw.describeHit({ r: 0, c: 1, from: 'przod' }, g);
    assert.ok(text.includes('1. szereg'), text);
  });
  t("describeHit trafienia z góry w 2. szeregu mówi o '2. szereg'", () => {
    const g = [
      ['przod', 'przod', 'przod', 'przod'],
      ['gora', 'gora', 'bok', 'gora'],
      ['gora', 'gora', 'gora', 'gora'],
      ['gora', 'gora', 'gora', 'gora'],
    ];
    const text = Zw.describeHit({ r: 1, c: 2, from: 'gora' }, g);
    assert.ok(text.includes('2. szereg'), text);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}
