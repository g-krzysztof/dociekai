'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, RotateCcw } from 'lucide-react';
import { RegionMap } from '../../hist-map/region-map';
import { WORD_QUESTIONS, regionName, speakLikeYou, narrowed, type RegionId } from './regiony';

const OFF = '#ebe2cb';

/**
 * Haczyk L12 — „Na dwór czy na pole?”. Dziecko mówi, jak **samo** mówi, a mapa
 * zapala obszar, gdzie mówi się tak samo. Złej odpowiedzi nie ma. Można stukać
 * w inne słowa, żeby porównać. Po czterech pytaniach mapa pokazuje, gdzie mówią
 * tak jak ono we wszystkim naraz. Nic się nie zapisuje.
 */
export function SlowaZGeografia({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [peek, setPeek] = useState<string | null>(null);
  const finished = step >= WORD_QUESTIONS.length;

  const q = WORD_QUESTIONS[Math.min(step, WORD_QUESTIONS.length - 1)];
  const shownId = peek ?? chosen[q.id];
  const shown = q.options.find((o) => o.id === shownId);
  const like = speakLikeYou(chosen);

  const look = (id: RegionId) => {
    if (finished) {
      const on = like.includes(id);
      return { fill: on ? color : OFF, opacity: on ? 0.75 : 1, label: on && like.length < 11 };
    }
    const on = shown?.where.includes(id) ?? false;
    return { fill: on ? color : OFF, opacity: on ? 0.7 : 1 };
  };

  const pick = (id: string) => {
    if (!chosen[q.id]) setChosen((c) => ({ ...c, [q.id]: id }));
    else setPeek(id === chosen[q.id] ? null : id);
  };

  const next = () => {
    setPeek(null);
    const n = step + 1;
    setStep(n);
    if (n >= WORD_QUESTIONS.length) onComplete();
  };

  const restart = () => {
    setStep(0);
    setChosen({});
    setPeek(null);
  };

  return (
    <div className="grid gap-4 border bg-white p-4 dark:bg-zinc-900/80 sm:p-5 md:grid-cols-[1fr_minmax(0,300px)]">
      <div className="min-w-0">
        <RegionMap look={look} label="Mapa Polski z obszarami, w których mówi się tym słowem" className="block h-auto w-full max-w-[560px] select-none" />
        <p className="mt-1 text-xs text-muted-foreground">
          Mapa w dużym uproszczeniu: słowa nie zatrzymują się na granicach regionów, a w każdym mieście
          ktoś powie inaczej.
        </p>
      </div>

      <div className="min-w-0 text-sm leading-relaxed">
        {!finished ? (
          <motion.div key={q.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pytanie {step + 1} z {WORD_QUESTIONS.length} · jak ty mówisz?
            </p>
            <p className="mt-2 text-base font-medium">{q.prompt}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.options.map((o) => {
                const mine = chosen[q.id] === o.id;
                const peeked = peek === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => pick(o.id)}
                    className="border-2 px-3 py-2 text-base font-semibold transition-colors"
                    style={{
                      borderColor: mine || peeked ? color : 'var(--border)',
                      background: mine ? color : peeked ? `${color}22` : undefined,
                      color: mine ? '#fff' : undefined,
                    }}
                  >
                    {o.word}
                  </button>
                );
              })}
            </div>
            {!chosen[q.id] && (
              <p className="mt-3 text-muted-foreground">Nie ma złej odpowiedzi. Stuknij to, co mówisz w domu.</p>
            )}
            {shown && (
              <div className="mt-3 border-l-4 pl-3" style={{ borderColor: color }}>
                <p>
                  <strong>„{shown.word}”</strong> — {shown.note}
                </p>
                {chosen[q.id] && !peek && q.options.length > 1 && (
                  <p className="mt-1 text-xs text-muted-foreground">Stuknij inne słowo, żeby zobaczyć, gdzie mówi się tak.</p>
                )}
                {peek && <p className="mt-1 text-xs text-muted-foreground">To nie twoje słowo — tylko podglądasz.</p>}
              </div>
            )}
            {chosen[q.id] && (
              <button
                type="button"
                onClick={next}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 font-semibold text-white"
                style={{ background: color }}
              >
                {step + 1 < WORD_QUESTIONS.length ? 'Następne słowo' : 'Pokaż, gdzie mówią jak ja'}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="flex items-center gap-2 text-base font-semibold">
              <MapPin className="h-5 w-5" style={{ color }} /> Tak jak ty mówią…
            </p>
            {narrowed(chosen) && like.length > 0 ? (
              <p>
                {like.map(regionName).join(', ')}. Z czterech słów da się zgadnąć, skąd ktoś jest — tak
                pracują językoznawcy.
              </p>
            ) : like.length === 0 ? (
              <p>
                …nikt w jednym miejscu! Twoje słowa pochodzą z różnych stron Polski. Może rodzina
                przyjechała z kilku regionów? Słowa wędrują razem z ludźmi.
              </p>
            ) : (
              <p>
                …cała Polska. Twoje słowa rozumie każdy, od morza po góry. Ale spróbuj powiedzieć
                w Krakowie „idę na dwór” albo w Poznaniu „kartofle” — ktoś się uśmiechnie.
              </p>
            )}
            <p className="border-l-4 pl-3 font-medium" style={{ borderColor: color }}>
              Wszyscy mówimy po polsku — a jednak słowa mają swoją geografię. Skąd te różnice? Odpowiedź
              leży w historii regionów.
            </p>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" /> odpowiedz jeszcze raz
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
