'use client';

import Image from 'next/image';
import { Hammer, Hand, PackageCheck, Search, Target } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { GuessFirst } from './guess-first';
import { BreakIt } from './break-it';
import { StepScrub } from './step-scrub';
import { PullOut } from './pull-out';
import { DeliveryStudio } from './delivery-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Szósta lekcja modułu 6, dwudziesty dziewiąty kształt lekcji w kursie — i ta,
 * która domyka cały moduł. Realizuje „testowanie i poprawianie programu”
 * `[2.2]` `[2.3]`. Bez zadania obowiązkowego; zamówienie jest autorskie.
 *
 * **Lekcja stoi na jednym rozróżnieniu: uruchomienie to jeszcze nie test.**
 * Uruchomienie pokazuje, co program robi; test mówi, co miał robić — i musi
 * powstać **wcześniej**, inaczej głowa dopasuje oczekiwanie do wyniku. Stąd
 * kolejność bloków, z których każdy jest innym gestem, nie innym tematem:
 *
 *  - `GuessFirst` — przepowiednia **stawiana na scenie** bladym duszkiem, zanim
 *    program ruszy. Założenie przestaje być myślą, a staje się przedmiotem,
 *    którego nie da się po fakcie przesunąć;
 *  - `BreakIt` — odwrócenie roli: zadaniem jest **złamać** cudzy program,
 *    wybierając dane z brzegów. Tabela prób rośnie z ręki dziecka `[2.2]`;
 *  - `StepScrub` — **program przewijany jak film**, z tabliczką stanu obok
 *    sceny: objaw i przyczyna leżą w dwóch różnych miejscach, a druga runda
 *    obejmuje **dwa przebiegi**, bo zielona flaga niczego nie ustawia na start;
 *  - `PullOut` — **wyjmij klocek i zobacz, co przestanie działać**; to jest
 *    odpowiedź na „objaśnij działanie wybranych instrukcji” `[2.3]` dana
 *    doświadczeniem, a nie zdaniem z samouczka;
 *  - `DeliveryStudio` — zadanie **na stronie**, na tej samej scenie co bloki
 *    wyżej; werdykt **uruchamia program dziecka dwa razy pod rząd** i porównuje
 *    oba przebiegi.
 *
 * Trzy ostatnie bloki tworzą jeden łuk na jednej usterce: w trzecim dziecko ją
 * znajduje w cudzym programie, w czwartym dowodzi, który klocek ją leczy, w
 * piątym musi jej uniknąć u siebie.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/testowanie-i-bledy/detka-w-wodzie.jpg',
  cel: '/images/informatyka/lekcje/testowanie-i-bledy/strzala-i-kolo.jpg',
  lampki: '/images/informatyka/lekcje/testowanie-i-bledy/lampki-na-sznurze.jpg',
  wieza: '/images/informatyka/lekcje/testowanie-i-bledy/wieza-z-klockow.jpg',
  jajka: '/images/informatyka/lekcje/testowanie-i-bledy/jajka-w-wodzie.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'zanim-uruchomisz',
    kind: 'haczyk',
    title: 'Powiedz, co ma się stać',
    time: '5 min',
    icon: Target,
  },
  {
    id: 'zlam-program',
    kind: 'cwiczenie',
    title: 'Złam ten program',
    time: '5 min',
    icon: Hammer,
  },
  {
    id: 'gdzie-siedzi-usterka',
    kind: 'debugowanie',
    title: 'Gdzie siedzi usterka',
    time: '6 min',
    icon: Search,
  },
  {
    id: 'po-co-ten-klocek',
    kind: 'wyjasnienie',
    title: 'Po co jest ten klocek',
    time: '5 min',
    icon: Hand,
  },
  {
    id: 'kot-listonosz',
    kind: 'zadanie',
    title: 'Zadanie: program, który działa za każdym razem',
    time: '8 min',
    icon: PackageCheck,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function TestowanieIBledyLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zapamiętaj jedno zdanie, bo działa wszędzie, nie tylko w Scratchu: uruchomienie programu to jeszcze nie test. Testem jest dopiero to, co powiesz ZANIM klikniesz — i dane z brzegu, na których nikt programu nie sprawdzał. A gdy coś nie działa, nie patrz tam, gdzie boli: objaw i przyczyna prawie nigdy nie siedzą w tym samym klocku."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const hook = useBlockDone('zanim-uruchomisz');
  const breakIt = useBlockDone('zlam-program');
  const scrub = useBlockDone('gdzie-siedzi-usterka');
  const pull = useBlockDone('po-co-ten-klocek');
  const task = useBlockDone('kot-listonosz');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="zanim-uruchomisz">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.cel}
          alt="Gruby okrągły plaster pnia drzewa oparty o deski starej stodoły, z narysowanym kredą jasnym kołem pośrodku; jedna strzała z pierzastymi lotkami tkwi w drewnie wyraźnie poza tym kołem, blisko krawędzi"
          lead="Koło narysowano przed strzałem. Dlatego nie da się powiedzieć „no przecież o to mi chodziło”."
        >
          Z programem jest tak samo. Jeżeli powiesz, co ma się stać, dopiero <strong>po</strong>{' '}
          uruchomieniu, twoja głowa dopasuje oczekiwanie do tego, co zobaczyła. W tym bloku
          najpierw postawisz swój cel na scenie, a dopiero potem klikniesz flagę.
        </LessonImageCard>
        <GuessFirst color={color} onComplete={hook.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zlam-program">
        <BreakIt color={color} onComplete={breakIt.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="gdzie-siedzi-usterka">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.lampki}
          alt="Długi sznur starych szklanych lampek leżący luźno zwinięty na drewnianym stole; wszystkie żarówki świecą ciepłym żółtym światłem oprócz jednej pośrodku, szarej i zgaszonej"
          reverse
        >
          <p>
            Z daleka widać tylko tyle, że <strong>coś jest nie tak</strong>. Żeby wskazać, która
            żarówka zawiniła, trzeba przejść sznur lampka po lampce. Program da się przejść dokładnie
            tak samo — klocek po klocku, z zatrzymaniem po każdym. Tylko że w programie jest coś
            jeszcze: <strong>zmiany, po których na scenie nie widać nic</strong>.
          </p>
        </LessonImageCard>
        <StepScrub color={color} onComplete={scrub.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="po-co-ten-klocek">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wieza}
          alt="Wieża zbudowana z małych, niepomalowanych drewnianych klocków stojąca na stole; jeden klocek w dolnej części wieży jest do połowy wysunięty na bok, a wieża nad nim lekko się przechyla"
          lead="Jest tylko jeden pewny sposób, żeby sprawdzić, czy klocek trzyma wieżę."
        >
          Wyjąć go i popatrzeć. W programie to kosztuje jeszcze mniej niż tutaj — zawsze możesz
          wstawić klocek z powrotem. A odpowiedź, którą dostajesz, jest{' '}
          <strong>dokładnie tą, o którą pyta nauczyciel</strong>, mówiąc „wytłumacz, jak działa twój
          program”.
        </LessonImageCard>
        <PullOut color={color} onComplete={pull.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="kot-listonosz">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.jajka}
          alt="Szeroka przezroczysta szklana misa z wodą, a w niej trzy brązowe jajka: dwa leżą płasko na dnie, a trzecie stoi pionowo na węższym końcu i wystaje ponad lustro wody"
        >
          <p>
            Świeże jajko leży na dnie, stare staje na sztorc. Jeden prosty test, jedna jasna
            odpowiedź — i <strong>każde jajko sprawdza się osobno</strong>. Twoje zamówienie ma
            sześć takich testów. Dostajesz je z góry, bo tak właśnie wygląda uczciwa umowa: wiesz, z
            czym twój program będzie porównany, zanim zaczniesz go budować.
          </p>
        </LessonImageCard>
        <DeliveryStudio color={color} onComplete={task.markBlockDone} />
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
          Dziury w dętce nie znajduje się wzrokiem. Zanurza się ją w wodzie i patrzy, skąd lecą
          bąbelki — bo <strong>usterka sama z siebie nie jest widoczna</strong>, widoczny jest
          dopiero jej skutek, i to w dobrze dobranych warunkach.
        </p>
        <p className="mt-3">
          Program ma tak samo. Prawie każdy działa <strong>przy danych, które wymyślił jego
          autor</strong>, i prawie każdy psuje się gdzie indziej. Ta lekcja jest o czterech
          rzeczach: jak powiedzieć z góry, co ma się stać; jak dobrać dane, żeby program pękł; jak
          znaleźć miejsce usterki, gdy już pęknie; i jak wytłumaczyć, dlaczego twój własny program
          działa.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Okrągła dętka rowerowa zanurzona w płaskiej cynkowej balii z wodą; z jednego miejsca na gumie unosi się w górę wąski sznurek małych bąbelków powietrza, a na powierzchni rozchodzą się wokół nich kółka"
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
