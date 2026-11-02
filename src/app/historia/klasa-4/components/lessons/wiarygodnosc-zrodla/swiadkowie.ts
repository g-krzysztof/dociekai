/**
 * Blok 1 — „Trzech świadków” (haczyk) — dane i sędzia, bez Reacta.
 *
 * Na przerwie spadła doniczka; troje świadków (postaci wymyślone na potrzeby
 * ćwiczenia) pisze o tym w czacie klasy. Dziecko zakreśla zdania dwoma
 * kolorami: zielony = **da się sprawdzić** (zegar, inni świadkowie, plan
 * szkoły), żółty = **czyjeś zdanie** (ocena, zgadywanie, czytanie w myślach).
 *
 * Reguła jest jedna i dziecko samo ją stosuje: „czy ktoś inny mógłby to
 * potwierdzić albo obalić?”. Sędzia sprawdza tylko zdania jednoznaczne
 * (`fakt`, `opinia`). Zdania graniczne (`graniczne`) przyjmuje w obu kolorach
 * i po sprawdzeniu pokazuje, dlaczego mogą być i takie, i takie — karta lekcji
 * zabrania jednego klucza dla każdego słowa.
 */

export type Marker = 'fakt' | 'opinia';
export type FragmentKind = Marker | 'graniczne';

export interface Fragment {
  id: string;
  text: string;
  kind: FragmentKind;
  /** Pomyłka w drugą stronę — konkret z tego zdania, nie „spróbuj jeszcze raz”. */
  why: string;
  /** Tylko fakty: czego dotyczą — z tego powstaje tabela porównania świadków. */
  about?: 'kiedy' | 'gdzie' | 'kto';
}

export interface Witness {
  id: string;
  name: string;
  /** Skąd patrzył — świadek ma swoje miejsce (kto mówi). */
  where: string;
  fragments: Fragment[];
}

export const WITNESSES: Witness[] = [
  {
    id: 'ola',
    name: 'Ola',
    where: 'stała przy tablicy ogłoszeń',
    fragments: [
      { id: 'ola-1', text: 'Była 10:40, bo akurat patrzyłam na zegar nad drzwiami.', kind: 'fakt', about: 'kiedy', why: 'Godzinę da się sprawdzić — zegar wisi nad drzwiami, a dzwonek dzwoni o stałej porze.' },
      { id: 'ola-2', text: 'Doniczka spadła z parapetu przy sali 12.', kind: 'fakt', about: 'gdzie', why: 'Miejsce da się sprawdzić — ziemia i skorupy leżą pod oknem przy sali 12.' },
      { id: 'ola-3', text: 'Najbliżej stał Kuba.', kind: 'fakt', about: 'kto', why: 'To da się sprawdzić — inni też widzieli, kto stał przy oknie.' },
      { id: 'ola-4', text: 'Na pewno zrobił to specjalnie!', kind: 'opinia', why: 'Jak to sprawdzić? Nikt nie zajrzy Kubie do głowy — to zgadywanie, co myślał.' },
    ],
  },
  {
    id: 'antek',
    name: 'Antek',
    where: 'szedł z drugiego końca korytarza',
    fragments: [
      { id: 'antek-1', text: 'Huknęło zaraz po dzwonku na przerwę.', kind: 'fakt', about: 'kiedy', why: 'Dzwonek dzwoni o stałej godzinie — to da się sprawdzić w planie lekcji.' },
      { id: 'antek-2', text: 'Przy oknie stali Kuba i Zosia.', kind: 'fakt', about: 'kto', why: 'To da się sprawdzić — można zapytać Zosię i innych, kto stał przy oknie.' },
      { id: 'antek-3', text: 'Kuba się rozpychał.', kind: 'graniczne', why: 'Graniczne: to, że Kuba się poruszał i kogoś dotknął, ktoś mógł zobaczyć — ale „rozpychał się” to już ocena, jak mocno i po co. Pasuje do obu kolorów.' },
      { id: 'antek-4', text: 'To był najgłośniejszy huk w historii szkoły.', kind: 'opinia', why: 'Nikt nie mierzył wszystkich huków w historii szkoły — to przesada, czyjeś odczucie.' },
    ],
  },
  {
    id: 'maja',
    name: 'Maja',
    where: 'siedziała na ławce pod oknem',
    fragments: [
      { id: 'maja-1', text: 'Kuba to mój najlepszy kolega.', kind: 'fakt', why: 'To da się sprawdzić — cała klasa wie, z kim Maja się przyjaźni. Zapamiętaj to zdanie: mówi coś ważnego o świadku.' },
      { id: 'maja-2', text: 'Okno było otwarte.', kind: 'fakt', about: 'gdzie', why: 'To da się sprawdzić — inni też widzieli okno, a woźny wie, kto je otwierał.' },
      { id: 'maja-3', text: 'Doniczkę zrzucił wiatr.', kind: 'graniczne', why: 'Graniczne: wiatr mógł zrzucić doniczkę i to da się częściowo sprawdzić (czy wiało, czy doniczka stała na brzegu), ale nikt nie widział, że to właśnie wiatr — Maja zgaduje przyczynę. Pasuje do obu kolorów.' },
      { id: 'maja-4', text: 'Kuba jest najgrzeczniejszy w całej klasie.', kind: 'opinia', why: '„Najgrzeczniejszy” to ocena — ktoś inny oceniłby Kubę inaczej. Tego nie da się sprawdzić.' },
    ],
  },
];

