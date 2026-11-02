'use client';

import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActNawiasy } from './act-nawiasy';
import { ActMnozenieIDzielenie } from './act-mnozenie-i-dzielenie';
import { ActOdLewej } from './act-od-lewej';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { ACTS, RULES } from './guide-content';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { img } from '@/lib/media';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function KolejnoscDzialanGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/kolejnosc-dzialan/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActNawiasy color={color} />
      <ActMnozenieIDzielenie color={color} />
      <ActOdLewej color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — te same dwie odpowiedzi, teraz wiesz, która i dlaczego. */
function Outro({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Obiecaliśmy na początku
      </p>
      <h2 className="mb-5 text-2xl font-bold leading-snug sm:text-3xl">
        2 + 3 × 4 = 14, nie 20 — teraz wiesz dlaczego
      </h2>

      <ol className="mb-6 divide-y border">
        {RULES.map((rule, index) => (
          <li key={rule} className="flex items-start gap-4 bg-white px-4 py-3 dark:bg-zinc-900/80">
            <span
              className="w-6 shrink-0 font-mono text-lg font-bold leading-none tabular-nums"
              style={{ color }}
            >
              {index + 1}
            </span>
            <span className="text-sm leading-relaxed sm:text-base">{rule}</span>
          </li>
        ))}
      </ol>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        Trzy zasady, jedna stała kolejność — działa dla każdego wyrażenia, niezależnie od tego, jak
        długie i zagmatwane by nie było.
      </p>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ta strona wprowadza konwencję, z której korzysta cała dalsza matematyka — warto do niej
            wracać, gdy dziecko liczy złożone wyrażenia w zeszycie i myli kolejność. Najczęstszy
            błąd to liczenie „na siłę” od lewej do prawej bez sprawdzenia, czy w wyrażeniu jest
            mnożenie, dzielenie albo nawias.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/przewodniki/kolejnosc-dzialan/drogowskaz.jpg')}
            alt="Drewniany drogowskaz w lesie ze strzałkami wskazującymi w dwie różne strony"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
