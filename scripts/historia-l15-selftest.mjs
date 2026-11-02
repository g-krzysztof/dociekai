/**
 * Selftest czystych funkcji L15 (`pierwsi-ludzie`: swider, oboz, wedrowki,
 * jaskinia).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l14-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l15-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l15-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as S from '${root}/src/app/historia/klasa-4/components/lessons/pierwsi-ludzie/swider';\n` +
    `export * as O from '${root}/src/app/historia/klasa-4/components/lessons/pierwsi-ludzie/oboz';\n` +
    `export * as W from '${root}/src/app/historia/klasa-4/components/lessons/pierwsi-ludzie/wedrowki';\n` +
    `export * as J from '${root}/src/app/historia/klasa-4/components/lessons/pierwsi-ludzie/jaskinia';\n`,
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

const { S, O, W, J } = lib;

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

/* --- A) świder: tempoAt liczy tylko ostatnią sekundę ------------------------ */

group('A) swider: tempoAt', () => {
  t('tempoAt([500,900,1500], 1500) === 2 (500 spoza okna)', () => {
    assert.equal(S.tempoAt([500, 900, 1500], 1500), 2);
  });
  t('tempoAt([0,100], 2000) === 0 (wszystko starsze niż sekunda)', () => {
    assert.equal(S.tempoAt([0, 100], 2000), 0);
  });
  t('granica okna: t === now - 1000 wykluczone', () => {
    assert.equal(S.tempoAt([500], 1500), 0);
  });
  t('t === now wliczone', () => {
    assert.equal(S.tempoAt([1500], 1500), 1);
  });
  t('przyszłość (t > now) niewliczona', () => {
    assert.equal(S.tempoAt([1600], 1500), 0);
  });
  t('puste zawrócenia → 0', () => {
    assert.equal(S.tempoAt([], 1500), 0);
  });
});

/* --- B) świder: stepHeat ---------------------------------------------------- */

group('B) swider: stepHeat', () => {
  t('wolno stygnie: stepHeat(20, 0, 1) === 14', () => {
    assert.equal(S.stepHeat(20, 0, 1), 14);
  });
  t('wolno nie schodzi poniżej 0: stepHeat(3, 1, 1) === 0', () => {
    assert.equal(S.stepHeat(3, 1, 1), 0);
  });
  t('z zera wolno zostaje 0', () => {
    assert.equal(S.stepHeat(0, 0, 1), 0);
  });
  t('średnio po 100 krokach dt=0.1 nigdy powyżej WARM_CAP', () => {
    let heat = 0;
    for (let i = 0; i < 100; i += 1) {
      heat = S.stepHeat(heat, 3, 0.1);
      assert.ok(heat <= S.WARM_CAP, `krok ${i}: ${heat}`);
    }
  });
  t('średnio ciepło siada tuż pod WARM_CAP (krok 0,8 vs spadek 0,2)', () => {
    let heat = 0;
    for (let i = 0; i < 100; i += 1) heat = S.stepHeat(heat, 3, 0.1);
    assert.ok(heat >= S.WARM_CAP - 1 && heat <= S.WARM_CAP, `heat=${heat}`);
  });
  t('średnio powyżej WARM_CAP stygnie: stepHeat(50, 3, 1) === 48', () => {
    assert.equal(S.stepHeat(50, 3, 1), 48);
  });
  t('szybko po 300 krokach dt=0.1 dochodzi do EMBER_AT', () => {
    let heat = 0;
    for (let i = 0; i < 300; i += 1) heat = S.stepHeat(heat, 5, 0.1);
    assert.equal(heat, S.EMBER_AT);
  });
  t('na EMBER_AT zostaje: stepHeat(EMBER_AT, 5, 1) === EMBER_AT', () => {
    assert.equal(S.stepHeat(S.EMBER_AT, 5, 1), S.EMBER_AT);
  });
  t('szybciej rośnie szybciej: tempo 8 > tempo 5', () => {
    assert.ok(S.stepHeat(0, 8, 1) > S.stepHeat(0, 5, 1));
  });
});

/* --- C) świder: stageOf i tempoHint ----------------------------------------- */

