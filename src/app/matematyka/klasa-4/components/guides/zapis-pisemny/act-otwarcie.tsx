'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { ColumnGrid } from '../../column-grid';
import { ALIGNMENT_EXAMPLE, ALIGNMENT_WRONG_CELLS } from './guide-content';
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
          {ALIGNMENT_EXAMPLE.long} + {ALIGNMENT_EXAMPLE.short} policzone w słupku wyszło 174. Coś
          tu nie gra.
        </h2>

        <div className="mb-6 flex justify-center overflow-x-auto">
          <ColumnGrid
            color={color}
            operator="+"
            cells={ALIGNMENT_WRONG_CELLS}
            ariaLabel={`Błędnie ustawione dodawanie ${ALIGNMENT_EXAMPLE.long} plus ${ALIGNMENT_EXAMPLE.short}, wynik 174`}
          />
        </div>

        <Beat at={0.3} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Cyfry są ustawione jedna pod drugą, dodawanie zrobione starannie, kolumna po
            kolumnie — a mimo to wynik jest kompletnie zły.{' '}
            <strong>
              {ALIGNMENT_EXAMPLE.long} + {ALIGNMENT_EXAMPLE.short} na pewno nie jest bliżej 174
              niż 100.
            </strong>{' '}
            Co poszło nie tak?
          </p>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Winne jest to, pod czym dokładnie stanęła cyfra {ALIGNMENT_EXAMPLE.short}. Zanim
            dojedziesz do końca tej strony, będziesz wiedzieć dokładnie, gdzie ustawić każdą
            cyfrę — i co zrobić, gdy liczby mają różną długość.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/zapis-pisemny/olowek-i-gumka-na-kartce-w-kratke.jpg')}
          alt="Ołówek i gumka leżące na otwartym zeszycie w kratkę"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
