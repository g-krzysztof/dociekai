'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { POINT_A, POINT_B } from './guide-content';
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
          Na rysunku są dwa punkty. Jak dokładnie powiesz koledze przez telefon, o który z nich Ci
          chodzi?
        </h2>

        <div className="mb-6 flex justify-center overflow-x-auto border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
          <svg
            viewBox="0 0 400 220"
            className="h-auto w-full max-w-sm"
            role="img"
            aria-label="Dwa nienazwane punkty na kartce"
          >
            <circle cx={POINT_A.x} cy={POINT_A.y} r={7} className="fill-muted-foreground" />
            <circle cx={POINT_B.x} cy={POINT_B.y} r={7} className="fill-muted-foreground" />
          </svg>
        </div>

        <Beat at={0.3} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            „Ten po lewej, trochę niżej” nie zadziała, gdy kolega patrzy na inny rysunek albo na tę
            samą kartkę z drugiej strony.{' '}
            <strong>Bez nazwy nie da się mówić o punkcie precyzyjnie.</strong>
          </p>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Matematycy rozwiązali to dawno temu — każdy punkt, prosta, odcinek i kąt ma własny,
            ściśle umówiony sposób zapisu. Ten przewodnik nauczy Cię tego języka, zanim zaczniesz
            rysować i mierzyć prawdziwe figury.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/jezyk-geometrii/dziecko-wskazuje-mape-skarbow.jpg')}
          alt="Dziecko wskazujące palcem punkt na papierowej mapie"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
