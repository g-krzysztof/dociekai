'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { img } from '@/lib/media';

interface MysteryPart {
  value: number;
}

function MysteryEquation({
  parts,
  operator,
  color,
}: {
  parts: [number, number, number];
  operator: string;
  color: string;
}) {
  const items: (MysteryPart | 'op' | 'eq')[] = [
    { value: parts[0] },
    'op',
    { value: parts[1] },
    'eq',
    { value: parts[2] },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {items.map((item, i) => {
        if (item === 'op') {
          return (
            <span key={i} className="text-2xl font-black text-muted-foreground sm:text-3xl">
              {operator}
            </span>
          );
        }
        if (item === 'eq') {
          return (
            <span key={i} className="text-2xl font-black text-muted-foreground sm:text-3xl">
              =
            </span>
          );
        }
        return (
          <span key={i} className="flex flex-col items-center gap-1 border px-4 py-3 sm:px-5 sm:py-4" style={{ borderColor: `${color}40`, backgroundColor: `${color}0c` }}>
            <span className="font-mono text-3xl font-black leading-none tabular-nums sm:text-4xl" style={{ color }}>
              {item.value}
            </span>
            <span className="text-xs font-bold text-muted-foreground sm:text-sm">?</span>
          </span>
        );
      })}
    </div>
  );
}

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
          Umiesz nazwać te liczby?
        </h2>

        <div className="mb-6 flex flex-col items-center gap-6">
          <MysteryEquation parts={[8, 5, 13]} operator="+" color={color} />
          <MysteryEquation parts={[4, 3, 12]} operator="×" color={color} />
        </div>

        <Beat at={0.3} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Nie chodzi o wynik — <strong>13</strong> i <strong>12</strong> policzysz bez problemu.
            Chodzi o to, jak nazywają się poszczególne liczby w tych działaniach. Te nazwy mają
            osiem słów, a większości z nich jeszcze nie znasz.
          </p>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Zanim dojedziesz do końca tej strony, nazwiesz każdą liczbę w dodawaniu,
            odejmowaniu, mnożeniu i dzieleniu.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/slownik-dzialan/waga-szalkowa.jpg')}
          alt="Mosiężna waga szalkowa na drewnianym stole"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
