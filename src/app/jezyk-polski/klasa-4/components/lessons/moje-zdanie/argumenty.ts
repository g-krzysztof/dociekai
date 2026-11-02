import { findConnector, wordSimilarity } from '../../../lib/pisarnia';
import type { PisarniaAnalysis } from '../../../lib/pisarnia/types';

/**
 * L6 „Moje zdanie” — spór „Ogródek czy boisko?” (teksty własne, rejestr
 * T-L6-*). Czysta logika: talie kart, reakcja pana Bogdana, sędzia zdania z
 * „bo”, miejsce na planie podwórka.
 *
 * Rodzaj karty **widać w jej słowach** (bez klucza autora): powód za stroną
 * nazywa korzyść tej strony; powtórzenie mówi „X, bo X”; karta nie na temat
 * nie dotyczy podwórka. Talie są lustrzane — obie strony mają tyle samo
 * dobrych kart, więc nie ma wartości do zgadnięcia.
 */

export type Strona = 'ogrodek' | 'boisko';
export type Rodzaj = 'za' | 'przeciw' | 'powtorzenie' | 'obok';

export const STRONA_LABEL: Record<Strona, string> = { ogrodek: 'ogródek', boisko: 'boisko' };
export const druga = (s: Strona): Strona => (s === 'ogrodek' ? 'boisko' : 'ogrodek');

interface KartaDef {
  id: string;
  text: string;
  /** Za którą stroną mówi (dla `za`/`powtorzenie`); `null` — nie na temat. */
  strona: Strona | null;
  powtorzenie?: boolean;
}

export const KARTY: KartaDef[] = [
  { id: 'b1', strona: 'boisko', text: 'Na boisku zmieszczą się wszystkie dzieci z kamienicy i jeszcze goście.' },
  { id: 'b2', strona: 'boisko', text: 'Na boisku możemy biegać po lekcjach, zamiast siedzieć w domu.' },
  { id: 'o1', strona: 'ogrodek', text: 'Z ogródka będą własne pomidory i ogórki dla całej kamienicy.' },
  { id: 'o2', strona: 'ogrodek', text: 'W ogródku pani Halina nauczy nas sadzić kwiaty i warzywa.' },
  { id: 'rb1', strona: 'boisko', powtorzenie: true, text: 'Boisko, bo boisko jest lepsze.' },
  { id: 'rb2', strona: 'boisko', powtorzenie: true, text: 'Chcę boisko, bo chcę boisko.' },
  { id: 'ro1', strona: 'ogrodek', powtorzenie: true, text: 'Ogródek, bo ogródek jest lepszy.' },
  { id: 'ro2', strona: 'ogrodek', powtorzenie: true, text: 'Chcę ogródek, bo chcę ogródek.' },
  { id: 'x1', strona: null, text: 'Pani Halina ma szarego kota.' },
  { id: 'x2', strona: null, text: 'W sobotę jadę do babci.' },
];

/** Talia dziecka, które stoi po stronie `s`: 2 za, 2 za drugą stroną, 2 powtórzenia jego strony, 2 obok. */
export function talia(s: Strona): string[] {
  const za = KARTY.filter((k) => k.strona === s && !k.powtorzenie).map((k) => k.id);
  const przeciw = KARTY.filter((k) => k.strona === druga(s) && !k.powtorzenie).map((k) => k.id);
  const pow = KARTY.filter((k) => k.strona === s && k.powtorzenie).map((k) => k.id);
  const obok = KARTY.filter((k) => k.strona === null).map((k) => k.id);
  // Przemieszane w stałej kolejności — dobre karty nie leżą na początku.
  return [pow[0], przeciw[0], obok[0], za[0], przeciw[1], pow[1], za[1], obok[1]];
}

export const karta = (id: string) => KARTY.find((k) => k.id === id)!;

export function rodzaj(id: string, moja: Strona): Rodzaj {
  const k = karta(id);
  if (k.strona === null) return 'obok';
  if (k.powtorzenie) return 'powtorzenie';
  return k.strona === moja ? 'za' : 'przeciw';
}

