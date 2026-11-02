'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, PenLine, RotateCcw, Send, ShieldQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Haczyk lekcji — **pierwsze miejsce w całym repo, w którym dziecko rysuje**,
 * a strona zapamiętuje ten rysunek i niesie go przez resztę lekcji.
 *
 * O prawie autorskim nie da się przekonać zdaniem „szanuj cudzą pracę”, dopóki
 * nie zabierze się dziecku czegoś jego własnego. Więc: rysujesz, podpisujesz,
 * wrzucasz do sieci — a potem **przez cztery kolejne sceny nic już od ciebie nie
 * zależy**: rysunek idzie dalej, ktoś przycina podpis, ktoś podpisuje go „autor
 * nieznany”, ktoś drukuje go na kubkach i liczy sprzedaż. Dopiero na końcu
 * dziecko dostaje jeden przycisk — i to nie jest przycisk „popraw wynik”, tylko
 * zdanie, które w tej lekcji jest najważniejsze: to było twoje od pierwszej kreski.
 *
 * Rysunek wraca w bloku 2 (dziecko ustawia dla NIEGO licencję) i w kartce
 * końcowej — dlatego `onSign` podaje go w górę, do `LessonBody`, gdzie przeżywa
 * reset pojedynczego bloku.
 */

export interface Stroke {
  color: string;
  points: { x: number; y: number }[];
}

export interface Drawing {
  strokes: Stroke[];
  name: string;
}

/** Układ współrzędnych rysunku: 320×200 na kreski + pasek 40 na podpis. */
export const CANVAS_W = 320;
export const CANVAS_DRAW_H = 200;
export const CANVAS_H = 240;

const PENCILS = ['#1f2937', '#dc2626', '#2563eb', '#16a34a', '#d97706'];

