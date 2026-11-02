'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useCinematic } from '../../lib/use-cinematic';
import { useGuide } from './guide-shell';

export type GuideActMode = 'stage' | 'flow';

export interface GuideActMeta {
  id: string;
  /** Krótka etykieta do szyny nawigacji. */
  label: string;
  /**
   * `stage` — przypięta scena scrubowana scrollem (tylko lg+ i bez reduced-motion),
   * `flow`  — zwykła sekcja w przepływie strony, wejście przez `whileInView`.
   * Celowo mieszamy oba: ciągłe pinowanie przez osiem aktów męczy.
   */
  mode: GuideActMode;
  /** Długość biegu przewijania w vh — tylko dla `stage`. */
  runway?: number;
}

interface ActValue {
  progress: MotionValue<number>;
  /** Czy ten akt naprawdę jest scrubowany (scena + szeroki ekran + brak reduced-motion). */
  cinematic: boolean;
}

const ActContext = createContext<ActValue | null>(null);

function useAct(): ActValue {
  const ctx = useContext(ActContext);
  if (!ctx) throw new Error('Komponenty aktu muszą być użyte wewnątrz <GuideAct>');
  return ctx;
}

/** Postęp bieżącego aktu (0–1) do ciągłego scrubowania, np. `pathLength`. */
export function useActProgress(): MotionValue<number> {
  return useAct().progress;
}

/**
 * Numer beatu 0..count wyliczony z postępu aktu — most dla komponentów, które
 * potrzebują liczby w stanie Reacta, a nie `MotionValue` (np. `RomanOdometer`
 * przyjmuje `value: number`).
 *
 * To jedyne miejsce w przewodniku, gdzie scroll powoduje re-render — i to
 * najwyżej `count` razy na akt, dzięki bailoutowi na równym stanie.
 */
export function useActStep(count: number, from = 0, to = 1): number {
  const { progress, cinematic } = useAct();
  const [step, setStep] = useState(cinematic ? 0 : count);

  useEffect(() => {
    if (!cinematic) {
      setStep(count);
      return;
    }
    const apply = (value: number) => {
      const ratio = (value - from) / (to - from);
      const next = Math.max(0, Math.min(count, Math.round(ratio * count)));
      setStep((prev) => (prev === next ? prev : next));
    };
    apply(progress.get());
    return progress.on('change', apply);
  }, [progress, cinematic, count, from, to]);

  return step;
}

interface BeatProps {
  /** Moment w postępie aktu (0–1), w którym beat się pojawia. */
  at: number;
  /** Dystans wjazdu w px. Ignorowany poza trybem kinowym. */
  y?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Dyskretna odsłona wewnątrz sceny. Własny komponent (a nie pętla `useTransform`
 * w rodzicu), żeby nie łamać reguły hooków.
 *
 * REGUŁA ADDYTYWNOŚCI: beat może tylko *dokładać* treść — nigdy nic nie zabiera.
 * Dzięki temu `progress = 1` jest pełnoprawną klatką końcową, a degradacja poza
 * trybem kinowym sprowadza się do „pokaż wszystko”.
 */
export function Beat({ at, y = 24, className, children }: BeatProps) {
  const { progress, cinematic } = useAct();
  const opacity = useTransform(progress, [at, at + 0.08], [0, 1]);
  const translateY = useTransform(progress, [at, at + 0.08], [y, 0]);

  if (!cinematic) {
    // Reduced motion / mobile: sam fade, bez ruchu w osi Y (to bodziec przedsionkowy).
    return (
      <motion.div
        className={className}
        data-beat={at}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div className={className} data-beat={at} style={{ opacity, y: translateY }}>
      {children}
    </motion.div>
  );
}

interface GuideActProps {
  id: string;
  mode?: GuideActMode;
  runway?: number;
  children: ReactNode;
}

/**
 * Jeden akt przewodnika.
 *
 * Wysokość biegu i przypięcie to **czysty CSS** (`lg:` + `motion-reduce:`), a JS
 * decyduje wyłącznie o tym, czy podpiąć `scrollYProgress`. Dzięki temu serwer i
 * pierwsza klatka klienta produkują ten sam DOM i ten sam layout — brak
 * hydration mismatchu i brak skoku wysokości po zamontowaniu.
 */
export function GuideAct({ id, mode = 'flow', runway = 240, children }: GuideActProps) {
  const ref = useRef<HTMLElement>(null);
  const cinematic = useCinematic();
  const { markVisited, setActiveId } = useGuide();

  // offset ['start start', 'end end']: 0 = górna krawędź biegu dotyka góry
  // viewportu (moment przypięcia), 1 = dolna krawędź dotyka dołu (odpięcie).
  // Dokładnie pokrywa się z czasem życia `sticky`.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const settled = useMotionValue(1);
  const isStage = mode === 'stage' && cinematic;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(id);
            markVisited(id);
          }
        });
      },
      { rootMargin: '-20% 0px -35% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [id, markVisited, setActiveId]);

  return (
    <ActContext.Provider
      value={{ progress: isStage ? scrollYProgress : settled, cinematic: isStage }}
    >
      <section
        ref={ref}
        id={id}
        data-act={id}
        className={
          mode === 'stage'
            ? 'relative scroll-mt-16 lg:h-[var(--act-runway)] lg:motion-reduce:h-auto'
            : 'relative scroll-mt-16 py-12'
        }
        style={
          mode === 'stage' ? ({ '--act-runway': `${runway}vh` } as React.CSSProperties) : undefined
        }
      >
        <div
          data-stage={mode === 'stage' ? id : undefined}
          className={
            mode === 'stage'
              ? 'lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center lg:overflow-hidden lg:py-12 lg:motion-reduce:static lg:motion-reduce:block lg:motion-reduce:h-auto lg:motion-reduce:overflow-visible'
              : undefined
          }
        >
          <div className="mx-auto w-full max-w-4xl py-10 lg:py-0">{children}</div>
        </div>
      </section>
    </ActContext.Provider>
  );
}
