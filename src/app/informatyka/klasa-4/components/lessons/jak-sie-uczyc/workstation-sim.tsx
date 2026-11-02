'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Symulator stanowiska pracy: trzy suwaki, jeden rysunek, natychmiastowy werdykt.
 *
 * Nastawy są **niezależne od siebie** i taka jest też prawdziwa kolejność
 * ustawiania stanowiska: krzesło ustawia się raz (łokcie na wysokości blatu),
 * a potem dosuwa się podnóżek pod stopy, podnosi ekran do oczu i odsuwa go na
 * wyciągnięcie ręki. Dzięki temu poprawienie jednego suwaka nigdy nie psuje
 * dwóch pozostałych — dziecko dochodzi do trzech zielonych bez cofania się.
 *
 * Wszystkie współrzędne liczą się z trzech liczb przez zwykłe mnożenie
 * (`CM` px na centymetr), bez trygonometrii — rysunek jest identyczny po
 * stronie serwera i klienta.
 */

/** Pikseli na centymetr — jedyna skala rysunku. */
const CM = 1.6;
const FLOOR_Y = 277;
const DESK_Y = 162;
const EYE_Y = 96;
const EYE_X = 112;
/** Wysokość ekranu monitora (bez ramki i nóżki). */
const SCREEN_H = 44;
/** Kolano przy krześle ustawionym raz na dobrą wysokość — punkt stały rysunku. */
const KNEE = { x: 152, y: 201 };
/** Długość podudzia: stopa swobodnie zwisa 11 cm nad podłogą. */
const SHIN = 58;

const r = (value: number) => Math.round(value * 100) / 100;

interface Setting {
  id: 'distance' | 'screen' | 'footrest';
  label: string;
  min: number;
  max: number;
  /** Zielony zakres — obie granice włącznie. */
  good: [number, number];
  /** Opis bieżącej wartości, np. „62 cm”. */
  readout: (value: number) => string;
  verdict: (value: number) => string;
}

const SETTINGS: Setting[] = [
  {
    id: 'distance',
    label: 'Odległość ekranu od oczu',
    min: 30,
    max: 90,
    good: [50, 70],
    readout: (v) => `${v} cm`,
    verdict: (v) =>
      v < 50
        ? 'Za blisko. Oczy pracują jak przy czytaniu przez lupę i po kilkunastu minutach zaczynają szczypać.'
        : v > 70
          ? 'Za daleko. Za chwilę zaczniesz pochylać się do przodu, żeby cokolwiek odczytać — a wtedy wracają zgarbione plecy.'
          : 'Dobrze — mniej więcej na wyciągnięcie ręki. Wyciągnij rękę: palce powinny ledwo dotykać ekranu.',
  },
  {
    id: 'screen',
    label: 'Górna krawędź ekranu względem oczu',
    min: -12,
    max: 16,
    good: [-10, 0],
    readout: (v) =>
      v === 0 ? 'równo z oczami' : v > 0 ? `${v} cm powyżej oczu` : `${-v} cm poniżej oczu`,
    verdict: (v) =>
      v > 0
        ? 'Ekran za wysoko — zadzierasz głowę do góry i po kwadransie odzywa się kark.'
        : v < -10
          ? 'Ekran za nisko — patrzysz cały czas w dół, a głowa ciągnie szyję do przodu.'
          : 'Dobrze — górna krawędź ekranu na wysokości oczu albo odrobinę niżej. Wzrok pada wtedy lekko w dół, tak jak przy czytaniu książki.',
  },
  {
    id: 'footrest',
    label: 'Podnóżek pod stopami',
    min: 0,
    max: 20,
    good: [9, 13],
    readout: (v) => (v === 0 ? 'brak' : `${v} cm`),
    verdict: (v) =>
      v < 9
        ? 'Stopy nadal wiszą w powietrzu. Cały ciężar nóg ciągnie w dół i po chwili zaczynasz się zsuwać z krzesła.'
        : v > 13
          ? 'Za wysoko — kolana sterczą wyżej niż biodra, więc plecy same wyginają się w kabłąk.'
          : 'Dobrze — stopy stoją płasko, kolana zgięte mniej więcej pod kątem prostym. Podnóżkiem może być gruba książka albo pudełko.',
  },
];

