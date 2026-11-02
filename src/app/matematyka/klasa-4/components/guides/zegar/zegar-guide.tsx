'use client';

import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActWskazowki } from './act-wskazowki';
import { ActCzytanie } from './act-czytanie';
import { ActZapis1224 } from './act-zapis-12-24';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { ClockFace } from '../../clock-face';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { ACTS } from './guide-content';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { img } from '@/lib/media';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ZegarGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/zegar/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActWskazowki color={color} />
      <ActCzytanie color={color} />
      <ActZapis1224 color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — ten sam pociąg, teraz z odpowiedzią. */
function Outro({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <p
        className="mb-1 text-xs font-bold uppercase tracking-[0.15em]"
        style={{ color: textColor }}
      >
        Obiecaliśmy na początku
      </p>
      <h2 className="mb-5 text-2xl font-bold leading-snug sm:text-3xl">
        19:42 na zegarze ze wskazówkami to po prostu 7:42
      </h2>

      <div className="mb-6 grid items-center gap-6 border bg-white p-4 dark:bg-zinc-900/80 sm:grid-cols-[140px_1fr] sm:p-6">
        <ClockFace
          color={color}
          hours24={19}
          minutes={42}
          size={140}
          ariaLabel="Tarcza zegara pokazująca godzinę 19:42"
        />
        <p className="text-base leading-relaxed sm:text-lg">
          Wystarczyło odjąć 12 godzin:{' '}
          <span className="font-mono font-black tabular-nums" style={{ color }}>
            19 − 12 = 7
          </span>
          . Wskazówki ustawiają się dokładnie tak samo dla „19:42”, jak dla „7:42” — różnica jest
          tylko w zapisie, nie w położeniu wskazówek. Dopowiadamy{' '}
          <strong style={{ color: textColor }}>„wieczorem”</strong>, żeby nie pomylić z 7:42
          rano.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Jednostki czasu
          </p>
          <p className="font-mono text-lg font-black tabular-nums" style={{ color: textColor }}>
            60 s · 60 min · 24 h
          </p>
        </div>
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Dwa zapisy
          </p>
          <p className="text-sm font-semibold leading-snug" style={{ color: textColor }}>
            12-godzinny (+ pora dnia) i 24-godzinny (0–23)
          </p>
        </div>
      </div>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        Trzy wskazówki, cztery kwadransowe pozycje i dwa zapisy tej samej godziny — teraz umiesz
        przejść między nimi w obie strony.
      </p>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Jeśli dziecko
            myli „wpół do” z „kwadrans po” albo zapis 24-godzinny z 12-godzinnym, wróćcie tu razem
            zamiast tłumaczyć od nowa za każdym razem.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/przewodniki/zegar/zegar-scienny-i-budzik.jpg')}
            alt="Drewniany zegar ścienny ze wskazówkami obok małego budzika podróżnego"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
