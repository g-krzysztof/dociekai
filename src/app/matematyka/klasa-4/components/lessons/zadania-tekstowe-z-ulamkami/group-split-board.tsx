'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCcw, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { plural, type PluralForms } from '../../../lib/plural';

export interface SplitRound {
  id: string;
  /** Liczba przedmiotów w zbiorze — musi dzielić się przez `mianownik`. */
  total: number;
  mianownik: number;
  /** Ile grup opisuje odpowiedź na pytanie rundy. */
  selectGroups: number;
  story: string;
  question: string;
  /** Rzeczownik przedmiotu w trzech formach — liczby wchodzą wprost w zdanie, więc odmiana musi się zgadzać. */
  items: PluralForms;
  note: string;
}

interface GroupSplitBoardProps {
  color: string;
  rounds: SplitRound[];
  onComplete?: () => void;
}

/** Podział zbioru na segmenty wyznaczony przez przegrody — jedna funkcja karmi rysunek, sprawdzenie i klucz odpowiedzi. */
function buildSegments(total: number, dividers: Set<number>): number[][] {
  const segments: number[][] = [];
  let current: number[] = [];
  for (let i = 0; i < total; i++) {
    current.push(i);
    if (dividers.has(i) || i === total - 1) {
      segments.push(current);
      current = [];
    }
  }
  return segments;
}

/**
 * Ułamek liczony nie z kształtu, tylko ze ZBIORU: dziecko stawia przegrody
 * między przedmiotami, aż podzieli je na tyle równych grup, ile wynosi
 * mianownik, a potem zaznacza tyle grup, ile mówi licznik. Odpowiedź nie jest
 * nigdzie wpisywana — wynika z tego, ile przedmiotów wpadło do zaznaczonych
 * grup.
 *
 * Klika się w SZCZELINĘ między przedmiotami, nie w przedmiot — to pierwszy
 * widżet w kursie, w którym celem kliknięcia jest miejsce pomiędzy elementami.
 * Nierówny podział nie jest blokowany: przegrody wolno stawiać gdzie się chce,
 * a widżet mówi wprost, dlaczego taki podział nie odpowiada na pytanie (ta
 * sama zasada „odmowa jest treścią” co w `SplitFoldBoard`/`ShareOutTable`).
 *
 * Reużyty w dwóch narracjach tej lekcji: w rozgrzewce pytanie celuje wprost
 * w zaznaczone grupy, a w zadaniu problemowym — w resztę, więc dziecko musi
 * samo policzyć dopełnienie do całości.
 */
