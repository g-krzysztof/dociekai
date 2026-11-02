'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { SolidSpinner } from '../../solid-spinner';
import { img } from '@/lib/media';

const FLAT = { size: 96, x: 12, y: 12 };

export function ActOtwarcie({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <GuideAct id="otwarcie" mode="flow">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_240px]">
        <div>
          <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">
            Czym różni się kartka od pudełka?
          </h2>

          <p className="mb-8 max-w-2xl text-base leading-relaxed sm:text-lg">
            Do tej pory cała geometria mieściła się na kartce: punkty, odcinki, kąty, prostokąty,
            pola. Teraz wychodzimy z kartki. Po lewej stronie jest{' '}
            <strong>figura płaska</strong>, po prawej <strong>bryła</strong> — i to nie jest ten sam
            kwadrat narysowany dwa razy.
          </p>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <figure className="border p-5" style={{ borderColor: `${color}40` }}>
              <figcaption className="mb-3 text-center">
                <span className="block text-sm font-bold" style={{ color: textColor }}>
                  Figura płaska
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  Mieści się cała na kartce. Ma długość i szerokość — i nic więcej.
                </span>
              </figcaption>
              <svg viewBox="0 0 120 120" className="mx-auto h-auto w-full max-w-[160px]" aria-hidden>
                <rect
                  x={FLAT.x}
                  y={FLAT.y}
                  width={FLAT.size}
                  height={FLAT.size}
                  fill={`${color}26`}
                  stroke={color}
                  strokeWidth={2.5}
                />
              </svg>
            </figure>

            <figure className="border p-5" style={{ borderColor: color, backgroundColor: `${color}0c` }}>
              <figcaption className="mb-3 text-center">
                <span className="block text-sm font-bold" style={{ color: textColor }}>
                  Bryła
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  Zajmuje miejsce w przestrzeni. Ma jeszcze trzeci wymiar — grubość.
                </span>
              </figcaption>
              <SolidSpinner
                spec={{ width: 4.8, height: 4.8, depth: 4.8 }}
                color={color}
                ariaLabel="Sześcian, który można obracać przeciągnięciem myszą lub palcem"
                className="[&_svg]:max-w-[160px]"
              />
            </figure>
          </div>

          <Beat at={0.3} className="mb-6">
            <p className="max-w-2xl text-base leading-relaxed sm:text-lg">
              Bryły trzeba jakoś <strong>rysować na płaskiej kartce</strong> i jakoś{' '}
              <strong>nazywać ich części</strong>. Jedno i drugie to umowa — taka sama jak zapis{' '}
              <em>1:100</em> przy skali albo znaczek ⊥ przy prostopadłości. Poznasz ją tutaj, zanim
              lekcje każą ci z niej korzystać.
            </p>
          </Beat>

          <Beat at={0.55}>
            <p className="max-w-2xl text-sm leading-relaxed" style={{ color: textColor }}>
              Zanim dojedziesz do końca tej strony, nazwiesz każdą część pudełka, odróżnisz sześć
              brył po nazwie i będziesz wiedzieć, dlaczego niektóre kreski na rysunku bryły są
              przerywane.
            </p>
          </Beat>
        </div>

        <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
          <Image
            src={img('/images/matematyka/przewodniki/jezyk-bryl/pudelko-i-kartka.jpg')}
            alt="Kartonowe pudełko stojące obok leżącej kartki papieru z narysowanym kwadratem"
            width={240}
            height={180}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>
    </GuideAct>
  );
}