group('C) swider: stageOf i tempoHint', () => {
  t('stageOf(0) === zimne', () => assert.equal(S.stageOf(0), 'zimne'));
  t('stageOf(8) === zimne (próg: dopiero powyżej 8 ciepłe)', () => {
    assert.equal(S.stageOf(8), 'zimne');
  });
  t('stageOf(20) === cieple', () => assert.equal(S.stageOf(20), 'cieple'));
  t('stageOf(SMOKE_AT) === dym', () => assert.equal(S.stageOf(S.SMOKE_AT), 'dym'));
  t('stageOf(SMOKE_AT - 1) === cieple', () => {
    assert.equal(S.stageOf(S.SMOKE_AT - 1), 'cieple');
  });
  t('stageOf(EMBER_AT) === zar', () => assert.equal(S.stageOf(S.EMBER_AT), 'zar'));
  t('tempoHint wolnego tempa ma liczbę i słowo „wolno”', () => {
    const h = S.tempoHint(1, 10);
    assert.ok(h.includes('1'), h);
    assert.ok(h.includes('wolno'), h);
  });
  t('tempoHint(0, 0) zaprasza do wodzenia palcem', () => {
    assert.ok(S.tempoHint(0, 0).includes('Wodź palcem'), S.tempoHint(0, 0));
  });
  t('tempoHint(0, 10) mówi, że drewno stygnie', () => {
    assert.ok(S.tempoHint(0, 10).includes('stygnie'), S.tempoHint(0, 10));
  });
  t('tempoHint przy żarze każe przenieść żar do hubki', () => {
    assert.ok(S.tempoHint(9, S.EMBER_AT).includes('hubki'), S.tempoHint(9, S.EMBER_AT));
  });
  t('tempoHint szybkiego tempa z dymem mówi „dymi”', () => {
    const h = S.tempoHint(6, S.SMOKE_AT + 5);
    assert.ok(h.includes('6') && h.includes('dymi'), h);
  });
});

/* --- D) obóz: start i rok w dolinie ----------------------------------------- */

group('D) oboz: start i rok w dolinie', () => {
  t("initialCamp zaczyna w 'dolina'", () => {
    assert.equal(O.initialCamp().at, 'dolina');
  });
  t('initialCamp zaczyna w miesiącu 0', () => {
    assert.equal(O.initialCamp().month, 0);
  });
  t('12 miesięcy bez ruszania kończy rok', () => {
    let s = O.initialCamp();
    for (let i = 0; i < 12; i += 1) s = O.advance(s);
    assert.equal(O.isYearOver(s), true);
    assert.equal(s.month, 12);
  });
  t('rok w dolinie: judgeYear(...).ok === false', () => {
    let s = O.initialCamp();
    for (let i = 0; i < 12; i += 1) s = O.advance(s);
    assert.equal(O.judgeYear(s.log).ok, false);
  });
  t('rok w dolinie: były miesiące głodu', () => {
    let s = O.initialCamp();
    for (let i = 0; i < 12; i += 1) s = O.advance(s);
    assert.ok(O.judgeYear(s.log).hungryMonths.length > 0);
  });
  t('werdykt nazywa miesiąc pierwszego głodu w miejscowniku', () => {
    let s = O.initialCamp();
    for (let i = 0; i < 12; i += 1) s = O.advance(s);
    const v = O.judgeYear(s.log);
    assert.ok(v.text.includes(O.MONTHS_IN[v.hungryMonths[0].month]), v.text);
  });
  t('werdykt roku w dolinie mówi o staniu cały rok w dolinie', () => {
    let s = O.initialCamp();
    for (let i = 0; i < 12; i += 1) s = O.advance(s);
    assert.ok(O.judgeYear(s.log).text.includes('przez cały rok stał w dolinie'));
  });
});

/* --- E) obóz: dobra strategia i za wczesny wymarsz -------------------------- */

const GOOD_PLAN = [
  'dolina', 'dolina', 'tundra', 'tundra', 'tundra', 'tundra',
  'las', 'las', 'dolina', 'dolina', 'dolina', 'dolina',
];

function runPlan(plan) {
  let s = O.initialCamp();
  for (const go of plan) s = O.advance(s, go);
  return s;
}