export function GroupSplitBoard({ color, rounds, onComplete }: GroupSplitBoardProps) {
  const [index, setIndex] = useState(0);
  const [dividers, setDividers] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const containerRef = useSectionScrollAnchor(`${index}-${checked}`);

  const round = rounds[index];
  const isLast = index === rounds.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const segments = buildSegments(round.total, dividers);
  const sizes = segments.map((segment) => segment.length);
  const allEqual = sizes.every((size) => size === sizes[0]);
  const rightCount = segments.length === round.mianownik;
  const ready = allEqual && rightCount;
  const perGroup = round.total / round.mianownik;
  const selectedItems = selected.size * perGroup;
  const answer = round.selectGroups * perGroup;

  const toggleDivider = (gap: number) => {
    if (checked) return;
    const nextDividers = new Set(dividers);
    if (nextDividers.has(gap)) nextDividers.delete(gap);
    else nextDividers.add(gap);
    setDividers(nextDividers);
    setSelected(new Set());
    setWrong(false);
  };

  const toggleGroup = (groupIndex: number) => {
    if (checked || !ready) return;
    const nextSelected = new Set(selected);
    if (nextSelected.has(groupIndex)) nextSelected.delete(groupIndex);
    else nextSelected.add(groupIndex);
    setSelected(nextSelected);
    setWrong(false);
  };

  const check = () => {
    if (selected.size === round.selectGroups) {
      setChecked(true);
      setWrong(false);
      return;
    }
    setWrong(true);
    setShakeKey((prev) => prev + 1);
  };

  const restart = () => {
    setDividers(new Set());
    setSelected(new Set());
    setWrong(false);
  };

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setDividers(new Set());
      setSelected(new Set());
      setChecked(false);
      setWrong(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {rounds.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{rounds.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={round.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          <p className="mb-2 text-sm leading-relaxed sm:text-base">{round.story}</p>
          <p className="mb-4 text-sm font-semibold leading-relaxed sm:text-base" style={{ color: textColor }}>
            {round.question}
          </p>

          <p className="mb-3 text-xs text-muted-foreground">
            {ready
              ? 'Podział gotowy. Kliknij te grupy, o które pyta zadanie.'
              : 'Kliknij szczelinę między przedmiotami, żeby postawić przegrodę. Przegrodę można zdjąć tym samym kliknięciem.'}
          </p>

          {/* Zbiór: dopóki podział nie jest gotowy — rząd przedmiotów z klikalnymi szczelinami;
              potem te same przedmioty zebrane w klikalne pudełka-grupy (nigdy oba naraz,
              żeby przycisk nie lądował w przycisku). */}
          <div className="flex flex-wrap items-center justify-center gap-1 border p-3" style={{ borderColor: `${color}33` }}>
            {!ready
              ? Array.from({ length: round.total }, (_, itemIndex) => (
                  <span key={itemIndex} className="flex items-center">
                    <motion.span
                      layout
                      className="h-6 w-6 border-2"
                      style={{ borderColor: color, backgroundColor: `${color}26` }}
                      aria-hidden
                    />
                    {itemIndex < round.total - 1 && (
                      <button
                        type="button"
                        onClick={() => toggleDivider(itemIndex)}
                        aria-pressed={dividers.has(itemIndex)}
                        aria-label={`Przegroda po przedmiocie numer ${itemIndex + 1}`}
                        className="mx-0.5 flex h-7 w-3 shrink-0 items-center justify-center"
                      >
                        <span
                          className="h-full w-1 transition-colors"
                          style={{ backgroundColor: dividers.has(itemIndex) ? color : `${color}1f` }}
                          aria-hidden
                        />
                      </button>
                    )}
                  </span>
                ))
              : segments.map((segment, groupIndex) => {
                  const isSelected = selected.has(groupIndex);
                  return (
                    <motion.button
                      layout
                      key={`group-${segment[0]}`}
                      type="button"
                      onClick={() => toggleGroup(groupIndex)}
                      disabled={checked}
                      aria-pressed={isSelected}
                      aria-label={`Grupa ${groupIndex + 1}: ${segment.length} ${plural(segment.length, round.items)}`}
                      className="flex flex-wrap items-center gap-1 border-2 p-1.5 transition-colors"
                      style={{
                        borderColor: isSelected ? color : `${color}44`,
                        backgroundColor: isSelected ? `${color}1f` : 'transparent',
                      }}
                    >
                      {segment.map((itemIndex) => (
                        <motion.span
                          layout
                          key={itemIndex}
                          className="h-6 w-6 border-2"
                          style={{ borderColor: color, backgroundColor: isSelected ? color : `${color}26` }}
                          aria-hidden
                        />
                      ))}
                    </motion.button>
                  );
                })}
          </div>

          {/* Sprzężenie zwrotne o podziale */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-2 font-semibold">
              <Scissors className="h-4 w-4" style={{ color }} aria-hidden />
              Grupy: <span className="font-mono tabular-nums">{segments.length}</span>
            </span>
            {!ready && (
              <span className="text-muted-foreground">
                {!allEqual
                  ? `Grupy nie są równe — największa ma ${Math.max(...sizes)}, najmniejsza ${Math.min(...sizes)}. Ułamek dzieli całość zawsze na RÓWNE części.`
                  : `Grupy są równe, ale potrzebujesz ich ${round.mianownik}, bo taki jest mianownik.`}
              </span>
            )}
            {ready && (
              <span className="text-muted-foreground">
                Po {perGroup} {plural(perGroup, round.items)} w każdej grupie. Zaznaczone: {selected.size}/
                {round.mianownik} grup = <strong>{selectedItems}</strong> {plural(selectedItems, round.items)}.
              </span>
            )}
          </div>

          {wrong && (
            <motion.p key={shakeKey} animate={{ x: [0, -6, 6, -4, 4, 0] }} transition={{ duration: 0.35 }} className="mt-3 text-sm text-rose-600">
              Tyle grup nie odpowiada na pytanie. Przeczytaj je jeszcze raz i zastanów się, ile z {round.mianownik} grup
              opisuje — nic się nie psuje, zaznacz inaczej.
            </motion.p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={restart} disabled={checked} className="gap-2">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Zacznij podział od nowa
            </Button>
            {ready && !checked && selected.size > 0 && (
              <Button onClick={check} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
                Sprawdź odpowiedź
              </Button>
            )}
            {checked && (
              <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
                {isLast ? 'Dalej' : 'Następne zadanie'}
              </Button>
            )}
          </div>

          {checked && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-start gap-3 bg-emerald-50 p-4 dark:bg-emerald-950/40">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              <div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  Odpowiedź: {answer} {plural(answer, round.items)}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">{round.note}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
