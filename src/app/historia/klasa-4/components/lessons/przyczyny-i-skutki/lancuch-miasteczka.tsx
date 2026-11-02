'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { cardById, judgeChain, judgeDraw, roles, TOWN_CARDS, type Arrow, type ChainVerdict, type Role } from './miasteczko';

const GUTTER = 64;

const ROLE_LABEL: Record<Role, string> = {
  'tylko-przyczyna': 'przyczyna',
  'skutek-i-przyczyna': 'skutek i przyczyna',
  'tylko-skutek': 'skutek',
};

interface Anchor {
  x: number;
  y: number;
}

/**
 * Blok 3 — **„Łańcuch miasteczka”** (oś czasu).
 *
 * Gest nowy w kursie: **rysuje strzałki przyczyna → skutek** między kartami
 * ułożonymi na pionowej osi lat — przeciągając od kropki na karcie-przyczynie
 * do karty-skutku (albo stuknięcie kropki, potem karty). Strzałka pod prąd
 * czasu odbija się od razu z regułą „skutek nie może zdarzyć się przed
 * przyczyną”; strzałka w przód, której nie potwierdza zdanie karty, jest
 * wskazana przy sprawdzeniu (podkreślony fragment kroniki). Po przyjęciu
 * każda karta dostaje rolę policzoną ze strzałek dziecka — most i jarmark
 * są naraz skutkiem i przyczyną.
 */
