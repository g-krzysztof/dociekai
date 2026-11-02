'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Haczyk lekcji: dziecko szuka błędów na cudzym stanowisku pracy, zanim
 * ktokolwiek powie mu, jak powinno być. Zasady BHP wychodzą z obserwacji,
 * nie z listy do przeczytania.
 *
 * Wzorzec „audytu” z kursu matematyki (`ListingAudit`): kliknięcie miejsca
 * **zdrowego** też coś daje — tłumaczy, dlaczego akurat tam jest dobrze — więc
 * każde sprawdzenie uczy, a nie tylko trafienie. Pudło nie blokuje niczego;
 * po trzech nietrafionych kliknięciach pojawia się przycisk podpowiedzi.
 */

interface Spot {
  id: string;
  /** `true` = to jest błąd do znalezienia; `false` = miejsce zrobione dobrze. */
  isError: boolean;
  /** Pozycja w % szerokości/wysokości sceny. */
  x: number;
  y: number;
  label: string;
  /** Co dziecko widzi na rysunku. */
  finding: string;
  /** Jak powinno być. */
  fix: string;
}

const SPOTS: Spot[] = [
  {
    id: 'ekran',
    isError: true,
    x: 68.6,
    y: 38.6,
    label: 'Ekran',
    finding: 'Ekran stoi jakieś 25 cm od twarzy — prawie przy nosie.',
    fix: 'Monitor ustaw na wyciągnięcie ręki: 50–70 cm od oczu. Wyciągnij rękę — palce powinny ledwo dotykać ekranu.',
  },
  {
    id: 'plecy',
    isError: true,
    x: 32.5,
    y: 53,
    label: 'Plecy',
    finding: 'Plecy są wygięte w kabłąk, głowa wystaje daleko przed ramiona.',
    fix: 'Usiądź głęboko na krześle i oprzyj plecy o oparcie. Głowa ma stać nad ramionami, nie przed nimi — inaczej kark dźwiga ją jak ciężarek na wędce.',
  },
  {
    id: 'stopy',
    isError: true,
    x: 40.9,
    y: 81.4,
    label: 'Stopy',
    finding: 'Stopy dyndają w powietrzu — nie dosięgają podłogi.',
    fix: 'Obniż krzesło albo podstaw podnóżek (wystarczy gruba książka lub pudełko), żeby stopy stały płasko, a kolana były zgięte mniej więcej pod kątem prostym.',
  },
  {
    id: 'lampa',
    isError: true,
    x: 88.2,
    y: 38.6,
    label: 'Lampa',
    finding: 'Lampa świeci prosto w ekran i robi na nim jasną plamę.',
    fix: 'Ustaw lampę z boku, tak żeby oświetlała biurko, a nie ekran. Światło skierowane w monitor daje odblaski i zmusza oczy do mrużenia.',
  },
  {
    id: 'napoj',
    isError: true,
    x: 81.4,
    y: 53.4,
    label: 'Napój',
    finding: 'Otwarty kubek stoi na biurku tuż obok klawiatury.',
    fix: 'Napoje trzymaj poza biurkiem z klawiaturą — na osobnym stoliku albo na parapecie. Rozlany sok potrafi skończyć żywot klawiatury w kilka sekund.',
  },
  {
    id: 'oparcie',
    isError: false,
    x: 13.6,
    y: 54.5,
    label: 'Krzesło',
    finding: 'To akurat jest dobry wybór.',
    fix: 'Krzesło ma oparcie sięgające pleców — dokładnie takie jest potrzebne. Szkoda tylko, że nikt z niego tu nie korzysta.',
  },
  {
    id: 'klawiatura',
    isError: false,
    x: 56.8,
    y: 56.2,
    label: 'Klawiatura',
    finding: 'Tu jest w porządku.',
    fix: 'Klawiatura leży płasko na blacie, blisko krawędzi — dłonie i nadgarstki mają na czym leżeć, a łokcie zostają blisko ciała.',
  },
  {
    id: 'blat',
    isError: false,
    x: 45.5,
    y: 59.3,
    label: 'Blat',
    finding: 'Tu też jest w porządku.',
    fix: 'Blat jest na dobrej wysokości: gdy dłonie leżą na klawiaturze, łokcie są zgięte mniej więcej pod kątem prostym.',
  },
];

