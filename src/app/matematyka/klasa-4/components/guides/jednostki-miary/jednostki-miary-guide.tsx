'use client';

import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActPrzedrostki } from './act-przedrostki';
import { ActDlugosc } from './act-dlugosc';
import { ActMasa } from './act-masa';
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

export function JednostkiMiaryGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/jednostki-miary/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActPrzedrostki color={color} />
      <ActDlugosc color={color} />
      <ActMasa color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — dziewięć słów, teraz jako jedna zasada widziana naraz. */
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
        Dziewięć słów, jedna zasada
      </h2>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Długość — baza: metr
          </p>
          <p className="font-mono text-lg font-black tabular-nums" style={{ color: textColor }}>
            mm · cm · dm · m · km
          </p>
        </div>
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Masa — baza: gram
          </p>
          <p className="font-mono text-lg font-black tabular-nums" style={{ color: textColor }}>
            g · dag · kg{' '}
            <span className="text-sm font-semibold text-muted-foreground">(+ t, osobno)</span>
          </p>
        </div>
      </div>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        Dziewięć słów z otwarcia tej strony to tak naprawdę dwie krótkie drabinki tego samego
        rodzaju — mili-/centy-/decy-/deka-/kilo- za każdym razem znaczą to samo, tylko doczepione
        do innej bazy.
      </p>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Jeśli
            dziecko myli, dlaczego z m na km jest ×1000, a z cm na m tylko ×10, to właśnie ten
            przewodnik wyjaśnia różnicę — wróćcie tu, gdy pytanie wróci przy odrabianiu lekcji.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/przewodniki/jednostki-miary/przybory-i-waga-razem.jpg')}
            alt="Linijka, taśma miernicza i waga szalkowa z odważnikami razem na drewnianym stole"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
