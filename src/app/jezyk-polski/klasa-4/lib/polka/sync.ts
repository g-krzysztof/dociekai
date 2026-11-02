/**
 * Synchronizacja Półki czytelnika z kontem. Kalka jeden do jednego
 * `src/lib/streak/sync.ts`: zawsze najlepszy wysiłek, błąd sieci nigdy
 * niczego nie blokuje, a scalanie jest przemienne, więc dwa urządzenia
 * nie mają czego rozstrzygać.
 *
 * Półka ma tylko wartości zamknięte (D3) — które teksty, plan, przeczytane
 * odcinki, zakładka, wskazówka „wciągacza” i uczucie z palety — więc może
 * iść na konto. Teczka nigdy: wolny tekst dziecka nie wychodzi z urządzenia
 * i znika przy wylogowaniu.
 *
 * Dopóki endpointy nie istnieją w Strapi, `/api/pol-shelf` zwraca
 * `{ data: null }` i cała funkcja działa lokalnie bez jednej zmiany w kodzie.
 */

import { mergeShelves, parseShelf } from './model';
import { readShelf, writeShelf } from './storage';
import type { ShelfRecord } from './types';
import { getAuthToken } from '@/lib/auth-token';

/**
 * Token czytamy w chwili wywołania, bo przy wylogowaniu znika z localStorage
 * zanim ostatnia wysyłka zdąży dolecieć — `flushShelfSync()` przechwytuje go
 * synchronicznie i podaje tutaj wprost.
 */
function authHeaders(token?: string | null): HeadersInit {
  const jwt = token !== undefined ? token : getAuthToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
}

async function pushShelf(shelf: ShelfRecord, token?: string | null): Promise<void> {
  try {
    await fetch('/api/pol-shelf/sync', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ shelf }),
    });
  } catch {
    /* lokalny zapis już się udał — spróbujemy przy następnej zmianie */
  }
}

async function fetchServerShelf(): Promise<ShelfRecord | null> {
  try {
    const res = await fetch('/api/pol-shelf', { headers: authHeaders() });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    const data = (json as { data?: unknown })?.data;
    return data && typeof data === 'object' ? parseShelf(data) : null;
  } catch {
    return null;
  }
}

let pendingPush: ReturnType<typeof setTimeout> | null = null;

/** Debounced wysyłka całej półki. Rekord jest drobny (wpisy z zamkniętych słowników), więc nie dzielimy go na części. */
export function scheduleShelfSync(rec: ShelfRecord): void {
  if (pendingPush) clearTimeout(pendingPush);
  pendingPush = setTimeout(() => {
    pendingPush = null;
    void pushShelf(rec);
  }, 1500);
}

/**
 * Wylogowanie: półka jedzie na konto, zanim zniknie z przeglądarki. Bez tego
 * przepadałaby zmiana z ostatnich 1,5 s (debounce).
 */
export function flushShelfSync(): void {
  const token = getAuthToken();
  const rec = readShelf(window.localStorage);

  if (pendingPush) clearTimeout(pendingPush);
  pendingPush = null;

  const hasData = Object.keys(rec.entries).length > 0;
  if (token && hasData) void pushShelf(rec, token);
}

let pulledThisLoad = false;

/** Doczytanie półki z serwera (np. dokładanej na innym urządzeniu) — raz na życie karty. */
export async function pullServerShelfOnce(): Promise<void> {
  if (pulledThisLoad) return;
  pulledThisLoad = true;

  const remote = await fetchServerShelf();
  if (!remote) return;

  writeShelf(window.localStorage, mergeShelves(readShelf(window.localStorage), remote));
}

export function resetShelfSync(): void {
  if (pendingPush) clearTimeout(pendingPush);
  pendingPush = null;
  pulledThisLoad = false;
}
