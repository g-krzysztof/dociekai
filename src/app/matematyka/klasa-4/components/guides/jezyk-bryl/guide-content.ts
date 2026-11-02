import type { GuideActMeta } from '../guide-act';

/**
 * Wszystkie akty na `flow` — bryła obraca się gestem, a nie
 * pozycją scrolla, więc `stage` dałby tylko przyklejone, puste ekrany.
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Kartka czy pudełko?', mode: 'flow' },
  { id: 'trzy-slowa', label: 'Ściana, krawędź, wierzchołek', mode: 'flow' },
  { id: 'rodzina-bryl', label: 'Rodzina brył', mode: 'flow' },
  { id: 'prostopadloscian-i-szescian', label: 'Prostopadłościan i sześcian', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół ciebie', mode: 'flow' },
];

/** Typy bryły mieszkają w `lib/solids.ts` — przewodnik był ich pierwszym, ale
 *  nie jedynym konsumentem (patrz lekcja `rozpoznawanie-bryl`). */
export type { SolidKind, SurfaceKind } from '../../../lib/solids';
import type { SolidKind, SurfaceKind } from '../../../lib/solids';

export interface SolidFamilyEntry {
  id: SolidKind;
  name: string;
  surface: SurfaceKind;
  definition: string;
  example: string;
}

export const SOLID_FAMILY: SolidFamilyEntry[] = [
  {
    id: 'prostopadloscian',
    name: 'Prostopadłościan',
    surface: 'plaskie',
    definition:
      'Sześć ścian i każda z nich jest prostokątem. To bryła, którą znasz najlepiej — zwykłe pudełko.',
    example: 'Pudełko po butach, akwarium, cegła, paczka herbaty.',
  },
  {
    id: 'graniastoslup',
    name: 'Graniastosłup',
    surface: 'plaskie',
    definition:
      'Dwie identyczne podstawy naprzeciw siebie, a między nimi ściany boczne. Podstawa może być trójkątem, pięciokątem, czymkolwiek — prostopadłościan to po prostu graniastosłup o podstawie prostokąta.',
    example: 'Namiot dwuspadowy, ołówek o sześciokątnym przekroju, pryzmat.',
  },
  {
    id: 'ostroslup',
    name: 'Ostrosłup',
    surface: 'plaskie',
    definition:
      'Jedna podstawa na dole, a wszystkie ściany boczne to trójkąty zbiegające się w jednym wierzchołku na górze.',
    example: 'Piramida w Gizie, hełm wieży kościelnej, namiot tipi.',
  },
  {
    id: 'walec',
    name: 'Walec',
    surface: 'zaokraglone',
    definition:
      'Dwie okrągłe podstawy, a między nimi powierzchnia zaokrąglona — możesz przejechać po niej palcem dookoła i nie natrafisz na żadną krawędź.',
    example: 'Puszka, rolka ręcznika papierowego, szklanka, świeca.',
  },
  {
    id: 'stozek',
    name: 'Stożek',
    surface: 'zaokraglone',
    definition:
      'Jedna okrągła podstawa i jeden wierzchołek na górze, połączone powierzchnią zaokrągloną.',
    example: 'Rożek do lodów, pachołek drogowy, czapeczka urodzinowa.',
  },
  {
    id: 'kula',
    name: 'Kula',
    surface: 'zaokraglone',
    definition:
      'Ani jednej płaskiej ściany, ani jednej krawędzi, ani jednego wierzchołka — cała powierzchnia jest tak samo zaokrąglona.',
    example: 'Piłka, globus, kulka do gry, pomarańcza.',
  },
];

export interface SolidMatch {
  id: string;
  thing: string;
  correct: SolidKind;
  why: string;
}

/** Dopasowanie przedmiotu do nazwy bryły — jedna poprawna, reszta sensowna, ale błędna. */
export const SOLID_MATCHES: SolidMatch[] = [
  {
    id: 'puszka',
    thing: 'puszka po kukurydzy',
    correct: 'walec',
    why: 'Dwie okrągłe podstawy — góra i dół — i gładki, zaokrąglony bok bez żadnej krawędzi. To walec.',
  },
  {
    id: 'piramida',
    thing: 'piramida w Gizie',
    correct: 'ostroslup',
    why: 'Kwadratowa podstawa i cztery trójkątne ściany schodzące się w jednym punkcie na szczycie. To ostrosłup.',
  },
  {
    id: 'pudelko',
    thing: 'pudełko po butach',
    correct: 'prostopadloscian',
    why: 'Sześć prostokątnych ścian, dwanaście krawędzi, osiem wierzchołków. To prostopadłościan.',
  },
  {
    id: 'pilka',
    thing: 'piłka do siatkówki',
    correct: 'kula',
    why: 'Nie znajdziesz na niej płaskiej ściany ani krawędzi — cała powierzchnia jest zaokrąglona. To kula.',
  },
  {
    id: 'pacholek',
    thing: 'pachołek drogowy',
    correct: 'stozek',
    why: 'Okrągła podstawa na dole i jeden czubek na górze. To stożek.',
  },
  {
    id: 'namiot',
    thing: 'namiot dwuspadowy',
    correct: 'graniastoslup',
    why: 'Dwie identyczne trójkątne ściany — przód i tył — a między nimi prostokątne boki. To graniastosłup o podstawie trójkąta.',
  },
];

export const CHEAT_SHEET: string[] = [
  'Figura płaska mieści się cała na kartce; bryła zajmuje miejsce w przestrzeni — ma jeszcze grubość.',
  'Ściana to płaski kawałek powierzchni bryły. Prostopadłościan ma ich sześć.',
  'Krawędź to odcinek, wzdłuż którego stykają się dwie ściany. Prostopadłościan ma ich dwanaście.',
  'Wierzchołek to punkt, w którym schodzą się krawędzie. Prostopadłościan ma ich osiem.',
  'Na rysunku krawędzie widoczne rysuje się linią ciągłą, a zasłonięte — przerywaną.',
  'Sześcian to prostopadłościan o wszystkich krawędziach równej długości, więc każda jego ściana jest kwadratem.',
  'Walec, stożek i kula mają powierzchnie zaokrąglone; kula nie ma ani jednej krawędzi i ani jednego wierzchołka.',
];
