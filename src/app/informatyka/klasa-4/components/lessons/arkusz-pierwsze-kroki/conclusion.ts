/**
 * Czytanie **wniosku z danych** napisanego przez dziecko własnymi słowami.
 *
 * Używane przez ćwiczenie `TapData`. Zadanie (`SheetStudio`) od 2026-10-17 nie
 * czyta wolnego tekstu — zdanie składa się tam z klocków.
 *
 * Wniosek różni się od opisu tabeli jedną rzeczą: **coś z niego wynika**. „Tabela
 * z temperaturami” opisuje, „w środę było najzimniej, 4 stopnie” wnioskuje. Stąd
 * trzy jawne kontrole, każda do sprawdzenia bez rozumienia zdania:
 *
 * 1. **dotyka danych** — pada w nim nazwa z tabeli (dzień, klasa, osoba) albo
 *    liczba, która w tabeli naprawdę jest (z tolerancją na zaokrąglenie średniej);
 * 2. **porównuje albo podsumowuje** — ma słowo w rodzaju „najwięcej”, „mniej”,
 *    „rośnie”, „średnio”, „tyle samo”;
 * 3. **jest zdaniem**, a nie etykietą — co najmniej cztery wyrazy.
 *
 * Świadomie **nie** sprawdzamy, czy wniosek z zadania jest prawdziwy: nie wiemy, o
 * co pytało dziecko swoje dane, a zgadywanie sensu cudzego zdania skończyłoby się
 * odrzucaniem dobrych prac. Prawdziwość sprawdza tylko `TapData`, bo tam znamy
 * pytanie i obie średnie.
 */

export interface ConclusionFacts {
  /** Nazwy z tabeli: podpisy wierszy, nagłówki kolumn. */
  labels: string[];
  /** Liczby, na które wniosek może się powołać: dane, sumy, średnie, różnice. */
  numbers: number[];
}

export interface ConclusionReading {
  words: number;
  label: string | null;
  number: number | null;
  compares: string | null;
}

const COMPARE =
  /(?<![\p{L}])(naj\p{L}{3,}|więcej|mniej|wyżej|niżej|szybciej|wolniej|dłużej|krócej|częściej|rzadziej|cieplej|zimniej|chłodniej|lepiej|gorzej|tyle samo|tak samo|podobnie|jednakowo|równo|rośnie|rosł\p{L}*|urosł\p{L}*|spad\p{L}*|spadł\p{L}*|malał\p{L}*|maleje|wzrasta|wzrost\p{L}*|większ\p{L}*|mniejsz\p{L}*|wyższ\p{L}*|niższ\p{L}*|szybsz\p{L}*|wolniejsz\p{L}*|lepsz\p{L}*|gorsz\p{L}*|średnio|średni\p{L}*|razem|w sumie|łącznie|różnic\p{L}*|porówn\p{L}*|przewag\p{L}*|dwa razy|trzy razy|połow\p{L}*)(?![\p{L}])/iu;

const NUMBER = /\d+(?:[.,]\d+)?/g;

export function wordCount(text: string): number {
  return text.split(/\s+/).filter((word) => /\p{L}/u.test(word)).length;
}

/** Liczby wypisane w zdaniu, z polskim przecinkiem. */
export function numbersIn(text: string): number[] {
  return (text.match(NUMBER) ?? []).map((item) => Number(item.replace(',', '.')));
}

export function sameNumber(a: number, b: number): boolean {
  return Math.abs(a - b) <= Math.max(0.51, Math.abs(b) * 0.03);
}

/**
 * Czy wyraz zdania pasuje do nazwy z tabeli. Polski odmienia nazwy („sobota” →
 * „w sobotę”, „Kasia” → „Kasi”), więc porównujemy początek: pełna nazwa przy
 * krótkich (do 3 znaków — „4a”, „pon”), a przy dłuższych wszystko bez dwóch
 * ostatnich liter.
 */
function labelMatches(label: string, words: string[]): boolean {
  const tokens = label
    .toLowerCase()
    .split(/[\s.,;:()/-]+/)
    .filter((token) => token.length >= 2 && !/^\d+$/.test(token));
  return tokens.some((token) => {
    const prefix = token.length <= 3 ? token : token.slice(0, Math.max(3, token.length - 2));
    return words.some((word) => (token.length <= 3 ? word === token || word.startsWith(token) : word.startsWith(prefix)));
  });
}

export function readConclusion(text: string, facts: ConclusionFacts): ConclusionReading {
  const words = text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  const label = facts.labels.find((item) => item.trim() && labelMatches(item, words)) ?? null;
  const number = numbersIn(text).find((value) => facts.numbers.some((fact) => sameNumber(value, fact))) ?? null;
  const compares = COMPARE.exec(text)?.[0] ?? null;
  return { words: wordCount(text), label, number, compares };
}

export function isConclusion(reading: ConclusionReading): boolean {
  return reading.words >= 4 && (reading.label !== null || reading.number !== null) && reading.compares !== null;
}

/* ------------------------------------------------------------------ */
/* Kierunek porównania — tylko tam, gdzie znamy pytanie                */
/* ------------------------------------------------------------------ */

export type Direction = 'more' | 'less' | 'same';

const MORE = /(?<![\p{L}])(więcej|szybciej|szybsz\p{L}*|lepiej|lepsz\p{L}*|częściej|większ\p{L}*|przewag\p{L}*|wygrywa\p{L}*|wygrał\p{L}*)/iu;
const LESS = /(?<![\p{L}])(mniej|wolniej|wolniejsz\p{L}*|gorzej|gorsz\p{L}*|rzadziej|mniejsz\p{L}*|przegrywa\p{L}*|przegrał\p{L}*)/iu;
const SAME = /(tyle samo|tak samo|podobnie|jednakowo|równo|bez różnicy|nie ma różnicy|żadnej różnicy|remis)/iu;

/** Pierwsze słowo kierunku w zdaniu — i które z trzech to jest. */
export function directionIn(raw: string): Direction | null {
  /* „Mniej więcej tak samo” to nie „mniej”. */
  const text = raw.replace(/mniej\s+więcej/giu, (match) => ' '.repeat(match.length));
  const hits: { at: number; direction: Direction }[] = [];
  for (const [pattern, direction] of [
    [SAME, 'same'],
    [MORE, 'more'],
    [LESS, 'less'],
  ] as const) {
    const match = pattern.exec(text);
    if (match) hits.push({ at: match.index, direction });
  }
  /* „Prawie tak samo, trochę więcej prawą” — liczy się to, co powiedziane najpierw. */
  hits.sort((a, b) => a.at - b.at);
  return hits[0]?.direction ?? null;
}
