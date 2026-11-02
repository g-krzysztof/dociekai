/**
 * Wyspa w magazynie przeglądarki. **Nie ma trasy API ani wpisu w synchronizacji**
 * — imiona i nazwa wyspy nie wychodzą z urządzenia (jak Teczka, D3).
 * Gość `sessionStorage`, konto `localStorage`.
 */

import { limitRzeczy, MAX_IMIE, MAX_KOT, MAX_MAGAZYN, MAX_NAZWA } from './model';
import type { WyspaRecord, WyspaRzecz, WyspaTort } from './types';

export const WYSPA_KEY = 'dociekai:pol-wyspa';
/** Zdarzenie DOM po każdej zmianie Wyspy — `useWyspa` je nasłuchuje. */
export const WYSPA_CHANGED_EVENT = 'dociekai:pol-wyspa-changed';

const MAX_ID = 60;

function empty(): WyspaRecord {
  return { v: 1, magazyn: [], rzeczy: [], updatedAt: 0 };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function parseRzecz(raw: unknown): WyspaRzecz | null {
  const r = raw as Partial<Record<keyof WyspaRzecz, unknown>> | null;
  if (!r || typeof r !== 'object') return null;
  if (typeof r.id !== 'string' || !r.id.trim() || typeof r.slowo !== 'string' || !r.slowo.trim()) return null;
  if (typeof r.x !== 'number' || typeof r.y !== 'number' || !Number.isFinite(r.x) || !Number.isFinite(r.y)) return null;
  const out: WyspaRzecz = {
    id: r.id.trim().slice(0, MAX_ID),
    slowo: r.slowo.trim().slice(0, MAX_ID),
    x: Math.round(clamp(r.x, 0, 100) * 10) / 10,
    y: Math.round(clamp(r.y, 0, 100) * 10) / 10,
  };
  if (typeof r.ile === 'number' && Number.isFinite(r.ile)) out.ile = clamp(Math.round(r.ile), 1, 9);
  if (r.tabliczka === 'ten' || r.tabliczka === 'ta' || r.tabliczka === 'to') out.tabliczka = r.tabliczka;
  if (typeof r.imie === 'string') {
    const imie = r.imie.trim().slice(0, MAX_IMIE).trim();
    if (imie) out.imie = imie;
  }
  return out;
}

const KSZTALTY = ['okragly', 'kwadratowy'];
const SMAKI = ['czekoladowy', 'waniliowy', 'malinowy', 'cytrynowy'];
const KOLORY = ['bialy', 'rozowy', 'zielony'];

function parseTort(raw: unknown): WyspaTort | null {
  const t = raw as Partial<Record<keyof WyspaTort, unknown>> | null;
  if (!t || typeof t !== 'object') return null;
  if (typeof t.ksztalt !== 'string' || !KSZTALTY.includes(t.ksztalt)) return null;
  if (typeof t.kolor !== 'string' || !KOLORY.includes(t.kolor)) return null;
  if (!Array.isArray(t.pietra) || t.pietra.length < 1 || t.pietra.length > 3) return null;
  if (!t.pietra.every((p) => typeof p === 'string' && SMAKI.includes(p))) return null;
  return { ksztalt: t.ksztalt as WyspaTort['ksztalt'], pietra: [...t.pietra] as WyspaTort['pietra'], kolor: t.kolor as WyspaTort['kolor'] };
}

export function parseWyspa(raw: unknown): WyspaRecord {
  const out = empty();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const r = raw as { magazyn?: unknown; rzeczy?: unknown; nazwa?: unknown; tor?: unknown; tort?: unknown; kot?: unknown; updatedAt?: unknown };
  if (Array.isArray(r.magazyn)) {
    for (const id of r.magazyn) {
      if (typeof id !== 'string' || !id.trim()) continue;
      const t = id.trim().slice(0, MAX_ID);
      if (!out.magazyn.includes(t) && out.magazyn.length < MAX_MAGAZYN) out.magazyn.push(t);
    }
  }
  if (Array.isArray(r.rzeczy)) {
    const rzeczy: WyspaRzecz[] = [];
    for (const it of r.rzeczy) {
      const p = parseRzecz(it);
      if (!p) continue;
      const i = rzeczy.findIndex((x) => x.id === p.id);
      if (i >= 0) rzeczy[i] = p;
      else rzeczy.push(p);
    }
    out.rzeczy = limitRzeczy(rzeczy);
  }
  if (typeof r.nazwa === 'string') {
    const n = r.nazwa.trim().slice(0, MAX_NAZWA).trim();
    if (n) out.nazwa = n;
  }
  if (r.tor === true) out.tor = true;
  const tort = parseTort(r.tort);
  if (tort) out.tort = tort;
  if (typeof r.kot === 'string') {
    const k = r.kot.trim().slice(0, MAX_KOT);
    if (k && /^[a-z0-9-]+$/.test(k)) out.kot = k;
  }
  if (typeof r.updatedAt === 'number' && Number.isFinite(r.updatedAt) && r.updatedAt > 0) out.updatedAt = r.updatedAt;
  return out;
}

export function readWyspa(store: Storage): WyspaRecord {
  try {
    const raw = store.getItem(WYSPA_KEY);
    // Zawsze świeży obiekt: wspólny `EMPTY_WYSPA` nie może się zmienić.
    return raw ? parseWyspa(JSON.parse(raw)) : empty();
  } catch {
    return empty();
  }
}

export function writeWyspa(store: Storage, rec: WyspaRecord): void {
  try {
    if (isEmpty(rec)) store.removeItem(WYSPA_KEY);
    else store.setItem(WYSPA_KEY, JSON.stringify(rec));
  } catch {
    // Pełny albo zablokowany magazyn: wyspa zostaje tylko na ekranie.
  }
  window.dispatchEvent(new Event(WYSPA_CHANGED_EVENT));
}

function isEmpty(rec: WyspaRecord): boolean {
  return rec.magazyn.length === 0 && rec.rzeczy.length === 0 && !rec.nazwa && !rec.tor && !rec.tort && !rec.kot;
}

/** Scalenie dwóch wysp: bazą jest rekord z większym `updatedAt` (przy remisie `a`). */
export function mergeWyspa(a: WyspaRecord, b: WyspaRecord): WyspaRecord {
  const [base, other] = b.updatedAt > a.updatedAt ? [b, a] : [a, b];
  const magazyn = [...base.magazyn];
  for (const id of other.magazyn) if (!magazyn.includes(id)) magazyn.push(id);
  const rzeczy = base.rzeczy.map((r) => ({ ...r }));
  for (const r of other.rzeczy) if (!rzeczy.some((x) => x.id === r.id)) rzeczy.push({ ...r });
  const out: WyspaRecord = {
    v: 1,
    magazyn: magazyn.slice(0, MAX_MAGAZYN),
    rzeczy: limitRzeczy(rzeczy),
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
  };
  if (base.nazwa) out.nazwa = base.nazwa;
  if (a.tor || b.tor) out.tor = true;
  const tort = base.tort ?? other.tort;
  if (tort) out.tort = { ...tort, pietra: [...tort.pietra] };
  const kot = base.kot ?? other.kot;
  if (kot) out.kot = kot;
  return out;
}

/** Logowanie: wyspa gościa przechodzi na konto; przy istniejącej — scalenie (nowsza jest bazą). */
export function adoptSessionWyspa(): void {
  try {
    const session = readWyspa(window.sessionStorage);
    if (isEmpty(session)) return;
    const local = readWyspa(window.localStorage);
    writeWyspa(window.localStorage, isEmpty(local) ? session : mergeWyspa(session, local));
    window.sessionStorage.removeItem(WYSPA_KEY);
  } catch {
    // brak dostępu do magazynu — nic do przeniesienia
  }
}

/** Wylogowanie: wyspa znika z obu magazynów (wspólne urządzenie). */
export function clearWyspa(): void {
  try {
    window.localStorage.removeItem(WYSPA_KEY);
    window.sessionStorage.removeItem(WYSPA_KEY);
  } catch {
    // jw.
  }
  window.dispatchEvent(new Event(WYSPA_CHANGED_EVENT));
}
