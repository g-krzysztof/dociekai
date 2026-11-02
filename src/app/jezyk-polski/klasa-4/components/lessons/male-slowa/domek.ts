/**
 * L17 blok 1 — „Gdzie jest kot?”. Przekrój domku przy latarni (widok z
 * przodu, płótno 480 × 300) podzielony na **rozłączne strefy**; każda ma
 * wyrażenie przyimkowe z końcówką rzeczownika (T-L17-1, napisane dla kursu).
 * Czysta logika — selftest `scripts/polski-l17-selftest.mjs`.
 *
 * Każdy punkt płótna należy do jakiejś strefy: kot puszczony w powietrzu
 * spada pionowo, aż trafi na pierwszą strefę pod sobą (nad stołem → na
 * stół, nad szafą → na szafę). Granice są szerokie i wybaczające.
 */

export const SZER = 480;
export const WYS = 300;
/** Linia, na której stoją meble (tylna krawędź podłogi). */
export const PODLOGA = 232;

export type Mebel = 'szafa' | 'stol' | 'kanapa' | 'parapet' | 'kosz';
/** Warstwa kota w strefie: `za` — rysowany za meblem (wystaje), `w` — za przednią ścianką kosza. */
export type Warstwa = 'przod' | 'za' | 'w';

/** Rzeczownik w wyrażeniu: `forma` = temat + `koncowka` (świeci razem z przyimkiem), `lemat` — forma słownikowa. */
export interface Rz {
  lemat: string;
  forma: string;
  koncowka: string;
}

export interface Strefa {
  id: string;
  przyimek: string;
  /** Jeden rzeczownik albo dwa („między stołem a kanapą”). */
  rz: [Rz] | [Rz, Rz];
  /** Prostokąty `[x0, y0, x1, y1]`, przedziały półotwarte `[x0, x1) × [y0, y1)`. */
  pola: [number, number, number, number][];
  /** Gdzie kot siada: środek w poziomie, dół łap. */
  kotX: number;
  kotY: number;
  warstwa: Warstwa;
}

const rz = (lemat: string, forma: string, koncowka: string): Rz => ({ lemat, forma, koncowka });

const SZAFA = 'szafa';
const STOL = 'stół';
const KANAPA = 'kanapa';

export const STREFY: Strefa[] = [
  { id: 'na-szafie', przyimek: 'na', rz: [rz(SZAFA, 'szafie', 'ie')], pola: [[40, 0, 120, 70]], kotX: 80, kotY: 64, warstwa: 'przod' },
  { id: 'za-szafa', przyimek: 'za', rz: [rz(SZAFA, 'szafą', 'ą')], pola: [[40, 70, 120, 248]], kotX: 112, kotY: 228, warstwa: 'za' },
  { id: 'przed-szafa', przyimek: 'przed', rz: [rz(SZAFA, 'szafą', 'ą')], pola: [[40, 248, 120, 300]], kotX: 80, kotY: 288, warstwa: 'przod' },
  {
    id: 'obok-szafy',
    przyimek: 'obok',
    rz: [rz(SZAFA, 'szafy', 'y')],
    pola: [[0, 0, 40, 300], [120, 0, 165, 300]],
    kotX: 142,
    kotY: 252,
    warstwa: 'przod',
  },
  { id: 'na-stole', przyimek: 'na', rz: [rz(STOL, 'stole', 'e')], pola: [[165, 0, 255, 162]], kotX: 210, kotY: 158, warstwa: 'przod' },
  { id: 'pod-stolem', przyimek: 'pod', rz: [rz(STOL, 'stołem', 'em')], pola: [[165, 162, 255, 248]], kotX: 210, kotY: 236, warstwa: 'przod' },
  { id: 'przed-stolem', przyimek: 'przed', rz: [rz(STOL, 'stołem', 'em')], pola: [[165, 248, 255, 300]], kotX: 210, kotY: 288, warstwa: 'przod' },
  {
    id: 'miedzy',
    przyimek: 'między',
    rz: [rz(STOL, 'stołem', 'em'), rz(KANAPA, 'kanapą', 'ą')],
    pola: [[255, 0, 300, 300]],
    kotX: 278,
    kotY: 252,
    warstwa: 'przod',
  },
  { id: 'na-kanapie', przyimek: 'na', rz: [rz(KANAPA, 'kanapie', 'ie')], pola: [[300, 0, 400, 236]], kotX: 350, kotY: 192, warstwa: 'przod' },
  { id: 'przed-kanapa', przyimek: 'przed', rz: [rz(KANAPA, 'kanapą', 'ą')], pola: [[300, 236, 400, 300]], kotX: 350, kotY: 288, warstwa: 'przod' },
  { id: 'na-parapecie', przyimek: 'na', rz: [rz('parapet', 'parapecie', 'ie')], pola: [[400, 0, 480, 134]], kotX: 440, kotY: 120, warstwa: 'przod' },
  { id: 'w-koszu', przyimek: 'w', rz: [rz('kosz', 'koszu', 'u')], pola: [[400, 134, 480, 250]], kotX: 440, kotY: 236, warstwa: 'w' },
  { id: 'przed-koszem', przyimek: 'przed', rz: [rz('kosz', 'koszem', 'em')], pola: [[400, 250, 480, 300]], kotX: 440, kotY: 290, warstwa: 'przod' },
];

