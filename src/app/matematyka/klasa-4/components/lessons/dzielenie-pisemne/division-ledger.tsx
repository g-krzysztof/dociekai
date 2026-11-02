'use client';

import type { DivisionStep } from '../../../lib/long-division';

const DIGIT_W = 2.25; // rem — ta sama szerokość kolumny co `<ColumnGrid>`, dla spójnego wyglądu w module.
const SIGN_W = 1.25; // rem — stały slot na znak „−”, zarezerwowany w KAŻDYM wierszu (też w nagłówku), żeby kolumny cyfr nigdy się nie przesunęły.
const ROW_H = 2.75; // rem

function digitsOfValue(value: number): number[] {
  if (value === 0) return [0];
  return String(value)
    .split('')
    .map((d) => Number(d));
}

interface LedgerRowProps {
  startCol: number;
  digits: number[];
  sign?: boolean;
  color: string;
  highlightCol?: number | null;
}

/** Jeden wiersz cyfr, prawostronnie wsunięty na kolumnę `startCol` — używany i przez nagłówek, i przez każdy krok odejmowania. */
function LedgerRow({ startCol, digits, sign = false, color, highlightCol = null }: LedgerRowProps) {
  return (
    <div className="flex items-center" style={{ height: `${ROW_H}rem` }}>
      <span
        aria-hidden
        className="inline-flex shrink-0 items-center justify-center text-xl font-black"
        style={{ width: `${SIGN_W}rem`, color }}
      >
        {sign ? '−' : ''}
      </span>
      {startCol > 0 && <span aria-hidden className="inline-block shrink-0" style={{ width: `${startCol * DIGIT_W}rem` }} />}
      {digits.map((digit, i) => {
        const col = startCol + i;
        return (
          <span
            key={i}
            className="inline-flex shrink-0 items-center justify-center transition-colors"
            style={{
              width: `${DIGIT_W}rem`,
              backgroundColor: highlightCol === col ? `${color}1f` : undefined,
            }}
          >
            {digit}
          </span>
        );
      })}
    </div>
  );
}

/** Krótka pozioma kreska pod cyfrą właśnie odjętą — dokładnie tak szeroka, jak liczba nad nią, tak jak w prawdziwym zeszycie. */
function RuleRow({ startCol, width, color }: { startCol: number; width: number; color: string }) {
  return (
    <div className="flex" style={{ height: '0.6rem' }}>
      <span aria-hidden className="inline-block shrink-0" style={{ width: `${SIGN_W}rem` }} />
      {startCol > 0 && <span aria-hidden className="inline-block shrink-0" style={{ width: `${startCol * DIGIT_W}rem` }} />}
      <span
        aria-hidden
        className="inline-block shrink-0 border-t-2"
        style={{ width: `${width * DIGIT_W}rem`, borderColor: color }}
      />
    </div>
  );
}

export interface DivisionLedgerProps {
  color: string;
  dividendDigits: number[];
  divisor: number;
  /** Pełny, wcześniej policzony przebieg (patrz `buildLongDivisionSteps`) — widżet tylko renderuje, nigdy nie liczy sam. */
  steps: DivisionStep[];
  /** Ile pierwszych kroków pokazać rozpisanych pod kreską — reszta zostaje niewidoczna (jeszcze nieodsłonięta). */
  revealedCount: number;
  /** Podświetl konkretną kolumnę dzielnej w nagłówku (np. cyfrę właśnie znoszoną). */
  highlightDigitIndex?: number | null;
  ariaLabel: string;
  className?: string;
}

