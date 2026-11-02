'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, MousePointerClick } from 'lucide-react';
import { plural } from '@/lib/plural';
import { KazimierzMap, MapLegend } from './mapa-kazimierza';
import {
  ANNEXED_IDS,
  judgeTap,
  type MapTap,
  type ReadQuestionId,
  type TapVerdict,
} from './kazimierz';

/**
 * Blok 2 — **Czytanie mapy** (`mapa`).
 *
 * Odpowiedzią jest **stuknięcie w mapę** (albo w słowo tytułu), nigdy wybór
 * z listy. Pięć pytań: tytuł mówi GDZIE i KIEDY, znak koronacji, wszystkie
 * ziemie przyłączone (kolor), zamek króla na Rusi (znak + kolor naraz).
 * Sędzia `judgeTap` mówi przy błędzie, co dziecko stuknęło i co znaczy to według
 * legendy — odpowiedź zawsze wynika z legendy, nie z klucza autora.
 */

interface Question {
  id: ReadQuestionId;
  ask: string;
  hint: string;
}

const QUESTIONS: Question[] = [
  { id: 'gdzie', ask: 'Jaki obszar pokazuje ta mapa?', hint: 'Stuknij słowo w tytule mapy.' },
  { id: 'kiedy', ask: 'Jakie czasy pokazuje ta mapa?', hint: 'Też w tytule — stuknij słowo.' },
  {
    id: 'koronacja',
    ask: 'Gdzie Kazimierz został koronowany?',
    hint: 'Stuknij właściwy znak na mapie.',
  },
  {
    id: 'przylaczone',
    ask: 'Wskaż wszystkie ziemie przyłączone za rządów Kazimierza.',
    hint: 'Stukaj w obszary na mapie.',
  },
  {
    id: 'zamek-rus',
    ask: 'Znajdź zamek, który król zbudował na Rusi Halickiej.',
    hint: 'Potrzebujesz znaku i koloru naraz.',
  },
];

export function CzytanieMapy({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [verdict, setVerdict] = useState<TapVerdict | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const reported = useRef(false);

  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const finished = step >= QUESTIONS.length;
  const solved = q.id === 'przylaczone' ? found.length === ANNEXED_IDS.length : !!verdict?.ok;

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [finished, onComplete]);

  const tap = (t: MapTap) => {
    if (finished || solved) return;
    const v = judgeTap(q.id, t);
    setVerdict(v);
    if (q.id === 'przylaczone' && v.ok && v.hit && !found.includes(v.hit))
      setFound((f) => [...f, v.hit!]);
  };

  const hits = useMemo(() => {
    const s = new Set<string>(q.id === 'przylaczone' ? found : []);
    if (verdict?.ok && verdict.hit) s.add(verdict.hit);
    return s;
  }, [q.id, found, verdict]);

  const next = () => {
    setStep((s) => s + 1);
    setVerdict(null);
  };

  const panel = (
    <div className="border p-3 sm:p-4" aria-live="polite">
      {finished ? (
        <div className="text-sm leading-relaxed">
          <p className="flex items-center gap-2 font-semibold" style={{ color }}>
            <Check className="h-4 w-4" aria-hidden /> Mapa przeczytana.
          </p>
          <p className="mt-1.5">
            Żadnej odpowiedzi nie było napisanej na mapie wprost. Tytuł powiedział, gdzie i kiedy, a
            legenda — co znaczą korona, wieża i kolory. Resztę wyczytałeś/łaś sam/a.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pytanie {step + 1} z {QUESTIONS.length}
          </p>
          <p className="mt-1 text-base font-semibold leading-snug">{q.ask}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5" aria-hidden /> {q.hint}
            {q.id === 'przylaczone' && ` Znalezione: ${found.length} z ${ANNEXED_IDS.length}.`}
          </p>
          {verdict && (
            <motion.p
              key={verdict.note}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 text-sm leading-snug"
              style={{ backgroundColor: verdict.ok ? `${color}17` : '#fde8e4' }}
            >
              {verdict.note}
              {q.id === 'przylaczone' && verdict.ok && !solved && (
                <>
                  {' '}
                  Zostało jeszcze {ANNEXED_IDS.length - found.length}{' '}
                  {plural(ANNEXED_IDS.length - found.length, {
                    one: 'obszar',
                    few: 'obszary',
                    many: 'obszarów',
                  })}
                  .
                </>
              )}
            </motion.p>
          )}
          {solved && (
            <button
              type="button"
              onClick={next}
              className="mt-3 cursor-pointer border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-muted"
              style={{ borderColor: color, color }}
            >
              {step + 1 < QUESTIONS.length ? 'Następne pytanie' : 'Gotowe'}
            </button>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:grid-rows-[auto_1fr] md:items-start md:gap-4">
      <div className="md:col-start-1 md:row-span-2 md:row-start-1">
        <KazimierzMap
          hits={hits}
          onTap={tap}
          onTitleTap={(index) => tap({ kind: 'title', index })}
        />
      </div>
      <div className="order-first md:order-none md:col-start-2 md:row-start-1">{panel}</div>
      <div className="md:col-start-2 md:row-start-2">
        <MapLegend compact />
      </div>
    </div>
  );
}
