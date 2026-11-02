/**
 * Selftest czystych funkcji L7 (`wieki-i-tysiaclecia`).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduł esbuildem — jak scripts/streak-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l7-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l7-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * from '${root}/src/app/historia/klasa-4/components/lessons/wieki-i-tysiaclecia/wieki';\n`
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node' });

const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const {
  stringOf,
  beadInString,
  closesString,
  judgeFirework,
  coveredPrefix,
  hiddenDigits,
  centuryNumber,
  shelfRange,
  judgeShelf,
  shelfCardsCE,
  shelvesCE,
  SHELF_CARDS_BC,
  SHELVES_BC,
  romanSteps,
  romanToNumber,
  PLAQUES,
  DIAL_CENTURIES,
  judgePlaqueCentury,
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

const NOW = 2026;

/* --- A) koraliki i fajerwerk ---------------------------------------- */

group('A) koraliki i fajerwerk', () => {
  t('1. stringOf(1) = 1', () => {
    assert.equal(stringOf(1), 1);
  });
  t('2. stringOf(100) = 1', () => {
    assert.equal(stringOf(100), 1);
  });
  t('3. stringOf(101) = 2', () => {
    assert.equal(stringOf(101), 2);
  });
  t('4. stringOf(2000) = 20', () => {
    assert.equal(stringOf(2000), 20);
  });
  t('5. stringOf(2001) = 21', () => {
    assert.equal(stringOf(2001), 21);
  });

  t('6. beadInString(100) = 100', () => {
    assert.equal(beadInString(100), 100);
  });
  t('7. beadInString(101) = 1', () => {
    assert.equal(beadInString(101), 1);
  });
  t('8. beadInString(1999) = 99', () => {
    assert.equal(beadInString(1999), 99);
  });

  t('9. closesString(1900) = true', () => {
    assert.equal(closesString(1900), true);
  });
  t('10. closesString(1901) = false', () => {
    assert.equal(closesString(1901), false);
  });

  t('11. judgeFirework(2000) ok', () => {
    assert.equal(judgeFirework(2000).ok, true);
  });
  t("12. judgeFirework(1999) nie ok i 'jedno puste miejsce'", () => {
    const v = judgeFirework(1999);
    assert.equal(v.ok, false);
    assert.ok(v.message.includes('jedno puste miejsce'), v.message);
  });
  t("13. judgeFirework(1990) mówi o '10 pustych miejsc'", () => {
    const v = judgeFirework(1990);
    assert.equal(v.ok, false);
    assert.ok(v.message.includes('10 pustych miejsc'), v.message);
  });
  t("14. judgeFirework(2001) nie ok i 'dwudziestym pierwszym'", () => {
    const v = judgeFirework(2001);
    assert.equal(v.ok, false);
    assert.ok(v.message.includes('dwudziestym pierwszym'), v.message);
  });
});

/* --- B) palec, wiek, półka ------------------------------------------ */

group('B) palec, wiek, półka', () => {
  t('15. coveredPrefix(1492) = 14', () => {
    assert.equal(coveredPrefix(1492), 14);
  });
  t('16. coveredPrefix(100) = 1', () => {
    assert.equal(coveredPrefix(100), 1);
  });
  t('17. coveredPrefix(-44) = 0', () => {
    assert.equal(coveredPrefix(-44), 0);
  });
  t('18. coveredPrefix(-753) = 7', () => {
    assert.equal(coveredPrefix(-753), 7);
  });

  t("19. hiddenDigits(1900) = '00'", () => {
    assert.equal(hiddenDigits(1900), '00');
  });
  t("20. hiddenDigits(-44) = '44'", () => {
    assert.equal(hiddenDigits(-44), '44');
  });
  t("21. hiddenDigits(1905) = '05'", () => {
    assert.equal(hiddenDigits(1905), '05');
  });

  for (const [year, expected] of [
    [1410, 15],
    [1900, 19],
    [1901, 20],
    [2000, 20],
    [100, 1],
    [1, 1],
    [-480, 5],
    [-44, 1],
    [-100, 1],
    [-101, 2],
    [-753, 8],
  ]) {
    t(`22. centuryNumber(${year}) = ${expected}`, () => {
      assert.equal(centuryNumber(year), expected);
    });
  }

  t('23. shelfRange(20, n.e.) = 1901–2000', () => {
    assert.deepEqual(shelfRange(20, false), { first: 1901, last: 2000 });
  });
  t('24. shelfRange(1, p.n.e.) = 100–1 p.n.e.', () => {
    assert.deepEqual(shelfRange(1, true), { first: 100, last: 1 });
  });
  t('25. shelfRange(8, p.n.e.) = 800–701 p.n.e.', () => {
    assert.deepEqual(shelfRange(8, true), { first: 800, last: 701 });
  });
});

