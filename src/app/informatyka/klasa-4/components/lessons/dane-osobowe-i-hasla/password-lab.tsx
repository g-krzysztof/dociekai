'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Symulator lekcji i jej autorski akcent: pracownia hasła. Dziecko składa hasło
 * z klocków (trzy przypadkowe słowa, cyfra, znak, długość) i widzi na żywo
 * werdykt „jak szybko ktoś to złamie”. Jeden klocek to pułapka — „imię i rok
 * urodzenia” — który wywala werdykt na samo dno, choćby reszta była mocna.
 *
 * Werdykt liczy prosta, jawna reguła (NIE prawdziwa entropia — to ilustracja):
 * długość daje punkty progami, trzy słowa dają duży skok, cyfra i znak małe,
 * a bez słów krótkie hasło jest słabe niezależnie od sztuczek. Blok kończy się,
 * gdy dziecko choć raz dojdzie do „wiele lat” albo „setki lat”.
 *
 * `onComplete` liczony PRZED `setState` i wołany po — nigdy w updaterze
 * (to byłby setState-in-render w powłoce; ta sama zasada co `LocalOrCloud`).
 */

type Tier = 'natychmiast' | 'godziny' | 'lata' | 'wieki';

const TIERS: { id: Tier; label: string; blurb: string }[] = [
  { id: 'natychmiast', label: 'Natychmiast', blurb: 'Program zgadujący hasła trafi w ułamku sekundy.' },
  { id: 'godziny', label: 'Kilka godzin', blurb: 'Da się złamać w jedno popołudnie. Za słabe na ważne konto.' },
  { id: 'lata', label: 'Wiele lat', blurb: 'Zgadywanie zajęłoby lata. To już porządne hasło.' },
  { id: 'wieki', label: 'Setki lat', blurb: 'Praktycznie nie do zgadnięcia. Dokładnie o to chodzi.' },
];

interface Toggle {
  id: 'words' | 'digit' | 'symbol' | 'personal';
  label: string;
  hint: string;
  trap?: boolean;
}

const TOGGLES: Toggle[] = [
  { id: 'words', label: 'Trzy przypadkowe słowa', hint: 'np. „rower-chmura-gitara” — długie i łatwe do zapamiętania' },
  { id: 'digit', label: 'Cyfra', hint: 'dorzucona gdzieś w środku albo na końcu' },
  { id: 'symbol', label: 'Znak: ! ? #', hint: 'jeden wystarczy' },
  { id: 'personal', label: 'Twoje imię i rok urodzenia', hint: 'wygodne do zapamiętania…', trap: true },
];

const MIN_LEN = 8;
const MAX_LEN = 24;

function verdict(length: number, on: Record<string, boolean>): { tier: Tier; why: string } {
  if (on.personal) {
    return {
      tier: 'natychmiast',
      why: 'Imię i rok urodzenia zna pół klasy i widać je w sieci. Program łamiący hasła sprawdza takie kombinacje jako pierwsze — reszta klocków już nie ma znaczenia.',
    };
  }

  let score = 0;
  if (length >= 10) score += 1;
  if (length >= 14) score += 1;
  if (length >= 18) score += 1;
  if (on.words) score += 2;
  if (on.digit) score += 1;
  if (on.symbol) score += 1;

  // Bez trzech słów krótkie hasło zostaje słabe, choćby miało cyfrę i znak.
  if (!on.words && length < 12) {
    return {
      tier: score >= 2 ? 'godziny' : 'natychmiast',
      why: 'Krótkie hasło bez trzech słów jest słabe, nawet z cyfrą i znakiem. „P@ssw0rd” wygląda sprytnie, a łamie się od ręki. Wydłuż je albo dodaj trzy słowa.',
    };
  }

  let tier: Tier;
  if (score <= 1) tier = 'natychmiast';
  else if (score === 2) tier = 'godziny';
  else if (score <= 4) tier = 'lata';
  else tier = 'wieki';

  const why =
    tier === 'wieki'
      ? 'Długie, złożone z przypadkowych słów i jeszcze z cyfrą lub znakiem. Nic w nim nie da się zgadnąć z tego, co o tobie wiadomo.'
      : tier === 'lata'
        ? 'Trzy przypadkowe słowa i przyzwoita długość robią robotę. Dorzuć jeszcze parę znaków, żeby wejść w „setki lat”.'
        : 'Idzie w dobrą stronę, ale wciąż za krótko lub za prosto. Najwięcej daje długość i trzy przypadkowe słowa.';

  return { tier, why };
}

