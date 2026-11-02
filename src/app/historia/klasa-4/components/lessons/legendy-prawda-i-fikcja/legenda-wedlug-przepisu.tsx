'use client';

import { useState } from 'react';
import { NotebookPen, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskShell, type ProofCriterion } from '@/components/block-lesson/task-shell';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import {
  LINES,
  getTile,
  judgeRecipe,
  legendText,
  placeName,
  type Scroll,
  type SlotId,
} from './przepis';

const CRITERIA: ProofCriterion[] = [
  { id: 'kamien', label: 'Na początku kamień — miejsce, które każdy może dziś zobaczyć.' },
  { id: 'bohater', label: 'Potem bohater — człowiek, który mógł tam żyć.' },
  { id: 'cud', label: 'Potem cud — coś, czego nikt nie sprawdzi.' },
  { id: 'koniec', label: 'Na końcu nazwa, która została do dziś — i wynika z twojej opowieści.' },
];

/** Kolejność kafelków w puli: przemieszane rodzaje, stała między renderami (bez hydracyjnych niespodzianek). */
const POOL_ORDER = [
  'diabel', 'dab', 'nikt', 'kasia', 'palac', 'imie-ptak', 'studnia', 'nazwa', 'imie-kasia', 'niedzwiedz',
  'chmura', 'rzeka', 'imie-diabel', 'kowal', 'kamien', 'szczesliwie', 'imie-niedzwiedz', 'ptak', 'gora',
  'imie-kowal', 'zamek',
];

const LINE_LABEL: Record<SlotId, string> = { l1: '1', l2: '2', l3: '3', l4: '4', imie: 'nazwa' };

/**
 * Blok 4 — **„Legenda według przepisu”** (zadanie).
 *
 * Gest nowy w kursie: **składa legendę z kafelków według przepisu z czterech
 * składników** — przeciąga (albo stuka kafelek i linijkę) na zwój; kafelek
 * w linijce stuknięty wraca do puli. Zakończenie „nazywają to miejsce…”
 * otwiera piątą przegródkę na imię. Sędzia `judgeRecipe` ocenia każdy
 * składnik z konkretem; nagrodą jest gotowa legenda dziecka z zaznaczonym
 * kamieniem i karta badacza „Legenda”.
 */
