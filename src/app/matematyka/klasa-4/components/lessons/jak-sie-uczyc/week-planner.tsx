'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'] as const;
const MAX_BLOCKS = 3;
const BLOCK_MINUTES = 15;

/** Kolejne bloki tego samego dnia dają coraz mniej — mózg męczy się i przestaje zapamiętywać. */
const BLOCK_VALUE = [15, 10, 7];

/** Plan na 4 różne dni po 15 minut = 60 „skutecznych” minut = 100%. */
const TARGET_EFFECTIVE = 60;

type Plan = number[];

const EMPTY_PLAN: Plan = [0, 0, 0, 0, 0, 0, 0];

function effectiveMinutes(plan: Plan): number {
  return plan.reduce((sum, blocks) => {
    let dayValue = 0;
    for (let i = 0; i < blocks; i += 1) dayValue += BLOCK_VALUE[i] ?? 5;
    return sum + dayValue;
  }, 0);
}

interface WeekPlannerProps {
  color: string;
  onComplete?: () => void;
}

/** Planer tygodnia: dziecko układa własny plan nauki i widzi, jak rozłożenie zmienia jego siłę. */
export function WeekPlanner({ color, onComplete }: WeekPlannerProps) {
  const [plan, setPlan] = useState<Plan>(EMPTY_PLAN);

  const totalBlocks = plan.reduce((sum, blocks) => sum + blocks, 0);
  const totalMinutes = totalBlocks * BLOCK_MINUTES;
  const spread = plan.filter((blocks) => blocks > 0).length;
  const score = useMemo(
    () => Math.min(100, Math.round((effectiveMinutes(plan) / TARGET_EFFECTIVE) * 100)),
    [plan]
  );

  const goalReached = spread >= 4;

  useEffect(() => {
    if (goalReached) onComplete?.();
  }, [goalReached, onComplete]);

  const change = (index: number, delta: number) =>
    setPlan((prev) =>
      prev.map((blocks, i) =>
        i === index ? Math.min(MAX_BLOCKS, Math.max(0, blocks + delta)) : blocks
      )
    );

  const message = (() => {
    if (totalBlocks === 0)
      return 'Kliknij „+” pod dniami, w które realnie usiądziesz do matematyki. Jeden klocek = 15 minut.';
    if (spread === 1)
      return 'Cała nauka w jeden dzień. Pamiętasz krzywą zapominania? Mózg musi wrócić do tematu kilka razy — jeden długi zryw tego nie zastąpi.';
    if (spread <= 3)
      return 'Już lepiej! Dołóż jeszcze jeden–dwa dni, a wiedza zdąży się utrwalić między spotkaniami z tematem.';
    if (totalMinutes > 150)
      return 'Plan rozłożony świetnie, ale uważaj na przeciążenie — 15–30 minut dziennie w zupełności wystarczy w klasie 4.';
    return 'Tak wygląda plan, który naprawdę działa: krótko, ale w kilka różnych dni. Powodzenia!';
  })();

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Masz w tygodniu tyle samo minut co wszyscy. Pytanie brzmi: jak je rozłożysz? Ułóż swój
        tydzień z 15-minutowych klocków i patrz na wskaźnik po prawej.
      </p>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
        {/* Tydzień */}
        <div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {DAYS.map((day, index) => {
              const blocks = plan[index];
              const weekend = index >= 5;

              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      'text-xs font-bold',
                      weekend ? 'text-rose-500' : 'text-muted-foreground'
                    )}
                  >
                    {day}
                  </span>

                  {/* Kolumna klocków — od góry pusto, od dołu wypełnione */}
                  <div className="flex w-full flex-col-reverse gap-1 bg-muted/60 p-1">
                    {Array.from({ length: MAX_BLOCKS }, (_, slot) => {
                      const filled = slot < blocks;
                      return (
                        <motion.button
                          key={slot}
                          type="button"
                          onClick={() => change(index, filled ? -1 : 1)}
                          animate={{ scale: 1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={
                            filled
                              ? `Usuń 15 minut w dniu ${day}`
                              : `Dodaj 15 minut w dniu ${day}`
                          }
                          className={cn(
                            'h-7 cursor-pointer border transition-colors sm:h-8',
                            filled ? 'border-transparent' : 'border-dashed border-muted-foreground/30'
                          )}
                          style={filled ? { backgroundColor: color } : undefined}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => change(index, -1)}
                      disabled={blocks === 0}
                      aria-label={`Mniej nauki w dniu ${day}`}
                      className="cursor-pointer p-1 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => change(index, 1)}
                      disabled={blocks === MAX_BLOCKS}
                      aria-label={`Więcej nauki w dniu ${day}`}
                      className="cursor-pointer p-1 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                      style={{ color }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gotowe plany do porównania */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlan([1, 1, 0, 1, 1, 0, 0])}
              className="gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Plan Antka: 4 × 15 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlan([0, 0, 0, 0, 0, 0, 3])}
            >
              Plan Zosi: wszystko w niedzielę
            </Button>
            {totalBlocks > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlan(EMPTY_PLAN)}
                className="gap-1.5 text-muted-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Wyczyść
              </Button>
            )}
          </div>
        </div>

        {/* Wskaźnik siły planu */}
        <div className="border p-4" style={{ borderColor: `${color}40` }}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Siła planu
          </p>
          <p className="mb-3 text-3xl font-extrabold tabular-nums" style={{ color }}>
            {score}%
          </p>

          <div className="mb-3 h-2.5 overflow-hidden bg-muted">
            <motion.div
              className="h-full"
              style={{ backgroundColor: color }}
              animate={{ width: `${score}%` }}
              transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            />
          </div>

          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Czas w tygodniu</dt>
              <dd className="font-semibold tabular-nums">{totalMinutes} min</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Różne dni</dt>
              <dd
                className={cn('font-semibold tabular-nums', goalReached && 'text-emerald-600')}
              >
                {spread}/4
              </dd>
            </div>
          </dl>

          <p className="mt-3 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
            Cel: <strong>4 różne dni</strong> w tygodniu. Nie chodzi o to, żeby siedzieć dłużej —
            tylko żeby wracać częściej.
          </p>
        </div>
      </div>

      <motion.p
        key={message}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 text-sm leading-relaxed"
        style={{ backgroundColor: `${color}12` }}
      >
        {message}
      </motion.p>

      {/* Rytuał nauki */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { emoji: '⏰', title: 'Zawsze o tej samej porze', desc: 'Np. zaraz po podwieczorku. Wtedy nie trzeba się codziennie zbierać w sobie.' },
          { emoji: '📵', title: 'Telefon w innym pokoju', desc: '15 minut bez powiadomień jest warte więcej niż godzina z nimi.' },
          { emoji: '⏳', title: 'Nastaw minutnik na 15 minut', desc: 'Koniec czasu = koniec nauki. Łatwiej zacząć, gdy wiadomo, kiedy koniec.' },
        ].map((item) => (
          <div key={item.title} className="border p-4">
            <span className="mb-2 block text-2xl" aria-hidden>
              {item.emoji}
            </span>
            <p className="mb-1 text-sm font-bold">{item.title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
