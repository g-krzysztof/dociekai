/**
 * Selftest czystych funkcji L9 (`mapa-i-plan`: kazimierz, grunwald, plan-wioski).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l8-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l9-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l9-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as K from '${root}/src/app/historia/klasa-4/components/lessons/mapa-i-plan/kazimierz';\n` +
    `export * as G from '${root}/src/app/historia/klasa-4/components/lessons/mapa-i-plan/grunwald';\n` +
    `export * as W from '${root}/src/app/historia/klasa-4/components/lessons/mapa-i-plan/plan-wioski';\n`
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

const { K, G, W } = lib;

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

const cityAt = (id) => K.CITIES.find((c) => c.id === id).at;

/* --- A) kazimierz: regionAt ------------------------------------------------ */

group('A) kazimierz: regionAt', () => {
  t('1. Lwów leży na Rusi', () => {
    assert.equal(K.regionAt(cityAt('lwow'))?.id, 'rus');
  });
  t('2. Przemyśl leży na Rusi', () => {
    assert.equal(K.regionAt(cityAt('przemysl'))?.id, 'rus');
  });
  t('3. Kraków leży w Królestwie', () => {
    assert.equal(K.regionAt(cityAt('krakow'))?.id, 'krolestwo');
  });
  t('4. Sandomierz leży w Królestwie', () => {
    assert.equal(K.regionAt(cityAt('sandomierz'))?.id, 'krolestwo');
  });
  t('5. Będzin leży w Królestwie', () => {
    assert.equal(K.regionAt(cityAt('bedzin'))?.id, 'krolestwo');
  });
  t('6. Łęczyca leży w Królestwie', () => {
    assert.equal(K.regionAt(cityAt('leczyca'))?.id, 'krolestwo');
  });
  t('7. Gniezno leży w Królestwie', () => {
    assert.equal(K.regionAt(cityAt('gniezno'))?.id, 'krolestwo');
  });
  t('8. Poznań leży w Królestwie', () => {
    assert.equal(K.regionAt(cityAt('poznan'))?.id, 'krolestwo');
  });
  t('9. Kruszwica leży na Kujawach', () => {
    assert.equal(K.regionAt(cityAt('kruszwica'))?.id, 'kujawy');
  });
  t('10. Płock leży w ziemi płockiej', () => {
    assert.equal(K.regionAt(cityAt('plock'))?.id, 'plock');
  });
  t('11. Warszawa leży poza Królestwem (undefined)', () => {
    assert.equal(K.regionAt(cityAt('warszawa')), undefined);
  });
  t('12. Toruń leży poza Królestwem (undefined)', () => {
    assert.equal(K.regionAt(cityAt('torun')), undefined);
  });
});

/* --- B) kazimierz: stałe --------------------------------------------------- */

group('B) kazimierz: stałe', () => {
  t('13. KRAKOW_GNIEZNO_KM między 300 a 340', () => {
    assert.ok(K.KRAKOW_GNIEZNO_KM >= 300 && K.KRAKOW_GNIEZNO_KM <= 340, `jest ${K.KRAKOW_GNIEZNO_KM}`);
  });
  t('14. ANNEXED_IDS ma 3 elementy: kujawy, plock, rus', () => {
    assert.equal(K.ANNEXED_IDS.length, 3);
    assert.deepEqual(K.ANNEXED_IDS, ['kujawy', 'plock', 'rus']);
  });
});

/* --- C) kazimierz: judgeTap gdzie / kiedy ---------------------------------- */

group('C) kazimierz: judgeTap gdzie / kiedy', () => {
  t("15. 'gdzie': tytuł index 0 → ok", () => {
    const v = K.judgeTap('gdzie', { kind: 'title', index: 0 });
    assert.equal(v.ok, true);
  });
  t("16. 'gdzie': tytuł index 2 → nie ok", () => {
    assert.equal(K.judgeTap('gdzie', { kind: 'title', index: 2 }).ok, false);
  });
  t("17. 'kiedy': tytuł index 1 → ok", () => {
    assert.equal(K.judgeTap('kiedy', { kind: 'title', index: 1 }).ok, true);
  });
  t("18. 'kiedy': tytuł index 2 → ok", () => {
    assert.equal(K.judgeTap('kiedy', { kind: 'title', index: 2 }).ok, true);
  });
  t("19. 'kiedy': tytuł index 0 → nie ok", () => {
    assert.equal(K.judgeTap('kiedy', { kind: 'title', index: 0 }).ok, false);
  });
  t("20. 'kiedy': stuknięcie w region → nie ok", () => {
    assert.equal(K.judgeTap('kiedy', { kind: 'region', id: 'rus' }).ok, false);
  });
});

