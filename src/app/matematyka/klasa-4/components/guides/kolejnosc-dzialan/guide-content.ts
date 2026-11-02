import type { GuideActMeta } from '../guide-act';
import type { SolveStep } from './expression-solver';

/**
 * Wszystkie akty na `flow` (2026-08-12) — żaden nigdy nie używał
 * `useActProgress`/`useActStep`; `<ExpressionSolver>` jest jawnie
 * klikane-krok-po-kroku (patrz jego własny komentarz), nie scrubowane
 * scrollem, więc `stage` tylko generował puste, przyklejone ekrany. Ten sam
 * fix co w `jednostki-miary`.
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Który wynik jest prawdziwy?', mode: 'flow' },
  { id: 'nawiasy', label: 'Nawiasy najpierw', mode: 'flow' },
  { id: 'mnozenie-i-dzielenie', label: 'Mnożenie i dzielenie', mode: 'flow' },
  { id: 'od-lewej', label: 'Od lewej do prawej', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół ciebie', mode: 'flow' },
];

const num = (id: string, text: string): { id: string; text: string; type: 'number' } => ({
  id,
  text,
  type: 'number',
});
const op = (id: string, text: string): { id: string; text: string; type: 'operator' } => ({
  id,
  text,
  type: 'operator',
});

/** (2 + 3) × 4 — akt „Nawiasy najpierw". */
export const PARENS_STEPS: SolveStep[] = [
  {
    tokens: [op('p1', '('), num('n2', '2'), op('o1', '+'), num('n3', '3'), op('p2', ')'), op('o2', '×'), num('n4', '4')],
    activeIds: ['p1', 'n2', 'o1', 'n3', 'p2'],
    hint: 'Nawiasy liczymy zawsze najpierw — nieważne, co jest w środku.',
  },
  {
    tokens: [num('r1', '5'), op('o2', '×'), num('n4', '4')],
    activeIds: ['r1', 'o2', 'n4'],
    hint: 'Nawias zniknął, została jedna liczba — teraz zostało tylko mnożenie.',
  },
  { tokens: [num('r2', '20')], activeIds: [] },
];

/** 2 + 3 × 4 — akt „Mnożenie i dzielenie". Ten sam przykład co w akcie otwierającym. */
export const PRECEDENCE_STEPS: SolveStep[] = [
  {
    tokens: [num('n2', '2'), op('o1', '+'), num('n3', '3'), op('o2', '×'), num('n4', '4')],
    activeIds: ['n3', 'o2', 'n4'],
    hint: 'Mnożenie i dzielenie liczymy przed dodawaniem i odejmowaniem — nawet jeśli w zapisie są dalej.',
  },
  {
    tokens: [num('n2', '2'), op('o1', '+'), num('r1', '12')],
    activeIds: ['n2', 'o1', 'r1'],
    hint: 'Zostało już tylko dodawanie.',
  },
  { tokens: [num('r2', '14')], activeIds: [] },
];

/** 20 − 5 + 3 — pierwsza para w akcie „Od lewej do prawej". */
export const LEFT_TO_RIGHT_ADD_STEPS: SolveStep[] = [
  {
    tokens: [num('n20', '20'), op('o1', '−'), num('n5', '5'), op('o2', '+'), num('n3', '3')],
    activeIds: ['n20', 'o1', 'n5'],
    hint: 'Dodawanie i odejmowanie mają ten sam priorytet — liczymy je od lewej do prawej.',
  },
  {
    tokens: [num('r1', '15'), op('o2', '+'), num('n3', '3')],
    activeIds: ['r1', 'o2', 'n3'],
    hint: 'Teraz ostatni krok.',
  },
  { tokens: [num('r2', '18')], activeIds: [] },
];

/** 12 : 4 × 3 — druga para w akcie „Od lewej do prawej", tym razem mnożenie i dzielenie. */
export const LEFT_TO_RIGHT_MUL_STEPS: SolveStep[] = [
  {
    tokens: [num('n12', '12'), op('o1', ':'), num('n4', '4'), op('o2', '×'), num('n3', '3')],
    activeIds: ['n12', 'o1', 'n4'],
    hint: 'Dzielenie i mnożenie też liczymy od lewej do prawej.',
  },
  {
    tokens: [num('r1', '3'), op('o2', '×'), num('n3', '3')],
    activeIds: ['r1', 'o2', 'n3'],
    hint: 'Teraz mnożenie.',
  },
  { tokens: [num('r2', '9')], activeIds: [] },
];

/** 2 × (3 + 4) − 5 — finałowy przykład łączący wszystkie trzy zasady naraz. */
export const FINALE_STEPS: SolveStep[] = [
  {
    tokens: [
      num('n2', '2'),
      op('o1', '×'),
      op('p1', '('),
      num('n3', '3'),
      op('o2', '+'),
      num('n4', '4'),
      op('p2', ')'),
      op('o3', '−'),
      num('n5', '5'),
    ],
    activeIds: ['p1', 'n3', 'o2', 'n4', 'p2'],
    hint: 'Zaczynamy tak jak zawsze — od nawiasu.',
  },
  {
    tokens: [num('n2', '2'), op('o1', '×'), num('r1', '7'), op('o3', '−'), num('n5', '5')],
    activeIds: ['n2', 'o1', 'r1'],
    hint: 'Teraz mnożenie przed odejmowaniem.',
  },
  {
    tokens: [num('r2', '14'), op('o3', '−'), num('n5', '5')],
    activeIds: ['r2', 'o3', 'n5'],
    hint: 'Na końcu odejmowanie.',
  },
  { tokens: [num('r3', '9')], activeIds: [] },
];

export const RULES: string[] = [
  'Nawiasy liczymy zawsze najpierw — nieważne, co w nich jest.',
  'Mnożenie i dzielenie liczymy przed dodawaniem i odejmowaniem.',
  'Działania o tym samym priorytecie liczymy od lewej do prawej.',
];

export const REAL_LIFE_EXAMPLES: string[] = [
  'Kalkulator naukowy w telefonie sam stosuje tę kolejność — prosty kalkulator kasowy czasem nie.',
  'Arkusz kalkulacyjny i każdy język programowania komputerowego też jej przestrzegają.',
  'Paragon ze sklepu: 3 razy 4 złote plus 2 złote dostawy to nie to samo, co dodanie wszystkiego od lewej bez zastanowienia.',
  'Nauczyciel podkreślający w zeszycie: „najpierw nawias!”',
];
