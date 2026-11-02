'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, HardDrive, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MEDIA, PAYLOADS, fits, howMany, unitsNeeded } from './media-capacity';

/**
 * Symulator lekcji: dziecko dobiera nośnik do tego, co chce zapisać, i od razu
 * widzi, ile razy dana rzecz się na nim mieści (albo ilu nośników by brakowało).
 *
 * Świadomie NIE pokazuje, ile dyskietek mieści jedna płyta: to dziecko odkrywa
 * samo w zadaniu Z-1 (`FloppyPour`), a gotowa liczba tutaj zepsułaby tamto
 * odkrycie.
 *
 * Cel bloku: dla każdej z czterech rzeczy do zapisania znaleźć nośnik, na który
 * się mieści. Zły wybór (za mały nośnik) niczego nie blokuje — pokazuje, ilu
 * egzemplarzy by trzeba, i pozwala kliknąć dalej.
 */

interface MediaFitProps {
  color: string;
  onComplete?: () => void;
}

export function MediaFit({ color, onComplete }: MediaFitProps) {
  const [payloadId, setPayloadId] = useState(PAYLOADS[0].id);
  /** payloadId → ostatnio kliknięty nośnik (do werdyktu pod planszą). */
  const [picked, setPicked] = useState<Record<string, string>>({});

  const payload = PAYLOADS.find((p) => p.id === payloadId)!;
  const pickedMediumId = picked[payloadId];
  const pickedMedium = MEDIA.find((m) => m.id === pickedMediumId);

  const isSolved = (id: string) => {
    const mediumId = picked[id];
    const medium = MEDIA.find((m) => m.id === mediumId);
    const p = PAYLOADS.find((item) => item.id === id)!;
    return medium ? fits(p.mb, medium.mb) : false;
  };
  const solvedCount = PAYLOADS.filter((p) => isSolved(p.id)).length;
  const finished = solvedCount === PAYLOADS.length;

  const tap = (mediumId: string) => {
    const next = { ...picked, [payloadId]: mediumId };
    setPicked(next);
    const allSolved = PAYLOADS.every((p) => {
      const m = MEDIA.find((item) => item.id === next[p.id]);
      return m ? fits(p.mb, m.mb) : false;
    });
    if (allSolved) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Wybierz, co chcesz zapisać, a potem <strong>stuknij nośnik</strong>, na którym chcesz to
          zmieścić. Znajdź pasujący nośnik dla każdej z czterech rzeczy.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {solvedCount}/{PAYLOADS.length}
        </p>
      </div>

      {/* Co zapisujemy */}
      <div className="mb-4 flex flex-wrap gap-2">
        {PAYLOADS.map((p) => {
          const active = p.id === payloadId;
          const solved = isSolved(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPayloadId(p.id)}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                active ? '' : 'cursor-pointer hover:bg-muted/60'
              )}
              style={
                active ? { borderColor: color, backgroundColor: `${color}12`, color } : undefined
              }
            >
              {solved && <Check className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />}
              <span>{p.name}</span>
              <span className="font-mono tabular-nums text-muted-foreground">· {p.sizeLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Nośniki */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {MEDIA.map((medium) => {
          const ok = fits(payload.mb, medium.mb);
          const active = pickedMediumId === medium.id;
          return (
            <button
              key={medium.id}
              type="button"
              onClick={() => tap(medium.id)}
              aria-pressed={active}
              className="flex cursor-pointer flex-col border-2 p-3 text-left transition-colors hover:bg-muted/40"
              style={
                active
                  ? {
                      borderColor: ok ? color : '#dc2626',
                      backgroundColor: ok ? `${color}0f` : '#dc26260f',
                    }
                  : { borderColor: 'var(--border)' }
              }
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-bold leading-snug">{medium.name}</span>
                <span
                  className="shrink-0 font-mono text-xs font-bold tabular-nums"
                  style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
                >
                  {medium.capacityLabel}
                </span>
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">{medium.note}</span>
            </button>
          );
        })}
      </div>

      {/* Werdykt dla ostatniego wyboru */}
      <AnimatePresence mode="wait">
        {pickedMedium && (
          <motion.div
            key={`${payloadId}-${pickedMediumId}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 pl-3 text-sm leading-relaxed"
            style={{ borderColor: fits(payload.mb, pickedMedium.mb) ? color : '#dc2626' }}
          >
            <Verdict payloadMb={payload.mb} payloadName={payload.name} medium={pickedMedium} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-start gap-2 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <HardDrive className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            <span>
              <strong>Każda rzecz ma swój nośnik.</strong> Im nowszy nośnik, tym więcej się mieści i
              tym mniej trzeba się nim opiekować — aż do chmury, która limitu prawie nie ma, ale
              wymaga internetu i zaufania do firmy, która ją prowadzi.
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Verdict({
  payloadMb,
  payloadName,
  medium,
}: {
  payloadMb: number;
  payloadName: string;
  medium: (typeof MEDIA)[number];
}) {
  const lower = payloadName.charAt(0).toLowerCase() + payloadName.slice(1);

  if (medium.mb === Infinity) {
    return (
      <span>
        <strong>Mieści się bez problemu.</strong> W chmurze zmieścisz {lower} i tysiąc razy więcej —
        pod warunkiem, że masz internet i pamiętasz hasło do konta.
      </span>
    );
  }

  if (fits(payloadMb, medium.mb)) {
    const times = howMany(medium.mb, payloadMb);
    return (
      <span>
        <span className="inline-flex items-center font-semibold" style={{ color: 'inherit' }}>
          <Check className="mr-1 h-4 w-4" aria-hidden />
          Mieści się.
        </span>{' '}
        {times === 1 ? (
          <>
            Zmieści się na jednym takim nośniku ({medium.name}, {medium.capacityLabel}) — i prawie
            nic ponad to. Cała pojemność poszła na tę jedną rzecz.
          </>
        ) : (
          <>
            Na jednym takim nośniku ({medium.name}, {medium.capacityLabel}) zmieści się to około{' '}
            <strong>{times.toLocaleString('pl-PL')}</strong> razy.
          </>
        )}
      </span>
    );
  }

  const need = unitsNeeded(payloadMb, medium.mb);
  const floppyExtra =
    medium.id === 'dyskietka'
      ? ' Ile dyskietek zmieściłoby się na jednej płycie, sprawdzisz w zadaniu Z-1.'
      : '';
  return (
    <span>
      <span className="inline-flex items-center font-semibold text-red-700 dark:text-red-400">
        <X className="mr-1 h-4 w-4" aria-hidden />
        Nie mieści się.
      </span>{' '}
      {medium.name} ma tylko {medium.capacityLabel}. Żeby zapisać {lower}, potrzebowałbyś /
      potrzebowałabyś aż <strong>{need.toLocaleString('pl-PL')}</strong> takich nośników.
      {floppyExtra}
    </span>
  );
}
