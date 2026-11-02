'use client';

import Image from 'next/image';
import { AlignLeft, List, Search } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { FindFast } from './find-fast';
import { EyePath } from './eye-path';
import { ShuffleTest } from './shuffle-test';
import { NoticeStudio } from './notice-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Druga lekcja modułu 4 i dziewiętnasty kształt lekcji w kursie. Realizuje temat
 * „akapity, wyrównanie, listy wypunktowane i numerowane” `[3.3]`.
 *
 * **Pierwsza czteroblokowa lekcja kursu** — i to nie z oszczędności, tylko
 * dlatego, że temat ma dokładnie trzy rzeczy do przeżycia i jedną do zrobienia
 * w domu (zadania obowiązkowego tu nie ma, Z-10 przypada na lekcję następną).
 *
 * Wspólny mianownik trzech widżetów: **każdy z nich mierzy albo psuje, zamiast
 * tłumaczyć**. `FindFast` mierzy czas, w jakim dziecko znajduje informację —
 * najpierw w ścianie tekstu, potem w tym samym tekście podzielonym przez nie
 * samo na akapity. `EyePath` mierzy prawdziwy układ wierszy w przeglądarce i
 * rysuje drogę, którą przebywa oko. `ShuffleTest` tasuje listę i każe ocenić,
 * czy coś się przez to zepsuło — z czego sama wychodzi różnica między numerami
 * a kropkami.
 *
 * Zadanie praktyczne trzyma się tej samej zasady: odbieramy je **w lekcji**
 * (`NoticeStudio` na `MiniWriter`), a nagrodą za przyjęcie pracy jest stoper
 * z pierwszego bloku puszczony na ogłoszeniu dziecka — raz zlanym w bryłę,
 * raz w układzie, który samo mu nadało. Lista kontrolna nie umiała odróżnić
 * listy zrobionej przyciskiem od myślników z klawiatury, a to jest cała treść
 * trzeciego bloku.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/akapity-i-listy/szuflada-z-przegrodkami.jpg',
  sciana: '/images/informatyka/lekcje/akapity-i-listy/mur-z-cegiel.jpg',
  polki: '/images/informatyka/lekcje/akapity-i-listy/polki-z-ksiazkami.jpg',
  sznurek: '/images/informatyka/lekcje/akapity-i-listy/koraliki-na-sznurku.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'sciana-tekstu',
    kind: 'haczyk',
    title: 'Ściana tekstu kontra stoper',
    time: '7 min',
    icon: Search,
  },
  {
    id: 'droga-oka',
    kind: 'wyjasnienie',
    title: 'Którędy chodzi oko, kiedy czytasz',
    time: '6 min',
    icon: AlignLeft,
  },
  {
    id: 'numery-czy-kropki',
    kind: 'cwiczenie',
    title: 'Numery czy kropki? Przetasuj i zobacz',
    time: '6 min',
    icon: List,
  },
  {
    id: 'ogloszenie-do-domu',
    kind: 'zadanie',
    title: 'Ogłoszenie, które da się objąć wzrokiem',
    time: '10 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function AkapityIListyLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zmierzyłeś/zmierzyłaś na stoperze, ile kosztuje ściana tekstu, zobaczyłeś/zobaczyłaś drogę, którą przebywa twoje oko, i sprawdziłeś/sprawdziłaś tasowaniem, kiedy lista potrzebuje numerów. Zdanie do zapamiętania: tekst czyta się oczami, a oczy są leniwe — i bardzo dobrze, bo to dla nich układa się stronę."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const find = useBlockDone('sciana-tekstu');
  const eye = useBlockDone('droga-oka');
  const shuffle = useBlockDone('numery-czy-kropki');
  const task = useBlockDone('ogloszenie-do-domu');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="sciana-tekstu">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.sciana}
          alt="Płaski mur z jednakowych różowoczerwonych cegieł wypełnia cały kadr — wszystkie cegły są tej samej wielkości, spoiny są równiutkie i nie ma w murze ani okna, ani żadnej przerwy"
          lead="W takim murze nie ma czego szukać — wszystko wygląda tak samo."
        >
          Tekst bez akapitów wygląda dokładnie tak i działa dokładnie tak samo: żeby cokolwiek w nim
          znaleźć, trzeba przeczytać wszystko od początku. Poniżej ogłoszenie o wycieczce. Masz w nim
          znaleźć trzy rzeczy — <strong>stoper chodzi</strong>.
        </LessonImageCard>
        <FindFast color={color} onComplete={find.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="droga-oka">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.polki}
          alt="Dwie półki na jasnej ścianie — na górnej książki stoją równo dosunięte do tej samej krawędzi, więc ich grzbiety tworzą jedną prostą linię, a na dolnej te same książki są wsunięte na różną głębokość i linia grzbietów jest poszarpana"
          reverse
        >
          <p>
            Po górnej półce rękę prowadzi się bez patrzenia — wszystkie grzbiety stoją w jednej
            linii. Po dolnej trzeba za każdym razem szukać. Z wierszami tekstu jest identycznie:{' '}
            <strong>oko wraca do początku następnego wiersza</strong> i musi wiedzieć, gdzie on
            jest. Zobacz tę drogę narysowaną.
          </p>
        </LessonImageCard>
        <EyePath color={color} onComplete={eye.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="numery-czy-kropki">
        <ShuffleTest color={color} onComplete={shuffle.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="ogloszenie-do-domu">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.sznurek}
          alt="Napięty prosty sznurek przecina cały kadr — po lewej nawleczone na nim drewniane koraliki są zsunięte w jedną zbitą kupkę, po prawej te same koraliki są rozsunięte pojedynczo w równych odstępach"
        >
          <p>
            Te same koraliki, ten sam sznurek — a policzyć da się tylko te rozsunięte. Zrób teraz to
            samo z własnym tekstem na tej stronie: <strong>rozsuń go</strong> na akapity i listę.
          </p>
        </LessonImageCard>
        <NoticeStudio color={color} onComplete={task.markBlockDone} />
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
          Do szuflady z przegródkami sięgasz po nożyczki bez patrzenia. Do szuflady, w której
          wszystko leży razem, sięgasz i grzebiesz. Tekst na stronie działa tak samo:{' '}
          <strong>nie chodzi o to, żeby był ładny, tylko żeby dało się w nim coś znaleźć</strong>.
        </p>
        <p className="mt-3">
          W tej lekcji nie będzie rad w stylu „pisz przejrzyście”. Będzie stoper, który zmierzy, ile
          kosztuje cię ściana tekstu, strzałki pokazujące drogę twojego oka przy różnych
          wyrównaniach, i przycisk, który przetasuje listę, żebyś zobaczył/zobaczyła, kiedy to boli,
          a kiedy nie.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Otwarte drewniane pudełko z przegródkami, w każdej leży co innego — zwinięty sznurek, spinacze, guziki, naparstek — a obok drugie takie samo pudełko bez przegródek, w którym wszystko leży wymieszane na jednej kupce"
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
