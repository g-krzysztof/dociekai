'use client';

import Image from 'next/image';
import { Beat, GuideAct } from '../guide-act';
import { VOLUME_UNITS } from '../../../lib/volume-units';
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
  const cm = VOLUME_UNITS[1];

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_240px]">
      <div>
        <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">
          Dlaczego jednostka objętości jest sześcianem?
        </h2>

        <p className="mb-6 max-w-xl text-base leading-relaxed sm:text-lg">
          Pole mierzyłeś kratkami — bo pole rozkłada się na płasko. Objętość to pytanie{' '}
          <strong>ile się zmieści w środku</strong>, a wnętrze ma trzy kierunki: wzdłuż, w poprzek i
          na wysokość. Dlatego miarką objętości nie jest kratka, tylko{' '}
          <strong style={{ color: textColor }}>kostka</strong> — i tak jak przy polu, wszyscy muszą
          się umówić na tę samą.
        </p>

        <Beat at={0.3} className="mb-6">
          <div
            className="border-l-2 p-4"
            style={{ borderColor: color, backgroundColor: `${color}0d` }}
          >
            <p className="text-base leading-relaxed">
              <strong style={{ color: textColor }}>1 {cm.code}</strong> — czytamy „jeden {cm.name}” —
              to objętość sześcianu o krawędzi {cm.side}. Małe „3” w górze mówi, że wielkość powstała
              z krawędzi wziętej <em>trzy razy</em>: raz wzdłuż, raz w poprzek i raz w górę. Przy
              polu stała tam dwójka, bo kierunki były dwa.
            </p>
          </div>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Każda jednostka objętości działa tak samo: bierzesz znaną długość, budujesz z niej
            sześcian i to on zostaje miarką. 1 dm³ to sześcian o krawędzi 1 dm, 1 m³ — o krawędzi
            1 m. Za chwilę zobaczysz, co się dzieje z objętością, gdy ta krawędź urośnie.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/jednostki-objetosci/drewniana-kostka-i-miarka.jpg')}
          alt="Drewniana kostka leżąca na jasnym papierze obok złożonej miarki stolarskiej i ołówka"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
