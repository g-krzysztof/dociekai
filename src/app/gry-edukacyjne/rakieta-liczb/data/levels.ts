import { Grid3x3, Hash, ListOrdered, Rocket, type LucideIcon } from 'lucide-react';

export type LevelId = 'start' | 'tabliczka' | 'dwucyfrowe' | 'kolejnosc';

export interface LevelConfig {
  id: LevelId;
  index: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: LucideIcon;
  /** Czas przelotu portalu (ms) w pierwszej rundzie. */
  travelStartMs: number;
  /** Dolna granica czasu przelotu — tempo nie rośnie w nieskończoność. */
  travelMinMs: number;
  /** O ile skraca się czas przelotu z każdą kolejną rundą. */
  decayPerRoundMs: number;
}

export const LANE_COUNT = 3;
export const SHIELDS_START = 3;
export const MILESTONE_STEP = 5;
/** Pauza po rozstrzygnięciu rundy zanim wystartuje kolejna. */
export const FEEDBACK_MS = 1100;
/** Ile ms poprawna odpowiedź świeci po błędzie/spóźnieniu, zanim runda ruszy dalej. */
export const REVEAL_CORRECT_MS = 900;

export const LEVELS: LevelConfig[] = [
  {
    id: 'start',
    index: 1,
    title: 'Start',
    subtitle: 'Dodawanie i odejmowanie do 20',
    description: 'Powolny lot — idealny na rozgrzewkę. Proste dodawanie i odejmowanie w zakresie do 20.',
    color: '#22c55e',
    icon: Rocket,
    travelStartMs: 4500,
    travelMinMs: 3000,
    decayPerRoundMs: 60,
  },
  {
    id: 'tabliczka',
    index: 2,
    title: 'Tabliczka mnożenia',
    subtitle: 'Mnożenie i dzielenie do 10×10',
    description: 'Szybszy korytarz. Mnożenie i dzielenie bez reszty w zakresie tabliczki mnożenia.',
    color: '#3b82f6',
    icon: Grid3x3,
    travelStartMs: 4000,
    travelMinMs: 2500,
    decayPerRoundMs: 65,
  },
  {
    id: 'dwucyfrowe',
    index: 3,
    title: 'Liczby dwucyfrowe',
    subtitle: 'Działania na liczbach 2-cyfrowych',
    description: 'Jeszcze szybciej. Dodawanie, odejmowanie i mnożenie liczb dwucyfrowych.',
    color: '#a855f7',
    icon: Hash,
    travelStartMs: 3500,
    travelMinMs: 2000,
    decayPerRoundMs: 70,
  },
  {
    id: 'kolejnosc',
    index: 4,
    title: 'Kolejność działań',
    subtitle: 'Wyrażenia z nawiasami',
    description: 'Najtrudniejszy poziom. Wyrażenia z nawiasami — liczy się kolejność działań, nie kolejność czytania.',
    color: '#f97316',
    icon: ListOrdered,
    travelStartMs: 3200,
    travelMinMs: 1800,
    decayPerRoundMs: 75,
  },
];

export function getLevelById(id: LevelId): LevelConfig {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Nieznany poziom: ${id}`);
  return level;
}
