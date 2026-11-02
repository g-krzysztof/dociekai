/**
 * Selftest czystych funkcji L8 (`obliczanie-czasu`).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduł esbuildem — jak scripts/historia-l7-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l8-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l8-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * from '${root}/src/app/historia/klasa-4/components/lessons/obliczanie-czasu/obliczanie';\n`
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

const {
  walkYears,
  stepsBetween,
  judgePrediction,
  evaluate,
  ROADS,
  roadNumbers,
  judgeAbacus,
  shadowLength,
  shadowDirection,
  judgeNoon,
  festivalDay,
  seasonOf,
  formatDay,
  OCTOBER_1582,
  VANISHED_DAYS,
  judgeVanished,
  driftHours,
} = lib;

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

const road = (id) => ROADS.find((r) => r.id === id);

/* --- A) piechur --------------------------------------------------- */

group('A) piechur', () => {
  t('1. walkYears(-63, 14) ma 77 elementów', () => {
    assert.equal(walkYears(-63, 14).length, 77);
  });
  t('2. walkYears(-63, 14) nie zawiera 0', () => {
    assert.ok(!walkYears(-63, 14).includes(0));
  });
  t('3. walkYears(-63, 14): pierwszy -63, ostatni 14', () => {
    const w = walkYears(-63, 14);
    assert.equal(w[0], -63);
    assert.equal(w[w.length - 1], 14);
  });
  t('4. walkYears(-63, 14): po -1 następuje 1', () => {
    const w = walkYears(-63, 14);
    const i = w.indexOf(-1);
    assert.ok(i >= 0, 'brak -1');
    assert.equal(w[i + 1], 1);
  });
  t('5. stepsBetween(-63, 14) === 76', () => {
    assert.equal(stepsBetween(-63, 14), 76);
  });
  t('6. stepsBetween(1310, 1370) === 60', () => {
    assert.equal(stepsBetween(1310, 1370), 60);
  });
  t('7. stepsBetween(-69, -30) === 39', () => {
    assert.equal(stepsBetween(-69, -30), 39);
  });
  t('8. stepsBetween(-1, 1) === 1', () => {
    assert.equal(stepsBetween(-1, 1), 1);
  });
});

/* --- B) przewidywanie i liczydło ----------------------------------- */

group('B) przewidywanie i liczydło', () => {
  t('9. judgePrediction(77, 76).ok === true', () => {
    assert.equal(judgePrediction(77, 76).ok, true);
  });
  t("10. judgePrediction(77, 76) message zawiera 'Roku zero'", () => {
    const v = judgePrediction(77, 76);
    assert.ok(v.message.includes('Roku zero'), v.message);
  });
  t('11. judgePrediction(76, 76).ok === true', () => {
    assert.equal(judgePrediction(76, 76).ok, true);
  });
  t("12. judgePrediction(76, 76) message zawiera 'dokładnie'", () => {
    const v = judgePrediction(76, 76);
    assert.ok(v.message.includes('dokładnie'), v.message);
  });
  t('13. evaluate 1370 − 1310 = 60', () => {
    assert.equal(evaluate({ left: 1370, right: 1310, op: '-', minusOne: false }), 60);
  });
  t('14. evaluate 63 + 14 − 1 = 76', () => {
    assert.equal(evaluate({ left: 63, right: 14, op: '+', minusOne: true }), 76);
  });
  t('15. evaluate zwraca null, gdy brak lewej liczby', () => {
    assert.equal(evaluate({ left: null, right: 1310, op: '-', minusOne: false }), null);
  });
  t('16. evaluate zwraca null, gdy brak prawej liczby', () => {
    assert.equal(evaluate({ left: 63, right: null, op: '+', minusOne: false }), null);
  });
  t('17. ROADS: 3 drogi w kolejności kazimierz, kleopatra, august', () => {
    assert.deepEqual(
      ROADS.map((r) => r.id),
      ['kazimierz', 'kleopatra', 'august']
    );
  });
  t('18. roadNumbers zwraca wartości bezwzględne dat', () => {
    assert.deepEqual(roadNumbers(road('kazimierz')), [1310, 1370]);
    assert.deepEqual(roadNumbers(road('kleopatra')), [69, 30]);
    assert.deepEqual(roadNumbers(road('august')), [63, 14]);
  });
});

/* --- C) sędzia liczydła -------------------------------------------- */

