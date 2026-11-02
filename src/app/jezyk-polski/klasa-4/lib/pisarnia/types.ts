/**
 * Pisarnia (E3 kursu polskiego) — typy analizatora tekstu dziecka.
 *
 * Analizator czyta tylko to, co w tekście **obiektywnie jest** (§ 6 programu,
 * warstwy 1–2): zdania, akapity, wielkie litery, znaki na końcu, odstępy,
 * kwestie dialogu, powtórzone wyrazy i słowa z zamkniętej palety we wszystkich
 * formach odmiany. Nie zgaduje, co dziecko miało na myśli — werdykt treści nie
 * istnieje, jest tylko struktura i skutek u postaci.
 *
 * Wszystkie pozycje (`start`/`end`) to indeksy w napisie wejściowym, więc
 * podświetlenie w polu tekstowym i werdykt mówią o tym samym miejscu.
 */

/** Tabela paradygmatów z `*.forms.ts` (skrypt `scripts/polski-paradygmaty.py`): lemat → wszystkie formy małymi literami. */
export type FormsTable = Record<string, string[]>;

export type EndMark = '.' | '!' | '?' | '…' | '?!';

export interface PisWord {
  index: number;
  form: string;
  /** Forma małymi literami — po niej porównujemy powtórzenia i paletę. */
  low: string;
  start: number;
  end: number;
  sentence: number;
  paragraph: number;
}

export interface PisSentence {
  index: number;
  paragraph: number;
  start: number;
  end: number;
  text: string;
  /** Indeksy wyrazów (`PisWord.index`) w tym zdaniu. */
  words: number[];
  /** Znak końca zdania; `null`, gdy zdanie urywa się bez kropki, pytajnika, wykrzyknika ani wielokropka. */
  endMark: EndMark | null;
  /** Ostatni znak interpunkcyjny zdania, jeśli nie jest znakiem końca (np. `,` po „Droga Olu,”). */
  trailingPunct: string | null;
  /** Pierwszy wyraz zaczyna się wielką literą (albo cyfrą). Zdanie bez wyrazów — `true`. */
  capitalOk: boolean;
  /** Zdanie należy do kwestii dialogu (akapit zaczyna się myślnikiem). */
  inDialog: boolean;
}

/** Część kwestii dialogu: wypowiedź postaci albo wtrącenie narratora („— zawołała Zuzia”). */
export interface DialogPart {
  role: 'speech' | 'narration';
  start: number;
  end: number;
}

export interface PisParagraph {
  index: number;
  start: number;
  end: number;
  text: string;
  sentences: number[];
  /** Akapit zaczyna się myślnikiem — to kwestia dialogu. */
  dialog: boolean;
  /** Jakim znakiem zaczęto kwestię: pauza `—`, półpauza `–` albo dywiz `-` z klawiatury. */
  dash: '—' | '–' | '-' | null;
  /** Wypowiedzi i wtrącenia narratora (tylko w kwestii dialogu). */
  parts: DialogPart[];
}

export type IssueKind =
  /** Zdanie zaczyna się małą literą. */
  | 'no-capital'
  /** Zdanie nie ma znaku na końcu. */
  | 'no-end-mark'
  /** Odstęp przed przecinkiem, kropką, pytajnikiem… („psa .”). */
  | 'space-before-punct'
  /** Brak odstępu po znaku („psa,kota”, „psa.On”). */
  | 'no-space-after-punct'
  /** Imię z listy lekcji zapisane małą literą. */
  | 'name-lowercase'
  /** Kwestia dialogu zaczęta dywizem z klawiatury zamiast myślnika (podpowiedź, nie błąd). */
  | 'dialog-hyphen';

export interface PisIssue {
  kind: IssueKind;
  /** Miejsce do podświetlenia (dla `no-end-mark` — ostatni znak zdania). */
  start: number;
  end: number;
  sentence: number | null;
  paragraph: number;
}

/** Ten sam wyraz w jednym albo sąsiednich zdaniach (§ 6: „ten sam ciąg liter w sąsiednich zdaniach”). */
export interface PisRepeat {
  low: string;
  /** Indeksy wyrazów — co najmniej dwa. */
  words: number[];
}

// ── Paleta ──────────────────────────────────────────────────────────────────

export interface PaletteEntry {
  id: string;
  /** Jak wpis pokazać dziecku: forma słownikowa albo zwrot („cieszyć się”). */
  label: string;
  /** Lematy, których wszystkie formy rozpoznajemy (z `FormsTable`). */
  lemmas?: string[];
  /** Formy dopisane ręcznie, także zwroty kilkuwyrazowe („ty jesteś”). */
  forms?: string[];
  /** Grupa, którą czyta lekcja (np. rodzina uczucia `radosc`, albo `oskarzenie`). */
  group?: string;
}

export interface CompiledPalette {
  entries: PaletteEntry[];
  /** Pierwszy wyraz formy → kandydaci (dłuższe zwroty pierwsze). */
  index: Map<string, { entry: PaletteEntry; words: string[] }[]>;
}

export interface PaletteHit {
  entryId: string;
  group?: string;
  /** Indeksy wyrazów, które tworzą trafienie (zwrot może mieć kilka). */
  words: number[];
  start: number;
  end: number;
  sentence: number;
  /** Tuż przed trafieniem stoi „nie” („nie cieszę się”). */
  negated: boolean;
}

// ── Wynik ───────────────────────────────────────────────────────────────────

export interface AnalyzeOptions {
  /** Zamknięta paleta lekcji (z `compilePalette`). */
  palette?: CompiledPalette;
  /** Imiona i nazwy własne (wszystkie formy, dowolna wielkość liter) — mała litera = `name-lowercase`. */
  names?: Iterable<string>;
  /** Wyrazy pomijane przy powtórzeniach (dodatkowo do `REPEAT_STOPWORDS`). */
  repeatIgnore?: Iterable<string>;
  /** Najkrótszy wyraz liczony jako powtórzenie (domyślnie 3 litery). */
  repeatMinLength?: number;
  /** Ile zdań dalej szukać powtórzenia (domyślnie 1 = to samo albo następne zdanie). */
  repeatWindow?: number;
}

export interface PisarniaAnalysis {
  text: string;
  paragraphs: PisParagraph[];
  sentences: PisSentence[];
  words: PisWord[];
  issues: PisIssue[];
  repeats: PisRepeat[];
  hits: PaletteHit[];
}

/** Podświetlenie w polu Pisarni. `tone` decyduje o kolorze, `title` o podpowiedzi. */
export interface PisMark {
  start: number;
  end: number;
  tone: 'error' | 'warn' | 'good' | 'bad' | 'info';
  title?: string;
}
