'use client';

import Image from 'next/image';
import { Car, Map, Milestone, Ruler } from 'lucide-react';
import { Beat, GuideAct } from '../guide-act';
import { img } from '@/lib/media';

const EXAMPLES = [
  { icon: Milestone, text: 'Mapa Polski w atlasie: często 1:1 000 000 — 1 cm to 10 km w terenie.' },
  { icon: Map, text: 'Plan mieszkania od dewelopera: zwykle 1:50 albo 1:100.' },
  { icon: Car, text: 'Modele samochodów kolekcjonerskie: często 1:43 albo 1:18.' },
  { icon: Ruler, text: 'Rysunek techniczny małej śrubki: czasem odwrotnie, 2:1 — powiększenie zamiast pomniejszenia.' },
];

export function ActPlanIMapa({ color }: { color: string }) {
  return (
    <GuideAct id="plan-i-mapa" mode="flow">
      <PlanIMapaBody color={color} />
    </GuideAct>
  );
}

function PlanIMapaBody({ color }: { color: string }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_240px]">
      <div>
        <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">Skala jest wszędzie wokół ciebie</h2>

        <Beat at={0.25} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Teraz, kiedy wiesz, jak czytać zapis skali, zacznij go zauważać — pojawia się częściej,
            niż myślisz.
          </p>
        </Beat>

        <Beat at={0.5}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {EXAMPLES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 border bg-white p-3 text-sm dark:bg-zinc-900/80">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/skala/model-samochodu-w-skali.jpg')}
          alt="Kolekcjonerski model samochodu obok kluczyków, pokazujący różnicę skali"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
