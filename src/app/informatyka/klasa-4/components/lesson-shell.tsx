'use client';

import type { ReactNode } from 'react';
import {
  Bug,
  CheckCircle2,
  ClipboardCheck,
  HeartHandshake,
  HelpCircle,
  Lightbulb,
  MonitorPlay,
  Scale,
  Search,
  SlidersHorizontal,
  Target,
  type LucideIcon,
} from 'lucide-react';
import {
  BlockLessonShell,
  type BlockCourseConfig,
  type BlockMeta,
} from '@/components/block-lesson/block-lesson-shell';
import {
  readInfoProgressEntry,
  writeInfoProgressEntry,
} from '../lib/progress-storage';
import { scheduleLessonSync } from '../lib/progress-sync';
import type { InfoModule } from '../data/curriculum';
import type { InfoLesson } from '../data/lessons';

export {
  LessonBlock,
  useBlockDone,
  useLessonProgress,
} from '@/components/block-lesson/block-lesson-shell';
/** Widżety wielorundowe tego kursu importują kotwicę stąd, tak jak w matematyce. */
export { useSectionScrollAnchor } from '@/components/ui/use-section-scroll-anchor';

/**
 * Powłoka lekcji informatyki — nakładka na wspólną `BlockLessonShell`
 * (`@/components/block-lesson/`, wypromowana 2026-09-25 przy drugim konsumencie,
 * kursie historii). Tu zostaje tylko to, co należy do przedmiotu: paleta bloków,
 * magazyn postępu i sync, identyfikator serii. Eksporty są te same co przed
 * promocją, więc 38 lekcji nie zmieniło ani jednego importu.
 *
 *
 * Świadomie NIE jest kopią `LessonShell` z matematyki. Tamta powłoka realizuje
 * jeden sztywny rytm (rozgrzewka → nowe pojęcie → … → quiz) wspólny dla każdej
 * lekcji kursu. W informatyce kształt lekcji wynika z tematu, więc powłoka
 * przyjmuje **listę bloków zdefiniowaną przez samą lekcję** — dowolnej długości
 * i w dowolnej kolejności. Paleta dostępnych rodzajów bloków (`BLOCK_KINDS`)
 * stoi tutaj, sekwencja stoi w komponencie lekcji.
 *
 * Wspólne dla wszystkich lekcji jest tylko to, co obiecuje hub kursu: zapowiedź
 * tematu i czasu na wejściu, ponumerowane bloki (z nich liczy się postęp) i
 * zakończenie czymś, co dziecko zrobiło samo.
 *
 * Zadanie praktyczne ma trzy modele i **nowe pisz się w trzecim**:
 *
 * 1. `PracticeTask` — lista kontrolna, w której dziecko odhacza własną pracę.
 *    Stoi jeszcze w kilkunastu lekcjach, wszędzie tam, gdzie praca nie zostawia
 *    po sobie żadnego dowodu (rozmowa z rodzicem, ustawienie biurka).
 * 2. `ProofTask` z plikiem — model historyczny, skasowany 2026-09-24 razem
 *    z ostatnim odbiorem plikiem: dziecko wracało z cudzego programu z plikiem,
 *    a strona czytała go w przeglądarce. Nie wracać do niego.
 * 3. **Zadanie wykonywane w lekcji** — trójka etapów (zlecenie z jawnymi
 *    kryteriami → praca → werdykt), a warsztatem jest strona. Powłoka:
 *    `TaskShell`; edytor dokumentów: `MiniWriter`; silnik i edytor Scratcha:
 *    `components/scratch/`. Wzorce dokumentowe: `RecipeStudio`
 *    (`podzial-tekstu`), `SamplerStudio` (`czcionki-i-zasady-pisania`),
 *    `NoticeStudio` (`akapity-i-listy`).
 *
 * Powód trzeciego modelu jest decyzją użytkownika z 2026-09-19 i jest krótki:
 * odbiór plikiem **wyrzuca dziecko z kursu** (wyjdź do cudzego programu, zrób,
 * zapisz, znajdź plik, wróć) i jest kruchy — połowa prób rozbija się nie
 * o zadanie, tylko o „Zapisz jako”. Zanim zaprojektujesz zadanie praktyczne,
 * policz, **ile osobnych umiejętności spoza tematu lekcji wymaga od dziecka**.
 */

/** Paleta bloków — lekcja wybiera z niej, nie dopisuje własnych. */
export const BLOCK_KINDS = {
  haczyk: { label: 'Haczyk', icon: HelpCircle },
  wyjasnienie: { label: 'Wyjaśnienie', icon: Lightbulb },
  pokaz: { label: 'Pokaz krok po kroku', icon: MonitorPlay },
  symulator: { label: 'Symulator', icon: SlidersHorizontal },
  cwiczenie: { label: 'Ćwiczenie', icon: Target },
  zadanie: { label: 'Zadanie praktyczne', icon: ClipboardCheck },
  dylemat: { label: 'Dylemat', icon: Scale },
  debugowanie: { label: 'Debugowanie', icon: Bug },
  zrodla: { label: 'Wyszukiwanie w źródłach', icon: Search },
  quiz: { label: 'Mini-quiz', icon: CheckCircle2 },
  refleksja: { label: 'Refleksja', icon: HeartHandshake },
} satisfies Record<string, { label: string; icon: LucideIcon }>;

export type LessonBlockKind = keyof typeof BLOCK_KINDS;

export type LessonBlockMeta = BlockMeta<LessonBlockKind>;

const INFO_COURSE: BlockCourseConfig = {
  course: 'informatyka',
  courseLabel: 'Informatyka',
  basePath: '/informatyka/klasa-4',
  palette: BLOCK_KINDS,
  readEntry: readInfoProgressEntry,
  writeEntry: writeInfoProgressEntry,
  scheduleSync: scheduleLessonSync,
  funFactTeaser: 'Czeka na Ciebie ciekawostka ze świata komputerów.',
};

interface InfoLessonShellProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  /** Sekwencja bloków tej konkretnej lekcji — źródło numeracji i postępu. */
  blocks: LessonBlockMeta[];
  nextLesson?: InfoLesson;
  /** Tylko dla `kind: 'podsumowanie'` — kolejny dostępny moduł. */
  nextModule?: InfoModule;
  /**
   * Zdanie w kartce końcowej. Domyślne jest celowo o samej pracy dziecka —
   * lekcje różnią się tematem, więc konkret („co ustawisz przy biurku”)
   * podaje lekcja, a nie powłoka.
   */
  finishNote?: ReactNode;
  children: ReactNode;
}

export function InfoLessonShell({ infoModule, ...rest }: InfoLessonShellProps) {
  return <BlockLessonShell config={INFO_COURSE} lessonModule={infoModule} {...rest} />;
}
