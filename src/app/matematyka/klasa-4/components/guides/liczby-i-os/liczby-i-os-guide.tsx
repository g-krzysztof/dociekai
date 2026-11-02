'use client';

import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActCyfraLiczba } from './act-cyfra-liczba';
import { ActRzedyIKlasy } from './act-rzedy-i-klasy';
import { ActOsLiczbowa } from './act-os-liczbowa';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { ACTS, HOOK_VALUE } from './guide-content';
import { classesOf } from '../../../lib/place-value';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { img } from '@/lib/media';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function LiczbyIOsGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/liczby-i-os/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActCyfraLiczba color={color} />
      <ActRzedyIKlasy color={color} />
      <ActOsLiczbowa color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — ta sama liczba, teraz rozłożona na klasy. */
function Outro({ color }: { color: string }) {
  const classes = classesOf(HOOK_VALUE);
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

      <p className="mb-4 font-mono text-3xl font-black leading-none sm:text-5xl" style={{ color }}>
        {classes.map((c) => c.digits).join(' ')}
      </p>

      <ol className="mb-5 divide-y border bg-white dark:bg-zinc-900/80">
        {classes.map((klass) => (
          <li key={klass.name} className="flex items-center gap-4 px-4 py-2.5">
            <span className="w-16 shrink-0 font-mono text-lg font-black" style={{ color }}>
              {klass.digits}
            </span>
            <span className="font-mono text-sm font-bold tabular-nums" style={{ color: textColor }}>
              {klass.value.toLocaleString('pl-PL')}
            </span>
            <span className="text-sm text-muted-foreground">{klass.name}</span>
          </li>
        ))}
      </ol>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        365 dni × 24 godziny × 60 minut × 60 sekund ={' '}
        <strong>{HOOK_VALUE.toLocaleString('pl-PL')}</strong>. Tyle sekund ma rok. Znasz różnicę
        między cyfrą a liczbą, wiesz, że miejsce decyduje o wartości, i wiesz, jak czytać liczbę
        klasa po klasie.
      </p>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Jeśli
            dziecko myli cyfrę z liczbą albo gubi się przy zerach w dużej liczbie, wróćcie tutaj:
            rejestr rzędów i klasy tłumaczą to krok po kroku.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/przewodniki/liczby-i-os/nocne-niebo.jpg')}
            alt="Rozgwieżdżone nocne niebo nad ciemnym krajobrazem"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