function example(length: number, on: Record<string, boolean>): string {
  if (on.personal) return 'antek2015' + (on.digit ? '7' : '') + (on.symbol ? '!' : '');
  const base = on.words ? 'rower-chmura-gitara' : 'rower';
  return base + (on.digit ? '7' : '') + (on.symbol ? '!' : '');
}

interface PasswordLabProps {
  color: string;
  onComplete?: () => void;
}

export function PasswordLab({ color, onComplete }: PasswordLabProps) {
  const [length, setLength] = useState(10);
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [reached, setReached] = useState(false);

  const { tier, why } = verdict(length, on);
  const tierIndex = TIERS.findIndex((entry) => entry.id === tier);
  const strong = tier === 'lata' || tier === 'wieki';

  const check = (nextLength: number, nextOn: Record<string, boolean>) => {
    if (reached) return;
    const result = verdict(nextLength, nextOn);
    if (result.tier === 'lata' || result.tier === 'wieki') {
      setReached(true);
      onComplete?.();
    }
  };

  const toggle = (id: string) => {
    const nextOn = { ...on, [id]: !on[id] };
    setOn(nextOn);
    check(length, nextOn);
  };

  const changeLength = (value: number) => {
    setLength(value);
    check(value, on);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-5 text-sm leading-relaxed sm:text-base">
        Zbuduj hasło z klocków i patrz, jak zmienia się werdykt <strong>„jak szybko ktoś to
        złamie”</strong>. Celuj w „wiele lat” albo lepiej.
      </p>

      {/* Długość */}
      <div className="mb-5">
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor="pw-length" className="text-sm font-semibold">
            Długość hasła
          </label>
          <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
            {length} znaków
          </span>
        </div>
        <input
          id="pw-length"
          type="range"
          min={MIN_LEN}
          max={MAX_LEN}
          value={length}
          onChange={(event) => changeLength(Number(event.target.value))}
          className="w-full cursor-pointer accent-current"
          style={{ color }}
        />
      </div>

      {/* Klocki */}
      <div className="mb-5 grid gap-2 sm:grid-cols-2">
        {TOGGLES.map((item) => {
          const isOn = Boolean(on[item.id]);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              aria-pressed={isOn}
              className={cn(
                'flex h-full w-full items-start gap-3 border p-3 text-left text-sm leading-relaxed transition-colors',
                'cursor-pointer hover:bg-muted/40',
                isOn && 'font-medium'
              )}
              style={
                isOn
                  ? item.trap
                    ? { borderColor: '#dc2626', backgroundColor: '#dc26260f' }
                    : { borderColor: color, backgroundColor: `${color}12` }
                  : undefined
              }
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border"
                style={
                  isOn
                    ? item.trap
                      ? { backgroundColor: '#dc2626', borderColor: '#dc2626' }
                      : { backgroundColor: color, borderColor: color }
                    : { borderColor: 'var(--border)' }
                }
              >
                {isOn &&
                  (item.trap ? (
                    <TriangleAlert className="h-3.5 w-3.5 text-white" aria-hidden />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-white" aria-hidden />
                  ))}
              </span>
              <span className="min-w-0">
                <span className="block">{item.label}</span>
                <span className="block text-xs font-normal text-muted-foreground">{item.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Przykład */}
      <div className="mb-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tak mogłoby wyglądać
        </p>
        <p
          className="break-all border-l-2 py-1.5 pl-3 font-mono text-sm"
          style={{ borderColor: `${color}66` }}
        >
          {example(length, on)}
        </p>
      </div>

      {/* Werdykt */}
      <div
        className="border-t-2 pt-4"
        style={{ borderColor: on.personal ? '#dc2626' : strong ? color : 'var(--border)' }}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ktoś złamie to hasło w:
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: on.personal ? '#dc2626' : strong ? color : undefined }}
          >
            {TIERS[tierIndex].label}
          </span>
        </div>
        <div className="mb-3 flex gap-1">
          {TIERS.map((entry, index) => (
            <span
              key={entry.id}
              className="h-2 flex-1"
              style={{
                backgroundColor:
                  index <= tierIndex
                    ? on.personal
                      ? '#dc2626'
                      : color
                    : 'var(--muted)',
              }}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={tier + why}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {why}
          </motion.p>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {reached && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Długie wygrywa z „dziwnego”.</strong> Trzy przypadkowe słowa, które skojarzysz
            tylko ty, są mocniejsze niż „P@ssw0rd” — i łatwiej je zapamiętać. Nigdy nie buduj hasła
            z imienia, nazwiska, daty urodzenia ani z „123456”.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