const ERRORS = SPOTS.filter((spot) => spot.isError);

interface DeskAuditProps {
  color: string;
  onComplete?: () => void;
}

export function DeskAudit({ color, onComplete }: DeskAuditProps) {
  const [checked, setChecked] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [nudge, setNudge] = useState<{ id: number; x: number; y: number } | null>(null);
  const [hinted, setHinted] = useState<string | null>(null);

  const foundErrors = checked.filter((id) => SPOTS.find((spot) => spot.id === id)?.isError);
  const finished = foundErrors.length === ERRORS.length;

  const inspect = (spot: Spot) => {
    if (checked.includes(spot.id)) return;
    const next = [...checked, spot.id];
    setChecked(next);
    setHinted(null);
    const found = next.filter((id) => SPOTS.find((item) => item.id === id)?.isError);
    if (found.length === ERRORS.length) onComplete?.();
  };

  /** Pudło: krótki znacznik „tu nic nie ma” w miejscu kliknięcia, bez blokady. */
  const miss = (event: React.MouseEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setMisses((prev) => prev + 1);
    setNudge({
      id: Date.now(),
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    });
  };

  const revealHint = () => {
    const remaining = ERRORS.find((spot) => !checked.includes(spot.id));
    if (remaining) setHinted(remaining.id);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="flex items-start gap-2 text-sm leading-relaxed sm:text-base">
          <Search className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          <span>
            Antek siedzi tak codziennie. <strong>Klikaj w miejsca, które twoim zdaniem są
            zrobione źle</strong> — pięć z nich zaszkodzi mu po godzinie, a trzech innych rzeczy
            nie ma co ruszać.
          </span>
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {foundErrors.length}/{ERRORS.length}
        </p>
      </div>

      {/*
        Poniżej ~440 px cele hotspotów zaczęłyby na siebie nachodzić, więc scena nie
        skaluje się w dół — na wąskim ekranie przewija się w poziomie.

        **Sufit szerokości jest równie ważny jak podłoga.** Scena ma stałe proporcje
        (~3:2), więc bez `max-w` rosła razem z kolumną: 440 × 290 px na telefonie, ale
        908 × 599 px na desktopie — i wtedy wyjaśnienie klikniętego miejsca wypadało
        poniżej krawędzi ekranu na każdym niższym oknie (1280 × 720, 1440 × 820).
        Dziecko klikało błąd przy biurku i nie widziało, co mu odpowiedziano.
      */}
      <div className="-mx-1 overflow-x-auto px-1">
      <div className="relative mx-auto min-w-[440px] max-w-[560px] select-none">
        {/* Tło łapiące pudła — leży pod przyciskami miejsc, sam nie jest celem nawigacji. */}
        <button
          type="button"
          onClick={miss}
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 z-0 cursor-crosshair"
        />

        <DeskScene />

        {SPOTS.map((spot) => {
          const isChecked = checked.includes(spot.id);
          return (
            <button
              key={spot.id}
              type="button"
              onClick={() => inspect(spot)}
              aria-label={`Sprawdź to miejsce przy biurku (${spot.label})`}
              aria-pressed={isChecked}
              className={cn(
                'absolute z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 transition-all sm:h-11 sm:w-11',
                isChecked
                  ? 'border-solid'
                  : 'border-transparent hover:border-dashed hover:border-current focus-visible:border-dashed',
                !isChecked && hinted === spot.id && 'animate-pulse border-dashed border-current'
              )}
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                ...(isChecked
                  ? {
                      borderColor: spot.isError ? color : '#16a34a',
                      backgroundColor: spot.isError ? `${color}26` : '#16a34a20',
                    }
                  : { color }),
              }}
            >
              {isChecked &&
                (spot.isError ? (
                  <span
                    className="font-mono text-base font-bold leading-none"
                    style={{ color }}
                  >
                    {ERRORS.findIndex((item) => item.id === spot.id) + 1}
                  </span>
                ) : (
                  <Check className="h-5 w-5" style={{ color: '#16a34a' }} aria-hidden />
                ))}
            </button>
          );
        })}

        <AnimatePresence>
          {nudge && (
            <motion.span
              key={nudge.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onAnimationComplete={() => setNudge(null)}
              transition={{ duration: 0.25 }}
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border bg-background px-2 py-1 text-xs font-medium text-muted-foreground"
              style={{ left: `${nudge.x}%`, top: `${nudge.y}%` }}
            >
              Tu nic nie ma — szukaj dalej
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      </div>

      {misses >= 3 && !finished && (
        <button
          type="button"
          onClick={revealHint}
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <Eye className="h-4 w-4" aria-hidden />
          Nie widzę kolejnego — mrugnij mi tym miejscem
        </button>
      )}

      <div className="mt-5 space-y-3">
        {checked.map((id) => {
          const spot = SPOTS.find((item) => item.id === id);
          if (!spot) return null;
          const number = ERRORS.findIndex((item) => item.id === spot.id) + 1;
          return (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 border-l-2 pl-3"
              style={{ borderColor: spot.isError ? color : '#16a34a' }}
            >
              <span
                className="mt-0.5 w-5 shrink-0 font-mono text-sm font-bold tabular-nums"
                style={{ color: spot.isError ? color : '#16a34a' }}
              >
                {spot.isError ? number : <Check className="h-4 w-4" aria-hidden />}
              </span>
              <p className="text-sm leading-relaxed">
                <strong>{spot.finding}</strong> {spot.fix}
              </p>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Masz wszystkie pięć.</strong> Żaden z tych błędów nie boli od razu — dlatego tak
            łatwo je przeoczyć. Ból głowy, pieczenie oczu i kark odzywają się dopiero po godzinie.
            Teraz ustawisz to u siebie.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Rysunek sceny ────────────────────────────────────────────────────────
   Widok z boku: dziecko po lewej, biurko po prawej. Wszystkie współrzędne są
   stałe — scena niczego nie animuje, cała interakcja siedzi w przyciskach
   nałożonych na nią w procentach szerokości/wysokości.                     */

const PAPER = '#f8fafc';
const FLOOR = '#e2e8f0';
const DESK = '#d8ab7a';
const DESK_EDGE = '#a8794b';
const CHAIR = '#94a3b8';
const SHIRT = '#f59e0b';
const PANTS = '#475569';
const SKIN = '#f6cda6';
const HAIR = '#6b4423';
const DEVICE = '#334155';
const SCREEN = '#bfdbfe';

function DeskScene() {
  return (
    <svg viewBox="0 0 440 290" className="block h-auto w-full" role="img"
      aria-label="Rysunek: dziecko siedzi zgarbione przy biurku, z nosem przy ekranie, stopami w powietrzu, lampą świecącą w monitor i kubkiem obok klawiatury">
      <defs>
        <clipPath id="desk-audit-hair">
          <rect x="199" y="101" width="40" height="14" />
        </clipPath>
      </defs>

      <rect width="440" height="290" fill={PAPER} />
      <rect y="258" width="440" height="32" fill={FLOOR} />
      <line x1="0" y1="258" x2="440" y2="258" stroke="#cbd5e1" strokeWidth="2" />

      {/* Krzesło */}
      <rect x="56" y="126" width="9" height="68" rx="4" fill={CHAIR} />
      <rect x="58" y="190" width="82" height="8" rx="3" fill={CHAIR} />
      <line x1="72" y1="198" x2="72" y2="258" stroke={CHAIR} strokeWidth="6" strokeLinecap="round" />
      <line x1="126" y1="198" x2="126" y2="258" stroke={CHAIR} strokeWidth="6" strokeLinecap="round" />

      {/* Nogi */}
      <path d="M113 190 L172 194" stroke={PANTS} strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M172 194 L178 232" stroke={PANTS} strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M176 233 L196 235" stroke="#1e293b" strokeWidth="9" strokeLinecap="round" fill="none" />

      {/* Zgarbiony tułów i ramię na klawiaturze */}
      <path d="M113 188 Q127 143 192 138" stroke={SHIRT} strokeWidth="17" strokeLinecap="round" fill="none" />
      <path d="M192 142 L200 166 L224 162" stroke={SHIRT} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="226" cy="161" r="5" fill={SKIN} />

      {/* Szyja i głowa wysunięta przed ramiona */}
      <path d="M194 136 L206 127" stroke={SKIN} strokeWidth="11" strokeLinecap="round" fill="none" />
      <circle cx="218" cy="120" r="17" fill={SKIN} />
      <circle cx="218" cy="120" r="17" fill={HAIR} clipPath="url(#desk-audit-hair)" />
      <path d="M201 114 Q196 124 200 130" stroke={HAIR} strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="228" cy="120" r="1.8" fill="#1e293b" />

      {/* Biurko */}
      <rect x="178" y="168" width="252" height="9" rx="1" fill={DESK} />
      <line x1="178" y1="177" x2="430" y2="177" stroke={DESK_EDGE} strokeWidth="2" />
      <rect x="412" y="177" width="9" height="81" fill={DESK_EDGE} />

      {/* Klawiatura */}
      <rect x="222" y="161" width="60" height="7" rx="2" fill={DEVICE} />
      {[228, 238, 248, 258, 268].map((x) => (
        <line key={x} x1={x} y1="163" x2={x} y2="166" stroke="#64748b" strokeWidth="2" />
      ))}

      {/* Monitor — z boku to cienki panel; ekran świeci w stronę dziecka */}
      <rect x="288" y="163" width="46" height="6" rx="2" fill={DEVICE} />
      <rect x="303" y="140" width="7" height="24" fill={DEVICE} />
      <g transform="rotate(-6 306 141)">
        <rect x="300" y="92" width="12" height="50" rx="2" fill={DEVICE} />
        <rect x="301" y="95" width="4" height="44" rx="1" fill={SCREEN} />
      </g>

      {/* Odległość oko–ekran */}
      <line x1="239" y1="84" x2="294" y2="84" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="239" y1="79" x2="239" y2="89" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="294" y1="79" x2="294" y2="89" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="239" y1="89" x2="235" y2="106" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="294" y1="89" x2="299" y2="96" stroke="#cbd5e1" strokeWidth="1" />
      <text x="266" y="76" textAnchor="middle" fontSize="11" fill="#64748b" fontFamily="ui-monospace, monospace">
        ok. 25 cm
      </text>

      {/* Kubek z napojem tuż przy klawiaturze */}
      <rect x="348" y="147" width="20" height="21" rx="2" fill="#ef4444" />
      <rect x="349" y="147" width="18" height="4" rx="1" fill="#fca5a5" />
      <path d="M368 152 q7 5 0 10" stroke="#ef4444" strokeWidth="3" fill="none" />

      {/* Lampa świecąca prosto w ekran */}
      <rect x="386" y="162" width="26" height="6" rx="2" fill="#0e7490" />
      <path d="M399 162 L399 118 L378 106" stroke="#0e7490" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M370 98 L386 108 L374 116 Z" fill="#0891b2" />
      {[98, 105, 112].map((y) => (
        <line key={y} x1="366" y1={y} x2="311" y2={y - 2} stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 4" opacity="0.85" />
      ))}
      <path d="M300 100 l4 4 l4 -4 l-4 8 z" fill="#fde68a" />
      <circle cx="303" cy="104" r="6" fill="#fef3c7" opacity="0.8" />
    </svg>
  );
}
