'use client';

import Image from 'next/image';
import { CalendarClock, Columns3, Compass, Flag, Footprints } from 'lucide-react';
import {
  HIST_BLOCK_KINDS,
  HistLessonShell,
  LessonBlock,
  useBlockDone,
  type HistBlockMeta,
} from '../../lesson-shell';
import { imgMap } from '@/lib/media';
import { TestProvider } from './test-state';
import { Czesc } from './czesci';
import { WynikWidget } from './wynik-widget';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L33 — Test końcowy i most do klasy 5 (`kind: 'podsumowanie'`, pierwszy
 * blok `quiz` w kursie). Dwanaście zadań **wykonywanych**, po trzy w czterech
 * częściach, jedna próba na zadanie; wynik bez procentów — „co już umiesz”
 * i odnośniki do lekcji. Bez zakładu z samym sobą (ma go informatyka);
 * samoocena była w L32 (mapa roku). Bez Przypominajki — cały test nią jest.
 */

const IMAGES = imgMap({
  stol: '/images/historia/lekcje/test-koncowy/stol.jpg',
  mgla: '/images/historia/lekcje/test-koncowy/mgla.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'czas', kind: 'quiz', title: 'Część A · Czas', time: '5 min', icon: CalendarClock },
  { id: 'slady', kind: 'quiz', title: 'Część B · Ślady przeszłości', time: '5 min', icon: Footprints },
  { id: 'mapa', kind: 'quiz', title: 'Część C · Mapa i miejsce', time: '5 min', icon: Compass },
  { id: 'dziedzictwo', kind: 'quiz', title: 'Część D · Dziedzictwo', time: '5 min', icon: Columns3 },
  { id: 'wynik', kind: 'refleksja', title: 'Wynik i most do klasy 5', time: '4 min', icon: Flag },
];

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
  nextModule?: HistModule;
}

export function TestKoncowyLesson({ lesson, histModule, nextLesson, nextModule }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      nextModule={nextModule}
      finishNote="To był cały rok historii: od pytania, skąd wiemy, co się zdarzyło, przez oś czasu, mapę i swoją okolicę, po pierwszych ludzi, Egipt, Grecję, Rzym i narodziny chrześcijaństwa. Umiesz czytać źródła, liczyć lata i patrzeć na mapę jak historyk. Do zobaczenia w klasie 5 — za mgłą czeka średniowiecze."
    >
      <TestProvider>
        <LessonBody color={histModule.color} />
      </TestProvider>
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const czas = useBlockDone('czas');
  const slady = useBlockDone('slady');
  const mapa = useBlockDone('mapa');
  const dziedzictwo = useBlockDone('dziedzictwo');
  const wynik = useBlockDone('wynik');

  return (
    <>
      <LessonIntro color={color} />
      <LessonBlock id="czas">
        <Czesc part="czas" color={color} onDone={czas.markBlockDone} />
      </LessonBlock>
      <LessonBlock id="slady">
        <Czesc part="slady" color={color} onDone={slady.markBlockDone} />
      </LessonBlock>
      <LessonBlock id="mapa">
        <Czesc part="mapa" color={color} onDone={mapa.markBlockDone} />
      </LessonBlock>
      <LessonBlock id="dziedzictwo">
        <Czesc part="dziedzictwo" color={color} onDone={dziedzictwo.markBlockDone} />
      </LessonBlock>
      <LessonBlock id="wynik">
        <figure className="mb-4">
          <Image
            src={IMAGES.mgla}
            alt="Akwarela: poranna mgła nad szeroką rzeką, w oddali na niskim wzgórzu drewniany gród otoczony wałem i palisadą, w środku kilka chat krytych strzechą"
            width={640}
            height={480}
            className="h-auto w-full max-w-[520px]"
          />
        </figure>
        <WynikWidget color={color} onDone={wynik.markBlockDone} />
      </LessonBlock>
    </>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Ostatnia lekcja roku. Czeka Cię dwanaście zadań w czterech częściach — i każde trzeba <strong>zrobić</strong>: ułożyć,
          policzyć, stuknąć na mapie, wywiesić.
        </p>
        <p className="mt-3">
          Tym razem każde zadanie ma <strong>jedną próbę</strong>. Po odpowiedzi od razu zobaczysz, jak było naprawdę. Na końcu nie
          dostaniesz procentów, tylko listę tego, co już umiesz — i drogę do klasy 5.
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.stol}
            alt="Akwarela: na drewnianym stole leżą przedmioty z całego roku — gliniana tabliczka z klinami, grecka amfora z malowanym koniem, rzymska lampka oliwna, krzemienny grot, zwój papirusu i srebrna moneta"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
        <div className="lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan tej lekcji</p>
          <ol className="space-y-2">
            {BLOCKS.map((block, index) => (
              <li key={block.id} className="flex items-start gap-3">
                <span className="w-5 shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 text-sm leading-snug">
                  <span className="block font-medium">{HIST_BLOCK_KINDS[block.kind].label}</span>
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
