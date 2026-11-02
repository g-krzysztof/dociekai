'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { judgeSentence, PEOPLE, REASONS, tally, type ReasonId } from './gmina';

const SEATS = 5;

/**
 * Blok 2 — **Dlaczego się przyłączyli?** Gesty: wprowadza osobę z progu
 * i sadza ją przy wspólnym stole (przeciąganie albo stuk-stuk, miejsce
 * dowolne — w gminie nie ma miejsc lepszych i gorszych); posadzona osoba
 * mówi trzy zdania, a dziecko stuka to, które mówi, co ją tu przyciągnęło.
 * Znaleziony powód zawisa nad jej miejscem. `onDone` po piątej osobie.
 */
export function GminaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [seats, setSeats] = useState<(string | null)[]>(Array(SEATS).fill(null));
  const [found, setFound] = useState<Record<string, ReasonId>>({});
  const [wrong, setWrong] = useState<{ id: string; message: string } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const reported = useRef(false);

  const seated = seats.filter(Boolean) as string[];
  const speaking = seated.find((id) => !found[id]) ?? null;
  const waiting = PEOPLE.filter((p) => !seated.includes(p.id));
  const all = Object.keys(found).length >= PEOPLE.length;

  const seat = (personId: string, target: string | null) => {
    setPicked(null);
    if (!target?.startsWith('seat:') || speaking) return;
    const i = Number(target.slice(5));
    if (seats[i]) return;
    setSeats((s) => s.map((x, k) => (k === i ? personId : x)));
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: seat,
    onTap: (id) => setPicked((p) => (p === id ? null : id)),
    disabled: Boolean(speaking) || all,
  });

  const tapSentence = (personId: string, sentenceId: string) => {
    const v = judgeSentence(personId, sentenceId);
    if (!v.ok) {
      setWrong({ id: sentenceId, message: v.message });
      return;
    }
    setWrong(null);
    const next = { ...found, [personId]: v.reason };
    setFound(next);
    if (Object.keys(next).length >= PEOPLE.length && !reported.current) {
      reported.current = true;
      onDone();
    }
  };

  const speaker = PEOPLE.find((p) => p.id === speaking);

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        {!all ? (
          <>
            <strong>Wprowadź gości do stołu</strong> — przeciągnij osobę na wolne miejsce albo stuknij ją, a potem miejsce.
            Każda opowie o sobie. Stuknij zdanie, które mówi, <strong>co ją przyciągnęło do gminy</strong>.
          </>
        ) : (
          'Wszyscy siedzą przy jednym stole.'
        )}
      </p>

      {waiting.length > 0 && (
        <div className="border border-dashed p-2">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Na progu</p>
          <div className="flex flex-wrap gap-2">
            {waiting.map((p) => (
              <button
                key={p.id}
                type="button"
                {...bind(p.id)}
                disabled={Boolean(speaking)}
                className={cn(
                  'touch-none border-2 bg-white px-2.5 py-1.5 text-left text-sm disabled:opacity-40 dark:bg-zinc-900',
                  drag?.id === p.id && 'opacity-30'
                )}
                style={{ borderColor: picked === p.id ? color : undefined }}
              >
                <span className="block font-semibold">{p.name}</span>
                <span className="block text-xs text-muted-foreground">{p.who}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stół z góry: jeden długi blat, pięć miejsc bez „lepszego” końca. */}
      <div className="border bg-[#f3ead7] p-3 dark:bg-zinc-900">
        <div className="grid grid-cols-5 gap-1.5">
          {seats.map((id, i) => {
            const p = PEOPLE.find((x) => x.id === id);
            const dropId = `seat:${i}`;
            return (
              <div
                key={i}
                data-drop={id ? undefined : dropId}
                onClick={() => picked && seat(picked, dropId)}
                className={cn(
                  'flex min-h-[4.5rem] flex-col items-center justify-start border-2 border-dashed bg-white/70 p-1 text-center dark:bg-zinc-800',
                  !id && picked && 'cursor-pointer'
                )}
                style={{ borderColor: hover === dropId ? color : id ? 'transparent' : undefined }}
              >
                {p ? (
                  <>
                    <span className="text-xs font-semibold leading-tight sm:text-sm">{p.name}</span>
                    {found[p.id] ? (
                      <span className="mt-1 text-[11px] leading-tight sm:text-xs" style={{ color }}>
                        {REASONS[found[p.id]]}
                      </span>
                    ) : (
                      <span className="mt-1 text-[11px] text-muted-foreground">mówi…</span>
                    )}
                  </>
                ) : (
                  <span className="text-[11px] text-muted-foreground">wolne</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 h-6 border-2 border-[#8a6a3a] bg-[#c9a877]" aria-hidden />
      </div>

      {speaker && (
        <div className="border-l-2 bg-white p-3 dark:bg-zinc-900" style={{ borderColor: color }}>
          <p className="mb-2 text-sm">
            <strong>{speaker.name}</strong>, {speaker.who}, mówi:
          </p>
          <div className="space-y-1.5">
            {speaker.sentences.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => tapSentence(speaker.id, s.id)}
                className={cn('block w-full border bg-white px-2.5 py-1.5 text-left text-sm italic hover:bg-muted/50 dark:bg-zinc-900')}
                style={{ borderColor: wrong?.id === s.id ? 'var(--destructive)' : undefined }}
              >
                „{s.text}”
              </button>
            ))}
          </div>
          {wrong && <p className="mt-2 text-sm text-destructive">{wrong.message}</p>}
        </div>
      )}

      {all && (
        <div className="space-y-2">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {tally(found).map((t) => (
              <div key={t.id} className="border bg-white px-2.5 py-1.5 text-sm dark:bg-zinc-900">
                <span className="font-semibold" style={{ color }}>
                  {t.label}
                </span>
                <span className="block text-xs text-muted-foreground">{t.who.join(', ')}</span>
              </div>
            ))}
          </div>
          <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
            Pięć osób, cztery różne powody. Spójrz na stół: niewolnik Feliks i bogata Kornelia siedzą przy jednym blacie. Na
            ulicy Rzymu Feliks mógłby jej najwyżej usługiwać — tak jak niewolnik Dawos w dniu triumfu Cezara. Dla wielu ubogich
            i samotnych gmina była miejscem, gdzie po raz pierwszy ktoś traktował ich jak równych. Postaci są wymyślone, ale
            takich ludzi w pierwszych gminach było wielu.
          </p>
        </div>
      )}

      <DragGhost drag={drag}>
        <span className="block border-2 bg-white px-2.5 py-1.5 text-sm font-semibold" style={{ borderColor: color }}>
          {PEOPLE.find((p) => p.id === drag?.id)?.name}
        </span>
      </DragGhost>
    </div>
  );
}
