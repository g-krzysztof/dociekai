/**
 * Selftest czystych funkcji L6 (`os-czasu-i-epoki`).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/streak-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l6-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l6-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * from '${root}/src/app/historia/klasa-4/components/lessons/os-czasu-i-epoki/doba';\n` +
    `export * from '${root}/src/app/historia/klasa-4/components/lessons/os-czasu-i-epoki/epoki';\n`
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node' });

const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const {
  agoToSecond,
  yearsAgo,
  formatClock,
  placeEvents,
  secondsForYears,
  advanceAngle,
  pointerAngle,
  polar,
  secondToAngle,
  DIALS,
  judgeOrder,
  orderMessage,
  BOUNDARIES,
  judgeBoundary,
  liveYearLabel,
  eraOf,
  ERA_LENGTHS,
  eraLengthLabel,
  guessesShrink,
  compareBeams,
  biggestMiss,
  MEDIEVAL_ENDS,
  judgeReason,
  REASON_ORDER,
  CHANGE_REASONS,
  erasWithEnd,
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

/* --- A) doba ---------------------------------------------------------- */

group('A) doba', () => {
  t('1. pismo (ok. 3400 p.n.e.) wypada o 23:34', () => {
    assert.equal(formatClock(agoToSecond(yearsAgo(-3400, NOW))), '23:34');
  });

  t('2. Rzym (-753) o 23:47', () => {
    assert.equal(formatClock(agoToSecond(yearsAgo(-753, NOW))), '23:47');
  });
  t('2. Kolumb (1492) o 23:57', () => {
    assert.equal(formatClock(agoToSecond(yearsAgo(1492, NOW))), '23:57');
  });

  t("3. pierwsi ludzie (300 000 lat temu) o 0:00", () => {
    assert.equal(formatClock(agoToSecond(300000)), '0:00');
  });
  t("3. dziś (86400 s) to 24:00", () => {
    assert.equal(formatClock(86400), '24:00');
  });
  t('3. dziś z sekundami to 24:00:00', () => {
    assert.equal(formatClock(86400, true), '24:00:00');
  });

  t('4. placeEvents: posortowane rosnąco po second', () => {
    const placed = placeEvents(NOW);
    const seconds = placed.map((e) => e.second);
    assert.deepEqual([...seconds].sort((a, b) => a - b), seconds);
  });
  t("4. placeEvents: ostatni element ma id 'ty'", () => {
    const placed = placeEvents(NOW);
    assert.equal(placed[placed.length - 1].id, 'ty');
  });
  t("4. placeEvents: 'pismo' na tarczy godzina", () => {
    assert.equal(placeEvents(NOW).find((e) => e.id === 'pismo').dial, 'godzina');
  });
  t("4. placeEvents: 'ludzie' na tarczy doba", () => {
    assert.equal(placeEvents(NOW).find((e) => e.id === 'ludzie').dial, 'doba');
  });
  t("4. placeEvents: 'niepodleglosc' na tarczy minuta", () => {
    assert.equal(placeEvents(NOW).find((e) => e.id === 'niepodleglosc').dial, 'minuta');
  });
  t("4. placeEvents: 'kosmos' na tarczy minuta", () => {
    assert.equal(placeEvents(NOW).find((e) => e.id === 'kosmos').dial, 'minuta');
  });
  t("4. placeEvents: 'kolumb' na tarczy godzina", () => {
    assert.equal(placeEvents(NOW).find((e) => e.id === 'kolumb').dial, 'godzina');
  });

  t("5. placeEvents(2026, 2016): 'ty' to twoje urodziny w ostatnie ~3 s", () => {
    const ty = placeEvents(NOW, 2016).find((e) => e.id === 'ty');
    assert.equal(ty.label, 'twoje urodziny');
    assert.ok(Math.abs(ty.second - (86400 - 2.88)) < 0.01, `second=${ty.second}`);
  });
  t("5. placeEvents(2026, 1900): absurdalny rok → ktoś w twoim wieku się rodzi", () => {
    const ty = placeEvents(NOW, 1900).find((e) => e.id === 'ty');
    assert.equal(ty.label, 'ktoś w twoim wieku się rodzi');
  });

  t('6. secondsForYears(10) ≈ 2.88', () => {
    assert.ok(Math.abs(secondsForYears(10) - 2.88) < 0.01, `jest ${secondsForYears(10)}`);
  });

  t('7. advanceAngle(10, 30) idzie do przodu', () => {
    assert.equal(advanceAngle(10, 30), 30);
  });
  t('7. advanceAngle(10, 5) nie cofa wskazówki', () => {
    assert.equal(advanceAngle(10, 5), 10);
  });
  t('7. advanceAngle(10, 100) odrzuca za duży skok', () => {
    assert.equal(advanceAngle(10, 100), 10);
  });
  t('7. advanceAngle(350, 5) przycina do 360', () => {
    assert.equal(advanceAngle(350, 5), 360);
  });
  t('7. advanceAngle(0, 359) nie przeskakuje przez 0', () => {
    assert.equal(advanceAngle(0, 359), 0);
  });

  t('8. pointerAngle(0, -1) to godzina 12', () => {
    assert.equal(pointerAngle(0, -1), 0);
  });
  t('8. pointerAngle(1, 0) to godzina 3', () => {
    assert.equal(pointerAngle(1, 0), 90);
  });
  t('8. pointerAngle(0, 1) to godzina 6', () => {
    assert.equal(pointerAngle(0, 1), 180);
  });
  t('8. pointerAngle(-1, 0) to godzina 9', () => {
    assert.equal(pointerAngle(-1, 0), 270);
  });

  t('9. polar(100, 100, 50, 90) to punkt na godzinie 3', () => {
    assert.deepEqual(polar(100, 100, 50, 90), { x: 150, y: 100 });
  });

  t('10. początek tarczy godziny to kąt 0', () => {
    assert.equal(secondToAngle(23 * 3600, DIALS[1]), 0);
  });
  t('10. koniec tarczy godziny to kąt 360', () => {
    assert.equal(secondToAngle(86400, DIALS[1]), 360);
  });
});

