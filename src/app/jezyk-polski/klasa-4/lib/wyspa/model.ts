/** Czyste funkcje Wyspy — zawsze zwracają NOWE obiekty, wejścia nie ruszają. */

import type { WyspaRecord, WyspaRzecz, WyspaTort } from './types';

export const MAX_MAGAZYN = 60;
export const MAX_RZECZY = 40;
export const MAX_IMIE = 30;
export const MAX_NAZWA = 40;
export const MAX_KOT = 30;

export function limitRzeczy(rzeczy: WyspaRzecz[]): WyspaRzecz[] {
  return rzeczy.length > MAX_RZECZY ? rzeczy.slice(rzeczy.length - MAX_RZECZY) : rzeczy;
}

function fresh(rec: WyspaRecord): WyspaRecord {
  const out: WyspaRecord = { ...rec, magazyn: [...rec.magazyn], rzeczy: rec.rzeczy.map((r) => ({ ...r })) };
  if (rec.tort) out.tort = { ...rec.tort, pietra: [...rec.tort.pietra] };
  return out;
}

function clipRzecz(r: WyspaRzecz): WyspaRzecz {
  if (typeof r.imie === 'string' && r.imie.length > MAX_IMIE) return { ...r, imie: r.imie.slice(0, MAX_IMIE) };
  return { ...r };
}

export function dodajDoMagazynu(rec: WyspaRecord, ids: string[], now: number): WyspaRecord {
  const out = fresh(rec);
  for (const id of ids) {
    if (out.magazyn.length >= MAX_MAGAZYN) break;
    if (!out.magazyn.includes(id)) out.magazyn.push(id);
  }
  out.updatedAt = now;
  return out;
}

export function dodajRzecz(rec: WyspaRecord, rzecz: WyspaRzecz, now: number): WyspaRecord {
  const out = fresh(rec);
  const nowa = clipRzecz(rzecz);
  const i = out.rzeczy.findIndex((r) => r.id === rzecz.id);
  if (i >= 0) out.rzeczy[i] = nowa;
  else out.rzeczy.push(nowa);
  out.rzeczy = limitRzeczy(out.rzeczy);
  out.updatedAt = now;
  return out;
}

export function zmienRzecz(
  rec: WyspaRecord,
  id: string,
  patch: Partial<Omit<WyspaRzecz, 'id'>>,
  now: number,
): WyspaRecord {
  const out = fresh(rec);
  const i = out.rzeczy.findIndex((r) => r.id === id);
  if (i < 0) return out;
  out.rzeczy[i] = clipRzecz({ ...out.rzeczy[i], ...patch, id });
  out.updatedAt = now;
  return out;
}

export function usunRzecz(rec: WyspaRecord, id: string, now: number): WyspaRecord {
  const out = fresh(rec);
  out.rzeczy = out.rzeczy.filter((r) => r.id !== id);
  out.updatedAt = now;
  return out;
}

export function ustawNazwe(rec: WyspaRecord, nazwa: string | undefined, now: number): WyspaRecord {
  const out = fresh(rec);
  const t = (nazwa ?? '').trim().slice(0, MAX_NAZWA).trim();
  if (t) out.nazwa = t;
  else delete out.nazwa;
  out.updatedAt = now;
  return out;
}

export function ustawTor(rec: WyspaRecord, now: number): WyspaRecord {
  const out = fresh(rec);
  out.tor = true;
  out.updatedAt = now;
  return out;
}

export function ustawTort(rec: WyspaRecord, tort: WyspaTort, now: number): WyspaRecord {
  const out = fresh(rec);
  out.tort = { ...tort, pietra: tort.pietra.slice(0, 3) };
  out.updatedAt = now;
  return out;
}

export function ustawKota(rec: WyspaRecord, strefa: string, now: number): WyspaRecord {
  const out = fresh(rec);
  const t = strefa.trim().slice(0, MAX_KOT);
  if (t) out.kot = t;
  else delete out.kot;
  out.updatedAt = now;
  return out;
}
