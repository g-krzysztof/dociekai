'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { MiniFraction } from '../../mini-fraction';
import { DecimalNumeral } from './decimal-numeral';
import { OPENING_VALUE } from './guide-content';
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
          Skąd w liczbie bierze się przecinek?
        </h2>

        <div className="mb-6 flex flex-col items-center gap-2">
          <DecimalNumeral
            value={OPENING_VALUE}
            color={color}
            className="text-6xl sm:text-7xl"
          />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            tyle kosztuje bułka — w złotych
          </p>
        </div>

        <Beat at={0.3} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Trzy złote to cała, policzalna rzecz — trzy monety. Ale do zapłacenia jest jeszcze 25
            groszy, a grosz to kawałek złotówki, nie osobna złotówka. Żeby zmieścić jedno i drugie
            w <strong>jednej liczbie</strong>, stawia się <strong>przecinek</strong>: przed nim
            całości, za nim części całości.
          </p>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Złotówkę dzieli się na sto groszy, więc 25 groszy to{' '}
            <MiniFraction licznik={25} mianownik={100} color={textColor} /> złotówki. Te części mają
            swoje nazwy i swój porządek — i właśnie tego zaraz się nauczysz.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/zapis-dziesietny/chlopiec-placi-monetami.jpg')}
          alt="Chłopiec kładzie monety na drewnianej ladzie w małym sklepie z pieczywem"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
