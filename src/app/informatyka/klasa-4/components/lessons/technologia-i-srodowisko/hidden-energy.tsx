'use client';

import { useEffect, useMemo, useRef, useState, type ComponentType, type PointerEvent } from 'react';
import {
  ArrowRight,
  Factory,
  House,
  Network,
  Pickaxe,
  Recycle,
  Router,
  Server,
  Ship,
  Store,
  Tablet,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { r2 } from './energy';

/**
 * Blok 4 — **prąd, którego nie widać**.
 *
 * Dotąd wszystko działo się w domu: korba, doba, licznik. Ale `[4.5]` mówi
 * o urządzeniach **i usługach**, a wpływ technologii na środowisko nie kończy
 * się na rachunku za prąd. Dziecko **prowadzi iskrę palcem po trasie** i na
 * każdym przystanku odsłania, kto jeszcze pracuje na jego film albo jego tablet.
 *
 * Dwie trasy, dwie rzeczy niewidoczne z kanapy:
 *
 * 1. **Film na tablecie** — od ekranu przez router, sieć i serwerownię aż do
 *    elektrowni. Usługa w internecie to też urządzenia, tylko cudze i daleko,
 *    i większość z nich nie wyłącza się nigdy. Stąd jedyna rada tej trasy:
 *    wyłączaj to, czego nikt nie ogląda.
 * 2. **Życie tabletu** — od kopalni do twojego pokoju, a potem **rozwidlenie**:
 *    zwykły kosz albo elektrośmieci. Kosz kończy trasę ślepo; elektrośmieci
 *    prowadzą z powrotem do fabryki i trasa **zamyka się w koło**. Konsekwencja
 *    widoczna w kształcie trasy, a nie w ocenie.
 *
 * Iskra jedzie po trasie jak koralik po drucie — szukamy najbliższego punktu
 * trasy tylko w oknie wokół obecnego położenia, więc nie da się przeskoczyć na
 * drugi koniec rysunku, a na rozwidleniu wygrywa ta gałąź, bliżej której jest
 * palec.
 */

type IconType = ComponentType<{ className?: string; x?: number; y?: number; width?: number; height?: number; color?: string }>;

interface Station {
  id: string;
  title: string;
  text: string;
  icon: IconType;
  x: number;
  y: number;
  /** Przystanek-ślepy zaułek: pokazujemy go na czerwono. */
  deadEnd?: boolean;
  /** Podpis domyślnie stoi pod ikoną; tu, gdzie pod ikoną biegnie trasa, obok niej. */
  labelAt?: 'left' | 'above';
}

interface Route {
  id: string;
  label: string;
  short: string;
  stations: Station[];
  /** Kolejne łamane trasy — wspólny początek, różne końce (rozwidlenie). */
  paths: { id: string; points: [number, number][]; stations: string[] }[];
  goal: string;
  ending: string;
}

const ROUTES: Route[] = [
  {
    id: 'film',
    label: 'Trasa 1: film na tablecie',
    short: 'film na tablecie',
    stations: [
      {
        id: 'tablet',
        title: 'Twój tablet',
        text: 'Tu zaczyna się film: ekran świeci, głośnik gra. Ten prąd widzisz — tablet trzeba ładować.',
        icon: Tablet,
        x: 50,
        y: 230,
      },
      {
        id: 'router',
        title: 'Router',
        text: 'Film wpada do domu przez router. Router pracuje całą dobę — także wtedy, gdy wszyscy śpią.',
        icon: Router,
        x: 170,
        y: 230,
      },
      {
        id: 'siec',
        title: 'Sieć',
        text: 'Po drodze paczki danych przechodzą przez wiele urządzeń w szafkach przy ulicach i w budynkach. Pamiętasz z lekcji o sieci, że paczki podaje się z rąk do rąk? Każda z tych „rąk” bierze prąd.',
        icon: Network,
        x: 300,
        y: 170,
      },
      {
        id: 'serwerownia',
        title: 'Serwerownia',
        text: 'Sam film leży na serwerze — komputerze, który nie wyłącza się nigdy. W serwerowni stoją ich tysiące, a obok pracuje chłodzenie, żeby się nie przegrzały. Wszystkie serwerownie świata zużywają ponad dwa razy więcej prądu niż cała Polska.',
        icon: Server,
        x: 440,
        y: 110,
      },
      {
        id: 'elektrownia',
        title: 'Elektrownia',
        text: 'Cały ten prąd trzeba gdzieś wytworzyć. W Polsce wciąż w dużej części z węgla — a spalanie węgla to dym i dwutlenek węgla, który ogrzewa Ziemię. Coraz więcej prądu dają też wiatr i słońce.',
        icon: Factory,
        x: 585,
        y: 55,
      },
    ],
    paths: [
      {
        id: 'main',
        points: [
          [50, 230],
          [170, 230],
          [235, 230],
          [235, 170],
          [300, 170],
          [370, 170],
          [370, 110],
          [440, 110],
          [515, 110],
          [515, 55],
          [585, 55],
        ],
        stations: ['tablet', 'router', 'siec', 'serwerownia', 'elektrownia'],
      },
    ],
    goal: 'elektrownia',
    ending:
      'Film to nie tylko twój ekran. To cała trasa urządzeń, które pracują dla ciebie — i prawie żadne z nich się nie wyłącza. Dlatego film, którego nikt nie ogląda — grający w tle albo puszczony sam jako „następny odcinek” — zużywa prąd na całej tej trasie. Na darmo. Wyłączaj to, czego nie oglądasz.',
  },
  {
    id: 'tablet',
    label: 'Trasa 2: życie tabletu',
    short: 'życie tabletu',
    stations: [
      {
        id: 'kopalnia',
        title: 'Kopalnia',
        text: 'Tablet zaczyna się pod ziemią: miedź, lit, kobalt i odrobina złota. Żeby je wydobyć, kopie się ogromne dziury w ziemi i zużywa mnóstwo energii i wody.',
        icon: Pickaxe,
        x: 50,
        y: 75,
      },
      {
        id: 'fabryka',
        title: 'Fabryka',
        text: 'Z metali, szkła i plastiku powstają ekran, bateria i płytka z układami. To jeden z najbardziej prądożernych momentów w całym życiu tabletu.',
        icon: Factory,
        x: 170,
        y: 75,
      },
      {
        id: 'statek',
        title: 'Transport',
        text: 'Potem tablet płynie statkiem przez pół świata — większość elektroniki powstaje w Azji.',
        icon: Ship,
        x: 300,
        y: 75,
      },
      {
        id: 'sklep',
        title: 'Sklep',
        text: 'Stoi na półce. Jeszcze nikt go nie włączył — a już ma za sobą kopalnię, fabrykę i pół świata.',
        icon: Store,
        x: 430,
        y: 75,
        labelAt: 'above',
      },
      {
        id: 'pokoj',
        title: 'Twój pokój',
        text: 'Dopiero teraz tablet trafia do ciebie, a większość szkody dla środowiska już się wydarzyła: w kopalni, w fabryce, w drodze. Dlatego najbardziej ekologiczny tablet to ten, który już masz — im dłużej go używasz, tym lepiej. Ale kiedyś się zepsuje. Dokąd go zaniesiesz? Prowadź iskrę dalej.',
        icon: House,
        x: 430,
        y: 165,
        labelAt: 'left',
      },
      {
        id: 'kosz',
        title: 'Zwykły kosz',
        text: 'Tu trasa się urywa. Metale przepadają na wysypisku, a bateria w śmieciarce może się zapalić. Elektroniki nie wolno wyrzucać do zwykłego kosza. Cofnij iskrę do rozwidlenia i spróbuj drugiej drogi.',
        icon: Trash2,
        x: 285,
        y: 255,
        deadEnd: true,
      },
      {
        id: 'elektro',
        title: 'Elektrośmieci',
        text: 'Punkt zbiórki elektrośmieci — w gminie (PSZOK) albo w sklepie z elektroniką. Zużyty sprzęt oddaje się tam za darmo. Z tabletu odzyskuje się metale…',
        icon: Recycle,
        x: 560,
        y: 255,
      },
      {
        id: 'powrot',
        title: 'Z powrotem do fabryki',
        text: '…i wracają do fabryki. Nie trzeba ich znowu wykopywać. Trasa zamieniła się w koło.',
        icon: Factory,
        x: 170,
        y: 75,
      },
    ],
    paths: [
      {
        id: 'kosz',
        points: [
          [50, 75],
          [170, 75],
          [300, 75],
          [430, 75],
          [430, 165],
          [430, 215],
          [285, 215],
          [285, 255],
        ],
        stations: ['kopalnia', 'fabryka', 'statek', 'sklep', 'pokoj', 'kosz'],
      },
      {
        id: 'elektro',
        points: [
          [50, 75],
          [170, 75],
          [300, 75],
          [430, 75],
          [430, 165],
          [430, 215],
          [560, 215],
          [560, 255],
          [612, 255],
          [612, 22],
          [170, 22],
          [170, 60],
        ],
        stations: ['kopalnia', 'fabryka', 'statek', 'sklep', 'pokoj', 'elektro', 'powrot'],
      },
    ],
    goal: 'powrot',
    ending:
      'Tablet zatoczył koło: metale z elektrośmieci wracają do fabryki i nie trzeba ich znowu wykopywać. Urządzenia, których nie wolno wyrzucać do zwykłego kosza, poznasz po tym znaczku — przekreślonym koszu na kółkach. Ma go każda ładowarka, każdy tablet i każda bateria.',
  },
];

const STEP = 3;
/** Okno szukania wokół iskry (w próbkach) — iskra nie przeskakuje po rysunku. */
const WINDOW = 45;
const GRAB_DIST = 42;
const FOLLOW_DIST = 55;

interface Sampled {
  id: string;
  samples: { x: number; y: number }[];
  /** Indeks próbki, na której leży przystanek. */
  at: Record<string, number>;
}

/** Łamana rozpisana na punkty co `STEP` jednostek; przystanki to kolejne wierzchołki leżące na stacjach. */
function sample(route: Route): Sampled[] {
  return route.paths.map((path) => {
    const samples: { x: number; y: number }[] = [];
    const at: Record<string, number> = {};
    const remaining = [...path.stations];
    const stationAt = (x: number, y: number) =>
      route.stations.find((station) => remaining[0] === station.id && Math.hypot(station.x - x, station.y - y) < 20);
    for (let i = 0; i < path.points.length - 1; i += 1) {
      const [x1, y1] = path.points[i];
      const [x2, y2] = path.points[i + 1];
      const length = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.round(length / STEP));
      for (let s = 0; s < steps; s += 1) {
        const x = x1 + ((x2 - x1) * s) / steps;
        const y = y1 + ((y2 - y1) * s) / steps;
        const hit = stationAt(x, y);
        if (hit && Math.hypot(hit.x - x, hit.y - y) < STEP) {
          at[hit.id] = samples.length;
          remaining.shift();
        }
        samples.push({ x, y });
      }
    }
    const [lx, ly] = path.points[path.points.length - 1];
    samples.push({ x: lx, y: ly });
    // Ostatni przystanek może leżeć tuż przed końcem łamanej.
    remaining.forEach((id) => {
      at[id] = samples.length - 1;
    });
    return { id: path.id, samples, at };
  });
}

