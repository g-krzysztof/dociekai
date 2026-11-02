'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { UnitPickBoard } from '../unit-pick-board';
import { REAL_LIFE_EXAMPLES, UNIT_PICKS } from './guide-content';
import { img } from '@/lib/media';

export function ActWokolCiebie({ color }: { color: string }) {
  return (
    <GuideAct id="wokol-ciebie" mode="flow">
      <WokolCiebieBody color={color} />
    </GuideAct>
  );
}

function WokolCiebieBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div>
      <div className="mb-6 grid items-center gap-8 lg:grid-cols-[1fr_240px]">
        <div>
          <h2 className="mb-4 text-2xl font-bold leading-snug sm:text-3xl">
            Którą kratką mierzyć co?
          </h2>
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Każdą jednostką da się zmierzyć wszystko — tylko wynik bywa nie do wymówienia. Dobra
            jednostka to taka, przy której wychodzi liczba{' '}
            <strong style={{ color: textColor }}>od kilku do kilkuset</strong>. Sprawdź, którą
            wybrałbyś sam.
          </p>
        </div>

        <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
          <Image
            src={img('/images/matematyka/przewodniki/jednostki-pola/chlopiec-mierzy-podloge-w-pustym-pokoju.jpg')}
            alt="Chłopiec około dziesięciu lat, jasna karnacja, ciemne włosy, kuca w pustym pokoju i patrzy na drewnianą podłogę"
            width={240}
            height={180}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>

      <UnitPickBoard
        items={UNIT_PICKS}
        prompt="W czym najwygodniej podać pole, jakie zajmuje"
        color={color}
      />

      <Beat at={0.5} className="mt-6">
        <h3 className="mb-3 text-lg font-bold">Gdzie to spotkasz naprawdę</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {REAL_LIFE_EXAMPLES.map((example) => (
            <li key={example} className="flex items-start gap-2 border-l-2 py-1 pl-3 text-sm leading-relaxed" style={{ borderColor: `${color}59` }}>
              {example}
            </li>
          ))}
        </ul>
      </Beat>
    </div>
  );
}
