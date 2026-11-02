'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, Minus, Plus, RotateCcw, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  addr,
  displayValue,
  evaluateSheet,
  formulaReferences,
  isFormula,
  parseAddr,
  type RawCells,
} from '../../../lib/formula';
import { ColoredFormula, FormulaBar, REF_COLORS, SheetGrid, useSheetEditor } from './sheet-grid';

/**
 * Blok 1 — haczyk. **Arkusz, który wygląda idealnie, i dwie liczby, które są
 * martwe.**
 *
 * Najważniejsza różnica między tabelą w edytorze tekstu a arkuszem nie leży w
 * kratkach, tylko w tym, **czego w komórce nie widać**: wynik może być formułą,
 * która sama się przelicza, albo liczbą wpisaną z ręki po policzeniu na
 * kalkulatorze. Dopóki nikt nie zmieni danych, obie są identyczne — ten sam
 * kształt, ta sama cyfra, ta sama pewność siebie.
 *
 * Dlatego zadanie jest detektywistyczne, a jedynym narzędziem jest **zmiana
 * danych**: dziecko podbija liczby przyciskami, żywe wyniki migają, martwe
 * stoją. Pasek formuły jest zwinięty aż do końca śledztwa — gdyby dało się
 * zajrzeć do środka od razu, blok uczyłby klikania w komórki, a nie tego, że
 * martwa liczba **kłamie dopiero wtedy, gdy świat się zmieni**.
 *
 * Dwie reguły odbioru, obie pilnują, żeby nie dało się tego zgadnąć:
 *
 * - martwą liczbę da się wskazać **dopiero, gdy przestała się zgadzać** — wcześniej
 *   dziecko słyszy „skąd wiesz? zmień coś w jej wierszu”;
 * - `E6` (suma wszystkiego) jest formułą, ale liczy z martwego `E4`, więc po
 *   zmianie w wierszu 4c **też kłamie**. Wskazana dostaje osobne zdanie: jest
 *   żywa, a błąd przyszedł do niej z sąsiedniej komórki. To druga połowa lekcji
 *   o arkuszach w jednym zdaniu — błąd w arkuszu się rozchodzi.
 */

const COLS = 5;
const ROWS = 6;
const WIDTHS = [58, 58, 58, 58, 60];

const START: RawCells = {
  A1: 'Klasa',
  B1: 'tydz. 1',
  C1: 'tydz. 2',
  D1: 'tydz. 3',
  E1: 'Razem',
  A2: '4a',
  B2: '12',
  C2: '15',
  D2: '9',
  E2: '=B2+C2+D2',
  A3: '4b',
  B3: '8',
  C3: '11',
  D3: '14',
  E3: '=SUMA(B3:D3)',
  A4: '4c',
  B4: '10',
  C4: '7',
  D4: '13',
  E4: '30',
  A5: '4d',
  B5: '14',
  C5: '12',
  D5: '10',
  E5: '=SUMA(B5:D5)',
  A6: 'Razem',
  B6: '=SUMA(B2:B5)',
  C6: '45',
  D6: '=SUMA(D2:D5)',
  E6: '=SUMA(E2:E5)',
};

/** Jak te dwie komórki powinny wyglądać, gdyby autor zrobił to porządnie. */
const HONEST: RawCells = { E4: '=SUMA(B4:D4)', C6: '=SUMA(C2:C5)' };
const DEAD = Object.keys(HONEST);

const isInput = (col: number, row: number) => col >= 1 && col <= 3 && row >= 1 && row <= 4;
const isResult = (col: number, row: number) => (col === 4 && row >= 1) || (row === 5 && col >= 1);

interface Verdict {
  tone: 'ok' | 'no' | 'info';
  text: React.ReactNode;
}

interface DeadNumbersProps {
  color: string;
  onComplete?: () => void;
}

