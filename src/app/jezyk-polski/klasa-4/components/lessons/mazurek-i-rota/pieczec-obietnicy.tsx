'use client';

import { useEffect, useRef, useState } from 'react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { buildKorpus } from '../../../lib/korpus';
import { ROTA } from './rota';
import { PROMISE_VERSES, ROTA_ROLES, seal } from './pieczec';

/**
 * L9, blok 2 „Pieczęć obietnicy” — **gest nowy dla kursu: przykłada pieczęć
 * do wersu.** Reguła podana z góry: obietnica mówi, co zrobimy — albo czego
 * nie zrobimy i na co nie pozwolimy. Pieczęć na wersie-obietnicy zostaje
 * (lak), czasownik z „my” się podświetla, a pod wersem staje dzisiejsze
 * brzmienie. Na wersie, który opisuje albo prosi, pieczęć się rozmazuje, a
 * wers mówi, co robi zamiast obiecywać. Pieczęć: przeciągnięcie albo
 * stuknięcie pieczęci i wersu.
 */

const KORPUS = buildKorpus(ROTA);
const SEAL_ID = 'pieczec';

interface Props {
  color: string;
  onComplete: () => void;
}

export function PieczecObietnicy({ color, onComplete }: Props) {
  const [sealed, setSealed] = useState<Record<string, boolean>>({});
  const [smudge, setSmudge] = useState<{ verse: string; key: number } | null>(null);
  const [held, setHeld] = useState(false);
  const [msg, setMsg] = useState('Przeciągnij pieczęć na wers, który obiecuje.');
  const keyRef = useRef(0);

  const done = PROMISE_VERSES.every((v) => sealed[v]);
  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const stamp = (verse: string) => {
    setHeld(false);
    const res = seal(verse);
    if (!res) return;
    if (res.ok) {
      if (sealed[verse]) return;
      const next = { ...sealed, [verse]: true };
      setSealed(next);
      const left = PROMISE_VERSES.filter((v) => !next[v]).length;
      setMsg(
        left === 0
          ? 'Trzy obietnice przypieczętowane. Każda zaczyna się od „nie” — i za każdym razem mówi „my”.'
          : `Przypieczętowane. ${left === 1 ? 'Została jeszcze jedna obietnica.' : `Zostały jeszcze ${left} obietnice.`}`
      );
    } else {
      keyRef.current += 1;
      setSmudge({ verse, key: keyRef.current });
      setMsg(res.info.does ?? '');
    }
  };

  useEffect(() => {
    if (!smudge) return;
    const t = window.setTimeout(() => setSmudge(null), 1600);
    return () => window.clearTimeout(t);
  }, [smudge]);

  const drag = useDragToken({
    disabled: done,
    onDrop: (_id, target) => {
      if (target?.startsWith('v:')) stamp(target.slice(2));
    },
    onTap: () => setHeld((h) => !h),
  });

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="border-l-2 pl-3 text-sm leading-relaxed sm:text-base" style={{ borderColor: color }}>
        <strong>Obietnica mówi, co zrobimy</strong> — albo czego nie zrobimy i na co nie pozwolimy.
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_120px]">
        <ol className="space-y-1.5">
          {KORPUS.units.map((u) => {
            const info = ROTA_ROLES[u.id];
            const isSealed = !!sealed[u.id];
            const isSmudged = smudge?.verse === u.id;
            const hot = drag.hover === `v:${u.id}`;
            return (
              <li key={u.id}>
                <div
                  role={held ? 'button' : undefined}
                  tabIndex={held ? 0 : undefined}
                  data-drop={`v:${u.id}`}
                  onClick={held ? () => stamp(u.id) : undefined}
                  className="relative flex min-h-[2.75rem] items-center border px-3 py-1.5 pr-14 text-base transition-colors sm:text-lg"
                  style={{
                    borderColor: hot || held ? color : 'transparent',
                    borderStyle: held && !hot ? 'dashed' : 'solid',
                    backgroundColor: hot ? `color-mix(in srgb, ${color} 8%, transparent)` : undefined,
                    cursor: held ? 'pointer' : undefined,
                  }}
                >
                  <span>
                    {u.tokenIds.map((id, i) => {
                      const t = KORPUS.tokenById[id];
                      const isVerb = isSealed && info?.verb === id;
                      return (
                        <span key={id}>
                          <span
                            style={
                              isVerb
                                ? { backgroundColor: 'color-mix(in srgb, #b91c1c 16%, transparent)', boxShadow: 'inset 0 -2px 0 #b91c1c', fontWeight: 600 }
                                : undefined
                            }
                          >
                            {t.form}
                          </span>
                          {i < u.tokenIds.length - 1 ? t.after : ''}
                        </span>
                      );
                    })}
                  </span>
                  {isSealed && <Wax className="absolute right-2 top-1/2 -translate-y-1/2" />}
                  {isSmudged && (
                    <Wax key={smudge.key} smudged className="absolute right-2 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {isSealed && info?.today && (
                  <p className="px-3 pb-1 text-sm italic text-muted-foreground">= {info.today}</p>
                )}
              </li>
            );
          })}
        </ol>

        <div className="order-first flex flex-row items-center gap-4 sm:order-last sm:flex-col sm:items-center sm:pt-2">
          <button
            type="button"
            {...drag.bind(SEAL_ID)}
            disabled={done}
            aria-pressed={held}
            aria-label="Pieczęć — przeciągnij na wers albo stuknij, a potem stuknij wers"
            className="cursor-grab touch-none disabled:cursor-default disabled:opacity-40"
          >
            <Stamp color={color} held={held} />
          </button>
          <p className="text-xs leading-snug text-muted-foreground sm:text-center">
            {held ? 'Teraz stuknij wers' : 'Przeciągnij pieczęć na wers albo stuknij ją, a potem wers.'}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Maria Konopnicka, „Rota” (1908), zwrotka 1 — za Wolnymi Lekturami. <em>pogrześć</em> — pogrzebać;{' '}
        <em>szczep</em> — ród.
      </p>

      <p className="mt-4 min-h-[3rem] border-t pt-3 text-sm leading-relaxed sm:text-base" aria-live="polite">
        {msg}
      </p>

      <DragGhost drag={drag.drag}>
        <Stamp color={color} held />
      </DragGhost>
    </div>
  );
}

