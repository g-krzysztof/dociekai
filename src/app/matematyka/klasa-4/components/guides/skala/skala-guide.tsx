'use client';

import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActCoToSkala } from './act-co-to-skala';
import { ActPrzeliczanie } from './act-przeliczanie';
import { ActPlanIMapa } from './act-plan-i-mapa';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { ACTS } from './guide-content';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function SkalaGuide({ lesson, mathModule, nextLesson }: GuideProps) {
  const color = mathModule.color;

  return (
    <GuideShell
      lesson={lesson}
      mathModule={mathModule}
      acts={ACTS}
      nextLesson={nextLesson}
      outro={<Outro color={color} />}
      headerAside={
        <SummaryPlayer color={color} audioSrc="/audio/matematyka/przewodniki/skala/streszczenie.mp3">
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActCoToSkala color={color} />
      <ActPrzeliczanie color={color} />
      <ActPlanIMapa color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — ten sam zapis 1:100, teraz w pełni zrozumiały. */
function Outro({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Wracamy do pytania z początku
      </p>
      <h2 className="mb-5 text-2xl font-bold leading-snug sm:text-3xl">
        „1:100” już nie jest tajemniczym zapisem.
      </h2>

      <div className="mb-6 border bg-white p-5 text-center dark:bg-zinc-900/80 sm:p-6">
        <p className="font-mono text-2xl font-bold tabular-nums sm:text-3xl" style={{ color }}>
          1 : 100
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          1 jednostka na rysunku = 100 takich samych jednostek w rzeczywistości. Mnożysz, żeby
          znaleźć prawdziwą długość — dzielisz, żeby znaleźć długość na rysunku.
        </p>
      </div>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        Ten sam sposób myślenia wróci w kolejnych lekcjach, gdy będziesz czytać plany, mapy i
        rysunki techniczne — zawsze pytaj najpierw: jaka jest druga liczba skali?
      </p>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Jeśli
            dziecko myli, kiedy mnożyć, a kiedy dzielić, wróćcie tu razem i sprawdźcie skalę na
            prawdziwej mapie albo pudełku z modelem zabawki.
          </p>
        </div>
      </div>
    </div>
  );
}
