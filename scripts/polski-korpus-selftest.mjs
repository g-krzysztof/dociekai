/**
 * Selftest silnika `korpus` (E2) — `src/app/jezyk-polski/klasa-4/lib/korpus/`.
 *
 * Wzorzec: `scripts/streak-selftest.mjs` — esbuild bundluje moduły TS,
 * potem asercje na czystych funkcjach. Odpalany przez `npm run test:unit`.
 *
 *   node scripts/polski-korpus-selftest.mjs
 */

import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = await mkdtemp(join(tmpdir(), 'polski-korpus-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * from '${process.cwd()}/src/app/jezyk-polski/klasa-4/lib/korpus/index';\n`
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node' });

const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const {
  buildKorpus,
  tokenize,
  sentenceBreaks,
  splitSentences,
  schoolPos,
  tagHas,
  isFirstPersonPlural,
  tokensOf,
  wordsOf,
  pickHits,
  judgeEvidence,
  anchorsOfKind,
  judgeHighlight,
  judgeGap,
  findWords,
  ambiguousWords,
  tokenAtPoint,
  tokenRange,
} = lib;

let failures = 0;
let checks = 0;

function check(label, actual, expected) {
  checks += 1;
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures += 1;
    console.error(`  ✗ ${label}\n      oczekiwano: ${JSON.stringify(expected)}\n      otrzymano:  ${JSON.stringify(actual)}`);
  }
}

/** Asercja na warunku (np. „wynik to a albo b”, „rzucony wyjątek”). */
function cond(label, value) {
  checks += 1;
  if (!value) {
    failures += 1;
    console.error(`  ✗ ${label}\n      oczekiwano: prawda\n      otrzymano:  ${JSON.stringify(value)}`);
  }
}

function throws(label, fn) {
  checks += 1;
  try {
    fn();
    failures += 1;
    console.error(`  ✗ ${label}\n      oczekiwano: wyjątek\n      otrzymano:  brak wyjątku`);
  } catch {
    // oczekiwany wyjątek — przypadek przechodzi
  }
}

function group(name, fn) {
  console.log(`\n${name}`);
  fn();
}

/* --- A. dzielenie na zdania -------------------------------------------- */

group('A. splitSentences', () => {
  check('1. skrót „np.” nie dzieli zdania', splitSentences('Kupiłam np. mleko i chleb. Potem poszłam.'),
    ['Kupiłam np. mleko i chleb.', 'Potem poszłam.']);
  check('2. skrót „ul.” nie dzieli zdania', splitSentences('Mieszkam przy ul. Lipowej 5. Zapraszam!'),
    ['Mieszkam przy ul. Lipowej 5.', 'Zapraszam!']);
  check('3. inicjał „J.” nie dzieli zdania', splitSentences('Przyszedł J. Kowalski. Usiadł.'),
    ['Przyszedł J. Kowalski.', 'Usiadł.']);
  check('4. dialog z małą literą po myślniku to jedno zdanie',
    splitSentences('— Przyjdź! — zawołała Zuzia.'), ['— Przyjdź! — zawołała Zuzia.']);
  check('5. dialog z wielką literą po myślniku to dwa zdania',
    splitSentences('— Dobrze. — Tymek wstał.'), ['— Dobrze.', '— Tymek wstał.']);
  check('6. wielokropek przed małą literą nie dzieli', splitSentences('Hmm… nie wiem. Może jutro.'),
    ['Hmm… nie wiem.', 'Może jutro.']);
  check('7. trzy kropki przed wielką literą dzielą', splitSentences('Czekałam... Nikt nie przyszedł.'),
    ['Czekałam...', 'Nikt nie przyszedł.']);
  check('8. „?!” dzieli zdania', splitSentences('Co?! Naprawdę?'), ['Co?!', 'Naprawdę?']);
  check('9. cudzysłów zamykający należy do zdania', splitSentences('„Hej!” Ola machnęła ręką.'),
    ['„Hej!”', 'Ola machnęła ręką.']);
  check('10. ZNANE OGRANICZENIE: skrót „w.” przed wielką literą łączy zdania w jedno',
    splitSentences('Było to w XX w. Wtedy jeszcze nie znano komputerów.'),
    ['Było to w XX w. Wtedy jeszcze nie znano komputerów.']);
  check('11. liczby nie przeszkadzają w podziale', splitSentences('Zjadłam 3 jabłka. Ty zjadłeś 2.'),
    ['Zjadłam 3 jabłka.', 'Ty zjadłeś 2.']);
  check('12. tekst bez kropki to jedno zdanie', splitSentences('Ala ma kota'), ['Ala ma kota']);
  check('13. skrót „m.in.” nie dzieli zdania', splitSentences('Sprzedał m.in. jabłka i gruszki. Koniec.'),
    ['Sprzedał m.in. jabłka i gruszki.', 'Koniec.']);
  check('14. skrót „godz.” nie dzieli zdania', splitSentences('O godz. 9 zaczynamy. Proszę być punktualnie.'),
    ['O godz. 9 zaczynamy.', 'Proszę być punktualnie.']);
  check('sentenceBreaks zwraca indeksy końcówek', sentenceBreaks(tokenize('Ala ma kota. Ola ma psa.')), [3, 7]);
});

/* --- B. tokenizacja ----------------------------------------------------- */

group('B. tokenize', () => {
  check('wyraz z myślnikiem to jeden token', tokenize('biało-czerwony').map((t) => t.form), ['biało-czerwony']);
  check('„Ala, kot.”: formy i typy', tokenize('Ala, kot.').map((t) => `${t.form}/${t.type}`),
    ['Ala/word', ',/punct', 'kot/word', './punct']);
  check('„…” to jeden token', tokenize('…').map((t) => t.form), ['…']);
  check('„...” to jeden token', tokenize('...').map((t) => t.form), ['...']);
  check('„?!” to jeden token', tokenize('Co?!').map((t) => t.form), ['Co', '?!']);
});

/* --- C. proza: fragmenty, kotwice, dowody -------------------------------- */

const K = buildKorpus({
  id: 'test-c',
  layout: 'prose',
  body: '[[u1 — Przepraszam, Zuziu]] — powiedział Tymek. [[r1 Zuzia się uśmiechnęła.]]\n\n[[u2 — Zawsze psujesz!]] — krzyknęła Ola. Zuzia odwróciła się do okna i nic nie powiedziała.',
  spans: {
    u1: { kind: 'wypowiedz', speaker: 'tymek', to: 'zuzia' },
    u2: { kind: 'wypowiedz', speaker: 'ola' },
    r1: { kind: 'reakcja' },
  },
  anchors: [
    { kind: 'przeprosiny', from: 'u1', to: 'r1' },
    { kind: 'zranienie', from: 'u2', to: 's3' },
  ],
});

group('C. buildKorpus (proza)', () => {
  check('4 zdania s0..s3', K.units.map((u) => u.id), ['s0', 's1', 's2', 's3']);
  check('bloki akapitów', K.blocks, [['s0', 's1'], ['s2', 's3']]);
  check('treść s0', K.unitById.s0.text, '— Przepraszam, Zuziu — powiedział Tymek.');
  check('fragment u1 w zdaniu s0', K.spans.u1.unitIds, ['s0']);
  check('wyrazy fragmentu u1', wordsOf(K, 'u1').map((t) => t.form), ['Przepraszam', 'Zuziu']);
  check('kotwice rodzaju „przeprosiny”', anchorsOfKind(K, 'przeprosiny').length, 1);

  const v1 = judgeEvidence(K, 'u1', 's1', 'przeprosiny');
  cond('dowód zdaniem s1 dla u1 → ok', v1.ok === true);
  const v2 = judgeEvidence(K, 'u1', 'r1');
  cond('dowód fragmentem r1 dla u1 → ok', v2.ok === true);
  check('dowód s1 dla cudzego u2 → cudzy-dowód u1',
    judgeEvidence(K, 'u2', 's1'), { ok: false, reason: 'cudzy-dowod', owner: 'u1', kind: 'przeprosiny' });
  const v4 = judgeEvidence(K, 'u2', 's3', 'zranienie');
  cond('dowód s3 dla u2 (zranienie) → ok', v4.ok === true);
  check('wskazanie s0 niczego nie dowodzi → brak-dowodu',
    judgeEvidence(K, 'u1', 's0'), { ok: false, reason: 'brak-dowodu' });

  const smileId = K.tokens.find((t) => t.form === 'uśmiechnęła').id;
  const v6 = judgeEvidence(K, 'u1', smileId, 'przeprosiny');
  cond('stuknięcie wyrazu „uśmiechnęła” wewnątrz r1 → ok', v6.ok === true);

  cond('zdanie s1 zawiera cały r1', pickHits(K, 's1', 'r1') === true);
  cond('zdanie s0 nie zawiera r1', pickHits(K, 's0', 'r1') === false);
  check('tokensOf wyrazu to jeden token', tokensOf(K, smileId).map((t) => t.id), [smileId]);
});

/* --- D. błędy danych ------------------------------------------------------ */

group('D. błędy danych rzucają wyjątek', () => {
  throws('niezamknięte [[u1', () => buildKorpus({ id: 'd1', layout: 'prose', body: '[[u1 tekst' }));
  throws(']] bez otwarcia', () => buildKorpus({ id: 'd2', layout: 'prose', body: 'Ala ma kota. ]]' }));
  throws('zagnieżdżone fragmenty', () => buildKorpus({ id: 'd3', layout: 'prose', body: '[[a x [[b y]] z]]' }));
  throws('metadane fragmentu spoza body', () => buildKorpus({
    id: 'd4', layout: 'prose', body: 'Ala ma kota.', spans: { duch: { kind: 'uczucie' } },
  }));
  throws('kotwica do nieistniejącego id', () => buildKorpus({
    id: 'd5', layout: 'prose', body: 'Ala ma kota.',
    anchors: [{ kind: 'x', from: 's0', to: 'nie-ma' }],
  }));
  throws('powtórzony fragment o tym samym id', () => buildKorpus({
    id: 'd6', layout: 'prose', body: '[[a Ala]] [[a Ola]]',
  }));
});

/* --- E. wiersz ------------------------------------------------------------ */

const VERSE_BODY = 'Nie rzucim ziemi, skąd nasz ród,\nNie damy pogrześć mowy.\n\nPolski my naród, polski lud';
const VERSE_MORPH = {
  damy: [{ lemma: 'dać', tag: 'fin:pl:pri:perf' }, { lemma: 'dama', tag: 'subst:pl:nom.acc.voc:f' }],
  my: [{ lemma: 'my', tag: 'ppron12:pl:nom:m1:pri' }],
  rzucim: [],
};
const V = buildKorpus({ id: 'test-e', layout: 'verse', body: VERSE_BODY, morph: VERSE_MORPH });

group('E. wiersz (verse)', () => {
  check('3 wersy v0..v2', V.units.map((u) => u.id), ['v0', 'v1', 'v2']);
  check('bloki strof', V.blocks, [['v0', 'v1'], ['v2']]);
  check('1. os. l. mnogiej: damy i my',
    findWords(V, (t) => Boolean(t.morph) && isFirstPersonPlural(t.morph)).map((t) => t.form),
    ['damy', 'my']);
  check('„damy” to czasownik', V.tokens.find((t) => t.form === 'damy').pos, 'czasownik');
  cond('„damy” jest wieloznaczne (czasownik vs rzeczownik)',
    ambiguousWords(V).some((t) => t.form === 'damy'));

  const V2 = buildKorpus({
    id: 'test-e2',
    layout: 'verse',
    body: 'Nie rzucim ziemi, skąd nasz ród,\nNie damy{|fin:pl:pri:perf} pogrześć mowy.\n\nPolski my naród, polski lud',
    morph: VERSE_MORPH,
  });
  check('ujednoznacznione „damy” ma resolved=true',
    V2.tokens.find((t) => t.form === 'damy').resolved, true);
  cond('ujednoznacznione „damy” znika z ambiguousWords',
    !ambiguousWords(V2).some((t) => t.form === 'damy'));
});

/* --- F. nadpisania -------------------------------------------------------- */

group('F. nadpisania {|tag}, {=pos}, {#id}', () => {
  const K1 = buildKorpus({ id: 'f1', layout: 'prose', body: 'Mam zamek{zamek|subst:sg:nom:m3}.' });
  const zamek = K1.tokens.find((t) => t.form === 'zamek');
  check('nadpisana analiza zamku', zamek.morph, { lemma: 'zamek', tag: 'subst:sg:nom:m3' });
  check('zamek to rzeczownik', zamek.pos, 'rzeczownik');

  const K2 = buildKorpus({ id: 'f2', layout: 'prose', body: 'To jest ten{=zaimek} dom.' });
  check('„ten” jako zaimek', K2.tokens.find((t) => t.form === 'ten').pos, 'zaimek');

  const K3 = buildKorpus({ id: 'f3', layout: 'prose', body: 'Wpisz{#luka1} tu.' });
  check('własne id wyrazu', K3.tokenById.luka1.form, 'Wpisz');

  throws('powtórzone {#a} rzuca wyjątek', () => buildKorpus({
    id: 'f4', layout: 'prose', body: 'Ala{#a} ma kota{#a}.',
  }));
});

/* --- G. szkolne części mowy ------------------------------------------------ */

group('G. schoolPos', () => {
  check('przymiotnik „ten” → zaimek', schoolPos({ lemma: 'ten', tag: 'adj:sg:nom:m3:pos' }), 'zaimek');
  check('rzeczownik „kto” → zaimek', schoolPos({ lemma: 'kto', tag: 'subst:sg:nom:m1' }), 'zaimek');
  check('przysłówek', schoolPos({ lemma: 'szybko', tag: 'adv:pos' }), 'przyslowek');
  check('spójnik', schoolPos({ lemma: 'bo', tag: 'comp' }), 'spojnik');
  check('partykuła', schoolPos({ lemma: 'nie', tag: 'part' }), 'partykula');
  check('czasownik ze sklejką aglutynanta', schoolPos({ lemma: 'zrobić', tag: 'praet:pl:m1:perf+aglt:pl:pri' }), 'czasownik');
  check('przyimek', schoolPos({ lemma: 'w', tag: 'prep:loc:nwok' }), 'przyimek');
});

/* --- H. osoba, liczba, kategoria ------------------------------------------- */

group('H. isFirstPersonPlural i tagHas', () => {
  check('my zrobiliśmy → 1. os. l. mn.', isFirstPersonPlural({ lemma: 'zrobić', tag: 'praet:pl:m1:perf+aglt:pl:pri' }), true);
  check('zrobiłam → nie', isFirstPersonPlural({ lemma: 'zrobić', tag: 'praet:sg:f:perf+aglt:sg:pri' }), false);
  check('3. os. l. mn. → nie', isFirstPersonPlural({ lemma: 'dać', tag: 'fin:pl:ter:perf' }), false);
  check('tryb rozkazujący my → tak', isFirstPersonPlural({ lemma: 'pisać', tag: 'impt:pl:pri:imperf' }), true);
  check('tagHas widzi acc w „nom.acc”', tagHas('subst:sg:nom.acc:m3', 'acc'), true);
  check('tagHas nie widzi acc w samym „nom”', tagHas('subst:sg:nom:m3', 'acc'), false);
});

/* --- I. zakreślacz ---------------------------------------------------------- */

group('I. judgeHighlight', () => {
  const u1ids = wordsOf(K, 'u1').map((t) => t.id);
  const outside = wordsOf(K, 's1')[0].id;
  const comma = K.tokens.find((t) => t.form === ',' && t.unitId === 's0').id;
  const marked = [...u1ids, outside];

  const strict = judgeHighlight(K, marked, ['u1'], { maxExtras: 0 });
  check('cel u1 trafiony', strict.hits, ['u1']);
  check('jeden wyraz spoza celu', strict.extras.length, 1);
  check('nadmiar przy maxExtras 0 → niekompletne', strict.complete, false);
  check('nadmiar przy maxExtras 1 → kompletne',
    judgeHighlight(K, marked, ['u1'], { maxExtras: 1 }).complete, true);
  check('połowa wyrazów przy progu 0.6 → pudło',
    judgeHighlight(K, [u1ids[0]], ['u1'], { minCover: 0.6 }).misses, ['u1']);
  check('interpunkcja nie liczy się do extras',
    judgeHighlight(K, [...marked, comma], ['u1'], { maxExtras: 1 }).extras.length, 1);
});

/* --- J. luka ---------------------------------------------------------------- */

const KJ = buildKorpus({
  id: 'test-j',
  layout: 'prose',
  body: 'Zuzia ma kota{#g}.',
  morph: {
    kota: [{ lemma: 'kot', tag: 'subst:sg:acc:m2' }],
    kot: [{ lemma: 'kot', tag: 'subst:sg:nom:m2' }],
    psa: [{ lemma: 'pies', tag: 'subst:sg:acc:m2' }],
  },
});

group('J. judgeGap', () => {
  cond('dobra forma → ok', judgeGap(KJ, 'g', 'kota').ok === true);
  cond('wielkość liter i spacje nie szkodzą', judgeGap(KJ, 'g', 'Kota ').ok === true);
  check('ten sam lemat, zła forma', judgeGap(KJ, 'g', 'kot'), { ok: false, reason: 'forma', lemma: 'kot' });
  check('inne słowo', judgeGap(KJ, 'g', 'psa'), { ok: false, reason: 'inne-slowo' });
  cond('forma z listy accept → ok', judgeGap(KJ, 'g', 'kotka', ['kotka']).ok === true);
});

/* --- K. trafianie palcem ----------------------------------------------------- */

const RECTS = [
  { id: 'a', rect: { left: 0, top: 0, right: 50, bottom: 20 } },
  { id: 'b', rect: { left: 60, top: 0, right: 110, bottom: 20 } },
  { id: 'c', rect: { left: 0, top: 30, right: 50, bottom: 50 } },
];

group('K. tokenAtPoint', () => {
  check('punkt w środku a', tokenAtPoint(RECTS, 10, 10), 'a');
  const mid = tokenAtPoint(RECTS, 55, 10, 8);
  cond('punkt między a i b (5 do obu) trafia w a albo b', mid === 'a' || mid === 'b');
  const between = tokenAtPoint(RECTS, 10, 25);
  cond('punkt między wierszami trafia w a albo c', between === 'a' || between === 'c');
  check('daleki punkt to null', tokenAtPoint(RECTS, 200, 200), null);
  check('wnętrze c wygrywa z bliskim a (slack 20)', tokenAtPoint(RECTS, 10, 33, 20), 'c');
});

/* --- L. zakres --------------------------------------------------------------- */

group('L. tokenRange', () => {
  const idA = wordsOf(K, 'u1')[0].id;
  const idB = K.tokens.find((t) => t.form === 'Tymek').id;
  const fwd = tokenRange(K, idA, idB);
  check('odwrotna kolejność daje ten sam zakres', tokenRange(K, idB, idA), fwd);
  check('zakres zaczyna się od A', tokenRange(K, idB, idA)[0], idA);
  check('zakres kończy się na B', tokenRange(K, idB, idA).at(-1), idB);
});

const total = checks;
console.log(failures === 0 ? `\n✓ ${total}/${total} OK\n` : `\n✗ ${failures} z ${total} nie przeszło\n`);
process.exit(failures === 0 ? 0 : 1);
