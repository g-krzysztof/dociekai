'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FractionBarGlyph } from '../../fraction-bar-glyph';
import { MiniFraction } from '../../mini-fraction';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { toMixed, formatMixed } from '../../../lib/mixed-number';
import { plural } from '../../../lib/plural';

export interface Ingredient {
  id: string;
  name: string;
  licznik: number;
  mianownik: number;
  /** Jednostka jednej porcji, np. „szklanki”, „łyżki”. */
  unit: string;
  /** Nazwa jednej części w dopełniaczu liczby mnogiej — „ćwiartek”, „ósmych części”. */
  pieceName: string;
  /** Nazwa składnika w dopełniaczu — „mąki”, „mleka” — żeby pytanie brzmiało po polsku. */
  genitive: string;
}

export interface ScalerRound {
  id: string;
  /** Na ile porcji trzeba ustawić pokrętło, zanim da się odpowiedzieć. */
  servings: number;
  /** Który składnik odczytujemy w tej rundzie. */
  askId: string;
  story: string;
  note: string;
}

interface RecipeScalerProps {
  color: string;
  ingredients: Ingredient[];
  rounds: ScalerRound[];
  /** Wartości dostępne na pokrętle — świadomie dyskretne, nie suwak. */
  servingOptions: number[];
  onComplete?: () => void;
}

function fill(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(',', '.');
}

/** Liczba porcji trafia wprost do zdania („na 2 porcje”, „na 5 porcji”), więc odmienia się w bierniku. */
const SERVING_FORMS = { one: 'porcję', few: 'porcje', many: 'porcji' };

/**
 * Jedno pokrętło, kilka niezależnych ułamków. Wszystkie widżety kursu do tej
 * pory sterowały jedną wielkością naraz — tutaj zmiana liczby porcji
 * przelicza cały przepis jednocześnie, a każdy składnik ma własny mianownik
 * i własny wynik. Dziecko musi odczytać jeden z nich, więc nie da się
 * „przeklikać” zadania patrząc tylko na to, co się rusza.
 *
 * Odpowiadanie jest zablokowane, dopóki pokrętło nie stoi na liczbie porcji
 * z treści — ustawienie przepisu na właściwą liczbę osób jest tu częścią
 * zadania, nie czynnością przygotowawczą.
 */
export function RecipeScaler({ color, ingredients, rounds, servingOptions, onComplete }: RecipeScalerProps) {
  const [index, setIndex] = useState(0);
  const [servings, setServings] = useState(servingOptions[0]);
  const [value, setValue] = useState('');
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const containerRef = useSectionScrollAnchor(`${index}-${solved}`);

  const round = rounds[index];
  const isLast = index === rounds.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const asked = ingredients.find((item) => item.id === round.askId) ?? ingredients[0];
  const ready = servings === round.servings;
  const answer = String(asked.licznik * round.servings);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (solved) return;
    if (normalize(value) === normalize(answer)) {
      setSolved(true);
      setWrong(false);
      return;
    }
    setWrong(true);
    setShakeKey((prev) => prev + 1);
  };

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setValue('');
      setSolved(false);
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
          <div className="mb-4 flex items-start gap-3">
            <ChefHat className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            <p className="text-sm leading-relaxed sm:text-base">{round.story}</p>
          </div>

          {/* Pokrętło porcji — jedno, wspólne dla całego przepisu */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
              Liczba porcji
            </p>
            <div className="flex flex-wrap gap-2">
              {servingOptions.map((option) => {
                const active = option === servings;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setServings(option)}
                    aria-pressed={active}
                    className={cn(
                      'min-w-[3rem] border px-4 py-2 font-mono text-base font-bold tabular-nums transition-all',
                      !active && 'hover:-translate-y-0.5'
                    )}
                    style={
                      active
                        ? { backgroundColor: color, borderColor: color, color: 'white' }
                        : { borderColor: `${color}55`, color: textColor }
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Przepis — wszystkie składniki przeliczają się naraz */}
          <ul className="divide-y border">
            {ingredients.map((item) => {
              const total = item.licznik * servings;
              const mixed = toMixed(total, item.mianownik);
              const highlighted = item.id === round.askId;
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
                  style={highlighted ? { backgroundColor: `${color}14` } : undefined}
                >
                  <span className="min-w-[7rem] flex-1 text-sm font-semibold">
                    {item.name}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {item.licznik}/{item.mianownik} {item.unit} na porcję
                    </span>
                  </span>

                  <span className="flex items-center gap-1.5" aria-hidden>
                    {Array.from({ length: mixed.whole }, (_, i) => (
                      <span key={i} className="h-3.5 w-3.5 border-2" style={{ borderColor: color, backgroundColor: color }} />
                    ))}
                    {mixed.licznik > 0 && (
                      <span className="inline-block w-16">
                        <FractionBarGlyph
                          color={color}
                          mianownik={item.mianownik}
                          filled={fill(mixed.licznik)}
                          ariaLabel={`${mixed.licznik} z ${item.mianownik} części`}
                        />
                      </span>
                    )}
                  </span>

                  <span className="flex items-center gap-2">
                    <MiniFraction licznik={total} mianownik={item.mianownik} size="sm" color={highlighted ? color : undefined} />
                    <span className="text-xs text-muted-foreground">
                      {formatMixed(mixed)} {item.unit}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          {!ready ? (
            <p className="mt-4 border border-dashed p-3 text-center text-sm text-muted-foreground" style={{ borderColor: `${color}40` }}>
              Ustaw pokrętło na {round.servings} {plural(round.servings, SERVING_FORMS)}, żeby odpowiedzieć na pytanie.
            </p>
          ) : !solved ? (
            <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="mt-4 border p-4" style={{ borderColor: `${color}40` }}>
              <p className="mb-3 text-sm leading-relaxed">
                Ile {asked.pieceName} {asked.unit} <strong>{asked.genitive}</strong> potrzeba na {round.servings}{' '}
                {plural(round.servings, SERVING_FORMS)}? Wpisz samą liczbę.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value);
                    setWrong(false);
                  }}
                  inputMode="numeric"
                  className="w-28"
                  aria-label={`Liczba: ${asked.pieceName} ${asked.unit}`}
                />
                <span className="text-sm text-muted-foreground">
                  {asked.pieceName} {asked.unit}
                </span>
                <Button type="submit" style={{ backgroundColor: color }} className="text-white hover:opacity-90">
                  Sprawdź
                </Button>
              </div>
              {wrong && (
                <motion.p key={shakeKey} animate={{ x: [0, -6, 6, -4, 4, 0] }} transition={{ duration: 0.35 }} className="mt-3 text-sm text-rose-600">
                  Jeszcze nie. Policz: {round.servings} razy licznik jednej porcji — mianownik zostaje bez zmian.
                </motion.p>
              )}
            </motion.form>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-start gap-3 bg-emerald-50 p-4 dark:bg-emerald-950/40">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">{round.note}</p>
              </motion.div>
              <div className="mt-4 flex justify-end">
                <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
                  {isLast ? 'Do quizu' : 'Następne zamówienie'}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
