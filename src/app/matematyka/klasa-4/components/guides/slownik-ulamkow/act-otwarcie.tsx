'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { FractionPie } from '../../fraction-pie';
import { OPENING_LICZNIK, OPENING_MIANOWNIK } from './guide-content';
import { img } from '@/lib/media';

const OPENING_FILLED = new Set(Array.from({ length: OPENING_LICZNIK }, (_, i) => i));

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
          Jak zapisać, ile zjadłeś?
        </h2>

        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="w-full max-w-[200px]">
            <FractionPie
              color={color}
              mianownik={OPENING_MIANOWNIK}
              filled={OPENING_FILLED}
              ariaLabel={`Pizza podzielona na ${OPENING_MIANOWNIK} kawałków, ${OPENING_LICZNIK} zamalowane`}
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {OPENING_LICZNIK} z {OPENING_MIANOWNIK} kawałków — zjedzone
          </p>
        </div>

        <Beat at={0.3} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Cała pizza podzielona na równe kawałki, a kilku z nich już brakuje. Jak jednym
            zapisem pokazać dokładnie tyle, ile zostało zjedzone? Do tego służy{' '}
            <strong>ułamek</strong> — dwie liczby oddzielone poziomą kreską.
          </p>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Obie liczby w ułamku mają swoje imiona, a to, która z nich jest większa, mówi coś
            ważnego o samym ułamku. Zaraz się tego nauczysz.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/slownik-ulamkow/pizza-podzielona-na-kawalki.jpg')}
          alt="Pizza podzielona na osiem równych kawałków, trzy kawałki zjedzone"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