/* --- C) sędzia półki n.e. -------------------------------------------- */

group('C) sędzia półki n.e.', () => {
  t('26. judgeShelf(1410, 15) ok', () => {
    assert.equal(judgeShelf(1410, 15).ok, true);
  });
  t("27. judgeShelf(1410, 14): 'Pod palcem zostało 14'", () => {
    const v = judgeShelf(1410, 14);
    assert.equal(v.ok, false);
    assert.ok(v.message.includes('Pod palcem zostało 14'), v.message);
  });
  t('28. judgeShelf(1900, 19) ok', () => {
    assert.equal(judgeShelf(1900, 19).ok, true);
  });
  t("29. judgeShelf(1900, 20): 'dwa zera'", () => {
    const v = judgeShelf(1900, 20);
    assert.equal(v.ok, false);
    assert.ok(v.message.includes('dwa zera'), v.message);
  });
  t('30. judgeShelf(1901, 20) ok', () => {
    assert.equal(judgeShelf(1901, 20).ok, true);
  });
  t("31. judgeShelf(2000, 21): 'dwa zera'", () => {
    const v = judgeShelf(2000, 21);
    assert.equal(v.ok, false);
    assert.ok(v.message.includes('dwa zera'), v.message);
  });
  t('32. judgeShelf(100, 1) ok', () => {
    assert.equal(judgeShelf(100, 1).ok, true);
  });
  t('33. judgeShelf(100, 2) nie ok', () => {
    assert.equal(judgeShelf(100, 2).ok, false);
  });
  t("34. judgeShelf(1543, 19): 'od 1801 do 1900'", () => {
    const v = judgeShelf(1543, 19);
    assert.equal(v.ok, false);
    assert.ok(v.message.includes('od 1801 do 1900'), v.message);
  });
});

/* --- D) sędzia półki p.n.e. i lustro --------------------------------- */

group('D) sędzia półki p.n.e. i lustro', () => {
  t('35. judgeShelf(-480, 5, p.n.e.) ok', () => {
    assert.equal(judgeShelf(-480, 5, true).ok, true);
  });
  t("36. judgeShelf(-480, 4, p.n.e.): 'Pod palcem zostało 4'", () => {
    const v = judgeShelf(-480, 4, true);
    assert.equal(v.ok, false);
    assert.ok(v.message.includes('Pod palcem zostało 4'), v.message);
  });
  t('37. judgeShelf(-100, 1, p.n.e.) ok', () => {
    assert.equal(judgeShelf(-100, 1, true).ok, true);
  });
  t("38. judgeShelf(-100, 2, p.n.e.): 'dwa zera'", () => {
    const v = judgeShelf(-100, 2, true);
    assert.equal(v.ok, false);
    assert.ok(v.message.includes('dwa zera'), v.message);
  });
  t('39. judgeShelf(-44, 1, p.n.e.) ok', () => {
    assert.equal(judgeShelf(-44, 1, true).ok, true);
  });
  t('40. judgeShelf(-753, 8, p.n.e.) ok', () => {
    assert.equal(judgeShelf(-753, 8, true).ok, true);
  });
  t("41. judgeShelf(-44, 1, n.e.): 'lewej stronie'", () => {
    const v = judgeShelf(-44, 1, false);
    assert.equal(v.ok, false);
    assert.ok(v.message.includes('lewej stronie'), v.message);
  });
  t("42. judgeShelf(1410, 15, p.n.e.): 'prawej stronie'", () => {
    const v = judgeShelf(1410, 15, true);
    assert.equal(v.ok, false);
    assert.ok(v.message.includes('prawej stronie'), v.message);
  });
});