export const START = 'przed-kanapa';

export function strefa(id: string): Strefa {
  const s = STREFY.find((x) => x.id === id);
  if (!s) throw new Error(`L17: nieznana strefa ${id}`);
  return s;
}

const w = (s: Strefa, x: number, y: number) => s.pola.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1);

/** Strefa punktu płótna (poza płótnem — przycięte do brzegu). Każdy punkt ma dokładnie jedną. */
export function gdzie(x: number, y: number): string {
  const cx = Math.min(SZER - 0.5, Math.max(0, x));
  const cy = Math.min(WYS - 0.5, Math.max(0, y));
  const s = STREFY.find((st) => w(st, cx, cy));
  return s ? s.id : START;
}

/** Wyrażenie przyimkowe: „na szafie”, „między stołem a kanapą”. */
export function wyrazenie(s: Strefa): string {
  return `${s.przyimek} ${s.rz.map((r) => r.forma).join(' a ')}`;
}

/** Zdanie pod domkiem w części pierwszej. */
export const zdanieKota = (id: string) => `Kot siedzi ${wyrazenie(strefa(id))}.`;

// ── Część 1: kot chodzi, zdanie goni ──

/** Ile różnych miejsc trzeba odwiedzić, zanim pojawi się wniosek. */
export const ODWIEDZ = 5;

/** Rzeczownik odwiedzony z co najmniej dwiema różnymi końcówkami — jest dowód, że przyimek zmienia końcówkę. */
export function dwieKoncowki(odwiedzone: string[]): { lemat: string; formy: string[] } | null {
  const formy = new Map<string, Set<string>>();
  for (const id of odwiedzone) {
    const s = STREFY.find((x) => x.id === id);
    if (!s || s.rz.length !== 1) continue;
    const r = s.rz[0];
    if (!formy.has(r.lemat)) formy.set(r.lemat, new Set());
    formy.get(r.lemat)!.add(r.forma);
  }
  for (const [lemat, f] of formy) if (f.size >= 2) return { lemat, formy: [...f] };
  return null;
}

export const czescPierwszaGotowa = (odwiedzone: string[]) => new Set(odwiedzone).size >= ODWIEDZ && !!dwieKoncowki(odwiedzone);

/** Co jeszcze brakuje w części pierwszej — podpowiedź pod domkiem. */
export function brakuje(odwiedzone: string[]): string | null {
  const ile = new Set(odwiedzone).size;
  if (ile < ODWIEDZ) return `Zostaw kota jeszcze w ${ODWIEDZ - ile} ${ODWIEDZ - ile === 1 ? 'nowym miejscu' : 'nowych miejscach'}.`;
  if (!dwieKoncowki(odwiedzone)) return 'Zostaw kota przy jednym meblu z dwóch stron, na przykład na stole i pod stołem.';
  return null;
}

// ── Część 2: zdanie podane, kot ma tam stanąć ──

export interface ZdanieOKocie {
  id: string;
  /** Zdanie z wyrażeniem przyimkowym; `wyr` to jego fragment, który świeci po przyjęciu. */
  tekst: string;
  wyr: string;
  cel: string;
}

/** Sześć zdań; dwie pary z tym samym rzeczownikiem i innym przyimkiem (stół: pod / na, kanapa: między / przed). */
export const ZDANIA: ZdanieOKocie[] = [
  { id: 'z1', tekst: 'Kot śpi w koszu.', wyr: 'w koszu', cel: 'w-koszu' },
  { id: 'z2', tekst: 'Kot czeka pod stołem.', wyr: 'pod stołem', cel: 'pod-stolem' },
  { id: 'z3', tekst: 'Kot schował się między kanapą a stołem.', wyr: 'między kanapą a stołem', cel: 'miedzy' },
  { id: 'z4', tekst: 'Kot siedzi na stole.', wyr: 'na stole', cel: 'na-stole' },
  { id: 'z5', tekst: 'Kot ukrył się za szafą.', wyr: 'za szafą', cel: 'za-szafa' },
  { id: 'z6', tekst: 'Kot leży przed kanapą.', wyr: 'przed kanapą', cel: 'przed-kanapa' },
];

export type Werdykt = { ok: true } | { ok: false; jest: string; mowi: string; tenSamMebel: boolean };

/** Kot puszczony w strefie `id` przy zdaniu `z`: zgadza się albo — konsekwencja — co mówi miejsce kota, a co zdanie. */
export function sprawdz(z: ZdanieOKocie, id: string): Werdykt {
  if (id === z.cel) return { ok: true };
  const jest = strefa(id);
  const cel = strefa(z.cel);
  const tenSamMebel = jest.rz.some((r) => cel.rz.some((c) => c.lemat === r.lemat));
  return { ok: false, jest: wyrazenie(jest), mowi: z.wyr, tenSamMebel };
}
