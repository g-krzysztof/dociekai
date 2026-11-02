'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ArrowRight, Check, Play, Scissors, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { buildZeroShortcut, type ZeroShortcut } from '../../../lib/trailing-zeros';

/** Demo: oba czynniki kończą się zerem, drugi ma ich dwa — pokazuje pełny rytm obcinania z obu stron naraz. */
const DEMO = { a: 40, b: 500 };
/** Runda 1: zera tylko po jednej stronie — najprostszy możliwy przypadek do samodzielnego powtórzenia. */
const ROUND_1 = { a: 300, b: 6 };
/** Runda 2: rdzeń (25 × 4 = 100) sam kończy się zerem — pułapka „w wyniku jest więcej zer niż obciąłeś/aś”. */
const ROUND_2 = { a: 25, b: 40 };

function zeroCountLabel(n: number): string {
  if (n === 1) return '1 zero';
  return `${n} zera`;
}

interface PeeledZero {
  side: 'a' | 'b';
  index: number;
}

function digitsOfCore(value: number): string[] {
  return String(value).split('');
}

interface DigitTileProps {
  digit: string;
  color: string;
  layoutId?: string;
  interactive?: boolean;
  ariaLabel?: string;
  onActivate?: () => void;
}

/**
 * Jedna cyfra jako żeton. `layoutId` to serce tego widżetu: ten sam żeton
 * (obcięte zero) przenosi się bez przeliczania współrzędnych ręcznie —
 * między rzędem czynnika, tacą i wynikiem — framer-motion sam animuje
 * przejście, bo trzy różne kontenery renderują element o tym samym
 * `layoutId` w różnych momentach (żaden inny widżet kursu nie przenosi
 * żetonu między trzema odrębnymi kontenerami, tylko w obrębie jednego).
 */
function DigitTile({ digit, color, layoutId, interactive, ariaLabel, onActivate }: DigitTileProps) {
  return (
    <motion.div
      layoutId={layoutId}
      layout
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      onClick={onActivate}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onActivate?.();
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? ariaLabel : undefined}
      className={cn(
        'relative flex h-10 w-8 shrink-0 items-center justify-center border-2 font-mono text-lg font-black tabular-nums sm:h-12 sm:w-10 sm:text-xl',
        interactive && 'cursor-pointer border-dashed hover:-translate-y-0.5 hover:shadow-md'
      )}
      style={{ borderColor: color, backgroundColor: `${color}1a`, color }}
    >
      {digit}
      {interactive && (
        <Scissors
          className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-background p-0.5"
          style={{ color }}
          aria-hidden
        />
      )}
    </motion.div>
  );
}

interface PeelBoardProps {
  color: string;
  idPrefix: string;
  shortcut: ZeroShortcut;
  peeledA: number[];
  peeledB: number[];
  coreRevealed: boolean;
  attached: boolean;
  onPeelA?: (index: number) => void;
  onPeelB?: (index: number) => void;
}

/**
 * Plansza wspólna dla demo i obu rund: dwa rzędy czynników, taca na obcięte
 * zera, wynik. Eksportowana też do kroku „Przykłady” — te same żetony
 * pokazują tam gotowe rozwiązanie, więc dziecko rozpoznaje ten sam język
 * wizualny zamiast uczyć się nowego zapisu dla tej samej sztuczki.
 */
