/**
 * L17 blok 3 — „Wyspa skończona” (R, bez werdyktu). Ślady całego modułu 4 na
 * mapie wyspy i zdania, które pojawiają się przy przelocie palcem. Czysta
 * logika — selftest `scripts/polski-l17-selftest.mjs`.
 *
 * Współrzędne w procentach planszy `PlanszaWyspy` (400 × 300, jak w L14);
 * stałe ślady leżą na obrzeżach, bo środek łąki zajmują rzeczy dziecka.
 */

import type { WyspaRecord, WyspaRzecz, WyspaTort } from '../../../lib/wyspa/types';
import { slowo } from '../rzeczownik/rzeczy';
import { strefa, wyrazenie, STREFY } from './domek';

export type Czesc = 'odmieniarka' | 'rzeczownik' | 'nazwa' | 'czasownik' | 'przyslowek' | 'przymiotnik' | 'przyimek' | 'zaimek';

export const CZESCI: Czesc[] = ['odmieniarka', 'rzeczownik', 'nazwa', 'czasownik', 'przyslowek', 'przymiotnik', 'przyimek', 'zaimek'];

export interface Slad {
  id: string;
  czesc: Czesc;
  x: number;
  y: number;
  zdanie: string;
}

/** Ten sam zestaw startowy co w L14 — dla dziecka, które weszło od środka modułu. */
export const STARTOWE: WyspaRzecz[] = [
  { id: 'dom-s', slowo: 'dom', x: 34, y: 40 },
  { id: 'latarnia-s', slowo: 'latarnia', x: 70, y: 30 },
  { id: 'koza-s', slowo: 'koza', x: 46, y: 64 },
  { id: 'drzewo-s', slowo: 'drzewo', x: 24, y: 58 },
  { id: 'studnia-s', slowo: 'studnia', x: 60, y: 52 },
  { id: 'ognisko-s', slowo: 'ognisko', x: 72, y: 70 },
];

export const POZYCJE = {
  nazwa: { x: 50, y: 8 },
  domek: { x: 82, y: 40 },
  odmieniarka: { x: 74, y: 82 },
  tort: { x: 90, y: 66 },
  lodka: { x: 95, y: 92 },
  slup: { x: 20, y: 76 },
  tor: { x: 50, y: 78 },
} as const;

const KSZTALT: Record<WyspaTort['ksztalt'], string> = { okragly: 'okrągły', kwadratowy: 'kwadratowy' };
const PIETRA = ['', 'jednopiętrowy', 'dwupiętrowy', 'trzypiętrowy'];
const SMAK: Record<WyspaTort['pietra'][number], string> = { czekoladowy: 'czekoladowy', waniliowy: 'waniliowy', malinowy: 'malinowy', cytrynowy: 'cytrynowy' };
const LUKIER: Record<WyspaTort['kolor'], string> = { bialy: 'biały', rozowy: 'różowy', zielony: 'zielony' };

/** Przymiotniki tortu, bez powtórzeń: „okrągły, dwupiętrowy, czekoladowy, różowy” (ostatni — kolor lukru). */
export function przymiotnikiTortu(t: WyspaTort): string[] {
  const smaki = [...new Set(t.pietra.map((p) => SMAK[p]))];
  return [KSZTALT[t.ksztalt], PIETRA[t.pietra.length], ...smaki.filter((x) => x !== LUKIER[t.kolor]), LUKIER[t.kolor]];
}

const znanaStrefa = (id?: string) => !!id && STREFY.some((s) => s.id === id);

/** Pierwsze zdanie planu z L15 (Teczka), przycięte. */
export function pierwszeZdanie(plan: string, max = 80): string {
  const t = plan.replace(/\s+/g, ' ').trim();
  const m = t.match(/^.+?[.!?…](?=\s|$)/);
  const z = (m ? m[0] : t).trim();
  return z.length > max ? `${z.slice(0, max - 1).trimEnd()}…` : z;
}

export interface Mapa {
  rzeczy: WyspaRzecz[];
  startowe: boolean;
  slady: Slad[];
}

