'use client';

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import {
  PAPER,
  SCENE,
  SCENE_H,
  SCENE_W,
  TOWER,
  contrastOf,
  luminance,
  overlaps,
  underneath,
  type Rect,
} from './scene';

/**
 * Pracownia podpisu — **symulator, który ocenia to, co dziecko ustawiło, według
 * jawnie wypisanej reguły**. Ten sam gatunek widżetu co `PasswordLab` w lekcji
 * o hasłach i `ComposeMail` w lekcji o poczcie: warunki stoją obok, na wierzchu,
 * i można je czytać w trakcie, a nie dostać ocenę na końcu.
 *
 * Nowe względem całego kursu jest to, co widżet mierzy: **kontrast napisu liczy
 * się z prawdziwych pikseli, które są pod nim**. Napis przeciągnięty na morze
 * przestaje być czytelny nie dlatego, że tak napisano w danych, tylko dlatego,
 * że `underneath()` przeleciała po zakrytych komórkach obrazka i policzyła ich
 * średnią jasność. Dlatego to samo białe „Akademia Pana Kleksa” raz przechodzi,
 * a raz nie — zależnie od tego, gdzie stoi.
 *
 * Płótno ma dokładnie **1096 × 756 px**, czyli wymiar z zadania obowiązkowego
 * Z-6. Dzięki temu rozmiary napisów, którymi dziecko tu kręci, to te same
 * liczby, które za chwilę wpisze w prawdziwym programie — a miniaturka obok
 * pokazuje, co z tego napisu zostaje w galerii.
 */

/** Wymiar płótna z zadania Z-6 — pracownia pracuje na tym samym, nie na „jakimś”. */
const CANVAS_W = 1096;
const CANVAS_H = 756;
const CELL_W = CANVAS_W / SCENE_W;
const CELL_H = CANVAS_H / SCENE_H;

/** Napis niższy niż 4% wysokości obrazu ginie w miniaturce — stąd ten próg. */
const MIN_SIZE = Math.round(CANVAS_H * 0.04);
/** Poniżej tego stosunku jasności napis zlewa się z tłem (próg z WCAG dla dużego tekstu). */
const MIN_CONTRAST = 3;
/** Krój pisany trzeba postawić dużo większy, żeby dało się go odczytać. */
const SCRIPT_MIN = 60;

interface FontChoice {
  id: 'bez' | 'szeryf' | 'ozdobny';
  label: string;
  family: string;
  /** Przybliżona szerokość znaku w stosunku do rozmiaru — do ramki napisu. */
  factor: number;
}

const FONTS: FontChoice[] = [
  { id: 'bez', label: 'Bezszeryfowy', family: 'Arial, Helvetica, sans-serif', factor: 0.52 },
  { id: 'szeryf', label: 'Szeryfowy', family: 'Georgia, "Times New Roman", serif', factor: 0.5 },
  {
    id: 'ozdobny',
    label: 'Ozdobny (pisany)',
    family: '"Brush Script MT", "Segoe Script", "Comic Sans MS", cursive',
    factor: 0.46,
  },
];

const INKS = [
  { color: '#ffffff', label: 'biały' },
  { color: '#fdf3d8', label: 'kremowy' },
  { color: '#ffd54a', label: 'żółty' },
  { color: '#12233d', label: 'granatowy' },
  { color: '#111111', label: 'czarny' },
  { color: '#b91c1c', label: 'czerwony' },
];

interface Caption {
  id: string;
  /** Po co ten napis jest na obrazie — wprost z brzmienia Z-6. */
  role: string;
  text: string;
  size: number;
  color: string;
  font: FontChoice['id'];
  x: number;
  y: number;
}

/**
 * Trzy napisy, których wymaga Z-6, i trzy różne usterki na start — po jednej
 * na napis, żeby każda dała się naprawić osobno: autor jest biały na jasnym
 * niebie, tytuł stoi na latarni, opis jest ciemny na ciemnej skale.
 */
