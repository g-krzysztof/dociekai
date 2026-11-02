'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreatureCard, isBibi, type Creature } from './creatures';
import { FIRST_DECK, isSplit } from './bibi-swipe';
import {
  MAX_EXAMPLES,
  POOL,
  TEST_SET,
  ask,
  featureName,
  judgeDataset,
  train,
  type Criterion,
  type Machine,
} from './dataset-judge';

/**
 * Blok 5 — zadanie praktyczne, **w całości wykonywane tutaj**: dobierz
 * przykłady, z których maszyna nauczy się rozpoznawać bibi.
 *
 * Trzy etapy jak w każdym zadaniu kursu od 2026-09-19 — zlecenie z jawną listą
 * tego, co będzie sprawdzane, warsztat na stronie i odbiór z werdyktem punkt po
 * punkcie, poprawki za darmo. Plik nie wchodzi w grę: pracą dziecka jest tu
 * **wybór danych**, a on istnieje tylko na tej stronie.
 *
 * Najważniejsza część warsztatu to panel „Na co patrzy maszyna”, przeliczany
 * po każdym stuknięciu. Dziecko nie musi czekać na werdykt, żeby zobaczyć, że
 * trzy „typowe” bibi i trzy „typowe” nie-bibi uczą maszynę uszu — słupek uszu
 * dorasta do kropek i maszyna mówi „remis”. Konsekwencja przed oceną.
 *
 * Nagrodą jest maszyna dziecka puszczona na dwóch taliach: na sprawdzianie
 * i na **czterech kartach z bloku 1**, tych, na których dziecko samo nie miało
 * z czego wybrać. Klamra: tam złe przykłady dostało ono, tu dobre dało samo.
 */

/** Lista kryteriów bez wyników — to, co dziecko widzi w zleceniu, zanim cokolwiek wybierze. */
const PENDING = judgeDataset([]).criteria;

