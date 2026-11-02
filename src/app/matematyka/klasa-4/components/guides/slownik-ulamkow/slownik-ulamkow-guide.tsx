'use client';

import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActLicznikIMianownik } from './act-licznik-i-mianownik';
import { ActNieTylkoKolo } from './act-nie-tylko-kolo';
import { ActUlamekWlasciwy } from './act-ulamek-wlasciwy';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { FractionPie } from '../../fraction-pie';
import { FractionNotation } from '../../fraction-notation';
import { ACTS, OPENING_LICZNIK, OPENING_MIANOWNIK } from './guide-content';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { img } from '@/lib/media';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function SlownikUlamkowGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/slownik-ulamkow/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActLicznikIMianownik color={color} />
      <ActNieTylkoKolo color={color} />
      <ActUlamekWlasciwy color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — ta sama pizza, teraz w pełni nazwana. */
function Outro({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const filled = new Set(Array.from({ length: OPENING_LICZNIK }, (_, i) => i));

  return (
    <div className="max-w-3xl">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Wracamy do pytania z początku
      </p>
      <h2 className="mb-5 text-2xl font-bold leading-snug sm:text-3xl">
        Dwie liczby, dwie nazwy — teraz już żadna nie jest tajemnicą.
      </h2>

      <div className="mb-6 grid items-center gap-6 border bg-white p-4 dark:bg-zinc-900/80 sm:grid-cols-[auto_1fr] sm:p-6">
        <div className="flex items-center justify-center gap-6">
          <div className="w-[140px]">
            <FractionPie
              color={color}
              mianownik={OPENING_MIANOWNIK}
              filled={filled}
              ariaLabel="Pizza podzielona na osiem kawałków, trzy zamalowane"
            />
          </div>
          <FractionNotation licznik={OPENING_LICZNIK} mianownik={OPENING_MIANOWNIK} color={color} licznikRevealed mianownikRevealed />
        </div>
        <p className="text-base leading-relaxed sm:text-lg">
          {OPENING_LICZNIK} z {OPENING_MIANOWNIK} kawałków to{' '}
          <strong style={{ color: textColor }}>ułamek</strong> {OPENING_LICZNIK}/{OPENING_MIANOWNIK}. Liczba
          na dole to <strong style={{ color: textColor }}>mianownik</strong> — na ile części
          podzielono pizzę. Liczba na górze to <strong style={{ color: textColor }}>licznik</strong> — ile
          kawałków wzięto. A ponieważ licznik jest mniejszy od mianownika, to{' '}
          <strong style={{ color: textColor }}>ułamek właściwy</strong>.
        </p>
      </div>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Jeśli
            dziecko myli licznik z mianownikiem przy zapisywaniu ułamka w zeszycie, wróćcie tu
            razem zamiast tłumaczyć od nowa za każdym razem: dolna liczba dzieli, górna liczy.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/przewodniki/slownik-ulamkow/pizza-podzielona-na-kawalki.jpg')}
            alt="Pizza podzielona na osiem równych kawałków, trzy kawałki zjedzone"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
