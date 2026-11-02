'use client';

import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { ActOtwarcie } from './act-otwarcie';
import { ActTrzySlowa } from './act-trzy-slowa';
import { ActRodzinaBryl } from './act-rodzina-bryl';
import { ActProstopadloscianISzescian } from './act-prostopadloscian-i-szescian';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { ACTS } from './guide-content';
import { SolidSpinner } from '../../solid-spinner';
import { BOX_PARTS } from '../../../lib/solids';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { img } from '@/lib/media';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function JezykBrylGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/jezyk-bryl/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActTrzySlowa color={color} />
      <ActRodzinaBryl color={color} />
      <ActProstopadloscianISzescian color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

const RECAP = [
  { count: BOX_PARTS.sciany, label: 'ścian', hint: 'każda jest prostokątem' },
  { count: BOX_PARTS.krawedzie, label: 'krawędzi', hint: 'tam, gdzie stykają się dwie ściany' },
  { count: BOX_PARTS.wierzcholki, label: 'wierzchołków', hint: 'tam, gdzie schodzą się krawędzie' },
];

/** Spłata obietnicy z pierwszego aktu: to samo pudełko, tylko już nazwane. */
function Outro({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Wracamy do pudełka z początku
      </p>
      <h2 className="mb-5 text-2xl font-bold leading-snug sm:text-3xl">
        To samo pudełko — tyle że teraz umiesz nazwać każdy jego kawałek.
      </h2>

      <div className="mb-6 grid items-center gap-6 border bg-white p-4 dark:bg-zinc-900/80 sm:grid-cols-[220px_1fr] sm:p-6">
        <SolidSpinner
          spec={{ width: 4.4, height: 3, depth: 3 }}
          color={color}
          ariaLabel="Prostopadłościan z widocznymi krawędziami ciągłymi i zasłoniętymi przerywanymi"
          className="[&_svg]:max-w-[200px]"
        />
        <ul className="space-y-3">
          {RECAP.map((item) => (
            <li key={item.label} className="flex items-baseline gap-3">
              <span
                className="w-8 shrink-0 text-right font-mono text-2xl font-black tabular-nums"
                style={{ color }}
              >
                {item.count}
              </span>
              <span className="text-base leading-snug sm:text-lg">
                <strong style={{ color: textColor }}>{item.label}</strong>{' '}
                <span className="text-sm text-muted-foreground">— {item.hint}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        Te słowa wracają w każdej lekcji tego działu: przy opisie prostopadłościanu, przy siatkach
        (czyli rozłożonej na płasko bryle), przy objętości i przy polu powierzchni. Jeśli któreś
        z nich zniknie z głowy, wróć tutaj — od tego jest ta strona.
      </p>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Najlepiej
            działa z pudełkiem w ręku: policzcie razem ściany, przejedźcie palcem po krawędzi,
            dotknijcie wierzchołka. Trzy słowa dotknięte na prawdziwym kartonie zostają w głowie
            na dłużej niż trzy definicje przeczytane z ekranu.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/przewodniki/jezyk-bryl/klocki-drewniane.jpg')}
            alt="Drewniane klocki w kształcie sześcianu, prostopadłościanu i ostrosłupa leżące na stole"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
