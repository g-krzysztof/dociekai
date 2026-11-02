'use client';

import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActDniTygodnia } from './act-dni-tygodnia';
import { ActMiesiace } from './act-miesiace';
import { ActRokPrzestepny } from './act-rok-przestepny';
import { ActLiczenieDni } from './act-liczenie-dni';
import { ActWokolCiebie } from './act-wokol-ciebie';
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

export function KalendarzGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/kalendarz/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActDniTygodnia color={color} />
      <ActMiesiace color={color} />
      <ActRokPrzestepny color={color} />
      <ActLiczenieDni color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — trzy pytania z otwarcia, teraz z odpowiedziami. */
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
        2025 → środa, 2026 → czwartek, 2027 → piątek
      </h2>

      <div className="mb-6 grid items-center gap-6 border bg-white p-4 dark:bg-zinc-900/80 sm:grid-cols-[140px_1fr] sm:p-6">
        <div className="relative mx-auto aspect-square w-full max-w-[140px]">
          <Image
            src={img('/images/matematyka/przewodniki/kalendarz/kalendarz-scienny-z-pinezka.jpg')}
            alt="Kalendarz ścienny z czerwoną pinezką zaznaczającą jeden dzień"
            width={140}
            height={140}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
        <p className="text-base leading-relaxed sm:text-lg">
          Rok zwykły ma{' '}
          <span className="font-mono font-black tabular-nums" style={{ color }}>
            365 = 52 × 7 + 1
          </span>{' '}
          dni, więc każda data wędruje o jeden dzień tygodnia dalej. Ale w roku przestępnym doliczasz
          jeszcze <strong style={{ color: textColor }}>29 lutego</strong> — i skok robi się
          podwójny.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Miesiące
          </p>
          <p className="font-mono text-lg font-black tabular-nums" style={{ color: textColor }}>
            7 × 31 dni, 4 × 30 dni
          </p>
        </div>
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Rok przestępny
          </p>
          <p className="font-mono text-lg font-black tabular-nums" style={{ color: textColor }}>
            co 4 lata (÷400 dla stuleci)
          </p>
        </div>
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Liczenie dni
          </p>
          <p className="text-sm font-semibold leading-snug" style={{ color: textColor }}>
            do końca miesiąca, potem dalej
          </p>
        </div>
      </div>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        Siedem dni tygodnia, dwanaście miesięcy o dwóch długościach i jedna reguła na lata
        przestępne — teraz umiesz odczytać dowolny kalendarz i policzyć upływ dni samodzielnie.
      </p>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Jeśli
            dziecko myli, ile dni ma dany miesiąc, albo zapomina, że luty w latach przestępnych ma
            29 dni, wróćcie tu razem zamiast tłumaczyć od nowa za każdym razem.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/przewodniki/kalendarz/kalendarz-biurkowy-i-dlugopis.jpg')}
            alt="Kalendarz biurkowy leżący na drewnianym stole obok długopisu"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