const START: Caption[] = [
  {
    id: 'autor',
    role: 'Imię i nazwisko autora książki',
    text: 'Jan Brzechwa',
    size: 40,
    color: '#ffffff',
    font: 'bez',
    x: 48,
    y: 48,
  },
  {
    id: 'tytul',
    role: 'Tytuł książki',
    text: 'Akademia Pana Kleksa',
    size: 56,
    color: '#12233d',
    font: 'szeryf',
    x: 300,
    y: 300,
  },
  {
    id: 'opis',
    role: 'Co przedstawia twój rysunek',
    text: 'Latarnia morska o zachodzie',
    size: 36,
    color: '#12233d',
    font: 'bez',
    x: 60,
    y: 660,
  },
];

const fontOf = (id: Caption['font']) => FONTS.find((item) => item.id === id) ?? FONTS[0];

/** Ramka napisu w pikselach obrazu — z niej liczy się wszystko poza samym tekstem. */
function boxOf(caption: Caption) {
  const width = caption.text.trim().length * caption.size * fontOf(caption.font).factor;
  const height = caption.size * 1.2;
  return { x: caption.x, y: caption.y, w: width, h: height };
}

/** Ta sama ramka przeliczona na komórki obrazka — `underneath` liczy w komórkach. */
function cellRect(box: { x: number; y: number; w: number; h: number }): Rect {
  return {
    x0: box.x / CELL_W,
    y0: box.y / CELL_H,
    x1: (box.x + box.w) / CELL_W,
    y1: (box.y + box.h) / CELL_H,
  };
}

const TOWER_PX = {
  x0: TOWER.x0 * CELL_W,
  y0: TOWER.y0 * CELL_H,
  x1: (TOWER.x1 + 1) * CELL_W,
  y1: (TOWER.y1 + 1) * CELL_H,
};

interface Rule {
  id: string;
  label: string;
  ok: boolean;
  /** Co dokładnie jest nie tak — liczone, nie wpisane z ręki. */
  detail: string;
}

function checkCaption(caption: Caption): Rule[] {
  const text = caption.text.trim();
  const box = boxOf(caption);
  const under = underneath(SCENE, cellRect(box));
  const ratio = contrastOf(luminance(caption.color), under.lum);
  const inFrame =
    box.x >= 0 && box.y >= 0 && box.x + box.w <= CANVAS_W && box.y + box.h <= CANVAS_H;
  const onTower = overlaps(
    { x0: box.x, y0: box.y, x1: box.x + box.w, y1: box.y + box.h },
    TOWER_PX
  );

  return [
    {
      id: 'tekst',
      label: 'Napis ma treść',
      ok: text.length > 0 && (caption.id !== 'autor' || text.split(/\s+/).length >= 2),
      detail:
        text.length === 0
          ? 'Pole jest puste — nie ma czego postawić na obrazie.'
          : 'Autor to imię ORAZ nazwisko — dwa słowa.',
    },
    {
      id: 'ramka',
      label: 'Cały mieści się na obrazie',
      ok: inFrame,
      detail: 'Napis wychodzi poza płótno — na gotowym pliku zobaczysz tylko jego kawałek.',
    },
    {
      id: 'rozmiar',
      label: `Wysokość co najmniej ${MIN_SIZE} px`,
      ok: caption.size >= MIN_SIZE,
      detail: `${caption.size} px na obrazie wysokim na ${CANVAS_H} px to za mało — w miniaturce obok napis znika.`,
    },
    {
      id: 'kroj',
      label: 'Krój pasuje do rozmiaru',
      ok: caption.font !== 'ozdobny' || caption.size >= SCRIPT_MIN,
      detail: `Krój pisany ma zawijasy zamiast prostych kresek. Poniżej ${SCRIPT_MIN} px zlewają się w jedną falę — albo powiększ napis, albo zmień krój.`,
    },
    {
      id: 'kontrast',
      label: 'Odcina się od tła',
      ok: ratio >= MIN_CONTRAST,
      detail: `Pod napisem jest ${under.dominant}, a litery są ${
        luminance(caption.color) > under.lum ? 'niewiele jaśniejsze' : 'niewiele ciemniejsze'
      } (${ratio.toFixed(1).replace('.', ',')}× różnicy jasności, potrzeba ${MIN_CONTRAST}×). Przesuń napis w inne miejsce albo zmień jego kolor.`,
    },
    {
      id: 'latarnia',
      label: 'Nie zasłania latarni',
      ok: !onTower,
      detail:
        'Napis leży na latarni — podpis ma mówić, co jest na obrazku, a nie go zakrywać. Spokojne miejsca są na tym obrazie dwa: pas nieba nad latarnią i pas skały pod nią.',
    },
  ];
}

