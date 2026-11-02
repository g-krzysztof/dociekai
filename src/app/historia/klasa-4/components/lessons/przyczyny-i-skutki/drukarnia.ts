/**
 * Blok 2 L4 — „Skryptorium kontra drukarnia”: dane, rachunki i sędzia
 * schematu, bez Reacta.
 *
 * Dziecko robi trzy rzeczy na czas: przepisuje piórem jedną linijkę,
 * składa tę samą linijkę z czcionek i odbija ją dziesięć razy na prasie.
 * Z jego trzech pomiarów liczymy dzień pracy kopisty i drukarza, a z nich —
 * cenę książki. Liczby w schemacie przyczyn i skutków są jego liczbami.
 *
 * Fakty (sprawdzone 2026-10-03):
 *  - Gutenberg, druk ruchomymi czcionkami, Moguncja, połowa XV w.; Biblia
 *    Gutenberga 1452–1455, ok. 200 egzemplarzy, przetrwało 49, jeden
 *    w Muzeum Diecezjalnym w Pelplinie — pl.wikipedia.org/wiki/Biblia_Gutenberga;
 *  - przyczyny i skutki druku — baza F-I.2-17…20;
 *  - „jedna prasa w XVI w. — do 3600 stron dziennie; ręcznie — kilka” —
 *    en.wikipedia.org/wiki/Printing_press (sekcja „Mass production…”, za
 *    E. Eisenstein / H. Rees i in.).
 */

import { plural } from '@/lib/plural';

/** Linijka, którą dziecko przepisuje i składa — zwykły tekst polski, nie gotyk. */
export const LINE = 'Książka to skarb całego miasta';

/** Ile liter starcza atramentu w piórze. */
export const INK_CAPACITY = 7;

/** Najkrótszy odstęp między literami: szybciej gęsie pióro drapie i nie pisze. */
export const MIN_MS_PER_LETTER = 230;

/** Ile odbitek robi dziecko na prasie. */
export const PRINT_COPIES = 10;

/**
 * Założenia rachunku — jawne w treści bloku. Książką jest Biblia Gutenberga:
 * 1282 strony (641 kart — tyle ma egzemplarz pelpliński), dwie kolumny po
 * 42 linijki, nakład ok. 200 egzemplarzy (pl.wikipedia.org/wiki/Biblia_Gutenberga).
 * Linijka kolumny ma ok. 30–35 znaków — tyle co linijka dziecka.
 */
export const BOOK = {
  linesPerPage: 84,
  pages: 1282,
  copies: 200,
  /** Dzień pracy przy świetle dziennym. */
  workHours: 10,
} as const;

/**
 * Kaszta — skrzynka z przegródkami. Kolejność stała, ale nie alfabetyczna,
 * jak w prawdziwej kaszcie (często używane litery bliżej ręki), więc
 * czcionki trzeba szukać — dlatego pierwsze składanie trwa dłużej niż pisanie.
 */
export const CASE_LETTERS = ['a', 'o', 'k', 'ą', 'e', 's', 'm', 't', 'ż', 'i', 'b', 'ł', 'K', 'c', 'r', 'g', 'z', 'n', 'w', 'y'];

export function isSpace(ch: string): boolean {
  return ch === ' ';
}

/** Indeks następnej litery do napisania/złożenia (spacje przeskakuje). */
export function nextLetterIndex(line: string, done: number): number {
  let i = done;
  while (i < line.length && isSpace(line[i])) i++;
  return i;
}

export type QuillResult = 'ok' | 'sucho' | 'za-szybko' | 'nie-ta';

/** Czy pióro napisze literę o indeksie `index`? */
export function quillStroke(args: {
  index: number;
  next: number;
  ink: number;
  sinceLastMs: number;
}): QuillResult {
  if (args.index !== args.next) return 'nie-ta';
  if (args.ink <= 0) return 'sucho';
  if (args.sinceLastMs < MIN_MS_PER_LETTER) return 'za-szybko';
  return 'ok';
}

export interface Tempo {
  /** Sekundy na przepisanie jednej linijki piórem. */
  handLineSec: number;
  /** Sekundy na złożenie jednej linijki z czcionek. */
  setLineSec: number;
  /** Sekundy na jedną odbitkę (farba + prasa). */
  pullSec: number;
}