/* --- D) kazimierz: judgeTap koronacja / przylaczone ------------------------ */

group('D) kazimierz: judgeTap koronacja / przylaczone', () => {
  t("21. 'koronacja': Kraków → ok", () => {
    const v = K.judgeTap('koronacja', { kind: 'city', id: 'krakow' });
    assert.equal(v.ok, true);
  });
  t("22. 'koronacja': Będzin (zamek) → nie ok", () => {
    assert.equal(K.judgeTap('koronacja', { kind: 'city', id: 'bedzin' }).ok, false);
  });
  t("23. 'koronacja': region → nie ok", () => {
    assert.equal(K.judgeTap('koronacja', { kind: 'region', id: 'krolestwo' }).ok, false);
  });
  t("24. 'przylaczone': Ruś → ok, hit to id", () => {
    const v = K.judgeTap('przylaczone', { kind: 'region', id: 'rus' });
    assert.equal(v.ok, true);
    assert.equal(v.hit, 'rus');
  });
  t("25. 'przylaczone': Kujawy → ok", () => {
    const v = K.judgeTap('przylaczone', { kind: 'region', id: 'kujawy' });
    assert.equal(v.ok, true);
    assert.equal(v.hit, 'kujawy');
  });
  t("26. 'przylaczone': ziemia płocka → ok", () => {
    const v = K.judgeTap('przylaczone', { kind: 'region', id: 'plock' });
    assert.equal(v.ok, true);
    assert.equal(v.hit, 'plock');
  });
  t("27. 'przylaczone': Królestwo (1333) → nie ok", () => {
    assert.equal(K.judgeTap('przylaczone', { kind: 'region', id: 'krolestwo' }).ok, false);
  });
  t("28. 'przylaczone': outside → nie ok", () => {
    assert.equal(K.judgeTap('przylaczone', { kind: 'outside' }).ok, false);
  });
  t("29. 'przylaczone': miasto Lwów → ok, hit 'rus'", () => {
    const v = K.judgeTap('przylaczone', { kind: 'city', id: 'lwow' });
    assert.equal(v.ok, true);
    assert.equal(v.hit, 'rus');
  });
});

/* --- E) kazimierz: judgeTap zamek-rus -------------------------------------- */

group('E) kazimierz: judgeTap zamek-rus', () => {
  t("30. 'zamek-rus': Przemyśl → ok", () => {
    assert.equal(K.judgeTap('zamek-rus', { kind: 'city', id: 'przemysl' }).ok, true);
  });
  t("31. 'zamek-rus': Lwów → ok", () => {
    assert.equal(K.judgeTap('zamek-rus', { kind: 'city', id: 'lwow' }).ok, true);
  });
  t("32. 'zamek-rus': Będzin → nie ok, note zawiera 'Będzin'", () => {
    const v = K.judgeTap('zamek-rus', { kind: 'city', id: 'bedzin' });
    assert.equal(v.ok, false);
    assert.ok(v.note.includes('Będzin'), v.note);
  });
  t("33. 'zamek-rus': Kruszwica (Kujawy) → nie ok", () => {
    assert.equal(K.judgeTap('zamek-rus', { kind: 'city', id: 'kruszwica' }).ok, false);
  });
  t("34. 'zamek-rus': Gniezno (miasto, nie zamek) → nie ok", () => {
    assert.equal(K.judgeTap('zamek-rus', { kind: 'city', id: 'gniezno' }).ok, false);
  });
  t("35. 'zamek-rus': region → nie ok", () => {
    assert.equal(K.judgeTap('zamek-rus', { kind: 'region', id: 'rus' }).ok, false);
  });
});

/* --- F) kazimierz: linijka ------------------------------------------------- */

