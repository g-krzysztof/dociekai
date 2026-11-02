import { Compass, Hexagon, Sparkles, Triangle, type LucideIcon } from 'lucide-react';

export type LevelId = 'ksztalty' | 'boki' | 'katy' | 'mix';
export type RoundKind = 'typ' | 'boki' | 'kat' | 'symetria';

export interface LevelConfig {
  id: LevelId;
  index: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: LucideIcon;
  /** Czas, po którym kryształ "ląduje" (ms), w pierwszej rundzie. */
  travelStartMs: number;
  /** Dolna granica czasu — tempo nie rośnie w nieskończoność. */
  travelMinMs: number;
  /** O ile skraca się czas z każdą kolejną rundą. */
  decayPerRoundMs: number;
  /** Z jakich rodzajów zadań losuje ten poziom — jeden typ dla poziomów 1-3, mix dla poziomu 4. */
  roundKinds: RoundKind[];
}

export const SHIELDS_START = 3;
export const MILESTONE_STEP = 5;
/** Pauza po rozstrzygnięciu rundy zanim wystartuje kolejna. */
export const FEEDBACK_MS = 1100;

export const LEVELS: LevelConfig[] = [
  {
    id: 'ksztalty',
    index: 1,
    title: 'Nazwy kształtów',
    subtitle: 'Koło, trójkąt, kwadrat, prostokąt',
    description: 'Rozpoznawaj podstawowe figury i odsyłaj je do właściwego doku, zanim wylądują.',
    color: '#22c55e',
    icon: Triangle,
    travelStartMs: 4500,
    travelMinMs: 3000,
    decayPerRoundMs: 60,
    roundKinds: ['typ'],
  },
  {
    id: 'boki',
    index: 2,
    title: 'Liczba boków',
    subtitle: 'Od trójkąta do sześciokąta',
    description: 'Policz boki figury i wybierz właściwy dok — coraz więcej kształtów do rozpoznania.',
    color: '#3b82f6',
    icon: Hexagon,
    travelStartMs: 4000,
    travelMinMs: 2500,
    decayPerRoundMs: 65,
    roundKinds: ['boki'],
  },
  {
    id: 'katy',
    index: 3,
    title: 'Rodzaje kątów',
    subtitle: 'Ostry, prosty, rozwarty',
    description: 'Oceń kąt między dwoma promieniami i posortuj go: ostry, prosty czy rozwarty.',
    color: '#a855f7',
    icon: Compass,
    travelStartMs: 3600,
    travelMinMs: 2200,
    decayPerRoundMs: 68,
    roundKinds: ['kat'],
  },
  {
    id: 'mix',
    index: 4,
    title: 'Wielka sortownia',
    subtitle: 'Kształty, boki, kąty i symetria na zmianę',
    description: 'Najtrudniejszy poziom. Zadania losują się z całego programu — trzeba myśleć szybko.',
    color: '#f97316',
    icon: Sparkles,
    travelStartMs: 3200,
    travelMinMs: 1800,
    decayPerRoundMs: 75,
    roundKinds: ['typ', 'boki', 'kat', 'symetria'],
  },
];

export function getLevelById(id: LevelId): LevelConfig {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Nieznany poziom: ${id}`);
  return level;
}
