'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { CreatureArt, CreatureCard, c, isBibi, type Creature } from './creatures';

/**
 * Blok 1 — **dziecko jest modelem.**
 *
 * Nikt nie mówi mu, czym jest bibi. Dostaje sześć podpisanych przykładów, a potem
 * talię nowych stworków, które rzuca w prawo („bibi”) albo w lewo („nie bibi”).
 * Dokładnie tak uczy się model: reguły nie zna, zna przykłady.
 *
 * Haczyk stoi na jednej pułapce, zastawionej celowo: **w przykładach kropki
 * i okrągłe uszy zawsze idą w parze**. Kolor i oczy zmieniają się po obu
 * stronach, więc od razu widać, że się nie liczą — ale o uszach i kropkach
 * przykłady nie mówią nic. Cztery karty z talii rozdzielają te dwie cechy
 * i z decyzji dziecka widać, której z nich słuchało.
 *
 * Trzy decyzje, bez których ten blok byłby testem, a nie odkryciem:
 *
 * - **W pierwszej talii nic nie jest oceniane.** Nie ma „dobrze” ani „źle”, bo
 *   z tych przykładów nie da się tego wiedzieć. Dopiero po talii strona mówi,
 *   czego dziecko słuchało — konsekwencja zamiast oceny.
 * - **Kto trafi w kropki, słyszy, że to było szczęście, nie wiedza.** Inaczej
 *   połowa dzieci wyniosłaby z haczyka „byłem sprytny”, a nie „przykłady były
 *   złe”.
 * - **Lekarstwem są dwa przykłady więcej, nie wyjaśnienie.** Druga talia idzie
 *   na tych samych zasadach, tylko z lepszymi danymi — i tym razem da się ją
 *   przejść bez zgadywania. Błąd odsyła kartę na spód talii, nie blokuje.
 */

const EXAMPLES: Creature[] = [
  c('e1', true, 'round', 'blue', 2),
  c('e2', true, 'round', 'orange', 1),
  c('e3', true, 'round', 'green', 2),
  c('e4', false, 'pointy', 'blue', 1),
  c('e5', false, 'pointy', 'green', 2),
  c('e6', false, 'pointy', 'orange', 2),
];

/** Dwa przykłady, które rozdzielają kropki i uszy — lekarstwo z drugiej połowy bloku. */
const EXTRA: Creature[] = [c('x1', true, 'pointy', 'blue', 1), c('x2', false, 'round', 'green', 1)];

/** Pierwsza talia: dwie karty zgodne z przykładami i cztery, na których uszy i kropki się rozjeżdżają. */
export const FIRST_DECK: Creature[] = [
  c('d1', true, 'round', 'green', 1),
  c('d2', false, 'round', 'blue', 2),
  c('d3', false, 'pointy', 'orange', 1),
  c('d4', true, 'pointy', 'green', 2),
  c('d5', false, 'round', 'orange', 2),
  c('d6', true, 'pointy', 'orange', 1),
];

const SECOND_DECK: Creature[] = [
  c('s1', false, 'round', 'blue', 1),
  c('s2', true, 'pointy', 'orange', 2),
  c('s3', false, 'round', 'green', 2),
  c('s4', true, 'pointy', 'blue', 2),
];

/** Karta, na której uszy i kropki mówią co innego. */
export const isSplit = (creature: Creature) => creature.spots !== (creature.ears === 'round');

type Side = 'bibi' | 'nie';
type Phase = 'deck1' | 'reveal' | 'deck2' | 'done';

