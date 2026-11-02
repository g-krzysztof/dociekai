'use client';

import type { ReactNode } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  HeartHandshake,
  HelpCircle,
  History,
  Lightbulb,
  Map as MapIcon,
  Scale,
  ScrollText,
  Search,
  SlidersHorizontal,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  BlockLessonShell,
  type BlockCourseConfig,
  type BlockMeta,
} from '@/components/block-lesson/block-lesson-shell';
import { readHistProgressEntry, writeHistProgressEntry } from '../lib/progress-storage';
import { scheduleLessonSync } from '../lib/progress-sync';
import type { HistModule } from '../data/curriculum';
import type { HistLesson } from '../data/lessons';

export {
  LessonBlock,
  useBlockDone,
  useLessonProgress,
  useOptionalLessonProgress,
} from '@/components/block-lesson/block-lesson-shell';
export { useSectionScrollAnchor } from '@/components/ui/use-section-scroll-anchor';

/**
 * Powłoka lekcji historii — nakładka na wspólną `BlockLessonShell`
 * (`@/components/block-lesson/`), tę samą, na której stoi informatyka.
 * Kształt lekcji wynika z tematu: lekcja podaje własną listę bloków, a rodzaje
 * bierze z zamkniętej palety niżej.
 *
 * Tu zostaje tylko to, co należy do przedmiotu: paleta bloków, magazyn postępu (`dociekai:hist-lesson:`) i sync, kurs
 * `historia` w serii nauki. Przypominajka (pytanie z lekcji 1, 3 albo 8 wstecz)
 * wchodzi przez `entry` i **nie jest blokiem** — nie liczy się do postępu.
 */

/** Paleta bloków — lekcja wybiera z niej, nie dopisuje własnych. */
export const HIST_BLOCK_KINDS = {
  haczyk: { label: 'Haczyk', icon: HelpCircle },
  wyjasnienie: { label: 'Wyjaśnienie', icon: Lightbulb },
  zrodlo: { label: 'Źródło', icon: ScrollText },
  mapa: { label: 'Mapa', icon: MapIcon },
  'os-czasu': { label: 'Oś czasu', icon: History },
  symulator: { label: 'Symulator', icon: SlidersHorizontal },
  sledztwo: { label: 'Śledztwo', icon: Search },
  perspektywy: { label: 'Perspektywy', icon: Users },
  dylemat: { label: 'Dylemat', icon: Scale },
  cwiczenie: { label: 'Ćwiczenie', icon: Target },
  zadanie: { label: 'Zadanie praktyczne', icon: ClipboardCheck },
  quiz: { label: 'Quiz', icon: CheckCircle2 },
  refleksja: { label: 'Refleksja', icon: HeartHandshake },
} satisfies Record<string, { label: string; icon: LucideIcon }>;

export type HistBlockKind = keyof typeof HIST_BLOCK_KINDS;

export type HistBlockMeta = BlockMeta<HistBlockKind>;

const HIST_COURSE: BlockCourseConfig = {
  course: 'historia',
  courseLabel: 'Historia',
  basePath: '/historia/klasa-4',
  palette: HIST_BLOCK_KINDS,
  readEntry: readHistProgressEntry,
  writeEntry: writeHistProgressEntry,
  scheduleSync: scheduleLessonSync,
  funFactTeaser: 'Czeka na Ciebie ciekawostka z dawnych czasów.',
};

interface HistLessonShellProps {
  lesson: HistLesson;
  histModule: HistModule;
  /** Sekwencja bloków tej konkretnej lekcji — źródło numeracji i postępu. */
  blocks: HistBlockMeta[];
  nextLesson?: HistLesson;
  /** Tylko dla `kind: 'podsumowanie'` — kolejny dostępny moduł. */
  nextModule?: HistModule;
  /** Jedno zdanie o tym, co dziecko zrobiło właśnie w tej lekcji. */
  finishNote?: ReactNode;
  /** Karta Przypominajki (`<Przypominajka>`) — przed pierwszym blokiem, poza postępem. */
  entry?: ReactNode;
  children: ReactNode;
}

export function HistLessonShell({ histModule, ...rest }: HistLessonShellProps) {
  return <BlockLessonShell config={HIST_COURSE} lessonModule={histModule} {...rest} />;
}