const INITIAL: Record<Setting['id'], number> = { distance: 34, screen: 12, footrest: 0 };

const isGood = (setting: Setting, value: number) =>
  value >= setting.good[0] && value <= setting.good[1];

interface WorkstationSimProps {
  color: string;
  onComplete?: () => void;
}

export function WorkstationSim({ color, onComplete }: WorkstationSimProps) {
  const [values, setValues] = useState<Record<Setting['id'], number>>(INITIAL);
  const [solved, setSolved] = useState(false);

  const goodCount = SETTINGS.filter((setting) => isGood(setting, values[setting.id])).length;
  const allGood = goodCount === SETTINGS.length;

  const change = (id: Setting['id'], value: number) => {
    const next = { ...values, [id]: value };
    setValues(next);
    if (!solved && SETTINGS.every((setting) => isGood(setting, next[setting.id]))) {
      setSolved(true);
      onComplete?.();
    }
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Teraz to samo biurko, ale z trzema pokrętłami. <strong>Ustaw wszystkie trzy na zielono</strong> —
        rysunek zmienia się na żywo, a pod każdym suwakiem od razu widzisz, co ta nastawa robi z ciałem.
      </p>

      {/*
        Rysunek zostaje na ekranie, kiedy dziecko schodzi do suwaków. Bez tego cały
        blok mierzy na telefonie ~1400 px: przy trzecim suwaku scena była już poza
        widokiem i dziecko ustawiało podnóżek, nie widząc, co robi z sylwetką —
        czyli traciło dokładnie to, o co w tym widżecie chodzi. Powyżej `lg` jest
        dość miejsca, więc przyklejanie się wyłącza.
      */}
      <div className="sticky top-9 z-10 -mx-4 bg-white px-4 pb-2 dark:bg-zinc-900 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 dark:lg:bg-transparent">
        {/* Podpisy w rysunku (wymiar, „linia oczu”) robią się nieczytelne poniżej
            szerokości viewBoxa — na wąskim ekranie scena przewija się w poziomie. */}
        <div className="-mx-1 overflow-x-auto px-1">
          {/* Sufit szerokości: scena ma stałe proporcje 4:3, więc bez `max-w` rosła
              do 908 × 681 px na desktopie — przyklejona zajmowałaby wtedy 80%
              ekranu. Podłoga (`min-w`) chroni czytelność podpisów na wąskim. */}
          <div className="mx-auto min-w-[420px] max-w-[520px]">
            <WorkstationScene
              distance={values.distance}
              screen={values.screen}
              footrest={values.footrest}
              color={color}
              allGood={allGood}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {SETTINGS.map((setting) => {
          const value = values[setting.id];
          const ok = isGood(setting, value);
          return (
            <div key={setting.id}>
              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <label
                  htmlFor={`workstation-${setting.id}`}
                  className="text-sm font-semibold"
                >
                  {setting.label}
                </label>
                <span
                  className="font-mono text-sm font-bold tabular-nums"
                  style={{ color: ok ? '#16a34a' : color }}
                >
                  {setting.readout(value)}
                </span>
              </div>

              <input
                id={`workstation-${setting.id}`}
                type="range"
                min={setting.min}
                max={setting.max}
                step={1}
                value={value}
                onChange={(event) => change(setting.id, Number(event.target.value))}
                className="h-6 w-full cursor-pointer"
                style={{ accentColor: ok ? '#16a34a' : color }}
              />

              <p
                className={cn(
                  'mt-1 flex items-start gap-2 text-sm leading-relaxed',
                  ok ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {ok ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#16a34a' }} aria-hidden />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <span>{setting.verdict(value)}</span>
              </p>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {allGood && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Trzy na trzy.</strong> Zapamiętaj kolejność, bo za chwilę powtórzysz ją przy
            swoim biurku: najpierw stopy, potem wysokość ekranu, na końcu odległość. Ustawia się to
            raz, a działa codziennie.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Rysunek ──────────────────────────────────────────────────────────────
   Dziecko i biurko stoją w miejscu; z suwaków liczy się tylko pozycja
   monitora i podnóżka oraz wynikające z nich ułożenie nogi.                */

const PAPER = '#f8fafc';
const DESK = '#d8ab7a';
const SHIRT = '#0ea5e9';
const PANTS = '#475569';
const SKIN = '#f6cda6';
const HAIR = '#4b3621';
const DEVICE = '#334155';
const SCREEN = '#bfdbfe';

interface SceneProps {
  distance: number;
  screen: number;
  footrest: number;
  color: string;
  allGood: boolean;
}

function WorkstationScene({ distance, screen, footrest, color, allGood }: SceneProps) {
  /** Ekran: przód panelu tyle centymetrów przed okiem, góra względem linii oczu. */
  const screenX = r(EYE_X + distance * CM);
  const screenTopY = r(EYE_Y - screen * CM);
  const screenBottomY = r(screenTopY + SCREEN_H);
  /** Podpórka pod monitorem (książki) — od spodu monitora do blatu. */
  const riserH = r(Math.max(DESK_Y - screenBottomY, 0));
  /** Płyta podstawy monitora: pełne 5 jednostek, chyba że monitor stoi wprost na blacie. */
  const baseH = r(Math.min(5, Math.max(riserH, 2)));
  /** Kreski dzielące stos na kolejne książki — jedna co ok. 12 jednostek. */
  const bookCount = Math.max(1, Math.round((riserH - baseH) / 12));
  const bookLines = Array.from({ length: bookCount - 1 }, (_, i) =>
    r(screenBottomY + baseH + ((riserH - baseH) * (i + 1)) / bookCount)
  );

  /** Podnóżek i wynikające z niego ułożenie nogi. */
  const restTopY = r(FLOOR_Y - footrest * CM);
  const freeAnkleY = KNEE.y + SHIN;
  const supported = footrest > 0 && restTopY <= freeAnkleY;
  const lift = supported ? r(freeAnkleY - restTopY) : 0;
  const ankleY = supported ? restTopY : freeAnkleY;
  /** Za wysoki podnóżek wypycha kolano w górę — stąd sterczące kolana. */
  const kneeY = r(KNEE.y - lift * 0.8);

  return (
    <svg viewBox="0 0 400 300" className="block h-auto w-full" role="img"
      aria-label={`Rysunek stanowiska: ekran ${distance} centymetrów od oczu, górna krawędź ekranu ${screen} centymetrów względem linii oczu, podnóżek ${footrest} centymetrów`}>
      <rect width="400" height="300" fill={PAPER} />
      <rect y={FLOOR_Y} width="400" height={300 - FLOOR_Y} fill="#e2e8f0" />
      <line x1="0" y1={FLOOR_Y} x2="400" y2={FLOOR_Y} stroke="#cbd5e1" strokeWidth="2" />

      {/* Linia wzroku — stała oś odniesienia dla wysokości ekranu */}
      <line x1="90" y1={EYE_Y} x2="392" y2={EYE_Y} stroke="#94a3b8" strokeWidth="1" strokeDasharray="5 4" />
      <text x="392" y={EYE_Y - 5} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="ui-monospace, monospace">
        linia oczu
      </text>

      {/* Krzesło */}
      <rect x="34" y="130" width="9" height="76" rx="4" fill="#94a3b8" />
      <rect x="36" y="202" width="78" height="8" rx="3" fill="#94a3b8" />
      <line x1="52" y1="210" x2="52" y2={FLOOR_Y} stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
      <line x1="100" y1="210" x2="100" y2={FLOOR_Y} stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

      {/* Noga: udo do kolana, podudzie do kostki, stopa */}
      <path d={`M78 200 L${KNEE.x} ${kneeY}`} stroke={PANTS} strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d={`M${KNEE.x} ${kneeY} L${KNEE.x + 4} ${ankleY}`} stroke={PANTS} strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d={`M${KNEE.x} ${ankleY + 1} L${KNEE.x + 22} ${ankleY + 3}`} stroke="#1e293b" strokeWidth="9" strokeLinecap="round" fill="none" />

      {/* Podnóżek */}
      {footrest > 0 && (
        <g>
          <rect x={KNEE.x - 12} y={restTopY} width="52" height={r(FLOOR_Y - restTopY)} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1={KNEE.x - 12} y1={r(restTopY + (FLOOR_Y - restTopY) / 2)} x2={KNEE.x + 40} y2={r(restTopY + (FLOOR_Y - restTopY) / 2)} stroke="#94a3b8" strokeWidth="1" />
        </g>
      )}

      {/* Wyprostowany tułów, ramię wsparte na blacie, głowa nad ramionami */}
      <path d="M78 198 L92 130" stroke={SHIRT} strokeWidth="18" strokeLinecap="round" fill="none" />
      <path d="M92 134 L104 158 L138 156" stroke={SHIRT} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="141" cy="156" r="5" fill={SKIN} />
      <path d="M93 128 L98 116" stroke={SKIN} strokeWidth="11" strokeLinecap="round" fill="none" />
      <circle cx="101" cy="100" r="17" fill={SKIN} />
      <path d="M84 98 a17 17 0 0 1 34 -3 q-9 -8 -20 -5 q-11 3 -14 8 z" fill={HAIR} />
      <circle cx={EYE_X} cy={EYE_Y} r="1.9" fill="#1e293b" />

      {/* Biurko — krawędź blisko dziecka, żeby klawiatura miała miejsce przed monitorem */}
      <rect x="118" y={DESK_Y} width="276" height="9" rx="1" fill={DESK} />
      <line x1="118" y1={DESK_Y + 9} x2="394" y2={DESK_Y + 9} stroke="#a8794b" strokeWidth="2" />
      <rect x="376" y={DESK_Y + 9} width="9" height={r(FLOOR_Y - DESK_Y - 9)} fill="#a8794b" />

      {/* Klawiatura pod dłonią */}
      <rect x="124" y={DESK_Y - 6} width="34" height="6" rx="2" fill={DEVICE} />

      {/* Monitor: stos książek, płyta podstawy i cienki panel widziany z boku */}
      {riserH > baseH && (
        <g>
          <rect x={r(screenX - 7)} y={r(screenBottomY + baseH)} width="30" height={r(riserH - baseH)}
            fill="#e7c8a0" stroke="#a8794b" strokeWidth="1.5" />
          {bookLines.map((y) => (
            <line key={y} x1={r(screenX - 7)} y1={y} x2={r(screenX + 23)} y2={y} stroke="#a8794b" strokeWidth="1" />
          ))}
        </g>
      )}
      <rect x={r(screenX - 9)} y={screenBottomY} width="34" height={baseH} rx="1" fill={DEVICE} />
      <rect x={screenX} y={screenTopY} width="12" height={SCREEN_H} rx="2" fill={DEVICE} />
      <rect x={r(screenX + 1)} y={r(screenTopY + 3)} width="4" height={r(SCREEN_H - 6)} rx="1" fill={SCREEN} />

      {/* Odległość oko–ekran */}
      <line x1={r(EYE_X + 18)} y1="66" x2={screenX} y2="66" stroke={allGood ? '#16a34a' : color} strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1={r(EYE_X + 18)} y1="61" x2={r(EYE_X + 18)} y2="71" stroke={allGood ? '#16a34a' : color} strokeWidth="1.5" />
      <line x1={screenX} y1="61" x2={screenX} y2="71" stroke={allGood ? '#16a34a' : color} strokeWidth="1.5" />
      <text x={r((EYE_X + 18 + screenX) / 2)} y="58" textAnchor="middle" fontSize="11"
        fill={allGood ? '#16a34a' : color} fontFamily="ui-monospace, monospace">
        {distance} cm
      </text>

      {/* Znacznik górnej krawędzi ekranu względem linii oczu */}
      <line x1={r(screenX - 6)} y1={screenTopY} x2={r(screenX + 18)} y2={screenTopY}
        stroke={screen <= 0 && screen >= -10 ? '#16a34a' : color} strokeWidth="2" />
    </svg>
  );
}