/** Pieczątka z rączką — żeton do przeciągania. */
function Stamp({ color, held }: { color: string; held: boolean }) {
  return (
    <svg width="56" height="64" viewBox="0 0 56 64" aria-hidden className="pointer-events-none block">
      <rect x="20" y="2" width="16" height="26" fill="#7c4a2d" />
      <rect x="16" y="26" width="24" height="8" fill="#5b3420" />
      <circle cx="28" cy="48" r="14" fill="#b91c1c" stroke={held ? color : '#7f1d1d'} strokeWidth={held ? 3 : 2} />
      <path d="M21 48 L28 41 L35 48 L28 55 Z" fill="none" stroke="#fecaca" strokeWidth="1.6" />
    </svg>
  );
}

/** Odcisk w laku; `smudged` — rozmazany i znikający. */
function Wax({ smudged, className }: { smudged?: boolean; className?: string }) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      aria-label={smudged ? 'pieczęć się rozmazała' : 'przypieczętowane'}
      className={className}
      style={
        smudged
          ? { filter: 'blur(2.2px)', opacity: 0.55, transition: 'opacity 1.4s ease-out', animation: 'pol-smudge 1.6s ease-out forwards' }
          : undefined
      }
    >
      <path
        d="M18 2 C24 3 27 5 30 9 C34 13 34 19 32 24 C30 29 25 33 18 34 C12 34 7 31 4 26 C2 21 2 15 5 10 C8 5 12 2 18 2 Z"
        fill={smudged ? '#9ca3af' : '#b91c1c'}
      />
      <circle cx="18" cy="18" r="9" fill="none" stroke={smudged ? '#e5e7eb' : '#fecaca'} strokeWidth="1.4" />
      <path d="M13 18 L18 13 L23 18 L18 23 Z" fill="none" stroke={smudged ? '#e5e7eb' : '#fecaca'} strokeWidth="1.4" />
      {smudged && <style>{'@keyframes pol-smudge{0%{opacity:.8;transform:translateY(-50%) scale(1)}100%{opacity:0;transform:translateY(-50%) scale(1.25) translateX(6px)}}'}</style>}
    </svg>
  );
}
