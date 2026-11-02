'use client';

import Image from 'next/image';
import { LayoutGrid, ListChecks, Scale } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { ProgramFan } from './program-fan';
import { WhatIsItFor } from './what-is-it-for';
import { LicenseCall } from './license-call';
import { SwapForFree } from './swap-for-free';
import { ProgramHunt } from './program-hunt';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Lekcja o programach i licencjach — szósta zbudowana w kursie i pierwsza, która
 * stoi na bloku `dylemat`. Nowa podstawa przesunęła akcent z „wymień programy"
 * na „dobierz świadomie i legalnie", więc lekcja nie jest wyliczanką: uczy
 * grupować programy po zastosowaniu, a potem rozstrzygać cztery sytuacje, w
 * których wchodzi w grę licencja `[5.7]`. Niesie zadanie obowiązkowe Z-2.
 *
 * Kształt: haczyk (jeden plik, wiele programów) → ćwiczenie (do czego służy ten
 * program) → dylemat (płatny, darmowy, open source) → zadanie praktyczne [Z-2]
 * → refleksja (jeden program do wymiany na darmowy). Blok ćwiczenia jest bez
 * ilustracji — sam w sobie dużo się w nim dzieje.
 *
 * Z-2 dzieje się **w całości w lekcji** (`ProgramHunt`): dziecko tropi nazwy
 * programów w trzech źródłach (pulpit, wiadomość, gazetka — z pułapkami),
 * przeciąga je pod wybrane zastosowania w makiecie edytora i zaznacza płatne.
 * Wcześniejsza wersja (szukanie w sieci, spis z licencjami w Notatniku, plik do
 * sprawdzenia) była dla dziesięciolatka za trudna i została zastąpiona 2026-09-16.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/programy-i-licencje/narzedzia-do-zadan.jpg',
  haczyk: '/images/informatyka/lekcje/programy-i-licencje/jeden-plik-wiele-narzedzi.jpg',
  dylemat: '/images/informatyka/lekcje/programy-i-licencje/pudelka-z-programami.jpg',
  zadanie: '/images/informatyka/lekcje/programy-i-licencje/spis-programow.jpg',
  wymiana: '/images/informatyka/lekcje/programy-i-licencje/wymiana-programu.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'wachlarz',
    kind: 'haczyk',
    title: 'Jeden plik, ile programów?',
    time: '5 min',
  },
  {
    id: 'do-czego',
    kind: 'cwiczenie',
    title: 'Do czego służy ten program?',
    time: '6 min',
    icon: LayoutGrid,
  },
  {
    id: 'licencje',
    kind: 'dylemat',
    title: 'Płatny, darmowy czy open source',
    time: '7 min',
    icon: Scale,
  },
  {
    id: 'zadanie-z2',
    kind: 'zadanie',
    title: 'Zadanie Z-2: tropiciel programów',
    time: '10 min',
    icon: ListChecks,
  },
  {
    id: 'wymiana',
    kind: 'refleksja',
    title: 'Jeden program do wymiany na darmowy',
    time: '3 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function ProgramyILicencjeLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Program to narzędzie, nie cel. Wybierasz go pod zadanie, sprawdzasz, skąd pochodzi i czy licencja na to pozwala — a jak nie stać cię na płatny, prawie zawsze jest darmowy odpowiednik."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const fan = useBlockDone('wachlarz');
  const forWhat = useBlockDone('do-czego');
  const license = useBlockDone('licencje');
  const task = useBlockDone('zadanie-z2');
  const swap = useBlockDone('wymiana');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="wachlarz">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.haczyk}
          alt="Zamknięty zeszyt na drewnianym biurku, wokół niego rozłożone różne przybory: ołówek, długopis, pędzel, cienki flamaster i pióro"
          lead="Ten sam dokument napiszesz w kilku różnych programach."
        >
          Najpierw zgadnij, iloma programami da się zrobić jeden zwykły plik — dokument, rysunek,
          tabelę. Potem zobaczysz rozłożony wachlarz prawdziwych nazw.
        </LessonImageCard>
        <ProgramFan color={color} onComplete={fan.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="do-czego">
        <WhatIsItFor color={color} onComplete={forWhat.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="licencje">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.dylemat}
          alt="Kilka gładkich tekturowych pudełek bez żadnych napisów ustawionych na półce, do jednego przyczepiona sznurkiem mała pusta papierowa metka, na drugim leży otwarta kłódka"
        >
          <p>
            Nie każdego programu wolno używać tak samo. <strong>Płatny</strong> trzeba kupić,{' '}
            <strong>darmowego</strong> zwykle nie wolno zmieniać, a <strong>open source</strong>{' '}
            można nawet poprawiać i przekazywać dalej. Rozstrzygnij cztery sytuacje z życia.
          </p>
        </LessonImageCard>
        <LicenseCall color={color} onComplete={license.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zadanie-z2">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zadanie}
          alt="Czysta, pusta kartka w linie z leżącym na niej ołówkiem, obok otwarty laptop z wygaszonym, ciemnym ekranem"
          lead="Teraz twoja kolej: wytrop programy w trzech źródłach i ułóż z nich spis."
          reverse
        >
          To jest zadanie obowiązkowe kursu, ale nie musisz nigdzie wychodzić. Wszystkie źródła i
          edytor są tutaj, niżej.
        </LessonImageCard>
        <ProgramHunt color={color} onComplete={task.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="wymiana">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.wymiana}
          alt="Dwa gładkie, płaskie pudełka bez napisów leżą obok siebie na drewnianym biurku, jedno lekko nasunięte na drugie"
          reverse
        >
          <p>
            Wiedza o licencjach przydaje się dopiero wtedy, gdy coś zmienia u ciebie na komputerze.
            Wybierz <strong>jedno</strong> zastosowanie i zapamiętaj do niego darmowy program.
          </p>
        </LessonImageCard>
        <SwapForFree color={color} onComplete={swap.markBlockDone} />
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
          Komputer sam z siebie nie robi nic. Wszystko, co się na nim dzieje — pisanie, rysowanie,
          liczenie, oglądanie stron — robią <strong>programy</strong>. Do każdego zadania jest ich
          kilka, a nie jeden, i różnią się nie tylko nazwą, ale też tym,{' '}
          <strong>czy i za ile wolno z nich korzystać</strong>.
        </p>
        <p className="mt-3">
          W tej lekcji nauczysz się dobierać program do zadania i rozpoznawać, kiedy „darmowy” jest
          naprawdę darmowy, a kiedy to pułapka. Po drodze zrobisz{' '}
          <strong>zadanie obowiązkowe Z-2</strong> — spis programów do trzech zastosowań.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Kilka różnych narzędzi ułożonych osobno na drewnianym blacie: ołówek, pędzel, małe liczydło i tekturowa teczka — każde do innej roboty"
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
