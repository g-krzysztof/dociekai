'use client';

import { Beat, GuideAct } from '../guide-act';

export function ActPrzeliczanie({ color }: { color: string }) {
  return (
    <GuideAct id="przeliczanie" mode="flow">
      <PrzeliczanieBody color={color} />
    </GuideAct>
  );
}

function ExampleCard({
  color,
  title,
  question,
  formula,
  answer,
}: {
  color: string;
  title: string;
  question: string;
  formula: string;
  answer: string;
}) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        {title}
      </p>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{question}</p>
      <p className="mb-1 font-mono text-base font-bold tabular-nums sm:text-lg">{formula}</p>
      <p className="font-mono text-xl font-extrabold tabular-nums" style={{ color }}>
        {answer}
      </p>
    </div>
  );
}

function PrzeliczanieBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="max-w-3xl">
      <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">Przeliczanie działa w obie strony</h2>

      <Beat at={0.15} className="mb-6">
        <p className="text-base leading-relaxed sm:text-lg">
          Z rysunku na rzeczywistość — <strong style={{ color: textColor }}>mnożysz</strong> przez
          drugą liczbę skali. Z rzeczywistości na rysunek — <strong style={{ color: textColor }}>dzielisz</strong>{' '}
          przez tę samą liczbę.
        </p>
      </Beat>

      <Beat at={0.35} className="mb-4">
        <ExampleCard
          color={color}
          title="Z rysunku na rzeczywistość"
          question="Na planie w skali 1:100 pokój ma długość 5 cm. Jaka jest jego prawdziwa długość?"
          formula="5 cm × 100 = 500 cm"
          answer="= 5 m"
        />
      </Beat>

      <Beat at={0.6} className="mb-4">
        <ExampleCard
          color={color}
          title="Z rzeczywistości na rysunek"
          question="Odległość między dwoma miastami to 300 km. Mapa ma skalę 1:1 000 000. Ile centymetrów zajmie to na mapie?"
          formula="30 000 000 cm ÷ 1 000 000"
          answer="= 30 cm"
        />
      </Beat>

      <Beat at={0.85}>
        <p className="text-sm leading-relaxed" style={{ color: textColor }}>
          W drugim przykładzie kilometry trzeba było najpierw zamienić na centymetry — skala
          zawsze porównuje tę samą jednostkę po obu stronach.
        </p>
      </Beat>
    </div>
  );
}
