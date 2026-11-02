import type { RotationStyle } from './engine';

/**
 * Program w mini-Scratchu — kształt, w którym sędziowie modułu 6 czytali plik
 * `.sb3`, a dziś czytają pracę złożoną na stronie (`blocks-to-project.ts`).
 * Sędzia nie wie, skąd program przyszedł, i nie ma prawa się tego domyślać.
 */

export interface ScratchStep {
  opcode: string;
  /** Napis klocka, po polsku — tak, jak dziecko widzi go w makiecie. */
  label: string;
  /** Treść dymka — tylko dla „powiedz” i „pomyśl”, bo werdykt cytuje ją dziecku. */
  text?: string;
  /**
   * Surowe wartości pól klocka (`STEPS`, `X`, `Y`, `DIRECTION`, `STYLE`…).
   * Werdykty czytają je stąd zamiast wyłuskiwać liczby z gotowej etykiety.
   */
  values: Record<string, string>;
  /** Warunek z sześciokątnego pola klocka „jeżeli … to”, po polsku. */
  condition?: string;
  /** Opcode klocka w warunku — werdykty pytają o czujnik, nie o napis. */
  conditionOpcode?: string;
  /**
   * Wnętrze klocka obejmującego („powtórz”, „zawsze”, „jeżeli”). Bez tego skrypt
   * spacerujący wyglądałby jak pusta pętla i werdykt orzekłby „brak ruchu”.
   */
  inner?: ScratchStep[];
}

export interface ScratchStack {
  owner: string;
  isStage: boolean;
  /** Opcode kapelusza albo `null`, gdy stos zaczyna się zwykłym klockiem (czyli leży luzem). */
  hat: string | null;
  steps: ScratchStep[];
}

export interface ScratchCostume {
  name: string;
  /** Obrazek gotowy do wyświetlenia (`data:` albo adres w stronie). */
  src: string | null;
  /** Domyślny Kot ze Scratcha — jedyny kostium, o którym wiemy na pewno, że nie jest własny. */
  isDefaultCat: boolean;
}

export interface ScratchSprite {
  name: string;
  x: number;
  y: number;
  direction: number;
  /** Czy duszek jest widoczny **na starcie programu** — bez tego „pojawia się” nic nie znaczy. */
  visible: boolean;
  /** Styl obrotu ustawiony **w panelu duszka** — nie ten z klocka w skrypcie. */
  rotationStyle: RotationStyle;
  costumes: ScratchCostume[];
}

export interface ScratchProject {
  title: string;
  sprites: ScratchSprite[];
  stacks: ScratchStack[];
  /** Stos wybrany do oceny: ten spod zielonej flagi. */
  main: ScratchStack | null;
}

/** Program bez śladu po pliku — po polach pliku (`title`, nazwa, wersja) nic w kursie nie pyta. */
export type ScratchProgram = Pick<ScratchProject, 'sprites' | 'stacks' | 'main'>;

/** Czujnik pytający o klawisz — po nim poznajemy program, którym da się sterować. */
export const KEY_SENSOR = 'sensing_keypressed';

/** Wszystkie kroki skryptu, razem z wnętrzem pętli — werdykty liczą na tej liście. */
export function flatSteps(steps: ScratchStep[]): ScratchStep[] {
  return steps.flatMap((step) => [step, ...(step.inner ? flatSteps(step.inner) : [])]);
}