/**
 * Autentyczny zapis dzielenia pisemnego „pod kreską": dzielna, dzielnik i
 * iloraz w jednej linii nagłówka, a pod nią schodkowo rosnąca drabinka
 * kroków odejmowania — dokładnie tak, jak dziecko zapisuje to w zeszycie.
 * Inny kształt niż `<ColumnGrid>` celowo: dzielenie NIE ma stałej liczby
 * kolumn ani stałej liczby wierszy (liczba kroków zależy od tego, czy
 * pierwsza cyfra dzielnej wystarcza sama, i czy któryś krok da 0 w
 * ilorazie), więc sztywna siatka `<ColumnGrid>` by tu nie pasowała.
 * Wyrównanie kolumn cyfr działa dzięki temu, że KAŻDY wiersz — łącznie z
 * nagłówkiem — zaczyna się od tego samego stałego slotu na znak „−” plus
 * pustego dystansu o szerokości `startCol` kolumn: różne wiersze mają różną
 * liczbę cyfr, ale ich prawa krawędź zawsze ląduje dokładnie pod właściwą
 * kolumną dzielnej.
 */
export function DivisionLedger({
  color,
  dividendDigits,
  divisor,
  steps,
  revealedCount,
  highlightDigitIndex = null,
  ariaLabel,
  className,
}: DivisionLedgerProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const revealedSteps = steps.slice(0, revealedCount);
  const lastStep = revealedSteps[revealedSteps.length - 1];
  const isFullyRevealed = revealedCount >= steps.length;

  const summary = steps
    .map(
      (step) =>
        `krok ${step.index + 1}: znoszę ${step.broughtDownDigits.join('')}, dzielę ${step.currentValue} przez ${divisor}, w ilorazie ${step.quotientDigit}, reszta ${step.remainder}`
    )
    .join('; ');

  return (
    <div className={className}>
      <div role="group" aria-label={ariaLabel} className="inline-block font-mono text-2xl font-black tabular-nums sm:text-3xl">
        {/* Nagłówek: dzielna : dzielnik = iloraz (cyfry ilorazu odsłaniają się wraz z krokami) */}
        <div className="flex items-center" style={{ height: `${ROW_H}rem` }}>
          <span aria-hidden className="inline-flex shrink-0" style={{ width: `${SIGN_W}rem` }} />
          {dividendDigits.map((digit, i) => (
            <span
              key={i}
              className="inline-flex shrink-0 items-center justify-center transition-colors"
              style={{
                width: `${DIGIT_W}rem`,
                backgroundColor: highlightDigitIndex === i ? `${color}1f` : undefined,
              }}
            >
              {digit}
            </span>
          ))}
          <span className="mx-2 shrink-0" style={{ color }}>
            :
          </span>
          <span className="mr-2 shrink-0" style={{ color }}>
            {divisor}
          </span>
          <span className="mr-2 shrink-0" style={{ color }}>
            =
          </span>
          <span className="inline-flex shrink-0 gap-0.5">
            {steps.map((step, i) => (
              <span
                key={i}
                className="inline-flex h-11 w-9 items-center justify-center border-b-2 sm:h-12"
                style={{ borderColor: color, color: i < revealedCount ? textColor : undefined }}
              >
                {i < revealedCount ? step.quotientDigit : ''}
              </span>
            ))}
          </span>
        </div>

        {/* Drabinka kroków: dla kroku > 0 najpierw znoszona wartość (reszta + nowa cyfra), potem odjęty iloczyn i kreska. */}
        {revealedSteps.map((step) => {
          const productDigits = digitsOfValue(step.product);
          const productStart = step.digitIndex - productDigits.length + 1;
          const currentDigits = digitsOfValue(step.currentValue);
          const currentStart = step.digitIndex - currentDigits.length + 1;
          return (
            <div key={step.index}>
              {step.index > 0 && <LedgerRow startCol={currentStart} digits={currentDigits} color={color} />}
              <LedgerRow startCol={productStart} digits={productDigits} sign color={color} />
              <RuleRow startCol={productStart} width={productDigits.length} color={color} />
            </div>
          );
        })}

        {/* Ostatnia, nieskonsumowana reszta — dokładnie to samo "r X" co w dzieleniu z resztą. */}
        {isFullyRevealed && lastStep && (
          <LedgerRow
            startCol={lastStep.digitIndex - digitsOfValue(lastStep.remainder).length + 1}
            digits={digitsOfValue(lastStep.remainder)}
            color={textColor}
          />
        )}
      </div>
      <p className="sr-only">{summary}</p>
    </div>
  );
}
