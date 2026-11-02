'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Search, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { AREA_STEP, buildAreaConversion, convertArea, formatArea } from '../../../lib/area-units';

interface Listing {
  id: string;
  title: string;
  /** Pole podane w ogłoszeniu jako pierwsze — to ono jest prawdą. */
  amount: number;
  code: string;
  /** „Czyli…” dopisane przez autora ogłoszenia. To tutaj może siedzieć błąd. */
  claimAmount: number;
  claimCode: string;
}

interface Round {
  id: string;
  source: string;
  question: string;
  listings: Listing[];
}

const ROUNDS: Round[] = [
  {
    id: 'nieruchomosci',
    source: 'Ogłoszenia z gazetki osiedlowej',
    question: 'W jednym z tych trzech ogłoszeń przeliczenie się nie zgadza. W którym?',
    listings: [
      {
        id: 'mieszkanie',
        title: 'Mieszkanie z balkonem',
        amount: 68,
        code: 'm²',
        claimAmount: 6800,
        claimCode: 'dm²',
      },
      {
        id: 'budowlana',
        title: 'Działka budowlana',
        amount: 1200,
        code: 'm²',
        claimAmount: 12,
        claimCode: 'a',
      },
      {
        id: 'ogrod',
        title: 'Ogród przy domu',
        amount: 8,
        code: 'a',
        claimAmount: 80,
        claimCode: 'm²',
      },
    ],
  },
  {
    id: 'szkola',
    source: 'Opis szkoły ze strony internetowej',
    question: 'Znowu jedno przeliczenie jest błędne. Znajdź je.',
    listings: [
      {
        id: 'boisko',
        title: 'Boisko szkolne',
        amount: 2,
        code: 'ha',
        claimAmount: 200,
        claimCode: 'a',
      },
      {
        id: 'sala',
        title: 'Sala gimnastyczna',
        amount: 400,
        code: 'm²',
        claimAmount: 4000,
        claimCode: 'dm²',
      },
      {
        id: 'ogrodek',
        title: 'Szkolny ogródek',
        amount: 3,
        code: 'a',
        claimAmount: 300,
        claimCode: 'm²',
      },
    ],
  },
];

/** Prawidłowa wartość dopisku — to ona rozstrzyga, które ogłoszenie kłamie. */
const truthOf = (listing: Listing): number =>
  convertArea(listing.amount, listing.code, listing.claimCode);

const isHonest = (listing: Listing): boolean =>
  Math.abs(truthOf(listing) - listing.claimAmount) < 1e-6;

const formatValue = (value: number, code: string): string => `${formatArea(value)} ${code}`;

interface ListingAuditProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: dziecko nie liczy zadanej zamiany, tylko **sprawdza cudzą**.
 * Trzy prawdziwie brzmiące ogłoszenia, w każdym pole podane dwa razy w dwóch
 * jednostkach — jedno z przeliczeń jest fałszywe. Kliknięcie w zdrowe ogłoszenie
 * nie jest karą: pokazuje, dlaczego akurat tam wszystko się zgadza, więc każde
 * sprawdzenie czegoś uczy (ta sama zasada co w `MistakeHunt`).
 *
 * Po znalezieniu błędu trzeba jeszcze wpisać poprawną liczbę — samo wskazanie
 * palcem nie wystarcza. Podpowiedź po dwóch pudłach rozpisuje drogę po szczeblach
 * drabinki z `buildAreaConversion`.
 */
