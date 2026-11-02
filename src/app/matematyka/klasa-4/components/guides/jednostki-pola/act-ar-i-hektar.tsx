'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { BIG_UNITS } from './guide-content';
import { img } from '@/lib/media';

export function ActArIHektar({ color }: { color: string }) {
  return (
    <GuideAct id="ar-i-hektar" mode="flow">
      <ArIHektarBody color={color} />
    </GuideAct>
  );
}

function ArIHektarBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div>
      <div className="mb-6 grid items-center gap-8 lg:grid-cols-[1fr_240px]">
        <div>
          <h2 className="mb-4 text-2xl font-bold leading-snug sm:text-3xl">
            Ar i hektar — jednostki dla pól i działek
          </h2>
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Metrami kwadratowymi wygodnie mierzy się mieszkanie, ale pole uprawne? Wyszłyby dziesiątki
            tysięcy. Dlatego rolnicy i geodeci mają własne kratki — też kwadratowe, tylko
            odpowiednio większe. <strong style={{ color: textColor }}>Ar</strong> i{' '}
            <strong style={{ color: textColor }}>hektar</strong> nie wyłamują się z reguły: dzieli je
            dokładnie 100, tak jak wszystkie pozostałe.
          </p>
        </div>

        <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
          <Image
            src={img('/images/matematyka/przewodniki/jednostki-pola/pola-uprawne-z-lotu-ptaka.jpg')}
            alt="Widok z góry na mozaikę prostokątnych pól uprawnych rozdzielonych miedzami i pasami drzew"
            width={240}
            height={180}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>

      <Beat at={0.35}>
        <ol className="divide-y border bg-white dark:bg-zinc-900/80">
          {BIG_UNITS.map((unit, index) => (
            <li key={unit.code} className="flex items-start gap-4 p-4">
              <span
                className="w-8 shrink-0 font-mono text-2xl font-bold leading-none tabular-nums"
                style={{ color }}
              >
                {index + 1}
              </span>
              <div>
                <p className="mb-1 text-base font-bold">
                  <span className="font-mono" style={{ color: textColor }}>
                    1 {unit.code}
                  </span>{' '}
                  = {unit.side} = {unit.inMeters}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">{unit.reference}</p>
              </div>
            </li>
          ))}
        </ol>
      </Beat>

      <Beat at={0.6} className="mt-6">
        <div className="border-l-2 p-4" style={{ borderColor: color, backgroundColor: `${color}0d` }}>
          <p className="text-base leading-relaxed">
            Zwróć uwagę na jedno: <strong style={{ color: textColor }}>ar leży między m² a hektarem</strong>,
            a hektar między arem a km². Wskakują dokładnie w te miejsca, w których krok ×100 inaczej
            zrobiłby się nie do przeskoczenia — bez nich z metrów kwadratowych na kilometry
            kwadratowe trzeba by skakać od razu o milion.
          </p>
        </div>
      </Beat>
    </div>
  );
}
