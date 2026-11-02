'use client';

import { useState } from 'react';
import { Check, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Picture } from '../../picture-view';
import { SpritePad } from './sprite-pad';
import { measure } from './sprite-pic';

/**
 * Pracownia duszka — **jedyny blok tej lekcji, w którym dziecko coś rysuje**, i
 * jedyny, w którym reszta lekcji zależy od tego, co narysuje: kostium stąd
 * wędruje na scenę bloku „Kot chodzi na głowie” i do podglądu zlecenia Z-7.
 *
 * Blok istnieje, bo Z-7 zaczyna się od zdania „namaluj w programie Scratch duszka
 * według własnego pomysłu” — a zaraz po narysowaniu własnego duszka czeka
 * pułapka, której nie widać: **duszek obraca się wokół krzyżyka na środku
 * kratki, nie wokół siebie**. Rysunek zrobiony w rogu kratki nie kręci się w
 * miejscu, tylko lata po orbicie jak kamień na sznurku. W prawdziwym edytorze
 * kostiumów Scratcha ten krzyżyk stoi dokładnie tak samo i tak samo nic o sobie
 * nie mówi.
 *
 * Dlatego blok ma trzy kroki, a każdy odhacza **wykonany gest**, nie kliknięcie
 * w potwierdzenie: narysuj → sprawdź obrót (i zobacz orbitę) → przesuń rysunek
 * na krzyżyk i sprawdź obrót jeszcze raz. Kratka jest tą samą `Picture` co w
 * module 3 (`picture-view.tsx`), więc dziecko rysuje narzędziem, które już zna z
 * edytora grafiki — nowy jest wyłącznie krzyżyk i to, co robi.
 *
 * **Rysunek jest stanem lekcji** (`pic` z `onPicChange`), a samo pole do rysowania to
 * `SpritePad` — ten sam, którego używa zadanie Z-7. Duszek narysowany tutaj czeka więc w
 * zadaniu, a dziecko, które wróciło do lekcji, może go dopracować albo narysować od nowa.
 */

interface SpriteStudioProps {
  color: string;
  /** Rysunek dziecka — stan lekcji, wspólny z zadaniem Z-7. */
  pic: Picture;
  onPicChange: (picture: Picture) => void;
  onComplete?: () => void;
}

export function SpriteStudio({ color, pic, onPicChange, onComplete }: SpriteStudioProps) {
  const [spins, setSpins] = useState(0);
  /** Obroty wykonane już po ustawieniu rysunku na krzyżyku — z nich bierze się krok 3. */
  const [centeredSpins, setCenteredSpins] = useState(0);

  const { drawn, offset, centered } = measure(pic);

  const fixed = centered && spins >= 2 && centeredSpins > 0;
  const steps = [
    { label: 'Narysuj swojego duszka', done: drawn },
    { label: 'Sprawdź, jak się obraca', done: drawn && spins > 0 },
    { label: 'Przesuń rysunek na krzyżyk i sprawdź obrót jeszcze raz', done: fixed },
  ];

  const spin = () => {
    if (!drawn) return;
    const next = spins + 1;
    setSpins(next);
    if (!centered) return;
    setCenteredSpins((value) => value + 1);
    if (next >= 2) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)]">
        <div>
          <SpritePad
            pic={pic}
            onChange={onPicChange}
            spins={spins}
            onClear={() => {
              setSpins(0);
              setCenteredSpins(0);
            }}
          />

          <button
            type="button"
            onClick={spin}
            disabled={!drawn}
            className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 border px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-45"
            style={{ borderColor: color, color }}
          >
            <RotateCw className="h-4 w-4 shrink-0" aria-hidden />
            sprawdź obrót
          </button>
        </div>

        <div>
          <ol className="space-y-2">
            {steps.map((step, index) => (
              <li key={step.label} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-[11px] font-bold',
                    step.done ? 'text-white' : 'border-dashed text-muted-foreground'
                  )}
                  style={step.done ? { backgroundColor: color, borderColor: color } : undefined}
                >
                  {step.done ? <Check className="h-3 w-3" aria-hidden /> : index + 1}
                </span>
                <span className={cn('text-sm leading-snug', step.done && 'text-muted-foreground')}>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            {!drawn && (
              <p>
                Rysuj pędzlem po kratce — kilka kresek wystarczy. To jest ten sam edytor obrazka co w
                module o grafice, tylko z jedną nową rzeczą: <strong>krzyżykiem na środku</strong>.
              </p>
            )}

            {drawn && spins === 0 && (
              <p>
                Gotowe. Zanim cokolwiek ustawisz, naciśnij <strong>„sprawdź obrót”</strong> i popatrz,
                co się stanie.
              </p>
            )}

            {drawn && spins > 0 && !centered && (
              <p className="border-l-2 border-amber-500 bg-amber-50 p-2.5 dark:bg-amber-950/30">
                Twój duszek <strong>nie kręci się wokół siebie</strong> — lata po okręgu, jak kamień
                na sznurku. Bo duszek obraca się zawsze wokół krzyżyka, a twój rysunek leży{' '}
                {offset.toFixed(1)} pola od niego. Weź narzędzie{' '}
                <strong className="whitespace-nowrap">przesuń cały rysunek</strong> i przeciągnij go
                na krzyżyk.
              </p>
            )}

            {drawn && centered && !fixed && (
              <p>
                Rysunek siedzi na krzyżyku. Naciśnij <strong>„sprawdź obrót”</strong> jeszcze raz —
                zobaczysz różnicę.
              </p>
            )}

            {fixed && (
              <div className="p-3" style={{ backgroundColor: `${color}14` }}>
                <p className="flex items-center gap-2 font-semibold" style={{ color }}>
                  <Check className="h-4 w-4 shrink-0" aria-hidden />
                  Teraz obraca się w miejscu.
                </p>
                <p className="mt-1.5">
                  Zapamiętaj to na prawdziwego Scratcha: po narysowaniu duszka{' '}
                  <strong>zawsze przeciągnij rysunek na krzyżyk</strong> w edytorze kostiumów. Inaczej
                  duszek będzie odskakiwał przy każdym obrocie i przy każdym „idź do x: 0 y: 0”.
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Twój duszek zostaje ze mną do końca lekcji — zobaczysz go w następnym bloku.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
