'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModuleIcon } from '@/components/ui/module-icon';

/**
 * Rozgrzewka roku: dziecko dostaje surowe „gołe" zadania (bez rozwiązywania)
 * i przydziela każde do jednego z pięciu działów matematyki klasy 4. To nowa
 * mechanika w kursie — nigdzie wcześniej nie klasyfikuje się zadania po tym,
 * *którą gałęzią matematyki* jest, a nie po odpowiedzi. Zarazem to spis treści
 * tej lekcji: pięć pól rozgrzewki to pięć klastrów powtórki niżej.
 *
 * „Żaden klik nie jest złym kliknięciem": zły dział = drgnięcie pola + podpowiedź,
 * karta zostaje zaznaczona i można spróbować gdzie indziej. Bez blokad.
 */

export interface SorterDomain {
  id: string;
  label: string;
  icon: string;
}

interface SorterCard {
  id: string;
  label: string;
  domain: string;
}

/** Po dwie karty na dział — żeby było widać, że każdy dział ma kilka odmian zadań. */
const CARDS: SorterCard[] = [
  { id: 'kolejnosc', label: '2 + 3 · 4²', domain: 'liczby' },
  { id: 'rzymskie', label: 'MMXIV zapisane cyframi arabskimi', domain: 'rachunki' },
  { id: 'mieszana', label: '2 i 3/4 na ułamek niewłaściwy', domain: 'ulamki' },
  { id: 'kat', label: 'Kąt 145° — ostry czy rozwarty?', domain: 'geometria' },
  { id: 'objetosc', label: 'Objętość pudełka 2 cm × 3 cm × 5 cm', domain: 'miara' },
  { id: 'podzielnosc', label: 'Czy 4 725 dzieli się przez 9?', domain: 'liczby' },
  { id: 'dzielenie', label: '4 928 : 7 sposobem pisemnym', domain: 'rachunki' },
  { id: 'dziesietne', label: '3,7 + 0,45', domain: 'ulamki' },
  { id: 'obwod', label: 'Obwód prostokąta 8 cm × 5 cm', domain: 'geometria' },
  { id: 'polejednostki', label: 'Ile cm² to 3 dm²?', domain: 'miara' },
];

interface DomainSorterProps {
  domains: SorterDomain[];
  color: string;
  onComplete: () => void;
}

export function DomainSorter({ domains, color, onComplete }: DomainSorterProps) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const remaining = useMemo(() => CARDS.filter((card) => !(card.id in placed)), [placed]);
  const activeId = selected ?? remaining[0]?.id ?? null;
  const allPlaced = remaining.length === 0;

  useEffect(() => {
    if (allPlaced) onComplete();
  }, [allPlaced, onComplete]);

  const dropInto = (domainId: string) => {
    if (!activeId) return;
    const card = CARDS.find((item) => item.id === activeId);
    if (!card) return;

    if (card.domain === domainId) {
      setPlaced((prev) => ({ ...prev, [card.id]: domainId }));
      setSelected(null);
      setHint(null);
      return;
    }

    setShakeId(domainId);
    setHint('To zadanie należy do innego działu — spróbuj jeszcze raz.');
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Rozpoznaj, z którego działu jest każde zadanie.
      </p>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        Nie rozwiązuj ich teraz — tylko przydziel. Kliknij zadanie, potem kliknij dział. Te
        pięć działów to plan całej dzisiejszej powtórki.
      </p>

      {/* Karty do rozpoznania */}
      <div className="mb-5 min-h-[3rem]">
        {allPlaced ? (
          <div
            className="flex items-center gap-2 border-t-2 p-3 text-sm font-semibold"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <Check className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            Gotowe — to jest mapa Twojego roku. Teraz przejdź dział po dziale.
          </div>
        ) : (
          <>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Zostało do rozpoznania: {remaining.length}
            </p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {remaining.map((card) => {
                  const isActive = card.id === activeId;
                  return (
                    <motion.button
                      key={card.id}
                      layout
                      type="button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        setSelected(card.id);
                        setHint(null);
                      }}
                      className={cn(
                        'cursor-pointer border px-3 py-1.5 text-left text-xs font-medium transition-colors sm:text-sm',
                        isActive
                          ? 'text-white'
                          : 'bg-background hover:border-primary/50 hover:bg-muted/40'
                      )}
                      style={isActive ? { backgroundColor: color, borderColor: color } : undefined}
                    >
                      {card.label}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {hint && !allPlaced && (
        <p className="mb-3 text-xs font-semibold text-amber-600 dark:text-amber-400">{hint}</p>
      )}

      {/* Pięć działów */}
      <div className="grid gap-2 sm:grid-cols-2">
        {domains.map((domain) => {
          const cards = CARDS.filter((card) => placed[card.id] === domain.id);
          return (
            <motion.div
              key={domain.id}
              animate={shakeId === domain.id ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              onAnimationComplete={() => {
                if (shakeId === domain.id) setShakeId(null);
              }}
            >
              <button
                type="button"
                onClick={() => dropInto(domain.id)}
                disabled={allPlaced}
                className={cn(
                  'flex w-full flex-col gap-1.5 border p-3 text-left transition-colors',
                  !allPlaced && 'cursor-pointer hover:border-primary/50 hover:bg-muted/30'
                )}
              >
                <span className="flex items-center gap-2 text-sm font-bold">
                  <ModuleIcon name={domain.icon} className="h-4 w-4 shrink-0" style={{ color }} />
                  {domain.label}
                  <span className="ml-auto text-xs font-mono tabular-nums text-muted-foreground">
                    {cards.length}/2
                  </span>
                </span>
                {cards.length > 0 && (
                  <ul className="space-y-0.5">
                    {cards.map((card) => (
                      <li
                        key={card.id}
                        className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground"
                      >
                        <Check className="mt-0.5 h-3 w-3 shrink-0" style={{ color }} aria-hidden />
                        {card.label}
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
