'use client';

import { GuideAct } from '../guide-act';
import { PrefixLadder } from './prefix-ladder';
import { MASS_RUNGS } from './guide-content';

export function ActMasa({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <GuideAct id="masa" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
        Ta sama drabinka, z gramem jako bazą
      </h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Tym razem trzy szczeble po lewej są wygaszone — to nie przypadek.
      </p>

      <div className="mb-6 border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <PrefixLadder color={color} rungs={MASS_RUNGS} baseLabel="gram" />
      </div>

      <div
        className="mb-8 border-l-4 p-4 sm:p-5"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <p className="text-sm leading-relaxed sm:text-base">
          Mili-, centy- i decygram istnieją w systemie, ale są za małe, żeby się do czegokolwiek
          codziennego przydały — nikt nie waży spinki na „3 decygramy”. Gram sam w sobie jest już
          wystarczająco małą jednostką, więc w praktyce zostają tylko{' '}
          <strong style={{ color: textColor }}>deka-</strong> i{' '}
          <strong style={{ color: textColor }}>kilo-</strong>.
        </p>
      </div>

      <div className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <p
          className="mb-2 text-xs font-bold uppercase tracking-[0.15em]"
          style={{ color: textColor }}
        >
          A tona?
        </p>
        <p className="text-sm leading-relaxed sm:text-base">
          Tona (t) to kolejny wielki skok: <strong>1 t = 1000 kg</strong>. Ale to{' '}
          <strong>nie jest przedrostek</strong> doczepiony do słowa „gram” — to osobne słowo,
          którego nie ma na drabince powyżej. Ciekawostka: w nauce ta sama masa ma jeszcze jedną
          nazwę — <em>megagram</em> (bo „mega-” znaczy milion, a 1 tona to właśnie milion gramów).
          Po polsku po prostu mówimy „tona”.
        </p>
      </div>
    </GuideAct>
  );
}
