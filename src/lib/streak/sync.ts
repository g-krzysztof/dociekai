/**
 * Synchronizacja serii z kontem. Wzorzec jeden do jednego z
 * `matematyka/klasa-4/lib/progress-sync.ts`: zawsze najlepszy wysiłek, błąd
 * sieci nigdy niczego nie blokuje, a scalanie jest sumą zbiorów, więc dwa
 * urządzenia nie mają czego rozstrzygać.
 *
 * Dopóki endpointy nie istnieją w Strapi, `/api/streak` zwraca `{ data: null }`
 * i cała funkcja działa lokalnie bez jednej zmiany w kodzie — patrz
 * `docs/streak-backend.md`.
 */

import { mergeRecords, readStreakRecord, writeStreakRecord } from './storage';
import type { StreakRecord } from './types';
import { getAuthToken } from '@/lib/auth-token';

/** Zdarzenie DOM po każdej zmianie serii — `useStreak` je nasłuchuje. */
export const STREAK_CHANGED_EVENT = 'dociekai:streak-changed';

export function notifyStreakChanged(): void {
  window.dispatchEvent(new Event(STREAK_CHANGED_EVENT));
}

/**
 * Token czytamy w chwili wywołania, bo przy wylogowaniu znika z localStorage
 * zanim ostatnia wysyłka zdąży dolecieć — `flushStreakSync()` przechwytuje go
 * synchronicznie i podaje tutaj wprost.
 */
function authHeaders(token?: string | null): HeadersInit {
  const jwt = token !== undefined ? token : getAuthToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
}

async function pushStreak(record: StreakRecord, token?: string | null): Promise<void> {
  try {
    await fetch('/api/streak/sync', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ record }),
    });
  } catch {
    /* lokalny zapis już się udał — spróbujemy przy następnej zmianie */
  }
}

async function fetchServerStreak(): Promise<StreakRecord | null> {
  try {
    const res = await fetch('/api/streak', { headers: authHeaders() });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    const data = (json as { data?: unknown })?.data;
    return data && typeof data === 'object' ? (data as StreakRecord) : null;
  } catch {
    return null;
  }
}

let pendingPush: ReturnType<typeof setTimeout> | null = null;

/** Debounced wysyłka całej serii. Rekord jest drobny (kilkaset dat), więc nie dzielimy go na części. */
export function scheduleStreakSync(record: StreakRecord): void {
  if (pendingPush) clearTimeout(pendingPush);
  pendingPush = setTimeout(() => {
    pendingPush = null;
    void pushStreak(record);
  }, 1500);
}

/**
 * Wylogowanie: seria jedzie na konto, zanim zniknie z przeglądarki. Bez tego
 * przepadałby dzień zaliczony w ostatnich 1,5 s (debounce) — a dla serii to
 * cała różnica między utrzymanym a zerwanym rytmem.
 */
export function flushStreakSync(): void {
  const token = getAuthToken();
  const record = readStreakRecord();

  if (pendingPush) clearTimeout(pendingPush);
  pendingPush = null;

  const hasData = Object.keys(record.days).length > 0 || record.legacy.length > 0;
  if (token && hasData) void pushStreak(record, token);
}

let pulledThisLoad = false;

/** Doczytanie serii z serwera (np. dorobionej na innym urządzeniu) — raz na życie karty. */
export async function pullServerStreakOnce(): Promise<void> {
  if (pulledThisLoad) return;
  pulledThisLoad = true;

  const remote = await fetchServerStreak();
  if (!remote) return;

  const merged = mergeRecords(readStreakRecord(), {
    days: remote.days ?? {},
    legacy: remote.legacy ?? [],
    breaks: remote.breaks ?? [],
  });
  writeStreakRecord(merged);
  notifyStreakChanged();
}

export function resetStreakSync(): void {
  if (pendingPush) clearTimeout(pendingPush);
  pendingPush = null;
  pulledThisLoad = false;
}
