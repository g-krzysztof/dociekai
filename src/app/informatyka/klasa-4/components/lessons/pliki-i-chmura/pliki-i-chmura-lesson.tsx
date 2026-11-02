'use client';

import Image from 'next/image';
import { Cloud, FolderTree, ListChecks, Tag } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { PracticeTask } from '../../practice-task';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { FindInMess } from './find-in-mess';
import { FilenameAnatomy } from './filename-anatomy';
import { TidyDesktop } from './tidy-desktop';
import { LocalOrCloud } from './local-or-cloud';
import { NamingRule } from './naming-rule';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Lekcja o plikach, folderach i chmurze — siódma zbudowana w kursie i pierwsza,
 * której centralnym blokiem jest pełny symulator (makieta menedżera plików).
 * Domyka moduł 1: bez tej umiejętności — nazwać, poukładać i świadomie zapisać
 * własną pracę — reszta kursu nie ma się gdzie odkładać. Realizuje `[3.7]`.
 *
 * Kształt: haczyk (znajdź plik w bałaganie) → wyjaśnienie (nazwa i rozszerzenie)
 * → symulator (uporządkuj pulpit) → ćwiczenie (lokalnie czy w chmurze) →
 * zadanie praktyczne (zrób porządek u siebie) → refleksja (twoja zasada
 * nazywania). Symulator i refleksja są bez ilustracji — makieta systemu i sama
 * kartka niosą się bez niej.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/pliki-i-chmura/porzadek-w-folderach.jpg',
  balagan: '/images/informatyka/lekcje/pliki-i-chmura/balagan-na-biurku.jpg',
  metka: '/images/informatyka/lekcje/pliki-i-chmura/metka-na-teczce.jpg',
  dwaMiejsca: '/images/informatyka/lekcje/pliki-i-chmura/laptop-i-telefon.jpg',
  szuflada: '/images/informatyka/lekcje/pliki-i-chmura/szuflada-z-teczkami.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'balagan',
    kind: 'haczyk',
    title: 'Znajdź plik w tym bałaganie',
    time: '4 min',
  },
  {
    id: 'nazwa',
    kind: 'wyjasnienie',
    title: 'Nazwa, kropka, rozszerzenie',
    time: '6 min',
    icon: Tag,
  },
  {
    id: 'pulpit',
    kind: 'symulator',
    title: 'Uporządkuj pulpit',
    time: '6 min',
    icon: FolderTree,
  },
  {
    id: 'gdzie-zapisac',
    kind: 'cwiczenie',
    title: 'Ten sam plik, dwa miejsca',
    time: '6 min',
    icon: Cloud,
  },
  {
    id: 'zadanie',
    kind: 'zadanie',
    title: 'Zrób porządek u siebie',
    time: '12 min',
    icon: ListChecks,
  },
  {
    id: 'zasada',
    kind: 'refleksja',
    title: 'Twoja zasada nazywania plików',
    time: '3 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function PlikiIChmuraLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Plik z porządną nazwą, we właściwym folderze i z drugą kopią w innym miejscu — to jest to, czego się już nie gubi. Od tej lekcji każda twoja praca w kursie ma tak wyglądać."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const mess = useBlockDone('balagan');
  const name = useBlockDone('nazwa');
  const desktop = useBlockDone('pulpit');
  const where = useBlockDone('gdzie-zapisac');
  const task = useBlockDone('zadanie');
  const rule = useBlockDone('zasada');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="balagan">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.balagan}
          alt="Sterta luźnych, niczym nieopisanych kartek rozsypana po drewnianym biurku, część zsuwa się na podłogę"
          lead="Plik bez dobrej nazwy jest jak kartka bez podpisu — wiesz, że gdzieś jest, ale nie który to."
        >
          Najpierw spróbuj znaleźć konkretny plik w cudzym folderze. Nie uda się — i właśnie po to
          jest ten blok.
        </LessonImageCard>
        <FindInMess color={color} onComplete={mess.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="nazwa">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.metka}
          alt="Tekturowa teczka z pustą papierową metką wsuniętą w kieszonkę na grzbiecie, obok ołówek"
        >
          <p>
            Nazwa pliku to nie tylko to, co wpiszesz. Po <strong>kropce</strong> idzie{' '}
            <strong>rozszerzenie</strong> — kilka liter, po których komputer poznaje, co to za plik i
            jaki program go otworzy. Rozwiń każde z sześciu najczęstszych.
          </p>
        </LessonImageCard>
        <FilenameAnatomy color={color} onComplete={name.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="pulpit">
        <TidyDesktop color={color} onComplete={desktop.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="gdzie-zapisac">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.dwaMiejsca}
          alt="Laptop i telefon leżą obok siebie na biurku, nad nimi przypięta do korkowej tablicy chmurka wycięta z papieru"
          lead="Ten sam plik może leżeć w dwóch miejscach naraz — na twoim sprzęcie i w chmurze."
          reverse
        >
          Każde z tych miejsc coś daje i czegoś wymaga. Rozstrzygnij pięć sytuacji: gdzie zapisać
          plik, żeby był wtedy, kiedy go potrzebujesz.
        </LessonImageCard>
        <LocalOrCloud color={color} onComplete={where.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zadanie">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.szuflada}
          alt="Otwarta szuflada biurka z równo ustawionymi wiszącymi teczkami z pustymi, nieopisanymi zakładkami"
          reverse
        >
          <p>
            Teraz to samo, ale u ciebie: <strong>załóż foldery</strong>, ponazywaj pliki po ludzku i
            zapisz jeden z nich w dwóch miejscach. To pięć minut, które oszczędzi ci potem godzin
            szukania.
          </p>
        </LessonImageCard>
        <PracticeTask
          color={color}
          onComplete={task.markBlockDone}
          brief={
            <>
              <strong>Zrób porządek w swoim folderze na ten kurs</strong> i zapisz jeden plik
              lokalnie oraz w chmurze. Jeśli nie masz jeszcze konta w żadnej chmurze — zrób część
              „lokalnie”, a chmurę odhacz, gdy założysz konto z rodzicem.
            </>
          }
          sections={[
            {
              label: 'Załóż foldery',
              items: [
                'Mam na komputerze folder „Informatyka 4” (z pierwszej lekcji — albo zakładam go teraz).',
                'W środku zrobiłem/zrobiłam podfoldery na rodzaje prac, np. „notatki” i „rysunki”.',
                'Potrafię powiedzieć, gdzie ten folder leży — ścieżkę do niego (np. Dokumenty → Informatyka 4).',
              ],
            },
            {
              label: 'Ponazywaj pliki po ludzku',
              items: [
                'Każdy plik z tego kursu ma nazwę, która mówi, co jest w środku i z kiedy pochodzi.',
                'Żaden nie nazywa się „bez tytułu”, „Nowy dokument (2)” ani „1”.',
                'Zmieniając nazwę, nie ruszałem/ruszałam rozszerzenia po kropce.',
              ],
            },
            {
              label: 'Zapisz jeden plik w dwóch miejscach',
              items: [
                'Jeden plik z kursu mam zapisany lokalnie, w folderze „Informatyka 4”.',
                'Ten sam plik wrzuciłem/wrzuciłam do chmury (Dysk Google, OneDrive albo iCloud).',
                'Otworzyłem/otworzyłam go z chmury w przeglądarce, żeby sprawdzić, że naprawdę tam jest.',
              ],
            },
          ]}
          hint={
            <>
              <strong>Chmury do wyboru:</strong> Dysk Google (drive.google.com), OneDrive
              (onedrive.com) albo iCloud Drive na sprzęcie Apple — do każdej trzeba mieć konto,
              więc zakładaj je z rodzicem. Ścieżkę do folderu podejrzysz w pasku adresu okna, gdy
              masz go otwarty. Jeśli program pyta „Zapisz jako”, sam/sama wybierasz folder — nie
              zostawiaj domyślnego „Pobrane”.
            </>
          }
          doneText="Masz foldery, sensowne nazwy i jeden plik w dwóch miejscach. Tak wygląda praca, której się nie gubi — i tak od teraz zapisujesz wszystko w tym kursie."
        />
      </LessonBlock>

      <LessonBlock id="zasada">
        <NamingRule color={color} onComplete={rule.markBlockDone} />
      </LessonBlock>
    </>
  );
}