group('E) oboz: dobra strategia i za wczesny wymarsz', () => {
  t('dobry plan: 0 miesięcy głodu', () => {
    assert.equal(O.judgeYear(runPlan(GOOD_PLAN).log).hungryMonths.length, 0);
  });
  t('dobry plan: ok === true', () => {
    assert.equal(O.judgeYear(runPlan(GOOD_PLAN).log).ok, true);
  });
  t('dobry plan: moves === 3', () => {
    assert.equal(O.judgeYear(runPlan(GOOD_PLAN).log).moves, 3);
  });
  t('wymarsz w miesiącu 0 z pełnej doliny trafia do tooEarly', () => {
    const s = O.advance(O.initialCamp(), 'las');
    const v = O.judgeYear(s.log);
    assert.equal(v.tooEarly.length, 1);
    assert.equal(v.tooEarly[0].movedFrom, 'dolina');
  });
  t('tooEarly liczy od TOO_EARLY_AT (zapas >= 2*NEED)', () => {
    assert.equal(O.TOO_EARLY_AT, 2 * O.NEED);
    const s = O.advance(O.initialCamp(), 'las');
    assert.ok(s.log[0].leftBehind >= O.TOO_EARLY_AT, JSON.stringify(s.log[0]));
  });
  t('grown nigdy nie przekracza CAP', () => {
    for (const p of O.PLACES) {
      for (let m = 0; m < 12; m += 1) {
        assert.ok(O.grown(p, 100, m) <= O.CAP, `${p.id} m=${m}: ${O.grown(p, 100, m)}`);
      }
    }
  });
  t('tundra po sierpniu ma 0 (keep 0): grown(tundra, 10, 6) === 0', () => {
    assert.equal(O.grown(O.getPlace('tundra'), 10, 6), 0);
  });
  t('tundra keep 0 do końca roku (miesiące 7–11)', () => {
    for (let m = 7; m < 12; m += 1) {
      assert.equal(O.grown(O.getPlace('tundra'), 10, m), 0);
    }
  });
  t('advance po końcu roku nie zmienia stanu', () => {
    const done = runPlan(GOOD_PLAN);
    assert.deepEqual(O.advance(done), done);
  });
});

/* --- F) wędrówki: sędzia przejścia ------------------------------------------ */

group('F) wedrowki: judgeMove', () => {
  t("judgeMove('afryka','azja',0).ok === true", () => {
    assert.equal(W.judgeMove('afryka', 'azja', 0).ok, true);
  });
  t("judgeMove('azja','ameryka',0) odrzuca z reason 'morze'", () => {
    const v = W.judgeMove('azja', 'ameryka', 0);
    assert.equal(v.ok, false);
    assert.equal(v.reason, 'morze');
  });
  t('przy BRIDGE_AT droga do Ameryki otwarta', () => {
    assert.equal(W.judgeMove('azja', 'ameryka', W.BRIDGE_AT).ok, true);
  });
  t("judgeMove('azja','australia',0) odrzuca z reason 'morze'", () => {
    const v = W.judgeMove('azja', 'australia', 0);
    assert.equal(v.ok, false);
    assert.equal(v.reason, 'morze');
  });
  t('przy BRIDGE_AT droga do Australii otwarta', () => {
    assert.equal(W.judgeMove('azja', 'australia', W.BRIDGE_AT).ok, true);
  });
  t("judgeMove('afryka','europa',-120) reason 'brak-drogi'", () => {
    const v = W.judgeMove('afryka', 'europa', -120);
    assert.equal(v.ok, false);
    assert.equal(v.reason, 'brak-drogi');
  });
  t("odrzut 'brak-drogi' każe iść przez Azję", () => {
    const v = W.judgeMove('afryka', 'europa', -120);
    assert.ok(v.text.includes('Azję'), v.text);
  });
  t('z tego samego do tego samego reason ten-sam', () => {
    const v = W.judgeMove('azja', 'azja', 0);
    assert.equal(v.ok, false);
    assert.equal(v.reason, 'ten-sam');
  });
  t('droga lądowa nie zależy od morza: azja→europa przy 0 ok', () => {
    assert.equal(W.judgeMove('azja', 'europa', 0).ok, true);
  });
});

/* --- G) wędrówki: kto ostatni ------------------------------------------------ */