group('F) kazimierz: linijka', () => {
  const krakow = K.project(cityAt('krakow'));
  const gniezno = K.project(cityAt('gniezno'));
  t('36. końce w Krakowie i Gnieźnie + odczyt KM → ok', () => {
    assert.equal(K.judgeRuler(krakow, gniezno, K.KRAKOW_GNIEZNO_KM).ok, true);
  });
  t('37. zamienione końce + ten sam odczyt → ok', () => {
    assert.equal(K.judgeRuler(gniezno, krakow, K.KRAKOW_GNIEZNO_KM).ok, true);
  });
  t("38. koniec 30 jednostek obok → reason 'konce'", () => {
    const v = K.judgeRuler(krakow, [gniezno[0] + 30, gniezno[1]], K.KRAKOW_GNIEZNO_KM);
    assert.equal(v.ok, false);
    assert.equal(v.reason, 'konce');
  });
  t("39. odczyt null → reason 'puste'", () => {
    const v = K.judgeRuler(krakow, gniezno, null);
    assert.equal(v.ok, false);
    assert.equal(v.reason, 'puste');
  });
  t("40. odczyt 200 → reason 'odczyt-za-malo'", () => {
    const v = K.judgeRuler(krakow, gniezno, 200);
    assert.equal(v.ok, false);
    assert.equal(v.reason, 'odczyt-za-malo');
  });
  t("41. odczyt 450 → reason 'odczyt-za-duzo'", () => {
    const v = K.judgeRuler(krakow, gniezno, 450);
    assert.equal(v.ok, false);
    assert.equal(v.reason, 'odczyt-za-duzo');
  });
  t('42. odczyt KM − TOLERANCJA (granica) → ok', () => {
    assert.equal(K.judgeRuler(krakow, gniezno, K.KRAKOW_GNIEZNO_KM - K.READING_TOLERANCE_KM).ok, true);
  });
  t('43. odczyt KM + TOLERANCJA (granica) → ok', () => {
    assert.equal(K.judgeRuler(krakow, gniezno, K.KRAKOW_GNIEZNO_KM + K.READING_TOLERANCE_KM).ok, true);
  });
  t('44. niceScaleKm(1/1.5146) === 100', () => {
    assert.equal(K.niceScaleKm(1 / 1.5146), 100);
  });
  t('45. niceScaleKm(100) === 1', () => {
    assert.equal(K.niceScaleKm(100), 1);
  });
});

/* --- G) grunwald: zoom i plan ---------------------------------------------- */

group('G) grunwald: zoom i plan', () => {
  t('46. zoomOf(0) ≈ 1', () => {
    assert.ok(Math.abs(G.zoomOf(0) - 1) < 1e-12, `jest ${G.zoomOf(0)}`);
  });
  t('47. zoomOf(1) ≈ MAX_ZOOM', () => {
    assert.ok(Math.abs(G.zoomOf(1) - G.MAX_ZOOM) < 1e-9, `jest ${G.zoomOf(1)}`);
  });
  t('48. zoomOf rośnie z suwakiem', () => {
    const zs = [0, 0.25, 0.5, 0.75, 1].map((s) => G.zoomOf(s));
    for (let i = 1; i < zs.length; i++) assert.ok(zs[i] > zs[i - 1], `${zs}`);
  });
  t('49. planOpacity(1) === 0', () => {
    assert.equal(G.planOpacity(1), 0);
  });
  t('50. planOpacity(PLAN_FROM_ZOOM) === 1', () => {
    assert.equal(G.planOpacity(G.PLAN_FROM_ZOOM), 1);
  });
  t('51. PHASES.length === LAST_PHASE + 1', () => {
    assert.equal(G.PHASES.length, G.LAST_PHASE + 1);
  });
});

/* --- H) grunwald: ruch wojsk ----------------------------------------------- */