/* --- B) epoki --------------------------------------------------------- */

group('B) epoki', () => {
  t('11. poprawna kolejność kart: ok', () => {
    const v = judgeOrder(['piramidy', 'zamek', 'kolumb', 'kopernik', 'niepodleglosc', 'rakieta'], NOW);
    assert.deepEqual(v, { ok: true });
  });

  t('12. jedna pusta karta: niepełne, brakuje 1', () => {
    const v = judgeOrder(['piramidy', 'zamek', null, 'kopernik', 'niepodleglosc', 'rakieta'], NOW);
    assert.equal(v.ok, false);
    assert.equal(v.reason, 'niepelne');
    assert.equal(v.missing, 1);
  });

  t('13. kolumb przed zamkiem: werdykt o kolejności', () => {
    const v = judgeOrder(['piramidy', 'kolumb', 'zamek', 'kopernik', 'niepodleglosc', 'rakieta'], NOW);
    assert.equal(v.ok, false);
    assert.equal(v.reason, 'kolejnosc');
    assert.equal(v.later.id, 'kolumb');
    assert.equal(v.earlier.id, 'zamek');
    assert.equal(v.slot, 1);
  });
  t("13. komunikat nazywa daty: '1492' i 'XIV w.'", () => {
    const v = judgeOrder(['piramidy', 'kolumb', 'zamek', 'kopernik', 'niepodleglosc', 'rakieta'], NOW);
    const msg = orderMessage(v);
    assert.ok(msg.includes('1492'), `brak 1492: ${msg}`);
    assert.ok(msg.includes('XIV w.'), `brak XIV w.: ${msg}`);
  });

  t('14. granica 1492 w punkt: ok', () => {
    assert.equal(judgeBoundary(BOUNDARIES[2], 1492).ok, true);
  });
  t("14. granica 1492 przy 1700: za późno (wcześniej), offBy 208; 1600 jeszcze w tolerancji", () => {
    assert.equal(judgeBoundary(BOUNDARIES[2], 1600).ok, true);
    const v = judgeBoundary(BOUNDARIES[2], 1700);
    assert.equal(v.ok, false);
    assert.equal(v.direction, 'wczesniej');
    assert.equal(v.offBy, 208);
  });
  t('14. granica 1492 przy 1300: za wcześnie (później)', () => {
    const v = judgeBoundary(BOUNDARIES[2], 1300);
    assert.equal(v.direction, 'pozniej');
  });

  t('15. granica pisma: rok astronomiczny -3399 = 3400 p.n.e.', () => {
    assert.equal(judgeBoundary(BOUNDARIES[0], -3399).ok, true);
  });

  t("16. liveYearLabel(1487) to 'ok. 1490'", () => {
    assert.equal(liveYearLabel(1487), 'ok. 1490');
  });
  t("16. liveYearLabel(-3399) to 'ok. 3400 p.n.e.'", () => {
    assert.equal(liveYearLabel(-3399), 'ok. 3400 p.n.e.');
  });

  t('17. eraOf(-2499) to starożytność', () => {
    assert.equal(eraOf(-2499), 'starożytność');
  });
  t('17. eraOf(1350) to średniowiecze', () => {
    assert.equal(eraOf(1350), 'średniowiecze');
  });
  t('17. eraOf(1961) to współczesność', () => {
    assert.equal(eraOf(1961), 'współczesność');
  });
  t('17. eraOf(-5000) to prehistoria', () => {
    assert.equal(eraOf(-5000), 'prehistoria');
  });
  t('17. eraOf(1492) to nowożytność', () => {
    assert.equal(eraOf(1492), 'nowożytność');
  });

  t('18. długości epok przy now=2026: 3875, 1016, 426, 108', () => {
    assert.deepEqual(
      ERA_LENGTHS.map((e) => e.years(NOW)),
      [3875, 1016, 426, 108]
    );
  });
  t("18. eraLengthLabel starożytności to 'ok. 3900 lat'", () => {
    assert.equal(eraLengthLabel(ERA_LENGTHS[0], NOW), 'ok. 3900 lat');
  });
  t("18. eraLengthLabel współczesności mówi, że wciąż trwa", () => {
    assert.ok(eraLengthLabel(ERA_LENGTHS[3], NOW).includes('wciąż trwa'));
  });

  t('19. belki malejące: guessesShrink true', () => {
    assert.equal(
      guessesShrink({ starozytnosc: 3000, sredniowiecze: 1000, nowozytnosc: 500, wspolczesnosc: 100 }),
      true
    );
  });
  t('19. równe belki: guessesShrink false', () => {
    assert.equal(
      guessesShrink({ starozytnosc: 1000, sredniowiecze: 1000, nowozytnosc: 1000, wspolczesnosc: 1000 }),
      false
    );
  });

  t('20. biggestMiss: współczesność (1000 zamiast 108)', () => {
    const cmp = compareBeams(
      { starozytnosc: 3900, sredniowiecze: 1000, nowozytnosc: 400, wspolczesnosc: 1000 },
      NOW
    );
    assert.equal(biggestMiss(cmp).id, 'wspolczesnosc');
  });

  for (const m of MEDIEVAL_ENDS) {
    t(`21. własny powód kandydata ok: ${m.id} ↔ ${m.changed}`, () => {
      assert.equal(judgeReason(m.id, m.changed).ok, true);
    });
  }
  t("21. druk nie zmienił świata: ok false", () => {
    assert.equal(judgeReason('druk', 'swiat').ok, false);
  });
  t('21. REASON_ORDER miesza powody bez zgadywania po pozycji', () => {
    assert.deepEqual([...REASON_ORDER].sort(), Object.keys(CHANGE_REASONS).sort());
    assert.deepEqual([...new Set(REASON_ORDER)], REASON_ORDER);
    assert.notDeepEqual(REASON_ORDER, MEDIEVAL_ENDS.map((m) => m.changed));
  });

  t('22. erasWithEnd(1453): średniowiecze 977, nowożytność 465', () => {
    assert.deepEqual(erasWithEnd(1453), { sredniowiecze: 977, nowozytnosc: 465 });
  });
});

if (failures.length === 0) {
  console.log(`\nOK ${total}`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}