group('C) sędzia liczydła', () => {
  t('19. Kazimierz: 1370 − 1310 → ok', () => {
    const v = judgeAbacus(road('kazimierz'), { left: 1370, right: 1310, op: '-', minusOne: false });
    assert.equal(v.ok, true);
  });
  t('20. Kleopatra: 69 − 30 → ok', () => {
    const v = judgeAbacus(road('kleopatra'), { left: 69, right: 30, op: '-', minusOne: false });
    assert.equal(v.ok, true);
  });
  t('21. August: 63 + 14 − 1 → ok', () => {
    const v = judgeAbacus(road('august'), { left: 63, right: 14, op: '+', minusOne: true });
    assert.equal(v.ok, true);
  });
  t('22. August: 63 + 14 bez −1 → ok false', () => {
    const v = judgeAbacus(road('august'), { left: 63, right: 14, op: '+', minusOne: false });
    assert.equal(v.ok, false);
  });
  t("23. August bez −1: message zawiera 'O jeden krok za dużo'", () => {
    const v = judgeAbacus(road('august'), { left: 63, right: 14, op: '+', minusOne: false });
    assert.ok(v.message.includes('O jeden krok za dużo'), v.message);
  });
  t('24. Kazimierz: 1310 − 1370 → ok false', () => {
    const v = judgeAbacus(road('kazimierz'), { left: 1310, right: 1370, op: '-', minusOne: false });
    assert.equal(v.ok, false);
  });
  t("25. Kazimierz odwrotnie: message zawiera 'zamień'", () => {
    const v = judgeAbacus(road('kazimierz'), { left: 1310, right: 1370, op: '-', minusOne: false });
    assert.ok(v.message.includes('zamień'), v.message);
  });
  t('26. Kleopatra: 69 + 30 → ok false', () => {
    const v = judgeAbacus(road('kleopatra'), { left: 69, right: 30, op: '+', minusOne: false });
    assert.equal(v.ok, false);
  });
  t("27. Kleopatra 69 + 30: message zawiera 'przed szczeliną'", () => {
    const v = judgeAbacus(road('kleopatra'), { left: 69, right: 30, op: '+', minusOne: false });
    assert.ok(v.message.includes('przed szczeliną'), v.message);
  });
  t('28. Kazimierz: 1370 + 1310 → ok false', () => {
    const v = judgeAbacus(road('kazimierz'), { left: 1370, right: 1310, op: '+', minusOne: false });
    assert.equal(v.ok, false);
  });
  t('29. sędzia przyjmuje każde działanie z dobrym wynikiem: August 90 − 14 = 76 → ok', () => {
    const v = judgeAbacus(road('august'), { left: 90, right: 14, op: '-', minusOne: false });
    assert.equal(v.ok, true);
  });
  t('30. sędzia przyjmuje każde działanie z dobrym wynikiem: Kazimierz 30 + 30 = 60 → ok', () => {
    const v = judgeAbacus(road('kazimierz'), { left: 30, right: 30, op: '+', minusOne: false });
    assert.equal(v.ok, true);
  });
  t('31. puste liczydło → ok false', () => {
    const v = judgeAbacus(road('kazimierz'), { left: null, right: 1310, op: '-', minusOne: false });
    assert.equal(v.ok, false);
  });
});

/* --- D) cień patyka ------------------------------------------------ */

group('D) cień patyka', () => {
  t('32. shadowLength najmniejsza dla t=0.5', () => {
    const noon = shadowLength(0.5, 100);
    for (const tt of [0.3, 0.7, 0.1, 0.9]) {
      assert.ok(noon < shadowLength(tt, 100), `t=${tt}: ${shadowLength(tt, 100)} <= ${noon}`);
    }
  });
  t('33. shadowLength symetryczna: t i 1−t (0.3/0.7)', () => {
    assert.ok(Math.abs(shadowLength(0.3, 100) - shadowLength(0.7, 100)) < 1e-9);
  });
  t('34. shadowLength symetryczna: t i 1−t (0.1/0.9)', () => {
    assert.ok(Math.abs(shadowLength(0.1, 100) - shadowLength(0.9, 100)) < 1e-9);
  });
  t('35. shadowDirection(0.5) ≈ {x: 0, y: 1}', () => {
    const d = shadowDirection(0.5);
    assert.ok(Math.abs(d.x) < 1e-12, `x=${d.x}`);
    assert.ok(Math.abs(d.y - 1) < 1e-12, `y=${d.y}`);
  });
  t('36. shadowDirection(0.1): x > 0', () => {
    assert.ok(shadowDirection(0.1).x > 0);
  });
  t('37. shadowDirection(0.9): x < 0', () => {
    assert.ok(shadowDirection(0.9).x < 0);
  });
  t('38. judgeNoon(0.5, 100).ok === true', () => {
    assert.equal(judgeNoon(0.5, 100).ok, true);
  });
  t('39. judgeNoon(0.52, 100).ok === true', () => {
    assert.equal(judgeNoon(0.52, 100).ok, true);
  });
  t('40. judgeNoon(0.3, 100).ok === false', () => {
    assert.equal(judgeNoon(0.3, 100).ok, false);
  });
  t("41. judgeNoon(0.3, 100) message zawiera 'wspina'", () => {
    const v = judgeNoon(0.3, 100);
    assert.ok(v.message.includes('wspina'), v.message);
  });
  t('42. judgeNoon(0.7, 100).ok === false', () => {
    assert.equal(judgeNoon(0.7, 100).ok, false);
  });
  t("43. judgeNoon(0.7, 100) message zawiera 'schodzić'", () => {
    const v = judgeNoon(0.7, 100);
    assert.ok(v.message.includes('schodzić'), v.message);
  });
});

