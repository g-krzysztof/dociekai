'use client';

import { GuideAct } from '../guide-act';
import { ZoomSplitStrip } from './zoom-split-strip';

export function ActCorazMniejszeCzesci({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <GuideAct id="coraz-mniejsze-czesci" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Coraz mniejsze części</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Za przecinkiem nie ma nowych wynalazków — jest jeden ruch powtórzony trzy razy. Podziel
        całość na dziesięć części, wybierz jedną i obejrzyj ją z bliska.
      </p>

      <ZoomSplitStrip color={color} />

      <p className="mt-5 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: textColor }}>
        Każde kolejne miejsce po przecinku to części dziesięć razy mniejsze od poprzednich. Dlatego
        rzędy nazywają się <strong>dziesiąte</strong>, <strong>setne</strong> i{' '}
        <strong>tysięczne</strong> — dokładnie tak, jak mianowniki 10, 100 i 1000 z ułamków
        zwykłych, które już znasz.
      </p>
    </GuideAct>
  );
}