export function PeelBoard({
  color,
  idPrefix,
  shortcut,
  peeledA,
  peeledB,
  coreRevealed,
  attached,
  onPeelA,
  onPeelB,
}: PeelBoardProps) {
  const unpeeledA = Array.from({ length: shortcut.aZeros }, (_, i) => i).filter((i) => !peeledA.includes(i));
  const unpeeledB = Array.from({ length: shortcut.bZeros }, (_, i) => i).filter((i) => !peeledB.includes(i));
  const peeled: PeeledZero[] = [
    ...peeledA.map((index) => ({ side: 'a' as const, index })),
    ...peeledB.map((index) => ({ side: 'b' as const, index })),
  ];

  const renderZero = (item: PeeledZero, interactive: boolean) => (
    <DigitTile
      key={`${idPrefix}-${item.side}-zero-${item.index}`}
      layoutId={`${idPrefix}-${item.side}-zero-${item.index}`}
      digit="0"
      color={color}
      interactive={interactive}
      ariaLabel={`Obetnij zero z liczby ${item.side === 'a' ? shortcut.a : shortcut.b}`}
      onActivate={
        interactive ? () => (item.side === 'a' ? onPeelA?.(item.index) : onPeelB?.(item.index)) : undefined
      }
    />
  );

  return (
    <LayoutGroup id={idPrefix}>
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-1">
          {digitsOfCore(shortcut.aCore).map((d, i) => (
            <DigitTile key={`${idPrefix}-a-core-${i}`} digit={d} color={color} />
          ))}
          {unpeeledA.map((i) => renderZero({ side: 'a', index: i }, !!onPeelA))}
        </div>

        <div className="text-center text-sm font-bold text-muted-foreground">×</div>

        <div className="flex items-center justify-center gap-1">
          {digitsOfCore(shortcut.bCore).map((d, i) => (
            <DigitTile key={`${idPrefix}-b-core-${i}`} digit={d} color={color} />
          ))}
          {unpeeledB.map((i) => renderZero({ side: 'b', index: i }, !!onPeelB))}
        </div>

        <div
          className="flex min-h-[3.5rem] items-center justify-center gap-1 border border-dashed p-2"
          style={{ borderColor: `${color}40` }}
        >
          <span className="mr-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Obcięte zera:
          </span>
          <AnimatePresence>
            {!attached && peeled.length > 0
              ? peeled.map((item) => renderZero(item, false))
              : !attached && <span className="text-sm text-muted-foreground">—</span>}
          </AnimatePresence>
        </div>

        {coreRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 border-t-2 pt-4"
            style={{ borderColor: color }}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Wynik</span>
            <div className="flex items-center justify-center gap-1">
              {digitsOfCore(shortcut.coreProduct).map((d, i) => (
                <DigitTile key={`${idPrefix}-result-core-${i}`} digit={d} color={color} />
              ))}
              <AnimatePresence>{attached && peeled.map((item) => renderZero(item, false))}</AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </LayoutGroup>
  );
}

interface ZeroPeelLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: demo (klikanie po kolei „Obetnij/Pomnóż/Doczep” na w pełni
 * narrowanym przykładzie) + dwie samodzielne rundy, w których dziecko samo
 * klika zera do obcięcia. Runda 1 to najprostszy przypadek (zera tylko po
 * jednej stronie), runda 2 pokazuje pułapkę: gdy sam iloczyn rdzeni kończy
 * się zerem, w wyniku jest więcej zer niż dziecko obcięło na starcie.
 */
export function ZeroPeelLab({ color, onComplete }: ZeroPeelLabProps) {
  const [phase, setPhase] = useState(0);
  const containerRef = useSectionScrollAnchor(phase);
  const phaseCount = 3;

  const advance = () => {
    if (phase + 1 < phaseCount) {
      setPhase((p) => p + 1);
      return;
    }
    onComplete?.();
    setPhase((p) => p + 1);
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        {Array.from({ length: phaseCount }, (_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= phase ? color : `${color}26` }}
          />
        ))}
      </div>

      {phase === 0 && <DemoPhase color={color} onDone={advance} />}
      {phase === 1 && (
        <PeelRound color={color} roundLabel="Runda 1" example={ROUND_1} isLast={false} onDone={advance} />
      )}
      {phase === 2 && (
        <PeelRound color={color} roundLabel="Runda 2" example={ROUND_2} isLast onDone={advance} />
      )}
    </div>
  );
}

