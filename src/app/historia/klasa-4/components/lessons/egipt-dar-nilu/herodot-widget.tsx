'use client';

import { useState } from 'react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { HerodotGdzieKiedy } from './herodot-gdzie-kiedy';
import { HERODOT, NOTES, SILENT, judgeNote, type HerodotId, type NoteId } from './nil';

/**
 * Blok 4 — **Herodot o rolnikach**. Dziecko przykłada notatki z własnej pracy
 * w blokach 1–3 do zdań Herodota, którym przeczą (albo na półkę „Herodot o tym
 * milczy”). Sędzia: notatka powtarza słowa zdania, któremu przeczy. Potem
 * dziecko szuka roku i miejsca, w którym Herodot ma rację (`HerodotGdzieKiedy`).
 */
type Target = HerodotId | typeof SILENT;

export function HerodotWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [placed, setPlaced] = useState<Partial<Record<NoteId, Target>>>({});
  const [picked, setPicked] = useState<NoteId | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const notesDone = NOTES.every((n) => placed[n.id]);

  const put = (note: NoteId, target: Target) => {
    const v = judgeNote(note, target);
    if (!v.ok) {
      setWhy(v.why ?? null);
      return;
    }
    setWhy(null);
    setPicked(null);
    setPlaced((p) => ({ ...p, [note]: target }));
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (id, target) => {
      if (target?.startsWith('h-')) put(id as NoteId, target.slice(2) as Target);
    },
    onTap: (id) => setPicked(id as NoteId),
    disabled: notesDone,
  });

  const free = NOTES.filter((n) => !placed[n.id]);
  const dragged = NOTES.find((n) => n.id === drag?.id);
  const at = (t: Target) => NOTES.filter((n) => placed[n.id] === t);

  const targetProps = (t: Target) => ({
    'data-drop': `h-${t}`,
    onClick: () => picked && put(picked, t),
    style: { background: hover === `h-${t}` ? `${color}22` : undefined, borderColor: hover === `h-${t}` ? color : undefined },
  });

  return (
    <div className="space-y-4">
      <figure className="border bg-amber-50/70 p-4 dark:bg-zinc-900">
        <figcaption className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
          Herodot, <em>Dzieje</em>, księga II, rozdz. 14 — fragment, omówienie własnymi słowami
        </figcaption>
        <p className="mb-2 text-sm italic text-muted-foreground">O rolnikach mieszkających w dolnym biegu Nilu, poniżej Memfis:</p>
        <div className="space-y-2">
          {HERODOT.map((h) => (
            <button key={h.id} type="button" {...targetProps(h.id)} className="block w-full border border-transparent p-2 text-left font-serif text-base leading-relaxed">
              „{h.text}”
              {at(h.id).length > 0 && (
                <span className="mt-1 flex flex-wrap gap-1">
                  {at(h.id).map((n) => (
                    <span key={n.id} className="border px-1.5 py-0.5 font-sans text-xs not-italic" style={{ borderColor: '#b91c1c', color: '#b91c1c' }}>
                      ✗ {n.text}
                    </span>
                  ))}
                </span>
              )}
            </button>
          ))}
        </div>
      </figure>

      <button type="button" {...targetProps(SILENT)} className="block w-full border border-dashed p-3 text-left text-sm">
        <span className="font-semibold">Herodot o tym milczy</span>
        {at(SILENT).map((n) => (
          <span key={n.id} className="mt-1 block text-xs">
            {n.text}
          </span>
        ))}
      </button>

      {!notesDone && (
        <div className="space-y-2">
          <p className="text-sm leading-relaxed">
            To są notatki z Twojej pracy w tej lekcji. <strong>Przyłóż każdą do zdania Herodota, któremu przeczy</strong>{' '}
            — albo na półkę, jeśli Herodot o tym nie pisze.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {free.map((n) => (
              <button
                key={n.id}
                type="button"
                {...bind(n.id)}
                className="touch-none border-2 bg-white p-2 text-left text-sm dark:bg-zinc-900"
                style={{ borderColor: picked === n.id ? color : undefined }}
              >
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">{n.from}</span>
                {n.text}
              </button>
            ))}
          </div>
        </div>
      )}
      <DragGhost drag={drag}>
        <span className="block max-w-[240px] border-2 bg-white p-2 text-xs dark:bg-zinc-900">{dragged?.text}</span>
      </DragGhost>
      {why && (
        <p className="text-sm text-destructive" role="status">
          {why}
        </p>
      )}

      {notesDone && (
        <div className="border-t pt-4">
          <HerodotGdzieKiedy color={color} onDone={onDone} />
        </div>
      )}
    </div>
  );
}
