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
        <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">Co znaczy ten zapis?</h2>

        <div className="mb-6 flex flex-col items-center gap-3 border bg-white p-5 dark:bg-zinc-900/80">
          <svg viewBox="0 0 220 140" className="h-auto w-full max-w-[260px]" role="img" aria-label="Plan mieszkania z podpisem skala 1 do 100">
            <rect x={20} y={20} width={100} height={70} fill={`${color}18`} stroke={color} strokeWidth={2} />
            <rect x={120} y={20} width={60} height={70} fill={`${color}18`} stroke={color} strokeWidth={2} />
            <rect x={90} y={90} width={20} height={20} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="3 2" />
            <line x1={20} y1={125} x2={70} y2={125} stroke={color} strokeWidth={2.5} />
            <line x1={20} y1={120} x2={20} y2={130} stroke={color} strokeWidth={2.5} />
            <line x1={70} y1={120} x2={70} y2={130} stroke={color} strokeWidth={2.5} />
          </svg>
          <p className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
            skala 1 : 100
          </p>
        </div>

        <Beat at={0.3} className="mb-6">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            Na planie mieszkania, mapie albo pudełku z modelem samochodu prędzej czy później
            spotkasz zapis w rodzaju <strong>1:100</strong> albo <strong>1:43</strong>. Wygląda jak
            dzielenie, ale to nie jest działanie do wykonania — to{' '}
            <strong>informacja, ile razy pomniejszono rzeczywistość</strong>.
          </p>
        </Beat>

        <Beat at={0.55}>
          <p className="max-w-xl text-sm leading-relaxed" style={{ color: textColor }}>
            Zanim dojedziesz do końca tej strony, będziesz umieć odczytać taki zapis i przeliczyć
            nim długość w obie strony — z rysunku na rzeczywistość i z powrotem.
          </p>
        </Beat>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/skala/plan-mieszkania-z-linijka.jpg')}
          alt="Plan mieszkania rozłożony na stole obok linijki"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