function DemoPhase({ color, onDone }: { color: string; onDone: () => void }) {
  const shortcut = useMemo(() => buildZeroShortcut(DEMO.a, DEMO.b), []);
  const totalPeelSteps = shortcut.aZeros + shortcut.bZeros;
  const totalSteps = totalPeelSteps + 2;
  const [step, setStep] = useState(0);
  const finished = step >= totalSteps;

  const peeledACount = Math.min(step, shortcut.aZeros);
  const peeledBCount = Math.min(Math.max(step - shortcut.aZeros, 0), shortcut.bZeros);
  const coreRevealed = step > totalPeelSteps;
  const attached = step > totalPeelSteps + 1;

  const narration = (() => {
    if (step < shortcut.aZeros) return `${DEMO.a} kończy się zerem — obetnijmy je.`;
    if (step < totalPeelSteps) return `${DEMO.b} też kończy się zerem — obetnijmy je po kolei.`;
    if (step === totalPeelSteps)
      return `Obcięliśmy razem ${zeroCountLabel(totalPeelSteps)}. Teraz mnożymy to, co zostało: ${shortcut.aCore} × ${shortcut.bCore}.`;
    if (step === totalPeelSteps + 1)
      return `${shortcut.aCore} × ${shortcut.bCore} = ${shortcut.coreProduct}. Zostało dokleić z powrotem ${zeroCountLabel(totalPeelSteps)}.`;
    return `${DEMO.a} × ${DEMO.b} = ${shortcut.result}. Dokładnie tyle, ile wyszłoby pisemnym mnożeniem — tylko szybciej.`;
  })();

  const buttonLabel = (() => {
    if (step < shortcut.aZeros) return `Obetnij zero z ${DEMO.a}`;
    if (step < totalPeelSteps) return `Obetnij zero z ${DEMO.b} (${step - shortcut.aZeros + 1}/${shortcut.bZeros})`;
    if (step === totalPeelSteps) return `Pomnóż rdzenie: ${shortcut.aCore} × ${shortcut.bCore}`;
    return `Doczep ${zeroCountLabel(totalPeelSteps)} z powrotem`;
  })();

  return (
    <div>
      <p className="mb-1 text-center text-sm text-muted-foreground sm:text-base">Obejrzyj skrót na przykładzie:</p>
      <h3 className="mb-5 text-center font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>
        {DEMO.a} × {DEMO.b}
      </h3>

      <PeelBoard
        color={color}
        idPrefix="demo"
        shortcut={shortcut}
        peeledA={Array.from({ length: peeledACount }, (_, i) => i)}
        peeledB={Array.from({ length: peeledBCount }, (_, i) => i)}
        coreRevealed={coreRevealed}
        attached={attached}
      />

      <div className="mb-4 mt-5 flex min-h-[3.5rem] items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'max-w-lg text-center text-sm leading-relaxed sm:text-base',
              finished && 'font-mono text-lg font-black tabular-nums'
            )}
            style={finished ? { color: `color-mix(in oklch, ${color} 88%, black)` } : undefined}
          >
            {narration}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex justify-center">
        {!finished ? (
          <Button onClick={() => setStep((s) => s + 1)} className="gap-2">
            <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
            {buttonLabel}
          </Button>
        ) : (
          <Button onClick={onDone} className="gap-1.5">
            Spróbuj sam/a
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function PeelRound({
  color,
  roundLabel,
  example,
  isLast,
  onDone,
}: {
  color: string;
  roundLabel: string;
  example: { a: number; b: number };
  isLast: boolean;
  onDone: () => void;
}) {
  const shortcut = useMemo(() => buildZeroShortcut(example.a, example.b), [example.a, example.b]);
  const [peeledA, setPeeledA] = useState<number[]>([]);
  const [peeledB, setPeeledB] = useState<number[]>([]);
  const [phase, setPhase] = useState<'peel' | 'core' | 'attach'>('peel');
  const [coreRevealed, setCoreRevealed] = useState(false);
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const [solved, setSolved] = useState(false);
  const containerRef = useSectionScrollAnchor(`${roundLabel}-${phase}`);

  const allPeeled = peeledA.length === shortcut.aZeros && peeledB.length === shortcut.bZeros;
  const remaining = shortcut.aZeros + shortcut.bZeros - peeledA.length - peeledB.length;

  const peelA = (index: number) => setPeeledA((prev) => (prev.includes(index) ? prev : [...prev, index]));
  const peelB = (index: number) => setPeeledB((prev) => (prev.includes(index) ? prev : [...prev, index]));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (solved || !value.trim()) return;
    const numeric = Number(value.trim().replace(',', '.'));
    if (numeric === shortcut.result) {
      setSolved(true);
      return;
    }
    setWrong(true);
    setTimeout(() => setWrong(false), 600);
  };

  return (
    <div ref={containerRef}>
      <p className="mb-1 text-center text-sm text-muted-foreground sm:text-base">{roundLabel}</p>
      <h3 className="mb-5 text-center font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>
        {example.a} × {example.b}
      </h3>

      <PeelBoard
        color={color}
        idPrefix={roundLabel}
        shortcut={shortcut}
        peeledA={peeledA}
        peeledB={peeledB}
        coreRevealed={coreRevealed}
        attached={phase === 'attach'}
        onPeelA={phase === 'peel' ? peelA : undefined}
        onPeelB={phase === 'peel' ? peelB : undefined}
      />

      <div className="mt-5 flex min-h-[4.5rem] flex-col items-center justify-center gap-3">
        {phase === 'peel' && (
          <>
            <p className="text-center text-sm text-muted-foreground sm:text-base">
              {allPeeled
                ? 'Obcięte wszystkie zera. Możesz iść dalej.'
                : `Kliknij każde zero na końcu obu liczb — zostało ${remaining}.`}
            </p>
            {allPeeled && (
              <Button onClick={() => setPhase('core')} className="gap-1.5">
                Dalej: pomnóż rdzenie
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </>
        )}

        {phase === 'core' && (
          <>
            <p className="text-center font-mono text-xl font-black tabular-nums" style={{ color }}>
              {shortcut.aCore} × {shortcut.bCore} = {coreRevealed ? shortcut.coreProduct : '?'}
            </p>
            {!coreRevealed ? (
              <Button onClick={() => setCoreRevealed(true)}>
                Policz {shortcut.aCore} × {shortcut.bCore}
              </Button>
            ) : (
              <Button onClick={() => setPhase('attach')} className="gap-1.5">
                Dalej: doczep zera
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </>
        )}

        {phase === 'attach' && !solved && (
          <form onSubmit={submit} className="flex flex-wrap items-center justify-center gap-2">
            <label htmlFor={`peel-result-${roundLabel}`} className="text-sm font-semibold">
              {example.a} × {example.b} =
            </label>
            <Input
              id={`peel-result-${roundLabel}`}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              inputMode="numeric"
              autoComplete="off"
              className={cn('w-28 font-mono text-base', wrong && 'border-rose-400')}
            />
            <Button type="submit" disabled={!value.trim()}>
              Sprawdź
            </Button>
            {wrong && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600">
                <X className="h-4 w-4" /> Spróbuj jeszcze raz
              </span>
            )}
          </form>
        )}

        {solved && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <Check className="h-4 w-4" /> Dobrze! {example.a} × {example.b} = {shortcut.result}
            </span>
            <Button onClick={onDone} className="gap-1.5">
              {isLast ? 'Zakończ' : 'Następna runda'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
