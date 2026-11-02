'use client';

import { useSyncExternalStore } from 'react';
import type { Przedmiot, WariantPdf } from '../data/types';

/**
 * Teczka gościa: materiały, które chciał pobrać przed założeniem konta.
 * To wygoda jednej przeglądarki (localStorage), nie dane do odtworzenia —
 * każdy zapis i odczyt w try/catch, pusta teczka zawsze jest poprawna.
 */
export interface WpisTeczki {
  przedmiot: Przedmiot;
  slug: string;
  wariant: WariantPdf;
  tytul: string;
}

const KLUCZ = 'dociekai:teczka';
const ZDARZENIE = 'dociekai:teczka';
export const ZDARZENIE_OTWORZ = 'dociekai:teczka-otworz';

const PUSTA: WpisTeczki[] = [];
let cache: { raw: string | null; wpisy: WpisTeczki[] } = { raw: null, wpisy: PUSTA };

function czytaj(): WpisTeczki[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KLUCZ);
  } catch {
    return PUSTA;
  }
  if (raw === cache.raw) return cache.wpisy;
  let wpisy = PUSTA;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) wpisy = parsed.filter((w) => w && typeof w.slug === 'string');
  } catch {
    wpisy = PUSTA;
  }
  cache = { raw, wpisy };
  return wpisy;
}

function zapisz(wpisy: WpisTeczki[]) {
  try {
    if (wpisy.length) localStorage.setItem(KLUCZ, JSON.stringify(wpisy));
    else localStorage.removeItem(KLUCZ);
  } catch {
    // brak dostępu do storage — teczka po prostu nie przetrwa przeładowania
  }
  window.dispatchEvent(new Event(ZDARZENIE));
}

const tenSam = (a: WpisTeczki, b: Pick<WpisTeczki, 'przedmiot' | 'slug' | 'wariant'>) =>
  a.przedmiot === b.przedmiot && a.slug === b.slug && a.wariant === b.wariant;

export function dodajDoTeczki(wpis: WpisTeczki) {
  const wpisy = czytaj();
  if (!wpisy.some((w) => tenSam(w, wpis))) zapisz([...wpisy, wpis]);
  window.dispatchEvent(new Event(ZDARZENIE_OTWORZ));
}

export function usunZTeczki(wpis: Pick<WpisTeczki, 'przedmiot' | 'slug' | 'wariant'>) {
  zapisz(czytaj().filter((w) => !tenSam(w, wpis)));
}

export function wyczyscTeczke() {
  zapisz([]);
}

function subskrybuj(cb: () => void) {
  window.addEventListener(ZDARZENIE, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(ZDARZENIE, cb);
    window.removeEventListener('storage', cb);
  };
}

export function useTeczka(): WpisTeczki[] {
  return useSyncExternalStore(subskrybuj, czytaj, () => PUSTA);
}

export const czyWTeczce = (wpisy: WpisTeczki[], w: Pick<WpisTeczki, 'przedmiot' | 'slug' | 'wariant'>) =>
  wpisy.some((x) => tenSam(x, w));
