'use client';

import { useEffect, useRef, useState } from 'react';
import { OsDziejow } from '../../timeline/os-dziejow';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import { CORE_PINS, getCorePin } from '../../../lib/timeline/pins';
import { useTimelinePins } from '../../../lib/timeline/use-timeline-pins';

const LESSON = 'podsumowanie/wykopalisko-roku';

/** Pinezki starożytności z rdzenia (moduły 4–8, bez rozszerzeń) — te, które L32 domyka. */
export const YEAR_PIN_IDS: readonly string[] = CORE_PINS.filter(
  (p) => !p.extension && p.from.some((f) => f.lesson === LESSON)
).map((p) => p.id);

/** Gdy dziecko ma już wszystko — trzy pinezki na sprawdzian pamięci. */
const DEFAULT_GAPS = ['pismo', 'igrzyska', 'edykt'];

/**
 * Blok 2 — **Moja oś dziejów**. Przegląd całej osi roku w obu trybach,
 * a potem dziecko samo dopina trzy pinezki: te, których mu brakuje
 * (lekcje pominięte), a gdy ma wszystkie — trzy na sprawdzian pamięci.
 * Po bloku (`from` w pins.ts) na osi wiszą wszystkie pinezki
 * starożytności — kompletna Oś dziejów roku. `onDone` po trzeciej.
 */
export function OsWidget({ color, done, onDone }: { color: string; done: boolean; onDone: () => void }) {
  const { pins, ready } = useTimelinePins();
  const [gaps, setGaps] = useState<string[] | null>(null);
  const [step, setStep] = useState(0);
  const reported = useRef(false);

  useEffect(() => {
    if (!ready || gaps) return;
    const have = new Set(pins.map((p) => p.id));
    const missing = YEAR_PIN_IDS.filter((id) => !have.has(id));
    const pick = [...missing, ...DEFAULT_GAPS.filter((id) => !missing.includes(id))].slice(0, 3);
    setGaps(pick);
  }, [ready, pins, gaps]);

  const pinned = () => {
    const next = step + 1;
    setStep(next);
    if (gaps && next >= gaps.length && !reported.current) {
      reported.current = true;
      onDone();
    }
  };

  const missingCount = gaps ? gaps.filter((id) => !DEFAULT_GAPS.includes(id)).length : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Oto Twoja Oś dziejów — wszystko, co przypiąłeś/łaś przez rok. Przełącz ją między <strong>„cała ludzkość”</strong> a{' '}
        <strong>„od piramid do dziś”</strong> i zobacz, jak zmienia się skala. Stuknij pinezkę, żeby zobaczyć datę.
      </p>
      <OsDziejow color={color} lesson={LESSON} />

      {gaps && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm leading-relaxed">
            {missingCount > 0
              ? 'Na Twojej osi brakuje kilku pinezek z lekcji, których jeszcze nie zrobiłeś/łaś. Dopnij je sam(a).'
              : 'Twoja oś jest pełna! Sprawdź pamięć: przypnij jeszcze raz trzy pinezki — bez zaglądania.'}{' '}
            {done ? '' : `Pinezka ${Math.min(step + 1, gaps.length)} z ${gaps.length}.`}
          </p>
          {(done ? [] : gaps.slice(step, step + 1)).map((id) => {
            const pin = getCorePin(id);
            const mode = pin.dating.kind === 'ago' ? 'ludzkosc' : 'piramidy';
            return <PrzypnijPinezke key={id} pin={pin} color={color} lesson={LESSON} mode={mode} done={false} onPinned={pinned} />;
          })}
          {(done || step >= gaps.length) && (
            <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
              Oś roku jest kompletna — wiszą na niej wszystkie pinezki starożytności, od pierwszych ludzi po chrześcijaństwo
              panujące w Rzymie. Zobacz, jak wiele zmieściło się w jednym roku nauki.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