/* --- E) karty i półki ------------------------------------------------ */

group('E) karty i półki', () => {
  t('43. shelfCardsCE(2026): 8 kart, ostatnia to 2026', () => {
    const cards = shelfCardsCE(NOW);
    assert.equal(cards.length, 8);
    assert.equal(cards[cards.length - 1].year, NOW);
  });
  t('44. każda karta CE przechodzi judgeShelf', () => {
    for (const c of shelfCardsCE(NOW)) {
      assert.equal(judgeShelf(c.year, centuryNumber(c.year)).ok, true, `year=${c.year}`);
    }
  });
  t('45. shelvesCE(2026): rosnąco, bez duplikatów, z 1, 14, 15, 19, 20, 21', () => {
    const shelves = shelvesCE(NOW);
    assert.deepEqual([...shelves].sort((a, b) => a - b), shelves);
    assert.deepEqual([...new Set(shelves)], shelves);
    for (const s of [1, 14, 15, 19, 20, 21]) {
      assert.ok(shelves.includes(s), `brak półki ${s}: ${shelves}`);
    }
  });
  t('46. SHELF_CARDS_BC: 4 karty, wszystkie przed naszą erą', () => {
    assert.equal(SHELF_CARDS_BC.length, 4);
    for (const c of SHELF_CARDS_BC) assert.ok(c.year < 0, `year=${c.year}`);
  });
  t('47. każda karta BC przechodzi judgeShelf i trafia w SHELVES_BC', () => {
    for (const c of SHELF_CARDS_BC) {
      const century = centuryNumber(c.year);
      assert.equal(judgeShelf(c.year, century, true).ok, true, `year=${c.year}`);
      assert.ok(SHELVES_BC.includes(century), `wiek ${century} spoza SHELVES_BC`);
    }
  });
});

/* --- F) cyfry rzymskie i tablice ------------------------------------- */

group('F) cyfry rzymskie i tablice', () => {
  for (const [numeral, expected] of [
    ['MDCCXCI', 1791],
    ['MCM', 1900],
    ['MDCCCLXIII', 1863],
    ['MCMXVIII', 1918],
    ['XIV', 14],
    ['XLIX', 49],
  ]) {
    t(`48. romanToNumber('${numeral}') = ${expected}`, () => {
      assert.equal(romanToNumber(numeral), expected);
    });
  }
  t("49. romanSteps('XC'): signed [-10, 100]", () => {
    assert.deepEqual(
      romanSteps('XC').map((s) => s.signed),
      [-10, 100]
    );
  });
  t("50. romanSteps('MCM'): ostatni total 1900", () => {
    assert.equal(romanSteps('MCM').at(-1).total, 1900);
  });
  t("51. romanSteps('MA') rzuca błąd", () => {
    assert.throws(() => romanSteps('MA'));
  });
  t('52. każda tablica PLAQUES trafia wiekiem w DIAL_CENTURIES', () => {
    for (const p of PLAQUES) {
      const century = centuryNumber(romanToNumber(p.numeral));
      assert.ok(DIAL_CENTURIES.includes(century), `${p.numeral} → wiek ${century}`);
    }
  });
  t('53. judgePlaqueCentury(1900, 19) ok', () => {
    assert.equal(judgePlaqueCentury(1900, 19).ok, true);
  });
  t('54. judgePlaqueCentury(1900, 20) nie ok', () => {
    assert.equal(judgePlaqueCentury(1900, 20).ok, false);
  });
  t('55. judgePlaqueCentury(1791, 18) ok', () => {
    assert.equal(judgePlaqueCentury(1791, 18).ok, true);
  });
  t('56. judgePlaqueCentury(1791, 17) nie ok', () => {
    assert.equal(judgePlaqueCentury(1791, 17).ok, false);
  });
});

if (failures.length === 0) {
  console.log(`\nOK ${total}`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}