/**
 * Wejście w lekcję: pytanie, na które odpowiada, i plan bloków dla ekranów bez
 * bocznej szyny. Bez numeru — nie jest blokiem, więc nie liczy się do postępu.
 */
function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Zrobiłeś/zrobiłaś już w tym module kilka notatek. Ta lekcja jest o tym, żeby{' '}
          <strong>dało się je potem znaleźć</strong>: jak nazwać plik, żeby nazwa sama mówiła, co w
          nim jest, jak poukładać pliki w folderach i gdzie je zapisać — na swoim sprzęcie, w
          chmurze, czy w obu miejscach naraz.
        </p>
        <p className="mt-3">
          To ostatnia lekcja modułu 1 i zarazem umiejętność, bez której reszta kursu nie ma się
          gdzie odkładać. Na koniec zrobisz prawdziwy porządek w swoim folderze na kurs.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Drewniany stojak na biurku z równo ustawionymi tekturowymi teczkami z pustymi metkami, obok zamknięty laptop"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>

        {/* Plan tej lekcji — dla ekranów bez bocznej szyny; powyżej `lg` szyna go dubluje. */}
        <div className="lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Plan tej lekcji
          </p>
          <ol className="space-y-2">
            {BLOCKS.map((block, index) => (
              <li key={block.id} className="flex items-start gap-3">
                <span
                  className="w-5 shrink-0 font-mono text-sm font-bold tabular-nums"
                  style={{ color }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 text-sm leading-snug">
                  <span className="block font-medium">{BLOCK_KINDS[block.kind].label}</span>
                  <span className="block text-xs text-muted-foreground">{block.time}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