export function BibiSwipe({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [phase, setPhase] = useState<Phase>('deck1');
  const [answers, setAnswers] = useState<Record<string, Side>>({});
  const [queue, setQueue] = useState<Creature[]>(FIRST_DECK);
  const [hint, setHint] = useState<string | null>(null);
  const [misses, setMisses] = useState(0);
  const anchor = useSectionScrollAnchor(phase);

  const decide = (creature: Creature, side: Side) => {
    const rest = queue.slice(1);

    if (phase === 'deck1') {
      setAnswers((current) => ({ ...current, [creature.id]: side }));
      setQueue(rest);
      if (rest.length === 0) setPhase('reveal');
      return;
    }

    const right = (side === 'bibi') === isBibi(creature);
    if (right) {
      setHint(null);
      setQueue(rest);
      if (rest.length === 0) {
        setPhase('done');
        onComplete?.();
      }
    } else {
      setMisses((value) => value + 1);
      setHint(
        creature.spots
          ? 'Ten miał spiczaste uszy — ale miał kropki. Spójrz na nowy przykład: bibi ze spiczastymi uszami. Karta wraca na spód talii.'
          : 'Ten miał okrągłe uszy — ale nie miał kropek. Spójrz na nowy przykład: stworek z okrągłymi uszami, który bibi nie jest. Karta wraca na spód talii.'
      );
      setQueue([...rest, creature]);
    }
  };

  const splitCards = FIRST_DECK.filter(isSplit);
  const bySpots = splitCards.filter((card) => (answers[card.id] === 'bibi') === card.spots).length;
  const byEars = splitCards.length - bySpots;
  const showExtra = phase === 'deck2' || phase === 'done';

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Na planecie Glim mieszkają <strong>bibi</strong>. Nie powiem ci, jak je rozpoznać — tak samo, jak nikt nie mówi
        tego maszynie. Masz tylko przykłady. Obejrzyj je, a potem <strong>rzucaj kartami</strong>: w prawo, jeśli to
        bibi, w lewo, jeśli nie.
      </p>

      <div ref={anchor} className="mt-5 space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6 lg:space-y-0">
        <ExampleBoard color={color} extra={showExtra ? EXTRA : []} />

        <div>
          {(phase === 'deck1' || phase === 'deck2') && queue.length > 0 && (
            <SwipeDeck
              key={phase}
              cards={queue}
              color={color}
              label={
                phase === 'deck1'
                  ? `Karta ${FIRST_DECK.length - queue.length + 1} z ${FIRST_DECK.length}`
                  : `Zostało kart: ${queue.length}`
              }
              onDecide={decide}
            />
          )}
          {phase === 'deck2' && hint && (
            <p className="mt-3 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: '#a1a1aa' }}>
              {hint}
            </p>
          )}
          {phase === 'reveal' && <MyPiles answers={answers} color={color} />}
          {phase === 'done' && (
            <div className="p-4 text-sm leading-relaxed" style={{ backgroundColor: `${color}12` }}>
              <p className="font-semibold">
                Druga talia za tobą{misses === 0 ? ' — bez jednej pomyłki.' : '.'}
              </p>
              <p className="mt-2">
                Tym razem nie trzeba było zgadywać: dwa nowe przykłady rozdzieliły uszy i kropki, więc zostało tylko
                jedno, co naprawdę łączy wszystkie bibi.
              </p>
            </div>
          )}
        </div>
      </div>

      {phase === 'reveal' && (
        <div className="mt-5 space-y-3 p-4 text-sm leading-relaxed sm:text-base" style={{ backgroundColor: `${color}12` }}>
          <p>
            Na czterech kartach <strong>uszy i kropki mówiły co innego</strong> (są w przerywanej ramce).{' '}
            {bySpots === splitCards.length
              ? 'Za każdym razem słuchałeś/słuchałaś kropek.'
              : byEars === splitCards.length
                ? 'Za każdym razem słuchałeś/słuchałaś uszu.'
                : `Kropek słuchałeś/słuchałaś ${bySpots === 1 ? 'raz' : `${bySpots} razy`}, uszu — ${byEars === 1 ? 'raz' : `${byEars} razy`}.`}
          </p>
          <p>
            Kto wymyślił bibi, miał na myśli <strong>kropki</strong>.{' '}
            {bySpots === splitCards.length
              ? 'Trafione — ale uczciwie: z tych przykładów równie dobrze wychodziły uszy. Tym razem to było szczęście, nie wiedza.'
              : byEars === splitCards.length
                ? 'I to nie jest twój błąd. Z tego, co widziałeś/widziałaś, uszy były dokładnie tak samo dobrą odpowiedzią.'
                : 'I trudno się dziwić — z tych przykładów nie dało się tego rozstrzygnąć.'}
          </p>
          <p>
            Popatrz jeszcze raz na przykłady: każde bibi miało <em>i</em> kropki, <em>i</em> okrągłe uszy. Kolor i oczy
            zmieniały się po obu stronach, więc od razu było widać, że się nie liczą. A uszy i kropki szły zawsze w parze
            — i nic nie mówiło, które z nich jest ważne. <strong>Winne były przykłady, nie ty.</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              setQueue(SECOND_DECK);
              setPhase('deck2');
            }}
            className="inline-flex cursor-pointer items-center gap-2 border bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted dark:bg-zinc-900"
            style={{ borderColor: color, color }}
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Dołóż dwa przykłady i rzucaj jeszcze raz
          </button>
        </div>
      )}

      {phase === 'done' && (
        <p className="mt-5 text-sm leading-relaxed sm:text-base">
          Tak właśnie uczy się <strong>model</strong> — program sztucznej inteligencji. Nikt nie wpisuje mu reguły.
          Dostaje przykłady i sam szuka, co je łączy. A jeśli dwie rzeczy w przykładach zawsze idą w parze, model nie ma
          skąd wiedzieć, która jest ważna — tak samo jak ty przed chwilą. Pomagają tylko <strong>lepsze przykłady</strong>.
        </p>
      )}
    </div>
  );
}

