'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { img } from '@/lib/media';

const NINE_UNITS = ['mm', 'cm', 'dm', 'm', 'km', 'g', 'dag', 'kg', 't'];

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
          Dziewięć słów do zapamiętania?
        </h2>

        <div className="mb-6 flex flex-wrap justify-center gap-2 sm:gap-3">
          {NINE_UNITS.map((unit) => (
            <span
              key={unit}
              className="border-2 border-dashed px-3 py-2 font-mono text-lg font-black tabular-nums sm:px-4 sm:text-xl"
              style={{ borderColor: `${color}59`, color }}
            >
              {unit}
            </span>
          ))}
        </div>

        <Beat at={0.3} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Tyle jednostek długości i masy poznałeś/aś w dwóch ostatnich lekcjach. Wygląda na
            dziewięć osobnych słów do wykucia na pamięć — <strong>ale to nieprawda</strong>.
          </p>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Zanim dojedziesz do końca tej strony, zobaczysz, że to jedna prosta zasada, powtórzona
            dwa razy — raz dla metra, raz dla grama.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/jednostki-miary/przybory-i-waga-razem.jpg')}
          alt="Linijka, taśma miernicza i waga szalkowa z odważnikami razem na drewnianym stole"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