export function LancuchMiasteczka({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [live, setLive] = useState<(Anchor & { from: string }) | null>(null);
  const [bounce, setBounce] = useState<{ from: string; to: string; message: string } | null>(null);
  const [verdict, setVerdict] = useState<ChainVerdict | null>(null);
  const [finished, setFinished] = useState(false);
  const [anchors, setAnchors] = useState<Record<string, Anchor>>({});
  const boxRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragging = useRef<{ from: string; sx: number; sy: number; moved: boolean } | null>(null);

  const accepted = verdict?.ok === true;
  const cardRoles = roles(arrows);

  const measure = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const next: Record<string, Anchor> = {};
    for (const c of TOWN_CARDS) {
      const el = cardRefs.current[c.id];
      if (!el) continue;
      next[c.id] = { x: Math.round(el.offsetLeft + el.offsetWidth), y: Math.round(el.offsetTop + el.offsetHeight / 2) };
    }
    setAnchors(next);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, verdict, arrows.length]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(box);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    if (!bounce) return;
    const t = window.setTimeout(() => setBounce((b) => (b === bounce ? null : b)), 4500);
    return () => window.clearTimeout(t);
  }, [bounce]);

  const draw = (from: string, to: string) => {
    if (accepted) return;
    const v = judgeDraw({ from, to }, arrows);
    setSource(null);
    if (!v.ok) {
      if (v.reason === 'pod-prad') setBounce({ from, to, message: v.message });
      else if (v.reason === 'juz-jest') setBounce({ from, to, message: v.message });
      return;
    }
    setBounce(null);
    setVerdict(null);
    setArrows((prev) => [...prev, { from, to }]);
  };

  const remove = (a: Arrow) => {
    if (accepted) return;
    setVerdict(null);
    setArrows((prev) => prev.filter((x) => !(x.from === a.from && x.to === a.to)));
  };

  const toLocal = (clientX: number, clientY: number): Anchor => {
    const r = boxRef.current?.getBoundingClientRect();
    return { x: clientX - (r?.left ?? 0), y: clientY - (r?.top ?? 0) };
  };

  const cardAt = (x: number, y: number): string | null =>
    document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-card]')?.dataset.card ?? null;

  const onPortDown = (id: string) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (accepted) return;
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // stuknięcie dalej działa
    }
    dragging.current = { from: id, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const onPortMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = dragging.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 8) d.moved = true;
    if (d.moved) setLive({ ...toLocal(e.clientX, e.clientY), from: d.from });
  };
  const onPortUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = dragging.current;
    dragging.current = null;
    setLive(null);
    if (!d) return;
    if (!d.moved) {
      // Stuknięcie: wybór przyczyny (albo, gdy już wybrana — strzałka do tej karty).
      if (source && source !== d.from) draw(source, d.from);
      else setSource((s) => (s === d.from ? null : d.from));
      return;
    }
    const target = cardAt(e.clientX, e.clientY);
    if (target) draw(d.from, target);
  };

  const onCardClick = (id: string) => {
    if (!source || accepted) return;
    draw(source, id);
  };

  const highlightHint = (cardId: string) =>
    verdict && !verdict.ok && verdict.unsupported.some((u) => u.arrow.to === cardId);

  return (
    <div className="space-y-5">
      <p className="text-base leading-relaxed">
        Oto kronika pewnego miasteczka nad rzeką <span className="text-muted-foreground">(miasteczko wymyślone do ćwiczenia)</span>.
        Każda karta ma rok i mówi, <em>dlaczego</em> coś się stało. <strong>Narysuj strzałki od przyczyny do skutku</strong>:
        przeciągnij od kropki na karcie-przyczynie do karty-skutku (albo stuknij kropkę, a potem kartę).
      </p>

      <div ref={boxRef} className="relative select-none" style={{ paddingRight: GUTTER }}>
        {/* Oś lat po lewej. */}
        <span className="absolute bottom-4 left-[2.15rem] top-4 w-0.5" style={{ backgroundColor: `${color}55` }} aria-hidden />

        <ol className="space-y-3">
          {TOWN_CARDS.map((c) => {
            const isSource = source === c.id;
            const bounced = bounce && (bounce.from === c.id || bounce.to === c.id);
            const role = accepted ? cardRoles[c.id] : null;
            return (
              <li key={c.id} className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
                <span className="relative z-10 justify-self-start bg-background px-1 font-mono text-sm font-bold tabular-nums" style={{ color }}>
                  {c.year}
                </span>
                <motion.div
                  ref={(el) => {
                    cardRefs.current[c.id] = el;
                  }}
                  data-card={c.id}
                  onClick={() => onCardClick(c.id)}
                  animate={bounced ? { x: [0, -6, 6, -3, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'relative border-2 bg-white p-3 pr-6 text-sm leading-snug dark:bg-zinc-900',
                    source && !isSource && !accepted && 'cursor-pointer border-dashed',
                    bounced ? 'border-destructive' : !isSource && !source && 'border-transparent shadow-sm'
                  )}
                  style={isSource || (source && !bounced) ? { borderColor: color } : undefined}
                >
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">{c.title}</span>
                    {role && (
                      <span
                        className={cn('px-1.5 text-[11px] font-semibold uppercase tracking-wide', role === 'skutek-i-przyczyna' ? 'text-white' : 'bg-muted')}
                        style={role === 'skutek-i-przyczyna' ? { backgroundColor: color } : undefined}
                      >
                        {ROLE_LABEL[role]}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block">
                    <CardText text={c.text} hint={highlightHint(c.id) ? c.causeHint : undefined} />
                  </span>

                  {!accepted && (
                    <button
                      type="button"
                      onPointerDown={onPortDown(c.id)}
                      onPointerMove={onPortMove}
                      onPointerUp={onPortUp}
                      onPointerCancel={() => {
                        dragging.current = null;
                        setLive(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          if (source && source !== c.id) draw(source, c.id);
                          else setSource((s) => (s === c.id ? null : c.id));
                        }
                      }}
                      aria-label={
                        source && source !== c.id
                          ? `Strzałka od karty „${cardById(source)?.title}” do karty „${c.title}”`
                          : `Rysuj strzałkę od karty „${c.title}” (${c.year})`
                      }
                      className="absolute -right-[18px] top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-crosshair touch-none items-center justify-center"
                    >
                      <span
                        className={cn('block h-4 w-4 rounded-full border-2 bg-white dark:bg-zinc-900', isSource && 'scale-125')}
                        style={{ borderColor: color, backgroundColor: isSource ? color : undefined }}
                      />
                    </button>
                  )}
                </motion.div>
              </li>
            );
          })}
        </ol>

        {/* Strzałki. */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <marker id="l4-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={color} />
            </marker>
            <marker id="l4-arrowhead-bad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--destructive)" />
            </marker>
          </defs>
          {arrows.map((a) => {
            const p = anchors[a.from];
            const q = anchors[a.to];
            if (!p || !q) return null;
            const span = Math.abs(TOWN_CARDS.findIndex((c) => c.id === a.to) - TOWN_CARDS.findIndex((c) => c.id === a.from));
            const bulge = 14 + span * 9;
            const bad = verdict && !verdict.ok && verdict.unsupported.some((u) => u.arrow.from === a.from && u.arrow.to === a.to);
            return (
              <path
                key={`${a.from}-${a.to}`}
                d={`M${p.x + 8},${p.y - 4} C${p.x + 8 + bulge},${p.y - 4} ${q.x + 8 + bulge},${q.y + 4} ${q.x + 10},${q.y + 4}`}
                fill="none"
                stroke={bad ? 'var(--destructive)' : color}
                strokeWidth={2.5}
                strokeDasharray={bad ? '5 4' : undefined}
                markerEnd={bad ? 'url(#l4-arrowhead-bad)' : 'url(#l4-arrowhead)'}
              />
            );
          })}
          {live && anchors[live.from] && (
            <line
              x1={anchors[live.from].x}
              y1={anchors[live.from].y}
              x2={live.x}
              y2={live.y}
              stroke={color}
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          )}
        </svg>
      </div>

      {bounce && (
        <p className="border-l-2 border-destructive pl-3 text-sm font-medium leading-relaxed" aria-live="polite">
          {bounce.message}
        </p>
      )}

      {!accepted && arrows.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Narysowane strzałki">
          {arrows.map((a) => (
            <li key={`${a.from}-${a.to}`}>
              <button
                type="button"
                onClick={() => remove(a)}
                className="inline-flex items-center gap-1 border px-2 py-1 text-xs"
                aria-label={`Usuń strzałkę ${cardById(a.from)?.title} → ${cardById(a.to)?.title}`}
              >
                {cardById(a.from)?.title} → {cardById(a.to)?.title} <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!accepted && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={arrows.length === 0}
            onClick={() => setVerdict(judgeChain(arrows))}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: color }}
          >
            Sprawdź łańcuch <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <span className="text-sm text-muted-foreground">
            {arrows.length} {plural(arrows.length, { one: 'strzałka', few: 'strzałki', many: 'strzałek' })}
          </span>
        </div>
      )}

      {verdict && !verdict.ok && (
        <div className="space-y-2 border-l-2 border-destructive pl-4 text-sm leading-relaxed" aria-live="polite">
          {verdict.unsupported.map((u) => (
            <p key={`${u.arrow.from}-${u.arrow.to}`}>
              Strzałka <strong>{cardById(u.arrow.from)?.title} → {u.cardTitle}</strong> nie zgadza się z kroniką: przeczytaj
              podkreślony fragment karty „{u.cardTitle}” — z czego naprawdę się wzięła?
            </p>
          ))}
          {verdict.withoutCause.length > 0 && (
            <p>
              {verdict.withoutCause.length === 1 ? 'Karta' : 'Karty'}{' '}
              <strong>{verdict.withoutCause.map((c) => `„${c.title}”`).join(', ')}</strong>{' '}
              {verdict.withoutCause.length === 1 ? 'nie ma' : 'nie mają'} jeszcze swojej przyczyny. Każda karta poza pierwszą
              mówi, dlaczego się zdarzyła — znajdź to w jej zdaniu.
            </p>
          )}
        </div>
      )}

      {accepted && (
        <div className="space-y-4" aria-live="polite">
          <div className="space-y-2 border-2 p-4 text-base leading-relaxed" style={{ borderColor: color }}>
            <p>
              <strong>Łańcuch się zgadza.</strong> Zobacz role, które same wyszły z twoich strzałek:{' '}
              <strong>most</strong> jest skutkiem powodzi i przyczyną jarmarku, a <strong>jarmark</strong> — skutkiem
              mostu i przyczyną trzech zmian naraz.
            </p>
            <p>
              Gdyby nie wiosenna powódź z 1298 roku, w miasteczku pewnie długo nie byłoby szkoły. Tak właśnie pracuje
              historyk: szuka „dlaczego?” i „co z tego wynikło?” — a <strong>strzałka zawsze płynie z prądem czasu</strong>.
            </p>
          </div>
          {!finished && (
            <button
              type="button"
              onClick={() => {
                setFinished(true);
                onComplete();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              Zakończ łańcuch <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CardText({ text, hint }: { text: string; hint?: string }) {
  if (!hint) return <>{text}</>;
  const i = text.indexOf(hint);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-yellow-200/90 px-0.5 text-inherit underline decoration-2 underline-offset-2 dark:bg-yellow-600/60">
        {hint}
      </mark>
      {text.slice(i + hint.length)}
    </>
  );
}
