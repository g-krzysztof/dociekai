'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UnitSorterRung {
  code: string;
  label: string;
}

export interface SortableItem {
  id: string;
  label: string;
  unitCode: string;
  /** Odsłaniane dopiero po trafieniu do właściwego słupka, np. „≈ 5 mm". */
  detail: string;
}

export interface UnitSorterProps {
  units: readonly UnitSorterRung[];
  items: SortableItem[];
  color: string;
  onComplete?: () => void;
}

/**
 * Flagowy widget lekcji i pierwszy w kursie oparty o przeciąganie obiektu na
 * strefę docelową — inny mechanizm niż ciągły suwak `<ArrayGrid>` (dzielnik
 * linii) czy `<PowerDial>` (przyciąganie do najbliższego karbu). Trafienie
 * sprawdzane jest przez `document.elementFromPoint` w momencie puszczenia
 * wskaźnika, nie przez śledzenie prostokątów każdego słupka. Każdy przedmiot
 * jest też zwykłym przyciskiem — kliknij przedmiot, potem kliknij słupek —
 * więc przeciąganie jest wygodą, nie jedynym sposobem obsługi, ta sama
 * zasada co karby `<PowerDial>`. Złe trafienie nigdy nie blokuje: przedmiot
 * wraca do tacy, można próbować od razu ponownie (`attemptPlace` czyta stan
 * z domknięcia i wywołuje `onComplete` jako zwykłą instrukcję, nigdy z
 * wnętrza aktualizatora `setState` — ta sama pułapka, co przy `Set`-owych
 * licznikach w tym module, tu ominięta od początku).
 */
export function UnitSorter({ units, items, color, onComplete }: UnitSorterProps) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const completedRef = useRef(false);
  const hintTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const remaining = items.filter((item) => !placed[item.id]);
  const draggingItem = items.find((item) => item.id === draggingId);

  const attemptPlace = (itemId: string, unitCode: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || placed[itemId]) return;

    if (item.unitCode === unitCode) {
      const next = { ...placed, [itemId]: unitCode };
      setPlaced(next);
      if (Object.keys(next).length === items.length && !completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    } else {
      setShakeId(itemId);
      setHint(`„${item.label}" to raczej nie ta jednostka — spróbuj jeszcze raz.`);
      window.clearTimeout(hintTimeout.current);
      hintTimeout.current = setTimeout(() => setHint(null), 1800);
      window.setTimeout(() => setShakeId((prev) => (prev === itemId ? null : prev)), 420);
    }
  };

  const startDrag = (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setSelectedId(null);
    setDraggingId(itemId);
    setDragPos({ x: event.clientX, y: event.clientY });
  };

  const handleMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingId) return;
    setDragPos({ x: event.clientX, y: event.clientY });
  };

  const handleUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingId) return;
    const dropTarget = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-unit-rung]');
    if (dropTarget?.dataset.unitRung) attemptPlace(draggingId, dropTarget.dataset.unitRung);
    setDraggingId(null);
  };

  const pickItem = (itemId: string) => setSelectedId((prev) => (prev === itemId ? null : itemId));

  const pickRung = (unitCode: string) => {
    if (!selectedId) return;
    attemptPlace(selectedId, unitCode);
    setSelectedId(null);
  };

  return (
    <div
      className="space-y-4"
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={() => setDraggingId(null)}
    >
      {/* Drabinka jednostek — strefy docelowe. Liczba kolumn wynika z `units.length`
          (nie zawsze 5 — np. długość bez dm tutaj, a przyszła masa g/dag/kg/t
          ma naturalnie 4), więc siatka jest budowana przez inline `style`,
          nie sztywną klasą `grid-cols-*`. */}
      <div
        className="grid gap-1 sm:gap-1.5"
        style={{ gridTemplateColumns: `repeat(${units.length}, minmax(0, 1fr))` }}
      >
        {units.map((unit) => {
          const docked = items.filter((item) => placed[item.id] === unit.code);
          const dropHint = selectedId !== null;
          return (
            <button
              key={unit.code}
              type="button"
              data-unit-rung={unit.code}
              onClick={() => pickRung(unit.code)}
              className={cn(
                'flex min-h-[108px] flex-col items-center gap-1.5 border-2 border-dashed p-1.5 pt-2.5 text-center transition-colors sm:min-h-[130px] sm:p-2',
                dropHint ? 'cursor-pointer' : 'cursor-default'
              )}
              style={{
                borderColor: dropHint ? color : `${color}40`,
                backgroundColor: dropHint ? `${color}14` : `${color}08`,
              }}
            >
              <span
                className="font-mono text-base font-bold tabular-nums sm:text-lg"
                style={{ color }}
              >
                {unit.code}
              </span>
              <span className="hidden text-[10px] leading-tight text-muted-foreground sm:block">
                {unit.label}
              </span>
              <div className="flex flex-1 flex-col flex-wrap items-center justify-center gap-1 pt-1">
                <AnimatePresence>
                  {docked.map((item) => (
                    <motion.span
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.5, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                      className="inline-flex items-center gap-1 border bg-white px-1.5 py-0.5 text-[10px] font-medium leading-tight dark:bg-zinc-900/80 sm:text-xs"
                      style={{ borderColor: color }}
                    >
                      <Check className="h-3 w-3 shrink-0" style={{ color }} aria-hidden />
                      {item.detail}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </button>
          );
        })}
      </div>

      {/* Taca z przedmiotami do rozłożenia */}
      <div
        className="min-h-16 border-t-2 p-4"
        style={{ borderColor: `${color}59`, backgroundColor: `${color}0a` }}
      >
        {remaining.length === 0 ? (
          <p className="text-center text-sm font-semibold" style={{ color }}>
            Wszystko rozłożone! 🎉
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {remaining.map((item) => (
              <motion.button
                key={item.id}
                type="button"
                onPointerDown={(event) => startDrag(event, item.id)}
                onClick={() => pickItem(item.id)}
                animate={shakeId === item.id ? { x: [0, -8, 8, -8, 6, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  touchAction: 'none',
                  borderColor: selectedId === item.id ? color : `${color}59`,
                  backgroundColor: selectedId === item.id ? `${color}1f` : undefined,
                }}
                className={cn(
                  'inline-flex cursor-grab items-center gap-1.5 border-2 px-3 py-2 text-sm font-medium leading-tight shadow-sm active:cursor-grabbing',
                  selectedId === item.id ? '' : 'bg-white dark:bg-zinc-900/80'
                )}
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                {item.label}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <p className="min-h-5 text-center text-xs text-muted-foreground">
        {hint ??
          (selectedId
            ? 'Kliknij słupek, do którego pasuje wybrany przedmiot.'
            : 'Przeciągnij przedmiot na słupek — albo kliknij go, a potem kliknij słupek.')}
      </p>

      {/* Duch przeciąganego przedmiotu, podąża za wskaźnikiem */}
      {draggingItem && (
        <div
          className="pointer-events-none fixed z-50 inline-flex items-center gap-1.5 border-2 bg-white px-3 py-2 text-sm font-medium shadow-lg dark:bg-zinc-900/80"
          style={{
            left: dragPos.x,
            top: dragPos.y,
            transform: 'translate(-50%, -50%)',
            borderColor: color,
          }}
        >
          {draggingItem.label}
        </div>
      )}
    </div>
  );
}
