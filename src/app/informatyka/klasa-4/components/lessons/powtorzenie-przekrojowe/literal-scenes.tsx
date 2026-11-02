'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { Cat, FileImage, Folder, FolderOpen, Mail, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CAT, MAIL_LIMIT_MB, POSTER, formatMb, type SavedFile } from './literal';

/**
 * Trzy sceny bloku „Dosłowniak”. Każda pokazuje **wynik** polecenia, nie
 * odpowiedź: dziecko patrzy na scenę i samo ocenia, czy to jest to, o co mu
 * chodziło. Scena przed uruchomieniem pokazuje stan wyjściowy (`null`).
 */

/* ------------------------------------------------------------------ */
/* Kot i domek                                                         */
/* ------------------------------------------------------------------ */

export function CatScene({ steps, color }: { steps: number | null; color: string }) {
  const x = steps === null ? 0 : Math.min(steps, CAT.houseX + 60);
  const inWall = steps !== null && steps + CAT.width > CAT.houseX;
  return (
    <svg
      viewBox={`0 0 ${CAT.world} 128`}
      className="block w-full"
      role="img"
      aria-label={
        steps === null
          ? 'Kot stoi na początku ścieżki, a po prawej stronie jest domek. Pod ścieżką linijka z kroków.'
          : `Kot po przesunięciu o ${steps} kroków. Domek stoi po prawej.`
      }
    >
      <line x1="0" y1="100" x2={CAT.world} y2="100" stroke="currentColor" strokeOpacity={0.35} strokeWidth={2} />
      {[0, 50, 100, 150, 200, 250, 300].map((tick) => (
        <g key={tick}>
          <line x1={tick} y1="100" x2={tick} y2={tick % 100 === 0 ? 108 : 105} stroke="currentColor" strokeOpacity={0.45} />
          {tick % 100 === 0 && (
            <text
              x={tick}
              y="121"
              textAnchor={tick === 0 ? 'start' : tick === 300 ? 'end' : 'middle'}
              className="fill-muted-foreground text-[10px]"
            >
              {tick === 0 ? '0 kroków' : tick}
            </text>
          )}
        </g>
      ))}

      {/* Domek — od 240 do 300, dach lekko wystaje. */}
      <g>
        <rect x={CAT.houseX} y="54" width="60" height="46" className="fill-white dark:fill-zinc-900" stroke="#78716c" strokeWidth={2} />
        <polygon points={`${CAT.houseX - 6},54 ${CAT.houseX + 30},26 ${CAT.houseX + 66},54`} fill="#c2410c" fillOpacity={0.85} />
        <rect x={CAT.houseX + 22} y="76" width="16" height="24" fill="#78716c" fillOpacity={0.55} />
      </g>

      <motion.g initial={false} animate={{ x }} transition={{ duration: 0.9, ease: 'easeInOut' }}>
        <Cat
          x={0}
          y={68}
          width={CAT.width}
          height={CAT.width}
          color={inWall ? '#e11d48' : color}
          strokeWidth={2.2}
          className="fill-white dark:fill-zinc-900"
        />
      </motion.g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Napis na plakacie                                                   */
/* ------------------------------------------------------------------ */

export type PosterPlace = 'gora' | 'srodek' | 'dol';

function Poster({ size, place, label }: { size: number; place: PosterPlace; label: string }) {
  const clipId = useId().replace(/:/g, '');
  const anchor = place === 'srodek' ? 'middle' : 'start';
  const x = place === 'srodek' ? POSTER.width / 2 : 8;
  const y = place === 'gora' ? 8 : place === 'srodek' ? POSTER.height / 2 : POSTER.height - 8;
  const baseline = place === 'gora' ? 'hanging' : place === 'srodek' ? 'central' : 'alphabetic';
  return (
    <svg viewBox={`0 0 ${POSTER.width} ${POSTER.height}`} className="block w-full" role="img" aria-label={label}>
      <defs>
        <clipPath id={clipId}>
          <rect width={POSTER.width} height={POSTER.height} rx={4} />
        </clipPath>
      </defs>
      <rect width={POSTER.width} height={POSTER.height} rx={4} fill="#fffdf5" stroke="#a1a1aa" strokeWidth={1.5} />
      <g clipPath={`url(#${clipId})`}>
        <text
          x={x}
          y={y}
          textAnchor={anchor}
          dominantBaseline={baseline}
          fontSize={size}
          fontWeight={800}
          fill="#1e293b"
          style={{ fontFamily: 'ui-monospace, Menlo, Consolas, "DejaVu Sans Mono", monospace' }}
        >
          {POSTER.text}
        </text>
      </g>
    </svg>
  );
}

export function PosterScene({ size, place }: { size: number; place: PosterPlace }) {
  return (
    <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
      {/* Oba plakaty mają stałą szerokość w pikselach (300 i 90 = 0,3 ×), więc litery „z ławki”
          mają dokładnie `rozmiar × 0,3` px — tyle, ile zakłada werdykt. */}
      <div className="w-[300px] max-w-full">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plakat</p>
        <Poster size={size} place={place} label={`Plakat z napisem ${POSTER.text} o wielkości ${size} punktów.`} />
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Z ostatniej ławki</p>
        <div style={{ width: POSTER.width * POSTER.far }}>
          <Poster size={size} place={place} label="Ten sam plakat widziany z daleka." />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Zapis zdjęcia                                                       */
/* ------------------------------------------------------------------ */

const TREE: { id: string; label: string; depth: number; leaf: boolean }[] = [
  { id: 'pulpit', label: 'Pulpit', depth: 0, leaf: true },
  { id: 'pobrane', label: 'Pobrane', depth: 0, leaf: true },
  { id: 'obrazy', label: 'Obrazy', depth: 0, leaf: false },
  { id: 'wakacje', label: 'Wakacje', depth: 1, leaf: true },
];

export function FileScene({ file }: { file: SavedFile | null }) {
  const tooBig = file !== null && file.mb > MAIL_LIMIT_MB;
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Twoje foldery</p>
        <ul className="border bg-muted/30 p-2">
          {TREE.map((row) => {
            const here = file?.folder === row.id;
            const Icon = here ? FolderOpen : Folder;
            return (
              <li key={row.id}>
                <p
                  className={cn('flex items-center gap-2 py-0.5', here && 'font-semibold')}
                  style={{ paddingLeft: `${row.depth * 1.25}rem` }}
                >
                  <Icon className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  {row.label}
                </p>
                {here && file && (
                  <motion.p
                    key={file.name}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 py-0.5 text-xs"
                    style={{ paddingLeft: `${(row.depth + 1) * 1.25}rem` }}
                  >
                    <FileImage className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
                    <span className="break-all">{file.name}</span>
                  </motion.p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mail do babci</p>
        <div className="border bg-white p-2.5 dark:bg-zinc-900">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" aria-hidden /> Zdjęcie z wakacji
          </p>
          {file ? (
            <motion.p
              key={file.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 border px-2 py-1.5 text-xs',
                tooBig ? 'border-rose-500/60 bg-rose-500/10' : 'border-emerald-500/60 bg-emerald-500/10'
              )}
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="break-all font-medium">{file.name}</span>
              <span className="tabular-nums">{formatMb(file.mb)}</span>
              <span className="w-full font-semibold">{tooBig ? `Za duży — limit to ${MAIL_LIMIT_MB} MB` : 'Mieści się'}</span>
            </motion.p>
          ) : (
            <p className="mt-2 border border-dashed px-2 py-1.5 text-xs text-muted-foreground">Brak załącznika</p>
          )}
        </div>
      </div>
    </div>
  );
}
