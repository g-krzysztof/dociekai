'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Crop, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { PictureView, toPixel } from '../../picture-view';
import {
  LAMP_HEAD,
  SCENE,
  SCENE_H,
  SCENE_W,
  SHORE,
  crop,
  fitsInside,
  rectH,
  rectW,
  resample,
  shapeOf,
  type Rect,
} from './scene';

/**
 * Ćwiczenie o kształcie obrazu — **to samo zamówienie wykonane dwa razy**,
 * ten sam chwyt co para `AbacusDrill` / `PascalinaSim` w lekcji o historii
 * komputera. Różnicy między „przeskaluj” a „skadruj” nie da się opowiedzieć;
 * trzeba zobaczyć, jak ta sama latarnia raz robi się przysadzista, a raz traci
 * kawałek nieba.
 *
 * Trzy zamówienia są tak dobrane, żeby **reguła wyszła sama**: dwa mają inny
 * kształt niż oryginał (kwadratowy awatar, szeroki baner) i skalowanie je psuje,
 * a trzecie ma **ten sam kształt 4:3** — i wtedy to kadrowanie jest błędem, bo
 * klient prosił o cały obrazek, a w oknie mieści się ćwiartka. Kolejność jest
 * celowa: po dwóch kadrowaniach z rzędu trzecie zamówienie kusi, żeby zrobić to
 * samo po raz trzeci.
 *
 * Werdykt nie jest opinią. Zniekształcenie liczy się z ilorazu skal, a „czy
 * mieści się w kadrze” — z prawdziwego prostokąta latarni (`fitsInside`).
 */

type Method = 'skaluj' | 'kadruj';

interface Order {
  id: string;
  client: string;
  brief: string;
  w: number;
  h: number;
  /** Co musi zostać w kadrze; `null` znaczy „cały obrazek, nic nie może odpaść”. */
  need: { rect: Rect; name: string } | null;
  learned: string;
}

const ORDERS: Order[] = [
  {
    id: 'awatar',
    client: 'Awatar do dziennika',
    brief:
      'Kwadratowe zdjęcie profilowe, 12 × 12 px. Ma być na nim widać GÓRĘ LATARNI Z LAMPĄ — całą, bez ucinania.',
    w: 12,
    h: 12,
    need: { rect: LAMP_HEAD, name: 'góra latarni z lampą' },
    learned:
      'Kwadrat z prostokąta da się zrobić tylko jednym sposobem: wybierając, co zostaje. Kadrowanie nie zmniejsza rysunku — ono go PRZYCINA, a to, co poza ramką, po prostu nie wchodzi.',
  },
  {
    id: 'baner',
    client: 'Baner na stronę klasy',
    brief:
      'Szeroki pasek 32 × 10 px na górę strony. Ma na nim być LINIA WODY: morze, piana i pas trawy nad klifem.',
    w: 32,
    h: 10,
    need: { rect: SHORE, name: 'linia wody z morzem i trawą' },
    learned:
      'Baner jest prawie trzy razy szerszy niż wyższy, a obrazek nie jest. Skalowanie spłaszczyło wszystko jak naleśnik — kadrowanie zamiast tego wycięło z obrazka pas, który akurat pasuje.',
  },
  {
    id: 'miniaturka',
    client: 'Miniaturka do galerii',
    brief:
      'Mały podgląd 8 × 6 px. Ma być widać CAŁY obrazek — klient chce wiedzieć, co jest na zdjęciu, zanim je otworzy.',
    w: 8,
    h: 6,
    need: null,
    learned:
      'Tym razem kształt się zgadzał: 8 : 6 to ten sam kształt co 32 : 24. Kiedy kształt pasuje, skalowanie nic nie psuje i nic nie ucina — a kadrowanie odcięłoby trzy czwarte obrazka.',
  },
];

interface FitOrCutProps {
  color: string;
  onComplete?: () => void;
}

