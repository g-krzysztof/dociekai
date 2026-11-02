/**
 * Selftest modeli Półki czytelnika i Teczki autora (E5a) —
 * `src/app/jezyk-polski/klasa-4/lib/polka/` i `lib/teczka/`.
 *
 * Wzorzec: `scripts/polski-pisarnia-selftest.mjs` — esbuild bundluje moduły TS,
 * potem asercje na czystych funkcjach i na magazynie z atrapą `window`.
 *
 *   node scripts/polski-polka-selftest.mjs
 */

import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = await mkdtemp(join(tmpdir(), 'polski-polka-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

const base = `${process.cwd()}/src/app/jezyk-polski/klasa-4/lib`;
await writeFile(
  entry,
  `export * from '${base}/polka/model';\n` +
    `export * from '${base}/polka/summary';\n` +
    `export * from '${base}/polka/storage';\n` +
    `export * from '${base}/teczka/storage';\n` +
    `export { episodeMinutes } from '${base}/czytelnia/types';\n`,
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node' });

const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const {
  addBook,
  markEpisodeDone,
  setImpression,
  setBookmark,
  setPlan,
  setStatus,
  mergeShelves,
  parseShelf,
  planEndDate,
  planState,
  summarizeEntry,
  sortSummaries,
  bookletItems,
  paragraphsOf,
  IMPRESSION_FEELINGS,
  feelingLabel,
  episodeMinutes,
  readShelf,
  writeShelf,
  adoptSessionShelf,
  clearShelf,
  SHELF_KEY,
  SHELF_CHANGED_EVENT,
  saveTeczkaItem,
  readTeczka,
  setInBooklet,
  removeTeczkaItem,
  adoptSessionTeczka,
  clearTeczka,
  parseTeczka,
  TECZKA_KEY,
  TECZKA_CHANGED_EVENT,
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

/** Asercja na warunku (np. tożsamość obiektu `===`, brak klucza). */
function cond(label, value) {
  checks += 1;
  if (!value) {
    failures += 1;
    failedNums.push(numOf(label));
    console.error(`  ✗ ${label}\n      oczekiwano: prawda\n      otrzymano:  ${JSON.stringify(value)}`);
  }
}

function group(name, fn) {
  console.log(`\n${name}`);
  fn();
}

/** Rekurencyjnie sortuje klucze — porównanie wyników scalania bez względu na kolejność. */
function stable(v) {
  if (Array.isArray(v)) return v.map(stable);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = stable(v[k]);
    return o;
  }
  return v;
}

/** Pusta półka. */
const E = { v: 1, entries: {} };

/* --- atrapa window dla funkcji magazynu ------------------------------------- */

let events = [];
function memStore() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => {
      m.set(k, String(v));
    },
    removeItem: (k) => {
      m.delete(k);
    },
  };
}
function resetWindow() {
  events = [];
  globalThis.window = {
    localStorage: memStore(),
    sessionStorage: memStore(),
    dispatchEvent: (e) => events.push(e.type),
  };
  globalThis.Event = class {
    constructor(t) {
      this.type = t;
    }
  };
}

/* --- A. model Półki ---------------------------------------------------------- */

group('A. model Półki', () => {
  const r1 = addBook(E, 'k', 'czytelnia', 100);
  check('1a. addBook: puste done', r1.entries.k.done, []);
  check('1b. addBook: addedAt', r1.entries.k.addedAt, 100);
  check('1c. addBook: status początkowy', r1.entries.k.status, { value: 'czytam', updatedAt: 100 });
  check('1d. addBook: bookId i kind', [r1.entries.k.bookId, r1.entries.k.kind], ['k', 'czytelnia']);

  cond('2. addBook na istniejącej książce zwraca ten sam obiekt', addBook(r1, 'k', 'czytelnia', 200) === r1);

  const r3 = markEpisodeDone(markEpisodeDone(r1, 'k', 2, 4, 200), 'k', 1, 4, 210);
  check('3a. odcinki posortowane', r3.entries.k.done, [1, 2]);
  check('3b. status nadal czytam', r3.entries.k.status.value, 'czytam');

  let r4 = r1;
  [1, 2, 3, 4].forEach((n, i) => {
    r4 = markEpisodeDone(r4, 'k', n, 4, 200 + i * 10);
  });
  check('4. po ostatnim odcinku status przeczytana', r4.entries.k.status, { value: 'przeczytana', updatedAt: 230 });

  const r5 = markEpisodeDone(markEpisodeDone(r1, 'k', 2, 4, 200), 'k', 2, 4, 210);
  check('5. ten sam odcinek dwa razy bez duplikatu', r5.entries.k.done, [2]);

  const r6a = setImpression(r1, 'k', 140, 'radosc', 300);
  check('6a. gauge 140 → 100 z uczuciem', r6a.entries.k.impression.value, { gauge: 100, feeling: 'radosc' });
  check('6b. gauge -5 → 0', setImpression(r1, 'k', -5, 'smutek', 300).entries.k.impression.value.gauge, 0);
  check('6c. gauge 33.6 → 34', setImpression(r1, 'k', 33.6, 'radosc', 300).entries.k.impression.value.gauge, 34);
  const r6d = setImpression(r1, 'k', 50, undefined, 300);
  cond(
    '6d. bez uczucia brak klucza feeling',
    r6d.entries.k.impression != null && !('feeling' in r6d.entries.k.impression.value),
  );

  check('7. setBookmark', setBookmark(r1, 'k', 2, 's14', 400).entries.k.bookmark, {
    value: { n: 2, unit: 's14' },
    updatedAt: 400,
  });

  cond('8a. setPlan na brakującej książce zwraca ten sam rekord', setPlan(r1, 'x', {}, 100) === r1);
  cond('8b. setStatus na brakującej książce zwraca ten sam rekord', setStatus(r1, 'x', 'czytam', 100) === r1);
  cond('8c. setBookmark na brakującej książce zwraca ten sam rekord', setBookmark(r1, 'x', 1, 's1', 100) === r1);
  cond('8d. markEpisodeDone na brakującej książce zwraca ten sam rekord', markEpisodeDone(r1, 'x', 1, 4, 100) === r1);

  let a9 = addBook(E, 'k', 'czytelnia', 100);
  a9 = markEpisodeDone(a9, 'k', 1, 4, 150);
  a9 = setBookmark(a9, 'k', 1, 'u1', 500);
  let b9 = addBook(E, 'k', 'czytelnia', 50);
  b9 = markEpisodeDone(b9, 'k', 2, 4, 160);
  b9 = setBookmark(b9, 'k', 2, 'u2', 400);
  const m9 = mergeShelves(a9, b9);
  check('9a. scalenie: suma odcinków', m9.entries.k.done, [1, 2]);
  check('9b. scalenie: wcześniejsze addedAt', m9.entries.k.addedAt, 50);
  check('9c. scalenie: nowsza zakładka wygrywa', m9.entries.k.bookmark, {
    value: { n: 1, unit: 'u1' },
    updatedAt: 500,
  });
  check('10. przemienność scalania', stable(mergeShelves(a9, b9)), stable(mergeShelves(b9, a9)));

  const t1 = setBookmark(addBook(E, 'k', 'czytelnia', 100), 'k', 1, 'u1', 500);
  const t2 = setBookmark(addBook(E, 'k', 'czytelnia', 100), 'k', 2, 'u2', 500);
  check(
    '11. remis czasu rozstrzygany tak samo z obu stron',
    mergeShelves(t1, t2).entries.k.bookmark,
    mergeShelves(t2, t1).entries.k.bookmark,
  );

  let a12 = addBook(E, 'k1', 'czytelnia', 100);
  a12 = addBook(a12, 'k2', 'czytelnia', 120);
  a12 = markEpisodeDone(a12, 'k1', 1, 4, 110);
  a12 = setBookmark(a12, 'k1', 1, 'u1', 500);
  let b12 = addBook(E, 'k2', 'czytelnia', 110);
  b12 = addBook(b12, 'k3', 'czytelnia', 130);
  b12 = markEpisodeDone(b12, 'k2', 2, 4, 115);
  let c12 = addBook(E, 'k1', 'czytelnia', 90);
  c12 = addBook(c12, 'k3', 'czytelnia', 140);
  c12 = markEpisodeDone(c12, 'k3', 2, 4, 150);
  c12 = setPlan(c12, 'k1', { '2026-10-20': 1 }, 160);
  check(
    '12. łączność scalania',
    stable(mergeShelves(mergeShelves(a12, b12), c12)),
    stable(mergeShelves(a12, mergeShelves(b12, c12))),
  );

  const onlyB = addBook(b9, 'tylko-b', 'czytelnia', 200);
  check('13. książka tylko z b trafia do wyniku bez zmian', mergeShelves(a9, onlyB).entries['tylko-b'], onlyB.entries['tylko-b']);

  check('14. idempotencja scalania', stable(mergeShelves(a9, a9)), stable(a9));

  check('15a. parseShelf(null) to pusta półka', parseShelf(null), E);
  check('15b. parseShelf("x") to pusta półka', parseShelf('x'), E);
  check('15c. parseShelf({}) to pusta półka', parseShelf({}), E);

  const p16 = parseShelf({
    entries: {
      k: { bookId: 'other', kind: 'czytelnia', addedAt: 1, done: [] },
      k2: { bookId: 'k2', kind: 'inne', addedAt: 1, done: [] },
      k3: { bookId: 'k3', kind: 'czytelnia', addedAt: 5, done: ['a', 0, -1, 2.5, 3] },
    },
  });
  check('16a. obce wpisy odrzucone', Object.keys(p16.entries), ['k3']);
  check('16b. done tylko dodatnie całkowite', p16.entries.k3.done, [3]);

  const p17 = parseShelf({
    entries: {
      k: {
        bookId: 'k',
        kind: 'czytelnia',
        addedAt: 1,
        done: [],
        status: { value: 'nieznany', updatedAt: 5 },
        plan: { value: { '2026-10-20': 1 }, updatedAt: 6 },
      },
    },
  });
  cond('17a. status spoza listy odrzucony', !('status' in p17.entries.k));
  check('17b. poprawny plan zostaje', p17.entries.k.plan, { value: { '2026-10-20': 1 }, updatedAt: 6 });

  const plan = { '2026-10-20': 1, '2026-10-19': 1, '2026-10-22': 2 };
  check('18a. koniec planu dla 3 odcinków', planEndDate(plan, 3), '2026-10-22');
  check('18b. koniec planu dla 2 odcinków', planEndDate(plan, 2), '2026-10-20');
  check('18c. za krótki plan to null', planEndDate(plan, 5), null);
  check('18d. dni z zerem pomijane', planEndDate({ '2026-10-19': 0, '2026-10-21': 1 }, 1), '2026-10-21');

  check('19a. episodeMinutes(0)', episodeMinutes(0), 1);
  check('19b. episodeMinutes(130)', episodeMinutes(130), 1);
  check('19c. episodeMinutes(131)', episodeMinutes(131), 2);
  check('19d. episodeMinutes(556)', episodeMinutes(556), 5);
});

/* --- B. magazyn Półki -------------------------------------------------------- */

group('B. magazyn Półki', () => {
  resetWindow();
  check('20a. readShelf z pustego magazynu to E', readShelf(window.localStorage), E);
  const r20 = setBookmark(addBook(E, 'k', 'czytelnia', 100), 'k', 2, 's14', 400);
  writeShelf(window.localStorage, r20);
  check('20b. writeShelf + readShelf zwraca to samo', readShelf(window.localStorage), r20);
  check('20c. nazwa zdarzenia Półki', SHELF_CHANGED_EVENT, 'dociekai:pol-shelf-changed');
  cond('20d. zdarzenie po zapisie', events.includes(SHELF_CHANGED_EVENT));

  resetWindow();
  writeShelf(window.localStorage, addBook(E, 'k', 'czytelnia', 100));
  writeShelf(window.localStorage, E);
  check('21. zapis pustej półki usuwa klucz', window.localStorage.getItem(SHELF_KEY), null);

  resetWindow();
  window.localStorage.setItem(SHELF_KEY, '{zepsute');
  check('22. uszkodzony JSON to E bez wyjątku', readShelf(window.localStorage), E);

  resetWindow();
  const local23 = addBook(markEpisodeDone(addBook(E, 'k', 'czytelnia', 100), 'k', 2, 4, 150), 'm', 'lekcja', 120);
  writeShelf(window.localStorage, local23);
  writeShelf(window.sessionStorage, markEpisodeDone(addBook(E, 'k', 'czytelnia', 90), 'k', 1, 4, 160));
  const merged23 = adoptSessionShelf();
  check('23a. adopcja: suma odcinków', merged23.entries.k.done, [1, 2]);
  cond('23b. adopcja: książka m zachowana', !!merged23.entries.m);
  check('23c. adopcja: sesja wyczyszczona', window.sessionStorage.getItem(SHELF_KEY), null);

  resetWindow();
  writeShelf(window.localStorage, addBook(E, 'k', 'czytelnia', 100));
  writeShelf(window.sessionStorage, addBook(E, 'k', 'czytelnia', 100));
  clearShelf();
  check('24a. clearShelf czyści localStorage', window.localStorage.getItem(SHELF_KEY), null);
  check('24b. clearShelf czyści sessionStorage', window.sessionStorage.getItem(SHELF_KEY), null);
});

/* --- C. Teczka ---------------------------------------------------------------- */

group('C. Teczka', () => {
  const cardA = { id: 'a', lesson: 'start/jezyk-dziala', kind: 'wizytowka', title: 'W', text: 'X' };

  resetWindow();
  saveTeczkaItem(window.localStorage, cardA, 100);
  const t25 = readTeczka(window.localStorage);
  check('25a. createdAt kartki', t25.items.a.createdAt, 100);
  check('25b. updatedAt kartki', t25.items.a.updatedAt, 100);
  check('25c. tekst kartki', t25.items.a.text, 'X');
  check('25d. nazwa zdarzenia Teczki', TECZKA_CHANGED_EVENT, 'dociekai:pol-teczka-changed');
  cond('25e. zdarzenie po zapisie', events.includes(TECZKA_CHANGED_EVENT));

  saveTeczkaItem(window.localStorage, { ...cardA, text: 'Y' }, 200);
  const t26 = readTeczka(window.localStorage);
  check('26a. ponowny zapis zachowuje createdAt', t26.items.a.createdAt, 100);
  check('26b. ponowny zapis podbija updatedAt', t26.items.a.updatedAt, 200);
  check('26c. ponowny zapis zmienia tekst', t26.items.a.text, 'Y');

  setInBooklet(window.localStorage, 'a', true);
  check('27a. wybór do książeczki', readTeczka(window.localStorage).items.a.inBooklet, true);
  saveTeczkaItem(window.localStorage, { ...cardA, text: 'Z' }, 300);
  check('27b. zapis zachowuje wybór do książeczki', readTeczka(window.localStorage).items.a.inBooklet, true);
  setInBooklet(window.localStorage, 'a', false);
  cond('27c. wycofanie usuwa klucz inBooklet', !('inBooklet' in readTeczka(window.localStorage).items.a));

  resetWindow();
  saveTeczkaItem(window.localStorage, { id: 'dlugi', lesson: 'l', kind: 'opis', title: 'T', text: 'z'.repeat(6000) }, 100);
  check('28. tekst przycięty do 5000 znaków', readTeczka(window.localStorage).items.dlugi.text.length, 5000);

  resetWindow();
  saveTeczkaItem(window.localStorage, { id: 'a', lesson: 'l', kind: 'k', title: 'A', text: 'X' }, 100);
  saveTeczkaItem(window.localStorage, { id: 'b', lesson: 'l', kind: 'k', title: 'B', text: 'Y' }, 100);
  removeTeczkaItem(window.localStorage, 'a');
  const t29 = readTeczka(window.localStorage);
  cond('29a. usunięta kartka znika, druga zostaje', !t29.items.a && !!t29.items.b);
  removeTeczkaItem(window.localStorage, 'b');
  check('29b. ostatnia kartka usuwa klucz', window.localStorage.getItem(TECZKA_KEY), null);

  resetWindow();
  saveTeczkaItem(window.localStorage, { id: 'a', lesson: 'l', kind: 'k', title: 'A', text: 'local' }, 200);
  saveTeczkaItem(window.sessionStorage, { id: 'a', lesson: 'l', kind: 'k', title: 'A', text: 'session' }, 300);
  saveTeczkaItem(window.sessionStorage, { id: 'b', lesson: 'l', kind: 'k', title: 'B', text: 'b' }, 100);
  adoptSessionTeczka();
  const t30 = readTeczka(window.localStorage);
  check('30a. nowsza kartka z sesji wygrywa', t30.items.a.updatedAt, 300);
  check('30b. treść kartki z sesji', t30.items.a.text, 'session');
  cond('30c. kartka tylko z sesji dołączona', !!t30.items.b);
  check('30d. adopcja czyści sesję', window.sessionStorage.getItem(TECZKA_KEY), null);
  resetWindow();
  saveTeczkaItem(window.localStorage, { id: 'a', lesson: 'l', kind: 'k', title: 'A', text: 'local' }, 200);
  saveTeczkaItem(window.sessionStorage, { id: 'a', lesson: 'l', kind: 'k', title: 'A', text: 'session' }, 100);
  adoptSessionTeczka();
  check('30e. starsza sesja nie nadpisuje', readTeczka(window.localStorage).items.a.text, 'local');

  resetWindow();
  saveTeczkaItem(window.localStorage, { id: 'a', lesson: 'l', kind: 'k', title: 'A', text: 'X' }, 100);
  saveTeczkaItem(window.sessionStorage, { id: 'b', lesson: 'l', kind: 'k', title: 'B', text: 'Y' }, 100);
  clearTeczka();
  check('31a. clearTeczka czyści localStorage', window.localStorage.getItem(TECZKA_KEY), null);
  check('31b. clearTeczka czyści sessionStorage', window.sessionStorage.getItem(TECZKA_KEY), null);

  check(
    '32. parseTeczka odrzuca kartki bez tekstu i z obcym id',
    parseTeczka({
      items: {
        a: { id: 'a', lesson: 'l', kind: 'k', title: 'T', text: 'X', createdAt: 1, updatedAt: 2 },
        b: { id: 'other', lesson: 'l', kind: 'k', title: 'T', text: 'Y', createdAt: 1, updatedAt: 2 },
        c: { id: 'c', lesson: 'l', kind: 'k', title: 'T', createdAt: 1, updatedAt: 2 },
        d: { id: 'd', lesson: 'l', kind: 'k', title: 'T', text: 123, createdAt: 1, updatedAt: 2 },
      },
    }),
    { v: 1, items: { a: { id: 'a', lesson: 'l', kind: 'k', title: 'T', text: 'X', createdAt: 1, updatedAt: 2 } } },
  );
});

/* --- D. summary: planState, summarizeEntry, sortowanie, książeczka -------- */

group('D. summary — planState', () => {
  const T = '2026-10-20';
  check('33a. remaining 0 bez planu to gotowe', planState(undefined, 0, T), { kind: 'gotowe' });
  check('33b. remaining 0 z planem to gotowe', planState({ '2026-10-20': 5 }, 0, T), { kind: 'gotowe' });
  check('34. brak planu to brak', planState(undefined, 3, T), { kind: 'brak' });
  check('35. plan na 3 odcinki kończy się 23-go', planState({ '2026-10-20': 1, '2026-10-21': 1, '2026-10-23': 1 }, 3, T), {
    kind: 'koniec',
    end: '2026-10-23',
    today: 1,
  });
  check('36. ten sam plan dla 2 odcinków kończy się 21-go', planState({ '2026-10-20': 1, '2026-10-21': 1, '2026-10-23': 1 }, 2, T), {
    kind: 'koniec',
    end: '2026-10-21',
    today: 1,
  });
  check('37. dni przeszłe ignorowane', planState({ '2026-10-18': 2, '2026-10-21': 1 }, 2, T), {
    kind: 'za-krotki',
    missing: 1,
    today: 0,
  });
  check('38. zera i ujemne pomijane', planState({ '2026-10-20': 0, '2026-10-22': -1, '2026-10-24': 2 }, 2, T), {
    kind: 'koniec',
    end: '2026-10-24',
    today: 0,
  });
  check('39. jeden odcinek przy planie 2 na dziś kończy się dziś', planState({ '2026-10-20': 2, '2026-10-21': 1 }, 1, T), {
    kind: 'koniec',
    end: '2026-10-20',
    today: 2,
  });
});

group('E. summary — summarizeEntry', () => {
  const T = '2026-10-20';
  const INFO = { title: 'X', total: 4 };
  const entry = (over = {}) => ({ bookId: 'k', kind: 'czytelnia', addedAt: 100, done: [], ...over });

  const h = summarizeEntry(entry({ done: [1, 2] }), INFO, T);
  check('40a. done [1,2] bez statusu to czytam', h.status, 'czytam');
  check('40b. done [1,2] to next 3', h.next, 3);
  check('40c. done [1,2] zostaje', h.done, [1, 2]);

  const i = summarizeEntry(entry({ done: [1, 2, 3, 4], status: { value: 'odlozona', updatedAt: 1 } }), INFO, T);
  check('41a. całość z odłożonej to przeczytana', i.status, 'przeczytana');
  check('41b. całość to next null', i.next, null);
  check('41c. całość to plan gotowe', i.plan, { kind: 'gotowe' });

  check('42. przeczytana z niepełnym done wraca do czytam', summarizeEntry(entry({ done: [1], status: { value: 'przeczytana', updatedAt: 1 } }), INFO, T).status, 'czytam');
  const k = summarizeEntry(entry({ done: [2], status: { value: 'odlozona', updatedAt: 1 } }), INFO, T);
  check('43a. odłożona z done [2] zostaje odłożona', k.status, 'odlozona');
  check('43b. odłożona z done [2] to next 1', k.next, 1);

  const l = summarizeEntry(entry({ done: [0, 2, 9] }), INFO, T);
  check('44a. numery spoza zakresu wypadają', l.done, [2]);
  check('44b. po wypadnięciu next 1', l.next, 1);

  check(
    '45a. zakładka spoza książki to null',
    summarizeEntry(entry({ bookmark: { value: { n: 7, unit: 's1' }, updatedAt: 1 } }), INFO, T).bookmark,
    null,
  );
  check(
    '45b. zakładka w książce zostaje',
    summarizeEntry(entry({ bookmark: { value: { n: 2, unit: 's3' }, updatedAt: 1 } }), INFO, T).bookmark,
    { n: 2, unit: 's3' },
  );

  check('46. total 0 kryte do 1', summarizeEntry(entry(), { title: 'X', total: 0 }, T).info.total, 1);

  check('47a. brak wrażenia to null', summarizeEntry(entry(), INFO, T).impression, null);
  check(
    '47b. wrażenie przechodzi bez zmian',
    summarizeEntry(entry({ impression: { value: { gauge: 40, feeling: 'nuda' }, updatedAt: 1 } }), INFO, T).impression,
    { gauge: 40, feeling: 'nuda' },
  );
});

group('F. summary — półka, książeczka, akapity, uczucia', () => {
  const s = (status, addedAt, bookId) => ({ status, addedAt, bookId });
  const input = [s('przeczytana', 1, 'a'), s('czytam', 5, 'b'), s('odlozona', 2, 'c'), s('czytam', 3, 'd')];
  const sorted = sortSummaries(input);
  check('48a. kolejność: czytane, odłożona, przeczytana', sorted.map((x) => x.bookId), ['d', 'b', 'c', 'a']);
  check('48b. tablica wejściowa niezmieniona', input.map((x) => x.bookId), ['a', 'b', 'c', 'd']);
  cond('48c. wynik to nowa tablica', sorted !== input);

  const card = (id, createdAt, inBooklet) => ({ id, lesson: 'l', kind: 'k', title: id, text: 'x', createdAt, updatedAt: createdAt, ...(inBooklet ? { inBooklet: true } : {}) });
  const items = [card('b', 2, true), card('a', 1, true), card('x', 0, false), card('d', 1, true)];
  check('49a. tylko wybrane do książeczki', bookletItems(items).map((x) => x.id), ['a', 'd', 'b']);
  cond('49b. wejście książeczki niezmienione', items[0].id === 'b' && items.length === 4);

  check('50a. akapity bez pustych linii', paragraphsOf('  A\n\n B \n'), ['A', 'B']);
  check('50b. pusty tekst to pusta lista', paragraphsOf(''), []);

  check('51a. strach to dreszczyk strachu', feelingLabel('strach'), 'dreszczyk strachu');
  check('51b. nieznane uczucie to undefined', feelingLabel('xyz'), undefined);
  check('51c. brak uczucia to undefined', feelingLabel(undefined), undefined);
  cond('51d. id uczuć unikalne', new Set(IMPRESSION_FEELINGS.map((f) => f.id)).size === IMPRESSION_FEELINGS.length);
});

const total = checks;
if (failures === 0) {
  console.log(`\n✓ ${total}/${total} OK\n`);
} else {
  console.log(`\n✗ ${failures} z ${total} nie przeszło`);
  console.log(`Niezdane przypadki: ${[...new Set(failedNums)].join(', ')}`);
}
process.exit(failures === 0 ? 0 : 1);