/** Rysunek jako czysta grafika — używany też przez blok 2 i kartkę końcową. */
export function DrawingCanvas({
  drawing,
  crop = false,
  signature = 'own',
  className,
}: {
  drawing: Drawing | null;
  /** Kadr bez dolnego paska — czyli bez podpisu, tak jak po „przycięciu”. */
  crop?: boolean;
  /** `own` — podpis autora, `unknown` — „autor nieznany”, `none` — bez paska. */
  signature?: 'own' | 'unknown' | 'none';
  className?: string;
}) {
  const height = crop ? CANVAS_DRAW_H : CANVAS_H;
  return (
    <svg
      viewBox={`0 0 ${CANVAS_W} ${height}`}
      className={cn('block h-auto w-full bg-white', className)}
      role="img"
      aria-label={
        drawing && drawing.strokes.length > 0
          ? 'Twój rysunek narysowany przed chwilą w tym ćwiczeniu'
          : 'Puste pole na rysunek'
      }
    >
      {drawing?.strokes.map((stroke, i) => (
        <polyline
          key={i}
          points={stroke.points.map((point) => `${point.x},${point.y}`).join(' ')}
          fill="none"
          stroke={stroke.color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {!crop && signature !== 'none' && (
        <>
          <line x1={0} y1={CANVAS_DRAW_H} x2={CANVAS_W} y2={CANVAS_DRAW_H} stroke="#e4e4e7" />
          <text
            x={CANVAS_W - 10}
            y={CANVAS_DRAW_H + 25}
            textAnchor="end"
            fontSize={14}
            fontStyle="italic"
            fill={signature === 'unknown' ? '#a1a1aa' : '#52525b'}
          >
            {signature === 'unknown' ? 'autor nieznany' : `rys. ${drawing?.name || 'Ty'}`}
          </text>
        </>
      )}
    </svg>
  );
}

interface Stage {
  id: string;
  when: string;
  text: string;
  crop?: boolean;
  signature: 'own' | 'unknown' | 'none';
  shop?: boolean;
}

const STAGES: Stage[] = [
  {
    id: 'dalej',
    when: 'Po dwóch minutach',
    text: 'Zosia z klasy wysłała twój rysunek na grupę. „Zobaczcie, jakie fajne!” — nic złego, podpis jest na miejscu.',
    signature: 'own',
  },
  {
    id: 'przyciecie',
    when: 'Po godzinie',
    text: 'Ktoś przyciął dolny pasek, żeby rysunek lepiej pasował do posta. Razem z paskiem zniknął twój podpis.',
    crop: true,
    signature: 'none',
  },
  {
    id: 'mem',
    when: 'Po trzech dniach',
    text: 'Rysunek trafił na stronę ze śmiesznymi obrazkami. Ktoś dopisał pod nim: „autor nieznany”.',
    signature: 'unknown',
  },
  {
    id: 'kubki',
    when: 'Po miesiącu',
    text: 'Sklep z gadżetami drukuje go na kubkach i sprzedaje po 39 zł. Nikt cię o nic nie zapytał.',
    signature: 'unknown',
    shop: true,
  },
];

interface MyMarkProps {
  color: string;
  /** Podaje gotowy rysunek w górę — niesie go reszta lekcji. */
  onSign?: (drawing: Drawing) => void;
  onComplete?: () => void;
}

export function MyMark({ color, onSign, onComplete }: MyMarkProps) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [pencil, setPencil] = useState(PENCILS[0]);
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<'rysuje' | 'podpisany' | 'krazy' | 'wiem'>('rysuje');
  const [shown, setShown] = useState(0);
  const [sold, setSold] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const drawingRef = useRef(false);

  const points = strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
  const enough = points >= 24;
  const drawing: Drawing = { strokes, name: name.trim() };

  // Sceny dochodzą same — po wrzuceniu rysunku dziecko już nic nie decyduje.
  useEffect(() => {
    if (phase !== 'krazy' || shown >= STAGES.length) return;
    const timer = setTimeout(() => setShown((prev) => prev + 1), shown === 0 ? 500 : 2300);
    return () => clearTimeout(timer);
  }, [phase, shown]);

  // Licznik sprzedanych kubków — rośnie sam, dopóki nie dobije do 47.
  useEffect(() => {
    if (shown < STAGES.length) return;
    const timer = setInterval(() => setSold((prev) => (prev >= 47 ? prev : prev + 1)), 260);
    return () => clearInterval(timer);
  }, [shown]);

  const toCanvas = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = ((event.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((event.clientY - rect.top) / rect.height) * CANVAS_H;
    return {
      x: Math.round(Math.min(CANVAS_W - 3, Math.max(3, x)) * 10) / 10,
      y: Math.round(Math.min(CANVAS_DRAW_H - 4, Math.max(4, y)) * 10) / 10,
    };
  };

  const start = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (phase !== 'rysuje') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const point = toCanvas(event);
    setStrokes((prev) => [...prev, { color: pencil, points: [point] }]);
  };

  const move = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!drawingRef.current || phase !== 'rysuje') return;
    const point = toCanvas(event);
    setStrokes((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      const previous = last.points[last.points.length - 1];
      // Punkty bliżej niż 2 jednostki nic nie wnoszą, a puchną w pamięci.
      if (Math.abs(previous.x - point.x) + Math.abs(previous.y - point.y) < 2) return prev;
      const next = [...prev];
      next[next.length - 1] = { ...last, points: [...last.points, point] };
      return next;
    });
  };

  const stop = () => {
    drawingRef.current = false;
  };

  const sign = () => {
    setPhase('podpisany');
    onSign?.({ strokes, name: name.trim() });
  };

  const reveal = () => {
    setPhase('wiem');
    onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Narysuj cokolwiek — palcem na telefonie albo myszką. Nie musi być ładne, musi być{' '}
        <strong>twoje</strong>. Za chwilę okaże się, po co.
      </p>

      <div className="grid gap-5 md:grid-cols-[minmax(0,340px)_1fr]">
        {/* Kartka do rysowania */}
        <div>
          <div className="border-2" style={{ borderColor: `${color}55` }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
              className="block h-auto w-full cursor-crosshair bg-white"
              style={{ touchAction: 'none' }}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={stop}
              onPointerCancel={stop}
              aria-label="Pole do rysowania — rysuj palcem albo myszką"
            >
              {strokes.map((stroke, i) => (
                <polyline
                  key={i}
                  points={stroke.points.map((point) => `${point.x},${point.y}`).join(' ')}
                  fill="none"
                  stroke={stroke.color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              <line
                x1={0}
                y1={CANVAS_DRAW_H}
                x2={CANVAS_W}
                y2={CANVAS_DRAW_H}
                stroke="#e4e4e7"
              />
              {phase !== 'rysuje' && (
                <text
                  x={CANVAS_W - 10}
                  y={CANVAS_DRAW_H + 25}
                  textAnchor="end"
                  fontSize={14}
                  fontStyle="italic"
                  fill="#52525b"
                >
                  rys. {name.trim() || 'Ty'}
                </text>
              )}
              {strokes.length === 0 && (
                <text
                  x={CANVAS_W / 2}
                  y={CANVAS_DRAW_H / 2}
                  textAnchor="middle"
                  fontSize={13}
                  fill="#a1a1aa"
                >
                  tu rysuj
                </text>
              )}
            </svg>
          </div>

          {phase === 'rysuje' && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {PENCILS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPencil(item)}
                  aria-label={`Kredka w kolorze ${item}`}
                  aria-pressed={pencil === item}
                  className={cn(
                    'h-7 w-7 cursor-pointer border-2 transition-transform',
                    pencil === item ? 'scale-110 border-foreground' : 'border-transparent'
                  )}
                  style={{ backgroundColor: item }}
                />
              ))}
              <button
                type="button"
                onClick={() => setStrokes([])}
                className="ml-auto inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Wyczyść
              </button>
            </div>
          )}
        </div>

        {/* Podpis i wrzucenie do sieci */}
        <div>
          {phase === 'rysuje' ? (
            <>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="autor">
                Podpisz się pod swoim rysunkiem
              </label>
              <input
                id="autor"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={16}
                placeholder="Twoje imię"
                className="w-full max-w-[240px] border px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Samo imię możesz podać spokojnie — to nie jest dana, po której ktoś cię znajdzie.
              </p>

              <button
                type="button"
                onClick={sign}
                disabled={!enough}
                className={cn(
                  'mt-4 inline-flex items-center gap-2 border-2 px-4 py-2.5 text-sm font-semibold transition-colors',
                  enough
                    ? 'cursor-pointer text-white'
                    : 'cursor-not-allowed border-dashed text-muted-foreground'
                )}
                style={enough ? { backgroundColor: color, borderColor: color } : undefined}
              >
                <PenLine className="h-4 w-4" aria-hidden />
                Gotowe — to mój rysunek
              </button>
              {!enough && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Dorysuj jeszcze trochę — na razie na kartce prawie nic nie ma.
                </p>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">
                Od tej chwili ten rysunek ma autora i autor to <strong>ty</strong>. Pokażmy go
                światu — tak jak pokazuje się wszystko inne.
              </p>
              {phase === 'podpisany' && (
                <button
                  type="button"
                  onClick={() => setPhase('krazy')}
                  className="inline-flex cursor-pointer items-center gap-2 border-2 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: color, borderColor: color }}
                >
                  <Send className="h-4 w-4" aria-hidden />
                  Wrzuć do internetu
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Co się dzieje dalej — bez udziału dziecka */}
      {phase !== 'rysuje' && phase !== 'podpisany' && (
        <div className="mt-6 space-y-3 border-t pt-5">
          <AnimatePresence initial={false}>
            {STAGES.slice(0, shown).map((stage) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="grid gap-3 border p-3 sm:grid-cols-[140px_1fr] sm:p-4"
              >
                <div className="mx-auto w-full max-w-[160px] border bg-white">
                  {stage.shop ? (
                    <div className="relative">
                      <DrawingCanvas drawing={drawing} crop signature="none" />
                      <span
                        className="absolute bottom-1 right-1 border bg-white px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ borderColor: color, color }}
                      >
                        39 zł
                      </span>
                    </div>
                  ) : (
                    <DrawingCanvas
                      drawing={drawing}
                      crop={stage.crop}
                      signature={stage.signature}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {stage.when}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{stage.text}</p>
                  {stage.shop && (
                    <p className="mt-2 text-sm font-semibold tabular-nums" style={{ color }}>
                      Sprzedanych kubków: {sold}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {shown < STAGES.length && (
            <p className="text-sm italic text-muted-foreground">Rysunek idzie dalej…</p>
          )}

          {shown >= STAGES.length && phase === 'krazy' && (
            <button
              type="button"
              onClick={reveal}
              className="inline-flex cursor-pointer items-center gap-2 border-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted/60"
              style={{ borderColor: color, color }}
            >
              <ShieldQuestion className="h-4 w-4" aria-hidden />
              Zaraz… to jest mój rysunek!
            </button>
          )}

          <AnimatePresence>
            {phase === 'wiem' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t-2 pt-4"
                style={{ borderColor: color }}
              >
                <p className="text-base font-bold sm:text-lg">Tak. I był twój przez cały czas.</p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                    <span>
                      Stałeś/stałaś się autorem <strong>od pierwszej kreski</strong>. Nie trzeba
                      niczego zgłaszać, opłacać ani pisać ©. Tak samo działa to przy zdjęciu,
                      piosence i tekście, które znajdujesz w sieci.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                    <span>
                      <strong>„Autor nieznany” nie znaczy „niczyje”.</strong> Znaczy tylko tyle, że
                      ktoś po drodze uciął podpis.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                    <span>
                      Nikt nie musiał być złośliwy. Wystarczyło, że <strong>nikt nie zapytał</strong> —
                      i po czterech krokach twój rysunek jest na kubku obcej osoby.
                    </span>
                  </li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground">
                  W następnym bloku ten sam rysunek wraca — tym razem to ty ustalasz, co komu wolno
                  z nim zrobić.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
