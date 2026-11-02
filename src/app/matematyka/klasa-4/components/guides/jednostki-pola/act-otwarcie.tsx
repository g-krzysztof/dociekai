'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { AREA_UNITS } from '../../../lib/area-units';
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
  const cm = AREA_UNITS[1];

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_240px]">
      <div>
        <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">
          Dlaczego jednostka pola jest kwadratem?
        </h2>

        <p className="mb-6 max-w-xl text-base leading-relaxed sm:text-lg">
          Pole liczysz kratkami. Ale żeby dwie osoby dogadały się co do wyniku, kratka musi być u
          obu <strong>taka sama</strong> — inaczej ta sama podłoga wyjdzie raz na 24 kafelki, a raz
          na 6. Dlatego umówiono się na kilka stałych kratek i nadano im nazwy.
        </p>

        <Beat at={0.3} className="mb-6">
          <div
            className="border-l-2 p-4"
            style={{ borderColor: color, backgroundColor: `${color}0d` }}
          >
            <p className="text-base leading-relaxed">
              <strong style={{ color: textColor }}>1 {cm.code}</strong> — czytamy „jeden{' '}
              {cm.name}” — to pole kwadratu o boku {cm.side}. Nie odcinek, nie linia:{' '}
              <strong>kwadrat</strong>. Stąd małe „2” w górze — mówi, że wielkość powstała z boku
              wziętego <em>dwa razy</em>: raz wzdłuż i raz w poprzek.
            </p>
          </div>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Każda jednostka pola działa tak samo: bierzesz jakąś znaną długość, budujesz z niej
            kwadrat i to jego pole zostaje miarką. 1 m² to kwadrat o boku 1 m, 1 km² — o boku 1 km.
            Za chwilę zobaczysz, co się dzieje z polem, gdy ten bok urośnie.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/jednostki-pola/wyciety-kwadrat-papieru-i-nozyczki.jpg')}
          alt="Wycięty z papieru kwadrat leżący na drewnianym blacie, obok nożyczki i ołówek"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
