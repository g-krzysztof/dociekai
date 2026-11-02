'use client';

import { Beat, GuideAct } from '../guide-act';
import { PrefixLadder } from './prefix-ladder';
import { ABSTRACT_RUNGS } from './guide-content';

export function ActPrzedrostki({ color }: { color: string }) {
  return (
    <GuideAct id="przedrostki" mode="flow">
      <PrzedrostkiBody color={color} />
    </GuideAct>
  );
}

function PrzedrostkiBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Jedna zasada</h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Zamiast dziewięciu osobnych słów — jedna baza i sześć przedrostków, które zawsze znaczą to
        samo. Kliknij każdy, żeby sprawdzić.
      </p>

      <Beat at={0.1} className="mb-8">
        <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
          <PrefixLadder color={color} rungs={ABSTRACT_RUNGS} baseLabel="jednostka" />
        </div>
      </Beat>

      <Beat at={0.45} className="mb-8">
        <div
          className="border-l-4 p-4 sm:p-5"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p className="text-sm leading-relaxed sm:text-base">
            Po prawej stronie liczby rosną: <strong style={{ color: textColor }}>deka-</strong> to
            ×10, <strong style={{ color: textColor }}>kilo-</strong> to ×1000. Po lewej maleją:{' '}
            <strong style={{ color: textColor }}>decy-</strong> to ÷10,{' '}
            <strong style={{ color: textColor }}>mili-</strong> to ÷1000.
          </p>
        </div>
      </Beat>

      <Beat at={0.75}>
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Ten sam przedrostek działa identycznie niezależnie od tego, jaka jednostka stoi w
          środku. Teraz zobaczysz tę samą drabinkę dwa razy — raz z metrem, raz z gramem jako
          bazą.
        </p>
      </Beat>
    </>
  );
}
