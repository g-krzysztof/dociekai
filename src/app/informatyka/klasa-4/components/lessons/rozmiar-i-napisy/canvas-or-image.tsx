'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { PictureView } from '../../picture-view';
import {
  PAPER,
  SCENE,
  SCENE_H,
  SCENE_W,
  at,
  resample,
  resizeCanvas,
  samePicture,
  type Anchor,
  type AnchorCol,
  type AnchorRow,
  type Picture,
} from './scene';

/**
 * Wyjaśnienie różnicy „rozmiar obrazu” kontra „rozmiar płótna” — **bez
 * wyjaśniania**, tak jak `TwoSides` w lekcji o poczcie.
 *
 * W menu każdego edytora te dwa polecenia leżą obok siebie, obie proszą o dwie
 * te same liczby i obie kończą się przyciskiem OK. Różnicy nie da się
 * zapamiętać z definicji — trzeba wpisać te same liczby raz w jedno okno, raz w
 * drugie i zobaczyć, że wychodzą dwa różne obrazki. Dlatego dziecko dostaje
 * trzy zamówienia i oba polecenia naraz; wybór jest jego, a werdykt liczy się z
 * **wykonanej operacji**: rozwiązanie zamówienia to te same czyste funkcje
 * (`resample` / `resizeCanvas`) uruchomione z parametrami z `solution`.
 *
 * Kotwica (`Anchor`) stoi obok przez cały czas i przy „rozmiarze obrazu” jest
 * wygaszona — to też jest część nauki: przy skalowaniu nie ma czego zakotwiczyć,
 * bo rysunek zawsze wypełnia całe płótno.
 */

type Command = 'obraz' | 'plotno';

interface Order {
  id: string;
  brief: string;
  /** Zdanie po trafieniu — mówi, co się stało, nie „brawo”. */
  learned: string;
  solution: { command: Command; w: number; h: number; anchor: Anchor };
}

const ORDERS: Order[] = [
  {
    id: 'pasek',
    brief:
      'Pod obrazkiem ma się znaleźć pusty pasek na podpis — wysoki na 6 pikseli. Sam rysunek ma zostać dokładnie taki, jaki jest: latarnia nie może zrobić się ani wyższa, ani chudsza.',
    learned:
      'Płótno urosło do 32 × 30, a rysunek został nietknięty — dostał tylko puste miejsce pod spodem. To jest „rozmiar płótna”: zmieniasz ramę, nie obrazek.',
    solution: { command: 'plotno', w: 32, h: 30, anchor: { row: 'gora', col: 'srodek' } },
  },
  {
    id: 'niebo',
    brief:
      'Nad latarnią jest za dużo pustego nieba. Odetnij 6 pikseli z GÓRY — reszta obrazka bez żadnych zmian.',
    learned:
      'Znowu „rozmiar płótna”, tylko w drugą stronę: mniejsza rama obcina to, co poza nią zostaje. O tym, którą stroną obcina, decyduje jedno — gdzie postawisz kropkę kotwicy.',
    solution: { command: 'plotno', w: 32, h: 18, anchor: { row: 'dol', col: 'srodek' } },
  },
  {
    id: 'mniejszy',
    brief:
      'Obrazek ma pójść e-mailem i jest za ciężki. Zrób go dwa razy węższym i dwa razy niższym — ale w CAŁOŚCI, nic nie może odpaść.',
    learned:
      'Tu żadna rama nie pomoże, bo miało zostać wszystko. „Rozmiar obrazu” przelicza rysunek na mniejszą liczbę pikseli: nic nie odpada, tylko szczegółów ubywa — dokładnie to, co widziałeś/widziałaś przy uchwycie.',
    solution: { command: 'obraz', w: 16, h: 12, anchor: { row: 'srodek', col: 'srodek' } },
  },
];