export function LegendaWedlugPrzepisu({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [scroll, setScroll] = useState<Scroll>({});
  const [picked, setPicked] = useState<string | null>(null);

  const used = new Set(Object.values(scroll));
  const pool = POOL_ORDER.filter((id) => !used.has(id) && getTile(id));
  const showNameSlot = scroll.l4 === 'nazwa';

  const put = (tileId: string, slot: SlotId) => {
    if (slot === 'imie' && !showNameSlot) return;
    setScroll((prev) => {
      const next: Scroll = { ...prev };
      for (const s of Object.keys(next) as SlotId[]) if (next[s] === tileId) delete next[s];
      next[slot] = tileId;
      if (slot === 'l4' && tileId !== 'nazwa') delete next.imie;
      return next;
    });
    setPicked(null);
  };

  const takeBack = (slot: SlotId) => {
    setScroll((prev) => {
      const next = { ...prev };
      delete next[slot];
      if (slot === 'l4') delete next.imie;
      return next;
    });
  };

  const { drag, hover, bind } = useDragToken({
    onTap: (id) => setPicked((p) => (p === id ? null : id)),
    onDrop: (id, target) => {
      if (target?.startsWith('zwoj-')) put(id, target.slice(5) as SlotId);
    },
  });
  const dragged = drag ? getTile(drag.id) : null;

  const slotView = (slot: SlotId) => {
    const tile = scroll[slot] ? getTile(scroll[slot]!) : undefined;
    const isName = slot === 'imie';
    return (
      <div
        key={slot}
        data-drop={`zwoj-${slot}`}
        role="button"
        tabIndex={0}
        aria-label={tile ? `Linijka ${LINE_LABEL[slot]}: ${tile.text}. Stuknij, żeby zdjąć.` : `Pusta linijka ${LINE_LABEL[slot]}`}
        onClick={() => (picked ? put(picked, slot) : tile && takeBack(slot))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (picked) put(picked, slot);
            else if (tile) takeBack(slot);
          }
        }}
        className={cn(
          'flex min-h-11 items-center gap-2 border-b border-dashed border-amber-900/40 px-1 py-1.5 text-left font-serif text-[15px] leading-snug',
          isName && 'ml-6 border-b-2',
          hover === `zwoj-${slot}` && 'bg-amber-200/60 dark:bg-amber-700/30',
          picked && !tile && 'bg-amber-100/60 dark:bg-amber-900/20'
        )}
      >
        <span className="w-10 shrink-0 font-mono text-[10px] text-muted-foreground">{LINE_LABEL[slot]}</span>
        {tile ? (
          <span>
            {tile.text}
            {slot === 'l4' && tile.kind === 'nazwa' && ' …'}
          </span>
        ) : (
          <span className="text-sm italic text-muted-foreground">{isName ? 'imię, od którego wzięła się nazwa' : '…'}</span>
        )}
      </div>
    );
  };

  return (
    <TaskShell
      color={color}
      brief={
        <>
          <p>
            Teraz ty jesteś opowiadaczem. Złóż legendę o miejscu ze swojego zwoju — <strong>według przepisu</strong>,
            który odkryłeś/aś przy smoku, Lechu i młynarzu Bartoszu.
          </p>
          <p className="mt-2 text-muted-foreground">
            Przeciągnij kafelek na linijkę zwoju albo stuknij kafelek, a potem linijkę. Kafelek w linijce stuknięty jeszcze
            raz wraca na stół. Nie każdy kafelek się przyda.
          </p>
        </>
      }
      criteria={CRITERIA}
      criteriaHeading="Przepis na legendę"
      workshop={
        <div className="space-y-4">
          <div className="border-2 border-amber-900/30 bg-[#fdf6e3] p-3 dark:bg-zinc-900" aria-label="Zwój">
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ScrollText className="h-3.5 w-3.5" aria-hidden /> Twoja legenda
            </p>
            {LINES.map((s) => slotView(s))}
            {showNameSlot && slotView('imie')}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Na stole</p>
            <div className="flex flex-wrap gap-1.5">
              {pool.map((id) => {
                const t = getTile(id)!;
                return (
                  <button
                    key={id}
                    type="button"
                    {...bind(id)}
                    aria-pressed={picked === id}
                    className={cn(
                      'max-w-full touch-none border bg-white px-2 py-1 text-left text-[13px] leading-snug dark:bg-zinc-900',
                      t.kind === 'imie' && 'font-semibold',
                      picked === id && 'ring-2'
                    )}
                    style={picked === id ? { borderColor: color, ['--tw-ring-color' as string]: color } : undefined}
                  >
                    {t.kind === 'imie' ? `„… ${t.text}”` : t.text}
                  </button>
                );
              })}
            </div>
          </div>

          <DragGhost drag={drag}>
            {dragged && <span className="block max-w-[260px] border bg-white px-2 py-1 text-[13px] dark:bg-zinc-900">{dragged.text}</span>}
          </DragGhost>
        </div>
      }
      canCheck={LINES.some((s) => scroll[s])}
      judge={() => {
        const v = judgeRecipe(scroll);
        return {
          verdicts: {
            kamien: v.kamien,
            bohater: v.bohater,
            cud: v.cud,
            koniec: v.koniec,
          },
          data: { ...scroll },
        };
      }}
      renderReport={(data: Scroll) => <TwojaLegenda scroll={data} color={color} />}
      acceptedText="Twoja legenda ma wszystko, co mają prawdziwe legendy: kamień, który można zobaczyć, bohatera, cud i nazwę, która została do dziś. Za sto lat ktoś mógłby szukać tego miejsca — i znalazłby tylko kamień."
      reward={<KartaBadacza color={color} />}
      onReset={() => {
        setScroll({});
        setPicked(null);
      }}
      onComplete={onComplete}
    />
  );
}

function TwojaLegenda({ scroll, color }: { scroll: Scroll; color: string }) {
  const name = placeName(scroll);
  const place = scroll.l1 ? getTile(scroll.l1) : undefined;
  const text = legendText(scroll);
  const stone = place?.kind === 'miejsce' ? place.text : null;
  return (
    <div className="space-y-1 text-sm">
      <p className="font-semibold">{name ? `Legenda o miejscu „${name}”` : 'Twoja legenda'}</p>
      <p className="font-serif text-[15px] leading-relaxed">
        {stone && text.startsWith(stone) ? (
          <>
            <span className="rounded-sm bg-emerald-200/80 px-0.5 dark:bg-emerald-700/60">{stone}</span>
            {text.slice(stone.length)}
          </>
        ) : (
          text || '…'
        )}
      </p>
      {stone && (
        <p className="text-xs text-muted-foreground">
          Na zielono — twój kamień. <span style={{ color }}>Wszystko inne płynie dookoła niego.</span>
        </p>
      )}
    </div>
  );
}

function KartaBadacza({ color }: { color: string }) {
  return (
    <div className="border-2 bg-[#fffaf0] p-4 text-sm dark:bg-zinc-900" style={{ borderColor: color }}>
      <p className="flex items-center gap-2 font-semibold">
        <NotebookPen className="h-4 w-4" style={{ color }} /> Karta badacza: legenda z mojej okolicy
      </p>
      <p className="mt-1 text-muted-foreground">Zapytaj w domu, w bibliotece albo w domu kultury:</p>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5">
        <li>Jaką legendę opowiada się w twojej miejscowości albo w okolicy?</li>
        <li>Co w niej możesz zobaczyć naprawdę — jaki kamień wystaje z rzeki? Kamień, góra, źródło, kościół, nazwa?</li>
        <li>Co w niej jest cudem, którego nikt nie sprawdzi?</li>
        <li>Czy legenda tłumaczy jakąś nazwę albo zwyczaj? Który?</li>
        <li>Czy ktoś ją kiedyś spisał? Kiedy? Może w starej książce o twojej okolicy jest inna wersja.</li>
      </ol>
    </div>
  );
}
