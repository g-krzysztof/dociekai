/**
 * Półka — czyste funkcje (bez magazynu i Reacta), sprawdzane selftestem.
 * Scalanie jest przemienne i łączne: dwa urządzenia nie mają czego rozstrzygać.
 */

import type { ShelfEntry, ShelfRecord, ShelfStatus, Stamped } from './types';

const newer = <T>(a?: Stamped<T>, b?: Stamped<T>): Stamped<T> | undefined => {
  if (!a) return b;
  if (!b) return a;
  if (a.updatedAt !== b.updatedAt) return a.updatedAt > b.updatedAt ? a : b;
  // Remis czasu: rozstrzygamy deterministycznie po treści, żeby merge(a,b) == merge(b,a).
  return JSON.stringify(a.value) >= JSON.stringify(b.value) ? a : b;
};

export function mergeEntry(a: ShelfEntry, b: ShelfEntry): ShelfEntry {
  const out: ShelfEntry = {
    bookId: a.bookId,
    kind: a.kind,
    addedAt: Math.min(a.addedAt, b.addedAt),
    done: [...new Set([...a.done, ...b.done])].sort((x, y) => x - y),
  };
  const status = newer(a.status, b.status);
  const plan = newer(a.plan, b.plan);
  const bookmark = newer(a.bookmark, b.bookmark);
  const impression = newer(a.impression, b.impression);
  if (status) out.status = status;
  if (plan) out.plan = plan;
  if (bookmark) out.bookmark = bookmark;
  if (impression) out.impression = impression;
  return out;
}

export function mergeShelves(a: ShelfRecord, b: ShelfRecord): ShelfRecord {
  const entries: Record<string, ShelfEntry> = { ...a.entries };
  for (const [id, entry] of Object.entries(b.entries)) {
    entries[id] = entries[id] ? mergeEntry(entries[id], entry) : entry;
  }
  return { v: 1, entries };
}

/** Odczyt z niezaufanego JSON-a (magazyn, serwer): złe pola wypadają, nic nie rzuca. */
export function parseShelf(raw: unknown): ShelfRecord {
  const out: ShelfRecord = { v: 1, entries: {} };
  const entries = (raw as { entries?: unknown } | null)?.entries;
  if (!entries || typeof entries !== 'object') return out;
  const stamped = (x: unknown): x is Stamped<unknown> =>
    !!x && typeof x === 'object' && typeof (x as Stamped<unknown>).updatedAt === 'number' && 'value' in (x as object);
  for (const [id, e] of Object.entries(entries as Record<string, unknown>)) {
    if (!e || typeof e !== 'object') continue;
    const r = e as Record<string, unknown>;
    if (r.bookId !== id || (r.kind !== 'czytelnia' && r.kind !== 'lekcja') || typeof r.addedAt !== 'number') continue;
    const entry: ShelfEntry = {
      bookId: id,
      kind: r.kind,
      addedAt: r.addedAt,
      done: Array.isArray(r.done) ? r.done.filter((n): n is number => Number.isInteger(n) && n > 0) : [],
    };
    if (stamped(r.status) && ['czytam', 'odlozona', 'przeczytana'].includes(r.status.value as string)) {
      entry.status = r.status as Stamped<ShelfStatus>;
    }
    if (stamped(r.plan) && r.plan.value && typeof r.plan.value === 'object') entry.plan = r.plan as ShelfEntry['plan'];
    if (stamped(r.bookmark)) entry.bookmark = r.bookmark as ShelfEntry['bookmark'];
    if (stamped(r.impression)) entry.impression = r.impression as ShelfEntry['impression'];
    out.entries[id] = entry;
  }
  return out;
}

// ── Zmiany (zwracają nowy rekord) ───────────────────────────────────────────

export function addBook(rec: ShelfRecord, bookId: string, kind: ShelfEntry['kind'], now: number): ShelfRecord {
  if (rec.entries[bookId]) return rec;
  return {
    v: 1,
    entries: {
      ...rec.entries,
      [bookId]: { bookId, kind, addedAt: now, done: [], status: { value: 'czytam', updatedAt: now } },
    },
  };
}

function patch(rec: ShelfRecord, bookId: string, fn: (e: ShelfEntry) => ShelfEntry): ShelfRecord {
  const e = rec.entries[bookId];
  if (!e) return rec;
  return { v: 1, entries: { ...rec.entries, [bookId]: fn(e) } };
}

export const setStatus = (rec: ShelfRecord, bookId: string, value: ShelfStatus, now: number) =>
  patch(rec, bookId, (e) => ({ ...e, status: { value, updatedAt: now } }));

export const setPlan = (rec: ShelfRecord, bookId: string, value: Record<string, number>, now: number) =>
  patch(rec, bookId, (e) => ({ ...e, plan: { value, updatedAt: now } }));

export const setBookmark = (rec: ShelfRecord, bookId: string, n: number, unit: string, now: number) =>
  patch(rec, bookId, (e) => ({ ...e, bookmark: { value: { n, unit }, updatedAt: now } }));

export const setImpression = (rec: ShelfRecord, bookId: string, gauge: number, feeling: string | undefined, now: number) =>
  patch(rec, bookId, (e) => ({
    ...e,
    impression: { value: { gauge: Math.max(0, Math.min(100, Math.round(gauge))), ...(feeling ? { feeling } : {}) }, updatedAt: now },
  }));

/** Odcinek przeczytany; po ostatnim książka sama staje się „przeczytana”. */
export function markEpisodeDone(rec: ShelfRecord, bookId: string, n: number, totalEpisodes: number, now: number): ShelfRecord {
  return patch(rec, bookId, (e) => {
    const done = [...new Set([...e.done, n])].sort((x, y) => x - y);
    const finished = totalEpisodes > 0 && done.length >= totalEpisodes;
    return { ...e, done, ...(finished && e.status?.value !== 'przeczytana' ? { status: { value: 'przeczytana' as const, updatedAt: now } } : {}) };
  });
}

/** Data końca planu: ostatni dzień, na który przypada odcinek, gdy suma odcinków ≥ `remaining`; `null`, gdy plan za krótki. */
export function planEndDate(plan: Record<string, number>, remaining: number): string | null {
  let sum = 0;
  for (const day of Object.keys(plan).sort()) {
    if (plan[day] <= 0) continue;
    sum += plan[day];
    if (sum >= remaining) return day;
  }
  return null;
}