const ROWS: { id: AnchorRow; label: string }[] = [
  { id: 'gora', label: 'góra' },
  { id: 'srodek', label: 'środek' },
  { id: 'dol', label: 'dół' },
];
const COLS: { id: AnchorCol; label: string }[] = [
  { id: 'lewo', label: 'lewo' },
  { id: 'srodek', label: 'środek' },
  { id: 'prawo', label: 'prawo' },
];

/** Ile pełnych pustych rzędów/kolumn dołożyło płótno przy każdej krawędzi. */
function edgePadding(pic: Picture) {
  const rowEmpty = (y: number) => {
    for (let x = 0; x < pic.w; x += 1) if (pic.cells[at(pic.w, x, y)] !== PAPER) return false;
    return true;
  };
  let top = 0;
  while (top < pic.h && rowEmpty(top)) top += 1;
  let bottom = 0;
  while (bottom < pic.h - top && rowEmpty(pic.h - 1 - bottom)) bottom += 1;
  return { top, bottom };
}

interface CanvasOrImageProps {
  color: string;
  onComplete?: () => void;
}

export function CanvasOrImage({ color, onComplete }: CanvasOrImageProps) {
  const [index, setIndex] = useState(0);
  const [w, setW] = useState(SCENE_W);
  const [h, setH] = useState(SCENE_H);
  const [anchor, setAnchor] = useState<Anchor>({ row: 'srodek', col: 'srodek' });
  const [result, setResult] = useState<{ pic: Picture; command: Command; anchor: Anchor } | null>(
    null
  );
  const [note, setNote] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);
  const [tries, setTries] = useState(0);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(`${index}-${done}`);

  const order = ORDERS[index];
  const shown = result?.pic ?? SCENE;

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const apply = (command: Command) => {
    if (solved) return;
    const pic =
      command === 'obraz' ? resample(SCENE, w, h) : resizeCanvas(SCENE, w, h, anchor);
    setResult({ pic, command, anchor });
    setTries(tries + 1);

    const want = order.solution;
    const expected =
      want.command === 'obraz'
        ? resample(SCENE, want.w, want.h)
        : resizeCanvas(SCENE, want.w, want.h, want.anchor);

    if (samePicture(pic, expected)) {
      setSolved(true);
      setNote(null);
      return;
    }

    /* Komunikaty liczone z tego, co naprawdę wyszło — nie z listy „jeśli
       wybrał źle, napisz X”. Kolejność sprawdzania jest kolejnością ważności:
       najpierw liczby, potem polecenie, na końcu kotwica. */
    if (pic.w !== want.w || pic.h !== want.h) {
      setNote(
        `Obrazek ma teraz ${pic.w} × ${pic.h} px, a zamówienie prosi o ${want.w} × ${want.h} px. Popraw liczby w polach i wykonaj polecenie jeszcze raz.`
      );
      return;
    }

    if (command !== want.command) {
      if (command === 'obraz') {
        const dw = Math.round((w / SCENE_W - 1) * 100);
        const dh = Math.round((h / SCENE_H - 1) * 100);
        setNote(
          `„Rozmiar obrazu” przeliczył cały rysunek: jest teraz ${describeChange(dw, 'szer')} i ${describeChange(dh, 'wys')}. Nic nie odpadło i nic nie doszło — a to zamówienie prosi o zmianę samej ramy dookoła rysunku.`
        );
      } else {
        const kept = Math.round(((w * h) / (SCENE_W * SCENE_H)) * 100);
        setNote(
          `„Rozmiar płótna” nie ruszył rysunku — przyciął go ramą. W kadrze zostało mniej więcej ${kept}% obrazka, reszta przepadła. A zamówienie mówi wyraźnie: w całości.`
        );
      }
      return;
    }

    const pad = edgePadding(pic);
    if (h > SCENE_H) {
      setNote(
        pad.top > 0 && pad.bottom > 0
          ? `Puste miejsce rozdzieliło się na dwie strony — ${pad.top} px u góry i ${pad.bottom} px u dołu. Kotwica na środku dokłada tło po równo, a zamówienie chce cały pasek pod obrazkiem.`
          : `Pusty pasek wyszedł u GÓRY (${pad.top} px), a miał być pod obrazkiem. Kotwica mówi płótnu, gdzie postawić stary rysunek — postaw kropkę tam, gdzie rysunek ma zostać.`
      );
      return;
    }
    setNote(
      'Odcięło z niewłaściwej strony. Zamówienie prosi o zabranie pasa z góry — czyli rysunek ma zostać dosunięty do DOŁU nowego płótna.'
    );
  };

  const undo = () => {
    setResult(null);
    setNote(null);
  };

  const nextOrder = () => {
    if (index === ORDERS.length - 1) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setW(SCENE_W);
    setH(SCENE_H);
    setAnchor({ row: 'srodek', col: 'srodek' });
    setResult(null);
    setNote(null);
    setSolved(false);
  };

  if (done) {
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm font-semibold sm:text-base" style={{ color }}>
          Trzy zamówienia, dwa polecenia, {tries} {triesWord(tries)}.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="border-l-2 p-3" style={{ borderColor: color }}>
            <p className="text-sm font-semibold">Rozmiar obrazu</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Zmienia <strong className="text-foreground">rysunek</strong>. Wypełnia całe płótno tak
              jak dotąd, tylko na innej liczbie pikseli. Nic nie odpada, ale szczegółów ubywa.
            </p>
          </div>
          <div className="border-l-2 p-3" style={{ borderColor: color }}>
            <p className="text-sm font-semibold">Rozmiar płótna</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Zmienia <strong className="text-foreground">ramę</strong>. Piksele rysunku zostają
              nietknięte: dochodzi puste tło albo brzeg przepada. O tym, z której strony, decyduje
              kotwica.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed sm:text-base">
          Pytanie, po którym poznasz, którego polecenia szukasz, jest jedno:{' '}
          <strong>czy rysunek ma zostać taki sam?</strong> Jeśli tak — płótno. Jeśli ma się zmieścić
          w innej liczbie pikseli — obraz.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          Zamówienie {index + 1} z {ORDERS.length}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          oryginał: {SCENE_W} × {SCENE_H} px
        </p>
      </div>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{order.brief}</p>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_230px]">
        <figure className="min-w-0">
          <div
            className="mx-auto w-full max-w-[300px] border-2 p-2"
            style={{ borderColor: `${color}44`, backgroundColor: `${color}08` }}
          >
            <PictureView
              pic={shown}
              label={`Obrazek ${shown.w} na ${shown.h} pikseli`}
              className="border border-zinc-300 dark:border-zinc-600"
            />
          </div>
          <figcaption className="mt-2 text-center text-xs tabular-nums text-muted-foreground">
            {result ? (
              <>
                po poleceniu „{result.command === 'obraz' ? 'Rozmiar obrazu' : 'Rozmiar płótna'}” ·{' '}
                <strong className="text-foreground">
                  {shown.w} × {shown.h} px
                </strong>
              </>
            ) : (
              <>
                obrazek przed zmianą ·{' '}
                <strong className="text-foreground">
                  {shown.w} × {shown.h} px
                </strong>
              </>
            )}
          </figcaption>
        </figure>

        {/* Panel poleceń — świadomie wygląda jak okno dialogowe edytora, a nie
            jak reszta kursu (ta sama zasada co makieta pulpitu w teście
            diagnostycznym). */}
        <div className="border bg-zinc-50 p-3 dark:bg-zinc-800/60">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Nowe wymiary
          </p>
          <NumberField label="Szerokość" value={w} onChange={setW} disabled={solved} />
          <div className="h-2" />
          <NumberField label="Wysokość" value={h} onChange={setH} disabled={solved} />

          <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kotwica
          </p>
          <div
            className={cn(
              'grid w-fit grid-cols-3 gap-1 transition-opacity',
              solved && 'pointer-events-none opacity-50'
            )}
          >
            {ROWS.map((row) =>
              COLS.map((col) => {
                const active = anchor.row === row.id && anchor.col === col.id;
                return (
                  <button
                    key={`${row.id}-${col.id}`}
                    type="button"
                    onClick={() => setAnchor({ row: row.id, col: col.id })}
                    aria-label={`Kotwica: ${row.label} ${col.label}`}
                    aria-pressed={active}
                    className="flex h-8 w-8 items-center justify-center border bg-white dark:bg-zinc-900"
                    style={{ borderColor: active ? color : undefined }}
                  >
                    <span
                      className="block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: active ? color : 'transparent', border: active ? undefined : '1px solid currentColor', opacity: active ? 1 : 0.3 }}
                    />
                  </button>
                );
              })
            )}
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
            Gdzie na nowym płótnie ma stanąć stary rysunek. Przy „Rozmiarze obrazu” nie ma znaczenia
            — rysunek i tak wypełnia całe płótno.
          </p>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => apply('obraz')}
              disabled={solved}
              className="w-full border-2 px-3 py-2 text-sm font-semibold transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/5"
              style={{ borderColor: `${color}66` }}
            >
              Rozmiar obrazu
            </button>
            <button
              type="button"
              onClick={() => apply('plotno')}
              disabled={solved}
              className="w-full border-2 px-3 py-2 text-sm font-semibold transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/5"
              style={{ borderColor: `${color}66` }}
            >
              Rozmiar płótna
            </button>
            {result && !solved && (
              <button
                type="button"
                onClick={undo}
                className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground underline underline-offset-4"
              >
                <Undo2 className="h-3.5 w-3.5" aria-hidden />
                Cofnij i spróbuj inaczej
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {solved ? (
          <motion.div
            key="solved"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>{order.learned}</span>
            </p>
            <button
              type="button"
              onClick={nextOrder}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {index === ORDERS.length - 1 ? 'Podsumowanie' : 'Następne zamówienie'}
            </button>
          </motion.div>
        ) : note ? (
          <motion.p
            key={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            {note}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Polska odmiana rzeczownika „podejście”: 1 podejście, 2–4 podejścia, 5+ podejść. */
function triesWord(count: number): string {
  if (count === 1) return 'podejście';
  const last = count % 10;
  const lastTwo = count % 100;
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? 'podejścia' : 'podejść';
}

function describeChange(percent: number, axis: 'szer' | 'wys'): string {
  const word = axis === 'szer' ? 'szerszy' : 'wyższy';
  const anti = axis === 'szer' ? 'węższy' : 'niższy';
  if (percent === 0) return `tak samo ${axis === 'szer' ? 'szeroki' : 'wysoki'} jak był`;
  return percent > 0 ? `o ${percent}% ${word}` : `o ${-percent}% ${anti}`;
}

function NumberField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  const clamp = (next: number) => Math.min(64, Math.max(4, next));
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="shrink-0">{label}</span>
      <span className="inline-flex items-center">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={disabled}
          aria-label={`${label}: mniej`}
          className="flex h-8 w-8 items-center justify-center border bg-white disabled:opacity-40 dark:bg-zinc-900"
        >
          <Minus className="h-3.5 w-3.5" aria-hidden />
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={4}
          max={64}
          disabled={disabled}
          onChange={(event) => onChange(clamp(Number(event.target.value) || 0))}
          className="h-8 w-14 border-y bg-white text-center text-sm tabular-nums disabled:opacity-40 dark:bg-zinc-900"
          aria-label={`${label} w pikselach`}
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={disabled}
          aria-label={`${label}: więcej`}
          className="flex h-8 w-8 items-center justify-center border bg-white disabled:opacity-40 dark:bg-zinc-900"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
        </button>
        <span className="ml-1.5 text-xs text-muted-foreground">px</span>
      </span>
    </label>
  );
}
