'use client';

import Image from 'next/image';
import { GuideAct } from '../guide-act';
import { DecimalPlaceBoard } from './decimal-place-board';
import { img } from '@/lib/media';

export function ActTablicaPozycyjna({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <GuideAct id="tablica-pozycyjna" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Tablica pozycyjna, tylko dłuższa</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Rzędy jedności, dziesiątek i setek znasz z liczb naturalnych. Teraz tabela rośnie w drugą
        stronę — w prawo od przecinka. Pokręć cyframi i posłuchaj, jak zmienia się odczyt.
      </p>

      <DecimalPlaceBoard color={color} />

      <div className="mt-8 grid items-center gap-6 md:grid-cols-[1fr_220px]">
        <div
          className="border-l-4 p-4 sm:p-5"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p className="mb-2 text-sm font-semibold" style={{ color: textColor }}>
            Jak to przeczytać na głos
          </p>
          <p className="text-sm leading-relaxed sm:text-base">
            Najpierw całości, potem słowo <strong>„i”</strong>, a na końcu wszystkie cyfry zza
            przecinka przeczytane razem, jak jedną liczbę — z nazwą{' '}
            <strong style={{ color: textColor }}>ostatniego</strong> rzędu. Dlatego 1,45 m to „jedna
            cała i czterdzieści pięć setnych metra”, a nie „jedna cała, cztery, pięć”.
          </p>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-[220px]">
          <Image
            src={img('/images/matematyka/przewodniki/zapis-dziesietny/pomiar-wzrostu-przy-scianie.jpg')}
            alt="Dziewczynka stoi wyprostowana przy futrynie drzwi, a dorosła dłoń zaznacza ołówkiem kreskę na wysokości jej głowy"
            width={220}
            height={165}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </GuideAct>
  );
}
