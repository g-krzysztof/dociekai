/**
 * Selftest czystych funkcji L10 (`symbole-narodowe`: flaga, orly, trasa, szacunek, hymn-dane).
 *
 * Uruchamiany przez `npm run test:unit`; skrypt
 * bundluje moduły esbuildem — jak scripts/historia-l9-selftest.mjs — i odpala
 * asercje na sędziach bez Reacta.
 *
 *   node scripts/historia-l10-selftest.mjs
 */

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'historia-l10-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * as F from '${root}/src/app/historia/klasa-4/components/lessons/symbole-narodowe/flaga';\n` +
    `export * as O from '${root}/src/app/historia/klasa-4/components/lessons/symbole-narodowe/orly';\n` +
    `export * as T from '${root}/src/app/historia/klasa-4/components/lessons/symbole-narodowe/trasa';\n` +
    `export * as S from '${root}/src/app/historia/klasa-4/components/lessons/symbole-narodowe/szacunek';\n` +
    `export * as H from '${root}/src/app/historia/klasa-4/components/lessons/symbole-narodowe/hymn-dane';\n`
);

/** Alias `@/` → `<root>/src/` (tsconfig paths), jak w Next. */
const aliasPlugin = {
  name: 'at-alias',
  setup(b) {
    b.onResolve({ filter: /^@\// }, (args) => {
      const base = join(root, 'src', args.path.slice(2));
      for (const cand of [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), base]) {
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

const { F, O, T, S, H } = lib;

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

/* --- A) flaga: maszt ------------------------------------------------------ */

group('A) flaga: maszt', () => {
  t('1. święto na szczycie → ok', () => {
    assert.equal(F.judgeMast('swieto', { height: 1, maxHeight: 1 }).ok, true);
  });
  t('2. święto w połowie → nie ok', () => {
    assert.equal(F.judgeMast('swieto', { height: 0.5, maxHeight: 0.5 }).ok, false);
  });
  t("3. święto w połowie → kind 'nie-do-szczytu'", () => {
    assert.equal(F.judgeMast('swieto', { height: 0.5, maxHeight: 0.5 }).kind, 'nie-do-szczytu');
  });
  t('4. żałoba w połowie (po szczycie) → ok', () => {
    assert.equal(F.judgeMast('zaloba', { height: 0.5, maxHeight: 1 }).ok, true);
  });
  t('5. żałoba w połowie bez szczytu → nie ok', () => {
    assert.equal(F.judgeMast('zaloba', { height: 0.5, maxHeight: 0.5 }).ok, false);
  });
  t("6. żałoba w połowie bez szczytu → kind 'pominiety-szczyt'", () => {
    assert.equal(F.judgeMast('zaloba', { height: 0.5, maxHeight: 0.5 }).kind, 'pominiety-szczyt');
  });
  t("7. żałoba na szczycie → kind 'za-wysoko-zaloba'", () => {
    assert.equal(F.judgeMast('zaloba', { height: 1, maxHeight: 1 }).kind, 'za-wysoko-zaloba');
  });
  t("8. żałoba przy ziemi → kind 'za-nisko'", () => {
    assert.equal(F.judgeMast('zaloba', { height: 0.2, maxHeight: 1 }).kind, 'za-nisko');
  });
  t('9. granica HALF_LO przyjmowana (żałoba ok)', () => {
    assert.equal(F.judgeMast('zaloba', { height: F.HALF_LO, maxHeight: 1 }).ok, true);
  });
  t('10. granica HALF_HI przyjmowana (żałoba ok)', () => {
    assert.equal(F.judgeMast('zaloba', { height: F.HALF_HI, maxHeight: 1 }).ok, true);
  });
});

/* --- B) flaga: okno -------------------------------------------------------- */

group('B) flaga: okno', () => {
  t('11. nextTurn(0) === 90', () => {
    assert.equal(F.nextTurn(0), 90);
  });
  t('12. nextTurn(90) === 180', () => {
    assert.equal(F.nextTurn(90), 180);
  });
  t('13. nextTurn(180) === 270', () => {
    assert.equal(F.nextTurn(180), 270);
  });
  t('14. nextTurn(270) === 0', () => {
    assert.equal(F.nextTurn(270), 0);
  });
  t("15. whiteSide(0) === 'gora'", () => {
    assert.equal(F.whiteSide(0), 'gora');
  });
  t("16. whiteSide(90) === 'prawo'", () => {
    assert.equal(F.whiteSide(90), 'prawo');
  });
  t("17. whiteSide(180) === 'dol'", () => {
    assert.equal(F.whiteSide(180), 'dol');
  });
  t("18. whiteSide(270) === 'lewo'", () => {
    assert.equal(F.whiteSide(270), 'lewo');
  });
  t('19. judgeWindow(270).ok === true', () => {
    assert.equal(F.judgeWindow(270).ok, true);
  });
  t("20. judgeWindow(0).kind === 'poziomo'", () => {
    assert.equal(F.judgeWindow(0).kind, 'poziomo');
  });
  t("21. judgeWindow(180).kind === 'do-gory-nogami'", () => {
    assert.equal(F.judgeWindow(180).kind, 'do-gory-nogami');
  });
  t("22. judgeWindow(90).kind === 'biel-z-prawej'", () => {
    assert.equal(F.judgeWindow(90).kind, 'biel-z-prawej');
  });
});

/* --- C) orły: etapy -------------------------------------------------------- */

group('C) orły: etapy', () => {
  t('23. pierwszy etap zaczyna się w YEAR_MIN', () => {
    assert.equal(O.STAGES[0].from, O.YEAR_MIN);
  });
  t('24. ostatni etap kończy się w YEAR_MAX', () => {
    assert.equal(O.STAGES[O.STAGES.length - 1].to, O.YEAR_MAX);
  });
  t('25. każdy rok YEAR_MIN..YEAR_MAX w dokładnie jednym etapie', () => {
    for (let y = O.YEAR_MIN; y <= O.YEAR_MAX; y++) {
      const n = O.STAGES.filter((s) => y >= s.from && y <= s.to).length;
      assert.equal(n, 1, `rok ${y}: ${n} etapów`);
    }
  });
  t('26. etapy stykają się bez dziur (to + 1 === next.from)', () => {
    for (let i = 1; i < O.STAGES.length; i++) {
      assert.equal(O.STAGES[i].from, O.STAGES[i - 1].to + 1, O.STAGES[i].id);
    }
  });
  t('27. stageAt(1294).crown === false', () => {
    assert.equal(O.stageAt(1294).crown, false);
  });
  t('28. stageAt(1295).crown === true', () => {
    assert.equal(O.stageAt(1295).crown, true);
  });
  t('29. stageAt(1944).crown === true', () => {
    assert.equal(O.stageAt(1944).crown, true);
  });
  t('30. stageAt(1945).crown === false', () => {
    assert.equal(O.stageAt(1945).crown, false);
  });
  t('31. stageAt(1988).crown === false', () => {
    assert.equal(O.stageAt(1988).crown, false);
  });
  t('32. stageAt(1989).crown === true', () => {
    assert.equal(O.stageAt(1989).crown, true);
  });
  t('33. stageAt(1800).state === false (zabory)', () => {
    assert.equal(O.stageAt(1800).state, false);
  });
});

/* --- D) orły: sędzia zatrzymania ------------------------------------------- */

group('D) orły: sędzia zatrzymania', () => {
  t('34. TASKS[0] w 1295 → ok', () => {
    assert.equal(O.judgeStop(O.TASKS[0], 1295).ok, true);
  });
  t('35. TASKS[0] w 1305 → ok (granica until)', () => {
    assert.equal(O.judgeStop(O.TASKS[0], 1305).ok, true);
  });
  t('36. TASKS[0] w 1294 → nie ok', () => {
    assert.equal(O.judgeStop(O.TASKS[0], 1294).ok, false);
  });
  t("37. TASKS[0] w 1294 → komunikat zawiera 'przesuń dalej'", () => {
    assert.ok(O.judgeStop(O.TASKS[0], 1294).message.includes('przesuń dalej'));
  });
  t('38. TASKS[0] w 1400 → nie ok', () => {
    assert.equal(O.judgeStop(O.TASKS[0], 1400).ok, false);
  });
  t("39. TASKS[0] w 1400 → komunikat zawiera 'Cofnij'", () => {
    assert.ok(O.judgeStop(O.TASKS[0], 1400).message.includes('Cofnij'));
  });
  t('40. TASKS[1] w 1945 → ok', () => {
    assert.equal(O.judgeStop(O.TASKS[1], 1945).ok, true);
  });
  t('41. TASKS[1] w 1955 → ok (granica until)', () => {
    assert.equal(O.judgeStop(O.TASKS[1], 1955).ok, true);
  });
  t('42. TASKS[1] w 1944 → nie ok', () => {
    assert.equal(O.judgeStop(O.TASKS[1], 1944).ok, false);
  });
  t("43. TASKS[1] w 1944 → komunikat zawiera 'przesuń dalej'", () => {
    assert.ok(O.judgeStop(O.TASKS[1], 1944).message.includes('przesuń dalej'));
  });
  t('44. TASKS[1] w 1960 → nie ok', () => {
    assert.equal(O.judgeStop(O.TASKS[1], 1960).ok, false);
  });
  t("45. TASKS[1] w 1960 → komunikat zawiera 'Cofnij'", () => {
    assert.ok(O.judgeStop(O.TASKS[1], 1960).message.includes('Cofnij'));
  });
  t('46. TASKS[2] w 1989 → ok', () => {
    assert.equal(O.judgeStop(O.TASKS[2], 1989).ok, true);
  });
  t('47. TASKS[2] w 1995 → ok (granica until)', () => {
    assert.equal(O.judgeStop(O.TASKS[2], 1995).ok, true);
  });
  t('48. TASKS[2] w 1988 → nie ok', () => {
    assert.equal(O.judgeStop(O.TASKS[2], 1988).ok, false);
  });
  t("49. TASKS[2] w 1988 → komunikat zawiera 'przesuń dalej'", () => {
    assert.ok(O.judgeStop(O.TASKS[2], 1988).message.includes('przesuń dalej'));
  });
  t('50. TASKS[2] w 2000 → nie ok', () => {
    assert.equal(O.judgeStop(O.TASKS[2], 2000).ok, false);
  });
  t("51. TASKS[2] w 2000 → komunikat zawiera 'Cofnij'", () => {
    assert.ok(O.judgeStop(O.TASKS[2], 2000).message.includes('Cofnij'));
  });
});

/* --- E) orły: obrazki ------------------------------------------------------- */

group('E) orły: obrazki', () => {
  // img() zamienia klucz z map.json na adres Cloudinary; bez wpisu zostaje ścieżka lokalna.
  t("52. każdy image leży w folderze lekcji 'historia/lekcje/symbole-narodowe/'", () => {
    for (const s of O.STAGES) {
      assert.ok(s.image.includes('/historia/lekcje/symbole-narodowe/'), `${s.id}: ${s.image}`);
    }
  });
  t('53. każdy image jest na Cloudinary albo istnieje w public/', () => {
    for (const s of O.STAGES) {
      const ok = s.image.startsWith('https://') || existsSync(join(root, 'public', s.image));
      assert.ok(ok, `${s.id}: ${s.image}`);
    }
  });
});

/* --- F) trasa legionów -------------------------------------------------------
 *
 * Dobra trasa omija literalne punkty ze specyfikacji, bo geometria rzek
 * (Natural Earth) układa się inaczej, niż sugerują okrągłe współrzędne:
 * noga proj(19.9,50.4) → proj(19.0,51.2) przecina górną Wartę, zanim droga
 * w ogóle dotknie Wisły. Dlatego najazd na Wisłę idzie dalej na wschód
 * (proj(21.0,50.0) — na pewno za rzeką pod Krakowem), a dopiero potem droga
 * wraca na północny zachód ku Poznaniowi. Czwarta noga przecina przy okazji
 * obie rzeki naraz, ale „wisła” jest już wtedy zapisana z nogi trzeciej,
 * więc kolejność zdarzeń zostaje dobra.
 */

const GOOD_ROUTE = [
  T.START,
  T.proj(13, 48.5),
  T.proj(18.5, 49.9),
  T.proj(21.0, 50.0),
  T.proj(19.0, 51.2),
  T.proj(17.0, 52.4),
];

/*
 * Odwrotna trasa też odbiega od specyfikacji o jedną współrzędną: koniec
 * ze specyfikacji (proj(20.5,52.3)) zatrzymuje się tuż przed Wisłą (rzeka
 * meandruje tam na wschód od nogi), więc zdarzenia to ['wlochy','warta'].
 * Sam sędzia i tak odpowiada kind 'kolejnosc' (Warta bez Wisły to też zła
 * kolejność), ale żeby przypadek był prawdziwym „najpierw Warta, potem
 * Wisła”, koniec idzie dalej na wschód (proj(22.0,52.0)) — za Wisłę.
 */
const REVERSE_ROUTE = [T.START, T.proj(13, 48.5), T.proj(15.0, 51.0), T.proj(17.0, 52.4), T.proj(22.0, 52.0)];
const SPEC_ROUTE = [T.START, T.proj(13, 48.5), T.proj(15.0, 51.0), T.proj(17.0, 52.4), T.proj(20.5, 52.3)];

group('F) trasa legionów', () => {
  t('54. krzyżujące się odcinki → true', () => {
    assert.equal(
      T.segmentsIntersect([0, 0], [10, 10], [0, 10], [10, 0]),
      true
    );
  });
  t('55. odcinki równoległe → false', () => {
    assert.equal(
      T.segmentsIntersect([0, 0], [10, 0], [0, 5], [10, 5]),
      false
    );
  });
  t('56. Wisła ma ponad 10 odcinków', () => {
    assert.ok(T.RIVER_SEGMENTS['Wisła'].length > 10, `jest ${T.RIVER_SEGMENTS['Wisła'].length}`);
  });
  t('57. Warta ma ponad 10 odcinków', () => {
    assert.ok(T.RIVER_SEGMENTS['Warta'].length > 10, `jest ${T.RIVER_SEGMENTS['Warta'].length}`);
  });
  t("58. dobra trasa daje ['wlochy','wisla','warta']", () => {
    assert.deepEqual(T.routeEvents(GOOD_ROUTE), ['wlochy', 'wisla', 'warta']);
  });
  t('59. dobra trasa → judgeRoute ok', () => {
    assert.equal(T.judgeRoute(T.routeEvents(GOOD_ROUTE)).ok, true);
  });
  t("60. odwrotna trasa daje ['wlochy','warta','wisla']", () => {
    assert.deepEqual(T.routeEvents(REVERSE_ROUTE), ['wlochy', 'warta', 'wisla']);
  });
  t("61. odwrotna trasa → kind 'kolejnosc'", () => {
    assert.equal(T.judgeRoute(T.routeEvents(REVERSE_ROUTE)).kind, 'kolejnosc');
  });
  t('62. trasa ze specyfikacji (koniec 20.5,52.3) staje na Warcie: brak Wisły', () => {
    assert.deepEqual(T.routeEvents(SPEC_ROUTE), ['wlochy', 'warta']);
  });
  t("63. trasa ze specyfikacji → też kind 'kolejnosc'", () => {
    assert.equal(T.judgeRoute(T.routeEvents(SPEC_ROUTE)).kind, 'kolejnosc');
  });
  t('64. sam START → brak zdarzeń (w drodze)', () => {
    assert.deepEqual(T.routeEvents([T.START]), []);
  });
  t("65. sam START → kind 'w-drodze'", () => {
    assert.equal(T.judgeRoute(T.routeEvents([T.START])).kind, 'w-drodze');
  });
});

/* --- G) szacunek ------------------------------------------------------------ */

group('G) szacunek', () => {
  t('66. hymn na siedząco → nie ok', () => {
    assert.equal(S.judgeHymn({ standing: false, capOff: true }).ok, false);
  });
  t('67. hymn w czapce → nie ok', () => {
    assert.equal(S.judgeHymn({ standing: true, capOff: false }).ok, false);
  });
  t('68. hymn stojąc bez czapki → ok', () => {
    assert.equal(S.judgeHymn({ standing: true, capOff: true }).ok, true);
  });
  t('69. pusty sklep → nie ok', () => {
    assert.equal(S.judgeShop({}).ok, false);
  });
  t('70. poprawne rozłożenie sklepu → ok', () => {
    assert.equal(S.judgeShop({ urzedowy: 'nie', kreska: 'tak', klocki: 'tak' }).ok, true);
  });
  t("71. urzędowe godło na 'tak' → wrong zawiera 'urzedowy'", () => {
    const v = S.judgeShop({ urzedowy: 'tak', kreska: 'tak', klocki: 'tak' });
    assert.equal(v.ok, false);
    assert.ok(v.wrong.some((w) => w.id === 'urzedowy'), JSON.stringify(v.wrong));
  });
});

/* --- H) hymn-dane ----------------------------------------------------------- */

group('H) hymn-dane', () => {
  t('72. każda karta z polem wskazuje istniejące pole HYMN_FIELDS', () => {
    const ids = new Set(H.HYMN_FIELDS.map((f) => f.id));
    for (const c of H.HYMN_BANK) {
      if (c.field !== null) assert.ok(ids.has(c.field), `${c.id}: ${c.field}`);
    }
  });
  t('73. każde pole ma dokładnie jedną kartę', () => {
    for (const f of H.HYMN_FIELDS) {
      const n = H.HYMN_BANK.filter((c) => c.field === f.id).length;
      assert.equal(n, 1, `${f.id}: ${n} kart`);
    }
  });
  t('74. każdy dystraktor (field null) ma whyNot', () => {
    for (const c of H.HYMN_BANK) {
      if (c.field === null) assert.ok(c.whyNot && c.whyNot.length > 0, c.id);
    }
  });
  t('75. HYMN ma 3 zwrotki', () => {
    assert.equal(H.HYMN.length, 3);
  });
  t('76. każda zwrotka ma 4 wersy', () => {
    for (const [i, st] of H.HYMN.entries()) {
      assert.equal(st.length, 4, `zwrotka ${i}: ${st.length} wersów`);
    }
  });
});

if (failures.length === 0) {
  console.log(`\nOK: ${total} asercji`);
} else {
  console.log(`\nNIE OK: ${failures.length} z ${total} asercji padło:`);
  for (const label of failures) console.log(`  - ${label}`);
  process.exit(1);
}
