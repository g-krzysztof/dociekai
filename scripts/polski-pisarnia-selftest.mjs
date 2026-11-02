/**
 * Selftest silnika `pisarnia` (E3) — `src/app/jezyk-polski/klasa-4/lib/pisarnia/`.
 *
 * Wzorzec: `scripts/polski-korpus-selftest.mjs` — esbuild bundluje moduły TS,
 * potem asercje na czystych funkcjach. Odpalany przez `npm run test:unit`.
 *
 *   node scripts/polski-pisarnia-selftest.mjs
 */

import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = await mkdtemp(join(tmpdir(), 'polski-pisarnia-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * from '${process.cwd()}/src/app/jezyk-polski/klasa-4/lib/pisarnia/index';\n`
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node' });

const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const {
  splitChildSentences,
  analyze,
  compilePalette,
  usedEntries,
  usedGroups,
  findConnector,
  wordSimilarity,
  buildMarks,
  issuesOf,
} = lib;

let failures = 0;
let checks = 0;
/** Numery (z etykiet) niezdanych przypadków — do końcowego podsumowania. */
const failedNums = [];

function numOf(label) {
  const m = /^(\d+)/.exec(label);
  return m ? m[1] : label;
}

function check(label, actual, expected) {
  checks += 1;
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures += 1;
    failedNums.push(numOf(label));
    console.error(`  ✗ ${label}\n      oczekiwano: ${JSON.stringify(expected)}\n      otrzymano:  ${JSON.stringify(actual)}`);
  }
}

/** Asercja na warunku (np. „wynik to a albo b”, przybliżenie liczby). */
function cond(label, value) {
  checks += 1;
  if (!value) {
    failures += 1;
    failedNums.push(numOf(label));
    console.error(`  ✗ ${label}\n      oczekiwano: prawda\n      otrzymano:  ${JSON.stringify(value)}`);
  }
}

function throws(label, fn) {
  checks += 1;
  try {
    fn();
    failures += 1;
    failedNums.push(numOf(label));
    console.error(`  ✗ ${label}\n      oczekiwano: wyjątek\n      otrzymano:  brak wyjątku`);
  } catch {
    // oczekiwany wyjątek — przypadek przechodzi
  }
}

function group(name, fn) {
  console.log(`\n${name}`);
  fn();
}

const NAMES = ['ola', 'oli', 'olu', 'olą', 'tymek', 'tymka', 'tymkiem', 'zuzia', 'zuzi', 'zuzią', 'halina', 'haliny'];

const S = (t) => splitChildSentences(t);
const A = (t, opts) => analyze(t, { names: NAMES, ...(opts ?? {}) });
/** Rodzaje usterek w kolejności wyniku (wg pozycji). */
const I = (t) => A(t).issues.map((i) => i.kind);
/** Rodzaje + wycinek pierwszej usterki (do przypadków z `@'x'`). */
const IFrag = (t) => {
  const issues = A(t).issues;
  return { kinds: issues.map((i) => i.kind), frag: issues.length ? t.slice(issues[0].start, issues[0].end) : null };
};

/* --- A. podział na zdania -------------------------------------------------- */

group('A. splitChildSentences', () => {
  check('1. kropka przed wielką literą dzieli', S('Mam psa. On szczeka.'), ['Mam psa.', 'On szczeka.']);
  check('2. kropka przed małą literą też dzieli', S('Mam psa. on szczeka.'), ['Mam psa.', 'on szczeka.']);
  check('3. skrót „ul.” nie dzieli', S('Mieszkam przy ul. Lipowej. Mam kota.'), ['Mieszkam przy ul. Lipowej.', 'Mam kota.']);
  check('4. „np.” przed małą literą nie dzieli', S('Byłam tam np. w lipcu.'), ['Byłam tam np. w lipcu.']);
  check('5. „np.” przed wielką literą nie dzieli', S('Lubię owoce, np. Jabłka.'), ['Lubię owoce, np. Jabłka.']);
  check('6. „godz. 17.30” nie dzieli', S('Spotkanie o godz. 17.30. Przyjdź!'), ['Spotkanie o godz. 17.30.', 'Przyjdź!']);
  check('7. data „3.05.2016 r.” nie dzieli', S('Urodziłam się 3.05.2016 r. w Krakowie.'), ['Urodziłam się 3.05.2016 r. w Krakowie.']);
  check('8. „itd.” przed wielką literą dzieli', S('Kupiłam jabłka, gruszki itd. Potem wróciłam.'), ['Kupiłam jabłka, gruszki itd.', 'Potem wróciłam.']);
  check('9. „m.in.” nie dzieli', S('Jest m.in. Ola i Tymek. Bawimy się.'), ['Jest m.in. Ola i Tymek.', 'Bawimy się.']);
  check('10. „p. Halina” nie dzieli', S('Przyszła p. Halina. Usiadła.'), ['Przyszła p. Halina.', 'Usiadła.']);
  check('11. inicjał przed nazwiskiem nie dzieli', S('J. Kowalski przyszedł. Usiadł.'), ['J. Kowalski przyszedł.', 'Usiadł.']);
  check('12. wykrzyknik dzieli', S('Hej! Co robisz?'), ['Hej!', 'Co robisz?']);
  check('13. wykrzyknik przed małą literą dzieli', S('Hej! co robisz?'), ['Hej!', 'co robisz?']);
  check('14. „?!” dzieli', S('Naprawdę?! Nie wierzę.'), ['Naprawdę?!', 'Nie wierzę.']);
  check('15. wielokropek przed małą literą nie dzieli', S('Myślałam… że przyjdziesz.'), ['Myślałam… że przyjdziesz.']);
  check('16. trzy kropki przed małą literą nie dzielą', S('Myślałam... że przyjdziesz.'), ['Myślałam... że przyjdziesz.']);
  check('17. wielokropek przed wielką literą dzieli', S('Czekałam… Nikt nie przyszedł.'), ['Czekałam…', 'Nikt nie przyszedł.']);
  check('18. wtrącenie narratora z małą literą nie dzieli', S('— Chodź tu! — zawołała mama.'), ['— Chodź tu! — zawołała mama.']);
  check('19. dialog z wielką literą po myślniku dzieli', S('— Dobrze — odpowiedziała Ola. — Już idę.'), ['— Dobrze — odpowiedziała Ola.', '— Już idę.']);
  check('20. cudzysłów zamykający należy do zdania', S('Powiedział: „Idę spać.” Potem zasnął.'), ['Powiedział: „Idę spać.”', 'Potem zasnął.']);
  check('21. nawias nie przeszkadza w podziale', S('Mam psa (jamnika). Jest mały.'), ['Mam psa (jamnika).', 'Jest mały.']);
  check('22. sklejona kropka przed wielką literą dzieli', S('Mam psa.On szczeka.'), ['Mam psa.', 'On szczeka.']);
  check('23. adres „www.zoo.pl” nie dzieli', S('Strona to www.zoo.pl i tyle.'), ['Strona to www.zoo.pl i tyle.']);
  check('24. zdanie od cyfry', S('Mam 10 lat. 3 koty też.'), ['Mam 10 lat.', '3 koty też.']);
  check('25. koniec linii kończy zdanie', S('Pierwsza linia\nDruga linia.'), ['Pierwsza linia', 'Druga linia.']);
  check('26. puste linie nie dają zdań', S('Akapit pierwszy.\n\n\nAkapit drugi.'), ['Akapit pierwszy.', 'Akapit drugi.']);
  check('27. same spacje to brak zdań', S('   '), []);
  check('28. pusty tekst to brak zdań', S(''), []);
  check('29. tekst bez kropki to jedno zdanie', S('Bez kropki na końcu'), ['Bez kropki na końcu']);
  check('30. „św. Anny” nie dzieli', S('Idę do św. Anny.'), ['Idę do św. Anny.']);
  check('31. „nr 5” nie dzieli', S('Mieszkam w domu nr 5. Jest duży.'), ['Mieszkam w domu nr 5.', 'Jest duży.']);
  check('32. „5 m.” dzieli', S('Pobiegłam 5 m. Potem odpoczęłam.'), ['Pobiegłam 5 m.', 'Potem odpoczęłam.']);
});

/* --- B. usterki ------------------------------------------------------------- */

group('B. issues', () => {
  check('33. poprawny tekst bez usterek', I('Mam psa. On szczeka.'), []);
  check('34. mała litera na początku', IFrag('mam psa.'), { kinds: ['no-capital'], frag: 'm' });
  check('35. mała litera w drugim zdaniu', IFrag('Mam psa. on szczeka.'), { kinds: ['no-capital'], frag: 'o' });
  check('36. brak znaku na końcu', IFrag('Mam psa'), { kinds: ['no-end-mark'], frag: 'a' });
  check('37. brak znaku na końcu drugiego zdania', I('Mam psa. On szczeka'), ['no-end-mark']);
  check('38. brak odstępu po przecinku', IFrag('Kupiłam jabłka,gruszki.'), { kinds: ['no-space-after-punct'], frag: ',' });
  check('39. odstęp przed kropką', IFrag('Kupiłam jabłka .'), { kinds: ['space-before-punct'], frag: '.' });
  check('40. sklejona kropka to brak odstępu', IFrag('Mam psa.On szczeka.'), { kinds: ['no-space-after-punct'], frag: '.' });
  check('41. sklejony wykrzyknik to brak odstępu', I('Hej!Co robisz?'), ['no-space-after-punct']);
  check('42. „m.in.” to nie błąd odstępu', I('Jest m.in. pies.'), []);
  check('43. przecinek dziesiętny to nie błąd', I('Liczba 3,5 jest mała.'), []);
  check('44. imię małą literą', IFrag('Byłam u oli w domu.'), { kinds: ['name-lowercase'], frag: 'oli' });
  check('45. imię na początku zdania: tylko no-capital', I('ola przyszła.'), ['no-capital']);
  check('46. imię wielką literą bez usterki', I('Byłam u Oli w domu.'), []);
  check('47. dywiz z klawiatury w dialogu', IFrag('- Cześć!'), { kinds: ['dialog-hyphen'], frag: '-' });
  check('48. pauza w dialogu bez usterki', I('— Cześć!'), []);
  check('49. półpauza w dialogu bez usterki', I('– Cześć!'), []);
  check('50. dialog małą literą to no-capital', I('— cześć!'), ['no-capital']);
  check('51. kwestia z wtrąceniem narratora bez usterek', I('— Chodź! — zawołała mama.'), []);
  check('52. przecinek na końcu + trailingPunct', (() => {
    const a = A('Droga Olu,');
    return { kinds: a.issues.map((i) => i.kind), trailing: a.sentences[0].trailingPunct };
  })(), { kinds: ['no-end-mark'], trailing: ',' });
  check('53. odstęp przed pytajnikiem', I('Czy przyjdziesz ?'), ['space-before-punct']);
  check('54. cudzysłów w dialogu bez usterek', I('„Idę” — powiedziała.'), []);
  check('55. odstęp na końcu tekstu to nie usterka', I('Mam psa. Mam kota. '), []);
});

/* --- C. zdania i akapity ----------------------------------------------------- */

group('C. sentences i paragraphs', () => {
  check('56. znaki końca zdań', analyze('Mam psa. Ma na imię Burek!\nLubię go?').sentences.map((s) => s.endMark), ['.', '!', '?']);
  check('57. „?!” i „…” jako znaki końca', analyze('Co?! Serio…').sentences.map((s) => s.endMark), ['?!', '…']);
  check('58. trzy linie to trzy akapity', analyze('A\nB\n\nC').paragraphs.length, 3);
  check('59. zdania w akapitach', analyze('Mam psa. Ma na imię Burek.\nLubię go.').paragraphs.map((p) => p.sentences.length), [2, 1]);
  check('60. formy wyrazów', analyze('Ala ma kota.').words.map((w) => w.form), ['Ala', 'ma', 'kota']);
  check('61. wyrazy przypisane do zdań', analyze('Ala ma kota. Kot ma Alę.').words.map((w) => w.sentence), [0, 0, 0, 1, 1, 1]);
  check('62. capitalOk w zdaniach', analyze('Mam psa. on szczeka.').sentences.map((s) => s.capitalOk), [true, false]);
  check('63. zdanie od cyfry ma capitalOk', analyze('3 koty śpią.').sentences[0].capitalOk, true);
  check('64. wycinki zdań zgadzają się z tekstem', (() => {
    const t = 'Mam psa.\nOn szczeka.';
    const a = analyze(t);
    return a.sentences.map((s) => [s.text, t.slice(s.start, s.end)]);
  })(), [['Mam psa.', 'Mam psa.'], ['On szczeka.', 'On szczeka.']]);
  check('65. kwestia dialogu: części i myślnik', (() => {
    const t = '— Chodź! — zawołała mama. — Już późno.';
    const p = analyze(t).paragraphs[0];
    return { dialog: p.dialog, dash: p.dash, roles: p.parts.map((x) => x.role), texts: p.parts.map((x) => t.slice(x.start, x.end)) };
  })(), { dialog: true, dash: '—', roles: ['speech', 'narration', 'speech'], texts: ['Chodź!', 'zawołała mama.', 'Już późno.'] });
  check('66. zwykły akapit nie jest dialogiem', (() => {
    const p = analyze('Zwykły akapit.').paragraphs[0];
    return { dialog: p.dialog, parts: p.parts };
  })(), { dialog: false, parts: [] });
  check('67. dywiz z klawiatury jako dash', analyze('- Cześć!').paragraphs[0].dash, '-');
  check('68. inDialog tylko w kwestii', [analyze('Mam psa.').sentences[0].inDialog, analyze('— Mam psa.').sentences[0].inDialog], [false, true]);
});

/* --- D. powtórzenia ----------------------------------------------------------- */

group('D. repeats', () => {
  check('69. powtórzenie w sąsiednich zdaniach', analyze('Pies jest duży. Pies szczeka.').repeats.map((r) => r.low), ['pies']);
  check('70. dwa zdania dalej to poza oknem', analyze('Pies biega. Kot śpi. Pies je.').repeats, []);
  check('71. szersze okno łapie dalsze zdanie', analyze('Pies biega. Kot śpi. Pies je.', { repeatWindow: 2 }).repeats.map((r) => r.low), ['pies']);
  check('72. powtórzenie w jednym zdaniu (inna forma się nie liczy)', analyze('Pies goni psa, pies szczeka.').repeats.map((r) => r.low), ['pies']);
  check('73. stopword się nie liczy', analyze('Nie lubię. Nie chcę.').repeats, []);
  check('74. wyrazy krótsze niż 3 litery się nie liczą', analyze('Ja i ty. Ja i on.').repeats, []);
  check('75. repeatIgnore wycisza wyraz', analyze('Burek biega. Burek je.', { repeatIgnore: ['Burek'] }).repeats, []);
  check('76. trzy wystąpienia w jednej grupie', analyze('Pies biega. Pies je. Pies śpi.').repeats[0].words.length, 3);
  check('77. liczby i „mam” pomijane', analyze('Mam 10 lat. Mam 10 kotów.').repeats, []);
});

/* --- E. paleta ----------------------------------------------------------------- */

const P = compilePalette(
  [
    { id: 'rad', label: 'cieszyć się', lemmas: ['cieszyć'], group: 'radosc' },
    { id: 'cie', label: 'ciekawy', lemmas: ['ciekawy'], group: 'ciekawosc' },
    { id: 'tyj', label: 'ty jesteś', forms: ['ty jesteś'], group: 'oskarzenie' },
    { id: 'zaw', label: 'zawsze', forms: ['zawsze', 'nigdy'], group: 'oskarzenie' },
  ],
  {
    'cieszyć': ['cieszę', 'cieszysz', 'cieszy', 'cieszymy', 'cieszyć', 'cieszyłam', 'cieszyłem'],
    'ciekawy': ['ciekawy', 'ciekawa', 'ciekawe', 'ciekawi'],
  }
);
const H = (t) => analyze(t, { palette: P }).hits;

group('E. palette', () => {
  check('78. forma „cieszę” trafia we wpis', H('Cieszę się!').map((h) => h.entryId), ['rad']);
  check('79. forma „cieszyłam” trafia we wpis', H('Bardzo się cieszyłam.').map((h) => h.entryId), ['rad']);
  check('80. grupa trafienia „ciekawa”', H('Jestem ciekawa, jak wygląda.')[0].group, 'ciekawosc');
  check('81. „nie” przed trafieniem to negacja', H('Nie cieszę się.')[0].negated, true);
  check('82. „nie” dalej to nie negacja', H('Cieszę się, nie wiem.')[0].negated, false);
  check('83. zwrot dwuwyrazowy i jego wyrazy', (() => {
    const h = H('Ty jesteś niemiły.')[0];
    return { ids: [h.entryId], words: h.words.length };
  })(), { ids: ['tyj'], words: 2 });
  check('84. zwrot przez granicę zdania się nie liczy', H('Ty. Jesteś tu?'), []);
  check('85. dwa trafienia tego samego wpisu', H('Zawsze i nigdy.').map((h) => h.entryId), ['zaw', 'zaw']);
  check('86. usedEntries w kolejności użycia', usedEntries(H('Zawsze i nigdy. Cieszę się.')), ['zaw', 'rad']);
  check('87. usedGroups z pominięciem zaprzeczonych', usedGroups(H('Nie cieszę się. Jestem ciekawy.'), true), ['ciekawosc']);
  check('88. usedGroups ze wszystkimi', usedGroups(H('Nie cieszę się. Jestem ciekawy.')), ['radosc', 'ciekawosc']);
  check('89. wielkość liter bez znaczenia', H('CIESZĘ SIĘ').length, 1);
  throws('90. powtórzone id wpisu rzuca wyjątek', () => compilePalette([{ id: 'a', label: 'a', forms: ['x'] }, { id: 'a', label: 'b', forms: ['y'] }]));
  check('91. wycinek trafienia to „Cieszę”', (() => {
    const t = 'Cieszę się.';
    const h = analyze(t, { palette: P }).hits[0];
    return t.slice(h.start, h.end);
  })(), 'Cieszę');
});

/* --- F. pomocnicy --------------------------------------------------------------- */

group('F. helpers', () => {
  check('92. spójnik i sąsiedzi', (() => {
    const c = findConnector(analyze('Lubię psy, bo są wierne.'), 0, ['bo', 'ponieważ']);
    return { word: c.word.form, before: c.before.map((w) => w.form), after: c.after.map((w) => w.form) };
  })(), { word: 'bo', before: ['Lubię', 'psy'], after: ['są', 'wierne'] });
  check('93. brak spójnika to null', findConnector(analyze('Lubię psy.'), 0, ['bo']), null);
  check('94. spójnik na początku zdania', findConnector(analyze('Ponieważ pada, zostaję.'), 0, ['bo', 'ponieważ']).before.length, 0);
  check('95. identyczne teksty to 1', wordSimilarity('Lubię psy, bo są wierne.', 'Lubię psy, bo są wierne.'), 1);
  check('96. rozłączne teksty to 0', wordSimilarity('Ala ma kota', 'Ola je zupę'), 0);
  check('97. puste teksty to 0', wordSimilarity('', ''), 0);
  cond('98. częściowe podobieństwo ≈ 0.8',
    Math.abs(wordSimilarity('Lubię psy, bo są wierne.', 'lubię psy bo są mądre') - 0.8) < 1e-9);
  check('99. marki usterek: tony i rozłączność', (() => {
    const a = analyze('mam psa');
    const marks = buildMarks(a, { issues: true });
    const disjointSorted = marks.every((m, k) =>
      (k === 0 || marks[k - 1].start <= m.start) &&
      !marks.some((o, j) => j !== k && m.start < o.end && o.start < m.end));
    return { tones: marks.map((m) => m.tone), disjointSorted };
  })(), { tones: ['error', 'error'], disjointSorted: true });
  check('100. filtrowanie usterek po rodzaju', buildMarks(analyze('mam psa'), { issues: ['no-end-mark'] }).length, 1);
  check('101. marki powtórzeń to warn', buildMarks(analyze('Pies biega. Pies je.'), { repeats: true }).map((m) => m.tone), ['warn', 'warn']);
  check('102. bad wygrywa z warn na tym samym miejscu', (() => {
    const t = 'zawsze zawsze.';
    return buildMarks(analyze(t, { palette: P }), { repeats: true, hits: () => 'bad' }).map((m) => m.tone);
  })(), ['bad', 'bad']);
  check('103. dialog-hyphen to info', buildMarks(analyze('- Cześć!'), { issues: true })[0].tone, 'info');
  check('104. issuesOf filtruje po rodzaju', issuesOf(analyze('mam psa. on je.'), 'no-capital').length, 2);
});

const total = checks;
if (failures === 0) {
  console.log(`\n✓ ${total}/${total} OK\n`);
} else {
  console.log(`\n✗ ${failures} z ${total} nie przeszło`);
  console.log(`Niezdane przypadki: ${[...new Set(failedNums)].join(', ')}`);
}
process.exit(failures === 0 ? 0 : 1);
