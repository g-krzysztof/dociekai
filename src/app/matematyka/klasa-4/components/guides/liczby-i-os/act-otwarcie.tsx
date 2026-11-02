'use client';

import Image from 'next/image';
import { RomanOdometer } from '../../roman-odometer';
import { Beat, GuideAct, useActStep } from '../guide-act';
import { HOOK_VALUE } from './guide-content';
import { img } from '@/lib/media';

export function ActOtwarcie({ color }: { color: string }) {
  return (
    <GuideAct id="otwarcie" mode="flow">
      <OtwarcieBody color={color} />
    </GuideAct>
  );
}

/** Licznik odjeżdża od 0 do HOOK_VALUE w takt przewijania — ta sama technika co przy odczytywaniu napisu rzymskiego, tylko na dłuższym, dziesiętnym liczniku. */
function OtwarcieBody({ color }: { color: string }) {
  const value = useActStep(HOOK_VALUE, 0.05, 0.6);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_240px]">
      <div>
        <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">Ile to jest?</h2>

        <div className="mb-8 flex justify-center lg:justify-start">
          <RomanOdometer value={value} digits={8} color={color} label="sekund w roku" />
        </div>

        <Beat at={0.62} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Osiem cyfr pod rząd. Spróbuj przeczytać tę liczbę na głos jednym tchem — trudno nawet
            powiedzieć, ile w niej w ogóle jest cyfr.
          </p>
        </Beat>

        <Beat at={0.8}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Zanim dojedziesz do końca tej strony, rozłożysz tę liczbę na części i przeczytasz ją
            bez wysiłku.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/liczby-i-os/nocne-niebo.jpg')}
          alt="Rozgwieżdżone nocne niebo nad ciemnym krajobrazem"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