group('H) grunwald: ruch wojsk', () => {
  const ids = G.UNITS.map((u) => u.id);
  const atStart = { z1: 52, z2: 53, z3: 54, mistrz: 55, litwa: 56, p1: 57, p2: 58 };
  for (const u of G.UNITS) {
    t(`${atStart[u.id]}. unitAt(${u.id}, 0) === path[0]`, () => {
      assert.deepEqual(G.unitAt(u, 0), [...u.path[0]]);
    });
  }
  const atEnd = { z1: 59, z2: 60, z3: 61, mistrz: 62, litwa: 63, p1: 64, p2: 65 };
  for (const u of G.UNITS) {
    t(`${atEnd[u.id]}. unitAt(${u.id}, LAST_PHASE) === path[LAST_PHASE]`, () => {
      assert.deepEqual(G.unitAt(u, G.LAST_PHASE), [...u.path[G.LAST_PHASE]]);
    });
  }
  assert.deepEqual(ids, ['z1', 'z2', 'z3', 'mistrz', 'litwa', 'p1', 'p2']);
  t('66. unitAt(z1, 0.5) to średnia path[0] i path[1]', () => {
    const u = G.UNITS.find((x) => x.id === 'z1');
    const [ax, ay] = u.path[0];
    const [bx, by] = u.path[1];
    const [px, py] = G.unitAt(u, 0.5);
    assert.ok(Math.abs(px - (ax + bx) / 2) < 1e-9, `${px}`);
    assert.ok(Math.abs(py - (ay + by) / 2) < 1e-9, `${py}`);
  });
  t("67. moveInPhase(z2, 0.5) === null (oddział stoi)", () => {
    assert.equal(G.moveInPhase(G.UNITS.find((x) => x.id === 'z2'), 0.5), null);
  });
  t('68. moveInPhase(litwa, 0.5) nie null (oddział idzie)', () => {
    const u = G.UNITS.find((x) => x.id === 'litwa');
    const m = G.moveInPhase(u, 0.5);
    assert.ok(m !== null);
    assert.deepEqual(m, [[...u.path[0]], [...u.path[1]]]);
  });
  t('69. każdy unit ma path o długości PHASES.length', () => {
    for (const u of G.UNITS) assert.equal(u.path.length, G.PHASES.length, u.id);
  });
});

/* --- I) plan-wioski: sędzia ------------------------------------------------ */

const GOOD = {
  placed: [
    { key: 1, shape: 'kolo', at: [100, 100] },
    { key: 2, shape: 'trojkat', at: [200, 200] },
    { key: 3, shape: 'kwadrat', at: [400, 100] },
    { key: 4, shape: 'gwiazda', at: [500, 200] },
  ],
  legend: [
    { key: 1, shape: 'kolo', meaning: 'kosciol' },
    { key: 2, shape: 'trojkat', meaning: 'mlyn' },
    { key: 3, shape: 'kwadrat', meaning: 'szkola' },
    { key: 4, shape: 'gwiazda', meaning: 'las' },
  ],
  north: { at: [550, 50], rot: 0 },
};

group('I) plan-wioski: sędzia', () => {
  t('70. pusty stan: znaki nie ok', () => {
    assert.equal(W.judgeVillage({ placed: [], legend: [], north: null }).znaki.ok, false);
  });
  t('71. pusty stan: polnoc nie ok', () => {
    assert.equal(W.judgeVillage({ placed: [], legend: [], north: null }).polnoc.ok, false);
  });
  t('72. dobry stan: znaki ok', () => {
    assert.equal(W.judgeVillage(GOOD).znaki.ok, true);
  });
  t('73. dobry stan: kazdy-w-legendzie ok', () => {
    assert.equal(W.judgeVillage(GOOD)['kazdy-w-legendzie'].ok, true);
  });
  t('74. dobry stan: legenda-bez-nadmiaru ok', () => {
    assert.equal(W.judgeVillage(GOOD)['legenda-bez-nadmiaru'].ok, true);
  });
  t('75. dobry stan: jednoznacznie ok', () => {
    assert.equal(W.judgeVillage(GOOD).jednoznacznie.ok, true);
  });
  t('76. dobry stan: polnoc ok', () => {
    assert.equal(W.judgeVillage(GOOD).polnoc.ok, true);
  });
  t('77. brak wiersza legendy → kazdy-w-legendzie nie ok', () => {
    const s = { ...GOOD, legend: GOOD.legend.filter((r) => r.shape !== 'kwadrat') };
    assert.equal(W.judgeVillage(s)['kazdy-w-legendzie'].ok, false);
  });
  t('78. wiersz bez znaku na planie → legenda-bez-nadmiaru nie ok', () => {
    const s = { ...GOOD, legend: [...GOOD.legend, { key: 5, shape: 'romb', meaning: 'studnia' }] };
    assert.equal(W.judgeVillage(s)['legenda-bez-nadmiaru'].ok, false);
  });
  t('79. ten sam kształt, dwa znaczenia → jednoznacznie nie ok', () => {
    const s = {
      ...GOOD,
      legend: [
        { key: 1, shape: 'kolo', meaning: 'kosciol' },
        { key: 2, shape: 'kolo', meaning: 'mlyn' },
        { key: 3, shape: 'trojkat', meaning: 'szkola' },
        { key: 4, shape: 'kwadrat', meaning: 'las' },
        { key: 5, shape: 'gwiazda', meaning: 'karczma' },
      ],
    };
    assert.equal(W.judgeVillage(s).jednoznacznie.ok, false);
  });
  t('80. dwa kształty, to samo znaczenie → jednoznacznie nie ok', () => {
    const s = {
      ...GOOD,
      legend: [
        { key: 1, shape: 'kolo', meaning: 'kosciol' },
        { key: 2, shape: 'trojkat', meaning: 'kosciol' },
        { key: 3, shape: 'kwadrat', meaning: 'szkola' },
        { key: 4, shape: 'gwiazda', meaning: 'las' },
      ],
    };
    assert.equal(W.judgeVillage(s).jednoznacznie.ok, false);
  });
  t('81. wiersz z kształtem bez znaczenia → kazdy-w-legendzie nie ok', () => {
    const s = { ...GOOD, legend: [...GOOD.legend, { key: 6, shape: 'romb', meaning: null }] };
    assert.equal(W.judgeVillage(s)['kazdy-w-legendzie'].ok, false);
  });
});

