'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Wyjaśnienie różnicy „Enter kończy akapit, nie wiersz” — **przez zepsucie, nie
 * przez definicję**, tak jak `TwoSides` w lekcji o poczcie.
 *
 * Na ekranie oba akapity wyglądają identycznie i żadne zdanie tego nie zmieni.
 * Zmienia to jedno kliknięcie: powiększenie czcionki. Akapit napisany porządnie
 * **przelewa się sam** — wiersze układają się od nowa. Akapit, w którym ktoś
 * kończył każdy wiersz Enterem, rozpada się na schodki, bo jego wiersze są
 * przybite gwoździami w miejscach, które pasowały do poprzedniego rozmiaru.
 *
 * Nowe w kursie jest to, że **jedna czynność ujawnia różnicę strukturalną**,
 * której przed nią nie było widać — i że naprawa jest jednym kliknięciem, po
 * którym zepsuty akapit na oczach dziecka zdrowieje.
 */

const TEXT =
  'W sobotę idziemy z klasą do lasu na wycieczkę. Zbiórka jest o dziewiątej przy szkole, a wracamy przed obiadem. Trzeba wziąć kanapki, wodę i coś przeciwdeszczowego.';

/** Ten sam tekst pocięty Enterem — tak, jak zrobiłby to ktoś, kto „wyrównuje” wiersze ręcznie. */
const HARD_LINES = [
  'W sobotę idziemy z klasą do lasu na',
  'wycieczkę. Zbiórka jest o dziewiątej',
  'przy szkole, a wracamy przed obiadem.',
  'Trzeba wziąć kanapki, wodę i coś',
  'przeciwdeszczowego.',
];

/**
 * Rozmiary dobrane razem z `COLUMN` niżej: przy najmniejszym oba akapity łamią
 * się w tych samych miejscach i wyglądają identycznie, przy największym twarde
 * wiersze **nie mieszczą się w kolumnie** i każdy z nich zawija dodatkowy ogon —
 * czyli dopiero wtedy widać prawdziwe schodki, a nie sam poszarpany brzeg.
 */
const SIZES = [15, 20, 27];
/** Szerokość „strony” w pikselach — druga połowa tego mechanizmu. */
const COLUMN = 300;

interface ReflowTestProps {
  color: string;
  onComplete?: () => void;
}

export function ReflowTest({ color, onComplete }: ReflowTestProps) {
  const [size, setSize] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const [repaired, setRepaired] = useState(false);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(repaired ? 'naprawione' : 'praca');
  /** Dopóki dziecko nie zobaczyło innego rozmiaru, nie ma czego naprawiać. */
  const noticed = seen.length >= 2;

  useEffect(() => {
    if (!repaired || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [repaired, onComplete]);

  const setSizeIndex = (next: number) => {
    const clamped = Math.min(SIZES.length - 1, Math.max(0, next));
    setSize(clamped);
    setSeen((prev) => (prev.includes(clamped) ? prev : [...prev, clamped]));
  };

  const fontSize = SIZES[size];

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Dwa akapity z tym samym tekstem. Na oko nie da się ich odróżnić.
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Zmień rozmiar czcionki — tak jak zrobiłbyś to w prawdziwym dokumencie — i popatrz, który
        akapit to zniesie.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSizeIndex(size - 1)}
          disabled={size === 0}
          aria-label="Mniejsza czcionka"
          className="flex h-9 w-9 items-center justify-center border-2 disabled:opacity-40"
          style={{ borderColor: `${color}55` }}
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <span className="w-24 text-center text-sm tabular-nums">{fontSize} px</span>
        <button
          type="button"
          onClick={() => setSizeIndex(size + 1)}
          disabled={size === SIZES.length - 1}
          aria-label="Większa czcionka"
          className="flex h-9 w-9 items-center justify-center border-2 disabled:opacity-40"
          style={{ borderColor: `${color}55` }}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Column
          title="Akapit A"
          sub="pisany normalnie — Enter dopiero na końcu"
          ok
          color={color}
          fontSize={fontSize}
        >
          <p>{TEXT}</p>
        </Column>

        <Column
          title="Akapit B"
          sub={repaired ? 'naprawiony — Entery zamienione na spacje' : 'każdy wiersz kończony Enterem'}
          ok={repaired}
          color={color}
          fontSize={fontSize}
        >
          {repaired ? (
            <p>{TEXT}</p>
          ) : (
            <p>
              {HARD_LINES.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < HARD_LINES.length - 1 && <br />}
                </span>
              ))}
            </p>
          )}
        </Column>
      </div>

      <AnimatePresence mode="wait">
        {repaired ? (
          <motion.div
            key="repaired"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Teraz oba zachowują się tak samo — pozmieniaj jeszcze raz rozmiar i sprawdź.
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              <strong>Enter kończy akapit, nie wiersz.</strong> O tym, gdzie skończy się wiersz,
              decyduje program: liczy, ile wyrazów zmieści się w szerokości strony przy TEJ czcionce.
              Kiedy zmienisz czcionkę, rozmiar albo marginesy — przeliczy wszystko od nowa. Ale tylko
              tam, gdzie mu na to pozwoliłeś/pozwoliłaś.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Jeśli naprawdę potrzebujesz złamać wiersz w środku akapitu (na przykład w wierszyku
              albo w adresie), jest na to osobny skrót: <strong>Shift + Enter</strong>. Wtedy program
              wie, że to złamanie wiersza, a nie nowy akapit.
            </p>
          </motion.div>
        ) : noticed ? (
          <motion.div
            key="noticed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 border-amber-500 bg-amber-50 p-3 dark:bg-amber-950/30"
          >
            <p className="text-sm leading-relaxed">
              Akapit B rozsypał się na schodki: jego wiersze są przybite w miejscach, które pasowały
              do poprzedniego rozmiaru czcionki. Akapit A ułożył się od nowa i wygląda tak, jakby go
              napisano na tę szerokość.
            </p>
            <button
              type="button"
              onClick={() => setRepaired(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              <Wrench className="h-4 w-4" aria-hidden />
              Zamień te Entery na spacje
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Column({
  title,
  sub,
  ok,
  color,
  fontSize,
  children,
}: {
  title: string;
  sub: string;
  ok: boolean;
  color: string;
  fontSize: number;
  children: React.ReactNode;
}) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-1.5">
        <span className="text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </figcaption>
      {/* Stała szerokość „strony” — to ona razem z rozmiarem czcionki decyduje,
          gdzie program złamie wiersz. */}
      <div
        className={cn('border-2 bg-white p-3 font-serif text-zinc-900 shadow-sm')}
        style={{
          borderColor: ok ? `${color}55` : '#d97706',
          fontSize,
          lineHeight: 1.45,
          maxWidth: COLUMN,
        }}
      >
        {children}
      </div>
    </figure>
  );
}
