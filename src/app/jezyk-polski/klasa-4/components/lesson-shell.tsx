'use client';

import type { ReactNode } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clapperboard,
  ClipboardCheck,
  HeartHandshake,
  HelpCircle,
  Lightbulb,
  MessagesSquare,
  PenLine,
  Scale,
  Search,
  Target,
  Volume2,
  type LucideIcon,
} from 'lucide-react';
import {
  BlockLessonShell,
  type BlockCourseConfig,
  type BlockMeta,
} from '@/components/block-lesson/block-lesson-shell';
import { readPolProgressEntry, writePolProgressEntry } from '../lib/progress-storage';
import { scheduleLessonSync } from '../lib/progress-sync';
import type { PolModule } from '../data/curriculum';
import type { PolLesson } from '../data/lessons';

export {
  LessonBlock,
  useBlockDone,
  useLessonProgress,
  useOptionalLessonProgress,
} from '@/components/block-lesson/block-lesson-shell';
export { useSectionScrollAnchor } from '@/components/ui/use-section-scroll-anchor';
export { Przypominajka } from '@/components/block-lesson/przypominajka';
export { useDragToken, DragGhost } from '@/components/block-lesson/use-drag-token';
export type { DragState } from '@/components/block-lesson/use-drag-token';

/**
 * Powłoka lekcji języka polskiego — nakładka na wspólną `BlockLessonShell`
 * (`@/components/block-lesson/`), tę samą, na której stoi informatyka i historia.
 * Kształt lekcji wynika z tematu: lekcja podaje własną listę bloków, a rodzaje
 * bierze z zamkniętej palety niżej.
 *
 * Tu zostaje tylko to, co należy do przedmiotu: paleta bloków
 * (bez `PracticeTask` — zasada samowystarczalności: dziecko przechodzi kurs
 * samo i tylko na stronie), magazyn postępu (`dociekai:pol-lesson:`) i sync, kurs
 * `polski` w serii nauki. Przypominajka (pytanie z poprzedniej lekcji)
 * wchodzi przez `entry` i **nie jest blokiem** — nie liczy się do postępu.
 */

/** Paleta bloków — lekcja wybiera z niej, nie dopisuje własnych. */
export const POL_BLOCK_KINDS = {
  haczyk: { label: 'Haczyk', icon: HelpCircle },
  tekst: { label: 'Tekst', icon: BookOpen },
  wyjasnienie: { label: 'Wyjaśnienie', icon: Lightbulb },
  odkrycie: { label: 'Odkrycie', icon: Search },
  scena: { label: 'Scena', icon: Clapperboard },
  rozmowa: { label: 'Rozmowa', icon: MessagesSquare },
  warsztat: { label: 'Warsztat', icon: PenLine },
  glos: { label: 'Głos', icon: Volume2 },
  dylemat: { label: 'Dylemat', icon: Scale },
  cwiczenie: { label: 'Ćwiczenie', icon: Target },
  zadanie: { label: 'Zadanie', icon: ClipboardCheck },
  quiz: { label: 'Quiz', icon: CheckCircle2 },
  refleksja: { label: 'Refleksja', icon: HeartHandshake },
} satisfies Record<string, { label: string; icon: LucideIcon }>;

export type PolBlockKind = keyof typeof POL_BLOCK_KINDS;

export type PolBlockMeta = BlockMeta<PolBlockKind>;

const POL_COURSE: BlockCourseConfig = {
  course: 'polski',
  courseLabel: 'Język polski',
  basePath: '/jezyk-polski/klasa-4',
  palette: POL_BLOCK_KINDS,
  readEntry: readPolProgressEntry,
  writeEntry: writePolProgressEntry,
  scheduleSync: scheduleLessonSync,
  funFactTeaser: 'Czeka na Ciebie ciekawostka o słowach.',
};

interface PolLessonShellProps {
  lesson: PolLesson;
  polModule: PolModule;
  /** Sekwencja bloków tej konkretnej lekcji — źródło numeracji i postępu. */
  blocks: PolBlockMeta[];
  nextLesson?: PolLesson;
  /** Tylko dla `kind: 'podsumowanie'` — kolejny dostępny moduł. */
  nextModule?: PolModule;
  /** Jedno zdanie o tym, co dziecko zrobiło właśnie w tej lekcji. */
  finishNote?: ReactNode;
  /** Karta Przypominajki (`<Przypominajka>`) — przed pierwszym blokiem, poza postępem. */
  entry?: ReactNode;
  children: ReactNode;
}

export function PolLessonShell({ polModule, ...rest }: PolLessonShellProps) {
  return <BlockLessonShell config={POL_COURSE} lessonModule={polModule} {...rest} />;
}
