'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { ANIMALS, BONES, formatM, judgeFit, type Animal, type Bone, type BoneKind } from './kosci';

/** Sylwetki rysowane kodem, viewBox 0 0 120 80, ziemia na y = 76. Schemat, nie anatomia. */
const SILHOUETTE: Record<string, { body: string; strokes?: string[] }> = {
  kon: {
    body: 'M20 72 L22 46 C22 38 30 34 46 34 L72 34 C76 26 80 18 88 14 L96 16 L101 25 L94 27 L88 34 L84 46 L82 72 L76 72 L74 50 L36 50 L32 72 L26 72 L27 52 Z',
    strokes: ['M22 40 C14 44 12 54 14 62'],
  },
  mamut: {
    body: 'M18 72 L20 44 C18 30 30 14 52 12 C70 10 86 16 92 28 C100 30 104 40 102 52 C101 60 98 66 96 72 L88 72 L87 54 L80 54 L79 72 L70 72 L68 52 L40 52 L38 72 L30 72 L29 54 L26 56 L26 72 Z',
    strokes: ['M100 46 C108 54 108 64 104 74', 'M97 52 C108 62 117 54 114 42'],
  },
  krowa: {
    body: 'M18 72 L20 42 C20 36 26 34 34 34 L82 34 L94 30 L103 36 L101 46 L92 48 L86 50 L84 72 L78 72 L76 52 L36 52 L32 72 L26 72 L26 52 Z',
    strokes: ['M92 31 L89 23', 'M98 32 L103 25', 'M20 40 C14 46 13 56 15 62'],
  },
  nosorozec: {
    body: 'M12 72 L14 46 C14 32 30 26 50 26 C64 26 74 30 82 36 C90 38 97 43 103 50 L104 58 C100 62 92 62 86 60 L82 72 L76 72 L74 56 L36 56 L34 72 L28 72 L26 56 L20 58 L20 72 Z',
    strokes: ['M101 48 L109 30', 'M93 43 L96 33'],
  },
  wieloryb: {
    body: 'M10 44 C22 30 60 26 90 34 C102 37 112 44 110 52 C106 60 72 64 42 60 C30 58 20 55 14 50 L4 38 L2 58 Z',
    strokes: ['M96 56 C92 62 86 64 80 62'],
  },
};

function BoneGlyph({ kind, className }: { kind: BoneKind; className?: string }) {
  return (
    <svg viewBox="0 0 48 24" className={cn('h-6 w-12', className)} aria-hidden>
      {kind === 'zebro' && (
        <path d="M4 20 C10 4 34 2 44 10" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" />
      )}
      {kind === 'noga' && (
        <g fill="currentColor">
          <rect x={10} y={9} width={28} height={6} />
          <circle cx={9} cy={8} r={4.5} />
          <circle cx={9} cy={16} r={4.5} />
          <circle cx={39} cy={9} r={4} />
          <circle cx={39} cy={15} r={4} />
        </g>
      )}
      {kind === 'czaszka' && (
        <g fill="currentColor">
          <path d="M6 16 C6 8 16 5 26 6 C34 7 40 10 43 15 L43 19 L8 19 Z" />
          <path d="M34 8 C36 4 39 4 40 9 Z" />
          <circle cx={22} cy={12} r={2} fill="var(--background)" />
        </g>
      )}
    </svg>
  );
}

/**
 * Blok 2 — **„Kości smoka”** (śledztwo).
 *
 * Gest nowy w kursie: **przykłada kość do zwierzęcia**. Trzy kości z łańcucha
 * przy katedrze (przeciągnięcie albo stuk-stuk) idą na karty pięciu
 * zwierząt; sędzia `judgeFit` porównuje kość ze szkieletem zwierzęcia
 * (czy ma taką kość, kształt, długość) i odrzut mówi, czym się różni.
 * Kiedy wszystkie trzy wiszą, składają się w smoka — i pada puenta.
 */