/* --- E) kalendarz księżycowy ---------------------------------------- */

group('E) kalendarz księżycowy', () => {
  t("44. festivalDay(0, 'ksiezycowy') === 227", () => {
    assert.equal(festivalDay(0, 'ksiezycowy'), 227);
  });
  t("45. festivalDay(1, 'ksiezycowy') === 216", () => {
    assert.equal(festivalDay(1, 'ksiezycowy'), 216);
  });
  t("46. festivalDay(20, 'sloneczny') === 227", () => {
    assert.equal(festivalDay(20, 'sloneczny'), 227);
  });
  t('47. wszystkie wyniki w 1..365 dla lat 0..40', () => {
    for (let y = 0; y <= 40; y++) {
      for (const cal of ['ksiezycowy', 'sloneczny']) {
        const d = festivalDay(y, cal);
        assert.ok(d >= 1 && d <= 365, `years=${y} cal=${cal}: ${d}`);
      }
    }
  });
  t("48. seasonOf(festivalDay(13, 'ksiezycowy')) !== 'zima'", () => {
    assert.notEqual(seasonOf(festivalDay(13, 'ksiezycowy')), 'zima');
  });
  t("49. seasonOf(festivalDay(14, 'ksiezycowy')) === 'zima'", () => {
    assert.equal(seasonOf(festivalDay(14, 'ksiezycowy')), 'zima');
  });
  t("50. formatDay(227) === '15 sierpnia'", () => {
    assert.equal(formatDay(227), '15 sierpnia');
  });
  t("51. formatDay(1) === '1 stycznia'", () => {
    assert.equal(formatDay(1), '1 stycznia');
  });
  t("52. formatDay(365) === '31 grudnia'", () => {
    assert.equal(formatDay(365), '31 grudnia');
  });
});

/* --- F) październik 1582 i 29 lutego -------------------------------- */

group('F) październik 1582 i 29 lutego', () => {
  t('53. OCTOBER_1582: dni [1, 2, 3, 4, 15]', () => {
    assert.deepEqual(
      OCTOBER_1582.map((c) => c.day),
      [1, 2, 3, 4, 15]
    );
  });
  t("54. OCTOBER_1582: ostatni weekday 'piątek'", () => {
    assert.equal(OCTOBER_1582[OCTOBER_1582.length - 1].weekday, 'piątek');
  });
  t("55. OCTOBER_1582: czwartek przy 4", () => {
    assert.equal(OCTOBER_1582.find((c) => c.day === 4).weekday, 'czwartek');
  });
  t('56. VANISHED_DAYS: długość 10', () => {
    assert.equal(VANISHED_DAYS.length, 10);
  });
  t('57. VANISHED_DAYS: od 5 do 14', () => {
    assert.deepEqual(VANISHED_DAYS, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  t('58. judgeVanished(10).ok === true', () => {
    assert.equal(judgeVanished(10).ok, true);
  });
  t('59. judgeVanished(11).ok === false', () => {
    assert.equal(judgeVanished(11).ok, false);
  });
  t("60. judgeVanished(11) message zawiera '15 − 4'", () => {
    const v = judgeVanished(11);
    assert.ok(v.message.includes('15 − 4'), v.message);
  });
  t('61. judgeVanished(9).ok === false', () => {
    assert.equal(judgeVanished(9).ok, false);
  });
  t('62. driftHours(4, false) === 24', () => {
    assert.equal(driftHours(4, false), 24);
  });
  t('63. driftHours(4, true) === 0', () => {
    assert.equal(driftHours(4, true), 0);
  });
  t('64. driftHours(3, true) === 18', () => {
    assert.equal(driftHours(3, true), 18);
  });
});

if (failures.length === 0) {
  console.log(`\nOK ${total}`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}
