'use client';

import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActDodawanieIOdejmowanie } from './act-dodawanie-i-odejmowanie';
import { ActMnozenieIDzielenie } from './act-mnozenie-i-dzielenie';
import { ActRodzinyLiczb } from './act-rodziny-liczb';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { ACTS, ADDITION_EQUATION, MULTIPLICATION_EQUATION } from './guide-content';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { img } from '@/lib/media';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function SlownikDzialanGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/slownik-dzialan/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActDodawanieIOdejmowanie color={color} />
      <ActMnozenieIDzielenie color={color} />
      <ActRodzinyLiczb color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — te same dwa równania, teraz w pełni nazwane. */
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
        Teraz nazwiesz je sam
      </h2>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 font-mono text-2xl font-black" style={{ color }}>
            8 + 5 = 13
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {ADDITION_EQUATION.map((part) => (
              <li key={part.term + part.value}>
                <span className="font-mono font-bold" style={{ color: textColor }}>
                  {part.value}
                </span>{' '}
                — {part.term}
              </li>
            ))}
          </ul>
        </div>
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 font-mono text-2xl font-black" style={{ color }}>
            4 × 3 = 12
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {MULTIPLICATION_EQUATION.map((part) => (
              <li key={part.term + part.value}>
                <span className="font-mono font-bold" style={{ color: textColor }}>
                  {part.value}
                </span>{' '}
                — {part.term}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        Osiem słów, cztery działania. Znasz je teraz wszystkie — i wiesz, że odejmowanie odwraca
        dodawanie, a dzielenie odwraca mnożenie.
      </p>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Te słowa
            pojawiają się w poleceniach niemal każdego zadania w klasie 4 („oblicz sumę”, „znajdź
            iloczyn”), więc warto do tej strony wracać, gdy dziecko myli je przy odrabianiu lekcji.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/przewodniki/slownik-dzialan/waga-szalkowa.jpg')}
            alt="Mosiężna waga szalkowa na drewnianym stole"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
