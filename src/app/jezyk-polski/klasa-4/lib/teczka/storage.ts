/**
 * Teczka autora w magazynie przeglądarki. **Nie ma trasy API ani wpisu
 * w synchronizacji** — tekst dziecka nie wychodzi z urządzenia (D3).
 * Gość `sessionStorage`, konto `localStorage`.
 */

import type { TeczkaItem, TeczkaRecord } from './types';

export const TECZKA_KEY = 'dociekai:pol-teczka';
/** Zdarzenie DOM po każdej zmianie Teczki — `useTeczka` je nasłuchuje. */
export const TECZKA_CHANGED_EVENT = 'dociekai:pol-teczka-changed';

const MAX_TEXT = 5000;

export function parseTeczka(raw: unknown): TeczkaRecord {
  const out: TeczkaRecord = { v: 1, items: {} };
  const items = (raw as { items?: unknown } | null)?.items;
  if (!items || typeof items !== 'object') return out;
  for (const [id, it] of Object.entries(items as Record<string, unknown>)) {
    const r = it as Partial<TeczkaItem> | null;
    if (!r || r.id !== id || typeof r.text !== 'string' || typeof r.lesson !== 'string' || typeof r.kind !== 'string') continue;
    out.items[id] = {
      id,
      lesson: r.lesson,
      kind: r.kind,
      title: typeof r.title === 'string' ? r.title : '',
      text: r.text.slice(0, MAX_TEXT),
      ...(r.parts && typeof r.parts === 'object' ? { parts: r.parts } : {}),
      ...(typeof r.ref === 'string' ? { ref: r.ref } : {}),
      ...(r.inBooklet ? { inBooklet: true } : {}),
      createdAt: typeof r.createdAt === 'number' ? r.createdAt : 0,
      updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : 0,
    };
  }
  return out;
}

export function readTeczka(store: Storage): TeczkaRecord {
  try {
    const raw = store.getItem(TECZKA_KEY);
    // Zawsze świeży obiekt: zapis modyfikuje wynik, a wspólny `EMPTY_TECZKA` nie może się zmienić.
    return raw ? parseTeczka(JSON.parse(raw)) : { v: 1, items: {} };
  } catch {
    return { v: 1, items: {} };
  }
}

function write(store: Storage, rec: TeczkaRecord): void {
  try {
    if (Object.keys(rec.items).length === 0) store.removeItem(TECZKA_KEY);
    else store.setItem(TECZKA_KEY, JSON.stringify(rec));
  } catch {
    // Pełny albo zablokowany magazyn: kartka zostaje tylko na ekranie.
  }
  window.dispatchEvent(new Event(TECZKA_CHANGED_EVENT));
}

/** Zapis kartki: to samo `id` nadpisuje treść, ale zachowuje datę powstania i wybór do książeczki. */
export function saveTeczkaItem(
  store: Storage,
  item: Omit<TeczkaItem, 'createdAt' | 'updatedAt' | 'inBooklet'>,
  now: number,
): void {
  const rec = readTeczka(store);
  const prev = rec.items[item.id];
  rec.items[item.id] = {
    ...item,
    text: item.text.slice(0, MAX_TEXT),
    ...(prev?.inBooklet ? { inBooklet: true } : {}),
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
  };
  write(store, rec);
}

export function setInBooklet(store: Storage, id: string, inBooklet: boolean): void {
  const rec = readTeczka(store);
  const it = rec.items[id];
  if (!it) return;
  const next: TeczkaItem = { ...it };
  if (inBooklet) next.inBooklet = true;
  else delete next.inBooklet;
  rec.items[id] = next;
  write(store, rec);
}

export function removeTeczkaItem(store: Storage, id: string): void {
  const rec = readTeczka(store);
  if (!rec.items[id]) return;
  delete rec.items[id];
  write(store, rec);
}

/** Logowanie: kartki gościa przechodzą na konto; przy tym samym `id` wygrywa nowsza. */
export function adoptSessionTeczka(): void {
  try {
    const session = readTeczka(window.sessionStorage);
    if (!Object.keys(session.items).length) return;
    const local = readTeczka(window.localStorage);
    for (const [id, it] of Object.entries(session.items)) {
      if (!local.items[id] || local.items[id].updatedAt < it.updatedAt) local.items[id] = it;
    }
    write(window.localStorage, local);
    window.sessionStorage.removeItem(TECZKA_KEY);
  } catch {
    // brak dostępu do magazynu — nic do przeniesienia
  }
}

/** Wylogowanie: teczka znika z obu magazynów (wspólne urządzenie). */
export function clearTeczka(): void {
  try {
    window.localStorage.removeItem(TECZKA_KEY);
    window.sessionStorage.removeItem(TECZKA_KEY);
  } catch {
    // jw.
  }
  window.dispatchEvent(new Event(TECZKA_CHANGED_EVENT));
}
