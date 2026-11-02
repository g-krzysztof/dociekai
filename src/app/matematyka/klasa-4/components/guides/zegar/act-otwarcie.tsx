'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { img } from '@/lib/media';

export function ActOtwarcie({ color }: { color: string }) {
  return (
    <GuideAct id="otwarcie" mode="flow">
      <OtwarcieBody color={color} />
    </GuideAct>
  );
}

function OtwarcieBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_240px]">
      <div>
        <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">
          Pociąg odjeżdża o 19:42. Jak to ustawić na zwykłym zegarze?
        </h2>

        <div className="mb-6 flex justify-center">
          <span
            className="border-2 border-dashed px-5 py-3 font-mono text-3xl font-black tabular-nums sm:px-6 sm:text-4xl"
            style={{ borderColor: `${color}59`, color }}
          >
            19:42
          </span>
        </div>

        <Beat at={0.3} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Tak stoi na rozkładzie jazdy. Ale zwykły zegar ze wskazówkami w domu nigdy nie
            pokazuje liczby większej niż 12 — nie ma na nim żadnej „19”.{' '}
            <strong>Jak więc ustawić wskazówki, żeby pokazywały tę samą godzinę?</strong>
          </p>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Zanim dojedziesz do końca tej strony, będziesz umieć zamienić dowolną godzinę z
            zapisu 24-godzinnego na ustawienie wskazówek zegara — i odwrotnie.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/zegar/zegar-scienny-i-budzik.jpg')}
          alt="Drewniany zegar ścienny ze wskazówkami obok małego budzika podróżnego"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