export const ALL_FRAGMENTS: Fragment[] = WITNESSES.flatMap((w) => w.fragments);

export function fragmentById(id: string): Fragment {
  const f = ALL_FRAGMENTS.find((x) => x.id === id);
  if (!f) throw new Error(`Nie ma zdania „${id}”`);
  return f;
}

export type Marks = Partial<Record<string, Marker>>;

export interface HighlightVerdict {
  ok: boolean;
  /** Zdania jednoznaczne bez koloru. */
  missing: number;
  /** Zdania jednoznaczne w złym kolorze — z powodem. */
  wrong: { id: string; text: string; why: string }[];
  /** Zdania graniczne (zawsze przyjęte) — do pokazania po sprawdzeniu. */
  borderline: { id: string; text: string; why: string; marked?: Marker }[];
}

/**
 * Sędzia zakreślacza: każde zdanie jednoznaczne ma swój kolor; graniczne —
 * dowolny albo żaden. Zwraca konkretne pomyłki, nie „źle”.
 */
export function judgeHighlights(marks: Marks): HighlightVerdict {
  const wrong: HighlightVerdict['wrong'] = [];
  const borderline: HighlightVerdict['borderline'] = [];
  let missing = 0;
  for (const f of ALL_FRAGMENTS) {
    const m = marks[f.id];
    if (f.kind === 'graniczne') {
      borderline.push({ id: f.id, text: f.text, why: f.why, marked: m });
      continue;
    }
    if (!m) missing += 1;
    else if (m !== f.kind) wrong.push({ id: f.id, text: f.text, why: f.why });
  }
  return { ok: missing === 0 && wrong.length === 0, missing, wrong, borderline };
}

// ─── Porównanie świadków (po zakreśleniu) ───

export interface CompareRow {
  about: 'kiedy' | 'gdzie' | 'kto';
  question: string;
  /** Zdania-fakty każdego świadka o tym (albo null, gdy świadek milczy). */
  cells: { witness: string; text: string | null }[];
  /** Ilu świadków mówi o tym zgodnie — wyliczone z danych niżej, nie z zakreśleń. */
  agree: number;
  note: string;
}

const ROW_DEFS: { about: CompareRow['about']; question: string; agree: number; note: string }[] = [
  { about: 'kiedy', question: 'Kiedy?', agree: 2, note: 'Ola i Antek mówią to samo innymi słowami — przerwa zaczyna się o 10:40. Dwóch niezależnych świadków: temu wierzymy mocno.' },
  { about: 'gdzie', question: 'Gdzie?', agree: 2, note: 'Ola mówi o parapecie przy sali 12, Maja o otwartym oknie — to samo miejsce. Też potwierdzone.' },
  { about: 'kto', question: 'Kto stał obok?', agree: 2, note: 'Kuba — według Oli i Antka. Zosię widział tylko Antek: jeden świadek to za mało, trzeba zapytać kogoś jeszcze.' },
];

export const COMPARE_ROWS: CompareRow[] = ROW_DEFS.map((def) => ({
  ...def,
  cells: WITNESSES.map((w) => ({
    witness: w.name,
    text: w.fragments.find((f) => f.kind === 'fakt' && f.about === def.about)?.text ?? null,
  })),
}));
