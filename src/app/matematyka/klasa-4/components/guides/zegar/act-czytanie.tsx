'use client';

import { Beat, GuideAct } from '../guide-act';
import { ClockCard } from './clock-card';
import { QUARTER_SET_A, QUARTER_SET_B } from './guide-content';
import { spokenReading } from '../../../lib/clock';

export function ActCzytanie({ color }: { color: string }) {
  return (
    <GuideAct id="czytanie" mode="flow">
      <CzytanieBody color={color} />
    </GuideAct>
  );
}

function QuarterGrid({
  color,
  set,
}: {
  color: string;
  set: typeof QUARTER_SET_A;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {set.map(({ hour12, minutes }) => {
        const reading = spokenReading(hour12, minutes);
        return (
          <ClockCard
            key={`${hour12}-${minutes}`}
            color={color}
            hours24={hour12}
            minutes={minutes}
            reveal={<p className="font-semibold">{reading}</p>}
            srRevealText={reading}
            ariaLabel={`Tarcza zegara pokazująca godzinę ${hour12} i ${minutes} minut`}
          />
        );
      })}
    </div>
  );
}

function CzytanieBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
        Kwadranse: cztery sposoby na jedną godzinę
      </h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Wskazówka minutowa najczęściej zatrzymuje się w jednym z czterech miejsc: na pełnej
        godzinie, kwadrans po niej, w połowie drogi albo kwadrans przed następną. Po polsku każde
        z nich nazywamy inaczej — kliknij tarczę, żeby sprawdzić jak.
      </p>

      <Beat at={0.1} className="mb-6">
        <QuarterGrid color={color} set={QUARTER_SET_A} />
      </Beat>

      <Beat at={0.4} className="mb-8">
        <div
          className="border-l-4 p-4 text-sm leading-relaxed sm:p-5 sm:text-base"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          Zauważ wzór: <strong style={{ color: textColor }}>„kwadrans po”</strong> zostaje przy tej
          samej godzinie, którą widzisz na tarczy, ale{' '}
          <strong style={{ color: textColor }}>„wpół do”</strong> i{' '}
          <strong style={{ color: textColor }}>„za kwadrans”</strong> wołają już{' '}
          <em>następną</em> godzinę — mimo że wskazówka godzinowa jeszcze jej nie dosięgła.
        </div>
      </Beat>

      <Beat at={0.65}>
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Ten sam wzór działa dla każdej godziny, nie tylko trzeciej — sprawdź na dziewiątej.
        </p>
        <QuarterGrid color={color} set={QUARTER_SET_B} />
      </Beat>
    </>
  );
}
