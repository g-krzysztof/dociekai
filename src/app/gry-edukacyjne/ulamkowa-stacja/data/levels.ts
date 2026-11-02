import { Fuel, FlaskConical, Beaker, Gauge, type LucideIcon } from 'lucide-react';

export type LevelId = 'czesci-calosci' | 'rozszerzanie' | 'ulamki-dziesietne' | 'mix';
export type TaskKind =
  | 'multiply'        // całość × ułamek (poziom 1)
  | 'compare'         // porównanie dwóch ułamków (poziom 2)
  | 'extend'          // rozszerzanie/skracanie (poziom 2)
  | 'complete'        // dopełnianie do całości (poziom 2)
  | 'add'             // dodawanie ułamków (poziom 3)
  | 'decimal';        // ułamek dziesiętny (poziom 3)

export interface LevelConfig {
  id: LevelId;
  index: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: LucideIcon;
  /** Czas na decyzję w pierwszej rundzie (ms). */
  travelStartMs: number;
  /** Dolna granica czasu — tempo nie rośnie w nieskończoność. */
  travelMinMs: number;
  /** O ile skraca się czas z każdą kolejną rundą. */
  decayPerRoundMs: number;
  /** Z jakich rodzajów zadań losuje ten poziom. */
  taskKinds: TaskKind[];
  /** Ile przycisków z wartościami do wyboru (poprawna + dystraktory) — rośnie z trudnością. */
  answerOptions: number;
}

export const SHIELDS_START = 3;
export const MILESTONE_STEP = 5;
/** Pauza po rozstrzygnięciu rundy zanim wystartuje kolejny statek. */
export const FEEDBACK_MS = 1200;

export const LEVELS: LevelConfig[] = [
  {
    id: 'czesci-calosci',
    index: 1,
    title: 'Części całości',
    subtitle: 'Policz ułamek zbiornika',
    description: 'Proste mnożenie: całość razy ułamek. Mianowniki 2, 3, 4, 5, 8, 10. Np. 3/4 z 1200 litrów.',
    color: '#22c55e',
    icon: Fuel,
    travelStartMs: 6000,
    travelMinMs: 3500,
    decayPerRoundMs: 80,
    taskKinds: ['multiply'],
    answerOptions: 4,
  },
  {
    id: 'rozszerzanie',
    index: 2,
    title: 'Rozszerzanie i porównywanie',
    subtitle: 'Wspólny mianownik, dopełnianie',
    description: 'Porównuj ułamki, szukaj równoważnych, dopełniaj do całości. Mianowniki do 12. Np. 2/3 vs 3/5, 4/8 = ?/4.',
    color: '#3b82f6',
    icon: FlaskConical,
    travelStartMs: 5500,
    travelMinMs: 3000,
    decayPerRoundMs: 90,
    taskKinds: ['compare', 'extend', 'complete'],
    answerOptions: 4,
  },
  {
    id: 'ulamki-dziesietne',
    index: 3,
    title: 'Ułamki zwykłe i dziesiętne',
    subtitle: 'Dodawanie, przeliczanie, mieszane',
    description: 'Dodawaj ułamki o różnych mianownikach, przeliczaj na dziesiętne. Np. 1/4 + 3/8, 0.25 z 2000, 2/5 + 1/10.',
    color: '#a855f7',
    icon: Beaker,
    travelStartMs: 5000,
    travelMinMs: 2500,
    decayPerRoundMs: 100,
    taskKinds: ['add', 'decimal'],
    answerOptions: 6,
  },
  {
    id: 'mix',
    index: 4,
    title: 'Wielka stacja',
    subtitle: 'Wszystko razem na zmianę',
    description: 'Najtrudniejszy poziom. Zadania losują się z całego programu — trzeba myśleć szybko i przełączać tryby.',
    color: '#f97316',
    icon: Gauge,
    travelStartMs: 4500,
    travelMinMs: 2200,
    decayPerRoundMs: 110,
    taskKinds: ['multiply', 'compare', 'extend', 'complete', 'add', 'decimal'],
    answerOptions: 8,
  },
];

export function getLevelById(id: LevelId): LevelConfig {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Nieznany poziom: ${id}`);
  return level;
}