const passes = (caption: Caption) => checkCaption(caption).every((rule) => rule.ok);

interface CaptionLabProps {
  color: string;
  onComplete?: () => void;
}

export function CaptionLab({ color, onComplete }: CaptionLabProps) {
  const [captions, setCaptions] = useState<Caption[]>(START);
  const [selected, setSelected] = useState<string>('autor');
  const [saved, setSaved] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);
  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(saved ? 'gotowe' : 'praca');

  const current = captions.find((item) => item.id === selected) ?? captions[0];
  const rules = checkCaption(current);
  const allGood = captions.every(passes);

  useEffect(() => {
    if (!saved || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [saved, onComplete]);

  const update = (patch: Partial<Caption>) => {
    setCaptions((prev) =>
      prev.map((item) => (item.id === current.id ? { ...item, ...patch } : item))
    );
  };

  const toImage = (event: { clientX: number; clientY: number }) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const startDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (saved) return;
    svgRef.current = event.currentTarget;
    const point = toImage(event);
    /* Trafienie liczymy od ostatniego napisu, bo ten rysuje się na wierzchu. */
    const hit = [...captions].reverse().find((item) => {
      const box = boxOf(item);
      return (
        point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h
      );
    });
    if (!hit) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(hit.id);
    dragOffset.current = { dx: point.x - hit.x, dy: point.y - hit.y };
  };

  const moveDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    const offset = dragOffset.current;
    if (!offset) return;
    const point = toImage(event);
    setCaptions((prev) =>
      prev.map((item) =>
        item.id === selected
          ? {
              ...item,
              x: Math.round(Math.max(-40, Math.min(CANVAS_W + 40, point.x - offset.dx))),
              y: Math.round(Math.max(-40, Math.min(CANVAS_H + 40, point.y - offset.dy))),
            }
          : item
      )
    );
  };

  const endDrag = () => {
    dragOffset.current = null;
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          {saved
            ? 'Obraz zapisany — trzy napisy, wszystkie do przeczytania.'
            : 'Ustaw trzy napisy tak, żeby każdy dało się przeczytać.'}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          płótno: {CANVAS_W} × {CANVAS_H} px
        </p>
      </div>

      {/*
        Najdłuższy blok kursu w pionie (na telefonie ~940 px od płótna do
        ostatniego pokrętła). Poniżej `lg` panel z krojem, rozmiarem i kolorem stoi
        pod płótnem, więc bez przyklejenia dziecko zmieniało kolor liter, nie
        widząc napisu, który właśnie przemalowuje.

        Siatka włącza się dopiero od `lg`, i to jest warunek działania `sticky`:
        element siatki jest uwięziony we własnym wierszu, więc nie ma po czym
        jechać. W zwykłym przepływie jego „więzieniem" jest cały kontener razem z
        panelem sterowania — dopiero wtedy płótno faktycznie zostaje na ekranie.
      */}
      <div className="space-y-5 lg:grid lg:gap-5 lg:space-y-0 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/*
          `contents` poniżej `lg` rozpuszcza tę kolumnę: płótno i miniaturka stają
          się bezpośrednimi dziećmi kontenera, który trzyma również panel
          sterowania — i dopiero wtedy `sticky` na płótnie ma po czym jechać.
          Od `lg` kolumna wraca i jest zwykłym elementem siatki.
        */}
        <div className="contents lg:block lg:min-w-0">
          {/* Przyklejone jest samo płótno — miniaturka „jak w galerii" zostaje w przepływie. */}
          <div className="sticky top-9 z-10 -mx-4 bg-white px-4 pb-2 dark:bg-zinc-900 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 dark:lg:bg-transparent">
            <Board
              captions={captions}
              selected={saved ? null : selected}
              plain={saved}
              svgRef={svgRef}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-start gap-4">
            <figure className="w-[140px] shrink-0">
              <div className="border">
                <Board captions={captions} selected={null} plain />
              </div>
              <figcaption className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                Tak wygląda w galerii — 140 px szerokości. Za mały napis znika właśnie tutaj.
              </figcaption>
            </figure>
            <p className="min-w-[180px] flex-1 text-xs leading-relaxed text-muted-foreground">
              Napisy przeciąga się palcem albo myszą po obrazie. Stuknij napis, żeby go wybrać —
              wtedy pod spodem zmienisz jego treść, rozmiar, krój i kolor.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Wybór napisu — trzy pozycje, każda z odznaką „gotowe/do poprawki”. */}
          <div className="space-y-1.5">
            {captions.map((item) => {
              const good = passes(item);
              const active = item.id === current.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item.id)}
                  className={cn(
                    'flex w-full items-start gap-2 border-2 px-2.5 py-2 text-left text-xs transition',
                    !active && 'hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                  style={{
                    borderColor: active ? color : `${color}33`,
                    backgroundColor: active ? `${color}12` : undefined,
                  }}
                >
                  <span className="mt-0.5 shrink-0">
                    {good ? (
                      <Check className="h-3.5 w-3.5" style={{ color }} aria-hidden />
                    ) : (
                      <X className="h-3.5 w-3.5 text-amber-600" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-snug">{item.role}</span>
                    <span className="block truncate text-muted-foreground">
                      {item.text.trim() || '(pusty)'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {!saved && (
            <div className="border bg-zinc-50 p-3 dark:bg-zinc-800/60">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Treść napisu
                <input
                  type="text"
                  value={current.text}
                  onChange={(event) => update({ text: event.target.value })}
                  maxLength={40}
                  className="mt-1 w-full border bg-white px-2 py-1.5 text-sm font-normal normal-case tracking-normal text-foreground dark:bg-zinc-900"
                />
              </label>

              <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Rozmiar
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => update({ size: Math.max(14, current.size - 4) })}
                  aria-label="Mniejszy napis"
                  className="flex h-8 w-8 items-center justify-center border bg-white dark:bg-zinc-900"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden />
                </button>
                <span className="w-16 text-center text-sm tabular-nums">{current.size} px</span>
                <button
                  type="button"
                  onClick={() => update({ size: Math.min(140, current.size + 4) })}
                  aria-label="Większy napis"
                  className="flex h-8 w-8 items-center justify-center border bg-white dark:bg-zinc-900"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>

              <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Krój
              </p>
              <div className="flex flex-wrap gap-1.5">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => update({ font: font.id })}
                    aria-pressed={current.font === font.id}
                    className="border-2 px-2 py-1 text-xs"
                    style={{
                      borderColor: current.font === font.id ? color : `${color}33`,
                      fontFamily: font.family,
                    }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>

              <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Kolor liter
              </p>
              <div className="flex flex-wrap gap-1.5">
                {INKS.map((ink) => (
                  <button
                    key={ink.color}
                    type="button"
                    onClick={() => update({ color: ink.color })}
                    aria-label={`Kolor liter: ${ink.label}`}
                    aria-pressed={current.color === ink.color}
                    className="h-8 w-8 border-2"
                    style={{
                      backgroundColor: ink.color,
                      borderColor: current.color === ink.color ? color : '#9ca3af',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        {/*
          Warunki wypisane wprost — jak w `PasswordLab`. Dziecko ma je czytać w
          trakcie, nie dostać ocenę na końcu.

          Dlatego lista NIE może stać pod całą siatką: na desktopie odpowiedź na
          kliknięcie w kolor liter lądowała wtedy 677 px niżej, poza ekranem, i widżet
          zamieniał się dokładnie w „ocenę na końcu". Siedzi więc W TEJ SAMEJ kolumnie
          co pokrętła, tuż pod nimi — kliknięcie i odpowiedź są obok siebie.
        */}
        {!saved && (
            <div className="border-t pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Napis „{current.role}” — co sprawdza program
            </p>
            <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
              {rules.map((rule) => (
                <li key={rule.id} className="flex items-start gap-2 text-sm leading-snug">
                  {rule.ok ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  )}
                  <span className={rule.ok ? 'text-muted-foreground' : undefined}>
                    {rule.label}
                    {!rule.ok && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {rule.detail}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="text-sm leading-relaxed">
              Napis na obrazie to nie to samo co napis w zeszycie. W zeszycie tło jest zawsze białe,
              a na obrazie <strong>każde miejsce ma inny kolor</strong> — dlatego ten sam biały
              napis raz widać, a raz nie. Trzy rzeczy trzeba więc ustawić razem:{' '}
              <strong>gdzie</strong> napis stoi, <strong>jak duży</strong> jest i{' '}
              <strong>jakiego koloru</strong>.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sprawdzian jest za darmo i zawsze ten sam: zmniejsz obrazek do miniaturki. Jeśli
              napisu nie da się w niej przeczytać, w prawdziwej galerii też się nie da.
            </p>
          </motion.div>
        ) : (
          <motion.div key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <button
              type="button"
              onClick={() => setSaved(true)}
              disabled={!allGood}
              className="px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: color }}
            >
              Zapisz obraz z podpisami
            </button>
            {!allGood && (
              <span className="ml-3 text-xs text-muted-foreground">
                {captions.filter(passes).length} z {captions.length} napisów gotowych
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface BoardProps {
  captions: Caption[];
  selected: string | null;
  plain?: boolean;
  svgRef?: RefObject<SVGSVGElement | null>;
  onPointerDown?: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<SVGSVGElement>) => void;
}

/**
 * Obraz w prawdziwych wymiarach Z-6. Scenę rysujemy jej własnymi komórkami
 * rozciągniętymi na płótno (34,25 × 31,5 px), a napisy pozycjonujemy w
 * pikselach obrazu — dokładnie tak, jak leżą w pliku.
 */
function Board({
  captions,
  selected,
  plain = false,
  svgRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: BoardProps) {
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      className={cn('block h-auto w-full border', !plain && 'touch-none')}
      role="img"
      aria-label="Obraz 1096 na 756 pikseli z trzema napisami"
      shapeRendering="crispEdges"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={PAPER} />
      {SCENE.cells.map((cellColor, i) => (
        <rect
          key={i}
          x={(i % SCENE_W) * CELL_W}
          y={Math.floor(i / SCENE_W) * CELL_H}
          width={CELL_W + 0.5}
          height={CELL_H + 0.5}
          fill={cellColor}
        />
      ))}
      {captions.map((caption) => {
        const box = boxOf(caption);
        const font = fontOf(caption.font);
        return (
          <g key={caption.id}>
            {!plain && (
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                fill={caption.id === selected ? '#ffffff' : 'transparent'}
                fillOpacity={caption.id === selected ? 0.12 : 0}
                stroke={caption.id === selected ? '#ffffff' : '#ffffff'}
                strokeOpacity={caption.id === selected ? 0.9 : 0.25}
                strokeWidth={2}
                strokeDasharray="8 6"
                style={{ cursor: 'move' }}
              />
            )}
            <text
              x={box.x}
              y={box.y + caption.size * 0.92}
              fontSize={caption.size}
              fontFamily={font.family}
              fill={caption.color}
              shapeRendering="auto"
            >
              {caption.text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
