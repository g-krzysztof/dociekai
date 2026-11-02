'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MiniFraction } from '../../mini-fraction';
import {
  DECIMAL_PLACES,
  MAX_PLACES,
  digitContribution,
  formatDecimal,
  readDecimal,
  type DecimalValue,
} from '../../../lib/decimal';
import { DecimalNumeral } from './decimal-numeral';
import { BOARD_PRESETS } from './guide-content';

const PLACE_OPTIONS = [1, 2, 3] as const;

/** Presety trzymają tylko znaczące cyfry — tablica ma zawsze trzy sloty w stanie. */
function padDigits(digits: number[]): number[] {
  return Array.from({ length: MAX_PLACES }, (_, i) => digits[i] ?? 0);
}

interface DecimalPlaceBoardProps {
  color: string;
}

/**
 * Tablica pozycyjna przedłużona w prawo za przecinek. Każda kolumna kręci się
 * osobno (0–9, cyklicznie — nie da się jej „zepsuć”), a pod spodem na żywo
 * składa się to samo w trzech językach naraz: zapis dziesiętny, suma ułamków
 * zwykłych i odczyt na głos. Wszystkie trzy pochodzą z jednej funkcji
 * (`lib/decimal.ts`), więc nie mogą się rozjechać.
 *
 * Liczba widocznych kolumn jest sterowana osobno, bo to ona — a nie wartość —
 * decyduje o nazwie rzędu w odczycie: te same cyfry przy jednym miejscu czyta
 * się „pięć dziesiątych”, a przy dwóch „pięćdziesiąt setnych”.
 */
export function DecimalPlaceBoard({ color }: DecimalPlaceBoardProps) {
  const [whole, setWhole] = useState(BOARD_PRESETS[0].value.whole);
  const [digits, setDigits] = useState<number[]>(padDigits(BOARD_PRESETS[0].value.digits));
  const [places, setPlaces] = useState<number>(BOARD_PRESETS[0].value.digits.length);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const value: DecimalValue = { whole, digits: digits.slice(0, places) };
  const activePlaces = DECIMAL_PLACES.slice(0, places);

  const bumpWhole = (delta: number) => setWhole((prev) => (prev + delta + 10) % 10);
  const bumpDigit = (index: number, delta: number) =>
    setDigits((prev) => prev.map((digit, i) => (i === index ? (digit + delta + 10) % 10 : digit)));

  const applyPreset = (preset: (typeof BOARD_PRESETS)[number]) => {
    setWhole(preset.value.whole);
    setDigits(padDigits(preset.value.digits));
    setPlaces(preset.value.digits.length);
  };

  const terms = [
    ...(whole > 0 ? [{ key: 'whole', node: <span className="font-mono font-bold">{whole}</span> }] : []),
    ...activePlaces
      .filter((place) => digits[place.index] > 0)
      .map((place) => {
        const part = digitContribution(digits[place.index], place.index);
        return {
          key: place.name,
          node: <MiniFraction licznik={part.licznik} mianownik={part.mianownik} color={textColor} />,
        };
      }),
  ];

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ile miejsc po przecinku?
        </span>
        {PLACE_OPTIONS.map((option) => (
          <Chip key={option} color={color} active={option === places} onClick={() => setPlaces(option)}>
            {option}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-4 sm:gap-x-4">
        <Column
          color={color}
          name="jedności"
          digit={whole}
          onUp={() => bumpWhole(1)}
          onDown={() => bumpWhole(-1)}
        />

        <span className="pb-16 text-5xl font-black leading-none" style={{ color }} aria-hidden>
          ,
        </span>

        {activePlaces.map((place) => (
          <Column
            key={place.name}
            color={color}
            name={place.name}
            digit={digits[place.index]}
            fraction={digitContribution(digits[place.index], place.index)}
            onUp={() => bumpDigit(place.index, 1)}
            onDown={() => bumpDigit(place.index, -1)}
          />
        ))}
      </div>

      <div className="mt-6 border-t pt-5">
        <DecimalNumeral value={value} color={color} className="block text-center text-4xl sm:text-5xl" />
        <p className="mt-2 text-center text-base leading-relaxed sm:text-lg">
          czytamy: <strong style={{ color: textColor }}>{readDecimal(value)}</strong>
        </p>
        {terms.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>rozłożone na części:</span>
            {terms.map((term, i) => (
              <span key={term.key} className="inline-flex items-center gap-2">
                {i > 0 && <span aria-hidden>+</span>}
                {term.node}
              </span>
            ))}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t pt-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ustaw gotową liczbę
        </span>
        {BOARD_PRESETS.map((preset) => (
          <Chip
            key={preset.label}
            color={color}
            active={formatDecimal(preset.value) === formatDecimal(value)}
            onClick={() => applyPreset(preset)}
          >
            {preset.label}: {formatDecimal(preset.value)}
          </Chip>
        ))}
      </div>
    </div>
  );
}

interface ColumnProps {
  color: string;
  name: string;
  digit: number;
  fraction?: { licznik: number; mianownik: number };
  onUp: () => void;
  onDown: () => void;
}

function Column({ color, name, digit, fraction, onUp, onDown }: ColumnProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="flex w-16 flex-col items-center sm:w-20">
      <span className="mb-2 h-8 text-center text-[11px] font-bold uppercase leading-tight tracking-wide" style={{ color: textColor }}>
        {name}
      </span>

      <Arrow color={color} label={`Zwiększ cyfrę: ${name}`} onClick={onUp}>
        <ChevronUp className="h-4 w-4" aria-hidden />
      </Arrow>

      <span
        className="my-1 block w-full border py-1 text-center font-mono text-4xl font-black tabular-nums sm:text-5xl"
        style={{ color, borderColor: `${color}40`, backgroundColor: `${color}0c` }}
      >
        {digit}
      </span>

      <Arrow color={color} label={`Zmniejsz cyfrę: ${name}`} onClick={onDown}>
        <ChevronDown className="h-4 w-4" aria-hidden />
      </Arrow>

      <span className="mt-2 h-6 text-xs text-muted-foreground">
        {fraction && fraction.licznik > 0 && (
          <MiniFraction licznik={fraction.licznik} mianownik={fraction.mianownik} color={textColor} size="sm" />
        )}
      </span>
    </div>
  );
}

function Arrow({
  color,
  label,
  onClick,
  children,
}: {
  color: string;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex cursor-pointer items-center justify-center px-3 py-1 text-muted-foreground transition-colors hover:text-foreground"
      style={{ color: `color-mix(in oklch, ${color} 70%, black)` }}
    >
      {children}
    </button>
  );
}

function Chip({
  color,
  active,
  onClick,
  children,
}: {
  color: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'cursor-pointer border px-3 py-1.5 text-sm font-semibold transition-all',
        !active && 'hover:-translate-y-0.5 hover:shadow-md'
      )}
      style={
        active
          ? { borderColor: color, backgroundColor: `${color}14`, color }
          : { borderColor: `${color}40`, color: textColor }
      }
    >
      {children}
    </button>
  );
}
