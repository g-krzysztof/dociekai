/**
 * Karta projektu — lekka metryczka dzielona między blokami tej lekcji: co
 * dziecko buduje i dla kogo. Sama treść (pytania quizu albo siatka gry)
 * powstaje dopiero w zadaniu (`quiz-content.ts` / `game-content.ts`) — tutaj
 * jest tylko zapowiedź, żeby zadanie mogło przypomnieć plan z bloku 3.
 */

export type ProjectKind = 'quiz' | 'gra';

export interface ProjectPlan {
  kind: ProjectKind;
  temat: string;
  dlaKogo: string;
  zasada: string;
}

export const EMPTY_PLAN: ProjectPlan = {
  kind: 'quiz',
  temat: '',
  dlaKogo: '',
  zasada: '',
};

export function isPlanComplete(plan: ProjectPlan): boolean {
  return plan.temat.trim() !== '' && plan.dlaKogo.trim() !== '' && plan.zasada.trim() !== '';
}
