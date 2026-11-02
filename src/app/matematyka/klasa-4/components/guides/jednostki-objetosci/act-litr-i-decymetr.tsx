'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { CapacityTwinBoard } from './capacity-twin-board';
import { TWIN_RULES } from './guide-content';
import { img } from '@/lib/media';

export function ActLitrIDecymetr({ color }: { color: string }) {
  return (
    <GuideAct id="litr-i-decymetr" mode="flow">
      <LitrIDecymetrBody color={color} />
    </GuideAct>
  );
}

function LitrIDecymetrBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div>
      <div className="mb-6 grid items-center gap-8 lg:grid-cols-[1fr_240px]">
        <div>
          <h2 className="mb-4 text-2xl font-bold leading-snug sm:text-3xl">
            Litr to drugie imię decymetra sześciennego
          </h2>
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Mililitry i litry brzmią jak zupełnie inny świat niż cm³ i dm³ — a to{' '}
            <strong style={{ color: textColor }}>ta sama wielkość pod dwiema nazwami</strong>.
            Jedna nazwa przyjęła się dla płynów (bo płyn się nalewa), druga dla brył (bo bryłę się
            mierzy linijką). Liczba jest w obu identyczna.
          </p>
        </div>

        <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
          <Image
            src={img('/images/matematyka/przewodniki/jednostki-objetosci/dziewczynka-nalewa-wode-do-szklanki.jpg')}
            alt="Dziewczynka około dziesięciu lat, jasna karnacja, rude włosy zaplecione w dwa warkocze, fioletowa bluzka, nalewa wodę z ceramicznego dzbanka do wysokiej przezroczystej szklanki stojącej na blacie"
            width={240}
            height={180}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>

      <Beat at={0.25} className="mb-6">
        <ol className="divide-y border bg-white dark:bg-zinc-900/80">
          {TWIN_RULES.map((rule, index) => (
            <li key={rule.id} className="flex items-start gap-4 p-4">
              <span
                className="w-8 shrink-0 font-mono text-2xl font-bold leading-none tabular-nums"
                style={{ color }}
              >
                {index + 1}
              </span>
              <div>
                <p className="mb-1 font-mono text-lg font-bold" style={{ color: textColor }}>
                  {rule.capacity} = {rule.volume}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">{rule.why}</p>
              </div>
            </li>
          ))}
        </ol>
      </Beat>

      <CapacityTwinBoard color={color} />

      <Beat at={0.65} className="mt-6">
        <div
          className="border-l-2 p-4"
          style={{ borderColor: color, backgroundColor: `${color}0d` }}
        >
          <p className="text-base leading-relaxed">
            Praktyczna konsekwencja: jeśli w zadaniu pojawia się{' '}
            <strong style={{ color: textColor }}>akwarium o wymiarach w centymetrach</strong>, a
            pytanie brzmi „ile litrów wody”, to nie ma tu żadnej nowej zamiany. Liczysz objętość w
            cm³, a potem tylko przypominasz sobie, że tysiąc cm³ nazywa się litrem.
          </p>
        </div>
      </Beat>
    </div>
  );
}