export function DeadNumbers({ color, onComplete }: DeadNumbersProps) {
  const sheet = useSheetEditor({
    initial: START,
    cols: COLS,
    rows: ROWS,
    editable: ({ col, row }) => isInput(col, row),
  });
  const [found, setFound] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [changes, setChanges] = useState(0);
  const [peeked, setPeeked] = useState<{ dead: boolean; live: boolean }>({ dead: false, live: false });
  const [done, setDone] = useState(false);

  const solved = found.length === DEAD.length;

  /* Prawda: ten sam arkusz z uczciwymi formułami zamiast liczb wpisanych z ręki. */
  const truth = useMemo(() => evaluateSheet({ ...sheet.cells, ...HONEST }, {}), [sheet.cells]);

  const active = sheet.active;
  const activeAddress = active ? addr(active.col, active.row) : null;
  const activeRaw = activeAddress ? sheet.cells[activeAddress] ?? '' : '';

  const bump = (delta: number) => {
    if (!active || !isInput(active.col, active.row) || !activeAddress) return;
    const current = Number(sheet.cells[activeAddress] ?? 0);
    const next = Math.max(0, Math.min(99, current + delta));
    if (next === current) return;
    sheet.setCell(activeAddress, String(next));
    setChanges((value) => value + 1);
    setVerdict(null);
  };

  const accuse = () => {
    if (!activeAddress || !active || !isResult(active.col, active.row)) return;
    const shown = displayValue(sheet.values[activeAddress]);
    const real = displayValue(truth[activeAddress]);
    const raw = sheet.cells[activeAddress] ?? '';

    if (found.includes(activeAddress)) return;

    if (!isFormula(raw)) {
      if (shown === real) {
        setVerdict({
          tone: 'info',
          text: (
            <>
              Na razie {activeAddress} się zgadza — skąd wiesz, że jest martwa? Zmień jakąś liczbę{' '}
              <strong>w jej wierszu albo kolumnie</strong> i sprawdź, czy się przeliczy.
            </>
          ),
        });
        return;
      }
      const next = [...found, activeAddress];
      setFound(next);
      setVerdict({
        tone: 'ok',
        text:
          next.length < DEAD.length ? (
            <>
              <strong>Martwa.</strong> Dane się zmieniły, a {activeAddress} dalej pokazuje {shown} — powinno być{' '}
              {real}. Ktoś policzył to na kalkulatorze i wpisał wynik z ręki. Została jeszcze jedna.
            </>
          ) : (
            <>
              <strong>Obie znalezione.</strong> Teraz możesz zajrzeć do środka — pasek formuły nad arkuszem pokazuje,
              co naprawdę siedzi w komórce.
            </>
          ),
      });
      return;
    }

    if (shown !== real) {
      setVerdict({
        tone: 'no',
        text: (
          <>
            <strong>{activeAddress} jest żywa</strong> — to formuła i przeliczyła się uczciwie. Kłamie, bo liczy{' '}
            <strong>z komórek, wśród których jest martwa</strong>. Obwiodłam je na arkuszu: poszukaj winnej tam.
          </>
        ),
      });
      return;
    }

    setVerdict({
      tone: 'no',
      text:
        changes === 0 ? (
          <>Zanim kogoś oskarżysz, zmień jakąś liczbę tygodnia i popatrz, które wyniki mrugną.</>
        ) : (
          <>
            <strong>{activeAddress} żyje</strong> — przelicza się, kiedy zmieniasz jej liczby. Martwa liczba nie mrugnie
            nigdy.
          </>
        ),
    });
  };

  const inspect = (address: string) => {
    if (!solved) return;
    const dead = DEAD.includes(address);
    const live = isFormula(sheet.cells[address]);
    const next = { dead: peeked.dead || dead, live: peeked.live || live };
    setPeeked(next);
    if (!done && next.dead && next.live) {
      setDone(true);
      onComplete?.();
    }
  };

  const reset = () => {
    sheet.replaceAll(START);
    setVerdict(null);
  };

  /* Po oskarżeniu żywej formuły, która kłamie — obwódki jej komórek. */
  const accusedLiar =
    verdict?.tone === 'no' && activeAddress && isFormula(activeRaw) && displayValue(sheet.values[activeAddress]) !== displayValue(truth[activeAddress]);
  const highlights = solved
    ? sheet.highlights
    : accusedLiar
      ? formulaReferences(activeRaw.slice(1)).map((ref, index) => ({
          box: ref.box,
          color: REF_COLORS[index % REF_COLORS.length],
        }))
      : [];

  const activeIsInput = !!active && isInput(active.col, active.row);
  const activeIsResult = !!active && isResult(active.col, active.row);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/60 sm:p-5">
      <div className="mb-4 border-l-2 pl-3" style={{ borderColor: color }}>
        <p className="text-sm leading-relaxed">
          Szkoła zbiera nakrętki. Arkusz liczy kilogramy każdej klasy i wszystkie sumy{' '}
          <strong>zgadzają się co do jednej</strong>. A jednak dwie z nich są{' '}
          <strong>martwe</strong>: ktoś policzył je na kalkulatorze i wpisał wynik z ręki.
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          Znajdź je. Nie da się tego zobaczyć — trzeba <strong>zmieniać dane</strong> i patrzeć, które wyniki się
          przeliczą. Kiedy liczba przestanie się zgadzać, wskaż ją.
        </p>
      </div>

      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-5 lg:space-y-0">
        <div className="space-y-2">
          <FormulaBar
            color={color}
            active={active}
            content={activeRaw}
            draft={null}
            editable={false}
            locked={
              solved ? undefined : (
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  pasek formuły zwinięty — otworzy się po śledztwie
                </span>
              )
            }
          />
          <SheetGrid
            cols={COLS}
            rows={ROWS}
            widths={WIDTHS}
            cells={sheet.cells}
            values={sheet.values}
            color={color}
            active={active}
            selection={sheet.selection}
            mode="cell"
            flashes={sheet.flashes}
            highlights={highlights}
            onGesture={(box, origin, phase) => {
              if (phase !== 'start') return;
              sheet.select(origin);
              if (!isInput(origin.col, origin.row)) setVerdict(null);
              inspect(addr(origin.col, origin.row));
            }}
            decorate={(address) => {
              const at = parseAddr(address);
              if (!at) return undefined;
              if (found.includes(address))
                return {
                  style: { backgroundColor: '#d4643a1f', color: '#b4542f' },
                  badge: <Skull className="relative ml-1 h-3 w-3 shrink-0" aria-label="martwa" />,
                };
              if (at.row === 0 || at.col === 0) return { className: 'font-semibold' };
              if (isResult(at.col, at.row)) return { className: 'font-semibold', style: { backgroundColor: `${color}0a` } };
              return undefined;
            }}
          />
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="wait" initial={false}>
            {activeIsInput && activeAddress ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border p-3"
              >
                <p className="text-xs text-muted-foreground">
                  Komórka <strong className="font-mono text-foreground">{activeAddress}</strong> — kilogramy klasy{' '}
                  {sheet.cells[`A${active!.row + 1}`]} w tygodniu {active!.col}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bump(-1)}
                    aria-label="Zmniejsz o 1"
                    className="flex h-10 w-10 cursor-pointer items-center justify-center border transition-colors hover:bg-muted"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-mono text-xl font-bold tabular-nums">{activeRaw}</span>
                  <button
                    type="button"
                    onClick={() => bump(1)}
                    aria-label="Zwiększ o 1"
                    className="flex h-10 w-10 cursor-pointer items-center justify-center border text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: color, borderColor: color }}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="ml-1 text-xs leading-snug text-muted-foreground">
                    Patrz na arkusz: co mrugnie?
                  </span>
                </div>
              </motion.div>
            ) : activeIsResult && activeAddress && !solved ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border p-3"
              >
                <p className="text-xs text-muted-foreground">
                  Wynik w <strong className="font-mono text-foreground">{activeAddress}</strong>:{' '}
                  <strong className="text-foreground">{displayValue(sheet.values[activeAddress])}</strong>
                </p>
                <button
                  type="button"
                  onClick={accuse}
                  disabled={found.includes(activeAddress)}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1.5 border px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-50"
                  style={{ borderColor: color, color }}
                >
                  <Skull className="h-4 w-4" aria-hidden />
                  {found.includes(activeAddress) ? 'Już znaleziona' : 'Ta liczba jest martwa'}
                </button>
              </motion.div>
            ) : !solved ? (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-muted/40 p-3 text-sm leading-relaxed"
              >
                Stuknij w liczbę któregoś tygodnia i zmień ją przyciskami. Potem stuknij w wynik, który{' '}
                <strong>nie mrugnął</strong>, choć powinien.
              </motion.p>
            ) : null}
          </AnimatePresence>

          {verdict && (
            <p
              className={cn(
                'border-l-2 p-3 text-sm leading-relaxed',
                verdict.tone === 'ok'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30'
                  : verdict.tone === 'no'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                    : 'bg-muted/50'
              )}
              style={verdict.tone === 'ok' ? { borderColor: color } : undefined}
            >
              {verdict.text}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Martwe liczby: <strong className="text-foreground">{found.length}</strong> z {DEAD.length}
            </span>
            {!solved && changes > 0 && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-primary"
              >
                <RotateCcw className="h-3 w-3" aria-hidden /> przywróć liczby
              </button>
            )}
          </div>

          {solved && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 border p-3"
            >
              <p className="text-sm font-semibold" style={{ color }}>
                Zajrzyj do środka
              </p>
              <p className="text-sm leading-relaxed">
                Stuknij w komórkę i patrz na pasek formuły. <strong>W komórce widać wynik</strong>, a w pasku — to, co w
                niej naprawdę siedzi.
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Tick on={peeked.live} color={color} /> żywa: w środku formuła, np.{' '}
                  <span className="font-mono text-xs">
                    <ColoredFormula text="=SUMA(B3:D3)" />
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Tick on={peeked.dead} color={color} /> martwa: w środku sama liczba
                </li>
              </ul>
              {done && (
                <p className="p-2 text-sm leading-relaxed" style={{ backgroundColor: `${color}14` }}>
                  Tak wygląda cała różnica między tabelą a arkuszem. Liczba wpisana z ręki jest{' '}
                  <strong>prawdziwa tylko w dniu, w którym ją wpisano</strong> — potem kłamie z tą samą miną. Formuła
                  pamięta, <strong>skąd</strong> wzięła wynik, i liczy go od nowa za każdym razem. Była tu też pułapka
                  gorsza: suma w E6 jest żywa, a kiedy zmieniałeś/zmieniałaś liczby klasy 4c, i tak kłamała — bo liczy z
                  martwej E4. <strong>Błąd w arkuszu nie zostaje w jednej komórce.</strong>
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function Tick({ on, color }: { on: boolean; color: string }) {
  return (
    <span
      className="flex h-4 w-4 shrink-0 items-center justify-center border"
      style={on ? { backgroundColor: color, borderColor: color, color: 'white' } : undefined}
      aria-hidden
    >
      {on && <Check className="h-3 w-3" />}
    </span>
  );
}
