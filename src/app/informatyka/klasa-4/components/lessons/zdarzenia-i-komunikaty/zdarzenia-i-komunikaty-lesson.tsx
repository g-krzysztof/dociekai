'use client';

import Image from 'next/image';
import { Bug, Clock, PackageCheck, Radio, Waypoints } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { Conductor } from './conductor';
import { TimeDesk } from './time-desk';
import { Switchboard } from './switchboard';
import { AllAtOnceFix } from './all-at-once-fix';
import { NameStudio } from './name-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Trzecia lekcja modułu 6 i dwudziesty szósty kształt lekcji w kursie. Realizuje
 * temat „zdarzenia i komunikaty — pokazywanie i ukrywanie duszków, »po kolei« a
 * »jednocześnie«” `[2.1]` `[2.3]` i **zadanie obowiązkowe Z-8**.
 *
 * **Tej lekcji nie dało się zbudować na dotychczasowym silniku.** `run()` z
 * `engine.ts` wykonuje jeden stos jednego duszka, a „jednocześnie” wymaga co
 * najmniej dwóch duszków działających w tej samej chwili. Dlatego powstał
 * `stage-engine.ts` — planista zdarzeń z osią czasu i komunikatami, które budzą
 * wszystkich odbiorców w tej samej milisekundzie. Bez tego lekcja mogłaby o
 * jednoczesności najwyżej opowiadać.
 *
 * **Przyrządem lekcji jest oś czasu** (`TimeTrack`), wracająca w czterech z
 * pięciu bloków i w raporcie z jego pracy. Cała różnica „po kolei” kontra
 * „jednocześnie” jest na niej **geometryczna**: schodki albo jedna pionowa
 * kreska. Dzięki temu zdanie z zadania — „wszystkie litery powinny jednocześnie
 * zniknąć” — da się zobaczyć, a nie tylko przeczytać.
 *
 * Pięć bloków, pięć różnych gestów:
 *  - `Conductor` — wywoływanie **prawdziwych zdarzeń**: flaga, klawisz naciskany
 *    na własnej klawiaturze, kliknięcie duszka na scenie;
 *  - `TimeDesk` — **przeciąganie znaczników po osi czasu** (to są liczby w
 *    klockach „czekaj”);
 *  - `Switchboard` — **wpinanie kapeluszy w gniazda**, gest nowy w repo;
 *  - `AllAtOnceFix` — pracownia klocków, tym razem z **siedmioma skryptami
 *    czterech duszków** i podpisami przy stosach;
 *  - `NameStudio` — zadanie **na stronie**: dziecko wpisuje imię, każda litera jest
 *    osobnym duszkiem, skrypty układa na pracowni z zakładką na duszka, a werdykt
 *    **uruchamia jego program** i patrzy na zegar.
 *
 * Haczyk **kończy się porażką i to jest jego rola**: trzema wyzwalaczami nie da
 * się obudzić trzech duszków naraz, licznik zatrzymuje się na jednym. Komunikat
 * z bloku trzeciego jest odpowiedzią na to konkretne niepowodzenie.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/zdarzenia-i-komunikaty/plytki-stojace-i-lezace.jpg',
  kamertony: '/images/informatyka/lekcje/zdarzenia-i-komunikaty/trzy-kamertony.jpg',
  kregi: '/images/informatyka/lekcje/zdarzenia-i-komunikaty/kregi-na-wodzie.jpg',
  swiece: '/images/informatyka/lekcje/zdarzenia-i-komunikaty/cztery-swiece.jpg',
  klocki: '/images/informatyka/lekcje/zdarzenia-i-komunikaty/drewniane-szescianiki.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'kto-slyszal',
    kind: 'haczyk',
    title: 'Kto to usłyszał?',
    time: '5 min',
    icon: Radio,
  },
  {
    id: 'pulpit-czasu',
    kind: 'symulator',
    title: 'Pulpit czasu: po kolei albo naraz',
    time: '7 min',
    icon: Clock,
  },
  {
    id: 'rozdzielnia',
    kind: 'pokaz',
    title: 'Rozdzielnia: jeden komunikat, wielu odbiorców',
    time: '7 min',
    icon: Waypoints,
  },
  {
    id: 'mialo-byc-naraz',
    kind: 'debugowanie',
    title: 'Miało być naraz',
    time: '6 min',
    icon: Bug,
  },
  {
    id: 'imie',
    kind: 'zadanie',
    title: 'Zadanie Z-8: litery twojego imienia',
    time: '10 min',
    icon: PackageCheck,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function ZdarzeniaIKomunikatyLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Umiesz już powiedzieć, czym różni się „po kolei” od „jednocześnie” — i, co ważniejsze, umiesz jedno i drugie zrobić. Zapamiętaj dwa zdania: skrypt należy do duszka i rusza od swojego kapelusza, a komunikat nie ma adresata — nadaje go jeden, a słyszą wszyscy, którzy na niego czekają. To jest jedyny pewny sposób, żeby kilka duszków zrobiło coś w tej samej chwili."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const hook = useBlockDone('kto-slyszal');
  const desk = useBlockDone('pulpit-czasu');
  const board = useBlockDone('rozdzielnia');
  const fix = useBlockDone('mialo-byc-naraz');
  const task = useBlockDone('imie');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="kto-slyszal">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kamertony}
          alt="Trzy mosiężne kamertony różnej wielkości stojące na złożonym kawałku lnianego płótna; przy ramionach środkowego, największego, narysowane są delikatne łuki oznaczające drganie, dwa pozostałe stoją nieruchomo"
          lead="Uderz w jeden — odezwie się tylko ten, który jest na niego nastrojony."
        >
          W Scratchu jest tak samo. <strong>Skrypt nie należy do programu, tylko do duszka</strong>,
          a rusza dopiero wtedy, gdy zdarzy się dokładnie to, co jest napisane na jego kapeluszu.
          Sprawdź to na trzech duszkach, z których każdy słucha czegoś innego.
        </LessonImageCard>
        <Conductor color={color} onComplete={hook.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="pulpit-czasu">
        <TimeDesk color={color} onComplete={desk.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="rozdzielnia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.kregi}
          alt="Widziana z góry płaska kamionkowa misa z wodą, a w niej rozchodzące się od samego środka koncentryczne kręgi; przy krawędzi unoszą się trzy małe zielone listki, wszystkie ustawione tak samo"
          reverse
        >
          <p>
            Kamyk wpada w jednym miejscu, a fala dociera do wszystkich listków —{' '}
            <strong>i do każdego w tej samej chwili</strong>. Tak właśnie działa{' '}
            <strong>komunikat</strong>: nadaje go jeden duszek, a odbiera każdy, kto na niego czeka.
          </p>
        </LessonImageCard>
        <Switchboard color={color} onComplete={board.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="mialo-byc-naraz">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.swiece}
          alt="Cztery jednakowe białe świece stojące w rzędzie na szarej kamiennej płycie; trzy z lewej są zgaszone i nad każdą unosi się cienka smużka dymu, czwarta z prawej wciąż pali się spokojnym płomieniem"
          lead="Miały zgasnąć wszystkie naraz. Jedna została."
          reverse
        >
          Takie rzeczy trafiają się w programach bez przerwy i objaw jest zawsze ten sam: „nie
          działa”. <strong>Powód za każdym razem inny.</strong> W projekcie, który zaraz dostaniesz,
          są trzy — i każdy z innej rodziny.
        </LessonImageCard>
        <AllAtOnceFix color={color} onComplete={fix.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="imie">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.klocki}
          alt="Cztery gładkie, niemalowane drewniane sześcianiki ustawione w rzędzie na jasnym blacie, lekko obrócone tak, że widać po dwie ścianki każdego; wszystkie ścianki są zupełnie puste, bez liter i bez żadnych innych znaków"
        >
          <p>
            Zostało napisać na nich swoje imię — <strong>po jednej literze na klocek</strong>. W
            Scratchu taki klocek to osobny duszek, a wszystko, czego potrzebujesz, żeby je ożywić,
            robiłeś/robiłaś już dzisiaj.
          </p>
        </LessonImageCard>
        <NameStudio color={color} onComplete={task.markBlockDone} />
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
          Do tej pory twój duszek był sam i robił wszystko po kolei: najpierw to, potem tamto. Dziś
          duszków będzie kilku — i okaże się, że{' '}
          <strong>„po kolei” i „jednocześnie” to dwie zupełnie różne rzeczy</strong>, obie do
          zrobienia i obie potrzebne.
        </p>
        <p className="mt-3">
          Pomoże w tym <strong>oś czasu</strong>, która będzie ci dziś towarzyszyć w prawie każdym
          bloku. Na niej widać to od razu: zdarzenia w tej samej chwili układają się w jedną pionową
          kreskę, a rozłożone w czasie — w schodki.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Na jasnym blacie po lewej rząd prostokątnych drewnianych płytek ustawionych na sztorc jedna za drugą, a pierwsza z nich przechylona i oparta o następną; po prawej cztery takie same płytki leżą płasko, ciasno jedna przy drugiej, wszystkie na tym samym poziomie"
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
