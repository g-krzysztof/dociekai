'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActKreski } from './act-kreski';
import { ActSiedemZnakow } from './act-siedem-znakow';
import { ActDodawanie } from './act-dodawanie';
import { ActPowtorzenia } from './act-powtorzenia';
import { ActOdejmowanie } from './act-odejmowanie';
import { ActTarcza } from './act-tarcza';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { ACTS, INSCRIPTIONS, type Inscription } from './guide-content';
import { romanChunksOf } from '../../../lib/roman';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { img } from '@/lib/media';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function CyfryRzymskieGuide({ lesson, mathModule, nextLesson }: GuideProps) {
  const [chosen, setChosen] = useState<Inscription>(INSCRIPTIONS[0]);
  const color = mathModule.color;

  return (
    <GuideShell
      lesson={lesson}
      mathModule={mathModule}
      acts={ACTS}
      nextLesson={nextLesson}
      outro={<Outro color={color} chosen={chosen} />}
      headerAside={
        <SummaryPlayer
          color={color}
          audioSrc="/audio/matematyka/przewodniki/cyfry-rzymskie/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} chosen={chosen} onChoose={setChosen} />
      <ActKreski color={color} />
      <ActSiedemZnakow color={color} />
      <ActDodawanie color={color} />
      <ActPowtorzenia color={color} />
      <ActOdejmowanie color={color} />
      <ActTarcza color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — wybrany napis, teraz z pełnym rozbiciem. */
function Outro({ color, chosen }: { color: string; chosen: Inscription }) {
  const chunks = romanChunksOf(chosen.value);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <p
        className="mb-1 text-xs font-bold uppercase tracking-[0.15em]"
        style={{ color: textColor }}
      >
        Obiecaliśmy na początku
      </p>
      <h2 className="mb-5 text-2xl font-bold leading-snug sm:text-3xl">Teraz przeczytasz to sam</h2>

      <p className="mb-4 font-mono text-4xl font-black leading-none sm:text-6xl" style={{ color }}>
        {chosen.symbols}
      </p>

      <ol className="mb-5 divide-y border bg-white dark:bg-zinc-900/80">
        {chunks.map((chunk) => (
          <li key={chunk.place} className="flex items-center gap-4 px-4 py-2.5">
            <span className="w-16 shrink-0 font-mono text-lg font-black" style={{ color }}>
              {chunk.symbols}
            </span>
            <span className="font-mono text-sm font-bold tabular-nums" style={{ color: textColor }}>
              {chunk.value}
            </span>
            <span className="text-sm text-muted-foreground">
              {chunk.place}
              {chunk.subtractive ? ' · mniejszy przed większym' : ''}
            </span>
          </li>
        ))}
      </ol>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        <strong>
          {chosen.symbols} = {chosen.value}
        </strong>{' '}
        — {chosen.label}. Znasz siedem znaków, wiesz kiedy dodawać, a kiedy odejmować, i wiesz,
        czego nie wolno powtarzać więcej niż trzy razy.
      </p>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Jeśli dziecko
            utknie w lekcji, wróćcie tutaj: zasady są wyłożone po kolei, a rozdział „Pobaw się”
            pozwala sprawdzić dowolną liczbę bez presji.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/lekcje/system-rzymski/zegar-sloneczny.jpg')}
            alt="Kamienny zegar słoneczny w ogrodzie"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
