'use client';

import Image from 'next/image';
import { GuideShell } from '../guide-shell';
import { ActOtwarcie } from './act-otwarcie';
import { ActKoloIOkrag } from './act-kolo-i-okrag';
import { ActSrodekIPromien } from './act-srodek-i-promien';
import { ActSrednicaICieciwa } from './act-srednica-i-cieciwa';
import { ActWokolCiebie } from './act-wokol-ciebie';
import { SummaryPlayer } from '../summary-player';
import { SummaryDisplay } from './summary-content';
import { ACTS, CIRCLE_DIAGRAM } from './guide-content';
import { CircleFigure } from '../../circle-figure';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { img } from '@/lib/media';

interface GuideProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function SlownikKolaGuide({ lesson, mathModule, nextLesson }: GuideProps) {
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
          audioSrc="/audio/matematyka/przewodniki/slownik-kola/streszczenie.mp3"
        >
          <SummaryDisplay color={color} />
        </SummaryPlayer>
      }
    >
      <ActOtwarcie color={color} />
      <ActKoloIOkrag color={color} />
      <ActSrodekIPromien color={color} />
      <ActSrednicaICieciwa color={color} />
      <ActWokolCiebie color={color} />
    </GuideShell>
  );
}

/** Spłata obietnicy z pierwszego aktu — ten sam rysunek, teraz w pełni nazwany. */
function Outro({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Wracamy do pytania z początku
      </p>
      <h2 className="mb-5 text-2xl font-bold leading-snug sm:text-3xl">
        Cztery elementy, cztery nazwy — teraz już żadna nie jest tajemnicą.
      </h2>

      <div className="mb-6 grid items-center gap-6 border bg-white p-4 dark:bg-zinc-900/80 sm:grid-cols-[auto_1fr] sm:p-6">
        <div className="flex justify-center">
          <CircleFigure
            color={color}
            diagram={CIRCLE_DIAGRAM}
            fill
            ariaLabel="Koło z w pełni nazwanym środkiem, promieniem, średnicą i cięciwą"
            size={200}
            parts={{
              srodek: { shown: true, active: true, label: 'środek' },
              promien: { shown: true, active: true, label: 'promień' },
              srednica: { shown: true, active: true, label: 'średnica' },
              cieciwa: { shown: true, active: true, label: 'cięciwa' },
            }}
          />
        </div>
        <p className="text-base leading-relaxed sm:text-lg">
          Ten rysunek to teraz zamalowane <strong style={{ color: textColor }}>koło</strong>, nie
          sam <strong style={{ color: textColor }}>okrąg</strong>. Wewnątrz niego widzisz{' '}
          <strong style={{ color: textColor }}>środek</strong>,{' '}
          <strong style={{ color: textColor }}>promień</strong>,{' '}
          <strong style={{ color: textColor }}>średnicę</strong> i{' '}
          <strong style={{ color: textColor }}>cięciwę</strong> — dokładnie te same cztery
          elementy, które na początku strony nie miały jeszcze imienia.
        </p>
      </div>

      <p className="mb-6 text-base leading-relaxed sm:text-lg">
        Te słowa będą wracać w kolejnych lekcjach o kołach i okręgach — przy rysowaniu cyrklem,
        liczeniu obwodu koła i jego pola.
      </p>

      <div
        className="grid items-center gap-5 border-l-4 p-4 sm:p-5 md:grid-cols-[1fr_180px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-1 font-semibold">Dla rodziców</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To strona do czytania, nie do odpytywania — nie ma tu punktów ani wyniku. Jeśli
            dziecko myli koło z okręgiem albo nie wie, co to cięciwa, przy rysowaniu w zeszycie,
            wróćcie tu razem zamiast tłumaczyć od nowa za każdym razem.
          </p>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px]">
          <Image
            src={img('/images/matematyka/przewodniki/slownik-kola/kolo-rowerowe-szprychy.jpg')}
            alt="Koło rowerowe ze szprychami rozchodzącymi się od piasty na środku"
            width={180}
            height={135}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
