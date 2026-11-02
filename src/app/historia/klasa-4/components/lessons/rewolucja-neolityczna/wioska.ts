/**
 * Dziesięć lat w dolinie (L16, blok 1) — czysta symulacja. Grupa sześciu
 * osób zostaje przy polu. Co roku dziecko sieje i żnie; plon idzie do
 * spichlerza, ludzie zjadają po jednym worku na osobę. Gdy w spichlerzu
 * przybywa, do wioski dochodzi ktoś, kto **nie musi zdobywać jedzenia**
 * (garncarz, budowniczy…) — i stawia dom. Myszy w spichlerzu zjadają ziarno,
 * dopóki nie pojawi się kot (baza F-III.1-19). W piątym roku susza: plon
 * mały, ale spichlerz ratuje wioskę — koczownik nie ma spichlerza.
 * Liczby są modelem, nie danymi archeologicznymi.
 */

export const YEARS = 10;
export const CELLS = 8;
export const START_PEOPLE = 6;
export const START_HOUSES = 3;
/** Worki z jednego obsianego zagonu w zwykły rok i w suszę. */
export const YIELD = 2;
export const DROUGHT_YEAR = 4; // piąty rok (indeks od zera)
export const DROUGHT_YIELD = 0.5;
/** Myszy zjadają tyle worków rocznie, dopóki nie ma kota. */
export const MICE_EAT = 2;
/** Od tylu worków w spichlerzu przychodzą myszy. */
export const MICE_AT = 10;

export interface Specialist {
  id: string;
  name: string;
  /** Co robi zamiast zdobywać jedzenie. */
  does: string;
  /** Spichlerz musi mieć łącznie tyle worków nadwyżki, żeby przyszedł. */
  at: number;
}

export const SPECIALISTS: Specialist[] = [
  { id: 'garncarz', name: 'garncarz', does: 'lepi gliniane naczynia na ziarno', at: 6 },
  { id: 'budowniczy', name: 'budowniczy', does: 'stawia domy z drewna i gliny', at: 14 },
  { id: 'tkaczka', name: 'tkaczka', does: 'tka płótno z lnu', at: 24 },
  { id: 'pasterz', name: 'pasterz', does: 'pasie oswojone kozy i owce', at: 36 },
  { id: 'krzemieniarz', name: 'krzemieniarz', does: 'robi siekiery i sierpy z krzemienia', at: 50 },
];

export interface VillageState {
  year: number;
  granary: number;
  /** Suma nadwyżek (bez zjedzonego i bez strat) — od niej zależą nowi mieszkańcy. */
  surplusTotal: number;
  harvestTotal: number;
  specialists: string[];
  mice: boolean;
  /** Ile lat myszy już mieszkają w spichlerzu. */
  miceYears: number;
  cat: boolean;
  hungryYears: number;
  log: YearLog[];
}

export interface YearLog {
  year: number;
  sown: number;
  harvest: number;
  eaten: number;
  miceAte: number;
  newcomer: string | null;
  drought: boolean;
  catArrived: boolean;
}

export function initialVillage(): VillageState {
  return { year: 0, granary: 0, surplusTotal: 0, harvestTotal: 0, specialists: [], mice: false, miceYears: 0, cat: false, hungryYears: 0, log: [] };
}

export function people(s: VillageState): number {
  return START_PEOPLE + s.specialists.length;
}

export function houses(s: VillageState): number {
  return START_HOUSES + s.specialists.length;
}

export function harvestOf(sown: number, year: number): number {
  return Math.floor(sown * (year === DROUGHT_YEAR ? DROUGHT_YIELD : YIELD));
}

/** Rok: plon z obsianych zagonów → spichlerz → jedzenie → myszy → może nowy mieszkaniec. */
export function runYear(s: VillageState, sown: number): VillageState {
  if (s.year >= YEARS) return s;
  const n = Math.max(0, Math.min(CELLS, Math.round(sown)));
  const harvest = harvestOf(n, s.year);
  const eat = people(s);
  let granary = s.granary + harvest - eat;
  let hungry = s.hungryYears;
  if (granary < 0) {
    granary = 0;
    hungry++;
  }
  // kot zjawia się rok po tym, jak myszy zaczęły podjadać ziarno
  const catArrived = s.mice && !s.cat && s.miceYears >= 1;
  const cat = s.cat || catArrived;
  const miceAte = s.mice && !cat ? Math.min(MICE_EAT, granary) : 0;
  granary -= miceAte;
  const mice = s.mice || granary >= MICE_AT;
  const surplusTotal = s.surplusTotal + Math.max(0, harvest - eat);
  const next = SPECIALISTS.find((sp) => !s.specialists.includes(sp.id) && surplusTotal >= sp.at);
  const specialists = next ? [...s.specialists, next.id] : s.specialists;
  const log: YearLog = {
    year: s.year,
    sown: n,
    harvest,
    eaten: eat,
    miceAte,
    newcomer: next?.id ?? null,
    drought: s.year === DROUGHT_YEAR,
    catArrived,
  };
  return {
    year: s.year + 1,
    granary,
    surplusTotal,
    harvestTotal: s.harvestTotal + harvest,
    specialists,
    mice,
    miceYears: mice ? s.miceYears + (s.mice ? 1 : 0) : 0,
    cat,
    hungryYears: hungry,
    log: [...s.log, log],
  };
}

export interface VillageStats {
  granary: number;
  freed: number;
  houses: number;
  harvestTotal: number;
  /** Wyliczone z przykładowej wioski (dziecko nie dokończyło symulacji). */
  sample: boolean;
}

export function statsOf(s: VillageState, sample = false): VillageStats {
  return { granary: s.granary, freed: s.specialists.length, houses: houses(s), harvestTotal: s.harvestTotal, sample };
}

/** Wioska, w której co roku obsiano całe pole. */
export function sampleVillage(): VillageState {
  let s = initialVillage();
  while (s.year < YEARS) s = runYear(s, CELLS);
  return s;
}

export function getSpecialist(id: string): Specialist {
  return SPECIALISTS.find((s) => s.id === id)!;
}