export interface Rzut {
  rodzaj: Rodzaj;
  /** Gdzie ląduje karta: pod chorągiewką strony albo z powrotem w ręce. */
  cel: Strona | 'odbita';
  mowi: string;
}

export function rzut(id: string, moja: Strona): Rzut {
  const r = rodzaj(id, moja);
  const inna = druga(moja);
  if (r === 'za') return { rodzaj: r, cel: moja, mowi: `Łapię! To jest powód. Przypinam pod chorągiewką: ${STRONA_LABEL[moja]}.` };
  if (r === 'przeciw')
    return { rodzaj: r, cel: inna, mowi: `Dziękuję — ale to argument za drugą stroną. Przypinam pod chorągiewką: ${STRONA_LABEL[inna]}.` };
  if (r === 'powtorzenie') return { rodzaj: r, cel: 'odbita', mowi: 'To twoje zdanie jeszcze raz, tylko z „bo” w środku. A dlaczego?' };
  return { rodzaj: r, cel: 'odbita', mowi: 'A co to ma do podwórka?' };
}

// ── Mój powód (Pisarnia) ─────────────────────────────────────────────────────

export interface Kryterium {
  ok: boolean;
  note: string;
}

export function judgePowod(a: PisarniaAnalysis): { spojnik: Kryterium; zapis: Kryterium; swoj: Kryterium } {
  const s = a.sentences.filter((x) => x.words.length > 0);
  const first = s[0];
  let spojnik: Kryterium;
  if (!first) spojnik = { ok: false, note: 'Pole jest jeszcze puste.' };
  else {
    const c = findConnector(a, a.sentences.indexOf(first), ['bo', 'ponieważ']);
    if (!c) spojnik = { ok: false, note: 'Nie ma „bo” ani „ponieważ”. Bez nich zdanie nie ma powodu.' };
    else if (c.before.length === 0) spojnik = { ok: false, note: 'Przed „bo” nic nie stoi — napisz najpierw, czego chcesz.' };
    else if (c.after.length === 0) spojnik = { ok: false, note: 'Po „bo” nic nie ma — dopisz powód.' };
    else spojnik = { ok: true, note: `Twoje zdanie: „${c.before.map((w) => w.form).join(' ')}”, powód: „${c.after.map((w) => w.form).join(' ')}”.` };
  }
  const zapis: Kryterium = !first
    ? { ok: false, note: 'Najpierw zdanie.' }
    : s.length > 1
      ? { ok: false, note: 'Napisz jedno zdanie — jeden powód.' }
      : !first.capitalOk
        ? { ok: false, note: 'Zdanie zaczyna się małą literą.' }
        : first.endMark !== '.' && first.endMark !== '!'
          ? { ok: false, note: 'Na końcu postaw kropkę albo wykrzyknik.' }
          : { ok: true, note: 'Wielka litera i znak na końcu.' };
  const najblizsza = KARTY.map((k) => ({ k, sim: wordSimilarity(a.text, k.text) })).sort((x, y) => y.sim - x.sim)[0];
  const swoj: Kryterium =
    najblizsza && najblizsza.sim > 0.7
      ? { ok: false, note: `To argument z karty („${najblizsza.k.text}”) — napisz swój, własnymi słowami.` }
      : { ok: true, note: 'Powód własnymi słowami.' };
  return { spojnik, zapis, swoj };
}

// ── Druga strona (plan podwórka) ─────────────────────────────────────────────

/** Miejsce na osi 0 (ogródek) … 100 (boisko). Środek to kompromis. */
export function miejsce(x: number): Strona | 'granica' {
  if (x < 40) return 'ogrodek';
  if (x > 60) return 'boisko';
  return 'granica';
}

export function komentarzMiejsca(x: number, flaga: Strona): string {
  const m = miejsce(x);
  if (m === flaga) return `Zostajesz przy swojej chorągiewce: ${STRONA_LABEL[flaga]}. Masz powód — to już nie upór.`;
  if (m === 'granica') return 'Stajesz na granicy — kompromis. Kawałek ogródka, kawałek boiska. Też można, jeśli wiesz dlaczego.';
  return 'Przesunięcie po usłyszeniu powodu — tak działa rozmowa. To nie przegrana, tylko słuchanie.';
}
