'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { LAYERS } from './warstwy';
import { useWykop } from './wykop-state';
import { ZDANIA_ROKU } from './zdania-roku';

/**
 * Blok 4 — **Co zostało we mnie**. Mapa roku z pracy dziecka w bloku 1
 * (która warstwa poszła od razu, która po kilku próbach) i jedno zdanie
 * lekcji wybrane z całego roku jako „najważniejsze dla mnie”. Bez oceny
 * wyboru. `onDone` po wybraniu zdania.
 */
export function MapaRokuWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const { work, update } = useWykop();
  const reported = useRef(false);
  const chosen = ZDANIA_ROKU.find((z) => z.lesson === work.zdanie);

  const choose = (lesson: number) => {
    update((w) => ({ ...w, zdanie: lesson }));
    if (!reported.current) {
      reported.current = true;
      onDone();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm leading-relaxed">Twoja mapa roku — z tego, jak poszło Ci w wykopie:</p>
        <ol className="grid gap-1.5 sm:grid-cols-2">
          {LAYERS.map((l) => {
            const t = work.tries[l.id] ?? 0;
            const solved = work.solved.includes(l.id);
            return (
              <li key={l.id} className="flex items-center justify-between gap-2 border bg-white px-2.5 py-1.5 text-sm dark:bg-zinc-900">
                <span>
                  <span className="block font-semibold">{l.era}</span>
                  <span className="block text-xs text-muted-foreground">{l.when}</span>
                </span>
                <span
                  className={cn('shrink-0 text-xs font-semibold', !solved && 'text-muted-foreground')}
                  style={solved && t <= 1 ? { color } : undefined}
                >
                  {!solved ? 'jeszcze w ziemi' : t <= 1 ? 'od razu' : `za ${t} ${plural(t, { one: 'razem', few: 'razy', many: 'razy' })} — warto wrócić`}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div>
        <p className="mb-2 text-sm leading-relaxed">
          Każda lekcja tego roku stała na jednym zdaniu. Oto wszystkie. <strong>Stuknij to, które jest dla Ciebie najważniejsze.</strong>{' '}
          Nie ma tu złej odpowiedzi.
        </p>
        <ul className="max-h-80 divide-y overflow-y-auto border bg-white dark:bg-zinc-900">
          {ZDANIA_ROKU.map((z) => (
            <li key={z.lesson}>
              <button
                type="button"
                aria-pressed={work.zdanie === z.lesson}
                onClick={() => choose(z.lesson)}
                className={cn('block w-full px-2.5 py-2 text-left text-sm hover:bg-muted/40', work.zdanie === z.lesson && 'font-semibold')}
                style={work.zdanie === z.lesson ? { background: `${color}1a` } : undefined}
              >
                <span className="mr-1.5 font-mono text-xs tabular-nums text-muted-foreground">L{z.lesson}</span>
                {z.text}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {chosen && (
        <figure className="border-2 bg-[#fbf6e9] p-4 dark:bg-zinc-900" style={{ borderColor: color }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Najważniejsze dla mnie z całego roku</p>
          <blockquote className="mt-2 font-serif text-lg leading-snug">„{chosen.text}”</blockquote>
          <figcaption className="mt-2 text-xs text-muted-foreground">
            z lekcji „{chosen.title}”. Zostało w Tobie — i zostanie na dłużej niż jedna data.
          </figcaption>
        </figure>
      )}
    </div>
  );
}
