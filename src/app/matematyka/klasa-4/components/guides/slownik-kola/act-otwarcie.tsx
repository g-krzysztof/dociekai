'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { CircleFigure } from '../../circle-figure';
import { CIRCLE_DIAGRAM } from './guide-content';
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
          Ile nazw kryje ten rysunek?
        </h2>

        <div className="mb-6 flex flex-col items-center gap-2">
          <CircleFigure
            color={color}
            diagram={CIRCLE_DIAGRAM}
            ariaLabel="Koło z zaznaczonym, ale jeszcze nienazwanym środkiem, promieniem, średnicą i cięciwą"
            parts={{
              srodek: { shown: true, active: false },
              promien: { shown: true, active: false },
              srednica: { shown: true, active: false },
              cieciwa: { shown: true, active: false },
            }}
          />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cztery elementy, zero nazw — na razie
          </p>
        </div>

        <Beat at={0.3} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Narysować koło — to potrafisz. Chodzi o coś innego:{' '}
            <strong>nazwać to, co już narysowałeś</strong>. Ten jeden rysunek kryje w sobie cztery
            różne elementy, a każdy ma swoją nazwę.
          </p>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Zanim dojedziesz do końca tej strony, nazwiesz każdy z nich — i dowiesz się, czym
            różni się koło od okręgu (to wcale nie to samo słowo).
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/slownik-kola/kolo-rowerowe-szprychy.jpg')}
          alt="Koło rowerowe ze szprychami rozchodzącymi się od piasty na środku"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
