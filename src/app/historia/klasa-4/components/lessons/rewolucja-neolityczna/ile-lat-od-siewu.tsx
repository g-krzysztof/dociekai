'use client';

import { useState } from 'react';

/**
 * Przypominajka L16 (z L8, dystans 8): ile lat minęło od pierwszego siewu
 * (ok. 10 000 p.n.e.) do 2026 roku? Daty z dwóch er — dodajemy i odejmujemy
 * jedynkę, bo roku zero nie było. Licznik ± 1000 / 100 / 10 / 1.
 */
const ANSWER = 10_000 + 2026 - 1;
const STEPS = [1000, 100, 10, 1];

export function IleLatOdSiewu({ color }: { color: string }) {
  const [n, setN] = useState(10_000);
  const [res, setRes] = useState<'ok' | 'plus1' | 'zle' | null>(null);

  const check = () => setRes(n === ANSWER ? 'ok' : n === ANSWER + 1 ? 'plus1' : 'zle');

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Pierwsi rolnicy zasiali zboże ok. <strong>10 000 roku p.n.e.</strong> Ile lat minęło od tego czasu do roku{' '}
        <strong>2026</strong>? Ustaw licznik.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <span className="min-w-[6ch] border px-3 py-1 text-center font-mono text-2xl font-bold tabular-nums" aria-live="polite">
          {n.toLocaleString('pl-PL')}
        </span>
        <div className="grid grid-cols-4 gap-1">
          {STEPS.map((s) => (
            <button key={`p${s}`} type="button" onClick={() => { setN((v) => v + s); setRes(null); }} className="border px-2 py-1 text-xs tabular-nums" aria-label={`Dodaj ${s}`}>
              +{s}
            </button>
          ))}
          {STEPS.map((s) => (
            <button key={`m${s}`} type="button" onClick={() => { setN((v) => Math.max(0, v - s)); setRes(null); }} className="border px-2 py-1 text-xs tabular-nums" aria-label={`Odejmij ${s}`}>
              −{s}
            </button>
          ))}
        </div>
        {res !== 'ok' && (
          <button type="button" onClick={check} className="border px-3 py-1.5 text-sm font-semibold text-white" style={{ background: color }}>
            Sprawdź
          </button>
        )}
      </div>
      {res === 'plus1' && <p className="text-sm text-destructive">Prawie! Daty są z dwóch er — a roku zero nie było. Co trzeba zrobić z jedynką?</p>}
      {res === 'zle' && <p className="text-sm text-destructive">Jeszcze nie. Dodaj lata przed naszą erą do lat naszej ery — i pamiętaj o roku zero, którego nie było.</p>}
      {res === 'ok' && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Tak: 10 000 + 2026 − 1 = 12 025 lat. Przez te dwanaście tysięcy lat ludzie przeszli od pierwszego pola do dzisiejszych
          miast. Dziś zobaczysz, jak to się zaczęło.
        </p>
      )}
    </div>
  );
}
