'use client';

import Image from 'next/image';
import { Copy, Keyboard, Scissors } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { PracticeTask } from '../../practice-task';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { RepeatFinder } from './repeat-finder';
import { ShortcutShow } from './shortcut-show';
import { TurnPuzzle } from './turn-puzzle';
import { CloverBench } from './clover-bench';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Druga lekcja modułu 3 i piętnasty kształt lekcji w kursie. Realizuje temat
 * „zaznaczanie fragmentu — kopiowanie, wklejanie, obracanie i odbicie
 * lustrzane” i niesie **zadanie obowiązkowe Z-5** (czterolistna koniczyna).
 *
 * Lekcja jako pierwsza w kursie sięga po blok `pokaz` — z całej palety
 * nietknięty zostaje po niej już tylko `quiz`. Cztery
 * bloki to cztery różne rodzaje roboty palcami, żaden nie jest „wybierz opcję,
 * przeczytaj wyjaśnienie”:
 *  - `RepeatFinder` — dziecko przeciąga ramkę po gotowym wzorze, a maszyna
 *    **naprawdę składa rysunek z tego, co zostało zaznaczone**;
 *  - `ShortcutShow` — pokaz krok po kroku, w którym prawdziwe `Ctrl+C`,
 *    `Ctrl+V`, strzałki i `Ctrl+Z` naciska dziecko, nie strona;
 *  - `TurnPuzzle` — układanka na ośmiu ustawieniach jednego kształtu; przy
 *    jednym celu obrót nigdy nie wystarczy i wychodzi to z samego kręcenia;
 *  - `CloverBench` — warsztat z **wyłączonym ołówkiem**: koniczynę da się
 *    zrobić wyłącznie kopiowaniem i obrotem, a po drodze czeka pułapka
 *    nieprzezroczystego wklejenia.
 *
 * Piąty blok to Z-5 w prawdziwym programie — w pełnym brzmieniu z
 * programu, z listą kontrolną rozbitą na osobne pozycje.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/kopiowanie-i-obracanie/foremka-i-krazki.jpg',
  wzor: '/images/informatyka/lekcje/kopiowanie-i-obracanie/sniezynka-i-zlozony-papier.jpg',
  lustro: '/images/informatyka/lekcje/kopiowanie-i-obracanie/lusterko-i-but.jpg',
  wiatraczek: '/images/informatyka/lekcje/kopiowanie-i-obracanie/wiatraczek.jpg',
  koniczyna: '/images/informatyka/lekcje/kopiowanie-i-obracanie/koniczyna-na-desce.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'jeden-kawalek',
    kind: 'haczyk',
    title: 'Jeden kawałek, cały rysunek',
    time: '6 min',
    icon: Scissors,
  },
  {
    id: 'szesc-ruchow',
    kind: 'pokaz',
    title: 'Sześć ruchów i trzy skróty',
    time: '7 min',
    icon: Keyboard,
  },
  {
    id: 'obrot-czy-odbicie',
    kind: 'cwiczenie',
    title: 'Obrót czy odbicie?',
    time: '5 min',
  },
  {
    id: 'koniczyna-na-ekranie',
    kind: 'symulator',
    title: 'Koniczyna bez rysowania',
    time: '7 min',
    icon: Copy,
  },
  {
    id: 'koniczyna-z5',
    kind: 'zadanie',
    title: 'Czterolistna koniczyna w prawdziwym programie',
    time: '10 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function KopiowanieIObracanieLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Rozłożyłeś/rozłożyłaś trzy wzory na kawałki, wyklikałeś/wyklikałaś sześć ruchów prawdziwymi skrótami, ustawiłeś/ustawiłaś rybkę na pięć sposobów i złożyłeś/złożyłaś koniczynę bez rysowania drugiego listka. Zdanie na resztę życia z komputerem: jeśli coś w twoim rysunku powtarza się dwa razy, narysowałeś/narysowałaś to o jeden raz za dużo."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const finder = useBlockDone('jeden-kawalek');
  const show = useBlockDone('szesc-ruchow');
  const puzzle = useBlockDone('obrot-czy-odbicie');
  const bench = useBlockDone('koniczyna-na-ekranie');
  const task = useBlockDone('koniczyna-z5');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="jeden-kawalek">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wzor}
          alt="Wycięta z białego papieru śnieżynka leży rozłożona na jasnym blacie, a obok niej ten sam papier złożony w wąski trójkątny klin z powycinanymi wzdłuż krawędzi wcięciami i małe nożyczki"
          lead="Jedno cięcie nożyczkami. Osiem takich samych ramion."
        >
          Papierowej śnieżynki nikt nie wycina ramię po ramieniu — składa się kartkę i tnie raz.
          Rysunki na komputerze powstają tak samo. Zanim poznasz narzędzia, znajdź w trzech
          rysunkach ten jeden kawałek, z którego zrobiono całą resztę.
        </LessonImageCard>
        <RepeatFinder color={color} onComplete={finder.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="szesc-ruchow">
        <ShortcutShow color={color} onComplete={show.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="obrot-czy-odbicie">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.lustro}
          alt="Okrągłe lusterko w jasnej drewnianej oprawie stoi na drewnianym blacie, przed nim brązowy dziecięcy bucik zwrócony noskiem w prawo, a w lustrze widać ten sam bucik zwrócony noskiem w lewo"
          reverse
        >
          <p>
            W menu edytora grafiki „obróć” i „odbij” leżą obok siebie i wyglądają na to samo.{' '}
            <strong>Nie są.</strong> Obróć bucik dookoła, ile chcesz — lewy nigdy nie zamieni się w
            prawy. Zrobi to dopiero lustro. Sprawdź to na rybce.
          </p>
        </LessonImageCard>
        <TurnPuzzle color={color} onComplete={puzzle.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="koniczyna-na-ekranie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wiatraczek}
          alt="Papierowy wiatraczek na gładkim drewnianym patyku wbitym w ziemię, jego jednakowe ramiona rozstawione są równo dookoła środkowej osi, w tle rozmyta zielona łąka"
          lead="Jedno ramię, cztery razy przestawione dookoła."
          reverse
        >
          Teraz to samo, co robisz za chwilę w prawdziwym programie — czterolistna koniczyna z
          jednego listka. Ołówek w tym warsztacie jest wyłączony: drugiego listka nie narysujesz,
          musisz go skopiować i obrócić.
        </LessonImageCard>
        <CloverBench color={color} onComplete={bench.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="koniczyna-z5">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.koniczyna}
          alt="Czterolistna koniczyna leży na szarej, zwietrzałej desce, jej cztery sercowate listki rozchodzą się równo dookoła jednej łodyżki, obok kilka zwykłych trójlistnych koniczyn i krople rosy"
        >
          <p>
            Czterolistna koniczyna jest zbudowana dokładnie tak, jak lubi komputer:{' '}
            <strong>jeden listek powtórzony cztery razy, za każdym razem obrócony o ćwierć</strong>.
            Zrób ją w prawdziwym edytorze grafiki — i nie rysuj czterech listków.
          </p>
        </LessonImageCard>
        <PracticeTask
          color={color}
          onComplete={task.markBlockDone}
          brief={
            <>
              <strong>Wykonaj rysunek czterolistnej koniczyny.</strong> Skorzystaj z możliwości
              zwielokrotniania fragmentu rysunku oraz jego obracania.
            </>
          }
          sections={[
            {
              label: 'Jeden listek',
              items: [
                'Narysowałem/narysowałam JEDEN listek — i na tym skończyłem/skończyłam rysowanie.',
                'Zaznaczyłem/zaznaczyłam ten listek prostokątną ramką, ciasno wokół niego.',
                'Skopiowałem/skopiowałam zaznaczenie (Ctrl+C).',
              ],
            },
            {
              label: 'Zwielokrotnianie i obracanie',
              items: [
                'Wkleiłem/wkleiłam kopię (Ctrl+V) i przesunąłem/przesunęłam ją na swoje miejsce.',
                'Obróciłem/obróciłam wklejony listek o 90°, żeby pasował do swojej strony.',
                'Powtórzyłem/powtórzyłam to tak, żeby listki były cztery i wychodziły z jednego środka.',
                'Sprawdziłem/sprawdziłam, czy wklejone listki nie zamalowały sobie nawzajem brzegów (przezroczyste zaznaczenie).',
              ],
            },
            {
              label: 'Koniec roboty',
              items: [
                'Dorysowałem/dorysowałam łodyżkę i pokolorowałem/pokolorowałam koniczynę.',
                'Zapisałem/zapisałam plik pod nazwą, po której poznam, co w nim jest.',
              ],
            },
          ]}
          hint={
            <>
              Program: <strong>Paint</strong> (Windows), <strong>Paintbrush</strong> (macOS),{' '}
              <strong>GIMP</strong>, <strong>Krita</strong> albo <strong>jspaint.app</strong> w
              przeglądarce. Zaznaczanie to zwykle narzędzie z przerywanym prostokątem, obrót siedzi
              w menu <strong>Obraz → Obróć</strong> albo pod prawym przyciskiem myszy na
              zaznaczeniu. Jeśli wklejony listek zamalowuje sąsiada białym prostokątem, poszukaj
              opcji <strong>„przezroczyste zaznaczenie”</strong>.
            </>
          }
        />
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
          Ciastek nikt nie lepi po jednym. Wycina się je foremką — <strong>jeden kształt, wiele
          takich samych ciastek</strong>. W edytorze grafiki foremką jest zaznaczenie: obrysowujesz
          kawałek rysunku i możesz go potem powielać, ile chcesz.
        </p>
        <p className="mt-3">
          Zaczniemy od rozłożenia trzech gotowych wzorów na kawałki. Potem wykonasz sześć ruchów,
          z których składa się każde kopiowanie, sprawdzisz na rybce, czym obrót różni się od
          odbicia, i złożysz czterolistną koniczynę bez rysowania drugiego listka.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Okrągła foremka do ciastek leży na rozwałkowanym cieście obok wyciętego przed chwilą otworu, a obok w rzędzie kilka jednakowych krążków ciasta wyciętych tą samą foremką"
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
