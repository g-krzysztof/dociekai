'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
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
          1 stycznia 2025 wypadł w środę. 1 stycznia 2026 — w czwartek. A 1 stycznia 2027?
        </h2>

        <div className="mb-6 flex flex-wrap justify-center gap-3">
          <span
            className="border-2 border-dashed px-4 py-2 font-mono text-lg font-black tabular-nums sm:text-xl"
            style={{ borderColor: `${color}59`, color }}
          >
            2025 — środa
          </span>
          <span
            className="border-2 px-4 py-2 font-mono text-lg font-black tabular-nums sm:text-xl"
            style={{ borderColor: color, backgroundColor: `${color}1f`, color: textColor }}
          >
            2026 — czwartek
          </span>
          <span
            className="border-2 border-dashed px-4 py-2 font-mono text-lg font-black tabular-nums sm:text-xl"
            style={{ borderColor: `${color}59` }}
          >
            2027 — ?
          </span>
        </div>

        <Beat at={0.3} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Ta sama data — a mimo to w kalendarzu wypada za każdym razem w inny dzień tygodnia.{' '}
            <strong>Czasem przesuwa się o jeden dzień, a czasem o dwa naraz.</strong> Skąd to
            przesunięcie się bierze?
          </p>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Zanim dojdziesz do końca tej strony, będziesz wiedzieć, ile dni ma każdy miesiąc, kiedy
            luty ma 29 dni zamiast 28, i jak policzyć, ile dni zostało do wybranej daty.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/kalendarz/kalendarz-scienny-z-pinezka.jpg')}
          alt="Kalendarz ścienny z czerwoną pinezką zaznaczającą jeden dzień"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