export interface BookMath {
  /** Dni pracy kopisty na jeden egzemplarz książki. */
  handDaysPerBook: number;
  /** Ile egzemplarzy kopista zrobi w rok (300 dni pracy). */
  handBooksPerYear: number;
  /** Dni pracy drukarni na cały nakład (skład + odbijanie). */
  printDaysAll: number;
  /** Dni pracy drukarni na jeden egzemplarz (nakład / liczba egzemplarzy). */
  printDaysPerBook: number;
  /** Ile razy książka z drukarni jest „tańsza” (mniej pracy na egzemplarz). */
  ratio: number;
  /** Strony dziennie: ręcznie i na prasie (z gotowego składu). */
  handPagesPerDay: number;
  printPagesPerDay: number;
}

export function bookMath(t: Tempo): BookMath {
  const day = BOOK.workHours * 3600;
  const lines = BOOK.linesPerPage * BOOK.pages;
  const handDaysPerBook = (lines * t.handLineSec) / day;
  const printDaysAll = (lines * t.setLineSec + BOOK.pages * BOOK.copies * t.pullSec) / day;
  const printDaysPerBook = printDaysAll / BOOK.copies;
  return {
    handDaysPerBook,
    handBooksPerYear: 300 / handDaysPerBook,
    printDaysAll,
    printDaysPerBook,
    ratio: handDaysPerBook / printDaysPerBook,
    handPagesPerDay: day / (BOOK.linesPerPage * t.handLineSec),
    printPagesPerDay: day / t.pullSec,
  };
}

/** „3 dni”, „5 godzin”, „40 minut” — do zdań; liczby zaokrąglone po ludzku. */
export function formatWork(days: number): string {
  const DAY = { one: 'dzień', few: 'dni', many: 'dni' };
  const HOUR = { one: 'godzina', few: 'godziny', many: 'godzin' };
  const MIN = { one: 'minuta', few: 'minuty', many: 'minut' };
  if (days >= 1.5) {
    const n = Math.round(days);
    return `${n} ${plural(n, DAY)}`;
  }
  const hours = days * BOOK.workHours;
  if (hours >= 1.5) {
    const n = Math.round(hours);
    return `${n} ${plural(n, HOUR)}`;
  }
  const n = Math.max(1, Math.round(hours * 60));
  return `${n} ${plural(n, MIN)}`;
}

/* ───────────── schemat przyczyn i skutków ───────────── */

export type Column = 'przyczyny' | 'skutki';

export interface SchemaCard {
  id: string;
  /** Kiedy to prawda: przed drukiem (przyczyna) czy po nim (skutek). */
  column: Column;
  /** Tekst z liczbami dziecka — budowany w `schemaCards`. */
  text: string;
  /** Dlaczego nie w drugiej kolumnie — odrzut nazywa konkret. */
  whyNot: string;
}

export function schemaCards(m: BookMath): SchemaCard[] {
  const fmt = formatWork;
  const perYear = Math.max(1, Math.round(m.handBooksPerYear));
  return [
    {
      id: 'reczne',
      column: 'przyczyny',
      text: `Kopista przepisuje jedną książkę przez ${fmt(m.handDaysPerBook)}.`,
      whyNot: 'Tak było, zanim pojawił się druk — to powód, dla którego ktoś szukał szybszego sposobu. Odpowiada na „dlaczego?”.',
    },
    {
      id: 'skutek-szkoly',
      column: 'skutki',
      text: 'Książki trafiają do szkół — czytać uczy się coraz więcej ludzi.',
      whyNot: 'Na to stać ludzi dopiero wtedy, gdy książki stanieją — czyli po wynalezieniu druku. Odpowiada na „co z tego wynikło?”.',
    },
    {
      id: 'rzadkie',
      column: 'przyczyny',
      text: `Jeden kopista robi w rok najwyżej ${perYear} ${plural(perYear, { one: 'książkę', few: 'książki', many: 'książek' })} — książki są rzadkie i drogie.`,
      whyNot: 'To opis świata przed drukiem: tak mało książek powstaje ręcznie. To przyczyna, nie skutek.',
    },
    {
      id: 'tansze',
      column: 'skutki',
      text: `Egzemplarz z drukarni to ${fmt(m.printDaysPerBook)} pracy — ok. ${Math.round(m.ratio)} razy mniej niż ręcznie.`,
      whyNot: 'Ta liczba wzięła się z twojej prasy — bez druku by jej nie było. To skutek.',
    },
    {
      id: 'wiedza',
      column: 'skutki',
      text: 'Powstaje dużo więcej książek: opowieści i wiedza szybciej docierają do ludzi.',
      whyNot: 'To stało się dzięki drukowi, a nie przed nim — odpowiada na „co z tego wynikło?”.',
    },
  ];
}

export type SchemaVerdict = { ok: true } | { ok: false; why: string };

export function judgeSchemaCard(card: SchemaCard, column: Column): SchemaVerdict {
  return card.column === column ? { ok: true } : { ok: false, why: card.whyNot };
}