export function DatasetStudio({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [verdicts, setVerdicts] = useState<Criterion[] | null>(null);
  const reported = useRef(false);

  const examples = useMemo(() => POOL.filter((item) => chosen.includes(item.id)), [chosen]);
  const machine = useMemo(() => train(examples), [examples]);
  const accepted = verdicts !== null && verdicts.every((verdict) => verdict.ok);

  useEffect(() => {
    if (accepted && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [accepted, onComplete]);

  const toggle = (id: string) => {
    if (accepted) return;
    setVerdicts(null);
    setChosen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <div className="border bg-white dark:bg-zinc-900/80">
      <Stage number="01" label="Zlecenie" color={color}>
        <p className="text-sm leading-relaxed sm:text-base">
          Naucz maszynę rozpoznawać bibi. Ty już wiesz, że bibi to stworek <strong>z kropkami</strong>, a uszy, kolor i
          oczy nie mają znaczenia. Maszyna tego nie wie — dowie się <strong>tylko z przykładów, które jej wybierzesz</strong>.
          Wybierz z kolekcji najwyżej {MAX_EXAMPLES}. Potem sprawdzimy ją na {TEST_SET.length} stworkach, których nigdy nie
          widziała.
        </p>
        {!accepted && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Co sprawdzę, kiedy oddasz przykłady
            </p>
            <CriteriaList criteria={PENDING} color={color} showResult={false} />
          </div>
        )}
      </Stage>

      <Stage number="02" label="Warsztat — kolekcja stworków" color={color}>
        <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_270px] lg:gap-6 lg:space-y-0">
          {/* Panel maszyny — przyklejony na wąskim ekranie, bo odpowiada na każde stuknięcie w kolekcję niżej. */}
          <div className="sticky top-9 z-10 -mx-5 border-b bg-white px-5 py-3 dark:bg-zinc-900 sm:-mx-6 sm:px-6 lg:sticky lg:top-20 lg:order-2 lg:mx-0 lg:self-start lg:border lg:p-4">
            <MachinePanel examples={examples} machine={machine} color={color} />
          </div>

          <div className="lg:order-1">
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              Stuknij stworka, żeby dać go maszynie jako przykład. Stuknij drugi raz, żeby go zabrać.
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-4">
              {POOL.map((creature) => {
                const selected = chosen.includes(creature.id);
                return (
                  <button
                    key={creature.id}
                    type="button"
                    onClick={() => toggle(creature.id)}
                    aria-pressed={selected}
                    className={cn('cursor-pointer text-center', accepted && 'cursor-default')}
                  >
                    <CreatureCard
                      creature={creature}
                      size={68}
                      className={cn('mx-auto transition-opacity', selected ? 'border-2' : 'opacity-80 hover:opacity-100')}
                    >
                      {selected && (
                        <span
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center text-white"
                          style={{ backgroundColor: color }}
                        >
                          <Check className="h-3 w-3" aria-hidden />
                        </span>
                      )}
                    </CreatureCard>
                    <span
                      className="mt-0.5 block text-[11px] font-semibold"
                      style={isBibi(creature) ? { color } : { color: '#71717a' }}
                    >
                      {isBibi(creature) ? 'bibi' : 'nie bibi'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Stage>

      <Stage number="03" label="Odbiór" color={color} last>
        {accepted ? (
          <Reward examples={examples} machine={machine} color={color} />
        ) : (
          <>
            <p className="text-sm leading-relaxed">
              Kiedy uznasz, że przykłady są dobre, oddaj je. <strong>Poprawki są za darmo</strong> — liczy się ostatni wybór.
            </p>
            <button
              type="button"
              onClick={() => setVerdicts(judgeDataset(examples).criteria)}
              disabled={examples.length === 0}
              className="mt-3 cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: color, color }}
            >
              Oddaj przykłady maszynie
            </button>
            {verdicts && (
              <div className="mt-4">
                <CriteriaList criteria={verdicts} color={color} showResult />
              </div>
            )}
          </>
        )}
      </Stage>
    </div>
  );
}

function MachinePanel({ examples, machine, color }: { examples: Creature[]; machine: Machine; color: string }) {
  const over = examples.length > MAX_EXAMPLES;
  const bibiCount = examples.filter(isBibi).length;
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wide">
          <span className="text-muted-foreground">przykłady dla maszyny</span>
          <span className={cn('tabular-nums', over ? 'text-amber-700' : 'text-muted-foreground')}>
            {examples.length} / {MAX_EXAMPLES}
          </span>
        </p>
        <div className="flex min-h-[36px] flex-wrap gap-1">
          {examples.length === 0 && <span className="text-xs text-muted-foreground">jeszcze żadnego</span>}
          {[...examples.filter(isBibi), ...examples.filter((item) => !isBibi(item))].map((item) => (
            <CreatureCard key={item.id} creature={item} size={34} className={cn(isBibi(item) && 'border-2')} />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">na co patrzy maszyna</p>
        <ul className="space-y-1.5">
          {machine.scores.map((score) => {
            const isChosen = machine.chosen?.feature === score.feature;
            /*
             * Słupek mierzy, o ile cecha rozdziela lepiej niż zgadywanie „zawsze
             * większa strona”. Surowe 5/6 i 6/6 wyglądałyby prawie tak samo,
             * a cecha, która nic nie mówi, ma mieć słupek pusty, a nie do połowy.
             */
            const majority = Math.max(bibiCount, examples.length - bibiCount);
            const share =
              score.total === 0 || majority === score.total
                ? 0
                : Math.max(0, (score.correct - majority) / (score.total - majority));
            return (
              <li key={score.feature} className="grid grid-cols-[52px_minmax(0,1fr)_44px] items-center gap-2 text-xs">
                <span className={cn(isChosen && 'font-bold')} style={isChosen ? { color } : undefined}>
                  {featureName(score.feature)}
                </span>
                <span className="relative h-3 bg-muted">
                  <span
                    className="absolute inset-y-0 left-0 transition-[width] duration-300"
                    style={{ width: `${share * 100}%`, backgroundColor: isChosen ? color : '#a1a1aa' }}
                  />
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {score.total === 0 ? '—' : `${score.correct}/${score.total}`}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs leading-relaxed">
          {machine.chosen === null ? (
            <span className="text-muted-foreground">Maszyna jeszcze nic nie widziała.</span>
          ) : machine.tiedWith.length > 0 ? (
            <>
              <strong className="text-amber-700">Remis:</strong> {featureName(machine.chosen.feature)} i{' '}
              {machine.tiedWith.map(featureName).join(', ')} rozdzielają twoje przykłady tak samo dobrze. Maszyna nie ma
              jak wybrać, więc bierze pierwszą z listy: <strong>{featureName(machine.chosen.feature)}</strong>.
            </>
          ) : (
            <>
              Maszyna trzyma się cechy: <strong style={{ color }}>{featureName(machine.chosen.feature)}</strong> — ta
              rozdziela twoje przykłady najlepiej.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Reward({ examples, machine, color }: { examples: Creature[]; machine: Machine; color: string }) {
  const answers = TEST_SET.map((creature) => ask(machine, creature));
  const hits = answers.filter((answer) => answer.right).length;
  const split = FIRST_DECK.filter(isSplit).map((creature) => ask(machine, creature));

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed sm:text-base">
        <strong>Przyjęte — wszystkie sześć punktów.</strong> Z {examples.length} przykładów twoja maszyna
        nauczyła się reguły: <strong style={{ color }}>kropki → bibi, bez kropek → nie bibi</strong>. Nikt jej tego nie
        wpisał — wyczytała to z tego, co wybrałeś/wybrałaś.
      </p>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          sprawdzian — {hits} z {TEST_SET.length}
        </p>
        <div className="flex flex-wrap gap-2">
          {answers.map((answer) => (
            <AnswerCard key={answer.creature.id} creature={answer.creature} says={answer.says} right={answer.right} color={color} />
          ))}
        </div>
      </div>

      <div className="p-4" style={{ backgroundColor: `${color}12` }}>
        <p className="mb-3 text-sm leading-relaxed">
          A to są <strong>te same cztery karty z pierwszego bloku</strong> — te, na których uszy i kropki mówiły co innego.
          Ty wtedy nie miałeś/miałaś z czego wybrać, bo przykłady były złe. Twoja maszyna miała — bo dostała od ciebie
          lepsze przykłady niż ty ode mnie.
        </p>
        <div className="flex flex-wrap gap-2">
          {split.map((answer) => (
            <AnswerCard key={answer.creature.id} creature={answer.creature} says={answer.says} right={answer.right} color={color} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnswerCard({ creature, says, right, color }: { creature: Creature; says: boolean; right: boolean; color: string }) {
  return (
    <div className="text-center">
      <CreatureCard creature={creature} size={56} className="border-2" />
      <span className="mt-0.5 flex items-center justify-center gap-0.5 text-[11px] font-semibold" style={{ color: right ? color : '#71717a' }}>
        {right ? <Check className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3" aria-hidden />}
        {says ? 'bibi' : 'nie bibi'}
      </span>
    </div>
  );
}

function CriteriaList({
  criteria,
  color,
  showResult,
}: {
  criteria: Criterion[];
  color: string;
  showResult: boolean;
}) {
  return (
    <ul className="mt-2 space-y-1.5">
      {criteria.map((criterion) => (
        <li key={criterion.id} className="flex items-start gap-2 text-sm leading-snug">
          <span
            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-white"
            style={{ backgroundColor: showResult ? (criterion.ok ? color : '#a1a1aa') : '#d4d4d8' }}
            aria-hidden
          >
            {showResult ? criterion.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" /> : null}
          </span>
          <span>
            {criterion.label}
            {showResult && <span className="block text-xs text-muted-foreground">{criterion.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Etap zadania — ta sama typografia numerów co w `ProofTask`, w studiu prezentacji i w studiu materiału. */
function Stage({
  number,
  label,
  color,
  children,
  last,
}: {
  number: string;
  label: string;
  color: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <section className={cn('p-5 sm:p-6', !last && 'border-b')}>
      <div className="mb-3 flex items-baseline gap-3">
        <span className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
          {number}
        </span>
        <h3 className="text-base font-bold">{label}</h3>
      </div>
      {children}
    </section>
  );
}
