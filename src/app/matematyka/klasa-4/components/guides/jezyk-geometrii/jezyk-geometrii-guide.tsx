'use client';

import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActPunktyProste } from './act-punkty-proste';
import { ActPolprostaOdcinek } from './act-polprosta-odcinek';
import { ActKatISymbole } from './act-kat-i-symbole';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { ACTS, POINT_A, POINT_B } from './guide-content';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { img } from '@/lib/media';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function JezykGeometriiGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/jezyk-geometrii/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActPunktyProste color={color} />
      <ActPolprostaOdcinek color={color} />
      <ActKatISymbole color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — te same dwa punkty, teraz w pełni nazwane. */
function Outro({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Wracamy do pytania z początku
      </p>
      <h2 className="mb-5 text-2xl font-bold leading-snug sm:text-3xl">
        „Ten punkt” to za mało. Punkt A to wystarczy.
      </h2>

      <div className="mb-6 grid items-center gap-6 border bg-white p-4 dark:bg-zinc-900/80 sm:grid-cols-[auto_1fr] sm:p-6">
        <div className="flex justify-center overflow-x-auto">
          <svg
            viewBox="0 0 400 220"
            width={220}
            height={121}
            role="img"
            aria-label="Punkty A i B, teraz nazwane"
          >
            <circle cx={POINT_A.x} cy={POINT_A.y} r={6} fill={color} />
            <circle cx={POINT_B.x} cy={POINT_B.y} r={6} fill={color} />
            <text x={POINT_A.x - 20} y={POINT_A.y + 6} style={{ fontSize: 20, fontWeight: 800 }} fill={textColor}>
              A
            </text>
            <text x={POINT_B.x + 12} y={POINT_B.y - 8} style={{ fontSize: 20, fontWeight: 800 }} fill={textColor}>
              B
            </text>
          </svg>
        </div>
        <p className="text-base leading-relaxed sm:text-lg">
          Wystarczy jedna litera, żeby wskazać punkt bez pomyłki — a dwie, trzy albo symbol ⊥/∥,
          żeby nazwać każdą inną figurę, którą poznasz w tym module.{' '}
          <strong style={{ color: textColor }}>Nazwa zastępuje wskazywanie palcem.</strong>
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Punkt / prosta
          </p>
          <p className="text-sm font-semibold leading-snug" style={{ color: textColor }}>
            1 lub 2 litery, kolejność bez znaczenia
          </p>
        </div>
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Odcinek / półprosta
          </p>
          <p className="text-sm font-semibold leading-snug" style={{ color: textColor }}>
            2 litery — kolejność liczy się tylko dla półprostej
          </p>
        </div>
        <div className="border bg-white p-4 dark:bg-zinc-900/80">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>
            Kąt
          </p>
          <p className="font-mono text-lg font-black tabular-nums" style={{ color: textColor }}>
            ∠ABC, w °
          </p>
        </div>
      </div>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        Ten język będzie wracać w każdej kolejnej lekcji modułu — przy rysowaniu prostych i
        odcinków, mierzeniu kątów kątomierzem, wielokątach i kołach.
      </p>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Jeśli
            dziecko myli odcinek z półprostą albo nie wie, gdzie jest wierzchołek kąta przy
            rysowaniu w zeszycie, wróćcie tu razem zamiast tłumaczyć od nowa za każdym razem.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/przewodniki/jezyk-geometrii/katomierz-linijka-i-ekierka.jpg')}
            alt="Kątomierz, linijka i ekierka ułożone na drewnianym stole"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