export function HiddenEnergy({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [routeIndex, setRouteIndex] = useState(0);
  const [finished, setFinished] = useState<Record<string, boolean>>({});
  const reported = useRef(false);
  const allDone = ROUTES.every((route) => finished[route.id]);

  useEffect(() => {
    if (allDone && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [allDone, onComplete]);

  const route = ROUTES[routeIndex];

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Dotąd liczyliśmy prąd w domu. Ale prąd pracuje dla ciebie także daleko stąd — i to taki, którego nigdy nie
        zobaczysz na liczniku. <strong>Chwyć iskrę i prowadź ją palcem po trasie</strong>, przystanek po przystanku.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist">
        {ROUTES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={index === routeIndex}
            onClick={() => setRouteIndex(index)}
            className={cn(
              'cursor-pointer border px-3 py-1.5 text-sm transition-colors hover:bg-muted',
              index === routeIndex && 'border-2 font-semibold'
            )}
            style={index === routeIndex ? { borderColor: color, color } : undefined}
          >
            {item.label}
            {finished[item.id] && ' ✓'}
          </button>
        ))}
      </div>

      <RouteTrack
        key={route.id}
        route={route}
        color={color}
        done={Boolean(finished[route.id])}
        onFinish={() => setFinished((current) => ({ ...current, [route.id]: true }))}
      />

      {finished[route.id] && routeIndex < ROUTES.length - 1 && !finished[ROUTES[routeIndex + 1].id] && (
        <button
          type="button"
          onClick={() => setRouteIndex(routeIndex + 1)}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          style={{ borderColor: color, color }}
        >
          Dalej: {ROUTES[routeIndex + 1].short}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

function RouteTrack({
  route,
  color,
  done,
  onFinish,
}: {
  route: Route;
  color: string;
  done: boolean;
  onFinish: () => void;
}) {
  const paths = useMemo(() => sample(route), [route]);
  const [cur, setCur] = useState({ path: 0, index: 0 });
  const [reached, setReached] = useState<string[]>([route.stations[0].id]);
  const [shown, setShown] = useState(route.stations[0].id);
  const [grabbing, setGrabbing] = useState(false);
  const [completed, setCompleted] = useState(done);
  const svgRef = useRef<SVGSVGElement>(null);
  const curRef = useRef(cur);
  const dragging = useRef(false);

  const spark = paths[cur.path].samples[cur.index];

  const toSvg = (event: PointerEvent<SVGSVGElement>) => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: point.x, y: point.y };
  };

  const moveTo = (x: number, y: number) => {
    const now = curRef.current;
    let best: { path: number; index: number; dist: number } | null = null;
    for (let pathIndex = 0; pathIndex < paths.length; pathIndex += 1) {
      const path = paths[pathIndex];
      // Na inną gałąź wolno przejść tylko ze wspólnego początku — tam próbki obu łamanych są te same.
      if (pathIndex !== now.path && now.index > commonPrefix(paths[now.path], path)) continue;
      const from = Math.max(0, now.index - WINDOW);
      const to = Math.min(path.samples.length - 1, now.index + WINDOW);
      for (let i = from; i <= to; i += 1) {
        const d = Math.hypot(path.samples[i].x - x, path.samples[i].y - y);
        if (!best || d < best.dist) best = { path: pathIndex, index: i, dist: d };
      }
    }
    if (!best || best.dist > FOLLOW_DIST) return;
    const next = { path: best.path, index: best.index };
    curRef.current = next;
    setCur(next);

    const passed = Object.entries(paths[next.path].at)
      .filter(([, index]) => index <= next.index)
      .sort((a, b) => a[1] - b[1])
      .map(([id]) => id);
    const newest = passed[passed.length - 1];
    setReached((current) => (passed.every((id) => current.includes(id)) ? current : [...new Set([...current, ...passed])]));
    if (newest) setShown(newest);
    if (passed.includes(route.goal)) setCompleted(true);
  };

  useEffect(() => {
    if (completed && !done) onFinish();
  }, [completed, done, onFinish]);

  const onDown = (event: PointerEvent<SVGSVGElement>) => {
    const point = toSvg(event);
    if (!point || Math.hypot(point.x - spark.x, point.y - spark.y) > GRAB_DIST) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    setGrabbing(true);
  };
  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const point = toSvg(event);
    if (point) moveTo(point.x, point.y);
  };
  const onUp = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragging.current = false;
    setGrabbing(false);
  };

  const travelled = paths[cur.path].samples.slice(0, cur.index + 1);
  const loopClosed = completed && route.id === 'tablet';
  const station = route.stations.find((item) => item.id === shown) ?? route.stations[0];

  return (
    <div className="mt-4 space-y-3">
      <svg
        ref={svgRef}
        viewBox="0 0 640 310"
        className={cn('mx-auto block w-full max-w-[640px] select-none border', grabbing ? 'cursor-grabbing' : 'cursor-default')}
        style={{ touchAction: 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="img"
        aria-label={`${route.label}. Iskra jest przy przystanku: ${station.title}.`}
      >
        <rect width={640} height={310} fill="#fafaf9" />
        {paths.map((path) => (
          <polyline
            key={path.id}
            points={path.samples.map((point) => `${r2(point.x)},${r2(point.y)}`).join(' ')}
            fill="none"
            stroke="#d4d4d8"
            strokeWidth={6}
            strokeDasharray="2 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <polyline
          points={(loopClosed ? paths[cur.path].samples : travelled).map((point) => `${r2(point.x)},${r2(point.y)}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {route.stations
          .filter((item) => item.id !== 'powrot')
          .map((item) => {
            const Icon = item.icon;
            const lit = reached.includes(item.id);
            const tone = item.deadEnd && lit ? '#dc2626' : lit ? color : '#a1a1aa';
            return (
              <g key={item.id} pointerEvents="none">
                <circle cx={item.x} cy={item.y} r={21} fill="#fff" stroke={tone} strokeWidth={lit ? 3 : 2} />
                <Icon x={item.x - 11} y={item.y - 11} width={22} height={22} color={tone} />
                <text
                  x={item.labelAt === 'left' ? item.x - 28 : item.x}
                  y={item.labelAt === 'left' ? item.y + 5 : item.labelAt === 'above' ? item.y - 29 : item.y + 39}
                  textAnchor={item.labelAt === 'left' ? 'end' : 'middle'}
                  fontSize={15}
                  fontWeight={lit ? 700 : 500}
                  fill={lit ? '#27272a' : '#71717a'}
                >
                  {item.title}
                </text>
              </g>
            );
          })}

        {loopClosed && <WeeeSign x={560} y={125} color={color} />}

        <g pointerEvents="none">
          <circle cx={r2(spark.x)} cy={r2(spark.y)} r={20} fill="#facc15" opacity={0.35} />
          <circle cx={r2(spark.x)} cy={r2(spark.y)} r={12} fill="#facc15" stroke="#a16207" strokeWidth={2} />
        </g>
        {/* Większe, niewidoczne pole chwytu — iskrę łatwo trafić palcem. */}
        <circle cx={r2(spark.x)} cy={r2(spark.y)} r={GRAB_DIST} fill="transparent" className="cursor-grab" />
      </svg>

      <div
        className="min-h-[112px] border-l-2 p-3 text-sm leading-relaxed sm:text-base"
        style={{ borderColor: station.deadEnd ? '#dc2626' : color, backgroundColor: station.deadEnd ? '#fef2f2' : `${color}0d` }}
        aria-live="polite"
      >
        <p className="mb-1 font-bold">{station.title}</p>
        <p>{station.text}</p>
      </div>

      {reached.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground">przystanki:</span>
          {route.stations
            .filter((item) => reached.includes(item.id))
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setShown(item.id)}
                className={cn(
                  'cursor-pointer border px-2 py-0.5 text-xs transition-colors hover:bg-muted',
                  item.id === shown && 'font-semibold'
                )}
                style={item.id === shown ? { borderColor: color } : undefined}
              >
                {item.title}
              </button>
            ))}
        </div>
      )}

      {completed && (
        <p className="p-4 text-sm leading-relaxed sm:text-base" style={{ backgroundColor: `${color}12` }}>
          {route.ending}
        </p>
      )}
    </div>
  );
}

/** Ile początkowych próbek dwie łamane mają wspólnych. */
function commonPrefix(a: Sampled, b: Sampled): number {
  let i = 0;
  while (
    i < a.samples.length &&
    i < b.samples.length &&
    Math.abs(a.samples[i].x - b.samples[i].x) < 0.01 &&
    Math.abs(a.samples[i].y - b.samples[i].y) < 0.01
  ) {
    i += 1;
  }
  return i - 1;
}

/** Przekreślony kosz na kółkach — znak z każdego urządzenia elektrycznego i każdej baterii. */
function WeeeSign({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x - 22} ${y - 26})`} pointerEvents="none">
      <rect x={-6} y={-6} width={56} height={64} fill="#fff" stroke={color} strokeWidth={2} />
      <path d="M8 10 h28 M12 10 l3 30 h14 l3 -30 M18 6 h8" fill="none" stroke="#27272a" strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={16} cy={44} r={3} fill="#27272a" />
      <circle cx={29} cy={44} r={3} fill="#27272a" />
      <line x1={4} y1={2} x2={40} y2={48} stroke="#27272a" strokeWidth={3} />
      <line x1={40} y1={2} x2={4} y2={48} stroke="#27272a" strokeWidth={3} />
    </g>
  );
}
