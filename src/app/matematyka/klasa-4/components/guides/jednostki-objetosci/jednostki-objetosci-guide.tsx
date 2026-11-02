'use client';

import { GuideShell } from '../guide-shell';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { ActOtwarcie } from './act-otwarcie';
import { ActBokAObjetosc } from './act-bok-a-objetosc';
import { ActLitrIDecymetr } from './act-litr-i-decymetr';
import { ActDrabina } from './act-drabina';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { ACTS } from './guide-content';
import { VOLUME_UNIT_RULES } from '../../../lib/volume-units';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function JednostkiObjetosciGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/jednostki-objetosci/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActBokAObjetosc color={color} />
      <ActLitrIDecymetr color={color} />
      <ActDrabina color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu: nazwana kostka, na którą wszyscy się umówili. */
function Outro({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Wracamy do kostki z początku
      </p>
      <h2 className="mb-5 text-2xl font-bold leading-snug sm:text-3xl">
        Teraz twoja kostka ma nazwę — i to nawet dwie.
      </h2>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        Pudełko, które rozkładałeś na siatkę, można teraz nie tylko opisać, ale i{' '}
        <strong style={{ color: textColor }}>zmierzyć w środku</strong>. Miarką jest sześcian: 1 cm³,
        1 dm³ albo 1 m³ — zależnie od tego, czy mierzysz kostkę cukru, karton mleka czy zbiornik na
        deszczówkę. A jeśli w treści zadania pojawi się litr, to nie jest nowa jednostka do
        wykucia — to po prostu 1 dm³ pod innym imieniem.
      </p>

      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h3 className="mb-1 text-xl font-bold">Ściąga: jednostki objętości</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Sześć zdań, które wystarczą na cały ten temat.
        </p>
        <ol className="divide-y border bg-white dark:bg-zinc-900/80">
          {VOLUME_UNIT_RULES.map((rule, index) => (
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
