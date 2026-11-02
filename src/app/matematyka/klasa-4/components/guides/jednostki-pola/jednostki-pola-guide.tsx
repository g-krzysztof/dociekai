'use client';

import { GuideShell } from '../guide-shell';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { ActOtwarcie } from './act-otwarcie';
import { ActBokAPole } from './act-bok-a-pole';
import { ActDrabina } from './act-drabina';
import { ActArIHektar } from './act-ar-i-hektar';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { ACTS } from './guide-content';
import { AREA_UNIT_RULES } from '../../../lib/area-units';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function JednostkiPolaGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/jednostki-pola/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActBokAPole color={color} />
      <ActDrabina color={color} />
      <ActArIHektar color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu: nazwana kratka, na którą wszyscy się umówili. */
function Outro({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Wracamy do kratki z początku
      </p>
      <h2 className="mb-5 text-2xl font-bold leading-snug sm:text-3xl">
        Teraz twoja kratka ma nazwę — i każdy ją zrozumie tak samo.
      </h2>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        Na poprzedniej lekcji pole było „liczbą kratek”, a kratka mogła być dowolna. Od teraz kratka
        ma umówiony rozmiar i nazwę, więc <strong style={{ color: textColor }}>24 cm²</strong> znaczy
        to samo dla ciebie, dla nauczyciela i dla murarza. Jedyne, o czym trzeba pamiętać, to że
        drabinka pola idzie krokiem ×100 — bo bok liczy się dwa razy.
      </p>

      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h3 className="mb-1 text-xl font-bold">Ściąga: jednostki pola</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Sześć zdań, które wystarczą na cały ten temat.
        </p>
        <ol className="divide-y border bg-white dark:bg-zinc-900/80">
          {AREA_UNIT_RULES.map((rule, index) => (
            <li key={rule} className="flex items-start gap-4 px-4 py-3">
              <span
                className="w-6 shrink-0 font-mono text-lg font-bold leading-none tabular-nums"
                style={{ color }}
              >
                {index + 1}
              </span>
              <span className="text-sm leading-relaxed">{rule}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
