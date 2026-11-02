'use client';

import Image from 'next/image';
import { GuideAct } from '../guide-act';
import { REAL_LIFE_EXAMPLES, CHEAT_SHEET } from './guide-content';
import { img } from '@/lib/media';

export function ActWokolCiebie({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <GuideAct id="wokol-ciebie" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Wokół ciebie</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Ułamki nie kończą się na pizzy — spotkasz je wszędzie.
      </p>

      <div
        className="mb-8 grid items-center gap-6 border-l-4 p-5 sm:p-6 md:grid-cols-[1fr_220px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-2 text-sm font-semibold" style={{ color: textColor }}>
            Gdzie te słowa się przydają
          </p>
          <ul className="grid gap-2 text-sm leading-relaxed sm:text-base">
            {REAL_LIFE_EXAMPLES.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[220px]">
          <Image
            src={img('/images/matematyka/przewodniki/slownik-ulamkow/czekolada-podzielona-na-kostki.jpg')}
            alt="Tabliczka czekolady podzielona na równe kostki, kilka kostek odłamanych"
            width={220}
            height={165}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>

      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h3 className="mb-1 text-lg font-bold">Słownik ułamków w sześciu zdaniach</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Tyle wystarczy, żeby nazwać każdą część ułamka i rozpoznać ułamek właściwy.
        </p>
        <ol className="divide-y border">
          {CHEAT_SHEET.map((rule, index) => (
            <li key={rule} className="flex items-start gap-4 px-4 py-3">
              <span className="w-6 shrink-0 font-mono text-lg font-bold leading-none tabular-nums" style={{ color }}>
                {index + 1}
              </span>
              <span className="text-sm leading-relaxed">{rule}</span>
            </li>
          ))}
        </ol>
      </section>
    </GuideAct>
  );
}
