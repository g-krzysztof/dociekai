/**
 * Półka i Teczka do pokazania (E5c) — czyste funkcje dla widoków, bez Reacta
 * i bez danych Czytelni (książkę podaje wołający), sprawdzane selftestem.
 *
 * Plan czytania to rozkład odcinków na dni. Widok nie ocenia, czy dziecko
 * „nadąża”, tylko pokazuje skutek: ile odcinków przypada na dziś i kiedy przy
 * tym rozkładzie skończy się książka. Liczą się dni **od dziś** — przeszłe dni
 * planu już minęły, a przeczytane odcinki są w `done`.
 */

import type { TeczkaItem } from '../teczka/types';
import type { ShelfEntry, ShelfStatus } from './types';

/** Uczucia pierwszego wrażenia (zamknięta paleta — `impression.feeling` to id). */
export const IMPRESSION_FEELINGS = [
  { id: 'ciekawosc', label: 'ciekawość' },
  { id: 'radosc', label: 'radość' },
  { id: 'smiech', label: 'śmiech' },
  { id: 'wzruszenie', label: 'wzruszenie' },
  { id: 'smutek', label: 'smutek' },
  { id: 'strach', label: 'dreszczyk strachu' },
  { id: 'zaskoczenie', label: 'zaskoczenie' },
  { id: 'spokoj', label: 'spokój' },
  { id: 'nuda', label: 'nuda' },
] as const;

export const feelingLabel = (id?: string): string | undefined => IMPRESSION_FEELINGS.find((f) => f.id === id)?.label;

/** Co widok wie o książce spoza Półki (z Czytelni albo z lekcji). */
export interface ShelfBookInfo {
  title: string;
  author?: string;
  genre?: string;
  /** Liczba odcinków (krótki tekst z lekcji = 1). */
  total: number;
}

export type PlanState =
  /** Brak planu. */
  | { kind: 'brak' }
  /** Plan od dziś wystarcza: koniec w `end`, dziś przypada `today` odcinków. */
  | { kind: 'koniec'; end: string; today: number }
  /** Od dziś w planie jest mniej odcinków, niż zostało — `missing` bez dnia. */
  | { kind: 'za-krotki'; missing: number; today: number }
  /** Wszystko przeczytane — plan już niepotrzebny. */
  | { kind: 'gotowe' };

export interface ShelfSummary {
  bookId: string;
  kind: ShelfEntry['kind'];
  info: ShelfBookInfo;
  status: ShelfStatus;
  /** Przeczytane odcinki, które istnieją w książce (stare numery spoza zakresu wypadają). */
  done: number[];
  /** Pierwszy nieprzeczytany odcinek albo `null`, gdy całość przeczytana. */
  next: number | null;
  /** Zakładka, jeśli wskazuje istniejący odcinek. */
  bookmark: { n: number; unit: string } | null;
  plan: PlanState;
  impression: { gauge: number; feeling?: string } | null;
  addedAt: number;
}

/** Stan planu od dnia `today` (`YYYY-MM-DD`, lokalnie) przy `remaining` odcinkach do przeczytania. */
export function planState(plan: Record<string, number> | undefined, remaining: number, today: string): PlanState {
  if (remaining <= 0) return { kind: 'gotowe' };
  if (!plan) return { kind: 'brak' };
  const days = Object.keys(plan)
    .filter((d) => d >= today && plan[d] > 0)
    .sort();
  const todayCount = plan[today] > 0 ? plan[today] : 0;
  let sum = 0;
  for (const d of days) {
    sum += plan[d];
    if (sum >= remaining) return { kind: 'koniec', end: d, today: todayCount };
  }
  return { kind: 'za-krotki', missing: remaining - sum, today: todayCount };
}

export function summarizeEntry(entry: ShelfEntry, info: ShelfBookInfo, today: string): ShelfSummary {
  const total = Math.max(1, info.total);
  const done = entry.done.filter((n) => n >= 1 && n <= total);
  let next: number | null = null;
  for (let n = 1; n <= total; n++) {
    if (!done.includes(n)) {
      next = n;
      break;
    }
  }
  // Status wynika z odcinków: całość przeczytana = „przeczytana” (nawet gdy była odłożona), a „przeczytana”
  // z niepełnym `done` (np. nowe odcinki dodane do Czytelni) wraca do „czytam”.
  const stored = entry.status?.value ?? 'czytam';
  const status: ShelfStatus = next === null ? 'przeczytana' : stored === 'przeczytana' ? 'czytam' : stored;
  const bm = entry.bookmark?.value;
  return {
    bookId: entry.bookId,
    kind: entry.kind,
    info: { ...info, total },
    status,
    done,
    next,
    bookmark: bm && bm.n >= 1 && bm.n <= total ? bm : null,
    plan: planState(entry.plan?.value, total - done.length, today),
    impression: entry.impression?.value ?? null,
    addedAt: entry.addedAt,
  };
}

const STATUS_ORDER: Record<ShelfStatus, number> = { czytam: 0, odlozona: 1, przeczytana: 2 };

/** Kolejność na półce: najpierw czytane, potem odłożone, na końcu przeczytane; w grupie — od najwcześniej postawionej. */
export function sortSummaries(list: ShelfSummary[]): ShelfSummary[] {
  return [...list].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.addedAt - b.addedAt || a.bookId.localeCompare(b.bookId),
  );
}

/** Kartki wybrane do książeczki, w kolejności powstania (kolejność roku). */
export function bookletItems(items: TeczkaItem[]): TeczkaItem[] {
  return items
    .filter((it) => it.inBooklet)
    .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
}

/** Akapity kartki: niepuste linie, bez białych znaków z brzegów. */
export function paragraphsOf(text: string): string[] {
  return text
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);
}
