'use client';

import Image from 'next/image';
import { Compass, Hourglass, Layers, Sparkles } from 'lucide-react';
import {
  HIST_BLOCK_KINDS,
  HistLessonShell,
  LessonBlock,
  useBlockDone,
  type HistBlockMeta,
} from '../../lesson-shell';
import { Przypominajka } from '../../przypominajka';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { WykopProvider } from './wykop-state';
import { StanowiskoWidget } from './stanowisko-widget';
import { OsWidget } from './os-widget';
import { MapyWidget } from './mapy-widget';
import { MapaRokuWidget } from './mapa-roku-widget';
import { TeczkaPrzypominajka } from './teczka-przypominajka';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L32 — Wykopalisko roku (powtórzenie przekrojowe).
 *
 * **Zdanie lekcji: Im głębiej kopiesz, tym dawniej — a każda warstwa
 * przechowuje ślad, który trzeba umieć przeczytać.**
 *
 * Cztery bloki:
 *  - `stanowisko` — sześć warstw odsłanianych pędzelkiem, w każdej
 *    mikro-zadanie w geście z tamtego modułu (L28, L23, L19, L18, L16, L15);
 *  - `os` — cała Oś dziejów w dwóch skalach i trzy pinezki dopinane
 *    samodzielnie; po bloku oś starożytności jest kompletna (pins.ts);
 *  - `mapy` — cztery zasięgi na jednej mapie i dom dziecka poza nimi,
 *    na szlaku bursztynowym;
 *  - `mapa-roku` — co poszło od razu, co po próbach, i zdanie roku.
 * Przypominajka: fakt czy czyjeś zdanie (L31, dystans 1).
 */

const IMAGES = imgMap({
  przekroj: '/images/historia/lekcje/wykopalisko-roku/przekroj.jpg',
  pedzelek: '/images/historia/lekcje/wykopalisko-roku/pedzelek.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'stanowisko', kind: 'symulator', title: 'Stanowisko roku', time: '12 min', icon: Layers },
  { id: 'os', kind: 'os-czasu', title: 'Moja oś dziejów', time: '6 min', icon: Hourglass },
  { id: 'mapy', kind: 'mapa', title: 'Cztery mapy, jedna ręka', time: '5 min', icon: Compass },
  { id: 'mapa-roku', kind: 'refleksja', title: 'Co zostało we mnie', time: '4 min', icon: Sparkles },
];

const L31_LESSON = getLesson('podsumowanie', 'teczka-postaci');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
  nextModule?: HistModule;
}

export function WykopaliskoRokuLesson({ lesson, histModule, nextLesson, nextModule }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      nextModule={nextModule}
      finishNote="Odkopałeś/łaś sześć warstw całego roku i w każdej przeczytałeś/łaś ślad, domknąłeś/łaś swoją Oś dziejów, położyłeś/łaś cztery starożytne mapy jedna na drugiej i znalazłeś/łaś na nich swój dom, a z całego roku wybrałeś/łaś jedno zdanie dla siebie. Od dziś wiesz: im głębiej kopiesz, tym dawniej — a każda warstwa przechowuje ślad, który trzeba umieć przeczytać."
      entry={
        L31_LESSON ? (
          <Przypominajka from={L31_LESSON} distance={1} color={histModule.color}>
            <TeczkaPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <WykopProvider>
        <LessonBody color={histModule.color} />
      </WykopProvider>
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const stanowisko = useBlockDone('stanowisko');
  const os = useBlockDone('os');
  const mapy = useBlockDone('mapy');
  const mapaRoku = useBlockDone('mapa-roku');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="stanowisko">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pedzelek}
          alt="Akwarela: na krawędzi wykopu leży miękki szeroki pędzel i mała szpachelka, obok kamyki i częściowo rozwinięta miarka, w ścianie wykopu widać warstwy ziemi"
          lead="Archeolog nie kopie łopatą — odsłania pędzelkiem, warstwa po warstwie."
        >
          Każda warstwa to inny czas. Żeby dojść do najstarszej, trzeba najpierw przeczytać wszystkie nad nią.
        </LessonImageCard>
        <div className="mt-4">
          <StanowiskoWidget color={color} onDone={stanowisko.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="os">
        <OsWidget color={color} done={os.done} onDone={os.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="mapy">
        <MapyWidget color={color} onDone={mapy.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="mapa-roku">
        <MapaRokuWidget color={color} onDone={mapaRoku.markBlockDone} />
      </LessonBlock>
    </>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Na początku roku odkopywałeś/łaś trzy warstwy ziemi i odkryłeś/łaś zasadę archeologa: im głębiej, tym dawniej. Dziś
          w jednym wykopie leży cały rok — od rzymskich kanałów po łowców sprzed dziesiątek tysięcy lat.
        </p>
        <p className="mt-3">
          Odkopiesz sześć warstw, domkniesz swoją Oś dziejów, położysz na siebie cztery mapy i wybierzesz zdanie, które zostanie
          z Tobą. Wszystko stoi na jednym zdaniu:{' '}
          <strong>Im głębiej kopiesz, tym dawniej — a każda warstwa przechowuje ślad, który trzeba umieć przeczytać.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.przekroj}
            alt="Akwarela: przekrój wykopu archeologicznego — pod trawą sześć poziomych warstw ziemi w różnych kolorach, w każdej leży jeden przedmiot, na samym dnie krzemienny grot"
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