export function ListingAudit({ color, onComplete }: ListingAuditProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [misses, setMisses] = useState(0);
  const [fixed, setFixed] = useState(false);
  const [shake, setShake] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[index] ?? ROUNDS[ROUNDS.length - 1];
  const containerRef = useSectionScrollAnchor(`${index}-${picked ?? 'x'}-${fixed}-${finished}`);

  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const culprit = round.listings.find((listing) => !isHonest(listing));
  const pickedListing = round.listings.find((listing) => listing.id === picked);
  const foundCulprit = pickedListing !== undefined && !isHonest(pickedListing);

  const pick = (listing: Listing) => {
    if (fixed) return;
    setPicked(listing.id);
    setAnswer('');
    setMisses(0);
    if (isHonest(listing)) setShake((value) => value + 1);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!culprit) return;
    const value = Number(answer.trim().replace(/\s/g, '').replace(',', '.'));
    if (Math.abs(value - truthOf(culprit)) < 1e-6) {
      setFixed(true);
      return;
    }
    setMisses((value2) => value2 + 1);
    setShake((value2) => value2 + 1);
  };

  const goNext = () => {
    if (index + 1 < ROUNDS.length) {
      setIndex((value) => value + 1);
      setPicked(null);
      setAnswer('');
      setMisses(0);
      setFixed(false);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Oba błędy znalezione</h3>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Takie „czyli” w ogłoszeniach naprawdę bywają pomylone — najczęściej dlatego, że ktoś
          przeliczył jednostki pola tak jak jednostki długości, krokiem ×10 zamiast ×100. Teraz
          potrafisz to sprawdzić w kilka sekund.
        </p>
      </div>
    );
  }

  const hint = culprit ? buildAreaConversion(culprit.amount, culprit.code, culprit.claimCode) : undefined;

  return (
    <div ref={containerRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: textColor }}>
        {round.source}
      </p>
      <h3 className="mb-5 flex items-start gap-2 text-lg font-bold leading-snug sm:text-xl">
        <Search className="mt-1 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        {round.question}
      </h3>

      <ul className="grid gap-3">
        {round.listings.map((listing) => {
          const isPicked = picked === listing.id;
          const honest = isHonest(listing);
          const settled = fixed && !honest;
          return (
            <li key={listing.id}>
              <motion.button
                type="button"
                data-listing={listing.id}
                onClick={() => pick(listing)}
                disabled={fixed}
                animate={isPicked && honest ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
                key={`${listing.id}-${isPicked && honest ? shake : 0}`}
                className={cn(
                  'flex w-full flex-col gap-1 border-2 p-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between',
                  !isPicked && !settled && 'hover:bg-muted/40'
                )}
                style={{
                  borderColor: isPicked || settled ? color : `${color}33`,
                  backgroundColor: isPicked || settled ? `${color}12` : undefined,
                }}
              >
                <span>
                  <span className="block text-sm font-semibold sm:text-base">{listing.title}</span>
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {formatValue(listing.amount, listing.code)}, czyli{' '}
                    <span className="font-bold" style={{ color: textColor }}>
                      {formatValue(listing.claimAmount, listing.claimCode)}
                    </span>
                  </span>
                </span>
                {isPicked && (
                  <span className="shrink-0 text-sm font-semibold" style={{ color: textColor }}>
                    {honest ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-4 w-4" aria-hidden /> to się zgadza
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <X className="h-4 w-4" aria-hidden /> tu jest błąd
                      </span>
                    )}
                  </span>
                )}
              </motion.button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence initial={false} mode="wait">
        {/* Kliknięte zdrowe ogłoszenie — pokazujemy, dlaczego akurat tam wszystko gra. */}
        {pickedListing && isHonest(pickedListing) && (
          <motion.p
            key={`honest-${pickedListing.id}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border p-4 text-sm leading-relaxed"
            style={{ backgroundColor: `${color}0f` }}
          >
            To ogłoszenie jest w porządku:{' '}
            <strong className="font-mono tabular-nums">
              {formatValue(pickedListing.amount, pickedListing.code)} ={' '}
              {formatValue(truthOf(pickedListing), pickedListing.claimCode)}
            </strong>
            . Szukaj dalej.
          </motion.p>
        )}

        {/* Znaleziony błąd — teraz trzeba go jeszcze naprawić. */}
        {foundCulprit && culprit && !fixed && (
          <motion.form
            key="fix"
            onSubmit={submit}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-2 p-4"
            style={{ borderColor: color, backgroundColor: `${color}0f` }}
          >
            <label htmlFor="listing-fix" className="mb-2 block text-sm leading-relaxed">
              Dobrze — {formatValue(culprit.amount, culprit.code)} to nie{' '}
              {formatValue(culprit.claimAmount, culprit.claimCode)}. Ile powinno tam być?
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <motion.div
                key={`shake-${shake}`}
                animate={misses > 0 ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-2"
              >
                <Input
                  id="listing-fix"
                  inputMode="numeric"
                  autoComplete="off"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  className="w-40 font-mono text-lg tabular-nums"
                  placeholder="liczba"
                />
                <span className="font-mono text-lg font-bold" style={{ color: textColor }}>
                  {culprit.claimCode}
                </span>
              </motion.div>
              <Button type="submit" style={{ backgroundColor: color }} className="text-white">
                Popraw ogłoszenie
              </Button>
            </div>
            {misses >= 2 && hint && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Podpowiedź: z {hint.from.code} na {hint.to.code}{' '}
                {hint.hops.length === 1 ? 'jest jeden szczebel' : `są ${hint.hops.length} szczeble`},
                a każdy szczebel to{' '}
                {hint.hops[0]?.direction === 'down' ? `×${AREA_STEP}` : `:${AREA_STEP}`}.
              </p>
            )}
          </motion.form>
        )}

        {/* Naprawione */}
        {fixed && culprit && (
          <motion.div
            key="fixed"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ backgroundColor: `${color}12` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Poprawnie:{' '}
                <strong className="font-mono tabular-nums">
                  {formatValue(culprit.amount, culprit.code)} ={' '}
                  {formatValue(truthOf(culprit), culprit.claimCode)}
                </strong>
                . Autor ogłoszenia przeliczył krokiem ×10 — tak, jak przelicza się długości.
                Jednostki pola dzieli 100.
              </span>
            </p>
            <Button onClick={goNext} style={{ backgroundColor: color }} className="shrink-0 text-white">
              {index + 1 < ROUNDS.length ? 'Następne ogłoszenia' : 'Zakończ zadanie'}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