export function KosciSmoka({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [placed, setPlaced] = useState<Partial<Record<BoneKind, string>>>({});
  const [picked, setPicked] = useState<BoneKind | null>(null);
  const [miss, setMiss] = useState<{ animal: string; why: string } | null>(null);
  const [done, setDone] = useState(false);

  const free = BONES.filter((b) => !placed[b.id]);
  const allPlaced = free.length === 0;

  const tryPlace = (boneId: BoneKind, animalId: string) => {
    const bone = BONES.find((b) => b.id === boneId)!;
    const animal = ANIMALS.find((a) => a.id === animalId)!;
    const v = judgeFit(bone, animal);
    if (!v.ok) {
      setMiss({ animal: animal.id, why: v.why });
      return;
    }
    setMiss(null);
    setPicked(null);
    setPlaced((p) => ({ ...p, [boneId]: animalId }));
  };

  const { drag, hover, bind } = useDragToken({
    disabled: allPlaced,
    onTap: (id) => setPicked((p) => (p === id ? null : (id as BoneKind))),
    onDrop: (id, target) => {
      if (target?.startsWith('zwierze-')) tryPlace(id as BoneKind, target.slice(8));
    },
  });

  const dragged = drag ? BONES.find((b) => b.id === drag.id) : null;

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">
        Kości z łańcucha przy katedrze naprawdę istnieją — widzisz je na zdjęciu. Ale smoka nie było. Czyje więc są?{' '}
        <strong>Przyłóż każdą kość do zwierzęcia</strong>, w którego szkielecie by się zmieściła.
      </p>

      <div className="border-2 border-dashed p-3" style={{ borderColor: `color-mix(in oklch, ${color} 40%, transparent)` }}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Na łańcuchu przy drzwiach katedry</p>
        {free.length === 0 ? (
          <p className="text-sm text-muted-foreground">Łańcuch pusty — wszystkie kości mają właściciela.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {free.map((b) => (
              <button
                key={b.id}
                type="button"
                {...bind(b.id)}
                aria-pressed={picked === b.id}
                className={cn(
                  'flex touch-none flex-col items-start gap-1 border bg-white px-2 py-1.5 text-left dark:bg-zinc-900 sm:flex-row sm:items-center sm:gap-3 sm:px-3 sm:py-2',
                  picked === b.id && 'ring-2'
                )}
                style={picked === b.id ? { borderColor: color, ['--tw-ring-color' as string]: color } : undefined}
              >
                <BoneGlyph kind={b.id} className="shrink-0 text-stone-500" />
                <span className="min-w-0 text-[13px] leading-tight sm:text-sm">
                  <span className="block font-semibold">{b.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    <span className="hidden sm:inline">{b.looks} · </span>ok. {formatM(b.lengthM)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:grid-cols-5">
        {ANIMALS.map((a) => (
          <AnimalCard
            key={a.id}
            animal={a}
            color={color}
            hovered={hover === `zwierze-${a.id}`}
            missed={miss?.animal === a.id}
            bones={BONES.filter((b) => placed[b.id] === a.id)}
            onTap={picked ? () => tryPlace(picked, a.id) : undefined}
          />
        ))}
      </div>

      {miss && (
        <p className="border-l-2 border-destructive pl-3 text-sm leading-relaxed" aria-live="polite">
          {miss.why}
        </p>
      )}

      {allPlaced && <Smok color={color} placed={placed} done={done} onDone={() => { setDone(true); onComplete(); }} />}

      <DragGhost drag={drag}>
        {dragged && (
          <span className="flex items-center gap-2 border bg-white px-2 py-1 text-sm dark:bg-zinc-900">
            <BoneGlyph kind={dragged.id} className="text-stone-500" /> {dragged.name}
          </span>
        )}
      </DragGhost>
    </div>
  );
}

function AnimalCard({
  animal,
  color,
  hovered,
  missed,
  bones,
  onTap,
}: {
  animal: Animal;
  color: string;
  hovered: boolean;
  missed: boolean;
  bones: Bone[];
  onTap?: () => void;
}) {
  const sil = SILHOUETTE[animal.id];
  const skeleton = (['noga', 'zebro', 'czaszka'] as BoneKind[])
    .map((k) => {
      const s = animal.bones[k];
      if (!s) return k === 'noga' ? 'nóg brak' : null;
      const name = k === 'noga' ? 'kość nogi' : k;
      return `${name} ${formatM(s.lengthM)}${s.noseHorn ? ', róg na nosie' : ''}`;
    })
    .filter(Boolean)
    .join(' · ');
  return (
    <motion.div
      data-drop={`zwierze-${animal.id}`}
      role={onTap ? 'button' : undefined}
      tabIndex={onTap ? 0 : undefined}
      onClick={onTap}
      onKeyDown={(e) => {
        if (onTap && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onTap();
        }
      }}
      animate={missed ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'flex flex-col border bg-white p-1.5 dark:bg-zinc-900 sm:p-2',
        missed && 'border-destructive',
        bones.length > 0 && 'border-2'
      )}
      style={hovered || bones.length > 0 ? { borderColor: color } : undefined}
    >
      <svg viewBox="0 0 120 80" className="w-full" aria-hidden>
        <line x1={0} y1={76} x2={120} y2={76} stroke="currentColor" strokeOpacity={0.2} />
        <path d={sil.body} fill="currentColor" fillOpacity={0.18} stroke="currentColor" strokeOpacity={0.45} strokeWidth={1} />
        {sil.strokes?.map((d) => (
          <path key={d} d={d} fill="none" stroke="currentColor" strokeOpacity={0.45} strokeWidth={2.5} strokeLinecap="round" />
        ))}
      </svg>
      <p className="mt-1 text-[13px] font-semibold leading-tight sm:text-sm">{animal.name}</p>
      <p className="text-[10px] leading-snug text-muted-foreground sm:text-[11px]">{skeleton} (ok.)</p>
      {bones.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {bones.map((b) => (
            <span key={b.id} className="inline-flex items-center gap-1 px-1 text-[11px] font-semibold text-white" style={{ backgroundColor: color }}>
              <BoneGlyph kind={b.id} className="h-3 w-6" /> pasuje
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/** Puenta: trzy kości trzech zwierząt składają się w jednego „smoka”. */
function Smok({
  color,
  placed,
  done,
  onDone,
}: {
  color: string;
  placed: Partial<Record<BoneKind, string>>;
  done: boolean;
  onDone: () => void;
}) {
  const owners = BONES.map((b) => ANIMALS.find((a) => a.id === placed[b.id])!);
  return (
    <div className="grid gap-4 border p-4 sm:grid-cols-[200px_1fr]" style={{ borderColor: color }}>
      <svg viewBox="0 0 200 120" className="w-full" aria-label="Smok złożony z trzech kości: czaszka jako głowa, żebro jako skrzydło, kość nogi jako noga">
        <motion.path
          d="M30 100 C60 40 120 30 160 60"
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={22}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.g initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <path d="M60 64 C80 10 130 6 160 26" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
        </motion.g>
        <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} fill={color}>
          <path d="M150 58 C150 46 166 42 180 44 C190 46 196 52 196 58 L196 64 L152 64 Z" />
          <path d="M184 46 C187 38 192 38 193 47 Z" />
        </motion.g>
        <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} fill={color}>
          <rect x={86} y={72} width={8} height={36} />
          <circle cx={90} cy={70} r={7} />
          <circle cx={90} cy={110} r={6} />
        </motion.g>
      </svg>
      <div className="space-y-2 text-sm leading-relaxed">
        <p>
          Złóż je razem — i masz smoka. Tylko że to są kości trzech różnych zwierząt:{' '}
          <strong>{owners.map((a) => a.name).join(', ')}</strong>. {owners.filter((a) => a.when.startsWith('wymarł')).map((a) => `${a.name.charAt(0).toUpperCase()}${a.name.slice(1)} ${a.when}`).join('. ')}.
        </p>
        <p>
          Ludzie w średniowieczu nie znali mamutów ani nosorożców włochatych. Znajdowali w ziemi i nad rzeką ogromne kości
          i potrzebowali opowieści, która je wyjaśni. <strong>Legendy często rodzą się z prawdziwych rzeczy, których
          nikt nie umiał wytłumaczyć.</strong>
        </p>
        {!done && (
          <button type="button" onClick={onDone} className="px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: color }}>
            Rozumiem
          </button>
        )}
      </div>
    </div>
  );
}
