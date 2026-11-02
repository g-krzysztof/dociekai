'use client';

import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActUstawianieLiczb } from './act-ustawianie-liczb';
import { ActPrzenoszenie } from './act-przenoszenie';
import { ActPozyczanie } from './act-pozyczanie';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { ColumnGrid } from '../../column-grid';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { ACTS, ALIGNMENT_CORRECT_CELLS, ALIGNMENT_EXAMPLE } from './guide-content';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { img } from '@/lib/media';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ZapisPisemnyGuide({ lesson, mathModule, nextLesson }: GuideProps) {
  const color = mathModule.color;

  return (
    <GuideShell
      lesson={lesson}
      mathModule={mathModule}
      acts={ACTS}
      nextLesson={nextLesson}
      outro={<Outro color={color} />}
      headerAside={
        <SummaryPlayer
          color={color}
          audioSrc="/audio/matematyka/przewodniki/zapis-pisemny/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActUstawianieLiczb color={color} />
      <ActPrzenoszenie color={color} />
      <ActPozyczanie color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — ta sama zagadka (9 + 84), teraz ustawiona poprawnie. */
function Outro({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <p
        className="mb-1 text-xs font-bold uppercase tracking-[0.15em]"
        style={{ color: textColor }}
      >
        Wracamy do zagadki z początku
      </p>
      <h2 className="mb-5 text-2xl font-bold leading-snug sm:text-3xl">
        {ALIGNMENT_EXAMPLE.long} + {ALIGNMENT_EXAMPLE.short} = {ALIGNMENT_EXAMPLE.correctSum}, nie
        174
      </h2>

      <div className="mb-6 grid items-center gap-6 border bg-white p-4 dark:bg-zinc-900/80 sm:grid-cols-[auto_1fr] sm:p-6">
        <div className="flex justify-center overflow-x-auto">
          <ColumnGrid
            color={color}
            operator="+"
            cells={ALIGNMENT_CORRECT_CELLS}
            showPlaceLabels
            ariaLabel={`Poprawnie ustawione: ${ALIGNMENT_EXAMPLE.long} plus ${ALIGNMENT_EXAMPLE.short}, wynik ${ALIGNMENT_EXAMPLE.correctSum}`}
          />
        </div>
        <p className="text-base leading-relaxed sm:text-lg">
          Ta sama cyfra{' '}
          <span className="font-mono font-black tabular-nums" style={{ color }}>
            {ALIGNMENT_EXAMPLE.short}
          </span>
          , tylko ustawiona pod właściwą kolumną — pod jednościami, a nie pod dziesiątkami.{' '}
          <strong style={{ color: textColor }}>Miejsce cyfry decyduje o wyniku.</strong>
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Ustawianie
          </p>
          <p className="text-sm font-semibold leading-snug" style={{ color: textColor }}>
            te same miejsca w jednej kolumnie
          </p>
        </div>
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Przenoszenie
          </p>
          <p className="font-mono text-lg font-black tabular-nums" style={{ color: textColor }}>
            10 lub więcej → mała „1”
          </p>
        </div>
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Pożyczanie
          </p>
          <p className="text-sm font-semibold leading-snug" style={{ color: textColor }}>
            przekreśl i zapisz o 1 mniej
          </p>
        </div>
      </div>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        Ustawianie, przenoszenie i pożyczanie — te trzy elementy zapisu będą się powtarzać w
        każdej lekcji tego działu, więc teraz każda z nich pójdzie już tylko o rachunek, nie o
        notację.
      </p>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Jeśli
            dziecko gubi kolumny albo zapomina o przeniesieniu czy pożyczeniu przy liczeniu w
            zeszycie, wróćcie tu razem zamiast tłumaczyć zasadę od nowa za każdym razem.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/przewodniki/zapis-pisemny/stos-zeszytow-w-kratke-i-olowki.jpg')}
            alt="Stos zeszytów w kratkę i kilka ołówków na drewnianym stole"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
