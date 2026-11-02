'use client';

import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActCorazMniejszeCzesci } from './act-coraz-mniejsze-czesci';
import { ActTablicaPozycyjna } from './act-tablica-pozycyjna';
import { ActUwagaNaZera } from './act-uwaga-na-zera';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { MiniFraction } from '../../mini-fraction';
import { DecimalNumeral } from './decimal-numeral';
import { ACTS, OPENING_VALUE } from './guide-content';
import { readDecimal } from '../../../lib/decimal';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { img } from '@/lib/media';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ZapisDziesietnyGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/zapis-dziesietny/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActCorazMniejszeCzesci color={color} />
      <ActTablicaPozycyjna color={color} />
      <ActUwagaNaZera color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — ta sama cena, teraz rozebrana na rzędy. */
function Outro({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Wracamy do ceny z początku
      </p>
      <h2 className="mb-5 text-2xl font-bold leading-snug sm:text-3xl">
        Jedna liczba, dwie części — i już wiesz, jak przeczytać każdą z nich.
      </h2>

      <div className="mb-6 grid items-center gap-6 border bg-white p-4 dark:bg-zinc-900/80 sm:grid-cols-[auto_1fr] sm:p-6">
        <DecimalNumeral
          value={OPENING_VALUE}
          color={color}
          className="block text-center text-5xl sm:text-6xl"
        />
        <p className="text-base leading-relaxed sm:text-lg">
          Czytamy: <strong style={{ color: textColor }}>{readDecimal(OPENING_VALUE)}</strong>. Przed
          przecinkiem 3 całe złotówki, za przecinkiem{' '}
          <MiniFraction licznik={25} mianownik={100} color={textColor} /> złotówki — dwadzieścia pięć
          groszy. Drugie miejsce po przecinku to rząd{' '}
          <strong style={{ color: textColor }}>setnych</strong>, więc obie cyfry zza przecinka czyta
          się razem, jako jedną liczbę.
        </p>
      </div>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Najczęstsza
            pomyłka na starcie to czytanie liczby cyfra po cyfrze („trzy przecinek dwa pięć”) —
            wtedy 3,25 i 3,205 brzmią niemal tak samo. Przy zakupach warto zapytać wprost: „ile to
            całych złotych, a ile setnych?”.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/przewodniki/zapis-dziesietny/chlopiec-placi-monetami.jpg')}
            alt="Chłopiec kładzie monety na drewnianej ladzie w małym sklepie z pieczywem"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
