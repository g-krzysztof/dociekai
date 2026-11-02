/**
 * Objętość prostopadłościanu — jedna czysta funkcja karmi wizual, przykłady
 * i klucz odpowiedzi (ta sama zasada co `lib/rectangle-area.ts` o wymiar niżej).
 *
 * `lib/volume-units.ts` odpowiada na pytanie „jaką miarką", ten plik — „ile tego
 * jest w konkretnej bryle". Jedno zdanie, na którym wszystko tu stoi: **warstwa
 * to pole podstawy, a warstw jest tyle, ile wynosi wysokość**, więc
 * `V = a · b · c` nie jest wzorem do wykucia, tylko zapisem liczenia warstwami.
 */

import type { BoxSpec } from './solids';

/** Objętość w jednostkach sześciennych tej jednostki, w której podano wymiary. */
export function boxVolume({ width, depth, height }: BoxSpec): number {
  return width * depth * height;
}

/** Pole podstawy — jedna warstwa kostek, na której stoi cała reszta. */
export function baseArea({ width, depth }: BoxSpec): number {
  return width * depth;
}

/** Jedna warstwa wypełniania bryły kostkami, z sumą narastającą. */
export interface VolumeLayer {
  /** Numer warstwy liczony od dna, od 1. */
  index: number;
  /** Ile kostek wchodzi w tę warstwę — zawsze pole podstawy. */
  perLayer: number;
  /** Ile kostek stoi w bryle po dołożeniu tej warstwy. */
  runningTotal: number;
}

/**
 * Bryła wypełniana warstwa po warstwie. Suma narastająca jest tu treścią, nie
 * ozdobą: dziecko ma zobaczyć, że każdy krok dokłada **tę samą** liczbę kostek,
 * więc mnożenie jest tylko skrótem powtarzanego dodawania.
 */
export function buildLayerFill(spec: BoxSpec): VolumeLayer[] {
  const perLayer = baseArea(spec);
  return Array.from({ length: spec.height }, (_, i) => ({
    index: i + 1,
    perLayer,
    runningTotal: perLayer * (i + 1),
  }));
}

/** Trzeci wymiar odczytany z objętości i dwóch pozostałych — dzielenie, nie mnożenie. */
export function missingDimension(volume: number, a: number, b: number): number {
  return volume / (a * b);
}

/* ─────────────────── objętość a pojemność (cm³ ↔ litry) ─────────────────── */

export const CM3_PER_LITRE = 1000;

export const toLitres = (cm3: number): number => cm3 / CM3_PER_LITRE;
export const fromLitres = (litres: number): number => litres * CM3_PER_LITRE;

/* ───────────────────────── poziom wody w naczyniu ───────────────────────── */

/**
 * Objętość wody w prostopadłościennym naczyniu napełnionym do wysokości
 * `level`. Pole podstawy się nie zmienia, więc objętość rośnie **liniowo** z
 * poziomem — to jest cała treść zadania z akwarium i dlatego liczy to funkcja,
 * a nie ręcznie wpisana tabelka poziomów.
 */
export function waterVolume(spec: BoxSpec, level: number): number {
  return baseArea(spec) * level;
}

/** Odwrotność `waterVolume` — do jakiej wysokości sięgnie zadana objętość wody. */
export function levelForVolume(spec: BoxSpec, volume: number): number {
  return volume / baseArea(spec);
}

/* ───────────────────────────── formatowanie ───────────────────────────── */

/** Liczba w polskim zapisie (przecinek dziesiętny, spacje między klasami). */
export const formatNumber = (value: number): string =>
  Math.round(value * 1000) / 1000 === Math.round(value)
    ? Math.round(value).toLocaleString('pl-PL')
    : (Math.round(value * 1000) / 1000).toLocaleString('pl-PL');

export const formatLitres = (cm3: number): string => `${formatNumber(toLitres(cm3))} l`;

export const BOX_VOLUME_RULES: string[] = [
  'Objętość mówi, ile się w bryle mieści — liczy się ją w kostkach jednostkowych, np. w cm³.',
  'Dno prostopadłościanu mieści tyle kostek, ile wynosi pole podstawy: długość razy szerokość.',
  'Warstw jest tyle, ile wynosi wysokość, a każda mieści tyle samo kostek co dno.',
  'Stąd wzór: V = a · b · c, czyli długość razy szerokość razy wysokość. To zapis liczenia warstwami, nie osobna reguła.',
  'Wszystkie trzy wymiary muszą być w tej samej jednostce — inaczej wynik nie znaczy nic.',
  'Znając objętość i dwa wymiary, trzeci znajdziesz dzieleniem: c = V : (a · b).',
  'W naczyniu pole podstawy się nie zmienia, więc dwa razy wyższy poziom wody to dwa razy więcej wody.',
  '1000 cm³ to 1 litr, więc objętość w cm³ zamieniasz na litry, dzieląc przez 1000.',
];