export function FitOrCut({ color, onComplete }: FitOrCutProps) {
  const [index, setIndex] = useState(0);
  const [method, setMethod] = useState<Method>('skaluj');
  const [win, setWin] = useState({ x: 0, y: 0 });
  const [note, setNote] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);
  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(`${index}-${done}`);

  const order = ORDERS[index];
  const maxX = Math.max(0, SCENE_W - order.w);
  const maxY = Math.max(0, SCENE_H - order.h);
  const result =
    method === 'skaluj'
      ? resample(SCENE, order.w, order.h)
      : crop(SCENE, win.x, win.y, order.w, order.h);

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const place = (event: ReactPointerEvent<SVGSVGElement>) => {
    const point = toPixel(event, svgRef.current, SCENE);
    setWin({
      x: Math.min(maxX, Math.max(0, point.x - Math.floor(order.w / 2))),
      y: Math.min(maxY, Math.max(0, point.y - Math.floor(order.h / 2))),
    });
  };

  const startDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (solved || method !== 'kadruj') return;
    svgRef.current = event.currentTarget;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    place(event);
  };

  const moveDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    place(event);
  };

  const endDrag = () => {
    dragging.current = false;
  };

  const deliver = () => {
    if (solved) return;
    const sx = order.w / SCENE_W;
    const sy = order.h / SCENE_H;
    const squash = Math.round((1 - Math.min(sx, sy) / Math.max(sx, sy)) * 100);

    if (method === 'skaluj') {
      if (squash === 0) {
        setSolved(true);
        setNote(null);
        return;
      }
      setNote(
        sx < sy
          ? `Szerokość skurczyła się do ${Math.round(sx * 100)}% oryginału, a wysokość do ${Math.round(sy * 100)}%. Latarnia jest przez to o ${squash}% chudsza, niż powinna — a chuda latarnia to już nie ta sama latarnia.`
          : `Wysokość skurczyła się do ${Math.round(sy * 100)}% oryginału, a szerokość do ${Math.round(sx * 100)}%. Wszystko jest o ${squash}% niższe, niż powinno — mewy wyglądają jak rozdeptane.`
      );
      return;
    }

    if (!order.need) {
      const kept = Math.round(((order.w * order.h) / (SCENE_W * SCENE_H)) * 100);
      setNote(
        `W ramce mieści się ${kept}% obrazka — reszta w ogóle do miniaturki nie wchodzi. A zamówienie mówi: ma być widać CAŁY obrazek.`
      );
      return;
    }

    const { rect, name } = order.need;
    if (fitsInside(rect, win.x, win.y, order.w, order.h)) {
      setSolved(true);
      setNote(null);
      return;
    }
    if (rectW(rect) > order.w || rectH(rect) > order.h) {
      setNote(
        `To, co ma zostać (${name}), jest większe niż cała ramka — tego kadrem nie da się złapać. Spróbuj drugiego sposobu.`
      );
      return;
    }
    const sides: string[] = [];
    if (rect.x0 < win.x) sides.push('z lewej');
    if (rect.x1 >= win.x + order.w) sides.push('z prawej');
    if (rect.y0 < win.y) sides.push('u góry');
    if (rect.y1 >= win.y + order.h) sides.push('u dołu');
    setNote(
      `Ramka jest dobrego rozmiaru, ale nie w tym miejscu: ${name} wychodzi poza kadr ${sides.join(' i ')}. Przesuń ramkę po obrazku — możesz ją przeciągać palcem albo myszą.`
    );
  };

  const switchMethod = (next: Method) => {
    if (solved) return;
    setMethod(next);
    setNote(null);
  };

  const nextOrder = () => {
    if (index === ORDERS.length - 1) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setMethod('skaluj');
    setWin({ x: 0, y: 0 });
    setNote(null);
    setSolved(false);
  };

  if (done) {
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm font-semibold sm:text-base" style={{ color }}>
          Trzy zamówienia oddane. Dwa przez kadrowanie, jedno przez skalowanie.
        </p>
        <p className="mt-2 text-sm leading-relaxed sm:text-base">
          Zanim zmienisz rozmiar obrazka, porównaj dwa kształty — kształt tego, co masz, i kształt
          tego, czego ktoś chce. Nasz obrazek ma kształt <strong>4 : 3</strong>.
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed sm:text-base">
          <li className="flex gap-2">
            <span className="font-mono font-bold" style={{ color }}>
              =
            </span>
            <span>
              <strong>Kształty takie same</strong> — skaluj. Nic nie odpadnie, ubędzie tylko
              szczegółów.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-mono font-bold" style={{ color }}>
              ≠
            </span>
            <span>
              <strong>Kształty różne</strong> — kadruj. Musisz wybrać, co zostaje, i to jest
              normalne. Kadrowanie to decyzja, nie strata.
            </span>
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Trzecia droga, ta najgorsza, to rozciągnięcie obrazka na siłę do cudzego kształtu. Poznasz
          ją po ludziach na zdjęciach — nagle wszyscy są albo chudzi jak zapałki, albo szerocy jak
          szafy.
        </p>
      </div>
    );
  }

  const shapeSource = shapeOf(SCENE_W, SCENE_H);
  const shapeTarget = shapeOf(order.w, order.h);

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">{order.client}</p>
        <p className="text-xs tabular-nums text-muted-foreground">
          zamówienie {index + 1} z {ORDERS.length}
        </p>
      </div>
      <p className="mb-3 text-sm leading-relaxed sm:text-base">{order.brief}</p>

      {/* Dwie liczby postawione obok siebie — to z nich wychodzi cała reguła
          bloku, więc stoją na wierzchu jako dane, nie jako podpowiedź. */}
      <p className="mb-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 border px-3 py-1.5 text-xs tabular-nums">
        <span className="text-muted-foreground">kształt obrazka</span>
        <strong>{shapeSource}</strong>
        <span className="text-muted-foreground">· kształt zamówienia</span>
        <strong style={{ color: shapeSource === shapeTarget ? color : undefined }}>
          {shapeTarget}
        </strong>
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <MethodButton
          active={method === 'skaluj'}
          color={color}
          icon={Maximize2}
          label="Przeskaluj do rozmiaru"
          onClick={() => switchMethod('skaluj')}
        />
        <MethodButton
          active={method === 'kadruj'}
          color={color}
          icon={Crop}
          label="Skadruj ramką"
          onClick={() => switchMethod('kadruj')}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <figure className="min-w-0 sm:max-w-[420px]">
          <PictureView
            pic={SCENE}
            label="Obrazek źródłowy, 32 na 24 piksele"
            className={cn('border-2', method === 'kadruj' && !solved && 'cursor-crosshair touch-none')}
            style={{ borderColor: `${color}44` }}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
          >
            {method === 'kadruj' && (
              <>
                {/* Przygaszenie tego, co poza kadrem — cztery prostokąty, bo
                    maska w SVG bywa zawodna przy skalowaniu viewBoxa. */}
                <rect x={0} y={0} width={SCENE_W} height={win.y} fill="#000" opacity={0.45} />
                <rect
                  x={0}
                  y={win.y + order.h}
                  width={SCENE_W}
                  height={SCENE_H - win.y - order.h}
                  fill="#000"
                  opacity={0.45}
                />
                <rect x={0} y={win.y} width={win.x} height={order.h} fill="#000" opacity={0.45} />
                <rect
                  x={win.x + order.w}
                  y={win.y}
                  width={SCENE_W - win.x - order.w}
                  height={order.h}
                  fill="#000"
                  opacity={0.45}
                />
                <rect
                  x={win.x}
                  y={win.y}
                  width={order.w}
                  height={order.h}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={0.35}
                />
                <rect
                  x={win.x}
                  y={win.y}
                  width={order.w}
                  height={order.h}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.18}
                  strokeDasharray="0.7 0.5"
                />
              </>
            )}
          </PictureView>
          <figcaption className="mt-2 text-xs text-muted-foreground">
            {method === 'kadruj'
              ? 'Przeciągnij ramkę palcem albo myszą po obrazku.'
              : 'Skalowanie bierze cały obrazek — nie ma tu czego przesuwać.'}
          </figcaption>
        </figure>

        <figure className="mx-auto sm:mx-0">
          <div
            className="border-2 bg-white p-1 dark:bg-zinc-900"
            style={{
              borderColor: `${color}66`,
              width: Math.max(120, Math.min(190, order.w * 6)),
            }}
          >
            <PictureView pic={result} label={`Wynik: ${order.w} na ${order.h} pikseli`} />
          </div>
          <figcaption className="mt-2 text-center text-xs tabular-nums text-muted-foreground">
            {order.w} × {order.h} px
          </figcaption>
          <button
            type="button"
            onClick={deliver}
            disabled={solved}
            className="mt-3 w-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: color }}
          >
            Oddaj zamówienie
          </button>
        </figure>
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

function MethodButton({
  active,
  color,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  color: string;
  icon: typeof Crop;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 border-2 px-3 py-2 text-sm font-medium transition',
        !active && 'hover:bg-black/5 dark:hover:bg-white/5'
      )}
      style={{
        borderColor: active ? color : `${color}44`,
        backgroundColor: active ? `${color}14` : undefined,
      }}
    >
      <Icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
      {label}
    </button>
  );
}