group('G) wedrowki: lastSettled i judgeLast', () => {
  t("lastSettled(wszystkie) === 'ameryka'", () => {
    assert.equal(W.lastSettled(['afryka', 'azja', 'europa', 'australia', 'ameryka']), 'ameryka');
  });
  t("lastSettled(['afryka']) === null", () => {
    assert.equal(W.lastSettled(['afryka']), null);
  });
  t("lastSettled(['afryka','azja']) === 'azja'", () => {
    assert.equal(W.lastSettled(['afryka', 'azja']), 'azja');
  });
  t("judgeLast trafienie 'ameryka' ok", () => {
    const v = W.judgeLast(['afryka', 'azja', 'europa', 'australia', 'ameryka'], 'ameryka');
    assert.equal(v.ok, true);
  });
  t("judgeLast 'afryka' nie ok", () => {
    const v = W.judgeLast(['afryka', 'azja', 'europa', 'australia', 'ameryka'], 'afryka');
    assert.equal(v.ok, false);
  });
  t("judgeLast 'europa' nie ok, a tekst wymienia Amerykę", () => {
    const v = W.judgeLast(['afryka', 'azja', 'europa', 'australia', 'ameryka'], 'europa');
    assert.equal(v.ok, false);
    assert.ok(v.text.includes('Ameryka'), v.text);
  });
});

/* --- H) jaskinia: figureAt --------------------------------------------------- */

const ASPECT = 472 / 720;

group('H) jaskinia: figureAt', () => {
  for (const f of J.FIGURES) {
    t(`figureAt w środku '${f.id}' zwraca '${f.id}'`, () => {
      assert.equal(J.figureAt(f.x, f.y, ASPECT)?.id, f.id);
    });
  }
  t("w środku 'znaki' zwraca 'znaki', a nie 'tur'", () => {
    const znaki = J.FIGURES.find((f) => f.id === 'znaki');
    assert.equal(J.figureAt(znaki.x, znaki.y, ASPECT)?.id, 'znaki');
  });
  t('daleko od wszystkiego (95, 95) zwraca null', () => {
    assert.equal(J.figureAt(95, 95, ASPECT), null);
  });
  t('pominięcie znalezionych: tur w already znika spod światła', () => {
    const tur = J.FIGURES.find((f) => f.id === 'tur');
    const hit = J.figureAt(tur.x, tur.y, ASPECT, ['tur']);
    assert.ok(hit === null || hit.id !== 'tur', JSON.stringify(hit));
  });
  t('pominięcie znaków odsłania tura pod spodem', () => {
    const znaki = J.FIGURES.find((f) => f.id === 'znaki');
    assert.equal(J.figureAt(znaki.x, znaki.y, ASPECT, ['znaki'])?.id, 'tur');
  });
});

/* --- I) jaskinia: judgeClaim ------------------------------------------------- */

group('I) jaskinia: judgeClaim', () => {
  for (const c of J.CLAIMS) {
    t(`claim '${c.id}' ze swoim proof → ok`, () => {
      assert.equal(J.judgeClaim(c, c.proof).ok, true);
    });
  }
  t("wniosek 'kreski' (milczy) położony na figurze → nie ok", () => {
    const c = J.CLAIMS.find((x) => x.id === 'kreski');
    assert.equal(J.judgeClaim(c, 'kon').ok, false);
  });
  t("wniosek 'imiona' (milczy) położony na figurze → nie ok", () => {
    const c = J.CLAIMS.find((x) => x.id === 'imiona');
    assert.equal(J.judgeClaim(c, 'tur').ok, false);
  });
  t("wniosek o koniu położony na 'milczy' → nie ok", () => {
    const c = J.CLAIMS.find((x) => x.id === 'konie');
    assert.equal(J.judgeClaim(c, 'milczy').ok, false);
  });
  t("wniosek o turach położony na 'milczy' → nie ok", () => {
    const c = J.CLAIMS.find((x) => x.id === 'tury');
    assert.equal(J.judgeClaim(c, 'milczy').ok, false);
  });
  t('wniosek o koniu na jeleniu → nie ok', () => {
    const c = J.CLAIMS.find((x) => x.id === 'konie');
    assert.equal(J.judgeClaim(c, 'jelen').ok, false);
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}