function ExampleBoard({ color, extra }: { color: string; extra: Creature[] }) {
  const all = [...EXAMPLES, ...extra];
  const rows: { title: string; items: Creature[] }[] = [
    { title: 'to jest bibi', items: all.filter(isBibi) },
    { title: 'to nie jest bibi', items: all.filter((item) => !isBibi(item)) },
  ];
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Przykłady</p>
      {rows.map((row) => (
        <div key={row.title}>
          <p className="mb-1.5 text-sm font-semibold" style={row.title === 'to jest bibi' ? { color } : undefined}>
            {row.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {row.items.map((item) => {
              const isNew = extra.includes(item);
              return (
                <CreatureCard
                  key={item.id}
                  creature={item}
                  size={64}
                  className={cn(isNew && 'border-2')}
                >
                  {isNew && (
                    <span
                      className="absolute -top-2 left-1 bg-white px-1 text-[10px] font-bold uppercase dark:bg-zinc-900"
                      style={{ color }}
                    >
                      nowy
                    </span>
                  )}
                </CreatureCard>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Po pierwszej talii: gdzie dziecko rzuciło każdą kartę. Bez ocen — tylko jego własne decyzje. */
function MyPiles({ answers, color }: { answers: Record<string, Side>; color: string }) {
  const piles: { title: string; side: Side }[] = [
    { title: 'rzucone w prawo — bibi', side: 'bibi' },
    { title: 'rzucone w lewo — nie bibi', side: 'nie' },
  ];
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Twoje decyzje</p>
      {piles.map((pile) => (
        <div key={pile.side}>
          <p className="mb-1.5 text-sm font-semibold" style={pile.side === 'bibi' ? { color } : undefined}>
            {pile.title}
          </p>
          <div className="flex min-h-[64px] flex-wrap gap-2">
            {FIRST_DECK.filter((card) => answers[card.id] === pile.side).map((card) => (
              <CreatureCard
                key={card.id}
                creature={card}
                size={56}
                className={cn(isSplit(card) && 'border-2 border-dashed')}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const THROW = 90;

/**
 * Talia z rzucaniem kart. Karta jedzie za palcem i przechyla się, a puszczona
 * za progiem odlatuje w tę stronę; puszczona przed progiem wraca. Przyciski pod
 * talią i strzałki na klawiaturze robią to samo — nie każdy ma palec na ekranie.
 */
function SwipeDeck({
  cards,
  color,
  label,
  onDecide,
}: {
  cards: Creature[];
  color: string;
  label: string;
  onDecide: (creature: Creature, side: Side) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-16, 16]);
  const leftHint = useTransform(x, [-THROW, -15], [1, 0]);
  const rightHint = useTransform(x, [15, THROW], [0, 1]);
  const [flying, setFlying] = useState(false);
  /** Licznik rzutów — po każdym karta wraca na środek, także gdy na wierzch wraca ta sama. */
  const [throws, setThrows] = useState(0);
  const top = cards[0];
  const next = cards[1];

  const fly = (side: Side) => {
    if (flying || !top) return;
    setFlying(true);
    animate(x, side === 'bibi' ? 460 : -460, { duration: 0.22, ease: 'easeIn' }).then(() => {
      onDecide(top, side);
      setThrows((value) => value + 1);
      setFlying(false);
    });
  };

  /* Przed malowaniem, nie po — inaczej stara karta mignęłaby na środku, zanim na wierzch wejdzie nowa. */
  useLayoutEffect(() => {
    x.set(0);
  }, [throws, x]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (!deckInView()) return;
      if (event.key === 'ArrowRight') fly('bibi');
      if (event.key === 'ArrowLeft') fly('nie');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
      </div>
      <div data-bibi-deck className="relative mx-auto h-[250px] w-full max-w-[300px] overflow-hidden">
        {/* Strony stołu */}
        <motion.span
          className="pointer-events-none absolute left-1 top-1/2 z-20 -translate-y-1/2 border-2 bg-white px-2 py-1 text-xs font-bold uppercase dark:bg-zinc-900"
          style={{ opacity: leftHint, borderColor: '#71717a', color: '#52525b' }}
        >
          nie bibi
        </motion.span>
        <motion.span
          className="pointer-events-none absolute right-1 top-1/2 z-20 -translate-y-1/2 border-2 bg-white px-2 py-1 text-xs font-bold uppercase dark:bg-zinc-900"
          style={{ opacity: rightHint, borderColor: color, color }}
        >
          bibi
        </motion.span>

        {next && (
          <div className="absolute inset-x-6 top-3 bottom-1 scale-[0.96] border bg-white opacity-70 dark:bg-zinc-900">
            <div className="mx-auto h-full max-w-[190px] p-4">
              <CreatureArt creature={next} />
            </div>
          </div>
        )}

        {top && (
          <motion.div
            key={top.id + cards.length}
            className="absolute inset-x-6 top-0 bottom-3 z-10 cursor-grab touch-none border-2 bg-white shadow-sm active:cursor-grabbing dark:bg-zinc-900"
            style={{ x, rotate, borderColor: '#d4d4d8' }}
            drag={flying ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, info) => {
              if (info.offset.x > THROW || info.velocity.x > 700) fly('bibi');
              else if (info.offset.x < -THROW || info.velocity.x < -700) fly('nie');
            }}
          >
            <div className="pointer-events-none mx-auto h-full max-w-[200px] p-4">
              <CreatureArt creature={top} />
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => fly('nie')}
          className="inline-flex cursor-pointer items-center gap-1.5 border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          nie bibi
        </button>
        <button
          type="button"
          onClick={() => fly('bibi')}
          className="inline-flex cursor-pointer items-center gap-1.5 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          style={{ borderColor: color, color }}
        >
          bibi
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">Przeciągnij kartę w bok albo użyj strzałek.</p>
    </div>
  );
}

/** Strzałki działają tylko wtedy, gdy talia jest na ekranie — inaczej przewijałyby stronę i rzucały kartami naraz. */
function deckInView(): boolean {
  const deck = document.querySelector('[data-bibi-deck]');
  if (!deck) return false;
  const box = deck.getBoundingClientRect();
  return box.bottom > 0 && box.top < window.innerHeight;
}