/** Rzeczy i ślady wyspy dziecka; przy pustym stanie — wyspa startowa. */
export function zbudujMape(w: Pick<WyspaRecord, 'rzeczy' | 'nazwa' | 'tor' | 'tort' | 'kot'>, plan: string | null): Mapa {
  const startowe = w.rzeczy.length === 0;
  const rzeczy = (startowe ? STARTOWE : w.rzeczy).filter((r) => {
    try {
      slowo(r.slowo);
      return true;
    } catch {
      return false;
    }
  });
  const slady: Slad[] = rzeczy.map((r) => {
    const s = slowo(r.slowo);
    const ile = r.ile && r.ile > 1 && s.formy ? `${r.ile} ${r.ile < 5 ? s.formy[1] : s.formy[2]}` : s.tekst;
    return {
      id: `rzecz-${r.id}`,
      czesc: 'rzeczownik' as const,
      x: r.x,
      y: r.y,
      zdanie: r.imie
        ? `„${s.tekst}” — to postawił rzeczownik. Ma też imię: ${r.imie}. Imię to nazwa własna, więc wielką literą.`
        : `„${ile}” — to postawił rzeczownik. Rzeczownik nazywa.`,
    };
  });
  slady.push({
    id: 'nazwa',
    czesc: 'nazwa',
    ...POZYCJE.nazwa,
    zdanie: w.nazwa ? `${w.nazwa} — nazwa własna wyspy, dlatego wielką literą.` : 'Wyspa jeszcze nie ma nazwy. Nazwa własna zawsze zaczyna się wielką literą.',
  });
  slady.push({
    id: 'odmieniarka',
    czesc: 'odmieniarka',
    ...POZYCJE.odmieniarka,
    zdanie: 'Odmieniarka w porcie. Tu słowa pokazały, czy zmieniają kształt: wyrazy odmienne i nieodmienne.',
  });
  slady.push({
    id: 'slup',
    czesc: 'czasownik',
    ...POZYCJE.slup,
    zdanie: plan
      ? `Plan na jutro: „${pierwszeZdanie(plan)}” Czasownik mówi, co się stanie — i kiedy.`
      : 'Słup na plan na jutro. Czasownik mówi, co się dzieje — i kiedy: wczoraj, dziś czy jutro.',
  });
  slady.push({
    id: 'tor',
    czesc: 'przyslowek',
    ...POZYCJE.tor,
    zdanie: w.tor
      ? 'Tor ślimaków. Przysłówek mówił, jak ślimak pełznie: szybko, ostrożnie, cicho.'
      : 'Tor ślimaków czeka na wyścig. Przysłówek mówi, jak coś się dzieje: szybko, ostrożnie, cicho.',
  });
  slady.push({
    id: 'tort',
    czesc: 'przymiotnik',
    ...POZYCJE.tort,
    zdanie: w.tort
      ? `Tort na przystani: ${przymiotnikiTortu(w.tort).join(', ')}. Przymiotniki mówiły, jaki ma być.`
      : 'Cukiernia na przystani. Przymiotnik mówi, jaki jest tort: okrągły, czekoladowy, trzypiętrowy.',
  });
  slady.push({
    id: 'domek',
    czesc: 'przyimek',
    ...POZYCJE.domek,
    zdanie: `Domek przy latarni. Kot jest ${wyrazenie(strefa(znanaStrefa(w.kot) ? w.kot! : 'w-koszu'))} — to mówi przyimek.`,
  });
  slady.push({
    id: 'lodka',
    czesc: 'zaimek',
    ...POZYCJE.lodka,
    zdanie: 'Łódka Tymka i Kuby. Zamiast „Tymek”: on, go, mu — zaimek zastępuje imię, jeśli wiadomo, o kogo chodzi.',
  });
  return { rzeczy, startowe, slady };
}

/** Promień trafienia w jednostkach planszy 400 × 300. */
export const PROMIEN = 24;

/** Ślad najbliższy punktowi (procenty planszy), jeśli leży w promieniu. Odległość liczona w jednostkach planszy (proporcje 4 : 3). */
export function sladPod(slady: Slad[], x: number, y: number): Slad | null {
  let best: Slad | null = null;
  let bd = Infinity;
  for (const s of slady) {
    const d = Math.hypot(((s.x - x) * 400) / 100, ((s.y - y) * 300) / 100);
    if (d < bd) {
      bd = d;
      best = s;
    }
  }
  return best && bd <= PROMIEN ? best : null;
}

export const odkryte = (czesci: Czesc[]) => CZESCI.every((c) => czesci.includes(c));

/** Tekst kartki „Mapa wyspy” do Teczki. */
export function kartkaMapy(m: Mapa, w: Pick<WyspaRecord, 'nazwa' | 'tort' | 'kot'>, plan: string | null): string {
  const lines = [
    `Wyspa: ${w.nazwa ?? 'bez nazwy'}`,
    `Na wyspie stoją: ${m.rzeczy.map((r) => (r.imie ? `${slowo(r.slowo).tekst} (${r.imie})` : slowo(r.slowo).tekst)).join(', ')}`,
  ];
  if (plan) lines.push(`Plan na jutro: ${pierwszeZdanie(plan, 160)}`);
  if (w.tort) lines.push(`Tort: ${przymiotnikiTortu(w.tort).join(', ')}`);
  lines.push(`Kot w domku przy latarni: ${wyrazenie(strefa(znanaStrefa(w.kot) ? w.kot! : 'w-koszu'))}`);
  return lines.join('\n');
}