/* --- J) plan-wioski: czytelnik --------------------------------------------- */

group('J) plan-wioski: czytelnik', () => {
  t("82. directionOf([300,30], 0) === 'północy'", () => {
    assert.equal(W.directionOf([300, 30], 0), 'północy');
  });
  t("83. directionOf([300,30], 180) === 'południu'", () => {
    assert.equal(W.directionOf([300, 30], 180), 'południu');
  });
  t("84. directionOf([570,210], 0) === 'wschodzie'", () => {
    assert.equal(W.directionOf([570, 210], 0), 'wschodzie');
  });
  t("85. directionOf([570,210], 90) === 'północy'", () => {
    assert.equal(W.directionOf([570, 210], 90), 'północy');
  });
  t('86. directionOf([300,210], 0) === null (środek)', () => {
    assert.equal(W.directionOf([300, 210], 0), null);
  });
  t('87. readVillage bez north: pierwsza linia ma lost', () => {
    const lines = W.readVillage({
      placed: [{ key: 1, shape: 'kolo', at: [100, 100] }],
      legend: [{ key: 1, shape: 'kolo', meaning: 'kosciol' }],
      north: null,
    });
    assert.equal(lines[0].lost, true);
  });
  t("88. znak bez legendy: linia z lost, zawiera 'Gubię się'", () => {
    const lines = W.readVillage({
      placed: [{ key: 1, shape: 'kolo', at: [100, 100] }],
      legend: [{ key: 1, shape: 'trojkat', meaning: 'mlyn' }],
      north: { at: [550, 50], rot: 0 },
    });
    const lost = lines.find((l) => l.text.includes('Gubię się'));
    assert.ok(lost, JSON.stringify(lines));
    assert.equal(lost.lost, true);
  });
  t("89. most na RIVER[3] z legendą 'most': linia zawiera 'mostem przez rzekę'", () => {
    const lines = W.readVillage({
      placed: [{ key: 1, shape: 'kolo', at: W.RIVER[3] }],
      legend: [{ key: 1, shape: 'kolo', meaning: 'most' }],
      north: { at: [550, 50], rot: 0 },
    });
    assert.ok(
      lines.some((l) => l.text.includes('mostem przez rzekę')),
      JSON.stringify(lines)
    );
  });
  t("90. wiersz legendy bez znaku: linia zawiera 'obiecuje'", () => {
    const lines = W.readVillage({
      placed: [{ key: 1, shape: 'kolo', at: [100, 100] }],
      legend: [
        { key: 1, shape: 'kolo', meaning: 'kosciol' },
        { key: 2, shape: 'trojkat', meaning: 'mlyn' },
      ],
      north: { at: [550, 50], rot: 0 },
    });
    assert.ok(
      lines.some((l) => l.text.includes('obiecuje')),
      JSON.stringify(lines)
    );
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}
