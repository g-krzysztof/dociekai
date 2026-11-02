/**
 * Selftest L9 „Mazurek i Rota” (`mazurek-i-rota/`) — teksty, „my”, słowniczek,
 * takt melodii, pieczęć obietnicy i obietnica dziecka.
 *
 * Wzorzec: `scripts/polski-l01-selftest.mjs` — esbuild bundluje moduły TS
 * do pliku tymczasowego w `os.tmpdir()`, potem asercje na czystych funkcjach.
 * Nie zmienia plików lekcji: czerwona asercja to opis w podsumowaniu, nie poprawka.
 *
 *   node scripts/polski-l09-selftest.mjs
 */

import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dir = await mkdtemp(join(tmpdir(), 'polski-l09-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

const SOURCES = [
  'src/app/jezyk-polski/klasa-4/components/lessons/mazurek-i-rota/mazurek.ts',
  'src/app/jezyk-polski/klasa-4/components/lessons/mazurek-i-rota/rota.ts',
  'src/app/jezyk-polski/klasa-4/components/lessons/mazurek-i-rota/takt.ts',
  'src/app/jezyk-polski/klasa-4/components/lessons/mazurek-i-rota/pieczec.ts',
  'src/app/jezyk-polski/klasa-4/components/lessons/mazurek-i-rota/my.ts',
  'src/app/jezyk-polski/klasa-4/components/lessons/mazurek-i-rota/obietnica.ts',
  'src/app/jezyk-polski/klasa-4/components/lessons/mazurek-i-rota/slowniczek.ts',
  'src/app/jezyk-polski/klasa-4/lib/korpus/index.ts',
  'src/app/jezyk-polski/klasa-4/lib/pisarnia/index.ts',
];

await writeFile(
  entry,
  `${SOURCES.map((s) => `export * from '${resolve(root, s)}';`).join('\n')}\n`,
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node' });

const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const {
  MAZUREK,
  ROTA,
  TAKT_ROWS,
  ROTA_ROLES,
  PROMISE_VERSES,
  MY_TARGETS,
  MY_TOTAL,
  SLOWNICZEK,
  buildKorpus,
  analyze,
  judgeRow,
  squeeze,
  rowText,
  hymnSqueeze,
  fitMessage,
  seal,
  splitEnding,
  countByKind,
  judgeObietnica,
  readMy,
} = lib;

let failures = 0;
let checks = 0;

/** Jedna asercja na warunku; `extra` dopisuje diagnozę, gdy warunek pada. */
function cond(label, value, extra) {
  checks += 1;
  if (!value) {
    failures += 1;
    console.error(`  ✗ ${label}\n      otrzymano:  ${JSON.stringify(extra ?? value)}`);
  }
}

function group(name, fn) {
  console.log(`\n${name}`);
  fn();
}

const kM = buildKorpus(MAZUREK);
const kR = buildKorpus(ROTA);

/* --- A. TEKSTY ------------------------------------------------------------- */

const v12 = [...Array(12).keys()].map((i) => `v${i}`);
const v7 = [...Array(7).keys()].map((i) => `v${i}`);

group('A. TEKSTY', () => {
  cond('A1. Mazurek: 12 wersów (v0..v11) w 3 strofach',
    kM.units.length === 12
    && JSON.stringify(kM.units.map((u) => u.id)) === JSON.stringify(v12)
    && kM.blocks.length === 3
    && JSON.stringify(kM.blocks.map((b) => b.length)) === JSON.stringify([4, 4, 4]),
    { units: kM.units.map((u) => u.id), blocks: kM.blocks });

  cond('A2. Rota: 7 wersów (v0..v6) w 1 strofie',
    kR.units.length === 7
    && JSON.stringify(kR.units.map((u) => u.id)) === JSON.stringify(v7)
    && kR.blocks.length === 1
    && kR.blocks[0].length === 7,
    { units: kR.units.map((u) => u.id), blocks: kR.blocks });

  cond("A3. wers v8 Mazurka === 'Przejdziem Wisłę, przejdziem Wartę,'",
    kM.unitById.v8?.text === 'Przejdziem Wisłę, przejdziem Wartę,',
    kM.unitById.v8?.text);

  cond("A4. wers v0 Roty === 'Nie rzucim ziemi, skąd nasz ród.'",
    kR.unitById.v0?.text === 'Nie rzucim ziemi, skąd nasz ród.',
    kR.unitById.v0?.text);
});

/* --- B. „MY” --------------------------------------------------------------- */

const myIdsInTexts = [
  ...kM.tokens.filter((t) => t.id.startsWith('my-')).map((t) => t.id),
  ...kR.tokens.filter((t) => t.id.startsWith('my-')).map((t) => t.id),
];
const tokenByIdAll = { ...kM.tokenById, ...kR.tokenById };

group('B. „MY”', () => {
  cond('B1. id „my-*” w obu korpusach === klucze MY_TARGETS (18, w obie strony)',
    myIdsInTexts.length === 18
    && new Set(myIdsInTexts).size === 18
    && myIdsInTexts.every((id) => id in MY_TARGETS)
    && Object.keys(MY_TARGETS).every((id) => myIdsInTexts.includes(id)),
    { wTekstach: [...myIdsInTexts].sort(), wMyTargets: Object.keys(MY_TARGETS).sort() });

  cond("B2. każda końcówka: splitEnding daje 'my' (ending 2) albo 'm' (ending 1), rdzeń+końcówka === forma",
    Object.entries(MY_TARGETS)
      .filter(([, t]) => t.kind === 'koncowka')
      .every(([id, t]) => {
        const forma = tokenByIdAll[id]?.form;
        if (!forma) return false;
        const [rzen, konc] = splitEnding(forma, t);
        const dobra = t.ending === 2 ? konc === 'my' : konc === 'm';
        return dobra && rzen + konc === forma;
      }),
    Object.entries(MY_TARGETS)
      .filter(([, t]) => t.kind === 'koncowka')
      .map(([id, t]) => ({ id, forma: tokenByIdAll[id]?.form, ending: t.ending, split: splitEnding(tokenByIdAll[id]?.form ?? '', t) })));

  cond('B3. countByKind(wszystkie klucze) === { slowo: 2, przebranie: 6, koncowka: 10 }',
    JSON.stringify(countByKind(Object.keys(MY_TARGETS))) === JSON.stringify({ slowo: 2, przebranie: 6, koncowka: 10 }),
    countByKind(Object.keys(MY_TARGETS)));

  cond('B4. MY_TOTAL === 18',
    MY_TOTAL === 18, MY_TOTAL);
});

/* --- C. SŁOWNICZEK ---------------------------------------------------------- */

group('C. SŁOWNICZEK', () => {
  cond('C1. każdy klucz SLOWNICZEK istnieje jako id tokenu w MAZUREK albo ROTA',
    Object.keys(SLOWNICZEK).every((id) => id in kM.tokenById || id in kR.tokenById),
    Object.keys(SLOWNICZEK).filter((id) => !(id in kM.tokenById) && !(id in kR.tokenById)));

  cond("C2. żaden wpis słowniczka nie dotyczy form 'przejdziem', 'będziem', 'złączym'",
    Object.values(SLOWNICZEK).every((e) => {
      const slowa = e.word.toLowerCase().split(/[^a-ząćęłńóśźż]+/u);
      return !slowa.includes('przejdziem') && !slowa.includes('będziem') && !slowa.includes('złączym');
    }),
    Object.entries(SLOWNICZEK).map(([id, e]) => ({ id, word: e.word })));
});

/* --- D. TAKT ---------------------------------------------------------------- */

const rowById = (id) => TAKT_ROWS.find((r) => r.id === id);

group('D. TAKT', () => {
  cond('D1. dla każdego wiersza suma `bars` === `notes`',
    TAKT_ROWS.every((row) => row.bars.reduce((a, b) => a + b, 0) === row.notes),
    TAKT_ROWS.map((row) => ({ id: row.id, bars: row.bars, notes: row.notes })));

  const start = Object.fromEntries(TAKT_ROWS.map((row) => [row.id, judgeRow(row, new Set())]));
  cond("D2. start: 'zyjemy' pasuje; reszta za-długa (zlaczym 1, przejdziem 2, bedziem 1)",
    start.zyjemy.fit === 'pasuje'
    && start.zlaczym.fit === 'za-dlugi' && start.zlaczym.diff === 1
    && start.przejdziem.fit === 'za-dlugi' && start.przejdziem.diff === 2
    && start.bedziem.fit === 'za-dlugi' && start.bedziem.diff === 1,
    start);

  cond('D3. rowText(row, hymnSqueeze(row)) === row.hymn i judgeRow → pasuje',
    TAKT_ROWS.every((row) => {
      const sq = hymnSqueeze(row);
      return rowText(row, sq) === row.hymn && judgeRow(row, sq).fit === 'pasuje';
    }),
    TAKT_ROWS.map((row) => {
      const sq = hymnSqueeze(row);
      return { id: row.id, squeeze: [...sq], rowText: rowText(row, sq), hymn: row.hymn, fit: judgeRow(row, sq).fit };
    }));

  const scisniete = squeeze(rowById('zyjemy'), new Set(), 2);
  cond("D4. w 'zyjemy' ściśnięcie słowa 2 daje ok, a judgeRow → za-krótki z diff -1",
    scisniete.ok === true
    && scisniete.ok
    && (() => { const v = judgeRow(rowById('zyjemy'), scisniete.squeezed); return v.fit === 'za-krotki' && v.diff === -1; })(),
    { scisniete, werdykt: scisniete.ok ? judgeRow(rowById('zyjemy'), scisniete.squeezed) : null });

  const wisla = squeeze(rowById('przejdziem'), new Set(), 1);
  const sie = squeeze(rowById('zlaczym'), new Set(), 1);
  const raz = squeeze(rowById('zlaczym'), new Set(), 0);
  const dwaRazy = raz.ok ? squeeze(rowById('zlaczym'), raz.squeezed, 0) : null;
  cond('D5a. squeeze słowa bez `short` („Wisłę”, „się”) zwraca ok:false z nazwą słowa w „…”',
    wisla.ok === false && !sie.ok
    && wisla.ok === false && wisla.reason.includes('„Wisłę”')
    && sie.ok === false && sie.reason.includes('„się”'),
    { wisla, sie });

  cond("D5b. dla „się” reason mówi o jednej sylabie; ponowne squeeze zdejmuje słowo ze zbioru",
    sie.ok === false && sie.reason.includes('jedną sylabę')
    && raz.ok === true && raz.squeezed.has(0)
    && dwaRazy?.ok === true && dwaRazy.ok && dwaRazy.squeezed.size === 0,
    { sie, raz, dwaRazy });

  cond("D6. fitMessage dla diff 2 zaczyna się od '2 sylaby'",
    fitMessage(rowById('przejdziem'), judgeRow(rowById('przejdziem'), new Set())).startsWith('2 sylaby'),
    fitMessage(rowById('przejdziem'), judgeRow(rowById('przejdziem'), new Set())));
});

/* --- E. PIECZĘĆ -------------------------------------------------------------- */

group('E. PIECZĘĆ', () => {
  cond('E1. ROTA_ROLES ma klucze v0..v6 i każdy istnieje w korpusie ROTA',
    JSON.stringify(Object.keys(ROTA_ROLES).sort()) === JSON.stringify(['v0', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6'])
    && Object.keys(ROTA_ROLES).every((v) => v in kR.unitById),
    { klucze: Object.keys(ROTA_ROLES).sort(), wersy: Object.keys(kR.unitById) });

  cond("E2. PROMISE_VERSES === ['v0','v1','v4']",
    JSON.stringify(PROMISE_VERSES) === JSON.stringify(['v0', 'v1', 'v4']),
    PROMISE_VERSES);

  cond('E3. każdy wers-obietnica ma `verb`, który jest id tokenu leżącego W TYM wersie',
    PROMISE_VERSES.every((v) => {
      const verb = ROTA_ROLES[v].verb;
      return typeof verb === 'string' && kR.unitById[v].tokenIds.includes(verb);
    }),
    PROMISE_VERSES.map((v) => ({ wers: v, verb: ROTA_ROLES[v].verb, tokeny: kR.unitById[v]?.tokenIds })));

  const v2 = seal('v2');
  const v5 = seal('v5');
  cond("E4. seal('v2').ok === false, seal('v5').info.role === 'prosba', seal('v9') === null",
    v2 !== null && v2.ok === false
    && v5 !== null && v5.ok === false && v5.info.role === 'prosba'
    && seal('v9') === null,
    { v2, v5, v9: seal('v9') });
});

/* --- F. OBIETNICA ------------------------------------------------------------ */

group('F. OBIETNICA', () => {
  const obietnica = (tekst) => {
    const v = judgeObietnica(analyze(tekst));
    return [v.zdanie.ok, v.my.ok, v];
  };

  /** [tekst, zdanie.ok, my.ok, fragment notatki (albo null)] */
  const PRZYPADKI = [
    ['Będziemy dbać o naszą klasę.', true, true, null],
    ['Nie damy nikomu zrobić krzywdy!', true, true, null],
    ['My zawsze sobie pomożemy.', true, true, null],
    ['Pomóżmy pani Halinie w ogródku.', true, true, null],
    ['my pomożemy pani Halinie.', false, true, null],
    ['Pomożemy sobie nawzajem?', false, true, 'nie pyta'],
    ['Zawsze pomożemy. I będziemy razem.', false, true, null],
    ['Posprzątaliśmy całe podwórko.', true, false, 'już było'],
    ['Chcielibyśmy mieć czysto.', true, false, 'chcieli'],
    ['Jesteśmy najlepszą drużyną!', true, false, 'Polski my naród'],
    ['Nasza klasa będzie czysta.', true, false, 'czyje'],
    ['Będę zawsze pomagać.', true, false, null],
    ['Mamy nowe domy.', true, true, null],
    ['Lubię zimy i domy.', true, false, null],
    ['Przejdziem razem przez rzekę!', true, true, null],
    ['', false, false, null],
    ['Pomożemy', false, true, null],
  ];

  for (const [tekst, zdanieOk, myOk, note] of PRZYPADKI) {
    const [z, m, v] = obietnica(tekst);
    const trafione = z === zdanieOk && m === myOk
      && (note === null || v.zdanie.note.includes(note) || v.my.note.includes(note));
    let extra = { tekst, zdanie: v.zdanie, my: v.my };
    if (tekst === 'Mamy nowe domy.') {
      const maDomy = v.myWords.some((w) => w.word.low === 'domy');
      cond("F. 'Mamy nowe domy.' → [true,true], a „domy” NIE jest w myWords",
        trafione && !maDomy, { ...extra, myWords: v.myWords.map((w) => w.word.low) });
    } else {
      cond(`F. '${tekst || '(pusto)'}' → [${zdanieOk},${myOk}]${note ? ` (note: „${note}”)` : ''}`,
        trafione, extra);
    }
  }

  const odczyty = {
    my: readMy('my'),
    zrobilismy: readMy('zrobiliśmy'),
    zrobilibysmy: readMy('zrobilibyśmy'),
    zimy: readMy('zimy'),
    damy: readMy('damy'),
  };
  cond("F. readMy: my→'my', zrobiliśmy→przeszlosc, zrobilibyśmy→warunek, zimy→null, damy→obietnica",
    odczyty.my === 'my'
    && odczyty.zrobilismy === 'przeszlosc'
    && odczyty.zrobilibysmy === 'warunek'
    && odczyty.zimy === null
    && odczyty.damy === 'obietnica',
    odczyty);
});

const total = checks;
console.log(failures === 0 ? `\n✓ ${total}/${total} OK\n` : `\n✗ ${failures} z ${total} nie przeszło\n`);
process.exit(failures === 0 ? 0 : 1);
